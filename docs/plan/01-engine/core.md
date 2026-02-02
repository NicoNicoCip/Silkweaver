# Engine Core

## File Structure
```
packages/engine/src/core/
├── game-loop.ts       # Main loop with room_speed support
├── room.ts            # Room management
├── instance-manager.ts # Instance lifecycle
├── event-dispatcher.ts # Event system
└── timer.ts           # Named timer system
```

## Core Functions

| Function | Description |
|----------|-------------|
| `game_restart()` | Restart the game |
| `game_end()` | End the game |
| `game_save(filename)` | Save game state |
| `game_load(filename)` | Load game state |
| `room_goto(room)` | Change room |
| `room_goto_next()` | Go to next room |
| `room_goto_previous()` | Go to previous room |
| `room_restart()` | Restart current room |

## Global Variables

| Variable | Description |
|----------|-------------|
| `room` | Current room index |
| `room_speed` | Steps per second |
| `room_width` | Room width in pixels |
| `room_height` | Room height in pixels |
| `fps` | Current FPS |
| `fps_real` | Actual measured FPS |

## Game Loop Implementation

```typescript
class GameLoop {
  private roomSpeed = 60;
  private lastTime = 0;
  private accumulator = 0;

  start() {
    requestAnimationFrame(this.tick.bind(this));
  }

  tick(currentTime: number) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    const frameTime = 1000 / this.roomSpeed;

    while (this.accumulator >= frameTime) {
      this.update();
      this.accumulator -= frameTime;
    }

    this.render();
    requestAnimationFrame(this.tick.bind(this));
  }

  update() {
    // Begin step events
    // Step events
    // End step events
    // Collision events
    // Timer events
  }

  render() {
    // Draw events (sorted by depth)
    // Draw GUI events
  }
}
```

## Named Timer System

```typescript
// Timer functions
timer_set(name: string, frames: number): void;
timer_get(name: string): number;
timer_clear(name: string): void;

// Usage in game object
class Player extends GMObject {
  create() {
    this.timer_set("fire_cooldown", 30);
  }

  step() {
    if (keyboard_check_pressed(vk_space)) {
      if (this.timer_get("fire_cooldown") <= 0) {
        instance_create(this.x, this.y, Bullet);
        this.timer_set("fire_cooldown", 30);
      }
    }
  }

  // Timer event method - called when timer reaches 0
  timer_fire_cooldown() {
    // Timer expired
  }
}
```
