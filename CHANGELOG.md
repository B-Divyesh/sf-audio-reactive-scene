# Changelog

## 0.1.2 — 2026-08-28

- Keep cold direct demo loads silent until Play; one gesture now creates one four-oscillator sample loop.
- Restore skip-link-first cold focus, the Start for real path, and a single accessible file chooser.
- Make the mobile embed-code scroller keyboard accessible.
- Keep the poster deterministic and idle until a user connects audio, including after demo reset.
- Repair the not-found contrast, add complete privacy and gesture claim checks, and make the repository-wide strict type check and lint gate pass.
- Restore focus and anchored scroll on browser history navigation, provide 44 px mobile targets, immutable asset caching, and true HTTP 404 handling for unknown document routes.

## 0.1.1 — 2026-08-28

- Move component layout rules from an inline shadow-root style into the bundled stylesheet so strict `style-src 'self'` policies work without exceptions.
- Test the production site with its deployed Content Security Policy headers.

## 0.1.0 — 2026-08-28

- Add three canvas scenes: Ribbons, Lanterns, and Horizon.
- Add Web Audio node input, intensity control, and motion modes.
- Add static poster fallback and accessible scene labels.
- Add a local demo, file input, microphone input, and copyable embed.
