import { MASTER_TEMPLATE } from './masterPrompt.js';

export const ENDPOINT = 'http://localhost:20128/v1/chat/completions';
export const MODEL = 'kn-b/gpt-6-luna';

const SYSTEM = `Kamu adalah prompt compiler.
Kamu menerima PROMPT SEDERHANA dari user dan MASTER PROMPT TEMPLATE yang memuat placeholder __URL__, __PALETTE__, __LAYOUT__, __PLAN__.
Hasilkan prompt final dengan mengganti setiap placeholder memakai data dari PROMPT SEDERHANA.
Aturan:
- Salin seluruh teks template apa adanya: jangan meringkas, menghapus, menambah, atau menerjemahkan bagian mana pun.
- Bila override bertuliskan "tidak ada override", pertahankan isi bagian itu dan tulis satu baris: Tidak ada override — pakai ketentuan di atas.
- Seksi 10: tabel arah visual hanya contoh. Sesuaikan barisnya dengan klip pada __PLAN__ (id, subjek, arah visual), lalu salin JSON-nya apa adanya.
- Keluarkan HANYA prompt final dalam Markdown. Tanpa pagar kode, tanpa kalimat pembuka, tanpa komentar.`;

export const buildMessages = (simplePrompt) => [
  { role: 'system', content: SYSTEM },
  {
    role: 'user',
    content: `PROMPT SEDERHANA\n---\n${simplePrompt}\n---\n\nMASTER PROMPT TEMPLATE\n---\n${MASTER_TEMPLATE}\n---`,
  },
];

/** SSE stream dari endpoint OpenAI-compatible; kembalikan teks penuh. */
export async function streamFinalPrompt(
  simplePrompt,
  { onToken, signal, endpoint = ENDPOINT, model = MODEL, fetch: send = globalThis.fetch } = {},
) {
  const res = await send(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, stream: true, messages: buildMessages(simplePrompt) }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
  if (!res.body) throw new Error('Respons tanpa body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let out = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (delta) {
          out += delta;
          onToken?.(delta);
        }
      } catch {
        /* potongan SSE tidak utuh: lewati */
      }
    }
  }
  return out;
}