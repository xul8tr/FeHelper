/**
 * FeHelper MSG_TYPE
 */
const MSG_TYPE = {

    // Official chrome extension id
    STABLE_EXTENSION_ID:'pkgccpejnmalmdinmhkkfafefagiiiad',
    // Download address on github
    DOWNLOAD_FROM_GITHUB:'https://github.com/zxlie/FeHelper/tree/master/apps/static/screenshot/crx',

    // Code standards detection
    CODE_STANDARDS: "code_standards",
    FCP_HELPER_INIT: "fcp_helper_init",
    FCP_HELPER_DETECT: "fcp_helper_detect",
    //Extract CSS
    GET_CSS: "get-css",
    //Extract JS
    GET_JS: "get-js",
    //Extract HTML
    GET_HTML: "get-html",
    //cookie
    GET_COOKIE: 'get-cookie',
    //remove cookie
    REMOVE_COOKIE: 'remove-cookie',
    //set cookie
    SET_COOKIE: 'set-cookie',

    //css ready...
    CSS_READY: 'css-ready',

    //js ready...
    JS_READY: 'js-ready',

    //html ready...
    HTML_READY: 'html-ready',
    //all ready...
    ALL_READY: 'all-ready',

    //get options
    GET_OPTIONS: 'get_options',
    //set options
    SET_OPTIONS: 'set_options',
    // MENU SAVED
    MENU_SAVED: 'menu_saved',

    //Startup option
    START_OPTION: 'start-option',
    //Start FCPHelper
    OPT_START_FCP: 'opt-item-fcp',

    //Calculate page load time
    CALC_PAGE_LOAD_TIME: "calc-page-load-time",
    //Page related performance data
    GET_PAGE_WPO_INFO: 'get_page_wpo_info',

    //View load time
    SHOW_PAGE_LOAD_TIME: "wpo",

    TAB_CREATED_OR_UPDATED: 'tab_created_or_updated',

    ////////////////////Below are menus in popup, value same as filename///////////////////
    REGEXP_TOOL: 'regexp',
    //String encode/decode
    EN_DECODE: 'en-decode',
    //JSON viewer
    JSON_FORMAT: 'json-format',
    //QR generator
    QR_CODE: 'qr-code',
    //Code beautify
    CODE_BEAUTIFY: 'code-beautify',
    JS_CSS_PAGE_BEAUTIFY:'JS_CSS_PAGE_BEAUTIFY',
    JS_CSS_PAGE_BEAUTIFY_REQUEST:'JS_CSS_PAGE_BEAUTIFY_REQUEST',
    //Code compress
    CODE_COMPRESS: 'code-compress',
    // Time conversion
    TIME_STAMP: 'timestamp',
    // Image base64
    IMAGE_BASE64: 'image-base64',
    // Random password generation
    RANDOM_PASSWORD:'password',
    // QR code decode
    QR_DECODE: 'qr-decode',

    // JSON comparison
    JSON_COMPARE:'json-diff',
    // JSON page auto format
    JSON_PAGE_FORMAT: 'JSON_PAGE_FORMAT',
    JSON_PAGE_FORMAT_REQUEST: 'JSON_PAGE_FORMAT_REQUEST',
    //Page color picker
    COLOR_PICKER: "color-picker:newImage",
    SHOW_COLOR_PICKER: "show_color_picker",

    // ajax debugger
    AJAX_DEBUGGER: "ajax-debugger",
    AJAX_DEBUGGER_CONSOLE: "ajax-debugger-console",
    AJAX_DEBUGGER_SWITCH: "ajax-debugger-switch",

    HTML_TO_MARKDOWN: "html2markdown",
    PAGE_CAPTURE:'page-capture',
    PAGE_CAPTURE_SCROLL:"page_capture_scroll",
    PAGE_CAPTURE_CAPTURE:"page_capture_capture",

    // Sticky notes
    STICKY_NOTES: 'sticky-notes',

    // Dev tools page
    DEV_TOOLS: 'dev-tools',

    OPEN_OPTIONS_PAGE:'open-options-page',

    // Grid ruler
    GRID_RULER: 'grid-ruler',

    // POST Man
    POST_MAN:'postman',

    // Multi toolkit
    MULTI_TOOLKIT: 'toolkit',

    // Open page-monkey config page
    PAGE_MODIFIER:'page-monkey',
    // Get page-monkey config for a url
    GET_PAGE_MODIFIER_CONFIG:'get_page_modifier_config',
    // Save page-monkey config
    SAVE_PAGE_MODIFIER_CONFIG:'save_page_modifier_config',
    // page-config local cache key
    PAGE_MODIFIER_KEY:'PAGE-MODIFIER-LOCAL-STORAGE-KEY',

    // Remove person image background
    REMOVE_PERSON_IMG_BG:'remove-person-img-bg',
    REMOVE_BG:'remove-bg'
};

(typeof module === 'object') ? module.exports = MSG_TYPE : '';
