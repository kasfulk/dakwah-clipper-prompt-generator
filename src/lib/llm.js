export const ENDPOINT = 'http://127.0.0.1:20128/v1/chat/completions';
export const MODEL = 'kn-b/gpt-6-luna';

const SYSTEM = `Kamu menyusun tabel arah visual untuk klip video dakwah pendek.
Keluarkan HANYA baris tabel Markdown, satu baris per klip pada clip-plan, dengan format:
| c01 | subjek singkat (maks 6 kata) | arah visual singkat (maks 10 kata) |
Aturan: tanpa header tabel, tanpa baris pemisah, tanpa penjelasan, tanpa pagar kode, tanpa teks lain.`;

export const buildMessages = (planText) => [
  { role: 'system', content: SYSTEM },
  { role: 'user', content: String(planText) },
];

/**
 * Minta model menyusun ulang tabel seksi 10 saja (keluaran pendek, aman di bawah
 * batas 30 detik router). Prompt final sendiri tidak pernah lewat model.
 */
export async function adaptClipTable(
  planText,
  { onToken, signal, endpoint = ENDPOINT, model = MODEL, fetch: send = globalThis.fetch } = {},
) {
  const res = await send(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, stream: true, messages: buildMessages(planText) }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
  if (!res.body) throw new Error('Respons tanpa body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let raw = '';
  let out = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    raw += chunk;
    buffer += chunk;
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

  // Sebagian proxy membalas JSON utuh walau stream diminta.
  if (!out) {
    try {
      const whole = JSON.parse(raw).choices?.[0]?.message?.content;
      if (whole) {
        out = whole;
        onToken?.(whole);
      }
    } catch {
      /* bukan JSON: biarkan kosong, pemanggil yang melaporkan */
    }
  }
  return out;
}