let toolMap = {
    'json-format': {
        name: 'JSON Beautifier',
        tips: 'Auto-detect and format pages, manual formatting, decode garbled text, sorting, BigInt support, editing, downloading, skin customization, etc.',
        contentScriptJs: true,
        contentScriptCss: true,
        systemInstalled: true,
        menuConfig: [{
            icon: '⒥',
            text: 'JSON Format',
            contexts: ['page', 'selection', 'editable']
        }]
    },
    'json-diff': {
        name: 'JSON Comparison Tool',
        tips: 'Supports automatic key-value comparison of two JSON contents, highlights differences, and validates JSON syntax',
        menuConfig: [{
            icon: '☷',
            text: 'JSON Comparator'
        }]
    },
    'qr-code': {
        name: 'QR Code Generator/Decoder',
        tips: 'QR code generator with custom colors and icons, supports multiple decoding modes including screenshot paste decoding',
        contentScriptJs: true,
        menuConfig: [{
            icon: '▣',
            text: 'QR Code Generator',
            contexts: ['page', 'selection', 'editable', 'link', 'image']
        }, {
            icon: '◈',
            text: 'QR Code Decoder',
            contexts: ['image']
        }]
    },
    'image-base64': {
        name: 'Image to Base64',
        tips: 'Supports various modes for converting images to Base64 format, such as link paste/screenshot paste, also supports converting Base64 data back to images',
        menuConfig: [{
            icon: '▤',
            text: 'Image & Base64',
            contexts: ['image']
        }]
    },
    'en-decode': {
        name: 'Information Encoding Converter',
        tips: 'Supports multi-format information encoding/decoding, such as Unicode, UTF-8, UTF-16, URL, Base64, MD5, Hex, Gzip, etc.',
        menuConfig: [{
            icon: '♨',
            text: 'String Encode/Decode',
            contexts: ['page', 'selection', 'editable']
        }]
    },
    'code-beautify': {
        name: 'Code Beautifier',
        tips: 'Supports multi-language code beautification, including Javascript, CSS, HTML, XML, SQL, with more formats to be added',
        contentScriptJs: true,
        contentScriptCss: true,
        menuConfig: [{
            icon: '✡',
            text: 'Code Beautifier',
            contexts: ['page', 'selection', 'editable']
        }]
    },
    'code-compress': {
        name: 'Code Compressor',
        tips: 'For web development, provides simple code compression for HTML, Javascript, and CSS',
        menuConfig: [{
            icon: '♯',
            text: 'Code Compressor'
        }]
    },
    'aiagent': {
        name: 'AI Assistant',
        tips: 'AI-powered super-intelligent conversation tool that can help you write code, modify code, design solutions, search information, perform analysis, etc.',
        menuConfig: [{
            icon: '֍',
            text: 'AI Assistant'
        }]
    },
    'timestamp': {
        name: 'Timestamp Converter',
        tips: 'Mutual conversion between local time and timestamps, supports seconds/milliseconds, world timezone switching, timezone clock display, etc.',
        menuConfig: [{
            icon: '♖',
            text: 'Timestamp Converter'
        }]
    },
    'password': {
        name: 'Random Password Generator',
        tips: 'Randomly combines various characters to generate passwords, can consist of numbers, uppercase/lowercase letters, special symbols, supports custom length',
        menuConfig: [{
            icon: '♆',
            text: 'Random Password Generator'
        }]
    },
    'sticky-notes': {
        name: 'My Sticky Notes',
        tips: 'Convenient browser sticky note tool, supports creating directories for note categorization, one-click export/import of notes',
        menuConfig: [{
            icon: '✐',
            text: 'My Sticky Notes'
        }]
    },
    'html2markdown': {
        name: 'Markdown Converter',
        tips: 'Markdown writing/preview tool, supports direct HTML to Markdown conversion, supports downloading content in PDF format',
        menuConfig: [{
            icon: 'ⓜ',
            text: 'Markdown Tool'
        }]
    },
    'postman': {
        name: 'Simple Postman',
        tips: 'API debugging tool for development, supports GET/POST/HEAD request methods, with automatic JSON formatting',
        menuConfig: [{
            icon: '☯',
            text: 'Simple Postman'
        }]
    },
    'websocket': {
        name: 'WebSocket Tool',
        tips: 'Supports WebSocket interface packet capture testing, including ws service connection testing, message sending testing, result analysis, etc.',
        menuConfig: [{
            icon: 'ⓦ',
            text: 'WebSocket Tool'
        }]
    },
    'regexp': {
        name: 'RegExp Quick Reference',
        tips: 'Supports regex quick reference for JavaScript/Python/PHP/Java, includes validation, extraction, replacement, formatting, special characters, programming-related common regex patterns',
        menuConfig: [{
            icon: '✙',
            text: 'RegExp Quick Reference'
        }]
    },
    'trans-radix': {
        name: 'Radix Converter',
        tips: 'Supports arbitrary conversion between base 2 to base 36, such as decimal to binary, octal to hexadecimal, etc.',
        menuConfig: [{
            icon: '❖',
            text: 'Radix Converter'
        }]
    },
    'trans-color': {
        name: 'Color Converter',
        tips: 'Supports mutual conversion between HEX and RGB color formats, e.g. HEX color \'#43ad7f\' converts to \'rgb(67, 173, 127)\'',
        menuConfig: [{
            icon: '▶',
            text: 'Color Converter'
        }]
    },
    'crontab': {
        name: 'Crontab Tool',
        tips: 'A simple Crontab generator tool, supports random demo generation, with minute/hour/day/month/week highlighting during editing',
        menuConfig: [{
            icon: '½',
            text: 'Crontab Tool'
        }]
    },
    'loan-rate': {
        name: 'Loan Interest Calculator',
        tips: 'Calculator for loan or repayment interest rates, presents monthly repayment plan; supports reverse calculation of actual loan interest rate from repayment amount',
        menuConfig: [{
            icon: '$',
            text: 'Loan Interest Calculator'
        }]
    },
    'devtools': {
        name: 'FH Developer Tools',
        tips: 'With a development platform approach, FeHelper supports users in local development, integrating their own plugin features into the FH tool marketplace',
        menuConfig: [{
            icon: '㉿',
            text: 'FH Developer Tools'
        }]
    },
    'page-monkey': {
        name: 'Page Monkey Tool',
        tips: 'Configure page matching rules and write hack scripts to implement webpage hacks, such as automatic page refresh, automatic ticket grabbing, etc.',
        contentScriptJs: true,
        menuConfig: [{
            icon: '♀',
            text: 'Page Monkey Tool'
        }]
    },
    'screenshot': {
        name: 'Web Screenshot Tool',
        tips: 'Screenshot any webpage, supports visible area capture and full page scrolling capture, with preview before saving',
        contentScriptJs: true,
        noPage: true,
        menuConfig: [{
            icon: '✂',
            text: 'Web Screenshot Tool'
        }]
    },
    'mock-data': {
        name: 'Data Mock Tool',
        tips: 'Quickly generate various test data, supports personal information, business data, technical data and other types, customizable fields and output formats',
        menuConfig: [{
            icon: '⟡',
            text: 'Data Mock Tool'
        }]
    },
    'color-picker': {
        name: 'Color Picker Tool',
        tips: 'Directly collect color values from any element on a webpage, move cursor to the desired color position and click to confirm',
        contentScriptJs: true,
        noPage: true,
        menuConfig: [{
            icon: '✑',
            text: 'Color Picker Tool'
        }]
    },
    'naotu': {
        name: 'Mind Map Tool',
        tips: 'Lightweight and convenient, ready to use anytime, supports auto-save, local data storage, batch data import/export, image format download, etc.',
        menuConfig: [{
            icon: 'Ψ',
            text: 'Mind Map Tool'
        }]
    },
    'grid-ruler': {
        name: 'Web Grid Ruler',
        tips: 'For web development, horizontal and vertical rulers in 10px units, used to detect & calibrate grid alignment of current webpage',
        contentScriptJs: true,
        contentScriptCss: true,
        noPage: true,
        menuConfig: [{
            icon: 'Ⅲ',
            text: 'Web Grid Ruler'
        }]
    },
    'page-timing': {
        name: 'Website Performance Optimizer',
        tips: 'Comprehensive analysis of webpage performance metrics, including Core Web Vitals (LCP/FID/CLS), resource loading performance, memory usage, long task monitoring, etc., with targeted optimization suggestions',
        contentScriptJs: true,
        noPage: true,
        menuConfig: [{
            icon: 'Σ',
            text: 'Website Performance Optimizer'
        }]
    },
    'excel2json': {
        name: 'Excel to JSON',
        tips: 'Convert data from Excel or CSV directly into structured data formats such as JSON, XML, MySQL, PHP, etc. (By @hpng)',
        menuConfig: [{
            icon: 'Ⓗ',
            text: 'Excel to JSON'
        }]
    },
    'chart-maker': {
        name: 'Chart Maker Tool',
        tips: 'Quickly create various data visualization charts, supports bar charts, line charts, pie charts and other chart types, exportable as image formats',
        menuConfig: [{
            icon: '📊',
            text: 'Chart Maker Tool'
        }]
    },
    'svg-converter': {
        name: 'SVG to Image',
        tips: 'Supports SVG file conversion to PNG, JPG, WEBP and other formats, customizable output dimensions, supports file drag-and-drop and URL import',
        menuConfig: [{
            icon: '⇲',
            text: 'SVG to Image Tool'
        }]
    },
    'poster-maker': {
        name: 'Poster Quick Generator',
        tips: 'Quickly create marketing posters, supports templates for WeChat Moments, Xiaohongshu and others, customizable text, images and color schemes',
        menuConfig: [{
            icon: '🖼️',
            text: 'Poster Quick Generator'
        }]
    },
    'datetime-calc': {
        name: 'Timestamp Calculator',
        tips: 'Supports multiple time format parsing, batch conversion, timezone conversion, database format generation and other advanced time processing features',
        menuConfig: [{
            icon: '⏱️',
            text: 'Timestamp Calculator',
            contexts: ['page', 'selection', 'editable']
        }]
    }
};

// Check if it's Firefox browser, if yes remove specific tools
if (navigator.userAgent.indexOf('Firefox') !== -1) {
    delete toolMap['color-picker'];
    delete toolMap['postman'];
    delete toolMap['devtools'];
    delete toolMap['websocket'];
    delete toolMap['page-timing'];
    delete toolMap['grid-ruler'];
    delete toolMap['naotu'];
    delete toolMap['screenshot'];
    delete toolMap['page-monkey'];
    delete toolMap['excel2json'];
}

export default toolMap;