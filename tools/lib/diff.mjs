/** Shared by tools/film-meta.mjs and tools/youtube-channel.mjs, so a dry run shows a description change line by line. */

/** A line diff of a against b, as - and + lines around the unchanged ones (longest common subsequence). */
export function lineDiff(a, b) {
  const x = String(a ?? '').split('\n'), y = String(b ?? '').split('\n');
  const L = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < x.length || j < y.length) {
    if (i < x.length && j < y.length && x[i] === y[j]) { out.push(`  ${x[i]}`); i++; j++; }
    else if (j < y.length && (i === x.length || L[i][j + 1] >= L[i + 1][j])) out.push(`+ ${y[j++]}`);
    else out.push(`- ${x[i++]}`);
  }
  return out.join('\n');
}
