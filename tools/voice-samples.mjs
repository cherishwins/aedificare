/**
 * Listening samples for choosing the channel's voice. The same passage, the
 * cover and the first two paragraphs of section 00 of The Markup's film
 * script (source/film/edition-03.md, about 45 seconds), read by:
 *
 *   01 Kokoro-82M am_michael, the current voice, as the control (tools/narrate.py)
 *   02+ Gemini 3.8 Flash TTS (gemini-3.8-flash-tts), prebuilt voices with a
 *       deadpan style prompt, and two voices DESIGNED from a written
 *       description, never replicated from a recording: a cloned voice is
 *       the one thing the channel may not use (CLAUDE.md, override 6)
 *
 *   11  ElevenLabs (2026-10-17, the owner asking whether the leaderboard's #1
 *       is worth paying for): a voice DESIGNED from the same description as
 *       the Gemini analyst (text-to-voice, never a clone), saved, then the
 *       same passage read by the best text-to-speech model the account lists
 *       (v4 Turbo first), designed with a fixed seed so a second account can
 *       rebuild the same voice. Needs ELEVENLABS_API_KEY_TEST (the free
 *       account) or ELEVENLABS_API_KEY (the paid one); about 2,000 of a free
 *       plan's 10,000 monthly credits. A free plan has no commercial rights,
 *       so this is a listening test and never a published voice.
 *
 *   node tools/voice-samples.mjs [--out brand/voice-samples] [--only kokoro,gemini,eleven]
 *
 * Writes one .mp3 per voice and index.txt (what each file is, and the id of
 * each designed voice, which lives in the Google project for a year after
 * its last use and is what a chosen voice is reused by). Gemini needs
 * GEMINI_API_KEY (an AI Studio key on the owner's Google Cloud project);
 * without it only the control is made. The request shape is the Interactions
 * API as documented at ai.google.dev/gemini-api/docs/speech-generation and
 * ai.google.dev/api/voices on 2026-10-17; any refusal is printed whole so
 * the run's log says what to change.
 *
 * Why Gemini first: of the voices that pass the channel's rules (commercial
 * use, no clone, word timing by forced alignment), it ranked within reach of
 * the best on the Artificial Analysis arena at about a quarter of a dollar a
 * film, and the owner already has the Google Cloud project. The research is
 * in CLAUDE.md, Open 9.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const OUT = arg('--out', 'brand/voice-samples');
const ONLY = arg('--only', 'kokoro,gemini,eleven').split(',');
// --eleven-voice "<description>" --label <name> designs another ElevenLabs voice; --previews writes the three
// candidates the design returns (each already reading the passage) instead of saving one, so a brief is heard
// three ways for the price of one design and no voice slot is spent until one is chosen.
const ELEVEN_VOICE = arg('--eleven-voice', '');
const LABEL = arg('--label', 'analyst').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
const PREVIEWS = process.argv.includes('--previews');
// --save <generated_voice_id> keeps a chosen design candidate as a voice in the account and reads the passage with it.
const SAVE = arg('--save', '');
fs.mkdirSync(OUT, { recursive: true });

/* ---- the passage: cover + the first two paragraphs of section 00 ---------- */
const src = fs.readFileSync('source/film/edition-03.md', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const section = (h) => src.split(/^## /m).find((s) => s.startsWith(h)).split('\n').slice(1).map((l) => l.trim()).join('\n').split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
const PARAS = [...section('Cover'), ...section('00').slice(0, 2)];
const TEXT = PARAS.join('\n\n');
console.log(`passage: ${TEXT.split(/\s+/).length} words`);

const index = [];
const mp3 = (wav, name) => {
  const to = path.join(OUT, `${name}.mp3`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '3', to]);
  return to;
};

/* ---- 01: the control ------------------------------------------------------- */
if (ONLY.includes('kokoro')) try {
  const dir = path.join(OUT, 'kokoro');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'script.json'), JSON.stringify({ voice: 'am_michael', blocks: PARAS.map((text, i) => ({ i, kind: 'p', read: true, text })) }));
  execFileSync('uv', ['run', 'tools/narrate.py', dir], { stdio: 'inherit' });
  mp3(path.join(dir, 'narration.wav'), '01-kokoro-am_michael');
  index.push('01-kokoro-am_michael.mp3  Kokoro-82M am_michael, the current voice (control)');
} catch (e) { console.error('control: Kokoro failed:', e.message); }

/* ---- Gemini ---------------------------------------------------------------- */
const KEY = process.env.GEMINI_API_KEY;
if (!ONLY.includes('gemini')) {
  // skipped by --only
} else if (!KEY) {
  console.log('GEMINI_API_KEY not set: the control only');
} else {
  const API = 'https://generativelanguage.googleapis.com/v1beta';
  const MODEL = 'gemini-3.8-flash-tts';
  const call = async (p, body) => {
    const r = await fetch(`${API}/${p}`, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const text = await r.text();
    if (!r.ok) throw new Error(`${p} ${r.status}: ${text.slice(0, 2000)}`);
    return JSON.parse(text);
  };
  // The delivery, said once and used for every Gemini voice so the comparison is the voice and not the direction.
  const STYLE = 'Dry, deadpan documentary narration. Measured and unhurried, precise on every number, no enthusiasm and no upward inflection; let the understatement land with a small pause before the last clause of a joke. Never theatrical.';
  const speak = async (voice, name, label) => {
    try {
      const res = await call('interactions', {
        model: MODEL,
        input: [{ type: 'user_input', content: [{ type: 'text', text: TEXT, annotations: [{ type: 'speech_metadata', style: STYLE }] }] }],
        response_format: { type: 'audio' },
        generation_config: { speech_config: [{ voice }] },
      });
      const audio = (res.steps || []).filter((s) => s.type === 'model_output').flatMap((s) => s.content || []).find((c) => c.type === 'audio');
      if (!audio?.data) throw new Error(`no audio in the reply: ${JSON.stringify(res).slice(0, 600)}`);
      const wav = path.join(OUT, `${name}.wav`);
      fs.writeFileSync(wav, Buffer.from(audio.data, 'base64'));
      mp3(wav, name);
      fs.rmSync(wav);
      index.push(`${name}.mp3  ${label}`);
      console.log(`  ${name}: done`);
    } catch (e) { console.error(`  ${name}: ${e.message}`); }
  };

  // Prebuilt voices worth hearing for a low, even, dry read; a name the catalogue lacks is reported and skipped.
  const PREBUILT = [['Charon', 'informative'], ['Iapetus', 'clear'], ['Algenib', 'gravelly'], ['Schedar', 'even'], ['Sadaltager', 'knowledgeable'], ['Gacrux', 'mature'], ['Kore', 'firm']];
  let n = 2;
  for (const [v, note] of PREBUILT) await speak(v, `${String(n++).padStart(2, '0')}-gemini-${v.toLowerCase()}`, `Gemini 3.8 Flash TTS, prebuilt voice ${v} (${note}), deadpan style`);

  // Designed voices: a description, never a recording. Each is stored in the Google project (a year after its last use) and reused by its id.
  const DESIGNS = [
    ['analyst', 'A man in his forties with a low, dry, unhurried voice and crisp diction: a financial analyst who finds the numbers quietly absurd and never raises his voice about it. Neutral international English accent. An original voice, not modelled on any real person.'],
    ['archivist', 'A woman in her thirties with a cool, low, precise voice: a documentary narrator who lets the numbers carry the joke, understated and steady, a faint smile audible only at the end of a sentence. Neutral international English accent. An original voice, not modelled on any real person.'],
  ];
  for (const [label, input] of DESIGNS) {
    try {
      const v = await call('voices', { store: true, voice: { type: 'prompted', prompted: { input }, display_name: `aedificare-${label}`, description: input } });
      if (!v.id) throw new Error(`no voice id: ${JSON.stringify(v).slice(0, 400)}`);
      await speak(v.id, `${String(n++).padStart(2, '0')}-gemini-designed-${label}`, `Gemini 3.8 Flash TTS, DESIGNED voice "${label}" (id ${v.id}), deadpan style. Description: ${input}`);
    } catch (e) { console.error(`  designed ${label}: ${e.message}`); }
  }
}

/* ---- 11: ElevenLabs -------------------------------------------------------- */
// The free account's key for listening tests (a free plan has no commercial rights), the paid one otherwise.
const XI = process.env.ELEVENLABS_API_KEY_TEST || process.env.ELEVENLABS_API_KEY;
if (ONLY.includes('eleven') && !XI) console.log('ELEVENLABS_API_KEY not set: no ElevenLabs sample');
if (ONLY.includes('eleven') && XI) {
  const EL = 'https://api.elevenlabs.io/v1';
  const xi = async (p, body, raw = false) => {
    const r = await fetch(`${EL}/${p}`, body ? { method: 'POST', headers: { 'xi-api-key': XI, 'content-type': 'application/json' }, body: JSON.stringify(body) } : { headers: { 'xi-api-key': XI } });
    if (!r.ok) throw new Error(`${p} ${r.status}: ${(await r.text()).slice(0, 1500)}`);
    return raw ? Buffer.from(await r.arrayBuffer()) : r.json();
  };
  // The same description the Gemini analyst was designed from, so the comparison is the engine, not the brief.
  const ANALYST = ELEVEN_VOICE || 'A man in his forties with a low, dry, unhurried voice and crisp diction: a financial analyst who finds the numbers quietly absurd and never raises his voice about it. Neutral international English accent. An original voice, not modelled on any real person.';
  try {
    // What the account has used, before and after, so a run says what a character costs on this plan.
    const used = async () => { try { const u = await xi('user/subscription'); return u; } catch (e) { console.error(`  subscription: ${e.message.slice(0, 200)}`); return null; } };
    const before = await used();
    if (before) console.log(`ElevenLabs plan ${before.tier}: ${before.character_count} of ${before.character_limit} credits used, resets ${new Date(before.next_character_count_reset_unix * 1000).toISOString().slice(0, 10)}`);
    const models = await xi('models');
    const tts = models.filter((m) => m.can_do_text_to_speech !== false).map((m) => m.model_id);
    console.log(`ElevenLabs models: ${tts.join(', ')}`);
    const pick = tts.find((m) => /v4/i.test(m) && /turbo/i.test(m)) || tts.find((m) => /v4/i.test(m)) || tts.find((m) => /eleven_v3$/.test(m)) || 'eleven_multilingual_v2';
    // A fixed seed: the same description, model and seed design the same voice, so the paid account can rebuild
    // exactly the voice this test designs on the free one (designed voices are stored per account).
    const design = SAVE ? { previews: [{ generated_voice_id: SAVE }] } : await xi('text-to-voice/design', { voice_description: ANALYST, model_id: 'eleven_ttv_v3', text: TEXT.slice(0, 1000), seed: 20261017 });
    const prev = design.previews?.[0];
    if (!prev?.generated_voice_id) throw new Error(`no preview: ${JSON.stringify(design).slice(0, 400)}`);
    if (PREVIEWS) {
      design.previews.forEach((p, k) => {
        const name = `12-elevenlabs-${LABEL}-preview-${k + 1}`;
        fs.writeFileSync(path.join(OUT, `${name}.mp3`), Buffer.from(p.audio_base_64, 'base64'));
        index.push(`${name}.mp3  ElevenLabs voice design (eleven_ttv_v3), candidate ${k + 1} of ${design.previews.length}, generated_voice_id ${p.generated_voice_id} (saved only once chosen): ${ANALYST}`);
        console.log(`  ${name}: done (${p.duration_secs ?? '?'} s, ${p.media_type || 'audio'})`);
      });
      throw Object.assign(new Error('previews written'), { done: true });
    }
    const saved = await xi('text-to-voice', { voice_name: `aedificare-${LABEL}`, voice_description: ANALYST, generated_voice_id: prev.generated_voice_id });
    const vid = saved.voice_id;
    if (!vid) throw new Error(`no voice id: ${JSON.stringify(saved).slice(0, 400)}`);
    const audio = await xi(`text-to-speech/${vid}?output_format=mp3_44100_128`, { text: TEXT, model_id: pick }, true);
    const after = await used();
    if (before && after) console.log(`ElevenLabs: ${after.character_count - before.character_count} credits for ${TEXT.length} characters on ${pick}${SAVE ? '' : ' plus the design'}; ${after.character_limit - after.character_count} left`);
    const name = `11-elevenlabs-designed-${LABEL}-${pick}`;
    fs.writeFileSync(path.join(OUT, `${name}.mp3`), audio);
    index.push(`${name}.mp3  ElevenLabs ${pick}, DESIGNED voice "analyst" (id ${vid}), the same description as the Gemini analyst (09): ${ANALYST}`);
    console.log(`  ${name}: done`);
  } catch (e) { if (!e.done) console.error(`  ElevenLabs: ${e.message}`); }
}

/* ---- 13: the narration engine itself, on the passage ---------------------------------------------------------------
 * --only narrate with NARRATOR set runs tools/narrate.py exactly as a film does, on the passage's blocks, so a new
 * engine is proved against the real API on 45 seconds before a film spends its credits on it. */
if (ONLY.includes('narrate')) {
  try {
    const dir = path.join(OUT, 'narrate');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'script.json'), JSON.stringify({ voice: 'am_michael', blocks: PARAS.map((text, i) => ({ i, kind: i === 0 ? 'title' : 'p', read: true, text })) }));
    execFileSync('uv', ['run', 'tools/narrate.py', dir], { stdio: 'inherit' });
    const N = JSON.parse(fs.readFileSync(path.join(dir, 'narration.json'), 'utf8'));
    const name = `13-narrate-${String(process.env.NARRATOR || 'kokoro').replace(/[^a-z0-9]+/gi, '-')}`;
    mp3(path.join(dir, 'narration.wav'), name);
    const words = N.blocks.flatMap((b) => b.words);
    index.push(`${name}.mp3  tools/narrate.py with NARRATOR=${process.env.NARRATOR}: ${N.model} ${N.voice}, ${N.duration} s, ${words.length} words timed; first words ${words.slice(0, 6).map((w) => `${w.w}@${w.s}`).join(' ')}`);
  } catch (e) { console.error(`  narrate: ${e.message}`); }
}

const INDEX = ONLY.length === 3 ? 'index.txt' : `index-${ONLY.join('-')}${LABEL !== 'analyst' ? `-${LABEL}` : ''}.txt`;
fs.writeFileSync(path.join(OUT, INDEX), [`Passage (${TEXT.split(/\s+/).length} words), from source/film/edition-03.md:`, '', TEXT, '', 'Files:', ...index, ''].join('\n'));
console.log(`\n${index.length} samples in ${OUT} (${INDEX})`);
if (!index.length) process.exit(1);
