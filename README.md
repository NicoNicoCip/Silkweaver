# Silkweaver

A game engine and editor for making 2D games, inspired by GameMaker Studio 1.4.

If you ever used GMS 1.4, Silkweaver will feel familiar on purpose — the same function names
(`draw_sprite`, `instance_create`, `keyboard_check`), the same way of thinking in sprites, objects,
rooms, and events. It's a spiritual successor rather than a clone: written in modern TypeScript, it
keeps what made GMS pleasant and quietly fixes the bits that didn't age well (0-based indexing,
native arrays, Promises, real classes).

It comes in two halves you can use together or apart:

- a **runtime engine** — `@silkweaver/engine`, a WebGL 2 + Web Audio library you can `npm install`
  and write a game against in plain code;
- a **desktop IDE** — a GameMaker-style editor with the sprite/object/room editors, a code editor,
  and one-click Play and Export.

WebGL 2 rendering · Web Audio · matter.js physics · GPL-3.0.

---

## Who's this for?

**You want to make a game.** Start with the IDE if you like a visual editor, or the CLI if you'd
rather just write code. Either way you get the familiar GameMaker workflow and can export a
self-contained HTML5 build or a desktop executable when you're done.

**You want the engine, not the editor.** `@silkweaver/engine` stands on its own — install it, import
the functions you need, and drive your own game loop. No project format, no IDE, no lock-in.

Both paths read and write the same plain project folder, so you can move between them whenever you
like.

---

## Make a game

### With the IDE

The friendliest way in — no terminal required. Grab the installer for your OS from the
[Releases](https://github.com/NicoNicoCip/Silkweaver/releases) page, install it, and open it. You get
a GameMaker-style window: a resource tree on the side, editors for sprites/objects/rooms/etc., and
**Play** / **Export** buttons.

Prefer to run it from source?

```sh
npm install
npm run electron        # builds everything the IDE needs, then launches it
```

### In code (the CLI)

If you'd rather live in your editor:

```sh
npx silkweaver new my-game     # scaffold a project
cd my-game
npx silkweaver run             # build, serve, and open it in the browser
npx silkweaver export . --target win   # or web | mac | linux
```

A game is **one file per object** — `objects/<name>.ts`, a class extending `gm_object`. Static fields
are the object's settings, instance fields are its variables, and `on_*` methods are its events:

```ts
export class obj_player extends gm_object {
    static sprite = 'spr_player'    // object settings
    static solid  = true
    spd = 4                         // your own instance variable

    on_step() {                     // events
        if (keyboard_check(vk_right)) sw.x += inst.spd
        if (keyboard_check(vk_left))  sw.x -= inst.spd
    }

    on_draw() {
        sw.draw_self()
    }
}
```

Engine functions (`keyboard_check`, `draw_text`, …) are available without imports — the build wires
them in for you. The current instance's built-ins live on `sw.` (`sw.x`, `sw.draw_self()`), your own
variables on `inst.` (`inst.hp`), and game-wide state on `global.` (`global.score`). `this.` stays
plain JavaScript.

---

## Use the engine on its own

No editor, no project folder — just the library:

```sh
npm install @silkweaver/engine
```

```ts
import { renderer, game_loop, draw_set_color, draw_rectangle, c_white } from '@silkweaver/engine'

renderer.init(document.querySelector('canvas'), 640, 480)
game_loop.register(EVENT_TYPE.draw, () => {
    draw_set_color(c_white)
    draw_rectangle(32, 32, 96, 96, false)
})
game_loop.start()
```

You get the whole GMS-style surface — drawing, sprites, audio (incl. 3D), physics, input, paths,
timelines, particles, data structures, networking, and the maths/string helpers.

---

## Documentation

The full API reference is generated straight from the engine's source and JSDoc, so it can't drift
from the code. It's a single self-contained page — open
[`docs/api/index.html`](docs/api/index.html) in any browser, or hit **F1** (Help → Documentation)
inside the IDE. Hand-written guides live in [`docs/guides/`](docs/guides/); run `npm run gen:docs`
to rebuild the reference after changing the engine.

---

## The packages

Silkweaver is an npm-workspaces monorepo, split into pieces you can use independently:

| Package | What it is |
|---|---|
| **`@silkweaver/engine`** | The runtime library (WebGL2 / Web Audio). Usable on its own. |
| **`@silkweaver/project`** | The project-format types (`project.json` / `room.json`). Types only, zero deps. |
| **`@silkweaver/build`** | The toolchain: a project folder → a self-contained `game.js`, plus HTML5/executable export. |
| **`@silkweaver/cli`** | `silkweaver new \| build \| run \| export` — the code-first workflow. |
| `packages/ide` | The GameMaker-style editor (runs inside the desktop host). |
| `packages/electron` | The desktop host for the IDE. |

## Building from source

| Command | What it does |
|---|---|
| `npm run electron` | Builds the IDE + tooling and launches the desktop app. |
| `npm run dist` | Builds a standalone installer for the current OS (→ `dist-installer/`). |
| `npm run build:tooling` | Builds the Node toolchain (engine `dist`, `@silkweaver/build`, `@silkweaver/cli`). |
| `npm run gen:types` | Regenerates the editor's autocomplete types from the engine (auto-run by `build:ide`). |
| `npm run gen:docs` | Regenerates the API reference → `docs/api/index.html`. |
| `npx tsc -b` | Type-checks the engine + IDE (strict mode). |

---

## Status

**1.3.3 — feature-complete.** The GameMaker 1.4 surface (everything except drag-and-drop) is
implemented across the engine, the toolchain, and the IDE, and the whole monorepo type-checks and
builds cleanly. It's a labour of love; if something's rough or missing, issues and PRs are welcome.

Thanks for trying this out, and happy weaving. 🕸️
