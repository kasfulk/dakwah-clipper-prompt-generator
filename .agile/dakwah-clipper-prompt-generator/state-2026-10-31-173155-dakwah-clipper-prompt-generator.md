scope: dakwah-clipper-prompt-generator
session: 2026-10-31-173155-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-10-31 17:31
classification: SMALL
completed: [coding, testing, verification]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
skipped:
  - BRAINSTORM: permintaan eksplisit (prompt harus memuat judul video dan pemateri)
  - PLAN: satu perubahan kecil pada tiga file prompt
  - DEEP_RESEARCH: sumber data sudah ada di clip-plan (`video_title`, `video_spekar`)
  - CODE_PLAN: satu alur derivasi state → builder prompt
  - CODE_REVIEW: perubahan aditif, tanpa logika baru yang berisiko
  - WORKTREE: satu work stream

permintaan: prompt (sederhana + final) menyertakan Judul video dan Pemateri.

implementasi:
  - src/App.svelte: derived `meta` = JSON clip-plan; `title` dari video_title, `speaker` dari video_spekar; diteruskan ke effectcraftPrompt dan buildFinalPrompt
  - src/lib/prompts.js: blok <Judul video> + <Pemateri> di prompt sederhana; konstanta NOT_SET; nilai non-string dipaksa String()
  - src/lib/finalPrompt.js: placeholder __TITLE__/__SPEAKER__ diisi nilai clip-plan, fallback NOT_SET
  - src/lib/masterPrompt.js: baris "Video title" dan "Speaker" di bawah Source footage
  - src/lib/prompts.test.js: 1 tes baru (judul/pemateri + fallback), teks prompt default ikut diperbarui

catatan: judul/pemateri tidak diinput manual — nilainya diambil dari clip-plan yang ditempel user, sesuai field yang sudah diminta prompt clip plan.
