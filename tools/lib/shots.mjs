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
 */
export function quoteHtml(C, tag, at = 0, sweeps = null) {
  if (sweeps) return quoteSweeps(C, tag, sweeps);
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
  const html = page(C, `<div class="q"><div class="src mono">${esc(src ? [src.pub, src.date].filter(Boolean).join(' · ') : '')}</div><div class="t">“${inner}”</div><div class="by mono">${esc(tag.by)}</div></div>
<script>window.__frame=(ms)=>{const n=${n};document.querySelectorAll('.h').forEach((e)=>{e.classList.toggle('on',ms>=${at ? `${Math.round(at)}+` : ''}(+e.dataset.k/Math.max(1,n))*900)})};window.__frame(0);window.__ready=true;</script>`);
  return { html, anim: n > 0, live: true };
}

function quoteSweeps(C, tag, sweeps) {
  const src = C.S.sources[tag.src];
  const W = sweeps.map((x) => x.text.replace(/—/g, ' – ').split(' '));
  const inner = W.map((words, p) => words.map((w, k) => `<span class="h" data-p="${p}" data-k="${k}">${esc(w)}${k < words.length - 1 ? ' ' : ''}</span>`).join('')).join(' … ');
  const T = sweeps.map((x, p) => [x.at, x.dur, W[p].length]);
  const html = page(C, `<div class="q"><div class="src mono">${esc(src ? [src.pub, src.date].filter(Boolean).join(' · ') : '')}</div><div class="t">“${inner}”</div><div class="by mono">${esc(tag.by || '')}</div></div>
<script>const T=${JSON.stringify(T)};window.__frame=(ms)=>{let cur=-1;T.forEach((t,p)=>{if(ms>=t[0])cur=p;});document.querySelectorAll('.h').forEach((e)=>{const p=+e.dataset.p,t=T[p];e.classList.toggle('on',p===cur&&ms>=t[0]+(+e.dataset.k/Math.max(1,t[2]))*t[1])})};window.__frame(0);window.__ready=true;</script>`);
  return { html, anim: true, live: true };
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
 * height, above YouTube's captions.
 */
const pageFrame = (C) => (C.SHORT
  ? { label: 228, x: C.M, y: 300, w: C.W - C.M - 120, h: Math.round(C.H * 0.75) - 300, minType: 30, maxType: 45, at: 0.36, size: 26 }
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
 * recorded (every line of text in view with its font size and block, the blocks as a tree with the borders they draw
 * and their list markers). The rules, each a defect the pilot's frames showed before it (2026-10-20):
 * - The window snaps to the block that holds the words: their paragraph or list item (with its marker), a block and
 *   the blocks beside it under one parent (a term and its definition), or a table cell's row, because a row's label
 *   is the cell's context. Its edges stand off the block by two ems of the words' type, never past half the gutter to
 *   the nearest text or picture of another block level with the window, and never across a border an enclosing box
 *   draws, so they never start or end inside a neighbour (a letter of The Floor's rail beside its parts table, the
 *   end of the card beside Morse Micro's MM6108, the edge of Geeky Gadgets' takeaways box). Text shown flush against
 *   a side gets the same margin where that cuts nothing new.
 * - The block is shown whole across, so no line of it is cut: the zoom is what fits it and its margins, with room
 *   for the push-in, between the frame's type limits (pageFrame), the ceiling read off the type most of the picture is
 *   set in. Text of another block level with the words that the window would still cut means the words' block sits
 *   in a wider one, which is tried instead. A block that cannot be read whole at the floor (a table row wider than the
 *   Short's panel, an abstract set across arXiv's page) gives way to the cells the words sit in, and, where those are
 *   still too wide, to the shot's quote card (`wide`): cutting its lines at both ends, as The Markup's ledger and the
 *   KAUST abstract were cut, shows a picture of type nobody can read whole. A picture under half the panel's width
 *   takes in up to three enclosing blocks while they read whole; still under a quarter, it is the card (`small`).
 * - Above and below, the window moves so the block shows whole where the words can stay between 6 and 75 percent of
 *   the panel (YouTube's captions cover the rest); text of another block that its edges would cut (the sources list's
 *   second column under its opening paragraph) is left out, and so is the rest of a paragraph or row whose start or
 *   end they leave out, and any line they would halve, allowing for the push-in, so every line shown is whole for the
 *   whole shot. The picture stops a margin past the last line it keeps, on the frame's Void.
 * - Pictures (spec 2.3, row 5: text only): on someone else's page every picture but inline SVG is already Void in the
 *   capture; one level with the words bounds the window like a neighbour's text, one above or below is left out like
 *   a cut line, any still in the window is covered, and one on the words themselves makes the shot its quote card
 *   (pageView). Our own pages (self) are ours, so nothing on them is covered.
 * Returns the window (x0, y0, its width cw at zoom k, its height ch), the part of it that is picture (`crop`, whole
 * lines only), the push-in's origin in panel px, the masks and the words' type in frame px; or `wide` or `small`; or
 * an error for a capture with no layout.
 */
function pageCrop(rec, phrases, P) {
  const L = rec.layout;
  if (!L || !Array.isArray(L.blocks) || !Array.isArray(L.lines)) return { error: 'the capture has no layout record (it predates 2026-10-20); capture it again' };
  const vw = rec.viewport.width, vh = rec.viewport.height, B = L.blocks;
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
  // A phrase's lines are the ones its boxes sit on, not one whose leading grazes them (a cover title's line box).
  const sits = (l, b) => l.x < b.x + b.w && l.x + l.w > b.x && Math.min(l.y + l.h, b.y + b.h) - Math.max(l.y, b.y) > 0.5 * Math.min(l.h, b.h);
  const own = phrases.map((h) => L.lines.filter((l) => h.boxes.some((b) => sits(l, b))));
  if (own.some((ls) => !ls.length)) return { error: 'the words are not on any line of the capture\'s layout; capture it again' };
  const words = new Set(own.flat());
  const U = hull(phrases.map((h) => h.union));
  // Every word must be readable, the small ones too: a row's label in 15 px and its value in 13 px mono read at 13.
  const fs = Math.min(...own.flat().map((l) => l.f)), pad = Math.max(24, 2 * fs), kRead = P.minType / fs;
  const photos = rec.self ? [] : (rec.media || []).filter((m) => m.kind !== 'svg');
  // The boxes the page draws that hold no text (a search field): a window edge never halves one either.
  const drawn = L.frames || [];
  // A line's group, for what is shown whole: its table row, or its own block.
  const group = (l) => { for (let j = l.b; j >= 0 && B[j].display !== 'table'; j = B[j].parent) if (B[j].display === 'table-row') return j; return l.b; };
  const wordGroups = new Set([...words].map(group));
  // Where the words sit: a table cell's row; a block with others beside it under one parent (a figure's caption and
  // its number, a definition and its term), that row of them; else the block itself.
  const start = (i) => {
    for (let j = i; j >= 0 && B[j].display !== 'table'; j = B[j].parent) if (B[j].display === 'table-row') return [j];
    const me = bbox(i), par = B[i].parent;
    const beside = B.map((b, j) => j).filter((j) => j !== i && B[j].parent === par && par >= 0).filter((j) => {
      const o = bbox(j), ov = Math.min(me.y + me.h, o.y + o.h) - Math.max(me.y, o.y);
      return o.w > 0 && ov > 0.25 * Math.min(me.h, o.h) && (o.x + o.w <= me.x + 1 || o.x >= me.x + me.w - 1);
    });
    return [i, ...beside];
  };
  // Narrower: of several blocks, those that hold the phrase's words; of one, its children that do (a row's cells, a
  // card's label and value), when they are narrower.
  const narrow = (ids, n) => {
    const holds = (j) => own[n].some((l) => inside(l.b, j));
    if (ids.length > 1) { const k = ids.filter(holds); return k.length && k.length < ids.length ? k : null; }
    const u = ids[0];
    const kids = [...new Set(own[n].map((l) => { let j = l.b; while (j >= 0 && B[j].parent !== u) j = B[j].parent; return j; }).filter((j) => j >= 0))];
    if (!kids.length) return null;
    if (hull(kids.map(kbox)).w < kbox(u).w - 1) return kids;
    return kids.length === 1 ? narrow(kids, n) : null;
  };

  const frame = (units) => {
    const ids = units.flat(), keep = hull(ids.map(kbox));
    if (!keep || keep.w <= 0) return { wide: true };
    // What may show is read in the tallest window the type allows, so a margin is never wider than the gutter.
    const reach = P.h / kRead, levelish = (b) => b.y < U.y + U.h + reach && b.y + b.h > U.y - reach;
    // The ceiling is read off the type the picture is mostly made of, not the words alone (a table's 11 px header
    // set at the ceiling put its 15 px rows at 52 px), leaving out display type (a figure's 44 px number, a cover).
    const wordsMax = Math.max(...own.flat().map((l) => l.f));
    const near = L.lines.filter((l) => l.x < keep.x + keep.w && l.x + l.w > keep.x && levelish(l) && l.f <= 2 * wordsMax).map((l) => l.f).sort((x, y) => x - y);
    const body = Math.max(wordsMax, near.length ? near[Math.floor(near.length / 2)] : fs);
    const foreign = L.lines.filter((l) => !ids.some((u) => inside(l.b, u)));
    const within = (b) => b.x >= keep.x - 1 && b.x + b.w <= keep.x + keep.w + 1 && b.y >= keep.y - 1 && b.y + b.h <= keep.y + keep.h + 1;
    const others = drawn.filter((b) => !within(b) && !(b.x <= U.x && b.x + b.w >= U.x + U.w && b.y <= U.y && b.y + b.h >= U.y + U.h));
    const gutter = (lv) => {
      const obs = [...foreign, ...photos, ...others].filter(lv);
      const right = Math.max(-Infinity, ...obs.filter((o) => o.x + o.w <= keep.x + 0.5).map((o) => o.x + o.w));
      const left = Math.min(Infinity, ...obs.filter((o) => o.x >= keep.x + keep.w - 0.5).map((o) => o.x));
      return [Number.isFinite(right) ? (right + keep.x) / 2 : 0, Number.isFinite(left) ? (keep.x + keep.w + left) / 2 : vw];
    };
    let [loX, hiX] = gutter(levelish);
    const mL = Math.max(0, Math.min(pad, keep.x - loX)), mR = Math.max(0, Math.min(pad, hiX - keep.x - keep.w));
    // The zoom that shows the block whole with its margins, still whole at the end of the push-in, every word
    // inside the panel's height, within the type limits; the margins give way first, then the block gives way.
    const kTall = P.h / ((1 + 3 * PUSH) * U.h);
    let k = Math.min(P.maxType / body, P.w / ((1 + PUSH) * keep.w + mL + mR), kTall);
    // Too tight for the margins at the floor: the floor, and what room is left is the margin.
    if (k < kRead) k = Math.min(P.maxType / body, P.w / ((1 + PUSH) * keep.w), kTall) >= kRead ? kRead : 0;
    if (k < kRead) return { wide: true };
    const ph = P.h / k, Wt = P.w / k, e = PUSH * ph;
    // Down: the words at `at` of the panel; moved, where the block fits, so all of it shows, but never so far that the
    // words leave the band between 6 and 75 percent of the panel (YouTube's captions cover the rest).
    let y0 = U.h > 0.8 * ph ? U.y - 0.1 * ph : U.y + U.h / 2 - P.at * ph;
    const lo = Math.max(keep.y + keep.h + e - ph, U.y + U.h - 0.75 * ph), hi = Math.min(keep.y - e, U.y - 0.06 * ph);
    if (lo <= hi) y0 = Math.max(lo, Math.min(hi, y0));
    y0 = Math.max(0, Math.min(y0, vh - ph));
    const level = (b) => b.y < y0 + ph && b.y + b.h > y0;
    // The margins are the block's own: read off what stands level with the block itself, not with the whole window,
    // whose height reached a table's header far below the words and squeezed the window to a sliver (Morse Micro's
    // release notes). Whatever else in the window its edges would cut is left out above or below (next).
    [loX, hiX] = gutter((b) => b.y < keep.y + keep.h + pad && b.y + b.h > keep.y - pad);
    let x0 = keep.x - Math.max(0, Math.min(mL, keep.x - loX)), x1 = keep.x + keep.w + Math.max(0, Math.min(mR, hiX - keep.x - keep.w));
    if (x1 - x0 > Wt) { const room = Math.max(0, Wt - keep.w), l = Math.min(keep.x - x0, room / 2); x0 = keep.x - l; x1 = Math.min(x1, keep.x + keep.w + room - l); }
    // A margin never crosses a rule an enclosing box draws (a card's border, a rail): a sliver of its edge beside the
    // words read as a stray mark (Geeky Gadgets' takeaways box). The window stays inside the box's border.
    let inL = -Infinity, inR = Infinity;
    for (const u of ids) for (let a = B[u].parent; a >= 0; a = B[a].parent) {
      const bd = B[a].bd || [0, 0, 0, 0];
      if (bd[3] > 0 && B[a].x <= keep.x + 0.5) inL = Math.max(inL, B[a].x + bd[3]);
      if (bd[1] > 0 && B[a].x + B[a].w >= keep.x + keep.w - 0.5) inR = Math.min(inR, B[a].x + B[a].w - bd[1]);
    }
    x0 = Math.max(x0, Math.min(keep.x, inL)); x1 = Math.min(x1, Math.max(keep.x + keep.w, inR));
    // Room the block does not fill stays the frame's Void, never more of the page: grown into, it showed a
    // neighbour's rule at the edge.
    const straddles = (l) => (l.x < x0 - 0.5 && l.x + l.w > x0 + 0.5) || (l.x < x1 - 0.5 && l.x + l.w > x1 + 0.5);
    // Text above or below that the edges would cut is taken in whole, with its margin, where the window has the room
    // and that stays inside the gutters and the box: the rows of The Markup's ledger column around its 43.3 cell, which
    // the cell's own width left out. What cannot be taken in is left out below.
    for (let more = true, n = 0; more && n < 12; n++) {
      more = false;
      for (const l of foreign.filter((q) => level(q) && straddles(q))) {
        const a = Math.min(x0, Math.max(l.x - pad, loX, inL)), b = Math.max(x1, Math.min(l.x + l.w + pad, hiX, inR));
        if (a <= l.x + 0.5 && b >= l.x + l.w - 0.5 && b - a <= Wt) { x0 = a; x1 = b; more = true; break; }
      }
    }
    // Level with the words means sharing their line, not a line box's leading: a cover title's descent overlapped
    // The Markup's lede by 2 px.
    const atWords = (b) => [...words].some((w) => Math.min(b.y + b.h, w.y + w.h) - Math.max(b.y, w.y) > 0.3 * Math.min(b.h, w.h));
    // Text beside the block that the edges would still cut, and that lies wholly to one side of the block, moves the
    // edge in to halfway between the two, where nothing the window keeps is cut by it: the margins stop at the
    // gutter of the rows above and below too (the ledger's middle column, which runs further right in other rows).
    for (let more = true, n = 0; more && n < 12; n++) {
      more = false;
      const kept = (a, b) => L.lines.filter((q) => level(q) && q.x >= a - 0.5 && q.x + q.w <= b + 0.5);
      for (const l of foreign.filter((q) => level(q) && straddles(q))) {
        if (l.x + l.w <= keep.x + 0.5) {
          const a = (l.x + l.w + keep.x) / 2;
          if (a > x0 && !kept(x0, x1).some((q) => q.x < a - 0.5)) { x0 = a; more = true; break; }
        } else if (l.x >= keep.x + keep.w - 0.5) {
          const b = (keep.x + keep.w + l.x) / 2;
          if (b < x1 && !kept(x0, x1).some((q) => q.x + q.w > b + 0.5)) { x1 = b; more = true; break; }
        }
      }
    }
    // A neighbour inside a box the page draws (a card's border, an input's frame) whose box an edge would cut is left
    // out with its text: its words whole and its frame halved read as a stray mark (the release notes' search box).
    const wordsAnc = new Set();
    for (const u of ids) for (let j = u; j >= 0; j = B[j].parent) wordsAnc.add(j);
    // A frame is a border on three sides or four; a single rule (a heading's underline, a grid row's top line) and a
    // table's own grid are not, and run to the edge as the words' own rows do.
    const boxed = (j) => !/^table/.test(B[j].display) && (B[j].bd || []).filter((v) => v > 0).length >= 3;
    const framed = (l) => { for (let j = l.b; j >= 0 && !wordsAnc.has(j); j = B[j].parent) if (boxed(j)) return bbox(j); return null; };
    const boxCut = (l, a, b) => { const f = framed(l); return !!f && (f.x < a - 1 || f.x + f.w > b + 1); };
    const cut = foreign.filter((l) => level(l) && (straddles(l) || (l.x < x1 && l.x + l.w > x0 && boxCut(l, x0, x1))));
    if (cut.some(atWords)) return { level: true };
    const shownPhotos = [...photos, ...others].filter((m) => m.x < x1 && m.x + m.w > x0 && level(m));
    // A neighbour left out because its frame is cut is left out frame and all: the picture stops at the frame's edge.
    const out = [...cut.map((l) => (straddles(l) ? l : framed(l) || l)), ...shownPhotos.filter((m) => !atWords(m))];
    const mid = U.y + U.h / 2;
    let top = Math.max(y0, ...out.filter((o) => o.y + o.h / 2 < mid).map((o) => Math.min(o.y + o.h, U.y)));
    let bot = Math.min(y0 + ph, ...out.filter((o) => o.y + o.h / 2 >= mid).map((o) => Math.max(o.y, U.y + U.h)));
    // The push-in grows the picture about the words; a line it would carry past the panel's top or bottom is left out.
    const oy = U.y + U.h / 2;
    top = Math.max(top, Math.min(U.y, oy - (oy - y0) / (1 + PUSH)));
    bot = Math.min(bot, Math.max(U.y + U.h, oy + (y0 + ph - oy) / (1 + PUSH)));
    // Whole lines only, and whole blocks of others: a line the edge would halve is left out, and so is the rest of a
    // paragraph or table row whose start or end the edge leaves out ("everyone." alone above The Markup's 43.3 cell).
    const lines = L.lines.filter((l) => l.x < x1 && l.x + l.w > x0);
    const byGroup = new Map();
    for (const l of lines) { const g = group(l); if (!byGroup.has(g)) byGroup.set(g, []); byGroup.get(g).push(l); }
    const t0 = top, b0 = bot;
    for (let moved = true; moved;) {
      moved = false;
      // Never into the words: a cover title's line box ran 2 px into The Markup's lede.
      for (const l of lines) {
        if (l.y < top - 0.5 && l.y + l.h > top + 0.5) { const t = Math.min(l.y + l.h, U.y); if (t > top + 0.01) { top = t; moved = true; } }
        if (l.y < bot - 0.5 && l.y + l.h > bot + 0.5) { const t = Math.max(l.y, U.y + U.h); if (t < bot - 0.01) { bot = t; moved = true; } }
      }
      for (const l of lines) {
        if (l.y < top - 0.5 || l.y + l.h > bot + 0.5 || ids.some((u) => inside(l.b, u))) continue;
        const f = framed(l);
        if (!f || (f.y >= top - 1 && f.y + f.h <= bot + 1)) continue;
        if (l.y + l.h / 2 < U.y + U.h / 2) { const t = Math.min(Math.max(l.y + l.h, f.y + f.h), U.y); if (t > top + 0.01) { top = t; moved = true; } }
        else { const t = Math.max(Math.min(l.y, f.y), U.y + U.h); if (t < bot - 0.01) { bot = t; moved = true; } }
      }
      for (const [g, ls] of byGroup) {
        if (wordGroups.has(g)) continue;
        const inn = ls.filter((l) => l.y >= top - 0.5 && l.y + l.h <= bot + 0.5);
        if (!inn.length || inn.length === ls.length) continue;
        if (ls.some((l) => l.y + l.h <= top + 0.5)) { const t = Math.max(...inn.map((l) => l.y + l.h)); if (t > top && t <= U.y + 0.5) { top = t; moved = true; } }
        if (ls.some((l) => l.y >= bot - 0.5)) { const t = Math.min(...inn.map((l) => l.y)); if (t < bot && t >= U.y + U.h - 0.5) { bot = t; moved = true; } }
      }
    }
    // Half the space to the next line, at most the margin, so the picture does not stop flush on a line.
    // Never into the words' own boxes, which run past their lines where a phrase spans table cells (a Range's
    // rectangles include each cell it wholly holds).
    if (top > t0 + 0.5 || top > y0 + 0.5) { const next = Math.min(bot, ...lines.filter((l) => l.y >= top - 0.5).map((l) => l.y)); top = Math.min(U.y, top + Math.min(pad, Math.max(0, next - top) / 2)); }
    if (bot < b0 - 0.5 || bot < y0 + ph - 0.5) { const prev = Math.max(top, ...lines.filter((l) => l.y + l.h <= bot + 0.5).map((l) => l.y + l.h)); bot = Math.max(U.y + U.h, bot - Math.min(pad, Math.max(0, bot - prev) / 2)); }
    // And no more than a margin of empty page above and below the lines shown: a field's padding or a box's edge
    // there is a sliver of something else (the top of The Floor's bench field over its chart).
    const held = hull(lines.filter((l) => l.y >= top - 0.5 && l.y + l.h <= bot + 0.5));
    if (held) { top = Math.min(U.y, Math.max(top, held.y - pad)); bot = Math.max(U.y + U.h, Math.min(bot, held.y + held.h + pad)); }
    // Text shown flush against a side (a paragraph above the words that starts where the margin ends) gets its
    // margin too, where the gutter, the box and the panel allow and the wider window cuts nothing new.
    if (held) {
      const band = (b) => b.y < bot - 0.5 && b.y + b.h > top + 0.5;
      const [gl, gr] = gutter(band);
      const clean = (a, b) => !L.lines.some((l) => band(l) && l.x < b && l.x + l.w > a && (l.y < top - 0.5 || l.y + l.h > bot + 0.5 || l.x < a - 0.5 || l.x + l.w > b + 0.5))
        && ![...photos, ...others].some((m) => band(m) && m.x < b && m.x + m.w > a);
      const a0 = Math.max(held.x - pad, gl, Math.min(keep.x, inL), x1 - Wt);
      if (held.x - x0 < pad / 2 && a0 < x0 && clean(a0, x0)) x0 = a0;
      const b1 = Math.min(held.x + held.w + pad, gr, Math.max(keep.x + keep.w, inR), x0 + Wt);
      if (x1 - (held.x + held.w) < pad / 2 && b1 > x1 && clean(x1, b1)) x1 = b1;
    }
    // The words themselves are always whole; a window that cannot keep them so is not a window for them.
    if (bot - top < 1 || top > U.y + 0.5 || bot < U.y + U.h - 0.5) return { wide: true };
    // Across, the push-in grows from where the words start (the eye reads from there), held so that everything shown
    // stays whole in the panel to the last frame; the block itself if not everything can.
    // Read off the lines themselves, not the block's box, whose empty right half once pushed a table's first column
    // out of the left of the panel (Morse Micro's release notes).
    const s = 1 + PUSH, pr = x0 + Wt;
    const span = (c) => (c ? [(s * (c.x + c.w) - pr) / PUSH, (s * c.x - x0) / PUSH] : [-Infinity, Infinity]);
    const shown = lines.filter((l) => l.y >= top - 0.5 && l.y + l.h <= bot + 0.5);
    let [oxLo, oxHi] = span(hull(shown));
    if (oxLo > oxHi) [oxLo, oxHi] = span(hull(shown.filter((l) => ids.some((u) => inside(l.b, u)))));
    if (oxLo > oxHi) [oxLo, oxHi] = span(hull([...words]));
    const ox = Math.max(oxLo, Math.min(oxHi, U.x));
    const crop = { x: x0, y: top, w: x1 - x0, h: bot - top };
    const masks = photos.filter((m) => meets(m, crop)).map((m) => ({ x: (m.x - x0) * k, y: (m.y - y0) * k, w: m.w * k, h: m.h * k }));
    const touches = photos.filter((m) => phrases.some((h) => meets(m, h.union))).length;
    return { ok: true, x0, y0, k, cw: Wt, ch: ph, crop, ox: (ox - x0) * k, oy: (oy - y0) * k, masks, touches, keep, type: fs * k };
  };

  let units = phrases.map((h, n) => start(h.blk ?? own[n][0].b));
  for (let tries = 0; tries < 8; tries++) {
    const r = frame(units);
    if (r.ok) {
      // A picture under half the panel's width (a price box on a product page) is shown with the blocks around it,
      // up to three levels out, where those can be read whole too; one still under a quarter of the panel is a
      // sliver of a page, and the shot is its quote card (`small`).
      const across = (x) => x.crop.w * x.k;
      let best = r, cur = units;
      for (let lv = 0; lv < 3 && across(best) < 0.45 * P.w; lv++) {
        const up = cur.map((ids) => B[ids[0]].parent);
        if (up.some((u) => u < 0 || B[u].tag === 'body')) break;
        cur = up.map((u) => start(u));
        const w = frame(cur);
        if (w.ok && across(w) > across(best)) best = w;
      }
      return across(best) < 0.25 * P.w ? { small: true } : best;
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
  const phrases = (rec.hl || []).filter((h) => h.found && h.union && h.boxes && h.boxes.length);
  if (phrases.length < shot.hl.length) return { error: `${shot.hl.length - phrases.length} phrase(s) not boxed in the capture` };
  const P = pageFrame(C), crop = pageCrop(rec, phrases, P);
  if (crop.error) return { error: crop.error };
  if (crop.wide || crop.small) return { card: crop.wide ? 'wide' : 'small', P, phrases };
  return { card: crop.touches ? 'picture' : null, P, crop, phrases };
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
 * The label's type. One line at the frame's size where it fits; a long one (an author, an office and its
 * department) a little smaller; longer still, two lines growing up from the same place, so it never runs past the
 * panel into the Short's buttons. Martian Mono at the label's width and tracking advances 0.748 to 0.755 em a
 * character (measured in Chromium, 2026-10-20), so a line's width is known before a frame; 0.76 errs wide.
 */
function labelType(P, text) {
  const em = 0.76, n = Math.max(1, text.length);
  if (n * em * P.size <= P.w) return { size: P.size, lines: 1 };
  const one = Math.floor(P.w / (n * em));
  if (one >= Math.round(0.85 * P.size)) return { size: one, lines: 1 };
  return { size: Math.min(P.size, Math.floor((1.8 * P.w) / (n * em))), lines: 2 };
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
 * light page the box multiplies, a highlighter; on a dark one (ours) it is a bar with the words inverted into it, so
 * both read as dark type on Acid, and Flash where our page's own Acid is in frame. A capture that was refused (a
 * wall, robots.txt, YouTube) becomes the quote card with the same words, so the cut always renders and nothing is
 * routed around; so does one whose crop would keep a picture on the words, or whose words' block cannot be read whole
 * at the frame's smallest type (pageView). The label names the author where the capture or the cut list gives one
 * (pageSource). `d` is the shot's length, `words` the film's, timed; `work` takes the cropped PNG.
 */
export async function pageHtml(C, s, { d, words = [], work }) {
  const { shot, rec } = pageRecord(C, s.tag);
  const ps = pageSource(C, rec);
  const v = pageView(C, rec, shot);
  if (v.card) {
    // The edition's own source line says when it was read; the wall's title says nothing about the source.
    // Every phrase is swept on its word, as the page would have swept it; a refused page's card never had more.
    const plans = sweepPlan(shot.hl, s, d, words);
    const qC = { ...C, S: { ...C.S, sources: { page: { pub: pageCredit(ps), date: ps.date } } } };
    const h = quoteHtml(qC, { src: 'page', text: shot.hl.join(' … '), hl: shot.hl[0], by: '' }, plans[0].at, shot.hl.length > 1 ? plans : null);
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
  const boxes = phrases.map((h) => lines(h.boxes).map((b) => {
    const padX = 0.14 * b.h * c.k, padY = 0.08 * b.h * c.k;
    return { x: (b.x - c.x0) * c.k - padX, y: (b.y - c.y0) * c.k - padY, w: b.w * c.k + 2 * padX, h: b.h * c.k + 2 * padY };
  }));
  // The push-in grows from where the words start: the eye reads from there, and a move about their middle took the
  // first letters of every line off the left when the words sat far right (arXiv, 2026-10-20). pageCrop holds it
  // where every line shown stays whole to the last frame.
  const { ox, oy } = c;
  const plan = sweepPlan(phrases.map((h) => h.text), s, d, words);
  const label = `${pageCredit(ps)} · ${ps.date}`.replace(/—/g, ' – ');
  const lt = labelType(P, label), lh = Math.round(1.3 * lt.size);
  const f = (v) => v.toFixed(1);
  const hl = boxes.map((bs, p) => bs.map((b) => `<div class="hl" data-p="${p}" style="left:${f(b.x)}px;top:${f(b.y)}px;height:${f(b.h)}px;width:0">${dark ? `<span style="left:${f(pic.x - b.x)}px;top:${f(pic.y - b.y)}px"></span>` : ''}</div>`).join('')).join('');
  const masks = c.masks.map((m) => `<div class="mask" style="left:${f(m.x)}px;top:${f(m.y)}px;width:${f(m.w)}px;height:${f(m.h)}px"></div>`).join('');
  const data = `url(data:image/png;base64,${fs.readFileSync(crop).toString('base64')})`;
  const extra = `.lab{position:absolute;left:${P.x}px;top:${P.label - (lt.lines - 1) * lh}px;font-size:${lt.size}px;color:${MAL};${lt.lines > 1 ? `width:${P.w}px;line-height:${lh}px` : 'white-space:nowrap'}}
.panel{position:absolute;left:${P.x}px;top:${P.y}px;width:${P.w}px;height:${P.h}px;overflow:hidden;background:${VOID}}
.doc{position:absolute;left:0;top:0;width:${P.w}px;height:${P.h}px;transform-origin:${f(ox)}px ${f(oy)}px;--pg:${data}}
.pg{position:absolute;left:${f(pic.x)}px;top:${f(pic.y)}px;width:${f(pic.w)}px;height:${f(pic.h)}px;background:var(--pg) 0 0/100% 100% no-repeat}
.mask{position:absolute;background:${VOID}}
.hl{position:absolute;overflow:hidden;background:${bar}${dark ? '' : ';mix-blend-mode:multiply'}}
.hl span{position:absolute;width:${f(pic.w)}px;height:${f(pic.h)}px;background:var(--pg) 0 0/100% 100% no-repeat;filter:grayscale(1) invert(1);mix-blend-mode:multiply}`;
  const html = page(C, `<div class="lab mono">${esc(label)}</div><div class="panel"><div class="doc" id="doc"><div class="pg"></div>${masks}${hl}</div></div>
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
  if (k === 'quote') return quoteHtml(C, s.tag);
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
 * `lastChart`, so a chart that comes back keeps the rows it already showed (chart.mjs, held). Sets `s.builtMs` on a
 * computed shot, for longHolds.
 */
export async function renderSegment(C, R, s, i) {
  const { W, H, SHORT } = C;
  const { work, brandDir, pg, show, shot } = R;
  // Cut points sit on the film's frame grid, so segment lengths add up exactly and the picture cannot drift from the voice.
  const frames = Math.max(1, Math.round(s.end * FPS) - Math.round(s.t * FPS));
  const d = frames / FPS;
  const out = path.join(work, `${String(i).padStart(3, '0')}.mp4`);
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
    const h = await shotHtml(C, s, land ? land.ms : null, held, { d, words: R.words, work });
    if (!h.landMs) land = null;
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
      const why = h.refused ? `refused (${h.refused.slice(0, 90)})` : h.card === 'wide' ? 'too wide to read whole at the frame\'s smallest type' : h.card === 'small' ? 'a sliver of its page at the frame\'s largest type' : 'with a picture on its words';
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
