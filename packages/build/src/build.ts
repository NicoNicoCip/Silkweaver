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
 * Strips leading `import …` lines from a code snippet so it can be inlined inside a
 * function body (timeline moments). Engine references auto-resolve via the inject shim,
 * so the imports are redundant; importing inside a function body is also a syntax error.
 */
function _strip_import_lines(code: string): string {
    return code
        .split('\n')
        .filter(line => !/^\s*import\s.+from\s+['"][^'"]+['"]\s*;?\s*$/.test(line) && !/^\s*import\s+['"][^'"]+['"]\s*;?\s*$/.test(line))
        .join('\n')
}

/** Converts a CSS hex colour ('#rrggbb') to a GMS BGR integer (0xBBGGRR). */
function hex_to_bgr(hex: string): number {
    const m = /^#?([0-9a-fA-F]{6})$/.exec((hex ?? '').trim())
    if (!m) return 0
    const n = parseInt(m[1]!, 16)
    const r = (n >> 16) & 0xFF, g = (n >> 8) & 0xFF, b = n & 0xFF
    return (b << 16) | (g << 8) | r
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
        const object_names   = Object.keys(proj.resources.objects ?? {})
        const room_names     = Object.keys(proj.resources.rooms   ?? {})
        const sprite_names   = Object.keys(proj.resources.sprites ?? {})
        const script_names   = Object.keys(proj.resources.scripts ?? {})
        const font_names     = Object.keys(proj.resources.fonts     ?? {})
        const path_names     = Object.keys(proj.resources.paths     ?? {})
        const timeline_names = Object.keys(proj.resources.timelines ?? {})

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
            // Track the first placed instance of each object so views can follow it.
            const first_inst_by_obj: Record<string, string> = {}
            const inst_lines = instances.map((inst, idx) => {
                if (!object_names.includes(inst.object_name)) return ''
                const v = `_inst_${inst.object_name}_${idx}`
                if (!(inst.object_name in first_inst_by_obj)) first_inst_by_obj[inst.object_name] = v
                const lines = [
                    `    const ${v} = new ${inst.object_name}(${var_name})`,
                    `    ${var_name}.room_instance_add(${inst.x}, ${inst.y}, ${v})`,
                ]
                // Per-instance transform (only emit non-defaults to keep generated code tidy).
                if ((inst.scale_x ?? 1) !== 1) lines.push(`    ${v}.image_xscale = ${inst.scale_x}`)
                if ((inst.scale_y ?? 1) !== 1) lines.push(`    ${v}.image_yscale = ${inst.scale_y}`)
                if ((inst.rotation ?? 0) !== 0) lines.push(`    ${v}.image_angle = ${inst.rotation}`)
                lines.push(`    ${v}.register_events()`)
                lines.push(`    game_loop.register(EVENT_TYPE.create, ${v}.on_create.bind(${v}))`)
                // Per-instance creation code runs after the object's Create event (bound: this = instance).
                if (inst.creation_code && inst.creation_code.trim()) {
                    lines.push(`    game_loop.register(EVENT_TYPE.create, (function(this: any){\n${inst.creation_code}\n}).bind(${v}))`)
                }
                return lines.join('\n')
            }).filter(Boolean).join('\n')

            // Background layers (name → runtime id via _background_map).
            const bg_lines = (rm_data.backgrounds ?? []).map((bl, i) => {
                if (!bl.bg_name) return ''
                return [
                    `    ${var_name}.background_index[${i}]      = _background_map['${bl.bg_name}'] ?? -1`,
                    `    ${var_name}.background_visible[${i}]    = ${bl.enabled ?? true}`,
                    `    ${var_name}.background_foreground[${i}] = false`,
                    `    ${var_name}.background_htiled[${i}]     = ${bl.tile_x ?? false}`,
                    `    ${var_name}.background_vtiled[${i}]     = ${bl.tile_y ?? false}`,
                    `    ${var_name}.background_stretch[${i}]    = ${bl.stretch ?? false}`,
                    `    ${var_name}.background_x[${i}]          = 0`,
                    `    ${var_name}.background_y[${i}]          = 0`,
                    `    ${var_name}.background_color[${i}]      = 0xFFFFFF`,
                ].join('\n')
            }).filter(Boolean).join('\n')

            // Views / cameras. follow (object name) resolves to the first placed instance.
            const views = rm_data.views ?? []
            const view_lines = views.some(v => v.enabled)
                ? [`    ${var_name}.view_enabled = true`].concat(views.map((vw, i) => {
                    const fv = vw.follow ? first_inst_by_obj[vw.follow] : undefined
                    return [
                        `    ${var_name}.view_visible[${i}] = ${vw.enabled ?? false}`,
                        `    ${var_name}.view_xview[${i}]   = ${vw.view_x ?? 0}`,
                        `    ${var_name}.view_yview[${i}]   = ${vw.view_y ?? 0}`,
                        `    ${var_name}.view_wview[${i}]   = ${vw.view_w ?? 640}`,
                        `    ${var_name}.view_hview[${i}]   = ${vw.view_h ?? 480}`,
                        `    ${var_name}.view_xport[${i}]   = ${vw.port_x ?? 0}`,
                        `    ${var_name}.view_yport[${i}]   = ${vw.port_y ?? 0}`,
                        `    ${var_name}.view_wport[${i}]   = ${vw.port_w ?? vw.view_w ?? 640}`,
                        `    ${var_name}.view_hport[${i}]   = ${vw.port_h ?? vw.view_h ?? 480}`,
                        fv
                            ? `    ${var_name}.view_hborder[${i}] = 32\n    ${var_name}.view_vborder[${i}] = 32\n    ${var_name}.view_object[${i}] = ${fv}.id`
                            : `    ${var_name}.view_object[${i}] = -1`,
                    ].join('\n')
                })).join('\n')
                : ''

            // Tiles — each is a sub-rectangle of a background used as a tileset.
            const tile_lines = (rm_data.tiles ?? []).map((t) => {
                if (!t.bg_name) return ''
                const bid = `_background_map['${t.bg_name}']`
                return `    if (${bid} !== undefined) ${var_name}.tile_add(${bid}, ${t.left}, ${t.top}, ${t.width}, ${t.height}, ${t.x}, ${t.y}, ${t.depth})`
            }).filter(Boolean).join('\n')

            room_var_names.push(var_name)
            // Instances / layers / tiles go inside a `builder` closure so the room can rebuild
            // itself from this definition when (re-)entered. Non-persistent rooms rebuild fresh
            // on every entry; persistent rooms keep their live state after the first build.
            room_setups.push(
`const ${var_name} = new room()
${var_name}.room_width  = ${rm_data.width  ?? 640}
${var_name}.room_height = ${rm_data.height ?? 480}
${var_name}.room_speed  = ${rm_data.room_speed ?? 60}
${var_name}.room_persistent = ${rm_data.persistent ?? false}
${var_name}.background_show_color  = ${rm_data.bg_show_color ?? true}
${var_name}.background_solid_color = ${hex_to_bgr(rm_data.bg_color ?? '#000000')}${
    rm_data.creation_code && rm_data.creation_code.trim()
        ? `\n${var_name}.creation_code = () => {\n${rm_data.creation_code}\n}`
        : ''
}
${var_name}.builder = () => {
${inst_lines}
${bg_lines}
${view_lines}
${tile_lines}
}`)
        }

        // ── Fonts ────────────────────────────────────────────────────────────
        // CSS-family fonts (family/size/style) read from fonts/<n>/meta.json and
        // registered by name so `draw_set_font('fnt_x')` resolves at runtime.
        const font_setups: string[] = []
        for (const fn of font_names) {
            let fd: any = {}
            try { fd = JSON.parse(await fs.promises.readFile(path.join(project_folder, 'fonts', fn, 'meta.json'), 'utf8')) } catch { /* default */ }
            const family = typeof fd.font_name === 'string' && fd.font_name.trim() ? fd.font_name : 'Arial'
            const size   = Number(fd.size) || 16
            font_setups.push(`    font_register_name('${fn}', new font_resource(${JSON.stringify(family)}, ${size}, ${!!fd.bold}, ${!!fd.italic}))`)
        }

        // ── Paths ────────────────────────────────────────────────────────────
        // Read paths/<n>/path.json and rebuild the path resource inline (point speed
        // is stored 0–100 in the editor; the engine uses a 1 = normal factor).
        const path_setups: string[] = []
        for (const pn of path_names) {
            let pd: any = {}
            try { pd = JSON.parse(await fs.promises.readFile(path.join(project_folder, 'paths', pn, 'path.json'), 'utf8')) } catch { /* default */ }
            const pts  = Array.isArray(pd.points) ? pd.points : []
            const kind = pd.kind === 'smooth' ? 'path_kind_smooth' : 'path_kind_linear'
            const v    = `_path_${pn}`
            const lines = [
                `    const ${v} = path_create()`,
                `    path_set_kind(${v}, ${kind})`,
                `    path_set_closed(${v}, ${!!pd.closed})`,
            ]
            for (const p of pts) {
                const sp = (typeof p.sp === 'number' ? p.sp : 100) / 100
                lines.push(`    path_add_point(${v}, ${Number(p.x) || 0}, ${Number(p.y) || 0}, ${sp})`)
            }
            lines.push(`    path_register_name('${pn}', ${v})`)
            path_setups.push(lines.join('\n'))
        }

        // ── Timelines ────────────────────────────────────────────────────────
        // Each moment's code lives in timelines/<n>/step_<step>.ts; inline it as a
        // callback (bare engine calls auto-resolve via the esbuild inject shim).
        const timeline_setups: string[] = []
        for (const tn of timeline_names) {
            let td: any = {}
            try { td = JSON.parse(await fs.promises.readFile(path.join(project_folder, 'timelines', tn, 'timeline.json'), 'utf8')) } catch { /* default */ }
            const moments = Array.isArray(td.moments) ? td.moments : []
            const v = `_tl_${tn}`
            const lines = [`    const ${v} = timeline_create()`]
            for (const m of moments) {
                const step = Number(m.step) || 0
                let code = ''
                try { code = await fs.promises.readFile(path.join(project_folder, 'timelines', tn, `step_${step}.ts`), 'utf8') } catch { /* no code */ }
                code = _strip_import_lines(code)
                if (code.trim()) lines.push(`    timeline_moment_add(${v}, ${step}, () => {\n${code}\n    })`)
            }
            lines.push(`    timeline_register_name('${tn}', ${v})`)
            timeline_setups.push(lines.join('\n'))
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

        // Sound loading code
        const sound_names = Object.keys(proj.resources.sounds || {})
        const sound_loads = sound_names.map(s =>
            `await _load_sound('${s}', '${asset_meta_url('sounds', s)}', '${asset_dir_url('sounds', s)}')`
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
        // Collision mask rectangle (sprite editor). Only applied when a valid box is set.
        if (typeof meta.mask_w === 'number' && meta.mask_w > 0 && typeof meta.mask_h === 'number' && meta.mask_h > 0) {
            spr.mask_left   = meta.mask_x || 0
            spr.mask_top    = meta.mask_y || 0
            spr.mask_right  = (meta.mask_x || 0) + meta.mask_w
            spr.mask_bottom = (meta.mask_y || 0) + meta.mask_h
        }

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

// ── Sound loader ─────────────────────────────────────────────────────────────
const _sound_map: Record<string, number> = {}

async function _load_sound(name: string, meta_url: string, base: string): Promise<void> {
    try {
        const meta = await fetch(meta_url).then(r => r.json())
        if (!meta.file_name) { console.warn(\`[Sound] \${name} has no file_name in meta.json\`); return }
        const snd = new sound_asset()
        await snd.load_url(base + '/' + meta.file_name, 'default', meta.kind === 'music')
        sound_register_name(name, snd)
        _sound_map[name] = snd.id
    } catch (err) {
        console.warn(\`[Sound] Failed to load \${name}:\`, err)
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

    // Load sounds
    ${sound_loads}

    // Register fonts (resolve 'fnt_x' by name)
    ${font_setups.join('\n')}

    // Register paths (resolve via path_get_index('pth_x'))
    ${path_setups.join('\n')}

    // Register timelines (resolve via timeline_get_index('tml_x'))
    ${timeline_setups.join('\n')}

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
    const entry_path   = path.join(project_folder, '_entry.ts')
    const globals_path = path.join(project_folder, '_engine_globals.ts')
    await fs.promises.writeFile(entry_path, entry_code, 'utf8')

    // Auto-import management: a shim that re-exports the whole engine API. Passed to esbuild's
    // `inject`, it makes any *bare* engine reference in an object/script file (e.g. `gm_object`,
    // `draw_sprite`) resolve to an auto-injected import — tree-shaken — so users never write or
    // manage `import … from '@silkweaver/engine'` themselves.
    const engine_names = await engine_export_names(engine_entry())
    await fs.promises.writeFile(globals_path, `export { ${engine_names.join(', ')} } from '@silkweaver/engine'\n`, 'utf8')

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
            inject:      [globals_path],
        })
    } finally {
        await fs.promises.unlink(entry_path).catch(() => {})
        await fs.promises.unlink(globals_path).catch(() => {})
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

    // 2. Copy only the *registered* sprite/background/sound assets next to game.js
    //    (matching what generate_entry_code loads — avoids shipping orphaned files).
    for (const kind of ['sprites', 'backgrounds', 'sounds'] as const) {
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
