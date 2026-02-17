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
        { label: "Build Game\u2026", action: actions.run_build }
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
async function project_write_binary(dest_path, file) {
  if (_has_electron()) {
    const fs = _el();
    if (!_folder_path) throw new Error("No project folder open");
    const buf = await file.arrayBuffer();
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
  await writable.write(await file.arrayBuffer());
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
var SW_TYPES = `
// \u2500\u2500 Context \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare var this: gm_object;

declare const enum EVENT_TYPE {
    CREATE = 'create', DESTROY = 'destroy',
    STEP = 'step', STEP_BEGIN = 'step_begin', STEP_END = 'step_end',
    DRAW = 'draw', DRAW_GUI = 'draw_gui',
    ALARM = 'alarm', COLLISION = 'collision',
    KEY_DOWN = 'key_down', KEY_UP = 'key_up',
    MOUSE_DOWN = 'mouse_down', MOUSE_UP = 'mouse_up', MOUSE_MOVE = 'mouse_move',
}

declare class gm_object {
    x: number; y: number; z: number;
    speed: number; direction: number;
    hspeed: number; vspeed: number;
    sprite_index: number; image_index: number; image_speed: number;
    image_xscale: number; image_yscale: number; image_angle: number;
    image_alpha: number; image_blend: number;
    visible: boolean; solid: boolean; persistent: boolean; depth: number;
    id: number; object_index: string;
    bbox_left: number; bbox_right: number; bbox_top: number; bbox_bottom: number;
    mask_index: number;
    gravity: number; gravity_direction: number; friction: number;
    xprevious: number; yprevious: number;
    move_direction: number;  // Custom property example
    [key: string]: any;  // Allow any custom properties

    // Lifecycle methods
    create(): void;
    destroy(): void;
    step(): void;
    step_begin(): void;
    step_end(): void;
    draw(): void;
    draw_gui(): void;

    // Instance methods
    place_meeting(x: number, y: number, obj: any): boolean;
    place_free(x: number, y: number): boolean;
    instance_place(x: number, y: number, obj: any): any;
    instance_destroy(): void;
    draw_self(): void;

    // Event registration
    on(event: EVENT_TYPE, callback: () => void): void;
    timer_create(name: string, steps: number, repeat: boolean, callback: () => void): void;
    timer_destroy(name: string): void;
    timer_exists(name: string): boolean;
}

// \u2500\u2500 Drawing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function draw_sprite(sprite: string, subimg: number, x: number, y: number): void;
declare function draw_sprite_ext(sprite: string, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, blend: number, alpha: number): void;
declare function draw_text(x: number, y: number, str: string): void;
declare function draw_text_color(x: number, y: number, str: string, c1: number, c2: number, c3: number, c4: number, alpha: number): void;
declare function draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
declare function draw_circle(x: number, y: number, r: number, outline: boolean): void;
declare function draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
declare function draw_line(x1: number, y1: number, x2: number, y2: number): void;
declare function draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void;
declare function draw_set_color(col: number): void;
declare function draw_set_alpha(alpha: number): void;
declare function draw_set_font(font: string): void;
declare function draw_set_halign(align: number): void;
declare function draw_set_valign(align: number): void;
declare const fa_left: number; declare const fa_center: number; declare const fa_right: number;
declare const fa_top: number; declare const fa_middle: number; declare const fa_bottom: number;
declare const c_white: number; declare const c_black: number; declare const c_red: number;
declare const c_green: number; declare const c_blue: number; declare const c_yellow: number;
declare const c_orange: number; declare const c_purple: number; declare const c_aqua: number;
declare const c_gray: number; declare const c_silver: number; declare const c_ltgray: number;
declare const c_dkgray: number; declare const c_lime: number; declare const c_maroon: number;
declare const c_navy: number; declare const c_olive: number; declare const c_teal: number;
declare const c_fuchsia: number;
declare function make_color_rgb(r: number, g: number, b: number): number;
declare function color_get_red(col: number): number;
declare function color_get_green(col: number): number;
declare function color_get_blue(col: number): number;

// \u2500\u2500 Instances \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare class instance {
    static instance_create(x: number, y: number, obj: any): any;
    static instance_nearest(x: number, y: number, obj: any): any;
    static instance_destroy_id(id: number): void;
    instance_destroy(): void;
    place_meeting(x: number, y: number, obj: any): boolean;
    place_free(x: number, y: number): boolean;
    instance_place(x: number, y: number, obj: any): any;
}
declare function instance_create(x: number, y: number, obj: any): number;
declare function instance_destroy(id?: number): void;
declare function instance_exists(id: number): boolean;
declare function instance_number(obj: any): number;
declare function instance_find(obj: any, n: number): number;
declare function instance_nearest(x: number, y: number, obj: any): any;
declare function with_object(obj: any, fn: (inst: gm_object) => void): void;
declare function place_meeting(x: number, y: number, obj: any): boolean;
declare function place_free(x: number, y: number): boolean;
declare function move_contact(dir: number, maxdist: number, solid: boolean): void;
declare function move_towards_point(x: number, y: number, sp: number): void;

// \u2500\u2500 Input \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function keyboard_check(key: number): boolean;
declare function keyboard_check_pressed(key: number): boolean;
declare function keyboard_check_released(key: number): boolean;
declare const vk_left: number; declare const vk_right: number;
declare const vk_up: number; declare const vk_down: number;
declare const vk_space: number; declare const vk_enter: number;
declare const vk_escape: number; declare const vk_shift: number;
declare const vk_control: number; declare const vk_alt: number;
declare function mouse_check_button(btn: number): boolean;
declare function mouse_check_button_pressed(btn: number): boolean;
declare function mouse_check_button_released(btn: number): boolean;
declare const mouse_x: number; declare const mouse_y: number;
declare const mb_left: number; declare const mb_right: number; declare const mb_middle: number;

// \u2500\u2500 Audio \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function audio_play_sound(snd: string, priority: number, loop: boolean): number;
declare function audio_stop_sound(id: number): void;
declare function audio_pause_sound(id: number): void;
declare function audio_resume_sound(id: number): void;
declare function audio_is_playing(id: number): boolean;
declare function audio_set_master_gain(gain: number): void;
declare function audio_sound_gain(id: number, gain: number, ms: number): void;

// \u2500\u2500 Rooms \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function room_goto(name: string): void;
declare function room_goto_next(): void;
declare function room_goto_previous(): void;
declare function room_get_name(): string;
declare function room_get_width(): number;
declare function room_get_height(): number;
declare function room_get_speed(): number;

// \u2500\u2500 Math \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function random(n: number): number;
declare function irandom(n: number): number;
declare function random_range(lo: number, hi: number): number;
declare function irandom_range(lo: number, hi: number): number;
declare function choose(...args: number[]): number;
declare function abs(x: number): number; declare function sign(x: number): number;
declare function floor(x: number): number; declare function ceil(x: number): number;
declare function round(x: number): number; declare function frac(x: number): number;
declare function sqr(x: number): number; declare function sqrt(x: number): number;
declare function power(x: number, n: number): number;
declare function log2(x: number): number; declare function log10(x: number): number;
declare function logn(base: number, x: number): number;
declare function lerp(a: number, b: number, t: number): number;
declare function clamp(val: number, lo: number, hi: number): number;
declare function min(...args: number[]): number; declare function max(...args: number[]): number;
declare function mean(...args: number[]): number; declare function median(...args: number[]): number;
declare function lengthdir_x(len: number, dir: number): number;
declare function lengthdir_y(len: number, dir: number): number;
declare function point_distance(x1: number, y1: number, x2: number, y2: number): number;
declare function point_direction(x1: number, y1: number, x2: number, y2: number): number;
declare function angle_difference(a: number, b: number): number;
declare function dsin(deg: number): number; declare function dcos(deg: number): number;
declare function arctan2(y: number, x: number): number;

// \u2500\u2500 Strings \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function string(val: any): string;
declare function real(str: string): number;
declare function string_length(s: string): number;
declare function string_copy(s: string, index: number, count: number): string;
declare function string_pos(sub: string, s: string): number;
declare function string_lower(s: string): string; declare function string_upper(s: string): string;
declare function string_replace(s: string, sub: string, rep: string): string;
declare function string_replace_all(s: string, sub: string, rep: string): string;
declare function string_count(sub: string, s: string): number;
declare function string_delete(s: string, index: number, count: number): string;
declare function string_insert(sub: string, s: string, index: number): string;
declare function string_letters(s: string): string; declare function string_digits(s: string): string;
declare function chr(n: number): string; declare function ord(c: string): number;

// \u2500\u2500 Data structures \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function ds_list_create(): number;
declare function ds_list_destroy(id: number): void;
declare function ds_list_add(id: number, val: any): void;
declare function ds_list_delete(id: number, pos: number): void;
declare function ds_list_find_value(id: number, pos: number): any;
declare function ds_list_find_index(id: number, val: any): number;
declare function ds_list_size(id: number): number;
declare function ds_list_clear(id: number): void;
declare function ds_map_create(): number;
declare function ds_map_destroy(id: number): void;
declare function ds_map_add(id: number, key: any, val: any): void;
declare function ds_map_set(id: number, key: any, val: any): void;
declare function ds_map_delete(id: number, key: any): void;
declare function ds_map_find_value(id: number, key: any): any;
declare function ds_map_exists(id: number, key: any): boolean;
declare function ds_map_size(id: number): number;

// \u2500\u2500 Physics \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function physics_world_create(grav_x: number, grav_y: number): void;
declare function physics_fixture_create(): number;
declare function physics_fixture_set_box_shape(fix: number, hw: number, hh: number): void;
declare function physics_fixture_set_circle_shape(fix: number, r: number): void;
declare function physics_fixture_set_density(fix: number, density: number): void;
declare function physics_fixture_set_restitution(fix: number, res: number): void;
declare function physics_fixture_set_friction(fix: number, fric: number): void;
declare function physics_fixture_bind(fix: number, inst: number): void;
declare function physics_fixture_delete(fix: number): void;
declare function physics_body_apply_force(inst: number, fx: number, fy: number, px: number, py: number): void;
declare function physics_body_apply_impulse(inst: number, ix: number, iy: number, px: number, py: number): void;

// \u2500\u2500 Global \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare const global: Record<string, any>;
declare function show_debug_message(msg: any): void;
declare function show_error(msg: string, abort: boolean): void;
declare function game_end(): void;
declare function game_get_fps(): number;
declare const delta_time: number;
declare const current_time: number;
`;
function _setup_monaco(monaco) {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    SW_TYPES,
    "ts:silkweaver/types.d.ts"
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
    const [r, g, b] = imageData.data;
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
      events: []
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
        this._data.ranges[idx].from = v;
        this._save();
      });
      const to_inp = this._small_number_input(range.to, 0, 65535, (v) => {
        this._data.ranges[idx].to = v;
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
      this._data.points[this._drag_idx].x = Math.round(w.x / GRID2) * GRID2;
      this._data.points[this._drag_idx].y = Math.round(w.y / GRID2) * GRID2;
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
        this._data.moments[data_idx].name = name_inp.value;
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
          this._data.moments[data_idx].step = v;
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
  const cur = buf[buf.length - 1];
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
      object_editor_open(_workspace, name);
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
      console_write("warn", "[IDE] No project folder \u2014 save cancelled.");
      return;
    }
    folder = project_get_folder_path();
  }
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
