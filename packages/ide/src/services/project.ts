/**
 * Project management service.
 *
 * Three backends, detected at runtime:
 *   1. Electron  — window.swfs is injected by the preload script
 *   2. FSAPI     — Chromium's showDirectoryPicker (Chrome / Edge)
 *   3. Fallback  — file download + <input> upload (Firefox / Safari)
 */

// =========================================================================
// Types — the canonical project format lives in @silkweaver/project
// =========================================================================

import type { project_settings, project_resources, resource_ref, project_file } from '@silkweaver/project'
export type { project_settings, project_resources, resource_ref }

/** The in-memory project (== the project.json manifest). */
export type project_state = project_file

// =========================================================================
// Backend detection
// =========================================================================

/** Electron preload bridge */
const _el = () => (window as any).swfs as {
    pick_folder:      (mode: 'open' | 'save', defaultPath?: string) => Promise<string | null>
    read_file:        (abs_path: string) => Promise<string>
    read_file_base64: (abs_path: string) => Promise<string>
    write_file:       (abs_path: string, content: string) => Promise<void>
    write_binary:     (abs_path: string, buffer: ArrayBuffer) => Promise<void>
    exists:           (abs_path: string) => Promise<boolean>
    rename:           (src: string, dst: string) => Promise<void>
    copy:             (src: string, dst: string) => Promise<void>
    delete_path:      (target: string) => Promise<void>
    join:             (...parts: string[]) => string
    open_external:    (cmd: string, abs_path: string) => Promise<{ ok: boolean; error?: string }>
    create_from_template: (template_id: string, dest_folder: string, name?: string) => Promise<{ ok: boolean; error?: string }>
    vendor_engine:        (project_folder: string) => Promise<{ ok: boolean; error?: string; version?: string }>
    engine_version:       () => Promise<string>
} | undefined

const _has_electron = () => !!_el()
const _has_fsapi    = typeof (window as any).showDirectoryPicker === 'function'

// =========================================================================
// State
// =========================================================================

const LAST_FOLDER_KEY = 'sw_last_project_folder'

/** Absolute folder path — used in Electron mode */
let _folder_path: string | null = null

/** FSAPI directory handle — used in Chromium browser mode */
let _dir_handle: FileSystemDirectoryHandle | null = null

// =========================================================================
// Public API
// =========================================================================

/**
 * Returns a blank default project state.
 */
export function project_new(): project_state {
    return {
        name:          'My Game',
        version:       '1.0.0',
        engineVersion: '1.0.0',
        settings: {
            roomSpeed:    60,
            windowWidth:  640,
            windowHeight: 480,
            startRoom:    '',
            displayColor: '#000000',
        },
        resources: {
            sprites:     {},
            sounds:      {},
            backgrounds: {},
            paths:       {},
            scripts:     {},
            fonts:       {},
            timelines:   {},
            objects:     {},
            rooms:       {},
        },
    }
}

/**
 * Opens a project folder / file.
 * @returns Parsed project state, or null if cancelled.
 */
export async function project_open(): Promise<{ state: project_state; dir: FileSystemDirectoryHandle | null } | null> {
    if (_has_electron()) return _open_electron()
    if (_has_fsapi)      return _open_fsapi()
    return _open_fallback()
}

/**
 * Saves the project state.
 * @param state - Project state to save
 * @param dir   - Optional FSAPI directory override (Chromium browser only)
 */
export async function project_save(state: project_state, dir?: FileSystemDirectoryHandle): Promise<void> {
    if (_has_electron()) { await _save_electron(state); return }
    if (_has_fsapi)      { await _save_fsapi(state, dir); return }
    _save_fallback(state)
}

/** Sets the FSAPI directory (Chromium browser, Save As). */
export function project_set_dir(dir: FileSystemDirectoryHandle): void {
    _dir_handle = dir
}

/** Sets (or clears) the Electron folder path. Pass null to force a new folder pick on next save. */
export function project_set_folder(path: string | null): void {
    _folder_path = path
    if (path) localStorage.setItem(LAST_FOLDER_KEY, path)
    else      localStorage.removeItem(LAST_FOLDER_KEY)
}

/** Returns the current project folder path (Electron mode only). Null in browser mode. */
export function project_get_folder_path(): string | null {
    return _folder_path
}

/**
 * Returns the last used project folder path from localStorage (Electron mode only).
 * Null if none was recorded.
 */
export function project_get_last_folder(): string | null {
    return localStorage.getItem(LAST_FOLDER_KEY)
}

/**
 * Silently opens the last project from localStorage without showing a folder picker.
 * Electron only. Returns the loaded state or null if no last folder, folder missing,
 * or not running in Electron.
 */
export async function project_open_last(): Promise<{ state: project_state; dir: null } | null> {
    if (!_has_electron()) return null
    const folder = localStorage.getItem(LAST_FOLDER_KEY)
    if (!folder) return null
    const fs = _el()!
    const proj_path = fs.join(folder, 'project.json')
    try {
        const exists = await fs.exists(proj_path)
        if (!exists) return null
        const text = await fs.read_file(proj_path)
        const state = JSON.parse(text) as project_state
        _folder_path = folder
        return { state, dir: null }
    } catch {
        return null
    }
}

/**
 * Reads a binary file as a data URL (e.g. for displaying images).
 * @param rel_path - e.g. 'sprites/spr_player/spr_player_0.png'
 * @returns A data: URL string
 */
export async function project_read_binary_url(rel_path: string): Promise<string> {
    if (_has_electron()) {
        const fs = _el()!
        if (!_folder_path) throw new Error('No project folder open')
        const base64 = await fs.read_file_base64(fs.join(_folder_path, ...rel_path.split('/')))
        const ext = rel_path.split('.').pop()?.toLowerCase() ?? 'png'
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
                   : ext === 'gif' ? 'image/gif'
                   : 'image/png'
        return `data:${mime};base64,${base64}`
    }
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = rel_path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: false })
    }
    const fh   = await current.getFileHandle(parts[parts.length - 1]!)
    const file = await fh.getFile()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/**
 * Reads a text file relative to the project folder.
 * @param rel_path - e.g. 'scripts/player.ts'
 */
/**
 * Checks if a file exists relative to the project folder.
 * @param rel_path - e.g. 'sprites/spr_player/meta.json'
 * @returns true if file exists, false otherwise
 */
export async function project_file_exists(rel_path: string): Promise<boolean> {
    try {
        if (_has_electron()) {
            const fs = _el()!
            if (!_folder_path) return false
            return await fs.exists(fs.join(_folder_path, ...rel_path.split('/')))
        }
        const dir = _dir_handle
        if (!dir) return false
        const parts = rel_path.split('/')
        let current: FileSystemDirectoryHandle = dir
        for (let i = 0; i < parts.length - 1; i++) {
            current = await current.getDirectoryHandle(parts[i]!, { create: false })
        }
        await current.getFileHandle(parts[parts.length - 1]!)
        return true
    } catch {
        return false
    }
}

/** Moves/renames a file or folder within the project (desktop app only). */
export async function project_rename(rel_old: string, rel_new: string): Promise<void> {
    const fs = _el()
    if (!fs || !_folder_path) throw new Error('Rename requires the desktop app with a saved project folder.')
    await fs.rename(fs.join(_folder_path, ...rel_old.split('/')), fs.join(_folder_path, ...rel_new.split('/')))
}

/** Recursively copies a file or folder within the project (desktop app only). */
export async function project_copy(rel_src: string, rel_dst: string): Promise<void> {
    const fs = _el()
    if (!fs || !_folder_path) throw new Error('Duplicate requires the desktop app with a saved project folder.')
    await fs.copy(fs.join(_folder_path, ...rel_src.split('/')), fs.join(_folder_path, ...rel_dst.split('/')))
}

/** Recursively deletes a file or folder within the project (desktop app, or browser directory handle). */
export async function project_delete(rel_path: string): Promise<void> {
    const fs = _el()
    if (fs && _folder_path) {
        await fs.delete_path(fs.join(_folder_path, ...rel_path.split('/')))
        return
    }
    const dir = _dir_handle
    if (!dir) throw new Error('Delete requires an open project.')
    const parts = rel_path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) current = await current.getDirectoryHandle(parts[i]!, { create: false })
    await current.removeEntry(parts[parts.length - 1]!, { recursive: true })
}

export async function project_read_file(rel_path: string): Promise<string> {
    if (_has_electron()) {
        const fs = _el()!
        if (!_folder_path) throw new Error('No project folder open')
        return fs.read_file(fs.join(_folder_path, ...rel_path.split('/')))
    }
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = rel_path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: false })
    }
    const fh   = await current.getFileHandle(parts[parts.length - 1]!)
    const file = await fh.getFile()
    return file.text()
}

/**
 * Writes a text file relative to the project folder.
 * @param rel_path - e.g. 'objects/obj_player.json'
 * @param content  - UTF-8 string content
 */
export async function project_write_file(rel_path: string, content: string): Promise<void> {
    if (_has_electron()) {
        const fs = _el()!
        if (!_folder_path) throw new Error('No project folder open')
        return fs.write_file(fs.join(_folder_path, ...rel_path.split('/')), content)
    }
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = rel_path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: true })
    }
    const fh       = await current.getFileHandle(parts[parts.length - 1]!, { create: true })
    const writable = await (fh as any).createWritable()
    await writable.write(content)
    await writable.close()
}

/**
 * Writes a binary file relative to the project folder.
 * Accepts a Blob/File or a raw byte array; the data is normalized to an
 * ArrayBuffer (Uint8Array has no .arrayBuffer(), so it is copied explicitly).
 * @param dest_path - Relative destination path
 * @param data      - Binary contents (Blob/File or Uint8Array)
 */
export async function project_write_binary(dest_path: string, data: Blob | Uint8Array): Promise<void> {
    const buf: ArrayBuffer = data instanceof Uint8Array
        ? new Uint8Array(data).buffer   // copy into a fresh ArrayBuffer-backed array
        : await data.arrayBuffer()
    if (_has_electron()) {
        const fs = _el()!
        if (!_folder_path) throw new Error('No project folder open')
        return fs.write_binary(fs.join(_folder_path, ...dest_path.split('/')), buf)
    }
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = dest_path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: true })
    }
    const fh       = await current.getFileHandle(parts[parts.length - 1]!, { create: true })
    const writable = await (fh as any).createWritable()
    await writable.write(buf)
    await writable.close()
}

/**
 * Returns the current project directory handle (FSAPI mode only).
 * Returns null in Electron mode or when no project is open.
 */
export function project_get_dir(): FileSystemDirectoryHandle | null {
    return _dir_handle
}

/**
 * Returns true if a project folder is currently open (any backend).
 */
export function project_has_folder(): boolean {
    return !!_folder_path || !!_dir_handle
}

/**
 * Opens the desktop folder picker (Electron only; the deprecated browser backend has no
 * persistent paths). Returns the chosen absolute folder path, or null if cancelled/unsupported.
 * @param mode - 'open' to choose an existing project, 'save' to choose where a new one lives
 */
export async function project_pick_folder(mode: 'open' | 'save', defaultPath?: string): Promise<string | null> {
    const fs = _el()
    if (!fs) return null
    return fs.pick_folder(mode, defaultPath)
}

/** Joins path segments with the host's separator (Electron); falls back to '/' in the browser. */
export function project_join(...parts: string[]): string {
    const fs = _el()
    return fs ? fs.join(...parts) : parts.join('/')
}

/** True when running in the Electron desktop host (path-based projects + recent list). */
export function project_is_desktop(): boolean {
    return !!_el()
}

/**
 * Opens a project from a specific folder path (Electron only) — used by the Start Page's
 * recent list. Sets it as the active folder and returns its state, or null if missing.
 */
export async function project_open_path(folder: string): Promise<project_state | null> {
    const fs = _el()
    if (!fs) return null
    try {
        const proj_path = fs.join(folder, 'project.json')
        if (!(await fs.exists(proj_path))) return null
        const state = JSON.parse(await fs.read_file(proj_path)) as project_state
        _folder_path = folder
        localStorage.setItem(LAST_FOLDER_KEY, folder)
        return state
    } catch {
        return null
    }
}

/**
 * Materializes a bundled starter template into a new project folder (Electron only). Recursively
 * copies the template's project folder and writes `name` into its project.json. Open it afterwards
 * with `project_open_path(dest_folder)`.
 * @param template_id - 'empty' | 'platformer' | 'topdown'
 * @param dest_folder - Absolute path of the new project folder
 * @param name        - Display name for the project
 */
export async function project_create_from_template(template_id: string, dest_folder: string, name: string): Promise<{ ok: boolean; error?: string }> {
    const fs = _el()
    if (!fs) return { ok: false, error: 'Creating from a template requires the desktop app.' }
    return fs.create_from_template(template_id, dest_folder, name)
}

/**
 * Vendors (pins) the current engine into a project folder, freezing its `engineVersion` (Electron
 * only). Use for projects created before per-project vendoring, or to upgrade a project's engine.
 * @param project_folder - Absolute path of the project
 * @returns The vendored engine version, or null if unavailable / it failed.
 */
export async function project_vendor_engine(project_folder: string): Promise<string | null> {
    const fs = _el()
    if (!fs) return null
    const res = await fs.vendor_engine(project_folder)
    return res.ok ? (res.version ?? null) : null
}

/**
 * Opens a project-relative file in an external editor (Electron only). `editor_cmd` is a full path
 * to the editor executable, or '' to use the OS default app for the file type. The file-watcher (or
 * the caller's focus reload) brings external edits back in.
 * @param rel_path    - Project-relative file path (e.g. 'sprites/spr_x/0.png')
 * @param editor_cmd  - Editor executable path, or '' for the OS default
 */
export async function project_open_external(rel_path: string, editor_cmd: string): Promise<{ ok: boolean; error?: string }> {
    const fs = _el()
    if (!fs) return { ok: false, error: 'Opening an external editor requires the desktop app.' }
    if (!_folder_path) return { ok: false, error: 'Save the project to a folder first.' }
    return fs.open_external(editor_cmd, fs.join(_folder_path, rel_path))
}

/** The engine version the toolchain ships (what "Update engine" pins to), or null in the browser. */
export async function project_toolchain_engine_version(): Promise<string | null> {
    const fs = _el()
    if (!fs) return null
    try { return await fs.engine_version() } catch { return null }
}

/**
 * Compares two `x.y.z` version strings. Returns <0 if a<b, 0 if equal, >0 if a>b. Missing parts
 * count as 0. Drives the engine "update available" status and is the basis for feature-gating
 * ("this needs engine ≥ x.y").
 */
export function version_compare(a: string, b: string): number {
    const pa = (a || '0').split('.').map(n => parseInt(n, 10) || 0)
    const pb = (b || '0').split('.').map(n => parseInt(n, 10) || 0)
    for (let i = 0; i < 3; i++) { const d = (pa[i] ?? 0) - (pb[i] ?? 0); if (d !== 0) return Math.sign(d) }
    return 0
}

/** True when a project's pinned engine (`engineVersion`) is at least `required` — for feature gates. */
export function engine_at_least(project_engine_version: string, required: string): boolean {
    return version_compare(project_engine_version, required) >= 0
}

/**
 * Renames a project's display name in its project.json on disk, without opening it (Electron only).
 * The folder is left as-is. Returns true on success.
 */
export async function project_rename_at(folder: string, new_name: string): Promise<boolean> {
    const fs = _el()
    if (!fs) return false
    try {
        const p = fs.join(folder, 'project.json')
        const state = JSON.parse(await fs.read_file(p)) as project_state
        state.name = new_name
        await fs.write_file(p, JSON.stringify(state, null, 2))
        return true
    } catch {
        return false
    }
}

// =========================================================================
// Internal — Electron
// =========================================================================

async function _open_electron(): Promise<{ state: project_state; dir: null } | null> {
    const fs = _el()!
    const last = localStorage.getItem(LAST_FOLDER_KEY) ?? undefined
    const folder = await fs.pick_folder('open', last)
    if (!folder) return null
    _folder_path = folder
    localStorage.setItem(LAST_FOLDER_KEY, folder)

    const proj_path = fs.join(folder, 'project.json')
    let state: project_state
    try {
        const text = await fs.read_file(proj_path)
        state = JSON.parse(text) as project_state
    } catch {
        state = project_new()
        // Use the folder name as default project name
        state.name = folder.split(/[\\/]/).pop() ?? 'My Game'
    }
    return { state, dir: null }
}

async function _save_electron(state: project_state): Promise<void> {
    const fs = _el()!
    if (!_folder_path) {
        // No folder yet — ask the user to pick one
        const last = localStorage.getItem(LAST_FOLDER_KEY) ?? undefined
        const folder = await fs.pick_folder('save', last)
        if (!folder) throw new Error('No project folder selected')
        _folder_path = folder
        localStorage.setItem(LAST_FOLDER_KEY, folder)
    }
    await fs.write_file(fs.join(_folder_path, 'project.json'), JSON.stringify(state, null, 2))
}

// =========================================================================
// Internal — Chromium FSAPI
// =========================================================================

async function _open_fsapi(): Promise<{ state: project_state; dir: FileSystemDirectoryHandle } | null> {
    let dir: FileSystemDirectoryHandle
    try {
        dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    } catch {
        return null
    }
    _dir_handle = dir
    let state: project_state
    try {
        const fh = await dir.getFileHandle('project.json')
        const f  = await fh.getFile()
        state = JSON.parse(await f.text()) as project_state
    } catch {
        state = project_new()
        state.name = dir.name
    }
    return { state, dir }
}

async function _save_fsapi(state: project_state, dir?: FileSystemDirectoryHandle): Promise<void> {
    const target = dir ?? _dir_handle
    if (!target) throw new Error('No project directory open')
    if (dir) _dir_handle = dir
    const fh       = await target.getFileHandle('project.json', { create: true })
    const writable = await (fh as any).createWritable()
    await writable.write(JSON.stringify(state, null, 2))
    await writable.close()
}

// =========================================================================
// Internal — Firefox / Safari fallback (download + file input)
// =========================================================================

async function _open_fallback(): Promise<{ state: project_state; dir: null } | null> {
    return new Promise((resolve) => {
        const input    = document.createElement('input')
        input.type     = 'file'
        input.accept   = '.json,application/json'
        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) { resolve(null); return }
            try {
                const state = JSON.parse(await file.text()) as project_state
                resolve({ state, dir: null })
            } catch {
                alert('Failed to parse project.json')
                resolve(null)
            }
        }
        input.oncancel = () => resolve(null)
        input.click()
    })
}

function _save_fallback(state: project_state): void {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'project.json'
    a.click()
    URL.revokeObjectURL(url)
}
