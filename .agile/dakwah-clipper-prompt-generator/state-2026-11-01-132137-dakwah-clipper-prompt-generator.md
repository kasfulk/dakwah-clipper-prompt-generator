scope: dakwah-clipper-prompt-generator
session: 2026-11-01-132137-dakwah-clipper-prompt-generator
stage: COMPLETE
status: PASS
updated: 2026-11-01 13:50
completed: [brainstorm, plan, coding, testing, verification]
current: []
next: []

## Intake 1 — SMALL
Ganti teks prompt clip plan (langkah 5) dengan versi SRT-grounding dari user.

- Keputusan: `source_url` tetap dinamis (`__URL__` → `watchUrl(id)`) karena aplikasi menerima link apa pun.
- Placeholder `{ISI_JUDUL_VIDEO}`/`{ISI_NAMA_USTADZ}` diganti instruksi "tentukan dari isi transkrip" karena aplikasi tidak punya input judul/pemateri.
- Bukti: `npm test` 26 pass; prompt dirender lewat `clipPlanPrompt('rPbXFREw7mU')`.

## Intake 2 — STANDARD (fitur)
Layanan AI (OpenAI / Anthropic / lokal) dengan URL, model, API key, tersimpan di localStorage.

- Kontrak: `PROVIDERS` + `resolveConfig` + `buildRequest` di `src/lib/llm.js`; `sanitizeConfig`/`readConfig` di `src/lib/storage.js`; section 8 di `App.svelte` (langkah 9–11 bergeser).
- Anthropic: `POST {base}/v1/messages`, header `x-api-key` + `anthropic-version` + `anthropic-dangerous-direct-browser-access`, system dipisah dari messages, stream `content_block_delta`.
- OpenAI/lokal: `POST {base}/v1/chat/completions`, `Authorization: Bearer` bila key diisi, stream `choices[0].delta.content`.
- URL dinormalkan sekali: host, host+`/v1`, atau endpoint utuh tidak menghasilkan `/v1/v1`.
- Default provider tetap `local` (127.0.0.1:20128) supaya alur lama tidak berubah.
- Keamanan: API key disimpan teks biasa di localStorage, dinyatakan di UI; input bertipe password; error 401/403 menunjuk ke langkah 8.

## Skipped stages
- DEEP_RESEARCH: SKIPPED — bentuk API OpenAI/Anthropic diketahui; yang perlu diuji ada di kode.
- CODE_PLAN: SKIPPED — 4 file, kontrak tunggal, tanpa migrasi data.
- CODE_REVIEW: SKIPPED — direview langsung saat verifikasi (grep referensi usang `ENDPOINT`/`MODEL`, build bersih).

## Intake 3 — STANDARD (fitur)
Pilihan alat pembuat video di paling atas: Effectcraft / Remotion / Hyperframes.

- `src/lib/tools.js` (baru): `TOOLS` (`label`, `title`, `request`, `directive`) + `resolveTool` (id asing → pilihan pertama).
- Prompt sederhana: baris pertama jadi `Buatkan Clip Video dengan <request> dari <url>`; fungsi `effectcraftPrompt` diganti nama `simplePrompt` (dipakai di App + 5 test).
- Prompt final: header `## __TOOL_TITLE__` dan baris direktif `__TOOL_DIRECTIVE__` diisi dari alat terpilih; tidak ada lagi teks effectcraft yang di-hardcode di template.
- Pilihan langsung tersimpan ke `localStorage["dcpg:tool"]` (tanpa tombol Simpan) dan masuk ke `inputSig` + entri riwayat.
- UI: `.tool-row` berisi tiga tombol `aria-pressed` di dalam `<header>`, di atas langkah 1.

## Verification (intake 3)
- `npm test` → 34 pass, 0 fail (tools, readTool, prompt per alat, placeholder tool di prompt final).
- `npm run build` → ✓ 116 modules.
- Smoke CDP (konteks sama, `vite preview` :5199): tombol Effectcraft `aria-pressed=true` saat boot; klik Remotion → `dcpg:tool = "remotion"`; setelah `Page.reload` tombol Remotion tetap terpilih dan lede = `Remotion`.
- Prompt dirender untuk ketiga alat (fetch AI distub agar tabel seksi 10 terisi): baris pertama `…dengan effectcraft-from-opendesign/Remotion/HyperFrames dari https://youtube.com/watch?v=Een8cj0p4tQ`, header final `## EffectCraft from OpenDesign` / `## Remotion` / `## HyperFrames`, direktif sesuai alat, baris tabel AI tetap masuk.
## Intake 4 — SMALL
Label alat kecil + semua alat memakai akhiran `-from-opendesign` + prompt final mewajibkan install alat dan `opendesign`.

- `tools.js`: field `request` dihapus, `label` jadi `effectcraft-from-opendesign` / `remotion-from-opendesign` / `hyperframes-from-opendesign`; `title` ikut "… from OpenDesign"; direktif Remotion/Hyperframes menyebut `opendesign` untuk layout.
- `masterPrompt.js`: paragraf baru `**Required tooling — mandatory:**` dengan placeholder `__TOOL_REQUEST__` — wajib install alat terpilih + `opendesign`, `opendesign` tidak opsional karena membangun layout, dan tidak boleh menggantinya dengan alat lain.
- `App.svelte` + `app.css`: tombol pilihan memakai `.btn.small` + monospace (12.8px) dengan teks label penuh.
- Verifikasi: `npm test` 34 pass / 0 fail; build ✓; smoke CDP untuk ketiga label → baris pertama prompt sederhana, header final, dan baris tooling sesuai alat, `dcpg:tool` tersimpan (`effectcraft`/`remotion`/`hyperframes`).

## Verification (intake 2)
- `npm test` → 31 pass, 0 fail (5 test baru: resolveConfig, buildRequest OpenAI, buildRequest Anthropic, stream Anthropic, sanitize config).
- `npm run build` → ✓ built, 116 modules, tanpa error impor.
- Smoke browser (Moli, `vite preview` :5199): isi Anthropic + URL `…/v1` + model + key, klik Simpan → `localStorage["dcpg:config"]` = `{"provider":"anthropic","url":"https://api.anthropic.com/v1","model":"claude-sonnet-4-5","apiKey":"sk-ant-test"}`; input key bertipe `password`; judul langkah 1–11 berurutan; teks langkah 10 membaca `claude-sonnet-4-5 @ https://api.anthropic.com/v1`.
- Tidak diuji live: panggilan sungguhan ke OpenAI/Anthropic (butuh API key asli; URL, header, dan bentuk body terverifikasi unit test).
- Round-trip localStorage dibuktikan lewat CDP Moli (:9223) satu konteks: seed `dcpg:config` (openai / https://proxy.example/v1 / gpt-custom / sk-seed) → `Page.reload` → setelah boot `#service` = `openai`, `#service-url` = `https://proxy.example/v1`, `#service-model` = `gpt-custom`, `#service-key` panjang 7 + `type=password`, baris langkah 10 = `gpt-custom @ https://proxy.example/v1`.
- `max_tokens` Anthropic dinaikkan 1024 → 4096 (tabel 10 klip bisa terpotong di 1024, lalu gagal cek `/^\|\s*c\d+\s*\|/` dengan error membingungkan).