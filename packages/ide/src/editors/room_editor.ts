/**
 * Room editor window.
 * Canvas-based placement of instances, view config, background layers, room settings.
 */

import { FloatingWindow }                                          from '../window_manager.js'
import { project_read_file, project_write_file }                   from '../services/project.js'

// =========================================================================
// Types
// =========================================================================

interface room_instance {
    id:          number    // unique within this room
    object_name: string
    x:           number
    y:           number
    scale_x:     number
    scale_y:     number
    rotation:    number
    creation_code: string
}

interface room_background_layer {
    enabled:    boolean
    bg_name:    string    // background resource name
    tile_x:     boolean
    tile_y:     boolean
    stretch:    boolean
    visible_in_editor: boolean
}

interface room_view {
    enabled:   boolean
    view_x:    number
    view_y:    number
    view_w:    number
    view_h:    number
    port_x:    number
    port_y:    number
    port_w:    number
    port_h:    number
    follow:    string   // object name to follow, or ""
}

interface room_data {
    width:       number
    height:      number
    room_speed:  number
    persistent:  boolean
    creation_code: string
    instances:   room_instance[]
    backgrounds: room_background_layer[]
    views:       room_view[]
    physics_world:     boolean
    physics_gravity_x: number
    physics_gravity_y: number
}

type tool_mode = 'select' | 'place' | 'delete'
type panel_tab = 'settings' | 'instances' | 'views' | 'backgrounds' | 'physics'

// =========================================================================
// Deduplication
// =========================================================================

const _open_editors = new Map<string, room_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a room editor for the given room resource name.
 */
export function room_editor_open(
    workspace: HTMLElement,
    room_name: string,
): void {
    const existing = _open_editors.get(room_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new room_editor_window(workspace, room_name)
    _open_editors.set(room_name, ed)
    ed.on_closed(() => _open_editors.delete(room_name))
}

// =========================================================================
// room_editor_window
// =========================================================================

let _next_offset   = 0
let _next_inst_id  = 1

const GRID = 16          // default snap grid size
const MIN_ZOOM = 0.125
const MAX_ZOOM = 8

class room_editor_window {
    private _win:       FloatingWindow
    private _data:      room_data
    private _room_name: string

    // Canvas
    private _canvas:  HTMLCanvasElement
    private _ctx:     CanvasRenderingContext2D
    private _zoom     = 1
    private _pan_x    = 0
    private _pan_y    = 0

    // Tool state
    private _tool:         tool_mode = 'place'
    private _place_object  = ''
    private _selected_inst: room_instance | null = null

    // Drag state
    private _drag_inst:   room_instance | null = null
    private _drag_ox      = 0
    private _drag_oy      = 0

    // Pan state
    private _panning    = false
    private _pan_start  = { mx: 0, my: 0, px: 0, py: 0 }

    private _snap_grid  = GRID
    private _show_grid  = true

    private _panel_tab: panel_tab = 'instances'
    private _panel_el:  HTMLElement = document.createElement('div')

    private _on_closed_cb: (() => void) | null = null

    constructor(workspace: HTMLElement, room_name: string) {
        this._room_name = room_name

        const off = (_next_offset++ % 6) * 24
        this._win = new FloatingWindow(
            `room-editor-${room_name}`,
            `Room: ${room_name}`,
            'icons/room.svg',
            { x: 280 + off, y: 44 + off, w: 900, h: 580 },
        )
        this._win.on_close(() => this._on_closed_cb?.())

        this._data = _default_room()

        // Canvas placeholder (replaced in _build_ui)
        this._canvas = document.createElement('canvas')
        this._ctx    = this._canvas.getContext('2d')!

        this._build_ui()
        this._load_data()
        this._win.mount(workspace)
    }

    bring_to_front(): void { this._win.bring_to_front() }
    on_closed(cb: () => void): void { this._on_closed_cb = cb }

    // ── UI ─────────────────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden;'

        // ── Toolbar ────────────────────────────────────────────────────────
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'

        // Tool buttons
        const tool_select = _tool_btn('Select',  'select',  () => this._set_tool('select'))
        const tool_place  = _tool_btn('Place',   'place',   () => this._set_tool('place'))
        const tool_delete = _tool_btn('Delete',  'delete',  () => this._set_tool('delete'))
        const tool_btns = [tool_select, tool_place, tool_delete]
        tool_btns.forEach(b => toolbar.appendChild(b))
        this._highlight_tool(tool_btns)

        // Separator
        const sep = document.createElement('div')
        sep.style.cssText = 'width:1px; background:var(--sw-border); margin:0 4px;'
        toolbar.appendChild(sep)

        // Place object input
        const place_label = document.createElement('span')
        place_label.style.cssText = 'font-size:11px; color:var(--sw-text-dim);'
        place_label.textContent = 'Object:'
        const place_inp = document.createElement('input')
        place_inp.type  = 'text'
        place_inp.className = 'sw-input'
        place_inp.style.cssText = 'width:100px;'
        place_inp.placeholder = 'obj_name'
        place_inp.value = this._place_object
        place_inp.addEventListener('input', () => { this._place_object = place_inp.value })
        toolbar.append(place_label, place_inp)

        const sep2 = document.createElement('div')
        sep2.style.cssText = 'width:1px; background:var(--sw-border); margin:0 4px;'
        toolbar.appendChild(sep2)

        // Grid toggle
        const grid_toggle = document.createElement('button')
        grid_toggle.className = 'sw-btn'
        grid_toggle.textContent = 'Grid'
        grid_toggle.title = 'Toggle grid'
        grid_toggle.style.cssText = this._show_grid ? 'background:var(--sw-accent);' : ''
        grid_toggle.addEventListener('click', () => {
            this._show_grid = !this._show_grid
            grid_toggle.style.background = this._show_grid ? 'var(--sw-accent)' : ''
            this._redraw()
        })
        toolbar.appendChild(grid_toggle)

        // Grid size
        const grid_size_inp = document.createElement('input')
        grid_size_inp.type  = 'number'
        grid_size_inp.className = 'sw-input'
        grid_size_inp.style.cssText = 'width:48px;'
        grid_size_inp.value = String(this._snap_grid)
        grid_size_inp.min   = '1'
        grid_size_inp.addEventListener('change', () => {
            this._snap_grid = Math.max(1, parseInt(grid_size_inp.value) || GRID)
            this._redraw()
        })
        toolbar.append(grid_size_inp)

        // Zoom
        const zoom_out = _icon_tool_btn('−', () => this._adjust_zoom(-0.25))
        const zoom_lbl = document.createElement('span')
        zoom_lbl.style.cssText = 'font-size:11px; min-width:36px; text-align:center;'
        zoom_lbl.textContent = '100%'
        const zoom_in  = _icon_tool_btn('+', () => this._adjust_zoom(+0.25))
        toolbar.append(zoom_out, zoom_lbl, zoom_in)

        body.appendChild(toolbar)

        // ── Main split ─────────────────────────────────────────────────────
        const main = document.createElement('div')
        main.style.cssText = 'display:flex; flex:1; overflow:hidden;'
        body.appendChild(main)

        // Canvas area
        const canvas_wrap = document.createElement('div')
        canvas_wrap.style.cssText = 'flex:1; overflow:hidden; position:relative; background:#1a1a1a;'
        this._canvas = document.createElement('canvas')
        this._canvas.style.cssText = 'display:block;'
        this._ctx    = this._canvas.getContext('2d')!
        canvas_wrap.appendChild(this._canvas)
        main.appendChild(canvas_wrap)

        // Resize canvas to fill its wrapper
        const ro = new ResizeObserver(() => {
            this._canvas.width  = canvas_wrap.offsetWidth
            this._canvas.height = canvas_wrap.offsetHeight
            this._redraw()
        })
        ro.observe(canvas_wrap)

        // Canvas mouse events
        this._canvas.addEventListener('wheel',     (e) => { e.preventDefault(); this._on_wheel(e) }, { passive: false })
        this._canvas.addEventListener('mousedown', (e) => this._on_mouse_down(e))
        this._canvas.addEventListener('mousemove', (e) => this._on_mouse_move(e))
        this._canvas.addEventListener('mouseup',   (e) => this._on_mouse_up(e))
        this._canvas.addEventListener('contextmenu', (e) => e.preventDefault())

        // Right panel
        const right = document.createElement('div')
        right.className = 'sw-room-panel'
        right.appendChild(this._build_right_panel())
        main.appendChild(right)

        // Store zoom label ref for updates
        ;(this as any)._zoom_lbl = zoom_lbl
        ;(this as any)._tool_btns = tool_btns
    }

    private _build_right_panel(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; height:100%;'

        // Tab bar
        const tabs_el = document.createElement('div')
        tabs_el.className = 'sw-room-tabs'
        const tabs: panel_tab[] = ['settings','instances','views','backgrounds','physics']
        for (const tab of tabs) {
            const btn = document.createElement('button')
            btn.className = `sw-room-tab${tab === this._panel_tab ? ' active' : ''}`
            btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
            btn.addEventListener('click', () => {
                this._panel_tab = tab
                // Update active class
                tabs_el.querySelectorAll('.sw-room-tab').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                this._panel_el.innerHTML = ''
                this._panel_el.appendChild(this._build_panel_content())
            })
            tabs_el.appendChild(btn)
        }
        el.appendChild(tabs_el)

        this._panel_el.style.cssText = 'flex:1; overflow-y:auto;'
        this._panel_el.appendChild(this._build_panel_content())
        el.appendChild(this._panel_el)
        return el
    }

    private _build_panel_content(): HTMLElement {
        switch (this._panel_tab) {
            case 'settings':    return this._panel_settings()
            case 'instances':   return this._panel_instances()
            case 'views':       return this._panel_views()
            case 'backgrounds': return this._panel_backgrounds()
            case 'physics':     return this._panel_physics()
            default:            return _form_container()
        }
    }

    private _panel_settings(): HTMLElement {
        const el = _form_container()
        el.append(
            _num_field('Width:',       this._data.width,      (v) => { this._data.width      = v; this._redraw(); this._save() }),
            _num_field('Height:',      this._data.height,     (v) => { this._data.height     = v; this._redraw(); this._save() }),
            _num_field('Room Speed:',  this._data.room_speed, (v) => { this._data.room_speed = v; this._save() }),
            _check_field('Persistent', this._data.persistent, (v) => { this._data.persistent = v; this._save() }),
        )
        const cc_lbl = _section_hdr('Creation Code')
        const cc_area = document.createElement('textarea')
        cc_area.className = 'sw-input'
        cc_area.style.cssText = 'width:100%; height:80px; font-family:monospace; font-size:11px; resize:vertical;'
        cc_area.value = this._data.creation_code
        cc_area.addEventListener('change', () => { this._data.creation_code = cc_area.value; this._save() })
        el.append(cc_lbl, cc_area)
        return el
    }

    private _panel_instances(): HTMLElement {
        const el = _form_container()
        if (this._data.instances.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;'
            empty.textContent = 'No instances.\nUse "Place" tool on the canvas.'
            el.appendChild(empty)
            return el
        }
        for (const inst of this._data.instances) {
            const row = document.createElement('div')
            row.className = `sw-room-inst-row${inst === this._selected_inst ? ' selected' : ''}`
            const lbl = document.createElement('span')
            lbl.style.cssText = 'flex:1; font-size:11px;'
            lbl.textContent = `${inst.object_name} (${inst.x}, ${inst.y})`
            const del_btn = document.createElement('button')
            del_btn.className = 'sw-window-btn close'
            del_btn.style.cssText = 'width:16px; height:16px; font-size:9px;'
            del_btn.textContent = '✕'
            del_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this._delete_instance(inst)
            })
            row.append(lbl, del_btn)
            row.addEventListener('click', () => {
                this._selected_inst = inst
                this._rebuild_instances_panel()
                this._redraw()
            })
            el.appendChild(row)
        }
        return el
    }

    private _rebuild_instances_panel(): void {
        if (this._panel_tab !== 'instances') return
        this._panel_el.innerHTML = ''
        this._panel_el.appendChild(this._panel_instances())
    }

    private _panel_views(): HTMLElement {
        const el = _form_container()
        el.appendChild(_section_hdr(`Views (${this._data.views.length})`))

        // Add view button
        const add_btn = document.createElement('button')
        add_btn.className = 'sw-btn'
        add_btn.style.cssText = 'font-size:10px; margin-bottom:4px;'
        add_btn.textContent = '+ Add View'
        add_btn.addEventListener('click', () => {
            this._data.views.push(_default_view())
            this._panel_el.innerHTML = ''
            this._panel_el.appendChild(this._panel_views())
            this._save()
        })
        el.appendChild(add_btn)

        this._data.views.forEach((view, i) => {
            const vw = document.createElement('details')
            vw.style.cssText = 'border:1px solid var(--sw-border2); padding:4px; margin-bottom:4px;'
            const summary = document.createElement('summary')
            summary.style.cssText = 'font-size:11px; cursor:pointer;'
            summary.textContent = `View ${i}${view.enabled ? '' : ' (disabled)'}`
            vw.appendChild(summary)
            vw.append(
                _check_field('Enabled',  view.enabled,  (v) => { view.enabled  = v; summary.textContent = `View ${i}${v ? '' : ' (disabled)'}` ; this._save() }),
                _num_field('View X:',  view.view_x,  (v) => { view.view_x  = v; this._save() }),
                _num_field('View Y:',  view.view_y,  (v) => { view.view_y  = v; this._save() }),
                _num_field('View W:',  view.view_w,  (v) => { view.view_w  = v; this._save() }),
                _num_field('View H:',  view.view_h,  (v) => { view.view_h  = v; this._save() }),
                _num_field('Port X:',  view.port_x,  (v) => { view.port_x  = v; this._save() }),
                _num_field('Port Y:',  view.port_y,  (v) => { view.port_y  = v; this._save() }),
                _num_field('Port W:',  view.port_w,  (v) => { view.port_w  = v; this._save() }),
                _num_field('Port H:',  view.port_h,  (v) => { view.port_h  = v; this._save() }),
            )
            const follow_row = _text_field('Follow:', view.follow, (v) => { view.follow = v; this._save() })
            vw.appendChild(follow_row)

            const del_btn = document.createElement('button')
            del_btn.className = 'sw-btn'
            del_btn.style.cssText = 'font-size:10px; margin-top:4px;'
            del_btn.textContent = 'Remove View'
            del_btn.addEventListener('click', () => {
                this._data.views.splice(i, 1)
                this._panel_el.innerHTML = ''
                this._panel_el.appendChild(this._panel_views())
                this._save()
            })
            vw.appendChild(del_btn)
            el.appendChild(vw)
        })
        return el
    }

    private _panel_backgrounds(): HTMLElement {
        const el = _form_container()
        el.appendChild(_section_hdr(`Background Layers (${this._data.backgrounds.length})`))

        const add_btn = document.createElement('button')
        add_btn.className = 'sw-btn'
        add_btn.style.cssText = 'font-size:10px; margin-bottom:4px;'
        add_btn.textContent = '+ Add Layer'
        add_btn.addEventListener('click', () => {
            this._data.backgrounds.push(_default_bg_layer())
            this._panel_el.innerHTML = ''
            this._panel_el.appendChild(this._panel_backgrounds())
            this._save()
        })
        el.appendChild(add_btn)

        this._data.backgrounds.forEach((layer, i) => {
            const bg = document.createElement('details')
            bg.style.cssText = 'border:1px solid var(--sw-border2); padding:4px; margin-bottom:4px;'
            const summary = document.createElement('summary')
            summary.style.cssText = 'font-size:11px; cursor:pointer;'
            summary.textContent = `BG ${i}: ${layer.bg_name || '(none)'}`
            bg.appendChild(summary)
            bg.append(
                _check_field('Enabled', layer.enabled, (v) => { layer.enabled = v; this._save() }),
                _text_field('Resource:', layer.bg_name, (v) => { layer.bg_name = v; summary.textContent = `BG ${i}: ${v || '(none)'}` ; this._save() }),
                _check_field('Tile X',  layer.tile_x,  (v) => { layer.tile_x  = v; this._save() }),
                _check_field('Tile Y',  layer.tile_y,  (v) => { layer.tile_y  = v; this._save() }),
                _check_field('Stretch', layer.stretch, (v) => { layer.stretch = v; this._save() }),
            )
            const del_btn = document.createElement('button')
            del_btn.className = 'sw-btn'
            del_btn.style.cssText = 'font-size:10px; margin-top:4px;'
            del_btn.textContent = 'Remove Layer'
            del_btn.addEventListener('click', () => {
                this._data.backgrounds.splice(i, 1)
                this._panel_el.innerHTML = ''
                this._panel_el.appendChild(this._panel_backgrounds())
                this._save()
            })
            bg.appendChild(del_btn)
            el.appendChild(bg)
        })
        return el
    }

    private _panel_physics(): HTMLElement {
        const el = _form_container()
        el.append(
            _check_field('Enable Physics World', this._data.physics_world, (v) => { this._data.physics_world = v; this._save() }),
            _num_field('Gravity X:', this._data.physics_gravity_x, (v) => { this._data.physics_gravity_x = v; this._save() }),
            _num_field('Gravity Y:', this._data.physics_gravity_y, (v) => { this._data.physics_gravity_y = v; this._save() }),
        )
        return el
    }

    // ── Tool management ────────────────────────────────────────────────────

    private _set_tool(mode: tool_mode): void {
        this._tool = mode
        this._selected_inst = null
        this._highlight_tool((this as any)._tool_btns ?? [])
        this._redraw()
    }

    private _highlight_tool(btns: HTMLElement[]): void {
        btns.forEach(b => {
            const is_active = b.dataset['tool'] === this._tool
            b.style.background = is_active ? 'var(--sw-accent)' : ''
        })
    }

    private _adjust_zoom(delta: number): void {
        this._zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this._zoom + delta))
        const lbl: HTMLElement = (this as any)._zoom_lbl
        if (lbl) lbl.textContent = Math.round(this._zoom * 100) + '%'
        this._redraw()
    }

    // ── Canvas events ──────────────────────────────────────────────────────

    private _on_wheel(e: WheelEvent): void {
        const delta = e.deltaY > 0 ? -0.25 : 0.25
        this._adjust_zoom(delta)
    }

    private _on_mouse_down(e: MouseEvent): void {
        const { rx, ry } = this._to_room_coords(e.clientX, e.clientY)
        const sx = this._snap(rx)
        const sy = this._snap(ry)

        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            // Middle-click or Alt+Left = pan
            this._panning = true
            this._pan_start = { mx: e.clientX, my: e.clientY, px: this._pan_x, py: this._pan_y }
            return
        }

        if (e.button === 0) {
            switch (this._tool) {
                case 'place':
                    if (!this._place_object) return
                    this._place_instance(sx, sy)
                    break
                case 'delete': {
                    const hit = this._hit_test(rx, ry)
                    if (hit) this._delete_instance(hit)
                    break
                }
                case 'select': {
                    const hit = this._hit_test(rx, ry)
                    if (hit) {
                        this._selected_inst = hit
                        this._drag_inst = hit
                        this._drag_ox   = rx - hit.x
                        this._drag_oy   = ry - hit.y
                    } else {
                        this._selected_inst = null
                        this._drag_inst = null
                    }
                    this._rebuild_instances_panel()
                    this._redraw()
                    break
                }
            }
        }

        if (e.button === 2 && this._tool === 'select') {
            // Right-click = delete selected
            const hit = this._hit_test(rx, ry)
            if (hit) this._delete_instance(hit)
        }
    }

    private _on_mouse_move(e: MouseEvent): void {
        if (this._panning) {
            this._pan_x = this._pan_start.px + (e.clientX - this._pan_start.mx)
            this._pan_y = this._pan_start.py + (e.clientY - this._pan_start.my)
            this._redraw()
            return
        }
        if (this._drag_inst) {
            const { rx, ry } = this._to_room_coords(e.clientX, e.clientY)
            this._drag_inst.x = this._snap(rx - this._drag_ox)
            this._drag_inst.y = this._snap(ry - this._drag_oy)
            this._rebuild_instances_panel()
            this._redraw()
        }
    }

    private _on_mouse_up(e: MouseEvent): void {
        if (this._panning)     { this._panning  = false; return }
        if (this._drag_inst)   { this._drag_inst = null; this._save(); return }
        if (e.button === 0 && this._tool === 'place') this._save()
    }

    // ── Instance helpers ───────────────────────────────────────────────────

    private _place_instance(x: number, y: number): void {
        const inst: room_instance = {
            id:            _next_inst_id++,
            object_name:   this._place_object,
            x, y,
            scale_x:       1,
            scale_y:       1,
            rotation:      0,
            creation_code: '',
        }
        this._data.instances.push(inst)
        this._selected_inst = inst
        this._rebuild_instances_panel()
        this._redraw()
    }

    private _delete_instance(inst: room_instance): void {
        const idx = this._data.instances.indexOf(inst)
        if (idx !== -1) this._data.instances.splice(idx, 1)
        if (this._selected_inst === inst) this._selected_inst = null
        this._rebuild_instances_panel()
        this._redraw()
        this._save()
    }

    private _hit_test(rx: number, ry: number): room_instance | null {
        // Hit test in reverse (topmost first)
        for (let i = this._data.instances.length - 1; i >= 0; i--) {
            const inst = this._data.instances[i]!
            const hw = 16
            const hh = 16
            if (rx >= inst.x - hw && rx <= inst.x + hw && ry >= inst.y - hh && ry <= inst.y + hh) {
                return inst
            }
        }
        return null
    }

    private _snap(v: number): number {
        if (this._snap_grid <= 0) return v
        return Math.round(v / this._snap_grid) * this._snap_grid
    }

    private _to_room_coords(client_x: number, client_y: number): { rx: number; ry: number } {
        const rect = this._canvas.getBoundingClientRect()
        const cx   = client_x - rect.left
        const cy   = client_y - rect.top
        const rx   = (cx - this._pan_x) / this._zoom
        const ry   = (cy - this._pan_y) / this._zoom
        return { rx, ry }
    }

    // ── Rendering ──────────────────────────────────────────────────────────

    private _redraw(): void {
        const ctx  = this._ctx
        const cw   = this._canvas.width
        const ch   = this._canvas.height

        ctx.clearRect(0, 0, cw, ch)

        ctx.save()
        ctx.translate(this._pan_x, this._pan_y)
        ctx.scale(this._zoom, this._zoom)

        // Room background
        ctx.fillStyle = '#1e1e1e'
        ctx.fillRect(0, 0, this._data.width, this._data.height)

        // Room border
        ctx.strokeStyle = '#555'
        ctx.lineWidth   = 1 / this._zoom
        ctx.strokeRect(0, 0, this._data.width, this._data.height)

        // Grid
        if (this._show_grid && this._snap_grid > 0) {
            this._draw_grid(ctx)
        }

        // Instances
        for (const inst of this._data.instances) {
            this._draw_instance(ctx, inst)
        }

        // Views
        for (const view of this._data.views) {
            if (!view.enabled) continue
            ctx.save()
            ctx.strokeStyle = 'rgba(0,200,255,0.4)'
            ctx.lineWidth   = 1 / this._zoom
            ctx.setLineDash([4 / this._zoom, 2 / this._zoom])
            ctx.strokeRect(view.view_x, view.view_y, view.view_w, view.view_h)
            ctx.restore()
        }

        ctx.restore()
    }

    private _draw_grid(ctx: CanvasRenderingContext2D): void {
        const g  = this._snap_grid
        const rw = this._data.width
        const rh = this._data.height
        ctx.save()
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth   = 1 / this._zoom
        for (let x = 0; x <= rw; x += g) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rh); ctx.stroke()
        }
        for (let y = 0; y <= rh; y += g) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rw, y); ctx.stroke()
        }
        ctx.restore()
    }

    private _draw_instance(ctx: CanvasRenderingContext2D, inst: room_instance): void {
        const is_sel = inst === this._selected_inst
        const hw = 16
        const hh = 16
        ctx.save()
        ctx.fillStyle   = is_sel ? 'rgba(0,120,212,0.6)' : 'rgba(80,80,200,0.4)'
        ctx.strokeStyle = is_sel ? '#0078d4' : '#6666cc'
        ctx.lineWidth   = (is_sel ? 2 : 1) / this._zoom
        ctx.fillRect(inst.x - hw, inst.y - hh, hw * 2, hh * 2)
        ctx.strokeRect(inst.x - hw, inst.y - hh, hw * 2, hh * 2)

        // Label
        ctx.fillStyle  = '#fff'
        ctx.font       = `${Math.max(8, 10 / this._zoom)}px sans-serif`
        ctx.textAlign  = 'center'
        ctx.textBaseline = 'middle'
        const short = inst.object_name.length > 8
            ? inst.object_name.slice(0, 7) + '…'
            : inst.object_name
        ctx.fillText(short, inst.x, inst.y)

        // Origin dot
        ctx.fillStyle = '#ff4444'
        ctx.beginPath()
        ctx.arc(inst.x, inst.y, 2 / this._zoom, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
    }

    // ── Persistence ────────────────────────────────────────────────────────

    private async _load_data(): Promise<void> {
        try {
            const json = await project_read_file(`rooms/${this._room_name}/room.json`)
            const loaded = JSON.parse(json) as Partial<room_data>
            Object.assign(this._data, loaded)
            // Restore next instance ID to avoid collisions
            const max_id = this._data.instances.reduce((m, i) => Math.max(m, i.id), 0)
            if (max_id >= _next_inst_id) _next_inst_id = max_id + 1
        } catch {
            // New room
        }
        this._redraw()
        this._rebuild_instances_panel()
    }

    private _save(): void {
        project_write_file(
            `rooms/${this._room_name}/room.json`,
            JSON.stringify(this._data, null, 2),
        ).catch(() => { /* no project dir */ })
    }
}

// =========================================================================
// Default data factories
// =========================================================================

function _default_room(): room_data {
    return {
        width:             640,
        height:            480,
        room_speed:        60,
        persistent:        false,
        creation_code:     '',
        instances:         [],
        backgrounds:       [],
        views:             [],
        physics_world:     false,
        physics_gravity_x: 0,
        physics_gravity_y: 10,
    }
}

function _default_view(): room_view {
    return { enabled: true, view_x: 0, view_y: 0, view_w: 640, view_h: 480, port_x: 0, port_y: 0, port_w: 640, port_h: 480, follow: '' }
}

function _default_bg_layer(): room_background_layer {
    return { enabled: true, bg_name: '', tile_x: false, tile_y: false, stretch: false, visible_in_editor: true }
}

// =========================================================================
// Helpers
// =========================================================================

function _tool_btn(label: string, tool: tool_mode, cb: () => void): HTMLElement {
    const btn = document.createElement('button')
    btn.className   = 'sw-btn'
    btn.textContent = label
    btn.dataset['tool'] = tool
    btn.addEventListener('click', cb)
    return btn
}

function _icon_tool_btn(label: string, cb: () => void): HTMLElement {
    const btn = document.createElement('button')
    btn.className   = 'sw-btn'
    btn.textContent = label
    btn.style.cssText = 'padding:2px 8px;'
    btn.addEventListener('click', cb)
    return btn
}

function _form_container(): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'display:flex; flex-direction:column; gap:5px; padding:8px;'
    return el
}

function _section_hdr(text: string): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px;'
    el.textContent = text
    return el
}

function _num_field(label: string, initial: number, on_change: (v: number) => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:6px;'
    const lbl = document.createElement('span')
    lbl.className   = 'sw-label'
    lbl.style.cssText += 'min-width:80px; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type  = 'number'
    inp.className = 'sw-input'
    inp.style.cssText = 'width:70px;'
    inp.valueAsNumber = initial
    inp.addEventListener('change', () => on_change(inp.valueAsNumber || 0))
    row.append(lbl, inp)
    return row
}

function _check_field(label: string, initial: boolean, on_change: (v: boolean) => void): HTMLElement {
    const row = document.createElement('label')
    row.style.cssText = 'display:flex; align-items:center; gap:6px; cursor:pointer; font-size:11px;'
    const inp = document.createElement('input')
    inp.type    = 'checkbox'
    inp.className = 'sw-checkbox'
    inp.checked = initial
    inp.addEventListener('change', () => on_change(inp.checked))
    const lbl = document.createElement('span')
    lbl.textContent = label
    row.append(inp, lbl)
    return row
}

function _text_field(label: string, initial: string, on_change: (v: string) => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:6px;'
    const lbl = document.createElement('span')
    lbl.className   = 'sw-label'
    lbl.style.cssText += 'min-width:60px; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type  = 'text'
    inp.className = 'sw-input'
    inp.value = initial
    inp.addEventListener('change', () => on_change(inp.value))
    row.append(lbl, inp)
    return row
}
