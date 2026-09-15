/**
 * The rose is never illustrated. It is computed.
 *
 * r = cos(k·θ), Grandi, 1720s. This module is the ONLY place the curve is
 * sampled: the live fields in the browser, the frozen mark in the favicon,
 * the OG cards and the dove all import it, so a change here changes every
 * rose on the site at once and nothing can drift into a hand-drawn version.
 *
 * Pure functions, no DOM: it runs in Node at build time and in the page.
 */

/**
 * Sample the rhodonea into an SVG path string.
 * Negative r is kept (reflected through the origin), which is what gives
 * even k its 2k petals. Non-integer k never closes, so `turns` decides how
 * much of the endless curve is drawn.
 */
export function rhodonea(cx, cy, R, k, phase = 0, turns = 8, steps = 2400) {
  let d = '';
  const span = Math.PI * 2 * turns;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * span;
    const r = Math.cos(k * t) * R;
    const x = cx + r * Math.cos(t + phase);
    const y = cy + r * Math.sin(t + phase);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return d;
}

/**
 * The house configuration: three curves at descending radius, each phase
 * offset so the axes never align. k=5 full, k=7 at 78 percent, k=3 at 54.
 * Colours are passed in by the surface, because which curve gets Acid is a
 * per-surface decision (Acid once per surface) and not a property of the rose.
 */
export const HOUSE = [
  { k: 5, s: 1.0, ph: 0.0, w: 0.8 },
  { k: 7, s: 0.78, ph: 0.42, w: 0.75 },
  { k: 3, s: 0.54, ph: 0.91, w: 0.9 },
];

/** The mark: one curve, k=5, one turn, frozen. Seed AED-M-01. */
export const MARK = { k: 5, phase: -Math.PI / 2, turns: 1, steps: 720 };

/** Path for the mark in a 0..size square, stroke width left to the caller. */
export function markPath(size = 100) {
  const c = size / 2;
  return rhodonea(c, c, c * 0.96, MARK.k, MARK.phase, MARK.turns, MARK.steps);
}

/**
 * The dove silhouette in a 260×180 box. The dove is not drawn on the page:
 * the rose field is sampled and kept only where the sample falls inside this
 * outline, so the figure is made of roses. It is made of the roses.
 */
export const DOVE_PATH =
  'M26 66 L52 56 C62 46 80 46 90 56 C100 66 104 78 110 88 ' +
  'C128 104 152 110 176 110 L234 88 L226 112 L240 134 L190 134 ' +
  'C162 146 132 148 110 138 C92 130 78 116 70 100 C64 88 58 80 50 76 ' +
  'C44 74 34 70 26 66 Z ' +
  'M96 88 C104 62 122 36 150 22 C142 44 140 62 146 78 ' +
  'C152 94 158 102 168 106 C146 110 116 102 96 88 Z';
