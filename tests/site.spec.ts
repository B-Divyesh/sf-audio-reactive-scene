import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test('pages load without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Play sample audio' }).click();
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  expect(errors).toEqual([]);
});
