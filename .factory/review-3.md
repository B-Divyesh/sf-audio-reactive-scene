# Adversarial first-read review 3 — Audio Reactive Scene

Reviewed 2026-08-29 against repository commit `9b508507ad0c88dc15bc1e7f3493737cae29ba75` and the live deployment at <https://audio-reactive-scene.sociobot.in>. Product code was not modified. Checks used fresh headless Chromium contexts at 390 × 844 and 1365 × 768, plus a fresh local clone at `/tmp/audio-reactive-scene-review3.gtLVd5`.

## Verdict: PASS

There are zero findings of any severity and no untested declared claims. No `F-3-*` identifiers are issued.

## 1. Cold first screen

This check passes at both viewport sizes before scrolling.

In first-read words:

- What it does: adds a small scene that responds to page audio.
- Who it is for: site owners, streamers, and event makers.
- What to click first: **Try it with sample data**.

The exact first-screen copy makes all three answers available: “Make your audio move a scene”; “For site owners, streamers, and event makers who need a restrained visual without sending audio away.”; and “Try it with sample data.” At 390 px the action, its result note, and all three facts remained within the 844 px viewport (the last fact ended at y=833.6). At 1365 × 768, the same content ended at y=720.0. Cold root loads returned HTTP 200 with no page or console errors and no off-origin requests.

## 2. Copy audit

Word counts use whitespace-separated words. Code in the README example is excluded because it is executable code rather than product prose. All landing and README sentences, headings, labels, and actions are at or below 22 words. No banned marketing adjective, unexplained first-read jargon, inconsistent visitor-facing term, mood-only heading, or non-result-naming button was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Audio Reactive Scene | 3 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Install | 1 | Pass |
| Privacy | 1 | Pass |
| A reusable HTML element for page audio | 7 | Pass |
| Make your audio move a scene | 6 | Pass |
| For site owners, streamers, and event makers who need a restrained visual without sending audio away. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| It opens the sample scene and plays an original percussion loop. | 11 | Pass |
| Audio stays in this tab | 5 | Pass |
| Demo works offline after your first visit | 7 | Pass |
| Free under the MIT license | 6 | Pass |
| Three scenes / one small HTML element / your audio | 10 | Pass |
| Audio scene playground | 3 | Pass |
| Choose and test a scene | 5 | Pass |
| Choose a scene, then play the sample, use a file, or allow the microphone. | 14 | Pass |
| The browser handles the audio source. | 6 | Pass |
| Play sample audio | 3 | Pass |
| Plays an original night-market rhythm. | 5 | Pass |
| Live scene | 2 | Pass |
| Ribbons | 1 | Pass |
| Lanterns | 1 | Pass |
| Horizon | 1 | Pass |
| Static poster is ready. | 4 | Pass |
| Choose audio to make it move. | 6 | Pass |
| Choose a scene | 3 | Pass |
| Intensity | 1 | Pass |
| Changes how strongly the scene responds to audio. | 8 | Pass |
| Choose audio | 2 | Pass |
| Choose audio file | 3 | Pass |
| Use microphone | 2 | Pass |
| Motion | 1 | Pass |
| System setting | 2 | Pass |
| Full motion | 2 | Pass |
| Static | 1 | Pass |
| Copy this embed | 3 | Pass |
| Copy embed | 2 | Pass |
| How it works | 3 | Pass |
| Connect audio in three steps | 5 | Pass |
| Add the element | 3 | Pass |
| Install the package and place the HTML element where the scene belongs. | 12 | Pass |
| Connect your source | 3 | Pass |
| Pass a Web Audio node after the visitor starts playback. | 10 | Pass — technical detail is introduced in the implementation step. |
| Set the fallback | 3 | Pass |
| Keep automatic motion reduction or choose the static poster. | 9 | Pass |
| Audio privacy | 2 | Pass |
| Your audio does not leave | 5 | Pass |
| The HTML element has no analytics or account system. | 9 | Pass |
| It reads levels from the browser’s audio connection and sends no audio to an API. | 15 | Pass |
| It does not start audio on page load. | 8 | Pass |
| It does not ask for microphone access by itself. | 9 | Pass |
| It does not upload or save an audio file. | 9 | Pass |
| It does not load scripts or fonts from another site. | 10 | Pass |
| Package formats | 2 | Pass |
| Prepare the package locally | 4 | Pass |
| This package name is not published to npm yet. | 9 | Pass |
| Get the release candidate from the source repository and build a local tarball. | 13 | Pass |
| The local tarball includes JavaScript for import and require, TypeScript types, element styles, and no runtime dependencies. | 17 | Pass |
| Open the source repository | 4 | Pass |
| Make page audio move a small canvas. | 7 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| (external site) | 2 | Pass |
| v0.1.2 · build 2026.08.29 | 3 | Pass |
| You are offline. | 3 | Pass |
| The demo and sample scene still work. | 7 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Audio Reactive Scene | 3 | Pass |
| Make page audio move a small canvas. | 7 | Pass |
| Audio Reactive Scene is a reusable HTML element for site owners, streamers, and event makers. | 15 | Pass |
| It draws three canvas scenes from audio already playing on a page. | 12 | Pass |
| Audio stays in the browser tab. | 6 | Pass |
| Try the sample demo. | 4 | Pass |
| The page opens the scene; choose Play sample audio to hear an original percussion loop. | 15 | Pass |
| Nothing is saved. | 3 | Pass |
| Get the release candidate | 4 | Pass |
| audio-reactive-scene is not published to npm yet. | 7 | Pass |
| Use the source repository to build and test this release candidate locally. | 12 | Pass |
| Install the generated .tgz file in a test site. | 9 | Pass |
| The tarball includes JavaScript for import and require, TypeScript types, element styles, and no runtime dependencies. | 16 | Pass |
| Use it | 2 | Pass |
| The copied example in the demo contains a complete connection. | 10 | Pass |
| Replace /your-audio-file.wav with your audio file. | 6 | Pass |
| Web Audio is the browser connection between a playing sound and the scene. | 13 | Pass |
| The visitor starts playback. | 4 | Pass |
| The HTML element does not start audio or request microphone access. | 10 | Pass |
| API reference | 2 | Pass |
| Attributes and matching properties: | 4 | Pass |
| scene: ribbons, lanterns, or horizon. | 5 | Pass |
| intensity: a number from 0 through 1. | 7 | Pass |
| motion: auto, full, or static. | 5 | Pass |
| auto shows a stable poster when the system reduces motion. | 10 | Pass |
| label: an optional accessible name for the scene. | 8 | Pass |
| Methods: | 1 | Pass |
| connect(source: AudioNode): AnalyserNode connects an existing Web Audio source. | 9 | Pass |
| disconnect(): void stops reading levels without closing the page’s audio context. | 11 | Pass |
| drawPoster(): void draws the selected deterministic poster frame. | 8 | Pass |
| defineAudioReactiveScene(tagName?: string) registers the component under the default or a custom tag. | 12 | Pass |
| Develop and verify | 3 | Pass |
| Use Node.js 20 or newer. | 5 | Pass |
| npm run build:site writes the deployable site to dist/site/, with index.html at its root. | 14 | Pass |
| npm run build also writes the library files to dist/lib/. | 10 | Pass |
| Every product claim has one tagged test in .factory/claims.json. | 9 | Pass |
| Run each listed command from a clean checkout. | 8 | Pass |
| Privacy | 1 | Pass |
| Audio processing runs locally through Web Audio. | 7 | Pass |
| The demo does not save audio or settings. | 8 | Pass |
| A service worker caches public site files after the first visit so the demo can reload offline. | 17 | Pass |
| Read the site’s privacy page. | 5 | Pass |
| Deploy and publish | 3 | Pass |
| Deploy dist/site/ as a static site. | 6 | Pass |
| The factory owns registry credentials. | 5 | Pass |
| Workers should check the tarball with npm pack --dry-run and must not publish it. | 14 | Pass |
| License | 1 | Pass |
| MIT © 2026 Sociobot (Param Factory). | 6 | Pass |
| See LICENSE. | 2 | Pass |

Claim-like copy maps to `one-click-demo`, `three-scenes-controls`, `complete-embed`, `local-only-audio`, `gesture-only-input`, `offline-reload`, `motion-reduction`, `package-formats`, `library-api`, `node-support`, `site-build-output`, `npm-unpublished`, `mit-license`, or `privacy-no-personal-data` in `.factory/claims.json`. No unlisted claim was found.

## 3. Demo and sandbox

This check passes.

- The cold root action completed in one click: it navigated to `/demo?demo=1`, showed “Demo — sample data, nothing is saved,” reported “Percussion loop is playing,” and labelled the live element “ribbons audio-reactive scene, connected to audio.”
- The first post-click phone screen contained the Play control at y=419.8–463.8, the canvas at y=537.4–742.4, and playing status at y=760.4–808.4. Desktop contained the canvas at y=430.8–645.8 and status at y=663.8–711.8.
- Direct `/demo?demo=1` is intentionally stopped until the explicit **Play sample audio** gesture. The canvas, source action, and persistent banner are immediately visible. This honors the browser gesture requirement without weakening the landing one-click path.
- Reset after playback restored Ribbons, 70% intensity, System setting/`auto` motion, stopped the source, and announced “Demo reset. Play the sample to start again.”
- Live request logging for direct-demo play and reset observed only same-origin document, JavaScript, CSS, and `/assets/night-market-loop.wav` requests; there were no fetch/XHR/API or off-origin requests. Local/session storage and IndexedDB remained empty. The service worker's public-file cache is the documented offline cache, not demo/user storage.
- The live canvas changed after sample playback. The original bundled WAV and its deterministic synthesis provenance are present in the repository and it is cached for the offline claim.

## 4. Claims and quality gates

The clean clone received `npm ci --ignore-scripts`, then every literal `test` command from `.factory/claims.json` was run independently. All passed. A subsequent clean-clone `npm test` also passed all 36 Playwright tests, which includes all 14 tagged claims.

| Claim | Result |
| --- | --- |
| one-click-demo | PASS |
| three-scenes-controls | PASS |
| complete-embed | PASS — packs, installs, serves, clicks, and observes the exact copied embed in a fresh consumer. |
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

Additional clean-clone gates passed: `npm run test:unit` (5/5), `npm run typecheck`, `npm run lint`, `npm run pack:check`, `npm test` (36/36), and `npm run build`. The site build emitted `dist/site/index.html`; the JavaScript bundle was 8.02 kB gzip. Fresh live axe scans of `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html` had zero violations.

The local newly built `index.html`, JavaScript, CSS, WAV, hero and social art, service worker, 404 assets, favicon, `robots.txt`, and sitemap all matched the current live responses by SHA-256.

## 5. Earlier findings rechecked

Every finding in `.factory/review-1.md` and `.factory/review-2.md` was verified against both current source and the live site; none is merely accepted from a prior closure record.

| Earlier finding | Current result | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | The landing and README state that the package is unpublished and provide the source/tarball workflow; `@claim:npm-unpublished` and `@claim:package-formats` pass. |
| F-1-2 | Fixed | Direct demo shows its workbench and explicit Play action; README accurately names that action. |
| F-1-3 | Fixed | The landing action reaches a playing, visible scene in the first phone and desktop viewport. |
| F-1-4 | Fixed | `@claim:complete-embed` runs the exact displayed copy in a packed, installed consumer and observes a changing canvas. |
| F-1-5 | Fixed | API, Node, output, package, and publication statements have matching manifest entries and passing tagged tests. |
| F-1-6 | Fixed | Source and route test focus the new heading or hash target; Home and demo-exit paths are covered. |
| F-1-7 | Fixed | Live routes expose specific title, description, canonical, OG, and Twitter metadata; the static 404 has its own metadata. |
| F-1-8 | Fixed | Both not-found forms use “This page does not exist.” |
| F-1-9 | Fixed | The 404 recovery action is “Open the sample playground” and targets `/demo?demo=1`. |
| F-1-10 | Fixed | “Audio scene playground” names the section. |
| F-1-11 | Fixed | “Audio privacy” names the section. |
| F-1-12 | Fixed | “Package formats” names the section. |
| F-1-13 | Fixed | The landing fact gives the testable first-visit offline condition. |
| F-1-14 | Fixed | The landing and README consistently use “HTML element” for the reusable browser element; platform types remain in implementation/API material. |
| F-1-15 | Fixed | The demo exit says “Open package instructions,” matching `/#install`. |
| F-1-16 | Fixed | Live mobile actions are at least 44 px and supporting copy is 16 px. |
| F-1-17 | Fixed | No unusable registry-install control remains. |
| F-2-1 | Fixed | The former string check is replaced by executable packed-consumer proof in `tests/claims.spec.ts`. |
| F-2-2 | Fixed | Current source and live copy use the plain, consistent “HTML element” term. |
| F-2-3 | Fixed | The demo uses shipped `night-market-loop.wav`, an original percussion/bass/bell sample with source and provenance. |
| F-2-4 | Fixed | Current banner label and target accurately state the result. |

The associated earlier QA checks for above-fold desktop content, hidden file-picker focus, shared 404 shell, mobile text size, 200% reflow, and mobile scroll regions also pass in the clean full suite.

## 6. Structure, routes, accessibility, and visual identity

- `/`, `/demo?demo=1`, `/privacy`, `/terms`, SPA not-found, and `/404.html` have `lang=en`, one `<main>`, one `<h1>`, route-specific titles, descriptions, canonicals, OG/Twitter data, favicon, skip link, consistent header/footer, Privacy/Terms links, and no axe violations.
- The titles follow the requested pattern: “Audio Reactive Scene — Make audio move a canvas,” “Demo — Audio Reactive Scene,” “Privacy — Audio Reactive Scene,” “Terms — Audio Reactive Scene,” and “Page not found — Audio Reactive Scene.”
- Every root-page internal and external link returned HTTP 200. `robots.txt`, sitemap, social card, favicon, apple-touch icon, and all crawled routes load. `/missing-signal` correctly returns HTTP 404 with the designed recovery page.
- Source route handling uses History API, restores hash targets/back state, moves focus to the route target, and announces the route. The cold-document focus policy leaves Tab at the skip link first, as verified in the suite.
- Live response policy provides the self-only CSP, `frame-ancestors 'none'` response directive, `nosniff`, strict referrer policy, HSTS, same-origin COOP, and microphone-only permission policy. No runtime CDN, analytics, or provider key is present.
- The visual system is distinct rather than generic: original night-market artwork, ink/paper/cyan/coral/marigold palette, sign-like condensed display type, mono control type, cropped double-keyline controls, and canvas scenes follow the documented “night-market signal booth” direction. Reduced-motion and static-poster behavior were tested.

## 7. Missed leverage

No missing AI, import/export, or sync feature is implied by the brief. The valuable real-world integration path is the complete copied embed, and it now has executable fresh-consumer proof. Adding AI would be decorative rather than useful for this local Web Audio library.

## What would make this perfect

The reviewed candidate already meets this review's zero-finding standard. Preserve the existing claim-to-test discipline and rerun this complete cold/live/clean-clone review after any release, dependency, routing, copy, or deployment change.
