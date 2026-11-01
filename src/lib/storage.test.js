import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HISTORY_LIMIT,
  asText,
  readAccounts,
  readConfig,
  readHistory,
  readText,
  readTool,
  sanitizeAccounts,
  withEntry,
  write,
  writeHistory,
} from './storage.js';
import { PLATFORMS } from './social.js';

const store = (seed = {}) => {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
};

const entry = (prompt) => ({
  savedAt: '2026-11-01T00:00:00.000Z',
  label: 'Judul',
  sig: 's',
  rows: '',
  prompt,
  inputs: {},
});

test('write lalu readText mengembalikan teks yang sama', () => {
  const s = store();
  assert.equal(write(s, 'palette', 'Midnight #101116'), true);
  assert.equal(readText(s, 'palette'), 'Midnight #101116');
  assert.equal(readText(s, 'layout'), '');
});

test('nilai rusak atau storage diblokir tidak melempar', () => {
  assert.equal(readText(store({ 'dcpg:palette': '{bukan json' }), 'palette'), '');
  assert.equal(readText(store({ 'dcpg:palette': '"x"' }), 'palette'), 'x');
  const broken = {
    getItem: () => {
      throw new Error('diblokir');
    },
    setItem: () => {
      throw new Error('kuota penuh');
    },
  };
  assert.equal(readText(broken, 'palette'), '');
  assert.equal(write(broken, 'palette', 'x'), false);
  assert.deepEqual(readAccounts(broken, PLATFORMS), []);
});

test('akun dibaca hanya bila platformnya dikenal', () => {
  const s = store({
    'dcpg:accounts': JSON.stringify([
      { platform: 'Tiktok', username: 'dakwah' },
      { platform: 'Friendster', username: 'asing' },
      { platform: 'Instagram' },
      null,
    ]),
  });
  assert.deepEqual(readAccounts(s, PLATFORMS), [
    { platform: 'Tiktok', username: 'dakwah' },
    { platform: 'Instagram', username: '' },
  ]);
  assert.deepEqual(sanitizeAccounts('bukan array', PLATFORMS), []);
});

test('riwayat: entri baru di depan, duplikat dibuang, dibatasi', () => {
  let history = [];
  for (let i = 0; i < HISTORY_LIMIT + 5; i++) history = withEntry(history, entry(`p${i}`));
  assert.equal(history.length, HISTORY_LIMIT);
  assert.equal(history[0].prompt, `p${HISTORY_LIMIT + 4}`);
  assert.equal(history.at(-1).prompt, 'p5');

  const again = withEntry(history, entry('p10'));
  assert.equal(again.length, HISTORY_LIMIT);
  assert.equal(again[0].prompt, 'p10');
  assert.equal(again.filter((e) => e.prompt === 'p10').length, 1);
});

test('riwayat tersimpan dibaca kembali dan entri cacat dibuang', () => {
  const s = store();
  writeHistory(s, [entry('p1'), { savedAt: 1 }, entry('p2')]);
  assert.deepEqual(
    readHistory(s).map((e) => e.prompt),
    ['p1', 'p2'],
  );
  assert.deepEqual(readHistory(store({ 'dcpg:history': '"x"' })), []);
});

test('asText hanya meloloskan string; entri tanpa label dibuang', () => {
  assert.equal(asText('x'), 'x');
  assert.equal(asText(5), '');
  assert.equal(asText({}), '');
  assert.equal(asText(undefined), '');
  assert.equal(readText(store({ 'dcpg:layout': '5' }), 'layout'), '');

  const s = store();
  writeHistory(s, [{ ...entry('p1'), label: 7 }, { ...entry('p2'), label: undefined }, entry('p3')]);
  assert.deepEqual(
    readHistory(s).map((e) => e.label),
    ['Judul'],
  );
});
test('config layanan AI: provider asing jatuh ke bawaan, isian non-string dibuang', () => {
  const providers = [{ id: 'local' }, { id: 'openai' }];
  assert.deepEqual(readConfig(store(), providers), { provider: 'local', url: '', model: '', apiKey: '' });
  assert.deepEqual(
    readConfig(store({ 'dcpg:config': JSON.stringify({ provider: 'openai', url: ' https://x ', model: 7, apiKey: 'k' }) }), providers),
    { provider: 'openai', url: ' https://x ', model: '', apiKey: 'k' },
  );
  assert.equal(readConfig(store({ 'dcpg:config': '{"provider":"gemini"}' }), providers).provider, 'local');
});

test('alat pembuat video: nilai tak dikenal jatuh ke pilihan pertama', () => {
  const tools = [{ id: 'effectcraft' }, { id: 'remotion' }];
  assert.equal(readTool(store(), tools), 'effectcraft');
  assert.equal(readTool(store({ 'dcpg:tool': JSON.stringify('remotion') }), tools), 'remotion');
  assert.equal(readTool(store({ 'dcpg:tool': JSON.stringify('veo') }), tools), 'effectcraft');
  assert.equal(readTool(store({ 'dcpg:tool': JSON.stringify(5) }), tools), 'effectcraft');
});
