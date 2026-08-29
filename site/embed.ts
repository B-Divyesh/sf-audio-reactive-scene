export const embedSnippet = `<button id="play-scene-audio" type="button">Play audio</button>
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
<\/script>`;
