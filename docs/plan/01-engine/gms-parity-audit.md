# GMS 1.4 Parity Audit

Goal: make Silkweaver a *true* GameMaker Studio 1.4-like engine. This is the
definitive gap checklist, grounded in a read of the engine source, the IDE
object editor, the build code-gen, and the real `Platformer Demo` sample.

**Method:** read `core/instance.ts`, `core/gm_object.ts`, `core/room.ts`,
`core/game_event.ts`, `collision/collision.ts`, the IDE `object_editor.ts`, the
`electron/src/build.ts` code-gen, and the sample game's event scripts.

**Legend:** ✅ done · 🟡 partial · ❌ missing · 🐞 present but broken

---

## Tier 0 — Broken / inconsistent (fix first; these are bugs, not just gaps)

### 0.1 🐞 Most object events are authored in the IDE but dropped at build time
The object editor ([object_editor.ts:14-63](../../../packages/ide/src/editors/object_editor.ts#L14))
offers **24** event types in 9 groups: Core, Step, Draw, **Alarm 0-3**,
**Keyboard** (key_press/release/held), **Mouse** (left/right press/release),
**Collision**, **Room/Game** (room_start/end, game_start/end), **Animation End**,
**Path End**.

The build's `_event_to_method` ([build.ts](../../../packages/electron/src/build.ts))
maps only **7**: create, destroy, step, step_begin, step_end, draw, draw_gui.
**The other 17 event types generate files in the IDE but are never wired into the
game** — they silently do nothing at runtime.

Engine side: `EVENT_TYPE` ([game_event.ts](../../../packages/engine/src/core/game_event.ts))
has the *categories* (collision, keyboard, mouse, other, async) but
`instance.register_events` only wires step_begin/step/step_end/draw/draw_gui
(+ create/destroy queued). There is no dispatch for alarms, input, collisions,
room/game lifecycle, animation-end, or path-end.

**Needs:** per-instance alarm system; input/collision/room-game/animation/path
event dispatch in the engine; and code-gen mapping for every event the editor offers.

### 0.2 🟡 Collision system is unusable for spriteless objects
`place_meeting` / `place_free` / `place_empty` / `instances_collide` exist
([instance.ts:448-492](../../../packages/engine/src/core/instance.ts#L448)) but
derive the bbox from the sprite/mask. Spriteless objects (very common when
prototyping) get a degenerate bbox, so these silently return wrong results.

Evidence: the sample's `obj_player/step.ts` **hand-rolls all collision** with
custom `pw`/`ph` variables and manual bbox math, explicitly noting "bbox is
unreliable for spriteless objects." The engine's own collision API is bypassed
entirely in the one real game — a strong signal it isn't usable in practice.

**Needs:** a manual collision mask (set bbox/mask size independent of a sprite),
so spriteless objects collide correctly.

### 0.3 ✅ Custom instance variables — **DONE**
Added `[key: string]: any` to the `instance` class (declared properties keep their
precise types; unknown keys resolve to `any`), so `this.score = 0` needs no cast.
Added a **Variable Definitions** section to the object editor (name = default
expression), persisted in object.json and initialised at the top of the generated
`on_create` (auto-creating a Create method if the object has none).

### 0.4 ✅ IDE IntelliSense types — **DONE** (was: fiction, disconnected from engine)
Replaced the hand-written `SW_TYPES` with **generated** ambient declarations:
`scripts/generate-types.cjs` emits the engine's real `.d.ts`, converts them to ambient
globals, and writes `packages/ide/src/generated/engine_types.ts` (run via `npm run
gen:types`, wired into `build:ide`). Monaco now loads accurate types (562 functions,
real `on_*` methods, correct signatures) that cannot drift from the engine. The
code-gen now imports the **entire** engine API (enumerated from the built bundle;
esbuild tree-shakes the unused), so the three layers — Monaco types, engine exports,
and event-scope availability — finally agree. (The original `declare var this` was
invalid TS, which likely broke the whole old lib.)

Below was the original finding:
`script_editor.ts`'s `SW_TYPES` is a ~215-line **hand-written** type block that does
not match the real engine: it declares lifecycle methods as `create()`/`step()`/`draw()`
(engine uses `on_create`/`on_step`/`on_draw`), `instance_create()`/`place_meeting()`/
`room_goto(name)` as free functions (engine has them as methods / different signatures),
and many functions that don't exist — while missing most real ones. Worse, there's a
**three-way mismatch**: Monaco types ≠ engine exports ≠ the curated import list the
code-gen injects into event scope. A user following autocomplete writes code that fails
to build.

**Needs:** stop hand-maintaining types. Generate a `.d.ts` from the engine (tsconfig
already has `declaration: true`) and feed it to Monaco; make the code-gen import a
comprehensive set (or namespace) so the three layers agree. Overlaps Stream 2
(external-editor type defs) — best solved there, once, for both.

---

## Tier 1 — Missing core GMS systems

### 1.1 ❌ Alarms
No per-instance `alarm[0..11]` countdown timers or Alarm events. (There is a
global *named timer* system, but not GMS alarms.) Required by 0.1.

### 1.2 ❌ Tiles & tilesets
No tileset resource, no tile layers in rooms, no `tile_*` functions. Major GMS
level-building feature; needs engine + IDE (tileset editor, room tile layers).

### 1.3 ❌ Collision query functions
Missing: `collision_line`, `collision_point`, `collision_rectangle`,
`collision_circle`, `instance_place`, `position_meeting`, `position_destroy`.
(`instance_position` / `instance_nearest` / `instance_furthest` exist.)

### 1.4 ❌ Motion planning (`mp_*`)
No `mp_grid_*` A* pathfinding, `mp_potential_step`, or `mp_linear_step`.

---

## Tier 2 — API completeness & ergonomics

### 2.1 🟡 GMS free-function API vs instance methods
Collision/movement are instance methods (`this.place_meeting(...)`). GMS code uses
implicit-self free functions (`place_meeting(x, y, obj)`). The team has adopted
`this.` style, so this is low priority — but a "current instance" facade would
let GMS-sourced code paste in unchanged.

### 2.2 🟡 Rooms
`room_goto/next/previous/restart` exist as methods
([room.ts:90-128](../../../packages/engine/src/core/room.ts#L90)). Missing:
view-follows-instance (`view_object`), per-room tile/background layers, room
creation code, readable `room_width/height/speed` globals.

### 2.3 🟡 Sprites at runtime
`image_*` vars present and animated ([instance.ts:233-240](../../../packages/engine/src/core/instance.ts#L233)).
Missing: `sprite_add` (runtime image load), `sprite_duplicate`, `image_number`,
animation-end event hookup, runtime mask assignment.

### 2.4 🟡 Global / game functions
Missing: `show_message`, `show_question`, `show_debug_message` (currently
`console.log`), `game_end`, `game_restart`, `fps` / `fps_real`, `delta_time`,
`current_time`, `get_timer`.

---

## Already solid (✅)
Core loop, rendering (sprites, shapes, text, surfaces, shaders, blend modes,
views/cameras), input polling (kbd/mouse/gamepad/touch), audio (incl. 3D), all
`ds_*` data structures, storage (ini/file/json), physics (matter.js), networking
(buffers/WS/WebRTC/HTTP), particles, 3D basics, math/string/random/regex, paths,
timelines, instance lifecycle/queries/motion vars.

---

## Recommended implementation order

1. ✅ **Object events + alarms** (Tier 0.1 + 1.1) — **DONE.** All 24 editor events
   now map to runtime lifecycle methods. Added per-instance `alarm[0..11]` + on_alarm,
   keyboard/mouse-over-instance events, collision events (gated, with `other`),
   room_start/room_end/game_start/game_end, animation_end, and a `_destroyed` guard
   so events can safely destroy mid-step. `game_end()` / `game_restart()` exported.
   Remaining: `path_end` needs instance path-following (`path_start`); mouse/collision
   accuracy on spriteless objects depends on Tier 0.2 (manual masks).
2. ✅ **Usable collision** (Tier 0.2 + 1.3) — **DONE.** Added a manual collision
   mask (`mask_set_rectangle`/`mask_set_size`/`mask_clear`) that `get_bbox` honors,
   so spriteless objects now collide (place_meeting/instance_place/mouse/collision
   events all work). Added `instance_place` and free functions `collision_point`,
   `collision_rectangle`, `collision_circle`, `collision_line` (segment-AABB),
   `position_meeting`, `position_destroy`. Verified with a 15-case logic harness.
   Remaining: precise (per-pixel) collision is still bbox-only; an object-editor
   "Mask" tab (set mask without code) is a nice follow-up.
3. ✅ **Instance-variable ergonomics** (Tier 0.3) — **DONE** (index signature +
   Variable Definitions). See also 0.4 (IDE type fiction) — fold into Stream 2.
4. **Tiles & tilesets** (Tier 1.2) — large; engine + IDE.
5. **Motion planning `mp_*`** (Tier 1.4).
6. **Polish** — globals (2.4), room/sprite gaps (2.2/2.3), implicit-self facade (2.1).
