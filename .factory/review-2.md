# Adversarial first-read review 2 — Audio Reactive Scene

Reviewed 2026-08-29 against commit `a95c30d3af2aec4a3350262297b24aacb722a0b5` and the live deployment at `https://audio-reactive-scene.sociobot.in`. Browser checks used fresh Chromium contexts at 390 × 844 and 1365 × 768. Product code was not changed.

## Verdict: FAIL

There are four blocking findings. The landing first read, live demo layout, isolated storage behaviour, declared claim commands, routes, metadata, links, accessibility baseline, and product-specific visual identity all pass. A release cannot pass while the copied integration is not executed by its claim test, the sample is a synthetic oscillator signal rather than realistic sample audio, and two prior copy closures are not actually present.

## Findings, ordered by severity

### F-2-1 — BLOCKING — The copied integration is still not proved to work (reopens F-1-4)

- Exact copy/location: README, “The copied example in the demo contains a complete connection.” Demo control, “Copy embed.” Claim `complete-embed` in `.factory/claims.json`.
- Evidence: `tests/claims.spec.ts:53–63` only asserts that the displayed code contains strings such as `scene.connect(source)` and then accepts either clipboard success or failure. It never serves the copied snippet in a clean consumer, performs the required user playback action, or observes the component connecting and changing frames. The `@claim:complete-embed` command passes, but it does not prove its observable promise.
- Why this matters: copying a working audio connection is the library’s most direct real-world job. A string-presence assertion can pass when the example is syntactically invalid, imports the unpublished package incorrectly, or never reacts to audio.
- Concrete fix: pack the library, install it in a fresh temporary consumer, serve the exact copied HTML and a shipped local sample sound, click its audio control, then assert the component reports a connected source and its canvas changes between frames. Make this the `@claim:complete-embed` test.
- History: `.factory/polish-1.md` marked F-1-4 fixed, but it cites this same non-executing string test. The required live-and-code recheck shows the prior finding is only half-fixed.

### F-2-2 — BLOCKING — The cold landing still uses unexplained and inconsistent component jargon (reopens F-1-14)

- Exact copy/location: live landing eyebrow, “A web component for page audio”; landing step, “Install the package and place the custom element where the scene belongs”; README, “Audio Reactive Scene is a reusable HTML element …”.
- Evidence: at both cold first viewports the only product-type label is “web component.” The source at `site/main.ts:113` still uses that label. The same thing is called a “web component,” “custom element,” and “reusable HTML element.”
- Why this matters: the named audience includes site owners, streamers, and event makers, who do not necessarily know browser-platform terminology. The prior repair record says the first-read copy was changed to introduce a “reusable HTML element”; that change is not live.
- Concrete fix: use one plain term consistently. Rewrite the eyebrow as “A reusable HTML element for page audio,” and use “HTML element” in the landing steps. Keep `AudioNode` and web-component terminology inside the API reference only.
- History: `.factory/polish-1.md` records F-1-14 as fixed. It is not fixed in the live page or source, so it reopens as blocking under this review’s history rule.

### F-2-3 — BLOCKING — The demo’s “sample data” is a test tone, not realistic audio

- Exact copy/location: landing action note, “It opens the sample scene and starts a local sound loop”; demo note, “Starts the bundled local loop.”
- Evidence: `site/main.ts:187–216` makes the sample from three continuous oscillators at 110, 164.81, and 220 Hz plus a 1.25 Hz pulse. No realistic bundled audio asset exists. The demo therefore only proves a predictable synthetic signal, not how the scene responds to the sort of music, stream, or event audio described in the brief.
- Why this matters: the required one-click demo must use realistic, opinionated sample data. A first-time visitor cannot judge the library’s result with a realistic source from this four-oscillator test signal.
- Concrete fix: ship a short original, locally cached audio clip with changing rhythm and frequency content, play it after the landing gesture, and state what it is. Add a claim assertion that the demo uses that bundled sample and that it remains available offline.

### F-2-4 — BLOCKING — The demo-exit control has the old vague label (reopens F-1-15)

- Exact copy/location: persistent live demo banner, “Start for real.” It links to `/#install`.
- Evidence: fresh mobile and desktop demo contexts exposed this label; source `site/main.ts:61` renders it; the browser regression test also explicitly expects “Start for real.” The action only leaves the sandbox and scrolls to package instructions.
- Why this matters: “Start for real” does not name the result and does not start a project. A visitor cannot tell whether it will install, publish, make an account, or discard the demo.
- Concrete fix: change the link label to “Open package instructions” (or “Leave demo and open package instructions”) and update the test.
- History: `.factory/polish-1.md` says F-1-15 was renamed to “Leave demo.” That is not present in the deployed product or source, so the prior finding reopens as blocking.

## 1. Cold first screen

This check passes.

At 390 × 844, before scrolling, the page showed the h1 “Make your audio move a scene,” the audience sentence, “For site owners, streamers, and event makers who need a restrained visual without sending audio away,” the action “Try it with sample data,” and all three facts. The same required content was visible at 1365 × 768. There were no console or page errors.

In first-read words:

- What it does: adds a small visual scene that reacts to audio on a webpage.
- Who it is for: site owners, streamers, and event makers.
- What to click first: “Try it with sample data,” which opens a sample scene and starts the loop.

The jargon concern in F-2-2 does not prevent that basic answer, but it does prevent the first screen from meeting the attached plain-words rule for its nontechnical audience.

## 2. Copy audit

Counts are whitespace-separated words. Code samples are excluded because they are executable code rather than visitor prose. No listed sentence exceeds 22 words and no banned marketing adjective appears. F-2-2 flags the inconsistent jargon; F-2-4 flags the non-result-naming control.

### Landing and demo copy

| Copy | Words | Review result |
| --- | ---: | --- |
| A web component for page audio | 6 | F-2-2 jargon |
| Make your audio move a scene | 6 | Pass |
| For site owners, streamers, and event makers who need a restrained visual without sending audio away. | 16 | Pass |
| It opens the sample scene and starts a local sound loop. | 11 | F-2-3 sample is synthetic |
| Audio stays in this tab | 5 | Pass |
| Demo works offline after your first visit | 7 | Pass |
| Free under the MIT license | 5 | Pass |
| Three scenes / one small component / your audio | 9 | Pass |
| Audio scene playground | 3 | Pass |
| Choose and test a scene | 5 | Pass |
| Choose a scene, then play the sample, use a file, or allow the microphone. | 14 | Pass |
| The browser handles the audio source. | 6 | Pass |
| How it works | 3 | Pass |
| Connect audio in three steps | 5 | Pass |
| Add the element | 3 | Pass |
| Install the package and place the custom element where the scene belongs. | 12 | F-2-2 term inconsistency |
| Connect your source | 3 | Pass |
| Pass a Web Audio node after the visitor starts playback. | 10 | Pass in API context |
| Set the fallback | 3 | Pass |
| Keep automatic motion reduction or choose the static poster. | 9 | Pass |
| Audio privacy | 2 | Pass |
| Your audio does not leave | 5 | Pass |
| The component has no analytics or account system. | 8 | Pass |
| It reads levels from the browser’s audio connection and sends no audio to an API. | 15 | Pass |
| It does not start audio on page load. | 8 | Pass |
| It does not ask for microphone access by itself. | 9 | Pass |
| It does not upload or save an audio file. | 9 | Pass |
| It does not load scripts or fonts from another site. | 10 | Pass |
| Package formats | 2 | Pass |
| Prepare the package locally | 4 | Pass |
| This package name is not published to npm yet. | 9 | Pass |
| Get the release candidate from the source repository and build a local tarball. | 13 | Pass |
| The local tarball includes JavaScript for import and require, TypeScript types, component styles, and no runtime dependencies. | 17 | Pass |
| Open the source repository | 4 | Pass |
| Sample audio scene | 3 | Pass |
| Try sample audio | 3 | Pass |
| Choose Play sample audio to hear the local loop and watch the scene respond. | 14 | F-2-3 sample is synthetic |
| Play sample audio | 3 | Pass |
| Starts the bundled local loop. | 5 | F-2-3 sample is synthetic |
| Live scene | 2 | Pass |
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
| Copy this embed | 3 | F-2-1 unproved outcome |
| Copy embed | 2 | F-2-1 unproved outcome |
| Sample audio is playing. | 4 | Pass |
| Press the button again to restart it. | 7 | Pass |
| The sample could not start. | 5 | Pass |
| Check browser audio permission and try again. | 7 | Pass |
| That file is not recognised as audio. | 7 | Pass |
| Choose an MP3, WAV, or OGG file. | 7 | Pass |
| Playing [file name] in this tab. | 6 | Pass |
| The file is not uploaded. | 5 | Pass |
| The audio file could not play. | 6 | Pass |
| Choose another audio file. | 4 | Pass |
| This browser cannot provide microphone audio. | 6 | Pass |
| Use the sample or an audio file. | 7 | Pass |
| Microphone levels are active in this tab. | 7 | Pass |
| Nothing is recorded or uploaded. | 5 | Pass |
| Microphone access was not allowed. | 5 | Pass |
| Use the sample or choose an audio file. | 8 | Pass |
| Embed copied. | 2 | F-2-1 unproved copied result |
| Copy was blocked. | 3 | Pass |
| Select the code and copy it. | 6 | Pass |
| Demo reset. | 2 | Pass |
| Play the sample to start again. | 6 | Pass |
| Demo — sample data, nothing is saved | 7 | Pass |
| Reset demo | 2 | Pass |
| Start for real | 3 | F-2-4 not result-naming |
| Make page audio move a small canvas. | 7 | Pass |
| You are offline. | 3 | Pass |
| The demo and sample scene still work. | 7 | Pass |

### README copy

| Copy | Words | Review result |
| --- | ---: | --- |
| Make page audio move a small canvas. | 7 | Pass |
| Audio Reactive Scene is a reusable HTML element for site owners, streamers, and event makers. | 15 | F-2-2 term inconsistency with landing |
| It draws three canvas scenes from audio already playing on a page. | 12 | Pass |
| Audio stays in the browser tab. | 6 | Pass |
| Try the sample demo. | 4 | Pass |
| The page opens the sample scene; choose Play sample audio to start its local loop. | 15 | F-2-3 sample is synthetic |
| Nothing is saved. | 3 | Pass |
| audio-reactive-scene is not published to npm yet. | 7 | Pass |
| Use the source repository to build and test this release candidate locally. | 12 | Pass |
| Install the generated .tgz file in a test site. | 9 | Pass |
| The tarball includes JavaScript for import and require, TypeScript types, component styles, and no runtime dependencies. | 16 | Pass |
| The copied example in the demo contains a complete connection. | 10 | F-2-1 unproved outcome |
| Replace /your-audio-file.mp3 with your audio file. | 6 | Pass |
| Web Audio is the browser connection between a playing sound and the scene. | 13 | Pass |
| The visitor starts playback. | 4 | Pass |
| The component does not start audio or request microphone access. | 10 | Pass |
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
| Use Node.js 20 or newer. | 5 | Pass |
| npm run build:site writes the deployable site to dist/site/, with index.html at its root. | 14 | Pass |
| npm run build also writes the library files to dist/lib/. | 10 | Pass |
| Every product claim has one tagged test in .factory/claims.json. | 9 | Pass |
| Run each listed command from a clean checkout. | 8 | Pass |
| Audio processing runs locally through Web Audio. | 7 | Pass |
| The demo does not save audio or settings. | 8 | Pass |
| A service worker caches public site files after the first visit so the demo can reload offline. | 17 | Pass |
| Read the site’s privacy page. | 5 | Pass |
| Deploy dist/site/ as a static site. | 6 | Pass |
| The factory owns registry credentials. | 5 | Pass |
| Workers should check the tarball with npm pack --dry-run and must not publish it. | 14 | Pass |
| MIT © 2026 Sociobot (Param Factory). | 6 | Pass |
| See LICENSE. | 2 | Pass |

All claim-like product statements map to an entry in `.factory/claims.json`; F-2-1 is a test-quality gap, not a missing manifest entry.

## 3. Demo and sandbox

- One-click entry: PASS. Clicking “Try it with sample data” from cold root navigated to `/demo?demo=1`, shows the persistent “Demo — sample data, nothing is saved” banner, and starts the local source.
- First post-click screen: PASS. At 390 px the component was visible from y=523–724 and the playing status from y=744–840. At desktop the component was visible from y=433–644 and status from y=664–712.
- Reset: PASS. After changing settings and starting the source, “Reset demo” restored the default scene, 70% intensity, System setting, stopped the source, and gave the actionable reset status.
- Isolation: PASS. Live demo actions left seeded `real:sentinel` localStorage, sessionStorage, IndexedDB, and OPFS entries unchanged. The demo added none.
- Privacy/network: PASS. The complete live play/reset flow produced only same-origin document, CSS, and JS requests; no fetch/XHR/API or off-origin request occurred. No console errors occurred.
- Offline claim: PASS in the clean-sandbox declared test. A primed demo reloaded after `context.setOffline(true)`.
- Sample quality: FAIL. See F-2-3.

## 4. Claims and quality-gate audit

A fresh local clone at `/tmp/audio-reactive-scene-review2.fjJMgc` received `npm ci` and ran every literal command in `.factory/claims.json` sequentially. All 14 commands passed; no declared command failed.

| Claim | Result |
| --- | --- |
| one-click-demo | PASS |
| three-scenes-controls | PASS |
| complete-embed | PASS command; insufficient observable assertion (F-2-1) |
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

Additional clean-clone gates passed: `npm test` (36 Playwright tests), `npm run lint`, `npm run typecheck`, `npm run test:unit` (5 tests), and `npm run pack:check`. `npm test` rebuilt `dist/lib` and `dist/site` successfully.

## 5. Prior-finding recheck

The earlier `.factory/review-1.md`, `.factory/polish-1.md`, and current/previous handoff record were read. The table confirms actual live and source state, rather than accepting a prior status marker.

| Prior ID | Current result | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | The unavailable npm command was removed; the site and README honestly describe the unpublished release candidate and local tarball. |
| F-1-2 | Fixed | Direct `/demo?demo=1` presents the workbench and a visible Play action; README accurately says to choose that action. |
| F-1-3 | Fixed | Canvas and sample-playing status are in the first mobile and desktop demo viewports. |
| F-1-4 | **BLOCKING — reopened as F-2-1** | Claim test reads strings rather than running copied integration in a clean consumer. |
| F-1-5 | Fixed | The listed API, Node, site-build, package, and publication statements have manifest entries and tagged tests. |
| F-1-6 | Fixed | Existing route test and source focus the destination h1 or hash target after normal transitions. |
| F-1-7 | Fixed | Live demo, privacy, terms, and 404 routes expose route-specific titles, descriptions, canonicals, and OG/Twitter metadata. |
| F-1-8 | Fixed | Live 404 h1 is “This page does not exist.” |
| F-1-9 | Fixed | 404 recovery opens `/demo?demo=1`. |
| F-1-10 | Fixed | Section label is “Audio scene playground.” |
| F-1-11 | Fixed | Section label is “Audio privacy.” |
| F-1-12 | Fixed | Section label is “Package formats.” |
| F-1-13 | Fixed | Landing fact states “Demo works offline after your first visit.” |
| F-1-14 | **BLOCKING — reopened as F-2-2** | Landing still says “web component,” and the same concept has three names. |
| F-1-15 | **BLOCKING — reopened as F-2-4** | Live banner and source still say “Start for real.” |
| F-1-16 | Fixed | Banner action targets remain at least 44 px and computed mobile action text is 16 px. |
| F-1-17 | Fixed | No unavailable install-copy action remains. |
| QA2-01 through QA2-04 | Fixed | Existing viewport, file-picker, shared-404-shell, and mobile-text checks pass in the clean suite. |

## 6. Structure, accessibility, routing, and links

- PASS: root, demo, privacy, terms, SPA not-found, and static 404 each have one h1, one main, `lang=en`, title, description, canonical, OG/Twitter metadata, favicon, shared header/footer, skip link, and privacy/terms links.
- PASS: `/missing-signal` returns HTTP 404 and provides a designed recovery path. `/robots.txt`, `/sitemap.xml`, favicon, apple touch icon, and social card all return 200.
- PASS: deep links, Back navigation, and route focus are covered by the full suite. The live demo exit lands at the package anchor; only its label fails in F-2-4.
- PASS: all internal links and the two external links (source repository and Param Factory) returned 200. The deployment intentionally does not expose its `staticwebapp.config.json` document (404).
- PASS: full local axe route coverage found no serious or critical violations; cold live browser sessions reported no console errors. Keyboard controls, focus styling, 44 px targets, reduced motion, 200% text reflow, and 390 px layout are covered by passing tests.
- PASS: response headers use a self-only CSP with `frame-ancestors 'none'`, `nosniff`, strict referrer policy, HSTS, same-origin COOP, and microphone-only permission policy.
- PASS: visual identity is distinct. The ink, paper, cyan, coral, and marigold control-booth palette; cropped/double-keyline controls; condensed sign typography; and original night-market art fit the design thesis and do not resemble a generic SaaS template.

## 7. Missed leverage

No AI, import/export, or sync feature is implied by this focused local Web Audio library. The clearly implied additional value is an executable copy-paste proof for real host-page audio; that is F-2-1. An AI feature would be decorative and should not be added.

## What would make this perfect

Ship and test an original realistic local audio sample; execute the exact copied embed in a packed fresh consumer and observe it react; replace the landing’s inconsistent platform jargon with one plain term; and rename the demo exit to its actual result. Then run this complete review again in fresh browser contexts and clean clone. A perfect result has zero findings and no untested claim.
