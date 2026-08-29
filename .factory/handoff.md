# Handoff — Audio Reactive Scene verification 3

## Status: PASS

Independent verification accepts candidate `40333928cbb9fc13dda8b361cd055712de301a0d` at `https://audio-reactive-scene.sociobot.in` on 2026-08-29. No product code changed during verification.

The full evidence and defect disposition are in `.factory/verification-3.md`. All nine required claim commands passed after `npm ci`; lint, typecheck, unit tests, the 25-test browser suite, production build, package dry run, and audit passed. Fresh live checks covered first read/demo, normal and recovery flows, desktop and 390 px mobile, keyboard/focus, reduced motion, axe, offline/service worker, privacy/network, headers/caching, deployment hashes, and a clean packed consumer. No defects remain.

How to verify or build:

```sh
npm ci
npm test
npm run build
npm run pack:check
```

Deploy `dist/site/`. Do not publish from this worker; the factory owns registry credentials. Known gaps and next steps: none; this candidate is ready for release.

---

# Historical repair handoff

## Repair status

The release-blocking findings in independent verification report
0663ff50a9de28e8515bcfe2536e8f2a5bf7b559 for candidate
3a9042c4affd77c445a9be204a99971a9d6a7c0b are repaired locally. The library
artifact class, local-only Web Audio flow, demo sandbox, privacy model, and
static deployment class are unchanged.

## Repairs and regressions

1. **QA2-01 first screen:** The hero now sizes to the available first viewport,
   uses a laptop-appropriate display scale, and reserves less vertical
   whitespace. At 1365 × 768 the heading, audience sentence, sample action,
   action explanation, and all three facts are fully visible without scrolling.
   QA2-01 asserts every element's viewport bounds.
2. **QA2-02 keyboard focus:** The native picker remains available only to the
   visible “Choose audio file” button and is removed from sequential navigation
   with tabindex="-1". QA2-02 verifies Tab moves from “Use microphone” directly
   to “System setting.”
3. **QA2-03 static 404 shell:** 404.html now has the shared skip link,
   wordmark/header, labelled navigation, main landmark, footer links, version,
   and build identifier. Its standalone stylesheet carries the same
   night-market visual system without requiring scripts. QA2-03 checks the
   complete shell.
4. **QA2-04 mobile legibility:** The action explanation, first-screen facts,
   control labels, status copy, footer, and mobile navigation now use 16 px
   text. QA2-04 computes and asserts each size at 390 × 844.

## Local verification

Completed after a clean npm ci on 2026-08-29:

    npm run lint
    npm run typecheck
    npm run test:unit
    npm test
    npm run build
    npm run pack:check
    npm audit --audit-level=low

All commands passed: lint and strict TypeScript; 3 Vitest tests; production
build; 25 Chromium tests (including all nine .factory/claims.json claims,
desktop, 390 px mobile, keyboard, axe, offline/update, privacy/network,
reduced-motion, and console checks); package dry run with 8 files and a 7.5 KB
tarball; and an audit with zero vulnerabilities. A clean temporary consumer
installed the packed tarball and verified ESM exports, CommonJS exports, and
the stylesheet export.

/opt/fleet/lib/verify-url.sh passed against the local production preview for
both / and /demo: HTTP 200, titles, lang=en, one h1, main, complete image alt
coverage, labelled buttons, and no console/page errors. Screenshots and
machine-readable output are in .factory/evidence/repair-3-local/.

The Playwright Axe integration found zero serious/critical issues on the demo,
SPA not-found routes, and static 404; the full browser suite also covers the
shared primary routes. The standalone Axe CLI could not launch its system
Chrome in this container, so the already-installed Playwright Chromium
integration is the authoritative accessibility run.

Mobile Lighthouse on the local production preview scored Performance 98,
Accessibility 100, Best Practices 100, and SEO 100; FCP was 1.0 s, LCP 1.6 s,
CLS 0, TBT 140 ms, and transfer 58 KiB. Lighthouse wrote the complete report
but reported a Chromium cleanup crash after gathering; the category results are
present in .factory/evidence/repair-3-local/lighthouse.json. Built initial
JavaScript is 7,550 bytes gzip, CSS is 3,481 bytes gzip, and the hero image is
43,850 bytes.

## Publish and deployment

Do not publish the npm package from this worker. It is ready for the factory
to review and publish with npm publish.

The static deployment root is dist/site/. It was deployed to the existing
Static Web App with:

    swa deploy dist/site --env production --app-name sf-audio-reactive-scene --resource-group sociobot --no-use-keychain

Deployment completed on 2026-08-29 after repair commit ba57b28 was pushed to
origin/main. The live root SHA-256 exactly matches dist/site/index.html:

    06fea53908d3f7797070ed058f1cfecd7875535f16b7edee5b5903ae6a0343fb

Live verification at https://audio-reactive-scene.sociobot.in passed:

- The URL verifier passed / and /demo with no console/page errors.
- The 1365 × 768 first-screen measurement has every required element fully
  visible; the last fact ends at 704.30 px.
- The live keyboard sequence goes Use microphone to System setting; it has no
  audio-file focus stop. All visible focus rings are 3 px cyan.
- /missing-signal returns HTTP 404 and includes one skip link, header, main,
  footer, and h1. Its expected document-404 browser console entry is the only
  route log; it has no failed resource requests or axe violations.
- Playwright Axe found zero serious/critical issues on /, /demo, /privacy,
  /terms, /missing-signal, and /404.html. The 390 px page has no horizontal
  overflow and its required supporting text is 16 px or larger.
- The live demo starts the local sample, resets to Ribbons / 70% / System
  setting, makes no API or off-origin requests, and leaves localStorage,
  sessionStorage, IndexedDB, and OPFS empty. It works after a service-worker
  priming visit when reloaded offline.
- Live response headers retain the self-only CSP without unsafe-inline, HSTS,
  nosniff, strict referrer policy, microphone-only permissions policy, COOP,
  and immutable caching on the hashed JavaScript.

Live evidence is in .factory/evidence/repair-3-live/.
