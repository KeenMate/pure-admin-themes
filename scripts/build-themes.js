#!/usr/bin/env node

// =============================================================================
// build-themes.js — Build one or all themes (SCSS → CSS)
// =============================================================================
// Usage:
//   node scripts/build-themes.js              # build all
//   node scripts/build-themes.js audi         # build one
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const themeName = process.argv[2] || null;

// Discover themes: directories with theme.json
const allThemes = fs.readdirSync(root).filter(dir => {
  const jsonPath = path.join(root, dir, 'theme.json');
  return fs.existsSync(jsonPath) && fs.statSync(path.join(root, dir)).isDirectory();
});

const targets = themeName ? [themeName] : allThemes;

for (const t of targets) {
  const themeDir = path.join(root, t);
  const themeJsonPath = path.join(themeDir, 'theme.json');

  if (!fs.existsSync(themeJsonPath)) {
    console.error(`Error: theme "${t}" not found (no ${t}/theme.json)`);
    process.exit(1);
  }

  const scss = path.join(t, 'src', 'scss', `${t}.scss`);
  const outDir = path.join(t, 'dist');
  const css = path.join(outDir, `${t}.css`);

  if (!fs.existsSync(path.join(root, scss))) {
    console.error(`Error: SCSS source not found: ${scss}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(root, outDir), { recursive: true });

  console.log(`Building ${t}...`);
  const cmd = `npx sass ${scss} ${css} --no-source-map --silence-deprecation=import --load-path=node_modules`;
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

console.log(`\nBuilt ${targets.length} theme(s): ${targets.join(', ')}`);
