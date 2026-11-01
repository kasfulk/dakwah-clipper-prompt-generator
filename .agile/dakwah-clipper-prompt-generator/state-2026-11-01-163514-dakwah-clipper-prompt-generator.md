```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-01-163514-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-11-01 16:35
kind: SMALL
completed: [intake, brainstorm, plan, coding, testing, verification, followup_review]
current: []
next: []
```

## Intake

Laporan user: prompt Clip Plan membuat model menerjemahkan isi transkrip ke bahasa lain, padahal transkrip harus disalin apa adanya.

Akar masalah (dibaca dari kode, bukan asumsi):

- `src/lib/prompts.js` `CLIP_PLAN` melarang menerjemahkan hanya di aturan subtitle (butir 2), sementara "ATURAN FIELD KREATIF" justru menyebut `title/kicker/hook` "bahasa Indonesia" — instruksi bahasa bercampur dan tidak ada aturan bahasa global.
- `src/lib/masterPrompt.js` `MASTER_TEMPLATE` 100% berbahasa Inggris dan tidak punya satu pun aturan bahasa output, sehingga model menyimpulkan seluruh teks on-screen (termasuk subtitle) harus Inggris/Indonesia.

## Brainstorm (ringkas)

- Requirement: naskah di SRT tidak boleh diterjemahkan, ditransliterasi, atau ditulis ulang; bahasa semua field teks mengikuti bahasa transkrip; hanya kunci JSON yang tetap Inggris. Pengecualian tunggal: perluasan singkatan SAW/SWT (sudah ada di §12).
- Constraint: tanpa renumbering seksi MASTER_TEMPLATE (diff minimal, section id stabil untuk user).

## Plan (ringkas)

| # | File | Perubahan |
|---|---|---|
| 1 | `src/lib/prompts.js` | Seksi `## BAHASA (WAJIB)` + aturan verbatim diperkuat + `ATURAN FIELD KREATIF` tidak lagi memaksa bahasa Indonesia |
| 2 | `src/lib/masterPrompt.js` | Blok `Language — mandatory` di §1, entri anti-translasi di §12 PITFALLS, butir QC #14 |
| 3 | `src/lib/prompts.test.js` | Assert aturan bahasa ada di prompt klip |

## Skipped stages

- DEEP_RESEARCH: SKIPPED — tidak ada ketidakpastian teknis eksternal; akar masalah terbaca dari sumber.
- CODE_PLAN: SKIPPED — 2 file, alur data tidak berubah.
- CODE_REVIEW (subagent independen): SKIPPED — perubahan hanya teks template, tidak ada logika; diverifikasi lewat tes + render prompt nyata.
## Follow-up (advisory review)

Dua jalur basi diperiksa, bukan diedit buta:

| Jalur | Temuan | Tindakan |
|---|---|---|
| `dist/` di root | build lama, prompt pra-perbaikan | dibangun ulang; diverifikasi di browser: seksi BAHASA tampil |
| Riwayat → tombol `Copy` | menyalin `entry.prompt` beku (prompt lama) | `rebuildHistoryPrompt()` di `finalPrompt.js` merakit ulang dari template terkini + baris tabel tersimpan; fallback ke teks tersimpan bila data rusak. Terverifikasi end-to-end via clipboard |
| Riwayat → `Muat` | sudah aman: prompt diturunkan dari template terkini | tidak diubah |
| `src/lib/llm.js` SYSTEM | jalur "Proses AI" tanpa aturan bahasa | ditambah satu aturan: pakai bahasa asli clip-plan, jangan menerjemahkan |
