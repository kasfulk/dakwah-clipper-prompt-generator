# Verification — larangan ornament di wajah

## Tes & build
```
$ npm test → ℹ tests 20 · pass 20 · fail 0
$ npx vite build → ✓ built in 974ms (index-ChHdOdUO.js 69.66 kB)
```

## Rakit prompt (node)
```
### 12. PITFALLS
- … (aturan singkatan + ekspansi SAW/SWT) …
- If the video shows a face, never place any ornament on it: no frames, borders, stickers, callouts, texture, graphic shapes, or typography may cover the face.
sections: 13 | placeholders: false
```

## Browser (moli, fetch distub)
```
{"faceRule":true,
 "qcFace":true,        # 6. No typography, ornament, or graphic overlaps the speaker's face.
 "qcHonorific":true,   # 12. All honorifics are written in full — no SAW or SWT abbreviations.
 "qcLast":true}        # 13. … optimized for TikTok, Instagram Reels, and YouTube Shorts.
```
→ aturan wajah tampil di PITFALLS dan ditegakkan juga oleh checklist Final Quality Control.
