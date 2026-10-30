#!/usr/bin/env node
/**
 * IndexNow (30 Oct 2026): tell Bing, Yandex, Seznam, Naver and the rest which
 * pages changed on main, once they are live. Run by
 * .github/workflows/indexnow.yml; nothing here runs in the build.
 *
 *   node tools/indexnow.mjs urls <from-sha> <to-sha>   print the changed URLs, one a line
 *   node tools/indexnow.mjs ready                       can the key be read on the origin itself?
 *   node tools/indexnow.mjs post <file>                 POST the URLs in <file>
 *
 * Which URLs: a published edition whose page (src/pages/<slug>.astro) changed,
 * whose entry in src/lib/editions.mjs changed (its title, dek, dates, a
 * correction's `modified`) or whose film in src/lib/films.json changed; the
 * home when its page changed, or any published entry or film did, because
 * the home shows each one's title, lede, contents and film. A span whose start
 * cannot be read (the first run, a force push, a record the cache lost) sends
 * every published page. The workflow passes the span from the last commit
 * whose pages were sent to the commit that is live, never one push's own
 * diff, so a push whose run was cancelled, superseded or refused is sent with
 * the next.
 *
 * `ready` and `post` write their verdict to $GITHUB_OUTPUT (ready=, sent=)
 * when it is set. Only a request IndexNow calls ours to fix (400, 403, 422)
 * fails; a 429, a 5xx, a timeout or no connection is a warning, and the pages
 * wait for the next run.
 *
 * The key is public by design (IndexNow proves a host by a file on it): the
 * one file public/<32 hex>.txt, whose body is its own name. It must answer
 * 200 on the origin itself, with no redirect, or IndexNow cannot read it
 * there: while the apex 308s to www (CLAUDE.md, Open 1) `ready` says so and
 * nothing is sent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { PRODUCTION_ORIGIN as ORIGIN } from '../src/config.mjs';

const HOST = new URL(ORIGIN).host;
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });
const output = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };

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
  const all = ['/', ...now0.map((e) => e.path)];
  const known = before && !/^0+$/.test(before) && (() => { try { git('cat-file', '-e', `${before}^{commit}`); return true; } catch { return false; } })();
  if (!known) return all.map(url);
  const changed = git('diff', '--name-only', before, after, '--', 'src/pages', 'src/lib/editions.mjs', 'src/lib/films.json').split('\n').filter(Boolean);
  const out = new Set();
  for (const f of changed) {
    const m = f.match(/^src\/pages\/([a-z0-9-]+)\.astro$/);
    if (!m) continue;
    if (m[1] === 'index') out.add('/');
    const e = now0.find((x) => x.slug === m[1]);
    if (e) out.add(e.path);
  }
  let now = now0;
  if (changed.includes('src/lib/editions.mjs')) {
    // The list as it was and as it is at the two commits, each read beside the checkout's own so its imports resolve.
    const at = async (sha) => {
      const f = `src/lib/.editions-${sha.slice(0, 12)}.mjs`;
      fs.writeFileSync(f, git('show', `${sha}:src/lib/editions.mjs`));
      try { return await loadEditions(f); } catch { return null; } finally { fs.rmSync(f, { force: true }); }
    };
    const was = await at(before);
    now = (await at(after)) ?? now0;
    if (!was) all.forEach((p) => out.add(p));
    else {
      const key = (e) => JSON.stringify(e);
      for (const e of now) {
        const prev = was.find((x) => x.slug === e.slug);
        // The home lists every published edition's title, lede, contents and record, so any change to one is the home's too.
        if (!prev || key(prev) !== key(e)) { out.add(e.path); out.add('/'); }
      }
      if (key(was.map((e) => e.slug)) !== key(now.map((e) => e.slug))) out.add('/');
    }
  }
  if (changed.includes('src/lib/films.json')) {
    const read = (sha) => { try { return JSON.parse(git('show', `${sha}:src/lib/films.json`)); } catch { return {}; } };
    const was = read(before), is = read(after);
    for (const e of now) {
      if (JSON.stringify(was[e.slug] ?? null) !== JSON.stringify(is[e.slug] ?? null)) { out.add(e.path); out.add('/'); }
    }
  }
  return [...out].map(url);
}

/** The key file and the home must answer 200 on the origin itself: IndexNow reads the key on the host it is given. */
async function ready() {
  const key = keyFile();
  const why = [];
  for (const [u, body] of [[`${ORIGIN}/${key}.txt`, key], [`${ORIGIN}/`, null]]) {
    try {
      const res = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
      if (res.status !== 200) why.push(`${u} answers ${res.status}${res.headers.get('location') ? ` to ${res.headers.get('location')}` : ''}`);
      else if (body && (await res.text()).trim() !== body) why.push(`${u} does not hold the key`);
    } catch (err) { why.push(`${u}: ${err.message}`); }
  }
  if (why.length) {
    for (const w of why) console.log(`::warning::${w}; IndexNow not sent (CLAUDE.md, Open 1: the apex must serve, not redirect)`);
    output('ready', 'false');
    return;
  }
  console.log(`indexnow: ${ORIGIN} serves the key and the home with no redirect`);
  output('ready', 'true');
}

async function post(file) {
  const list = fs.readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  if (!list.length) { console.log('indexnow: no published page changed; nothing sent'); output('sent', 'true'); return; }
  for (const u of list) if (!u.startsWith(`${ORIGIN}/`)) throw new Error(`indexnow: ${u} is not on ${ORIGIN}`);
  const key = keyFile();
  const body = { host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: list };
  let res;
  try {
    res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    // No answer at all is the service's or the network's, like a 5xx: the pages wait for the next run.
    console.log(`::warning::IndexNow could not be reached (${err.cause?.code ?? err.message}); the ${list.length} page(s) go with the next run`);
    output('sent', 'false');
    return;
  }
  console.log(`indexnow: HTTP ${res.status} for ${list.length} URL(s)`);
  for (const u of list) console.log(`  ${u}`);
  // 200 and 202 are accepted. 400, 403 and 422 mean the request or the key is wrong, which is ours to fix. A 429
  // or a 5xx is the service's, and the next run sends these pages again, since nothing records them as sent.
  if ([400, 403, 422].includes(res.status)) { console.error(await res.text()); output('sent', 'false'); process.exit(1); }
  if (res.status >= 300) { console.log(`::warning::IndexNow answered ${res.status}; the pages go with the next run`); output('sent', 'false'); return; }
  output('sent', 'true');
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'urls') console.log((await urls(a, b)).join('\n'));
else if (cmd === 'post') await post(a);
else if (cmd === 'ready') await ready();
else if (cmd === 'key') console.log(keyFile());
else { console.error('usage: indexnow.mjs urls <from> <to> | ready | post <file> | key'); process.exit(2); }
