# Handoff — Audio Reactive Scene v0.1.1 CSP repair

## Repair summary

- Reproduced the deployed failure at `https://audio-reactive-scene.sociobot.in/demo`: Chromium reported `Applying inline style violates ... style-src 'self'`.
- Root cause: `AudioReactiveScene` inserted a `<style>` element into its shadow root. The original Vite preview omitted deployment headers, so the console test could not reproduce production CSP.
- Replaced the shadow-root style with `src/style.css` and a namespaced light-DOM canvas class. The package exports the built file as `audio-reactive-scene/style.css`.
- Kept the deployed policy strict: `style-src 'self'` remains and no `unsafe-inline` exception was added.
- The production preview now reads the exact `globalHeaders` from `staticwebapp.config.json`.
- Added a browser regression that asserts the deployed CSP header, no inline styles, no policy violations, and no console errors. Added focused unit coverage for the source and policy.

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

Repair verification completed on 2026-08-28:

- Exact work-order command `npm ci && npm test && npm run build:site`: passed. `npm test` ran 16 Chromium tests, including every claim, deployed CSP, 390 px layout, keyboard tabs, service-worker update/control, offline reload, privacy, reduced motion, route structure, console errors, and axe-core.
- `npm run test:unit`: 2 passed.
- Axe: 0 serious or critical violations on `/demo`.
- `/opt/fleet/lib/verify-url.sh`: passed at the local production preview with zero console errors, one `h1`, `lang`, `main`, image alt, and button labels present. Evidence is in `.factory/evidence/repair-local/`.
- Mobile Lighthouse on the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.4 s, CLS 0, total blocking time 50 ms, speed index 1.0 s.
- Production assets: 7.23 KB gzip initial JavaScript, 3.45 KB gzip site CSS, 0.14 KB gzip package CSS, and 43 KB hero WebP. The npm tarball is 7.2 KB compressed.
- `npm audit`: 0 known vulnerabilities.
- `npm pack --dry-run`: passed. Publishing was not attempted.

## Deployment and live verification

- Repair commit `fa387440bb0d67c822bbba58599374301be64baf` was pushed to `origin/main` before deployment.
- Factory static deployment `8c541811-67c9-4df3-a202-7e3cb55cf4b8` succeeded on the existing `sf-audio-reactive-scene` Azure Static Web App in Central US.
- Live URL verifier: `https://audio-reactive-scene.sociobot.in/demo` returned 200 with zero console errors, one `h1`, `lang=en`, `main`, complete image alt text, and labelled buttons.
- Live CSP browser check: zero console errors, zero `securitypolicyviolation` events, zero inline style nodes, no off-origin requests, and no 390 px overflow. The response still declares `style-src 'self'` without `unsafe-inline`.
- Live axe: 0 total violations. Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 60 ms, speed index 0.9 s.
- Live identity: the deployed and local `index.html` SHA-256 values match, the page reports v0.1.1, its canonical URL uses the custom domain, and the repair commit was on `origin/main` when verified.
- Live artifacts, headers, screenshots, and machine-readable results are in `.factory/evidence/repair-live/`.

## Known gaps

- Microphone input requires HTTPS or localhost and depends on browser permission. Denial falls back to the sample or a local file.
- The generated sample is a short browser oscillator pattern, not a hosted music track. This keeps the demo offline and avoids third-party rights.
- Real-user INP and field performance need production traffic. The lab build has no analytics by design.

## Next steps

- The factory can publish version `0.1.1` after registry review. Publishing was not attempted by this worker.
- Collect real-user INP only if the factory later adds privacy-respecting field monitoring.
