# Verification — final prompt menunggu respons AI

## Tes & build
```
$ npm test → ℹ fail 0 (20 pass)
$ npx vite build → ✓ built in 327ms (index-9w_5ykri.js 68.66 kB)
```

## Browser (moli, http://localhost:5199/)
Clip-plan berisi 2 klip. Sebelum proses AI, `fetch` distub agar respons deterministik.

```
{"before":{"outputs":0,"hint":"Belum ada respons AI — final prompt masih kosong.",
           "button":"Proses AI membuat final prompt","buttonDisabled":false},
 "after":{"outputs":1,"hint":"Final prompt siap · respons AI 0s","copyButton":true,
          "rows":["| c01 | Subjek satu | Arah visual satu |","| c02 | Subjek dua | Arah visual dua |"],
          "retainsTitle":true,"noDefaultRows":true,"chars":12387}}
```
→ sebelum respons: tidak ada blok output sama sekali, hanya hint. Sesudah respons: satu blok output, tabel berisi 2 baris hasil AI (baris bawaan c03–c10 hilang), judul video tetap terpasang, tombol copy muncul.

Jalur gagal (output harus tetap kosong):
```
{"fail":{"outputs":0,"hint":"HTTP 500 — boom — kn-b/gpt-6-luna @ http..."},
 "invalid":{"outputs":0,"hint":"Model tidak mengembalikan baris tabel yang valid. — kn-b/gpt..."}}
```

## Respons basi tidak ditampilkan (tindak lanjut review)
`adaptedSig` dicatat saat run dimulai; `inputSig` = `[id, plan.text, palette, layout, accountsText(accounts)]`. Final prompt hanya dirender bila `adaptedSig === inputSig`.

```
afterRun        outputs=1  "Final prompt siap · respons AI 0s"
afterEdit       outputs=0  "Input berubah sejak respons AI terakhir — jalankan ulang AI ..."
afterRerun      outputs=1  "Final prompt siap · respons AI 0s"
afterAccountAdd outputs=1  (baris akun kosong tidak mengubah isi prompt → tetap fresh)
withUser        outputs=0  "Input berubah ..." (username diisi → basi)
```
→ mengubah palet/layout/plan/username/URL menyembunyikan final prompt sampai AI dijalankan ulang; menambah baris akun kosong tidak memicu pemborosan proses.
