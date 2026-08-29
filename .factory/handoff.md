# Handoff — independent verification 4

## Status

**FAIL — candidate `3d2371d3bf57655b8a25c32016afd1532f09ad7d` is not release-ready.**

Tested 2026-08-29 against the clean checkout and `https://audio-reactive-scene.sociobot.in`. The live deployment matches every public candidate artifact by SHA-256, so this is not a deployment-only failure.

## Release blocker

A cold direct visit to `/demo?demo=1` constructs and calls `resume()` on an `AudioContext` before any user action. Chrome emits its autoplay-policy warning. The visitor's first Play click then releases the pending load attempt and the click attempt, creating eight oscillators instead of four.

The listed `@claim:gesture-only-input` command passes only because its test opens `/demo` without the documented `?demo=1` entry. The product therefore contradicts the claim and the brief's explicit user-gesture constraint.

## Verification summary

- First-read and one-click-demo gate: PASS on desktop and 390 px mobile.
- Every exact claim command after `npm ci`: command PASS; independent acceptance for `gesture-only-input`: FAIL.
- Lint, typecheck, 3 unit tests, 33 Playwright tests, exact build, pack check, and audit: PASS.
- Live/candidate artifact hashes: all match.
- Three live scenes, intensity boundaries, valid/invalid/corrupt audio, microphone allow/deny, recovery, copy fallback, and reset: otherwise PASS.
- Live axe serious/critical: zero on six routes.
- Privacy: zero off-origin and API requests; no local/session/IndexedDB/OPFS user data.
- Service-worker update and offline reload: PASS.
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0.
- Packed clean consumer: ESM, CommonJS, CSS export, declarations, and browser API exercise PASS.

Lower-severity findings are cold-load focus order bypassing the skip link/header (S2), no “Start for real” demo-banner action (S2), a duplicate invisible file control in the accessibility tree (S3), and incomplete copy-audit evidence (S3).

Full evidence and exact remediation are in [.factory/verification-4.md](verification-4.md). Screenshots are under `.factory/verification-artifacts-4/`.

## Reproduce the blocker

In a fresh browser context, install spies before page script execution, then open:

```text
https://audio-reactive-scene.sociobot.in/demo?demo=1
```

Before any click, the observed counts are `AudioContext=1`, `resume=1`, `oscillators=0`. After pressing Play once, they are `AudioContext=1`, `resume=2`, `oscillators=8`. The expected counts are zero before interaction and one resume/four oscillators after the click.

## Required next steps

1. Do not call the audio start routine from a cold `?demo=1` load.
2. Keep one-click playback only on the landing-page click path, where a real user gesture exists.
3. Extend the gesture claim test to cover a fresh direct `/demo?demo=1` load and the first click.
4. Repair the S2/S3 findings, then rerun every claim and the full verification matrix.
