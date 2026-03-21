# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Theme collection for the Pure Admin framework. Contains 5 SCSS themes (audi, corporate, dark, express, minimal) that compile to self-contained CSS + ZIP packages for upload to pureadmin.io.

## Key Commands

```bash
# Install dependencies (requires sibling ../pure-admin/packages/core directory)
make install          # or: npm install

# Build SCSS → CSS (all themes or one)
make build            # all themes
make build THEME=audi # single theme
npm run build         # all themes
node scripts/build-themes.js audi  # single theme

# Build + create ZIP packages
make pack
make pack THEME=audi

# Build + pack + upload to pureadmin.io
make publish
make publish THEME=express

# Remove all dist/ directories
make clean
```

## Architecture

**Theme discovery** is automatic — any directory containing a `theme.json` is treated as a theme.

**Build pipeline:** SCSS compile → ZIP package → upload to pureadmin.io
- `scripts/build-themes.js` — Compiles SCSS via Dart Sass with `--load-path=node_modules`
- `scripts/pack-theme.js` — Validates against JSON schema, rewrites `url()` paths for fonts, computes SHA-256 checksums, generates README, creates ZIP
- `scripts/pack-themes.js` — Orchestrates build + pack for all/selected themes
- `scripts/publish-themes.js` — Packs + uploads ZIPs via API with key from `.pureadmin` config file

**Each theme directory contains:**
- `theme.json` — Manifest validated against `schemas/pure-admin-theme.schema.json` (modes, colors, features, fonts, exports)
- `src/scss/{name}.scss` — Source SCSS importing from `@keenmate/pure-admin-core`
- `assets/fonts/` — Bundled .woff2 files (only audi and express)
- `dist/` — Build output (gitignored)

**ZIP output structure:** `theme.json`, `css/`, `scss/`, `assets/`, `README.md`

## Dependencies

- `@keenmate/pure-admin-core` — **file dependency** on `../pure-admin/packages/core` (must exist locally)
- `sass` — SCSS compilation
- `archiver` — ZIP creation

## Theme-Specific Notes

- **Dark** theme is the only one with color variants (blue/green/red) via `pa-color-{variant}` CSS class
- Light/dark mode switching uses `pa-mode-{mode}` CSS class on body; autoSwitch via `prefers-color-scheme` is enabled by default
- Audi and Express bundle custom Fira Sans Condensed fonts
- SCSS compiles with `--silence-deprecation=import` (legacy @import usage)

## Publishing

Requires `.pureadmin` config file with API key (see `.pureadmin.example`). Uploads to `https://pureadmin.io/api/themes/upload`.
