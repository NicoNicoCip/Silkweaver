/**
 * @silkweaver/build — the Silkweaver toolchain.
 *
 * Turns a project folder into a runnable game:
 *   - build_preview      → exports/game.js (in-IDE preview)
 *   - export_html5       → a portable, self-contained HTML5 folder
 *   - export_executable  → a packaged desktop application
 *
 * Also re-exports the class-file object read/write layer (object_format) used by the
 * IDE's object editor, and the starter-template materializer (templates). Pure Node —
 * drives both the IDE (over IPC) and the CLI.
 */

export * from './build.js'
export * from './object_format.js'
export * from './templates.js'
