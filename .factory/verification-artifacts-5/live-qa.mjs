import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base = 'https://audio-reactive-scene.sociobot.in';
const out = '.factory/verification-artifacts-5/live';
const browser = await chromium.launch({ headless: true });
const report = { testedAt: new Date().toISOString(), base };
const hash = (value) => createHash('sha256').update(value).digest('hex');
const seriousCritical = (result) => result.violations
  .filter((item) => item.impact === 'serious' || item.impact === 'critical')
  .map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));

function observe(page) {
  const state = { consoleErrors: [], consoleWarnings: [], pageErrors: [], failedRequests: [], requests: [], responses: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') state.consoleErrors.push(message.text());
    if (message.type() === 'warning') state.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => state.pageErrors.push(error.message));
  page.on('requestfailed', (request) => state.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('request', (request) => state.requests.push({ url: request.url(), type: request.resourceType(), method: request.method() }));
  page.on('response', (response) => state.responses.push({ url: response.url(), status: response.status() }));
  return state;
}

function wavBuffer() {
  const sampleRate = 8000;
  const samples = 1600;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + samples * 2, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index += 1) wav.writeInt16LE(Math.sin(index / 8) * 9000, 44 + index * 2);
  return wav;
}

async function userStorage(page) {
  return page.evaluate(async () => {
    const databases = 'databases' in indexedDB ? (await indexedDB.databases()).map((database) => database.name ?? '') : [];
    const opfs = [];
    if (navigator.storage?.getDirectory) {
      const directory = await navigator.storage.getDirectory();
      for await (const [name] of directory.entries()) opfs.push(name);
    }
    return { local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases, opfs, caches: await caches.keys() };
  });
}

// Mandatory cold first-read and complete representative demo flow.
{
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
  const page = await context.newPage();
  const observed = observe(page);
  await page.addInitScript(() => {
    const violations = [];
    Object.defineProperty(window, '__cspViolations', { value: violations });
    document.addEventListener('securitypolicyviolation', (event) => violations.push(`${event.violatedDirective}: ${event.blockedURI}`));
  });
  const response = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const firstRead = await page.evaluate(() => {
    const details = (element) => {
      const box = element.getBoundingClientRect();
      return { text: element.textContent.replace(/\s+/g, ' ').trim(), top: box.top, bottom: box.bottom, visibleInViewport: box.top >= 0 && box.bottom <= innerHeight };
    };
    return {
      title: document.title,
      lang: document.documentElement.lang,
      h1s: [...document.querySelectorAll('h1')].map(details),
      audience: details(document.querySelector('.lede')),
      action: details(document.querySelector('[data-start-sample]')),
      explanation: details(document.querySelector('.action-note')),
      facts: details(document.querySelector('.facts')),
      mains: document.querySelectorAll('main').length,
      skip: document.querySelector('.skip-link')?.textContent.trim(),
      cspViolations: window.__cspViolations,
      inlineStyles: document.querySelectorAll('style,[style]').length
    };
  });
  await page.screenshot({ path: `${out}/home-desktop-1365x768.png`, fullPage: false });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Sample audio is playing'));
  const oneClick = await page.evaluate(() => ({
    url: location.href,
    banner: document.querySelector('.demo-banner')?.textContent.replace(/\s+/g, ' ').trim(),
    status: document.querySelector('#audio-status')?.textContent.trim(),
    label: document.querySelector('audio-reactive-scene')?.getAttribute('aria-label')
  }));

  const scene = page.locator('audio-reactive-scene');
  const canvas = scene.locator('canvas');
  await page.getByRole('button', { name: 'Full motion' }).click();
  const sceneChecks = {};
  for (const name of ['Ribbons', 'Lanterns', 'Horizon']) {
    await page.getByRole('tab', { name }).click();
    const first = await canvas.screenshot();
    await page.waitForTimeout(450);
    const second = await canvas.screenshot();
    sceneChecks[name.toLowerCase()] = { first: hash(first), second: hash(second), moves: !first.equals(second) };
  }
  await page.getByRole('button', { name: 'Static' }).click();
  await page.locator('#intensity').fill('0');
  const zeroAttribute = await scene.getAttribute('intensity');
  const intensityZero = await canvas.screenshot();
  await page.locator('#intensity').fill('100');
  const intensityOne = await canvas.screenshot();
  const boundaries = {
    zeroAttribute,
    zeroAndOneDiffer: !intensityZero.equals(intensityOne),
    oneAttribute: await scene.getAttribute('intensity')
  };

  await page.locator('#audio-file').setInputFiles({ name: 'representative.wav', mimeType: 'audio/wav', buffer: wavBuffer() });
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Playing representative.wav'));
  const validFile = await page.locator('#audio-status').innerText();
  await page.locator('#audio-file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not audio') });
  const invalidType = await page.locator('#audio-status').innerText();
  await page.locator('#audio-file').setInputFiles({ name: 'broken.wav', mimeType: 'audio/wav', buffer: Buffer.from('not a wav') });
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('could not play'));
  const corruptAudio = await page.locator('#audio-status').innerText();
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await page.waitForFunction(() => /Microphone (access was not allowed|levels are active)/.test(document.querySelector('#audio-status')?.textContent ?? ''));
  const microphone = await page.locator('#audio-status').innerText();
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Sample audio is playing'));
  const recovered = await page.locator('#audio-status').innerText();
  await page.getByRole('button', { name: 'Copy embed' }).click();
  await page.waitForFunction(() => (document.querySelector('#copy-result')?.textContent.length ?? 0) > 0);
  const copyResult = await page.locator('#copy-result').innerText();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const reset = await page.evaluate(() => ({
    scene: document.querySelector('audio-reactive-scene')?.getAttribute('scene'),
    intensity: document.querySelector('#intensity')?.value,
    motion: document.querySelector('audio-reactive-scene')?.getAttribute('motion'),
    status: document.querySelector('#audio-status')?.textContent.trim()
  }));
  const afterResetA = await canvas.screenshot();
  await page.waitForTimeout(450);
  const afterResetB = await canvas.screenshot();
  reset.posterStable = afterResetA.equals(afterResetB);
  const storage = await userStorage(page);
  const requests = observed.requests;
  const requestAudit = {
    count: requests.length,
    offOrigin: requests.filter((item) => !item.url.startsWith(`${base}/`) && !item.url.startsWith('blob:')),
    api: requests.filter((item) => item.type === 'xhr' || item.type === 'fetch'),
    types: [...new Set(requests.map((item) => item.type))]
  };
  await page.screenshot({ path: `${out}/demo-desktop.png`, fullPage: true });
  report.desktopFlow = { status: response?.status(), headers: response?.headers(), firstRead, oneClick, sceneChecks, boundaries, validFile, invalidType, corruptAudio, microphone, recovered, copyResult, reset, storage, requestAudit, observed };
  await context.close();
}

// Direct demo must perform no audio work until an explicit action.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const observed = observe(page);
  await page.addInitScript(() => {
    const counts = { contexts: 0, resumes: 0, oscillators: 0, microphone: 0 };
    Object.defineProperty(window, '__audioCounts', { value: counts });
    const NativeAudioContext = window.AudioContext;
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: class extends NativeAudioContext {
      constructor(options) { super(options); counts.contexts += 1; }
      resume() { counts.resumes += 1; return super.resume(); }
      createOscillator() { counts.oscillators += 1; return super.createOscillator(); }
    } });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => { counts.microphone += 1; return new MediaStream(); } } });
  });
  await page.goto(`${base}/demo?demo=1`, { waitUntil: 'networkidle' });
  const count = () => page.evaluate(() => window.__audioCounts);
  const before = await count();
  const coldFocus = await page.evaluate(() => document.activeElement?.tagName);
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Sample audio is playing'));
  const afterPlay = await count();
  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await count();
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Microphone'));
  const afterMicrophone = await count();
  const microphoneStatus = await page.locator('#audio-status').innerText();
  report.directGesture = { before, afterPlay, afterReload, afterMicrophone, microphoneStatus, coldFocus, firstTab, warnings: observed.consoleWarnings, errors: observed.consoleErrors };
  await context.close();
}

// Keyboard order, focus, custom tab keys, slider keys, and route history.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outline }));
  await page.keyboard.press('Enter');
  const skipTarget = await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id }));
  await page.keyboard.press('Tab');
  const afterMain = await page.evaluate(() => ({ text: document.activeElement?.textContent?.replace(/\s+/g, ' ').trim(), outline: getComputedStyle(document.activeElement).outline }));
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const ribbons = page.getByRole('tab', { name: 'Ribbons' });
  await ribbons.focus();
  await page.keyboard.press('ArrowRight');
  const arrowRight = await page.evaluate(() => ({ focused: document.activeElement?.textContent?.trim(), selected: document.querySelector('[role=tab][aria-selected=true]')?.textContent?.trim() }));
  await page.keyboard.press('End');
  const end = await page.evaluate(() => ({ focused: document.activeElement?.textContent?.trim(), selected: document.querySelector('[role=tab][aria-selected=true]')?.textContent?.trim() }));
  await page.keyboard.press('Home');
  const home = await page.evaluate(() => ({ focused: document.activeElement?.textContent?.trim(), selected: document.querySelector('[role=tab][aria-selected=true]')?.textContent?.trim() }));
  const slider = page.locator('#intensity');
  await slider.focus();
  await page.keyboard.press('Home');
  const sliderMin = await slider.inputValue();
  await page.keyboard.press('End');
  const sliderMax = await slider.inputValue();
  await page.getByLabel('Main navigation').getByRole('link', { name: 'How it works' }).click();
  await page.waitForFunction(() => window.scrollY > 100);
  const anchorScroll = await page.evaluate(() => window.scrollY);
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await page.goBack();
  await page.waitForTimeout(150);
  const history = await page.evaluate(() => ({ href: location.href, scrollY: window.scrollY, activeId: document.activeElement?.id }));
  report.keyboard = { first, skipTarget, afterMain, arrowRight, end, home, sliderMin, sliderMax, anchorScroll, history };
  await context.close();
}

// Responsive, touch target, text sizing, and mobile first-screen checks.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const landing = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    actionBottom: document.querySelector('[data-start-sample]').getBoundingClientRect().bottom,
    factsBottom: document.querySelector('.facts').getBoundingClientRect().bottom
  }));
  await page.screenshot({ path: `${out}/home-mobile-390.png`, fullPage: false });
  await page.goto(`${base}/demo?demo=1`, { waitUntil: 'networkidle' });
  const demo = await page.evaluate(() => {
    const targets = [...document.querySelectorAll('a,button,input')].filter((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0 && element.id !== 'audio-file';
    }).map((element) => {
      const box = element.getBoundingClientRect();
      return { text: (element.textContent || element.getAttribute('aria-label') || element.id).replace(/\s+/g, ' ').trim(), width: box.width, height: box.height };
    });
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sceneBottom: document.querySelector('.scene-stage').getBoundingClientRect().bottom,
      statusBottom: document.querySelector('#audio-status').getBoundingClientRect().bottom,
      undersizedTargets: targets.filter((item) => item.width < 44 || item.height < 44),
      supportingFonts: [...document.querySelectorAll('.action-note,.facts,.control-label,.status-line,.site-footer')].map((element) => ({ text: element.textContent.replace(/\s+/g, ' ').trim().slice(0, 80), px: Number.parseFloat(getComputedStyle(element).fontSize) }))
    };
  });
  await page.screenshot({ path: `${out}/demo-mobile-390.png`, fullPage: true });
  report.mobile = { landing, demo };
  await context.close();
}

// Reduced motion replaces movement with a stable poster.
{
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const canvas = page.locator('audio-reactive-scene canvas');
  const beforeA = await canvas.screenshot();
  await page.waitForTimeout(600);
  const beforeB = await canvas.screenshot();
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Sample audio is playing'));
  const connectedA = await canvas.screenshot();
  await page.waitForTimeout(600);
  const connectedB = await canvas.screenshot();
  const css = await page.evaluate(() => ({
    buttonTransition: getComputedStyle(document.querySelector('.button')).transitionDuration,
    animations: [...document.querySelectorAll('*')].filter((element) => getComputedStyle(element).animationName !== 'none').map((element) => ({ tag: element.tagName, name: getComputedStyle(element).animationName, duration: getComputedStyle(element).animationDuration }))
  }));
  report.reducedMotion = { beforeStable: beforeA.equals(beforeB), connectedStable: connectedA.equals(connectedB), css };
  await context.close();
}

// Axe and route semantics at desktop and 390 px mobile.
report.routes = {};
for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, isMobile: viewport.name === 'mobile', hasTouch: viewport.name === 'mobile' });
  const results = [];
  for (const path of ['/', '/demo?demo=1', '/privacy', '/terms', '/missing-signal', '/404.html']) {
    const page = await context.newPage();
    const observed = observe(page);
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).analyze();
    results.push({
      path,
      status: response?.status(),
      title: await page.title(),
      h1: await page.locator('h1').allTextContents(),
      mains: await page.locator('main').count(),
      headers: await page.locator('header').count(),
      footers: await page.locator('footer').count(),
      seriousCritical: seriousCritical(axe),
      consoleErrors: observed.consoleErrors,
      pageErrors: observed.pageErrors
    });
    await page.close();
  }
  report.routes[viewport.name] = results;
  await context.close();
}

// Service-worker install/update, versioned cache, and offline reload.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo?demo=1`, { waitUntil: 'networkidle' });
  const before = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    await registration.update();
    return { controlled: Boolean(navigator.serviceWorker.controller), caches: await caches.keys(), active: registration.active?.scriptURL };
  });
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  const response = await page.reload();
  const offline = { status: response?.status(), title: await page.title(), h1: await page.locator('h1').innerText(), notice: await page.locator('.offline-note').innerText(), visible: await page.locator('.offline-note').isVisible() };
  await context.setOffline(false);
  const after = await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); return { caches: await caches.keys(), active: registration.active?.scriptURL }; });
  report.serviceWorker = { before, offline, after };
  await context.close();
}

await browser.close();
await writeFile(`${out}/qa.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
