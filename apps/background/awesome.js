/**
 * Tool update module
 * @type {{download}}
 */
import toolMap from './tools.js';

let Awesome = (() => {

    let manifest = chrome.runtime ? chrome.runtime.getManifest() : {};

    const SERVER_SITE = manifest.homepage_url;
    const URL_TOOL_TPL = `${SERVER_SITE}/#TOOL-NAME#/index.html`;
    const TOOL_NAME_TPL = 'DYNAMIC_TOOL:#TOOL-NAME#';
    const TOOL_CONTENT_SCRIPT_TPL = 'DYNAMIC_TOOL:CS:#TOOL-NAME#';
    const TOOL_CONTENT_SCRIPT_CSS_TPL = 'DYNAMIC_TOOL:CS:CSS:#TOOL-NAME#';
    const TOOL_MENU_TPL = 'DYNAMIC_MENU:#TOOL-NAME#';

    /**
     * Manage local storage
     */
    let StorageMgr = (() => {

        // Get content from chrome.storage.local, returns Promise, can be directly awaited
        let get = keyArr => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(keyArr, result => {
                    resolve(typeof keyArr === 'string' ? result[keyArr] : result);
                });
            });
        };

        let set = (items, values) => {
            return new Promise((resolve, reject) => {
                if (typeof items === 'string') {
                    let tmp = {};
                    tmp[items] = values;
                    items = tmp;
                }
                chrome.storage.local.set(items, () => {
                    resolve();
                });
            });
        };

        let remove = keyArr => {
            return new Promise((resolve, reject) => {
                keyArr = [].concat(keyArr);
                chrome.storage.local.remove(keyArr, () => {
                    resolve();
                });
            });
        };

        return {get, set, remove};
    })();

    /**
     * Detect if a tool is successfully installed
     * @param toolName Tool name
     * @param detectMenu Whether to further detect Menu settings
     * @returns {Promise}
     */
    let detectInstall = (toolName, detectMenu) => {

        let menuKey = TOOL_MENU_TPL.replace('#TOOL-NAME#', toolName);
        let toolKey = TOOL_NAME_TPL.replace('#TOOL-NAME#', toolName);

        return Promise.all([StorageMgr.get(toolKey), StorageMgr.get(menuKey)]).then(values => {
            let toolInstalled = !!values[0];
            // System pre-installed features are forcibly in installed state
            if(toolMap[toolName] && toolMap[toolName].systemInstalled) {
                toolInstalled = true;
            }
            if (detectMenu) {
                return toolInstalled && String(values[1]) === '1';
            }
            return toolInstalled;
        });
    };

    let log = (txt) => {
        // console.log(String(new Date(new Date() * 1 - (new Date().getTimezoneOffset()) * 60 * 1000).toJSON()).replace(/T/i, ' ').replace(/Z/i, '') + '>', txt);
    };

    /**
     * Install/update tool, supports displaying installation progress
     * @param toolName
     * @param fnProgress
     * @returns {Promise<any>}
     */
    let install = (toolName, fnProgress) => {
        return new Promise((resolve, reject) => {
            // Store HTML file
            StorageMgr.set(TOOL_NAME_TPL.replace('#TOOL-NAME#', toolName), new Date().getTime());
            log(toolName + ' tool HTML template installed/updated successfully!');
            resolve();
        });
    };

    let offLoad = (toolName) => {
        let items = [];
        items.push(TOOL_NAME_TPL.replace('#TOOL-NAME#', toolName));
        items.push(TOOL_CONTENT_SCRIPT_TPL.replace('#TOOL-NAME#', toolName));
        items.push(TOOL_CONTENT_SCRIPT_CSS_TPL.replace('#TOOL-NAME#', toolName));

        // Delete all static files
        chrome.storage.local.get(null, allDatas => {
            if (allDatas) {
                StorageMgr.remove(Object.keys(allDatas).filter(key => String(key).startsWith(`../${toolName}/`)));
            }
        });

        log(toolName + ' uninstalled successfully!');

        return StorageMgr.remove(items);
    };

    /**
     * Some tools have already been uninstalled, but there are still redundant static files locally, all need to be cleaned up
     */
    let gcLocalFiles = () => getAllTools().then(tools => {
        if (!tools) return;
        Object.keys(tools).forEach(tool => {
            if (!tools[tool] || !tools[tool]._devTool && !tools[tool].installed) {
                offLoad(tool);
            }
        });
    });

    let getAllTools = async () => {

        // Get locally developed plugins and merge them
        try {
            const DEV_TOOLS_MY_TOOLS = 'DEV-TOOLS:MY-TOOLS';
            let _tools = await StorageMgr.get(DEV_TOOLS_MY_TOOLS);
            let localDevTools = JSON.parse(_tools || '{}');
            Object.keys(localDevTools).forEach(tool => {
                toolMap[tool] = localDevTools[tool];
            });
        } catch (e) {
        }

        let tools = Object.keys(toolMap);
        let promises = [];
        tools.forEach(tool => {
            promises = promises.concat([detectInstall(tool), detectInstall(tool, true)])
        });
        return Promise.all(promises).then(values => {
            (values || []).forEach((v, i) => {
                let tool = tools[Math.floor(i / 2)];
                let key = i % 2 === 0 ? 'installed' : 'menu';
                toolMap[tool][key] = v;
                // For local tools, also need to check if they are in enabled state
                if (toolMap[tool].hasOwnProperty('_devTool')) {
                    toolMap[tool][key] = toolMap[tool][key] && toolMap[tool]._enable;
                }
            });

            return toolMap;
        });
    };

    /**
     * Check which tools are installed locally - performance optimized version
     * @returns {Promise}
     */
    let getInstalledTools = async () => {
        try {
            // Get all storage data at once to avoid multiple accesses
            const allStorageData = await new Promise((resolve, reject) => {
                chrome.storage.local.get(null, result => {
                    resolve(result || {});
                });
            });

            // Get locally developed plugins
            const DEV_TOOLS_MY_TOOLS = 'DEV-TOOLS:MY-TOOLS';
            let localDevTools = {};
            try {
                localDevTools = JSON.parse(allStorageData[DEV_TOOLS_MY_TOOLS] || '{}');
                Object.keys(localDevTools).forEach(tool => {
                    toolMap[tool] = localDevTools[tool];
                });
            } catch (e) {
                // Ignore parsing errors
            }

            let installedTools = {};
            
            // Iterate all tools and check installation status from storage data
            Object.keys(toolMap).forEach(toolName => {
                const toolKey = TOOL_NAME_TPL.replace('#TOOL-NAME#', toolName);
                const menuKey = TOOL_MENU_TPL.replace('#TOOL-NAME#', toolName);
                
                // Check if tool is installed
                let toolInstalled = !!allStorageData[toolKey];
                // System pre-installed features are forcibly in installed state
                if (toolMap[toolName] && toolMap[toolName].systemInstalled) {
                    toolInstalled = true;
                }
                
                // Check menu status
                let menuInstalled = String(allStorageData[menuKey]) === '1';
                
                // For local tools, also need to check if they are in enabled state
                if (toolMap[toolName].hasOwnProperty('_devTool')) {
                    toolInstalled = toolInstalled && toolMap[toolName]._enable;
                    menuInstalled = menuInstalled && toolMap[toolName]._enable;
                }
                
                // Only collect installed tools
                if (toolInstalled) {
                    installedTools[toolName] = {
                        ...toolMap[toolName],
                        installed: true,
                        menu: menuInstalled,
                        installTime: parseInt(allStorageData[toolKey]) || 0
                    };
                }
            });

            // Sort by installation time
            const sortedToolNames = Object.keys(installedTools).sort((a, b) => {
                return installedTools[a].installTime - installedTools[b].installTime;
            });

            let sortedToolMap = {};
            sortedToolNames.forEach(toolName => {
                sortedToolMap[toolName] = installedTools[toolName];
            });
            
            return sortedToolMap;
        } catch (error) {
            console.error('getInstalledTools error:', error);
            // Return empty object on error to avoid popup loading failure
            return {};
        }
    };

    /**
     * Get tool's content-script
     * @param toolName
     * @param cssMode
     */
    let getContentScript = (toolName, cssMode) => {
        return StorageMgr.get(cssMode ? TOOL_CONTENT_SCRIPT_CSS_TPL.replace('#TOOL-NAME#', toolName)
            : TOOL_CONTENT_SCRIPT_TPL.replace('#TOOL-NAME#', toolName));
    };

    /**
     * Get tool's HTML template
     * @param toolName
     * @returns {*}
     */
    let getToolTpl = (toolName) => StorageMgr.get(TOOL_NAME_TPL.replace('#TOOL-NAME#', toolName));

    /**
     * Check from server to see which locally installed tools have been upgraded
     * @param tool
     */
    let checkUpgrade = (tool) => {
        let getOnline = (toolName) => fetch(URL_TOOL_TPL.replace('#TOOL-NAME#', toolName)).then(resp => resp.text());
        let getOffline = (toolName) => StorageMgr.get(TOOL_NAME_TPL.replace('#TOOL-NAME#', toolName));
        return Promise.all([getOnline(tool), getOffline(tool)]).then(values => {
            let onlineData = _tplHandler(tool, values[0]);
            let local = values[1];
            return local !== onlineData.html;
        });
    };

    /**
     * Manage context menu
     * @param toolName
     * @param action Specific action: install/offload/get
     * @returns {Promise<any>}
     */
    let menuMgr = (toolName, action) => {
        let menuKey = TOOL_MENU_TPL.replace('#TOOL-NAME#', toolName);
        switch (action) {
            case 'get':
                return StorageMgr.get(menuKey);
            case 'offload':
                // Must use setItem mode instead of removeItem to handle 0/1/null three results
                log(toolName + ' uninstalled successfully!');
                return StorageMgr.set(menuKey, 0);
            case 'install':
                log(toolName + ' installed successfully!');
                return StorageMgr.set(menuKey, 1);
        }
    };


    /**
     * Collect client information and send to background
     */
    let collectAndSendClientInfo = () => {
        try {
            const nav = navigator;
            const screenInfo = window.screen;
            const lang = nav.language || nav.userLanguage || '';
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            const ua = nav.userAgent;
            const platform = nav.platform;
            const vendor = nav.vendor;
            const colorDepth = screenInfo.colorDepth;
            const screenWidth = screenInfo.width;
            const screenHeight = screenInfo.height;
            const deviceMemory = nav.deviceMemory || '';
            const hardwareConcurrency = nav.hardwareConcurrency || '';
            const connection = nav.connection || nav.mozConnection || nav.webkitConnection || {};
            const screenOrientation = screenInfo.orientation ? screenInfo.orientation.type : '';
            const touchSupport = ('ontouchstart' in window) || (nav.maxTouchPoints > 0);
            let memoryJSHeapSize = '';
            if (window.performance && window.performance.memory) {
                memoryJSHeapSize = window.performance.memory.jsHeapSizeLimit;
            }
            const clientInfo = {
                language: lang,
                timezone,
                userAgent: ua,
                platform,
                vendor,
                colorDepth,
                screenWidth,
                screenHeight,
                deviceMemory,
                hardwareConcurrency,
                networkType: connection.effectiveType || '',
                downlink: connection.downlink || '',
                rtt: connection.rtt || '',
                online: nav.onLine,
                touchSupport,
                cookieEnabled: nav.cookieEnabled,
                doNotTrack: nav.doNotTrack,
                appVersion: nav.appVersion,
                appName: nav.appName,
                product: nav.product,
                vendorSub: nav.vendorSub,
                screenOrientation,
                memoryJSHeapSize
            };
            chrome.runtime.sendMessage({ type: 'clientInfo', data: clientInfo });
        } catch (e) {
            // Ignore collection exceptions
        }
    };

    return {
        StorageMgr,
        detectInstall,
        install,
        offLoad,
        getInstalledTools,
        menuMgr,
        checkUpgrade,
        getContentScript,
        getToolTpl,
        gcLocalFiles,
        getAllTools,
        collectAndSendClientInfo
    }
})();

export default Awesome;

