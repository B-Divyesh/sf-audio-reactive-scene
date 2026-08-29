# Handoff — polish 1

## Status

Repair complete at commit `2f3b9abffeecd2973d7f07b51349add3662a8de5` (this handoff is amended into the final repair commit). The full finding-to-evidence record is [.factory/polish-1.md](polish-1.md).

## What changed

- Replaced the false npm install instruction with an honest local release-candidate workflow. The library remains ready to pack; registry publication stays with the factory.
- Added a real isolated `/demo?demo=1` route with persistent demo banner, reset, leave action, compact first screen, local sample action, and no browser user-data storage.
- Made Copy embed provide a complete user-started Web Audio connection.
- Added exhaustive public claim entries and tagged tests for the demo, package tarball, API, Node floor, site build output, registry status, privacy, offline behavior, controls, and MIT license.
- Repaired SPA focus restoration, route metadata, 404 copy/recovery/metadata, mobile banner typography, and all review copy findings.
- Kept the night-market signal-booth visual system intact; the demo workbench uses its same ink, paper, cyan, coral, and marigold control language.

## Verification

Local working tree:

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test:unit` — 3 tests pass
- `npm test` — 33 Chromium tests pass
- `npm run build` — writes `dist/lib` and `dist/site`
- `npm run pack:check` — 8 files, 7.7 kB tarball
- `npm audit --audit-level=low` — 0 vulnerabilities
- Axe integration checked `/`, `/demo?demo=1`, `/privacy`, `/terms`, unknown SPA route, and `/404.html`; zero serious or critical findings.
- Mobile Lighthouse: Performance 97, Accessibility 100, Best Practices 100, SEO 100; report at `evidence/polish-1/lighthouse-local-mobile.json`.

Clean clone `/tmp/audio-reactive-scene-clean-idVwGU` at the repair commit:

- `npm ci`, lint, typecheck, unit tests, `npm run build`, pack check, and audit passed.
- Every exact command in `.factory/claims.json` passed independently.
- The full 33-test `npm test` suite passed after those claim commands.

Local visual evidence:

- `evidence/polish-1/local-home-desktop.png`
- `evidence/polish-1/local-demo-mobile.png`
- `evidence/polish-1/local-404-desktop.png`
- `evidence/polish-1/lighthouse-local-mobile.json`

## Run and deploy

```sh
npm ci
npm test
npm run build
```

Deploy `dist/site/` through the static work order. To publish the package later, factory registry credentials should run `npm pack` and publish the reviewed tarball; workers must not publish it.

## Known gaps

None in the product repair. The npm registry package is deliberately not claimed as available until the factory publishes it; this is visibly disclosed and has a registry-status claim test.
