# Changelog

All notable changes to the Pure Admin Themes collection are documented in this file.

## [Unreleased] - 2026-04-16

### Changed

- **nato:** Switched body font from `Inter` (system fallback) to self-hosted **Noto Sans Condensed Medium** matching NATO's actual web identity
- **nato:** Bundled woff2 font files in `assets/fonts/` (Source Sans Pro Regular/SemiBold/Bold + Noto Sans Condensed Medium) — `customFonts` flag now `true`
- **nato:** Tightened border-radius to 2px throughout (cards, buttons, modals, inputs, badges) for institutional feel
- **nato:** Brand color slots 6/8/9 (all dark navies in the institutional palette) remapped for dark mode — `--pa-color-6: #2e5a8e`, `--pa-color-8: #3f78b8`, `--pa-color-9: $nato-gray-400`. Light mode unchanged. Keeps the navy family while restoring readable contrast for outline buttons on dark bg.

### Fixed

- **nato:** Active sidebar link no longer renders azure-on-azure (unreadable) — now navy text on subtle azure tint in light mode, white on azure-dark in dark mode
- **nato:** Card header inner corners now respect 2px radius (were stuck at 8px from compiled `$card-border-radius`)
- **nato:** Outline-secondary button was invisible on light card bg (default `--pa-btn-secondary-outline-color` resolved to white via `$btn-secondary-text`). Now `$nato-navy` in light mode, `$nato-dark-text-2` in dark mode

---

## [2.3.4] - 2026-03-31

### Changed

- **All themes:** Bumped core dependency to `^2.3.4` and theme versions to 2.3.4
- **All themes:** Now consume `var(--pa-border-radius)`, `--pa-btn-secondary-outline-color`, `--pa-command-palette-key-*` CSS variables from core

---

## [2.3.2] - 2026-03-30

### Changed

- **audi:** Rewritten from scratch — clean structure matching modern theme template (Tokyo Night). Removed all `!important` hacks and redundant overrides
- **audi:** Border-radius now zero via `--pa-border-radius: 0` CSS variable override (no more `border-radius: 0 !important` per-component)

### Fixed

- **audi:** Outline-secondary button now readable on dark background (was #333 on #0a0a0a)
- **ayu:** Added `--pa-btn-secondary-outline-color` override for readable outline-secondary on Mirage bg
- **ayu:** Added `ascent-override: 105%`, `descent-override: 30%`, `size-adjust: 100%` to Monda @font-face for correct baseline alignment

---

## [2.3.0] - 2026-03-26

### Changed

- **All themes:** Color slots (`$color-1` through `$color-9`) reordered by perceived luminance — `color-1` is now always the lightest, `color-9` always the darkest. This is a **breaking change** for anyone referencing specific slot numbers
- **All themes:** Bumped versions to 2.3.0

### Added

- **dracula:** Added 9 theme color slots (`$color-1` through `$color-9`) with contrast text colors — was the only theme missing them. Uses official Dracula palette: yellow, cyan, orange, green, purple, pink, red, comment, current-line

### Fixed

- **ayu, cobalt2, darkmatter, dracula, express, gruvbox, night-owl, one-dark, tokyo-night:** Active sidebar submenu background changed from solid accent to `rgba($accent, 0.2)` — fixes accent-on-accent unreadable active state
- **dark:** Same fix applied to color variant overrides (blue, green, red) — default variant was already fine
- **dracula:** Brightened sidebar and header secondary text (`$text-2` + 15% lightness) for better readability on dark surfaces
- **dracula, gruvbox:** Navbar hover text now uses foreground color instead of accent — fixes unreadable hover state on accent background

---

## [2.1.1] - 2026-03-22

### Fixed

- **All themes:** Active sidebar link now uses accent color for text instead of default sidebar text — fixes low contrast active state across all dark themes
- **All themes:** Removed `!important` overrides on `.pa-sidebar__link--active` — core now handles this; dark text override moved to `.pa-sidebar__toggle--active` for solid accent backgrounds
- **ayu:** Secondary button outline now visible in all variants (Mirage, Dark, Light)
- **ayu:** Darkened accent color in Light variant (`#c47b10` instead of `#f29718`) for better inline code and helper text readability
- **ayu:** Fixed Dark variant active sidebar link — was showing invisible dark text on dark background
- **ayu, cobalt2, darkmatter, dracula, gruvbox, night-owl, one-dark, tokyo-night:** Input group prepend/append text now readable — uses theme-appropriate elevated background and primary text instead of default gray-on-gray

### Added

- **dark:** Bundled Play font (woff2, latin + latin-ext)
- **ayu:** Bundled Monda font (woff2, latin + latin-ext)

---

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
