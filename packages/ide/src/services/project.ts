/**
 * Project management service.
 * Handles open/save/new operations via the File System Access API.
 */

// =========================================================================
// Types
// =========================================================================

export interface project_settings {
    roomSpeed:    number    // target steps per second
    windowWidth:  number
    windowHeight: number
    startRoom:    string    // name of the first room
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
// Globals
// =========================================================================

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
 * Opens a project folder via the File System Access API.
 * Reads project.json from the selected directory.
 * @returns The parsed project state, or null if the user cancelled.
 */
export async function project_open(): Promise<{ state: project_state; dir: FileSystemDirectoryHandle } | null> {
    let dir: FileSystemDirectoryHandle
    try {
        dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    } catch {
        // User cancelled the picker
        return null
    }

    _dir_handle = dir

    let state: project_state
    try {
        const file_handle = await dir.getFileHandle('project.json')
        const file = await file_handle.getFile()
        const text = await file.text()
        state = JSON.parse(text) as project_state
    } catch {
        // No project.json found — treat as new project in this folder
        state = project_new()
        state.name = dir.name
    }

    return { state, dir }
}

/**
 * Saves the project state to project.json in the given directory.
 */
export async function project_save(state: project_state, dir?: FileSystemDirectoryHandle): Promise<void> {
    const target = dir ?? _dir_handle
    if (!target) throw new Error('No project directory open')

    const file_handle = await target.getFileHandle('project.json', { create: true })
    const writable    = await (file_handle as any).createWritable()
    await writable.write(JSON.stringify(state, null, 2))
    await writable.close()
}

/**
 * Reads a text file from the current project directory.
 * @param path - Relative path (e.g. 'objects/obj_player.json')
 */
export async function project_read_file(path: string): Promise<string> {
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: false })
    }
    const file_handle = await current.getFileHandle(parts[parts.length - 1]!)
    const file = await file_handle.getFile()
    return file.text()
}

/**
 * Writes a text file to the current project directory (creates intermediate dirs).
 * @param path - Relative path
 * @param content - Text content
 */
export async function project_write_file(path: string, content: string): Promise<void> {
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: true })
    }
    const file_handle = await current.getFileHandle(parts[parts.length - 1]!, { create: true })
    const writable = await (file_handle as any).createWritable()
    await writable.write(content)
    await writable.close()
}

/**
 * Copies a File object (from <input type="file">) into the project directory.
 * @param dest_path - Destination relative path
 * @param file - The File object to copy
 */
export async function project_write_binary(dest_path: string, file: File): Promise<void> {
    const dir = _dir_handle
    if (!dir) throw new Error('No project directory open')
    const parts = dest_path.split('/')
    let current: FileSystemDirectoryHandle = dir
    for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]!, { create: true })
    }
    const file_handle = await current.getFileHandle(parts[parts.length - 1]!, { create: true })
    const writable = await (file_handle as any).createWritable()
    await writable.write(await file.arrayBuffer())
    await writable.close()
}

/** Returns the current project directory handle (null if no project is open). */
export function project_get_dir(): FileSystemDirectoryHandle | null {
    return _dir_handle
}
