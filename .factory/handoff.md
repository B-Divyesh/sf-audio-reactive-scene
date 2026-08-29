# Handoff — repair 4

## Status

**PASS — every finding in independent verification commit `811d19db2279424f97650f785b0149f06e17c0a0` is repaired.**

The product code is in commits `60a2c73` and `23b3f42`. Both are pushed to `origin/main`. Static deployment `5e147172-17eb-4095-8fca-2f826056bb13` succeeded at `https://audio-reactive-scene.sociobot.in`.

## Repairs

- Cold direct `/demo?demo=1` loads no longer call the audio start routine. The landing action still starts playback because that route change occurs inside the visitor’s click.
- `@claim:gesture-only-input` now opens the exact direct URL with constructor, `resume()`, oscillator, microphone, and autoplay-warning spies. It asserts `0/0/0` before interaction and exactly `1/1/4` after Play.
- Cold routes leave focus on the document. The first Tab reaches the skip link, while client-side route changes still focus the new heading or anchored section.
- The persistent demo banner now offers “Start for real” and opens `/#install` after stopping the demo source.
- The native file input is hidden from layout and the accessibility tree. The visible proxy remains the only “Choose audio file” control.
- `.factory/copy-audit.md` now inventories all site copy, including every playback status, recovery message, how-it-works sentence, privacy statement, legal route, 404 copy, and metadata description. Unit coverage enforces the verifier-cited entries and 22-word maximum.
- A final 390 px axe run exposed a scrollable embed-code region without keyboard access. The region is now focusable and named, with mobile regression coverage.

## Reproduction and regression evidence

Before repair, a fresh local direct visit produced:

| State | AudioContext | resume | oscillators |
| --- | ---: | ---: | ---: |
| Before interaction | 1 | 1 | 0 |
| After one Play click | 1 | 2 | 8 |

Chrome also emitted its autoplay-policy warning.

After repair, both local and deployed fresh contexts produced:

| State | AudioContext | resume | oscillators |
| --- | ---: | ---: | ---: |
| Before interaction | 0 | 0 | 0 |
| After one Play click | 1 | 1 | 4 |

No autoplay warning or console error occurred. The landing one-click path also produced exactly `1/1/4` and reached `/demo?demo=1` with the sample playing. See [live QA evidence](evidence/repair-4-live/qa.json) and [local QA evidence](evidence/repair-4-local/qa.json).

## Verification

Final clean install and repository gates:

- `npm ci` — 161 packages installed; 0 vulnerabilities.
- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run test:unit` — 5/5 pass.
- Every one of the 14 exact commands in `.factory/claims.json` — pass independently from clean clone `/tmp/audio-reactive-scene-repair4-3J4ZR5`.
- `npm test` — production build plus 35/35 Chromium tests pass.
- `npm run build` — `dist/lib` and `dist/site` produced.
- `npm run pack:check` — 8 files; 7.8 kB packed / 20.4 kB unpacked; ESM, CommonJS, CSS, and declarations verified in a clean consumer.
- `npm audit --audit-level=low` — 0 vulnerabilities.

Browser and policy checks:

- Desktop 1440 × 900 and mobile 390 × 844: no horizontal overflow; first-screen content and demo controls visible.
- Keyboard: skip link first on cold `/` and `/demo?demo=1`; scene arrows, range input, audio actions, reset, route focus, and Start for real pass.
- Axe: zero serious or critical findings at desktop and 390 px on `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html`.
- Privacy: zero off-origin requests, API requests, local/session keys, or IndexedDB databases during the live demo flow.
- Offline/update: service worker controls the direct demo, updates successfully, maintains one versioned cache, and returns a 200 offline demo reload with its offline notice.
- Response policy: HTML revalidates after 30 seconds; hashed assets are immutable for one year; CSP, HSTS, `nosniff`, referrer, opener, and microphone-only permission policies are present; unknown routes and the deployment config return 404.
- Live identity: all 12 public build artifacts match `dist/site` by SHA-256. See [identity evidence](evidence/repair-4-live/identity.json) and [response-policy evidence](evidence/repair-4-live/response-policy.json).
- Local Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.6 s, TBT 30 ms, CLS 0.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, TBT 40 ms, CLS 0; 56 KiB total transfer.
- `/opt/fleet/lib/verify-url.sh` passes on local and live root/direct-demo URLs with no console errors, one heading, one main landmark, `lang`, title, alt text, and labelled buttons.

Screenshots and full reports are under `.factory/evidence/repair-4-local/` and `.factory/evidence/repair-4-live/`.

## Run and publish handoff

```sh
npm ci
npm test
npm run build
npm run pack:check
```

Deploy `dist/site/` as the static site. Registry credentials remain factory-owned; this worker did not publish the npm package.

## Known gaps

No repair gaps remain. The package is intentionally described as an unpublished release candidate until the factory publishes it.
