/**
 * Electron preload script (compiled to CJS by esbuild).
 * Exposes a safe file-system bridge to the renderer as window.swfs.
 * All paths are absolute strings — the renderer resolves them from
 * the project directory it receives after folder-pick.
 */

import { contextBridge, ipcRenderer, webFrame } from 'electron'

contextBridge.exposeInMainWorld('swfs', {
    /**
     * Open a folder picker dialog.
     * @param mode - 'open' or 'save'
     * @returns Absolute path of the chosen folder, or null if cancelled.
     */
    pick_folder: (mode: 'open' | 'save', defaultPath?: string): Promise<string | null> =>
        ipcRenderer.invoke('sw:pick-folder', mode, defaultPath),

    /**
     * Read a text file.
     * @param abs_path - Absolute path
     */
    read_file: (abs_path: string): Promise<string> =>
        ipcRenderer.invoke('sw:read-file', abs_path),

    /**
     * Read a binary file and return it as a Base64 string.
     * @param abs_path - Absolute path
     */
    read_file_base64: (abs_path: string): Promise<string> =>
        ipcRenderer.invoke('sw:read-file-base64', abs_path),

    /**
     * Write a text file (creates parent dirs automatically).
     * @param abs_path - Absolute path
     * @param content  - UTF-8 string content
     */
    write_file: (abs_path: string, content: string): Promise<void> =>
        ipcRenderer.invoke('sw:write-file', abs_path, content),

    /**
     * Write a binary file from an ArrayBuffer.
     * @param abs_path - Absolute path
     * @param buffer   - Binary data
     */
    write_binary: async (abs_path: string, buffer: ArrayBuffer): Promise<void> => {
        const base64 = Buffer.from(buffer).toString('base64')
        return ipcRenderer.invoke('sw:write-binary', abs_path, base64)
    },

    /**
     * Check if a path exists.
     */
    exists: (abs_path: string): Promise<boolean> =>
        ipcRenderer.invoke('sw:exists', abs_path),

    /** Rename/move a file or folder. */
    rename: (src: string, dst: string): Promise<void> =>
        ipcRenderer.invoke('sw:rename', src, dst),

    /** Recursively copy a file or folder. */
    copy: (src: string, dst: string): Promise<void> =>
        ipcRenderer.invoke('sw:copy', src, dst),

    /** Recursively delete a file or folder. */
    delete_path: (target: string): Promise<void> =>
        ipcRenderer.invoke('sw:delete', target),

    /** Path join helper (pure JS, no node:path needed in sandbox) */
    join: (...parts: string[]): string => {
        const sep = parts[0]?.includes('\\') ? '\\' : '/'
        return parts.join(sep).replace(/[/\\]+/g, sep)
    },

    /**
     * Build the game from the given project folder path into exports/game.js.
     * @param project_folder - Absolute path to the project folder
     * @returns { ok: true } or { ok: false, error: string }
     */
    build_game: (project_folder: string): Promise<{ ok: boolean; error?: string }> =>
        ipcRenderer.invoke('sw:build-game', project_folder),

    /**
     * Export a portable, self-contained HTML5 build of the game into out_dir
     * (game.js + index.html + assets/).
     * @param project_folder - Absolute path to the project folder
     * @param out_dir        - Absolute path to the export destination folder
     * @returns { ok: true, out_dir } or { ok: false, error: string }
     */
    export_html5: (project_folder: string, out_dir: string): Promise<{ ok: boolean; error?: string; out_dir?: string }> =>
        ipcRenderer.invoke('sw:export-html5', project_folder, out_dir),

    /**
     * Export a standalone desktop executable of the game into out_dir.
     * @param project_folder - Absolute path to the project folder
     * @param out_dir        - Absolute path to the export destination folder
     * @param platform       - 'win32' | 'darwin' | 'linux' (default 'win32')
     * @param arch           - 'x64' | 'arm64' (default 'x64')
     */
    export_exe: (project_folder: string, out_dir: string, platform?: string, arch?: string): Promise<{ ok: boolean; error?: string; out_dir?: string }> =>
        ipcRenderer.invoke('sw:export-exe', project_folder, out_dir, platform, arch),

    /** Lists the bundled starter templates (id / label / description / display color). */
    list_templates: (): Promise<{ id: string; label: string; description: string; display_color: string }[]> =>
        ipcRenderer.invoke('sw:list-templates'),

    /**
     * Materializes a starter template into a new project folder (recursive copy + name patch).
     * @param template_id - 'empty' | 'platformer' | 'topdown'
     * @param dest_folder - Absolute path of the new project folder
     * @param name        - Display name to write into project.json
     */
    create_from_template: (template_id: string, dest_folder: string, name?: string): Promise<{ ok: boolean; error?: string }> =>
        ipcRenderer.invoke('sw:create-from-template', template_id, dest_folder, name),

    /** The engine version this toolchain ships (what "Update engine" pins a project to). */
    engine_version: (): Promise<string> => ipcRenderer.invoke('sw:engine-version'),

    /** Vendors (pins) the current engine into a project folder; returns the vendored version. */
    vendor_engine: (project_folder: string): Promise<{ ok: boolean; error?: string; version?: string }> =>
        ipcRenderer.invoke('sw:vendor-engine', project_folder),

    /**
     * Parse/patch a class-per-object file. `action` is one of: parse_object,
     * set_static, remove_static, set_field, remove_field, add_method, remove_method, scaffold.
     * Returns the object model (parse_object) or patched source string (others).
     */
    object_op: (action: string, ...args: any[]): Promise<any> =>
        ipcRenderer.invoke('sw:object-op', action, ...args),

    /** Sets the renderer zoom factor (1 = 100%) — backs the IDE's interface-scale control. */
    set_zoom_factor: (factor: number): void => webFrame.setZoomFactor(factor),

    /** Returns the current renderer zoom factor. */
    get_zoom_factor: (): number => webFrame.getZoomFactor(),

    /** Starts watching `folder` for external file changes (pass null to stop). */
    watch_folder: (folder: string | null): Promise<void> => ipcRenderer.invoke('sw:watch-folder', folder),

    /** Registers a callback fired with the project-relative path of any externally-changed file. */
    on_file_changed: (cb: (rel_path: string) => void): void => {
        ipcRenderer.on('sw:file-changed', (_e, rel_path: string) => cb(rel_path))
    },

    // ── Auto-update (electron-updater; packaged builds only) ──────────────
    /** Asks the main process to check GitHub Releases for a newer version (background). */
    check_for_updates: (): Promise<void> => ipcRenderer.invoke('sw:update-check'),
    /** Starts downloading the available update (progress arrives via on_update_progress). */
    download_update:   (): Promise<void> => ipcRenderer.invoke('sw:update-download'),
    /** Quits and installs a downloaded update now. */
    install_update:    (): Promise<void> => ipcRenderer.invoke('sw:update-install'),
    /** Fires with the new version string when an update is available. */
    on_update_available:  (cb: (version: string) => void): void => { ipcRenderer.on('sw:update-available',  (_e, v: string) => cb(v)) },
    /** Fires with download percent (0–100) while an update downloads. */
    on_update_progress:   (cb: (percent: number) => void): void => { ipcRenderer.on('sw:update-progress',   (_e, p: number) => cb(p)) },
    /** Fires with the version string once an update has finished downloading. */
    on_update_downloaded: (cb: (version: string) => void): void => { ipcRenderer.on('sw:update-downloaded', (_e, v: string) => cb(v)) },
})
