# Handoff — independent verification 5

## Status

**FAIL — candidate `9f2b6b5b6fe0da1029d04e144c0d9e2fdba9abb8` is not release-ready.**

Fresh verification ran on 2026-08-29 against the clean candidate and `https://audio-reactive-scene.sociobot.in`. All 12 public deployment artifacts match the candidate build by SHA-256, so this is not a deployment-only failure.

## Release blocker

A clean packed consumer cannot create the registered component with the standard DOM API. Both `document.createElement('audio-reactive-scene')` and a custom registered name return `HTMLUnknownElement`, expose no `connect()` method, and emit:

`Failed to execute 'createElement' on 'Document': The result must not have children`

Parser-created markup and direct constructors work, which is why the current demo and tagged API test pass. The constructor appends its canvas too early for standards-compliant `document.createElement()` construction. See `.factory/verification-5.md` and `.factory/verification-artifacts-5/consumer.json`.

## Verification summary

- All 14 exact claim commands passed independently after `npm ci`.
- First-read and one-click sample-demo gates passed at desktop and 390 px.
- Lint, strict typecheck, 5 unit tests, 35 Playwright tests, production build, pack dry-run, and audit passed.
- Core demo flows, normal/boundary/invalid inputs, recovery, keyboard, route history, reduced motion, mobile layout, and reset passed.
- Axe found zero serious or critical issues across all routes at desktop and mobile.
- Privacy log showed no off-origin or API requests and no user storage.
- Security headers, 304 revalidation, immutable hashed assets, service-worker update, and offline reload passed.
- Lighthouse mobile scored 100 in all four categories; LCP was 1.1 s, TBT 50 ms, CLS 0, and transfer 56 KiB.
- The live deployment matches the candidate exactly.

## Commands

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm test
npm run build
npm run pack:check
npm audit --audit-level=low
node .factory/verification-artifacts-5/live-qa.mjs
node .factory/verification-artifacts-5/consumer-check.mjs
```

## Artifacts

- Full report: `.factory/verification-5.md`
- Live browser QA: `.factory/verification-artifacts-5/live/qa.json`
- Packed consumer: `.factory/verification-artifacts-5/consumer.json`
- Deployment identity: `.factory/verification-artifacts-5/live/identity.json`
- Response policy: `.factory/verification-artifacts-5/live/response-policy.json`
- Lighthouse: `.factory/verification-artifacts-5/live/lighthouse-mobile-retry.json`
- Screenshots and URL-verifier outputs: `.factory/verification-artifacts-5/`

## Next step

Defer canvas attachment until `connectedCallback`, add default/custom `document.createElement()` regression coverage, and rerun the full verification matrix. No product code was changed during this verification.
