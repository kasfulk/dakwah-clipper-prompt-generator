```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-03-142236-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-11-03 14:22
classification: SMALL
completed: [brainstorm, plan, coding, testing, verification, commit]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
```

## BRAINSTORM (compressed)

Requirement: unduh clip plan sebagai file JSON (setelah clip-plan valid), unduh final prompt sebagai file Markdown (setelah final prompt siap). Lalu commit + push.

Decisions:
- Satu helper `download(text, filename, type)` (Blob + anchor, tanpa dependensi) dan `slug()` untuk nama file.
- Clip plan: JSON di-*pretty-print* (`JSON.stringify(…, null, 2)`), nama `<slug video_title>.json`.
- Final prompt: `.md` apa adanya (`text/markdown;charset=utf-8`), nama `<slug video_title>.md`.

Skipped stages:
- DEEP_RESEARCH: SKIPPED — API browser (Blob/anchor) sudah jelas.
- CODE_PLAN: SKIPPED — satu file (`src/App.svelte`), helper + 2 tombol.
- CODE_REVIEW: SKIPPED — SMALL path, tanpa perubahan logika domain.

## PLAN (short)

1. `src/App.svelte` — helper `download()` + `slug()`.
2. Langkah 9 — tombol `Download clip plan JSON` di bawah hint clip-plan valid.
3. Langkah 10 — tombol `Download Markdown` di `output-actions`.

## VERIFICATION

| Bukti | Hasil |
|---|---|
| `npm test` | 38 pass, 0 fail |
| `npm run build` | OK, `dist/assets/index-*.js` 89.60 kB |
| Chromium: klik Download clip plan JSON | `mengapa-manusia-takut-mati.json`, 179 byte, JSON pretty-print |
| Chromium: Muat riwayat → final prompt → Download Markdown | `mengapa-manusia-takut-mati.md`, 17 434 byte, isi = final prompt lengkap |
| Chromium ulang setelah perbaikan Safari (anchor + revoke tertunda) | JSON 179 byte, MD 17 434 byte — keduanya tetap terunduh |
