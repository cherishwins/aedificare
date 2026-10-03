#!/usr/bin/env node
/**
 * The dependency audit, with an allowlist that expires.
 *
 * `npm audit --audit-level=high` was the gate until 2026-10-03, when
 * GHSA-ch52-4w7c-c8xp landed on http-cache-semantics, every version ever
 * published, with no patched release and astro depending on it. npm's only
 * offer was astro 2, a downgrade of five majors. A gate that can only be
 * passed by breaking the site, or by turning the gate off, is not a gate.
 *
 * So this runs `npm audit --json` and fails on every high or critical
 * advisory except those in tools/audit-allowlist.json, where each entry
 * carries the advisory id, the package, why it does not reach this site,
 * and an `until` date. Past that date the entry fails the build again, so
 * an exemption is a decision that must be renewed, with the reason
 * re-read, never a line that quietly outlives its excuse.
 *
 *   node tools/check-audit.cjs
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const LEVELS = ['high', 'critical'];
const file = path.join(__dirname, 'audit-allowlist.json');
const allow = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const today = new Date().toISOString().slice(0, 10);

const r = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 1 << 24 });
let report;
try { report = JSON.parse(r.stdout); } catch { console.error('check-audit: npm audit produced no JSON\n' + (r.stderr || '').slice(-800)); process.exit(1); }

const failures = [];
const used = new Set(), seen = new Set();
for (const [name, v] of Object.entries(report.vulnerabilities || {})) {
  if (!LEVELS.includes(v.severity)) continue;
  // Advisories are listed on the package that carries them; a dependant (astro here) is listed `via` that package by name.
  const advisories = v.via.filter((x) => typeof x === 'object');
  if (!advisories.length) continue;
  for (const a of advisories) {
    const id = (a.url || '').split('/').pop();
    const entry = allow.find((e) => e.id === id && e.package === name);
    if (entry) seen.add(entry.id);
    if (!entry) { failures.push(`${name}: ${a.title} (${a.severity}) ${a.url}`); continue; }
    if (!entry.until || entry.until < today) { failures.push(`${name}: ${id} is allowlisted until ${entry.until || 'no date'}, which has passed; re-read the reason and renew or fix`); continue; }
    if (!entry.reason || entry.reason.length < 40) { failures.push(`${name}: ${id} is allowlisted without a reason`); continue; }
    used.add(entry.id);
    console.log(`check-audit: ${name} ${id} allowed until ${entry.until}: ${entry.reason}`);
  }
}
for (const e of allow) if (!seen.has(e.id)) console.log(`check-audit: allowlist entry ${e.id} (${e.package}) no longer matches an advisory; remove it`);
if (failures.length) { console.error('check-audit: FAIL\n  ' + failures.join('\n  ')); process.exit(1); }
const n = Object.values(report.vulnerabilities || {}).filter((v) => LEVELS.includes(v.severity)).length;
console.log(`check-audit: clean (${n} high or critical advisories, ${used.size} allowed)`);
