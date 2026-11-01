# Verification — Pitfall di final prompt

## Tes & build
```
$ npm test → ℹ tests 20 · pass 20 · fail 0
$ npx vite build → ✓ built in 653ms (index-DwVa-WIN.js 69.41 kB)
```

## Rakit prompt (node)
```
pitfalls: true · SAW: true · SWT: true · no placeholder: true · sections: 13
```

## Browser (moli, fetch distub agar respons AI deterministik)
Seksi final prompt yang dirender:
```
### 1 … ### 11
### 12. PITFALLS
- Never use abbreviations, including in subtitles, hooks, kickers, titles, overlays, and end cards.
- SAW → Sholallahu 'alaihi wa sallam
- SWT → Subhanahu Wa Ta'ala
- Write the full form on every occurrence; never shorten or translate the expanded form.
- Preserve the exact spelling above, including capitalization and punctuation.
### 13. FINAL QUALITY CONTROL
```
→ blok Pitfall muncul di final prompt yang ditampilkan aplikasi, tepat sebelum Final Quality Control.
