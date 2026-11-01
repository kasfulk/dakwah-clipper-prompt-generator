# Dakwah Clipper Prompt Generator

Aplikasi web untuk menyusun prompt CapCut/editor dari satu video YouTube kajian: ambil transkrip SRT, tempel clip-plan dari ChatGPT/Claude, lalu keluar prompt final yang siap dipakai.

## Alur

1. Tempel link YouTube → ID video diambil otomatis.
2. Tombol membuka [youtube-transcript.io](https://www.youtube-transcript.io) untuk mengunduh transkrip `.srt`.
3. Prompt **Clip Plan** (10 klip, format JSON) disalin ke ChatGPT/Claude bersama file SRT.
4. JSON clip-plan hasil model ditempel kembali ke aplikasi.
5. Isi palet warna, layout video, akun sosial media, dan alat video (effectcraft / remotion / hyperframes) — semuanya bisa disimpan permanen.
6. Prompt **final** dirakit lokal, lengkap dengan master prompt, tabel arah visual, dan daftar pitfalls.
7. Opsional: sambungkan layanan OpenAI-compatible untuk menyusun ulang tabel seksi 10 (URL, model, API key disimpan di `localStorage` browser, tidak pernah dikirim ke mana pun selain endpoint yang kamu isi sendiri).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 34 test, node:test
npm run build    # dist/ statis
```

Tidak ada backend. Semua state ada di `localStorage` browser.

## Struktur

| Berkas | Isi |
|---|---|
| `src/lib/youtube.js` | parsing ID video |
| `src/lib/prompts.js` | prompt clip-plan + prompt sederhana |
| `src/lib/masterPrompt.js` | master prompt & seksi final |
| `src/lib/finalPrompt.js` | perakitan prompt final |
| `src/lib/social.js` | platform & format akun |
| `src/lib/tools.js` | pilihan alat video |
| `src/lib/llm.js` | config layanan AI & adaptasi tabel |
| `src/lib/storage.js` | persistensi `localStorage` |
| `src/App.svelte` | UI |

## Lisensi

Belum ditentukan.