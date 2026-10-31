scope: dakwah-clipper-prompt-generator
session: 2026-10-31-031122-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-10-31 03:11
classification: SMALL
completed: [brainstorm, plan, coding, code_review, testing, verification]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
skipped:
  - DEEP_RESEARCH: endpoint, model, dan header CORS diverifikasi langsung dengan curl, bukan riset eksternal
  - CODE_PLAN: 3 file baru + 2 file diubah, alur sudah final saat intake
  - WORKTREE: satu work stream, tanpa cabang paralel

permintaan: prompt sederhana (URL + palet + layout + clip-plan) diproses jadi MASTER PROMPT final memakai model lokal.

implementasi:
  - src/lib/masterPrompt.js: MASTER_TEMPLATE dengan placeholder __URL__/__PALETTE__/__LAYOUT__/__PLAN__
  - src/lib/prompts.js: effectcraftPrompt sekarang menyisipkan <Pallete warna> dan <Layout video>
  - src/lib/llm.js: buildMessages + streamFinalPrompt (SSE) ke http://localhost:20128/v1/chat/completions, model kn-b/gpt-6-luna
  - src/App.svelte: langkah 6 palet/layout, 7 prompt sederhana, 8 proses streaming + copy + peringatan output terpotong
  - src/lib/llm.test.js: parsing SSE, chunk terpotong, error HTTP

verifikasi:
  - npm test: 12 pass / 0 fail
  - npx vite build: sukses
  - node end-to-end ke model lokal: 32,4 s, 13.816 karakter, 12/12 seksi, 0 placeholder tersisa, clip-plan tersalin utuh
  - browser (moli, localhost:5173): klik Proses → final prompt, cross-origin stream jalan, <pre> terisi

perbaikan putaran 2 (commit a553b90):
  - lede homepage masih klaim "tanpa AI, tanpa server" → diperbaiki
  - seksi 10: tabel arah visual kini mengikuti clip-plan (uji 2 klip → tabel c01/c02, bukan c01–c10 hardcode)
  - override kosong: model sempat mengosongkan seksi Layout; token NO_OVERRIDE diperjelas + aturan eksplisit di system
  - verifikasi ulang live: 12/12 seksi, 0 placeholder, palet user terpasang, layout "Tidak ada override — pakai ketentuan di atas."

perbaikan putaran 4 (commit f37acf2) — router memotong request di 30 detik:
  - bukti: "curl request failed after active=30067ms ... 0 bytes received"; log UI 4→28s "Menunggu token pertama" lalu gagal
  - MASTER PROMPT utuh butuh 25–90 s untuk ditulis ulang model → tidak pernah selesai
  - solusi: final prompt dirakit deterministik di browser (finalPrompt.js, replaceAll) — instan, 0 risiko terpotong
  - AI dipersempit: hanya menyusun ulang tabel arah visual seksi 10 (keluaran pendek, `adaptClipTable`)
  - verifikasi Chromium (CDP, bukan eval moli): rakit instan 13.783 char · 12/12 seksi · 0 placeholder · palet & layout terpasang tanpa network
  - adaptasi AI 20 s · tabel jadi c01–c02 sesuai clip-plan · seksi tetap 12 · 0 placeholder
  - tes 16 pass / 0 fail

perbaikan putaran 3 (commit f0729e8) — gejala: klik Proses tanpa respons:
  - akar masalah: router 20128 membuffer SSE. Probe: firstChunkMs 7489, totalMs 7517, 6 chunk tiba bersamaan → tidak ada token inkremental, UI lama diam sampai akhir (25–90 s)
  - ENDPOINT diganti http://127.0.0.1:20128/... (server hanya listen IPv4; [::1] gagal)
  - UI: tombol "Memproses… Ns" + Stop + status "Menunggu token pertama… Ns" / "N karakter diterima", auto-abort 180 s
  - fallback bila proxy membalas JSON utuh walau stream diminta (13 test lulus)
  - verifikasi browser (moli): pada 5 s tampil "Memproses… 5s", "Stop", "Menunggu token pertama… 5s"
  - E2E node di 127.0.0.1: 91,1 s, 12.524 karakter, 12/12 seksi, 0 placeholder, URL terisi; firstTokenMs 90,6 s → konfirmasi buffering penuh