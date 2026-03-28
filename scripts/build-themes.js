#!/usr/bin/env node

// =============================================================================
// build-themes.js — Build one or all themes (SCSS → CSS)
// =============================================================================
// Distributed by pureadmin.io — https://pureadmin.io/api/tools/build-themes.js
// =============================================================================

const TOOL_VERSION = '1.0.0';
const TOOL_NAME = 'build-themes.js';
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

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-V')) {
  console.log(`${TOOL_NAME} v${TOOL_VERSION}`);
  process.exit(0);
}

const root = path.resolve(__dirname, '..');
const themeName = args.find(a => !a.startsWith('--')) || null;

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
