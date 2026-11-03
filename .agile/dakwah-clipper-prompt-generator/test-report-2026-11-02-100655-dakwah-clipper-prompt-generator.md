```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-02-100655-dakwah-clipper-prompt-generator
stage: TESTING
status: PASS
```

# Test report

## Commands

| Command | Result |
|---|---|
| `npm test` (`node --test src/lib/*.test.js`) | 38 tests, 38 pass, 0 fail, 76.9 ms |
| `npm run build` (`vite build`) | `✓ built in 319ms`, `dist/assets/index-CbIpoCBB.js 88.91 kB` |
| `node -e "buildFinalPrompt(...)"` heading dump | `### 1.` … `### 14.` in order, no duplicate |
| `grep -rn "30–75\|75 detik\|durasi" src/App.svelte README.md` | no matches — no UI label to update |

## Coverage of the change

| Test | Guards |
|---|---|
| `buildFinalPrompt mengisi semua placeholder tanpa sisa` | 14 sections, no `__PLACEHOLDER__` left |
| `replaceClipTable mengganti baris klip…` | section count 14 after table substitution |
| `alat terpilih menentukan prompt sederhana dan prompt final` | tooling sentence `install X, opendesign, and video-use` |
| `clip plan tidak membatasi durasi klip, master prompt wajib pass skip-silence` (new) | no `30–75`, no maximum duration, section 12 present, `video-use` in mandatory tooling |
| History-rebuild tests | old saved prompts re-render against the new template without breaking |

## Notes

- First `npm test` after the master-prompt edit failed to import: unescaped backticks inside `MASTER_TEMPLATE` broke the template literal. Fixed by escaping every inserted backtick (`\``). Failures after that were stale assertions pinning the section count and the old tooling sentence; both updated to the intended new text rather than weakened.
- `video-use` is referenced by name only; no local skill by that name exists, so nothing can be executed here. Prompt makes installation mandatory for the harness.