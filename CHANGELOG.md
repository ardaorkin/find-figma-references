# Changelog

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
