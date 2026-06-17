/**
 * Electron main process.
 * Creates the IDE BrowserWindow and handles IPC file system requests
 * from the renderer via the preload bridge.
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as fs      from 'node:fs'
import * as path    from 'node:path'
import * as build   from '@silkweaver/build'

// =========================================================================
// Window
// =========================================================================

function create_window(): void {
    const win = new BrowserWindow({
        width:  1280,
        height: 800,
        minWidth:  800,
        minHeight: 600,
        title: 'Silkweaver IDE',
        backgroundColor: '#2b2b2b',
        webPreferences: {
            preload:          path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration:  false,
            sandbox:          false,
        },
    })

    win.setMenuBarVisibility(false)
    win.loadFile(path.join(__dirname, '../../exports/ide/index.html'))

    // F12 to toggle DevTools
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'F12') {
            if (win.webContents.isDevToolsOpened()) {
                win.webContents.closeDevTools()
            } else {
                win.webContents.openDevTools({ mode: 'detach' })
            }
        }
    })
}

app.whenReady().then(() => {
    create_window()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) create_window()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// =========================================================================
// IPC — File System Bridge
// =========================================================================

/** Pick a project folder (open or save-as) */
ipcMain.handle('sw:pick-folder', async (_e, mode: 'open' | 'save', defaultPath?: string) => {
    const result = await dialog.showOpenDialog({
        title:       mode === 'open' ? 'Open Project Folder' : 'Save Project To Folder',
        properties:  ['openDirectory', 'createDirectory'],
        ...(defaultPath && { defaultPath }),
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]!
})

/** Read a text file */
ipcMain.handle('sw:read-file', async (_e, abs_path: string) => {
    return fs.promises.readFile(abs_path, 'utf8')
})

/** Read a binary file and return it as a Base64 string */
ipcMain.handle('sw:read-file-base64', async (_e, abs_path: string) => {
    const buf = await fs.promises.readFile(abs_path)
    return buf.toString('base64')
})

/** Write a text file (creates intermediate directories) */
ipcMain.handle('sw:write-file', async (_e, abs_path: string, content: string) => {
    await fs.promises.mkdir(path.dirname(abs_path), { recursive: true })
    await fs.promises.writeFile(abs_path, content, 'utf8')
})

/** Write a binary file from a Base64 string */
ipcMain.handle('sw:write-binary', async (_e, abs_path: string, base64: string) => {
    await fs.promises.mkdir(path.dirname(abs_path), { recursive: true })
    await fs.promises.writeFile(abs_path, Buffer.from(base64, 'base64'))
})

/** Check if a path exists */
ipcMain.handle('sw:exists', async (_e, abs_path: string) => {
    try { await fs.promises.access(abs_path); return true } catch { return false }
})

// =========================================================================
// IPC — Game Build / Export
// =========================================================================

/** Builds the game into exports/game.js for the in-IDE preview. */
ipcMain.handle('sw:build-game', async (_e, project_folder: string) => {
    try {
        // The IDE preview iframe loads ../game.js → exports/game.js.
        await build.build_preview(project_folder, path.join(__dirname, '../game.js'))
        return { ok: true }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
})

/** Exports a portable, self-contained HTML5 build into out_dir. */
ipcMain.handle('sw:export-html5', async (_e, project_folder: string, out_dir: string) => {
    try {
        const out = await build.export_html5(project_folder, out_dir)
        return { ok: true, out_dir: out }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
})

/** Exports a standalone desktop executable into out_dir. */
ipcMain.handle('sw:export-exe', async (_e, project_folder: string, out_dir: string, platform?: string, arch?: string) => {
    try {
        const out = await build.export_executable(project_folder, out_dir, platform, arch)
        return { ok: true, out_dir: out }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
})

// =========================================================================
// IPC — Object class-file format (parse/patch for the object editor)
// =========================================================================

/** Whitelisted object_format operations callable from the renderer. */
const OBJECT_OPS = {
    parse_object:  build.parse_object,
    set_static:    build.set_static,
    remove_static: build.remove_static,
    set_field:     build.set_field,
    remove_field:  build.remove_field,
    add_method:    build.add_method,
    remove_method: build.remove_method,
    scaffold:      build.scaffold_object,
} as const

/** Generic dispatcher for class-file parse/patch ops (returns a model or patched source). */
ipcMain.handle('sw:object-op', (_e, action: keyof typeof OBJECT_OPS, ...args: any[]) => {
    const fn = OBJECT_OPS[action] as ((...a: any[]) => unknown) | undefined
    if (!fn) throw new Error(`Unknown object op: ${action}`)
    return fn(...args)
})
