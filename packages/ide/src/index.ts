/**
 * Silkweaver IDE — entry point.
 * Bootstraps the workspace, menubar, status bar, and resource tree.
 */

import { theme_inject }                                              from './theme.js'
import { menubar_default }                                           from './menubar.js'
import { status_bar_create, status_set_project, status_set_unsaved } from './status_bar.js'
import { ResourceTree }                                              from './resource_tree.js'
import type { open_resource_event, resource_category }               from './resource_tree.js'
import { project_new, project_open, project_open_last, project_save, project_set_dir, project_set_folder, project_get_dir, project_has_folder, project_get_folder_path, project_get_last_folder }  from './services/project.js'
import type { project_state }                                         from './services/project.js'
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
import { preview_open, preview_play, preview_stop, preview_reload }  from './panels/game_preview.js'
import { console_open, console_write, console_toggle }               from './panels/console_panel.js'
import { debugger_open, debugger_show_hit }                          from './panels/debugger_panel.js'
import { profiler_open }                                             from './panels/profiler_panel.js'
import { bp_resume, bp_on_hit }                                      from './panels/breakpoint_manager.js'
import { show_alert, show_prompt, show_confirm }                     from './services/dialogs.js'

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
    // 1. Inject global styles
    theme_inject()

    // 2. Create workspace root
    _workspace = document.createElement('div')
    _workspace.id = 'sw-workspace'
    document.body.appendChild(_workspace)

    // 3. Create status bar
    document.body.appendChild(status_bar_create())

    // 4. Create menubar
    const menubar = menubar_default({
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
        view_resources:        () => _tree.show(),
        view_console:          () => console_open(_workspace),
        view_debugger:         () => debugger_open(_workspace),
        view_profiler:         () => profiler_open(_workspace),
        view_preview:          () => preview_open(_workspace),
        run_play:              on_run_play,
        run_stop:              on_run_stop,
        run_build:             on_run_build,
        help_about:            on_help_about,
    })
    document.body.appendChild(menubar)

    // 5. Resource tree
    _tree = new ResourceTree()
    _tree.on_add_resource    = on_add_resource
    _tree.on_delete_resource = on_delete_resource
    _tree.mount(_workspace)

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
        // F11 now toggles output console (see below)
        if (e.ctrlKey && e.key === 'r')   { e.preventDefault(); _tree.show() }
        if (e.ctrlKey && e.shiftKey && e.key === 'P') { e.preventDefault(); on_edit_game_settings() }
    })

    // 8. Register global breakpoint-hit handler
    bp_on_hit((file, line, vars) => {
        debugger_show_hit(_workspace, file, line, vars)
        console_write('warn', `[Debugger] Break at ${file}:${line}`)
    })

    // 9. Try to reopen the last project; fall back to a blank one
    project_open_last().then(result => {
        if (result) {
            _set_project(result.state, null)
            console_open(_workspace, false)  // Start expanded
            console_write('system', `[IDE] Reopened: ${result.state.name}`)
        } else {
            _set_project(project_new(), null)
        }
    })

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
// Project actions
// =========================================================================

async function on_file_new(): Promise<void> {
    const name = await _prompt('Project name:', 'My Game') ?? 'My Game'
    const state = project_new()
    state.name = name
    _set_project(state, null)
}

async function on_file_open(): Promise<void> {
    const result = await project_open()
    if (!result) return
    _set_project(result.state, result.dir)
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
    const name = await _prompt(`New ${cat.slice(0, -1)} name:`)
    if (!name) return
    if (_project.resources[cat][name]) { await _alert('A resource with that name already exists.'); return }

    undo_push({
        label: `Add ${cat.slice(0, -1)} "${name}"`,
        execute:   () => { _tree.add_resource(cat, name);    _mark_unsaved() },
        unexecute: () => { _tree.remove_resource(cat, name); _mark_unsaved() },
    })
}

async function on_delete_resource(cat: resource_category, name: string): Promise<void> {
    if (!await _confirm(`Delete "${name}"?`)) return
    undo_push({
        label: `Delete ${cat.slice(0, -1)} "${name}"`,
        execute:   () => { _tree.remove_resource(cat, name); _mark_unsaved() },
        unexecute: () => { _tree.add_resource(cat, name);    _mark_unsaved() },
    })
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
        case 'objects':     object_editor_open(_workspace, name);                break
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

    // Resolve folder: in-memory path → localStorage fallback → prompt
    let folder = project_get_folder_path() ?? project_get_last_folder()
    if (folder) {
        // Folder known — restore it if it wasn't set in memory, then save
        project_set_folder(folder)
        try { await project_save(_project); _mark_saved() } catch { /* ignore */ }
    } else {
        // No folder at all — ask via save dialog
        try {
            await project_save(_project)
            _mark_saved()
        } catch {
            console_write('warn', '[IDE] No project folder — save cancelled.')
            return
        }
        folder = project_get_folder_path()
    }

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
