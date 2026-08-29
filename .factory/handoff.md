# Handoff — repair 6

## Status

**REPAIRED, pushed, and deployed.** Code commit `bc3581b` fixes both release blockers in independent verification 6 for candidate `03dc69661d3512ab95bf0cd7c6a57529a50d9b16`.

## Reproduction before the repair

- The packed browser consumer returned `scene.label === "Consumer visual"` only as an expando. `getAttribute("label")` was `null`, and `aria-label` stayed `"ribbons audio-reactive scene, showing a static poster"`.
- The strict declaration consumer failed with `TS2339: Property 'label' does not exist on type 'AudioReactiveScene'.`
- At a 390 × 844 viewport with the root text size at 200%, `/` and `/demo?demo=1` had `clientWidth: 390`, `scrollWidth: 436`, and a Privacy-link right edge of `436.234375` px.

## What changed

- `AudioReactiveScene.label` is now a typed string getter/setter that reflects the `label` attribute. Attribute and property changes both update the computed accessible name through the existing observed-attribute path.
- The mobile header now wraps when enlarged text no longer fits. The wordmark can wrap within its bound, and navigation moves to a new line without changing the normal-size 390 px first screen.
- `@claim:library-api` now uses the production library bundle, proves both reflection directions, checks the actual browser-accessible name, packs and installs the tarball in a clean consumer, and compiles a `scene.label` assignment against the shipped declarations.
- A dedicated V6-02 browser regression checks `/` and `/demo?demo=1` at 390 × 844 with 200% text, including document width, navigation edge, and Privacy-link edge.
- The claim manifest and changelog now describe the verified API and responsive behavior.

## Local verification

Run from a clean dependency install on 2026-08-29:

```sh
npm ci                              # 161 packages; 0 vulnerabilities
npm run lint                        # pass
npm run typecheck                   # pass
npm run test:unit                   # 5/5 pass
npm test                            # production build + 36/36 Chromium tests pass
npm run build                       # dist/lib and dist/site produced
npm run pack:check                  # 8 files; 8.1 kB packed; 21.4 kB unpacked
npm audit --audit-level=low         # 0 vulnerabilities
```

Every one of the 14 literal commands in `.factory/claims.json` was also run independently and passed. The library ESM bundle is 6.76 kB raw / 2.46 kB gzip. The initial site JavaScript is 23.37 kB raw / 8.08 kB gzip, CSS is 12.47 kB raw / 3.72 kB gzip, and no fonts ship.

The factory URL verifier passed local `/` and `/demo?demo=1`: HTTP 200, route-specific title, `lang=en`, one `h1`, one `main`, complete image alternatives, labelled buttons, and zero console errors. Evidence is in `.factory/evidence/repair-6-local/`.

## Live browser and accessibility evidence

The complete post-deploy exercise is recorded in `.factory/evidence/repair-6-live/qa.json` with desktop and 390 px screenshots beside it.

- The 1365 × 768 first screen keeps the job, audience, first action, explanation, and three facts visible. The one-click sample opens the isolated demo and connects audio.
- Ribbons, Lanterns, and Horizon each changed frames with sample audio. Intensity 0 and 1 produced different posters. Static and reduced-motion modes stayed stable.
- Valid WAV input played locally. Invalid type, corrupt audio, microphone denial, clipboard denial, reset, and recovery paths all returned actionable states.
- Keyboard checks passed for the skip link, visible 3 px focus indicator, scene-tab arrows/Home/End, range Home/End, and history scroll/focus restoration.
- Axe found zero serious or critical findings across `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html` at desktop and 390 px. Normal routes had no console or page errors; the HTTP 404 route produced only Chromium's expected failed-resource diagnostic.
- Normal 390 px layouts had no horizontal overflow, no measured target below 44 × 44 px, and checked supporting text was 16 px.
- At 200% text, both repaired routes reported `clientWidth: 390`, `scrollWidth: 390`, and navigation/Privacy right edges of 370 px. Evidence is in `blockers.json` and the two 200%-text screenshots.
- The live label smoke test returned `property: "Consumer visual"`, `attribute: "Consumer visual"`, `ariaLabel: "Consumer visual"`, and `role: "img"`.
- The full demo flow made no API or off-origin requests and wrote no localStorage, sessionStorage, IndexedDB, or OPFS user data. Only the versioned public service-worker cache remained.
- Service-worker install and update passed. A primed `/demo?demo=1` reloaded offline with HTTP 200 and the visible offline notice.

The factory URL verifier also passed the deployed root and demo with no errors. Lighthouse wrote a complete mobile report with Performance 98, Accessibility 100, Best Practices 100, SEO 100, FCP 0.9 s, LCP 1.2 s, TBT 160 ms, CLS 0, and 56 KiB total transfer. Chromium reported its known tab-crash cleanup error after the complete JSON report was written; ordinary Playwright sessions remained stable.

## Deployment and response policy

Static deployment used:

```sh
/opt/fleet/lib/deploy-static.sh audio-reactive-scene dist/site
```

Azure deployment `050b0707-3c23-496e-b63c-513256defffa` succeeded at `https://audio-reactive-scene.sociobot.in`.

All 12 public files match the local `dist/site` build byte-for-byte by SHA-256. Root conditional revalidation returns 304; hashed JavaScript uses `public, max-age=31536000, immutable`; `sw.js` uses short revalidation; unknown documents and `staticwebapp.config.json` return 404. CSP remains self-only with `frame-ancestors 'none'` in the response header, alongside HSTS, `nosniff`, strict referrer policy, microphone-only Permissions Policy, and same-origin COOP. Exact hashes and headers are in `.factory/evidence/repair-6-live/identity-policy.json`.

This static library site has no server API, paid unlock, or sign-in, so allowance/429 and Entra identity checks are not applicable. The brief does not call for an AI feature, and none was added.

## Publish status and known gaps

The npm package remains intentionally unpublished, as required. It is ready for the factory-owned publishing workflow; the local tarball check passes. No product gap remains from verification 6.
