/**
 * FeHelper statistics module
 * @author fehelper
 */

import Awesome from './awesome.js';

// Data reporting server URL
let manifest = chrome.runtime.getManifest();
let SERVER_TRACK_URL = '';
if (manifest.name && manifest.name.endsWith('-Dev')) {
    // SERVER_TRACK_URL = 'http://localhost:3001/api/track';
    SERVER_TRACK_URL = 'https://chrome.fehelper.com/api/track';
} else {
    SERVER_TRACK_URL = 'https://chrome.fehelper.com/api/track';
}

// User ID storage key name
const USER_ID_KEY = 'FH_USER_ID';
// Last active date storage key name
const LAST_ACTIVE_DATE_KEY = 'FH_LAST_ACTIVE_DATE';
// User daily usage data storage key name
const USER_USAGE_DATA_KEY = 'FH_USER_USAGE_DATA';

// Record background startup time
const FH_TIME_OPENED = Date.now();

let Statistics = (function() {
    
    // User unique identifier
    let userId = '';
    
    // Today's date string YYYY-MM-DD
    let todayStr = new Date().toISOString().split('T')[0];
    
    // Locally stored usage data
    let usageData = {
        dailyUsage: {}, // Usage records stored by date
        tools: {}       // Usage count for each tool
    };
    
    /**
     * Generate unique user ID
     * @returns {string} User ID
     */
    const generateUserId = () => {
        return 'fh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    /**
     * Get or create user ID
     * @returns {Promise<string>} User ID
     */
    const getUserId = async () => {
        if (userId) return userId;
        
        try {
            const result = await Awesome.StorageMgr.get(USER_ID_KEY);
            if (result) {
                userId = result;
            } else {
                userId = generateUserId();
                await Awesome.StorageMgr.set(USER_ID_KEY, userId);
            }
            return userId;
        } catch (error) {
            console.error('Failed to get user ID:', error);
            return generateUserId(); // Generate temporary ID on failure
        }
    };
    
    /**
     * Load locally stored usage data
     * @returns {Promise<void>}
     */
    const loadUsageData = async () => {
        try {
            const data = await Awesome.StorageMgr.get(USER_USAGE_DATA_KEY);
            if (data) {
                usageData = JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load usage data:', error);
        }
    };
    
    /**
     * Save usage data to local storage
     * @returns {Promise<void>}
     */
    const saveUsageData = async () => {
        try {
            await Awesome.StorageMgr.set(USER_USAGE_DATA_KEY, JSON.stringify(usageData));
        } catch (error) {
            console.error('Failed to save usage data:', error);
        }
    };
    
    /**
     * Get client detailed information (only background available fields, compatible with service worker environment, fields consistent with server)
     * @returns {Object}
     */
    const getClientInfo = async () => {
        const nav = self.navigator || {};
        // Only collect fields needed by server
        return {
            userAgent: nav.userAgent || '',
            language: nav.language || '',
            platform: nav.platform || '',
            extensionVersion: chrome.runtime.getManifest().version
        };
    };

    /**
     * Check if statistics are allowed
     * @returns {Promise<boolean>} true=allow, false=forbid
     */
    const isStatisticsAllowed = async () => {
        try {
            const forbid = await Awesome.StorageMgr.get('FORBID_STATISTICS');
            return !(forbid === true || forbid === 'true');
        } catch (e) {
            return true;
        }
    };

    /**
     * Send event data using self-hosted server
     * @param {string} eventName - Event name
     * @param {Object} params - Event parameters
     */
    const sendToServer = async (eventName, params = {}) => {
        return ''; // Temporarily disabled statistics
        if (!(await isStatisticsAllowed())) return;
        const uid = await getUserId();
        const clientInfo = await getClientInfo();
        // Only keep fields needed by server TrackSchema
        const payload = {
            event: eventName,
            userId: uid,
            ...clientInfo
        };
        // Only allow fields in TrackSchema
        const allowedFields = [
            'tool_name', 'extensionVersion', 'browser', 'browserVersion', 'os', 'osVersion', 'IP',  'language', 'platform'
        ];
        for (const key of allowedFields) {
            if (params[key] !== undefined) {
                payload[key] = params[key];
            }
        }
        try {
            fetch(SERVER_TRACK_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).catch(e => console.log('Self-hosted statistics server send failed:', e));
        } catch (error) {
            console.log('Self-hosted statistics send failed:', error);
        }
    };
    
    /**
     * Record daily active user
     * @returns {Promise<void>}
     */
    const recordDailyActiveUser = async () => {
        try {
            // Get last active date
            const lastActiveDate = await Awesome.StorageMgr.get(LAST_ACTIVE_DATE_KEY);
            
            // If today hasn't been recorded yet, record today's activity
            if (lastActiveDate !== todayStr) {
                await Awesome.StorageMgr.set(LAST_ACTIVE_DATE_KEY, todayStr);
                
                // Ensure today's record exists
                if (!usageData.dailyUsage[todayStr]) {
                    usageData.dailyUsage[todayStr] = {
                        date: todayStr,
                        tools: {}
                    };
                }
                
                // Send daily active record to self-hosted server
                sendToServer('daily_active_user', {
                    date: todayStr
                });
            }
        } catch (error) {
            console.error('Failed to record daily active user:', error);
        }
    };
    
    /**
     * Record extension installation event
     */
    const recordInstallation = async () => {
        sendToServer('extension_installed');
    };
    
    /**
     * Record extension update event
     * @param {string} previousVersion - Version before update
     */
    const recordUpdate = async (previousVersion) => {
        sendToServer('extension_updated', {
            previous_version: previousVersion
        });
    };
    
    /**
     * Record extension uninstall event
     */
    const recordUninstall = async () => {
        sendToServer('extension_uninstall');
    };
    
    /**
     * Record tool usage
     * @param {string} toolName - Tool name
     */
    const recordToolUsage = async (toolName, params = {}) => {
        // Ensure today's record exists
        if (!usageData.dailyUsage[todayStr]) {
            usageData.dailyUsage[todayStr] = {
                date: todayStr,
                tools: {}
            };
        }
        
        // Increment tool usage count
        if (!usageData.tools[toolName]) {
            usageData.tools[toolName] = 0;
        }
        usageData.tools[toolName]++;
        
        // Increment today's usage count for this tool
        if (!usageData.dailyUsage[todayStr].tools[toolName]) {
            usageData.dailyUsage[todayStr].tools[toolName] = 0;
        }
        usageData.dailyUsage[todayStr].tools[toolName]++;
        
        // Save usage data
        await saveUsageData();
        
        // Send tool usage record to self-hosted server
        sendToServer('tool_used', {
            tool_name: toolName,
            date: todayStr,
            ...params
        });
    };
    
    /**
     * Periodically send usage summary data
     */
    const scheduleSyncStats = () => {
        // Send summary data once a week
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
        setInterval(async () => {
            // Send tool usage ranking
            const toolRanking = Object.entries(usageData.tools)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({name, count}));
            
            sendToServer('usage_summary', {
                top_tools: JSON.stringify(toolRanking)
            });
            
            // Clean up old date data (keep 30 days of data)
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
            
            Object.keys(usageData.dailyUsage).forEach(date => {
                if (date < thirtyDaysAgoStr) {
                    delete usageData.dailyUsage[date];
                }
            });
            
            // Save cleaned data
            await saveUsageData();
        }, ONE_WEEK);
    };
    
    /**
     * Initialize statistics module
     */
    const init = async () => {
        await getUserId();
        await loadUsageData();
        await recordDailyActiveUser();
        scheduleSyncStats();
    };
    
    /**
     * Get recently used tools (sorted by most recent usage time, default top 10)
     * @param {number} limit - Maximum number to return
     * @returns {Promise<string[]>} Tool name array
     */
    const getRecentUsedTools = async (limit = 10) => {
        // Ensure data is loaded
        await loadUsageData();
        // Collect all dates, sort from newest to oldest
        const dates = Object.keys(usageData.dailyUsage).sort((a, b) => b.localeCompare(a));
        const toolSet = [];
        for (const date of dates) {
            const tools = Object.keys(usageData.dailyUsage[date].tools || {});
            for (const tool of tools) {
                if (!toolSet.includes(tool)) {
                    toolSet.push(tool);
                    if (toolSet.length >= limit) {
                        return toolSet;
                    }
                }
            }
        }
        return toolSet;
    };
    
    /**
     * Get Dashboard statistics data
     * @returns {Promise<Object>} Statistics data object
     */
    const getDashboardData = async () => {
        await loadUsageData();
        // Last 10 used tools and times
        const recent = [];
        const recentDetail = [];
        const dates = Object.keys(usageData.dailyUsage).sort((a, b) => b.localeCompare(a));
        for (const date of dates) {
            for (const tool of Object.keys(usageData.dailyUsage[date].tools || {})) {
                if (!recent.includes(tool)) {
                    recent.push(tool);
                    recentDetail.push({ tool, date });
                    if (recent.length >= 10) break;
                }
            }
            if (recent.length >= 10) break;
        }
        // Tool usage total count ranking
        const mostUsed = Object.entries(usageData.tools)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));
        const totalCount = Object.values(usageData.tools).reduce((a, b) => a + b, 0);
        const activeDays = Object.keys(usageData.dailyUsage).length;
        const allDates = Object.keys(usageData.dailyUsage).sort();
        // Daily usage for last 10 days
        const dailyTrend = allDates.slice(-10).map(date => ({
            date,
            count: Object.values(usageData.dailyUsage[date].tools || {}).reduce((a, b) => a + b, 0)
        }));
        // First and last active date
        const firstDate = allDates[0] || '';
        const lastDate = allDates[allDates.length - 1] || '';
        // Continuous active days
        let maxStreak = 0, curStreak = 0, prev = '';
        for (let i = 0; i < allDates.length; i++) {
            if (i === 0 || (new Date(allDates[i]) - new Date(prev) === 86400000)) {
                curStreak++;
            } else {
                maxStreak = Math.max(maxStreak, curStreak);
                curStreak = 1;
            }
            prev = allDates[i];
        }
        maxStreak = Math.max(maxStreak, curStreak);
        // This month/week statistics
        const now = new Date();
        const thisMonth = now.toISOString().slice(0, 7);
        const thisWeekMonday = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().slice(0, 10);
        let monthCount = 0, weekCount = 0;
        allDates.forEach(date => {
            const cnt = Object.values(usageData.dailyUsage[date].tools || {}).reduce((a, b) => a + b, 0);
            if (date.startsWith(thisMonth)) monthCount += cnt;
            if (date >= thisWeekMonday) weekCount += cnt;
        });
        // Average usage per day
        const avgPerDay = activeDays ? Math.round(totalCount / activeDays * 10) / 10 : 0;
        // Most active day
        let maxDay = { date: '', count: 0 };
        allDates.forEach(date => {
            const cnt = Object.values(usageData.dailyUsage[date].tools || {}).reduce((a, b) => a + b, 0);
            if (cnt > maxDay.count) maxDay = { date, count: cnt };
        });
        // Days since last use
        let daysSinceLast = 0;
        if (lastDate) {
            const diff = Math.floor((new Date() - new Date(lastDate)) / 86400000);
            daysSinceLast = diff > 0 ? diff : 0;
        }
        return {
            recent,
            recentDetail,
            mostUsed,
            totalCount,
            activeDays,
            dailyTrend,
            firstDate,
            lastDate,
            maxStreak,
            monthCount,
            weekCount,
            avgPerDay,
            maxDay,
            daysSinceLast,
            allDates
        };
    };
    
    return {
        init,
        recordInstallation,
        recordUpdate,
        recordToolUsage,
        getRecentUsedTools,
        getDashboardData,
        recordUninstall
    };
})();

export default Statistics; 