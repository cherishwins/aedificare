import { rhodonea, drift, DOVE_PATH } from '../lib/rose.mjs';

const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- live rose field ------------------------------------------------
   k drifts on a 5.5 s cycle (drift() in rose.mjs, shared with the film
   generator) so the petal count never resolves. Reduced
   motion gets the still at the seed, marked on the element so the sweep
   can prove the still exists rather than assume it. The loop pauses when
   the field is off-screen or the tab is hidden; a decoration that burns
   a phone battery in a background tab is not rigor. -------------------- */
function field(svg) {
  const layers = JSON.parse(svg.dataset.rose);
  const R = +svg.dataset.r, cx = +svg.dataset.cx, cy = +svg.dataset.cy;
  const seed = +(svg.dataset.seed || 0);
  const readout = svg.dataset.k ? document.getElementById(svg.dataset.k) : null;
  const paths = layers.map((L) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', L.c);
    p.setAttribute('stroke-width', L.w);
    p.setAttribute('stroke-opacity', L.o);
    svg.appendChild(p);
    return p;
  });
  const draw = (d) => {
    layers.forEach((L, i) => paths[i].setAttribute('d', rhodonea(cx, cy, R * L.s, L.k + d, L.ph, 9, 1800)));
    if (readout) readout.textContent = (layers[0].k + d).toFixed(3);
  };
  if (reduced) { draw(seed); svg.dataset.motion = 'static'; return; }
  svg.dataset.motion = 'live';
  let on = true, t0 = performance.now(), frame = 0;
  const loop = (now) => {
    if (on && (frame++ & 1)) draw(drift(seed, now - t0));
    requestAnimationFrame(loop);
  };
  draw(seed);
  new IntersectionObserver(([e]) => { on = e.isIntersecting && !document.hidden; }).observe(svg);
  document.addEventListener('visibilitychange', () => { on = !document.hidden; });
  requestAnimationFrame(loop);
}

/* ---- the dove ---------------------------------------------------------
   Once per sequence, final surface only. Roses sampled on a hex grid,
   kept only inside the silhouette, shrunk toward the edge so the figure
   cuts clean. Clipped, never drawn. ------------------------------------- */
function dove(svg) {
  const STEP = 5, RAD = 3.1, col = svg.dataset.dove;
  const cv = document.createElement('canvas');
  cv.width = 260; cv.height = 180;
  const ctx = cv.getContext('2d');
  const P = new Path2D(DOVE_PATH);
  const g = document.createElementNS(NS, 'g');
  for (let y = 1; y < 180; y += STEP * 0.87) {
    const row = Math.round(y / (STEP * 0.87));
    for (let x = 1; x < 262; x += STEP) {
      const px = x + (row % 2 ? STEP / 2 : 0);
      if (!ctx.isPointInPath(P, px, y)) continue;
      let inside = 0;
      for (let a = 0; a < 8; a++) {
        const th = (a * Math.PI) / 4;
        if (ctx.isPointInPath(P, px + Math.cos(th) * RAD * 1.15, y + Math.sin(th) * RAD * 1.15)) inside++;
      }
      const f = inside / 8;
      const k = 3 + Math.round((px * 0.031 + y * 0.047) % 4) * 2;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', rhodonea(px, y, RAD * (0.3 + 0.7 * f), k, (px + y) * 0.11, 1, 150));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', col);
      p.setAttribute('stroke-width', (0.3 + 0.16 * f).toFixed(2));
      p.setAttribute('stroke-opacity', (0.55 + 0.42 * f).toFixed(2));
      g.appendChild(p);
    }
  }
  svg.appendChild(g);
}

/* ---- the flex is the axis, live ----------------------------------------
   Width axis driven by scroll (data-flex="scroll") or cursor proximity
   (data-flex="cursor"), so the type physically changes shape as a person
   moves. Only the custom property changes; the CSS owns the rest. -------- */
function flex() {
  const els = [...document.querySelectorAll('[data-flex]')];
  if (!els.length || reduced) return;
  const set = (el, v) => el.style.setProperty('--wdth', Math.max(75, Math.min(100, v)).toFixed(1));
  const scrollers = els.filter((e) => e.dataset.flex === 'scroll');
  const hovers = els.filter((e) => e.dataset.flex === 'cursor');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = Math.min(1, scrollY / (innerHeight * 0.8));
      scrollers.forEach((el) => set(el, 75 + 25 * p));
      ticking = false;
    });
  };
  if (scrollers.length) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
  if (hovers.length && matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', (e) => {
      for (const el of hovers) {
        const r = el.getBoundingClientRect();
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        const d = Math.hypot(dx, dy);
        set(el, 100 - 25 * Math.min(1, d / 320));
      }
    }, { passive: true });
  }
}

document.querySelectorAll('svg[data-rose]').forEach(field);
document.querySelectorAll('svg[data-dove]').forEach(dove);
flex();
