"use strict";
/**
 * Electron main process.
 * Creates the IDE BrowserWindow and handles IPC file system requests
 * from the renderer via the preload bridge.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const build = __importStar(require("@silkweaver/build"));
// =========================================================================
// Window
// =========================================================================
function create_window() {
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Silkweaver IDE',
        backgroundColor: '#2b2b2b',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, '../../exports/ide/index.html'));
    // F12 to toggle DevTools
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'F12') {
            if (win.webContents.isDevToolsOpened()) {
                win.webContents.closeDevTools();
            }
            else {
                win.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });
}
electron_1.app.whenReady().then(() => {
    create_window();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            create_window();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// =========================================================================
// IPC — File System Bridge
// =========================================================================
/** Pick a project folder (open or save-as) */
electron_1.ipcMain.handle('sw:pick-folder', async (_e, mode, defaultPath) => {
    const result = await electron_1.dialog.showOpenDialog({
        title: mode === 'open' ? 'Open Project Folder' : 'Save Project To Folder',
        properties: ['openDirectory', 'createDirectory'],
        ...(defaultPath && { defaultPath }),
    });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    return result.filePaths[0];
});
/** Read a text file */
electron_1.ipcMain.handle('sw:read-file', async (_e, abs_path) => {
    return fs.promises.readFile(abs_path, 'utf8');
});
/** Read a binary file and return it as a Base64 string */
electron_1.ipcMain.handle('sw:read-file-base64', async (_e, abs_path) => {
    const buf = await fs.promises.readFile(abs_path);
    return buf.toString('base64');
});
/** Write a text file (creates intermediate directories) */
electron_1.ipcMain.handle('sw:write-file', async (_e, abs_path, content) => {
    await fs.promises.mkdir(path.dirname(abs_path), { recursive: true });
    await fs.promises.writeFile(abs_path, content, 'utf8');
});
/** Write a binary file from a Base64 string */
electron_1.ipcMain.handle('sw:write-binary', async (_e, abs_path, base64) => {
    await fs.promises.mkdir(path.dirname(abs_path), { recursive: true });
    await fs.promises.writeFile(abs_path, Buffer.from(base64, 'base64'));
});
/** Check if a path exists */
electron_1.ipcMain.handle('sw:exists', async (_e, abs_path) => {
    try {
        await fs.promises.access(abs_path);
        return true;
    }
    catch {
        return false;
    }
});
/** Rename/move a file or folder (atomic). */
electron_1.ipcMain.handle('sw:rename', async (_e, src, dst) => {
    await fs.promises.mkdir(path.dirname(dst), { recursive: true });
    await fs.promises.rename(src, dst);
});
/** Recursively copy a file or folder. */
electron_1.ipcMain.handle('sw:copy', async (_e, src, dst) => {
    await fs.promises.mkdir(path.dirname(dst), { recursive: true });
    await fs.promises.cp(src, dst, { recursive: true });
});
/** Recursively delete a file or folder (no error if it doesn't exist). */
electron_1.ipcMain.handle('sw:delete', async (_e, target) => {
    await fs.promises.rm(target, { recursive: true, force: true });
});
// =========================================================================
// IPC — Game Build / Export
// =========================================================================
/** Builds the game into exports/game.js for the in-IDE preview. */
electron_1.ipcMain.handle('sw:build-game', async (_e, project_folder) => {
    try {
        // The IDE preview iframe loads ../game.js → exports/game.js.
        await build.build_preview(project_folder, path.join(__dirname, '../game.js'));
        return { ok: true };
    }
    catch (e) {
        return { ok: false, error: String(e?.message ?? e) };
    }
});
/** Exports a portable, self-contained HTML5 build into out_dir. */
electron_1.ipcMain.handle('sw:export-html5', async (_e, project_folder, out_dir) => {
    try {
        const out = await build.export_html5(project_folder, out_dir);
        return { ok: true, out_dir: out };
    }
    catch (e) {
        return { ok: false, error: String(e?.message ?? e) };
    }
});
/** Exports a standalone desktop executable into out_dir. */
electron_1.ipcMain.handle('sw:export-exe', async (_e, project_folder, out_dir, platform, arch) => {
    try {
        const out = await build.export_executable(project_folder, out_dir, platform, arch);
        return { ok: true, out_dir: out };
    }
    catch (e) {
        return { ok: false, error: String(e?.message ?? e) };
    }
});
// =========================================================================
// IPC — Object class-file format (parse/patch for the object editor)
// =========================================================================
/** Whitelisted object_format operations callable from the renderer. */
const OBJECT_OPS = {
    parse_object: build.parse_object,
    set_static: build.set_static,
    remove_static: build.remove_static,
    set_field: build.set_field,
    remove_field: build.remove_field,
    add_method: build.add_method,
    remove_method: build.remove_method,
    scaffold: build.scaffold_object,
};
/** Generic dispatcher for class-file parse/patch ops (returns a model or patched source). */
electron_1.ipcMain.handle('sw:object-op', (_e, action, ...args) => {
    const fn = OBJECT_OPS[action];
    if (!fn)
        throw new Error(`Unknown object op: ${action}`);
    return fn(...args);
});
