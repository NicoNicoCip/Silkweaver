# Silkweaver Game Engine

A **multi-platform game engine + IDE that modernizes GameMaker Studio 1.4.9999 in its own way** —
*not* web-first. Spiritual successor, not a clone. HTML5 + desktop (Electron) ship today; mobile and
console targets are planned. Platform/native features (Steam, IAP, achievements…) sit behind a thin
capability layer the host provides, so the engine/runtime stays portable TS/WebGL2.

## Philosophy
- Uses GMS function names and concepts; aims for GMS 1.4's full capability surface (everything except drag-and-drop)
- Applies TypeScript/JavaScript conventions where they make sense (0-based indexing, native arrays, Promises)
- Not a 1:1 clone—modernized where appropriate; multi-platform, not web-only

## Tech Stack
- **Language**: TypeScript (ES2020, strict mode)
- **Rendering**: WebGL 2 only
- **Audio**: Web Audio API
- **Physics**: matter.js (thin wrapper)
- **Code Editor**: Monaco
- **Collaboration**: WebSocket + Yjs (CRDT)
- **Bundler**: esbuild
- **License**: GPL-3.0

## Architecture
npm workspaces monorepo, split into independent, individually-usable packages (Godot-style).
- `packages/engine/` — **`@silkweaver/engine`**: runtime library (WebGL2/Web Audio). A real package — `npm i @silkweaver/engine` works; also bundled to `exports/engine.js`.
- `packages/project/` — **`@silkweaver/project`**: canonical project format types (project.json/room.json). Types-only, zero deps, the shared contract.
- `packages/build/` — **`@silkweaver/build`**: toolchain (project folder → game via codegen + esbuild) + `object_format.ts` (class-file parse/patch). Used by the IDE (over IPC) and the CLI.
- `packages/cli/` — **`@silkweaver/cli`**: `silkweaver new|build|run|export` (no-IDE / code-first workflow).
- `packages/ide/` — the GMS-style web IDE (bundled to `exports/ide.js`).
- `packages/electron/` — desktop host for the IDE (`main.ts` + `preload.ts`; imports `@silkweaver/build`).

Objects are **one class file per object**: `objects/<name>.ts` exporting a `gm_object` subclass —
`static` fields = metadata (sprite/solid/depth/…), instance fields = variable defaults, `on_*`
methods = events. The build *imports* these classes and bundles a self-contained `game.js` (engine
inlined). The old snippet-folder format (`object.json` + per-event files) has been removed.

## Current Status
**1.0.0 — feature-complete and building cleanly.** The GMS-1.4-style engine + IDE are done; the
project is in the wrap-up/shipping phase (cleanup, npm publish prep, a standalone IDE installer).

What's in place:
- **Engine** — full GMS-1.4 capability surface (everything except drag-and-drop): all 24 object
  events + `alarm[]`, collision, physics (matter.js), tiles/tilesets, `mp_*` pathfinding, paths,
  timelines, fonts, views/backgrounds (editor + runtime), particles, 3D basics, networking, all
  `ds_*`, storage, audio (incl. 3D), and the global fns (`show_message`/`fps`/`delta_time`/…).
- **Modular packages** — `@silkweaver/{engine, project, build, cli}` are real, independently
  publishable packages with explicit deps; the code-first CLI works end-to-end
  (`silkweaver new mygame && silkweaver run`). `ide`/`electron` are the app side (private).
- **IDE** — GMS-style editors for every resource (sprite/object/room/path/timeline/font/sound/
  background/script), Monaco code editing with generated-from-engine autocomplete, an in-IDE
  Documentation window (Help → Documentation / F1), and standalone export (HTML5 + packaged exe).
- **Build pipeline** — project folder → self-contained `game.js` (engine inlined via esbuild);
  rooms/instances/tiles/views/backgrounds/fonts/paths/timelines/physics all wired through codegen.
- **Persistent rooms** — rooms carry a `builder` closure; non-persistent rooms rebuild fresh on
  entry, persistent rooms keep their live state.

Remaining (wrap-up phase): npm publish (config ready; needs `npm login` + a manual `npm publish`),
the standalone IDE installer (electron-builder), and dogfooding a real game.

### Strict TypeScript notes
The build uses `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
When indexing arrays/maps, handle (or assert with `!` only where provably valid)
the `| undefined`; do not pass `undefined` to optional object properties (use a
conditional spread: `...(x && { x })`).

## Key Design Decisions
| Aspect | Choice | Reason |
|--------|--------|--------|
| API names | GMS function names (`draw_sprite`, `instance_create`) | Familiarity |
| String indexing | 0-based | JS convention |
| Arrays | Native JS arrays | TypeScript support |
| Timers | Numbered `alarm[0..11]` + `on_alarm(index)` | GMS parity |
| Views | Unlimited | WebGL capability |
| Game objects | Class-based | Modern OOP |
| Async | Promise-based | Web standard |

## Engine Subsystems (Implemented)
Core loop, drawing/graphics, instance/object system, input (keyboard/mouse/gamepad/touch), audio (incl. 3D/spatial), physics (matter.js), networking (WebSocket/WebRTC/HTTP/buffers), data structures (all `ds_*`), storage (ini/file/json), math/utils, 3D basics (matrices/lighting/OBJ), particles

## Commands
- Build bundles: `npm run build` (engine + ide)
- Build Node toolchain: `npm run build:tooling` (engine `dist` + `@silkweaver/build` + `@silkweaver/cli`)
- Launch IDE (desktop): `npm run electron`
- Build electron host: `npm run build:electron` (runs `build:tooling` first)
- Typecheck: `npx tsc -b` (engine + ide); build/cli/electron via their own `tsc -p` (chained in the build scripts)
- Regenerate editor types after an engine API change: `npm run gen:types` (auto-run by `build:ide`)
- Code-first CLI (no IDE): `silkweaver new <name>` → `silkweaver build|run|export [project]`
- Engine entry: `packages/engine/src/index.ts`

## Code Style

### Comments
- **Classes**: JSDoc block with description
- **Properties**: Inline comment at end of line (`// description`)
- **Methods**: JSDoc block with `@param` and `@returns` as needed

Example:
```ts
/**
 * Brief class description.
 */
export class example_class {
    private value: number = 0    // What this property does

    /**
     * Brief method description.
     * @param input - Description of parameter
     * @returns Description of return value
     */
    public method(input: string): boolean {
        // ...
    }
}
```
