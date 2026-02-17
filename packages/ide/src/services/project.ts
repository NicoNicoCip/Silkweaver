/**
 * Project management service.
 *
 * Three backends, detected at runtime:
 *   1. Electron  — window.swfs is injected by the preload script
 *   2. FSAPI     — Chromium's showDirectoryPicker (Chrome / Edge)
 *   3. Fallback  — file download + <input> upload (Firefox / Safari)
 */

// =========================================================================
// Types
// =========================================================================

export interface project_settings {
    roomSpeed:     number    // target steps per second
    windowWidth:   number
    windowHeight:  number
    startRoom:     string    // name of the first room
    displayColor:  string    // CSS hex background clear colour, e.g. '#000000'
}

export interface resource_ref {
    name: string            // unique identifier
    [key: string]: unknown  // type-specific extra fields
}

export interface project_resources {
    sprites:     Record<string, resource_ref>
    sounds:      Record<string, resource_ref>
    backgrounds: Record<string, resource_ref>
    paths:       Record<string, resource_ref>
    scripts:     Record<string, resource_ref>
    fonts:       Record<string, resource_ref>
    timelines:   Record<string, resource_ref>
    objects:     Record<string, resource_ref>
    rooms:       Record<string, resource_ref>
}

export interface project_state {
    name:          string
    version:       string
    engineVersion: string
    settings:      project_settings
    resources:     project_resources
}

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
    join:             (...parts: string[]) => string
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
        engineVersion: '0.1.0',
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
 * Writes a binary file (from a File/Blob object) relative to the project folder.
 * @param dest_path - Relative destination path
 * @param file      - Binary File object
 */
export async function project_write_binary(dest_path: string, file: File): Promise<void> {
    if (_has_electron()) {
        const fs = _el()!
        if (!_folder_path) throw new Error('No project folder open')
        const buf = await file.arrayBuffer()
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
    await writable.write(await file.arrayBuffer())
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
