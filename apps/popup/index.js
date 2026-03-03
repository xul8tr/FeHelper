/**
 * FeHelper Popup Menu
 */

import Awesome from '../background/awesome.js'
import MSG_TYPE from '../static/js/common.js';

function triggerScreenshot() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (!tabs || !tabs.length || !tabs[0].id) return;
        
        const tabId = tabs[0].id;
        
        // Try to send message directly to content script first
        chrome.tabs.sendMessage(tabId, {
            type: 'fh-screenshot-start'
        }).then(response => {
            console.log('Screenshot tool triggered successfully');
            window.close();
        }).catch(error => {
            console.log('Unable to trigger screenshot tool directly, trying noPage mode', error);
            // If sending message fails, use noPage mode
            chrome.runtime.sendMessage({
                type: 'fh-dynamic-any-thing',
                thing: 'trigger-screenshot',
                tabId: tabId
            });
            window.close();
        });
    });
}

new Vue({
    el: '#pageContainer',
    data: {
        manifest: {},
        fhTools: {},
        isLoading: true
    },

    computed: {
        // Calculate number of installed tools
        installedToolsCount() {
            return Object.values(this.fhTools).filter(tool => tool.installed).length;
        }
    },

    created: function () {
        // Get current extension version
        this.manifest = chrome.runtime.getManifest();
        
        // Start loading tools list immediately without blocking page rendering
        this.loadTools();

        // Automatically load and inject hotfix patch for popup page
        this.loadPatchHotfix();
    },

    mounted: function () {
        // Execute non-critical operations after page DOM is rendered
        this.$nextTick(() => {
            // Delay non-critical operations to avoid blocking UI rendering
            setTimeout(() => {
                // Auto dark mode
                if (typeof DarkModeMgr !== 'undefined') {
                    DarkModeMgr.turnLightAuto();
                }

                // Record usage (non-critical operation)
                this.recordUsage();

                // Auto collect after page load (non-critical operation)
                if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
                    Awesome.collectAndSendClientInfo();
                }
            }, 50); // Delay 50ms to let UI render first
        });

        // Support arrow keys for navigation in popup window
        this.setupKeyboardNavigation();
        
        // Find screenshot button and bind event
        this.setupScreenshotButton();
    },

    methods: {

        loadPatchHotfix() {
            // Automatically load and inject hotfix patch for popup page
            chrome.runtime.sendMessage({
                type: 'fh-dynamic-any-thing',
                thing: 'fh-get-tool-patch',
                toolName: 'popup'
            }, patch => {
                if (patch) {
                    if (patch.css) {
                        const style = document.createElement('style');
                        style.textContent = patch.css;
                        document.head.appendChild(style);
                    }
                    if (patch.js) {
                        try {
                            if (window.evalCore && window.evalCore.getEvalInstance) {
                                window.evalCore.getEvalInstance(window)(patch.js);
                            }
                        } catch (e) {
                            console.error('Failed to execute popup patch JS', e);
                        }
                    }
                }
            });
        },

        getLayoutClasses() {
            const installedCount = this.installedToolsCount;
            const classes = [];
            
            if (installedCount <= 1) {
                classes.push('very-few-tools');
            } else if (installedCount <= 3) {
                classes.push('few-tools');
            }
            
            return classes;
        },

        async loadTools() {
            try {
                const tools = await Awesome.getInstalledTools();
                
                // Get user's custom tool order
                const customOrder = await chrome.storage.local.get('tool_custom_order');
                const savedOrder = customOrder.tool_custom_order ? JSON.parse(customOrder.tool_custom_order) : null;
                
                // If custom order exists, rearrange tools
                if (savedOrder && Array.isArray(savedOrder)) {
                    const orderedTools = {};
                    const unorderedTools = { ...tools };
                    
                    // Add tools in saved order
                    savedOrder.forEach(toolKey => {
                        if (unorderedTools[toolKey]) {
                            orderedTools[toolKey] = unorderedTools[toolKey];
                            delete unorderedTools[toolKey];
                        }
                    });
                    
                    // Add newly installed tools (not in saved order)
                    Object.assign(orderedTools, unorderedTools);
                    
                    this.fhTools = orderedTools;
                } else {
                    this.fhTools = tools;
                }
                
                this.isLoading = false;
                
                // Add corresponding CSS classes based on number of tools to optimize display
                this.$nextTick(() => {
                    this.updateLayoutClasses();
                });
            } catch (error) {
                console.error('Failed to load tools list:', error);
                this.isLoading = false;
                // Even if loading fails, popup should not be completely unusable
                this.fhTools = {};
                
                // Update layout classes even when loading fails
                this.$nextTick(() => {
                    this.updateLayoutClasses();
                });
            }
        },

        recordUsage() {
            try {
                // Analytics: automatically trigger popup statistics
                chrome.runtime.sendMessage({
                    type: 'fh-dynamic-any-thing',
                    thing: 'statistics-tool-usage',
                    params: {
                        tool_name: 'popup'
                    }
                });
            } catch (error) {
                // Ignore statistics errors, don't affect main functionality
                console.warn('Failed to record statistics:', error);
            }
        },

        setupKeyboardNavigation() {
            document.body.addEventListener('keydown', e => {
                let keyCode = e.keyCode || e.which;
                if (![38, 40, 13].includes(keyCode)) {
                    return false;
                }
                let ul = document.querySelector('#pageContainer ul');
                if (!ul) return false;
                
                let hovered = ul.querySelector('li.x-hovered');
                let next, prev;
                if (hovered) {
                    hovered.classList.remove('x-hovered');
                    next = hovered.nextElementSibling;
                    prev = hovered.previousElementSibling;
                }
                if (!next) {
                    next = ul.querySelector('li:first-child');
                }
                if (!prev) {
                    prev = ul.querySelector('li:last-child');
                }

                switch (keyCode) {
                    case 38: // Arrow key: ↑
                        if (prev) prev.classList.add('x-hovered');
                        break;
                    case 40: // Arrow key: ↓
                        if (next) next.classList.add('x-hovered');
                        break;
                    case 13: // Enter key: select
                        if (hovered) hovered.click();
                }
            }, false);
        },

        setupScreenshotButton() {
            // Find screenshot button and bind event
            const screenshotButtons = Array.from(document.querySelectorAll('a[data-tool="screenshot"], button[data-tool="screenshot"]'));
            
            screenshotButtons.forEach(button => {
                // Remove original click event
                button.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerScreenshot();
                    return false;
                };
            });
        },

        runHelper: async function (toolName) {
            if (!toolName || !this.fhTools[toolName]) return;
            
            let request = {
                type: MSG_TYPE.OPEN_DYNAMIC_TOOL,
                page: toolName,
                noPage: !!this.fhTools[toolName].noPage
            };
            if(this.fhTools[toolName]._devTool) {
                request.page = 'dynamic';
                request.query = `tool=${toolName}`;
            }
            chrome.runtime.sendMessage(request);
            !!this.fhTools[toolName].noPage && setTimeout(window.close, 200);
        },

        openOptionsPage: () => {
            chrome.runtime.openOptionsPage();
        },

        openUrl: function (event) {
            event.preventDefault();
            // Get background page, returns window object
            chrome.tabs.create({url: event.currentTarget.href});
            return false;
        },

        updateLayoutClasses() {
            const container = document.getElementById('pageContainer');
            if (!container) return;
            
            const installedCount = this.installedToolsCount;
            
            // Remove all layout-related classes
            container.classList.remove('few-tools', 'very-few-tools');
            
            // Add corresponding classes based on number of tools
            if (installedCount <= 1) {
                container.classList.add('very-few-tools');
                console.log('Popup layout: Apply very-few-tools class (tool count:', installedCount, ')');
            } else if (installedCount <= 3) {
                container.classList.add('few-tools');
                console.log('Popup layout: Apply few-tools class (tool count:', installedCount, ')');
            } else {
                console.log('Popup layout: Use default layout (tool count:', installedCount, ')');
            }
        }
    }
});


