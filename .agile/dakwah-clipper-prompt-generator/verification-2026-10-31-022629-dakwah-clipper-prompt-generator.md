# Verification

Setiap kriteria dibuktikan dengan perintah/observasi yang dijalankan, bukan penalaran.

| Kriteria | Bukti |
|---|---|
| Input link YouTube → ID | `npm test`: 6 kasus link (watch+t, youtu.be+si, m., shorts, live, embed, tanpa skema) → ID sama; host asing → null |
| Tombol ke youtube-transcript.io | Browser `http://localhost:4173/`, URL `youtu.be/dQw4w9WgXcQ?si=test` → `a[href]` = `https://www.youtube-transcript.io/videos?id=dQw4w9WgXcQ` |
| Panduan unduh SRT | `section.step` berjumlah 6; langkah 3 dirender (`Download` → `SRT`) |
| Panduan upload ke ChatGPT/Claude | Langkah 4 dirender dengan tautan `https://chatgpt.com/` dan `https://claude.ai/new` |
| Prompt 10 Clip Plan sesuai format + URL terisi | `pre` pertama = persis teks spek dengan URL sumber; test `prompt clip plan memakai format user dengan URL terisi` |
| Form clip-plan → perintah effectcraft | `pre` kedua diawali `Buatkan Clip Video dengan effectcraft-from-opendesign dari …`, diikuti baris kosong, `Dengan clip-plan:`, lalu clip-plan raw (subtitle tetap satu baris per entri) |
| Copy menyalin persis | `clipboardRead()` === teks `pre` untuk kedua prompt (Chromium headless) |
| Clip-plan dari balasan AI (```json + kalimat pengantar) | Terekstrak; indikator `1 klip terdeteksi` |
| Clip-plan invalid | `bukan json` → pesan error tampil, output perintah tidak dirender |
| Temuan review | `evil.com/watch?v=…` → error, tanpa prompt; clip-plan memuat `$&` tersalin literal; console `[]` |
| Build | `npm run build` exit 0 (`dist/index.html` 0.58 kB, JS 39 kB / gzip 15.37 kB) |
| Layout | Screenshot 390px & 1280px: `scrollWidth === innerWidth`, tak ada elemen keluar layar; tombol copy tidak menimpa teks |
| Persistensi | Reload → `#url` tetap terisi (localStorage) |

Perintah yang dijalankan: `npm test`, `npm run build`, `npm run preview -- --port 4173`, Chromium headless via eval (`http://localhost:4173/`).

## Putaran akhir (setelah penyesuaian verbatim + validasi)

| Kriteria | Bukti (Chromium, build produksi) |
|---|---|
| Perintah effectcraft memakai URL persis seperti spek | baris pertama `pre` = `Buatkan Clip Video dengan effectcraft-from-opendesign dari https://youtube.com/watch?v=dQw4w9WgXcQ` (tanpa `www`) |
| Prompt clip plan tetap memakai `www` di `source_url` | `"source_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"` |
| Copy perintah | `clipboardRead()` identik dengan `pre` |
| JSON tanpa array `clips` | pesan `Clip-plan harus berupa objek JSON dengan array "clips" …`, output tidak dirender |
| Console | `[]` |
