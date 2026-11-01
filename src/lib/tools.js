/**
 * Alat pembuat video yang dipilih di paling atas. `label` adalah nama alat
 * beserta skill penata letaknya, dipakai di prompt sederhana
 * ("Buatkan Clip Video dengan …"); `directive` dan `title` masuk ke prompt final.
 */
export const TOOLS = [
  {
    id: 'effectcraft',
    label: 'effectcraft-from-opendesign',
    title: 'EffectCraft from OpenDesign',
    directive:
      'Use `effectcraft-from-opendesign` as the primary motion graphics skill. The skill use a effectcraft for combining and opendesign for designing',
  },
  {
    id: 'remotion',
    label: 'remotion-from-opendesign',
    title: 'Remotion from OpenDesign',
    directive:
      'Use `remotion-from-opendesign` as the primary motion graphics toolkit: author every clip as a Remotion composition (React components) driven by the clip-plan timings, with `opendesign` building the layout and visual identity below.',
  },
  {
    id: 'hyperframes',
    label: 'hyperframes-from-opendesign',
    title: 'HyperFrames from OpenDesign',
    directive:
      'Use `hyperframes-from-opendesign` as the primary motion graphics toolkit: author every clip as a HyperFrames scene driven by the clip-plan timings, with `opendesign` building the layout and visual identity below.',
  },
];

/** Alat terpilih; id tak dikenal (storage diedit tangan) jatuh ke pilihan pertama. */
export const resolveTool = (id) => TOOLS.find((t) => t.id === id) ?? TOOLS[0];