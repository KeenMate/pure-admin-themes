#!/usr/bin/env node

// =============================================================================
// pack-theme.js — Package a Pure Admin theme into a distributable zip
// =============================================================================
//
// Usage:
//   node pack-theme.js <theme-dir> [--output <dir>]
//
// Example:
//   node pack-theme.js corporate
//   node pack-theme.js audi --output ./releases/
//
// The script:
//   1. Reads and validates theme.json from the theme directory
//   2. Verifies CSS file exists (or compiles SCSS if missing)
//   3. Generates a README.md with usage instructions
//   4. Packages everything into pure-admin-theme-{id}-{version}.zip
//
// Zip contents:
//   pure-admin-theme-{id}-{version}.zip
//   ├── theme.json                    (enriched with asset checksums)
//   ├── css/{id}.css
//   ├── scss/{id}.scss                (optional)
//   ├── preview/thumbnail.*           (optional)
//   ├── assets/                       (optional)
//   │   ├── fonts/*.woff2
//   │   ├── logo.svg
//   │   ├── favicon.ico
//   │   └── ...
//   └── README.md
// =============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Project root (where package.json with dependencies lives)
const projectRoot = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let themeDir = null;
let outputDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node pack-theme.js <theme-dir> [--output <dir>]

Options:
  --output <dir>   Output directory for the zip (default: theme-dir/dist/)
  --help, -h       Show this help message

Examples:
  node pack-theme.js corporate
  node pack-theme.js audi --output ./releases/
`);
    process.exit(0);
  } else if (!themeDir) {
    themeDir = args[i];
  }
}

if (!themeDir) {
  console.error('Error: No theme directory specified.');
  console.error('Usage: node pack-theme.js <theme-dir> [--output <dir>]');
  process.exit(1);
}

// Resolve paths
themeDir = path.resolve(themeDir);

if (!fs.existsSync(themeDir)) {
  console.error(`Error: Theme directory not found: ${themeDir}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Read and validate theme.json
// ---------------------------------------------------------------------------
const themeJsonPath = path.join(themeDir, 'theme.json');
if (!fs.existsSync(themeJsonPath)) {
  console.error(`Error: theme.json not found in ${themeDir}`);
  process.exit(1);
}

let theme;
try {
  theme = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
} catch (err) {
  console.error(`Error: Invalid JSON in theme.json: ${err.message}`);
  process.exit(1);
}

// Validate required fields
const requiredFields = ['name', 'id', 'version', 'colorVariants', 'exports'];
const missing = requiredFields.filter(f => !theme[f]);
if (missing.length > 0) {
  console.error(`Error: theme.json is missing required fields: ${missing.join(', ')}`);
  process.exit(1);
}

// Validate id format
if (!/^[a-z][a-z0-9-]*$/.test(theme.id)) {
  console.error(`Error: theme.id "${theme.id}" must be lowercase alphanumeric with hyphens (e.g. "cafeindustrial")`);
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(theme.version)) {
  console.error(`Error: theme.version "${theme.version}" must be semver (e.g. "1.0.0")`);
  process.exit(1);
}

console.log(`Packaging theme: ${theme.name} v${theme.version} (${theme.id})`);

// ---------------------------------------------------------------------------
// 2. Locate or compile CSS
// ---------------------------------------------------------------------------
let cssSourcePath = null;

// Check exports.css path first
if (theme.exports && theme.exports.css) {
  const exportedCss = path.resolve(themeDir, theme.exports.css);
  if (fs.existsSync(exportedCss)) {
    cssSourcePath = exportedCss;
  }
}

// Also check common locations
if (!cssSourcePath) {
  const candidates = [
    path.join(themeDir, 'dist', `${theme.id}.css`),
    path.join(themeDir, 'dist', 'css', `${theme.id}.css`),
    path.join(themeDir, 'css', `${theme.id}.css`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cssSourcePath = candidate;
      break;
    }
  }
}

// If no CSS found, try to compile from SCSS
if (!cssSourcePath) {
  console.log('No compiled CSS found, attempting to compile from SCSS...');

  let scssPath = null;
  if (theme.exports && theme.exports.scss) {
    const exportedScss = path.resolve(themeDir, theme.exports.scss);
    if (fs.existsSync(exportedScss)) {
      scssPath = exportedScss;
    }
  }
  if (!scssPath) {
    scssPath = path.join(themeDir, 'src', 'scss', `${theme.id}.scss`);
  }

  if (!fs.existsSync(scssPath)) {
    console.error(`Error: No CSS or SCSS source found for theme "${theme.id}"`);
    process.exit(1);
  }

  // Compile SCSS
  const tempCssDir = path.join(themeDir, 'dist');
  if (!fs.existsSync(tempCssDir)) {
    fs.mkdirSync(tempCssDir, { recursive: true });
  }

  const tempCssPath = path.join(tempCssDir, `${theme.id}.css`);

  // Build load paths for sass
  const loadPaths = [];

  // Check for node_modules in various locations
  const nodeModulesCandidates = [
    path.join(themeDir, 'node_modules'),
    path.join(projectRoot, 'node_modules'),
  ];
  for (const nm of nodeModulesCandidates) {
    if (fs.existsSync(nm)) {
      loadPaths.push(nm);
    }
  }

  const loadPathArgs = loadPaths.map(p => `--load-path="${p}"`).join(' ');
  const sassCmd = `npx sass "${scssPath}" "${tempCssPath}" --no-source-map --silence-deprecation=import ${loadPathArgs}`;

  try {
    console.log(`  Compiling: ${path.basename(scssPath)}`);
    execSync(sassCmd, { stdio: 'pipe' });
    cssSourcePath = tempCssPath;
    console.log('  Compilation successful.');
  } catch (err) {
    console.error(`Error: SCSS compilation failed:`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    process.exit(1);
  }
}

console.log(`  CSS: ${path.relative(themeDir, cssSourcePath)}`);

// ---------------------------------------------------------------------------
// 3. Locate SCSS source
// ---------------------------------------------------------------------------
let scssSourcePath = null;
if (theme.exports && theme.exports.scss) {
  const exportedScss = path.resolve(themeDir, theme.exports.scss);
  if (fs.existsSync(exportedScss)) {
    scssSourcePath = exportedScss;
  }
}
if (!scssSourcePath) {
  const candidate = path.join(themeDir, 'src', 'scss', `${theme.id}.scss`);
  if (fs.existsSync(candidate)) {
    scssSourcePath = candidate;
  }
}

if (scssSourcePath) {
  console.log(`  SCSS: ${path.relative(themeDir, scssSourcePath)}`);
}

// ---------------------------------------------------------------------------
// 4. Locate preview thumbnail
// ---------------------------------------------------------------------------
let thumbnailPath = null;
const thumbnailCandidates = [
  theme.preview && theme.preview.thumbnail ? path.resolve(themeDir, theme.preview.thumbnail) : null,
  path.join(themeDir, 'preview', 'thumbnail.png'),
  path.join(themeDir, 'preview', 'thumbnail.jpg'),
].filter(Boolean);

for (const candidate of thumbnailCandidates) {
  if (fs.existsSync(candidate)) {
    thumbnailPath = candidate;
    break;
  }
}

if (thumbnailPath) {
  console.log(`  Preview: ${path.relative(themeDir, thumbnailPath)}`);
}

// ---------------------------------------------------------------------------
// 5. Collect and validate asset files
// ---------------------------------------------------------------------------
const ALLOWED_ASSET_EXTENSIONS = new Set([
  '.woff2', '.woff', '.ttf', '.eot', '.otf',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
  '.json', '.txt', '.md',
]);

const assetFiles = []; // Array of { sourcePath, zipPath }
const seenZipPaths = new Set();

function addAssetFile(sourcePath, zipPath) {
  // Resolve to absolute and ensure it doesn't escape theme directory
  const resolved = path.resolve(themeDir, sourcePath);
  const relative = path.relative(themeDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    console.error(`Error: Asset path escapes theme directory: ${sourcePath}`);
    process.exit(1);
  }

  // Check file exists
  if (!fs.existsSync(resolved)) {
    console.error(`Error: Asset file not found: ${resolved}`);
    process.exit(1);
  }

  // Check extension allowlist
  const ext = path.extname(resolved).toLowerCase();
  if (!ALLOWED_ASSET_EXTENSIONS.has(ext)) {
    console.error(`Error: Asset file extension "${ext}" is not allowed: ${sourcePath}`);
    console.error(`  Allowed: ${[...ALLOWED_ASSET_EXTENSIONS].join(', ')}`);
    process.exit(1);
  }

  // Normalize zip path separators
  const normalizedZipPath = zipPath.replace(/\\/g, '/');

  // Check for duplicate zip paths
  if (seenZipPaths.has(normalizedZipPath)) {
    console.error(`Error: Duplicate asset ZIP path: ${normalizedZipPath}`);
    process.exit(1);
  }
  seenZipPaths.add(normalizedZipPath);

  assetFiles.push({ sourcePath: resolved, zipPath: normalizedZipPath });
}

// Collect font files from theme.fonts.files[]
if (theme.fonts && Array.isArray(theme.fonts.files)) {
  for (const fontFile of theme.fonts.files) {
    if (fontFile.src) {
      const fontBasename = path.basename(fontFile.src);
      addAssetFile(fontFile.src, `assets/fonts/${fontBasename}`);
    }
  }
}

// Collect named assets from theme.assets
if (theme.assets) {
  if (theme.assets.favicon) {
    addAssetFile(theme.assets.favicon, `assets/${path.basename(theme.assets.favicon)}`);
  }
  if (theme.assets.logo) {
    addAssetFile(theme.assets.logo, `assets/${path.basename(theme.assets.logo)}`);
  }
  if (theme.assets.logoSmall) {
    addAssetFile(theme.assets.logoSmall, `assets/${path.basename(theme.assets.logoSmall)}`);
  }

  // Collect additional asset files (preserve relative paths under assets/)
  if (Array.isArray(theme.assets.files)) {
    for (const filePath of theme.assets.files) {
      // Preserve the relative path structure under assets/
      const relativePath = path.normalize(filePath).replace(/\\/g, '/');
      addAssetFile(filePath, `assets/${relativePath}`);
    }
  }
}

if (assetFiles.length > 0) {
  console.log(`  Assets: ${assetFiles.length} file(s)`);
  for (const af of assetFiles) {
    console.log(`    ${af.zipPath}`);
  }
}

// ---------------------------------------------------------------------------
// 6. Rewrite CSS/SCSS url() paths to be ZIP-relative
// ---------------------------------------------------------------------------
// Build a lookup map: font filename → zip path
const assetFilenameLookup = new Map();
for (const af of assetFiles) {
  const basename = path.basename(af.zipPath);
  assetFilenameLookup.set(basename, af.zipPath);
}

/**
 * Rewrite url() references in CSS/SCSS content so they point to the correct
 * relative path within the ZIP structure.
 *
 * Since both css/{id}.css and scss/{id}.scss live one directory deep,
 * asset paths become ../{zipPath} (e.g. ../assets/fonts/xyz.woff2).
 */
function rewriteUrls(content, fileLabel) {
  if (assetFilenameLookup.size === 0) return content;

  return content.replace(/url\(([^)]+)\)/g, (match, rawUrl) => {
    // Strip quotes and whitespace
    const url = rawUrl.trim().replace(/^['"]|['"]$/g, '');

    // Skip data URIs and protocol URLs
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return match;
    }

    // Extract the filename (basename) from the url
    const filename = path.posix.basename(url.split('?')[0].split('#')[0]);

    // Look up in our asset map
    if (assetFilenameLookup.has(filename)) {
      const zipPath = assetFilenameLookup.get(filename);
      const rewritten = `url(../${zipPath})`;
      if (rewritten !== match) {
        console.log(`  URL rewrite (${fileLabel}): ${url} → ../${zipPath}`);
      }
      return rewritten;
    }

    return match;
  });
}

// Rewrite CSS content
let cssContent = fs.readFileSync(cssSourcePath, 'utf-8');
const originalCssContent = cssContent;
cssContent = rewriteUrls(cssContent, 'CSS');
const cssWasRewritten = cssContent !== originalCssContent;
if (cssWasRewritten) {
  console.log('  CSS url() paths rewritten for ZIP structure.');
}

// Rewrite SCSS content (if available)
let scssContent = null;
if (scssSourcePath) {
  scssContent = fs.readFileSync(scssSourcePath, 'utf-8');
  const originalScssContent = scssContent;
  scssContent = rewriteUrls(scssContent, 'SCSS');
  const scssWasRewritten = scssContent !== originalScssContent;
  if (scssWasRewritten) {
    console.log('  SCSS url() paths rewritten for ZIP structure.');
  }
}

// ---------------------------------------------------------------------------
// 7. Generate README.md (was section 6)
// ---------------------------------------------------------------------------
// Derive supported modes from colorVariants
const allModeIds = new Set();
if (Array.isArray(theme.colorVariants)) {
  for (const variant of theme.colorVariants) {
    if (Array.isArray(variant.modes)) {
      for (const mode of variant.modes) {
        allModeIds.add(mode.id);
      }
    }
  }
}
const modesText = allModeIds.size > 0 ? [...allModeIds].join(', ') : 'light';

const tagsText = theme.tags && theme.tags.length > 0
  ? theme.tags.join(', ')
  : '';

const coreVersionText = theme.coreVersion || (theme.dependencies && theme.dependencies.core) || '>=1.5.0';

const readme = `# ${theme.name}

${theme.description || ''}

- **Version:** ${theme.version}
- **Author:** ${theme.author || 'Unknown'}
- **License:** ${theme.license || 'MIT'}
- **Modes:** ${modesText}
- **Core Version:** ${coreVersionText}
${tagsText ? `- **Tags:** ${tagsText}` : ''}

## Quick Start — CSS Only

Drop the compiled CSS file into your project:

\`\`\`html
<link rel="stylesheet" href="css/${theme.id}.css">
\`\`\`

No build tools required. The CSS is fully self-contained.

## Quick Start — SCSS Customization

If you want to customize theme variables before compiling:

1. Install the core package:
   \`\`\`bash
   npm install @keenmate/pure-admin-core
   \`\`\`

2. Compile with sass:
   \`\`\`bash
   sass scss/${theme.id}.scss output.css \\
     --load-path=node_modules \\
     --silence-deprecation=import
   \`\`\`

3. Or import in your own SCSS and override variables before the import.

## Mode Switching
${allModeIds.size > 1
  ? `This theme supports ${modesText} modes. Add the mode class to toggle:

\`\`\`html
<body class="pa-mode-dark">  <!-- dark mode -->
<body class="pa-mode-light"> <!-- light mode -->
\`\`\``
  : `This theme supports ${modesText} mode.`}

${assetFiles.length > 0 ? `## Included Assets

This theme bundles the following static assets:

${assetFiles.map(af => `- \`${af.zipPath}\``).join('\n')}

These files are located in the \`assets/\` directory of the theme package.

` : ''}## More Information

- Pure Admin documentation: https://pure-admin.keenmate.dev
- Theme gallery: https://pure-theme-park.keenmate.dev
${theme.homepage ? `- Theme homepage: ${theme.homepage}` : ''}

---
*Generated by pure-admin-core pack-theme*
`;

// ---------------------------------------------------------------------------
// 7. Create the zip
// ---------------------------------------------------------------------------
const zipName = `pure-admin-theme-${theme.id}-${theme.version}.zip`;

if (!outputDir) {
  outputDir = path.join(themeDir, 'dist');
}
outputDir = path.resolve(outputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const zipPath = path.join(outputDir, zipName);

// Try to load archiver, fall back to manual zip creation
let archiver;
try {
  archiver = require('archiver');
} catch {
  console.error('Error: "archiver" package is required but not installed.');
  console.error('Install it with: npm install archiver --save-dev');
  process.exit(1);
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('error', (err) => {
  console.error(`Error creating zip: ${err.message}`);
  process.exit(1);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(`Warning: ${err.message}`);
  } else {
    throw err;
  }
});

output.on('close', () => {
  const sizeKB = (archive.pointer() / 1024).toFixed(1);
  console.log(`\nCreated: ${zipPath}`);
  console.log(`Size: ${sizeKB} KB`);
  console.log('\nZip contents:');
  console.log(`  theme.json`);
  console.log(`  css/${theme.id}.css`);
  if (scssSourcePath) console.log(`  scss/${theme.id}.scss`);
  if (thumbnailPath) console.log(`  preview/${path.basename(thumbnailPath)}`);
  for (const af of assetFiles) {
    console.log(`  ${af.zipPath}`);
  }
  console.log(`  README.md`);
});

archive.pipe(output);

// ---------------------------------------------------------------------------
// Compute SHA-256 checksums and enrich theme.json for the ZIP
// ---------------------------------------------------------------------------
function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function sha256String(content) {
  return `sha256:${crypto.createHash('sha256').update(content, 'utf-8').digest('hex')}`;
}

// Checksum the rewritten content (what actually goes into the ZIP)
const checksums = {
  css: sha256String(cssContent),
};
if (scssSourcePath && scssContent !== null) {
  checksums.scss = sha256String(scssContent);
}

// Compute asset checksums
if (assetFiles.length > 0) {
  checksums.assets = {};
  for (const af of assetFiles) {
    checksums.assets[af.zipPath] = sha256File(af.sourcePath);
  }
}

const enrichedTheme = { ...theme, checksums };
// Remove $schema from the packed copy (not useful inside the ZIP)
delete enrichedTheme.$schema;

const enrichedJson = JSON.stringify(enrichedTheme, null, 2) + '\n';
console.log(`  Checksums:`);
console.log(`    CSS:  ${checksums.css}`);
if (checksums.scss) console.log(`    SCSS: ${checksums.scss}`);
if (checksums.assets) {
  for (const [zipPath, hash] of Object.entries(checksums.assets)) {
    console.log(`    ${zipPath}: ${hash}`);
  }
}

// Add enriched theme.json (with checksums)
archive.append(enrichedJson, { name: 'theme.json' });

// Add CSS (use rewritten content)
archive.append(cssContent, { name: `css/${theme.id}.css` });

// Add SCSS (if available, use rewritten content)
if (scssSourcePath && scssContent !== null) {
  archive.append(scssContent, { name: `scss/${theme.id}.scss` });
}

// Add preview thumbnail (if available)
if (thumbnailPath) {
  archive.file(thumbnailPath, { name: `preview/${path.basename(thumbnailPath)}` });
}

// Add asset files
for (const af of assetFiles) {
  archive.file(af.sourcePath, { name: af.zipPath });
}

// Add generated README
archive.append(readme, { name: 'README.md' });

archive.finalize();
