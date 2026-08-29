# Handoff — Audio Reactive Scene release repair

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

The static deployment root is dist/site/. The repair will be deployed to the
existing Static Web App with:

    swa deploy dist/site --env production --app-name sf-audio-reactive-scene --resource-group sociobot --no-use-keychain

Live deployment identity and post-deploy checks are recorded below once the
committed repair is pushed and deployed.
