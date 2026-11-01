# Verification — judul & pemateri di prompt

## Tes & build
```
$ npm test → ℹ tests 20 · pass 20 · fail 0
$ npx vite build → ✓ built in 320ms (index-Cnk-xC6Y.js 68.74 kB)
```

## Browser (moli, http://localhost:5199/)
Clip-plan dengan `"video_title":"Kiamat Sudah Dekat"`, `"video_spekar":"Ustadz Ahmad"`:
```
{"preCount":3,"simpleTitle":true,"simpleSpeaker":true,"finalTitle":true,"finalSpeaker":true,
 "placeholdersLeft":false,
 "excerpt":["**Video title:** Kiamat Sudah Dekat\n\n**Speaker:** Ustadz Ahmad"]}
```
→ prompt sederhana memuat `<Judul video>` / `<Pemateri>`; final prompt memuat `**Video title:**` / `**Speaker:**`; tidak ada placeholder tersisa.

Tanpa judul/pemateri di clip-plan:
```
{"fallback":["Judul video>\n(tidak ditentukan)","Video title:** (tidak ditentukan)"],"placeholdersLeft":false}
```

Meta non-string (`video_title: 123`, `video_spekar: null`):
```
{"ok":true,"values":["Video title:** 123","Speaker:** (tidak ditentukan)"],"errors":0}
```
→ tidak crash, tidak ada galat render.
