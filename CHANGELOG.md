# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Global Player Search (Static Fallback):** Overhauled the player search logic to allow finding and adding any player directly from the central SQLite database (`database.sqlite`) without needing to select a club first.
- **Süper Lig Legends Draft:** Injected 14 retired legend players into the local database (via the new `add_legends.js` scraper) allowing users to add iconic names like Alex, Hagi, Taffarel directly through the global search.
- **False-9 Formation:** Added a custom `4-6-0 (False 9)` tactical formation logic inside the JavaScript and UI definitions.
- **Improved Toast Notifications:** Error messages are now anchored cleanly to the pitch context without overflowing the screen on mobile devices.
- **Dynamic Image Background:** Exported pitch images (`dom-to-image-more`) now accurately capture the dynamic theme color of the outer layout.

### Changed
- **Mobile Responsive Redesign:** Overhauled the main layout to stack horizontally aligned components into vertical rows on devices smaller than `768px`.
- **Refined Action Bar:** Sidebar tools repositioned and restyled for touch-friendliness, moving the configuration and save actions into an accessible bottom drawer structure on mobile viewports.
- **Viewport-relative Sizing:** Migrated fixed container breakpoints to `100vw` measurements safely wrapped inside CSS `calc()` checks to eliminate horizontal scrolling.
- **Club Selection Logic:** Changing a club from the top search bar now applies its team logo to the center of the pitch but *preserves* the existing players, instead of resetting the lineup.

### Fixed
- **Mobile 3D Pitch Rendering:** Resolved an issue where enabling 3D style zoomed the pitch borders outside of the screen bounds by overriding flex shrinkage limits.
- **Text Title Clipping:** Fixed the visual overlapping of text headers (e.g., Formation Name & Custom Titles) against the team logos when rendered on narrow screens.
- **`generate_static.js` Enhancements:** Script now writes directly to the `.sqlite` persistence layer instead of legacy `.json`.
- **Global Search Order:** Appended `ORDER BY id ASC` to all internal SQLite `LIKE` queries to prevent players and clubs from returning in randomized rows.
