# IDE Core

## File Structure
```
packages/ide/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── store/
│   │   ├── project-store.ts
│   │   ├── editor-store.ts
│   │   ├── ui-store.ts
│   │   └── collab-store.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── tree/
│   │   │   └── ResourceTree.tsx
│   │   ├── editors/
│   │   │   └── ... (see editors.md)
│   │   ├── preview/
│   │   │   └── GamePreview.tsx
│   │   ├── debug/
│   │   │   ├── Debugger.tsx
│   │   │   ├── Console.tsx
│   │   │   └── Profiler.tsx
│   │   └── common/
│   │       └── ...
│   ├── services/
│   │   ├── project.ts
│   │   ├── build.ts
│   │   ├── collab.ts
│   │   └── storage.ts
│   └── utils/
│       └── keybindings.ts
├── public/
└── index.html
```

## Technology Stack

- **Framework**: Pure web (no Electron)
- **Code Editor**: Monaco (VS Code editor)
- **State Management**: TBD (Zustand, Redux, or similar)
- **UI Style**: GMS 1.4 replica visual style

## Key Features

1. **GMS 1.4 replica visual style**
2. **Multi-tab interface**
3. **GMS-style resource tree**
4. **Full IntelliSense** (Monaco)
5. **Full console** (output, errors, commands)
6. **Full undo stack** (all editor operations)
7. **Auto-refactoring** on rename
8. **Embedded game preview**
9. **Hot reload**
10. **Auto-save + history**
11. **Built-in profiler**

## Project Format (JSON)

```json
{
  "name": "MyGame",
  "version": "1.0.0",
  "engineVersion": "1.0.0",
  "settings": {
    "roomSpeed": 60,
    "startRoom": "rm_main",
    "windowWidth": 1280,
    "windowHeight": 720
  },
  "resources": {
    "sprites": {},
    "sounds": {},
    "backgrounds": {},
    "paths": {},
    "scripts": {},
    "fonts": {},
    "timelines": {},
    "objects": {},
    "rooms": {}
  }
}
```

## Monaco Configuration

```typescript
// TypeScript configuration for game code
const compilerOptions = {
  target: "ES2020",
  module: "ESNext",
  strict: true,
  types: ["silkweaver-types"]
};

// Custom language features
monaco.languages.registerCompletionItemProvider("typescript", {
  provideCompletionItems: (model, position) => {
    // GML function autocomplete
    return { suggestions: gmlFunctionSuggestions };
  }
});

// GML function hover documentation
monaco.languages.registerHoverProvider("typescript", {
  provideHover: (model, position) => {
    // Show GML function documentation
  }
});
```

## Resource Tree Structure

```
├── Sprites
│   └── spr_player
├── Sounds
├── Backgrounds
├── Paths
├── Scripts
│   └── scr_utils
├── Fonts
├── Timelines
├── Objects
│   └── obj_player
└── Rooms
    └── rm_main
```

## Storage

- **Projects**: IndexedDB for local storage
- **Auto-save**: Periodic saves to IndexedDB
- **Version history**: Stored as diffs
- **Export**: Download as zip file

## Undo/Redo System

- Tracks all editor operations
- Per-resource undo stacks
- Global undo stack for cross-resource operations
- Undo limit: configurable (default 100)

## Hot Reload

- Watches for code changes
- Recompiles modified scripts
- Injects updated code into running game
- Assets hot reload (sprites, sounds)
