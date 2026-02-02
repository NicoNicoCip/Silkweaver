# PaperCrane Implementation Plan

This folder contains the complete implementation plan for PaperCrane, a GMS 1.4.9999-inspired game engine and IDE.

## Folder Structure

```
docs/plan/
├── README.md                    # This file
├── 00-overview/
│   ├── README.md               # Project overview & tech stack
│   └── phases.md               # 28 implementation phases
├── 01-engine/
│   ├── core.md                 # Game loop, rooms, timers
│   ├── drawing.md              # Sprites, shapes, text, surfaces, shaders
│   ├── instances.md            # Objects, instances, collision, events
│   ├── input.md                # Keyboard, mouse, gamepad, touch
│   ├── audio.md                # Sound, 3D audio, groups
│   ├── physics.md              # matter.js physics wrapper
│   ├── networking.md           # WebSocket, WebRTC, buffers, HTTP
│   ├── data.md                 # Data structures, storage, files
│   ├── math.md                 # Math, random, strings, regex
│   ├── 3d.md                   # Basic 3D primitives
│   └── particles.md            # Particle system
├── 02-ide/
│   ├── core.md                 # IDE architecture & features
│   ├── editors.md              # All editor types
│   ├── collaboration.md        # Real-time collaboration
│   └── debugging.md            # Debugger & profiler
├── 03-installer/
│   └── installer.md            # Web installer & versioning
├── 04-templates/
│   └── templates.md            # 5 game templates
└── 05-docs/
    └── documentation.md        # Documentation site & in-IDE help
```

## Quick Links

### Overview
- [Architecture & Tech Stack](00-overview/README.md)
- [Implementation Phases](00-overview/phases.md)

### Engine
- [Core Systems](01-engine/core.md)
- [Drawing & Graphics](01-engine/drawing.md)
- [Instances & Objects](01-engine/instances.md)
- [Input System](01-engine/input.md)
- [Audio System](01-engine/audio.md)
- [Physics](01-engine/physics.md)
- [Networking](01-engine/networking.md)
- [Data & Storage](01-engine/data.md)
- [Math & Strings](01-engine/math.md)
- [3D System](01-engine/3d.md)
- [Particles](01-engine/particles.md)

### IDE
- [IDE Core](02-ide/core.md)
- [Editors](02-ide/editors.md)
- [Collaboration](02-ide/collaboration.md)
- [Debugging](02-ide/debugging.md)

### Distribution
- [Installer](03-installer/installer.md)
- [Templates](04-templates/templates.md)
- [Documentation](05-docs/documentation.md)

## Key Specifications

| Aspect | Specification |
|--------|---------------|
| Platform | Web-only (HTML5 + WebGL 2) |
| Language | TypeScript |
| Bundler | esbuild |
| Physics | matter.js |
| Code Editor | Monaco |
| Collaboration | WebSocket + CRDT (Yjs) |
| License | GPL v3 |

## Philosophy

> GMS function names and concepts, but with TypeScript/JavaScript conventions where they make sense. Not a 1:1 clone, but a spiritual successor.

## Getting Started

Once this plan is approved, implementation begins with:

1. Initialize monorepo with npm workspaces
2. Set up GitHub repository with branch structure
3. Begin Phase 1: Project Foundation
