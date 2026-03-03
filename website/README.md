# FeHelper Official Website

This is the official website for the FeHelper Chrome/Edge browser extension.

## Project Features

- 🎨 **Modern Design**: Uses gradient colors and smooth animations to showcase a "major release" visual effect
- 📱 **Fully Responsive**: Adapts to various device screens, providing a consistent user experience
- ⚡ **Performance Optimized**: Uses system fonts with no external font dependencies, extremely fast loading speed
- 🎯 **Intuitive Functionality**: Visualizes each tool's functionality through HTML+CSS, no screenshots needed
- 🔗 **Real-time Data**: Automatically retrieves GitHub stars and forks data
- 🌏 **China-friendly**: All resources are accessible normally in China

## Technical Implementation

### Font Strategy
- **System Font Stack**: Uses high-quality system fonts with full Chinese and English support
- **Font Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif`
- **No External Dependencies**: Completely avoids external font services like Google Fonts, ensuring stable access in China

### Visual Demonstrations
- **JSON Tool**: Code syntax highlighting
- **Diff Comparison**: Color-coded additions, deletions, and modifications
- **Code Compression**: Dynamic compression ratio display
- **QR Code**: CSS-drawn QR code pattern
- **API Debugging**: Simulated request-response status

### Interactive Effects
- **Tab Switching**: Tool category display
- **Scroll Animation**: Intersection Observer API
- **Hover Effects**: 3D transforms and shadows
- **Parallax Scrolling**: Background pattern animations
- **Count Animation**: GitHub data animation effects

## File Structure

```
website/
├── index.html              # Main page (498 lines)
├── css/
│   └── style.css          # Stylesheet (1267 lines)
├── js/
│   └── script.js          # Interactive script (394 lines)
├── img/                    # Icon resources
│   ├── favicon.ico         # Website icon
│   ├── fe-16.png          # 16x16 FeHelper icon
│   ├── fe-48.png          # 48x48 FeHelper icon
│   └── fe-128.png         # 128x128 FeHelper icon
└── README.md              # Project description
```

## Local Development

1. Clone the project locally
2. Enter the website directory
3. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open browser and visit `http://localhost:8000`

## Browser Support

- Chrome 60+
- Edge 79+
- Firefox 60+
- Safari 12+

## Deployment

Can be deployed to any static website hosting service:
- GitHub Pages
- Netlify
- Vercel
- Tencent Cloud Static Website Hosting
- Alibaba Cloud OSS Static Website

## Update Log

### v2.2 (2024-12-19)
- 📊 Updated real data: GitHub 5.3K stars, 1.3K forks, Chrome Store 200K+ users
- 🦊 Added Firefox browser support and download options
- 📖 Added "About FeHelper" timeline, showcasing 13 years of development
- 🔗 Updated all browser store links and rating data
- ✨ Optimized GitHub data retrieval logic, providing real default values

### v2.1 (2024-12-19)
- 🎨 Added FeHelper official icon to website
- 🔖 Updated favicon and multi-size icons
- ✨ Replaced icons in navigation bar, footer, badges, etc.
- 🚀 Enhanced brand visual recognition

### v2.0 (2024-12-19)
- ✅ Removed Google Fonts dependency, switched to system fonts
- ✅ Optimized access experience in China
- ✅ Improved page loading speed
- ✅ Enhanced font display compatibility

### v1.0 (2024-12-19)
- 🎉 Initial release
- 🎨 Modern gradient design
- 📱 Responsive layout adaptation
- 🔧 Functional tool visualization
- 📊 GitHub data integration

## License

MIT License - See LICENSE file for details 