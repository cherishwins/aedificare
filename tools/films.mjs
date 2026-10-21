#!/usr/bin/env node
/**
 * The films the site links, written from the releases (CLAUDE.md, Decisions
 * log, 21 Oct 2026). Each published edition whose current film is public
 * gets a block link to the film's watch page with the film's own thumbnail,
 * served from this origin; src/lib/films.json says which, and this writes it.
 *
 *   node tools/films.mjs <video id> [...]    link these films (each one public: the caller says so)
 *   node tools/films.mjs --drop <slug> [...] take an edition's film off the site
 *   node tools/films.mjs --check             check src/lib/films.json and public/film/, no network (the build runs this)
 *   node tools/films.mjs --check --online    and each link against its release now (verify.yml runs this)
 *
 * What is public cannot be read from here without the channel's secrets, so
 * it is the input: the morning a film publishes, one command with its id and
 * a commit. Each id is matched to its edition by the ledger the uploader
 * files on the release film-<slug> (youtube.json), so only the CURRENT film
 * of a published edition can be linked: an earlier cut, a Short or a video
 * that is not ours names no ledger and is refused. A ledger's privacy and
 * publishAt are what the upload sent, not what is true now, so only its id
 * and its time are read.
 *
 * The length is the film file's own, read from the movie header of the MP4
 * on the release by range requests (a few hundred kilobytes of a gigabyte)
 * and rounded up to the second, as YouTube shows it; meta.json's length is
 * rounded to the nearest and read a second short on two of the first three
 * films. The file must have been filed before the upload the ledger records,
 * or it is a later render and not the video's. The thumbnail's file name
 * comes from meta.json, the thumbnail is that release's asset, and its alt
 * text names what the render put on it (the first headline figure, or the
 * acid word, read from script.json by the rule tools/generate-film.mjs uses),
 * checked against the thumbnail's own ground colour.
 *
 * The thumbnail is reduced to the size it is shown at, and twice that for a
 * dense screen, by an area average in linear light, encoded here with no
 * library, and content-hashed like the OG cards. An entry whose id, film
 * file, thumbnail bytes and size have not changed keeps its files, so a run
 * for a new film never re-encodes the others. Files under public/film that no
 * entry links are removed.
 *
 * --check --online holds every link to its release as it is now: the
 * release still files that id as its film (a corrected render uploaded with
 * upload --replace files a new one), and the film file and the thumbnail are
 * still the bytes measured. It cannot see whether a video is still public;
 * tools/youtube-channel.mjs judges every link against the channel on each
 * run, and says so when it withdraws, holds or retires a linked film.
 *
 * Release files of this public repository download without a token; the
 * releases API takes GH_TOKEN or GITHUB_TOKEN when set, for its rate limit.
 * Nothing here calls YouTube.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { PUBLISHED } from '../src/lib/editions.mjs';
import { films as linked, problems, readFilms, clock, lengthOf, watchUrl, THUMB, FILMS_FILE as FILE, FILMS_DIR as DIR } from '../src/lib/films.mjs';

const REPO = 'cherishwins/aedificare';

const argv = process.argv.slice(2);
const usage = () => { console.error('films: node tools/films.mjs <video id> [...] | --drop <slug> [...] | --check [--online]'); process.exit(1); };
if (!argv.length) usage();
const fail = (msg) => { console.error(`films: ${msg}`); process.exit(1); };

/* ---- the releases ------------------------------------------------------------ */
const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const curl = (args, max = 1 << 26) => execFileSync('curl', ['-sSLf', '--retry', '2', ...args], { maxBuffer: max, stdio: ['ignore', 'pipe', 'pipe'] });
const why = (err) => String(err.stderr || err.message).trim();
/** Every film-<slug> release with its assets (name, size, updated_at, digest, download URL), from one or two API calls. */
const releases = () => {
  const all = [];
  for (let page = 1; ; page++) {
    let batch;
    try { batch = JSON.parse(curl(['-H', 'accept: application/vnd.github+json', ...(ghToken ? ['-H', `authorization: Bearer ${ghToken}`] : []), `https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`])); }
    catch (err) { fail(`could not list the releases: ${why(err)}`); }
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return new Map(all.filter((r) => r.tag_name.startsWith('film-')).map((r) => [r.tag_name, r]));
};
const assetOf = (rel, name) => rel?.assets.find((a) => a.name === name);
const download = (a) => {
  try { return curl([a.browser_download_url]); }
  catch (err) { fail(`could not fetch ${a.browser_download_url}: ${why(err)}`); }
};
const json = (rel, name) => { const a = assetOf(rel, name); return a ? JSON.parse(download(a).toString('utf8')) : null; };
// A ledger left as .prev by an upload run that died while filing it still names the release's film (youtube-channel.mjs).
const ledgerOf = (rel) => json(rel, 'youtube.json') ?? json(rel, 'youtube.json.prev');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
/** A release asset's sha256: GitHub's own digest where the asset has one, else its bytes hashed. */
const digestOf = (a) => (/^sha256:[0-9a-f]{64}$/.test(a.digest ?? '') ? a.digest.slice(7) : sha256(download(a)));

/**
 * The film's length in seconds, from the movie header (moov/mvhd) of the MP4 on the release, by range requests: the
 * top-level boxes are walked by their headers and only the moov is fetched. --max-filesize stops a server that ignores
 * the range from sending the whole film.
 */
function filmSeconds(a) {
  const range = (from, to) => {
    try { return curl(['-r', `${from}-${to}`, '--max-filesize', String(to - from + 1 + 4096), a.browser_download_url], 1 << 28); }
    catch (err) { fail(`could not read ${a.name} bytes ${from} to ${to}: ${why(err)}`); }
  };
  for (let off = 0; off + 8 <= a.size;) {
    const h = range(off, Math.min(off + 15, a.size - 1));
    let size = h.readUInt32BE(0), head = 8;
    const type = h.toString('latin1', 4, 8);
    if (size === 1) { size = Number(h.readBigUInt64BE(8)); head = 16; } else if (size === 0) size = a.size - off;
    if (size < head) fail(`${a.name}: a ${type} box of ${size} bytes at ${off}; not an MP4 this can read`);
    if (type === 'moov') {
      const moov = range(off, off + size - 1);
      for (let p = head; p + 8 <= moov.length;) {
        const s = moov.readUInt32BE(p), t = moov.toString('latin1', p + 4, p + 8);
        if (t === 'mvhd') {
          const v1 = moov[p + 8] === 1;
          const scale = moov.readUInt32BE(p + (v1 ? 28 : 20));
          const units = v1 ? Number(moov.readBigUInt64BE(p + 32)) : moov.readUInt32BE(p + 24);
          if (!scale || !units) fail(`${a.name}: its movie header gives no length`);
          return units / scale;
        }
        if (s < 8) break;
        p += s;
      }
      fail(`${a.name}: its moov box holds no movie header`);
    }
    off += size;
  }
  fail(`${a.name}: no moov box in ${a.size} bytes`);
}

/* ---- --check: what the build runs, and verify.yml with --online -------------- */
if (argv[0] === '--check') {
  let all;
  try { all = linked(); } catch (err) { console.error(err.message); process.exit(1); }
  const names = all.map((f) => f.slug).join(', ') || 'none';
  if (!argv.includes('--online')) {
    console.log(`check-films: ${all.length} film(s) linked (${names}), every entry bound to its edition and its release, every thumbnail present, its size and its hash`);
    process.exit(0);
  }
  // A link describes the VIDEO its release's ledger names, so only a ledger that now names another video makes it
  // wrong. A render or re-cut filed onto the release afterwards changes the files, not the video: the link stays true,
  // and failing it would turn verify.yml red on every PR until a correct link was dropped (review, 21 Oct 2026), so
  // that is a warning, and the relink comes when the new render goes up as its own video.
  const raw = readFilms(), rels = releases(), bad = [], warn = [];
  for (const [slug, f] of Object.entries(raw)) {
    const rel = rels.get(`film-${slug}`);
    if (!rel) { bad.push(`${slug}: there is no release film-${slug}`); continue; }
    const ledger = ledgerOf(rel);
    if (ledger?.id !== f.id) bad.push(`${slug}: film-${slug} now files ${ledger?.id ?? 'no video'} as its film, not the linked ${f.id} (a corrected render went up beside it?). Once that video is public, node tools/films.mjs ${ledger?.id ?? '<its id>'} relinks the edition; until then node tools/films.mjs --drop ${slug}`);
    const meta = json(rel, 'meta.json');
    if (meta?.file !== f.source.asset || meta?.thumbnail !== f.thumb.source.asset) warn.push(`${slug}: film-${slug}/meta.json now names ${meta?.file} and ${meta?.thumbnail}, not the ${f.source.asset} and ${f.thumb.source.asset} the link was made from; the link still describes ${f.id}`);
    const fa = assetOf(rel, f.source.asset);
    if (!fa || fa.size !== f.source.bytes || fa.updated_at !== f.source.updated) warn.push(`${slug}: film-${slug}/${f.source.asset} has been filed again since it was measured (${fa ? `${fa.size} B, ${fa.updated_at}` : 'gone'}; measured ${f.source.bytes} B, ${f.source.updated}); the video ${f.id} is unchanged, so the link stands until the new render goes up as its own video and is linked`);
    // The same bytes measured again, so a length typed into the file is caught.
    else { const s = filmSeconds(fa); if (s !== f.source.seconds) bad.push(`${slug}: ${f.source.asset} runs ${s} s, not the ${f.source.seconds} s films.json says; node tools/films.mjs ${f.id}`); }
    const ta = assetOf(rel, f.thumb.source.asset);
    if (!ta || digestOf(ta) !== f.thumb.source.sha256) warn.push(`${slug}: film-${slug}/${f.thumb.source.asset} is ${ta ? 'no longer the bytes the thumbnail was reduced from' : 'gone'}; the site keeps the thumbnail the video went up with`);
  }
  for (const w of warn) console.log(`${process.env.GITHUB_ACTIONS ? '::warning::' : 'check-films --online: warning: '}${w}`);
  if (bad.length) { console.error(`check-films --online: ${bad.length} link(s) no longer what their releases file:\n  ${bad.join('\n  ')}`); process.exit(1); }
  console.log(`check-films --online: ${all.length} film(s) linked (${names}), each still the film its release's ledger names${warn.length ? `, ${warn.length} warning(s)` : ', measured from the bytes still filed'}. Whether each is still public, tools/youtube-channel.mjs list says`);
  process.exit(0);
}

const films = readFilms();

/* ---- --drop ----------------------------------------------------------------- */
let dropped = 0;
if (argv[0] === '--drop') {
  for (const slug of argv.slice(1)) {
    if (!films[slug]) fail(`${slug} has no film linked`);
    delete films[slug];
    dropped++;
    console.log(`  ${slug}: film taken off the site`);
  }
  if (!dropped) usage();
} else {
  /* ---- link: match each id to the ledger that names it ---------------------- */
  const ids = argv;
  for (const id of ids) if (!/^[A-Za-z0-9_-]{11}$/.test(id)) fail(`${id} is not an eleven-character YouTube id`);
  const rels = releases();
  const ledgers = new Map();
  for (const e of PUBLISHED) {
    const rel = rels.get(`film-${e.slug}`);
    const l = rel && ledgerOf(rel);
    if (l?.id) ledgers.set(l.id, { e, rel, ledger: l });
  }
  for (const id of ids) {
    const hit = ledgers.get(id);
    if (!hit) fail(`${id} is not the film any published edition's release files in its youtube.json; an earlier cut, a Short or another channel's video gets no link`);
    const { e, rel, ledger } = hit;
    const meta = json(rel, 'meta.json');
    if (!meta || meta.kind !== 'film' || meta.slug !== e.slug) fail(`film-${e.slug}/meta.json is missing or not this edition's film`);
    if (!Number.isInteger(meta.duration) || meta.duration <= 0) fail(`film-${e.slug}/meta.json has no duration`);
    const fa = assetOf(rel, meta.file);
    if (!fa || !new RegExp(`^${e.slug}-film-\\d+x\\d+\\.mp4$`).test(meta.file)) fail(`film-${e.slug}/meta.json names ${meta.file}, which is not this edition's film on the release`);
    // The file on the release must be the one that went up: filed before the upload the ledger records. A render filed
    // since (a correction, a re-cut) is not the video until upload --replace puts it up, which files a new id.
    if (!Date.parse(ledger.at)) fail(`film-${e.slug}'s ledger records no upload time, so the film file on the release cannot be shown to be the video's`);
    if (!(Date.parse(fa.updated_at) <= Date.parse(ledger.at))) fail(`film-${e.slug}/${meta.file} was filed ${fa.updated_at}, after ${id} went up (${ledger.at}), so its length is not that video's; link the edition's film once the render that replaces it is up and public`);
    if (!new RegExp(`^${e.slug}-thumb-\\d+x\\d+\\.png$`).test(meta.thumbnail ?? '')) fail(`film-${e.slug}/meta.json names no thumbnail of its own (${meta.thumbnail})`);
    const ta = assetOf(rel, meta.thumbnail);
    if (!ta) fail(`film-${e.slug}/${meta.thumbnail} is not on the release`);
    const old = films[e.slug];
    const sameFilm = old?.source?.asset === meta.file && old.source.bytes === fa.size && old.source.updated === fa.updated_at && Number.isFinite(old.source.seconds);
    const seconds = sameFilm ? old.source.seconds : filmSeconds(fa);
    // meta.json rounds the narration's length; the file runs within a second of it, or the two are not one render.
    if (Math.abs(seconds - meta.duration) > 1) fail(`film-${e.slug}: meta.json says ${meta.duration} s and ${meta.file} runs ${seconds} s; they are not one render`);
    const duration = lengthOf(seconds);
    const digest = digestOf(ta);
    const source = { release: rel.tag_name, asset: meta.file, bytes: fa.size, updated: fa.updated_at, seconds };
    if (old && old.id === id && sameFilm && old.duration === duration && old.thumb?.source?.sha256 === digest && old.thumb.width === THUMB.width && old.thumb.height === THUMB.height && !problems({ [e.slug]: old }).some((p) => !/is linked by no entry/.test(p))) {
      console.log(`  ${e.slug}: ${id}, unchanged`);
      continue;
    }
    const src = download(ta);
    if (sha256(src) !== digest) fail(`film-${e.slug}/${meta.thumbnail} downloaded as other bytes than GitHub's digest says`);
    const img = decodePng(src);
    if (img.width * THUMB.height !== img.height * THUMB.width) fail(`${meta.thumbnail} is ${img.width}x${img.height}, not 16:9`);
    const script = json(rel, 'script.json');
    if (!script?.blocks) fail(`film-${e.slug}/script.json is missing`);
    const alt = altText(e, script, img);
    fs.mkdirSync(DIR, { recursive: true });
    const write = (scale) => {
      const w = THUMB.width * scale, h = THUMB.height * scale;
      const bytes = encodePng(w, h, resample(img, w, h));
      const hash = sha256(bytes).slice(0, 8);
      const name = `${e.slug}${scale > 1 ? `-${scale}x` : ''}.${hash}.png`;
      fs.writeFileSync(path.join(DIR, name), bytes);
      console.log(`  ${path.join(DIR, name)}`.padEnd(48) + `${w}x${h}  ${bytes.length} B`);
      return `/film/${name}`;
    };
    films[e.slug] = {
      id, duration, source,
      thumb: { src: write(1), src2x: write(2), width: THUMB.width, height: THUMB.height, alt,
        source: { release: rel.tag_name, asset: meta.thumbnail, sha256: digest } },
    };
    console.log(`  ${e.slug}: ${watchUrl(id)}  ${clock(duration)} (${meta.file} runs ${seconds} s; meta.json says ${meta.duration})  "${alt}"`);
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
if (bad.length) fail(`${FILE} written, and it does not hold:\n  ${bad.join('\n  ')}`);
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
