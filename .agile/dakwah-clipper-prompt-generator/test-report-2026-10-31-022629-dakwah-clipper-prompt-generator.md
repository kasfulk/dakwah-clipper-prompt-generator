# Test report

## Unit (`npm test` → `node --test src/lib/*.test.js`)

```
✔ parseYouTubeId menerima semua bentuk link
✔ parseYouTubeId menolak input tak valid
✔ transcriptUrl menyusun tautan yang diminta
✔ prompt clip plan memakai format user dengan URL terisi
✔ prompt effectcraft memakai format user
✔ parseClipPlan mengekstrak JSON dari balasan AI
ℹ tests 6 ℹ pass 6 ℹ fail 0
```

## Build

`npm run build` → exit 0, `dist/index.html` 0.58 kB, JS 39.00 kB (gzip 15.37 kB).

## Browser (Chromium, headless, `http://localhost:4173/`, build production)

| Skenario | Hasil |
|---|---|
| `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s` | tombol transcript → `https://www.youtube-transcript.io/videos?id=dQw4w9WgXcQ` |
| `https://youtu.be/dQw4w9WgXcQ?si=test`, `shorts/`, tanpa skema `youtube.com/watch?…` | ID benar |
| Prompt clip plan dirender | mulai `Berikan 10 Clip Plan … dari https://www.youtube.com/watch?v=dQw4w9WgXcQ dengan format:` |
| Copy prompt clip plan | clipboard identik dengan teks yang dirender |
| Clip plan dibungkus ```json + kalimat pengantar | terekstrak; tampil `1 klip terdeteksi` |
| Copy perintah effectcraft | clipboard identik; memuat clip-plan raw (subtitle tetap satu baris per entri) |
| Clip plan `bukan json` | pesan `Clip-plan bukan JSON valid…`, output perintah disembunyikan |
| Reload halaman | URL & clip plan tetap tersimpan (localStorage) |
| Console errors | `[]` |
| Viewport 390 & 1280 | `scrollWidth === innerWidth`, tidak ada elemen keluar layar |

Temuan visual pertama (tombol copy menimpa baris pertama prompt) sudah diperbaiki dengan memindah tombol ke baris sendiri di atas `pre`, diverifikasi ulang lewat screenshot.
## Setelah perbaikan review

`npm test` → 8/8 lulus (tambah: `parseYouTubeId menolak ID YouTube di host lain`, `prompt effectcraft menyalin clip-plan apa adanya, termasuk pola $`). `npm run build` → exit 0.

Browser ulang: `https://evil.com/watch?v=dQw4w9WgXcQ` → error, prompt tidak dirender; clip-plan berisi `$&`/`` $` `` tersalin literal; console `[]`.

## Putaran akhir

`npm test` → 8/8 lulus (test effectcraft dipatok ke URL tanpa `www` sesuai spek; `parseClipPlan` menolak JSON tanpa `clips`). `npm run build` → exit 0. Smoke browser: prompt clip plan + perintah effectcraft benar, copy identik, JSON tanpa `clips` ditolak, console bersih.
