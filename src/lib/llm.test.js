import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages, streamFinalPrompt } from './llm.js';
import { MASTER_TEMPLATE } from './masterPrompt.js';

const streamOf = (parts) =>
  new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
      controller.close();
    },
  });

const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n';

test('buildMessages mengirim prompt sederhana beserta template master', () => {
  const [system, user] = buildMessages('Buatkan Clip Video ...');
  assert.equal(system.role, 'system');
  assert.equal(user.role, 'user');
  assert.ok(user.content.includes('Buatkan Clip Video ...'));
  assert.ok(user.content.includes(MASTER_TEMPLATE));
  assert.ok(MASTER_TEMPLATE.includes('__PLAN__'));
  assert.ok(MASTER_TEMPLATE.includes('__PALETTE__'));
  assert.ok(MASTER_TEMPLATE.includes('__LAYOUT__'));
});

test('streamFinalPrompt merangkai delta walau terpotong di tengah baris', async () => {
  const raw = sse([
    { choices: [{ delta: { content: '# MASTER' } }] },
    { choices: [{ delta: { content: ' PROMPT — ünïcode' } }] },
    { choices: [{ delta: {} }] },
  ]);
  const cut = raw.indexOf('ünïcode') + 3; // potong di tengah karakter multi-byte
  const tokens = [];
  const text = await streamFinalPrompt('x', {
    fetch: async () => new Response(streamOf([raw.slice(0, cut), raw.slice(cut)])),
    onToken: (t) => tokens.push(t),
  });
  assert.equal(text, '# MASTER PROMPT — ünïcode');
  assert.deepEqual(tokens, ['# MASTER', ' PROMPT — ünïcode']);
});

test('streamFinalPrompt menerima balasan JSON utuh walau stream diminta', async () => {
  const body = JSON.stringify({ choices: [{ message: { role: 'assistant', content: 'HALO DUNIA' } }] });
  const tokens = [];
  const text = await streamFinalPrompt('x', {
    fetch: async () => new Response(streamOf([body])),
    onToken: (t) => tokens.push(t),
  });
  assert.equal(text, 'HALO DUNIA');
  assert.deepEqual(tokens, ['HALO DUNIA']);
});

test('streamFinalPrompt melempar error HTTP dengan potongan respons', async () => {
  await assert.rejects(
    streamFinalPrompt('x', { fetch: async () => new Response('model tidak ada', { status: 404 }) }),
    /HTTP 404 — model tidak ada/,
  );
});