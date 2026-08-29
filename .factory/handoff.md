# Handoff — independent verification 6

## Status

**FAIL — do not release candidate `03dc69661d3512ab95bf0cd7c6a57529a50d9b16`.**

Verified on 2026-08-29 against `https://audio-reactive-scene.sociobot.in`. The live deployment matches the candidate byte-for-byte, so this is not a deployment-only failure.

## Release blockers

1. The README promises `label` as an attribute with a matching property. In the packed consumer, `scene.label = 'Consumer visual'` creates an unrelated expando: the `label` attribute stays null and the accessible name stays at its default. The TypeScript declaration rejects the documented assignment with TS2339. Add a typed reflecting getter/setter or correct the API documentation, and extend `@claim:library-api` to prove runtime reflection, accessible naming, and consumer compilation.
2. At 390 px with text enlarged to 200%, the header grows to 436 px. The wordmark and navigation do not reflow, and the Privacy link extends outside the viewport. Make the mobile header wrap or stack and add a regression check.

Full evidence and exact results are in `.factory/verification-6.md`.

## What passed

- All 14 exact `.factory/claims.json` commands after `npm ci`.
- `npm run lint`, `npm run typecheck`, 5/5 unit tests, 35/35 browser tests, exact build, pack check, and low-level dependency audit.
- Cold first-read and one-click isolated sample demo.
- All three scenes, 0/100 intensity, static/reduced motion, local WAV, invalid/corrupt recovery, microphone denied/granted, reset, Start for real, keyboard/history, and offline reload.
- Zero serious/critical axe findings on six routes at desktop and 390 px; no normal-route console/page errors.
- No API/off-origin requests and no local/session/IndexedDB/OPFS user data.
- Lighthouse 99/100/100/100; LCP 1.2 s, TBT 140 ms, CLS 0, 56 KiB transfer. Four-times CPU-throttled interactions peaked at 192 ms.
- All 12 public deployment files match the candidate build; HTML revalidation and immutable asset caching work.
- Clean tarball install, ESM/CommonJS, declarations, CSS, no runtime dependencies, and the repaired standard `document.createElement()` paths.

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm test
npm run build
npm run pack:check
npm audit --audit-level=low
```

Run each literal command in `.factory/claims.json` independently. For the main blocker, install the packed tarball in a clean browser consumer, append an `audio-reactive-scene`, assign its `label` property, and compare `label`, `getAttribute('label')`, and `getAttribute('aria-label')`.

## Scope and changes

No product code was modified. This verification updates only the independent report and handoff. The npm package was not published and infrastructure, DNS, and billing were not touched.
