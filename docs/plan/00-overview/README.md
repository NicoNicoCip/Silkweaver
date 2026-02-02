# PaperCrane Engine - Overview

A GMS 1.4.9999-inspired game engine and IDE with modern improvements.

> **Philosophy**: GMS function names and concepts, but with TypeScript/JavaScript conventions where they make sense. Not a 1:1 clone, but a spiritual successor.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript (engine, IDE, games) |
| Bundler | esbuild |
| Rendering | WebGL 2 only |
| Physics | matter.js (thin wrapper) |
| Code Editor | Monaco |
| Collaboration | WebSocket + CRDT (Yjs) |
| Platform | Web-only (HTML5) |
| License | GPL v3 |

## Key Design Decisions

| Aspect | Decision |
|--------|----------|
| API Naming | Exact GMS function names (draw_sprite, instance_create) |
| String Indexing | 0-based (JS style) |
| Arrays | Native JS arrays |
| Timers | Named timers (not alarm[0-11]) |
| Views | Unlimited (not 8) |
| Fonts | Web fonts (CSS) |
| User Events | Named events (not User0-15) |
| Async | Promise-based |
| Arguments | TypeScript function parameters |
| Constants | TypeScript const |
| Globals | Both globalvar + global.* |
| Game Code | Class-based (class Player extends GMObject) |

## Repository Structure

### Monorepo Layout
```
papercrane/
├── packages/
│   ├── engine/           # Core runtime engine
│   ├── ide/              # Web-based IDE
│   ├── backend/          # Collaboration server
│   ├── installer/        # Web installer
│   └── docs/             # Documentation site
├── templates/            # Game templates (reference)
├── docs/
│   └── plan/             # Implementation plans
├── package.json          # Workspace root
├── tsconfig.base.json    # Shared TS config
└── README.md
```

### GitHub Branches
| Branch | Purpose |
|--------|---------|
| `main` | Web installer |
| `engine` | Runtime engine |
| `template/platformer` | Platformer template |
| `template/top-down` | Top-down template |
| `template/shooter` | Shooter template |
| `template/puzzle` | Puzzle template |
| `template/rpg` | RPG template |

## Development Approach

- **Engine first**: Build runtime before IDE
- **Feature-by-feature**: Complete one system at a time
- **Standalone runtime**: Engine usable via code only
- **Manual testing**: No automated test suite
