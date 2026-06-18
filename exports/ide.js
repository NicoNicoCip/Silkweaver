// packages/ide/src/theme.ts
function theme_inject() {
  const style = document.createElement("style");
  style.textContent = /*css*/
  `
/* \u2500\u2500 Inline SVG icons (toolbar + resource tree); no font dependency \u2500\u2500 */
#sw-toolbar .sw-tb-btn svg { width: 16px; height: 16px; }
.sw-tree-cat-glyph svg, .sw-tree-item-glyph svg { width: 13px; height: 13px; vertical-align: middle; }

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
    --sw-toolbar-h:  30px;
    --sw-statusbar-h:20px;
}

/* \u2500\u2500 Scrollbars \u2500\u2500 */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--sw-chrome); }
::-webkit-scrollbar-thumb { background: #666; }
::-webkit-scrollbar-thumb:hover { background: #888; }

/* \u2500\u2500 Frame layout: menubar \xB7 toolbar \xB7 [dock | splitter | workspace] \xB7 statusbar \u2500\u2500 */
#sw-toolbar {
    position: fixed;
    top: var(--sw-menubar-h); left: 0; right: 0;
    height: var(--sw-toolbar-h);
    background: var(--sw-chrome);
    border-bottom: 1px solid var(--sw-border);
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px;
    z-index: 8999;
}
.sw-tb-btn {
    min-width: 26px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: 1px solid transparent;
    color: var(--sw-text); cursor: pointer;
    font-size: 13px; line-height: 1; padding: 0 4px;
}
.sw-tb-btn:hover  { background: var(--sw-accent); border-color: var(--sw-accent-hov); }
.sw-tb-btn:active { background: var(--sw-accent-hov); }
.sw-tb-sep { width: 1px; height: 18px; background: var(--sw-border); margin: 0 5px; flex-shrink: 0; }

#sw-main {
    position: fixed;
    top: calc(var(--sw-menubar-h) + var(--sw-toolbar-h));
    left: 0; right: 0;
    bottom: var(--sw-statusbar-h);
    display: flex;
    overflow: hidden;
}
#sw-dock {
    width: 240px; min-width: 150px; max-width: 600px;
    flex-shrink: 0;
    overflow: auto;
    background: var(--sw-chrome2);
}
#sw-dock.sw-dock-hidden,
#sw-dock.sw-dock-hidden + #sw-splitter { display: none; }
#sw-splitter {
    width: 5px; flex-shrink: 0;
    cursor: col-resize;
    background: var(--sw-chrome);
    border-left: 1px solid var(--sw-border);
    border-right: 1px solid var(--sw-border);
}
#sw-splitter:hover { background: var(--sw-accent); }
#sw-workspace {
    flex: 1; min-width: 0;
    position: relative;
    overflow: hidden;
    background: var(--sw-workspace);
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

/* \u2500\u2500 Context menu (right-click) \u2500\u2500 */
.sw-ctxmenu {
    position: fixed;
    z-index: 10000;
    background: var(--sw-chrome);
    border: 1px solid var(--sw-border);
    box-shadow: 0 3px 12px rgba(0,0,0,0.45);
    padding: 3px 0;
    min-width: 168px;
    font-size: 12px;
}
.sw-ctxmenu-item {
    display: flex; align-items: center; gap: 8px;
    height: 25px; padding: 0 14px 0 8px;
    cursor: pointer; color: var(--sw-text); white-space: nowrap;
}
.sw-ctxmenu-item:hover { background: var(--sw-accent); }
.sw-ctxmenu-item.disabled { color: var(--sw-text-dim); cursor: default; }
.sw-ctxmenu-item.disabled:hover { background: none; }
.sw-ctxmenu-icon { width: 15px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: var(--sw-text-dim); }
.sw-ctxmenu-icon svg { width: 14px; height: 14px; }
.sw-ctxmenu-item:hover .sw-ctxmenu-icon { color: #fff; }
.sw-ctxmenu-sep { height: 1px; background: var(--sw-border); margin: 3px 0; }

/* \u2500\u2500 Resource-tree root (project) node \u2500\u2500 */
.sw-tree-root {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 6px; cursor: default;
    border-bottom: 1px solid var(--sw-border2);
    color: var(--sw-text);
}
.sw-tree-root .sw-tree-cat-glyph { color: var(--sw-accent); }
.sw-tree-root-label { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* \u2500\u2500 Resource-tree filter box (sticky at the top of the dock) \u2500\u2500 */
.sw-tree-filter {
    position: sticky; top: 0; z-index: 2;
    padding: 6px;
    background: var(--sw-chrome2);
    border-bottom: 1px solid var(--sw-border);
}
.sw-tree-filter .sw-input { height: 24px; font-size: 12px; }

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
.sw-window-btn.close:hover { background: var(--sw-close-hov); color: #fff; }
.sw-window-btn.close:active { background: var(--sw-close-act); }

/* Small inline delete / clear button (\u2715) \u2014 used by list rows in the editors.
   Subtle at rest, turns red and brightens on hover so it reads as a destructive action. */
.sw-x-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px; height: 18px;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 3px;
    background: none;
    color: var(--sw-text-dim);
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.1s ease, color 0.1s ease;
}
.sw-x-btn:hover  { background: var(--sw-close-hov); color: #fff; }
.sw-x-btn:active { background: var(--sw-close-act); color: #fff; }
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
    width: 230px;
    min-width: 230px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--sw-border);
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
  const label = document.createElement("span");
  label.textContent = def.label;
  item.appendChild(label);
  const dropdown = document.createElement("div");
  dropdown.className = "sw-dropdown";
  item.appendChild(dropdown);
  const render = (items) => {
    dropdown.innerHTML = "";
    for (const entry of items) {
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
  };
  render(def.items);
  item.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    if (e.target.closest(".sw-dropdown")) return;
    const bar = item.closest("#sw-menubar");
    const was_open = item.classList.contains("open");
    _close_all(bar);
    if (!was_open) {
      if (def.dynamic) render([...def.items, ...def.dynamic()]);
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
      label: "Window",
      items: [
        { label: "Cascade", action: actions.window_cascade },
        { label: "Tile", action: actions.window_tile },
        { separator: true },
        { label: "Minimize All", action: actions.window_minimize_all },
        { label: "Close All", action: actions.window_close_all }
      ],
      dynamic: () => {
        const wins = actions.window_list();
        if (wins.length === 0) return [];
        return [{ separator: true }, ...wins.map((w) => ({ label: w.title, action: w.focus }))];
      }
    },
    {
      label: "Help",
      items: [
        { label: "Documentation", shortcut: "F1", action: actions.help_docs },
        { separator: true },
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

// packages/ide/src/icons.ts
var _svg = (body, filled = false) => `<svg viewBox="0 0 24 24" ${filled ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
var ICON = {
  new_file: _svg('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>'),
  open: _svg('<path d="M3 6h6l2 2h10v10H3z"/>'),
  save: _svg('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="7"/>'),
  sprite: _svg('<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 16l-5-5-4 4-2-2-4 4"/>'),
  sound: _svg('<path d="M9 17V4l11-2v13"/><circle cx="6" cy="17" r="2.6"/><circle cx="17" cy="15" r="2.6"/>'),
  background: _svg('<path d="M4 7l8-4 8 4-8 4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/>'),
  path: _svg('<path d="M5 18C5 10 8 6 12 6s7 4 7 12"/><circle cx="5" cy="18" r="1.7"/><circle cx="19" cy="18" r="1.7"/>'),
  script: _svg('<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/>'),
  font: _svg('<path d="M5 20L12 4l7 16"/><path d="M8 14h8"/>'),
  timeline: _svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'),
  object: _svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'),
  room: _svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
  play: _svg('<path d="M8 5v14l11-7z"/>', true),
  stop: _svg('<rect x="6" y="6" width="12" height="12" rx="1"/>', true),
  build: _svg('<path d="M13 4l7 7-2.5 2.5-7-7z"/><path d="M11.5 5.5l-8 8 3 3 8-8"/>'),
  settings: _svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
  delete: _svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  project: _svg('<rect x="2.5" y="8" width="19" height="9" rx="4.5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>'),
  help: _svg('<path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z"/>')
};

// packages/ide/src/services/context_menu.ts
var _open = null;
function close_context_menu() {
  if (_open) {
    _open.remove();
    _open = null;
  }
}
function show_context_menu(x, y, items) {
  close_context_menu();
  const menu = document.createElement("div");
  menu.className = "sw-ctxmenu";
  for (const it of items) {
    if (it.separator) {
      const s = document.createElement("div");
      s.className = "sw-ctxmenu-sep";
      menu.appendChild(s);
      continue;
    }
    const el = document.createElement("div");
    el.className = "sw-ctxmenu-item" + (it.disabled ? " disabled" : "");
    const icon = document.createElement("span");
    icon.className = "sw-ctxmenu-icon";
    icon.innerHTML = it.icon ?? "";
    const text = document.createElement("span");
    text.textContent = it.label ?? "";
    el.append(icon, text);
    if (!it.disabled && it.action) {
      el.addEventListener("click", () => {
        close_context_menu();
        it.action();
      });
    }
    menu.appendChild(el);
  }
  document.body.appendChild(menu);
  const r = menu.getBoundingClientRect();
  menu.style.left = Math.max(2, Math.min(x, window.innerWidth - r.width - 4)) + "px";
  menu.style.top = Math.max(2, Math.min(y, window.innerHeight - r.height - 4)) + "px";
  _open = menu;
}
document.addEventListener("mousedown", (e) => {
  if (_open && !_open.contains(e.target)) close_context_menu();
}, true);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") close_context_menu();
});
window.addEventListener("blur", close_context_menu);

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
    engineVersion: "1.0.0",
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
async function project_rename(rel_old, rel_new) {
  const fs = _el();
  if (!fs || !_folder_path) throw new Error("Rename requires the desktop app with a saved project folder.");
  await fs.rename(fs.join(_folder_path, ...rel_old.split("/")), fs.join(_folder_path, ...rel_new.split("/")));
}
async function project_copy(rel_src, rel_dst) {
  const fs = _el();
  if (!fs || !_folder_path) throw new Error("Duplicate requires the desktop app with a saved project folder.");
  await fs.copy(fs.join(_folder_path, ...rel_src.split("/")), fs.join(_folder_path, ...rel_dst.split("/")));
}
async function project_delete(rel_path) {
  const fs = _el();
  if (fs && _folder_path) {
    await fs.delete_path(fs.join(_folder_path, ...rel_path.split("/")));
    return;
  }
  const dir = _dir_handle;
  if (!dir) throw new Error("Delete requires an open project.");
  const parts = rel_path.split("/");
  let current = dir;
  for (let i = 0; i < parts.length - 1; i++) current = await current.getDirectoryHandle(parts[i], { create: false });
  await current.removeEntry(parts[parts.length - 1], { recursive: true });
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
  { id: "sprites", label: "Sprites", glyph: ICON.sprite },
  // ▤  image grid
  { id: "sounds", label: "Sounds", glyph: ICON.sound },
  // ♪  music note
  { id: "backgrounds", label: "Backgrounds", glyph: ICON.background },
  // █  solid block
  { id: "paths", label: "Paths", glyph: ICON.path },
  // ⤢  crossed arrows
  { id: "scripts", label: "Scripts", glyph: ICON.script },
  // {  brace
  { id: "fonts", label: "Fonts", glyph: ICON.font },
  //    letter A
  { id: "timelines", label: "Timelines", glyph: ICON.timeline },
  // ⏱  clock
  { id: "objects", label: "Objects", glyph: ICON.object },
  // ○  circle
  { id: "rooms", label: "Rooms", glyph: ICON.room }
  // ⎕  rectangle
];
var ResourceTree = class {
  constructor() {
    this._dock = null;
    this._root_label = null;
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
    this.on_duplicate_resource = () => {
    };
    this._container = document.createElement("div");
    this._container.style.cssText = "padding:0 0 2px;";
    this._container.appendChild(this._build_root());
    for (const cat of CATEGORIES) {
      this._container.appendChild(this._build_category(cat));
    }
    document.addEventListener("sw:resource_changed", (e) => {
      const detail = e.detail;
      if (detail?.category && this._state) this._refresh_category(detail.category);
    });
  }
  /** Builds the project root node (shows the project name). */
  _build_root() {
    const root = document.createElement("div");
    root.className = "sw-tree-root";
    const icon = document.createElement("span");
    icon.className = "sw-tree-cat-glyph";
    icon.innerHTML = ICON.project;
    this._root_label = document.createElement("span");
    this._root_label.className = "sw-tree-root-label";
    this._root_label.textContent = "No project";
    root.append(icon, this._root_label);
    root.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      show_context_menu(e.clientX, e.clientY, [
        { label: "Expand All", action: () => this.expand_all() },
        { label: "Collapse All", action: () => this.collapse_all() }
      ]);
    });
    return root;
  }
  // ── Public API ────────────────────────────────────────────────────────
  /** Mount the tree into the docked panel. */
  mount(dock) {
    this._dock = dock;
    dock.appendChild(this._build_filter());
    dock.appendChild(this._container);
  }
  /** Builds the resource filter box (sticky at the top of the dock). */
  _build_filter() {
    const wrap = document.createElement("div");
    wrap.className = "sw-tree-filter";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "4px";
    const input = document.createElement("input");
    input.type = "search";
    input.className = "sw-input";
    input.placeholder = "Filter resources\u2026";
    input.style.flex = "1";
    input.style.minWidth = "0";
    input.addEventListener("input", () => this._apply_filter(input.value));
    const expand_btn = _text_btn("\u2295", "Expand all", () => this.expand_all());
    const collapse_btn = _text_btn("\u2296", "Collapse all", () => this.collapse_all());
    wrap.append(input, expand_btn, collapse_btn);
    return wrap;
  }
  /**
   * Filters the tree by resource name. A non-empty query hides non-matching rows, auto-expands
   * categories that have matches, and hides categories with none. Clearing it restores the tree.
   */
  _apply_filter(query) {
    const q = query.trim().toLowerCase();
    for (const cat of CATEGORIES) {
      const list = this._category_els.get(cat.id);
      if (!list) continue;
      const wrapper = list.parentElement;
      const arrow = this._arrows.get(cat.id);
      const rows = Array.from(list.children);
      if (q === "") {
        if (wrapper) wrapper.style.display = "";
        for (const row of rows) row.style.display = "";
        const expanded = this._expanded.has(cat.id);
        list.style.display = expanded ? "block" : "none";
        arrow?.classList.toggle("open", expanded);
        continue;
      }
      let matches = 0;
      for (const row of rows) {
        const show = (row.dataset.name ?? "").toLowerCase().includes(q);
        row.style.display = show ? "" : "none";
        if (show) matches++;
      }
      if (matches > 0) {
        if (wrapper) wrapper.style.display = "";
        list.style.display = "block";
        arrow?.classList.add("open");
      } else if (wrapper) {
        wrapper.style.display = "none";
      }
    }
  }
  /** Toggle the docked resource panel's visibility. */
  show() {
    this._dock?.classList.toggle("sw-dock-hidden");
  }
  /** Populate the tree from a loaded project state. */
  load(state) {
    this._state = state;
    if (this._root_label) this._root_label.textContent = state.name || "Untitled";
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
    glyph.innerHTML = cat.glyph;
    const label = document.createElement("span");
    label.textContent = cat.label;
    label.style.cssText = "flex:1; font-size:12px;";
    const add_btn = _text_btn("+", "Add", () => {
      this.on_add_resource(cat.id);
    });
    header.append(arrow, glyph, label, add_btn);
    header.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const list_el = this._category_els.get(cat.id);
      const expanded = !!list_el && list_el.style.display !== "none";
      show_context_menu(e.clientX, e.clientY, [
        { label: `Create ${cat.label.slice(0, -1)}`, icon: cat.glyph, action: () => this.on_add_resource(cat.id) },
        { separator: true },
        { label: expanded ? "Collapse" : "Expand", action: () => header.click() }
      ]);
    });
    const list = document.createElement("div");
    list.style.cssText = "display:none;";
    this._category_els.set(cat.id, list);
    header.addEventListener("click", (e) => {
      if (e.target.closest(".sw-tree-btn")) return;
      this._set_expanded(cat.id, list.style.display === "none");
    });
    wrapper.append(header, list);
    return wrapper;
  }
  // ── Expand / collapse ───────────────────────────────────────────────────
  /** Sets a category's expanded state (updates the list, arrow, and tracking set). */
  _set_expanded(cat_id, expanded) {
    const list = this._category_els.get(cat_id);
    const arrow = this._arrows.get(cat_id);
    if (!list) return;
    list.style.display = expanded ? "block" : "none";
    arrow?.classList.toggle("open", expanded);
    if (expanded) this._expanded.add(cat_id);
    else this._expanded.delete(cat_id);
  }
  /** Expands a single category (used after creating a resource). */
  expand_category(cat_id) {
    this._set_expanded(cat_id, true);
  }
  /** Expands every category. */
  expand_all() {
    for (const c of CATEGORIES) this._set_expanded(c.id, true);
  }
  /** Collapses every category. */
  collapse_all() {
    for (const c of CATEGORIES) this._set_expanded(c.id, false);
  }
  /**
   * Starts inline (in-place) renaming of a resource row, Windows-Explorer style:
   * the label becomes a text field pre-filled with the name (selected). Enter commits
   * (fires on_rename_resource); Escape cancels; blur commits.
   */
  begin_rename(cat_id, name) {
    this._set_expanded(cat_id, true);
    const list = this._category_els.get(cat_id);
    if (!list) return;
    const row = Array.from(list.children).find((r) => r.dataset.name === name);
    const label = row?.querySelector(".sw-tree-item-label");
    if (!row || !label) return;
    const input = document.createElement("input");
    input.className = "sw-input";
    input.value = name;
    input.style.cssText = "flex:1; min-width:0; font-size:12px; height:18px; padding:0 3px;";
    label.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const finish = (commit) => {
      if (done) return;
      done = true;
      const new_name = input.value.trim();
      input.replaceWith(label);
      if (commit && new_name && new_name !== name) this.on_rename_resource(cat_id, name, new_name);
    };
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    });
    input.addEventListener("blur", () => finish(true));
    input.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("dblclick", (e) => e.stopPropagation());
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
    row.dataset.name = name;
    row.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:22px; padding:0 6px 0 28px;
            cursor:pointer;
        `;
    row.style.userSelect = "none";
    const icon_el = this._make_item_icon(cat_id, name);
    const label = document.createElement("span");
    label.className = "sw-tree-item-label";
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
    const open = () => document.dispatchEvent(new CustomEvent("sw:open_resource", {
      bubbles: true,
      detail: { category: cat_id, name }
    }));
    row.addEventListener("dblclick", open);
    row.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      show_context_menu(e.clientX, e.clientY, [
        { label: "Open", icon: ICON.open, action: open },
        { separator: true },
        { label: "Rename", action: () => this.begin_rename(cat_id, name) },
        { label: "Duplicate", action: () => this.on_duplicate_resource(cat_id, name) },
        { separator: true },
        { label: "Delete", icon: ICON.delete, action: () => this.on_delete_resource(cat_id, name) }
      ]);
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
    span.innerHTML = cat_def.glyph;
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
var FloatingWindow = class _FloatingWindow {
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
    this._icon_el = _make_window_icon(icon_src);
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
    titlebar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".sw-window-btn")) return;
      this.toggle_maximize();
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
  static {
    /** Registry of every currently-open (mounted) window, for MDI management. */
    this._open = /* @__PURE__ */ new Set();
  }
  // ── Public API ────────────────────────────────────────────────────────
  /** Append window to a parent element and make it visible. */
  mount(parent) {
    parent.appendChild(this.el);
    _FloatingWindow._open.add(this);
    return this;
  }
  /** Set the window title text. */
  set_title(title) {
    this._title_el.textContent = title;
  }
  /** Set the title bar icon (accepts an inline SVG string or an image URL). */
  set_icon(src) {
    const next = _make_window_icon(src);
    this._icon_el.replaceWith(next);
    this._icon_el = next;
  }
  /** Bring this window to the top of the z stack. */
  bring_to_front() {
    this.el.style.zIndex = String(_next_z());
  }
  /** Returns the window's current title text. */
  get_title() {
    return this._title_el.textContent ?? "";
  }
  /** Restore (if minimized) and bring this window to the front. */
  focus() {
    if (this.el.classList.contains("minimized")) this.toggle_minimize();
    this.bring_to_front();
  }
  /** Clears the maximized flag (cascade/tile set an explicit rect instead). */
  _unmaximize() {
    this._maximized = false;
    this._max_btn.textContent = "\u25A1";
  }
  // ── MDI management (static, across all open windows) ────────────────────
  /** Every currently-open window. */
  static list() {
    return [..._FloatingWindow._open];
  }
  /** Cascade all open windows from the top-left of the workspace. */
  static cascade() {
    const ws = document.getElementById("sw-workspace");
    if (!ws) return;
    let i = 0;
    for (const w of _FloatingWindow._open) {
      w._unmaximize();
      w.el.classList.remove("minimized");
      const off = i % 12 * 26;
      w.el.style.left = 8 + off + "px";
      w.el.style.top = 8 + off + "px";
      w.el.style.width = Math.min(680, Math.max(320, ws.offsetWidth - 80)) + "px";
      w.el.style.height = Math.min(460, Math.max(200, ws.offsetHeight - 80)) + "px";
      w.bring_to_front();
      i++;
    }
  }
  /** Tile all open windows in a grid filling the workspace. */
  static tile() {
    const ws = document.getElementById("sw-workspace");
    if (!ws) return;
    const wins = [..._FloatingWindow._open];
    if (wins.length === 0) return;
    const cols = Math.ceil(Math.sqrt(wins.length));
    const rows = Math.ceil(wins.length / cols);
    const cw = Math.floor(ws.offsetWidth / cols);
    const ch = Math.floor(ws.offsetHeight / rows);
    wins.forEach((w, idx) => {
      w._unmaximize();
      w.el.classList.remove("minimized");
      const c = idx % cols, r = Math.floor(idx / cols);
      w.el.style.left = c * cw + "px";
      w.el.style.top = r * ch + "px";
      w.el.style.width = cw + "px";
      w.el.style.height = ch + "px";
      w.bring_to_front();
    });
  }
  /** Minimize every open window. */
  static minimize_all() {
    for (const w of _FloatingWindow._open) {
      if (!w.el.classList.contains("minimized")) w.toggle_minimize();
    }
  }
  /** Close every open window. */
  static close_all() {
    for (const w of [..._FloatingWindow._open]) w.close();
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
    _FloatingWindow._open.delete(this);
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
function _make_window_icon(src) {
  if (src && src.trimStart().startsWith("<svg")) {
    const span = document.createElement("span");
    span.className = "sw-window-icon";
    span.style.cssText = "display:inline-flex; align-items:center; width:14px; height:14px; flex-shrink:0;";
    span.innerHTML = src;
    const svg = span.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "100%";
    }
    return span;
  }
  const img = document.createElement("img");
  img.className = "sw-window-icon";
  img.src = src ?? "";
  img.style.display = src ? "" : "none";
  return img;
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
var ENGINE_DTS = "/**\n * 3D lighting system.\n *\n * Mirrors the GMS d3d_light_* API.\n * Supports up to 8 directional and point lights, plus ambient light.\n *\n * Light data is uploaded as uniforms to 3D shader programs via\n * d3d_light_get_uniforms(), which returns a flat uniform block\n * for use with shader_set_uniform_*.\n */\ndeclare const d3d_lighttype_directional = 0;\ndeclare const d3d_lighttype_point = 1;\ndeclare const MAX_LIGHTS = 8;\ninterface light_def {\n    enabled: boolean;\n    type: number;\n    x: number;\n    y: number;\n    z: number;\n    r: number;\n    g: number;\n    b: number;\n    range: number;\n}\n/**\n * Enables or disables a light slot.\n * @param light_index - Light index (0\u20137)\n * @param enabled - True to enable\n */\ndeclare function d3d_light_enable(light_index: number, enabled: boolean): void;\n/**\n * Defines a directional light.\n * @param light_index - Light index (0\u20137)\n * @param dx - Direction X (world space)\n * @param dy - Direction Y\n * @param dz - Direction Z\n * @param col - BGR colour integer\n */\ndeclare function d3d_light_define_direction(light_index: number, dx: number, dy: number, dz: number, col: number): void;\n/**\n * Defines a point light.\n * @param light_index - Light index (0\u20137)\n * @param x - Position X\n * @param y - Position Y\n * @param z - Position Z\n * @param range - Falloff range in world units\n * @param col - BGR colour integer\n */\ndeclare function d3d_light_define_point(light_index: number, x: number, y: number, z: number, range: number, col: number): void;\n/**\n * Sets the ambient light colour.\n * @param col - BGR colour integer\n */\ndeclare function d3d_light_set_ambient(col: number): void;\n/**\n * Returns a flat object of uniform values for uploading to a 3D shader.\n * The shader is expected to declare:\n *   uniform vec3  u_ambient;\n *   uniform int   u_light_count;\n *   uniform int   u_light_types[8];\n *   uniform vec3  u_light_pos[8];   // direction for directional lights\n *   uniform vec3  u_light_color[8];\n *   uniform float u_light_range[8];\n */\ndeclare function d3d_light_get_uniforms(): {\n    ambient: Float32Array;\n    count: number;\n    types: Int32Array;\n    positions: Float32Array;\n    colors: Float32Array;\n    ranges: Float32Array;\n};\n/** Returns the raw light definition array for advanced use. */\ndeclare function d3d_light_get_all(): Readonly<light_def>[];\n\n//# sourceMappingURL=lighting_3d.d.ts.map\n/**\n * 3D model system \u2014 vertex buffers for WebGL 2.\n *\n * Mirrors the GMS d3d_model_* API:\n *   d3d_model_create, d3d_model_destroy, d3d_model_draw\n *   d3d_model_primitive_begin, d3d_model_primitive_end\n *   d3d_model_vertex, d3d_model_vertex_normal, d3d_model_vertex_texture\n *   d3d_model_block, d3d_model_cylinder, d3d_model_sphere, d3d_model_cone\n *\n * Vertex format: [x, y, z, nx, ny, nz, u, v] (32 bytes per vertex)\n * Primitive types match WebGL draw modes.\n */\ndeclare const pr_pointlist = 0;\ndeclare const pr_linelist = 1;\ndeclare const pr_linestrip = 2;\ndeclare const pr_trianglelist = 4;\ndeclare const pr_trianglestrip = 5;\ndeclare const pr_trianglefan = 6;\ninterface model_mesh {\n    primitive: number;\n    vertices: Float32Array;\n    vbo: WebGLBuffer | null;\n    dirty: boolean;\n}\ninterface model_def {\n    meshes: model_mesh[];\n    building: boolean;\n    build_prim: number;\n    build_verts: number[];\n}\n/** Returns the raw model state for internal use by model_loader.ts. */\ndeclare function _get_model_raw(model_id: number): model_def | undefined;\n/** Creates a new empty 3D model and returns its ID. */\ndeclare function d3d_model_create(): number;\n/** Destroys a model and frees its GPU resources. */\ndeclare function d3d_model_destroy(model_id: number): void;\n/** Returns true if the model ID is valid. */\ndeclare function d3d_model_exists(model_id: number): boolean;\n/** Clears all meshes from a model. */\ndeclare function d3d_model_clear(model_id: number): void;\n/**\n * Begins recording vertices for a primitive.\n * @param model_id - Model ID\n * @param kind - pr_* primitive type\n */\ndeclare function d3d_model_primitive_begin(model_id: number, kind: number): void;\n/**\n * Finishes recording vertices and adds the mesh to the model.\n * @param model_id - Model ID\n */\ndeclare function d3d_model_primitive_end(model_id: number): void;\n/**\n * Adds a vertex at (x, y, z) using the current normal and UV.\n */\ndeclare function d3d_model_vertex(model_id: number, x: number, y: number, z: number): void;\n/**\n * Adds a vertex with an explicit normal.\n */\ndeclare function d3d_model_vertex_normal(model_id: number, x: number, y: number, z: number, nx: number, ny: number, nz: number): void;\n/**\n * Adds a vertex with UV texture coordinates and explicit normal.\n */\ndeclare function d3d_model_vertex_texture(model_id: number, x: number, y: number, z: number, u: number, v: number): void;\n/**\n * Sets the normal to use for subsequent vertices.\n */\ndeclare function d3d_model_set_normal(nx: number, ny: number, nz: number): void;\n/**\n * Sets the UV to use for subsequent vertices.\n */\ndeclare function d3d_model_set_uv(u: number, v: number): void;\n/** Adds a box (cuboid) mesh to the model. */\ndeclare function d3d_model_block(model_id: number, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, hrepeat?: number, vrepeat?: number): void;\n/**\n * Adds a sphere mesh.\n * @param model_id - Model ID\n * @param x, y, z - Centre position\n * @param r - Radius\n * @param hsteps - Horizontal subdivisions (\u22653)\n * @param vsteps - Vertical subdivisions (\u22652)\n */\ndeclare function d3d_model_sphere(model_id: number, x: number, y: number, z: number, r: number, hsteps?: number, vsteps?: number): void;\n/**\n * Draws a model using the currently active shader and transform.\n * The caller is responsible for setting up a 3D shader with the\n * u_model, u_view, u_projection uniforms before calling this.\n * @param model_id - Model ID\n * @param x, y, z - World position offset\n */\ndeclare function d3d_model_draw(model_id: number, x?: number, y?: number, z?: number): void;\n\n//# sourceMappingURL=model.d.ts.map\n/**\n * 3D model loader \u2014 loads OBJ files into d3d models.\n *\n * Supports Wavefront OBJ format (vertices, normals, texture coordinates,\n * triangulated faces).  Does not support materials (MTL files).\n *\n * Usage:\n *   const model_id = model_load_obj(obj_source_string)\n *   d3d_model_draw(model_id, x, y, z)\n *\n * glTF loading is intentionally deferred \u2014 OBJ covers the common simple-model\n * use case and has no external dependencies.\n */\n/**\n * Creates a d3d model from an OBJ source string.\n * @param obj_src - Contents of the .obj file\n * @returns Model ID\n */\ndeclare function model_load_obj(obj_src: string): number;\n/**\n * Fetches an OBJ file from a URL and returns a model ID.\n * @param url - URL of the .obj file\n * @returns Promise resolving to model ID, or -1 on failure\n */\ndeclare function model_load_obj_url(url: string): Promise<number>;\n//# sourceMappingURL=model_loader.d.ts.map\n/**\n * 3D transform matrix stack.\n *\n * Mirrors the GMS d3d_transform_* API.\n * Matrices are column-major Float32Array (matches WebGL layout).\n *\n * The transform stack is used when drawing 3D models.\n * The current transform (top of stack) is applied as a model matrix.\n */\ntype mat4 = Float32Array;\n/** Returns a 4\xD74 identity matrix. */\ndeclare function mat4_identity(): mat4;\n/** Multiplies two 4\xD74 column-major matrices: result = a * b. */\ndeclare function mat4_mul(a: mat4, b: mat4): mat4;\n/** Returns a translation matrix. */\ndeclare function mat4_translate(tx: number, ty: number, tz: number): mat4;\n/** Returns a uniform scale matrix. */\ndeclare function mat4_scale(sx: number, sy: number, sz: number): mat4;\n/** Returns a rotation matrix around the X axis (angle in degrees). */\ndeclare function mat4_rotate_x(deg: number): mat4;\n/** Returns a rotation matrix around the Y axis (angle in degrees). */\ndeclare function mat4_rotate_y(deg: number): mat4;\n/** Returns a rotation matrix around the Z axis (angle in degrees). */\ndeclare function mat4_rotate_z(deg: number): mat4;\n/** Returns a perspective projection matrix. */\ndeclare function mat4_perspective(fov_deg: number, aspect: number, near: number, far: number): mat4;\n/** Returns a look-at view matrix. */\ndeclare function mat4_look_at(ex: number, ey: number, ez: number, tx: number, ty: number, tz: number, ux: number, uy: number, uz: number): mat4;\n/** Returns an orthographic projection matrix. */\ndeclare function mat4_ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4;\n/** Returns the current model matrix (top of stack). */\ndeclare function d3d_transform_get(): mat4;\n/** Resets the current transform to identity. */\ndeclare function d3d_transform_set_identity(): void;\n/**\n * Sets the transform to a translation.\n * @param x - X translation\n * @param y - Y translation\n * @param z - Z translation\n */\ndeclare function d3d_transform_set_translation(x: number, y: number, z: number): void;\n/**\n * Sets the transform to a scale.\n * @param sx - X scale\n * @param sy - Y scale\n * @param sz - Z scale\n */\ndeclare function d3d_transform_set_scaling(sx: number, sy: number, sz: number): void;\n/**\n * Sets the transform to a rotation around an axis.\n * @param xa - X component of rotation axis\n * @param ya - Y component of rotation axis\n * @param za - Z component of rotation axis\n * @param deg - Angle in degrees\n */\ndeclare function d3d_transform_set_rotation(xa: number, ya: number, _za: number, deg: number): void;\n/** Adds a translation to the current transform. */\ndeclare function d3d_transform_add_translation(x: number, y: number, z: number): void;\n/** Adds a scaling to the current transform. */\ndeclare function d3d_transform_add_scaling(sx: number, sy: number, sz: number): void;\n/** Adds a rotation around the X axis. */\ndeclare function d3d_transform_add_rotation_x(deg: number): void;\n/** Adds a rotation around the Y axis. */\ndeclare function d3d_transform_add_rotation_y(deg: number): void;\n/** Adds a rotation around the Z axis. */\ndeclare function d3d_transform_add_rotation_z(deg: number): void;\n/** Pushes the current transform onto the stack (save state). */\ndeclare function d3d_transform_stack_push(): void;\n/** Pops the transform stack (restore state). */\ndeclare function d3d_transform_stack_pop(): void;\n/** Clears the stack back to a single identity matrix. */\ndeclare function d3d_transform_stack_clear(): void;\n//# sourceMappingURL=transform_3d.d.ts.map\n/**\n * 3D / spatial audio utilities.\n *\n * Wraps the Web Audio API PannerNode for positional audio.\n * Uses a simple 2D model: listener sits at (lx, ly, 0), sounds at (sx, sy, 0).\n * Distance-based attenuation follows the inverse-distance rolloff model.\n *\n * Usage:\n *   audio_set_listener_position(view_x + view_w/2, view_y + view_h/2)\n *   const inst = audio_play_sound_at(asset, x, y)\n */\n\n/**\n * A sound_instance with an attached PannerNode for 3D positioning.\n */\ndeclare class spatial_sound_instance {\n    readonly instance: sound_instance;\n    private _panner;\n    constructor(panner: PannerNode, inst: sound_instance);\n    /**\n     * Updates the world-space position of this sound source.\n     * @param x - World X position\n     * @param y - World Y position\n     */\n    set_position(x: number, y: number): void;\n    /** Stops playback. */\n    stop(): void;\n    /** Returns true if currently playing. */\n    get is_playing(): boolean;\n}\n/**\n * Sets the listener position in world space.\n * Should be updated each step to match the camera/view centre.\n * @param x - World X of the listener\n * @param y - World Y of the listener\n */\ndeclare function audio_set_listener_position(x: number, y: number): void;\n/**\n * Plays a sound with 3D positional audio at a world-space location.\n * @param asset - Sound asset to play\n * @param x - World X position of the sound source\n * @param y - World Y position of the sound source\n * @param ref_distance - Distance at which volume starts attenuating (default 100)\n * @param max_distance - Distance at which volume reaches minimum (default 1000)\n * @param loop - Whether to loop\n * @returns spatial_sound_instance handle\n */\ndeclare function audio_play_sound_at(asset: sound_asset, x: number, y: number, ref_distance?: number, max_distance?: number, loop?: boolean): spatial_sound_instance;\n/**\n * Updates an existing spatial sound instance's world position.\n * Call each step if the sound source is moving.\n * @param inst - The spatial_sound_instance to update\n * @param x - New world X\n * @param y - New world Y\n */\ndeclare function audio_set_sound_position(inst: spatial_sound_instance, x: number, y: number): void;\n/** Returns the current listener X position. */\ndeclare function audio_get_listener_x(): number;\n/** Returns the current listener Y position. */\ndeclare function audio_get_listener_y(): number;\n//# sourceMappingURL=audio_3d.d.ts.map\n/**\n * Audio groups \u2014 named gain buses that sounds can be assigned to.\n *\n * Each group has its own GainNode that sits between sound sources\n * and the master gain node:\n *   source \u2192 group gain \u2192 master gain \u2192 destination\n *\n * Groups are created on first use and never destroyed.\n */\n\n/**\n * A named audio bus with an independent gain level.\n */\ndeclare class audio_group extends resource {\n    readonly group_name: string;\n    private _gain_node;\n    /**\n     * @param group_name - Unique name for this audio group\n     */\n    constructor(group_name: string);\n    /**\n     * Returns the GainNode for this group, creating it if necessary.\n     * Lazily initialised so it can be constructed before audio_system.init().\n     */\n    get gain_node(): GainNode;\n    /**\n     * Sets the gain (volume) for this group.\n     * @param gain - Volume level (0 = silent, 1 = full)\n     */\n    set_gain(gain: number): void;\n    /** Returns the current gain for this group. */\n    get_gain(): number;\n    /**\n     * Stops all sounds in this group by disconnecting and reconnecting\n     * the gain node. Individual sound tracking is handled by sound_instance.\n     * This is a volume-only group; stopping is done via the sound registry.\n     */\n    stop_all(): void;\n}\n/**\n * Registers the callback used by audio_group.stop_all() to stop live instances.\n * Called once by sound.ts after module initialisation.\n * @param cb - Function that stops all instances in a named group\n */\ndeclare function set_stop_group_callback(cb: (group_name: string) => void): void;\n/**\n * Returns or creates an audio group with the given name.\n * @param name - Group name\n */\ndeclare function get_or_create_group(name: string): audio_group;\n/**\n * Sets the gain for a named audio group.\n * @param group_name - Group name\n * @param gain - Volume level (0\u20131)\n */\ndeclare function audio_group_set_gain(group_name: string, gain: number): void;\n/**\n * Returns the current gain for a named audio group.\n * @param group_name - Group name\n */\ndeclare function audio_group_get_gain(group_name: string): number;\n/**\n * Stops all sounds in a named audio group.\n * @param group_name - Group name\n */\ndeclare function audio_group_stop(group_name: string): void;\n//# sourceMappingURL=audio_group.d.ts.map\n/**\n * Core Web Audio API context and graph management.\n *\n * All audio passes through:\n *   source \u2192 group gain \u2192 master gain \u2192 AudioContext.destination\n *\n * Call audio_system.init() once before playing any sounds.\n * The context starts suspended on many browsers until a user gesture;\n * audio_system.resume() should be called in any user-input handler.\n */\n/**\n * Central audio context and master gain node.\n */\ndeclare class audio_system {\n    private static _ctx;\n    private static _master;\n    /**\n     * Initialises the Web Audio context and master gain node.\n     * Safe to call multiple times \u2014 only initialises once.\n     */\n    static init(): void;\n    /**\n     * Resumes the AudioContext after a user gesture.\n     * Browsers suspend audio until user interaction occurs.\n     */\n    static resume(): Promise<void>;\n    /**\n     * Returns the shared AudioContext.\n     * Throws if init() has not been called.\n     */\n    static get ctx(): AudioContext;\n    /**\n     * Returns the master GainNode.\n     * Throws if init() has not been called.\n     */\n    static get master(): GainNode;\n    /** Returns true if the audio system has been initialised. */\n    static get is_ready(): boolean;\n    /**\n     * Sets the master gain (volume) for all audio.\n     * @param gain - Volume level (0 = silent, 1 = full)\n     */\n    static set_master_gain(gain: number): void;\n    /** Returns the current master gain level. */\n    static get_master_gain(): number;\n    /**\n     * Returns the current AudioContext time in seconds.\n     * Used for precise scheduling.\n     */\n    static get current_time(): number;\n}\n//# sourceMappingURL=audio_system.d.ts.map\n/**\n * Sound resource and playback management.\n *\n * A `sound_asset` holds a decoded AudioBuffer (loaded from a URL or ArrayBuffer).\n * Playing a sound creates a `sound_instance` (AudioBufferSourceNode + GainNode).\n *\n * Sound instances are fire-and-forget by default. Retaining the returned\n * instance ID allows stopping, pausing, or changing volume mid-play.\n *\n * Routing: source \u2192 instance gain \u2192 group gain \u2192 master gain \u2192 destination\n */\n\n/**\n * A decoded audio asset that can be played one or more times.\n */\ndeclare class sound_asset extends resource {\n    buffer: AudioBuffer | null;\n    loop: boolean;\n    group_name: string;\n    /**\n     * Loads a sound from a URL, decoding it into an AudioBuffer.\n     * @param url - URL to an audio file (mp3, ogg, wav, etc.)\n     * @param group_name - Audio group to assign this sound to\n     * @param loop - Whether to loop by default\n     * @returns Promise that resolves when decoding is complete\n     */\n    load_url(url: string, group_name?: string, loop?: boolean): Promise<void>;\n    /**\n     * Loads a sound from a pre-fetched ArrayBuffer.\n     * @param array_buf - Raw audio data\n     * @param group_name - Audio group\n     * @param loop - Whether to loop by default\n     */\n    load_buffer(array_buf: ArrayBuffer, group_name?: string, loop?: boolean): Promise<void>;\n}\n/**\n * A live playback of a sound_asset.\n * Returned by audio_play_sound(); pass the ID to stop/query.\n */\ndeclare class sound_instance {\n    readonly instance_id: number;\n    private _source;\n    private _gain;\n    private _playing;\n    private _on_ended;\n    constructor(source: AudioBufferSourceNode, gain: GainNode);\n    /** Stops playback immediately. */\n    stop(): void;\n    /**\n     * Sets the gain for this specific playback instance.\n     * @param gain - Volume level (0\u20131)\n     */\n    set_gain(gain: number): void;\n    /** Returns the current instance gain. */\n    get_gain(): number;\n    /**\n     * Sets the playback pitch as a speed multiplier.\n     * 1.0 = normal, 2.0 = one octave up, 0.5 = one octave down.\n     * @param pitch - Playback rate multiplier\n     */\n    set_pitch(pitch: number): void;\n    /** Returns true if this instance is still playing. */\n    get is_playing(): boolean;\n    /**\n     * Registers a callback invoked when the sound ends naturally (not on stop()).\n     * @param cb - Callback function\n     */\n    on_ended(cb: () => void): void;\n}\n/**\n * Registers a sound_instance in the global instance registry.\n * Used by external modules (e.g. audio_3d) that construct instances directly.\n * @param inst - The instance to register\n * @param group_name - The audio group this instance belongs to\n */\ndeclare function register_instance(inst: sound_instance, group_name?: string): void;\n/**\n * Plays a sound asset and returns a sound_instance for control.\n * @param asset - The sound asset to play\n * @param loop - Override loop setting (defaults to asset.loop)\n * @param gain - Initial volume (0\u20131, defaults to 1)\n * @param pitch - Playback rate multiplier (defaults to 1)\n * @returns The live sound_instance handle\n */\ndeclare function play_sound(asset: sound_asset, loop?: boolean, gain?: number, pitch?: number): sound_instance;\n/**\n * Plays a sound asset.\n * @param asset - Sound to play\n * @param loop - Whether to loop\n * @param priority - Ignored (GMS API parity only)\n * @returns sound_instance handle\n */\ndeclare function audio_play_sound(asset: sound_asset | string, loop?: boolean, priority?: number): sound_instance;\n/** Registers a sound asset under a name so it can be played by name (e.g. `audio_play_sound('snd_jump')`). */\ndeclare function sound_register_name(name: string, asset: sound_asset): void;\n/** Returns a registered sound asset by its project name, or undefined if unknown. */\ndeclare function sound_get_name(name: string): sound_asset | undefined;\n/**\n * Stops a specific sound instance.\n * @param inst - The sound_instance returned by audio_play_sound\n */\ndeclare function audio_stop_sound(inst: sound_instance): void;\n/**\n * Stops all currently playing sounds.\n */\ndeclare function audio_stop_all(): void;\n/**\n * Returns true if the given sound instance is currently playing.\n * @param inst - The sound_instance to query\n */\ndeclare function audio_is_playing(inst: sound_instance): boolean;\n/**\n * Sets the gain for a specific sound instance.\n * @param inst - The sound_instance\n * @param gain - Volume level (0\u20131)\n */\ndeclare function audio_sound_gain(inst: sound_instance, gain: number): void;\n/**\n * Sets the pitch for a specific sound instance.\n * @param inst - The sound_instance\n * @param pitch - Playback rate multiplier (1 = normal)\n */\ndeclare function audio_sound_pitch(inst: sound_instance, pitch: number): void;\n/**\n * Sets the master gain for all audio.\n * @param gain - Volume level (0\u20131)\n */\ndeclare function audio_set_master_gain(gain: number): void;\n/**\n * Returns the current master gain.\n */\ndeclare function audio_get_master_gain(): number;\n//# sourceMappingURL=sound.d.ts.map\n/**\n * Collision detection system.\n *\n * Supports two mask types:\n *   - Rectangle (AABB) \u2014 axis-aligned bounding box\n *   - Circle  \u2014 circle based on bbox dimensions\n *\n * All functions operate on instance objects directly.\n * \"Precise\" (per-pixel) collision is deferred to a later phase.\n */\n\ndeclare const MASK_RECT = 0;\ndeclare const MASK_CIRCLE = 1;\ndeclare const MASK_ELLIPSE = 2;\n/**\n * Returns the axis-aligned bounding box for an instance at a given position.\n * Uses the instance's sprite dimensions and origin, or falls back to a 1\xD71 box.\n *\n * @param inst - The instance\n * @param x - Override X position (defaults to inst.x)\n * @param y - Override Y position (defaults to inst.y)\n * @returns { left, top, right, bottom }\n */\ndeclare function get_bbox(inst: instance, x?: number, y?: number): {\n    left: number;\n    top: number;\n    right: number;\n    bottom: number;\n};\n/**\n * Updates the cached bbox_* properties on an instance.\n * Called internally by the collision system and by internal_step.\n * @param inst - The instance to update\n */\ndeclare function update_bbox(inst: instance): void;\ndeclare function bbox_overlap(a_left: number, a_top: number, a_right: number, a_bottom: number, b_left: number, b_top: number, b_right: number, b_bottom: number): boolean;\ndeclare function circles_overlap(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean;\n/**\n * Returns true if instance a overlaps instance b at the given position for a.\n * @param a - The querying instance\n * @param ax - Override X for a\n * @param ay - Override Y for a\n * @param b - The target instance\n * @returns True if the instances overlap\n */\ndeclare function instances_collide(a: instance, ax: number, ay: number, b: instance): boolean;\n/**\n * Returns true if a point overlaps instance b's bounding box.\n * @param px - Point X\n * @param py - Point Y\n * @param b - Target instance\n * @returns True if the point is inside b's bounding box\n */\ndeclare function point_in_instance(px: number, py: number, b: instance): boolean;\n/**\n * Returns true if a rectangle overlaps instance b's bounding box.\n * @param rx1 - Rectangle left\n * @param ry1 - Rectangle top\n * @param rx2 - Rectangle right\n * @param ry2 - Rectangle bottom\n * @param b - Target instance\n * @returns True if the rectangle overlaps b\n */\ndeclare function rect_in_instance(rx1: number, ry1: number, rx2: number, ry2: number, b: instance): boolean;\n/**\n * Returns true if a circle overlaps instance b's bounding box (uses AABB approximation).\n * @param cx - Circle center X\n * @param cy - Circle center Y\n * @param cr - Circle radius\n * @param b - Target instance\n * @returns True if they overlap\n */\ndeclare function circle_in_instance(cx: number, cy: number, cr: number, b: instance): boolean;\n/**\n * Returns true if a line segment crosses instance b's bounding box.\n * @param x1 - Segment start X\n * @param y1 - Segment start Y\n * @param x2 - Segment end X\n * @param y2 - Segment end Y\n * @param b - Target instance\n */\ndeclare function line_in_instance(x1: number, y1: number, x2: number, y2: number, b: instance): boolean;\n\n//# sourceMappingURL=collision.d.ts.map\n/**\n * Enum of all supported event types in the game loop.\n */\ndeclare enum EVENT_TYPE {\n    none = \"NONE\",// Default/unset event type\n    create = \"CREATE\",// Runs once when instance is created\n    destroy = \"DESTROY\",// Runs once when instance is destroyed\n    step_begin = \"STEP_BEGIN\",// Runs at the start of each step\n    step = \"STEP\",// Main step event, runs every frame\n    step_end = \"STEP_END\",// Runs at the end of each step\n    collision = \"COLLISION\",// Runs when collision is detected\n    keyboard = \"KEYBOARD\",// Runs on keyboard input\n    mouse = \"MOUSE\",// Runs on mouse input\n    other = \"OTHER\",// Miscellaneous events (room start/end, etc.)\n    async = \"ASYNC\",// Async callback events (HTTP, networking)\n    draw_begin = \"DRAW_BEGIN\",// Runs before the main draw, in world space\n    draw = \"DRAW\",// Main draw event\n    draw_end = \"DRAW_END\",// Runs after the main draw, in world space\n    draw_gui = \"DRAW_GUI\"\n}\n/**\n * Wrapper class for an event function and its type.\n */\ndeclare class game_event {\n    event: Function;\n    type: EVENT_TYPE;\n    /**\n     * Creates a new game event.\n     * @param event - The function to call when the event fires\n     * @param type - The event type category\n     */\n    constructor(event?: Function, type?: EVENT_TYPE);\n    /**\n     * Executes the event function.\n     */\n    run(): void;\n}\n//# sourceMappingURL=game_event.d.ts.map\n\n/**\n * Registers frame begin/end callbacks from the renderer.\n * Must be called from renderer.init() before the loop starts.\n */\ndeclare function set_frame_hooks(begin: () => void, end: () => void): void;\n/**\n * Registers the room render callback from the renderer (views/backgrounds/tiles).\n * Must be called from renderer.init() before the loop starts.\n */\ndeclare function set_room_render_hook(fn: (rm: room, run_instances: () => void) => void): void;\n/**\n * Core game loop that handles update and draw cycles.\n * Uses a fixed timestep for updates and runs drawing once per frame.\n */\ndeclare abstract class game_loop {\n    private static room_speed;\n    private static room_delta;\n    private static last_delta;\n    private static accumulator;\n    static fps: number;\n    static fps_real: number;\n    static delta_time_us: number;\n    private static _fps_frames;\n    private static _fps_accum;\n    static room: room;\n    static room_first: number;\n    static room_last: number;\n    private static _canvas;\n    private static _pending_game_start;\n    private static _pending_room_start;\n    private static _stopped;\n    private static update_events;\n    private static draw_events;\n    /**\n     * Attaches input systems to the given canvas.\n     * Must be called before start() if mouse or touch input is needed.\n     * @param canvas - The game canvas element\n     */\n    static init_input(canvas: HTMLCanvasElement): void;\n    /**\n     * Starts the game loop.\n     * Initializes timing values and begins the requestAnimationFrame cycle.\n     */\n    static start(room?: room): void;\n    /**\n     * Main loop tick called every frame by requestAnimationFrame.\n     * Handles timing, runs fixed timestep updates, and draws once per frame.\n     * @param current - The current timestamp provided by requestAnimationFrame\n     */\n    private static tick;\n    /**\n     * Runs all update events in GMS order.\n     * Create and destroy events run once and are cleared after execution.\n     * Input polling happens before events; end_step clears edge-trigger state after.\n     */\n    private static update;\n    /**\n     * Advances the physics world (if one exists) and syncs physics instances.\n     * Runs between Step and End Step, matching GMS ordering. No-op for non-physics games.\n     */\n    private static _step_physics;\n    /**\n     * Runs all draw events in GMS order.\n     * Called once per frame after all updates have completed.\n     * begin_frame clears the canvas; end_frame flushes the batch.\n     */\n    private static draw;\n    /**\n     * Registers a function to be called for a specific event type.\n     * @param event - The event type to register for\n     * @param func - The function to call when the event fires\n     */\n    static register(event: EVENT_TYPE, func: Function): void;\n    /**\n     * Unregisters a function from a specific event type.\n     * @param event - The event type to unregister from\n     * @param func - The function to remove\n     */\n    static unregister(event: EVENT_TYPE, func: Function): void;\n    /**\n     * Transitions to a new room, clearing current events and loading the new room's state.\n     * @param room - The room to transition to\n     */\n    static change_room(room: room): void;\n    /**\n     * Ends the game: fires the Game End event for all instances, then halts the loop.\n     */\n    static end(): void;\n    /**\n     * Restarts the game by returning to the first room.\n     */\n    static restart(): void;\n    /**\n     * Calls a lifecycle event method on every active instance in the current room.\n     * @param method - Name of the lifecycle method to invoke\n     */\n    private static _dispatch_lifecycle;\n}\n/** Ends the game: fires Game End events, then stops the loop. */\ndeclare function game_end(): void;\n/** Restarts the game from the first room. */\ndeclare function game_restart(): void;\n//# sourceMappingURL=game_loop.d.ts.map\n/**\n * GMS built-in gameplay globals: `score`, `lives`, and `health`.\n *\n * These are plain numbers with getters/setters (TS can't reassign imported\n * bindings, so GMS's `lives -= 1` becomes `set_lives(get_lives() - 1)`).\n * The game loop watches `lives`/`health` and fires the No More Lives / No More\n * Health events when either transitions from positive to \u2264 0.\n */\n/** Current score. */\ndeclare function get_score(): number;\n/** Sets the score. */\ndeclare function set_score(value: number): void;\n/** Current lives. */\ndeclare function get_lives(): number;\n/** Sets lives (\u2264 0 triggers the No More Lives event on the next step). */\ndeclare function set_lives(value: number): void;\n/** Current health. */\ndeclare function get_health(): number;\n/** Sets health (\u2264 0 triggers the No More Health event on the next step). */\ndeclare function set_health(value: number): void;\n/** Returns true once each time lives drops from positive to \u2264 0 (loop-internal). */\ndeclare function _consume_no_more_lives(): boolean;\n/** Returns true once each time health drops from positive to \u2264 0 (loop-internal). */\ndeclare function _consume_no_more_health(): boolean;\n/** Resets all gameplay globals to their defaults (used on game restart). */\ndeclare function _reset_game_state(): void;\n//# sourceMappingURL=game_state.d.ts.map\n/**\n * GMObject \u2014 base class for all game object definitions.\n *\n * A GMObject is a *blueprint* (like a class definition). It is not placed\n * in a room directly \u2014 the engine creates instances of it via instance_create().\n * Developers subclass GMObject to define their game objects and override\n * lifecycle methods (on_create, on_step, on_draw, etc.) from the instance class.\n *\n * Relationship:\n *   GMObject subclass  \u2192  instance_create()  \u2192  instance (lives in a room)\n *\n * The instance class already implements all instance behaviour. GMObject adds\n * the object-level metadata (default sprite, parent, name) that is shared\n * across all instances of a type.\n */\n\n/**\n * Base class for all game objects.\n * Extend this to define a new object type. Override lifecycle methods as needed.\n */\ndeclare abstract class gm_object extends instance {\n    /** Default sprite for instances of this object (can be overridden per-instance). */\n    static default_sprite: sprite | null;\n    /** Parent object class for inheritance queries (null = no parent). */\n    static parent: typeof gm_object | null;\n    /** Human-readable object name. Defaults to the class name. */\n    static object_name: string;\n    static solid: boolean;\n    static visible: boolean;\n    static persistent: boolean;\n    static depth: number;\n    static sprite: string | null;\n    static physics: boolean;\n    static physics_shape: 'box' | 'circle';\n    static physics_density: number;\n    static physics_restitution: number;\n    static physics_friction: number;\n    static physics_sensor: boolean;\n    /**\n     * Applies this object's static metadata defaults to the new instance.\n     * @param room - The room this instance belongs to\n     */\n    constructor(room: room);\n    /**\n     * Returns the object name. Falls back to the constructor name if not set.\n     */\n    static get_name(): string;\n    /**\n     * Checks whether this object type is an ancestor (direct or indirect) of another.\n     * @param child - The object type to test\n     * @returns True if this class is somewhere in child's prototype chain\n     */\n    static is_ancestor_of(child: typeof gm_object): boolean;\n    /**\n     * Called once when the instance is created. Override in subclasses.\n     */\n    on_create(): void;\n}\n/**\n * Checks whether the given object class has been defined (is non-null).\n * In this engine, all imported object classes exist; this is a compatibility stub.\n * @param obj - Object class to check\n * @returns Always true for a valid class reference\n */\ndeclare function object_exists(obj: typeof gm_object | null | undefined): boolean;\n/**\n * Returns the name of an object class.\n * @param obj - Object class\n * @returns The object's name string\n */\ndeclare function object_get_name(obj: typeof gm_object): string;\n/**\n * Returns the default sprite of an object class, or null if none.\n * @param obj - Object class\n * @returns Default sprite or null\n */\ndeclare function object_get_sprite(obj: typeof gm_object): sprite | null;\n/**\n * Returns the parent class of an object, or null if it has no parent.\n * @param obj - Object class\n * @returns Parent class or null\n */\ndeclare function object_get_parent(obj: typeof gm_object): typeof gm_object | null;\n/**\n * Checks whether obj is a descendant of parent (i.e., parent is an ancestor of obj).\n * @param obj - Object to test\n * @param parent - Potential ancestor\n * @returns True if parent is an ancestor of obj\n */\ndeclare function object_is_ancestor(obj: typeof gm_object, parent: typeof gm_object): boolean;\n//# sourceMappingURL=gm_object.d.ts.map\n\n/**\n * A draw_sprite_ext function reference injected at engine startup to avoid\n * circular imports between instance.ts (core) and renderer.ts (drawing).\n * Set by calling set_draw_sprite_ext() from renderer.init().\n */\ndeclare let _renderer_draw_sprite_ext: ((spr: sprite, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number) => void) | null;\n/**\n * Called by renderer.init() to register the draw_sprite_ext function.\n * Must be called before the game loop starts for draw_self() to work.\n * @param fn - The renderer's draw_sprite_ext method\n */\ndeclare function set_draw_sprite_ext(fn: typeof _renderer_draw_sprite_ext): void;\n/**\n * Base class for all game object instances.\n * Instances exist within rooms and can have events, properties, and behaviors.\n */\ndeclare class instance extends resource {\n    [key: string]: any;\n    room: room;\n    x: number;\n    y: number;\n    xprevious: number;\n    yprevious: number;\n    xstart: number;\n    ystart: number;\n    hspeed: number;\n    vspeed: number;\n    speed: number;\n    direction: number;\n    friction: number;\n    gravity: number;\n    gravity_direction: number;\n    sprite_index: number;\n    image_index: number;\n    image_speed: number;\n    image_xscale: number;\n    image_yscale: number;\n    image_angle: number;\n    image_alpha: number;\n    image_blend: number;\n    depth: number;\n    visible: boolean;\n    mask_index: number;\n    solid: boolean;\n    persistent: boolean;\n    active: boolean;\n    /** Countdown timers (GMS alarm[0..11]). -1 = inactive; set to N to fire on_alarm(i) after N steps. */\n    alarm: number[];\n    /** Set once instance_destroy() runs, so the rest of the current step is skipped. */\n    private _destroyed;\n    bbox_left: number;\n    bbox_top: number;\n    bbox_right: number;\n    bbox_bottom: number;\n    mask_manual: boolean;\n    mask_off_left: number;\n    mask_off_top: number;\n    mask_off_right: number;\n    mask_off_bottom: number;\n    phy_body_id: number;\n    private _phy_wants;\n    private _phy_shape;\n    private _phy_density;\n    private _phy_restitution;\n    private _phy_friction;\n    private _phy_sensor;\n    private _mp_dir;\n    path_index: number;\n    path_position: number;\n    path_positionprevious: number;\n    path_speed: number;\n    path_scale: number;\n    path_orientation: number;\n    path_endaction: number;\n    private _path_off_x;\n    private _path_off_y;\n    private _bound_step_begin;\n    private _bound_step;\n    private _bound_step_end;\n    private _bound_draw_gui;\n    /**\n     * Creates a new instance in the specified room.\n     * @param room - The room this instance will belong to\n     */\n    constructor(room: room);\n    /**\n     * Creates a new instance of an object at the specified position.\n     * @param x - X position for the new instance\n     * @param y - Y position for the new instance\n     * @param obj - The object class to instantiate\n     * @returns The newly created instance\n     */\n    static instance_create(x: number, y: number, obj: typeof instance): instance;\n    /**\n     * Creates a new instance at the specified position with an explicit depth.\n     * @param x - X position\n     * @param y - Y position\n     * @param depth - Drawing depth\n     * @param obj - The object class to instantiate\n     * @returns The newly created instance\n     */\n    static instance_create_depth(x: number, y: number, depth: number, obj: typeof instance): instance;\n    /**\n     * Releases this instance's external resources (physics body) without firing a Destroy\n     * event \u2014 used when a room is silently rebuilt (e.g. re-entering a non-persistent room).\n     */\n    dispose_for_rebuild(): void;\n    /**\n     * Destroys this instance, removing it from the room.\n     * Queues the destroy event to run at the end of the current step.\n     */\n    instance_destroy(): void;\n    /**\n     * Destroys an instance by its numeric ID.\n     * @param id - ID of the instance to destroy\n     */\n    static instance_destroy_id(id: number): void;\n    /**\n     * Registers this instance's event handlers with the game loop.\n     */\n    register_events(): void;\n    /**\n     * Unregisters this instance's event handlers from the game loop.\n     */\n    private unregister_events;\n    /**\n     * Internal step: alarms, input events, physics, animation, bbox, collision\n     * events, then on_step(). Bails out early if an event destroys the instance.\n     */\n    private internal_step;\n    /** Decrements active alarms; fires on_alarm(i) when one reaches zero. */\n    private _process_alarms;\n    /** Fires keyboard and mouse-over-instance events for this step. */\n    private _process_input_events;\n    /** Advances the sprite animation, firing on_animation_end() on each loop. */\n    private _advance_animation;\n    /** Fires on_collision(other) for each instance this one overlaps (collision-event objects only). */\n    private _process_collisions;\n    /**\n     * Internal draw: skips hidden instances, then calls on_draw().\n     * If on_draw() has not been overridden, draws the current sprite automatically.\n     */\n    /**\n     * Runs the main Draw event (skips hidden/inactive instances).\n     * Called by the game loop in depth order \u2014 not registered as an event.\n     */\n    run_draw(): void;\n    /** Runs the Draw Begin event (skips hidden/inactive instances). */\n    run_draw_begin(): void;\n    /** Runs the Draw End event (skips hidden/inactive instances). */\n    run_draw_end(): void;\n    /**\n     * Checks if an instance with the given ID exists.\n     * @param id - The instance ID to check\n     * @returns True if the instance exists\n     */\n    static instance_exists(id: number): boolean;\n    /**\n     * Finds an instance by its ID.\n     * @param id - The instance ID to find\n     * @returns The instance, or undefined if not found\n     */\n    static instance_find(id: number): instance | undefined;\n    /**\n     * Returns the number of active instances of a given object class in the current room.\n     * @param obj - Object class to count\n     * @returns Instance count\n     */\n    static instance_number(obj: typeof instance): number;\n    /**\n     * Finds the nth instance of a given object class in the current room (0-indexed).\n     * @param obj - Object class to search for\n     * @param n - Zero-based index\n     * @returns The instance, or undefined if not found\n     */\n    static instance_find_nth(obj: typeof instance, n: number): instance | undefined;\n    /**\n     * Finds the first instance of a given object class at a specific position.\n     * @param x - X position to test\n     * @param y - Y position to test\n     * @param obj - Object class to check\n     * @returns The instance at that position, or undefined\n     */\n    static instance_position(x: number, y: number, obj: typeof instance): instance | undefined;\n    /**\n     * Returns the nearest instance of obj to a given point.\n     * @param x - Reference X\n     * @param y - Reference Y\n     * @param obj - Object class to search\n     * @returns Nearest instance, or undefined if none exist\n     */\n    static instance_nearest(x: number, y: number, obj: typeof instance): instance | undefined;\n    /**\n     * Returns the furthest instance of obj from a given point.\n     * @param x - Reference X\n     * @param y - Reference Y\n     * @param obj - Object class to search\n     * @returns Furthest instance, or undefined if none exist\n     */\n    static instance_furthest(x: number, y: number, obj: typeof instance): instance | undefined;\n    /**\n     * Deactivates all instances (optionally excluding self).\n     * Deactivated instances are skipped in step and draw.\n     * @param not_me - If true, this instance is excluded from deactivation\n     */\n    instance_deactivate_all(not_me?: boolean): void;\n    /**\n     * Deactivates all instances of a specific object class.\n     * @param obj - Object class to deactivate\n     */\n    static instance_deactivate_object(obj: typeof instance): void;\n    /**\n     * Activates all instances in the current room.\n     */\n    static instance_activate_all(): void;\n    /**\n     * Activates all instances of a specific object class.\n     * @param obj - Object class to activate\n     */\n    static instance_activate_object(obj: typeof instance): void;\n    /**\n     * True if the instance's bounding box overlaps the given region.\n     * @param inst - Instance to test\n     * @param l - Region left\n     * @param t - Region top\n     * @param r - Region right\n     * @param b - Region bottom\n     */\n    private static _bbox_in_region;\n    /**\n     * Deactivates instances within (or outside) a rectangular region.\n     * @param left - Region left\n     * @param top - Region top\n     * @param width - Region width\n     * @param height - Region height\n     * @param inside - Deactivate instances overlapping the region (true) or those not overlapping it (false)\n     * @param not_me - If true, this instance is excluded\n     */\n    instance_deactivate_region(left: number, top: number, width: number, height: number, inside?: boolean, not_me?: boolean): void;\n    /**\n     * Activates instances within (or outside) a rectangular region.\n     * @param left - Region left\n     * @param top - Region top\n     * @param width - Region width\n     * @param height - Region height\n     * @param inside - Activate instances overlapping the region (true) or those not overlapping it (false)\n     */\n    static instance_activate_region(left: number, top: number, width: number, height: number, inside?: boolean): void;\n    /**\n     * Checks if this instance would collide with any instance of obj at position (x, y).\n     * Does not move the instance.\n     * @param x - X position to test\n     * @param y - Y position to test\n     * @param obj - Object class to check against\n     * @returns True if a collision would occur\n     */\n    place_meeting(x: number, y: number, obj: typeof instance): boolean;\n    /**\n     * Checks if position (x, y) is free of solid instances.\n     * @param x - X position to test\n     * @param y - Y position to test\n     * @returns True if no solid instances occupy that position\n     */\n    place_free(x: number, y: number): boolean;\n    /**\n     * Checks if position (x, y) is completely empty (no instances of any kind).\n     * @param x - X position to test\n     * @param y - Y position to test\n     * @returns True if no instances occupy that position\n     */\n    place_empty(x: number, y: number): boolean;\n    /**\n     * Like place_meeting, but returns the first instance collided with at (x, y),\n     * or undefined if none.\n     * @param x - X position to test\n     * @param y - Y position to test\n     * @param obj - Object class to check against (pass the base `instance` for \"all\")\n     */\n    instance_place(x: number, y: number, obj: typeof instance): instance | undefined;\n    /**\n     * Sets a manual rectangular collision mask, as offsets from the instance\n     * origin (x, y). Use this for spriteless objects so collision functions work.\n     * @param left - Left offset from x\n     * @param top - Top offset from y\n     * @param right - Right offset from x\n     * @param bottom - Bottom offset from y\n     */\n    mask_set_rectangle(left: number, top: number, right: number, bottom: number): void;\n    /**\n     * Convenience: sets a manual width\xD7height mask with its top-left at the origin.\n     * @param width - Mask width\n     * @param height - Mask height\n     */\n    mask_set_size(width: number, height: number): void;\n    /** Removes the manual mask, reverting to the sprite/mask_index-derived bbox. */\n    mask_clear(): void;\n    /**\n     * Marks this instance as physics-enabled (called from `gm_object` when the object\n     * declares `static physics = true`). The matter.js body is created lazily on the\n     * first physics step, so x/y and any collision mask are already in place. A density\n     * of \u2264 0 makes the body static (immovable) \u2014 e.g. for floors and walls.\n     * @param shape - 'box' or 'circle'\n     * @param density - Mass density; \u2264 0 \u21D2 static body\n     * @param restitution - Bounciness, 0\u20131\n     * @param friction - Surface friction\n     * @param sensor - True = detects overlaps without a physical response\n     */\n    phy_request(shape: 'box' | 'circle', density: number, restitution: number, friction: number, sensor: boolean): void;\n    /**\n     * Creates the matter.js body if this instance wants physics, has none yet, and a\n     * physics world exists. Called by the game loop each step (a no-op once bound).\n     */\n    phy_ensure_body(): void;\n    /** Syncs x/y/image_angle from the physics body. Called by the loop after stepping. */\n    phy_sync_from_body(): void;\n    /** The body's pixel extent: manual mask, else sprite bbox, else a 32\xD732 default. */\n    private _phy_extent;\n    /** Applies a continuous force at the body's centre (pixel-space units). */\n    phy_apply_force(fx: number, fy: number): void;\n    /** Applies an instantaneous impulse at the body's centre. */\n    phy_apply_impulse(fx: number, fy: number): void;\n    /** Teleports the physics body (and the instance) to a position. */\n    phy_set_position(x: number, y: number): void;\n    /** Horizontal velocity of the physics body (pixels/step). */\n    get phy_speed_x(): number;\n    set phy_speed_x(v: number);\n    /** Vertical velocity of the physics body (pixels/step). */\n    get phy_speed_y(): number;\n    set phy_speed_y(v: number);\n    /**\n     * Moves the instance by the given amount, stopping when it hits a solid.\n     * @param hspd - Horizontal movement\n     * @param vspd - Vertical movement\n     * @returns True if the movement was blocked by a solid\n     */\n    move_contact_solid(hspd: number, vspd: number): boolean;\n    /**\n     * Wraps the instance around the room edges.\n     * @param hor - Wrap horizontally\n     * @param vert - Wrap vertically\n     * @param margin - Extra margin (pixels outside room edge before wrapping)\n     */\n    move_wrap(hor: boolean, vert: boolean, margin?: number): void;\n    /**\n     * Returns the shortest distance from this instance to any instance of obj.\n     * @param obj - Object class to measure distance to\n     * @returns Distance in pixels, or Infinity if no instance found\n     */\n    distance_to_object(obj: typeof instance): number;\n    /**\n     * Sets the instance's motion using speed and direction.\n     * @param dir - Direction in degrees (0 = right, counter-clockwise)\n     * @param spd - Speed in pixels per step\n     */\n    motion_set(dir: number, spd: number): void;\n    /**\n     * Adds motion to the instance's current movement.\n     * @param dir - Direction in degrees\n     * @param spd - Speed to add\n     */\n    motion_add(dir: number, spd: number): void;\n    /**\n     * Moves the instance toward a point at the given speed.\n     * @param x - Target X position\n     * @param y - Target Y position\n     * @param spd - Speed to move at\n     */\n    move_towards_point(x: number, y: number, spd: number): void;\n    /**\n     * Returns the distance from this instance's bounding box to a point.\n     * Returns 0 if the point lies inside the bounding box.\n     * @param x - Point X\n     * @param y - Point Y\n     */\n    distance_to_point(x: number, y: number): number;\n    /**\n     * Snaps the instance position to a grid.\n     * @param hsnap - Horizontal grid size (ignored if \u2264 0)\n     * @param vsnap - Vertical grid size (ignored if \u2264 0)\n     */\n    move_snap(hsnap: number, vsnap: number): void;\n    /**\n     * True if the instance position is aligned to the given grid.\n     * @param hsnap - Horizontal grid size\n     * @param vsnap - Vertical grid size\n     */\n    place_snapped(hsnap: number, vsnap: number): boolean;\n    /**\n     * Moves the instance to a random, grid-snapped, collision-free position in\n     * the room (tries a number of times before giving up).\n     * @param hsnap - Horizontal grid size (use 1 for any pixel)\n     * @param vsnap - Vertical grid size\n     */\n    move_random(hsnap: number, vsnap: number): void;\n    /**\n     * Like move_contact_solid but treats all instances as obstacles.\n     * @param hspd - Horizontal movement\n     * @param vspd - Vertical movement\n     * @returns True if the movement was blocked\n     */\n    move_contact_all(hspd: number, vspd: number): boolean;\n    /**\n     * Steps the instance in the given direction until it is no longer colliding\n     * with a solid (up to its bounding-box size in steps).\n     * @param hspd - Horizontal step\n     * @param vspd - Vertical step\n     */\n    move_outside_solid(hspd: number, vspd: number): void;\n    /** As move_outside_solid but treats all instances as obstacles. */\n    move_outside_all(hspd: number, vspd: number): void;\n    /** Steps in (hspd,vspd) until the position is free (or a step cap is hit). */\n    private _move_outside;\n    /**\n     * Bounces the instance off solid instances by reflecting its hspeed/vspeed.\n     * @param advanced - Reserved for slanted-wall handling (currently axis-aligned reflection)\n     */\n    move_bounce_solid(advanced?: boolean): void;\n    /** As move_bounce_solid but bounces off all instances. */\n    move_bounce_all(advanced?: boolean): void;\n    /** Axis-aligned bounce: flips the blocked velocity component(s). */\n    private _move_bounce;\n    /** True if (x,y) is clear: `checkall` \u21D2 no instances at all, else no solids. */\n    private _mp_free;\n    /**\n     * Moves up to `stepsize` straight toward (x, y), stopping if the step is blocked.\n     * @param checkall - True = treat all instances as obstacles; false = only solids\n     * @returns True once the instance is at the target\n     */\n    mp_linear_step(x: number, y: number, stepsize: number, checkall: boolean): boolean;\n    /** Like `mp_linear_step`, but only instances of `obj` block the move. */\n    mp_linear_step_object(x: number, y: number, stepsize: number, obj: typeof instance): boolean;\n    /**\n     * Steps `stepsize` toward (x, y) while steering around obstacles (potential field).\n     * Sweeps outward from the direct heading (see `mp_potential_settings`) for a free step.\n     * @returns True once near the target\n     */\n    mp_potential_step(x: number, y: number, stepsize: number, checkall: boolean): boolean;\n    /** Like `mp_potential_step`, but only instances of `obj` block the move. */\n    mp_potential_step_object(x: number, y: number, stepsize: number, obj: typeof instance): boolean;\n    private _mp_potential;\n    /** Rotates `from` toward `to` by at most `max_step` radians, the short way. */\n    private _approach_angle;\n    /**\n     * Makes this instance follow a path.\n     * @param path_id - The path resource to follow\n     * @param speed - Pixels per step along the path\n     * @param endaction - `path_action_*` (stop / restart / continue / reverse)\n     * @param absolute - True = the path's own coordinates; false = offset so it starts at the instance\n     */\n    path_start(path_id: number, speed: number, endaction?: number, absolute?: boolean): void;\n    /** Stops following the current path (does not fire the Path End event). */\n    path_end(): void;\n    /** Advances along the current path by `path_speed`, applying the end action and firing on_path_end. */\n    private _advance_path;\n    /** Read-only: the number of sub-images (frames) of the current sprite (GMS `image_number`). */\n    get image_number(): number;\n    /**\n     * Calculates the distance to a point.\n     * @param x - Target X position\n     * @param y - Target Y position\n     * @returns Distance in pixels\n     */\n    point_distance(x: number, y: number): number;\n    /**\n     * Calculates the direction toward a point.\n     * @param x - Target X position\n     * @param y - Target Y position\n     * @returns Direction in degrees (0 = right, counter-clockwise)\n     */\n    point_direction(x: number, y: number): number;\n    /**\n     * Draws this instance's current sprite at its position with all image_ properties.\n     * Call this from on_draw() or it will be called automatically if on_draw() is not overridden.\n     */\n    draw_self(): void;\n    /** Called once when the instance is created. */\n    on_create(): void;\n    /** Called once when the instance is destroyed. */\n    on_destroy(): void;\n    /** Called at the start of each step. */\n    on_step_begin(): void;\n    /** Called every step (main update logic). Override this in subclasses. */\n    on_step(): void;\n    /** Called at the end of each step. */\n    on_step_end(): void;\n    /**\n     * Called every frame to draw the instance.\n     * Default implementation calls draw_self() to draw sprite_index at (x, y).\n     * Override to customize drawing behaviour.\n     */\n    on_draw(): void;\n    /** Called before the main Draw event (world space). Override to draw underlays. */\n    on_draw_begin(): void;\n    /** Called after the main Draw event (world space). Override to draw overlays. */\n    on_draw_end(): void;\n    /** Called every frame to draw GUI elements (fixed to the screen, not the room). */\n    on_draw_gui(): void;\n    /** Called when alarm[index] counts down to zero. */\n    on_alarm(_index: number): void;\n    /** Called the step any key is pressed. */\n    on_key_press(): void;\n    /** Called the step any key is released. */\n    on_key_release(): void;\n    /** Called every step any key is held down. */\n    on_key_held(): void;\n    /** Called when the left mouse button is pressed over this instance. */\n    on_mouse_left_press(): void;\n    /** Called when the left mouse button is released over this instance. */\n    on_mouse_left_release(): void;\n    /** Called when the right mouse button is pressed over this instance. */\n    on_mouse_right_press(): void;\n    /** Called for each other instance this one overlaps this step. */\n    on_collision(_other: instance): void;\n    /** Called when the room this instance is in starts. */\n    on_room_start(): void;\n    /** Called when the room this instance is in ends (before leaving it). */\n    on_room_end(): void;\n    /** Called once when the game starts, for instances present in the first room. */\n    on_game_start(): void;\n    /** Called once when the game ends. */\n    on_game_end(): void;\n    /** Called when the sprite animation completes a loop. */\n    on_animation_end(): void;\n    /** Called when path following ends. */\n    on_path_end(): void;\n    /** Called each step while the instance's bbox is entirely outside the room. */\n    on_outside_room(): void;\n    /** Called each step while the instance's bbox crosses a room edge. */\n    on_intersect_boundary(): void;\n    /** A user-defined event (0\u201315), triggered by `event_user(index)`. */\n    on_user(index: number): void;\n    /** Called once when `lives` transitions to \u2264 0. */\n    on_no_more_lives(): void;\n    /** Called once when `health` transitions to \u2264 0. */\n    on_no_more_health(): void;\n    /** Triggers this instance's user event `index` (0\u201315) \u2192 `on_user(index)`. */\n    event_user(index: number): void;\n    /** Fires the Outside Room / Intersect Boundary events when the bbox leaves/crosses the room. */\n    private _process_boundary_events;\n}\n/**\n * Iterates over all active instances of a given object class and runs a callback.\n * The callback receives each instance as `self`.\n *\n * @param obj - Object class to iterate, or an array of instances\n * @param callback - Function called for each matching instance\n */\ndeclare function with_object<T extends instance>(obj: typeof instance | T[], callback: (self: T) => void): void;\n/** Returns the first instance of obj whose mask contains the point (x, y), or undefined. */\ndeclare function collision_point(x: number, y: number, obj: typeof instance): instance | undefined;\n/** True if any instance of obj has its mask at the point (x, y). */\ndeclare function position_meeting(x: number, y: number, obj: typeof instance): boolean;\n/** Destroys every instance whose mask contains the point (x, y). */\ndeclare function position_destroy(x: number, y: number): void;\n/** Returns the first instance of obj overlapping the rectangle (x1,y1)-(x2,y2), or undefined. */\ndeclare function collision_rectangle(x1: number, y1: number, x2: number, y2: number, obj: typeof instance): instance | undefined;\n/** Returns the first instance of obj overlapping the circle at (x, y) with the given radius, or undefined. */\ndeclare function collision_circle(x: number, y: number, radius: number, obj: typeof instance): instance | undefined;\n/** Returns the first instance of obj whose mask the line segment (x1,y1)-(x2,y2) crosses, or undefined. */\ndeclare function collision_line(x1: number, y1: number, x2: number, y2: number, obj: typeof instance): instance | undefined;\n\n//# sourceMappingURL=instance.d.ts.map\n/**\n * Motion planning (GMS `mp_*`).\n *\n * - `mp_grid_*` \u2014 a grid of free/blocked cells + A* pathfinding that writes waypoints into a\n *   path resource (`mp_grid_path`).\n * - `mp_potential_settings` \u2014 tuning for the instance-side `mp_potential_step` (in instance.ts).\n *\n * The per-instance steppers `mp_linear_step` / `mp_potential_step` live on the `instance` class\n * since they move the calling instance.\n */\n\n/**\n * Creates a motion-planning grid covering a region of the room.\n * @returns Grid id\n */\ndeclare function mp_grid_create(left: number, top: number, hcells: number, vcells: number, cellwidth: number, cellheight: number): number;\n/** Frees a grid. */\ndeclare function mp_grid_destroy(grid_id: number): void;\n/** Marks every cell of the grid as free. */\ndeclare function mp_grid_clear_all(grid_id: number): void;\n/** Marks a single cell as free. */\ndeclare function mp_grid_clear_cell(grid_id: number, h: number, v: number): void;\n/** Marks a single cell as blocked (forbidden). */\ndeclare function mp_grid_add_cell(grid_id: number, h: number, v: number): void;\n/** Returns -1 if the cell is blocked, 0 if free, or -1 if out of range. */\ndeclare function mp_grid_get_cell(grid_id: number, h: number, v: number): number;\n/** Marks all cells overlapping a room-space rectangle as blocked. */\ndeclare function mp_grid_add_rectangle(grid_id: number, x1: number, y1: number, x2: number, y2: number): void;\n/** Marks all cells overlapping a room-space rectangle as free. */\ndeclare function mp_grid_clear_rectangle(grid_id: number, x1: number, y1: number, x2: number, y2: number): void;\n/**\n * Blocks every cell covered by an instance of `obj` in the current room (by bounding box).\n * @param prec - Reserved for precise (per-pixel) masks; currently bbox-based\n */\ndeclare function mp_grid_add_instances(grid_id: number, obj: typeof instance, _prec?: boolean): void;\n/**\n * Computes an A* path through free cells and stores the waypoints (cell centres) in `path_id`.\n * @param allowdiag - Permit diagonal moves\n * @returns True if a path was found\n */\ndeclare function mp_grid_path(grid_id: number, path_id: number, xstart: number, ystart: number, xgoal: number, ygoal: number, allowdiag: boolean): boolean;\n/**\n * Tunes `mp_potential_step`'s obstacle-avoidance sweep.\n * @param maxrot - Maximum heading deviation searched (degrees)\n * @param rotstep - Angular step of the search (degrees)\n * @param _ahead - GMS look-ahead (reserved)\n * @param _onspot - GMS rotate-on-spot (reserved)\n */\ndeclare function mp_potential_settings(maxrot: number, rotstep: number, _ahead?: number, _onspot?: boolean): void;\n/** Internal: current potential-step settings (read by instance.mp_potential_step). */\ndeclare function _mp_potential_settings(): {\n    maxrot: number;\n    rotstep: number;\n};\n//# sourceMappingURL=motion_planning.d.ts.map\n/**\n * Path system \u2014 smooth curves through a series of points.\n *\n * Mirrors the GMS path API:\n *   path_create, path_delete, path_add_point, path_get_x, path_get_y,\n *   path_get_speed, path_get_length, path_get_number,\n *   path_set_closed, path_set_kind, path_flip, path_mirror,\n *   path_exists, path_clear_points\n *\n * Two kinds of path:\n *   path_kind_linear  (0) \u2014 straight line segments between points\n *   path_kind_smooth  (1) \u2014 Catmull-Rom spline through points\n *\n * Position is queried via a normalised parameter t \u2208 [0, 1].\n */\ndeclare const path_kind_linear = 0;\ndeclare const path_kind_smooth = 1;\n/** Path end actions for `path_start`. */\ndeclare const path_action_stop = 0;\ndeclare const path_action_restart = 1;\ndeclare const path_action_continue = 2;\ndeclare const path_action_reverse = 3;\n/**\n * Creates a new empty path.\n * @returns Path ID\n */\ndeclare function path_create(): number;\n/**\n * Destroys a path.\n * @param path_id - Path ID\n */\ndeclare function path_delete(path_id: number): void;\n/**\n * Returns true if the path ID is valid.\n * @param path_id - Path ID\n */\ndeclare function path_exists(path_id: number): boolean;\n/**\n * Adds a control point to a path.\n * @param path_id - Path ID\n * @param x - Point X\n * @param y - Point Y\n * @param speed - Speed factor at this point (default 1)\n */\ndeclare function path_add_point(path_id: number, x: number, y: number, speed?: number): void;\n/**\n * Removes all control points from a path.\n * @param path_id - Path ID\n */\ndeclare function path_clear_points(path_id: number): void;\n/**\n * Returns the number of control points on a path.\n * @param path_id - Path ID\n */\ndeclare function path_get_number(path_id: number): number;\n/**\n * Returns the X position on a path at normalised position t (0\u20131).\n * @param path_id - Path ID\n * @param t - Position along path (0 = start, 1 = end)\n */\ndeclare function path_get_x(path_id: number, t: number): number;\n/**\n * Returns the Y position on a path at normalised position t (0\u20131).\n * @param path_id - Path ID\n * @param t - Position along path\n */\ndeclare function path_get_y(path_id: number, t: number): number;\n/**\n * Returns the speed factor on a path at normalised position t.\n * @param path_id - Path ID\n * @param t - Position along path\n */\ndeclare function path_get_speed(path_id: number, t: number): number;\n/**\n * Returns the approximate total length of a path in pixels.\n * @param path_id - Path ID\n */\ndeclare function path_get_length(path_id: number): number;\n/**\n * Returns the X coordinate of the nth control point (0-based).\n * @param path_id - Path ID\n * @param n - Point index\n */\ndeclare function path_get_point_x(path_id: number, n: number): number;\n/**\n * Returns the Y coordinate of the nth control point (0-based).\n * @param path_id - Path ID\n * @param n - Point index\n */\ndeclare function path_get_point_y(path_id: number, n: number): number;\n/**\n * Returns the speed of the nth control point (0-based).\n * @param path_id - Path ID\n * @param n - Point index\n */\ndeclare function path_get_point_speed(path_id: number, n: number): number;\n/**\n * Sets whether the path is closed (loops back to the start).\n * @param path_id - Path ID\n * @param closed - True to close the path\n */\ndeclare function path_set_closed(path_id: number, closed: boolean): void;\n/**\n * Sets the interpolation kind for a path.\n * @param path_id - Path ID\n * @param kind - path_kind_linear | path_kind_smooth\n */\ndeclare function path_set_kind(path_id: number, kind: number): void;\n/**\n * Sets the spline precision (number of subdivisions per segment).\n * Higher values improve length accuracy for smooth paths.\n * @param path_id - Path ID\n * @param precision - Steps per segment (default 8)\n */\ndeclare function path_set_precision(path_id: number, precision: number): void;\n/**\n * Flips the path horizontally around the centre of its bounding box.\n * @param path_id - Path ID\n */\ndeclare function path_flip(path_id: number): void;\n/**\n * Mirrors the path vertically around the centre of its bounding box.\n * @param path_id - Path ID\n */\ndeclare function path_mirror(path_id: number): void;\n/**\n * Reverses the order of points on a path.\n * @param path_id - Path ID\n */\ndeclare function path_reverse(path_id: number): void;\n/** Registers a path resource under a name so it can be looked up by name. */\ndeclare function path_register_name(name: string, id: number): void;\n/**\n * Returns the id of a path by its project name, or -1 if unknown.\n * GMS-style asset lookup \u2014 e.g. `path_start(path_get_index('pth_patrol'), \u2026)`.\n * @param name - Path resource name\n */\ndeclare function path_get_index(name: string): number;\n//# sourceMappingURL=path.d.ts.map\n/**\n * Abstract base class for all game resources.\n * Provides auto-incrementing unique ID and name for each resource instance.\n */\ndeclare abstract class resource {\n    private static gid;\n    private static all;\n    readonly id: number;\n    readonly name: string;\n    /**\n     * Increments and returns the next available resource ID.\n     * @returns The next unique resource ID\n     */\n    private incrementID;\n    constructor();\n    protected static removeByID(id: number): void;\n    static findByID(id: number): resource | undefined;\n}\n//# sourceMappingURL=resource.d.ts.map\n\n/**\n * Data structure representing a single tile in a room.\n */\ninterface tile_data {\n    id: number;\n    x: number;\n    y: number;\n    background: number;\n    left: number;\n    top: number;\n    width: number;\n    height: number;\n    depth: number;\n    xscale: number;\n    yscale: number;\n    alpha: number;\n    visible: boolean;\n}\n/**\n * Represents a game room containing instances, backgrounds, and views.\n * Rooms define the playable spaces where game logic executes.\n */\ndeclare class room extends resource {\n    room_width: number;\n    room_height: number;\n    room_caption: string;\n    room_speed: number;\n    room_persistent: boolean;\n    room_previous: number;\n    room_next: number;\n    creation_code: (() => void) | null;\n    background_visible: boolean[];\n    background_foreground: boolean[];\n    background_index: number[];\n    background_x: number[];\n    background_y: number[];\n    background_htiled: boolean[];\n    background_vtiled: boolean[];\n    background_hspeed: number[];\n    background_vspeed: number[];\n    background_color: number[];\n    background_stretch: boolean[];\n    background_show_color: boolean;\n    background_solid_color: number;\n    _bg_scroll_x: number[];\n    _bg_scroll_y: number[];\n    view_enabled: boolean;\n    view_current: number;\n    view_visible: boolean[];\n    view_xview: number[];\n    view_yview: number[];\n    view_wview: number[];\n    view_hview: number[];\n    view_xport: number[];\n    view_yport: number[];\n    view_wport: number[];\n    view_hport: number[];\n    view_hborder: number[];\n    view_vborder: number[];\n    view_hspeed: number[];\n    view_vspeed: number[];\n    view_object: number[];\n    private tiles;\n    private all;\n    constructor();\n    /**\n     * Transitions to the specified room.\n     * @param target - The room to go to (ID or room reference)\n     */\n    room_goto(target: number | room): void;\n    /**\n     * Transitions to the previous room in the room order.\n     */\n    room_goto_previous(): void;\n    /**\n     * Transitions to the next room in the room order.\n     */\n    room_goto_next(): void;\n    /**\n     * Restarts the current room, resetting all non-persistent instances.\n     */\n    room_restart(): void;\n    /**\n     * Checks if a room with the given ID exists.\n     * @param id - The room ID to check\n     * @returns True if the room exists\n     */\n    room_exists(id: number): boolean;\n    /**\n     * Adds an instance to the room at design time (before room starts).\n     * @param x - X position for the instance\n     * @param y - Y position for the instance\n     * @param obj - The instance to add\n     */\n    room_instance_add(x: number, y: number, obj: instance): void;\n    /**\n     * Adds an instance to this room at runtime.\n     * @param inst - The instance to add\n     */\n    instance_add(inst: instance): void;\n    /**\n     * Removes an instance from this room by ID.\n     * @param id - The instance ID to remove\n     * @returns True if the instance was found and removed\n     */\n    instance_remove(id: number): boolean;\n    /**\n     * Gets an instance from this room by ID.\n     * @param id - The instance ID to find\n     * @returns The instance, or undefined if not found\n     */\n    instance_get(id: number): instance | undefined;\n    /**\n     * Gets all instances in this room.\n     * @returns Array of all instances\n     */\n    instance_get_all(): instance[];\n    /**\n     * Gets the number of instances in this room.\n     * @returns The instance count\n     */\n    instance_count(): number;\n    /**\n     * Removes all instances from the room's design-time instance list.\n     */\n    room_instance_clear(): void;\n    /**\n     * Registers all instances in this room with the game loop.\n     * Called when entering a room to set up event handlers.\n     */\n    register_all_instances(): void;\n    /**\n     * Populates this room's instances / tiles / layers from its design definition.\n     * Set by the build's generated entry; runs each time a non-persistent room is\n     * entered, and only the first time a persistent room is entered.\n     */\n    builder: (() => void) | null;\n    /** Whether this room has been built at least once (drives persistent restore). */\n    built: boolean;\n    /**\n     * Tears down the room's live contents (instances + tiles + scroll offsets) so the\n     * builder can repopulate it cleanly. Destroyed silently \u2014 no Destroy events fire.\n     */\n    reset_contents(): void;\n    /**\n     * Prepares the room when it becomes the active room.\n     *   - Persistent + already built \u2192 keep the saved live state, just re-hook event\n     *     handlers (Create events do NOT fire again).\n     *   - Otherwise \u2192 rebuild fresh from the definition (Create events queued by the builder).\n     */\n    build_for_entry(): void;\n    /**\n     * Adds a tile to the room at design time.\n     * @param x - X position for the tile\n     * @param y - Y position for the tile\n     * @param background - Background resource containing the tile\n     * @param left - Left offset in the background\n     * @param top - Top offset in the background\n     * @param width - Width of the tile\n     * @param height - Height of the tile\n     * @param depth - Drawing depth of the tile\n     * @returns The unique ID of the created tile\n     */\n    room_tile_add(x: number, y: number, background: number, left: number, top: number, width: number, height: number, depth: number): number;\n    /**\n     * Adds a tile to the room at design time, with extended options.\n     * @param x - X position for the tile\n     * @param y - Y position for the tile\n     * @param background - Background resource containing the tile\n     * @param left - Left offset in the background\n     * @param top - Top offset in the background\n     * @param width - Width of the tile\n     * @param height - Height of the tile\n     * @param depth - Drawing depth of the tile\n     * @param xscale - Horizontal scale factor\n     * @param yscale - Vertical scale factor\n     * @param alpha - Transparency (0-1)\n     * @returns The unique ID of the created tile\n     */\n    room_tile_add_ext(x: number, y: number, background: number, left: number, top: number, width: number, height: number, depth: number, xscale: number, yscale: number, alpha: number): number;\n    /**\n     * Removes all tiles from the room's design-time tile list.\n     */\n    room_tile_clear(): void;\n    private static next_tile_id;\n    /**\n     * Adds a tile at runtime and returns its unique ID.\n     * @param background - Background resource containing the tile\n     * @param left - Left offset in the background\n     * @param top - Top offset in the background\n     * @param width - Width of the tile\n     * @param height - Height of the tile\n     * @param x - X position in the room\n     * @param y - Y position in the room\n     * @param depth - Drawing depth\n     * @returns The unique ID of the created tile\n     */\n    /**\n     * Returns the room's tile list (used by the renderer to draw tile layers).\n     * @returns The array of tiles in this room\n     */\n    get_tiles(): tile_data[];\n    tile_add(background: number, left: number, top: number, width: number, height: number, x: number, y: number, depth: number): number;\n    /**\n     * Deletes a tile by its ID.\n     * @param id - The tile ID to delete\n     * @returns True if the tile was found and deleted\n     */\n    tile_delete(id: number): boolean;\n    /**\n     * Checks if a tile with the given ID exists.\n     * @param id - The tile ID to check\n     * @returns True if the tile exists\n     */\n    tile_exists(id: number): boolean;\n    /**\n     * Gets the X position of a tile.\n     * @param id - The tile ID\n     * @returns The X position, or 0 if not found\n     */\n    tile_get_x(id: number): number;\n    /**\n     * Gets the Y position of a tile.\n     * @param id - The tile ID\n     * @returns The Y position, or 0 if not found\n     */\n    tile_get_y(id: number): number;\n    /**\n     * Gets the depth of a tile.\n     * @param id - The tile ID\n     * @returns The depth, or 0 if not found\n     */\n    tile_get_depth(id: number): number;\n    /**\n     * Gets the visibility of a tile.\n     * @param id - The tile ID\n     * @returns True if visible, false if not found or hidden\n     */\n    tile_get_visible(id: number): boolean;\n    /**\n     * Sets the position of a tile.\n     * @param id - The tile ID\n     * @param x - New X position\n     * @param y - New Y position\n     */\n    tile_set_position(id: number, x: number, y: number): void;\n    /**\n     * Sets the depth of a tile.\n     * @param id - The tile ID\n     * @param depth - New depth value\n     */\n    tile_set_depth(id: number, depth: number): void;\n    /**\n     * Sets the visibility of a tile.\n     * @param id - The tile ID\n     * @param visible - Whether the tile should be visible\n     */\n    tile_set_visible(id: number, visible: boolean): void;\n    /**\n     * Sets the scale of a tile.\n     * @param id - The tile ID\n     * @param xscale - Horizontal scale factor\n     * @param yscale - Vertical scale factor\n     */\n    tile_set_scale(id: number, xscale: number, yscale: number): void;\n    /**\n     * Sets the alpha (transparency) of a tile.\n     * @param id - The tile ID\n     * @param alpha - Alpha value (0-1)\n     */\n    tile_set_alpha(id: number, alpha: number): void;\n    /**\n     * Sets the background region of a tile.\n     * @param id - The tile ID\n     * @param background - Background resource ID\n     * @param left - Left offset in the background\n     * @param top - Top offset in the background\n     * @param width - Width of the tile region\n     * @param height - Height of the tile region\n     */\n    tile_set_background(id: number, background: number, left: number, top: number, width: number, height: number): void;\n    /**\n     * Deletes all tiles at a specific depth.\n     * @param depth - The depth to clear\n     */\n    tile_layer_delete(depth: number): void;\n    /**\n     * Shifts all tiles at a specific depth by the given amount.\n     * @param depth - The depth layer to shift\n     * @param x - Horizontal shift amount\n     * @param y - Vertical shift amount\n     */\n    tile_layer_shift(depth: number, x: number, y: number): void;\n    /**\n     * Finds a tile at the given position and depth.\n     * @param x - X position to check\n     * @param y - Y position to check\n     * @param depth - Depth to check\n     * @returns The tile ID, or -1 if not found\n     */\n    tile_layer_find(x: number, y: number, depth: number): number;\n    /**\n     * Sets the background for a specific layer in this room.\n     * @param index - Background layer index (0-7)\n     * @param visible - Whether the background is visible\n     * @param foreground - Whether it draws in front of instances\n     * @param background - Background resource ID\n     * @param x - X offset\n     * @param y - Y offset\n     * @param htiled - Whether to tile horizontally\n     * @param vtiled - Whether to tile vertically\n     * @param hspeed - Horizontal scroll speed\n     * @param vspeed - Vertical scroll speed\n     */\n    room_set_background(index: number, visible: boolean, foreground: boolean, background: number, x: number, y: number, htiled: boolean, vtiled: boolean, hspeed: number, vspeed: number): void;\n    /**\n     * Sets the background color for a specific layer.\n     * @param index - Background layer index\n     * @param color - The color value\n     */\n    room_set_background_color(index: number, color: number): void;\n    /**\n     * Configures a view for this room (design-time).\n     * @param index - View index\n     * @param visible - Whether the view is enabled\n     * @param xview - X position of the view in the room\n     * @param yview - Y position of the view in the room\n     * @param wview - Width of the view in the room\n     * @param hview - Height of the view in the room\n     * @param xport - X position of the viewport on screen\n     * @param yport - Y position of the viewport on screen\n     * @param wport - Width of the viewport on screen\n     * @param hport - Height of the viewport on screen\n     * @param hborder - Horizontal border for object following\n     * @param vborder - Vertical border for object following\n     * @param hspeed - Max horizontal speed when following\n     * @param vspeed - Max vertical speed when following\n     * @param target - Object instance to follow (-1 for none)\n     */\n    room_set_view(index: number, visible: boolean, xview: number, yview: number, wview: number, hview: number, xport: number, yport: number, wport: number, hport: number, hborder: number, vborder: number, hspeed: number, vspeed: number, target: number): void;\n    /**\n     * Enables or disables the view system for this room.\n     * @param enabled - Whether views are enabled\n     */\n    room_set_view_enabled(enabled: boolean): void;\n    /**\n     * Gets the X position of a view in room coordinates.\n     * @param index - View index\n     * @returns The X position of the view\n     */\n    view_get_xview(index: number): number;\n    /**\n     * Gets the Y position of a view in room coordinates.\n     * @param index - View index\n     * @returns The Y position of the view\n     */\n    view_get_yview(index: number): number;\n    /**\n     * Gets the width of a view.\n     * @param index - View index\n     * @returns The width of the view\n     */\n    view_get_wview(index: number): number;\n    /**\n     * Gets the height of a view.\n     * @param index - View index\n     * @returns The height of the view\n     */\n    view_get_hview(index: number): number;\n    /**\n     * Sets the position of a view at runtime.\n     * @param index - View index\n     * @param x - New X position\n     * @param y - New Y position\n     */\n    view_set_position(index: number, x: number, y: number): void;\n    /**\n     * Sets the size of a view at runtime.\n     * @param index - View index\n     * @param w - New width\n     * @param h - New height\n     */\n    view_set_size(index: number, w: number, h: number): void;\n    /**\n     * Sets the viewport position on screen.\n     * @param index - View index\n     * @param x - X position on screen\n     * @param y - Y position on screen\n     */\n    view_set_port_position(index: number, x: number, y: number): void;\n    /**\n     * Sets the viewport size on screen.\n     * @param index - View index\n     * @param w - Width on screen\n     * @param h - Height on screen\n     */\n    view_set_port_size(index: number, w: number, h: number): void;\n    /**\n     * Sets the object for a view to follow.\n     * @param index - View index\n     * @param obj - Instance ID to follow (-1 for none)\n     */\n    view_set_object(index: number, obj: number): void;\n    /**\n     * Sets the border area for view following.\n     * @param index - View index\n     * @param hborder - Horizontal border in pixels\n     * @param vborder - Vertical border in pixels\n     */\n    view_set_border(index: number, hborder: number, vborder: number): void;\n    /**\n     * Sets the maximum speed for view following.\n     * @param index - View index\n     * @param hspeed - Max horizontal speed\n     * @param vspeed - Max vertical speed\n     */\n    view_set_speed(index: number, hspeed: number, vspeed: number): void;\n    /**\n     * Converts a screen X coordinate to room coordinates for a specific view.\n     * @param index - View index\n     * @param x - Screen X coordinate\n     * @returns Room X coordinate\n     */\n    view_screen_to_room_x(index: number, x: number): number;\n    /**\n     * Converts a screen Y coordinate to room coordinates for a specific view.\n     * @param index - View index\n     * @param y - Screen Y coordinate\n     * @returns Room Y coordinate\n     */\n    view_screen_to_room_y(index: number, y: number): number;\n    /**\n     * Converts a room X coordinate to screen coordinates for a specific view.\n     * @param index - View index\n     * @param x - Room X coordinate\n     * @returns Screen X coordinate\n     */\n    view_room_to_screen_x(index: number, x: number): number;\n    /**\n     * Converts a room Y coordinate to screen coordinates for a specific view.\n     * @param index - View index\n     * @param y - Room Y coordinate\n     * @returns Screen Y coordinate\n     */\n    view_room_to_screen_y(index: number, y: number): number;\n}\n\n//# sourceMappingURL=room.d.ts.map\n/**\n * System / game globals \u2014 frame timing, the high-resolution timer, and blocking dialogs.\n *\n * GMS exposes some of these as read-only variables (`fps`, `delta_time`); Silkweaver exposes\n * them as functions to fit its function-based API. The dialog functions use the host's native\n * prompts (browser `alert`/`confirm`/`prompt`) and degrade to the console on headless hosts.\n */\n/** Frames per second the game is actually drawing, measured over the last second. */\ndeclare function fps(): number;\n/** Frames per second the machine could draw uncapped (instantaneous, from the last frame). */\ndeclare function fps_real(): number;\n/** Microseconds that elapsed during the previous frame (GMS `delta_time`). */\ndeclare function delta_time(): number;\n/** Microseconds since the game started \u2014 a monotonic high-resolution timer (GMS `get_timer`). */\ndeclare function get_timer(): number;\n/** Milliseconds since the game started (monotonic). */\ndeclare function current_time(): number;\n/** Writes a line to the debug console. */\ndeclare function show_debug_message(message: unknown): void;\n/** Sets the application/window title (browser: `document.title`). */\ndeclare function set_application_title(title: string): void;\n/** Shows a blocking message dialog (browser `alert`; logs on headless hosts). */\ndeclare function show_message(message: unknown): void;\n/** Shows a blocking yes/no dialog; returns true for \"yes\" (browser `confirm`). */\ndeclare function show_question(message: unknown): boolean;\n/**\n * Prompts for a string with a default value (browser `prompt`).\n * @param message - The prompt text\n * @param default_value - Returned if the user cancels or the host is headless\n */\ndeclare function get_string(message: unknown, default_value?: string): string;\n/**\n * Prompts for a number with a default value; non-numeric or cancelled input returns the default.\n * @param message - The prompt text\n * @param default_value - Returned if the user cancels, the input isn't a number, or the host is headless\n */\ndeclare function get_integer(message: unknown, default_value?: number): number;\n//# sourceMappingURL=system.d.ts.map\n/**\n * Global tile functions (GMS `tile_*`) \u2014 thin wrappers that act on the current room.\n *\n * The room owns the tile data + management (see `room.ts`); these free functions are the GMS-style\n * fa\xE7ade so game code can call `tile_add(...)` etc. without a room reference. A tileset in GMS 1.4 is\n * just a background, and a tile is a rectangular region of it \u2014 `tile_add(background, left, top, w, h, \u2026)`.\n *\n * (On-screen tile rendering is part of the room-rendering pass, alongside views/backgrounds.)\n */\n/**\n * Adds a tile (a region of a background) to the current room at a depth.\n * @returns The tile id, or -1 if there is no current room\n */\ndeclare function tile_add(background: number, left: number, top: number, width: number, height: number, x: number, y: number, depth: number): number;\n/** Deletes a tile by id. */\ndeclare function tile_delete(tile_id: number): boolean;\n/** Returns true if a tile id exists in the current room. */\ndeclare function tile_exists(tile_id: number): boolean;\n/** Returns a tile's X position. */\ndeclare function tile_get_x(tile_id: number): number;\n/** Returns a tile's Y position. */\ndeclare function tile_get_y(tile_id: number): number;\n/** Returns a tile's depth. */\ndeclare function tile_get_depth(tile_id: number): number;\n/** Returns a tile's visibility. */\ndeclare function tile_get_visible(tile_id: number): boolean;\n/** Sets a tile's position. */\ndeclare function tile_set_position(tile_id: number, x: number, y: number): void;\n/** Sets a tile's depth. */\ndeclare function tile_set_depth(tile_id: number, depth: number): void;\n/** Sets a tile's visibility. */\ndeclare function tile_set_visible(tile_id: number, visible: boolean): void;\n/** Sets a tile's scale. */\ndeclare function tile_set_scale(tile_id: number, xscale: number, yscale: number): void;\n/** Sets a tile's alpha (0\u20131). */\ndeclare function tile_set_alpha(tile_id: number, alpha: number): void;\n/** Sets the background region a tile draws from. */\ndeclare function tile_set_background(tile_id: number, background: number, left: number, top: number, width: number, height: number): void;\n/** Deletes every tile at a depth. */\ndeclare function tile_layer_delete(depth: number): void;\n/** Shifts every tile at a depth by (x, y). */\ndeclare function tile_layer_shift(depth: number, x: number, y: number): void;\n/** Finds the topmost tile at a position and depth, or -1. */\ndeclare function tile_layer_find(x: number, y: number, depth: number): number;\n//# sourceMappingURL=tiles.d.ts.map\n/**\n * Timeline system \u2014 execute callbacks at specific step moments.\n *\n * Mirrors the GMS timeline API:\n *   timeline_create, timeline_delete, timeline_moment_add,\n *   timeline_moment_clear, timeline_exists, timeline_get_moment_count\n *\n * A timeline is advanced manually by calling timeline_step().\n * Each registered moment fires its callback when the playhead reaches\n * or passes that step number.\n *\n * GMS timelines are attached to instances; here they are standalone\n * objects that you advance explicitly, which is simpler and more flexible.\n */\n/**\n * Creates a new empty timeline.\n * @returns Timeline ID\n */\ndeclare function timeline_create(): number;\n/**\n * Destroys a timeline.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_delete(timeline_id: number): void;\n/**\n * Returns true if the timeline ID is valid.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_exists(timeline_id: number): boolean;\n/**\n * Adds a callback to fire at a specific step moment.\n * Multiple callbacks can share the same step \u2014 they fire in insertion order.\n * @param timeline_id - Timeline ID\n * @param step - Step index\n * @param cb - Callback to execute at that step\n */\ndeclare function timeline_moment_add(timeline_id: number, step: number, cb: () => void): void;\n/**\n * Removes all callbacks registered at a specific step.\n * @param timeline_id - Timeline ID\n * @param step - Step index to clear\n */\ndeclare function timeline_moment_clear(timeline_id: number, step: number): void;\n/**\n * Returns the number of moments registered on a timeline.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_get_moment_count(timeline_id: number): number;\n/**\n * Sets the playback speed (steps advanced per timeline_step call).\n * @param timeline_id - Timeline ID\n * @param speed - Steps per advance (default 1)\n */\ndeclare function timeline_set_speed(timeline_id: number, speed: number): void;\n/**\n * Sets whether the timeline loops when it reaches the end.\n * @param timeline_id - Timeline ID\n * @param loop - True to loop\n */\ndeclare function timeline_set_loop(timeline_id: number, loop: boolean): void;\n/**\n * Starts or resumes playback.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_play(timeline_id: number): void;\n/**\n * Pauses playback without resetting the position.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_pause(timeline_id: number): void;\n/**\n * Stops playback and resets the playhead to position 0.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_stop(timeline_id: number): void;\n/**\n * Jumps the playhead to a specific step position.\n * @param timeline_id - Timeline ID\n * @param pos - Step position\n */\ndeclare function timeline_set_position(timeline_id: number, pos: number): void;\n/**\n * Returns the current playhead position.\n * @param timeline_id - Timeline ID\n */\ndeclare function timeline_get_position(timeline_id: number): number;\n/**\n * Advances a timeline by its speed and fires any moments crossed.\n * Call this once per game step for each active timeline.\n * @param timeline_id - Timeline ID\n * @returns True if the timeline is still playing, false if it has finished (and is not looping)\n */\ndeclare function timeline_step(timeline_id: number): boolean;\n/**\n * Advances all playing timelines by one step.\n * Convenience function \u2014 call once per game step to update all timelines.\n */\ndeclare function timeline_step_all(): void;\n/** Registers a timeline resource under a name so it can be looked up by name. */\ndeclare function timeline_register_name(name: string, id: number): void;\n/**\n * Returns the id of a timeline by its project name, or -1 if unknown.\n * GMS-style asset lookup \u2014 e.g. `timeline_play(timeline_get_index('tml_intro'))`.\n * @param name - Timeline resource name\n */\ndeclare function timeline_get_index(name: string): number;\n//# sourceMappingURL=timeline.d.ts.map\n/**\n * Runtime type-checking helpers mirroring GMS's is_* family.\n * In JS these reduce to typeof / structural tests.\n */\n/** True if the value is a number (GMS real). */\ndeclare function is_real(value: unknown): boolean;\n/** True if the value is a string. */\ndeclare function is_string(value: unknown): boolean;\n/** True if the value is an array. */\ndeclare function is_array(value: unknown): boolean;\n/** True if the value is undefined. */\ndeclare function is_undefined(value: unknown): boolean;\n/** True if the value is a boolean. */\ndeclare function is_bool(value: unknown): boolean;\n/** True if the value is numeric (a number or boolean, matching GMS). */\ndeclare function is_numeric(value: unknown): boolean;\n/** True if the value is an integer within the signed 32-bit range. */\ndeclare function is_int32(value: unknown): boolean;\n/** True if the value is an integer outside the signed 32-bit range. */\ndeclare function is_int64(value: unknown): boolean;\n/** True if the value is NaN. */\ndeclare function is_nan(value: unknown): boolean;\n/** True if the value is positive or negative infinity. */\ndeclare function is_infinity(value: unknown): boolean;\n/** True if the value is callable (GMS 2.x is_method; useful for script refs). */\ndeclare function is_method(value: unknown): boolean;\n//# sourceMappingURL=type_checks.d.ts.map\n/**\n * Reflection helpers for reading/writing instance and global variables by\n * name, mirroring GMS's variable_instance_* and variable_global_* families.\n *\n * Globals live in `global_store`; user/generated code can import it directly\n * (e.g. `global_store.score = 0`) and the variable_global_* functions stay in\n * sync with it.\n */\n/** Shared key/value store backing the variable_global_* functions. */\ndeclare const global_store: Record<string, any>;\n/** Returns the value of a named variable on an instance. */\ndeclare function variable_instance_get(inst: object, name: string): any;\n/** Sets a named variable on an instance. */\ndeclare function variable_instance_set(inst: object, name: string, value: any): void;\n/** True if the instance has the named variable. */\ndeclare function variable_instance_exists(inst: object, name: string): boolean;\n/** Returns the names of an instance's own enumerable variables. */\ndeclare function variable_instance_get_names(inst: object): string[];\n/** Returns the value of a named global variable. */\ndeclare function variable_global_get(name: string): any;\n/** Sets a named global variable. */\ndeclare function variable_global_set(name: string, value: any): void;\n/** True if the named global variable exists. */\ndeclare function variable_global_exists(name: string): boolean;\n/** Returns the names of all defined global variables. */\ndeclare function variable_global_get_names(): string[];\n//# sourceMappingURL=variables.d.ts.map\n/**\n * Window / display functions (GMS parity).\n *\n * The engine is portable: caption maps to the document title, display size to the\n * screen, window size to the game canvas, and fullscreen to the Fullscreen API.\n * All functions guard their host APIs so they no-op safely off-DOM (e.g. tests).\n */\n/** Sets the window/title-bar caption. */\ndeclare function window_set_caption(caption: string): void;\n/** Returns the current window caption. */\ndeclare function window_get_caption(): string;\n/** Width of the game window (the canvas drawing surface) in pixels. */\ndeclare function window_get_width(): number;\n/** Height of the game window (the canvas drawing surface) in pixels. */\ndeclare function window_get_height(): number;\n/** Resizes the game canvas (best-effort; the loop re-projects each frame). */\ndeclare function window_set_size(w: number, h: number): void;\n/** Width of the display (monitor) in pixels. */\ndeclare function display_get_width(): number;\n/** Height of the display (monitor) in pixels. */\ndeclare function display_get_height(): number;\n/** Width of the GUI layer (same as the window in this engine). */\ndeclare function display_get_gui_width(): number;\n/** Height of the GUI layer (same as the window in this engine). */\ndeclare function display_get_gui_height(): number;\n/** Enters or exits fullscreen using the browser Fullscreen API. */\ndeclare function window_set_fullscreen(full: boolean): void;\n/** True if the game is currently fullscreen. */\ndeclare function window_get_fullscreen(): boolean;\n//# sourceMappingURL=window.d.ts.map\n/**\n * GMS-style array helpers operating on native JS arrays.\n * Indices are 0-based (JS convention). Functions that GMS specifies as\n * in-place (push/insert/delete/sort/resize/set/copy) mutate the array;\n * array_reverse/array_concat return new arrays (matching modern GMS).\n */\n/** Creates a new array of `size` elements, each set to `value` (default 0). */\ndeclare function array_create<T = number>(size: number, value?: T): T[];\n/** Returns the length of the array. */\ndeclare function array_length<T>(arr: T[]): number;\n/** Alias for array_length (GMS 1.4 1D arrays). */\ndeclare function array_length_1d<T>(arr: T[]): number;\n/** Returns the element at `index` (undefined if out of range). */\ndeclare function array_get<T>(arr: T[], index: number): T | undefined;\n/** Sets the element at `index`, growing the array (gaps filled with 0) if needed. */\ndeclare function array_set<T>(arr: T[], index: number, value: T): void;\n/** Resizes the array in place, truncating or padding with 0. */\ndeclare function array_resize<T>(arr: T[], new_size: number): void;\n/**\n * Copies `length` elements from `src` (starting at `src_index`) into `dest`\n * starting at `dest_index`, growing `dest` if necessary.\n */\ndeclare function array_copy<T>(dest: T[], dest_index: number, src: T[], src_index: number, length: number): void;\n/** True if both arrays have the same length and strictly-equal elements. */\ndeclare function array_equals<T>(a: T[], b: T[]): boolean;\n/** Appends values to the end of the array. Returns the new length. */\ndeclare function array_push<T>(arr: T[], ...values: T[]): number;\n/** Removes and returns the last element of the array. */\ndeclare function array_pop<T>(arr: T[]): T | undefined;\n/** Removes and returns the first element of the array. */\ndeclare function array_shift<T>(arr: T[]): T | undefined;\n/** Inserts values at `index`, shifting later elements right. */\ndeclare function array_insert<T>(arr: T[], index: number, ...values: T[]): void;\n/** Removes `number` elements starting at `index`. */\ndeclare function array_delete<T>(arr: T[], index: number, number?: number): void;\n/**\n * Sorts the array in place. Pass `true` for ascending, `false` for descending,\n * or a comparator function (a,b) => number.\n */\ndeclare function array_sort<T>(arr: T[], type?: boolean | ((a: T, b: T) => number)): void;\n/** Returns a new array with the elements in reverse order. */\ndeclare function array_reverse<T>(arr: T[]): T[];\n/** Returns a new array concatenating all the given arrays. */\ndeclare function array_concat<T>(...arrays: T[][]): T[];\n/** True if the array contains `value`. */\ndeclare function array_contains<T>(arr: T[], value: T): boolean;\n/** Returns the index of `value` from `offset` onward, or -1 if not found. */\ndeclare function array_get_index<T>(arr: T[], value: T, offset?: number): number;\n//# sourceMappingURL=array_utils.d.ts.map\n/**\n * DS Grid \u2014 fixed-size 2D array.\n *\n * GMS-compatible API: ds_grid_create, ds_grid_destroy, ds_grid_get,\n * ds_grid_set, ds_grid_add, ds_grid_multiply, ds_grid_clear,\n * ds_grid_width, ds_grid_height, ds_grid_copy,\n * ds_grid_region_get, ds_grid_region_set,\n * ds_grid_get_max, ds_grid_get_min, ds_grid_get_mean, ds_grid_get_sum,\n * ds_grid_set_region, ds_grid_add_region, ds_grid_multiply_region.\n */\n/**\n * Creates a new DS grid filled with zeros.\n * @param w - Number of columns\n * @param h - Number of rows\n * @returns Grid ID\n */\ndeclare function ds_grid_create(w: number, h: number): number;\n/**\n * Destroys a DS grid.\n * @param id - Grid ID\n */\ndeclare function ds_grid_destroy(id: number): void;\n/** Serializes a grid to a string (GMS `ds_grid_write`). */\ndeclare function ds_grid_write(id: number): string;\n/** Restores a grid from a `ds_grid_write` string, replacing its size and contents. */\ndeclare function ds_grid_read(id: number, str: string): void;\n/**\n * Returns the value at grid cell (x, y).\n * @param id - Grid ID\n * @param x - Column (0-based)\n * @param y - Row (0-based)\n */\ndeclare function ds_grid_get(id: number, x: number, y: number): number;\n/**\n * Sets the value at grid cell (x, y).\n * @param id - Grid ID\n * @param x - Column\n * @param y - Row\n * @param val - Value to set\n */\ndeclare function ds_grid_set(id: number, x: number, y: number, val: number): void;\n/**\n * Adds a value to the cell at (x, y).\n * @param id - Grid ID\n * @param x - Column\n * @param y - Row\n * @param val - Amount to add\n */\ndeclare function ds_grid_add(id: number, x: number, y: number, val: number): void;\n/**\n * Multiplies the value at (x, y) by a factor.\n * @param id - Grid ID\n * @param x - Column\n * @param y - Row\n * @param factor - Multiplier\n */\ndeclare function ds_grid_multiply(id: number, x: number, y: number, factor: number): void;\n/**\n * Sets all cells in the grid to the given value.\n * @param id - Grid ID\n * @param val - Value to fill with\n */\ndeclare function ds_grid_clear(id: number, val: number): void;\n/** Returns the width (column count) of the grid. */\ndeclare function ds_grid_width(id: number): number;\n/** Returns the height (row count) of the grid. */\ndeclare function ds_grid_height(id: number): number;\n/**\n * Copies one grid into another. Both must have the same dimensions.\n * @param src - Source grid ID\n * @param dst - Destination grid ID\n */\ndeclare function ds_grid_copy(src: number, dst: number): void;\n/**\n * Returns values in a rectangular region as a flat array (row-major).\n * Clamps to grid boundaries; out-of-bounds cells return 0.\n * @param id - Grid ID\n * @param x1 - Left column\n * @param y1 - Top row\n * @param x2 - Right column (inclusive)\n * @param y2 - Bottom row (inclusive)\n */\ndeclare function ds_grid_region_get(id: number, x1: number, y1: number, x2: number, y2: number): number[];\n/**\n * Sets all cells in a rectangular region to a value.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n * @param val - Value to set\n */\ndeclare function ds_grid_set_region(id: number, x1: number, y1: number, x2: number, y2: number, val: number): void;\n/**\n * Adds a value to all cells in a rectangular region.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n * @param val - Amount to add\n */\ndeclare function ds_grid_add_region(id: number, x1: number, y1: number, x2: number, y2: number, val: number): void;\n/**\n * Multiplies all cells in a rectangular region by a factor.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n * @param factor - Multiplier\n */\ndeclare function ds_grid_multiply_region(id: number, x1: number, y1: number, x2: number, y2: number, factor: number): void;\n/**\n * Returns the maximum value in a rectangular region.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n */\ndeclare function ds_grid_get_max(id: number, x1: number, y1: number, x2: number, y2: number): number;\n/**\n * Returns the minimum value in a rectangular region.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n */\ndeclare function ds_grid_get_min(id: number, x1: number, y1: number, x2: number, y2: number): number;\n/**\n * Returns the sum of all values in a rectangular region.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n */\ndeclare function ds_grid_get_sum(id: number, x1: number, y1: number, x2: number, y2: number): number;\n/**\n * Returns the mean (average) of all values in a rectangular region.\n * @param id - Grid ID\n * @param x1 - Left\n * @param y1 - Top\n * @param x2 - Right (inclusive)\n * @param y2 - Bottom (inclusive)\n */\ndeclare function ds_grid_get_mean(id: number, x1: number, y1: number, x2: number, y2: number): number;\n/** Returns true if the grid ID exists. */\ndeclare function ds_grid_exists(id: number): boolean;\n//# sourceMappingURL=ds_grid.d.ts.map\n/**\n * DS List \u2014 ordered, resizable array.\n *\n * GMS-compatible API: ds_list_create, ds_list_add, ds_list_insert,\n * ds_list_find_value, ds_list_find_index, ds_list_replace,\n * ds_list_delete, ds_list_size, ds_list_empty, ds_list_clear,\n * ds_list_destroy, ds_list_copy.\n */\n/**\n * Creates a new empty DS list.\n * @returns The list ID\n */\ndeclare function ds_list_create(): number;\n/**\n * Destroys a DS list, freeing its memory.\n * @param id - List ID\n */\ndeclare function ds_list_destroy(id: number): void;\n/** Serializes a list to a string (GMS `ds_list_write`). */\ndeclare function ds_list_write(id: number): string;\n/** Restores a list from a `ds_list_write` string, replacing its contents. */\ndeclare function ds_list_read(id: number, str: string): void;\n/**\n * Adds a value to the end of the list.\n * @param id - List ID\n * @param val - Value to add\n */\ndeclare function ds_list_add(id: number, val: any): void;\n/**\n * Inserts a value at a specific position (0-based).\n * @param id - List ID\n * @param pos - Index to insert at\n * @param val - Value to insert\n */\ndeclare function ds_list_insert(id: number, pos: number, val: any): void;\n/**\n * Returns the value at a given position.\n * @param id - List ID\n * @param pos - Index (0-based)\n * @returns The value at that position, or undefined if out of range\n */\ndeclare function ds_list_find_value(id: number, pos: number): any;\n/**\n * Returns the index of the first occurrence of a value, or -1 if not found.\n * @param id - List ID\n * @param val - Value to search for\n */\ndeclare function ds_list_find_index(id: number, val: any): number;\n/**\n * Replaces the value at a given position.\n * @param id - List ID\n * @param pos - Index to replace\n * @param val - New value\n */\ndeclare function ds_list_replace(id: number, pos: number, val: any): void;\n/**\n * Removes the element at a given position.\n * @param id - List ID\n * @param pos - Index to delete\n */\ndeclare function ds_list_delete(id: number, pos: number): void;\n/**\n * Returns the number of elements in the list.\n * @param id - List ID\n */\ndeclare function ds_list_size(id: number): number;\n/**\n * Returns true if the list has no elements.\n * @param id - List ID\n */\ndeclare function ds_list_empty(id: number): boolean;\n/**\n * Removes all elements from the list.\n * @param id - List ID\n */\ndeclare function ds_list_clear(id: number): void;\n/**\n * Copies the contents of one list into another (overwrites destination).\n * @param src - Source list ID\n * @param dst - Destination list ID\n */\ndeclare function ds_list_copy(src: number, dst: number): void;\n/**\n * Sorts the list in ascending or descending order.\n * @param id - List ID\n * @param ascending - True for ascending, false for descending\n */\ndeclare function ds_list_sort(id: number, ascending: boolean): void;\n/**\n * Shuffles the list in place using Fisher-Yates.\n * @param id - List ID\n */\ndeclare function ds_list_shuffle(id: number): void;\n/** Returns true if the list ID exists. */\ndeclare function ds_list_exists(id: number): boolean;\n//# sourceMappingURL=ds_list.d.ts.map\n/**\n * DS Map \u2014 key/value store (string or number keys).\n *\n * GMS-compatible API: ds_map_create, ds_map_add, ds_map_set,\n * ds_map_find_value, ds_map_exists, ds_map_delete, ds_map_size,\n * ds_map_empty, ds_map_clear, ds_map_destroy, ds_map_copy,\n * ds_map_find_first, ds_map_find_next, ds_map_find_last, ds_map_find_previous.\n */\ntype ds_map_key = string | number;\n/**\n * Creates a new empty DS map.\n * @returns The map ID\n */\ndeclare function ds_map_create(): number;\n/**\n * Destroys a DS map.\n * @param id - Map ID\n */\ndeclare function ds_map_destroy(id: number): void;\n/** Serializes a map to a string (GMS `ds_map_write`). */\ndeclare function ds_map_write(id: number): string;\n/** Restores a map from a `ds_map_write` string, replacing its contents. */\ndeclare function ds_map_read(id: number, str: string): void;\n/**\n * Adds a key/value pair if the key does not already exist.\n * @param id - Map ID\n * @param key - Key (string or number)\n * @param val - Value\n */\ndeclare function ds_map_add(id: number, key: ds_map_key, val: any): void;\n/**\n * Sets a key/value pair, overwriting any existing value.\n * @param id - Map ID\n * @param key - Key\n * @param val - Value\n */\ndeclare function ds_map_set(id: number, key: ds_map_key, val: any): void;\n/**\n * Returns the value for a key, or undefined if not found.\n * @param id - Map ID\n * @param key - Key to look up\n */\ndeclare function ds_map_find_value(id: number, key: ds_map_key): any;\n/**\n * Returns true if the key exists in the map.\n * @param id - Map ID\n * @param key - Key to check\n */\ndeclare function ds_map_exists(id: number, key: ds_map_key): boolean;\n/**\n * Deletes a key from the map.\n * @param id - Map ID\n * @param key - Key to delete\n */\ndeclare function ds_map_delete(id: number, key: ds_map_key): void;\n/**\n * Returns the number of key/value pairs in the map.\n * @param id - Map ID\n */\ndeclare function ds_map_size(id: number): number;\n/**\n * Returns true if the map has no entries.\n * @param id - Map ID\n */\ndeclare function ds_map_empty(id: number): boolean;\n/**\n * Removes all entries from the map.\n * @param id - Map ID\n */\ndeclare function ds_map_clear(id: number): void;\n/**\n * Copies the contents of one map into another (overwrites destination).\n * @param src - Source map ID\n * @param dst - Destination map ID\n */\ndeclare function ds_map_copy(src: number, dst: number): void;\n/**\n * Returns the first key in the map (insertion order), or undefined if empty.\n * @param id - Map ID\n */\ndeclare function ds_map_find_first(id: number): ds_map_key | undefined;\n/**\n * Returns the key that follows `key` in insertion order, or undefined.\n * @param id - Map ID\n * @param key - Reference key\n */\ndeclare function ds_map_find_next(id: number, key: ds_map_key): ds_map_key | undefined;\n/**\n * Returns the last key in the map, or undefined if empty.\n * @param id - Map ID\n */\ndeclare function ds_map_find_last(id: number): ds_map_key | undefined;\n/**\n * Returns the key before `key` in insertion order, or undefined.\n * @param id - Map ID\n * @param key - Reference key\n */\ndeclare function ds_map_find_previous(id: number, key: ds_map_key): ds_map_key | undefined;\n/** Returns true if the map ID exists. */\ndeclare function ds_map_exists_id(id: number): boolean;\n\n//# sourceMappingURL=ds_map.d.ts.map\n/**\n * DS Priority Queue \u2014 values are retrieved in priority order.\n *\n * GMS-compatible API: ds_priority_create, ds_priority_destroy,\n * ds_priority_add, ds_priority_delete_value, ds_priority_delete_min,\n * ds_priority_delete_max, ds_priority_find_min, ds_priority_find_max,\n * ds_priority_find_priority, ds_priority_size, ds_priority_empty,\n * ds_priority_clear, ds_priority_copy.\n *\n * Implemented with a min-heap. Max operations use negated priority.\n */\n/**\n * Creates a new empty DS priority queue.\n * @returns Priority queue ID\n */\ndeclare function ds_priority_create(): number;\n/**\n * Destroys a DS priority queue.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_destroy(id: number): void;\n/**\n * Adds a value with a given priority.\n * Lower priority numbers are retrieved first (min-heap order).\n * @param id - Priority queue ID\n * @param val - Value to add\n * @param priority - Priority number\n */\ndeclare function ds_priority_add(id: number, val: any, priority: number): void;\n/**\n * Removes the first occurrence of a value.\n * @param id - Priority queue ID\n * @param val - Value to remove\n */\ndeclare function ds_priority_delete_value(id: number, val: any): void;\n/**\n * Removes and returns the value with the lowest priority number.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_delete_min(id: number): any;\n/**\n * Removes and returns the value with the highest priority number.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_delete_max(id: number): any;\n/**\n * Returns the value with the lowest priority number without removing it.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_find_min(id: number): any;\n/**\n * Returns the value with the highest priority number without removing it.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_find_max(id: number): any;\n/**\n * Returns the priority of the given value, or undefined if not found.\n * @param id - Priority queue ID\n * @param val - Value to look up\n */\ndeclare function ds_priority_find_priority(id: number, val: any): number | undefined;\n/**\n * Returns the number of items in the priority queue.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_size(id: number): number;\n/**\n * Returns true if the priority queue has no items.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_empty(id: number): boolean;\n/**\n * Removes all items from the priority queue.\n * @param id - Priority queue ID\n */\ndeclare function ds_priority_clear(id: number): void;\n/**\n * Copies the contents of src into dst (overwrites destination).\n * @param src - Source priority queue ID\n * @param dst - Destination priority queue ID\n */\ndeclare function ds_priority_copy(src: number, dst: number): void;\n/** Returns true if the priority queue ID exists. */\ndeclare function ds_priority_exists(id: number): boolean;\n//# sourceMappingURL=ds_priority.d.ts.map\n/**\n * DS Queue \u2014 FIFO (first in, first out) data structure.\n *\n * GMS-compatible API: ds_queue_create, ds_queue_destroy, ds_queue_enqueue,\n * ds_queue_dequeue, ds_queue_head, ds_queue_tail, ds_queue_size,\n * ds_queue_empty, ds_queue_clear, ds_queue_copy.\n *\n * Implemented with a circular buffer for O(1) enqueue and dequeue.\n */\n/**\n * Creates a new empty DS queue.\n * @returns Queue ID\n */\ndeclare function ds_queue_create(): number;\n/**\n * Destroys a DS queue.\n * @param id - Queue ID\n */\ndeclare function ds_queue_destroy(id: number): void;\n/**\n * Adds a value to the back of the queue.\n * @param id - Queue ID\n * @param val - Value to enqueue\n */\ndeclare function ds_queue_enqueue(id: number, val: any): void;\n/**\n * Removes and returns the front value. Returns undefined if empty.\n * @param id - Queue ID\n */\ndeclare function ds_queue_dequeue(id: number): any;\n/**\n * Returns the front value without removing it. Returns undefined if empty.\n * @param id - Queue ID\n */\ndeclare function ds_queue_head(id: number): any;\n/**\n * Returns the back (last enqueued) value without removing it.\n * @param id - Queue ID\n */\ndeclare function ds_queue_tail(id: number): any;\n/**\n * Returns the number of items in the queue.\n * @param id - Queue ID\n */\ndeclare function ds_queue_size(id: number): number;\n/**\n * Returns true if the queue has no items.\n * @param id - Queue ID\n */\ndeclare function ds_queue_empty(id: number): boolean;\n/**\n * Removes all items from the queue.\n * @param id - Queue ID\n */\ndeclare function ds_queue_clear(id: number): void;\n/**\n * Copies items from src into dst (overwrites destination).\n * @param src - Source queue ID\n * @param dst - Destination queue ID\n */\ndeclare function ds_queue_copy(src: number, dst: number): void;\n/** Returns true if the queue ID exists. */\ndeclare function ds_queue_exists(id: number): boolean;\n//# sourceMappingURL=ds_queue.d.ts.map\n/**\n * DS Stack \u2014 LIFO (last in, first out) data structure.\n *\n * GMS-compatible API: ds_stack_create, ds_stack_destroy, ds_stack_push,\n * ds_stack_pop, ds_stack_top, ds_stack_size, ds_stack_empty,\n * ds_stack_clear, ds_stack_copy.\n */\n/**\n * Creates a new empty DS stack.\n * @returns Stack ID\n */\ndeclare function ds_stack_create(): number;\n/**\n * Destroys a DS stack.\n * @param id - Stack ID\n */\ndeclare function ds_stack_destroy(id: number): void;\n/**\n * Pushes a value onto the top of the stack.\n * @param id - Stack ID\n * @param val - Value to push\n */\ndeclare function ds_stack_push(id: number, val: any): void;\n/**\n * Removes and returns the top value. Returns undefined if empty.\n * @param id - Stack ID\n */\ndeclare function ds_stack_pop(id: number): any;\n/**\n * Returns the top value without removing it. Returns undefined if empty.\n * @param id - Stack ID\n */\ndeclare function ds_stack_top(id: number): any;\n/**\n * Returns the number of items in the stack.\n * @param id - Stack ID\n */\ndeclare function ds_stack_size(id: number): number;\n/**\n * Returns true if the stack has no items.\n * @param id - Stack ID\n */\ndeclare function ds_stack_empty(id: number): boolean;\n/**\n * Removes all items from the stack.\n * @param id - Stack ID\n */\ndeclare function ds_stack_clear(id: number): void;\n/**\n * Copies all items from src into dst (overwrites destination).\n * @param src - Source stack ID\n * @param dst - Destination stack ID\n */\ndeclare function ds_stack_copy(src: number, dst: number): void;\n/** Returns true if the stack ID exists. */\ndeclare function ds_stack_exists(id: number): boolean;\n//# sourceMappingURL=ds_stack.d.ts.map\n/**\n * Background resource \u2014 holds a single texture for tiling/stretching.\n * Mirrors GMS background data structure.\n */\n\n/**\n * A background resource containing a single texture.\n */\ndeclare class background extends resource {\n    texture: texture_entry | null;\n    width: number;\n    height: number;\n    tile_h: boolean;\n    tile_v: boolean;\n    smooth: boolean;\n    constructor();\n    /**\n     * Sets the texture for this background.\n     * @param texture - The texture entry to use\n     */\n    set_texture(texture: texture_entry): void;\n}\n/**\n * Returns the width of the given background resource.\n * @param bg - Background instance\n */\ndeclare function background_get_width(bg: background): number;\n/**\n * Returns the height of the given background resource.\n * @param bg - Background instance\n */\ndeclare function background_get_height(bg: background): number;\n//# sourceMappingURL=background.d.ts.map\n/**\n * Batched quad renderer for WebGL 2.\n * Collects sprites and shapes into a single vertex buffer and flushes with one draw call.\n * Automatically flushes when the texture, blend mode, or shader changes,\n * or when the buffer is full.\n */\ndeclare class batch_renderer {\n    private gl;\n    private vao;\n    private vbo;\n    private vertices;\n    private quad_count;\n    private current_texture;\n    constructor(gl: WebGL2RenderingContext);\n    /**\n     * Pushes one axis-aligned quad into the batch.\n     * Flushes the batch if the texture changes or the buffer is full.\n     *\n     * @param x - Left edge\n     * @param y - Top edge\n     * @param w - Width\n     * @param h - Height\n     * @param u0 - Left UV coordinate\n     * @param v0 - Top UV coordinate\n     * @param u1 - Right UV coordinate\n     * @param v1 - Bottom UV coordinate\n     * @param r - Red (0\u20131)\n     * @param g - Green (0\u20131)\n     * @param b - Blue (0\u20131)\n     * @param a - Alpha (0\u20131)\n     * @param texture - WebGL texture to sample\n     */\n    add_quad(x: number, y: number, w: number, h: number, u0: number, v0: number, u1: number, v1: number, r: number, g: number, b: number, a: number, texture: WebGLTexture): void;\n    /**\n     * Pushes a rotated/scaled quad into the batch.\n     * Used for draw_sprite_ext with rotation and scale.\n     *\n     * @param cx - Center X\n     * @param cy - Center Y\n     * @param w - Width before scaling\n     * @param h - Height before scaling\n     * @param ox - Origin X offset from center\n     * @param oy - Origin Y offset from center\n     * @param xscale - Horizontal scale\n     * @param yscale - Vertical scale\n     * @param angle_deg - Rotation in degrees (counter-clockwise)\n     * @param u0 - Left UV\n     * @param v0 - Top UV\n     * @param u1 - Right UV\n     * @param v1 - Bottom UV\n     * @param r - Red (0\u20131)\n     * @param g - Green (0\u20131)\n     * @param b - Blue (0\u20131)\n     * @param a - Alpha (0\u20131)\n     * @param texture - WebGL texture\n     */\n    add_quad_transformed(cx: number, cy: number, w: number, h: number, ox: number, oy: number, xscale: number, yscale: number, angle_deg: number, u0: number, v0: number, u1: number, v1: number, r: number, g: number, b: number, a: number, texture: WebGLTexture): void;\n    /**\n     * Flushes accumulated quads to the GPU with a single draw call.\n     * Resets the batch state after drawing.\n     */\n    flush(): void;\n    /**\n     * Frees the VAO and VBO GPU resources.\n     */\n    destroy(): void;\n}\n//# sourceMappingURL=batch_renderer.d.ts.map\n/**\n * Color constants, constructors, and component extractors.\n * Colors are stored as BGR integers (GMS convention) but converted to RGB when needed.\n *\n * GMS color format: 0xBBGGRR (blue in high byte, red in low byte)\n */\ndeclare const c_aqua = 16776960;\ndeclare const c_black = 0;\ndeclare const c_blue = 16711680;\ndeclare const c_dkgray = 4210752;\ndeclare const c_fuchsia = 16711935;\ndeclare const c_gray = 8421504;\ndeclare const c_green = 32768;\ndeclare const c_lime = 65280;\ndeclare const c_ltgray = 12632256;\ndeclare const c_maroon = 128;\ndeclare const c_navy = 8388608;\ndeclare const c_olive = 32896;\ndeclare const c_orange = 33023;\ndeclare const c_purple = 8388736;\ndeclare const c_red = 255;\ndeclare const c_silver = 12632256;\ndeclare const c_teal = 8421376;\ndeclare const c_white = 16777215;\ndeclare const c_yellow = 65535;\ndeclare const bm_normal = 0;\ndeclare const bm_add = 1;\ndeclare const bm_max = 2;\ndeclare const bm_subtract = 3;\ndeclare const fa_left = 0;\ndeclare const fa_center = 1;\ndeclare const fa_right = 2;\ndeclare const fa_top = 0;\ndeclare const fa_middle = 1;\ndeclare const fa_bottom = 2;\n/**\n * Creates a BGR color integer from individual RGB components (0\u2013255).\n * @param r - Red component (0\u2013255)\n * @param g - Green component (0\u2013255)\n * @param b - Blue component (0\u2013255)\n * @returns BGR integer\n */\ndeclare function make_color_rgb(r: number, g: number, b: number): number;\n/**\n * Creates a BGR color from hue, saturation, value (all 0\u2013255).\n * @param h - Hue (0\u2013255)\n * @param s - Saturation (0\u2013255)\n * @param v - Value/Brightness (0\u2013255)\n * @returns BGR integer\n */\ndeclare function make_color_hsv(h: number, s: number, v: number): number;\n/**\n * Returns the red component (0\u2013255) of a BGR color.\n * @param col - BGR integer\n */\ndeclare function color_get_red(col: number): number;\n/**\n * Returns the green component (0\u2013255) of a BGR color.\n * @param col - BGR integer\n */\ndeclare function color_get_green(col: number): number;\n/**\n * Returns the blue component (0\u2013255) of a BGR color.\n * @param col - BGR integer\n */\ndeclare function color_get_blue(col: number): number;\n/**\n * Linearly blends two BGR colors.\n * @param col1 - First BGR color\n * @param col2 - Second BGR color\n * @param amount - Blend factor (0 = col1, 1 = col2)\n * @returns Blended BGR color\n */\ndeclare function merge_color(col1: number, col2: number, amount: number): number;\n/**\n * Converts a BGR integer color to normalized [r, g, b] components (0\u20131 each).\n * @param col - BGR integer\n * @returns [r, g, b] normalized\n */\ndeclare function color_to_rgb_normalized(col: number): [number, number, number];\n/** Returns the hue (0\u2013255) of a BGR color. */\ndeclare function color_get_hue(col: number): number;\n/** Returns the saturation (0\u2013255) of a BGR color. */\ndeclare function color_get_saturation(col: number): number;\n/** Returns the value/brightness (0\u2013255) of a BGR color. */\ndeclare function color_get_value(col: number): number;\ndeclare const make_colour_rgb: typeof make_color_rgb;\ndeclare const make_colour_hsv: typeof make_color_hsv;\ndeclare const colour_get_red: typeof color_get_red;\ndeclare const colour_get_green: typeof color_get_green;\ndeclare const colour_get_blue: typeof color_get_blue;\ndeclare const colour_get_hue: typeof color_get_hue;\ndeclare const colour_get_saturation: typeof color_get_saturation;\ndeclare const colour_get_value: typeof color_get_value;\ndeclare const merge_colour: typeof merge_color;\n//# sourceMappingURL=color.d.ts.map\n/**\n * Public GMS-style draw_* API functions.\n * All functions delegate to the renderer singleton.\n */\n\n/**\n * Sets the current draw color.\n * @param col - BGR integer color (use c_* constants or make_color_rgb)\n */\ndeclare function draw_set_color(col: number): void;\n/**\n * Returns the current draw color as a BGR integer.\n */\ndeclare function draw_get_color(): number;\n/** British-spelling alias for draw_set_color. */\ndeclare const draw_set_colour: typeof draw_set_color;\n/** British-spelling alias for draw_get_color. */\ndeclare const draw_get_colour: typeof draw_get_color;\n/**\n * Sets the current draw alpha (transparency).\n * @param alpha - Value from 0 (fully transparent) to 1 (fully opaque)\n */\ndeclare function draw_set_alpha(alpha: number): void;\n/**\n * Returns the current draw alpha.\n */\ndeclare function draw_get_alpha(): number;\n/**\n * Clears the screen (or current surface target) with a solid color.\n * @param col - BGR integer color\n */\ndeclare function draw_clear(col: number): void;\n/**\n * Sets the current blend mode.\n * Flushes the batch before changing.\n * @param mode - bm_normal, bm_add, bm_max, or bm_subtract\n */\ndeclare function draw_set_blend_mode(mode: number): void;\n/**\n * Draws a sprite at the given position.\n * @param spr - Sprite resource\n * @param subimg - Frame index (float, will be wrapped)\n * @param x - X position\n * @param y - Y position\n */\ndeclare function draw_sprite(spr: sprite, subimg: number, x: number, y: number): void;\n/**\n * Draws a sprite with full transform control.\n * @param spr - Sprite resource\n * @param subimg - Frame index\n * @param x - X position\n * @param y - Y position\n * @param xscale - Horizontal scale (1 = normal)\n * @param yscale - Vertical scale (1 = normal)\n * @param rot - Rotation in degrees (counter-clockwise)\n * @param color - Tint color as BGR integer\n * @param alpha - Alpha (0\u20131)\n */\ndeclare function draw_sprite_ext(spr: sprite, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;\n/**\n * Draws a sub-region of a sprite frame.\n * @param spr - Sprite resource\n * @param subimg - Frame index\n * @param left - Source region left in pixels\n * @param top - Source region top in pixels\n * @param width - Source region width in pixels\n * @param height - Source region height in pixels\n * @param x - Destination X\n * @param y - Destination Y\n */\ndeclare function draw_sprite_part(spr: sprite, subimg: number, left: number, top: number, width: number, height: number, x: number, y: number): void;\n/**\n * Draws a sprite stretched to a specific size.\n * @param spr - Sprite resource\n * @param subimg - Frame index\n * @param x - Destination X (top-left)\n * @param y - Destination Y (top-left)\n * @param w - Target width in pixels\n * @param h - Target height in pixels\n */\ndeclare function draw_sprite_stretched(spr: sprite, subimg: number, x: number, y: number, w: number, h: number): void;\n/**\n * Draws a background at the given position.\n * @param bg - Background resource\n * @param x - X position\n * @param y - Y position\n */\ndeclare function draw_background(bg: any, x: number, y: number): void;\n/**\n * Draws a background with full transform control.\n * @param bg - Background resource\n * @param x - X position\n * @param y - Y position\n * @param xscale - Horizontal scale (1 = normal)\n * @param yscale - Vertical scale (1 = normal)\n * @param rot - Rotation in degrees (counter-clockwise)\n * @param color - Tint color as BGR integer\n * @param alpha - Alpha (0\u20131)\n */\ndeclare function draw_background_ext(bg: any, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;\n/**\n * Draws a background stretched to fill a region.\n * @param bg - Background resource\n * @param x - X position\n * @param y - Y position\n * @param w - Width\n * @param h - Height\n */\ndeclare function draw_background_stretched(bg: any, x: number, y: number, w: number, h: number): void;\n/**\n * Draws a background tiled to fill a region.\n * @param bg - Background resource\n * @param x - X position\n * @param y - Y position\n * @param tile_x - X offset for tiling\n * @param tile_y - Y offset for tiling\n */\ndeclare function draw_background_tiled(bg: any, x: number, y: number, tile_x: number, tile_y: number): void;\n/**\n * Draws a single pixel at the given position.\n * @param x - X position\n * @param y - Y position\n */\ndeclare function draw_point(x: number, y: number): void;\n/**\n * Draws a line between two points (1 pixel wide).\n * @param x1 - Start X\n * @param y1 - Start Y\n * @param x2 - End X\n * @param y2 - End Y\n */\ndeclare function draw_line(x1: number, y1: number, x2: number, y2: number): void;\n/**\n * Draws a line with a specified pixel width.\n * @param x1 - Start X\n * @param y1 - Start Y\n * @param x2 - End X\n * @param y2 - End Y\n * @param w - Width in pixels\n */\ndeclare function draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void;\n/**\n * Draws a filled or outlined axis-aligned rectangle.\n * @param x1 - Left edge X\n * @param y1 - Top edge Y\n * @param x2 - Right edge X\n * @param y2 - Bottom edge Y\n * @param outline - True for outline only, false for filled\n */\ndeclare function draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;\n/**\n * Draws a filled or outlined circle.\n * @param x - Center X\n * @param y - Center Y\n * @param r - Radius in pixels\n * @param outline - True for outline only, false for filled\n */\ndeclare function draw_circle(x: number, y: number, r: number, outline: boolean): void;\n/**\n * Draws a filled or outlined ellipse.\n * @param x1 - Bounding box left\n * @param y1 - Bounding box top\n * @param x2 - Bounding box right\n * @param y2 - Bounding box bottom\n * @param outline - True for outline only, false for filled\n */\ndeclare function draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;\n/**\n * Draws a filled or outlined triangle.\n * @param x1 - Vertex 1 X\n * @param y1 - Vertex 1 Y\n * @param x2 - Vertex 2 X\n * @param y2 - Vertex 2 Y\n * @param x3 - Vertex 3 X\n * @param y3 - Vertex 3 Y\n * @param outline - True for outline only, false for filled\n */\ndeclare function draw_triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, outline: boolean): void;\n/**\n * Draws a text string at the given position.\n * Uses the current font, color, alpha, halign, and valign settings.\n * @param x - X position\n * @param y - Y position\n * @param text - The string to draw (numbers will be converted to string)\n */\ndeclare function draw_text(x: number, y: number, text: string | number): void;\n/**\n * Sets the active font for text rendering.\n * @param fnt - a font_resource, or a project font resource name (e.g. 'fnt_main')\n */\ndeclare function draw_set_font(fnt: font_resource | string): void;\n/**\n * Sets the horizontal text alignment.\n * @param halign - fa_left (0), fa_center (1), or fa_right (2)\n */\ndeclare function draw_set_halign(halign: number): void;\n/**\n * Sets the vertical text alignment.\n * @param valign - fa_top (0), fa_middle (1), or fa_bottom (2)\n */\ndeclare function draw_set_valign(valign: number): void;\n/**\n * Returns the pixel width of a string with the current font.\n * @param text - The string to measure\n */\ndeclare function string_width(text: string): number;\n/**\n * Returns the pixel height of a string with the current font.\n */\ndeclare function string_height(): number;\n/**\n * Creates a new render-to-texture surface.\n * @param w - Width in pixels\n * @param h - Height in pixels\n * @returns surface object\n */\ndeclare function surface_create(w: number, h: number): surface;\n/**\n * Sets the render target to a surface.\n * All subsequent draw calls go to this surface until surface_reset_target().\n * @param surf - Target surface\n */\ndeclare function surface_set_target(surf: surface): void;\n/**\n * Resets the render target back to the screen.\n */\ndeclare function surface_reset_target(): void;\n/**\n * Frees a surface and its GPU resources.\n * @param surf - Surface to free\n */\ndeclare function surface_free(surf: surface): void;\n/**\n * Checks whether a surface is valid (not yet freed).\n * @param surf - Surface to check\n */\ndeclare function surface_exists(surf: surface): boolean;\n/**\n * Returns the width of a surface in pixels.\n * @param surf - Surface to query\n */\ndeclare function surface_get_width(surf: surface): number;\n/**\n * Returns the height of a surface in pixels.\n * @param surf - Surface to query\n */\ndeclare function surface_get_height(surf: surface): number;\n/**\n * Draws a surface at the given position.\n * @param surf - Surface to draw\n * @param x - Destination X\n * @param y - Destination Y\n */\ndeclare function draw_surface(surf: surface, x: number, y: number): void;\n//# sourceMappingURL=draw_functions.d.ts.map\n/**\n * Text/font rendering via canvas-to-texture.\n * Renders text to a temporary 2D canvas and uploads it as a WebGL texture.\n * Caches textures for strings that are drawn repeatedly.\n */\n\n/**\n * A font resource defining CSS font properties.\n */\ndeclare class font_resource {\n    name: string;\n    size: number;\n    family: string;\n    bold: boolean;\n    italic: boolean;\n    constructor(family?: string, size?: number, bold?: boolean, italic?: boolean);\n    /** Builds the CSS font string. */\n    private build_css;\n}\n/** Registers a font resource under a name so `draw_set_font('fnt_x')` resolves. */\ndeclare function font_register_name(name: string, fnt: font_resource): void;\n/**\n * Returns a font resource by its project name, or undefined if unknown.\n * @param name - Font resource name\n */\ndeclare function font_get(name: string): font_resource | undefined;\n/** Returns true if a font resource with the given name has been registered. */\ndeclare function font_exists(name: string): boolean;\n/** A cached text texture with associated metrics. */\ninterface text_cache_entry {\n    entry: texture_entry;\n    width: number;\n    height: number;\n}\n/**\n * Manages text rasterization and caching.\n */\ndeclare class font_renderer {\n    private tex_manager;\n    private cache;\n    private offscreen;\n    private ctx;\n    constructor(tex_manager: texture_manager);\n    /**\n     * Returns a cached or newly-rendered texture for the given text string.\n     * @param text - Text to render\n     * @param fnt - Font resource to use\n     * @param color_css - CSS color string (e.g. \"#FFFFFF\")\n     * @returns text_cache_entry containing the texture and dimensions\n     */\n    get_texture(text: string, fnt: font_resource, color_css: string): text_cache_entry;\n    /**\n     * Rasterizes text to a canvas and uploads it to a WebGL texture.\n     */\n    private rasterize;\n    /**\n     * Measures the pixel width of a string with the given font.\n     * @param text - Text to measure\n     * @param fnt - Font resource\n     * @returns Width in pixels\n     */\n    measure_width(text: string, fnt: font_resource): number;\n    /**\n     * Measures the pixel height of a string with the given font.\n     * @param fnt - Font resource\n     * @returns Height in pixels\n     */\n    measure_height(fnt: font_resource): number;\n    /**\n     * Clears the text texture cache and frees GPU memory.\n     */\n    clear_cache(): void;\n}\n\n//# sourceMappingURL=font.d.ts.map\n/**\n * Core WebGL 2 renderer.\n * Owns the canvas, GL context, default shader, projection matrix, and batch renderer.\n * All drawing functions go through this module.\n */\n\n/** Surface (render-to-texture target). Created by surface_create(). */\ninterface surface {\n    fbo: WebGLFramebuffer;\n    texture: WebGLTexture;\n    width: number;\n    height: number;\n    valid: boolean;\n}\n/**\n * Main renderer singleton.\n * Initialised once via renderer.init() before the game loop starts.\n */\ndeclare class renderer {\n    private static gl;\n    private static canvas;\n    private static program;\n    private static projection_loc;\n    private static active_proj_loc;\n    private static batch;\n    static tex_mgr: texture_manager;\n    private static font_rend;\n    private static draw_color;\n    private static draw_alpha;\n    private static blend_mode;\n    private static current_font;\n    private static halign;\n    private static valign;\n    private static active_surface;\n    /**\n     * Initialises the renderer with an existing canvas or creates a new one.\n     * Must be called before any drawing functions.\n     * @param canvas_or_id - Canvas element or CSS selector string\n     * @param width - Canvas width in pixels\n     * @param height - Canvas height in pixels\n     */\n    static init(canvas_or_id: HTMLCanvasElement | string, width?: number, height?: number): void;\n    /**\n     * Uploads an orthographic projection matrix for pixel-space coordinates.\n     * Origin at top-left, Y increases downward.\n     * @param w - Viewport width\n     * @param h - Viewport height\n     */\n    static upload_projection(w: number, h: number): void;\n    /**\n     * Uploads an orthographic projection that maps the room-space rectangle\n     * (vx,vy)\u2013(vx+vw,vy+vh) onto clip space. Origin top-left, Y increases down.\n     * This is what makes views/cameras scroll.\n     * @param vx - View left in room space\n     * @param vy - View top in room space\n     * @param vw - View width in room space\n     * @param vh - View height in room space\n     */\n    static upload_projection_view(vx: number, vy: number, vw: number, vh: number): void;\n    /**\n     * Activates a view camera: flushes pending geometry, sets the GL viewport to\n     * the on-screen port, and projects the room-space view rectangle into it.\n     */\n    static set_view_camera(vx: number, vy: number, vw: number, vh: number, px: number, py: number, pw: number, ph: number): void;\n    /** Restores full-canvas rendering (for GUI / no-view drawing). */\n    static reset_view(): void;\n    /**\n     * Called at the start of each draw frame.\n     * Clears the color buffer and prepares the render state.\n     * @param r - Clear color red (0\u20131)\n     * @param g - Clear color green (0\u20131)\n     * @param b - Clear color blue (0\u20131)\n     */\n    static begin_frame(r?: number, g?: number, b?: number): void;\n    /**\n     * Called at the end of each draw frame to flush remaining batched quads.\n     */\n    static end_frame(): void;\n    /** Sets the current draw color (BGR integer). */\n    static set_color(col: number): void;\n    /** Returns the current draw color (BGR integer). */\n    static get_color(): number;\n    /** Sets the current draw alpha (0\u20131). */\n    static set_alpha(a: number): void;\n    /** Returns the current draw alpha. */\n    static get_alpha(): number;\n    /** Returns the currently active font resource. */\n    static get_current_font(): font_resource;\n    /** Sets the current font for text rendering. */\n    static set_font(fnt: font_resource): void;\n    /** Sets the horizontal text alignment (fa_left / fa_center / fa_right). */\n    static set_halign(align: number): void;\n    /** Sets the vertical text alignment (fa_top / fa_middle / fa_bottom). */\n    static set_valign(align: number): void;\n    /**\n     * Sets the active blend mode.\n     * Flushes the current batch before changing GL blend state.\n     * @param mode - bm_normal, bm_add, bm_max, or bm_subtract\n     */\n    static set_blend_mode(mode: number): void;\n    private static apply_blend_mode;\n    /**\n     * Creates a new render-to-texture surface.\n     * @param w - Surface width in pixels\n     * @param h - Surface height in pixels\n     * @returns surface object\n     */\n    static surface_create(w: number, h: number): surface;\n    /**\n     * Sets the render target to a surface.\n     * Subsequent draw calls will render into the surface.\n     * @param surf - Target surface\n     */\n    static surface_set_target(surf: surface): void;\n    /**\n     * Resets the render target back to the screen.\n     */\n    static surface_reset_target(): void;\n    /**\n     * Frees a surface's GPU resources.\n     * @param surf - Surface to free\n     */\n    static surface_free(surf: surface): void;\n    /**\n     * Draws a sprite at the given position using the instance's current frame.\n     * @param spr - Sprite resource\n     * @param subimg - Frame index (float; will be floored and wrapped)\n     * @param x - X position (adjusted for sprite origin)\n     * @param y - Y position (adjusted for sprite origin)\n     */\n    static draw_sprite(spr: sprite, subimg: number, x: number, y: number): void;\n    /**\n     * Draws a sprite with extended transforms (scale, rotation, blend color, alpha).\n     * @param spr - Sprite resource\n     * @param subimg - Frame index\n     * @param x - X position\n     * @param y - Y position\n     * @param xscale - Horizontal scale factor\n     * @param yscale - Vertical scale factor\n     * @param rot - Rotation in degrees (counter-clockwise)\n     * @param color - Tint color (BGR integer, 0xFFFFFF = no tint)\n     * @param alpha - Transparency (0\u20131)\n     */\n    static draw_sprite_ext(spr: sprite, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;\n    /**\n     * Draws a sub-region of a sprite frame.\n     * @param spr - Sprite resource\n     * @param subimg - Frame index\n     * @param left - Source left (pixels from frame left)\n     * @param top - Source top (pixels from frame top)\n     * @param width - Source width in pixels\n     * @param height - Source height in pixels\n     * @param x - Destination X\n     * @param y - Destination Y\n     */\n    static draw_sprite_part(spr: sprite, subimg: number, left: number, top: number, width: number, height: number, x: number, y: number): void;\n    /**\n     * Draws a sprite stretched to fit the given dimensions.\n     * @param spr - Sprite resource\n     * @param subimg - Frame index\n     * @param x - Destination X (top-left)\n     * @param y - Destination Y (top-left)\n     * @param w - Target width\n     * @param h - Target height\n     */\n    static draw_sprite_stretched(spr: sprite, subimg: number, x: number, y: number, w: number, h: number): void;\n    /**\n     * Draws a background at the given position.\n     * @param bg - Background resource\n     * @param x - X position\n     * @param y - Y position\n     */\n    static draw_background(bg: any, x: number, y: number): void;\n    /**\n     * Draws a background with extended transforms (scale, rotation, blend color, alpha).\n     * @param bg - Background resource\n     * @param x - X position\n     * @param y - Y position\n     * @param xscale - Horizontal scale factor\n     * @param yscale - Vertical scale factor\n     * @param rot - Rotation in degrees (counter-clockwise)\n     * @param color - Blend color as BGR integer\n     * @param alpha - Alpha transparency (0\u20131)\n     */\n    static draw_background_ext(bg: any, x: number, y: number, xscale: number, yscale: number, rot: number, color: number, alpha: number): void;\n    /**\n     * Draws a background stretched to fill a specified region.\n     * @param bg - Background resource\n     * @param x - X position\n     * @param y - Y position\n     * @param w - Width\n     * @param h - Height\n     */\n    static draw_background_stretched(bg: any, x: number, y: number, w: number, h: number): void;\n    /**\n     * Draws a background tiled to fill the current view.\n     * @param bg - Background resource\n     * @param x - X offset\n     * @param y - Y offset\n     * @param tile_x - X tile offset\n     * @param tile_y - Y tile offset\n     */\n    static draw_background_tiled(bg: any, x: number, y: number, tile_x: number, tile_y: number): void;\n    /**\n     * Draws a surface as if it were a sprite.\n     * @param surf - Surface to draw\n     * @param x - Destination X\n     * @param y - Destination Y\n     */\n    static draw_surface(surf: surface, x: number, y: number): void;\n    /**\n     * Renders the active room. For each visible view it sets the camera, draws\n     * the non-foreground backgrounds and tiles, runs the instance Draw events\n     * (via the callback), then draws the foreground backgrounds. With no views\n     * enabled the room maps 1:1 to the canvas.\n     * @param rm - The active room\n     * @param run_instances - Runs all instance Draw events under the current camera\n     */\n    static draw_room(rm: room, run_instances: () => void): void;\n    /** Accumulates each background layer's auto-scroll offset once per frame. */\n    private static _advance_bg_scroll;\n    /**\n     * Moves view `i` to keep its followed instance within the view's border box,\n     * clamped to the room bounds. No-op when the view follows nothing.\n     */\n    private static _follow_view;\n    /**\n     * Draws the room's background layers within the given view rectangle.\n     * @param rm - The room\n     * @param foreground - Draw only foreground layers (true) or only background layers (false)\n     * @param vx - View left (room space)\n     * @param vy - View top (room space)\n     * @param vw - View width\n     * @param vh - View height\n     */\n    static draw_room_backgrounds(rm: room, foreground: boolean, vx: number, vy: number, vw: number, vh: number): void;\n    /**\n     * Draws the room's tile layers (back-to-front by depth). Each tile is a\n     * sub-rectangle of a background resource drawn at its room position.\n     * @param rm - The room\n     */\n    static draw_room_tiles(rm: room): void;\n    /**\n     * Draws a text string at the given position using the current font and alignment.\n     * @param x - X position\n     * @param y - Y position\n     * @param text - String to draw\n     */\n    static draw_text(x: number, y: number, text: string): void;\n    /**\n     * Clears the screen (or current surface) with a solid color.\n     * @param col - BGR color integer\n     */\n    static draw_clear(col: number): void;\n    /**\n     * Draws a filled or outlined axis-aligned rectangle.\n     * @param x1 - Left\n     * @param y1 - Top\n     * @param x2 - Right\n     * @param y2 - Bottom\n     * @param outline - True for outline only, false for filled\n     */\n    static draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;\n    /**\n     * Draws a filled or outlined circle using a triangle fan approximation.\n     * @param cx - Center X\n     * @param cy - Center Y\n     * @param r_px - Radius in pixels\n     * @param outline - True for outline only\n     */\n    static draw_circle(cx: number, cy: number, r_px: number, outline: boolean): void;\n    /**\n     * Draws a line between two points.\n     * @param x1 - Start X\n     * @param y1 - Start Y\n     * @param x2 - End X\n     * @param y2 - End Y\n     */\n    static draw_line(x1: number, y1: number, x2: number, y2: number): void;\n    /**\n     * Draws a line with a specific pixel width.\n     * @param x1 - Start X\n     * @param y1 - Start Y\n     * @param x2 - End X\n     * @param y2 - End Y\n     * @param w - Line width in pixels\n     */\n    static draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void;\n    /**\n     * Draws a single point (1\xD71 pixel) at the given position.\n     * @param x - X position\n     * @param y - Y position\n     */\n    static draw_point(x: number, y: number): void;\n    /**\n     * Draws a filled or outlined triangle.\n     * @param x1 - Vertex 1 X\n     * @param y1 - Vertex 1 Y\n     * @param x2 - Vertex 2 X\n     * @param y2 - Vertex 2 Y\n     * @param x3 - Vertex 3 X\n     * @param y3 - Vertex 3 Y\n     * @param outline - True for outline only\n     */\n    static draw_triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, outline: boolean): void;\n    /**\n     * Draws a filled or outlined ellipse.\n     * @param x1 - Bounding box left\n     * @param y1 - Bounding box top\n     * @param x2 - Bounding box right\n     * @param y2 - Bounding box bottom\n     * @param outline - True for outline only\n     */\n    static draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;\n    /**\n     * Draws a triangle as two batch quads (degenerate quad approach).\n     * The third quad vertex is the same as vertex 3 making a true triangle.\n     */\n    private static draw_triangle_internal;\n    /**\n     * Draws a line as a thin rectangular quad aligned to the line direction.\n     */\n    private static draw_line_width_internal;\n    /** Returns the underlying HTML canvas element. */\n    static get_canvas(): HTMLCanvasElement;\n    /** Returns the WebGL 2 context. */\n    static get_gl(): WebGL2RenderingContext;\n    /** Returns the batch renderer (used by advanced rendering). */\n    static get_batch(): batch_renderer;\n    /** Flushes the current batch without a program change. Used by shader_system. */\n    static flush_batch(): void;\n    /**\n     * Switches back to the default engine shader program and re-uploads projection.\n     * Called by shader_reset().\n     */\n    static restore_default_program(): void;\n    /**\n     * Uploads the orthographic projection matrix to an arbitrary program's\n     * u_projection uniform. Used when activating a user shader.\n     * @param prog - The WebGLProgram to upload to\n     */\n    static upload_projection_to_program(prog: WebGLProgram): void;\n    /**\n     * Uploads a custom projection matrix to the currently active program's\n     * u_projection uniform. Used by view_apply() to set room-offset projections.\n     * Avoids gl.getParameter() GPU readback by using the cached active location.\n     * @param matrix - 16-element column-major Float32Array\n     */\n    static set_view_projection(matrix: Float32Array): void;\n    /** Returns the font renderer. */\n    static get_font_renderer(): font_renderer;\n    /**\n     * Frees all GPU resources owned by the renderer.\n     */\n    static destroy(): void;\n}\n//# sourceMappingURL=renderer.d.ts.map\n/**\n * Shader compilation and program linking utilities for WebGL 2.\n */\n/** GLSL vertex shader source for the default 2D sprite/shape renderer. */\ndeclare const DEFAULT_VERTEX_SHADER = \"#version 300 es\\nlayout(location = 0) in vec2 a_position;\\nlayout(location = 1) in vec2 a_texcoord;\\nlayout(location = 2) in vec4 a_color;\\n\\nuniform mat4 u_projection;\\n\\nout vec2 v_texcoord;\\nout vec4 v_color;\\n\\nvoid main() {\\n    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);\\n    v_texcoord = a_texcoord;\\n    v_color = a_color;\\n}\";\n/** GLSL fragment shader source for the default 2D sprite/shape renderer. */\ndeclare const DEFAULT_FRAGMENT_SHADER = \"#version 300 es\\nprecision mediump float;\\n\\nin vec2 v_texcoord;\\nin vec4 v_color;\\n\\nuniform sampler2D u_texture;\\n\\nout vec4 fragColor;\\n\\nvoid main() {\\n    fragColor = texture(u_texture, v_texcoord) * v_color;\\n}\";\n/**\n * Compiles a single GLSL shader of the given type.\n * @param gl - WebGL 2 context\n * @param type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER\n * @param source - GLSL source string\n * @returns Compiled WebGLShader\n */\ndeclare function compile_shader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader;\n/**\n * Links a vertex and fragment shader into a WebGL program.\n * @param gl - WebGL 2 context\n * @param vs_source - Vertex shader GLSL source\n * @param fs_source - Fragment shader GLSL source\n * @returns Linked WebGLProgram\n */\ndeclare function create_program(gl: WebGL2RenderingContext, vs_source: string, fs_source: string): WebGLProgram;\n/**\n * Represents a compiled user shader with cached uniform locations.\n */\ndeclare class shader_program {\n    readonly program: WebGLProgram;\n    private gl;\n    private uniform_cache;\n    constructor(gl: WebGL2RenderingContext, vs_source: string, fs_source: string);\n    /**\n     * Gets and caches a uniform location by name.\n     * @param name - Uniform variable name in GLSL\n     * @returns WebGLUniformLocation or null if not found\n     */\n    get_uniform(name: string): WebGLUniformLocation | null;\n    /**\n     * Frees the shader program's GPU resources.\n     */\n    destroy(): void;\n}\n//# sourceMappingURL=shader.d.ts.map\n/**\n * User-facing shader system.\n *\n * Wraps shader_program to give a GMS-compatible API:\n *   shader_set()        \u2014 activates a user shader\n *   shader_reset()      \u2014 returns to the default shader\n *   shader_get_uniform  \u2014 returns a uniform handle (WebGLUniformLocation)\n *   shader_set_uniform_f/i/mat \u2014 upload uniform values\n *\n * The active shader is set on the renderer's GL context.\n * The renderer's batch must be flushed before switching programs.\n */\n\n/**\n * A user-defined shader asset.\n * Create with new user_shader(vs_source, fs_source).\n */\ndeclare class user_shader {\n    readonly internal: shader_program;\n    /**\n     * @param vs_source - Vertex shader GLSL source (#version 300 es required)\n     * @param fs_source - Fragment shader GLSL source\n     */\n    constructor(vs_source: string, fs_source: string);\n    /**\n     * Frees the shader's GPU resources.\n     * Do not use the shader after calling destroy().\n     */\n    destroy(): void;\n}\n/**\n * Activates a user shader program for subsequent draw calls.\n * The renderer's batch is flushed before switching.\n * @param shader - The user_shader to activate\n */\ndeclare function shader_set(shader: user_shader): void;\n/**\n * Resets to the default engine shader program.\n * The renderer's batch is flushed before switching.\n */\ndeclare function shader_reset(): void;\n/**\n * Returns the currently active user shader, or null if using the default.\n */\ndeclare function shader_current(): user_shader | null;\n/**\n * Returns a uniform handle for use with shader_set_uniform_*.\n * @param shader - The shader containing the uniform\n * @param name - GLSL uniform variable name\n * @returns WebGLUniformLocation or null if not found\n */\ndeclare function shader_get_uniform(shader: user_shader, name: string): WebGLUniformLocation | null;\n/**\n * Sets a float uniform value (1 component).\n * @param location - Uniform location from shader_get_uniform\n * @param val - Float value\n */\ndeclare function shader_set_uniform_f(location: WebGLUniformLocation, val: number): void;\n/**\n * Sets a vec2 float uniform.\n * @param location - Uniform location\n * @param x - X component\n * @param y - Y component\n */\ndeclare function shader_set_uniform_f2(location: WebGLUniformLocation, x: number, y: number): void;\n/**\n * Sets a vec3 float uniform.\n * @param location - Uniform location\n * @param x - X component\n * @param y - Y component\n * @param z - Z component\n */\ndeclare function shader_set_uniform_f3(location: WebGLUniformLocation, x: number, y: number, z: number): void;\n/**\n * Sets a vec4 float uniform.\n * @param location - Uniform location\n * @param x - X\n * @param y - Y\n * @param z - Z\n * @param w - W\n */\ndeclare function shader_set_uniform_f4(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void;\n/**\n * Sets an integer uniform value (1 component).\n * @param location - Uniform location\n * @param val - Integer value\n */\ndeclare function shader_set_uniform_i(location: WebGLUniformLocation, val: number): void;\n/**\n * Sets an ivec2 integer uniform.\n * @param location - Uniform location\n * @param x - X component\n * @param y - Y component\n */\ndeclare function shader_set_uniform_i2(location: WebGLUniformLocation, x: number, y: number): void;\n/**\n * Sets a float array uniform.\n * @param location - Uniform location\n * @param values - Float array\n */\ndeclare function shader_set_uniform_f_array(location: WebGLUniformLocation, values: Float32Array | number[]): void;\n/**\n * Sets a mat4 uniform from a 16-element column-major Float32Array.\n * @param location - Uniform location\n * @param matrix - 16-element column-major matrix\n * @param transpose - Whether to transpose (default false)\n */\ndeclare function shader_set_uniform_matrix(location: WebGLUniformLocation, matrix: Float32Array, transpose?: boolean): void;\n//# sourceMappingURL=shader_system.d.ts.map\n/**\n * Sprite resource \u2014 holds frames (textures) and origin point.\n * Mirrors GMS sprite data structure.\n */\n\n/**\n * A single frame of a sprite animation.\n */\ninterface sprite_frame {\n    texture: texture_entry;\n    width: number;\n    height: number;\n}\n/**\n * A sprite resource containing one or more animation frames and an origin point.\n */\ndeclare class sprite extends resource {\n    frames: sprite_frame[];\n    xoffset: number;\n    yoffset: number;\n    width: number;\n    height: number;\n    mask_left: number;\n    mask_top: number;\n    mask_right: number;\n    mask_bottom: number;\n    constructor();\n    /**\n     * Adds a frame to this sprite.\n     * @param frame - The frame to add\n     */\n    add_frame(frame: sprite_frame): void;\n    /**\n     * Returns the number of frames in this sprite.\n     */\n    get_number(): number;\n    /**\n     * Returns the frame at the given index, wrapping around if out of range.\n     * @param index - Frame index\n     * @returns sprite_frame or undefined if the sprite has no frames\n     */\n    get_frame(index: number): sprite_frame | undefined;\n}\n/**\n * Returns the width of the given sprite resource.\n * @param spr - Sprite instance\n */\ndeclare function sprite_get_width(spr: sprite): number;\n/**\n * Returns the height of the given sprite resource.\n * @param spr - Sprite instance\n */\ndeclare function sprite_get_height(spr: sprite): number;\n/**\n * Returns the X origin of the given sprite resource.\n * @param spr - Sprite instance\n */\ndeclare function sprite_get_xoffset(spr: sprite): number;\n/**\n * Returns the Y origin of the given sprite resource.\n * @param spr - Sprite instance\n */\ndeclare function sprite_get_yoffset(spr: sprite): number;\n/**\n * Returns the number of frames of the given sprite resource.\n * @param spr - Sprite instance\n */\ndeclare function sprite_get_number(spr: sprite): number;\n/** Registers a sprite resource under a name so it can be looked up by name. */\ndeclare function sprite_register_name(name: string, id: number): void;\n/**\n * Returns the resource id of a sprite by its project name, or -1 if unknown.\n * GMS-style asset lookup \u2014 e.g. resolving `static sprite = 'spr_player'`.\n * @param name - Sprite resource name\n */\ndeclare function sprite_get_index(name: string): number;\n/** Returns true if the id refers to a sprite resource. */\ndeclare function sprite_exists(sprite_index: number): boolean;\n/** Sets a sprite's origin (offset), in pixels from the top-left. */\ndeclare function sprite_set_offset(sprite_index: number, xoff: number, yoff: number): void;\n/**\n * Duplicates a sprite (sharing the source's frame textures) and returns the new sprite's id.\n * @returns New sprite id, or -1 if the source doesn't exist\n */\ndeclare function sprite_duplicate(sprite_index: number): number;\n/**\n * Loads an image at runtime and creates a sprite (GMS `sprite_add`).\n * Asynchronous \u2014 image fetch + GPU upload are async on the web, so `await` the result.\n *\n * When `imgnumb > 1` the image is treated as a horizontal strip and split into that many\n * equal-width sub-images (frames). When `removeback` is true, the colour of each sub-image's\n * bottom-left pixel is keyed out to full transparency.\n *\n * @param fname - Image URL\n * @param imgnumb - Number of sub-images packed horizontally in the strip (default 1)\n * @param removeback - Make the background colour (bottom-left pixel) transparent\n * @param smooth - Use linear texture filtering\n * @param xorig - Origin X (pixels)\n * @param yorig - Origin Y (pixels)\n * @returns The new sprite's id, or -1 on failure (e.g. a headless host or load error)\n */\ndeclare function sprite_add(fname: string, imgnumb?: number, removeback?: boolean, smooth?: boolean, xorig?: number, yorig?: number): Promise<number>;\n//# sourceMappingURL=sprite.d.ts.map\n/**\n * Manages WebGL 2 texture loading and the 1x1 white pixel fallback texture.\n */\ninterface texture_entry {\n    texture: WebGLTexture;\n    width: number;\n    height: number;\n}\n/**\n * Centralized texture registry.\n * Tracks all loaded textures and provides a shared 1x1 white pixel texture for shape drawing.\n */\ndeclare class texture_manager {\n    private gl;\n    white_pixel: WebGLTexture;\n    private textures;\n    constructor(gl: WebGL2RenderingContext);\n    /**\n     * Creates the 1x1 white pixel texture used when drawing solid-colored shapes.\n     * @returns WebGLTexture handle\n     */\n    private create_white_pixel;\n    /**\n     * Loads a texture from a URL and caches it by URL.\n     * @param url - Image URL\n     * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)\n     * @returns Promise resolving to the texture entry\n     */\n    load(url: string, smooth?: boolean): Promise<texture_entry>;\n    /**\n     * Creates a texture from an already-loaded HTMLImageElement.\n     * @param img - Source image element\n     * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)\n     * @returns texture_entry\n     */\n    from_image(img: HTMLImageElement, smooth?: boolean): texture_entry;\n    /**\n     * Creates a texture from a raw HTMLCanvasElement (used for text rendering).\n     * @param canvas - Source canvas element\n     * @param smooth - Use LINEAR filtering (true) or NEAREST (false)\n     * @returns texture_entry\n     */\n    from_canvas(canvas: HTMLCanvasElement, smooth?: boolean): texture_entry;\n    /**\n     * Frees a texture from GPU memory and removes it from the cache.\n     * @param url - URL key used when loading\n     */\n    free(url: string): void;\n    /**\n     * Frees a raw WebGLTexture directly (used by font_renderer cache cleanup).\n     * @param texture - The GPU texture handle to delete\n     */\n    free_texture(texture: WebGLTexture): void;\n    /**\n     * Frees all tracked textures and the white pixel texture.\n     */\n    destroy(): void;\n}\n//# sourceMappingURL=texture_manager.d.ts.map\n/**\n * View / camera system.\n *\n * A view defines the visible region of the room mapped onto a viewport\n * (a rectangle on screen). Multiple views can be active simultaneously.\n *\n * GMS-compatible API:\n *   view_set / view_get \u2014 configure view properties\n *   camera_set_view_pos / camera_set_view_size \u2014 convenience setters\n *   view_apply \u2014 activate a view (sets GL viewport + projection)\n *\n * All coordinates are in room (world) space unless noted otherwise.\n */\ninterface view_config {\n    enabled: boolean;\n    x: number;\n    y: number;\n    w: number;\n    h: number;\n    port_x: number;\n    port_y: number;\n    port_w: number;\n    port_h: number;\n    angle: number;\n}\n/**\n * Returns the view config for a given view index.\n * @param view_index - View slot (0\u20137)\n */\ndeclare function view_get(view_index: number): view_config;\n/**\n * Enables or disables a view.\n * @param view_index - View slot (0\u20137)\n * @param enabled - True to enable\n */\ndeclare function view_set_enabled(view_index: number, enabled: boolean): void;\n/**\n * Sets the room-space position of a view.\n * @param view_index - View slot\n * @param x - Room X\n * @param y - Room Y\n */\ndeclare function view_set_position(view_index: number, x: number, y: number): void;\n/**\n * Sets the room-space size of a view.\n * @param view_index - View slot\n * @param w - Width in room pixels\n * @param h - Height in room pixels\n */\ndeclare function view_set_size(view_index: number, w: number, h: number): void;\n/**\n * Sets the screen-space viewport rectangle for a view.\n * @param view_index - View slot\n * @param px - Viewport left (screen pixels)\n * @param py - Viewport top (screen pixels)\n * @param pw - Viewport width (screen pixels)\n * @param ph - Viewport height (screen pixels)\n */\ndeclare function view_set_port(view_index: number, px: number, py: number, pw: number, ph: number): void;\n/**\n * Sets the view rotation angle in degrees.\n * @param view_index - View slot\n * @param angle - Rotation angle (degrees, counter-clockwise)\n */\ndeclare function view_set_angle(view_index: number, angle: number): void;\n/**\n * Applies a view to the GL context: sets the GL viewport and uploads\n * a projection matrix that maps room coordinates to clip space.\n *\n * The projection maps the room region [x, x+w] \xD7 [y, y+h] into the\n * viewport [port_x, port_x+port_w] \xD7 [port_y, port_y+port_h].\n *\n * @param view_index - View slot to apply\n */\ndeclare function view_apply(view_index: number): void;\n/**\n * Convenience: sets view 0's room-space position and enables it.\n * Equivalent to camera_set_view_pos in GMS.\n * @param x - Camera/view X in room space\n * @param y - Camera/view Y in room space\n */\ndeclare function camera_set_view_pos(x: number, y: number): void;\n/**\n * Convenience: sets view 0's room-space size and enables it.\n * @param w - Width in room pixels\n * @param h - Height in room pixels\n */\ndeclare function camera_set_view_size(w: number, h: number): void;\n/**\n * Returns the X offset of a given view (for room-to-screen coordinate mapping).\n * @param view_index - View slot (default 0)\n */\ndeclare function view_get_x(view_index?: number): number;\n/**\n * Returns the Y offset of a given view.\n * @param view_index - View slot (default 0)\n */\ndeclare function view_get_y(view_index?: number): number;\n//# sourceMappingURL=view.d.ts.map\n/**\n * Silkweaver Engine \u2014 public API entry point.\n *\n * Import individual namespaces or use named imports.\n * The engine is initialized by calling renderer.init() before game_loop.start().\n */\n\n//# sourceMappingURL=index.d.ts.map\n/**\n * Gamepad input system \u2014 wraps the Web Gamepad API.\n *\n * The Gamepad API is polled (not event-driven); gamepad_manager.poll()\n * must be called each step to refresh state.\n *\n * Button indices follow the standard gamepad layout (Xbox/PlayStation mapping).\n */\ndeclare const gp_face1 = 0;\ndeclare const gp_face2 = 1;\ndeclare const gp_face3 = 2;\ndeclare const gp_face4 = 3;\ndeclare const gp_shoulderl = 4;\ndeclare const gp_shoulderr = 5;\ndeclare const gp_shoulderlb = 6;\ndeclare const gp_shoulderrb = 7;\ndeclare const gp_select = 8;\ndeclare const gp_start = 9;\ndeclare const gp_stickl = 10;\ndeclare const gp_stickr = 11;\ndeclare const gp_padu = 12;\ndeclare const gp_padd = 13;\ndeclare const gp_padl = 14;\ndeclare const gp_padr = 15;\ndeclare const gp_axislh = 0;\ndeclare const gp_axislv = 1;\ndeclare const gp_axisrh = 2;\ndeclare const gp_axisrv = 3;\ndeclare class gamepad_manager {\n    private static _states;\n    /**\n     * Polls the Gamepad API and refreshes all state snapshots.\n     * Must be called every step before gamepad functions are queried.\n     */\n    static poll(): void;\n    /** Returns true if the Gamepad API is supported by the browser. */\n    static is_supported(): boolean;\n    /** Returns true if device index `device` is connected. */\n    static is_connected(device: number): boolean;\n    /** Returns the number of connected gamepad slots (may include gaps). */\n    static get_device_count(): number;\n    /** Returns the device description string (controller name). */\n    static get_description(device: number): string;\n    /** Returns the number of axes on device. */\n    static axis_count(device: number): number;\n    /**\n     * Returns the current value of an axis (-1 to 1, dead zone not applied).\n     * @param device - Gamepad index\n     * @param axis - Axis index (use gp_axis* constants)\n     */\n    static axis_value(device: number, axis: number): number;\n    /** Returns the number of buttons on device. */\n    static button_count(device: number): number;\n    /** Returns true if button is currently held. */\n    static button_check(device: number, button: number): boolean;\n    /** Returns true if button was pressed this step (was up last step, down now). */\n    static button_check_pressed(device: number, button: number): boolean;\n    /** Returns true if button was released this step. */\n    static button_check_released(device: number, button: number): boolean;\n    /**\n     * Returns the analog button value (0 to 1) for triggers or 0/1 for digital buttons.\n     * @param device - Gamepad index\n     * @param button - Button index\n     */\n    static button_value(device: number, button: number): number;\n    /**\n     * Sets controller vibration (rumble).\n     * @param device - Gamepad index\n     * @param left - Left motor strength (0\u20131)\n     * @param right - Right motor strength (0\u20131)\n     */\n    static set_vibration(device: number, left: number, right: number): void;\n}\n/** Returns true if the Gamepad API is supported. */\ndeclare function gamepad_is_supported(): boolean;\n/** Returns true if device index is connected. */\ndeclare function gamepad_is_connected(device: number): boolean;\n/** Returns the number of detected gamepad slots. */\ndeclare function gamepad_get_device_count(): number;\n/** Returns the description string of a gamepad. */\ndeclare function gamepad_get_description(device: number): string;\n/** Returns the number of axes on a gamepad. */\ndeclare function gamepad_axis_count(device: number): number;\n/** Returns the current axis value (-1 to 1). */\ndeclare function gamepad_axis_value(device: number, axis: number): number;\n/** Returns the number of buttons on a gamepad. */\ndeclare function gamepad_button_count(device: number): number;\n/** Returns true if the button is held this step. */\ndeclare function gamepad_button_check(device: number, button: number): boolean;\n/** Returns true if the button was pressed this step. */\ndeclare function gamepad_button_check_pressed(device: number, button: number): boolean;\n/** Returns true if the button was released this step. */\ndeclare function gamepad_button_check_released(device: number, button: number): boolean;\n/** Returns the analog button value (0\u20131). */\ndeclare function gamepad_button_value(device: number, button: number): number;\n/** Sets gamepad vibration. */\ndeclare function gamepad_set_vibration(device: number, left: number, right: number): void;\n//# sourceMappingURL=gamepad.d.ts.map\n/**\n * Combined input helpers (GMS `io_*`).\n */\n/** Clears all keyboard and mouse input state (held, pressed, released, wheel). */\ndeclare function io_clear(): void;\n//# sourceMappingURL=io.d.ts.map\n/**\n * Keyboard input system.\n *\n * Tracks key state across three categories:\n *   - held:     key is currently down\n *   - pressed:  key went down THIS step (cleared after one step)\n *   - released: key went up THIS step (cleared after one step)\n *\n * Call keyboard_manager.poll() once per step (done by the game loop).\n * Call keyboard_manager.end_step() after events fire to clear pressed/released.\n */\ndeclare const vk_nokey = 0;\ndeclare const vk_anykey = 1;\ndeclare const vk_backspace = 8;\ndeclare const vk_tab = 9;\ndeclare const vk_enter = 13;\ndeclare const vk_shift = 16;\ndeclare const vk_control = 17;\ndeclare const vk_alt = 18;\ndeclare const vk_pause = 19;\ndeclare const vk_escape = 27;\ndeclare const vk_space = 32;\ndeclare const vk_pageup = 33;\ndeclare const vk_pagedown = 34;\ndeclare const vk_end = 35;\ndeclare const vk_home = 36;\ndeclare const vk_left = 37;\ndeclare const vk_up = 38;\ndeclare const vk_right = 39;\ndeclare const vk_down = 40;\ndeclare const vk_insert = 45;\ndeclare const vk_delete = 46;\ndeclare const vk_f1 = 112;\ndeclare const vk_f2 = 113;\ndeclare const vk_f3 = 114;\ndeclare const vk_f4 = 115;\ndeclare const vk_f5 = 116;\ndeclare const vk_f6 = 117;\ndeclare const vk_f7 = 118;\ndeclare const vk_f8 = 119;\ndeclare const vk_f9 = 120;\ndeclare const vk_f10 = 121;\ndeclare const vk_f11 = 122;\ndeclare const vk_f12 = 123;\ndeclare const vk_numpad0 = 96;\ndeclare const vk_numpad1 = 97;\ndeclare const vk_numpad2 = 98;\ndeclare const vk_numpad3 = 99;\ndeclare const vk_numpad4 = 100;\ndeclare const vk_numpad5 = 101;\ndeclare const vk_numpad6 = 102;\ndeclare const vk_numpad7 = 103;\ndeclare const vk_numpad8 = 104;\ndeclare const vk_numpad9 = 105;\ndeclare const vk_multiply = 106;\ndeclare const vk_add = 107;\ndeclare const vk_subtract = 109;\ndeclare const vk_decimal = 110;\ndeclare const vk_divide = 111;\ndeclare const vk_printscreen = 44;\n/**\n * Internal keyboard state manager.\n * Attach to window events via keyboard_manager.attach().\n */\ndeclare class keyboard_manager {\n    private static _held;\n    private static _pressed;\n    private static _released;\n    private static _key_map;\n    /** Last key code that was pressed. */\n    static keyboard_key: number;\n    /** Previous key code (key before the last). */\n    static keyboard_lastkey: number;\n    /** Last character typed (from keypress events). */\n    static keyboard_lastchar: string;\n    /** Accumulated typed string (cleared by the game or manually). */\n    static keyboard_string: string;\n    private static _attached;\n    private static _on_keydown;\n    private static _on_keyup;\n    private static _on_keypress;\n    /**\n     * Attaches keyboard listeners to the window.\n     * Called once by input_manager.init().\n     */\n    static attach(): void;\n    /**\n     * Detaches keyboard listeners from the window.\n     */\n    static detach(): void;\n    private static _handle_down;\n    private static _handle_up;\n    private static _handle_press;\n    private static _map;\n    /**\n     * Clears the pressed and released sets at the end of each step.\n     * Called by the game loop after all events have fired.\n     */\n    static end_step(): void;\n    /** Returns true if the key is currently held down. */\n    static check(key: number): boolean;\n    /** Returns true if the key was pressed this step. */\n    static check_pressed(key: number): boolean;\n    /** Returns true if the key was released this step. */\n    static check_released(key: number): boolean;\n    /** Clears the held/pressed/released state for a specific key. */\n    static clear(key: number): void;\n    /** Clears all keyboard state (held + pressed + released). */\n    static clear_all(): void;\n    /** Simulates pressing a key. */\n    static key_press(key: number): void;\n    /** Simulates releasing a key. */\n    static key_release(key: number): void;\n    /** Remaps key1 to behave as key2. */\n    static set_map(key1: number, key2: number): void;\n    /** Returns the mapped key code for a given input code. */\n    static get_map(key: number): number;\n    /** Clears all key remappings. */\n    static unset_map(): void;\n}\n/** Returns true if key is currently held down. */\ndeclare function keyboard_check(key: number): boolean;\n/** Returns true if key was just pressed this step. */\ndeclare function keyboard_check_pressed(key: number): boolean;\n/** Returns true if key was just released this step. */\ndeclare function keyboard_check_released(key: number): boolean;\n/** Direct key state check \u2014 same as keyboard_check() in this implementation. */\ndeclare function keyboard_check_direct(key: number): boolean;\n/** Clears the held/pressed/released state for a key. */\ndeclare function keyboard_clear(key: number): void;\n/** Simulates pressing a key. */\ndeclare function keyboard_key_press(key: number): void;\n/** Simulates releasing a key. */\ndeclare function keyboard_key_release(key: number): void;\n/** Remaps key1 to act as key2. */\ndeclare function keyboard_set_map(key1: number, key2: number): void;\n/** Returns the current mapping for key. */\ndeclare function keyboard_get_map(key: number): number;\n/** Clears all key remappings. */\ndeclare function keyboard_unset_map(): void;\n//# sourceMappingURL=keyboard.d.ts.map\n/**\n * Mouse input system.\n *\n * Tracks mouse button state (held/pressed/released), position, and scroll wheel.\n * mouse_x / mouse_y are in room coordinates (accounts for view offset).\n * window_mouse_get_x/y return raw canvas-relative pixel coordinates.\n */\ndeclare const mb_none = 0;\ndeclare const mb_left = 1;\ndeclare const mb_right = 2;\ndeclare const mb_middle = 3;\ndeclare const mb_any = 4;\n/**\n * Internal mouse state manager.\n * Attach to the canvas via mouse_manager.attach(canvas).\n */\ndeclare class mouse_manager {\n    private static _held;\n    private static _pressed;\n    private static _released;\n    private static _canvas;\n    /** Mouse X in canvas pixel coordinates. */\n    static window_x: number;\n    /** Mouse Y in canvas pixel coordinates. */\n    static window_y: number;\n    /** Mouse X in room space (window_x + view offset). Updated each step. */\n    static mouse_x: number;\n    /** Mouse Y in room space (window_y + view offset). Updated each step. */\n    static mouse_y: number;\n    /** Currently held button (0 = none). */\n    static mouse_button: number;\n    /** Last button that was clicked. */\n    static mouse_lastbutton: number;\n    /** True if the scroll wheel moved up this step. */\n    private static _wheel_up;\n    /** True if the scroll wheel moved down this step. */\n    private static _wheel_down;\n    private static _attached;\n    private static _on_mousedown;\n    private static _on_mouseup;\n    private static _on_mousemove;\n    private static _on_wheel;\n    private static _on_contextmenu;\n    /**\n     * Attaches mouse listeners to a canvas element.\n     * @param canvas - The game canvas\n     */\n    static attach(canvas: HTMLCanvasElement): void;\n    /**\n     * Detaches mouse listeners from the canvas.\n     */\n    static detach(): void;\n    private static _get_button;\n    private static _handle_down;\n    private static _handle_up;\n    private static _handle_move;\n    private static _handle_wheel;\n    private static _update_position;\n    /**\n     * Updates room-space mouse coordinates using the current view offset.\n     * Called once per step by the game loop before keyboard/mouse events fire.\n     * @param view_x - Current view X offset in the room\n     * @param view_y - Current view Y offset in the room\n     */\n    static update_room_position(view_x: number, view_y: number): void;\n    /** Clears pressed/released state and wheel flags at the end of each step. */\n    static end_step(): void;\n    /** Returns true if button is held. */\n    static check(btn: number): boolean;\n    /** Returns true if button was pressed this step. */\n    static check_pressed(btn: number): boolean;\n    /** Returns true if button was released this step. */\n    static check_released(btn: number): boolean;\n    /** Clears state for a specific button. */\n    static clear(btn: number): void;\n    /** Clears all mouse button + wheel state. */\n    static clear_all(): void;\n    /** Returns true if the wheel scrolled up this step. */\n    static wheel_up(): boolean;\n    /** Returns true if the wheel scrolled down this step. */\n    static wheel_down(): boolean;\n}\n/** Returns true if mouse button is currently held. */\ndeclare function mouse_check_button(button: number): boolean;\n/** Returns true if mouse button was pressed this step. */\ndeclare function mouse_check_button_pressed(button: number): boolean;\n/** Returns true if mouse button was released this step. */\ndeclare function mouse_check_button_released(button: number): boolean;\n/** Clears state for a mouse button. */\ndeclare function mouse_clear(button: number): void;\n/** Returns true if the scroll wheel moved up this step. */\ndeclare function mouse_wheel_up(): boolean;\n/** Returns true if the scroll wheel moved down this step. */\ndeclare function mouse_wheel_down(): boolean;\n/** Returns mouse X position in window (canvas-relative pixels). */\ndeclare function window_mouse_get_x(): number;\n/** Returns mouse Y position in window (canvas-relative pixels). */\ndeclare function window_mouse_get_y(): number;\n/**\n * Moves the OS cursor to the given canvas-relative position.\n * Note: browsers do not support arbitrary cursor warping.\n * This is a no-op stub for GMS API compatibility.\n */\ndeclare function window_mouse_set(_x: number, _y: number): void;\n//# sourceMappingURL=mouse.d.ts.map\n/**\n * Touch input system \u2014 wraps the browser Touch Events API.\n *\n * GMS models touch as numbered \"devices\" (fingers), mapped to virtual mice.\n * This module follows the same pattern: each active touch point is a device.\n *\n * device_mouse_check_button / device_mouse_x / device_mouse_y mirror GMS's API.\n * Finger 0 is conventionally the primary touch; fingers 1+ are additional points.\n *\n * Call touch_manager.end_step() at the end of each step (done by input_manager).\n */\n/**\n * Internal touch state manager.\n * Attach to a canvas element via touch_manager.attach(canvas).\n */\ndeclare class touch_manager {\n    private static _points;\n    private static _canvas;\n    private static _attached;\n    private static _on_start;\n    private static _on_end;\n    private static _on_move;\n    private static _on_cancel;\n    /**\n     * Attaches touch listeners to a canvas element.\n     * @param canvas - The canvas receiving touch events\n     */\n    static attach(canvas: HTMLCanvasElement): void;\n    /**\n     * Detaches touch listeners from the canvas.\n     */\n    static detach(): void;\n    /**\n     * Converts a browser Touch to canvas-local coordinates.\n     */\n    private static _to_canvas;\n    /**\n     * Maps a Touch identifier to a stable slot index (0..MAX_TOUCH_POINTS-1).\n     * Returns -1 if no slot is available.\n     */\n    private static _id_to_slot;\n    private static _alloc_slot;\n    private static _free_slot;\n    private static _handle_start;\n    private static _handle_end;\n    private static _handle_move;\n    private static _handle_cancel;\n    /**\n     * Clears per-step pressed/released flags.\n     * Called by input_manager at the end of each step.\n     */\n    static end_step(): void;\n    /** Returns true if a touch point is currently active. */\n    static is_held(device: number): boolean;\n    /** Returns true if a touch point became active this step. */\n    static is_pressed(device: number): boolean;\n    /** Returns true if a touch point was lifted this step. */\n    static is_released(device: number): boolean;\n    /** Returns the canvas-space X coordinate of a touch device. */\n    static get_x(device: number): number;\n    /** Returns the canvas-space Y coordinate of a touch device. */\n    static get_y(device: number): number;\n    /** Returns the number of currently active touch points. */\n    static get_count(): number;\n}\n/**\n * Returns true if the touch device (finger) is currently active.\n * @param device - Finger slot (0 = primary)\n * @param button - Ignored (always mb_left for touch); kept for API parity\n */\ndeclare function device_mouse_check_button(device: number, button: number): boolean;\n/**\n * Returns true if the touch device became active this step.\n * @param device - Finger slot\n * @param button - Ignored\n */\ndeclare function device_mouse_check_button_pressed(device: number, button: number): boolean;\n/**\n * Returns true if the touch device was lifted this step.\n * @param device - Finger slot\n * @param button - Ignored\n */\ndeclare function device_mouse_check_button_released(device: number, button: number): boolean;\n/** Returns the canvas X position of the given touch device. */\ndeclare function device_mouse_x(device: number): number;\n/** Returns the canvas Y position of the given touch device. */\ndeclare function device_mouse_y(device: number): number;\n/** Returns the number of currently active touch points. */\ndeclare function device_get_touch_count(): number;\n//# sourceMappingURL=touch.d.ts.map\n/**\n * Math utilities.\n *\n * Mirrors the GMS built-in math functions:\n *   lengthdir_x/y, point_distance, point_direction,\n *   angle_difference, lerp, clamp, sign, frac, round, floor, ceil,\n *   dsin, dcos, dtan, arcsin, arccos, arctan, arctan2,\n *   power, sqr, sqrt, abs, min, max, median, mean, log2, log10, ln, exp\n */\n/** Converts degrees to radians. */\ndeclare function degtorad(deg: number): number;\n/** Converts radians to degrees. */\ndeclare function radtodeg(rad: number): number;\n/** Sine of angle in degrees. */\ndeclare function dsin(deg: number): number;\n/** Cosine of angle in degrees. */\ndeclare function dcos(deg: number): number;\n/** Tangent of angle in degrees. */\ndeclare function dtan(deg: number): number;\n/** Arcsine, returns radians (GMS-faithful; use darcsin for degrees). */\ndeclare function arcsin(x: number): number;\n/** Arccosine, returns radians (use darccos for degrees). */\ndeclare function arccos(x: number): number;\n/** Arctangent, returns radians (use darctan for degrees). */\ndeclare function arctan(x: number): number;\n/** Two-argument arctangent, returns radians. GMS: arctan2(y, x). */\ndeclare function arctan2(y: number, x: number): number;\n/** Arcsine of angle, returns degrees. */\ndeclare function darcsin(x: number): number;\n/** Arccosine of angle, returns degrees. */\ndeclare function darccos(x: number): number;\n/** Arctangent of angle, returns degrees. */\ndeclare function darctan(x: number): number;\n/** Two-argument arctangent, returns degrees. GMS: darctan2(y, x). */\ndeclare function darctan2(y: number, x: number): number;\n/**\n * Returns the X component of a vector with given length and direction.\n * @param len - Vector length\n * @param dir - Direction in degrees (0 = right, 90 = up in GMS)\n */\ndeclare function lengthdir_x(len: number, dir: number): number;\n/**\n * Returns the Y component of a vector with given length and direction.\n * GMS Y-axis is inverted (positive Y = down), so result is negated.\n * @param len - Vector length\n * @param dir - Direction in degrees\n */\ndeclare function lengthdir_y(len: number, dir: number): number;\n/**\n * Returns the Euclidean distance between two points.\n */\ndeclare function point_distance(x1: number, y1: number, x2: number, y2: number): number;\n/**\n * Returns the 3D Euclidean distance between two points.\n */\ndeclare function point_distance_3d(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;\n/**\n * Returns the direction from (x1, y1) to (x2, y2) in degrees.\n * 0 = right, 90 = up (GMS convention).\n */\ndeclare function point_direction(x1: number, y1: number, x2: number, y2: number): number;\n/**\n * Returns the shortest signed difference between two angles in degrees.\n * Result is in the range (-180, 180].\n */\ndeclare function angle_difference(a: number, b: number): number;\n/** Linear interpolation from a to b by factor w (0\u20131). */\ndeclare function lerp(a: number, b: number, w: number): number;\n/** Clamps val to [min_val, max_val]. */\ndeclare function clamp(val: number, min_val: number, max_val: number): number;\n/** Returns the sign of x: -1, 0, or 1. */\ndeclare function sign(x: number): number;\n/** Returns the fractional part of x. */\ndeclare function frac(x: number): number;\n/** Returns x squared. */\ndeclare function sqr(x: number): number;\n/** Returns the square root of x. */\ndeclare function sqrt(x: number): number;\n/** Returns the absolute value of x. */\ndeclare function abs(x: number): number;\n/** Returns the floor of x. */\ndeclare function floor(x: number): number;\n/** Returns the ceiling of x. */\ndeclare function ceil(x: number): number;\n/** Rounds x to the nearest integer. */\ndeclare function round(x: number): number;\n/** Returns x raised to the power n. */\ndeclare function power(x: number, n: number): number;\n/** Returns the base-2 logarithm of x. */\ndeclare function log2(x: number): number;\n/** Returns the base-10 logarithm of x. */\ndeclare function log10(x: number): number;\n/** Returns the natural logarithm of x. */\ndeclare function ln(x: number): number;\n/** Returns the base-n logarithm of x. GMS: logn(n, x). */\ndeclare function logn(n: number, x: number): number;\n/** Returns e raised to the power x. */\ndeclare function exp(x: number): number;\n/** Dot product of two 2D vectors (x1,y1)\xB7(x2,y2). */\ndeclare function dot_product(x1: number, y1: number, x2: number, y2: number): number;\n/** Dot product of two 3D vectors. */\ndeclare function dot_product_3d(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;\n/** Returns the minimum of all provided values. */\ndeclare function min(...values: number[]): number;\n/** Returns the maximum of all provided values. */\ndeclare function max(...values: number[]): number;\n/**\n * Returns the median of the provided values.\n * For an even count, returns the average of the two middle values.\n */\ndeclare function median(...values: number[]): number;\n/**\n * Returns the arithmetic mean of the provided values.\n * Returns 0 for empty input.\n */\ndeclare function mean(...values: number[]): number;\n/**\n * Returns whether x is between lo and hi (inclusive).\n * Equivalent to GMS's between(lo, x, hi).\n */\ndeclare function between(x: number, lo: number, hi: number): boolean;\n/**\n * Returns whether x is approximately equal to y within epsilon.\n */\ndeclare function approx(x: number, y: number, epsilon?: number): boolean;\n/**\n * Wraps x into the range [0, range).\n */\ndeclare function wrap(x: number, range: number): number;\n/**\n * Returns the dot product of two 2D vectors.\n */\ndeclare function dot2(x1: number, y1: number, x2: number, y2: number): number;\n/**\n * Returns the dot product of two 3D vectors.\n */\ndeclare function dot3(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;\n/**\n * Returns the 2D cross product (scalar z of 3D cross product).\n */\ndeclare function cross2(x1: number, y1: number, x2: number, y2: number): number;\n/** The mathematical constant pi (GMS exposes `pi` as a global). */\ndeclare const pi: number;\n/** True if point (px,py) lies within the axis-aligned rectangle (x1,y1)-(x2,y2). */\ndeclare function point_in_rectangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean;\n/** True if point (px,py) lies within the circle centred at (cx,cy) with radius rad. */\ndeclare function point_in_circle(px: number, py: number, cx: number, cy: number, rad: number): boolean;\n/** True if point (px,py) lies within the triangle (x1,y1)(x2,y2)(x3,y3). */\ndeclare function point_in_triangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean;\n/** 0 = outside, 1 = overlapping, 2 = first rectangle fully inside the second. */\ndeclare function rectangle_in_rectangle(sx1: number, sy1: number, sx2: number, sy2: number, x1: number, y1: number, x2: number, y2: number): number;\n/** 0 = outside, 1 = overlapping, 2 = rectangle fully inside the circle. */\ndeclare function rectangle_in_circle(sx1: number, sy1: number, sx2: number, sy2: number, cx: number, cy: number, rad: number): number;\n/** 0 = outside, 1 = overlapping, 2 = rectangle fully inside the triangle. */\ndeclare function rectangle_in_triangle(sx1: number, sy1: number, sx2: number, sy2: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;\n//# sourceMappingURL=math_utils.d.ts.map\n/**\n * Random number utilities.\n *\n * Mirrors the GMS random API:\n *   random, irandom, random_range, irandom_range,\n *   randomize, random_set_seed, random_get_seed\n *\n * Uses a seeded Mulberry32 PRNG for reproducible sequences.\n * Call randomize() or random_set_seed() to initialise the seed.\n * By default, seed is 0 (deterministic).\n */\n/**\n * Sets the RNG seed to a specific value.\n * @param seed - Integer seed value\n */\ndeclare function random_set_seed(seed: number): void;\n/**\n * Returns the current RNG seed.\n */\ndeclare function random_get_seed(): number;\n/**\n * Randomises the seed using the current timestamp.\n */\ndeclare function randomize(): void;\n/**\n * Returns a random float in [0, n).\n * @param n - Upper bound (exclusive)\n */\ndeclare function random(n: number): number;\n/**\n * Returns a random integer in [0, n] (inclusive).\n * @param n - Maximum value (inclusive)\n */\ndeclare function irandom(n: number): number;\n/**\n * Returns a random float in [lo, hi).\n * @param lo - Lower bound (inclusive)\n * @param hi - Upper bound (exclusive)\n */\ndeclare function random_range(lo: number, hi: number): number;\n/**\n * Returns a random integer in [lo, hi] (both inclusive).\n * @param lo - Lower bound (inclusive)\n * @param hi - Upper bound (inclusive)\n */\ndeclare function irandom_range(lo: number, hi: number): number;\n/**\n * Returns one of the given arguments chosen at random (GMS: choose(...)).\n * Uses the seeded PRNG. Returns undefined if no arguments are given.\n * @param values - Candidate values\n */\ndeclare function choose<T>(...values: T[]): T | undefined;\n/**\n * Randomly shuffles an array in-place (Fisher-Yates).\n * @param arr - Array to shuffle\n * @returns The same array (mutated)\n */\ndeclare function array_shuffle<T>(arr: T[]): T[];\n/**\n * Returns a random element from an array.\n * Returns undefined for empty arrays.\n * @param arr - Source array\n */\ndeclare function array_random<T>(arr: T[]): T | undefined;\n/**\n * Returns a random float using JavaScript's built-in Math.random().\n * Not affected by random_set_seed() \u2014 use for non-reproducible randomness.\n */\ndeclare function random_native(): number;\n//# sourceMappingURL=random.d.ts.map\n/**\n * Regular expression utilities.\n *\n * Thin wrappers around JavaScript's RegExp, providing a more GMS-friendly API.\n * GMS does not have native regex; these are Silkweaver extensions.\n */\n/**\n * Returns true if str matches the pattern.\n * @param str - String to test\n * @param pattern - Regular expression pattern string\n * @param flags - RegExp flags (e.g. 'i' for case-insensitive)\n */\ndeclare function regex_match(str: string, pattern: string, flags?: string): boolean;\n/**\n * Returns the first match of pattern in str, or null if no match.\n * @param str - String to search\n * @param pattern - Regular expression pattern string\n * @param flags - RegExp flags\n */\ndeclare function regex_find(str: string, pattern: string, flags?: string): string | null;\n/**\n * Returns all matches of pattern in str as an array.\n * @param str - String to search\n * @param pattern - Regular expression pattern string\n * @param flags - RegExp flags (default 'g' \u2014 global)\n */\ndeclare function regex_find_all(str: string, pattern: string, flags?: string): string[];\n/**\n * Replaces the first match of pattern in str with replacement.\n * @param str - Input string\n * @param pattern - Regular expression pattern string\n * @param replacement - Replacement string (supports $1, $2 group references)\n * @param flags - RegExp flags\n */\ndeclare function regex_replace(str: string, pattern: string, replacement: string, flags?: string): string;\n/**\n * Replaces all matches of pattern in str with replacement.\n * @param str - Input string\n * @param pattern - Regular expression pattern string\n * @param replacement - Replacement string\n * @param flags - RegExp flags (default 'g')\n */\ndeclare function regex_replace_all(str: string, pattern: string, replacement: string, flags?: string): string;\n/**\n * Splits str by pattern and returns an array of parts.\n * @param str - Input string\n * @param pattern - Regular expression pattern string\n * @param flags - RegExp flags\n */\ndeclare function regex_split(str: string, pattern: string, flags?: string): string[];\n/**\n * Returns the 1-based index of the first match, or 0 if not found.\n * @param str - String to search\n * @param pattern - Regular expression pattern string\n * @param flags - RegExp flags\n */\ndeclare function regex_pos(str: string, pattern: string, flags?: string): number;\n/**\n * Returns an array of capture groups from the first match, or empty array.\n * Index 0 is the full match; indices 1+ are capture groups.\n * @param str - String to match against\n * @param pattern - Regular expression pattern\n * @param flags - RegExp flags\n */\ndeclare function regex_groups(str: string, pattern: string, flags?: string): string[];\n//# sourceMappingURL=regex_utils.d.ts.map\n/**\n * String utility functions.\n *\n * Mirrors the GMS string API:\n *   string_length, string_copy, string_pos, string_delete, string_insert,\n *   string_replace, string_replace_all, string_count, string_lower, string_upper,\n *   string_letters, string_digits, string_lettersdigits,\n *   string_trim, string_repeat, string_reverse, string_format,\n *   chr, ord, ansi_char, string_char_at, string_byte_at, string_byte_length,\n *   string_set_byte_at\n *\n * String indexing is 1-based (matching GMS), unlike JavaScript's 0-based indexing.\n */\n/**\n * Returns the number of characters in a string.\n * @param str - Input string\n */\ndeclare function string_length(str: string): number;\n/**\n * Returns a substring.\n * @param str - Input string\n * @param index - Start index (1-based)\n * @param count - Number of characters to copy\n */\ndeclare function string_copy(str: string, index: number, count: number): string;\n/**\n * Returns the 1-based position of substr in str, or 0 if not found.\n * @param substr - Substring to search for\n * @param str - String to search in\n */\ndeclare function string_pos(substr: string, str: string): number;\n/**\n * Returns the 1-based position of the nth occurrence of substr in str.\n * @param substr - Substring to find\n * @param str - String to search in\n * @param occurrence - Which occurrence to find (1 = first)\n */\ndeclare function string_pos_ext(substr: string, str: string, occurrence?: number): number;\n/**\n * Deletes count characters from str starting at index (1-based).\n * @param str - Input string\n * @param index - Start index (1-based)\n * @param count - Number of characters to delete\n */\ndeclare function string_delete(str: string, index: number, count: number): string;\n/**\n * Inserts substr into str at 1-based index.\n * @param substr - String to insert\n * @param str - Target string\n * @param index - Insertion position (1-based)\n */\ndeclare function string_insert(substr: string, str: string, index: number): string;\n/**\n * Replaces the first occurrence of old_str with new_str.\n * @param str - Input string\n * @param old_str - String to replace\n * @param new_str - Replacement string\n */\ndeclare function string_replace(str: string, old_str: string, new_str: string): string;\n/**\n * Replaces all occurrences of old_str with new_str.\n * @param str - Input string\n * @param old_str - String to replace\n * @param new_str - Replacement string\n */\ndeclare function string_replace_all(str: string, old_str: string, new_str: string): string;\n/**\n * Returns the number of times substr appears in str.\n */\ndeclare function string_count(substr: string, str: string): number;\n/** Converts a string to lowercase. */\ndeclare function string_lower(str: string): string;\n/** Converts a string to uppercase. */\ndeclare function string_upper(str: string): string;\n/** Returns only the letter characters from a string. */\ndeclare function string_letters(str: string): string;\n/** Returns only the digit characters from a string. */\ndeclare function string_digits(str: string): string;\n/** Returns only letters and digits from a string. */\ndeclare function string_lettersdigits(str: string): string;\n/** Trims leading and trailing whitespace. */\ndeclare function string_trim(str: string): string;\n/** Trims leading whitespace. */\ndeclare function string_trim_start(str: string): string;\n/** Trims trailing whitespace. */\ndeclare function string_trim_end(str: string): string;\n/**\n * Repeats str n times.\n * @param str - String to repeat\n * @param n - Number of repetitions\n */\ndeclare function string_repeat(str: string, n: number): string;\n/** Reverses a string. */\ndeclare function string_reverse(str: string): string;\n/**\n * Returns a character at 1-based index.\n * Returns an empty string if out of range.\n */\ndeclare function string_char_at(str: string, index: number): string;\n/**\n * Returns the byte value at 1-based index (uses charCodeAt).\n */\ndeclare function string_byte_at(str: string, index: number): number;\n/** Returns the byte length of the UTF-16 encoded string. */\ndeclare function string_byte_length(str: string): number;\n/**\n * Returns the character with the given Unicode code point.\n * GMS equivalent: chr(val)\n */\ndeclare function chr(code: number): string;\n/**\n * Returns the Unicode code point of the first character of str.\n * GMS equivalent: ord(str)\n */\ndeclare function ord(str: string): number;\n/**\n * Returns the Unicode code point of the character at a 1-based index.\n * GMS equivalent: string_ord_at(str, index)\n */\ndeclare function string_ord_at(str: string, index: number): number;\n/** Alias for chr(), matching GMS's ansi_char. */\ndeclare function ansi_char(code: number): string;\n/**\n * Formats a number to a string with given total width and decimal places.\n * Mirrors GMS's string_format(val, tot, dec).\n * @param val - Number to format\n * @param tot - Minimum total width (padded with spaces on left)\n * @param dec - Number of decimal places\n */\ndeclare function string_format(val: number, tot: number, dec: number): string;\n/**\n * Converts a value to its string representation.\n * Mirrors GMS's string(val).\n */\ndeclare function string(val: unknown): string;\n/**\n * Converts a string to a real number.\n * Returns 0 if the string is not a valid number (GMS behaviour).\n */\ndeclare function real(str: string): number;\n/**\n * Splits a string by a delimiter and returns an array of parts.\n * @param str - String to split\n * @param delimiter - Separator string\n */\ndeclare function string_split(str: string, delimiter: string): string[];\n/**\n * Joins an array of strings with a separator.\n * @param parts - String array\n * @param separator - Separator between parts\n */\ndeclare function string_join(parts: string[], separator?: string): string;\n//# sourceMappingURL=string_utils.d.ts.map\n/**\n * A 2D vector representing a point or direction in 2D space.\n */\ndeclare class vector2 {\n    x: number;\n    y: number;\n    /**\n     * Creates a new 2D vector.\n     * @param x - X component (default 0)\n     * @param y - Y component (default 0)\n     */\n    constructor(x?: number, y?: number);\n    /**\n     * Returns a JSON string representation of this vector.\n     * @returns JSON string with x and y values\n     */\n    toString(): string;\n}\n//# sourceMappingURL=vectors.d.ts.map\n/**\n * Binary buffer system \u2014 ArrayBuffer-backed read/write buffers.\n *\n * Mirrors the GMS buffer API:\n *   buffer_create, buffer_delete, buffer_write, buffer_read,\n *   buffer_seek, buffer_tell, buffer_get_size, buffer_exists,\n *   buffer_get_surface (not applicable \u2014 omitted),\n *   buffer_base64_encode, buffer_base64_decode,\n *   buffer_md5, buffer_sha1 (omitted \u2014 no native WebCrypto sync API)\n *\n * Data types match GMS buffer_* type constants.\n * All writes grow the buffer automatically when needed.\n */\ndeclare const buffer_u8 = 0;\ndeclare const buffer_s8 = 1;\ndeclare const buffer_u16 = 2;\ndeclare const buffer_s16 = 3;\ndeclare const buffer_u32 = 4;\ndeclare const buffer_s32 = 5;\ndeclare const buffer_f32 = 6;\ndeclare const buffer_f64 = 7;\ndeclare const buffer_bool = 8;\ndeclare const buffer_string = 9;\ndeclare const buffer_u64 = 10;\ndeclare const buffer_fixed = 0;\ndeclare const buffer_grow = 1;\ndeclare const buffer_wrap = 2;\ndeclare const buffer_fast = 3;\ndeclare const buffer_seek_start = 0;\ndeclare const buffer_seek_relative = 1;\ndeclare const buffer_seek_end = 2;\n/**\n * Creates a new buffer.\n * @param size - Initial capacity in bytes\n * @param mode - buffer_fixed | buffer_grow | buffer_wrap | buffer_fast\n * @param alignment - Byte alignment hint (1 = byte-aligned, 2 = 16-bit, etc.)\n * @returns Buffer ID\n */\ndeclare function buffer_create(size: number, mode?: number, alignment?: number): number;\n/**\n * Deletes a buffer and frees its memory.\n * @param buffer_id - Buffer ID\n */\ndeclare function buffer_delete(buffer_id: number): void;\n/**\n * Returns true if the buffer ID is valid.\n * @param buffer_id - Buffer ID\n */\ndeclare function buffer_exists(buffer_id: number): boolean;\n/**\n * Returns the allocated capacity of the buffer in bytes.\n * @param buffer_id - Buffer ID\n */\ndeclare function buffer_get_size(buffer_id: number): number;\n/**\n * Returns the number of bytes written to the buffer.\n * @param buffer_id - Buffer ID\n */\ndeclare function buffer_tell(buffer_id: number): number;\n/**\n * Moves the read/write cursor.\n * @param buffer_id - Buffer ID\n * @param base - buffer_seek_start | buffer_seek_relative | buffer_seek_end\n * @param offset - Byte offset from base\n */\ndeclare function buffer_seek(buffer_id: number, base: number, offset: number): void;\n/**\n * Writes a value of the given type at the current cursor position.\n * @param buffer_id - Buffer ID\n * @param type - buffer_u8 | buffer_s8 | ... | buffer_string\n * @param value - Value to write\n */\ndeclare function buffer_write(buffer_id: number, type: number, value: number | boolean | string | bigint): void;\n/**\n * Reads a value of the given type from the current cursor position.\n * @param buffer_id - Buffer ID\n * @param type - Data type constant\n * @returns The read value, or 0 / false / '' on error\n */\ndeclare function buffer_read(buffer_id: number, type: number): number | boolean | string | bigint;\n/**\n * Fills a region of the buffer with a repeating byte value.\n * @param buffer_id - Buffer ID\n * @param offset - Start offset in bytes (from buffer start)\n * @param size - Number of bytes to fill\n * @param value - Byte value (0\u2013255)\n */\ndeclare function buffer_fill(buffer_id: number, offset: number, size: number, value: number): void;\n/**\n * Copies data from one buffer to another.\n * @param src_id - Source buffer ID\n * @param src_offset - Byte offset in source\n * @param dst_id - Destination buffer ID\n * @param dst_offset - Byte offset in destination\n * @param size - Number of bytes to copy\n */\ndeclare function buffer_copy(src_id: number, src_offset: number, dst_id: number, dst_offset: number, size: number): void;\n/**\n * Returns the size in bytes of a buffer data type (0 for variable-length string).\n * @param type - One of the buffer_* type constants\n */\ndeclare function buffer_sizeof(type: number): number;\n/**\n * Resizes a buffer's backing store, preserving existing bytes.\n * @param buffer_id - Buffer ID\n * @param new_size - New capacity in bytes\n */\ndeclare function buffer_resize(buffer_id: number, new_size: number): void;\n/**\n * Writes a value of the given type at an absolute offset without moving the\n * seek cursor.\n * @param buffer_id - Buffer ID\n * @param offset - Absolute byte offset\n * @param type - Buffer data type\n * @param value - Value to write\n */\ndeclare function buffer_poke(buffer_id: number, offset: number, type: number, value: number | boolean | string | bigint): void;\n/**\n * Reads a value of the given type at an absolute offset without moving the\n * seek cursor.\n * @param buffer_id - Buffer ID\n * @param offset - Absolute byte offset\n * @param type - Buffer data type\n * @returns The value read\n */\ndeclare function buffer_peek(buffer_id: number, offset: number, type: number): number | boolean | string | bigint;\n/**\n * Returns a Uint8Array view of the buffer's raw bytes (read-only snapshot).\n * @param buffer_id - Buffer ID\n */\ndeclare function buffer_get_bytes(buffer_id: number): Uint8Array;\n/**\n * Creates a buffer from a Uint8Array (e.g. from a network message).\n * @param bytes - Raw bytes\n * @returns Buffer ID\n */\ndeclare function buffer_from_bytes(bytes: Uint8Array): number;\n/**\n * Encodes the buffer contents as a Base64 string.\n * @param buffer_id - Buffer ID\n * @param offset - Start offset (default 0)\n * @param size - Number of bytes (default: full buffer)\n */\ndeclare function buffer_base64_encode(buffer_id: number, offset?: number, size?: number): string;\n/**\n * Creates a buffer from a Base64-encoded string.\n * @param base64 - Base64 string\n * @returns Buffer ID\n */\ndeclare function buffer_base64_decode(base64: string): number;\n//# sourceMappingURL=buffer.d.ts.map\n/**\n * HTTP client utilities.\n *\n * Mirrors GMS's http_get / http_post / http_get_file API.\n * All functions are Promise-based (unlike GMS async events).\n *\n * GMS equivalents:\n *   http_get(url)           \u2192 http_get(url)\n *   http_post_string(url,s) \u2192 http_post(url, body)\n *   http_get_file(url,path) \u2192 http_get_bytes(url)\n *   http_request(url,\u2026)     \u2192 http_request(url, \u2026)\n */\n/**\n * Represents the result of an HTTP request.\n */\ninterface http_response {\n    status: number;\n    ok: boolean;\n    text: string;\n    headers: Record<string, string>;\n}\n/**\n * Represents the result of a binary HTTP request.\n */\ninterface http_binary_response {\n    status: number;\n    ok: boolean;\n    bytes: Uint8Array;\n    headers: Record<string, string>;\n}\n/**\n * Performs an HTTP GET request and returns the response body as a string.\n * @param url - Request URL\n * @param headers - Optional extra headers\n * @returns Promise resolving to http_response\n */\ndeclare function http_get(url: string, headers?: Record<string, string>): Promise<http_response>;\n/**\n * Performs an HTTP POST request with a string body.\n * @param url - Request URL\n * @param body - Request body string\n * @param content_type - Content-Type header (default 'application/x-www-form-urlencoded')\n * @param headers - Optional extra headers\n * @returns Promise resolving to http_response\n */\ndeclare function http_post(url: string, body: string, content_type?: string, headers?: Record<string, string>): Promise<http_response>;\n/**\n * Performs an HTTP POST request with a JSON body.\n * @param url - Request URL\n * @param data - JavaScript value to serialize as JSON\n * @param headers - Optional extra headers\n * @returns Promise resolving to http_response\n */\ndeclare function http_post_json(url: string, data: unknown, headers?: Record<string, string>): Promise<http_response>;\n/**\n * Performs an HTTP GET request and returns the response body as raw bytes.\n * Equivalent to GMS's http_get_file (but returns bytes instead of saving to disk).\n * @param url - Request URL\n * @param headers - Optional extra headers\n * @returns Promise resolving to http_binary_response\n */\ndeclare function http_get_bytes(url: string, headers?: Record<string, string>): Promise<http_binary_response>;\n/**\n * Performs a generic HTTP request with full control over method, headers, and body.\n * @param url - Request URL\n * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)\n * @param headers - Request headers\n * @param body - Request body (string or Uint8Array), or null\n * @returns Promise resolving to http_response\n */\ndeclare function http_request(url: string, method: string, headers?: Record<string, string>, body?: string | Uint8Array | null): Promise<http_response>;\n//# sourceMappingURL=http_client.d.ts.map\n/**\n * WebRTC peer-to-peer networking via RTCDataChannel.\n *\n * Provides UDP-like unreliable messaging between peers using RTCDataChannel\n * in unordered + unreliable mode, or reliable ordered mode for TCP-like use.\n *\n * Usage pattern:\n *   1. Create a peer: webrtc_create_peer()\n *   2. Create a data channel on the offerer: webrtc_create_channel()\n *   3. Exchange SDP offer/answer and ICE candidates out-of-band (e.g. via WebSocket)\n *   4. Send/receive messages via webrtc_send / webrtc_set_on_message\n *\n * SDP and ICE negotiation is exposed directly \u2014 the application is responsible\n * for the signalling transport (typically a WebSocket server).\n */\n/**\n * Creates a new RTCPeerConnection.\n * @param ice_servers - STUN/TURN server config (default: Google STUN)\n * @returns Peer ID\n */\ndeclare function webrtc_create_peer(ice_servers?: RTCIceServer[]): number;\n/**\n * Creates a data channel on a peer (offerer side).\n * @param peer_id - Peer ID\n * @param label - Channel label\n * @param ordered - True for reliable ordered, false for UDP-like\n * @param max_retransmits - Max retransmits for unreliable mode (0 = no retry)\n * @returns Channel ID, or -1 on failure\n */\ndeclare function webrtc_create_channel(peer_id: number, label?: string, ordered?: boolean, max_retransmits?: number): number;\n/**\n * Creates an SDP offer for the peer (async).\n * @param peer_id - Peer ID\n * @returns SDP offer string, or null on failure\n */\ndeclare function webrtc_create_offer(peer_id: number): Promise<string | null>;\n/**\n * Creates an SDP answer in response to a received offer (async).\n * @param peer_id - Peer ID\n * @param offer_sdp - SDP offer string from the remote peer\n * @returns SDP answer string, or null on failure\n */\ndeclare function webrtc_create_answer(peer_id: number, offer_sdp: string): Promise<string | null>;\n/**\n * Sets the remote SDP answer on the offerer (async).\n * @param peer_id - Peer ID\n * @param answer_sdp - SDP answer string from the remote peer\n */\ndeclare function webrtc_set_remote_answer(peer_id: number, answer_sdp: string): Promise<void>;\n/**\n * Adds a received ICE candidate from the remote peer.\n * @param peer_id - Peer ID\n * @param candidate - RTCIceCandidateInit object (from signalling)\n */\ndeclare function webrtc_add_ice_candidate(peer_id: number, candidate: RTCIceCandidateInit): Promise<void>;\n/**\n * Sends raw bytes over a data channel.\n * @param peer_id - Peer ID\n * @param channel_id - Channel ID\n * @param bytes - Data to send\n */\ndeclare function webrtc_send(peer_id: number, channel_id: number, bytes: Uint8Array): void;\n/**\n * Sends a text string over a data channel.\n * @param peer_id - Peer ID\n * @param channel_id - Channel ID\n * @param text - Text to send\n */\ndeclare function webrtc_send_text(peer_id: number, channel_id: number, text: string): void;\n/**\n * Closes a peer connection and all its channels.\n * @param peer_id - Peer ID\n */\ndeclare function webrtc_destroy_peer(peer_id: number): void;\n/**\n * Sets the callback fired when a new incoming data channel is opened (answerer side).\n * @param peer_id - Peer ID\n * @param cb - Callback receiving (channel_id, label)\n */\ndeclare function webrtc_set_on_channel(peer_id: number, cb: (channel_id: number, label: string) => void): void;\n/**\n * Sets the callback fired when a local ICE candidate is ready to be sent to the remote peer.\n * @param peer_id - Peer ID\n * @param cb - Callback receiving the RTCIceCandidate\n */\ndeclare function webrtc_set_on_ice_candidate(peer_id: number, cb: (candidate: RTCIceCandidate) => void): void;\n/**\n * Sets the callback fired when a message arrives on a channel.\n * The callback receives a buffer ID (owned by caller; use buffer_delete when done).\n * @param peer_id - Peer ID\n * @param channel_id - Channel ID\n * @param cb - Callback receiving the buffer ID\n */\ndeclare function webrtc_set_on_message(peer_id: number, channel_id: number, cb: (buffer_id: number) => void): void;\n/**\n * Sets the callback fired when a channel opens.\n * @param peer_id - Peer ID\n * @param channel_id - Channel ID\n * @param cb - Callback\n */\ndeclare function webrtc_set_on_open(peer_id: number, channel_id: number, cb: () => void): void;\n/**\n * Sets the callback fired when a channel closes.\n * @param peer_id - Peer ID\n * @param channel_id - Channel ID\n * @param cb - Callback\n */\ndeclare function webrtc_set_on_close(peer_id: number, channel_id: number, cb: () => void): void;\n/** Returns true if the peer ID refers to a live peer. */\ndeclare function webrtc_peer_exists(peer_id: number): boolean;\n/** Returns the RTCPeerConnection connection state string, or 'closed' if not found. */\ndeclare function webrtc_get_state(peer_id: number): string;\n//# sourceMappingURL=webrtc_client.d.ts.map\n/**\n * WebSocket networking client.\n *\n * Mirrors GMS's network_create_socket / network_connect / network_send_raw API.\n * Messages are binary (ArrayBuffer) or text strings.\n *\n * Events (onopen, onmessage, onclose, onerror) are exposed as callbacks\n * rather than GMS async events, to match JavaScript idioms.\n */\n/** WebSocket states matching the GMS network_type_* constants. */\ndeclare const network_type_connect = 0;\ndeclare const network_type_disconnect = 1;\ndeclare const network_type_data = 2;\ndeclare const network_type_non_blocking_connect = 3;\n/**\n * Creates a WebSocket connection to the given URL.\n * @param url - WebSocket URL (ws:// or wss://)\n * @param protocols - Optional subprotocols\n * @returns Socket ID, or -1 on immediate failure\n */\ndeclare function network_create_socket(url: string, protocols?: string | string[]): number;\n/**\n * Sends raw bytes from a buffer over a WebSocket connection.\n * @param socket_id - Socket ID\n * @param bytes - Uint8Array to send\n */\ndeclare function network_send_raw(socket_id: number, bytes: Uint8Array): void;\n/**\n * Sends a text string over a WebSocket connection.\n * @param socket_id - Socket ID\n * @param text - Text to send\n */\ndeclare function network_send_text(socket_id: number, text: string): void;\n/**\n * Closes a WebSocket connection.\n * @param socket_id - Socket ID\n * @param code - Close code (default 1000 = normal closure)\n * @param reason - Human-readable reason\n */\ndeclare function network_destroy(socket_id: number, code?: number, reason?: string): void;\n/**\n * Returns the WebSocket ready state: 0=CONNECTING 1=OPEN 2=CLOSING 3=CLOSED.\n * Returns -1 if the socket ID is invalid.\n * @param socket_id - Socket ID\n */\ndeclare function network_get_ready_state(socket_id: number): number;\n/**\n * Sets the callback fired when the socket connects.\n * @param socket_id - Socket ID\n * @param cb - Callback\n */\ndeclare function network_set_on_open(socket_id: number, cb: () => void): void;\n/**\n * Sets the callback fired when a message is received.\n * The callback receives a buffer ID containing the message bytes.\n * The buffer is owned by the callback and should be freed with buffer_delete().\n * @param socket_id - Socket ID\n * @param cb - Callback receiving the buffer ID\n */\ndeclare function network_set_on_message(socket_id: number, cb: (buffer_id: number) => void): void;\n/**\n * Sets the callback fired when the socket closes.\n * @param socket_id - Socket ID\n * @param cb - Callback receiving (code, reason)\n */\ndeclare function network_set_on_close(socket_id: number, cb: (code: number, reason: string) => void): void;\n/**\n * Sets the callback fired when a socket error occurs.\n * @param socket_id - Socket ID\n * @param cb - Callback\n */\ndeclare function network_set_on_error(socket_id: number, cb: () => void): void;\n/**\n * Returns true if the given socket ID refers to a live socket.\n * @param socket_id - Socket ID\n */\ndeclare function network_socket_exists(socket_id: number): boolean;\n//# sourceMappingURL=websocket_client.d.ts.map\n/**\n * Particle emitter \u2014 spawns particles into a particle system.\n *\n * Mirrors the GMS part_emitter_* API.\n *\n * An emitter belongs to a system and defines:\n *   - A region (point, rectangle, ellipse, diamond) where particles spawn\n *   - A distribution within that region (linear, Gaussian, inv_Gaussian)\n *   - Burst and stream modes\n */\ndeclare const ps_shape_rectangle = 0;\ndeclare const ps_shape_ellipse = 1;\ndeclare const ps_shape_diamond = 2;\ndeclare const ps_shape_line = 3;\ndeclare const ps_distr_linear = 0;\ndeclare const ps_distr_gaussian = 1;\ndeclare const ps_distr_inv_gaussian = 2;\n/**\n * Creates a new emitter attached to a particle system.\n * @param system_id - System ID to spawn particles into\n * @returns Emitter ID\n */\ndeclare function part_emitter_create(system_id: number): number;\n/**\n * Destroys an emitter.\n * @param emitter_id - Emitter ID\n */\ndeclare function part_emitter_destroy(emitter_id: number): void;\n/** Returns true if the emitter ID is valid. */\ndeclare function part_emitter_exists(emitter_id: number): boolean;\n/**\n * Sets the region and distribution for an emitter.\n * @param emitter_id - Emitter ID\n * @param x1 - Region left\n * @param y1 - Region top\n * @param x2 - Region right\n * @param y2 - Region bottom\n * @param shape - ps_shape_* constant\n * @param distr - ps_distr_* constant\n */\ndeclare function part_emitter_region(emitter_id: number, x1: number, y1: number, x2: number, y2: number, shape: number, distr: number): void;\n/**\n * Spawns a single burst of particles from an emitter.\n * @param emitter_id - Emitter ID\n * @param type_id - Particle type ID\n * @param number - Number of particles to spawn\n */\ndeclare function part_emitter_burst(emitter_id: number, type_id: number, number: number): void;\n/**\n * Spawns a continuous stream of particles (call each step).\n * Internally identical to burst \u2014 the caller is responsible for calling each step.\n * @param emitter_id - Emitter ID\n * @param type_id - Particle type ID\n * @param number - Number of particles to spawn this step\n */\ndeclare function part_emitter_stream(emitter_id: number, type_id: number, number: number): void;\n//# sourceMappingURL=particle_emitter.d.ts.map\n/**\n * Particle system \u2014 manages a pool of live particles and renders them.\n *\n * Mirrors the GMS part_system_* API.\n *\n * One particle system holds all particles created by its emitters.\n * Call part_system_update() each step and part_system_draw() in the draw event.\n *\n * Rendering uses the engine's 2D renderer (draw_rectangle / draw_circle style\n * primitives via the renderer's batch API).  Shapes are drawn as simple\n * colored rectangles/circles \u2014 a sprite atlas approach is left for future work.\n */\ninterface live_particle {\n    type_id: number;\n    x: number;\n    y: number;\n    spd: number;\n    dir: number;\n    ang: number;\n    spd_incr: number;\n    dir_incr: number;\n    ang_incr: number;\n    size: number;\n    size_incr: number;\n    life: number;\n    life_max: number;\n    r: number;\n    g: number;\n    b: number;\n    alpha: number;\n    additive: boolean;\n}\ninterface part_system_def {\n    particles: live_particle[];\n    depth: number;\n    persistent: boolean;\n    auto_update: boolean;\n    auto_draw: boolean;\n}\n/** Creates a single live particle from a type at position (x, y). */\ndeclare function _spawn_particle(sys: part_system_def, type_id: number, x: number, y: number): void;\n/** Returns the raw system state object for internal use by particle_emitter.ts. */\ndeclare function _get_system_raw(system_id: number): part_system_def | undefined;\n/** Creates a new particle system and returns its ID. */\ndeclare function part_system_create(): number;\n/** Destroys a particle system and all its particles. */\ndeclare function part_system_destroy(system_id: number): void;\n/** Returns true if the system ID is valid. */\ndeclare function part_system_exists(system_id: number): boolean;\n/** Sets the draw depth of the system. */\ndeclare function part_system_depth(system_id: number, depth: number): void;\n/** Clears all live particles from the system without destroying it. */\ndeclare function part_system_clear(system_id: number): void;\n/** Returns the number of live particles in the system. */\ndeclare function part_system_count(system_id: number): number;\n/**\n * Advances all particles in the system by one step.\n * Handles motion, lifetime, per-step sub-emitters, and death sub-emitters.\n * @param system_id - System ID\n */\ndeclare function part_system_update(system_id: number): void;\n/**\n * Draws all particles in the system using the engine renderer.\n * Must be called from within a draw event (after renderer.begin_frame).\n * @param system_id - System ID\n */\ndeclare function part_system_draw(system_id: number): void;\n\n//# sourceMappingURL=particle_system.d.ts.map\n/**\n * Particle type definitions.\n *\n * A particle type is a template describing how individual particles look and behave.\n * Mirrors the GMS part_type_* API.\n *\n * Particle types are consumed by particle emitters and particle systems.\n * They are shared \u2014 one type can be used by many emitters.\n */\ndeclare const pt_shape_pixel = 0;\ndeclare const pt_shape_disk = 1;\ndeclare const pt_shape_square = 2;\ndeclare const pt_shape_line = 3;\ndeclare const pt_shape_star = 4;\ndeclare const pt_shape_circle = 5;\ndeclare const pt_shape_ring = 6;\ndeclare const pt_shape_sphere = 7;\ndeclare const pt_shape_flare = 8;\ndeclare const pt_shape_spark = 9;\ndeclare const pt_shape_explosion = 10;\ndeclare const pt_shape_cloud = 11;\ndeclare const pt_shape_smoke = 12;\ndeclare const pt_shape_snow = 13;\ninterface part_type_def {\n    shape: number;\n    size1: number;\n    size2: number;\n    size_incr: number;\n    size_wiggle: number;\n    speed1: number;\n    speed2: number;\n    speed_incr: number;\n    speed_wiggle: number;\n    dir1: number;\n    dir2: number;\n    dir_incr: number;\n    dir_wiggle: number;\n    grav_amount: number;\n    grav_dir: number;\n    ang1: number;\n    ang2: number;\n    ang_incr: number;\n    ang_wiggle: number;\n    ang_relative: boolean;\n    life1: number;\n    life2: number;\n    color1: number;\n    color2: number;\n    color3: number;\n    alpha1: number;\n    alpha2: number;\n    alpha3: number;\n    additive: boolean;\n    death_type_id: number;\n    death_number: number;\n    step_type_id: number;\n    step_number: number;\n}\n/** Creates a new particle type and returns its ID. */\ndeclare function part_type_create(): number;\n/** Destroys a particle type. */\ndeclare function part_type_destroy(type_id: number): void;\n/** Returns true if the particle type ID is valid. */\ndeclare function part_type_exists(type_id: number): boolean;\n/** Sets the shape of particles of this type. */\ndeclare function part_type_shape(type_id: number, shape: number): void;\n/** Sets the size range and per-step variation. */\ndeclare function part_type_size(type_id: number, size_min: number, size_max: number, size_incr: number, size_wiggle: number): void;\n/** Sets the speed range and per-step variation. */\ndeclare function part_type_speed(type_id: number, speed_min: number, speed_max: number, speed_incr: number, speed_wiggle: number): void;\n/** Sets the direction range and per-step variation (degrees). */\ndeclare function part_type_direction(type_id: number, dir_min: number, dir_max: number, dir_incr: number, dir_wiggle: number): void;\n/** Sets the gravity applied to particles (amount in pixels/step\xB2, direction in degrees). */\ndeclare function part_type_gravity(type_id: number, amount: number, direction: number): void;\n/** Sets the orientation (angle) range and variation. */\ndeclare function part_type_orientation(type_id: number, ang_min: number, ang_max: number, ang_incr: number, ang_wiggle: number, ang_relative: boolean): void;\n/** Sets the lifetime range in steps. */\ndeclare function part_type_life(type_id: number, life_min: number, life_max: number): void;\n/** Sets three color stops interpolated over the particle lifetime. */\ndeclare function part_type_color3(type_id: number, c1: number, c2: number, c3: number): void;\n/** Sets two color stops (shorthand). */\ndeclare function part_type_color2(type_id: number, c1: number, c2: number): void;\n/** Sets a single constant color. */\ndeclare function part_type_color1(type_id: number, c: number): void;\n/** Sets three alpha stops interpolated over the particle lifetime. */\ndeclare function part_type_alpha3(type_id: number, a1: number, a2: number, a3: number): void;\n/** Sets two alpha stops. */\ndeclare function part_type_alpha2(type_id: number, a1: number, a2: number): void;\n/** Sets a single constant alpha. */\ndeclare function part_type_alpha1(type_id: number, a: number): void;\n/** Sets whether particles blend additively. */\ndeclare function part_type_blend(type_id: number, additive: boolean): void;\n/**\n * Sets a sub-emitter that spawns particles on step.\n * @param type_id - Parent type ID\n * @param sub_type_id - Type to spawn (-1 = none)\n * @param number - Number of particles spawned per step\n */\ndeclare function part_type_step(type_id: number, sub_type_id: number, number: number): void;\n/**\n * Sets a sub-emitter that spawns particles when a particle dies.\n * @param type_id - Parent type ID\n * @param sub_type_id - Type to spawn (-1 = none)\n * @param number - Number of particles spawned on death\n */\ndeclare function part_type_death(type_id: number, sub_type_id: number, number: number): void;\n/** Returns the raw type definition for use by the particle system. */\ndeclare function part_type_get_def(type_id: number): part_type_def | undefined;\n//# sourceMappingURL=particle_type.d.ts.map\n/**\n * Physics body and fixture system \u2014 wraps matter.js Body.\n *\n * Fixture shapes: rectangle, circle, polygon (convex hull).\n * Bodies can be dynamic, static, or kinematic.\n *\n * Positions are in room pixel space.\n * The px_per_metre scale factor converts to matter.js metre space.\n *\n * GMS-compatible API:\n *   physics_fixture_create / physics_fixture_set_* / physics_fixture_bind /\n *   physics_fixture_delete / physics_body_apply_force /\n *   physics_body_apply_impulse / physics_body_set_velocity /\n *   physics_body_get_* / physics_body_set_*\n */\n\n/**\n * Creates a new fixture definition and returns its ID.\n * Configure the fixture with physics_fixture_set_* before binding it.\n * @returns Fixture ID\n */\ndeclare function physics_fixture_create(): number;\n/**\n * Sets the fixture shape to a box.\n * @param fixture_id - Fixture ID\n * @param w - Width in pixels\n * @param h - Height in pixels\n */\ndeclare function physics_fixture_set_box(fixture_id: number, w: number, h: number): void;\n/**\n * Sets the fixture shape to a circle.\n * @param fixture_id - Fixture ID\n * @param radius - Radius in pixels\n */\ndeclare function physics_fixture_set_circle(fixture_id: number, radius: number): void;\n/**\n * Sets the fixture shape to a convex polygon.\n * @param fixture_id - Fixture ID\n * @param verts - Array of {x, y} vertices in pixel space\n */\ndeclare function physics_fixture_set_polygon(fixture_id: number, verts: {\n    x: number;\n    y: number;\n}[]): void;\n/**\n * Sets the density of a fixture (affects mass).\n * @param fixture_id - Fixture ID\n * @param density - Density value (default 0.001)\n */\ndeclare function physics_fixture_set_density(fixture_id: number, density: number): void;\n/**\n * Sets the restitution (bounciness) of a fixture.\n * @param fixture_id - Fixture ID\n * @param restitution - Value 0 (no bounce) to 1 (full bounce)\n */\ndeclare function physics_fixture_set_restitution(fixture_id: number, restitution: number): void;\n/**\n * Sets the friction of a fixture.\n * @param fixture_id - Fixture ID\n * @param friction - Friction coefficient (0 = frictionless, 1 = high friction)\n */\ndeclare function physics_fixture_set_friction(fixture_id: number, friction: number): void;\n/**\n * Sets whether a fixture is a sensor (detects overlaps without physical response).\n * @param fixture_id - Fixture ID\n * @param is_sensor - True for sensor, false for solid\n */\ndeclare function physics_fixture_set_sensor(fixture_id: number, is_sensor: boolean): void;\n/**\n * Creates a physics body from a fixture at the given position.\n * @param fixture_id - Fixture ID to use as the body's shape\n * @param x - Initial X position in room pixels\n * @param y - Initial Y position in room pixels\n * @param is_static - True for static (immovable) body\n * @returns Body ID, or -1 if the world is not created\n */\ndeclare function physics_fixture_bind(fixture_id: number, x: number, y: number, is_static?: boolean): number;\n/**\n * Frees a fixture definition. Bodies already created from it are unaffected.\n * @param fixture_id - Fixture ID\n */\ndeclare function physics_fixture_delete(fixture_id: number): void;\n/**\n * Destroys a physics body and removes it from the world.\n * @param body_id - Body ID returned by physics_fixture_bind\n */\ndeclare function physics_body_destroy(body_id: number): void;\n/**\n * Applies a continuous force to a body at its centre.\n * @param body_id - Body ID\n * @param fx - Force X (pixel-space units)\n * @param fy - Force Y (pixel-space units)\n */\ndeclare function physics_body_apply_force(body_id: number, fx: number, fy: number): void;\n/**\n * Applies an impulse (instant velocity change) at the body's centre.\n * @param body_id - Body ID\n * @param ix - Impulse X\n * @param iy - Impulse Y\n */\ndeclare function physics_body_apply_impulse(body_id: number, ix: number, iy: number): void;\n/**\n * Applies a force to a body at a world-space point (off-centre forces induce rotation).\n * @param px - World X of the application point\n * @param py - World Y of the application point\n * @param fx - Force X \xB7 @param fy - Force Y\n */\ndeclare function physics_body_apply_force_at(body_id: number, px: number, py: number, fx: number, fy: number): void;\n/**\n * Applies a torque (rotational force) to a body.\n * @param torque - Torque to add this step (positive = clockwise in screen space)\n */\ndeclare function physics_body_apply_torque(body_id: number, torque: number): void;\n/**\n * Sets the velocity of a body directly.\n * @param body_id - Body ID\n * @param vx - Velocity X in pixels/step\n * @param vy - Velocity Y in pixels/step\n */\ndeclare function physics_body_set_velocity(body_id: number, vx: number, vy: number): void;\n/**\n * Sets the position of a body directly (teleports without velocity change).\n * @param body_id - Body ID\n * @param x - New X in room pixels\n * @param y - New Y in room pixels\n */\ndeclare function physics_body_set_position(body_id: number, x: number, y: number): void;\n/**\n * Sets the angular velocity of a body.\n * @param body_id - Body ID\n * @param omega - Angular velocity in radians/step\n */\ndeclare function physics_body_set_angular_velocity(body_id: number, omega: number): void;\n/** Returns the X position of a body in room pixels. */\ndeclare function physics_body_get_x(body_id: number): number;\n/** Returns the Y position of a body in room pixels. */\ndeclare function physics_body_get_y(body_id: number): number;\n/** Returns the rotation angle of a body in degrees. */\ndeclare function physics_body_get_angle(body_id: number): number;\n/** Returns the X velocity of a body. */\ndeclare function physics_body_get_vx(body_id: number): number;\n/** Returns the Y velocity of a body. */\ndeclare function physics_body_get_vy(body_id: number): number;\n/** Returns the angular velocity of a body in radians/step. */\ndeclare function physics_body_get_angular_velocity(body_id: number): number;\n/**\n * Makes a body static (immovable) or dynamic.\n * @param body_id - Body ID\n * @param is_static - True to make static\n */\ndeclare function physics_body_set_static(body_id: number, is_static: boolean): void;\n/** Returns true if the body ID refers to a live body. */\ndeclare function physics_body_exists(body_id: number): boolean;\n/**\n * Returns the raw matter.js Body for advanced use.\n * @param body_id - Body ID\n */\ndeclare function physics_body_get_raw(body_id: number): any | undefined;\n//# sourceMappingURL=physics_body.d.ts.map\n/**\n * Physics joints \u2014 wraps matter.js Constraint.\n *\n * Supports:\n *   - Distance joint: fixed separation between two points\n *   - Revolute joint: bodies rotate around a shared pivot\n *   - Weld joint: bodies locked together (zero stiffness distance constraint)\n *\n * All positions are in room pixel space.\n */\n\n/**\n * Creates a distance joint between two bodies.\n * The joint maintains (approximately) the distance between the two anchor points.\n * @param body_a_id - First body ID\n * @param body_b_id - Second body ID\n * @param ax - Anchor X on body A in body-local pixels (0 = centre)\n * @param ay - Anchor Y on body A\n * @param bx - Anchor X on body B\n * @param by - Anchor Y on body B\n * @param stiffness - Spring stiffness (0\u20131; 1 = rigid, <1 = springy)\n * @param damping - Damping ratio (0 = no damping)\n * @returns Joint ID, or -1 on failure\n */\ndeclare function physics_joint_distance_create(body_a_id: number, body_b_id: number, ax: number, ay: number, bx: number, by: number, stiffness?: number, damping?: number): number;\n/**\n * Creates a revolute (pin) joint \u2014 bodies rotate freely around a shared world-space pivot.\n * Implemented as a stiff zero-length distance constraint anchored at the same world point.\n * @param body_a_id - First body ID\n * @param body_b_id - Second body ID\n * @param pivot_x - Pivot X in room pixels\n * @param pivot_y - Pivot Y in room pixels\n * @returns Joint ID, or -1 on failure\n */\ndeclare function physics_joint_revolute_create(body_a_id: number, body_b_id: number, pivot_x: number, pivot_y: number): number;\n/**\n * Creates a weld joint \u2014 two bodies move as one rigid unit.\n * Implemented as a stiff zero-length distance constraint at their current relative offset.\n * @param body_a_id - First body ID\n * @param body_b_id - Second body ID\n * @returns Joint ID, or -1 on failure\n */\ndeclare function physics_joint_weld_create(body_a_id: number, body_b_id: number): number;\n/**\n * Creates a spring joint with a rest length and spring stiffness.\n * @param body_a_id - First body ID\n * @param body_b_id - Second body ID\n * @param ax - Anchor X on body A (local pixels)\n * @param ay - Anchor Y on body A\n * @param bx - Anchor X on body B\n * @param by - Anchor Y on body B\n * @param rest_length - Natural length of the spring in pixels\n * @param stiffness - Spring stiffness (0\u20131)\n * @param damping - Damping (0 = undamped)\n * @returns Joint ID, or -1 on failure\n */\ndeclare function physics_joint_spring_create(body_a_id: number, body_b_id: number, ax: number, ay: number, bx: number, by: number, rest_length: number, stiffness?: number, damping?: number): number;\n/**\n * Creates a rope joint \u2014 limits the distance between two anchors to `maxlength` (taut, non-stretchy).\n * @param ax,ay - Anchor on body A (local pixels, 0 = centre) \xB7 @param bx,by - Anchor on body B\n * @param maxlength - Maximum separation in pixels\n * @returns Joint ID, or -1 on failure\n */\ndeclare function physics_joint_rope_create(body_a_id: number, body_b_id: number, ax: number, ay: number, bx: number, by: number, maxlength: number): number;\n/** Reads a joint property \u2014 `'length'`, `'stiffness'`, or `'damping'`. */\ndeclare function physics_joint_get_value(joint_id: number, field: 'length' | 'stiffness' | 'damping'): number;\n/** Sets a joint property \u2014 `'length'`, `'stiffness'`, or `'damping'`. */\ndeclare function physics_joint_set_value(joint_id: number, field: 'length' | 'stiffness' | 'damping', value: number): void;\n/** Returns true if two physics bodies' shapes overlap. */\ndeclare function physics_test_overlap(body_a_id: number, body_b_id: number): boolean;\n/**\n * Casts a ray through the physics world and returns the ids of the bodies it hits.\n * @returns Hit body ids (as returned by `physics_fixture_bind`)\n */\ndeclare function physics_raycast(x1: number, y1: number, x2: number, y2: number): number[];\n/**\n * Destroys a joint and removes it from the world.\n * @param joint_id - Joint ID returned by physics_joint_*_create\n */\ndeclare function physics_joint_destroy(joint_id: number): void;\n/** Returns true if a joint ID refers to a live joint. */\ndeclare function physics_joint_exists(joint_id: number): boolean;\n/**\n * Returns the raw matter.js Constraint for advanced use.\n * @param joint_id - Joint ID\n */\ndeclare function physics_joint_get_raw(joint_id: number): any | undefined;\n//# sourceMappingURL=physics_joint.d.ts.map\n/**\n * Physics world \u2014 wraps a matter.js Engine and World.\n *\n * One physics world exists per game. Call physics_world_create() once,\n * then physics_world_step() each game step to advance the simulation.\n *\n * Gravity matches GMS defaults: (0, 0.1) in room-pixel units per step.\n * The scale factor (physics_world_create's pixel-per-meter) converts\n * between pixel space (instances) and matter.js metre space.\n */\n\ntype collision_cb = (body_a: any, body_b: any) => void;\n/**\n * Creates (or recreates) the physics world.\n * Must be called before any physics_body or physics_fixture functions.\n * @param gx - Gravity X in room units per step (default 0)\n * @param gy - Gravity Y in room units per step (default 0.1)\n * @param px_per_metre - Pixel-to-metre scale (default 64)\n */\ndeclare function physics_world_create(gx?: number, gy?: number, px_per_metre?: number): void;\n/**\n * Advances the physics simulation by one step.\n * Call this once per game step (before reading body positions).\n * @param delta_ms - Step duration in milliseconds (default 1000/60 \u2248 16.67)\n */\ndeclare function physics_world_step(delta_ms?: number): void;\n/**\n * Sets the world gravity vector.\n * @param gx - Gravity X (room units per step)\n * @param gy - Gravity Y (room units per step)\n */\ndeclare function physics_world_gravity(gx: number, gy: number): void;\n/**\n * Destroys the physics world and frees all resources.\n */\ndeclare function physics_world_destroy(): void;\n/**\n * Registers a callback fired when two physics bodies begin colliding.\n * @param cb - Callback receiving the two colliding bodies\n */\ndeclare function physics_world_on_collision_start(cb: collision_cb): void;\n/**\n * Registers a callback fired when two physics bodies stop colliding.\n * @param cb - Callback receiving the two separated bodies\n */\ndeclare function physics_world_on_collision_end(cb: collision_cb): void;\n/**\n * Returns the raw matter.js Engine for advanced use.\n * Returns null if the world has not been created yet.\n */\ndeclare function physics_world_get_engine(): any | null;\n/**\n * Returns the pixel-per-metre scale factor set at world creation.\n */\ndeclare function physics_get_scale(): number;\n/**\n * Returns the raw matter.js World, or null if not created.\n * Used internally by physics_body.ts.\n */\ndeclare function _get_world(): any | null;\n/**\n * Returns the raw matter.js Engine, or null if not created.\n * Used internally by physics_body.ts.\n */\ndeclare function _get_engine(): any | null;\n\n//# sourceMappingURL=physics_world.d.ts.map\n/**\n * Virtual file system backed by IndexedDB.\n *\n * Mirrors the GMS text-file API: file_text_open_read, file_text_open_write,\n * file_text_open_append, file_text_close, file_text_read_string,\n * file_text_write_string, file_text_writeln, file_text_eof,\n * file_text_readln, file_exists, file_delete.\n *\n * All I/O is asynchronous (Promise-based), unlike GMS which is synchronous.\n * The file handle returned is a numeric ID, consistent with GMS.\n *\n * Storage layout: IndexedDB database \"silkweaver_fs\", object store \"files\",\n * keyed by filename (string).\n */\n/**\n * Opens a file for reading. Returns a handle ID.\n * The file must exist; use file_exists() to check first.\n * @param filename - Filename (used as the key in IndexedDB)\n * @returns Promise resolving to a file handle number, or -1 if not found\n */\ndeclare function file_text_open_read(filename: string): Promise<number>;\n/**\n * Opens a file for writing (creates or overwrites).\n * @param filename - Filename\n * @returns Promise resolving to a file handle number\n */\ndeclare function file_text_open_write(filename: string): Promise<number>;\n/**\n * Opens a file for appending. Existing content is preserved.\n * @param filename - Filename\n * @returns Promise resolving to a file handle number\n */\ndeclare function file_text_open_append(filename: string): Promise<number>;\n/**\n * Closes a file handle, flushing writes to IndexedDB.\n * @param handle - File handle returned by file_text_open_*\n */\ndeclare function file_text_close(handle: number): Promise<void>;\n/**\n * Reads the next line from a read-mode file.\n * Returns an empty string if at end of file.\n * @param handle - File handle\n */\ndeclare function file_text_readln(handle: number): string;\n/**\n * Reads a single string token (up to whitespace) from a read-mode file.\n * @param handle - File handle\n */\ndeclare function file_text_read_string(handle: number): string;\n/**\n * Returns true if the read cursor is at the end of the file.\n * @param handle - File handle\n */\ndeclare function file_text_eof(handle: number): boolean;\n/**\n * Writes a string to a write/append mode file.\n * @param handle - File handle\n * @param str - String to write\n */\ndeclare function file_text_write_string(handle: number, str: string): void;\n/**\n * Writes a newline character to a write/append mode file.\n * @param handle - File handle\n */\ndeclare function file_text_writeln(handle: number): void;\n/**\n * Returns true if a file exists in the virtual file system.\n * @param filename - Filename to check\n */\ndeclare function file_exists(filename: string): Promise<boolean>;\n/**\n * Deletes a file from the virtual file system.\n * @param filename - Filename to delete\n */\ndeclare function file_delete(filename: string): Promise<void>;\n//# sourceMappingURL=file_system.d.ts.map\n/**\n * INI-style storage backed by localStorage.\n *\n * Mirrors GMS's ini_open / ini_close / ini_read_* / ini_write_* API.\n * Data is stored under the localStorage key `silkweaver_ini_<filename>`.\n *\n * Format in localStorage is JSON: { [section]: { [key]: string } }\n *\n * Only one INI file is \"open\" at a time (GMS convention).\n * All reads/writes operate on the currently open file.\n */\n/**\n * Opens (or creates) an INI file for reading and writing.\n * If a file is already open it is saved and closed first.\n * @param filename - Logical file name (used as localStorage key suffix)\n */\ndeclare function ini_open(filename: string): void;\n/**\n * Saves the current INI file to localStorage and closes it.\n * Must be called after all reads/writes to persist changes.\n */\ndeclare function ini_close(): void;\n/**\n * Reads a string value.\n * @param section - INI section name\n * @param key - Key within the section\n * @param default_val - Returned if the key is absent\n */\ndeclare function ini_read_string(section: string, key: string, default_val: string): string;\n/**\n * Reads a numeric value. Non-numeric stored values fall back to the default.\n * @param section - INI section name\n * @param key - Key within the section\n * @param default_val - Returned if the key is absent or not a valid number\n */\ndeclare function ini_read_real(section: string, key: string, default_val: number): number;\n/**\n * Writes a string value.\n * @param section - INI section name\n * @param key - Key within the section\n * @param val - Value to store\n */\ndeclare function ini_write_string(section: string, key: string, val: string): void;\n/**\n * Writes a numeric value (stored as its string representation).\n * @param section - INI section name\n * @param key - Key within the section\n * @param val - Value to store\n */\ndeclare function ini_write_real(section: string, key: string, val: number): void;\n/**\n * Returns true if a section/key pair exists in the open file.\n * @param section - Section name\n * @param key - Key name\n */\ndeclare function ini_key_exists(section: string, key: string): boolean;\n/**\n * Returns true if a section exists in the open file.\n * @param section - Section name\n */\ndeclare function ini_section_exists(section: string): boolean;\n/**\n * Deletes a key from a section.\n * @param section - Section name\n * @param key - Key to delete\n */\ndeclare function ini_key_delete(section: string, key: string): void;\n/**\n * Deletes an entire section and all its keys.\n * @param section - Section to delete\n */\ndeclare function ini_section_delete(section: string): void;\n/**\n * Deletes the INI file from localStorage entirely.\n * @param filename - The file to delete\n */\ndeclare function ini_delete(filename: string): void;\n//# sourceMappingURL=ini.d.ts.map\n/**\n * JSON encoding/decoding utilities.\n *\n * Mirrors GMS's json_encode / json_decode API with additional helpers\n * for deep cloning and safe parsing.\n *\n * Unlike GMS, these functions operate on native JS values (objects, arrays)\n * rather than on ds_map/ds_list IDs.\n */\n/**\n * Encodes a JavaScript value to a JSON string.\n * Equivalent to GMS's json_encode (which accepts a ds_map).\n * @param val - Any JSON-serialisable value\n * @returns JSON string, or an empty string on error\n */\ndeclare function json_encode(val: unknown): string;\n/**\n * Decodes a JSON string into a JavaScript value.\n * Returns undefined if the string is not valid JSON.\n * @param str - JSON string\n * @returns Parsed value, or undefined on parse error\n */\ndeclare function json_decode(str: string): unknown;\n/**\n * Encodes a value to a pretty-printed JSON string (human-readable).\n * @param val - Any JSON-serialisable value\n * @param indent - Number of spaces for indentation (default 2)\n */\ndeclare function json_stringify_pretty(val: unknown, indent?: number): string;\n/**\n * Deep clones a JSON-serialisable value via encode/decode round-trip.\n * Functions and undefined values in the object will be lost.\n * @param val - Value to clone\n * @returns A deep copy of val, or undefined if not serialisable\n */\ndeclare function json_deep_clone<T>(val: T): T | undefined;\n/**\n * Returns true if a string is valid JSON.\n * @param str - String to test\n */\ndeclare function json_is_valid(str: string): boolean;\n/**\n * Saves a serialisable value to localStorage under a given key.\n * @param key - localStorage key\n * @param val - Value to save\n */\ndeclare function json_save(key: string, val: unknown): void;\n/**\n * Loads a value from localStorage and decodes it from JSON.\n * Returns the default value if the key is missing or invalid.\n * @param key - localStorage key\n * @param default_val - Returned if the key is absent or invalid\n */\ndeclare function json_load<T>(key: string, default_val: T): T;\n/**\n * Deletes a JSON entry from localStorage.\n * @param key - localStorage key to delete\n */\ndeclare function json_delete(key: string): void;\n//# sourceMappingURL=json_storage.d.ts.map\n/**\n * Date & time (GMS `date_*` / `current_*`).\n *\n * A datetime is represented as **epoch milliseconds** (a plain number) \u2014 Silkweaver's modernized\n * take on GMS's opaque datetime value. All accessors derive from a JS `Date`, so they're local-time.\n */\n/** The current date and time as a datetime (epoch ms). */\ndeclare function date_current_datetime(): number;\n/** Builds a datetime from components (month is 1\u201312). */\ndeclare function date_create_datetime(year: number, month: number, day: number, hour: number, minute: number, second: number): number;\n/** Builds a date-only datetime (midnight). */\ndeclare function date_create_date(year: number, month: number, day: number): number;\ndeclare function date_get_year(dt: number): number;\ndeclare function date_get_month(dt: number): number;\ndeclare function date_get_day(dt: number): number;\ndeclare function date_get_hour(dt: number): number;\ndeclare function date_get_minute(dt: number): number;\ndeclare function date_get_second(dt: number): number;\n/** Day of week, 0 = Sunday \u2026 6 = Saturday. */\ndeclare function date_get_weekday(dt: number): number;\n/** Day of the year, 1\u2013366. */\ndeclare function date_get_day_of_year(dt: number): number;\ndeclare function current_year(): number;\ndeclare function current_month(): number;\ndeclare function current_day(): number;\ndeclare function current_hour(): number;\ndeclare function current_minute(): number;\ndeclare function current_second(): number;\ndeclare function current_weekday(): number;\ndeclare function date_inc_year(dt: number, amount: number): number;\ndeclare function date_inc_month(dt: number, amount: number): number;\ndeclare function date_inc_week(dt: number, amount: number): number;\ndeclare function date_inc_day(dt: number, amount: number): number;\ndeclare function date_inc_hour(dt: number, amount: number): number;\ndeclare function date_inc_minute(dt: number, amount: number): number;\ndeclare function date_inc_second(dt: number, amount: number): number;\n/** Returns -1, 0, or 1 comparing two datetimes. */\ndeclare function date_compare_datetime(dt1: number, dt2: number): number;\ndeclare function date_second_span(dt1: number, dt2: number): number;\ndeclare function date_minute_span(dt1: number, dt2: number): number;\ndeclare function date_hour_span(dt1: number, dt2: number): number;\ndeclare function date_day_span(dt1: number, dt2: number): number;\ndeclare function date_days_in_month(dt: number): number;\ndeclare function date_leap_year(dt: number): boolean;\ndeclare function date_days_in_year(dt: number): number;\ndeclare function date_datetime_string(dt: number): string;\ndeclare function date_date_string(dt: number): string;\ndeclare function date_time_string(dt: number): string;\n//# sourceMappingURL=datetime.d.ts.map\n/**\n * Encoding & hashing helpers (GMS `base64_*`, `sha1_*`, `md5_*`) and clipboard access.\n *\n * Hashes are pure-JS (synchronous, UTF-8) so they match GMS's blocking API; base64 and clipboard\n * use host facilities where available and degrade gracefully on headless hosts.\n */\n/** Base64-encodes a (UTF-8) string. */\ndeclare function base64_encode(text: string): string;\n/** Decodes a Base64 string back to a (UTF-8) string. */\ndeclare function base64_decode(text: string): string;\n/** Returns the SHA-1 hash of a UTF-8 string as a lowercase hex string. */\ndeclare function sha1_string_utf8(text: string): string;\n/** Returns the MD5 hash of a UTF-8 string as a lowercase hex string. */\ndeclare function md5_string_utf8(text: string): string;\n/** Copies text to the system clipboard (browser host; no-op on headless hosts). */\ndeclare function clipboard_set_text(text: string): void;\n/** Reads text from the system clipboard. Async on the web (returns a Promise). */\ndeclare function clipboard_get_text(): Promise<string>;\n/** True if the clipboard API is available on this host. */\ndeclare function clipboard_has_text(): boolean;\n//# sourceMappingURL=encoding.d.ts.map\n";

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
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare module '@silkweaver/engine';
`,
    "ts:silkweaver/engine-module.d.ts"
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
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [6133, 6192, 6196, 6198, 6199, 6205]
  });
}
var _editor_id_counter = 0;
var ScriptEditor = class {
  constructor(title, key = "", default_x = 240, default_y = 30) {
    this._editor = null;
    this._file_handle = null;
    this._rel_path = null;
    // Electron / fallback path
    this._file_key = "";
    this._save_timer = null;
    this._dirty = false;
    this._event_method = null;
    // when set, the editor can focus only this method's body
    this._title_text = "";
    // display title (kept across saves)
    this._view_mode = "plain";
    // event=one event, full=class minus imports, script=hide imports
    this._base_line = 0;
    // hidden-prefix line count (for local line numbers)
    this._last_hidden = "";
    // last applied hidden-areas (to avoid re-applying every keystroke)
    this._mode_btn = null;
    this._flush_inline = null;
    // inline-mode debounced save flusher
    /** Called when the editor saves the file (with the updated content). */
    this.on_save = () => {
    };
    const id = key ? `script-editor:${key}` : `script-editor-${++_editor_id_counter}`;
    this._title_text = title;
    this._win = new FloatingWindow(id, title, ICON.script, {
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
    this._view_mode = "script";
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
    this._apply_focus();
    bp_register_editor(this._file_key, this._editor);
    this._editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber;
        if (line) bp_toggle(this._file_key, line);
      }
    });
    this._editor.onDidChangeModelContent(() => {
      this._apply_focus();
      this._dirty = true;
      this._win.set_title("\u25CF " + (rel_path.split("/").pop() ?? rel_path));
      if (this._save_timer !== null) clearTimeout(this._save_timer);
      this._save_timer = setTimeout(() => this._do_save(), 500);
    });
  }
  /**
   * Opens a focused, GMS-style editor that shows ONLY one event's body from a class-per-object
   * file. The Monaco model is the whole class file (so imports, `this.<var>` and the engine API
   * all type-check and autocomplete), but everything except the event's body is hidden, so the
   * user sees just the event code. Saving writes the whole file back.
   * @param method - the on_* method to focus (e.g. 'on_step')
   * @param title  - the window title (e.g. 'obj_player · Step')
   */
  async open_event(parent, rel_path, method, title) {
    await this._open_class(parent, rel_path, title, "event", method);
  }
  /** Opens the whole class file with the (huge) import block hidden. */
  async open_full(parent, rel_path, title) {
    await this._open_class(parent, rel_path, title, "full", null);
  }
  /** Shared opener for object class files in 'event' or 'full' view (with a toggle between them). */
  async _open_class(parent, rel_path, title, mode, method) {
    this._rel_path = rel_path;
    this._event_method = method;
    this._title_text = title;
    this._view_mode = mode;
    this._win.mount(parent);
    this._win.set_title(title);
    const monaco = await _load_monaco();
    let content = "";
    try {
      content = await project_read_file(rel_path);
    } catch {
      content = "";
    }
    this._win.body.innerHTML = "";
    const body = this._win.body;
    body.style.cssText = "display:flex; flex-direction:column; overflow:hidden;";
    const toolbar = document.createElement("div");
    toolbar.style.cssText = "display:flex; align-items:center; gap:6px; padding:3px 6px; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2); flex-shrink:0;";
    if (method) {
      this._mode_btn = document.createElement("button");
      this._mode_btn.className = "sw-btn";
      this._mode_btn.style.cssText = "font-size:10px; padding:2px 8px;";
      this._mode_btn.textContent = mode === "event" ? "Full view" : "Event view";
      this._mode_btn.title = "Toggle between this event and the whole class (imports hidden)";
      this._mode_btn.addEventListener("click", () => this._set_view_mode(this._view_mode === "event" ? "full" : "event"));
      toolbar.appendChild(this._mode_btn);
    }
    const hint = document.createElement("span");
    hint.style.cssText = "font-size:11px; color:var(--sw-text-dim);";
    hint.textContent = method ? `${method}` : "class (imports hidden)";
    toolbar.appendChild(hint);
    body.appendChild(toolbar);
    const container = document.createElement("div");
    container.style.cssText = "flex:1; min-height:0;";
    body.appendChild(container);
    this._editor = monaco.editor.create(container, {
      value: content,
      language: "typescript",
      theme: "vs-dark",
      fontSize: 13,
      minimap: { enabled: mode === "full" },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "off",
      tabSize: 4,
      insertSpaces: true,
      glyphMargin: false,
      fixedOverflowWidgets: true,
      // The sticky "scope" header would sit on top of the first body line in the focused view.
      stickyScroll: { enabled: false },
      // Event view shows body-local line numbers (1, 2, 3…); full view keeps real ones.
      lineNumbers: (n) => this._view_mode === "event" ? String(Math.max(1, n - this._base_line)) : String(n)
    });
    const model = this._editor.getModel();
    if (method) {
      const br = _find_method_braces(model.getValue(), method);
      if (br && br.closeLine <= br.openLine + 1) {
        const col = model.getLineMaxColumn(br.openLine);
        this._editor.executeEdits("init-body", [{
          range: { startLineNumber: br.openLine, startColumn: col, endLineNumber: br.openLine, endColumn: col },
          text: "\n        "
        }]);
      }
    }
    this._apply_focus();
    if (method) {
      const br2 = _find_method_braces(this._editor.getValue(), method);
      if (br2) {
        const ln = br2.openLine + 1;
        this._editor.revealLine(ln);
        this._editor.setPosition({ lineNumber: ln, column: model.getLineMaxColumn(ln) });
      }
    }
    this._editor.onDidChangeModelContent(() => {
      this._apply_focus();
      this._dirty = true;
      this._win.set_title("\u25CF " + title);
      if (this._save_timer !== null) clearTimeout(this._save_timer);
      this._save_timer = setTimeout(() => this._do_save(), 500);
    });
    this._editor.onDidChangeCursorPosition((e) => {
      if (this._view_mode !== "event" || !this._event_method) return;
      const m = this._editor.getModel();
      if (!m) return;
      const b = _find_method_braces(m.getValue(), this._event_method);
      if (!b) return;
      const minL = b.openLine + 1, maxL = b.closeLine - 1;
      if (maxL < minL) return;
      if (e.position.lineNumber < minL) this._editor.setPosition({ lineNumber: minL, column: 1 });
      else if (e.position.lineNumber > maxL) this._editor.setPosition({ lineNumber: maxL, column: m.getLineMaxColumn(maxL) });
    });
    this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => this._do_save());
    this._editor.focus();
    this._win.bring_to_front();
  }
  _set_view_mode(mode) {
    this._view_mode = mode;
    if (this._mode_btn) this._mode_btn.textContent = mode === "event" ? "Full view" : "Event view";
    this._last_hidden = "";
    this._apply_focus();
    if (this._editor) {
      this._editor.updateOptions({ lineNumbers: (n) => this._view_mode === "event" ? String(Math.max(1, n - this._base_line)) : String(n) });
      if (mode === "event" && this._event_method) {
        const br = _find_method_braces(this._editor.getModel().getValue(), this._event_method);
        if (br) {
          const ln = br.openLine + 1;
          this._editor.revealLine(ln);
          this._editor.setPosition({ lineNumber: ln, column: 1 });
        }
      }
      this._editor.focus();
    }
  }
  /** Applies hidden areas for the current view mode (guarded so it doesn't reset on every keystroke). */
  _apply_focus() {
    if (!this._editor) return;
    const model = this._editor.getModel();
    if (!model) return;
    const text = model.getValue();
    const last = model.getLineCount();
    const hidden = [];
    let base = 0;
    if (this._view_mode === "event" && this._event_method) {
      const br = _find_method_braces(text, this._event_method);
      if (br) {
        hidden.push({ startLineNumber: 1, startColumn: 1, endLineNumber: br.openLine, endColumn: 1 });
        if (br.closeLine <= last) hidden.push({ startLineNumber: br.closeLine, startColumn: 1, endLineNumber: last, endColumn: 1 });
        base = br.openLine;
      }
    } else if (this._view_mode === "full") {
      const cls = _class_decl_line(text);
      if (cls > 1) hidden.push({ startLineNumber: 1, startColumn: 1, endLineNumber: cls - 1, endColumn: 1 });
    } else if (this._view_mode === "script") {
      const imp = _last_import_line(text);
      if (imp >= 1) hidden.push({ startLineNumber: 1, startColumn: 1, endLineNumber: imp, endColumn: 1 });
    }
    this._base_line = base;
    const key = JSON.stringify(hidden);
    if (key !== this._last_hidden) {
      this._editor.setHiddenAreas(hidden);
      this._last_hidden = key;
    }
  }
  async open_inline(parent, content, lang = "typescript") {
    this._win.mount(parent);
    if (this._title_text) this._win.set_title(this._title_text);
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
      wordWrap: "off",
      tabSize: 4,
      insertSpaces: true,
      fixedOverflowWidgets: true
    });
    const flush = () => {
      if (this._save_timer !== null) {
        clearTimeout(this._save_timer);
        this._save_timer = null;
      }
      if (!this._dirty) return;
      this._dirty = false;
      this._win.set_title(this._title_text || "code");
      this.on_save(this._editor.getValue());
    };
    this._editor.onDidChangeModelContent(() => {
      this._dirty = true;
      this._win.set_title("\u25CF " + (this._title_text || "code"));
      if (this._save_timer !== null) clearTimeout(this._save_timer);
      this._save_timer = setTimeout(flush, 500);
    });
    this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, flush);
    this._flush_inline = flush;
    this._editor.focus();
    this._win.bring_to_front();
  }
  /** Persists any pending inline edits immediately (set by open_inline). */
  flush_inline() {
    this._flush_inline?.();
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
    const title = this._title_text || this._file_handle?.name || this._rel_path?.split("/").pop() || "script";
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
  const ed = new ScriptEditor(file_handle.name, key);
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
  const ed = new ScriptEditor(filename, rel_path);
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
async function script_editor_open_event(parent, rel_path, method, title) {
  const key = `${rel_path}#${method}`;
  const existing = _open_editors.get(key);
  if (existing) {
    existing.focus();
    return existing;
  }
  const ed = new ScriptEditor(title, key);
  ed.set_file_key(key);
  _open_editors.set(key, ed);
  ed.on_close(() => _open_editors.delete(key));
  await ed.open_event(parent, rel_path, method, title);
  return ed;
}
async function script_editor_open_full(parent, rel_path, title) {
  const key = `${rel_path}#__full`;
  const existing = _open_editors.get(key);
  if (existing) {
    existing.focus();
    return existing;
  }
  const ed = new ScriptEditor(title, key);
  ed.set_file_key(key);
  _open_editors.set(key, ed);
  ed.on_close(() => _open_editors.delete(key));
  await ed.open_full(parent, rel_path, title);
  return ed;
}
async function script_editor_open_text(parent, key, title, initial, on_save) {
  const existing = _open_editors.get(key);
  if (existing) {
    existing.focus();
    return existing;
  }
  const ed = new ScriptEditor(title, key);
  ed.set_file_key(key);
  _open_editors.set(key, ed);
  ed.on_save = on_save;
  ed.on_close(() => {
    ed.flush_inline();
    _open_editors.delete(key);
  });
  await ed.open_inline(parent, initial);
  return ed;
}
function _last_import_line(text) {
  const lines = text.split("\n");
  let last = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith("import ")) last = i + 1;
    else if (t !== "" && !t.startsWith("//") && last > 0) break;
  }
  return last;
}
function _class_decl_line(text) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(export\s+)?(default\s+)?(abstract\s+)?class\s/.test(lines[i])) return i + 1;
  }
  return 1;
}
function _find_method_braces(text, method) {
  const esc = method.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\n[ \\t]*(?:public |private |protected |async |override )*${esc}\\s*\\([^)]*\\)\\s*(?::[^{;=]+)?\\{`);
  const m = re.exec(text);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  let depth = 1, i = open + 1;
  while (i < text.length && depth > 0) {
    const c = text[i], n = text[i + 1];
    if (c === "/" && n === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && n === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      i++;
      while (i < text.length && text[i] !== q) {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") depth--;
    i++;
  }
  const close = i - 1;
  const line_of = (idx) => {
    let ln = 1;
    for (let k = 0; k < idx && k < text.length; k++) if (text[k] === "\n") ln++;
    return ln;
  };
  return { openLine: line_of(open), closeLine: line_of(close) };
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
var TOOLS = [
  { tool: "pencil", char: "\u270E", title: "Pencil (P)" },
  { tool: "eraser", char: "\u232B", title: "Eraser (E)" },
  { tool: "fill", char: "\u25A5", title: "Fill (F)" },
  { tool: "eyedropper", char: "\u29BF", title: "Pick colour (I)" },
  { tool: "line", char: "\u2571", title: "Line (L)" },
  { tool: "rect", char: "\u25AD", title: "Rectangle (R)" },
  { tool: "rect_fill", char: "\u25AC", title: "Filled rectangle" },
  { tool: "ellipse", char: "\u25EF", title: "Ellipse (O)" },
  { tool: "ellipse_fill", char: "\u2B24", title: "Filled ellipse" }
];
var PALETTE = [
  "#000000",
  "#ffffff",
  "#7f7f7f",
  "#c3c3c3",
  "#ff0000",
  "#ff7f00",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#7f00ff",
  "#ff00ff",
  "#a0522d",
  "#ffb6c1",
  "#008000",
  "#000080"
];
var MAX_UNDO = 50;
var PixelEditor = class {
  constructor(workspace, width, height, initial, on_save) {
    this._zoom = 16;
    this._tool = "pencil";
    this._primary = "#000000";
    this._secondary = "#ffffff";
    this._brush = 1;
    this._drawing = false;
    this._draw_color = "#000000";
    // colour for the active stroke (primary or secondary)
    this._erasing = false;
    this._start = { x: 0, y: 0 };
    this._last = { x: 0, y: 0 };
    this._preview = null;
    // in-progress shape pixels (display overlay)
    this._undo = [];
    this._redo = [];
    // Grid overlay: a configurable coarse grid (spacing + colour) plus an optional fine pixel grid.
    this._grid_size = 16;
    // overlay grid spacing in pixels (0 = off)
    this._grid_color = "#4da6ff";
    // overlay grid colour (changeable — fixes GMS's invisible grid)
    this._pixel_grid = false;
    // faint per-pixel grid (off by default; it obscures the art)
    this._tool_btns = /* @__PURE__ */ new Map();
    this._on_key = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          this._undo_op();
        } else if (e.key === "y") {
          e.preventDefault();
          this._redo_op();
        }
        return;
      }
      const map = { p: "pencil", e: "eraser", f: "fill", i: "eyedropper", l: "line", r: "rect", o: "ellipse" };
      const t = map[e.key.toLowerCase()];
      if (t) this._set_tool(t);
    };
    this._on_down = (e) => {
      e.preventDefault();
      const { x, y } = this._coords(e);
      const right = e.button === 2;
      this._draw_color = right ? this._secondary : this._primary;
      this._erasing = this._tool === "eraser";
      if (this._tool === "eyedropper") {
        this._pick(x, y, !right);
        return;
      }
      if (this._tool === "fill") {
        this._snapshot();
        this._flood(x, y);
        return;
      }
      this._snapshot();
      this._drawing = true;
      this._start = { x, y };
      this._last = { x, y };
      if (this._tool === "pencil" || this._tool === "eraser") this._stamp_line(x, y, x, y);
      this._redraw();
    };
    this._on_move = (e) => {
      if (!this._drawing) return;
      const { x, y } = this._coords(e);
      if (this._tool === "pencil" || this._tool === "eraser") {
        this._stamp_line(this._last.x, this._last.y, x, y);
        this._last = { x, y };
        this._redraw();
      } else {
        this._preview = this._shape_pixels(this._start.x, this._start.y, x, y);
        this._redraw();
      }
    };
    this._on_up = () => {
      if (!this._drawing) return;
      this._drawing = false;
      if (this._preview) {
        this._commit_pixels(this._preview);
        this._preview = null;
        this._redraw();
      }
    };
    this._w = Math.max(1, width);
    this._h = Math.max(1, height);
    this._on_save = on_save;
    this._zoom = _fit_zoom(this._w, this._h);
    this._canvas = document.createElement("canvas");
    this._canvas.width = this._w;
    this._canvas.height = this._h;
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    this._display = document.createElement("canvas");
    this._dctx = this._display.getContext("2d");
    this._win = new FloatingWindow(
      "pixel-editor",
      "Pixel Editor",
      null,
      { x: 120, y: 80, w: Math.min(900, this._w * this._zoom + 60), h: Math.min(680, this._h * this._zoom + 170) }
    );
    this._build_ui();
    this._init_canvas(initial);
    this._win.mount(workspace);
  }
  // ── UI ───────────────────────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; flex-direction:column; overflow:hidden; background:#1e1e1e;";
    const bar = document.createElement("div");
    bar.style.cssText = "display:flex; gap:4px; padding:6px; flex-wrap:wrap; align-items:center; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2);";
    for (const { tool, char, title } of TOOLS) {
      const btn = _tbtn(char, title, () => this._set_tool(tool));
      this._tool_btns.set(tool, btn);
      bar.appendChild(btn);
    }
    bar.appendChild(_sep2());
    const size_sel = document.createElement("select");
    size_sel.title = "Brush size";
    size_sel.style.cssText = "height:26px; background:var(--sw-chrome2); color:var(--sw-text); border:1px solid var(--sw-border2);";
    for (const s of [1, 2, 3, 4]) {
      const o = document.createElement("option");
      o.value = String(s);
      o.textContent = `${s}px`;
      size_sel.appendChild(o);
    }
    size_sel.addEventListener("change", () => {
      this._brush = parseInt(size_sel.value) || 1;
    });
    bar.appendChild(size_sel);
    bar.appendChild(_sep2());
    bar.append(
      _tbtn("\u2212", "Zoom out", () => this._set_zoom(this._zoom - (this._zoom > 4 ? 2 : 1))),
      _tbtn("+", "Zoom in", () => this._set_zoom(this._zoom + 2)),
      _sep2(),
      _tbtn("\u21B6", "Undo (Ctrl+Z)", () => this._undo_op()),
      _tbtn("\u21B7", "Redo (Ctrl+Y)", () => this._redo_op()),
      _sep2()
    );
    const fx = document.createElement("select");
    fx.title = "Effects";
    fx.style.cssText = "height:26px; background:var(--sw-chrome2); color:var(--sw-text); border:1px solid var(--sw-border2);";
    for (const [val, label] of [["", "Effects\u2026"], ["fliph", "Flip Horizontal"], ["flipv", "Flip Vertical"], ["rotcw", "Rotate 90\xB0 CW"], ["rotccw", "Rotate 90\xB0 CCW"], ["invert", "Invert"], ["gray", "Grayscale"], ["clear", "Clear"]]) {
      const o = document.createElement("option");
      o.value = val;
      o.textContent = label;
      fx.appendChild(o);
    }
    fx.addEventListener("change", () => {
      if (fx.value) {
        this._effect(fx.value);
        fx.value = "";
      }
    });
    bar.appendChild(fx);
    const save = document.createElement("button");
    save.textContent = "Save";
    save.style.cssText = "margin-left:auto; padding:5px 16px; cursor:pointer; background:var(--sw-accent); color:#fff; border:none; font-size:12px; border-radius:3px;";
    save.addEventListener("click", () => this._save());
    bar.appendChild(save);
    body.appendChild(bar);
    const cbar = document.createElement("div");
    cbar.style.cssText = "display:flex; gap:6px; padding:6px; align-items:center; background:var(--sw-chrome); border-bottom:1px solid var(--sw-border2); flex-wrap:wrap;";
    this._sw_primary = _swatch(this._primary, "Primary (left click) \u2014 click to change", () => this._pick_swatch(true));
    this._sw_secondary = _swatch(this._secondary, "Secondary (right click) \u2014 click to change", () => this._pick_swatch(false));
    const swwrap = document.createElement("div");
    swwrap.style.cssText = "position:relative; width:34px; height:30px;";
    this._sw_secondary.style.cssText += "position:absolute; right:0; bottom:0; width:20px; height:20px;";
    this._sw_primary.style.cssText += "position:absolute; left:0; top:0; width:20px; height:20px; z-index:1;";
    swwrap.append(this._sw_secondary, this._sw_primary);
    cbar.appendChild(swwrap);
    cbar.appendChild(_sep2());
    for (const c of PALETTE) {
      const sw = _swatch(c, c, () => {
      });
      sw.style.cssText += "width:18px; height:18px;";
      sw.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (e.button === 2) {
          this._secondary = c;
          this._sw_secondary.style.background = c;
        } else {
          this._primary = c;
          this._sw_primary.style.background = c;
        }
      });
      sw.addEventListener("contextmenu", (e) => e.preventDefault());
      cbar.appendChild(sw);
    }
    cbar.appendChild(_sep2());
    const grid_lbl = document.createElement("span");
    grid_lbl.textContent = "Grid";
    grid_lbl.style.cssText = "font-size:11px; color:var(--sw-text-dim);";
    const grid_size = document.createElement("input");
    grid_size.type = "number";
    grid_size.min = "0";
    grid_size.value = String(this._grid_size);
    grid_size.title = "Grid spacing (px, 0 = off)";
    grid_size.style.cssText = "width:48px; height:24px; background:var(--sw-chrome2); color:var(--sw-text); border:1px solid var(--sw-border2);";
    grid_size.addEventListener("change", () => {
      this._grid_size = Math.max(0, parseInt(grid_size.value) || 0);
      this._redraw();
    });
    const grid_col = document.createElement("input");
    grid_col.type = "color";
    grid_col.value = this._grid_color;
    grid_col.title = "Grid colour";
    grid_col.style.cssText = "width:28px; height:24px; padding:0; background:none; border:1px solid var(--sw-border2); cursor:pointer;";
    grid_col.addEventListener("input", () => {
      this._grid_color = grid_col.value;
      this._redraw();
    });
    const px_lbl = document.createElement("label");
    px_lbl.style.cssText = "display:flex; align-items:center; gap:3px; font-size:11px; color:var(--sw-text-dim); cursor:pointer;";
    const px_chk = document.createElement("input");
    px_chk.type = "checkbox";
    px_chk.checked = this._pixel_grid;
    px_chk.addEventListener("change", () => {
      this._pixel_grid = px_chk.checked;
      this._redraw();
    });
    px_lbl.append(px_chk, document.createTextNode("px-grid"));
    cbar.append(grid_lbl, grid_size, grid_col, px_lbl);
    body.appendChild(cbar);
    const wrap = document.createElement("div");
    wrap.style.cssText = "flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; background:#1a1a1a; padding:10px;";
    this._display.style.cssText = "image-rendering:pixelated; cursor:crosshair; border:1px solid var(--sw-border2);";
    wrap.appendChild(this._display);
    body.appendChild(wrap);
    this._set_tool("pencil");
    window.addEventListener("keydown", this._on_key);
    this._win.on_close(() => window.removeEventListener("keydown", this._on_key));
  }
  _init_canvas(initial) {
    if (initial) {
      const img = new Image();
      img.onload = () => {
        this._ctx.clearRect(0, 0, this._w, this._h);
        this._ctx.drawImage(img, 0, 0, this._w, this._h);
        this._redraw();
      };
      img.src = initial;
    }
    this._display.addEventListener("mousedown", this._on_down);
    this._display.addEventListener("mousemove", this._on_move);
    window.addEventListener("mouseup", this._on_up);
    this._display.addEventListener("contextmenu", (e) => e.preventDefault());
    this._resize_display();
    this._redraw();
  }
  // ── Tool / colour / zoom state ─────────────────────────────────────────────
  _set_tool(tool) {
    this._tool = tool;
    this._tool_btns.forEach((btn, t) => {
      btn.style.background = t === tool ? "var(--sw-select-bg)" : "var(--sw-chrome2)";
      btn.style.borderColor = t === tool ? "var(--sw-accent)" : "var(--sw-border2)";
    });
  }
  _set_zoom(z) {
    this._zoom = Math.max(1, Math.min(40, z));
    this._resize_display();
    this._redraw();
  }
  _resize_display() {
    this._display.width = this._w * this._zoom;
    this._display.height = this._h * this._zoom;
    this._dctx.imageSmoothingEnabled = false;
  }
  _pick_swatch(primary) {
    const inp = document.createElement("input");
    inp.type = "color";
    inp.value = primary ? this._primary : this._secondary;
    inp.addEventListener("input", () => {
      if (primary) {
        this._primary = inp.value;
        this._sw_primary.style.background = inp.value;
      } else {
        this._secondary = inp.value;
        this._sw_secondary.style.background = inp.value;
      }
    });
    inp.click();
  }
  // ── Mouse → drawing ────────────────────────────────────────────────────────
  _coords(e) {
    const r = this._display.getBoundingClientRect();
    return { x: Math.floor((e.clientX - r.left) / this._zoom), y: Math.floor((e.clientY - r.top) / this._zoom) };
  }
  /** Stamps the brush along a Bresenham line (so fast drags have no gaps). */
  _stamp_line(x0, y0, x1, y1) {
    for (const [x, y] of _line(x0, y0, x1, y1)) this._stamp(x, y);
  }
  /** Draws the brush (size × size) centred at (x, y) with the active colour or erases. */
  _stamp(x, y) {
    const o = Math.floor((this._brush - 1) / 2);
    if (this._erasing) this._ctx.clearRect(x - o, y - o, this._brush, this._brush);
    else {
      this._ctx.fillStyle = this._draw_color;
      this._ctx.fillRect(x - o, y - o, this._brush, this._brush);
    }
  }
  /** Writes a shape colour-buffer (from _shape_pixels) into the real canvas. */
  _commit_pixels(buf) {
    for (let i = 0; i < buf.length; i++) {
      const c = buf[i];
      if (!c) continue;
      const x = i % this._w, y = Math.floor(i / this._w);
      if (c[3] === 0) this._ctx.clearRect(x, y, 1, 1);
      else {
        this._ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},1)`;
        this._ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  /** Computes a canvas-sized colour buffer for the current shape tool (null = no pixel). */
  _shape_pixels(x0, y0, x1, y1) {
    const buf = new Array(this._w * this._h).fill(null);
    const put = (x, y) => {
      if (x < 0 || y < 0 || x >= this._w || y >= this._h) return;
      buf[y * this._w + x] = this._erasing ? [0, 0, 0, 0] : _hex(this._draw_color);
    };
    let pts = [];
    if (this._tool === "line") pts = _line(x0, y0, x1, y1);
    else if (this._tool === "rect" || this._tool === "rect_fill") pts = _rect(x0, y0, x1, y1, this._tool === "rect_fill");
    else if (this._tool === "ellipse" || this._tool === "ellipse_fill") pts = _ellipse(x0, y0, x1, y1, this._tool === "ellipse_fill");
    for (const [x, y] of pts) put(x, y);
    return buf;
  }
  _pick(x, y, primary) {
    if (x < 0 || y < 0 || x >= this._w || y >= this._h) return;
    const d = this._ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    if (primary) {
      this._primary = hex;
      this._sw_primary.style.background = hex;
    } else {
      this._secondary = hex;
      this._sw_secondary.style.background = hex;
    }
  }
  _flood(x, y) {
    if (x < 0 || y < 0 || x >= this._w || y >= this._h) return;
    const img = this._ctx.getImageData(0, 0, this._w, this._h);
    const data = img.data;
    const at = (i) => [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const target = at((y * this._w + x) * 4);
    const fill = this._erasing ? [0, 0, 0, 0] : _hex(this._draw_color);
    if (_eq(target, fill)) return;
    const stack = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cy < 0 || cx >= this._w || cy >= this._h) continue;
      const i = (cy * this._w + cx) * 4;
      if (!_eq(at(i), target)) continue;
      data[i] = fill[0];
      data[i + 1] = fill[1];
      data[i + 2] = fill[2];
      data[i + 3] = fill[3];
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    this._ctx.putImageData(img, 0, 0);
    this._redraw();
  }
  // ── Undo / redo ────────────────────────────────────────────────────────────
  _snapshot() {
    this._undo.push(this._ctx.getImageData(0, 0, this._w, this._h));
    if (this._undo.length > MAX_UNDO) this._undo.shift();
    this._redo = [];
  }
  _undo_op() {
    const prev = this._undo.pop();
    if (!prev) return;
    this._redo.push(this._ctx.getImageData(0, 0, this._w, this._h));
    this._ctx.putImageData(prev, 0, 0);
    this._redraw();
  }
  _redo_op() {
    const next = this._redo.pop();
    if (!next) return;
    this._undo.push(this._ctx.getImageData(0, 0, this._w, this._h));
    this._ctx.putImageData(next, 0, 0);
    this._redraw();
  }
  // ── Effects ────────────────────────────────────────────────────────────────
  _effect(kind) {
    this._snapshot();
    const tmp = document.createElement("canvas");
    tmp.width = this._w;
    tmp.height = this._h;
    const tctx = tmp.getContext("2d");
    tctx.imageSmoothingEnabled = false;
    if (kind === "fliph") {
      tctx.translate(this._w, 0);
      tctx.scale(-1, 1);
      tctx.drawImage(this._canvas, 0, 0);
      this._blit(tmp);
    } else if (kind === "flipv") {
      tctx.translate(0, this._h);
      tctx.scale(1, -1);
      tctx.drawImage(this._canvas, 0, 0);
      this._blit(tmp);
    } else if (kind === "rotcw" || kind === "rotccw") {
      tctx.translate(this._w / 2, this._h / 2);
      tctx.rotate((kind === "rotcw" ? 90 : -90) * Math.PI / 180);
      tctx.drawImage(this._canvas, -this._w / 2, -this._h / 2);
      this._blit(tmp);
    } else if (kind === "clear") {
      this._ctx.clearRect(0, 0, this._w, this._h);
    } else if (kind === "invert" || kind === "gray") {
      const img = this._ctx.getImageData(0, 0, this._w, this._h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (kind === "invert") {
          d[i] = 255 - d[i];
          d[i + 1] = 255 - d[i + 1];
          d[i + 2] = 255 - d[i + 2];
        } else {
          const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
          d[i] = d[i + 1] = d[i + 2] = g;
        }
      }
      this._ctx.putImageData(img, 0, 0);
    }
    this._redraw();
  }
  _blit(src) {
    this._ctx.clearRect(0, 0, this._w, this._h);
    this._ctx.drawImage(src, 0, 0);
  }
  // ── Render ─────────────────────────────────────────────────────────────────
  _redraw() {
    const z = this._zoom;
    this._dctx.clearRect(0, 0, this._display.width, this._display.height);
    for (let y = 0; y < this._h; y++) for (let x = 0; x < this._w; x++) {
      this._dctx.fillStyle = (x + y) % 2 === 0 ? "#e8e8e8" : "#bcbcbc";
      this._dctx.fillRect(x * z, y * z, z, z);
    }
    this._dctx.imageSmoothingEnabled = false;
    this._dctx.drawImage(this._canvas, 0, 0, this._w * z, this._h * z);
    if (this._preview) {
      for (let y = 0; y < this._h; y++) for (let x = 0; x < this._w; x++) {
        const c = this._preview[y * this._w + x];
        if (!c) continue;
        if (c[3] === 0) {
          this._dctx.fillStyle = "#e8e8e8";
          this._dctx.globalAlpha = 0.5;
          this._dctx.fillRect(x * z, y * z, z, z);
          this._dctx.globalAlpha = 1;
        } else {
          this._dctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},1)`;
          this._dctx.fillRect(x * z, y * z, z, z);
        }
      }
    }
    if (this._pixel_grid && z >= 4) {
      this._line_grid(1, "rgba(128,128,128,0.25)");
    }
    if (this._grid_size >= 1) {
      this._line_grid(this._grid_size, this._grid_color);
    }
  }
  /** Draws grid lines every `step` pixels in `color` across the display canvas. */
  _line_grid(step, color) {
    const z = this._zoom;
    this._dctx.strokeStyle = color;
    this._dctx.lineWidth = 1;
    for (let x = 0; x <= this._w; x += step) {
      this._dctx.beginPath();
      this._dctx.moveTo(x * z + 0.5, 0);
      this._dctx.lineTo(x * z + 0.5, this._h * z);
      this._dctx.stroke();
    }
    for (let y = 0; y <= this._h; y += step) {
      this._dctx.beginPath();
      this._dctx.moveTo(0, y * z + 0.5);
      this._dctx.lineTo(this._w * z, y * z + 0.5);
      this._dctx.stroke();
    }
  }
  _save() {
    this._on_save(this._canvas.toDataURL("image/png"));
    this._win.close();
  }
};
function _fit_zoom(w, h) {
  return Math.max(2, Math.min(20, Math.floor(Math.min(640 / w, 480 / h)) || 1));
}
function _tbtn(char, title, cb) {
  const b = document.createElement("button");
  b.textContent = char;
  b.title = title;
  b.style.cssText = "width:28px; height:28px; cursor:pointer; border:1px solid var(--sw-border2); background:var(--sw-chrome2); color:var(--sw-text); font-size:14px; padding:0; display:flex; align-items:center; justify-content:center;";
  b.addEventListener("click", cb);
  return b;
}
function _sep2() {
  const s = document.createElement("div");
  s.style.cssText = "width:1px; height:22px; background:var(--sw-border2); margin:0 4px;";
  return s;
}
function _swatch(color, title, cb) {
  const s = document.createElement("div");
  s.title = title;
  s.style.cssText = `width:18px; height:18px; background:${color}; border:1px solid #000; cursor:pointer; box-shadow:0 0 0 1px var(--sw-border2);`;
  s.addEventListener("click", cb);
  return s;
}
function _hex(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
}
function _eq(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
function _line(x0, y0, x1, y1) {
  const pts = [];
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (; ; ) {
    pts.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return pts;
}
function _rect(x0, y0, x1, y1, fill) {
  const l = Math.min(x0, x1), r = Math.max(x0, x1), t = Math.min(y0, y1), b = Math.max(y0, y1);
  const pts = [];
  for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) {
    if (fill || x === l || x === r || y === t || y === b) pts.push([x, y]);
  }
  return pts;
}
function _ellipse(x0, y0, x1, y1, fill) {
  const l = Math.min(x0, x1), r = Math.max(x0, x1), t = Math.min(y0, y1), b = Math.max(y0, y1);
  const cx = (l + r) / 2, cy = (t + b) / 2;
  const rx = Math.max(0.5, (r - l) / 2), ry = Math.max(0.5, (b - t) / 2);
  const pts = [];
  for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) {
    const nx = (x - cx) / rx, ny = (y - cy) / ry;
    if (nx * nx + ny * ny > 1) continue;
    if (fill) {
      pts.push([x, y]);
      continue;
    }
    const edge = ((x - cx + 1) / rx) ** 2 + ny * ny > 1 || ((x - cx - 1) / rx) ** 2 + ny * ny > 1 || nx * nx + ((y - cy + 1) / ry) ** 2 > 1 || nx * nx + ((y - cy - 1) / ry) ** 2 > 1;
    if (edge) pts.push([x, y]);
  }
  return pts;
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
    this._imgs = [];
    this._zoom = 4;
    this._cur = 0;
    // displayed / selected subimage
    this._playing = false;
    this._timer = null;
    this._dragging = null;
    this._drag_off = { x: 0, y: 0 };
    this._on_closed_cb = null;
    this._on_down = (e) => {
      if (this._data.frames.length === 0) return;
      const { x, y } = this._canvas_pixel(e);
      if (Math.abs(x - this._data.origin_x) <= 2 + 2 / this._zoom && Math.abs(y - this._data.origin_y) <= 2 + 2 / this._zoom) {
        this._dragging = "origin";
        this._drag_off = { x: x - this._data.origin_x, y: y - this._data.origin_y };
        return;
      }
      if (x >= this._data.mask_x && x <= this._data.mask_x + this._data.mask_w && y >= this._data.mask_y && y <= this._data.mask_y + this._data.mask_h) {
        this._dragging = "mask";
        this._drag_off = { x: x - this._data.mask_x, y: y - this._data.mask_y };
      }
    };
    this._on_move = (e) => {
      if (!this._dragging) return;
      const { x, y } = this._canvas_pixel(e);
      if (this._dragging === "origin") {
        this._data.origin_x = clamp(x - this._drag_off.x, 0, this._data.width);
        this._data.origin_y = clamp(y - this._drag_off.y, 0, this._data.height);
      } else {
        this._data.mask_x = clamp(x - this._drag_off.x, 0, this._data.width - this._data.mask_w);
        this._data.mask_y = clamp(y - this._drag_off.y, 0, this._data.height - this._data.mask_h);
      }
      this._redraw();
    };
    this._on_up = () => {
      if (!this._dragging) return;
      this._dragging = null;
      this._rebuild_props();
      this._save_meta();
    };
    this._sprite_name = sprite_name;
    this._project = project_name;
    const off = _next_offset++ % 8 * 24;
    this._win = new FloatingWindow(
      `sprite-editor-${sprite_name}`,
      `Sprite: ${sprite_name}`,
      ICON.sprite,
      { x: 220 + off, y: 36 + off, w: 760, h: 560 }
    );
    this._win.on_close(() => {
      this._pause();
      window.removeEventListener("mousemove", this._on_move);
      window.removeEventListener("mouseup", this._on_up);
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
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._on_closed_cb = cb;
  }
  // ── Layout ───────────────────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; flex-direction:column; overflow:hidden;";
    const main = document.createElement("div");
    main.style.cssText = "display:flex; flex:1; overflow:hidden; min-height:0;";
    body.appendChild(main);
    this._props_host = document.createElement("div");
    this._props_host.style.cssText = "width:214px; flex-shrink:0; overflow-y:auto; overflow-x:hidden; padding:8px; background:var(--sw-chrome1); border-right:1px solid var(--sw-border2);";
    this._props_host.appendChild(this._build_props());
    main.appendChild(this._props_host);
    const center = document.createElement("div");
    center.style.cssText = "flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; background:var(--sw-chrome1);";
    center.appendChild(this._build_preview_header());
    this._canvas_wrap = document.createElement("div");
    this._canvas_wrap.style.cssText = "flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; background:#2a2a2a;";
    this._canvas = document.createElement("canvas");
    this._canvas.width = 128;
    this._canvas.height = 128;
    this._canvas.style.cssText = "image-rendering:pixelated; cursor:crosshair; flex-shrink:0;";
    this._ctx = this._canvas.getContext("2d");
    this._canvas.addEventListener("mousedown", this._on_down);
    window.addEventListener("mousemove", this._on_move);
    window.addEventListener("mouseup", this._on_up);
    this._canvas_wrap.appendChild(this._canvas);
    center.appendChild(this._canvas_wrap);
    main.appendChild(center);
    const strip_wrap = document.createElement("div");
    strip_wrap.style.cssText = "flex-shrink:0; border-top:1px solid var(--sw-border2); background:var(--sw-chrome2);";
    const strip_hdr = document.createElement("div");
    strip_hdr.style.cssText = "font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; padding:3px 8px 0;";
    strip_hdr.textContent = "Subimages";
    this._strip = document.createElement("div");
    this._strip.style.cssText = "display:flex; gap:6px; padding:6px 8px 8px; overflow-x:auto; overflow-y:hidden; height:62px; align-items:flex-start;";
    strip_wrap.append(strip_hdr, this._strip);
    body.appendChild(strip_wrap);
    this._status_el = document.createElement("div");
    this._status_el.style.cssText = "flex-shrink:0; padding:3px 8px; font-size:11px; color:var(--sw-text-dim); background:var(--sw-chrome2); border-top:1px solid var(--sw-border2);";
    body.appendChild(this._status_el);
  }
  _build_preview_header() {
    const bar = document.createElement("div");
    bar.style.cssText = "display:flex; align-items:center; gap:6px; padding:4px 8px; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2); flex-wrap:wrap;";
    const zlabel = document.createElement("span");
    zlabel.style.cssText = "font-size:11px; color:var(--sw-text); min-width:34px; text-align:center;";
    const set_zlabel = () => {
      zlabel.textContent = `${this._zoom}\xD7`;
    };
    bar.append(
      _icon_btn("\u2212", "Zoom out", () => {
        this._set_zoom(this._zoom - 1);
        set_zlabel();
      }),
      zlabel,
      _icon_btn("+", "Zoom in", () => {
        this._set_zoom(this._zoom + 1);
        set_zlabel();
      }),
      _icon_btn("Fit", "Fit to view", () => {
        this._fit_zoom();
        set_zlabel();
      }, 30),
      _vsep(),
      _icon_btn("\u23EE", "Previous frame", () => this._goto(this._cur - 1)),
      this._play_btn = _icon_btn("\u25B6", "Play / pause", () => this._toggle_play()),
      _icon_btn("\u23ED", "Next frame", () => this._goto(this._cur + 1))
    );
    this._frame_label = document.createElement("span");
    this._frame_label.style.cssText = "font-size:11px; color:var(--sw-text-dim); margin-left:4px;";
    bar.appendChild(this._frame_label);
    set_zlabel();
    return bar;
  }
  _build_props() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; gap:8px;";
    const actions = document.createElement("div");
    actions.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:4px;";
    actions.append(
      _btn("New", () => this._new_frame()),
      _btn("Import", () => this._import_frames()),
      _btn("Edit", () => this._edit_frame(this._cur)),
      _btn("Clear", () => this._clear_frames())
    );
    el.appendChild(actions);
    const info = document.createElement("div");
    info.style.cssText = "font-size:11px; color:var(--sw-text-dim); line-height:1.6;";
    info.textContent = `Size: ${this._data.width}\xD7${this._data.height}    Subimages: ${this._data.frames.length}`;
    el.appendChild(info);
    const origin = _section("Origin");
    origin.append(
      _prop_row("X:", this._data.origin_x, (v) => {
        this._data.origin_x = clamp(v, 0, this._data.width);
        this._redraw();
        this._save_meta();
      }),
      _prop_row("Y:", this._data.origin_y, (v) => {
        this._data.origin_y = clamp(v, 0, this._data.height);
        this._redraw();
        this._save_meta();
      })
    );
    const presets = document.createElement("div");
    presets.style.cssText = "display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;";
    const ps = [
      ["TL", () => [0, 0]],
      ["TC", () => [hw(this), 0]],
      ["TR", () => [this._data.width, 0]],
      ["ML", () => [0, hh(this)]],
      ["C", () => [hw(this), hh(this)]],
      ["MR", () => [this._data.width, hh(this)]],
      ["BL", () => [0, this._data.height]],
      ["BC", () => [hw(this), this._data.height]],
      ["BR", () => [this._data.width, this._data.height]]
    ];
    for (const [label, get] of ps) {
      const b = _btn(label, () => {
        const [x, y] = get();
        this._data.origin_x = x;
        this._data.origin_y = y;
        this._rebuild_props();
        this._redraw();
        this._save_meta();
      });
      b.style.cssText += "padding:2px 0; font-size:10px;";
      presets.appendChild(b);
    }
    origin.appendChild(presets);
    el.appendChild(origin);
    const mask = _section("Collision Mask");
    const mtype = document.createElement("select");
    mtype.className = "sw-select";
    for (const t of ["rectangle", "ellipse", "diamond", "precise"]) {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t[0].toUpperCase() + t.slice(1);
      if (t === this._data.mask_type) o.selected = true;
      mtype.appendChild(o);
    }
    mtype.addEventListener("change", () => {
      this._data.mask_type = mtype.value;
      this._redraw();
      this._save_meta();
    });
    mask.appendChild(mtype);
    mask.append(
      _prop_row("X:", this._data.mask_x, (v) => {
        this._data.mask_x = v;
        this._redraw();
        this._save_meta();
      }),
      _prop_row("Y:", this._data.mask_y, (v) => {
        this._data.mask_y = v;
        this._redraw();
        this._save_meta();
      }),
      _prop_row("W:", this._data.mask_w, (v) => {
        this._data.mask_w = v;
        this._redraw();
        this._save_meta();
      }),
      _prop_row("H:", this._data.mask_h, (v) => {
        this._data.mask_h = v;
        this._redraw();
        this._save_meta();
      })
    );
    const full = _btn("Set to full image", () => {
      this._data.mask_x = 0;
      this._data.mask_y = 0;
      this._data.mask_w = this._data.width;
      this._data.mask_h = this._data.height;
      this._rebuild_props();
      this._redraw();
      this._save_meta();
    });
    full.style.cssText += "font-size:11px; align-self:flex-start;";
    mask.appendChild(full);
    el.appendChild(mask);
    const anim = _section("Animation");
    anim.appendChild(_prop_row("FPS:", this._data.anim_speed, (v) => {
      this._data.anim_speed = Math.max(1, v);
      this._refresh_anim();
      this._save_meta();
    }));
    el.appendChild(anim);
    return el;
  }
  _rebuild_props() {
    this._props_host.innerHTML = "";
    this._props_host.appendChild(this._build_props());
  }
  // ── Frame image cache ──────────────────────────────────────────────────────
  /** Decodes all frame data URLs into cached images, then refreshes the preview + strip. */
  async _refresh_images() {
    this._imgs = await Promise.all(this._data.frames.map((f) => _decode(f.data_url)));
    if (this._cur >= this._data.frames.length) this._cur = Math.max(0, this._data.frames.length - 1);
    this._rebuild_strip();
    this._refresh_anim();
  }
  // ── Subimage strip ─────────────────────────────────────────────────────────
  _rebuild_strip() {
    this._strip.innerHTML = "";
    if (this._data.frames.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px; padding:8px;";
      empty.textContent = "No subimages \u2014 use New or Import.";
      this._strip.appendChild(empty);
      return;
    }
    this._data.frames.forEach((frame, i) => {
      const cell = document.createElement("div");
      cell.style.cssText = `position:relative; width:44px; height:44px; flex-shrink:0; cursor:pointer; border:2px solid ${i === this._cur ? "var(--sw-accent)" : "var(--sw-border2)"}; background:#333;`;
      cell.title = `Subimage ${i} (double-click to edit)`;
      cell.draggable = true;
      const img = document.createElement("img");
      img.src = frame.data_url;
      img.style.cssText = "width:100%; height:100%; object-fit:contain; image-rendering:pixelated; pointer-events:none;";
      cell.appendChild(img);
      const idx = document.createElement("span");
      idx.textContent = String(i);
      idx.style.cssText = "position:absolute; left:1px; bottom:0; font-size:9px; color:#fff; text-shadow:0 0 2px #000; pointer-events:none;";
      cell.appendChild(idx);
      const del = document.createElement("div");
      del.textContent = "\xD7";
      del.title = "Delete subimage";
      del.style.cssText = "position:absolute; top:0; right:0; width:14px; height:14px; line-height:13px; text-align:center; font-size:11px; color:#fff; background:rgba(180,40,40,0.85); cursor:pointer;";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        this._delete_frame(i);
      });
      cell.appendChild(del);
      cell.addEventListener("click", () => this._goto(i));
      cell.addEventListener("dblclick", () => this._edit_frame(i));
      cell.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", String(i)));
      cell.addEventListener("dragover", (e) => {
        e.preventDefault();
        cell.style.borderColor = "var(--sw-accent)";
      });
      cell.addEventListener("dragleave", () => {
        cell.style.borderColor = i === this._cur ? "var(--sw-accent)" : "var(--sw-border2)";
      });
      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData("text/plain"));
        if (from === i || isNaN(from)) return;
        const [mf] = this._data.frames.splice(from, 1);
        const [mi] = this._imgs.splice(from, 1);
        this._data.frames.splice(i, 0, mf);
        this._imgs.splice(i, 0, mi);
        this._cur = i;
        this._rebuild_strip();
        this._redraw();
        this._update_status();
        this._save_meta();
      });
      this._strip.appendChild(cell);
    });
  }
  // ── Playback ───────────────────────────────────────────────────────────────
  _toggle_play() {
    this._playing ? this._pause() : this._play();
  }
  _play() {
    if (this._data.frames.length <= 1) return;
    this._playing = true;
    this._play_btn.textContent = "\u23F8";
    this._stop_timer();
    const ms = Math.round(1e3 / Math.max(1, this._data.anim_speed));
    this._timer = setInterval(() => {
      this._cur = (this._cur + 1) % this._data.frames.length;
      this._redraw();
      this._update_frame_label();
      this._highlight();
    }, ms);
  }
  _pause() {
    this._playing = false;
    if (this._play_btn) this._play_btn.textContent = "\u25B6";
    this._stop_timer();
  }
  _stop_timer() {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
  _goto(i) {
    const n = this._data.frames.length;
    if (n === 0) return;
    this._pause();
    this._cur = (i % n + n) % n;
    this._redraw();
    this._update_frame_label();
    this._highlight();
  }
  /** Refreshes preview state after a frames/speed change (restarts the timer if playing). */
  _refresh_anim() {
    const n = this._data.frames.length;
    if (this._cur >= n) this._cur = Math.max(0, n - 1);
    if (n === 0) {
      this._pause();
      this._clear_canvas();
    } else if (this._playing) this._play();
    else this._redraw();
    this._update_frame_label();
    this._highlight();
    this._update_status();
  }
  _update_frame_label() {
    const n = this._data.frames.length;
    this._frame_label.textContent = n === 0 ? "no subimages" : `image ${this._cur} / ${n - 1}`;
  }
  _highlight() {
    Array.from(this._strip.children).forEach((c, i) => {
      if (c instanceof HTMLElement && c.style.position === "relative")
        c.style.borderColor = i === this._cur ? "var(--sw-accent)" : "var(--sw-border2)";
    });
  }
  _update_status() {
    const n = this._data.frames.length;
    this._status_el.textContent = `${this._data.width}\xD7${this._data.height} px  \xB7  ${n} subimage${n === 1 ? "" : "s"}  \xB7  ${this._data.anim_speed} fps`;
  }
  // ── Preview rendering (synchronous from cached images) ──────────────────────
  _set_zoom(z) {
    this._zoom = Math.max(1, Math.min(32, z));
    this._redraw();
  }
  _fit_zoom() {
    if (this._data.width === 0 || this._data.height === 0) return;
    const cw = this._canvas_wrap.clientWidth || 420;
    const ch = this._canvas_wrap.clientHeight || 320;
    this._zoom = Math.max(1, Math.min(32, Math.floor(Math.min((cw - 20) / this._data.width, (ch - 20) / this._data.height)) || 1));
    this._redraw();
  }
  _redraw() {
    const w = this._data.width, h = this._data.height;
    if (w === 0 || h === 0) {
      this._clear_canvas();
      return;
    }
    const z = this._zoom;
    const cw = w * z, ch = h * z;
    if (this._canvas.width !== cw || this._canvas.height !== ch) {
      this._canvas.width = cw;
      this._canvas.height = ch;
    }
    const ctx = this._ctx;
    ctx.clearRect(0, 0, cw, ch);
    _draw_checkerboard(ctx, this._canvas.width, this._canvas.height);
    const img = this._imgs[this._cur];
    if (img) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, this._canvas.width, this._canvas.height);
    }
    this._draw_origin(ctx);
    this._draw_mask(ctx);
  }
  _clear_canvas() {
    this._canvas.width = 128;
    this._canvas.height = 128;
    this._ctx.clearRect(0, 0, 128, 128);
    _draw_checkerboard(this._ctx, 128, 128);
  }
  _draw_origin(ctx) {
    const ox = this._data.origin_x * this._zoom, oy = this._data.origin_y * this._zoom, s = 8;
    const cross = () => {
      ctx.beginPath();
      ctx.moveTo(ox - s, oy);
      ctx.lineTo(ox + s, oy);
      ctx.moveTo(ox, oy - s);
      ctx.lineTo(ox, oy + s);
      ctx.stroke();
    };
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    cross();
    ctx.strokeStyle = "#ff3b30";
    ctx.lineWidth = 1.5;
    cross();
    ctx.fillStyle = "#ff3b30";
    ctx.beginPath();
    ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  _draw_mask(ctx) {
    const z = this._zoom;
    const x = this._data.mask_x * z, y = this._data.mask_y * z, w = this._data.mask_w * z, hgt = this._data.mask_h * z;
    ctx.save();
    ctx.strokeStyle = "#00c8ff";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    switch (this._data.mask_type) {
      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + hgt / 2, w / 2, hgt / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "diamond":
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + hgt / 2);
        ctx.lineTo(x + w / 2, y + hgt);
        ctx.lineTo(x, y + hgt / 2);
        ctx.closePath();
        ctx.stroke();
        break;
      case "precise":
        ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height);
        break;
      default:
        ctx.strokeRect(x, y, w, hgt);
    }
    ctx.restore();
  }
  // ── Canvas drag (origin / mask) — saves only on mouse-up ───────────────────
  _canvas_pixel(e) {
    const r = this._canvas.getBoundingClientRect();
    return { x: Math.floor((e.clientX - r.left) / this._zoom), y: Math.floor((e.clientY - r.top) / this._zoom) };
  }
  // ── Frame operations ───────────────────────────────────────────────────────
  _unique_frame_name() {
    const used = new Set(this._data.frames.map((f) => f.name));
    let i = 0;
    while (used.has(`${i}.png`)) i++;
    return `${i}.png`;
  }
  async _new_frame() {
    if (this._data.frames.length === 0) {
      const size = await _prompt_size(32, 32);
      if (!size) return;
      this._data.width = size.w;
      this._data.height = size.h;
      this._data.mask_w = size.w;
      this._data.mask_h = size.h;
    }
    pixel_editor_open(this._win.el.parentElement, this._data.width, this._data.height, null, (url) => this._add_frame(url));
  }
  _edit_frame(i) {
    const frame = this._data.frames[i];
    if (!frame) return;
    pixel_editor_open(this._win.el.parentElement, this._data.width, this._data.height, frame.data_url, async (url) => {
      frame.data_url = url;
      this._imgs[i] = await _decode(url);
      this._rebuild_strip();
      this._redraw();
      this._save_frame_file(frame.name, url);
      this._save_meta();
    });
  }
  async _add_frame(url) {
    const name = this._unique_frame_name();
    this._data.frames.push({ name, data_url: url });
    this._imgs.push(await _decode(url));
    this._cur = this._data.frames.length - 1;
    await this._save_frame_file(name, url);
    this._rebuild_strip();
    this._refresh_anim();
    this._save_meta();
  }
  async _import_frames() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/gif";
    input.multiple = true;
    input.onchange = async () => {
      for (const file of Array.from(input.files ?? [])) {
        const url = await _file_to_data_url(file);
        if (this._data.frames.length === 0) {
          const img = await _decode(url);
          this._data.width = img.naturalWidth;
          this._data.height = img.naturalHeight;
          this._data.mask_w = img.naturalWidth;
          this._data.mask_h = img.naturalHeight;
        }
        const name = this._unique_frame_name();
        this._data.frames.push({ name, data_url: url });
        this._imgs.push(await _decode(url));
        try {
          await project_write_binary(`sprites/${this._sprite_name}/${name}`, file);
        } catch {
        }
      }
      this._cur = this._data.frames.length - 1;
      this._rebuild_props();
      this._rebuild_strip();
      this._refresh_anim();
      this._save_meta();
    };
    input.click();
  }
  _delete_frame(i) {
    this._data.frames.splice(i, 1);
    this._imgs.splice(i, 1);
    if (this._cur >= this._data.frames.length) this._cur = Math.max(0, this._data.frames.length - 1);
    this._rebuild_strip();
    this._refresh_anim();
    this._save_meta();
  }
  _clear_frames() {
    if (this._data.frames.length === 0) return;
    this._confirm(`Clear all subimages from "${this._sprite_name}"?`, () => {
      this._data.frames = [];
      this._imgs = [];
      this._cur = 0;
      this._rebuild_strip();
      this._refresh_anim();
      this._save_meta();
    });
  }
  _confirm(msg, ok) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:280px;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:12px;";
    box.innerHTML = `<p style="margin:0;">${msg}</p>`;
    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";
    const yes = document.createElement("button");
    yes.textContent = "Clear";
    yes.style.cssText = "padding:4px 16px;cursor:pointer;";
    const no = document.createElement("button");
    no.textContent = "Cancel";
    no.style.cssText = "padding:4px 16px;cursor:pointer;";
    btns.append(no, yes);
    box.appendChild(btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    no.addEventListener("click", () => overlay.remove());
    yes.addEventListener("click", () => {
      overlay.remove();
      ok();
    });
  }
  // ── Persistence ────────────────────────────────────────────────────────────
  async _save_frame_file(name, data_url) {
    try {
      const blob = await fetch(data_url).then((r) => r.blob());
      await project_write_binary(`sprites/${this._sprite_name}/${name}`, blob);
    } catch {
    }
  }
  async _load_data() {
    try {
      const meta = JSON.parse(await project_read_file(`sprites/${this._sprite_name}/meta.json`));
      for (const k of ["origin_x", "origin_y", "width", "height", "anim_speed", "mask_type", "mask_x", "mask_y", "mask_w", "mask_h"]) {
        if (meta[k] !== void 0) this._data[k] = meta[k];
      }
      if (meta.frames) {
        for (const f of meta.frames) {
          let url = "";
          try {
            url = await project_read_binary_url(`sprites/${this._sprite_name}/${f.name}`);
          } catch {
          }
          this._data.frames.push({ name: f.name, data_url: url });
        }
      }
    } catch {
    }
    await this._refresh_images();
    this._rebuild_props();
    this._fit_zoom();
    this._refresh_anim();
  }
  async _save_meta() {
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
    try {
      await project_write_file(`sprites/${this._sprite_name}/meta.json`, JSON.stringify(meta, null, 2));
    } catch {
    }
    document.dispatchEvent(new CustomEvent("sw:resource_changed", { detail: { category: "sprites", name: this._sprite_name } }));
  }
};
var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
var hw = (s) => Math.floor(s._data.width / 2);
var hh = (s) => Math.floor(s._data.height / 2);
function _decode(data_url) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(img);
    img.src = data_url || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  });
}
function _btn(label, cb) {
  const b = document.createElement("button");
  b.className = "sw-btn";
  b.textContent = label;
  b.addEventListener("click", cb);
  return b;
}
function _icon_btn(char, title, cb, w = 24) {
  const b = document.createElement("button");
  b.textContent = char;
  b.title = title;
  b.style.cssText = `min-width:${w}px; height:24px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text); font-size:12px; padding:0 4px;`;
  b.addEventListener("click", cb);
  return b;
}
function _vsep() {
  const s = document.createElement("div");
  s.style.cssText = "width:1px; height:18px; background:var(--sw-border2); margin:0 4px;";
  return s;
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
  lbl.style.cssText += "width:24px; text-align:right; margin:0;";
  lbl.textContent = label;
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "sw-input";
  inp.style.cssText = "flex:1; min-width:0;";
  inp.valueAsNumber = initial;
  inp.addEventListener("change", () => on_change(inp.valueAsNumber || 0));
  row.append(lbl, inp);
  return row;
}
function _draw_checkerboard(ctx, w, h) {
  const sz = 8;
  for (let y = 0; y < h; y += sz) for (let x = 0; x < w; x += sz) {
    ctx.fillStyle = (x / sz + y / sz) % 2 === 0 ? "#555" : "#444";
    ctx.fillRect(x, y, sz, sz);
  }
}
function _prompt_size(default_w, default_h) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:240px;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:10px;";
    box.innerHTML = '<p style="margin:0;font-weight:600;">New Sprite Size</p>';
    const mk = (label, val) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:8px;";
      const l = document.createElement("span");
      l.textContent = label;
      l.style.cssText = "min-width:54px;";
      const i = document.createElement("input");
      i.type = "number";
      i.min = "1";
      i.value = String(val);
      i.style.cssText = "flex:1;padding:4px 6px;background:#3c3c3c;border:1px solid #555;color:#ddd;";
      row.append(l, i);
      return { row, input: i };
    };
    const wf = mk("Width", default_w), hf = mk("Height", default_h);
    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";
    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.style.cssText = "padding:4px 18px;cursor:pointer;";
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.style.cssText = "padding:4px 18px;cursor:pointer;";
    btns.append(ok, cancel);
    box.append(wf.row, hf.row, btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const done = (v) => {
      overlay.remove();
      resolve(v);
    };
    ok.addEventListener("click", () => done({ w: Math.max(1, parseInt(wf.input.value) || default_w), h: Math.max(1, parseInt(hf.input.value) || default_h) }));
    cancel.addEventListener("click", () => done(null));
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ok.click();
      if (e.key === "Escape") done(null);
    });
    setTimeout(() => {
      wf.input.focus();
      wf.input.select();
    }, 10);
  });
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
var EMPTY_MODEL = {
  class_name: "",
  sprite: null,
  parent: null,
  solid: false,
  visible: true,
  persistent: false,
  depth: 0,
  variables: [],
  events: []
};
var EVENT_GROUPS = [
  { label: "Core", events: [{ label: "Create", method: "on_create", params: "" }, { label: "Destroy", method: "on_destroy", params: "" }] },
  { label: "Step", events: [{ label: "Step Begin", method: "on_step_begin", params: "" }, { label: "Step", method: "on_step", params: "" }, { label: "Step End", method: "on_step_end", params: "" }] },
  { label: "Draw", events: [{ label: "Draw Begin", method: "on_draw_begin", params: "" }, { label: "Draw", method: "on_draw", params: "" }, { label: "Draw End", method: "on_draw_end", params: "" }, { label: "Draw GUI", method: "on_draw_gui", params: "" }] },
  { label: "Alarm", events: [{ label: "Alarm", method: "on_alarm", params: "index: number" }] },
  { label: "Keyboard", events: [{ label: "Key Press", method: "on_key_press", params: "" }, { label: "Key Release", method: "on_key_release", params: "" }, { label: "Key Held", method: "on_key_held", params: "" }] },
  { label: "Mouse", events: [{ label: "Mouse L Press", method: "on_mouse_left_press", params: "" }, { label: "Mouse L Release", method: "on_mouse_left_release", params: "" }, { label: "Mouse R Press", method: "on_mouse_right_press", params: "" }] },
  { label: "Collision", events: [{ label: "Collision", method: "on_collision", params: "other: any" }] },
  { label: "Room/Game", events: [{ label: "Room Start", method: "on_room_start", params: "" }, { label: "Room End", method: "on_room_end", params: "" }, { label: "Game Start", method: "on_game_start", params: "" }, { label: "Game End", method: "on_game_end", params: "" }] },
  { label: "Other", events: [{ label: "Animation End", method: "on_animation_end", params: "" }, { label: "Path End", method: "on_path_end", params: "" }, { label: "Outside Room", method: "on_outside_room", params: "" }, { label: "Intersect Boundary", method: "on_intersect_boundary", params: "" }, { label: "No More Lives", method: "on_no_more_lives", params: "" }, { label: "No More Health", method: "on_no_more_health", params: "" }, { label: "User", method: "on_user", params: "index: number" }] }
];
var ALL_EVENTS = EVENT_GROUPS.flatMap((g) => g.events);
var _label_for = (method) => ALL_EVENTS.find((e) => e.method === method)?.label ?? method;
function _has_op() {
  return !!window.swfs?.object_op;
}
function _op(action, ...args) {
  return window.swfs.object_op(action, ...args);
}
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
    this._src = "";
    // current class-file source (source of truth for code)
    this._model = { ...EMPTY_MODEL };
    this._props_el = document.createElement("div");
    this._event_list_el = document.createElement("div");
    this._vars_list_el = document.createElement("div");
    this._on_closed_cb = null;
    this._object_name = object_name;
    this._rel = `objects/${object_name}.ts`;
    const off = _next_offset2++ % 8 * 24;
    this._win = new FloatingWindow(
      `object-editor-${object_name}`,
      `Object: ${object_name}`,
      ICON.object,
      { x: 260 + off, y: 50 + off, w: 560, h: 480 }
    );
    this._win.on_close(() => this._on_closed_cb?.());
    this._build_ui();
    this._load();
    this._win.mount(workspace);
  }
  bring_to_front() {
    this._win.bring_to_front();
  }
  on_closed(cb) {
    this._on_closed_cb = cb;
  }
  // ── UI scaffold ────────────────────────────────────────────────────────
  _build_ui() {
    const body = this._win.body;
    body.style.cssText = "display:flex; overflow:hidden;";
    const left = document.createElement("div");
    left.className = "sw-obj-props-panel";
    this._props_el.style.cssText = "display:flex; flex-direction:column; gap:6px; padding:8px; overflow-y:auto; height:100%;";
    left.appendChild(this._props_el);
    body.appendChild(left);
    const right = document.createElement("div");
    right.className = "sw-obj-events-panel";
    right.appendChild(this._build_events_panel());
    body.appendChild(right);
  }
  // ── Load / patch ─────────────────────────────────────────────────────────
  async _load() {
    if (!_has_op()) {
      this._props_el.textContent = 'The object editor form needs the desktop app. Use "Open as Code" or edit objects/' + this._object_name + ".ts directly.";
      return;
    }
    try {
      if (await project_file_exists(this._rel)) {
        this._src = await project_read_file(this._rel);
      } else {
        this._src = await _op("scaffold", this._object_name);
        await project_write_file(this._rel, this._src);
      }
      this._model = await _op("parse_object", this._src);
    } catch (err) {
      console.error("[IDE] object load failed:", err);
    }
    this._refresh();
  }
  /** Applies a surgical patch op to the class source, persists it, and re-parses. */
  async _patch(action, ...args) {
    try {
      try {
        this._src = await project_read_file(this._rel);
      } catch {
      }
      this._src = await _op(action, this._src, ...args);
      await project_write_file(this._rel, this._src);
      this._model = await _op("parse_object", this._src);
    } catch (err) {
      console.error("[IDE] object patch failed:", err);
    }
    this._refresh();
  }
  _refresh() {
    this._props_el.innerHTML = "";
    this._props_el.appendChild(this._build_props());
    this._rebuild_event_list();
  }
  // ── Properties panel ───────────────────────────────────────────────────
  _build_props() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; gap:6px;";
    const m = this._model;
    el.appendChild(_section_header("Sprite"));
    el.appendChild(_asset_row(m.sprite, get_project_resource_names("sprites"), async (name) => {
      await this._patch(name ? "set_static" : "remove_static", ...name ? ["sprite", `'${name}'`] : ["sprite"]);
    }));
    el.appendChild(_section_header("Parent Object"));
    el.appendChild(_asset_row(m.parent, get_project_resource_names("objects").filter((n) => n !== this._object_name), async (name) => {
      await this._patch(name ? "set_static" : "remove_static", ...name ? ["parent", name] : ["parent"]);
    }));
    el.appendChild(_section_header("Properties"));
    el.append(
      _checkbox_row("Visible", m.visible, (v) => this._patch(v ? "remove_static" : "set_static", ...v ? ["visible"] : ["visible", "false"])),
      _checkbox_row("Solid", m.solid, (v) => this._patch(v ? "set_static" : "remove_static", ...v ? ["solid", "true"] : ["solid"])),
      _checkbox_row("Persistent", m.persistent, (v) => this._patch(v ? "set_static" : "remove_static", ...v ? ["persistent", "true"] : ["persistent"])),
      _number_row("Depth:", m.depth, (v) => this._patch(v !== 0 ? "set_static" : "remove_static", ...v !== 0 ? ["depth", String(v)] : ["depth"]))
    );
    el.appendChild(this._build_variables_section());
    const note = document.createElement("div");
    note.style.cssText = "font-size:10px; color:var(--sw-text-dim); margin-top:6px;";
    note.textContent = "Physics: add `static physics = true` in code.";
    el.appendChild(note);
    return el;
  }
  _build_variables_section() {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; gap:4px;";
    wrap.appendChild(_section_header("Variables"));
    this._vars_list_el = document.createElement("div");
    this._vars_list_el.style.cssText = "display:flex; flex-direction:column; gap:4px;";
    wrap.appendChild(this._vars_list_el);
    this._render_variables();
    const add = document.createElement("button");
    add.className = "sw-btn";
    add.textContent = "+ Add Variable";
    add.style.cssText = "font-size:11px; align-self:flex-start; padding:2px 8px;";
    add.addEventListener("click", async () => {
      const name = await _input_overlay("Variable name:", "");
      if (!name) return;
      const clean = name.trim().replace(/[^A-Za-z0-9_]/g, "");
      if (!/^[A-Za-z_]/.test(clean)) return;
      await this._patch("set_field", clean, "0");
    });
    wrap.appendChild(add);
    return wrap;
  }
  _render_variables() {
    this._vars_list_el.innerHTML = "";
    if (this._model.variables.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px;";
      empty.textContent = "No variables.";
      this._vars_list_el.appendChild(empty);
      return;
    }
    for (const v of this._model.variables) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; gap:4px;";
      const name = document.createElement("span");
      name.textContent = v.name;
      name.style.cssText = "width:90px; font-size:11px; font-family:monospace;";
      const eq = document.createElement("span");
      eq.textContent = "=";
      eq.style.cssText = "color:var(--sw-text-dim);";
      const val = document.createElement("input");
      val.className = "sw-input";
      val.value = v.value;
      val.style.cssText = "flex:1; font-size:11px; font-family:monospace;";
      val.addEventListener("change", () => this._patch("set_field", v.name, val.value || "0"));
      const del = document.createElement("button");
      del.className = "sw-x-btn";
      del.textContent = "\u2715";
      del.title = "Delete variable";
      del.addEventListener("click", () => this._patch("remove_field", v.name));
      row.append(name, eq, val, del);
      this._vars_list_el.appendChild(row);
    }
  }
  // ── Events panel ───────────────────────────────────────────────────────
  _build_events_panel() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; height:100%;";
    const hdr = document.createElement("div");
    hdr.className = "sw-editor-toolbar";
    const hdr_lbl = document.createElement("span");
    hdr_lbl.style.cssText = "font-size:11px; font-weight:600; flex:1;";
    hdr_lbl.textContent = "Events";
    const code_btn = document.createElement("button");
    code_btn.className = "sw-btn";
    code_btn.style.cssText = "font-size:10px; padding:2px 6px;";
    code_btn.textContent = "Open as Code";
    code_btn.addEventListener("click", () => this._open_code());
    const add_btn = document.createElement("button");
    add_btn.className = "sw-btn";
    add_btn.style.cssText = "font-size:10px; padding:2px 6px;";
    add_btn.textContent = "+ Add Event";
    add_btn.addEventListener("click", () => this._show_add_event_dialog());
    hdr.append(hdr_lbl, code_btn, add_btn);
    el.appendChild(hdr);
    this._event_list_el.style.cssText = "flex:1; overflow-y:auto;";
    el.appendChild(this._event_list_el);
    return el;
  }
  _rebuild_event_list() {
    this._event_list_el.innerHTML = "";
    if (this._model.events.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;";
      empty.textContent = 'No events.\nClick "+ Add Event".';
      this._event_list_el.appendChild(empty);
      return;
    }
    for (const method of this._model.events) {
      const row = document.createElement("div");
      row.className = "sw-obj-event-row";
      const lbl = document.createElement("span");
      lbl.textContent = _label_for(method);
      lbl.style.cssText = "flex:1; font-size:11px;";
      const edit_btn = document.createElement("button");
      edit_btn.className = "sw-btn";
      edit_btn.style.cssText = "font-size:10px; padding:2px 6px;";
      edit_btn.textContent = "Edit";
      edit_btn.addEventListener("click", () => this._open_event(method));
      const del_btn = document.createElement("button");
      del_btn.className = "sw-x-btn";
      del_btn.title = "Delete event";
      del_btn.textContent = "\u2715";
      del_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._patch("remove_method", method);
      });
      row.append(lbl, edit_btn, del_btn);
      row.addEventListener("dblclick", () => this._open_event(method));
      this._event_list_el.appendChild(row);
    }
  }
  _show_add_event_dialog() {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:99999;";
    const dlg = document.createElement("div");
    dlg.style.cssText = "background:var(--sw-chrome); border:1px solid var(--sw-border); padding:12px; min-width:240px; max-height:80vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;";
    const title = document.createElement("div");
    title.style.cssText = "font-weight:600; font-size:12px;";
    title.textContent = "Add Event";
    dlg.appendChild(title);
    for (const group of EVENT_GROUPS) {
      const avail = group.events.filter((e) => !this._model.events.includes(e.method));
      if (avail.length === 0) continue;
      const grp_lbl = document.createElement("div");
      grp_lbl.style.cssText = "font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; margin-top:4px;";
      grp_lbl.textContent = group.label;
      dlg.appendChild(grp_lbl);
      const grp_row = document.createElement("div");
      grp_row.style.cssText = "display:flex; flex-wrap:wrap; gap:3px;";
      for (const ev of avail) {
        const btn = document.createElement("button");
        btn.className = "sw-btn";
        btn.style.cssText = "font-size:10px; padding:2px 6px;";
        btn.textContent = ev.label;
        btn.addEventListener("click", async () => {
          overlay.remove();
          await this._patch("add_method", ev.method, ev.params, "");
          this._open_event(ev.method);
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
  /** Opens a single event's body in the focused (GMS-style) code editor. */
  async _open_event(method) {
    const workspace = this._win.el.parentElement;
    try {
      await script_editor_open_event(workspace, this._rel, method, `${this._object_name} \xB7 ${_label_for(method)}`);
    } catch (err) {
      console.error("[IDE] Failed to open event code:", err);
    }
  }
  /** Opens the full class file (imports hidden) in the Monaco code editor. */
  async _open_code() {
    const workspace = this._win.el.parentElement;
    try {
      await script_editor_open_full(workspace, this._rel, `${this._object_name} \xB7 class`);
    } catch (err) {
      console.error("[IDE] Failed to open object code:", err);
    }
  }
};
function _asset_row(value, options, on_set) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; gap:4px; align-items:center;";
  const sel = document.createElement("select");
  sel.className = "sw-select";
  sel.style.cssText = "flex:1; min-width:0;";
  const cur = value ?? "";
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "(none)";
  if (!cur) none.selected = true;
  sel.appendChild(none);
  const all = [...options];
  if (cur && !all.includes(cur)) all.unshift(cur);
  for (const name of all) {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    if (name === cur) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener("change", () => on_set(sel.value));
  row.appendChild(sel);
  return row;
}
function _input_overlay(msg, def) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;";
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
  inp.step = "1";
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
    // Placement
    this._place_object = "";
    // object to add with left mouse
    this._selected_inst = null;
    this._delete_underlying = true;
    // replace an instance already in the cell
    // Drag-move state
    this._drag_inst = null;
    this._drag_ox = 0;
    this._drag_oy = 0;
    this._drag_moved = false;
    // Add-paint / delete-paint state (left/right drag across the room)
    this._adding = false;
    this._deleting = false;
    this._last_cell = { x: NaN, y: NaN };
    // Pan state
    this._panning = false;
    this._pan_start = { mx: 0, my: 0, px: 0, py: 0 };
    this._snap_x = GRID;
    this._snap_y = GRID;
    this._show_grid = true;
    this._panel_tab = "objects";
    this._panel_el = document.createElement("div");
    // Object-sprite resolution caches (shared across all instances)
    this._obj_sprite = /* @__PURE__ */ new Map();
    // object name → sprite name (null = none)
    this._obj_resolving = /* @__PURE__ */ new Set();
    this._sprite_cache = /* @__PURE__ */ new Map();
    // sprite name → decoded render data
    this._sprite_loading = /* @__PURE__ */ new Set();
    // Tile painting state (active while the Tiles tab is selected)
    this._tile_bg = "";
    // current tileset (background resource name)
    this._tile_w = GRID;
    // tile cell width
    this._tile_h = GRID;
    // tile cell height
    this._tile_sel_l = 0;
    // selected cell left in the tileset (px)
    this._tile_sel_t = 0;
    // selected cell top in the tileset (px)
    this._tile_depth = 1e6;
    // current tile layer depth (drawn behind instances)
    this._tile_paint = false;
    // left-drag painting
    this._tile_erase = false;
    // right-drag erasing
    this._tileset_imgs = /* @__PURE__ */ new Map();
    // loaded tileset images by bg_name
    this._tileset_loading = /* @__PURE__ */ new Set();
    // tilesets currently being loaded (dedupe)
    this._next_tile_id = 1;
    // next unique tile id within this room
    this._on_closed_cb = null;
    this._picker_popup = null;
    this._room_name = room_name;
    this._workspace = workspace;
    const off = _next_offset3++ % 6 * 24;
    this._win = new FloatingWindow(
      `room-editor-${room_name}`,
      `Room: ${room_name}`,
      ICON.room,
      { x: 280 + off, y: 44 + off, w: 940, h: 600 }
    );
    this._win.on_close(() => {
      this._close_picker();
      this._on_closed_cb?.();
    });
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
    const grid_toggle = document.createElement("button");
    grid_toggle.className = "sw-btn";
    grid_toggle.textContent = "Grid";
    grid_toggle.title = "Toggle the snap grid overlay";
    grid_toggle.style.cssText = this._show_grid ? "background:var(--sw-accent);" : "";
    grid_toggle.addEventListener("click", () => {
      this._show_grid = !this._show_grid;
      grid_toggle.style.background = this._show_grid ? "var(--sw-accent)" : "";
      this._redraw();
    });
    toolbar.appendChild(grid_toggle);
    toolbar.append(_inline_label("Snap"));
    const snap_x = _small_num(this._snap_x, (v) => {
      this._snap_x = Math.max(1, v);
      this._redraw();
    });
    const snap_y = _small_num(this._snap_y, (v) => {
      this._snap_y = Math.max(1, v);
      this._redraw();
    });
    snap_x.title = "Horizontal snap (px)";
    snap_y.title = "Vertical snap (px)";
    toolbar.append(snap_x, _inline_label("\xD7"), snap_y);
    toolbar.appendChild(_toolbar_sep());
    const zoom_out = _icon_tool_btn("\u2212", () => this._adjust_zoom(-0.25));
    const zoom_lbl = document.createElement("span");
    zoom_lbl.style.cssText = "font-size:11px; min-width:38px; text-align:center;";
    zoom_lbl.textContent = "100%";
    const zoom_in = _icon_tool_btn("+", () => this._adjust_zoom(0.25));
    const zoom_reset = _icon_tool_btn("\u27F2", () => this._reset_view());
    zoom_reset.title = "Reset zoom & recenter";
    toolbar.append(zoom_out, zoom_lbl, zoom_in, zoom_reset);
    this._zoom_lbl = zoom_lbl;
    body.appendChild(toolbar);
    const main = document.createElement("div");
    main.style.cssText = "display:flex; flex:1; overflow:hidden;";
    body.appendChild(main);
    const left = document.createElement("div");
    left.className = "sw-room-panel";
    left.appendChild(this._build_left_panel());
    main.appendChild(left);
    const canvas_wrap = document.createElement("div");
    canvas_wrap.style.cssText = "flex:1; overflow:hidden; position:relative; background:#1a1a1a;";
    this._canvas = document.createElement("canvas");
    this._canvas.tabIndex = 0;
    this._canvas.style.cssText = "display:block; outline:none;";
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
    this._canvas.addEventListener("mouseleave", (e) => this._on_mouse_up(e));
    this._canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    this._canvas.addEventListener("keydown", (e) => this._on_key_down(e));
  }
  _build_left_panel() {
    const el = document.createElement("div");
    el.style.cssText = "display:flex; flex-direction:column; height:100%;";
    const tabs_el = document.createElement("div");
    tabs_el.className = "sw-room-tabs";
    const tabs = ["objects", "settings", "tiles", "views", "backgrounds", "physics"];
    for (const tab of tabs) {
      const btn = document.createElement("button");
      btn.className = `sw-room-tab${tab === this._panel_tab ? " active" : ""}`;
      btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
      btn.addEventListener("click", () => {
        this._close_picker();
        this._panel_tab = tab;
        tabs_el.querySelectorAll(".sw-room-tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this._rebuild_panel();
        this._redraw();
      });
      tabs_el.appendChild(btn);
    }
    el.appendChild(tabs_el);
    this._panel_el.style.cssText = "flex:1; overflow-y:auto; overflow-x:hidden;";
    this._panel_el.appendChild(this._build_panel_content());
    el.appendChild(this._panel_el);
    return el;
  }
  _rebuild_panel() {
    this._panel_el.innerHTML = "";
    this._panel_el.appendChild(this._build_panel_content());
  }
  _build_panel_content() {
    switch (this._panel_tab) {
      case "objects":
        return this._panel_objects();
      case "settings":
        return this._panel_settings();
      case "tiles":
        return this._panel_tiles();
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
  // ── Objects panel ────────────────────────────────────────────────────────
  _panel_objects() {
    const el = _form_container();
    el.appendChild(_section_hdr("Object to add"));
    const picker_btn = document.createElement("button");
    picker_btn.className = "sw-btn";
    picker_btn.style.cssText = "display:flex; align-items:center; gap:8px; width:100%; justify-content:flex-start; padding:4px 6px; height:32px;";
    picker_btn.addEventListener("click", () => this._toggle_object_picker(picker_btn));
    this._picker_btn = picker_btn;
    this._update_picker_button();
    el.appendChild(picker_btn);
    el.appendChild(_check_field("Delete underlying", this._delete_underlying, (v) => {
      this._delete_underlying = v;
    }));
    const help = document.createElement("div");
    help.style.cssText = "font-size:10.5px; color:var(--sw-text-dim); margin:6px 0; line-height:1.5; border:1px solid var(--sw-border2); padding:6px; border-radius:3px;";
    help.innerHTML = "<b>Left</b> click = add object<br><b>Left</b> drag = paint a row<br>drag an instance = move it<br><b>Right</b> click = delete<br>hold <b>Alt</b> = no snapping<br><b>Middle</b> drag = pan \xB7 wheel = zoom";
    el.appendChild(help);
    const sel = this._selected_inst;
    if (sel) {
      el.appendChild(_section_hdr(`Selected: ${sel.object_name}`));
      el.append(
        _num_field("X:", sel.x, (v) => {
          sel.x = v;
          this._redraw();
          this._rebuild_panel();
          this._save();
        }),
        _num_field("Y:", sel.y, (v) => {
          sel.y = v;
          this._redraw();
          this._rebuild_panel();
          this._save();
        }),
        _num_field("Scale X:", sel.scale_x, (v) => {
          sel.scale_x = v;
          this._redraw();
          this._save();
        }),
        _num_field("Scale Y:", sel.scale_y, (v) => {
          sel.scale_y = v;
          this._redraw();
          this._save();
        }),
        _num_field("Rotation:", sel.rotation, (v) => {
          sel.rotation = v;
          this._redraw();
          this._save();
        })
      );
      el.appendChild(this._creation_code_button(
        "Creation Code (this = instance)",
        sel.creation_code,
        `room-inst-cc:${this._room_name}#${sel.id}`,
        `${sel.object_name} \xB7 Creation Code`,
        (code) => {
          sel.creation_code = code;
          this._save();
        }
      ));
    }
    const hdr = document.createElement("div");
    hdr.style.cssText = "display:flex; align-items:center; justify-content:space-between; margin-top:6px;";
    hdr.appendChild(_section_hdr(`Instances (${this._data.instances.length})`));
    if (this._data.instances.length > 0) {
      const clear = document.createElement("button");
      clear.className = "sw-btn";
      clear.style.cssText = "font-size:10px;";
      clear.textContent = "Clear all";
      clear.addEventListener("click", () => {
        if (this._data.instances.length === 0) return;
        this._data.instances = [];
        this._selected_inst = null;
        this._redraw();
        this._save();
        this._rebuild_panel();
      });
      hdr.appendChild(clear);
    }
    el.appendChild(hdr);
    if (this._data.instances.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;";
      empty.textContent = "No instances yet.";
      el.appendChild(empty);
      return el;
    }
    for (const inst of this._data.instances) {
      const row = document.createElement("div");
      row.className = `sw-room-inst-row${inst === this._selected_inst ? " selected" : ""}`;
      const lbl = document.createElement("span");
      lbl.style.cssText = "flex:1; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;";
      lbl.textContent = `${inst.object_name} (${inst.x}, ${inst.y})`;
      const del_btn = document.createElement("button");
      del_btn.className = "sw-x-btn";
      del_btn.title = "Delete instance";
      del_btn.textContent = "\u2715";
      del_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._delete_instance(inst);
      });
      row.append(lbl, del_btn);
      row.addEventListener("click", () => {
        this._selected_inst = inst;
        this._rebuild_panel();
        this._redraw();
      });
      el.appendChild(row);
    }
    return el;
  }
  _update_picker_button() {
    const btn = this._picker_btn;
    btn.innerHTML = "";
    const thumb = document.createElement("canvas");
    thumb.width = 22;
    thumb.height = 22;
    thumb.style.cssText = "width:22px; height:22px; flex-shrink:0; image-rendering:pixelated; background:#0003; border:1px solid var(--sw-border2);";
    const name = document.createElement("span");
    name.style.cssText = "flex:1; font-size:12px; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;";
    name.textContent = this._place_object || "(pick an object)";
    if (!this._place_object) name.style.color = "var(--sw-text-dim)";
    const caret = document.createElement("span");
    caret.style.cssText = "font-size:9px; color:var(--sw-text-dim);";
    caret.textContent = "\u25BC";
    btn.append(thumb, name, caret);
    if (this._place_object) this._draw_object_thumb(thumb, this._place_object);
  }
  _toggle_object_picker(anchor) {
    if (this._picker_popup) {
      this._close_picker();
      return;
    }
    const names = get_project_object_names().sort((a, b) => a.localeCompare(b));
    const pop = document.createElement("div");
    pop.style.cssText = "position:fixed; z-index:100000; background:var(--sw-chrome2); border:1px solid var(--sw-border); box-shadow:0 4px 16px #0008; border-radius:4px; display:flex; flex-direction:column; width:200px; max-height:320px;";
    const r = anchor.getBoundingClientRect();
    pop.style.left = `${Math.round(r.left)}px`;
    pop.style.top = `${Math.round(r.bottom + 2)}px`;
    const filter = document.createElement("input");
    filter.className = "sw-input";
    filter.placeholder = "Filter\u2026";
    filter.style.cssText = "margin:6px; width:calc(100% - 12px);";
    pop.appendChild(filter);
    const list = document.createElement("div");
    list.style.cssText = "flex:1; overflow-y:auto;";
    pop.appendChild(list);
    const render_list = (q) => {
      list.innerHTML = "";
      const matches = names.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
      if (matches.length === 0) {
        const none = document.createElement("div");
        none.style.cssText = "padding:8px; font-size:11px; color:var(--sw-text-dim); text-align:center;";
        none.textContent = names.length === 0 ? "No objects in project." : "No matches.";
        list.appendChild(none);
        return;
      }
      for (const n of matches) {
        const row = document.createElement("div");
        row.className = "sw-room-inst-row";
        row.style.cssText = "display:flex; align-items:center; gap:8px; padding:4px 8px; cursor:pointer;";
        const thumb = document.createElement("canvas");
        thumb.width = 20;
        thumb.height = 20;
        thumb.style.cssText = "width:20px; height:20px; flex-shrink:0; image-rendering:pixelated; background:#0003;";
        const lbl = document.createElement("span");
        lbl.style.cssText = "font-size:12px;";
        lbl.textContent = n;
        row.append(thumb, lbl);
        row.addEventListener("click", () => {
          this._place_object = n;
          this._update_picker_button();
          this._close_picker();
        });
        list.appendChild(row);
        this._draw_object_thumb(thumb, n);
      }
    };
    render_list("");
    filter.addEventListener("input", () => render_list(filter.value));
    const outside = (ev) => {
      if (!pop.contains(ev.target) && ev.target !== anchor && !anchor.contains(ev.target)) this._close_picker();
    };
    setTimeout(() => document.addEventListener("mousedown", outside), 0);
    pop._outside = outside;
    document.body.appendChild(pop);
    this._picker_popup = pop;
    filter.focus();
  }
  _close_picker() {
    if (!this._picker_popup) return;
    const outside = this._picker_popup._outside;
    if (outside) document.removeEventListener("mousedown", outside);
    this._picker_popup.remove();
    this._picker_popup = null;
  }
  // ── Settings panel ───────────────────────────────────────────────────────
  _panel_settings() {
    const el = _form_container();
    const name_row = _text_field("Name:", this._room_name, () => {
    });
    name_row.querySelector("input").disabled = true;
    el.append(
      name_row,
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
    el.appendChild(this._creation_code_button(
      "Creation Code",
      this._data.creation_code,
      `room-cc:${this._room_name}`,
      `${this._room_name} \xB7 Creation Code`,
      (code) => {
        this._data.creation_code = code;
        this._save();
      }
    ));
    return el;
  }
  /**
   * Builds a labelled "Edit Creation Code" button that opens the code in a Monaco window
   * (like every other code surface in the IDE), with a preview of the current first line.
   * @param current - The code at build time (refreshed each panel rebuild)
   * @param key     - Dedup key for the editor window
   * @param title   - Editor window title
   * @param on_save - Persists the edited code back into the room data
   */
  _creation_code_button(label, current, key, title, on_save) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; gap:3px;";
    wrap.appendChild(_section_hdr(label));
    const btn = document.createElement("button");
    btn.className = "sw-btn";
    btn.style.cssText = "display:flex; align-items:center; gap:6px; width:100%; justify-content:flex-start; padding:4px 6px;";
    const icon = document.createElement("span");
    icon.textContent = "{ }";
    icon.style.cssText = "font-family:monospace; color:var(--sw-accent);";
    const txt = document.createElement("span");
    txt.style.cssText = "flex:1; text-align:left; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;";
    const has_code = current.trim().length > 0;
    txt.textContent = has_code ? current.trim().split("\n")[0] || "Edit code\u2026" : "Edit code\u2026";
    if (!has_code) txt.style.color = "var(--sw-text-dim)";
    btn.append(icon, txt);
    btn.addEventListener("click", () => {
      script_editor_open_text(this._workspace, key, title, current, (code) => {
        on_save(code);
        txt.textContent = code.trim() ? code.trim().split("\n")[0] || "Edit code\u2026" : "Edit code\u2026";
        txt.style.color = code.trim() ? "var(--sw-text)" : "var(--sw-text-dim)";
      });
    });
    wrap.appendChild(btn);
    return wrap;
  }
  // ── Views panel ──────────────────────────────────────────────────────────
  _panel_views() {
    const el = _form_container();
    el.appendChild(_section_hdr(`Views (${this._data.views.length})`));
    const add_btn = document.createElement("button");
    add_btn.className = "sw-btn";
    add_btn.style.cssText = "font-size:10px; margin-bottom:4px;";
    add_btn.textContent = "+ Add View";
    add_btn.addEventListener("click", () => {
      this._data.views.push(_default_view());
      this._rebuild_panel();
      this._redraw();
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
          this._redraw();
          this._save();
        }),
        _num_field("View X:", view.view_x, (v) => {
          view.view_x = v;
          this._redraw();
          this._save();
        }),
        _num_field("View Y:", view.view_y, (v) => {
          view.view_y = v;
          this._redraw();
          this._save();
        }),
        _num_field("View W:", view.view_w, (v) => {
          view.view_w = v;
          this._redraw();
          this._save();
        }),
        _num_field("View H:", view.view_h, (v) => {
          view.view_h = v;
          this._redraw();
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
      const follow_row = _select_field("Follow:", view.follow, get_project_object_names(), (v) => {
        view.follow = v;
        this._save();
      }, { empty: true, empty_label: "(no object)" });
      vw.appendChild(follow_row);
      const del_btn = document.createElement("button");
      del_btn.className = "sw-btn";
      del_btn.style.cssText = "font-size:10px; margin-top:4px;";
      del_btn.textContent = "Remove View";
      del_btn.addEventListener("click", () => {
        this._data.views.splice(i, 1);
        this._rebuild_panel();
        this._redraw();
        this._save();
      });
      vw.appendChild(del_btn);
      el.appendChild(vw);
    });
    return el;
  }
  // ── Backgrounds panel ──────────────────────────────────────────────────────
  _panel_backgrounds() {
    const el = _form_container();
    el.appendChild(_section_hdr("Background Colour"));
    el.append(
      _check_field("Draw background colour", this._data.bg_show_color, (v) => {
        this._data.bg_show_color = v;
        this._redraw();
        this._save();
      }),
      _color_field("Colour:", this._data.bg_color, (v) => {
        this._data.bg_color = v;
        this._redraw();
        this._save();
      })
    );
    el.appendChild(_section_hdr(`Background Layers (${this._data.backgrounds.length})`));
    const add_btn = document.createElement("button");
    add_btn.className = "sw-btn";
    add_btn.style.cssText = "font-size:10px; margin-bottom:4px;";
    add_btn.textContent = "+ Add Layer";
    add_btn.addEventListener("click", () => {
      this._data.backgrounds.push(_default_bg_layer());
      this._rebuild_panel();
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
          this._redraw();
          this._save();
        }),
        _select_field("Resource:", layer.bg_name, get_project_resource_names("backgrounds"), (v) => {
          layer.bg_name = v;
          summary.textContent = `BG ${i}: ${v || "(none)"}`;
          this._save();
          if (v) this._ensure_tileset_loaded(v).then(() => this._redraw());
          else this._redraw();
        }, { empty: true }),
        _check_field("Tile X", layer.tile_x, (v) => {
          layer.tile_x = v;
          this._redraw();
          this._save();
        }),
        _check_field("Tile Y", layer.tile_y, (v) => {
          layer.tile_y = v;
          this._redraw();
          this._save();
        }),
        _check_field("Stretch", layer.stretch, (v) => {
          layer.stretch = v;
          this._redraw();
          this._save();
        })
      );
      const del_btn = document.createElement("button");
      del_btn.className = "sw-btn";
      del_btn.style.cssText = "font-size:10px; margin-top:4px;";
      del_btn.textContent = "Remove Layer";
      del_btn.addEventListener("click", () => {
        this._data.backgrounds.splice(i, 1);
        this._rebuild_panel();
        this._save();
      });
      bg.appendChild(del_btn);
      el.appendChild(bg);
    });
    return el;
  }
  // ── Physics panel ──────────────────────────────────────────────────────────
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
  // ── Tiles panel ────────────────────────────────────────────────────────
  _panel_tiles() {
    const el = _form_container();
    el.appendChild(_section_hdr("Tileset"));
    el.append(
      _select_field("Background:", this._tile_bg, get_project_resource_names("backgrounds"), (v) => {
        this._tile_bg = v.trim();
        this._ensure_tileset_loaded(this._tile_bg).then(() => this._rebuild_tiles_panel());
      }, { empty: true }),
      _num_field("Tile W:", this._tile_w, (v) => {
        this._tile_w = Math.max(1, v);
        this._rebuild_tiles_panel();
      }),
      _num_field("Tile H:", this._tile_h, (v) => {
        this._tile_h = Math.max(1, v);
        this._rebuild_tiles_panel();
      }),
      _num_field("Depth:", this._tile_depth, (v) => {
        this._tile_depth = v;
      })
    );
    const hint = document.createElement("div");
    hint.style.cssText = "font-size:11px; color:var(--sw-text-dim); margin:4px 0; line-height:1.4;";
    hint.textContent = "Left-drag on the room to paint, right-drag to erase. Pick a tile below.";
    el.appendChild(hint);
    el.appendChild(_section_hdr("Tile"));
    el.appendChild(this._build_tile_picker());
    el.appendChild(_section_hdr(`Tiles in room (${this._data.tiles.length})`));
    const clear = document.createElement("button");
    clear.className = "sw-btn";
    clear.textContent = "Clear all tiles";
    clear.addEventListener("click", () => {
      if (this._data.tiles.length === 0) return;
      this._data.tiles = [];
      this._redraw();
      this._save();
      this._rebuild_tiles_panel();
    });
    el.appendChild(clear);
    return el;
  }
  /** Re-renders the Tiles panel in place (used after async tileset load / field edits). */
  _rebuild_tiles_panel() {
    if (this._panel_tab !== "tiles") return;
    this._rebuild_panel();
  }
  /** Builds the clickable tileset cell-picker canvas. */
  _build_tile_picker() {
    const wrap = document.createElement("div");
    wrap.style.cssText = "max-height:260px; overflow:auto; border:1px solid var(--sw-border); background:#111;";
    const img = this._tileset_imgs.get(this._tile_bg);
    if (!this._tile_bg) {
      wrap.textContent = " Type a background resource name above.";
      return wrap;
    }
    if (!img) {
      wrap.textContent = ' Loading / no image for "' + this._tile_bg + '".';
      return wrap;
    }
    const pick = document.createElement("canvas");
    pick.width = img.naturalWidth;
    pick.height = img.naturalHeight;
    pick.style.cssText = "display:block; image-rendering:pixelated; cursor:crosshair;";
    const ctx = pick.getContext("2d");
    const paint_picker = () => {
      ctx.clearRect(0, 0, pick.width, pick.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= pick.width; x += this._tile_w) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, pick.height);
        ctx.stroke();
      }
      for (let y = 0; y <= pick.height; y += this._tile_h) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(pick.width, y + 0.5);
        ctx.stroke();
      }
      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 2;
      ctx.strokeRect(this._tile_sel_l + 1, this._tile_sel_t + 1, this._tile_w - 2, this._tile_h - 2);
    };
    paint_picker();
    pick.addEventListener("mousedown", (e) => {
      const r = pick.getBoundingClientRect();
      const px = (e.clientX - r.left) * (pick.width / r.width);
      const py = (e.clientY - r.top) * (pick.height / r.height);
      this._tile_sel_l = Math.floor(px / this._tile_w) * this._tile_w;
      this._tile_sel_t = Math.floor(py / this._tile_h) * this._tile_h;
      paint_picker();
    });
    wrap.appendChild(pick);
    return wrap;
  }
  /** Loads a background image (the tileset) and caches it by name. */
  async _ensure_tileset_loaded(bg_name) {
    if (!bg_name || this._tileset_imgs.has(bg_name) || this._tileset_loading.has(bg_name)) return;
    this._tileset_loading.add(bg_name);
    try {
      const meta_path = `backgrounds/${bg_name}/meta.json`;
      if (!await project_file_exists(meta_path)) return;
      const meta = JSON.parse(await project_read_file(meta_path));
      if (!meta.file_name) return;
      const url = await project_read_binary_url(`backgrounds/${bg_name}/${meta.file_name}`);
      const img = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = url;
      });
      this._tileset_imgs.set(bg_name, img);
      this._redraw();
    } catch {
    } finally {
      this._tileset_loading.delete(bg_name);
    }
  }
  // ── Object → sprite resolution ───────────────────────────────────────────
  /**
   * Resolves an object's sprite name from its class file (`static sprite = '…'`) and
   * loads that sprite's first frame. Cached; triggers a redraw when an image arrives.
   * @param obj_name - The object resource name.
   */
  async _ensure_object_sprite(obj_name) {
    if (!obj_name) return;
    if (!this._obj_sprite.has(obj_name)) {
      if (this._obj_resolving.has(obj_name)) return;
      this._obj_resolving.add(obj_name);
      let sprite2 = null;
      try {
        const src = await project_read_file(`objects/${obj_name}.ts`);
        const m = src.match(/static\s+sprite\s*(?::[^=]+)?=\s*['"]([^'"]+)['"]/);
        sprite2 = m ? m[1] : null;
      } catch {
        sprite2 = null;
      }
      this._obj_sprite.set(obj_name, sprite2);
      this._obj_resolving.delete(obj_name);
    }
    const sprite = this._obj_sprite.get(obj_name);
    if (sprite) await this._ensure_sprite_loaded(sprite);
  }
  /** Loads a sprite's first frame + origin/size, caches it, and redraws on arrival. */
  async _ensure_sprite_loaded(sprite_name) {
    if (!sprite_name || this._sprite_cache.has(sprite_name) || this._sprite_loading.has(sprite_name)) return;
    this._sprite_loading.add(sprite_name);
    try {
      const meta_path = `sprites/${sprite_name}/meta.json`;
      if (!await project_file_exists(meta_path)) return;
      const meta = JSON.parse(await project_read_file(meta_path));
      const first = meta.frames?.[0];
      if (!first) return;
      const url = await project_read_binary_url(`sprites/${sprite_name}/${first.name}`);
      const img = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = url;
      });
      this._sprite_cache.set(sprite_name, {
        img,
        ox: meta.origin_x ?? 0,
        oy: meta.origin_y ?? 0,
        w: meta.width ?? img.naturalWidth,
        h: meta.height ?? img.naturalHeight
      });
      this._redraw();
    } catch {
    } finally {
      this._sprite_loading.delete(sprite_name);
    }
  }
  /** Returns the cached sprite render for an object, kicking off a load if needed. */
  _sprite_for(obj_name) {
    const sprite = this._obj_sprite.get(obj_name);
    if (sprite === void 0) {
      this._ensure_object_sprite(obj_name);
      return null;
    }
    if (sprite === null) return null;
    const render = this._sprite_cache.get(sprite);
    if (!render) {
      this._ensure_sprite_loaded(sprite);
      return null;
    }
    return render;
  }
  /** Draws an object's sprite thumbnail (or a placeholder) into a small canvas. */
  async _draw_object_thumb(canvas, obj_name) {
    await this._ensure_object_sprite(obj_name);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const render = this._sprite_for(obj_name);
    if (render) {
      const s = Math.min(canvas.width / render.w, canvas.height / render.h);
      const w = render.w * s, h = render.h * s;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(render.img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    } else {
      ctx.fillStyle = "rgba(120,120,200,0.5)";
      ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.floor(canvas.height * 0.5)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", canvas.width / 2, canvas.height / 2 + 1);
    }
  }
  // ── View / zoom ──────────────────────────────────────────────────────────
  _adjust_zoom(delta) {
    this._zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this._zoom + delta));
    if (this._zoom_lbl) this._zoom_lbl.textContent = Math.round(this._zoom * 100) + "%";
    this._redraw();
  }
  _reset_view() {
    this._zoom = 1;
    this._pan_x = 0;
    this._pan_y = 0;
    if (this._zoom_lbl) this._zoom_lbl.textContent = "100%";
    this._redraw();
  }
  // ── Canvas events ──────────────────────────────────────────────────────
  _on_wheel(e) {
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    this._adjust_zoom(delta);
  }
  _on_mouse_down(e) {
    this._canvas.focus();
    const { rx, ry } = this._to_room_coords(e.clientX, e.clientY);
    if (e.button === 1) {
      this._panning = true;
      this._pan_start = { mx: e.clientX, my: e.clientY, px: this._pan_x, py: this._pan_y };
      return;
    }
    if (this._panel_tab === "tiles") {
      if (e.button === 0) {
        this._tile_paint = true;
        this._paint_tile(rx, ry);
      } else if (e.button === 2) {
        this._tile_erase = true;
        this._erase_tile(rx, ry);
      }
      return;
    }
    if (this._panel_tab !== "objects") {
      if (e.button === 0) {
        this._selected_inst = this._hit_test(rx, ry);
        this._redraw();
      }
      return;
    }
    if (e.button === 0) {
      const hit = this._hit_test(rx, ry);
      if (hit && !e.shiftKey) {
        this._selected_inst = hit;
        this._drag_inst = hit;
        this._drag_ox = rx - hit.x;
        this._drag_oy = ry - hit.y;
        this._drag_moved = false;
        this._rebuild_panel();
        this._redraw();
      } else {
        if (!this._place_object) {
          this._selected_inst = null;
          this._rebuild_panel();
          this._redraw();
          return;
        }
        this._adding = true;
        this._last_cell = { x: NaN, y: NaN };
        this._add_at(rx, ry, e.altKey);
      }
    } else if (e.button === 2) {
      this._deleting = true;
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
    const { rx, ry } = this._to_room_coords(e.clientX, e.clientY);
    if (this._tile_paint || this._tile_erase) {
      if (this._tile_paint) this._paint_tile(rx, ry);
      else this._erase_tile(rx, ry);
      return;
    }
    if (this._adding) {
      this._add_at(rx, ry, e.altKey);
      return;
    }
    if (this._deleting) {
      const hit = this._hit_test(rx, ry);
      if (hit) this._delete_instance(hit);
      return;
    }
    if (this._drag_inst) {
      this._drag_inst.x = this._snap(rx - this._drag_ox, this._snap_x, e.altKey);
      this._drag_inst.y = this._snap(ry - this._drag_oy, this._snap_y, e.altKey);
      this._drag_moved = true;
      this._rebuild_panel();
      this._redraw();
    }
  }
  _on_mouse_up(_e) {
    if (this._panning) {
      this._panning = false;
      return;
    }
    if (this._tile_paint || this._tile_erase) {
      this._tile_paint = false;
      this._tile_erase = false;
      this._save();
      this._rebuild_tiles_panel();
      return;
    }
    if (this._adding) {
      this._adding = false;
      this._save();
      this._rebuild_panel();
      return;
    }
    if (this._deleting) {
      this._deleting = false;
      this._save();
      return;
    }
    if (this._drag_inst) {
      this._drag_inst = null;
      if (this._drag_moved) {
        this._save();
        this._rebuild_panel();
      }
      return;
    }
  }
  _on_key_down(e) {
    if ((e.key === "Delete" || e.key === "Backspace") && this._selected_inst) {
      e.preventDefault();
      this._delete_instance(this._selected_inst);
    }
  }
  // ── Instance helpers ───────────────────────────────────────────────────
  /** Adds an instance at the snapped cell under (rx,ry), unless one is already there. */
  _add_at(rx, ry, no_snap) {
    const x = this._snap(rx, this._snap_x, no_snap);
    const y = this._snap(ry, this._snap_y, no_snap);
    if (x === this._last_cell.x && y === this._last_cell.y) return;
    this._last_cell = { x, y };
    if (this._delete_underlying) {
      for (let i = this._data.instances.length - 1; i >= 0; i--) {
        const o = this._data.instances[i];
        if (this._snap(o.x, this._snap_x, no_snap) === x && this._snap(o.y, this._snap_y, no_snap) === y) {
          if (this._selected_inst === o) this._selected_inst = null;
          this._data.instances.splice(i, 1);
        }
      }
    }
    this._place_instance(x, y);
  }
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
    this._ensure_object_sprite(this._place_object);
    this._rebuild_panel();
    this._redraw();
  }
  _delete_instance(inst) {
    const idx = this._data.instances.indexOf(inst);
    if (idx !== -1) this._data.instances.splice(idx, 1);
    if (this._selected_inst === inst) this._selected_inst = null;
    this._rebuild_panel();
    this._redraw();
    this._save();
  }
  _hit_test(rx, ry) {
    for (let i = this._data.instances.length - 1; i >= 0; i--) {
      const inst = this._data.instances[i];
      const b = this._inst_bounds(inst);
      if (rx >= b.l && rx <= b.r && ry >= b.t && ry <= b.b) return inst;
    }
    return null;
  }
  /** The instance's drawn AABB in room space (sprite-aware; rotation ignored for hit-testing). */
  _inst_bounds(inst) {
    const render = this._sprite_for(inst.object_name);
    if (render) {
      const sx = Number.isFinite(inst.scale_x) ? inst.scale_x : 1;
      const sy = Number.isFinite(inst.scale_y) ? inst.scale_y : 1;
      const w = render.w * sx;
      const h = render.h * sy;
      const l = inst.x - render.ox * sx;
      const t = inst.y - render.oy * sy;
      const b = { l: Math.min(l, l + w), t: Math.min(t, t + h), r: Math.max(l, l + w), b: Math.max(t, t + h) };
      if (b.r - b.l < 6) {
        b.l = inst.x - 3;
        b.r = inst.x + 3;
      }
      if (b.b - b.t < 6) {
        b.t = inst.y - 3;
        b.b = inst.y + 3;
      }
      return b;
    }
    return { l: inst.x, t: inst.y, r: inst.x + 32, b: inst.y + 32 };
  }
  _snap(v, step, no_snap) {
    if (no_snap || step <= 0) return Math.round(v);
    return Math.round(v / step) * step;
  }
  // ── Tile helpers ───────────────────────────────────────────────────────
  /** Paints (or replaces) a tile at the cell under (rx, ry) on the current depth. */
  _paint_tile(rx, ry) {
    if (!this._tile_bg) return;
    const tx = Math.floor(rx / this._tile_w) * this._tile_w;
    const ty = Math.floor(ry / this._tile_h) * this._tile_h;
    if (tx < 0 || ty < 0 || tx >= this._data.width || ty >= this._data.height) return;
    const existing = this._data.tiles.find((t) => t.x === tx && t.y === ty && t.depth === this._tile_depth);
    if (existing) {
      if (existing.bg_name === this._tile_bg && existing.left === this._tile_sel_l && existing.top === this._tile_sel_t && existing.width === this._tile_w && existing.height === this._tile_h) return;
      existing.bg_name = this._tile_bg;
      existing.left = this._tile_sel_l;
      existing.top = this._tile_sel_t;
      existing.width = this._tile_w;
      existing.height = this._tile_h;
    } else {
      this._data.tiles.push({
        id: this._next_tile_id++,
        bg_name: this._tile_bg,
        left: this._tile_sel_l,
        top: this._tile_sel_t,
        width: this._tile_w,
        height: this._tile_h,
        x: tx,
        y: ty,
        depth: this._tile_depth
      });
    }
    this._ensure_tileset_loaded(this._tile_bg);
    this._redraw();
  }
  /** Erases the topmost tile under (rx, ry). */
  _erase_tile(rx, ry) {
    for (let i = this._data.tiles.length - 1; i >= 0; i--) {
      const t = this._data.tiles[i];
      if (rx >= t.x && rx < t.x + t.width && ry >= t.y && ry < t.y + t.height) {
        this._data.tiles.splice(i, 1);
        this._redraw();
        return;
      }
    }
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
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(this._pan_x, this._pan_y);
    ctx.scale(this._zoom, this._zoom);
    ctx.fillStyle = this._data.bg_show_color ? this._data.bg_color || "#000000" : "#1e1e1e";
    ctx.fillRect(0, 0, this._data.width, this._data.height);
    for (const layer of this._data.backgrounds) this._draw_bg_layer(ctx, layer);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1 / this._zoom;
    ctx.strokeRect(0, 0, this._data.width, this._data.height);
    const tiles_sorted = [...this._data.tiles].sort((a, b) => b.depth - a.depth);
    for (const t of tiles_sorted) this._draw_tile(ctx, t);
    if (this._show_grid) this._draw_grid(ctx);
    for (const inst of this._data.instances) this._draw_instance(ctx, inst);
    for (const view of this._data.views) {
      if (!view.enabled) continue;
      ctx.save();
      ctx.strokeStyle = "rgba(0,200,255,0.5)";
      ctx.lineWidth = 1 / this._zoom;
      ctx.setLineDash([4 / this._zoom, 2 / this._zoom]);
      ctx.strokeRect(view.view_x, view.view_y, view.view_w, view.view_h);
      ctx.restore();
    }
    ctx.restore();
  }
  /**
   * Draws one background layer into the room. The background images share the tileset
   * image cache (both live under backgrounds/<name>/). Honours stretch and per-axis tiling;
   * clipped to the room so tiled/stretched layers never spill past the room bounds.
   */
  _draw_bg_layer(ctx, layer) {
    if (!layer.bg_name || layer.visible_in_editor === false) return;
    const img = this._tileset_imgs.get(layer.bg_name);
    if (!img) {
      this._ensure_tileset_loaded(layer.bg_name);
      return;
    }
    const rw = this._data.width, rh = this._data.height;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, rw, rh);
    ctx.clip();
    if (layer.stretch) {
      ctx.drawImage(img, 0, 0, rw, rh);
    } else {
      const iw = img.naturalWidth || img.width || 1;
      const ih = img.naturalHeight || img.height || 1;
      const cols = layer.tile_x ? Math.ceil(rw / iw) : 1;
      const rows = layer.tile_y ? Math.ceil(rh / ih) : 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          ctx.drawImage(img, c * iw, r * ih);
    }
    ctx.restore();
  }
  _draw_tile(ctx, t) {
    const img = this._tileset_imgs.get(t.bg_name);
    if (img) {
      ctx.drawImage(img, t.left, t.top, t.width, t.height, t.x, t.y, t.width, t.height);
    } else {
      ctx.save();
      ctx.fillStyle = "rgba(120,180,120,0.25)";
      ctx.fillRect(t.x, t.y, t.width, t.height);
      ctx.strokeStyle = "rgba(120,180,120,0.6)";
      ctx.lineWidth = 1 / this._zoom;
      ctx.strokeRect(t.x, t.y, t.width, t.height);
      ctx.restore();
      this._ensure_tileset_loaded(t.bg_name);
    }
  }
  _draw_grid(ctx) {
    const gx = this._snap_x, gy = this._snap_y;
    const rw = this._data.width;
    const rh = this._data.height;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1 / this._zoom;
    if (gx > 0) for (let x = 0; x <= rw; x += gx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rh);
      ctx.stroke();
    }
    if (gy > 0) for (let y = 0; y <= rh; y += gy) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rw, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  _draw_instance(ctx, inst) {
    const is_sel = inst === this._selected_inst;
    const render = this._sprite_for(inst.object_name);
    if (render) {
      ctx.save();
      ctx.translate(inst.x, inst.y);
      if (inst.rotation) ctx.rotate(-inst.rotation * Math.PI / 180);
      ctx.scale(inst.scale_x, inst.scale_y);
      ctx.drawImage(render.img, -render.ox, -render.oy, render.w, render.h);
      if (is_sel) {
        ctx.strokeStyle = "#0078d4";
        ctx.lineWidth = 2 / this._zoom / Math.max(1e-3, Math.abs(inst.scale_x));
        ctx.strokeRect(-render.ox, -render.oy, render.w, render.h);
      }
      ctx.restore();
      ctx.save();
      ctx.fillStyle = is_sel ? "#0078d4" : "rgba(255,80,80,0.9)";
      ctx.beginPath();
      ctx.arc(inst.x, inst.y, 2.5 / this._zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    const b = this._inst_bounds(inst);
    ctx.save();
    ctx.fillStyle = is_sel ? "rgba(0,120,212,0.55)" : "rgba(80,80,200,0.4)";
    ctx.strokeStyle = is_sel ? "#0078d4" : "#6666cc";
    ctx.lineWidth = (is_sel ? 2 : 1) / this._zoom;
    ctx.fillRect(b.l, b.t, b.r - b.l, b.b - b.t);
    ctx.strokeRect(b.l, b.t, b.r - b.l, b.b - b.t);
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.max(7, 9 / this._zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const short = inst.object_name.length > 8 ? inst.object_name.slice(0, 7) + "\u2026" : inst.object_name;
    ctx.fillText(short, (b.l + b.r) / 2, (b.t + b.b) / 2);
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
      if (!Array.isArray(this._data.tiles)) this._data.tiles = [];
      for (const inst of this._data.instances) {
        if (typeof inst.scale_x !== "number") inst.scale_x = 1;
        if (typeof inst.scale_y !== "number") inst.scale_y = 1;
        if (typeof inst.rotation !== "number") inst.rotation = 0;
        if (typeof inst.creation_code !== "string") inst.creation_code = "";
      }
      const max_id = this._data.instances.reduce((m, i) => Math.max(m, i.id), 0);
      if (max_id >= _next_inst_id) _next_inst_id = max_id + 1;
      this._next_tile_id = this._data.tiles.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      for (const b of new Set(this._data.tiles.map((t) => t.bg_name).filter(Boolean))) this._ensure_tileset_loaded(b);
      for (const b of new Set(this._data.backgrounds.map((l) => l.bg_name).filter(Boolean))) this._ensure_tileset_loaded(b);
      for (const o of new Set(this._data.instances.map((i) => i.object_name).filter(Boolean))) this._ensure_object_sprite(o);
    } catch {
    }
    this._redraw();
    this._rebuild_panel();
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
    tiles: [],
    bg_color: "#000000",
    bg_show_color: true,
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
function _toolbar_sep() {
  const sep = document.createElement("div");
  sep.style.cssText = "width:1px; align-self:stretch; background:var(--sw-border); margin:0 4px;";
  return sep;
}
function _inline_label(text) {
  const s = document.createElement("span");
  s.style.cssText = "font-size:11px; color:var(--sw-text-dim);";
  s.textContent = text;
  return s;
}
function _small_num(initial, on_change) {
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "sw-input";
  inp.style.cssText = "width:42px;";
  inp.min = "1";
  inp.valueAsNumber = initial;
  inp.addEventListener("change", () => on_change(inp.valueAsNumber || 1));
  return inp;
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
  inp.style.cssText = "flex:1; min-width:0;";
  inp.value = initial;
  inp.addEventListener("change", () => on_change(inp.value));
  row.append(lbl, inp);
  return row;
}
function _select_field(label, value, options, on_change, opts = {}) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:6px;";
  const lbl = document.createElement("span");
  lbl.className = "sw-label";
  lbl.style.cssText += "min-width:60px; margin:0;";
  lbl.textContent = label;
  const sel = document.createElement("select");
  sel.className = "sw-select";
  sel.style.cssText = "flex:1; min-width:0;";
  if (opts.empty) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = opts.empty_label ?? "(none)";
    if (!value) o.selected = true;
    sel.appendChild(o);
  }
  const all = [...options];
  if (value && !all.includes(value)) all.unshift(value);
  for (const name of all) {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    if (name === value) o.selected = true;
    sel.appendChild(o);
  }
  if (all.length === 0 && !opts.empty) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = "(none defined)";
    sel.appendChild(o);
  }
  sel.addEventListener("change", () => on_change(sel.value));
  row.append(lbl, sel);
  return row;
}
function _color_field(label, initial, on_change) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex; align-items:center; gap:6px;";
  const lbl = document.createElement("span");
  lbl.className = "sw-label";
  lbl.style.cssText += "min-width:60px; margin:0;";
  lbl.textContent = label;
  const inp = document.createElement("input");
  inp.type = "color";
  inp.value = /^#[0-9a-fA-F]{6}$/.test(initial) ? initial : "#000000";
  inp.style.cssText = "width:42px; height:24px; padding:0; border:1px solid var(--sw-border); background:none; cursor:pointer;";
  inp.addEventListener("input", () => on_change(inp.value));
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
      ICON.sound,
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
      ICON.background,
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
      ICON.font,
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
      del_btn.className = "sw-x-btn";
      del_btn.title = "Remove range";
      del_btn.style.cssText = "margin-left:auto;";
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
    // center origin on first layout
    // Reference-room backdrop
    this._ref_room_data = null;
    this._name = name;
    this._data = { kind: "linear", closed: false, points: [] };
    this._win = new FloatingWindow(
      `path-${name}`,
      `Path: ${name}`,
      ICON.path,
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
    this._room_sel = document.createElement("select");
    this._room_sel.className = "sw-select";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    this._room_sel.appendChild(none);
    this._room_sel.addEventListener("change", () => this._select_ref_room(this._room_sel.value));
    toolbar.appendChild(this._make_label_wrap("Room:", this._room_sel));
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
    this._draw_ref_room(ctx);
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
      const sp = pts.map(to_screen);
      const n = sp.length;
      const mid = (a, b) => ({ x: (a.sx + b.sx) / 2, y: (a.sy + b.sy) / 2 });
      if (this._data.closed) {
        const start = mid(sp[n - 1], sp[0]);
        ctx.moveTo(start.x, start.y);
        for (let i = 0; i < n; i++) {
          const cur = sp[i], next = sp[(i + 1) % n];
          const m = mid(cur, next);
          ctx.quadraticCurveTo(cur.sx, cur.sy, m.x, m.y);
        }
      } else {
        ctx.moveTo(sp[0].sx, sp[0].sy);
        for (let i = 1; i < n - 1; i++) {
          const cur = sp[i], next = sp[i + 1];
          const m = mid(cur, next);
          ctx.quadraticCurveTo(cur.sx, cur.sy, m.x, m.y);
        }
        ctx.quadraticCurveTo(sp[n - 1].sx, sp[n - 1].sy, sp[n - 1].sx, sp[n - 1].sy);
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
  // Reference-room backdrop
  // -----------------------------------------------------------------------
  /** Fills the Room dropdown from the project's rooms and restores the current selection. */
  async _populate_room_options() {
    while (this._room_sel.options.length > 1) this._room_sel.remove(1);
    try {
      const proj = JSON.parse(await project_read_file("project.json"));
      for (const r of Object.keys(proj.resources?.rooms ?? {}).sort()) {
        const o = document.createElement("option");
        o.value = r;
        o.textContent = r;
        this._room_sel.appendChild(o);
      }
    } catch {
    }
    this._room_sel.value = this._data.ref_room ?? "";
  }
  async _select_ref_room(name) {
    if (name) this._data.ref_room = name;
    else delete this._data.ref_room;
    if (name) await this._load_ref_room_data(name);
    else this._ref_room_data = null;
    this._draw();
    this._save();
  }
  /** Loads a room's geometry (size, bg colour, instance positions) for the backdrop. */
  async _load_ref_room_data(name) {
    try {
      const rm = JSON.parse(await project_read_file(`rooms/${name}/room.json`));
      this._ref_room_data = {
        width: rm.width ?? 640,
        height: rm.height ?? 480,
        bg_color: rm.bg_color ?? "#000000",
        bg_show_color: rm.bg_show_color ?? true,
        instances: Array.isArray(rm.instances) ? rm.instances.map((i) => ({ x: i.x ?? 0, y: i.y ?? 0, object_name: i.object_name ?? "" })) : []
      };
    } catch {
      this._ref_room_data = null;
    }
  }
  /** Renders the reference room (dimmed) behind the path: bounds, bg colour, instances. */
  _draw_ref_room(ctx) {
    const r = this._ref_room_data;
    if (!r) return;
    const z = this._zoom;
    const sx = (x) => this._pan_x + x * z;
    const sy = (y) => this._pan_y + y * z;
    ctx.save();
    if (r.bg_show_color) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = r.bg_color || "#000000";
      ctx.fillRect(sx(0), sy(0), r.width * z, r.height * z);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "rgba(120,160,230,0.9)";
    ctx.lineWidth = 1;
    ctx.strokeRect(sx(0), sy(0), r.width * z, r.height * z);
    const hw2 = 14 * z;
    for (const inst of r.instances) {
      const cx = sx(inst.x), cy = sy(inst.y);
      ctx.fillStyle = "rgba(70,70,160,0.30)";
      ctx.fillRect(cx - hw2, cy - hw2, hw2 * 2, hw2 * 2);
      ctx.strokeStyle = "rgba(140,140,220,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - hw2, cy - hw2, hw2 * 2, hw2 * 2);
      if (z >= 0.4 && inst.object_name) {
        ctx.fillStyle = "rgba(210,210,255,0.85)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(inst.object_name.length > 9 ? inst.object_name.slice(0, 8) + "\u2026" : inst.object_name, cx, cy);
      }
    }
    ctx.restore();
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  async _load_data() {
    try {
      const raw = await project_read_file(`paths/${this._name}/path.json`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.kind) this._data.kind = parsed.kind;
        if (parsed.closed !== void 0) this._data.closed = parsed.closed;
        if (Array.isArray(parsed.points)) this._data.points = parsed.points;
        if (parsed.ref_room) this._data.ref_room = parsed.ref_room;
      }
    } catch {
    }
    await this._populate_room_options();
    if (this._data.ref_room) await this._load_ref_room_data(this._data.ref_room);
    this._draw();
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
      ICON.timeline,
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
    ICON.play,
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
    ICON.script,
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
    ICON.script,
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
    ICON.script,
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

// packages/ide/src/panels/docs_window.ts
var _win6 = null;
function docs_open(workspace) {
  if (_win6) {
    _win6.bring_to_front();
    return;
  }
  _win6 = new FloatingWindow(
    "sw-docs",
    "Documentation",
    ICON.help,
    { x: 120, y: 60, w: 920, h: 640 }
  );
  _win6.on_close(() => {
    _win6 = null;
  });
  const body = _win6.body;
  body.style.cssText = "display:flex; flex-direction:column; overflow:hidden; background:var(--sw-chrome);";
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "flex:1; width:100%; border:none; background:#fff;";
  iframe.src = new URL("../../docs/api/index.html", document.baseURI).href;
  const fallback = document.createElement("div");
  fallback.style.cssText = "display:none; flex-direction:column; align-items:center; justify-content:center; gap:10px; flex:1; padding:24px; text-align:center; color:var(--sw-text-dim); font-size:13px;";
  fallback.innerHTML = `<div style="font-size:15px;color:var(--sw-text);">Documentation not found</div><div>The API reference hasn't been generated yet.</div><div>Run <code style="background:var(--sw-chrome2);padding:1px 5px;border-radius:3px;">npm run gen:docs</code> to build it, then reopen this window.</div>`;
  iframe.addEventListener("error", () => {
    iframe.style.display = "none";
    fallback.style.display = "flex";
  });
  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument;
      if (doc && doc.title && !/silkweaver/i.test(doc.title)) {
        iframe.style.display = "none";
        fallback.style.display = "flex";
      }
    } catch {
    }
  });
  body.append(iframe, fallback);
  _win6.mount(workspace);
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
    window_cascade: () => FloatingWindow.cascade(),
    window_tile: () => FloatingWindow.tile(),
    window_minimize_all: () => FloatingWindow.minimize_all(),
    window_close_all: () => FloatingWindow.close_all(),
    window_list: () => FloatingWindow.list().map((w) => ({ title: w.get_title(), focus: () => w.focus() })),
    help_docs: () => docs_open(_workspace),
    help_about: on_help_about
  });
  document.body.appendChild(menubar);
  document.body.appendChild(_build_toolbar());
  const main = document.createElement("div");
  main.id = "sw-main";
  const dock = document.createElement("div");
  dock.id = "sw-dock";
  const splitter = document.createElement("div");
  splitter.id = "sw-splitter";
  _workspace = document.createElement("div");
  _workspace.id = "sw-workspace";
  main.append(dock, splitter, _workspace);
  document.body.appendChild(main);
  _setup_splitter(dock, splitter);
  document.body.appendChild(status_bar_create());
  _tree = new ResourceTree();
  _tree.on_add_resource = on_add_resource;
  _tree.on_delete_resource = on_delete_resource;
  _tree.on_rename_resource = on_rename_resource;
  _tree.on_duplicate_resource = on_duplicate_resource;
  _tree.mount(dock);
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
    if (e.key === "F1") {
      e.preventDefault();
      docs_open(_workspace);
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
function _build_toolbar() {
  const tb = document.createElement("div");
  tb.id = "sw-toolbar";
  const btn = (label, title, fn) => {
    const b = document.createElement("button");
    b.className = "sw-tb-btn";
    b.innerHTML = label;
    b.title = title;
    b.addEventListener("click", fn);
    tb.appendChild(b);
  };
  const sep = () => {
    const s = document.createElement("div");
    s.className = "sw-tb-sep";
    tb.appendChild(s);
  };
  btn(ICON.new_file, "New Project (Ctrl+N)", on_file_new);
  btn(ICON.open, "Open Project (Ctrl+O)", on_file_open);
  btn(ICON.save, "Save Project (Ctrl+S)", on_file_save);
  sep();
  btn(ICON.sprite, "Add Sprite", () => on_add_resource("sprites"));
  btn(ICON.sound, "Add Sound", () => on_add_resource("sounds"));
  btn(ICON.background, "Add Background", () => on_add_resource("backgrounds"));
  btn(ICON.path, "Add Path", () => on_add_resource("paths"));
  btn(ICON.script, "Add Script", () => on_add_resource("scripts"));
  btn(ICON.font, "Add Font", () => on_add_resource("fonts"));
  btn(ICON.timeline, "Add Timeline", () => on_add_resource("timelines"));
  btn(ICON.object, "Add Object", () => on_add_resource("objects"));
  btn(ICON.room, "Add Room", () => on_add_resource("rooms"));
  sep();
  btn(ICON.play, "Play (F5)", on_run_play);
  btn(ICON.stop, "Stop", on_run_stop);
  btn(ICON.build, "Build (Ctrl+F5)", on_run_build);
  sep();
  btn(ICON.settings, "Game Settings (Ctrl+Shift+P)", on_edit_game_settings);
  return tb;
}
function _setup_splitter(dock, splitter) {
  let dragging = false, start_x = 0, start_w = 0;
  splitter.addEventListener("mousedown", (e) => {
    dragging = true;
    start_x = e.clientX;
    start_w = dock.offsetWidth;
    document.body.style.cursor = "col-resize";
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    dock.style.width = Math.max(150, Math.min(600, start_w + (e.clientX - start_x))) + "px";
  });
  window.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      document.body.style.cursor = "";
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
  const singular = cat.slice(0, -1);
  let n = 0, name = "";
  do {
    n++;
    name = `${singular}${n}`;
  } while (_project.resources[cat][name] || await _resource_on_disk(cat, name));
  undo_push({
    label: `Add ${singular} "${name}"`,
    execute: () => {
      _tree.add_resource(cat, name);
      _mark_unsaved();
    },
    unexecute: () => {
      _tree.remove_resource(cat, name);
      _mark_unsaved();
    }
  });
  _tree.expand_category(cat);
  _tree.begin_rename(cat, name);
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
  try {
    await _delete_resource_files(cat, name);
  } catch (err) {
    console.warn("[IDE] Delete files failed:", err);
  }
}
async function _delete_resource_files(cat, name) {
  if (!project_has_folder()) return;
  for (const rel of [`${cat}/${name}`, `${cat}/${name}.ts`]) {
    if (await project_file_exists(rel)) await project_delete(rel);
  }
}
async function on_rename_resource(cat, name, new_name_raw) {
  if (!_project) return;
  const new_name = (new_name_raw ?? "").trim();
  if (!new_name || new_name === name) return;
  if (!/^[A-Za-z_]\w*$/.test(new_name)) {
    await _alert("Names may only contain letters, digits, and _ (not starting with a digit).");
    return;
  }
  if (_project.resources[cat][new_name]) {
    await _alert(`A resource named "${new_name}" already exists.`);
    return;
  }
  try {
    await _move_resource_files(cat, name, new_name, "move");
  } catch (err) {
    await _alert("Rename failed: " + (err?.message ?? err));
    return;
  }
  _tree.remove_resource(cat, name);
  _tree.add_resource(cat, new_name);
  _mark_unsaved();
  console_write("system", `[IDE] Renamed ${cat.slice(0, -1)} "${name}" \u2192 "${new_name}".`);
}
async function on_duplicate_resource(cat, name) {
  if (!_project) return;
  let new_name = `${name}_copy`, n = 2;
  while (_project.resources[cat][new_name]) new_name = `${name}_copy${n++}`;
  try {
    await _move_resource_files(cat, name, new_name, "copy");
  } catch (err) {
    await _alert("Duplicate failed: " + (err?.message ?? err));
    return;
  }
  _tree.add_resource(cat, new_name);
  _mark_unsaved();
  console_write("system", `[IDE] Duplicated ${cat.slice(0, -1)} "${name}" \u2192 "${new_name}".`);
}
async function _move_resource_files(cat, old_name, new_name, op) {
  const file_rel = `${cat}/${old_name}.ts`;
  const folder_rel = `${cat}/${old_name}`;
  let src = null;
  let is_file = false;
  if (await project_file_exists(file_rel)) {
    src = file_rel;
    is_file = true;
  } else if (await project_file_exists(folder_rel)) {
    src = folder_rel;
  }
  if (!src) return;
  const dst = is_file ? `${cat}/${new_name}.ts` : `${cat}/${new_name}`;
  if (op === "move") await project_rename(src, dst);
  else await project_copy(src, dst);
  if (is_file) {
    const code = await project_read_file(dst);
    const renamed = code.replace(new RegExp(`(\\bclass\\s+)${old_name}\\b`, "g"), `$1${new_name}`).replace(new RegExp(`(\\bfunction\\s+)${old_name}\\b`, "g"), `$1${new_name}`);
    if (renamed !== code) await project_write_file(dst, renamed);
  }
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
async function _resource_on_disk(cat, name) {
  if (!project_has_folder()) return false;
  return await project_file_exists(`${cat}/${name}`) || await project_file_exists(`${cat}/${name}.ts`);
}
async function _open_object(name) {
  try {
    if (window.swfs?.object_op) {
      object_editor_open(_workspace, name);
      return;
    }
    const class_rel = `objects/${name}.ts`;
    if (!await _proj_has(class_rel)) {
      await project_write_file(
        class_rel,
        `export class ${name} extends gm_object {
    on_create(): void {

    }
}
`
      );
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
function get_project_object_names() {
  return get_project_resource_names("objects");
}
function get_project_resource_names(category) {
  const bag = _project?.resources[category];
  return bag ? Object.keys(bag) : [];
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
export {
  get_project_object_names,
  get_project_resource_names
};
