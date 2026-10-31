import { MASTER_TEMPLATE } from './masterPrompt.js';

const NO_OVERRIDE = 'Tidak ada override — pakai ketentuan di atas.';
const filled = (value) => (value && value.trim() ? value.trim() : NO_OVERRIDE);

/** Prompt final dirakit langsung dari template: instan dan tidak bisa terpotong. */
export const buildFinalPrompt = ({ url, palette, layout, plan }) =>
  MASTER_TEMPLATE.replaceAll('__URL__', url)
    .replaceAll('__PALETTE__', filled(palette))
    .replaceAll('__LAYOUT__', filled(layout))
    .replaceAll('__PLAN__', () => plan);

const ROW = /^\| c\d+ \|.*\|$/;

/** Ganti baris tabel seksi 10 dengan hasil adaptasi model. */
export function replaceClipTable(prompt, rows) {
  const clean = (rows ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => ROW.test(line));
  if (!clean.length) return prompt;
  let replaced = false;
  return prompt
    .split('\n')
    .map((line) => {
      if (!ROW.test(line)) return line;
      if (replaced) return null;
      replaced = true;
      return clean.join('\n');
    })
    .filter((line) => line !== null)
    .join('\n');
}