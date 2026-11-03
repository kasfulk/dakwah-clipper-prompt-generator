```yaml
scope: dakwah-clipper-prompt-generator
session: 2026-11-02-100655-dakwah-clipper-prompt-generator
stage: VERIFICATION
status: PASS
updated: 2026-11-02 10:07
classification: SMALL
completed: [brainstorm, plan, coding, testing, verification]
current: []
next: []
```

## BRAINSTORM (compressed)

Requirement: clip plan produced clips that were too short and visibly truncated; the user reviews each video afterwards, so a long complete clip is acceptable. Master prompt must add a `video-use` finishing pass with skip-silence.

Decisions:
- CLIP_PLAN: replace the hard 30–75 s window with "completeness beats duration"; no maximum; soft floor 45 s.
- Clip must end only after the discussion (opening, explanation, evidence, closing) is finished.
- Self-validation now checks "no truncated sentence / discussion closes inside the clip".
- MASTER PROMPT: new section 12 `FINISHING PASS WITH video-use — SKIP SILENCE`; PITFALLS → 13, FINAL QUALITY CONTROL → 14, internal reference fixed.
- `video-use` added to the mandatory tooling install line, so harness installs it.
- QC gained clip-completeness and skip-silence checks; subtitle check strengthened.

## PLAN (short)

1. `src/lib/prompts.js` — rewrite duration rules 7–9, extend clip-selection criteria, extend self-validation.
2. `src/lib/masterPrompt.js` — add section 12, renumber 13/14, fix `section 12` honorific reference, add clip-length guidance to section 8, add video-use to mandatory tooling and audio spec note.
3. Tests — section count 13 → 14, tooling-sentence assertions include `video-use`.
4. New regression guard: no `30–75` in the clip plan, section 12 + mandatory `video-use` in the master template.

Skipped stages:
- DEEP_RESEARCH: SKIPPED — prompt wording only, no external technical uncertainty.
- CODE_PLAN: SKIPPED — two template files, change confined to string literals.
- CODE_REVIEW: SKIPPED — no logic change; SMALL path.