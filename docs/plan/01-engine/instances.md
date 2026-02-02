# Instance & Object System

## File Structure
```
packages/engine/src/instance/
├── instance.ts         # Instance class
├── object.ts           # GMObject base class
├── instance-manager.ts # Instance lifecycle
├── collision.ts        # Collision detection
├── events.ts           # Event system
└── with.ts             # With statement implementation
```

## Game Code Structure

```typescript
// How developers write game objects
class Player extends GMObject {
  // Define variables
  hp = 100;
  speed = 5;

  // Events are methods
  create() {
    this.image_speed = 0.5;
  }

  step() {
    if (keyboard_check(vk_left)) this.x -= this.speed;
    if (keyboard_check(vk_right)) this.x += this.speed;
  }

  draw() {
    draw_self();
    draw_text(this.x, this.y - 20, `HP: ${this.hp}`);
  }

  // Named collision events
  collision_Enemy(other: Enemy) {
    this.hp -= other.damage;
  }

  // Named user events
  event_takeDamage(amount: number) {
    this.hp -= amount;
  }
}
```

## Instance Functions

| Function | Description |
|----------|-------------|
| `instance_create(x, y, obj)` | Create instance |
| `instance_create_depth(x, y, depth, obj)` | Create with depth |
| `instance_destroy()` | Destroy calling instance |
| `instance_destroy_id(id)` | Destroy by ID |
| `instance_exists(obj)` | Check existence |
| `instance_find(obj, n)` | Find nth instance |
| `instance_number(obj)` | Count instances |
| `instance_position(x, y, obj)` | Instance at position |
| `instance_place(x, y, obj)` | Instance at place |
| `instance_nearest(x, y, obj)` | Nearest instance |
| `instance_furthest(x, y, obj)` | Furthest instance |
| `instance_deactivate_all(notme)` | Deactivate all |
| `instance_deactivate_object(obj)` | Deactivate by object |
| `instance_deactivate_region(...)` | Deactivate region |
| `instance_activate_all()` | Activate all |
| `instance_activate_object(obj)` | Activate by object |

## Instance Variables

| Variable | Description |
|----------|-------------|
| `id` | Unique instance ID |
| `object_index` | Object type |
| `x`, `y` | Position |
| `xprevious`, `yprevious` | Previous position |
| `xstart`, `ystart` | Starting position |
| `hspeed`, `vspeed` | Velocity components |
| `speed`, `direction` | Movement vector |
| `friction` | Friction |
| `gravity`, `gravity_direction` | Gravity |
| `sprite_index` | Current sprite |
| `image_index` | Current frame |
| `image_speed` | Animation speed |
| `image_xscale`, `image_yscale` | Scale |
| `image_angle` | Rotation |
| `image_alpha` | Alpha |
| `image_blend` | Blend color |
| `mask_index` | Collision mask |
| `depth` | Draw depth |
| `visible` | Visibility flag |
| `persistent` | Survives room change |
| `solid` | Solid flag |
| `bbox_left/right/top/bottom` | Bounding box |

## With Statement

```typescript
// Implementation
function with<T extends GMObject>(
  target: T | T[] | typeof GMObject | number,
  callback: (self: T) => void
): void;

// Usage examples
with(obj_enemy, (self) => {
  self.hp -= 10;
  if (self.hp <= 0) instance_destroy();
});

with(other, (self) => {
  self.x = this.x;
});

with(all, (self) => {
  self.x += 10;
});
```

## Collision Functions

| Function | Description |
|----------|-------------|
| `place_meeting(x, y, obj)` | Check collision at position |
| `place_free(x, y)` | Check if position free |
| `place_empty(x, y)` | Position empty (no solid) |
| `move_towards_point(x, y, sp)` | Move toward point |
| `move_contact_solid(dir, maxdist)` | Move until solid |
| `move_bounce_solid(advanced)` | Bounce off solids |
| `move_wrap(hor, vert, margin)` | Wrap around room |
| `distance_to_object(obj)` | Distance to object |
| `distance_to_point(x, y)` | Distance to point |
| `collision_point(x, y, obj, prec, notme)` | Point collision |
| `collision_rectangle(...)` | Rectangle collision |
| `collision_circle(...)` | Circle collision |
| `collision_line(...)` | Line collision |

## Collision Masks
- Rectangle
- Ellipse
- Diamond
- Precise (per-pixel)

## Events Supported

| Event Type | Events |
|------------|--------|
| Create | `create` |
| Destroy | `destroy` |
| Step | `step`, `begin_step`, `end_step` |
| Draw | `draw`, `draw_begin`, `draw_end`, `draw_gui` |
| Collision | `collision_[ObjectName]` |
| Timer | `timer_[name]` |
| Keyboard | `keyboard_[key]`, `keyboard_pressed_[key]`, `keyboard_released_[key]` |
| Mouse | `mouse_[button]`, `mouse_pressed_[button]`, `mouse_enter`, `mouse_leave` |
| Other | `room_start`, `room_end`, `game_start`, `animation_end`, `path_ended` |
| User | `event_[name]` (named events) |

## Object Functions

| Function | Description |
|----------|-------------|
| `object_exists(obj)` | Check if object exists |
| `object_get_name(obj)` | Get object name |
| `object_get_sprite(obj)` | Get default sprite |
| `object_get_parent(obj)` | Get parent object |
| `object_is_ancestor(obj, parent)` | Check inheritance |
