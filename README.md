# Bank Fighter

A SNES-style 2D fighting game and website. The fighters are original mascots for real corporate collapses
(Enron, WorldCom, Bear Stearns, Lehman, Theranos, FTX, Madoff, WaMu), the moves are financial terms, and the
finishers are acts of Congress.

Plain HTML, CSS and JavaScript. No build step, no dependencies. All art, sound and music are generated in code.

## Run

    python3 -m http.server 5230

Then open http://localhost:5230. Any static host works.

## Layout

- `index.html`, `play.html`, `roster.html`, `moves.html`, `legislation.html` — the site
- `js/data.js` — roster, move data and frame data, legislation finishers (shared by game and site)
- `js/gfx.js` — bitmap font, procedural fighter sprites, projectile sprites
- `js/stages.js` — stage backdrops
- `js/audio.js` — WebAudio sound effects, music sequencer, announcer
- `js/game.js` — input, fight engine, AI, modes, HUD
- `js/fatalities.js` — the five legislation finisher cutscenes
- `js/site.js` — nav, footer and the data-driven site pages

## Controls

| | P1 | P2 (versus) |
|---|---|---|
| Move | W A S D | Arrows |
| Punch / Kick / Block | F / G / H | , / . / / |

Solo, P1 can also use arrows + Z / X / C. Enter pauses, M mutes. Gamepads work (standard mapping).

`window.bankfighter` exposes a debug handle: `bankfighter.fight('training', 'enron', 'bear')`,
`bankfighter.finisher('sox')`, `bankfighter.advance(60)`.
