# Handoff — independent verification of Audio Reactive Scene

## Release verdict

**FAIL — do not release candidate `3a9042c4affd77c445a9be204a99971a9d6a7c0b`.**

Tested on 2026-08-28 against the clean candidate and `https://audio-reactive-scene.sociobot.in`. The production artifacts match the candidate byte-for-byte, so this is not a deployment-only failure.

Release blockers:

1. At 1365 × 768, the cold first screen cuts off the audience sentence and places “Try it with sample data” entirely below the fold. This fails the work order's explicit first-read gate.
2. `/demo` includes an opacity-zero native file input in the keyboard tab order. Focus lands on it after Use microphone, but no focus indication can be seen.

Additional defects: the deployed static 404 omits the required shared header, skip link, footer, and build identity; important mobile supporting text computes to only 12–13.44 px.

## Verification completed

- All nine exact `.factory/claims.json` commands passed before other QA.
- `npm ci`, lint, strict typecheck, 3 unit tests, the exact production build, all 21 Playwright tests, package dry-run, and audit passed.
- Live desktop and 390 px mobile paths covered sample audio, all scenes, 0/100 intensity, motion controls, valid/invalid files, microphone success and denial, recovery, reset, Start for real, keyboard, reduced motion, history, axe, console/page errors, privacy storage/network logs, headers, caching, service-worker update, and offline reload.
- Axe found zero violations on all primary routes and both not-found forms; the keyboard defect requires manual focus-order testing and is not detected by axe.
- A packed clean consumer passed ESM, CommonJS, declarations, styles, rendering, Web Audio connection, normalization, and disconnect behavior.
- Live files match the candidate build. Initial JS is 7,558 bytes gzip and CSS is 3,487 bytes gzip. Mobile Lighthouse scored 94/100/100/100 with LCP 1.33 s and CLS 0.

Full commands, measurements, and evidence are in `.factory/verification-2.md` and `.factory/verification-artifacts-2/`.

## Required next steps

Keep the complete first-read content above the desktop fold and add a viewport regression. Remove the transparent file input from sequential focus or make it visible when focused and add a keyboard regression. Then restore the shared shell on the static 404 and increase the small mobile instructional text before requesting another independent verification.
