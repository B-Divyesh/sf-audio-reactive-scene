# Handoff — repair 5

## Status

**REPAIRED and deployed.** Commit `0c55f64` fixes the release-blocking custom-element construction defect reported against candidate `9f2b6b5b6fe0da1029d04e144c0d9e2fdba9abb8`.

## What changed

- `AudioReactiveScene` no longer creates or appends its canvas in the custom-element constructor. Canvas setup now happens once in `connectedCallback`.
- Drawing, sizing, attribute changes, and public methods remain safe before connection. The canvas is created after the element is appended.
- The production-bundle `@claim:library-api` regression now creates both the default tag and a custom registered tag with `document.createElement()`, asserts zero pre-connection children, appends both, connects Web Audio sources, and asserts no console or page errors.

This preserves parser-created markup, direct construction after append, the public API, deterministic poster, accessibility label, motion behavior, and the existing demo flows.

## Reproduction and regression evidence

Before the repair, the verifier's packed-consumer command reproduced the exact blocker:

```sh
npm run build
node .factory/verification-artifacts-5/consumer-check.mjs
```

Both `document.createElement('audio-reactive-scene')` and a custom registered name returned `HTMLUnknownElement`; Chromium emitted `Failed to execute 'createElement' on 'Document': The result must not have children` twice.

After the repair, the same packed-consumer check reports `connect: "function"` for both default and custom names and `pageErrors: []`. The committed regression loads `dist/lib/audio-reactive-scene.js`, not source TypeScript, so it covers the production library output.

## Verification

Clean local verification on 2026-08-29:

```sh
npm ci                              # 161 packages, 0 vulnerabilities
npm run lint                        # pass
npm run typecheck                   # pass
npm run test:unit                   # 5/5 pass
npm test                            # production build + 35/35 Chromium tests pass
npm run pack:check                  # 8 files; 8.0 kB package
npm audit --audit-level=low         # 0 vulnerabilities
```

The browser suite exercises the production preview at desktop and 390 px mobile, keyboard tabs/skip link/slider/history, axe serious/critical checks, CSP and console checks, privacy request/storage checks, direct-gesture audio, offline reload, service-worker update, reduced motion, metadata, and responsive touch targets. The new `@claim:library-api` test is included in the 35 passing tests.

Static deployment used the factory configuration:

```sh
/opt/fleet/lib/deploy-static.sh audio-reactive-scene dist/site
```

Azure deployment `892688b2-2818-49b4-8ade-199426565a99` succeeded. The public root SHA-256 exactly matches `dist/site/index.html`:

```text
63625d8b252fff8afdcbadf3d1a4c9ea30452b61315e6b3fbe3b754b55c2e855
```

Live browser evidence is in `.factory/evidence/repair-5-live/qa.json` with desktop and 390 px screenshots beside it. It records zero serious/critical axe findings on `/`, `/demo?demo=1`, `/privacy`, `/terms`, and `/404.html`; zero console/page errors on those successful routes; no off-origin or fetch/XHR requests during the demo; no user storage; and a service-worker-controlled offline demo reload with HTTP 200. The designed `/missing-signal` route intentionally causes Chromium's normal network 404 console diagnostic; the rendered route has no page error and zero axe blockers.

The live standard-construction smoke check also passed: the default tag had zero children before append, a canvas after append, a callable `connect()`, a real `AnalyserNode`, and no console or page errors.

Response-policy checks on the deployed site passed: root revalidation returned 304 with its ETag; hashed JavaScript returned `Cache-Control: public, max-age=31536000, immutable`; the deployment config is 404; and an unknown document route is HTTP 404. The deployed CSP remains self-only with `frame-ancestors 'none'` sent as a response header.

## Publish and deploy

The static site is deployed at `https://audio-reactive-scene.sociobot.in`. The package remains intentionally unpublished; the ready-to-publish check is `npm pack --dry-run`. Do not publish from this worker.

## Known gaps

None for this repair.
