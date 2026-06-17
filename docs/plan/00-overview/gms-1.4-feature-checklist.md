# GMS 1.4 Feature Catalogue & Inclusion Checklist

A comprehensive map of what **GameMaker Studio 1.4** offers — engine (GML), resources, the IDE/editors,
drag-and-drop, and export targets — cross-referenced against what **Silkweaver** has today.

## How to use this

This is a **triage list**. Tick `- [x]` the things you want built; leave `- [ ]` the ones you don't.
Once you've marked it up, hand it back and I'll implement the ticked items in sensible batches.

**Status legend** (Silkweaver's *current* state — correct me if I've mis-flagged anything; I can't
re-audit every single function this pass):

- ✅ **have** — implemented and usable
- 🟡 **partial** — exists but incomplete / has known gaps
- ❌ **missing** — not implemented
- ⛔ **native/platform** — needs a native host (Electron desktop / mobile wrapper); **in scope**, sequenced late behind the capability layer
- 💡 **modern alt** — Silkweaver does this differently (a note, not a gap)

> **Note on philosophy:** Silkweaver is *code-first* and class-based. Some GMS 1.4 features are
> tightly bound to its drag-and-drop / fixed-`alarm[12]` / global-resource-ID model; for those the
> "make sense?" column flags whether to port faithfully, modernize, or skip. The goal is GMS 1.4's
> *capability surface*, not its every quirk.

---

## ✅ Decision (locked in 2026-06)

**Build everything except section Q (drag-and-drop).** Silkweaver is a **multi-platform game engine
that modernizes GMS 1.4 in its own way** — *not* web-first. So the section **O** items (Steam, ads/IAP,
native extensions, cloud/achievements) and the mobile/console **export** targets (**S**) are **in
scope too**, just sequenced into a later *platform & native integrations* group (they're large and
depend on the host: Electron desktop now, native mobile/console wrappers later). Only drag-and-drop
(**Q**) is intentionally skipped — Silkweaver is code-first.

**Architecture principle for platform features:** the engine/runtime stays portable TS/WebGL2;
platform capabilities (Steam, IAP, achievements…) live behind a thin **capability layer** the host
provides. A game calls `steam_*` / `iap_*` and it gracefully no-ops on hosts that don't support it.

### Implementation batches — engine-first, quick wins first, each verified before the next

1. **System globals (K)** — `fps`/`fps_real`/`delta_time`, `get_timer`, `current_time`, `show_debug_message`, `show_message`/`show_question`/`get_string`/`get_integer`. ← ✅ **done** (`core/system.ts`, verified)
2. **Motion planning (C)** — `mp_grid` A*, `mp_potential_step`, `mp_linear_step`. ← ✅ **done** (`core/motion_planning.ts` + instance steppers, verified)
3. **Paths (C)** — `path_start`/`path_end`/path-following + Path End event. ← ✅ **done** (instance path-follow in `internal_step`; stop/restart/continue/reverse, verified)
4. **Runtime sprites (D)** — `sprite_add`, `sprite_duplicate`, `image_number`, runtime mask. ← ✅ **done** (`sprite_exists`/`set_offset`/`duplicate`/`add` + `image_number`; `mask_index` already drives bbox)
5. **Physics joints (N)** — `physics_joint_*` + apply/test/raycast. ← ✅ **done** (distance/revolute/weld/spring verified + rope/`test_overlap`/`raycast`/`apply_force_at`/`apply_torque` added; prismatic/pulley/gear/wheel are Box2D-only, not in matter.js)
6. **Tiles & tilesets (A/D)** — ✅ **global `tile_*` API done** (`core/tiles.ts`, verified; room owns the
   data). On-screen **tile rendering** → the room-rendering pass (R) below.
7. ~~View-follow + room runtime~~ → folded into **the room-rendering pass (R)** below.

> **Room-rendering pass (R)** — consolidates everything *visual* about rooms that needs the renderer +
> visual validation: **views/cameras** (apply + `view_object` follow), **background layers**, and
> **tile rendering** (+ a depth-sorted draw pipeline). Done as one focused effort with / just before
> the UI pass. The data + APIs for all three are already in place.
8. **Events gaps (B)** — ✅ **done**: `on_outside_room`, `on_intersect_boundary`, user events
   (`event_user`/`on_user`), verified. *(draw-begin/end → draw-pipeline; gestures → touch work, later.)*
9. **Input gaps (G)** — ✅ **done**: `io_clear` (+ `clear_all` on both managers); `keyboard_clear`/`mouse_clear`
   already existed. *(virtual touch keyboard → mobile/UI, later.)*
10. **Data / files / encoding (H/I)** — ✅ **done**: `base64_encode/decode`, `sha1_string_utf8`/`md5_string_utf8`
    (verified vs canonical vectors), clipboard, `ds_list/map/grid_write/read`. *(zip → later if needed.)*
11. **Audio gaps (F)** — audio groups, streams. *(host/Web-Audio dependent — 0.3.x)*
12. **3D / shaders / vertex (L)** — vertex buffers, matrix/camera API. *(GPU-dependent — 0.3.x)*
13. **Maths / strings / time fills (J)** — ✅ **date/time done** (`utils/datetime.ts`: full `date_*`/`current_*`,
    verified incl. leap year); `string_format`/`string_repeat` already existed.
14. **Networking gaps (M)** — server/client helpers. *(socket/host dependent — 0.3.x)*
15. **System extras (K)** — ✅ `set_application_title` done. `game_save`/`game_load` (whole-game state),
    room transitions, `sleep` → 0.3.x (the first two are non-trivial; `sleep` can't block synchronously on web).

**Platform & native integrations (host-dependent — later, behind the capability layer):**

16. **Desktop services** — Steam (Electron + steamworks.js), achievements/leaderboards, cloud saves.
17. **Monetization** — ads / IAP (per-target providers).
18. **Extensions** — a native/JS extension mechanism (npm packages + Electron native addons).
19. **Mobile export** — Android / iOS packaging (Capacitor or a native runtime around the engine).
20. **Console / UWP export** — long-term, licensing-gated.

Visual/GUI items (editors **P**, IDE tools **R**, room views/background rendering) ride along with
**the UI pass**, since they need visual validation.

---

## A. Resource types

- [ ] **Sprites** — ✅ frames, origin; collision-mask editor 🟡
- [ ] **Sounds** — ✅ Web Audio; GMS "sound properties" (kind/effects) 🟡
- [ ] **Backgrounds** — 🟡 resource + draw exists; **tileset** use ❌
- [ ] **Paths** — 🟡 data + editor exist; runtime path-following ❌
- [ ] **Scripts** — ✅ `scripts/<name>.ts`
- [ ] **Shaders** — ✅ GLSL ES (WebGL2)
- [ ] **Fonts** — ✅ font editor exists
- [ ] **Timelines** — ✅ `timeline_*` + editor
- [ ] **Objects** — ✅ **class-per-object** (`objects/<name>.ts`) 💡
- [ ] **Rooms** — 🟡 size/speed/instances/creation-code/physics ✅; views & background **layers** ❌
- [ ] **Tilesets / tiles** — ❌ big level-building feature (engine + room editor + `tile_*`)
- [ ] **Included Files** — ❌ ship arbitrary files with the game; `file_*` access
- [ ] **Macros / Constants** — ❌ global compile-time constants (GMS "Macros")
- [ ] **Configurations (target configs)** — ❌ per-target settings sets; maybe modernize as build profiles
- [ ] **Extensions** — ⛔ native DLL/JS extension packaging — web equivalent could be npm deps

---

## B. Object events (the event model)

- [ ] **Create / Destroy** — ✅
- [ ] **Step** (begin / normal / end) — ✅
- [ ] **Draw / Draw GUI** (+ pre/post draw, resize) — 🟡 draw + draw_gui ✅; pre/post/resize ❌
- [ ] **Alarm[0..11]** — ✅
- [ ] **Keyboard / Key Press / Key Release** — ✅
- [ ] **Mouse** (button press/release, enter/leave, wheel, global) — 🟡
- [ ] **Collision** — ✅ (bbox)
- [ ] **Room Start / End** — ✅
- [ ] **Game Start / End** — ✅
- [ ] **Animation End** — ✅
- [ ] **Path End** — ❌ (needs path-following)
- [ ] **Outside Room / Intersect Boundary** — ❌
- [ ] **No More Lives / No More Health** — ❌ (tied to GMS global `lives`/`health`)
- [ ] **User Events (0..15)** — 🟡 (`event_user`?)
- [ ] **Async events** (HTTP, dialog, networking, IAP, social, cloud, audio, system) — 🟡 networking async ✅; others ❌/⛔
- [ ] **Gesture events** (tap, drag, flick, pinch, rotate) — ❌

---

## C. GML — Game play

### Instances & objects
- [ ] ✅ `instance_create` / `_destroy` / `_exists` / `_number` / `_find` / `_position` / `_nearest` / `_furthest` / `_place`
- [ ] ✅ `instance_deactivate_*` / `instance_activate_*`
- [ ] ✅ `object_get_*` / `object_is_ancestor` / object parenting
- [ ] 🟡 `with` / `other` / `self` semantics (code-first uses `this` + loops 💡)
- [ ] 🟡 `event_perform` / `event_perform_object` / `event_user` / `event_inherited`
- [ ] ✅ `instance_id`/`id`, per-instance vars, `instance_change`, `instance_copy`

### Rooms
- [ ] ✅ `room_goto` / `_next` / `_previous` / `_restart`
- [ ] ✅ readable `room_width` / `room_height` / `room_speed`
- [ ] ❌ `room_add` / `room_duplicate` / `room_instance_add` (runtime room building)
- [ ] 🟡 room creation code ✅ (just wired); per-instance creation code ❌
- [ ] ❌ `room_set_*` runtime view/background/tile config applied on screen

### Movement & collision
- [ ] ✅ `hspeed`/`vspeed`/`speed`/`direction`/`gravity`/`friction` motion vars
- [ ] ✅ `motion_set` / `motion_add` / `move_towards_point` / `move_bounce_*` / `move_contact_*` / `move_outside_*` / `move_snap` / `move_wrap`
- [ ] ✅ `place_meeting` / `place_free` / `place_empty` / `instance_place` / `position_meeting`
- [ ] ✅ `collision_point` / `_rectangle` / `_circle` / `_line`
- [ ] 🟡 precise (per-pixel) collision masks (currently bbox-only)
- [ ] ✅ `distance_to_object` / `distance_to_point`
- [ ] ❌ **`mp_*` motion planning** (`mp_grid_*` A*, `mp_potential_step`, `mp_linear_step`)

### Paths
- [ ] 🟡 `path_*` data exists; ❌ `path_start` / `path_end` / instance path-following + Path End event

### Timelines
- [ ] ✅ `timeline_*` + per-instance `timeline_index`/`_position`/`_running`/`_speed`

---

## D. GML — Drawing

### Sprites & backgrounds
- [ ] ✅ `draw_sprite` / `_ext` / `_part` / `_part_ext` / `_stretched` / `_tiled` / `_pos`
- [ ] ✅ `draw_self`, image_* vars (index/speed/angle/xscale/yscale/blend/alpha)
- [ ] 🟡 `sprite_add` / `sprite_duplicate` / `sprite_create_from_surface` / runtime mask / `image_number`
- [ ] ✅ `draw_background` / `_ext` / `_stretched` / `_tiled`

### Shapes, primitives, text
- [ ] ✅ `draw_rectangle` / `_circle` / `_ellipse` / `_line` / `_triangle` / `_point` / `_roundrect` / `_arrow` / `_healthbar`
- [ ] 🟡 `draw_primitive_begin` / `_vertex` / `_end` / textured primitives / `draw_set_circle_precision`
- [ ] ✅ `draw_text` / `_ext` / `_transformed` / `_colour`; `draw_set_font`/`_halign`/`_valign`; `string_width`/`_height`
- [ ] ✅ `draw_set_colour` / `_alpha`; `make_colour_rgb`/`_hsv`; `colour_get_*`; `merge_colour`; gradient draws (`_colour` variants)

### Surfaces, blend, GPU state
- [ ] ✅ `surface_create` / `_set_target` / `_reset_target` / `_get_texture` / `application_surface` / `draw_surface_*`
- [ ] ✅ blend modes (`draw_set_blend_mode` / `_ext`, `bm_*`)
- [ ] 🟡 `gpu_*` state (alpha test, culling, colour write, tex filter/repeat)

### Tiles
- [ ] 🟡 `tile_add` / `tile_*` exist on `room`; ❌ tile **layers** + room-editor tile painting + on-screen tile rendering

### Views / cameras / display
- [ ] 🟡 view system exists (`view_*`, `camera_set_*`, `view_apply`) but ❌ **not auto-applied by the loop** (no scrolling/follow on screen)
- [ ] ❌ `view_object` follow-instance wired into the loop
- [ ] 🟡 `window_*` / `display_*` / `display_get_width` / fullscreen / `window_set_caption`
- [ ] ✅ `draw_getpixel` / surfaces for screen capture? (🟡 verify)

---

## E. GML — Particles & effects
- [ ] ✅ `part_type_*` / `part_system_*` / `part_emitter_*` / `part_attractor`/`_destroyer`/`_deflector`/`_changer`
- [ ] 🟡 simple effects `effect_create_above` / `_below` / `effect_clear`

---

## F. GML — Audio
- [ ] ✅ `audio_play_sound` / `_at` / `audio_stop_*` / `audio_pause_*` / `audio_sound_gain`/`_pitch`
- [ ] ✅ 3D / spatial: `audio_emitter_*` / `audio_listener_*` / `audio_falloff_set_model`
- [ ] 🟡 audio groups (`audio_group_load`/`_unload`), buses/effects, `audio_create_stream`
- [ ] 💡 legacy `sound_*` aliases (probably skip; use `audio_*`)

---

## G. GML — Input
- [ ] ✅ `keyboard_check` / `_pressed` / `_released`; `keyboard_key`/`_string`/`_lastkey`; `vk_*`
- [ ] ✅ `mouse_x`/`_y`/`mouse_check_button*`/`mouse_wheel_*`
- [ ] ✅ gamepad (`gamepad_*`) + touch (`device_mouse_*`)
- [ ] ❌ virtual keys / virtual keyboard for touch (`virtual_key_add`, `keyboard_virtual_show`)
- [ ] 🟡 `io_clear` / `keyboard_clear` / `mouse_clear` / `keyboard_set_map`

---

## H. GML — Data structures
- [ ] ✅ `ds_list` / `ds_map` / `ds_grid` / `ds_stack` / `ds_queue` / `ds_priority` (all)
- [ ] 🟡 `ds_map_secure_save`/`_load`, `ds_*_write`/`_read` (serialization), `ds_map` JSON interop

---

## I. GML — Files, INI, buffers, encoding
- [ ] ✅ `ini_*` (open/read/write/close)
- [ ] ✅ `file_text_*` / `file_bin_*` / `file_find_*` / `file_exists`/`_delete`/`_copy`/`_rename` / `directory_*`
- [ ] ✅ buffers (`buffer_create`/`_read`/`_write`/`_load`/`_save`/...)
- [ ] ✅ `json_encode` / `json_decode`
- [ ] 🟡 `base64_encode`/`_decode`, `zip_unzip`, `sha1`/`md5`, clipboard (`clipboard_*`)
- [ ] 💡 sandboxed FS (web): `file_*` map to virtual/OPFS storage — verify scope

---

## J. GML — Maths, random, strings, date/time
- [ ] ✅ real maths (`abs`/`round`/`floor`/`ceil`/`sign`/`sqrt`/`power`/`exp`/`ln`/trig/`lerp`/`clamp`)
- [ ] ✅ geometry (`point_distance`/`point_direction`/`lengthdir_x`/`_y`/`dot_product`/`angle_difference`)
- [ ] ✅ random (`random`/`irandom`/`random_range`/`choose`/`random_set_seed`/`randomize`)
- [ ] ✅ strings (`string`/`string_length`/`_char_at`/`_copy`/`_pos`/`_replace`/`_upper`/`_lower`/`real`/`chr`/`ord`)
- [ ] 🟡 `string_format`, `string_hash_to_newline`, locale helpers
- [ ] 🟡 date/time (`date_*`, `current_time`, `current_year`…) — partial
- [ ] ❌ `get_timer` (microsecond timer)

---

## K. GML — Game, system, debug
- [ ] ✅ `game_end` / `game_restart`
- [ ] ❌ `game_save` / `game_load` (whole-game state serialization)
- [ ] ❌ `fps` / `fps_real` / `delta_time`
- [ ] ❌ `show_message` / `show_question` / `get_string` / `get_integer` (blocking dialogs)
- [ ] 🟡 `show_debug_message` (currently `console.log`), `show_debug_overlay`
- [ ] ❌ `sleep`, `set_application_title` / window caption, `highscore_*` (legacy)
- [ ] 🟡 `os_type` / `os_browser` / `parameter_*` / `environment_get_variable`
- [ ] ❌ transitions (`transition_kind` room transitions)

---

## L. GML — 3D / GPU / shaders / vertex
- [ ] ✅ 3D basics (matrices, lighting, OBJ loader)
- [ ] ✅ shaders (`shader_set` / `shader_get_uniform` / `shader_set_uniform_*` / `shader_get_sampler_index`)
- [ ] 🟡 vertex buffers / vertex formats (`vertex_*`), `matrix_*`, `camera_*` (modern camera API)
- [ ] 💡 legacy `d3d_*` names — likely skip in favour of matrix/shader API

---

## M. GML — Networking & async
- [ ] ✅ sockets (`network_create_socket`/`_send_*`) + async networking events
- [ ] ✅ `http_get` / `http_post_string` / `http_request` + async HTTP
- [ ] ✅ WebRTC (modern addition 💡)
- [ ] 🟡 `network_*` server/client helpers, buffer-based packets

---

## N. GML — Physics (matter.js)
- [ ] ✅ `physics_world_*`, `physics_fixture_*`, `physics_body_*`
- [ ] ✅ object physics metadata (`static physics`/density/restitution/friction/sensor) + `phy_*` (new)
- [ ] ❌ joints (`physics_joint_*`: revolute, distance, prismatic, pulley, gear, wheel, rope, weld)
- [ ] 🟡 `physics_apply_force`/`_impulse`/`_local_*`, `physics_test_overlap`, ray cast, collision categories/groups

---

## O. Platform / native (likely ⛔ out of scope for a web engine)
- [ ] ⛔ Steam API (`steam_*`)
- [ ] ⛔ Ads / IAP / in-app purchases
- [ ] ⛔ Cloud saves / achievements / leaderboards (native)
- [ ] ⛔ Native extensions / DLLs (web alt = npm packages / JS extensions)
- [ ] 🟡 push notifications / device vibration / web equivalents where they exist

---

## P. IDE — Editors

- [ ] **Resource tree** — ✅
- [ ] **Script editor** (Monaco) — ✅ generated engine types
- [ ] **Sprite editor** — ✅ frames; ❌ animation preview / origin handles / collision-mask editor
- [ ] **Image / pixel editor** — ✅ tools 🟡 (verify brush/fill/shapes/selection)
- [ ] **Object editor** — 💡 now **class-file-as-code**; the GUI-over-class (event tabs, checkboxes) is built but **unwired**
- [ ] **Room editor** — 🟡 instances ✅; tiles ❌; views/backgrounds edit ✅ but not applied at runtime
- [ ] **Sound editor** — 🟡 basic; GMS sound properties (kind, effects, gain)
- [ ] **Background editor** — 🟡 image; tileset settings ❌
- [ ] **Path editor** — ✅
- [ ] **Timeline editor** — ✅
- [ ] **Font editor** — ✅
- [ ] **Shader editor** — 🟡 verify vertex+fragment editing

---

## Q. IDE — Drag-and-Drop visual programming

GMS 1.4's signature beginner feature: events filled with **action icons** across tabs
**Move, Main1, Main2, Control, Score, Draw, Extra** (plus a Code action).

- [ ] ❌ DnD action library + action canvas in the object/timeline editors
- [ ] 💡 **Decision needed:** Silkweaver is code-first. Options: (a) skip DnD entirely; (b) a modern
  block/node editor that **emits the class-file code** (so DnD and code stay one source); (c) a
  curated "snippets/recipes" palette instead. Recommend (b) or (c) over a faithful icon clone.

---

## R. IDE — Tools & project

- [ ] ✅ Debugger (breakpoints/watch) — verify depth
- [ ] ✅ Profiler panel
- [ ] ✅ Console / output
- [ ] ❌ Global Game Settings UI (window size, start room, icon, target options)
- [ ] ❌ Configurations / build profiles UI
- [ ] ❌ Texture pages / texture groups settings
- [ ] ❌ Macros/constants editor
- [ ] 🟡 In-IDE help / function docs on hover (Monaco hovers from generated types)
- [ ] ❌ Marketplace / package import (⛔ likely; npm is the modern alt)
- [ ] 🟡 Real-time collaboration (Yjs planned) — verify status

---

## S. Export / platform targets
- [ ] ✅ HTML5 (portable folder)
- [ ] ✅ Windows / macOS / Linux (Electron-packaged executable)
- [ ] ❌ Android / iOS (mobile)
- [ ] ⛔ UWP / consoles
- [ ] 🟡 export options (texture settings, icon, splash, compression)

---

## T. Modern additions beyond GMS 1.4 (optional — Silkweaver's "cool stuff")
- [ ] WebRTC networking (already ✅)
- [ ] npm-package project model + CLI (already ✅)
- [ ] TypeScript types / autocomplete from the real engine (already ✅)
- [ ] Promise/async-based APIs where GMS used async events
- [ ] Hot-reload / live-reload in `silkweaver run`
- [ ] Unlimited views/cameras (WebGL capability)
- [ ] Tween/easing library, state-machine helper, scene/prefab system — *ideas to consider*

---

### When you're done

Tick the items you want, add any notes inline, and hand it back. I'll group the ticked items into
implementable batches (engine-first, each verified before the next), starting with the quick wins
(globals like `fps`/`delta_time`/`get_timer`/`show_message`) and the high-leverage systems (tiles,
`mp_*`, view-follow) as prioritized.
