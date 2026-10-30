import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeId, transcriptUrl } from './youtube.js';
import { clipPlanPrompt, effectcraftPrompt, parseClipPlan, NO_OVERRIDE } from './prompts.js';

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
  assert.match(prompt, /^Berikan 10 Clip Plan yang berpotensi mendatangkan viewer, likes, follower di Tiktok dari https:\/\/www\.youtube\.com\/watch\?v=dQw4w9WgXcQ dengan format:/);
  assert.ok(prompt.includes('"source_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"'));
  assert.ok(prompt.includes('["00:00:00.000","00:00:00.390","Abcd"]'));
  assert.ok(!prompt.includes('__URL__') && !prompt.includes('YOUTUBE_URL'));
});

test('prompt effectcraft memakai format user', () => {
  const plan = '{\n  "video_title": "Judul",\n  "clips": []\n}';
  assert.equal(
    effectcraftPrompt(ID, plan),
    `Buatkan Clip Video dengan effectcraft-from-opendesign dari https://youtube.com/watch?v=${ID}

// sisipkan disini
<Pallete warna>
${NO_OVERRIDE}

<Layout video>
${NO_OVERRIDE}

Dengan clip-plan:
${plan}`,
  );
});

test('prompt effectcraft menyisipkan palet dan layout pilihan user', () => {
  const out = effectcraftPrompt(ID, '{"clips":[]}', '  Antique Gold #C6A46A — aksen  ', 'Center 18–75%: speaker');
  assert.ok(out.includes('<Pallete warna>\nAntique Gold #C6A46A — aksen\n'));
  assert.ok(out.includes('<Layout video>\nCenter 18–75%: speaker\n'));
  assert.ok(!out.includes(NO_OVERRIDE));
});

test('prompt effectcraft menyalin clip-plan apa adanya, termasuk pola $', () => {
  const plan = '{"video_title":"Harga $& dan $` dan $1","clips":[]}';
  assert.ok(effectcraftPrompt(ID, plan).endsWith(`Dengan clip-plan:\n${plan}`));
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