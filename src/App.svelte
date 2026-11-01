<script>
  import { parseYouTubeId, transcriptUrl } from './lib/youtube.js';
  import { clipPlanPrompt, simplePrompt, parseClipPlan } from './lib/prompts.js';
  import { buildFinalPrompt, rebuildHistoryPrompt, replaceClipTable } from './lib/finalPrompt.js';
  import { TOOLS, resolveTool } from './lib/tools.js';
  import { PROVIDERS, adaptClipTable, resolveConfig } from './lib/llm.js';
  import { PLATFORMS, accountsText, platformIcon } from './lib/social.js';
  import {
    HISTORY_LIMIT,
    asText,
    readAccounts,
    readConfig,
    readHistory,
    readText,
    readTool,
    sanitizeAccounts,
    withEntry,
    write,
    writeHistory,
  } from './lib/storage.js';

  let urlInput = $state('');
  let planInput = $state('');
  let palette = $state(readText(localStorage, 'palette'));
  let layout = $state(readText(localStorage, 'layout'));
  let accounts = $state(readAccounts(localStorage, PLATFORMS));
  let config = $state(readConfig(localStorage, PROVIDERS));
  let tool = $state(readTool(localStorage, TOOLS));
  let history = $state(readHistory(localStorage));
  let saved = $state('');
  let saveError = $state('');
  let rows = $state('');
  let adaptedSig = $state(null);
  let busy = $state(false);
  let error = $state('');
  let elapsed = $state(0);
  let controller = null;
  let copied = $state('');

  const service = $derived(PROVIDERS.find((p) => p.id === config.provider) ?? PROVIDERS[0]);
  const cfg = $derived(resolveConfig(config));
  const activeTool = $derived(resolveTool(tool));
  const id = $derived(parseYouTubeId(urlInput));
  const plan = $derived(parseClipPlan(planInput));
  const meta = $derived(plan?.text ? JSON.parse(plan.text) : {});
  const title = $derived(meta.video_title ?? '');
  const speaker = $derived(meta.video_speaker ?? meta.video_spekar ?? '');
  const prompt = $derived(id ? clipPlanPrompt(id) : '');
  const simpleUrl = $derived(id ? `https://youtube.com/watch?v=${id}` : '');
  const command = $derived(id && plan?.text ? simplePrompt(id, plan.text, palette, layout, accounts, { title, speaker, tool }) : '');
  const inputSig = $derived([id, plan?.text, palette, layout, accountsText(accounts), tool].join('|'));
  const fresh = $derived(adaptedSig !== null && adaptedSig === inputSig);
  const finalPrompt = $derived(
    id && plan?.text && fresh
      ? replaceClipTable(
          buildFinalPrompt({ url: simpleUrl, palette, layout, plan: plan.text, accounts, title, speaker, tool }),
          rows,
        )
      : '',
  );

  /** Opsional: model hanya menyusun ulang tabel arah visual seksi 10. */
  async function runAdapt() {
    if (!plan?.text || busy) return;
    busy = true;
    error = '';
    elapsed = 0;
    const sig = inputSig;
    const started = Date.now();
    controller = new AbortController();
    const ticker = setInterval(() => {
      elapsed = Math.round((Date.now() - started) / 1000);
    }, 500);
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const text = await adaptClipTable(plan.text, { signal: controller.signal, config });
      if (!/^\|\s*c\d+\s*\|/m.test(text)) throw new Error('Model tidak mengembalikan baris tabel yang valid.');
      rows = text;
      adaptedSig = sig;
    } catch (e) {
      error =
        e.name === 'AbortError'
          ? `Dibatalkan setelah ${Math.round((Date.now() - started) / 1000)} detik.`
          : `${e.message} — ${cfg.model} @ ${cfg.url}`;
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

  /** Tombol "Simpan": tulis ke localStorage, beri umpan balik singkat. */
  function keep(key, value) {
    const ok = key === 'history' ? writeHistory(localStorage, value) : write(localStorage, key, value);
    if (!ok) {
      saveError = 'Gagal menyimpan — storage browser diblokir atau penuh.';
      return;
    }
    saveError = '';
    saved = key;
    setTimeout(() => {
      if (saved === key) saved = '';
    }, 1600);
  }

  function saveHistory() {
    if (!finalPrompt) return;
    history = withEntry(history, {
      savedAt: new Date().toISOString(),
      label: [title, speaker].filter(Boolean).join(' — ') || 'Tanpa judul',
      sig: inputSig,
      rows,
      prompt: finalPrompt,
      inputs: { urlInput, planInput, palette, layout, tool, accounts: accounts.map((a) => ({ ...a })) },
    });
    keep('history', history);
  }

  function restore(entry) {
    const inputs = entry.inputs ?? {};
    urlInput = asText(inputs.urlInput);
    planInput = asText(inputs.planInput);
    palette = asText(inputs.palette);
    layout = asText(inputs.layout);
    tool = resolveTool(asText(inputs.tool)).id;
    accounts = sanitizeAccounts(inputs.accounts, PLATFORMS);
    rows = entry.rows;
    adaptedSig = entry.sig;
  }

  /** Alat pembuat video: langsung disimpan, tanpa tombol Simpan. */
  function selectTool(id) {
    tool = resolveTool(id).id;
    keep('tool', tool);
  }

  function dropHistory(index) {
    history = history.filter((_, i) => i !== index);
    keep('history', history);
  }

  function clearHistory() {
    if (!confirm(`Hapus semua ${history.length} entri riwayat?`)) return;
    history = [];
    keep('history', history);
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
      Dari link YouTube sampai prompt final <code>{activeTool.title}</code>. Langkah 1–9 berjalan di
      browser tanpa AI; langkah 10 memakai layanan AI yang diatur di langkah 8.
    </p>
    <div class="tool-row" role="group" aria-label="Alat pembuat video">
      {#each TOOLS as t}
        <button
          class="btn small"
          class:ghost={tool !== t.id}
          aria-pressed={tool === t.id}
          onclick={() => selectTool(t.id)}
        >
          {t.label}
        </button>
      {/each}
    </div>
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
    <p>Kosongkan bila ingin memakai bawaan MASTER PROMPT apa adanya. Tombol <strong>Simpan</strong> menyimpan
      isian di browser ini agar tetap ada saat halaman dibuka lagi.</p>
    <div class="field-head">
      <label for="palette">Palet warna</label>
      <button class="btn ghost small" onclick={() => keep('palette', palette)}>
        {saved === 'palette' ? 'Tersimpan ✓' : 'Simpan'}
      </button>
    </div>
    <textarea
      id="palette"
      bind:value={palette}
      rows="4"
      spellcheck="false"
      placeholder={'Contoh:\nMidnight Black #101116 — background\nAntique Gold #C6A46A — aksen kata penting'}
    ></textarea>
    <div class="field-head">
      <label for="layout">Layout video</label>
      <button class="btn ghost small" onclick={() => keep('layout', layout)}>
        {saved === 'layout' ? 'Tersimpan ✓' : 'Simpan'}
      </button>
    </div>
    <textarea
      id="layout"
      bind:value={layout}
      rows="4"
      spellcheck="false"
      placeholder={'Contoh:\nTop 5–15%: kicker\nCenter 18–75%: speaker\nBottom 74–88%: subtitle'}
    ></textarea>
    {#if saveError}
      <p class="hint error">{saveError}</p>
    {/if}
  </section>

  <section class="step">
    <div class="step-head"><span class="num">7</span><h2>Akun sosial media</h2></div>
    <p>Akun yang dicantumkan di video. Tambah sesuai kebutuhan; yang username-nya kosong diabaikan.</p>
    {#each accounts as account, i}
      <div class="account-row">
        <span class="account-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d={platformIcon(account.platform)} /></svg>
        </span>
        <select bind:value={account.platform} aria-label={`Platform akun ${i + 1}`}>
          {#each PLATFORMS as p}
            <option value={p.id}>{p.label}</option>
          {/each}
        </select>
        <input
          bind:value={account.username}
          aria-label={`Username akun ${i + 1}`}
          placeholder="username"
          autocomplete="off"
          spellcheck="false"
        />
        <button
          class="btn ghost account-remove"
          onclick={() => accounts.splice(i, 1)}
          aria-label={`Hapus akun ${i + 1}`}
        >
          ×
        </button>
      </div>
    {/each}
    <div class="btn-row">
      <button class="btn ghost" onclick={() => accounts.push({ platform: PLATFORMS[0].id, username: '' })}>
        <svg class="plus" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Tambah akun
      </button>
      <button class="btn ghost" onclick={() => keep('accounts', accounts)}>
        {saved === 'accounts' ? 'Tersimpan ✓' : 'Simpan akun'}
      </button>
    </div>
  </section>

  <section class="step">
    <div class="step-head"><span class="num">8</span><h2>Layanan AI</h2></div>
    <p>
      Dipakai tombol <strong>Proses AI</strong> di langkah 10. Kosongkan URL atau model untuk memakai bawaan
      layanan yang dipilih. API key disimpan sebagai teks biasa di localStorage browser ini — hanya untuk
      komputer sendiri.
    </p>
    <label for="service">Layanan</label>
    <select id="service" bind:value={config.provider}>
      {#each PROVIDERS as p}
        <option value={p.id}>{p.label}</option>
      {/each}
    </select>
    <label for="service-url">URL</label>
    <input
      id="service-url"
      bind:value={config.url}
      placeholder={service.url}
      autocomplete="off"
      spellcheck="false"
    />
    <label for="service-model">Model</label>
    <input
      id="service-model"
      bind:value={config.model}
      placeholder={service.model}
      autocomplete="off"
      spellcheck="false"
    />
    <label for="service-key">API key</label>
    <input
      id="service-key"
      type="password"
      bind:value={config.apiKey}
      placeholder="sk-… / kosongkan bila tidak perlu"
      autocomplete="off"
      spellcheck="false"
    />
    <div class="btn-row">
      <button class="btn ghost" onclick={() => keep('config', config)}>
        {saved === 'config' ? 'Tersimpan ✓' : 'Simpan layanan AI'}
      </button>
    </div>
  </section>

  <section class="step" class:locked={!id}>
    <div class="step-head"><span class="num">9</span><h2>Tempel clip-plan → prompt sederhana</h2></div>
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
    <div class="step-head"><span class="num">10</span><h2>Final prompt</h2></div>
    <p>
      Final prompt baru tampil setelah layanan AI (<code>{cfg.model}</code> @ <code>{cfg.url}</code>) selesai
      menyesuaikan tabel arah visual seksi 10. Selama proses berjalan, hasil masih kosong.
    </p>
    <div class="btn-row">
      <button class="btn ghost" onclick={runAdapt} disabled={busy || !command}>
        {busy ? `Menyusun final prompt… ${elapsed}s` : 'Proses AI membuat final prompt'}
      </button>
      {#if busy}
        <button class="btn ghost" onclick={stopAdapt}>Stop</button>
      {/if}
    </div>
    {#if error}
      <p class="hint error">{error}</p>
    {:else if busy}
      <p class="hint">Menunggu respons AI…</p>
    {:else if fresh}
      <p class="hint ok">Final prompt siap · respons AI {elapsed}s</p>
    {:else if adaptedSig !== null}
      <p class="hint">Input berubah sejak respons AI terakhir — jalankan ulang AI untuk memperbarui final prompt.</p>
    {:else if command}
      <p class="hint">Belum ada respons AI — final prompt masih kosong.</p>
    {/if}
    {#if finalPrompt}
      <div class="output">
        <div class="output-actions">
          <button class="btn ghost" onclick={() => copy(finalPrompt, 'final')}>
            {copied === 'final' ? 'Tersalin ✓' : 'Copy final prompt'}
          </button>
          <button class="btn ghost" onclick={saveHistory}>
            {saved === 'history' ? 'Tersimpan ✓' : 'Simpan ke riwayat'}
          </button>
        </div>
        <pre>{finalPrompt}</pre>
      </div>
    {/if}
  </section>

  <section class="step">
    <div class="step-head"><span class="num">11</span><h2>Riwayat prompt</h2></div>
    <p>
      Disimpan di browser ini (maksimal {HISTORY_LIMIT} entri terbaru) lewat tombol
      <strong>Simpan ke riwayat</strong> di langkah 10. <strong>Muat</strong> mengembalikan link, clip-plan,
      palet, layout, akun, dan final prompt-nya.
    </p>
    {#if saveError}
      <p class="hint error">{saveError}</p>
    {/if}
    {#if !history.length}
      <p class="hint">Belum ada riwayat tersimpan.</p>
    {:else}
      {#each history as entry, i}
        <div class="history-row">
          <div class="history-meta">
            <strong>{entry.label}</strong>
            <span class="hint">{new Date(entry.savedAt).toLocaleString('id-ID')}</span>
          </div>
          <div class="btn-row">
            <button class="btn ghost small" onclick={() => restore(entry)}>Muat</button>
            <button class="btn ghost small" onclick={() => copy(rebuildHistoryPrompt(entry), `history-${entry.savedAt}`)}>
              {copied === `history-${entry.savedAt}` ? 'Tersalin ✓' : 'Copy'}
            </button>
            <button class="btn ghost small" onclick={() => dropHistory(i)}>Hapus</button>
          </div>
        </div>
      {/each}
      <div class="btn-row">
        <button class="btn ghost" onclick={clearHistory}>Hapus semua riwayat</button>
      </div>
    {/if}
  </section>

  <footer>
    Semua langkah berjalan lokal di browser. Hanya tombol <strong>Proses AI</strong> yang mengirim clip-plan ke
    layanan pada langkah 8. Simpanan (layanan AI, palet, layout, akun, riwayat) tersimpan di localStorage
    browser ini.
  </footer>
  <span class="sr-only" aria-live="polite">
    {copied ? 'Tersalin ke clipboard' : saved ? 'Tersimpan di browser' : ''}
  </span>
</main>