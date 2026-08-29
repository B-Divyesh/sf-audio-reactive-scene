# Handoff — perfection loop round 2

## Status

**PASS — all cumulative findings are closed and the repaired site is live.**

The implementation commits are `b18f56c29601450ea33a26f3d1e8f6395f1ad66c` and `e3feb2e23f088db5a9d33797ac3632db5d00ec29`. The final static deployment is `87e6e882-970e-4369-9c0c-c03dd2a30b49` at <https://audio-reactive-scene.sociobot.in>.

## What changed

- The first screen now introduces one plain term: “a reusable HTML element.” Landing copy, metadata, README, and package instructions use that term consistently.
- `?demo=1` remains isolated and one-click. It now plays an original bundled eight-second night-market percussion loop instead of oscillator test tones. The WAV is same-origin, precached, and works offline.
- “Open package instructions” replaces the vague demo exit. The action stops the source, opens `/#install`, and focuses the section.
- The exact displayed “Copy embed” example is shared with the README and is executed by its claim test inside a fresh consumer using the packed tarball. The test requires a connected accessible state and changing canvas frames.
- Mobile banner and playback status spacing keep the running scene and result inside the first 390×844 viewport.
- Claims, demo documentation, asset provenance, copy audit, changelog, and the verb-first catalog description were updated.

The complete finding-to-fix-to-evidence matrix is in [polish-2.md](polish-2.md).

## Verification

From clean clone `/tmp/audio-reactive-scene-polish2-final.IeWEQN` at `e3feb2e`:

- `npm ci`: 161 packages, zero vulnerabilities.
- Every one of the 14 literal commands in `.factory/claims.json`: passed independently.
- Final source gates: `npm run test:unit` 5/5; `npm run typecheck`; `npm run lint`; `npm test` 36/36.
- `npm run build`: produced `dist/lib` and `dist/site/index.html`.
- `npm run pack:check`: 8 files, 8.4 kB packed, 22.0 kB unpacked.
- `npm audit --audit-level=low`: zero vulnerabilities.

Browser coverage includes the packed consumer embed, one-click/direct demo, bundled sample, offline playback, privacy request/storage capture, reduced motion, keyboard controls, focus/history, route metadata, legal/404 routes, 390 px layout, 200% text, service worker, and axe across every route.

Live evidence:

- [Cold browser QA](evidence/polish-2-live/live-qa.json): exact first-screen copy; bundled `audio/wav`; changing canvas; intact storage sentinels; no off-origin requests; 390 px `scrollWidth`; running status bottom at 808 px; route titles, canonicals, legal links, real 404, and zero serious/critical axe violations.
- [Playing demo at 390×844](evidence/polish-2-live/demo-mobile-playing.png) and [desktop home](evidence/polish-2-live/home-desktop.png).
- [Factory root verifier](evidence/polish-2-live/root/verify.json) and [demo verifier](evidence/polish-2-live/demo/verify.json): correct title/lang/landmarks/alts/labels and no console errors.
- [Live Lighthouse](evidence/polish-2-live/lighthouse-mobile.json): Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.13 s, TBT 33 ms, CLS 0. Lighthouse wrote the complete JSON before Chromium emitted its known post-report tab-crash cleanup message.
- All 13 deployed files match `dist/site` byte-for-byte by SHA-256. The bundled WAV returns `audio/wav` with immutable caching. Root security headers include a self-only CSP, HSTS, `nosniff`, strict referrer policy, same-origin COOP, and microphone-only permissions.

## Run, package, and deploy

```sh
npm ci
npm run test:unit
npm run typecheck
npm run lint
npm test
npm run build
npm run pack:check
/opt/fleet/lib/deploy-static.sh audio-reactive-scene dist/site
```

The npm package remains intentionally unpublished; factory registry credentials own that later release step. No product, test, accessibility, privacy, performance, or deployment gap is known.
