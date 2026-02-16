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
    padding: 5px 16px;
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
    filter: invert(0.85);
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
.sw-btn img { width: 14px; height: 14px; filter: invert(0.85); }
.sw-checkbox { accent-color: var(--sw-accent); cursor: pointer; }
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
      this.el.style.height = saved.h + "px";
      if (saved.minimized) this.el.classList.add("minimized");
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
    this.el.classList.toggle("minimized");
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

// packages/ide/src/resource_tree.ts
var CATEGORIES = [
  { id: "sprites", label: "Sprites", icon: "icons/sprite.svg" },
  { id: "sounds", label: "Sounds", icon: "icons/sound.svg" },
  { id: "backgrounds", label: "Backgrounds", icon: "icons/background.svg" },
  { id: "paths", label: "Paths", icon: "icons/path.svg" },
  { id: "scripts", label: "Scripts", icon: "icons/script.svg" },
  { id: "fonts", label: "Fonts", icon: "icons/font.svg" },
  { id: "timelines", label: "Timelines", icon: "icons/timeline.svg" },
  { id: "objects", label: "Objects", icon: "icons/object.svg" },
  { id: "rooms", label: "Rooms", icon: "icons/room.svg" }
];
var ResourceTree = class {
  constructor() {
    this._state = null;
    this._category_els = /* @__PURE__ */ new Map();
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
      "icons/folder.svg",
      { x: 8, y: 8, w: 220, h: 500 }
    );
    const container = document.createElement("div");
    container.style.cssText = "overflow-y:auto; height:100%; padding:4px 0;";
    for (const cat of CATEGORIES) {
      container.appendChild(this._build_category(cat));
    }
    this._win.body.appendChild(container);
  }
  // ── Public API ────────────────────────────────────────────────────────
  /** Mount the resource tree window to the workspace. */
  mount(parent) {
    this._win.mount(parent);
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
            padding:3px 6px 3px 8px;
            cursor:pointer;
            color:var(--sw-text);
            background:var(--sw-chrome2);
            border-bottom:1px solid var(--sw-border2);
        `;
    header.style.userSelect = "none";
    const folder_icon = document.createElement("img");
    folder_icon.src = "icons/folder.svg";
    folder_icon.style.cssText = "width:14px;height:14px;filter:invert(0.85);flex-shrink:0;";
    const cat_icon = document.createElement("img");
    cat_icon.src = cat.icon;
    cat_icon.style.cssText = "width:14px;height:14px;filter:invert(0.7);flex-shrink:0;";
    const label = document.createElement("span");
    label.textContent = cat.label;
    label.style.cssText = "flex:1; font-size:12px;";
    const add_btn = _icon_btn("icons/add.svg", "Add", () => {
      this.on_add_resource(cat.id);
    });
    header.append(folder_icon, cat_icon, label, add_btn);
    const list = document.createElement("div");
    list.style.cssText = "display:none;";
    this._category_els.set(cat.id, list);
    header.addEventListener("click", (e) => {
      if (e.target.closest(".sw-icon-btn")) return;
      const is_open = list.style.display !== "none";
      list.style.display = is_open ? "none" : "block";
      folder_icon.src = is_open ? "icons/folder.svg" : "icons/folder_open.svg";
      if (is_open) this._expanded.delete(cat.id);
      else this._expanded.add(cat.id);
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
            padding:2px 6px 2px 28px;
            cursor:pointer;
        `;
    row.style.userSelect = "none";
    const cat_def = CATEGORIES.find((c) => c.id === cat_id);
    const icon = document.createElement("img");
    icon.src = cat_def.icon;
    icon.style.cssText = "width:14px;height:14px;filter:invert(0.7);flex-shrink:0;";
    const label = document.createElement("span");
    label.textContent = name;
    label.style.cssText = "flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;";
    const del_btn = _icon_btn("icons/delete.svg", "Delete", (e) => {
      e.stopPropagation();
      this.on_delete_resource(cat_id, name);
    });
    del_btn.style.display = "none";
    row.append(icon, label, del_btn);
    row.addEventListener("mouseenter", () => {
      del_btn.style.display = "";
    });
    row.addEventListener("mouseleave", () => {
      del_btn.style.display = "none";
    });
    row.addEventListener("mouseenter", () => {
      row.style.background = "var(--sw-select-bg)";
    });
    row.addEventListener("mouseleave", () => {
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
};
function _icon_btn(icon_src, title, cb) {
  const btn = document.createElement("button");
  btn.className = "sw-icon-btn";
  btn.title = title;
  btn.style.cssText = `
        background:none; border:none; cursor:pointer;
        padding:1px; display:flex; align-items:center;
        flex-shrink:0;
    `;
  const img = document.createElement("img");
  img.src = icon_src;
  img.style.cssText = "width:12px;height:12px;filter:invert(0.7);";
  img.addEventListener("mouseenter", () => {
    img.style.filter = "invert(1)";
  });
  img.addEventListener("mouseleave", () => {
    img.style.filter = "invert(0.7)";
  });
  btn.appendChild(img);
  btn.addEventListener("click", cb);
  return btn;
}

// packages/ide/src/services/project.ts
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
      startRoom: ""
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
  let dir;
  try {
    dir = await window.showDirectoryPicker({ mode: "readwrite" });
  } catch {
    return null;
  }
  _dir_handle = dir;
  let state;
  try {
    const file_handle = await dir.getFileHandle("project.json");
    const file = await file_handle.getFile();
    const text = await file.text();
    state = JSON.parse(text);
  } catch {
    state = project_new();
    state.name = dir.name;
  }
  return { state, dir };
}
async function project_save(state, dir) {
  const target = dir ?? _dir_handle;
  if (!target) throw new Error("No project directory open");
  const file_handle = await target.getFileHandle("project.json", { create: true });
  const writable = await file_handle.createWritable();
  await writable.write(JSON.stringify(state, null, 2));
  await writable.close();
}
function project_get_dir() {
  return _dir_handle;
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
    sprite_index: string; image_index: number; image_speed: number;
    image_alpha: number; image_blend: number;
    visible: boolean; solid: boolean; persistent: boolean; depth: number;
    id: number; object_index: string;
    bbox_left: number; bbox_right: number; bbox_top: number; bbox_bottom: number;
    create(): void;
    destroy(): void;
    step(): void;
    step_begin(): void;
    step_end(): void;
    draw(): void;
    draw_gui(): void;
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
declare function make_color_rgb(r: number, g: number, b: number): number;
declare function color_get_red(col: number): number;
declare function color_get_green(col: number): number;
declare function color_get_blue(col: number): number;

// \u2500\u2500 Instances \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare function instance_create(x: number, y: number, obj: string): number;
declare function instance_destroy(id?: number): void;
declare function instance_exists(id: number): boolean;
declare function instance_number(obj: string): number;
declare function instance_find(obj: string, n: number): number;
declare function instance_nearest(x: number, y: number, obj: string): number;
declare function with_object(obj: string | number, fn: (inst: gm_object) => void): void;
declare function place_meeting(x: number, y: number, obj: string): boolean;
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
    strict: true,
    noImplicitAny: true,
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
      insertSpaces: true
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
      scrollBeyondLastLine: false
    });
    this._editor.onDidChangeModelContent(() => {
      this._dirty = true;
      this.on_save(this._editor.getValue());
    });
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
    }
    this._dirty = false;
    this._win.set_title(this._file_handle?.name ?? "script");
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
  _open_editors.set(key, ed);
  ed.on_save = () => {
  };
  ed.on_close(() => _open_editors.delete(key));
  await ed.open(parent, file_handle);
  return ed;
}

// packages/ide/src/index.ts
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
    if (e.key === "F5") {
      e.preventDefault();
      on_run_play();
    }
  });
  _set_project(project_new(), null);
}
async function on_file_new() {
  const name = prompt("Project name:", "My Game");
  if (name === null) return;
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
  } catch {
    await on_file_save_as();
  }
}
async function on_file_save_as() {
  if (!_project) return;
  const result = await project_open();
  if (!result) return;
  await project_save(_project, result.dir);
  _mark_saved();
}
function on_add_resource(cat) {
  if (!_project) {
    alert("Open a project first.");
    return;
  }
  const name = prompt(`New ${cat.slice(0, -1)} name:`);
  if (!name) return;
  if (_project.resources[cat][name]) {
    alert("A resource with that name already exists.");
    return;
  }
  _project.resources[cat][name] = { name };
  _tree.add_resource(cat, name);
  _mark_unsaved();
}
function on_delete_resource(cat, name) {
  if (!confirm(`Delete "${name}"?`)) return;
  _tree.remove_resource(cat, name);
  _mark_unsaved();
}
function on_open_resource(cat, name) {
  if (cat === "scripts") {
    _open_script(name);
    return;
  }
  console.log(`[IDE] Open ${cat}/${name} \u2014 editor not yet implemented`);
}
async function _open_script(name) {
  const dir = project_get_dir();
  if (!dir) {
    alert("Open a project folder first.");
    return;
  }
  try {
    const scripts_dir = await dir.getDirectoryHandle("scripts", { create: true });
    const file_handle = await scripts_dir.getFileHandle(`${name}.ts`, { create: true });
    await script_editor_open(_workspace, file_handle, `scripts/${name}.ts`);
  } catch (err) {
    console.error("[IDE] Failed to open script:", err);
  }
}
function on_run_play() {
  console.log("[IDE] Run: Play");
}
function on_run_stop() {
  console.log("[IDE] Run: Stop");
}
function on_run_build() {
  console.log("[IDE] Run: Build");
}
function on_help_about() {
  alert("Silkweaver Game Engine IDE\nVersion 0.1.0\nGPL-3.0");
}
function _set_project(state, _dir) {
  _project = state;
  status_set_project(state.name);
  status_set_unsaved(false);
  _tree.load(state);
  document.title = `${state.name} \u2014 Silkweaver IDE`;
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
