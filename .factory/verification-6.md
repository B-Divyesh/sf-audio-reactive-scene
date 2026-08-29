# Independent product verification 6

Verified 2026-08-29 against candidate commit `03dc69661d3512ab95bf0cd7c6a57529a50d9b16` and `https://audio-reactive-scene.sociobot.in`.

## Verdict

**FAIL — do not release candidate `03dc69661d3512ab95bf0cd7c6a57529a50d9b16`.**

This is not a deployment-only failure. Every public deployment artifact matches the candidate build byte-for-byte. The previous `document.createElement()` blocker is fixed, and the claims, build, live demo, privacy, offline, accessibility automation, and performance gates pass. A separate documented public-API contract is false: the README promises a `label` property matching the `label` attribute, but the class and TypeScript declarations do not implement that property. A manual 200% text-resize check also exposes horizontal mobile header overflow.

## Release-blocking findings

### V6-01 — The documented `label` property does not set the accessible label

Severity: **Major / release-blocking**

The README API reference introduces `scene`, `intensity`, `motion`, and `label` as “Attributes and matching properties.” The packed component implements matching properties for the first three, but not `label`.

Fresh packed-consumer evidence:

```js
const scene = document.createElement('audio-reactive-scene');
document.body.append(scene);
scene.label = 'Consumer visual';

scene.label                     // "Consumer visual" (an unrelated expando)
scene.getAttribute('label')     // null
scene.getAttribute('aria-label')
// "ribbons audio-reactive scene, showing a static poster"
```

Assigning the promised property therefore does not change the component attribute or its accessible name. A clean TypeScript consumer also fails:

```text
consumer.ts(3,7): error TS2339: Property 'label' does not exist on type 'AudioReactiveScene'.
```

By comparison, assigning `scene`, `intensity`, and `motion` updates their attributes. `setAttribute('label', ...)` is a workaround, but it does not make the documented matching property true.

The `library-api` claim test passes because it exercises `setAttribute('label', ...)`, not the documented property assignment. This leaves the claim test incomplete for the README surface it is intended to prove.

Required fix: add a typed `label` getter/setter that reflects the `label` attribute and updates the accessible name, or change the README so `label` is explicitly attribute-only. Extend `@claim:library-api` with property assignment, attribute reflection, accessible-name, and declaration-consumer assertions.

### V6-02 — Mobile header overflows at 200% text size

Severity: **Moderate / release-blocking under the attached accessibility baseline**

At a 390 × 844 viewport, setting the root text size to 200% makes both `/` and `/demo?demo=1` horizontally scroll:

```text
documentElement.clientWidth = 390
documentElement.scrollWidth = 436
site navigation right edge = 436.23
Privacy link right edge = 436.23
```

The wordmark's text also needs 190 px inside its 130 px mobile cap, while the unwrapped navigation begins alongside it. The Privacy action is partly outside the viewport and the header requires horizontal panning. Normal text size has no horizontal overflow.

Required fix: let the mobile header/nav wrap or stack at enlarged text sizes, then add a 200% text-size regression at 390 px.

## Mandatory first-read and demo gate

**PASS.** A fresh 1365 × 768 live load answered all required questions without scrolling:

- What it does: “Make your audio move a scene.”
- Who it is for: site owners, streamers, and event makers.
- What to click first: “Try it with sample data.”
- What happens: “It opens the sample scene and starts a local sound loop.”
- The three facts end at 719.98 px in the 768 px viewport.

At 390 × 844, the action ends at 610.05 px and the facts end at 833.63 px. One click opens `/demo?demo=1`, shows “Demo — sample data, nothing is saved,” starts the local sample, and changes the component label to connected audio. A cold direct demo visit remains stopped until Play is pressed.

## Mandatory claim tests

`.factory/claims.json` exists with 14 unique claims. The literal first command initially could not start in the dependency-free clone (`vite: not found`); after the required `npm ci`, every exact manifest command was rerun independently and exited 0:

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
| `library-api` | PASS, but misses V6-01 |
| `node-support` | PASS |
| `site-build-output` | PASS |
| `npm-unpublished` | PASS |
| `mit-license` | PASS |
| `privacy-no-personal-data` | PASS |

Landing, legal, metadata, and README statements were cross-checked against the claim manifest. No wholly unlisted product claim was found. V6-01 is a test-coverage mismatch inside the listed `library-api` claim.

## Clean-checkout quality gates

The checkout began clean with `HEAD`, `origin/main`, and the requested candidate all at `03dc69661d3512ab95bf0cd7c6a57529a50d9b16`.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 161 packages; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:unit` | PASS — 5/5 Vitest tests |
| `npm test` | PASS — exact build and 35/35 Chromium tests |
| `npm run build` | PASS — `dist/lib` and `dist/site` produced |
| `npm run pack:check` | PASS — 8 files; 8.0 kB package |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |

The exact site bundle is 23,279 bytes JavaScript (8.06 kB gzip) and 12,316 bytes CSS (3.67 kB gzip). The component ESM bundle is 6.57 kB (2.40 kB gzip). No font files ship.

## End-to-end live exercise

The smallest useful product works apart from the public-API defect:

- Ribbons, Lanterns, and Horizon each produced distinct changing frames with sample audio and Full motion.
- Intensity boundaries 0% and 100% reflected as `0` and `1` and produced different posters.
- Static mode and reduced-motion System mode produced stable frames.
- A generated valid WAV played locally and connected the component.
- A text file produced the MP3/WAV/OGG recovery message.
- A corrupt `audio/wav` file produced “The audio file could not play. Choose another audio file.”
- Microphone denial produced a sample/file recovery path. A separate granted fake-device run reached “Microphone levels are active in this tab” with no errors.
- Clipboard denial produced “Copy was blocked. Select the code and copy it.”
- Reset stopped animation and restored Ribbons, 70%, System setting, and a stable poster.
- Start for real stopped the sample, removed the demo banner, opened `/#install`, focused the install section, and left the home playground static.
- A cold direct demo created zero AudioContexts, resumes, oscillators, or microphone requests. One Play click produced one context, one resume, and four oscillators. Microphone was requested only after its own button.

No console error, page error, failed request, or CSP violation occurred on successful routes and flows. Chromium emits its normal failed-resource console message for an intentional HTTP 404 route; the designed error page has no page error.

## Accessibility, keyboard, and responsive behavior

- Axe 4.13 found zero serious or critical findings on `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html` at desktop and 390 px.
- The factory URL verifier passed root and demo: HTTP 200, title, `lang=en`, one `<h1>`, `<main>`, complete image alternatives, labelled buttons, and zero errors.
- The first Tab reaches the skip link; its focus indicator is a visible 3 px cyan outline. Enter focuses `main`.
- Scene tabs respond to Arrow Left/Right, Home, and End. The intensity range reaches 0 and 100 from the keyboard.
- Browser Back restores `/#how`, scroll position, and focus.
- At normal size, the 390 px layout has no horizontal overflow, all measured interactive targets are at least 44 × 44 px, and supporting copy is 16 px.
- Reduced motion produces byte-identical canvas frames before and after audio connection; no CSS animation remains and transitions reduce to 0.01 ms.
- V6-02 is the manual text-resize exception.

## Privacy, requests, headers, and server scope

The complete live flow requested only same-origin static files plus same-tab `blob:` media reads for local WAV objects. It made no fetch/XHR, API, analytics, remote script, remote font, or other off-origin request. `localStorage`, `sessionStorage`, IndexedDB, and OPFS remained empty. The only persistent data was one versioned cache of public application files.

Live response policy includes:

- strict self-only CSP with `frame-ancestors 'none'` in the response header;
- HSTS;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy: camera=(), geolocation=(), microphone=(self)`;
- `Cross-Origin-Opener-Policy: same-origin`.

HTML and `sw.js` use 30-second revalidation; an `If-None-Match` request returned 304. Hashed JS, CSS, and image assets use `public, max-age=31536000, immutable`.

This is a static library site. Source and live request inspection found no product-unlock or other server-side endpoint, so allowance, 429, and `Retry-After` testing is not applicable. There is no sign-in, so the Entra authority check is not applicable. The brief does not call for AI and no AI runtime is present.

## Offline and service-worker behavior

**PASS.** The live service worker installed, controlled the demo, and completed update checks before and after the offline cycle. Exactly one cache, `audio-reactive-scene-2be8ed8391`, remained. An offline reload returned 200, rendered “Try sample audio,” and showed “You are offline. The demo and sample scene still work.”

## Performance and deployment identity

Fresh Lighthouse 12.8.2 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 1.0 s |
| LCP | 1.2 s |
| TBT | 140 ms |
| CLS | 0 |
| Total transfer | 56 KiB |

A separate four-times CPU-throttled mobile Event Timing run measured four interactions at 192, 168, 88, and 120 ms; the maximum was 192 ms. All stated JS, CSS, image, LCP, interaction, and layout-shift budgets pass.

SHA-256 matched for every one of the 12 public build artifacts: `index.html`, `404.html`, `404.css`, `sw.js`, both hashed bundles, both WebPs, both icons, `robots.txt`, and `sitemap.xml`. The root candidate/live hash is:

```text
63625d8b252fff8afdcbadf3d1a4c9ea30452b61315e6b3fbe3b754b55c2e855
```

The deployment-only `staticwebapp.config.json` correctly returns 404. All 14 discovered internal and external links returned 200 after redirects. The live deployment therefore matches candidate `03dc69661d3512ab95bf0cd7c6a57529a50d9b16`; the failure is in the candidate, not deployment drift.

## Packed consumer

`npm pack --json` produced `audio-reactive-scene-0.1.2.tgz`, 7,958 bytes packed and 20,853 bytes unpacked, with eight expected files and no bundled or runtime dependencies. A fresh consumer installed it with zero vulnerabilities. ESM and CommonJS exposed `AudioReactiveScene` and `defineAudioReactiveScene`; CSS and declarations resolved.

The repaired standard paths now pass: default and custom tags created by `document.createElement()` have zero children before connection, gain a canvas after append, expose `connect()`, and accept an `AudioNode` without console/page errors. Parser markup, direct construction, attributes, clamping, deterministic posters, and custom registration also pass. V6-01 is the remaining packed-consumer defect.

## Required disposition

Do not release. Implement or remove the promised `label` matching property and cover it in runtime plus TypeScript consumer tests. Repair the enlarged-text mobile header reflow. Then rerun all 14 claim commands, the full suite, the clean packed consumer, and live deployment verification.
