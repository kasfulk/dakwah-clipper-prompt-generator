import { watchUrl } from './youtube.js';
import { accountsText } from './social.js';
import { resolveTool } from './tools.js';

const CLIP_PLAN = `Kamu adalah editor konten TikTok untuk kajian Islam. Tugasmu membuat 10 Clip Plan dari transkrip SRT yang saya lampirkan.

## SUMBER DATA (WAJIB)
- Satu-satunya sumber kebenaran adalah FILE SRT yang saya lampirkan.
- JANGAN mengakses/menebak isi dari URL YouTube. URL hanya dipakai untuk field "source_url".
- Jika file SRT tidak ditemukan atau tidak terbaca, HENTIKAN dan balas: "SRT tidak ditemukan". Jangan membuat klip dari ingatan atau perkiraan.

## METADATA
- video_title: judul video ini, tentukan dari isi transkrip.
- video_spekar: nama ustadz/penceramah, tentukan dari isi transkrip.
- source_url: __URL__

## ATURAN KETAT TIMESTAMP & SUBTITLE
1. Setiap entri di "subtitles" harus berasal dari SATU cue SRT yang nyata (1 cue = 1 entri). Jangan menggabung, memecah, atau menambah cue.
2. Teks "subtitle" harus SALINAN PERSIS (verbatim) dari teks cue SRT. Dilarang memparafrase, merapikan kalimat, menerjemahkan, atau memperbaiki isi. Pengecualian hanya: hapus tag/nomor urut SRT dan gabungkan baris ganda dalam satu cue menjadi satu baris.
3. "start" dan "end" tiap subtitle = timestamp cue aslinya, dikonversi dari HH:MM:SS,mmm ke format MM:SS (buang milidetik; pakai H:MM:SS jika lebih dari 1 jam).
4. "source_start" = start cue PERTAMA dalam klip. "source_end" = end cue TERAKHIR dalam klip.
5. Cue dalam satu klip harus BERURUTAN dan BERSAMBUNGAN (tanpa melompati cue di tengah).
6. Klip tidak boleh dimulai/berakhir di tengah kalimat. Mulai di awal kalimat/gagasan dan akhiri di akhir kalimat yang tuntas.
7. Durasi tiap klip 30–75 detik. Tidak ada klip yang saling tumpang tindih. Sebar klip ke seluruh bagian video, bukan hanya di awal.

## KRITERIA PEMILIHAN KLIP (potensi viral)
- Hook kuat di 3 detik pertama (pertanyaan, pernyataan mengejutkan, kontras, kisah, atau pernyataan tegas).
- Satu ide utuh, bisa dipahami tanpa menonton video penuh.
- Bernilai praktis/emosional: nasihat, koreksi kesalahpahaman, kisah, motivasi, atau peringatan.
- Hindari bagian basa-basi, salam panjang, dan konteks yang bergantung pada bagian lain.
- Jangan memilih potongan yang berpotensi menimbulkan salah paham jika terlepas dari konteks (mis. dalil/hukum yang butuh penjelasan lanjutan) kecuali penjelasannya ikut masuk dalam klip.

## ATURAN FIELD KREATIF
- "title", "kicker", "hook" boleh ditulis kreatif (bahasa Indonesia, singkat, memancing), tetapi harus sesuai isi klip dan tidak menambahkan klaim yang tidak diucapkan ustadz.
- "hook" idealnya mengambil/menyarikan kalimat pembuka klip; kalau dikutip, harus persis dari SRT.
- "id": c01–c10, "part": "01"–"10" sesuai urutan kemunculan di video.

## VALIDASI SEBELUM OUTPUT (lakukan diam-diam)
Untuk setiap klip, cek:
- Semua timestamp ada di SRT dan subtitle identik dengan teks SRT.
- source_start/source_end cocok dengan cue pertama/terakhir.
- Durasi memenuhi aturan, tidak ada overlap antar klip.
Perbaiki jika ada yang gagal sebelum menjawab.

## FORMAT OUTPUT
Keluarkan HANYA JSON valid (tanpa penjelasan, tanpa markdown fence) dengan struktur:

{
  "video_title": "",
  "video_spekar": "",
  "source_url": "__URL__",
  "clips": [
    {
      "id": "c01",
      "part": "01",
      "title": "",
      "kicker": "",
      "hook": "",
      "source_start": "MM:SS",
      "source_end": "MM:SS",
      "subtitles": [
        {"start": "MM:SS", "end": "MM:SS", "subtitle": ""}
      ]
    }
  ]
}`;

const REQUEST = `Buatkan Clip Video dengan __TOOL__ dari __URL__

<Judul video>
__TITLE__

<Pemateri>
__SPEAKER__

// sisipkan disini
<Pallete warna>
__PALETTE__

<Layout video>
__LAYOUT__

<Akun Sosmed>
__SOCIAL__

Dengan clip-plan:
__PLAN__`;

export const NO_OVERRIDE = '(tidak ada override — pertahankan seluruh isi bagian ini dari MASTER PROMPT apa adanya)';
export const NOT_SET = '(tidak ditentukan)';

const given = (value) => String(value ?? '').trim() || NOT_SET;

export const clipPlanPrompt = (id) => CLIP_PLAN.replaceAll('__URL__', watchUrl(id));

/** Prompt sederhana untuk alat terpilih (effectcraft/remotion/hyperframes + opendesign). */
export const simplePrompt = (id, planText, palette = '', layout = '', accounts = [], meta = {}) =>
  REQUEST.replace('__TOOL__', () => resolveTool(meta.tool).label)
    .replace('__URL__', `https://youtube.com/watch?v=${id}`)
    .replace('__TITLE__', () => given(meta.title))
    .replace('__SPEAKER__', () => given(meta.speaker))
    .replace('__PALETTE__', () => palette.trim() || NO_OVERRIDE)
    .replace('__LAYOUT__', () => layout.trim() || NO_OVERRIDE)
    .replace('__SOCIAL__', () => accountsText(accounts))
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