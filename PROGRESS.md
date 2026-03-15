# Pure Admin Themes — Migration Progress

**Date:** 2026-02-25

## Context

Theme source code was moved out of `pure-admin` (where it lived as npm workspace packages under `packages/theme-*`) into a standalone `pure-admin-themes` repo with a flat structure. Themes are now built and distributed as ZIPs (for upload to pure-theme-park) rather than as npm packages.

---

## Done

### pure-admin-themes (C:\Git\KM\pure-admin-themes\)

- **Folder structure** — flat layout: `{theme}/theme.json` + `{theme}/src/scss/{theme}.scss`
- **5 themes migrated** — corporate, audi, dark, express, minimal
- **theme.json updated** — version `2.0.2`, core dep `^2.0.0`, schema path `../schemas/...`
- **SCSS files** — copied verbatim, imports work via `--load-path=node_modules`
- **package.json** — deps: `@keenmate/pure-admin-core`, `sass`, `archiver`
- **Makefile** — dynamic, auto-discovers themes from `*/theme.json`, all targets accept `THEME=name`
  - `make build [THEME=name]`
  - `make pack [THEME=name]`
  - `make publish [THEME=name] THEME_PARK_API_KEY=xxx`
  - `make clean`
- **Node scripts** (Windows-compatible, no bash loops):
  - `scripts/build-themes.js` — build one or all (SCSS → CSS)
  - `scripts/pack-themes.js` — build + ZIP one or all
  - `scripts/pack-theme.js` — single theme packager (from pure-admin core, adapted)
  - `scripts/publish-themes.js` — pack + upload via curl, accepts `--api-key` / `--url` flags
- **SHA-256 checksums** — `pack-theme.js` computes `sha256:<hex>` of CSS and SCSS, injects into the theme.json inside the ZIP (source theme.json untouched)
- **JSON schema** — `schemas/pure-admin-theme.schema.json` updated with `checksums` field
- **`.gitignore`** — ignores `node_modules/`, `dist/`, `*/dist/`
- **Verified** — `make clean && make pack` builds all 5 themes and produces 5 ZIPs (~50 KB each)

### pure-admin (C:\Git\KM\pure-admin\)

- **package.json** — workspaces narrowed to `["packages/core", "demo"]`, removed `build:themes` and `build:all` scripts
- **Makefile** — removed `build-themes`, `publish-themes`, `publish-all` targets; simplified `clean`, `package`, `verify`, `publish`
- **CLAUDE.md** — updated build commands, theme references point to themes repo
- **Core build verified** — `make build` still works

### Not committed

None of the changes in either repo are committed yet.

---

## Not done — follow-up tasks

### 1. pure-theme-park upload API
The `POST /api/themes/upload` endpoint doesn't exist yet. It should:
- Accept a ZIP file upload
- Extract `theme.json` from the ZIP
- Read `checksums.css` to detect if anything changed since last upload
- Create/update a DB record with theme metadata, version, checksums
- Store the ZIP (or extracted CSS) for serving

### 2. pure-admin demo server — theme loading
The demo server (`demo/server.js`) previously loaded theme CSS from workspace `packages/theme-*` directories. Those are no longer in the workspace, so theme switching in the demo is broken. Options:
- Install theme CSS from npm (if themes are still published there)
- Reference the `pure-admin-themes` repo via a symlink or file path
- Bundle a default theme with the demo
- Have the demo fetch from pure-theme-park

### 3. Git init for pure-admin-themes
The `C:\Git\KM\pure-admin-themes\` folder is not a git repo yet. Needs `git init`, initial commit, and a remote.

### 4. Delete old packages/theme-* from pure-admin
The `packages/theme-*` directories are still in `pure-admin` (just removed from the workspace config). They can be deleted in a cleanup commit. Left in place for now to preserve git history.

### 5. npm publishing (optional)
Themes are no longer npm packages — they're ZIP-distributed via pure-theme-park. If npm publishing is still desired alongside ZIP distribution, that would need separate setup.

---

## File inventory — pure-admin-themes

```
pure-admin-themes/
├── package.json
├── Makefile
├── .gitignore
├── scripts/
│   ├── build-themes.js
│   ├── pack-themes.js
│   ├── pack-theme.js
│   └── publish-themes.js
├── schemas/
│   └── pure-admin-theme.schema.json
├── corporate/
│   ├── theme.json
│   └── src/scss/corporate.scss
├── audi/
│   ├── theme.json
│   └── src/scss/audi.scss
├── dark/
│   ├── theme.json
│   └── src/scss/dark.scss
├── express/
│   ├── theme.json
│   └── src/scss/express.scss
├── minimal/
│   ├── theme.json
│   └── src/scss/minimal.scss
└── dist/                          # generated ZIPs (gitignored)
```

## Modified files — pure-admin

| File | Change |
|------|--------|
| `package.json` | Workspaces: `["packages/core", "demo"]`, removed theme scripts |
| `Makefile` | Removed all theme-related targets |
| `CLAUDE.md` | Updated docs to reference themes repo |
