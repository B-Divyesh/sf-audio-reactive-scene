import '../src/index';
import type { AudioReactiveScene, MotionMode, SceneName } from '../src/index';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const announce = document.querySelector<HTMLDivElement>('#route-status')!;
const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const snippet = `<script type="module">
  import 'audio-reactive-scene';
  import 'audio-reactive-scene/style.css';
<\/script>
<audio-reactive-scene
  scene="ribbons"
  intensity="0.7"
  motion="auto">
</audio-reactive-scene>`;

let audioContext: AudioContext | undefined;
let sourceNode: AudioNode | undefined;
let mediaStream: MediaStream | undefined;
let mediaElement: HTMLAudioElement | undefined;
let sampleNodes: AudioScheduledSourceNode[] = [];

interface RouteState {
  scrollY: number;
  focusId?: string;
}

function header(current: string): string {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="Audio Reactive Scene home"><span class="wordmark-mark" aria-hidden="true"></span><span>Audio Reactive Scene</span></a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/demo" data-link ${current === 'demo' ? 'aria-current="page"' : ''}>Demo</a>
      <a href="/#how" data-link>How it works</a>
      <a href="/#install" data-link>Install</a>
      <a href="/privacy" data-link ${current === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a>
    </nav>
  </header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div class="footer-grid">
    <span>Make page audio move a small canvas.</span>
    <span class="footer-links"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in" rel="noreferrer">Built by Param Factory <span class="sr-only">(external site)</span></a><span>v0.1.2 · build 2026.08.29</span></span>
  </div></footer><div class="offline-note" role="status">You are offline. The demo and sample scene still work.</div>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><span>Demo — sample data, nothing is saved</span><button id="reset-demo" type="button">Reset demo</button><a href="/" data-link>Start for real</a></aside>`;
}

function playground(): string {
  return `<div class="playground-shell">
    <div class="scene-stage">
      <span class="scene-label">Live scene / <span id="scene-name">Ribbons</span></span>
      <audio-reactive-scene id="scene" scene="ribbons" intensity="0.7" motion="auto"></audio-reactive-scene>
    </div>
    <div class="controls">
      <div class="control-group">
        <span class="control-label" id="scene-tabs-label">Choose a scene</span>
        <div class="tab-list" role="tablist" aria-labelledby="scene-tabs-label">
          <button class="tab" type="button" role="tab" aria-selected="true" data-scene="ribbons">Ribbons</button>
          <button class="tab" type="button" role="tab" aria-selected="false" data-scene="lanterns">Lanterns</button>
          <button class="tab" type="button" role="tab" aria-selected="false" data-scene="horizon">Horizon</button>
        </div>
        <div class="slider-row">
          <label for="intensity">Intensity</label>
          <output class="meter-value" id="intensity-value" for="intensity">70%</output>
        </div>
        <input id="intensity" type="range" min="0" max="100" value="70" aria-describedby="intensity-help" />
        <span class="sr-only" id="intensity-help">Changes how strongly the scene responds to audio.</span>
      </div>
      <div class="control-group">
        <span class="control-label">Choose audio</span>
        <div class="source-list">
          <button class="source coral" id="sample-audio" type="button">Play sample audio</button>
          <button class="source" id="choose-file" type="button">Choose audio file</button>
          <button class="source" id="use-mic" type="button">Use microphone</button>
          <input class="file-input" id="audio-file" type="file" accept="audio/*" tabindex="-1" aria-label="Choose an audio file" />
        </div>
        <span class="control-label motion-heading">Motion</span>
        <div class="motion-list">
          <button class="motion-button" type="button" data-motion="auto" aria-pressed="true">System setting</button>
          <button class="motion-button" type="button" data-motion="full" aria-pressed="false">Full motion</button>
          <button class="motion-button" type="button" data-motion="static" aria-pressed="false">Static</button>
        </div>
        <p class="status-line" id="audio-status" role="status"><span class="status-dot" aria-hidden="true"></span><span>Static poster is ready. Choose audio to make it move.</span></p>
      </div>
    </div>
    <div class="code-panel">
      <div><span class="control-label">Copy this embed</span><pre><code id="embed-code"></code></pre><p class="copy-result" id="copy-result" aria-live="polite"></p></div>
      <button class="button secondary" id="copy-embed" type="button">Copy embed</button>
    </div>
  </div>`;
}

function home(isDemo = false): string {
  return `${header(isDemo ? 'demo' : 'home')}${isDemo ? demoBanner() : ''}<main id="main" tabindex="-1">
    <section class="hero wrap">
      <div>
        <p class="eyebrow">A web component for page audio</p>
        <h1>${isDemo ? 'Make sample audio move a scene' : 'Make your audio move a scene'}</h1>
        <p class="lede">For site owners, streamers, and event makers who need a restrained visual without sending audio away.</p>
        <div class="hero-action"><a class="button coral" href="/demo" data-link data-start-sample>Try it with sample data</a><span class="action-note">It opens the playground and starts a local sound loop.</span></div>
        <ul class="facts"><li>Audio stays in this tab</li><li>Works after the first visit</li><li>Free under the MIT license</li></ul>
      </div>
      <div class="hero-art" aria-hidden="true"><img src="/assets/hero-market.webp" width="768" height="512" fetchpriority="high" alt="" /><span class="art-ticket">Three scenes / one small component / your audio</span></div>
    </section>
    <section class="section" id="playground"><div class="wrap">
      <p class="section-kicker">The working component</p><h2>Shape the scene here</h2>
      <p class="section-intro">Pick a look. Play the bundled sample, choose a file, or allow the microphone. The browser handles the selected audio source.</p>
      ${playground()}
    </div></section>
    <section class="section" id="how"><div class="wrap">
      <p class="section-kicker">How it works</p><h2>Connect audio in three steps</h2>
      <div class="steps"><article class="step"><h3>Add the element</h3><p>Install the package and place the custom element where the scene belongs.</p></article><article class="step"><h3>Connect your source</h3><p>Pass a Web Audio node after the visitor starts playback.</p></article><article class="step"><h3>Set the fallback</h3><p>Keep automatic motion reduction or choose the static poster.</p></article></div>
    </div></section>
    <section class="section"><div class="wrap boundary">
      <div><p class="section-kicker">Clear boundaries</p><h2>Your audio does not leave</h2><p class="section-intro">The component has no analytics or account system. It reads levels from the browser audio graph and sends no audio to an API.</p></div>
      <ul class="not-list"><li>It does not start audio on page load.</li><li>It does not ask for microphone access by itself.</li><li>It does not upload or save an audio file.</li><li>It does not load scripts or fonts from another site.</li></ul>
    </div></section>
    <section class="section" id="install"><div class="narrow"><p class="section-kicker">Open package</p><h2>Install it in one line</h2><p>The package ships ESM, CommonJS, TypeScript declarations, component styles, and no runtime dependencies.</p><div class="install-command"><code>npm install audio-reactive-scene</code><button class="button secondary" type="button" id="copy-install">Copy command</button></div></div></section>
  </main>${footer()}`;
}

function legal(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  return `${header(kind)}<main id="main" class="legal narrow" tabindex="-1"><p class="eyebrow">Last updated 28 August 2026</p><h1>${privacy ? 'Privacy in plain words' : 'Terms for using the library'}</h1>${privacy ? `
    <p>This site does not collect, store, or sell personal data.</p><h2>Audio stays on your device</h2><p>The demo processes audio in your browser. Files are not uploaded. Microphone access starts only after you press “Use microphone” and approve the browser prompt.</p><h2>Local browser storage</h2><p>The service worker stores public site files for offline use. The demo does not store settings or audio. Reset demo stops the active source and restores the controls.</p><h2>Network requests</h2><p>The site requests only its own files. It has no analytics, advertising, third-party fonts, or runtime CDN calls.</p><h2>Your choices</h2><p>You can deny microphone access and use the sample or a local audio file. Clear this site’s browser data to remove its offline cache.</p>` : `
    <p>Audio Reactive Scene is open-source software under the MIT License.</p><h2>You may use and change it</h2><p>You may use, copy, modify, publish, and distribute the library under the license terms included with the package.</p><h2>No warranty</h2><p>The software is provided “as is,” without warranty. Test it in your own site before relying on it at an event or during a stream.</p><h2>Your responsibilities</h2><p>Only process audio you have permission to use. Ask visitors before requesting microphone access. Follow the laws that apply to your site.</p>`}<p><a href="/" data-link>Return to Audio Reactive Scene</a></p></main>${footer()}`;
}

function notFound(): string {
  return `${header('404')}<main id="main" class="error-page narrow" tabindex="-1"><div><div class="error-code" aria-hidden="true">404</div><h1>This signal went quiet</h1><p>The page does not exist. Return to the playground to start a scene.</p><a class="button" href="/" data-link>Return to the playground</a></div></main>${footer()}`;
}

function stopAudio(): void {
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = undefined;
  mediaElement?.pause();
  if (mediaElement?.src.startsWith('blob:')) URL.revokeObjectURL(mediaElement.src);
  mediaElement = undefined;
  document.querySelector<AudioReactiveScene>('#scene')?.disconnect();
  sourceNode?.disconnect();
  sourceNode = undefined;
  sampleNodes.forEach((node) => { try { node.stop(); } catch { /* The node has already stopped. */ } });
  sampleNodes = [];
  document.querySelectorAll<HTMLElement>('.source').forEach((button) => delete button.dataset.active);
}

function setStatus(message: string, error = false): void {
  const status = document.querySelector<HTMLElement>('#audio-status');
  if (!status) return;
  status.classList.toggle('error', error);
  status.querySelector('span:last-child')!.textContent = message;
}

async function ensureContext(): Promise<AudioContext> {
  audioContext ??= new AudioContext();
  await audioContext.resume();
  return audioContext;
}

async function playSample(): Promise<void> {
  stopAudio();
  try {
    const context = await ensureContext();
    const mix = context.createGain();
    const output = context.createGain();
    output.gain.value = .055;
    const frequencies = [110, 164.81, 220];
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = .15;
      oscillator.connect(gain).connect(mix);
      oscillator.start();
      sampleNodes.push(oscillator);
    });
    const pulse = context.createOscillator();
    const pulseGain = context.createGain();
    pulse.frequency.value = 1.25;
    pulseGain.gain.value = .14;
    pulse.connect(pulseGain).connect(mix);
    pulse.start();
    sampleNodes.push(pulse);
    mix.connect(output).connect(context.destination);
    sourceNode = mix;
    document.querySelector<AudioReactiveScene>('#scene')?.connect(mix);
    document.querySelector<HTMLElement>('#sample-audio')!.dataset.active = 'true';
    setStatus('Sample audio is playing. Press the button again to restart it.');
  } catch {
    setStatus('The sample could not start. Check browser audio permission and try again.', true);
  }
}

async function playFile(file: File): Promise<void> {
  stopAudio();
  if (!file.type.startsWith('audio/')) {
    setStatus('That file is not recognised as audio. Choose an MP3, WAV, or OGG file.', true);
    return;
  }
  try {
    const context = await ensureContext();
    mediaElement = new Audio(URL.createObjectURL(file));
    mediaElement.loop = true;
    const node = context.createMediaElementSource(mediaElement);
    node.connect(context.destination);
    sourceNode = node;
    document.querySelector<AudioReactiveScene>('#scene')?.connect(node);
    await mediaElement.play();
    document.querySelector<HTMLElement>('#choose-file')!.dataset.active = 'true';
    setStatus(`Playing ${file.name} in this tab. The file is not uploaded.`);
  } catch {
    setStatus('The audio file could not play. Choose another audio file.', true);
  }
}

async function useMicrophone(): Promise<void> {
  stopAudio();
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus('This browser cannot provide microphone audio. Use the sample or an audio file.', true);
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = await ensureContext();
    sourceNode = context.createMediaStreamSource(mediaStream);
    document.querySelector<AudioReactiveScene>('#scene')?.connect(sourceNode);
    document.querySelector<HTMLElement>('#use-mic')!.dataset.active = 'true';
    setStatus('Microphone levels are active in this tab. Nothing is recorded or uploaded.');
  } catch {
    setStatus('Microphone access was not allowed. Use the sample or choose an audio file.', true);
  }
}

function setupPlayground(autoStart: boolean): void {
  const scene = document.querySelector<AudioReactiveScene>('#scene');
  if (!scene) return;
  document.querySelector('#embed-code')!.textContent = snippet;
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('.tab')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.scene as SceneName;
      scene.scene = name;
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      document.querySelector('#scene-name')!.textContent = tab.textContent;
    });
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[next].focus(); tabs[next].click();
    });
  });
  const intensity = document.querySelector<HTMLInputElement>('#intensity')!;
  intensity.addEventListener('input', () => {
    scene.intensity = Number(intensity.value) / 100;
    document.querySelector('#intensity-value')!.textContent = `${intensity.value}%`;
  });
  document.querySelectorAll<HTMLButtonElement>('.motion-button').forEach((button) => button.addEventListener('click', () => {
    scene.motion = button.dataset.motion as MotionMode;
    document.querySelectorAll<HTMLButtonElement>('.motion-button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  }));
  document.querySelector('#sample-audio')?.addEventListener('click', playSample);
  document.querySelector('#choose-file')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#audio-file')?.click());
  document.querySelector<HTMLInputElement>('#audio-file')?.addEventListener('change', (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (file) void playFile(file);
  });
  document.querySelector('#use-mic')?.addEventListener('click', useMicrophone);
  document.querySelector('#copy-embed')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(snippet); document.querySelector('#copy-result')!.textContent = 'Embed copied.'; }
    catch { document.querySelector('#copy-result')!.textContent = 'Copy was blocked. Select the code and copy it.'; }
  });
  document.querySelector('#copy-install')?.addEventListener('click', async () => navigator.clipboard.writeText('npm install audio-reactive-scene'));
  document.querySelector('#reset-demo')?.addEventListener('click', () => { stopAudio(); scene.scene = 'ribbons'; scene.intensity = .7; scene.motion = 'auto'; intensity.value = '70'; document.querySelector('#intensity-value')!.textContent = '70%'; tabs[0].click(); document.querySelector<HTMLButtonElement>('[data-motion="auto"]')?.click(); setStatus('Demo reset. Play the sample to start again.'); });
  if (autoStart) void playSample();
}

function focusRouteTarget(target: HTMLElement | null, fallback: HTMLHeadingElement | null): void {
  const element = target ?? fallback;
  if (!element) return;
  element.setAttribute('tabindex', '-1');
  element.focus({ preventScroll: true });
}

function hashTarget(): HTMLElement | null {
  if (!location.hash) return null;
  try { return document.querySelector<HTMLElement>(location.hash); }
  catch { return null; }
}

function targetScrollY(target: HTMLElement): number {
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY);
}

function route(path = location.pathname, autoStart = false, restoredState?: RouteState | null): void {
  stopAudio();
  const isHome = path === '/';
  const isDemo = path === '/demo';
  const title = isDemo ? 'Demo — Audio Reactive Scene' : path === '/privacy' ? 'Privacy — Audio Reactive Scene' : path === '/terms' ? 'Terms — Audio Reactive Scene' : isHome ? 'Audio Reactive Scene — Make audio move a canvas' : 'Page not found — Audio Reactive Scene';
  document.title = title;
  canonical.href = `https://audio-reactive-scene.sociobot.in${isHome ? '/' : path}`;
  app.innerHTML = isHome || isDemo ? home(isDemo) : path === '/privacy' ? legal('privacy') : path === '/terms' ? legal('terms') : notFound();
  setupLinks();
  if (isHome || isDemo) setupPlayground(autoStart);
  const heading = document.querySelector<HTMLHeadingElement>('h1');
  if (restoredState) {
    requestAnimationFrame(() => {
      window.scrollTo(0, restoredState.scrollY);
      focusRouteTarget(restoredState.focusId ? document.getElementById(restoredState.focusId) : hashTarget(), heading);
    });
  } else {
    window.scrollTo(0, 0);
    const target = hashTarget();
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView();
        history.replaceState({ ...history.state, scrollY: targetScrollY(target), focusId: target.id }, '', location.href);
      });
    }
    if (!isHome || autoStart) focusRouteTarget(null, heading);
  }
  announce.textContent = title;
}

function rememberCurrentRoute(): void {
  const active = document.activeElement;
  const focusId = active instanceof HTMLElement && active.id ? active.id : location.hash.slice(1);
  const target = hashTarget();
  history.replaceState({ ...history.state, scrollY: target ? targetScrollY(target) : window.scrollY, focusId }, '', location.href);
}

function setupLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || link.target) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    const start = link.hasAttribute('data-start-sample');
    rememberCurrentRoute();
    history.pushState({ scrollY: 0 }, '', url.pathname + url.hash);
    route(url.pathname, start);
  }));
}

window.addEventListener('popstate', (event) => route(location.pathname, false, event.state as RouteState | null));
window.addEventListener('online', () => document.documentElement.classList.remove('offline'));
window.addEventListener('offline', () => document.documentElement.classList.add('offline'));
if (!navigator.onLine) document.documentElement.classList.add('offline');
route(location.pathname, new URLSearchParams(location.search).get('demo') === '1', history.state as RouteState | null);

if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
