import test from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDERS, adaptClipTable, buildMessages, buildRequest, resolveConfig } from './llm.js';
import { buildFinalPrompt, rebuildHistoryPrompt, replaceClipTable } from './finalPrompt.js';
import { MASTER_TEMPLATE } from './masterPrompt.js';

const streamOf = (parts) =>
  new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
      controller.close();
    },
  });

const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n';
const PLAN = '{"video_title":"T","clips":[{"id":"c01"},{"id":"c02"}]}';

test('buildFinalPrompt mengisi semua placeholder tanpa sisa', () => {
  const out = buildFinalPrompt({
    url: 'https://youtube.com/watch?v=abc',
    palette: '  Midnight #101116  ',
    layout: '',
    plan: PLAN,
  });
  assert.ok(out.includes('**Source footage:** https://youtube.com/watch?v=abc'));
  assert.ok(out.includes('Midnight #101116\n\n---'));
  assert.ok(out.includes('Tidak ada override — pakai ketentuan di atas.'));
  assert.ok(out.includes(PLAN));
  assert.deepEqual(out.match(/__(URL|PALETTE|LAYOUT|PLAN)__/g), null);
  assert.equal((out.match(/^### \d+\./gm) ?? []).length, 13);
});

test('replaceClipTable mengganti baris klip, menyisakan satu baris per klip', () => {
  const rows = '| c01 | Berharap jadi tanah | Burgundy gelap |\n| c02 | Kematian disembelih | Hitam emas |\n\nTerima kasih.';
  const out = replaceClipTable(buildFinalPrompt({ url: 'u', palette: '', layout: '', plan: '{}' }), rows);
  assert.ok(out.includes('| c01 | Berharap jadi tanah | Burgundy gelap |'));
  assert.ok(out.includes('| c02 | Kematian disembelih | Hitam emas |'));
  assert.ok(!out.includes('| c03 | Sekali celup ke neraka |'));
  assert.ok(!out.includes('Terima kasih.'));
  assert.equal((out.match(/^\| c\d+ \|/gm) ?? []).length, 2);
  assert.equal((out.match(/^### \d+\./gm) ?? []).length, 13);
});

test('replaceClipTable mengabaikan balasan tanpa baris tabel', () => {
  const base = buildFinalPrompt({ url: 'u', palette: '', layout: '', plan: '{}' });
  assert.equal(replaceClipTable(base, 'maaf saya tidak bisa'), base);
});

test('adaptClipTable hanya mengirim clip-plan ke model', () => {
  const [system, user] = buildMessages(PLAN);
  assert.equal(system.role, 'system');
  assert.equal(user.content, PLAN);
  assert.ok(!JSON.stringify(buildMessages(PLAN)).includes(MASTER_TEMPLATE));
});

test('adaptClipTable merangkai delta walau terpotong di tengah baris', async () => {
  const raw = sse([
    { choices: [{ delta: { content: '| c01 |' } }] },
    { choices: [{ delta: { content: ' ünïcode | x |' } }] },
    { choices: [{ delta: {} }] },
  ]);
  const cut = raw.indexOf('ünïcode') + 3; // potong di tengah karakter multi-byte
  const tokens = [];
  const text = await adaptClipTable(PLAN, {
    fetch: async () => new Response(streamOf([raw.slice(0, cut), raw.slice(cut)])),
    onToken: (t) => tokens.push(t),
  });
  assert.equal(text, '| c01 | ünïcode | x |');
  assert.deepEqual(tokens, ['| c01 |', ' ünïcode | x |']);
});

test('adaptClipTable menerima balasan JSON utuh walau stream diminta', async () => {
  const body = JSON.stringify({ choices: [{ message: { role: 'assistant', content: '| c01 | a | b |' } }] });
  const text = await adaptClipTable(PLAN, { fetch: async () => new Response(streamOf([body])) });
  assert.equal(text, '| c01 | a | b |');
});

test('adaptClipTable melempar error HTTP dengan potongan respons', async () => {
  await assert.rejects(
    adaptClipTable(PLAN, { fetch: async () => new Response('model tidak ada', { status: 404 }) }),
    /HTTP 404 — model tidak ada/,
  );
});

test('resolveConfig mengisi bawaan layanan bila isian kosong', () => {
  const local = PROVIDERS.find((p) => p.id === 'local');
  assert.deepEqual(resolveConfig({ provider: 'local', url: '  ', model: '', apiKey: ' k ' }), {
    id: 'local',
    url: local.url,
    model: local.model,
    apiKey: 'k',
  });
  assert.equal(resolveConfig({ provider: 'entah' }).id, 'local');
});

test('buildRequest OpenAI: endpoint dilengkapi sekali, key jadi Bearer', () => {
  const forUrl = (url) => {
    const { url: built, init } = buildRequest(PLAN, { provider: 'openai', url, model: 'gpt-x', apiKey: 'sk-1' });
    assert.equal(JSON.parse(init.body).model, 'gpt-x');
    assert.equal(init.headers.authorization, 'Bearer sk-1');
    return built;
  };
  assert.equal(forUrl('https://api.openai.com'), 'https://api.openai.com/v1/chat/completions');
  assert.equal(forUrl('https://api.openai.com/v1/'), 'https://api.openai.com/v1/chat/completions');
  assert.equal(
    forUrl('https://proxy.local/v1/chat/completions'),
    'https://proxy.local/v1/chat/completions',
  );
  assert.equal(buildRequest(PLAN, { provider: 'openai' }).init.headers.authorization, undefined);
});

test('buildRequest Anthropic: /v1/messages, header x-api-key, system terpisah', () => {
  const { url, init } = buildRequest(PLAN, { provider: 'anthropic', apiKey: 'sk-ant' });
  assert.equal(url, 'https://api.anthropic.com/v1/messages');
  assert.equal(init.headers['x-api-key'], 'sk-ant');
  assert.equal(init.headers['anthropic-version'], '2023-06-01');
  const body = JSON.parse(init.body);
  assert.deepEqual(body.messages, [{ role: 'user', content: PLAN }]);
  assert.equal(body.system, buildMessages(PLAN)[0].content);
});

test('adaptClipTable membaca stream Anthropic (content_block_delta)', async () => {
  const raw = sse([
    { type: 'content_block_delta', delta: { type: 'text_delta', text: '| c01 |' } },
    { type: 'content_block_delta', delta: { type: 'text_delta', text: ' a | b |' } },
  ]);
  let sent;
  const text = await adaptClipTable(PLAN, {
    config: { provider: 'anthropic', apiKey: 'k' },
    fetch: async (url, init) => {
      sent = { url, init };
      return new Response(streamOf([raw]));
    },
  });
  assert.equal(text, '| c01 | a | b |');
  assert.equal(sent.url, 'https://api.anthropic.com/v1/messages');
});
test('riwayat: prompt dirakit ulang dari template terkini, bukan teks beku', () => {
  const entry = {
    savedAt: '2026-10-31T00:00:00.000Z',
    label: 'Lama',
    sig: 'x',
    rows: '| c01 | Berharap jadi tanah | Burgundy gelap |',
    prompt: '# MASTER PROMPT LAMA TANPA ATURAN BAHASA',
    inputs: {
      urlInput: 'https://www.youtube.com/watch?v=m7LxQ9d2vYU',
      planInput: '```json\n{"video_title":"Judul","video_speaker":"Ustadz","clips":[]}\n```',
      palette: 'Midnight #101116',
      layout: '',
      tool: 'remotion',
      accounts: [{ platform: 'Tiktok', username: 'dakwah' }],
    },
  };
  const out = rebuildHistoryPrompt(entry);
  assert.ok(out.includes('Language — mandatory'));
  assert.ok(out.includes('| c01 | Berharap jadi tanah | Burgundy gelap |'));
  assert.ok(out.includes('**Video title:** Judul'));
  assert.ok(out.includes('**Speaker:** Ustadz'));
  assert.ok(!out.includes('MASTER PROMPT LAMA'));
  assert.deepEqual(out.match(/__(URL|PALETTE|LAYOUT|PLAN|TITLE|SPEAKER|SOCIAL|TOOL_\w+)__/g), null);
});

test('riwayat: clip-plan lama dengan kunci video_spekar tetap terbaca', () => {
  const out = rebuildHistoryPrompt({
    prompt: '',
    inputs: {
      urlInput: 'm7LxQ9d2vYU',
      planInput: '{"video_title":"Judul","video_spekar":"Ustadz Lama","clips":[]}',
    },
  });
  assert.ok(out.includes('**Speaker:** Ustadz Lama'));
});

test('riwayat: data rusak jatuh ke teks tersimpan', () => {
  assert.equal(rebuildHistoryPrompt({ prompt: 'lama', inputs: { urlInput: 'bukan url' } }), 'lama');
  assert.equal(rebuildHistoryPrompt({ prompt: 'lama', inputs: { urlInput: 'm7LxQ9d2vYU', planInput: 'bukan json' } }), 'lama');
  assert.equal(rebuildHistoryPrompt(undefined), '');
});
