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
npm workspaces monorepo:
- `packages/engine/` - Core game runtime
- `packages/ide/` - Web-based IDE (GMS 1.4 style)
- `docs/plan/` - 28-phase implementation plans

## Current Status
**Phase 1 - Foundation (early stage)**
- Monorepo structure and TypeScript config complete
- Comprehensive planning docs written (20+ documents)
- Actual implementation not yet started (only stubs)

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

## Engine Subsystems (Planned)
Core loop, drawing/graphics, instance/object system, input, audio, physics, networking, data structures, storage, math/utils, 3D basics, particles

## Commands
- Build: `npm run build`
- Entry: `packages/engine/src/index.ts`

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
