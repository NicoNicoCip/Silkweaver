# @silkweaver/cli

The command-line way to make a game with [Silkweaver](https://github.com/NicoNicoCip/Silkweaver) —
the same GameMaker-1.4-inspired engine and toolchain as the IDE, without the GUI. If you'd rather
live in your own editor and write code, this is for you.

```sh
npx silkweaver new my-game     # scaffold a project
cd my-game
npx silkweaver run             # build, serve over http, and open it in the browser
```

## Commands

| Command | What it does |
|---|---|
| `silkweaver new <name>` | Scaffold a new project folder (set up as an npm package). |
| `silkweaver build [project] [out]` | Build a portable HTML5 folder (default: `<project>/dist`). |
| `silkweaver run [project] [--port N]` | Build, serve, and open the game in the browser. |
| `silkweaver export [project] [out] --target web\|win\|mac\|linux` | Export an HTML5 build or a packaged desktop executable. |

`project` defaults to the current directory.

A game is one file per object — `objects/<name>.ts`, a class extending `gm_object`, with `static`
settings, instance-variable fields, and `on_*` event methods. Engine functions are available without
imports; the build wires them in. See the
[main repository](https://github.com/NicoNicoCip/Silkweaver) for the full guide and API reference.

License: GPL-3.0
