/**
 * FeHelper: Tool for downloading extension files from chrome webstore
 * @author zhaoxianlie
 */

import MSG_TYPE from '../static/js/common.js';

export default (function () {

    let FeJson = {notifyTimeoutId:-1};
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
        if(typeof options === 'string') {
            options = {message: options};
        }
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

    /**
     * Detect if Google Chrome service is accessible, check heartbeat within 2s
     * @param success
     * @param failure
     */
    let detectGoogleDotCom = function (success, failure) {
        Promise.race([
            fetch('https://clients2.google.com/service/update2/crx'),
            new Promise(function (resolve, reject) {
                setTimeout(() => reject(new Error('request timeout')), 2000)
            })])
            .then((data) => {
                success && success();
            }).catch(() => {
            failure && failure();
        });
    };

    /**
     * Download chrome extension from official Google channel
     * @param crxId Extension ID to download
     * @param crxName Extension name
     * @param callback Callback after download action ends
     */
    let downloadCrxFileByCrxId = function (crxId, crxName, callback) {
        detectGoogleDotCom(() => {
            // Google is accessible, proceed with normal download
            let url = "https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D"
                + crxId + "%26uc&prodversion=" + navigator.userAgent.split("Chrome/")[1].split(" ")[0];
            if (!chrome.downloads) {
                let a = document.createElement('a');
                a.href = url;
                a.download = crxName || (crxId + '.crx');
                (document.body || document.documentElement).appendChild(a);
                a.click();
                a.remove();
            } else {
                chrome.downloads.download({
                    url: url,
                    filename: crxName || crxId,
                    conflictAction: 'overwrite',
                    saveAs: true
                }, function (downloadId) {
                    if (chrome.runtime.lastError) {
                        notifyText('Sorry, download failed! Error message: ' + chrome.runtime.lastError.message);
                    }
                });
            }
        }, () => {
            // Google is not accessible
            callback ? callback() : notifyText('Sorry, download failed!');
        });

    };

    /**
     * Download crx file from chrome webstore
     * Used on chrome extension detail page
     */
    let downloadCrxFileFromWebStoreDetailPage = function (callback) {

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            let tab = tabs[0];
            let crxId = tab.url.split("/")[6].split('?')[0];
            let crxName = tab.title.split(" - Chrome")[0] + ".crx";
            crxName = crxName.replace(/[&\/\\:"*<>|?]/g, '');

            downloadCrxFileByCrxId(crxId, crxName, callback);
        });
    };

    /**
     * Download or share crx through context menu
     * @param tab
     * @private
     */
    let _downloadCrx = function (tab) {
        let isWebStoreDetailPage = tab.url.indexOf('https://chrome.google.com/webstore/detail/') === 0;
        if (isWebStoreDetailPage) {
            // If already on a chrome extension detail page, download current crx file directly
            downloadCrxFileFromWebStoreDetailPage(() => {
                notifyText('Download failed, the current network may not be able to access Google sites!');
            });
        } else {
            // Otherwise, download FeHelper and share it
            let crxId = MSG_TYPE.STABLE_EXTENSION_ID;
            let crxName = chrome.runtime.getManifest().name + '-latestVersion.crx';

            downloadCrxFileByCrxId(crxId, crxName, () => {
                chrome.tabs.create({
                    url: MSG_TYPE.DOWNLOAD_FROM_GITHUB
                });
            });
        }
    };

    return {
        downloadCrx: _downloadCrx
    };
})();
