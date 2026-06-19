/**
 * Silkweaver IDE — entry point.
 * Bootstraps the workspace, menubar, status bar, and resource tree.
 */

import { theme_inject }                                              from './theme.js'
import { menubar_default }                                           from './menubar.js'
import { ui_scale_init, ui_scale_in, ui_scale_out, ui_scale_reset, editor_font_in, editor_font_out, editor_font_reset } from './ui_scale.js'
import { file_watch_init, file_watch_set_folder } from './services/file_watch.js'
import { ide_theme_init } from './ide_prefs.js'
import { updater_init } from './updater.js'
import { status_bar_create, status_set_project, status_set_unsaved } from './status_bar.js'
import { ResourceTree }                                              from './resource_tree.js'
import type { open_resource_event, resource_category }               from './resource_tree.js'
import { project_new, project_open, project_save, project_set_dir, project_set_folder, project_get_dir, project_has_folder, project_get_folder_path, project_get_last_folder, project_read_file, project_write_file, project_file_exists, project_rename, project_copy, project_delete }  from './services/project.js'
import type { project_state }                                         from './services/project.js'
import { start_page_show, recent_add }                               from './start_page.js'
import { undo_push, undo_undo, undo_redo, undo_clear }               from './services/undo.js'
import { script_editor_open, script_editor_open_smart, inject_project_types } from './editors/script_editor.js'
import { sprite_editor_open }      from './editors/sprite_editor.js'
import { object_editor_open }      from './editors/object_editor.js'
import { room_editor_open }        from './editors/room_editor.js'
import { sound_editor_open }       from './editors/sound_editor.js'
import { background_editor_open }  from './editors/background_editor.js'
import { font_editor_open }        from './editors/font_editor.js'
import { path_editor_open }        from './editors/path_editor.js'
import { timeline_editor_open }    from './editors/timeline_editor.js'
import { settings_editor_open }   from './editors/settings_editor.js'
import { preferences_editor_open } from './editors/preferences_editor.js'
import { preview_open, preview_play, preview_stop, preview_reload }  from './panels/game_preview.js'
import { console_open, console_write, console_toggle }               from './panels/console_panel.js'
import { debugger_open, debugger_show_hit }                          from './panels/debugger_panel.js'
import { profiler_open }                                             from './panels/profiler_panel.js'
import { docs_open }                                                 from './panels/docs_window.js'
import { bp_resume, bp_on_hit }                                      from './panels/breakpoint_manager.js'
import { show_alert, show_prompt, show_confirm }                     from './services/dialogs.js'
import { ICON }                                                     from './icons.js'
import { FloatingWindow }                                           from './window_manager.js'

// Alias dialog functions for local use
const _alert   = show_alert
const _prompt  = show_prompt
const _confirm = show_confirm

// =========================================================================
// State
// =========================================================================

let _project:   project_state | null = null
let _tree:      ResourceTree
let _workspace: HTMLElement

// =========================================================================
// Boot
// =========================================================================

function boot(): void {
    // 1. Inject global styles + apply persisted interface scale and IDE theme.
    theme_inject()
    ide_theme_init()
    ui_scale_init()
    file_watch_init()   // listen for external file changes (parallel editing)
    updater_init()      // desktop auto-update notice (no-op in the browser / dev)

    // 2. Menubar (fixed, top)
    const menubar = menubar_default({
        file_start_page:       _show_start_page,
        file_new:              on_file_new,
        file_open:             on_file_open,
        file_save:             on_file_save,
        file_save_as:          on_file_save_as,
        res_add_sprite:        () => on_add_resource('sprites'),
        res_add_sound:         () => on_add_resource('sounds'),
        res_add_background:    () => on_add_resource('backgrounds'),
        res_add_path:          () => on_add_resource('paths'),
        res_add_script:        () => on_add_resource('scripts'),
        res_add_font:          () => on_add_resource('fonts'),
        res_add_timeline:      () => on_add_resource('timelines'),
        res_add_object:        () => on_add_resource('objects'),
        res_add_room:          () => on_add_resource('rooms'),
        edit_game_settings:    on_edit_game_settings,
        edit_preferences:      () => preferences_editor_open(_workspace),
        view_resources:        () => _tree.show(),
        view_console:          () => console_open(_workspace),
        view_debugger:         () => debugger_open(_workspace),
        view_profiler:         () => profiler_open(_workspace),
        view_preview:          () => preview_open(_workspace),
        view_zoom_in:          ui_scale_in,
        view_zoom_out:         ui_scale_out,
        view_zoom_reset:       ui_scale_reset,
        view_editor_font_in:   editor_font_in,
        view_editor_font_out:  editor_font_out,
        view_editor_font_reset:editor_font_reset,
        run_play:              on_run_play,
        run_stop:              on_run_stop,
        run_build:             on_run_build,
        run_export_html5:      on_export_html5,
        run_export_win:        () => on_export_exe('win32', 'x64',   'Windows'),
        run_export_mac:        () => on_export_exe('darwin', 'arm64', 'macOS'),
        run_export_linux:      () => on_export_exe('linux', 'x64',    'Linux'),
        window_cascade:        () => FloatingWindow.cascade(),
        window_tile:           () => FloatingWindow.tile(),
        window_minimize_all:   () => FloatingWindow.minimize_all(),
        window_close_all:      () => FloatingWindow.close_all(),
        window_list:           () => FloatingWindow.list().map(w => ({ title: w.get_title(), focus: () => w.focus() })),
        help_docs:             () => docs_open(_workspace),
        help_about:            on_help_about,
    })
    document.body.appendChild(menubar)

    // 3. Toolbar (fixed, below the menubar)
    document.body.appendChild(_build_toolbar())

    // 4. Main area: docked resource tree | splitter | MDI work area
    const main      = document.createElement('div'); main.id      = 'sw-main'
    const dock      = document.createElement('div'); dock.id      = 'sw-dock'
    const splitter  = document.createElement('div'); splitter.id  = 'sw-splitter'
    _workspace      = document.createElement('div'); _workspace.id = 'sw-workspace'
    main.append(dock, splitter, _workspace)
    document.body.appendChild(main)
    _setup_splitter(dock, splitter)

    // 5. Status bar (fixed, bottom)
    document.body.appendChild(status_bar_create())

    // 6. Resource tree (docked, left)
    _tree = new ResourceTree()
    _tree.on_add_resource       = on_add_resource
    _tree.on_delete_resource    = on_delete_resource
    _tree.on_rename_resource    = on_rename_resource
    _tree.on_duplicate_resource = on_duplicate_resource
    _tree.mount(dock)

    // 6. Listen for resource open events
    document.addEventListener('sw:open_resource', (e) => {
        const { category, name } = (e as CustomEvent<open_resource_event>).detail
        on_open_resource(category, name)
    })

    // 7. Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); on_file_save() }
        if (e.ctrlKey && e.key === 'n') { e.preventDefault(); on_file_new() }
        if (e.ctrlKey && e.key === 'o') { e.preventDefault(); on_file_open() }
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); _on_undo() }
        if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); _on_redo() }
        if (e.key === 'F5' && !e.ctrlKey) { e.preventDefault(); on_run_play() }
        if (e.key === 'F5' &&  e.ctrlKey) { e.preventDefault(); on_run_build() }
        if (e.key === 'F8')               { e.preventDefault(); bp_resume(); console_write('system', '[IDE] Resumed.') }
        if (e.key === 'F9')               { e.preventDefault(); debugger_open(_workspace) }
        if (e.key === 'F10')              { e.preventDefault(); profiler_open(_workspace) }
        if (e.key === 'F1')               { e.preventDefault(); docs_open(_workspace) }
        // F11 now toggles output console (see below)
        if (e.ctrlKey && e.key === 'r')   { e.preventDefault(); _tree.show() }
        if (e.ctrlKey && e.shiftKey && e.key === 'P') { e.preventDefault(); on_edit_game_settings() }
        if (e.ctrlKey && e.key === ',') { e.preventDefault(); preferences_editor_open(_workspace) }
        // Interface scale: Ctrl +/-/0. '=' is the unshifted '+'.
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) { e.preventDefault(); ui_scale_in() }
        if (e.ctrlKey && e.key === '-')                    { e.preventDefault(); ui_scale_out() }
        if (e.ctrlKey && e.key === '0')                    { e.preventDefault(); ui_scale_reset() }
    })

    // 8. Register global breakpoint-hit handler
    bp_on_hit((file, line, vars) => {
        debugger_show_hit(_workspace, file, line, vars)
        console_write('warn', `[Debugger] Break at ${file}:${line}`)
    })

    // 9. Land on the Start Page (recent projects / new / open) instead of auto-opening.
    _set_project(project_new(), null)   // a blank project sits behind the launcher until one is chosen
    _show_start_page()

    // 10. Key bindings for panels
    window.addEventListener('keydown', (e) => {
        // F11 to toggle output console
        if (e.key === 'F11') {
            e.preventDefault()
            console_toggle(_workspace)
        }
        // F12 is handled by Electron for DevTools
    })

    // 11. Listen for console messages from game preview iframe
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'console') {
            console_write(e.data.level, `[Game] ${e.data.message}`)
        }
    })
}

// =========================================================================
// Shell: toolbar + dock splitter
// =========================================================================

/** Builds the GMS-style icon toolbar (file · add-resource · run · settings). */
function _build_toolbar(): HTMLElement {
    const tb = document.createElement('div')
    tb.id = 'sw-toolbar'
    const btn = (label: string, title: string, fn: () => void): void => {
        const b = document.createElement('button')
        b.className = 'sw-tb-btn'
        b.innerHTML = label
        b.title = title
        b.addEventListener('click', fn)
        tb.appendChild(b)
    }
    const sep = (): void => {
        const s = document.createElement('div'); s.className = 'sw-tb-sep'; tb.appendChild(s)
    }
    btn(ICON.new_file, 'New Project (Ctrl+N)',  on_file_new)
    btn(ICON.open,     'Open Project (Ctrl+O)', on_file_open)
    btn(ICON.save,     'Save Project (Ctrl+S)', on_file_save)
    sep()
    btn(ICON.sprite,     'Add Sprite',     () => on_add_resource('sprites'))
    btn(ICON.sound,      'Add Sound',      () => on_add_resource('sounds'))
    btn(ICON.background, 'Add Background', () => on_add_resource('backgrounds'))
    btn(ICON.path,       'Add Path',       () => on_add_resource('paths'))
    btn(ICON.script,     'Add Script',     () => on_add_resource('scripts'))
    btn(ICON.font,       'Add Font',       () => on_add_resource('fonts'))
    btn(ICON.timeline,   'Add Timeline',   () => on_add_resource('timelines'))
    btn(ICON.object,     'Add Object',     () => on_add_resource('objects'))
    btn(ICON.room,       'Add Room',       () => on_add_resource('rooms'))
    sep()
    btn(ICON.play,  'Play (F5)',       on_run_play)
    btn(ICON.stop,  'Stop',            on_run_stop)
    btn(ICON.build, 'Build (Ctrl+F5)', on_run_build)
    sep()
    btn(ICON.settings, 'Game Settings (Ctrl+Shift+P)', on_edit_game_settings)
    return tb
}

/** Wires the dock splitter for resizing the docked resource-tree panel. */
function _setup_splitter(dock: HTMLElement, splitter: HTMLElement): void {
    let dragging = false, start_x = 0, start_w = 0
    splitter.addEventListener('mousedown', (e) => {
        dragging = true; start_x = e.clientX; start_w = dock.offsetWidth
        document.body.style.cursor = 'col-resize'
        e.preventDefault()
    })
    window.addEventListener('mousemove', (e) => {
        if (!dragging) return
        dock.style.width = Math.max(150, Math.min(600, start_w + (e.clientX - start_x))) + 'px'
    })
    window.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; document.body.style.cursor = '' }
    })
}

// =========================================================================
// Project actions
// =========================================================================

/** Shows the Start Page launcher (recent projects / new-from-template / open). */
function _show_start_page(): void {
    start_page_show({ load_project: (state) => _set_project(state, null) })
}

async function on_file_new(): Promise<void> {
    // The full new-project flow (name, location, template, defaults) lives on the Start Page.
    _show_start_page()
}

async function on_file_open(): Promise<void> {
    const result = await project_open()
    if (!result) return
    _set_project(result.state, result.dir)
    recent_add(result.state.name, project_get_folder_path() ?? '')
}

async function on_file_save(): Promise<void> {
    if (!_project) return
    try {
        await project_save(_project)
        _mark_saved()
        preview_reload()
        console_write('system', '[IDE] Project saved.')
    } catch (err) {
        // FSAPI browser: no dir handle yet — fall through to Save As picker
        if (!project_has_folder()) await on_file_save_as()
        else console_write('warn', '[IDE] Save failed: ' + err)
    }
}

async function on_file_save_as(): Promise<void> {
    if (!_project) return
    try {
        if ((window as any).swfs) {
            // Electron: clear stored folder so _save_electron prompts for a new one
            project_set_folder(null)
            await project_save(_project)
        } else if (typeof (window as any).showDirectoryPicker === 'function') {
            // Chromium FSAPI: pick a new folder
            let dir: FileSystemDirectoryHandle
            try { dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' }) }
            catch { return }
            project_set_dir(dir)
            await project_save(_project, dir)
        } else {
            // Firefox / Safari: download as file
            await project_save(_project)
        }
        _mark_saved()
        console_write('system', '[IDE] Project saved.')
    } catch {
        console_write('warn', '[IDE] Save cancelled.')
    }
}

// =========================================================================
// Resource actions (with undo/redo)
// =========================================================================

async function on_add_resource(cat: resource_category): Promise<void> {
    if (!_project) { await _alert('Open a project first.'); return }
    // Create with a unique default name, then let the user rename it in place (Explorer-style).
    // Check the registry AND on-disk files so a new resource never reuses an orphaned folder
    // (e.g. a deleted sprite's files left behind), which would load stale data.
    const singular = cat.slice(0, -1)
    let n = 0, name = ''
    do { n++; name = `${singular}${n}` }
    while (_project.resources[cat][name] || await _resource_on_disk(cat, name))

    undo_push({
        label: `Add ${singular} "${name}"`,
        execute:   () => { _tree.add_resource(cat, name);    _mark_unsaved() },
        unexecute: () => { _tree.remove_resource(cat, name); _mark_unsaved() },
    })
    if (cat === 'objects') {
        inject_project_types(_project)        // so editors can reference it by name
        await _scaffold_object_file(name)     // write objects/<name>.ts now, so it always exists
    }
    _tree.expand_category(cat)
    _tree.begin_rename(cat, name)
}

/**
 * Writes a minimal class file for a new object so it always has a backing file on disk —
 * otherwise an object that's created but never opened (e.g. a parent) is invisible to the build
 * ("[build] object 'X' has no objects/X.ts — skipped") and bare references to it don't resolve.
 * The class identifier is renamed along with the file when the resource is renamed.
 */
async function _scaffold_object_file(name: string): Promise<void> {
    if (!project_has_folder()) return
    const rel = `objects/${name}.ts`
    if (await project_file_exists(rel)) return
    try {
        const op = (window as any).swfs?.object_op
        const src = op
            ? await op('scaffold', name)
            : `export class ${name} extends gm_object {\n    on_create(): void {\n\n    }\n}\n`
        await project_write_file(rel, src)
    } catch (err) {
        console.warn('[IDE] Failed to scaffold object file:', err)
    }
}

async function on_delete_resource(cat: resource_category, name: string): Promise<void> {
    if (!await _confirm(`Delete "${name}"?`)) return
    undo_push({
        label: `Delete ${cat.slice(0, -1)} "${name}"`,
        execute:   () => { _tree.remove_resource(cat, name); _mark_unsaved() },
        unexecute: () => { _tree.add_resource(cat, name);    _mark_unsaved() },
    })
    // Remove the on-disk artifacts too, so the name can be reused cleanly later
    // (otherwise a new resource reusing the name would load stale files).
    try { await _delete_resource_files(cat, name) } catch (err: any) { console.warn('[IDE] Delete files failed:', err) }
}

/** Deletes a resource's on-disk artifacts (the `cat/name` folder and/or `cat/name.ts` file). */
async function _delete_resource_files(cat: resource_category, name: string): Promise<void> {
    if (!project_has_folder()) return
    for (const rel of [`${cat}/${name}`, `${cat}/${name}.ts`]) {
        if (await project_file_exists(rel)) await project_delete(rel)
    }
}

async function on_rename_resource(cat: resource_category, name: string, new_name_raw: string): Promise<void> {
    if (!_project) return
    const new_name = (new_name_raw ?? '').trim()
    if (!new_name || new_name === name) return
    if (!/^[A-Za-z_]\w*$/.test(new_name)) { await _alert('Names may only contain letters, digits, and _ (not starting with a digit).'); return }
    if (_project.resources[cat][new_name]) { await _alert(`A resource named "${new_name}" already exists.`); return }
    try {
        await _move_resource_files(cat, name, new_name, 'move')
    } catch (err: any) {
        await _alert('Rename failed: ' + (err?.message ?? err)); return
    }
    _tree.remove_resource(cat, name)
    _tree.add_resource(cat, new_name)
    if (cat === 'objects') inject_project_types(_project)   // refresh editor object declarations
    _mark_unsaved()
    console_write('system', `[IDE] Renamed ${cat.slice(0, -1)} "${name}" → "${new_name}".`)
}

async function on_duplicate_resource(cat: resource_category, name: string): Promise<void> {
    if (!_project) return
    let new_name = `${name}_copy`, n = 2
    while (_project.resources[cat][new_name]) new_name = `${name}_copy${n++}`
    try {
        await _move_resource_files(cat, name, new_name, 'copy')
    } catch (err: any) {
        await _alert('Duplicate failed: ' + (err?.message ?? err)); return
    }
    _tree.add_resource(cat, new_name)
    _mark_unsaved()
    console_write('system', `[IDE] Duplicated ${cat.slice(0, -1)} "${name}" → "${new_name}".`)
}

/**
 * Moves or copies a resource's on-disk artifact (a .ts file for scripts/objects, otherwise a folder),
 * if it exists. For code files, the embedded class/function identifier is renamed to match.
 * (References from OTHER resources — e.g. a room using a renamed object — are not auto-updated.)
 */
async function _move_resource_files(cat: resource_category, old_name: string, new_name: string, op: 'move' | 'copy'): Promise<void> {
    const file_rel   = `${cat}/${old_name}.ts`
    const folder_rel = `${cat}/${old_name}`
    let src: string | null = null
    let is_file = false
    if      (await project_file_exists(file_rel))   { src = file_rel; is_file = true }
    else if (await project_file_exists(folder_rel)) { src = folder_rel }
    if (!src) return   // no on-disk artifact yet (freshly created) — registry-only

    const dst = is_file ? `${cat}/${new_name}.ts` : `${cat}/${new_name}`
    if (op === 'move') await project_rename(src, dst)
    else               await project_copy(src, dst)

    if (is_file) {
        const code = await project_read_file(dst)
        const renamed = code
            .replace(new RegExp(`(\\bclass\\s+)${old_name}\\b`, 'g'),    `$1${new_name}`)
            .replace(new RegExp(`(\\bfunction\\s+)${old_name}\\b`, 'g'), `$1${new_name}`)
        if (renamed !== code) await project_write_file(dst, renamed)
    }
}

// =========================================================================
// Undo / Redo
// =========================================================================

function _on_undo(): void {
    if (!undo_undo()) console_write('system', '[IDE] Nothing to undo.')
}

function _on_redo(): void {
    if (!undo_redo()) console_write('system', '[IDE] Nothing to redo.')
}

// =========================================================================
// Editor dispatch
// =========================================================================

function on_open_resource(cat: resource_category, name: string): void {
    switch (cat) {
        case 'scripts':     _open_script(name);                                    break
        case 'sprites':     sprite_editor_open(_workspace, name, _project?.name ?? ''); break
        case 'objects':     _open_object(name);                                 break
        case 'rooms':       room_editor_open(_workspace, name);                  break
        case 'sounds':      sound_editor_open(_workspace, name);                 break
        case 'backgrounds': background_editor_open(_workspace, name);            break
        case 'fonts':       font_editor_open(_workspace, name);                  break
        case 'paths':       path_editor_open(_workspace, name);                  break
        case 'timelines':   timeline_editor_open(_workspace, name);              break
        default:
            console.log(`[IDE] Open ${cat}/${name} — editor not yet implemented`)
    }
}

/** True if a project-relative file exists (read succeeds). */
async function _proj_has(rel: string): Promise<boolean> {
    try { await project_read_file(rel); return true } catch { return false }
}

/** True if a resource already has on-disk artifacts (a folder for assets, a .ts file for scripts/objects). */
async function _resource_on_disk(cat: resource_category, name: string): Promise<boolean> {
    if (!project_has_folder()) return false
    return (await project_file_exists(`${cat}/${name}`)) || (await project_file_exists(`${cat}/${name}.ts`))
}

/**
 * Opens an object in the GMS-style object editor (a form over the class-per-object file
 * `objects/<name>.ts`). The editor scaffolds a class file for brand-new objects and offers
 * "Open as Code" to drop into the Monaco class editor. When the desktop host's object_op
 * bridge is unavailable (browser-only), it falls back to opening the class file directly.
 */
async function _open_object(name: string): Promise<void> {
    try {
        if ((window as any).swfs?.object_op) {
            object_editor_open(_workspace, name)
            return
        }

        // Browser-only fallback: scaffold + open the class file in Monaco.
        const class_rel = `objects/${name}.ts`
        if (!await _proj_has(class_rel)) {
            // Imports are auto-managed (auto-injected at build time), so the scaffold has none.
            await project_write_file(class_rel,
                `export class ${name} extends gm_object {\n    on_create(): void {\n\n    }\n}\n`)
        }
        await script_editor_open_smart(_workspace, class_rel, async () => {
            const dir  = project_get_dir()!
            const objs = await dir.getDirectoryHandle('objects', { create: true })
            return objs.getFileHandle(`${name}.ts`, { create: true })
        })
    } catch (err) {
        console.error('[IDE] Failed to open object:', err)
    }
}

async function _open_script(name: string): Promise<void> {
    const rel = `scripts/${name}.ts`
    try {
        await script_editor_open_smart(_workspace, rel, async () => {
            const dir = project_get_dir()!
            const scripts_dir = await dir.getDirectoryHandle('scripts', { create: true })
            return scripts_dir.getFileHandle(`${name}.ts`, { create: true })
        })
    } catch (err) {
        console.error('[IDE] Failed to open script:', err)
    }
}

// =========================================================================
// Run actions
// =========================================================================

async function on_run_play(): Promise<void> {
    if (!_project) {
        await _alert('No project open.\n\nUse File → Open Project to open a project first.')
        return
    }
    console_open(_workspace)
    // In Electron: always build first so the preview always has the latest code
    if ((window as any).swfs?.build_game) {
        await on_run_build()
    }
    preview_play(_workspace)
    console_write('system', '[IDE] Running game… (F8=Resume, F9=Debugger, F10=Profiler)')
}

function on_run_stop(): void {
    preview_stop()
    console_write('system', '[IDE] Game stopped.')
}

/**
 * Ensures the current project is saved to a folder on disk and returns its
 * absolute path (resolving in-memory path → localStorage → save dialog).
 * Returns null if no folder could be resolved (e.g. the save dialog was cancelled).
 */
async function _ensure_project_folder(): Promise<string | null> {
    let folder = project_get_folder_path() ?? project_get_last_folder()
    if (folder) {
        // Folder known — restore it if it wasn't set in memory, then save
        project_set_folder(folder)
        try { await project_save(_project!); _mark_saved() } catch { /* ignore */ }
    } else {
        // No folder at all — ask via save dialog
        try {
            await project_save(_project!)
            _mark_saved()
        } catch {
            return null
        }
        folder = project_get_folder_path()
    }
    return folder ?? null
}

async function on_run_build(): Promise<void> {
    console_open(_workspace)

    if (!_project) {
        console_write('warn', '[IDE] No project open.')
        return
    }

    const swfs = (window as any).swfs
    if (!swfs?.build_game) {
        console_write('warn', '[IDE] Build is only available in the Electron app.')
        return
    }

    const folder = await _ensure_project_folder()
    if (!folder) {
        console_write('warn', '[IDE] No project folder set.')
        return
    }

    console_write('system', '[IDE] Building game…')
    const result: { ok: boolean; error?: string } = await swfs.build_game(folder)
    if (result.ok) {
        console_write('system', '[IDE] Build complete. Press Play to run.')
        preview_reload()
    } else {
        console_write('warn', `[IDE] Build failed:\n${result.error}`)
    }
}

async function on_export_html5(): Promise<void> {
    console_open(_workspace)

    if (!_project) {
        console_write('warn', '[IDE] No project open.')
        return
    }

    const swfs = (window as any).swfs
    if (!swfs?.export_html5) {
        console_write('warn', '[IDE] Export is only available in the Electron app.')
        return
    }

    const folder = await _ensure_project_folder()
    if (!folder) {
        console_write('warn', '[IDE] No project folder set.')
        return
    }

    // Pick the export destination folder
    const out_dir: string | null = await swfs.pick_folder('save', folder)
    if (!out_dir) {
        console_write('warn', '[IDE] Export cancelled.')
        return
    }

    console_write('system', `[IDE] Exporting HTML5 build to ${out_dir}…`)
    const result: { ok: boolean; error?: string; out_dir?: string } = await swfs.export_html5(folder, out_dir)
    if (result.ok) {
        console_write('system', `[IDE] HTML5 export complete → ${result.out_dir ?? out_dir}`)
    } else {
        console_write('warn', `[IDE] Export failed:\n${result.error}`)
    }
}

async function on_export_exe(platform: string, arch: string, label: string): Promise<void> {
    console_open(_workspace)

    if (!_project) {
        console_write('warn', '[IDE] No project open.')
        return
    }

    const swfs = (window as any).swfs
    if (!swfs?.export_exe) {
        console_write('warn', '[IDE] Executable export is only available in the Electron app.')
        return
    }

    const folder = await _ensure_project_folder()
    if (!folder) {
        console_write('warn', '[IDE] No project folder set.')
        return
    }

    // Pick the export destination folder
    const out_dir: string | null = await swfs.pick_folder('save', folder)
    if (!out_dir) {
        console_write('warn', '[IDE] Export cancelled.')
        return
    }

    console_write('system', `[IDE] Packaging ${label} build to ${out_dir}…`)
    console_write('system', '[IDE] This can take a minute (first run downloads the Electron runtime).')
    const result: { ok: boolean; error?: string; out_dir?: string } = await swfs.export_exe(folder, out_dir, platform, arch)
    if (result.ok) {
        console_write('system', `[IDE] ${label} export complete → ${result.out_dir ?? out_dir}`)
    } else {
        console_write('warn', `[IDE] ${label} export failed:\n${result.error}`)
    }
}

// =========================================================================
// Edit actions
// =========================================================================

function on_edit_game_settings(): void {
    if (!_project) { _alert('Open a project first.'); return }
    const room_names = Object.keys(_project.resources.rooms)
    settings_editor_open(_workspace, _project, room_names, _mark_unsaved)
}

// =========================================================================
// Help
// =========================================================================

async function on_help_about(): Promise<void> {
    await _alert('Silkweaver Game Engine IDE\nVersion 0.2.0\nGPL-3.0')
}

// =========================================================================
// Cross-editor accessors
// =========================================================================

/**
 * Returns the names of all objects in the currently-open project (live, in-memory
 * registry — reflects unsaved additions/removals). Empty if no project is open.
 * Used by the room editor's object picker.
 */
export function get_project_object_names(): string[] {
    return get_project_resource_names('objects')
}

/**
 * Returns the names of every resource in a category from the live, in-memory project
 * registry (reflects unsaved additions/removals). Empty if no project is open or the
 * category is unknown. Used by the editors' resource dropdowns.
 * @param category - e.g. 'sprites', 'objects', 'backgrounds', 'rooms', 'sounds'
 */
export function get_project_resource_names(category: resource_category): string[] {
    const bag = _project?.resources[category]
    return bag ? Object.keys(bag) : []
}

// =========================================================================
// Helpers
// =========================================================================

function _set_project(state: project_state, _dir: FileSystemDirectoryHandle | null): void {
    _project = state
    status_set_project(state.name)
    status_set_unsaved(false)
    _tree.load(state)
    document.title = `${state.name} — Silkweaver IDE`
    undo_clear()

    // Inject project-specific object type declarations into Monaco
    inject_project_types(state)

    // (Re)watch the active project folder so external edits propagate to open windows.
    file_watch_set_folder(project_get_folder_path())
}

function _mark_unsaved(): void {
    status_set_unsaved(true)
    if (_project) document.title = `● ${_project.name} — Silkweaver IDE`
}

function _mark_saved(): void {
    status_set_unsaved(false)
    if (_project) document.title = `${_project.name} — Silkweaver IDE`
}

// =========================================================================
// Start
// =========================================================================

boot()
