import Awesome from '../background/awesome.js'
import MSG_TYPE from '../static/js/common.js';
import Settings from './settings.js';
import Statistics from '../background/statistics.js';

// Tool category definitions
const TOOL_CATEGORIES = [
    { key: 'dev', name: 'Development Tools', tools: ['json-format', 'json-diff', 'code-beautify', 'code-compress', 'postman', 'websocket', 'regexp','page-timing'] },
    { key: 'encode', name: 'Encoding & Conversion', tools: ['en-decode', 'trans-radix', 'timestamp', 'trans-color'] },
    { key: 'image', name: 'Image Processing', tools: ['qr-code', 'image-base64', 'svg-converter', 'chart-maker', 'poster-maker' ,'screenshot', 'color-picker'] },
    { key: 'productivity', name: 'Productivity Tools', tools: ['aiagent', 'sticky-notes', 'html2markdown', 'page-monkey'] },
    { key: 'calculator', name: 'Calculator Tools', tools: ['crontab', 'loan-rate', 'password'] },
    { key: 'other', name: 'Other Tools', tools: [] }
];

// Vue instance
new Vue({
    el: '#marketContainer',
    data: {
        manifest: { version: '0.0.0' },
        searchKey: '',
        currentCategory: '',
        sortType: 'default',
        viewMode: 'list', // Default list view
        categories: TOOL_CATEGORIES,
        favorites: new Set(),
        recentUsed: [],
        loading: true,
        originalTools: {}, // Save original tool data
        currentView: 'all', // Current view type (all/installed/favorites/recent)
        activeTools: {}, // Currently displayed tool list
        installedCount: 0, // Number of installed tools
        
        // Version related
        latestVersion: '', // Latest version number
        needUpdate: false, // Whether update is needed
        
        // Settings related
        showSettingsModal: false,
        defaultKey: 'Alt+Shift+J', // Default shortcut
        countDown: 0, // Dark mode countdown
        selectedOpts: [], // Selected options (FORBID_STATISTICS now supported)
        menuDownloadCrx: false, // Menu - Extension download
        menuFeHelperSeting: false, // Menu - FeHelper settings
        isFirefox: false, // Whether Firefox browser

        // Donation related
        showDonateModal: false,
        donate: {
            text: 'Thank you for your recognition and support of FeHelper!',
            image: './donate.jpeg'
        },

        // Confirmation dialog
        confirmDialog: {
            show: false,
            title: 'Confirm Action',
            message: '',
            callback: null,
            data: null
        },

        // Tool sorting related
        sortableTools: [], // Sortable tool list
        draggedIndex: -1, // Dragged tool index

        recentCount: 0,
        versionChecked: false,
        
        // Recommendation card configuration, can be fetched from server later
        recommendationCards: [
            {
                toolKey: 'qr-code',
                icon: '📱',
                title: 'QR Code Tool',
                desc: 'Quickly generate and recognize QR codes with custom styles',
                tag: 'Must Have',
                tagClass: 'must-tag',
                isAd: false
            },
            {
                toolKey: 'chart-maker',
                icon: '📊',
                title: 'Chart Maker',
                desc: 'Support multiple data visualization charts, quickly generate professional charts',
                tag: 'New',
                tagClass: 'new-tag',
                isAd: false
            },
            {
                toolKey: 'mock-data',
                icon: '🎲',
                title: 'Mock Data Tool',
                desc: 'Quickly generate various test data, support quick template generation',
                tag: 'Recommended',
                tagClass: 'recommend-tag',
                isAd: false
            },
            {
                icon: '🔔',
                title: 'Ad Placement',
                desc: 'Ad space for rent, traffic owners welcome to contact, open for cooperation via GitHub',
                tag: 'Ad',
                tagClass: 'ad-tag',
                isAd: true,
                url: 'https://github.com/zxlie/FeHelper'
            }
        ],
    },

    async created() {
        // 1. Read query parameters from URL and assign to searchKey
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('query');
            if (query) {
                this.searchKey = query;
            }
        } catch (e) {
            // Ignore exceptions
        }
        // 2. Initialize data
        await this.initData();
        this.recentCount = (await Statistics.getRecentUsedTools(10)).length;
        // Update installed tools count after initialization
        this.updateInstalledCount();
        // Restore user's view mode settings
        this.loadViewMode();
        // Load settings
        this.loadSettings();
        // Check browser type
        this.checkBrowserType();
        // Check version update
        this.checkVersionUpdate();
        
        // Load remote recommendation card configuration
        this.loadRemoteRecommendationCards();
        
        // Check if URL has donate_from parameter
        this.checkDonateParam();

        // Automatically load and inject hotfix patches for options page
        this.loadPatchHotfix();

        // Analytics: automatically trigger options
        chrome.runtime.sendMessage({
            type: 'fh-dynamic-any-thing',
            thing: 'statistics-tool-usage',
            params: {
                tool_name: 'options'
            }
        });
    },

    computed: {
        filteredTools() {
            if (this.loading) {
                return [];
            }

            // 获取当前工具列表
            let result = Object.values(this.activeTools).map(tool => ({
                ...tool,
                favorite: this.favorites.has(tool.key)
            }));

            // 搜索过滤
            if (this.searchKey) {
                const key = this.searchKey.toLowerCase();
                result = result.filter(tool => 
                    tool.name.toLowerCase().includes(key) || 
                    tool.tips.toLowerCase().includes(key)
                );
            }

            // 分类过滤，在所有视图下生效
            if (this.currentCategory) {
                const category = TOOL_CATEGORIES.find(c => c.key === this.currentCategory);
                const categoryTools = category ? category.tools : [];
                result = result.filter(tool => categoryTools.includes(tool.key));
            }

            // 排序
            switch (this.sortType) {
                case 'newest':
                    result.sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0));
                    break;
                case 'hot':
                    result.sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0));
                    break;
                default:
                    const allTools = TOOL_CATEGORIES.reduce((acc, category) => {
                        acc.push(...category.tools);
                        return acc;
                    }, []);
                    
                    result.sort((a, b) => {
                        const indexA = allTools.indexOf(a.key);
                        const indexB = allTools.indexOf(b.key);
                        
                        // If tool is not in any category, put it last
                        if (indexA === -1 && indexB === -1) {
                            return a.key.localeCompare(b.key); // Alphabetical order
                        }
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        
                        return indexA - indexB;
                    });
            }

            return result;
        }
    },

    methods: {
        async initData() {
            try {
                this.loading = true;

                // Get manifest information
                const manifest = await chrome.runtime.getManifest();
                this.manifest = manifest;

                // Get tool list from Awesome.getAllTools
                const tools = await Awesome.getAllTools();
                
                // Get favorites data
                const favorites = await this.getFavoritesData();
                this.favorites = new Set(favorites);

                // Get recently used data
                const recentUsed = await this.getRecentUsedData();
                this.recentUsed = recentUsed;
                this.recentCount = recentUsed.length;

                // Get installed tools list
                const installedTools = await Awesome.getInstalledTools();

                // Process tool data
                const processedTools = {};
                Object.entries(tools).forEach(([key, tool]) => {
                    // Check if tool is installed
                    const isInstalled = installedTools.hasOwnProperty(key);
                    // Check if has context menu
                    const hasMenu = tool.menu || false;
                    
                    processedTools[key] = {
                        ...tool,
                        key, // Add key to tool object
                        updateTime: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
                        installed: isInstalled, // Use real-time installation status
                        inContextMenu: hasMenu, // Use real-time menu status
                        systemInstalled: tool.systemInstalled || false, // Whether system pre-installed
                        favorite: this.favorites.has(key)
                    };
                });

                this.originalTools = processedTools;
                
                // Initialize activeTools to all tools
                this.activeTools = { ...processedTools };
                
                // Update "Other Tools" category
                this.updateOtherCategory(Object.keys(processedTools));

                // Default select "All Categories"
                this.currentCategory = '';
            } catch (error) {
                console.error('Failed to initialize data:', error);
            } finally {
                this.loading = false;
            }
        },
        
        // Update "Other Tools" category, add uncategorized tools to this category
        updateOtherCategory(allToolKeys) {
            // Get all categorized tools
            const categorizedTools = new Set();
            TOOL_CATEGORIES.forEach(category => {
                if (category.key !== 'other') {
                    category.tools.forEach(tool => categorizedTools.add(tool));
                }
            });
            
            // Find uncategorized tools
            const uncategorizedTools = allToolKeys.filter(key => !categorizedTools.has(key));
            
            // Update "Other Tools" category
            const otherCategory = TOOL_CATEGORIES.find(category => category.key === 'other');
            if (otherCategory) {
                otherCategory.tools = uncategorizedTools;
            }
        },

        // Check version update
        async checkVersionUpdate() {
            try {
                // Get installed version number
                const currentVersion = this.manifest.version;
                
                // Try to get latest version information from local storage to avoid frequent requests
                const cachedData = await new Promise(resolve => {
                    chrome.storage.local.get('fehelper_latest_version_data', data => {
                        resolve(data.fehelper_latest_version_data || null);
                    });
                });
        
                // Check if version information needs to be re-fetched:
                // 1. Cache does not exist
                // 2. Cache has expired (more than 24 hours)
                // 3. Cached current version is different from actual version (indicating extension has been updated)
                const now = Date.now();
                const cacheExpired = !cachedData || !cachedData.timestamp || (now - cachedData.timestamp > 24 * 60 * 60 * 1000);
                const versionChanged = cachedData && cachedData.currentVersion !== currentVersion;
                
                this.versionChecked = !(cacheExpired || versionChanged);
                if (!this.versionChecked) {
                    try {
                        // Use shields.io JSON API to get latest version number
                        const response = await fetch('https://img.shields.io/chrome-web-store/v/pkgccpejnmalmdinmhkkfafefagiiiad.json');
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                        this.versionChecked = true;
                        
                        const data = await response.json();
                        // Extract version number - shields.io returns data containing version information
                        let latestVersion = '';
                        if (data && data.value) {
                            // Remove 'v' character before version number (if any)
                            latestVersion = data.value.replace(/^v/, '');
                        }
                        
                        // Compare version numbers
                        const needUpdate = this.compareVersions(currentVersion, latestVersion) < 0;
                        
                        // Save to local storage
                        await chrome.storage.local.set({
                            'fehelper_latest_version_data': {
                                timestamp: now,
                                currentVersion, // Save version number at time of check
                                latestVersion,
                                needUpdate
                            }
                        });
                        
                        this.latestVersion = latestVersion;
                        this.needUpdate = needUpdate;
                    } catch (fetchError) {
                        // Don't show update button when fetch fails
                        this.needUpdate = false;
                        
                        // If recheck was triggered by version change but fetch fails, use cached data
                        if (versionChanged && cachedData) {
                            this.latestVersion = cachedData.latestVersion || '';
                            // Compare new currentVersion and cached latestVersion
                            this.needUpdate = this.compareVersions(currentVersion, cachedData.latestVersion) < 0;
                        }
                    }
                } else {
                    // Use cached data
                    this.latestVersion = cachedData.latestVersion || '';
                    this.needUpdate = cachedData.needUpdate || false;
                }
            } catch (error) {
                this.needUpdate = false; // Don't show update prompt when error occurs
            }
        },
        
        // Compare version numbers: returns -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
        compareVersions(v1, v2) {
            // Split version number into array of numbers
            const v1Parts = v1.split('.').map(Number);
            const v2Parts = v2.split('.').map(Number);
            
            // Calculate the longer length of the two version numbers
            const maxLength = Math.max(v1Parts.length, v2Parts.length);
            
            // Compare each part
            for (let i = 0; i < maxLength; i++) {
                // Get current part, treat as 0 if doesn't exist
                const part1 = v1Parts[i] || 0;
                const part2 = v2Parts[i] || 0;
                
                // Compare current part
                if (part1 < part2) return -1;
                if (part1 > part2) return 1;
            }
            
            // All parts are equal
            return 0;
        },
        
        // Open Chrome Web Store page
        openStorePage() {
            try {
                // Use Chrome Extension API to check for updates
                // In Manifest V3, requestUpdateCheck returns Promise, result is an object not an array
                chrome.runtime.requestUpdateCheck().then(result => {
                    // Correctly get status and details, they are properties of result object
                    this.handleUpdateStatus(result.status, result.details);
                }).catch(error => {
                    this.handleUpdateError(error);
                });
            } catch (error) {
                this.handleUpdateError(error);
            }
        },

        // Handle update status
        handleUpdateStatus(status, details) {
            if (status === 'update_available') {
                // Show update notification
                this.showNotification({
                    title: 'FeHelper 更新',
                    message: 'New version found, updating...'
                });
                
                // Reload extension to apply update
                setTimeout(() => {
                    chrome.runtime.reload();
                }, 1000);
            } else if (status === 'no_update') {
                // If no update available, but user clicked update button
                this.showNotification({
                    title: 'FeHelper 更新',
                    message: 'Your FeHelper is already the latest version.'
                });
            } else {
                // Other cases, such as update check failure
                // Alternative: redirect to official website
                chrome.tabs.create({ 
                    url: 'https://fehelper.com/'
                });
                
                this.showNotification({
                    title: 'FeHelper 更新',
                    message: 'Auto-update failed, please visit FeHelper official website to manually get the latest version.'
                });
            }
        },

        // Handle update error
        handleUpdateError(error) {
            // Redirect to official website when error occurs
            chrome.tabs.create({ 
                url: 'https://fehelper.com/'
            });
            
            this.showNotification({
                title: 'FeHelper 更新错误',
                message: 'Error occurred during update, please check for updates manually.'
            });
        },

        // Unified method to show notification
        showNotification(options) {
            try {
                // Define notification ID for easy closing later
                const notificationId = 'fehelper-update-notification';
                const simpleNotificationId = 'fehelper-simple-notification';

                // Try to create notification directly without checking permissions
                // Chrome extension has declared notifications permission in manifest, should be able to use directly
                const notificationOptions = {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('static/img/fe-48.png'),
                    title: options.title || 'FeHelper',
                    message: options.message || '',
                    priority: 2,
                    requireInteraction: false, // Changed to false, because we will close it manually
                    silent: false // Play sound effect
                };
                
                // First try to create notification directly
                chrome.notifications.create(notificationId, notificationOptions, (createdId) => {
                    const error = chrome.runtime.lastError;
                    if (error) {
                        // Notification creation failed, try using alert as backup
                        alert(`${options.title}: ${options.message}`);
                        
                        // Try creating notification again with different options
                        const simpleOptions = {
                            type: 'basic',
                            iconUrl: chrome.runtime.getURL('static/img/fe-48.png'),
                            title: options.title || 'FeHelper',
                            message: options.message || ''
                        };
                        
                        // Try again with simplified options
                        chrome.notifications.create(simpleNotificationId, simpleOptions, (simpleId) => {
                            if (chrome.runtime.lastError) {
                                console.error('Simplified notification creation also failed:', chrome.runtime.lastError);
                            } else {
                                // Auto-close simplified notification after 3 seconds
                                setTimeout(() => {
                                    chrome.notifications.clear(simpleId);
                                }, 3000);
                            }
                        });
                    } else {
                        // Auto-close notification after 3 seconds
                        setTimeout(() => {
                            chrome.notifications.clear(createdId);
                        }, 3000);
                    }
                });
                
                // Also use built-in UI to show message
                this.showInPageNotification(options);
            } catch (error) {
                // Fallback to alert
                alert(`${options.title}: ${options.message}`);
            }
        },

        // Show notification message within page
        showInPageNotification(options) {
            try {
                // Ensure options is an object
                if (!options || typeof options !== 'object') {
                    options = { message: String(options || '') };
                }
                // Create a notification element
                const notificationEl = document.createElement('div');
                notificationEl.className = 'in-page-notification';
                const title = (options && options.title) ? String(options.title) : 'FeHelper';
                const message = (options && options.message) ? String(options.message) : '';
                notificationEl.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-title">${title}</div>
                        <div class="notification-message">${message}</div>
                    </div>
                    <button class="notification-close">×</button>
                `;
                
                // Add styles
                const style = document.createElement('style');
                style.textContent = `
                    .in-page-notification {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background-color: #4285f4;
                        color: white;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        min-width: 300px;
                        animation: slideIn 0.3s ease-out;
                    }
                    .notification-content {
                        flex: 1;
                    }
                    .notification-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .notification-message {
                        font-size: 14px;
                    }
                    .notification-close {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 20px;
                        cursor: pointer;
                        margin-left: 10px;
                        padding: 0 5px;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                
                // Add to page
                document.head.appendChild(style);
                document.body.appendChild(notificationEl);
                
                // Click close button to remove notification
                const closeBtn = notificationEl.querySelector('.notification-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        notificationEl.style.animation = 'slideOut 0.3s ease-out forwards';
                        notificationEl.addEventListener('animationend', () => {
                            notificationEl.remove();
                        });
                    });
                }
                
                // Auto-remove after 3 seconds (changed from 5 seconds)
                setTimeout(() => {
                    notificationEl.style.animation = 'slideOut 0.3s ease-out forwards';
                    notificationEl.addEventListener('animationend', () => {
                        notificationEl.remove();
                    });
                }, 3000);
            } catch (error) {
                console.error('Error creating in-page notification:', error);
            }
        },

        async getFavoritesData() {
            return new Promise((resolve) => {
                chrome.storage.local.get('favorites', (result) => {
                    resolve(result.favorites || []);
                });
            });
        },

        async getRecentUsedData() {
            // Get recently used tools directly from Statistics module
            return await Statistics.getRecentUsedTools(10);
        },

        async saveFavorites() {
            try {
                await chrome.storage.local.set({
                    favorites: Array.from(this.favorites)
                });
                // Update tool favorite status
                Object.keys(this.originalTools).forEach(key => {
                    this.originalTools[key].favorite = this.favorites.has(key);
                });
            } catch (error) {
                console.error('Failed to save favorites:', error);
            }
        },

        handleSearch() {
            // Don't reset view type when searching, allow searching in filtered results
        },

        handleCategoryChange(category) {
            // Switch to all tools view
            if (this.currentView !== 'all') {
                this.currentView = 'all';
                this.updateActiveTools('all');
            }
            this.currentCategory = category;
            this.searchKey = '';
            // Ensure tools display correctly
            this.activeTools = { ...this.originalTools };
        },

        handleSort() {
            // Sorting logic is implemented in computed
        },

        getCategoryCount(categoryKey) {
            const category = TOOL_CATEGORIES.find(c => c.key === categoryKey);
            const categoryTools = category ? category.tools : [];
            return categoryTools.length;
        },

        async getInstalledCount() {
            try {
                // Use Awesome.getInstalledTools to get real-time installed tools count
                const installedTools = await Awesome.getInstalledTools();
                return Object.keys(installedTools).length;
            } catch (error) {
                // Fall back to local data
                return Object.values(this.originalTools).filter(tool => 
                    tool.installed || tool.systemInstalled || false
                ).length;
            }
        },

        getFavoritesCount() {
            return this.favorites.size;
        },

        getToolCategory(toolKey) {
            for (const category of TOOL_CATEGORIES) {
                if (category.tools.includes(toolKey)) {
                    return category.key;
                }
            }
            return 'other';
        },

        async showMyInstalled() {
            this.currentView = 'installed';
            this.currentCategory = '';
            this.searchKey = '';
            await this.updateActiveTools('installed');
            // Update installed tools count
            await this.updateInstalledCount();
        },

        showMyFavorites() {
            this.currentView = 'favorites';
            this.currentCategory = '';
            this.searchKey = '';
            this.updateActiveTools('favorites');
        },

        // 重置工具列表到原始状态
        resetTools() {
            this.currentView = 'all';
        },

        // 安装工具
        async installTool(toolKey) {
            try {
                // Find possible button element
                const btnElement = document.querySelector(`button[data-tool="${toolKey}"]`);
                let elProgress = null;
                
                // If called through button click, get progress bar element
                if (btnElement) {
                    if (btnElement.getAttribute('data-undergoing') === '1') {
                        return false;
                    }
                    btnElement.setAttribute('data-undergoing', '1');
                    elProgress = btnElement.querySelector('span.x-progress');
                }
                
                // Show installation progress
                let pt = 1;
                await Awesome.install(toolKey);
                
                // Only update text content when progress bar element exists
                if (elProgress) {
                    elProgress.textContent = `(${pt}%)`;
                    let ptInterval = setInterval(() => {
                        elProgress.textContent = `(${pt}%)`;
                        pt += Math.floor(Math.random() * 20);
                        if(pt > 100) {
                            clearInterval(ptInterval);
                            elProgress.textContent = ``;
                            
                            // Show installation success notification after progress bar completes
                            this.showInPageNotification({
                                message: `${this.originalTools[toolKey].name} 安装成功！`,
                                type: 'success',
                                duration: 3000
                            });
                        }
                    }, 100);
                } else {
                    // If no progress bar element, show notification directly
                    this.showInPageNotification({
                        message: `${this.originalTools[toolKey].name} 安装成功！`,
                        type: 'success',
                        duration: 3000
                    });
                }
                
                // Update original data and current active data
                this.originalTools[toolKey].installed = true;
                if (this.activeTools[toolKey]) {
                    this.activeTools[toolKey].installed = true;
                }
                
                // Update installed tools count
                this.updateInstalledCount();
                
                // If button exists, update its status
                if (btnElement) {
                    btnElement.setAttribute('data-undergoing', '0');
                }
                
                // Send message to notify background to update
                chrome.runtime.sendMessage({
                    type: MSG_TYPE.DYNAMIC_TOOL_INSTALL_OR_OFFLOAD,
                    toolName: toolKey,
                    action: 'install',
                    showTips: true
                });
                
            } catch (error) {
                // Show installation failure notification
                this.showInPageNotification({
                    message: `安装失败：${error.message || '未知错误'}`,
                    type: 'error',
                    duration: 5000
                });
            }
        },

        // Uninstall tool
        async uninstallTool(toolKey) {
            try {
                // Use custom confirmation dialog instead of native confirm
                this.showConfirm({
                    title: '卸载确认',
                    message: `Are you sure you want to uninstall "${this.originalTools[toolKey].name}" tool?`,
                    callback: async (key) => {
                        try {
                            // First call Awesome.offLoad to uninstall tool (ensure storage data is deleted first)
                            await Awesome.offLoad(key);
                            
                            // Then send message to background to update browser action
                            await chrome.runtime.sendMessage({
                                type: MSG_TYPE.DYNAMIC_TOOL_INSTALL_OR_OFFLOAD,
                                toolName: key,
                                action: 'offload',
                                showTips: true
                            });
                            
                            // Update original data and current active data
                            this.originalTools[key].installed = false;
                            this.originalTools[key].inContextMenu = false;
                            
                            if (this.activeTools[key]) {
                                this.activeTools[key].installed = false;
                                this.activeTools[key].inContextMenu = false;
                            }
                            
                            // Update installed tools count
                            this.updateInstalledCount();
                            
                            // Show uninstall success notification
                            this.showInPageNotification({
                                message: `${this.originalTools[key].name} 已成功卸载！`,
                                type: 'success',
                                duration: 3000
                            });
                        } catch (error) {
                            // Show uninstall failure notification
                            this.showInPageNotification({
                                message: `卸载失败：${error.message || '未知错误'}`,
                                type: 'error',
                                duration: 5000
                            });
                        }
                    },
                    data: toolKey
                });
            } catch (error) {
                console.error('Error during uninstall preparation:', error);
            }
        },

        // Toggle context menu
        async toggleContextMenu(toolKey) {
            try {
                const tool = this.originalTools[toolKey];
                const newState = !tool.inContextMenu;
                
                // Update menu status
                await Awesome.menuMgr(toolKey, newState ? 'install' : 'offload');
                
                // Update original data and current active data
                tool.inContextMenu = newState;
                if (this.activeTools[toolKey]) {
                    this.activeTools[toolKey].inContextMenu = newState;
                }
                
                // 发送消息Notify background to update context menu
                chrome.runtime.sendMessage({
                    type: MSG_TYPE.DYNAMIC_TOOL_INSTALL_OR_OFFLOAD,
                    action: `menu-${newState ? 'install' : 'offload'}`,
                    showTips: false,
                    menuOnly: true
                });
            } catch (error) {
                console.error('Failed to toggle context menu:', error);
            }
        },

        // Toggle favorite status
        async toggleFavorite(toolKey) {
            try {
                if (this.favorites.has(toolKey)) {
                    this.favorites.delete(toolKey);
                    // Update original data and current active data
                    this.originalTools[toolKey].favorite = false;
                    if (this.activeTools[toolKey]) {
                        this.activeTools[toolKey].favorite = false;
                    }
                } else {
                    this.favorites.add(toolKey);
                    // Update original data and current active data
                    this.originalTools[toolKey].favorite = true;
                    if (this.activeTools[toolKey]) {
                        this.activeTools[toolKey].favorite = true;
                    }
                }
                await this.saveFavorites();
                
                // If in favorites view, need to update view
                if (this.currentView === 'favorites') {
                    this.updateActiveTools('favorites');
                }
            } catch (error) {
                console.error('Failed to toggle favorite status:', error);
            }
        },

        async updateActiveTools(view) {
            if (this.loading || Object.keys(this.originalTools).length === 0) {
                return;
            }

            switch (view) {
                case 'installed':
                    // Use Awesome.getInstalledTools to get installed tools in real-time
                    try {
                        const installedTools = await Awesome.getInstalledTools();
                        // Merge installedTools with originalTools data
                        this.activeTools = Object.fromEntries(
                            Object.entries(this.originalTools).filter(([key]) => 
                                installedTools.hasOwnProperty(key)
                            )
                        );
                    } catch (error) {
                        // Fall back to local data
                        this.activeTools = Object.fromEntries(
                            Object.entries(this.originalTools).filter(([_, tool]) => 
                                tool.installed || tool.systemInstalled || false
                            )
                        );
                    }
                    break;
                case 'favorites':
                    this.activeTools = Object.fromEntries(
                        Object.entries(this.originalTools).filter(([key]) => this.favorites.has(key))
                    );
                    break;
                case 'recent':
                    // When switching to recent, recentUsed has been fetched in real-time in showRecentUsed
                    this.activeTools = Object.fromEntries(
                        Object.entries(this.originalTools).filter(([key]) => this.recentUsed.includes(key))
                    );
                    break;
                case 'all':
                default:
                    this.activeTools = { ...this.originalTools };
                    // Category filtering is handled in computed property
                    break;
            }
        },

        // New method to update installed tools count
        async updateInstalledCount() {
            this.installedCount = await this.getInstalledCount();
        },

        // Load user saved view mode
        async loadViewMode() {
            try {
                const result = await new Promise(resolve => {
                    chrome.storage.local.get('fehelper_view_mode', result => {
                        resolve(result.fehelper_view_mode);
                    });
                });
                
                if (result) {
                    this.viewMode = result;
                }
            } catch (error) {
                console.error('Failed to load view mode:', error);
            }
        },

        // Save user's view mode selection
        async saveViewMode(mode) {
            try {
                this.viewMode = mode;
                await chrome.storage.local.set({
                    'fehelper_view_mode': mode
                });
            } catch (error) {
                console.error('Failed to save view mode:', error);
            }
        },

        // Load settings
        async loadSettings() {
            try {
                Settings.getOptions(async (opts) => {
                    let selectedOpts = [];
                    Object.keys(opts).forEach(key => {
                        if(String(opts[key]) === 'true') {
                            selectedOpts.push(key);
                        }
                    });
                    this.selectedOpts = selectedOpts;
                    
                    // Sync localStorage settings to ensure compatibility with other tools
                    localStorage.setItem('AUTO_DARK_MODE', opts.AUTO_DARK_MODE);
                    localStorage.setItem('ALWAYS_DARK_MODE', opts.ALWAYS_DARK_MODE);
                    
                    // Apply dark mode settings
                    this.applyDarkModeSettings(opts);
                    
                    // Load context menu settings
                    this.menuDownloadCrx = await Awesome.menuMgr('download-crx', 'get') === '1';
                    this.menuFeHelperSeting = await Awesome.menuMgr('fehelper-setting', 'get') !== '0';
                    
                    // Get shortcuts
                    chrome.commands.getAll((commands) => {
                        for (let command of commands) {
                            if (command.name === '_execute_action') {
                                this.defaultKey = command.shortcut || 'Alt+Shift+J';
                                break;
                            }
                        }
                    });
                });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        
        // Check browser type
        checkBrowserType() {
            try {
                this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            } catch (error) {
                this.isFirefox = false;
            }
        },

        // Apply dark mode settings
        applyDarkModeSettings(opts) {
            const body = document.body;
            const shouldEnableDarkMode = this.shouldEnableDarkMode(opts);
            
            // 同时设置localStorage和chrome.storage.local，确保与其他工具兼容
            localStorage.setItem('AUTO_DARK_MODE', opts.AUTO_DARK_MODE);
            localStorage.setItem('ALWAYS_DARK_MODE', opts.ALWAYS_DARK_MODE);
            
            if (shouldEnableDarkMode) {
                body.classList.add('dark-mode');
                // Set html attribute for easy detection by other tools
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('dark-mode', 'on');
            } else {
                body.classList.remove('dark-mode');
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.setAttribute('dark-mode', 'off');
            }
        },

        // Determine if dark mode should be enabled
        shouldEnableDarkMode(opts) {
            // If always enable dark mode, return true directly
            if (opts.ALWAYS_DARK_MODE === true || opts.ALWAYS_DARK_MODE === 'true') {
                return true;
            }
            
            // If auto enable dark mode, check time
            if (opts.AUTO_DARK_MODE === true || opts.AUTO_DARK_MODE === 'true') {
                return this.isNightTime();
            }
            
            return false;
        },

        // Check if current time is in night period (19:00-06:00)
        isNightTime() {
            const now = new Date();
            const hour = now.getHours();
            
            // 19:00-23:59 or 00:00-05:59
            return hour >= 19 || hour < 6;
        },
        
        // Show settings modal
        async showSettings() {
            this.showSettingsModal = true;
            // Load sortable tool list
            await this.loadSortableTools();
        },

        // Close settings modal
        closeSettings() {
            this.showSettingsModal = false;
        },

        // Show donation modal
        openDonateModal() {
            this.showDonateModal = true;
        },

        // Close donation modal
        closeDonateModal() {
            this.showDonateModal = false;
        },

        // Show confirmation dialog
        showConfirm(options) {
            this.confirmDialog = {
                show: true,
                title: options.title || '操作确认',
                message: options.message || '确定要执行此操作吗？',
                callback: options.callback || null,
                data: options.data || null
            };
        },

        // Confirm action
        confirmAction() {
            if (this.confirmDialog.callback) {
                this.confirmDialog.callback(this.confirmDialog.data);
            }
            this.confirmDialog.show = false;
        },

        // Cancel confirmation
        cancelConfirm() {
            this.confirmDialog.show = false;
        },

        // Save settings
        async saveSettings() {
            try {
                // Build settings object
                let opts = {};
                [
                    'OPT_ITEM_CONTEXTMENUS',
                    'FORBID_OPEN_IN_NEW_TAB',
                    'CONTENT_SCRIPT_ALLOW_ALL_FRAMES',
                    'JSON_PAGE_FORMAT',
                    'AUTO_DARK_MODE',
                    'ALWAYS_DARK_MODE',
                    'FORBID_STATISTICS' // New, ensure it's saved
                ].forEach(key => {
                    opts[key] = this.selectedOpts.includes(key).toString();
                });
                
                // First save tool sorting (if user has modified)
                if (this.sortableTools && this.sortableTools.length > 0) {
                    try {
                        const toolOrder = this.sortableTools.map(tool => tool.key);
                        await chrome.storage.local.set({
                            tool_custom_order: JSON.stringify(toolOrder)
                        });
                    } catch (sortError) {
                        console.warn('Error occurred when saving tool sorting:', sortError);
                        // Tool sorting save failure should not prevent settings save
                    }
                }
                
                // Save settings - pass object directly, settings.js now supports object types
                Settings.setOptions(opts, async () => {
                    try {
                        // Handle context menu
                        const crxAction = this.menuDownloadCrx ? 'install' : 'offload';
                        const settingAction = this.menuFeHelperSeting ? 'install' : 'offload';
                        
                        await Promise.all([
                            Awesome.menuMgr('download-crx', crxAction),
                            Awesome.menuMgr('fehelper-setting', settingAction)
                        ]);
                        
                        // Notify background to update context menu
                        chrome.runtime.sendMessage({
                            type: MSG_TYPE.DYNAMIC_TOOL_INSTALL_OR_OFFLOAD,
                            action: 'menu-change',
                            menuOnly: true
                        });
                        
                        // Apply dark mode settings
                        this.applyDarkModeSettings(opts);
                        
                        // Close popup
                        this.closeSettings();
                        
                        // Show notification
                        this.showNotification({
                            title: 'FeHelper 设置',
                            message: 'Settings and tool sorting saved!'
                        });
                    } catch (innerError) {
                        this.showNotification({
                            title: 'FeHelper 设置错误',
                            message: 'Failed to save menu settings: ' + innerError.message
                        });
                    }
                });
            } catch (error) {
                this.showNotification({
                    title: 'FeHelper 设置错误',
                    message: 'Failed to save settings: ' + error.message
                });
            }
        },
        
        // Set shortcuts
        setShortcuts() {
            chrome.tabs.create({
                url: 'chrome://extensions/shortcuts'
            });
        },
        
        // Try dark mode
        turnLight(event) {
            event.preventDefault();
            
            // Get body element
            const body = document.body;
            
            // Toggle dark mode
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.setAttribute('dark-mode', 'off');
            } else {
                body.classList.add('dark-mode');
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('dark-mode', 'on');
                
                // Set countdown
                this.countDown = 10;
                
                // Start countdown
                const timer = setInterval(() => {
                    this.countDown--;
                    if (this.countDown <= 0) {
                        clearInterval(timer);
                        body.classList.remove('dark-mode');
                        document.documentElement.setAttribute('data-theme', 'light');
                        document.documentElement.setAttribute('dark-mode', 'off');
                    }
                }, 1000);
            }
        },


        // Check donate_from parameter in URL and show donation popup
        checkDonateParam() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const donateFrom = urlParams.get('donate_from');
                
                if (donateFrom) {
                    // Record donation source
                    chrome.storage.local.set({
                        'fehelper_donate_from': donateFrom,
                        'fehelper_donate_time': Date.now()
                    });
                    
                    // Wait for tool data to load
                    this.$nextTick(() => {
                        // Search for matching item in all tools
                        let matchedTool = null;
                        
                        // First try to match tool key directly
                        if (this.originalTools && this.originalTools[donateFrom]) {
                            matchedTool = this.originalTools[donateFrom];
                        } else if (this.originalTools) {
                            // If no direct match, try to find partial match in all tools
                            for (const [key, tool] of Object.entries(this.originalTools)) {
                                if (key.includes(donateFrom) || donateFrom.includes(key) ||
                                    (tool.name && tool.name.includes(donateFrom)) || 
                                    (donateFrom && donateFrom.includes(tool.name))) {
                                    matchedTool = tool;
                                    break;
                                }
                            }
                        }
                        
                        // Update donation text
                        if (matchedTool) {
                            this.donate.text = `It looks like [${matchedTool.name}] tool has helped you, thank you for your recognition!`;
                        } else {
                            // No specific tool matched, use general text
                            this.donate.text = `Thank you for your recognition and support of FeHelper!`;
                        }
                        
                        // Show donation popup
                        this.showDonateModal = true;
                    });

                    // Analytics: automatically trigger options
                    chrome.runtime.sendMessage({
                        type: 'fh-dynamic-any-thing',
                        thing: 'statistics-tool-usage',
                        params: {
                            tool_name: 'donate'
                        }
                    });
                }
            } catch (error) {
                console.error('Error processing donation parameters:', error);
            }
        },

        // Add getRecentCount to ensure template calls don't error and data source is unique
        async getRecentCount() {
            const recent = await Statistics.getRecentUsedTools(10);
            return recent.length;
        },

        async showRecentUsed() {
            this.currentView = 'recent';
            this.currentCategory = '';
            this.searchKey = '';
            // Re-fetch recently used tools data
            this.recentUsed = await Statistics.getRecentUsedTools(10);
            this.recentCount = this.recentUsed.length;
            // activeTools will be auto-updated by currentView watcher
        },

        handleRecommendClick(card) {
            if (card.isAd && card.url) {
                window.open(card.url, '_blank');
            } else if (card.toolKey) {
                this.installTool(card.toolKey);
            }
        },

        // Load remote recommendation card configuration
        async loadRemoteRecommendationCards() {
            try {
                // Request through background proxy to solve CORS issues
                const result = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({
                        type: 'fh-dynamic-any-thing',
                        thing: 'fetch-hotfix-json',
                    }, resolve);
                });
                if (!result || !result.success) {
                    throw new Error('Failed to get remote configuration: ' + (result && result.error ? result.error : '未知错误'));
                }
                // Get script content
                const scriptContent = result.content;
                // Parse script content, extract GlobalRecommendationCards variable
                let remoteCards = null;
                try {
                    remoteCards = JSON.parse(scriptContent);
                } catch (parseError) {
                    console.error('Failed to parse remote recommendation card configuration:', parseError);
                }
                
                // If successfully parsed configuration, update local configuration
                if (remoteCards && Array.isArray(remoteCards) && remoteCards.length > 0) {
                    remoteCards.forEach((card, idx) => {
                        if (
                            card &&
                            card.toolKey &&
                            this.originalTools &&
                            !this.originalTools.hasOwnProperty(card.toolKey)
                        ) {
                            // toolKey does not exist in local tools, skip assignment, keep local default
                            return;
                        }
                        // No toolKey field, or toolKey exists in local tools, directly overwrite
                        this.recommendationCards[idx] = card;
                    });
                    this.$forceUpdate();
                }
            } catch (error) {
                console.error('Failed to get remote recommendation card configuration:', error);
            }
        },

        // Tool sorting related methods
        async loadSortableTools() {
            try {
                const installedTools = await Awesome.getInstalledTools();
                
                // Load custom sorting from storage
                const customOrder = await chrome.storage.local.get('tool_custom_order');
                const savedOrder = customOrder.tool_custom_order ? JSON.parse(customOrder.tool_custom_order) : null;
                
                // Convert to sortable array format
                let toolsArray = Object.entries(installedTools).map(([key, tool]) => ({
                    key,
                    name: tool.name,
                    tips: tool.tips,
                    icon: tool.icon || (tool.menuConfig && tool.menuConfig[0] ? tool.menuConfig[0].icon : '🔧')
                }));
                
                // If saved custom sorting exists, arrange in that order
                if (savedOrder && Array.isArray(savedOrder)) {
                    const orderedTools = [];
                    const unorderedTools = [...toolsArray];
                    
                    // Add tools in saved order
                    savedOrder.forEach(toolKey => {
                        const toolIndex = unorderedTools.findIndex(t => t.key === toolKey);
                        if (toolIndex !== -1) {
                            orderedTools.push(unorderedTools.splice(toolIndex, 1)[0]);
                        }
                    });
                    
                    // Add newly installed tools (not in saved order)
                    orderedTools.push(...unorderedTools);
                    toolsArray = orderedTools;
                }
                
                this.sortableTools = toolsArray;
            } catch (error) {
                console.error('Failed to load sortable tools:', error);
            }
        },

        // Drag start
        handleDragStart(event, index) {
            this.draggedIndex = index;
            event.target.classList.add('dragging');
            event.dataTransfer.setData('text/plain', index);
        },

        // Drag over
        handleDragOver(event) {
            event.preventDefault();
            // Remove all drag-over classes
            document.querySelectorAll('.sortable-item').forEach(item => {
                item.classList.remove('drag-over');
            });
            // Add to current element
            event.currentTarget.classList.add('drag-over');
        },

        // Drop
        handleDrop(event, dropIndex) {
            event.preventDefault();
            
            if (this.draggedIndex === -1 || this.draggedIndex === dropIndex) {
                return;
            }

            // Rearrange array
            const draggedItem = this.sortableTools[this.draggedIndex];
            const newTools = [...this.sortableTools];
            
            // Remove dragged item
            newTools.splice(this.draggedIndex, 1);
            
            // Insert at new position
            if (dropIndex > this.draggedIndex) {
                newTools.splice(dropIndex - 1, 0, draggedItem);
            } else {
                newTools.splice(dropIndex, 0, draggedItem);
            }
            
            this.sortableTools = newTools;
            
            // Clean up styles
            this.cleanupDragStyles();
        },

        // Drag end
        handleDragEnd(event) {
            this.cleanupDragStyles();
            this.draggedIndex = -1;
        },

        // Clean up drag styles
        cleanupDragStyles() {
            document.querySelectorAll('.sortable-item').forEach(item => {
                item.classList.remove('dragging', 'drag-over');
            });
        },

        // Reset tool order to default
        async resetToolOrder() {
            try {
                // Remove saved custom sorting
                await chrome.storage.local.remove('tool_custom_order');
                
                // Reload tool list (will use default order)
                await this.loadSortableTools();
                
                this.showInPageNotification({
                    message: '工具顺序已重置为默认排序',
                    type: 'success'
                });
            } catch (error) {
                console.error('Failed to reset tool order:', error);
                this.showInPageNotification({
                    message: '重置失败，请重试',
                    type: 'error'
                });
            }
        },

        // Save tool sorting
        async saveToolOrder() {
            try {
                const toolOrder = this.sortableTools.map(tool => tool.key);
                await chrome.storage.local.set({
                    tool_custom_order: JSON.stringify(toolOrder)
                });
                
                this.showInPageNotification({
                    message: '工具排序已保存！弹窗中的工具将按此顺序显示',
                    type: 'success'
                });
            } catch (error) {
                console.error('Failed to save tool sorting:', error);
                this.showInPageNotification({
                    message: '保存失败，请重试',
                    type: 'error'
                });
            }
        },

        async autoFixBugs() {
            this.showNotification({ 
                title: 'FeHelper 一键修复',
                message: 'Fetching fix patches, please wait...' 
            });
            chrome.runtime.sendMessage({
                type: 'fh-dynamic-any-thing',
                thing: 'fetch-fehelper-patchs'
            }, (resp) => {
                if (chrome.runtime.lastError) {
                    this.showNotification({ 
                        title: 'FeHelper 一键修复',
                        message: 'Failed to fetch patches: ' + chrome.runtime.lastError.message 
                    });
                    return;
                }
                if (!resp || !resp.success) {
                    const errorMsg = resp && resp.error ? resp.error : '未知错误';
                    this.showNotification({ 
                        title: 'FeHelper 一键修复',
                        message: errorMsg
                    });
                    return;
                }
                this.showNotification({
                    title: 'FeHelper 一键修复',
                    message: 'All known bugs in FeHelper extension have been fixed, you can verify now.',
                    duration: 5000
                });
                // Update current page bugs immediately
                this.loadPatchHotfix();
            });
        },

        loadPatchHotfix() {
            // Automatically load and inject hotfix patches for options page
            chrome.runtime.sendMessage({
                type: 'fh-dynamic-any-thing',
                thing: 'fh-get-tool-patch',
                toolName: 'options'
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
                            console.error('options补丁JS执行失败', e);
                        }
                    }
                }
            });
        }
    },

    watch: {
        // Watch currentView changes
        currentView: {
            immediate: true,
            handler(newView) {
                this.updateActiveTools(newView);
            }
        },
        
        // Watch currentCategory changes
        currentCategory: {
            handler(newCategory) {
                // Ensure category switching outside view mode displays correctly
                if (this.currentView === 'all') {
                    this.activeTools = { ...this.originalTools };
                }
                // Reset search condition
                if (this.searchKey) {
                    this.searchKey = '';
                }
            }
        },
    },
});

// Add scroll event listener
window.addEventListener('scroll', () => {
    const header = document.querySelector('.market-header');
    const sidebar = document.querySelector('.market-sidebar');
    
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
        sidebar && sidebar.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
        sidebar && sidebar.classList.remove('scrolled');
    }
});

// Auto-collect after page load
if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
    Awesome.collectAndSendClientInfo();
} 



