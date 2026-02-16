# Implementation Phases

Development organized **by feature area**, starting with engine core.

## Phase 1: Project Foundation
- [x] Initialize monorepo with npm workspaces
- [x] Set up TypeScript configuration
- [x] Set up esbuild build system
- [x] Create basic engine structure
- [x] Initialize GitHub repository with branches

## Phase 2: Core Game Loop
- [x] Game loop with room_speed
- [x] Room management
- [x] Basic instance lifecycle
- [x] Event dispatcher

## Phase 3: Rendering System
- [x] WebGL 2 renderer setup
- [x] Sprite rendering
- [x] Shape drawing functions
- [x] Text rendering with web fonts
- [x] Color and alpha

## Phase 4: Instance & Object System
- [x] GMObject base class
- [x] Instance creation/destruction
- [x] Instance variables
- [x] Basic collision detection
- [x] With statement

## Phase 5: Input System
- [x] Keyboard input
- [x] Mouse input
- [x] Gamepad support
- [x] Touch support

## Phase 6: Audio System
- [x] Web Audio API integration
- [x] Sound playback
- [x] 3D positional audio
- [x] Audio groups

## Phase 7: Data Structures
- [x] DS List, Map, Grid
- [x] DS Stack, Queue, Priority

## Phase 8: Storage System
- [x] INI file functions (localStorage)
- [x] File functions (IndexedDB)
- [x] JSON functions

## Phase 9: Advanced Rendering
- [x] Surface system
- [x] Shader system
- [x] Blend modes
- [x] Views and cameras

## Phase 10: Physics System
- [ ] Matter.js integration
- [ ] Fixture system
- [ ] Body functions
- [ ] Joints
- [ ] Physics events

## Phase 11: Networking
- [ ] Buffer system
- [ ] WebSocket client (TCP-like)
- [ ] WebRTC client (UDP-like)
- [ ] HTTP functions

## Phase 12: Paths & Timelines
- [ ] Path system
- [ ] Timeline system
- [ ] Named timer system

## Phase 13: Particles
- [ ] Particle types
- [ ] Particle emitters
- [ ] Particle regions

## Phase 14: 3D System
- [ ] Basic 3D primitives
- [ ] 3D transforms
- [ ] Lighting
- [ ] Model loading (glTF, OBJ)

## Phase 15: Math & Utilities
- [ ] Math functions
- [ ] Random number generation
- [ ] String functions
- [ ] Regex functions

## Phase 16: IDE Core
- [ ] Basic IDE shell
- [ ] Project management
- [ ] Resource tree
- [ ] Tab system

## Phase 17: IDE Script Editor
- [ ] Monaco integration
- [ ] GML IntelliSense
- [ ] Error highlighting

## Phase 18: IDE Editors (Part 1)
- [ ] Sprite editor
- [ ] Object editor
- [ ] Room editor

## Phase 19: IDE Editors (Part 2)
- [ ] Sound, Background, Font editors
- [ ] Path, Timeline editors

## Phase 20: IDE Features
- [ ] Game preview (embedded)
- [ ] Hot reload
- [ ] Console/output
- [ ] Undo/redo system

## Phase 21: Debugger & Profiler
- [ ] Breakpoint system
- [ ] Variable inspection
- [ ] Profiler (FPS, memory, timing)

## Phase 22: Collaboration Backend
- [ ] WebSocket server
- [ ] Session management
- [ ] CRDT implementation

## Phase 23: Collaboration IDE Integration
- [ ] Session link system
- [ ] Real-time sync
- [ ] User cursors

## Phase 24: Web Installer
- [ ] Installer UI
- [ ] Version manifest fetching
- [ ] Project assembly

## Phase 25: Templates
- [ ] 5 genre templates

## Phase 26: Documentation Site
- [ ] Static site generator
- [ ] API reference
- [ ] Guides

## Phase 27: External Integrations
- [ ] Achievement, IAP, Ad, Analytics hooks

## Phase 28: Polish & Release
- [ ] Error handling
- [ ] Performance optimization
- [ ] Browser testing
- [ ] Licensing
