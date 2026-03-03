window.baidu = {
    namespace: {

        /**
         * Register namespace
         * @param {String} fullNS Full namespace string, e.g. baidu.libs.Firefox
         * @example baidu.namespace.register("baidu.libs.Firefox");
         */
        register: function (fullNS) {
            // Namespace validity validation pattern
            var reg = /^[_$a-z]+[_$a-z0-9]*/i;

            // Split namespace into N parts, e.g. baidu.libs.Firefox etc.
            var nsArray = fullNS.split('.');
            var sEval = "";
            var sNS = "";
            var _tmpObj = [window];
            for (var i = 0; i < nsArray.length; i++) {
                // Namespace validity validation
                if (!reg.test(nsArray[i])) {
                    throw new Error("Invalid namespace:" + nsArray[i] + "");
                    return;
                }

                _tmpObj[i + 1] = _tmpObj[i][nsArray[i]];
                if (typeof _tmpObj[i + 1] == 'undefined') {
                    _tmpObj[i + 1] = new Object();
                }
            }
        }
    }
};

/**
 * Get number of bytes in a string
 */
String.prototype.getBytes = function () {
    var stream = this.replace(/\n/g, 'xx').replace(/\t/g, 'x');
    var escapedStr = encodeURIComponent(stream);
    return escapedStr.replace(/%[A-Z0-9][A-Z0-9]/g, 'x').length;
}

/**
 * Make all strings support whitespace filtering: trim
 * @return {String} Returns string without leading/trailing whitespace
 */
String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, "");
};

/**
 * Date formatting
 * @param {Object} pattern
 */
Date.prototype.format = function (pattern) {
    let pad = function (source, length) {
        let pre = "",
            negative = (source < 0),
            string = String(Math.abs(source));

        if (string.length < length) {
            pre = (new Array(length - string.length + 1)).join('0');
        }

        return (negative ? "-" : "") + pre + string;
    };

    if ('string' !== typeof pattern) {
        return this.toString();
    }

    let replacer = function (patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    };

    let year = this.getFullYear(),
        month = this.getMonth() + 1,
        date2 = this.getDate(),
        hours = this.getHours(),
        minutes = this.getMinutes(),
        seconds = this.getSeconds(),
        milliSec = this.getMilliseconds();

    replacer(/yyyy/g, pad(year, 4));
    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
    replacer(/MM/g, pad(month, 2));
    replacer(/M/g, month);
    replacer(/dd/g, pad(date2, 2));
    replacer(/d/g, date2);

    replacer(/HH/g, pad(hours, 2));
    replacer(/H/g, hours);
    replacer(/hh/g, pad(hours % 12, 2));
    replacer(/h/g, hours % 12);
    replacer(/mm/g, pad(minutes, 2));
    replacer(/m/g, minutes);
    replacer(/ss/g, pad(seconds, 2));
    replacer(/s/g, seconds);
    replacer(/SSS/g, pad(milliSec,3));
    replacer(/S/g, milliSec);

    return pattern;
};

/**
 * Auto-dismiss alert popup
 * @param content
 */
window.toast = function (content) {
    window.clearTimeout(window.feHelperAlertMsgTid);
    let elAlertMsg = document.querySelector("#fehelper_alertmsg");
    if (!elAlertMsg) {
        let elWrapper = document.createElement('div');
        elWrapper.innerHTML = '<div id="fehelper_alertmsg" style="position:fixed;top:5px;right:5px;z-index:1000000">' +
            '<p style="background:#000;display:inline-block;color:#fff;text-align:center;' +
            'padding:10px 10px;margin:0 auto;font-size:14px;border-radius:4px;">' + content + '</p></div>';
        elAlertMsg = elWrapper.childNodes[0];
        document.body.appendChild(elAlertMsg);
    } else {
        elAlertMsg.querySelector('p').innerHTML = content;
        elAlertMsg.style.display = 'block';
    }

    window.feHelperAlertMsgTid = window.setTimeout(function () {
        elAlertMsg.style.display = 'none';
    }, 3000);
};

/**
 * Get absolute path of current script
 * @returns {string}
 */
window.getCurrAbsPath = function () {
    let rExtractUri = /((?:http|https|file|chrome-extension):\/\/.*?\/[^:]+)(?::\d+)?:\d+/;
    let stack;
    try {
        a.b();
    }
    catch (e) {
        stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
    }
    if (stack) {
        return rExtractUri.exec(stack)[1];
    }
};
