#!/usr/bin/env node

// =============================================================================
// pack-themes.js — Pack one or all themes (build + ZIP)
// =============================================================================
// Distributed by pureadmin.io — https://pureadmin.io/api/tools/pack-themes.js
// =============================================================================

const TOOL_VERSION = '1.0.0';
const TOOL_NAME = 'pack-themes.js';
const UPDATE_URL = process.env.PUREADMIN_URL
  ? `${process.env.PUREADMIN_URL.replace(/\/api\/.*$/, '')}/api/tools/${TOOL_NAME}`
  : `https://pureadmin.io/api/tools/${TOOL_NAME}`;

// ---------------------------------------------------------------------------
// Self-update check (non-blocking, best-effort)
// ---------------------------------------------------------------------------
async function checkForUpdates() {
  if (process.env.PUREADMIN_NO_UPDATE_CHECK === '1') return;
  try {
    const https = require(UPDATE_URL.startsWith('https') ? 'https' : 'http');
    const res = await new Promise((resolve, reject) => {
      const req = https.get(UPDATE_URL, { method: 'HEAD', timeout: 3000 }, resolve);
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
    const serverVersion = res.headers['x-tool-version'];
    if (serverVersion && serverVersion !== TOOL_VERSION) {
      console.log(`\n  Update available: ${TOOL_NAME} ${TOOL_VERSION} → ${serverVersion}`);
      console.log(`  Run: curl -o ${TOOL_NAME} ${UPDATE_URL}\n`);
      if (process.env.PUREADMIN_AUTO_UPDATE === '1') {
        console.log('  Auto-updating...');
        const fs = require('fs');
        const data = await new Promise((resolve, reject) => {
          https.get(UPDATE_URL, { timeout: 10000 }, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
          }).on('error', reject);
        });
        fs.writeFileSync(__filename, data);
        console.log('  Updated. Re-run the command.\n');
        process.exit(0);
      }
    }
  } catch {}
}
checkForUpdates();

// =============================================================================
// Main script
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const themeName = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || null;

if (process.argv.includes('--version') || process.argv.includes('-V')) {
  console.log(`${TOOL_NAME} v${TOOL_VERSION}`);
  process.exit(0);
}

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
