/** Layanan AI yang bisa dipakai untuk menyusun ulang tabel arah visual. */
export const PROVIDERS = [
  { id: 'local', label: 'Lokal (router OpenAI-compatible)', url: 'http://127.0.0.1:20128', model: 'kn-b/gpt-6-luna' },
  { id: 'openai', label: 'OpenAI', url: 'https://api.openai.com', model: 'gpt-4o-mini' },
  { id: 'anthropic', label: 'Anthropic', url: 'https://api.anthropic.com', model: 'claude-sonnet-4-5' },
];

const SYSTEM = `Kamu menyusun tabel arah visual untuk klip video dakwah pendek.
Keluarkan HANYA baris tabel Markdown, satu baris per klip pada clip-plan, dengan format:
| c01 | subjek singkat (maks 6 kata) | arah visual singkat (maks 10 kata) |
Aturan: tanpa header tabel, tanpa baris pemisah, tanpa penjelasan, tanpa pagar kode, tanpa teks lain.`;

export const buildMessages = (planText) => [
  { role: 'system', content: SYSTEM },
  { role: 'user', content: String(planText) },
];

/** Isian user (boleh kosong) -> layanan, URL, model, dan API key yang pasti terisi. */
export function resolveConfig(config = {}) {
  const provider = PROVIDERS.find((p) => p.id === config?.provider) ?? PROVIDERS[0];
  const text = (value, fallback) => String(value ?? '').trim() || fallback;
  return {
    id: provider.id,
    url: text(config?.url, provider.url),
    model: text(config?.model, provider.model),
    apiKey: String(config?.apiKey ?? '').trim(),
  };
}

/** URL lengkap: terima host saja, host+/v1, atau endpoint utuh apa adanya. */
const endpointUrl = (base, suffix) =>
  base.endsWith(suffix) ? base : base.endsWith('/v1') ? `${base}${suffix}` : `${base}/v1${suffix}`;

/** Permintaan HTTP siap kirim untuk layanan terpilih (OpenAI-compatible atau Anthropic). */
export function buildRequest(planText, config = {}) {
  const cfg = resolveConfig(config);
  const base = cfg.url.replace(/\/+$/, '');
  const messages = buildMessages(planText);

  if (cfg.id === 'anthropic') {
    return {
      config: cfg,
      url: endpointUrl(base, '/messages'),
      init: {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': cfg.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 4096,
          stream: true,
          system: messages[0].content,
          messages: [messages[1]],
        }),
      },
    };
  }

  const headers = { 'content-type': 'application/json' };
  if (cfg.apiKey) headers.authorization = `Bearer ${cfg.apiKey}`;
  return {
    config: cfg,
    url: endpointUrl(base, '/chat/completions'),
    init: { method: 'POST', headers, body: JSON.stringify({ model: cfg.model, stream: true, messages }) },
  };
}

const anthropic = (cfg) => cfg.id === 'anthropic';

/** Potongan SSE -> teks; bentuk OpenAI dan Anthropic berbeda. */
const deltaText = (chunk, isAnthropic) =>
  isAnthropic ? chunk.delta?.text ?? '' : chunk.choices?.[0]?.delta?.content ?? '';

/** Balasan non-stream utuh -> teks. */
const wholeText = (body, isAnthropic) =>
  isAnthropic
    ? (body.content ?? []).map((b) => b.text ?? '').join('')
    : body.choices?.[0]?.message?.content ?? '';

/**
 * Minta model menyusun ulang tabel seksi 10 saja (keluaran pendek, aman di bawah
 * batas 30 detik router). Prompt final sendiri tidak pernah lewat model.
 */
export async function adaptClipTable(
  planText,
  { onToken, signal, config, fetch: send = globalThis.fetch } = {},
) {
  const { config: cfg, url, init } = buildRequest(planText, config);
  const isAnthropic = anthropic(cfg);
  const res = await send(url, { ...init, signal });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(
      `HTTP ${res.status} — ${detail || 'tanpa keterangan'}` +
        (res.status === 401 || res.status === 403 ? ' (periksa API key di langkah 8)' : ''),
    );
  }
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
        const delta = deltaText(JSON.parse(payload), isAnthropic);
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
      const whole = wholeText(JSON.parse(raw), isAnthropic);
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