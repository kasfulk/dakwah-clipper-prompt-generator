# Verification — form reset saat refresh

## Tes & build
```
$ npm test  → ℹ pass 19 · fail 0
$ npx vite build → ✓ built in 340ms (index-PdrkUTZ0.js 68.20 kB)
```

## Browser (moli, http://localhost:5199/)
Skenario: tanam nilai lama di `localStorage` (`clipgen.url`, `clipgen.plan`, `clipgen.palette`, `clipgen.accounts`), isi form di dokumen utama (URL + 2 baris akun), lalu muat ulang aplikasi di iframe.

```
{"afterReload":{"url":"","plan":"","palette":"","layout":"","rows":0,"pres":0}}
```
→ tidak ada satu pun field atau baris akun yang dipulihkan; nilai localStorage lama diabaikan; tidak ada output prompt yang terbentuk.

Kontrol: pengisian form sebelum reload tetap berfungsi (`#url` terisi, 3 `<pre>` muncul), jadi reset bukan karena binding rusak.

## Koreksi harness (anomali `beforeReload.url` = "")
Percobaan pertama melaporkan `beforeReload.url` kosong padahal `reset2` menunjukkan nilai bertahan. Penyebabnya bug harness, bukan bug aplikasi: helper `val()` membaca lewat `doc`, dan `doc` baru di-assign ke `document` milik iframe (aplikasi yang baru dimuat). Jadi `beforeReload` membaca dokumen iframe (yang memang kosong), bukan dokumen utama. Bukti pendukung: `reset2` dengan urutan set → klik copy → klik tambah mempertahankan `#url` terisi dan `<pre>` terbentuk; kontrol pengisian form di laporan di atas juga hijau. Tidak ada reset tak terduga.
