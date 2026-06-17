# Modular Architecture (Godot-style separation)

Goal: decouple **engine**, **toolchain**, **player**, and **editor** into independent,
individually-usable modules — so a developer can take just the engine (code-only games),
just the CLI (build/run from VS Code, no GUI), add the IDE on top if they want, or host
the player alone. Modelled on Godot's separation (engine ⟂ editor ⟂ export templates ⟂ CLI).

## Current reality (grounded in the code)

Good news — it's less tangled than it feels:

- **The engine is already import-clean.** `packages/engine` imports *nothing* from ide /
  electron / installer, and the IDE never imports engine source — it builds a `game.js`
  and loads it in an iframe. Runtime separation already exists.
- **But nothing is a real package.** `packages/engine` has no `package.json`; none of the
  packages declare dependencies or publishable entry points. The split is physical (folders),
  not consumable (you can't `npm install @silkweaver/engine`).
- **The build toolchain is trapped in the electron package.** `packages/electron/src/build.ts`
  is pure Node (codegen + esbuild + HTML5/exe export) but is only reachable through Electron
  IPC. No CLI ⇒ you cannot build or run a project without the desktop app.
- **The project format is duplicated 5×.** The format (project.json / object.json / room.json)
  is the real contract, but its types live independently in `build.ts` (`project_data`),
  `object_editor` (`object_data`), `room_editor` (`room_data`), `services/project.ts`
  (`project_state`), and the `installer`. Changing the format means editing 5 files by hand
  (e.g. the new `variables` field had to be added to the editor *and* the codegen separately).
- **No player/runtime-host module.** The "player" is implicit: an IDE iframe page plus the
  HTML the toolchain generates. Nothing you can run on its own.
- **The engine is browser-coupled** (WebGL2 / Web Audio / DOM) — correct for a runtime, but
  it means there is no true *headless* rendering (see Caveats).

So the work is **packaging + extraction + a shared contract**, not untangling imports.

## Target architecture

Five packages in a strict, acyclic, bottom-up dependency layering. Each is usable alone.

```
@silkweaver/project   (format types + JSON schema + read/write helpers; zero runtime deps)
@silkweaver/engine    (runtime library: WebGL2/Web Audio; matter-js peer; no editor deps)
        │                 ← this IS "just the runtime"
@silkweaver/build     (toolchain: project → game bundle, + export targets html5/exe)
        │                 depends on: project, engine, esbuild
@silkweaver/cli       (silkweaver new|build|run|export — the no-IDE workflow; run = build → serve → open)
        │                 depends on: build, project, installer
@silkweaver/ide       (optional GUI editor; Monaco; uses generated engine types)
                          depends on: build, project, engine (types only)

@silkweaver/electron  → shrinks to "desktop host for the IDE"
```

Dependency rules: `project` and `engine` are leaves. `build` may depend on both. Nothing
depends on `ide`. No cycles. The engine never depends on `project` (the *build* layer maps
project → engine API calls; the engine is pure runtime).

### Why there is no separate `@silkweaver/player`
esbuild bundles the engine *into* `game.js`, so a built game is self-contained — the "player"
loads no engine and adds no runtime; it is just a host shell (a ~30-line HTML page for web, an
Electron `game://` wrapper for desktop). Those are **build outputs / export targets** (Godot's
"export templates"), not a dependency anyone imports. They live in `@silkweaver/build`, which
already emits both. The thing a "runtime-only" developer actually wants is `@silkweaver/engine`.
(A generic drag-and-drop "Silkweaver Player" desktop app — runs any built game folder — could
exist later as an optional *app*, trivially derived from the Electron wrapper, but it is not a
foundational package.)

### "Usable alone" scenarios this unlocks
- **Engine only (the runtime):** `npm i @silkweaver/engine`, write a game in TypeScript, bundle it yourself.
- **CLI only (VS Code, no GUI):** `silkweaver build ./mygame`, `silkweaver run ./mygame`,
  `silkweaver export ./mygame --target win`. Edit code + assets in any editor.
- **IDE on top:** launch the GUI; it drives the same `build` toolchain the CLI uses.
- **Run/host a built game:** it is a self-contained folder — drop it on any static host (web)
  or ship the packaged exe. No special player needed.

## Developer experience (decided)

Three personas, **one shared project folder** that is a normal **npm package**:

- **GUI-first** — downloads the self-contained Silkweaver IDE (Electron; engine + toolchain +
  editor bundled, no Node/terminal). File → New scaffolds the project; edit visually, Play, Export.
- **Code-first** — `npm create silkweaver@latest my-game`, edit the *same* folder in VS Code,
  `npx silkweaver run` / `export`. Autocomplete works (generated `engine.d.ts` ships in the project).
- **Library** — `npm i @silkweaver/engine`, write your own classes + bootstrap, bundle with your
  own tooling. No project format, no CLI — the engine is just a library.

The IDE and CLI are interchangeable front-ends over the same folder; everything is readable and
configurable (Godot-like), so a GUI user can graduate to code without learning a new system.

**Distribution:** npm (`npm create`) + the bundled IDE app. The GitHub-branch-assembly installer
is **retired** (npm gives versioning, updates, offline installs for free).

### Authoring model: one class per object (decided — option B)

An object is a single `.ts` file: a `gm_object` subclass. Static fields are object metadata,
instance fields are variable definitions (typed, with defaults), methods are events:

```ts
export class obj_player extends gm_object {
    static sprite = 'spr_player'
    static solid  = true
    hp    = 100
    on_create() { /* … */ }
    on_step()   { const speed = 4; this.x += speed }
    on_draw()   { draw_self() }
}
```

The IDE presents the methods as event tabs (hiding the class wrapper); the code-first dev gets one
typed file with per-event scopes (no false "duplicate" errors, `this` is typed). This aligns with
the existing "Game objects: Class-based" decision and *simplifies* codegen (bundle the class as-is
instead of wrapping snippet files). It replaces the current snippet-folder format (`create.ts`,
`step.ts`) and folds the object.json `variables` array into native class fields.

**Object metadata location: all-in-class (decided).** No `object.json` sidecar — everything lives
in the class file. The mapping:

| Concept            | On disk                          | Example |
|--------------------|----------------------------------|---------|
| Object metadata    | `static` fields                  | `static sprite = 'spr_player'`, `static solid = true`, `static depth = 0`, `static persistent = false`, `static visible = true`, `static parent = obj_base` |
| Instance variables | instance fields (typed defaults) | `hp = 100` |
| Events             | `on_*` methods                   | `on_create()`, `on_step()`, `on_draw()`, `on_alarm(i)`, `on_collision(other)`, … |

File layout: one file per object at `objects/<name>.ts` (flat, like `scripts/<name>.ts`). The
IDE's sprite picker / checkboxes read & write the `static` fields via a small TS read/write layer.

**Migration phases (each green):**
1. ✅ **engine** — `gm_object` applies `static` metadata (solid/visible/persistent/depth) to instances on construction.
2. ✅ **codegen** — an object can be a single `objects/<name>.ts` class; the codegen imports it as-is
   (instead of generating a class from snippets). The engine is referenced via the `@silkweaver/engine`
   specifier (entry + class files alike), aliased by esbuild to the bundle so it's deduped. Both formats
   coexist; the snippet sample still exports unchanged.
3. ✅ **IDE — class-file authoring loop.** `object_format.ts` (TS compiler API) parses an object
   class and surgically patches it (set static / set field / add-remove method), preserving the
   user's code — exposed over IPC (`sw:object-op`). New objects scaffold `objects/<name>.ts`;
   class-file objects open in the code editor (accurate autocomplete); legacy snippet objects fall
   back to the classic editor. Verified end-to-end (scaffold → patch → build). *Deferred until
   GUI-testable:* a rich object-editor GUI (checkboxes / event-tabs) driven by the (already tested)
   patch ops — the foundation is in place.
4. ✅ **sample migrated + snippet format dropped + sprite-by-name** — **DONE.** The Platformer
   Demo's 4 objects are now class files (`objects/<name>.ts`); the snippet-folder codegen path is
   removed (the codegen just imports the classes). Added an engine sprite-name registry
   (`sprite_register_name` / `sprite_get_index`); `gm_object` resolves `static sprite = 'name'` to
   `sprite_index` on construction.
   ✅ **Physics metadata** is now done too: `static physics`/`physics_shape`/`physics_density`/
   `physics_restitution`/`physics_friction`/`physics_sensor` on `gm_object`. An instance lazily binds
   a matter.js body on its first physics step (size from the mask/bbox; density ≤ 0 ⇒ static), the
   loop steps the world + syncs x/y/image_angle between Step and End Step, and the build creates the
   world from the room's `physics_world`/gravity. `phy_apply_force/impulse`, `phy_set_position`,
   `phy_speed_x/y` round out the instance API. Verified by Node sim (a box falls and rests on a
   static floor) + codegen emission of `physics_world_create`.

## Migration path (incremental — green build at every step)

> **Order note:** `@silkweaver/engine` was packaged *first* (not `project`), because the
> `project` package encodes the on-disk format, which the authoring-model change (class-per-object)
> is about to rework — no point cementing it yet. The engine package is decision-independent.

1. ✅ **`@silkweaver/project`** (the contract) — **DONE.** A types-only package (zero deps,
   browser-safe, consumed via `import type`) holding the canonical `project_file` / `project_settings`
   / `project_resources` / `room_file` / `room_instance`. Adopted by both `build` (electron) and the
   IDE (`services/project.ts`), ending the project.json shape duplication. Object metadata is in the
   class now; the IDE's richer `room_data` (instances + background layers + views + physics) **has
   been folded in** too — `room_instance`/`room_background_layer`/`room_view`/`room_file` are
   canonical, adopted by `room_editor.ts` and the build. The format contract is now fully centralized.
2. ✅ **`@silkweaver/engine` is a real package** — **DONE.** `packages/engine/package.json`
   (`@silkweaver/engine`, exports → `dist/index.{js,d.ts}`, matter-js dep). `tsc -b` already emits
   `dist`; verified importable by name (729 exports). Fixed the one file (`room.ts`) with
   extensionless imports that broke Node ESM resolution. Enables `npm i @silkweaver/engine`.
3. ✅ **`@silkweaver/build`** (the toolchain) — **DONE.** `build.ts` + `object_format.ts` moved into
   `packages/build` (depends on engine/project/esbuild/typescript/@electron/packager). Decoupled all
   `__dirname` couplings: the engine is resolved via `require.resolve('@silkweaver/engine')` (alias +
   name source), esbuild via `require('esbuild')`, the default icon ships in the package's `assets/`,
   and `build_preview` takes the output path as a parameter (electron passes `exports/game.js`).
   Electron's `main.ts` now imports `@silkweaver/build`. Built via `npm run build:tooling`; runtime
   verified (game export through the package works). This is the prerequisite for the CLI.
4. ✅ **`@silkweaver/cli`** — **DONE.** `silkweaver new|build|run|export` (bin in `packages/cli`),
   driving `@silkweaver/build`. `new` scaffolds an npm-package project (project.json, package.json,
   tsconfig, a sample `obj_player` class, a room); `build`/`export` produce a portable HTML5 folder
   or a packaged exe (`--target web|win|mac|linux`); `run` builds → serves over http (a built-in
   static server) → opens the browser. Verified: build/export on the sample, and **`new` → `build`
   is a complete no-IDE loop** (the scaffold builds to a 133KB game with no `npm install`, since the
   build aliases the engine). The code-first persona is now real.
5. ✅ **Slim `@silkweaver/electron`** — **DONE.** The package is now just the IDE desktop host
   (`main.ts` + `preload.ts`; the toolchain already moved to `@silkweaver/build`). Dependencies are
   explicit: electron `dependencies: @silkweaver/build` (+ `electron` peer); the IDE declares
   `@silkweaver/project` (type-only). The five-package split is complete.

Each step compiles, type-checks, and builds before the next — no big-bang rewrite.

**Status: the modular split is done.** `@silkweaver/{project, engine, build, cli}` are real,
independently-usable packages with an explicit, acyclic dependency graph; electron + ide are
front-ends over them. Remaining work is feature/polish, not architecture: the rich object-editor GUI
(patch ops ready, needs GUI testing), GMS parity gaps (tiles, `mp_*`, global functions, room runtime
wiring), and the big UI pass. (Physics metadata as static fields — done.)

## Key decisions & caveats

- **No true headless.** The engine needs a GPU/WebGL context, so "run from the CLI" means the
  CLI *builds* then launches a browser/Electron window (export-template style), not headless
  pixel rendering. Godot ships a separate headless server build; the web engine can't cheaply.
  Acceptable: the CLI is a build/run *orchestrator*.
- **Keep the monorepo** (npm workspaces); just make each package real, independently
  versioned, and publishable. Don't split repos. Aligns with the existing `origami-branches`
  distribution (engine package ↔ engine branch, templates ↔ template branches).
- **Format/engine compatibility** belongs to `@silkweaver/project`: carry a schema version and
  an engine-version range (the installer's `version-manifest` already models `engineRange`).
- **matter-js** stays a peer/optional dependency of the engine (physics is opt-in).
