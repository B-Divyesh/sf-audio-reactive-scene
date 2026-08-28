# Demo sandbox

- URL: `https://audio-reactive-scene.sociobot.in/demo` or local `http://localhost:5173/demo`.
- One-click entry: “Try it with sample data” on the first screen opens `/demo` and starts the bundled oscillator loop.
- Sample data: a browser-made three-tone loop. It uses no audio download and no remote request.
- Reset: “Reset demo” stops active audio or microphone tracks and restores Ribbons, 70% intensity, and System setting.
- Leave: “Start for real” stops the source and returns home.
- Storage namespace: none. Demo state stays in memory and is discarded on navigation or reload. It never reads or writes user storage.
- Offline check: visit once, wait for the service worker, then reload `/demo` without a network.
