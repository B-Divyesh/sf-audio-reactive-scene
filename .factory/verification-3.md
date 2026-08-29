# Independent product verification — candidate 40333928cbb9fc13dda8b361cd055712de301a0d

Verified 2026-08-29 against a clean checkout at commit `40333928cbb9fc13dda8b361cd055712de301a0d` and the live deployment `https://audio-reactive-scene.sociobot.in`.

## Verdict

**PASS — release candidate accepted.** The prior deployment-only concern is not reproduced. The live deployment matches the candidate build, and the previous first-read and keyboard blockers remain fixed.

## First-read and demo gate

A cold fresh 1365 × 768 visit to `/` returned HTTP 200 with no console or page errors. The first screen says the job (“Make your audio move a scene”), audience (site owners, streamers, and event makers), and first action (“Try it with sample data”). Its adjacent text says the action opens the playground and starts a local sound loop. The three facts are visible: audio stays in the tab, works after first visit, and is MIT-licensed. Clicking the action opens `/demo`, shows “Demo — sample data, nothing is saved,” and starts the local sample loop. This passes the plain-words and demo-sandbox gates.

## Claims and clean quality gates

`.factory/claims.json` exists. After clean `npm ci`, every exact listed command passed against the production demo entry point: `one-click-demo`, `three-scenes-controls`, `local-only-audio`, `gesture-only-input`, `offline-reload`, `motion-reduction`, `package-formats`, `mit-license`, and `privacy-no-personal-data` (one Playwright test each). Landing and README material claims were cross-checked with the manifest; no unlisted material claim was found.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 161 packages, 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:unit` | PASS — 3 Vitest tests |
| `npm test` | PASS — production build and 25 Chromium tests |
| `npm run build` | PASS — `dist/lib` and `dist/site` |
| `npm run pack:check` | PASS — 8 files, 7.5 kB tarball |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |

The initial ESM bundle is 21,401 bytes raw / 7,560 bytes gzip; CSS is 11,284 bytes raw / 3,489 bytes gzip; the hero WebP is 43,850 bytes. All are within the product budgets.

## Independent live exercise

- The three scenes select correctly; intensity boundaries 0% and 100% become `0` and `1`; Static becomes `motion=static`.
- A text file gets the specific MP3/WAV/OGG recovery message; sample playback immediately recovers. Microphone denial gives a sample/file recovery path. Reset restores Ribbons, 70%, automatic motion, and its status.
- From “Use microphone”, Tab moves directly to “System setting” with a visible `rgb(97, 231, 223) solid 3px` outline; the transparent picker is not a focus stop.
- At 390 × 844 there is no horizontal overflow and checked supporting copy is 16 px. With reduced motion, canvas captures 500 ms apart are identical.
- Axe found zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html`. Each normal page has `lang=en`, one `h1`, one `main`, and a route-specific title. The missing route returns HTTP 404 with the shared accessible shell.
- The service worker controls `/demo`, has one versioned cache (`audio-reactive-scene-2be8ed8391`), accepts `registration.update()`, and a primed demo reloads offline with its offline notice.

## Privacy, headers, and deployment identity

The full live demo flow (sample, invalid file, recovery, microphone denial, controls, reset) made no off-origin or fetch/XHR requests. `localStorage`, `sessionStorage`, IndexedDB, and OPFS were empty; only the expected service-worker cache persisted. There were no console or page errors.

The live response has self-only CSP without `unsafe-inline`, HSTS, `nosniff`, strict referrer policy, microphone-only Permissions Policy, and same-origin COOP. Hashed JavaScript is immutable for a year; HTML and `sw.js` use short revalidation. This static product has no server endpoint/product-unlock or sign-in, so 429 allowance and Entra checks do not apply.

SHA-256 comparison matched every public live artifact to this fresh candidate build: `index.html`, `404.html`, `404.css`, `sw.js`, hashed bundles, WebPs, icons, `robots.txt`, and `sitemap.xml`. `staticwebapp.config.json` correctly is not public deployment output.

## Packed library consumer

`npm pack` produced an 8-file, 7.5 kB `audio-reactive-scene-0.1.2.tgz`. Installed in a clean temporary consumer, its ESM import and CommonJS require both exposed `AudioReactiveScene` and `defineAudioReactiveScene`; `audio-reactive-scene/style.css` resolved successfully.

## Defects by severity

None found. There are no release-blocking, major, moderate, or minor defects from this verification.
