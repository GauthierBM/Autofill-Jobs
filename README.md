# Autofill Jobs

A powerful browser extension to automatically fill in job applications, rebuilt with intelligent features, modern UI, and cross-browser compatibility.

This project represents a complete evolution of job application automation, featuring intelligent answer management, document management, standalone mode, and robust cross-platform support.

## Key Features

### Intelligent Answer Management
- **Smart Answer Clustering**: Groups similar questions (like *"Why this role?"* and *"What makes you a good fit?"*) together
- **Context-Aware Suggestions**: Understands question meaning, not just keywords
- **Semantic Matching**: Uses advanced algorithms to find the most relevant saved answers
- **Fallback Matching**: Gracefully handles strict security policies with word-overlap matching

### Document Management System
- **Multiple Document Support**: Upload and manage multiple resumes, cover letters, and other documents
- **Document Types**: Support for resumes, cover letters, certificates, and custom documents
- **Tag-Based Organization**: Organize documents with custom tags for different job applications
- **Active Document Selection**: Set different documents as active for specific applications

### Standalone Mode
- **Independent Operation**: Works outside browser extension limitations
- **Full-Screen Interface**: Dedicated document management workspace
- **Cross-Browser Compatibility**: Consistent experience across Chrome and Firefox
- **Reliable Uploads**: Better file upload experience without extension constraints

### Cross-Browser Compatibility
- **Chrome Support**: Full Manifest V3 compatibility
- **Firefox Support**: Native Firefox API integration with fallback to Chrome APIs
- **Automatic Detection**: Smart API detection for seamless cross-browser operation
- **Consistent Experience**: Same features and functionality across browsers

### Custom Website Support
- **Input Detection**: Automatically detects input fields on any job board
- **Custom Configuration**: Define what questions specific inputs answer
- **Visual Configuration**: Interactive input selection and mapping
- **Unlimited Sites**: Support for any job application website

### Smart Form Features
- **Resume Parsing**: Automatic population of skills and work experience from resume (Google Gemini API)
- **API Integration**: Optional AI-powered form completion
- **Privacy Controls**: Toggle privacy features on/off
- **Auto-Save**: Automatic saving of all form data

## Supported Platforms

### Job Boards
- **Greenhouse** - Full support with advanced field detection
- **Lever** - Complete form automation
- **Workday** - Enterprise job application support
- **Dover** - Specialized platform integration
- **Ashby** - Modern job board support
- **Custom Websites** - Any job application site

### Browsers
- **Chrome/Chromium** - Manifest V3, full feature support
- **Firefox** - Manifest V3, version 109+, native API support
- **Edge** - Chromium-based, Chrome compatible
- **Brave** - Chromium-based, Chrome compatible

## Installation

### Chrome/Chromium/Edge/Brave
1. Clone or download this repository
2. Navigate to the `src` directory: `cd src`
3. Install dependencies: `npm install`
4. Build the extension: `npm run build`
5. Open your browser, navigate to `chrome://extensions`
6. Enable "Developer mode" (toggle in top right)
7. Click "Load unpacked" and select the `dist` folder

### Firefox
1. Clone or download this repository
2. Navigate to the `src` directory: `cd src`
3. Install dependencies: `npm install`
4. Build the extension: `npm run build`
5. Open Firefox and navigate to `about:debugging`
6. Click "This Firefox" in the left sidebar
7. Click "Load Temporary Add-on" and select the `dist/manifest.json` file

### Firefox Troubleshooting
- **Background Script Issues**: Uses `background.scripts` format for Firefox compatibility
- **API Detection**: Automatic browser API detection for cross-browser support
- **Storage**: Uses appropriate storage APIs for each browser

## Usage Guide

### Getting Started
1. **Pin Extension**: Click the puzzle icon in your toolbar and pin Autofill Jobs
2. **Open Popup**: Click the extension icon to open the configuration interface
3. **Fill Personal Details**: Enter your basic information (name, email, phone, etc.)
4. **Configure Documents**: Use Document Manager to upload resumes and cover letters
5. **Set Up Experience**: Add work experience and skills manually or via resume parsing

### Document Management
1. **Open Document Manager**: Click "Manage Documents" in the main interface
2. **Upload Documents**: Add resumes, cover letters, and other files
3. **Organize with Tags**: Create tags for different job types or companies
4. **Set Active Documents**: Choose which documents to use for applications
5. **Use Standalone Mode**: For better upload experience, click the standalone link

### Custom Website Configuration
1. **Open Custom Website**: Click "Add Custom Website Support"
2. **Enter Website URL**: Provide the job board URL you want to configure
3. **Start Input Detection**: Click the detection button and navigate to the website
4. **Select Input Fields**: Click on form fields you want to configure
5. **Define Questions**: Specify what questions each input field answers
6. **Save Configuration**: Store your configuration for future use

### Using on Job Sites
1. **Navigate to Job Application**: Go to any supported job board
2. **Extension Auto-Detects**: The extension will automatically identify form fields
3. **Review Suggestions**: Check the suggested answers and modify if needed
4. **Apply Answers**: Use the suggested answers to fill the form
5. **Save New Answers**: Any new answers you provide are automatically saved

## Development

### Tech Stack
- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern, responsive design
- **Build Tool**: Vite for fast development and building
- **Browser APIs**: Chrome Extension APIs with Firefox compatibility

### Project Structure
```
src/
├── public/                 # Extension files
│   ├── background.js      # Background script with cross-browser support
│   ├── manifest.json      # Extension manifest
│   ├── contentScripts/    # Content scripts for different job boards
│   └── standalone.html    # Standalone mode interface
├── vue_src/               # Vue.js application
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   └── types/            # TypeScript definitions
└── dist/                  # Built extension files
```

### Development Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch for changes (development)
npm run watch

# Build only (no watching)
npm run build-only
```

### Browser-Specific Development
- **Chrome**: Reload extension in `chrome://extensions` after changes
- **Firefox**: Reload extension in `about:debugging` after changes
- **Testing**: Test on both browsers for cross-browser compatibility

## Troubleshooting

### Common Issues

#### Upload Not Working
- **Firefox**: Check browser console for background script errors
- **Chrome**: Verify storage permissions are granted
- **Solution**: Use standalone mode for better upload experience

#### Extension Not Loading
- **Firefox**: Ensure you're using version 109+ for Manifest V3 support
- **Chrome**: Check that Developer mode is enabled
- **Both**: Verify manifest.json syntax is correct

#### Form Not Filling
- **Check Site Support**: Ensure the job board is supported
- **Custom Configuration**: Use custom website feature for unsupported sites
- **Content Script**: Check browser console for content script errors

#### Storage Issues
- **Permissions**: Ensure storage permissions are granted
- **Browser Console**: Use F12 to check for storage errors
- **Cross-Browser**: Verify API detection is working

### Debugging Steps
1. **Open Browser Console**: F12 → Console tab
2. **Check Network Requests**: F12 → Network tab
3. **Inspect Storage**: F12 → Storage → Extension Storage
4. **View Extension Details**: 
   - Chrome: `chrome://extensions` → Details → Inspect
   - Firefox: `about:debugging` → Inspect

## Contributing

Contributions are welcome! Please ensure:
1. **Cross-Browser Compatibility**: Test on both Chrome and Firefox
2. **TypeScript**: Use proper TypeScript typing
3. **Vue 3**: Follow Vue 3 Composition API patterns
4. **Documentation**: Update this README for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Resources

### Chrome Extension Development
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)

### Firefox Extension Development
- [Firefox Extension Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Firefox Manifest V3 Support](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Manifest_V3)

### Vue.js Development
- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)

---

**Autofill Jobs** - Making job applications faster, smarter, and more reliable across all browsers and platforms.
