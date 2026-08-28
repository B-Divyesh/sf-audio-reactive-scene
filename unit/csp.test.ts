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

  test('deployment rewrites only known application routes and caches hashed assets immutably', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8')) as {
      navigationFallback: { rewrite: string; exclude: string[] };
      routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
    };

    expect(config.navigationFallback).toEqual({ rewrite: '/index.html', exclude: ['/*'] });
    expect(config.routes.filter((route) => route.rewrite).map((route) => route.route)).toEqual(['/demo', '/privacy', '/terms']);
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
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
