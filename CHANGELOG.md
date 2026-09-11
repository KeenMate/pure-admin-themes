# Changelog

All notable changes to the Pure Admin Themes collection are documented in this file.

## [2.9.0-rc13] - 2026-09-11

### Fixed

- **gruvbox (light mode):** Fixed several low-contrast pairs surfaced by the contrast audit.
    - **Selected sidebar submenu item** (`--pc-sidebar-submenu-active-text`) inherited the dark-mode cream (`#ebdbb2`) and was near-invisible on the light active tint (1.49:1) → pinned to dark brown (`#3c3836`).
    - **`color-5` theme-slot text** (`$color-5-text`) was white on the light purple slot in both modes (2.74:1) → switched to near-black (`#1a1a1a`).
    - **Command-palette match highlight** (`--pa-command-palette-highlight-text`, 2.29:1) → faded-orange.
    - **Text on the info fill** (`--base-text-on-info`) — faded-blue is dark in light mode, so on-fill text (badges / solid info surfaces) is now white; the info **button** keeps a dark label on its bright-blue fill (`--pa-btn-info-text`), staying consistent with the other role buttons.

### Changed

- **gruvbox (light mode):** Toned down the overall yellow cast. The warm cream surface palette (page / card / sidebar / table / input backgrounds + borders) is now desaturated ~45% toward a neutral warm off-white — e.g. page `#fbf1c7 → #efead3`, main `#f9f5d7 → #f1efdf`, sidebar `#ebdbb2 → #ded5bf`. Driven by a single `$light-desat` knob (`quantize()` keeps the output clean hex). Text, the dark navbar/footer, and the orange accent are unchanged; dark mode is untouched.

## [2.9.0-rc12] - 2026-08-21

### Changed

- **All themes rebuilt against Pure Admin Core `2.9.0-rc14` + `@keenmate/pure-css` `1.0.0-rc03`.** This cycle carries **theme SCSS changes** (not a rebuild-only catch-up): the navbar dropped its legacy `pa-header__*` block naming, so every theme's navbar styling was migrated to the new blocks.
    - **Selectors:** the per-theme navbar override blocks were decomposed from a single `.pa-header { … }` into `.pa-navbar` (bar), `.pa-app-header` (brand), `.pa-navmenu` / `.pa-navmenu__dropdown` (menu), `.pa-page-header` (title), and `.pa-navbar__profile-btn` (profile trigger).
    - **Tokens:** navbar SCSS-var overrides and `--pa-*` emits renamed `header` → `navbar` (`$header-bg` → `$navbar-bg`, `--pa-header-text` → `--pa-navbar-text`, etc.), tracking the pure-css `1.0.0-rc03` foundation rename. Component-header tokens (`--pa-card-header-*`, `--pa-table-header-*`) are unchanged.
    - Requires the bumped `@keenmate/pure-css` dependency (`^1.0.0-rc03`); themes built against rc02 would emit the old `--pa-header-*` names.

## [2.9.0-rc11] - 2026-08-10

### Changed

- **All themes rebuilt against Pure Admin Core `2.9.0-rc11`.** Every change below is framework-side — themes consume it through the existing `var(--pa-*)` / `var(--base-*)` cascade, so the core catch-up is a rebuild only, with **no theme SCSS changes** (the per-theme fixes under _Fixed_ below are separate SCSS edits). This build catches up all core deltas since the last theme build (rc03). The headline items this rebuild ships in each theme's CSS bundle:
    - **Unified resize grab-knob.** The sidebar resize handle and the splitter gutter now share one knob look (rounded `--pa-card-bg` tab with a ⋮/⋯ grip + `--pa-border-color` border, accenting on drag), with a viewport-responsive width (slim on desktop, chunkier on small screens) and a radius that follows — but caps — the theme's `--pa-border-radius-lg`. Baked into every theme's bundle, so a rebuild ships it.
    - **Sidebar drag-resize works in icon-collapse mode.** Core's expanded-state rule `body:not(.sidebar-hidden) .pa-layout__sidebar--icon-collapse` no longer hard-codes `width: $sidebar-width` (which, at specificity `(0,3,0)`, beat the zero-specificity `:where(.pa-layout__sidebar){ width: var(--pa-local-sidebar-width) }` and froze the width); it now reads the same runtime variable, so an icon-collapse sidebar can actually be dragged. The stale hard-coded width was baked into every theme's bundle, so a rebuild is required to fix it.
    - **Touch-grabbable sidebar resize handle.** On coarse pointers `.pa-sidebar-resize` now shows a persistent, theme-styled grip knob (uses `--pa-border-radius-lg`, `--pa-card-bg`, `--pa-border-color`, `--pa-accent` while dragging) centred on the sidebar edge and pinned to mid-viewport.
    - **Navbar search-pill overlap fix + tablet sidebar-width fix.** `.pa-header__center:has(.pa-navbar-search)` now reserves a width floor so a search pill no longer overflows the nav (and progressive collapse fires honestly); and the 769–1024px tablet sidebar rule now uses `min(var(--pa-local-sidebar-width), 16rem)` instead of a hard `16rem` literal, so a resized/theme-set width is no longer snapped away in that band. Both were baked into every theme's bundle, so a rebuild ships the fixes.
    - **`.pa-table-card__description`** — new optional subtitle element for table cards (mirrors `.pa-card__description`).
    - **Table-in-card wrappers consolidated** to `.pa-table-container` + `.pa-table-card` (rc10), plus the `.pa-table-card` header corner-wedge fix.
    - **Responsive navbar progressive collapse** (`data-pa-nav-collapse`), `.pa-header__nav-item--active`, `.pa-sidebar__section` / `__divider`, and touch support for navbar dropdowns (rc09).
- **cafeindustrial (light mode):** Lightened the navbar / sidebar / footer. They previously stayed near-black (`#1e1a15` / `#181410`) in light mode "for brand identity", which read as heavy and hard to use in daylight. They're now warm, bright café chrome — white header (`#fffcf8`), sand sidebar (`#ede6db`), cream footer (`#f7f2eb`), all with dark-brown text (`#3d3428`) and the amber accent retained. Also flipped the footer link colours and the profile-panel name/email to dark text (they assumed a dark header), and pinned `--pa-sidebar-submenu-active-text` to dark brown — it defaulted to the dark-mode off-white (`$sidebar-text`) and left the selected second-level item faint on the light active tint. Dark mode unchanged.

### Fixed

- **express (dark mode):** Profile-panel close (X) was near-invisible — black on the dark-gray panel header. The masked `.pa-icon--x` paints with `currentColor` inherited from `--pa-header-profile-name-color`, which express keeps **black** for its yellow navbar header; the profile *panel* header is dark (`#242424`) in dark mode. The dark block already re-coloured the panel name/email light but missed the close button — added `.pa-profile-panel__header .pa-profile-panel__close { color: #fff }` alongside them.

## [2.9.0-rc03] - 2026-06-20

### Changed

- **All 15 themes:** `theme.json` `version` field bumped from `2.7.0` to `2.9.0` and `dependencies.core` from `^2.7.0` to `^2.9.0-rc03`. The 2.7.0 → 2.9.0 catch-up bump should have shipped with the 2.9.0 changelog entry below but the `theme.json` files weren't touched at the time — this entry closes that gap and resyncs to the current core RC. The `^2.9.0-rc03` core dep accepts the just-published RC plus any future 2.9.x release (eventual stable 2.9.0, future patches / RCs); themes don't need to re-publish for a 2.9.0 stable cut unless theme code changes.
- **No theme code changes this cycle.** Upstream core 2.9.0-rc02 (`pa-splitter`, `pa-card__actions--responsive` / `--overflow`, `pa-btn--ghost`) and rc03 (splitter drag-model rework, `restorePane` gap-awareness, `--pa-splitter-rail-size` rem-unit fix, sibling-gutter highlight isolation) are all framework-side. Themes consume them automatically via the existing `var(--pa-*)` / `var(--base-*)` cascade — no SCSS override, no per-theme tuning required. A rebuild against core 2.9.0-rc03 ships the new components and behaviour in each theme's CSS bundle.

## [2.9.0] - 2026-06-11

### Added

- **All 15 themes:** `color-scheme` declarations added to signal each theme's colour mode to the browser. Required to fix native UA elements (scrollbars, `<input type="date">`, etc.) and the `light-dark()` CSS function — both feed off the browser's "used colour scheme" which until now was `normal` (effectively light) for every theme regardless of palette. Most visibly: embedded web components (`web-multiselect`, `web-daterangepicker`) using `light-dark()` for adaptive dark/light palettes silently rendered the light value on dark themes; native scrollbars stayed white on dark backgrounds; date pickers and other native widgets ignored the theme entirely. The exact form of the declaration depends on each theme's mode structure:
    - **Always-dark themes (cobalt2, darkmatter, dracula, night-owl, one-dark, tokyo-night):** added `$theme-color-scheme: dark;` before the `@import variables/index` line. The new core 2.9.0 `output-pa-css-variables` mixin reads the variable and emits `color-scheme: dark;` at `:root` automatically.
    - **Light-default dual-mode themes (corporate, express, minimal, nato):** kept the default `$theme-color-scheme: light` (so the mixin emits `color-scheme: light;` at `:root, .pc-mode-light`) and added an explicit `color-scheme: dark;` declaration as the first line inside each `.pc-mode-dark` block.
    - **Dark-default themes with `.pc-mode-light` opt-in (audi, cafeindustrial, dark, ayu, gruvbox):** set `$theme-color-scheme: dark;` before `@import variables/index` (so the dark scope gets `color-scheme: dark;`) and added `color-scheme: light;` as the first line inside each `.pc-mode-light` block.
- **All 15 themes:** Bumped to 2.9.0 to track Pure Admin Core 2.9.0. The workspace `package.json` keeps its `file:` link to `../pure-admin/packages/core` for local dev (root `package.json` is `private: true` and isn't published — each theme is packaged as a standalone CSS+ZIP by `pureadmin themes pack`); the upstream core version this release was built against is `2.9.0`.

### Changed

- **10 themes:** `--base-surface-1` / `-2` / `-3` / `-inverse` declarations in mode-override blocks renamed to `--base-main-bg` / `--base-page-bg` / `--base-subtle-bg` / `--base-inverse-bg` respectively. Pure Admin Core 2.9.0 dropped the six `--base-*` legacy aliases from its emitted CSS surface (see the core changelog for the why — mainly the web-multiselect dark-mode hover regression and taxonomy de-duplication); themes had to migrate their override blocks to keep producing dark/light-mode surface colours. Mechanical rename, no behavioural change. Themes affected: audi, ayu, cafeindustrial, corporate, dark, express, gruvbox, minimal, nato, tokyo-night. The 5 always-dark themes without `.pc-mode-*` override blocks (cobalt2, darkmatter, dracula, night-owl, one-dark) needed no edits. A small follow-up cleanup is available for themes that previously set both the semantic name AND the alias to the same value in the same block — the rename produces two identical declarations that can be deduplicated.
- **All themes:** Pick up upstream `.pa-card__header` fixes from core 2.9.0 — no theme code changes needed, just a rebuild. The header's `border-top-*-radius: 8px` declarations were dropped (they conflicted with the card's `overflow: hidden` clipping at the effective inner radius of ~7px, exposing wedges of card background at each top corner — most visible on coloured variants as white slivers against the variant colour). Coloured variants (`--primary` / `--success` / `--warning` / `--danger` / `--color-1` through `--color-9`) also gained matching `border-bottom-color` on the header to collapse the previously-gray hairline between the coloured header bg and the white card body.

## [2.7.0] - 2026-05-11

### Changed

- **All themes:** Bumped core dependency to `^2.7.0` and theme versions to 2.7.0 to track the Pure Admin Core 2.6.0 + 2.7.0 releases (2.6.0 of themes was never published — folded into this release). Themes need a rebuild against the new core SCSS to ship the upstream changes — most visibly the new role-colour palette (warning yellow → orange, success/danger shifted to Tailwind-500), the consolidated `--pa-success / --pa-warning / --pa-danger / --pa-info` canonical role tokens, the 5-step `--pa-very-positive ↦ --pa-very-negative` sentiment scale, the `--pa-text-strong / -secondary / -tertiary` contrast tiers, and `--pa-surface-hover / --pa-surface-track` tints. Themes that override `$base-success-color` / `$base-warning-color` / `$base-danger-color` still win via the `!default` cascade
- **All themes:** Pick up the 2.7.0 core CSS variable consolidation pass — ~180 SCSS-baked role-colour references across `_statistics.scss`, `_data-viz.scss`, `_data-display.scss`, `_comparison.scss`, `_timeline.scss`, `_file-selector.scss`, `_query-editor.scss`, `_lists.scss`, `_cards.scss`, `_logic-tree.scss`, `_checkbox-lists.scss`, `_input-wrapper.scss`, `_composite-badge.scss`, `_tabs.scss`, `_notifications.scss`, `_alerts.scss`, `_callouts.scss`, `_popconfirm.scss`, and `_base.scss` migrated to `var(--pa-X)` / `color-mix()` so runtime role-colour overrides finally reach KPI tiles, stat icons, progress bars, gauges, sparklines, heatmaps, chips, timelines, file uploaders, query editors, and notifications
- **All themes:** Pick up upstream fixes for progress ring / gauge inner circle theme tracking and progress / ring / gauge track visibility on dark surfaces (was `rgba(0,0,0,0.08)` invisible on dark; now theme-inverting `color-mix` against `--pa-text-color-1`)
- **All themes:** Inherit new 2.7.0 token defaults — `--pa-link-color` / `--pa-link-color-hover` / `--pa-link-color-visited` (anchors now derive from `--pa-accent` instead of falling back to browser-default `#0000EE` blue, which was unreadable on dark themes), `--pa-sidebar-submenu-active-text` (submenu active text colour can now be themed independently of regular sidebar text — fixes contrast on themes with accent-coloured active bg), `--pa-modal-band-bg / -text / -border` for the new banded modal variant (auto-derives from the alert palette so banded modals stay in lock-step with theme alert colours), and `--pa-gauge-fill` / `--pa-gauge-size` for the rebuilt gauge component
- **corporate:** Sidebar submenu active state now sets `--pa-sidebar-submenu-active-text: #ffffff` so navigation labels stay readable against the bright `$corporate-blue-600` active background. Dark-mode secondary button bg/text inverted (was `$dark-border` on `$dark-card` at ~2.5:1 contrast — read as disabled) and `--pa-color-9` bumped to a mid-slate (`#5a6478`) that's distinguishable from neighbouring palette slots and the new secondary button bg

## [2.4.0] - 2026-05-03

### Schema

- **`modes[].id` enum extended** to `["light", "dark", "high-contrast"]`. Themes can now declare a high-contrast accessibility mode alongside light/dark
- **`features.highContrast`** boolean added — companion flag for declaring HC support

### Changed

- **gruvbox:** Restructured from three-variants-each-with-one-mode to **2 variants** — Default (with both `dark` and `light` modes, toggleable) and Soft (dark only). The hidden mode-toggle UX is fixed: settings panels now expose dark/light switching on the Default variant. SCSS rename: `.pa-color-light` → `.pc-mode-light`. Soft remains unchanged
- **ayu:** Same restructure pattern — **2 variants**: Default/Mirage (with `dark` and `light` modes, toggleable) and Dark (deeper black, dark only). SCSS rename: `.pa-color-light` → `.pc-mode-light`
- **dark:** README content corrected — clarified theme is dark-only with four color tints (Default, Blue, Green, Red). Previous content claimed light-mode auto-switch; in reality there is no light mode. `features.darkMode: true, lightMode: false` declared explicitly
- **All themes:** Bumped to v2.4.0

### Normalized

- **cobalt2, darkmatter, dracula, gruvbox, ayu, night-owl, one-dark, tokyo-night:** Added explicit `modeCssClass: "pc-mode-{mode}"` (previously relied on schema default — now matches the rest of the collection)
- **cafeindustrial:** `$schema` URI changed from absolute (`https://pureadmin.io/...`) to relative (`../schemas/...`) for consistency

### Earlier (previously [Unreleased] - 2026-04-16)

- **nato:** Switched body font from `Inter` (system fallback) to self-hosted **Noto Sans Condensed Medium** matching NATO's actual web identity
- **nato:** Bundled woff2 font files in `assets/fonts/` (Source Sans Pro Regular/SemiBold/Bold + Noto Sans Condensed Medium) — `customFonts` flag now `true`
- **nato:** Tightened border-radius to 2px throughout (cards, buttons, modals, inputs, badges) for institutional feel
- **nato:** Brand color slots 6/8/9 (all dark navies in the institutional palette) remapped for dark mode — `--pa-color-6: #2e5a8e`, `--pa-color-8: #3f78b8`, `--pa-color-9: $nato-gray-400`. Light mode unchanged. Keeps the navy family while restoring readable contrast for outline buttons on dark bg
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
