import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = 'https://audio-reactive-scene.sociobot.in';
const browser = await chromium.launch({ headless: true });

const laptop = await browser.newPage({ viewport: { width: 1365, height: 768 } });
await laptop.goto(origin, { waitUntil: 'networkidle' });
await laptop.screenshot({ path: '.factory/verification-artifacts-2/live-root-laptop.png', fullPage: false });
const firstScreen = await laptop.evaluate(() => {
  const inspect = selector => {
    const element = document.querySelector(selector);
    const box = element.getBoundingClientRect();
    return { text: element.textContent.trim(), top: box.top, bottom: box.bottom, fullyVisible: box.top >= 0 && box.bottom <= innerHeight };
  };
  return {
    viewport: { width: innerWidth, height: innerHeight },
    headline: inspect('h1'),
    audience: inspect('.lede'),
    primaryAction: inspect('a[data-start-sample]'),
    actionExplanation: inspect('.action-note'),
    facts: [...document.querySelectorAll('.facts li')].map(element => {
      const box = element.getBoundingClientRect();
      return { text: element.textContent.trim(), top: box.top, bottom: box.bottom, fullyVisible: box.top >= 0 && box.bottom <= innerHeight };
    })
  };
});
await laptop.close();

const keyboard = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await keyboard.goto(`${origin}/demo`);
const focusSequence = [];
for (let index = 0; index < 12; index += 1) {
  await keyboard.keyboard.press('Tab');
  focusSequence.push(await keyboard.evaluate(() => {
    const element = document.activeElement;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      tag: element.tagName,
      id: element.id,
      name: element.textContent?.trim() || element.getAttribute('aria-label'),
      opacity: style.opacity,
      outline: style.outline,
      width: box.width,
      height: box.height
    };
  }));
}
const hiddenFileFocus = focusSequence.find(item => item.id === 'audio-file');
await keyboard.close();

const notFound = await browser.newPage();
const response = await notFound.goto(`${origin}/missing-signal`);
const notFoundStructure = {
  status: response.status(),
  skipLinks: await notFound.getByRole('link', { name: 'Skip to main content' }).count(),
  headers: await notFound.locator('header').count(),
  mains: await notFound.locator('main').count(),
  footers: await notFound.locator('footer').count(),
  h1: await notFound.locator('h1').innerText()
};
await notFound.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mobile.goto(origin);
const mobileTextSizes = await mobile.evaluate(() => Object.fromEntries(['.lede', '.action-note', '.facts', '.control-label', '.status-line', '.site-footer'].map(selector => {
  const element = document.querySelector(selector);
  return [selector, element ? getComputedStyle(element).fontSize : null];
})));
await mobile.close();

await browser.close();
const result = { generatedAt: new Date().toISOString(), firstScreen, hiddenFileFocus, focusSequence, notFoundStructure, mobileTextSizes };
await writeFile('.factory/verification-artifacts-2/blockers.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
