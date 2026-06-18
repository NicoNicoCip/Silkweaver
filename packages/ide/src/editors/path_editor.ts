/**
 * Path editor window.
 * Visual canvas editor for GMS-style paths (line or smooth curve, open or closed).
 */

import { FloatingWindow }                                from '../window_manager.js'
import { ICON } from "../icons.js"
import { project_read_file, project_write_file, project_has_folder } from '../services/project.js'

// =========================================================================
// Types
// =========================================================================

interface path_point {
    x:  number
    y:  number
    sp: number   // speed factor at this point (0–1 in GMS convention, default 100)
}

type path_kind = 'linear' | 'smooth'

interface path_data {
    kind:     path_kind
    closed:   boolean
    points:   path_point[]
    ref_room?: string   // editor-only: a room to show as a backdrop (ignored at runtime)
}

/** Subset of a room used as the path editor's backdrop reference. */
interface ref_room_data {
    width:          number
    height:         number
    bg_color:       string
    bg_show_color:  boolean
    instances:      { x: number; y: number; object_name: string }[]
}

// =========================================================================
// Constants
// =========================================================================

const GRID = 16       // pixel snap grid on canvas
const PT_R =  6       // point handle radius (px)

// =========================================================================
// Module state
// =========================================================================

const _open_editors = new Map<string, path_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a Path editor window for the given resource.
 * @param workspace - The IDE workspace element to mount into
 * @param path_name - Resource name
 */
export function path_editor_open(workspace: HTMLElement, path_name: string): void {
    const existing = _open_editors.get(path_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new path_editor_window(workspace, path_name)
    _open_editors.set(path_name, ed)
    ed.on_closed(() => _open_editors.delete(path_name))
}

// =========================================================================
// Editor window
// =========================================================================

class path_editor_window {
    private _win:     FloatingWindow
    private _name:    string
    private _data:    path_data
    private _canvas!: HTMLCanvasElement
    private _ctx!:    CanvasRenderingContext2D

    // Canvas interaction state
    private _drag_idx:     number   = -1   // index of dragged point, -1 = none
    private _sel_idx:      number   = -1   // selected point index
    private _pan_x:        number   = 0
    private _pan_y:        number   = 0
    private _zoom:         number   = 1
    private _panning:      boolean  = false
    private _pan_start_x:  number   = 0
    private _pan_start_y:  number   = 0
    private _pan_origin_x: number   = 0
    private _pan_origin_y: number   = 0
    private _first_resize: boolean  = true  // center origin on first layout

    // Reference-room backdrop
    private _ref_room_data: ref_room_data | null = null
    private _room_sel!:      HTMLSelectElement

    // ResizeObserver
    private _ro!: ResizeObserver

    constructor(workspace: HTMLElement, name: string) {
        this._name = name
        this._data = { kind: 'linear', closed: false, points: [] }

        this._win = new FloatingWindow(
            `path-${name}`, `Path: ${name}`, ICON.path,
            { x: 250, y: 110, w: 600, h: 460 }
        )
        this._build_ui()
        this._win.mount(workspace)
        this._load_data()
    }

    public bring_to_front(): void { this._win.bring_to_front() }
    public on_closed(cb: () => void): void {
        this._win.on_close(() => { this._ro.disconnect(); cb() })
    }

    // -----------------------------------------------------------------------
    // Build UI
    // -----------------------------------------------------------------------

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

        // Toolbar
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'

        const kind_sel = this._make_select(
            ['linear', 'smooth'], this._data.kind,
            (v) => { this._data.kind = v as path_kind; this._draw(); this._save() }
        )
        toolbar.appendChild(this._make_label_wrap('Kind:', kind_sel))

        toolbar.appendChild(this._make_checkbox_inline('Closed', this._data.closed,
            (v) => { this._data.closed = v; this._draw(); this._save() }))

        // Reference-room backdrop picker (so spatial routes can be traced over a level).
        this._room_sel = document.createElement('select')
        this._room_sel.className = 'sw-select'
        const none = document.createElement('option'); none.value = ''; none.textContent = '(none)'
        this._room_sel.appendChild(none)
        this._room_sel.addEventListener('change', () => this._select_ref_room(this._room_sel.value))
        toolbar.appendChild(this._make_label_wrap('Room:', this._room_sel))

        const clear_btn = document.createElement('button')
        clear_btn.className = 'sw-btn'
        clear_btn.textContent = 'Clear'
        clear_btn.addEventListener('click', () => {
            this._data.points = []; this._sel_idx = -1; this._draw(); this._save()
        })
        toolbar.appendChild(clear_btn)

        const del_pt_btn = document.createElement('button')
        del_pt_btn.className = 'sw-btn'
        del_pt_btn.textContent = 'Del Point'
        del_pt_btn.addEventListener('click', () => {
            if (this._sel_idx < 0) return
            this._data.points.splice(this._sel_idx, 1)
            this._sel_idx = Math.min(this._sel_idx, this._data.points.length - 1)
            this._draw(); this._save()
        })
        toolbar.appendChild(del_pt_btn)

        body.appendChild(toolbar)

        // Canvas
        const wrapper = document.createElement('div')
        wrapper.style.cssText = 'flex:1;position:relative;overflow:hidden;background:#1a1a1a;'
        const canvas = document.createElement('canvas')
        canvas.style.cssText = 'display:block;'
        this._canvas = canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        this._ctx = ctx
        wrapper.appendChild(canvas)
        body.appendChild(wrapper)

        // Resize observer
        this._ro = new ResizeObserver(() => this._resize_canvas(wrapper))
        this._ro.observe(wrapper)

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this._on_mouse_down(e))
        canvas.addEventListener('mousemove', (e) => this._on_mouse_move(e))
        canvas.addEventListener('mouseup',   (e) => this._on_mouse_up(e))
        canvas.addEventListener('wheel',     (e) => this._on_wheel(e),    { passive: false })
        canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    // -----------------------------------------------------------------------
    // Canvas resize
    // -----------------------------------------------------------------------

    private _resize_canvas(wrapper: HTMLElement): void {
        const w = wrapper.clientWidth
        const h = wrapper.clientHeight
        this._canvas.width  = w
        this._canvas.height = h
        if (this._first_resize) {
            // Center origin (0,0) in the viewport on first layout
            this._pan_x = Math.floor(w / 2)
            this._pan_y = Math.floor(h / 2)
            this._first_resize = false
        }
        this._draw()
    }

    // -----------------------------------------------------------------------
    // Drawing
    // -----------------------------------------------------------------------

    private _draw(): void {
        const ctx = this._ctx
        const W = this._canvas.width
        const H = this._canvas.height
        if (W === 0 || H === 0) return

        ctx.clearRect(0, 0, W, H)

        // Grid
        ctx.strokeStyle = '#2a2a2a'
        ctx.lineWidth = 1
        const gs = GRID * this._zoom
        const ox  = ((this._pan_x % gs) + gs) % gs
        const oy  = ((this._pan_y % gs) + gs) % gs
        for (let x = ox; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
        for (let y = oy; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

        // Origin cross
        const ox2 = this._pan_x
        const oy2 = this._pan_y
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(ox2, 0);  ctx.lineTo(ox2, H); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0,  oy2); ctx.lineTo(W,  oy2); ctx.stroke()

        // Reference-room backdrop (drawn before the early-return so it shows with no points yet).
        this._draw_ref_room(ctx)

        const pts = this._data.points
        if (pts.length === 0) return

        // Transform points to screen
        const to_screen = (pt: path_point) => ({
            sx: this._pan_x + pt.x * this._zoom,
            sy: this._pan_y + pt.y * this._zoom,
        })

        // Path lines
        ctx.beginPath()
        ctx.strokeStyle = '#00ccff'
        ctx.lineWidth = 2

        if (this._data.kind === 'smooth' && pts.length >= 2) {
            // Midpoint-quadratic smoothing: the curve passes through the midpoints of each
            // segment, using each point as a control handle.
            const sp = pts.map(to_screen)
            const n  = sp.length
            const mid = (a: { sx: number; sy: number }, b: { sx: number; sy: number }) => ({ x: (a.sx + b.sx) / 2, y: (a.sy + b.sy) / 2 })

            if (this._data.closed) {
                // Fully smooth loop — wrap around so the first/last points are smoothed too.
                const start = mid(sp[n - 1]!, sp[0]!)
                ctx.moveTo(start.x, start.y)
                for (let i = 0; i < n; i++) {
                    const cur = sp[i]!, next = sp[(i + 1) % n]!
                    const m = mid(cur, next)
                    ctx.quadraticCurveTo(cur.sx, cur.sy, m.x, m.y)
                }
            } else {
                // Open curve — endpoints stay as anchors (corners), interior is smoothed.
                ctx.moveTo(sp[0]!.sx, sp[0]!.sy)
                for (let i = 1; i < n - 1; i++) {
                    const cur = sp[i]!, next = sp[i + 1]!
                    const m = mid(cur, next)
                    ctx.quadraticCurveTo(cur.sx, cur.sy, m.x, m.y)
                }
                ctx.quadraticCurveTo(sp[n - 1]!.sx, sp[n - 1]!.sy, sp[n - 1]!.sx, sp[n - 1]!.sy)
            }
        } else {
            const s = to_screen(pts[0]!)
            ctx.moveTo(s.sx, s.sy)
            for (let i = 1; i < pts.length; i++) {
                const p = to_screen(pts[i]!)
                ctx.lineTo(p.sx, p.sy)
            }
            if (this._data.closed && pts.length > 1) {
                const first = to_screen(pts[0]!)
                ctx.lineTo(first.sx, first.sy)
            }
        }
        ctx.stroke()

        // Point handles
        pts.forEach((pt, idx) => {
            const { sx, sy } = to_screen(pt)
            ctx.beginPath()
            ctx.arc(sx, sy, PT_R, 0, Math.PI * 2)
            ctx.fillStyle = idx === this._sel_idx ? '#ffcc00' : '#ffffff'
            ctx.fill()
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 1
            ctx.stroke()
        })
    }

    // -----------------------------------------------------------------------
    // Mouse interactions
    // -----------------------------------------------------------------------

    private _canvas_to_world(cx: number, cy: number): { x: number; y: number } {
        return {
            x: (cx - this._pan_x) / this._zoom,
            y: (cy - this._pan_y) / this._zoom,
        }
    }

    private _hit_point(cx: number, cy: number): number {
        for (let i = 0; i < this._data.points.length; i++) {
            const pt  = this._data.points[i]!
            const sx  = this._pan_x + pt.x * this._zoom
            const sy  = this._pan_y + pt.y * this._zoom
            const dx  = cx - sx
            const dy  = cy - sy
            if (dx * dx + dy * dy <= (PT_R + 2) * (PT_R + 2)) return i
        }
        return -1
    }

    private _on_mouse_down(e: MouseEvent): void {
        const cx = e.offsetX
        const cy = e.offsetY

        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            // Middle button or alt+left = pan
            this._panning = true
            this._pan_start_x  = e.clientX
            this._pan_start_y  = e.clientY
            this._pan_origin_x = this._pan_x
            this._pan_origin_y = this._pan_y
            e.preventDefault()
            return
        }

        if (e.button === 0) {
            const hit = this._hit_point(cx, cy)
            if (hit >= 0) {
                this._drag_idx = hit
                this._sel_idx  = hit
                this._draw()
            } else {
                // Add new point snapped to grid
                const w = this._canvas_to_world(cx, cy)
                const snapped: path_point = {
                    x:  Math.round(w.x / GRID) * GRID,
                    y:  Math.round(w.y / GRID) * GRID,
                    sp: 100,
                }
                this._data.points.push(snapped)
                this._sel_idx = this._data.points.length - 1
                this._draw()
                this._save()
            }
        }
    }

    private _on_mouse_move(e: MouseEvent): void {
        if (this._panning) {
            this._pan_x = this._pan_origin_x + (e.clientX - this._pan_start_x)
            this._pan_y = this._pan_origin_y + (e.clientY - this._pan_start_y)
            this._draw()
            return
        }
        if (this._drag_idx >= 0) {
            const w = this._canvas_to_world(e.offsetX, e.offsetY)
            const pt = this._data.points[this._drag_idx]!
            pt.x = Math.round(w.x / GRID) * GRID
            pt.y = Math.round(w.y / GRID) * GRID
            this._draw()
        }
    }

    private _on_mouse_up(_e: MouseEvent): void {
        if (this._panning) { this._panning = false; return }
        if (this._drag_idx >= 0) {
            this._drag_idx = -1
            this._save()
        }
    }

    private _on_wheel(e: WheelEvent): void {
        e.preventDefault()
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
        const new_zoom = Math.max(0.125, Math.min(8, this._zoom * factor))
        // Zoom toward cursor
        const cx = e.offsetX
        const cy = e.offsetY
        this._pan_x = cx - (cx - this._pan_x) * (new_zoom / this._zoom)
        this._pan_y = cy - (cy - this._pan_y) * (new_zoom / this._zoom)
        this._zoom  = new_zoom
        this._draw()
    }

    // -----------------------------------------------------------------------
    // Helpers — toolbar widgets
    // -----------------------------------------------------------------------

    private _make_select(options: string[], current: string, cb: (v: string) => void): HTMLSelectElement {
        const sel = document.createElement('select')
        sel.className = 'sw-select'
        for (const opt of options) {
            const o = document.createElement('option')
            o.value = o.textContent = opt
            if (opt === current) o.selected = true
            sel.appendChild(o)
        }
        sel.addEventListener('change', () => cb(sel.value))
        return sel
    }

    private _make_label_wrap(text: string, control: HTMLElement): HTMLElement {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'display:flex;align-items:center;gap:4px;'
        const lbl = document.createElement('span')
        lbl.style.cssText = 'font-size:11px;color:var(--sw-text-dim);'
        lbl.textContent = text
        wrap.append(lbl, control)
        return wrap
    }

    private _make_checkbox_inline(label: string, checked: boolean, cb: (v: boolean) => void): HTMLElement {
        const lbl = document.createElement('label')
        lbl.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;'
        const chk = document.createElement('input')
        chk.type = 'checkbox'
        chk.className = 'sw-checkbox'
        chk.checked = checked
        chk.addEventListener('change', () => cb(chk.checked))
        lbl.append(chk, document.createTextNode(label))
        return lbl
    }

    // -----------------------------------------------------------------------
    // Reference-room backdrop
    // -----------------------------------------------------------------------

    /** Fills the Room dropdown from the project's rooms and restores the current selection. */
    private async _populate_room_options(): Promise<void> {
        while (this._room_sel.options.length > 1) this._room_sel.remove(1)   // keep "(none)"
        try {
            const proj = JSON.parse(await project_read_file('project.json')) as { resources?: { rooms?: Record<string, unknown> } }
            for (const r of Object.keys(proj.resources?.rooms ?? {}).sort()) {
                const o = document.createElement('option'); o.value = r; o.textContent = r
                this._room_sel.appendChild(o)
            }
        } catch { /* no project.json */ }
        this._room_sel.value = this._data.ref_room ?? ''
    }

    private async _select_ref_room(name: string): Promise<void> {
        if (name) this._data.ref_room = name
        else      delete this._data.ref_room
        if (name) await this._load_ref_room_data(name)
        else      this._ref_room_data = null
        this._draw()
        this._save()
    }

    /** Loads a room's geometry (size, bg colour, instance positions) for the backdrop. */
    private async _load_ref_room_data(name: string): Promise<void> {
        try {
            const rm = JSON.parse(await project_read_file(`rooms/${name}/room.json`)) as any
            this._ref_room_data = {
                width:         rm.width ?? 640,
                height:        rm.height ?? 480,
                bg_color:      rm.bg_color ?? '#000000',
                bg_show_color: rm.bg_show_color ?? true,
                instances:     Array.isArray(rm.instances)
                    ? rm.instances.map((i: any) => ({ x: i.x ?? 0, y: i.y ?? 0, object_name: i.object_name ?? '' }))
                    : [],
            }
        } catch { this._ref_room_data = null }
    }

    /** Renders the reference room (dimmed) behind the path: bounds, bg colour, instances. */
    private _draw_ref_room(ctx: CanvasRenderingContext2D): void {
        const r = this._ref_room_data
        if (!r) return
        const z = this._zoom
        const sx = (x: number) => this._pan_x + x * z
        const sy = (y: number) => this._pan_y + y * z
        ctx.save()
        if (r.bg_show_color) {
            ctx.globalAlpha = 0.45; ctx.fillStyle = r.bg_color || '#000000'
            ctx.fillRect(sx(0), sy(0), r.width * z, r.height * z); ctx.globalAlpha = 1
        }
        ctx.strokeStyle = 'rgba(120,160,230,0.9)'; ctx.lineWidth = 1
        ctx.strokeRect(sx(0), sy(0), r.width * z, r.height * z)
        const hw = 14 * z
        for (const inst of r.instances) {
            const cx = sx(inst.x), cy = sy(inst.y)
            ctx.fillStyle = 'rgba(70,70,160,0.30)'; ctx.fillRect(cx - hw, cy - hw, hw * 2, hw * 2)
            ctx.strokeStyle = 'rgba(140,140,220,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(cx - hw, cy - hw, hw * 2, hw * 2)
            if (z >= 0.4 && inst.object_name) {
                ctx.fillStyle = 'rgba(210,210,255,0.85)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
                ctx.fillText(inst.object_name.length > 9 ? inst.object_name.slice(0, 8) + '…' : inst.object_name, cx, cy)
            }
        }
        ctx.restore()
    }

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    private async _load_data(): Promise<void> {
        try {
            const raw = await project_read_file(`paths/${this._name}/path.json`)
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<path_data>
                if (parsed.kind)   this._data.kind   = parsed.kind
                if (parsed.closed !== undefined) this._data.closed = parsed.closed
                if (Array.isArray(parsed.points)) this._data.points = parsed.points
                if (parsed.ref_room) this._data.ref_room = parsed.ref_room
            }
        } catch { /* no saved data yet */ }
        await this._populate_room_options()
        if (this._data.ref_room) await this._load_ref_room_data(this._data.ref_room)
        this._draw()
    }

    private async _save(): Promise<void> {
        if (!project_has_folder()) return
        await project_write_file(
            `paths/${this._name}/path.json`,
            JSON.stringify(this._data, null, 2)
        )
    }
}
