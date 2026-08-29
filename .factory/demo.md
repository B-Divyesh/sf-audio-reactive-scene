# Demo sandbox

- URL: `https://audio-reactive-scene.sociobot.in/demo?demo=1` or local `http://localhost:5173/demo?demo=1`.
- One-click entry: “Try it with sample data” on the first screen opens the isolated `?demo=1` route and starts the bundled percussion loop from that click gesture.
- Direct entry: `/demo?demo=1` opens the compact sample playground with its live canvas and demo controls. Audio stays stopped until the visitor presses Play sample audio.
- Sample data: `site/public/assets/night-market-loop.wav`, an original eight-second percussion, bass, and bell loop synthesized by `scripts/generate-sample.mjs`. It is bundled with the site and cached for offline use.
- Reset: “Reset demo” stops active audio or microphone tracks and restores Ribbons, 70% intensity, and System setting.
- Open package instructions: stops the source and opens the package instructions on the landing page.
- Storage namespace: none. Demo state stays in memory and is discarded on navigation or reload. It never reads or writes user storage.
- Offline check: visit once, wait for the service worker, then reload `/demo` without a network.
