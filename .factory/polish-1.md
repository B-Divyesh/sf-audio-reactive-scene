# Polish 1 — adversarial finding closure

Repair commit: `2f3b9abffeecd2973d7f07b51349add3662a8de5` (amended after this record is added). Local evidence uses `http://127.0.0.1:4173`; live evidence is added after deployment.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Removed the false npm install path. The site and README now say the name is not published, link the source repository, and explain how to build a local tarball. | `@claim:npm-unpublished`; `@claim:package-formats`; clean-consumer ESM+CJS install in `tests/claims.spec.ts`. |
| F-1-2 | Added the isolated `/demo?demo=1` path. It loads the compact playground, persistent banner, reset, and a visible Play sample audio action; the landing click supplies the gesture that starts the loop. | `@claim:one-click-demo`; [.factory/demo.md](demo.md). |
| F-1-3 | Replaced the repeated landing hero on demo with a compact workbench. Its sample button, canvas, and status fit both tested first viewports. | `demo puts the live scene and playback status in the first mobile and desktop viewports`; [local mobile screenshot](evidence/polish-1/local-demo-mobile.png). |
| F-1-4 | Copy embed now contains an audio element, play handler, AudioContext, MediaElementSource, `scene.connect(source)`, and destination connection. | `@claim:complete-embed`. |
| F-1-5 | Added `library-api`, `node-support`, and `site-build-output` manifest entries and tagged tests. README now describes the testable local-release workflow and no longer says all claims are browser-only. | `@claim:library-api`; `@claim:node-support`; `@claim:site-build-output`. |
| F-1-6 | Every SPA route transition, including normal Home and Leave demo navigation, moves focus to its destination heading. | `ordinary Home navigation focuses the destination heading`. |
| F-1-7 | Added per-route description, canonical, Open Graph, and Twitter metadata updates. Added complete noindex/share metadata to static 404. | `each route has route-specific metadata and canonical URL`. |
| F-1-8 | Rewrote the 404 heading as “This page does not exist.” | `every not-found route has a visible, accessible high-contrast error state`. |
| F-1-9 | 404 recovery now goes to `/demo?demo=1` and says “Open the sample playground.” | Static and SPA 404 route checks in `tests/site.spec.ts`. |
| F-1-10 | Replaced “The working component” with “Audio scene playground.” | [copy audit](copy-audit.md). |
| F-1-11 | Replaced “Clear boundaries” with “Audio privacy.” | [copy audit](copy-audit.md). |
| F-1-12 | Replaced “Open package” with “Package formats.” | [copy audit](copy-audit.md). |
| F-1-13 | Rewrote the fact as “Demo works offline after your first visit.” | `@claim:offline-reload`; [local home screenshot](evidence/polish-1/local-home-desktop.png). |
| F-1-14 | Rewrote first-read and README language to introduce a reusable HTML element and explain Web Audio before API types. | [copy audit](copy-audit.md); README review. |
| F-1-15 | Renamed “Start for real” to “Leave demo,” matching its actual destination and behavior. | `ordinary Home navigation focuses the destination heading`. |
| F-1-16 | Set demo banner and its controls to 16 px at every breakpoint. | `QA2-04: mobile supporting instructions and status text remain at least 16px`. |
| F-1-17 | Removed the unavailable pre-publish install copy action instead of leaving a button without success/error feedback. The source-repository link is the honest next action. | `@claim:npm-unpublished`; `@claim:package-formats`. |
| QA2-01 | Retained the desktop first-screen assertion. | `QA2-01: desktop first screen keeps the action, explanation, and facts above the fold`; [local home screenshot](evidence/polish-1/local-home-desktop.png). |
| QA2-02 | Retained the hidden-picker keyboard test. | `QA2-02: the hidden file picker is not a keyboard focus stop`. |
| QA2-03 | Preserved static 404 header, navigation, skip link, footer, and build identity. | `QA2-03: the static deployment 404 uses the shared site shell`; [local 404 screenshot](evidence/polish-1/local-404-desktop.png). |
| QA2-04 | Preserved and expanded mobile text-size coverage. | `QA2-04: mobile supporting instructions and status text remain at least 16px`. |

## Evidence summary

- Local full suite: `npm test` — 33 Chromium tests passed, including every route in axe-core with no serious or critical violations.
- Clean clone: `npm ci`, lint, typecheck, unit tests, every exact `claims.json` command, build, pack check, audit, and full `npm test` all passed from `/tmp/audio-reactive-scene-clean-idVwGU`.
- Local screenshots: `evidence/polish-1/local-home-desktop.png`, `evidence/polish-1/local-demo-mobile.png`, and `evidence/polish-1/local-404-desktop.png`.
