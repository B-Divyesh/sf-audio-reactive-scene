# Handoff — Audio Reactive Scene v0.1.0

## What shipped

- A publish-ready TypeScript web component in `src/index.ts` with ESM, CommonJS, and declaration outputs.
- Three original canvas scenes: Ribbons, Lanterns, and Horizon.
- `scene`, `intensity`, `motion`, and accessible `label` properties.
- A small `connect(AudioNode)` API. The host keeps control of playback, output, and microphone permission.
- A responsive documentation site and live `/demo` playground in `dist/site/`.
- Sample oscillator audio, local file playback, opt-in microphone input, reset, error messages, keyboard scene tabs, and copyable markup.
- A service worker with a static poster fallback and an offline state.
- Privacy, terms, designed 404, route titles, metadata, sitemap, robots file, security headers, favicon, and social card.
- Original night-market art generated through `/opt/fleet/lib/gen-image.sh`, then resized to a 43 KB WebP. Its prompt and model provenance are in `.factory/assets/hero-market.provenance.json` and `.factory/design.md`.

## Run and verify

```sh
npm install
npm run dev
npm test
npm run build:site
npm run pack:check
```

The static deploy root is exactly `dist/site/`. Its root contains `index.html`. The npm library outputs are in `dist/lib/`.

Verification completed on 2026-08-28:

- `npm test`: 14 passed in Chromium. This includes every `.factory/claims.json` test, 390 px layout, keyboard tabs, route structure, console errors, and axe-core.
- Axe: 0 serious or critical violations on `/demo`.
- `/opt/fleet/lib/verify-url.sh`: passed at the local production preview. No console errors; one `h1`; `lang`, `main`, image alt, and button labels present. Evidence is in `.factory/evidence/`.
- Mobile Lighthouse on the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.4 s, CLS 0, total blocking time 60 ms, speed index 0.9 s. Lab INP was unavailable because Lighthouse made no interaction.
- Production assets: 7.31 KB gzip initial JavaScript, 3.41 KB gzip CSS, 43 KB hero WebP. The npm tarball is 7.0 KB compressed.
- `npm audit`: 0 known vulnerabilities.
- `npm pack --dry-run`: passed. Publishing was not attempted.

## Known gaps

- Microphone input requires HTTPS or localhost and depends on browser permission. Denial falls back to the sample or a local file.
- The generated sample is a short browser oscillator pattern, not a hosted music track. This keeps the demo offline and avoids third-party rights.
- Real-user INP and field performance need production traffic. The lab build has no analytics by design.

## Next steps

- The factory can publish version `0.1.0` after registry review.
- After deployment, rerun the URL verifier against `https://audio-reactive-scene.sociobot.in/demo`.
