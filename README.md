# Silkweaver Game Engine

A GameMaker Studio 1.4–inspired web game engine **and** IDE, written in modern TypeScript —
along with some other cool stuff :3

Silkweaver is a spiritual successor to GMS 1.4, not a clone: it keeps the familiar GMS function
names and concepts (`draw_sprite`, `instance_create`, objects/rooms/sprites…) but applies sensible
TypeScript/JS conventions (0-based indexing, native arrays, Promises, class-based objects).

- **Rendering:** WebGL 2 · **Audio:** Web Audio · **Physics:** matter.js · **Editor:** Monaco
- **License:** GPL-3.0

## Architecture

A npm-workspaces monorepo, split into independent, individually-usable packages (Godot-style):

| Package | What it is |
|---|---|
| **`@silkweaver/engine`** | The runtime library (WebGL2/Web Audio). `npm i @silkweaver/engine` and write a game in code. |
| **`@silkweaver/project`** | The canonical project format types (`project.json` / `room.json`). Types only, zero deps. |
| **`@silkweaver/build`** | The toolchain: a project folder → a self-contained `game.js` (codegen + esbuild), plus HTML5/executable export. |
| **`@silkweaver/cli`** | `silkweaver new \| build \| run \| export` — the no-IDE, code-first workflow. |
| **`@silkweaver/ide`** | The GMS-style web IDE (runs inside the Electron host). |
| **`@silkweaver/electron`** | The desktop host for the IDE. |

The engine, project, build, and cli packages are real and usable on their own. The IDE and CLI are
interchangeable front-ends over the same project folder.

## Getting started

### Code-first (no IDE)

```sh
npm install            # once, at the repo root (links the workspace packages)
npm run build:tooling  # builds the engine + @silkweaver/build + @silkweaver/cli

npx silkweaver new my-game     # scaffold a project (an npm package)
cd my-game
npx silkweaver run             # build, serve over http, and open in the browser
npx silkweaver export . --target win   # or web | mac | linux
```

A game is **one class file per object** — `objects/<name>.ts` exporting a `gm_object` subclass:

```ts
import { gm_object, keyboard_check, vk_right, draw_self } from '@silkweaver/engine'

export class obj_player extends gm_object {
    static sprite = 'spr_player'   // static fields = object metadata
    static solid  = true
    hp = 100                       // instance fields = variable defaults

    on_step() { if (keyboard_check(vk_right)) this.x += 4 }   // on_* methods = events
    on_draw() { draw_self() }
}
```

### GUI (the IDE)

```sh
npm install
npm run electron       # builds the IDE + tooling, then launches the desktop app
```

## Building from source

| Command | What it does |
|---|---|
| `npm run build` | Bundles the engine, IDE, and installer to `exports/`. |
| `npm run build:tooling` | Builds the Node toolchain (engine `dist`, `@silkweaver/build`, `@silkweaver/cli`). |
| `npm run build:electron` | Builds the desktop host (runs `build:tooling` first). |
| `npm run electron` | Builds everything the IDE needs and launches it. |
| `npm run gen:types` | Regenerates the editor's autocomplete types from the engine (auto-run by `build:ide`). |
| `npx tsc -b` | Type-checks the engine + IDE (strict mode). |

## Status

Substantially implemented and building cleanly, mid-modularization. The full subsystem list, the
modular-architecture plan, and the GMS-parity audit live in [`docs/plan/`](docs/plan/) — start at
[`docs/plan/README.md`](docs/plan/README.md).

Thanks for trying this out, and happy weaving. 🕸️
