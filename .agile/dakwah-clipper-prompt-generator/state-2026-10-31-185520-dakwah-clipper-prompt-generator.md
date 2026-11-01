scope: dakwah-clipper-prompt-generator
session: 2026-10-31-185520-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-10-31 18:55
classification: SMALL
completed: [coding, testing, verification]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
skipped:
  - BRAINSTORM: aturan sudah eksplisit dari user (larangan singkatan + dua ekspansi)
  - PLAN: satu blok teks di template
  - DEEP_RESEARCH: ejaan ekspansi diberikan user
  - CODE_PLAN: satu file template + penyesuaian dua assertion jumlah seksi
  - CODE_REVIEW: teks statis, tanpa logika
  - WORKTREE: satu work stream

permintaan: tambahkan Pitfall di Final Prompt — tanpa singkatan; SAW → Sholallahu 'alaihi wa sallam, SWT → Subhanahu Wa Ta'ala.

implementasi:
  - src/lib/masterPrompt.js: seksi baru "### 12. PITFALLS" berisi larangan singkatan (termasuk subtitle, hook, kicker, judul, overlay, end card), dua pemetaan ekspansi, larangan menyingkat/menerjemahkan bentuk panjang, dan kewajiban menyalin ejaan persis; FInal Quality Control bergeser ke 13
  - src/lib/llm.test.js: assertion jumlah seksi 12 → 13 (dua tempat)

catatan: hanya template final prompt yang berubah; prompt sederhana (effectcraft) tidak disentuh.
