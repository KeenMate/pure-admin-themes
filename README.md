# Pure Admin Themes

Official theme collection for [Pure Admin](https://github.com/keenmate/pure-admin). Each theme compiles to a single self-contained CSS file and is published to [pureadmin.io](https://pureadmin.io) as a downloadable ZIP package with bundled fonts and assets.

## Themes

| Theme | Description | Modes / Variants | Custom Fonts |
|-------|-------------|-----------------|--------------|
| **Audi** | Premium dark theme with sharp corners and red accents inspired by Audi's design language | dark, light | Fira Sans Condensed |
| **Ayu** | Warm, elegant theme inspired by the Ayu editor color scheme | dark, light + Dark/Light variants | Monda |
| **Cobalt2** | Rich cobalt blues with signature yellow accent (Wes Bos's Cobalt2) | dark | - |
| **Corporate** | Professional blue/gray theme for business applications | dark, light | - |
| **Dark** | Neutral dark theme with color variants (blue, green, red) | dark + Blue/Green/Red variants | - |
| **Darkmatter** | Deep space blue theme with cool tones and minimal aesthetic | dark | - |
| **Dracula** | Iconic Dracula color scheme with purple accents | dark | - |
| **Express** | Bold yellow and red theme inspired by logistics brands | dark, light | Fira Sans Condensed |
| **Gruvbox** | Retro groove color scheme with warm earthy tones and orange accents | dark, light + Soft/Light variants | - |
| **Minimal** | Ultra clean monochrome theme with grayscale palette | dark, light | - |
| **Night Owl** | Sarah Drasner's Night Owl palette — deep navy with electric blue accents | dark | - |
| **One Dark** | Atom's One Dark color scheme with blue accents | dark | - |
| **Tokyo Night** | VS Code Tokyo Night-inspired with blue-purple accents | dark + Storm variant | - |

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
├── ayu/
├── cobalt2/
├── corporate/
├── dark/
├── darkmatter/
├── dracula/
├── express/
├── gruvbox/
├── minimal/
├── night-owl/
├── one-dark/
├── tokyo-night/
├── schemas/
│   └── pure-admin-theme.schema.json
├── .pureadmin.json             # API key for `pureadmin themes publish`
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
<body class="pc-mode-dark">   <!-- dark mode -->
<body class="pc-mode-light">  <!-- light mode -->
```

## Requirements

- Node.js >= 18
- `@keenmate/pure-admin-core` ^2.1.0

## Links

- [pureadmin.io](https://pureadmin.io) — Theme gallery and downloads
- [Live Demo](https://demo.pureadmin.io) — Pure Admin demo site
- [GitHub](https://github.com/keenmate/pure-admin) — Framework source
- [npm](https://www.npmjs.com/package/@keenmate/pure-admin-core) — Core package
- [API Documentation](https://pureadmin.io/api) — REST API

## License

MIT
