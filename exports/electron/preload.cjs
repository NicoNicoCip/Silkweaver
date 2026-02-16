"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// packages/electron/src/preload.ts
var import_electron = require("electron");
var path = __toESM(require("node:path"), 1);
import_electron.contextBridge.exposeInMainWorld("swfs", {
  /**
   * Open a folder picker dialog.
   * @param mode - 'open' or 'save'
   * @returns Absolute path of the chosen folder, or null if cancelled.
   */
  pick_folder: (mode) => import_electron.ipcRenderer.invoke("sw:pick-folder", mode),
  /**
   * Read a text file.
   * @param abs_path - Absolute path
   */
  read_file: (abs_path) => import_electron.ipcRenderer.invoke("sw:read-file", abs_path),
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
  /** Path join helper (avoids shipping path module to renderer) */
  join: (...parts) => path.join(...parts)
});
