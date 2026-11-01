# Brainstorm — akun sosmed dinamis

## Masalah
Prompt generator belum punya tempat menuliskan akun sosial media yang harus muncul/dikreditkan di video, padahal hasil akhirnya untuk TikTok/Reels/Shorts multi-platform.

## Kebutuhan
- Array baris: dropdown platform (Tiktok, Instagram, YoutubeShort, Facebook, Linkedin) + input username.
- Dinamis: tombol tambah, tombol hapus per baris.
- Ikon platform per baris.
- Nilai harus dipakai prompt (simple prompt + final prompt), bukan hanya hiasan UI.
- Bertahan setelah reload.

## Keputusan
- Sumber tunggal data: `src/lib/social.js` (PLATFORMS + accountsText). UI dan dua builder prompt mengimpor dari sana.
- Format prompt: `- TikTok: @handle`, satu baris per akun; username kosong dilewati; kosong semua → `Tidak ada akun sosial media yang ditentukan.`
- `@` di awal username dinormalisasi (satu `@` di output).
- Placeholder baru `__SOCIAL__` di MASTER PROMPT, tepat setelah Source footage.
- Persist `clipgen.accounts` (JSON) mengikuti pola key `clipgen.*` yang ada.
- Urutan langkah UI: sisip sebagai langkah 7, langkah lama 7→8 dan 8→9.

## Kriteria terima
1. Klik "Tambah akun" menambah baris; "×" menghapus baris; state tersimpan.
2. Dropdown berisi 5 platform dengan label benar dan ikon ikut berubah.
3. Final prompt memuat daftar akun; tanpa akun memuat teks default; tidak ada `__SOCIAL__` tersisa.
4. Prompt sederhana memuat blok `<Akun Sosmed>`.
5. `npm test` dan `vite build` hijau.
