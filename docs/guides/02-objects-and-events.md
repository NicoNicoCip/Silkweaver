# Objects & Events

Silkweaver objects are **one class file per object** — `objects/<name>.ts`, exporting a `gm_object` subclass. Static fields are object metadata, instance fields are your variable defaults, and `on_*` methods are events.

```ts
export class obj_player extends gm_object {
    static sprite = 'spr_player'   // object metadata
    static solid  = true

    spd = 4                        // your own instance variable (a default)

    on_create() {
        inst.hp = 100              // your own variables live on inst
    }

    on_step() {
        // sw is the engine's built-in instance API (position, motion, sprite, …)
        if (keyboard_check(vk_left))  sw.x -= inst.spd
        if (keyboard_check(vk_right)) sw.x += inst.spd

        // bare names are global engine functions and other objects
        if (sw.place_meeting(sw.x, sw.y + 1, obj_wall)) inst.hp -= 1
    }

    on_draw() {
        sw.draw_self()             // draw_self acts on this instance, so sw.
    }
}
```

Notice there are **no imports** — engine functions (`keyboard_check`, `draw_text`, …) and other object names (`obj_wall`) are available bare; the build wires them in for you.

## The four namespaces

Game code keeps four things clearly separated, so it's always obvious what you're touching:

- **`sw.`** — the engine's **built-in instance** API for the current instance: `sw.x`, `sw.y`, `sw.hspeed`, `sw.vspeed`, `sw.speed`, `sw.direction`, `sw.image_angle`, `sw.image_xscale`, `sw.sprite_index`, `sw.depth`, `sw.alarm[i]`, and instance methods like `sw.place_meeting(...)`, `sw.draw_self()`, `sw.instance_destroy()`. Think of `sw` as "Silkweaver's view of *this* instance."
- **`inst.`** — your **own** instance variables — the ones you add (`inst.hp`, `inst.grounded`, `inst.spd`). Declare a default as a class field (`spd = 4`) or just assign one in an event (`inst.hp = 100`); either way you read it back through `inst`.
- **`global.`** — **game-wide** state shared by everything: the built-ins `global.score`, `global.lives`, `global.health`, plus any global you define (`global.level = 1`).
- **`this.`** — plain **JavaScript/TypeScript** — the language itself (your own helper methods, local logic). The engine doesn't use it for game state, so it stays clean.

Everything else — `draw_sprite`, `instance_create`, `point_distance`, `audio_play_sound`, `irandom`, … — is a **global engine function** you call bare. Other objects are referenced bare by name too (`place_meeting(x, y, par_solid)`, `static parent = par_solid`).

A quick rule of thumb: *built-in property of this instance* → `sw.`; *a variable I made up* → `inst.`; *shared across the whole game* → `global.`; *a standalone function* → bare.

## Events

Override `on_*` methods to handle events — the engine calls them at the right time:

- `on_create` / `on_destroy` — when the instance is made or removed
- `on_step`, plus `on_step_begin` and `on_step_end` — each frame
- `on_draw` / `on_draw_gui` — rendering
- `on_alarm(i)` — countdown timers (set one with `sw.alarm[i] = 30`)
- `on_collision(other)` — collisions with another instance (`other` is the instance you hit)
- `on_key_press` / `on_key_release` / `on_key_held` — keyboard
- `on_room_start` / `on_room_end`, `on_game_start` / `on_game_end`
- `on_outside_room` / `on_intersect_boundary`, `on_path_end`, `on_animation_end`

If you don't override `on_draw`, the engine draws the object's sprite for you, so most objects never need one.

## Instance variables

The built-in instance variables work like GMS, but live on `sw`: `sw.x`, `sw.y`, `sw.hspeed`, `sw.vspeed`, `sw.speed`, `sw.direction`, `sw.gravity`, `sw.image_index`, `sw.sprite_index`, `sw.depth`, `sw.solid`, `sw.visible`, and the rest.

Your own variables go on `inst`. Add them as typed class fields with defaults (`spd = 4`) for the ones every instance starts with, or assign them in `on_create` (`inst.target = noone`). No casts required — read and write them through `inst` from any event.

## Drawing

Inside `on_draw`, use the `draw_*` functions bare — `draw_sprite`, `draw_rectangle`, `draw_text`, `draw_set_color`, and many more — and `sw.draw_self()` to draw this instance's own sprite. Browse the **Drawing** category in the reference for the full list.

## Static metadata

Static fields configure the object for every instance (the object editor's checkboxes write these for you):

- `static sprite` — the sprite to draw (by name)
- `static solid` — participates in solid collisions
- `static visible`, `static persistent`, `static depth`
- `static parent` — inherit from another object (collision / `with` / instance checks against the parent match this object too)
- `static physics` (+ `physics_density`, `physics_restitution`, `physics_shape`, …) — make it a matter.js physics body
