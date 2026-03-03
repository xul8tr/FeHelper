import Settings from '../options/settings.js';

export default (() => {
    /**
     * If the tab specified by tabId still exists, inject the script normally
     * @param tabId Tab ID where script needs to be injected
     * @param codeConfig Code to be injected
     * @param callback Callback after code injection
     */
    let injectScriptIfTabExists = function (tabId, codeConfig, callback) {
        chrome.tabs.query({currentWindow: true}, (tabs) => {
            tabs.some(tab => {
                if (tab.id !== tabId) return false;
                Settings.getOptions((opts) => {

                    if (!codeConfig.hasOwnProperty('allFrames')) {
                        codeConfig.allFrames = String(opts['CONTENT_SCRIPT_ALLOW_ALL_FRAMES']) === 'true';
                    }

                    codeConfig.js = 'try{' + codeConfig.js + ';}catch(e){};';
                    // If there are files, inject files
                    if(codeConfig.files && codeConfig.files.length){
                        // Inject CSS
                        if(codeConfig.files.join(',').indexOf('.css') > -1) {
                            chrome.scripting.insertCSS({
                                target: {tabId, allFrames: codeConfig.allFrames},
                                files: codeConfig.files
                            }, function () {
                                callback && callback.apply(this, arguments);
                            });
                        }
                        // Inject JS
                        else {
                            chrome.scripting.executeScript({
                                target: {tabId, allFrames: codeConfig.allFrames},
                                files: codeConfig.files
                            }, function () {
                                chrome.scripting.executeScript({
                                    target: {tabId, allFrames: codeConfig.allFrames},
                                    func: function(code){try{evalCore.getEvalInstance(window)(code)}catch(x){}},
                                    args: [codeConfig.js]
                                }, function () {
                                    callback && callback.apply(this, arguments);
                                });
                            });
                        }
                    }else if(codeConfig.css){
                        // Inject CSS styles
                        chrome.scripting.executeScript({
                            target: {tabId, allFrames: codeConfig.allFrames},
                            css:codeConfig.css
                        }, function () {
                            callback && callback.apply(this, arguments);
                        });
                    }else{
                        // Inject JS script
                        chrome.scripting.executeScript({
                            target: {tabId, allFrames: codeConfig.allFrames},
                            func: function(code){try{evalCore.getEvalInstance(window)(code)}catch(x){}},
                            args: [codeConfig.js]
                        }, function () {
                            callback && callback.apply(this, arguments);
                        });
                    }

                });

                return true;
            });
        });
    };

    return { inject: injectScriptIfTabExists };
})();
