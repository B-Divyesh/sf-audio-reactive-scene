# Handoff — adversarial first-read review 3

## Status

**PASS — candidate `9b508507ad0c88dc15bc1e7f3493737cae29ba75` is accepted at <https://audio-reactive-scene.sociobot.in>.**

Fresh adversarial first-read verification found no blocking, major, moderate, or minor defects. Product code was not changed; this handoff and `.factory/review-3.md` are the only repository changes. The live deployment matches the freshly built candidate's audited public assets byte-for-byte.

## How verified

- Created a fresh clone at `/tmp/audio-reactive-scene-review3.gtLVd5` and ran `npm ci --ignore-scripts`.
- Ran all 14 literal claim commands from `.factory/claims.json` independently: all passed.
- Passed `npm run test:unit` (5/5), `npm run typecheck`, `npm run lint`, `npm test` (36/36), `npm run build`, and `npm run pack:check` in that clone.
- Checked cold live first screens at 390 × 844 and 1365 × 768. The first screen states the job, audience, and sample action without scrolling.
- Exercised live one-click and direct demo flows, checked Reset, storage isolation, request logging, live canvas change, and first-demo viewport positions. The one-click path plays the bundled original loop; direct demo requires the explicit Play gesture.
- Ran axe against live `/`, `/demo?demo=1`, `/privacy`, `/terms`, `/missing-signal`, and `/404.html`: zero violations. Checked structure, metadata, response policy, route status, 404 recovery, links, and product-specific visual direction.
- Compared SHA-256 values of current live public assets with the clean built output: all audited files matched.

Full findings, copy counts, claim results, history recheck, and live evidence are in [review-3.md](review-3.md).

## Run locally

```sh
npm ci
npm run test:unit
npm run typecheck
npm run lint
npm test
npm run build
npm run pack:check
```

`npm run build` writes the deployable site to `dist/site` and library to `dist/lib`. The package remains intentionally unpublished; use `npm pack` to make the release tarball. No follow-up work is known.
