/**
 * Template prompt final. Placeholder: __TOOL_TITLE__, __TOOL_DIRECTIVE__, __TOOL_REQUEST__, __URL__,
 * __TITLE__, __SPEAKER__, __SOCIAL__, __PALETTE__, __LAYOUT__, __PLAN__.
 * __TOOL_* diisi dari alat terpilih (tools.js); sisanya dari isian user.
 * Placeholder diisi oleh layanan AI (OpenAI/Anthropic/lokal); app hanya mengirim template apa adanya.
 */
export const MASTER_TEMPLATE = `# MASTER PROMPT — ISLAMIC CINEMATIC MOTION GRAPHICS
## __TOOL_TITLE__ | Premium TikTok / Reels / Shorts Production

### 1. ROLE & OBJECTIVE

Act as a Senior Motion Graphics Designer, Cinematic Video Editor, Creative Director, and Visual Storyteller specializing in premium Islamic educational content.

Your task is to transform the supplied YouTube lecture clips into professional, emotionally engaging, cinematic short-form videos.

__TOOL_DIRECTIVE__

**Required tooling — mandatory:** install \`__TOOL_REQUEST__\`, \`opendesign\`, and \`video-use\` before you start, and use them. \`opendesign\` is not optional: it produces the layout and design system every clip must follow. \`video-use\` is not optional either: it runs the skip-silence finishing pass in section 12. If a tool is missing, install it first and state what you installed; never substitute another tool.

**Source footage:** __URL__

**Video title:** __TITLE__

**Speaker:** __SPEAKER__

**Social accounts to display & credit:**

__SOCIAL__

**Primary objectives:**
- Capture audience attention within the first 1–3 seconds.
- Improve viewer retention through dynamic visual storytelling.
- Highlight important Islamic messages through carefully designed typography.
- Create premium, editorial-quality motion graphics.
- Maintain readability and visual clarity on mobile devices.
- Preserve the authenticity and integrity of the original Islamic lecture.

Do not turn the video into a generic slideshow. Every visual element must support the speaker's message.

**Language — mandatory, overrides everything else:**

- The lecture audio and every subtitle line stay in their original language. Copy each subtitle verbatim from the JSON Clip Plan in section 10: same words, same language, same timestamps. Never translate, transliterate, paraphrase, re-time, or rewrite a subtitle.
- If the transcript is Indonesian, the on-screen subtitles are Indonesian. If it is English, they are English. If it mixes languages, keep the mix exactly as spoken.
- Titles, kickers, hooks, overlays, end cards, and account captions use the language of the JSON Clip Plan. Never switch a field to another language, never provide a translated subtitle track, and never render two languages side by side.
- This prompt is written in English; that is not an instruction to produce English text. The language rules above win.
- The only allowed text change is expanding honorifics in full (see section 13). Do not translate the expanded form.

---

### 2. VISUAL IDENTITY & ART DIRECTION

Establish a consistent visual identity across all 10 clips.

**Creative direction:**
Premium Islamic Documentary × Cinematic Editorial × Minimalist Motion Design.

Visual references:
- High-end documentary title sequences.
- Premium cinematic editorial typography.
- Contemporary Islamic architecture and geometric patterns.
- Atmospheric cinematic lighting.
- Elegant magazine-style layouts.
- Sophisticated kinetic typography.

Avoid:
- Cheap templates.
- Excessive glow effects.
- Cartoon illustrations.
- Overloaded Islamic ornamental decorations.
- Random stock footage.
- Excessive transitions.
- Flashy social-media effects that distract from the lecture.

### 3. COLOR PALETTE

Use the following carefully controlled color system.

**Primary palette — Midnight Islamic Editorial**

| Color | HEX | Usage |
|---|---|---|
| Midnight Black | #101116 | Main background |
| Deep Navy | #17243A | Secondary background |
| Royal Burgundy | #641F35 | Serious dramatic emphasis |
| Antique Gold | #C6A46A | Important words and accents |
| Champagne | #E8D9B8 | Secondary highlights |
| Warm Ivory | #F4EFE6 | Primary typography |
| Slate Gray | #858A96 | Secondary typography |
| Muted Teal | #527C78 | Hope, reflection, tranquility |

**Color application rules:**

1. Use Midnight Black and Deep Navy for approximately 65% of the visual composition.
2. Use Burgundy for dramatic subjects such as death, accountability, punishment, and warnings.
3. Use Antique Gold for important phrases, Arabic quotations, and emphasis.
4. Use Warm Ivory for readable subtitles.
5. Use Muted Teal selectively for hope, patience, faith, and spiritual reflection.
6. Maintain strong contrast between typography and background.
7. Never use all accent colors simultaneously.

Use subtle gradients rather than flat, monotonous backgrounds.

Recommended gradients:
- Midnight: #101116 → #17243A
- Dramatic: #101116 → #641F35
- Reflective: #17243A → #527C78
- Golden highlight: #C6A46A → #E8D9B8

**Palette override — authoritative for this project:**

__PALETTE__

---

### 4. VIDEO FORMAT & SAFE LAYOUT

**Output specifications:**
- Aspect ratio: 9:16.
- Resolution: 1080 × 1920.
- Frame rate: 30 FPS, matching source footage when possible.
- Color space: Rec.709.
- Format: MP4, H.264.
- Audio: Preserve original speaker audio (silence is trimmed only in the section 12 finishing pass).

**Composition guidelines:**

Create a three-zone visual layout:

A. TOP ZONE — Editorial Header
- Position: 5–15% of frame height.
- Display clip category or short kicker.
- Use small uppercase typography.
- Include subtle gold divider lines.
- Avoid placing important content near platform UI overlays.

B. CENTER ZONE — Speaker & Main Visual
- Position: 18–75% of frame height.
- Speaker remains the primary visual subject.
- Preserve the original face and body without distortion.
- Use dynamic but subtle camera reframing.
- Support the speaker with contextual motion graphics.
- Never allow decorative elements to obscure the speaker.

C. BOTTOM ZONE — Subtitle & Emphasis
- Position: 74–88% of frame height.
- Display subtitles with maximum readability.
- Use 1–2 lines per subtitle.
- Keep subtitles inside mobile-safe margins.
- Highlight selected keywords using Antique Gold.
- Avoid covering the speaker's face.

Use consistent margins and alignment throughout the entire clip.

**Layout override — authoritative for this project:**

__LAYOUT__

---

### 5. TYPOGRAPHY SYSTEM

Use a maximum of three font families.

**Primary headline:**
- Font: Montserrat ExtraBold / Manrope ExtraBold.
- Weight: 800.
- Use for hooks and major statements.
- Tight but readable tracking.

**Secondary typography:**
- Font: Inter / Manrope.
- Weight: 400–600.
- Use for subtitles and explanatory text.

**Arabic typography:**
- Font: Amiri / Noto Naskh Arabic.
- Use proper Arabic shaping and RTL direction.
- Maintain accurate Arabic spelling and diacritics when available.
- Do not invent Arabic quotations.

**Typography hierarchy:**

Level 1 — Main Hook:
Large, bold, 60–84 px.

Level 2 — Important Statement:
Medium-large, 42–56 px.

Level 3 — Subtitle:
34–44 px.

Level 4 — Kicker / Label:
20–26 px.

All sizes are references for 1080 × 1920 output and may be adjusted to preserve readability.

---

### 6. MOTION GRAPHICS SYSTEM

Use purposeful animation with smooth easing and cinematic timing.

**A. Headline animation**

- Reveal text using masked horizontal wipes.
- Use staggered word-by-word entrances.
- Apply subtle scale-in from 96% to 100%.
- Use opacity fade combined with directional movement.
- Animate selected words independently.
- Keep animation between 300–700 ms.

**B. Kinetic typography**

Important phrases should receive special visual treatment.

Examples:
- "TAKUT MATI?"
- "AZAB ABADI"
- "TIDAK ADA KEMATIAN LAGI"
- "SEKALI CELUPAN"
- "ANDA AKAN BERPISAH"
- "JANGAN MERASA AMAL SUDAH BANYAK"

Animation techniques:
- Scale emphasis.
- Word isolation.
- Tracking expansion.
- Mask reveal.
- Subtle blur-to-sharp transition.
- Gold underline draw.
- Background light sweep.

Do not animate every word. Prioritize the most meaningful statements.

**C. Subtitle animation**

Implement synchronized kinetic subtitles.

- Reveal subtitles according to their original timestamps.
- Highlight important words in Antique Gold.
- Use subtle pop-in or fade-up.
- Avoid excessive bouncing.
- Maintain natural reading speed.
- Use soft shadow or a subtle dark translucent backing when necessary.

**D. Camera movement**

Apply subtle movement to the speaker footage:
- Slow push-in: 100% → 105%.
- Gentle horizontal reframing.
- Occasional punch-in for important statements.
- Smooth transitions between framing positions.

Never apply aggressive zooms or distort facial proportions.

**E. Background motion**

Use subtle atmospheric elements:
- Floating dust particles.
- Soft volumetric light.
- Fine film grain.
- Slow-moving geometric patterns.
- Gentle gradient movement.
- Subtle vignette.

Keep backgrounds understated.

**F. Transition system**

Use a controlled transition vocabulary:
- Cinematic fade.
- Directional mask wipe.
- Light sweep.
- Smooth scale transition.
- Match-cut typography.
- Brief dark-frame transition.

Avoid unnecessary glitch transitions, excessive flashes, and spinning elements.

---

### 7. ISLAMIC VISUAL STORYTELLING

Choose visuals according to the actual lecture context.

For death and the afterlife:
- Dark cinematic environments.
- Empty architectural spaces.
- Dramatic lighting and shadows.
- Abstract time and eternity motifs.
- Symbolic visual metaphors.

For patience and faith:
- Calm atmospheric landscapes.
- Soft morning light.
- Minimalist architecture.
- Muted teal and warm gold tones.

For hope and paradise:
- Bright atmospheric environments.
- Elegant light rays.
- Soft ivory and gold.
- Abstract peaceful landscapes.

For accountability and deeds:
- Minimalist editorial typography.
- Symbolic scales and geometric compositions.
- Subtle motion lines and light transitions.

**Religious integrity restrictions:**

- Do not depict Allah.
- Do not depict prophets or angels.
- Do not create visual representations of unseen matters as if they were authentic depictions.
- Do not invent Quranic verses or Hadith.
- Do not alter the meaning of Arabic quotations.
- Use symbolic and atmospheric representations instead of literal supernatural imagery.
- Do not use sensational horror imagery or graphic depictions of punishment.

---

### 8. CLIP STRUCTURE & EDITING RHYTHM

Every clip should follow this storytelling sequence:

**Clip length — the clip plan wins:**
- Never shorten a clip to fit a target duration. If the clip plan gives a long clip, the whole discussion is rendered: opening, explanation, evidence, and closing.
- A clip ends on the last word of a finished point, never mid-sentence and never mid-explanation.
- Subtitles run to completion: every line is fully visible long enough to be read, and the last subtitle is never cut off by the render length.

**PHASE 1 — HOOK (0–3 seconds)**
- Strong headline.
- Immediate visual contrast.
- Relevant highlighted keywords.
- Fast but elegant entrance animation.
- Establish the central question or statement.

**PHASE 2 — CONTEXT (3–10 seconds)**
- Speaker footage becomes dominant.
- Introduce the topic through a small editorial label.
- Establish visual atmosphere.

**PHASE 3 — MAIN MESSAGE**
- Synchronize subtitles with the speaker.
- Highlight important phrases.
- Introduce relevant contextual motion graphics.
- Use camera reframing to maintain attention.
- Change visual composition when the subject meaningfully changes.

**PHASE 4 — KEY TAKEAWAY**
- Emphasize the strongest statement.
- Use large editorial typography.
- Introduce a subtle cinematic pause.

**PHASE 5 — ENDING**
- Allow the final statement to land.
- Use a subtle fade.
- Include a consistent account branding element if available.
- Avoid adding an unsupported religious conclusion.

---

### 9. SOUND DESIGN

Preserve the original lecture audio as the primary audio source.

Optional sound design:
- Subtle cinematic low-frequency impacts.
- Soft whoosh transitions.
- Gentle atmospheric textures.
- Minimal transition accents.

Rules:
- Never overpower the speaker.
- Avoid dramatic music that changes the religious atmosphere.
- Avoid sounds during important Quranic recitation or Hadith quotations.
- Prioritize clean voice intelligibility.
- Do not alter the speaker's original words.

---

### 10. CLIP-SPECIFIC VISUAL DIRECTION

Generate a unique visual treatment for each clip while maintaining the same overall visual identity.

Use the following editorial directions:

| Clip | Subject | Visual Direction |
|---|---|---|
| c01 | Orang kafir berharap menjadi tanah | Dark cinematic, existential typography, muted burgundy |
| c02 | Kematian disembelih | Minimalist black, gold typography, eternal time symbolism |
| c03 | Sekali celup ke neraka | High-contrast dramatic editorial, burgundy accents |
| c04 | Penderitaan dunia terlupakan | Contrast between dark and bright environments |
| c05 | Sabar dengan diam | Calm navy, muted teal, slow atmospheric movement |
| c06 | Takut mati dan bertemu Allah | Elegant navy, gold, reflective typography |
| c07 | Harapan mendapatkan surga | Warm ivory, muted gold, soft light |
| c08 | Ruh dicabut | Restrained dark cinematic atmosphere, abstract symbolic movement |
| c09 | Berpisah dengan yang dicintai | Emotional minimalist composition, fading typography |
| c10 | Jangan merasa amal sudah banyak | Editorial warning composition, burgundy and gold |

Never force the same background, animation, or composition on all clips.

JSON Clip Plan:

---
__PLAN__
---

---

### 11. PERFORMANCE & RENDERING OPTIMIZATION

- Use reusable motion graphics components.
- Reuse typography styles and animation presets.
- Optimize particle count.
- Avoid unnecessary full-frame blur.
- Prefer GPU-friendly compositing.
- Maintain smooth 30 FPS playback.
- Ensure subtitles are burned into the final render.
- Avoid visual artifacts, flickering, and text clipping.
- Ensure all visual elements remain synchronized with the audio.

---

### 12. FINISHING PASS WITH \`video-use\` — SKIP SILENCE

Every clip that has been rendered must go through a finishing pass with the \`video-use\` skill before it is considered done. A render that skipped this pass is not finished.

**Skip-silence requirements:**

- Remove leading silence: the clip starts on the first spoken word or on the first visual beat, with no dead air before the hook.
- Remove trailing silence: the clip ends on the last spoken word, no silent tail after it.
- Remove internal silence between sentences so playback stays efficient: no long pauses, no dead air inside the discussion.
- Never cut speech: keep a short breath buffer (roughly 80–150 ms) on both sides of every cut so no syllable, consonant, or word ending is clipped.
- Never cut across a subtitle boundary: silence is removed between sentences, so every subtitle stays complete, readable, and still in sync with the audio.
- Never remove silence in the middle of a word, a Quranic recitation, or an Arabic quotation.
- Re-export video and audio together after trimming so the burned-in subtitles stay aligned with the new timeline; re-time the subtitle cues when a trim shifts them.
- Verify the result per clip: no clipped syllables at cut points, no audio/subtitle desync, and a duration that ends exactly on the last spoken word.

**Report:** state which clips were processed, the total silence removed per clip, and confirm no speech was cut.

---

### 13. PITFALLS

- Never translate, transliterate, or paraphrase subtitles, hooks, kickers, titles, overlays, or end cards. The text language is always the JSON Clip Plan language.
- Never produce a translated subtitle track or a bilingual render.
- Never use abbreviations, including in subtitles, hooks, kickers, titles, overlays, and end cards.
- SAW → Sholallahu 'alaihi wa sallam
- SWT → Subhanahu Wa Ta'ala
- Write the full form on every occurrence; never shorten or translate the expanded form.
- Preserve the exact spelling above, including capitalization and punctuation.
- If the video shows a face, never place any ornament on it: no frames, borders, stickers, callouts, texture, graphic shapes, or typography may cover the face.

---

### 14. FINAL QUALITY CONTROL

Before rendering, verify:

1. Original speaker footage is preserved.
2. Original audio remains synchronized.
3. Subtitle timestamps are respected.
4. Arabic text is rendered correctly.
5. No subtitle is cut off — every line is complete, fully visible long enough to read, and never truncated at the clip's start or end.
6. Every clip ends on the last word of a finished discussion; no clip stops mid-sentence or mid-explanation to hit a duration target.
7. No typography, ornament, or graphic overlaps the speaker's face.
8. Color palette remains consistent.
9. Motion graphics are smooth.
10. Each clip has its own visual identity.
11. All important religious statements preserve their original context.
12. No fabricated religious imagery is included.
13. All honorifics are written in full — no SAW or SWT abbreviations.
14. The final output is optimized for TikTok, Instagram Reels, and YouTube Shorts.
15. Every subtitle, title, hook, kicker, overlay, and end card is in the JSON Clip Plan language — nothing was translated, transliterated, or paraphrased.
16. Each subtitle is word-for-word identical to its JSON Clip Plan entry.
17. Every clip has been through the section 12 \`video-use\` skip-silence pass: no leading dead air, no trailing silence, no dead pauses inside the discussion, and no speech cut at the trim points.

**FINAL CREATIVE DIRECTION:**

The final video should feel like a premium Islamic documentary condensed into a powerful short-form experience — long enough to complete each discussion, tight enough that no second is wasted on silence.

It must be visually sophisticated, emotionally engaging, readable, respectful, and professionally executed.

The motion graphics should enhance the message, never compete with the speaker.

Prioritize storytelling, clarity, atmosphere, and religious authenticity over visual spectacle.`;