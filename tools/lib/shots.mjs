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
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { css, esc, FORMATS, ACID, MAL, BOTTLE, VOID, FLASH } from './film.mjs';
import { markPath } from '../../src/lib/rose.mjs';
import { SITE } from '../../src/config.mjs';
import { chartBody, chartCss, parseChart, hotValues, findSpoken, rowKey, numKey } from './chart.mjs';

export const FPS = 24;
export const KINDS = ['footage', 'gag', 'clip', 'quote', 'map', 'chart', 'fig', 'card', 'title', 'over'];
export const CUTS = KINDS.filter((k) => k !== 'over');
export const OWNER = ['footage', 'gag', 'clip']; // shots the owner supplies
// The grade that makes footage from six decades read as one film: most of the colour out, contrast up, pushed toward Void.
export const GRADE = 'hue=s=0.18,eq=contrast=1.22:brightness=-0.07:gamma=0.92,'
  + 'colorbalance=rs=-0.10:gs=0.03:bs=-0.08:rm=-0.07:gm=0.03:bm=-0.06:rh=-0.04:bh=-0.04,'
  + 'vignette=angle=PI/4.2,noise=alls=7:allf=t+u';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 5).join('-');

/**
 * The context every shot is built in. `S` is the parsed script (its meta and sources), `short` the tall frame for
 * the Shorts feed (1080x1920), `dir` the work directory whose footage/ folder holds the owner's files.
 */
export function shotContext({ S, short = false, dir }) {
  const F = short ? FORMATS.tall : FORMATS.wide, W = F.W, H = F.H, M = short ? 64 : 120;
  // Type sized to the frame: tall frames are narrower, and the bottom third of a Short sits under YouTube's own controls.
  const TY = short ? { quote: 62, stmt: 170, title: 190, end: 130, slate: 44, low: Math.round(H * 0.3) } : { quote: 84, stmt: 170, title: 200, end: 150, slate: 56, low: M + 150 };
  return { S, SHORT: short, F, W, H, M, TY, DIR: dir, FOOT: path.join(dir, 'footage') };
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

export function quoteHtml(C, tag) {
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
  const html = page(C, `<div class="q"><div class="src mono">${esc(src ? `${src.pub} · ${src.date}` : '')}</div><div class="t">“${inner}”</div><div class="by mono">${esc(tag.by)}</div></div>
<script>window.__frame=(ms)=>{const n=${n};document.querySelectorAll('.h').forEach((e)=>{e.classList.toggle('on',ms>=(+e.dataset.k/Math.max(1,n))*900)})};window.__frame(0);window.__ready=true;</script>`);
  return { html, anim: n > 0, live: true };
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

/** A computed shot's HTML by its kind; a footage, gag or clip shot with no file is the slate that names it. */
export async function shotHtml(C, s, landMs = null, held = []) {
  const k = s.tag.kind;
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
    const h = await shotHtml(C, s, land ? land.ms : null, held);
    if (!h.landMs) land = null;
    fs.writeFileSync(path.join(brandDir, `${i}.html`), s.tag.kind === 'quote' ? h.html.replace(/<div class="t">[\s\S]*?<\/div>/, '<div class="t"></div>') : h.html);
    await show({ id: `${i}`, html: h.html, live: h.live });
    const fdir = path.join(work, `f${i}`); fs.mkdirSync(fdir);
    // A build longer than the shot is compressed to finish inside 80 percent of it, so the point always lands on screen.
    // A chart landed on its word was already fitted inside the shot (chartLand), so it keeps the voice's own pace; the
    // same rule, against the whole shot, still guarantees the build ends before the cut.
    const animMs = h.animMs || 900, pace = h.anim ? Math.max(1, animMs / ((h.landMs ? 1 : 0.8) * d * 1000)) : 1;
    s.builtMs = h.anim ? Math.min(animMs / pace, d * 1000) : 0; // the picture moves until here; longHolds counts the rest
    const n = h.anim ? Math.min(Math.ceil((animMs / pace / 1000) * FPS) + 1, Math.ceil(d * FPS)) : 1;
    for (let k = 0; k < n; k++) {
      if (h.live) await pg.evaluate((ms) => window.__frame(ms), (k / FPS) * 1000 * pace);
      fs.writeFileSync(path.join(fdir, `${String(k).padStart(4, '0')}.png`), await shot());
    }
    ff(['-framerate', String(FPS), '-i', path.join(fdir, '%04d.png'), '-vf', `tpad=stop_mode=clone:stop_duration=${d},trim=duration=${d},format=yuv420p`, ...enc], `shot ${i}`);
  }
  process.stdout.write(`  ${String(i).padStart(3)} ${s.t.toFixed(2).padStart(7)} ${d.toFixed(2).padStart(6)}s ${s.tag.kind}${s.tag.id ? ' ' + s.tag.id : ''}${OWNER.includes(s.tag.kind) && !f ? ' (slate)' : ''}\n`);
  if (s.tag.kind === 'chart') {
    const held = !land || Math.round(land.at) === land.ms ? '' : ` (spoken at ${Math.round(land.at)} ms; held ${land.at < land.ms ? 'to one beat in' : 'to half a beat before the cut'})`;
    process.stdout.write(land
      ? `        ${s.tag.type} "${s.tag.title}": lands on "${land.word.w}" at ${land.word.s.toFixed(2)} s, landMs ${land.ms}${held}\n`
      : `        ${s.tag.type} "${s.tag.title}": its point is not spoken in the shot; own timing\n`);
    if (!land && hotValues(s.tag.type, s.tag.rows).length) console.warn(`episode: chart "${s.tag.title}" lands its point on its own timing; no word in its shot says it`);
  }
  return [out];
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
