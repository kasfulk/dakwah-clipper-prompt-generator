```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-02-100655-dakwah-clipper-prompt-generator
stage: PLAN
status: APPROVED
```

# Plan — durasi klip & pass skip-silence

## Tasks

| # | Task | File | Acceptance |
|---|---|---|---|
| 1 | Ganti aturan durasi 30–75 detik dengan prinsip kelengkapan; tambah aturan "selesai setelah pembahasan tuntas" dan "tanpa batas maksimum, lantai lunak 45 detik" | `src/lib/prompts.js` (aturan 6–9) | `clipPlanPrompt()` tidak memuat "30–75" |
| 2 | Perkuat kriteria pemilihan klip: pembahasan selesai di dalam klip, jangan potong demi durasi, dalil + tafsir + contoh masuk satu klip | `src/lib/prompts.js` (KRITERIA) | kalimat baru muncul di prompt |
| 3 | Perkuat validasi mandiri: tidak ada kalimat terpotong, setiap pembahasan selesai, perpanjang ke cue berikutnya bila menggantung | `src/lib/prompts.js` (VALIDASI) | dua butir validasi baru |
| 4 | Tambah seksi 12 `FINISHING PASS WITH video-use — SKIP SILENCE` (leading/internal/trailing silence, buffer 80–150 ms, larangan potong tengah kata/Quran/Arab, re-export sinkron, laporan per klip) | `src/lib/masterPrompt.js` | heading seksi 12 ada |
| 5 | Renumber PITFALLS → 13, FINAL QUALITY CONTROL → 14, perbaiki referensi "(see section 12)" → 13 | `src/lib/masterPrompt.js` | seksi 1–14 unik |
| 6 | Masukkan `video-use` ke baris tooling wajib; catat trimming silence di spesifikasi audio seksi 4; tambah panduan panjang klip di seksi 8; tambah QC #6 dan #17 | `src/lib/masterPrompt.js` | `buildFinalPrompt()` memuat ketiganya |
| 7 | Selaraskan test yang mem-pin teks: jumlah seksi 13 → 14 (dua tempat), kalimat tooling memuat `video-use` | `src/lib/llm.test.js`, `src/lib/prompts.test.js` | `npm test` hijau |
| 8 | Tambah regression guard teks prompt: tidak ada "30–75", ada aturan tanpa batas maksimum, ada seksi 12, ada `video-use` di tooling wajib | `src/lib/prompts.test.js` | satu test baru lulus |

## Sequence

1 → 2 → 3 (satu file), lalu 4 → 5 → 6 (satu file, escape backtick), lalu 7 → 8, verifikasi `npm test` + `npm run build` + render prompt nyata.

## Risks

- Backtick mentah di template literal mematahkan modul → escape sebelum menjalankan test (sudah terjadi, diperbaiki).
- Nama `video-use` tidak ada di daftar skill lokal → mengikuti permintaan user; harness yang wajib menginstal, dan prompt menyatakan itu eksplisit.

## Regression areas

- `buildFinalPrompt()` (`src/lib/finalPrompt.js`) — jumlah seksi dan placeholder.
- Riwayat prompt (`history`) yang merakit ulang dari template terkini.
- Tidak ada label durasi di UI (`App.svelte`, `README.md` bersih dari "30–75" / "durasi").