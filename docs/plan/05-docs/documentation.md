# Documentation

## Documentation Site Structure

```
packages/docs/
├── src/
│   ├── pages/
│   │   ├── index.html
│   │   ├── getting-started/
│   │   ├── api-reference/
│   │   └── tutorials/
│   ├── templates/
│   │   └── page.html
│   └── styles/
│       └── main.css
├── content/
│   ├── api/
│   │   ├── drawing.md
│   │   ├── instances.md
│   │   ├── input.md
│   │   └── ...
│   └── guides/
│       ├── first-game.md
│       └── ...
└── build.ts
```

## Technology: Custom Static Site

- Built from scratch (no Docusaurus/VitePress)
- Simple markdown to HTML conversion
- Fast build times
- Full control over output

## API Reference Organization (By Category)

1. **Drawing & Graphics**
   - Sprites
   - Shapes
   - Text
   - Colors
   - Surfaces
   - Shaders
   - Views
   - Blend Modes

2. **Instances & Objects**
   - Creating/Destroying
   - Instance Variables
   - Collision
   - Events
   - With Statement

3. **Input**
   - Keyboard
   - Mouse
   - Gamepad
   - Touch

4. **Audio**
   - Playing Sounds
   - 3D Audio
   - Audio Groups

5. **Physics**
   - World
   - Fixtures
   - Bodies
   - Joints

6. **Networking**
   - Sockets
   - Buffers
   - HTTP

7. **Data Structures**
   - Lists
   - Maps
   - Grids
   - Stacks/Queues

8. **Storage & Files**
   - INI Files
   - File System
   - JSON

9. **Math & Random**
   - Math Functions
   - Trigonometry
   - Random Numbers

10. **Strings**
    - String Manipulation
    - Regex

11. **Rooms**
    - Room Functions
    - Room Variables

12. **Paths & Timelines**
    - Path Functions
    - Timeline Functions
    - Named Timers

13. **Particles**
    - Particle Systems
    - Particle Types
    - Emitters

14. **3D**
    - 3D Mode
    - Primitives
    - Transforms
    - Lighting

## Function Documentation Format

```markdown
# draw_sprite

Draws a sprite at the specified position.

## Syntax

```typescript
draw_sprite(sprite: Sprite, subimg: number, x: number, y: number): void
```

## Arguments

| Argument | Type | Description |
|----------|------|-------------|
| sprite | Sprite | The sprite to draw |
| subimg | number | The subimage (frame) to draw (use -1 for current) |
| x | number | The x position |
| y | number | The y position |

## Returns

Nothing.

## Description

Draws the specified sprite at position (x, y). The sprite is drawn using its defined origin point.

## Example

```typescript
// In draw event
draw_sprite(spr_player, 0, this.x, this.y);

// Draw current animation frame
draw_sprite(this.sprite_index, this.image_index, this.x, this.y);
```

## See Also

- [draw_sprite_ext](draw_sprite_ext.md)
- [draw_self](draw_self.md)
```

## In-IDE Help

### Features
- Hover documentation for functions
- F1 opens help for selected function
- Searchable function index
- Example snippets
- Links to full documentation

### Implementation

```typescript
// Monaco hover provider
monaco.languages.registerHoverProvider('typescript', {
  provideHover(model, position) {
    const word = model.getWordAtPosition(position);
    if (word) {
      const doc = gmlDocumentation[word.word];
      if (doc) {
        return {
          contents: [
            { value: `**${doc.name}**` },
            { value: doc.signature },
            { value: doc.description },
            { value: `\`\`\`typescript\n${doc.example}\n\`\`\`` }
          ]
        };
      }
    }
  }
});
```

## Guides Structure

### Getting Started
1. Installation
2. Creating Your First Project
3. Understanding the IDE
4. Your First Game

### Concepts
- Objects and Instances
- Events
- Rooms
- Sprites and Animation
- Collision Detection
- Game Loop

### Advanced
- Shaders
- Networking
- Physics
- 3D Graphics
- Performance Optimization

## License Information

All documentation under GPL v3.
Include license header in generated pages.
