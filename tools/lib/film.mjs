/**
 * What the two film generators share: the palette, the ffmpeg search, the
 * surface CSS, the live field, the Chromium context that serves the repo's
 * own fonts and modules to a frame, and the encoder that takes frames on a
 * pipe. tools/generate-video.mjs (the silent films) and
 * tools/generate-film.mjs (the narrated ones) both import from here so a
 * frame in either is the same frame.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { markPath } from '../../src/lib/rose.mjs';

/**
 * Playwright is deliberately not in package.json (CLAUDE.md, Stack). CI and a
 * developer machine install it with `npm i --no-save playwright`, where it
 * resolves by name; the build sandbox has it at a global path. Try the name
 * first, then the sandbox path, so the same tool runs in all three places.
 */
export async function browser() {
  const require = createRequire(import.meta.url);
  let mod;
  try { mod = await import(require.resolve('playwright')); }
  catch { mod = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }
  // require.resolve lands on the CommonJS entry, whose exports arrive under `default`.
  const pw = mod.chromium ? mod : mod.default;
  return pw.chromium.launch();
}

export const ACID = '#CCFF00', MAL = '#00B24F', BOTTLE = '#063B22', VOID = '#050A06', FLASH = '#FFFFFF', SHOCK = '#FF1F5A';
export const GROUND = { void: VOID, bottle: BOTTLE, flash: FLASH };

/* ---- ffmpeg ------------------------------------------------------------- */
function probe(bin) {
  const enc = spawnSync(bin, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  if (enc.status !== 0) return null;
  const dec = spawnSync(bin, ['-hide_banner', '-decoders'], { encoding: 'utf8' }).stdout || '';
  const has = (s, name) => new RegExp(`^ [A-Z.]{6} ${name} `, 'm').test(s);
  const frame = has(dec, 'png') ? 'png' : 'jpeg';
  if (has(enc.stdout, 'libx264')) return { bin, codec: 'libx264', ext: 'mp4', frame, aac: has(enc.stdout, 'aac') };
  if (has(enc.stdout, 'libvpx')) return { bin, codec: 'libvpx', ext: 'webm', frame, aac: false };
  return null;
}

/**
 * The ffmpeg on PATH when it has libx264 (H.264 MP4); otherwise the build
 * Playwright installs beside Chromium, which encodes VP8 WebM only and reads
 * only JPEG frames. YouTube accepts both. FFMPEG=/path overrides the search.
 */
export function findFfmpeg() {
  const candidates = [process.env.FFMPEG, 'ffmpeg'];
  for (const root of [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), '.cache/ms-playwright'), path.join(os.homedir(), 'Library/Caches/ms-playwright')]) {
    if (!root || !fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root)) if (d.startsWith('ffmpeg-')) for (const f of fs.readdirSync(path.join(root, d))) if (f.startsWith('ffmpeg-') && !f.endsWith('.txt')) candidates.push(path.join(root, d, f));
  }
  for (const c of candidates.filter(Boolean)) { const p = probe(c); if (p) return p; }
  console.error('film: no ffmpeg with libx264 or libvpx found. Install ffmpeg or set FFMPEG=/path/to/ffmpeg.');
  process.exit(1);
}

/* ---- the surfaces ------------------------------------------------------- */
export const FORMATS = {
  wide: { W: 1920, H: 1080, gut: 72, word: 300, date: 240, lede: 76, row: 40, url: 140, mast: 18, mark: 36, small: 16, dove: 0.5, fig: 240, name: 140 },
  tall: { W: 1080, H: 1920, gut: 56, word: 200, date: 128, lede: 58, row: 40, url: 92, mast: 18, mark: 36, small: 16, dove: 0.86, fig: 150, name: 96 },
};
export const kLabel = (ks) => ks.map((k) => (Number.isInteger(k) ? String(k) : k.toFixed(2))).join('/');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
/** Round a duration up to the kit's slow beat, 900 ms. */
export const beat = (ms) => Math.ceil(ms / 900) * 900;

export const css = (F, ground, ink) => `
@font-face{font-family:'Bricolage Grotesque';src:url(/fonts/BricolageGrotesque.woff2) format('woff2');font-weight:200 800;font-stretch:75% 100%;font-display:block}
@font-face{font-family:'Martian Mono';src:url(/fonts/MartianMono.woff2) format('woff2');font-weight:100 800;font-stretch:75% 112.5%;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${F.W}px;height:${F.H}px;overflow:hidden}
body{position:relative;background:${ground};color:${ink};font-family:'Bricolage Grotesque',sans-serif}
.mono{font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 500;letter-spacing:.14em;text-transform:uppercase}
.mast{position:absolute;left:${F.gut}px;top:${F.gut * 0.8}px;display:flex;align-items:center;gap:14px;font-variation-settings:'wdth' 75,'wght' 700;font-size:${F.mast}px;letter-spacing:.3em;z-index:2}
.mast svg{width:${F.mark}px;height:${F.mark}px}
.n{position:absolute;left:${F.gut}px;bottom:${F.gut * 0.7}px;font-size:${F.small}px;color:${ACID};z-index:2}
.seed{position:absolute;right:${F.gut}px;bottom:${F.gut * 0.7}px;font-size:${F.small}px;z-index:2}
.rose{position:absolute;z-index:0}
.word{position:absolute;left:${F.gut - 8}px;top:50%;transform:translateY(-44%);font-size:${F.word}px;line-height:.8;letter-spacing:-.03em;white-space:nowrap;text-transform:uppercase;font-variation-settings:'opsz' 96,'wdth' var(--wdth,75),'wght' 800;z-index:1}
.date{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);font-size:${F.date}px;font-variation-settings:'wdth' 75,'wght' 700;letter-spacing:-.01em;line-height:1;white-space:nowrap;text-transform:uppercase;z-index:1}
.lede{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);width:${F.W - 2 * F.gut}px;max-width:${F.W > F.H ? '76%' : '100%'};font-size:${F.lede}px;line-height:1.08;letter-spacing:-.005em;font-variation-settings:'opsz' 48,'wdth' 100,'wght' 500;z-index:1}
.list{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);width:${F.W - 2 * F.gut}px;z-index:1}
.list div{display:flex;gap:${F.row}px;align-items:baseline;font-size:${F.row}px;line-height:1.35;font-variation-settings:'opsz' 32,'wdth' 75,'wght' 600;white-space:nowrap;overflow:hidden}
.list .k{font-size:${F.row * 0.5}px;color:${MAL};min-width:${F.row * 2.2}px}
.url{position:absolute;left:${F.gut - 6}px;top:50%;transform:translateY(-50%);z-index:1}
.url div{font-size:${F.url}px;line-height:.9;letter-spacing:-.01em;white-space:nowrap;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800}
.url .rec{margin-top:${F.url * 0.35}px;font-size:${F.small + 2}px;line-height:1.6;color:${BOTTLE};max-width:${F.W - 2 * F.gut}px;white-space:normal}
.dove{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);width:${Math.round(F.W * F.dove)}px;height:auto;z-index:1}
.sec{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);z-index:1}
.sec .k{display:block;font-size:${F.small + 6}px;color:${MAL};margin-bottom:${F.gut * 0.4}px}
.sec .t{font-size:${F.word * 0.6}px;line-height:.85;letter-spacing:-.02em;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;max-width:${F.W - 2 * F.gut}px}
.fig{position:absolute;left:${F.gut - 4}px;top:50%;transform:translateY(-50%);z-index:1;max-width:${F.W - 2 * F.gut}px}
.fig .v{font-size:${F.fig}px;line-height:1;font-variation-settings:'wdth' 75,'wght' 700;letter-spacing:-.02em;white-space:nowrap}
.fig .v.long{font-size:${Math.round(F.fig * 0.68)}px}
.fig .c{margin-top:${F.gut * 0.35}px;font-size:${F.small + 4}px;line-height:1.6;color:${MAL};max-width:${Math.round(F.W * 0.6)}px;white-space:normal}
.name{position:absolute;left:${F.gut - 4}px;top:50%;transform:translateY(-50%);z-index:1;font-size:${F.name}px;line-height:.9;letter-spacing:-.02em;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;max-width:${F.W - 2 * F.gut}px}
.slap{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);z-index:1;font-size:${Math.round(F.word * 0.36)}px;line-height:1;letter-spacing:-.02em;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;max-width:${F.W - 2 * F.gut}px}
.label{position:absolute;left:${F.gut}px;bottom:${F.gut * 0.7}px;font-size:${F.small}px;color:${ACID};z-index:2}
`;

export const mastHtml = (colour) => `<div class="mast mono" style="color:${colour}"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="${colour}" stroke-width="6"/></svg>AEDIFICARE</div>`;

/** A live field: k drifts by the shared clock in rose.mjs; window.__frame(ms) advances it. */
export function fieldHtml(F, layers, seed, readout) {
  const size = Math.round(Math.max(F.W, F.H * 1.2));
  return `<svg class="rose" id="f" viewBox="0 0 1000 1000" style="width:${size}px;height:${size}px;left:50%;top:50%;transform:translate(-50%,-50%)"></svg>
${readout ? `<div class="seed mono" style="left:${F.gut}px;right:auto;bottom:${F.gut * 0.7 + F.small * 2}px;color:${MAL}">r = cos(kθ) · k = <span id="k">${layers[0].k.toFixed(3)}</span></div>` : ''}
<script type="module">
import { rhodonea, drift } from '/src/lib/rose.mjs';
const layers = ${JSON.stringify(layers)}, seed = ${seed};
const NS = 'http://www.w3.org/2000/svg', svg = document.getElementById('f'), out = document.getElementById('k');
const paths = layers.map((L) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', L.c); p.setAttribute('stroke-width', L.w); p.setAttribute('stroke-opacity', L.o); svg.appendChild(p); return p; });
window.__frame = (ms) => { const d = drift(seed, ms); layers.forEach((L, i) => paths[i].setAttribute('d', rhodonea(500, 500, 480 * L.s, L.k + d, L.ph, 9, 1800))); if (out) out.textContent = (layers[0].k + d).toFixed(3); };
window.__frame(0); window.__ready = true;
</script>`;
}

/** The dove, built by the site's own client script loaded into the frame unchanged. */
export const doveHtml = () => `<svg class="dove" viewBox="0 0 260 180" role="img" aria-label="A dove, resolved out of the rose field." data-dove="${ACID}"></svg><script type="module" src="/src/scripts/aed.js"></script>`;

/* ---- Chromium, serving the repo to the frame ----------------------------- */
const MIME = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.woff2': 'font/woff2', '.html': 'text/html; charset=utf-8' };

/**
 * A context at the format's size. `show(sh)` loads a shot's HTML at
 * http://aed.film/slide.html, with /fonts/* and /src/* served from the repo
 * so the frame uses the site's own faces and modules, waits for both faces
 * (loaded explicitly: a face loads only once text uses it, and a shot may set
 * only one), and for a live shot's __ready or a dove's paths.
 */
export async function openContext(browser, F, FF, scale = 1) {
  const ctx = await browser.newContext({ viewport: { width: F.W, height: F.H }, deviceScaleFactor: scale, reducedMotion: 'no-preference' });
  let current = '';
  await ctx.route('http://aed.film/**', (route) => {
    const p = new URL(route.request().url()).pathname;
    if (p === '/slide.html') return route.fulfill({ status: 200, contentType: MIME['.html'], body: current });
    const file = p.startsWith('/fonts/') ? 'public' + p : p.startsWith('/src/') ? '.' + p : null;
    if (!file || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ status: 200, contentType: MIME[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => { console.error('film: page error', err.message); process.exit(1); });
  const show = async (sh) => {
    current = sh.html;
    await page.goto('http://aed.film/slide.html', { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([document.fonts.load("800 40px 'Bricolage Grotesque'"), document.fonts.load("500 10px 'Martian Mono'")]));
    const ok = await page.evaluate(() => document.fonts.check("800 40px 'Bricolage Grotesque'") && document.fonts.check("500 10px 'Martian Mono'"));
    if (!ok) { console.error(`film: brand faces did not load for ${sh.id}`); process.exit(1); }
    if (sh.live) await page.waitForFunction(() => window.__ready === true);
    if (sh.dove) await page.waitForSelector('svg[data-dove] g path');
  };
  const shot = (opts = {}) => page.screenshot({ type: FF.frame, ...(FF.frame === 'jpeg' ? { quality: 100 } : {}), ...opts });
  return { ctx, page, show, shot };
}

/* ---- the encoder, frames on a pipe --------------------------------------- */
/**
 * Frames in on stdin at `fps`; H.264 (CRF 16 by default, 20 for a long
 * narrated film, yuv420p, faststart) or VP8.
 * `audio` is a file muxed alongside (AAC 160k when the build has it); the
 * output is cut to the shorter of the two. `filters` is an optional
 * filter_complex for the audio (a music bed mixed under the voice).
 */
export function encoder(FF, file, fps, { audio = null, music = null, musicGain = 0.12, crf = 16 } = {}) {
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', FF.frame === 'png' ? 'png' : 'mjpeg', '-i', 'pipe:0'];
  if (audio) args.push('-i', audio);
  if (audio && music) args.push('-stream_loop', '-1', '-i', music);
  args.push(...(FF.codec === 'libx264'
    ? ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    : ['-c:v', 'libvpx', '-b:v', '12M', '-crf', '6', '-quality', 'good', '-cpu-used', '1', '-auto-alt-ref', '1', '-lag-in-frames', '16', '-pix_fmt', 'yuv420p']));
  if (audio) {
    if (music) args.push('-filter_complex', `[1:a]loudnorm=I=-16:TP=-1.5:LRA=11[v];[2:a]volume=${musicGain}[m];[v][m]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]`, '-map', '0:v', '-map', '[a]');
    else args.push('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-map', '0:v', '-map', '1:a');
    args.push('-c:a', FF.aac ? 'aac' : 'libopus', '-b:a', '160k', '-shortest');
  } else args.push('-an');
  args.push('-r', String(fps), file);
  const ff = spawn(FF.bin, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = (buf) => new Promise((res) => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));
  const done = () => new Promise((res, rej) => { ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`)))); ff.stdin.end(); });
  return { write, done };
}
