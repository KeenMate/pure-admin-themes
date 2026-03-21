# Changelog

All notable changes to the Pure Admin Themes collection are documented in this file.

## [2.1.0] - 2026-03-21

### Added

- **ayu:** Warm, elegant theme inspired by the Ayu editor color scheme — three variants: Mirage (bluish dark, default), Dark (deep blacks), and Light
- **cobalt2:** Rich cobalt blues with signature yellow accent, inspired by Wes Bos's Cobalt2 editor scheme
- **darkmatter:** Deep space blue theme with cool tones and minimal aesthetic
- **dracula:** Iconic Dracula color scheme with purple accents
- **gruvbox:** Retro groove color scheme with warm earthy tones — Soft and Light variants plus dark/light modes
- **night-owl:** Sarah Drasner's Night Owl palette — deep navy blues with electric blue accents
- **one-dark:** Atom's One Dark color scheme with blue accents
- **tokyo-night:** VS Code Tokyo Night-inspired theme with blue-purple accents — includes Storm variant
- **theme.json schema:** New flat `colorVariants` array with nested `modes`, replacing the old `modes` + `colorVariants.supported` structure. Added `modeCssClass`, `variantCssClass`, and `content` fields

### Changed

- **All themes:** Bumped versions to 2.1.0, core dependency to `^2.1.0`
- **All themes:** Migrated `theme.json` to new schema — colors moved into `colorVariants[].modes[].colors`, removed top-level `modes` and `colors` objects
- **audi:** Fixed physical CSS properties (`border-left`/`border-right`) to logical properties (`border-inline-start`/`border-inline-end`) for RTL support
- **express:** Fixed physical CSS properties (`border-right-color`, `border-right`) to logical properties for RTL support
- **pack-theme.js:** Updated required fields and README generation to work with new schema

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
