/**
 * Floating window system for the Silkweaver IDE.
 * Each panel (resource tree, editor, console, etc.) is a draggable,
 * resizable floating window styled after Windows 10 / GMS 1.4.
 */

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
    readonly id:          string
    readonly el:          HTMLElement        // outer .sw-window div
    readonly body:        HTMLElement        // .sw-window-body content area

    private _title_el:    HTMLElement
    private _icon_el:     HTMLImageElement
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

    constructor(id: string, title: string, icon_src: string | null, default_rect: { x: number; y: number; w: number; h: number }) {
        this.id = id

        // ── Outer window element ──────────────────────────────────────────
        this.el = document.createElement('div')
        this.el.className = 'sw-window'
        this.el.style.left   = default_rect.x + 'px'
        this.el.style.top    = default_rect.y + 'px'
        this.el.style.width  = default_rect.w + 'px'
        this.el.style.height = default_rect.h + 'px'
        this.el.style.zIndex = String(_next_z())

        // ── Title bar ────────────────────────────────────────────────────
        const titlebar = document.createElement('div')
        titlebar.className = 'sw-window-titlebar'

        this._icon_el = document.createElement('img')
        this._icon_el.src = icon_src ?? ''
        this._icon_el.style.display = icon_src ? '' : 'none'

        this._title_el = document.createElement('span')
        this._title_el.className = 'sw-window-title'
        this._title_el.textContent = title

        const btns = document.createElement('div')
        btns.className = 'sw-window-btns'

        this._min_btn   = _make_btn('_', 'min',   () => this.toggle_minimize())
        this._max_btn   = _make_btn('□', 'max',   () => this.toggle_maximize())
        this._close_btn = _make_btn('✕', 'close', () => this.close())

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

        // Bring to front on click
        this.el.addEventListener('mousedown', () => this.bring_to_front())

        // ── Restore saved layout ─────────────────────────────────────────
        const saved = _load_layouts()[id]
        if (saved) {
            this.el.style.left   = saved.x + 'px'
            this.el.style.top    = saved.y + 'px'
            this.el.style.width  = saved.w + 'px'
            this.el.style.height = saved.h + 'px'
            if (saved.minimized) this.el.classList.add('minimized')
        }
    }

    // ── Public API ────────────────────────────────────────────────────────

    /** Append window to a parent element and make it visible. */
    mount(parent: HTMLElement): this {
        parent.appendChild(this.el)
        return this
    }

    /** Set the window title text. */
    set_title(title: string): void {
        this._title_el.textContent = title
    }

    /** Set the title bar icon. */
    set_icon(src: string): void {
        this._icon_el.src = src
        this._icon_el.style.display = ''
    }

    /** Bring this window to the top of the z stack. */
    bring_to_front(): void {
        this.el.style.zIndex = String(_next_z())
    }

    /** Toggle minimized state (collapse to title bar). */
    toggle_minimize(): void {
        this._maximized = false
        this.el.classList.toggle('minimized')
        this._persist()
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
            this._max_btn.textContent = '❐'
        } else {
            if (this._saved_rect) {
                this.el.style.left   = this._saved_rect.x + 'px'
                this.el.style.top    = this._saved_rect.y + 'px'
                this.el.style.width  = this._saved_rect.w + 'px'
                this.el.style.height = this._saved_rect.h + 'px'
            }
            this._maximized = false
            this._max_btn.textContent = '□'
        }
        this.el.classList.remove('minimized')
        this._persist()
    }

    /** Close (remove) the window. Calls the optional on_close callback. */
    close(): void {
        this._on_close_cb?.()
        this.el.remove()
    }

    /** Register a callback invoked when the window is closed. */
    on_close(cb: () => void): this {
        this._on_close_cb = cb
        return this
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

function _make_btn(label: string, cls: string, cb: () => void): HTMLElement {
    const btn = document.createElement('div')
    btn.className = `sw-window-btn ${cls}`
    btn.textContent = label
    btn.addEventListener('click', (e) => { e.stopPropagation(); cb() })
    return btn
}
