import { watchUrl } from './youtube.js';

const CLIP_PLAN = `Berikan 10 Clip Plan yang berpotensi mendatangkan viewer, likes, follower di Tiktok dari __URL__ dengan format:
{
  "video_title": "Title Video",
  "video_spekar" : "Ustadz xxx",
  "source_url": "__URL__",
  "clips": [
    {
      "id": "cxx",
      "part": "xx",
      "title": "Judul Content",
      "kicker": "Kicker Content",
      "hook": "Hook Content",
      "source_start": "xx:xx",
      "source_end": "xx:xx",
      "subtitles": [
        ["00:00:00.000","00:00:00.390","Abcd"],
        ["00:00:00.400","00:00:02.670","defg"]
        ...
      ]
    }
  ]
}`;

const EFFECTCRAFT = `Buatkan Clip Video dengan effectcraft-from-opendesign dari __URL__

// sisipkan disini
<Pallete warna>
__PALETTE__

<Layout video>
__LAYOUT__

Dengan clip-plan:
__PLAN__`;

export const NO_OVERRIDE = '(pakai bawaan MASTER PROMPT apa adanya)';

export const clipPlanPrompt = (id) => CLIP_PLAN.replaceAll('__URL__', watchUrl(id));

export const effectcraftPrompt = (id, planText, palette = '', layout = '') =>
  EFFECTCRAFT.replace('__URL__', `https://youtube.com/watch?v=${id}`)
    .replace('__PALETTE__', () => palette.trim() || NO_OVERRIDE)
    .replace('__LAYOUT__', () => layout.trim() || NO_OVERRIDE)
    .replace('__PLAN__', () => planText);

function sliceObject(text) {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

/** Terima JSON mentah, blok ```json, atau balasan AI yang memuat JSON. */
export function parseClipPlan(input) {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  for (const candidate of [raw, fenced, sliceObject(raw), sliceObject(fenced ?? '')]) {
    if (!candidate) continue;
    try {
      const value = JSON.parse(candidate);
      if (value && Array.isArray(value.clips)) return { text: candidate.trim() };
    } catch {
      /* coba kandidat berikutnya */
    }
  }
  return { error: 'Clip-plan harus berupa objek JSON dengan array "clips". Tempel balasan AI yang memuat clip plan apa adanya.' };
}