/**
 * Floating window system for the Silkweaver IDE.
 * Each panel (resource tree, editor, console, etc.) is a draggable,
 * resizable floating window styled after Windows 10 / GMS 1.4.
 */

import { ICON } from './icons.js'

// =========================================================================
// Types
// =========================================================================

interface window_state {
    x: number
    y: number
    w: number
    h: number
    minimized: boolean
}

type resize_dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

/**
 * A window's undo/redo delegate. Editors that own an undo stack register one so the global
 * Ctrl+Z / Ctrl+Y shortcuts route to whichever window currently holds keyboard focus.
 */
export interface window_undo {
    undo(): boolean   // returns false if there was nothing to undo
    redo(): boolean   // returns false if there was nothing to redo
}

// =========================================================================
// Z-index counter
// =========================================================================

let _z_counter = 100

function _next_z(): number {
    return ++_z_counter
}

// =========================================================================
// Layout persistence
// =========================================================================

const LAYOUT_KEY = 'sw_ide_layout'

function _load_layouts(): Record<string, window_state> {
    try {
        return JSON.parse(localStorage.getItem(LAYOUT_KEY) ?? '{}')
    } catch {
        return {}
    }
}

function _save_layout(id: string, state: window_state): void {
    const layouts = _load_layouts()
    layouts[id] = state
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layouts))
}

// =========================================================================
// FloatingWindow
// =========================================================================

/**
 * A draggable, resizable floating window.
 */
export class FloatingWindow {
    /** Registry of every currently-open (mounted) window, for MDI management. */
    private static _open: Set<FloatingWindow> = new Set()
    /** The window most recently brought to the front (drives the taskbar's active highlight). */
    private static _active: FloatingWindow | null = null
    /** Subscribers notified (coalesced) when the open set, active window, or any title changes. */
    private static _listeners: Set<() => void> = new Set()
    private static _notify_scheduled = false

    readonly id:          string
    readonly el:          HTMLElement        // outer .sw-window div
    readonly body:        HTMLElement        // .sw-window-body content area

    private _title_el:    HTMLElement
    private _icon_el:     HTMLElement
    private _min_btn:     HTMLElement
    private _max_btn:     HTMLElement
    private _close_btn:   HTMLElement

    private _maximized:   boolean = false
    private _saved_rect:  { x: number; y: number; w: number; h: number } | null = null

    // Drag state
    private _drag_active  = false
    private _drag_ox      = 0
    private _drag_oy      = 0

    // Resize state
    private _resize_active = false
    private _resize_dir:   resize_dir = 'se'
    private _resize_start  = { mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 }

    private _on_close_cb: (() => void) | null = null
    private _icon_src:    string | null = null   // original icon (SVG string or URL), for the taskbar
    private _base_title:  string = ''            // title text without the unsaved dot
    private _dirty_dot:   boolean = false        // whether a leading ● is shown
    private _before_close: (() => boolean | Promise<boolean>) | null = null
    private _undo_handler: window_undo | null = null   // window-scoped Ctrl+Z/Y delegate (or native)

    constructor(id: string, title: string, icon_src: string | null, default_rect: { x: number; y: number; w: number; h: number }) {
        this.id = id
        this._icon_src = icon_src

        // ── Outer window element ──────────────────────────────────────────
        this.el = document.createElement('div')
        this.el.className = 'sw-window'
        this.el.tabIndex = -1                 // programmatically focusable, so window-scoped undo can target it
        this.el.style.left   = default_rect.x + 'px'
        this.el.style.top    = default_rect.y + 'px'
        this.el.style.width  = default_rect.w + 'px'
        this.el.style.height = default_rect.h + 'px'
        this.el.style.zIndex = String(_next_z())

        // ── Title bar ────────────────────────────────────────────────────
        const titlebar = document.createElement('div')
        titlebar.className = 'sw-window-titlebar'

        this._icon_el = _make_window_icon(icon_src)

        this._title_el = document.createElement('span')
        this._title_el.className = 'sw-window-title'
        this._base_title = title
        this._title_el.textContent = title

        const btns = document.createElement('div')
        btns.className = 'sw-window-btns'

        this._min_btn   = _make_btn(ICON.win_min, 'min',   () => this.toggle_minimize())
        this._max_btn   = _make_btn(ICON.win_max, 'max',   () => this.toggle_maximize())
        this._close_btn = _make_btn(ICON.close,   'close', () => void this.close())

        btns.append(this._min_btn, this._max_btn, this._close_btn)
        titlebar.append(this._icon_el, this._title_el, btns)

        // ── Body ─────────────────────────────────────────────────────────
        this.body = document.createElement('div')
        this.body.className = 'sw-window-body'

        // ── Resize handles ───────────────────────────────────────────────
        const dirs: resize_dir[] = ['n','s','e','w','ne','nw','se','sw']
        for (const d of dirs) {
            const h = document.createElement('div')
            h.className = `sw-resize sw-resize-${d}`
            h.addEventListener('mousedown', (e) => {
                e.stopPropagation()
                e.preventDefault()
                this._resize_begin(e, d)
            })
            this.el.appendChild(h)
        }

        this.el.append(titlebar, this.body)

        // ── Drag ─────────────────────────────────────────────────────────
        titlebar.addEventListener('mousedown', (e) => {
            if ((e.target as HTMLElement).closest('.sw-window-btn')) return
            e.preventDefault()
            this._drag_begin(e)
        })

        // Double-click the title bar to maximize / restore (classic MDI gesture).
        titlebar.addEventListener('dblclick', (e) => {
            if ((e.target as HTMLElement).closest('.sw-window-btn')) return
            this.toggle_maximize()
        })

        // Bring to front on click. Also pull keyboard focus into the window (unless a focusable
        // control was clicked, which should keep its own focus) so window-scoped Ctrl+Z/Y target it.
        this.el.addEventListener('mousedown', (e) => {
            this.bring_to_front()
            const t = e.target as HTMLElement
            if (!t.closest('input, textarea, select, button, a, [contenteditable], .monaco-editor, [tabindex]:not(.sw-window)')) {
                this.el.focus({ preventScroll: true })
            }
        })

        // ── Restore saved layout ─────────────────────────────────────────
        const saved = _load_layouts()[id]
        if (saved) {
            this.el.style.left  = saved.x + 'px'
            this.el.style.top   = saved.y + 'px'
            this.el.style.width = saved.w + 'px'
            if (saved.minimized) {
                this.el.classList.add('minimized')
                this.el.dataset.prevH = saved.h + 'px'
                this.el.style.height  = 'var(--sw-titlebar-h)'
            } else {
                this.el.style.height = saved.h + 'px'
            }
        }
    }

    // ── Public API ────────────────────────────────────────────────────────

    /** Append window to a parent element and make it visible. */
    mount(parent: HTMLElement): this {
        parent.appendChild(this.el)
        FloatingWindow._open.add(this)
        FloatingWindow._active = this   // newest window is on top
        FloatingWindow._emit()
        return this
    }

    /** Set the window title text (the unsaved ● dot, if shown, is preserved). */
    set_title(title: string): void {
        this._base_title = title
        this._render_title()
        FloatingWindow._emit()
    }

    /** Show or hide the leading unsaved ● dot on the titlebar. */
    set_dirty(dirty: boolean): void {
        if (this._dirty_dot === dirty) return
        this._dirty_dot = dirty
        this._render_title()
    }

    private _render_title(): void {
        this._title_el.textContent = (this._dirty_dot ? '● ' : '') + this._base_title
    }

    /** Set the title bar icon (accepts an inline SVG string or an image URL). */
    set_icon(src: string): void {
        const next = _make_window_icon(src)
        this._icon_el.replaceWith(next)
        this._icon_el = next
        this._icon_src = src
        FloatingWindow._emit()
    }

    /** Bring this window to the top of the z stack. */
    bring_to_front(): void {
        this.el.style.zIndex = String(_next_z())
        FloatingWindow._active = this
        FloatingWindow._emit()
    }

    /** Returns the window's title text (without the unsaved dot). */
    get_title(): string {
        return this._base_title
    }

    /** Returns the window's icon (inline SVG string or image URL), or null. */
    get_icon(): string | null {
        return this._icon_src
    }

    /** True while collapsed to its title bar. */
    is_minimized(): boolean {
        return this.el.classList.contains('minimized')
    }

    /** Restore (if minimized) and bring this window to the front. */
    focus(): void {
        if (this.el.classList.contains('minimized')) this.toggle_minimize()
        this.bring_to_front()
    }

    /** Clears the maximized flag (cascade/tile set an explicit rect instead). */
    private _unmaximize(): void {
        this._maximized = false
        this._max_btn.innerHTML = ICON.win_max
    }

    // ── MDI management (static, across all open windows) ────────────────────

    /** Every currently-open window. */
    static list(): FloatingWindow[] {
        return [...FloatingWindow._open]
    }

    /** The window currently at the front (or null). */
    static active(): FloatingWindow | null {
        return FloatingWindow._active
    }

    /**
     * Subscribe to open-set / active / title changes (for the taskbar). Notifications are
     * coalesced to one per microtask so a cascade/tile loop fires a single re-render.
     * @returns an unsubscribe function
     */
    static on_change(cb: () => void): () => void {
        FloatingWindow._listeners.add(cb)
        return () => { FloatingWindow._listeners.delete(cb) }
    }

    private static _emit(): void {
        if (FloatingWindow._notify_scheduled) return
        FloatingWindow._notify_scheduled = true
        queueMicrotask(() => {
            FloatingWindow._notify_scheduled = false
            for (const cb of FloatingWindow._listeners) cb()
        })
    }

    /** Cascade all open windows from the top-left of the workspace. */
    static cascade(): void {
        const ws = document.getElementById('sw-workspace')
        if (!ws) return
        let i = 0
        for (const w of FloatingWindow._open) {
            w._unmaximize()
            w.el.classList.remove('minimized')
            const off = (i % 12) * 26
            w.el.style.left   = (8 + off) + 'px'
            w.el.style.top    = (8 + off) + 'px'
            w.el.style.width  = Math.min(680, Math.max(320, ws.offsetWidth  - 80)) + 'px'
            w.el.style.height = Math.min(460, Math.max(200, ws.offsetHeight - 80)) + 'px'
            w.bring_to_front()
            i++
        }
    }

    /** Tile all open windows in a grid filling the workspace. */
    static tile(): void {
        const ws = document.getElementById('sw-workspace')
        if (!ws) return
        const wins = [...FloatingWindow._open]
        if (wins.length === 0) return
        const cols = Math.ceil(Math.sqrt(wins.length))
        const rows = Math.ceil(wins.length / cols)
        const cw = Math.floor(ws.offsetWidth  / cols)
        const ch = Math.floor(ws.offsetHeight / rows)
        wins.forEach((w, idx) => {
            w._unmaximize()
            w.el.classList.remove('minimized')
            const c = idx % cols, r = Math.floor(idx / cols)
            w.el.style.left   = (c * cw) + 'px'
            w.el.style.top    = (r * ch) + 'px'
            w.el.style.width  = cw + 'px'
            w.el.style.height = ch + 'px'
            w.bring_to_front()
        })
    }

    /** Minimize every open window. */
    static minimize_all(): void {
        for (const w of FloatingWindow._open) {
            if (!w.el.classList.contains('minimized')) w.toggle_minimize()
        }
    }

    /** Close every open window. */
    static close_all(): void {
        for (const w of [...FloatingWindow._open]) void w.close()
    }

    /** Toggle minimized state (collapse to title bar). */
    toggle_minimize(): void {
        this._maximized = false
        const is_min = this.el.classList.toggle('minimized')
        if (is_min) {
            // Save full height so we can restore it, then collapse to titlebar only
            this.el.dataset.prevH = this.el.style.height
            this.el.style.height  = 'var(--sw-titlebar-h)'
        } else {
            this.el.style.height = this.el.dataset.prevH ?? this.el.style.height
        }
        this._persist()
        FloatingWindow._emit()
    }

    /** Toggle maximized state (fill workspace). */
    toggle_maximize(): void {
        const workspace = document.getElementById('sw-workspace')!
        if (!this._maximized) {
            this._saved_rect = {
                x: this.el.offsetLeft,
                y: this.el.offsetTop,
                w: this.el.offsetWidth,
                h: this.el.offsetHeight,
            }
            this.el.style.left   = '0'
            this.el.style.top    = '0'
            this.el.style.width  = workspace.offsetWidth + 'px'
            this.el.style.height = workspace.offsetHeight + 'px'
            this._maximized = true
            this._max_btn.innerHTML = ICON.win_restore
        } else {
            if (this._saved_rect) {
                this.el.style.left   = this._saved_rect.x + 'px'
                this.el.style.top    = this._saved_rect.y + 'px'
                this.el.style.width  = this._saved_rect.w + 'px'
                this.el.style.height = this._saved_rect.h + 'px'
            }
            this._maximized = false
            this._max_btn.innerHTML = ICON.win_max
        }
        this.el.classList.remove('minimized')
        this._persist()
        FloatingWindow._emit()
    }

    /** Close (remove) the window. Runs the before-close guard (may veto), then the on_close callback. */
    async close(): Promise<void> {
        if (this._before_close) {
            let ok = false
            try { ok = await this._before_close() } catch { ok = true }   // never trap the user in a window
            if (!ok) return
        }
        this._on_close_cb?.()
        this.el.remove()
        FloatingWindow._open.delete(this)
        if (FloatingWindow._active === this) FloatingWindow._active = null
        FloatingWindow._emit()
    }

    /** Register a callback invoked when the window is closed. */
    on_close(cb: () => void): this {
        this._on_close_cb = cb
        return this
    }

    /**
     * Register an async guard run before the window closes. Return false to veto the close (e.g. the
     * user chose Cancel in an unsaved-changes prompt). Used by editors to confirm dirty content.
     */
    on_before_close(guard: () => boolean | Promise<boolean>): this {
        this._before_close = guard
        return this
    }

    /**
     * Register this window's undo/redo delegate so global Ctrl+Z / Ctrl+Y route here while it holds
     * keyboard focus. Windows backed by Monaco or native inputs leave this null and use native undo.
     */
    set_undo_handler(h: window_undo | null): this {
        this._undo_handler = h
        return this
    }

    /** This window's undo/redo delegate, or null if it has none (native / no undo). */
    undo_handler(): window_undo | null {
        return this._undo_handler
    }

    // ── Drag ─────────────────────────────────────────────────────────────

    private _drag_begin(e: MouseEvent): void {
        this._drag_active = true
        this._drag_ox = e.clientX - this.el.offsetLeft
        this._drag_oy = e.clientY - this.el.offsetTop
        this.bring_to_front()

        const on_move = (ev: MouseEvent) => {
            if (!this._drag_active) return
            const workspace = document.getElementById('sw-workspace')!
            const nx = Math.max(0, Math.min(ev.clientX - this._drag_ox, workspace.offsetWidth  - 40))
            const ny = Math.max(0, Math.min(ev.clientY - this._drag_oy, workspace.offsetHeight - 28))
            this.el.style.left = nx + 'px'
            this.el.style.top  = ny + 'px'
        }
        const on_up = () => {
            this._drag_active = false
            this._persist()
            window.removeEventListener('mousemove', on_move)
            window.removeEventListener('mouseup', on_up)
        }
        window.addEventListener('mousemove', on_move)
        window.addEventListener('mouseup', on_up)
    }

    // ── Resize ────────────────────────────────────────────────────────────

    private _resize_begin(e: MouseEvent, dir: resize_dir): void {
        this._resize_active = true
        this._resize_dir    = dir
        this._resize_start  = {
            mx: e.clientX,
            my: e.clientY,
            x:  this.el.offsetLeft,
            y:  this.el.offsetTop,
            w:  this.el.offsetWidth,
            h:  this.el.offsetHeight,
        }
        this.bring_to_front()

        const on_move = (ev: MouseEvent) => {
            if (!this._resize_active) return
            const s  = this._resize_start
            const dx = ev.clientX - s.mx
            const dy = ev.clientY - s.my
            let { x, y, w, h } = s
            const MIN = 120
            const MINH = 60

            if (dir.includes('e')) w = Math.max(MIN, w + dx)
            if (dir.includes('s')) h = Math.max(MINH, h + dy)
            if (dir.includes('w')) { w = Math.max(MIN, w - dx); x = s.x + s.w - w }
            if (dir.includes('n')) { h = Math.max(MINH, h - dy); y = s.y + s.h - h }

            this.el.style.left   = x + 'px'
            this.el.style.top    = y + 'px'
            this.el.style.width  = w + 'px'
            this.el.style.height = h + 'px'
        }
        const on_up = () => {
            this._resize_active = false
            this._persist()
            window.removeEventListener('mousemove', on_move)
            window.removeEventListener('mouseup', on_up)
        }
        window.addEventListener('mousemove', on_move)
        window.addEventListener('mouseup', on_up)
    }

    // ── Persist layout ────────────────────────────────────────────────────

    private _persist(): void {
        _save_layout(this.id, {
            x:         this.el.offsetLeft,
            y:         this.el.offsetTop,
            w:         this.el.offsetWidth,
            h:         this.el.offsetHeight,
            minimized: this.el.classList.contains('minimized'),
        })
    }
}

// =========================================================================
// Helpers
// =========================================================================

function _make_btn(icon: string, cls: string, cb: () => void): HTMLElement {
    const btn = document.createElement('div')
    btn.className = `sw-window-btn ${cls}`
    btn.innerHTML = icon
    btn.addEventListener('click', (e) => { e.stopPropagation(); cb() })
    return btn
}

/**
 * Builds the titlebar icon element. An inline SVG string (e.g. an `ICON.*` value) renders as a
 * sized span so it matches the resource-tree/toolbar icons exactly; anything else is treated as an
 * image URL (legacy `icons/*.svg`).
 */
function _make_window_icon(src: string | null): HTMLElement {
    if (src && src.trimStart().startsWith('<svg')) {
        const span = document.createElement('span')
        span.className = 'sw-window-icon'
        span.style.cssText = 'display:inline-flex; align-items:center; width:14px; height:14px; flex-shrink:0;'
        span.innerHTML = src
        const svg = span.querySelector('svg')
        if (svg) { svg.style.width = '100%'; svg.style.height = '100%' }
        return span
    }
    const img = document.createElement('img')
    img.className = 'sw-window-icon'
    img.src = src ?? ''
    img.style.display = src ? '' : 'none'
    return img
}
