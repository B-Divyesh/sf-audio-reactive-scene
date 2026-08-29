# Polish 2 — cumulative adversarial finding closure

Repair commits: `b18f56c29601450ea33a26f3d1e8f6395f1ad66c` and `e3feb2e23f088db5a9d33797ac3632db5d00ec29`. Final deployment: `87e6e882-970e-4369-9c0c-c03dd2a30b49` at <https://audio-reactive-scene.sociobot.in>.

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Moved the displayed snippet into one shared source. The claim test packs and installs the library in a fresh consumer, serves that exact snippet with local audio, clicks Play, checks the connected accessible state, and proves canvas pixels change. | `@claim:complete-embed`; clean-clone pass; [live demo](https://audio-reactive-scene.sociobot.in/demo?demo=1). |
| F-2-2 | Replaced visitor-facing “web component” and “custom element” wording with one term: “HTML element.” Technical type names remain only in the API reference. | `copy audit` unit test; [live home screenshot](evidence/polish-2-live/home-desktop.png); [live home](https://audio-reactive-scene.sociobot.in/). |
| F-2-3 | Replaced four oscillators with an original eight-second percussion, bass, and bell WAV. The deterministic synthesis source and provenance are checked in. The service worker precaches it. | `@claim:one-click-demo`; `@claim:offline-reload`; [live QA](evidence/polish-2-live/live-qa.json) records a 206 `audio/wav` response and changing frames; [playing mobile screenshot](evidence/polish-2-live/demo-mobile-playing.png). |
| F-2-4 | Renamed the demo exit to “Open package instructions.” It stops demo audio, navigates to `/#install`, and focuses the install section. | `route navigation focuses the Home heading and package instructions`; [live QA](evidence/polish-2-live/live-qa.json); [live demo](https://audio-reactive-scene.sociobot.in/demo?demo=1). |

## Review 1 and earlier regression findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the honest unpublished-package path. The site links the repository and explains local tarball creation; no false npm install command remains. | `@claim:npm-unpublished`; `@claim:package-formats`; [live package section](https://audio-reactive-scene.sociobot.in/#install). |
| F-1-2 | Kept the direct `/demo?demo=1` workbench with visible Play action and no gesture-free autoplay. | `@claim:one-click-demo`; `@claim:gesture-only-input`; [live demo verification](evidence/polish-2-live/demo/verify.json). |
| F-1-3 | Kept the compact demo and further reduced the mobile banner/status footprint. The running stage ends at 742 px and status at 808 px in a 844 px viewport. | `demo puts the live scene and playback status in the first mobile and desktop viewports`; [live QA](evidence/polish-2-live/live-qa.json); [mobile screenshot](evidence/polish-2-live/demo-mobile-playing.png). |
| F-1-4 | Superseded the incomplete string assertion with the packed, installed, executed consumer proof described in F-2-1. | `@claim:complete-embed`. |
| F-1-5 | Preserved exhaustive claims for public API behavior, Node support, and site output. | `@claim:library-api`; `@claim:node-support`; `@claim:site-build-output`. |
| F-1-6 | Preserved focus movement to the home heading, restored hash target, and package section after normal navigation. | `route navigation focuses the Home heading and package instructions`; `browser Back restores the anchored scroll position and focus`. |
| F-1-7 | Preserved per-route titles, descriptions, canonical URLs, OG/Twitter metadata, and full static-404 metadata. | `each route has route-specific metadata and canonical URL`; [live QA route results](evidence/polish-2-live/live-qa.json). |
| F-1-8 | Kept the literal 404 heading “This page does not exist.” | `every not-found route has a visible, accessible high-contrast error state`; [live unknown route](https://audio-reactive-scene.sociobot.in/missing-signal). |
| F-1-9 | Kept 404 recovery pointed at `/demo?demo=1` with “Open the sample playground.” | `QA2-03: the static deployment 404 uses the shared site shell`; [live 404](https://audio-reactive-scene.sociobot.in/404.html). |
| F-1-10 | Kept “Audio scene playground.” | `copy audit` unit test; [live home](https://audio-reactive-scene.sociobot.in/). |
| F-1-11 | Kept “Audio privacy.” | `copy audit` unit test; [live home](https://audio-reactive-scene.sociobot.in/). |
| F-1-12 | Kept “Package formats.” | `copy audit` unit test; [live package section](https://audio-reactive-scene.sociobot.in/#install). |
| F-1-13 | Kept the explicit fact “Demo works offline after your first visit.” | `@claim:offline-reload`; [live home screenshot](evidence/polish-2-live/home-desktop.png). |
| F-1-14 | Fully closed through F-2-2 with consistent “HTML element” copy and an updated terminology table. | `copy audit` unit test; [.factory/copy-audit.md](copy-audit.md). |
| F-1-15 | Fully closed through F-2-4 with a result-naming exit label. | Navigation-focus test; [live QA](evidence/polish-2-live/live-qa.json). |
| F-1-16 | Kept banner controls at 16 px and at least 44 px tall; mobile wrapping now keeps the running result visible too. | `QA2-04: mobile supporting instructions and status text remain at least 16px`; `mobile layout does not scroll sideways`. |
| F-1-17 | Kept the unavailable install-copy action removed; the repository link is the honest action. | `@claim:npm-unpublished`; [live package section](https://audio-reactive-scene.sociobot.in/#install). |
| QA2-01 | Preserved the complete desktop first screen above the fold. | `QA2-01: desktop first screen keeps the action, explanation, and facts above the fold`; [live home screenshot](evidence/polish-2-live/home-desktop.png). |
| QA2-02 | Preserved one accessible file action; the hidden input is not a keyboard stop. | `QA4-03: the hidden file picker is neither a keyboard stop nor a duplicate accessible control`. |
| QA2-03 | Preserved the shared header, skip link, navigation, footer, metadata, and recovery action on the static 404. | `QA2-03: the static deployment 404 uses the shared site shell`; [live 404](https://audio-reactive-scene.sociobot.in/404.html). |
| QA2-04 | Preserved 16 px supporting text and 44 px controls at 390 px. | `QA2-04: mobile supporting instructions and status text remain at least 16px`; [live demo screenshot](evidence/polish-2-live/demo-mobile-playing.png). |

## Verification summary

- Clean clone `/tmp/audio-reactive-scene-polish2-final.IeWEQN` at `e3feb2e`: `npm ci` and all 14 literal `.factory/claims.json` commands passed independently.
- Final source: `npm run test:unit` (5/5), typecheck, lint, and `npm test` (36/36) passed. The suite includes axe on all routes, keyboard, focus, mobile, 200% text, privacy, offline, service-worker, package, and consumer checks.
- `npm run pack:check` produced 8 package files, 8.4 kB packed / 22.0 kB unpacked. `npm audit --audit-level=low` reported zero vulnerabilities.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.13 s, TBT 33 ms, CLS 0. Full report: [lighthouse-mobile.json](evidence/polish-2-live/lighthouse-mobile.json).
- Factory URL verification passed live `/` and `/demo?demo=1` with the correct title, `lang=en`, one h1, one main, complete image alternatives, labelled buttons, and no console errors. Evidence: [root](evidence/polish-2-live/root/verify.json) and [demo](evidence/polish-2-live/demo/verify.json).
- A SHA-256 comparison found zero mismatches across all 13 deployed public artifacts. Cold live QA found no normal-route error, no off-origin request, no serious/critical axe issue, no storage mutation, and a real HTTP 404 for an unknown route.

No finding of any severity remains open.
