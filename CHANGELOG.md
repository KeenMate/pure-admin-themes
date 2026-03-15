# Changelog

All notable changes to the Pure Admin Themes collection are documented in this file.

## [2.0.2] - 2026-02-28

### Fixed

- **audi, express:** Fixed `@font-face` `url()` paths from absolute (`/fonts/google/...`) to relative (`../assets/fonts/...`) so themes work when extracted to any directory without server-side routing
- **audi:** Set `features.customFonts` to `true` (was incorrectly `false`)
- **express:** Populated `fonts.files[]` array (was empty)

### Added

- **audi, express:** Bundled 7 Fira Sans Condensed `.woff2` font files in `assets/fonts/` — theme ZIPs are now fully self-contained
- **audi:** Added `fonts` section to `theme.json` with all 7 font file entries
- **pack-theme.js:** Added CSS/SCSS `url()` rewriting step at pack time — all font references in the ZIP are automatically rewritten to correct relative paths (`../assets/fonts/...`), regardless of how the source SCSS references them

### Unchanged

- **corporate, dark, minimal:** No changes — these themes have no custom fonts or `url()` references
