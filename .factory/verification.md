# Independent product verification — Audio Reactive Scene

## Verdict

**FAIL — candidate `d194cb41ca4a25dccc8b2713871019fcc44d7fa7` is not release-ready.**

Tested on 2026-08-28 against:

- clean detached checkout of `d194cb41ca4a25dccc8b2713871019fcc44d7fa7`
- live deployment `https://audio-reactive-scene.sociobot.in`
- Chromium from Playwright 1.58.2 on desktop and at 390 × 844 px

The live deployment matches the candidate byte-for-byte for all 12 generated site files. This is not a deployment-only failure. Four release-blocking product or quality defects remain.

## Release-blocking findings

### QA-01 — Serious contrast failure on the live not-found route

Severity: **Major / release-blocking**

Live axe-core 4.13 reports `color-contrast` with serious impact on `/missing-signal`. The visible `.error-code` has foreground `#532829` over `#090b12`, a measured ratio of 1.59:1; large text requires 3:1. The attached accessibility contract requires zero serious or critical findings on every page.

The automated suite misses this because it runs axe only on `/demo`. Root, demo, privacy, and terms had zero serious/critical findings.

### QA-02 — The “static poster” moves without audio and after reset

Severity: **Major / release-blocking**

Opening `/demo` directly makes no audio connection. The UI says “Static poster is ready” and the component's accessible label says “showing a static poster,” but canvas captures 500 ms apart are different. Instrumentation observed 94 `requestAnimationFrame` calls during the initial check. After playing the sample and pressing Reset demo, captures still differ and the cumulative count reached 174.

This contradicts the visible state, the accessible state, and `.factory/design.md`, which says the canvas moves only after the user chooses an audio source. It also creates continuous main-thread work before the job starts. Reduced-motion mode itself is stable and passes.

### QA-03 — Claims coverage does not prove all published claims

Severity: **Major / release-blocking**

All eight listed commands pass, but the required claim audit still fails:

- `@claim:gesture-only-input` promises that both audio and microphone input start only after a user action. Its test spies only on `getUserMedia`; it never observes `AudioContext`, sample audio, or file playback before interaction.
- `@claim:local-only-audio` promises no user storage writes. Its test checks only `localStorage`, not `sessionStorage`, IndexedDB, or OPFS.
- README's “no runtime dependencies” statement is not listed as its own claim and is not asserted by the package-formats test. Independent inspection found it true, but the claims contract requires the test.
- The privacy page's broader “does not collect, store, or sell personal data” claim has no exact manifest entry or test. The existing audio-locality test is narrower.

The claims contract explicitly makes unlisted or incompletely tested claims a failed review.

### QA-04 — Repository-wide strict TypeScript check fails

Severity: **Major / release-blocking**

`npx tsc --noEmit -p tsconfig.json` exits 2 with ten diagnostics. They include missing Vite `ImportMeta.env` types, missing Node types for `Buffer`, `node:fs`, and `node:path`, unresolved `__dirname` in both Vite configs, and an unsafe test cast. `tsconfig.json` explicitly includes `src`, `site`, `tests`, and root TypeScript files, so this is the repository's available strict type check.

The narrower shipping declaration build (`tsc -p tsconfig.lib.json`) passes. There is no lint script or lint configuration.

## Other findings

### QA-05 — Hashed assets are cached for only 30 seconds

Severity: **Moderate**

The live hashed JavaScript and CSS both return `Cache-Control: public, must-revalidate, max-age=30`, with no `immutable`. This misses the performance contract's long-lived immutable caching requirement. HTML and `sw.js` may reasonably revalidate quickly; fingerprinted assets should not.

### QA-06 — Browser history loses scroll and focus

Severity: **Moderate**

Starting at `/#how` with `scrollY=2829`, navigating to Privacy, and pressing Back returns to `/` at `scrollY=0` with focus on `<body>`. Forward focuses the Privacy `<h1>` correctly. The routing contract requires back/forward to restore scroll and focus.

### QA-07 — Unknown document routes are soft 404s

Severity: **Moderate**

`/missing-signal` renders the designed not-found screen but responds HTTP 200. Missing excluded assets correctly return 404 with the static 404 body. A nonexistent document route should not be indexed as a successful page.

### QA-08 — Several mobile touch targets are below 44 × 44 px

Severity: **Moderate**

At 390 px, Reset demo and Start for real are 36.8 px high. The Demo navigation link is only 28.8 px wide, and the three footer links are 19.8 px high. The hidden file input was excluded from this finding. There is no horizontal overflow.

### QA-09 — Nonnumeric intensity is not safely normalised

Severity: **Low**

In the installed package, setting `intensity="bogus"` makes the documented numeric property return `NaN`. Numeric values below 0 and above 1 correctly clamp to 0 and 1. Unknown scene and motion values correctly fall back to `ribbons` and `auto`.

## Mandatory first-read gate

**PASS.** A cold desktop load answers all three questions in the first viewport:

- What it does: “Make your audio move a scene.”
- For whom: site owners, streamers, and event makers.
- What to click: “Try it with sample data,” followed by “It opens the playground and starts a local sound loop.”

The action is one click and opens `/demo` with the persistent “Demo — sample data, nothing is saved” banner. The sample starts, the status says it is playing, and the component reports an audio connection. Evidence: `verification-artifacts/live-first-read-desktop.json` and `qa-live-cold-desktop.png`.

## Declared claim tests

`.factory/claims.json` exists. Every listed command was run independently before other repository QA, from the demo entry point. Each passed:

| Claim | Result |
| --- | --- |
| `one-click-demo` | PASS — 1 test passed |
| `three-scenes-controls` | PASS — 1 test passed |
| `local-only-audio` | PASS — 1 test passed |
| `gesture-only-input` | PASS — 1 test passed |
| `offline-reload` | PASS — 1 test passed |
| `motion-reduction` | PASS — 1 test passed |
| `package-formats` | PASS — 1 test passed |
| `mit-license` | PASS — 1 test passed |

The coverage defects in QA-03 are separate from command execution: the tagged tests pass but do not fully assert their words.

## Clean-checkout gates

The exact candidate was cloned to a fresh temporary directory, detached at the requested SHA, and had an empty `git status` before installation.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| `npm test` | PASS — 16 Chromium tests in 27.1 s |
| `npm run test:unit` | PASS — 2 Vitest tests |
| `npm run build` | PASS — exact production build created `dist/lib` and `dist/site` |
| `npx tsc --noEmit -p tsconfig.json` | **FAIL** — 10 diagnostics |
| `npm run pack:check` | PASS — 8 files, 7.2 KB tarball |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |

## End-to-end and package exercise

The live demo completed these paths without console or page errors:

- one-click sample start
- all three scenes
- intensity at 0 and 100
- Static motion mode
- valid generated WAV playback
- invalid text-file rejection with actionable guidance
- denied microphone access with a sample/file recovery path
- Reset demo
- copy action
- keyboard skip link, Enter activation, scene-tab ArrowRight, and visible 3 px focus ring

The packed tarball was installed into a clean Vite consumer. ESM and CommonJS imports both exposed `AudioReactiveScene` and `defineAudioReactiveScene`; the stylesheet export resolved; a TypeScript consumer compiled; the custom element rendered a canvas; and `connect(AudioNode)` updated its accessible state. The invalid-intensity edge case is QA-09.

## Accessibility, responsive behavior, and motion

- `/`, `/demo`, `/privacy`, and `/terms`: zero axe serious/critical findings.
- `/missing-signal`: one serious finding, detailed in QA-01.
- Root and demo pass `/opt/fleet/lib/verify-url.sh`: 200, title, `lang=en`, one `<h1>`, `<main>`, complete image alt attributes, labelled buttons, and zero console errors.
- Desktop and 390 px layouts have no horizontal overflow.
- Skip link is first in the tab order and moves focus to `#main`.
- Focus ring computes to `rgb(97, 231, 223) solid 3px`.
- Reduced-motion canvas captures are identical after 500 ms; CSS transitions reduce to 0.01 ms.
- Default no-audio motion fails as detailed in QA-02.
- Mobile touch-size failures are detailed in QA-08.

## Privacy, network, and response policy

- The exercised demo made only same-origin static requests plus a same-tab `blob:` URL for the local WAV.
- There were no fetch/XHR calls, analytics, remote scripts, remote fonts, or API calls.
- `localStorage` and `sessionStorage` remained empty. The only browser storage observed was the versioned service-worker cache of public files.
- Microphone access occurred only after pressing Use microphone and denial recovered cleanly.
- Live responses include HSTS, strict self-only CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, microphone-only Permissions Policy, and COOP `same-origin`.
- No CSP violations, inline style nodes, console errors, or page errors were observed.
- This static product has no server-side API or product-unlock endpoint, so rate-limit burst testing is not applicable.
- The product has no sign-in, so Entra authority validation is not applicable.
- No AI feature is implied by the brief; the missed-leverage check found no reason to add one.

## Offline and service worker

**PASS.** The live service worker controls `/demo`, `registration.update()` succeeds, and only one versioned cache (`audio-reactive-scene-69e2d894bf`) remains. After a priming reload, an offline reload renders the demo and the visible offline notice.

## Performance and deployment identity

- All 12 local `dist/site` files match their live counterparts byte-for-byte by SHA-256.
- Initial JavaScript: 20.39 KB raw / 7.24 KB gzip.
- CSS: 11.09 KB raw / 3.46 KB gzip.
- Hero WebP: 43.85 KB.
- Fonts: none.
- Total Lighthouse transfer: 55 KiB.
- Two mobile Lighthouse runs scored Performance 97 and 91, Accessibility 100, Best Practices 100, and SEO 100. Conservative metrics: LCP 1.1 s, CLS 0, TBT 380 ms. Both runs produced complete reports, though Chromium crashed during Lighthouse cleanup; ordinary Playwright sessions did not crash.
- All size and category-score budgets pass. Immutable caching does not; see QA-05. Field INP is unavailable because the product intentionally has no analytics.

## Evidence

- `verification-artifacts/live-qa.json`: desktop, mobile, routes, keyboard, reduced-motion, network, and offline results.
- `verification-artifacts/live-demo-desktop.png` and `live-demo-mobile-390.png`: live full-page captures.
- `verification-artifacts/lighthouse-live-mobile.json` and `lighthouse-live-mobile-2.json`: independent Lighthouse reports.
- `verification-artifacts/verify-live-root/` and `verify-live-demo/`: factory URL verifier output.
- `verification-artifacts/live-qa.mjs`: reproducible browser QA script.

## Required disposition

Do not release this candidate. Fix QA-01 through QA-04, add regression coverage for the no-audio/reset poster state and every not-found route, then rerun all declared claims and this complete verification matrix.
