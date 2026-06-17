// packages/ide/src/theme.ts
function theme_inject() {
  const style = document.createElement("style");
  style.textContent = /*css*/
  `
/* \u2500\u2500 Reset \u2500\u2500 */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
    width: 100%; height: 100%; overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 12px;
    background: var(--sw-workspace);
    color: var(--sw-text);
    user-select: none;
}

/* \u2500\u2500 CSS Variables \u2500\u2500 */
:root {
    --sw-workspace:  #2b2b2b;
    --sw-chrome:     #3c3c3c;
    --sw-chrome2:    #333333;
    --sw-border:     #555555;
    --sw-border2:    #444444;
    --sw-text:       #f0f0f0;
    --sw-text-dim:   #aaaaaa;
    --sw-accent:     #0078d4;
    --sw-accent-hov: #106ebe;
    --sw-close-hov:  #e81123;
    --sw-close-act:  #f1707a;
    --sw-input-bg:   #3a3a3a;
    --sw-input-bdr:  #666666;
    --sw-select-bg:  #094771;
    --sw-titlebar-h: 28px;
    --sw-menubar-h:  24px;
    --sw-statusbar-h:20px;
}

/* \u2500\u2500 Scrollbars \u2500\u2500 */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--sw-chrome); }
::-webkit-scrollbar-thumb { background: #666; }
::-webkit-scrollbar-thumb:hover { background: #888; }

/* \u2500\u2500 Workspace \u2500\u2500 */
#sw-workspace {
    position: fixed;
    top: var(--sw-menubar-h);
    left: 0;
    right: 0;
    bottom: var(--sw-statusbar-h);
    overflow: hidden;
}

/* \u2500\u2500 Menubar \u2500\u2500 */
#sw-menubar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: var(--sw-menubar-h);
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border);
    display: flex;
    align-items: stretch;
    z-index: 9000;
}
.sw-menu-item {
    padding: 0 10px;
    display: flex; align-items: center;
    cursor: pointer;
    position: relative;
    color: var(--sw-text);
    font-size: 12px;
    white-space: nowrap;
}
.sw-menu-item:hover, .sw-menu-item.open {
    background: var(--sw-accent);
}
.sw-dropdown {
    display: none;
    position: absolute;
    top: 100%; left: 0;
    min-width: 160px;
    background: var(--sw-chrome);
    border: 1px solid var(--sw-border);
    z-index: 9100;
    padding: 2px 0;
}
.sw-menu-item.open .sw-dropdown { display: block; }
.sw-dropdown-item {
    display: flex;
    align-items: center;
    height: 26px;
    padding: 0 16px;
    cursor: pointer;
    color: var(--sw-text);
    white-space: nowrap;
}
.sw-dropdown-item:hover { background: var(--sw-accent); }
.sw-dropdown-item.disabled { color: var(--sw-text-dim); cursor: default; }
.sw-dropdown-item.disabled:hover { background: none; }
.sw-dropdown-sep {
    height: 1px; background: var(--sw-border);
    margin: 3px 0;
}
.sw-dropdown-shortcut {
    margin-left: auto;
    padding-left: 24px;
    color: var(--sw-text-dim);
    font-size: 11px;
}

/* \u2500\u2500 Status Bar \u2500\u2500 */
#sw-statusbar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: var(--sw-statusbar-h);
    background: var(--sw-accent);
    display: flex;
    align-items: center;
    padding: 0 8px;
    gap: 16px;
    z-index: 9000;
    font-size: 11px;
    color: #fff;
}
.sw-statusbar-sep { color: rgba(255,255,255,0.4); }

/* \u2500\u2500 Floating Windows \u2500\u2500 */
.sw-window {
    position: absolute;
    background: var(--sw-chrome);
    border: 1px solid var(--sw-border);
    display: flex;
    flex-direction: column;
    min-width: 120px;
    min-height: 60px;
}
.sw-window.minimized .sw-window-body { display: none; }
.sw-window.minimized .sw-resize { display: none; }
.sw-window.minimized { min-height: 0 !important; overflow: hidden; }
.sw-window-titlebar {
    height: var(--sw-titlebar-h);
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 6px;
    flex-shrink: 0;
    cursor: move;
}
.sw-window-titlebar img {
    width: 14px; height: 14px;
    flex-shrink: 0;
    pointer-events: none;
}
.sw-window-title {
    flex: 1;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
}
.sw-window-btns {
    display: flex;
    gap: 0;
    flex-shrink: 0;
}
.sw-window-btn {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 13px;
    color: var(--sw-text);
    margin: -4px -2px;
}
.sw-window-btn:hover { background: rgba(255,255,255,0.1); }
.sw-window-btn.close:hover { background: var(--sw-close-hov); }
.sw-window-btn.close:active { background: var(--sw-close-act); }
.sw-window-body {
    flex: 1;
    overflow: hidden;
    position: relative;
}
/* Resize handles */
.sw-resize { position: absolute; z-index: 1; }
.sw-resize-n  { top: 0; left: 4px; right: 4px; height: 4px; cursor: n-resize; }
.sw-resize-s  { bottom: 0; left: 4px; right: 4px; height: 4px; cursor: s-resize; }
.sw-resize-e  { right: 0; top: 4px; bottom: 4px; width: 4px; cursor: e-resize; }
.sw-resize-w  { left: 0; top: 4px; bottom: 4px; width: 4px; cursor: w-resize; }
.sw-resize-ne { top: 0; right: 0; width: 8px; height: 8px; cursor: ne-resize; }
.sw-resize-nw { top: 0; left: 0; width: 8px; height: 8px; cursor: nw-resize; }
.sw-resize-se { bottom: 0; right: 0; width: 8px; height: 8px; cursor: se-resize; }
.sw-resize-sw { bottom: 0; left: 0; width: 8px; height: 8px; cursor: sw-resize; }

/* \u2500\u2500 Common Form Elements \u2500\u2500 */
.sw-label {
    display: block;
    color: var(--sw-text-dim);
    font-size: 11px;
    margin-bottom: 2px;
}
.sw-input {
    background: var(--sw-input-bg);
    border: 1px solid var(--sw-input-bdr);
    color: var(--sw-text);
    font-size: 12px;
    padding: 3px 6px;
    outline: none;
    width: 100%;
}
.sw-input:focus { border-color: var(--sw-accent); }
.sw-select {
    background: var(--sw-input-bg);
    border: 1px solid var(--sw-input-bdr);
    color: var(--sw-text);
    font-size: 12px;
    padding: 3px 6px;
    outline: none;
    cursor: pointer;
}
.sw-btn {
    background: var(--sw-chrome2);
    border: 1px solid var(--sw-border);
    color: var(--sw-text);
    font-size: 12px;
    padding: 4px 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.sw-btn:hover { background: var(--sw-accent); border-color: var(--sw-accent); }
.sw-btn:active { background: var(--sw-accent-hov); }
.sw-btn img { width: 14px; height: 14px; }
.sw-checkbox { accent-color: var(--sw-accent); cursor: pointer; }

/* \u2500\u2500 Editor Toolbar (shared) \u2500\u2500 */
.sw-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border);
    flex-shrink: 0;
    flex-wrap: wrap;
}

/* \u2500\u2500 Sprite Editor \u2500\u2500 */
.sw-sprite-framelist {
    width: 80px;
    min-width: 80px;
    flex-shrink: 0;
    overflow-y: auto;
    border-right: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
    display: flex;
    flex-direction: column;
}
.sw-sprite-frame-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 4px;
    cursor: pointer;
    border-bottom: 1px solid var(--sw-border2);
}
.sw-sprite-frame-row:hover { background: var(--sw-select-bg); }
.sw-sprite-preview-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    overflow: hidden;
}
.sw-sprite-canvas {
    image-rendering: pixelated;
    max-width: 100%;
    max-height: 100%;
}
.sw-sprite-props {
    width: 180px;
    min-width: 180px;
    flex-shrink: 0;
    overflow-y: auto;
    border-left: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
}

/* \u2500\u2500 Object Editor \u2500\u2500 */
.sw-obj-props-panel {
    width: 220px;
    min-width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    border-right: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
}
.sw-obj-events-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.sw-obj-event-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-bottom: 1px solid var(--sw-border2);
    cursor: pointer;
}
.sw-obj-event-row:hover { background: var(--sw-select-bg); }

/* \u2500\u2500 Room Editor \u2500\u2500 */
.sw-room-panel {
    width: 220px;
    min-width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
    overflow: hidden;
}
.sw-room-tabs {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--sw-border);
    flex-shrink: 0;
}
.sw-room-tab {
    background: none;
    border: none;
    border-right: 1px solid var(--sw-border2);
    color: var(--sw-text-dim);
    font-size: 10px;
    padding: 4px 6px;
    cursor: pointer;
    flex: 1;
    text-align: center;
}
.sw-room-tab:hover { background: rgba(255,255,255,0.05); color: var(--sw-text); }
.sw-room-tab.active { background: var(--sw-chrome); color: var(--sw-text); border-bottom: 2px solid var(--sw-accent); }
.sw-room-inst-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    cursor: pointer;
    border-bottom: 1px solid var(--sw-border2);
    font-size: 11px;
}
.sw-room-inst-row:hover   { background: var(--sw-select-bg); }
.sw-room-inst-row.selected { background: var(--sw-accent); }

/* \u2500\u2500 Sound Editor \u2500\u2500 */
.sw-snd-status {
    padding: 4px 8px;
    font-size: 11px;
    color: var(--sw-text-dim);
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border);
    flex-shrink: 0;
}
.sw-snd-form {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
}
.sw-snd-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* \u2500\u2500 Background Editor \u2500\u2500 */
.sw-bg-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    overflow: hidden;
}
.sw-bg-props {
    width: 180px;
    min-width: 180px;
    flex-shrink: 0;
    overflow-y: auto;
    border-left: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
}
.sw-bg-section {
    border-bottom: 1px solid var(--sw-border);
}
.sw-bg-section-title {
    padding: 4px 8px;
    font-size: 10px;
    font-weight: bold;
    color: var(--sw-text-dim);
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.sw-bg-prop-row {
    padding: 4px 8px;
    border-bottom: 1px solid var(--sw-border2);
}

/* \u2500\u2500 Font Editor \u2500\u2500 */
.sw-font-props {
    width: 220px;
    min-width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    border-right: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
    display: flex;
    flex-direction: column;
}
.sw-font-row {
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-bottom: 1px solid var(--sw-border2);
}
.sw-font-ranges {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 6px;
}
.sw-font-range-row {
    display: flex;
    align-items: center;
    gap: 4px;
}
.sw-font-preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--sw-chrome);
}
.sw-font-preview {
    flex: 1;
    overflow: auto;
    padding: 12px;
    color: var(--sw-text);
    white-space: pre-wrap;
    outline: none;
}

/* \u2500\u2500 Path Editor \u2500\u2500 */
/* (canvas fills flex container; no extra panel needed) */

/* \u2500\u2500 Timeline Editor \u2500\u2500 */
.sw-tl-list-panel {
    width: 300px;
    min-width: 200px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--sw-border);
    background: var(--sw-chrome2);
    overflow: hidden;
}
.sw-tl-strip-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--sw-chrome);
}
.sw-tl-list {
    flex: 1;
    overflow-y: auto;
}
.sw-tl-moment-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-bottom: 1px solid var(--sw-border2);
    cursor: pointer;
    font-size: 11px;
}
.sw-tl-moment-row:hover    { background: var(--sw-select-bg); }
.sw-tl-moment-row.selected { background: var(--sw-accent); }
.sw-tl-step-lbl {
    min-width: 52px;
    color: var(--sw-text-dim);
    font-size: 10px;
}

/* \u2500\u2500 Console / Output Panel \u2500\u2500 */
.sw-con-list {
    flex: 1;
    overflow-y: auto;
    font-family: 'Consolas', 'Cascadia Code', monospace;
    font-size: 11px;
    background: #1a1a1a;
}
.sw-con-row {
    display: flex;
    gap: 8px;
    padding: 1px 6px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    line-height: 1.5;
}
.sw-con-row:hover { background: rgba(255,255,255,0.04); }
.sw-con-time {
    color: var(--sw-text-dim);
    flex-shrink: 0;
    min-width: 56px;
    font-size: 10px;
    padding-top: 1px;
}
.sw-con-text { word-break: break-all; }
.sw-con-log    { color: #e0e0e0; }
.sw-con-info   { color: #6ec6ff; }
.sw-con-warn   { color: #ffcc44; background: rgba(255,204,68,0.06); }
.sw-con-error  { color: #ff6b6b; background: rgba(255,107,107,0.08); }
.sw-con-system { color: var(--sw-text-dim); font-style: italic; }
.sw-con-filter        { opacity: 0.45; }
.sw-con-filter.active { opacity: 1; }

/* \u2500\u2500 Breakpoint glyphs \u2500\u2500 */
.sw-bp-glyph {
    background: #e53935;
    border-radius: 50%;
    width: 10px !important;
    height: 10px !important;
    margin-top: 4px;
    margin-left: 2px;
}
.sw-bp-line { background: rgba(229,57,53,0.15); }

/* \u2500\u2500 Debugger Panel \u2500\u2500 */
.sw-dbg-status {
    padding: 4px 8px;
    font-size: 11px;
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border);
    color: var(--sw-text-dim);
    flex-shrink: 0;
}
.sw-dbg-status.paused { color: #ffcc44; background: rgba(255,204,68,0.1); }
.sw-dbg-vars {
    flex: 1;
    overflow-y: auto;
    font-family: 'Consolas', monospace;
    font-size: 11px;
    padding: 4px 0;
}
.sw-dbg-row {
    display: flex;
    gap: 8px;
    padding: 2px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sw-dbg-row:hover { background: rgba(255,255,255,0.04); }
.sw-dbg-key  { color: #9cdcfe; min-width: 100px; flex-shrink: 0; }
.sw-dbg-val  { word-break: break-all; }
.sw-dbg-num  { color: #b5cea8; }
.sw-dbg-str  { color: #ce9178; }
.sw-dbg-bool { color: #569cd6; }
.sw-dbg-null { color: var(--sw-text-dim); }
.sw-dbg-obj  { color: #dcdcaa; }
.sw-dbg-empty { padding: 8px 12px; color: var(--sw-text-dim); font-style: italic; font-size: 11px; }

/* \u2500\u2500 Resource Tree \u2500\u2500 */
.sw-tree-arrow {
    display: inline-block;
    width: 14px;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1;
    color: var(--sw-text-dim);
    transition: transform 0.12s ease;
    transform-origin: center 55%;
    text-align: center;
}
.sw-tree-arrow.open {
    transform: rotate(90deg);
}
.sw-tree-cat-glyph {
    display: inline-block;
    width: 14px;
    flex-shrink: 0;
    font-size: 11px;
    line-height: 1;
    text-align: center;
    color: var(--sw-text-dim);
}
.sw-tree-item-glyph {
    display: inline-block;
    width: 16px;
    flex-shrink: 0;
    font-size: 11px;
    line-height: 1;
    text-align: center;
    color: var(--sw-text-dim);
}
.sw-tree-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--sw-text-dim);
    font-size: 14px;
    line-height: 1;
    padding: 0 2px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
}
.sw-tree-btn:hover { color: var(--sw-text); background: rgba(255,255,255,0.1); }

/* \u2500\u2500 Profiler Panel \u2500\u2500 */
.sw-prof-section {
    background: var(--sw-chrome2);
    border: 1px solid var(--sw-border);
    padding: 6px;
}
.sw-prof-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}
.sw-prof-title {
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.sw-prof-cur {
    font-size: 16px;
    font-weight: bold;
    color: var(--sw-text);
    font-family: 'Consolas', monospace;
}
.sw-prof-canvas {
    display: block;
    width: 100%;
    height: 48px;
    image-rendering: pixelated;
}
.sw-prof-stats {
    display: flex;
    gap: 12px;
    font-size: 10px;
    color: var(--sw-text-dim);
    margin-top: 3px;
    font-family: 'Consolas', monospace;
}
`;
  document.head.appendChild(style);
}

// packages/ide/src/menubar.ts
var _open_menu = null;
function menubar_create(menus) {
  const bar = document.createElement("div");
  bar.id = "sw-menubar";
  for (const def of menus) {
    bar.appendChild(_build_menu(def));
  }
  document.addEventListener("mousedown", (e) => {
    if (_open_menu && !_open_menu.contains(e.target)) {
      _close_all(bar);
    }
  });
  return bar;
}
function _build_menu(def) {
  const item = document.createElement("div");
  item.className = "sw-menu-item";
  item.textContent = def.label;
  const dropdown = document.createElement("div");
  dropdown.className = "sw-dropdown";
  for (const entry of def.items) {
    if (entry.separator) {
      const sep = document.createElement("div");
      sep.className = "sw-dropdown-sep";
      dropdown.appendChild(sep);
      continue;
    }
    const row = document.createElement("div");
    row.className = "sw-dropdown-item" + (entry.disabled ? " disabled" : "");
    const lbl = document.createElement("span");
    lbl.textContent = entry.label ?? "";
    row.appendChild(lbl);
    if (entry.shortcut) {
      const sc = document.createElement("span");
      sc.className = "sw-dropdown-shortcut";
      sc.textContent = entry.shortcut;
      row.appendChild(sc);
    }
    if (!entry.disabled && entry.action) {
      row.addEventListener("click", () => {
        const bar = item.closest("#sw-menubar");
        _close_all(bar);
        entry.action();
      });
    }
    dropdown.appendChild(row);
  }
  item.appendChild(dropdown);
  item.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    if (e.target.closest(".sw-dropdown")) return;
    const bar = item.closest("#sw-menubar");
    const was_open = item.classList.contains("open");
    _close_all(bar);
    if (!was_open) {
      item.classList.add("open");
      _open_menu = item;
    }
  });
  return item;
}
function _close_all(bar) {
  bar.querySelectorAll(".sw-menu-item.open").forEach((el) => el.classList.remove("open"));
  _open_menu = null;
}
function menubar_default(actions) {
  const menus = [
    {
      label: "File",
      items: [
        { label: "New Project", shortcut: "Ctrl+N", action: actions.file_new },
        { label: "Open Project\u2026", shortcut: "Ctrl+O", action: actions.file_open },
        { separator: true },
        { label: "Save", shortcut: "Ctrl+S", action: actions.file_save },
        { label: "Save As\u2026", action: actions.file_save_as }
      ]
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "Ctrl+Z", disabled: true },
        { label: "Redo", shortcut: "Ctrl+Y", disabled: true },
        { separator: true },
        { label: "Game Settings\u2026", shortcut: "Ctrl+Shift+P", action: actions.edit_game_settings }
      ]
    },
    {
      label: "Resource",
      items: [
        { label: "Add Sprite", action: actions.res_add_sprite },
        { label: "Add Sound", action: actions.res_add_sound },
        { label: "Add Background", action: actions.res_add_background },
        { label: "Add Path", action: actions.res_add_path },
        { label: "Add Script", action: actions.res_add_script },
        { label: "Add Font", action: actions.res_add_font },
        { label: "Add Timeline", action: actions.res_add_timeline },
        { separator: true },
        { label: "Add Object", action: actions.res_add_object },
        { label: "Add Room", action: actions.res_add_room }
      ]
    },
    {
      label: "View",
      items: [
        { label: "Resources", shortcut: "Ctrl+R", action: actions.view_resources },
        { separator: true },
        { label: "Output", shortcut: "F11", action: actions.view_console },
        { label: "Debugger", shortcut: "F9", action: actions.view_debugger },
        { label: "Profiler", shortcut: "F10", action: actions.view_profiler },
        { label: "Game Preview", shortcut: "", action: actions.view_preview }
      ]
    },
    {
      label: "Run",
      items: [
        { label: "Play", shortcut: "F5", action: actions.run_play },
        { label: "Stop", shortcut: "Shift+F5", action: actions.run_stop },
        { separator: true },
        { label: "Build Game\u2026", action: actions.run_build },
        { label: "Export HTML5\u2026", action: actions.run_export_html5 },
        { separator: true },
        { label: "Export Windows (.exe)\u2026", action: actions.run_export_win },
        { label: "Export macOS (.app)\u2026", action: actions.run_export_mac },
        { label: "Export Linux\u2026", action: actions.run_export_linux }
      ]
    },
    {
      label: "Help",
      items: [
        { label: "About Silkweaver", action: actions.help_about }
      ]
    }
  ];
  return menubar_create(menus);
}

// packages/ide/src/status_bar.ts
var _el_name = null;
var _el_unsaved = null;
var _el_coords = null;
var _el_fps = null;
function status_bar_create() {
  const bar = document.createElement("div");
  bar.id = "sw-statusbar";
  _el_name = _span("No project");
  _el_unsaved = _span("");
  _el_coords = _span("");
  _el_fps = _span("");
  const sep1 = _sep();
  const sep2 = _sep();
  const sep3 = _sep();
  bar.append(_el_name, _el_unsaved, sep1, _el_coords, sep2, _el_fps, sep3);
  return bar;
}
function status_set_project(name) {
  if (_el_name) _el_name.textContent = name;
}
function status_set_unsaved(unsaved) {
  if (_el_unsaved) _el_unsaved.textContent = unsaved ? "\u25CF" : "";
}
function _span(text) {
  const s = document.createElement("span");
  s.textContent = text;
  return s;
}
function _sep() {
  const s = document.createElement("span");
  s.className = "sw-statusbar-sep";
  s.textContent = "|";
  return s;
}

// packages/ide/src/window_manager.ts
var _z_counter = 100;
function _next_z() {
  return ++_z_counter;
}
var LAYOUT_KEY = "sw_ide_layout";
function _load_layouts() {
  try {
    return JSON.parse(localStorage.getItem(LAYOUT_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function _save_layout(id, state) {
  const layouts = _load_layouts();
  layouts[id] = state;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layouts));
}
var FloatingWindow = class {
  constructor(id, title, icon_src, default_rect) {
    this._maximized = false;
    this._saved_rect = null;
    // Drag state
    this._drag_active = false;
    this._drag_ox = 0;
    this._drag_oy = 0;
    // Resize state
    this._resize_active = false;
    this._resize_dir = "se";
    this._resize_start = { mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 };
    this._on_close_cb = null;
    this.id = id;
    this.el = document.createElement("div");
    this.el.className = "sw-window";
    this.el.style.left = default_rect.x + "px";
    this.el.style.top = default_rect.y + "px";
    this.el.style.width = default_rect.w + "px";
    this.el.style.height = default_rect.h + "px";
    this.el.style.zIndex = String(_next_z());
    const titlebar = document.createElement("div");
    titlebar.className = "sw-window-titlebar";
    this._icon_el = document.createElement("img");
    this._icon_el.src = icon_src ?? "";
    this._icon_el.style.display = icon_src ? "" : "none";
    this._title_el = document.createElement("span");
    this._title_el.className = "sw-window-title";
    this._title_el.textContent = title;
    const btns = document.createElement("div");
    btns.className = "sw-window-btns";
    this._min_btn = _make_btn("_", "min", () => this.toggle_minimize());
    this._max_btn = _make_btn("\u25A1", "max", () => this.toggle_maximize());
    this._close_btn = _make_btn("\u2715", "close", () => this.close());
    btns.append(this._min_btn, this._max_btn, this._close_btn);
    titlebar.append(this._icon_el, this._title_el, btns);
    this.body = document.createElement("div");
    this.body.className = "sw-window-body";
    const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    for (const d of dirs) {
      const h = document.createElement("div");
      h.className = `sw-resize sw-resize-${d}`;
      h.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._resize_begin(e, d);
      });
      this.el.appendChild(h);
    }
    this.el.append(titlebar, this.body);
    titlebar.addEventListener("mousedown", (e) => {
      if (e.target.closest(".sw-window-btn")) return;
      e.preventDefault();
      this._drag_begin(e);
    });
    this.el.addEventListener("mousedown", () => this.bring_to_front());
    const saved = _load_layouts()[id];
    if (saved) {
      this.el.style.left = saved.x + "px";
      this.el.style.top = saved.y + "px";
      this.el.style.width = saved.w + "px";
      if (saved.minimized) {
        this.el.classList.add("minimized");
        this.el.dataset.prevH = saved.h + "px";
        this.el.style.height = "var(--sw-titlebar-h)";
      } else {
        this.el.style.height = saved.h + "px";
      }
    }
  }
  // ── Public API ────────────────────────────────────────────────────────
  /** Append window to a parent element and make it visible. */
  mount(parent) {
    parent.appendChild(this.el);
    return this;
  }
  /** Set the window title text. */
  set_title(title) {
    this._title_el.textContent = title;
  }
  /** Set the title bar icon. */
  set_icon(src) {
    this._icon_el.src = src;
    this._icon_el.style.display = "";
  }
  /** Bring this window to the top of the z stack. */
  bring_to_front() {
    this.el.style.zIndex = String(_next_z());
  }
  /** Toggle minimized state (collapse to title bar). */
  toggle_minimize() {
    this._maximized = false;
    const is_min = this.el.classList.toggle("minimized");
    if (is_min) {
      this.el.dataset.prevH = this.el.style.height;
      this.el.style.height = "var(--sw-titlebar-h)";
    } else {
      this.el.style.height = this.el.dataset.prevH ?? this.el.style.height;
    }
    this._persist();
  }
  /** Toggle maximized state (fill workspace). */
  toggle_maximize() {
    const workspace = document.getElementById("sw-workspace");
    if (!this._maximized) {
      this._saved_rect = {
        x: this.el.offsetLeft,
        y: this.el.offsetTop,
        w: this.el.offsetWidth,
        h: this.el.offsetHeight
      };
      this.el.style.left = "0";
      this.el.style.top = "0";
      this.el.style.width = workspace.offsetWidth + "px";
      this.el.style.height = workspace.offsetHeight + "px";
      this._maximized = true;
      this._max_btn.textContent = "\u2750";
    } else {
      if (this._saved_rect) {
        this.el.style.left = this._saved_rect.x + "px";
        this.el.style.top = this._saved_rect.y + "px";
        this.el.style.width = this._saved_rect.w + "px";
        this.el.style.height = this._saved_rect.h + "px";
      }
      this._maximized = false;
      this._max_btn.textContent = "\u25A1";
    }
    this.el.classList.remove("minimized");
    this._persist();
  }
  /** Close (remove) the window. Calls the optional on_close callback. */
  close() {
    this._on_close_cb?.();
    this.el.remove();
  }
  /** Register a callback invoked when the window is closed. */
  on_close(cb) {
    this._on_close_cb = cb;
    return this;
  }
  // ── Drag ─────────────────────────────────────────────────────────────
  _drag_begin(e) {
    this._drag_active = true;
    this._drag_ox = e.clientX - this.el.offsetLeft;
    this._drag_oy = e.clientY - this.el.offsetTop;
    this.bring_to_front();
    const on_move = (ev) => {
      if (!this._drag_active) return;
      const workspace = document.getElementById("sw-workspace");
      const nx = Math.max(0, Math.min(ev.clientX - this._drag_ox, workspace.offsetWidth - 40));
      const ny = Math.max(0, Math.min(ev.clientY - this._drag_oy, workspace.offsetHeight - 28));
      this.el.style.left = nx + "px";
      this.el.style.top = ny + "px";
    };
    const on_up = () => {
      this._drag_active = false;
      this._persist();
      window.removeEventListener("mousemove", on_move);
      window.removeEventListener("mouseup", on_up);
    };
    window.addEventListener("mousemove", on_move);
    window.addEventListener("mouseup", on_up);
  }
  // ── Resize ────────────────────────────────────────────────────────────
  _resize_begin(e, dir) {
    this._resize_active = true;
    this._resize_dir = dir;
    this._resize_start = {
      mx: e.clientX,
      my: e.clientY,
      x: this.el.offsetLeft,
      y: this.el.offsetTop,
      w: this.el.offsetWidth,
      h: this.el.offsetHeight
    };
    this.bring_to_front();
    const on_move = (ev) => {
      if (!this._resize_active) return;
      const s = this._resize_start;
      const dx = ev.clientX - s.mx;
      const dy = ev.clientY - s.my;
      let { x, y, w, h } = s;
      const MIN = 120;
      const MINH = 60;
      if (dir.includes("e")) w = Math.max(MIN, w + dx);
      if (dir.includes("s")) h = Math.max(MINH, h + dy);
      if (dir.includes("w")) {
        w = Math.max(MIN, w - dx);
        x = s.x + s.w - w;
      }
      if (dir.includes("n")) {
        h = Math.max(MINH, h - dy);
        y = s.y + s.h - h;
      }
      this.el.style.left = x + "px";
      this.el.style.top = y + "px";
      this.el.style.width = w + "px";
      this.el.style.height = h + "px";
    };
    const on_up = () => {
      this._resize_active = false;
      this._persist();
      window.removeEventListener("mousemove", on_move);
      window.removeEventListener("mouseup", on_up);
    };
    window.addEventListener("mousemove", on_move);
    window.addEventListener("mouseup", on_up);
  }
  // ── Persist layout ────────────────────────────────────────────────────
  _persist() {
    _save_layout(this.id, {
      x: this.el.offsetLeft,
      y: this.el.offsetTop,
      w: this.el.offsetWidth,
      h: this.el.offsetHeight,
      minimized: this.el.classList.contains("minimized")
    });
  }
};
function _make_btn(label, cls, cb) {
  const btn = document.createElement("div");
  btn.className = `sw-window-btn ${cls}`;
  btn.textContent = label;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    cb();
  });
  return btn;
}

// packages/ide/src/services/project.ts
var _el = () => window.swfs;
var _has_electron = () => !!_el();
var _has_fsapi = typeof window.showDirectoryPicker === "function";
var LAST_FOLDER_KEY = "sw_last_project_folder";
var _folder_path = null;
var _dir_handle = null;
function project_new() {
  return {
    name: "My Game",
    version: "1.0.0",
    engineVersion: "0.1.0",
    settings: {
      roomSpeed: 60,
      windowWidth: 640,
      windowHeight: 480,
      startRoom: "",
      displayColor: "#000000"
    },
    resources: {
      sprites: {},
      sounds: {},
      backgrounds: {},
      paths: {},
      scripts: {},
      fonts: {},
      timelines: {},
      objects: {},
      rooms: {}
    }
  };
}
async function project_open() {
  if (_has_electron()) return _open_electron();
  if (_has_fsapi) return _open_fsapi();
  return _open_fallback();
}
async function project_save(state, dir) {
  if (_has_electron()) {
    await _save_electron(state);
    return;
  }
  if (_has_fsapi) {
    await _save_fsapi(state, dir);
    return;
  }
  _save_fallback(state);
}
function project_set_dir(dir) {
  _dir_handle = dir;
}
function project_set_folder(path) {
  _folder_path = path;
  if (path) localStorage.setItem(LAST_FOLDER_KEY, path);
  else localStorage.removeItem(LAST_FOLDER_KEY);
}
function project_get_folder_path() {
  return _folder_path;
}
function project_get_last_folder() {
  return localStorage.getItem(LAST_FOLDER_KEY);
}
async function project_open_last() {
  if (!_has_electron()) return null;
  const folder = localStorage.getItem(LAST_FOLDER_KEY);
  if (!folder) return null;
  const fs = _el();
  const proj_path = fs.join(folder, "project.json");
  try {
    const exists = await fs.exists(proj_path);
    if (!exists) return null;
    const text = await fs.read_file(proj_path);
    const state = JSON.parse(text);
    _folder_path = folder;
    return { state, dir: null };
  } catch {
    return null;
  }
}
async function project_read_binary_url(rel_path) {
  if (_has_electron()) {
    const fs = _el();
    if (!_folder_path) throw new Error("No project folder open");
    const base64 = await fs.read_file_base64(fs.join(_folder_path, ...rel_path.split("/")));
    const ext = rel_path.split(".").pop()?.toLowerCase() ?? "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "gif" ? "image/gif" : "image/png";
    return `data:${mime};base64,${base64}`;
  }
  const dir = _dir_handle;
  if (!dir) throw new Error("No project directory open");
  const parts = rel_path.split("/");
  let current = dir;
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i], { create: false });
  }
  const fh = await current.getFileHandle(parts[parts.length - 1]);
  const file = await fh.getFile();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function project_file_exists(rel_path) {
  try {
    if (_has_electron()) {
      const fs = _el();
      if (!_folder_path) return false;
      return await fs.exists(fs.join(_folder_path, ...rel_path.split("/")));
    }
    const dir = _dir_handle;
    if (!dir) return false;
    const parts = rel_path.split("/");
    let current = dir;
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i], { create: false });
    }
    await current.getFileHandle(parts[parts.length - 1]);
    return true;
  } catch {
    return false;
  }
}
async function project_read_file(rel_path) {
  if (_has_electron()) {
    const fs = _el();
    if (!_folder_path) throw new Error("No project folder open");
    return fs.read_file(fs.join(_folder_path, ...rel_path.split("/")));
  }
  const dir = _dir_handle;
  if (!dir) throw new Error("No project directory open");
  const parts = rel_path.split("/");
  let current = dir;
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i], { create: false });
  }
  const fh = await current.getFileHandle(parts[parts.length - 1]);
  const file = await fh.getFile();
  return file.text();
}
async function project_write_file(rel_path, content) {
  if (_has_electron()) {
    const fs = _el();
    if (!_folder_path) throw new Error("No project folder open");
    return fs.write_file(fs.join(_folder_path, ...rel_path.split("/")), content);
  }
  const dir = _dir_handle;
  if (!dir) throw new Error("No project directory open");
  const parts = rel_path.split("/");
  let current = dir;
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i], { create: true });
  }
  const fh = await current.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await fh.createWritable();
  await writable.write(content);
  await writable.close();
}
async function project_write_binary(dest_path, data) {
  const buf = data instanceof Uint8Array ? new Uint8Array(data).buffer : await data.arrayBuffer();
  if (_has_electron()) {
    const fs = _el();
    if (!_folder_path) throw new Error("No project folder open");
    return fs.write_binary(fs.join(_folder_path, ...dest_path.split("/")), buf);
  }
  const dir = _dir_handle;
  if (!dir) throw new Error("No project directory open");
  const parts = dest_path.split("/");
  let current = dir;
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i], { create: true });
  }
  const fh = await current.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await fh.createWritable();
  await writable.write(buf);
  await writable.close();
}
function project_get_dir() {
  return _dir_handle;
}
function project_has_folder() {
  return !!_folder_path || !!_dir_handle;
}
async function _open_electron() {
  const fs = _el();
  const last = localStorage.getItem(LAST_FOLDER_KEY) ?? void 0;
  const folder = await fs.pick_folder("open", last);
  if (!folder) return null;
  _folder_path = folder;
  localStorage.setItem(LAST_FOLDER_KEY, folder);
  const proj_path = fs.join(folder, "project.json");
  let state;
  try {
    const text = await fs.read_file(proj_path);
    state = JSON.parse(text);
  } catch {
    state = project_new();
    state.name = folder.split(/[\\/]/).pop() ?? "My Game";
  }
  return { state, dir: null };
}
async function _save_electron(state) {
  const fs = _el();
  if (!_folder_path) {
    const last = localStorage.getItem(LAST_FOLDER_KEY) ?? void 0;
    const folder = await fs.pick_folder("save", last);
    if (!folder) throw new Error("No project folder selected");
    _folder_path = folder;
    localStorage.setItem(LAST_FOLDER_KEY, folder);
  }
  await fs.write_file(fs.join(_folder_path, "project.json"), JSON.stringify(state, null, 2));
}
async function _open_fsapi() {
  let dir;
  try {
    dir = await window.showDirectoryPicker({ mode: "readwrite" });
  } catch {
    return null;
  }
  _dir_handle = dir;
  let state;
  try {
    const fh = await dir.getFileHandle("project.json");
    const f = await fh.getFile();
    state = JSON.parse(await f.text());
  } catch {
    state = project_new();
    state.name = dir.name;
  }
  return { state, dir };
}
async function _save_fsapi(state, dir) {
  const target = dir ?? _dir_handle;
  if (!target) throw new Error("No project directory open");
  if (dir) _dir_handle = dir;
  const fh = await target.getFileHandle("project.json", { create: true });
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(state, null, 2));
  await writable.close();
}
async function _open_fallback() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const state = JSON.parse(await file.text());
        resolve({ state, dir: null });
      } catch {
        alert("Failed to parse project.json");
        resolve(null);
      }
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
function _save_fallback(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project.json";
  a.click();
  URL.revokeObjectURL(url);
}

// packages/ide/src/resource_tree.ts
var CATEGORIES = [
  { id: "sprites", label: "Sprites", glyph: "\u25A4" },
  // ▤  image grid
  { id: "sounds", label: "Sounds", glyph: "\u266A" },
  // ♪  music note
  { id: "backgrounds", label: "Backgrounds", glyph: "\u2588" },
  // █  solid block
  { id: "paths", label: "Paths", glyph: "\u2922" },
  // ⤢  crossed arrows
  { id: "scripts", label: "Scripts", glyph: "{" },
  // {  brace
  { id: "fonts", label: "Fonts", glyph: "A" },
  //    letter A
  { id: "timelines", label: "Timelines", glyph: "\u23F1" },
  // ⏱  clock
  { id: "objects", label: "Objects", glyph: "\u25CB" },
  // ○  circle
  { id: "rooms", label: "Rooms", glyph: "\u2395" }
  // ⎕  rectangle
];
var ResourceTree = class {
  constructor() {
    this._workspace = null;
    this._closed = false;
    this._state = null;
    this._category_els = /* @__PURE__ */ new Map();
    this._arrows = /* @__PURE__ */ new Map();
    this._expanded = /* @__PURE__ */ new Set();
    // Callbacks
    this.on_add_resource = () => {
    };
    this.on_delete_resource = () => {
    };
    this.on_rename_resource = () => {
    };
    this._win = new FloatingWindow(
      "resource-tree",
      "Resources",
      null,
      { x: 8, y: 8, w: 220, h: 500 }
    );
    this._win.on_close(() => {
      this._closed = true;
    });
    this._container = document.createElement("div");
    this._container.style.cssText = "overflow-y:auto; height:100%; padding:4px 0;";
    for (const cat of CATEGORIES) {
      this._container.appendChild(this._build_category(cat));
    }
    this._win.body.appendChild(this._container);
  }
  // ── Public API ────────────────────────────────────────────────────────
  /** Mount the resource tree window to the workspace. */
  mount(parent) {
    this._workspace = parent;
    this._closed = false;
    this._win.mount(parent);
  }
  /**
   * Show the resource tree. If it was closed, remounts it.
   * If already open, brings it to the front.
   */
  show() {
    if (!this._workspace) return;
    if (this._closed) {
      this._closed = false;
      this._win.mount(this._workspace);
    } else {
      this._win.bring_to_front();
    }
  }
  /** Populate the tree from a loaded project state. */
  load(state) {
    this._state = state;
    this._refresh_all();
  }
  /** Add a resource entry to the tree. */
  add_resource(cat, name) {
    if (!this._state) return;
    this._state.resources[cat][name] = { name };
    this._refresh_category(cat);
  }
  /** Remove a resource entry from the tree. */
  remove_resource(cat, name) {
    if (!this._state) return;
    delete this._state.resources[cat][name];
    this._refresh_category(cat);
  }
  // ── Build ─────────────────────────────────────────────────────────────
  _build_category(cat) {
    const wrapper = document.createElement("div");
    const header = document.createElement("div");
    header.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:24px; padding:0 6px 0 8px;
            cursor:pointer;
            color:var(--sw-text);
            background:var(--sw-chrome2);
            border-bottom:1px solid var(--sw-border2);
        `;
    header.style.userSelect = "none";
    const arrow = document.createElement("span");
    arrow.className = "sw-tree-arrow";
    arrow.textContent = "\u25B6";
    this._arrows.set(cat.id, arrow);
    const glyph = document.createElement("span");
    glyph.className = "sw-tree-cat-glyph";
    glyph.textContent = cat.glyph;
    const label = document.createElement("span");
    label.textContent = cat.label;
    label.style.cssText = "flex:1; font-size:12px;";
    const add_btn = _text_btn("+", "Add", () => {
      this.on_add_resource(cat.id);
    });
    header.append(arrow, glyph, label, add_btn);
    const list = document.createElement("div");
    list.style.cssText = "display:none;";
    this._category_els.set(cat.id, list);
    header.addEventListener("click", (e) => {
      if (e.target.closest(".sw-tree-btn")) return;
      const is_open = list.style.display !== "none";
      list.style.display = is_open ? "none" : "block";
      if (is_open) {
        arrow.classList.remove("open");
        this._expanded.delete(cat.id);
      } else {
        arrow.classList.add("open");
        this._expanded.add(cat.id);
      }
    });
    wrapper.append(header, list);
    return wrapper;
  }
  _refresh_all() {
    for (const cat of CATEGORIES) {
      this._refresh_category(cat.id);
    }
  }
  _refresh_category(cat_id) {
    const list = this._category_els.get(cat_id);
    if (!list || !this._state) return;
    list.innerHTML = "";
    const resources = this._state.resources[cat_id];
    for (const name of Object.keys(resources).sort()) {
      list.appendChild(this._build_item(cat_id, name));
    }
  }
  _build_item(cat_id, name) {
    const row = document.createElement("div");
    row.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:22px; padding:0 6px 0 28px;
            cursor:pointer;
        `;
    row.style.userSelect = "none";
    const icon_el = this._make_item_icon(cat_id, name);
    const label = document.createElement("span");
    label.textContent = name;
    label.style.cssText = "flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;";
    const del_btn = _text_btn("\xD7", "Delete", (e) => {
      e.stopPropagation();
      this.on_delete_resource(cat_id, name);
    });
    del_btn.style.display = "none";
    row.append(icon_el, label, del_btn);
    row.addEventListener("mouseenter", () => {
      del_btn.style.display = "";
      row.style.background = "var(--sw-select-bg)";
    });
    row.addEventListener("mouseleave", () => {
      del_btn.style.display = "none";
      row.style.background = "";
    });
    row.addEventListener("dblclick", () => {
      const event = new CustomEvent("sw:open_resource", {
        bubbles: true,
        detail: { category: cat_id, name }
      });
      document.dispatchEvent(event);
    });
    return row;
  }
  /**
   * Creates the icon element for an item row.
   * Sprites: a 16×16 canvas showing the first frame thumbnail.
   * All others: a span with the category glyph.
   */
  _make_item_icon(cat_id, name) {
    const cat_def = CATEGORIES.find((c) => c.id === cat_id);
    if (cat_id === "sprites" && this._state) {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      canvas.style.cssText = "width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;";
      const load_thumbnail = async () => {
        try {
          const meta_text = await project_read_file(`sprites/${name}/meta.json`);
          const meta = JSON.parse(meta_text);
          if (meta.frames && meta.frames.length > 0) {
            const first_frame = meta.frames[0];
            const frame_name = typeof first_frame === "string" ? first_frame : first_frame.name;
            const img_url = await project_read_binary_url(`sprites/${name}/${frame_name}`);
            const img = new Image();
            img.onload = () => {
              const ctx = canvas.getContext("2d");
              ctx.clearRect(0, 0, 16, 16);
              ctx.drawImage(img, 0, 0, 16, 16);
            };
            img.src = img_url;
          } else {
            _draw_placeholder(canvas);
          }
        } catch {
          _draw_placeholder(canvas);
        }
      };
      load_thumbnail();
      return canvas;
    }
    if (cat_id === "backgrounds" && this._state) {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      canvas.style.cssText = "width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;";
      const load_thumbnail = async () => {
        try {
          const meta_text = await project_read_file(`backgrounds/${name}/meta.json`);
          const meta = JSON.parse(meta_text);
          if (meta.file_name) {
            const img_url = await project_read_binary_url(`backgrounds/${name}/${meta.file_name}`);
            const img = new Image();
            img.onload = () => {
              const ctx = canvas.getContext("2d");
              ctx.clearRect(0, 0, 16, 16);
              ctx.drawImage(img, 0, 0, 16, 16);
            };
            img.src = img_url;
          } else {
            _draw_placeholder(canvas);
          }
        } catch {
          _draw_placeholder(canvas);
        }
      };
      load_thumbnail();
      return canvas;
    }
    const span = document.createElement("span");
    span.className = "sw-tree-item-glyph";
    span.textContent = cat_def.glyph;
    return span;
  }
};
function _text_btn(char, title, cb) {
  const btn = document.createElement("button");
  btn.className = "sw-tree-btn";
  btn.title = title;
  btn.textContent = char;
  btn.addEventListener("click", cb);
  return btn;
}
function _draw_placeholder(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = 4;
  for (let y = 0; y < canvas.height; y += size) {
    for (let x = 0; x < canvas.width; x += size) {
      ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#555" : "#333";
      ctx.fillRect(x, y, size, size);
    }
  }
}

// packages/ide/src/services/undo.ts
var _stack = [];
var _cursor = -1;
var MAX = 100;
function undo_push(cmd) {
  _stack.splice(_cursor + 1);
  _stack.push(cmd);
  if (_stack.length > MAX) _stack.shift();
  _cursor = _stack.length - 1;
  cmd.execute();
}
function undo_undo() {
  if (_cursor < 0) return false;
  _stack[_cursor].unexecute();
  _cursor--;
  return true;
}
function undo_redo() {
  if (_cursor >= _stack.length - 1) return false;
  _cursor++;
  _stack[_cursor].execute();
  return true;
}
function undo_clear() {
  _stack.length = 0;
  _cursor = -1;
}

// packages/ide/src/panels/breakpoint_manager.ts
var _breakpoints = /* @__PURE__ */ new Map();
var _editors = /* @__PURE__ */ new Map();
var _decorations = /* @__PURE__ */ new Map();
var _hit_listeners = [];
var _listener_attached = false;
function bp_register_editor(file, editor) {
  _editors.set(file, editor);
  _sync_decorations(file);
  _ensure_listener();
}
function bp_unregister_editor(file) {
  _editors.delete(file);
  _decorations.delete(file);
}
function bp_toggle(file, line) {
  if (!_breakpoints.has(file)) _breakpoints.set(file, /* @__PURE__ */ new Set());
  const lines = _breakpoints.get(file);
  if (lines.has(line)) lines.delete(line);
  else lines.add(line);
  if (lines.size === 0) _breakpoints.delete(file);
  _sync_decorations(file);
  _broadcast();
}
function bp_get_all() {
  const result = [];
  for (const [file, lines] of _breakpoints) {
    for (const line of lines) result.push({ file, line });
  }
  return result;
}
function bp_resume() {
  _send_to_iframe({ type: "sw:resume" });
}
function bp_on_hit(cb) {
  _hit_listeners.push(cb);
  _ensure_listener();
}
function _sync_decorations(file) {
  const editor = _editors.get(file);
  if (!editor) return;
  const lines = _breakpoints.get(file) ?? /* @__PURE__ */ new Set();
  const new_decorations = Array.from(lines).map((line) => ({
    range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
    options: {
      isWholeLine: true,
      glyphMarginClassName: "sw-bp-glyph",
      glyphMarginHoverMessage: { value: `Breakpoint at line ${line}` },
      className: "sw-bp-line"
    }
  }));
  const old = _decorations.get(file) ?? [];
  const updated = editor.deltaDecorations(old, new_decorations);
  _decorations.set(file, updated);
}
function _broadcast() {
  _send_to_iframe({ type: "sw:breakpoints", breakpoints: bp_get_all() });
}
function _send_to_iframe(msg) {
  const frames = document.querySelectorAll("iframe");
  for (const frame of frames) {
    try {
      frame.contentWindow?.postMessage(msg, "*");
    } catch {
    }
  }
}
function _ensure_listener() {
  if (_listener_attached) return;
  _listener_attached = true;
  window.addEventListener("message", (e) => {
    if (!e.data) return;
    if (e.data.type === "sw:break") {
      const { file, line, variables } = e.data;
      for (const cb of _hit_listeners) cb(file, line, variables ?? {});
    }
  });
}

// packages/ide/src/generated/engine_types.ts
var ENGINE_DTS = `/**
 * 3D lighting system.
 *
 * Mirrors the GMS d3d_light_* API.
 * Supports up to 8 directional and point lights, plus ambient light.
 *
 * Light data is uploaded as uniforms to 3D shader programs via
 * d3d_light_get_uniforms(), which returns a flat uniform block
 * for use with shader_set_uniform_*.
 */
declare const d3d_lighttype_directional = 0;
declare const d3d_lighttype_point = 1;
declare const MAX_LIGHTS = 8;
interface light_def {
    enabled: boolean;
    type: number;
    x: number;
    y: number;
    z: number;
    r: number;
    g: number;
    b: number;
    range: number;
}
/**
 * Enables or disables a light slot.
 * @param light_index - Light index (0\u20137)
 * @param enabled - True to enable
 */
declare function d3d_light_enable(light_index: number, enabled: boolean): void;
/**
 * Defines a directional light.
 * @param light_index - Light index (0\u20137)
 * @param dx - Direction X (world space)
 * @param dy - Direction Y
 * @param dz - Direction Z
 * @param col - BGR colour integer
 */
declare function d3d_light_define_direction(light_index: number, dx: number, dy: number, dz: number, col: number): void;
/**
 * Defines a point light.
 * @param light_index - Light index (0\u20137)
 * @param x - Position X
 * @param y - Position Y
 * @param z - Position Z
 * @param range - Falloff range in world units
 * @param col - BGR colour integer
 */
declare function d3d_light_define_point(light_index: number, x: number, y: number, z: number, range: number, col: number): void;
/**
 * Sets the ambient light colour.
 * @param col - BGR colour integer
 */
declare function d3d_light_set_ambient(col: number): void;
/**
 * Returns a flat object of uniform values for uploading to a 3D shader.
 * The shader is expected to declare:
 *   uniform vec3  u_ambient;
 *   uniform int   u_light_count;
 *   uniform int   u_light_types[8];
 *   uniform vec3  u_light_pos[8];   // direction for directional lights
 *   uniform vec3  u_light_color[8];
 *   uniform float u_light_range[8];
 */
declare function d3d_light_get_uniforms(): {
    ambient: Float32Array;
    count: number;
    types: Int32Array;
    positions: Float32Array;
    colors: Float32Array;
    ranges: Float32Array;
};
/** Returns the raw light definition array for advanced use. */
declare function d3d_light_get_all(): Readonly<light_def>[];

//# sourceMappingURL=lighting_3d.d.ts.map
/**
 * 3D model system \u2014 vertex buffers for WebGL 2.
 *
 * Mirrors the GMS d3d_model_* API:
 *   d3d_model_create, d3d_model_destroy, d3d_model_draw
 *   d3d_model_primitive_begin, d3d_model_primitive_end
 *   d3d_model_vertex, d3d_model_vertex_normal, d3d_model_vertex_texture
 *   d3d_model_block, d3d_model_cylinder, d3d_model_sphere, d3d_model_cone
 *
 * Vertex format: [x, y, z, nx, ny, nz, u, v] (32 bytes per vertex)
 * Primitive types match WebGL draw modes.
 */
declare const pr_pointlist = 0;
declare const pr_linelist = 1;
declare const pr_linestrip = 2;
declare const pr_trianglelist = 4;
declare const pr_trianglestrip = 5;
declare const pr_trianglefan = 6;
interface model_mesh {
    primitive: number;
    vertices: Float32Array;
    vbo: WebGLBuffer | null;
    dirty: boolean;
}
interface model_def {
    meshes: model_mesh[];
    building: boolean;
    build_prim: number;
    build_verts: number[];
}
/** Returns the raw model state for internal use by model_loader.ts. */
declare function _get_model_raw(model_id: number): model_def | undefined;
/** Creates a new empty 3D model and returns its ID. */
declare function d3d_model_create(): number;
/** Destroys a model and frees its GPU resources. */
declare function d3d_model_destroy(model_id: number): void;
/** Returns true if the model ID is valid. */
declare function d3d_model_exists(model_id: number): boolean;
/** Clears all meshes from a model. */
declare function d3d_model_clear(model_id: number): void;
/**
 * Begins recording vertices for a primitive.
 * @param model_id - Model ID
 * @param kind - pr_* primitive type
 */
declare function d3d_model_primitive_begin(model_id: number, kind: number): void;
/**
 * Finishes recording vertices and adds the mesh to the model.
 * @param model_id - Model ID
 */
declare function d3d_model_primitive_end(model_id: number): void;
/**
 * Adds a vertex at (x, y, z) using the current normal and UV.
 */
declare function d3d_model_vertex(model_id: number, x: number, y: number, z: number): void;
/**
 * Adds a vertex with an explicit normal.
 */
declare function d3d_model_vertex_normal(model_id: number, x: number, y: number, z: number, nx: number, ny: number, nz: number): void;
/**
 * Adds a vertex with UV texture coordinates and explicit normal.
 */
declare function d3d_model_vertex_texture(model_id: number, x: number, y: number, z: number, u: number, v: number): void;
/**
 * Sets the normal to use for subsequent vertices.
 */
declare function d3d_model_set_normal(nx: number, ny: number, nz: number): void;
/**
 * Sets the UV to use for subsequent vertices.
 */
declare function d3d_model_set_uv(u: number, v: number): void;
/** Adds a box (cuboid) mesh to the model. */
declare function d3d_model_block(model_id: number, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, hrepeat?: number, vrepeat?: number): void;
/**
 * Adds a sphere mesh.
 * @param model_id - Model ID
 * @param x, y, z - Centre position
 * @param r - Radius
 * @param hsteps - Horizontal subdivisions (\u22653)
 * @param vsteps - Vertical subdivisions (\u22652)
 */
declare function d3d_model_sphere(model_id: number, x: number, y: number, z: number, r: number, hsteps?: number, vsteps?: number): void;
/**
 * Draws a model using the currently active shader and transform.
 * The caller is responsible for setting up a 3D shader with the
 * u_model, u_view, u_projection uniforms before calling this.
 * @param model_id - Model ID
 * @param x, y, z - World position offset
 */
declare function d3d_model_draw(model_id: number, x?: number, y?: number, z?: number): void;

//# sourceMappingURL=model.d.ts.map
/**
 * 3D model loader \u2014 loads OBJ files into d3d models.
 *
 * Supports Wavefront OBJ format (vertices, normals, texture coordinates,
 * triangulated faces).  Does not support materials (MTL files).
 *
 * Usage:
 *   const model_id = model_load_obj(obj_source_string)
 *   d3d_model_draw(model_id, x, y, z)
 *
 * glTF loading is intentionally deferred \u2014 OBJ covers the common simple-model
 * use case and has no external dependencies.
 */
/**
 * Creates a d3d model from an OBJ source string.
 * @param obj_src - Contents of the .obj file
 * @returns Model ID
 */
declare function model_load_obj(obj_src: string): number;
/**
 * Fetches an OBJ file from a URL and returns a model ID.
 * @param url - URL of the .obj file
 * @returns Promise resolving to model ID, or -1 on failure
 */
declare function model_load_obj_url(url: string): Promise<number>;
//# sourceMappingURL=model_loader.d.ts.map
/**
 * 3D transform matrix stack.
 *
 * Mirrors the GMS d3d_transform_* API.
 * Matrices are column-major Float32Array (matches WebGL layout).
 *
 * The transform stack is used when drawing 3D models.
 * The current transform (top of stack) is applied as a model matrix.
 */
type mat4 = Float32Array;
/** Returns a 4\xD74 identity matrix. */
declare function mat4_identity(): mat4;
/** Multiplies two 4\xD74 column-major matrices: result = a * b. */
declare function mat4_mul(a: mat4, b: mat4): mat4;
/** Returns a translation matrix. */
declare function mat4_translate(tx: number, ty: number, tz: number): mat4;
/** Returns a uniform scale matrix. */
declare function mat4_scale(sx: number, sy: number, sz: number): mat4;
/** Returns a rotation matrix around the X axis (angle in degrees). */
declare function mat4_rotate_x(deg: number): mat4;
/** Returns a rotation matrix around the Y axis (angle in degrees). */
declare function mat4_rotate_y(deg: number): mat4;
/** Returns a rotation matrix around the Z axis (angle in degrees). */
declare function mat4_rotate_z(deg: number): mat4;
/** Returns a perspective projection matrix. */
declare function mat4_perspective(fov_deg: number, aspect: number, near: number, far: number): mat4;
/** Returns a look-at view matrix. */
declare function mat4_look_at(ex: number, ey: number, ez: number, tx: number, ty: number, tz: number, ux: number, uy: number, uz: number): mat4;
/** Returns an orthographic projection matrix. */
declare function mat4_ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4;
/** Returns the current model matrix (top of stack). */
declare function d3d_transform_get(): mat4;
/** Resets the current transform to identity. */
declare function d3d_transform_set_identity(): void;
/**
 * Sets the transform to a translation.
 * @param x - X translation
 * @param y - Y translation
 * @param z - Z translation
 */
declare function d3d_transform_set_translation(x: number, y: number, z: number): void;
/**
 * Sets the transform to a scale.
 * @param sx - X scale
 * @param sy - Y scale
 * @param sz - Z scale
 */
declare function d3d_transform_set_scaling(sx: number, sy: number, sz: number): void;
/**
 * Sets the transform to a rotation around an axis.
 * @param xa - X component of rotation axis
 * @param ya - Y component of rotation axis
 * @param za - Z component of rotation axis
 * @param deg - Angle in degrees
 */
declare function d3d_transform_set_rotation(xa: number, ya: number, _za: number, deg: number): void;
/** Adds a translation to the current transform. */
declare function d3d_transform_add_translation(x: number, y: number, z: number): void;
/** Adds a scaling to the current transform. */
declare function d3d_transform_add_scaling(sx: number, sy: number, sz: number): void;
/** Adds a rotation around the X axis. */
declare function d3d_transform_add_rotation_x(deg: number): void;
/** Adds a rotation around the Y axis. */
declare function d3d_transform_add_rotation_y(deg: number): void;
/** Adds a rotation around the Z axis. */
declare function d3d_transform_add_rotation_z(deg: number): void;
/** Pushes the current transform onto the stack (save state). */
declare function d3d_transform_stack_push(): void;
/** Pops the transform stack (restore state). */
declare function d3d_transform_stack_pop(): void;
/** Clears the stack back to a single identity matrix. */
declare function d3d_transform_stack_clear(): void;
//# sourceMappingURL=transform_3d.d.ts.map
/**
 * 3D / spatial audio utilities.
 *
 * Wraps the Web Audio API PannerNode for positional audio.
 * Uses a simple 2D model: listener sits at (lx, ly, 0), sounds at (sx, sy, 0).
 * Distance-based attenuation follows the inverse-distance rolloff model.
 *
 * Usage:
 *   audio_set_listener_position(view_x + view_w/2, view_y + view_h/2)
 *   const inst = audio_play_sound_at(asset, x, y)
 */

/**
 * A sound_instance with an attached PannerNode for 3D positioning.
 */
declare class spatial_sound_instance {
    readonly instance: sound_instance;
    private _panner;
    constructor(panner: PannerNode, inst: sound_instance);
    /**
     * Updates the world-space position of this sound source.
     * @param x - World X position
     * @param y - World Y position
     */
    set_position(x: number, y: number): void;
    /** Stops playback. */
    stop(): void;
    /** Returns true if currently playing. */
    get is_playing(): boolean;
}
/**
 * Sets the listener position in world space.
 * Should be updated each step to match the camera/view centre.
 * @param x - World X of the listener
 * @param y - World Y of the listener
 */
declare function audio_set_listener_position(x: number, y: number): void;
/**
 * Plays a sound with 3D positional audio at a world-space location.
 * @param asset - Sound asset to play
 * @param x - World X position of the sound source
 * @param y - World Y position of the sound source
 * @param ref_distance - Distance at which volume starts attenuating (default 100)
 * @param max_distance - Distance at which volume reaches minimum (default 1000)
 * @param loop - Whether to loop
 * @returns spatial_sound_instance handle
 */
declare function audio_play_sound_at(asset: sound_asset, x: number, y: number, ref_distance?: number, max_distance?: number, loop?: boolean): spatial_sound_instance;
/**
 * Updates an existing spatial sound instance's world position.
 * Call each step if the sound source is moving.
 * @param inst - The spatial_sound_instance to update
 * @param x - New world X
 * @param y - New world Y
 */
declare function audio_set_sound_position(inst: spatial_sound_instance, x: number, y: number): void;
/** Returns the current listener X position. */
declare function audio_get_listener_x(): number;
/** Returns the current listener Y position. */
declare function audio_get_listener_y(): number;
//# sourceMappingURL=audio_3d.d.ts.map
/**
 * Audio groups \u2014 named gain buses that sounds can be assigned to.
 *
 * Each group has its own GainNode that sits between sound sources
 * and the master gain node:
 *   source \u2192 group gain \u2192 master gain \u2192 destination
 *
 * Groups are created on first use and never destroyed.
 */

/**
 * A named audio bus with an independent gain level.
 */
declare class audio_group extends resource {
    readonly group_name: string;
    private _gain_node;
    /**
     * @param group_name - Unique name for this audio group
     */
    constructor(group_name: string);
    /**
     * Returns the GainNode for this group, creating it if necessary.
     * Lazily initialised so it can be constructed before audio_system.init().
     */
    get gain_node(): GainNode;
    /**
     * Sets the gain (volume) for this group.
     * @param gain - Volume level (0 = silent, 1 = full)
     */
    set_gain(gain: number): void;
    /** Returns the current gain for this group. */
    get_gain(): number;
    /**
     * Stops all sounds in this group by disconnecting and reconnecting
     * the gain node. Individual sound tracking is handled by sound_instance.
     * This is a volume-only group; stopping is done via the sound registry.
     */
    stop_all(): void;
}
/**
 * Registers the callback used by audio_group.stop_all() to stop live instances.
 * Called once by sound.ts after module initialisation.
 * @param cb - Function that stops all instances in a named group
 */
declare function set_stop_group_callback(cb: (group_name: string) => void): void;
/**
 * Returns or creates an audio group with the given name.
 * @param name - Group name
 */
declare function get_or_create_group(name: string): audio_group;
/**
 * Sets the gain for a named audio group.
 * @param group_name - Group name
 * @param gain - Volume level (0\u20131)
 */
declare function audio_group_set_gain(group_name: string, gain: number): void;
/**
 * Returns the current gain for a named audio group.
 * @param group_name - Group name
 */
declare function audio_group_get_gain(group_name: string): number;
/**
 * Stops all sounds in a named audio group.
 * @param group_name - Group name
 */
declare function audio_group_stop(group_name: string): void;
//# sourceMappingURL=audio_group.d.ts.map
/**
 * Core Web Audio API context and graph management.
 *
 * All audio passes through:
 *   source \u2192 group gain \u2192 master gain \u2192 AudioContext.destination
 *
 * Call audio_system.init() once before playing any sounds.
 * The context starts suspended on many browsers until a user gesture;
 * audio_system.resume() should be called in any user-input handler.
 */
/**
 * Central audio context and master gain node.
 */
declare class audio_system {
    private static _ctx;
    private static _master;
    /**
     * Initialises the Web Audio context and master gain node.
     * Safe to call multiple times \u2014 only initialises once.
     */
    static init(): void;
    /**
     * Resumes the AudioContext after a user gesture.
     * Browsers suspend audio until user interaction occurs.
     */
    static resume(): Promise<void>;
    /**
     * Returns the shared AudioContext.
     * Throws if init() has not been called.
     */
    static get ctx(): AudioContext;
    /**
     * Returns the master GainNode.
     * Throws if init() has not been called.
     */
    static get master(): GainNode;
    /** Returns true if the audio system has been initialised. */
    static get is_ready(): boolean;
    /**
     * Sets the master gain (volume) for all audio.
     * @param gain - Volume level (0 = silent, 1 = full)
     */
    static set_master_gain(gain: number): void;
    /** Returns the current master gain level. */
    static get_master_gain(): number;
    /**
     * Returns the current AudioContext time in seconds.
     * Used for precise scheduling.
     */
    static get current_time(): number;
}
//# sourceMappingURL=audio_system.d.ts.map
/**
 * Sound resource and playback management.
 *
 * A \`sound_asset\` holds a decoded AudioBuffer (loaded from a URL or ArrayBuffer).
 * Playing a sound creates a \`sound_instance\` (AudioBufferSourceNode + GainNode).
 *
 * Sound instances are fire-and-forget by default. Retaining the returned
 * instance ID allows stopping, pausing, or changing volume mid-play.
 *
 * Routing: source \u2192 instance gain \u2192 group gain \u2192 master gain \u2192 destination
 */

/**
 * A decoded audio asset that can be played one or more times.
 */
declare class sound_asset extends resource {
    buffer: AudioBuffer | null;
    loop: boolean;
    group_name: string;
    /**
     * Loads a sound from a URL, decoding it into an AudioBuffer.
     * @param url - URL to an audio file (mp3, ogg, wav, etc.)
     * @param group_name - Audio group to assign this sound to
     * @param loop - Whether to loop by default
     * @returns Promise that resolves when decoding is complete
     */
    load_url(url: string, group_name?: string, loop?: boolean): Promise<void>;
    /**
     * Loads a sound from a pre-fetched ArrayBuffer.
     * @param array_buf - Raw audio data
     * @param group_name - Audio group
     * @param loop - Whether to loop by default
     */
    load_buffer(array_buf: ArrayBuffer, group_name?: string, loop?: boolean): Promise<void>;
}
/**
 * A live playback of a sound_asset.
 * Returned by audio_play_sound(); pass the ID to stop/query.
 */
declare class sound_instance {
    readonly instance_id: number;
    private _source;
    private _gain;
    private _playing;
    private _on_ended;
    constructor(source: AudioBufferSourceNode, gain: GainNode);
    /** Stops playback immediately. */
    stop(): void;
    /**
     * Sets the gain for this specific playback instance.
     * @param gain - Volume level (0\u20131)
     */
    set_gain(gain: number): void;
    /** Returns the current instance gain. */
    get_gain(): number;
    /**
     * Sets the playback pitch as a speed multiplier.
     * 1.0 = normal, 2.0 = one octave up, 0.5 = one octave down.
     * @param pitch - Playback rate multiplier
     */
    set_pitch(pitch: number): void;
    /** Returns true if this instance is still playing. */
    get is_playing(): boolean;
    /**
     * Registers a callback invoked when the sound ends naturally (not on stop()).
     * @param cb - Callback function
     */
    on_ended(cb: () => void): void;
}
/**
 * Registers a sound_instance in the global instance registry.
 * Used by external modules (e.g. audio_3d) that construct instances directly.
 * @param inst - The instance to register
 * @param group_name - The audio group this instance belongs to
 */
declare function register_instance(inst: sound_instance, group_name?: string): void;
/**
 * Plays a sound asset and returns a sound_instance for control.
 * @param asset - The sound asset to play
 * @param loop - Override loop setting (defaults to asset.loop)
 * @param gain - Initial volume (0\u20131, defaults to 1)
 * @param pitch - Playback rate multiplier (defaults to 1)
 * @returns The live sound_instance handle
 */
declare function play_sound(asset: sound_asset, loop?: boolean, gain?: number, pitch?: number): sound_instance;
/**
 * Plays a sound asset.
 * @param asset - Sound to play
 * @param loop - Whether to loop
 * @param priority - Ignored (GMS API parity only)
 * @returns sound_instance handle
 */
declare function audio_play_sound(asset: sound_asset, loop?: boolean, priority?: number): sound_instance;
/**
 * Stops a specific sound instance.
 * @param inst - The sound_instance returned by audio_play_sound
 */
declare function audio_stop_sound(inst: sound_instance): void;
/**
 * Stops all currently playing sounds.
 */
declare function audio_stop_all(): void;
/**
 * Returns true if the given sound instance is currently playing.
 * @param inst - The sound_instance to query
 */
declare function audio_is_playing(inst: sound_instance): boolean;
/**
 * Sets the gain for a specific sound instance.
 * @param inst - The sound_instance
 * @param gain - Volume level (0\u20131)
 */
declare function audio_sound_gain(inst: sound_instance, gain: number): void;
/**
 * Sets the pitch for a specific sound instance.
 * @param inst - The sound_instance
 * @param pitch - Playback rate multiplier (1 = normal)
 */
declare function audio_sound_pitch(inst: sound_instance, pitch: number): void;
/**
 * Sets the master gain for all audio.
 * @param gain - Volume level (0\u20131)
 */
declare function audio_set_master_gain(gain: number): void;
/**
 * Returns the current master gain.
 */
declare function audio_get_master_gain(): number;
//# sourceMappingURL=sound.d.ts.map
/**
 * Collision detection system.
 *
 * Supports two mask types:
 *   - Rectangle (AABB) \u2014 axis-aligned bounding box
 *   - Circle  \u2014 circle based on bbox dimensions
 *
 * All functions operate on instance objects directly.
 * "Precise" (per-pixel) collision is deferred to a later phase.
 */

declare const MASK_RECT = 0;
declare const MASK_CIRCLE = 1;
declare const MASK_ELLIPSE = 2;
/**
 * Returns the axis-aligned bounding box for an instance at a given position.
 * Uses the instance's sprite dimensions and origin, or falls back to a 1\xD71 box.
 *
 * @param inst - The instance
 * @param x - Override X position (defaults to inst.x)
 * @param y - Override Y position (defaults to inst.y)
 * @returns { left, top, right, bottom }
 */
declare function get_bbox(inst: instance, x?: number, y?: number): {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
/**
 * Updates the cached bbox_* properties on an instance.
 * Called internally by the collision system and by internal_step.
 * @param inst - The instance to update
 */
declare function update_bbox(inst: instance): void;
declare function bbox_overlap(a_left: number, a_top: number, a_right: number, a_bottom: number, b_left: number, b_top: number, b_right: number, b_bottom: number): boolean;
declare function circles_overlap(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean;
/**
 * Returns true if instance a overlaps instance b at the given position for a.
 * @param a - The querying instance
 * @param ax - Override X for a
 * @param ay - Override Y for a
 * @param b - The target instance
 * @returns True if the instances overlap
 */
declare function instances_collide(a: instance, ax: number, ay: number, b: instance): boolean;
/**
 * Returns true if a point overlaps instance b's bounding box.
 * @param px - Point X
 * @param py - Point Y
 * @param b - Target instance
 * @returns True if the point is inside b's bounding box
 */
declare function point_in_instance(px: number, py: number, b: instance): boolean;
/**
 * Returns true if a rectangle overlaps instance b's bounding box.
 * @param rx1 - Rectangle left
 * @param ry1 - Rectangle top
 * @param rx2 - Rectangle right
 * @param ry2 - Rectangle bottom
 * @param b - Target instance
 * @returns True if the rectangle overlaps b
 */
declare function rect_in_instance(rx1: number, ry1: number, rx2: number, ry2: number, b: instance): boolean;
/**
 * Returns true if a circle overlaps instance b's bounding box (uses AABB approximation).
 * @param cx - Circle center X
 * @param cy - Circle center Y
 * @param cr - Circle radius
 * @param b - Target instance
 * @returns True if they overlap
 */
declare function circle_in_instance(cx: number, cy: number, cr: number, b: instance): boolean;
/**
 * Returns true if a line segment crosses instance b's bounding box.
 * @param x1 - Segment start X
 * @param y1 - Segment start Y
 * @param x2 - Segment end X
 * @param y2 - Segment end Y
 * @param b - Target instance
 */
declare function line_in_instance(x1: number, y1: number, x2: number, y2: number, b: instance): boolean;

//# sourceMappingURL=collision.d.ts.map
/**
 * Enum of all supported event types in the game loop.
 */
declare enum EVENT_TYPE {
    none = "NONE",// Default/unset event type
    create = "CREATE",// Runs once when instance is created
    destroy = "DESTROY",// Runs once when instance is destroyed
    step_begin = "STEP_BEGIN",// Runs at the start of each step
    step = "STEP",// Main step event, runs every frame
    step_end = "STEP_END",// Runs at the end of each step
    collision = "COLLISION",// Runs when collision is detected
    keyboard = "KEYBOARD",// Runs on keyboard input
    mouse = "MOUSE",// Runs on mouse input
    other = "OTHER",// Miscellaneous events (room start/end, etc.)
    async = "ASYNC",// Async callback events (HTTP, networking)
    draw = "DRAW",// Main draw event
    draw_gui = "DRAW_GUI"
}
/**
 * Wrapper class for an event function and its type.
 */
declare class game_event {
    event: Function;
    type: EVENT_TYPE;
    /**
     * Creates a new game event.
     * @param event - The function to call when the event fires
     * @param type - The event type category
     */
    constructor(event?: Function, type?: EVENT_TYPE);
    /**
     * Executes the event function.
     */
    run(): void;
}
//# sourceMappingURL=game_event.d.ts.map

/**
 * Registers frame begin/end callbacks from the renderer.
 * Must be called from renderer.init() before the loop starts.
 */
declare function set_frame_hooks(begin: () => void, end: () => void): void;
/**
 * Core game loop that handles update and draw cycles.
 * Uses a fixed timestep for updates and runs drawing once per frame.
 */
declare abstract class game_loop {
    private static room_speed;
    private static room_delta;
    private static last_delta;
    private static accumulator;
    static room: room;
    static room_first: number;
    static room_last: number;
    private static _canvas;
    private static _pending_game_start;
    private static _pending_room_start;
    private static _stopped;
    private static update_events;
    private static draw_events;
    /**
     * Attaches input systems to the given canvas.
     * Must be called before start() if mouse or touch input is needed.
     * @param canvas - The game canvas element
     */
    static init_input(canvas: HTMLCanvasElement): void;
    /**
     * Starts the game loop.
     * Initializes timing values and begins the requestAnimationFrame cycle.
     */
    static start(room?: room): void;
    /**
     * Main loop tick called every frame by requestAnimationFrame.
     * Handles timing, runs fixed timestep updates, and draws once per frame.
     * @param current - The current timestamp provided by requestAnimationFrame
     */
    private static tick;
    /**
     * Runs all update events in GMS order.
     * Create and destroy events run once and are cleared after execution.
     * Input polling happens before events; end_step clears edge-trigger state after.
     */
    private static update;
    /**
     * Runs all draw events in GMS order.
     * Called once per frame after all updates have completed.
     * begin_frame clears the canvas; end_frame flushes the batch.
     */
    private static draw;
    /**
     * Registers a function to be called for a specific event type.
     * @param event - The event type to register for
     * @param func - The function to call when the event fires
     */
    static register(event: EVENT_TYPE, func: Function): void;
    /**
     * Unregisters a function from a specific event type.
     * @param event - The event type to unregister from
     * @param func - The function to remove
     */
    static unregister(event: EVENT_TYPE, func: Function): void;
    /**
     * Transitions to a new room, clearing current events and loading the new room's state.
     * @param room - The room to transition to
     */
    static change_room(room: room): void;
    /**
     * Ends the game: fires the Game End event for all instances, then halts the loop.
     */
    static end(): void;
    /**
     * Restarts the game by returning to the first room.
     */
    static restart(): void;
    /**
     * Calls a lifecycle event method on every active instance in the current room.
     * @param method - Name of the lifecycle method to invoke
     */
    private static _dispatch_lifecycle;
}
/** Ends the game: fires Game End events, then stops the loop. */
declare function game_end(): void;
/** Restarts the game from the first room. */
declare function game_restart(): void;
//# sourceMappingURL=game_loop.d.ts.map
/**
 * GMObject \u2014 base class for all game object definitions.
 *
 * A GMObject is a *blueprint* (like a class definition). It is not placed
 * in a room directly \u2014 the engine creates instances of it via instance_create().
 * Developers subclass GMObject to define their game objects and override
 * lifecycle methods (on_create, on_step, on_draw, etc.) from the instance class.
 *
 * Relationship:
 *   GMObject subclass  \u2192  instance_create()  \u2192  instance (lives in a room)
 *
 * The instance class already implements all instance behaviour. GMObject adds
 * the object-level metadata (default sprite, parent, name) that is shared
 * across all instances of a type.
 */

/**
 * Base class for all game objects.
 * Extend this to define a new object type. Override lifecycle methods as needed.
 */
declare abstract class gm_object extends instance {
    /** Default sprite for instances of this object (can be overridden per-instance). */
    static default_sprite: sprite | null;
    /** Parent object class for inheritance queries (null = no parent). */
    static parent: typeof gm_object | null;
    /** Human-readable object name. Defaults to the class name. */
    static object_name: string;
    static solid: boolean;
    static visible: boolean;
    static persistent: boolean;
    static depth: number;
    static sprite: string | null;
    /**
     * Applies this object's static metadata defaults to the new instance.
     * @param room - The room this instance belongs to
     */
    constructor(room: room);
    /**
     * Returns the object name. Falls back to the constructor name if not set.
     */
    static get_name(): string;
    /**
     * Checks whether this object type is an ancestor (direct or indirect) of another.
     * @param child - The object type to test
     * @returns True if this class is somewhere in child's prototype chain
     */
    static is_ancestor_of(child: typeof gm_object): boolean;
    /**
     * Called once when the instance is created. Override in subclasses.
     */
    on_create(): void;
}
/**
 * Checks whether the given object class has been defined (is non-null).
 * In this engine, all imported object classes exist; this is a compatibility stub.
 * @param obj - Object class to check
 * @returns Always true for a valid class reference
 */
declare function object_exists(obj: typeof gm_object | null | undefined): boolean;
/**
 * Returns the name of an object class.
 * @param obj - Object class
 * @returns The object's name string
 */
declare function object_get_name(obj: typeof gm_object): string;
/**
 * Returns the default sprite of an object class, or null if none.
 * @param obj - Object class
 * @returns Default sprite or null
 */
declare function object_get_sprite(obj: typeof gm_object): sprite | null;
/**
 * Returns the parent class of an object, or null if it has no parent.
 * @param obj - Object class
 * @returns Parent class or null
 */
declare function object_get_parent(obj: typeof gm_object): typeof gm_object | null;
/**
 * Checks whether obj is a descendant of parent (i.e., parent is an ancestor of obj).
 * @param obj - Object to test
 * @param parent - Potential ancestor
 * @returns True if parent is an ancestor of obj
 */
declare function object_is_ancestor(obj: typeof gm_object, parent: typeof gm_object): boolean;
//# sourceMappingURL=gm_object.d.ts.map

/**
 * A draw_sprite_ext function reference injected at engine startup to avoid
 * circular imports between instance.ts (core) and renderer.ts (drawing).
 * Set by calling set_draw_sprite_ext() from renderer.init().
 */
declare let _renderer_draw_sprite_ext: ((spr: sprite, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number) => void) | null;
/**
 * Called by renderer.init() to register the draw_sprite_ext function.
 * Must be called before the game loop starts for draw_self() to work.
 * @param fn - The renderer's draw_sprite_ext method
 */
declare function set_draw_sprite_ext(fn: typeof _renderer_draw_sprite_ext): void;
/**
 * Base class for all game object instances.
 * Instances exist within rooms and can have events, properties, and behaviors.
 */
declare class instance extends resource {
    [key: string]: any;
    room: room;
    x: number;
    y: number;
    xprevious: number;
    yprevious: number;
    xstart: number;
    ystart: number;
    hspeed: number;
    vspeed: number;
    speed: number;
    direction: number;
    friction: number;
    gravity: number;
    gravity_direction: number;
    sprite_index: number;
    image_index: number;
    image_speed: number;
    image_xscale: number;
    image_yscale: number;
    image_angle: number;
    image_alpha: number;
    image_blend: number;
    depth: number;
    visible: boolean;
    mask_index: number;
    solid: boolean;
    persistent: boolean;
    active: boolean;
    /** Countdown timers (GMS alarm[0..11]). -1 = inactive; set to N to fire on_alarm(i) after N steps. */
    alarm: number[];
    /** Set once instance_destroy() runs, so the rest of the current step is skipped. */
    private _destroyed;
    bbox_left: number;
    bbox_top: number;
    bbox_right: number;
    bbox_bottom: number;
    mask_manual: boolean;
    mask_off_left: number;
    mask_off_top: number;
    mask_off_right: number;
    mask_off_bottom: number;
    private _bound_step_begin;
    private _bound_step;
    private _bound_step_end;
    private _bound_draw;
    private _bound_draw_gui;
    /**
     * Creates a new instance in the specified room.
     * @param room - The room this instance will belong to
     */
    constructor(room: room);
    /**
     * Creates a new instance of an object at the specified position.
     * @param x - X position for the new instance
     * @param y - Y position for the new instance
     * @param obj - The object class to instantiate
     * @returns The newly created instance
     */
    static instance_create(x: number, y: number, obj: typeof instance): instance;
    /**
     * Creates a new instance at the specified position with an explicit depth.
     * @param x - X position
     * @param y - Y position
     * @param depth - Drawing depth
     * @param obj - The object class to instantiate
     * @returns The newly created instance
     */
    static instance_create_depth(x: number, y: number, depth: number, obj: typeof instance): instance;
    /**
     * Destroys this instance, removing it from the room.
     * Queues the destroy event to run at the end of the current step.
     */
    instance_destroy(): void;
    /**
     * Destroys an instance by its numeric ID.
     * @param id - ID of the instance to destroy
     */
    static instance_destroy_id(id: number): void;
    /**
     * Registers this instance's event handlers with the game loop.
     */
    register_events(): void;
    /**
     * Unregisters this instance's event handlers from the game loop.
     */
    private unregister_events;
    /**
     * Internal step: alarms, input events, physics, animation, bbox, collision
     * events, then on_step(). Bails out early if an event destroys the instance.
     */
    private internal_step;
    /** Decrements active alarms; fires on_alarm(i) when one reaches zero. */
    private _process_alarms;
    /** Fires keyboard and mouse-over-instance events for this step. */
    private _process_input_events;
    /** Advances the sprite animation, firing on_animation_end() on each loop. */
    private _advance_animation;
    /** Fires on_collision(other) for each instance this one overlaps (collision-event objects only). */
    private _process_collisions;
    /**
     * Internal draw: skips hidden instances, then calls on_draw().
     * If on_draw() has not been overridden, draws the current sprite automatically.
     */
    private internal_draw;
    /**
     * Checks if an instance with the given ID exists.
     * @param id - The instance ID to check
     * @returns True if the instance exists
     */
    static instance_exists(id: number): boolean;
    /**
     * Finds an instance by its ID.
     * @param id - The instance ID to find
     * @returns The instance, or undefined if not found
     */
    static instance_find(id: number): instance | undefined;
    /**
     * Returns the number of active instances of a given object class in the current room.
     * @param obj - Object class to count
     * @returns Instance count
     */
    static instance_number(obj: typeof instance): number;
    /**
     * Finds the nth instance of a given object class in the current room (0-indexed).
     * @param obj - Object class to search for
     * @param n - Zero-based index
     * @returns The instance, or undefined if not found
     */
    static instance_find_nth(obj: typeof instance, n: number): instance | undefined;
    /**
     * Finds the first instance of a given object class at a specific position.
     * @param x - X position to test
     * @param y - Y position to test
     * @param obj - Object class to check
     * @returns The instance at that position, or undefined
     */
    static instance_position(x: number, y: number, obj: typeof instance): instance | undefined;
    /**
     * Returns the nearest instance of obj to a given point.
     * @param x - Reference X
     * @param y - Reference Y
     * @param obj - Object class to search
     * @returns Nearest instance, or undefined if none exist
     */
    static instance_nearest(x: number, y: number, obj: typeof instance): instance | undefined;
    /**
     * Returns the furthest instance of obj from a given point.
     * @param x - Reference X
     * @param y - Reference Y
     * @param obj - Object class to search
     * @returns Furthest instance, or undefined if none exist
     */
    static instance_furthest(x: number, y: number, obj: typeof instance): instance | undefined;
    /**
     * Deactivates all instances (optionally excluding self).
     * Deactivated instances are skipped in step and draw.
     * @param not_me - If true, this instance is excluded from deactivation
     */
    instance_deactivate_all(not_me?: boolean): void;
    /**
     * Deactivates all instances of a specific object class.
     * @param obj - Object class to deactivate
     */
    static instance_deactivate_object(obj: typeof instance): void;
    /**
     * Activates all instances in the current room.
     */
    static instance_activate_all(): void;
    /**
     * Activates all instances of a specific object class.
     * @param obj - Object class to activate
     */
    static instance_activate_object(obj: typeof instance): void;
    /**
     * Checks if this instance would collide with any instance of obj at position (x, y).
     * Does not move the instance.
     * @param x - X position to test
     * @param y - Y position to test
     * @param obj - Object class to check against
     * @returns True if a collision would occur
     */
    place_meeting(x: number, y: number, obj: typeof instance): boolean;
    /**
     * Checks if position (x, y) is free of solid instances.
     * @param x - X position to test
     * @param y - Y position to test
     * @returns True if no solid instances occupy that position
     */
    place_free(x: number, y: number): boolean;
    /**
     * Checks if position (x, y) is completely empty (no instances of any kind).
     * @param x - X position to test
     * @param y - Y position to test
     * @returns True if no instances occupy that position
     */
    place_empty(x: number, y: number): boolean;
    /**
     * Like place_meeting, but returns the first instance collided with at (x, y),
     * or undefined if none.
     * @param x - X position to test
     * @param y - Y position to test
     * @param obj - Object class to check against (pass the base \`instance\` for "all")
     */
    instance_place(x: number, y: number, obj: typeof instance): instance | undefined;
    /**
     * Sets a manual rectangular collision mask, as offsets from the instance
     * origin (x, y). Use this for spriteless objects so collision functions work.
     * @param left - Left offset from x
     * @param top - Top offset from y
     * @param right - Right offset from x
     * @param bottom - Bottom offset from y
     */
    mask_set_rectangle(left: number, top: number, right: number, bottom: number): void;
    /**
     * Convenience: sets a manual width\xD7height mask with its top-left at the origin.
     * @param width - Mask width
     * @param height - Mask height
     */
    mask_set_size(width: number, height: number): void;
    /** Removes the manual mask, reverting to the sprite/mask_index-derived bbox. */
    mask_clear(): void;
    /**
     * Moves the instance by the given amount, stopping when it hits a solid.
     * @param hspd - Horizontal movement
     * @param vspd - Vertical movement
     * @returns True if the movement was blocked by a solid
     */
    move_contact_solid(hspd: number, vspd: number): boolean;
    /**
     * Wraps the instance around the room edges.
     * @param hor - Wrap horizontally
     * @param vert - Wrap vertically
     * @param margin - Extra margin (pixels outside room edge before wrapping)
     */
    move_wrap(hor: boolean, vert: boolean, margin?: number): void;
    /**
     * Returns the shortest distance from this instance to any instance of obj.
     * @param obj - Object class to measure distance to
     * @returns Distance in pixels, or Infinity if no instance found
     */
    distance_to_object(obj: typeof instance): number;
    /**
     * Sets the instance's motion using speed and direction.
     * @param dir - Direction in degrees (0 = right, counter-clockwise)
     * @param spd - Speed in pixels per step
     */
    motion_set(dir: number, spd: number): void;
    /**
     * Adds motion to the instance's current movement.
     * @param dir - Direction in degrees
     * @param spd - Speed to add
     */
    motion_add(dir: number, spd: number): void;
    /**
     * Moves the instance toward a point at the given speed.
     * @param x - Target X position
     * @param y - Target Y position
     * @param spd - Speed to move at
     */
    move_towards_point(x: number, y: number, spd: number): void;
    /**
     * Calculates the distance to a point.
     * @param x - Target X position
     * @param y - Target Y position
     * @returns Distance in pixels
     */
    point_distance(x: number, y: number): number;
    /**
     * Calculates the direction toward a point.
     * @param x - Target X position
     * @param y - Target Y position
     * @returns Direction in degrees (0 = right, counter-clockwise)
     */
    point_direction(x: number, y: number): number;
    /**
     * Draws this instance's current sprite at its position with all image_ properties.
     * Call this from on_draw() or it will be called automatically if on_draw() is not overridden.
     */
    draw_self(): void;
    /** Called once when the instance is created. */
    on_create(): void;
    /** Called once when the instance is destroyed. */
    on_destroy(): void;
    /** Called at the start of each step. */
    on_step_begin(): void;
    /** Called every step (main update logic). Override this in subclasses. */
    on_step(): void;
    /** Called at the end of each step. */
    on_step_end(): void;
    /**
     * Called every frame to draw the instance.
     * Default implementation calls draw_self() to draw sprite_index at (x, y).
     * Override to customize drawing behaviour.
     */
    on_draw(): void;
    /** Called every frame to draw GUI elements (fixed to the screen, not the room). */
    on_draw_gui(): void;
    /** Called when alarm[index] counts down to zero. */
    on_alarm(_index: number): void;
    /** Called the step any key is pressed. */
    on_key_press(): void;
    /** Called the step any key is released. */
    on_key_release(): void;
    /** Called every step any key is held down. */
    on_key_held(): void;
    /** Called when the left mouse button is pressed over this instance. */
    on_mouse_left_press(): void;
    /** Called when the left mouse button is released over this instance. */
    on_mouse_left_release(): void;
    /** Called when the right mouse button is pressed over this instance. */
    on_mouse_right_press(): void;
    /** Called for each other instance this one overlaps this step. */
    on_collision(_other: instance): void;
    /** Called when the room this instance is in starts. */
    on_room_start(): void;
    /** Called when the room this instance is in ends (before leaving it). */
    on_room_end(): void;
    /** Called once when the game starts, for instances present in the first room. */
    on_game_start(): void;
    /** Called once when the game ends. */
    on_game_end(): void;
    /** Called when the sprite animation completes a loop. */
    on_animation_end(): void;
    /** Called when path following ends (requires path_start; not yet wired). */
    on_path_end(): void;
}
/**
 * Iterates over all active instances of a given object class and runs a callback.
 * The callback receives each instance as \`self\`.
 *
 * @param obj - Object class to iterate, or an array of instances
 * @param callback - Function called for each matching instance
 */
declare function with_object<T extends instance>(obj: typeof instance | T[], callback: (self: T) => void): void;
/** Returns the first instance of obj whose mask contains the point (x, y), or undefined. */
declare function collision_point(x: number, y: number, obj: typeof instance): instance | undefined;
/** True if any instance of obj has its mask at the point (x, y). */
declare function position_meeting(x: number, y: number, obj: typeof instance): boolean;
/** Destroys every instance whose mask contains the point (x, y). */
declare function position_destroy(x: number, y: number): void;
/** Returns the first instance of obj overlapping the rectangle (x1,y1)-(x2,y2), or undefined. */
declare function collision_rectangle(x1: number, y1: number, x2: number, y2: number, obj: typeof instance): instance | undefined;
/** Returns the first instance of obj overlapping the circle at (x, y) with the given radius, or undefined. */
declare function collision_circle(x: number, y: number, radius: number, obj: typeof instance): instance | undefined;
/** Returns the first instance of obj whose mask the line segment (x1,y1)-(x2,y2) crosses, or undefined. */
declare function collision_line(x1: number, y1: number, x2: number, y2: number, obj: typeof instance): instance | undefined;

//# sourceMappingURL=instance.d.ts.map
/**
 * Path system \u2014 smooth curves through a series of points.
 *
 * Mirrors the GMS path API:
 *   path_create, path_delete, path_add_point, path_get_x, path_get_y,
 *   path_get_speed, path_get_length, path_get_number,
 *   path_set_closed, path_set_kind, path_flip, path_mirror,
 *   path_exists, path_clear_points
 *
 * Two kinds of path:
 *   path_kind_linear  (0) \u2014 straight line segments between points
 *   path_kind_smooth  (1) \u2014 Catmull-Rom spline through points
 *
 * Position is queried via a normalised parameter t \u2208 [0, 1].
 */
declare const path_kind_linear = 0;
declare const path_kind_smooth = 1;
/**
 * Creates a new empty path.
 * @returns Path ID
 */
declare function path_create(): number;
/**
 * Destroys a path.
 * @param path_id - Path ID
 */
declare function path_delete(path_id: number): void;
/**
 * Returns true if the path ID is valid.
 * @param path_id - Path ID
 */
declare function path_exists(path_id: number): boolean;
/**
 * Adds a control point to a path.
 * @param path_id - Path ID
 * @param x - Point X
 * @param y - Point Y
 * @param speed - Speed factor at this point (default 1)
 */
declare function path_add_point(path_id: number, x: number, y: number, speed?: number): void;
/**
 * Removes all control points from a path.
 * @param path_id - Path ID
 */
declare function path_clear_points(path_id: number): void;
/**
 * Returns the number of control points on a path.
 * @param path_id - Path ID
 */
declare function path_get_number(path_id: number): number;
/**
 * Returns the X position on a path at normalised position t (0\u20131).
 * @param path_id - Path ID
 * @param t - Position along path (0 = start, 1 = end)
 */
declare function path_get_x(path_id: number, t: number): number;
/**
 * Returns the Y position on a path at normalised position t (0\u20131).
 * @param path_id - Path ID
 * @param t - Position along path
 */
declare function path_get_y(path_id: number, t: number): number;
/**
 * Returns the speed factor on a path at normalised position t.
 * @param path_id - Path ID
 * @param t - Position along path
 */
declare function path_get_speed(path_id: number, t: number): number;
/**
 * Returns the approximate total length of a path in pixels.
 * @param path_id - Path ID
 */
declare function path_get_length(path_id: number): number;
/**
 * Returns the X coordinate of the nth control point (0-based).
 * @param path_id - Path ID
 * @param n - Point index
 */
declare function path_get_point_x(path_id: number, n: number): number;
/**
 * Returns the Y coordinate of the nth control point (0-based).
 * @param path_id - Path ID
 * @param n - Point index
 */
declare function path_get_point_y(path_id: number, n: number): number;
/**
 * Returns the speed of the nth control point (0-based).
 * @param path_id - Path ID
 * @param n - Point index
 */
declare function path_get_point_speed(path_id: number, n: number): number;
/**
 * Sets whether the path is closed (loops back to the start).
 * @param path_id - Path ID
 * @param closed - True to close the path
 */
declare function path_set_closed(path_id: number, closed: boolean): void;
/**
 * Sets the interpolation kind for a path.
 * @param path_id - Path ID
 * @param kind - path_kind_linear | path_kind_smooth
 */
declare function path_set_kind(path_id: number, kind: number): void;
/**
 * Sets the spline precision (number of subdivisions per segment).
 * Higher values improve length accuracy for smooth paths.
 * @param path_id - Path ID
 * @param precision - Steps per segment (default 8)
 */
declare function path_set_precision(path_id: number, precision: number): void;
/**
 * Flips the path horizontally around the centre of its bounding box.
 * @param path_id - Path ID
 */
declare function path_flip(path_id: number): void;
/**
 * Mirrors the path vertically around the centre of its bounding box.
 * @param path_id - Path ID
 */
declare function path_mirror(path_id: number): void;
/**
 * Reverses the order of points on a path.
 * @param path_id - Path ID
 */
declare function path_reverse(path_id: number): void;
//# sourceMappingURL=path.d.ts.map
/**
 * Abstract base class for all game resources.
 * Provides auto-incrementing unique ID and name for each resource instance.
 */
declare abstract class resource {
    private static gid;
    private static all;
    readonly id: number;
    readonly name: string;
    /**
     * Increments and returns the next available resource ID.
     * @returns The next unique resource ID
     */
    private incrementID;
    constructor();
    protected static removeByID(id: number): void;
    static findByID(id: number): resource | undefined;
}
//# sourceMappingURL=resource.d.ts.map

/**
 * Represents a game room containing instances, backgrounds, and views.
 * Rooms define the playable spaces where game logic executes.
 */
declare class room extends resource {
    room_width: number;
    room_height: number;
    room_caption: string;
    room_speed: number;
    room_persistent: boolean;
    room_previous: number;
    room_next: number;
    background_visible: boolean[];
    background_foreground: boolean[];
    background_index: number[];
    background_x: number[];
    background_y: number[];
    background_htiled: boolean[];
    background_vtiled: boolean[];
    background_hspeed: number[];
    background_vspeed: number[];
    background_color: number[];
    view_enabled: boolean;
    view_current: number;
    view_visible: boolean[];
    view_xview: number[];
    view_yview: number[];
    view_wview: number[];
    view_hview: number[];
    view_xport: number[];
    view_yport: number[];
    view_wport: number[];
    view_hport: number[];
    view_hborder: number[];
    view_vborder: number[];
    view_hspeed: number[];
    view_vspeed: number[];
    view_object: number[];
    private tiles;
    private all;
    constructor();
    /**
     * Transitions to the specified room.
     * @param target - The room to go to (ID or room reference)
     */
    room_goto(target: number | room): void;
    /**
     * Transitions to the previous room in the room order.
     */
    room_goto_previous(): void;
    /**
     * Transitions to the next room in the room order.
     */
    room_goto_next(): void;
    /**
     * Restarts the current room, resetting all non-persistent instances.
     */
    room_restart(): void;
    /**
     * Checks if a room with the given ID exists.
     * @param id - The room ID to check
     * @returns True if the room exists
     */
    room_exists(id: number): boolean;
    /**
     * Adds an instance to the room at design time (before room starts).
     * @param x - X position for the instance
     * @param y - Y position for the instance
     * @param obj - The instance to add
     */
    room_instance_add(x: number, y: number, obj: instance): void;
    /**
     * Adds an instance to this room at runtime.
     * @param inst - The instance to add
     */
    instance_add(inst: instance): void;
    /**
     * Removes an instance from this room by ID.
     * @param id - The instance ID to remove
     * @returns True if the instance was found and removed
     */
    instance_remove(id: number): boolean;
    /**
     * Gets an instance from this room by ID.
     * @param id - The instance ID to find
     * @returns The instance, or undefined if not found
     */
    instance_get(id: number): instance | undefined;
    /**
     * Gets all instances in this room.
     * @returns Array of all instances
     */
    instance_get_all(): instance[];
    /**
     * Gets the number of instances in this room.
     * @returns The instance count
     */
    instance_count(): number;
    /**
     * Removes all instances from the room's design-time instance list.
     */
    room_instance_clear(): void;
    /**
     * Registers all instances in this room with the game loop.
     * Called when entering a room to set up event handlers.
     */
    register_all_instances(): void;
    /**
     * Adds a tile to the room at design time.
     * @param x - X position for the tile
     * @param y - Y position for the tile
     * @param background - Background resource containing the tile
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile
     * @param height - Height of the tile
     * @param depth - Drawing depth of the tile
     * @returns The unique ID of the created tile
     */
    room_tile_add(x: number, y: number, background: number, left: number, top: number, width: number, height: number, depth: number): number;
    /**
     * Adds a tile to the room at design time, with extended options.
     * @param x - X position for the tile
     * @param y - Y position for the tile
     * @param background - Background resource containing the tile
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile
     * @param height - Height of the tile
     * @param depth - Drawing depth of the tile
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     * @param alpha - Transparency (0-1)
     * @returns The unique ID of the created tile
     */
    room_tile_add_ext(x: number, y: number, background: number, left: number, top: number, width: number, height: number, depth: number, xscale: number, yscale: number, alpha: number): number;
    /**
     * Removes all tiles from the room's design-time tile list.
     */
    room_tile_clear(): void;
    private static next_tile_id;
    /**
     * Adds a tile at runtime and returns its unique ID.
     * @param background - Background resource containing the tile
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile
     * @param height - Height of the tile
     * @param x - X position in the room
     * @param y - Y position in the room
     * @param depth - Drawing depth
     * @returns The unique ID of the created tile
     */
    tile_add(background: number, left: number, top: number, width: number, height: number, x: number, y: number, depth: number): number;
    /**
     * Deletes a tile by its ID.
     * @param id - The tile ID to delete
     * @returns True if the tile was found and deleted
     */
    tile_delete(id: number): boolean;
    /**
     * Checks if a tile with the given ID exists.
     * @param id - The tile ID to check
     * @returns True if the tile exists
     */
    tile_exists(id: number): boolean;
    /**
     * Gets the X position of a tile.
     * @param id - The tile ID
     * @returns The X position, or 0 if not found
     */
    tile_get_x(id: number): number;
    /**
     * Gets the Y position of a tile.
     * @param id - The tile ID
     * @returns The Y position, or 0 if not found
     */
    tile_get_y(id: number): number;
    /**
     * Gets the depth of a tile.
     * @param id - The tile ID
     * @returns The depth, or 0 if not found
     */
    tile_get_depth(id: number): number;
    /**
     * Gets the visibility of a tile.
     * @param id - The tile ID
     * @returns True if visible, false if not found or hidden
     */
    tile_get_visible(id: number): boolean;
    /**
     * Sets the position of a tile.
     * @param id - The tile ID
     * @param x - New X position
     * @param y - New Y position
     */
    tile_set_position(id: number, x: number, y: number): void;
    /**
     * Sets the depth of a tile.
     * @param id - The tile ID
     * @param depth - New depth value
     */
    tile_set_depth(id: number, depth: number): void;
    /**
     * Sets the visibility of a tile.
     * @param id - The tile ID
     * @param visible - Whether the tile should be visible
     */
    tile_set_visible(id: number, visible: boolean): void;
    /**
     * Sets the scale of a tile.
     * @param id - The tile ID
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     */
    tile_set_scale(id: number, xscale: number, yscale: number): void;
    /**
     * Sets the alpha (transparency) of a tile.
     * @param id - The tile ID
     * @param alpha - Alpha value (0-1)
     */
    tile_set_alpha(id: number, alpha: number): void;
    /**
     * Sets the background region of a tile.
     * @param id - The tile ID
     * @param background - Background resource ID
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile region
     * @param height - Height of the tile region
     */
    tile_set_background(id: number, background: number, left: number, top: number, width: number, height: number): void;
    /**
     * Deletes all tiles at a specific depth.
     * @param depth - The depth to clear
     */
    tile_layer_delete(depth: number): void;
    /**
     * Shifts all tiles at a specific depth by the given amount.
     * @param depth - The depth layer to shift
     * @param x - Horizontal shift amount
     * @param y - Vertical shift amount
     */
    tile_layer_shift(depth: number, x: number, y: number): void;
    /**
     * Finds a tile at the given position and depth.
     * @param x - X position to check
     * @param y - Y position to check
     * @param depth - Depth to check
     * @returns The tile ID, or -1 if not found
     */
    tile_layer_find(x: number, y: number, depth: number): number;
    /**
     * Sets the background for a specific layer in this room.
     * @param index - Background layer index (0-7)
     * @param visible - Whether the background is visible
     * @param foreground - Whether it draws in front of instances
     * @param background - Background resource ID
     * @param x - X offset
     * @param y - Y offset
     * @param htiled - Whether to tile horizontally
     * @param vtiled - Whether to tile vertically
     * @param hspeed - Horizontal scroll speed
     * @param vspeed - Vertical scroll speed
     */
    room_set_background(index: number, visible: boolean, foreground: boolean, background: number, x: number, y: number, htiled: boolean, vtiled: boolean, hspeed: number, vspeed: number): void;
    /**
     * Sets the background color for a specific layer.
     * @param index - Background layer index
     * @param color - The color value
     */
    room_set_background_color(index: number, color: number): void;
    /**
     * Configures a view for this room (design-time).
     * @param index - View index
     * @param visible - Whether the view is enabled
     * @param xview - X position of the view in the room
     * @param yview - Y position of the view in the room
     * @param wview - Width of the view in the room
     * @param hview - Height of the view in the room
     * @param xport - X position of the viewport on screen
     * @param yport - Y position of the viewport on screen
     * @param wport - Width of the viewport on screen
     * @param hport - Height of the viewport on screen
     * @param hborder - Horizontal border for object following
     * @param vborder - Vertical border for object following
     * @param hspeed - Max horizontal speed when following
     * @param vspeed - Max vertical speed when following
     * @param target - Object instance to follow (-1 for none)
     */
    room_set_view(index: number, visible: boolean, xview: number, yview: number, wview: number, hview: number, xport: number, yport: number, wport: number, hport: number, hborder: number, vborder: number, hspeed: number, vspeed: number, target: number): void;
    /**
     * Enables or disables the view system for this room.
     * @param enabled - Whether views are enabled
     */
    room_set_view_enabled(enabled: boolean): void;
    /**
     * Gets the X position of a view in room coordinates.
     * @param index - View index
     * @returns The X position of the view
     */
    view_get_xview(index: number): number;
    /**
     * Gets the Y position of a view in room coordinates.
     * @param index - View index
     * @returns The Y position of the view
     */
    view_get_yview(index: number): number;
    /**
     * Gets the width of a view.
     * @param index - View index
     * @returns The width of the view
     */
    view_get_wview(index: number): number;
    /**
     * Gets the height of a view.
     * @param index - View index
     * @returns The height of the view
     */
    view_get_hview(index: number): number;
    /**
     * Sets the position of a view at runtime.
     * @param index - View index
     * @param x - New X position
     * @param y - New Y position
     */
    view_set_position(index: number, x: number, y: number): void;
    /**
     * Sets the size of a view at runtime.
     * @param index - View index
     * @param w - New width
     * @param h - New height
     */
    view_set_size(index: number, w: number, h: number): void;
    /**
     * Sets the viewport position on screen.
     * @param index - View index
     * @param x - X position on screen
     * @param y - Y position on screen
     */
    view_set_port_position(index: number, x: number, y: number): void;
    /**
     * Sets the viewport size on screen.
     * @param index - View index
     * @param w - Width on screen
     * @param h - Height on screen
     */
    view_set_port_size(index: number, w: number, h: number): void;
    /**
     * Sets the object for a view to follow.
     * @param index - View index
     * @param obj - Instance ID to follow (-1 for none)
     */
    view_set_object(index: number, obj: number): void;
    /**
     * Sets the border area for view following.
     * @param index - View index
     * @param hborder - Horizontal border in pixels
     * @param vborder - Vertical border in pixels
     */
    view_set_border(index: number, hborder: number, vborder: number): void;
    /**
     * Sets the maximum speed for view following.
     * @param index - View index
     * @param hspeed - Max horizontal speed
     * @param vspeed - Max vertical speed
     */
    view_set_speed(index: number, hspeed: number, vspeed: number): void;
    /**
     * Converts a screen X coordinate to room coordinates for a specific view.
     * @param index - View index
     * @param x - Screen X coordinate
     * @returns Room X coordinate
     */
    view_screen_to_room_x(index: number, x: number): number;
    /**
     * Converts a screen Y coordinate to room coordinates for a specific view.
     * @param index - View index
     * @param y - Screen Y coordinate
     * @returns Room Y coordinate
     */
    view_screen_to_room_y(index: number, y: number): number;
    /**
     * Converts a room X coordinate to screen coordinates for a specific view.
     * @param index - View index
     * @param x - Room X coordinate
     * @returns Screen X coordinate
     */
    view_room_to_screen_x(index: number, x: number): number;
    /**
     * Converts a room Y coordinate to screen coordinates for a specific view.
     * @param index - View index
     * @param y - Room Y coordinate
     * @returns Screen Y coordinate
     */
    view_room_to_screen_y(index: number, y: number): number;
}
//# sourceMappingURL=room.d.ts.map
/**
 * Timeline system \u2014 execute callbacks at specific step moments.
 *
 * Mirrors the GMS timeline API:
 *   timeline_create, timeline_delete, timeline_moment_add,
 *   timeline_moment_clear, timeline_exists, timeline_get_moment_count
 *
 * A timeline is advanced manually by calling timeline_step().
 * Each registered moment fires its callback when the playhead reaches
 * or passes that step number.
 *
 * GMS timelines are attached to instances; here they are standalone
 * objects that you advance explicitly, which is simpler and more flexible.
 */
/**
 * Creates a new empty timeline.
 * @returns Timeline ID
 */
declare function timeline_create(): number;
/**
 * Destroys a timeline.
 * @param timeline_id - Timeline ID
 */
declare function timeline_delete(timeline_id: number): void;
/**
 * Returns true if the timeline ID is valid.
 * @param timeline_id - Timeline ID
 */
declare function timeline_exists(timeline_id: number): boolean;
/**
 * Adds a callback to fire at a specific step moment.
 * Multiple callbacks can share the same step \u2014 they fire in insertion order.
 * @param timeline_id - Timeline ID
 * @param step - Step index
 * @param cb - Callback to execute at that step
 */
declare function timeline_moment_add(timeline_id: number, step: number, cb: () => void): void;
/**
 * Removes all callbacks registered at a specific step.
 * @param timeline_id - Timeline ID
 * @param step - Step index to clear
 */
declare function timeline_moment_clear(timeline_id: number, step: number): void;
/**
 * Returns the number of moments registered on a timeline.
 * @param timeline_id - Timeline ID
 */
declare function timeline_get_moment_count(timeline_id: number): number;
/**
 * Sets the playback speed (steps advanced per timeline_step call).
 * @param timeline_id - Timeline ID
 * @param speed - Steps per advance (default 1)
 */
declare function timeline_set_speed(timeline_id: number, speed: number): void;
/**
 * Sets whether the timeline loops when it reaches the end.
 * @param timeline_id - Timeline ID
 * @param loop - True to loop
 */
declare function timeline_set_loop(timeline_id: number, loop: boolean): void;
/**
 * Starts or resumes playback.
 * @param timeline_id - Timeline ID
 */
declare function timeline_play(timeline_id: number): void;
/**
 * Pauses playback without resetting the position.
 * @param timeline_id - Timeline ID
 */
declare function timeline_pause(timeline_id: number): void;
/**
 * Stops playback and resets the playhead to position 0.
 * @param timeline_id - Timeline ID
 */
declare function timeline_stop(timeline_id: number): void;
/**
 * Jumps the playhead to a specific step position.
 * @param timeline_id - Timeline ID
 * @param pos - Step position
 */
declare function timeline_set_position(timeline_id: number, pos: number): void;
/**
 * Returns the current playhead position.
 * @param timeline_id - Timeline ID
 */
declare function timeline_get_position(timeline_id: number): number;
/**
 * Advances a timeline by its speed and fires any moments crossed.
 * Call this once per game step for each active timeline.
 * @param timeline_id - Timeline ID
 * @returns True if the timeline is still playing, false if it has finished (and is not looping)
 */
declare function timeline_step(timeline_id: number): boolean;
/**
 * Advances all playing timelines by one step.
 * Convenience function \u2014 call once per game step to update all timelines.
 */
declare function timeline_step_all(): void;
//# sourceMappingURL=timeline.d.ts.map
/**
 * DS Grid \u2014 fixed-size 2D array.
 *
 * GMS-compatible API: ds_grid_create, ds_grid_destroy, ds_grid_get,
 * ds_grid_set, ds_grid_add, ds_grid_multiply, ds_grid_clear,
 * ds_grid_width, ds_grid_height, ds_grid_copy,
 * ds_grid_region_get, ds_grid_region_set,
 * ds_grid_get_max, ds_grid_get_min, ds_grid_get_mean, ds_grid_get_sum,
 * ds_grid_set_region, ds_grid_add_region, ds_grid_multiply_region.
 */
/**
 * Creates a new DS grid filled with zeros.
 * @param w - Number of columns
 * @param h - Number of rows
 * @returns Grid ID
 */
declare function ds_grid_create(w: number, h: number): number;
/**
 * Destroys a DS grid.
 * @param id - Grid ID
 */
declare function ds_grid_destroy(id: number): void;
/**
 * Returns the value at grid cell (x, y).
 * @param id - Grid ID
 * @param x - Column (0-based)
 * @param y - Row (0-based)
 */
declare function ds_grid_get(id: number, x: number, y: number): number;
/**
 * Sets the value at grid cell (x, y).
 * @param id - Grid ID
 * @param x - Column
 * @param y - Row
 * @param val - Value to set
 */
declare function ds_grid_set(id: number, x: number, y: number, val: number): void;
/**
 * Adds a value to the cell at (x, y).
 * @param id - Grid ID
 * @param x - Column
 * @param y - Row
 * @param val - Amount to add
 */
declare function ds_grid_add(id: number, x: number, y: number, val: number): void;
/**
 * Multiplies the value at (x, y) by a factor.
 * @param id - Grid ID
 * @param x - Column
 * @param y - Row
 * @param factor - Multiplier
 */
declare function ds_grid_multiply(id: number, x: number, y: number, factor: number): void;
/**
 * Sets all cells in the grid to the given value.
 * @param id - Grid ID
 * @param val - Value to fill with
 */
declare function ds_grid_clear(id: number, val: number): void;
/** Returns the width (column count) of the grid. */
declare function ds_grid_width(id: number): number;
/** Returns the height (row count) of the grid. */
declare function ds_grid_height(id: number): number;
/**
 * Copies one grid into another. Both must have the same dimensions.
 * @param src - Source grid ID
 * @param dst - Destination grid ID
 */
declare function ds_grid_copy(src: number, dst: number): void;
/**
 * Returns values in a rectangular region as a flat array (row-major).
 * Clamps to grid boundaries; out-of-bounds cells return 0.
 * @param id - Grid ID
 * @param x1 - Left column
 * @param y1 - Top row
 * @param x2 - Right column (inclusive)
 * @param y2 - Bottom row (inclusive)
 */
declare function ds_grid_region_get(id: number, x1: number, y1: number, x2: number, y2: number): number[];
/**
 * Sets all cells in a rectangular region to a value.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 * @param val - Value to set
 */
declare function ds_grid_set_region(id: number, x1: number, y1: number, x2: number, y2: number, val: number): void;
/**
 * Adds a value to all cells in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 * @param val - Amount to add
 */
declare function ds_grid_add_region(id: number, x1: number, y1: number, x2: number, y2: number, val: number): void;
/**
 * Multiplies all cells in a rectangular region by a factor.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 * @param factor - Multiplier
 */
declare function ds_grid_multiply_region(id: number, x1: number, y1: number, x2: number, y2: number, factor: number): void;
/**
 * Returns the maximum value in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
declare function ds_grid_get_max(id: number, x1: number, y1: number, x2: number, y2: number): number;
/**
 * Returns the minimum value in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
declare function ds_grid_get_min(id: number, x1: number, y1: number, x2: number, y2: number): number;
/**
 * Returns the sum of all values in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
declare function ds_grid_get_sum(id: number, x1: number, y1: number, x2: number, y2: number): number;
/**
 * Returns the mean (average) of all values in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
declare function ds_grid_get_mean(id: number, x1: number, y1: number, x2: number, y2: number): number;
/** Returns true if the grid ID exists. */
declare function ds_grid_exists(id: number): boolean;
//# sourceMappingURL=ds_grid.d.ts.map
/**
 * DS List \u2014 ordered, resizable array.
 *
 * GMS-compatible API: ds_list_create, ds_list_add, ds_list_insert,
 * ds_list_find_value, ds_list_find_index, ds_list_replace,
 * ds_list_delete, ds_list_size, ds_list_empty, ds_list_clear,
 * ds_list_destroy, ds_list_copy.
 */
/**
 * Creates a new empty DS list.
 * @returns The list ID
 */
declare function ds_list_create(): number;
/**
 * Destroys a DS list, freeing its memory.
 * @param id - List ID
 */
declare function ds_list_destroy(id: number): void;
/**
 * Adds a value to the end of the list.
 * @param id - List ID
 * @param val - Value to add
 */
declare function ds_list_add(id: number, val: any): void;
/**
 * Inserts a value at a specific position (0-based).
 * @param id - List ID
 * @param pos - Index to insert at
 * @param val - Value to insert
 */
declare function ds_list_insert(id: number, pos: number, val: any): void;
/**
 * Returns the value at a given position.
 * @param id - List ID
 * @param pos - Index (0-based)
 * @returns The value at that position, or undefined if out of range
 */
declare function ds_list_find_value(id: number, pos: number): any;
/**
 * Returns the index of the first occurrence of a value, or -1 if not found.
 * @param id - List ID
 * @param val - Value to search for
 */
declare function ds_list_find_index(id: number, val: any): number;
/**
 * Replaces the value at a given position.
 * @param id - List ID
 * @param pos - Index to replace
 * @param val - New value
 */
declare function ds_list_replace(id: number, pos: number, val: any): void;
/**
 * Removes the element at a given position.
 * @param id - List ID
 * @param pos - Index to delete
 */
declare function ds_list_delete(id: number, pos: number): void;
/**
 * Returns the number of elements in the list.
 * @param id - List ID
 */
declare function ds_list_size(id: number): number;
/**
 * Returns true if the list has no elements.
 * @param id - List ID
 */
declare function ds_list_empty(id: number): boolean;
/**
 * Removes all elements from the list.
 * @param id - List ID
 */
declare function ds_list_clear(id: number): void;
/**
 * Copies the contents of one list into another (overwrites destination).
 * @param src - Source list ID
 * @param dst - Destination list ID
 */
declare function ds_list_copy(src: number, dst: number): void;
/**
 * Sorts the list in ascending or descending order.
 * @param id - List ID
 * @param ascending - True for ascending, false for descending
 */
declare function ds_list_sort(id: number, ascending: boolean): void;
/**
 * Shuffles the list in place using Fisher-Yates.
 * @param id - List ID
 */
declare function ds_list_shuffle(id: number): void;
/** Returns true if the list ID exists. */
declare function ds_list_exists(id: number): boolean;
//# sourceMappingURL=ds_list.d.ts.map
/**
 * DS Map \u2014 key/value store (string or number keys).
 *
 * GMS-compatible API: ds_map_create, ds_map_add, ds_map_set,
 * ds_map_find_value, ds_map_exists, ds_map_delete, ds_map_size,
 * ds_map_empty, ds_map_clear, ds_map_destroy, ds_map_copy,
 * ds_map_find_first, ds_map_find_next, ds_map_find_last, ds_map_find_previous.
 */
type ds_map_key = string | number;
/**
 * Creates a new empty DS map.
 * @returns The map ID
 */
declare function ds_map_create(): number;
/**
 * Destroys a DS map.
 * @param id - Map ID
 */
declare function ds_map_destroy(id: number): void;
/**
 * Adds a key/value pair if the key does not already exist.
 * @param id - Map ID
 * @param key - Key (string or number)
 * @param val - Value
 */
declare function ds_map_add(id: number, key: ds_map_key, val: any): void;
/**
 * Sets a key/value pair, overwriting any existing value.
 * @param id - Map ID
 * @param key - Key
 * @param val - Value
 */
declare function ds_map_set(id: number, key: ds_map_key, val: any): void;
/**
 * Returns the value for a key, or undefined if not found.
 * @param id - Map ID
 * @param key - Key to look up
 */
declare function ds_map_find_value(id: number, key: ds_map_key): any;
/**
 * Returns true if the key exists in the map.
 * @param id - Map ID
 * @param key - Key to check
 */
declare function ds_map_exists(id: number, key: ds_map_key): boolean;
/**
 * Deletes a key from the map.
 * @param id - Map ID
 * @param key - Key to delete
 */
declare function ds_map_delete(id: number, key: ds_map_key): void;
/**
 * Returns the number of key/value pairs in the map.
 * @param id - Map ID
 */
declare function ds_map_size(id: number): number;
/**
 * Returns true if the map has no entries.
 * @param id - Map ID
 */
declare function ds_map_empty(id: number): boolean;
/**
 * Removes all entries from the map.
 * @param id - Map ID
 */
declare function ds_map_clear(id: number): void;
/**
 * Copies the contents of one map into another (overwrites destination).
 * @param src - Source map ID
 * @param dst - Destination map ID
 */
declare function ds_map_copy(src: number, dst: number): void;
/**
 * Returns the first key in the map (insertion order), or undefined if empty.
 * @param id - Map ID
 */
declare function ds_map_find_first(id: number): ds_map_key | undefined;
/**
 * Returns the key that follows \`key\` in insertion order, or undefined.
 * @param id - Map ID
 * @param key - Reference key
 */
declare function ds_map_find_next(id: number, key: ds_map_key): ds_map_key | undefined;
/**
 * Returns the last key in the map, or undefined if empty.
 * @param id - Map ID
 */
declare function ds_map_find_last(id: number): ds_map_key | undefined;
/**
 * Returns the key before \`key\` in insertion order, or undefined.
 * @param id - Map ID
 * @param key - Reference key
 */
declare function ds_map_find_previous(id: number, key: ds_map_key): ds_map_key | undefined;
/** Returns true if the map ID exists. */
declare function ds_map_exists_id(id: number): boolean;

//# sourceMappingURL=ds_map.d.ts.map
/**
 * DS Priority Queue \u2014 values are retrieved in priority order.
 *
 * GMS-compatible API: ds_priority_create, ds_priority_destroy,
 * ds_priority_add, ds_priority_delete_value, ds_priority_delete_min,
 * ds_priority_delete_max, ds_priority_find_min, ds_priority_find_max,
 * ds_priority_find_priority, ds_priority_size, ds_priority_empty,
 * ds_priority_clear, ds_priority_copy.
 *
 * Implemented with a min-heap. Max operations use negated priority.
 */
/**
 * Creates a new empty DS priority queue.
 * @returns Priority queue ID
 */
declare function ds_priority_create(): number;
/**
 * Destroys a DS priority queue.
 * @param id - Priority queue ID
 */
declare function ds_priority_destroy(id: number): void;
/**
 * Adds a value with a given priority.
 * Lower priority numbers are retrieved first (min-heap order).
 * @param id - Priority queue ID
 * @param val - Value to add
 * @param priority - Priority number
 */
declare function ds_priority_add(id: number, val: any, priority: number): void;
/**
 * Removes the first occurrence of a value.
 * @param id - Priority queue ID
 * @param val - Value to remove
 */
declare function ds_priority_delete_value(id: number, val: any): void;
/**
 * Removes and returns the value with the lowest priority number.
 * @param id - Priority queue ID
 */
declare function ds_priority_delete_min(id: number): any;
/**
 * Removes and returns the value with the highest priority number.
 * @param id - Priority queue ID
 */
declare function ds_priority_delete_max(id: number): any;
/**
 * Returns the value with the lowest priority number without removing it.
 * @param id - Priority queue ID
 */
declare function ds_priority_find_min(id: number): any;
/**
 * Returns the value with the highest priority number without removing it.
 * @param id - Priority queue ID
 */
declare function ds_priority_find_max(id: number): any;
/**
 * Returns the priority of the given value, or undefined if not found.
 * @param id - Priority queue ID
 * @param val - Value to look up
 */
declare function ds_priority_find_priority(id: number, val: any): number | undefined;
/**
 * Returns the number of items in the priority queue.
 * @param id - Priority queue ID
 */
declare function ds_priority_size(id: number): number;
/**
 * Returns true if the priority queue has no items.
 * @param id - Priority queue ID
 */
declare function ds_priority_empty(id: number): boolean;
/**
 * Removes all items from the priority queue.
 * @param id - Priority queue ID
 */
declare function ds_priority_clear(id: number): void;
/**
 * Copies the contents of src into dst (overwrites destination).
 * @param src - Source priority queue ID
 * @param dst - Destination priority queue ID
 */
declare function ds_priority_copy(src: number, dst: number): void;
/** Returns true if the priority queue ID exists. */
declare function ds_priority_exists(id: number): boolean;
//# sourceMappingURL=ds_priority.d.ts.map
/**
 * DS Queue \u2014 FIFO (first in, first out) data structure.
 *
 * GMS-compatible API: ds_queue_create, ds_queue_destroy, ds_queue_enqueue,
 * ds_queue_dequeue, ds_queue_head, ds_queue_tail, ds_queue_size,
 * ds_queue_empty, ds_queue_clear, ds_queue_copy.
 *
 * Implemented with a circular buffer for O(1) enqueue and dequeue.
 */
/**
 * Creates a new empty DS queue.
 * @returns Queue ID
 */
declare function ds_queue_create(): number;
/**
 * Destroys a DS queue.
 * @param id - Queue ID
 */
declare function ds_queue_destroy(id: number): void;
/**
 * Adds a value to the back of the queue.
 * @param id - Queue ID
 * @param val - Value to enqueue
 */
declare function ds_queue_enqueue(id: number, val: any): void;
/**
 * Removes and returns the front value. Returns undefined if empty.
 * @param id - Queue ID
 */
declare function ds_queue_dequeue(id: number): any;
/**
 * Returns the front value without removing it. Returns undefined if empty.
 * @param id - Queue ID
 */
declare function ds_queue_head(id: number): any;
/**
 * Returns the back (last enqueued) value without removing it.
 * @param id - Queue ID
 */
declare function ds_queue_tail(id: number): any;
/**
 * Returns the number of items in the queue.
 * @param id - Queue ID
 */
declare function ds_queue_size(id: number): number;
/**
 * Returns true if the queue has no items.
 * @param id - Queue ID
 */
declare function ds_queue_empty(id: number): boolean;
/**
 * Removes all items from the queue.
 * @param id - Queue ID
 */
declare function ds_queue_clear(id: number): void;
/**
 * Copies items from src into dst (overwrites destination).
 * @param src - Source queue ID
 * @param dst - Destination queue ID
 */
declare function ds_queue_copy(src: number, dst: number): void;
/** Returns true if the queue ID exists. */
declare function ds_queue_exists(id: number): boolean;
//# sourceMappingURL=ds_queue.d.ts.map
/**
 * DS Stack \u2014 LIFO (last in, first out) data structure.
 *
 * GMS-compatible API: ds_stack_create, ds_stack_destroy, ds_stack_push,
 * ds_stack_pop, ds_stack_top, ds_stack_size, ds_stack_empty,
 * ds_stack_clear, ds_stack_copy.
 */
/**
 * Creates a new empty DS stack.
 * @returns Stack ID
 */
declare function ds_stack_create(): number;
/**
 * Destroys a DS stack.
 * @param id - Stack ID
 */
declare function ds_stack_destroy(id: number): void;
/**
 * Pushes a value onto the top of the stack.
 * @param id - Stack ID
 * @param val - Value to push
 */
declare function ds_stack_push(id: number, val: any): void;
/**
 * Removes and returns the top value. Returns undefined if empty.
 * @param id - Stack ID
 */
declare function ds_stack_pop(id: number): any;
/**
 * Returns the top value without removing it. Returns undefined if empty.
 * @param id - Stack ID
 */
declare function ds_stack_top(id: number): any;
/**
 * Returns the number of items in the stack.
 * @param id - Stack ID
 */
declare function ds_stack_size(id: number): number;
/**
 * Returns true if the stack has no items.
 * @param id - Stack ID
 */
declare function ds_stack_empty(id: number): boolean;
/**
 * Removes all items from the stack.
 * @param id - Stack ID
 */
declare function ds_stack_clear(id: number): void;
/**
 * Copies all items from src into dst (overwrites destination).
 * @param src - Source stack ID
 * @param dst - Destination stack ID
 */
declare function ds_stack_copy(src: number, dst: number): void;
/** Returns true if the stack ID exists. */
declare function ds_stack_exists(id: number): boolean;
//# sourceMappingURL=ds_stack.d.ts.map
/**
 * Background resource \u2014 holds a single texture for tiling/stretching.
 * Mirrors GMS background data structure.
 */

/**
 * A background resource containing a single texture.
 */
declare class background extends resource {
    texture: texture_entry | null;
    width: number;
    height: number;
    tile_h: boolean;
    tile_v: boolean;
    smooth: boolean;
    constructor();
    /**
     * Sets the texture for this background.
     * @param texture - The texture entry to use
     */
    set_texture(texture: texture_entry): void;
}
/**
 * Returns the width of the given background resource.
 * @param bg - Background instance
 */
declare function background_get_width(bg: background): number;
/**
 * Returns the height of the given background resource.
 * @param bg - Background instance
 */
declare function background_get_height(bg: background): number;
//# sourceMappingURL=background.d.ts.map
/**
 * Batched quad renderer for WebGL 2.
 * Collects sprites and shapes into a single vertex buffer and flushes with one draw call.
 * Automatically flushes when the texture, blend mode, or shader changes,
 * or when the buffer is full.
 */
declare class batch_renderer {
    private gl;
    private vao;
    private vbo;
    private vertices;
    private quad_count;
    private current_texture;
    constructor(gl: WebGL2RenderingContext);
    /**
     * Pushes one axis-aligned quad into the batch.
     * Flushes the batch if the texture changes or the buffer is full.
     *
     * @param x - Left edge
     * @param y - Top edge
     * @param w - Width
     * @param h - Height
     * @param u0 - Left UV coordinate
     * @param v0 - Top UV coordinate
     * @param u1 - Right UV coordinate
     * @param v1 - Bottom UV coordinate
     * @param r - Red (0\u20131)
     * @param g - Green (0\u20131)
     * @param b - Blue (0\u20131)
     * @param a - Alpha (0\u20131)
     * @param texture - WebGL texture to sample
     */
    add_quad(x: number, y: number, w: number, h: number, u0: number, v0: number, u1: number, v1: number, r: number, g: number, b: number, a: number, texture: WebGLTexture): void;
    /**
     * Pushes a rotated/scaled quad into the batch.
     * Used for draw_sprite_ext with rotation and scale.
     *
     * @param cx - Center X
     * @param cy - Center Y
     * @param w - Width before scaling
     * @param h - Height before scaling
     * @param ox - Origin X offset from center
     * @param oy - Origin Y offset from center
     * @param xscale - Horizontal scale
     * @param yscale - Vertical scale
     * @param angle_deg - Rotation in degrees (counter-clockwise)
     * @param u0 - Left UV
     * @param v0 - Top UV
     * @param u1 - Right UV
     * @param v1 - Bottom UV
     * @param r - Red (0\u20131)
     * @param g - Green (0\u20131)
     * @param b - Blue (0\u20131)
     * @param a - Alpha (0\u20131)
     * @param texture - WebGL texture
     */
    add_quad_transformed(cx: number, cy: number, w: number, h: number, ox: number, oy: number, xscale: number, yscale: number, angle_deg: number, u0: number, v0: number, u1: number, v1: number, r: number, g: number, b: number, a: number, texture: WebGLTexture): void;
    /**
     * Flushes accumulated quads to the GPU with a single draw call.
     * Resets the batch state after drawing.
     */
    flush(): void;
    /**
     * Frees the VAO and VBO GPU resources.
     */
    destroy(): void;
}
//# sourceMappingURL=batch_renderer.d.ts.map
/**
 * Color constants, constructors, and component extractors.
 * Colors are stored as BGR integers (GMS convention) but converted to RGB when needed.
 *
 * GMS color format: 0xBBGGRR (blue in high byte, red in low byte)
 */
declare const c_aqua = 16776960;
declare const c_black = 0;
declare const c_blue = 16711680;
declare const c_dkgray = 4210752;
declare const c_fuchsia = 16711935;
declare const c_gray = 8421504;
declare const c_green = 32768;
declare const c_lime = 65280;
declare const c_ltgray = 12632256;
declare const c_maroon = 128;
declare const c_navy = 8388608;
declare const c_olive = 32896;
declare const c_orange = 33023;
declare const c_purple = 8388736;
declare const c_red = 255;
declare const c_silver = 12632256;
declare const c_teal = 8421376;
declare const c_white = 16777215;
declare const c_yellow = 65535;
declare const bm_normal = 0;
declare const bm_add = 1;
declare const bm_max = 2;
declare const bm_subtract = 3;
declare const fa_left = 0;
declare const fa_center = 1;
declare const fa_right = 2;
declare const fa_top = 0;
declare const fa_middle = 1;
declare const fa_bottom = 2;
/**
 * Creates a BGR color integer from individual RGB components (0\u2013255).
 * @param r - Red component (0\u2013255)
 * @param g - Green component (0\u2013255)
 * @param b - Blue component (0\u2013255)
 * @returns BGR integer
 */
declare function make_color_rgb(r: number, g: number, b: number): number;
/**
 * Creates a BGR color from hue, saturation, value (all 0\u2013255).
 * @param h - Hue (0\u2013255)
 * @param s - Saturation (0\u2013255)
 * @param v - Value/Brightness (0\u2013255)
 * @returns BGR integer
 */
declare function make_color_hsv(h: number, s: number, v: number): number;
/**
 * Returns the red component (0\u2013255) of a BGR color.
 * @param col - BGR integer
 */
declare function color_get_red(col: number): number;
/**
 * Returns the green component (0\u2013255) of a BGR color.
 * @param col - BGR integer
 */
declare function color_get_green(col: number): number;
/**
 * Returns the blue component (0\u2013255) of a BGR color.
 * @param col - BGR integer
 */
declare function color_get_blue(col: number): number;
/**
 * Linearly blends two BGR colors.
 * @param col1 - First BGR color
 * @param col2 - Second BGR color
 * @param amount - Blend factor (0 = col1, 1 = col2)
 * @returns Blended BGR color
 */
declare function merge_color(col1: number, col2: number, amount: number): number;
/**
 * Converts a BGR integer color to normalized [r, g, b] components (0\u20131 each).
 * @param col - BGR integer
 * @returns [r, g, b] normalized
 */
declare function color_to_rgb_normalized(col: number): [number, number, number];
//# sourceMappingURL=color.d.ts.map
/**
 * Public GMS-style draw_* API functions.
 * All functions delegate to the renderer singleton.
 */

/**
 * Sets the current draw color.
 * @param col - BGR integer color (use c_* constants or make_color_rgb)
 */
declare function draw_set_color(col: number): void;
/**
 * Returns the current draw color as a BGR integer.
 */
declare function draw_get_color(): number;
/**
 * Sets the current draw alpha (transparency).
 * @param alpha - Value from 0 (fully transparent) to 1 (fully opaque)
 */
declare function draw_set_alpha(alpha: number): void;
/**
 * Returns the current draw alpha.
 */
declare function draw_get_alpha(): number;
/**
 * Clears the screen (or current surface target) with a solid color.
 * @param col - BGR integer color
 */
declare function draw_clear(col: number): void;
/**
 * Sets the current blend mode.
 * Flushes the batch before changing.
 * @param mode - bm_normal, bm_add, bm_max, or bm_subtract
 */
declare function draw_set_blend_mode(mode: number): void;
/**
 * Draws a sprite at the given position.
 * @param spr - Sprite resource
 * @param subimg - Frame index (float, will be wrapped)
 * @param x - X position
 * @param y - Y position
 */
declare function draw_sprite(spr: sprite, subimg: number, x: number, y: number): void;
/**
 * Draws a sprite with full transform control.
 * @param spr - Sprite resource
 * @param subimg - Frame index
 * @param x - X position
 * @param y - Y position
 * @param xscale - Horizontal scale (1 = normal)
 * @param yscale - Vertical scale (1 = normal)
 * @param rot - Rotation in degrees (counter-clockwise)
 * @param color - Tint color as BGR integer
 * @param alpha - Alpha (0\u20131)
 */
declare function draw_sprite_ext(spr: sprite, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;
/**
 * Draws a sub-region of a sprite frame.
 * @param spr - Sprite resource
 * @param subimg - Frame index
 * @param left - Source region left in pixels
 * @param top - Source region top in pixels
 * @param width - Source region width in pixels
 * @param height - Source region height in pixels
 * @param x - Destination X
 * @param y - Destination Y
 */
declare function draw_sprite_part(spr: sprite, subimg: number, left: number, top: number, width: number, height: number, x: number, y: number): void;
/**
 * Draws a sprite stretched to a specific size.
 * @param spr - Sprite resource
 * @param subimg - Frame index
 * @param x - Destination X (top-left)
 * @param y - Destination Y (top-left)
 * @param w - Target width in pixels
 * @param h - Target height in pixels
 */
declare function draw_sprite_stretched(spr: sprite, subimg: number, x: number, y: number, w: number, h: number): void;
/**
 * Draws a background at the given position.
 * @param bg - Background resource
 * @param x - X position
 * @param y - Y position
 */
declare function draw_background(bg: any, x: number, y: number): void;
/**
 * Draws a background with full transform control.
 * @param bg - Background resource
 * @param x - X position
 * @param y - Y position
 * @param xscale - Horizontal scale (1 = normal)
 * @param yscale - Vertical scale (1 = normal)
 * @param rot - Rotation in degrees (counter-clockwise)
 * @param color - Tint color as BGR integer
 * @param alpha - Alpha (0\u20131)
 */
declare function draw_background_ext(bg: any, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;
/**
 * Draws a background stretched to fill a region.
 * @param bg - Background resource
 * @param x - X position
 * @param y - Y position
 * @param w - Width
 * @param h - Height
 */
declare function draw_background_stretched(bg: any, x: number, y: number, w: number, h: number): void;
/**
 * Draws a background tiled to fill a region.
 * @param bg - Background resource
 * @param x - X position
 * @param y - Y position
 * @param tile_x - X offset for tiling
 * @param tile_y - Y offset for tiling
 */
declare function draw_background_tiled(bg: any, x: number, y: number, tile_x: number, tile_y: number): void;
/**
 * Draws a single pixel at the given position.
 * @param x - X position
 * @param y - Y position
 */
declare function draw_point(x: number, y: number): void;
/**
 * Draws a line between two points (1 pixel wide).
 * @param x1 - Start X
 * @param y1 - Start Y
 * @param x2 - End X
 * @param y2 - End Y
 */
declare function draw_line(x1: number, y1: number, x2: number, y2: number): void;
/**
 * Draws a line with a specified pixel width.
 * @param x1 - Start X
 * @param y1 - Start Y
 * @param x2 - End X
 * @param y2 - End Y
 * @param w - Width in pixels
 */
declare function draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void;
/**
 * Draws a filled or outlined axis-aligned rectangle.
 * @param x1 - Left edge X
 * @param y1 - Top edge Y
 * @param x2 - Right edge X
 * @param y2 - Bottom edge Y
 * @param outline - True for outline only, false for filled
 */
declare function draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
/**
 * Draws a filled or outlined circle.
 * @param x - Center X
 * @param y - Center Y
 * @param r - Radius in pixels
 * @param outline - True for outline only, false for filled
 */
declare function draw_circle(x: number, y: number, r: number, outline: boolean): void;
/**
 * Draws a filled or outlined ellipse.
 * @param x1 - Bounding box left
 * @param y1 - Bounding box top
 * @param x2 - Bounding box right
 * @param y2 - Bounding box bottom
 * @param outline - True for outline only, false for filled
 */
declare function draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
/**
 * Draws a filled or outlined triangle.
 * @param x1 - Vertex 1 X
 * @param y1 - Vertex 1 Y
 * @param x2 - Vertex 2 X
 * @param y2 - Vertex 2 Y
 * @param x3 - Vertex 3 X
 * @param y3 - Vertex 3 Y
 * @param outline - True for outline only, false for filled
 */
declare function draw_triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, outline: boolean): void;
/**
 * Draws a text string at the given position.
 * Uses the current font, color, alpha, halign, and valign settings.
 * @param x - X position
 * @param y - Y position
 * @param text - The string to draw (numbers will be converted to string)
 */
declare function draw_text(x: number, y: number, text: string | number): void;
/**
 * Sets the active font for text rendering.
 * @param fnt - font_resource instance
 */
declare function draw_set_font(fnt: font_resource): void;
/**
 * Sets the horizontal text alignment.
 * @param halign - fa_left (0), fa_center (1), or fa_right (2)
 */
declare function draw_set_halign(halign: number): void;
/**
 * Sets the vertical text alignment.
 * @param valign - fa_top (0), fa_middle (1), or fa_bottom (2)
 */
declare function draw_set_valign(valign: number): void;
/**
 * Returns the pixel width of a string with the current font.
 * @param text - The string to measure
 */
declare function string_width(text: string): number;
/**
 * Returns the pixel height of a string with the current font.
 */
declare function string_height(): number;
/**
 * Creates a new render-to-texture surface.
 * @param w - Width in pixels
 * @param h - Height in pixels
 * @returns surface object
 */
declare function surface_create(w: number, h: number): surface;
/**
 * Sets the render target to a surface.
 * All subsequent draw calls go to this surface until surface_reset_target().
 * @param surf - Target surface
 */
declare function surface_set_target(surf: surface): void;
/**
 * Resets the render target back to the screen.
 */
declare function surface_reset_target(): void;
/**
 * Frees a surface and its GPU resources.
 * @param surf - Surface to free
 */
declare function surface_free(surf: surface): void;
/**
 * Checks whether a surface is valid (not yet freed).
 * @param surf - Surface to check
 */
declare function surface_exists(surf: surface): boolean;
/**
 * Returns the width of a surface in pixels.
 * @param surf - Surface to query
 */
declare function surface_get_width(surf: surface): number;
/**
 * Returns the height of a surface in pixels.
 * @param surf - Surface to query
 */
declare function surface_get_height(surf: surface): number;
/**
 * Draws a surface at the given position.
 * @param surf - Surface to draw
 * @param x - Destination X
 * @param y - Destination Y
 */
declare function draw_surface(surf: surface, x: number, y: number): void;
//# sourceMappingURL=draw_functions.d.ts.map
/**
 * Text/font rendering via canvas-to-texture.
 * Renders text to a temporary 2D canvas and uploads it as a WebGL texture.
 * Caches textures for strings that are drawn repeatedly.
 */

/**
 * A font resource defining CSS font properties.
 */
declare class font_resource {
    name: string;
    size: number;
    family: string;
    bold: boolean;
    italic: boolean;
    constructor(family?: string, size?: number, bold?: boolean, italic?: boolean);
    /** Builds the CSS font string. */
    private build_css;
}
/** A cached text texture with associated metrics. */
interface text_cache_entry {
    entry: texture_entry;
    width: number;
    height: number;
}
/**
 * Manages text rasterization and caching.
 */
declare class font_renderer {
    private tex_manager;
    private cache;
    private offscreen;
    private ctx;
    constructor(tex_manager: texture_manager);
    /**
     * Returns a cached or newly-rendered texture for the given text string.
     * @param text - Text to render
     * @param fnt - Font resource to use
     * @param color_css - CSS color string (e.g. "#FFFFFF")
     * @returns text_cache_entry containing the texture and dimensions
     */
    get_texture(text: string, fnt: font_resource, color_css: string): text_cache_entry;
    /**
     * Rasterizes text to a canvas and uploads it to a WebGL texture.
     */
    private rasterize;
    /**
     * Measures the pixel width of a string with the given font.
     * @param text - Text to measure
     * @param fnt - Font resource
     * @returns Width in pixels
     */
    measure_width(text: string, fnt: font_resource): number;
    /**
     * Measures the pixel height of a string with the given font.
     * @param fnt - Font resource
     * @returns Height in pixels
     */
    measure_height(fnt: font_resource): number;
    /**
     * Clears the text texture cache and frees GPU memory.
     */
    clear_cache(): void;
}

//# sourceMappingURL=font.d.ts.map
/**
 * Core WebGL 2 renderer.
 * Owns the canvas, GL context, default shader, projection matrix, and batch renderer.
 * All drawing functions go through this module.
 */

/** Surface (render-to-texture target). Created by surface_create(). */
interface surface {
    fbo: WebGLFramebuffer;
    texture: WebGLTexture;
    width: number;
    height: number;
    valid: boolean;
}
/**
 * Main renderer singleton.
 * Initialised once via renderer.init() before the game loop starts.
 */
declare class renderer {
    private static gl;
    private static canvas;
    private static program;
    private static projection_loc;
    private static active_proj_loc;
    private static batch;
    static tex_mgr: texture_manager;
    private static font_rend;
    private static draw_color;
    private static draw_alpha;
    private static blend_mode;
    private static current_font;
    private static halign;
    private static valign;
    private static active_surface;
    /**
     * Initialises the renderer with an existing canvas or creates a new one.
     * Must be called before any drawing functions.
     * @param canvas_or_id - Canvas element or CSS selector string
     * @param width - Canvas width in pixels
     * @param height - Canvas height in pixels
     */
    static init(canvas_or_id: HTMLCanvasElement | string, width?: number, height?: number): void;
    /**
     * Uploads an orthographic projection matrix for pixel-space coordinates.
     * Origin at top-left, Y increases downward.
     * @param w - Viewport width
     * @param h - Viewport height
     */
    static upload_projection(w: number, h: number): void;
    /**
     * Called at the start of each draw frame.
     * Clears the color buffer and prepares the render state.
     * @param r - Clear color red (0\u20131)
     * @param g - Clear color green (0\u20131)
     * @param b - Clear color blue (0\u20131)
     */
    static begin_frame(r?: number, g?: number, b?: number): void;
    /**
     * Called at the end of each draw frame to flush remaining batched quads.
     */
    static end_frame(): void;
    /** Sets the current draw color (BGR integer). */
    static set_color(col: number): void;
    /** Returns the current draw color (BGR integer). */
    static get_color(): number;
    /** Sets the current draw alpha (0\u20131). */
    static set_alpha(a: number): void;
    /** Returns the current draw alpha. */
    static get_alpha(): number;
    /** Returns the currently active font resource. */
    static get_current_font(): font_resource;
    /** Sets the current font for text rendering. */
    static set_font(fnt: font_resource): void;
    /** Sets the horizontal text alignment (fa_left / fa_center / fa_right). */
    static set_halign(align: number): void;
    /** Sets the vertical text alignment (fa_top / fa_middle / fa_bottom). */
    static set_valign(align: number): void;
    /**
     * Sets the active blend mode.
     * Flushes the current batch before changing GL blend state.
     * @param mode - bm_normal, bm_add, bm_max, or bm_subtract
     */
    static set_blend_mode(mode: number): void;
    private static apply_blend_mode;
    /**
     * Creates a new render-to-texture surface.
     * @param w - Surface width in pixels
     * @param h - Surface height in pixels
     * @returns surface object
     */
    static surface_create(w: number, h: number): surface;
    /**
     * Sets the render target to a surface.
     * Subsequent draw calls will render into the surface.
     * @param surf - Target surface
     */
    static surface_set_target(surf: surface): void;
    /**
     * Resets the render target back to the screen.
     */
    static surface_reset_target(): void;
    /**
     * Frees a surface's GPU resources.
     * @param surf - Surface to free
     */
    static surface_free(surf: surface): void;
    /**
     * Draws a sprite at the given position using the instance's current frame.
     * @param spr - Sprite resource
     * @param subimg - Frame index (float; will be floored and wrapped)
     * @param x - X position (adjusted for sprite origin)
     * @param y - Y position (adjusted for sprite origin)
     */
    static draw_sprite(spr: sprite, subimg: number, x: number, y: number): void;
    /**
     * Draws a sprite with extended transforms (scale, rotation, blend color, alpha).
     * @param spr - Sprite resource
     * @param subimg - Frame index
     * @param x - X position
     * @param y - Y position
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     * @param rot - Rotation in degrees (counter-clockwise)
     * @param color - Tint color (BGR integer, 0xFFFFFF = no tint)
     * @param alpha - Transparency (0\u20131)
     */
    static draw_sprite_ext(spr: sprite, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;
    /**
     * Draws a sub-region of a sprite frame.
     * @param spr - Sprite resource
     * @param subimg - Frame index
     * @param left - Source left (pixels from frame left)
     * @param top - Source top (pixels from frame top)
     * @param width - Source width in pixels
     * @param height - Source height in pixels
     * @param x - Destination X
     * @param y - Destination Y
     */
    static draw_sprite_part(spr: sprite, subimg: number, left: number, top: number, width: number, height: number, x: number, y: number): void;
    /**
     * Draws a sprite stretched to fit the given dimensions.
     * @param spr - Sprite resource
     * @param subimg - Frame index
     * @param x - Destination X (top-left)
     * @param y - Destination Y (top-left)
     * @param w - Target width
     * @param h - Target height
     */
    static draw_sprite_stretched(spr: sprite, subimg: number, x: number, y: number, w: number, h: number): void;
    /**
     * Draws a background at the given position.
     * @param bg - Background resource
     * @param x - X position
     * @param y - Y position
     */
    static draw_background(bg: any, x: number, y: number): void;
    /**
     * Draws a background with extended transforms (scale, rotation, blend color, alpha).
     * @param bg - Background resource
     * @param x - X position
     * @param y - Y position
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     * @param rot - Rotation in degrees (counter-clockwise)
     * @param color - Blend color as BGR integer
     * @param alpha - Alpha transparency (0\u20131)
     */
    static draw_background_ext(bg: any, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;
    /**
     * Draws a background stretched to fill a specified region.
     * @param bg - Background resource
     * @param x - X position
     * @param y - Y position
     * @param w - Width
     * @param h - Height
     */
    static draw_background_stretched(bg: any, x: number, y: number, w: number, h: number): void;
    /**
     * Draws a background tiled to fill the current view.
     * @param bg - Background resource
     * @param x - X offset
     * @param y - Y offset
     * @param tile_x - X tile offset
     * @param tile_y - Y tile offset
     */
    static draw_background_tiled(bg: any, x: number, y: number, tile_x: number, tile_y: number): void;
    /**
     * Draws a surface as if it were a sprite.
     * @param surf - Surface to draw
     * @param x - Destination X
     * @param y - Destination Y
     */
    static draw_surface(surf: surface, x: number, y: number): void;
    /**
     * Draws a text string at the given position using the current font and alignment.
     * @param x - X position
     * @param y - Y position
     * @param text - String to draw
     */
    static draw_text(x: number, y: number, text: string): void;
    /**
     * Clears the screen (or current surface) with a solid color.
     * @param col - BGR color integer
     */
    static draw_clear(col: number): void;
    /**
     * Draws a filled or outlined axis-aligned rectangle.
     * @param x1 - Left
     * @param y1 - Top
     * @param x2 - Right
     * @param y2 - Bottom
     * @param outline - True for outline only, false for filled
     */
    static draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
    /**
     * Draws a filled or outlined circle using a triangle fan approximation.
     * @param cx - Center X
     * @param cy - Center Y
     * @param r_px - Radius in pixels
     * @param outline - True for outline only
     */
    static draw_circle(cx: number, cy: number, r_px: number, outline: boolean): void;
    /**
     * Draws a line between two points.
     * @param x1 - Start X
     * @param y1 - Start Y
     * @param x2 - End X
     * @param y2 - End Y
     */
    static draw_line(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Draws a line with a specific pixel width.
     * @param x1 - Start X
     * @param y1 - Start Y
     * @param x2 - End X
     * @param y2 - End Y
     * @param w - Line width in pixels
     */
    static draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void;
    /**
     * Draws a single point (1\xD71 pixel) at the given position.
     * @param x - X position
     * @param y - Y position
     */
    static draw_point(x: number, y: number): void;
    /**
     * Draws a filled or outlined triangle.
     * @param x1 - Vertex 1 X
     * @param y1 - Vertex 1 Y
     * @param x2 - Vertex 2 X
     * @param y2 - Vertex 2 Y
     * @param x3 - Vertex 3 X
     * @param y3 - Vertex 3 Y
     * @param outline - True for outline only
     */
    static draw_triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, outline: boolean): void;
    /**
     * Draws a filled or outlined ellipse.
     * @param x1 - Bounding box left
     * @param y1 - Bounding box top
     * @param x2 - Bounding box right
     * @param y2 - Bounding box bottom
     * @param outline - True for outline only
     */
    static draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
    /**
     * Draws a triangle as two batch quads (degenerate quad approach).
     * The third quad vertex is the same as vertex 3 making a true triangle.
     */
    private static draw_triangle_internal;
    /**
     * Draws a line as a thin rectangular quad aligned to the line direction.
     */
    private static draw_line_width_internal;
    /** Returns the underlying HTML canvas element. */
    static get_canvas(): HTMLCanvasElement;
    /** Returns the WebGL 2 context. */
    static get_gl(): WebGL2RenderingContext;
    /** Returns the batch renderer (used by advanced rendering). */
    static get_batch(): batch_renderer;
    /** Flushes the current batch without a program change. Used by shader_system. */
    static flush_batch(): void;
    /**
     * Switches back to the default engine shader program and re-uploads projection.
     * Called by shader_reset().
     */
    static restore_default_program(): void;
    /**
     * Uploads the orthographic projection matrix to an arbitrary program's
     * u_projection uniform. Used when activating a user shader.
     * @param prog - The WebGLProgram to upload to
     */
    static upload_projection_to_program(prog: WebGLProgram): void;
    /**
     * Uploads a custom projection matrix to the currently active program's
     * u_projection uniform. Used by view_apply() to set room-offset projections.
     * Avoids gl.getParameter() GPU readback by using the cached active location.
     * @param matrix - 16-element column-major Float32Array
     */
    static set_view_projection(matrix: Float32Array): void;
    /** Returns the font renderer. */
    static get_font_renderer(): font_renderer;
    /**
     * Frees all GPU resources owned by the renderer.
     */
    static destroy(): void;
}
//# sourceMappingURL=renderer.d.ts.map
/**
 * Shader compilation and program linking utilities for WebGL 2.
 */
/** GLSL vertex shader source for the default 2D sprite/shape renderer. */
declare const DEFAULT_VERTEX_SHADER = "#version 300 es\\nlayout(location = 0) in vec2 a_position;\\nlayout(location = 1) in vec2 a_texcoord;\\nlayout(location = 2) in vec4 a_color;\\n\\nuniform mat4 u_projection;\\n\\nout vec2 v_texcoord;\\nout vec4 v_color;\\n\\nvoid main() {\\n    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);\\n    v_texcoord = a_texcoord;\\n    v_color = a_color;\\n}";
/** GLSL fragment shader source for the default 2D sprite/shape renderer. */
declare const DEFAULT_FRAGMENT_SHADER = "#version 300 es\\nprecision mediump float;\\n\\nin vec2 v_texcoord;\\nin vec4 v_color;\\n\\nuniform sampler2D u_texture;\\n\\nout vec4 fragColor;\\n\\nvoid main() {\\n    fragColor = texture(u_texture, v_texcoord) * v_color;\\n}";
/**
 * Compiles a single GLSL shader of the given type.
 * @param gl - WebGL 2 context
 * @param type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param source - GLSL source string
 * @returns Compiled WebGLShader
 */
declare function compile_shader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader;
/**
 * Links a vertex and fragment shader into a WebGL program.
 * @param gl - WebGL 2 context
 * @param vs_source - Vertex shader GLSL source
 * @param fs_source - Fragment shader GLSL source
 * @returns Linked WebGLProgram
 */
declare function create_program(gl: WebGL2RenderingContext, vs_source: string, fs_source: string): WebGLProgram;
/**
 * Represents a compiled user shader with cached uniform locations.
 */
declare class shader_program {
    readonly program: WebGLProgram;
    private gl;
    private uniform_cache;
    constructor(gl: WebGL2RenderingContext, vs_source: string, fs_source: string);
    /**
     * Gets and caches a uniform location by name.
     * @param name - Uniform variable name in GLSL
     * @returns WebGLUniformLocation or null if not found
     */
    get_uniform(name: string): WebGLUniformLocation | null;
    /**
     * Frees the shader program's GPU resources.
     */
    destroy(): void;
}
//# sourceMappingURL=shader.d.ts.map
/**
 * User-facing shader system.
 *
 * Wraps shader_program to give a GMS-compatible API:
 *   shader_set()        \u2014 activates a user shader
 *   shader_reset()      \u2014 returns to the default shader
 *   shader_get_uniform  \u2014 returns a uniform handle (WebGLUniformLocation)
 *   shader_set_uniform_f/i/mat \u2014 upload uniform values
 *
 * The active shader is set on the renderer's GL context.
 * The renderer's batch must be flushed before switching programs.
 */

/**
 * A user-defined shader asset.
 * Create with new user_shader(vs_source, fs_source).
 */
declare class user_shader {
    readonly internal: shader_program;
    /**
     * @param vs_source - Vertex shader GLSL source (#version 300 es required)
     * @param fs_source - Fragment shader GLSL source
     */
    constructor(vs_source: string, fs_source: string);
    /**
     * Frees the shader's GPU resources.
     * Do not use the shader after calling destroy().
     */
    destroy(): void;
}
/**
 * Activates a user shader program for subsequent draw calls.
 * The renderer's batch is flushed before switching.
 * @param shader - The user_shader to activate
 */
declare function shader_set(shader: user_shader): void;
/**
 * Resets to the default engine shader program.
 * The renderer's batch is flushed before switching.
 */
declare function shader_reset(): void;
/**
 * Returns the currently active user shader, or null if using the default.
 */
declare function shader_current(): user_shader | null;
/**
 * Returns a uniform handle for use with shader_set_uniform_*.
 * @param shader - The shader containing the uniform
 * @param name - GLSL uniform variable name
 * @returns WebGLUniformLocation or null if not found
 */
declare function shader_get_uniform(shader: user_shader, name: string): WebGLUniformLocation | null;
/**
 * Sets a float uniform value (1 component).
 * @param location - Uniform location from shader_get_uniform
 * @param val - Float value
 */
declare function shader_set_uniform_f(location: WebGLUniformLocation, val: number): void;
/**
 * Sets a vec2 float uniform.
 * @param location - Uniform location
 * @param x - X component
 * @param y - Y component
 */
declare function shader_set_uniform_f2(location: WebGLUniformLocation, x: number, y: number): void;
/**
 * Sets a vec3 float uniform.
 * @param location - Uniform location
 * @param x - X component
 * @param y - Y component
 * @param z - Z component
 */
declare function shader_set_uniform_f3(location: WebGLUniformLocation, x: number, y: number, z: number): void;
/**
 * Sets a vec4 float uniform.
 * @param location - Uniform location
 * @param x - X
 * @param y - Y
 * @param z - Z
 * @param w - W
 */
declare function shader_set_uniform_f4(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void;
/**
 * Sets an integer uniform value (1 component).
 * @param location - Uniform location
 * @param val - Integer value
 */
declare function shader_set_uniform_i(location: WebGLUniformLocation, val: number): void;
/**
 * Sets an ivec2 integer uniform.
 * @param location - Uniform location
 * @param x - X component
 * @param y - Y component
 */
declare function shader_set_uniform_i2(location: WebGLUniformLocation, x: number, y: number): void;
/**
 * Sets a float array uniform.
 * @param location - Uniform location
 * @param values - Float array
 */
declare function shader_set_uniform_f_array(location: WebGLUniformLocation, values: Float32Array | number[]): void;
/**
 * Sets a mat4 uniform from a 16-element column-major Float32Array.
 * @param location - Uniform location
 * @param matrix - 16-element column-major matrix
 * @param transpose - Whether to transpose (default false)
 */
declare function shader_set_uniform_matrix(location: WebGLUniformLocation, matrix: Float32Array, transpose?: boolean): void;
//# sourceMappingURL=shader_system.d.ts.map
/**
 * Sprite resource \u2014 holds frames (textures) and origin point.
 * Mirrors GMS sprite data structure.
 */

/**
 * A single frame of a sprite animation.
 */
interface sprite_frame {
    texture: texture_entry;
    width: number;
    height: number;
}
/**
 * A sprite resource containing one or more animation frames and an origin point.
 */
declare class sprite extends resource {
    frames: sprite_frame[];
    xoffset: number;
    yoffset: number;
    width: number;
    height: number;
    constructor();
    /**
     * Adds a frame to this sprite.
     * @param frame - The frame to add
     */
    add_frame(frame: sprite_frame): void;
    /**
     * Returns the number of frames in this sprite.
     */
    get_number(): number;
    /**
     * Returns the frame at the given index, wrapping around if out of range.
     * @param index - Frame index
     * @returns sprite_frame or undefined if the sprite has no frames
     */
    get_frame(index: number): sprite_frame | undefined;
}
/**
 * Returns the width of the given sprite resource.
 * @param spr - Sprite instance
 */
declare function sprite_get_width(spr: sprite): number;
/**
 * Returns the height of the given sprite resource.
 * @param spr - Sprite instance
 */
declare function sprite_get_height(spr: sprite): number;
/**
 * Returns the X origin of the given sprite resource.
 * @param spr - Sprite instance
 */
declare function sprite_get_xoffset(spr: sprite): number;
/**
 * Returns the Y origin of the given sprite resource.
 * @param spr - Sprite instance
 */
declare function sprite_get_yoffset(spr: sprite): number;
/**
 * Returns the number of frames of the given sprite resource.
 * @param spr - Sprite instance
 */
declare function sprite_get_number(spr: sprite): number;
/** Registers a sprite resource under a name so it can be looked up by name. */
declare function sprite_register_name(name: string, id: number): void;
/**
 * Returns the resource id of a sprite by its project name, or -1 if unknown.
 * GMS-style asset lookup \u2014 e.g. resolving \`static sprite = 'spr_player'\`.
 * @param name - Sprite resource name
 */
declare function sprite_get_index(name: string): number;
//# sourceMappingURL=sprite.d.ts.map
/**
 * Manages WebGL 2 texture loading and the 1x1 white pixel fallback texture.
 */
interface texture_entry {
    texture: WebGLTexture;
    width: number;
    height: number;
}
/**
 * Centralized texture registry.
 * Tracks all loaded textures and provides a shared 1x1 white pixel texture for shape drawing.
 */
declare class texture_manager {
    private gl;
    white_pixel: WebGLTexture;
    private textures;
    constructor(gl: WebGL2RenderingContext);
    /**
     * Creates the 1x1 white pixel texture used when drawing solid-colored shapes.
     * @returns WebGLTexture handle
     */
    private create_white_pixel;
    /**
     * Loads a texture from a URL and caches it by URL.
     * @param url - Image URL
     * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)
     * @returns Promise resolving to the texture entry
     */
    load(url: string, smooth?: boolean): Promise<texture_entry>;
    /**
     * Creates a texture from an already-loaded HTMLImageElement.
     * @param img - Source image element
     * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)
     * @returns texture_entry
     */
    from_image(img: HTMLImageElement, smooth?: boolean): texture_entry;
    /**
     * Creates a texture from a raw HTMLCanvasElement (used for text rendering).
     * @param canvas - Source canvas element
     * @param smooth - Use LINEAR filtering (true) or NEAREST (false)
     * @returns texture_entry
     */
    from_canvas(canvas: HTMLCanvasElement, smooth?: boolean): texture_entry;
    /**
     * Frees a texture from GPU memory and removes it from the cache.
     * @param url - URL key used when loading
     */
    free(url: string): void;
    /**
     * Frees a raw WebGLTexture directly (used by font_renderer cache cleanup).
     * @param texture - The GPU texture handle to delete
     */
    free_texture(texture: WebGLTexture): void;
    /**
     * Frees all tracked textures and the white pixel texture.
     */
    destroy(): void;
}
//# sourceMappingURL=texture_manager.d.ts.map
/**
 * View / camera system.
 *
 * A view defines the visible region of the room mapped onto a viewport
 * (a rectangle on screen). Multiple views can be active simultaneously.
 *
 * GMS-compatible API:
 *   view_set / view_get \u2014 configure view properties
 *   camera_set_view_pos / camera_set_view_size \u2014 convenience setters
 *   view_apply \u2014 activate a view (sets GL viewport + projection)
 *
 * All coordinates are in room (world) space unless noted otherwise.
 */
interface view_config {
    enabled: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
    port_x: number;
    port_y: number;
    port_w: number;
    port_h: number;
    angle: number;
}
/**
 * Returns the view config for a given view index.
 * @param view_index - View slot (0\u20137)
 */
declare function view_get(view_index: number): view_config;
/**
 * Enables or disables a view.
 * @param view_index - View slot (0\u20137)
 * @param enabled - True to enable
 */
declare function view_set_enabled(view_index: number, enabled: boolean): void;
/**
 * Sets the room-space position of a view.
 * @param view_index - View slot
 * @param x - Room X
 * @param y - Room Y
 */
declare function view_set_position(view_index: number, x: number, y: number): void;
/**
 * Sets the room-space size of a view.
 * @param view_index - View slot
 * @param w - Width in room pixels
 * @param h - Height in room pixels
 */
declare function view_set_size(view_index: number, w: number, h: number): void;
/**
 * Sets the screen-space viewport rectangle for a view.
 * @param view_index - View slot
 * @param px - Viewport left (screen pixels)
 * @param py - Viewport top (screen pixels)
 * @param pw - Viewport width (screen pixels)
 * @param ph - Viewport height (screen pixels)
 */
declare function view_set_port(view_index: number, px: number, py: number, pw: number, ph: number): void;
/**
 * Sets the view rotation angle in degrees.
 * @param view_index - View slot
 * @param angle - Rotation angle (degrees, counter-clockwise)
 */
declare function view_set_angle(view_index: number, angle: number): void;
/**
 * Applies a view to the GL context: sets the GL viewport and uploads
 * a projection matrix that maps room coordinates to clip space.
 *
 * The projection maps the room region [x, x+w] \xD7 [y, y+h] into the
 * viewport [port_x, port_x+port_w] \xD7 [port_y, port_y+port_h].
 *
 * @param view_index - View slot to apply
 */
declare function view_apply(view_index: number): void;
/**
 * Convenience: sets view 0's room-space position and enables it.
 * Equivalent to camera_set_view_pos in GMS.
 * @param x - Camera/view X in room space
 * @param y - Camera/view Y in room space
 */
declare function camera_set_view_pos(x: number, y: number): void;
/**
 * Convenience: sets view 0's room-space size and enables it.
 * @param w - Width in room pixels
 * @param h - Height in room pixels
 */
declare function camera_set_view_size(w: number, h: number): void;
/**
 * Returns the X offset of a given view (for room-to-screen coordinate mapping).
 * @param view_index - View slot (default 0)
 */
declare function view_get_x(view_index?: number): number;
/**
 * Returns the Y offset of a given view.
 * @param view_index - View slot (default 0)
 */
declare function view_get_y(view_index?: number): number;
//# sourceMappingURL=view.d.ts.map
/**
 * Silkweaver Engine \u2014 public API entry point.
 *
 * Import individual namespaces or use named imports.
 * The engine is initialized by calling renderer.init() before game_loop.start().
 */

//# sourceMappingURL=index.d.ts.map
/**
 * Gamepad input system \u2014 wraps the Web Gamepad API.
 *
 * The Gamepad API is polled (not event-driven); gamepad_manager.poll()
 * must be called each step to refresh state.
 *
 * Button indices follow the standard gamepad layout (Xbox/PlayStation mapping).
 */
declare const gp_face1 = 0;
declare const gp_face2 = 1;
declare const gp_face3 = 2;
declare const gp_face4 = 3;
declare const gp_shoulderl = 4;
declare const gp_shoulderr = 5;
declare const gp_shoulderlb = 6;
declare const gp_shoulderrb = 7;
declare const gp_select = 8;
declare const gp_start = 9;
declare const gp_stickl = 10;
declare const gp_stickr = 11;
declare const gp_padu = 12;
declare const gp_padd = 13;
declare const gp_padl = 14;
declare const gp_padr = 15;
declare const gp_axislh = 0;
declare const gp_axislv = 1;
declare const gp_axisrh = 2;
declare const gp_axisrv = 3;
declare class gamepad_manager {
    private static _states;
    /**
     * Polls the Gamepad API and refreshes all state snapshots.
     * Must be called every step before gamepad functions are queried.
     */
    static poll(): void;
    /** Returns true if the Gamepad API is supported by the browser. */
    static is_supported(): boolean;
    /** Returns true if device index \`device\` is connected. */
    static is_connected(device: number): boolean;
    /** Returns the number of connected gamepad slots (may include gaps). */
    static get_device_count(): number;
    /** Returns the device description string (controller name). */
    static get_description(device: number): string;
    /** Returns the number of axes on device. */
    static axis_count(device: number): number;
    /**
     * Returns the current value of an axis (-1 to 1, dead zone not applied).
     * @param device - Gamepad index
     * @param axis - Axis index (use gp_axis* constants)
     */
    static axis_value(device: number, axis: number): number;
    /** Returns the number of buttons on device. */
    static button_count(device: number): number;
    /** Returns true if button is currently held. */
    static button_check(device: number, button: number): boolean;
    /** Returns true if button was pressed this step (was up last step, down now). */
    static button_check_pressed(device: number, button: number): boolean;
    /** Returns true if button was released this step. */
    static button_check_released(device: number, button: number): boolean;
    /**
     * Returns the analog button value (0 to 1) for triggers or 0/1 for digital buttons.
     * @param device - Gamepad index
     * @param button - Button index
     */
    static button_value(device: number, button: number): number;
    /**
     * Sets controller vibration (rumble).
     * @param device - Gamepad index
     * @param left - Left motor strength (0\u20131)
     * @param right - Right motor strength (0\u20131)
     */
    static set_vibration(device: number, left: number, right: number): void;
}
/** Returns true if the Gamepad API is supported. */
declare function gamepad_is_supported(): boolean;
/** Returns true if device index is connected. */
declare function gamepad_is_connected(device: number): boolean;
/** Returns the number of detected gamepad slots. */
declare function gamepad_get_device_count(): number;
/** Returns the description string of a gamepad. */
declare function gamepad_get_description(device: number): string;
/** Returns the number of axes on a gamepad. */
declare function gamepad_axis_count(device: number): number;
/** Returns the current axis value (-1 to 1). */
declare function gamepad_axis_value(device: number, axis: number): number;
/** Returns the number of buttons on a gamepad. */
declare function gamepad_button_count(device: number): number;
/** Returns true if the button is held this step. */
declare function gamepad_button_check(device: number, button: number): boolean;
/** Returns true if the button was pressed this step. */
declare function gamepad_button_check_pressed(device: number, button: number): boolean;
/** Returns true if the button was released this step. */
declare function gamepad_button_check_released(device: number, button: number): boolean;
/** Returns the analog button value (0\u20131). */
declare function gamepad_button_value(device: number, button: number): number;
/** Sets gamepad vibration. */
declare function gamepad_set_vibration(device: number, left: number, right: number): void;
//# sourceMappingURL=gamepad.d.ts.map
/**
 * Keyboard input system.
 *
 * Tracks key state across three categories:
 *   - held:     key is currently down
 *   - pressed:  key went down THIS step (cleared after one step)
 *   - released: key went up THIS step (cleared after one step)
 *
 * Call keyboard_manager.poll() once per step (done by the game loop).
 * Call keyboard_manager.end_step() after events fire to clear pressed/released.
 */
declare const vk_nokey = 0;
declare const vk_anykey = 1;
declare const vk_backspace = 8;
declare const vk_tab = 9;
declare const vk_enter = 13;
declare const vk_shift = 16;
declare const vk_control = 17;
declare const vk_alt = 18;
declare const vk_pause = 19;
declare const vk_escape = 27;
declare const vk_space = 32;
declare const vk_pageup = 33;
declare const vk_pagedown = 34;
declare const vk_end = 35;
declare const vk_home = 36;
declare const vk_left = 37;
declare const vk_up = 38;
declare const vk_right = 39;
declare const vk_down = 40;
declare const vk_insert = 45;
declare const vk_delete = 46;
declare const vk_f1 = 112;
declare const vk_f2 = 113;
declare const vk_f3 = 114;
declare const vk_f4 = 115;
declare const vk_f5 = 116;
declare const vk_f6 = 117;
declare const vk_f7 = 118;
declare const vk_f8 = 119;
declare const vk_f9 = 120;
declare const vk_f10 = 121;
declare const vk_f11 = 122;
declare const vk_f12 = 123;
declare const vk_numpad0 = 96;
declare const vk_numpad1 = 97;
declare const vk_numpad2 = 98;
declare const vk_numpad3 = 99;
declare const vk_numpad4 = 100;
declare const vk_numpad5 = 101;
declare const vk_numpad6 = 102;
declare const vk_numpad7 = 103;
declare const vk_numpad8 = 104;
declare const vk_numpad9 = 105;
declare const vk_multiply = 106;
declare const vk_add = 107;
declare const vk_subtract = 109;
declare const vk_decimal = 110;
declare const vk_divide = 111;
declare const vk_printscreen = 44;
/**
 * Internal keyboard state manager.
 * Attach to window events via keyboard_manager.attach().
 */
declare class keyboard_manager {
    private static _held;
    private static _pressed;
    private static _released;
    private static _key_map;
    /** Last key code that was pressed. */
    static keyboard_key: number;
    /** Previous key code (key before the last). */
    static keyboard_lastkey: number;
    /** Last character typed (from keypress events). */
    static keyboard_lastchar: string;
    /** Accumulated typed string (cleared by the game or manually). */
    static keyboard_string: string;
    private static _attached;
    private static _on_keydown;
    private static _on_keyup;
    private static _on_keypress;
    /**
     * Attaches keyboard listeners to the window.
     * Called once by input_manager.init().
     */
    static attach(): void;
    /**
     * Detaches keyboard listeners from the window.
     */
    static detach(): void;
    private static _handle_down;
    private static _handle_up;
    private static _handle_press;
    private static _map;
    /**
     * Clears the pressed and released sets at the end of each step.
     * Called by the game loop after all events have fired.
     */
    static end_step(): void;
    /** Returns true if the key is currently held down. */
    static check(key: number): boolean;
    /** Returns true if the key was pressed this step. */
    static check_pressed(key: number): boolean;
    /** Returns true if the key was released this step. */
    static check_released(key: number): boolean;
    /** Clears the held/pressed/released state for a specific key. */
    static clear(key: number): void;
    /** Simulates pressing a key. */
    static key_press(key: number): void;
    /** Simulates releasing a key. */
    static key_release(key: number): void;
    /** Remaps key1 to behave as key2. */
    static set_map(key1: number, key2: number): void;
    /** Returns the mapped key code for a given input code. */
    static get_map(key: number): number;
    /** Clears all key remappings. */
    static unset_map(): void;
}
/** Returns true if key is currently held down. */
declare function keyboard_check(key: number): boolean;
/** Returns true if key was just pressed this step. */
declare function keyboard_check_pressed(key: number): boolean;
/** Returns true if key was just released this step. */
declare function keyboard_check_released(key: number): boolean;
/** Direct key state check \u2014 same as keyboard_check() in this implementation. */
declare function keyboard_check_direct(key: number): boolean;
/** Clears the held/pressed/released state for a key. */
declare function keyboard_clear(key: number): void;
/** Simulates pressing a key. */
declare function keyboard_key_press(key: number): void;
/** Simulates releasing a key. */
declare function keyboard_key_release(key: number): void;
/** Remaps key1 to act as key2. */
declare function keyboard_set_map(key1: number, key2: number): void;
/** Returns the current mapping for key. */
declare function keyboard_get_map(key: number): number;
/** Clears all key remappings. */
declare function keyboard_unset_map(): void;
//# sourceMappingURL=keyboard.d.ts.map
/**
 * Mouse input system.
 *
 * Tracks mouse button state (held/pressed/released), position, and scroll wheel.
 * mouse_x / mouse_y are in room coordinates (accounts for view offset).
 * window_mouse_get_x/y return raw canvas-relative pixel coordinates.
 */
declare const mb_none = 0;
declare const mb_left = 1;
declare const mb_right = 2;
declare const mb_middle = 3;
declare const mb_any = 4;
/**
 * Internal mouse state manager.
 * Attach to the canvas via mouse_manager.attach(canvas).
 */
declare class mouse_manager {
    private static _held;
    private static _pressed;
    private static _released;
    private static _canvas;
    /** Mouse X in canvas pixel coordinates. */
    static window_x: number;
    /** Mouse Y in canvas pixel coordinates. */
    static window_y: number;
    /** Mouse X in room space (window_x + view offset). Updated each step. */
    static mouse_x: number;
    /** Mouse Y in room space (window_y + view offset). Updated each step. */
    static mouse_y: number;
    /** Currently held button (0 = none). */
    static mouse_button: number;
    /** Last button that was clicked. */
    static mouse_lastbutton: number;
    /** True if the scroll wheel moved up this step. */
    private static _wheel_up;
    /** True if the scroll wheel moved down this step. */
    private static _wheel_down;
    private static _attached;
    private static _on_mousedown;
    private static _on_mouseup;
    private static _on_mousemove;
    private static _on_wheel;
    private static _on_contextmenu;
    /**
     * Attaches mouse listeners to a canvas element.
     * @param canvas - The game canvas
     */
    static attach(canvas: HTMLCanvasElement): void;
    /**
     * Detaches mouse listeners from the canvas.
     */
    static detach(): void;
    private static _get_button;
    private static _handle_down;
    private static _handle_up;
    private static _handle_move;
    private static _handle_wheel;
    private static _update_position;
    /**
     * Updates room-space mouse coordinates using the current view offset.
     * Called once per step by the game loop before keyboard/mouse events fire.
     * @param view_x - Current view X offset in the room
     * @param view_y - Current view Y offset in the room
     */
    static update_room_position(view_x: number, view_y: number): void;
    /** Clears pressed/released state and wheel flags at the end of each step. */
    static end_step(): void;
    /** Returns true if button is held. */
    static check(btn: number): boolean;
    /** Returns true if button was pressed this step. */
    static check_pressed(btn: number): boolean;
    /** Returns true if button was released this step. */
    static check_released(btn: number): boolean;
    /** Clears state for a specific button. */
    static clear(btn: number): void;
    /** Returns true if the wheel scrolled up this step. */
    static wheel_up(): boolean;
    /** Returns true if the wheel scrolled down this step. */
    static wheel_down(): boolean;
}
/** Returns true if mouse button is currently held. */
declare function mouse_check_button(button: number): boolean;
/** Returns true if mouse button was pressed this step. */
declare function mouse_check_button_pressed(button: number): boolean;
/** Returns true if mouse button was released this step. */
declare function mouse_check_button_released(button: number): boolean;
/** Clears state for a mouse button. */
declare function mouse_clear(button: number): void;
/** Returns true if the scroll wheel moved up this step. */
declare function mouse_wheel_up(): boolean;
/** Returns true if the scroll wheel moved down this step. */
declare function mouse_wheel_down(): boolean;
/** Returns mouse X position in window (canvas-relative pixels). */
declare function window_mouse_get_x(): number;
/** Returns mouse Y position in window (canvas-relative pixels). */
declare function window_mouse_get_y(): number;
/**
 * Moves the OS cursor to the given canvas-relative position.
 * Note: browsers do not support arbitrary cursor warping.
 * This is a no-op stub for GMS API compatibility.
 */
declare function window_mouse_set(_x: number, _y: number): void;
//# sourceMappingURL=mouse.d.ts.map
/**
 * Touch input system \u2014 wraps the browser Touch Events API.
 *
 * GMS models touch as numbered "devices" (fingers), mapped to virtual mice.
 * This module follows the same pattern: each active touch point is a device.
 *
 * device_mouse_check_button / device_mouse_x / device_mouse_y mirror GMS's API.
 * Finger 0 is conventionally the primary touch; fingers 1+ are additional points.
 *
 * Call touch_manager.end_step() at the end of each step (done by input_manager).
 */
/**
 * Internal touch state manager.
 * Attach to a canvas element via touch_manager.attach(canvas).
 */
declare class touch_manager {
    private static _points;
    private static _canvas;
    private static _attached;
    private static _on_start;
    private static _on_end;
    private static _on_move;
    private static _on_cancel;
    /**
     * Attaches touch listeners to a canvas element.
     * @param canvas - The canvas receiving touch events
     */
    static attach(canvas: HTMLCanvasElement): void;
    /**
     * Detaches touch listeners from the canvas.
     */
    static detach(): void;
    /**
     * Converts a browser Touch to canvas-local coordinates.
     */
    private static _to_canvas;
    /**
     * Maps a Touch identifier to a stable slot index (0..MAX_TOUCH_POINTS-1).
     * Returns -1 if no slot is available.
     */
    private static _id_to_slot;
    private static _alloc_slot;
    private static _free_slot;
    private static _handle_start;
    private static _handle_end;
    private static _handle_move;
    private static _handle_cancel;
    /**
     * Clears per-step pressed/released flags.
     * Called by input_manager at the end of each step.
     */
    static end_step(): void;
    /** Returns true if a touch point is currently active. */
    static is_held(device: number): boolean;
    /** Returns true if a touch point became active this step. */
    static is_pressed(device: number): boolean;
    /** Returns true if a touch point was lifted this step. */
    static is_released(device: number): boolean;
    /** Returns the canvas-space X coordinate of a touch device. */
    static get_x(device: number): number;
    /** Returns the canvas-space Y coordinate of a touch device. */
    static get_y(device: number): number;
    /** Returns the number of currently active touch points. */
    static get_count(): number;
}
/**
 * Returns true if the touch device (finger) is currently active.
 * @param device - Finger slot (0 = primary)
 * @param button - Ignored (always mb_left for touch); kept for API parity
 */
declare function device_mouse_check_button(device: number, button: number): boolean;
/**
 * Returns true if the touch device became active this step.
 * @param device - Finger slot
 * @param button - Ignored
 */
declare function device_mouse_check_button_pressed(device: number, button: number): boolean;
/**
 * Returns true if the touch device was lifted this step.
 * @param device - Finger slot
 * @param button - Ignored
 */
declare function device_mouse_check_button_released(device: number, button: number): boolean;
/** Returns the canvas X position of the given touch device. */
declare function device_mouse_x(device: number): number;
/** Returns the canvas Y position of the given touch device. */
declare function device_mouse_y(device: number): number;
/** Returns the number of currently active touch points. */
declare function device_get_touch_count(): number;
//# sourceMappingURL=touch.d.ts.map
/**
 * Math utilities.
 *
 * Mirrors the GMS built-in math functions:
 *   lengthdir_x/y, point_distance, point_direction,
 *   angle_difference, lerp, clamp, sign, frac, round, floor, ceil,
 *   dsin, dcos, dtan, arcsin, arccos, arctan, arctan2,
 *   power, sqr, sqrt, abs, min, max, median, mean, log2, log10, ln, exp
 */
/** Converts degrees to radians. */
declare function degtorad(deg: number): number;
/** Converts radians to degrees. */
declare function radtodeg(rad: number): number;
/** Sine of angle in degrees. */
declare function dsin(deg: number): number;
/** Cosine of angle in degrees. */
declare function dcos(deg: number): number;
/** Tangent of angle in degrees. */
declare function dtan(deg: number): number;
/** Arcsine, returns degrees. */
declare function arcsin(x: number): number;
/** Arccosine, returns degrees. */
declare function arccos(x: number): number;
/** Arctangent, returns degrees. */
declare function arctan(x: number): number;
/** Two-argument arctangent, returns degrees. GMS: arctan2(y, x). */
declare function arctan2(y: number, x: number): number;
/**
 * Returns the X component of a vector with given length and direction.
 * @param len - Vector length
 * @param dir - Direction in degrees (0 = right, 90 = up in GMS)
 */
declare function lengthdir_x(len: number, dir: number): number;
/**
 * Returns the Y component of a vector with given length and direction.
 * GMS Y-axis is inverted (positive Y = down), so result is negated.
 * @param len - Vector length
 * @param dir - Direction in degrees
 */
declare function lengthdir_y(len: number, dir: number): number;
/**
 * Returns the Euclidean distance between two points.
 */
declare function point_distance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Returns the 3D Euclidean distance between two points.
 */
declare function point_distance_3d(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;
/**
 * Returns the direction from (x1, y1) to (x2, y2) in degrees.
 * 0 = right, 90 = up (GMS convention).
 */
declare function point_direction(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Returns the shortest signed difference between two angles in degrees.
 * Result is in the range (-180, 180].
 */
declare function angle_difference(a: number, b: number): number;
/** Linear interpolation from a to b by factor w (0\u20131). */
declare function lerp(a: number, b: number, w: number): number;
/** Clamps val to [min_val, max_val]. */
declare function clamp(val: number, min_val: number, max_val: number): number;
/** Returns the sign of x: -1, 0, or 1. */
declare function sign(x: number): number;
/** Returns the fractional part of x. */
declare function frac(x: number): number;
/** Returns x squared. */
declare function sqr(x: number): number;
/** Returns the square root of x. */
declare function sqrt(x: number): number;
/** Returns the absolute value of x. */
declare function abs(x: number): number;
/** Returns the floor of x. */
declare function floor(x: number): number;
/** Returns the ceiling of x. */
declare function ceil(x: number): number;
/** Rounds x to the nearest integer. */
declare function round(x: number): number;
/** Returns x raised to the power n. */
declare function power(x: number, n: number): number;
/** Returns the base-2 logarithm of x. */
declare function log2(x: number): number;
/** Returns the base-10 logarithm of x. */
declare function log10(x: number): number;
/** Returns the natural logarithm of x. */
declare function ln(x: number): number;
/** Returns e raised to the power x. */
declare function exp(x: number): number;
/** Returns the minimum of all provided values. */
declare function min(...values: number[]): number;
/** Returns the maximum of all provided values. */
declare function max(...values: number[]): number;
/**
 * Returns the median of the provided values.
 * For an even count, returns the average of the two middle values.
 */
declare function median(...values: number[]): number;
/**
 * Returns the arithmetic mean of the provided values.
 * Returns 0 for empty input.
 */
declare function mean(...values: number[]): number;
/**
 * Returns whether x is between lo and hi (inclusive).
 * Equivalent to GMS's between(lo, x, hi).
 */
declare function between(x: number, lo: number, hi: number): boolean;
/**
 * Returns whether x is approximately equal to y within epsilon.
 */
declare function approx(x: number, y: number, epsilon?: number): boolean;
/**
 * Wraps x into the range [0, range).
 */
declare function wrap(x: number, range: number): number;
/**
 * Returns the dot product of two 2D vectors.
 */
declare function dot2(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Returns the dot product of two 3D vectors.
 */
declare function dot3(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;
/**
 * Returns the 2D cross product (scalar z of 3D cross product).
 */
declare function cross2(x1: number, y1: number, x2: number, y2: number): number;
//# sourceMappingURL=math_utils.d.ts.map
/**
 * Random number utilities.
 *
 * Mirrors the GMS random API:
 *   random, irandom, random_range, irandom_range,
 *   randomize, random_set_seed, random_get_seed
 *
 * Uses a seeded Mulberry32 PRNG for reproducible sequences.
 * Call randomize() or random_set_seed() to initialise the seed.
 * By default, seed is 0 (deterministic).
 */
/**
 * Sets the RNG seed to a specific value.
 * @param seed - Integer seed value
 */
declare function random_set_seed(seed: number): void;
/**
 * Returns the current RNG seed.
 */
declare function random_get_seed(): number;
/**
 * Randomises the seed using the current timestamp.
 */
declare function randomize(): void;
/**
 * Returns a random float in [0, n).
 * @param n - Upper bound (exclusive)
 */
declare function random(n: number): number;
/**
 * Returns a random integer in [0, n] (inclusive).
 * @param n - Maximum value (inclusive)
 */
declare function irandom(n: number): number;
/**
 * Returns a random float in [lo, hi).
 * @param lo - Lower bound (inclusive)
 * @param hi - Upper bound (exclusive)
 */
declare function random_range(lo: number, hi: number): number;
/**
 * Returns a random integer in [lo, hi] (both inclusive).
 * @param lo - Lower bound (inclusive)
 * @param hi - Upper bound (inclusive)
 */
declare function irandom_range(lo: number, hi: number): number;
/**
 * Randomly shuffles an array in-place (Fisher-Yates).
 * @param arr - Array to shuffle
 * @returns The same array (mutated)
 */
declare function array_shuffle<T>(arr: T[]): T[];
/**
 * Returns a random element from an array.
 * Returns undefined for empty arrays.
 * @param arr - Source array
 */
declare function array_random<T>(arr: T[]): T | undefined;
/**
 * Returns a random float using JavaScript's built-in Math.random().
 * Not affected by random_set_seed() \u2014 use for non-reproducible randomness.
 */
declare function random_native(): number;
//# sourceMappingURL=random.d.ts.map
/**
 * Regular expression utilities.
 *
 * Thin wrappers around JavaScript's RegExp, providing a more GMS-friendly API.
 * GMS does not have native regex; these are Silkweaver extensions.
 */
/**
 * Returns true if str matches the pattern.
 * @param str - String to test
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags (e.g. 'i' for case-insensitive)
 */
declare function regex_match(str: string, pattern: string, flags?: string): boolean;
/**
 * Returns the first match of pattern in str, or null if no match.
 * @param str - String to search
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags
 */
declare function regex_find(str: string, pattern: string, flags?: string): string | null;
/**
 * Returns all matches of pattern in str as an array.
 * @param str - String to search
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags (default 'g' \u2014 global)
 */
declare function regex_find_all(str: string, pattern: string, flags?: string): string[];
/**
 * Replaces the first match of pattern in str with replacement.
 * @param str - Input string
 * @param pattern - Regular expression pattern string
 * @param replacement - Replacement string (supports $1, $2 group references)
 * @param flags - RegExp flags
 */
declare function regex_replace(str: string, pattern: string, replacement: string, flags?: string): string;
/**
 * Replaces all matches of pattern in str with replacement.
 * @param str - Input string
 * @param pattern - Regular expression pattern string
 * @param replacement - Replacement string
 * @param flags - RegExp flags (default 'g')
 */
declare function regex_replace_all(str: string, pattern: string, replacement: string, flags?: string): string;
/**
 * Splits str by pattern and returns an array of parts.
 * @param str - Input string
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags
 */
declare function regex_split(str: string, pattern: string, flags?: string): string[];
/**
 * Returns the 1-based index of the first match, or 0 if not found.
 * @param str - String to search
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags
 */
declare function regex_pos(str: string, pattern: string, flags?: string): number;
/**
 * Returns an array of capture groups from the first match, or empty array.
 * Index 0 is the full match; indices 1+ are capture groups.
 * @param str - String to match against
 * @param pattern - Regular expression pattern
 * @param flags - RegExp flags
 */
declare function regex_groups(str: string, pattern: string, flags?: string): string[];
//# sourceMappingURL=regex_utils.d.ts.map
/**
 * String utility functions.
 *
 * Mirrors the GMS string API:
 *   string_length, string_copy, string_pos, string_delete, string_insert,
 *   string_replace, string_replace_all, string_count, string_lower, string_upper,
 *   string_letters, string_digits, string_lettersdigits,
 *   string_trim, string_repeat, string_reverse, string_format,
 *   chr, ord, ansi_char, string_char_at, string_byte_at, string_byte_length,
 *   string_set_byte_at
 *
 * String indexing is 1-based (matching GMS), unlike JavaScript's 0-based indexing.
 */
/**
 * Returns the number of characters in a string.
 * @param str - Input string
 */
declare function string_length(str: string): number;
/**
 * Returns a substring.
 * @param str - Input string
 * @param index - Start index (1-based)
 * @param count - Number of characters to copy
 */
declare function string_copy(str: string, index: number, count: number): string;
/**
 * Returns the 1-based position of substr in str, or 0 if not found.
 * @param substr - Substring to search for
 * @param str - String to search in
 */
declare function string_pos(substr: string, str: string): number;
/**
 * Returns the 1-based position of the nth occurrence of substr in str.
 * @param substr - Substring to find
 * @param str - String to search in
 * @param occurrence - Which occurrence to find (1 = first)
 */
declare function string_pos_ext(substr: string, str: string, occurrence?: number): number;
/**
 * Deletes count characters from str starting at index (1-based).
 * @param str - Input string
 * @param index - Start index (1-based)
 * @param count - Number of characters to delete
 */
declare function string_delete(str: string, index: number, count: number): string;
/**
 * Inserts substr into str at 1-based index.
 * @param substr - String to insert
 * @param str - Target string
 * @param index - Insertion position (1-based)
 */
declare function string_insert(substr: string, str: string, index: number): string;
/**
 * Replaces the first occurrence of old_str with new_str.
 * @param str - Input string
 * @param old_str - String to replace
 * @param new_str - Replacement string
 */
declare function string_replace(str: string, old_str: string, new_str: string): string;
/**
 * Replaces all occurrences of old_str with new_str.
 * @param str - Input string
 * @param old_str - String to replace
 * @param new_str - Replacement string
 */
declare function string_replace_all(str: string, old_str: string, new_str: string): string;
/**
 * Returns the number of times substr appears in str.
 */
declare function string_count(substr: string, str: string): number;
/** Converts a string to lowercase. */
declare function string_lower(str: string): string;
/** Converts a string to uppercase. */
declare function string_upper(str: string): string;
/** Returns only the letter characters from a string. */
declare function string_letters(str: string): string;
/** Returns only the digit characters from a string. */
declare function string_digits(str: string): string;
/** Returns only letters and digits from a string. */
declare function string_lettersdigits(str: string): string;
/** Trims leading and trailing whitespace. */
declare function string_trim(str: string): string;
/** Trims leading whitespace. */
declare function string_trim_start(str: string): string;
/** Trims trailing whitespace. */
declare function string_trim_end(str: string): string;
/**
 * Repeats str n times.
 * @param str - String to repeat
 * @param n - Number of repetitions
 */
declare function string_repeat(str: string, n: number): string;
/** Reverses a string. */
declare function string_reverse(str: string): string;
/**
 * Returns a character at 1-based index.
 * Returns an empty string if out of range.
 */
declare function string_char_at(str: string, index: number): string;
/**
 * Returns the byte value at 1-based index (uses charCodeAt).
 */
declare function string_byte_at(str: string, index: number): number;
/** Returns the byte length of the UTF-16 encoded string. */
declare function string_byte_length(str: string): number;
/**
 * Returns the character with the given Unicode code point.
 * GMS equivalent: chr(val)
 */
declare function chr(code: number): string;
/**
 * Returns the Unicode code point of the first character of str.
 * GMS equivalent: ord(str)
 */
declare function ord(str: string): number;
/** Alias for chr(), matching GMS's ansi_char. */
declare function ansi_char(code: number): string;
/**
 * Formats a number to a string with given total width and decimal places.
 * Mirrors GMS's string_format(val, tot, dec).
 * @param val - Number to format
 * @param tot - Minimum total width (padded with spaces on left)
 * @param dec - Number of decimal places
 */
declare function string_format(val: number, tot: number, dec: number): string;
/**
 * Converts a value to its string representation.
 * Mirrors GMS's string(val).
 */
declare function string(val: unknown): string;
/**
 * Converts a string to a real number.
 * Returns 0 if the string is not a valid number (GMS behaviour).
 */
declare function real(str: string): number;
/**
 * Splits a string by a delimiter and returns an array of parts.
 * @param str - String to split
 * @param delimiter - Separator string
 */
declare function string_split(str: string, delimiter: string): string[];
/**
 * Joins an array of strings with a separator.
 * @param parts - String array
 * @param separator - Separator between parts
 */
declare function string_join(parts: string[], separator?: string): string;
//# sourceMappingURL=string_utils.d.ts.map
/**
 * A 2D vector representing a point or direction in 2D space.
 */
declare class vector2 {
    x: number;
    y: number;
    /**
     * Creates a new 2D vector.
     * @param x - X component (default 0)
     * @param y - Y component (default 0)
     */
    constructor(x?: number, y?: number);
    /**
     * Returns a JSON string representation of this vector.
     * @returns JSON string with x and y values
     */
    toString(): string;
}
//# sourceMappingURL=vectors.d.ts.map
/**
 * Binary buffer system \u2014 ArrayBuffer-backed read/write buffers.
 *
 * Mirrors the GMS buffer API:
 *   buffer_create, buffer_delete, buffer_write, buffer_read,
 *   buffer_seek, buffer_tell, buffer_get_size, buffer_exists,
 *   buffer_get_surface (not applicable \u2014 omitted),
 *   buffer_base64_encode, buffer_base64_decode,
 *   buffer_md5, buffer_sha1 (omitted \u2014 no native WebCrypto sync API)
 *
 * Data types match GMS buffer_* type constants.
 * All writes grow the buffer automatically when needed.
 */
declare const buffer_u8 = 0;
declare const buffer_s8 = 1;
declare const buffer_u16 = 2;
declare const buffer_s16 = 3;
declare const buffer_u32 = 4;
declare const buffer_s32 = 5;
declare const buffer_f32 = 6;
declare const buffer_f64 = 7;
declare const buffer_bool = 8;
declare const buffer_string = 9;
declare const buffer_u64 = 10;
declare const buffer_fixed = 0;
declare const buffer_grow = 1;
declare const buffer_wrap = 2;
declare const buffer_fast = 3;
declare const buffer_seek_start = 0;
declare const buffer_seek_relative = 1;
declare const buffer_seek_end = 2;
/**
 * Creates a new buffer.
 * @param size - Initial capacity in bytes
 * @param mode - buffer_fixed | buffer_grow | buffer_wrap | buffer_fast
 * @param alignment - Byte alignment hint (1 = byte-aligned, 2 = 16-bit, etc.)
 * @returns Buffer ID
 */
declare function buffer_create(size: number, mode?: number, alignment?: number): number;
/**
 * Deletes a buffer and frees its memory.
 * @param buffer_id - Buffer ID
 */
declare function buffer_delete(buffer_id: number): void;
/**
 * Returns true if the buffer ID is valid.
 * @param buffer_id - Buffer ID
 */
declare function buffer_exists(buffer_id: number): boolean;
/**
 * Returns the allocated capacity of the buffer in bytes.
 * @param buffer_id - Buffer ID
 */
declare function buffer_get_size(buffer_id: number): number;
/**
 * Returns the number of bytes written to the buffer.
 * @param buffer_id - Buffer ID
 */
declare function buffer_tell(buffer_id: number): number;
/**
 * Moves the read/write cursor.
 * @param buffer_id - Buffer ID
 * @param base - buffer_seek_start | buffer_seek_relative | buffer_seek_end
 * @param offset - Byte offset from base
 */
declare function buffer_seek(buffer_id: number, base: number, offset: number): void;
/**
 * Writes a value of the given type at the current cursor position.
 * @param buffer_id - Buffer ID
 * @param type - buffer_u8 | buffer_s8 | ... | buffer_string
 * @param value - Value to write
 */
declare function buffer_write(buffer_id: number, type: number, value: number | boolean | string | bigint): void;
/**
 * Reads a value of the given type from the current cursor position.
 * @param buffer_id - Buffer ID
 * @param type - Data type constant
 * @returns The read value, or 0 / false / '' on error
 */
declare function buffer_read(buffer_id: number, type: number): number | boolean | string | bigint;
/**
 * Fills a region of the buffer with a repeating byte value.
 * @param buffer_id - Buffer ID
 * @param offset - Start offset in bytes (from buffer start)
 * @param size - Number of bytes to fill
 * @param value - Byte value (0\u2013255)
 */
declare function buffer_fill(buffer_id: number, offset: number, size: number, value: number): void;
/**
 * Copies data from one buffer to another.
 * @param src_id - Source buffer ID
 * @param src_offset - Byte offset in source
 * @param dst_id - Destination buffer ID
 * @param dst_offset - Byte offset in destination
 * @param size - Number of bytes to copy
 */
declare function buffer_copy(src_id: number, src_offset: number, dst_id: number, dst_offset: number, size: number): void;
/**
 * Returns a Uint8Array view of the buffer's raw bytes (read-only snapshot).
 * @param buffer_id - Buffer ID
 */
declare function buffer_get_bytes(buffer_id: number): Uint8Array;
/**
 * Creates a buffer from a Uint8Array (e.g. from a network message).
 * @param bytes - Raw bytes
 * @returns Buffer ID
 */
declare function buffer_from_bytes(bytes: Uint8Array): number;
/**
 * Encodes the buffer contents as a Base64 string.
 * @param buffer_id - Buffer ID
 * @param offset - Start offset (default 0)
 * @param size - Number of bytes (default: full buffer)
 */
declare function buffer_base64_encode(buffer_id: number, offset?: number, size?: number): string;
/**
 * Creates a buffer from a Base64-encoded string.
 * @param base64 - Base64 string
 * @returns Buffer ID
 */
declare function buffer_base64_decode(base64: string): number;
//# sourceMappingURL=buffer.d.ts.map
/**
 * HTTP client utilities.
 *
 * Mirrors GMS's http_get / http_post / http_get_file API.
 * All functions are Promise-based (unlike GMS async events).
 *
 * GMS equivalents:
 *   http_get(url)           \u2192 http_get(url)
 *   http_post_string(url,s) \u2192 http_post(url, body)
 *   http_get_file(url,path) \u2192 http_get_bytes(url)
 *   http_request(url,\u2026)     \u2192 http_request(url, \u2026)
 */
/**
 * Represents the result of an HTTP request.
 */
interface http_response {
    status: number;
    ok: boolean;
    text: string;
    headers: Record<string, string>;
}
/**
 * Represents the result of a binary HTTP request.
 */
interface http_binary_response {
    status: number;
    ok: boolean;
    bytes: Uint8Array;
    headers: Record<string, string>;
}
/**
 * Performs an HTTP GET request and returns the response body as a string.
 * @param url - Request URL
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_response
 */
declare function http_get(url: string, headers?: Record<string, string>): Promise<http_response>;
/**
 * Performs an HTTP POST request with a string body.
 * @param url - Request URL
 * @param body - Request body string
 * @param content_type - Content-Type header (default 'application/x-www-form-urlencoded')
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_response
 */
declare function http_post(url: string, body: string, content_type?: string, headers?: Record<string, string>): Promise<http_response>;
/**
 * Performs an HTTP POST request with a JSON body.
 * @param url - Request URL
 * @param data - JavaScript value to serialize as JSON
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_response
 */
declare function http_post_json(url: string, data: unknown, headers?: Record<string, string>): Promise<http_response>;
/**
 * Performs an HTTP GET request and returns the response body as raw bytes.
 * Equivalent to GMS's http_get_file (but returns bytes instead of saving to disk).
 * @param url - Request URL
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_binary_response
 */
declare function http_get_bytes(url: string, headers?: Record<string, string>): Promise<http_binary_response>;
/**
 * Performs a generic HTTP request with full control over method, headers, and body.
 * @param url - Request URL
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
 * @param headers - Request headers
 * @param body - Request body (string or Uint8Array), or null
 * @returns Promise resolving to http_response
 */
declare function http_request(url: string, method: string, headers?: Record<string, string>, body?: string | Uint8Array | null): Promise<http_response>;
//# sourceMappingURL=http_client.d.ts.map
/**
 * WebRTC peer-to-peer networking via RTCDataChannel.
 *
 * Provides UDP-like unreliable messaging between peers using RTCDataChannel
 * in unordered + unreliable mode, or reliable ordered mode for TCP-like use.
 *
 * Usage pattern:
 *   1. Create a peer: webrtc_create_peer()
 *   2. Create a data channel on the offerer: webrtc_create_channel()
 *   3. Exchange SDP offer/answer and ICE candidates out-of-band (e.g. via WebSocket)
 *   4. Send/receive messages via webrtc_send / webrtc_set_on_message
 *
 * SDP and ICE negotiation is exposed directly \u2014 the application is responsible
 * for the signalling transport (typically a WebSocket server).
 */
/**
 * Creates a new RTCPeerConnection.
 * @param ice_servers - STUN/TURN server config (default: Google STUN)
 * @returns Peer ID
 */
declare function webrtc_create_peer(ice_servers?: RTCIceServer[]): number;
/**
 * Creates a data channel on a peer (offerer side).
 * @param peer_id - Peer ID
 * @param label - Channel label
 * @param ordered - True for reliable ordered, false for UDP-like
 * @param max_retransmits - Max retransmits for unreliable mode (0 = no retry)
 * @returns Channel ID, or -1 on failure
 */
declare function webrtc_create_channel(peer_id: number, label?: string, ordered?: boolean, max_retransmits?: number): number;
/**
 * Creates an SDP offer for the peer (async).
 * @param peer_id - Peer ID
 * @returns SDP offer string, or null on failure
 */
declare function webrtc_create_offer(peer_id: number): Promise<string | null>;
/**
 * Creates an SDP answer in response to a received offer (async).
 * @param peer_id - Peer ID
 * @param offer_sdp - SDP offer string from the remote peer
 * @returns SDP answer string, or null on failure
 */
declare function webrtc_create_answer(peer_id: number, offer_sdp: string): Promise<string | null>;
/**
 * Sets the remote SDP answer on the offerer (async).
 * @param peer_id - Peer ID
 * @param answer_sdp - SDP answer string from the remote peer
 */
declare function webrtc_set_remote_answer(peer_id: number, answer_sdp: string): Promise<void>;
/**
 * Adds a received ICE candidate from the remote peer.
 * @param peer_id - Peer ID
 * @param candidate - RTCIceCandidateInit object (from signalling)
 */
declare function webrtc_add_ice_candidate(peer_id: number, candidate: RTCIceCandidateInit): Promise<void>;
/**
 * Sends raw bytes over a data channel.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param bytes - Data to send
 */
declare function webrtc_send(peer_id: number, channel_id: number, bytes: Uint8Array): void;
/**
 * Sends a text string over a data channel.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param text - Text to send
 */
declare function webrtc_send_text(peer_id: number, channel_id: number, text: string): void;
/**
 * Closes a peer connection and all its channels.
 * @param peer_id - Peer ID
 */
declare function webrtc_destroy_peer(peer_id: number): void;
/**
 * Sets the callback fired when a new incoming data channel is opened (answerer side).
 * @param peer_id - Peer ID
 * @param cb - Callback receiving (channel_id, label)
 */
declare function webrtc_set_on_channel(peer_id: number, cb: (channel_id: number, label: string) => void): void;
/**
 * Sets the callback fired when a local ICE candidate is ready to be sent to the remote peer.
 * @param peer_id - Peer ID
 * @param cb - Callback receiving the RTCIceCandidate
 */
declare function webrtc_set_on_ice_candidate(peer_id: number, cb: (candidate: RTCIceCandidate) => void): void;
/**
 * Sets the callback fired when a message arrives on a channel.
 * The callback receives a buffer ID (owned by caller; use buffer_delete when done).
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param cb - Callback receiving the buffer ID
 */
declare function webrtc_set_on_message(peer_id: number, channel_id: number, cb: (buffer_id: number) => void): void;
/**
 * Sets the callback fired when a channel opens.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param cb - Callback
 */
declare function webrtc_set_on_open(peer_id: number, channel_id: number, cb: () => void): void;
/**
 * Sets the callback fired when a channel closes.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param cb - Callback
 */
declare function webrtc_set_on_close(peer_id: number, channel_id: number, cb: () => void): void;
/** Returns true if the peer ID refers to a live peer. */
declare function webrtc_peer_exists(peer_id: number): boolean;
/** Returns the RTCPeerConnection connection state string, or 'closed' if not found. */
declare function webrtc_get_state(peer_id: number): string;
//# sourceMappingURL=webrtc_client.d.ts.map
/**
 * WebSocket networking client.
 *
 * Mirrors GMS's network_create_socket / network_connect / network_send_raw API.
 * Messages are binary (ArrayBuffer) or text strings.
 *
 * Events (onopen, onmessage, onclose, onerror) are exposed as callbacks
 * rather than GMS async events, to match JavaScript idioms.
 */
/** WebSocket states matching the GMS network_type_* constants. */
declare const network_type_connect = 0;
declare const network_type_disconnect = 1;
declare const network_type_data = 2;
declare const network_type_non_blocking_connect = 3;
/**
 * Creates a WebSocket connection to the given URL.
 * @param url - WebSocket URL (ws:// or wss://)
 * @param protocols - Optional subprotocols
 * @returns Socket ID, or -1 on immediate failure
 */
declare function network_create_socket(url: string, protocols?: string | string[]): number;
/**
 * Sends raw bytes from a buffer over a WebSocket connection.
 * @param socket_id - Socket ID
 * @param bytes - Uint8Array to send
 */
declare function network_send_raw(socket_id: number, bytes: Uint8Array): void;
/**
 * Sends a text string over a WebSocket connection.
 * @param socket_id - Socket ID
 * @param text - Text to send
 */
declare function network_send_text(socket_id: number, text: string): void;
/**
 * Closes a WebSocket connection.
 * @param socket_id - Socket ID
 * @param code - Close code (default 1000 = normal closure)
 * @param reason - Human-readable reason
 */
declare function network_destroy(socket_id: number, code?: number, reason?: string): void;
/**
 * Returns the WebSocket ready state: 0=CONNECTING 1=OPEN 2=CLOSING 3=CLOSED.
 * Returns -1 if the socket ID is invalid.
 * @param socket_id - Socket ID
 */
declare function network_get_ready_state(socket_id: number): number;
/**
 * Sets the callback fired when the socket connects.
 * @param socket_id - Socket ID
 * @param cb - Callback
 */
declare function network_set_on_open(socket_id: number, cb: () => void): void;
/**
 * Sets the callback fired when a message is received.
 * The callback receives a buffer ID containing the message bytes.
 * The buffer is owned by the callback and should be freed with buffer_delete().
 * @param socket_id - Socket ID
 * @param cb - Callback receiving the buffer ID
 */
declare function network_set_on_message(socket_id: number, cb: (buffer_id: number) => void): void;
/**
 * Sets the callback fired when the socket closes.
 * @param socket_id - Socket ID
 * @param cb - Callback receiving (code, reason)
 */
declare function network_set_on_close(socket_id: number, cb: (code: number, reason: string) => void): void;
/**
 * Sets the callback fired when a socket error occurs.
 * @param socket_id - Socket ID
 * @param cb - Callback
 */
declare function network_set_on_error(socket_id: number, cb: () => void): void;
/**
 * Returns true if the given socket ID refers to a live socket.
 * @param socket_id - Socket ID
 */
declare function network_socket_exists(socket_id: number): boolean;
//# sourceMappingURL=websocket_client.d.ts.map
/**
 * Particle emitter \u2014 spawns particles into a particle system.
 *
 * Mirrors the GMS part_emitter_* API.
 *
 * An emitter belongs to a system and defines:
 *   - A region (point, rectangle, ellipse, diamond) where particles spawn
 *   - A distribution within that region (linear, Gaussian, inv_Gaussian)
 *   - Burst and stream modes
 */
declare const ps_shape_rectangle = 0;
declare const ps_shape_ellipse = 1;
declare const ps_shape_diamond = 2;
declare const ps_shape_line = 3;
declare const ps_distr_linear = 0;
declare const ps_distr_gaussian = 1;
declare const ps_distr_inv_gaussian = 2;
/**
 * Creates a new emitter attached to a particle system.
 * @param system_id - System ID to spawn particles into
 * @returns Emitter ID
 */
declare function part_emitter_create(system_id: number): number;
/**
 * Destroys an emitter.
 * @param emitter_id - Emitter ID
 */
declare function part_emitter_destroy(emitter_id: number): void;
/** Returns true if the emitter ID is valid. */
declare function part_emitter_exists(emitter_id: number): boolean;
/**
 * Sets the region and distribution for an emitter.
 * @param emitter_id - Emitter ID
 * @param x1 - Region left
 * @param y1 - Region top
 * @param x2 - Region right
 * @param y2 - Region bottom
 * @param shape - ps_shape_* constant
 * @param distr - ps_distr_* constant
 */
declare function part_emitter_region(emitter_id: number, x1: number, y1: number, x2: number, y2: number, shape: number, distr: number): void;
/**
 * Spawns a single burst of particles from an emitter.
 * @param emitter_id - Emitter ID
 * @param type_id - Particle type ID
 * @param number - Number of particles to spawn
 */
declare function part_emitter_burst(emitter_id: number, type_id: number, number: number): void;
/**
 * Spawns a continuous stream of particles (call each step).
 * Internally identical to burst \u2014 the caller is responsible for calling each step.
 * @param emitter_id - Emitter ID
 * @param type_id - Particle type ID
 * @param number - Number of particles to spawn this step
 */
declare function part_emitter_stream(emitter_id: number, type_id: number, number: number): void;
//# sourceMappingURL=particle_emitter.d.ts.map
/**
 * Particle system \u2014 manages a pool of live particles and renders them.
 *
 * Mirrors the GMS part_system_* API.
 *
 * One particle system holds all particles created by its emitters.
 * Call part_system_update() each step and part_system_draw() in the draw event.
 *
 * Rendering uses the engine's 2D renderer (draw_rectangle / draw_circle style
 * primitives via the renderer's batch API).  Shapes are drawn as simple
 * colored rectangles/circles \u2014 a sprite atlas approach is left for future work.
 */
interface live_particle {
    type_id: number;
    x: number;
    y: number;
    spd: number;
    dir: number;
    ang: number;
    spd_incr: number;
    dir_incr: number;
    ang_incr: number;
    size: number;
    size_incr: number;
    life: number;
    life_max: number;
    r: number;
    g: number;
    b: number;
    alpha: number;
    additive: boolean;
}
interface part_system_def {
    particles: live_particle[];
    depth: number;
    persistent: boolean;
    auto_update: boolean;
    auto_draw: boolean;
}
/** Creates a single live particle from a type at position (x, y). */
declare function _spawn_particle(sys: part_system_def, type_id: number, x: number, y: number): void;
/** Returns the raw system state object for internal use by particle_emitter.ts. */
declare function _get_system_raw(system_id: number): part_system_def | undefined;
/** Creates a new particle system and returns its ID. */
declare function part_system_create(): number;
/** Destroys a particle system and all its particles. */
declare function part_system_destroy(system_id: number): void;
/** Returns true if the system ID is valid. */
declare function part_system_exists(system_id: number): boolean;
/** Sets the draw depth of the system. */
declare function part_system_depth(system_id: number, depth: number): void;
/** Clears all live particles from the system without destroying it. */
declare function part_system_clear(system_id: number): void;
/** Returns the number of live particles in the system. */
declare function part_system_count(system_id: number): number;
/**
 * Advances all particles in the system by one step.
 * Handles motion, lifetime, per-step sub-emitters, and death sub-emitters.
 * @param system_id - System ID
 */
declare function part_system_update(system_id: number): void;
/**
 * Draws all particles in the system using the engine renderer.
 * Must be called from within a draw event (after renderer.begin_frame).
 * @param system_id - System ID
 */
declare function part_system_draw(system_id: number): void;

//# sourceMappingURL=particle_system.d.ts.map
/**
 * Particle type definitions.
 *
 * A particle type is a template describing how individual particles look and behave.
 * Mirrors the GMS part_type_* API.
 *
 * Particle types are consumed by particle emitters and particle systems.
 * They are shared \u2014 one type can be used by many emitters.
 */
declare const pt_shape_pixel = 0;
declare const pt_shape_disk = 1;
declare const pt_shape_square = 2;
declare const pt_shape_line = 3;
declare const pt_shape_star = 4;
declare const pt_shape_circle = 5;
declare const pt_shape_ring = 6;
declare const pt_shape_sphere = 7;
declare const pt_shape_flare = 8;
declare const pt_shape_spark = 9;
declare const pt_shape_explosion = 10;
declare const pt_shape_cloud = 11;
declare const pt_shape_smoke = 12;
declare const pt_shape_snow = 13;
interface part_type_def {
    shape: number;
    size1: number;
    size2: number;
    size_incr: number;
    size_wiggle: number;
    speed1: number;
    speed2: number;
    speed_incr: number;
    speed_wiggle: number;
    dir1: number;
    dir2: number;
    dir_incr: number;
    dir_wiggle: number;
    grav_amount: number;
    grav_dir: number;
    ang1: number;
    ang2: number;
    ang_incr: number;
    ang_wiggle: number;
    ang_relative: boolean;
    life1: number;
    life2: number;
    color1: number;
    color2: number;
    color3: number;
    alpha1: number;
    alpha2: number;
    alpha3: number;
    additive: boolean;
    death_type_id: number;
    death_number: number;
    step_type_id: number;
    step_number: number;
}
/** Creates a new particle type and returns its ID. */
declare function part_type_create(): number;
/** Destroys a particle type. */
declare function part_type_destroy(type_id: number): void;
/** Returns true if the particle type ID is valid. */
declare function part_type_exists(type_id: number): boolean;
/** Sets the shape of particles of this type. */
declare function part_type_shape(type_id: number, shape: number): void;
/** Sets the size range and per-step variation. */
declare function part_type_size(type_id: number, size_min: number, size_max: number, size_incr: number, size_wiggle: number): void;
/** Sets the speed range and per-step variation. */
declare function part_type_speed(type_id: number, speed_min: number, speed_max: number, speed_incr: number, speed_wiggle: number): void;
/** Sets the direction range and per-step variation (degrees). */
declare function part_type_direction(type_id: number, dir_min: number, dir_max: number, dir_incr: number, dir_wiggle: number): void;
/** Sets the gravity applied to particles (amount in pixels/step\xB2, direction in degrees). */
declare function part_type_gravity(type_id: number, amount: number, direction: number): void;
/** Sets the orientation (angle) range and variation. */
declare function part_type_orientation(type_id: number, ang_min: number, ang_max: number, ang_incr: number, ang_wiggle: number, ang_relative: boolean): void;
/** Sets the lifetime range in steps. */
declare function part_type_life(type_id: number, life_min: number, life_max: number): void;
/** Sets three color stops interpolated over the particle lifetime. */
declare function part_type_color3(type_id: number, c1: number, c2: number, c3: number): void;
/** Sets two color stops (shorthand). */
declare function part_type_color2(type_id: number, c1: number, c2: number): void;
/** Sets a single constant color. */
declare function part_type_color1(type_id: number, c: number): void;
/** Sets three alpha stops interpolated over the particle lifetime. */
declare function part_type_alpha3(type_id: number, a1: number, a2: number, a3: number): void;
/** Sets two alpha stops. */
declare function part_type_alpha2(type_id: number, a1: number, a2: number): void;
/** Sets a single constant alpha. */
declare function part_type_alpha1(type_id: number, a: number): void;
/** Sets whether particles blend additively. */
declare function part_type_blend(type_id: number, additive: boolean): void;
/**
 * Sets a sub-emitter that spawns particles on step.
 * @param type_id - Parent type ID
 * @param sub_type_id - Type to spawn (-1 = none)
 * @param number - Number of particles spawned per step
 */
declare function part_type_step(type_id: number, sub_type_id: number, number: number): void;
/**
 * Sets a sub-emitter that spawns particles when a particle dies.
 * @param type_id - Parent type ID
 * @param sub_type_id - Type to spawn (-1 = none)
 * @param number - Number of particles spawned on death
 */
declare function part_type_death(type_id: number, sub_type_id: number, number: number): void;
/** Returns the raw type definition for use by the particle system. */
declare function part_type_get_def(type_id: number): part_type_def | undefined;
//# sourceMappingURL=particle_type.d.ts.map
/**
 * Physics body and fixture system \u2014 wraps matter.js Body.
 *
 * Fixture shapes: rectangle, circle, polygon (convex hull).
 * Bodies can be dynamic, static, or kinematic.
 *
 * Positions are in room pixel space.
 * The px_per_metre scale factor converts to matter.js metre space.
 *
 * GMS-compatible API:
 *   physics_fixture_create / physics_fixture_set_* / physics_fixture_bind /
 *   physics_fixture_delete / physics_body_apply_force /
 *   physics_body_apply_impulse / physics_body_set_velocity /
 *   physics_body_get_* / physics_body_set_*
 */

/**
 * Creates a new fixture definition and returns its ID.
 * Configure the fixture with physics_fixture_set_* before binding it.
 * @returns Fixture ID
 */
declare function physics_fixture_create(): number;
/**
 * Sets the fixture shape to a box.
 * @param fixture_id - Fixture ID
 * @param w - Width in pixels
 * @param h - Height in pixels
 */
declare function physics_fixture_set_box(fixture_id: number, w: number, h: number): void;
/**
 * Sets the fixture shape to a circle.
 * @param fixture_id - Fixture ID
 * @param radius - Radius in pixels
 */
declare function physics_fixture_set_circle(fixture_id: number, radius: number): void;
/**
 * Sets the fixture shape to a convex polygon.
 * @param fixture_id - Fixture ID
 * @param verts - Array of {x, y} vertices in pixel space
 */
declare function physics_fixture_set_polygon(fixture_id: number, verts: {
    x: number;
    y: number;
}[]): void;
/**
 * Sets the density of a fixture (affects mass).
 * @param fixture_id - Fixture ID
 * @param density - Density value (default 0.001)
 */
declare function physics_fixture_set_density(fixture_id: number, density: number): void;
/**
 * Sets the restitution (bounciness) of a fixture.
 * @param fixture_id - Fixture ID
 * @param restitution - Value 0 (no bounce) to 1 (full bounce)
 */
declare function physics_fixture_set_restitution(fixture_id: number, restitution: number): void;
/**
 * Sets the friction of a fixture.
 * @param fixture_id - Fixture ID
 * @param friction - Friction coefficient (0 = frictionless, 1 = high friction)
 */
declare function physics_fixture_set_friction(fixture_id: number, friction: number): void;
/**
 * Sets whether a fixture is a sensor (detects overlaps without physical response).
 * @param fixture_id - Fixture ID
 * @param is_sensor - True for sensor, false for solid
 */
declare function physics_fixture_set_sensor(fixture_id: number, is_sensor: boolean): void;
/**
 * Creates a physics body from a fixture at the given position.
 * @param fixture_id - Fixture ID to use as the body's shape
 * @param x - Initial X position in room pixels
 * @param y - Initial Y position in room pixels
 * @param is_static - True for static (immovable) body
 * @returns Body ID, or -1 if the world is not created
 */
declare function physics_fixture_bind(fixture_id: number, x: number, y: number, is_static?: boolean): number;
/**
 * Frees a fixture definition. Bodies already created from it are unaffected.
 * @param fixture_id - Fixture ID
 */
declare function physics_fixture_delete(fixture_id: number): void;
/**
 * Destroys a physics body and removes it from the world.
 * @param body_id - Body ID returned by physics_fixture_bind
 */
declare function physics_body_destroy(body_id: number): void;
/**
 * Applies a continuous force to a body at its centre.
 * @param body_id - Body ID
 * @param fx - Force X (pixel-space units)
 * @param fy - Force Y (pixel-space units)
 */
declare function physics_body_apply_force(body_id: number, fx: number, fy: number): void;
/**
 * Applies an impulse (instant velocity change) at the body's centre.
 * @param body_id - Body ID
 * @param ix - Impulse X
 * @param iy - Impulse Y
 */
declare function physics_body_apply_impulse(body_id: number, ix: number, iy: number): void;
/**
 * Sets the velocity of a body directly.
 * @param body_id - Body ID
 * @param vx - Velocity X in pixels/step
 * @param vy - Velocity Y in pixels/step
 */
declare function physics_body_set_velocity(body_id: number, vx: number, vy: number): void;
/**
 * Sets the position of a body directly (teleports without velocity change).
 * @param body_id - Body ID
 * @param x - New X in room pixels
 * @param y - New Y in room pixels
 */
declare function physics_body_set_position(body_id: number, x: number, y: number): void;
/**
 * Sets the angular velocity of a body.
 * @param body_id - Body ID
 * @param omega - Angular velocity in radians/step
 */
declare function physics_body_set_angular_velocity(body_id: number, omega: number): void;
/** Returns the X position of a body in room pixels. */
declare function physics_body_get_x(body_id: number): number;
/** Returns the Y position of a body in room pixels. */
declare function physics_body_get_y(body_id: number): number;
/** Returns the rotation angle of a body in degrees. */
declare function physics_body_get_angle(body_id: number): number;
/** Returns the X velocity of a body. */
declare function physics_body_get_vx(body_id: number): number;
/** Returns the Y velocity of a body. */
declare function physics_body_get_vy(body_id: number): number;
/** Returns the angular velocity of a body in radians/step. */
declare function physics_body_get_angular_velocity(body_id: number): number;
/**
 * Makes a body static (immovable) or dynamic.
 * @param body_id - Body ID
 * @param is_static - True to make static
 */
declare function physics_body_set_static(body_id: number, is_static: boolean): void;
/** Returns true if the body ID refers to a live body. */
declare function physics_body_exists(body_id: number): boolean;
/**
 * Returns the raw matter.js Body for advanced use.
 * @param body_id - Body ID
 */
declare function physics_body_get_raw(body_id: number): any | undefined;
//# sourceMappingURL=physics_body.d.ts.map
/**
 * Physics joints \u2014 wraps matter.js Constraint.
 *
 * Supports:
 *   - Distance joint: fixed separation between two points
 *   - Revolute joint: bodies rotate around a shared pivot
 *   - Weld joint: bodies locked together (zero stiffness distance constraint)
 *
 * All positions are in room pixel space.
 */

/**
 * Creates a distance joint between two bodies.
 * The joint maintains (approximately) the distance between the two anchor points.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @param ax - Anchor X on body A in body-local pixels (0 = centre)
 * @param ay - Anchor Y on body A
 * @param bx - Anchor X on body B
 * @param by - Anchor Y on body B
 * @param stiffness - Spring stiffness (0\u20131; 1 = rigid, <1 = springy)
 * @param damping - Damping ratio (0 = no damping)
 * @returns Joint ID, or -1 on failure
 */
declare function physics_joint_distance_create(body_a_id: number, body_b_id: number, ax: number, ay: number, bx: number, by: number, stiffness?: number, damping?: number): number;
/**
 * Creates a revolute (pin) joint \u2014 bodies rotate freely around a shared world-space pivot.
 * Implemented as a stiff zero-length distance constraint anchored at the same world point.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @param pivot_x - Pivot X in room pixels
 * @param pivot_y - Pivot Y in room pixels
 * @returns Joint ID, or -1 on failure
 */
declare function physics_joint_revolute_create(body_a_id: number, body_b_id: number, pivot_x: number, pivot_y: number): number;
/**
 * Creates a weld joint \u2014 two bodies move as one rigid unit.
 * Implemented as a stiff zero-length distance constraint at their current relative offset.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @returns Joint ID, or -1 on failure
 */
declare function physics_joint_weld_create(body_a_id: number, body_b_id: number): number;
/**
 * Creates a spring joint with a rest length and spring stiffness.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @param ax - Anchor X on body A (local pixels)
 * @param ay - Anchor Y on body A
 * @param bx - Anchor X on body B
 * @param by - Anchor Y on body B
 * @param rest_length - Natural length of the spring in pixels
 * @param stiffness - Spring stiffness (0\u20131)
 * @param damping - Damping (0 = undamped)
 * @returns Joint ID, or -1 on failure
 */
declare function physics_joint_spring_create(body_a_id: number, body_b_id: number, ax: number, ay: number, bx: number, by: number, rest_length: number, stiffness?: number, damping?: number): number;
/**
 * Destroys a joint and removes it from the world.
 * @param joint_id - Joint ID returned by physics_joint_*_create
 */
declare function physics_joint_destroy(joint_id: number): void;
/** Returns true if a joint ID refers to a live joint. */
declare function physics_joint_exists(joint_id: number): boolean;
/**
 * Returns the raw matter.js Constraint for advanced use.
 * @param joint_id - Joint ID
 */
declare function physics_joint_get_raw(joint_id: number): any | undefined;
//# sourceMappingURL=physics_joint.d.ts.map
/**
 * Physics world \u2014 wraps a matter.js Engine and World.
 *
 * One physics world exists per game. Call physics_world_create() once,
 * then physics_world_step() each game step to advance the simulation.
 *
 * Gravity matches GMS defaults: (0, 0.1) in room-pixel units per step.
 * The scale factor (physics_world_create's pixel-per-meter) converts
 * between pixel space (instances) and matter.js metre space.
 */

type collision_cb = (body_a: any, body_b: any) => void;
/**
 * Creates (or recreates) the physics world.
 * Must be called before any physics_body or physics_fixture functions.
 * @param gx - Gravity X in room units per step (default 0)
 * @param gy - Gravity Y in room units per step (default 0.1)
 * @param px_per_metre - Pixel-to-metre scale (default 64)
 */
declare function physics_world_create(gx?: number, gy?: number, px_per_metre?: number): void;
/**
 * Advances the physics simulation by one step.
 * Call this once per game step (before reading body positions).
 * @param delta_ms - Step duration in milliseconds (default 1000/60 \u2248 16.67)
 */
declare function physics_world_step(delta_ms?: number): void;
/**
 * Sets the world gravity vector.
 * @param gx - Gravity X (room units per step)
 * @param gy - Gravity Y (room units per step)
 */
declare function physics_world_gravity(gx: number, gy: number): void;
/**
 * Destroys the physics world and frees all resources.
 */
declare function physics_world_destroy(): void;
/**
 * Registers a callback fired when two physics bodies begin colliding.
 * @param cb - Callback receiving the two colliding bodies
 */
declare function physics_world_on_collision_start(cb: collision_cb): void;
/**
 * Registers a callback fired when two physics bodies stop colliding.
 * @param cb - Callback receiving the two separated bodies
 */
declare function physics_world_on_collision_end(cb: collision_cb): void;
/**
 * Returns the raw matter.js Engine for advanced use.
 * Returns null if the world has not been created yet.
 */
declare function physics_world_get_engine(): any | null;
/**
 * Returns the pixel-per-metre scale factor set at world creation.
 */
declare function physics_get_scale(): number;
/**
 * Returns the raw matter.js World, or null if not created.
 * Used internally by physics_body.ts.
 */
declare function _get_world(): any | null;
/**
 * Returns the raw matter.js Engine, or null if not created.
 * Used internally by physics_body.ts.
 */
declare function _get_engine(): any | null;

//# sourceMappingURL=physics_world.d.ts.map
/**
 * Virtual file system backed by IndexedDB.
 *
 * Mirrors the GMS text-file API: file_text_open_read, file_text_open_write,
 * file_text_open_append, file_text_close, file_text_read_string,
 * file_text_write_string, file_text_writeln, file_text_eof,
 * file_text_readln, file_exists, file_delete.
 *
 * All I/O is asynchronous (Promise-based), unlike GMS which is synchronous.
 * The file handle returned is a numeric ID, consistent with GMS.
 *
 * Storage layout: IndexedDB database "silkweaver_fs", object store "files",
 * keyed by filename (string).
 */
/**
 * Opens a file for reading. Returns a handle ID.
 * The file must exist; use file_exists() to check first.
 * @param filename - Filename (used as the key in IndexedDB)
 * @returns Promise resolving to a file handle number, or -1 if not found
 */
declare function file_text_open_read(filename: string): Promise<number>;
/**
 * Opens a file for writing (creates or overwrites).
 * @param filename - Filename
 * @returns Promise resolving to a file handle number
 */
declare function file_text_open_write(filename: string): Promise<number>;
/**
 * Opens a file for appending. Existing content is preserved.
 * @param filename - Filename
 * @returns Promise resolving to a file handle number
 */
declare function file_text_open_append(filename: string): Promise<number>;
/**
 * Closes a file handle, flushing writes to IndexedDB.
 * @param handle - File handle returned by file_text_open_*
 */
declare function file_text_close(handle: number): Promise<void>;
/**
 * Reads the next line from a read-mode file.
 * Returns an empty string if at end of file.
 * @param handle - File handle
 */
declare function file_text_readln(handle: number): string;
/**
 * Reads a single string token (up to whitespace) from a read-mode file.
 * @param handle - File handle
 */
declare function file_text_read_string(handle: number): string;
/**
 * Returns true if the read cursor is at the end of the file.
 * @param handle - File handle
 */
declare function file_text_eof(handle: number): boolean;
/**
 * Writes a string to a write/append mode file.
 * @param handle - File handle
 * @param str - String to write
 */
declare function file_text_write_string(handle: number, str: string): void;
/**
 * Writes a newline character to a write/append mode file.
 * @param handle - File handle
 */
declare function file_text_writeln(handle: number): void;
/**
 * Returns true if a file exists in the virtual file system.
 * @param filename - Filename to check
 */
declare function file_exists(filename: string): Promise<boolean>;
/**
 * Deletes a file from the virtual file system.
 * @param filename - Filename to delete
 */
declare function file_delete(filename: string): Promise<void>;
//# sourceMappingURL=file_system.d.ts.map
/**
 * INI-style storage backed by localStorage.
 *
 * Mirrors GMS's ini_open / ini_close / ini_read_* / ini_write_* API.
 * Data is stored under the localStorage key \`silkweaver_ini_<filename>\`.
 *
 * Format in localStorage is JSON: { [section]: { [key]: string } }
 *
 * Only one INI file is "open" at a time (GMS convention).
 * All reads/writes operate on the currently open file.
 */
/**
 * Opens (or creates) an INI file for reading and writing.
 * If a file is already open it is saved and closed first.
 * @param filename - Logical file name (used as localStorage key suffix)
 */
declare function ini_open(filename: string): void;
/**
 * Saves the current INI file to localStorage and closes it.
 * Must be called after all reads/writes to persist changes.
 */
declare function ini_close(): void;
/**
 * Reads a string value.
 * @param section - INI section name
 * @param key - Key within the section
 * @param default_val - Returned if the key is absent
 */
declare function ini_read_string(section: string, key: string, default_val: string): string;
/**
 * Reads a numeric value. Non-numeric stored values fall back to the default.
 * @param section - INI section name
 * @param key - Key within the section
 * @param default_val - Returned if the key is absent or not a valid number
 */
declare function ini_read_real(section: string, key: string, default_val: number): number;
/**
 * Writes a string value.
 * @param section - INI section name
 * @param key - Key within the section
 * @param val - Value to store
 */
declare function ini_write_string(section: string, key: string, val: string): void;
/**
 * Writes a numeric value (stored as its string representation).
 * @param section - INI section name
 * @param key - Key within the section
 * @param val - Value to store
 */
declare function ini_write_real(section: string, key: string, val: number): void;
/**
 * Returns true if a section/key pair exists in the open file.
 * @param section - Section name
 * @param key - Key name
 */
declare function ini_key_exists(section: string, key: string): boolean;
/**
 * Returns true if a section exists in the open file.
 * @param section - Section name
 */
declare function ini_section_exists(section: string): boolean;
/**
 * Deletes a key from a section.
 * @param section - Section name
 * @param key - Key to delete
 */
declare function ini_key_delete(section: string, key: string): void;
/**
 * Deletes an entire section and all its keys.
 * @param section - Section to delete
 */
declare function ini_section_delete(section: string): void;
/**
 * Deletes the INI file from localStorage entirely.
 * @param filename - The file to delete
 */
declare function ini_delete(filename: string): void;
//# sourceMappingURL=ini.d.ts.map
/**
 * JSON encoding/decoding utilities.
 *
 * Mirrors GMS's json_encode / json_decode API with additional helpers
 * for deep cloning and safe parsing.
 *
 * Unlike GMS, these functions operate on native JS values (objects, arrays)
 * rather than on ds_map/ds_list IDs.
 */
/**
 * Encodes a JavaScript value to a JSON string.
 * Equivalent to GMS's json_encode (which accepts a ds_map).
 * @param val - Any JSON-serialisable value
 * @returns JSON string, or an empty string on error
 */
declare function json_encode(val: unknown): string;
/**
 * Decodes a JSON string into a JavaScript value.
 * Returns undefined if the string is not valid JSON.
 * @param str - JSON string
 * @returns Parsed value, or undefined on parse error
 */
declare function json_decode(str: string): unknown;
/**
 * Encodes a value to a pretty-printed JSON string (human-readable).
 * @param val - Any JSON-serialisable value
 * @param indent - Number of spaces for indentation (default 2)
 */
declare function json_stringify_pretty(val: unknown, indent?: number): string;
/**
 * Deep clones a JSON-serialisable value via encode/decode round-trip.
 * Functions and undefined values in the object will be lost.
 * @param val - Value to clone
 * @returns A deep copy of val, or undefined if not serialisable
 */
declare function json_deep_clone<T>(val: T): T | undefined;
/**
 * Returns true if a string is valid JSON.
 * @param str - String to test
 */
declare function json_is_valid(str: string): boolean;
/**
 * Saves a serialisable value to localStorage under a given key.
 * @param key - localStorage key
 * @param val - Value to save
 */
declare function json_save(key: string, val: unknown): void;
/**
 * Loads a value from localStorage and decodes it from JSON.
 * Returns the default value if the key is missing or invalid.
 * @param key - localStorage key
 * @param default_val - Returned if the key is absent or invalid
 */
declare function json_load<T>(key: string, default_val: T): T;
/**
 * Deletes a JSON entry from localStorage.
 * @param key - localStorage key to delete
 */
declare function json_delete(key: string): void;
//# sourceMappingURL=json_storage.d.ts.map
`;

// packages/ide/src/editors/script_editor.ts
var MONACO_VERSION = "0.52.2";
var MONACO_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;
var _monaco_ready = null;
function _load_monaco() {
  if (_monaco_ready) return _monaco_ready;
  _monaco_ready = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MONACO_CDN}/loader.js`;
    script.onload = () => {
      const req = window.require;
      req.config({ paths: { vs: MONACO_CDN } });
      req(["vs/editor/editor.main"], (monaco) => {
        _setup_monaco(monaco);
        resolve(monaco);
      }, reject);
    };
    script.onerror = () => reject(new Error("Failed to load Monaco loader.js"));
    document.head.appendChild(script);
  });
  return _monaco_ready;
}
function _setup_monaco(monaco) {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    ENGINE_DTS,
    "ts:silkweaver/engine.d.ts"
  );
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    strict: false,
    noImplicitAny: false,
    noImplicitThis: false,
    lib: ["es2020", "dom"],
    allowNonTsExtensions: true
  });
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  });
}
var _editor_id_counter = 0;
var ScriptEditor = class {
  constructor(title, default_x = 240, default_y = 30) {
    this._editor = null;
    this._file_handle = null;
    this._rel_path = null;
    // Electron / fallback path
    this._file_key = "";
    this._save_timer = null;
    this._dirty = false;
    /** Called when the editor saves the file (with the updated content). */
    this.on_save = () => {
    };
    const id = `script-editor-${++_editor_id_counter}`;
    this._win = new FloatingWindow(id, title, "icons/script.svg", {
      x: default_x,
      y: default_y,
      w: 700,
      h: 500
    });
    const loading = document.createElement("div");
    loading.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;color:var(--sw-text-dim);font-size:12px;";
    loading.textContent = "Loading editor\u2026";
    this._win.body.appendChild(loading);
  }
  // ── Public API ────────────────────────────────────────────────────────
  /**
   * Mount the window and load a file handle into the editor.
   * @param parent      - Workspace element to mount into
   * @param file_handle - FSAPI file handle for the script file
   */
  async open(parent, file_handle) {
    this._file_handle = file_handle;
    this._win.mount(parent);
    this._win.set_title(file_handle.name);
    const monaco = await _load_monaco();
    let content = "";
    try {
      const file = await file_handle.getFile();
      content = await file.text();
    } catch {
      content = "// New script\n";
    }
    this._win.body.innerHTML = "";
    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%;";
    this._win.body.appendChild(container);
    this._editor = monaco.editor.create(container, {
      value: content,
      language: "typescript",
      theme: "vs-dark",
      fontSize: 13,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "off",
      tabSize: 4,
      insertSpaces: true,
      glyphMargin: true,
      fixedOverflowWidgets: true
    });
    bp_register_editor(this._file_key, this._editor);
    this._editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber;
        if (line) bp_toggle(this._file_key, line);
      }
    });
    this._editor.onDidChangeModelContent(() => {
      this._dirty = true;
      this._win.set_title("\u25CF " + (this._file_handle?.name ?? "script"));
      if (this._save_timer !== null) clearTimeout(this._save_timer);
      this._save_timer = setTimeout(() => this._do_save(), 500);
    });
    this._editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => this._do_save()
    );
    this._win.bring_to_front();
  }
  /**
   * Opens an editor for a raw string (no file handle — used for inline event code).
   * @param parent  - Workspace element
   * @param content - Initial code content
   * @param lang    - Language (default 'typescript')
   */
  /**
   * Mount the window and load a file by relative project path (Electron / fallback).
   * @param parent   - Workspace element to mount into
   * @param rel_path - Relative path e.g. 'scripts/player.ts'
   */
  async open_path(parent, rel_path) {
    this._rel_path = rel_path;
    this._win.mount(parent);
    this._win.set_title(rel_path.split("/").pop() ?? rel_path);
    const monaco = await _load_monaco();
    let content = "";
    try {
      content = await project_read_file(rel_path);
    } catch {
      content = "// New script\n";
    }
    this._win.body.innerHTML = "";
    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%;";
    this._win.body.appendChild(container);
    this._editor = monaco.editor.create(container, {
      value: content,
      language: "typescript",
      theme: "vs-dark",
      fontSize: 13,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "off",
      tabSize: 4,
      insertSpaces: true,
      glyphMargin: true,
      fixedOverflowWidgets: true
    });
    bp_register_editor(this._file_key, this._editor);
    this._editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber;
        if (line) bp_toggle(this._file_key, line);
      }
    });
    this._editor.onDidChangeModelContent(() => {
      this._dirty = true;
      this._win.set_title("\u25CF " + (rel_path.split("/").pop() ?? rel_path));
      if (this._save_timer !== null) clearTimeout(this._save_timer);
      this._save_timer = setTimeout(() => this._do_save(), 500);
    });
    this._win.body.appendChild(
      Object.assign(document.createElement("div"), {
        className: "sw-editor-toolbar"
      })
    );
  }
  async open_inline(parent, content, lang = "typescript") {
    this._win.mount(parent);
    const monaco = await _load_monaco();
    this._win.body.innerHTML = "";
    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%;";
    this._win.body.appendChild(container);
    this._editor = monaco.editor.create(container, {
      value: content,
      language: lang,
      theme: "vs-dark",
      fontSize: 13,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fixedOverflowWidgets: true
    });
    this._editor.onDidChangeModelContent(() => {
      this._dirty = true;
      this.on_save(this._editor.getValue());
    });
  }
  /** Set the file key used for breakpoint tracking. */
  set_file_key(key) {
    this._file_key = key;
    if (this._editor) {
      bp_unregister_editor(key);
      bp_register_editor(key, this._editor);
    }
  }
  /** Returns the current editor content. */
  get_value() {
    return this._editor?.getValue() ?? "";
  }
  /** Programmatically set the editor content (does not trigger auto-save). */
  set_value(content) {
    if (this._editor) {
      const model = this._editor.getModel();
      if (model) model.setValue(content);
    }
  }
  /** Focus the editor. */
  focus() {
    this._editor?.focus();
  }
  /** Register a callback for when the window is closed. */
  on_close(cb) {
    this._win.on_close(cb);
  }
  // ── Save ──────────────────────────────────────────────────────────────
  async _do_save() {
    if (!this._dirty) return;
    const content = this._editor?.getValue() ?? "";
    if (this._file_handle) {
      try {
        const writable = await this._file_handle.createWritable();
        await writable.write(content);
        await writable.close();
      } catch (err) {
        console.error("[ScriptEditor] Save failed:", err);
        return;
      }
    } else if (this._rel_path) {
      try {
        await project_write_file(this._rel_path, content);
      } catch (err) {
        console.error("[ScriptEditor] Save failed:", err);
        return;
      }
    }
    this._dirty = false;
    const title = this._file_handle?.name ?? this._rel_path?.split("/").pop() ?? "script";
    this._win.set_title(title);
    this.on_save(content);
  }
};
var _open_editors = /* @__PURE__ */ new Map();
async function script_editor_open(parent, file_handle, key) {
  const existing = _open_editors.get(key);
  if (existing) {
    existing.focus();
    return existing;
  }
  const ed = new ScriptEditor(file_handle.name);
  ed.set_file_key(key);
  _open_editors.set(key, ed);
  ed.on_save = () => {
  };
  ed.on_close(() => {
    bp_unregister_editor(key);
    _open_editors.delete(key);
  });
  await ed.open(parent, file_handle);
  return ed;
}
async function script_editor_open_path(parent, rel_path) {
  const existing = _open_editors.get(rel_path);
  if (existing) {
    existing.focus();
    return existing;
  }
  const filename = rel_path.split("/").pop() ?? rel_path;
  const ed = new ScriptEditor(filename);
  ed.set_file_key(rel_path);
  _open_editors.set(rel_path, ed);
  ed.on_save = () => {
  };
  ed.on_close(() => {
    bp_unregister_editor(rel_path);
    _open_editors.delete(rel_path);
  });
  await ed.open_path(parent, rel_path);
  return ed;
}
async function script_editor_open_smart(parent, rel_path, get_handle) {
  if (!project_has_folder()) {
    alert("Open a project folder first.");
    throw new Error("No project folder");
  }
  if (window.swfs || !window.showDirectoryPicker) {
    return script_editor_open_path(parent, rel_path);
  }
  const handle = await get_handle();
  return script_editor_open(parent, handle, rel_path);
}
var _project_types_disposable = null;
function inject_project_types(state) {
  _load_monaco().then((monaco) => {
    if (_project_types_disposable) {
      _project_types_disposable.dispose();
    }
    const object_names = Object.keys(state.resources?.objects || {});
    const declarations = object_names.map(
      (name) => `declare const ${name}: typeof gm_object;`
    ).join("\n");
    const project_types = `
// Project-specific object classes
${declarations}
`;
    _project_types_disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
      project_types,
      "ts:silkweaver/project-objects.d.ts"
    );
  });
}

// packages/ide/src/editors/pixel_editor.ts
function pixel_editor_open(workspace, width, height, initial_data, on_save) {
  new PixelEditor(workspace, width, height, initial_data, on_save);
}
var PixelEditor = class {
  constructor(workspace, width, height, initial_data, on_save) {
    this._zoom = 20;
    // pixels per grid cell
    this._tool = "pencil";
    this._color = "#000000";
    this._is_drawing = false;
    // UI elements
    this._tool_btns = /* @__PURE__ */ new Map();
    this._on_keydown = (e) => {
      if (e.key === "p" || e.key === "P") this._set_tool("pencil");
      if (e.key === "e" || e.key === "E") this._set_tool("eraser");
      if (e.key === "f" || e.key === "F") this._set_tool("fill");
      if (e.key === "i" || e.key === "I") this._set_tool("eyedropper");
    };
    // ── Drawing ───────────────────────────────────────────────────────────
    this._on_mousedown = (e) => {
      e.preventDefault();
      this._is_drawing = true;
      const { px, py } = this._get_pixel_coords(e);
      if (px < 0 || py < 0 || px >= this._width || py >= this._height) return;
      const is_erasing = e.button === 2;
      if (this._tool === "fill" && !is_erasing) {
        this._flood_fill(px, py);
      } else if (this._tool === "eyedropper" && !is_erasing) {
        this._pick_color(px, py);
      } else {
        this._draw_pixel(px, py, is_erasing);
      }
    };
    this._on_mousemove = (e) => {
      if (!this._is_drawing) return;
      const is_erasing = e.buttons === 2;
      if (this._tool === "fill" || this._tool === "eyedropper") return;
      const { px, py } = this._get_pixel_coords(e);
      if (px < 0 || py < 0 || px >= this._width || py >= this._height) return;
      this._draw_pixel(px, py, is_erasing);
    };
    this._on_mouseup = () => {
      this._is_drawing = false;
    };
    this._width = width;
    this._height = height;
    this._on_save = on_save;
    this._win = new FloatingWindow(
      "pixel-editor",
      "Pixel Editor",
      null,
      { x: 100, y: 100, w: Math.min(800, width * this._zoom + 200), h: Math.min(600, height * this._zoom + 150) }
    );
    this._build_ui();
    this._setup_canvas(initial_data);
    this._win.mount(workspace);
  }
  // ── UI Construction ───────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; flex-direction:column; overflow:hidden; background:#1e1e1e;";
    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
            display:flex; gap:8px; padding:8px;
            background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2);
            align-items:center;
        `;
    const tools = [
      { tool: "pencil", char: "\u270E", title: "Pencil (P)" },
      // ✎
      { tool: "eraser", char: "\u2573", title: "Eraser (E)" },
      // ╳
      { tool: "fill", char: "\u25A8", title: "Fill Bucket (F)" },
      // ▨
      { tool: "eyedropper", char: "\u25BC", title: "Eyedropper (I)" }
      // ▼
    ];
    tools.forEach(({ tool, char, title }) => {
      const btn = document.createElement("button");
      btn.textContent = char;
      btn.title = title;
      btn.style.cssText = `
                width:28px; height:28px; cursor:pointer;
                border:1px solid var(--sw-border2); background:var(--sw-chrome2); color:var(--sw-text);
                font-size:14px; padding:0; display:flex; align-items:center; justify-content:center;
            `;
      btn.addEventListener("click", () => this._set_tool(tool));
      this._tool_btns.set(tool, btn);
      toolbar.appendChild(btn);
    });
    const sep = document.createElement("div");
    sep.style.cssText = "width:1px; height:24px; background:var(--sw-border2); margin:0 8px;";
    toolbar.appendChild(sep);
    this._color_preview = document.createElement("div");
    this._color_preview.style.cssText = `
            width:28px; height:28px; border:1px solid var(--sw-border2);
            background:${this._color}; cursor:pointer;
        `;
    this._color_preview.title = "Click to pick color";
    this._color_preview.addEventListener("click", () => this._color_input.click());
    toolbar.appendChild(this._color_preview);
    this._color_input = document.createElement("input");
    this._color_input.type = "color";
    this._color_input.value = this._color;
    this._color_input.style.cssText = "display:none;";
    this._color_input.addEventListener("input", () => {
      this._color = this._color_input.value;
      this._color_preview.style.background = this._color;
    });
    toolbar.appendChild(this._color_input);
    const save_btn = document.createElement("button");
    save_btn.textContent = "Save";
    save_btn.style.cssText = `
            margin-left:auto; padding:5px 16px; cursor:pointer;
            background:var(--sw-chrome2); color:var(--sw-text);
            border:1px solid var(--sw-border2); font-size:12px;
        `;
    save_btn.addEventListener("click", () => this._save());
    toolbar.appendChild(save_btn);
    body.appendChild(toolbar);
    const container = document.createElement("div");
    container.style.cssText = `
            flex:1; overflow:auto; display:flex; align-items:center; justify-content:center;
            background:#1a1a1a;
        `;
    this._canvas = document.createElement("canvas");
    this._canvas.width = this._width;
    this._canvas.height = this._height;
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    this._display_canvas = document.createElement("canvas");
    this._display_canvas.width = this._width * this._zoom;
    this._display_canvas.height = this._height * this._zoom;
    this._display_canvas.style.cssText = `
            image-rendering:pixelated; cursor:crosshair;
            border:1px solid var(--sw-border2);
        `;
    this._display_ctx = this._display_canvas.getContext("2d");
    this._display_ctx.imageSmoothingEnabled = false;
    container.appendChild(this._display_canvas);
    body.appendChild(container);
    this._set_tool("pencil");
    window.addEventListener("keydown", this._on_keydown);
    this._win.on_close(() => {
      window.removeEventListener("keydown", this._on_keydown);
    });
  }
  _setup_canvas(initial_data) {
    this._ctx.fillStyle = "#ffffff";
    this._ctx.fillRect(0, 0, this._width, this._height);
    if (initial_data) {
      const img = new Image();
      img.onload = () => {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this._ctx.drawImage(img, 0, 0, this._width, this._height);
        this._redraw();
      };
      img.src = initial_data;
    } else {
      this._redraw();
    }
    this._display_canvas.addEventListener("mousedown", this._on_mousedown);
    this._display_canvas.addEventListener("mousemove", this._on_mousemove);
    this._display_canvas.addEventListener("mouseup", this._on_mouseup);
    this._display_canvas.addEventListener("mouseleave", this._on_mouseup);
    this._display_canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  // ── Tools ─────────────────────────────────────────────────────────────
  _set_tool(tool) {
    this._tool = tool;
    this._tool_btns.forEach((btn, t) => {
      if (t === tool) {
        btn.style.background = "var(--sw-select-bg)";
        btn.style.borderColor = "var(--sw-accent)";
      } else {
        btn.style.background = "var(--sw-chrome2)";
        btn.style.borderColor = "var(--sw-border2)";
      }
    });
  }
  _get_pixel_coords(e) {
    const rect = this._display_canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
      px: Math.floor(x / this._zoom),
      py: Math.floor(y / this._zoom)
    };
  }
  _draw_pixel(px, py, force_erase = false) {
    if (this._tool === "eraser" || force_erase) {
      this._ctx.clearRect(px, py, 1, 1);
    } else {
      this._ctx.fillStyle = this._color;
      this._ctx.fillRect(px, py, 1, 1);
    }
    this._redraw();
  }
  _pick_color(px, py) {
    const imageData = this._ctx.getImageData(px, py, 1, 1);
    const [r = 0, g = 0, b = 0] = imageData.data;
    this._color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    this._color_input.value = this._color;
    this._color_preview.style.background = this._color;
    this._set_tool("pencil");
  }
  _flood_fill(px, py) {
    const imageData = this._ctx.getImageData(0, 0, this._width, this._height);
    const data = imageData.data;
    const target_color = this._get_pixel_color(data, px, py);
    const fill_color = this._hex_to_rgba(this._color);
    if (this._colors_equal(target_color, fill_color)) return;
    const stack = [[px, py]];
    const visited = /* @__PURE__ */ new Set();
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || y < 0 || x >= this._width || y >= this._height) continue;
      const current = this._get_pixel_color(data, x, y);
      if (!this._colors_equal(current, target_color)) continue;
      visited.add(key);
      this._set_pixel_color(data, x, y, fill_color);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    this._ctx.putImageData(imageData, 0, 0);
    this._redraw();
  }
  _get_pixel_color(data, x, y) {
    const idx = (y * this._width + x) * 4;
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  }
  _set_pixel_color(data, x, y, color) {
    const idx = (y * this._width + x) * 4;
    data[idx] = color[0];
    data[idx + 1] = color[1];
    data[idx + 2] = color[2];
    data[idx + 3] = color[3];
  }
  _hex_to_rgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  }
  _colors_equal(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }
  // ── Display ───────────────────────────────────────────────────────────
  _redraw() {
    this._display_ctx.clearRect(0, 0, this._display_canvas.width, this._display_canvas.height);
    const checker_size = this._zoom;
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        const is_light = (x + y) % 2 === 0;
        this._display_ctx.fillStyle = is_light ? "#e0e0e0" : "#c0c0c0";
        this._display_ctx.fillRect(x * this._zoom, y * this._zoom, this._zoom, this._zoom);
      }
    }
    this._display_ctx.imageSmoothingEnabled = false;
    this._display_ctx.drawImage(this._canvas, 0, 0, this._width * this._zoom, this._height * this._zoom);
    this._display_ctx.strokeStyle = "rgba(0,0,0,0.15)";
    this._display_ctx.lineWidth = 1;
    for (let x = 0; x <= this._width; x++) {
      this._display_ctx.beginPath();
      this._display_ctx.moveTo(x * this._zoom + 0.5, 0);
      this._display_ctx.lineTo(x * this._zoom + 0.5, this._display_canvas.height);
      this._display_ctx.stroke();
    }
    for (let y = 0; y <= this._height; y++) {
      this._display_ctx.beginPath();
      this._display_ctx.moveTo(0, y * this._zoom + 0.5);
      this._display_ctx.lineTo(this._display_canvas.width, y * this._zoom + 0.5);
      this._display_ctx.stroke();
    }
  }
  // ── Save ──────────────────────────────────────────────────────────────
  _save() {
    const data_url = this._canvas.toDataURL("image/png");
    this._on_save(data_url);
    this._win.close();
  }
};

// packages/ide/src/services/dialogs.ts
function _modal(content_html) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.55);
        display:flex; align-items:center; justify-content:center;
    `;
  const box = document.createElement("div");
  box.style.cssText = `
        background:#2b2b2b; border:1px solid #555; border-radius:4px;
        padding:18px 20px; min-width:320px; max-width:460px;
        font-family:sans-serif; color:#ccc; font-size:13px;
        display:flex; flex-direction:column; gap:10px;
        box-shadow:0 4px 24px rgba(0,0,0,0.6);
    `;
  box.innerHTML = content_html;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  return { overlay, close };
}
function show_alert(msg) {
  return new Promise((resolve) => {
    const { close } = _modal(`
            <p style="margin:0;white-space:pre-wrap;">${msg.replace(/</g, "&lt;")}</p>
            <div style="display:flex;justify-content:flex-end;">
                <button id="_sw_ok" style="padding:4px 20px;cursor:pointer;">OK</button>
            </div>
        `);
    document.getElementById("_sw_ok").addEventListener("click", () => {
      close();
      resolve();
    });
  });
}
function show_prompt(msg, def = "") {
  return new Promise((resolve) => {
    const { close } = _modal(`
            <p style="margin:0;">${msg.replace(/</g, "&lt;")}</p>
            <input id="_sw_inp" value="${def.replace(/"/g, "&quot;")}"
                style="padding:5px 8px;background:#3c3c3c;border:1px solid #555;color:#ddd;font-size:13px;border-radius:3px;outline:none;">
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="_sw_ok"     style="padding:4px 20px;cursor:pointer;">OK</button>
                <button id="_sw_cancel" style="padding:4px 20px;cursor:pointer;">Cancel</button>
            </div>
        `);
    const inp = document.getElementById("_sw_inp");
    inp.focus();
    inp.select();
    const ok = () => {
      close();
      resolve(inp.value);
    };
    const cancel = () => {
      close();
      resolve(null);
    };
    document.getElementById("_sw_ok").addEventListener("click", ok);
    document.getElementById("_sw_cancel").addEventListener("click", cancel);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ok();
      if (e.key === "Escape") cancel();
    });
  });
}
function show_confirm(msg) {
  return new Promise((resolve) => {
    const { close } = _modal(`
            <p style="margin:0;white-space:pre-wrap;">${msg.replace(/</g, "&lt;")}</p>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="_sw_ok"     style="padding:4px 20px;cursor:pointer;">OK</button>
                <button id="_sw_cancel" style="padding:4px 20px;cursor:pointer;">Cancel</button>
            </div>
        `);
    document.getElementById("_sw_ok").addEventListener("click", () => {
      close();
      resolve(true);
    });
    document.getElementById("_sw_cancel").addEventListener("click", () => {
      close();
      resolve(false);
    });
  });
}

// packages/ide/src/editors/sprite_editor.ts
var _open_editors2 = /* @__PURE__ */ new Map();
function sprite_editor_open(workspace, sprite_name, project_name) {
  const existing = _open_editors2.get(sprite_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new sprite_editor_window(workspace, sprite_name, project_name);
  _open_editors2.set(sprite_name, ed);
  ed.on_closed(() => _open_editors2.delete(sprite_name));
}
var _next_offset = 0;
var sprite_editor_window = class {
  constructor(workspace, sprite_name, project_name) {
    this._anim_timer = null;
    this._anim_frame = 0;
    this._on_closed_cb = null;
    this._zoom = 1;
    this._dragging = null;
    this._drag_offset = { x: 0, y: 0 };
    // ── Canvas interaction ─────────────────────────────────────────────────
    this._on_canvas_mousedown = (e) => {
      const rect = this._canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this._zoom);
      const y = Math.floor((e.clientY - rect.top) / this._zoom);
      const origin_dist = Math.sqrt(Math.pow(x - this._data.origin_x, 2) + Math.pow(y - this._data.origin_y, 2));
      if (origin_dist < 5 / this._zoom + 3) {
        this._dragging = "origin";
        this._drag_offset = { x: x - this._data.origin_x, y: y - this._data.origin_y };
        return;
      }
      const mx = this._data.mask_x;
      const my = this._data.mask_y;
      const mw = this._data.mask_w;
      const mh = this._data.mask_h;
      if (x >= mx && x <= mx + mw && y >= my && y <= my + mh) {
        this._dragging = "mask";
        this._drag_offset = { x: x - mx, y: y - my };
        return;
      }
    };
    this._on_canvas_mousemove = (e) => {
      if (!this._dragging) return;
      const rect = this._canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this._zoom);
      const y = Math.floor((e.clientY - rect.top) / this._zoom);
      if (this._dragging === "origin") {
        this._data.origin_x = Math.max(0, Math.min(this._data.width, x - this._drag_offset.x));
        this._data.origin_y = Math.max(0, Math.min(this._data.height, y - this._drag_offset.y));
        this._redraw();
        this._save_meta();
      } else if (this._dragging === "mask") {
        this._data.mask_x = Math.max(0, Math.min(this._data.width - this._data.mask_w, x - this._drag_offset.x));
        this._data.mask_y = Math.max(0, Math.min(this._data.height - this._data.mask_h, y - this._drag_offset.y));
        this._redraw();
        this._save_meta();
      }
    };
    this._on_canvas_mouseup = () => {
      this._dragging = null;
    };
    this._sprite_name = sprite_name;
    this._project = project_name;
    const off = _next_offset++ % 8 * 24;
    this._win = new FloatingWindow(
      `sprite-editor-${sprite_name}`,
      `Sprite: ${sprite_name}`,
      "icons/sprite.svg",
      { x: 240 + off, y: 40 + off, w: 620, h: 460 }
    );
    this._win.on_close(() => {
      this._stop_anim();
      this._on_closed_cb?.();
    });
    this._data = {
      frames: [],
      origin_x: 0,
      origin_y: 0,
      width: 0,
      height: 0,
      anim_speed: 15,
      mask_type: "rectangle",
      mask_x: 0,
      mask_y: 0,
      mask_w: 0,
      mask_h: 0
    };
    this._build_ui();
    this._load_data();
    this._win.mount(workspace);
  }
  // ── Public helpers ─────────────────────────────────────────────────────
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._on_closed_cb = cb;
  }
  // ── UI construction ────────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; flex-direction:column; overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.className = "sw-editor-toolbar";
    const btn_new_frame = _tool_btn("New Frame", () => this._create_new_frame());
    const btn_import = _tool_btn("Import Frames", () => this._import_frames());
    const btn_clear = _tool_btn("Clear All", () => this._clear_frames());
    toolbar.append(btn_new_frame, btn_import, btn_clear);
    body.appendChild(toolbar);
    const main = document.createElement("div");
    main.style.cssText = "display:flex; flex:1; overflow:hidden;";
    body.appendChild(main);
    const left = document.createElement("div");
    left.className = "sw-sprite-framelist";
    this._frame_list = left;
    main.appendChild(left);
    const center = document.createElement("div");
    center.className = "sw-sprite-preview-area";
    center.style.cssText = "flex:1; display:flex; flex-direction:column; overflow:hidden; background:var(--sw-chrome1);";
    const zoom_bar = document.createElement("div");
    zoom_bar.style.cssText = "display:flex; align-items:center; gap:8px; padding:4px 8px; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2);";
    const zoom_out = document.createElement("button");
    zoom_out.textContent = "\u2212";
    zoom_out.title = "Zoom Out";
    zoom_out.style.cssText = "width:24px; height:24px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text);";
    zoom_out.addEventListener("click", () => this._adjust_zoom(-1));
    const zoom_label = document.createElement("span");
    zoom_label.id = "zoom-label";
    zoom_label.textContent = "1x";
    zoom_label.style.cssText = "font-size:11px; color:var(--sw-text); min-width:30px; text-align:center;";
    const zoom_in = document.createElement("button");
    zoom_in.textContent = "+";
    zoom_in.title = "Zoom In";
    zoom_in.style.cssText = "width:24px; height:24px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text);";
    zoom_in.addEventListener("click", () => this._adjust_zoom(1));
    const zoom_fit = document.createElement("button");
    zoom_fit.textContent = "Fit";
    zoom_fit.title = "Fit to View";
    zoom_fit.style.cssText = "padding:4px 8px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text); font-size:11px;";
    zoom_fit.addEventListener("click", () => this._fit_zoom());
    zoom_bar.append(zoom_out, zoom_label, zoom_in, zoom_fit);
    center.appendChild(zoom_bar);
    const canvas_container = document.createElement("div");
    canvas_container.style.cssText = "flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; background:#2a2a2a;";
    this._canvas = document.createElement("canvas");
    this._canvas.width = 192;
    this._canvas.height = 192;
    this._canvas.className = "sw-sprite-canvas";
    this._canvas.style.cssText = "image-rendering:pixelated; cursor:crosshair;";
    this._ctx = this._canvas.getContext("2d");
    this._canvas.addEventListener("mousedown", this._on_canvas_mousedown);
    this._canvas.addEventListener("mousemove", this._on_canvas_mousemove);
    this._canvas.addEventListener("mouseup", this._on_canvas_mouseup);
    this._canvas.addEventListener("mouseleave", this._on_canvas_mouseup);
    canvas_container.appendChild(this._canvas);
    center.appendChild(canvas_container);
    main.appendChild(center);
    const right = document.createElement("div");
    right.className = "sw-sprite-props";
    right.appendChild(this._build_props());
    main.appendChild(right);
  }
  _build_props() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; gap:8px; padding:8px;";
    const origin_sec = _section("Origin");
    const ox_row = _prop_row("X:", this._data.origin_x, (v) => {
      this._data.origin_x = v;
      this._redraw();
    });
    const oy_row = _prop_row("Y:", this._data.origin_y, (v) => {
      this._data.origin_y = v;
      this._redraw();
    });
    origin_sec.append(ox_row, oy_row);
    const origin_presets = document.createElement("div");
    origin_presets.style.cssText = "display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;";
    const presets = [
      ["TL", () => [0, 0]],
      ["TC", () => [Math.floor(this._data.width / 2), 0]],
      ["TR", () => [this._data.width - 1, 0]],
      ["ML", () => [0, Math.floor(this._data.height / 2)]],
      ["MC", () => [Math.floor(this._data.width / 2), Math.floor(this._data.height / 2)]],
      ["MR", () => [this._data.width - 1, Math.floor(this._data.height / 2)]],
      ["BL", () => [0, this._data.height - 1]],
      ["BC", () => [Math.floor(this._data.width / 2), this._data.height - 1]],
      ["BR", () => [this._data.width - 1, this._data.height - 1]]
    ];
    for (const [label, get_val] of presets) {
      const b = document.createElement("button");
      b.textContent = label;
      b.className = "sw-btn";
      b.style.cssText = "padding:2px 4px; font-size:10px;";
      b.addEventListener("click", () => {
        const [x, y] = get_val();
        this._data.origin_x = x;
        this._data.origin_y = y;
        const inputs = ox_row.querySelectorAll("input");
        const oy_inputs = oy_row.querySelectorAll("input");
        if (inputs[0]) inputs[0].valueAsNumber = x;
        if (oy_inputs[0]) oy_inputs[0].valueAsNumber = y;
        this._redraw();
      });
      origin_presets.appendChild(b);
    }
    origin_sec.appendChild(origin_presets);
    const anim_sec = _section("Animation");
    const speed_row = _prop_row("FPS:", this._data.anim_speed, (v) => {
      this._data.anim_speed = Math.max(1, v);
      this._restart_anim();
    });
    anim_sec.appendChild(speed_row);
    const mask_sec = _section("Collision Mask");
    const mask_type_el = document.createElement("select");
    mask_type_el.className = "sw-select";
    ["rectangle", "ellipse", "diamond", "precise"].forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      if (t === this._data.mask_type) opt.selected = true;
      mask_type_el.appendChild(opt);
    });
    mask_type_el.addEventListener("change", () => {
      this._data.mask_type = mask_type_el.value;
      this._redraw();
    });
    mask_sec.appendChild(mask_type_el);
    mask_sec.append(
      _prop_row("X:", this._data.mask_x, (v) => {
        this._data.mask_x = v;
        this._redraw();
      }),
      _prop_row("Y:", this._data.mask_y, (v) => {
        this._data.mask_y = v;
        this._redraw();
      }),
      _prop_row("W:", this._data.mask_w, (v) => {
        this._data.mask_w = v;
        this._redraw();
      }),
      _prop_row("H:", this._data.mask_h, (v) => {
        this._data.mask_h = v;
        this._redraw();
      })
    );
    el.append(origin_sec, anim_sec, mask_sec);
    return el;
  }
  // ── Frame management ───────────────────────────────────────────────────
  async _create_new_frame() {
    if (this._data.frames.length === 0) {
      const w = await show_prompt("Frame width (pixels):", "32");
      if (!w) return;
      const h = await show_prompt("Frame height (pixels):", "32");
      if (!h) return;
      const width = Math.max(1, parseInt(w) || 32);
      const height = Math.max(1, parseInt(h) || 32);
      this._data.width = width;
      this._data.height = height;
      this._data.mask_w = width;
      this._data.mask_h = height;
      this._canvas.width = Math.min(192, width);
      this._canvas.height = Math.min(192, height);
    }
    pixel_editor_open(
      this._win.body.parentElement,
      this._data.width,
      this._data.height,
      null,
      (data_url) => this._save_new_frame(data_url)
    );
  }
  _edit_frame(index) {
    const frame = this._data.frames[index];
    if (!frame) return;
    pixel_editor_open(
      this._win.body.parentElement,
      this._data.width,
      this._data.height,
      frame.data_url,
      (data_url) => this._update_frame(index, data_url)
    );
  }
  async _save_new_frame(data_url) {
    const frame_name = `${this._sprite_name}_${this._data.frames.length}.png`;
    this._data.frames.push({ name: frame_name, data_url });
    try {
      const blob = await fetch(data_url).then((r) => r.blob());
      await project_write_binary(`sprites/${this._sprite_name}/${frame_name}`, blob);
    } catch {
    }
    this._rebuild_frame_list();
    this._restart_anim();
    this._save_meta();
  }
  async _update_frame(index, data_url) {
    const frame = this._data.frames[index];
    if (!frame) return;
    frame.data_url = data_url;
    try {
      const blob = await fetch(data_url).then((r) => r.blob());
      await project_write_binary(`sprites/${this._sprite_name}/${frame.name}`, blob);
    } catch {
    }
    this._rebuild_frame_list();
    this._restart_anim();
  }
  async _import_frames() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/gif";
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      for (const file of files) {
        const data_url = await _file_to_data_url(file);
        const frame_name = `${this._sprite_name}_${this._data.frames.length}.png`;
        this._data.frames.push({ name: frame_name, data_url });
        if (this._data.frames.length === 1) {
          const img = new Image();
          await new Promise((res) => {
            img.onload = () => res();
            img.src = data_url;
          });
          this._data.width = img.naturalWidth;
          this._data.height = img.naturalHeight;
          this._data.mask_w = img.naturalWidth;
          this._data.mask_h = img.naturalHeight;
          this._canvas.width = Math.min(192, img.naturalWidth);
          this._canvas.height = Math.min(192, img.naturalHeight);
        }
        try {
          await project_write_binary(`sprites/${this._sprite_name}/${frame_name}`, file);
        } catch {
        }
      }
      this._rebuild_frame_list();
      this._restart_anim();
      this._save_meta();
    };
    input.click();
  }
  _clear_frames() {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:280px;font-family:sans-serif;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:10px;";
    box.innerHTML = `<p style="margin:0;">Clear all frames from "<b>${this._sprite_name}</b>"?</p>`;
    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";
    const ok_btn = document.createElement("button");
    ok_btn.textContent = "Clear";
    ok_btn.style.cssText = "padding:4px 20px;cursor:pointer;";
    const cancel_btn = document.createElement("button");
    cancel_btn.textContent = "Cancel";
    cancel_btn.style.cssText = "padding:4px 20px;cursor:pointer;";
    btns.append(ok_btn, cancel_btn);
    box.appendChild(btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    ok_btn.addEventListener("click", () => {
      overlay.remove();
      this._stop_anim();
      this._data.frames = [];
      this._data.width = 0;
      this._data.height = 0;
      this._rebuild_frame_list();
      this._clear_canvas();
      this._save_meta();
    });
    cancel_btn.addEventListener("click", () => overlay.remove());
  }
  _rebuild_frame_list() {
    this._frame_list.innerHTML = "";
    if (this._data.frames.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;";
      empty.textContent = 'No frames.\nClick "Import Frames".';
      this._frame_list.appendChild(empty);
      return;
    }
    this._data.frames.forEach((frame, i) => {
      const row = document.createElement("div");
      row.className = "sw-sprite-frame-row";
      row.dataset["index"] = String(i);
      const thumb = document.createElement("img");
      thumb.src = frame.data_url;
      thumb.style.cssText = "width:32px; height:32px; object-fit:contain; flex-shrink:0; image-rendering:pixelated;";
      const label = document.createElement("span");
      label.textContent = `#${i}`;
      label.style.cssText = "font-size:11px; flex:1;";
      const edit_btn = document.createElement("button");
      edit_btn.textContent = "\u270E";
      edit_btn.title = "Edit frame";
      edit_btn.style.cssText = "width:20px; height:20px; font-size:10px; flex-shrink:0; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2);";
      edit_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._edit_frame(i);
      });
      const del_btn = document.createElement("button");
      del_btn.textContent = "\u2715";
      del_btn.className = "sw-window-btn close";
      del_btn.style.cssText = "width:16px; height:16px; font-size:9px; flex-shrink:0;";
      del_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._data.frames.splice(i, 1);
        if (this._anim_frame >= this._data.frames.length) this._anim_frame = 0;
        this._rebuild_frame_list();
        this._restart_anim();
        this._save_meta();
      });
      row.draggable = true;
      row.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", String(i));
      });
      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        row.style.outline = "1px solid var(--sw-accent)";
      });
      row.addEventListener("dragleave", () => {
        row.style.outline = "";
      });
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        row.style.outline = "";
        const from = parseInt(e.dataTransfer.getData("text/plain"));
        const to = i;
        if (from === to) return;
        const [moved] = this._data.frames.splice(from, 1);
        this._data.frames.splice(to, 0, moved);
        this._rebuild_frame_list();
        this._save_meta();
      });
      row.append(thumb, label, edit_btn, del_btn);
      this._frame_list.appendChild(row);
    });
  }
  // ── Animation ──────────────────────────────────────────────────────────
  _restart_anim() {
    this._stop_anim();
    if (this._data.frames.length === 0) {
      this._clear_canvas();
      return;
    }
    const ms = Math.round(1e3 / Math.max(1, this._data.anim_speed));
    this._anim_timer = setInterval(() => {
      this._anim_frame = (this._anim_frame + 1) % this._data.frames.length;
      this._redraw();
    }, ms);
    this._redraw();
  }
  _stop_anim() {
    if (this._anim_timer !== null) {
      clearInterval(this._anim_timer);
      this._anim_timer = null;
    }
  }
  _redraw() {
    const frame = this._data.frames[this._anim_frame];
    if (!frame) {
      this._clear_canvas();
      return;
    }
    const img = new Image();
    img.onload = () => {
      const ctx = this._ctx;
      const cw = this._canvas.width;
      const ch = this._canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      _draw_checkerboard(ctx, cw, ch);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, cw, ch);
      this._draw_origin(ctx);
      this._draw_mask(ctx);
    };
    img.src = frame.data_url;
  }
  _clear_canvas() {
    const ctx = this._ctx;
    const cw = this._canvas.width;
    const ch = this._canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    _draw_checkerboard(ctx, cw, ch);
  }
  // ── Zoom controls ──────────────────────────────────────────────────────
  _adjust_zoom(delta) {
    const zoom_levels = [1, 2, 4, 8, 16, 32];
    const current_idx = zoom_levels.indexOf(this._zoom);
    let new_idx = current_idx + delta;
    if (new_idx < 0) new_idx = 0;
    if (new_idx >= zoom_levels.length) new_idx = zoom_levels.length - 1;
    this._zoom = zoom_levels[new_idx];
    this._update_canvas_size();
    this._redraw();
    const label = document.getElementById("zoom-label");
    if (label) label.textContent = `${this._zoom}x`;
  }
  _fit_zoom() {
    if (this._data.width === 0 || this._data.height === 0) return;
    const container_width = 400;
    const container_height = 300;
    const zoom_x = Math.floor(container_width / this._data.width);
    const zoom_y = Math.floor(container_height / this._data.height);
    const fit_zoom = Math.max(1, Math.min(zoom_x, zoom_y, 32));
    this._zoom = fit_zoom;
    this._update_canvas_size();
    this._redraw();
    const label = document.getElementById("zoom-label");
    if (label) label.textContent = `${this._zoom}x`;
  }
  _update_canvas_size() {
    if (this._data.width > 0 && this._data.height > 0) {
      this._canvas.width = this._data.width * this._zoom;
      this._canvas.height = this._data.height * this._zoom;
    }
  }
  _draw_origin(ctx) {
    const ox = this._data.origin_x * this._zoom;
    const oy = this._data.origin_y * this._zoom;
    const size = 8;
    ctx.save();
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox - size, oy);
    ctx.lineTo(ox + size, oy);
    ctx.moveTo(ox, oy - size);
    ctx.lineTo(ox, oy + size);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  _draw_mask(ctx) {
    const sx = this._data.mask_x * this._zoom;
    const sy = this._data.mask_y * this._zoom;
    const sw = this._data.mask_w * this._zoom;
    const sh = this._data.mask_h * this._zoom;
    ctx.save();
    ctx.strokeStyle = "#00c8ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    switch (this._data.mask_type) {
      case "rectangle":
        ctx.strokeRect(sx, sy, sw, sh);
        break;
      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "diamond":
        ctx.beginPath();
        ctx.moveTo(sx + sw / 2, sy);
        ctx.lineTo(sx + sw, sy + sh / 2);
        ctx.lineTo(sx + sw / 2, sy + sh);
        ctx.lineTo(sx, sy + sh / 2);
        ctx.closePath();
        ctx.stroke();
        break;
      case "precise":
        ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height);
        break;
    }
    ctx.restore();
  }
  // ── Persistence ────────────────────────────────────────────────────────
  async _load_data() {
    try {
      const json = await project_read_file(`sprites/${this._sprite_name}/meta.json`);
      const loaded = JSON.parse(json);
      if (loaded.origin_x !== void 0) this._data.origin_x = loaded.origin_x;
      if (loaded.origin_y !== void 0) this._data.origin_y = loaded.origin_y;
      if (loaded.width !== void 0) this._data.width = loaded.width;
      if (loaded.height !== void 0) this._data.height = loaded.height;
      if (loaded.anim_speed !== void 0) this._data.anim_speed = loaded.anim_speed;
      if (loaded.mask_type !== void 0) this._data.mask_type = loaded.mask_type;
      if (loaded.mask_x !== void 0) this._data.mask_x = loaded.mask_x;
      if (loaded.mask_y !== void 0) this._data.mask_y = loaded.mask_y;
      if (loaded.mask_w !== void 0) this._data.mask_w = loaded.mask_w;
      if (loaded.mask_h !== void 0) this._data.mask_h = loaded.mask_h;
      if (loaded.frames && loaded.frames.length > 0) {
        for (const f of loaded.frames) {
          let data_url = "";
          try {
            data_url = await project_read_binary_url(`sprites/${this._sprite_name}/${f.name}`);
          } catch {
          }
          this._data.frames.push({ name: f.name, data_url });
        }
      }
    } catch {
    }
    this._fit_zoom();
    this._rebuild_frame_list();
    this._restart_anim();
  }
  _save_meta() {
    const meta = {
      origin_x: this._data.origin_x,
      origin_y: this._data.origin_y,
      width: this._data.width,
      height: this._data.height,
      anim_speed: this._data.anim_speed,
      mask_type: this._data.mask_type,
      mask_x: this._data.mask_x,
      mask_y: this._data.mask_y,
      mask_w: this._data.mask_w,
      mask_h: this._data.mask_h,
      frames: this._data.frames.map((f) => ({ name: f.name }))
    };
    project_write_file(`sprites/${this._sprite_name}/meta.json`, JSON.stringify(meta, null, 2)).catch(() => {
    });
  }
};
function _tool_btn(label, cb) {
  const btn = document.createElement("button");
  btn.className = "sw-btn";
  btn.textContent = label;
  btn.addEventListener("click", cb);
  return btn;
}
function _section(title) {
  const el = document.createElement("div");
  el.style.cssText = "display:flex; flex-direction:column; gap:4px;";
  const hdr = document.createElement("div");
  hdr.style.cssText = "font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px;";
  hdr.textContent = title;
  el.appendChild(hdr);
  return el;
}
function _prop_row(label, initial, on_change) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:6px;";
  const lbl = document.createElement("span");
  lbl.className = "sw-label";
  lbl.style.cssText += "width:20px; text-align:right; margin:0;";
  lbl.textContent = label;
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "sw-input";
  inp.style.cssText = "width:60px;";
  inp.valueAsNumber = initial;
  inp.addEventListener("change", () => on_change(inp.valueAsNumber || 0));
  row.append(lbl, inp);
  return row;
}
function _draw_checkerboard(ctx, w, h) {
  const sz = 8;
  for (let y = 0; y < h; y += sz) {
    for (let x = 0; x < w; x += sz) {
      ctx.fillStyle = (x / sz + y / sz) % 2 === 0 ? "#555" : "#444";
      ctx.fillRect(x, y, sz, sz);
    }
  }
}
async function _file_to_data_url(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// packages/ide/src/editors/object_editor.ts
var EVENT_LABELS = {
  create: "Create",
  destroy: "Destroy",
  step: "Step",
  step_begin: "Step (Begin)",
  step_end: "Step (End)",
  draw: "Draw",
  draw_gui: "Draw GUI",
  alarm_0: "Alarm 0",
  alarm_1: "Alarm 1",
  alarm_2: "Alarm 2",
  alarm_3: "Alarm 3",
  key_press: "Key Press",
  key_release: "Key Release",
  key_held: "Key Held",
  mouse_left_press: "Mouse Left Press",
  mouse_left_release: "Mouse Left Release",
  mouse_right_press: "Mouse Right Press",
  collision: "Collision",
  room_start: "Room Start",
  room_end: "Room End",
  game_start: "Game Start",
  game_end: "Game End",
  animation_end: "Animation End",
  path_end: "Path End"
};
var EVENT_GROUPS = [
  { label: "Core", events: ["create", "destroy"] },
  { label: "Step", events: ["step_begin", "step", "step_end"] },
  { label: "Draw", events: ["draw", "draw_gui"] },
  { label: "Alarm", events: ["alarm_0", "alarm_1", "alarm_2", "alarm_3"] },
  { label: "Keyboard", events: ["key_press", "key_release", "key_held"] },
  { label: "Mouse", events: ["mouse_left_press", "mouse_left_release", "mouse_right_press"] },
  { label: "Collision", events: ["collision"] },
  { label: "Room/Game", events: ["room_start", "room_end", "game_start", "game_end"] },
  { label: "Other", events: ["animation_end", "path_end"] }
];
var _open_editors3 = /* @__PURE__ */ new Map();
function object_editor_open(workspace, object_name) {
  const existing = _open_editors3.get(object_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new object_editor_window(workspace, object_name);
  _open_editors3.set(object_name, ed);
  ed.on_closed(() => _open_editors3.delete(object_name));
}
var _next_offset2 = 0;
var object_editor_window = class {
  constructor(workspace, object_name) {
    this._vars_list_el = document.createElement("div");
    this._on_closed_cb = null;
    this._object_name = object_name;
    const off = _next_offset2++ % 8 * 24;
    this._win = new FloatingWindow(
      `object-editor-${object_name}`,
      `Object: ${object_name}`,
      "icons/object.svg",
      { x: 260 + off, y: 50 + off, w: 560, h: 480 }
    );
    this._win.on_close(() => this._on_closed_cb?.());
    this._data = {
      sprite_name: "",
      parent_name: "",
      visible: true,
      solid: false,
      persistent: false,
      depth: 0,
      physics: false,
      phys_density: 1,
      phys_restitution: 0.1,
      phys_friction: 0.5,
      events: [],
      variables: []
    };
    this._event_list_el = document.createElement("div");
    this._build_ui();
    this._load_data();
    this._win.mount(workspace);
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._on_closed_cb = cb;
  }
  // ── UI ─────────────────────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; overflow:hidden;";
    const left = document.createElement("div");
    left.className = "sw-obj-props-panel";
    left.appendChild(this._build_props());
    body.appendChild(left);
    const right = document.createElement("div");
    right.className = "sw-obj-events-panel";
    right.appendChild(this._build_events_panel());
    body.appendChild(right);
  }
  _build_props() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; gap:6px; padding:8px; overflow-y:auto; height:100%;";
    el.appendChild(_section_header("Sprite"));
    const sprite_row = document.createElement("div");
    sprite_row.style.cssText = "display:flex; gap:4px; align-items:center;";
    const sprite_lbl = document.createElement("span");
    sprite_lbl.style.cssText = "font-size:11px; flex:1; color:var(--sw-text-dim);";
    sprite_lbl.textContent = this._data.sprite_name || "(none)";
    const sprite_btn = document.createElement("button");
    sprite_btn.className = "sw-btn";
    sprite_btn.style.cssText = "font-size:10px; padding:2px 6px;";
    sprite_btn.textContent = "Choose";
    sprite_btn.addEventListener("click", async () => {
      const name = await _input_overlay("Sprite name:", this._data.sprite_name);
      if (name === null) return;
      this._data.sprite_name = name;
      sprite_lbl.textContent = name || "(none)";
      this._save();
    });
    const clear_sprite = document.createElement("button");
    clear_sprite.className = "sw-btn";
    clear_sprite.style.cssText = "font-size:10px; padding:2px 6px;";
    clear_sprite.textContent = "\u2715";
    clear_sprite.title = "Clear sprite";
    clear_sprite.addEventListener("click", () => {
      this._data.sprite_name = "";
      sprite_lbl.textContent = "(none)";
      this._save();
    });
    sprite_row.append(sprite_lbl, sprite_btn, clear_sprite);
    el.appendChild(sprite_row);
    el.appendChild(_section_header("Parent Object"));
    const parent_row = document.createElement("div");
    parent_row.style.cssText = "display:flex; gap:4px; align-items:center;";
    const parent_lbl = document.createElement("span");
    parent_lbl.style.cssText = "font-size:11px; flex:1; color:var(--sw-text-dim);";
    parent_lbl.textContent = this._data.parent_name || "(none)";
    const parent_btn = document.createElement("button");
    parent_btn.className = "sw-btn";
    parent_btn.style.cssText = "font-size:10px; padding:2px 6px;";
    parent_btn.textContent = "Choose";
    parent_btn.addEventListener("click", async () => {
      const name = await _input_overlay("Parent object name:", this._data.parent_name);
      if (name === null) return;
      this._data.parent_name = name;
      parent_lbl.textContent = name || "(none)";
      this._save();
    });
    const clear_parent = document.createElement("button");
    clear_parent.className = "sw-btn";
    clear_parent.style.cssText = "font-size:10px; padding:2px 6px;";
    clear_parent.textContent = "\u2715";
    clear_parent.title = "Clear parent";
    clear_parent.addEventListener("click", () => {
      this._data.parent_name = "";
      parent_lbl.textContent = "(none)";
      this._save();
    });
    parent_row.append(parent_lbl, parent_btn, clear_parent);
    el.appendChild(parent_row);
    el.appendChild(_section_header("Properties"));
    el.append(
      _checkbox_row("Visible", this._data.visible, (v) => {
        this._data.visible = v;
        this._save();
      }),
      _checkbox_row("Solid", this._data.solid, (v) => {
        this._data.solid = v;
        this._save();
      }),
      _checkbox_row("Persistent", this._data.persistent, (v) => {
        this._data.persistent = v;
        this._save();
      })
    );
    el.append(_number_row("Depth:", this._data.depth, (v) => {
      this._data.depth = v;
      this._save();
    }));
    el.appendChild(this._build_variables_section());
    el.appendChild(_section_header("Physics"));
    const phys_toggle = _checkbox_row("Enable Physics", this._data.physics, (v) => {
      this._data.physics = v;
      phys_props.style.display = v ? "" : "none";
      this._save();
    });
    el.appendChild(phys_toggle);
    const phys_props = document.createElement("div");
    phys_props.style.cssText = "display:flex; flex-direction:column; gap:4px; padding-left:12px;";
    phys_props.style.display = this._data.physics ? "" : "none";
    phys_props.append(
      _number_row("Density:", this._data.phys_density, (v) => {
        this._data.phys_density = v;
        this._save();
      }),
      _number_row("Restitution:", this._data.phys_restitution, (v) => {
        this._data.phys_restitution = v;
        this._save();
      }),
      _number_row("Friction:", this._data.phys_friction, (v) => {
        this._data.phys_friction = v;
        this._save();
      })
    );
    el.appendChild(phys_props);
    return el;
  }
  _build_variables_section() {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; gap:4px;";
    wrap.appendChild(_section_header("Variables"));
    this._vars_list_el.style.cssText = "display:flex; flex-direction:column; gap:4px;";
    wrap.appendChild(this._vars_list_el);
    const add = document.createElement("button");
    add.textContent = "+ Add Variable";
    add.style.cssText = "font-size:11px; align-self:flex-start; cursor:pointer; padding:2px 8px;";
    add.addEventListener("click", () => {
      this._data.variables.push({ name: "", value: "0" });
      this._render_variables();
      this._save();
    });
    wrap.appendChild(add);
    this._render_variables();
    return wrap;
  }
  /** Renders the variable definition rows (name = default value, with delete). */
  _render_variables() {
    this._vars_list_el.innerHTML = "";
    this._data.variables.forEach((v, idx) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; gap:4px;";
      const name = document.createElement("input");
      name.className = "sw-input";
      name.placeholder = "name";
      name.value = v.name;
      name.style.cssText = "width:90px; font-size:11px;";
      name.addEventListener("change", () => {
        const clean = name.value.trim().replace(/[^A-Za-z0-9_]/g, "");
        v.name = /^[A-Za-z_]/.test(clean) ? clean : "";
        name.value = v.name;
        this._save();
      });
      const eq = document.createElement("span");
      eq.textContent = "=";
      eq.style.cssText = "color:var(--sw-text-dim);";
      const val = document.createElement("input");
      val.className = "sw-input";
      val.placeholder = "0";
      val.value = v.value;
      val.style.cssText = "flex:1; font-size:11px;";
      val.addEventListener("change", () => {
        v.value = val.value;
        this._save();
      });
      const del = document.createElement("button");
      del.textContent = "\xD7";
      del.title = "Delete variable";
      del.style.cssText = "cursor:pointer; padding:0 6px;";
      del.addEventListener("click", () => {
        this._data.variables.splice(idx, 1);
        this._render_variables();
        this._save();
      });
      row.append(name, eq, val, del);
      this._vars_list_el.appendChild(row);
    });
  }
  _build_events_panel() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; height:100%;";
    const hdr = document.createElement("div");
    hdr.className = "sw-editor-toolbar";
    const hdr_lbl = document.createElement("span");
    hdr_lbl.style.cssText = "font-size:11px; font-weight:600; flex:1;";
    hdr_lbl.textContent = "Events";
    const add_btn = document.createElement("button");
    add_btn.className = "sw-btn";
    add_btn.style.cssText = "font-size:10px; padding:2px 6px;";
    add_btn.textContent = "+ Add Event";
    add_btn.addEventListener("click", () => this._show_add_event_dialog());
    hdr.append(hdr_lbl, add_btn);
    el.appendChild(hdr);
    this._event_list_el.style.cssText = "flex:1; overflow-y:auto;";
    el.appendChild(this._event_list_el);
    return el;
  }
  _rebuild_event_list() {
    this._event_list_el.innerHTML = "";
    if (this._data.events.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;";
      empty.textContent = 'No events.\nClick "+ Add Event".';
      this._event_list_el.appendChild(empty);
      return;
    }
    for (const ev of this._data.events) {
      const row = document.createElement("div");
      row.className = "sw-obj-event-row";
      const lbl = document.createElement("span");
      lbl.textContent = EVENT_LABELS[ev] ?? ev;
      lbl.style.cssText = "flex:1; font-size:11px;";
      const edit_btn = document.createElement("button");
      edit_btn.className = "sw-btn";
      edit_btn.style.cssText = "font-size:10px; padding:2px 6px;";
      edit_btn.textContent = "Edit";
      edit_btn.addEventListener("click", () => this._edit_event_code(ev));
      const del_btn = document.createElement("button");
      del_btn.className = "sw-window-btn close";
      del_btn.style.cssText = "width:16px; height:16px; font-size:9px; flex-shrink:0;";
      del_btn.textContent = "\u2715";
      del_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._data.events = this._data.events.filter((e2) => e2 !== ev);
        this._rebuild_event_list();
        this._save();
      });
      row.append(lbl, edit_btn, del_btn);
      row.addEventListener("dblclick", () => this._edit_event_code(ev));
      this._event_list_el.appendChild(row);
    }
  }
  _show_add_event_dialog() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.5);
            display:flex; align-items:center; justify-content:center; z-index:99999;
        `;
    const dlg = document.createElement("div");
    dlg.style.cssText = `
            background:var(--sw-chrome); border:1px solid var(--sw-border);
            padding:12px; min-width:240px; display:flex; flex-direction:column; gap:8px;
        `;
    const title = document.createElement("div");
    title.style.cssText = "font-weight:600; font-size:12px;";
    title.textContent = "Add Event";
    dlg.appendChild(title);
    for (const group of EVENT_GROUPS) {
      const grp_lbl = document.createElement("div");
      grp_lbl.style.cssText = "font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; margin-top:4px;";
      grp_lbl.textContent = group.label;
      dlg.appendChild(grp_lbl);
      const grp_row = document.createElement("div");
      grp_row.style.cssText = "display:flex; flex-wrap:wrap; gap:3px;";
      for (const ev of group.events) {
        if (this._data.events.includes(ev)) continue;
        const btn = document.createElement("button");
        btn.className = "sw-btn";
        btn.style.cssText = "font-size:10px; padding:2px 6px;";
        btn.textContent = EVENT_LABELS[ev];
        btn.addEventListener("click", () => {
          this._data.events.push(ev);
          this._rebuild_event_list();
          this._save();
          overlay.remove();
        });
        grp_row.appendChild(btn);
      }
      dlg.appendChild(grp_row);
    }
    const cancel = document.createElement("button");
    cancel.className = "sw-btn";
    cancel.textContent = "Cancel";
    cancel.style.cssText = "margin-top:4px; align-self:flex-end;";
    cancel.addEventListener("click", () => overlay.remove());
    dlg.appendChild(cancel);
    overlay.appendChild(dlg);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }
  async _edit_event_code(ev) {
    const rel = `objects/${this._object_name}/${ev}.ts`;
    const workspace = this._win.el.parentElement;
    try {
      await script_editor_open_smart(workspace, rel, async () => {
        const dir = project_get_dir();
        const obj_dir = await (await dir.getDirectoryHandle("objects", { create: true })).getDirectoryHandle(this._object_name, { create: true });
        return obj_dir.getFileHandle(`${ev}.ts`, { create: true });
      });
    } catch (err) {
      console.error("[IDE] Failed to open event code:", err);
    }
  }
  // ── Persistence ────────────────────────────────────────────────────────
  async _load_data() {
    try {
      const json = await project_read_file(`objects/${this._object_name}/object.json`);
      const loaded = JSON.parse(json);
      Object.assign(this._data, loaded);
    } catch {
    }
    this._rebuild_event_list();
    this._render_variables();
  }
  _save() {
    project_write_file(
      `objects/${this._object_name}/object.json`,
      JSON.stringify(this._data, null, 2)
    ).catch(() => {
    });
  }
};
function _input_overlay(msg, def) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:300px;font-family:sans-serif;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:10px;";
    box.innerHTML = `<p style="margin:0;">${msg.replace(/</g, "&lt;")}</p>`;
    const inp = document.createElement("input");
    inp.value = def;
    inp.style.cssText = "padding:5px 8px;background:#3c3c3c;border:1px solid #555;color:#ddd;font-size:13px;border-radius:3px;outline:none;";
    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";
    const ok_btn = document.createElement("button");
    ok_btn.textContent = "OK";
    ok_btn.style.cssText = "padding:4px 20px;cursor:pointer;";
    const cancel_btn = document.createElement("button");
    cancel_btn.textContent = "Cancel";
    cancel_btn.style.cssText = "padding:4px 20px;cursor:pointer;";
    btns.append(ok_btn, cancel_btn);
    box.append(inp, btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const ok = () => {
      overlay.remove();
      resolve(inp.value);
    };
    const cancel = () => {
      overlay.remove();
      resolve(null);
    };
    ok_btn.addEventListener("click", ok);
    cancel_btn.addEventListener("click", cancel);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ok();
      if (e.key === "Escape") cancel();
    });
    setTimeout(() => {
      inp.focus();
      inp.select();
    }, 10);
  });
}
function _section_header(text) {
  const el = document.createElement("div");
  el.style.cssText = "font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px;";
  el.textContent = text;
  return el;
}
function _checkbox_row(label, initial, on_change) {
  const row = document.createElement("label");
  row.style.cssText = "display:flex; align-items:center; gap:6px; cursor:pointer; font-size:11px;";
  const inp = document.createElement("input");
  inp.type = "checkbox";
  inp.className = "sw-checkbox";
  inp.checked = initial;
  inp.addEventListener("change", () => on_change(inp.checked));
  const lbl = document.createElement("span");
  lbl.textContent = label;
  row.append(inp, lbl);
  return row;
}
function _number_row(label, initial, on_change) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:6px;";
  const lbl = document.createElement("span");
  lbl.className = "sw-label";
  lbl.style.cssText += "min-width:80px; margin:0;";
  lbl.textContent = label;
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "sw-input";
  inp.style.cssText = "width:70px;";
  inp.valueAsNumber = initial;
  inp.step = "0.01";
  inp.addEventListener("change", () => on_change(inp.valueAsNumber || 0));
  row.append(lbl, inp);
  return row;
}

// packages/ide/src/editors/room_editor.ts
var _open_editors4 = /* @__PURE__ */ new Map();
function room_editor_open(workspace, room_name) {
  const existing = _open_editors4.get(room_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new room_editor_window(workspace, room_name);
  _open_editors4.set(room_name, ed);
  ed.on_closed(() => _open_editors4.delete(room_name));
}
var _next_offset3 = 0;
var _next_inst_id = 1;
var GRID = 16;
var MIN_ZOOM = 0.125;
var MAX_ZOOM = 8;
var room_editor_window = class {
  constructor(workspace, room_name) {
    this._zoom = 1;
    this._pan_x = 0;
    this._pan_y = 0;
    // Tool state
    this._tool = "place";
    this._place_object = "";
    this._selected_inst = null;
    // Drag state
    this._drag_inst = null;
    this._drag_ox = 0;
    this._drag_oy = 0;
    // Pan state
    this._panning = false;
    this._pan_start = { mx: 0, my: 0, px: 0, py: 0 };
    this._snap_grid = GRID;
    this._show_grid = true;
    this._panel_tab = "instances";
    this._panel_el = document.createElement("div");
    this._on_closed_cb = null;
    this._room_name = room_name;
    const off = _next_offset3++ % 6 * 24;
    this._win = new FloatingWindow(
      `room-editor-${room_name}`,
      `Room: ${room_name}`,
      "icons/room.svg",
      { x: 280 + off, y: 44 + off, w: 900, h: 580 }
    );
    this._win.on_close(() => this._on_closed_cb?.());
    this._data = _default_room();
    this._canvas = document.createElement("canvas");
    this._ctx = this._canvas.getContext("2d");
    this._build_ui();
    this._load_data();
    this._win.mount(workspace);
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._on_closed_cb = cb;
  }
  // ── UI ─────────────────────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; flex-direction:column; overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.className = "sw-editor-toolbar";
    const tool_select = _tool_btn2("Select", "select", () => this._set_tool("select"));
    const tool_place = _tool_btn2("Place", "place", () => this._set_tool("place"));
    const tool_delete = _tool_btn2("Delete", "delete", () => this._set_tool("delete"));
    const tool_btns = [tool_select, tool_place, tool_delete];
    tool_btns.forEach((b) => toolbar.appendChild(b));
    this._highlight_tool(tool_btns);
    const sep = document.createElement("div");
    sep.style.cssText = "width:1px; background:var(--sw-border); margin:0 4px;";
    toolbar.appendChild(sep);
    const place_label = document.createElement("span");
    place_label.style.cssText = "font-size:11px; color:var(--sw-text-dim);";
    place_label.textContent = "Object:";
    const place_inp = document.createElement("input");
    place_inp.type = "text";
    place_inp.className = "sw-input";
    place_inp.style.cssText = "width:100px;";
    place_inp.placeholder = "obj_name";
    place_inp.value = this._place_object;
    place_inp.addEventListener("input", () => {
      this._place_object = place_inp.value;
    });
    toolbar.append(place_label, place_inp);
    const sep2 = document.createElement("div");
    sep2.style.cssText = "width:1px; background:var(--sw-border); margin:0 4px;";
    toolbar.appendChild(sep2);
    const grid_toggle = document.createElement("button");
    grid_toggle.className = "sw-btn";
    grid_toggle.textContent = "Grid";
    grid_toggle.title = "Toggle grid";
    grid_toggle.style.cssText = this._show_grid ? "background:var(--sw-accent);" : "";
    grid_toggle.addEventListener("click", () => {
      this._show_grid = !this._show_grid;
      grid_toggle.style.background = this._show_grid ? "var(--sw-accent)" : "";
      this._redraw();
    });
    toolbar.appendChild(grid_toggle);
    const grid_size_inp = document.createElement("input");
    grid_size_inp.type = "number";
    grid_size_inp.className = "sw-input";
    grid_size_inp.style.cssText = "width:48px;";
    grid_size_inp.value = String(this._snap_grid);
    grid_size_inp.min = "1";
    grid_size_inp.addEventListener("change", () => {
      this._snap_grid = Math.max(1, parseInt(grid_size_inp.value) || GRID);
      this._redraw();
    });
    toolbar.append(grid_size_inp);
    const zoom_out = _icon_tool_btn("\u2212", () => this._adjust_zoom(-0.25));
    const zoom_lbl = document.createElement("span");
    zoom_lbl.style.cssText = "font-size:11px; min-width:36px; text-align:center;";
    zoom_lbl.textContent = "100%";
    const zoom_in = _icon_tool_btn("+", () => this._adjust_zoom(0.25));
    toolbar.append(zoom_out, zoom_lbl, zoom_in);
    body.appendChild(toolbar);
    const main = document.createElement("div");
    main.style.cssText = "display:flex; flex:1; overflow:hidden;";
    body.appendChild(main);
    const canvas_wrap = document.createElement("div");
    canvas_wrap.style.cssText = "flex:1; overflow:hidden; position:relative; background:#1a1a1a;";
    this._canvas = document.createElement("canvas");
    this._canvas.style.cssText = "display:block;";
    this._ctx = this._canvas.getContext("2d");
    canvas_wrap.appendChild(this._canvas);
    main.appendChild(canvas_wrap);
    const ro = new ResizeObserver(() => {
      this._canvas.width = canvas_wrap.offsetWidth;
      this._canvas.height = canvas_wrap.offsetHeight;
      this._redraw();
    });
    ro.observe(canvas_wrap);
    this._canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      this._on_wheel(e);
    }, { passive: false });
    this._canvas.addEventListener("mousedown", (e) => this._on_mouse_down(e));
    this._canvas.addEventListener("mousemove", (e) => this._on_mouse_move(e));
    this._canvas.addEventListener("mouseup", (e) => this._on_mouse_up(e));
    this._canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    const right = document.createElement("div");
    right.className = "sw-room-panel";
    right.appendChild(this._build_right_panel());
    main.appendChild(right);
    this._zoom_lbl = zoom_lbl;
    this._tool_btns = tool_btns;
  }
  _build_right_panel() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; height:100%;";
    const tabs_el = document.createElement("div");
    tabs_el.className = "sw-room-tabs";
    const tabs = ["settings", "instances", "views", "backgrounds", "physics"];
    for (const tab of tabs) {
      const btn = document.createElement("button");
      btn.className = `sw-room-tab${tab === this._panel_tab ? " active" : ""}`;
      btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
      btn.addEventListener("click", () => {
        this._panel_tab = tab;
        tabs_el.querySelectorAll(".sw-room-tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this._panel_el.innerHTML = "";
        this._panel_el.appendChild(this._build_panel_content());
      });
      tabs_el.appendChild(btn);
    }
    el.appendChild(tabs_el);
    this._panel_el.style.cssText = "flex:1; overflow-y:auto;";
    this._panel_el.appendChild(this._build_panel_content());
    el.appendChild(this._panel_el);
    return el;
  }
  _build_panel_content() {
    switch (this._panel_tab) {
      case "settings":
        return this._panel_settings();
      case "instances":
        return this._panel_instances();
      case "views":
        return this._panel_views();
      case "backgrounds":
        return this._panel_backgrounds();
      case "physics":
        return this._panel_physics();
      default:
        return _form_container();
    }
  }
  _panel_settings() {
    const el = _form_container();
    el.append(
      _num_field("Width:", this._data.width, (v) => {
        this._data.width = v;
        this._redraw();
        this._save();
      }),
      _num_field("Height:", this._data.height, (v) => {
        this._data.height = v;
        this._redraw();
        this._save();
      }),
      _num_field("Room Speed:", this._data.room_speed, (v) => {
        this._data.room_speed = v;
        this._save();
      }),
      _check_field("Persistent", this._data.persistent, (v) => {
        this._data.persistent = v;
        this._save();
      })
    );
    const cc_lbl = _section_hdr("Creation Code");
    const cc_area = document.createElement("textarea");
    cc_area.className = "sw-input";
    cc_area.style.cssText = "width:100%; height:80px; font-family:monospace; font-size:11px; resize:vertical;";
    cc_area.value = this._data.creation_code;
    cc_area.addEventListener("change", () => {
      this._data.creation_code = cc_area.value;
      this._save();
    });
    el.append(cc_lbl, cc_area);
    return el;
  }
  _panel_instances() {
    const el = _form_container();
    if (this._data.instances.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;";
      empty.textContent = 'No instances.\nUse "Place" tool on the canvas.';
      el.appendChild(empty);
      return el;
    }
    for (const inst of this._data.instances) {
      const row = document.createElement("div");
      row.className = `sw-room-inst-row${inst === this._selected_inst ? " selected" : ""}`;
      const lbl = document.createElement("span");
      lbl.style.cssText = "flex:1; font-size:11px;";
      lbl.textContent = `${inst.object_name} (${inst.x}, ${inst.y})`;
      const del_btn = document.createElement("button");
      del_btn.className = "sw-window-btn close";
      del_btn.style.cssText = "width:16px; height:16px; font-size:9px;";
      del_btn.textContent = "\u2715";
      del_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._delete_instance(inst);
      });
      row.append(lbl, del_btn);
      row.addEventListener("click", () => {
        this._selected_inst = inst;
        this._rebuild_instances_panel();
        this._redraw();
      });
      el.appendChild(row);
    }
    return el;
  }
  _rebuild_instances_panel() {
    if (this._panel_tab !== "instances") return;
    this._panel_el.innerHTML = "";
    this._panel_el.appendChild(this._panel_instances());
  }
  _panel_views() {
    const el = _form_container();
    el.appendChild(_section_hdr(`Views (${this._data.views.length})`));
    const add_btn = document.createElement("button");
    add_btn.className = "sw-btn";
    add_btn.style.cssText = "font-size:10px; margin-bottom:4px;";
    add_btn.textContent = "+ Add View";
    add_btn.addEventListener("click", () => {
      this._data.views.push(_default_view());
      this._panel_el.innerHTML = "";
      this._panel_el.appendChild(this._panel_views());
      this._save();
    });
    el.appendChild(add_btn);
    this._data.views.forEach((view, i) => {
      const vw = document.createElement("details");
      vw.style.cssText = "border:1px solid var(--sw-border2); padding:4px; margin-bottom:4px;";
      const summary = document.createElement("summary");
      summary.style.cssText = "font-size:11px; cursor:pointer;";
      summary.textContent = `View ${i}${view.enabled ? "" : " (disabled)"}`;
      vw.appendChild(summary);
      vw.append(
        _check_field("Enabled", view.enabled, (v) => {
          view.enabled = v;
          summary.textContent = `View ${i}${v ? "" : " (disabled)"}`;
          this._save();
        }),
        _num_field("View X:", view.view_x, (v) => {
          view.view_x = v;
          this._save();
        }),
        _num_field("View Y:", view.view_y, (v) => {
          view.view_y = v;
          this._save();
        }),
        _num_field("View W:", view.view_w, (v) => {
          view.view_w = v;
          this._save();
        }),
        _num_field("View H:", view.view_h, (v) => {
          view.view_h = v;
          this._save();
        }),
        _num_field("Port X:", view.port_x, (v) => {
          view.port_x = v;
          this._save();
        }),
        _num_field("Port Y:", view.port_y, (v) => {
          view.port_y = v;
          this._save();
        }),
        _num_field("Port W:", view.port_w, (v) => {
          view.port_w = v;
          this._save();
        }),
        _num_field("Port H:", view.port_h, (v) => {
          view.port_h = v;
          this._save();
        })
      );
      const follow_row = _text_field("Follow:", view.follow, (v) => {
        view.follow = v;
        this._save();
      });
      vw.appendChild(follow_row);
      const del_btn = document.createElement("button");
      del_btn.className = "sw-btn";
      del_btn.style.cssText = "font-size:10px; margin-top:4px;";
      del_btn.textContent = "Remove View";
      del_btn.addEventListener("click", () => {
        this._data.views.splice(i, 1);
        this._panel_el.innerHTML = "";
        this._panel_el.appendChild(this._panel_views());
        this._save();
      });
      vw.appendChild(del_btn);
      el.appendChild(vw);
    });
    return el;
  }
  _panel_backgrounds() {
    const el = _form_container();
    el.appendChild(_section_hdr(`Background Layers (${this._data.backgrounds.length})`));
    const add_btn = document.createElement("button");
    add_btn.className = "sw-btn";
    add_btn.style.cssText = "font-size:10px; margin-bottom:4px;";
    add_btn.textContent = "+ Add Layer";
    add_btn.addEventListener("click", () => {
      this._data.backgrounds.push(_default_bg_layer());
      this._panel_el.innerHTML = "";
      this._panel_el.appendChild(this._panel_backgrounds());
      this._save();
    });
    el.appendChild(add_btn);
    this._data.backgrounds.forEach((layer, i) => {
      const bg = document.createElement("details");
      bg.style.cssText = "border:1px solid var(--sw-border2); padding:4px; margin-bottom:4px;";
      const summary = document.createElement("summary");
      summary.style.cssText = "font-size:11px; cursor:pointer;";
      summary.textContent = `BG ${i}: ${layer.bg_name || "(none)"}`;
      bg.appendChild(summary);
      bg.append(
        _check_field("Enabled", layer.enabled, (v) => {
          layer.enabled = v;
          this._save();
        }),
        _text_field("Resource:", layer.bg_name, (v) => {
          layer.bg_name = v;
          summary.textContent = `BG ${i}: ${v || "(none)"}`;
          this._save();
        }),
        _check_field("Tile X", layer.tile_x, (v) => {
          layer.tile_x = v;
          this._save();
        }),
        _check_field("Tile Y", layer.tile_y, (v) => {
          layer.tile_y = v;
          this._save();
        }),
        _check_field("Stretch", layer.stretch, (v) => {
          layer.stretch = v;
          this._save();
        })
      );
      const del_btn = document.createElement("button");
      del_btn.className = "sw-btn";
      del_btn.style.cssText = "font-size:10px; margin-top:4px;";
      del_btn.textContent = "Remove Layer";
      del_btn.addEventListener("click", () => {
        this._data.backgrounds.splice(i, 1);
        this._panel_el.innerHTML = "";
        this._panel_el.appendChild(this._panel_backgrounds());
        this._save();
      });
      bg.appendChild(del_btn);
      el.appendChild(bg);
    });
    return el;
  }
  _panel_physics() {
    const el = _form_container();
    el.append(
      _check_field("Enable Physics World", this._data.physics_world, (v) => {
        this._data.physics_world = v;
        this._save();
      }),
      _num_field("Gravity X:", this._data.physics_gravity_x, (v) => {
        this._data.physics_gravity_x = v;
        this._save();
      }),
      _num_field("Gravity Y:", this._data.physics_gravity_y, (v) => {
        this._data.physics_gravity_y = v;
        this._save();
      })
    );
    return el;
  }
  // ── Tool management ────────────────────────────────────────────────────
  _set_tool(mode) {
    this._tool = mode;
    this._selected_inst = null;
    this._highlight_tool(this._tool_btns ?? []);
    this._redraw();
  }
  _highlight_tool(btns) {
    btns.forEach((b) => {
      const is_active = b.dataset["tool"] === this._tool;
      b.style.background = is_active ? "var(--sw-accent)" : "";
    });
  }
  _adjust_zoom(delta) {
    this._zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this._zoom + delta));
    const lbl = this._zoom_lbl;
    if (lbl) lbl.textContent = Math.round(this._zoom * 100) + "%";
    this._redraw();
  }
  // ── Canvas events ──────────────────────────────────────────────────────
  _on_wheel(e) {
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    this._adjust_zoom(delta);
  }
  _on_mouse_down(e) {
    const { rx, ry } = this._to_room_coords(e.clientX, e.clientY);
    const sx = this._snap(rx);
    const sy = this._snap(ry);
    if (e.button === 1 || e.button === 0 && e.altKey) {
      this._panning = true;
      this._pan_start = { mx: e.clientX, my: e.clientY, px: this._pan_x, py: this._pan_y };
      return;
    }
    if (e.button === 0) {
      switch (this._tool) {
        case "place":
          if (!this._place_object) return;
          this._place_instance(sx, sy);
          break;
        case "delete": {
          const hit = this._hit_test(rx, ry);
          if (hit) this._delete_instance(hit);
          break;
        }
        case "select": {
          const hit = this._hit_test(rx, ry);
          if (hit) {
            this._selected_inst = hit;
            this._drag_inst = hit;
            this._drag_ox = rx - hit.x;
            this._drag_oy = ry - hit.y;
          } else {
            this._selected_inst = null;
            this._drag_inst = null;
          }
          this._rebuild_instances_panel();
          this._redraw();
          break;
        }
      }
    }
    if (e.button === 2 && this._tool === "select") {
      const hit = this._hit_test(rx, ry);
      if (hit) this._delete_instance(hit);
    }
  }
  _on_mouse_move(e) {
    if (this._panning) {
      this._pan_x = this._pan_start.px + (e.clientX - this._pan_start.mx);
      this._pan_y = this._pan_start.py + (e.clientY - this._pan_start.my);
      this._redraw();
      return;
    }
    if (this._drag_inst) {
      const { rx, ry } = this._to_room_coords(e.clientX, e.clientY);
      this._drag_inst.x = this._snap(rx - this._drag_ox);
      this._drag_inst.y = this._snap(ry - this._drag_oy);
      this._rebuild_instances_panel();
      this._redraw();
    }
  }
  _on_mouse_up(e) {
    if (this._panning) {
      this._panning = false;
      return;
    }
    if (this._drag_inst) {
      this._drag_inst = null;
      this._save();
      return;
    }
    if (e.button === 0 && this._tool === "place") this._save();
  }
  // ── Instance helpers ───────────────────────────────────────────────────
  _place_instance(x, y) {
    const inst = {
      id: _next_inst_id++,
      object_name: this._place_object,
      x,
      y,
      scale_x: 1,
      scale_y: 1,
      rotation: 0,
      creation_code: ""
    };
    this._data.instances.push(inst);
    this._selected_inst = inst;
    this._rebuild_instances_panel();
    this._redraw();
  }
  _delete_instance(inst) {
    const idx = this._data.instances.indexOf(inst);
    if (idx !== -1) this._data.instances.splice(idx, 1);
    if (this._selected_inst === inst) this._selected_inst = null;
    this._rebuild_instances_panel();
    this._redraw();
    this._save();
  }
  _hit_test(rx, ry) {
    for (let i = this._data.instances.length - 1; i >= 0; i--) {
      const inst = this._data.instances[i];
      const hw = 16;
      const hh = 16;
      if (rx >= inst.x - hw && rx <= inst.x + hw && ry >= inst.y - hh && ry <= inst.y + hh) {
        return inst;
      }
    }
    return null;
  }
  _snap(v) {
    if (this._snap_grid <= 0) return v;
    return Math.round(v / this._snap_grid) * this._snap_grid;
  }
  _to_room_coords(client_x, client_y) {
    const rect = this._canvas.getBoundingClientRect();
    const cx = client_x - rect.left;
    const cy = client_y - rect.top;
    const rx = (cx - this._pan_x) / this._zoom;
    const ry = (cy - this._pan_y) / this._zoom;
    return { rx, ry };
  }
  // ── Rendering ──────────────────────────────────────────────────────────
  _redraw() {
    const ctx = this._ctx;
    const cw = this._canvas.width;
    const ch = this._canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(this._pan_x, this._pan_y);
    ctx.scale(this._zoom, this._zoom);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, this._data.width, this._data.height);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1 / this._zoom;
    ctx.strokeRect(0, 0, this._data.width, this._data.height);
    if (this._show_grid && this._snap_grid > 0) {
      this._draw_grid(ctx);
    }
    for (const inst of this._data.instances) {
      this._draw_instance(ctx, inst);
    }
    for (const view of this._data.views) {
      if (!view.enabled) continue;
      ctx.save();
      ctx.strokeStyle = "rgba(0,200,255,0.4)";
      ctx.lineWidth = 1 / this._zoom;
      ctx.setLineDash([4 / this._zoom, 2 / this._zoom]);
      ctx.strokeRect(view.view_x, view.view_y, view.view_w, view.view_h);
      ctx.restore();
    }
    ctx.restore();
  }
  _draw_grid(ctx) {
    const g = this._snap_grid;
    const rw = this._data.width;
    const rh = this._data.height;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1 / this._zoom;
    for (let x = 0; x <= rw; x += g) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rh);
      ctx.stroke();
    }
    for (let y = 0; y <= rh; y += g) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rw, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  _draw_instance(ctx, inst) {
    const is_sel = inst === this._selected_inst;
    const hw = 16;
    const hh = 16;
    ctx.save();
    ctx.fillStyle = is_sel ? "rgba(0,120,212,0.6)" : "rgba(80,80,200,0.4)";
    ctx.strokeStyle = is_sel ? "#0078d4" : "#6666cc";
    ctx.lineWidth = (is_sel ? 2 : 1) / this._zoom;
    ctx.fillRect(inst.x - hw, inst.y - hh, hw * 2, hh * 2);
    ctx.strokeRect(inst.x - hw, inst.y - hh, hw * 2, hh * 2);
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.max(8, 10 / this._zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const short = inst.object_name.length > 8 ? inst.object_name.slice(0, 7) + "\u2026" : inst.object_name;
    ctx.fillText(short, inst.x, inst.y);
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(inst.x, inst.y, 2 / this._zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // ── Persistence ────────────────────────────────────────────────────────
  async _load_data() {
    try {
      const json = await project_read_file(`rooms/${this._room_name}/room.json`);
      const loaded = JSON.parse(json);
      Object.assign(this._data, loaded);
      const max_id = this._data.instances.reduce((m, i) => Math.max(m, i.id), 0);
      if (max_id >= _next_inst_id) _next_inst_id = max_id + 1;
    } catch {
    }
    this._redraw();
    this._rebuild_instances_panel();
  }
  _save() {
    project_write_file(
      `rooms/${this._room_name}/room.json`,
      JSON.stringify(this._data, null, 2)
    ).catch(() => {
    });
  }
};
function _default_room() {
  return {
    width: 640,
    height: 480,
    room_speed: 60,
    persistent: false,
    creation_code: "",
    instances: [],
    backgrounds: [],
    views: [],
    physics_world: false,
    physics_gravity_x: 0,
    physics_gravity_y: 10
  };
}
function _default_view() {
  return { enabled: true, view_x: 0, view_y: 0, view_w: 640, view_h: 480, port_x: 0, port_y: 0, port_w: 640, port_h: 480, follow: "" };
}
function _default_bg_layer() {
  return { enabled: true, bg_name: "", tile_x: false, tile_y: false, stretch: false, visible_in_editor: true };
}
function _tool_btn2(label, tool, cb) {
  const btn = document.createElement("button");
  btn.className = "sw-btn";
  btn.textContent = label;
  btn.dataset["tool"] = tool;
  btn.addEventListener("click", cb);
  return btn;
}
function _icon_tool_btn(label, cb) {
  const btn = document.createElement("button");
  btn.className = "sw-btn";
  btn.textContent = label;
  btn.style.cssText = "padding:2px 8px;";
  btn.addEventListener("click", cb);
  return btn;
}
function _form_container() {
  const el = document.createElement("div");
  el.style.cssText = "display:flex; flex-direction:column; gap:5px; padding:8px;";
  return el;
}
function _section_hdr(text) {
  const el = document.createElement("div");
  el.style.cssText = "font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px;";
  el.textContent = text;
  return el;
}
function _num_field(label, initial, on_change) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:6px;";
  const lbl = document.createElement("span");
  lbl.className = "sw-label";
  lbl.style.cssText += "min-width:80px; margin:0;";
  lbl.textContent = label;
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "sw-input";
  inp.style.cssText = "width:70px;";
  inp.valueAsNumber = initial;
  inp.addEventListener("change", () => on_change(inp.valueAsNumber || 0));
  row.append(lbl, inp);
  return row;
}
function _check_field(label, initial, on_change) {
  const row = document.createElement("label");
  row.style.cssText = "display:flex; align-items:center; gap:6px; cursor:pointer; font-size:11px;";
  const inp = document.createElement("input");
  inp.type = "checkbox";
  inp.className = "sw-checkbox";
  inp.checked = initial;
  inp.addEventListener("change", () => on_change(inp.checked));
  const lbl = document.createElement("span");
  lbl.textContent = label;
  row.append(inp, lbl);
  return row;
}
function _text_field(label, initial, on_change) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:6px;";
  const lbl = document.createElement("span");
  lbl.className = "sw-label";
  lbl.style.cssText += "min-width:60px; margin:0;";
  lbl.textContent = label;
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "sw-input";
  inp.value = initial;
  inp.addEventListener("change", () => on_change(inp.value));
  row.append(lbl, inp);
  return row;
}

// packages/ide/src/editors/sound_editor.ts
var _open_editors5 = /* @__PURE__ */ new Map();
function sound_editor_open(workspace, sound_name) {
  const existing = _open_editors5.get(sound_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new sound_editor_window(workspace, sound_name);
  _open_editors5.set(sound_name, ed);
  ed.on_closed(() => _open_editors5.delete(sound_name));
}
var sound_editor_window = class {
  constructor(workspace, name) {
    this._audio_ctx = null;
    this._source = null;
    this._audio_buf = null;
    this._blob_url = "";
    this._name = name;
    this._data = {
      kind: "normal",
      file_name: "",
      volume: 1,
      pitch: 1,
      preload: true,
      streaming: false
    };
    this._win = new FloatingWindow(
      `snd-${name}`,
      `Sound: ${name}`,
      "icons/sound.svg",
      { x: 220, y: 80, w: 420, h: 320 }
    );
    this._build_ui();
    this._win.mount(workspace);
    this._load_data();
  }
  /** Bring the window to front. */
  bring_to_front() {
    this._win.bring_to_front();
  }
  /** Register a callback for when this editor is closed. */
  on_closed(cb) {
    this._win.on_close(cb);
  }
  // -----------------------------------------------------------------------
  // Build UI
  // -----------------------------------------------------------------------
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex;flex-direction:column;gap:0;overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.className = "sw-editor-toolbar";
    const import_btn = this._make_btn("Import Sound\u2026", () => this._import_audio());
    const play_btn = document.createElement("button");
    play_btn.className = "sw-btn";
    play_btn.textContent = "\u25B6 Play";
    play_btn.addEventListener("click", () => this._play_preview());
    this._play_btn = play_btn;
    const stop_btn = document.createElement("button");
    stop_btn.className = "sw-btn";
    stop_btn.textContent = "\u25A0 Stop";
    stop_btn.addEventListener("click", () => this._stop_preview());
    this._stop_btn = stop_btn;
    toolbar.append(import_btn, play_btn, stop_btn);
    body.appendChild(toolbar);
    const status = document.createElement("div");
    status.className = "sw-snd-status";
    status.textContent = "No file imported.";
    this._status_el = status;
    body.appendChild(status);
    const form = document.createElement("div");
    form.className = "sw-snd-form";
    form.appendChild(this._make_field("Kind", this._make_select(
      ["normal", "background", "3d", "positional"],
      this._data.kind,
      (v) => {
        this._data.kind = v;
        this._save();
      }
    )));
    form.appendChild(this._make_field("Volume", this._make_range(
      0,
      1,
      0.01,
      this._data.volume,
      (v) => {
        this._data.volume = v;
        this._save();
      }
    )));
    form.appendChild(this._make_field("Pitch", this._make_range(
      0.5,
      2,
      0.01,
      this._data.pitch,
      (v) => {
        this._data.pitch = v;
        this._save();
      }
    )));
    form.appendChild(this._make_checkbox(
      "Preload",
      this._data.preload,
      (v) => {
        this._data.preload = v;
        this._save();
      }
    ));
    form.appendChild(this._make_checkbox(
      "Streaming",
      this._data.streaming,
      (v) => {
        this._data.streaming = v;
        this._save();
      }
    ));
    body.appendChild(form);
  }
  // -----------------------------------------------------------------------
  // Helpers — form widgets
  // -----------------------------------------------------------------------
  _make_btn(label, cb) {
    const b = document.createElement("button");
    b.className = "sw-btn";
    b.textContent = label;
    b.addEventListener("click", cb);
    return b;
  }
  _make_field(label, control) {
    const row = document.createElement("div");
    row.className = "sw-snd-row";
    const lbl = document.createElement("label");
    lbl.className = "sw-label";
    lbl.textContent = label;
    row.append(lbl, control);
    return row;
  }
  _make_select(options, current, cb) {
    const sel = document.createElement("select");
    sel.className = "sw-select";
    for (const opt of options) {
      const o = document.createElement("option");
      o.value = o.textContent = opt;
      if (opt === current) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener("change", () => cb(sel.value));
    return sel;
  }
  _make_range(min, max, step, val, cb) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;align-items:center;gap:6px;";
    const inp = document.createElement("input");
    inp.type = "range";
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.value = String(val);
    inp.style.flex = "1";
    const num = document.createElement("span");
    num.style.cssText = "min-width:36px;text-align:right;font-size:11px;color:var(--sw-text-dim);";
    num.textContent = String(val);
    inp.addEventListener("input", () => {
      const v = parseFloat(inp.value);
      num.textContent = String(v);
      cb(v);
    });
    wrap.append(inp, num);
    return wrap;
  }
  _make_checkbox(label, checked, cb) {
    const row = document.createElement("div");
    row.className = "sw-snd-row";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;align-items:center;gap:6px;cursor:pointer;";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "sw-checkbox";
    chk.checked = checked;
    chk.addEventListener("change", () => cb(chk.checked));
    lbl.append(chk, document.createTextNode(label));
    row.appendChild(lbl);
    return row;
  }
  // -----------------------------------------------------------------------
  // Import audio
  // -----------------------------------------------------------------------
  _import_audio() {
    if (!project_has_folder()) {
      alert("Open a project folder first (File \u2192 Open\u2026).");
      return;
    }
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "audio/*";
    inp.addEventListener("change", async () => {
      const file = inp.files?.[0];
      if (!file) return;
      const ext = file.name.split(".").pop() ?? "ogg";
      const fname = `${this._name}.${ext}`;
      const arr = await file.arrayBuffer();
      const uint8 = new Uint8Array(arr);
      await project_write_binary(`sounds/${this._name}/${fname}`, uint8);
      this._data.file_name = fname;
      this._status_el.textContent = `File: ${fname} (${(arr.byteLength / 1024).toFixed(1)} KB)`;
      this._audio_ctx ??= new AudioContext();
      this._audio_buf = await this._audio_ctx.decodeAudioData(arr.slice(0));
      if (this._blob_url) URL.revokeObjectURL(this._blob_url);
      this._blob_url = URL.createObjectURL(new Blob([uint8], { type: file.type }));
      this._save();
    });
    inp.click();
  }
  // -----------------------------------------------------------------------
  // Preview playback
  // -----------------------------------------------------------------------
  _play_preview() {
    if (!this._audio_buf) return;
    this._stop_preview();
    this._audio_ctx ??= new AudioContext();
    const src = this._audio_ctx.createBufferSource();
    src.buffer = this._audio_buf;
    src.playbackRate.value = this._data.pitch;
    const gain = this._audio_ctx.createGain();
    gain.gain.value = this._data.volume;
    src.connect(gain).connect(this._audio_ctx.destination);
    src.start();
    this._source = src;
  }
  _stop_preview() {
    try {
      this._source?.stop();
    } catch {
    }
    this._source = null;
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  async _load_data() {
    try {
      const raw = await project_read_file(`sounds/${this._name}/meta.json`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.assign(this._data, parsed);
      if (this._data.file_name) {
        this._status_el.textContent = `File: ${this._data.file_name} (saved)`;
      }
      this._win.body.innerHTML = "";
      this._build_ui();
    } catch {
    }
  }
  async _save() {
    if (!project_has_folder()) return;
    await project_write_file(
      `sounds/${this._name}/meta.json`,
      JSON.stringify(this._data, null, 2)
    );
  }
};

// packages/ide/src/editors/background_editor.ts
var _open_editors6 = /* @__PURE__ */ new Map();
function background_editor_open(workspace, bg_name) {
  const existing = _open_editors6.get(bg_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new background_editor_window(workspace, bg_name);
  _open_editors6.set(bg_name, ed);
  ed.on_closed(() => _open_editors6.delete(bg_name));
}
var background_editor_window = class {
  constructor(workspace, name) {
    this._name = name;
    this._data = {
      file_name: "",
      width: 0,
      height: 0,
      tile_h: false,
      tile_v: false,
      smooth: false,
      preload: true
    };
    this._win = new FloatingWindow(
      `bg-${name}`,
      `Background: ${name}`,
      "icons/background.svg",
      { x: 230, y: 90, w: 540, h: 400 }
    );
    this._build_ui();
    this._win.mount(workspace);
    this._load_data();
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._win.on_close(cb);
  }
  // -----------------------------------------------------------------------
  // Build UI
  // -----------------------------------------------------------------------
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.className = "sw-editor-toolbar";
    toolbar.appendChild(this._make_btn("Create Image\u2026", () => this._create_image()));
    toolbar.appendChild(this._make_btn("Import Image\u2026", () => this._import_image()));
    if (this._data.file_name) {
      toolbar.appendChild(this._make_btn("Edit", () => this._edit_image()));
    }
    body.appendChild(toolbar);
    const layout = document.createElement("div");
    layout.style.cssText = "display:flex;flex:1;overflow:hidden;";
    const preview = document.createElement("div");
    preview.className = "sw-bg-preview";
    const canvas = document.createElement("canvas");
    canvas.className = "sw-sprite-canvas";
    canvas.width = 1;
    canvas.height = 1;
    this._canvas = canvas;
    preview.appendChild(canvas);
    layout.appendChild(preview);
    const props = document.createElement("div");
    props.className = "sw-bg-props";
    props.appendChild(this._make_info_section());
    props.appendChild(this._make_props_section());
    layout.appendChild(props);
    body.appendChild(layout);
  }
  _make_info_section() {
    const sec = document.createElement("div");
    sec.className = "sw-bg-section";
    const title = document.createElement("div");
    title.className = "sw-bg-section-title";
    title.textContent = "Image Info";
    sec.appendChild(title);
    const row = document.createElement("div");
    row.id = `bg-info-${this._name}`;
    row.style.cssText = "padding:4px 6px;font-size:11px;color:var(--sw-text-dim);";
    row.textContent = "No image imported.";
    sec.appendChild(row);
    return sec;
  }
  _make_props_section() {
    const sec = document.createElement("div");
    sec.className = "sw-bg-section";
    const title = document.createElement("div");
    title.className = "sw-bg-section-title";
    title.textContent = "Properties";
    sec.appendChild(title);
    sec.appendChild(this._make_checkbox(
      "Tile Horizontally",
      this._data.tile_h,
      (v) => {
        this._data.tile_h = v;
        this._save();
      }
    ));
    sec.appendChild(this._make_checkbox(
      "Tile Vertically",
      this._data.tile_v,
      (v) => {
        this._data.tile_v = v;
        this._save();
      }
    ));
    sec.appendChild(this._make_checkbox(
      "Smooth",
      this._data.smooth,
      (v) => {
        this._data.smooth = v;
        this._save();
      }
    ));
    sec.appendChild(this._make_checkbox(
      "Preload",
      this._data.preload,
      (v) => {
        this._data.preload = v;
        this._save();
      }
    ));
    return sec;
  }
  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  _make_btn(label, cb) {
    const b = document.createElement("button");
    b.className = "sw-btn";
    b.textContent = label;
    b.addEventListener("click", cb);
    return b;
  }
  _make_checkbox(label, checked, cb) {
    const row = document.createElement("div");
    row.className = "sw-bg-prop-row";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;align-items:center;gap:6px;cursor:pointer;";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "sw-checkbox";
    chk.checked = checked;
    chk.addEventListener("change", () => cb(chk.checked));
    lbl.append(chk, document.createTextNode(label));
    row.appendChild(lbl);
    return row;
  }
  _update_info() {
    const el = document.getElementById(`bg-info-${this._name}`);
    if (el) el.textContent = this._data.file_name ? `${this._data.file_name}  ${this._data.width}\xD7${this._data.height}px` : "No image imported.";
  }
  _draw_image(data_url) {
    const img = new Image();
    img.onload = () => {
      this._canvas.width = img.naturalWidth;
      this._canvas.height = img.naturalHeight;
      const ctx = this._canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
    };
    img.src = data_url;
  }
  // -----------------------------------------------------------------------
  // Create & Edit
  // -----------------------------------------------------------------------
  async _create_image() {
    if (!project_has_folder()) {
      await show_alert("Open a project folder first (File \u2192 Open\u2026).");
      return;
    }
    const w = await show_prompt("Image width (pixels):", "256");
    if (!w) return;
    const h = await show_prompt("Image height (pixels):", "256");
    if (!h) return;
    const width = Math.max(1, parseInt(w) || 256);
    const height = Math.max(1, parseInt(h) || 256);
    let workspace = this._win.el.parentElement;
    if (!workspace) {
      console.error("[Background Editor] No parent element found for pixel editor");
      await show_alert("Error: Could not open pixel editor");
      return;
    }
    pixel_editor_open(
      workspace,
      width,
      height,
      null,
      (data_url) => this._save_created_image(data_url, width, height)
    );
  }
  async _edit_image() {
    if (!project_has_folder()) {
      await show_alert("Open a project folder first (File \u2192 Open\u2026).");
      return;
    }
    if (!this._data.file_name) return;
    let workspace = this._win.el.parentElement;
    if (!workspace) {
      console.error("[Background Editor] No parent element found for pixel editor");
      await show_alert("Error: Could not open pixel editor");
      return;
    }
    try {
      const img_url = await this._load_binary_url(`backgrounds/${this._name}/${this._data.file_name}`);
      pixel_editor_open(
        workspace,
        this._data.width,
        this._data.height,
        img_url,
        (data_url) => this._save_edited_image(data_url)
      );
    } catch (err) {
      console.error("Failed to load background for editing:", err);
      await show_alert("Failed to load image for editing");
    }
  }
  async _save_created_image(data_url, width, height) {
    const fname = `${this._name}.png`;
    const blob = await fetch(data_url).then((r) => r.blob());
    const arr = await blob.arrayBuffer();
    await project_write_binary(`backgrounds/${this._name}/${fname}`, new Uint8Array(arr));
    this._data.file_name = fname;
    this._data.width = width;
    this._data.height = height;
    this._update_info();
    this._draw_image(data_url);
    this._save();
    this._win.body.innerHTML = "";
    this._build_ui();
    this._update_info();
    this._draw_image(data_url);
  }
  async _save_edited_image(data_url) {
    if (!this._data.file_name) return;
    const blob = await fetch(data_url).then((r) => r.blob());
    const arr = await blob.arrayBuffer();
    await project_write_binary(`backgrounds/${this._name}/${this._data.file_name}`, new Uint8Array(arr));
    this._draw_image(data_url);
  }
  async _load_binary_url(path) {
    return await project_read_binary_url(path);
  }
  // -----------------------------------------------------------------------
  // Import
  // -----------------------------------------------------------------------
  async _import_image() {
    if (!project_has_folder()) {
      await show_alert("Open a project folder first (File \u2192 Open\u2026).");
      return;
    }
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.addEventListener("change", async () => {
      const file = inp.files?.[0];
      if (!file) return;
      const ext = file.name.split(".").pop() ?? "png";
      const fname = `${this._name}.${ext}`;
      const arr = await file.arrayBuffer();
      await project_write_binary(`backgrounds/${this._name}/${fname}`, new Uint8Array(arr));
      const data_url = await this._file_to_data_url(file);
      const img = await this._load_image(data_url);
      this._data.file_name = fname;
      this._data.width = img.naturalWidth;
      this._data.height = img.naturalHeight;
      this._update_info();
      this._draw_image(data_url);
      this._save();
    });
    inp.click();
  }
  _file_to_data_url(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }
  _load_image(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  async _load_data() {
    const meta_path = `backgrounds/${this._name}/meta.json`;
    const exists = await project_file_exists(meta_path);
    if (!exists) return;
    try {
      const raw = await project_read_file(meta_path);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.assign(this._data, parsed);
      this._win.body.innerHTML = "";
      this._build_ui();
      this._update_info();
      if (this._data.file_name) {
        try {
          const img_url = await project_read_binary_url(`backgrounds/${this._name}/${this._data.file_name}`);
          this._draw_image(img_url);
        } catch {
        }
      }
    } catch {
    }
  }
  async _save() {
    if (!project_has_folder()) return;
    await project_write_file(
      `backgrounds/${this._name}/meta.json`,
      JSON.stringify(this._data, null, 2)
    );
  }
};

// packages/ide/src/editors/font_editor.ts
var _open_editors7 = /* @__PURE__ */ new Map();
function font_editor_open(workspace, font_name) {
  const existing = _open_editors7.get(font_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new font_editor_window(workspace, font_name);
  _open_editors7.set(font_name, ed);
  ed.on_closed(() => _open_editors7.delete(font_name));
}
var font_editor_window = class {
  constructor(workspace, name) {
    this._name = name;
    this._data = {
      font_name: "Arial",
      size: 12,
      bold: false,
      italic: false,
      aa: true,
      ranges: [{ from: 32, to: 127 }]
    };
    this._win = new FloatingWindow(
      `fnt-${name}`,
      `Font: ${name}`,
      "icons/font.svg",
      { x: 240, y: 100, w: 500, h: 380 }
    );
    this._build_ui();
    this._win.mount(workspace);
    this._load_data();
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._win.on_close(cb);
  }
  // -----------------------------------------------------------------------
  // Build UI
  // -----------------------------------------------------------------------
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
    const layout = document.createElement("div");
    layout.style.cssText = "display:flex;flex:1;overflow:hidden;";
    layout.appendChild(this._build_props_panel());
    layout.appendChild(this._build_preview_panel());
    body.appendChild(layout);
  }
  _build_props_panel() {
    const panel = document.createElement("div");
    panel.className = "sw-font-props";
    panel.appendChild(this._make_section_title("Font"));
    panel.appendChild(this._make_text_field(
      "Family",
      this._data.font_name,
      (v) => {
        this._data.font_name = v;
        this._update_preview();
        this._save();
      }
    ));
    panel.appendChild(this._make_number_field(
      "Size (pt)",
      this._data.size,
      4,
      256,
      (v) => {
        this._data.size = v;
        this._update_preview();
        this._save();
      }
    ));
    panel.appendChild(this._make_checkbox(
      "Bold",
      this._data.bold,
      (v) => {
        this._data.bold = v;
        this._update_preview();
        this._save();
      }
    ));
    panel.appendChild(this._make_checkbox(
      "Italic",
      this._data.italic,
      (v) => {
        this._data.italic = v;
        this._update_preview();
        this._save();
      }
    ));
    panel.appendChild(this._make_checkbox(
      "Anti-alias",
      this._data.aa,
      (v) => {
        this._data.aa = v;
        this._save();
      }
    ));
    panel.appendChild(this._make_section_title("Character Ranges"));
    const range_list = document.createElement("div");
    range_list.className = "sw-font-ranges";
    this._range_list = range_list;
    panel.appendChild(range_list);
    this._render_ranges();
    const add_range_btn = document.createElement("button");
    add_range_btn.className = "sw-btn";
    add_range_btn.style.margin = "4px 6px";
    add_range_btn.textContent = "+ Add Range";
    add_range_btn.addEventListener("click", () => {
      this._data.ranges.push({ from: 32, to: 127 });
      this._render_ranges();
      this._save();
    });
    panel.appendChild(add_range_btn);
    return panel;
  }
  _build_preview_panel() {
    const panel = document.createElement("div");
    panel.className = "sw-font-preview-panel";
    const title = document.createElement("div");
    title.className = "sw-bg-section-title";
    title.textContent = "Preview";
    panel.appendChild(title);
    const preview = document.createElement("div");
    preview.className = "sw-font-preview";
    preview.contentEditable = "true";
    preview.textContent = "The quick brown fox jumps over the lazy dog.\n0123456789 !@#$%^&*()";
    this._preview_el = preview;
    this._update_preview();
    panel.appendChild(preview);
    return panel;
  }
  // -----------------------------------------------------------------------
  // Range rendering
  // -----------------------------------------------------------------------
  _render_ranges() {
    this._range_list.innerHTML = "";
    this._data.ranges.forEach((range, idx) => {
      const row = document.createElement("div");
      row.className = "sw-font-range-row";
      const from_inp = this._small_number_input(range.from, 0, 65535, (v) => {
        range.from = v;
        this._save();
      });
      const to_inp = this._small_number_input(range.to, 0, 65535, (v) => {
        range.to = v;
        this._save();
      });
      const sep = document.createElement("span");
      sep.textContent = "\u2013";
      sep.style.cssText = "color:var(--sw-text-dim);margin:0 2px;";
      const del_btn = document.createElement("button");
      del_btn.className = "sw-btn";
      del_btn.style.cssText = "padding:2px 6px;font-size:10px;margin-left:auto;";
      del_btn.textContent = "\u2715";
      del_btn.addEventListener("click", () => {
        this._data.ranges.splice(idx, 1);
        this._render_ranges();
        this._save();
      });
      row.append(from_inp, sep, to_inp, del_btn);
      this._range_list.appendChild(row);
    });
  }
  _small_number_input(val, min, max, cb) {
    const inp = document.createElement("input");
    inp.type = "number";
    inp.className = "sw-input";
    inp.style.cssText = "width:60px;padding:2px 4px;";
    inp.min = String(min);
    inp.max = String(max);
    inp.value = String(val);
    inp.addEventListener("change", () => {
      const v = parseInt(inp.value);
      if (!isNaN(v)) cb(v);
    });
    return inp;
  }
  // -----------------------------------------------------------------------
  // Preview update
  // -----------------------------------------------------------------------
  _update_preview() {
    if (!this._preview_el) return;
    let style = `font-family:${this._data.font_name},sans-serif;font-size:${this._data.size}px;`;
    if (this._data.bold) style += "font-weight:bold;";
    if (this._data.italic) style += "font-style:italic;";
    this._preview_el.style.cssText = style + "padding:12px;flex:1;overflow:auto;color:var(--sw-text);white-space:pre-wrap;outline:none;";
  }
  // -----------------------------------------------------------------------
  // Helpers — form widgets
  // -----------------------------------------------------------------------
  _make_section_title(text) {
    const el = document.createElement("div");
    el.className = "sw-bg-section-title";
    el.textContent = text;
    return el;
  }
  _make_text_field(label, val, cb) {
    const row = document.createElement("div");
    row.className = "sw-font-row";
    const lbl = document.createElement("label");
    lbl.className = "sw-label";
    lbl.textContent = label;
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "sw-input";
    inp.value = val;
    inp.addEventListener("change", () => cb(inp.value));
    row.append(lbl, inp);
    return row;
  }
  _make_number_field(label, val, min, max, cb) {
    const row = document.createElement("div");
    row.className = "sw-font-row";
    const lbl = document.createElement("label");
    lbl.className = "sw-label";
    lbl.textContent = label;
    const inp = document.createElement("input");
    inp.type = "number";
    inp.className = "sw-input";
    inp.min = String(min);
    inp.max = String(max);
    inp.value = String(val);
    inp.addEventListener("change", () => {
      const v = parseInt(inp.value);
      if (!isNaN(v)) cb(v);
    });
    row.append(lbl, inp);
    return row;
  }
  _make_checkbox(label, checked, cb) {
    const row = document.createElement("div");
    row.className = "sw-font-row";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;align-items:center;gap:6px;cursor:pointer;";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "sw-checkbox";
    chk.checked = checked;
    chk.addEventListener("change", () => cb(chk.checked));
    lbl.append(chk, document.createTextNode(label));
    row.appendChild(lbl);
    return row;
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  async _load_data() {
    try {
      const raw = await project_read_file(`fonts/${this._name}/meta.json`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.assign(this._data, parsed);
      this._win.body.innerHTML = "";
      this._build_ui();
    } catch {
    }
  }
  async _save() {
    if (!project_has_folder()) return;
    await project_write_file(
      `fonts/${this._name}/meta.json`,
      JSON.stringify(this._data, null, 2)
    );
  }
};

// packages/ide/src/editors/path_editor.ts
var GRID2 = 16;
var PT_R = 6;
var _open_editors8 = /* @__PURE__ */ new Map();
function path_editor_open(workspace, path_name) {
  const existing = _open_editors8.get(path_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new path_editor_window(workspace, path_name);
  _open_editors8.set(path_name, ed);
  ed.on_closed(() => _open_editors8.delete(path_name));
}
var path_editor_window = class {
  constructor(workspace, name) {
    // Canvas interaction state
    this._drag_idx = -1;
    // index of dragged point, -1 = none
    this._sel_idx = -1;
    // selected point index
    this._pan_x = 0;
    this._pan_y = 0;
    this._zoom = 1;
    this._panning = false;
    this._pan_start_x = 0;
    this._pan_start_y = 0;
    this._pan_origin_x = 0;
    this._pan_origin_y = 0;
    this._first_resize = true;
    this._name = name;
    this._data = { kind: "linear", closed: false, points: [] };
    this._win = new FloatingWindow(
      `path-${name}`,
      `Path: ${name}`,
      "icons/path.svg",
      { x: 250, y: 110, w: 600, h: 460 }
    );
    this._build_ui();
    this._win.mount(workspace);
    this._load_data();
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._win.on_close(() => {
      this._ro.disconnect();
      cb();
    });
  }
  // -----------------------------------------------------------------------
  // Build UI
  // -----------------------------------------------------------------------
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.className = "sw-editor-toolbar";
    const kind_sel = this._make_select(
      ["linear", "smooth"],
      this._data.kind,
      (v) => {
        this._data.kind = v;
        this._draw();
        this._save();
      }
    );
    toolbar.appendChild(this._make_label_wrap("Kind:", kind_sel));
    toolbar.appendChild(this._make_checkbox_inline(
      "Closed",
      this._data.closed,
      (v) => {
        this._data.closed = v;
        this._draw();
        this._save();
      }
    ));
    const clear_btn = document.createElement("button");
    clear_btn.className = "sw-btn";
    clear_btn.textContent = "Clear";
    clear_btn.addEventListener("click", () => {
      this._data.points = [];
      this._sel_idx = -1;
      this._draw();
      this._save();
    });
    toolbar.appendChild(clear_btn);
    const del_pt_btn = document.createElement("button");
    del_pt_btn.className = "sw-btn";
    del_pt_btn.textContent = "Del Point";
    del_pt_btn.addEventListener("click", () => {
      if (this._sel_idx < 0) return;
      this._data.points.splice(this._sel_idx, 1);
      this._sel_idx = Math.min(this._sel_idx, this._data.points.length - 1);
      this._draw();
      this._save();
    });
    toolbar.appendChild(del_pt_btn);
    body.appendChild(toolbar);
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "flex:1;position:relative;overflow:hidden;background:#1a1a1a;";
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;";
    this._canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this._ctx = ctx;
    wrapper.appendChild(canvas);
    body.appendChild(wrapper);
    this._ro = new ResizeObserver(() => this._resize_canvas(wrapper));
    this._ro.observe(wrapper);
    canvas.addEventListener("mousedown", (e) => this._on_mouse_down(e));
    canvas.addEventListener("mousemove", (e) => this._on_mouse_move(e));
    canvas.addEventListener("mouseup", (e) => this._on_mouse_up(e));
    canvas.addEventListener("wheel", (e) => this._on_wheel(e), { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  // -----------------------------------------------------------------------
  // Canvas resize
  // -----------------------------------------------------------------------
  _resize_canvas(wrapper) {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    this._canvas.width = w;
    this._canvas.height = h;
    if (this._first_resize) {
      this._pan_x = Math.floor(w / 2);
      this._pan_y = Math.floor(h / 2);
      this._first_resize = false;
    }
    this._draw();
  }
  // -----------------------------------------------------------------------
  // Drawing
  // -----------------------------------------------------------------------
  _draw() {
    const ctx = this._ctx;
    const W2 = this._canvas.width;
    const H2 = this._canvas.height;
    if (W2 === 0 || H2 === 0) return;
    ctx.clearRect(0, 0, W2, H2);
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    const gs = GRID2 * this._zoom;
    const ox = (this._pan_x % gs + gs) % gs;
    const oy = (this._pan_y % gs + gs) % gs;
    for (let x = ox; x < W2; x += gs) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H2);
      ctx.stroke();
    }
    for (let y = oy; y < H2; y += gs) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W2, y);
      ctx.stroke();
    }
    const ox2 = this._pan_x;
    const oy2 = this._pan_y;
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox2, 0);
    ctx.lineTo(ox2, H2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, oy2);
    ctx.lineTo(W2, oy2);
    ctx.stroke();
    const pts = this._data.points;
    if (pts.length === 0) return;
    const to_screen = (pt) => ({
      sx: this._pan_x + pt.x * this._zoom,
      sy: this._pan_y + pt.y * this._zoom
    });
    ctx.beginPath();
    ctx.strokeStyle = "#00ccff";
    ctx.lineWidth = 2;
    if (this._data.kind === "smooth" && pts.length >= 2) {
      const s = to_screen(pts[0]);
      ctx.moveTo(s.sx, s.sy);
      for (let i = 1; i < pts.length; i++) {
        const prev = to_screen(pts[i - 1]);
        const cur = to_screen(pts[i]);
        const cpx = (prev.sx + cur.sx) / 2;
        const cpy = (prev.sy + cur.sy) / 2;
        ctx.quadraticCurveTo(prev.sx, prev.sy, cpx, cpy);
      }
      const last = to_screen(pts[pts.length - 1]);
      ctx.lineTo(last.sx, last.sy);
      if (this._data.closed) {
        const first = to_screen(pts[0]);
        ctx.lineTo(first.sx, first.sy);
      }
    } else {
      const s = to_screen(pts[0]);
      ctx.moveTo(s.sx, s.sy);
      for (let i = 1; i < pts.length; i++) {
        const p = to_screen(pts[i]);
        ctx.lineTo(p.sx, p.sy);
      }
      if (this._data.closed && pts.length > 1) {
        const first = to_screen(pts[0]);
        ctx.lineTo(first.sx, first.sy);
      }
    }
    ctx.stroke();
    pts.forEach((pt, idx) => {
      const { sx, sy } = to_screen(pt);
      ctx.beginPath();
      ctx.arc(sx, sy, PT_R, 0, Math.PI * 2);
      ctx.fillStyle = idx === this._sel_idx ? "#ffcc00" : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }
  // -----------------------------------------------------------------------
  // Mouse interactions
  // -----------------------------------------------------------------------
  _canvas_to_world(cx, cy) {
    return {
      x: (cx - this._pan_x) / this._zoom,
      y: (cy - this._pan_y) / this._zoom
    };
  }
  _hit_point(cx, cy) {
    for (let i = 0; i < this._data.points.length; i++) {
      const pt = this._data.points[i];
      const sx = this._pan_x + pt.x * this._zoom;
      const sy = this._pan_y + pt.y * this._zoom;
      const dx = cx - sx;
      const dy = cy - sy;
      if (dx * dx + dy * dy <= (PT_R + 2) * (PT_R + 2)) return i;
    }
    return -1;
  }
  _on_mouse_down(e) {
    const cx = e.offsetX;
    const cy = e.offsetY;
    if (e.button === 1 || e.button === 0 && e.altKey) {
      this._panning = true;
      this._pan_start_x = e.clientX;
      this._pan_start_y = e.clientY;
      this._pan_origin_x = this._pan_x;
      this._pan_origin_y = this._pan_y;
      e.preventDefault();
      return;
    }
    if (e.button === 0) {
      const hit = this._hit_point(cx, cy);
      if (hit >= 0) {
        this._drag_idx = hit;
        this._sel_idx = hit;
        this._draw();
      } else {
        const w = this._canvas_to_world(cx, cy);
        const snapped = {
          x: Math.round(w.x / GRID2) * GRID2,
          y: Math.round(w.y / GRID2) * GRID2,
          sp: 100
        };
        this._data.points.push(snapped);
        this._sel_idx = this._data.points.length - 1;
        this._draw();
        this._save();
      }
    }
  }
  _on_mouse_move(e) {
    if (this._panning) {
      this._pan_x = this._pan_origin_x + (e.clientX - this._pan_start_x);
      this._pan_y = this._pan_origin_y + (e.clientY - this._pan_start_y);
      this._draw();
      return;
    }
    if (this._drag_idx >= 0) {
      const w = this._canvas_to_world(e.offsetX, e.offsetY);
      const pt = this._data.points[this._drag_idx];
      pt.x = Math.round(w.x / GRID2) * GRID2;
      pt.y = Math.round(w.y / GRID2) * GRID2;
      this._draw();
    }
  }
  _on_mouse_up(_e) {
    if (this._panning) {
      this._panning = false;
      return;
    }
    if (this._drag_idx >= 0) {
      this._drag_idx = -1;
      this._save();
    }
  }
  _on_wheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const new_zoom = Math.max(0.125, Math.min(8, this._zoom * factor));
    const cx = e.offsetX;
    const cy = e.offsetY;
    this._pan_x = cx - (cx - this._pan_x) * (new_zoom / this._zoom);
    this._pan_y = cy - (cy - this._pan_y) * (new_zoom / this._zoom);
    this._zoom = new_zoom;
    this._draw();
  }
  // -----------------------------------------------------------------------
  // Helpers — toolbar widgets
  // -----------------------------------------------------------------------
  _make_select(options, current, cb) {
    const sel = document.createElement("select");
    sel.className = "sw-select";
    for (const opt of options) {
      const o = document.createElement("option");
      o.value = o.textContent = opt;
      if (opt === current) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener("change", () => cb(sel.value));
    return sel;
  }
  _make_label_wrap(text, control) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;align-items:center;gap:4px;";
    const lbl = document.createElement("span");
    lbl.style.cssText = "font-size:11px;color:var(--sw-text-dim);";
    lbl.textContent = text;
    wrap.append(lbl, control);
    return wrap;
  }
  _make_checkbox_inline(label, checked, cb) {
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "sw-checkbox";
    chk.checked = checked;
    chk.addEventListener("change", () => cb(chk.checked));
    lbl.append(chk, document.createTextNode(label));
    return lbl;
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  async _load_data() {
    try {
      const raw = await project_read_file(`paths/${this._name}/path.json`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.kind) this._data.kind = parsed.kind;
      if (parsed.closed !== void 0) this._data.closed = parsed.closed;
      if (Array.isArray(parsed.points)) this._data.points = parsed.points;
      this._draw();
    } catch {
    }
  }
  async _save() {
    if (!project_has_folder()) return;
    await project_write_file(
      `paths/${this._name}/path.json`,
      JSON.stringify(this._data, null, 2)
    );
  }
};

// packages/ide/src/editors/timeline_editor.ts
var _open_editors9 = /* @__PURE__ */ new Map();
function timeline_editor_open(workspace, tl_name) {
  const existing = _open_editors9.get(tl_name);
  if (existing) {
    existing.bring_to_front();
    return;
  }
  const ed = new timeline_editor_window(workspace, tl_name);
  _open_editors9.set(tl_name, ed);
  ed.on_closed(() => _open_editors9.delete(tl_name));
}
var timeline_editor_window = class {
  constructor(workspace, name) {
    this._sel_idx = -1;
    this._workspace = workspace;
    this._name = name;
    this._data = { moments: [] };
    this._win = new FloatingWindow(
      `tl-${name}`,
      `Timeline: ${name}`,
      "icons/timeline.svg",
      { x: 260, y: 120, w: 520, h: 400 }
    );
    this._build_ui();
    this._win.mount(workspace);
    this._load_data();
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._win.on_close(cb);
  }
  // -----------------------------------------------------------------------
  // Build UI
  // -----------------------------------------------------------------------
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.className = "sw-editor-toolbar";
    const add_btn = this._make_btn("Add Moment", () => this._add_moment());
    const del_btn = this._make_btn("Remove", () => this._delete_selected());
    const edit_btn = this._make_btn("Edit Code\u2026", () => this._edit_selected_code());
    toolbar.append(add_btn, del_btn, edit_btn);
    body.appendChild(toolbar);
    const layout = document.createElement("div");
    layout.style.cssText = "display:flex;flex:1;overflow:hidden;";
    const left = document.createElement("div");
    left.className = "sw-tl-list-panel";
    const list_title = document.createElement("div");
    list_title.className = "sw-bg-section-title";
    list_title.textContent = "Moments";
    left.appendChild(list_title);
    const list = document.createElement("div");
    list.className = "sw-tl-list";
    list.style.cssText = "flex:1;overflow-y:auto;";
    this._list_el = list;
    left.appendChild(list);
    layout.appendChild(left);
    const right = document.createElement("div");
    right.className = "sw-tl-strip-panel";
    const strip_title = document.createElement("div");
    strip_title.className = "sw-bg-section-title";
    strip_title.textContent = "Step strip (read-only)";
    right.appendChild(strip_title);
    const strip = document.createElement("canvas");
    strip.style.cssText = "display:block;background:#1a1a1a;";
    strip.width = 400;
    strip.height = 40;
    right.appendChild(strip);
    const hint = document.createElement("div");
    hint.style.cssText = "padding:8px;font-size:11px;color:var(--sw-text-dim);";
    hint.textContent = "Double-click a moment to edit its code.";
    right.appendChild(hint);
    layout.appendChild(right);
    body.appendChild(layout);
  }
  // -----------------------------------------------------------------------
  // Moment list render
  // -----------------------------------------------------------------------
  _render_list() {
    this._list_el.innerHTML = "";
    const sorted = [...this._data.moments].sort((a, b) => a.step - b.step);
    sorted.forEach((m) => {
      const data_idx = this._data.moments.indexOf(m);
      const row = document.createElement("div");
      row.className = "sw-tl-moment-row" + (data_idx === this._sel_idx ? " selected" : "");
      row.addEventListener("click", () => {
        this._sel_idx = data_idx;
        this._render_list();
      });
      row.addEventListener("dblclick", () => {
        this._sel_idx = data_idx;
        this._edit_selected_code();
      });
      const step_lbl = document.createElement("span");
      step_lbl.className = "sw-tl-step-lbl";
      step_lbl.textContent = `Step ${m.step}`;
      const name_inp = document.createElement("input");
      name_inp.type = "text";
      name_inp.className = "sw-input";
      name_inp.style.cssText = "flex:1;padding:2px 4px;font-size:11px;";
      name_inp.value = m.name;
      name_inp.placeholder = "label\u2026";
      name_inp.addEventListener("change", () => {
        m.name = name_inp.value;
        this._save();
      });
      name_inp.addEventListener("click", (e) => e.stopPropagation());
      const step_inp = document.createElement("input");
      step_inp.type = "number";
      step_inp.className = "sw-input";
      step_inp.style.cssText = "width:52px;padding:2px 4px;font-size:11px;";
      step_inp.min = "0";
      step_inp.value = String(m.step);
      step_inp.addEventListener("change", () => {
        const v = parseInt(step_inp.value);
        if (!isNaN(v) && v >= 0) {
          m.step = v;
          this._render_list();
          this._save();
        }
      });
      step_inp.addEventListener("click", (e) => e.stopPropagation());
      row.append(step_lbl, name_inp, step_inp);
      this._list_el.appendChild(row);
    });
  }
  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------
  _add_moment() {
    const used = new Set(this._data.moments.map((m) => m.step));
    let step = 0;
    while (used.has(step)) step++;
    this._data.moments.push({ step, name: "" });
    this._sel_idx = this._data.moments.length - 1;
    this._render_list();
    this._save();
  }
  _delete_selected() {
    if (this._sel_idx < 0) return;
    this._data.moments.splice(this._sel_idx, 1);
    this._sel_idx = Math.min(this._sel_idx, this._data.moments.length - 1);
    this._render_list();
    this._save();
  }
  async _edit_selected_code() {
    if (this._sel_idx < 0) {
      alert("Select a moment first.");
      return;
    }
    const moment = this._data.moments[this._sel_idx];
    if (!moment) {
      alert("Select a moment first.");
      return;
    }
    const rel = `timelines/${this._name}/step_${moment.step}.ts`;
    try {
      await script_editor_open_smart(this._workspace, rel, async () => {
        const dir = project_get_dir();
        const tl_dir = await dir.getDirectoryHandle("timelines", { create: true });
        const res_dir = await tl_dir.getDirectoryHandle(this._name, { create: true });
        return res_dir.getFileHandle(`step_${moment.step}.ts`, { create: true });
      });
    } catch (err) {
      console.error("[Timeline] Failed to open code file:", err);
    }
  }
  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  _make_btn(label, cb) {
    const b = document.createElement("button");
    b.className = "sw-btn";
    b.textContent = label;
    b.addEventListener("click", cb);
    return b;
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  async _load_data() {
    try {
      const raw = await project_read_file(`timelines/${this._name}/timeline.json`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.moments)) this._data.moments = parsed.moments;
      this._render_list();
    } catch {
    }
  }
  async _save() {
    if (!project_has_folder()) return;
    await project_write_file(
      `timelines/${this._name}/timeline.json`,
      JSON.stringify(this._data, null, 2)
    );
  }
};

// packages/ide/src/editors/settings_editor.ts
var _win = null;
function settings_editor_open(workspace, state, room_names, on_change) {
  if (_win) {
    _win.body.innerHTML = "";
    _build_ui(_win.body, state, room_names, on_change);
    _win.bring_to_front();
    return;
  }
  _win = new FloatingWindow(
    "sw-settings",
    "Game Settings",
    null,
    { x: 160, y: 60, w: 420, h: 480 }
  );
  _win.on_close(() => {
    _win = null;
  });
  _build_ui(_win.body, state, room_names, on_change);
  _win.mount(workspace);
}
function _build_ui(body, state, room_names, on_change) {
  const root = document.createElement("div");
  root.style.cssText = "padding:12px; overflow-y:auto; height:100%; display:flex; flex-direction:column; gap:16px;";
  root.appendChild(_section2("Project", [
    _field_text("Name", state.name, (v) => {
      state.name = v;
      on_change();
    }),
    _field_text("Version", state.version, (v) => {
      state.version = v;
      on_change();
    }),
    _field_text("Engine Version", state.engineVersion, null)
    // read-only
  ]));
  root.appendChild(_section2("Display", [
    _field_number("Window Width", state.settings.windowWidth, 1, 7680, (v) => {
      state.settings.windowWidth = v;
      on_change();
    }),
    _field_number("Window Height", state.settings.windowHeight, 1, 4320, (v) => {
      state.settings.windowHeight = v;
      on_change();
    }),
    _field_color("Background Color", state.settings.displayColor ?? "#000000", (v) => {
      state.settings.displayColor = v;
      on_change();
    })
  ]));
  root.appendChild(_section2("Game", [
    _field_number("Room Speed (FPS)", state.settings.roomSpeed, 1, 960, (v) => {
      state.settings.roomSpeed = v;
      on_change();
    }),
    _field_select(
      "Start Room",
      state.settings.startRoom,
      room_names,
      (v) => {
        state.settings.startRoom = v;
        on_change();
      }
    )
  ]));
  body.appendChild(root);
}
function _section2(title, fields) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex; flex-direction:column; gap:6px;";
  const hdr = document.createElement("div");
  hdr.textContent = title;
  hdr.style.cssText = `
        font-size:11px; font-weight:bold; text-transform:uppercase;
        letter-spacing:0.5px; color:var(--sw-text-dim);
        padding-bottom:4px; border-bottom:1px solid var(--sw-border2);
    `;
  wrap.appendChild(hdr);
  fields.forEach((f) => wrap.appendChild(f));
  return wrap;
}
function _row(label, control) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:8px;";
  const lbl = document.createElement("label");
  lbl.className = "sw-label";
  lbl.textContent = label;
  lbl.style.cssText += "min-width:140px; flex-shrink:0; margin:0;";
  row.append(lbl, control);
  return row;
}
function _field_text(label, value, on_input) {
  const inp = document.createElement("input");
  inp.className = "sw-input";
  inp.type = "text";
  inp.value = value;
  inp.style.flex = "1";
  if (!on_input) inp.readOnly = true;
  else inp.addEventListener("input", () => on_input(inp.value));
  return _row(label, inp);
}
function _field_number(label, value, min, max, on_change) {
  const inp = document.createElement("input");
  inp.className = "sw-input";
  inp.type = "number";
  inp.min = String(min);
  inp.max = String(max);
  inp.value = String(value);
  inp.style.flex = "1";
  inp.addEventListener("change", () => {
    const n = Math.max(min, Math.min(max, Number(inp.value) || min));
    inp.value = String(n);
    on_change(n);
  });
  return _row(label, inp);
}
function _field_select(label, value, options, on_change) {
  const sel = document.createElement("select");
  sel.className = "sw-select";
  sel.style.flex = "1";
  if (options.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(no rooms defined)";
    sel.appendChild(opt);
  } else {
    for (const name of options) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (name === value) opt.selected = true;
      sel.appendChild(opt);
    }
  }
  sel.addEventListener("change", () => on_change(sel.value));
  return _row(label, sel);
}
function _field_color(label, value, on_change) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex; align-items:center; gap:6px; flex:1;";
  const picker = document.createElement("input");
  picker.type = "color";
  picker.value = value;
  picker.style.cssText = "width:32px; height:24px; border:none; cursor:pointer; background:none; padding:0;";
  picker.addEventListener("input", () => {
    hex.value = picker.value.toUpperCase();
    on_change(picker.value);
  });
  const hex = document.createElement("input");
  hex.className = "sw-input";
  hex.type = "text";
  hex.value = value.toUpperCase();
  hex.maxLength = 7;
  hex.style.cssText += "flex:1; font-family:Consolas,monospace; font-size:11px;";
  hex.addEventListener("change", () => {
    const v = hex.value.startsWith("#") ? hex.value : "#" + hex.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      picker.value = v.toLowerCase();
      hex.value = v.toUpperCase();
      on_change(v.toLowerCase());
    } else {
      hex.value = picker.value.toUpperCase();
    }
  });
  wrap.append(picker, hex);
  return _row(label, wrap);
}

// packages/ide/src/panels/game_preview.ts
var _win2 = null;
var _iframe = null;
var _running = false;
function preview_open(workspace) {
  if (_win2) {
    _win2.bring_to_front();
    return;
  }
  _win2 = new FloatingWindow(
    "sw-game-preview",
    "Game Preview",
    "icons/room.svg",
    { x: 300, y: 60, w: 640, h: 480 }
  );
  _win2.on_close(() => {
    _iframe = null;
    _win2 = null;
    _running = false;
  });
  _build_ui2(workspace);
  _win2.mount(workspace);
}
function preview_play(workspace) {
  preview_open(workspace);
  _load_game();
}
function preview_stop() {
  if (!_iframe) return;
  _iframe.src = "about:blank";
  _running = false;
}
function preview_reload() {
  if (!_iframe || !_running) return;
  _load_game();
}
function _build_ui2(workspace) {
  if (!_win2) return;
  const body = _win2.body;
  body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
  const toolbar = document.createElement("div");
  toolbar.className = "sw-editor-toolbar";
  const play_btn = document.createElement("button");
  play_btn.className = "sw-btn";
  play_btn.textContent = "\u25B6 Play";
  play_btn.addEventListener("click", () => preview_play(workspace));
  const stop_btn = document.createElement("button");
  stop_btn.className = "sw-btn";
  stop_btn.textContent = "\u25A0 Stop";
  stop_btn.addEventListener("click", () => preview_stop());
  const reload_btn = document.createElement("button");
  reload_btn.className = "sw-btn";
  reload_btn.textContent = "\u21BA Reload";
  reload_btn.addEventListener("click", () => preview_reload());
  toolbar.append(play_btn, stop_btn, reload_btn);
  body.appendChild(toolbar);
  const container = document.createElement("div");
  container.style.cssText = "flex:1;position:relative;background:#000;overflow:hidden;";
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "width:100%;height:100%;border:none;display:block;";
  iframe.sandbox.add(
    "allow-scripts",
    "allow-same-origin",
    "allow-popups",
    "allow-forms"
  );
  iframe.src = "about:blank";
  _iframe = iframe;
  container.appendChild(iframe);
  body.appendChild(container);
}
function _load_game() {
  if (!_iframe) return;
  _iframe.src = `game_preview.html?t=${Date.now()}`;
  _running = true;
}

// packages/ide/src/panels/console_panel.ts
var _win3 = null;
var _list_el = null;
var _entries = [];
var _filter = /* @__PURE__ */ new Set(["log", "warn", "error", "info", "system"]);
var _listener_attached2 = false;
var MAX_ENTRIES = 500;
function console_open(workspace, minimized = false) {
  if (_win3) {
    _win3.bring_to_front();
    return;
  }
  _win3 = new FloatingWindow(
    "sw-console",
    "Output",
    "icons/script.svg",
    { x: 0, y: 400, w: 700, h: 200 }
  );
  _win3.on_close(() => {
    _win3 = null;
    _list_el = null;
  });
  _build_ui3();
  _win3.mount(workspace);
  if (minimized) {
    _win3.toggle_minimize();
  }
  _render_all();
  _ensure_listener2();
}
function console_toggle(workspace) {
  if (!_win3) {
    console_open(workspace, false);
  } else {
    _win3.toggle_minimize();
  }
}
function console_write(level, text) {
  _push({ level, text, time: _timestamp() });
  _ensure_listener2();
  if (level === "error") console.error("[SW]", text);
  else if (level === "warn") console.warn("[SW]", text);
  else console.log("[SW]", text);
}
function console_clear() {
  _entries = [];
  if (_list_el) _list_el.innerHTML = "";
}
function _build_ui3() {
  if (!_win3) return;
  const body = _win3.body;
  body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
  const toolbar = document.createElement("div");
  toolbar.className = "sw-editor-toolbar";
  const levels = ["log", "info", "warn", "error", "system"];
  for (const lvl of levels) {
    const btn = document.createElement("button");
    btn.className = `sw-btn sw-con-filter${_filter.has(lvl) ? " active" : ""}`;
    btn.dataset["level"] = lvl;
    btn.textContent = lvl;
    btn.addEventListener("click", () => {
      if (_filter.has(lvl)) _filter.delete(lvl);
      else _filter.add(lvl);
      btn.classList.toggle("active", _filter.has(lvl));
      _render_all();
    });
    toolbar.appendChild(btn);
  }
  const sep = document.createElement("div");
  sep.style.cssText = "flex:1;";
  toolbar.appendChild(sep);
  const clear_btn = document.createElement("button");
  clear_btn.className = "sw-btn";
  clear_btn.textContent = "Clear";
  clear_btn.addEventListener("click", () => console_clear());
  toolbar.appendChild(clear_btn);
  body.appendChild(toolbar);
  const list = document.createElement("div");
  list.className = "sw-con-list";
  list.style.cssText = "flex:1;overflow-y:auto;font-family:monospace;font-size:11px;";
  _list_el = list;
  body.appendChild(list);
}
function _render_all() {
  if (!_list_el) return;
  _list_el.innerHTML = "";
  for (const entry of _entries) {
    if (_filter.has(entry.level)) _append_row(entry);
  }
  _scroll_bottom();
}
function _push(entry) {
  _entries.push(entry);
  if (_entries.length > MAX_ENTRIES) _entries.shift();
  if (_list_el && _filter.has(entry.level)) {
    _append_row(entry);
    _scroll_bottom();
  }
}
function _append_row(entry) {
  if (!_list_el) return;
  const row = document.createElement("div");
  row.className = `sw-con-row sw-con-${entry.level}`;
  const time_span = document.createElement("span");
  time_span.className = "sw-con-time";
  time_span.textContent = entry.time;
  const text_span = document.createElement("span");
  text_span.className = "sw-con-text";
  text_span.textContent = entry.text;
  row.append(time_span, text_span);
  _list_el.appendChild(row);
}
function _scroll_bottom() {
  if (_list_el) _list_el.scrollTop = _list_el.scrollHeight;
}
function _timestamp() {
  const d = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function _ensure_listener2() {
  if (_listener_attached2) return;
  _listener_attached2 = true;
  window.addEventListener("message", (e) => {
    if (!e.data || e.data.type !== "sw:log") return;
    const level = e.data.level ?? "log";
    const args = Array.isArray(e.data.args) ? e.data.args : [];
    const text = args.map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    }).join(" ");
    _push({ level, text, time: _timestamp() });
    if (level === "error") console.error("[Game]", text);
    else if (level === "warn") console.warn("[Game]", text);
    else console.log("[Game]", text);
  });
}

// packages/ide/src/panels/debugger_panel.ts
var _win4 = null;
var _vars_el = null;
var _status_el = null;
var _listener_registered = false;
function debugger_open(workspace) {
  if (_win4) {
    _win4.bring_to_front();
    return;
  }
  _win4 = new FloatingWindow(
    "sw-debugger",
    "Debugger",
    "icons/script.svg",
    { x: 700, y: 60, w: 340, h: 420 }
  );
  _win4.on_close(() => {
    _win4 = null;
    _vars_el = null;
    _status_el = null;
  });
  _build_ui4();
  _win4.mount(workspace);
  _ensure_listener3();
}
function debugger_show_hit(workspace, file, line, vars) {
  debugger_open(workspace);
  _set_status(`Paused at ${file}:${line}`, true);
  _render_vars(vars);
}
function _build_ui4() {
  if (!_win4) return;
  const body = _win4.body;
  body.style.cssText = "display:flex;flex-direction:column;overflow:hidden;";
  const toolbar = document.createElement("div");
  toolbar.className = "sw-editor-toolbar";
  const resume_btn = document.createElement("button");
  resume_btn.className = "sw-btn";
  resume_btn.textContent = "\u25B6 Resume";
  resume_btn.addEventListener("click", () => {
    bp_resume();
    _set_status("Running\u2026", false);
    if (_vars_el) _vars_el.innerHTML = "";
  });
  toolbar.appendChild(resume_btn);
  const clear_btn = document.createElement("button");
  clear_btn.className = "sw-btn";
  clear_btn.textContent = "Clear";
  clear_btn.addEventListener("click", () => {
    if (_vars_el) _vars_el.innerHTML = "";
    _set_status("Ready", false);
  });
  toolbar.appendChild(clear_btn);
  body.appendChild(toolbar);
  const status = document.createElement("div");
  status.className = "sw-dbg-status";
  status.textContent = "Ready";
  _status_el = status;
  body.appendChild(status);
  const vars = document.createElement("div");
  vars.className = "sw-dbg-vars";
  _vars_el = vars;
  body.appendChild(vars);
}
function _set_status(text, paused) {
  if (!_status_el) return;
  _status_el.textContent = text;
  _status_el.classList.toggle("paused", paused);
}
function _render_vars(vars) {
  if (!_vars_el) return;
  _vars_el.innerHTML = "";
  const entries = Object.entries(vars);
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sw-dbg-empty";
    empty.textContent = "(no variables)";
    _vars_el.appendChild(empty);
    return;
  }
  for (const [key, val] of entries) {
    const row = document.createElement("div");
    row.className = "sw-dbg-row";
    const key_el = document.createElement("span");
    key_el.className = "sw-dbg-key";
    key_el.textContent = key;
    const val_el = document.createElement("span");
    val_el.className = `sw-dbg-val sw-dbg-${_type_class(val)}`;
    val_el.textContent = _format_val(val);
    row.append(key_el, val_el);
    _vars_el.appendChild(row);
  }
}
function _type_class(v) {
  if (v === null) return "null";
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "num";
  if (typeof v === "string") return "str";
  if (typeof v === "object") return "obj";
  return "other";
}
function _format_val(v) {
  if (v === null) return "null";
  if (v === void 0) return "undefined";
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return "[Object]";
    }
  }
  return String(v);
}
function _ensure_listener3() {
  if (_listener_registered) return;
  _listener_registered = true;
  bp_on_hit((file, line, vars) => {
    _set_status(`Paused at ${file}:${line}`, true);
    _render_vars(vars);
  });
}

// packages/ide/src/panels/profiler_panel.ts
var HISTORY = 120;
var W = 280;
var H = 48;
var TARGET_FPS = 60;
var _win5 = null;
var _active = false;
var _listener_attached3 = false;
var _fps_buf = [];
var _step_buf = [];
var _heap_buf = [];
var _fps_ui = null;
var _step_ui = null;
var _heap_ui = null;
function profiler_open(workspace) {
  if (_win5) {
    _win5.bring_to_front();
    return;
  }
  _win5 = new FloatingWindow(
    "sw-profiler",
    "Profiler",
    "icons/script.svg",
    { x: 10, y: 60, w: 320, h: 480 }
  );
  _win5.on_close(() => {
    _win5 = null;
    _active = false;
    _fps_ui = null;
    _step_ui = null;
    _heap_ui = null;
  });
  _build_ui5();
  _win5.mount(workspace);
  _active = true;
  _ensure_listener4();
}
function _build_ui5() {
  if (!_win5) return;
  const body = _win5.body;
  body.style.cssText = "display:flex;flex-direction:column;overflow-y:auto;background:var(--sw-chrome);padding:8px;gap:8px;";
  _fps_ui = _make_metric_section(body, "FPS", "#4caf50");
  _step_ui = _make_metric_section(body, "Step (ms)", "#2196f3");
  _heap_ui = _make_metric_section(body, "Heap (MB)", "#ff9800");
  _draw_metric(_fps_ui, _fps_buf, TARGET_FPS, "#4caf50");
  _draw_metric(_step_ui, _step_buf, 16.7, "#2196f3");
  _draw_metric(_heap_ui, _heap_buf, 512, "#ff9800");
}
function _make_metric_section(parent, label, color) {
  const sec = document.createElement("div");
  sec.className = "sw-prof-section";
  const title_row = document.createElement("div");
  title_row.className = "sw-prof-title-row";
  const title = document.createElement("span");
  title.className = "sw-prof-title";
  title.textContent = label;
  title.style.color = color;
  const lbl_cur = document.createElement("span");
  lbl_cur.className = "sw-prof-cur";
  lbl_cur.textContent = "\u2013";
  title_row.append(title, lbl_cur);
  sec.appendChild(title_row);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.className = "sw-prof-canvas";
  sec.appendChild(canvas);
  const stats_row = document.createElement("div");
  stats_row.className = "sw-prof-stats";
  const lbl_avg = document.createElement("span");
  lbl_avg.textContent = "avg \u2013";
  const lbl_max = document.createElement("span");
  lbl_max.textContent = "max \u2013";
  stats_row.append(lbl_avg, lbl_max);
  sec.appendChild(stats_row);
  parent.appendChild(sec);
  const ctx = canvas.getContext("2d");
  return { canvas, ctx, lbl_cur, lbl_max, lbl_avg };
}
function _draw_metric(ui, buf, reference, color) {
  const { ctx, canvas, lbl_cur, lbl_max, lbl_avg } = ui;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);
  if (buf.length === 0) return;
  const cur = buf[buf.length - 1] ?? 0;
  const max = Math.max(...buf);
  const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
  lbl_cur.textContent = cur.toFixed(1);
  lbl_max.textContent = `max ${max.toFixed(1)}`;
  lbl_avg.textContent = `avg ${avg.toFixed(1)}`;
  const scale_max = Math.max(reference, max) * 1.1 || 1;
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  const ref_y = ch - reference / scale_max * ch;
  ctx.beginPath();
  ctx.moveTo(0, ref_y);
  ctx.lineTo(cw, ref_y);
  ctx.stroke();
  const step_x = cw / Math.max(HISTORY - 1, 1);
  ctx.beginPath();
  ctx.moveTo(0, ch);
  buf.forEach((v, i) => {
    const x = i * step_x;
    const y = ch - v / scale_max * ch;
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo((buf.length - 1) * step_x, ch);
  ctx.closePath();
  ctx.fillStyle = color + "33";
  ctx.fill();
  ctx.beginPath();
  buf.forEach((v, i) => {
    const x = i * step_x;
    const y = ch - v / scale_max * ch;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
function _push2(buf, val) {
  buf.push(val);
  if (buf.length > HISTORY) buf.shift();
}
function _ensure_listener4() {
  if (_listener_attached3) return;
  _listener_attached3 = true;
  window.addEventListener("message", (e) => {
    if (!e.data || e.data.type !== "sw:perf") return;
    const { fps, step_ms, heap_mb } = e.data;
    _push2(_fps_buf, fps ?? 0);
    _push2(_step_buf, step_ms ?? 0);
    _push2(_heap_buf, heap_mb ?? 0);
    if (!_active || !_fps_ui || !_step_ui || !_heap_ui) return;
    _draw_metric(_fps_ui, _fps_buf, TARGET_FPS, "#4caf50");
    _draw_metric(_step_ui, _step_buf, 16.7, "#2196f3");
    _draw_metric(_heap_ui, _heap_buf, 512, "#ff9800");
  });
}

// packages/ide/src/index.ts
var _alert = show_alert;
var _prompt = show_prompt;
var _confirm = show_confirm;
var _project = null;
var _tree;
var _workspace;
function boot() {
  theme_inject();
  _workspace = document.createElement("div");
  _workspace.id = "sw-workspace";
  document.body.appendChild(_workspace);
  document.body.appendChild(status_bar_create());
  const menubar = menubar_default({
    file_new: on_file_new,
    file_open: on_file_open,
    file_save: on_file_save,
    file_save_as: on_file_save_as,
    res_add_sprite: () => on_add_resource("sprites"),
    res_add_sound: () => on_add_resource("sounds"),
    res_add_background: () => on_add_resource("backgrounds"),
    res_add_path: () => on_add_resource("paths"),
    res_add_script: () => on_add_resource("scripts"),
    res_add_font: () => on_add_resource("fonts"),
    res_add_timeline: () => on_add_resource("timelines"),
    res_add_object: () => on_add_resource("objects"),
    res_add_room: () => on_add_resource("rooms"),
    edit_game_settings: on_edit_game_settings,
    view_resources: () => _tree.show(),
    view_console: () => console_open(_workspace),
    view_debugger: () => debugger_open(_workspace),
    view_profiler: () => profiler_open(_workspace),
    view_preview: () => preview_open(_workspace),
    run_play: on_run_play,
    run_stop: on_run_stop,
    run_build: on_run_build,
    run_export_html5: on_export_html5,
    run_export_win: () => on_export_exe("win32", "x64", "Windows"),
    run_export_mac: () => on_export_exe("darwin", "arm64", "macOS"),
    run_export_linux: () => on_export_exe("linux", "x64", "Linux"),
    help_about: on_help_about
  });
  document.body.appendChild(menubar);
  _tree = new ResourceTree();
  _tree.on_add_resource = on_add_resource;
  _tree.on_delete_resource = on_delete_resource;
  _tree.mount(_workspace);
  document.addEventListener("sw:open_resource", (e) => {
    const { category, name } = e.detail;
    on_open_resource(category, name);
  });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      on_file_save();
    }
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      on_file_new();
    }
    if (e.ctrlKey && e.key === "o") {
      e.preventDefault();
      on_file_open();
    }
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      _on_undo();
    }
    if (e.ctrlKey && (e.key === "y" || e.shiftKey && e.key === "Z")) {
      e.preventDefault();
      _on_redo();
    }
    if (e.key === "F5" && !e.ctrlKey) {
      e.preventDefault();
      on_run_play();
    }
    if (e.key === "F5" && e.ctrlKey) {
      e.preventDefault();
      on_run_build();
    }
    if (e.key === "F8") {
      e.preventDefault();
      bp_resume();
      console_write("system", "[IDE] Resumed.");
    }
    if (e.key === "F9") {
      e.preventDefault();
      debugger_open(_workspace);
    }
    if (e.key === "F10") {
      e.preventDefault();
      profiler_open(_workspace);
    }
    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      _tree.show();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "P") {
      e.preventDefault();
      on_edit_game_settings();
    }
  });
  bp_on_hit((file, line, vars) => {
    debugger_show_hit(_workspace, file, line, vars);
    console_write("warn", `[Debugger] Break at ${file}:${line}`);
  });
  project_open_last().then((result) => {
    if (result) {
      _set_project(result.state, null);
      console_open(_workspace, false);
      console_write("system", `[IDE] Reopened: ${result.state.name}`);
    } else {
      _set_project(project_new(), null);
    }
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "F11") {
      e.preventDefault();
      console_toggle(_workspace);
    }
  });
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "console") {
      console_write(e.data.level, `[Game] ${e.data.message}`);
    }
  });
}
async function on_file_new() {
  const name = await _prompt("Project name:", "My Game") ?? "My Game";
  const state = project_new();
  state.name = name;
  _set_project(state, null);
}
async function on_file_open() {
  const result = await project_open();
  if (!result) return;
  _set_project(result.state, result.dir);
}
async function on_file_save() {
  if (!_project) return;
  try {
    await project_save(_project);
    _mark_saved();
    preview_reload();
    console_write("system", "[IDE] Project saved.");
  } catch (err) {
    if (!project_has_folder()) await on_file_save_as();
    else console_write("warn", "[IDE] Save failed: " + err);
  }
}
async function on_file_save_as() {
  if (!_project) return;
  try {
    if (window.swfs) {
      project_set_folder(null);
      await project_save(_project);
    } else if (typeof window.showDirectoryPicker === "function") {
      let dir;
      try {
        dir = await window.showDirectoryPicker({ mode: "readwrite" });
      } catch {
        return;
      }
      project_set_dir(dir);
      await project_save(_project, dir);
    } else {
      await project_save(_project);
    }
    _mark_saved();
    console_write("system", "[IDE] Project saved.");
  } catch {
    console_write("warn", "[IDE] Save cancelled.");
  }
}
async function on_add_resource(cat) {
  if (!_project) {
    await _alert("Open a project first.");
    return;
  }
  const name = await _prompt(`New ${cat.slice(0, -1)} name:`);
  if (!name) return;
  if (_project.resources[cat][name]) {
    await _alert("A resource with that name already exists.");
    return;
  }
  undo_push({
    label: `Add ${cat.slice(0, -1)} "${name}"`,
    execute: () => {
      _tree.add_resource(cat, name);
      _mark_unsaved();
    },
    unexecute: () => {
      _tree.remove_resource(cat, name);
      _mark_unsaved();
    }
  });
}
async function on_delete_resource(cat, name) {
  if (!await _confirm(`Delete "${name}"?`)) return;
  undo_push({
    label: `Delete ${cat.slice(0, -1)} "${name}"`,
    execute: () => {
      _tree.remove_resource(cat, name);
      _mark_unsaved();
    },
    unexecute: () => {
      _tree.add_resource(cat, name);
      _mark_unsaved();
    }
  });
}
function _on_undo() {
  if (!undo_undo()) console_write("system", "[IDE] Nothing to undo.");
}
function _on_redo() {
  if (!undo_redo()) console_write("system", "[IDE] Nothing to redo.");
}
function on_open_resource(cat, name) {
  switch (cat) {
    case "scripts":
      _open_script(name);
      break;
    case "sprites":
      sprite_editor_open(_workspace, name, _project?.name ?? "");
      break;
    case "objects":
      _open_object(name);
      break;
    case "rooms":
      room_editor_open(_workspace, name);
      break;
    case "sounds":
      sound_editor_open(_workspace, name);
      break;
    case "backgrounds":
      background_editor_open(_workspace, name);
      break;
    case "fonts":
      font_editor_open(_workspace, name);
      break;
    case "paths":
      path_editor_open(_workspace, name);
      break;
    case "timelines":
      timeline_editor_open(_workspace, name);
      break;
    default:
      console.log(`[IDE] Open ${cat}/${name} \u2014 editor not yet implemented`);
  }
}
async function _proj_has(rel) {
  try {
    await project_read_file(rel);
    return true;
  } catch {
    return false;
  }
}
async function _open_object(name) {
  try {
    const class_rel = `objects/${name}.ts`;
    const has_class = await _proj_has(class_rel);
    if (!has_class && await _proj_has(`objects/${name}/object.json`)) {
      object_editor_open(_workspace, name);
      return;
    }
    if (!has_class) {
      const swfs = window.swfs;
      const source = swfs?.object_op ? await swfs.object_op("scaffold", name) : `import { gm_object } from '@silkweaver/engine'

export class ${name} extends gm_object {
    on_create(): void {

    }
}
`;
      await project_write_file(class_rel, source);
    }
    await script_editor_open_smart(_workspace, class_rel, async () => {
      const dir = project_get_dir();
      const objs = await dir.getDirectoryHandle("objects", { create: true });
      return objs.getFileHandle(`${name}.ts`, { create: true });
    });
  } catch (err) {
    console.error("[IDE] Failed to open object:", err);
  }
}
async function _open_script(name) {
  const rel = `scripts/${name}.ts`;
  try {
    await script_editor_open_smart(_workspace, rel, async () => {
      const dir = project_get_dir();
      const scripts_dir = await dir.getDirectoryHandle("scripts", { create: true });
      return scripts_dir.getFileHandle(`${name}.ts`, { create: true });
    });
  } catch (err) {
    console.error("[IDE] Failed to open script:", err);
  }
}
async function on_run_play() {
  if (!_project) {
    await _alert("No project open.\n\nUse File \u2192 Open Project to open a project first.");
    return;
  }
  console_open(_workspace);
  if (window.swfs?.build_game) {
    await on_run_build();
  }
  preview_play(_workspace);
  console_write("system", "[IDE] Running game\u2026 (F8=Resume, F9=Debugger, F10=Profiler)");
}
function on_run_stop() {
  preview_stop();
  console_write("system", "[IDE] Game stopped.");
}
async function _ensure_project_folder() {
  let folder = project_get_folder_path() ?? project_get_last_folder();
  if (folder) {
    project_set_folder(folder);
    try {
      await project_save(_project);
      _mark_saved();
    } catch {
    }
  } else {
    try {
      await project_save(_project);
      _mark_saved();
    } catch {
      return null;
    }
    folder = project_get_folder_path();
  }
  return folder ?? null;
}
async function on_run_build() {
  console_open(_workspace);
  if (!_project) {
    console_write("warn", "[IDE] No project open.");
    return;
  }
  const swfs = window.swfs;
  if (!swfs?.build_game) {
    console_write("warn", "[IDE] Build is only available in the Electron app.");
    return;
  }
  const folder = await _ensure_project_folder();
  if (!folder) {
    console_write("warn", "[IDE] No project folder set.");
    return;
  }
  console_write("system", "[IDE] Building game\u2026");
  const result = await swfs.build_game(folder);
  if (result.ok) {
    console_write("system", "[IDE] Build complete. Press Play to run.");
    preview_reload();
  } else {
    console_write("warn", `[IDE] Build failed:
${result.error}`);
  }
}
async function on_export_html5() {
  console_open(_workspace);
  if (!_project) {
    console_write("warn", "[IDE] No project open.");
    return;
  }
  const swfs = window.swfs;
  if (!swfs?.export_html5) {
    console_write("warn", "[IDE] Export is only available in the Electron app.");
    return;
  }
  const folder = await _ensure_project_folder();
  if (!folder) {
    console_write("warn", "[IDE] No project folder set.");
    return;
  }
  const out_dir = await swfs.pick_folder("save", folder);
  if (!out_dir) {
    console_write("warn", "[IDE] Export cancelled.");
    return;
  }
  console_write("system", `[IDE] Exporting HTML5 build to ${out_dir}\u2026`);
  const result = await swfs.export_html5(folder, out_dir);
  if (result.ok) {
    console_write("system", `[IDE] HTML5 export complete \u2192 ${result.out_dir ?? out_dir}`);
  } else {
    console_write("warn", `[IDE] Export failed:
${result.error}`);
  }
}
async function on_export_exe(platform, arch, label) {
  console_open(_workspace);
  if (!_project) {
    console_write("warn", "[IDE] No project open.");
    return;
  }
  const swfs = window.swfs;
  if (!swfs?.export_exe) {
    console_write("warn", "[IDE] Executable export is only available in the Electron app.");
    return;
  }
  const folder = await _ensure_project_folder();
  if (!folder) {
    console_write("warn", "[IDE] No project folder set.");
    return;
  }
  const out_dir = await swfs.pick_folder("save", folder);
  if (!out_dir) {
    console_write("warn", "[IDE] Export cancelled.");
    return;
  }
  console_write("system", `[IDE] Packaging ${label} build to ${out_dir}\u2026`);
  console_write("system", "[IDE] This can take a minute (first run downloads the Electron runtime).");
  const result = await swfs.export_exe(folder, out_dir, platform, arch);
  if (result.ok) {
    console_write("system", `[IDE] ${label} export complete \u2192 ${result.out_dir ?? out_dir}`);
  } else {
    console_write("warn", `[IDE] ${label} export failed:
${result.error}`);
  }
}
function on_edit_game_settings() {
  if (!_project) {
    _alert("Open a project first.");
    return;
  }
  const room_names = Object.keys(_project.resources.rooms);
  settings_editor_open(_workspace, _project, room_names, _mark_unsaved);
}
async function on_help_about() {
  await _alert("Silkweaver Game Engine IDE\nVersion 0.2.0\nGPL-3.0");
}
function _set_project(state, _dir) {
  _project = state;
  status_set_project(state.name);
  status_set_unsaved(false);
  _tree.load(state);
  document.title = `${state.name} \u2014 Silkweaver IDE`;
  undo_clear();
  inject_project_types(state);
}
function _mark_unsaved() {
  status_set_unsaved(true);
  if (_project) document.title = `\u25CF ${_project.name} \u2014 Silkweaver IDE`;
}
function _mark_saved() {
  status_set_unsaved(false);
  if (_project) document.title = `${_project.name} \u2014 Silkweaver IDE`;
}
boot();
