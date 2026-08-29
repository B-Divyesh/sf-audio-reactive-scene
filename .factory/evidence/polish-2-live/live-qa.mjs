import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://audio-reactive-scene.sociobot.in';
const output = new URL('.', import.meta.url);
const browser = await chromium.launch();
const report = { checkedAt: new Date().toISOString(), base };

const desktop = await browser.newContext({ viewport: { width: 1365, height: 768 } });
const desktopPage = await desktop.newPage();
const desktopErrors = [];
desktopPage.on('console', (message) => { if (message.type() === 'error') desktopErrors.push(message.text()); });
desktopPage.on('pageerror', (error) => desktopErrors.push(error.message));
await desktopPage.goto(base, { waitUntil: 'networkidle' });
await desktopPage.screenshot({ path: new URL('home-desktop.png', output).pathname });
report.desktopFirstScreen = await desktopPage.evaluate(() => ({
  title: document.title,
  eyebrow: document.querySelector('.eyebrow')?.textContent?.trim(),
  h1: document.querySelector('h1')?.textContent?.trim(),
  action: document.querySelector('[data-start-sample]')?.textContent?.trim(),
  facts: [...document.querySelectorAll('.facts li')].map((item) => item.textContent?.trim()),
  allInViewport: [...document.querySelectorAll('h1, .lede, [data-start-sample], .action-note, .facts')]
    .every((item) => item.getBoundingClientRect().bottom <= innerHeight)
}));
report.desktopErrors = desktopErrors;
await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await mobile.newPage();
const errors = [];
const requests = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', async (response) => {
  requests.push({ url: response.url(), status: response.status(), type: (await response.allHeaders())['content-type'] ?? '' });
});
await page.goto(base, { waitUntil: 'networkidle' });
await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.locator('#audio-status').filter({ hasText: 'Percussion loop is playing' }).waitFor();
const canvas = page.locator('audio-reactive-scene canvas');
const firstFrame = await canvas.screenshot();
await page.waitForTimeout(350);
const secondFrame = await canvas.screenshot();
await page.screenshot({ path: new URL('demo-mobile-playing.png', output).pathname });
report.oneClickDemo = {
  url: page.url(),
  banner: await page.locator('.demo-banner').innerText(),
  exitLabel: await page.getByRole('link', { name: 'Open package instructions' }).innerText(),
  status: await page.locator('#audio-status').innerText(),
  connected: await page.locator('audio-reactive-scene').getAttribute('aria-label'),
  canvasChanged: !firstFrame.equals(secondFrame),
  sampleResponses: requests.filter((item) => item.url.endsWith('/assets/night-market-loop.wav')),
  viewport: await page.evaluate(() => {
    const stage = document.querySelector('.scene-stage').getBoundingClientRect();
    const status = document.querySelector('#audio-status').getBoundingClientRect();
    return { width: innerWidth, height: innerHeight, stageBottom: stage.bottom, statusBottom: status.bottom, scrollWidth: document.documentElement.scrollWidth };
  })
};
await page.getByRole('link', { name: 'Open package instructions' }).click();
report.demoExit = { url: page.url(), focused: await page.evaluate(() => document.activeElement?.id) };

await page.goto(`${base}/demo?demo=1`);
await page.evaluate(async () => {
  localStorage.setItem('real:sentinel', 'keep');
  sessionStorage.setItem('real:sentinel', 'keep');
  const database = indexedDB.open('real-sentinel', 1);
  await new Promise((resolve, reject) => { database.onsuccess = resolve; database.onerror = reject; });
  const directory = await navigator.storage.getDirectory();
  await directory.getFileHandle('real-sentinel.txt', { create: true });
});
await page.getByRole('button', { name: 'Play sample audio' }).click();
await page.locator('#audio-status').filter({ hasText: 'Percussion loop is playing' }).waitFor();
await page.getByRole('button', { name: 'Reset demo' }).click();
report.isolation = await page.evaluate(async () => ({
  local: localStorage.getItem('real:sentinel'),
  session: sessionStorage.getItem('real:sentinel'),
  databases: 'databases' in indexedDB ? (await indexedDB.databases()).map((item) => item.name) : [],
  opfs: await (async () => {
    const names = [];
    const directory = await navigator.storage.getDirectory();
    for await (const [name] of directory.entries()) names.push(name);
    return names;
  })(),
  resetStatus: document.querySelector('#audio-status')?.textContent?.trim()
}));

report.routes = [];
for (const route of ['/privacy', '/terms', '/missing-signal', '/404.html']) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  report.routes.push({
    route,
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator('h1').innerText(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    description: await page.locator('meta[name="description"]').getAttribute('content'),
    privacyLinks: await page.getByRole('link', { name: 'Privacy', exact: true }).count(),
    termsLinks: await page.getByRole('link', { name: 'Terms', exact: true }).count(),
    seriousOrCritical: axe.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical').length
  });
}

report.offOrigin = requests.filter((item) => new URL(item.url).origin !== base);
report.errors = errors;
await mobile.close();
await browser.close();
await writeFile(new URL('live-qa.json', output), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
