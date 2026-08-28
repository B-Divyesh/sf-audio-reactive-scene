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
  expect(await page.evaluate(() => (window as Window & { __cspViolations: string[] }).__cspViolations)).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(await page.locator('[style], style').count()).toBe(0);
});

test('demo has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/demo');
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  expect(blocking).toEqual([]);
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
