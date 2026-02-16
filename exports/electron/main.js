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
        },
    });
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, '../../exports/ide/index.html'));
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
electron_1.ipcMain.handle('sw:pick-folder', async (_e, mode) => {
    const result = await electron_1.dialog.showOpenDialog({
        title: mode === 'open' ? 'Open Project Folder' : 'Save Project To Folder',
        properties: ['openDirectory', 'createDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    return result.filePaths[0];
});
/** Read a text file */
electron_1.ipcMain.handle('sw:read-file', async (_e, abs_path) => {
    return fs.promises.readFile(abs_path, 'utf8');
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
