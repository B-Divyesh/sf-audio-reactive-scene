import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('production preview enforces the deployed CSP without violations', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.defineProperty(window, '__cspViolations', { value: violations });
    document.addEventListener('securitypolicyviolation', (event) => {
      violations.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });

  const response = await page.goto('/demo');
  const policy = response?.headers()['content-security-policy'] ?? '';
  expect(policy).toContain("style-src 'self'");
  expect(policy).not.toContain("'unsafe-inline'");
  await expect(page.locator('audio-reactive-scene > canvas.audio-reactive-scene__canvas')).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { __cspViolations?: string[] }).__cspViolations ?? [])).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(await page.locator('[style], style').count()).toBe(0);
});

test('every application route has no serious or critical accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo?demo=1', '/privacy', '/terms', '/missing-signal', '/404.html']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(blocking).toEqual([]);
  }
});

test('QA4-05: mobile scroll regions remain keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/demo?demo=1']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(blocking).toEqual([]);
    await expect(page.locator('pre')).toHaveAttribute('tabindex', '0');
    await expect(page.locator('pre')).toHaveAccessibleName('Copy this embed');
  }
});

test('QA2-01: desktop first screen keeps the action, explanation, and facts above the fold', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto('/');

  for (const locator of [
    page.getByRole('heading', { level: 1 }),
    page.locator('.lede'),
    page.getByRole('link', { name: 'Try it with sample data' }),
    page.locator('.action-note'),
    page.locator('.facts')
  ]) {
    await expect(locator).toBeVisible();
    const bounds = await locator.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    });
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(768);
  }
});

test('QA4-03: the hidden file picker is neither a keyboard stop nor a duplicate accessible control', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: /Choose (an )?audio file/ })).toHaveCount(1);
  const microphone = page.getByRole('button', { name: 'Use microphone' });
  await microphone.focus();
  await page.keyboard.press('Tab');

  await expect(page.getByRole('button', { name: 'System setting' })).toBeFocused();
  await expect(page.locator('#audio-file')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#audio-file')).toBeHidden();
});

test('QA4-02: cold routes leave focus at the document so Tab reaches the skip link first', async ({ page }) => {
  for (const path of ['/', '/demo?demo=1']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  }
});

test('every not-found route has a visible, accessible high-contrast error state', async ({ page }) => {
  for (const path of ['/missing-signal', '/another-missing-signal']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('This page does not exist');
    await expect(page.locator('.error-code')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(blocking).toEqual([]);
  }
});

test('the static deployment 404 document has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/404.html');
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  expect(blocking).toEqual([]);
});

test('QA2-03: the static deployment 404 uses the shared site shell', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeVisible();
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.getByLabel('Main navigation')).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByText(/v0\.1\.2 · build 2026\.08\.29/)).toBeVisible();
});

test('each route has route-specific metadata and canonical URL', async ({ page }) => {
  const routes = [
    ['/demo?demo=1', 'Demo — Audio Reactive Scene', 'Try a local sample audio scene. Nothing is saved or uploaded.', '/demo'],
    ['/privacy', 'Privacy — Audio Reactive Scene', 'Read how the demo handles audio, storage, and network requests.', '/privacy'],
    ['/terms', 'Terms — Audio Reactive Scene', 'Read the MIT license terms for Audio Reactive Scene.', '/terms'],
    ['/missing-signal', 'Page not found — Audio Reactive Scene', 'This page does not exist. Open the sample audio scene instead.', '/missing-signal']
  ];
  for (const [path, title, description, canonical] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://audio-reactive-scene.sociobot.in${canonical}`);
  }
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Audio Reactive Scene');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Audio Reactive Scene');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://audio-reactive-scene.sociobot.in/404.html');
});

test('every route has the shared structure and one heading', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-signal']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).not.toBe('');
    await expect(page.getByRole('contentinfo')).toBeVisible();
  }
});

test('scene tabs work with arrow keys', async ({ page }) => {
  await page.goto('/demo');
  const ribbons = page.getByRole('tab', { name: 'Ribbons' });
  await ribbons.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Lanterns' })).toBeFocused();
  await expect(page.locator('audio-reactive-scene')).toHaveAttribute('scene', 'lanterns');
});

test('mobile layout does not scroll sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBe(sizes.client);
  await expect(page.getByRole('button', { name: 'Play sample audio' })).toBeVisible();
  const targets = await page.locator('#reset-demo, .site-nav a[href="/demo"], .site-footer a').evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  for (const target of targets) {
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
  }
});

test('V6-02: the 390px header reflows at 200 percent text without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/demo?demo=1']) {
    await page.goto(path);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const layout = await page.evaluate(() => {
      const header = document.querySelector('.site-header')!;
      const nav = document.querySelector('.site-nav')!;
      const privacy = document.querySelector<HTMLAnchorElement>('.site-nav a[href="/privacy"]')!;
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headerRight: header.getBoundingClientRect().right,
        navRight: nav.getBoundingClientRect().right,
        privacyRight: privacy.getBoundingClientRect().right
      };
    });
    expect(layout.scrollWidth).toBe(layout.clientWidth);
    expect(layout.headerRight).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.navRight).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.privacyRight).toBeLessThanOrEqual(layout.clientWidth);
  }
});

test('demo puts the live scene and playback status in the first mobile and desktop viewports', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1365, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/demo?demo=1');
    for (const locator of [page.locator('.scene-stage'), page.locator('#audio-status')]) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
  }
});

test('QA2-04: mobile supporting instructions and status text remain at least 16px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const sizes = await page.locator('.action-note, .facts, .control-label, .status-line, .site-footer').evaluateAll((elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)));
  expect(sizes).not.toHaveLength(0);
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
});

test('reset demo restores the initial controls', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('tab', { name: 'Horizon' }).click();
  await page.locator('#intensity').fill('20');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('audio-reactive-scene')).toHaveAttribute('scene', 'ribbons');
  await expect(page.locator('#intensity')).toHaveValue('70');
  await expect(page.locator('#audio-status')).toContainText('Demo reset');
});

test('a no-audio poster does not animate before audio or after Reset demo', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    const request = window.requestAnimationFrame.bind(window);
    Object.defineProperty(window, '__posterAnimationFrames', { get: () => calls });
    window.requestAnimationFrame = (callback) => {
      calls += 1;
      return request(callback);
    };
  });
  await page.goto('/demo');
  const canvas = page.locator('audio-reactive-scene canvas');
  const first = await canvas.screenshot();
  await page.waitForTimeout(500);
  expect((await canvas.screenshot()).equals(first)).toBe(true);
  expect(await page.evaluate(() => (window as typeof window & { __posterAnimationFrames: number }).__posterAnimationFrames)).toBe(0);

  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await expect(page.locator('#audio-status')).toContainText('Sample audio is playing');
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => (window as typeof window & { __posterAnimationFrames: number }).__posterAnimationFrames)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const reset = await canvas.screenshot();
  const callsAfterReset = await page.evaluate(() => (window as typeof window & { __posterAnimationFrames: number }).__posterAnimationFrames);
  await page.waitForTimeout(500);
  expect((await canvas.screenshot()).equals(reset)).toBe(true);
  expect(await page.evaluate(() => (window as typeof window & { __posterAnimationFrames: number }).__posterAnimationFrames)).toBe(callsAfterReset);
});

test('browser Back restores the anchored scroll position and focus', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main navigation').getByRole('link', { name: 'How it works' }).click();
  await expect(page).toHaveURL(/\/#how$/);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/#how$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect(page.locator('#how')).toBeFocused();
});

test('route navigation focuses the Home heading and Start for real install section', async ({ page }) => {
  await page.goto('/privacy');
  await page.getByRole('link', { name: 'Audio Reactive Scene home' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goto('/demo?demo=1');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/#install');
  await expect(page.locator('#install')).toBeFocused();
});

test('service worker controls the demo and checks for updates', async ({ page }) => {
  await page.goto('/demo');
  const state = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
    await registration.update();
    return {
      controlled: Boolean(navigator.serviceWorker.controller),
      caches: await caches.keys(),
      script: registration.active?.scriptURL
    };
  });

  expect(state.controlled).toBe(true);
  expect(state.caches).toHaveLength(1);
  expect(state.caches[0]).toMatch(/^audio-reactive-scene-[a-f0-9]{10}$/);
  expect(state.script).toMatch(/\/sw\.js$/);
});

test('pages load without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  expect(errors).toEqual([]);
});
