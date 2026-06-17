# Silkweaver Game Engine

Web-based game engine + IDE inspired by GameMaker Studio 1.4.9999. Spiritual successor, not a clone.

## Philosophy
- Uses GMS function names and concepts
- Applies TypeScript/JavaScript conventions where they make sense (0-based indexing, native arrays, Promises)
- Not a 1:1 clone—modernized where appropriate

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
npm workspaces monorepo, being split into independent, individually-usable packages
(Godot-style). Full plan + live progress: `docs/plan/00-overview/modular-architecture.md`.
- `packages/engine/` — **`@silkweaver/engine`**: runtime library (WebGL2/Web Audio). A real package — `npm i @silkweaver/engine` works; also bundled to `exports/engine.js`.
- `packages/project/` — **`@silkweaver/project`**: canonical project format types (project.json/room.json). Types-only, zero deps, the shared contract.
- `packages/build/` — **`@silkweaver/build`**: toolchain (project folder → game via codegen + esbuild) + `object_format.ts` (class-file parse/patch). Used by the IDE (over IPC) and the CLI.
- `packages/cli/` — **`@silkweaver/cli`**: `silkweaver new|build|run|export` (no-IDE / code-first workflow).
- `packages/ide/` — the GMS-style web IDE (bundled to `exports/ide.js`).
- `packages/electron/` — desktop host for the IDE (`main.ts` + `preload.ts`; imports `@silkweaver/build`).
- `packages/installer/` — legacy scaffolding (superseded by `silkweaver new`).

Objects are **one class file per object**: `objects/<name>.ts` exporting a `gm_object` subclass —
`static` fields = metadata (sprite/solid/depth/…), instance fields = variable defaults, `on_*`
methods = events. The build *imports* these classes and bundles a self-contained `game.js` (engine
inlined). The old snippet-folder format (`object.json` + per-event files) has been removed.

## Current Status
**Substantially implemented, building cleanly, mid-modularization.** Detailed progress lives in
`docs/plan/00-overview/modular-architecture.md` and `docs/plan/01-engine/gms-parity-audit.md`.

Recent work:
- **Type-safety pass** — fixed all 187 strict-mode errors; the build is genuinely clean (esbuild had been hiding them).
- **Standalone export** — `Run → Export HTML5 / Windows / macOS / Linux`: portable HTML5 folder + Electron-packaged executable.
- **GMS parity** — all 24 object events + per-instance `alarm[]` wired; usable collision (manual masks for spriteless objects + `collision_*`/`instance_place`); instance-var ergonomics (index signature + class fields).
- **Generated editor types** — Monaco autocomplete is generated from the engine (`npm run gen:types`), not hand-written; the code-gen imports the whole engine API (tree-shaken), so types ≡ availability.
- **Modular split** — `@silkweaver/{engine, project, build, cli}` are real packages; the code-first CLI works end-to-end (`silkweaver new mygame && silkweaver run`).

Deferred: a rich object-editor GUI over the class (parse/patch ops are built + tested, just not wired — needs GUI testing); physics metadata as `static` fields; a large UI pass; finishing the split (slim electron, fold the IDE's `room_data` into `@silkweaver/project`).

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
| Timers | Named (not alarm[0-11]) | More intuitive |
| Views | Unlimited | WebGL capability |
| Game objects | Class-based | Modern OOP |
| Async | Promise-based | Web standard |

## Engine Subsystems (Implemented)
Core loop, drawing/graphics, instance/object system, input (keyboard/mouse/gamepad/touch), audio (incl. 3D/spatial), physics (matter.js), networking (WebSocket/WebRTC/HTTP/buffers), data structures (all `ds_*`), storage (ini/file/json), math/utils, 3D basics (matrices/lighting/OBJ), particles

## Commands
- Build bundles: `npm run build` (engine + ide + installer)
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
