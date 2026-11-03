```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-02-100655-dakwah-clipper-prompt-generator
stage: BRAINSTORM
classification: SMALL
status: APPROVED
```

# Brainstorm — durasi klip & pass skip-silence

## Problem

1. `CLIP_PLAN` di `src/lib/prompts.js` mengunci durasi klip 30–75 detik. Hasilnya klip pendek yang menggantung: pembahasan berhenti sebelum dalil/contoh/penjelasannya tuntas, dan subtitle ikut terpotong. User tetap me-review tiap video setelah dipotong, jadi klip panjang yang utuh jauh lebih berguna daripada klip pendek yang nanggung.
2. `MASTER_TEMPLATE` di `src/lib/masterPrompt.js` belum punya tahap finishing, sehingga video hasil render masih menyimpan jeda hening: tidak efisien ditonton dan terasa lambat di short-form.

## Requirements

- Klip boleh panjang sampai pembahasan selesai; tidak ada batas durasi maksimum.
- Klip tidak boleh berakhir di tengah kalimat atau di tengah penjelasan.
- Subtitle utuh dan jelas, tidak terpotong di awal/akhir klip.
- Final prompt wajib menyuruh harness menjalankan `video-use` untuk skip-silence setelah render.

## Constraints

- Semua perubahan hanya teks prompt (string literal); tanpa perubahan logika/UI.
- Template literal di `masterPrompt.js` wajib escape backtick (`\``) — backtick mentah mematahkan modul.
- Tidak ada skill `video-use` terpasang lokal; nama mengikuti permintaan user dan dirujuk sebagai tooling wajib yang diinstal harness.

## Decisions

- Ganti jendela 30–75 detik dengan prinsip "kelengkapan > durasi", lantai lunak 45 detik.
- Tambah seksi 12 `FINISHING PASS WITH video-use — SKIP SILENCE`; PITFALLS → 13, QC → 14.
- `video-use` masuk baris tooling wajib bersama tool terpilih dan `opendesign`.

## Acceptance criteria

1. `clipPlanPrompt` tidak memuat "30–75" dan memuat aturan tanpa batas maksimum.
2. Validasi mandiri memeriksa kalimat terpotong dan pembahasan yang belum tuntas.
3. `MASTER_TEMPLATE` memuat seksi 12 skip-silence dan menyebut `video-use` di tooling wajib.
4. Seksi prompt final bernomor 1–14 tanpa duplikat; tidak ada placeholder tersisa.
5. `npm test` dan `npm run build` hijau.

Skipped: DEEP_RESEARCH, CODE_PLAN, CODE_REVIEW — lihat alasan di `state-2026-11-02-100655-*.md`.