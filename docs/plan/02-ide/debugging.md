# Debugger & Profiler

## File Structure
```
packages/ide/src/components/debug/
├── Debugger.tsx    # Breakpoint debugging UI
├── Console.tsx     # Output console
└── Profiler.tsx    # Performance profiler

packages/engine/src/debug/
├── debugger.ts     # Engine-side debug support
└── profiler.ts     # Performance measurement
```

## Full Debugger

### Features
- Breakpoints in code
- Step over / step into / step out
- Variable inspection
- Call stack view
- Watch expressions
- Conditional breakpoints

### Breakpoint System

```typescript
// Engine-side debug hooks
class DebugEngine {
  private breakpoints: Map<string, Set<number>> = new Map();
  private isPaused = false;
  private currentFrame: StackFrame | null = null;

  setBreakpoint(file: string, line: number) {
    if (!this.breakpoints.has(file)) {
      this.breakpoints.set(file, new Set());
    }
    this.breakpoints.get(file)!.add(line);
  }

  checkBreakpoint(file: string, line: number): boolean {
    return this.breakpoints.get(file)?.has(line) ?? false;
  }

  pause() {
    this.isPaused = true;
    // Notify IDE
  }

  resume() {
    this.isPaused = false;
  }

  stepOver() { /* ... */ }
  stepInto() { /* ... */ }
  stepOut() { /* ... */ }

  getVariables(): Variable[] { /* ... */ }
  getCallStack(): StackFrame[] { /* ... */ }
}
```

### Variable Inspector

- Local variables
- Instance variables (this.*)
- Global variables
- Watch expressions
- Expand objects/arrays

### Debugger UI

```
┌─────────────────────────────────────────┐
│ [▶] [⏸] [⏭] [⏩] [⏹]  Debug Controls   │
├─────────────────────────────────────────┤
│ Call Stack                              │
│ ├─ Player.step (line 42)               │
│ ├─ EventDispatcher.dispatch            │
│ └─ GameLoop.update                     │
├─────────────────────────────────────────┤
│ Variables                               │
│ ├─ this.x = 150                        │
│ ├─ this.y = 200                        │
│ ├─ this.hp = 75                        │
│ └─ local_speed = 5                     │
├─────────────────────────────────────────┤
│ Watch                                   │
│ ├─ this.hp > 0 = true                  │
│ └─ instance_number(obj_enemy) = 5      │
└─────────────────────────────────────────┘
```

## Console

### Features
- show_debug_message() output
- Error messages with stack traces
- Warning messages
- Command input (execute code)
- Clear / filter options

### Message Types
- **Log**: Normal output
- **Warning**: Yellow, potential issues
- **Error**: Red, with stack trace
- **Info**: Blue, system messages

### Console Commands

```
> instance_number(obj_enemy)
5

> global.score
1500

> instance_destroy(103842)
Instance destroyed

> room_goto(rm_level2)
Changed room to rm_level2
```

## Profiler

### Features
- FPS counter (real-time)
- Frame time graph
- Memory usage
- Function timing
- Instance count per object

### Profiler UI

```
┌─────────────────────────────────────────┐
│ FPS: 60.0 (16.67ms)  Memory: 45.2 MB   │
├─────────────────────────────────────────┤
│ Frame Time Graph                        │
│ ████████████████░░░░ 16.5ms            │
├─────────────────────────────────────────┤
│ Hottest Functions                       │
│ 1. collision_check      4.2ms (25%)    │
│ 2. draw_sprites         3.1ms (19%)    │
│ 3. physics_update       2.8ms (17%)    │
│ 4. audio_process        1.5ms (9%)     │
├─────────────────────────────────────────┤
│ Instance Counts                         │
│ obj_enemy: 42                          │
│ obj_bullet: 156                        │
│ obj_particle: 892                      │
└─────────────────────────────────────────┘
```

### Engine Profiler API

```typescript
class Profiler {
  private frames: FrameData[] = [];
  private currentFrame: FrameData | null = null;

  beginFrame() {
    this.currentFrame = {
      startTime: performance.now(),
      sections: []
    };
  }

  beginSection(name: string) {
    this.currentFrame?.sections.push({
      name,
      startTime: performance.now(),
      endTime: 0
    });
  }

  endSection() {
    const section = this.currentFrame?.sections[
      this.currentFrame.sections.length - 1
    ];
    if (section) {
      section.endTime = performance.now();
    }
  }

  endFrame() {
    if (this.currentFrame) {
      this.currentFrame.endTime = performance.now();
      this.frames.push(this.currentFrame);
      // Keep last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }
    }
  }

  getFPS(): number { /* ... */ }
  getAverageFrameTime(): number { /* ... */ }
  getMemoryUsage(): number { /* ... */ }
}
```

## Error Handling

### show_error() Implementation

```typescript
function show_error(message: string, abort: boolean = true): void {
  // Display error dialog in IDE
  ideConnection.showError({
    message,
    abort,
    stackTrace: new Error().stack
  });

  if (abort) {
    throw new GameError(message);
  }
}
```

### Error Dialog
- Error message
- Stack trace
- "Continue" or "Abort" buttons (if not fatal)
- Copy to clipboard
