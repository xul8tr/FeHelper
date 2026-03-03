import InjectTools from './inject-tools.js';
import Statistics from './statistics.js';

export default (() => {
    let start = (params) => {
        try {
            const PAGE_MONKEY_LOCAL_STORAGE_KEY = 'PAGE-MODIFIER-LOCAL-STORAGE-KEY';

            let handler = monkeys => {
                monkeys.filter(cm => !cm.mDisabled).forEach(cm => {
                    let result = null;
                    let matched = cm.mPattern.match(/^\/(.*)\/(.*)?$/);
                    if (matched && ( !matched[2] || matched[2] && !/[^igm]*/i.test(matched[2]))) {
                        // Regex, match directly
                        cm.mPattern = new RegExp(matched[1], matched[2] || "");
                        result = cm.mPattern.test(params.url) && cm;
                    } else if (cm.mPattern.indexOf('*') > -1) {
                        if (cm.mPattern.startsWith('*://')) {
                            cm.mPattern = cm.mPattern.replace('*://', '(http|https|file)://');
                        } else if (cm.mPattern.indexOf('://') < 0) {
                            cm.mPattern = '(http|https|file)://' + cm.mPattern;
                        }

                        // Wildcard, convert to regex then match
                        cm.mPattern = new RegExp('^' + cm.mPattern.replace(/\./g,'\\.').replace(/\//g, '\\/').replace(/\*/g, '.*').replace(/\?/g, '\\?') + '$');
                        result = cm.mPattern.test(params.url) && cm;
                    } else {
                        // Absolute address, direct comparison
                        let arr = [cm.mPattern, `${cm.mPattern}/`];
                        if (!cm.mPattern.startsWith('http://') && !cm.mPattern.startsWith('https://')) {
                            arr = arr.concat([`http://${cm.mPattern}`, `http://${cm.mPattern}/`,
                                `https://${cm.mPattern}`, `https://${cm.mPattern}/`]);
                        }
                        if (arr.includes(params.url)) {
                            result = cm;
                        }
                    }

                    if (result) {
                        let scripts = '(' + ((monkey) => {
                            let injectFunc = () => {
                                // Execute script
                                try{evalCore.getEvalInstance(window)(monkey.mScript)}catch(x){}

                                parseInt(monkey.mRefresh) && setTimeout(() => {
                                    location.reload(true);
                                }, parseInt(monkey.mRefresh) * 1000);
                            };

                            window._fhImportJs = js => {
                                return fetch(js).then(resp => resp.text()).then(jsText => {
                                    if(window.evalCore && window.evalCore.getEvalInstance){
                                         return window.evalCore.getEvalInstance(window)(jsText);
                                    }
                                    let el = document.createElement('script');
                                    el.textContent = jsText;
                                    document.head.appendChild(el);
                                });
                            };

                            let jsFiles = (monkey.mRequireJs || '').split(/[\s,，]+/).filter(js => js.length);
                            if (jsFiles.length) {
                                let arrPromise = Array.from(new Set(jsFiles)).map(js => window._fhImportJs(js));
                                Promise.all(arrPromise).then(injectFunc);
                            } else {
                                injectFunc();
                            }
                        }).toString() + `)(${JSON.stringify(result)})`;
                        InjectTools.inject(params.tabId, {js: scripts, allFrames: false});
                    }
                });
            };

            chrome.storage.local.get(PAGE_MONKEY_LOCAL_STORAGE_KEY, (resps) => {
                let cacheMonkeys, storageMode = false;
                if ((!resps || !resps[PAGE_MONKEY_LOCAL_STORAGE_KEY]) && typeof localStorage !== 'undefined') {
                    cacheMonkeys = localStorage.getItem(PAGE_MONKEY_LOCAL_STORAGE_KEY) || '[]';
                    storageMode = true;
                } else {
                    cacheMonkeys = resps[PAGE_MONKEY_LOCAL_STORAGE_KEY] || '[]';
                }

                if(params && params.url){
                    handler(JSON.parse(cacheMonkeys));
                }

                // Content in local storage needs to be migrated to chrome.storage.local to ensure unlimitedStorage
                if (storageMode) {
                    let storageData = {};
                    storageData[PAGE_MONKEY_LOCAL_STORAGE_KEY] = cacheMonkeys;
                    chrome.storage.local.set(storageData);
                }
            });

        } catch (e) {
            console.log('monkey error',e);
        }
        return true;
    };

    return {start};
})();
