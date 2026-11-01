# Verification — akun sosmed

Server: `npx vite --port 5199` (localhost). Browser: moli (perilaku) + CDP paint (visual).

## 1. Baris dinamis, label dropdown, ikon, injeksi prompt — moli eval
```
{"rowCount":2,
 "rows":[{"icon":"M12 0C8.74 0 8.333.015 7","platform":"Instagram","username":"kajian.tv"},
         {"icon":"M12.525.02c1.31-.02 2.61","platform":"Tiktok","username":"  "}],
 "options":["Tiktok=TikTok","Instagram=Instagram","YoutubeShort=YouTube Shorts","Facebook=Facebook","Linkedin=LinkedIn"],
 "finalHasAccount":true,
 "commandHasAccount":true,
 "emptyRowIgnored":true,
 "placeholdersLeft":false,
 "stored":"[{\"platform\":\"Instagram\",\"username\":\"kajian.tv\"},{\"platform\":\"Tiktok\",\"username\":\"  \"}]"}
```
→ 2 klik tambah = 2 baris; ikon berganti saat platform diganti (path Instagram); username spasi diabaikan; final prompt memuat `**Social accounts to display & credit:**\n\n- Instagram: @kajian.tv`; prompt sederhana memuat `<Akun Sosmed>\n- Instagram: @kajian.tv`; tidak ada `__PLACEHOLDER__` tersisa; localStorage terisi.

## 2. Restore localStorage, fallback platform asing, hapus baris — moli iframe (load baru)
```
{"restored":["Linkedin/ustadz","Tiktok/x","YoutubeShort/@kajian"],
 "afterRemove":["Tiktok/x","YoutubeShort/@kajian"],
 "savedAfterRemove":"[{\"platform\":\"Tiktok\",\"username\":\"x\"},{\"platform\":\"YoutubeShort\",\"username\":\"@kajian\"}]",
 "unknownPlatformFallback":"Tiktok/x"}
```
→ nilai tersimpan dipulihkan, platform tak dikenal jatuh ke TikTok, tombol × menghapus baris dan menyimpan ulang.

## 3. Visual — CDP captureScreenshot 900×1400
Ikon bulat per platform (TikTok/Instagram/YouTube), select + input username + × sejajar satu grid, tombol "+ Tambah akun" dengan ikon plus, penomoran 6/7/8/9 benar.

## Kriteria terima
1. tambah/hapus baris + persist → §1, §2 ✓
2. 5 platform berlabel benar, ikon mengikuti pilihan → §1, §3 ✓
3. final prompt memuat akun / teks default, tanpa placeholder → §1 + tes `final prompt mengisi __SOCIAL__` ✓
4. prompt sederhana memuat `<Akun Sosmed>` → §1 ✓
5. `npm test` 19/19 + `vite build` → test-report ✓
