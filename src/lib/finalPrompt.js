import { MASTER_TEMPLATE } from './masterPrompt.js';
import { accountsText, PLATFORMS } from './social.js';
import { asText, sanitizeAccounts } from './storage.js';
import { parseYouTubeId } from './youtube.js';
import { NOT_SET, parseClipPlan } from './prompts.js';
import { resolveTool } from './tools.js';

const NO_OVERRIDE = 'Tidak ada override — pakai ketentuan di atas.';
const filled = (value) => (value && value.trim() ? value.trim() : NO_OVERRIDE);

/** Prompt final dirakit langsung dari template: instan dan tidak bisa terpotong. */
export const buildFinalPrompt = ({
  url,
  palette,
  layout,
  plan,
  accounts = [],
  title = '',
  speaker = '',
  tool,
}) => {
  const chosen = resolveTool(tool);
  return MASTER_TEMPLATE.replaceAll('__TOOL_TITLE__', () => chosen.title)
    .replaceAll('__TOOL_DIRECTIVE__', () => chosen.directive)
    .replaceAll('__TOOL_REQUEST__', () => chosen.label)
    .replaceAll('__URL__', () => url)
    .replaceAll('__TITLE__', () => String(title ?? '').trim() || NOT_SET)
    .replaceAll('__SPEAKER__', () => String(speaker ?? '').trim() || NOT_SET)
    .replaceAll('__PALETTE__', () => filled(palette))
    .replaceAll('__LAYOUT__', () => filled(layout))
    .replaceAll('__SOCIAL__', () => accountsText(accounts))
    .replaceAll('__PLAN__', () => plan);
};

/**
 * Prompt riwayat dirakit ulang dari template terkini, bukan disalin dari teks beku
 * saat disimpan — entri lama kalau tidak akan terus membawa aturan prompt yang usang.
 * Data rusak/tak lengkap jatuh ke teks tersimpan apa adanya.
 */
export function rebuildHistoryPrompt(entry) {
  const inputs = entry?.inputs ?? {};
  const vid = parseYouTubeId(asText(inputs.urlInput));
  const saved = parseClipPlan(asText(inputs.planInput));
  if (!vid || !saved?.text) return entry?.prompt ?? '';
  try {
    const meta = JSON.parse(saved.text);
    return replaceClipTable(
      buildFinalPrompt({
        url: `https://youtube.com/watch?v=${vid}`,
        palette: asText(inputs.palette),
        layout: asText(inputs.layout),
        plan: saved.text,
        accounts: sanitizeAccounts(inputs.accounts, PLATFORMS),
        title: meta.video_title ?? '',
        speaker: meta.video_speaker ?? meta.video_spekar ?? '',
        tool: inputs.tool,
      }),
      entry.rows,
    );
  } catch {
    return entry?.prompt ?? '';
  }
}

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