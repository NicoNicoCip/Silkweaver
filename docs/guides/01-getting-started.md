# Getting Started

Silkweaver is a multi-platform game engine that modernizes GameMaker Studio 1.4 — it keeps the familiar GMS function names (`draw_sprite`, `instance_create`, …) but uses modern TypeScript conventions (0-based indexing, native arrays, Promises, class-based objects).

## Two ways to work

The IDE and the CLI are interchangeable front-ends over the same project folder — pick whichever suits you.

**Code-first (no IDE):**

```sh
npm install            # once, at the repo root
npm run build:tooling  # builds the engine + @silkweaver/build + @silkweaver/cli

npx silkweaver new my-game
cd my-game
npx silkweaver run     # builds, serves over http, opens in the browser
```

**GUI (the desktop IDE):**

```sh
npm run electron       # builds the IDE + tooling, then launches it
```

## Your project is an npm package

A Silkweaver project is just a folder: a `project.json` manifest, your objects in `objects/`, rooms in `rooms/`, and assets alongside. Because it's a normal npm package, you can edit it in any editor with full autocomplete (the engine's types ship with the project).

## Exporting

```sh
npx silkweaver export . --target web     # a portable, self-contained HTML5 folder
npx silkweaver export . --target win     # a packaged desktop executable (also: mac, linux)
```

Read the **Objects & Events** guide next to start building something real.
