/**
 * Pixel-art editor for sprite frames — a serviceable MS-Paint / GMS-1.4-style editor.
 *
 * Tools: pencil, eraser, fill bucket, eyedropper, line, rectangle (outline/filled),
 * ellipse (outline/filled). Left mouse = primary colour, right mouse = secondary colour.
 * Plus brush size, zoom, undo/redo, a colour palette, and basic image effects
 * (flip H/V, rotate, invert, grayscale, clear). Exports the frame as a PNG data URL.
 */

import { FloatingWindow } from '../window_manager.js'
import { ICON } from '../icons.js'

/**
 * Opens the pixel editor to create a new frame or edit an existing one.
 * @param workspace - IDE workspace element
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param initial_data - Optional existing image data URL to edit
 * @param on_save - Callback when the user saves, receives the image as a PNG data URL
 */
export function pixel_editor_open(
    workspace: HTMLElement,
    width: number,
    height: number,
    initial_data: string | null,
    on_save: (data_url: string) => void,
): void {
    new PixelEditor(workspace, width, height, initial_data, on_save)
}

type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rect' | 'rect_fill' | 'ellipse' | 'ellipse_fill'
type RGBA = [number, number, number, number]

const TOOLS: { tool: Tool; icon: string; title: string }[] = [
    { tool: 'pencil',       icon: ICON.pencil,       title: 'Pencil (P)' },
    { tool: 'eraser',       icon: ICON.eraser,       title: 'Eraser (E)' },
    { tool: 'fill',         icon: ICON.fill,         title: 'Fill (F)' },
    { tool: 'eyedropper',   icon: ICON.eyedropper,   title: 'Pick colour (I)' },
    { tool: 'line',         icon: ICON.line,         title: 'Line (L)' },
    { tool: 'rect',         icon: ICON.rect,         title: 'Rectangle (R)' },
    { tool: 'rect_fill',    icon: ICON.rect_fill,    title: 'Filled rectangle' },
    { tool: 'ellipse',      icon: ICON.ellipse,      title: 'Ellipse (O)' },
    { tool: 'ellipse_fill', icon: ICON.ellipse_fill, title: 'Filled ellipse' },
]

const PALETTE = [
    '#000000', '#ffffff', '#7f7f7f', '#c3c3c3',
    '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
    '#00ffff', '#0000ff', '#7f00ff', '#ff00ff',
    '#a0522d', '#ffb6c1', '#008000', '#000080',
]

const MAX_UNDO = 50

// Recently-used colours — a most-recent-first palette persisted across edits/sessions, so you're
// never stuck with just the fixed swatches.
const LS_RECENT = 'sw.pixel.recent'
const MAX_RECENT = 24
function _recent_get(): string[] {
    try { const v = JSON.parse(localStorage.getItem(LS_RECENT) ?? '[]'); return Array.isArray(v) ? v.slice(0, MAX_RECENT) : [] }
    catch { return [] }
}
function _recent_add(hex: string): void {
    const next = [hex, ..._recent_get().filter(c => c.toLowerCase() !== hex.toLowerCase())].slice(0, MAX_RECENT)
    localStorage.setItem(LS_RECENT, JSON.stringify(next))
}

class PixelEditor {
    private _win:            FloatingWindow
    private _canvas:         HTMLCanvasElement       // real pixel data (width × height)
    private _ctx:            CanvasRenderingContext2D
    private _display:        HTMLCanvasElement       // zoomed view with grid
    private _dctx:           CanvasRenderingContext2D
    private readonly _w:     number
    private readonly _h:     number
    private _zoom            = 16
    private _tool: Tool      = 'pencil'
    private _primary         = '#000000'
    private _secondary       = '#ffffff'
    private _brush           = 1
    private _on_save:        (data_url: string) => void

    private _drawing         = false
    private _draw_color      = '#000000'   // colour for the active stroke (primary or secondary)
    private _erasing         = false
    private _start           = { x: 0, y: 0 }
    private _last            = { x: 0, y: 0 }
    private _preview: RGBA[] | null = null  // in-progress shape pixels (display overlay)

    private _undo:           ImageData[] = []
    private _redo:           ImageData[] = []

    // Grid overlay: a configurable coarse grid (spacing + colour) plus an optional fine pixel grid.
    private _grid_size       = 16            // overlay grid spacing in pixels (0 = off)
    private _grid_color      = '#4da6ff'     // overlay grid colour (changeable — fixes GMS's invisible grid)
    private _pixel_grid      = false         // faint per-pixel grid (off by default; it obscures the art)

    private _tool_btns       = new Map<Tool, HTMLElement>()
    private _sw_primary!:     HTMLElement
    private _sw_secondary!:   HTMLElement
    private _recent_row!:     HTMLElement

    constructor(workspace: HTMLElement, width: number, height: number, initial: string | null, on_save: (d: string) => void) {
        this._w = Math.max(1, width)
        this._h = Math.max(1, height)
        this._on_save = on_save
        this._zoom = _fit_zoom(this._w, this._h)

        this._canvas = document.createElement('canvas')
        this._canvas.width = this._w; this._canvas.height = this._h
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true })!
        this._display = document.createElement('canvas')
        this._dctx = this._display.getContext('2d')!

        this._win = new FloatingWindow(
            'pixel-editor', 'Pixel Editor', null,
            { x: 120, y: 80, w: Math.min(900, this._w * this._zoom + 60), h: Math.min(680, this._h * this._zoom + 170) },
        )
        this._build_ui()
        this._init_canvas(initial)
        this._win.mount(workspace)
    }

    // ── UI ───────────────────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden; background:#1e1e1e;'

        const bar = document.createElement('div')
        bar.style.cssText = 'display:flex; gap:4px; padding:6px; flex-wrap:wrap; align-items:center; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2);'

        for (const { tool, icon, title } of TOOLS) {
            const btn = _tbtn(icon, title, () => this._set_tool(tool))
            this._tool_btns.set(tool, btn)
            bar.appendChild(btn)
        }
        bar.appendChild(_sep())

        // Brush size
        const size_sel = document.createElement('select')
        size_sel.title = 'Brush size'
        size_sel.style.cssText = 'height:26px; background:var(--sw-chrome2); color:var(--sw-text); border:1px solid var(--sw-border2);'
        for (const s of [1, 2, 3, 4]) { const o = document.createElement('option'); o.value = String(s); o.textContent = `${s}px`; size_sel.appendChild(o) }
        size_sel.addEventListener('change', () => { this._brush = parseInt(size_sel.value) || 1 })
        bar.appendChild(size_sel)
        bar.appendChild(_sep())

        // Zoom
        bar.append(
            _tbtn(ICON.zoom_out, 'Zoom out', () => this._set_zoom(this._zoom - (this._zoom > 4 ? 2 : 1))),
            _tbtn(ICON.zoom_in,  'Zoom in',  () => this._set_zoom(this._zoom + 2)),
            _sep(),
            _tbtn(ICON.undo, 'Undo (Ctrl+Z)', () => this._undo_op()),
            _tbtn(ICON.redo, 'Redo (Ctrl+Y)', () => this._redo_op()),
            _sep(),
        )

        // Effects menu
        const fx = document.createElement('select')
        fx.title = 'Effects'
        fx.style.cssText = 'height:26px; background:var(--sw-chrome2); color:var(--sw-text); border:1px solid var(--sw-border2);'
        for (const [val, label] of [['', 'Effects…'], ['fliph', 'Flip Horizontal'], ['flipv', 'Flip Vertical'], ['rotcw', 'Rotate 90° CW'], ['rotccw', 'Rotate 90° CCW'], ['invert', 'Invert'], ['gray', 'Grayscale'], ['clear', 'Clear']] as const) {
            const o = document.createElement('option'); o.value = val; o.textContent = label; fx.appendChild(o)
        }
        fx.addEventListener('change', () => { if (fx.value) { this._effect(fx.value); fx.value = '' } })
        bar.appendChild(fx)

        const save = document.createElement('button')
        save.textContent = 'Save'
        save.style.cssText = 'margin-left:auto; padding:5px 16px; cursor:pointer; background:var(--sw-accent); color:#fff; border:none; font-size:12px; border-radius:3px;'
        save.addEventListener('click', () => this._save())
        bar.appendChild(save)
        body.appendChild(bar)

        // Colour bar: primary/secondary swatches + palette
        const cbar = document.createElement('div')
        cbar.style.cssText = 'display:flex; gap:6px; padding:6px; align-items:center; background:var(--sw-chrome); border-bottom:1px solid var(--sw-border2); flex-wrap:wrap;'
        this._sw_primary   = _swatch(this._primary, 'Primary (left click) — click to change', () => this._pick_swatch(true))
        this._sw_secondary = _swatch(this._secondary, 'Secondary (right click) — click to change', () => this._pick_swatch(false))
        const swwrap = document.createElement('div')
        swwrap.style.cssText = 'position:relative; width:34px; height:30px;'
        this._sw_secondary.style.cssText += 'position:absolute; right:0; bottom:0; width:20px; height:20px;'
        this._sw_primary.style.cssText   += 'position:absolute; left:0; top:0; width:20px; height:20px; z-index:1;'
        swwrap.append(this._sw_secondary, this._sw_primary)
        cbar.appendChild(swwrap)
        cbar.appendChild(_sep())
        for (const c of PALETTE) cbar.appendChild(this._palette_swatch(c))

        // Recently-used colours (fills in as you draw / pick).
        cbar.appendChild(_sep())
        const recent_lbl = document.createElement('span')
        recent_lbl.textContent = 'Recent'
        recent_lbl.style.cssText = 'font-size:11px; color:var(--sw-text-dim);'
        this._recent_row = document.createElement('div')
        this._recent_row.style.cssText = 'display:flex; gap:3px; flex-wrap:wrap;'
        cbar.append(recent_lbl, this._recent_row)
        this._render_recents()

        // Grid controls: spacing + colour + optional fine pixel grid.
        cbar.appendChild(_sep())
        const grid_lbl = document.createElement('span')
        grid_lbl.textContent = 'Grid'
        grid_lbl.style.cssText = 'font-size:11px; color:var(--sw-text-dim);'
        const grid_size = document.createElement('input')
        grid_size.type = 'number'; grid_size.min = '0'; grid_size.value = String(this._grid_size); grid_size.title = 'Grid spacing (px, 0 = off)'
        grid_size.style.cssText = 'width:48px; height:24px; background:var(--sw-chrome2); color:var(--sw-text); border:1px solid var(--sw-border2);'
        grid_size.addEventListener('change', () => { this._grid_size = Math.max(0, parseInt(grid_size.value) || 0); this._redraw() })
        const grid_col = document.createElement('input')
        grid_col.type = 'color'; grid_col.value = this._grid_color; grid_col.title = 'Grid colour'
        grid_col.style.cssText = 'width:28px; height:24px; padding:0; background:none; border:1px solid var(--sw-border2); cursor:pointer;'
        grid_col.addEventListener('input', () => { this._grid_color = grid_col.value; this._redraw() })
        const px_lbl = document.createElement('label')
        px_lbl.style.cssText = 'display:flex; align-items:center; gap:3px; font-size:11px; color:var(--sw-text-dim); cursor:pointer;'
        const px_chk = document.createElement('input'); px_chk.type = 'checkbox'; px_chk.checked = this._pixel_grid
        px_chk.addEventListener('change', () => { this._pixel_grid = px_chk.checked; this._redraw() })
        px_lbl.append(px_chk, document.createTextNode('px-grid'))
        cbar.append(grid_lbl, grid_size, grid_col, px_lbl)

        body.appendChild(cbar)

        // Canvas area
        const wrap = document.createElement('div')
        wrap.style.cssText = 'flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; background:#1a1a1a; padding:10px;'
        this._display.style.cssText = 'image-rendering:pixelated; cursor:crosshair; border:1px solid var(--sw-border2);'
        wrap.appendChild(this._display)
        body.appendChild(wrap)

        this._set_tool('pencil')
        window.addEventListener('keydown', this._on_key)
        this._win.on_close(() => window.removeEventListener('keydown', this._on_key))
    }

    private _init_canvas(initial: string | null): void {
        if (initial) {
            const img = new Image()
            img.onload = () => { this._ctx.clearRect(0, 0, this._w, this._h); this._ctx.drawImage(img, 0, 0, this._w, this._h); this._redraw() }
            img.src = initial
        }
        this._display.addEventListener('mousedown', this._on_down)
        this._display.addEventListener('mousemove', this._on_move)
        window.addEventListener('mouseup', this._on_up)
        this._display.addEventListener('contextmenu', (e) => e.preventDefault())
        this._resize_display()
        this._redraw()
    }

    // ── Tool / colour / zoom state ─────────────────────────────────────────────

    private _set_tool(tool: Tool): void {
        this._tool = tool
        this._tool_btns.forEach((btn, t) => {
            btn.style.background  = t === tool ? 'var(--sw-select-bg)' : 'var(--sw-chrome2)'
            btn.style.borderColor = t === tool ? 'var(--sw-accent)'    : 'var(--sw-border2)'
        })
    }

    private _set_zoom(z: number): void {
        this._zoom = Math.max(1, Math.min(40, z))
        this._resize_display()
        this._redraw()
    }

    private _resize_display(): void {
        this._display.width  = this._w * this._zoom
        this._display.height = this._h * this._zoom
        this._dctx.imageSmoothingEnabled = false
    }

    private _pick_swatch(primary: boolean): void {
        const inp = document.createElement('input')
        inp.type = 'color'
        inp.value = primary ? this._primary : this._secondary
        inp.addEventListener('input', () => {
            if (primary) { this._primary = inp.value; this._sw_primary.style.background = inp.value }
            else         { this._secondary = inp.value; this._sw_secondary.style.background = inp.value }
        })
        inp.addEventListener('change', () => this._use_color(inp.value))
        inp.click()
    }

    /** A clickable palette/recent swatch: left-click = primary, right-click = secondary. */
    private _palette_swatch(c: string): HTMLElement {
        const sw = _swatch(c, c, () => {})
        sw.style.cssText += 'width:18px; height:18px;'
        sw.addEventListener('mousedown', (e) => {
            e.preventDefault()
            if (e.button === 2) { this._secondary = c; this._sw_secondary.style.background = c }
            else                { this._primary   = c; this._sw_primary.style.background   = c }
        })
        sw.addEventListener('contextmenu', (e) => e.preventDefault())
        return sw
    }

    /** Records a colour as used and refreshes the Recent row. */
    private _use_color(hex: string): void {
        _recent_add(hex)
        this._render_recents()
    }

    private _render_recents(): void {
        this._recent_row.innerHTML = ''
        for (const c of _recent_get()) this._recent_row.appendChild(this._palette_swatch(c))
    }

    private _on_key = (e: KeyboardEvent): void => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') { e.preventDefault(); this._undo_op() }
            else if (e.key === 'y') { e.preventDefault(); this._redo_op() }
            return
        }
        const map: Record<string, Tool> = { p: 'pencil', e: 'eraser', f: 'fill', i: 'eyedropper', l: 'line', r: 'rect', o: 'ellipse' }
        const t = map[e.key.toLowerCase()]
        if (t) this._set_tool(t)
    }

    // ── Mouse → drawing ────────────────────────────────────────────────────────

    private _coords(e: MouseEvent): { x: number; y: number } {
        const r = this._display.getBoundingClientRect()
        return { x: Math.floor((e.clientX - r.left) / this._zoom), y: Math.floor((e.clientY - r.top) / this._zoom) }
    }

    private _on_down = (e: MouseEvent): void => {
        e.preventDefault()
        const { x, y } = this._coords(e)
        const right = e.button === 2
        this._draw_color = right ? this._secondary : this._primary
        this._erasing = this._tool === 'eraser'

        if (this._tool === 'eyedropper') { this._pick(x, y, !right); return }
        if (!this._erasing) this._use_color(this._draw_color)
        if (this._tool === 'fill')       { this._snapshot(); this._flood(x, y); return }

        this._snapshot()
        this._drawing = true
        this._start = { x, y }; this._last = { x, y }
        if (this._tool === 'pencil' || this._tool === 'eraser') this._stamp_line(x, y, x, y)
        this._redraw()
    }

    private _on_move = (e: MouseEvent): void => {
        if (!this._drawing) return
        const { x, y } = this._coords(e)
        if (this._tool === 'pencil' || this._tool === 'eraser') {
            this._stamp_line(this._last.x, this._last.y, x, y)
            this._last = { x, y }
            this._redraw()
        } else {
            // Shape tools: live preview without committing.
            this._preview = this._shape_pixels(this._start.x, this._start.y, x, y)
            this._redraw()
        }
    }

    private _on_up = (): void => {
        if (!this._drawing) return
        this._drawing = false
        if (this._preview) { this._commit_pixels(this._preview); this._preview = null; this._redraw() }
    }

    /** Stamps the brush along a Bresenham line (so fast drags have no gaps). */
    private _stamp_line(x0: number, y0: number, x1: number, y1: number): void {
        for (const [x, y] of _line(x0, y0, x1, y1)) this._stamp(x, y)
    }

    /** Draws the brush (size × size) centred at (x, y) with the active colour or erases. */
    private _stamp(x: number, y: number): void {
        const o = Math.floor((this._brush - 1) / 2)
        if (this._erasing) this._ctx.clearRect(x - o, y - o, this._brush, this._brush)
        else { this._ctx.fillStyle = this._draw_color; this._ctx.fillRect(x - o, y - o, this._brush, this._brush) }
    }

    /** Writes a shape colour-buffer (from _shape_pixels) into the real canvas. */
    private _commit_pixels(buf: RGBA[]): void {
        for (let i = 0; i < buf.length; i++) {
            const c = buf[i]
            if (!c) continue
            const x = i % this._w, y = Math.floor(i / this._w)
            if (c[3] === 0) this._ctx.clearRect(x, y, 1, 1)
            else { this._ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},1)`; this._ctx.fillRect(x, y, 1, 1) }
        }
    }

    /** Computes a canvas-sized colour buffer for the current shape tool (null = no pixel). */
    private _shape_pixels(x0: number, y0: number, x1: number, y1: number): RGBA[] {
        const buf: RGBA[] = new Array(this._w * this._h).fill(null) as any
        const put = (x: number, y: number) => {
            if (x < 0 || y < 0 || x >= this._w || y >= this._h) return
            buf[y * this._w + x] = this._erasing ? [0, 0, 0, 0] : _hex(this._draw_color)
        }
        let pts: [number, number][] = []
        if (this._tool === 'line')                              pts = _line(x0, y0, x1, y1)
        else if (this._tool === 'rect' || this._tool === 'rect_fill') pts = _rect(x0, y0, x1, y1, this._tool === 'rect_fill')
        else if (this._tool === 'ellipse' || this._tool === 'ellipse_fill') pts = _ellipse(x0, y0, x1, y1, this._tool === 'ellipse_fill')
        for (const [x, y] of pts) put(x, y)
        return buf
    }

    private _pick(x: number, y: number, primary: boolean): void {
        if (x < 0 || y < 0 || x >= this._w || y >= this._h) return
        const d = this._ctx.getImageData(x, y, 1, 1).data
        const hex = `#${[d[0]!, d[1]!, d[2]!].map(v => v.toString(16).padStart(2, '0')).join('')}`
        if (primary) { this._primary = hex; this._sw_primary.style.background = hex }
        else         { this._secondary = hex; this._sw_secondary.style.background = hex }
        this._use_color(hex)
    }

    private _flood(x: number, y: number): void {
        if (x < 0 || y < 0 || x >= this._w || y >= this._h) return
        const img = this._ctx.getImageData(0, 0, this._w, this._h)
        const data = img.data
        const at = (i: number): RGBA => [data[i]!, data[i + 1]!, data[i + 2]!, data[i + 3]!]
        const target = at((y * this._w + x) * 4)
        const fill = this._erasing ? [0, 0, 0, 0] as RGBA : _hex(this._draw_color)
        if (_eq(target, fill)) return
        const stack: [number, number][] = [[x, y]]
        while (stack.length) {
            const [cx, cy] = stack.pop()!
            if (cx < 0 || cy < 0 || cx >= this._w || cy >= this._h) continue
            const i = (cy * this._w + cx) * 4
            if (!_eq(at(i), target)) continue
            data[i] = fill[0]; data[i + 1] = fill[1]; data[i + 2] = fill[2]; data[i + 3] = fill[3]
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
        }
        this._ctx.putImageData(img, 0, 0)
        this._redraw()
    }

    // ── Undo / redo ────────────────────────────────────────────────────────────

    private _snapshot(): void {
        this._undo.push(this._ctx.getImageData(0, 0, this._w, this._h))
        if (this._undo.length > MAX_UNDO) this._undo.shift()
        this._redo = []
    }
    private _undo_op(): void {
        const prev = this._undo.pop(); if (!prev) return
        this._redo.push(this._ctx.getImageData(0, 0, this._w, this._h))
        this._ctx.putImageData(prev, 0, 0); this._redraw()
    }
    private _redo_op(): void {
        const next = this._redo.pop(); if (!next) return
        this._undo.push(this._ctx.getImageData(0, 0, this._w, this._h))
        this._ctx.putImageData(next, 0, 0); this._redraw()
    }

    // ── Effects ────────────────────────────────────────────────────────────────

    private _effect(kind: string): void {
        this._snapshot()
        const tmp = document.createElement('canvas'); tmp.width = this._w; tmp.height = this._h
        const tctx = tmp.getContext('2d')!
        tctx.imageSmoothingEnabled = false
        if (kind === 'fliph')      { tctx.translate(this._w, 0); tctx.scale(-1, 1); tctx.drawImage(this._canvas, 0, 0); this._blit(tmp) }
        else if (kind === 'flipv') { tctx.translate(0, this._h); tctx.scale(1, -1); tctx.drawImage(this._canvas, 0, 0); this._blit(tmp) }
        else if (kind === 'rotcw' || kind === 'rotccw') {
            tctx.translate(this._w / 2, this._h / 2)
            tctx.rotate((kind === 'rotcw' ? 90 : -90) * Math.PI / 180)
            tctx.drawImage(this._canvas, -this._w / 2, -this._h / 2)
            this._blit(tmp)
        } else if (kind === 'clear') {
            this._ctx.clearRect(0, 0, this._w, this._h)
        } else if (kind === 'invert' || kind === 'gray') {
            const img = this._ctx.getImageData(0, 0, this._w, this._h); const d = img.data
            for (let i = 0; i < d.length; i += 4) {
                if (kind === 'invert') { d[i] = 255 - d[i]!; d[i + 1] = 255 - d[i + 1]!; d[i + 2] = 255 - d[i + 2]! }
                else { const g = Math.round(0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!); d[i] = d[i + 1] = d[i + 2] = g }
            }
            this._ctx.putImageData(img, 0, 0)
        }
        this._redraw()
    }

    private _blit(src: HTMLCanvasElement): void {
        this._ctx.clearRect(0, 0, this._w, this._h)
        this._ctx.drawImage(src, 0, 0)
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    private _redraw(): void {
        const z = this._zoom
        this._dctx.clearRect(0, 0, this._display.width, this._display.height)
        // Transparency checkerboard
        for (let y = 0; y < this._h; y++) for (let x = 0; x < this._w; x++) {
            this._dctx.fillStyle = (x + y) % 2 === 0 ? '#e8e8e8' : '#bcbcbc'
            this._dctx.fillRect(x * z, y * z, z, z)
        }
        this._dctx.imageSmoothingEnabled = false
        this._dctx.drawImage(this._canvas, 0, 0, this._w * z, this._h * z)

        // Shape preview overlay
        if (this._preview) {
            for (let y = 0; y < this._h; y++) for (let x = 0; x < this._w; x++) {
                const c = this._preview[y * this._w + x]
                if (!c) continue
                if (c[3] === 0) { this._dctx.fillStyle = '#e8e8e8'; this._dctx.globalAlpha = 0.5; this._dctx.fillRect(x * z, y * z, z, z); this._dctx.globalAlpha = 1 }
                else { this._dctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},1)`; this._dctx.fillRect(x * z, y * z, z, z) }
            }
        }

        // Optional faint per-pixel grid (subtle reference; only worth showing when zoomed in).
        if (this._pixel_grid && z >= 4) {
            this._line_grid(1, 'rgba(128,128,128,0.25)')
        }
        // Configurable overlay grid (spacing + colour) — visible, never per-pixel-dense by default.
        if (this._grid_size >= 1) {
            this._line_grid(this._grid_size, this._grid_color)
        }
    }

    /** Draws grid lines every `step` pixels in `color` across the display canvas. */
    private _line_grid(step: number, color: string): void {
        const z = this._zoom
        this._dctx.strokeStyle = color
        this._dctx.lineWidth = 1
        for (let x = 0; x <= this._w; x += step) { this._dctx.beginPath(); this._dctx.moveTo(x * z + 0.5, 0); this._dctx.lineTo(x * z + 0.5, this._h * z); this._dctx.stroke() }
        for (let y = 0; y <= this._h; y += step) { this._dctx.beginPath(); this._dctx.moveTo(0, y * z + 0.5); this._dctx.lineTo(this._w * z, y * z + 0.5); this._dctx.stroke() }
    }

    private _save(): void {
        this._on_save(this._canvas.toDataURL('image/png'))
        this._win.close()
    }
}

// =========================================================================
// Helpers
// =========================================================================

function _fit_zoom(w: number, h: number): number {
    return Math.max(2, Math.min(20, Math.floor(Math.min(640 / w, 480 / h)) || 1))
}

function _tbtn(icon: string, title: string, cb: () => void): HTMLElement {
    const b = document.createElement('button')
    b.innerHTML = icon; b.title = title
    b.style.cssText = 'width:28px; height:28px; cursor:pointer; border:1px solid var(--sw-border2); background:var(--sw-chrome2); color:var(--sw-text); padding:0; display:flex; align-items:center; justify-content:center;'
    const svg = b.querySelector('svg'); if (svg) { svg.setAttribute('width', '17'); svg.setAttribute('height', '17') }
    b.addEventListener('click', cb)
    return b
}

function _sep(): HTMLElement {
    const s = document.createElement('div')
    s.style.cssText = 'width:1px; height:22px; background:var(--sw-border2); margin:0 4px;'
    return s
}

function _swatch(color: string, title: string, cb: () => void): HTMLElement {
    const s = document.createElement('div')
    s.title = title
    s.style.cssText = `width:18px; height:18px; background:${color}; border:1px solid #000; cursor:pointer; box-shadow:0 0 0 1px var(--sw-border2);`
    s.addEventListener('click', cb)
    return s
}

function _hex(hex: string): RGBA {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255]
}
function _eq(a: RGBA, b: RGBA): boolean { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] }

/** Bresenham line pixels from (x0,y0) to (x1,y1), inclusive. */
function _line(x0: number, y0: number, x1: number, y1: number): [number, number][] {
    const pts: [number, number][] = []
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
        pts.push([x0, y0])
        if (x0 === x1 && y0 === y1) break
        const e2 = 2 * err
        if (e2 >= dy) { err += dy; x0 += sx }
        if (e2 <= dx) { err += dx; y0 += sy }
    }
    return pts
}

/** Rectangle pixels (outline or filled) spanning the two corners. */
function _rect(x0: number, y0: number, x1: number, y1: number, fill: boolean): [number, number][] {
    const l = Math.min(x0, x1), r = Math.max(x0, x1), t = Math.min(y0, y1), b = Math.max(y0, y1)
    const pts: [number, number][] = []
    for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) {
        if (fill || x === l || x === r || y === t || y === b) pts.push([x, y])
    }
    return pts
}

/** Midpoint-ellipse pixels (outline or filled) inscribed in the two-corner box. */
function _ellipse(x0: number, y0: number, x1: number, y1: number, fill: boolean): [number, number][] {
    const l = Math.min(x0, x1), r = Math.max(x0, x1), t = Math.min(y0, y1), b = Math.max(y0, y1)
    const cx = (l + r) / 2, cy = (t + b) / 2
    const rx = Math.max(0.5, (r - l) / 2), ry = Math.max(0.5, (b - t) / 2)
    const pts: [number, number][] = []
    for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) {
        const nx = (x - cx) / rx, ny = (y - cy) / ry
        if (nx * nx + ny * ny > 1) continue          // outside the ellipse
        if (fill) { pts.push([x, y]); continue }
        const edge = ((x - cx + 1) / rx) ** 2 + ny * ny > 1 || ((x - cx - 1) / rx) ** 2 + ny * ny > 1
                  || nx * nx + ((y - cy + 1) / ry) ** 2 > 1 || nx * nx + ((y - cy - 1) / ry) ** 2 > 1
        if (edge) pts.push([x, y])
    }
    return pts
}
