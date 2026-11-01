scope: dakwah-clipper-prompt-generator
session: 2026-10-31-232036-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-10-31 23:20
classification: SMALL
completed: [coding, testing, verification]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
skipped:
  - BRAINSTORM: aturan eksplisit dari user
  - PLAN: satu butir PITFALLS + penegasan di checklist QC
  - DEEP_RESEARCH: tidak ada ketidakpastian eksternal
  - CODE_PLAN: teks statis di satu file
  - CODE_REVIEW: tanpa logika baru
  - WORKTREE: satu work stream

permintaan: bila video menampilkan wajah, jangan diberi ornament apa pun.

implementasi:
  - src/lib/masterPrompt.js PITFALLS: butir baru — wajah tidak boleh tertutup frame, border, sticker, callout, tekstur, bentuk grafis, atau tipografi
  - src/lib/masterPrompt.js checklist QC 13: butir 6 diperluas (tipografi/ornamen/grafik tidak menutupi wajah), butir baru 12 "All honorifics are written in full — no SAW or SWT abbreviations", butir lama 12 bergeser ke 13
