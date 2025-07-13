# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Performance Improvements**: Chunked processing for better performance with large git histories
- **Streaming Results**: Results appear immediately as they're found, no need to wait for all processing
- **Progress Indicator**: Real-time progress bar showing processing status
- **Responsive Design**: History cards now properly handle narrow containers without text overflow
- **UI Priority**: Figma links are now prominently displayed at the top of each card
- **Visual Hierarchy**: Clear separation between Figma URLs and GitHub PR information

### Changed
- **UI Layout**: Reorganized history cards to prioritize Figma links over GitHub PR links
- **Loading States**: Persistent loading indicator that remains until all processing is complete
- **Text Wrapping**: Improved URL and text handling for responsive layouts
- **Error Handling**: Cleaner error handling without debug console output

### Fixed
- **Responsive Layout**: Fixed text overflow issues in narrow Activity Bar panels
- **URL Display**: Long URLs now wrap properly without breaking layout
- **Header Layout**: Responsive header that adapts to different panel widths
- **Production Code**: Removed all console logs for clean production deployment

### Technical
- **Chunked Processing**: Commits processed in batches of 5 with 100ms delays
- **Streaming Architecture**: Callback-based result streaming for immediate feedback
- **Progress Tracking**: Real-time progress updates during processing
- **Code Quality**: Comprehensive test coverage maintained at 100%

## [0.0.1]

### Added
- Initial release
- Basic Figma URL detection
- Activity Bar integration
- File-aware results display
- Minimalistic UI design
