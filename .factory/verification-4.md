# Independent product verification 4

Verified 2026-08-29 against candidate commit `3d2371d3bf57655b8a25c32016afd1532f09ad7d` and `https://audio-reactive-scene.sociobot.in`.

## Verdict

**FAIL — do not release this candidate.**

The deployed files match the candidate exactly, so the failure is not deployment-only. A cold visit to the documented demo URL, `/demo?demo=1`, attempts to create and resume an `AudioContext` before a user gesture. Chrome logs its autoplay-policy warning. The first subsequent click then releases both the pending load attempt and the clicked attempt, creating two four-oscillator sample loops. This contradicts the brief's explicit-gesture constraint and the `gesture-only-input` claim.

## First-read and one-click demo gate

PASS. On a cold 1440 × 900 visit, the first screen states:

- What it does: “Make your audio move a scene.”
- Who it is for: site owners, streamers, and event makers.
- What to click first: “Try it with sample data.”
- What happens next: it opens a sample scene and starts a local sound loop.

The action, explanation, and all three facts are also visible without scrolling at 390 × 844. Clicking the action reaches `/demo?demo=1`, displays “Demo — sample data, nothing is saved,” and starts the sample from that click gesture.

Evidence:

- `verification-artifacts-4/live-home-desktop.png`
- `verification-artifacts-4/live-home-mobile-390-viewport.png`
- `verification-artifacts-4/live-demo-desktop.png`
- `verification-artifacts-4/live-demo-mobile-390.png`

## Claims

`.factory/claims.json` exists with 14 unique IDs and exactly one matching test tag for each ID. The literal pre-install invocation could not start because the clean clone had no `vite` binary. After the required `npm ci`, every exact command from the manifest exited 0:

| Claim | Listed command | Command result | Acceptance result |
| --- | --- | --- | --- |
| `one-click-demo` | `npm test -- --grep @claim:one-click-demo` | PASS | PASS |
| `three-scenes-controls` | `npm test -- --grep @claim:three-scenes-controls` | PASS | PASS |
| `complete-embed` | `npm test -- --grep @claim:complete-embed` | PASS | PASS |
| `local-only-audio` | `npm test -- --grep @claim:local-only-audio` | PASS | PASS |
| `gesture-only-input` | `npm test -- --grep @claim:gesture-only-input` | PASS | **FAIL** |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | PASS |
| `motion-reduction` | `npm test -- --grep @claim:motion-reduction` | PASS | PASS |
| `package-formats` | `npm test -- --grep @claim:package-formats` | PASS | PASS |
| `library-api` | `npm test -- --grep @claim:library-api` | PASS | PASS |
| `node-support` | `npm test -- --grep @claim:node-support` | PASS | PASS |
| `site-build-output` | `npm test -- --grep @claim:site-build-output` | PASS | PASS |
| `npm-unpublished` | `npm test -- --grep @claim:npm-unpublished` | PASS | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS | PASS |
| `privacy-no-personal-data` | `npm test -- --grep @claim:privacy-no-personal-data` | PASS | PASS |

The gesture test is under-scoped: it opens `/demo`, where no automatic start is requested, rather than the documented sandbox entry `/demo?demo=1`. A fresh-context spy produced this evidence:

| Entry and state | `AudioContext` constructors | `resume()` calls | oscillators |
| --- | ---: | ---: | ---: |
| `/demo`, before interaction | 0 | 0 | 0 |
| `/demo`, after Play sample audio | 1 | 1 | 4 |
| `/demo?demo=1`, before interaction | **1** | **1** | 0 |
| `/demo?demo=1`, after Play sample audio | 1 | **2** | **8** |

The direct demo also logs: “The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.” This independently falsifies the claim even though its current tagged test passes.

## Clean checkout and quality gates

The checkout started clean at the requested commit. `origin/main` also resolved to that commit.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 161 packages; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:unit` | PASS — 3/3 Vitest tests |
| `npm test` | PASS — exact production build and 33/33 Chromium tests |
| `npm run build` | PASS — `dist/lib` and `dist/site` produced |
| `npm run pack:check` | PASS — 8 files; 7.7 kB tarball |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |

## Deployment identity

PASS. SHA-256 matched for every public build artifact: `index.html`, `404.html`, `404.css`, `sw.js`, both hashed bundles, both WebPs, both icons, `robots.txt`, and `sitemap.xml`. `staticwebapp.config.json` correctly returns 404 rather than being exposed. The live asset names are the candidate names, `index-BiV33n7j.js` and `index-BuJRuPAP.css`.

## End-to-end product exercise

The core visualizer behavior passes apart from the direct-entry gesture defect:

- Ribbons, Lanterns, and Horizon each produced different canvas frames 450 ms apart while sample audio and full motion were active.
- Static mode produced byte-identical canvas captures 450 ms apart.
- Intensity boundaries set the component to `0` and `1`; static posters differed at the two boundaries.
- A valid generated WAV played locally and connected the component.
- A text file produced the specific MP3/WAV/OGG recovery message.
- A corrupt file labelled `audio/wav` produced “The audio file could not play. Choose another audio file.”
- Sample playback recovered after invalid input and microphone denial.
- A fake granted microphone produced the active-level status and connected component state.
- Copy failure produced a usable recovery instruction rather than silently failing.
- Reset restored Ribbons, 70%, automatic motion, a static poster, and the reset status.

## Accessibility and responsive behavior

- Fresh axe-core scans found zero serious or critical findings on `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html`.
- Each route has `lang="en"`, one `h1`, one `main`, and a route-specific title. Unknown routes return HTTP 404 with a recovery action.
- Keyboard activation worked for sample playback, scene arrow keys, intensity boundaries, motion, and all navigation. Focus rings measured `3px solid rgb(97, 231, 223)` and controls were at least 44 px high.
- At 390 × 844, root and demo had no horizontal overflow. Body and supporting copy were 16 px. All visible pointer targets met 44 px; the intentionally off-screen file-input proxy was excluded.
- With reduced motion, canvas captures 700 ms apart were identical and CSS transition/animation durations reduced to 0.01 ms.
- The accessibility tree gives the canvas an image role and current source label; status, slider, selected tab, and pressed motion state are exposed.

Two non-blocking accessibility defects remain below.

## Privacy, network, headers, and server scope

The full live flow made 21 requests, all to the product origin. It made no fetch/XHR API calls. `localStorage`, `sessionStorage`, IndexedDB, and OPFS remained empty; only the expected versioned service-worker cache existed. There are no third-party fonts, scripts, analytics, advertisements, or authentication requests.

HTML responses use 30-second revalidation. Hashed JS, CSS, and hero assets use `public, max-age=31536000, immutable`; an `If-None-Match` root request returned 304. Headers include HSTS, `nosniff`, strict-origin referrer policy, same-origin COOP, a microphone-only Permissions Policy, and a self-only CSP without `unsafe-inline`.

This is a static product. No product-unlock or other server endpoint was present or called, so API allowance/429 and `Retry-After` checks do not apply. It has no sign-in, so the Entra authority requirement does not apply.

## Offline and update behavior

PASS. The service worker controlled the direct demo, `registration.update()` completed before and after an offline cycle, and exactly one cache (`audio-reactive-scene-2be8ed8391`) existed. With the context offline, `/demo?demo=1` reloaded with HTTP 200 from cache, showed the scene and “You are offline. The demo and sample scene still work,” then returned online successfully.

## Performance and budgets

Fresh Lighthouse 12.8.2 mobile simulation:

| Category/metric | Result |
| --- | ---: |
| Performance | 98 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 1.0 s |
| LCP | 1.3 s |
| TBT | 180 ms |
| CLS | 0 |
| Total transfer | 56 KiB |

A separate four-times CPU-throttled Event Timing run measured four interactions at 40, 112, 72, and 72 ms; the maximum was 112 ms. The site JS is 23,224 bytes raw / 8,035 bytes gzip, CSS is 12,316 / 3,681 bytes, the hero is 43,850 bytes, and no font files ship. All budgets pass.

## Packed consumer

PASS. `npm pack --json` produced `audio-reactive-scene-0.1.2.tgz`, 7,665 bytes packed / 20,167 bytes unpacked, with eight expected files and no bundled or runtime dependencies. A clean temporary consumer installed the tarball. ESM import, CommonJS require, and the CSS export resolved. A browser consuming that installed package verified registration, canvas creation, scene/motion/intensity properties, clamping, accessible label, `connect()`, `disconnect()`, analyser return, and deterministic poster output without console errors.

## Link and metadata checks

All discovered links returned 200, including every same-origin route, the GitHub source repository, and Param Factory. Root metadata lengths pass (47-character title and 108-character description); the Open Graph image is 1200 × 630, the Apple icon is 180 × 180, and Lighthouse SEO scored 100.

## Defects by severity

### S1 — release blocker: direct demo violates the gesture-only audio contract

A cold `/demo?demo=1` calls `playSample()` during initial routing. It constructs and tries to resume an `AudioContext` without a gesture, logs an autoplay warning, and leaves a pending invocation. Pressing Play then resumes both invocations and creates eight oscillators. The tagged claim test avoids the query-string entry and therefore reports a false pass. This breaches a core brief constraint and the claims contract.

### S2 — keyboard focus order bypasses the skip link and header on cold load

Cold `/` and `/demo` loads programmatically focus the `h1` (`tabindex=-1`). The first Tab therefore lands on “Try it with sample data” or “Play sample audio,” not the first-in-DOM skip link; header navigation is reached only after focus wraps or by reverse traversal. Controls remain operable and focus is visible, but initial focus order is not logical for keyboard users.

### S2 — demo banner lacks the required real-use transition

The supplied demo-sandbox contract requires “Start for real.” The persistent banner instead offers “Leave demo,” which returns home rather than taking a library adopter to install/use instructions.

### S3 — the hidden file input is duplicated in the accessibility tree

The invisible, non-tabbable file input remains exposed as a second “Choose an audio file” button next to the visible proxy button. It is not a keyboard trap, but it is confusing in screen-reader browse mode.

### S3 — copy-audit evidence is incomplete

`.factory/copy-audit.md` says landing and demo copy was audited, but it does not enumerate every sentence as required. It omits, among other text, the playback status/recovery messages, three how-it-works descriptions, and several privacy statements. The sampled live copy itself met the 22-word cap and banned-word check.

## Required next action

Remove automatic audio activation from cold `/demo?demo=1`; preserve automatic start only when navigation originates from the landing-page click gesture. Extend `@claim:gesture-only-input` to cover a fresh direct `?demo=1` context and assert one four-oscillator start after the first click. Then repair initial focus order, provide the banner's real-use action, hide the proxy file input from the accessibility tree, complete the copy audit, and rerun verification.
