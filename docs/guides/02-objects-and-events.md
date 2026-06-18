# Objects & Events

Silkweaver objects are **one class file per object** — `objects/<name>.ts`, exporting a `gm_object` subclass. Static fields are object metadata, instance fields are your variable defaults, and `on_*` methods are events.

```ts
import { gm_object, keyboard_check, vk_left, vk_right, draw_self } from '@silkweaver/engine'

export class obj_player extends gm_object {
    static sprite = 'spr_player'   // object metadata
    static solid  = true
    hp = 100                       // an instance variable, default 100

    on_create() {
        this.hspeed = 0
    }

    on_step() {
        if (keyboard_check(vk_left))  this.x -= 4
        if (keyboard_check(vk_right)) this.x += 4
    }

    on_draw() {
        draw_self()
    }
}
```

## Events

Override `on_*` methods to handle events — the engine calls them at the right time:

- `on_create` / `on_destroy` — when the instance is made or removed
- `on_step`, plus `on_step_begin` and `on_step_end` — each frame
- `on_draw` / `on_draw_gui` — rendering
- `on_alarm(i)` — countdown timers (set one with `this.alarm[i] = 30`)
- `on_collision(other)` — collisions with another instance
- `on_key_press` / `on_key_release` / `on_key_held` — keyboard
- `on_room_start` / `on_room_end`, `on_game_start` / `on_game_end`
- `on_outside_room` / `on_intersect_boundary`, `on_path_end`, `on_animation_end`

## Instance variables

The built-in instance variables work like GMS: `x`, `y`, `hspeed`, `vspeed`, `speed`, `direction`, `gravity`, `image_index`, `sprite_index`, `depth`, `solid`, `visible`, and the rest. Add your own simply as typed class fields with defaults — no casts required.

## Drawing

Inside `on_draw`, use the `draw_*` functions: `draw_self`, `draw_sprite`, `draw_rectangle`, `draw_text`, `draw_set_color`, and many more. Browse the **Drawing** category in the reference for the full list.

## Static metadata

Static fields configure the object for every instance:

- `static sprite` — the sprite to draw (by name)
- `static solid` — participates in solid collisions
- `static visible`, `static persistent`, `static depth`
- `static physics` (+ `physics_density`, `physics_restitution`, …) — make it a physics body
