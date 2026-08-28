import { expect, test } from '@playwright/test';
import { access, readFile, stat } from 'node:fs/promises';

test('@claim:one-click-demo opens a working sample scene in one click', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#audio-status')).toContainText('Sample audio is playing');
  await expect(page.locator('audio-reactive-scene')).toHaveAttribute('aria-label', /connected to audio/);
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
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('@claim:gesture-only-input does not request microphone access before its button is pressed', async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { microphoneCalls?: number }).microphoneCalls = 0;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      (window as Window & { microphoneCalls?: number }).microphoneCalls! += 1;
      return new MediaStream();
    } } });
  });
  await page.goto('/demo');
  expect(await page.evaluate(() => (window as Window & { microphoneCalls?: number }).microphoneCalls)).toBe(0);
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { microphoneCalls?: number }).microphoneCalls)).toBe(1);
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Make sample audio move a scene');
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

test('@claim:package-formats ships ESM, CommonJS, declarations, and component styles', async () => {
  await access('dist/lib/audio-reactive-scene.js');
  await access('dist/lib/audio-reactive-scene.cjs');
  await access('dist/lib/index.d.ts');
  await access('dist/lib/audio-reactive-scene.css');
  expect((await stat('dist/lib/audio-reactive-scene.js')).size).toBeLessThan(20_000);
});

test('@claim:mit-license ships the MIT license', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8')) as { license: string };
  expect(pkg.license).toBe('MIT');
  await expect(readFile('LICENSE', 'utf8')).resolves.toContain('MIT License');
});
