import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeId, transcriptUrl } from './youtube.js';
import { clipPlanPrompt, simplePrompt, parseClipPlan, NO_OVERRIDE, NOT_SET } from './prompts.js';
import { accountsText, NO_ACCOUNTS } from './social.js';
import { buildFinalPrompt } from './finalPrompt.js';

const ID = 'dQw4w9WgXcQ';

test('parseYouTubeId menerima semua bentuk link', () => {
  for (const input of [
    ID,
    `https://www.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?v=${ID}&t=42s`,
    `https://youtu.be/${ID}?si=abc`,
    `m.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `  youtube.com/watch?v=${ID}  `,
  ]) {
    assert.equal(parseYouTubeId(input), ID, input);
  }
});

test('parseYouTubeId menolak input tak valid', () => {
  for (const input of ['', null, 'halo', 'https://example.com/watch?v=abc', `https://youtu.be/short`]) {
    assert.equal(parseYouTubeId(input), null, String(input));
  }
});

test('parseYouTubeId menolak ID YouTube di host lain', () => {
  for (const input of [`https://evil.com/watch?v=${ID}`, `https://evil.com/shorts/${ID}`, `https://notyoutube.com/v/${ID}`]) {
    assert.equal(parseYouTubeId(input), null, input);
  }
  assert.equal(parseYouTubeId(`https://www.youtube-nocookie.com/embed/${ID}`), ID);
});

test('transcriptUrl menyusun tautan yang diminta', () => {
  assert.equal(transcriptUrl(ID), `https://www.youtube-transcript.io/videos?id=${ID}`);
});

test('prompt clip plan memakai format user dengan URL terisi', () => {
  const prompt = clipPlanPrompt(ID);
  assert.match(prompt, /^Kamu adalah editor konten TikTok untuk kajian Islam\./);
  assert.ok(prompt.includes('Jika file SRT tidak ditemukan atau tidak terbaca, HENTIKAN dan balas: "SRT tidak ditemukan".'));
  assert.ok(prompt.includes(`- source_url: https://www.youtube.com/watch?v=${ID}`));
  assert.ok(prompt.includes(`"source_url": "https://www.youtube.com/watch?v=${ID}"`));
  assert.ok(prompt.includes('{"start": "MM:SS", "end": "MM:SS", "subtitle": ""}'));
  assert.ok(!prompt.includes('__URL__') && !prompt.includes('YOUTUBE_URL'));
});

test('prompt sederhana memakai format user', () => {
  const plan = '{\n  "video_title": "Judul",\n  "clips": []\n}';
  assert.equal(
    simplePrompt(ID, plan),
    `Buatkan Clip Video dengan effectcraft-from-opendesign dari https://youtube.com/watch?v=${ID}

<Judul video>
${NOT_SET}

<Pemateri>
${NOT_SET}

// sisipkan disini
<Pallete warna>
${NO_OVERRIDE}

<Layout video>
${NO_OVERRIDE}

<Akun Sosmed>
${NO_ACCOUNTS}

Dengan clip-plan:
${plan}`,
  );
});

test('prompt sederhana menyisipkan palet dan layout pilihan user', () => {
  const out = simplePrompt(ID, '{"clips":[]}', '  Antique Gold #C6A46A — aksen  ', 'Center 18–75%: speaker');
  assert.ok(out.includes('<Pallete warna>\nAntique Gold #C6A46A — aksen\n'));
  assert.ok(out.includes('<Layout video>\nCenter 18–75%: speaker\n'));
  assert.ok(!out.includes(NO_OVERRIDE));
});

test('prompt sederhana menyalin clip-plan apa adanya, termasuk pola $', () => {
  const plan = '{"video_title":"Harga $& dan $` dan $1","clips":[]}';
  assert.ok(simplePrompt(ID, plan).endsWith(`Dengan clip-plan:\n${plan}`));
});

test('parseClipPlan mengekstrak JSON dari balasan AI', () => {
  const fenced = 'Ini clip plan-nya:\n```json\n{"video_title":"A","clips":[{"id":"c01"}]}\n```\nSemoga membantu.';
  const result = parseClipPlan(fenced);
  assert.equal(result.text, '{"video_title":"A","clips":[{"id":"c01"}]}');
  assert.equal(JSON.parse(result.text).clips.length, 1);

  const bare = '{"video_title":"B","clips":[]}';
  assert.equal(parseClipPlan(bare).text, bare);
  assert.equal(parseClipPlan(''), null);
  assert.match(parseClipPlan('bukan json').error, /array "clips"/);
  assert.match(parseClipPlan('{"video_title":"tanpa clips"}').error, /array "clips"/);
});
test('akun sosmed diformat per baris, @ ganda dibuang, username kosong dilewati', () => {
  const accounts = [
    { platform: 'Tiktok', username: '  @dakwah.tv ' },
    { platform: 'YoutubeShort', username: '' },
    { platform: 'YoutubeShort', username: '   ' },
    { platform: 'Linkedin', username: '@@ustadz' },
  ];
  assert.equal(accountsText(accounts), '- TikTok: @dakwah.tv\n- LinkedIn: @ustadz');
  assert.equal(accountsText([]), NO_ACCOUNTS);
  assert.equal(accountsText(undefined), NO_ACCOUNTS);
});

test('prompt sederhana menyisipkan akun sosmed pilihan user', () => {
  const out = simplePrompt(ID, '{"clips":[]}', '', '', [
    { platform: 'Instagram', username: 'kajian' },
    { platform: 'Facebook', username: '' },
  ]);
  assert.ok(out.includes('<Akun Sosmed>\n- Instagram: @kajian\n\nDengan clip-plan:'));
  assert.ok(!out.includes(NO_ACCOUNTS));
});

test('final prompt mengisi __SOCIAL__ dan tidak menyisakan placeholder', () => {
  const prompt = buildFinalPrompt({
    url: 'https://youtube.com/watch?v=' + ID,
    palette: '',
    layout: '',
    plan: '{"clips":[]}',
    accounts: [{ platform: 'Tiktok', username: 'harga $& $1' }],
  });
  assert.ok(prompt.includes('**Social accounts to display & credit:**\n\n- TikTok: @harga $& $1\n'));
  assert.ok(!prompt.includes('__SOCIAL__'));

  const empty = buildFinalPrompt({ url: 'u', palette: '', layout: '', plan: 'p' });
  assert.ok(empty.includes(`**Social accounts to display & credit:**\n\n${NO_ACCOUNTS}\n`));
  assert.ok(!/__[A-Z]+__/.test(empty));
});

test('prompt menyertakan judul video dan pemateri dari clip-plan', () => {
  const plan = '{"video_title":"Kiamat Sudah Dekat","video_spekar":"Ustadz Ahmad","clips":[]}';
  const meta = { title: 'Kiamat Sudah Dekat', speaker: 'Ustadz Ahmad' };

  const simple = simplePrompt(ID, plan, '', '', [], meta);
  assert.ok(simple.includes('<Judul video>\nKiamat Sudah Dekat\n'));
  assert.ok(simple.includes('<Pemateri>\nUstadz Ahmad\n'));

  const final = buildFinalPrompt({ url: 'u', palette: '', layout: '', plan, title: meta.title, speaker: meta.speaker });
  assert.ok(final.includes('**Video title:** Kiamat Sudah Dekat\n'));
  assert.ok(final.includes('**Speaker:** Ustadz Ahmad\n'));

  const fallback = buildFinalPrompt({ url: 'u', palette: '', layout: '', plan });
  assert.ok(fallback.includes(`**Video title:** ${NOT_SET}\n`));
  assert.ok(fallback.includes(`**Speaker:** ${NOT_SET}\n`));
});

test('alat terpilih menentukan prompt sederhana dan prompt final', () => {
  const plan = '{"clips":[]}';
  const line = (tool) => simplePrompt(ID, plan, '', '', [], { tool }).split('\n')[0];
  assert.equal(line('effectcraft'), `Buatkan Clip Video dengan effectcraft-from-opendesign dari https://youtube.com/watch?v=${ID}`);
  assert.equal(line('remotion'), `Buatkan Clip Video dengan remotion-from-opendesign dari https://youtube.com/watch?v=${ID}`);
  assert.equal(line('hyperframes'), `Buatkan Clip Video dengan hyperframes-from-opendesign dari https://youtube.com/watch?v=${ID}`);
  assert.equal(line('tidak-ada'), line('effectcraft'));

  const remotion = buildFinalPrompt({ url: 'u', palette: '', layout: '', plan, tool: 'remotion' });
  assert.ok(remotion.includes('## Remotion from OpenDesign | Premium TikTok / Reels / Shorts Production\n'));
  assert.ok(remotion.includes('Use `remotion-from-opendesign` as the primary motion graphics toolkit'));
  assert.ok(remotion.includes('install `remotion-from-opendesign` and `opendesign`'));
  assert.ok(!remotion.includes('effectcraft'));

  const effectcraft = buildFinalPrompt({ url: 'u', palette: '', layout: '', plan });
  assert.ok(effectcraft.includes('## EffectCraft from OpenDesign | Premium TikTok / Reels / Shorts Production\n'));
  assert.ok(effectcraft.includes('install `effectcraft-from-opendesign` and `opendesign`'));
  assert.ok(effectcraft.includes('`opendesign` is not optional'));
  assert.ok(!/__[A-Z_]+__/.test(remotion + effectcraft));
});
