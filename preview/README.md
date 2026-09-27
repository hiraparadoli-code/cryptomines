# REACTOR RIFT — VISUAL PREVIEW (isolated, dev-only)

This folder is a **standalone visual prototype**. It contains NO production math.

- All outcomes are **scripted deterministic demo rounds** (`src/demoRounds.js`).
  No `Math.random()` is used anywhere in this preview.
- Nothing here imports or modifies `games/reactor_rift/` (GameConfig, math SDK
  integration, simulators, publication files). Production outcomes must come from
  the Stake Engine math SDK / authoritative server event stream.
- The debug panel (`BASE / OVERCHARGE / PLASMA SHIFT / RIFT / MELTDOWN / BIG WIN /
  RESET`) exists only in this preview and must never ship in a production build.
- RTP 96–97% and MAX WIN 10,000× shown in the rules modal are DESIGN TARGETS,
  pending mathematical validation by the simulation suite.

## Run (dev)
```bash
cd preview
python3 -m http.server 4173
# open http://localhost:4173/index.html
```
(Any static server works, e.g. `npx serve -l 4173 .`.)

## Files
- `index.html` — entry (route equivalent: /reactor-rift-preview)
- `src/main.js` — UI shell + scripted round runner (emulates consuming an ordered event list)
- `src/demoRounds.js` — PREVIEW-ONLY demo scripts (8 looping rounds)
- `src/symbols.js` — original placeholder SVG symbol art
- `src/audio.js` — synthesized WebAudio SFX + sound toggle state
- `src/style.css` — forbidden-reactor theme, responsive layout (360px → 1920px)
