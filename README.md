# Silkweaver Game Engine
A GMS 1.4 inspired web game engine and IDE using modern TypeScript, along with some other cool stuff :3

## Initial Setup

To install the engine all you have to do is run the following commands:

```py
# to install TypeScript in the project
npm install 
```

```py
# to initialize the type script packages
npx tsc --init
```

```py
# to build the TS project
npx tsc --build
```

```py
# to bundle the engine and ide run
npm run build:engine          # for just the engine 
npm run build:ide             # for just the ide
npm run build                 # for both
npm run watch                 # for auto building
```

To open the ide just run the `ide.html` in your browser and to see your game in action run the `index.html` located in the root.

For the release of the game, all you really need is the engine.js located in the exports folder, and the index at the root. Anything else is not necessary and can be removed, all except the dist/data folder that contains all the code and assets for your game.

Note that as of the current version of 0.1.4 exporting is not yet tested, so this workflow will definetly change before version 1.0.

Thanks for trying this out, and happy weaving.
