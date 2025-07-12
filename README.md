# Figma References

A VSCode extension that automatically finds Figma references in GitHub pull requests for the currently open file. This extension scans the git history of your file and extracts Figma URLs from PR descriptions, making it easy to discover design references and related work.

## Features

### 🎯 **Smart Figma Detection**
- Automatically scans git history for Figma URLs in pull request descriptions
- Supports both `figma.com` and `figma.dev` URLs
- Filters results to only show PRs that contain Figma references

### 🖥️ **Activity Bar Integration**
- Dedicated panel in the VSCode Activity Bar with custom icon
- Real-time updates when switching between files
- Minimalistic, clean UI that fits seamlessly with VSCode's design

### 📁 **File-Aware Results**
- Shows results specific to the currently open file
- Displays file name in loading and results messages
- Automatically refreshes when switching files

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
- **Pull Request URL**: Direct link to the GitHub PR
- **Author**: Who created the pull request
- **Figma URLs**: All Figma links found in the PR description

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
│   │   └── figmaReferenceService.ts
│   ├── utils/             # Utility functions
│   │   ├── urlDetection.ts
│   │   └── vscodeUtils.ts
│   ├── ui/                # User interface
│   │   ├── figmaReferenceProvider.ts
│   │   └── webview.html
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── extension.ts       # Main extension entry point
├── assets/                # Extension assets
│   └── icon.svg
├── tests/                 # Test files
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

### URL Detection
The extension recognizes various Figma URL formats:
- `https://figma.com/file/...`
- `https://www.figma.com/file/...`
- `https://figma.dev/file/...`
- `https://www.figma.dev/file/...`

### Git Integration
- Scans git log for commits that reference the current file
- Extracts pull request information from commit messages
- Handles both direct commits and merge commits

### UI/UX Design
- **Minimalistic Design**: Clean, focused interface
- **Theme Integration**: Adapts to VSCode's light/dark themes
- **Responsive Layout**: Optimized for Activity Bar panel
- **Loading States**: Clear feedback with file-specific messages

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
