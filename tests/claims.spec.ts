import { expect, test } from '@playwright/test';
import { execFile as execFileCallback } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

async function browserUserStorage(page: import('@playwright/test').Page): Promise<{ local: string[]; session: string[]; databases: string[]; opfs: string[] }> {
  return page.evaluate(async () => {
    const databases = 'databases' in indexedDB
      ? (await indexedDB.databases()).map((database) => database.name ?? '')
      : [];
    const directory = await navigator.storage.getDirectory();
    const opfs: string[] = [];
    const entries = (directory as FileSystemDirectoryHandle & { entries(): AsyncIterableIterator<[string, FileSystemHandle]> }).entries();
    for await (const [name] of entries) opfs.push(name);
    return {
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      databases,
      opfs
    };
  });
}

test('@claim:one-click-demo opens a working sample scene in one click', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#audio-status')).toContainText('Sample audio is playing');
  await expect(page.locator('audio-reactive-scene')).toHaveAttribute('aria-label', /connected to audio/);
  await page.goto('/demo?demo=1');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Try sample audio');
  await expect(page.locator('.scene-stage')).toBeVisible();
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Sample audio is playing');
});

test('@claim:three-scenes-controls changes scene, intensity, and motion', async ({ page }) => {
  await page.goto('/demo');
  const scene = page.locator('audio-reactive-scene');
  await page.getByRole('tab', { name: 'Lanterns' }).click();
  await expect(scene).toHaveAttribute('scene', 'lanterns');
  await page.locator('#intensity').fill('35');
  await expect(scene).toHaveAttribute('intensity', '0.35');
  await page.getByRole('button', { name: 'Static' }).click();
  await expect(scene).toHaveAttribute('motion', 'static');
});

test('@claim:complete-embed copies a complete user-started audio connection', async ({ page }) => {
  await page.goto('/demo?demo=1');
  const code = page.locator('#embed-code');
  await expect(code).toContainText('<audio id="scene-audio"');
  await expect(code).toContainText('const context = new AudioContext()');
  await expect(code).toContainText("audio.addEventListener('play'");
  await expect(code).toContainText('scene.connect(source)');
  await expect(code).toContainText('source.connect(context.destination)');
  await page.getByRole('button', { name: 'Copy embed' }).click();
  await expect(page.locator('#copy-result')).toContainText(/Embed copied|Copy was blocked/);
});

test('@claim:local-only-audio keeps the complete demo flow on the same origin', async ({ page }) => {
  const offOrigin: string[] = [];
  const apiRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') apiRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  const sampleRate = 8000;
  const samples = 800;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + samples * 2, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index++) wav.writeInt16LE(Math.sin(index / 8) * 8000, 44 + index * 2);
  await page.locator('#audio-file').setInputFiles({ name: 'night-loop.wav', mimeType: 'audio/wav', buffer: wav });
  await expect(page.locator('#audio-status')).toContainText('Playing night-loop.wav in this tab');
  await page.getByRole('tab', { name: 'Horizon' }).click();
  await page.getByRole('button', { name: 'Copy embed' }).click();
  await expect(page.locator('#copy-result')).toContainText(/Embed copied|Copy was blocked/);
  expect(offOrigin).toEqual([]);
  expect(apiRequests).toEqual([]);
  expect(await browserUserStorage(page)).toEqual({ local: [], session: [], databases: [], opfs: [] });
});

test('@claim:gesture-only-input starts exactly one audio loop only after a direct-demo Play gesture', async ({ page }) => {
  await page.addInitScript(() => {
    type InputSpies = { microphoneCalls: number; audioContextCalls: number; resumeCalls: number; oscillatorCalls: number };
    const spies: InputSpies = { microphoneCalls: 0, audioContextCalls: 0, resumeCalls: 0, oscillatorCalls: 0 };
    Object.defineProperty(window, '__inputSpies', { value: spies });
    const NativeAudioContext = window.AudioContext;
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: class extends NativeAudioContext {
      constructor(options?: AudioContextOptions) { super(options); spies.audioContextCalls += 1; }
      override resume(): Promise<void> { spies.resumeCalls += 1; return super.resume(); }
      override createOscillator(): OscillatorNode { spies.oscillatorCalls += 1; return super.createOscillator(); }
    } });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      spies.microphoneCalls += 1;
      return new MediaStream();
    } } });
  });
  const autoplayWarnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().includes('AudioContext was not allowed to start')) autoplayWarnings.push(message.text());
  });
  await page.goto('/demo?demo=1');
  const inputSpies = () => page.evaluate(() => (window as typeof window & {
    __inputSpies?: { microphoneCalls: number; audioContextCalls: number; resumeCalls: number; oscillatorCalls: number };
  }).__inputSpies);
  expect(await inputSpies()).toEqual({ microphoneCalls: 0, audioContextCalls: 0, resumeCalls: 0, oscillatorCalls: 0 });
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Sample audio is playing');
  expect(await inputSpies()).toEqual({ microphoneCalls: 0, audioContextCalls: 1, resumeCalls: 1, oscillatorCalls: 4 });
  expect(autoplayWarnings).toEqual([]);

  await page.reload();
  expect(await inputSpies()).toEqual({ microphoneCalls: 0, audioContextCalls: 0, resumeCalls: 0, oscillatorCalls: 0 });
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await expect.poll(inputSpies).toEqual({ microphoneCalls: 1, audioContextCalls: 1, resumeCalls: 1, oscillatorCalls: 0 });
});

test('@claim:offline-reload reloads the demo without a network', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Try sample audio');
  await expect(page.getByText('You are offline. The demo and sample scene still work.')).toBeVisible();
});

test('@claim:motion-reduction draws a stable poster when the system reduces motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/demo');
  const canvas = page.locator('audio-reactive-scene').locator('canvas');
  const first = await canvas.screenshot();
  await page.waitForTimeout(450);
  const second = await canvas.screenshot();
  expect(first.equals(second)).toBe(true);
  await context.close();
});

test('@claim:package-formats ships ESM, CommonJS, declarations, component styles, and no runtime dependencies', async () => {
  await access('dist/lib/audio-reactive-scene.js');
  await access('dist/lib/audio-reactive-scene.cjs');
  await access('dist/lib/index.d.ts');
  await access('dist/lib/audio-reactive-scene.css');
  expect((await stat('dist/lib/audio-reactive-scene.js')).size).toBeLessThan(20_000);
  const pkg = JSON.parse(await readFile('package.json', 'utf8')) as { dependencies?: Record<string, string> };
  expect(pkg.dependencies ?? {}).toEqual({});
  const root = process.cwd();
  const temporary = await mkdtemp(join(tmpdir(), 'audio-reactive-scene-consumer-'));
  try {
    const packed = JSON.parse((await execFile('npm', ['pack', '--json', '--pack-destination', temporary], { cwd: root })).stdout) as Array<{ filename: string }>;
    const tarball = join(temporary, packed[0].filename);
    const consumer = join(temporary, 'consumer');
    await mkdir(consumer);
    await writeFile(join(consumer, 'package.json'), '{"type":"module"}');
    await execFile('npm', ['install', '--ignore-scripts', '--no-package-lock', tarball], { cwd: consumer });
    const esm = await execFile(process.execPath, ['--input-type=module', '--eval', "import * as pkg from 'audio-reactive-scene'; if (!pkg.AudioReactiveScene || !pkg.defineAudioReactiveScene) process.exit(1)"], { cwd: consumer });
    expect(esm.stderr).toBe('');
    const commonJs = await execFile(process.execPath, ['--eval', "const pkg=require('audio-reactive-scene'); if (!pkg.AudioReactiveScene || !pkg.defineAudioReactiveScene) process.exit(1)"], { cwd: consumer });
    expect(commonJs.stderr).toBe('');
    await access(resolve(consumer, 'node_modules/audio-reactive-scene/dist/lib/audio-reactive-scene.css'));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('@claim:library-api supports the documented component API', async ({ browser }) => {
  const context = await browser.newContext({ bypassCSP: true });
  const page = await context.newPage();
  await page.goto('/404.html');
  const library = (await readFile('dist/lib/audio-reactive-scene.js')).toString('base64');
  const result = await page.evaluate(async (encodedLibrary) => {
    const module = await import(`data:text/javascript;base64,${encodedLibrary}`) as {
      AudioReactiveScene: { new(): HTMLElement };
      defineAudioReactiveScene(name: string): unknown;
    };
    await customElements.whenDefined('audio-reactive-scene');
    const scene = new module.AudioReactiveScene() as HTMLElement & {
      intensity: number; motion: string; connect(source: AudioNode): AnalyserNode; disconnect(): void; drawPoster(): void;
    };
    document.body.append(scene);
    const context = new AudioContext();
    const source = context.createGain();
    scene.setAttribute('label', 'A custom scene label');
    scene.setAttribute('scene', 'horizon');
    scene.intensity = 2;
    scene.motion = 'static';
    const analyser = scene.connect(source);
    const connected = scene.getAttribute('aria-label');
    scene.disconnect();
    scene.drawPoster();
    module.defineAudioReactiveScene('audio-reactive-scene-test');
    const CustomScene = customElements.get('audio-reactive-scene-test')!;
    const custom = new CustomScene();
    const firstPoster = scene.querySelector('canvas')!.toDataURL();
    scene.drawPoster();
    const secondPoster = scene.querySelector('canvas')!.toDataURL();
    return {
      analyser: analyser instanceof AnalyserNode,
      connected,
      label: scene.getAttribute('aria-label'),
      scene: scene.getAttribute('scene'),
      intensity: scene.intensity,
      motion: scene.motion,
      custom: custom instanceof HTMLElement && Boolean(custom.querySelector('canvas')),
      deterministic: firstPoster === secondPoster
    };
  }, library);
  expect(result).toEqual({ analyser: true, connected: 'A custom scene label', label: 'A custom scene label', scene: 'horizon', intensity: 1, motion: 'static', custom: true, deterministic: true });
  await context.close();
});

test('@claim:node-support declares and uses Node.js 20 or newer', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8')) as { engines: { node: string } };
  expect(pkg.engines.node).toBe('>=20');
  expect(Number(process.versions.node.split('.')[0])).toBeGreaterThanOrEqual(20);
});

test('@claim:site-build-output writes the deployable site root', async () => {
  await access('dist/site/index.html');
  await access('dist/site/404.html');
  await access('dist/site/sw.js');
  await access('dist/site/assets');
});

test('@claim:npm-unpublished is not available from the npm registry', async () => {
  await expect(execFile('npm', ['view', 'audio-reactive-scene', 'version', '--json'])).rejects.toMatchObject({ stderr: expect.stringContaining('E404') });
});

test('@claim:mit-license ships the MIT license', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8')) as { license: string };
  expect(pkg.license).toBe('MIT');
  await expect(readFile('LICENSE', 'utf8')).resolves.toContain('MIT License');
});

test('@claim:privacy-no-personal-data keeps demo data in this browser without collecting it', async ({ page }) => {
  const offOrigin: string[] = [];
  const apiRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') apiRequests.push(request.url());
  });
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy in plain words');
  await expect(page.getByText('This site does not collect, store, or sell personal data.')).toBeVisible();
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Sample audio is playing');
  expect(offOrigin).toEqual([]);
  expect(apiRequests).toEqual([]);
  expect(await browserUserStorage(page)).toEqual({ local: [], session: [], databases: [], opfs: [] });
});
