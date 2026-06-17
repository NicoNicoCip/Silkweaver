/**
 * Game build / export logic for the Silkweaver desktop app.
 *
 * Pure Node code (fs/path/esbuild only — no electron imports) so it can be
 * unit-tested and reused outside the IPC layer. main.ts wires these functions
 * to the renderer over IPC.
 *
 * The engine, user scripts, and object code are all bundled into game.js by
 * esbuild, so the ONLY difference between a preview build and an export build
 * is how runtime asset URLs (sprite/background images) are resolved:
 *   - 'preview': absolute file:// URLs into the live project folder (runs in the IDE)
 *   - 'export':  relative 'assets/...' URLs (assets are copied next to game.js)
 */

import * as fs   from 'node:fs'
import * as path from 'node:path'
import * as os   from 'node:os'
import { pathToFileURL } from 'node:url'
import type { project_file as project_data, room_file } from '@silkweaver/project'

export type { project_data }

/** Reads and parses a project's project.json. */
export async function read_project(project_folder: string): Promise<project_data> {
    const proj_text = await fs.promises.readFile(path.join(project_folder, 'project.json'), 'utf8')
    return JSON.parse(proj_text) as project_data
}

/**
 * Returns every runtime export name of the built engine bundle, so the generated
 * entry can import the whole API (keeping it in sync with the IDE's autocomplete).
 * esbuild tree-shakes whatever the game doesn't actually use.
 */
let _engine_names: string[] | null = null
async function engine_export_names(engine_path: string): Promise<string[]> {
    if (_engine_names) return _engine_names
    const mod = await import(pathToFileURL(engine_path).href)
    _engine_names = Object.keys(mod).filter(n => n !== 'default' && /^[A-Za-z_$][\w$]*$/.test(n))
    return _engine_names
}

/** Absolute path to the engine package entry — the esbuild alias target + export-name source. */
function engine_entry(): string {
    return require.resolve('@silkweaver/engine')
}

/**
 * Generates the bootstrapper (_entry.ts) source for a project.
 * @param asset_mode - 'preview' (file:// into project) or 'export' (relative assets/)
 */
async function generate_entry_code(
    project_folder: string,
    proj: project_data,
    asset_mode: 'preview' | 'export',
): Promise<string> {
        const object_names = Object.keys(proj.resources.objects ?? {})
        const room_names   = Object.keys(proj.resources.rooms   ?? {})
        const sprite_names = Object.keys(proj.resources.sprites ?? {})
        const script_names = Object.keys(proj.resources.scripts ?? {})

        // The engine is resolved from the @silkweaver/engine package (no path coupling).
        const engine_path = engine_entry()

        // Each object is a single class file: objects/<name>.ts (a gm_object subclass).
        // It is imported as-is; metadata/variables/events all live in the class.
        const object_imports: string[] = []
        for (const obj_name of object_names) {
            const class_file = path.join(project_folder, 'objects', `${obj_name}.ts`)
            if (await _path_exists(class_file)) {
                object_imports.push(`import { ${obj_name} } from '${class_file.replace(/\\/g, '/')}'`)
            } else {
                console.warn(`[build] object '${obj_name}' has no objects/${obj_name}.ts — skipped`)
            }
        }

        // Build room setup code
        const room_setups: string[] = []
        const room_var_names: string[] = []
        const room_physics: Record<string, { gx: number; gy: number } | null> = {}
        for (const room_name of room_names) {
            const rm_json_path = path.join(project_folder, 'rooms', room_name, 'room.json')
            let rm_data: Partial<room_file> = {}
            try { rm_data = JSON.parse(await fs.promises.readFile(rm_json_path, 'utf8')) } catch { /* empty */ }

            room_physics[room_name] = rm_data.physics_world
                ? { gx: rm_data.physics_gravity_x ?? 0, gy: rm_data.physics_gravity_y ?? 10 }
                : null

            const instances = rm_data.instances ?? []
            const var_name = `_room_${room_name}`
            const inst_lines = instances.map((inst, idx) => {
                if (!object_names.includes(inst.object_name)) return ''
                const v = `_inst_${inst.object_name}_${idx}`
                const lines = [
                    `    const ${v} = new ${inst.object_name}(${var_name})`,
                    `    ${var_name}.room_instance_add(${inst.x}, ${inst.y}, ${v})`,
                ]
                lines.push(`    ${v}.register_events()`)
                lines.push(`    game_loop.register(EVENT_TYPE.create, ${v}.on_create.bind(${v}))`)
                return lines.join('\n')
            }).filter(Boolean).join('\n')
            room_var_names.push(var_name)
            room_setups.push(
`const ${var_name} = new room()
${var_name}.room_width  = ${rm_data.width  ?? 640}
${var_name}.room_height = ${rm_data.height ?? 480}
${var_name}.room_speed  = ${rm_data.room_speed ?? 60}
${var_name}.room_persistent = ${rm_data.persistent ?? false}${
    rm_data.creation_code && rm_data.creation_code.trim()
        ? `\n${var_name}.creation_code = () => {\n${rm_data.creation_code}\n}`
        : ''
}
${inst_lines}`)
        }

        // Script imports
        const script_imports = script_names.map(s =>
            `import '${path.join(project_folder, 'scripts', s + '.ts').replace(/\\/g, '/')}';`
        ).join('\n')

        // Asset URL builders. Preview points at the live project folder via
        // file://; export points at the copied-in relative 'assets/' folder.
        const asset_dir_url = (kind: string, name: string): string =>
            asset_mode === 'export'
                ? `assets/${kind}/${name}`
                : 'file://' + path.join(project_folder, kind, name).replace(/\\/g, '/')
        const asset_meta_url = (kind: string, name: string): string => `${asset_dir_url(kind, name)}/meta.json`

        // Sprite loading code
        const sprite_loads = sprite_names.map(spr_name =>
            `await _load_sprite('${spr_name}', '${asset_meta_url('sprites', spr_name)}', '${asset_dir_url('sprites', spr_name)}')`
        ).join('\n')

        // Background loading code
        const bg_names = Object.keys(proj.resources.backgrounds || {})
        const bg_loads = bg_names.map(bg_name =>
            `await _load_background('${bg_name}', '${asset_meta_url('backgrounds', bg_name)}', '${asset_dir_url('backgrounds', bg_name)}')`
        ).join('\n')

        // Determine start room
        const start_room = proj.settings.startRoom || room_names[0] || ''
        const start_var  = start_room ? `_room_${start_room}` : room_var_names[0] ?? 'undefined'

        // Import the entire engine API (esbuild tree-shakes what the game doesn't use)
        // so everything the IDE autocompletes is actually available at runtime.
        const engine_names  = await engine_export_names(engine_path)
        const engine_import = `import {\n${engine_names.map(n => '    ' + n).join(',\n')},\n} from '@silkweaver/engine'`

        const entry_code = `// Auto-generated by Silkweaver IDE — do not edit manually.
${engine_import}

${object_imports.join('\n')}

${script_imports}

// ── Sprite loader ───────────────────────────────────────────────────────────
const _sprite_map: Record<string, number> = {}

async function _load_sprite(name: string, meta_url: string, img_base: string): Promise<void> {
    // Sprites are loaded and dimensions extracted from meta.json
    // This is a best-effort loader — missing frames are silently skipped
    try {
        const meta = await fetch(meta_url).then(r => r.json())

        // Create sprite resource
        const spr = new sprite()
        spr.width = meta.width || 32
        spr.height = meta.height || 32
        spr.xoffset = meta.origin_x || 0
        spr.yoffset = meta.origin_y || 0

        // Load all frames specified in meta.json
        const frames = meta.frames || []
        if (frames.length === 0) {
            console.warn(\`[Sprite] \${name} has no frames defined in meta.json\`)
            return
        }

        // Load each frame image
        for (const frame_meta of frames) {
            const frame_name = frame_meta.name || frame_meta
            const frame_url = img_base + '/' + frame_name

            try {
                // Use texture_manager to load the image and create a WebGL texture
                const tex_entry = await renderer.tex_mgr.load(frame_url, false)
                spr.add_frame({
                    texture: tex_entry,
                    width: tex_entry.width,
                    height: tex_entry.height
                })
            } catch (err) {
                console.warn(\`[Sprite] Failed to load frame \${frame_name} for \${name}:\`, err)
            }
        }

        // Only register the sprite if at least one frame loaded successfully
        if (spr.frames.length > 0) {
            _sprite_map[name] = spr.id
            sprite_register_name(name, spr.id)   // so class-file 'static sprite = name' resolves
        } else {
            console.warn(\`[Sprite] \${name} has no valid frames\`)
        }
    } catch (err) {
        console.warn(\`[Sprite] Failed to load \${name}:\`, err)
    }
}

// ── Background loader ───────────────────────────────────────────────────────
const _background_map: Record<string, number> = {}

async function _load_background(name: string, meta_url: string, img_base: string): Promise<void> {
    // Backgrounds are loaded from meta.json + single image file
    try {
        const meta = await fetch(meta_url).then(r => r.json())

        if (!meta.file_name) {
            console.warn(\`[Background] \${name} has no file_name in meta.json\`)
            return
        }

        // Create background resource
        const bg = new background()
        bg.tile_h = meta.tile_h ?? false
        bg.tile_v = meta.tile_v ?? false
        bg.smooth = meta.smooth ?? false

        // Load the background image
        const img_url = img_base + '/' + meta.file_name

        try {
            // Use texture_manager to load with appropriate filtering
            const tex_entry = await renderer.tex_mgr.load(img_url, bg.smooth)
            bg.set_texture(tex_entry)
            _background_map[name] = bg.id
        } catch (err) {
            console.warn(\`[Background] Failed to load image for \${name}:\`, err)
        }
    } catch (err) {
        console.warn(\`[Background] Failed to load \${name}:\`, err)
    }
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
export default async function init(canvas: HTMLCanvasElement): Promise<void> {
    renderer.init(canvas, ${proj.settings.windowWidth ?? 640}, ${proj.settings.windowHeight ?? 480})
    // Background clear color: ${proj.settings.displayColor ?? '#000000'}
    game_loop.init_input(canvas)

    // Load sprites
    ${sprite_loads}

    // Load backgrounds
    ${bg_loads}

    // Set up rooms
    ${room_setups.join('\n')}

    // Link room order
    ${room_var_names.map((v, i) => {
        const prev = room_var_names[i - 1]
        const next = room_var_names[i + 1]
        return [
            prev ? `${v}.room_previous = ${prev}.id` : '',
            next ? `${v}.room_next = ${next}.id` : '',
        ].filter(Boolean).join('\n    ')
    }).join('\n    ')}

    const start = ${start_var}
    if (!start) { console.error('[Game] No rooms defined.'); return }
${room_physics[start_room] ? `    physics_world_create(${room_physics[start_room]!.gx}, ${room_physics[start_room]!.gy})\n` : ''}    game_loop.start(start)
}
`
        return entry_code
}

/**
 * Writes a temporary _entry.ts into the project folder, bundles it to a single
 * ESM game.js at out_path via esbuild, then removes the temporary file.
 */
async function bundle_game(
    project_folder: string,
    proj: project_data,
    asset_mode: 'preview' | 'export',
    out_path: string,
    minify: boolean,
): Promise<void> {
    const entry_code = await generate_entry_code(project_folder, proj, asset_mode)
    const entry_path = path.join(project_folder, '_entry.ts')
    await fs.promises.writeFile(entry_path, entry_code, 'utf8')
    try {
        // Run esbuild via its Node API. Alias the package specifier to the resolved engine
        // entry so the generated entry AND any class-per-object files resolve to the same
        // engine (deduped), without needing node_modules inside the project folder.
        const esbuild_api = require('esbuild')
        await esbuild_api.build({
            entryPoints: [entry_path],
            bundle:      true,
            outfile:     out_path,
            format:      'esm',
            minify,
            alias:       { '@silkweaver/engine': engine_entry() },
        })
    } finally {
        await fs.promises.unlink(entry_path).catch(() => {})
    }
}

/**
 * Builds the game to a single bundled game.js at out_path, for the in-IDE preview.
 * @param out_path - Where to write game.js (the caller decides — e.g. exports/game.js)
 */
export async function build_preview(project_folder: string, out_path: string): Promise<void> {
    const proj = await read_project(project_folder)
    await bundle_game(project_folder, proj, 'preview', out_path, false)
}

/**
 * Exports a portable, self-contained HTML5 build into out_dir:
 *   out_dir/game.js     — minified, fully self-contained game (engine inlined)
 *   out_dir/index.html  — standalone player page
 *   out_dir/assets/...  — copied sprite/background assets (referenced relatively)
 * @returns The export directory path.
 */
export async function export_html5(project_folder: string, out_dir: string): Promise<string> {
    const proj = await read_project(project_folder)
    await fs.promises.mkdir(out_dir, { recursive: true })

    // 1. Bundle the game with relative asset URLs
    await bundle_game(project_folder, proj, 'export', path.join(out_dir, 'game.js'), true)

    // 2. Copy only the *registered* sprite/background assets next to game.js
    //    (matching what generate_entry_code loads — avoids shipping orphaned files).
    for (const kind of ['sprites', 'backgrounds'] as const) {
        for (const name of Object.keys(proj.resources[kind] ?? {})) {
            const src = path.join(project_folder, kind, name)
            if (await _path_exists(src)) await _copy_dir(src, path.join(out_dir, 'assets', kind, name))
        }
    }

    // 3. Write the standalone player page
    await fs.promises.writeFile(path.join(out_dir, 'index.html'), _player_html(proj), 'utf8')

    return out_dir
}

/**
 * Exports a standalone desktop executable for the game.
 *
 * Stages a minimal Electron "player" app (a fixed main process that serves the
 * exported game over a privileged `game://` protocol), then runs
 * @electron/packager to produce a platform binary in out_dir.
 *
 * @param platform - 'win32' | 'darwin' | 'linux' (default 'win32')
 * @param arch     - 'x64' | 'arm64' (default 'x64')
 * @returns Absolute path to the packaged application folder.
 */
export async function export_executable(
    project_folder: string,
    out_dir: string,
    platform: string = 'win32',
    arch: string = 'x64',
): Promise<string> {
    const proj     = await read_project(project_folder)
    const app_name = _safe_name(proj.name)

    // Stage: <staging>/{ package.json, main.js, game/ }
    const staging = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sw-exe-'))
    try {
        await export_html5(project_folder, path.join(staging, 'game'))

        await fs.promises.writeFile(
            path.join(staging, 'package.json'),
            JSON.stringify({
                name:        app_name,
                productName: proj.name || 'Silkweaver Game',
                version:     '1.0.0',
                main:        'main.js',
            }, null, 2),
            'utf8',
        )
        await fs.promises.writeFile(path.join(staging, 'main.js'), _player_main_js(proj), 'utf8')

        await fs.promises.mkdir(out_dir, { recursive: true })

        // Pin to the running Electron version (fall back to the installed package
        // version when invoked outside Electron, e.g. from a test harness).
        const electron_version = process.versions.electron || require('electron/package.json').version
        const icon = await _resolve_icon(project_folder)

        const { packager } = await import('@electron/packager')
        const out_paths = await packager({
            dir:             staging,
            out:             out_dir,
            platform:        platform as any,
            arch:            arch as any,
            overwrite:       true,
            electronVersion: electron_version,
            appVersion:      '1.0.0',
            ...(icon ? { icon } : {}),
        })
        return out_paths[0] ?? out_dir
    } finally {
        await fs.promises.rm(staging, { recursive: true, force: true }).catch(() => {})
    }
}

/** Generates the minimal Electron player main process for a packaged game. */
function _player_main_js(proj: project_data): string {
    const w     = proj.settings.windowWidth  ?? 640
    const h     = proj.settings.windowHeight ?? 480
    const bg    = JSON.stringify(proj.settings.displayColor ?? '#000000')
    const title = JSON.stringify(proj.name || 'Silkweaver Game')
    return `// Auto-generated Silkweaver player shell.
const { app, BrowserWindow, protocol } = require('electron')
const path = require('path')
const fs   = require('fs')

const GAME_W = ${w}, GAME_H = ${h}, GAME_TITLE = ${title}, GAME_BG = ${bg}
const GAME_DIR = path.join(__dirname, 'game')

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp',
    '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
}

// A privileged scheme lets the game use ES modules + fetch like a real http origin,
// without disabling web security or running a local server.
protocol.registerSchemesAsPrivileged([
    { scheme: 'game', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
])

function create_window() {
    const win = new BrowserWindow({
        width: GAME_W, height: GAME_H, useContentSize: true,
        title: GAME_TITLE, backgroundColor: GAME_BG,
        webPreferences: { contextIsolation: true, nodeIntegration: false },
    })
    win.setMenuBarVisibility(false)
    win.loadURL('game://app/index.html')
}

app.whenReady().then(() => {
    protocol.handle('game', async (request) => {
        let rel = decodeURIComponent(new URL(request.url).pathname)
        if (rel === '/' || rel === '') rel = '/index.html'
        const file = path.join(GAME_DIR, rel)
        if (!file.startsWith(GAME_DIR)) return new Response('Forbidden', { status: 403 })
        try {
            const data = await fs.promises.readFile(file)
            const ext  = path.extname(file).toLowerCase()
            return new Response(data, { headers: { 'content-type': MIME[ext] || 'application/octet-stream' } })
        } catch {
            return new Response('Not found', { status: 404 })
        }
    })
    create_window()
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) create_window() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
`
}

/**
 * Resolves an application icon for packaging. Prefers a project-provided icon
 * (icon.ico / icon.png in the project root), then falls back to the bundled
 * Silkweaver icon. @electron/packager picks the right format per platform.
 */
async function _resolve_icon(project_folder: string): Promise<string | undefined> {
    const candidates = [
        path.join(project_folder, 'icon.ico'),
        path.join(project_folder, 'icon.png'),
        path.join(__dirname, '../assets/icon.ico'),  // bundled default (packages/build/assets)
    ]
    for (const c of candidates) {
        if (await _path_exists(c)) return c
    }
    return undefined
}

/** Normalizes a project name into a safe lowercase application name. */
function _safe_name(name: string): string {
    const s = (name || 'silkweaver-game').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return s || 'silkweaver-game'
}

/** Returns true if a filesystem path exists. */
async function _path_exists(p: string): Promise<boolean> {
    try { await fs.promises.access(p); return true } catch { return false }
}

/** Recursively copies a directory tree from src to dst. */
async function _copy_dir(src: string, dst: string): Promise<void> {
    await fs.promises.mkdir(dst, { recursive: true })
    for (const entry of await fs.promises.readdir(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name)
        const d = path.join(dst, entry.name)
        if (entry.isDirectory()) await _copy_dir(s, d)
        else                     await fs.promises.copyFile(s, d)
    }
}

/** Generates the standalone player HTML page for an exported game. */
function _player_html(proj: project_data): string {
    const w     = proj.settings.windowWidth  ?? 640
    const h     = proj.settings.windowHeight ?? 480
    const bg    = proj.settings.displayColor ?? '#000000'
    const title = (proj.name || 'Silkweaver Game').replace(/</g, '&lt;')
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: ${bg}; overflow: hidden; }
  canvas { display: block; position: absolute; top: 50%; left: 50%;
           transform: translate(-50%, -50%); image-rendering: pixelated; outline: none; }
</style>
</head>
<body>
<canvas id="sw-canvas" width="${w}" height="${h}" tabindex="0"></canvas>
<script type="module">
  const canvas = document.getElementById('sw-canvas')
  canvas.focus()
  canvas.addEventListener('click', () => canvas.focus())
  try {
    const { default: game_init } = await import('./game.js')
    if (typeof game_init === 'function') await game_init(canvas)
  } catch (e) {
    console.error('Failed to start game:', e)
  }
</script>
</body>
</html>
`
}

// (Event→method mapping is no longer needed — objects are class files with on_* methods.)
