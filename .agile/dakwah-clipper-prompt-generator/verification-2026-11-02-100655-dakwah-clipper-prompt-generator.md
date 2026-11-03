```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-02-100655-dakwah-clipper-prompt-generator
stage: VERIFICATION
status: PASS
```

## Acceptance criteria → evidence

| # | Criterion | Command | Result |
|---|---|---|---|
| 1 | Clip plan no longer caps clips at 30–75 s | `node -e "clipPlanPrompt(...)"` filtered rules | Rules 7–9 print: "KELENGKAPAN PEMBAHASAN LEBIH PENTING DARIPADA DURASI", "Tidak ada batas durasi maksimum", "Jangan memilih klip di bawah 45 detik" |
| 2 | Clip must not end mid-discussion | same | Rule 6 ends "…akhiri setelah kalimat terakhir pembahasan itu benar-benar tuntas" |
| 3 | Self-validation enforces completeness | same | Validation lists "Tidak ada kalimat yang terpotong…" and "Setiap pembahasan selesai di dalam klipnya…" |
| 4 | Master prompt has video-use skip-silence finishing section | `node -e "buildFinalPrompt(...)"` | `### 12. FINISHING PASS WITH \`video-use\` — SKIP SILENCE` present |
| 5 | video-use installed as mandatory tooling | same | `install \`effectcraft-from-opendesign\`, \`opendesign\`, and \`video-use\`` |
| 6 | Sections still numbered 1..14, no duplicate | same | headings 1–14 printed in order |
| 7 | No placeholder left, template parses | `npm test` | 38 pass / 0 fail |
| 9 | Prompt text pinned by a regression guard | `npm test` | new test asserts no `30–75`, section 12, `video-use` tooling |
| 8 | App builds | `npm run build` | `✓ built in 319ms` |

## Captured output (abridged)

```
### 12. FINISHING PASS WITH `video-use` — SKIP SILENCE
### 13. PITFALLS
### 14. FINAL QUALITY CONTROL
```

```
ℹ tests 38
ℹ pass 38
ℹ fail 0
```

```
dist/assets/index-CbIpoCBB.js   88.91 kB │ gzip: 35.56 kB
✓ built in 319ms
```

Regression guard: `src/lib/llm.test.js` and `src/lib/prompts.test.js` assertions updated to the new section count (14) and tooling sentence; the suite is green.