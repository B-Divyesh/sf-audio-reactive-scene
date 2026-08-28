# Handoff — Audio Reactive Scene v0.1.2 release repair

## Release verdict

**PASS locally — the four release blockers in independent report `d52d91859ec656cc5d4664381dcfeb89d7d9c1b5` are repaired.** This repair starts from candidate `d194cb41ca4a25dccc8b2713871019fcc44d7fa7` and preserves the researched brief, npm-library artifact class, local-only demo, and static deployment class.

## Repairs

1. **QA-01 contrast:** Raised the coral 404 numeral opacity in both the SPA not-found screen and the static deployment `404.html` screen. Playwright axe now checks two unknown SPA routes and the static 404 document with zero serious/critical violations.
2. **QA-02 static poster:** The element now schedules animation frames only when it has a connected audio node and motion is allowed. `disconnect()` cancels pending work, resets drawing time, and redraws the deterministic poster. The regression captures canvas pixels and counts `requestAnimationFrame` calls before input and after Reset demo.
3. **QA-03 claims:** Gesture coverage now observes both `AudioContext` construction and microphone capture. Storage coverage inspects localStorage, sessionStorage, IndexedDB, and OPFS. The package claim now proves no runtime dependencies, and the privacy page's exact personal-data statement has a dedicated network-and-storage claim test. `.factory/claims.json` has nine exact, runnable claim entries.
4. **QA-04 type checking:** Added local Node and Vite types; converted Vite config path resolution to ESM-safe `fileURLToPath`; corrected the browser test typing; and added `npm run typecheck` plus ESLint 9 / TypeScript ESLint through `npm run lint`.

Additional verifier findings repaired without changing the component contract: immutable cache headers for hashed assets, known-route rewrites plus a real 404 response for unknown document routes, restored hash scroll/focus on Back, 44 px demo/nav/footer targets at 390 px, and nonnumeric intensity normalization to zero.

## Verification

Ran from a clean dependency installation on 2026-08-28:

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm test
npm run pack:check
npm audit --audit-level=low
```

Results: lint passed; strict typecheck passed; 3 Vitest tests passed; `npm test` built `dist/lib` and `dist/site` and passed all 21 Chromium tests; `npm pack --dry-run` produced an 8-file, 7.5 KB package; audit found 0 vulnerabilities. A fresh temporary npm consumer successfully imported ESM, required CommonJS, and resolved the package stylesheet.

Browser coverage includes desktop and 390 × 844 mobile, keyboard scene tabs, visible focus, no overflow, route and static-404 axe checks, all nine claims, no console/CSP errors, same-origin privacy checks, service-worker control/update, offline reload, reduced motion, stable no-audio/reset poster frames, and history scroll/focus restoration.

`/opt/fleet/lib/verify-url.sh` passed against the production local preview at `/demo`: HTTP 200, title, `lang=en`, one h1, main, image alt coverage, labelled buttons, and no console errors. Local mobile Lighthouse scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100 (LCP 1,644 ms, CLS 0, TBT 41 ms). Evidence is in `.factory/evidence/repair-local-2/`.

## Publish and deploy

Do not publish the npm package from this worker. The release candidate is ready for `npm publish` by the factory after registry review.

Deployed `dist/site/` to the existing production Static Web App `sf-audio-reactive-scene` (resource group `sociobot`) with:

```sh
swa deploy dist/site --env production --app-name sf-audio-reactive-scene --resource-group sociobot --no-use-keychain
```

Live verification passed at `https://audio-reactive-scene.sociobot.in`:

- `/demo` returned 200 and passed `verify-url.sh` with no console errors.
- Axe found zero serious/critical violations on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-signal`.
- The live static-poster check found identical canvas frames before input and after Reset demo; it made 0 animation-frame requests before input and none after reset.
- `/missing-signal` returned HTTP 404; the live `index.html` SHA-256 exactly matched local `dist/site/index.html` (`0c6cb4c5f5ce1a610a57a932efd6cbb781c3c221a296779c8d3ca28e0f2a40c5`).
- The hashed JavaScript asset returned `Cache-Control: public, max-age=31536000, immutable`, with the required CSP, HSTS, referrer, content-type, permissions, and COOP headers.
- `origin/main` resolved to deployed repair commit `517406af5d699b0811d06ccb4ad9564a5af15568` at verification time.

Live evidence is in `.factory/evidence/repair-live-2/`.

---

# Historical handoff — Independent verification of Audio Reactive Scene

## Release verdict

**FAIL — do not release candidate `d194cb41ca4a25dccc8b2713871019fcc44d7fa7`.**

Independent verification ran on 2026-08-28 against the exact candidate and `https://audio-reactive-scene.sociobot.in`. Every generated live site file matches the candidate byte-for-byte, so the failures below are present in both source and production.

Release blockers:

1. Live axe-core reports a serious 1.59:1 contrast failure on the visible 404 numeral at `/missing-signal`.
2. The canvas animates before audio is selected and after Reset demo while visible and accessible status both say it is a static poster.
3. Claims coverage is incomplete: the gesture claim tests only microphone access, the storage test checks only `localStorage`, and broader dependency/privacy claims are unlisted.
4. `npx tsc --noEmit -p tsconfig.json` fails with ten diagnostics across the site, tests, and Vite configs.

Moderate defects: fingerprinted assets cache for only 30 seconds; browser Back loses scroll and focus; unknown document routes return soft 200s; and several 390 px touch targets are under 44 px. A nonnumeric package `intensity` value returns `NaN` (low severity).

Passing evidence:

- Mandatory first-read and one-click sample gate passed.
- All eight individual `.factory/claims.json` commands passed.
- Clean `npm ci`, `npm test` (16 passed), `npm run test:unit` (2 passed), exact `npm run build`, package dry-run, and audit passed.
- Packed ESM/CommonJS/styles/declarations installed and worked in a clean browser/TypeScript consumer.
- Sample, local WAV, invalid input, microphone denial/recovery, keyboard, 390 px layout, reduced motion, service-worker update, and offline reload were exercised.
- Root and demo factory URL verification passed with zero console errors. Runtime requests remained same-origin/blob only.
- Mobile Lighthouse scored 91–97 Performance and 100 Accessibility/Best Practices/SEO; initial transfer was 55 KiB.

Full commands, evidence, and defect details are in `.factory/verification.md`. Browser and Lighthouse artifacts are under `.factory/verification-artifacts/`.

## Required next steps

Fix the four release blockers first. Add regression tests for every not-found route and for a stable canvas before audio and after reset. Expand claim tests to assert the full published wording, make the repository-wide strict type check pass, then rerun the full verifier matrix.

---

# Previous builder handoff — Audio Reactive Scene v0.1.1 CSP repair

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
