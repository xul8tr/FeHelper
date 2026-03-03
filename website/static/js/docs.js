document.addEventListener('DOMContentLoaded', function() {
    // Tool name mapping (filename to tool name)
    const toolNameMap = {
        'json-format': 'JSON Beautifier',
        'json-diff': 'JSON Diff Tool',
        'code-beautify': 'Code Beautifier',
        'code-compress': 'Code Compressor',
        'postman': 'Simple Postman',
        'websocket': 'Websocket Tool',
        'regexp': 'RegExp Quick Reference',
        'page-timing': 'Website Performance',
        'en-decode': 'Encode/Decode',
        'trans-radix': 'Radix Converter',
        'timestamp': 'Timestamp Converter',
        'trans-color': 'Color Converter',
        'qr-code': 'QR Code Generator/Decoder',
        'image-base64': 'Image to Base64',
        'svg-converter': 'SVG to Image',
        'chart-maker': 'Chart Maker',
        'poster-maker': 'Poster Generator',
        'screenshot': 'Screenshot Tool',
        'color-picker': 'Color Picker',
        'aiagent': 'AI Assistant',
        'sticky-notes': 'Sticky Notes',
        'html2markdown': 'Markdown Converter',
        'page-monkey': 'Page Monkey',
        'crontab': 'Crontab Tool',
        'loan-rate': 'Loan Rate Calculator',
        'password': 'Password Generator',
        'devtools': 'FH Developer Tools',
        'index': 'Documentation Home',
        'grid-ruler': 'Grid Ruler',
        'excel2json': 'Excel to JSON',
        'naotu': 'Mind Map'
    };
    
    // Tool category mapping
    const toolCategoryMap = {
        'dev': ['json-format', 'json-diff', 'code-beautify', 'code-compress', 'postman', 'websocket', 'regexp', 'page-timing', 'devtools'],
        'encode': ['en-decode', 'trans-radix', 'timestamp', 'trans-color'],
        'image': ['qr-code', 'image-base64', 'svg-converter', 'chart-maker', 'poster-maker', 'screenshot', 'color-picker'],
        'productivity': ['aiagent', 'sticky-notes', 'html2markdown', 'page-monkey', 'naotu'],
        'calculator': ['crontab', 'loan-rate', 'password'],
        'other': ['grid-ruler', 'excel2json']
    };

    // Get URL parameters
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    // Initialize marked parser
    const markedOptions = {
        gfm: true,
        breaks: true,
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    };
    
    // Load tool list
    async function loadToolList() {
        try {
            const toolListElement = document.getElementById('tool-list');
            
            // Create "Documentation Home" link
            const indexItem = document.createElement('li');
            const indexLink = document.createElement('a');
            indexLink.href = '?tool=index';
            indexLink.textContent = 'Documentation Home';
            indexLink.dataset.tool = 'index';
            indexItem.appendChild(indexLink);
            toolListElement.innerHTML = '';
            toolListElement.appendChild(indexItem);
            
            // Create tool list by category
            const categories = {
                'dev': 'Development Tools',
                'encode': 'Encode/Decode Tools',
                'image': 'Image Processing Tools',
                'productivity': 'Productivity Tools',
                'calculator': 'Calculator Tools',
                'other': 'Other Tools'
            };
            
            // Iterate through categories
            for (const [category, categoryName] of Object.entries(categories)) {
                // Create category header
                const categoryHeader = document.createElement('li');
                categoryHeader.innerHTML = `<h3 style="padding: 15px 20px 5px; margin: 10px 0 0; font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">${categoryName}</h3>`;
                toolListElement.appendChild(categoryHeader);
                
                // Get tools in this category
                const tools = toolCategoryMap[category] || [];
                
                // Create tool links
                for (const tool of tools) {
                    if (toolNameMap[tool]) {
                        const toolItem = document.createElement('li');
                        const toolLink = document.createElement('a');
                        toolLink.href = `?tool=${tool}`;
                        toolLink.textContent = toolNameMap[tool];
                        toolLink.dataset.tool = tool;
                        toolItem.appendChild(toolLink);
                        toolListElement.appendChild(toolItem);
                    }
                }
            }
            
            // Add click event to all tool links
            const toolLinks = document.querySelectorAll('.tool-list a');
            toolLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tool = this.dataset.tool;
                    history.pushState(null, null, `?tool=${tool}`);
                    loadToolDoc(tool);
                    
                    // Update active state
                    toolLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Auto-close sidebar on mobile devices
                    if (window.innerWidth <= 768) {
                        document.body.classList.remove('sidebar-open');
                        document.body.classList.add('sidebar-closed');
                    }
                });
            });
            
            // Load specified tool documentation based on URL parameter
            const selectedTool = getQueryParam('tool') || 'index';
            const activeLink = document.querySelector(`.tool-list a[data-tool="${selectedTool}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            loadToolDoc(selectedTool);
            
        } catch (error) {
            console.error('Failed to load tool list:', error);
            document.getElementById('tool-list').innerHTML = '<p style="padding: 20px; color: #ef4444;">Failed to load tool list. Please refresh the page and try again.</p>';
        }
    }
    
    // Load tool documentation
    async function loadToolDoc(toolId) {
        const docContainer = document.getElementById('doc-container');
        docContainer.innerHTML = '<div class="loader"><div class="loader-spinner"></div></div>';
        
        try {
            const response = await fetch(`docs/${toolId}.md`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdownText = await response.text();
            const htmlContent = marked.parse(markdownText, markedOptions);
            
            // Add title and tags
            const toolName = toolNameMap[toolId] || toolId;
            let category = '';
            
            // Determine tool category
            for (const [cat, tools] of Object.entries(toolCategoryMap)) {
                if (tools.includes(toolId)) {
                    switch(cat) {
                        case 'dev': category = 'Development Tools'; break;
                        case 'encode': category = 'Encode/Decode Tools'; break;
                        case 'image': category = 'Image Processing Tools'; break;
                        case 'productivity': category = 'Productivity Tools'; break;
                        case 'calculator': category = 'Calculator Tools'; break;
                        case 'other': category = 'Other Tools'; break;
                    }
                    break;
                }
            }
            
            const docHeader = `
                <div class="doc-header">
                    <h1>${toolName}</h1>
                    ${category ? `<div class="tool-tags"><span class="doc-tag">${category}</span></div>` : ''}
                </div>
            `;
            
            docContainer.innerHTML = `
                ${toolId !== 'index' ? docHeader : ''}
                <div class="doc-content">${htmlContent}</div>
            `;
            
            // Auto-scroll to top after loading documentation
            window.scrollTo(0, 0);
            
            // Add click event to links in documentation
            const docLinks = docContainer.querySelectorAll('a[href^="../"]');
            docLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.startsWith('../') && href.endsWith('.md')) {
                    const toolPath = href.replace('../', '').replace('.md', '');
                    link.href = `?tool=${toolPath}`;
                    
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        history.pushState(null, null, this.href);
                        loadToolDoc(toolPath);
                        
                        // Update sidebar active state
                        const toolLinks = document.querySelectorAll('.tool-list a');
                        toolLinks.forEach(l => l.classList.remove('active'));
                        const activeLink = document.querySelector(`.tool-list a[data-tool="${toolPath}"]`);
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    });
                }
            });
            
        } catch (error) {
            console.error('Failed to load documentation:', error);
            docContainer.innerHTML = `
                <div class="doc-header">
                    <h1>Failed to Load Documentation</h1>
                </div>
                <div class="doc-content">
                    <p>Sorry, failed to load documentation. Please refresh the page and try again or return to <a href="?tool=index">Documentation Home</a>.</p>
                    <p>Error message: ${error.message}</p>
                </div>
            `;
        }
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-docs');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const toolLinks = document.querySelectorAll('.tool-list a');
        
        toolLinks.forEach(link => {
            const toolName = link.textContent.toLowerCase();
            if (toolName.includes(searchTerm) || searchTerm === '') {
                link.parentElement.style.display = 'block';
            } else {
                link.parentElement.style.display = 'none';
            }
        });
        
        // Hide/show category headers
        const categoryHeaders = document.querySelectorAll('.tool-list h3');
        categoryHeaders.forEach(header => {
            const nextSibling = header.parentElement.nextElementSibling;
            let hasVisibleTools = false;
            
            // Check if there are visible tools under this category
            let current = nextSibling;
            while (current && !current.querySelector('h3')) {
                if (current.style.display !== 'none') {
                    hasVisibleTools = true;
                    break;
                }
                current = current.nextElementSibling;
            }
            
            header.parentElement.style.display = hasVisibleTools ? 'block' : 'none';
        });
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    // Initialize sidebar state
    function initSidebarState() {
        if (window.innerWidth <= 768) {
            document.body.classList.add('sidebar-closed');
            document.body.classList.remove('sidebar-open');
            if (sidebarToggle) {
                sidebarToggle.style.display = 'flex';
                sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        } else {
            document.body.classList.add('sidebar-open');
            document.body.classList.remove('sidebar-closed');
            if (sidebarToggle) {
                sidebarToggle.style.display = 'none';
            }
        }
    }
    
    // Initialize on page load
    initSidebarState();
    
    // Sidebar toggle button click event
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (document.body.classList.contains('sidebar-open')) {
                document.body.classList.remove('sidebar-open');
                document.body.classList.add('sidebar-closed');
                this.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                document.body.classList.add('sidebar-open');
                document.body.classList.remove('sidebar-closed');
                this.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
    }
    
    // Listen for window resize
    window.addEventListener('resize', function() {
        initSidebarState();
    });
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialize
    loadToolList();
    
    // Sync navigation bar
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}); 

