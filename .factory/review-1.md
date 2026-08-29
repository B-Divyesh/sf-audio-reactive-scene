# Adversarial first-read review 1 — Audio Reactive Scene

Reviewed 2026-08-29 against commit `4de68a02363e1597f8fd4b9cc3e8d34922bcfa98` and `https://audio-reactive-scene.sociobot.in` in fresh Chromium contexts at 390 × 844 and 1365 × 768.

## Verdict: FAIL

There are four blocking findings, three major findings, and ten minor findings. The landing first screen is clear, the visual identity is distinct, the sandbox does not alter browser data, and all declared tests pass. The product still fails its real job because the advertised npm package does not exist, the documented direct demo is inactive, the running demo is below the first post-click screen, and the copied embed cannot react to audio.

## Findings, ordered by severity

### F-1-1 — BLOCKING — The advertised package cannot be installed

- Exact copy/location: landing `Install it in one line` → `npm install audio-reactive-scene`; README `Install` uses the same command; `.factory/claims.json` says, “The package ships ESM, CommonJS, TypeScript declarations, component styles, and no runtime dependencies.”
- Evidence: `npm view audio-reactive-scene version --json` and `npm install audio-reactive-scene` in a fresh temporary directory both returned `E404 Not Found` from `registry.npmjs.org`.
- Impact: the real job is to add this library to a site. A visitor can try the playground but cannot obtain the product by following its primary installation instruction.
- Fix: publish the tested version, link the npm package and source repository from the site, then add a claim test that installs the published version into a fresh project and exercises both ESM and CommonJS. Until publication, replace the command with an honest availability statement.
- History: this reopens prior finding `QA-03`; the `package-formats` test proves local build files exist, not that the package “ships.”

### F-1-2 — BLOCKING — The documented direct demo opens a static poster

- Exact copy/location: README: “Try the sample demo. It starts a local three-tone loop in one click.” `.factory/demo.md` names `/demo` as the verifier URL.
- Evidence: a fresh direct navigation to `/demo` showed “Static poster is ready. Choose audio to make it move,” the component label said “showing a static poster,” and canvas captures 400 ms apart were identical. Only client-side navigation from the landing action passes `autoStart=true`. No claim entry or tagged assertion covers the README’s “three-tone” detail.
- Impact: the README’s one click is the click that opens `/demo`; it does not start the promised sample. Catalogs and verifiers using the documented URL see an inactive product.
- Fix: put the playground and “Play sample audio” first on a direct `/demo` load, and rewrite README to say that this button starts it. Keep the landing page’s gesture-driven SPA action as the tested one-click path. Add a `page.goto('/demo')` claim test and a separate external-link test for the README path.
- History: this also reopens `QA-03`; `@claim:one-click-demo` tests only the landing SPA link even though the claim’s `where` includes README.

### F-1-3 — BLOCKING — The first screen after the demo click does not show the product

- Exact location: `/demo` immediately after “Try it with sample data.”
- Evidence: at 390 × 844 the playground starts at y=1307, the canvas at y=1664, and status at y=2550. At 1365 × 768 the playground starts at y=828, the canvas at y=1204, and status at y=2163. Both viewports repeat the landing hero instead of showing the running scene. The status reports playback and the canvas changes, but neither outcome is visible without substantial scrolling.
- Impact: the mandatory first post-click screen does not already look like the product being used.
- Fix: give `/demo` a compact demo heading followed immediately by the banner, live canvas, playing status, and controls. Assert that the canvas and “Sample audio is playing” status intersect both first viewports. Replace or honestly label the three-oscillator test signal with a realistic, original short audio sample.

### F-1-4 — BLOCKING — “Copy embed” copies a component that never receives audio

- Exact copy/location: playground: “Copy this embed” / “Copy embed.” The copied snippet imports the package and adds `<audio-reactive-scene>`, but never creates or passes an `AudioNode`.
- Evidence: `AudioReactiveScene` remains a static poster until host code calls `connect(source)`. The copied snippet has no audio element, play gesture, `AudioContext`, source node, or `connect` call.
- Impact: the brief promises a copyable audio-reactive component. The most direct handoff action produces a non-reactive result.
- Fix: copy a complete minimal example that includes a user-started audio source and `scene.connect(source)`, or rename this action “Copy component markup” and place a tested complete integration directly beside it. Add a claim that installs the package in a fresh project, runs the copied example, and observes a connected, changing scene.

### F-1-5 — MAJOR — README API and build promises are absent from the claims manifest

- Exact quotes: “`label`: an optional accessible label for the scene”; “`connect(source: AudioNode): AnalyserNode` connects an existing Web Audio node”; “`disconnect(): void` stops reading levels without closing the host's audio context”; “`drawPoster(): void` draws the selected scene's deterministic poster frame”; and “`defineAudioReactiveScene(tagName?: string)` registers the component under the default or a custom tag.”
- Further unlisted quotes: “Use Node.js 20 or newer”; “`npm run build:site` writes the deployable documentation site to `dist/site/`”; and “`npm run build` also writes ESM, CommonJS, and declarations to `dist/lib/`.”
- Additional false copy: “The browser test suite checks every public claim from `/demo`.”
- Evidence: `.factory/claims.json` has no public-library API, supported-Node, or site-build claim. The UI tests exercise parts of `connect` and `disconnect`, but no tagged test asserts the documented return value, context ownership, custom label, deterministic poster, custom registration name, Node compatibility, or site output.
- Impact: library users are asked to rely on unlisted and incompletely tested API behavior.
- Fix: add `library-api`, `node-support`, and `site-build-output` claims with tagged clean-consumer/build tests, or remove unsupported promises. Change the “every public claim” sentence until the manifest is exhaustive.
- History: prior `QA-03` remains BLOCKING because claim coverage is still incomplete despite all listed commands passing.

### F-1-6 — MAJOR — Normal navigation back to Home loses focus

- Exact location: Privacy wordmark → Home and demo “Start for real” → Home.
- Evidence: both transitions updated the URL and live region, but `document.activeElement` became `<body>`. In code, `route()` focuses the new h1 only when `!isHome || autoStart`.
- Impact: a keyboard or screen-reader user is not placed at the new page heading as required. The anchored browser-Back case is fixed, but ordinary Home navigation is not.
- Fix: focus the home h1 after every non-hash route change, including wordmark and demo exit. Add live tests for both transitions.

### F-1-7 — MAJOR — Route metadata describes the landing page on other routes

- Exact location: `/demo`, `/privacy`, and `/terms` retain landing meta description “Add a small, controllable audio-reactive scene…” and OG/Twitter title “Audio Reactive Scene — Make audio move a canvas.” The static 404 has no canonical, Open Graph, or Twitter metadata.
- Impact: shared demo and legal URLs are mislabeled in search/social previews, and the 404 does not meet the declared metadata skeleton.
- Fix: update description, canonical, OG, and Twitter fields from a per-route metadata map; add appropriate noindex/share metadata to the static 404.

### F-1-8 — MINOR — The 404 headline is a metaphor

- Exact copy/location: 404 h1: “This signal went quiet.”
- Impact: the heading does not name the page state out of context and violates the no-metaphor copy rule.
- Rewrite: “This page does not exist.”

### F-1-9 — MINOR — The 404 recovery link does not go to the playground

- Exact copy/location: “Return to the playground” links to `/`.
- Impact: `/` opens at the landing hero, while the playground is far below it.
- Fix: link to `/demo` and say “Open the sample playground,” or link to `/#playground` and say “Go to the playground.”

### F-1-10 — MINOR — “The working component” is a generic decorative label

- Exact copy/location: section kicker above “Shape the scene here.”
- Impact: it would fit any component product and does not name this section independently.
- Rewrite: “Audio scene playground.”

### F-1-11 — MINOR — “Clear boundaries” is a generic decorative label

- Exact copy/location: section kicker above “Your audio does not leave.”
- Impact: it does not state which boundary is being explained.
- Rewrite: “Audio privacy.”

### F-1-12 — MINOR — “Open package” is unclear out of context

- Exact copy/location: section kicker above “Install it in one line.”
- Impact: “open” could mean launch, open-source, or unpack.
- Rewrite: “Package formats.”

### F-1-13 — MINOR — “Works after the first visit” omits the subject and condition

- Exact copy/location: landing first-screen fact.
- Impact: a visitor must infer that the demo works offline, rather than the package or audio working in some unspecified way.
- Rewrite: “Demo works offline after your first visit.”

### F-1-14 — MINOR — Unexplained jargon weakens the nontechnical path

- Exact copy/location: “A web component for page audio,” “Pass a Web Audio node,” “browser audio graph,” “API,” and “ESM, CommonJS, TypeScript declarations… runtime dependencies.” README also opens with “typed web component.”
- Impact: the first named audiences include site owners and event makers, but these terms are not defined before use.
- Fix: introduce the product as “a reusable HTML element for websites,” explain Web Audio once, and label ESM/CommonJS as package formats for developers. Keep exact API type names inside the API reference.

### F-1-15 — MINOR — “Start for real” neither names nor starts a result

- Exact copy/location: demo banner action “Start for real.”
- Evidence: it stops the source and returns to the top of the landing page.
- Impact: the label suggests starting a real project, but no project or installation begins.
- Rewrite: “Leave demo” for the current destination, or link to the install section and say “Install the package.”

### F-1-16 — MINOR — Demo banner actions use 13.44 px text on mobile

- Exact location: “Reset demo” and “Start for real” at 390 × 844.
- Evidence: both targets are 44 px high, but computed text size is 13.44 px while surrounding functional text is 16 px.
- Impact: the two controls that explain and exit sandbox mode are harder to read than the repaired mobile copy.
- Fix: set the banner control text to at least 16 px at the mobile breakpoint.

### F-1-17 — MINOR — “Copy command” gives no result or error

- Exact copy/location: install section button “Copy command.”
- Evidence: unlike “Copy embed,” it has no live result node and its clipboard promise has no error handler.
- Impact: the user cannot confirm success, and clipboard rejection has no actionable recovery message.
- Fix: announce “Install command copied.” on success and “Copy was blocked. Select the command and copy it.” on failure; add a tagged claim if this remains a public action.

## 1. Cold first screen

The landing first screen itself passes on both tested viewports.

- What it does: a reusable component makes page audio move a visual scene. Exact copy: “A web component for page audio” and “Make your audio move a scene.”
- For whom: “site owners, streamers, and event makers.”
- First action: “Try it with sample data.” Adjacent copy says, “It opens the playground and starts a local sound loop.”

At 390 × 844, the h1, audience sentence, action, explanation, and all three facts are visible before scrolling. At 1365 × 768, the last fact ends at y=704. No console or page errors occurred. The action’s post-click result fails separately in F-1-3.

## 2. Copy audit

Counts use whitespace-separated words. No landing or README sentence exceeds 22 words, and no banned marketing word appears. Findings F-1-8 and F-1-10 through F-1-15 cover the metaphor, generic labels, ambiguity, inconsistent action result, and jargon.

### Landing prose, facts, and status copy

| Copy | Words |
| --- | ---: |
| A web component for page audio | 6 |
| For site owners, streamers, and event makers who need a restrained visual without sending audio away. | 16 |
| It opens the playground and starts a local sound loop. | 10 |
| Audio stays in this tab | 5 |
| Works after the first visit | 5 |
| Free under the MIT license | 5 |
| Pick a look. | 3 |
| Play the bundled sample, choose a file, or allow the microphone. | 11 |
| The browser handles the selected audio source. | 7 |
| Static poster is ready. | 4 |
| Choose audio to make it move. | 6 |
| Changes how strongly the scene responds to audio. | 8 |
| Install the package and place the custom element where the scene belongs. | 12 |
| Pass a Web Audio node after the visitor starts playback. | 10 |
| Keep automatic motion reduction or choose the static poster. | 9 |
| The component has no analytics or account system. | 8 |
| It reads levels from the browser audio graph and sends no audio to an API. | 15 |
| It does not start audio on page load. | 8 |
| It does not ask for microphone access by itself. | 9 |
| It does not upload or save an audio file. | 9 |
| It does not load scripts or fonts from another site. | 10 |
| The package ships ESM, CommonJS, TypeScript declarations, component styles, and no runtime dependencies. | 13 |
| Make page audio move a small canvas. | 7 |
| You are offline. | 3 |
| The demo and sample scene still work. | 7 |

### Landing headings, labels, and actions

| Copy | Words | Result |
| --- | ---: | --- |
| Make your audio move a scene | 6 | Clear h1 |
| Try it with sample data | 5 | Clear prescribed demo action |
| Three scenes / one small component / your audio | 9 | Informative art label |
| The working component | 3 | Flagged F-1-10 |
| Shape the scene here | 4 | Clear section heading |
| Choose a scene | 3 | Clear control label |
| Ribbons / Lanterns / Horizon | 1 each | Clear tab choices |
| Choose audio | 2 | Clear control label |
| Play sample audio | 3 | Result-naming action |
| Choose audio file | 3 | Result-naming action |
| Use microphone | 2 | Result-naming action |
| Motion | 1 | Clear control group |
| System setting / Full motion / Static | 2 / 2 / 1 | Clear choices in context |
| Copy this embed / Copy embed | 3 / 2 | Wording is clear; result is incomplete in F-1-4 |
| How it works / Connect audio in three steps | 3 / 5 | Clear headings |
| Add the element / Connect your source / Set the fallback | 3 each | Clear step headings |
| Clear boundaries | 2 | Flagged F-1-11 |
| Your audio does not leave | 5 | Clear privacy heading |
| Open package | 2 | Flagged F-1-12 |
| Install it in one line | 5 | Clear but currently false in practice; F-1-1 |
| Copy command | 2 | Clear result; missing feedback in F-1-17 |

### Conditional landing/playground messages

| Copy | Words |
| --- | ---: |
| Sample audio is playing. | 4 |
| Press the button again to restart it. | 7 |
| The sample could not start. | 5 |
| Check browser audio permission and try again. | 7 |
| That file is not recognised as audio. | 7 |
| Choose an MP3, WAV, or OGG file. | 7 |
| Playing [file name] in this tab. | 6 |
| The file is not uploaded. | 5 |
| The audio file could not play. | 6 |
| Choose another audio file. | 4 |
| This browser cannot provide microphone audio. | 6 |
| Use the sample or an audio file. | 7 |
| Microphone levels are active in this tab. | 7 |
| Nothing is recorded or uploaded. | 5 |
| Microphone access was not allowed. | 5 |
| Use the sample or choose an audio file. | 8 |
| Embed copied. | 2 |
| Copy was blocked. | 3 |
| Select the code and copy it. | 6 |
| Demo reset. | 2 |
| Play the sample to start again. | 6 |

### README sentences and sentence-like instructions

| Copy | Words |
| --- | ---: |
| Make page audio move a small, private canvas. | 8 |
| Audio Reactive Scene is a typed web component for indie sites, streams, and event pages. | 15 |
| It ships three canvas scenes, an intensity control, automatic motion reduction, and a static poster. | 15 |
| Audio stays inside the browser tab. | 6 |
| The package has no runtime dependencies. | 6 |
| Try the sample demo. | 4 |
| It starts a local three-tone loop in one click. | 9 |
| Nothing is saved. | 3 |
| The package ships ESM, CommonJS, TypeScript declarations, component styles, and no runtime dependencies. | 13 |
| Import the package and add the element: | 7 |
| Connect the page's audio after a visitor starts playback: | 9 |
| The component never starts audio or requests microphone permission. | 9 |
| The host page owns the source and user gesture. | 9 |
| Attributes and matching properties: | 4 |
| `scene`: `ribbons`, `lanterns`, or `horizon`. | 5 |
| `intensity`: a number from `0` through `1`. | 7 |
| `motion`: `auto`, `full`, or `static`. | 5 |
| `auto` shows a stable poster when the system reduces motion. | 10 |
| `label`: an optional accessible label for the scene. | 8 |
| Methods: | 1 |
| `connect(source: AudioNode): AnalyserNode` connects an existing Web Audio node. | 9 |
| `disconnect(): void` stops reading levels without closing the host's audio context. | 11 |
| `drawPoster(): void` draws the selected scene's deterministic poster frame. | 9 |
| `defineAudioReactiveScene(tagName?: string)` registers the component under the default or a custom tag. | 12 |
| Use Node.js 20 or newer. | 5 |
| `npm run build:site` writes the deployable documentation site to `dist/site/`, with `index.html` at that root. | 15 |
| `npm run build` also writes ESM, CommonJS, and declarations to `dist/lib/`. | 11 |
| The browser test suite checks every public claim from `/demo`, including offline reload, same-origin requests, scene controls, package formats, and reduced motion. | 22 |
| See `.factory/claims.json` for the commands and evidence paths. | 8 |
| Audio processing runs locally through Web Audio. | 7 |
| The demo does not save audio or settings. | 8 |
| A service worker caches public files after the first visit so the demo can reload offline. | 16 |
| Read the site's privacy page for details. | 7 |
| Deploy the contents of `dist/site/` as a static site. | 9 |
| The factory owns registry credentials; workers should check the tarball with `npm pack --dry-run` and must not publish it. | 19 |
| MIT © 2026 Sociobot (Param Factory). | 6 |
| See `LICENSE`. | 2 |

README headings are “Audio Reactive Scene,” “Install,” “Use it,” “API,” “Develop and verify,” “Privacy,” “Deploy and publish,” and “License.” Each names its section. The API and package jargon needs the plain-language bridge in F-1-14.

## 3. Demo and sandbox

- Landing one-click path: PARTIAL. It routes to `/demo`, starts audio, shows the persistent banner, and changes the canvas, but the used product is below both first viewports (F-1-3).
- Direct `/demo`: FAIL. It does not start sample audio (F-1-2).
- Demo banner: PASS. It says “Demo — sample data, nothing is saved” and includes Reset and exit controls.
- Reset: PASS. After changing to Horizon, 20% intensity, and Static, Reset restored Ribbons, 70%, System setting, stopped motion, and showed an actionable status.
- Isolation: PASS. Seeded localStorage, sessionStorage, IndexedDB, and OPFS “real” sentinels were unchanged. Demo actions added no keys, databases, or files.
- Requests/privacy: PASS. The complete observed live flow made only same-origin static requests, no fetch/XHR, no API request, and no off-origin request. Console and page errors were empty.
- Offline: PASS through the declared clean-context test.

## 4. Claims audit

A clean clone at `/tmp/audio-reactive-review1.MBE9ki` matched commit `4de68a0`. After `npm ci`, every exact declared command passed:

| Claim | Exact test | Result |
| --- | --- | --- |
| `one-click-demo` | `npm test -- --grep @claim:one-click-demo` | PASS, 1 test |
| `three-scenes-controls` | `npm test -- --grep @claim:three-scenes-controls` | PASS, 1 test |
| `local-only-audio` | `npm test -- --grep @claim:local-only-audio` | PASS, 1 test |
| `gesture-only-input` | `npm test -- --grep @claim:gesture-only-input` | PASS, 1 test |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test |
| `motion-reduction` | `npm test -- --grep @claim:motion-reduction` | PASS, 1 test |
| `package-formats` | `npm test -- --grep @claim:package-formats` | PASS, 1 test |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS, 1 test |
| `privacy-no-personal-data` | `npm test -- --grep @claim:privacy-no-personal-data` | PASS, 1 test |

No declared command is failing. Coverage and truthfulness still fail: F-1-1, F-1-2, F-1-4, F-1-5, and F-1-17 identify unproved or false public promises. Therefore there are untested claims and the verdict cannot pass.

The complete clean-clone gates also passed: lint, typecheck, 3 unit tests, production build, all 25 Playwright tests, package dry run, and audit with zero known vulnerabilities.

## 5. Prior-finding recheck

All earlier `.factory/verification-*.md` files and `.factory/handoff.md` were read. There were no earlier `review-*.md` or `polish-*.md` files.

| Prior ID | Current result | Live and code confirmation |
| --- | --- | --- |
| `QA-01` | FIXED | Axe found zero violations on `/`, `/demo`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html`. |
| `QA-02` | FIXED | No-input and post-reset canvas captures remain identical; animation stops. |
| `QA-03` | **BLOCKING — REOPENED** | Nine declared commands pass, but direct README demo, published-package availability, copied integration, and documented API behavior remain uncovered; see F-1-1, F-1-2, F-1-4, and F-1-5. |
| `QA-04` | FIXED | `npm run typecheck` passes in the clean clone. |
| `QA-05` | FIXED | Hashed live JS returns `Cache-Control: public, max-age=31536000, immutable`. |
| `QA-06` | FIXED for its exact Back case | Live Back restored `/#how`, y=169, and focus to `#how`. Normal Home navigation has a separate failure, F-1-6. |
| `QA-07` | FIXED | `/missing-signal` returns HTTP 404. |
| `QA-08` | FIXED | Exposed mobile navigation, banner, and footer targets measured at least 44 px. |
| `QA-09` | FIXED | Source clamps non-finite intensity to 0; packed-consumer coverage remains in the prior evidence. |
| `QA2-01` | FIXED | Required landing first-screen content fits 1365 × 768. |
| `QA2-02` | FIXED | The hidden file input has `tabindex=-1`; Tab from microphone reaches System setting with a 3 px cyan outline. |
| `QA2-03` | FIXED | Live 404 has the shared skip link, header, nav, main, footer, version, and build ID. |
| `QA2-04` | FIXED for the listed copy | Action note, facts, control labels, status, and footer are at least 16 px. Banner action text has the new gap in F-1-16. |

## 6. Site structure, accessibility, and links

- Titles, `lang=en`, one h1, one main, favicon, canonical on SPA routes, shared header/footer, sitemap, robots, security headers, reduced motion, and no horizontal overflow: PASS.
- Designed 404 and HTTP status: PASS, with copy/destination defects F-1-8 and F-1-9.
- Deep links and anchored Back restoration: PASS. Normal route-change focus: FAIL, F-1-6.
- Link crawl: all site and Param Factory links returned 200; the intentional missing route returned 404.
- Live verifier: `/` and `/demo` passed title/lang/h1/main/alt/button/console checks.
- Axe: zero violations at any impact on all six tested routes.
- Metadata: FAIL, F-1-7.
- Visual identity: PASS. The cropped corners, double keylines, paper labels, ink/cyan/coral/marigold palette, monospace console type, and original night-market art are distinct and do not resemble a generic centered-gradient SaaS template.

## 7. Missed leverage

AI would not improve this focused local audio-visual component, and the brief does not imply transcription or generation. Import, export, and sync are also irrelevant. The obvious missing capability is a complete copy-paste integration that actually connects page audio; that is F-1-4. It needs no AI or external gateway.

## What would make this perfect

Publish and link the package; make direct and one-click demos start a realistic sample; place the running canvas and status in the first demo viewport; copy a complete working integration; enumerate and test every public API claim; repair Home focus and route metadata; replace generic/metaphorical copy; correct the 404 destination; enlarge banner text; and add feedback for the install-copy action. Then rerun this entire review from a fresh clone and fresh browser contexts. A perfect result has zero findings and no untested claim.
