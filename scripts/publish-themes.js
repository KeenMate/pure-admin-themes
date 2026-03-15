#!/usr/bin/env node

// =============================================================================
// publish-themes.js — Pack + upload one or all themes to pure-theme-park
// =============================================================================
// Usage:
//   node scripts/publish-themes.js [theme] [--api-key KEY] [--url URL]
//
// Examples:
//   node scripts/publish-themes.js --api-key xxx           # publish all
//   node scripts/publish-themes.js audi --api-key xxx      # publish one
//   make publish THEME=audi PUREADMIN_API_KEY=xxx         # via Makefile
//
// API key can come from --api-key flag or PUREADMIN_API_KEY env var.
// URL can come from --url flag or PUREADMIN_URL env var.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Load .pureadmin config (project-level, then user home)
// ---------------------------------------------------------------------------
function loadConfig() {
  const locations = [
    path.join(root, '.pureadmin'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.pureadmin')
  ];

  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      const config = {};
      const lines = fs.readFileSync(loc, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          config[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
        }
      }
      return config;
    }
  }
  return {};
}

const config = loadConfig();

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let themeName = null;
let apiKey = process.env.PUREADMIN_API_KEY || config.PUREADMIN_API_KEY || '';
let uploadUrl = process.env.PUREADMIN_URL || config.PUREADMIN_URL || 'https://pureadmin.io/api/themes/upload';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api-key' && args[i + 1]) {
    apiKey = args[++i];
  } else if (args[i] === '--url' && args[i + 1]) {
    uploadUrl = args[++i];
  } else if (!args[i].startsWith('--') && !themeName) {
    themeName = args[i];
  }
}

if (!apiKey) {
  console.error('Error: API key is required.');
  console.error('Usage: node scripts/publish-themes.js [theme] --api-key KEY');
  console.error('   or: PUREADMIN_API_KEY=xxx node scripts/publish-themes.js [theme]');
  console.error('   or: make publish THEME=audi PUREADMIN_API_KEY=xxx');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Discover themes
// ---------------------------------------------------------------------------
const allThemes = fs.readdirSync(root).filter(dir => {
  const jsonPath = path.join(root, dir, 'theme.json');
  return fs.existsSync(jsonPath) && fs.statSync(path.join(root, dir)).isDirectory();
});

const targets = themeName ? [themeName] : allThemes;

if (themeName && !allThemes.includes(themeName)) {
  console.error(`Error: theme "${themeName}" not found. Available: ${allThemes.join(', ')}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Pack first
// ---------------------------------------------------------------------------
console.log('=== Packing ===');
const packScript = path.join(__dirname, 'pack-themes.js');
execSync(`node "${packScript}" ${themeName || ''}`, { cwd: root, stdio: 'inherit' });

// ---------------------------------------------------------------------------
// Upload each
// ---------------------------------------------------------------------------
// ANSI colors
const green = s => `\x1b[32m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;
const dim = s => `\x1b[2m${s}\x1b[0m`;
const bold = s => `\x1b[1m${s}\x1b[0m`;

console.log(`\n${bold('=== Uploading ===')}`);
let failed = false;
let updated = 0, unchanged = 0, errors = 0;

for (const t of targets) {
  const themeJson = JSON.parse(fs.readFileSync(path.join(root, t, 'theme.json'), 'utf-8'));
  const zipName = `pure-admin-theme-${t}-${themeJson.version}.zip`;
  const zipPath = path.join(root, 'dist', zipName);

  if (!fs.existsSync(zipPath)) {
    console.error(`  ${red('✗')} ${t} — ZIP not found: ${zipPath}`);
    failed = true;
    errors++;
    continue;
  }

  process.stdout.write(`  ${dim('↑')} ${t} v${themeJson.version}... `);
  try {
    const output = execSync(
      `curl -sf -X POST "${uploadUrl}" -H "Authorization: Bearer ${apiKey}" -F "theme=@${zipPath}"`,
      { cwd: root, encoding: 'utf-8' }
    );

    const result = JSON.parse(output);
    if (result.status === 'unchanged') {
      console.log(yellow('unchanged'));
      unchanged++;
    } else {
      console.log(green('✓ updated'));
      updated++;
    }
  } catch (err) {
    console.log(red('✗ failed'));
    failed = true;
    errors++;
  }
}

// Summary
console.log(`\n${bold('Summary:')} ${green(`${updated} updated`)}, ${yellow(`${unchanged} unchanged`)}, ${red(`${errors} failed`)}\n`);

if (failed) {
  process.exit(1);
}
