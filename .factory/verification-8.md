# Independent verification 8

Verified on 2026-08-29 against candidate commit `3945534608b40fd502adaeb2bd18097baa7d1747` and the deployed origin <https://audio-reactive-scene.sociobot.in>.

## Verdict

**PASS.** The candidate meets the researched brief and the factory acceptance contract. This result is based on fresh local and live evidence, not a prior builder or verifier report.

## First read and demo

**PASS.** A cold live desktop page says what it does: “Make your audio move a scene”; who it is for: “site owners, streamers, and event makers”; and what to click first: “Try it with sample data.” The adjacent sentence says that it opens the scene and plays an original percussion loop. The action opens `/demo?demo=1` in one click, starts the same-origin WAV, and displays the persistent “Demo — sample data, nothing is saved” banner with Reset demo and Open package instructions.

At 390 x 844, the headline, audience sentence, action, action explanation, and three facts are visible without scrolling (facts bottom: 833.625 px). Mobile home and demo have a 390 px scroll width (no horizontal overflow).

## Mandatory claims

`.factory/claims.json` exists and contains 14 claims. After `npm ci`, I invoked every literal `test` command independently from this checkout. All exited 0:

| Claim | Result |
| --- | --- |
| one-click-demo | PASS |
| three-scenes-controls | PASS |
| complete-embed | PASS |
| local-only-audio | PASS |
| gesture-only-input | PASS |
| offline-reload | PASS |
| motion-reduction | PASS |
| package-formats | PASS |
| library-api | PASS |
| node-support | PASS |
| site-build-output | PASS |
| npm-unpublished | PASS |
| mit-license | PASS |
| privacy-no-personal-data | PASS |

The packaged-consumer claims build the tarball in a clean temporary project, install it, exercise ESM/CommonJS, TypeScript declarations, the documented public API, and the exact copied embed with a user-started audio connection and a changing canvas.

## Local gates and package

- `npm ci`: passed; 0 vulnerabilities reported.
- `npm run test:unit`: passed, 5/5.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 36/36 Chromium tests (`test-results/.last-run.json` reports `passed`).
- `npm run build`: passed and produced `dist/lib` and `dist/site/index.html`.
- `npm run pack:check`: passed. The package is 8.4 kB packed / 22.0 kB unpacked with 8 expected files.

The fresh production build has 23,341 B raw / 8,022 B gzip initial JavaScript and 12,680 B raw / 3,755 B gzip CSS. Both are within the applicable budgets.

## Live end-to-end, accessibility, privacy, and PWA

Fresh Playwright checks exercised one-click sample audio; direct demo; Arrow-key scene selection; intensity 0 and 100; Static motion; invalid text-file recovery; denied microphone recovery; clipboard copy; desktop and 390 px mobile. The scene changed to Lanterns through ArrowRight; the boundary values reflected `0` and `1`; invalid input said to choose MP3, WAV, or OGG; denied microphone use suggested sample or file input; clipboard copy returned “Embed copied.” No console errors or page errors occurred.

Fresh axe-core Playwright scans found zero violations on live desktop home, desktop demo, and 390 px demo (therefore zero serious/critical findings). The live document has `lang=en`, a route-specific title, exactly one `h1`, and one `main`. The first Tab reaches the skip link, whose visible focus outline is `rgb(97, 231, 223) solid 3px`. Reduced-motion mode rendered byte-identical canvas captures across 500 ms.

During the complete live sample flow, request logging recorded only these same-origin resources: document, hashed JS, hashed CSS, hero WebP, and bundled WAV. There were no fetch/XHR/API requests, off-origin requests, analytics requests, localStorage entries, sessionStorage entries, IndexedDB entries, console errors, or page errors. The offline claim also passed; fresh live verification primed the service worker, went offline, and reloaded `/demo?demo=1` with the scene and offline notice rendered.

This is a static library site. Source review and live network evidence found no product server endpoint, product-unlock endpoint, sign-in, billing, or AI call. Rate-limit/429/`Retry-After` and Entra tenant checks are not applicable.

## Deployment identity, headers, and performance

Every public deployment file built from this exact candidate matched the live response SHA-256: `index.html`, `404.html`, `404.css`, `apple-touch-icon.png`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `sw.js`, `assets/hero-market.webp`, `assets/index-B2mkt3NE.js`, `assets/index-D_M3Glc-.css`, `assets/night-market-loop.wav`, and `assets/social-card.webp`. This rules out the earlier reported deployment-only failure: the live origin is this candidate.

Root/demo responses use `Cache-Control: public, must-revalidate, max-age=30`; hashed JS/CSS, image, and WAV resources use `public, max-age=31536000, immutable`. Live headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, same-origin COOP, a self-only CSP with response-header `frame-ancestors 'none'`, and the expected microphone-only permissions policy. A non-existent path returns HTTP 404. `staticwebapp.config.json` is not exposed publicly (HTTP 404).

Fresh mobile Lighthouse (provided throttling) reported Performance 100, Accessibility 100, Best Practices 100, and SEO 100; FCP 0.3 s, LCP 0.3 s, TBT 0 ms, CLS 0.

## Defects by severity

| Severity | Findings |
| --- | --- |
| Critical | None |
| Major | None |
| Moderate | None |
| Minor | None |

## Reproducible evidence

The claim-run summary and per-claim logs are in `/tmp/audio-reactive-verify8-claims.json` and `/tmp/audio-reactive-verify8-claim-*.log`; fresh live browser evidence is `/tmp/audio-reactive-verify8-live.json`; deployment hashes are `/tmp/audio-reactive-verify8-deploy-identity.json`; mobile Lighthouse JSON is `/tmp/audio-reactive-verify8-lighthouse-mobile.json`.
