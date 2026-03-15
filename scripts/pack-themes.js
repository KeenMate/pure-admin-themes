#!/usr/bin/env node

// =============================================================================
// pack-themes.js — Pack one or all themes (build + ZIP)
// =============================================================================
// Usage:
//   node scripts/pack-themes.js              # pack all
//   node scripts/pack-themes.js audi         # pack one
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const themeName = process.argv[2] || null;

// Discover themes
const allThemes = fs.readdirSync(root).filter(dir => {
  const jsonPath = path.join(root, dir, 'theme.json');
  return fs.existsSync(jsonPath) && fs.statSync(path.join(root, dir)).isDirectory();
});

const targets = themeName ? [themeName] : allThemes;

// Validate
if (themeName && !allThemes.includes(themeName)) {
  console.error(`Error: theme "${themeName}" not found. Available: ${allThemes.join(', ')}`);
  process.exit(1);
}

// Build first
console.log('=== Building ===');
const buildScript = path.join(__dirname, 'build-themes.js');
execSync(`node "${buildScript}" ${themeName || ''}`, { cwd: root, stdio: 'inherit' });

// Pack each
console.log('\n=== Packing ===');
const packScript = path.join(__dirname, 'pack-theme.js');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

for (const t of targets) {
  execSync(`node "${packScript}" ${t} --output dist`, { cwd: root, stdio: 'inherit' });
}
