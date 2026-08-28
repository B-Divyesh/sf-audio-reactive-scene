import { describe, expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('strict style policy', () => {
  test('deployment CSP allows bundled styles but not inline styles', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8')) as {
      globalHeaders: Record<string, string>;
    };
    const policy = config.globalHeaders['Content-Security-Policy'];

    expect(policy).toContain("style-src 'self'");
    expect(policy).not.toContain("'unsafe-inline'");
  });

  test('component layout ships as CSS instead of injected markup', async () => {
    const [source, styles] = await Promise.all([
      readFile('src/index.ts', 'utf8'),
      readFile('src/style.css', 'utf8')
    ]);

    expect(source).not.toMatch(/<style|\.style\s*=|setAttribute\(['"]style/);
    expect(styles).toContain('.audio-reactive-scene__canvas');
  });
});
