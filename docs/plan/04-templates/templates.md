# Templates

## Template Branches

| Branch | Genre | Description |
|--------|-------|-------------|
| `template/platformer` | Side-scrolling platformer | Movement, gravity, collision |
| `template/top-down` | Top-down adventure | 8-dir movement, room transitions |
| `template/shooter` | Space shooter | Bullets, enemies, scoring |
| `template/puzzle` | Puzzle game | Grid-based, matching, timers |
| `template/rpg` | Simple RPG | Stats, inventory, dialogue |

## Template Structure

```
template/
├── project.json
├── sprites/
│   ├── spr_player.json
│   └── spr_player.png
├── objects/
│   └── obj_player.ts
├── rooms/
│   └── rm_main.json
├── scripts/
│   └── scr_utils.ts
└── README.md
```

## Template Content Guidelines

- **Minimal starter** content
- **Geometric shapes** for placeholder assets
- **Core features only** (movement, collision, drawing)
- **Basic working game** structure
- **Comments** explaining key concepts

## Platformer Template

### Objects
- `obj_player` - Player with movement, jumping, gravity
- `obj_solid` - Collision block
- `obj_game` - Game controller

### Features Demonstrated
- Keyboard input
- Gravity and jumping
- Collision with solids
- Animation

### Example Code

```typescript
// obj_player.ts
class obj_player extends GMObject {
  moveSpeed = 4;
  jumpSpeed = 12;
  grav = 0.5;

  create() {
    this.sprite_index = spr_player;
  }

  step() {
    // Horizontal movement
    if (keyboard_check(vk_left)) this.hspeed = -this.moveSpeed;
    else if (keyboard_check(vk_right)) this.hspeed = this.moveSpeed;
    else this.hspeed = 0;

    // Gravity
    this.vspeed += this.grav;

    // Jumping
    if (keyboard_check_pressed(vk_space) && place_meeting(this.x, this.y + 1, obj_solid)) {
      this.vspeed = -this.jumpSpeed;
    }

    // Collision
    if (place_meeting(this.x + this.hspeed, this.y, obj_solid)) {
      while (!place_meeting(this.x + Math.sign(this.hspeed), this.y, obj_solid)) {
        this.x += Math.sign(this.hspeed);
      }
      this.hspeed = 0;
    }
    this.x += this.hspeed;

    if (place_meeting(this.x, this.y + this.vspeed, obj_solid)) {
      while (!place_meeting(this.x, this.y + Math.sign(this.vspeed), obj_solid)) {
        this.y += Math.sign(this.vspeed);
      }
      this.vspeed = 0;
    }
    this.y += this.vspeed;
  }
}
```

## Top-Down Template

### Objects
- `obj_player` - 8-direction movement
- `obj_wall` - Collision walls
- `obj_door` - Room transitions

### Features Demonstrated
- 8-direction input
- Room transitions
- Basic collision

## Shooter Template

### Objects
- `obj_player` - Player ship
- `obj_bullet` - Projectile
- `obj_enemy` - Enemy ships
- `obj_game` - Score tracking

### Features Demonstrated
- Spawning instances
- Instance destruction
- Score system
- Simple enemy AI

## Puzzle Template

### Objects
- `obj_grid` - Puzzle grid
- `obj_piece` - Puzzle piece
- `obj_game` - Game logic, timer

### Features Demonstrated
- Grid-based logic
- Mouse input
- Timer system
- Win/lose conditions

## RPG Template

### Objects
- `obj_player` - Character with stats
- `obj_npc` - Non-player characters
- `obj_item` - Collectible items
- `obj_game` - Inventory, dialogue

### Features Demonstrated
- Data structures (inventory)
- Dialogue system
- Stats and leveling
- Save/load
