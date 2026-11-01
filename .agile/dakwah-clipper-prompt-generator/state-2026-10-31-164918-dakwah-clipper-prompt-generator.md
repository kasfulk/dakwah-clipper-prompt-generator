scope: dakwah-clipper-prompt-generator
session: 2026-10-31-164918-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-10-31 16:55
classification: SMALL
completed: [brainstorm, plan, coding, code_review, testing, verification]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
skipped:
  - DEEP_RESEARCH: tidak ada ketidakpastian eksternal; ikon memakai path simple-icons yang sudah baku
  - CODE_PLAN: satu fitur kohesif, kontrak prompt sudah jelas saat intake
  - WORKTREE: satu work stream tanpa cabang paralel

permintaan: input baru berupa array akun sosmed (dropdown Tiktok/Instagram/YoutubeShort/Facebook/Linkedin + username), dinamis, dengan ikon dan tombol tambah.

implementasi:
  - src/lib/social.js: PLATFORMS (id persis sesuai permintaan, label rapi, glyph 24x24), platformIcon, accountsText, NO_ACCOUNTS
  - src/lib/prompts.js: blok <Akun Sosmed> pada prompt sederhana; effectcraftPrompt menerima accounts
  - src/lib/finalPrompt.js + masterPrompt.js: placeholder __SOCIAL__ ("Social accounts to display & credit") setelah Source footage
  - src/App.svelte: langkah 7 "Akun sosial media" (tambah/hapus baris, ikon mengikuti pilihan, persist localStorage clipgen.accounts), langkah 8/9 dinomori ulang, lede + footer 1–9
  - src/app.css: .account-row grid, .account-icon, .account-remove, .btn .plus; select ikut gaya input + focus ring
  - src/lib/prompts.test.js: 3 tes baru (format akun, injeksi ke prompt sederhana, injeksi ke final prompt termasuk username berisi $)

catatan: working tree juga memuat perubahan user pada CLIP_PLAN (subtitle objek + source 32:12). Assertion tes lama yang memaku format array lama disesuaikan ke format baru user agar suite hijau.
