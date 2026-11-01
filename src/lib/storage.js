/** Simpanan lokal (localStorage) untuk isian opsional dan riwayat prompt. */
const PREFIX = 'dcpg:';

export const HISTORY_LIMIT = 20;

function read(store, key) {
  try {
    const raw = store.getItem(PREFIX + key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** true bila tersimpan; false bila storage penuh atau diblokir (mode privat). */
export function write(store, key, value) {
  try {
    store.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Teks apa pun -> string; nilai non-string diabaikan karena localStorage bisa diedit tangan. */
export const asText = (value) => (typeof value === 'string' ? value : '');

/** Teks tersimpan; nilai non-string (storage diedit tangan) diabaikan. */
export function readText(store, key) {
  return asText(read(store, key));
}

export function sanitizeAccounts(value, platforms) {
  if (!Array.isArray(value)) return [];
  const ids = new Set(platforms.map((p) => p.id));
  return value
    .filter((a) => a && ids.has(a.platform))
    .map(({ platform, username }) => ({ platform, username: String(username ?? '') }));
}

export const readAccounts = (store, platforms) => sanitizeAccounts(read(store, 'accounts'), platforms);

/** Layanan AI: provider tak dikenal -> provider pertama, isian lain dipaksa string. */
export function sanitizeConfig(value, providers) {
  const v = value && typeof value === 'object' ? value : {};
  const known = providers.some((p) => p.id === v.provider);
  return {
    provider: known ? v.provider : providers[0].id,
    url: asText(v.url),
    model: asText(v.model),
    apiKey: asText(v.apiKey),
  };
}

export const readConfig = (store, providers) => sanitizeConfig(read(store, 'config'), providers);

/** Alat pembuat video terpilih; nilai tak dikenal jatuh ke pilihan pertama. */
export function readTool(store, tools) {
  const value = asText(read(store, 'tool'));
  return tools.some((t) => t.id === value) ? value : tools[0].id;
}

const isEntry = (e) =>
  !!e &&
  typeof e.savedAt === 'string' &&
  typeof e.label === 'string' &&
  typeof e.sig === 'string' &&
  typeof e.rows === 'string' &&
  typeof e.prompt === 'string' &&
  !!e.inputs &&
  typeof e.inputs === 'object';

export function readHistory(store) {
  const value = read(store, 'history');
  return Array.isArray(value) ? value.filter(isEntry).slice(0, HISTORY_LIMIT) : [];
}

export const writeHistory = (store, history) => write(store, 'history', history.slice(0, HISTORY_LIMIT));

/** Entri identik (prompt sama) dibuang supaya riwayat tidak dobel. */
export const withEntry = (history, entry) =>
  [entry, ...history.filter((e) => e.prompt !== entry.prompt)].slice(0, HISTORY_LIMIT);