# Audio Reactive Scene

Make page audio move a small, private canvas.

Audio Reactive Scene is a typed web component for indie sites, streams, and event pages. It ships three canvas scenes, an intensity control, automatic motion reduction, and a static poster. Audio stays inside the browser tab. The package has no runtime dependencies.

[Try the sample demo](https://audio-reactive-scene.sociobot.in/demo). It starts a local three-tone loop in one click. Nothing is saved.

## Install

```sh
npm install audio-reactive-scene
```

The package ships ESM, CommonJS, TypeScript declarations, component styles, and no runtime dependencies.

## Use it

Import the package and add the element:

```html
<script type="module">
  import 'audio-reactive-scene';
  import 'audio-reactive-scene/style.css';
</script>

<audio-reactive-scene
  scene="ribbons"
  intensity="0.7"
  motion="auto">
</audio-reactive-scene>
```

Connect the page's audio after a visitor starts playback:

```ts
import type { AudioReactiveScene } from 'audio-reactive-scene';

const audio = document.querySelector('audio')!;
const scene = document.querySelector<AudioReactiveScene>('audio-reactive-scene')!;
const context = new AudioContext();
const source = context.createMediaElementSource(audio);

audio.addEventListener('play', async () => {
  await context.resume();
  scene.connect(source);
  source.connect(context.destination);
}, { once: true });
```

The component never starts audio or requests microphone permission. The host page owns the source and user gesture.

## API

Attributes and matching properties:

- `scene`: `ribbons`, `lanterns`, or `horizon`.
- `intensity`: a number from `0` through `1`.
- `motion`: `auto`, `full`, or `static`. `auto` shows a stable poster when the system reduces motion.
- `label`: an optional accessible label for the scene.

Methods:

- `connect(source: AudioNode): AnalyserNode` connects an existing Web Audio node.
- `disconnect(): void` stops reading levels without closing the host's audio context.
- `drawPoster(): void` draws the selected scene's deterministic poster frame.
- `defineAudioReactiveScene(tagName?: string)` registers the component under the default or a custom tag.

## Develop and verify

Use Node.js 20 or newer.

```sh
npm install
npm run dev
npm test
npm run build
npm run pack:check
```

`npm run build:site` writes the deployable documentation site to `dist/site/`, with `index.html` at that root. `npm run build` also writes ESM, CommonJS, and declarations to `dist/lib/`.

The browser test suite checks every public claim from `/demo`, including offline reload, same-origin requests, scene controls, package formats, and reduced motion. See [.factory/claims.json](.factory/claims.json) for the commands and evidence paths.

## Privacy

Audio processing runs locally through Web Audio. The demo does not save audio or settings. A service worker caches public files after the first visit so the demo can reload offline. Read the site's [privacy page](https://audio-reactive-scene.sociobot.in/privacy) for details.

## Deploy and publish

Deploy the contents of `dist/site/` as a static site. The factory owns registry credentials; workers should check the tarball with `npm pack --dry-run` and must not publish it.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
