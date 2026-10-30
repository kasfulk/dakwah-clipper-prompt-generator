# Plan

| # | Task | Files | Tests | Acceptance |
|---|---|---|---|---|
| T1 | Parser YouTube ID (watch/youtu.be/shorts/live/embed, 11 char) + link transcript | `src/lib/youtube.js` | `node --test src/lib/youtube.test.js` | semua varian → ID benar; invalid → null |
| T2 | Template prompt: clip-plan (skema user, URL disubstitusi), effectcraft, ekstraksi JSON dari teks AI | `src/lib/prompts.js` | dicek via T1 test file (kasus ekstraksi) | teks prompt identik spesifikasi; JSON fenced/berpengantar tetap terbaca |
| T3 | UI satu halaman: input URL, tombol transcript, panduan SRT + ChatGPT/Claude, output prompt + copy, form clip-plan, copy, localStorage | `src/App.svelte`, `src/app.css`, `src/main.js`, `index.html` | browser smoke (Chromium) | alur 1→6 bisa diselesaikan, copy bekerja |
| T4 | Build & verifikasi | — | `npm run build`, smoke | build lulus, acceptance criteria terbukti |

Dependencies: T1 → T3; T2 → T3.
Risiko: clipboard API butuh secure context → fallback.

# Code plan
- `src/lib/youtube.js`: `parseYouTubeId(input)`, `transcriptUrl(id)`, `watchUrl(id)`.
- `src/lib/prompts.js`: `clipPlanPrompt(url)`, `effectcraftPrompt(url, clipPlanText)`, `extractJson(text)`.
- `src/App.svelte`: state `url`, `inputId`, `clipPlanInput`, `copied`; derivasi via `$derived`; Svelte 5 runes.
- CSS: variabel tema terang/gelap via `prefers-color-scheme`, kartu step, `textarea` monospace.
- Regresi: tidak ada (greenfield).