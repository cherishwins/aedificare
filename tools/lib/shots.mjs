/**
 * The shots a news film is cut from, and the renderer that turns one shot into
 * its own segment file. Lifted out of tools/episode.mjs on 2026-10-20 with no
 * change in what they make, so the edition films' cut lists can build the
 * same quote, map, chart, figure and overlay shots and cut the same footage
 * without a second copy of any of it.
 *
 * What were module globals in episode.mjs (the script, the frame, its margins
 * and type sizes, the footage folder) arrive as one context object, made by
 * shotContext(); every builder takes it first.
 *
 * Two kinds were added for the edition films' re-cut (spec steps 3 and 4):
 * `pop`, one to three words landing on the word that says them, and `page`, a
 * cited source as tools/capture.mjs shot it, the quoted words swept in Acid.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { css, esc, FORMATS, ACID, MAL, BOTTLE, VOID, FLASH } from './film.mjs';
import { markPath } from '../../src/lib/rose.mjs';
import { SITE } from '../../src/config.mjs';
import { edition } from '../../src/lib/editions.mjs';
import { chartBody, chartCss, parseChart, hotValues, findSpoken, rowKey, numKey } from './chart.mjs';
// A page tag's body is capture.mjs's own tag, so the render names the very file the capture wrote.
import { parsePage, shotName } from '../capture.mjs';

export const FPS = 24;
export const KINDS = ['footage', 'gag', 'clip', 'quote', 'map', 'chart', 'fig', 'card', 'title', 'over', 'page', 'pop'];
// An overlay rides over the shot beneath it; every other kind is a cut.
export const OVERLAYS = ['over', 'pop'];
export const CUTS = KINDS.filter((k) => !OVERLAYS.includes(k));
export const OWNER = ['footage', 'gag', 'clip']; // shots the owner supplies
// The grade that makes footage from six decades read as one film: most of the colour out, contrast up, pushed toward Void.
export const GRADE = 'hue=s=0.18,eq=contrast=1.22:brightness=-0.07:gamma=0.92,'
  + 'colorbalance=rs=-0.10:gs=0.03:bs=-0.08:rm=-0.07:gm=0.03:bm=-0.06:rh=-0.04:bh=-0.04,'
  + 'vignette=angle=PI/4.2,noise=alls=7:allf=t+u';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 5).join('-');

/**
 * The context every shot is built in. `S` is the parsed script (its meta and sources), `short` the tall frame for
 * the Shorts feed (1080x1920), `dir` the work directory whose footage/ folder holds the owner's files. `slug` and
 * `pages` say where tools/capture.mjs wrote a page shot's PNG and JSON (brand/youtube/<slug>/pages/ by default).
 */
export function shotContext({ S, short = false, dir, slug = S?.meta?.slug, pages = path.join(dir, 'pages') }) {
  const F = short ? FORMATS.tall : FORMATS.wide, W = F.W, H = F.H, M = short ? 64 : 120;
  // Type sized to the frame: tall frames are narrower, and the bottom third of a Short sits under YouTube's own controls.
  const TY = short ? { quote: 62, stmt: 170, title: 190, end: 130, slate: 44, low: Math.round(H * 0.3) } : { quote: 84, stmt: 170, title: 200, end: 150, slate: 56, low: M + 150 };
  return { S, SHORT: short, F, W, H, M, TY, DIR: dir, FOOT: path.join(dir, 'footage'), SLUG: slug, PAGES: pages };
}
/** A figure's size: its base, or smaller if the string would not fit between the margins (condensed digits run about half an em). */
export const fit = (C, value, base) => Math.min(base, Math.floor((C.W - 2 * C.M) / (Math.max(1, value.length) * 0.5)));

/* ---- the tag ----------------------------------------------------------------- */
export function parseTag(inner) {
  const m = /^(\w+)(?:#([\w-]+))?\s*:\s*([\s\S]*)$/.exec(inner.trim());
  if (!m || !KINDS.includes(m[1])) return { bad: inner };
  const parts = m[3].split('|').map((x) => x.trim()).filter(Boolean);
  const opts = {}, args = [];
  for (const p of parts) { const kv = /^(find|at|hl|say|by|raw|hold|src|unit|prefix|note|sub|ref)\s*:\s*([\s\S]*)$/.exec(p); if (kv) opts[kv[1]] = kv[2].trim(); else args.push(p); }
  const tag = { kind: m[1], args, ...opts };
  if (tag.say) tag.say = tag.say.replace(/^["“]|["”]$/g, '');
  if (OWNER.includes(tag.kind)) {
    tag.desc = args[0] || '';
    const dur = args.find((a) => /^\d+(\.\d+)?s$/.test(a));
    if (dur) tag.dur = parseFloat(dur);
    tag.id = m[2] || slug(tag.desc);
  }
  if (tag.kind === 'quote') { tag.src = args[0]; tag.text = (args[1] || '').replace(/^["“]|["”]$/g, ''); tag.by = tag.by || args[2] || ''; }
  if (tag.kind === 'map') {
    tag.stops = (args[0] || '').split('>').map((s) => { const q = /^(.*?)\s+(-?[\d.]+)\s*,\s*(-?[\d.]+)$/.exec(s.trim()); return q ? { name: q[1], lat: +q[2], lon: +q[3] } : null; });
    tag.label = args[1] || '';
  }
  if (tag.kind === 'fig' || tag.kind === 'over') { tag.value = args[0] || ''; tag.label = args[1] || ''; }
  if (tag.kind === 'card' || tag.kind === 'title') { tag.text = args[0] || ''; tag.label = args[1] || ''; }
  if (tag.kind === 'chart') { tag.type = args[0] || ''; tag.title = args[1] || ''; Object.assign(tag, parseChart(tag.type, args.slice(2))); tag.srcs = (tag.src || '').split(',').map((x) => x.trim()).filter(Boolean); }
  if (tag.kind === 'pop') {
    // Keyword text is one to four words and never the sentence (sync rule 2); the kit's pop is three at most.
    tag.text = (args[0] || '').replace(/^["“]|["”]$/g, '');
    const n = tag.text.split(/\s+/).filter(Boolean).length;
    tag.errors = [...(n < 1 || n > 3 ? [`pop "${tag.text}": one to three words, not ${n}`] : []), ...(tag.text.includes('!') ? [`pop "${tag.text}": no exclamation`] : [])];
  }
  if (tag.kind === 'page') {
    // Kept whole for capture.mjs's parser; `hls` are the phrases in order (one picture, its related steps).
    tag.body = m[3].trim();
    tag.hls = parts.filter((p) => /^hl\s*:/.test(p)).map((p) => p.replace(/^hl\s*:\s*/, '').replace(/^["“](.*)["”]$/, '$1'));
    tag.src = /^\d{1,3}$/.test(args[0] || '') ? args[0].padStart(2, '0') : null;
  }
  return tag;
}

/* ---- the owner's files ------------------------------------------------------- */
export function footageFile(C, id) {
  // <id>.mp4, or <id>@72.5.mp4 / <id>-at-72.5.mp4 to start 72.5 s in (1m12 works too). The -at- form survives
  // GitHub, which rewrites some characters in release asset names.
  // Any container ffmpeg reads: archive.org and the National Archives serve .mpeg, .mpg and .ogv, which were once
  // skipped here while the shot list promised "any video extension".
  // Names are matched case-blind with spaces and underscores read as hyphens: a phone saves "Spacey Name.MP4" and
  // GitHub rewrites some characters in asset names, and a near-miss rendered as a slate without a word (found 2026-10-03).
  const normName = (x) => x.toLowerCase().replace(/[\s_]+/g, '-');
  const nid = normName(id);
  const f = fs.readdirSync(C.FOOT).find((x) => /\.(mp4|mov|webm|mkv|m4v|mpe?g|ogv|avi|ts|mts|wmv|flv|gif|jpe?g|png|webp|tiff?)$/i.test(x) && [`${nid}.`, `${nid}@`, `${nid}-at-`].some((p) => normName(x).startsWith(p)));
  if (!f) return null;
  const at = /(?:@|-at-)([\dm.]+?)\.[a-z0-9]+$/i.exec(f);
  const inPoint = at ? (at[1].includes('m') ? (+at[1].split('m')[0] * 60 + +(at[1].split('m')[1] || 0)) : +at[1]) : 0;
  // A still (a Library of Congress or DOE photograph, a Landsat frame) is held and panned like footage.
  const still = /\.(jpe?g|png|webp|tiff?)$/i.test(f);
  const file = path.join(C.FOOT, f);
  return { file, inPoint, still, len: still ? 0 : probeDur(file), ...(still ? {} : probeDims(file)) };
}
const probeCache = new Map();
const probe = (file, args) => spawnSync('ffprobe', ['-v', 'error', ...args, '-of', 'default=noprint_wrappers=1', file], { encoding: 'utf8' }).stdout;
const field = (out, k) => { const m = new RegExp(`^${k}=(.*)$`, 'm').exec(out); return m ? m[1].trim() : ''; };
/**
 * A file's length in seconds. The container header first; a file written to a pipe (MediaRecorder, a stream dump,
 * a download cut off) says N/A there, and `-t 0` on such a clip meant "unlimited", which played the whole file
 * and desynced every word after it (found 2026-10-03). So the stream's own duration next, then a frame count.
 */
export function probeDur(file) {
  if (probeCache.has(file)) return probeCache.get(file);
  let d = +field(probe(file, ['-show_entries', 'format=duration']), 'duration') || 0;
  if (!(d > 0)) d = +field(probe(file, ['-select_streams', 'v:0', '-show_entries', 'stream=duration']), 'duration') || 0;
  if (!(d > 0)) {
    const out = probe(file, ['-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames,r_frame_rate']);
    const [num, den = 1] = field(out, 'r_frame_rate').split('/').map(Number);
    const frames = +field(out, 'nb_read_frames');
    if (frames > 0 && num > 0) d = frames / (num / den);
  }
  probeCache.set(file, d);
  return d;
}
/** The picture's shape as shown, after a phone's rotation tag or a photograph's EXIF orientation. */
export function probeDims(file) {
  const out = probe(file, ['-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_tags=rotate,Orientation:stream_side_data=rotation']);
  let w = +field(out, 'width') || 0, h = +field(out, 'height') || 0;
  const rot = Math.abs(+field(out, 'rotation') || +field(out, 'TAG:rotate') || 0) % 180;
  if (rot === 90 || +field(out, 'TAG:Orientation') >= 5) [w, h] = [h, w];
  return { w, h };
}
export const hasAudio = (file) => spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout.trim() !== '';

/* ---- the computed shots ---------------------------------------------------- */
export const page = (C, body, ground = VOID, extra = '') => {
  const { F, W, H, M, TY, SHORT } = C;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(F, ground, FLASH)}
.q{position:absolute;left:${M}px;top:50%;transform:translateY(-50%);width:${W - 2 * M - (SHORT ? 0 : 240)}px}
.q .src{font-size:22px;color:${MAL};margin-bottom:44px}
.q .t{font-size:${TY.quote}px;line-height:1.12;font-variation-settings:'opsz' 48,'wdth' 100,'wght' 500;letter-spacing:-.005em}
.q .t .h:first-child,.q .t .h[data-k="0"]{padding-left:.08em;margin-left:-.08em}
.q .t .h.on{background:${ACID};color:${VOID}}
.q .by{margin-top:44px;font-size:24px}
.big{position:absolute;left:${M - 6}px;bottom:${TY.low}px;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;line-height:.86;letter-spacing:-.02em;white-space:nowrap}
.sub{position:absolute;left:${M}px;bottom:${TY.low - 60}px;font-size:26px}
.stmt{position:absolute;left:${M - 6}px;top:50%;transform:translateY(-50%);max-width:${W - 2 * M}px;font-size:${TY.stmt}px;line-height:.88;letter-spacing:-.02em;text-transform:uppercase;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800}
.slate{position:absolute;left:${M}px;top:50%;transform:translateY(-50%);max-width:${W - 2 * M}px}
.slate .k{font-size:22px;color:${ACID};margin-bottom:28px}
.slate .d{font-size:${TY.slate}px;line-height:1.1;font-variation-settings:'opsz' 48,'wdth' 100,'wght' 500}
.slate .f{margin-top:28px;font-size:20px;color:${MAL};line-height:1.6}
svg.map{position:absolute;inset:0;width:${W}px;height:${H}px}
.maplabel{position:absolute;left:${M}px;top:${M}px;font-size:24px;color:${FLASH}}
${extra}</style></head><body>${body}</body></html>`;
};

/**
 * A quote card; `at` (ms) holds the highlighter until the voice reaches the words, as a refused page shot's card does.
 * `sweeps` ({ text, at, dur } a phrase, from sweepPlan) is a page shot's card: its phrases joined by an ellipsis, each
 * swept on the word that says it and lit alone, one Acid at a time, as the page itself would have swept them.
 * `ground` is Void, or Bottle for a card that follows another with no cut between (renderSegment), so the second reads
 * as a new picture and not the first one changing its words; on Bottle the source line is Flash, because small
 * Malachite type on Bottle is under AA (CLAUDE.md, "Calibrate contrast against Bottle"). `extra` is CSS a page shot's
 * card adds (its source line at the frame's floor, pageHtml); an episode's card adds none and is built as it always was.
 */
const cardGround = (C, body, ground, extra = '') => (ground === BOTTLE ? page(C, body, BOTTLE, `.q .src{color:${FLASH}}${extra}`) : page(C, body, VOID, extra));
export function quoteHtml(C, tag, at = 0, sweeps = null, ground = VOID, extra = '') {
  if (sweeps) return quoteSweeps(C, tag, sweeps, ground, extra);
  const src = C.S.sources[tag.src];
  const text = tag.text.replace(/—/g, ' – ');
  const hl = (tag.hl || '').replace(/—/g, ' – ');
  let inner = esc(text);
  let n = 0;
  if (hl && text.includes(hl)) {
    const i = text.indexOf(hl);
    const words = hl.split(' ');
    n = words.length;
    // One span per word, each carrying the space after it, so the sweep reads as one bar and not a row of boxes.
    inner = esc(text.slice(0, i)) + words.map((w, k) => `<span class="h" data-k="${k}">${esc(w)}${k < n - 1 ? ' ' : ''}</span>`).join('') + esc(text.slice(i + hl.length));
  }
  const html = cardGround(C, `<div class="q"><div class="src mono">${esc(src ? [src.pub, src.date].filter(Boolean).join(' · ') : '')}</div><div class="t">“${inner}”</div><div class="by mono">${esc(tag.by)}</div></div>
<script>window.__frame=(ms)=>{const n=${n};document.querySelectorAll('.h').forEach((e)=>{e.classList.toggle('on',ms>=${at ? `${Math.round(at)}+` : ''}(+e.dataset.k/Math.max(1,n))*900)})};window.__frame(0);window.__ready=true;</script>`, ground, extra);
  return { html, anim: n > 0, live: true, ground };
}

function quoteSweeps(C, tag, sweeps, ground = VOID, extra = '') {
  const src = C.S.sources[tag.src];
  const W = sweeps.map((x) => x.text.replace(/—/g, ' – ').split(' '));
  const inner = W.map((words, p) => words.map((w, k) => `<span class="h" data-p="${p}" data-k="${k}">${esc(w)}${k < words.length - 1 ? ' ' : ''}</span>`).join('')).join(' … ');
  const T = sweeps.map((x, p) => [x.at, x.dur, W[p].length]);
  const html = cardGround(C, `<div class="q"><div class="src mono">${esc(src ? [src.pub, src.date].filter(Boolean).join(' · ') : '')}</div><div class="t">“${inner}”</div><div class="by mono">${esc(tag.by || '')}</div></div>
<script>const T=${JSON.stringify(T)};window.__frame=(ms)=>{let cur=-1;T.forEach((t,p)=>{if(ms>=t[0])cur=p;});document.querySelectorAll('.h').forEach((e)=>{const p=+e.dataset.p,t=T[p];e.classList.toggle('on',p===cur&&ms>=t[0]+(+e.dataset.k/Math.max(1,t[2]))*t[1])})};window.__frame(0);window.__ready=true;</script>`, ground, extra);
  return { html, anim: true, live: true, ground };
}

let WORLD = null;
export async function world() {
  if (WORLD) return WORLD;
  const cache = path.join('brand/youtube/.cache/countries-50m.json');
  if (!fs.existsSync(cache)) {
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    // Natural Earth (public domain) via the world-atlas package, pinned.
    const r = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json');
    if (!r.ok) { console.error('episode: could not fetch the world outlines', r.status); process.exit(1); }
    fs.writeFileSync(cache, Buffer.from(await r.arrayBuffer()));
  }
  const t = JSON.parse(fs.readFileSync(cache, 'utf8'));
  const { scale: [sx, sy], translate: [tx, ty] } = t.transform;
  const arcs = t.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  // Rings that cross the antimeridian (Russia, Fiji) are unwrapped into continuous longitude, or the flip from +180
  // to -180 draws a line across the whole world; the map then draws every ring at -360, 0 and +360.
  const ring = (idx) => {
    const pts = idx.flatMap((i, k) => (k ? arc(i).slice(1) : arc(i)));
    let off = 0;
    return pts.map(([lon, lat], j) => {
      if (j) { const prev = pts[j - 1][0]; if (lon - prev > 180) off -= 360; else if (prev - lon > 180) off += 360; }
      return [lon + off, lat];
    });
  };
  const polys = [];
  const geom = (g) => { if (g.type === 'Polygon') polys.push(g.arcs.map(ring)); else if (g.type === 'MultiPolygon') g.arcs.forEach((p) => polys.push(p.map(ring))); else if (g.type === 'GeometryCollection') g.geometries.forEach(geom); };
  geom(t.objects.countries);
  // Antarctica never frames a story here, and its ring wraps the pole.
  WORLD = polys.filter((p) => p[0].some(([, lat]) => lat > -58));
  return WORLD;
}

export async function mapHtml(C, tag) {
  const { W, H } = C;
  const polys = await world();
  const stops = tag.stops.map((s) => ({ ...s }));
  // Across the antimeridian (Taiwan to Arizona), carry the western stops east so the route takes the Pacific.
  const lons = stops.map((s) => s.lon);
  if (Math.max(...lons) - Math.min(...lons) > 180) stops.forEach((s) => { if (s.lon < 0) s.lon += 360; });
  const my = (lat) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-80, Math.min(80, lat)) * Math.PI) / 360));
  const xs = stops.map((s) => s.lon), ys = stops.map((s) => my(s.lat));
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const r2d = 180 / Math.PI;
  const spanX = Math.max(x1 - x0, 12), spanY = Math.max((y1 - y0) * r2d, 7);
  const cx = (x0 + x1) / 2, cy = ((y0 + y1) / 2) * r2d;
  // Fit the stops in the middle 60 percent of a 16:9 frame.
  let sw = spanX / 0.6, sh = spanY / 0.6;
  if (sw / sh > W / H) sh = sw * (H / W); else sw = sh * (W / H);
  const px = (lon) => ((lon - (cx - sw / 2)) / sw) * W;
  const py = (lat) => ((cy + sh / 2 - my(lat) * r2d) / sh) * H;
  const land = [];
  for (const off of [-360, 0, 360]) for (const p of polys) {
    const d = p.map((r) => {
      if (!r.some(([lon]) => lon + off > cx - sw && lon + off < cx + sw)) return '';
      return 'M' + r.map(([lon, lat]) => `${px(lon + off).toFixed(1)},${py(lat).toFixed(1)}`).join('L') + 'Z';
    }).join('');
    if (d) land.push(d);
  }
  const pts = stops.map((s) => [px(s.lon), py(s.lat)]);
  let route = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const mx = (ax + bx) / 2, myy = (ay + by) / 2, dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    route += `Q${(mx + (dy / len) * len * 0.18).toFixed(1)},${(myy - (Math.abs(dx) / len) * len * 0.18).toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const labels = stops.map((s, i) => `<circle cx="${pts[i][0].toFixed(1)}" cy="${pts[i][1].toFixed(1)}" r="9" fill="${ACID}"/>
<text x="${(pts[i][0] + 22).toFixed(1)}" y="${(pts[i][1] + 8).toFixed(1)}" fill="${FLASH}" style="font-family:'Martian Mono';font-size:24px;letter-spacing:.14em;font-variation-settings:'wdth' 75,'wght' 500">${esc(s.name.toUpperCase())}</text>`).join('');
  const html = page(C, `<svg class="map" viewBox="0 0 ${W} ${H}"><path d="${land.join('')}" fill="${BOTTLE}" stroke="${VOID}" stroke-width="1.5"/>
${pts.length > 1 ? `<path id="r" d="${route}" fill="none" stroke="${ACID}" stroke-width="5"/>` : ''}${labels}</svg>
${tag.label ? `<div class="maplabel mono">${esc(tag.label)}</div>` : ''}
<script>const r=document.getElementById('r');const L=r?r.getTotalLength():0;if(r){r.style.strokeDasharray=L;}window.__frame=(ms)=>{if(r)r.style.strokeDashoffset=L*(1-Math.min(1,ms/900));};window.__frame(0);window.__ready=true;</script>`);
  return { html, anim: pts.length > 1, live: true };
}

export function chartHtml(C, tag, landMs = null, held = []) {
  const { W, H, M } = C;
  const num = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 3 });
  // A typed string (the value as the source prints it) passes through; a computed tick is formatted.
  const fmt = (v) => `${tag.prefix || ''}${typeof v === 'string' ? v : num(v)}${tag.unit || ''}`;
  const sourceLine = 'SOURCE: ' + tag.srcs.map((id) => C.S.sources[id]).filter(Boolean).map((s) => `${s.pub}, ${s.date}`).join(' · ');
  const ref = tag.ref ? (() => { const m = /^(-?[\d.]+)\s*(.*)$/.exec(tag.ref); return m ? { v: +m[1], r: m[1], label: m[2] } : null; })() : null;
  const { body, animMs, landed } = chartBody({ type: tag.type, title: tag.title, sub: tag.sub, note: tag.note, sourceLine, rows: tag.rows, fmt, W, H, M, ref, landMs, held });
  return { html: page(C, body, VOID, chartCss(W, H, M)), anim: true, live: true, animMs, landMs: landed ? landMs : null };
}

export const figHtml = (C, tag) => ({ html: page(C, `<div class="big" style="font-size:${fit(C, tag.value, tag.value.length > 8 ? 260 : 360)}px;color:${ACID}">${esc(tag.value)}</div>${tag.label ? `<div class="sub mono" style="color:${MAL}">${esc(tag.label)}</div>` : ''}`) });
export const cardHtml = (C, tag) => ({ html: page(C, `<div class="stmt">${esc(tag.text)}</div>${tag.label ? `<div class="sub mono" style="bottom:${C.M}px;color:${MAL}">${esc(tag.label)}</div>` : ''}`) });
export const titleHtml = (C) => ({ html: page(C, `<div class="stmt" style="font-size:${C.TY.title}px">${esc(C.S.meta.title)}</div><div class="sub mono" style="bottom:${C.M}px;color:${MAL}">${esc(C.S.meta.date)}</div>${`<div class="mast mono" style="color:${FLASH}"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="${FLASH}" stroke-width="6"/></svg>AEDIFICARE</div>`}`) });
export const slateHtml = (C, tag) => ({ html: page(C, `<div class="slate"><div class="k mono">${tag.kind === 'clip' ? 'Clip needed' : tag.kind === 'gag' ? 'Gag needed' : 'Footage needed'} · ${esc(tag.id)}</div><div class="d">${esc(tag.desc)}</div>${tag.say ? `<div class="f mono">Says: ${esc(tag.say)}</div>` : ''}${tag.find ? `<div class="f mono">Find: ${esc(tag.find)}</div>` : ''}</div>`, BOTTLE) });
export const endHtml = (C) => ({ html: page(C, `<div class="stmt" style="font-size:${C.TY.end}px;text-transform:none">${esc(new URL(SITE.origin).host)}</div><div class="mast mono" style="color:${FLASH}"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="${FLASH}" stroke-width="6"/></svg>AEDIFICARE</div>`) });
export const overHtml = (C, tag) => page(C, `${tag.value ? `<div class="big" style="font-size:${fit(C, tag.value, tag.value.length > 9 ? 200 : 300)}px;color:${ACID}">${esc(tag.value)}</div>` : ''}${tag.label ? `<div class="sub mono" style="color:${FLASH}">${esc(tag.label)}</div>` : ''}`, 'transparent');

/* ---- page: a cited source as served, its words swept in Acid -------------------- */
const die = (m) => { console.error(m); process.exit(1); };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** A page's date as the editions write one ("5 Sep 2025"), from ISO, 2026/05/17 or anything Date reads; null if none. */
function dayLabel(v) {
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(String(v || ''));
  const t = m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : Date.parse(v || '');
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  return `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
const wordKey = (w) => String(w).toLowerCase().replace(/[^a-z0-9]+/g, '');
const CITE = /^\[\d+\]$/; // the narration keeps each citation mark as a zero-length word; it is never said
const STOP = new Set('with from that this have been were will your what when which their there about into more than then them they also only over such each does said says page'.split(' '));
/**
 * The first word in [t0, t1) that says one of a phrase's own words: a number (by value: "2,000" says 2000), or a
 * word of four letters or more that carries meaning. The source's words and the narration's rarely match whole,
 * so one shared word is the cue.
 */
function spokenWord(words, phrase, t0, t1) {
  const want = phrase.split(/[\s\u2013\u2014/-]+/).map((w) => ({ k: wordKey(w), n: numKey(w) })).filter((x) => x.n !== null || (x.k.length >= 4 && !STOP.has(x.k)));
  if (!want.length) return null;
  for (const w of words) {
    if (w.s < t0 - 0.05 || w.s >= t1 || CITE.test(w.w)) continue;
    const n = numKey(w.w), k = wordKey(w.w);
    if (want.some((x) => (x.n !== null ? n !== null && Math.abs(x.n - n) <= 1e-9 * Math.max(1, Math.abs(n)) : x.k === k))) return w;
  }
  return null;
}

/**
 * When each phrase's highlighter starts, in ms from the shot's first frame: on the word that says it (sync rule 3:
 * the Acid lands on its word), or one beat in for a single phrase nobody says (the quote card's rule), later
 * phrases spread across the shot. A sweep runs 900 ms, the kit's slow beat, shortened only when the shot cannot
 * hold every phrase at that pace; each starts after the one before has finished, and the last finishes half a beat
 * before the cut (a quarter of a short shot), so the point is on screen before the next shot. A phrase starts no
 * later than leaves room for the ones after it: clamped one at a time, two phrases in a one-second shot once
 * started on the same frame.
 */
export function sweepPlan(texts, s, d, words) {
  const n = texts.length;
  if (!n) return [];
  const lo = Math.min(0.3, d / 4), end = d - Math.min(0.45, d / 4);
  const dur = Math.min(0.9, Math.max(1 / FPS, (end - lo) / n));
  const latest = (i) => Math.max(lo, end - (n - i) * dur);
  const first = Math.round(s.t * FPS) / FPS; // the shot's first frame on the film's grid
  const a = Math.min(0.9, latest(0));
  let prev = -Infinity;
  return texts.map((text, i) => {
    const w = spokenWord(words, text, s.t, s.end);
    let at = w ? w.s - first : n === 1 ? a : a + (i * (latest(n - 1) - a)) / (n - 1);
    at = Math.min(latest(i), Math.max(lo, at, prev + dur));
    prev = at;
    return { text, word: w, at: Math.round(at * 1000), dur: Math.round(dur * 1000) };
  });
}

/**
 * Where a page shot puts its label and its panel. Wide: the panel fills the frame inside the margins, under a
 * label line. Tall: below the Shorts feed's top bar, above its lower quarter of controls, clear of the right
 * 120 px where its buttons stand. `minType` and `maxType` bound the words' own type as the panel shows it, in frame
 * px. The floor is 11 pt on the phone the frame fills, the smallest size Apple's Human Interface Guidelines call
 * legible: a Short's 1080 px fill a phone 390 pt wide (0.36 pt a px), so 30 px; a film's 1920 fill the same phone
 * held sideways, 844 pt (0.44 pt a px), so 25 px. Type that cannot reach the floor is not shown as a picture of
 * type (pageCrop falls back to a cell, then to the quote card). The ceiling keeps one short cell from ballooning:
 * 42 and 45 px, the old zoom limit on 16 px body type. `at` is where the words sit, as a share of the panel's
 * height, above YouTube's captions. `size` is the label's type, which the floor binds as it binds the page's
 * (labelType); `label` is where its one line starts, and a label of more lines grows up from that line's foot.
 */
const pageFrame = (C) => (C.SHORT
  ? { label: 228, x: C.M, y: 300, w: C.W - C.M - 120, h: Math.round(C.H * 0.75) - 300, minType: 30, maxType: 45, at: 0.36, size: 30 }
  : { label: 72, x: C.M, y: 150, w: C.W - 2 * C.M, h: C.H - 250, minType: 25, maxType: 42, at: 0.42, size: 28 });
const PUSH = 0.05; // the page shot's push-in over its whole length (pageHtml)

const hull = (bs) => {
  bs = bs.filter(Boolean);
  if (!bs.length) return null;
  const x = Math.min(...bs.map((b) => b.x)), y = Math.min(...bs.map((b) => b.y));
  return { x, y, w: Math.max(...bs.map((b) => b.x + b.w)) - x, h: Math.max(...bs.map((b) => b.y + b.h)) - y };
};
const meets = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/**
 * The part of the capture the panel shows, in CSS px of the capture's viewport, from the layout tools/capture.mjs
 * recorded (every line of text in view with its font size and block, the blocks as a tree with the borders and fills
 * they draw and their list markers, the boxes the page draws that hold no text). The rules, each a defect the pilot's
 * frames showed before it (2026-10-20):
 * - The window snaps to the block that holds the words: their paragraph or list item (with its marker), a block and the
 *   blocks beside it under one parent (a term and its definition), or a cell's row in a grid (a table, or a grid of
 *   divs whose rows share their columns), because a row's label is the cell's context. A grid is one unit across: a
 *   row's window holds the whole grid with its outer rules, and another grid level with the window is taken in whole or
 *   left out, never cut through a column (Meshtastic's preset table); a grid is as wide as what its rows show, their
 *   text, the rules and grounds their cells draw, their bars, not a row box's empty end (The Floor's bar chart). Its edges stand off the block by two ems of the
 *   words' type, never past half the gutter to the nearest thing of another block level with the window (text, a
 *   picture, an inline SVG, a box drawn with no text, a box another block paints or rules), and never across the edge
 *   of a box that holds the words and draws a rule down that side or paints its own ground, so they never start or end
 *   inside a neighbour or on a change of background (a letter of The Floor's rail beside its parts table, the end of
 *   the card beside Morse Micro's MM6108, the edge of Geeky Gadgets' takeaways box, a grey strip down the left of
 *   Seeed's product text). Text shown flush against a side gets the same margin where that cuts nothing new; where the
 *   window cannot grow to take a line in, it moves across within the other side's margin before the line is left out
 *   (Cisco's heading), and at its full width it moves toward equal margins where the side it moves to is clear. Both
 *   are measured from the ink the picture shows, its lines and the boxes drawn whole in it (Cisco's framed note). A rule
 *   across the picture ends inside it with equal margins or runs off both sides, never one (Parallel's headings); a
 *   block whose rule can do neither is left out.
 * - The block is shown whole across, so no line of it is cut: the zoom is what fits it and its margins, grown by the
 *   push-in, between the frame's type limits (pageFrame), the ceiling read off the type most of the picture is set in.
 *   The push-in never eats a margin: the whole picture stays inside the panel to the last frame (it starts inset by a
 *   twentieth of the way to where the words start, and grows from there), so the zoom shrinks rather than crop into the
 *   margins (Parallel's repository page ran a line to the panel's edge, 2026-10-20). The floor holds for every line the
 *   picture shows, not the words' alone: the zoom reads the smallest line of the blocks shown whole (a line of citation
 *   marks under The Floor's prose), and another block's line it would still show smaller is left out with what stands
 *   beyond it (a byline, Morse Micro's Previous and Next, a code link in a list). At the type floor the margins give
 *   way to what is left, never under a quarter em a side where the gutter allows that much. Text of another block level
 *   with the words that the window would still cut means the words' block sits in a wider one, which is tried instead.
 *   A block that cannot be read whole at the floor (a table row wider than the Short's panel, an abstract set across
 *   arXiv's page) gives way to the cells the words sit in, with their row's label (its first cell) and the cells
 *   between, and, where those are still too wide, to the shot's quote card (`wide`): cutting its lines at both ends, as
 *   The Markup's ledger and the KAUST abstract were cut, shows a picture of type nobody can read whole. A picture under
 *   half the panel's width takes in up to three enclosing blocks while they read whole; still under a quarter, it is
 *   the card (`small`).
 * - Above and below, the window moves so the block shows whole where the words can stay between 6 and 75 percent of the
 *   panel (YouTube's captions cover the rest), and so a figure's caption, a table's caption or head, or a grid of divs'
 *   framed head shows with the figures it names the unit of, where the window can be moved to keep it, the words
 *   leaving the band if they must (The Floor's bench lost "Mbps" when the caption fell under the window's top; Morse
 *   Micro's release notes showed "24 30" with no head). Where the words carry a figure nothing in them names, or sit in
 *   a grid whose head names its columns (Meshtastic's spreading factors, The Floor's STATED), the zoom drops toward the
 *   floor to hold the head too, to the largest that keeps the words in the band with it or, where none over the floor
 *   does, the floor, which holds them highest (the parts table's Battery hat row), and failing that the shot is its
 *   card (`unnamed`). Another grid's rows
 *   come with their head (the window moves for it) or are left out. Text above the heading (an element h1 to h6; the
 *   capture records no weight, so a bold paragraph is not one) that opens the words' section, in the page's order, is
 *   another section's, and so is the next heading below them and what follows it; the
 *   tail of a list whose first item the picture leaves out is another block's end, the start of one whose last item it
 *   leaves out below the words another's start, and the block just before a list it leaves out is that list's lead-in:
 *   all are left out (RSS-247, GitHub's "Use one of these options:"). A list item is one block with the lists in it,
 *   shown whole or not at all (RSS-247's item c, its lead-in kept and its sub-items cut off). Text of another block that its edges would cut (the sources
 *   list's second column under its opening paragraph) is left out, and so is the rest of a paragraph or row whose start
 *   or end they leave out, any line they would halve, and any box another block draws that they would halve: a top or
 *   bottom edge halves a fill, a frame or a rule down a side (Meshtastic's note, one 5 px rule down its left, and
 *   Seeed's gradient button, a fill with no border), a left or right edge a fill, a frame or a rule across. A table's
 *   cells and rows are its grid and are read as rows, not boxes; a row that draws (its ground or rules, or its cells')
 *   is one box with them, kept whole or left out (Meshtastic's framed cells ran off the picture's bottom), and the
 *   window moves to keep it whole where it can. Every line shown is whole for the whole shot, the
 *   picture stays inside a box that holds the words and paints its own ground, and its top and bottom edges stand
 *   halfway between the last line it keeps and the first thing it leaves out, at most two ems past the line; where the
 *   window, the push-in or such a box sets the edge instead, a line closer to it than a quarter em is left out too, so
 *   no line ends the shot flush on the panel's edge. The rest of the panel is the frame's Void.
 * - Pictures (spec 2.3, row 5: text only): on someone else's page every picture but inline SVG is already Void in the
 *   capture; one level with the words bounds the window like a neighbour's text, one above or below is left out like a
 *   cut line, any still in the window is covered, and one on the words themselves makes the shot its quote card
 *   (pageView). Our own pages (self) are ours, so nothing on them is covered. Inline SVG (a chart, a rose, a logo) is
 *   left as drawn, so the crop stops short of it as of a picture, with the figure that holds it, legend and caption
 *   (Meshtastic's link budget chart showed its legend, title and the top of its plot under the words).
 * Returns the window (x0, y0, its width cw at zoom k, its height ch), the part of it that is picture (`crop`, whole
 * lines only), the push-in's origin in panel px, the masks and the words' type in frame px; or `wide`, `small` or
 * `unnamed`; or an error for a capture with no layout.
 */
function pageCrop(rec, phrases, P) {
  const L = rec.layout;
  if (!L || !Array.isArray(L.blocks) || !Array.isArray(L.lines)) return { error: 'the capture has no layout record (it predates 2026-10-20); capture it again' };
  const vw = rec.viewport.width, vh = rec.viewport.height, B = L.blocks, S = 1 + PUSH;
  const inside = (i, anc) => { for (let j = i; j >= 0; j = B[j].parent) if (j === anc) return true; return false; };
  const bbox = (i) => { const x = Math.max(0, B[i].x), r = Math.min(vw, B[i].x + B[i].w); return { x, y: B[i].y, w: Math.max(0, r - x), h: B[i].h }; };
  // What of a block must show: its lines, not its box, whose empty padding made The Markup's 364 px ledger cell
  // 532 px wide, too wide for the Short. A list item's marker hangs outside the item's box, where no line records
  // it; the item, or a block that starts where its item starts, is shown with it (two ems of the item's type: a
  // disc and its gap run about one and a half).
  const kbox = (i) => {
    const ls = L.lines.filter((l) => inside(l.b, i));
    let b = ls.length ? hull(ls) : bbox(i);
    for (let j = i, n = 0; j >= 0 && n < 4; j = B[j].parent, n++) {
      if (Math.abs(B[j].x - B[i].x) > 2) break;
      if (B[j].marker) { const x = Math.max(0, Math.min(b.x, B[i].x - 2 * B[j].marker)); b = { ...b, x, w: b.x + b.w - x }; break; }
    }
    return b;
  };
  // A unit's box across: a whole row of a grid is as wide as its grid, outer rules and all, because a grid is one unit
  // across: an edge inside it cut Meshtastic's preset table through its first column (2026-10-20).
  const ubox = (i) => { const b = kbox(i); if (!gridRow(i)) return b; const g = gridOf(i).box; return { ...b, x: g.x, w: g.w }; };
  // Grids: a table, or a grid of divs (Morse Micro's release notes), whose rows are blocks of two or more cells side
  // by side, and which share their columns with a row beside them. A grid is one unit across, so its box is its rows'
  // (with the cells' outer rules), and its head is what names its figures: a table's thead, a first row of th cells,
  // or, for a grid of divs, a framed row above the rows that shares their columns.
  const kidsOf = B.map(() => []);
  B.forEach((b, j) => { if (b.parent >= 0) kidsOf[b.parent].push(j); });
  const memo = (f) => { const m = new Map(); return (j) => { if (!m.has(j)) m.set(j, f(j)); return m.get(j); }; };
  const colsOf = memo((j) => {
    const cs = kidsOf[j].map(bbox).filter((b) => b.w > 0 && b.h > 0).sort((a, b) => a.x - b.x);
    if (cs.length < 2) return null;
    for (let i = 1; i < cs.length; i++) if (cs[i].x < cs[i - 1].x + cs[i - 1].w - 1 || Math.min(cs[i].y + cs[i].h, cs[0].y + cs[0].h) <= Math.max(cs[i].y, cs[0].y)) return null;
    return cs;
  });
  const sameCols = (a, b) => { const n = a.filter((c) => b.some((d) => Math.abs(c.x - d.x) <= 2.5)).length; return n >= 2 && n >= 0.6 * Math.min(a.length, b.length); };
  const divRow = memo((j) => !!colsOf(j) && B[j].parent >= 0 && kidsOf[B[j].parent].some((s) => s !== j && colsOf(s) && sameCols(colsOf(j), colsOf(s)) && (B[s].y >= B[j].y + B[j].h - 1 || B[s].y + B[s].h <= B[j].y + 1)));
  const gridRow = (j) => B[j].display === 'table-row' || (!/^table/.test(B[j].display) && divRow(j));
  // A block's row: itself or an ancestor that is a row of a grid, a few levels up (a cell's paragraph in its cell).
  const rowOf = memo((j) => { for (let a = j, n = 0; a >= 0 && n < 6 && B[a].tag !== 'body'; a = B[a].parent, n++) if (gridRow(a)) return a; return -1; });
  const gridOf = memo((r) => {
    let g, rows;
    const inG = (j) => { for (let a = j; a >= 0; a = B[a].parent) if (a === g) return true; return false; };
    if (B[r].display === 'table-row') {
      g = r;
      while (B[g].parent >= 0 && /^table/.test(B[B[g].parent].display)) g = B[g].parent;
      if (B[g].parent >= 0 && B[B[g].parent].tag === 'table') g = B[g].parent;
      rows = B.map((b, j) => j).filter((j) => B[j].display === 'table-row' && j !== g && inG(j));
    } else {
      g = B[r].parent;
      rows = kidsOf[g].filter((s) => colsOf(s) && sameCols(colsOf(r), colsOf(s)));
    }
    // The head: a table's thead, else its first row when every cell is a th; a grid of divs' framed row above its rows,
    // under a block up to three levels out, sharing their columns.
    let head = null;
    if (B[r].display === 'table-row') {
      const th = L.lines.filter((l) => { if (!inG(l.b)) return false; for (let a = l.b; a !== g; a = B[a].parent) if (B[a].tag === 'thead') return true; return false; });
      const first = rows.slice().sort((a, b) => B[a].y - B[b].y)[0];
      const firstTh = rows.length > 1 && first !== undefined && kidsOf[first].length > 0 && kidsOf[first].every((c) => B[c].tag === 'th') ? L.lines.filter((l) => { for (let a = l.b; a >= 0; a = B[a].parent) if (a === first) return true; return false; }) : [];
      head = th.length ? th : firstTh.length ? firstTh : null;
    } else {
      // Set apart as a head, not one more list above the grid: it draws a frame, a ground or a rule, and stands within
      // two ems of the rows.
      const drawn = (h) => !!(B[h].fill || B[h].shadow || (B[h].bd || []).some((v) => v > 0));
      const has = (h, d, set) => ((colsOf(h) && sameCols(colsOf(h), colsOf(r))) && (set || drawn(h))) || (d > 0 && kidsOf[h].some((c) => has(c, d - 1, set || drawn(h))));
      for (let a = B[g].parent, below = g, n = 0; a >= 0 && n < 3 && !head; below = a, a = B[a].parent, n++) {
        const hs = kidsOf[a].filter((h) => h !== below && B[h].y + B[h].h <= B[g].y + 1 && B[g].y - B[h].y - B[h].h <= 32 && has(h, 2, false)).sort((p, q) => B[q].y - B[p].y);
        if (hs.length) { const h = hs[0]; head = L.lines.filter((l) => { for (let x = l.b; x >= 0; x = B[x].parent) if (x === h) return true; return false; }); rows = [...rows, h]; }
      }
    }
    // A grid that rules its own sides is part of its box, and so is a table that paints its own ground; one that draws
    // nothing is not (Meshtastic's table is a scrolling block a pixel wider than its rows), nor a painted block of rows
    // (The Floor's bench figure), whose ground bounds the window as a wall where it holds the words and halves as a box
    // where it does not, nor a grid that holds the words beside its rows rather than in them (its caption).
    const beside = own.flat().some((l) => inG(l.b)) && !own.flat().some((l) => rows.some((x) => inside(l.b, x)));
    const bd = B[g].bd || [0, 0, 0, 0];
    const draws = !beside && (bd[1] > 0 || bd[3] > 0 || (/^table/.test(B[g].display) && !!(B[g].fill || B[g].shadow)));
    // Across, a grid is as wide as what its rows show: their text, the rules and grounds their cells draw, the boxes
    // drawn in them with no text (a bar's track), not the empty end of a row box wider than its columns (The Floor's
    // bar charts, whose rows run 42 px past their figures, sat left of a wide empty strip, 2026-10-20). Up and down it
    // is its rows' boxes.
    const ink = (r) => { const o = bbox(r); return hull([kbox(r), ...B.map((b, j) => j).filter((j) => inside(j, r) && (B[j].fill || B[j].shadow || bdOf(j).some((v) => v > 0))).map(bbox), ...drawn.filter((f) => f.x >= o.x - 0.5 && f.x + f.w <= o.x + o.w + 0.5 && f.y >= o.y - 0.5 && f.y + f.h <= o.y + o.h + 0.5)].filter((b) => b.w > 0)); };
    const wide = hull(rows.map(ink)), tall = hull(rows.map(bbox));
    const box = hull([{ x: wide.x, y: tall.y, w: wide.w, h: tall.h }, ...(draws ? [bbox(g)] : [])]);
    return { g, rows, box, head: head && head.length ? head : null, inG };
  });
  // The cell that labels a row: its first.
  const labelOf = (r) => { const cs = kidsOf[r].filter((c) => bbox(c).w > 0).sort((a, b) => B[a].x - B[b].x); return cs.length ? cs[0] : -1; };
  // A figure no word of the phrase names: a number with no unit, sign or word after it ("24 30"), which only a head or
  // a caption names. A year is not one.
  const bareFigure = (t) => {
    const toks = String(t).replace(/(\d),(?=\d{3}\b)/g, '$1').split(/\s+/).filter(Boolean);
    return toks.some((k, i) => /^\d+(\.\d+)?$/.test(k) && !/^(19|20)\d\d$/.test(k) && !(toks[i + 1] && /^[%\p{L}°µ×]/u.test(toks[i + 1])) && !(toks[i - 1] && /[$€£¥]$/.test(toks[i - 1])));
  };
  // A phrase's lines are the ones its boxes sit on, not one whose leading grazes them (a cover title's line box).
  const sits = (l, b) => l.x < b.x + b.w && l.x + l.w > b.x && Math.min(l.y + l.h, b.y + b.h) - Math.max(l.y, b.y) > 0.5 * Math.min(l.h, b.h);
  const own = phrases.map((h) => L.lines.filter((l) => h.boxes.some((b) => sits(l, b))));
  if (own.some((ls) => !ls.length)) return { error: 'the words are not on any line of the capture\'s layout; capture it again' };
  const words = new Set(own.flat());
  const U = hull(phrases.map((h) => h.union));
  // Every word must be readable, the small ones too: a row's label in 15 px and its value in 13 px mono read at 13.
  const fs = Math.min(...own.flat().map((l) => l.f)), pad = Math.max(24, 2 * fs), kRead = P.minType / fs;
  // The least room a line keeps from an edge that nothing left out sets (the window's, the push-in's, a box's), and
  // the least margin a side keeps at the type floor: a quarter em of the words' type.
  const room = fs / 4;
  const photos = rec.self ? [] : (rec.media || []).filter((m) => m.kind !== 'svg');
  const holdsU = (b) => b.x <= U.x && b.x + b.w >= U.x + U.w && b.y <= U.y && b.y + b.h >= U.y + U.h;
  // Inline SVG, with the figure that holds it (its legend, its caption) where one does and the words are not in it.
  const figs = B.map((b, j) => j).filter((j) => B[j].tag === 'figure').map(bbox);
  const svgs = (rec.media || []).filter((m) => m.kind === 'svg' && !meets(m, U)).map((m) => {
    const f = figs.filter((b) => b.x <= m.x + 1 && b.x + b.w >= m.x + m.w - 1 && b.y <= m.y + 1 && b.y + b.h >= m.y + m.h - 1 && !meets(b, U)).sort((a, b) => a.w * a.h - b.w * b.h)[0];
    return f ? hull([m, f]) : m;
  });
  // The boxes the page draws that hold no text (a search field, a painted panel): a window edge never halves one either.
  const drawn = L.frames || [];
  // A line's group, for what is shown whole: its table row; else the outermost list item round it that does not hold
  // the words, because an item is one block with its own lists in it (RSS-247's item c, whose lead-in "provided that
  // the emissions comply with the following:" ended the picture with its sub-items left out, 2026-10-20); else its own
  // block.
  const wordBlocks = new Set();
  for (const l of own.flat()) for (let j = l.b; j >= 0; j = B[j].parent) wordBlocks.add(j);
  const group = (l) => {
    for (let j = l.b; j >= 0 && B[j].display !== 'table'; j = B[j].parent) if (B[j].display === 'table-row') return j;
    let g = l.b;
    for (let j = l.b; j >= 0 && B[j].tag !== 'body' && !wordBlocks.has(j); j = B[j].parent) if (B[j].display === 'list-item') g = j;
    return g;
  };
  const wordGroups = new Set([...words].map(group));
  // Which edges would halve a box a block draws: a top or bottom edge halves a fill, a frame (three sides or four) or
  // a rule down a side, which it would cut to a stub; a left or right edge halves a fill or a frame. A rule across a
  // box's top or bottom alone is a line, not a box: a side edge only runs it off the side, as a table's rows run, and
  // a top or bottom edge keeps it whole or leaves it out (counting it as a box left every row of Morse Micro's changelog,
  // a grid of divs ruled across, out of the picture). A table's cells and rows are its grid, kept or left out as rows
  // (group), never as boxes.
  const tbl = (j) => /^table/.test(B[j].display);
  const bdOf = (j) => B[j].bd || [0, 0, 0, 0];
  const framed = (j) => bdOf(j).filter((v) => v > 0).length >= 3;
  // A box that paints its own ground or casts a shadow draws all of its outline, as a frame does.
  const paint = (j) => !!(B[j].fill || B[j].shadow);
  const cutsY = (j) => !tbl(j) && (paint(j) || framed(j) || bdOf(j)[1] > 0 || bdOf(j)[3] > 0);
  const cutsX = (j) => !tbl(j) && (paint(j) || framed(j));
  // A table's row that draws (its own ground or rules, or its cells' grounds, frames or rules) is one box up and down,
  // its text, grounds and rules together: kept whole or left out, never halved by a top or bottom edge. Kept by its
  // lines alone, Meshtastic's framed cells ran off the picture's bottom with no row rule under them, and The Floor's
  // parts table ended on a row with its rule left out (2026-10-20). A row that draws nothing is its lines.
  const rowsDrawn = B.map((b, j) => j).filter((j) => B[j].display === 'table-row').map((j) => {
    const cells = kidsOf[j].filter((c) => paint(c) || bdOf(c).some((v) => v > 0));
    return paint(j) || bdOf(j).some((v) => v > 0) || cells.length ? { g: j, ...hull([bbox(j), ...cells.map(bbox)]) } : null;
  }).filter((r) => r && r.w > 0 && r.h > 0);
  // Where the words sit: a table cell's row; a block with others beside it under one parent (a figure's caption and
  // its number, a definition and its term), that row of them; else the block itself.
  const start = (i) => {
    for (let j = i; j >= 0 && B[j].display !== 'table'; j = B[j].parent) if (B[j].display === 'table-row') return [j];
    if (rowOf(i) >= 0) return [rowOf(i)];
    const me = bbox(i), par = B[i].parent;
    const beside = B.map((b, j) => j).filter((j) => j !== i && B[j].parent === par && par >= 0).filter((j) => {
      const o = bbox(j), ov = Math.min(me.y + me.h, o.y + o.h) - Math.max(me.y, o.y);
      return o.w > 0 && ov > 0.25 * Math.min(me.h, o.h) && (o.x + o.w <= me.x + 1 || o.x >= me.x + me.w - 1);
    });
    return [i, ...beside];
  };
  // Narrower: of several blocks, those that hold the phrase's words; of one, its children that do (a row's cells, a
  // card's label and value), when they are narrower.
  // A grid's row keeps its label cell: a figure in a cell is read by its row's label, so a row narrowed to its cells
  // keeps the first with them, and everything between (The Markup's ledger showed its 43.3 cell with no "Throughput").
  const narrow = (ids, n) => {
    const holds = (j) => own[n].some((l) => inside(l.b, j));
    if (ids.length > 1) { const k = ids.filter((j) => holds(j) || (B[j].parent >= 0 && gridRow(B[j].parent) && labelOf(B[j].parent) === j)); return k.length && k.length < ids.length ? k : null; }
    const u = ids[0];
    let kids = [...new Set(own[n].map((l) => { let j = l.b; while (j >= 0 && B[j].parent !== u) j = B[j].parent; return j; }).filter((j) => j >= 0))];
    if (!kids.length) return null;
    if (gridRow(u) && labelOf(u) >= 0) kids = [...new Set([labelOf(u), ...kids])];
    if (hull(kids.map(kbox)).w < ubox(u).w - 1) return kids;
    return kids.length === 1 ? narrow(kids, n) : null;
  };

  const frame = (units, fy0 = null) => {
    const ids = units.flat(), keep = hull(ids.map(ubox));
    if (!keep || keep.w <= 0) return { wide: true };
    // Every line of the blocks shown whole is read at the floor or above, not only the words' own: a paragraph's line
    // of citation marks in 12 px under its 18 px prose (The Floor's own page) set the zoom too.
    const kRead = P.minType / Math.min(fs, ...L.lines.filter((l) => ids.some((u) => inside(l.b, u))).map((l) => l.f));
    const wordsAnc = new Set();
    for (const u of ids) for (let j = u; j >= 0; j = B[j].parent) wordsAnc.add(j);
    // The grids the words sit in (a row of one, or cells of one): the others are each one unit across.
    const myGrids = new Set(ids.map((u) => rowOf(u)).filter((r) => r >= 0).map((r) => gridOf(r).g));
    const gridAt = (l) => { const r = rowOf(l.b); return r >= 0 && !myGrids.has(gridOf(r).g) ? gridOf(r) : null; };
    // What may show is read in the tallest window the type allows, so a margin is never wider than the gutter.
    const reach = P.h / kRead, levelish = (b) => b.y < U.y + U.h + reach && b.y + b.h > U.y - reach;
    // The ceiling is read off the type the picture is mostly made of, not the words alone (a table's 11 px header
    // set at the ceiling put its 15 px rows at 52 px), leaving out display type (a figure's 44 px number, a cover).
    const wordsMax = Math.max(...own.flat().map((l) => l.f));
    const near = L.lines.filter((l) => l.x < keep.x + keep.w && l.x + l.w > keep.x && levelish(l) && l.f <= 2 * wordsMax).map((l) => l.f).sort((x, y) => x - y);
    const body = Math.max(wordsMax, near.length ? near[Math.floor(near.length / 2)] : fs);
    const foreign = L.lines.filter((l) => !ids.some((u) => inside(l.b, u)));
    const within = (b) => b.x >= keep.x - 1 && b.x + b.w <= keep.x + keep.w + 1 && b.y >= keep.y - 1 && b.y + b.h <= keep.y + keep.h + 1;
    const charts = svgs.filter((m) => !within(m));
    // The boxes other blocks draw (a fill, a frame or a rule; not the words' own block, nor one that holds it), and the
    // boxes drawn with no text (`j` -1), which every edge would halve: a bar's track in a chart, a search field.
    const boxes = [...B.map((b, j) => j).filter((j) => (cutsX(j) || cutsY(j)) && !wordsAnc.has(j) && !ids.some((u) => inside(j, u))).map((j) => ({ j, ...bbox(j) })),
      ...drawn.filter((b) => !within(b)).map((b) => ({ j: -1, ...b }))].filter((b) => b.w > 0 && !holdsU(b) && !meets(b, U));
    const cx = (b) => b.j < 0 || cutsX(b.j), cy = (b) => b.j < 0 || cutsY(b.j);
    const gutter = (lv, ref = keep) => {
      const obs = [...foreign, ...photos, ...charts, ...boxes].filter(lv);
      const right = Math.max(-Infinity, ...obs.filter((o) => o.x + o.w <= ref.x + 0.5).map((o) => o.x + o.w));
      const left = Math.min(Infinity, ...obs.filter((o) => o.x >= ref.x + ref.w - 0.5).map((o) => o.x));
      return [Number.isFinite(right) ? (right + ref.x) / 2 : 0, Number.isFinite(left) ? (ref.x + ref.w + left) / 2 : vw];
    };
    // A box that holds the words and draws a rule down a side or paints its own ground (a card's border, a rail, a
    // column painted white on grey): the window stays inside it across, half a pixel clear of its anti-aliased edge and
    // clear of its rounded corners, so no margin shows the ground beyond it as a strip, a sliver of its rule or the curve
    // of a corner (Meshtastic's note). One that paints, casts a shadow or is framed keeps the picture inside it up and
    // down as well, so its top or bottom edge never runs across the picture with its sides cut off (Geeky Gadgets'
    // takeaways frame); a rule down a side alone needs no more, since the window never shows it. A table's grid is not such a box, and nor, up and down, is a box with others of its kind
    // beside it, a cell of a grid of boxes (Morse Micro's changelog).
    let inL = -Infinity, inR = Infinity;
    const walls = [];
    for (const u of ids) for (let a = tbl(u) ? B[u].parent : u; a >= 0; a = B[a].parent) {
      const bd = bdOf(a), fill = paint(a) && !tbl(a);
      const wall = !tbl(a) && B[a].tag !== 'body' && (fill || framed(a)) && start(a).length === 1, clear = 0.5 + (wall || fill ? B[a].radius || 0 : 0);
      if ((bd[3] > 0 || fill) && B[a].x <= keep.x + 0.5) inL = Math.max(inL, Math.min(keep.x, B[a].x + bd[3] + clear));
      if ((bd[1] > 0 || fill) && B[a].x + B[a].w >= keep.x + keep.w - 0.5) inR = Math.min(inR, Math.max(keep.x + keep.w, B[a].x + B[a].w - bd[1] - clear));
      if (wall) walls.push(a);
    }
    // The margins are the block's own: read off what stands level with the block itself, not with the whole window,
    // whose height reached a table's header far below the words and squeezed the window to a sliver (Morse Micro's
    // release notes), and a 28 px button far above Parallel's paragraph to half a pixel. What stands above or below in
    // a margin is dealt with once the window is placed (next).
    let [loX, hiX] = gutter((b) => b.y < keep.y + keep.h + pad && b.y + b.h > keep.y - pad);
    loX = Math.max(loX, Math.min(keep.x, inL)); hiX = Math.min(hiX, Math.max(keep.x + keep.w, inR));
    const mL = Math.max(0, Math.min(pad, keep.x - loX)), mR = Math.max(0, Math.min(pad, hiX - keep.x - keep.w));
    // The zoom that shows the block whole with its margins, the whole picture still inside the panel at the end of the
    // push-in, every word inside the panel's height, within the type limits; the margins give way first (to a quarter
    // em a side, less only where the gutter is narrower), then the block gives way.
    // What names the words' figures: a figure's caption, a table's caption, and the head of the grid the words sit in (a
    // table's thead or first row of th cells; a grid of divs' framed head row, which names Morse Micro's release notes'
    // units and directions). It stays in the window with them where the window can be moved to keep it, the words
    // leaving the band (below) if that is what it takes. Where the words carry a figure nothing in them names ("24 30"),
    // the zoom also drops as far as the type floor to hold both, and where even that cannot, the shot is its quote card
    // (`unnamed`), never a picture of numbers without their units.
    let capL = [];
    for (let c = ids[0]; c >= 0; c = B[c].parent) {
      if (B[c].tag !== 'figure' && B[c].tag !== 'table' && B[c].display !== 'table') continue;
      capL = foreign.filter((l) => { for (let j = l.b; j >= 0 && j !== c; j = B[j].parent) if (/^(figcaption|caption|thead)$/.test(B[j].tag)) return inside(j, c); return false; });
      break;
    }
    for (const u of ids) { const r = rowOf(u); if (r >= 0 && gridOf(r).head) capL.push(...gridOf(r).head.filter((l) => !ids.some((v) => inside(l.b, v)))); }
    capL = [...new Set(capL)];
    // With the boxes drawn around it (the release notes' framed head, a thead's ruled cells), so the window takes those in
    // whole rather than stopping under a frame its edge would halve.
    const capBoxes = [...new Set(capL.flatMap((l) => { const o = []; for (let a = l.b; a >= 0 && !wordsAnc.has(a); a = B[a].parent) if (B[a].fill || B[a].shadow || bdOf(a).some((v) => v > 0)) o.push(a); return o; }))].map(bbox);
    // The head of the grid the words sit in names every column the picture shows of it, not only the words' figures:
    // Meshtastic's preset rows showed "11 / 2048" and "4/5" with nothing to say they are a spreading factor and a coding
    // rate, and The Floor's parts table "not stated" with no STATED over it (2026-10-20). So it is held like a bare
    // figure's head.
    const ownHead = ids.some((u) => { const r = rowOf(u); return r >= 0 && !!gridOf(r).head; });
    const cap = capL.length ? hull([...capL, ...capBoxes]) : null, mustName = !!cap && (ownHead || phrases.some((h) => bareFigure(h.text)));
    const kTall = P.h / ((1 + 3 * PUSH) * U.h);
    let k = Math.min(P.maxType / body, P.w / (S * (keep.w + mL + mR)), kTall);
    if (k < kRead) k = Math.min(P.maxType / body, P.w / (S * (keep.w + Math.min(mL, room) + Math.min(mR, room))), kTall) >= kRead ? kRead : 0;
    if (k < kRead) return { wide: true };
    if (mustName) {
      // What names the figures is read at the floor too.
      const kCap = P.minType / Math.min(...capL.map((l) => l.f));
      const kFit = (P.h * (1 - 2 * PUSH)) / (hull([keep, cap]).h + 2 * room);
      if (kFit < Math.max(kRead, kCap) || k < kCap - 1e-9) return { unnamed: true };
      k = Math.min(k, kFit);
      // Held with the words in the band where a zoom at or over the floor allows it (slot's four conditions, solved for
      // the panel's height); where none does, the zoom drops to the floor, which keeps the words highest: at the largest
      // zoom that fit, the parts table's head over its Battery hat row put that row's words in the panel's lowest
      // tenth, under YouTube's captions (2026-10-20).
      const b = hull([keep, cap]);
      const need = Math.max((b.h + 2 * room) / (1 - 2 * PUSH), (b.y + b.h - U.y + room) / (0.94 - PUSH), (U.y + U.h - b.y + room) / (0.75 - PUSH), U.h / 0.69);
      if (P.h / need < k) k = Math.max(P.h / need, kRead, kCap);
    }
    // The panel's width, and the widest picture that stays inside it to the end of the push-in.
    const ph = P.h / k, Wt = P.w / k, Wc = Wt / S, e = PUSH * ph;
    // Down: the words at `at` of the panel; moved, where the block (and the caption) fits, so all of it shows with room
    // for the push-in and a quarter em, but never so far that the words leave the band between 6 and 75 percent of the
    // panel (YouTube's captions cover the rest), unless that is what keeping the words' caption or head takes.
    // A placement asked for (pageCrop's search, below) is held to the same range.
    let y0 = fy0 ?? (U.h > 0.8 * ph ? U.y - 0.1 * ph : U.y + U.h / 2 - P.at * ph);
    const slot = (b, band = true) => {
      const lo = Math.max(b.y + b.h + e + room - ph, band ? U.y + U.h - 0.75 * ph : -Infinity), hi = Math.min(b.y - e - room, band ? U.y - 0.06 * ph : Infinity);
      return lo <= hi ? [lo, hi] : null;
    };
    const place = (cap && (slot(hull([keep, cap])) || slot(hull([keep, cap]), false))) || slot(keep) || (fy0 !== null ? [U.y + U.h - 0.75 * ph, U.y - 0.06 * ph] : null);
    if (place) y0 = Math.max(place[0], Math.min(place[1], y0));
    y0 = Math.max(0, Math.min(y0, vh - ph));
    let level = (b) => b.y < y0 + ph && b.y + b.h > y0;
    // Another grid whose rows the window shows is named by its head too: the window moves, inside the band, to show the
    // head with them where it can (the head of Parallel's table of PHY rates sat just above the window over its 40 to 60
    // percent line, 2026-10-20); where it cannot, those rows are left out (below).
    const others = [...new Map(foreign.filter((l) => level(l) && l.x < keep.x + keep.w + pad && l.x + l.w > keep.x - pad).map(gridAt).filter((G) => G && G.head).map((G) => [G.g, G])).values()];
    const bodyOf = (G) => L.lines.filter((l) => !G.head.includes(l) && G.rows.some((r) => inside(l.b, r)));
    for (const G of others) {
      const hb = hull(G.head);
      if (hb.y >= y0 + e + room && hb.y + hb.h <= y0 + ph - e - room) continue;
      const s = slot(hull([keep, ...(cap ? [cap] : []), hb]));
      if (s && bodyOf(G).some(level)) { y0 = Math.max(0, Math.min(vh - ph, Math.max(s[0], Math.min(s[1], y0)))); break; }
    }
    level = (b) => b.y < y0 + ph && b.y + b.h > y0;
    let x0 = keep.x - mL, x1 = keep.x + keep.w + mR;
    if (x1 - x0 > Wc) { const rm = Math.max(0, Wc - keep.w), l = Math.min(keep.x - x0, rm / 2); x0 = keep.x - l; x1 = Math.min(x1, keep.x + keep.w + rm - l); }
    // Room the block does not fill stays the frame's Void, never more of the page: grown into, it showed a
    // neighbour's rule at the edge.
    // A line shown keeps as much room from a side as the words' block keeps there, up to a quarter em: Parallel's list
    // item ended a fifth of a pixel from the Short's edge and Cisco's paragraph started a pixel and a half in.
    const tightAt = (l, a, b) => l.x < a + Math.min(room, keep.x - a) - 0.5 || l.x + l.w > b - Math.min(room, b - keep.x - keep.w) + 0.5;
    const crossesAt = (r, a, b) => (r.x < a - 1 && r.x + r.w > a + 1) || (r.x < b - 1 && r.x + r.w > b + 1);
    // What of a neighbour a side edge would cut, or crowd: the line itself, and every box around it (up to the boxes
    // that hold the words) that the edge would halve, and the grid it sits in, which is one unit across; null where
    // the edges leave all of it whole and clear.
    const needAt = (l, a, b) => {
      const fr = [];
      for (let j = l.b; j >= 0 && !wordsAnc.has(j); j = B[j].parent) if (cutsX(j)) { const f = bbox(j); if (f.x < b && f.x + f.w > a && crossesAt(f, a, b)) fr.push(f); }
      const G = gridAt(l);
      if (G && G.box.x < b && G.box.x + G.box.w > a && crossesAt(G.box, a, b)) fr.push(G.box);
      return tightAt(l, a, b) || fr.length ? hull([l, ...fr]) : null;
    };
    const tight = (l) => tightAt(l, x0, x1), crosses = (r) => crossesAt(r, x0, x1), need = (l) => needAt(l, x0, x1);
    // Text above or below that the edges would cut is taken in whole, with its margin and the box it sits in, where
    // the window has the room and that stays inside the gutters and the box: the rows of The Markup's ledger column
    // around its 43.3 cell, which the cell's own width left out. Where the window cannot grow, it moves across instead,
    // as far as the other side's margin allows down to a quarter em, if that cuts or crowds nothing it kept: Cisco's
    // heading started a pixel and a half inside the edge and was left out with 28 px of margin on the right
    // (2026-10-20). What neither can keep whole is left out below.
    // The gutter for the line taken in is its own: halfway to what stands beside it, as the block's is halfway to what
    // stands beside the block (Cisco's sidebar ends level with the heading, 28 px left of it).
    const gutOf = (o) => {
      const obs = [...foreign, ...photos, ...charts, ...boxes].filter((q) => q !== o && q.y < o.y + o.h + pad && q.y + q.h > o.y - pad);
      const r = Math.max(-Infinity, ...obs.filter((q) => q.x + q.w <= o.x + 0.5).map((q) => q.x + q.w)), l = Math.min(Infinity, ...obs.filter((q) => q.x >= o.x + o.w - 0.5).map((q) => q.x));
      return [Number.isFinite(r) ? (r + o.x) / 2 : 0, Number.isFinite(l) ? (o.x + o.w + l) / 2 : vw];
    };
    // What the window keeps across is ink: the block's text, and every box drawn whole inside it (a framed note under
    // Cisco's list), whose rule is as much a mark at an edge as a letter is (2026-10-20: a shift to take in the heading
    // left the note's right rule 8 px from the picture's edge, measured from the text alone).
    const inkIn = (a, b) => hull([keep, ...boxes.filter((r) => level(r) && r.x >= a - 0.5 && r.x + r.w <= b + 0.5)]);
    const shiftTo = (a, b, o, K = inkIn(x0, x1)) => a >= Math.max(Math.min(loX, gutOf(o)[0]), inL) - 1e-6 && b <= Math.min(Math.max(hiX, gutOf(o)[1]), inR) + 1e-6
      && a <= K.x - Math.min(room, K.x - x0) + 0.5 && b >= K.x + K.w + Math.min(room, x1 - K.x - K.w) - 0.5
      && foreign.every((q) => !level(q) || q.x >= Math.max(b, x1) || q.x + q.w <= Math.min(a, x0) || needAt(q, x0, x1) || !needAt(q, a, b))
      && boxes.every((r) => !cx(r) || !level(r) || crossesAt(r, x0, x1) || !crossesAt(r, a, b));
    for (let more = true, n = 0; more && n < 12; n++) {
      more = false;
      for (const l of foreign.filter((q) => level(q) && q.x < x1 && q.x + q.w > x0)) {
        const o = need(l);
        if (!o) continue;
        const a = Math.min(x0, Math.max(o.x - pad, loX, inL)), b = Math.max(x1, Math.min(o.x + o.w + pad, hiX, inR));
        if (o.x - a >= Math.min(room, keep.x - a) - 0.5 && b - o.x - o.w >= Math.min(room, b - keep.x - keep.w) - 0.5 && b - a <= Wc) { x0 = a; x1 = b; more = true; break; }
        const left = o.x < x0 + room, right = o.x + o.w > x1 - room;
        if (left === right) continue;
        const s = left ? x0 - (o.x - room) : o.x + o.w + room - x1;
        const [a1, b1] = left ? [x0 - s, x1 - s] : [x0 + s, x1 + s];
        if (s > 0 && shiftTo(a1, b1, l) && !needAt(l, a1, b1)) { x0 = a1; x1 = b1; more = true; break; }
      }
    }
    // Level with the words means sharing their line, not a line box's leading: a cover title's descent overlapped
    // The Markup's lede by 2 px.
    const atWords = (b) => [...words].some((w) => Math.min(b.y + b.h, w.y + w.h) - Math.max(b.y, w.y) > 0.3 * Math.min(b.h, w.h));
    // Text beside the block that the edges would still cut, and that lies wholly to one side of the block, moves the
    // edge in to halfway between the two, where nothing the window keeps is cut by it: the margins stop at the
    // gutter of the rows above and below too (the ledger's middle column, which runs further right in other rows).
    // So does a picture, a chart or a drawn box in a margin above or below, wholly to one side of the block.
    const aside = (o) => o.x + o.w <= keep.x + 0.5 || o.x >= keep.x + keep.w - 0.5;
    for (let more = true, n = 0; more && n < 12; n++) {
      more = false;
      const kept = (a, b) => L.lines.filter((q) => level(q) && q.x >= a - 0.5 && q.x + q.w <= b + 0.5);
      const marks = [...foreign.filter((q) => level(q) && q.x < x1 && q.x + q.w > x0).map(need),
        ...[...photos, ...charts, ...boxes.filter(cx)].filter((m) => level(m) && m.x < x1 && m.x + m.w > x0 && aside(m))];
      for (const o of marks) {
        if (!o) continue;
        if (o.x + o.w <= keep.x + 0.5) {
          const a = (o.x + o.w + keep.x) / 2;
          if (a > x0 && !kept(x0, x1).some((q) => q.x < a - 0.5)) { x0 = a; more = true; break; }
        } else if (o.x >= keep.x + keep.w - 0.5) {
          const b = (keep.x + keep.w + o.x) / 2;
          if (b < x1 && !kept(x0, x1).some((q) => q.x + q.w > b + 0.5)) { x1 = b; more = true; break; }
        }
      }
    }
    // A neighbour the side edges would still cut, or a box they would halve, is left out above or below with its text:
    // its words whole and its frame halved read as a stray mark (the release notes' search box). One level with the
    // words means the words' block sits in a wider one.
    const cut = foreign.filter((l) => level(l) && l.x < x1 && l.x + l.w > x0 && need(l));
    const xcut = boxes.filter((b) => cx(b) && level(b) && b.x < x1 && b.x + b.w > x0 && crosses(b));
    if (cut.some(atWords) || xcut.some(atWords)) return { level: true };
    const span = (m) => m.x < x1 && m.x + m.w > x0;
    const pics = [...photos, ...charts].filter((m) => span(m) && level(m));
    // The words' section opens at the nearest heading above them in the page's order, over their block: what stands
    // above that heading belongs to another section and is left out (the tail of RSS-247's 6.4 list over 6.5's
    // heading, 2026-10-20).
    const order = new Map(L.lines.map((l, i) => [l, i]));
    const hOf = (j) => { for (let a = j, n = 0; a >= 0 && n < 3; a = B[a].parent, n++) if (/^h[1-6]$/.test(B[a].tag)) return a; return -1; };
    let prior = [];
    for (let i = Math.min(...[...words].map((l) => order.get(l))) - 1; i >= 0; i--) {
      const l = L.lines[i], h = hOf(l.b);
      if (h < 0 || l.y + l.h > U.y + 0.5 || l.x >= keep.x + keep.w || l.x + l.w <= keep.x) continue;
      const hy = Math.min(...L.lines.filter((q) => inside(q.b, h)).map((q) => q.y));
      prior = L.lines.filter((q, j) => j < i && !inside(q.b, h) && q.y + q.h <= hy + 0.5 && span(q));
      break;
    }
    // And it closes at the next heading below them: that heading and what follows it are another section's, left out
    // (RSS-247's "6.4 Hybrid Systems" and its lead-in under 6.3.2's words, with 6.4's items cut off, 2026-10-20).
    let after = [];
    for (let i = Math.max(...[...words].map((l) => order.get(l))) + 1; i < L.lines.length; i++) {
      const l = L.lines[i], h = hOf(l.b);
      if (h < 0 || wordBlocks.has(h) || l.y < U.y + U.h - 0.5 || l.x >= keep.x + keep.w || l.x + l.w <= keep.x) continue;
      const hy = Math.min(...L.lines.filter((q) => inside(q.b, h)).map((q) => q.y));
      after = L.lines.filter((q, j) => j >= i && q.y >= hy - 0.5 && span(q));
      break;
    }
    // Nothing in the picture is set under the floor (11 pt on the phone the frame fills): another block's line that the
    // zoom would show smaller is left out, with what stands beyond it (a byline in 11 px under The Floor's paragraph,
    // Morse Micro's Previous and Next in 12 px under its version table, a 13.6 px code link in a list on GitHub).
    const under = L.lines.filter((l) => l.f * k < P.minType - 0.05 && level(l) && span(l) && !ids.some((u) => inside(l.b, u)));
    const out = [...cut.map(need), ...xcut, ...pics.filter((m) => !atWords(m)), ...prior, ...after, ...under];
    // A rule across wider than the widest window, with its block's own text at one of its ends, can neither end inside
    // the picture with equal margins nor run off both sides (below): the block that draws it is left out above or below
    // the words, with what stands beyond it (the rule under GitHub's heading over Parallel's table of settings).
    B.forEach((b, j) => {
      if (b.tag === 'body' || framed(j) || paint(j) || wordsAnc.has(j) || !(bdOf(j)[0] || bdOf(j)[2])) return;
      const r = bbox(j);
      if (r.w <= Wc - 1 || r.x >= x1 || r.x + r.w <= x0 || !level(r)) return;
      if (!L.lines.some((l) => inside(l.b, j) && (l.x < r.x + 1 + room || l.x + l.w > r.x + r.w - 1 - room))) return;
      for (const [y, h] of [[r.y, bdOf(j)[0]], [r.y + r.h - bdOf(j)[2], bdOf(j)[2]]]) if (h && (y + h <= U.y + 0.5 || y >= U.y + U.h - 0.5)) out.push({ x: r.x, y, w: r.w, h });
    });
    // A list whose first item the picture leaves out shows only its tail, the end of another block, which goes too.
    // So does the start of one whose last item it leaves out below the words, and the block just before a list it leaves
    // out, its lead-in ("Use one of these options:" over a list whose second item is set under the floor, GitHub).
    const lists = B.map((b, j) => j).filter((j) => /^(ul|ol)$/.test(B[j].tag) && !wordsAnc.has(j)).map((j) => {
      const ls = L.lines.filter((l) => inside(l.b, j));
      const first = ls.length ? ls.reduce((a, q) => (order.get(q) < order.get(a) ? q : a)) : null;
      return { y: B[j].y < -0.5 || !ls.length ? -Infinity : Math.min(...ls.map((l) => l.y)), end: B[j].y + B[j].h > vh + 0.5 || !ls.length ? Infinity : Math.max(...ls.map((l) => l.y + l.h)),
        ls: ls.filter(span), lead: first && order.get(first) > 0 ? L.lines[order.get(first) - 1] : null, first, j };
    }).filter((x) => x.ls.length);
    // Another grid's rows shown without its head are left out (its head was moved into the window above where it could be).
    const grids = [...new Map(foreign.filter((l) => level(l) && span(l)).map(gridAt).filter((G) => G && G.head).map((G) => [G.g, G])).values()].map((G) => ({ head: G.head, body: bodyOf(G).filter(span) }));
    const capSet = new Set(capL);
    // The push-in grows the picture about the words; its top and bottom stay inside the panel to the last frame, and
    // inside a box that holds the words and paints its own ground or draws its sides.
    const oy = U.y + U.h / 2;
    let tLim = Math.max(y0, Math.min(U.y, oy - (oy - y0) / S)), bLim = Math.min(y0 + ph, Math.max(U.y + U.h, oy + (y0 + ph - oy) / S));
    for (const a of walls) { tLim = Math.max(tLim, Math.min(U.y, B[a].y + bdOf(a)[0] + 0.5)); bLim = Math.min(bLim, Math.max(U.y + U.h, B[a].y + B[a].h - bdOf(a)[2] - 0.5)); }
    let top = Math.max(tLim, ...out.filter((o) => o.y + o.h / 2 < oy).map((o) => Math.min(o.y + o.h, U.y)));
    let bot = Math.min(bLim, ...out.filter((o) => o.y + o.h / 2 >= oy).map((o) => Math.max(o.y, U.y + U.h)));
    // Whole lines only, and whole blocks of others: a line the edge would halve is left out, and so is the rest of a
    // paragraph or table row whose start or end the edge leaves out ("everyone." alone above The Markup's 43.3 cell),
    // and a box an edge would halve, with what it holds.
    const lines = L.lines.filter(span);
    const ybox = boxes.filter((b) => span(b));
    // The drawn rows (rowsDrawn) the picture spans, but the words' own and the rows of the head that names them, which
    // the window was placed to hold.
    const yrows = rowsDrawn.filter((r) => span(r) && !wordGroups.has(r.g) && !lines.some((l) => capSet.has(l) && group(l) === r.g));
    // What a box draws, for placing the edges by: a fill, a frame or a rule down a side is the whole box; a rule across
    // its top or bottom is that rule alone, so the next row's box starting where this one ends does not put the edge on
    // this one's rule (Morse Micro's spec rows). A table's grid lines count, and so do the rules across any other block,
    // one that holds the words (the line under Seeed's description) or a row of a grid of divs (Morse Micro's release
    // notes): the picture takes each in with room past it or stops short of it.
    const across = (j, b) => [...(bdOf(j)[0] ? [{ ...b, h: bdOf(j)[0] }] : []), ...(bdOf(j)[2] ? [{ ...b, y: b.y + b.h - bdOf(j)[2], h: bdOf(j)[2] }] : [])];
    const drawsOf = (b) => (b.j < 0 || paint(b.j) || framed(b.j) || bdOf(b.j)[1] > 0 || bdOf(b.j)[3] > 0 ? [b] : across(b.j, b));
    // A table's block that paints its ground or rules a side draws its whole box, as a frame does (a striped row).
    const ink = [...ybox.flatMap(drawsOf),
      ...B.map((b, j) => j).filter((j) => tbl(j)).flatMap((j) => (framed(j) || paint(j) || bdOf(j)[1] > 0 || bdOf(j)[3] > 0 ? [bbox(j)] : across(j, bbox(j)))),
      ...B.map((b, j) => j).filter((j) => !tbl(j) && B[j].tag !== 'body' && !cutsX(j) && !cutsY(j)).flatMap((j) => across(j, bbox(j)))]
      .filter((r) => span(r) && (r.y + r.h <= U.y + 0.5 || r.y >= U.y + U.h - 0.5));
    const outInk = out.flatMap((o) => (o.j !== undefined ? drawsOf(o) : [o]));
    const byGroup = new Map();
    for (const l of lines) { const g = group(l); if (!byGroup.has(g)) byGroup.set(g, []); byGroup.get(g).push(l); }
    let held = null, pTop = top, pBot = bot;
    for (let pass = 0; pass < 24; pass++) {
      for (let moved = true; moved;) {
        moved = false;
        // Never into the words: a cover title's line box ran 2 px into The Markup's lede.
        for (const l of lines) {
          if (l.y < top - 0.5 && l.y + l.h > top + 0.5) { const t = Math.min(l.y + l.h, U.y); if (t > top + 0.01) { top = t; moved = true; } }
          if (l.y < bot - 0.5 && l.y + l.h > bot + 0.5) { const t = Math.max(l.y, U.y + U.h); if (t < bot - 0.01) { bot = t; moved = true; } }
        }
        for (const b of [...ybox.filter(cy), ...yrows]) {
          if (b.y < top - 0.5 && b.y + b.h > top + 0.5) { const t = Math.min(b.y + b.h, U.y); if (t > top + 0.01) { top = t; moved = true; } }
          if (b.y < bot - 0.5 && b.y + b.h > bot + 0.5) { const t = Math.max(b.y, U.y + U.h); if (t < bot - 0.01) { bot = t; moved = true; } }
        }
        for (const [g, ls] of byGroup) {
          if (wordGroups.has(g)) continue;
          const inn = ls.filter((l) => l.y >= top - 0.5 && l.y + l.h <= bot + 0.5);
          if (!inn.length || inn.length === ls.length) continue;
          if (ls.some((l) => l.y + l.h <= top + 0.5)) { const t = Math.max(...inn.map((l) => l.y + l.h)); if (t > top && t <= U.y + 0.5) { top = t; moved = true; } }
          if (ls.some((l) => l.y >= bot - 0.5)) { const t = Math.min(...inn.map((l) => l.y)); if (t < bot && t >= U.y + U.h - 0.5) { bot = t; moved = true; } }
        }
        const kept = (l) => l.y >= top - 0.5 && l.y + l.h <= bot + 0.5;
        for (const x of lists) {
          if (x.y < top - 0.5) {
            const inn = x.ls.filter((l) => kept(l) && l.y + l.h <= U.y + 0.5);
            const t = inn.length ? Math.min(U.y, Math.max(...inn.map((l) => l.y + l.h))) : top;
            if (t > top + 0.01) { top = t; moved = true; }
          }
          if (x.end > bot + 0.5) {
            const inn = x.ls.filter((l) => kept(l) && l.y >= U.y + U.h - 0.5);
            const t = inn.length ? Math.max(U.y + U.h, Math.min(...inn.map((l) => l.y))) : bot;
            if (t < bot - 0.01) { bot = t; moved = true; }
          }
          // The lead-in: the line before the list's first in the page's order, under the words, over the list and
          // within two ems of it, whose list the picture leaves out whole: its block goes with it.
          const ld = x.lead;
          if (ld && x.first.y >= bot - 0.5 && kept(ld) && ld.y >= U.y + U.h - 0.5 && !wordGroups.has(group(ld)) && !inside(ld.b, x.j)
            && ld.y + ld.h <= x.first.y + 0.5 && x.first.y - ld.y - ld.h <= 2 * ld.f && ld.x < x1 && ld.x + ld.w > x0) {
            const t = Math.max(U.y + U.h, Math.min(...lines.filter((q) => group(q) === group(ld) && kept(q)).map((q) => q.y)));
            if (t < bot - 0.01) { bot = t; moved = true; }
          }
        }
        for (const G of grids) {
          const inn = G.body.filter(kept);
          if (!inn.length || G.head.every((l) => kept(l) && span(l))) continue;
          const up = inn.filter((l) => l.y + l.h <= U.y + 0.5), dn = inn.filter((l) => l.y >= U.y + U.h - 0.5);
          if (up.length) { const t = Math.min(U.y, Math.max(...up.map((l) => l.y + l.h))); if (t > top + 0.01) { top = t; moved = true; } }
          if (dn.length) { const t = Math.max(U.y + U.h, Math.min(...dn.map((l) => l.y))); if (t < bot - 0.01) { bot = t; moved = true; } }
        }
      }
      // The picture's edges: halfway between the first line kept (or a kept box's edge) and the nearest thing left out
      // above it, at most two ems past the line, never past the limits; the same below.
      const keptL = lines.filter((l) => l.y >= top - 0.5 && l.y + l.h <= bot + 0.5);
      const keptI = ink.filter((b) => b.y >= top - 0.5 && b.y + b.h <= bot + 0.5);
      held = hull(keptL);
      if (!held) break;
      const kept = [...keptL, ...keptI];
      const first = kept.reduce((a, b) => (b.y < a.y ? b : a)), last = kept.reduce((a, b) => (b.y + b.h > a.y + a.h ? b : a));
      const gone = [...lines.filter((l) => !keptL.includes(l)), ...ink.filter((b) => !keptI.includes(b)), ...outInk, ...pics];
      const above = Math.max(-Infinity, ...gone.filter((o) => o.y + o.h <= first.y + 0.5).map((o) => o.y + o.h));
      const below = Math.min(Infinity, ...gone.filter((o) => o.y >= last.y + last.h - 0.5).map((o) => o.y));
      // A block at an edge whose text stands nearer the text the picture leaves out than the text it keeps belongs with
      // what it leaves out, and goes with it: a heading whose paragraph is under the picture's bottom (GitHub's "OpenWrt
      // Build"), a label whose value is (The Floor's "Encryption"), the last line of a block above the top.
      const gs = new Map();
      // The words' caption or head is theirs, whatever its spacing.
      for (const l of keptL) { const g = group(l); if (!wordGroups.has(g) && !capSet.has(l)) { if (!gs.has(g)) gs.set(g, []); gs.get(g).push(l); } }
      // A heading at the bottom whose section the picture leaves out goes whatever its spacing (GitHub's sit nearly
      // midway between the two).
      const ext = [...gs.entries()].map(([g, ls]) => ({ ...hull(ls), head: /^h[1-6]$/.test(B[g].tag) }));
      const lowest = ext.filter((e) => e.y >= U.y + U.h - 0.5).sort((p, q) => q.y + q.h - p.y - p.h)[0];
      const highest = ext.filter((e) => e.y + e.h <= U.y + 0.5).sort((p, q) => p.y - q.y)[0];
      if (lowest) {
        const up = Math.max(-Infinity, ...keptL.filter((l) => l.y + l.h <= lowest.y + 0.5).map((l) => l.y + l.h));
        const dn = Math.min(Infinity, ...lines.filter((o) => !keptL.includes(o) && o.y >= lowest.y + lowest.h - 0.5).map((o) => o.y));
        if (Number.isFinite(dn) && Number.isFinite(up) && (lowest.head || dn - lowest.y - lowest.h < 0.7 * (lowest.y - up))) { bot = Math.max(U.y + U.h, lowest.y); continue; }
      }
      if (highest) {
        const dn = Math.min(Infinity, ...keptL.filter((l) => l.y >= highest.y + highest.h - 0.5).map((l) => l.y));
        const up = Math.max(-Infinity, ...lines.filter((o) => !keptL.includes(o) && o.y + o.h <= highest.y + 0.5).map((o) => o.y + o.h));
        if (Number.isFinite(dn) && Number.isFinite(up) && highest.y - up < 0.7 * (dn - highest.y - highest.h)) { top = Math.min(U.y, highest.y + highest.h); continue; }
      }
      // Never into the words' own boxes, which run past their lines where a phrase spans table cells (a Range's
      // rectangles include each cell it wholly holds).
      pTop = Math.min(U.y, Math.max(tLim, first.y - Math.min(pad, (first.y - above) / 2)));
      pBot = Math.max(U.y + U.h, Math.min(bLim, last.y + last.h + Math.min(pad, (below - last.y - last.h) / 2)));
      // An edge the limits set, closer to a line than a quarter em: that line is left out too, unless it is the words'.
      if (first.y - pTop < room - 0.01 && pTop <= tLim + 0.01 && first.y + first.h <= U.y + 0.5) { top = Math.min(U.y, first.y + first.h); continue; }
      if (pBot - last.y - last.h < room - 0.01 && pBot >= bLim - 0.01 && last.y >= U.y + U.h - 0.5) { bot = Math.max(U.y + U.h, last.y); continue; }
      break;
    }
    top = pTop; bot = pBot;
    // Now the picture's height is known, each side gets back what the window's height took from it and the picture's
    // does not need (Parallel's margin was pulled to half a pixel by a button the picture leaves out above): up to two
    // ems past the text shown, where the gutter of what stands level with the picture, the box and the panel allow and
    // the wider window cuts nothing new, the narrower margin first.
    if (held) {
      const band = (b) => b.y < bot - 0.5 && b.y + b.h > top + 0.5;
      // The gutter of what the picture shows: its text, where that runs past the block's (Cisco's heading).
      const [gl, gr] = gutter(band, hull([{ ...held, y: keep.y, h: keep.h }, keep]));
      const clean = (a, b) => !L.lines.some((l) => band(l) && l.x < b && l.x + l.w > a && (l.y < top - 0.5 || l.y + l.h > bot + 0.5 || l.x < a - 0.5 || l.x + l.w > b + 0.5))
        && ![...photos, ...charts, ...boxes].some((m) => band(m) && m.x < b && m.x + m.w > a);
      // The margins are measured from the ink the picture shows: its lines and the boxes drawn whole inside it.
      const ink = hull([held, ...boxes.filter((r) => r.y >= top - 0.5 && r.y + r.h <= bot + 0.5 && r.x >= x0 - 0.5 && r.x + r.w <= x1 + 0.5)]);
      let a0 = Math.min(x0, Math.max(ink.x - pad, gl, Math.min(keep.x, inL))), b1 = Math.max(x1, Math.min(ink.x + ink.w + pad, gr, Math.max(keep.x + keep.w, inR)));
      if (!clean(a0, x0)) a0 = x0;
      if (!clean(x1, b1)) b1 = x1;
      let g = Math.max(0, Wc - (x1 - x0)), eL = x0 - a0, eR = b1 - x1, mL0 = ink.x - x0, mR0 = x1 - ink.x - ink.w;
      for (let i = 0; i < 4 && g > 1e-6 && (eL > 1e-6 || eR > 1e-6); i++) {
        const t = eL <= 1e-6 ? [0, Math.min(eR, g)] : eR <= 1e-6 ? [Math.min(eL, g), 0]
          : Math.abs(mL0 - mR0) > 1e-6 ? (mL0 < mR0 ? [Math.min(mR0 - mL0, g, eL), 0] : [0, Math.min(mL0 - mR0, g, eR)])
          : [Math.min(g / 2, eL, eR), Math.min(g / 2, eL, eR)];
        x0 -= t[0]; x1 += t[1]; mL0 += t[0]; mR0 += t[1]; eL -= t[0]; eR -= t[1]; g -= t[0] + t[1];
      }
      // At its full width, the window moves toward equal margins as far as the side it moves to is clear: Cisco's
      // heading, taken in by a shift, sat a quarter em from the left edge with 26 px to spare on the right.
      // Nothing the picture shows may come out cut or crowded by an edge that moves in: a line, the box around it, the
      // grid it sits in (the bars under The Floor's bench caption).
      const stays = (a, b) => L.lines.every((l) => !band(l) || l.y < top - 0.5 || l.y + l.h > bot + 0.5 || l.x >= Math.max(b, x1) || l.x + l.w <= Math.min(a, x0) || needAt(l, x0, x1) || !needAt(l, a, b))
        && boxes.every((r) => !cx(r) || !band(r) || crossesAt(r, x0, x1) || !crossesAt(r, a, b));
      if (g <= 1e-6 && Math.abs(mL0 - mR0) > 2) {
        const t = mL0 < mR0 ? Math.min((mR0 - mL0) / 2, eL) : -Math.min((mL0 - mR0) / 2, eR);
        if (stays(x0 - t, x1 - t)) { x0 -= t; x1 -= t; }
      }
      // A rule across that the picture shows (a heading's underline, a ruled row) either ends inside it with the same
      // margin on both sides or runs off both: one end flush with an edge and the other well inside reads as a rule
      // running off the page (Parallel's headings ended 1.7 px from the right edge and 10.3 px from the left,
      // 2026-10-20). The window moves, grows or narrows to do it, inside the gutters, the boxes that hold the words and
      // the panel, keeping every line it shows whole with its room; a box drawn whole (a frame, a fill) is not a rule.
      const rules = [];
      B.forEach((b, j) => {
        if (b.tag === 'body' || framed(j) || paint(j)) return;
        const r = bbox(j);
        for (const y of [...(bdOf(j)[0] ? [r.y] : []), ...(bdOf(j)[2] ? [r.y + r.h - bdOf(j)[2]] : [])]) if (y >= top - 0.5 && y <= bot + 0.5 && r.x < x1 && r.x + r.w > x0 && r.w > 0) rules.push({ y, a: r.x, b: r.x + r.w });
      });
      const spans = [];
      for (const r of rules.sort((p, q) => p.y - q.y || p.a - q.a)) {
        const s = spans.find((q) => Math.abs(q.y - r.y) < 1 && r.a <= q.b + 1.5 && r.b >= q.a - 1.5);
        if (s) { s.a = Math.min(s.a, r.a); s.b = Math.max(s.b, r.b); } else spans.push({ ...r });
      }
      const fine = (a, b) => spans.every((s) => (s.a <= a + 0.5 && s.b >= b - 0.5) || (s.a > a + 0.5 && s.b < b - 0.5 && Math.abs((s.a - a) - (b - s.b)) <= 1) || s.b <= a || s.a >= b);
      if (!fine(x0, x1)) {
        const lim0 = Math.max(gl, Math.min(keep.x, inL)), lim1 = Math.min(gr, Math.max(keep.x + keep.w, inR));
        const ok = (a, b) => b - a <= Wc + 1e-6 && a >= Math.min(x0, lim0) - 1e-6 && b <= Math.max(x1, lim1) + 1e-6
          && a <= ink.x - Math.min(room, ink.x - x0) + 1e-6 && b >= ink.x + ink.w + Math.min(room, x1 - ink.x - ink.w) - 1e-6
          && (a >= x0 || clean(a, x0)) && (b <= x1 || clean(x1, b)) && stays(a, b) && fine(a, b);
        const tries = [];
        for (const s of spans) {
          const mA = s.a - x0, mB = x1 - s.b;
          // Inside, at the larger margin, the smaller, or their mean; or off both sides, a pixel inside each end.
          for (const m of [Math.max(mA, mB), (mA + mB) / 2, Math.min(mA, mB)]) if (m > 0.5) tries.push([s.a - m, s.b + m]);
          tries.push([Math.max(x0, s.a + 1), Math.min(x1, s.b - 1)]);
        }
        const best = tries.filter(([a, b]) => ok(a, b)).sort((p, q) => Math.abs(p[0] - x0) + Math.abs(p[1] - x1) - Math.abs(q[0] - x0) - Math.abs(q[1] - x1))[0];
        if (best) [x0, x1] = best;
      }
    }
    // The words themselves are always whole; a window that cannot keep them so is not a window for them.
    if (bot - top < 1 || top > U.y + 0.5 || bot < U.y + U.h - 0.5) return { wide: true };
    // A figure nothing in the words names is shown with what names it, whole, or not as a picture at all.
    if (mustName && !capL.every((l) => l.x >= x0 - 0.5 && l.x + l.w <= x1 + 0.5 && l.y >= top - 0.5 && l.y + l.h <= bot + 0.5)) return { unnamed: true };
    // Across, the push-in grows from where the words start (the eye reads from there; a move about their middle took
    // the first letters of every line off the left when the words sat far right, arXiv). The picture starts inset by a
    // twentieth of its way to that point, so its left edge meets the panel's only on the last frame, and it is never
    // wider than the panel over the push-in, so its right edge never leaves the panel either.
    const oxc = Math.max(x0, Math.min(x1, U.x)), wl = x0 - PUSH * (oxc - x0);
    const crop = { x: x0, y: top, w: x1 - x0, h: bot - top };
    const masks = photos.filter((m) => meets(m, crop)).map((m) => ({ x: (m.x - wl) * k, y: (m.y - y0) * k, w: m.w * k, h: m.h * k }));
    const touches = photos.filter((m) => phrases.some((h) => meets(m, h.union))).length;
    return { ok: true, x0: wl, y0, k, cw: Wt, ch: ph, crop, ox: (oxc - wl) * k, oy: (oy - y0) * k, masks, touches, keep, type: fs * k };
  };

  // Up and down, the window first puts the words at `at` of the panel. A line inside that window that its edges left
  // out (for want of a quarter em, or with the push-in) comes back where a placement within a fifth of the panel's
  // height, inside the same range, keeps every line the first one keeps and more of those, the most and then the
  // nearest: Geeky Gadgets' list items, the bench's last bar, the head of Parallel's settings table. Nothing kept is
  // traded for it, and nothing the first window did not reach is brought in. The candidates are where each such line
  // just fits at the top or the bottom, with its quarter em and the push-in.
  const wholeSet = (q) => new Set(L.lines.filter((l) => l.x >= q.crop.x - 0.5 && l.x + l.w <= q.crop.x + q.crop.w + 0.5 && l.y >= q.crop.y - 0.5 && l.y + l.h <= q.crop.y + q.crop.h + 0.5));
  const settle = (units, r) => {
    const ph = r.ch, oy = r.y0 + r.oy / r.k, x0 = r.crop.x - pad, x1 = r.crop.x + r.crop.w + pad, ys = new Set();
    const reached = (l) => l.y >= r.y0 - 0.5 && l.y + l.h <= r.y0 + ph + 0.5;
    // So can a drawn row whose box an edge left out with its lines (rowsDrawn): the candidates are its box's.
    for (const l of [...L.lines, ...rowsDrawn.filter((q) => L.lines.some((l) => reached(l) && inside(l.b, q.g)))]) {
      if (l.x >= x1 || l.x + l.w <= x0 || !(l.g !== undefined || reached(l))) continue;
      ys.add(Math.round(2 * (oy - (1 + PUSH) * (oy - (l.y - room - 1)))) / 2);
      ys.add(Math.round(2 * (oy + (1 + PUSH) * (l.y + l.h + room + 1 - oy) - ph)) / 2);
    }
    const base = wholeSet(r);
    let best = r, n0 = base.size, d0 = 0;
    for (const y of ys) {
      const d = Math.abs(y - r.y0);
      if (d > 0.2 * ph || d < 0.25) continue;
      const q = frame(units, y);
      if (!q.ok) continue;
      const kept = wholeSet(q);
      if ([...base].some((l) => !kept.has(l)) || [...kept].some((l) => !base.has(l) && !reached(l))) continue;
      if (kept.size > n0 || (kept.size === n0 && d < d0)) { best = q; n0 = kept.size; d0 = d; }
    }
    return best;
  };
  let units = phrases.map((h, n) => start(h.blk ?? own[n][0].b));
  for (let tries = 0; tries < 8; tries++) {
    const r = frame(units);
    if (r.unnamed) return { unnamed: true };
    if (r.ok) {
      // A picture under half the panel's width (a price box on a product page) is shown with the blocks around it,
      // up to three levels out, where those can be read whole too; one still under a quarter of the panel is a
      // sliver of a page, and the shot is its quote card (`small`).
      const across = (x) => x.crop.w * x.k;
      let best = r, bestU = units, cur = units;
      for (let lv = 0; lv < 3 && across(best) < 0.45 * P.w; lv++) {
        const up = cur.map((ids) => B[ids[0]].parent);
        if (up.some((u) => u < 0 || B[u].tag === 'body')) break;
        cur = up.map((u) => start(u));
        const w = frame(cur);
        if (w.ok && across(w) > across(best)) { best = w; bestU = cur; }
      }
      return across(best) < 0.25 * P.w ? { small: true } : settle(bestU, best);
    }
    if (r.level) {
      // Text of another block cuts the window level with the words: show the block both sit in.
      const up = units.map((ids) => [...new Set(ids.map((u) => B[u].parent))]);
      if (up.flat().some((u) => u < 0 || B[u].tag === 'body')) return { wide: true };
      units = up;
      continue;
    }
    const nar = units.map((ids, n) => narrow(ids, n));
    if (!nar.some(Boolean)) return { wide: true };
    units = units.map((ids, n) => nar[n] || ids);
  }
  return { wide: true };
}

/**
 * How a page shot shows in this frame: its capture cropped to the words' block (pageCrop), or the quote card of its
 * words (`card`). A refused capture has only its card. So does one whose crop would keep a picture touching the words
 * (`picture`; spec 2.3, row 5: text only): a picture beside the words is covered in Void, and one under them cannot
 * be covered without covering the words. So does one whose words' block cannot be read whole at the frame's smallest
 * type (`wide`), rather than cut its lines, and one that even with the blocks around it would be a sliver of its page
 * at the largest (`small`: a price box on a product page). The render and tools/cuts.mjs check both ask this, of the
 * same crop, so what the check says is what the frame shows, and the Short can leave a picture's shot out.
 */
export function pageView(C, rec, shot) {
  if (rec.refused) return { card: 'refused' };
  if (!rec.ok || !rec.png) return { error: `the capture failed (${rec.error || 'no PNG'})` };
  const phrases = (rec.hl || []).filter((h) => h.found && h.union && h.boxes && h.boxes.length).map((h) => glyphs(h, rec.layout?.lines));
  if (phrases.length < shot.hl.length) return { error: `${shot.hl.length - phrases.length} phrase(s) not boxed in the capture` };
  const P = pageFrame(C), crop = pageCrop(rec, phrases, P);
  if (crop.error) return { error: crop.error };
  if (crop.wide || crop.small || crop.unnamed) return { card: crop.wide ? 'wide' : crop.small ? 'small' : 'unnamed', P, phrases };
  return { card: crop.touches ? 'picture' : null, P, crop, phrases };
}

/**
 * A phrase's boxes as the glyphs' line boxes. A Range's rectangles include the border box of every element it
 * wholly holds, so a phrase that runs across table cells came back with each whole cell beside the words in it, and
 * the highlighter painted that cell as a solid Acid slab (Morse Micro's "24", 2026-10-20); one across a bar of The
 * Floor's figures lit the bar's empty track between its label and its value. A box that holds another box of the same
 * phrase is such an element's, and so is one on no line of text the capture recorded (`lines`): both go, and the
 * union is the words' own.
 */
function glyphs(h, lines) {
  const holds = (a, b) => a !== b && a.x <= b.x + 0.5 && a.y <= b.y + 0.5 && a.x + a.w >= b.x + b.w - 0.5 && a.y + a.h >= b.y + b.h - 0.5 && a.w * a.h > b.w * b.h + 1;
  const onText = (b) => !lines || lines.some((l) => l.x < b.x + b.w && l.x + l.w > b.x && Math.min(l.y + l.h, b.y + b.h) - Math.max(l.y, b.y) > 0.5 * Math.min(l.h, b.h));
  const boxes = h.boxes.filter((a) => !h.boxes.some((b) => holds(a, b)) && onText(a));
  return boxes.length === h.boxes.length || !boxes.length ? h : { ...h, boxes, union: hull(boxes) };
}

/** The mean luminance (0 to 255) of a box of a PNG, in its own pixels: a light page takes a highlighter, a dark one an inverted bar. */
function luma(file, b) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `crop=${Math.max(2, Math.round(b.w))}:${Math.max(2, Math.round(b.h))}:${Math.round(b.x)}:${Math.round(b.y)},scale=1:1:flags=area,format=rgb24`, '-frames:v', '1', '-f', 'rawvideo', 'pipe:1'], { maxBuffer: 1 << 20 });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 3) return 255;
  return 0.2126 * r.stdout[0] + 0.7152 * r.stdout[1] + 0.0722 * r.stdout[2];
}

/**
 * Whether a PNG holds the brand's Acid, counted on a quarter-size copy. Our own pages spend their one Acid on a
 * section number or a figure, and a shot of one that keeps it in frame has spent the shot's Acid already.
 */
function hasAcid(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'scale=iw/4:-1,format=rgb24', '-frames:v', '1', '-f', 'rawvideo', 'pipe:1'], { maxBuffer: 1 << 26 });
  if (r.status !== 0 || !r.stdout) return false;
  let n = 0;
  for (let i = 0; i + 2 < r.stdout.length; i += 3) if (r.stdout[i] > 170 && r.stdout[i] < 235 && r.stdout[i + 1] > 225 && r.stdout[i + 2] < 70 && ++n > 24) return true;
  return false;
}

/** A PNG's pixels as rgb24, `w` by `h`. */
function rgbPixels(file, w, h) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || r.stdout.length !== w * h * 3) die(`shots: could not read ${file} for the bar`);
  return r.stdout;
}
/** rgba pixels, `w` by `h`, as a PNG data URL. */
function pngData(px, w, h) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', 'pipe:0', '-frames:v', '1', '-f', 'image2', '-c:v', 'png', 'pipe:1'], { input: px, maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || !r.stdout.length) die(`shots: could not write a bar: ${String(r.stderr).slice(-300)}`);
  return `data:image/png;base64,${r.stdout.toString('base64')}`;
}
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const KIT_GROUNDS = [rgb(VOID), rgb(BOTTLE)];

/**
 * Where the bar on one line of a phrase ends, in the crop's own pixels. `b` is the line's box and `rows` the bar's
 * rows ([top, bottom), both in crop px), `pad` how far the bar runs past the words (0.14 of the line's height). A
 * column holds ink where a pixel of it in the bar's rows stands more than 6 from the box's ground, its commonest
 * colour (on a dark page Void and Bottle are ground too, a field's). Each end runs the pad past the phrase's own ink,
 * the ink in its box, but stops on a clean column before the first other ink, the next glyph, a punctuation mark,
 * the next word or a rule, so that column stays outside the bar; where that ink is closer than the pad, the bar ends
 * at the phrase's own ink. The pad had run on into the colon after The Floor's "numbers" and The Markup's "print",
 * and into the quote marks round "I Built ... $106.23", lighting half of each (2026-10-20). A mark with no clean
 * column between it and the phrase's ink, a comma kerned into the last letter until they share a column or touch
 * (The Markup's "network,", The Floor's "Alouini,", Seeed's ",powered"), cannot be parted from it by a straight end,
 * so the bar takes it whole where it ends within two pads, rather than cut it in two. Returns [first lit column,
 * first column after it], whole pixels, so the bar's ends fall on the crop's own pixel grid (pageHtml).
 */
function barEnds(img, cw, ch, b, rows, pad, dark) {
  const y0 = Math.max(0, Math.floor(rows[0])), y1 = Math.min(ch, Math.ceil(rows[1]));
  const L = b.x, R = b.x + b.w, x0 = Math.max(0, Math.floor(L)), x1 = Math.min(cw, Math.ceil(R));
  const count = new Map();
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = 3 * (y * cw + x), k = (img[i] << 16) | (img[i + 1] << 8) | img[i + 2]; count.set(k, (count.get(k) || 0) + 1); }
  const mode = count.size ? [...count].reduce((a, q) => (q[1] > a[1] ? q : a))[0] : 0, g = [mode >> 16, (mode >> 8) & 255, mode & 255];
  const far = (i, c) => Math.hypot(img[i] - c[0], img[i + 1] - c[1], img[i + 2] - c[2]) > 6;
  const ink = (x) => {
    if (x < 0 || x >= cw) return false;
    for (let y = y0; y < y1; y++) { const i = 3 * (y * cw + x); if (far(i, g) && !(dark && KIT_GROUNDS.some((c) => !far(i, c)))) return true; }
    return false;
  };
  const wantR = Math.min(cw, Math.round(R + pad)), wantL = Math.max(0, Math.round(L - pad));
  let lo = -1, hi = -1;
  for (let x = x0; x < x1; x++) if (ink(x)) { if (lo < 0) lo = x; hi = x; }
  if (lo < 0) { lo = x0; hi = x1 - 1; }
  // Ink running on from the phrase's with no clean column between: taken whole if a clean column ends it within two
  // pads of the box (a comma is about a quarter of an em; a rule or an underline runs on and is not taken).
  const limR = Math.min(cw, Math.round(R + 2 * pad)), limL = Math.max(0, Math.round(L - 2 * pad));
  let x = hi + 1;
  while (x <= limR && ink(x)) x++;
  if (x <= limR) hi = x - 1;
  x = lo - 1;
  while (x >= limL && ink(x)) x--;
  if (x >= limL) lo = x + 1;
  let e1 = wantR, e0 = wantL;
  for (x = hi + 1; x <= wantR; x++) if (ink(x)) { e1 = x - 1; break; }
  for (x = lo - 1; x >= wantL - 1; x--) if (ink(x)) { e0 = x + 2; break; }
  return [Math.min(e0, lo), Math.max(e1, hi + 1)];
}

/**
 * The lit pixels of a bar over a region of the crop (`q`, whole pixels), as rgb24. On a light page the page
 * multiplied by the bar's colour, a highlighter. On our own dark page the bar is drawn, not blended: a pixel's ink is
 * how far it stands from the region's ground (its commonest colour, Void, Bottle, or a field of either) against the
 * farthest pixel within three of it, the stroke's own solid ink, so a glyph keeps its antialiasing and a Malachite
 * word is as dark as a Flash one. A pixel within 6 of either kit ground is no ink (the other ground's field), and so
 * is one within 8 of its own ground or with no ink near it (under 60 away: a faint tint). The bar is the bar's colour
 * moved toward Void by that share: exact Acid (or Flash) wherever the page shows no ink, the words Void with their own
 * edges. The old way multiplied a grey, inverted copy of the page into the bar, which left Bottle's ground at
 * (167,209,0) and Void's near (197,246,0), off the kit (2026-10-20).
 */
function litRect(img, cw, q, bar, dark) {
  const B = rgb(bar), V = rgb(VOID), w = q.x1 - q.x0, h = q.y1 - q.y0, out = Buffer.alloc(w * h * 3);
  const at = (x, y) => 3 * ((q.y0 + y) * cw + q.x0 + x);
  if (!dark) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = at(x, y), o = 3 * (y * w + x); for (let c = 0; c < 3; c++) out[o + c] = Math.round((img[i + c] * B[c]) / 255); }
    return out;
  }
  const count = new Map();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = at(x, y), k = (img[i] << 16) | (img[i + 1] << 8) | img[i + 2]; count.set(k, (count.get(k) || 0) + 1); }
  const mode = [...count].reduce((a, b) => (b[1] > a[1] ? b : a))[0], g = [mode >> 16, (mode >> 8) & 255, mode & 255];
  const dist = (i, c) => Math.hypot(img[i] - c[0], img[i + 1] - c[1], img[i + 2] - c[2]);
  const d = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = at(x, y); d[y * w + x] = KIT_GROUNDS.some((c) => dist(i, c) <= 6) ? 0 : dist(i, g); }
  // The farthest within R: across, then down.
  const R = 3, across = new Float32Array(w * h), near = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let j = Math.max(0, x - R); j <= Math.min(w - 1, x + R); j++) m = Math.max(m, d[y * w + j]); across[y * w + x] = m; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let j = Math.max(0, y - R); j <= Math.min(h - 1, y + R); j++) m = Math.max(m, across[j * w + x]); near[y * w + x] = m; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = near[y * w + x], a = k < 60 ? 0 : Math.min(1, Math.max(0, (d[y * w + x] - 8) / (k - 8))), o = 3 * (y * w + x);
    for (let c = 0; c < 3; c++) out[o + c] = Math.round(B[c] + (V[c] - B[c]) * a);
  }
  return out;
}

/** A captured byline as a credit: one name, trimmed; a URL or a handle is not a name. Null when there is none. */
export function cleanAuthor(v) {
  const a = String(Array.isArray(v) ? v[0] || '' : v || '').replace(/\s+/g, ' ').trim();
  return !a || a.length > 80 || /^(https?:|www\.|@)/i.test(a) ? null : a;
}
/** Whether `text` already names `author`: by surname ("Xu, Jiajie" and "Jiajie Xu" are both Xu), or whole. */
export function namesAuthor(text, author) {
  const t = ` ${String(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')} `;
  const a = author.toLowerCase();
  const surname = (a.includes(',') ? a.split(',')[0] : a.split(/\s+/).pop()).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return t.includes(` ${a.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `) || (!!surname && t.includes(` ${surname} `));
}

/**
 * Who wrote a captured page, who published it and when, as its shot's label names them and a description credits
 * them (tools/cuts.mjs): the cut list's own `by:`, `pub:` and `date:` for the source first, then what the capture read.
 * The author is named because fair dealing for criticism and news reporting names the source and, where the source
 * gives one, its author (Copyright Act ss. 29.1 and 29.2; spec 2.6); one the publisher's name already carries (the
 * paper's authors in the cut list's pub:) is not named twice. `author` is the capture's own byline, whatever `by` says,
 * so the check can say when a credit leaves it out. Our own pages are named by edition. A refused capture is named by
 * its host and the day the edition read it, because the wall's title says nothing about the source.
 */
export function pageSource(C, rec) {
  const src = rec.src ? C.S.sources?.[rec.src] : null;
  const given = src && typeof src === 'object' ? src : {};
  if (rec.refused) {
    const read = rec.source && /\bread (\d{1,2} [A-Z][a-z]{2} \d{4})/.exec(rec.source.text || '');
    return { n: rec.src, pub: given.pub || new URL(rec.url).hostname.replace(/^www\./, ''), date: given.date || (read ? `read ${read[1]}` : ''), by: given.by || null, author: null, own: null };
  }
  const ed = rec.self ? edition(rec.page) : null;
  const pub = ed ? `${SITE.name} · ${ed.title}` : given.pub || rec.publisher || new URL(rec.finalUrl || rec.url).hostname.replace(/^www\./, '');
  const date = ed ? ed.dateLabel : given.date || dayLabel(rec.published) || `read ${dayLabel(rec.readAt)}`;
  const author = ed ? null : cleanAuthor(rec.author);
  const by = ed ? null : given.by || (author && !namesAuthor(pub, author) ? author : null);
  return { n: rec.src, pub, date, by, author, own: ed ? ed.title : null };
}
/** A page shot's source as its label sets it: "[02] Julian Horsey, Geeky Gadgets". */
const pageCredit = (ps) => `${ps.n ? `[${ps.n}] ` : ''}${ps.by ? `${ps.by}, ` : ''}${ps.pub}`;

/**
 * The label's type, never under the frame's floor (pageFrame's `minType`, the floor the page's own type keeps), and
 * its lines. One line at the frame's size where it fits; a long one (an author, an office and its department)
 * smaller, down to the floor; longer still, two lines growing up from the same place, at the frame's size where its
 * parts fit two (smaller, down to the floor, where they do not; more lines where two cannot hold it at the floor),
 * so it never runs past the panel into the Short's buttons. Martian Mono at the label's width and tracking advances
 * 0.748 to 0.755 em a character (measured in Chromium, 2026-10-20), so a line's width is known before a frame; 0.76
 * errs wide, so the browser never wraps a line it is given. `w` is the line's width: the panel's, or a card's.
 */
const LABEL_EM = 0.76;
function labelType(P, text, w = P.w) {
  const one = Math.floor(w / (Math.max(1, text.length) * LABEL_EM));
  if (one >= P.size) return { size: P.size, lines: [text] };
  if (one >= P.minType) return { size: one, lines: [text] };
  for (let size = P.size; size > P.minType; size--) { const lines = labelLines(text, size, w); if (lines.length <= 2) return { size, lines }; }
  return { size: P.minType, lines: labelLines(text, P.minType, w) };
}
/**
 * A label's lines at `size` in `w`, broken between its parts (the credit, the publisher, the date), never inside
 * one where it fits a line whole, so a date keeps its year ("15 SEP" over "2026", The Markup's card in the Short);
 * the separator where two parts meet at a break is left out, because a line that ended on it ("THE MARKUP ·" over
 * "15 SEP 2026") left the dot hanging (2026-10-20). A part longer than a line starts one of its own and breaks at
 * its spaces. The lines are set as they are given (white-space: pre-line), so the break is this one.
 */
function labelLines(text, size, w) {
  const fits = (t) => t.length * LABEL_EM * size <= w, out = [];
  for (const part of text.split(' · ')) {
    const last = out.length - 1;
    if (last >= 0 && fits(`${out[last]} · ${part}`)) { out[last] += ` · ${part}`; continue; }
    if (fits(part) || !part.includes(' ')) { out.push(part); continue; }
    let line = null;
    for (const word of part.split(' ')) {
      if (line !== null && fits(`${line} ${word}`)) line += ` ${word}`;
      else { if (line !== null) out.push(line); line = word; }
    }
    out.push(line);
  }
  return out;
}

/**
 * The record tools/capture.mjs wrote for a page tag, found by the same name the capture gave it. The cut list's
 * sources give an outside source its URL, as they gave it to the capture; a value is a URL or a source object.
 */
export function pageRecord(C, tag) {
  const urls = Object.fromEntries(Object.entries(C.S.sources || {}).map(([k, v]) => [k, typeof v === 'string' ? v : v && v.url]).filter(([, v]) => v));
  let shot;
  try { shot = parsePage(tag.body, urls); } catch (e) { die(`shots: [[page: ${tag.body}]]: ${e.message}`); }
  const name = shotName(C.SLUG, shot);
  const file = path.join(C.PAGES, `${name}.json`);
  if (!fs.existsSync(file)) die(`shots: no capture for [[page: ${tag.body}]] (${path.join(C.PAGES, name)}.json); run node tools/capture.mjs ${C.SLUG} --page "${tag.body}"`);
  return { shot, rec: JSON.parse(fs.readFileSync(file, 'utf8')), file };
}

/**
 * A page shot of `d` seconds. The capture on Void, ungraded so the source is recognisably itself (spec 2.5, reading
 * 1), cropped to the words' own block (pageCrop); a Malachite mono label naming the publisher and the date; an Acid
 * box sweeping each phrase on the word that says it, one phrase lit at a time, so the shot spends one Acid; and one
 * linear 5 percent push-in from the words for the whole shot, footage grammar on third-party pixels (reading 2). On a
 * light page the bar is the page multiplied by Acid, a highlighter; on a dark one (ours) it is drawn from the crop
 * (litRect), exact Acid with the words in Void, so both read as dark type on Acid, and Flash where our page's own Acid
 * is in frame. Each end of a bar stops short of any ink not the phrase's own (barEnds), on the crop's own pixel grid.
 * The bar is drawn into the picture rather than over it: each line's box shows its own copy of the crop, set exactly
 * where the page is, lit between the bar's ends and the page itself for three pixels past each, so the box's edge
 * falls where its picture and the page's are the same pixels and is never seen, and the bar's end is a boundary
 * between two of the crop's pixels, resampled as the page is; an end clipped over the page instead mixed the bar, the
 * page's ground and a glyph's edge in one pixel wherever the frame's grid cut it. The label, and a card's source line
 * and words, are set at the frame's floor or
 * above (labelType), clear of the Short's buttons. A capture that was refused (a
 * wall, robots.txt, YouTube) becomes the quote card with the same words, so the cut always renders and nothing is
 * routed around; so does one whose crop would keep a picture on the words, or whose words' block cannot be read whole
 * at the frame's smallest type (pageView). The label names the author where the capture or the cut list gives one
 * (pageSource). `d` is the shot's length, `words` the film's, timed; `work` takes the cropped PNG.
 */
export async function pageHtml(C, s, { d, words = [], work, ground = VOID }) {
  const { shot, rec } = pageRecord(C, s.tag);
  const ps = pageSource(C, rec);
  const v = pageView(C, rec, shot);
  if (v.card) {
    // The edition's own source line says when it was read; the wall's title says nothing about the source.
    // Every phrase is swept on its word, as the page would have swept it; a refused page's card never had more.
    const plans = sweepPlan(shot.hl, s, d, words);
    const qC = { ...C, S: { ...C.S, sources: { page: { pub: pageCredit(ps), date: ps.date } } } };
    // Its source line is the shot's label and is set as the label is, at the frame's floor or above, wrapping inside
    // the card (and clear of the Short's buttons); the card's empty byline takes the same size.
    const P0 = pageFrame(C), sw = Math.min(C.W - 2 * C.M - (C.SHORT ? 0 : 240), P0.w), st = labelType(P0, `${pageCredit(ps)} · ${ps.date}`.replace(/—/g, ' – '), sw);
    if (st.lines.length > 1) qC.S.sources.page = { pub: st.lines.join('\n'), date: '' };
    // The card's words keep to the same width: in the Short the card is as wide as the frame's margins allow and its
    // words ran into the right 120 px where the Shorts buttons stand ("an 8" to x 1014.5, The Markup's ledger, 2026-10-20).
    const qw = C.W - 2 * C.M - (C.SHORT ? 0 : 240);
    const own = `${sw < qw ? `.q{width:${sw}px}` : ''}.q .src{font-size:${st.size}px;line-height:${Math.round(1.3 * st.size)}px;max-width:${sw}px${st.lines.length > 1 ? ';white-space:pre-line' : ''}}.q .by{font-size:${st.size}px}`;
    const h = quoteHtml(qC, { src: 'page', text: shot.hl.join(' … '), hl: shot.hl[0], by: '' }, plans[0].at, shot.hl.length > 1 ? plans : null, ground, own);
    // Several phrases keep the voice's own pace (sweepPlan ends the last before the cut), as the page does (`whole`).
    const many = shot.hl.length > 1, last = plans[plans.length - 1];
    return { ...h, animMs: many ? last.at + last.dur : plans[0].at + 900, whole: many || undefined, brand: h.html.replace(/<div class="t">[\s\S]*?<\/div>/, '<div class="t"></div>'), card: v.card, refused: v.card === 'refused' ? `${rec.refusal}: ${rec.reason}` : null, sweeps: plans };
  }
  if (!rec.ok || !rec.png) die(`shots: the capture for [[page: ${s.tag.body}]] failed (${rec.error || 'no PNG'}); fix the tag and capture again`);
  if (v.error) die(`shots: [[page: ${s.tag.body}]]: ${v.error}; capture again`);
  const { P, crop: c, phrases } = v, png = path.join(C.PAGES, rec.png), dpr = rec.viewport.dpr || 2;
  // Only the crop goes into the frame: a whole capture is up to 6 MB of PNG for a fifth of its pixels. The crop is
  // the part of the window that is picture (whole lines of the words' block); the rest of the panel is Void.
  const crop = path.join(work, `${rec.name}-${C.SHORT ? 'tall' : 'wide'}.png`);
  const px = (v) => Math.round(v * dpr);
  const cx = px(c.crop.x), cy = px(c.crop.y), cw = px(c.crop.x + c.crop.w) - cx, ch = px(c.crop.y + c.crop.h) - cy;
  ff(['-i', png, '-vf', `crop=${cw}:${ch}:${cx}:${cy}`, '-frames:v', '1', crop], `page crop ${rec.name}`);
  // Where the picture sits in the panel, in frame px: the window's left edge is the panel's, the words at `at`.
  const pic = { x: (cx / dpr - c.x0) * c.k, y: (cy / dpr - c.y0) * c.k, w: (cw / dpr) * c.k, h: (ch / dpr) * c.k };
  const dark = luma(png, { x: px(phrases[0].union.x), y: px(phrases[0].union.y), w: px(phrases[0].union.w), h: px(phrases[0].union.h) }) < 110;
  // On our own page with its Acid in frame the bar is Flash, so the shot still spends one Acid, the page's own.
  const bar = rec.self && dark && hasAcid(crop) ? FLASH : ACID;
  // One box a line: a phrase that runs into bold or a link comes back as a box per element, and two padded boxes
  // overlapping multiply into a darker seam (Parallel's "$208–$450", 2026-10-20). Lines are found by the boxes'
  // middles first, then merged left to right: a table row's two cells sit 2 px apart in height, and sorting by
  // height alone merged the value into the label across the whole row (Morse Micro).
  const lines = (bs) => {
    const rows = [];
    for (const b of bs) { const r = rows.find((q) => Math.abs(q[0].y + q[0].h / 2 - (b.y + b.h / 2)) < 0.5 * Math.min(q[0].h, b.h)); if (r) r.push(b); else rows.push([b]); }
    return rows.sort((a, b) => a[0].y - b[0].y).flatMap((r) => r.sort((a, b) => a.x - b.x).reduce((out, b) => {
      const l = out[out.length - 1];
      if (l && b.x <= l.x + l.w + 0.6 * b.h) Object.assign(l, hull([l, b])); else out.push({ ...b });
      return out;
    }, []));
  };
  // The bar's ends in the crop's pixels (barEnds) and its rows, 0.08 of the line's height above and below it as
  // before. Each line's box reaches EXT of the crop's pixels past each end, where it shows the page itself.
  const f = (v) => v.toFixed(1);
  const img = rgbPixels(crop, cw, ch);
  const pg = { x: +f(pic.x), y: +f(pic.y), w: +f(pic.w), h: +f(pic.h) }, sx = pg.w / cw;
  const EXT = 3;
  const bars = phrases.map((h) => lines(h.boxes).map((b) => {
    const top = (b.y - 0.08 * b.h) * dpr - cy, bot = (b.y + 1.08 * b.h) * dpr - cy;
    const [e0, e1] = barEnds(img, cw, ch, { x: b.x * dpr - cx, y: b.y * dpr - cy, w: b.w * dpr, h: b.h * dpr }, [top, bot], 0.14 * b.h * dpr, dark);
    const padY = 0.08 * b.h * c.k;
    return { e0, e1, top, bot, box: { x: pg.x + (e0 - EXT) * sx, y: (b.y - c.y0) * c.k - padY, w: (e1 - e0 + 2 * EXT) * sx, h: b.h * c.k + 2 * padY } };
  }));
  // Each line's own picture: the crop's size, drawn exactly where the page is (a cut of it drawn at its own place
  // lands up to a pixel off the page's, because Chromium snaps where an image starts), clear except under the line's
  // box and two pixels round it, where it is the page, lit between the bar's ends in all of the bar's rows and two
  // more each way (so the box's top and bottom edges resample lit pixels, as the whole-crop bar did), and lit where an
  // earlier line of the same phrase is lit, so a box never shows an earlier line unlit where they meet.
  const cut = (p, j) => {
    const r = bars[p][j];
    const q = { x0: Math.max(0, r.e0 - EXT - 2), x1: Math.min(cw, r.e1 + EXT + 2), y0: Math.max(0, Math.floor(r.top) - 2), y1: Math.min(ch, Math.ceil(r.bot) + 2) };
    const px = Buffer.alloc(cw * ch * 4);
    for (let y = q.y0; y < q.y1; y++) for (let x = q.x0; x < q.x1; x++) { const i = y * cw + x; img.copy(px, 4 * i, 3 * i, 3 * i + 3); px[4 * i + 3] = 255; }
    const paint = (o, ya, yb) => {
      const lit = { x0: Math.max(q.x0, o.e0), x1: Math.min(q.x1, o.e1), y0: Math.max(q.y0, ya), y1: Math.min(q.y1, yb) };
      if (lit.x1 <= lit.x0 || lit.y1 <= lit.y0) return;
      const v = litRect(img, cw, lit, bar, dark), lw = lit.x1 - lit.x0;
      for (let y = lit.y0; y < lit.y1; y++) for (let x = lit.x0; x < lit.x1; x++) v.copy(px, 4 * (y * cw + x), 3 * ((y - lit.y0) * lw + x - lit.x0), 3 * ((y - lit.y0) * lw + x - lit.x0) + 3);
    };
    for (let k = 0; k < j; k++) paint(bars[p][k], Math.floor(bars[p][k].top), Math.ceil(bars[p][k].bot));
    paint(r, q.y0, q.y1);
    return pngData(px, cw, ch);
  };
  const boxes = bars.map((bs) => bs.map((r) => r.box));
  // The push-in grows from where the words start: the eye reads from there, and a move about their middle took the
  // first letters of every line off the left when the words sat far right (arXiv, 2026-10-20). pageCrop holds it
  // where every line shown stays whole to the last frame.
  const { ox, oy } = c;
  const plan = sweepPlan(phrases.map((h) => h.text), s, d, words);
  const label = `${pageCredit(ps)} · ${ps.date}`.replace(/—/g, ' – ');
  const lt = labelType(P, label), lh = Math.round(1.3 * lt.size), many = lt.lines.length > 1;
  const hl = boxes.map((bs, p) => bs.map((b, j) => `<div class="hl" data-p="${p}" style="left:${f(b.x)}px;top:${f(b.y)}px;height:${f(b.h)}px;width:0"><span style="left:${f(pg.x - +f(b.x))}px;top:${f(pg.y - +f(b.y))}px;background:url(${cut(p, j)}) 0 0/100% 100% no-repeat"></span></div>`).join('')).join('');
  const masks = c.masks.map((m) => `<div class="mask" style="left:${f(m.x)}px;top:${f(m.y)}px;width:${f(m.w)}px;height:${f(m.h)}px"></div>`).join('');
  const data = `url(data:image/png;base64,${fs.readFileSync(crop).toString('base64')})`;
  // More than one line grows up from the foot of the first line's place, each line as labelLines broke it.
  const extra = `.lab{position:absolute;left:${P.x}px;${many ? `bottom:${C.H - P.label - lh}px` : `top:${P.label}px`};font-size:${lt.size}px;color:${MAL};${many ? `width:${P.w}px;line-height:${lh}px;white-space:pre-line` : 'white-space:nowrap'}}
.panel{position:absolute;left:${P.x}px;top:${P.y}px;width:${P.w}px;height:${P.h}px;overflow:hidden;background:${VOID}}
.doc{position:absolute;left:0;top:0;width:${P.w}px;height:${P.h}px;transform-origin:${f(ox)}px ${f(oy)}px;--pg:${data}}
.pg{position:absolute;left:${f(pg.x)}px;top:${f(pg.y)}px;width:${f(pg.w)}px;height:${f(pg.h)}px;background:var(--pg) 0 0/100% 100% no-repeat}
.mask{position:absolute;background:${VOID}}
.hl{position:absolute;overflow:hidden}
.hl span{position:absolute;width:${f(pg.w)}px;height:${f(pg.h)}px}`;
  // The picture's covers go over the bars, whose copies of the crop show the page's own pixels round them.
  const html = page(C, `<div class="lab mono">${esc(lt.lines.join('\n'))}</div><div class="panel"><div class="doc" id="doc"><div class="pg"></div>${hl}${masks}</div></div>
<script>const W=${JSON.stringify(boxes.map((bs) => bs.map((b) => +f(b.w))))},T=${JSON.stringify(plan.map((x) => [x.at, x.dur]))},D=${Math.round(d * 1000)},doc=document.getElementById('doc'),els=W.map((_,p)=>[...document.querySelectorAll('.hl[data-p="'+p+'"]')]);
window.__frame=(ms)=>{doc.style.transform='scale('+(1+0.05*Math.min(1,ms/D)).toFixed(5)+')';let cur=-1;T.forEach((t,p)=>{if(ms>=t[0])cur=p;});
W.forEach((ws,p)=>{let left=p===cur?ws.reduce((a,b)=>a+b,0)*Math.min(1,(ms-T[p][0])/T[p][1]):0;els[p].forEach((e,j)=>{const w=Math.max(0,Math.min(ws[j],left));e.style.width=w.toFixed(2)+'px';left-=w;});});};
window.__frame(0);window.__ready=true;</script>`, VOID, extra);
  return { html, brand: html.replace(/url\(data:[^)]*\)/g, 'url()'), anim: true, live: true, animMs: Math.round(d * 1000), whole: true, sweeps: plan, label, dark, flash: bar === FLASH, masked: c.masks.length, zoom: c.k, type: c.type };
}

/* ---- pop: one to three words, landing on the word --------------------------------- */
/**
 * The pop as a transparent overlay: uppercase Bricolage at weight 800, left on the grid in the upper third, clear
 * of the captions, in a Void field box so it reads over a page, footage or the rose alike (the kit's field, never a
 * shadow). It lands in 120 ms with its width axis stepping 75 to 100 (override 3, the one flexing element), and is
 * sized in the frame, after the face has loaded, to fit at width 100. Flash by default; Acid only when the shot
 * beneath spends none (`acid`), so a pop over a page's highlighter or a chart's point never makes a second.
 */
export function popHtml(C, tag, { acid = false } = {}) {
  const size = C.SHORT ? 132 : 150, top = Math.round(C.H * (C.SHORT ? 0.15 : 0.12));
  const max = C.SHORT ? C.W - C.M - 120 : C.W - 2 * C.M, padX = Math.round(size * 0.22), padY = Math.round(size * 0.14);
  return page(C, `<div class="pop" id="p"><span id="w">${esc(tag.text)}</span></div>
<script>const p=document.getElementById('p'),w=document.getElementById('w');
document.fonts.load("800 ${size}px 'Bricolage Grotesque'").then(()=>{w.style.setProperty('--wdth','100');const r=p.getBoundingClientRect().width;
if(r>${max})w.style.fontSize=(${size}*(${max - 2 * padX})/(r-${2 * padX})).toFixed(1)+'px';
window.__frame=(ms)=>{w.style.setProperty('--wdth',(75+25*Math.min(1,ms/120)).toFixed(2))};window.__frame(0);window.__ready=true;});</script>`, 'transparent',
  `.pop{position:absolute;left:${C.M - padX}px;top:${top - padY}px;padding:${padY}px ${padX}px;background:${VOID};white-space:nowrap}
.pop span{display:block;font-size:${size}px;line-height:.86;letter-spacing:-.02em;text-transform:uppercase;color:${acid ? ACID : FLASH};font-variation-settings:'opsz' 96,'wdth' var(--wdth,75),'wght' 800}`);
}

/**
 * When a pop leaves (R5): from the first word it names, for that word's length and 0.6 s more, never under 0.9 s,
 * one slow beat, never past `next`; `hold:` overrides. A pop that paraphrases ("NO MEASUREMENT." over "It had no
 * measurement") matches on the words it shares; one that shares none holds from the word it lands on.
 */
export function popEnd(o, next, words) {
  if (o.tag.hold) return Math.min(next, o.t + +o.tag.hold);
  const want = new Set(o.tag.text.split(/\s+/).map(wordKey).filter(Boolean));
  const win = words.filter((w) => w.s >= o.t - 0.05 && w.s < next && !CITE.test(w.w));
  if (!win.length) return Math.min(next, o.t + 0.9);
  const hits = win.slice(0, 8).filter((w) => want.has(wordKey(w.w)));
  const a = hits[0] || win[0], b = hits[hits.length - 1] || win[0];
  return Math.min(next, Math.max(o.t + 0.9, a.s + 0.9, b.e + 0.6));
}

/**
 * A computed shot's HTML by its kind; a footage, gag or clip shot with no file is the slate that names it. A page
 * shot also needs its length, the film's words and the work directory (`opts`), because it moves for the whole
 * shot and lands on the voice.
 */
export async function shotHtml(C, s, landMs = null, held = [], opts = {}) {
  const k = s.tag.kind;
  if (k === 'page') return pageHtml(C, s, opts);
  if (k === 'quote') return quoteHtml(C, s.tag, 0, null, opts.ground);
  if (k === 'map') return mapHtml(C, s.tag);
  if (k === 'chart') return chartHtml(C, s.tag, landMs, held);
  if (k === 'fig') return figHtml(C, s.tag);
  if (k === 'card') return cardHtml(C, s.tag);
  if (k === 'title') return titleHtml(C);
  if (k === 'end') return endHtml(C);
  if (k === 'blank') return { html: page(C, '') };
  return slateHtml(C, s.tag);
}

/**
 * Where a chart's point lands (source/channel/brief-2026-09-26.md, 6: narration in step with the picture): on the
 * first word inside the shot that speaks the starred value, in ms from the shot's first frame. Held to at least one
 * beat in, so the context has a beat to build, and to half a beat before the cut, so the landed value is on screen
 * before the next shot. Null when no word in the shot says it, or the shot is too short to build and land in; the
 * chart then keeps its own timing.
 */
export function chartLand(s, words, d) {
  const inShot = words.filter((w) => w.s >= s.t && w.s < s.end);
  const i = findSpoken(inShot, hotValues(s.tag.type, s.tag.rows));
  if (i < 0) return null;
  const at = (inShot[i].s - Math.round(s.t * FPS) / FPS) * 1000; // from the shot's first frame on the film's grid
  const ms = Math.min(Math.max(at, 900), d * 1000 - 450);
  return ms >= 900 ? { word: inShot[i], at, ms: Math.round(ms) } : null;
}

/**
 * An overlay is a figure said aloud, so it leaves when the voice moves on: at the end of the sentence that says the
 * last of its numbers ("$202.6M CASH · $814.9M BITCOIN" goes when "814.9 million in bitcoin" is done), or of the
 * sentence it lands in when none is said ("FULLY FUNDED"), never later than the next tag and never before one bar
 * (3.6 s: a figure and its label take that long to read, even when its sentence is three words).
 * Before 2026-09-26 it held until the next tag, which left stale figures up for half a minute under new ones.
 * Spoken numbers match as said: "10 billion" is 10,000,000,000, "the thirtieth" is 30.
 */
const ORDINALS = Object.fromEntries(['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth',
  'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'].map((w, i) => [w, i + 1]));
const SCALE = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
export function overEnd(o, next, words) {
  const same = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a));
  const want = (String(o.tag.value || '').match(/\d[\d,]*(?:\.\d+)?/g) || []).map(numKey).filter((v) => v !== null);
  const win = words.filter((w) => w.s >= o.t - 0.05 && w.s < next);
  if (!win.length) return next;
  const said = (i) => {
    const k = numKey(win[i].w) ?? ORDINALS[win[i].w.toLowerCase().replace(/[^a-z-]/g, '')] ?? null;
    if (k === null) return [];
    const m = win[i + 1] && SCALE[win[i + 1].w.toLowerCase().replace(/[^a-z]/g, '')];
    return m ? [k, k * m] : [k];
  };
  let last = 0;
  win.forEach((w, i) => { if (said(i).some((v) => want.some((x) => same(v, x)))) last = i; });
  let j = last;
  while (j < win.length - 1 && !/[.?!]["”’)]*$/.test(win[j].w)) j++;
  return Math.min(next, Math.max(o.t + 3.6, win[j].e + 0.2));
}

/* ---- render ------------------------------------------------------------------ */
export function ff(args, what) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) { console.error(`episode: ffmpeg failed on ${what}\n${(r.stderr || '').slice(-1500)}`); process.exit(1); }
}

const warned = new Set();
export const warnOnce = (m) => { if (warned.has(m)) return; warned.add(m); console.warn(m); };

/**
 * One shot of the timeline as its own segment, `work/<i>.mp4`, or as pieces `work/<i>-<k>.mp4` when a long footage
 * shot is cut into a sequence; returns the files in order. `R` is the render's state across shots: `work` and
 * `brandDir` (where each computed shot's HTML goes for check-brand), the film's `words` with their times, the
 * Chromium page (`pg`, `show`, `shot` from openContext), the `missing` set of owner shots still slates, and
 * `lastChart`, so a chart that comes back keeps the rows it already showed (chart.mjs, held). `lastCard` is set here:
 * a quote card, or a page shot shown as its card, that starts on the frame the card before it ended is set on the
 * other ground, so two cards back to back read as two pictures (The Floor's Short, 2026-10-20). Sets `s.builtMs` on a
 * computed shot, for longHolds.
 */
export async function renderSegment(C, R, s, i) {
  const { W, H, SHORT } = C;
  const { work, brandDir, pg, show, shot } = R;
  // Cut points sit on the film's frame grid, so segment lengths add up exactly and the picture cannot drift from the voice.
  const frames = Math.max(1, Math.round(s.end * FPS) - Math.round(s.t * FPS));
  const d = frames / FPS;
  const out = path.join(work, `${String(i).padStart(3, '0')}.mp4`);
  const follows = R.lastCard && R.lastCard.f === Math.round(s.t * FPS) ? R.lastCard.ground : null;
  R.lastCard = null;
  const enc = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an', out];
  const f = OWNER.includes(s.tag.kind) ? footageFile(C, s.tag.id) : null;
  let land = null; // a chart's spoken point, when the build lands on it
  let pageNote = ''; // a page shot's label and where each highlighter landed, for the log
  if (f) {
    // B-roll cuts every four beats: a footage shot longer than six beats is cut into pieces of about 3.6 s,
    // each from a later moment of the same file, panning the other way. One clip becomes a sequence.
    const look = s.tag.kind === 'gag' || s.tag.raw ? 'eq=contrast=1.05' : GRADE;
    const n = s.tag.kind === 'footage' && d > 5.4 ? Math.round(d / 3.6) : 1;
    const len = f.len;
    // `-ss` past the end with `-stream_loop -1` wraps to the start without a word; say so. A file shorter than its
    // shot repeats, and its sub-cuts would all start at 0; say that too, and the sheet says it before the render.
    if (!f.still && len && f.inPoint >= len) { warnOnce(`episode: ${path.basename(f.file)} starts at ${f.inPoint} s but the file runs ${len.toFixed(1)} s; playing from its start`); f.inPoint = 0; }
    if (!f.still && s.tag.kind !== 'clip' && len && len - f.inPoint < d) warnOnce(`episode: ${path.basename(f.file)} has ${(len - f.inPoint).toFixed(1)} s from its in-point for a ${d.toFixed(1)} s shot, so it repeats`);
    // A portrait picture in a wide frame is pillarboxed on Void, not cropped to a sliver of its middle (a phone
    // video filled 29 percent of itself, found 2026-10-03). A wide picture in the Short is cropped, as before.
    const tall = f.h > f.w && W > H;
    const pieces = [];
    for (let k = 0; k < n; k++) {
      const dk = (Math.round(((k + 1) * frames) / n) - Math.round((k * frames) / n)) / FPS;
      const spread = Math.max(0, len - f.inPoint - dk);
      const from = f.inPoint + (n > 1 ? (spread * k) / (n - 1) : 0);
      const pan = (i + k) % 2 ? `(in_w-out_w)*t/${dk}` : `(in_w-out_w)*(1-t/${dk})`;
      const fit = tall ? `scale=-2:${H},pad=${W}:${H}:(ow-iw)/2:0:color=${VOID}` : `scale=${Math.round(W * 1.1)}:${Math.round(H * 1.1)}:force_original_aspect_ratio=increase,crop=${W}:${H}:x='${pan}':y='(in_h-out_h)/2'`;
      const piece = n === 1 ? out : out.replace(/\.mp4$/, `-${k}.mp4`);
      ff([...(f.still ? ['-loop', '1', '-framerate', String(FPS)] : ['-ss', String(from), '-stream_loop', '-1']), '-i', f.file, '-t', String(dk), '-vf',
        `${fit},${look},fps=${FPS},format=yuv420p`,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an', piece], s.tag.id);
      if (n > 1) pieces.push(piece);
    }
    if (n > 1) { process.stdout.write(`  ${String(i).padStart(3)} ${s.t.toFixed(2).padStart(7)} ${d.toFixed(2).padStart(6)}s ${s.tag.kind} ${s.tag.id} (${n} cuts)\n`); return pieces; }
  } else {
    if (OWNER.includes(s.tag.kind)) R.missing.add(s.tag.id);
    if (s.tag.kind === 'chart') {
      // The brief's row limits: five in 16:9, three in a Short (a flow's rows are its edges; a line's points are not rows).
      const cap = SHORT ? 3 : 5;
      if (s.tag.type !== 'line' && s.tag.rows.length > cap) console.warn(`episode: chart "${s.tag.title}" has ${s.tag.rows.length} rows; a ${SHORT ? 'Short reads three' : '16:9 frame reads five'} at most, so fold or split it`);
      land = chartLand(s, R.words, d);
    }
    const held = s.tag.kind === 'chart' && R.lastChart && R.lastChart.type === s.tag.type && ['bars', 'range'].includes(s.tag.type) ? R.lastChart.rows.map(rowKey) : [];
    if (s.tag.kind === 'chart') R.lastChart = s.tag;
    const h = await shotHtml(C, s, land ? land.ms : null, held, { d, words: R.words, work, ground: follows === VOID ? BOTTLE : VOID });
    if (!h.landMs) land = null;
    if (s.tag.kind === 'quote' || h.card) R.lastCard = { f: Math.round(s.end * FPS), ground: h.ground || VOID };
    // What check-brand reads: our own type only. A page shot's capture and a quote's words are someone else's.
    fs.writeFileSync(path.join(brandDir, `${i}.html`), h.brand ?? (s.tag.kind === 'quote' ? h.html.replace(/<div class="t">[\s\S]*?<\/div>/, '<div class="t"></div>') : h.html));
    await show({ id: `${i}`, html: h.html, live: h.live });
    const fdir = path.join(work, `f${i}`); fs.mkdirSync(fdir);
    // A build longer than the shot is compressed to finish inside 80 percent of it, so the point always lands on screen.
    // A chart landed on its word was already fitted inside the shot (chartLand), so it keeps the voice's own pace; the
    // same rule, against the whole shot, still guarantees the build ends before the cut.
    // A move that spans the whole shot (a page's push-in) is the shot's own length and is never compressed.
    const animMs = h.animMs || 900, pace = h.whole ? 1 : h.anim ? Math.max(1, animMs / ((h.landMs ? 1 : 0.8) * d * 1000)) : 1;
    s.builtMs = h.anim ? Math.min(animMs / pace, d * 1000) : 0; // the picture moves until here; longHolds counts the rest
    if (s.tag.kind === 'page') {
      const said = h.sweeps.map((x) => `"${x.text.slice(0, 40)}" at ${x.at} ms${x.word ? ` on "${x.word.w}" (${x.word.s.toFixed(2)} s)` : ', not spoken in the shot'}`).join('; ');
      const why = h.refused ? `refused (${h.refused.slice(0, 90)})` : h.card === 'wide' ? 'too wide to read whole at the frame\'s smallest type' : h.card === 'small' ? 'a sliver of its page at the frame\'s largest type' : h.card === 'unnamed' ? 'figures that cannot be shown with the head that names them' : 'with a picture on its words';
      pageNote = h.card ? `        page ${why}: the quote card, ${said}\n`
        : `        page "${h.label}": ${said}; zoom ${h.zoom.toFixed(2)}, type ${h.type.toFixed(0)} px${h.dark ? ', dark page' : ''}${h.flash ? ', Flash bar (the page\'s own Acid is in frame)' : ''}${h.masked ? `, ${h.masked} picture(s) covered` : ''}\n`;
    }
    const n = h.anim ? Math.min(Math.ceil((animMs / pace / 1000) * FPS) + 1, Math.ceil(d * FPS)) : 1;
    for (let k = 0; k < n; k++) {
      if (h.live) await pg.evaluate((ms) => window.__frame(ms), (k / FPS) * 1000 * pace);
      fs.writeFileSync(path.join(fdir, `${String(k).padStart(4, '0')}.png`), await shot());
    }
    ff(['-framerate', String(FPS), '-i', path.join(fdir, '%04d.png'), '-vf', `tpad=stop_mode=clone:stop_duration=${d},trim=duration=${d},format=yuv420p`, ...enc], `shot ${i}`);
  }
  process.stdout.write(`  ${String(i).padStart(3)} ${s.t.toFixed(2).padStart(7)} ${d.toFixed(2).padStart(6)}s ${s.tag.kind}${s.tag.id ? ' ' + s.tag.id : ''}${OWNER.includes(s.tag.kind) && !f ? ' (slate)' : ''}\n`);
  if (s.tag.kind === 'page' && pageNote) process.stdout.write(pageNote);
  if (s.tag.kind === 'chart') {
    const held = !land || Math.round(land.at) === land.ms ? '' : ` (spoken at ${Math.round(land.at)} ms; held ${land.at < land.ms ? 'to one beat in' : 'to half a beat before the cut'})`;
    process.stdout.write(land
      ? `        ${s.tag.type} "${s.tag.title}": lands on "${land.word.w}" at ${land.word.s.toFixed(2)} s, landMs ${land.ms}${held}\n`
      : `        ${s.tag.type} "${s.tag.title}": its point is not spoken in the shot; own timing\n`);
    if (!land && hotValues(s.tag.type, s.tag.rows).length) console.warn(`episode: chart "${s.tag.title}" lands its point on its own timing; no word in its shot says it`);
  }
  return [out];
}

/**
 * A pop as four transparent stills, `work/pop<j>-<k>.png`: three landing frames (the width axis at 0, 42 and 83 ms)
 * and the landed word, each with the film time it shows from and the time it gives way, on the 24 fps grid, for the
 * compose to overlay in turn. `o` is { t, end, tag, acid }, t already led ahead of its word by the caller.
 */
export async function renderPop(C, R, o, j) {
  const html = popHtml(C, o.tag, { acid: !!o.acid });
  fs.writeFileSync(path.join(R.brandDir, `pop${j}.html`), html);
  await R.show({ id: `pop${j}`, html, live: true });
  const f0 = Math.round(o.t * FPS), f1 = Math.max(f0 + 4, Math.round(o.end * FPS));
  const pieces = [];
  for (let k = 0; k < 4; k++) {
    await R.pg.evaluate((ms) => window.__frame(ms), (k / FPS) * 1000);
    const png = path.join(R.work, `pop${j}-${k}.png`);
    fs.writeFileSync(png, await R.shot({ omitBackground: true, type: 'png' }));
    pieces.push({ png, t: (f0 + k) / FPS, end: (k < 3 ? f0 + k + 1 : f1) / FPS });
  }
  return { ...o, pieces };
}

/** An overlay as one transparent still, `work/over<j>.png`, cut in and out on the word by the final mix. */
export async function renderOverlay(C, R, o, j) {
  const p = path.join(R.work, `over${j}.png`);
  const h = overHtml(C, o.tag);
  fs.writeFileSync(path.join(R.brandDir, `over${j}.html`), h);
  await R.show({ id: `over${j}`, html: h });
  fs.writeFileSync(p, await R.shot({ omitBackground: true, type: 'png' }));
  return { ...o, png: p };
}
