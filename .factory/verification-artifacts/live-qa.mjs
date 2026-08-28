import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://audio-reactive-scene.sociobot.in';
const browser = await chromium.launch({ headless: true });
const report = {};

function observe(page) {
  const state = { consoleErrors: [], pageErrors: [], violations: [], requests: [] };
  page.on('console', message => {
    if (message.type() === 'error') state.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => state.pageErrors.push(error.message));
  page.on('request', request => state.requests.push({ url: request.url(), type: request.resourceType(), method: request.method() }));
  page.on('requestfailed', request => state.pageErrors.push(`request failed: ${request.url()} ${request.failure()?.errorText}`));
  return state;
}

function wavBuffer() {
  const sampleRate = 8000;
  const samples = 800;
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
  for (let index = 0; index < samples; index += 1) wav.writeInt16LE(Math.sin(index / 8) * 8000, 44 + index * 2);
  return wav;
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const observed = observe(page);
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener('securitypolicyviolation', event => window.__violations.push(`${event.violatedDirective}: ${event.blockedURI}`));
  });
  const response = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const landing = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: [...document.querySelectorAll('h1')].map(node => node.textContent.trim()),
    main: document.querySelectorAll('main').length,
    skipLink: document.querySelector('.skip-link')?.textContent.trim(),
    canonical: document.querySelector('link[rel=canonical]')?.href,
    description: document.querySelector('meta[name=description]')?.content,
    images: [...document.images].map(image => ({ src: image.src, alt: image.alt, width: image.width, height: image.height })),
    inlineStyles: document.querySelectorAll('[style],style').length,
    violations: window.__violations
  }));
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Sample audio is playing'));
  const oneClick = await page.evaluate(() => ({
    url: location.href,
    banner: document.querySelector('.demo-banner')?.textContent.replace(/\s+/g, ' ').trim(),
    status: document.querySelector('#audio-status')?.textContent.replace(/\s+/g, ' ').trim(),
    connected: document.querySelector('audio-reactive-scene')?.getAttribute('aria-label')
  }));
  await page.getByRole('tab', { name: 'Horizon' }).click();
  await page.locator('#intensity').fill('0');
  const lower = await page.locator('audio-reactive-scene').getAttribute('intensity');
  await page.locator('#intensity').fill('100');
  const upper = await page.locator('audio-reactive-scene').getAttribute('intensity');
  await page.getByRole('button', { name: 'Static' }).click();
  const controls = await page.evaluate(() => ({
    scene: document.querySelector('audio-reactive-scene')?.getAttribute('scene'),
    intensity: document.querySelector('audio-reactive-scene')?.getAttribute('intensity'),
    motion: document.querySelector('audio-reactive-scene')?.getAttribute('motion'),
    staticPressed: document.querySelector('[data-motion=static]')?.getAttribute('aria-pressed')
  }));
  await page.locator('#audio-file').setInputFiles({ name: 'representative.wav', mimeType: 'audio/wav', buffer: wavBuffer() });
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Playing representative.wav'));
  const validFile = await page.locator('#audio-status').innerText();
  await page.locator('#audio-file').setInputFiles({ name: 'not-audio.txt', mimeType: 'text/plain', buffer: Buffer.from('not audio') });
  const invalidFile = await page.locator('#audio-status').innerText();
  await page.getByRole('button', { name: 'Use microphone' }).click();
  await page.waitForTimeout(300);
  const microphoneDenied = await page.locator('#audio-status').innerText();
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await page.waitForFunction(() => document.querySelector('#audio-status')?.textContent.includes('Sample audio is playing'));
  const recovered = await page.locator('#audio-status').innerText();
  const axe = await new AxeBuilder({ page }).analyze();
  report.desktop = {
    status: response?.status(),
    responseHeaders: response?.headers(),
    landing,
    oneClick,
    bounds: { lower, upper },
    controls,
    validFile,
    invalidFile,
    microphoneDenied,
    recovered,
    axe: axe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
    observed,
    storage: await page.evaluate(async () => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), caches: await caches.keys() }))
  };
  await page.screenshot({ path: '.factory/verification-artifacts/live-demo-desktop.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const observed = observe(page);
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const layout = await page.evaluate(() => {
    const elements = [...document.querySelectorAll('a, button, input')].filter(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    });
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      targetsBelow44: elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { text: (element.textContent || element.getAttribute('aria-label') || '').trim(), tag: element.tagName, width: Math.round(rect.width * 10) / 10, height: Math.round(rect.height * 10) / 10 };
      }).filter(target => target.width < 44 || target.height < 44)
    };
  });
  report.mobile = { layout, axe: axe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })), observed };
  await page.screenshot({ path: '.factory/verification-artifacts/live-demo-mobile-390.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), className: document.activeElement?.className, outline: getComputedStyle(document.activeElement).outline }));
  await page.keyboard.press('Enter');
  const skipTarget = await page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName }));
  let ctaReached = false;
  const focusTrail = [];
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.replace(/\s+/g, ' ').trim(), tag: document.activeElement?.tagName, outline: getComputedStyle(document.activeElement).outline }));
    focusTrail.push(focus);
    if (focus.text === 'Try it with sample data') { ctaReached = true; break; }
  }
  if (ctaReached) await page.keyboard.press('Enter');
  await page.waitForURL('**/demo');
  await page.getByRole('tab', { name: 'Ribbons' }).focus();
  await page.keyboard.press('ArrowRight');
  const tabs = await page.evaluate(() => ({
    focused: document.activeElement?.textContent?.trim(),
    selected: [...document.querySelectorAll('[role=tab]')].filter(node => node.getAttribute('aria-selected') === 'true').map(node => node.textContent.trim()),
    scene: document.querySelector('audio-reactive-scene')?.getAttribute('scene')
  }));
  report.keyboard = { firstFocus, skipTarget, ctaReached, focusTrail, tabs };
  await context.close();
}

{
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const canvas = page.locator('audio-reactive-scene canvas');
  const first = await canvas.screenshot();
  await page.waitForTimeout(500);
  const second = await canvas.screenshot();
  const css = await page.evaluate(() => ({
    buttonTransition: getComputedStyle(document.querySelector('.button')).transitionDuration,
    artAnimation: getComputedStyle(document.querySelector('.hero-art img')).animationDuration
  }));
  report.reducedMotion = { canvasStable: first.equals(second), css };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const routes = [];
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-signal']) {
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).analyze();
    routes.push({
      path,
      status: response?.status(),
      title: await page.title(),
      h1: await page.locator('h1').allTextContents(),
      mains: await page.locator('main').count(),
      footers: await page.locator('footer').count(),
      seriousCritical: axe.violations.filter(item => item.impact === 'serious' || item.impact === 'critical').map(item => item.id)
    });
  }
  report.routes = routes;
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`);
  const sw = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    await registration.update();
    return { controlled: Boolean(navigator.serviceWorker.controller), scriptURL: registration.active?.scriptURL, caches: await caches.keys() };
  });
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload();
  const offline = { title: await page.title(), h1: await page.locator('h1').innerText(), notice: await page.locator('.offline-note').innerText(), visible: await page.locator('.offline-note').isVisible() };
  report.serviceWorker = { sw, offline };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
