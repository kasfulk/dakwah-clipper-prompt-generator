<script>
  import { parseYouTubeId, transcriptUrl } from './lib/youtube.js';
  import { clipPlanPrompt, effectcraftPrompt, parseClipPlan } from './lib/prompts.js';

  const read = (key) => {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  };

  let urlInput = $state(read('clipgen.url'));
  let planInput = $state(read('clipgen.plan'));
  let copied = $state('');

  const id = $derived(parseYouTubeId(urlInput));
  const plan = $derived(parseClipPlan(planInput));
  const prompt = $derived(id ? clipPlanPrompt(id) : '');
  const command = $derived(id && plan?.text ? effectcraftPrompt(id, plan.text) : '');

  $effect(() => {
    try {
      localStorage.setItem('clipgen.url', urlInput);
      localStorage.setItem('clipgen.plan', planInput);
    } catch {
      /* mode privat: abaikan */
    }
  });

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    copied = key;
    setTimeout(() => {
      if (copied === key) copied = '';
    }, 1600);
  }
</script>

<main>
  <header>
    <h1>Dakwah Clip <span>Prompt Generator</span></h1>
    <p class="lede">
      Dari link YouTube sampai perintah <code>effectcraft-from-opendesign</code>. Semua berjalan di browser —
      tanpa AI, tanpa server.
    </p>
  </header>

  <section class="step">
    <div class="step-head"><span class="num">1</span><h2>Tempel link YouTube</h2></div>
    <label for="url">Link video</label>
    <input
      id="url"
      bind:value={urlInput}
      placeholder="https://www.youtube.com/watch?v=…"
      inputmode="url"
      autocomplete="off"
      spellcheck="false"
    />
    {#if id}
      <p class="hint ok">Video ID: <code>{id}</code></p>
    {:else if urlInput.trim()}
      <p class="hint error">Link tidak dikenali. Contoh: <code>https://youtu.be/{'{youtube-id}'}</code></p>
    {/if}
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">2</span><h2>Ambil transkrip</h2></div>
    <p>Buka halaman transkrip video ini di youtube-transcript.io.</p>
    <div class="btn-row">
      <a
        class="btn"
        href={id ? transcriptUrl(id) : '#'}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!id}
        tabindex={id ? 0 : -1}
      >
        Buka youtube-transcript.io ↗
      </a>
    </div>
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">3</span><h2>Unduh file SRT</h2></div>
    <ol class="steps-list">
      <li>Tunggu transkrip selesai dimuat.</li>
      <li>Klik tombol <strong>Download</strong>, pilih format <strong>SRT</strong>.</li>
      <li>Simpan file <code>.srt</code> ke perangkat.</li>
    </ol>
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">4</span><h2>Upload SRT ke ChatGPT / Claude, lalu jalankan prompt</h2></div>
    <p>
      Buka salah satu chat AI, <strong>lampirkan file SRT</strong> yang sudah diunduh, lalu tempel prompt dari
      langkah 5 di bawah dan kirim.
    </p>
    <div class="btn-row">
      <a class="btn ghost" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT ↗</a>
      <a class="btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">Claude ↗</a>
    </div>
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">5</span><h2>Prompt clip plan</h2></div>
    <p>Salin prompt ini, kirim bersama file SRT. Hasilnya berupa 10 clip plan dalam format JSON.</p>
    {#if id}
      <div class="output">
        <div class="output-actions">
          <button class="btn ghost" onclick={() => copy(prompt, 'plan')}>
            {copied === 'plan' ? 'Tersalin ✓' : 'Copy prompt'}
          </button>
        </div>
        <pre>{prompt}</pre>
      </div>
    {/if}
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">6</span><h2>Tempel clip-plan → perintah clip video</h2></div>
    <p>
      Tempel balasan AI yang berisi clip-plan JSON. Boleh utuh (dengan pagar <code>```json</code>), JSON-nya
      diekstrak otomatis.
    </p>
    <label for="plan">Clip plan</label>
    <textarea
      id="plan"
      bind:value={planInput}
      spellcheck="false"
      placeholder={'{\n  "video_title": "…",\n  "clips": [ … ]\n}'}
      rows="8"
    ></textarea>
    {#if plan?.error}
      <p class="hint error">{plan.error}</p>
    {:else if plan?.text}
      <p class="hint ok">Clip-plan valid — {JSON.parse(plan.text).clips?.length ?? 0} klip terdeteksi.</p>
    {/if}

    {#if command}
      <div class="output">
        <div class="output-actions">
          <button class="btn ghost" onclick={() => copy(command, 'command')}>
            {copied === 'command' ? 'Tersalin ✓' : 'Copy perintah'}
          </button>
        </div>
        <pre>{command}</pre>
      </div>
    {/if}
  </section>

  <footer>Tanpa unggahan ke server mana pun. Data tersimpan lokal di browser ini.</footer>
  <span class="sr-only" aria-live="polite">{copied ? 'Tersalin ke clipboard' : ''}</span>
</main>