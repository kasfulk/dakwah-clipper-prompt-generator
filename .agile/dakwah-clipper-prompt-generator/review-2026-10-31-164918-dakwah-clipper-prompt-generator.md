# Code review — akun sosmed

Verdict: PASS

- Kontrak prompt: accountsText satu-satunya formatter; dipakai prompt sederhana dan final prompt → tidak ada format ganda.
- Keamanan injeksi penggantian string: `__SOCIAL__` diganti lewat fungsi, jadi username berisi `$&`/`$1` disalin literal (ada tes).
- Data restore: entri localStorage dengan platform tak dikenal atau non-string dinormalisasi; JSON rusak jatuh ke array kosong.
- Aksesibilitas: select/input punya `aria-label` per baris, tombol hapus berlabel, ikon `aria-hidden`, focus ring ikut select.
- Renumber langkah konsisten dengan lede/footer.
- Cakupan tes: 3 tes baru, semuanya perilaku yang bisa rusak (format, injeksi, `$`).
- Catatan: assertion tes clip-plan lama disesuaikan ke format subtitle objek milik user (perubahan user yang belum di-commit), bukan penurunan cakupan.
