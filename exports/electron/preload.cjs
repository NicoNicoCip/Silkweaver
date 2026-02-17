"use strict";

// packages/electron/src/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("swfs", {
  /**
   * Open a folder picker dialog.
   * @param mode - 'open' or 'save'
   * @returns Absolute path of the chosen folder, or null if cancelled.
   */
  pick_folder: (mode, defaultPath) => import_electron.ipcRenderer.invoke("sw:pick-folder", mode, defaultPath),
  /**
   * Read a text file.
   * @param abs_path - Absolute path
   */
  read_file: (abs_path) => import_electron.ipcRenderer.invoke("sw:read-file", abs_path),
  /**
   * Read a binary file and return it as a Base64 string.
   * @param abs_path - Absolute path
   */
  read_file_base64: (abs_path) => import_electron.ipcRenderer.invoke("sw:read-file-base64", abs_path),
  /**
   * Write a text file (creates parent dirs automatically).
   * @param abs_path - Absolute path
   * @param content  - UTF-8 string content
   */
  write_file: (abs_path, content) => import_electron.ipcRenderer.invoke("sw:write-file", abs_path, content),
  /**
   * Write a binary file from an ArrayBuffer.
   * @param abs_path - Absolute path
   * @param buffer   - Binary data
   */
  write_binary: async (abs_path, buffer) => {
    const base64 = Buffer.from(buffer).toString("base64");
    return import_electron.ipcRenderer.invoke("sw:write-binary", abs_path, base64);
  },
  /**
   * Check if a path exists.
   */
  exists: (abs_path) => import_electron.ipcRenderer.invoke("sw:exists", abs_path),
  /** Path join helper (pure JS, no node:path needed in sandbox) */
  join: (...parts) => {
    const sep = parts[0]?.includes("\\") ? "\\" : "/";
    return parts.join(sep).replace(/[/\\]+/g, sep);
  },
  /**
   * Build the game from the given project folder path into exports/game.js.
   * @param project_folder - Absolute path to the project folder
   * @returns { ok: true } or { ok: false, error: string }
   */
  build_game: (project_folder) => import_electron.ipcRenderer.invoke("sw:build-game", project_folder)
});
