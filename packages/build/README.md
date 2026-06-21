# @silkweaver/build

The Silkweaver toolchain — turns a project folder into a runnable game. It's the engine room behind
both the [`silkweaver` CLI](https://www.npmjs.com/package/@silkweaver/cli) and the IDE; most people
will reach for one of those rather than this directly.

It takes a project folder and produces a single self-contained `game.js` (the engine is inlined via
esbuild), and can package that into a portable HTML5 build or a desktop executable.

```ts
import { build_preview, export_html5, export_executable } from '@silkweaver/build'

await export_html5('./my-game', './dist')          // portable HTML5 folder
await export_executable('./my-game', './dist', 'win32', 'x64')   // desktop build
```

It also exposes `object_format` — the parse/patch layer the IDE's object editor uses to edit
class-per-object files surgically (preserving your hand-written code).

Pure Node. Part of [Silkweaver](https://github.com/FinnWillow/Silkweaver). License: GPL-3.0.
