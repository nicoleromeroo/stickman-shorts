# engine3d — 3D cartoon Shorts engine
Flat 2D bean-head character cards in a toon-shaded 3D world, black ink outlines, lens blur, gliding cameras, HUD text.
three.js r160 rendered headless in Chromium (SwiftShader), ~1.5–2 s per 1080×1920 frame.

- `core.js` — renderer, toon materials, set-piece helpers, lights (day/autumn/golden/interior), cards, ink + DOF + grade, HUD.
- `toonbase.js` — Pen drawing API + bodyFront characters (from github.com/mromidev/claude-animated-shorts, MIT), extended with
  arm presets, held props, blush.
- `cast.js` — person(), bust(), outfit(), props + effect cards. `paint.js` — painted canvas textures. `motion.js` — easing, cameras, idles.
- `timing.py` — aligns script sentences to the pauses in a recording (no speech recognition needed).
- `render.mjs`, `sheet.py`, `sound3d.py` (synth music presets + SFX), `mix.py` (music −6 dB under the voice), `build.sh`.

Worked example: `examples3d/eiffel/` ("The Man Who Sold the Eiffel Tower", 40 s, 14 shots).
