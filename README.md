# Pure Admin Themes

Official theme collection for [Pure Admin](https://github.com/keenmate/pure-admin). Each theme compiles to a single self-contained CSS file and is published to [pureadmin.io](https://pureadmin.io) as a downloadable ZIP package with bundled fonts and assets.

## Themes

| Theme | Description | Modes | Custom Fonts |
|-------|-------------|-------|--------------|
| **Audi** | Premium dark theme with red accents inspired by Audi's design language | dark, light | Fira Sans Condensed |
| **Corporate** | Professional blue/gray theme for business applications | light, dark | - |
| **Dark** | Neutral dark theme with color variants (blue, green, red) | dark, light | - |
| **Express** | Bold yellow and red theme inspired by logistics brands | light, dark | Fira Sans Condensed |
| **Minimal** | Ultra clean monochrome theme with grayscale palette | light, dark | - |

Browse and download themes at [pureadmin.io](https://pureadmin.io).

## Quick Start

```bash
npm install
make build              # Build all themes
make build THEME=audi   # Build one theme
make pack               # Build + create ZIP packages
make clean              # Clean build artifacts
```

## Publishing to pureadmin.io

Themes are published to [pureadmin.io](https://pureadmin.io) via the upload API. The publish command packs the themes and uploads them automatically.

### Setup

Create a `.pureadmin` config file in the project root (gitignored):

```
PUREADMIN_API_KEY=your-api-key-here
PUREADMIN_URL=https://pureadmin.io/api/themes/upload
```

### Publish

```bash
make publish              # Pack + upload all themes
make publish THEME=audi   # Pack + upload one theme
```

The upload endpoint validates each ZIP against the JSON schema, computes SHA-256 checksums, and skips unchanged themes. The manifest on pureadmin.io is updated automatically.

Output example:

```
=== Uploading ===
  ↑ audi v2.0.2... ✓ updated
  ↑ corporate v2.0.2... unchanged
  ↑ dark v2.0.2... unchanged

Summary: 1 updated, 2 unchanged, 0 failed
```

## Project Structure

```
pure-admin-themes/
├── audi/
│   ├── theme.json              # Theme manifest
│   ├── src/scss/audi.scss      # Theme source
│   ├── assets/fonts/*.woff2    # Bundled fonts
│   └── dist/                   # Build output + ZIP
├── corporate/
├── dark/
├── express/
├── minimal/
├── schemas/
│   └── pure-admin-theme.schema.json
├── scripts/
│   ├── build-themes.js         # SCSS compilation
│   ├── pack-theme.js           # Single theme packaging
│   ├── pack-themes.js          # All themes packaging
│   └── publish-themes.js       # Upload to pureadmin.io
├── .pureadmin.example          # Config template
├── package.json
└── Makefile
```

## ZIP Package Structure

Each packaged theme is a self-contained ZIP:

```
pure-admin-theme-{id}-{version}.zip
├── theme.json                  # Enriched manifest with checksums
├── css/{id}.css                # Compiled CSS (ready to use)
├── scss/{id}.scss              # SCSS source (for customization)
├── assets/                     # Optional
│   └── fonts/*.woff2           # Bundled font files
└── README.md                   # Generated usage instructions
```

Themes with custom fonts bundle `.woff2` files in `assets/fonts/`. The CSS references them via relative paths so fonts load correctly when extracted anywhere.

## Using a Theme

### CSS only (no build tools)

```html
<link rel="stylesheet" href="path/to/audi/css/audi.css">
```

### Download via API

```bash
curl -fsSL -o audi.zip https://pureadmin.io/api/themes/audi/download
```

### SCSS customization

```bash
npm install @keenmate/pure-admin-core
sass scss/audi.scss output.css --load-path=node_modules --silence-deprecation=import
```

### Mode switching

```html
<body class="pa-mode-dark">   <!-- dark mode -->
<body class="pa-mode-light">  <!-- light mode -->
```

## Requirements

- Node.js >= 18
- `@keenmate/pure-admin-core` ^2.0.0

## Links

- [pureadmin.io](https://pureadmin.io) — Theme gallery and downloads
- [Live Demo](https://demo.pureadmin.io) — Pure Admin demo site
- [GitHub](https://github.com/keenmate/pure-admin) — Framework source
- [npm](https://www.npmjs.com/package/@keenmate/pure-admin-core) — Core package
- [API Documentation](https://pureadmin.io/api) — REST API

## License

MIT
