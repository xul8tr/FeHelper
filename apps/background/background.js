/**
 * FeJson background service
 * @author zhaoxianlie
 */


import MSG_TYPE from '../static/js/common.js';
import Settings from '../options/settings.js';
import Menu from './menu.js';
import Awesome from './awesome.js';
import InjectTools from './inject-tools.js';
import Monkey from './monkey.js';
import Statistics from './statistics.js';


let BgPageInstance = (function () {

    let FeJson = {
        notifyTimeoutId: -1
    };

    // Blacklist pages
    let blacklist = [
        /^https:\/\/chrome\.google\.com/
    ];

    // Global cache for latest client information
    let FH_CLIENT_INFO = {};

    /**
     * Text format notification with icon and title
     * @param {Object} options
     * @config {string} type Notification type, options: html, text
     * @config {string} icon Icon
     * @config {string} title Title
     * @config {string} message Message content
     */
    let notifyText = function (options) {
        let notifyId = 'FeJson-notify-id';

        clearTimeout(FeJson.notifyTimeoutId);
        if (options.closeImmediately) {
            return chrome.notifications.clear(notifyId);
        }

        if (!options.icon) {
            options.icon = "static/img/fe-48.png";
        }
        if (!options.title) {
            options.title = "Friendly Reminder";
        }
        chrome.notifications.create(notifyId, {
            type: 'basic',
            title: options.title,
            iconUrl: chrome.runtime.getURL(options.icon),
            message: options.message
        });

        FeJson.notifyTimeoutId = setTimeout(() => {
            chrome.notifications.clear(notifyId);
        }, parseInt(options.autoClose || 3000, 10));

    };

    // Inject CSS script to page
    let _injectContentCss = function(tabId,toolName,isDevTool){
        if(isDevTool){
            Awesome.getContentScript(toolName, true)
                .then(css => {
                    InjectTools.inject(tabId, { css })
                });
        }else{
            InjectTools.inject(tabId, {files: [`${toolName}/content-script.css`]});
        }
    };


    // Directly inject scripts to current page, no longer using content-script configuration
    let _injectContentScripts = function (tabId) {

        // FH tool script injection
        Awesome.getInstalledTools().then(tools => {

            // Inject JS
            let jsTools = Object.keys(tools)
                        .filter(tool => !tools[tool]._devTool
                                && (tools[tool].contentScriptJs || tools[tool].contentScript));
            let jsCodes = [];
            jsTools.forEach((t, i) => {
                let func = `window['${t.replace(/-/g, '')}ContentScript']`;
                jsCodes.push(`(()=>{let func=${func};func&&func();})()`);
            });
            let jsFiles = jsTools.map(tool => `${tool}/content-script.js`);
            InjectTools.inject(tabId, {files: jsFiles,js: jsCodes.join(';')});
        });

        // Other developer custom tool script injection ====== For FH DevTools
        Awesome.getInstalledTools().then(tools => {
            let list = Object.keys(tools).filter(tool => tools[tool]._devTool);

            // Inject JS scripts
            list.filter(tool => (tools[tool].contentScriptJs || tools[tool].contentScript))
                    .map(tool => Awesome.getContentScript(tool).then(js => {
                        InjectTools.inject(tabId, { js });
                    }));
        });
    };

    /**
     * Open donation popup
     * @param {string} toolName - Tool name
     */
    chrome.gotoDonateModal = function (toolName) {
        chrome.tabs.query({currentWindow: true}, function (tabs) {

            Settings.getOptions((opts) => {
                let isOpened = false;
                let tabId;
                let reg = new RegExp("^chrome.*\\/options\\/index.html\\?donate_from=" + toolName + "$", "i");
                for (let i = 0, len = tabs.length; i < len; i++) {
                    if (reg.test(tabs[i].url)) {
                        isOpened = true;
                        tabId = tabs[i].id;
                        break;
                    }
                }

                if (!isOpened) {
                    let url = `/options/index.html?donate_from=${toolName}`;
                    chrome.tabs.create({ url,active: true });
                } else {
                    chrome.tabs.update(tabId, {highlighted: true}).then(tab => {
                        chrome.tabs.reload(tabId);
                    });
                }
                // Record tool usage
                Statistics.recordToolUsage('donate',{from: toolName});

            });

        });
    };

    /**
     * Dynamically run tool
     * @param configs
     * @config tool Tool name
     * @config withContent Default carried message content
     * @config query Request parameters
     * @config noPage No page mode
     * @constructor
     */
    chrome.DynamicToolRunner = async function (configs) {

        let tool = configs.tool || configs.page;
        let withContent = configs.withContent;
        let activeTab = null;
        let query = configs.query;

        // If in noPage mode, only complete content-script work, just send command directly
        if (configs.noPage) {
            let toolFunc = tool.replace(/-/g, '');
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                let found = tabs.some(tab => {
                    if (/^(http(s)?|file):\/\//.test(tab.url) && blacklist.every(reg => !reg.test(tab.url))) {
                        let codes = `window['${toolFunc}NoPage'] && window['${toolFunc}NoPage'](${JSON.stringify(tab)});`;
                        InjectTools.inject(tab.id, {js: codes});
                        return true;
                    }
                    return false;
                });
                if (!found) {
                    notifyText({
                        message: 'Sorry, this tool cannot be used on the current page!'
                    });
                }
            });
            return;
        }

        chrome.tabs.query({currentWindow: true}, function (tabs) {

            activeTab = tabs.filter(tab => tab.active)[0];

            // If it's QR code tool and no message content is passed, use current page URL
            if (tool === 'qr-code' && !withContent && activeTab) {
                withContent = activeTab.url;
            }

            Settings.getOptions((opts) => {
                let isOpened = false;
                let tabId;

                // Allow opening in new window
                if (String(opts['FORBID_OPEN_IN_NEW_TAB']) === 'true') {
                    let reg = new RegExp("^chrome.*\\/" + tool + "\\/index.html" + (query ? "\\?" + query : '') + "$", "i");
                    for (let i = 0, len = tabs.length; i < len; i++) {
                        if (reg.test(tabs[i].url)) {
                            isOpened = true;
                            tabId = tabs[i].id;
                            break;
                        }
                    }
                }

                if (!isOpened) {
                    let url = `/${tool}/index.html` + (query ? "?" + query : '');
                    chrome.tabs.create({
                        url,
                        active: true
                    }).then(tab => { FeJson[tab.id] = { content: withContent }; });
                } else {
                    chrome.tabs.update(tabId, {highlighted: true}).then(tab => {
                        FeJson[tab.id] = { content: withContent };
                        chrome.tabs.reload(tabId);
                    });
                }

            });

        });
    };

    /**
     * Dynamically display tooltip at icon
     * @param tips
     * @private
     */
    let _animateTips = (tips) => {
        setTimeout(() => {
            chrome.action.setBadgeText({text: tips});
            setTimeout(() => {
                chrome.action.setBadgeText({text: ''});
            }, 2000);
        }, 3000);
    };

    /**
     * Default action after clicking plugin icon
     * @param request
     * @param sender
     * @param callback
     */
    let browserActionClickedHandler = function (request, sender, callback) {
        // Get currently installed single tool and open it directly
        Awesome.getInstalledTools().then(tools => {
            const installedTools = Object.keys(tools).filter(tool => tools[tool].installed);
            if (installedTools.length === 1) {
                const singleTool = installedTools[0];
                chrome.DynamicToolRunner({
                    tool: singleTool,
                    noPage: !!tools[singleTool].noPage
                });
                
                // Record tool usage
                Statistics.recordToolUsage(singleTool);
            } else {
                // Fallback: if detection fails, open JSON formatter tool
                chrome.DynamicToolRunner({
                    tool: MSG_TYPE.JSON_FORMAT
                });
                
                // Record tool usage
                Statistics.recordToolUsage(MSG_TYPE.JSON_FORMAT);
            }
        }).catch(error => {
            console.error('Failed to get tool list, using default tool:', error);
            // Fallback when error occurs
            chrome.DynamicToolRunner({
                tool: MSG_TYPE.JSON_FORMAT
            });
            
            // Record tool usage
            Statistics.recordToolUsage(MSG_TYPE.JSON_FORMAT);
        });
    };

    /**
     * Update browser action click behavior
     * @param action install / upgrade / offload
     * @param showTips Whether to notify
     * @param menuOnly Only manage menu
     * @private
     */
    let _updateBrowserAction = function (action, showTips, menuOnly) {
        if (!menuOnly) {
            // For uninstall operation, add a small delay to ensure storage operation completes
            const delay = action === 'offload' ? 100 : 0;
            
            setTimeout(() => {
                // If tools are installed, show popup mode
                Awesome.getInstalledTools().then(tools => {
                // Calculate number of installed tools
                const installedTools = Object.keys(tools).filter(tool => tools[tool].installed);
                const installedCount = installedTools.length;
                
                if (installedCount > 1) {
                    // Multiple tools: show popup
                    chrome.action.setPopup({ popup: '/popup/index.html' });
                    // Remove click listener (if exists)
                    if (chrome.action.onClicked.hasListener(browserActionClickedHandler)) {
                        chrome.action.onClicked.removeListener(browserActionClickedHandler);
                    }
                } else if (installedCount === 1) {
                    // Only one tool: open tool directly, don't show popup
                    chrome.action.setPopup({ popup: '' });
                    
                    // Add click listener
                    if (!chrome.action.onClicked.hasListener(browserActionClickedHandler)) {
                        chrome.action.onClicked.addListener(browserActionClickedHandler);
                    }
                } else {
                    // No tools installed: show popup (let user install tools)
                    chrome.action.setPopup({ popup: '/popup/index.html' });
                    // Remove click listener (if exists)
                    if (chrome.action.onClicked.hasListener(browserActionClickedHandler)) {
                        chrome.action.onClicked.removeListener(browserActionClickedHandler);
                    }
                }
                });
            }, delay);

            if (action === 'offload') {
                _animateTips('-1');
            } else if(!!action) {
                _animateTips('+1');
            }
        } else {
            // Redraw menu
            Menu.rebuild();
        }

        if (showTips) {
            let actionTxt = '';
            switch (action) {
                case 'install':
                    actionTxt = 'Tool has been successfully installed and added to the dropdown list. Click FeHelper icon to use it!';
                    break;
                case 'offload':
                    actionTxt = 'Tool has been successfully uninstalled and removed from the dropdown list!';
                    break;
                case 'menu-install':
                    actionTxt = 'This tool shortcut has been added to the context menu!';
                    break;
                case 'menu-offload':
                    actionTxt = 'This tool shortcut has been removed from the context menu!';
                    break;
                default:
                    actionTxt = 'Congratulations, operation successful!';
            }
            notifyText({
                message: actionTxt,
                autoClose: 2500
            });
        }
    };


    // Capture current page visible area
    let _captureVisibleTab = function (callback) {
        chrome.tabs.captureVisibleTab(null, {format: 'png', quality: 100}, uri => {
            callback && callback(uri);
        });
    };

    let _addScreenShotByPages = function(params,callback){
        chrome.tabs.captureVisibleTab(null, {format: 'png', quality: 100}, uri => {
            callback({ params, uri });
        });
    };

    let _showScreenShotResult = function(data){
        // Ensure screenshot data is complete and valid
        if (!data || !data.screenshots || !data.screenshots.length) {
            return;
        }
        
        chrome.DynamicToolRunner({
            tool: 'screenshot',
            withContent: data
        });
    };

    let _colorPickerCapture = function(params) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (dataUrl) {
                let js = `window.colorpickerNoPage(${JSON.stringify({
                    setPickerImage: true,
                    pickerImage: dataUrl
                })})`;
                InjectTools.inject(tabs[0].id, { js });
            });
        });
    };

    let _codeBeautify = function(params){
        Awesome.StorageMgr.get('JS_CSS_PAGE_BEAUTIFY').then(val => {
            if(val !== '0') {
                let js = `window._codebutifydetect_('${params.fileType}')`;
                InjectTools.inject(params.tabId, { js });
                // Record tool usage
                Statistics.recordToolUsage('code-beautify');
            }
        });
    };

    /**
     * Receive messages from content_scripts
     */
    let _addExtensionListener = function () {

        _updateBrowserAction();

        chrome.runtime.onMessage.addListener(function (request, sender, callback) {
            // If an error occurred, do nothing
            if (chrome.runtime.lastError) {
                return true;
            }

            // Dynamically install or uninstall tool, need to update browserAction
            if (request.type === MSG_TYPE.DYNAMIC_TOOL_INSTALL_OR_OFFLOAD) {
                _updateBrowserAction(request.action, request.showTips, request.menuOnly);
                callback && callback();
            }
            // Screenshot
            else if (request.type === MSG_TYPE.CAPTURE_VISIBLE_PAGE) {
                _captureVisibleTab(callback);
                // Record tool usage
                Statistics.recordToolUsage('screenshot');
            }
            // Directly handle screenshot request from content-script.js
            else if (request.type === 'fh-screenshot-capture-visible') {
                _captureVisibleTab(callback);
                // Record tool usage
                Statistics.recordToolUsage('screenshot');
            }
            // Open dynamic tool page
            else if (request.type === MSG_TYPE.OPEN_DYNAMIC_TOOL) {
                chrome.DynamicToolRunner(request);
                // Record tool usage
                if (request.page) {
                    Statistics.recordToolUsage(request.page);
                }
                callback && callback();
            }
            // Open other page
            else if (request.type === MSG_TYPE.OPEN_PAGE) {
                chrome.DynamicToolRunner({
                    tool: request.page
                });
                // Record tool usage
                if (request.page) {
                    Statistics.recordToolUsage(request.page);
                }
                callback && callback();
            }
            // Any event can be completed through this hook
            else if (request.type === MSG_TYPE.DYNAMIC_ANY_THING) {
                switch(request.thing){
                    // Plugin options saved successfully notification
                    case 'save-options':
                        notifyText({
                            message: 'Configuration changes have taken effect, please continue to use!',
                            autoClose: 2000
                        });
                        break;
                    // Trigger webpage screenshot function
                    case 'trigger-screenshot':
                        handleTriggerScreenshot(request.tabId);
                        break;
                    // Get JSON formatter tool configuration options
                    case 'request-jsonformat-options':
                        requestJsonformatOptions(request.params, callback);
                        return true; // This return true is very important!!! Otherwise callback won't get results
                    // Save JSON formatter tool configuration options
                    case 'save-jsonformat-options':
                        saveJsonformatOptions(request.params, callback);
                        return true;
                    // Toggle JSON formatter toolbar display state
                    case 'toggle-jsonformat-options':
                        toggleJsonformatOptions(callback);
                        return true; // This return true is very important!!! Otherwise callback won't get results
                    // Code beautify function
                    case 'code-beautify':
                        _codeBeautify(request.params);
                        break;
                    // Close code beautify function
                    case 'close-beautify':
                        handleCloseBeautify();
                        break;
                    // QR code decode function
                    case 'qr-decode':
                        handleQrDecode(request.params.uri);
                        break;
                    // Request page message content data
                    case 'request-page-content':
                        handleRequestPageContent(request);
                        break;
                    // Set page performance timing data
                    case 'set-page-timing-data':
                        handleSetPageTimingData(request.wpoInfo);
                        break;
                    // Color picker screenshot function
                    case 'color-picker-capture':
                        _colorPickerCapture(request.params);
                        // Record tool usage
                        Statistics.recordToolUsage('color-picker');
                        break;
                    // Paginated screenshot function
                    case 'add-screen-shot-by-pages':
                        _addScreenShotByPages(request.params,callback);
                        // Record tool usage
                        Statistics.recordToolUsage('screenshot');
                        return true;
                    // Page screenshot completion handling
                    case 'page-screenshot-done':
                        _showScreenShotResult(request.params);
                        break;
                    // Start page script injection (monkey function)
                    case 'request-monkey-start':
                        Monkey.start(request.params);
                        break;
                    // Inject message content script CSS style
                    case 'inject-content-css':
                        _injectContentCss(sender.tab.id,request.tool,!!request.devTool);
                        break;
                    // Open plugin options page
                    case 'open-options-page':
                        chrome.runtime.openOptionsPage();
                        break;
                    // Open donation popup
                    case 'open-donate-modal':
                        chrome.gotoDonateModal(request.params.toolName);
                        break;
                    // Load local script file
                    case 'load-local-script':
                        loadLocalScript(request.script, callback);
                        return true; // Async response needs to return true
                    // Tool usage statistics tracking
                    case 'statistics-tool-usage':
                        // Tracking: auto-trigger json-format-auto
                        Statistics.recordToolUsage(request.params.tool_name,request.params);
                        break;
                    // Get hot fix script
                    case 'fetch-hotfix-json':
                        fetchHotfixJson(callback);
                        return true; // Async response must return true
                    // Get plugin patch data
                    case 'fetch-fehelper-patchs':
                        fetchFehelperPatchs(callback);
                        return true;
                    // Get patch for specified tool
                    case 'fh-get-tool-patch':
                        getToolPatch(request.toolName, callback);
                        return true;
                }
                callback && callback(request.params);
            } else {
                callback && callback();
            }

            return true;
        });


        // For each window opened, inject a js to message content script, bind tabId
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (String(changeInfo.status).toLowerCase() === "complete") {
                if(/^(http(s)?|file):\/\//.test(tab.url) && blacklist.every(reg => !reg.test(tab.url))){
                    InjectTools.inject(tabId, { js: `window.__FH_TAB_ID__=${tabId};` });
                    _injectContentScripts(tabId);
                }
            }
        });

        // Install and update
        chrome.runtime.onInstalled.addListener(({reason, previousVersion}) => {
            switch (reason) {
                case 'install':
                    chrome.runtime.openOptionsPage();
                    // Record new installation
                    Statistics.recordInstallation();
                    break;
                case 'update':
                    _animateTips('+++1');
                    // Record update installation
                    Statistics.recordUpdate(previousVersion);
                    if (previousVersion === '2019.12.2415') {
                        notifyText({
                            message: 'After going through countless difficulties, FeHelper has been upgraded to the latest version. You can go to the plugin settings page to install old version features!',
                            autoClose: 5000
                        });
                    }

                    // Starting from V2020.02.1413, most local data storage has been migrated to chrome.storage.local
                    // Need to force data migration for old version upgrades
                    let getAbsNum = num => parseInt(num.split(/\./).map(n => n.padStart(4, '0')).join(''), 10);
                    // let preVN = getAbsNum(previousVersion);
                    // let minVN = getAbsNum('2020.02.1413');
                    // if (preVN < minVN) {
                    //     Awesome.makeStorageUnlimited();
                    //     setTimeout(() => chrome.runtime.reload(), 1000 * 5);
                    // }
                    break;
            }
        });
        
        // Uninstall
        chrome.runtime.setUninstallURL(chrome.runtime.getManifest().homepage_url);
    };

    /**
     * Check for plugin updates
     * @private
     */
    let _checkUpdate = function () {
        setTimeout(() => {
            // Check if Firefox browser, Firefox does not support requestUpdateCheck API
            if (chrome.runtime.requestUpdateCheck && navigator.userAgent.indexOf("Firefox") === -1) {
                chrome.runtime.requestUpdateCheck((status) => {
                    if (status === "update_available") {
                        chrome.runtime.reload();
                    }
                });
            }
        }, 1000 * 30);
    };

    /**
     * Initialize
     */
    let _init = function () {
        console.log(`[FeHelper] Background initialization started - ${new Date().toLocaleString()}`);
        console.log(`[FeHelper] Extension version: ${chrome.runtime.getManifest().version}`);
        console.log(`[FeHelper] Service Worker startup reason: ${chrome.runtime.getContexts ? 'Context API available' : 'Legacy mode'}`);
        
        _checkUpdate();
        _addExtensionListener();
        
        // Initialize statistics function
        Statistics.init();
        
        Menu.rebuild();
        
        // Periodically clean up redundant garbage
        setTimeout(() => {
            Awesome.gcLocalFiles();
        }, 1000 * 10);
        
        console.log(`[FeHelper] Background initialization completed - ${new Date().toLocaleString()}`);
    };

    /**
     * Trigger screenshot tool execution
     * @param {number} tabId - Tab ID
     */
    function _triggerScreenshotTool(tabId) {
        // First try to send message directly to content script
        chrome.tabs.sendMessage(tabId, {
            type: 'fh-screenshot-start'
        }).then(() => {
            // Successfully triggered
        }).catch(() => {
            // If message sending fails, use noPage mode
            chrome.DynamicToolRunner({
                tool: 'screenshot',
                noPage: true
            });
        });
    }

    // Listen for client information passed from options page
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request && request.type === 'clientInfo' && request.data) {
            FH_CLIENT_INFO = request.data;
        }
    });

    // Handle screenshot request triggered from popup
    function handleTriggerScreenshot(tabId) {
        if (tabId) {
            _triggerScreenshotTool(tabId);
        } else {
            chrome.DynamicToolRunner({
                tool: 'screenshot',
                noPage: true
            });
        }
        // Record tool usage
        Statistics.recordToolUsage('screenshot');
    }

    // Request JSON formatter option configuration
    function requestJsonformatOptions(params, callback) {
        Awesome.StorageMgr.get(params).then(result => {
            Object.keys(result).forEach(key => {
                if (['MAX_JSON_KEYS_NUMBER', 'JSON_FORMAT_THEME'].includes(key)) {
                    result[key] = parseInt(result[key]);
                } else {
                    result[key] = (""+result[key] !== 'false');
                }
            });
            callback && callback(result);
        });
    }

    // Save JSON formatter option configuration
    function saveJsonformatOptions(params, callback) {
        Awesome.StorageMgr.set(params).then(() => {
            callback && callback();
        });
        // Record tool usage
        Statistics.recordToolUsage('save-jsonformat-options');
    }

    // Toggle JSON formatter option display state
    function toggleJsonformatOptions(callback) {
        Awesome.StorageMgr.get('JSON_TOOL_BAR_ALWAYS_SHOW').then(result => {
            let show = result !== false;
            Awesome.StorageMgr.set('JSON_TOOL_BAR_ALWAYS_SHOW',!show).then(() => {
                callback && callback(!show);
            });
        });
        // Record tool usage
        Statistics.recordToolUsage('json-format');
    }

    // Close code beautify function
    function handleCloseBeautify() {
        Awesome.StorageMgr.set('JS_CSS_PAGE_BEAUTIFY',0);
        // Record tool usage
        Statistics.recordToolUsage('code-beautify-close');
    }

    // Handle QR code decode
    function handleQrDecode(uri) {
        chrome.DynamicToolRunner({
            withContent: uri,
            tool: 'qr-code',
            query: `mode=decode`
        });
        // Record tool usage
        Statistics.recordToolUsage('qr-code');
    }

    // Handle page message content request
    function handleRequestPageContent(request) {
        request.params = FeJson[request.tabId];
        delete FeJson[request.tabId];
    }

    // Handle page performance data settings
    function handleSetPageTimingData(wpoInfo) {
        chrome.DynamicToolRunner({
            tool: 'page-timing',
            withContent: wpoInfo
        });
        // Record tool usage
        Statistics.recordToolUsage('page-timing');
    }

    // Get patch for specified tool (css/js)
    function getToolPatch(toolName, callback) {
        // If toolName not provided, return empty patch directly
        if (!toolName) {
            callback && callback({ css: '', js: '' });
            return;
        }

        let version = String(chrome.runtime.getManifest().version).split('.').map(n => parseInt(n)).join('.');
        const storageKey = `FH_PATCH_HOTFIX_${version}`;
        chrome.storage.local.get(storageKey, result => {
            const patchs = result[storageKey];
            if (patchs && patchs[toolName]) {
                const { css, js } = patchs[toolName];
                callback && callback({ css, js });
            } else {
                callback && callback({ css: '', js: '' });
            }
        });
    }

    // Load local script, handle request to load JSON formatter related scripts
    function loadLocalScript(scriptUrl, callback) {
        fetch(scriptUrl)
            .then(response => response.text())
            .then(scriptContent => {
                callback && callback(scriptContent);
            })
            .catch(error => {
                console.error('Failed to load script:', error);
                callback && callback(null);
            });
    }

    // Get hot fix script, proxy request hotfix.json to solve CORS issue
    function fetchHotfixJson(callback) {
        fetch('https://fehelper.com/static/js/hotfix.json?v=' + Date.now())
            .then(response => response.text())
            .then(scriptContent => {
                callback && callback({ success: true, content: scriptContent });
            })
            .catch(error => {
                callback && callback({ success: false, error: error.message });
            });
    }

    // Check and get patch (with frequency control)
    function checkAndFetchPatchs() {
        const PATCH_CHECK_INTERVAL = 5 * 60 * 1000; // 5min
        const STORAGE_KEY = 'FH_LAST_PATCH_CHECK';
        
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            const lastCheck = result[STORAGE_KEY] || 0;
            const now = Date.now();
            
            if (now - lastCheck > PATCH_CHECK_INTERVAL) {
                console.log(`[FeHelper] More than 5 minutes since last check, starting hot update check...`);
                
                fetchFehelperPatchs((result) => {
                    if (result && result.success) {
                        console.log(`[FeHelper] Automatic hot update successful, version: v${result.version}`);
                    } else if (result && result.notFound) {
                        console.log(`[FeHelper] No hot update patch available for current version`);
                    } else {
                        console.log(`[FeHelper] Automatic hot update check failed:`, result?.error);
                    }
                    
                    // Update last check time
                    chrome.storage.local.set({ [STORAGE_KEY]: now });
                });
            } else {
                const nextCheck = new Date(lastCheck + PATCH_CHECK_INTERVAL);
                console.log(`[FeHelper] Less than 5 minutes since last check, next check time: ${nextCheck.toLocaleString()}`);
            }
        });
    }

    // Get FeHelper hot fix patch
    function fetchFehelperPatchs(callback) {
        let version = String(chrome.runtime.getManifest().version).split('.').map(n => parseInt(n)).join('.');
        let patchUrl = `https://fehelper.com/v1/fh-patchs/v${version}.json`;
        
        // First detect if file exists (using HEAD request)
        fetch(patchUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // File exists, proceed with normal fetch operation
                    return fetch(`${patchUrl}?t=${Date.now()}`)
                        .then(resp => {
                            if (!resp.ok) {
                                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                            }
                            return resp.json();
                        })
                        .then(data => {
                            const patchs = data.patchs || data;
                            const storageData = {};
                            storageData[`FH_PATCH_HOTFIX_${version}`] = patchs;
                            chrome.storage.local.set(storageData, () => {
                                console.log(`[FeHelper] Successfully retrieved version v${version} hot fix patch`);
                                callback && callback({ success: true, version });
                            });
                        });
                } else {
                    // File does not exist
                    console.log(`[FeHelper] Version does not exist on server v${version} patch file`);
                    callback && callback({ success: false, error: 'Patch file does not exist', notFound: true });
                }
            })
            .catch(e => {
                callback && callback({ success: false, error: 'No patches need to be fixed' });
            });
    }

    return {
        pageCapture: _captureVisibleTab,
        init: _init
    };
})();

BgPageInstance.init();