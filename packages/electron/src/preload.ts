/**
 * Electron preload script (compiled to CJS by esbuild).
 * Exposes a safe file-system bridge to the renderer as window.swfs.
 * All paths are absolute strings — the renderer resolves them from
 * the project directory it receives after folder-pick.
 */

import { contextBridge, ipcRenderer } from 'electron'
import * as path from 'node:path'

contextBridge.exposeInMainWorld('swfs', {
    /**
     * Open a folder picker dialog.
     * @param mode - 'open' or 'save'
     * @returns Absolute path of the chosen folder, or null if cancelled.
     */
    pick_folder: (mode: 'open' | 'save'): Promise<string | null> =>
        ipcRenderer.invoke('sw:pick-folder', mode),

    /**
     * Read a text file.
     * @param abs_path - Absolute path
     */
    read_file: (abs_path: string): Promise<string> =>
        ipcRenderer.invoke('sw:read-file', abs_path),

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

    /** Path join helper (avoids shipping path module to renderer) */
    join: (...parts: string[]): string => path.join(...parts),

})
