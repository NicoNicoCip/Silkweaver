// packages/installer/src/zip.ts
var ENCODER = new TextEncoder();
var _crc_table = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[i] = c;
  }
  return t;
})();
function _crc32(data) {
  let crc = 4294967295;
  for (let i = 0; i < data.length; i++) {
    crc = _crc_table[(crc ^ data[i]) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function _u16(v, buf, off) {
  buf[off] = v & 255;
  buf[off + 1] = v >> 8 & 255;
}
function _u32(v, buf, off) {
  buf[off] = v & 255;
  buf[off + 1] = v >> 8 & 255;
  buf[off + 2] = v >> 16 & 255;
  buf[off + 3] = v >> 24 & 255;
}
function zip_create() {
  return { entries: [] };
}
function zip_add_file(zip, path, content) {
  const data = typeof content === "string" ? ENCODER.encode(content) : content;
  zip.entries.push({
    name: path,
    data,
    is_folder: false,
    offset: 0,
    crc32: _crc32(data),
    size: data.length
  });
}
function zip_add_folder(zip, path) {
  const folder_path = path.endsWith("/") ? path : path + "/";
  zip.entries.push({
    name: folder_path,
    data: new Uint8Array(0),
    is_folder: true,
    offset: 0,
    crc32: 0,
    size: 0
  });
}
function zip_to_bytes(zip) {
  const parts = [];
  let offset = 0;
  for (const entry of zip.entries) {
    entry.offset = offset;
    const name_bytes = ENCODER.encode(entry.name);
    const header = _local_header(entry, name_bytes);
    parts.push(header, entry.data);
    offset += header.length + entry.data.length;
  }
  const cd_start = offset;
  const cd_parts = [];
  for (const entry of zip.entries) {
    const name_bytes = ENCODER.encode(entry.name);
    cd_parts.push(_central_dir_record(entry, name_bytes));
  }
  const cd_bytes = _concat(cd_parts);
  parts.push(cd_bytes);
  offset += cd_bytes.length;
  parts.push(_end_of_central_dir(zip.entries.length, cd_bytes.length, cd_start));
  return _concat(parts);
}
async function zip_save(zip, filename) {
  const bytes = zip_to_bytes(zip);
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1e4);
}
function _local_header(entry, name_bytes) {
  const buf = new Uint8Array(30 + name_bytes.length);
  _u32(67324752, buf, 0);
  _u16(20, buf, 4);
  _u16(2048, buf, 6);
  _u16(0, buf, 8);
  _u16(0, buf, 10);
  _u16(0, buf, 12);
  _u32(entry.crc32, buf, 14);
  _u32(entry.size, buf, 18);
  _u32(entry.size, buf, 22);
  _u16(name_bytes.length, buf, 26);
  _u16(0, buf, 28);
  buf.set(name_bytes, 30);
  return buf;
}
function _central_dir_record(entry, name_bytes) {
  const buf = new Uint8Array(46 + name_bytes.length);
  _u32(33639248, buf, 0);
  _u16(20, buf, 4);
  _u16(20, buf, 6);
  _u16(2048, buf, 8);
  _u16(0, buf, 10);
  _u16(0, buf, 12);
  _u16(0, buf, 14);
  _u32(entry.crc32, buf, 16);
  _u32(entry.size, buf, 20);
  _u32(entry.size, buf, 24);
  _u16(name_bytes.length, buf, 28);
  _u16(0, buf, 30);
  _u16(0, buf, 32);
  _u16(0, buf, 34);
  _u16(0, buf, 36);
  _u32(entry.is_folder ? 16 : 32, buf, 38);
  _u32(entry.offset, buf, 42);
  buf.set(name_bytes, 46);
  return buf;
}
function _end_of_central_dir(count, cd_size, cd_offset) {
  const buf = new Uint8Array(22);
  _u32(101010256, buf, 0);
  _u16(0, buf, 4);
  _u16(0, buf, 6);
  _u16(count, buf, 8);
  _u16(count, buf, 10);
  _u32(cd_size, buf, 12);
  _u32(cd_offset, buf, 16);
  _u16(0, buf, 20);
  return buf;
}
function _concat(parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}

// packages/installer/src/config.ts
var PAGES_BASE_URL = "https://niconicoCip.github.io/Silkweaver/";
var ENGINE_CDN_URL = `${PAGES_BASE_URL}engine.js`;
var INSTALLER_VERSION = "0.1.0";

// packages/installer/src/index.ts
function init() {
  document.title = "Silkweaver \u2014 Create New Project";
  document.body.innerHTML = _render_ui();
  const form = document.getElementById("create-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("project-name").value.trim();
    const author = document.getElementById("author-name").value.trim();
    const version = document.getElementById("game-version").value.trim();
    if (!name) return _show_error("Project name is required.");
    _create_project(name, author, version);
  });
}
function _render_ui() {
  return `
    <div id="installer" style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:24px;border:1px solid #ccc;border-radius:8px;">
        <h1 style="margin-top:0;">\u{1F578} Silkweaver</h1>
        <p>Create a new game project. The engine loads from the CDN during development.
        Use the IDE to build a self-contained release.</p>
        <form id="create-form">
            <label>Project name<br>
                <input id="project-name" type="text" value="my-game" required
                    style="width:100%;box-sizing:border-box;margin-top:4px;padding:6px;">
            </label><br><br>
            <label>Author<br>
                <input id="author-name" type="text" value=""
                    style="width:100%;box-sizing:border-box;margin-top:4px;padding:6px;">
            </label><br><br>
            <label>Version<br>
                <input id="game-version" type="text" value="0.1.0"
                    style="width:100%;box-sizing:border-box;margin-top:4px;padding:6px;">
            </label><br><br>
            <button type="submit" style="padding:8px 20px;cursor:pointer;">
                Download Project ZIP
            </button>
        </form>
        <p id="error-msg" style="color:red;display:none;"></p>
        <hr>
        <small>Engine CDN: <a href="${ENGINE_CDN_URL}" target="_blank">${ENGINE_CDN_URL}</a></small><br>
        <small>Installer v${INSTALLER_VERSION}</small>
    </div>`;
}
function _show_error(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.style.display = "block";
}
async function _create_project(name, author, version) {
  const folder = _sanitize_name(name);
  const zip = zip_create();
  zip_add_file(zip, `${folder}/index.html`, _make_index_html(name));
  zip_add_file(zip, `${folder}/game.js`, _make_game_js(name));
  zip_add_file(zip, `${folder}/project.json`, JSON.stringify({
    name,
    author,
    version,
    engine_version: INSTALLER_VERSION,
    created: (/* @__PURE__ */ new Date()).toISOString()
  }, null, 2));
  zip_add_folder(zip, `${folder}/assets/`);
  zip_add_file(zip, `${folder}/assets/.gitkeep`, "");
  await zip_save(zip, `${folder}.zip`);
}
function _sanitize_name(name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "my-game";
}
function _make_index_html(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${_escape_html(name)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="silkweaver-canvas"></canvas>
    <!-- Engine loaded from Silkweaver CDN (development mode) -->
    <script type="module" src="${ENGINE_CDN_URL}"><\/script>
    <!-- Your game code -->
    <script type="module" src="game.js"><\/script>
</body>
</html>
`;
}
function _make_game_js(name) {
  return `/**
 * ${name} \u2014 game entry point.
 *
 * The Silkweaver engine is available via the global \`sw\` object
 * (or via ES module imports if you use a bundler).
 *
 * Quick start:
 *   1. Open this file in the Silkweaver IDE (${PAGES_BASE_URL}ide/)
 *   2. Write your game code here
 *   3. Use Build in the IDE to create a self-contained release
 */

// Example: initialise the engine and start the game loop
// import { renderer, game_loop } from './engine.js'  // release build
// renderer.init('silkweaver-canvas', 800, 600)
// game_loop.start()
`;
}
function _escape_html(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
