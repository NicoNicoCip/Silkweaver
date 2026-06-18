# @silkweaver/project

The canonical project-format types for [Silkweaver](https://github.com/NicoNicoCip/Silkweaver) — the
shared definition of what a `project.json` and a `room.json` look like.

It's **types only**: zero runtime, zero dependencies. The engine, the build toolchain, the CLI, and
the IDE all import these types so they agree on the on-disk shape of a project. You'd only depend on
this directly if you're writing your own tool that reads or writes Silkweaver projects.

```ts
import type { project_file, room_file, room_instance } from '@silkweaver/project'
```

License: GPL-3.0
