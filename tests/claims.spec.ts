import { expect, test } from '@playwright/test';
import { execFile as execFileCallback, spawn } from 'node:child_process';
import { copyFile, access, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { embedSnippet } from '../site/embed';

const execFile = promisify(execFileCallback);

async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a consumer test port.');
  await new Promise<void>((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  return address.port;
}

async function waitForServer(url: string): Promise<void> {
  await expect.poll(async () => {
    try { return (await fetch(url)).ok; } catch { return false; }
  }, { timeout: 15_000 }).toBe(true);
}

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
  const sampleResponses: Array<{ url: string; status: number; type: string }> = [];
  page.on('response', async (response) => {
    if (new URL(response.url()).pathname.endsWith('/assets/night-market-loop.wav')) {
      sampleResponses.push({
        url: response.url(),
        status: response.status(),
        type: (await response.allHeaders())['content-type'] ?? ''
      });
    }
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#audio-status')).toContainText('Night-market sample is playing');
  await expect(page.locator('audio-reactive-scene')).toHaveAttribute('aria-label', /connected to audio/);
  await expect.poll(() => sampleResponses.length).toBeGreaterThan(0);
  expect([200, 206]).toContain(sampleResponses[0].status);
  expect(sampleResponses[0].type).toBe('audio/wav');
  await page.goto('/demo?demo=1');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Try sample audio');
  await expect(page.locator('.scene-stage')).toBeVisible();
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Night-market sample is playing');
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

test('@claim:complete-embed runs the exact copied embed in a packed clean consumer', async ({ page }) => {
  await page.goto('/demo?demo=1');
  const code = page.locator('#embed-code');
  const copiedEmbed = await code.textContent();
  expect(copiedEmbed).toBe(embedSnippet);
  await page.getByRole('button', { name: 'Copy embed' }).click();
  await expect(page.locator('#copy-result')).toContainText(/Embed copied|Copy was blocked/);

  const root = process.cwd();
  const temporary = await mkdtemp(join(tmpdir(), 'audio-reactive-scene-embed-consumer-'));
  let server: ReturnType<typeof spawn> | undefined;
  try {
    const packed = JSON.parse((await execFile('npm', ['pack', '--json', '--pack-destination', temporary], { cwd: root })).stdout) as Array<{ filename: string }>;
    const consumer = join(temporary, 'consumer');
    await mkdir(consumer);
    await writeFile(join(consumer, 'package.json'), '{"type":"module","private":true}');
    await execFile('npm', ['install', '--ignore-scripts', '--no-package-lock', join(temporary, packed[0].filename)], { cwd: consumer });
    await copyFile(join(root, 'site/public/assets/night-market-loop.wav'), join(consumer, 'your-audio-file.wav'));
    await writeFile(join(consumer, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Copied embed consumer</title></head><body><main><h1>Copied embed consumer</h1>${copiedEmbed}</main></body></html>`);

    const port = await availablePort();
    server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
      cwd: consumer,
      stdio: 'pipe'
    });
    const consumerUrl = `http://127.0.0.1:${port}`;
    await waitForServer(consumerUrl);

    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(consumerUrl);
    const scene = page.locator('audio-reactive-scene');
    const canvas = scene.locator('canvas');
    await expect(canvas).toBeVisible();
    const poster = await canvas.screenshot();
    await page.getByRole('button', { name: 'Play audio' }).click();
    await expect(scene).toHaveAttribute('aria-label', /connected to audio/);
    await expect.poll(async () => !(await canvas.screenshot()).equals(poster)).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    server?.kill('SIGTERM');
    await rm(temporary, { recursive: true, force: true });
  }
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

test('@claim:gesture-only-input starts audio only after a direct-demo Play gesture', async ({ page }) => {
  await page.addInitScript(() => {
    type InputSpies = { microphoneCalls: number; audioContextCalls: number; resumeCalls: number; mediaPlayCalls: number };
    const spies: InputSpies = { microphoneCalls: 0, audioContextCalls: 0, resumeCalls: 0, mediaPlayCalls: 0 };
    Object.defineProperty(window, '__inputSpies', { value: spies });
    const NativeAudioContext = window.AudioContext;
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: class extends NativeAudioContext {
      constructor(options?: AudioContextOptions) { super(options); spies.audioContextCalls += 1; }
      override resume(): Promise<void> { spies.resumeCalls += 1; return super.resume(); }
    } });
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function play(): Promise<void> {
      spies.mediaPlayCalls += 1;
      return nativePlay.call(this);
    };
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
    __inputSpies?: { microphoneCalls: number; audioContextCalls: number; resumeCalls: number; mediaPlayCalls: number };
  }).__inputSpies);
  expect(await inputSpies()).toEqual({ microphoneCalls: 0, audioContextCalls: 0, resumeCalls: 0, mediaPlayCalls: 0 });
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Night-market sample is playing');
  expect(await inputSpies()).toEqual({ microphoneCalls: 0, audioContextCalls: 1, resumeCalls: 1, mediaPlayCalls: 1 });
  expect(autoplayWarnings).toEqual([]);

  await page.reload();
  expect(await inputSpies()).toEqual({ microphoneCalls: 0, audioContextCalls: 0, resumeCalls: 0, mediaPlayCalls: 0 });
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await expect.poll(inputSpies).toEqual({ microphoneCalls: 1, audioContextCalls: 1, resumeCalls: 1, mediaPlayCalls: 0 });
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
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Night-market sample is playing');
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

test('@claim:package-formats ships ESM, CommonJS, declarations, element styles, and no runtime dependencies', async () => {
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
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/404.html');
  const library = (await readFile('dist/lib/audio-reactive-scene.js')).toString('base64');
  const result = await page.evaluate(async (encodedLibrary) => {
    const module = await import(`data:text/javascript;base64,${encodedLibrary}`) as {
      AudioReactiveScene: { new(): HTMLElement };
      defineAudioReactiveScene(name: string): unknown;
    };
    await customElements.whenDefined('audio-reactive-scene');
    type SceneElement = HTMLElement & {
      intensity: number; motion: string; label: string; connect(source: AudioNode): AnalyserNode; disconnect(): void; drawPoster(): void;
    };
    const scene = new module.AudioReactiveScene() as SceneElement;
    document.body.append(scene);
    const context = new AudioContext();
    const source = context.createGain();
    scene.label = 'Consumer visual';
    const propertyReflection = {
      property: scene.label,
      attribute: scene.getAttribute('label'),
      accessibleLabel: scene.getAttribute('aria-label')
    };
    const attributeScene = document.createElement('audio-reactive-scene') as SceneElement;
    document.body.append(attributeScene);
    attributeScene.setAttribute('label', 'Attribute visual');
    const attributeReflection = {
      property: attributeScene.label,
      attribute: attributeScene.getAttribute('label'),
      accessibleLabel: attributeScene.getAttribute('aria-label')
    };
    scene.setAttribute('scene', 'horizon');
    scene.intensity = 2;
    scene.motion = 'static';
    const analyser = scene.connect(source);
    const connected = scene.getAttribute('aria-label');
    scene.disconnect();
    scene.drawPoster();
    module.defineAudioReactiveScene('audio-reactive-scene-test');
    const defaultCreated = document.createElement('audio-reactive-scene') as SceneElement;
    const customCreated = document.createElement('audio-reactive-scene-test') as SceneElement;
    const preConnectionChildren = {
      default: defaultCreated.children.length,
      custom: customCreated.children.length
    };
    document.body.append(defaultCreated, customCreated);
    const defaultAnalyser = defaultCreated.connect(source);
    const customAnalyser = customCreated.connect(source);
    defaultCreated.disconnect();
    customCreated.disconnect();
    const firstPoster = scene.querySelector('canvas')!.toDataURL();
    scene.drawPoster();
    const secondPoster = scene.querySelector('canvas')!.toDataURL();
    return {
      analyser: analyser instanceof AnalyserNode,
      connected,
      propertyReflection,
      attributeReflection,
      scene: scene.getAttribute('scene'),
      intensity: scene.intensity,
      motion: scene.motion,
      documentCreated: {
        preConnectionChildren,
        default: {
          component: defaultCreated instanceof module.AudioReactiveScene,
          connect: typeof defaultCreated.connect,
          canvas: Boolean(defaultCreated.querySelector('canvas')),
          analyser: defaultAnalyser instanceof AnalyserNode
        },
        custom: {
          component: customCreated instanceof module.AudioReactiveScene,
          connect: typeof customCreated.connect,
          canvas: Boolean(customCreated.querySelector('canvas')),
          analyser: customAnalyser instanceof AnalyserNode
        }
      },
      deterministic: firstPoster === secondPoster
    };
  }, library);
  expect(result).toEqual({
    analyser: true,
    connected: 'Consumer visual',
    propertyReflection: {
      property: 'Consumer visual',
      attribute: 'Consumer visual',
      accessibleLabel: 'Consumer visual'
    },
    attributeReflection: {
      property: 'Attribute visual',
      attribute: 'Attribute visual',
      accessibleLabel: 'Attribute visual'
    },
    scene: 'horizon',
    intensity: 1,
    motion: 'static',
    documentCreated: {
      preConnectionChildren: { default: 0, custom: 0 },
      default: { component: true, connect: 'function', canvas: true, analyser: true },
      custom: { component: true, connect: 'function', canvas: true, analyser: true }
    },
    deterministic: true
  });
  await expect(page.getByRole('img', { name: 'Consumer visual', exact: true })).toHaveCount(1);
  await expect(page.getByRole('img', { name: 'Attribute visual', exact: true })).toHaveCount(1);
  expect(errors).toEqual([]);
  await context.close();

  const root = process.cwd();
  const temporary = await mkdtemp(join(tmpdir(), 'audio-reactive-scene-api-consumer-'));
  try {
    const packed = JSON.parse((await execFile('npm', ['pack', '--json', '--pack-destination', temporary], { cwd: root })).stdout) as Array<{ filename: string }>;
    const tarball = join(temporary, packed[0].filename);
    const consumer = join(temporary, 'consumer');
    await mkdir(consumer);
    await writeFile(join(consumer, 'package.json'), '{"type":"module"}');
    await execFile('npm', ['install', '--ignore-scripts', '--no-package-lock', tarball], { cwd: consumer });
    await writeFile(join(consumer, 'consumer.ts'), [
      "import { AudioReactiveScene } from 'audio-reactive-scene';",
      "const scene = new AudioReactiveScene();",
      "scene.label = 'Consumer visual';",
      "const reflectedLabel: string = scene.label;",
      'void reflectedLabel;'
    ].join('\n'));
    const typecheck = await execFile(process.execPath, [
      resolve(root, 'node_modules/typescript/bin/tsc'),
      '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'consumer.ts'
    ], { cwd: consumer });
    expect(typecheck.stderr).toBe('');
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
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
  await expect(page.locator('#audio-status')).toContainText('Night-market sample is playing');
  expect(offOrigin).toEqual([]);
  expect(apiRequests).toEqual([]);
  expect(await browserUserStorage(page)).toEqual({ local: [], session: [], databases: [], opfs: [] });
});
