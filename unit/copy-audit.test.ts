import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('copy audit', () => {
  it('records the verifier-cited landing, privacy, and status copy', async () => {
    const audit = await readFile('.factory/copy-audit.md', 'utf8');
    const requiredCopy = [
      'Install the package and place the custom element where the scene belongs.',
      'Pass a Web Audio node after the visitor starts playback.',
      'Keep automatic motion reduction or choose the static poster.',
      'The component has no analytics or account system.',
      'It reads levels from the browser’s audio connection and sends no audio to an API.',
      'It does not start audio on page load.',
      'It does not ask for microphone access by itself.',
      'It does not upload or save an audio file.',
      'It does not load scripts or fonts from another site.',
      'Sample audio is playing.',
      'The sample could not start.',
      'That file is not recognised as audio.',
      'The audio file could not play.',
      'This browser cannot provide microphone audio.',
      'Microphone levels are active in this tab.',
      'Microphone access was not allowed.',
      'Demo reset.'
    ];

    for (const copy of requiredCopy) expect(audit).toContain(`| ${copy} |`);
  });

  it('records no audited sentence above the 22-word limit', async () => {
    const audit = await readFile('.factory/copy-audit.md', 'utf8');
    const counts = [...audit.matchAll(/^\| .+ \| (\d+) \|$/gm)].map((match) => Number(match[1]));
    expect(counts.length).toBeGreaterThan(80);
    expect(Math.max(...counts)).toBeLessThanOrEqual(22);
  });
});
