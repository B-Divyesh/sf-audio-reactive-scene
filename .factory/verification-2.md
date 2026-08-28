# Independent product verification — candidate 3a9042c

## Verdict

**FAIL — do not release candidate `3a9042c4affd77c445a9be204a99971a9d6a7c0b`.**

Fresh verification ran on 2026-08-28 against the clean candidate checkout and `https://audio-reactive-scene.sociobot.in`. The deployed site files match the candidate build. This is not a deployment-only failure.

Two release blockers remain: the required first action is below the first screen on a common desktop viewport, and keyboard navigation stops on a fully transparent file input with no visible focus indication.

## Release-blocking findings

### QA2-01 — Desktop first screen hides the action and required facts

Severity: **Major / release-blocking**

At a cold 1365 × 768 desktop load, the headline is visible, but the audience sentence extends below the viewport and the first action is completely below it:

- headline: top 235.34 px, bottom 687.69 px
- audience sentence: top 715.69 px, bottom 808.69 px
- “Try it with sample data”: top 832.69 px, bottom 883.48 px
- action explanation: top 837.25 px, bottom 878.91 px
- three plain facts: begin at 911.48 px

The screenshot contains no visible action. A visitor must scroll before learning what to click, which directly fails the work order's mandatory first-read gate. At 1440 × 900 the action is barely visible, but the three facts still begin below the fold. The 390 × 844 first screen does fit the action and facts.

Evidence: `verification-artifacts-2/blockers.json` and `verification-artifacts-2/live-root-laptop.png`.

### QA2-02 — Keyboard focus lands on an invisible file input

Severity: **Major / release-blocking**

On `/demo`, keyboard focus proceeds from Play sample audio → Choose audio file → Use microphone → `#audio-file`. That native file input remains in the tab order while CSS gives it `opacity: 0` and `pointer-events: none`. At focus it measures 327 × 25.8 px and computes a 3 px outline, but the entire focused element, including the outline, is transparent. The user receives no visible indication of focus before the next Tab reaches System setting.

This violates the attached non-negotiable keyboard rule that every interactive element have visible focus. The visible Choose audio file button already provides the intended control; the duplicate hidden focus stop should be removed from sequential navigation or replaced by an accessible visible file control.

Evidence: `verification-artifacts-2/blockers.json`.

## Other findings

### QA2-03 — The deployed 404 omits the standard site skeleton

Severity: **Moderate**

`/missing-signal` correctly returns HTTP 404 and has one `<main>`, one `<h1>`, a useful recovery link, and no axe violations. However, the deployed static 404 has no skip link, `<header>`, navigation, `<footer>`, version, or build identity. The site-structure contract requires the consistent header and footer on every route.

Evidence: `verification-artifacts-2/blockers.json` (`skipLinks: 0`, `headers: 0`, `footers: 0`).

### QA2-04 — Important mobile supporting text is undersized

Severity: **Moderate**

At 390 px, computed text sizes are 13.44 px for the first-action explanation, 12.8 px for the three first-screen facts, 12 px for control labels, 13.12 px for status messages, and 12.8 px in the footer. These are meaningful instructions and states, not decorative text, and fall short of the attached legibility guidance. The main audience sentence is 16.8 px.

Evidence: `verification-artifacts-2/blockers.json` and `verification-artifacts-2/live-demo-mobile-390.png`.

## Mandatory claim tests

`.factory/claims.json` exists. Before other QA, each exact command was run independently against the locally built production demo entry point after `npm ci`. All passed:

| Claim | Result |
| --- | --- |
| `one-click-demo` | PASS — 1 Playwright test |
| `three-scenes-controls` | PASS — 1 Playwright test |
| `local-only-audio` | PASS — 1 Playwright test |
| `gesture-only-input` | PASS — 1 Playwright test |
| `offline-reload` | PASS — 1 Playwright test |
| `motion-reduction` | PASS — 1 Playwright test |
| `package-formats` | PASS — 1 Playwright test |
| `mit-license` | PASS — 1 Playwright test |
| `privacy-no-personal-data` | PASS — 1 Playwright test |

Landing and README claims were cross-checked against the manifest. No unlisted material claim was found. The privacy, gesture, package, license, motion, offline, and three-scene statements have matching claim entries.

## Clean-checkout quality gates

The starting checkout was clean, with `HEAD` and `origin/main` both at the requested candidate.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 161 packages installed; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:unit` | PASS — 3 Vitest tests |
| `npm test` | PASS — exact build plus 21 Chromium tests |
| `npm run build` | PASS — `dist/lib` and `dist/site` produced |
| `npm run pack:check` | PASS — 8 files, 7.5 KB tarball |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |

The full suite covers claims, CSP, axe, unknown routes, mobile sizing, keyboard scene tabs, reset, stable posters, history, service-worker update, offline reload, and console errors.

## End-to-end live exercise

The product's useful flow works apart from the presentation/accessibility blockers:

- The one-click action opens `/demo`, shows “Demo — sample data, nothing is saved,” starts the local sample, and connects the scene.
- Ribbons, Lanterns, and Horizon select correctly.
- Intensity boundaries 0% and 100% map to component values `0` and `1`.
- Static and System motion controls update state.
- A text file produces a specific MP3/WAV/OGG error, then sample playback recovers immediately.
- A generated valid WAV plays in the tab and is not uploaded.
- Microphone denial gives a sample/file recovery path. A separate fake-device run with permission granted reports active local levels and connects the component.
- Reset restores Ribbons, 70%, System setting, and a static poster.
- Start for real stops the sample, removes the demo banner, returns home, and reopening `/demo` starts from clean defaults.
- Before input, live instrumentation saw 0 animation-frame requests and identical canvas frames. After Reset, the count remained fixed and frames stayed identical. During sample playback the count increased.

Evidence: `verification-artifacts-2/live-qa.json`, desktop/mobile screenshots, and the reproducible scripts in that directory.

## Accessibility, responsive behavior, and motion

- Axe-core 4.13 found zero violations of any impact on `/`, `/demo`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html`.
- The factory URL verifier passed `/` and `/demo`: HTTP 200, title, `lang=en`, one `<h1>`, `<main>`, complete image alt coverage, labelled buttons, and no console/page errors.
- The skip link is first from a fresh root load, has a visible 3 px cyan focus outline, and moves focus to `#main`.
- Scene tabs respond to Arrow keys; the native range responds to Home and ArrowRight.
- Exposed mobile controls measure at least 44 × 44 px. The 390 px layout has no horizontal overflow.
- With reduced motion and active sample audio, two canvas captures 500 ms apart are identical and `document.getAnimations()` is empty.
- History navigation restores the `#how` section and focus after smooth scrolling settles.
- The invisible file-input focus stop is the blocking exception described in QA2-02.

## Privacy, network, and response policy

The complete live demo flow requested only the product origin plus the same-tab `blob:` URL created for the generated WAV. It made no fetch/XHR calls, analytics requests, remote-script requests, remote-font requests, or API calls. `localStorage`, `sessionStorage`, IndexedDB, and OPFS remained empty. The only persistent browser data observed was the service worker's cache of public application files.

Live responses include:

- strict self-only CSP with no `unsafe-inline`
- HSTS
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- microphone-only Permissions Policy
- COOP `same-origin`
- `Cache-Control: public, max-age=31536000, immutable` on hashed JS and CSS
- short revalidation on HTML and `sw.js`

No CSP violations, runtime console errors, page errors, failed requests, or third-party runtime requests occurred on the normal routes. This is a static library site with no server endpoint or product-unlock call, so rate-limit/429 testing is not applicable. It has no sign-in, so Entra authority testing is not applicable. The brief does not imply a useful AI action, so no AI feature is missing.

## PWA behavior

The live service worker controls `/demo`; `registration.update()` succeeds; one versioned cache named `audio-reactive-scene-2be8ed8391` remains. After a priming reload, a fully offline reload returns the demo shell, the sample button, and the visible offline notice.

## Packed-library consumer

The real `audio-reactive-scene-0.1.2.tgz` was installed into an otherwise clean temporary consumer:

- ESM import and CommonJS require both expose `AudioReactiveScene` and `defineAudioReactiveScene`.
- A strict NodeNext TypeScript consumer compiles against the shipped declarations.
- The package stylesheet resolves and loads.
- The custom element renders one canvas with `role="img"` and a useful label.
- `connect(AudioNode)` returns an `AnalyserNode` and changes the label to connected.
- Unknown scene/motion values fall back to Ribbons/auto; nonnumeric intensity normalizes to 0; numeric values clamp to 0–1.
- `disconnect()` restores a stable poster and disconnected accessible state.

## Deployment identity, budgets, and performance

Every publicly served build artifact matches the clean candidate build byte-for-byte: `index.html`, `404.html`, `404.css`, `sw.js`, both hashed bundles, both generated WebPs, both icons, `robots.txt`, and `sitemap.xml`. `staticwebapp.config.json` is deployment configuration and correctly is not served as a public file. The deployed `index.html` SHA-256 is `0c6cb4c5f5ce1a610a57a932efd6cbb781c3c221a296779c8d3ca28e0f2a40c5`.

- initial JavaScript: 21,387 bytes raw / 7,558 bytes gzip
- CSS: 11,264 bytes raw / 3,487 bytes gzip
- hero WebP: 43,850 bytes
- fonts: none
- Lighthouse transfer: 57,017 bytes (56 KiB)
- Lighthouse mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100
- FCP 1.09 s, LCP 1.33 s, Speed Index 1.09 s, CLS 0, TBT 274.5 ms

All stated bundle, asset, LCP, CLS, and category-score budgets pass. Field INP is unavailable because the product intentionally has no analytics. Lighthouse wrote a complete report but Chromium crashed during tool cleanup; repeated ordinary Playwright sessions did not crash.

## Required disposition

Do not release this candidate. Keep the action, its explanation, and the three facts within a 1365 × 768 first viewport; remove the transparent file input from sequential keyboard focus or make it visibly focusable; then rerun the first-read and keyboard checks. Bring the static 404 into the shared shell and raise meaningful mobile supporting text before the next verification.
