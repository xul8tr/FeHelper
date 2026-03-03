/**
 * FeHelper context menu management
 * @type {{manage}}
 * @author zhaoxianlie
 */

import CrxDownloader from './crx-download.js';
import Awesome from './awesome.js';
import toolMap from './tools.js';
import Settings from '../options/settings.js';

export default (function () {

    let FeJson = {
        contextMenuId:"fhm_main"
    };

    // Context menu configuration items
    let defaultMenuOptions = {
        'download-crx': {
            icon: '♥',
            text: 'Plugin Download & Share',
            onClick: function (info, tab) {
                CrxDownloader.downloadCrx(tab);
            }
        },
        'fehelper-setting': {
            icon: '❂',
            text: 'FeHelper Settings',
            onClick: function (info, tab) {
                chrome.runtime.openOptionsPage();
            }
        }
    };

    // Initialize menu configuration
    let _initMenuOptions = (() => {

        Object.keys(toolMap).forEach(tool => {
            // context-menu
            switch (tool) {
                case 'json-format':
                    toolMap[tool].menuConfig[0].onClick = function (info, tab) {
                        chrome.scripting.executeScript({
                            target: {tabId:tab.id,allFrames:false},
                            args: [info.selectionText || ''],
                            func: (text) => text
                        }, resp => chrome.DynamicToolRunner({
                            tool, withContent: resp[0].result
                        }));
                    };
                    break;

                case 'code-beautify':
                case 'en-decode':
                    toolMap[tool].menuConfig[0].onClick = function (info, tab) {
                        chrome.scripting.executeScript({
                            target: {tabId:tab.id,allFrames:false},
                            args: [info.linkUrl || info.srcUrl || info.selectionText || info.pageUrl || ''],
                            func: (text) => text
                        }, resp => chrome.DynamicToolRunner({
                            tool, withContent: resp[0].result
                        }));
                    };
                    break;

                case 'qr-code':
                    toolMap[tool].menuConfig[0].onClick = function (info, tab) {
                        chrome.scripting.executeScript({
                            target: {tabId:tab.id,allFrames:false},
                            args: [info.linkUrl || info.srcUrl || info.selectionText || info.pageUrl || tab.url || ''],
                            func: (text) => text
                        }, resp => chrome.DynamicToolRunner({
                            tool, withContent: resp[0].result
                        }));
                    };
                    toolMap[tool].menuConfig[1].onClick = function (info, tab) {
                        chrome.scripting.executeScript({
                            target: {tabId:tab.id,allFrames:false},
                            args: [info.srcUrl || ''],
                            func: (text) => {
                                try {
                                    if (typeof window.qrcodeContentScript === 'function') {
                                        let qrcode = window.qrcodeContentScript();
                                        if (typeof qrcode.decode === 'function') {
                                            qrcode.decode(text);
                                            return 1;
                                        }
                                    }
                                } catch (e) {
                                    return 0;
                                }
                            }
                        });
                    };
                    break;

                default:
                    toolMap[tool].menuConfig[0].onClick = function (info, tab) {
                        chrome.DynamicToolRunner({
                            tool, withContent: tool === 'image-base64' ? info.srcUrl : ''
                        })
                    };
                    break;
            }
        });
    })();

    /**
     * Create a menu item
     * @param toolName
     * @param menuList
     * @returns {boolean}
     * @private
     */
    let _createItem = (toolName, menuList) => {
        menuList && menuList.forEach && menuList.forEach(menu => {

            // Ensure each time a new main menu is created to prevent onClick event conflicts
            let menuItemId = 'fhm_c' + escape(menu.text).replace(/\W/g,'') + new Date*1;

            chrome.contextMenus.create({
                id: menuItemId,
                title: menu.icon + '  ' + menu.text,
                contexts: menu.contexts || ['all'],
                parentId: FeJson.contextMenuId
            });

            chrome.contextMenus.onClicked.addListener(((tool,mId,mFunc) => (info, tab) => {
                if(info.menuItemId === mId) {
                    if(mFunc) {
                        mFunc(info,tab);
                    }else{
                        chrome.DynamicToolRunner({ tool });
                    }
                }
            })(toolName,menuItemId,menu.onClick));
        });
    };


    /**
     * Draw a separator line
     * @private
     */
    let _createSeparator = function () {
        chrome.contextMenus.create({
            id: 'fhm_s' + Math.ceil(Math.random()*10e9),
            type: 'separator',
            parentId: FeJson.contextMenuId
        });
    };

    /**
     * Create extension-specific context menu
     */
    let _initMenus = function () {
        _removeContextMenu(() => {
            let id = chrome.contextMenus.create({
                id: FeJson.contextMenuId ,
                title: "FeHelper",
                contexts: ['page', 'selection', 'editable', 'link', 'image'],
                documentUrlPatterns: ['http://*/*', 'https://*/*', 'file://*/*']
            });

            // Draw user-installed menus, place them first
            Awesome.getInstalledTools().then(tools => {
                let allMenus = Object.keys(tools).filter(tool => tools[tool].installed && tools[tool].menu);
                let onlineTools = allMenus.filter(tool => tool !== 'devtools' && !tools[tool].hasOwnProperty('_devTool'));
                let devTools = allMenus.filter(tool => tool === 'devtools' || tools[tool].hasOwnProperty('_devTool'));

                // Draw tool menus provided by FH
                onlineTools.forEach(tool => _createItem(tool, tools[tool].menuConfig));
                // If there are local tool menus to draw, add a separator
                devTools.length && _createSeparator();
                // Draw local tool menus
                devTools.forEach(tool => {
                    // If it's a custom tool, construct menuConfig
                    if(!tools[tool].menuConfig) {
                        tools[tool].menuConfig = [{
                            icon: tools[tool].icon,
                            text: tools[tool].name,
                            onClick: (info, tab) => {
                                chrome.DynamicToolRunner({
                                    page: 'dynamic',
                                    noPage: !!tools[tool].noPage,
                                    query: `tool=${tool}`
                                });
                                !!tools[tool].noPage && setTimeout(window.close, 200);
                            }
                        }];
                    }
                    _createItem(tool, tools[tool].menuConfig)
                });
              });

            // Draw two system-provided menus, place them last
            let sysMenu = ['download-crx', 'fehelper-setting'];
            let arrPromises = sysMenu.map(menu => Awesome.menuMgr(menu, 'get'));
            Promise.all(arrPromises).then(values => {
                let needDraw = String(values[0]) === '1' || String(values[1]) !== '0';

                // Draw a separator line
                _createSeparator();

                // Draw menus
                String(values[0]) === '1' && _createItem(sysMenu[0], [defaultMenuOptions[sysMenu[0]]]);
                String(values[1]) !== '0' && _createItem(sysMenu[1], [defaultMenuOptions[sysMenu[1]]]);
            });
        });
    };

    /**
     * Remove extension-specific context menu
     */
    let _removeContextMenu = function (callback) {
        chrome.contextMenus.removeAll(callback);
    };

    /**
     * Create or remove extension-specific context menu
     */
    let _createOrRemoveContextMenu = function () {
        Settings.getOptions((opts) => {
            if (String(opts['OPT_ITEM_CONTEXTMENUS']) !== 'false') {
                _initMenus();
            } else {
                _removeContextMenu();
            }
        });
    };

    return {
        rebuild: _createOrRemoveContextMenu
    };
})();
