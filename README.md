# Ricoh AI Chat

Enterprise-grade AI Chatbot and Knowledge Base Management System

## Features

- 📊 Dashboard: Real-time data visualization and process monitoring
- 💬 AI Chat: Intelligent conversation interface
- 📚 Knowledge Base Management: Document upload, search, and categorization
- 🌓 Dark Mode: Complete theme switching support
- 📱 Responsive Design: Support for all screen sizes

## Technology Stack

### Frontend Technologies
- HTML5, CSS3, JavaScript (ES6+)
- Pure Vanilla JavaScript, no framework dependencies
- CSS Variables for theming system

### External Dependencies

This project uses the following open-source libraries (loaded via CDN):

#### Chart.js
- **Version**: 4.4.6
- **Purpose**: Data visualization (pie charts, line charts, bar charts)
- **License**: MIT License
- **Source**: https://github.com/chartjs/Chart.js
- **CDN**: https://cdn.jsdelivr.net/npm/chart.js@4.4.6/

#### chartjs-plugin-datalabels
- **Version**: 2.2.0
- **Purpose**: Chart.js data labels plugin
- **License**: MIT License
- **Source**: https://github.com/chartjs/chartjs-plugin-datalabels
- **CDN**: https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/

## File Structure

```
Ricoh-AI-Chat/
├── index.html                      # Main dashboard
├── AI Chat.html                    # AI chat page
├── Knowledge_Bases.html            # Knowledge base list
├── Knowledge_Bases_Details.html    # Knowledge base details
├── styles.css                      # Main stylesheet
├── dark-mode.css                   # Dark mode styles
├── ai-chat.css                     # Chat page styles
├── knowledge-bases.css             # Knowledge base styles
├── knowledge-bases-details.css     # Knowledge base details styles
├── script.js                       # Main functionality script
├── ai-chat.js                      # Chat functionality
├── knowledge-bases.js              # Knowledge base functionality
├── knowledge-bases-details.js      # Details page functionality
├── pagination.js                   # Pagination functionality
└── assets/                         # Image resources
    ├── Ricoh_Logo.png
    └── [Other icon files]
```

## Installation and Usage

### Run Locally

1. Clone or download the project
2. Open the project using any HTTP server
3. Open `index.html` directly

### Recommended Local Servers

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License Information

### Third-Party Licenses

This project uses open-source libraries under the following license terms:

**MIT License** (Chart.js & chartjs-plugin-datalabels)
```
Copyright (c) 2014-2022 Chart.js Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Project Code

All custom code is copyright © Ricoh Hong Kong Limited. All rights reserved.

---

© 2026 Ricoh Hong Kong Limited. All rights reserved.
