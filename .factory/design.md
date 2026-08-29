# Visual thesis — Night-market signal booth

Audio Reactive Scene borrows from the hand-built control booths and stacked neon signs of a night market after rain. It should feel like a small, trusted instrument a maker can wire into a page, not a nightclub visualizer or a generic software landing page.

## Palette

The product is intentionally single-mode. Canvas scenes require a known dark surround, and the booth metaphor depends on light emerging from ink-black surfaces.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#090b12` | page background |
| Booth | `#111522` | raised controls |
| Paper | `#f4e6c1` | primary text and sign labels |
| Smoke | `#aaa894` | secondary text |
| Cyan tube | `#61e7df` | primary actions and focus |
| Hot coral | `#ff6b5f` | active audio and warnings |
| Marigold | `#ffc857` | status lamps and selection |
| Safe green | `#75dc8c` | confirmed state |
| Danger | `#ff8b83` | errors |

All body text pairs meet WCAG AA against Ink or Booth. Cyan is used with Ink text on filled controls. State never depends on colour alone.

## Type

- Display: `Arial Narrow`, `Aptos Narrow`, or the system condensed fallback. Uppercase sign lettering, tight line-height, and restrained tracking echo painted market boards without loading a font.
- Body and controls: `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace. It reads like a compact lighting console and keeps values stable.
- No remote or bundled font files. This removes a request and avoids licensing ambiguity.

## Shape, spacing, and depth

- An 8 px spacing scale, with 4 px reserved for small optical adjustments.
- Cropped corners, double keylines, screw dots, and paper ticket labels form the shape language.
- Sections alternate between open ink space and booth panels. Controls sit near the canvas rather than in generic feature cards.
- The mobile layout stacks the scene, source controls, and snippet in that order. Nonessential sign ornament drops below 640 px.

## Interaction grammar

- Cyan means an action. Marigold marks the selected scene. Coral signals live audio.
- Every target is at least 44 px. Focus uses a 3 px cyan outline with a 3 px offset.
- Scene tabs support Left, Right, Home, and End. Sliders use native arrow-key behaviour.
- Status copy names the current source and tells the user what to do next.

## Motion policy

The signature motion is a slow neon transformer pulse in the poster art. The live canvas moves only while the user has chosen sample audio, a file, or a microphone. UI transitions last 180–240 ms and animate opacity or transforms.

With `prefers-reduced-motion: reduce`, the pulse and all transitions stop. The component defaults to its static poster unless the host explicitly sets motion to `full`; the playground also exposes a Static setting. Nothing flashes above 3 Hz.

## Original asset plan and provenance

- `hero-market.webp`: an original wide illustration generated on 2026-08-28 with the factory image model through `/opt/fleet/lib/gen-image.sh`. Prompt: “Wide editorial illustration for an audio-reactive web component landing page. A compact night-market sound booth after rain, viewed straight on, with three abstract neon signs suggesting flowing ribbons, lantern particles, and a calm horizon. Deep ink-black and navy, cyan tubes, coral and marigold lamps, cream paper tickets, tactile screen-print grain, subtle wet pavement reflections. No people, no brands, no readable text, no logos, no gradients, no UI mockup. Leave the left third calm enough for cropping. Distinct handmade sign-painter character, sophisticated and restrained, 3:2 composition.” Deployment and size are recorded in the adjacent JSON provenance file.
- The Open Graph image is composed locally from the same generated art with HTML text kept outside the image where it matters.
- Canvas scenes and icons are hand-coded from geometric primitives in this repository. They contain no third-party assets.
- `night-market-loop.wav` is an original eight-second percussion, bass, and bell loop generated deterministically by the hand-written `scripts/generate-sample.mjs` synthesis script. It contains no sampled or third-party audio.

The generated art is decorative and receives empty alt text on the page. The live canvas has a text alternative that names its selected scene and source state.
