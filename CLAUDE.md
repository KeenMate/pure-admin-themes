# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Theme collection for the Pure Admin framework. SCSS themes compile to self-contained CSS + ZIP packages for upload to pureadmin.io. All build/pack/publish operations are driven by the `pureadmin` CLI (`@keenmate/pureadmin`).

## Key Commands

```bash
# Install dependencies (requires sibling ../pure-admin/packages/core directory)
make install                       # or: npm install

# Build SCSS → CSS (all themes or one)
make build                         # all themes
make build THEME=audi              # single theme
npx pureadmin themes build audi    # equivalent direct CLI call

# Build + create ZIP packages
make pack
make pack THEME=audi

# Build + pack + upload to pureadmin.io
make publish
make publish THEME=express

# Validate compiled CSS
make validate
make validate THEME=audi

# Remove all dist/ directories
make clean
```

## Architecture

**Theme discovery** is automatic — any directory containing a `theme.json` is treated as a theme.

**Build pipeline:** SCSS compile → ZIP package → upload to pureadmin.io. Everything is handled by the `pureadmin` CLI; this repo contains no local build scripts. The Makefile and npm scripts are thin wrappers around `pureadmin themes <subcommand>`.

**Each theme directory contains:**
- `theme.json` — Manifest validated against `schemas/pure-admin-theme.schema.json` (modes, colors, features, fonts, exports)
- `src/scss/{name}.scss` — Source SCSS importing from `@keenmate/pure-admin-core`
- `assets/fonts/` — Bundled .woff2 files (only audi and express)
- `dist/` — Build output (gitignored)

**ZIP output structure:** `theme.json`, `css/`, `scss/`, `assets/`, `README.md`

## Dependencies

- `@keenmate/pure-admin-core` — **file dependency** on `../pure-admin/packages/core` (must exist locally)
- `@keenmate/pureadmin` — CLI that handles all build/pack/publish/validate operations (file dependency on `../pure-admin-cli`)

## Theme-Specific Notes

- **Dark** theme is the only one with color variants (blue/green/red) via `pa-color-{variant}` CSS class
- Light/dark mode switching uses `pc-mode-{mode}` CSS class on body; autoSwitch via `prefers-color-scheme` is enabled by default
- Audi and Express bundle custom Fira Sans Condensed fonts
- SCSS compiles with `--silence-deprecation=import` (legacy @import usage)

## Publishing

Requires a `.pureadmin.json` config file in the repo root containing the API key (`{"apiKey": "..."}`). The CLI reads it automatically. Uploads go to `https://pureadmin.io/api/themes/upload`.
