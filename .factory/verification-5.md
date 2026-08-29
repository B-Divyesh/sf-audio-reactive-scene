# Independent product verification 5

Verified 2026-08-29 against candidate commit `9f2b6b5b6fe0da1029d04e144c0d9e2fdba9abb8` and `https://audio-reactive-scene.sociobot.in`.

## Verdict

**FAIL — do not release this candidate.**

The live deployment matches the candidate build byte-for-byte, so this is not a deployment-only failure. The landing site, documented demo, privacy behavior, offline behavior, accessibility, performance, and parser-based embed all pass. One release-blocking library defect remains: a consumer cannot create either registered tag with the standard `document.createElement()` API.

## Release-blocking finding

### V5-01 — Registered elements fail standard DOM construction

Severity: **Major / release-blocking**

The release-candidate tarball was installed into a clean temporary consumer. ESM import, CommonJS require, the parser-created custom tag, direct construction, public methods, attributes, clamping, accessible label, and deterministic poster all worked.

Standard DOM construction did not work:

| Consumer action | Actual result |
| --- | --- |
| `document.createElement('audio-reactive-scene')` | `HTMLUnknownElement`; `connect` is undefined |
| `defineAudioReactiveScene('qa-audio-scene')`, then `document.createElement('qa-audio-scene')` | `HTMLUnknownElement`; `connect` is undefined |

Each call also emitted a page error: `Failed to execute 'createElement' on 'Document': The result must not have children`.

The component appends its canvas in the custom-element constructor. Chromium rejects the constructed result for `document.createElement()` because a custom-element constructor must not return with child nodes. Parser upgrade and `new AudioReactiveScene()` take different paths, so the product demo and the current `@claim:library-api` test do not expose this defect.

This breaks a standard web-component creation path used by client-side rendering and framework integrations. It also makes custom-tag registration incomplete in a library whose core product is a reusable custom element. Evidence: `verification-artifacts-5/consumer.json` and `verification-artifacts-5/consumer-check.mjs`.

## Mandatory first-read and one-click demo gate

**PASS.** A cold 1365 × 768 live load answers all three required questions without scrolling:

- What it does: “Make your audio move a scene.”
- Who it is for: site owners, streamers, and event makers.
- What to click first: “Try it with sample data.”
- What happens next: it opens the sample scene and starts a local sound loop.

The action, explanation, and all three plain facts fit above the fold. At 390 × 844, the action ends at 610 px and the facts end at 834 px. Clicking once reaches `/demo?demo=1`, shows “Demo — sample data, nothing is saved,” starts the sample, and connects the scene. A cold direct visit to that same URL keeps audio stopped until Play is pressed.

Evidence: `verification-artifacts-5/live/home-desktop-1365x768.png`, `home-mobile-390.png`, and `qa.json`.

## Mandatory claims

`.factory/claims.json` exists with 14 unique entries. Before broader QA, the literal commands could not start in the dependency-free clone because `vite` was not installed. After the required `npm ci`, every exact manifest command was rerun independently and exited 0:

| Claim | Result |
| --- | --- |
| `one-click-demo` | PASS |
| `three-scenes-controls` | PASS |
| `complete-embed` | PASS |
| `local-only-audio` | PASS |
| `gesture-only-input` | PASS |
| `offline-reload` | PASS |
| `motion-reduction` | PASS |
| `package-formats` | PASS |
| `library-api` | PASS, but misses the standard construction boundary in V5-01 |
| `node-support` | PASS |
| `site-build-output` | PASS |
| `npm-unpublished` | PASS |
| `mit-license` | PASS |
| `privacy-no-personal-data` | PASS |

Landing, legal, metadata, and README claim-like statements were cross-checked against the manifest. The scene count and controls, local audio, storage, gesture, offline, motion, package, API, Node, build output, npm status, license, and privacy statements all have corresponding entries. No separate unlisted marketing claim was found.

## Clean-checkout quality gates

The checkout began clean with `HEAD` and `origin/main` at the requested candidate.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 161 packages; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:unit` | PASS — 5/5 Vitest tests |
| `npm test` | PASS — production build and 35/35 Chromium tests |
| `npm run build` | PASS — `dist/lib` and `dist/site` produced |
| `npm run pack:check` | PASS — eight files; 7.8 kB packed |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |

The exact production site bundle is 23,212 bytes JavaScript (8,035 gzip) and 12,316 bytes CSS (3,681 gzip). It ships no fonts. The hero WebP is 43,850 bytes.

## End-to-end live exercise

The smallest useful product works through the documented path:

- Ribbons, Lanterns, and Horizon each produced changing frames with local sample audio and full motion.
- Static mode produced a stable poster. Reset stopped animation and restored Ribbons, 70%, and System setting.
- Intensity accepted the 0 and 100 boundaries, mapped them to component values `0` and `1`, and produced different posters.
- A generated valid WAV played locally and connected the component.
- A text file produced the MP3/WAV/OGG recovery message.
- A corrupt file labelled `audio/wav` produced “The audio file could not play. Choose another audio file.”
- Microphone denial produced a specific recovery path, and sample playback then recovered.
- Clipboard denial produced “Copy was blocked. Select the code and copy it.”
- A cold direct demo created zero AudioContexts, resumes, oscillators, or microphone requests. One Play click produced exactly one context, one resume, and four oscillators.

No console error, page error, failed request, or CSP violation occurred in the successful product flows.

## Accessibility, keyboard, and responsive behavior

- Fresh axe-core scans found zero serious or critical findings on `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html` at desktop and 390 px.
- The factory URL verifier passed root and direct demo: title, `lang=en`, one `h1`, one `main`, image alternatives, labelled buttons, and no console errors.
- Cold route focus stayed on the document. The first Tab reached the skip link, whose 3 px cyan focus outline was visible; Enter moved focus to `main`.
- Scene tabs passed Arrow Right, Home, and End behavior. The native intensity slider reached 0 and 100 from the keyboard.
- Browser Back restored `/#how`, scroll position, and focus on `#how`.
- At 390 × 844, there was no horizontal overflow, no visible target below 44 × 44 px, and supporting copy measured 16 px.
- Reduced motion produced byte-identical canvas captures both before and after audio connected. CSS animations were absent and transitions reduced to 0.01 ms.
- The canvas exposes an image role and source-aware accessible label; status and route changes use live regions.

The intentional 404 navigation makes Chromium log its expected network `404` diagnostic. The designed `/404.html` itself loads without a console or page error and the missing route correctly returns HTTP 404.

## Privacy, requests, headers, and server scope

The complete live demo flow made only same-origin static requests plus two same-tab `blob:` media reads. It made no fetch/XHR API request. `localStorage`, `sessionStorage`, IndexedDB, and OPFS remained empty. The only stored data was the versioned public service-worker cache.

Response policy passes:

- HTML and `sw.js` revalidate after 30 seconds; an `If-None-Match` request returned 304.
- Hashed JavaScript, CSS, and image assets use `public, max-age=31536000, immutable`.
- CSP is self-only and includes `frame-ancestors 'none'` as a response header.
- HSTS, `nosniff`, strict-origin referrer policy, same-origin opener policy, and microphone-only permission policy are present.
- The deployment config is not public and returns the designed 404.

This is a static library site. No product-unlock or other server endpoint is documented, present in source, or called by the full flow, so request allowances, 429, and `Retry-After` are not applicable. There is no sign-in, so the Entra authority check is not applicable. The brief does not benefit from an AI feature, and no AI runtime is present.

## PWA/offline behavior

PASS. The service worker installed, controlled the direct demo, and completed update checks before and after the offline cycle. Exactly one versioned cache, `audio-reactive-scene-2be8ed8391`, remained. With networking disabled, `/demo?demo=1` reloaded with HTTP 200 and displayed the offline notice and scene.

## Performance

A successful Lighthouse 12.8.2 mobile run reported:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 0.8 s |
| LCP | 1.1 s |
| TBT | 50 ms |
| CLS | 0 |
| Total transfer | 56 KiB |

A separate four-times CPU-throttled Event Timing run measured four interactions at 184, 72, 32, and 16 ms; the maximum was 184 ms. All specified bundle, LCP, interaction, layout-shift, and category budgets pass.

Evidence: `verification-artifacts-5/live/lighthouse-mobile-retry.json` and `interaction-timing.json`.

## Deployment identity and links

PASS. SHA-256 matched for all 12 public build artifacts: `index.html`, `404.html`, `404.css`, `sw.js`, both hashed bundles, both WebPs, both icons, `robots.txt`, and `sitemap.xml`. The deployment-only config correctly returns 404 instead of being served. This proves the live deployment is candidate `9f2b6b5b6fe0da1029d04e144c0d9e2fdba9abb8`.

All 14 discovered links returned 200 after redirects, including every internal route, the source repository, and Param Factory. The social image is 1200 × 630 and the Apple icon is 180 × 180.

Evidence: `verification-artifacts-5/live/identity.json`, `links.json`, and `response-policy.json`.

## Packed consumer

`npm pack --json` produced `audio-reactive-scene-0.1.2.tgz`, 7,796 bytes packed and 20,433 bytes unpacked, with eight expected files and no bundled or runtime dependencies. A clean consumer installed it with zero vulnerabilities. ESM and CommonJS exposed only `AudioReactiveScene` and `defineAudioReactiveScene`; CSS and declarations resolved. Documented attributes, audio methods, invalid-value fallbacks, clamping, label, deterministic poster, direct construction, and parser-created custom markup passed.

The standard DOM construction failure in V5-01 is the only packed-consumer blocker.

## Required disposition

Do not release. Move canvas creation or attachment out of the constructor so both default and custom registered elements can be created with `document.createElement()` without a page error. Add a regression case to `@claim:library-api` that creates both names through `document.createElement`, appends them, and exercises `connect()`. Then rerun every claim, clean-consumer packaging, and live verification.
