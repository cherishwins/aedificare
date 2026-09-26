/**
 * Charts for the episodes (CLAUDE.md, override 8): the screen time carries the
 * argument, so a number that has a context is shown in it. Built from the
 * dataviz method (form by job, emphasis over categorical, one axis, thin
 * recessive chrome, direct labels, the source on screen) in the brand's own
 * palette, and computed like everything else: the tag's data becomes SVG, and
 * window.__frame(ms) builds it up so the context lands first and the one
 * point the story is about lands last, on the word that says it.
 *
 * Narration in step with the picture is the largest single effect in Mayer's
 * review of multimedia learning (source/channel/brief-2026-09-26.md, 6), so
 * the render finds the word in the narration that speaks the starred value
 * and passes its time as `landMs`: the point's mark finishes and its value
 * appears on that word, and the context builds before it. Without a spoken
 * match the chart keeps its own timing (context over one beat, the point over
 * the next).
 *
 * Colour is emphasis, never categorical: the point the story is about is
 * Acid, everything else Malachite, gridlines Bottle, text Flash and Malachite
 * mono. Validated with the dataviz skill's validator on Void (2026-09-26):
 * CVD separation ΔE 24.1, normal vision 28.3, both marks above 3:1. The
 * lightness-band check fails for Acid by design: that band keeps categorical
 * slots equally loud, and emphasis exists to make one slot louder.
 *
 * Departures from the dashboard specs, all because this is video: bars are
 * 52 px (64 in a Short), not 24, and labels and values 40 px, because a phone
 * shows 1080p at a third of its size and there is no hover to rescue a thin
 * mark or a small label; data-ends are square with the kit's 2 px radius cap
 * instead of 4 px. There is no tooltip and no table view; the values are all
 * direct-labelled, the source is on screen, and the description lists every
 * source. The source line sits above the bottom 12 percent of a 16:9 frame,
 * where captions and the player's controls sit; a Short keeps its lower
 * quarter and its right 120 px clear for YouTube's own title and buttons.
 *
 * Forms, by the job the data does:
 *   bars      compare magnitudes, one of them the point          Label=9.75*
 *   range     low-to-high per row (rates of an issue, a band)     Jun 2021=2.125..5.25
 *   stack     parts of one whole                                  Coupons 2034=438.75*
 *   timeline  dated events, the last one the point                2026-10-01=$10B to OpenAI*
 *   flow      money or control between parties                    SoftBank > OpenAI=$30B*
 *   line      one series over time, optional reference line       2024-01=5.1
 * A value may carry display text in brackets: Week of sale=400 (400+)*.
 */
const ACID = '#CCFF00', MAL = '#00B24F', BOTTLE = '#063B22', VOID = '#050A06', FLASH = '#FFFFFF';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const CHART_TYPES = ['bars', 'range', 'stack', 'timeline', 'flow', 'line'];

/** Parse the data parts of a chart tag. Returns { rows, errors }. */
export function parseChart(type, parts) {
  const rows = [], errors = [];
  for (const p of parts) {
    const star = /\*\s*$/.test(p);
    const body = p.replace(/\*\s*$/, '').trim();
    const eq = body.indexOf('=');
    if (eq < 0) { errors.push(`chart data "${p}" has no =`); continue; }
    const key = body.slice(0, eq).trim(), val = body.slice(eq + 1).trim();
    if (type === 'flow') {
      const m = /^(.+?)\s*>\s*(.+)$/.exec(key);
      if (!m) { errors.push(`flow edge "${p}" must be "From > To=label"`); continue; }
      rows.push({ from: m[1].trim(), to: m[2].trim(), text: val, hot: star });
      continue;
    }
    if (type === 'timeline') {
      const d = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(key);
      if (!d) { errors.push(`timeline date "${key}" must be YYYY-MM or YYYY-MM-DD`); continue; }
      rows.push({ t: Date.UTC(+d[1], +d[2] - 1, +(d[3] || 1)), date: `${d[3] ? +d[3] + ' ' : ''}${MONTHS[+d[2] - 1]} ${d[1]}`, text: val, hot: star });
      continue;
    }
    const v = /^(-?\d[\d,]*(?:\.\d+)?)(?:\s*\.\.\s*(-?\d[\d,]*(?:\.\d+)?))?\s*(?:\((.*)\))?$/.exec(val);
    if (!v) { errors.push(`chart value "${val}" must be a number, a..b, optionally (display text)`); continue; }
    const n = (s) => +s.replace(/,/g, '');
    // The number as typed (5.10 stays 5.10 on screen); the parsed value only places the mark.
    const row = { label: key, a: n(v[1]), b: v[2] !== undefined ? n(v[2]) : null, ra: v[1], rb: v[2] ?? null, show: v[3] || null, hot: star };
    if (type === 'line') {
      const d = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(key);
      if (!d) { errors.push(`line x "${key}" must be YYYY, YYYY-MM or YYYY-MM-DD`); continue; }
      row.t = Date.UTC(+d[1], +(d[2] || 1) - 1, +(d[3] || 1));
    }
    if (type === 'range' && row.b === null) { errors.push(`range row "${key}" needs low..high`); continue; }
    rows.push(row);
  }
  if (!rows.length) errors.push('chart has no data');
  if (type === 'flow' && rows.length > 6) errors.push('flow: six edges at most; a seventh is a second chart');
  if (['bars', 'range', 'stack'].includes(type) && rows.length > 7) errors.push(`${type}: seven rows at most; past that, fold or split`);
  return { rows, errors };
}

/* ---- the point and the word that says it ----------------------------------- */
/**
 * A number as a chart types it or the narration speaks it: digits and the
 * point only, a trailing point dropped, compared as a value ("9.75%" is 9.75,
 * "21,470." is 21470, "325" says 325.00). Null when there is no number.
 */
export const numKey = (s) => {
  const d = String(s).replace(/[^0-9.]/g, '').replace(/\.+$/, '');
  return /\d/.test(d) && Number.isFinite(+d) ? +d : null;
};

/**
 * The values that say a chart's point: the starred row's value (both ends of
 * a range), the first number in a starred flow or timeline row's text, and a
 * line's last point, the one it labels. Empty when the point has no number.
 */
export function hotValues(type, rows) {
  if (type === 'line') { const last = rows.slice().sort((p, q) => p.t - q.t).pop(); return last ? [last.a] : []; }
  const hot = rows.filter((r) => r.hot);
  if (type === 'flow' || type === 'timeline') return hot.map((r) => /\d[\d,]*(?:\.\d+)?/.exec(r.text)).filter(Boolean).map((m) => numKey(m[0]));
  return hot.flatMap((r) => (r.b !== null ? [r.a, r.b] : [r.a]));
}

/**
 * The index of the first word ({ w }) that speaks one of `values`, or -1.
 * The scripts spell cents out so the voice reads them ("114 dollars and 50
 * cents"), so that phrase says 114.50 and matches on its first word.
 */
export function findSpoken(words, values) {
  if (!values.length) return -1;
  const says = (x) => x !== null && values.some((v) => Math.abs(v - x) < 1e-9);
  for (let i = 0; i < words.length; i++) {
    const n = numKey(words[i].w);
    if (n === null) continue;
    if (says(n)) return i;
    const [d, and, c, cents] = words.slice(i + 1, i + 5).map((x) => x.w.toLowerCase());
    if (Number.isInteger(n) && /^dollars?$/.test(d || '') && and === 'and' && /^\d{1,2}$/.test(c || '') && /^cents?\b/.test(cents || '') && says(n + +c / 100)) return i;
  }
  return -1;
}

/* ---- type and measure ---------------------------------------------------------- */
/**
 * Type sizes by frame, shared by the SVG and the CSS so the two never differ.
 * Wide: labels and values 40 px, mono 26, the source 24, the title 84. Tall
 * keeps the Short's own sizes and gives the point's value 56.
 */
export const chartSizes = (tall) => (tall
  ? { title: 96, sub: 26, foot: 22, label: 40, value: 40, hot: 56, mono: 26, name: 44, bar: 64, subGap: 36 }
  : { title: 84, sub: 26, foot: 24, label: 40, value: 40, hot: 40, mono: 26, name: 40, bar: 52, subGap: 26 });

/**
 * Martian Mono's advance per character, measured in Chromium (2026-09-26):
 * `cv` the values (wdth 90), `cm` the mono labels (wdth 75, .08em tracking),
 * `mono` the page's mono class (wdth 75, .14em). The face is monospaced, so
 * a value's width is known before the frame renders.
 */
const ADV = { cv: 0.66, cm: 0.68, mono: 0.74 };
const monoW = (s, size, cls = 'cv') => String(s).length * size * ADV[cls];
/**
 * Lines a string takes inside `maxW` at `adv` px per character, broken at
 * spaces only. Exact for the monospaced faces (a browser may also break after
 * a hyphen, so it never needs more); an estimate for the title, which the
 * page shrinks if it runs longer.
 */
function lineCount(s, adv, maxW) {
  const per = Math.max(1, Math.floor(maxW / adv));
  let lines = 1, n = 0;
  for (const w of String(s).split(/\s+/).filter(Boolean)) {
    const next = n ? n + 1 + w.length : w.length;
    if (next > per && n) { lines++; n = w.length; } else n = next;
  }
  return lines;
}

/** A tick step that reads: 1, 2 or 5 times a power of ten, about `n` ticks across. */
function niceStep(max, n = 5) {
  const raw = max / n, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
}
const trim = (x) => String(+x.toFixed(4));

/**
 * Re-time a build so its point lands at `landMs`: the point's value appears
 * then and its mark finishes then, its stage keeping its own length. The
 * context keeps its timing when there is room before that stage; short of
 * room it is compressed to fit, to no less than half a beat, and past that
 * both stages shrink in proportion. Durations stay linear (the kit).
 */
function land(steps, landMs) {
  const hot = steps.filter((s) => s.hot), ctx = steps.filter((s) => !s.hot);
  if (!hot.length) return false;
  const end = (s) => s.at + (s.kind === 'show' ? 0 : s.dur || 900);
  const h0 = Math.min(...hot.map((s) => s.at)), h1 = Math.max(...hot.map(end));
  const c1 = ctx.length ? Math.max(...ctx.map(end)) : 0;
  const lead = Math.max(0, h0 - c1) + (h1 - h0); // from the end of the context to the landing
  const c0 = Math.min(c1, 450);
  let ck = 1, hk = 1;
  if (landMs - lead < c1) {
    if (landMs - lead >= c0) ck = (landMs - lead) / c1;
    else { hk = landMs / (lead + c0); ck = c1 ? (hk * c0) / c1 : 1; }
  }
  for (const s of ctx) { s.at *= ck; if (s.kind !== 'show') s.dur = Math.max(1, (s.dur || 900) * ck); }
  for (const s of hot) {
    if (s.kind === 'show') s.at = landMs;
    else { s.at = landMs - hk * (h1 - s.at); s.dur = Math.max(1, (s.dur || 900) * hk); }
  }
  return true;
}

/**
 * The chart as a body fragment for the episode page: SVG plus the build-up script.
 * `fmt` formats a value (unit, prefix); `W`, `H`, `M` are the frame and margin;
 * `landMs`, when the narration says the point, is when it lands, in ms from the
 * shot's first frame. Returns { body, animMs, landed }.
 */
export function chartBody({ type, title, sub, note, sourceLine, rows, fmt, W, H, M, ref, landMs = null }) {
  const tall = H > W;
  const Z = chartSizes(tall);
  // A Short's right edge sits under YouTube's buttons: nothing a tall chart draws comes within 120 px of it
  // (128 here: a glyph's ink can overhang its advance by a few px).
  const X0 = M, X1 = tall ? W - 128 : W - M;
  // The header (title, then sub) and the foot (source, note) are measured first, so a long title or a
  // three-line source moves the plot instead of running into it.
  const titleH = lineCount(title.toUpperCase(), Z.title * 0.36, W - 2 * M) * Z.title * 0.9;
  const headBottom = M + titleH + (sub ? Z.subGap + lineCount(sub, Z.sub * ADV.mono, W - 2 * M) * Z.sub * 1.5 : 0);
  const top = Math.round(headBottom + (tall ? 80 : 50));
  const foot = sourceLine + (note ? ` · ${note}` : '');
  // Wide: the source clears the bottom 12 percent (burned-in captions, the player's controls). Tall: the lower quarter.
  const footBottom = tall ? Math.round(H * 0.24) : Math.ceil(H * 0.12) + 12;
  const footTop = H - footBottom - lineCount(foot, Z.foot * ADV.mono, X1 - X0) * Z.foot * 1.6;
  // A Short's lower quarter sits under YouTube's own title and buttons, so a tall chart ends by 72 percent of the frame.
  const bottom = Math.round(tall ? Math.min(H * 0.72, footTop - 60) : footTop - 44);
  const els = [];   // svg markup
  const steps = []; // { id, kind: 'grow'|'show'|'draw', at, dur?, hot } for the build-up
  let id = 0;
  const nid = () => `e${id++}`;
  // `fit` is the widest the text may run; the page shrinks that one label, and only it, if it runs wider.
  const text = (x, y, s, { cls = 'cl', fill = FLASH, anchor = 'start', size, fit } = {}) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" fill="${fill}" text-anchor="${anchor}"${size ? ` style="font-size:${size}px"` : ''}${fit ? ` data-fit="${Math.max(40, fit).toFixed(0)}"` : ''}>${esc(s)}</text>`;
  // Context first, the point last: context builds over one beat from 0, the hot marks over the next beat.
  const ctxAt = 0, hotAt = 900;
  const blockTop = (blockH) => Math.round(top + Math.max(0, (bottom - top - blockH) / 2));
  const val = (r, which = 'a') => (r.show && (which === 'b' || r.b === null) ? r.show : fmt(r[which === 'a' ? 'ra' : 'rb'] ?? r[which]));
  const vsize = (r) => (r.hot ? Z.hot : Z.value);

  if (type === 'bars' || type === 'range') {
    const hi = Math.max(...rows.map((r) => (r.b ?? r.a)));
    const step = niceStep(hi);
    const max = Math.ceil(hi / step) * step;
    const f = (v) => v / max;
    // Wide frames give short labels a column of their own (a range always has one), so five rows fit at full
    // size; long labels sit above their bar, where they have the width of the frame.
    const longest = Math.max(...rows.map((r) => r.label.length * Z.label * 0.5));
    const column = !tall && (type === 'range' || longest <= 0.24 * (X1 - X0));
    const colW = column ? Math.min(Math.max(longest, 160), 0.3 * (X1 - X0)) + 40 : 0;
    // The scale leaves room for every value label inside the margins: a bar's value right of its end, a
    // range's low value left of its first dot (clear of the label column) and its high value right of its last.
    let px0 = X0 + colW, px1 = X1;
    for (let k = 0; k < 3; k++) for (const r of rows) {
      if (type === 'bars') { if (f(r.a) > 0) px1 = Math.min(px1, px0 + (X1 - 18 - monoW(val(r), vsize(r)) - px0) / f(r.a)); continue; }
      const fa = f(r.a), fb = f(r.b);
      if (fb > 0) px1 = Math.min(px1, (X1 - 22 - monoW(val(r, 'b'), vsize(r)) - px0 * (1 - fb)) / fb);
      if (fa < 1) px0 = Math.max(px0, (X0 + colW + 22 + monoW(val(r, 'a'), vsize(r)) - px1 * fa) / (1 - fa));
    }
    const sx = (v) => px0 + (px1 - px0) * f(v);
    const band = type === 'range' ? 60 : 0; // a range's tick labels run under its rows
    const rowH = Math.min(column ? 120 : tall ? 230 : 150, (bottom - top - band) / rows.length);
    // Tall frames centre the block in the space they have; wide frames hang it under the title.
    const ptop = tall ? blockTop(rowH * rows.length + band) : top;
    const above = Z.label * 0.8 + 16; // a label above its mark: its baseline, then the gap to the mark
    // Gridlines: hairline, solid, Bottle; tick labels mono Malachite along the bottom. Bars show no grid (every value is labelled).
    if (type === 'range') {
      for (let v = 0; v <= max + 1e-9; v += step) {
        els.push(`<line x1="${sx(v).toFixed(1)}" x2="${sx(v).toFixed(1)}" y1="${ptop}" y2="${ptop + rowH * rows.length}" stroke="${BOTTLE}" stroke-width="1"/>`);
        els.push(text(sx(v), ptop + rowH * rows.length + 44, fmt(+trim(v)), { cls: 'cm', fill: MAL, anchor: 'middle' }));
      }
    } else els.push(`<line x1="${px0}" x2="${px0}" y1="${ptop - 10}" y2="${ptop + rowH * rows.length - 10}" stroke="${BOTTLE}" stroke-width="2"/>`);
    rows.forEach((r, i) => {
      const y = ptop + rowH * i;
      const colour = r.hot ? ACID : MAL;
      const at = r.hot ? hotAt : ctxAt;
      const e = nid(), v = nid(), size = vsize(r);
      if (type === 'bars') {
        const bh = Math.max(24, Math.min(Z.bar, column ? rowH - 36 : rowH - above - 24));
        const by = column ? y + (rowH - bh) / 2 : y + above, len = sx(r.a) - px0;
        if (column) els.push(text(X0, by + bh / 2 + Z.label * 0.35, r.label, { fit: colW - 24 }));
        else els.push(text(px0, y + Z.label * 0.8, r.label, { fit: X1 - px0 }));
        els.push(`<rect id="${e}" x="${px0}" y="${by.toFixed(1)}" width="${len.toFixed(1)}" height="${bh}" rx="2" fill="${colour}" data-w="${len.toFixed(1)}"/>`);
        els.push(`<g id="${v}">${text(px0 + len + 18, by + bh / 2 + size * 0.36, val(r), { cls: 'cv', size: size !== Z.value && size })}</g>`);
        steps.push({ id: e, kind: 'grow', at, hot: r.hot }, { id: v, kind: 'show', at: at + 900, hot: r.hot });
      } else {
        const ly = column ? y + rowH / 2 : y + above + 14 + Z.hot * 0.36;
        if (column) els.push(text(X0, ly + Z.label * 0.35, r.label, { fit: colW - 24 }));
        else els.push(text(X0, y + Z.label * 0.8, r.label, { fit: X1 - X0 }));
        const xa = sx(r.a), xb = sx(r.b);
        els.push(`<line id="${e}" x1="${xa.toFixed(1)}" x2="${xb.toFixed(1)}" y1="${ly}" y2="${ly}" stroke="${colour}" stroke-width="6" data-len="${(xb - xa).toFixed(1)}"/>`);
        const big = size !== Z.value && size;
        els.push(`<g id="${v}"><circle cx="${xa.toFixed(1)}" cy="${ly}" r="11" fill="${colour}" stroke="${VOID}" stroke-width="3"/><circle cx="${xb.toFixed(1)}" cy="${ly}" r="11" fill="${colour}" stroke="${VOID}" stroke-width="3"/>`
          + `${text(xa - 22, ly + size * 0.36, val(r, 'a'), { cls: 'cv', anchor: 'end', size: big })}${text(xb + 22, ly + size * 0.36, val(r, 'b'), { cls: 'cv', size: big })}</g>`);
        steps.push({ id: e, kind: 'draw', at, hot: r.hot }, { id: v, kind: 'show', at: at + 900, hot: r.hot });
      }
    });
  }

  if (type === 'stack') {
    const total = rows.reduce((s, r) => s + r.a, 0);
    const h = tall ? 120 : 96, gap = 2, key = Math.round(Z.label * 0.6);
    // Labels under the bar as a list with a key mark, so a thin segment never clips its own label.
    const first = h + 64 + Math.max(Z.label, Z.hot) * 0.72; // the bar's top to the list's first baseline
    const ideal = Math.max(Z.label, Z.hot) + 40;
    const y = tall ? blockTop(first + ideal * (rows.length - 1) + 20) : top + 10;
    const sp = Math.min(ideal, (bottom - y - first) / Math.max(1, rows.length - 1));
    let x = X0;
    const usable = X1 - X0 - gap * (rows.length - 1);
    rows.forEach((r, i) => {
      const w = (usable * r.a) / total, e = nid(), v = nid(), size = vsize(r);
      const colour = r.hot ? ACID : MAL, op = r.hot ? 1 : i % 2 ? 0.62 : 1;
      els.push(`<rect id="${e}" x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="2" fill="${colour}" fill-opacity="${op}" data-w="${w.toFixed(1)}"/>`);
      const ly = y + first + i * sp, vw = monoW(val(r), size);
      els.push(`<g id="${v}"><rect x="${X0}" y="${(ly - key).toFixed(1)}" width="${key}" height="${key}" rx="2" fill="${colour}" fill-opacity="${op}"/>${text(X0 + key + 18, ly, r.label, { fit: X1 - vw - 32 - (X0 + key + 18) })}${text(X1, ly, val(r), { cls: 'cv', anchor: 'end', size: size !== Z.value && size })}</g>`);
      const at = (i * 900) / rows.length;
      steps.push({ id: e, kind: 'grow', at: r.hot ? hotAt : at, hot: r.hot }, { id: v, kind: 'show', at: (r.hot ? hotAt : at) + 450, hot: r.hot });
      x += w + gap;
    });
  }

  if (type === 'timeline') {
    const t0 = Math.min(...rows.map((r) => r.t)), t1 = Math.max(...rows.map((r) => r.t));
    const span = Math.max(1, t1 - t0);
    const axis = nid();
    const sorted = rows.slice().sort((p, q) => p.t - q.t);
    if (!tall) {
      const ay = top + (bottom - top) / 2, pad = 200;
      const sx0 = (t) => X0 + pad + ((X1 - X0 - 2 * pad) * (t - t0)) / span;
      // Events days apart would touch: keep 90 px between neighbours, pushing later ones right (dates stay labelled, so no value is misread).
      const xs = new Map(); let prev = -Infinity;
      for (const r of sorted) { const x = Math.max(sx0(r.t), prev + 90); xs.set(r, x); prev = x; }
      els.push(`<line id="${axis}" x1="${X0}" x2="${X1}" y1="${ay}" y2="${ay}" stroke="${MAL}" stroke-width="2" data-len="${X1 - X0}"/>`);
      steps.push({ id: axis, kind: 'draw', at: 0, hot: false });
      rows.forEach((r, i) => {
        // Above and below the axis in turn; a label may run as wide as the room to its same-side neighbours and the frame.
        const k = sorted.indexOf(r), x = xs.get(r), up = k % 2 === 0, e = nid();
        const room = Math.min(2 * (x - 0.8 * M), 2 * (W - 0.8 * M - x), ...[sorted[k - 2], sorted[k + 2]].filter(Boolean).map((o) => Math.abs(xs.get(o) - x) - 32));
        const colour = r.hot ? ACID : MAL, size = r.hot ? Z.hot : Z.label;
        const ty = up ? ay - 80 : ay + 84 + size * 0.95; // the text's baseline; the date sits on the far side of it
        const dy = up ? ty - size * 0.95 - 16 : ay + 76;
        els.push(`<g id="${e}"><line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${ay}" y2="${up ? ay - 60 : ay + 44}" stroke="${colour}" stroke-width="2"/><circle cx="${x.toFixed(1)}" cy="${ay}" r="12" fill="${colour}" stroke="${VOID}" stroke-width="3"/>`
          + `${text(x, dy, r.date, { cls: 'cm', fill: MAL, anchor: 'middle', fit: room })}${text(x, ty, r.text, { anchor: 'middle', size: size !== Z.label && size, fit: room })}</g>`);
        steps.push({ id: e, kind: 'show', at: r.hot ? 900 + rows.length * 450 : 900 + i * 450, hot: r.hot });
      });
    } else {
      const ax = X0 + 20, gapY = 110 + Math.round(Z.hot / 2);
      const sy0 = (t) => top + 20 + ((bottom - top - 80) * (t - t0)) / span;
      // Same rule as the wide axis: room for a date and the point's label between neighbours, pushed down, then pulled back up
      // if the last would pass the end.
      const ys = sorted.map((r) => sy0(r.t));
      for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + gapY);
      const end = bottom - 90;
      if (ys[ys.length - 1] > end) { ys[ys.length - 1] = end; for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i], ys[i + 1] - gapY); }
      const at = new Map(sorted.map((r, i) => [r, ys[i]]));
      els.push(`<line id="${axis}" x1="${ax}" x2="${ax}" y1="${top}" y2="${bottom}" stroke="${MAL}" stroke-width="2" data-len="${bottom - top}"/>`);
      steps.push({ id: axis, kind: 'draw', at: 0, hot: false });
      rows.forEach((r, i) => {
        const y = at.get(r), e = nid(), colour = r.hot ? ACID : MAL, size = r.hot ? Z.hot : Z.label;
        els.push(`<g id="${e}"><circle cx="${ax}" cy="${y.toFixed(1)}" r="14" fill="${colour}" stroke="${VOID}" stroke-width="3"/>${text(ax + 44, y - 12, r.date, { cls: 'cm', fill: MAL, fit: X1 - ax - 44 })}${text(ax + 44, y + 22 + size * 0.72, r.text, { size: size !== Z.label && size, fit: X1 - ax - 44 })}</g>`);
        steps.push({ id: e, kind: 'show', at: r.hot ? 900 + rows.length * 450 : 900 + i * 450, hot: r.hot });
      });
    }
  }

  if (type === 'flow') {
    const names = [];
    for (const r of rows) for (const n of [r.from, r.to]) if (!names.includes(n)) names.push(n);
    const boxW = (s) => Math.max(200, Math.round(s.length * Z.name * 0.5 + 64)), boxH = Math.round(Z.name * 1.9);
    const half = Math.max(...names.map(boxW)) / 2;
    // A flow has no subtitle band to keep clear: it takes the frame from under the title to above the source line.
    const ftop = top - (tall ? 60 : 40), cx = (X0 + X1) / 2, cy = ftop + (bottom - ftop) / 2;
    const rx = tall ? (X1 - X0) / 2 - half : Math.min(640, (X1 - X0) / 2 - half - 40), ry = tall ? (bottom - ftop) / 2 - 110 : (bottom - ftop) / 2 - 50;
    // Parties on an ellipse, the first at the left (wide) or the top (tall), clockwise.
    const pos = names.map((_, i) => {
      const a = (tall ? -Math.PI / 2 : Math.PI) + (2 * Math.PI * i) / names.length;
      return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
    names.forEach((n, i) => {
      const [x, y] = pos[i], w = boxW(n);
      els.push(`<rect x="${(x - w / 2).toFixed(1)}" y="${(y - boxH / 2).toFixed(1)}" width="${w}" height="${boxH}" rx="2" fill="${VOID}" stroke="${FLASH}" stroke-width="2"/>${text(x, y + Z.name * 0.33, n, { cls: 'cn', anchor: 'middle', fit: w - 32 })}`);
    });
    els.unshift(`<defs><marker id="ha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${ACID}"/></marker><marker id="hm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${MAL}"/></marker></defs>`);
    const edges = [];
    rows.forEach((r, i) => {
      const a = pos[names.indexOf(r.from)], b = pos[names.indexOf(r.to)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      // Leave the boxes: start and end short of the centres; bend to the left of travel so A>B and B>A never overlap.
      const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      // Leave each box at its edge in the direction of travel (half its width going sideways, half its height going up or down).
      const exit = (name) => Math.min(boxW(name) / 2 / Math.max(1e-6, Math.abs(ux)), boxH / 2 / Math.max(1e-6, Math.abs(uy))) + 16;
      const off = (d) => Math.min(len / 3, exit(d === 'a' ? r.from : r.to));
      const bend = Math.min(170, Math.max(70, len * 0.24));
      const sx = a[0] + ux * off('a') + nx * 22, sy = a[1] + uy * off('a') + ny * 22;
      const ex = b[0] - ux * off('b') + nx * 22, ey = b[1] - uy * off('b') + ny * 22;
      const qx = (a[0] + b[0]) / 2 + nx * bend, qy = (a[1] + b[1]) / 2 + ny * bend;
      const e = nid(), l = nid(), colour = r.hot ? ACID : MAL;
      // The point's label is a value, set large in mono; the others are small mono labels.
      const cls = r.hot ? 'cv' : 'cm', size = r.hot ? Z.hot : Z.mono;
      // The label sits just outside the curve's apex, on the side it bends to, so a pair of opposite edges never share a
      // label spot: clear of the curve by its own half-extent along the bend, and kept inside the frame's margins.
      const tw = Math.max(80, monoW(r.text, size, cls) + 28), th = Math.round(size * 1.5);
      const clear = 14 + Math.abs(nx) * tw / 2 + Math.abs(ny) * th / 2;
      const mx = Math.min(X1 - tw / 2, Math.max(X0 + tw / 2, 0.25 * sx + 0.5 * qx + 0.25 * ex + nx * clear)), my = 0.25 * sy + 0.5 * qy + 0.25 * ey + ny * clear;
      edges.push(`<path id="${e}" d="M${sx.toFixed(1)},${sy.toFixed(1)}Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${colour}" stroke-width="${r.hot ? 5 : 3}" marker-end="url(#${r.hot ? 'ha' : 'hm'})"/>`
        + `<g id="${l}"><rect x="${(mx - tw / 2).toFixed(1)}" y="${(my - th / 2).toFixed(1)}" width="${tw.toFixed(1)}" height="${th}" rx="2" fill="${VOID}"/>${text(mx, my + size * 0.36, r.text, { cls, fill: r.hot ? ACID : FLASH, anchor: 'middle', size: r.hot && size })}</g>`);
      const at = r.hot ? 900 * rows.length : 900 * i;
      steps.push({ id: e, kind: 'draw', at, hot: r.hot }, { id: l, kind: 'show', at: at + 900, hot: r.hot });
    });
    // Edges under the boxes, so an arrow never crosses a name.
    els.splice(1, 0, ...edges);
  }

  if (type === 'line') {
    const pts = rows.slice().sort((p, q) => p.t - q.t);
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const hi = Math.max(...pts.map((p) => p.a), ref ? ref.v : -Infinity), lo = Math.min(0, ...pts.map((p) => p.a));
    const step = niceStep(hi - lo), max = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let v = lo; v <= max + 1e-9; v += step) ticks.push(v);
    const last = pts[pts.length - 1], size = Z.hot;
    const refText = ref ? `${fmt(ref.r ?? ref.v)} ${ref.label}` : '';
    // Tick labels left of the plot, the last value and the reference's label right of it, each measured.
    const px0 = X0 + 24 + Math.max(...ticks.map((v) => monoW(fmt(+trim(v)), Z.mono, 'cm')));
    const px1 = X1 - Math.max(22 + monoW(val(last), size), ref ? 16 + monoW(refText, Z.mono, 'cm') : 0);
    const sx = (t) => px0 + ((px1 - px0) * (t - t0)) / Math.max(1, t1 - t0);
    const sy = (v) => bottom - 40 - ((bottom - 40 - top) * (v - lo)) / (max - lo);
    for (const v of ticks) {
      els.push(`<line x1="${px0}" x2="${px1}" y1="${sy(v).toFixed(1)}" y2="${sy(v).toFixed(1)}" stroke="${BOTTLE}" stroke-width="1"/>${text(px0 - 20, sy(v) + Z.mono * 0.36, fmt(+trim(v)), { cls: 'cm', fill: MAL, anchor: 'end' })}`);
    }
    const yr = (t) => new Date(t).getUTCFullYear();
    els.push(text(px0, bottom + 10, `${MONTHS[new Date(t0).getUTCMonth()]} ${yr(t0)}`, { cls: 'cm', fill: MAL }), text(px1, bottom + 10, `${MONTHS[new Date(t1).getUTCMonth()]} ${yr(t1)}`, { cls: 'cm', fill: MAL, anchor: 'end' }));
    if (ref) {
      const r = nid();
      // The reference's label moves off the last value's line when the two would touch.
      const clear = (size + Z.mono) * 0.6, dv = sy(ref.v) - sy(last.a);
      const ry = Math.abs(dv) < clear ? sy(last.a) + (dv >= 0 ? clear : -clear) : sy(ref.v);
      els.push(`<g id="${r}"><line x1="${px0}" x2="${px1}" y1="${sy(ref.v).toFixed(1)}" y2="${sy(ref.v).toFixed(1)}" stroke="${MAL}" stroke-width="2"/>${text(px1 + 16, ry + Z.mono * 0.36, refText, { cls: 'cm', fill: FLASH })}</g>`);
      steps.push({ id: r, kind: 'show', at: 0, hot: false });
    }
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.t).toFixed(1)},${sy(p.a).toFixed(1)}`).join('');
    const e = nid(), v = nid();
    els.push(`<path id="${e}" d="${d}" fill="none" stroke="${ACID}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`);
    els.push(`<g id="${v}"><circle cx="${sx(last.t).toFixed(1)}" cy="${sy(last.a).toFixed(1)}" r="11" fill="${ACID}" stroke="${VOID}" stroke-width="3"/>${text(sx(last.t) + 22, sy(last.a) + size * 0.36, val(last), { cls: 'cv', size: size !== Z.value && size })}</g>`);
    // The series is the story: the line draws, and its last value lands.
    steps.push({ id: e, kind: 'draw', at: 0, dur: 1800, hot: true }, { id: v, kind: 'show', at: 1800, hot: true });
  }

  // On the spoken word when there is one; otherwise the chart's own timing, as before.
  const landed = landMs > 0 ? land(steps, landMs) : false;
  const animMs = landed
    ? Math.max(...steps.map((s) => s.at + (s.kind === 'show' ? 0 : s.dur || 900)))
    : Math.max(...steps.map((s) => s.at + (s.dur || 900)), 900);
  const head = `<div class="ch-h" data-max="${top - 24}"><div class="ch-t" style="font-size:${Z.title}px">${esc(title)}</div>${sub ? `<div class="ch-s mono">${esc(sub)}</div>` : ''}</div>`;
  const footEl = `<div class="ch-f mono" style="bottom:${footBottom}px;max-width:${X1 - X0}px">${esc(foot)}</div>`;
  const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}">${els.join('')}</svg>`;
  // The build-up: linear, no easing (the kit), everything placed before the first frame so nothing reflows.
  // Placing waits for the faces: a label is measured in the face it is set in, and shrunk only if it runs past its room
  // (in steps, remeasured each time: the face's advances do not scale exactly with its size).
  const script = `<script>(()=>{const S=${JSON.stringify(steps.map(({ hot, ...s }) => s))};const E=S.map(s=>[s,document.getElementById(s.id)]);
for(const[s,e]of E){if(s.kind==='draw'){const L=e.getTotalLength?e.getTotalLength():0;e.style.strokeDasharray=L;e.dataset.L=L;}}
window.__frame=(ms)=>{for(const[s,e]of E){const p=Math.max(0,Math.min(1,(ms-s.at)/(s.dur||900)));
if(s.kind==='grow')e.setAttribute('width',(+e.dataset.w*p).toFixed(1));
else if(s.kind==='draw')e.style.strokeDashoffset=(+e.dataset.L*(1-p));
else e.style.opacity=ms>=s.at?1:0;}};
Promise.all([document.fonts.load("800 40px 'Bricolage Grotesque'"),document.fonts.load("600 40px 'Martian Mono'")]).then(()=>{
for(const t of document.querySelectorAll('[data-fit]')){const m=+t.dataset.fit;let z=parseFloat(getComputedStyle(t).fontSize),L=t.getComputedTextLength();
while(L>m&&z>12){z=Math.max(12,Math.min(z-0.5,(z*m)/L));t.style.fontSize=z.toFixed(1)+'px';L=t.getComputedTextLength();}}
const h=document.querySelector('.ch-h'),t=h.querySelector('.ch-t');let z=parseFloat(t.style.fontSize);
while(h.getBoundingClientRect().bottom>+h.dataset.max&&z>40){z-=2;t.style.fontSize=z+'px';}
window.__frame(0);window.__ready=true;});})();</script>`;
  return { body: head + svg + footEl + script, animMs, landed };
}

/** CSS for the chart page, added to the episode page's own. */
export const chartCss = (W, H, M) => {
  const Z = chartSizes(H > W);
  return `
svg.chart{position:absolute;inset:0;width:${W}px;height:${H}px}
.ch-h{position:absolute;left:${M - 4}px;top:${M}px;width:${W - 2 * M}px}
.ch-t{line-height:.9;letter-spacing:-.02em;text-transform:uppercase;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;color:${FLASH}}
.ch-s{margin:${Z.subGap}px 0 0 4px;font-size:${Z.sub}px;line-height:1.5;color:${MAL}}
.ch-f{position:absolute;left:${M}px;font-size:${Z.foot}px;line-height:1.6;color:${MAL}}
svg.chart .cl{font-family:'Bricolage Grotesque';font-size:${Z.label}px;font-variation-settings:'opsz' 32,'wdth' 90,'wght' 600}
svg.chart .cv{font-family:'Martian Mono';font-size:${Z.value}px;font-variation-settings:'wdth' 90,'wght' 600}
svg.chart .cm{font-family:'Martian Mono';font-size:${Z.mono}px;letter-spacing:.08em;font-variation-settings:'wdth' 75,'wght' 500}
svg.chart .cn{font-family:'Bricolage Grotesque';font-size:${Z.name}px;font-variation-settings:'opsz' 32,'wdth' 80,'wght' 800}
`;
};
