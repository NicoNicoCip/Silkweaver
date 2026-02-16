/**
 * Silkweaver IDE — entry point.
 * Bootstraps the workspace, menubar, status bar, and resource tree.
 */

import { theme_inject }                                           from './theme.js'
import { menubar_default }                                        from './menubar.js'
import { status_bar_create, status_set_project, status_set_unsaved } from './status_bar.js'
import { ResourceTree }                                           from './resource_tree.js'
import type { open_resource_event, resource_category }            from './resource_tree.js'
import { project_new, project_open, project_save, project_get_dir } from './services/project.js'
import type { project_state }                                        from './services/project.js'
import { script_editor_open }                                        from './editors/script_editor.js'

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
        if (e.key === 'F5')             { e.preventDefault(); on_run_play() }
    })

    // 8. Load a blank project initially
    _set_project(project_new(), null)
}

// =========================================================================
// Project actions
// =========================================================================

async function on_file_new(): Promise<void> {
    const name = prompt('Project name:', 'My Game')
    if (name === null) return
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
    } catch {
        await on_file_save_as()
    }
}

async function on_file_save_as(): Promise<void> {
    if (!_project) return
    const result = await project_open()
    if (!result) return
    await project_save(_project, result.dir)
    _mark_saved()
}

// =========================================================================
// Resource actions
// =========================================================================

function on_add_resource(cat: resource_category): void {
    if (!_project) { alert('Open a project first.'); return }
    const name = prompt(`New ${cat.slice(0, -1)} name:`)
    if (!name) return
    if (_project.resources[cat][name]) { alert('A resource with that name already exists.'); return }
    _project.resources[cat][name] = { name }
    _tree.add_resource(cat, name)
    _mark_unsaved()
}

function on_delete_resource(cat: resource_category, name: string): void {
    if (!confirm(`Delete "${name}"?`)) return
    // remove_resource mutates the shared project state reference
    _tree.remove_resource(cat, name)
    _mark_unsaved()
}

// =========================================================================
// Editor dispatch
// =========================================================================

function on_open_resource(cat: resource_category, name: string): void {
    if (cat === 'scripts') {
        _open_script(name)
        return
    }
    // Phase 18+ handles other categories
    console.log(`[IDE] Open ${cat}/${name} — editor not yet implemented`)
}

async function _open_script(name: string): Promise<void> {
    const dir = project_get_dir()
    if (!dir) { alert('Open a project folder first.'); return }
    try {
        const scripts_dir = await dir.getDirectoryHandle('scripts', { create: true })
        const file_handle = await scripts_dir.getFileHandle(`${name}.ts`, { create: true })
        await script_editor_open(_workspace, file_handle, `scripts/${name}.ts`)
    } catch (err) {
        console.error('[IDE] Failed to open script:', err)
    }
}

// =========================================================================
// Run actions (Phase 20+)
// =========================================================================

function on_run_play():  void { console.log('[IDE] Run: Play') }
function on_run_stop():  void { console.log('[IDE] Run: Stop') }
function on_run_build(): void { console.log('[IDE] Run: Build') }

// =========================================================================
// Help
// =========================================================================

function on_help_about(): void {
    alert('Silkweaver Game Engine IDE\nVersion 0.1.0\nGPL-3.0')
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