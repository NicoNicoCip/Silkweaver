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
  /** Rename/move a file or folder. */
  rename: (src, dst) => import_electron.ipcRenderer.invoke("sw:rename", src, dst),
  /** Recursively copy a file or folder. */
  copy: (src, dst) => import_electron.ipcRenderer.invoke("sw:copy", src, dst),
  /** Recursively delete a file or folder. */
  delete_path: (target) => import_electron.ipcRenderer.invoke("sw:delete", target),
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
  build_game: (project_folder) => import_electron.ipcRenderer.invoke("sw:build-game", project_folder),
  /**
   * Export a portable, self-contained HTML5 build of the game into out_dir
   * (game.js + index.html + assets/).
   * @param project_folder - Absolute path to the project folder
   * @param out_dir        - Absolute path to the export destination folder
   * @returns { ok: true, out_dir } or { ok: false, error: string }
   */
  export_html5: (project_folder, out_dir) => import_electron.ipcRenderer.invoke("sw:export-html5", project_folder, out_dir),
  /**
   * Export a standalone desktop executable of the game into out_dir.
   * @param project_folder - Absolute path to the project folder
   * @param out_dir        - Absolute path to the export destination folder
   * @param platform       - 'win32' | 'darwin' | 'linux' (default 'win32')
   * @param arch           - 'x64' | 'arm64' (default 'x64')
   */
  export_exe: (project_folder, out_dir, platform, arch) => import_electron.ipcRenderer.invoke("sw:export-exe", project_folder, out_dir, platform, arch),
  /**
   * Parse/patch a class-per-object file. `action` is one of: parse_object,
   * set_static, remove_static, set_field, remove_field, add_method, remove_method, scaffold.
   * Returns the object model (parse_object) or patched source string (others).
   */
  object_op: (action, ...args) => import_electron.ipcRenderer.invoke("sw:object-op", action, ...args)
});
