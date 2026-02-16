/**
 * Silkweaver Installer — landing page entry point.
 *
 * Renders a "Create New Project" UI in the browser.
 * When the user clicks Create, generates and downloads a project ZIP containing:
 *
 *   my-game/
 *   ├── index.html      (loads engine from CDN + game.js locally)
 *   ├── game.js         (empty user script stub)
 *   ├── assets/         (empty assets folder placeholder)
 *   └── project.json    (project metadata)
 *
 * The engine is loaded from GitHub Pages CDN in development mode.
 * Use the IDE's "Build" button to produce a self-contained release build.
 */

import { zip_create, zip_add_file, zip_add_folder, zip_save } from './zip.js'
import { PAGES_BASE_URL, ENGINE_CDN_URL, INSTALLER_VERSION } from './config.js'

// =========================================================================
// UI setup
// =========================================================================

function init(): void {
    document.title = 'Silkweaver — Create New Project'
    document.body.innerHTML = _render_ui()

    const form = document.getElementById('create-form') as HTMLFormElement
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        const name    = (document.getElementById('project-name') as HTMLInputElement).value.trim()
        const author  = (document.getElementById('author-name')  as HTMLInputElement).value.trim()
        const version = (document.getElementById('game-version') as HTMLInputElement).value.trim()
        if (!name) return _show_error('Project name is required.')
        _create_project(name, author, version)
    })
}

function _render_ui(): string {
    return `
    <div id="installer" style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:24px;border:1px solid #ccc;border-radius:8px;">
        <h1 style="margin-top:0;">🕸 Silkweaver</h1>
        <p>Create a new game project. The engine loads from the CDN during development.
        Use the IDE to build a self-contained release.</p>
        <form id="create-form">
            <label>Project name<br>
                <input id="project-name" type="text" value="my-game" required
                    style="width:100%;box-sizing:border-box;margin-top:4px;padding:6px;">
            </label><br><br>
            <label>Author<br>
                <input id="author-name" type="text" value=""
                    style="width:100%;box-sizing:border-box;margin-top:4px;padding:6px;">
            </label><br><br>
            <label>Version<br>
                <input id="game-version" type="text" value="0.1.0"
                    style="width:100%;box-sizing:border-box;margin-top:4px;padding:6px;">
            </label><br><br>
            <button type="submit" style="padding:8px 20px;cursor:pointer;">
                Download Project ZIP
            </button>
        </form>
        <p id="error-msg" style="color:red;display:none;"></p>
        <hr>
        <small>Engine CDN: <a href="${ENGINE_CDN_URL}" target="_blank">${ENGINE_CDN_URL}</a></small><br>
        <small>Installer v${INSTALLER_VERSION}</small>
    </div>`
}

function _show_error(msg: string): void {
    const el = document.getElementById('error-msg')!
    el.textContent = msg
    el.style.display = 'block'
}

// =========================================================================
// Project generation
// =========================================================================

async function _create_project(name: string, author: string, version: string): Promise<void> {
    const folder = _sanitize_name(name)

    const zip = zip_create()

    // index.html — loads engine from CDN + local game.js
    zip_add_file(zip, `${folder}/index.html`, _make_index_html(name))

    // game.js — empty game script stub with event stubs
    zip_add_file(zip, `${folder}/game.js`, _make_game_js(name))

    // project.json — project metadata
    zip_add_file(zip, `${folder}/project.json`, JSON.stringify({
        name,
        author,
        version,
        engine_version: INSTALLER_VERSION,
        created: new Date().toISOString(),
    }, null, 2))

    // assets/ placeholder
    zip_add_folder(zip, `${folder}/assets/`)
    zip_add_file(zip, `${folder}/assets/.gitkeep`, '')

    await zip_save(zip, `${folder}.zip`)
}

function _sanitize_name(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'my-game'
}

// =========================================================================
// Template generators
// =========================================================================

function _make_index_html(name: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${_escape_html(name)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="silkweaver-canvas"></canvas>
    <!-- Engine loaded from Silkweaver CDN (development mode) -->
    <script type="module" src="${ENGINE_CDN_URL}"></script>
    <!-- Your game code -->
    <script type="module" src="game.js"></script>
</body>
</html>
`
}

function _make_game_js(name: string): string {
    return `/**
 * ${name} — game entry point.
 *
 * The Silkweaver engine is available via the global \`sw\` object
 * (or via ES module imports if you use a bundler).
 *
 * Quick start:
 *   1. Open this file in the Silkweaver IDE (${PAGES_BASE_URL}ide/)
 *   2. Write your game code here
 *   3. Use Build in the IDE to create a self-contained release
 */

// Example: initialise the engine and start the game loop
// import { renderer, game_loop } from './engine.js'  // release build
// renderer.init('silkweaver-canvas', 800, 600)
// game_loop.start()
`
}

function _escape_html(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// =========================================================================
// Boot
// =========================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
