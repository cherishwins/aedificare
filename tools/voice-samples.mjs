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
 *       (v4 Turbo first). Needs ELEVENLABS_API_KEY; about 2,000 of a free
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
const XI = process.env.ELEVENLABS_API_KEY;
if (ONLY.includes('eleven') && !XI) console.log('ELEVENLABS_API_KEY not set: no ElevenLabs sample');
if (ONLY.includes('eleven') && XI) {
  const EL = 'https://api.elevenlabs.io/v1';
  const xi = async (p, body, raw = false) => {
    const r = await fetch(`${EL}/${p}`, body ? { method: 'POST', headers: { 'xi-api-key': XI, 'content-type': 'application/json' }, body: JSON.stringify(body) } : { headers: { 'xi-api-key': XI } });
    if (!r.ok) throw new Error(`${p} ${r.status}: ${(await r.text()).slice(0, 1500)}`);
    return raw ? Buffer.from(await r.arrayBuffer()) : r.json();
  };
  // The same description the Gemini analyst was designed from, so the comparison is the engine, not the brief.
  const ANALYST = 'A man in his forties with a low, dry, unhurried voice and crisp diction: a financial analyst who finds the numbers quietly absurd and never raises his voice about it. Neutral international English accent. An original voice, not modelled on any real person.';
  try {
    const models = await xi('models');
    const tts = models.filter((m) => m.can_do_text_to_speech !== false).map((m) => m.model_id);
    console.log(`ElevenLabs models: ${tts.join(', ')}`);
    const pick = tts.find((m) => /v4/i.test(m) && /turbo/i.test(m)) || tts.find((m) => /v4/i.test(m)) || tts.find((m) => /eleven_v3$/.test(m)) || 'eleven_multilingual_v2';
    const design = await xi('text-to-voice/design', { voice_description: ANALYST, model_id: 'eleven_ttv_v3', text: TEXT.slice(0, 1000) });
    const prev = design.previews?.[0];
    if (!prev?.generated_voice_id) throw new Error(`no preview: ${JSON.stringify(design).slice(0, 400)}`);
    const saved = await xi('text-to-voice', { voice_name: 'aedificare-analyst', voice_description: ANALYST, generated_voice_id: prev.generated_voice_id });
    const vid = saved.voice_id;
    if (!vid) throw new Error(`no voice id: ${JSON.stringify(saved).slice(0, 400)}`);
    const audio = await xi(`text-to-speech/${vid}?output_format=mp3_44100_128`, { text: TEXT, model_id: pick }, true);
    const name = `11-elevenlabs-designed-analyst-${pick}`;
    fs.writeFileSync(path.join(OUT, `${name}.mp3`), audio);
    index.push(`${name}.mp3  ElevenLabs ${pick}, DESIGNED voice "analyst" (id ${vid}), the same description as the Gemini analyst (09): ${ANALYST}`);
    console.log(`  ${name}: done`);
  } catch (e) { console.error(`  ElevenLabs: ${e.message}`); }
}

const INDEX = ONLY.length === 3 ? 'index.txt' : `index-${ONLY.join('-')}.txt`;
fs.writeFileSync(path.join(OUT, INDEX), [`Passage (${TEXT.split(/\s+/).length} words), from source/film/edition-03.md:`, '', TEXT, '', 'Files:', ...index, ''].join('\n'));
console.log(`\n${index.length} samples in ${OUT} (${INDEX})`);
if (!index.length) process.exit(1);
