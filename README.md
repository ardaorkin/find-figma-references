# Figma References

A VSCode extension that automatically finds Figma references in GitHub pull requests for the currently open file. This extension scans the git history of your file and extracts Figma URLs from PR descriptions, making it easy to discover design references and related work.

## Features

### 🎯 **Smart Figma Detection**
- Automatically scans git history for Figma URLs in pull request descriptions
- Supports both `figma.com` and `figma.dev` URLs
- Filters results to only show PRs that contain Figma references

### ⚡ **High Performance**
- **Chunked Processing**: Efficiently processes large git histories in batches
- **Streaming Results**: Results appear immediately as they're found
- **Progress Tracking**: Real-time progress bar shows processing status
- **Persistent Loading**: Loading indicator remains until all processing is complete

### 🖥️ **Activity Bar Integration**
- Dedicated panel in the VSCode Activity Bar with custom icon
- Real-time updates when switching between files
- Minimalistic, clean UI that fits seamlessly with VSCode's design

### 📱 **Responsive Design**
- **Adaptive Layout**: Works perfectly in narrow Activity Bar panels
- **Smart Text Wrapping**: URLs and text wrap properly without overflow
- **Flexible Header**: Header adapts to different panel widths
- **Mobile-Friendly**: Optimized for various screen sizes

### 📁 **File-Aware Results**
- Shows results specific to the currently open file
- Displays file name in loading and results messages
- Automatically refreshes when switching files

### 🎨 **Enhanced UI/UX**
- **Figma-First Design**: Figma links prominently displayed at the top
- **Visual Hierarchy**: Clear separation between Figma URLs and GitHub PR info
- **Clean Layout**: Organized card design with proper spacing
- **Theme Integration**: Adapts to VSCode's light/dark themes

### 🔄 **Easy Refresh**
- Tertiary refresh button for manual updates
- Automatic refresh on file changes
- Loading states with file-specific messaging

## Installation

### From VSIX Package
1. Download the latest `.vsix` file from the releases
2. In VSCode, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Choose the downloaded file

### From Source
```bash
git clone https://github.com/yourusername/find-figma-references
cd find-figma-references
npm install
npm run package
```

## Usage

### Method 1: Activity Bar (Recommended)
1. Click the **Figma References** icon in the Activity Bar
2. The extension will automatically scan the current file
3. Results appear in the dedicated panel with file name context

### Method 2: Command Palette
1. Open the Command Palette (Ctrl+Shift+P)
2. Type "Find Figma References"
3. Select the command to scan the current file

### Understanding Results
Each result shows:
- **Figma URLs**: All Figma links found in the PR description (prominently displayed at the top)
- **Pull Request URL**: Direct link to the GitHub PR
- **Author**: Who created the pull request

The layout prioritizes Figma links since they're the primary purpose of this extension, making it easy to quickly identify and access design references.

## Requirements

- **VSCode**: Version 1.86.0 or higher
- **Git Repository**: The extension works with git-tracked files
- **GitHub Access**: Requires access to GitHub API (uses personal access token)

## Configuration

### GitHub Token Setup
The extension uses the GitHub API to fetch pull request details. You'll need to:

1. Create a GitHub Personal Access Token
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope
   
2. Configure the token in VSCode settings:
   ```json
   {
     "figmaReferences.githubToken": "your-github-token-here"
   }
   ```

## Development

### Project Structure
```
find-figma-references/
├── src/
│   ├── services/          # Core business logic
│   │   ├── gitService.ts
│   │   ├── githubService.ts
│   │   ├── figmaReferenceService.ts
│   │   ├── gitService.test.ts
│   │   ├── githubService.test.ts
│   │   └── figmaReferenceService.test.ts
│   ├── utils/             # Utility functions
│   │   ├── urlDetection.ts
│   │   ├── vscodeUtils.ts
│   │   ├── settingsUtils.ts
│   │   ├── urlDetection.test.ts
│   │   └── vscodeUtils.test.ts
│   ├── ui/                # User interface
│   │   ├── figmaReferenceProvider.ts
│   │   └── webview.html
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── extension.ts       # Main extension entry point
│   └── extension.test.ts  # Extension tests
├── resources/             # Extension assets
│   ├── icon.svg
│   └── icon-dark.svg
├── scripts/               # Build and development scripts
│   ├── build-with-esbuild.ts
│   ├── esbuild.config.ts
│   └── watch-with-esbuild.ts
├── mocks/                 # VSCode API mocks for testing
│   └── vscode.ts
├── dist/                  # Built extension files
│   ├── extension.cjs
│   └── ui/
│       └── webview.html
├── tests/                 # Test files (co-located with source)
└── package.json
```

### Building
```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Package for distribution
npm run package
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Features in Detail

### Performance Architecture
- **Chunked Processing**: Processes commits in batches of 5 with 100ms delays to prevent API rate limiting
- **Streaming Results**: Uses callback-based architecture for immediate result display
- **Progress Tracking**: Real-time progress updates with visual progress bar
- **Efficient Caching**: Optimized to minimize redundant API calls

### URL Detection
The extension recognizes various Figma URL formats:
- `https://figma.com/file/...`
- `https://www.figma.com/file/...`
- `https://figma.com/design/...`
- `https://www.figma.com/design/...`
- `https://figma.dev/file/...`
- `https://www.figma.dev/file/...`

### Git Integration
- Scans git log for commits that reference the current file
- Extracts pull request information from commit messages
- Handles both direct commits and merge commits
- Efficient processing of large git histories

### UI/UX Design
- **Minimalistic Design**: Clean, focused interface
- **Theme Integration**: Adapts to VSCode's light/dark themes
- **Responsive Layout**: Optimized for Activity Bar panel with proper text wrapping
- **Loading States**: Clear feedback with file-specific messages and progress indicators
- **Figma-First Layout**: Prioritizes Figma links for better user experience

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add comprehensive JSDoc comments
- Include tests for new features
- Update documentation for API changes

## Troubleshooting

### Common Issues

**"No Figma references found"**
- Ensure the file is tracked in git
- Check that PR descriptions contain Figma URLs
- Verify GitHub token has proper permissions

**"Error finding Figma references"**
- Check your GitHub token configuration
- Ensure you have access to the repository
- Verify the repository is properly cloned

**Activity Bar icon not showing**
- Reload VSCode window (Ctrl+Shift+P → "Developer: Reload Window")
- Check if the extension is properly activated

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v0.0.4 (Latest)
- **Fixed Webview HTML Packaging**: Token input UI now works in packaged VSIX
- **Improved Build Process**: Webview HTML is properly included in the extension package
- **Better File Resolution**: Extension correctly finds HTML file in both development and production

### v0.0.3
- **GitHub Token UI**: Added built-in token input in the extension panel
- **Configuration Management**: Extension-specific configuration name (`figmaReferences.githubToken`)
- **Improved Error Handling**: Better error messages and token validation
- **Auto-refresh**: Automatic refresh after token is saved
- **Enhanced UX**: Token input appears when needed, disappears when configured
- **No Loading Confusion**: Prevents loading indicator when token is missing

### v0.0.2
- **Performance Improvements**: Chunked processing and streaming results
- **Responsive Design**: Fixed text overflow in narrow containers
- **UI Enhancements**: Figma links prioritized over GitHub PR links
- **Progress Tracking**: Real-time progress bar during processing
- **Code Quality**: Removed all console logs for production readiness

### v0.0.1
- Initial release
- Basic Figma URL detection
- Activity Bar integration
- File-aware results display
- Minimalistic UI design

## Support

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for questions and ideas
- **Documentation**: Check the wiki for detailed guides

---

**Made with ❤️ for the VSCode community**
