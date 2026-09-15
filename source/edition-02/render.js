const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///home/claude/ed02/ed02.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(900);

  // DETERMINISTIC OVERFLOW ASSERTION — this brand has no boxes, so the
  // failure mode is content exceeding a fixed page, not a split border.
  const bad = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((pg, i) => {
      const pr = pg.getBoundingClientRect();
      pg.querySelectorAll('*').forEach(el => {
        if (el.tagName === 'IMG' || el.classList.contains('crop')) return;              // roses crop by design
        const r = el.getBoundingClientRect();
        if (r.height === 0) return;
        if (r.bottom > pr.bottom + 0.5 || r.top < pr.top - 0.5 ||
            r.right > pr.right + 0.5 || r.left < pr.left - 24) {
          out.push(`page ${i+1}: <${el.tagName}.${el.className}> "${(el.textContent||'').trim().slice(0,42)}"`);
        }
      });
      // roses are absolutely positioned and crop by design (overflow:hidden)
      let maxB = 0;
      [...pg.children].forEach(c => { if (c.classList.contains('rose')) return;
        maxB = Math.max(maxB, c.getBoundingClientRect().bottom - pr.top); });
      if (maxB > pg.clientHeight + 1)
        out.push(`page ${i+1}: CONTENT OVERFLOW ${maxB.toFixed(0)} > ${pg.clientHeight}`);
    });
    return out;
  });
  console.log(bad.length ? 'OVERFLOW DEFECTS:\n' + bad.join('\n') : 'ASSERT PASS: no overflow');

  await p.pdf({ path: 'aedificare-edition-02.pdf', format: 'A4', printBackground: true,
                margin: { top:'0', bottom:'0', left:'0', right:'0' } });
  await b.close();
})();
