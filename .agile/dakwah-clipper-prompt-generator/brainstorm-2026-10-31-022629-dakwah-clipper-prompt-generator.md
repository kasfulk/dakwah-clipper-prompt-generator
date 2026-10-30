# Brainstorm — dakwah clip prompt generator

## Problem
Operator dakwah clips: dari link YouTube → transkrip SRT (via youtube-transcript.io, di luar aplikasi) → tempel ke ChatGPT/Claude untuk dapat clip plan → lalu minta efek "effectcraft-from-opendesign" memotong klip. Menyalin URL dan menata prompt manual rawan salah format.

## Requirements (dari user)
1. Input link YouTube; ambil `youtube-id`.
2. Tombol buka `https://www.youtube-transcript.io/videos?id=<youtube-id>`.
3. Panduan download SRT.
4. Panduan upload SRT ke ChatGPT / Claude.
5. Generate prompt "10 Clip Plan" dengan `YOUTUBE_URL` sudah terisi, sesuai skema JSON yang diminta.
6. Form kedua: input clip-plan JSON → generate prompt `Buatkan Clip Video dengan effectcraft-from-opendesign dari <url>` + clip-plan.

## Constraints
- Client-only, tanpa AI, tanpa backend. Vite + Svelte.
- Prompt harus identik dengan format yang dispesifikasikan user (tidak boleh "diperbaiki").
- Copy-to-clipboard wajib (output dipakai di chat AI).

## Edge cases
- URL varian: `watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, `/embed/`, parameter tambahan. ID tidak valid → step berikut terkunci.
- Clip-plan yang ditempel bisa berisi pagar ```json atau kalimat pengantar → ekstraksi blok JSON pertama.
- JSON tidak valid → tampilkan error, prompt tidak dibuat.
- Clipboard ditolak browser (bukan secure context) → fallback `execCommand`.
- State hilang saat reload → simpan URL & clip-plan di localStorage.

## Decisions
- Tanpa parsing SRT (upload ke ChatGPT/Claude di luar aplikasi; app hanya memberi instruksi).
- Embed clip-plan apa adanya (raw) agar ribuan baris subtitle tidak melebar akibat pretty-print.
- Satu halaman, tanpa router.

## Acceptance criteria
- Menempel lima varian URL menghasilkan ID benar dan link transcript benar.
- Prompt clip plan memuat URL sumber dua kali (`source_url` contoh format) dan skema persis.
- Clip-plan valid → prompt effectcraft persis format user; JSON invalid → pesan error.
- Tombol copy menyalin teks persis.
- `npm run build` lulus; UI terverifikasi di browser.