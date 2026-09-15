#!/usr/bin/env node
/**
 * The brand kit's machine-checkable rules, run against the BUILT output.
 *
 * The aedificare-brand-kit skill is the source of truth and is not restated
 * here; each check below names the rule it enforces. Anything the kit says
 * that a machine cannot settle (one loud move per surface, no explaining, the
 * dove once per sequence) is a human duty and is listed in CLAUDE.md as one.
 * Computed-style rules (Acid once per surface, contrast) live in verify.cjs,
 * which has a browser. Runs inside `npm run build`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || 'dist';
const fails = [];
const fail = (file, rule, sample) => fails.push(`  ${rule.padEnd(22)} ${file}${sample ? `\n${''.padEnd(25)}${sample.slice(0, 100)}` : ''}`);

const ALLOWED_FONTS = /^(['"]?(Bricolage Grotesque|Martian Mono)['"]?|system-ui|ui-monospace|sans-serif|monospace|inherit)$/;

function checkCss(file, css) {
  for (const m of css.matchAll(/border-radius\s*:\s*([^;}]+)/g)) {
    for (const v of m[1].matchAll(/([\d.]+)(px|rem|em|%)/g)) if (+v[1] > 2) fail(file, 'radius>2px', m[0]);
  }
  for (const re of [/box-shadow\s*:\s*(?!none)/, /text-shadow\s*:\s*(?!none)/, /backdrop-filter\s*:/, /filter\s*:[^;}]*blur\(/, /gradient\(/])
    if (re.test(css)) fail(file, 'no shadow/blur/gradient', String(css.match(re)[0]));
  if (/font-style\s*:\s*italic/.test(css)) fail(file, 'no italic', 'font-style: italic');
  if (/text-decoration(?:-line)?\s*:\s*[^;}]*underline/.test(css)) fail(file, 'no underline', 'text-decoration: underline');
  if (/text-align\s*:\s*center/.test(css)) fail(file, 'never centred', 'text-align: center');
  // Motion: 120ms or 900ms, nothing eases. 0s is the reduced-motion kill switch.
  for (const m of css.matchAll(/(?:transition|animation)(?:-duration)?\s*:\s*([^;}]+)/g)) {
    for (const d of m[1].matchAll(/([\d.]+)(m?s)\b/g)) {
      const ms = d[2] === 's' ? +d[1] * 1000 : +d[1];
      if (![0, 120, 900].includes(ms)) fail(file, 'duration 120|900ms', m[0]);
    }
    if (/\bease(?:-in|-out|-in-out)?\b/.test(m[1])) fail(file, 'nothing eases', m[0]);
  }
  for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)/g)) {
    for (const fam of m[1].split(',').map((s) => s.trim()).filter(Boolean))
      if (!ALLOWED_FONTS.test(fam)) fail(file, 'no third typeface', m[0]);
  }
}

function textOf(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function checkHtml(file, html) {
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) checkCss(file, m[1]);
  for (const m of html.matchAll(/style="([^"]*)"/g)) checkCss(file, m[1]);
  const text = textOf(html);
  if (text.includes('—')) fail(file, 'no em-dash', text.slice(Math.max(0, text.indexOf('—') - 40), text.indexOf('—') + 40));
  if (/<(em|i|u)\b/.test(html)) fail(file, 'no italic/underline tags', html.match(/<(em|i|u)\b[^>]*>/)[0]);
  for (const h of html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)) {
    const t = textOf(h[1]);
    if (t.includes('!')) fail(file, 'no exclamation', t);
  }
  if (/\p{Extended_Pictographic}/u.test(text)) fail(file, 'no emoji', text.match(/.{0,30}\p{Extended_Pictographic}.{0,30}/u)[0]);
  if (/\bAedificare is\b/i.test(text)) fail(file, 'no "Aedificare is"', text.match(/.{0,40}Aedificare is.{0,40}/i)[0]);
  const praise = text.match(/\b(leading|premier|innovative|world-class|bespoke|curated)\b/i);
  if (praise) fail(file, 'no self-praise', text.slice(Math.max(0, praise.index - 40), praise.index + 40));
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith('.html')) checkHtml(f, fs.readFileSync(f, 'utf8'));
    else if (f.endsWith('.css')) checkCss(f, fs.readFileSync(f, 'utf8'));
  }
}
walk(ROOT);

if (fails.length) {
  console.error(`\ncheck-brand: ${fails.length} violation(s)\n`);
  console.error(fails.join('\n'));
  console.error('');
  process.exit(1);
}
console.log('check-brand: clean');
