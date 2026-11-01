scope: dakwah-clipper-prompt-generator
session: 2026-10-31-175348-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-10-31 17:53
classification: SMALL
completed: [coding, testing, verification]
current: []
next: []
shares_scope_with: dakwah-clipper-prompt-generator
skipped:
  - BRAINSTORM: intent diklarifikasi langsung dengan user ("sampai response AI selesai")
  - PLAN: satu perubahan gating pada satu file + copy
  - DEEP_RESEARCH: tidak ada ketidakpastian eksternal
  - CODE_PLAN: satu kondisi derived + blok UI
  - CODE_REVIEW: perubahan kecil, tanpa jalur data baru
  - WORKTREE: satu work stream

permintaan: Final Prompt kosong sampai respons AI selesai; baru tampil setelahnya.

implementasi:
  - src/App.svelte: finalPrompt = derived yang mensyaratkan `rows` (respons AI) terisi; tanpa respons → string kosong
  - tombol "Kembali ke tabel bawaan" dihapus (tanpa respons AI, tidak ada prompt untuk ditampilkan)
  - label aksi: "Proses AI membuat final prompt"; hint "Belum ada respons AI — final prompt masih kosong." dan "Final prompt siap · respons AI Ns"
  - deskripsi seksi 9 diperbarui: hasil kosong selama proses berjalan

konsekuensi: bila router 20128 gagal/memotong request, final prompt tidak muncul sama sekali dan error ditampilkan di seksi 9 — sesuai keputusan user.

lanjutan (review): respons basi diinvalidasi.
  - src/App.svelte: `adaptedSig` ($state) + `inputSig`/`fresh` derived; sig diambil saat runAdapt dimulai dan disimpan hanya pada sukses
  - final prompt dirender hanya bila `fresh`; hint baru "Input berubah sejak respons AI terakhir — jalankan ulang AI"
  - sig memakai `accountsText(accounts)`, jadi menambah baris akun kosong tidak membatalkan respons
