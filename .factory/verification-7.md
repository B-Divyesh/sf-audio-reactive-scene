# Independent product verification 7

Verified 2026-08-29 against candidate commit `287b50b46866c6f28b87dc1895d39587a4c1823e` and `https://audio-reactive-scene.sociobot.in`.

## Verdict

**PASS — release candidate `287b50b46866c6f28b87dc1895d39587a4c1823e` meets the researched brief and the factory acceptance contract.**

No release-blocking defect was found. This is fresh evidence, not reliance on the builder report. The live deployment matches this candidate's deployable public output byte-for-byte.

## First-read and demo gate

**PASS.** A new, cold desktop load presents, in plain words:

- What it does: “Make your audio move a scene.”
- Who it is for: “site owners, streamers, and event makers”.
- First action: “Try it with sample data”, immediately followed by “It opens the sample scene and starts a local sound loop.”

At 390 × 844 the headline, audience sentence, action, action explanation, and all three facts are visible without scrolling; the facts end at 833.6 px. One click opens `/demo?demo=1`, starts the generated local sample, and shows the persistent “Demo — sample data, nothing is saved” banner with Reset demo and Start for real. A cold direct demo remains a static poster until Play sample audio is pressed.

## Required claim tests

`.factory/claims.json` exists with 14 claims. After `npm ci` in the clean candidate checkout, each literal `test` command in it was invoked independently through the demo entry point and exited 0:

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
| `library-api` | PASS |
| `node-support` | PASS |
| `site-build-output` | PASS |
| `npm-unpublished` | PASS |
| `mit-license` | PASS |
| `privacy-no-personal-data` | PASS |

The independent full test run also passed: `npm run test:unit` 5/5; `npm run typecheck`; `npm run lint`; `npm test` (production build plus 36/36 Chromium tests); `npm run build`; and `npm run pack:check`.

## End-to-end product exercise

Live desktop and 390 px mobile testing covered the smallest useful job:

- The one-click local sample connected and updated the scene status. Ribbons, Lanterns, and Horizon are selectable; scene tabs work with Arrow keys.
- Intensity boundaries accepted 0% and 100%; Static mode reflected correctly; Reset demo restored Ribbons, 70%, and System setting.
- A valid generated WAV completed with “Playing normal-case.wav in this tab. The file is not uploaded.”
- A text file recovered with “That file is not recognised as audio. Choose an MP3, WAV, or OGG file.”
- Denied microphone permission recovered with “Microphone access was not allowed. Use the sample or choose an audio file.”
- Copy embed returned “Embed copied.” The copied sample contains the audio element, user `play` event, `AudioContext`, `scene.connect(source)`, and destination connection.
- There were no console errors or page errors in the successful live flows.

## Accessibility, responsive behavior, and motion

- Fresh axe-core 4.13 scans of the live home and demo at desktop and 390 px had **zero serious or critical findings** (zero violations overall in these scans).
- The page has `lang=en`, a route-specific title, exactly one `h1`, and one `main`. The cold first Tab reaches the skip link; focused scene tabs show a visible `3px solid rgb(97, 231, 223)` outline.
- At 390 px, no horizontal overflow occurred. The test suite also passed its 200% text-size regression for home and demo.
- A fresh reduced-motion claim run verified a byte-identical stable poster. Static mode stops motion; no audio work begins before a visitor gesture.

## Privacy, network, and server scope

Fresh Playwright request logging through the live sample flow recorded only same-origin static requests (`/`, the hashed JS/CSS, and the local hero image), no fetch/XHR or API request, no analytics, and no third-party origin. After exercise, `localStorage`, `sessionStorage`, and IndexedDB were empty. The service worker holds the only persistent public-file cache; the demo stores no user data.

Live headers include a self-only CSP with response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin-when-cross-origin referrer policy, `Permissions-Policy: camera=(), geolocation=(), microphone=(self)`, and same-origin COOP. HTML is revalidated after 30 seconds; hashed JS/CSS is `public, max-age=31536000, immutable`.

This is a static library site. No server API, product-unlock call, sign-in, billing endpoint, or other server-side product endpoint was present in source or live request logs; 429/`Retry-After` and Entra tenant checks are therefore not applicable. The brief does not call for AI, and none is present.

## Offline, PWA, performance, and package

The live service worker controls `/demo?demo=1`, its `registration.update()` completed, and it uses exactly one versioned cache: `audio-reactive-scene-2be8ed8391`. After priming, a fully offline reload rendered “TRY SAMPLE AUDIO” and the visible offline notice.

Fresh Lighthouse 12.8.2 mobile results on the live root:

| Metric | Result |
| --- | ---: |
| Performance | 92 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 1.1 s |
| LCP | 1.4 s |
| TBT | 340 ms |
| CLS | 0 |

The production build outputs 23.37 kB raw / 8.08 kB gzip site JavaScript, 12.47 kB raw / 3.70 kB gzip CSS, a 43.85 kB hero image, and no font files: all applicable bundle budgets pass. `npm pack --dry-run` produced the expected eight-file `audio-reactive-scene-0.1.2.tgz` (8.1 kB packed, 21.4 kB unpacked). The independently passing packed-consumer claims install the tarball in a clean project, prove ESM and CommonJS exports, compile the public TypeScript surface, and exercise the component API.

## Deployment identity

The following freshly built public files matched the live response SHA-256 exactly: `index.html`, `404.html`, `404.css`, `apple-touch-icon.png`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `sw.js`, `assets/hero-market.webp`, `assets/index-BHSEKCsd.css`, `assets/index-dTRR2Ail.js`, and `assets/social-card.webp`. `staticwebapp.config.json` is correctly not public (HTTP 404). Thus the deployment is the candidate, not a stale or deployment-only failure.

## Defects by severity

| Severity | Findings |
| --- | --- |
| Critical | None |
| Major | None |
| Moderate | None |
| Minor | None |

## Evidence locations

Transient QA artifacts from this run are under `/tmp/audio-reactive-qa/`, including one log per claim, live desktop/mobile screenshots, the mobile Lighthouse JSON, and fetched artifact comparisons. The committed test suite and claim manifest provide reproducible verification from a clean checkout.
