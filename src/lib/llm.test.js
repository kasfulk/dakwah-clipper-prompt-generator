import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages, adaptClipTable } from './llm.js';
import { buildFinalPrompt, replaceClipTable } from './finalPrompt.js';
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
  assert.equal((out.match(/^### \d+\./gm) ?? []).length, 12);
});

test('replaceClipTable mengganti baris klip, menyisakan satu baris per klip', () => {
  const rows = '| c01 | Berharap jadi tanah | Burgundy gelap |\n| c02 | Kematian disembelih | Hitam emas |\n\nTerima kasih.';
  const out = replaceClipTable(buildFinalPrompt({ url: 'u', palette: '', layout: '', plan: '{}' }), rows);
  assert.ok(out.includes('| c01 | Berharap jadi tanah | Burgundy gelap |'));
  assert.ok(out.includes('| c02 | Kematian disembelih | Hitam emas |'));
  assert.ok(!out.includes('| c03 | Sekali celup ke neraka |'));
  assert.ok(!out.includes('Terima kasih.'));
  assert.equal((out.match(/^\| c\d+ \|/gm) ?? []).length, 2);
  assert.equal((out.match(/^### \d+\./gm) ?? []).length, 12);
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