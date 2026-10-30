#!/usr/bin/env node
/**
 * IndexNow (30 Oct 2026): tell Bing, Yandex, Seznam, Naver and the rest which
 * pages a push to main changed, once the push is live. Run by
 * .github/workflows/indexnow.yml; nothing here runs in the build.
 *
 *   node tools/indexnow.mjs urls <before-sha> <after-sha>   print the changed URLs, one a line
 *   node tools/indexnow.mjs post <file>                     POST the URLs in <file>
 *
 * Which URLs: a published edition whose page (src/pages/<slug>.astro) changed,
 * or whose entry in src/lib/editions.mjs changed (its title, dek, dates, a
 * correction's `modified`); the home when its page changed or the published
 * list did. A push before which the editions list cannot be read (the first
 * push, a force push to an unknown commit) sends every published page.
 *
 * The key is public by design (IndexNow proves a host by a file on it): the
 * one file public/<32 hex>.txt, whose body is its own name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const HOST = 'aedificare.art';
const ORIGIN = `https://${HOST}`;
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });

export const keyFile = () => {
  const f = fs.readdirSync('public').filter((x) => /^[0-9a-f]{32}\.txt$/.test(x));
  if (f.length !== 1) throw new Error(`indexnow: ${f.length} key files in public/, not one`);
  const key = f[0].slice(0, 32);
  if (fs.readFileSync(path.join('public', f[0]), 'utf8').trim() !== key) throw new Error(`indexnow: public/${f[0]} does not hold its own name`);
  return key;
};

const loadEditions = async (file) => (await import(pathToFileURL(path.resolve(file)).href + `?t=${Date.now()}`)).PUBLISHED;
const url = (p) => (p === '/' ? `${ORIGIN}/` : ORIGIN + p);

async function urls(before, after) {
  const now0 = await loadEditions('src/lib/editions.mjs');
  const now = now0;
  const all = ['/', ...now.map((e) => e.path)];
  const known = before && !/^0+$/.test(before) && (() => { try { git('cat-file', '-e', `${before}^{commit}`); return true; } catch { return false; } })();
  if (!known) return all.map(url);
  const changed = git('diff', '--name-only', before, after, '--', 'src/pages', 'src/lib/editions.mjs').split('\n').filter(Boolean);
  const out = new Set();
  for (const f of changed) {
    const m = f.match(/^src\/pages\/([a-z0-9-]+)\.astro$/);
    if (!m) continue;
    if (m[1] === 'index') out.add('/');
    const e = now.find((x) => x.slug === m[1]);
    if (e) out.add(e.path);
  }
  if (changed.includes('src/lib/editions.mjs')) {
    // The list as it was and as it is at the two commits, each read beside the checkout's own so its imports resolve.
    const at = async (sha) => {
      const f = `src/lib/.editions-${sha.slice(0, 12)}.mjs`;
      fs.writeFileSync(f, git('show', `${sha}:src/lib/editions.mjs`));
      try { return await loadEditions(f); } catch { return null; } finally { fs.rmSync(f, { force: true }); }
    };
    const was = await at(before);
    const now = (await at(after)) ?? now0;
    if (!was) all.forEach((p) => out.add(p));
    else {
      const key = (e) => JSON.stringify(e);
      for (const e of now) {
        const prev = was.find((x) => x.slug === e.slug);
        if (!prev || key(prev) !== key(e)) out.add(e.path);
      }
      if (key(was.map((e) => e.slug)) !== key(now.map((e) => e.slug))) out.add('/');
    }
  }
  return [...out].map(url);
}

async function post(file) {
  const list = fs.readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  if (!list.length) { console.log('indexnow: no published page changed; nothing sent'); return; }
  for (const u of list) if (!u.startsWith(`${ORIGIN}/`)) throw new Error(`indexnow: ${u} is not on ${ORIGIN}`);
  const key = keyFile();
  const body = { host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: list };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body),
  });
  console.log(`indexnow: HTTP ${res.status} for ${list.length} URL(s)`);
  for (const u of list) console.log(`  ${u}`);
  // 200 and 202 are accepted. 400, 403 and 422 mean the request or the key is wrong, which is ours to fix. A 429
  // or a 5xx is the service's, and the next push sends again.
  if ([400, 403, 422].includes(res.status)) { console.error(await res.text()); process.exit(1); }
  if (res.status >= 300) console.log(`::warning::IndexNow answered ${res.status}; the pages go with the next push`);
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'urls') console.log((await urls(a, b)).join('\n'));
else if (cmd === 'post') await post(a);
else if (cmd === 'key') console.log(keyFile());
else { console.error('usage: indexnow.mjs urls <before> <after> | post <file> | key'); process.exit(2); }
