/**
 * FeHelper Settings Tools
 * @author zhaoxianlie
 */

import Awesome from '../background/awesome.js';

export default (() => {

    // All configuration items
    let optionItemsWithDefaultValue = {
        'OPT_ITEM_CONTEXTMENUS': true,
        'JSON_PAGE_FORMAT': true,
        'FORBID_OPEN_IN_NEW_TAB': false,
        'AUTO_DARK_MODE': false,
        'ALWAYS_DARK_MODE': false,
        'CONTENT_SCRIPT_ALLOW_ALL_FRAMES': false,
        'FORBID_STATISTICS': false
    };

    /**
     * Get all configuration items
     * @returns {string[]}
     * @private
     */
    let _getAllOpts = () => Object.keys(optionItemsWithDefaultValue);


    /**
     * Extract configuration items
     * @param {Function} callback callback function
     */
    let _getOptions = function (callback) {
        let rst = {};
        chrome.storage.local.get(_getAllOpts(),(objs) => {
            // Ensure objs is an object
            objs = objs || {};
            
            // Iterate through all configuration items to ensure each has a value
            _getAllOpts().forEach(item => {
                if (objs.hasOwnProperty(item) && objs[item] !== null) {
                    rst[item] = objs[item];
                } else {
                    // Use default value
                    rst[item] = optionItemsWithDefaultValue[item];
                }
            });
            
            callback && callback.call(null, rst);
        });
    };

    /**
     * Save configuration
     * @param items
     * @param callback
     * @private
     */
    let _setOptions = function (items, callback) {
        // Ensure items is an array type
        if (!Array.isArray(items)) {
            // If items is an object type, convert it to array format
            if (typeof items === 'object' && items !== null) {
                let tempItems = [];
                Object.keys(items).forEach(key => {
                    let obj = {};
                    obj[key] = items[key];
                    tempItems.push(obj);
                });
                items = tempItems;
            } else {
                items = [];
            }
        }

        _getAllOpts().forEach((opt) => {
            try {
                let found = items.some(it => {
                    if (!it) return false;
                    
                    if (typeof(it) === 'string' && it === opt) {
                        chrome.storage.local.set({[opt]: 'true'});
                        return true;
                    }
                    else if (typeof(it) === 'object' && it !== null && it.hasOwnProperty(opt)) {
                        chrome.storage.local.set({[opt]: it[opt]});
                        return true;
                    }
                    return false;
                });
                if (!found) {
                    chrome.storage.local.set({[opt]: 'false'});
                }
            } catch (e) {
                console.error('Error saving settings:', e, opt);
                // Set to default value when error occurs
                chrome.storage.local.set({
                    [opt]: optionItemsWithDefaultValue[opt] === true ? 'true' : 'false'
                });
            }
        });

        callback && callback();
    };

    return {
        getAllOpts: _getAllOpts,
        getOptions: _getOptions,
        setOptions: _setOptions
    };
})();

