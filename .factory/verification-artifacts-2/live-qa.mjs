import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://audio-reactive-scene.sociobot.in';
const result = { generatedAt: new Date().toISOString(), origin };
const browser = await chromium.launch({ headless: true });

function wire(page, bucket) {
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') bucket.console.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', error => bucket.pageErrors.push(error.message));
  page.on('request', request => bucket.requests.push({ url: request.url(), method: request.method(), type: request.resourceType() }));
  page.on('requestfailed', request => bucket.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
}

async function storage(page) {
  return page.evaluate(async () => {
    const databases = 'databases' in indexedDB ? (await indexedDB.databases()).map(item => item.name ?? '') : [];
    const root = await navigator.storage.getDirectory();
    const opfs = [];
    for await (const [name] of root.entries()) opfs.push(name);
    return { localStorage: Object.keys(localStorage), sessionStorage: Object.keys(sessionStorage), databases, opfs };
  });
}

async function axe(page) {
  const report = await new AxeBuilder({ page }).analyze();
  return report.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.map(n => n.target) }));
}

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: [] });
const desktop = await desktopContext.newPage();
const desktopLog = { console: [], pageErrors: [], requests: [], requestFailures: [] };
wire(desktop, desktopLog);
const rootResponse = await desktop.goto(origin, { waitUntil: 'networkidle' });
await desktop.screenshot({ path: '.factory/verification-artifacts-2/live-root-desktop.png', fullPage: false });
const firstViewport = await desktop.locator('body').evaluate(() => ({
  width: innerWidth,
  height: innerHeight,
  h1: document.querySelector('h1')?.textContent?.trim(),
  audience: [...document.querySelectorAll('p')].map(p => p.textContent?.trim()).find(text => text?.startsWith('For site owners')),
  primary: document.querySelector('a[data-start-sample]')?.textContent?.trim(),
  primaryExplanation: document.querySelector('a[data-start-sample]')?.nextElementSibling?.textContent?.trim(),
  primaryTop: document.querySelector('a[data-start-sample]')?.getBoundingClientRect().top,
  facts: [...document.querySelectorAll('.facts li')].map(el => ({ text: el.textContent?.trim(), top: el.getBoundingClientRect().top }))
}));
await desktop.getByRole('link', { name: 'Try it with sample data' }).click();
await desktop.waitForURL(`${origin}/demo`);
await desktop.locator('#audio-status').filter({ hasText: 'Sample audio is playing' }).waitFor();
const oneClick = {
  url: desktop.url(),
  banner: await desktop.getByText('Demo — sample data, nothing is saved').isVisible(),
  status: await desktop.locator('#audio-status').innerText(),
  sceneLabel: await desktop.locator('audio-reactive-scene').getAttribute('aria-label')
};

const sceneResults = [];
for (const name of ['Ribbons', 'Lanterns', 'Horizon']) {
  await desktop.getByRole('tab', { name }).click();
  sceneResults.push({ name, attr: await desktop.locator('audio-reactive-scene').getAttribute('scene'), selected: await desktop.getByRole('tab', { name }).getAttribute('aria-selected') });
}
const intensityResults = [];
for (const value of ['0', '100']) {
  await desktop.locator('#intensity').fill(value);
  intensityResults.push({ entered: value, display: await desktop.locator('#intensity-value').innerText(), attr: await desktop.locator('audio-reactive-scene').getAttribute('intensity') });
}
await desktop.getByRole('button', { name: 'Static' }).click();
const staticMode = { attr: await desktop.locator('audio-reactive-scene').getAttribute('motion'), pressed: await desktop.getByRole('button', { name: 'Static' }).getAttribute('aria-pressed') };
await desktop.locator('#audio-file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not audio') });
const invalidFile = { status: await desktop.locator('#audio-status').innerText(), errorClass: await desktop.locator('#audio-status').evaluate(el => el.classList.contains('error')) };
await desktop.getByRole('button', { name: 'Play sample audio' }).click();
const recoveredFromInvalid = await desktop.locator('#audio-status').innerText();
const wav = Buffer.alloc(1644);
wav.write('RIFF', 0); wav.writeUInt32LE(1636, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(1600, 40);
for (let i = 0; i < 800; i++) wav.writeInt16LE(Math.sin(i / 8) * 8000, 44 + i * 2);
await desktop.locator('#audio-file').setInputFiles({ name: 'night-loop.wav', mimeType: 'audio/wav', buffer: wav });
await desktop.locator('#audio-status').filter({ hasText: 'Playing night-loop.wav in this tab' }).waitFor();
const validFile = await desktop.locator('#audio-status').innerText();
await desktop.getByRole('button', { name: 'Use microphone' }).click();
await desktop.locator('#audio-status').filter({ hasText: 'Microphone access was not allowed' }).waitFor();
const micDenied = await desktop.locator('#audio-status').innerText();
await desktop.getByRole('button', { name: 'Play sample audio' }).click();
const recoveredFromMic = await desktop.locator('#audio-status').innerText();
await desktop.getByRole('button', { name: 'Reset demo' }).click();
const reset = {
  status: await desktop.locator('#audio-status').innerText(),
  scene: await desktop.locator('audio-reactive-scene').getAttribute('scene'),
  intensity: await desktop.locator('#intensity').inputValue(),
  motion: await desktop.locator('audio-reactive-scene').getAttribute('motion')
};
await desktop.screenshot({ path: '.factory/verification-artifacts-2/live-demo-desktop.png', fullPage: true });
const userStorage = await storage(desktop);
result.desktop = { status: rootResponse?.status(), title: await desktop.title(), firstViewport, oneClick, sceneResults, intensityResults, staticMode, invalidFile, recoveredFromInvalid, validFile, micDenied, recoveredFromMic, reset, userStorage, ...desktopLog };

const routeResults = [];
for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-signal', '/404.html']) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const log = { console: [], pageErrors: [], requests: [], requestFailures: [] };
  wire(page, log);
  const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  const violations = await axe(page);
  routeResults.push({ path, status: response?.status(), title: await page.title(), lang: await page.locator('html').getAttribute('lang'), h1Count: await page.locator('h1').count(), h1: await page.locator('h1').allTextContents(), mainCount: await page.locator('main').count(), footerCount: await page.locator('footer').count(), seriousCritical: violations.filter(v => v.impact === 'serious' || v.impact === 'critical'), allViolations: violations, ...log });
  await context.close();
}
result.routes = routeResults;

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mobile = await mobileContext.newPage();
const mobileLog = { console: [], pageErrors: [], requests: [], requestFailures: [] };
wire(mobile, mobileLog);
await mobile.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
const targetSizes = await mobile.locator('a, button, input:not([type="hidden"])').evaluateAll(elements => elements.filter(el => {
  const style = getComputedStyle(el); const box = el.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
}).map(el => { const box = el.getBoundingClientRect(); return { tag: el.tagName, text: el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('type'), width: Math.round(box.width * 10) / 10, height: Math.round(box.height * 10) / 10 }; }));
const mobileLayout = await mobile.evaluate(() => ({ innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
await mobile.screenshot({ path: '.factory/verification-artifacts-2/live-demo-mobile-390.png', fullPage: true });
result.mobile = { layout: mobileLayout, targetSizes, undersizedTargets: targetSizes.filter(target => target.width < 44 || target.height < 44), ...mobileLog };
await mobileContext.close();

const keyboardContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const keyboard = await keyboardContext.newPage();
await keyboard.goto(origin);
await keyboard.keyboard.press('Tab');
const skipFocused = await keyboard.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
const focusStyle = await keyboard.evaluate(() => { const s = getComputedStyle(document.activeElement); return { outline: s.outline, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth, outlineOffset: s.outlineOffset }; });
await keyboard.keyboard.press('Enter');
const skipTarget = await keyboard.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName }));
let tabCount = 0;
while (tabCount < 20) {
  await keyboard.keyboard.press('Tab'); tabCount++;
  const text = await keyboard.evaluate(() => document.activeElement?.textContent?.trim());
  if (text === 'Try it with sample data') break;
}
const primaryViaTabs = await keyboard.evaluate(() => document.activeElement?.textContent?.trim());
await keyboard.keyboard.press('Enter');
await keyboard.waitForURL(`${origin}/demo`);
const demoFocus = await keyboard.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
await keyboard.getByRole('tab', { name: 'Ribbons' }).focus();
await keyboard.keyboard.press('ArrowRight');
const tabArrow = { focused: await keyboard.evaluate(() => document.activeElement?.textContent?.trim()), scene: await keyboard.locator('audio-reactive-scene').getAttribute('scene') };
await keyboard.locator('#intensity').focus();
await keyboard.keyboard.press('Home');
await keyboard.keyboard.press('ArrowRight');
const sliderKeyboard = { value: await keyboard.locator('#intensity').inputValue(), sceneIntensity: await keyboard.locator('audio-reactive-scene').getAttribute('intensity') };
result.keyboard = { skipFocused, focusStyle, skipTarget, tabsToPrimary: tabCount, primaryViaTabs, demoFocus, tabArrow, sliderKeyboard };
await keyboardContext.close();

const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const reduced = await reducedContext.newPage();
await reduced.goto(`${origin}/demo`);
await reduced.getByRole('button', { name: 'Play sample audio' }).click();
await reduced.locator('#audio-status').filter({ hasText: 'Sample audio is playing' }).waitFor();
const reducedCanvas = reduced.locator('audio-reactive-scene canvas');
const reducedFirst = await reducedCanvas.screenshot();
await reduced.waitForTimeout(500);
const reducedSecond = await reducedCanvas.screenshot();
const reducedAnimations = await reduced.evaluate(() => document.getAnimations().map(a => ({ playState: a.playState, duration: a.effect?.getTiming().duration })));
result.reducedMotion = { canvasStableWhileAudioConnected: reducedFirst.equals(reducedSecond), animations: reducedAnimations };
await reducedContext.close();

const pwaContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'allow' });
const pwa = await pwaContext.newPage();
await pwa.goto(`${origin}/demo`);
const pwaBefore = await pwa.evaluate(async () => {
  const registration = await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  await registration.update();
  return { controlled: Boolean(navigator.serviceWorker.controller), script: registration.active?.scriptURL, caches: await caches.keys() };
});
await pwa.reload({ waitUntil: 'networkidle' });
await pwaContext.setOffline(true);
const offlineResponse = await pwa.reload();
const pwaAfter = { response: offlineResponse ? offlineResponse.status() : null, url: pwa.url(), h1: await pwa.locator('h1').innerText(), offlineNoteVisible: await pwa.getByText('You are offline. The demo and sample scene still work.').isVisible(), sampleButtonVisible: await pwa.getByRole('button', { name: 'Play sample audio' }).isVisible() };
result.pwa = { before: pwaBefore, after: pwaAfter };
await pwaContext.close();

const historyContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const historyPage = await historyContext.newPage();
await historyPage.goto(origin);
await historyPage.getByLabel('Main navigation').getByRole('link', { name: 'How it works' }).click();
await historyPage.waitForTimeout(150);
const beforeAway = { url: historyPage.url(), scrollY: await historyPage.evaluate(() => scrollY), focused: await historyPage.evaluate(() => document.activeElement?.id) };
await historyPage.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
const privacyFocused = await historyPage.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
await historyPage.goBack();
await historyPage.waitForTimeout(150);
const afterBack = { url: historyPage.url(), scrollY: await historyPage.evaluate(() => scrollY), focused: await historyPage.evaluate(() => document.activeElement?.id) };
result.history = { beforeAway, privacyFocused, afterBack };
await historyContext.close();

const crawlContext = await browser.newContext();
const crawl = await crawlContext.newPage();
const hrefs = new Set();
for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-signal']) {
  await crawl.goto(`${origin}${path}`);
  for (const href of await crawl.locator('a').evaluateAll(links => links.map(link => link.href))) hrefs.add(href);
}
const crawlResults = [];
for (const href of hrefs) {
  const response = await crawlContext.request.get(href);
  crawlResults.push({ href, status: response.status() });
}
result.links = crawlResults;
await crawlContext.close();

await desktopContext.close();
await browser.close();
await writeFile('.factory/verification-artifacts-2/live-qa.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
