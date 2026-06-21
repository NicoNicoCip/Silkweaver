# @silkweaver/engine

The runtime engine behind [Silkweaver](https://github.com/FinnWillow/Silkweaver) — a 2D game engine
inspired by GameMaker Studio 1.4, written in TypeScript and rendering with WebGL 2.

You can use it entirely on its own: no editor, no project format, no build step you don't control.
Install it, import the functions you need, and drive your own loop.

```sh
npm install @silkweaver/engine
```

```ts
import { renderer, game_loop, EVENT_TYPE, draw_set_color, draw_rectangle, c_white } from '@silkweaver/engine'

renderer.init(document.querySelector('canvas'), 640, 480)

game_loop.register(EVENT_TYPE.draw, () => {
    draw_set_color(c_white)
    draw_rectangle(32, 32, 96, 96, false)
})

game_loop.start()
```

If you've used GameMaker, the API will feel familiar — the same names (`draw_sprite`,
`instance_create`, `keyboard_check`, `audio_play_sound`), adjusted to sensible JS conventions
(0-based indexing, native arrays, Promises). You get drawing, sprites, audio (including 3D/spatial),
matter.js physics, input (keyboard/mouse/gamepad/touch), paths, timelines, particles, the `ds_*`
data structures, networking, and the maths/string/random helpers.

- **Rendering:** WebGL 2 · **Audio:** Web Audio · **Physics:** matter.js
- **Docs:** the full, source-generated API reference lives in the
  [main repository](https://github.com/FinnWillow/Silkweaver).
- **License:** GPL-3.0

Want sprites/objects/rooms and a visual editor instead of wiring the loop yourself? That's the rest
of Silkweaver — the IDE and the `silkweaver` CLI.
