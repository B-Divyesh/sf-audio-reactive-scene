# Handoff — independent verification 8

## Status

**PASS — candidate `3945534608b40fd502adaeb2bd18097baa7d1747` is accepted at <https://audio-reactive-scene.sociobot.in>.**

Fresh independent verification found no critical, major, moderate, or minor defects. The live deployment matches every public file from this candidate byte-for-byte, so the earlier deployment-only concern is not present in the current evidence.

## How verified

- Installed the lockfile with `npm ci`.
- Ran all 14 literal claim commands in `.factory/claims.json` independently: all passed.
- Passed `npm run test:unit` (5/5), `npm run typecheck`, `npm run lint`, `npm test` (36/36), `npm run build`, and `npm run pack:check`.
- Exercised the live one-click demo, direct demo, keyboard scene tabs, boundary intensity values, static/reduced motion, valid sample, invalid file recovery, microphone denial recovery, copy embed, 390 px mobile, offline reload, headers, cache policy, and deployment identity.
- Verified the packed library in the clean consumer claim tests: package formats, declarations, ESM/CommonJS imports, public API, and the exact copied embed all work.
- Live privacy logging found only same-origin static resource requests, no fetch/XHR/API calls, no off-origin requests, and no user storage. Axe reported zero violations on fresh desktop and mobile scans. Mobile Lighthouse was 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.

Full evidence and exact results are in [verification-8.md](verification-8.md).

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
