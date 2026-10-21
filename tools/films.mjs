#!/usr/bin/env node
/**
 * The films the site links, written from the releases (CLAUDE.md, Decisions
 * log, 21 Oct 2026). Each published edition whose current film is public
 * gets a block link to the film's watch page with the film's own thumbnail,
 * served from this origin; src/lib/films.json says which, and this writes it.
 *
 *   node tools/films.mjs <video id> [...]   link these films (each one public: the caller says so)
 *   node tools/films.mjs --drop <slug> [...] take an edition's film off the site
 *   node tools/films.mjs --check            check src/lib/films.json and public/film/ (the build runs this)
 *
 * What is public cannot be read from here without the channel's secrets, so
 * it is the input: the morning a film publishes, one command with its id and
 * a commit. Each id is matched to its edition by the ledger the uploader
 * files on the release film-<slug> (youtube.json), so only the CURRENT film
 * of a published edition can be linked: an earlier cut, a Short or a video
 * that is not ours names no ledger and is refused. The length and the
 * thumbnail's file name come from that release's meta.json, the thumbnail is
 * that release's asset, and its alt text names what the render put on it
 * (the first headline figure, or the acid word, read from script.json by the
 * rule tools/generate-film.mjs uses), checked against the thumbnail's own
 * ground colour.
 *
 * The thumbnail is reduced to the size it is shown at, and twice that for a
 * dense screen, by an area average in linear light, encoded here with no
 * library, and content-hashed like the OG cards. An entry whose id, length,
 * source bytes and size have not changed keeps its files, so a run for a new
 * film never re-encodes the others. Files under public/film that no entry links
 * are removed. Release assets of this public repository download without a
 * token; nothing here calls YouTube.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { PUBLISHED } from '../src/lib/editions.mjs';
import { films as linked, problems, readFilms, clock, watchUrl, FILMS_FILE as FILE, FILMS_DIR as DIR } from '../src/lib/films.mjs';

const REPO = 'cherishwins/aedificare';
/**
 * Shown at 112 by 63. Every thumbnail so far sets one word or figure in Acid
 * at most about 0.22 of its height tall (1,200 with its comma's tail); at 63
 * px that is 14 px of ink, under the 16 px capital of 24 px type, which is
 * where tools/verify.cjs starts counting Acid "at scale". At 128 by 72 the
 * comma took 1,200 to 16 px, level with the capital, so the size came down.
 * The thumbnail spends no Acid on the surface it sits on, and the sweep
 * measures that on every build rather than trusting this note.
 */
const SIZE = { width: 112, height: 63 };

const argv = process.argv.slice(2);
const usage = () => { console.error('films: node tools/films.mjs <video id> [...] | --drop <slug> [...] | --check'); process.exit(1); };
if (!argv.length) usage();

/* ---- --check: what the build runs ------------------------------------------- */
if (argv[0] === '--check') {
  try {
    const all = linked();
    console.log(`check-films: ${all.length} film(s) linked (${all.map((f) => f.slug).join(', ') || 'none'}), every thumbnail present, its size and its hash`);
    process.exit(0);
  } catch (err) { console.error(err.message); process.exit(1); }
}

const films = readFilms();

/* ---- --drop ----------------------------------------------------------------- */
let dropped = 0;
if (argv[0] === '--drop') {
  for (const slug of argv.slice(1)) {
    if (!films[slug]) { console.error(`films: ${slug} has no film linked`); process.exit(1); }
    delete films[slug];
    dropped++;
    console.log(`  ${slug}: film taken off the site`);
  }
  if (!dropped) usage();
} else {
  /* ---- link: match each id to the ledger that names it ---------------------- */
  const ids = argv;
  for (const id of ids) if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { console.error(`films: ${id} is not an eleven-character YouTube id`); process.exit(1); }
  const url = (slug, name) => `https://github.com/${REPO}/releases/download/film-${slug}/${name}`;
  const get = (u) => {
    try { return execFileSync('curl', ['-sSLf', '--retry', '2', u], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (err) { if (err.status === 22) return null; throw new Error(`films: could not fetch ${u}: ${String(err.stderr || err.message).trim()}`); }
  };
  const json = (u) => { const b = get(u); return b ? JSON.parse(b.toString('utf8')) : null; };

  const ledgers = new Map();
  for (const e of PUBLISHED) {
    const l = json(url(e.slug, 'youtube.json'));
    if (l?.id) ledgers.set(l.id, e);
  }
  for (const id of ids) {
    const e = ledgers.get(id);
    if (!e) { console.error(`films: ${id} is not the film any published edition's release files in its youtube.json; an earlier cut, a Short or another channel's video gets no link`); process.exit(1); }
    const meta = json(url(e.slug, 'meta.json'));
    if (!meta || meta.kind !== 'film' || meta.slug !== e.slug) { console.error(`films: film-${e.slug}/meta.json is missing or not this edition's film`); process.exit(1); }
    if (!Number.isInteger(meta.duration) || meta.duration <= 0) { console.error(`films: film-${e.slug}/meta.json has no duration`); process.exit(1); }
    if (!new RegExp(`^${e.slug}-thumb-\\d+x\\d+\\.png$`).test(meta.thumbnail ?? '')) { console.error(`films: film-${e.slug}/meta.json names no thumbnail of its own (${meta.thumbnail})`); process.exit(1); }
    const src = get(url(e.slug, meta.thumbnail));
    if (!src) { console.error(`films: film-${e.slug}/${meta.thumbnail} is not on the release`); process.exit(1); }
    const sha256 = crypto.createHash('sha256').update(src).digest('hex');
    const old = films[e.slug];
    if (old && old.id === id && old.duration === meta.duration && old.thumb?.source?.sha256 === sha256 && old.thumb.width === SIZE.width && old.thumb.height === SIZE.height && !problems({ [e.slug]: old }).some((p) => !/is linked by no entry/.test(p))) {
      console.log(`  ${e.slug}: ${id}, unchanged`);
      continue;
    }
    const img = decodePng(src);
    if (img.width * SIZE.height !== img.height * SIZE.width) { console.error(`films: ${meta.thumbnail} is ${img.width}x${img.height}, not 16:9`); process.exit(1); }
    const script = json(url(e.slug, 'script.json'));
    if (!script?.blocks) { console.error(`films: film-${e.slug}/script.json is missing`); process.exit(1); }
    const alt = altText(e, script, img);
    fs.mkdirSync(DIR, { recursive: true });
    const write = (scale) => {
      const w = SIZE.width * scale, h = SIZE.height * scale;
      const bytes = encodePng(w, h, resample(img, w, h));
      const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
      const name = `${e.slug}${scale > 1 ? `-${scale}x` : ''}.${hash}.png`;
      fs.writeFileSync(path.join(DIR, name), bytes);
      console.log(`  ${path.join(DIR, name)}`.padEnd(48) + `${w}x${h}  ${bytes.length} B`);
      return `/film/${name}`;
    };
    films[e.slug] = {
      id, duration: meta.duration,
      thumb: { src: write(1), src2x: write(2), width: SIZE.width, height: SIZE.height, alt,
        source: { release: `film-${e.slug}`, asset: meta.thumbnail, sha256 } },
    };
    console.log(`  ${e.slug}: ${watchUrl(id)}  ${clock(meta.duration)}  "${alt}"`);
  }
}

/* ---- write: the editions' order, then drop what nothing links --------------- */
const ordered = {};
for (const e of PUBLISHED) if (films[e.slug]) ordered[e.slug] = films[e.slug];
for (const slug of Object.keys(films)) if (!ordered[slug]) ordered[slug] = films[slug]; // a draft's entry stays, for the check to name
fs.writeFileSync(FILE, JSON.stringify(ordered, null, 2) + '\n');
const keep = new Set(Object.values(ordered).flatMap((f) => [f.thumb?.src, f.thumb?.src2x]).filter(Boolean).map((s) => path.basename(s)));
if (fs.existsSync(DIR)) for (const f of fs.readdirSync(DIR)) if (!keep.has(f)) { fs.unlinkSync(path.join(DIR, f)); console.log(`  removed ${path.join(DIR, f)}`); }
const bad = problems(ordered);
if (bad.length) { console.error(`films: ${FILE} written, and it does not hold:\n  ${bad.join('\n  ')}`); process.exit(1); }
console.log(`  ${FILE}: ${Object.keys(ordered).length} film(s)`);

/* ---- what the thumbnail shows ----------------------------------------------- */
/**
 * tools/generate-film.mjs sets the thumbnail from the first section heading
 * followed straight by a figure (the headline, on that section's ground), or
 * else from the acid word of the title, on Void. The ground is then read from
 * the thumbnail's own corner, so a script that disagrees with the picture is
 * refused rather than described wrongly.
 */
function altText(e, script, img) {
  const b = script.blocks;
  let shows = { text: e.acid.toUpperCase(), ground: 'void' };
  for (let i = 0; i < b.length - 1; i++) {
    if ((b[i].kind === 'h2' || b[i].kind === 'h3') && b[i + 1].kind === 'figure') { shows = { text: String(b[i + 1].text), ground: b[i].ground }; break; }
  }
  const GROUNDS = { void: [5, 10, 6], bottle: [6, 59, 34], flash: [255, 255, 255] };
  const px = [img.data[0], img.data[1], img.data[2]];
  const seen = Object.entries(GROUNDS).find(([, c]) => c.every((v, k) => Math.abs(v - px[k]) <= 3))?.[0];
  if (seen !== shows.ground) { console.error(`films: ${e.slug}'s script puts ${shows.text} on ${shows.ground}, but its thumbnail's ground reads rgb(${px.join(', ')})`); process.exit(1); }
  return `Thumbnail: ${shows.text} in acid green on ${{ void: 'black', bottle: 'dark green', flash: 'white' }[shows.ground]}`;
}

/* ---- PNG, by hand: 8-bit RGB in, 8-bit RGB out ------------------------------ */
function decodePng(buf) {
  if (buf.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('films: the thumbnail is not a PNG');
  let off = 8, ihdr = null;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('latin1', off + 4, off + 8), data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') ihdr = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), depth: data[8], color: data[9], interlace: data[12] };
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!ihdr || ihdr.depth !== 8 || ihdr.color !== 2 || ihdr.interlace) throw new Error('films: the thumbnail is not an 8-bit RGB PNG without interlace, which is what the film renders write');
  const { width, height } = ihdr, stride = width * 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const data = Buffer.alloc(width * height * 3);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)];
    const cur = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= 3 ? cur[i - 3] : 0, up = prev[i], c = i >= 3 ? prev[i - 3] : 0;
      let p = 0;
      if (ft === 1) p = a;
      else if (ft === 2) p = up;
      else if (ft === 3) p = (a + up) >> 1;
      else if (ft === 4) { const q = a + up - c, pa = Math.abs(q - a), pb = Math.abs(q - up), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      else if (ft !== 0) throw new Error(`films: PNG filter ${ft} on row ${y}`);
      cur[i] = (cur[i] + p) & 255;
    }
    cur.copy(data, y * stride);
    prev = cur;
  }
  return { width, height, data };
}

// Function declarations, not constants: the main code above runs before a constant down here would exist.
function crc32(buf) {
  const CRC = (crc32.table ??= new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; }));
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const head = Buffer.alloc(8); head.writeUInt32BE(data.length, 0); head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}
function encodePng(width, height, rgb) {
  const stride = width * 3, raw = Buffer.alloc(height * (stride + 1));
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const cur = rgb.subarray(y * stride, (y + 1) * stride);
    // Each row takes the filter whose output sums smallest, the usual heuristic: fixed, so the bytes are too.
    let best = null, bestSum = Infinity;
    for (let ft = 0; ft < 5; ft++) {
      const row = Buffer.alloc(stride + 1); row[0] = ft;
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= 3 ? cur[i - 3] : 0, up = prev[i], c = i >= 3 ? prev[i - 3] : 0;
        let p = 0;
        if (ft === 1) p = a; else if (ft === 2) p = up; else if (ft === 3) p = (a + up) >> 1;
        else if (ft === 4) { const q = a + up - c, pa = Math.abs(q - a), pb = Math.abs(q - up), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
        const v = (cur[i] - p) & 255;
        row[i + 1] = v; sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { best = row; bestSum = sum; }
    }
    best.copy(raw, y * (stride + 1));
    prev = cur;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Area average in linear light: every source pixel counts by the share of it each target pixel covers. */
function resample({ width: sw, height: sh, data }, tw, th) {
  const toLin = new Float64Array(256).map((_, v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  const toByte = (l) => { const c = l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(c * 255))); };
  const weights = (s, t) => Array.from({ length: t }, (_, i) => {
    const a = (i * s) / t, b = ((i + 1) * s) / t, w = [];
    for (let j = Math.floor(a); j < Math.min(s, Math.ceil(b)); j++) w.push([j, (Math.min(b, j + 1) - Math.max(a, j)) / (b - a)]);
    return w;
  });
  const wx = weights(sw, tw), wy = weights(sh, th);
  const mid = new Float64Array(tw * sh * 3);
  for (let y = 0; y < sh; y++) for (let x = 0; x < tw; x++) for (let k = 0; k < 3; k++) {
    let s = 0; for (const [j, w] of wx[x]) s += toLin[data[(y * sw + j) * 3 + k]] * w;
    mid[(y * tw + x) * 3 + k] = s;
  }
  const out = Buffer.alloc(tw * th * 3);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) for (let k = 0; k < 3; k++) {
    let s = 0; for (const [j, w] of wy[y]) s += mid[(j * tw + x) * 3 + k] * w;
    out[(y * tw + x) * 3 + k] = toByte(s);
  }
  return out;
}
