<script>
  import { parseYouTubeId, transcriptUrl } from './lib/youtube.js';
  import { clipPlanPrompt, effectcraftPrompt, parseClipPlan } from './lib/prompts.js';
  import { buildFinalPrompt, replaceClipTable } from './lib/finalPrompt.js';
  import { adaptClipTable, ENDPOINT, MODEL } from './lib/llm.js';

  const read = (key) => {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  };

  let urlInput = $state(read('clipgen.url'));
  let planInput = $state(read('clipgen.plan'));
  let palette = $state(read('clipgen.palette'));
  let layout = $state(read('clipgen.layout'));
  let rows = $state('');
  let busy = $state(false);
  let error = $state('');
  let elapsed = $state(0);
  let controller = null;
  let copied = $state('');

  const id = $derived(parseYouTubeId(urlInput));
  const plan = $derived(parseClipPlan(planInput));
  const prompt = $derived(id ? clipPlanPrompt(id) : '');
  const simpleUrl = $derived(id ? `https://youtube.com/watch?v=${id}` : '');
  const command = $derived(id && plan?.text ? effectcraftPrompt(id, plan.text, palette, layout) : '');
  const finalPrompt = $derived(id && plan?.text ? replaceClipTable(buildFinalPrompt({ url: simpleUrl, palette, layout, plan: plan.text }), rows) : '');

  $effect(() => {
    try {
      localStorage.setItem('clipgen.url', urlInput);
      localStorage.setItem('clipgen.plan', planInput);
      localStorage.setItem('clipgen.palette', palette);
      localStorage.setItem('clipgen.layout', layout);
    } catch {
      /* mode privat: abaikan */
    }
  });

  /** Opsional: model hanya menyusun ulang tabel arah visual seksi 10. */
  async function runAdapt() {
    if (!plan?.text || busy) return;
    busy = true;
    error = '';
    elapsed = 0;
    const started = Date.now();
    controller = new AbortController();
    const ticker = setInterval(() => {
      elapsed = Math.round((Date.now() - started) / 1000);
    }, 500);
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const text = await adaptClipTable(plan.text, { signal: controller.signal });
      if (!/^\|\s*c\d+\s*\|/m.test(text)) throw new Error('Model tidak mengembalikan baris tabel yang valid.');
      rows = text;
    } catch (e) {
      error =
        e.name === 'AbortError'
          ? `Dibatalkan setelah ${Math.round((Date.now() - started) / 1000)} detik.`
          : `${e.message} — ${MODEL} @ ${ENDPOINT}`;
    } finally {
      clearInterval(ticker);
      clearTimeout(timeout);
      elapsed = Math.round((Date.now() - started) / 1000);
      controller = null;
      busy = false;
    }
  }

  function stopAdapt() {
    controller?.abort();
    busy = false;
  }

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
      Dari link YouTube sampai prompt final <code>effectcraft-from-opendesign</code>. Langkah 1–7 berjalan di
      browser tanpa AI; langkah 8 memakai model lokal di mesin ini.
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

  <section class="step">
    <div class="step-head"><span class="num">6</span><h2>Palet warna & layout video</h2></div>
    <p>Kosongkan bila ingin memakai bawaan MASTER PROMPT apa adanya.</p>
    <label for="palette">Palet warna</label>
    <textarea
      id="palette"
      bind:value={palette}
      rows="4"
      spellcheck="false"
      placeholder={'Contoh:\nMidnight Black #101116 — background\nAntique Gold #C6A46A — aksen kata penting'}
    ></textarea>
    <label for="layout">Layout video</label>
    <textarea
      id="layout"
      bind:value={layout}
      rows="4"
      spellcheck="false"
      placeholder={'Contoh:\nTop 5–15%: kicker\nCenter 18–75%: speaker\nBottom 74–88%: subtitle'}
    ></textarea>
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">7</span><h2>Tempel clip-plan → prompt sederhana</h2></div>
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
            {copied === 'command' ? 'Tersalin ✓' : 'Copy prompt sederhana'}
          </button>
        </div>
        <pre>{command}</pre>
      </div>
    {/if}
  </section>

  <section class="step" class:locked={!command}>
    <div class="step-head"><span class="num">8</span><h2>Final prompt</h2></div>
    <p>
      Dirakit langsung di browser dari MASTER PROMPT — seketika, tanpa risiko terpotong. Model lokal
      (<code>{MODEL}</code>) hanya dipakai bila Anda ingin tabel arah visual seksi 10 disesuaikan otomatis.
    </p>
    <div class="btn-row">
      <button class="btn ghost" onclick={runAdapt} disabled={busy || !command}>
        {busy ? `Menyesuaikan tabel… ${elapsed}s` : 'Adaptasi tabel seksi 10 dengan AI'}
      </button>
      {#if busy}
        <button class="btn ghost" onclick={stopAdapt}>Stop</button>
      {/if}
      {#if rows}
        <button class="btn ghost" onclick={() => (rows = '')}>Kembali ke tabel bawaan</button>
      {/if}
    </div>
    {#if error}
      <p class="hint error">{error}</p>
    {:else if rows}
      <p class="hint ok">Tabel seksi 10 disesuaikan model · {elapsed}s</p>
    {/if}
    {#if finalPrompt}
      <div class="output">
        <div class="output-actions">
          <button class="btn ghost" onclick={() => copy(finalPrompt, 'final')}>
            {copied === 'final' ? 'Tersalin ✓' : 'Copy final prompt'}
          </button>
        </div>
        <pre>{finalPrompt}</pre>
      </div>
    {/if}
  </section>

  <footer>
    Langkah 1–8 berjalan lokal di browser. Hanya tombol adaptasi tabel yang mengirim data ke
    <code>{ENDPOINT}</code> di mesin ini.
  </footer>
  <span class="sr-only" aria-live="polite">{copied ? 'Tersalin ke clipboard' : ''}</span>
</main>