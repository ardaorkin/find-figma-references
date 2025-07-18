# Changelog

## [0.0.11] - 2024-07-13
### Fixed
- Running "Find Figma references" from the Command Palette now automatically opens and focuses the Figma References activity bar view, so users immediately see results without manually opening the panel.

## [0.0.10] - 2024-07-13
### Changed
- Improved activity bar icon with better scaling and cleaner SVG structure.
- Removed unused icon files to clean up the extension package.

## [0.0.9] - 2024-07-13
### Changed
- Updated activity bar icon to use SVG format for better scaling and theme integration.

## [0.0.8] - 2024-07-13
### Changed
- Configure theme-specific activity bar icons for light and dark themes.

## [0.0.7] - 2024-07-13
### Added
- Theme-specific icons: light and dark theme support for better visual integration.
### Changed
- Updated extension icon for better visual identification.

## [0.0.6] - 2024-07-13
### Changed
- Updated extension icon for better visual identification.

## [0.0.5] - 2024-07-13
### Added
- Extension icon for better visual identification in the Activity Bar.
- Support for `figma.com/design` URL format in documentation.
- MIT License file for proper open source licensing.

### Changed
- Updated README project structure to accurately reflect the current codebase organization.
- Improved VSIX packaging configuration for better distribution.

## [0.0.4] - 2024-07-13
### Fixed
- Webview HTML is now included in the VSIX package, so the token input UI works in production builds.
- Improved build and packaging scripts to ensure all necessary files are distributed.
- File path resolution for webview HTML works in both development and packaged extension modes.

## [0.0.3] - 2024-07-13
### Added
- Built-in GitHub token input UI in the extension panel.
- Extension-specific configuration: `figmaReferences.githubToken`.
- Auto-refresh after saving a token.
### Changed
- Improved error handling and token validation.
- Token input appears only when needed and disappears after configuration.

## [0.0.2] - 2024-07-13
### Added
- Performance improvements: chunked processing and streaming results.
- Real-time progress bar and responsive design fixes.
### Changed
- UI prioritizes Figma links over PR links.
- Removed all console logs for production readiness.

## [0.0.1] - 2024-07-13
### Added
- Initial release with Figma URL detection, Activity Bar integration, and minimalistic UI.
