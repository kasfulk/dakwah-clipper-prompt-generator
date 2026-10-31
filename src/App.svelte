<script>
  import { parseYouTubeId, transcriptUrl } from './lib/youtube.js';
  import { clipPlanPrompt, effectcraftPrompt, parseClipPlan } from './lib/prompts.js';
  import { MASTER_TEMPLATE } from './lib/masterPrompt.js';
  import { streamFinalPrompt, ENDPOINT, MODEL } from './lib/llm.js';

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
  let finalPrompt = $state('');
  let busy = $state(false);
  let error = $state('');
  let elapsed = $state(0);
  let chars = $state(0);
  let controller = null;
  let copied = $state('');

  const id = $derived(parseYouTubeId(urlInput));
  const plan = $derived(parseClipPlan(planInput));
  const prompt = $derived(id ? clipPlanPrompt(id) : '');
  const command = $derived(id && plan?.text ? effectcraftPrompt(id, plan.text, palette, layout) : '');
  const truncated = $derived(finalPrompt !== '' && finalPrompt.length < MASTER_TEMPLATE.length * 0.8);

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

  async function runFinal() {
    if (!command || busy) return;
    busy = true;
    error = '';
    finalPrompt = '';
    elapsed = 0;
    chars = 0;
    const started = Date.now();
    controller = new AbortController();
    const ticker = setInterval(() => {
      elapsed = Math.round((Date.now() - started) / 1000);
    }, 500);
    const timeout = setTimeout(() => controller.abort(), 180_000);
    try {
      const text = await streamFinalPrompt(command, {
        signal: controller.signal,
        onToken: (delta) => {
          finalPrompt += delta;
          chars = finalPrompt.length;
        },
      });
      if (!text.trim()) throw new Error('Model mengembalikan teks kosong.');
    } catch (e) {
      error =
        e.name === 'AbortError'
          ? `Dibatalkan setelah ${Math.round((Date.now() - started) / 1000)} detik tanpa hasil.`
          : `${e.message} — endpoint ${ENDPOINT}, model ${MODEL}.`;
    } finally {
      clearInterval(ticker);
      clearTimeout(timeout);
      elapsed = Math.round((Date.now() - started) / 1000);
      controller = null;
      busy = false;
    }
  }

  function stopFinal() {
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
    <div class="step-head"><span class="num">8</span><h2>Proses jadi final prompt</h2></div>
    <p>
      Dikirim ke <code>{ENDPOINT}</code> dengan model <code>{MODEL}</code>, lalu dirakit mengikuti MASTER PROMPT.
    </p>
    <div class="btn-row">
      <button class="btn" onclick={runFinal} disabled={busy || !command}>
        {busy ? `Memproses… ${elapsed}s` : 'Proses → final prompt'}
      </button>
      {#if busy}
        <button class="btn ghost" onclick={stopFinal}>Stop</button>
      {/if}
    </div>
    {#if busy || (finalPrompt && elapsed)}
      <p class="hint {chars ? 'ok' : ''}" aria-live="polite">
        {busy
          ? chars
            ? `${chars.toLocaleString('id-ID')} karakter diterima · ${elapsed}s`
            : `Menunggu token pertama… ${elapsed}s`
          : `Selesai dalam ${elapsed}s · ${chars.toLocaleString('id-ID')} karakter`}
      </p>
    {/if}
    {#if error}
      <p class="hint error">{error}</p>
    {:else if truncated}
      <p class="hint error">Hasil lebih pendek dari template — periksa apakah ada bagian yang terpotong.</p>
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
    Langkah 1–7 berjalan lokal di browser. Langkah 8 hanya mengirim prompt ke <code>{ENDPOINT}</code> di mesin ini.
  </footer>
  <span class="sr-only" aria-live="polite">{copied ? 'Tersalin ke clipboard' : ''}</span>
</main>