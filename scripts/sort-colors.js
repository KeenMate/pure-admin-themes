const fs = require('fs');
const path = require('path');

const themesDir = path.resolve(__dirname, '..');
const themes = fs.readdirSync(themesDir).filter(d => {
  try { return fs.statSync(path.join(themesDir, d, 'src', 'scss')).isDirectory(); } catch { return false; }
});

function hexToLum(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  return 0.299*r + 0.587*g + 0.114*b;
}

function resolveHex(value, content) {
  if (value.startsWith('#')) return value;
  // It's a SCSS variable reference like $dm-blue-bright — find its hex definition
  const escaped = value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(escaped + '\\s*:\\s*(#[0-9a-fA-F]{3,8})');
  const m = content.match(re);
  return m ? m[1] : null;
}

const colorRe = /^[$]color-([1-9]):\s*(.+?)\s*;(.*)$/;
const textRe = /^[$]color-([1-9])-text:\s*(.+?)\s*;(.*)$/;

const dryRun = process.argv.includes('--dry-run');

for (const theme of themes) {
  const scssDir = path.join(themesDir, theme, 'src', 'scss');
  const files = fs.readdirSync(scssDir).filter(f => f.endsWith('.scss'));

  for (const file of files) {
    const filePath = path.join(scssDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Collect color slots and text slots with their line indices
    const colorEntries = [];
    const textEntries = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const tm = line.match(textRe);
      if (tm) {
        const slot = parseInt(tm[1]);
        if (!textEntries.find(e => e.slot === slot)) {
          textEntries.push({ slot, value: tm[2].trim(), comment: tm[3].trim(), lineIdx: i });
        }
        continue;
      }

      const cm = line.match(colorRe);
      if (cm) {
        const slot = parseInt(cm[1]);
        if (!colorEntries.find(e => e.slot === slot)) {
          colorEntries.push({ slot, value: cm[2].trim(), comment: cm[3].trim(), lineIdx: i });
        }
      }
    }

    if (colorEntries.length !== 9) continue;

    // Resolve hex and compute luminance
    const withLum = colorEntries.map(c => {
      const hex = resolveHex(c.value, content);
      return { ...c, hex, lum: hex ? hexToLum(hex) : 0 };
    });

    // Sort by luminance (light to dark)
    const sorted = [...withLum].sort((a, b) => b.lum - a.lum);

    // Check if already sorted
    const alreadySorted = sorted.every((c, i) => c.slot === i + 1);
    if (alreadySorted) {
      console.log(`${theme}: already sorted`);
      continue;
    }

    console.log(`\n=== ${theme} ===`);
    sorted.forEach((c, i) => {
      const textEntry = textEntries.find(t => t.slot === c.slot);
      console.log(`  color-${i+1}: ${c.value} (L=${c.lum.toFixed(0)}, was slot ${c.slot})` +
        (textEntry ? ` text: ${textEntry.value}` : ''));
    });

    if (dryRun) continue;

    // Replace color lines in-place (rewrite slot numbers, keep original line positions)
    const colorLineIndices = colorEntries.map(e => e.lineIdx);
    sorted.forEach((entry, newIdx) => {
      const targetLineIdx = colorLineIndices[newIdx];
      const newSlot = newIdx + 1;
      lines[targetLineIdx] = `$color-${newSlot}: ${entry.value};${entry.comment ? '  ' + entry.comment : ''}`;
    });

    // Replace text lines
    if (textEntries.length === 9) {
      const textLineIndices = textEntries.map(e => e.lineIdx);
      sorted.forEach((entry, newIdx) => {
        const targetLineIdx = textLineIndices[newIdx];
        const newSlot = newIdx + 1;
        const origText = textEntries.find(t => t.slot === entry.slot);
        if (origText) {
          lines[targetLineIdx] = `$color-${newSlot}-text: ${origText.value};${origText.comment ? '  ' + origText.comment : ''}`;
        }
      });
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`  -> Updated ${file}`);
  }
}
