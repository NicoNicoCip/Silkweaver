# IDE Editors

## All GMS 1.4 Editors

The IDE includes all editor types from GMS 1.4 (except no Drag & Drop system - code only).

## Sprite Editor

**File**: `packages/ide/src/components/editors/SpriteEditor.tsx`

**Features:**
- Import images (PNG, JPG, GIF)
- Frame management (add, remove, reorder)
- Animation preview
- Origin point editor
- Collision mask editor (rectangle, ellipse, diamond, precise)
- Subimage timing
- **NO drawing tools** - import only

**Collision Mask Types:**
- Rectangle
- Ellipse
- Diamond
- Precise (per-pixel)

## Object Editor

**File**: `packages/ide/src/components/editors/ObjectEditor.tsx`

**Features:**
- Sprite assignment
- Parent object selection
- Property toggles (visible, solid, persistent)
- Depth setting
- Physics properties
- Event list with TypeScript code
- Named timer management

**Events Panel:**
- List of all defined events
- Add/remove events
- Double-click to edit code

## Room Editor

**File**: `packages/ide/src/components/editors/RoomEditor.tsx`

**Features (Full GMS 1.4):**
- Room size settings
- Background layers (8 backgrounds)
- Tile layers
- Instance placement with snapping
- View configuration (unlimited views)
- Physics world settings
- Room creation code
- Instance creation code

**Tools:**
- Select/move
- Place instances
- Tile painting
- View editing
- Grid snapping
- Zoom in/out

**Panels:**
- Room settings
- Backgrounds
- Tiles
- Instances
- Views
- Physics

## Script Editor

**File**: `packages/ide/src/components/editors/ScriptEditor.tsx`

**Monaco-based with:**
- GML function IntelliSense
- Error highlighting
- Go to definition
- Find references
- Multiple file tabs
- Minimap
- Diff view
- Syntax highlighting for TypeScript

**Keyboard Shortcuts:**
- `Ctrl+S` - Save
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `F1` - Help for selected function
- `Ctrl+Space` - Autocomplete

## Timeline Editor

**File**: `packages/ide/src/components/editors/TimelineEditor.tsx`

**Features:**
- Frame-based timeline
- Add/remove moments
- Code per moment
- Visual timeline bar
- Playback preview
- Copy/paste moments

## Path Editor

**File**: `packages/ide/src/components/editors/PathEditor.tsx`

**Features:**
- Point-based path creation
- Curved/straight segments
- Speed per point
- Closed loop toggle
- Visual path preview
- Path precision setting
- Grid snapping

## Sound Editor

**File**: `packages/ide/src/components/editors/SoundEditor.tsx`

**Features:**
- Import sounds (MP3, OGG, WAV)
- Preview playback
- Volume/pan settings
- Audio group assignment
- 3D audio settings (falloff, etc.)

## Background Editor

**File**: `packages/ide/src/components/editors/BackgroundEditor.tsx`

**Features:**
- Import background image
- Tile settings (horizontal, vertical)
- Used as tileset toggle
- Tileset grid configuration
- Preview

## Font Editor

**File**: `packages/ide/src/components/editors/FontEditor.tsx`

**Features:**
- Web font selection (system fonts + Google Fonts)
- Font size
- Font style (bold, italic)
- Character range
- Preview text
- Anti-aliasing settings
