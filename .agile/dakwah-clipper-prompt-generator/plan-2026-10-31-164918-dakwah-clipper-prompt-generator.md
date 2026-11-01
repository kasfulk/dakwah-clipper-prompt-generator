# Plan — akun sosmed

| # | Task | File | Kriteria |
|---|---|---|---|
| 1 | Modul platform + formatter | src/lib/social.js (baru) | accountsText: @ dinormalisasi, kosong dilewati, fallback NO_ACCOUNTS |
| 2 | Sisip `<Akun Sosmed>` ke prompt sederhana | src/lib/prompts.js | effectcraftPrompt(id, plan, palette, layout, accounts) |
| 3 | Sisip `__SOCIAL__` ke MASTER PROMPT + builder | src/lib/masterPrompt.js, src/lib/finalPrompt.js | tanpa sisa placeholder, aman terhadap `$` |
| 4 | State + UI array | src/App.svelte | tambah/hapus, ikon per platform, persist, renumber 7/8/9 |
| 5 | Gaya baris | src/app.css | grid 4 kolom, ikon bulat, select seragam input |
| 6 | Tes | src/lib/prompts.test.js | format akun, injeksi 2 prompt, `$` literal |

Risiko: nama id platform (`YoutubeShort`, `Linkedin`) harus persis seperti permintaan; nilai tak dikenal saat restore localStorage jatuh ke platform pertama.
