/**
 * Injects global CSS for the Silkweaver IDE.
 *
 * Visual style: GMS-1.4 floating-window layout with a "stacked sheets" surface model — every region
 * is a sheet of paper/cloth lit from above and laid ON the one behind it. Separation comes from
 * ELEVATION (a tone ramp l0→l3 + drop shadows + a faint top edge-highlight), not from hairline
 * borders. Brand palette is drawn from the spider-lily icon: reds lead (accent + branding), a green
 * appears sparingly (run / success), black & white ground everything.
 */
export function theme_inject(): void {
    const style = document.createElement('style')
    style.textContent = /*css*/`
/* ── Inline SVG icons (toolbar + resource tree); no font dependency ── */
#sw-toolbar .sw-tb-btn svg { width: 16px; height: 16px; }
.sw-tree-cat-glyph svg, .sw-tree-item-glyph svg { width: 13px; height: 13px; vertical-align: middle; }

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
    width: 100%; height: 100%; overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 12px;
    background: var(--sw-workspace);
    color: var(--sw-text);
    user-select: none;
}

/* ── CSS Variables ── */
:root {
    /* Elevation ramp — sheets stacked and lit from above: the deeper it sits, the darker it is. */
    --sw-l0:         #1c1c1d;   /* the back "table" the windows lie on (MDI workspace) */
    --sw-l1:         #262627;   /* recessed trays (dock, editor side-panels, sunken areas) */
    --sw-l2:         #333436;   /* base sheets (window body, toolbar, menubar, taskbar) */
    --sw-l3:         #3d3e41;   /* raised sheets (titlebars, menus, popups, tooltips, chips) */
    --sw-l4:         #47484c;   /* hover lift of a raised sheet */

    /* Back-compat aliases — existing components reference these names. */
    --sw-workspace:  var(--sw-l0);
    --sw-chrome:     var(--sw-l2);
    --sw-chrome2:    var(--sw-l1);

    /* Edges are quiet now: depth is tone + shadow, not lines. */
    --sw-border:     rgba(0,0,0,0.38);          /* a recessed seam where two sheets meet */
    --sw-border2:    rgba(255,255,255,0.055);    /* a faint inner division within a sheet */
    --sw-edge:       inset 0 1px 0 rgba(255,255,255,0.05);   /* top paper-edge catching the light */

    /* Elevation shadows — a sheet casting softly onto whatever is beneath it. */
    --sw-shadow-sm:  0 2px 5px rgba(0,0,0,0.35);
    --sw-shadow-md:  0 4px 14px rgba(0,0,0,0.42);
    --sw-shadow-lg:  0 14px 40px rgba(0,0,0,0.52);
    --sw-sunk:       rgba(0,0,0,0.55);          /* inner shadow of a recessed tray (themeable) */

    /* Text */
    --sw-text:       #f1f1f0;
    --sw-text-dim:   #a6a6a4;

    /* Brand palette (spider-lily): reds lead, green is rare. */
    --sw-accent:        #e56878;   /* soft red — the everyday accent: selection, focus, links */
    --sw-accent-hov:    #ef7e8c;   /* a touch lighter on hover */
    --sw-accent-strong: #e60012;   /* bright red — branding punch, primary, the "this matters" edge */
    --sw-success:       #00783b;   /* green — used sparingly (run / success / connected) */

    /* Interaction: hovering lifts a sheet (neutral); red is reserved for meaning, not motion. */
    --sw-hover:      rgba(255,255,255,0.06);
    --sw-active:     rgba(255,255,255,0.12);
    --sw-select-bg:  rgba(229,104,120,0.18);    /* a red wash drawn onto the selected sheet */

    --sw-close-hov:  #e60012;
    --sw-close-act:  #ff495c;
    --sw-input-bg:   #1f1f20;   /* inputs are pressed INTO the sheet → darker, with an inner shadow */
    --sw-input-bdr:  rgba(0,0,0,0.5);
    --sw-select-row: rgba(229,104,120,0.18);

    --sw-titlebar-h: 28px;
    --sw-menubar-h:  24px;
    --sw-toolbar-h:  30px;
    --sw-taskbar-h:  28px;
}

/* ── Scrollbars ── */
::-webkit-scrollbar { width: 9px; height: 9px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.13); border-radius: 0; border: 2px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.24); background-clip: padding-box; }

/* ── Frame layout: menubar · toolbar · [dock | splitter | workspace] · taskbar ── */
/* When the Start Page is up, it IS the page — hide the editor chrome so nothing overlaps it. */
body.sw-startpage-open > :not(#sw-startpage) { display: none !important; }

#sw-toolbar {
    position: fixed;
    top: var(--sw-menubar-h); left: 0; right: 0;
    height: var(--sw-toolbar-h);
    background: var(--sw-l2);
    box-shadow: var(--sw-shadow-sm), var(--sw-edge);   /* casts down onto the workspace below */
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px;
    z-index: 8999;
}
.sw-tb-btn {
    min-width: 26px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: 1px solid transparent; border-radius: 0;
    color: var(--sw-text); cursor: pointer;
    font-size: 13px; line-height: 1; padding: 0 4px;
}
.sw-tb-btn:hover  { background: var(--sw-hover); }
.sw-tb-btn:active { background: var(--sw-active); }
.sw-tb-btn:disabled { opacity: .35; cursor: default; }
.sw-tb-btn:disabled:hover { background: none; border-color: transparent; }
.sw-tb-sep { width: 1px; height: 18px; background: var(--sw-border); margin: 0 5px; flex-shrink: 0; }

#sw-main {
    position: fixed;
    top: calc(var(--sw-menubar-h) + var(--sw-toolbar-h));
    left: 0; right: 0;
    bottom: var(--sw-taskbar-h);
    display: flex;
    overflow: hidden;
}
#sw-dock {
    width: 240px; min-width: 150px; max-width: 600px;
    flex-shrink: 0;
    overflow: auto;
    background: var(--sw-l1);
    box-shadow: inset -7px 0 9px -8px var(--sw-sunk);   /* a recessed tray sunk into the frame */
}
#sw-dock.sw-dock-hidden,
#sw-dock.sw-dock-hidden + #sw-splitter { display: none; }
#sw-splitter {
    width: 5px; flex-shrink: 0;
    cursor: col-resize;
    background: var(--sw-l0);
}
#sw-splitter:hover { background: var(--sw-accent); }
#sw-workspace {
    flex: 1; min-width: 0;
    position: relative;
    overflow: hidden;
    background: var(--sw-l0);
}

/* ── Menubar ── */
#sw-menubar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: var(--sw-menubar-h);
    background: var(--sw-l2);
    box-shadow: var(--sw-shadow-sm);
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
    background: var(--sw-hover);
}
.sw-menu-item.open { background: var(--sw-active); }
.sw-dropdown {
    display: none;
    position: absolute;
    top: 100%; left: 0;
    min-width: 160px;
    background: var(--sw-l3);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    box-shadow: var(--sw-shadow-lg), var(--sw-edge);
    z-index: 9100;
    padding: 4px;
}
.sw-menu-item.open .sw-dropdown { display: block; }
.sw-dropdown-item {
    display: flex;
    align-items: center;
    height: 26px;
    padding: 0 12px;
    border-radius: 0;
    cursor: pointer;
    color: var(--sw-text);
    white-space: nowrap;
}
.sw-dropdown-item:hover { background: var(--sw-hover); }
.sw-dropdown-item.disabled { color: var(--sw-text-dim); cursor: default; }
.sw-dropdown-item.disabled:hover { background: none; }
.sw-dropdown-sep {
    height: 1px; background: var(--sw-border2);
    margin: 4px 6px;
}
.sw-dropdown-shortcut {
    margin-left: auto;
    padding-left: 24px;
    color: var(--sw-text-dim);
    font-size: 11px;
}

/* ── Context menu (right-click) ── */
.sw-ctxmenu {
    position: fixed;
    z-index: 10000;
    background: var(--sw-l3);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    box-shadow: var(--sw-shadow-lg), var(--sw-edge);
    padding: 4px;
    min-width: 168px;
    font-size: 12px;
}
.sw-ctxmenu-item {
    display: flex; align-items: center; gap: 8px;
    height: 25px; padding: 0 14px 0 8px;
    border-radius: 0;
    cursor: pointer; color: var(--sw-text); white-space: nowrap;
}
.sw-ctxmenu-item:hover { background: var(--sw-hover); }
.sw-ctxmenu-item.disabled { color: var(--sw-text-dim); cursor: default; }
.sw-ctxmenu-item.disabled:hover { background: none; }
.sw-ctxmenu-icon { width: 15px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: var(--sw-text-dim); }
.sw-ctxmenu-icon svg { width: 14px; height: 14px; }
.sw-ctxmenu-item:hover .sw-ctxmenu-icon { color: var(--sw-text); }
.sw-ctxmenu-sep { height: 1px; background: var(--sw-border2); margin: 4px 6px; }

/* ── Resource-tree root (project) node ── */
.sw-tree-root {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 6px; cursor: default;
    border-bottom: 1px solid var(--sw-border2);
    color: var(--sw-text);
}
.sw-tree-root .sw-tree-cat-glyph { color: var(--sw-accent); }
.sw-tree-root-label { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Resource-tree filter box (sticky at the top of the dock) ── */
.sw-tree-filter {
    position: sticky; top: 0; z-index: 2;
    padding: 6px;
    background: var(--sw-l1);
    box-shadow: 0 4px 6px -4px rgba(0,0,0,0.5);
}
.sw-tree-filter .sw-input { height: 24px; font-size: 12px; }

/* ── Taskbar (open-window switcher) ── */
#sw-taskbar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: var(--sw-taskbar-h);
    background: var(--sw-l2);
    box-shadow: 0 -2px 6px rgba(0,0,0,0.35), var(--sw-edge);
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 0 4px;
    z-index: 9000;
    overflow-x: auto;
    overflow-y: hidden;
}
.sw-task-btn {
    display: inline-flex; align-items: center; gap: 6px;
    flex-shrink: 0;
    height: 22px; max-width: 190px;
    padding: 0 9px;
    background: var(--sw-l3);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    box-shadow: var(--sw-shadow-sm), var(--sw-edge);
    color: var(--sw-text);
    font-size: 11.5px; line-height: 1;
    cursor: pointer; user-select: none;
}
.sw-task-btn:hover     { background: var(--sw-l4); }
.sw-task-btn.active    { background: var(--sw-l3); box-shadow: var(--sw-shadow-sm), inset 0 -2px 0 var(--sw-accent-strong); }
.sw-task-btn.minimized { opacity: .55; font-style: italic; box-shadow: none; }
.sw-task-btn svg, .sw-task-btn img { width: 13px; height: 13px; flex-shrink: 0; }
.sw-task-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sw-task-empty { color: var(--sw-text-dim); font-size: 11px; padding: 0 6px; user-select: none; }

/* ── Floating Windows ── */
.sw-window {
    position: absolute;
    background: var(--sw-l2);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    box-shadow: var(--sw-shadow-lg), var(--sw-edge);   /* the sheet hovers clearly above the table */
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
    background: var(--sw-l3);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.35);
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
    border-radius: 0;
}
.sw-window-btn svg { width: 11px; height: 11px; }
.sw-window-btn:hover { background: var(--sw-hover); }
.sw-window-btn.close:hover { background: var(--sw-close-hov); color: #fff; }
.sw-window-btn.close:hover svg { stroke: #fff; }
.sw-window-btn.close:active { background: var(--sw-close-act); }

/* Small inline delete / clear button (✕) — used by list rows in the editors.
   Subtle at rest, turns red and brightens on hover so it reads as a destructive action. */
.sw-x-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px; height: 18px;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 0;
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

/* ── Common Form Elements ── */
.sw-label {
    display: block;
    color: var(--sw-text-dim);
    font-size: 11px;
    margin-bottom: 2px;
}
.sw-input {
    background: var(--sw-input-bg);
    border: 1px solid var(--sw-input-bdr);
    border-radius: 0;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);    /* pressed into the sheet */
    color: var(--sw-text);
    font-size: 12px;
    padding: 3px 6px;
    outline: none;
    width: 100%;
}
.sw-input:focus { border-color: var(--sw-accent); box-shadow: inset 0 1px 2px rgba(0,0,0,0.4), 0 0 0 2px rgba(229,104,120,0.28); }
.sw-select {
    background: var(--sw-input-bg);
    border: 1px solid var(--sw-input-bdr);
    border-radius: 0;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
    color: var(--sw-text);
    font-size: 12px;
    padding: 3px 6px;
    outline: none;
    cursor: pointer;
}
.sw-select:focus { border-color: var(--sw-accent); }
.sw-btn {
    background: var(--sw-l3);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    box-shadow: var(--sw-shadow-sm), var(--sw-edge);   /* a chip raised off the sheet */
    color: var(--sw-text);
    font-size: 12px;
    padding: 4px 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.sw-btn:hover  { background: var(--sw-l4); box-shadow: var(--sw-shadow-md), var(--sw-edge); }
.sw-btn:active { background: #2c2c2e; box-shadow: inset 0 1px 3px rgba(0,0,0,0.45); }
.sw-btn.primary { background: var(--sw-accent-strong); border-color: #b00010; color: #fff; }
.sw-btn.primary:hover { background: #ff1a2c; }
.sw-btn img { width: 14px; height: 14px; }
.sw-btn svg { width: 14px; height: 14px; }
.sw-btn:disabled { opacity: .4; cursor: default; box-shadow: none; }
.sw-btn:disabled:hover { background: var(--sw-l3); }
.sw-checkbox { accent-color: var(--sw-accent); cursor: pointer; }

/* ── Editor Toolbar (shared) ── */
.sw-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    background: var(--sw-l2);
    box-shadow: 0 3px 6px -4px rgba(0,0,0,0.5);   /* a lip casting onto the content below */
    flex-shrink: 0;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
}

/* Recessed side trays inside editor windows (props / lists). They sit a layer BELOW the window
   body, so a tone drop + a soft inner shadow reads as "sunk in", not "lined off". */
.sw-sprite-framelist, .sw-sprite-props, .sw-obj-props-panel, .sw-room-panel,
.sw-bg-props, .sw-font-props, .sw-tl-list-panel {
    background: var(--sw-l1);
}

/* ── Sprite Editor ── */
.sw-sprite-framelist {
    width: 80px;
    min-width: 80px;
    flex-shrink: 0;
    overflow-y: auto;
    box-shadow: inset -6px 0 8px -7px var(--sw-sunk);
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
.sw-sprite-frame-row:hover { background: var(--sw-hover); }
.sw-sprite-preview-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #161616;
    box-shadow: inset 0 0 24px var(--sw-sunk);
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
    box-shadow: inset 6px 0 8px -7px var(--sw-sunk);
}

/* ── Object Editor ── */
.sw-obj-props-panel {
    width: 220px;
    min-width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    box-shadow: inset -6px 0 8px -7px var(--sw-sunk);
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
.sw-obj-event-row:hover { background: var(--sw-hover); }

/* ── Room Editor ── */
.sw-room-panel {
    width: 230px;
    min-width: 230px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    box-shadow: inset -6px 0 8px -7px var(--sw-sunk);
    overflow: hidden;
}
.sw-room-tabs {
    display: flex;
    flex-wrap: wrap;
    background: var(--sw-l2);
    box-shadow: 0 2px 5px -3px rgba(0,0,0,0.5);
    flex-shrink: 0;
}
.sw-room-tab {
    background: none;
    border: none;
    color: var(--sw-text-dim);
    font-size: 10px;
    padding: 5px 6px;
    cursor: pointer;
    flex: 1;
    text-align: center;
}
.sw-room-tab:hover { background: var(--sw-hover); color: var(--sw-text); }
.sw-room-tab.active { background: var(--sw-l1); color: var(--sw-text); box-shadow: inset 0 -2px 0 var(--sw-accent-strong); }
.sw-room-inst-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    cursor: pointer;
    border-bottom: 1px solid var(--sw-border2);
    font-size: 11px;
}
.sw-room-inst-row:hover    { background: var(--sw-hover); }
.sw-room-inst-row.selected { background: var(--sw-select-row); box-shadow: inset 2px 0 0 var(--sw-accent-strong); }

/* ── Sound Editor ── */
.sw-snd-status {
    padding: 4px 8px;
    font-size: 11px;
    color: var(--sw-text-dim);
    background: var(--sw-l2);
    box-shadow: 0 2px 5px -3px rgba(0,0,0,0.5);
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

/* ── Background Editor ── */
.sw-bg-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #161616;
    box-shadow: inset 0 0 24px var(--sw-sunk);
    overflow: hidden;
}
.sw-bg-props {
    width: 180px;
    min-width: 180px;
    flex-shrink: 0;
    overflow-y: auto;
    box-shadow: inset 6px 0 8px -7px var(--sw-sunk);
}
.sw-bg-section {
    border-bottom: 1px solid var(--sw-border2);
}
.sw-bg-section-title {
    padding: 5px 8px;
    font-size: 10px;
    font-weight: bold;
    color: var(--sw-text-dim);
    background: var(--sw-l2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.sw-bg-prop-row {
    padding: 4px 8px;
    border-bottom: 1px solid var(--sw-border2);
}

/* ── Font Editor ── */
.sw-font-props {
    width: 220px;
    min-width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    box-shadow: inset -6px 0 8px -7px var(--sw-sunk);
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
    background: var(--sw-l2);
}
.sw-font-preview {
    flex: 1;
    overflow: auto;
    padding: 12px;
    color: var(--sw-text);
    white-space: pre-wrap;
    outline: none;
}

/* ── Path Editor ── */
/* (canvas fills flex container; no extra panel needed) */

/* ── Timeline Editor ── */
.sw-tl-list-panel {
    width: 300px;
    min-width: 200px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    box-shadow: inset -6px 0 8px -7px var(--sw-sunk);
    overflow: hidden;
}
.sw-tl-strip-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--sw-l2);
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
.sw-tl-moment-row:hover    { background: var(--sw-hover); }
.sw-tl-moment-row.selected { background: var(--sw-select-row); box-shadow: inset 2px 0 0 var(--sw-accent-strong); }
.sw-tl-step-lbl {
    min-width: 52px;
    color: var(--sw-text-dim);
    font-size: 10px;
}

/* ── Console / Output Panel ── */
.sw-con-list {
    flex: 1;
    overflow-y: auto;
    font-family: 'Consolas', 'Cascadia Code', monospace;
    font-size: 11px;
    background: #161616;
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
    user-select: text;            /* allow manual select + Ctrl+C */
    cursor: text;
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
.sw-con-text { flex: 1; word-break: break-all; white-space: pre-wrap; }
.sw-con-copy {
    flex-shrink: 0;
    align-self: flex-start;
    opacity: 0;
    background: transparent;
    border: none;
    color: var(--sw-text-dim);
    cursor: pointer;
    font-size: 11px;
    line-height: 1.5;
    padding: 0 4px;
    user-select: none;
}
.sw-con-row:hover .sw-con-copy { opacity: 0.65; }
.sw-con-copy:hover  { opacity: 1 !important; color: var(--sw-text); }
.sw-con-copy.copied { opacity: 1 !important; color: #6ec6ff; }
.sw-con-log    { color: #e0e0e0; }
.sw-con-info   { color: #6ec6ff; }
.sw-con-warn   { color: #ffcc44; background: rgba(255,204,68,0.06); }
.sw-con-error  { color: #ff6b6b; background: rgba(255,107,107,0.08); }
.sw-con-system { color: var(--sw-text-dim); font-style: italic; }
.sw-con-filter        { opacity: 0.45; }
.sw-con-filter.active { opacity: 1; }

/* ── Preferences category sidebar ── */
.sw-pref-cat {
    text-align: left;
    background: transparent;
    border: none;
    color: var(--sw-text);
    padding: 5px 9px;
    border-radius: 0;
    font-size: 12px;
    cursor: pointer;
    width: 100%;
}
.sw-pref-cat:hover         { background: var(--sw-hover); }
.sw-pref-cat.active        { background: var(--sw-select-row); box-shadow: inset 2px 0 0 var(--sw-accent-strong); }
.sw-pref-cat.active:hover  { background: var(--sw-select-row); }

/* ── Hover help tooltip ── */
.sw-tooltip {
    position: fixed;
    z-index: 99999;
    max-width: 280px;
    background: var(--sw-l3);
    color: var(--sw-text);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    padding: 6px 9px;
    font-size: 11px;
    line-height: 1.45;
    box-shadow: var(--sw-shadow-lg), var(--sw-edge);
    pointer-events: none;
}
/* Subtle affordance that an item has help on hover. */
.sw-has-help { cursor: help; }

/* ── Debugger Panel ── */
.sw-dbg-status {
    padding: 4px 8px;
    font-size: 11px;
    background: var(--sw-l2);
    box-shadow: 0 2px 5px -3px rgba(0,0,0,0.5);
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
.sw-dbg-inst {
    padding: 4px 8px 3px;
    font-family: Consolas, monospace;
    font-size: 11px;
    font-weight: 600;
    color: var(--sw-accent);
    border-top: 1px solid var(--sw-border2);
    cursor: pointer;
    user-select: none;
}
.sw-dbg-inst:hover { background: var(--sw-hover); }
.sw-dbg-inst:first-child { border-top: none; }
.sw-dbg-caret { display: inline-block; width: 12px; color: var(--sw-text-dim); }
.sw-dbg-count { color: var(--sw-text-dim); font-weight: 400; margin-left: 6px; }
.sw-dbg-vars .sw-dbg-row { padding-left: 22px; }   /* indent vars under their instance header */

/* ── Resource Tree ── */
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
    border-radius: 0;
}
.sw-tree-btn:hover { color: var(--sw-text); background: var(--sw-hover); }

/* ── Profiler Panel ── */
.sw-prof-section {
    background: var(--sw-l3);
    border: 1px solid var(--sw-border);
    border-radius: 0;
    box-shadow: var(--sw-shadow-sm), var(--sw-edge);
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
`
    document.head.appendChild(style)
}
