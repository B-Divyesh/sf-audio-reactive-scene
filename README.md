# Audio Reactive Scene

Make page audio move a small canvas.

Audio Reactive Scene is a reusable HTML element for site owners, streamers, and event makers. It draws three canvas scenes from audio already playing on a page. Audio stays in the browser tab.

[Try the sample demo](https://audio-reactive-scene.sociobot.in/demo?demo=1). The page opens the scene; choose **Play sample audio** to hear an original percussion loop. Nothing is saved.

## Get the release candidate

`audio-reactive-scene` is not published to npm yet. Use the [source repository](https://github.com/B-Divyesh/sf-audio-reactive-scene) to build and test this release candidate locally.

```sh
git clone https://github.com/B-Divyesh/sf-audio-reactive-scene.git
cd sf-audio-reactive-scene
npm install
npm run build:lib
npm pack
```

Install the generated `.tgz` file in a test site. The tarball includes JavaScript for `import` and `require`, TypeScript types, element styles, and no runtime dependencies.

## Use it

The copied example in the demo contains a complete connection. Replace `/your-audio-file.wav` with your audio file.

```html
<button id="play-scene-audio" type="button">Play audio</button>
<audio id="scene-audio" src="/your-audio-file.wav" preload="metadata"></audio>
<audio-reactive-scene id="page-scene" scene="ribbons" intensity="0.7" motion="auto"></audio-reactive-scene>

<script type="module">
  import 'audio-reactive-scene';
  import 'audio-reactive-scene/style.css';

  const button = document.querySelector('#play-scene-audio');
  const audio = document.querySelector('#scene-audio');
  const scene = document.querySelector('#page-scene');
  let context;
  let source;

  button.addEventListener('click', async () => {
    context ??= new AudioContext();
    if (!source) {
      source = context.createMediaElementSource(audio);
      source.connect(context.destination);
    }
    scene.connect(source);
    audio.currentTime = 0;
    await Promise.all([context.resume(), audio.play()]);
  });
</script>
```

Web Audio is the browser connection between a playing sound and the scene. The visitor starts playback. The HTML element does not start audio or request microphone access.

## API reference

Attributes and matching properties:

- `scene`: `ribbons`, `lanterns`, or `horizon`.
- `intensity`: a number from `0` through `1`.
- `motion`: `auto`, `full`, or `static`. `auto` shows a stable poster when the system reduces motion.
- `label`: an optional accessible name for the scene.

Methods:

- `connect(source: AudioNode): AnalyserNode` connects an existing Web Audio source.
- `disconnect(): void` stops reading levels without closing the page’s audio context.
- `drawPoster(): void` draws the selected deterministic poster frame.
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

`npm run build:site` writes the deployable site to `dist/site/`, with `index.html` at its root. `npm run build` also writes the library files to `dist/lib/`.

Every product claim has one tagged test in [.factory/claims.json](.factory/claims.json). Run each listed command from a clean checkout.

## Privacy

Audio processing runs locally through Web Audio. The demo does not save audio or settings. A service worker caches public site files after the first visit so the demo can reload offline. Read the site’s [privacy page](https://audio-reactive-scene.sociobot.in/privacy).

## Deploy and publish

Deploy `dist/site/` as a static site. The factory owns registry credentials. Workers should check the tarball with `npm pack --dry-run` and must not publish it.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
