# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] - 2024-01-XX

### Added
- **GitHub Token UI**: Built-in token input in the extension panel
- **Configuration Management**: Extension-specific configuration name (`figmaReferences.githubToken`)
- **Token Validation**: Proper validation of GitHub token format
- **Auto-refresh**: Automatic refresh after token is successfully saved
- **Enhanced UX**: Token input appears when needed, disappears when configured

### Changed
- **Configuration Name**: Changed from generic `github.token` to `figmaReferences.githubToken`
- **Error Handling**: Improved error messages and token-related error detection
- **Loading Behavior**: Prevents loading indicator when GitHub token is missing

### Fixed
- **Token Input Persistence**: Token input now properly disappears after successful save
- **Configuration Conflicts**: Eliminates potential conflicts with other extensions

## [0.0.2] - 2024-01-XX

### Added
- **Performance Improvements**: Chunked processing and streaming results
- **Progress Tracking**: Real-time progress bar during processing
- **Responsive Design**: Fixed text overflow in narrow containers

### Changed
- **UI Enhancements**: Figma links prioritized over GitHub PR links
- **Code Quality**: Removed all console logs for production readiness

## [0.0.1] - 2024-01-XX

### Added
- Initial release
- Basic Figma URL detection
- Activity Bar integration
- File-aware results display
- Minimalistic UI design
