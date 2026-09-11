#!/usr/bin/env node
// Contrast audit for compiled theme CSS — light AND dark scopes.
//
// For each theme × scope: build the scope cascade (always :root, plus the
// matching .pc-mode-<scope> overrides, excluding the opposite mode), resolve
// every --token to a final color (following var() chains + fallbacks), then
// compute WCAG contrast for --*-text ↔ --*-bg sibling pairs (and role fills).
// Flags pairs below a threshold.
//
// Translucent fills (rgba alpha < 1) are alpha-composited over the nearest
// resolvable opaque surface (a sibling like --pc-sidebar-submenu-bg, then
// progressively more general surfaces, then the scope's page background) so
// selected/hover states — which are almost always semi-transparent tints —
// are judged instead of silently skipped.
//
// Usage: node contrast-audit.mjs [themesDir=.] [theme] [--light|--dark|--both]
//   node contrast-audit.mjs .                  all themes, both scopes
//   node contrast-audit.mjs . gruvbox --light  one theme, light scope
//   node contrast-audit.mjs . --dark           all themes, dark scope
// (scope is a flag, not positional, because a theme is literally named "dark")
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const THRESHOLD = 3.0;          // below this = likely unreadable UI text
// Args: [themesDir] [theme]   scope via flag --light | --dark | --both (default).
// Scope is a flag, not positional, because a theme is literally named "dark".
let scopeArg = 'both';
const pos = [];
for (const a of process.argv.slice(2)) {
  if (/^--?(light|dark|both)$/.test(a)) scopeArg = a.replace(/^--?/, '');
  else pos.push(a);
}
const themesDir = pos[0] || '.';
const only = pos[1];            // optional: audit just this one theme
const SCOPES = scopeArg === 'both' ? ['light', 'dark'] : [scopeArg];

// opaque fallback backdrop when nothing else resolves, per scope
const SCOPE_DEFAULT_BG = { light: [255, 255, 255], dark: [26, 26, 26] };
// general surfaces to fall back to (most→least specific), in addition to
// name-derived siblings, before the scope default.
const GENERAL_SURFACES = [
  '--pa-card-bg', '--pc-subtle-bg', '--base-subtle-bg',
  '--pc-page-bg', '--base-page-bg', '--pc-main-bg', '--base-main-bg', '--pc-sidebar-bg',
];

// ---- color parsing ----------------------------------------------------------
function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  let a = 1;
  if (h.length === 8) { a = parseInt(h.slice(6, 8), 16) / 255; h = h.slice(0, 6); }
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}
const NAMED = { transparent: [0, 0, 0, 0], black: [0, 0, 0, 1], white: [255, 255, 255, 1] };
// returns [r,g,b,a] (a in 0..1) or null for hsl / unknown-named / unresolved
function parseColor(v) {
  if (!v) return null;
  v = v.trim();
  if (NAMED[v.toLowerCase()]) return NAMED[v.toLowerCase()].slice();
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return hexToRgb(v);
  const m = v.match(/^rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[, /]+/).map((x) => x.trim()).filter(Boolean);
    const rgb = [+p[0], +p[1], +p[2]];
    if (rgb.some((x) => Number.isNaN(x))) return null; // e.g. rgba($scss-var, ...)
    const a = p[3] !== undefined ? parseFloat(p[3]) : 1;
    return [...rgb, Number.isNaN(a) ? 1 : a];
  }
  return null;
}
// split `s` on `sep` at paren-depth 0 (so nested var()/rgb()/color-mix() survive)
function topSplit(s, sep) {
  const out = []; let d = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') d++; else if (ch === ')') d--;
    if (ch === sep && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}
// contents between a function's outer parens: funcInner('color-mix(a,b)') → 'a,b'
function funcInner(v) {
  const i = v.indexOf('(');
  if (i < 0) return null;
  let d = 0;
  for (let j = i; j < v.length; j++) {
    if (v[j] === '(') d++;
    else if (v[j] === ')' && --d === 0) return v.slice(i + 1, j);
  }
  return null;
}
// evaluate color-mix(in <space>, C1 [p1%], C2 [p2%]) with premultiplied-alpha
// mixing. Colorspace is ignored (mixed in srgb) — a close-enough approximation
// for the srgb/hsl mixes the themes use; good to ±a few % on the ratio.
function resolveColorMix(v, map, seen) {
  const inner = funcInner(v);
  if (!inner) return null;
  const parts = topSplit(inner, ',');           // [ 'in srgb', 'C1 p1%', 'C2 p2%' ]
  if (parts.length < 3) return null;
  const comp = (str) => {
    let pct;
    const cols = [];
    for (const t of topSplit(str, ' ').filter(Boolean)) {
      if (/^[\d.]+%$/.test(t)) pct = parseFloat(t) / 100; else cols.push(t);
    }
    return { col: resolveValue(cols.join(' '), map, new Set(seen)), pct };
  };
  const c1 = comp(parts[1]), c2 = comp(parts[2]);
  if (!c1.col || !c2.col) return null;
  let p1 = c1.pct, p2 = c2.pct;
  const bothExplicit = p1 !== undefined && p2 !== undefined;
  if (p1 === undefined && p2 === undefined) { p1 = 0.5; p2 = 0.5; }
  else if (p1 === undefined) p1 = 1 - p2;
  else if (p2 === undefined) p2 = 1 - p1;
  const sum = p1 + p2;
  if (sum <= 0) return null;
  const w1 = p1 / sum, w2 = p2 / sum;
  const a1 = c1.col[3], a2 = c2.col[3];
  let a = a1 * w1 + a2 * w2;
  const rgb = a === 0 ? [0, 0, 0]
    : [0, 1, 2].map((i) => (c1.col[i] * a1 * w1 + c2.col[i] * a2 * w2) / a);
  if (bothExplicit && sum < 1) a *= sum;         // sub-100% total dilutes alpha
  return [...rgb, a];
}
// alpha-composite src (rgba) over an opaque dst (rgb) → opaque rgb
function over(src, dst) {
  const a = src[3] ?? 1;
  if (a >= 1) return src.slice(0, 3);
  return [0, 1, 2].map((i) => Math.round(src[i] * a + dst[i] * (1 - a)));
}
function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ---- resolve a token to a final color value (may be translucent) -----------
function resolve(name, map, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const v = map[name];
  if (v === undefined) return null;
  return resolveValue(v, map, seen);
}
function resolveValue(v, map, seen) {
  v = v.trim();
  const direct = parseColor(v);
  if (direct) return direct;
  if (/^color-mix\(/i.test(v)) return resolveColorMix(v, map, seen);
  const m = v.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/i);
  if (m) {
    const ref = resolve(m[1], map, seen);
    if (ref) return ref;
    if (m[2]) return resolveValue(m[2], map, new Set(seen));
  }
  return null;
}

// ---- extract the cascade declarations for a scope --------------------------
// Keep :root (baseline, applies in EVERY mode) + .pc-mode-<scope> overrides +
// .pa-color-* swatches; drop only PURE opposite-mode blocks. A combined
// `:root, .pc-mode-light` selector (how light-first themes author their
// baseline) still contributes its :root baseline to the dark scope — only a
// bare `.pc-mode-<other>` block is discarded. Source order = last-write-wins,
// matching how themes layer :root then .pc-mode-<scope>.
function scopeMap(css, scope) {
  const other = scope === 'light' ? 'dark' : 'light';
  const otherRe = new RegExp(`\\.pc-mode-${other}`);
  const sameRe = new RegExp(`\\.pc-mode-${scope}`);
  const rootRe = /(^|,)\s*:root/;
  const map = {};
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    const hasRoot = rootRe.test(sel);
    // skip only a PURE opposite-mode block (no :root baseline, not our scope)
    if (otherRe.test(sel) && !hasRoot && !sameRe.test(sel)) continue;
    const keep = hasRoot || sameRe.test(sel) || /\.pa-color-/.test(sel);
    if (!keep) continue;
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const k = decl.slice(0, i).trim();
      if (k.startsWith('--')) map[k] = decl.slice(i + 1).trim();
    }
  }
  return map;
}

// ---- resolve a background token to an OPAQUE rgb, compositing if needed -----
// Candidate backdrops for a translucent fill: name-derived siblings first
// (--pc-sidebar-submenu-active-bg → --pc-sidebar-submenu-bg → --pc-sidebar-bg),
// then general surfaces, then the scope default.
function siblingSurfaces(bg) {
  const base = bg
    .replace(/-(bg|background)$/, '')
    .replace(/-(active|hover|focus|selected|open|current|checked|pressed)$/, '');
  const segs = base.split('-').filter(Boolean); // ['pc','sidebar','submenu']
  const out = [];
  let s = segs.slice();
  while (s.length >= 2) {                        // stop before the bare namespace
    out.push('--' + s.join('-') + '-bg', '--' + s.join('-'));
    s = s.slice(0, -1);
  }
  return out;
}
function opaqueBg(bg, map, scope) {
  const candidates = [bg, ...siblingSurfaces(bg), ...GENERAL_SURFACES];
  const dflt = SCOPE_DEFAULT_BG[scope];
  // resolve each candidate; composite translucent layers over the next opaque one
  const layers = [];
  for (const name of candidates) {
    const c = resolve(name, map);
    if (!c) continue;
    if (c[3] >= 1) { layers.push(c); break; }    // first opaque terminates the stack
    if (name !== bg) continue;                   // only stack the target's own translucency
    layers.push(c);
  }
  let base = layers.length && layers[layers.length - 1][3] >= 1
    ? layers.pop().slice(0, 3) : dflt;
  for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
  return base;
}

// ---- build the pair list ----------------------------------------------------
function pairs(map) {
  const out = [];
  const has = (n) => map[n] !== undefined;
  // role "-text" tokens are foreground-on-LIGHT-surface (per the fill/fg model),
  // NOT text placed on the role fill — pairing them with the fill is a false
  // positive. On-fill text is --base-text-on-<role> / --pa-btn-<role>-text.
  const roleFgFalsePositive = /^--(base|pc)-(success|danger|warning|info|primary|secondary)-text$/;
  for (const k of Object.keys(map)) {
    if (!k.endsWith('-text')) continue;
    if (roleFgFalsePositive.test(k)) continue;
    const stem = k.slice(0, -'-text'.length);
    for (const bg of [stem + '-bg', stem + '-background', stem]) {
      if (bg !== k && has(bg)) { out.push([k, bg]); break; }
    }
  }
  for (const role of ['success', 'danger', 'warning', 'info', 'primary', 'secondary']) {
    const bg = `--pa-${role}-bg`, txt = `--base-text-on-${role}`;
    if (has(bg) && has(txt)) out.push([txt, bg]);
    const bbg = `--pa-badge-${role}-bg`, btx = `--pa-badge-${role}-text`;
    if (has(bbg) && has(btx)) out.push([btx, bbg]);
  }
  return out;
}

// ---- run --------------------------------------------------------------------
const themes = readdirSync(themesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!only || d.name === only) && existsSync(`${themesDir}/${d.name}/dist/${d.name}.css`))
  .map((d) => d.name);

let totalFlags = 0;
for (const t of themes) {
  const css = readFileSync(`${themesDir}/${t}/dist/${t}.css`, 'utf8');
  for (const scope of SCOPES) {
    const map = scopeMap(css, scope);
    const flags = [];
    for (const [txt, bg] of pairs(map)) {
      const c2 = opaqueBg(bg, map, scope);       // opaque effective fill
      let c1 = resolve(txt, map);                // text may be translucent
      if (!c1) continue;                          // unresolved (color-mix/etc.) → skip
      if (c1[3] < 1) c1 = over(c1, c2);           // composite translucent text over fill
      const ratio = contrast(c1, c2);
      if (ratio < THRESHOLD) flags.push({ txt, bg, ratio: ratio.toFixed(2) });
    }
    if (flags.length) {
      totalFlags += flags.length;
      console.log(`\n■ ${t} [${scope}] — ${flags.length} low-contrast pair(s):`);
      for (const f of flags) console.log(`    ${f.ratio}:1  ${f.txt}  on  ${f.bg}`);
    }
  }
}
console.log(`\n${totalFlags === 0 ? '✓ no flags' : `total flags: ${totalFlags}`} (threshold ${THRESHOLD}:1, scope: ${SCOPES.join('+')}, translucent fills composited, color-mix evaluated)`);
