/**
 * Electron main process.
 * Creates the IDE BrowserWindow and handles IPC file system requests
 * from the renderer via the preload bridge.
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { spawn }    from 'node:child_process'
import * as fs      from 'node:fs'
import * as path    from 'node:path'
import * as build   from '@silkweaver/build'

// =========================================================================
// Project file watcher (parallel-edit propagation)
// =========================================================================

let _win: BrowserWindow | null = null
let _allow_close = false                                   // set true once the renderer OKs the quit
let _watcher: fs.FSWatcher | null = null
const _last_written = new Map<string, string>()           // abs path → content the IDE last wrote
const _watch_debounce = new Map<string, NodeJS.Timeout>()  // per-path debounce (fs.watch double-fires)

/** Records what the IDE wrote so the watcher can tell our own saves from external edits. */
function _note_write(abs_path: string, content: string): void {
    _last_written.set(abs_path, content)
}

/** Starts (or restarts) a recursive watch of the project folder. */
function _start_watch(folder: string): void {
    _stop_watch()
    if (!folder) return
    try {
        _watcher = fs.watch(folder, { recursive: true }, (_event, filename) => {
            if (!filename) return
            const fname = filename.toString()
            if (!/\.(ts|json|png|jpe?g|gif|webp)$/i.test(fname)) return   // code/manifest + image assets
            const abs = path.join(folder, fname)
            const prev = _watch_debounce.get(abs); if (prev) clearTimeout(prev)
            _watch_debounce.set(abs, setTimeout(() => void _emit_change(folder, abs), 120))
        })
    } catch { /* recursive watch unsupported on this OS (e.g. Linux) — feature degrades to off */ }
}

function _stop_watch(): void {
    if (_watcher) { try { _watcher.close() } catch { /* ignore */ } _watcher = null }
    for (const t of _watch_debounce.values()) clearTimeout(t)
    _watch_debounce.clear()
}

/** Reads the changed file, ignores our own writes, and notifies the renderer of external edits. */
async function _emit_change(folder: string, abs: string): Promise<void> {
    let content: string | null
    try { content = await fs.promises.readFile(abs, 'utf8') } catch { content = null }   // deleted/unreadable
    if (content !== null && content === _last_written.get(abs)) return   // our own save — ignore
    if (content !== null) _last_written.set(abs, content)                // so repeat events don't re-fire
    const rel = path.relative(folder, abs).replace(/\\/g, '/')
    _win?.webContents.send('sw:file-changed', rel)
}

/** Renderer asks to watch a project folder (or null to stop). */
ipcMain.handle('sw:watch-folder', (_e, folder: string | null) => { folder ? _start_watch(folder) : _stop_watch() })

/** Renderer has finished its unsaved-changes prompt and is OK to quit. */
ipcMain.on('sw:confirm-quit', () => { _allow_close = true; _win?.close() })

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

    _win = win
    // Intercept the window close so the renderer can warn about unsaved changes first.
    win.on('close', (e) => {
        if (_allow_close) return
        e.preventDefault()
        win.webContents.send('sw:before-quit')
    })
    win.on('closed', () => { if (_win === win) _win = null })
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
    _init_updater()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) create_window()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// =========================================================================
// Auto-update (electron-updater → GitHub Releases)
// =========================================================================
//
// Non-intrusive by design: we only *check* in the background and tell the renderer when an update
// exists. Downloading and installing happen only when the user opts in (the renderer's update chip).
// Only active in a packaged build — autoUpdater is a no-op / errors in `npm run electron` dev.

function _init_updater(): void {
    if (!app.isPackaged) return
    autoUpdater.autoDownload         = false   // wait for the user to choose to download
    autoUpdater.autoInstallOnAppQuit = true    // once downloaded, apply on the next quit if not sooner

    autoUpdater.on('update-available',     info => _win?.webContents.send('sw:update-available',  info.version))
    autoUpdater.on('update-not-available', ()   => _win?.webContents.send('sw:update-none'))
    autoUpdater.on('download-progress',    p    => _win?.webContents.send('sw:update-progress',   Math.round(p.percent)))
    autoUpdater.on('update-downloaded',    info => _win?.webContents.send('sw:update-downloaded',  info.version))
    autoUpdater.on('error',                err  => { console.warn('[updater]', err?.message ?? err); _win?.webContents.send('sw:update-error', String(err?.message ?? err)) })

    // No on-launch check — updates are checked only when the user asks (Help → About → Check for updates).
}

/** Manual update check. Returns whether updates are supported (only in a packaged build). */
ipcMain.handle('sw:update-check', () => {
    if (!app.isPackaged) return false
    autoUpdater.checkForUpdates().catch(() => {})
    return true
})
ipcMain.handle('sw:update-download', () => { autoUpdater.downloadUpdate().catch(e => console.warn('[updater]', e?.message ?? e)) })
ipcMain.handle('sw:update-install',  () => { autoUpdater.quitAndInstall() })

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

/** Pick a single existing file (optionally filtered). Returns its absolute path, or null if cancelled. */
ipcMain.handle('sw:pick-file', async (_e, opts?: { title?: string; defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog({
        title:      opts?.title ?? 'Open File',
        properties: ['openFile'],
        ...(opts?.defaultPath && { defaultPath: opts.defaultPath }),
        ...(opts?.filters     && { filters: opts.filters }),
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

/** Lists the file names directly inside a directory (non-recursive). Returns [] if it doesn't exist. */
ipcMain.handle('sw:list-dir', async (_e, abs_path: string) => {
    try {
        const entries = await fs.promises.readdir(abs_path, { withFileTypes: true })
        return entries.filter(d => d.isFile()).map(d => d.name)
    } catch { return [] }
})

/** Write a text file (creates intermediate directories) */
ipcMain.handle('sw:write-file', async (_e, abs_path: string, content: string) => {
    _note_write(abs_path, content)   // mark as our own so the watcher ignores the resulting event
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

/** Rename/move a file or folder (atomic). */
ipcMain.handle('sw:rename', async (_e, src: string, dst: string) => {
    await fs.promises.mkdir(path.dirname(dst), { recursive: true })
    await fs.promises.rename(src, dst)
})

/** Recursively copy a file or folder. */
ipcMain.handle('sw:copy', async (_e, src: string, dst: string) => {
    await fs.promises.mkdir(path.dirname(dst), { recursive: true })
    await fs.promises.cp(src, dst, { recursive: true })
})

/** Recursively delete a file or folder (no error if it doesn't exist). */
ipcMain.handle('sw:delete', async (_e, target: string) => {
    await fs.promises.rm(target, { recursive: true, force: true })
})

/**
 * Opens a file in an external editor: `cmd` (a full path to the editor executable) with the file as
 * its argument, or — if `cmd` is empty — the OS default app for that file type. Detached so it
 * doesn't tie to the IDE's lifetime.
 */
ipcMain.handle('sw:open-external', async (_e, cmd: string, abs_path: string) => {
    try {
        // Tolerate a path pasted via Explorer's "Copy as path" (which wraps it in double quotes).
        const exe = (cmd ?? '').trim().replace(/^"([\s\S]*)"$/, '$1')
        if (exe) {
            const child = spawn(exe, [abs_path], { detached: true, stdio: 'ignore' })
            child.on('error', err => console.warn('[open-external]', err?.message ?? err))
            child.unref()
        } else {
            const err = await shell.openPath(abs_path)   // OS default application
            if (err) return { ok: false, error: err }
        }
        return { ok: true }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
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
// IPC — Starter templates (New Project)
// =========================================================================

/** Lists the bundled starter templates (id / label / description / display color). */
ipcMain.handle('sw:list-templates', () => build.list_templates())

/** Materializes a starter template into a new project folder (recursive copy + name patch). */
ipcMain.handle('sw:create-from-template', async (_e, template_id: string, dest_folder: string, name?: string) => {
    try {
        await build.create_from_template(template_id, dest_folder, name)
        return { ok: true }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
})

/** Returns the engine version this toolchain ships (what "Update engine" would pin to). */
ipcMain.handle('sw:engine-version', () => build.toolchain_engine_version())

/**
 * Vendors an engine into a project, pinning its version. With no `version` (or the toolchain's own
 * version) it esbuilds the bundled engine; otherwise it vendors that version's cached bundle (which
 * must already be downloaded — see the engine cache below).
 */
ipcMain.handle('sw:vendor-engine', async (_e, project_folder: string, version?: string) => {
    try {
        const bundled = build.toolchain_engine_version()
        if (version && version !== bundled) {
            const sourcePath = _engine_cache_path(version)
            if (!fs.existsSync(sourcePath))
                return { ok: false, error: `Engine ${version} isn't downloaded yet — add it to the cache first.` }
            const v = await build.vendor_engine(project_folder, { sourcePath, version })
            return { ok: true, version: v }
        }
        const v = await build.vendor_engine(project_folder)
        return { ok: true, version: v }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
})

// =========================================================================
// Engine version cache (the engine version manager)
// =========================================================================
//
// Prebuilt engine bundles (`engine-<ver>.mjs`) downloaded from GitHub releases live in one global
// per-user cache. Picking a version for a project copies its cached bundle into the project's
// `.engine/` (see sw:vendor-engine). The cache is shared across all projects.

/** Root of the global engine cache: <userData>/engines/<version>/engine.mjs */
function _engines_dir(): string { return path.join(app.getPath('userData'), 'engines') }
function _engine_cache_path(version: string): string { return path.join(_engines_dir(), version, 'engine.mjs') }

/** owner/repo parsed from package.json (so an account rename doesn't strand the updater). */
function _repo_slug(): string {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'))
        const m = String(pkg.repository?.url ?? '').match(/github\.com[/:]([^/]+\/[^/.]+)/)
        if (m && m[1]) return m[1]
    } catch { /* fall through */ }
    return 'FinnWillow/Silkweaver'
}

/** Versions currently in the cache (have an engine.mjs), newest-first. */
ipcMain.handle('sw:engine-cache-list', () => {
    try {
        return fs.readdirSync(_engines_dir(), { withFileTypes: true })
            .filter(d => d.isDirectory() && fs.existsSync(path.join(_engines_dir(), d.name, 'engine.mjs')))
            .map(d => d.name)
    } catch { return [] }
})

/** The cached engine.mjs path for a version, or null if it isn't cached. */
ipcMain.handle('sw:engine-cache-path', (_e, version: string) => {
    const p = _engine_cache_path(version)
    return fs.existsSync(p) ? p : null
})

/** Remove a cached version from the global cache. */
ipcMain.handle('sw:engine-cache-remove', (_e, version: string) => {
    try { fs.rmSync(path.join(_engines_dir(), version), { recursive: true, force: true }); return { ok: true } }
    catch (e: any) { return { ok: false, error: String(e?.message ?? e) } }
})

/** Versions downloadable from GitHub releases — those whose release carries an engine-<ver>.mjs asset. */
ipcMain.handle('sw:engine-remote-list', async () => {
    try {
        const res = await fetch(`https://api.github.com/repos/${_repo_slug()}/releases?per_page=100`, {
            headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Silkweaver-IDE' },
        })
        if (!res.ok) return { ok: false, error: `GitHub API ${res.status}`, versions: [] as { version: string; url: string }[] }
        const releases = await res.json() as Array<{ assets?: Array<{ name?: string; browser_download_url?: string }> }>
        const versions: { version: string; url: string }[] = []
        for (const r of releases) for (const a of (r.assets ?? [])) {
            const m = /^engine-(\d+\.\d+\.\d+)\.mjs$/.exec(a.name ?? '')
            if (m && m[1] && a.browser_download_url) versions.push({ version: m[1], url: a.browser_download_url })
        }
        return { ok: true, versions }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e), versions: [] as { version: string; url: string }[] }
    }
})

/** Download an engine bundle into the cache. */
ipcMain.handle('sw:engine-download', async (_e, version: string, url: string) => {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Silkweaver-IDE' } })
        if (!res.ok) return { ok: false, error: `Download failed: HTTP ${res.status}` }
        const buf = Buffer.from(await res.arrayBuffer())
        const dir = path.join(_engines_dir(), version)
        await fs.promises.mkdir(dir, { recursive: true })
        await fs.promises.writeFile(path.join(dir, 'engine.mjs'), buf)
        return { ok: true }
    } catch (e: any) {
        return { ok: false, error: String(e?.message ?? e) }
    }
})

// =========================================================================
// IPC — Object class-file format (parse/patch for the object editor)
// =========================================================================

/** Whitelisted object_format operations callable from the renderer. */
const OBJECT_OPS = {
    parse_object:    build.parse_object,
    object_vars:     build.object_vars,
    set_static:      build.set_static,
    remove_static:   build.remove_static,
    set_field:       build.set_field,
    remove_field:    build.remove_field,
    add_method:      build.add_method,
    remove_method:   build.remove_method,
    get_event_body:  build.get_event_body,
    set_event_body:  build.set_event_body,
    normalize_object: build.normalize_object,
    scaffold:        build.scaffold_object,
} as const

/** Generic dispatcher for class-file parse/patch ops (returns a model or patched source). */
ipcMain.handle('sw:object-op', (_e, action: keyof typeof OBJECT_OPS, ...args: any[]) => {
    const fn = OBJECT_OPS[action] as ((...a: any[]) => unknown) | undefined
    if (!fn) throw new Error(`Unknown object op: ${action}`)
    return fn(...args)
})
