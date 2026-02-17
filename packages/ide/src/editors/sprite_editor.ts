/**
 * Sprite editor window.
 * Import-only: manages frames, origin point, collision mask, and animation preview.
 */

import { FloatingWindow }                                                    from '../window_manager.js'
import { project_write_binary, project_read_file, project_write_file, project_read_binary_url } from '../services/project.js'
import { pixel_editor_open }                                                 from './pixel_editor.js'
import { show_prompt }                                                       from '../services/dialogs.js'

// =========================================================================
// Types
// =========================================================================

interface sprite_frame {
    name:     string   // filename stored in project (e.g. "spr_player_0.png")
    data_url: string   // blob URL for display (not persisted)
}

type mask_type = 'rectangle' | 'ellipse' | 'diamond' | 'precise'

interface sprite_data {
    frames:       sprite_frame[]
    origin_x:     number
    origin_y:     number
    width:        number     // pixels (from first frame)
    height:       number
    anim_speed:   number     // frames per second
    mask_type:    mask_type
    mask_x:       number
    mask_y:       number
    mask_w:       number
    mask_h:       number
}

// =========================================================================
// Deduplication: one window per sprite name
// =========================================================================

const _open_editors = new Map<string, sprite_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a sprite editor for the given sprite resource name.
 * @param workspace - The IDE workspace element to mount into
 * @param sprite_name - Resource name (e.g. "spr_player")
 * @param project_name - Project name used to load/save data
 */
export function sprite_editor_open(
    workspace:    HTMLElement,
    sprite_name:  string,
    project_name: string,
): void {
    const existing = _open_editors.get(sprite_name)
    if (existing) { existing.bring_to_front(); return }

    const ed = new sprite_editor_window(workspace, sprite_name, project_name)
    _open_editors.set(sprite_name, ed)
    ed.on_closed(() => _open_editors.delete(sprite_name))
}

// =========================================================================
// sprite_editor_window
// =========================================================================

/** Counter to stagger default positions of new windows. */
let _next_offset = 0

class sprite_editor_window {
    private _win:         FloatingWindow
    private _data:        sprite_data
    private _sprite_name: string
    private _project:     string

    // UI refs
    private _frame_list:  HTMLElement
    private _canvas:      HTMLCanvasElement
    private _ctx:         CanvasRenderingContext2D
    private _anim_timer:  ReturnType<typeof setInterval> | null = null
    private _anim_frame   = 0
    private _on_closed_cb: (() => void) | null = null
    private _zoom:        number = 1
    private _dragging:    'origin' | 'mask' | null = null
    private _drag_offset: { x: number; y: number } = { x: 0, y: 0 }

    constructor(workspace: HTMLElement, sprite_name: string, project_name: string) {
        this._sprite_name = sprite_name
        this._project     = project_name

        const off = (_next_offset++ % 8) * 24
        this._win = new FloatingWindow(
            `sprite-editor-${sprite_name}`,
            `Sprite: ${sprite_name}`,
            'icons/sprite.svg',
            { x: 240 + off, y: 40 + off, w: 620, h: 460 },
        )
        this._win.on_close(() => {
            this._stop_anim()
            this._on_closed_cb?.()
        })

        // Default sprite data
        this._data = {
            frames:     [],
            origin_x:   0,
            origin_y:   0,
            width:      0,
            height:     0,
            anim_speed: 15,
            mask_type:  'rectangle',
            mask_x:     0,
            mask_y:     0,
            mask_w:     0,
            mask_h:     0,
        }

        this._build_ui()
        this._load_data()
        this._win.mount(workspace)
    }

    // ── Public helpers ─────────────────────────────────────────────────────

    bring_to_front(): void { this._win.bring_to_front() }
    on_closed(cb: () => void): void { this._on_closed_cb = cb }

    // ── UI construction ────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden;'

        // ── Toolbar ────────────────────────────────────────────────────────
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'

        const btn_new_frame = _tool_btn('New Frame',     () => this._create_new_frame())
        const btn_import    = _tool_btn('Import Frames', () => this._import_frames())
        const btn_clear     = _tool_btn('Clear All',     () => this._clear_frames())
        toolbar.append(btn_new_frame, btn_import, btn_clear)
        body.appendChild(toolbar)

        // ── Main area ──────────────────────────────────────────────────────
        const main = document.createElement('div')
        main.style.cssText = 'display:flex; flex:1; overflow:hidden;'
        body.appendChild(main)

        // Left: frame list
        const left = document.createElement('div')
        left.className = 'sw-sprite-framelist'
        this._frame_list = left
        main.appendChild(left)

        // Center: canvas preview with controls
        const center = document.createElement('div')
        center.className = 'sw-sprite-preview-area'
        center.style.cssText = 'flex:1; display:flex; flex-direction:column; overflow:hidden; background:var(--sw-chrome1);'

        // Zoom controls toolbar
        const zoom_bar = document.createElement('div')
        zoom_bar.style.cssText = 'display:flex; align-items:center; gap:8px; padding:4px 8px; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2);'

        const zoom_out = document.createElement('button')
        zoom_out.textContent = '\u2212' // −
        zoom_out.title = 'Zoom Out'
        zoom_out.style.cssText = 'width:24px; height:24px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text);'
        zoom_out.addEventListener('click', () => this._adjust_zoom(-1))

        const zoom_label = document.createElement('span')
        zoom_label.id = 'zoom-label'
        zoom_label.textContent = '1x'
        zoom_label.style.cssText = 'font-size:11px; color:var(--sw-text); min-width:30px; text-align:center;'

        const zoom_in = document.createElement('button')
        zoom_in.textContent = '\u002B' // +
        zoom_in.title = 'Zoom In'
        zoom_in.style.cssText = 'width:24px; height:24px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text);'
        zoom_in.addEventListener('click', () => this._adjust_zoom(1))

        const zoom_fit = document.createElement('button')
        zoom_fit.textContent = 'Fit'
        zoom_fit.title = 'Fit to View'
        zoom_fit.style.cssText = 'padding:4px 8px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text); font-size:11px;'
        zoom_fit.addEventListener('click', () => this._fit_zoom())

        zoom_bar.append(zoom_out, zoom_label, zoom_in, zoom_fit)
        center.appendChild(zoom_bar)

        // Canvas container with scroll
        const canvas_container = document.createElement('div')
        canvas_container.style.cssText = 'flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; background:#2a2a2a;'

        this._canvas = document.createElement('canvas')
        this._canvas.width  = 192
        this._canvas.height = 192
        this._canvas.className = 'sw-sprite-canvas'
        this._canvas.style.cssText = 'image-rendering:pixelated; cursor:crosshair;'
        this._ctx = this._canvas.getContext('2d')!

        // Mouse interaction for dragging origin/mask
        this._canvas.addEventListener('mousedown', this._on_canvas_mousedown)
        this._canvas.addEventListener('mousemove', this._on_canvas_mousemove)
        this._canvas.addEventListener('mouseup', this._on_canvas_mouseup)
        this._canvas.addEventListener('mouseleave', this._on_canvas_mouseup)

        canvas_container.appendChild(this._canvas)
        center.appendChild(canvas_container)
        main.appendChild(center)

        // Right: properties
        const right = document.createElement('div')
        right.className = 'sw-sprite-props'
        right.appendChild(this._build_props())
        main.appendChild(right)
    }

    private _build_props(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding:8px;'

        // Origin
        const origin_sec = _section('Origin')
        const ox_row = _prop_row('X:', this._data.origin_x, (v) => { this._data.origin_x = v; this._redraw() })
        const oy_row = _prop_row('Y:', this._data.origin_y, (v) => { this._data.origin_y = v; this._redraw() })
        origin_sec.append(ox_row, oy_row)

        // Quick-set origin buttons
        const origin_presets = document.createElement('div')
        origin_presets.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;'
        const presets: [string, () => [number, number]][] = [
            ['TL', () => [0, 0]],
            ['TC', () => [Math.floor(this._data.width / 2), 0]],
            ['TR', () => [this._data.width - 1, 0]],
            ['ML', () => [0, Math.floor(this._data.height / 2)]],
            ['MC', () => [Math.floor(this._data.width / 2), Math.floor(this._data.height / 2)]],
            ['MR', () => [this._data.width - 1, Math.floor(this._data.height / 2)]],
            ['BL', () => [0, this._data.height - 1]],
            ['BC', () => [Math.floor(this._data.width / 2), this._data.height - 1]],
            ['BR', () => [this._data.width - 1, this._data.height - 1]],
        ]
        for (const [label, get_val] of presets) {
            const b = document.createElement('button')
            b.textContent = label
            b.className = 'sw-btn'
            b.style.cssText = 'padding:2px 4px; font-size:10px;'
            b.addEventListener('click', () => {
                const [x, y] = get_val()
                this._data.origin_x = x
                this._data.origin_y = y
                // update inputs
                const inputs = ox_row.querySelectorAll('input')
                const oy_inputs = oy_row.querySelectorAll('input')
                if (inputs[0])    (inputs[0] as HTMLInputElement).valueAsNumber   = x
                if (oy_inputs[0]) (oy_inputs[0] as HTMLInputElement).valueAsNumber = y
                this._redraw()
            })
            origin_presets.appendChild(b)
        }
        origin_sec.appendChild(origin_presets)

        // Animation speed
        const anim_sec  = _section('Animation')
        const speed_row = _prop_row('FPS:', this._data.anim_speed, (v) => {
            this._data.anim_speed = Math.max(1, v)
            this._restart_anim()
        })
        anim_sec.appendChild(speed_row)

        // Collision mask
        const mask_sec  = _section('Collision Mask')
        const mask_type_el = document.createElement('select')
        mask_type_el.className = 'sw-select';
        (['rectangle','ellipse','diamond','precise'] as mask_type[]).forEach(t => {
            const opt = document.createElement('option')
            opt.value = t
            opt.textContent = t.charAt(0).toUpperCase() + t.slice(1)
            if (t === this._data.mask_type) opt.selected = true
            mask_type_el.appendChild(opt)
        })
        mask_type_el.addEventListener('change', () => {
            this._data.mask_type = mask_type_el.value as mask_type
            this._redraw()
        })
        mask_sec.appendChild(mask_type_el)
        mask_sec.append(
            _prop_row('X:',  this._data.mask_x, (v) => { this._data.mask_x = v; this._redraw() }),
            _prop_row('Y:',  this._data.mask_y, (v) => { this._data.mask_y = v; this._redraw() }),
            _prop_row('W:',  this._data.mask_w, (v) => { this._data.mask_w = v; this._redraw() }),
            _prop_row('H:',  this._data.mask_h, (v) => { this._data.mask_h = v; this._redraw() }),
        )

        el.append(origin_sec, anim_sec, mask_sec)
        return el
    }

    // ── Frame management ───────────────────────────────────────────────────

    private async _create_new_frame(): Promise<void> {
        // Prompt for dimensions if no frames exist yet
        if (this._data.frames.length === 0) {
            const w = await show_prompt('Frame width (pixels):', '32')
            if (!w) return
            const h = await show_prompt('Frame height (pixels):', '32')
            if (!h) return
            const width = Math.max(1, parseInt(w) || 32)
            const height = Math.max(1, parseInt(h) || 32)

            // Set sprite dimensions from first frame
            this._data.width = width
            this._data.height = height
            this._data.mask_w = width
            this._data.mask_h = height
            this._canvas.width = Math.min(192, width)
            this._canvas.height = Math.min(192, height)
        }

        // Open pixel editor
        pixel_editor_open(
            this._win.body.parentElement!,
            this._data.width,
            this._data.height,
            null,
            (data_url) => this._save_new_frame(data_url)
        )
    }

    private _edit_frame(index: number): void {
        const frame = this._data.frames[index]
        if (!frame) return

        pixel_editor_open(
            this._win.body.parentElement!,
            this._data.width,
            this._data.height,
            frame.data_url,
            (data_url) => this._update_frame(index, data_url)
        )
    }

    private async _save_new_frame(data_url: string): Promise<void> {
        const frame_name = `${this._sprite_name}_${this._data.frames.length}.png`
        this._data.frames.push({ name: frame_name, data_url })

        // Save to disk
        try {
            const blob = await fetch(data_url).then(r => r.blob())
            await project_write_binary(`sprites/${this._sprite_name}/${frame_name}`, blob)
        } catch {
            // No project dir open — data_url preview still works
        }

        this._rebuild_frame_list()
        this._restart_anim()
        this._save_meta()
    }

    private async _update_frame(index: number, data_url: string): Promise<void> {
        const frame = this._data.frames[index]
        if (!frame) return

        frame.data_url = data_url

        // Save to disk
        try {
            const blob = await fetch(data_url).then(r => r.blob())
            await project_write_binary(`sprites/${this._sprite_name}/${frame.name}`, blob)
        } catch {
            // No project dir open — data_url preview still works
        }

        this._rebuild_frame_list()
        this._restart_anim()
    }

    private async _import_frames(): Promise<void> {
        const input = document.createElement('input')
        input.type     = 'file'
        input.accept   = 'image/png,image/jpeg,image/gif'
        input.multiple = true
        input.onchange = async () => {
            const files = Array.from(input.files ?? [])
            for (const file of files) {
                const data_url = await _file_to_data_url(file)
                const frame_name = `${this._sprite_name}_${this._data.frames.length}.png`
                this._data.frames.push({ name: frame_name, data_url })

                // Derive dimensions from first frame
                if (this._data.frames.length === 1) {
                    const img = new Image()
                    await new Promise<void>(res => { img.onload = () => res(); img.src = data_url })
                    this._data.width   = img.naturalWidth
                    this._data.height  = img.naturalHeight
                    this._data.mask_w  = img.naturalWidth
                    this._data.mask_h  = img.naturalHeight
                    this._canvas.width  = Math.min(192, img.naturalWidth)
                    this._canvas.height = Math.min(192, img.naturalHeight)
                }

                try {
                    await project_write_binary(`sprites/${this._sprite_name}/${frame_name}`, file)
                } catch {
                    // No project dir open — data_url preview still works
                }
            }
            this._rebuild_frame_list()
            this._restart_anim()
            this._save_meta()
        }
        input.click()
    }

    private _clear_frames(): void {
        // In-renderer confirm overlay (works in Electron and browser alike)
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;'
        const box = document.createElement('div')
        box.style.cssText = 'background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:280px;font-family:sans-serif;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:10px;'
        box.innerHTML = `<p style="margin:0;">Clear all frames from "<b>${this._sprite_name}</b>"?</p>`
        const btns = document.createElement('div')
        btns.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        const ok_btn = document.createElement('button')
        ok_btn.textContent = 'Clear'
        ok_btn.style.cssText = 'padding:4px 20px;cursor:pointer;'
        const cancel_btn = document.createElement('button')
        cancel_btn.textContent = 'Cancel'
        cancel_btn.style.cssText = 'padding:4px 20px;cursor:pointer;'
        btns.append(ok_btn, cancel_btn)
        box.appendChild(btns)
        overlay.appendChild(box)
        document.body.appendChild(overlay)
        ok_btn.addEventListener('click', () => {
            overlay.remove()
            this._stop_anim()
            this._data.frames = []
            this._data.width  = 0
            this._data.height = 0
            this._rebuild_frame_list()
            this._clear_canvas()
            this._save_meta()
        })
        cancel_btn.addEventListener('click', () => overlay.remove())
    }

    private _rebuild_frame_list(): void {
        this._frame_list.innerHTML = ''
        if (this._data.frames.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;'
            empty.textContent = 'No frames.\nClick "Import Frames".'
            this._frame_list.appendChild(empty)
            return
        }
        this._data.frames.forEach((frame, i) => {
            const row = document.createElement('div')
            row.className = 'sw-sprite-frame-row'
            row.dataset['index'] = String(i)

            const thumb = document.createElement('img')
            thumb.src = frame.data_url
            thumb.style.cssText = 'width:32px; height:32px; object-fit:contain; flex-shrink:0; image-rendering:pixelated;'

            const label = document.createElement('span')
            label.textContent = `#${i}`
            label.style.cssText = 'font-size:11px; flex:1;'

            const edit_btn = document.createElement('button')
            edit_btn.textContent = '\u270E'  // ✎
            edit_btn.title = 'Edit frame'
            edit_btn.style.cssText = 'width:20px; height:20px; font-size:10px; flex-shrink:0; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2);'
            edit_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this._edit_frame(i)
            })

            const del_btn = document.createElement('button')
            del_btn.textContent = '✕'
            del_btn.className = 'sw-window-btn close'
            del_btn.style.cssText = 'width:16px; height:16px; font-size:9px; flex-shrink:0;'
            del_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this._data.frames.splice(i, 1)
                if (this._anim_frame >= this._data.frames.length) this._anim_frame = 0
                this._rebuild_frame_list()
                this._restart_anim()
                this._save_meta()
            })

            // Drag-to-reorder handles (mousedown only — simple swap on drop)
            row.draggable = true
            row.addEventListener('dragstart', (e) => { e.dataTransfer!.setData('text/plain', String(i)) })
            row.addEventListener('dragover',  (e) => { e.preventDefault(); row.style.outline = '1px solid var(--sw-accent)' })
            row.addEventListener('dragleave', () => { row.style.outline = '' })
            row.addEventListener('drop',      (e) => {
                e.preventDefault()
                row.style.outline = ''
                const from = parseInt(e.dataTransfer!.getData('text/plain'))
                const to   = i
                if (from === to) return
                const [moved] = this._data.frames.splice(from, 1)
                this._data.frames.splice(to, 0, moved!)
                this._rebuild_frame_list()
                this._save_meta()
            })

            row.append(thumb, label, edit_btn, del_btn)
            this._frame_list.appendChild(row)
        })
    }

    // ── Animation ──────────────────────────────────────────────────────────

    private _restart_anim(): void {
        this._stop_anim()
        if (this._data.frames.length === 0) { this._clear_canvas(); return }
        const ms = Math.round(1000 / Math.max(1, this._data.anim_speed))
        this._anim_timer = setInterval(() => {
            this._anim_frame = (this._anim_frame + 1) % this._data.frames.length
            this._redraw()
        }, ms)
        this._redraw()
    }

    private _stop_anim(): void {
        if (this._anim_timer !== null) { clearInterval(this._anim_timer); this._anim_timer = null }
    }

    private _redraw(): void {
        const frame = this._data.frames[this._anim_frame]
        if (!frame) { this._clear_canvas(); return }
        const img = new Image()
        img.onload = () => {
            const ctx = this._ctx
            const cw = this._canvas.width
            const ch = this._canvas.height

            ctx.clearRect(0, 0, cw, ch)

            // Checkerboard background for transparency
            _draw_checkerboard(ctx, cw, ch)

            // Draw sprite with nearest neighbor scaling
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(img, 0, 0, cw, ch)

            // Origin crosshair
            this._draw_origin(ctx)

            // Mask outline
            this._draw_mask(ctx)
        }
        img.src = frame.data_url
    }

    private _clear_canvas(): void {
        const ctx = this._ctx
        const cw  = this._canvas.width
        const ch  = this._canvas.height
        ctx.clearRect(0, 0, cw, ch)
        _draw_checkerboard(ctx, cw, ch)
    }

    // ── Zoom controls ──────────────────────────────────────────────────────

    private _adjust_zoom(delta: number): void {
        const zoom_levels = [1, 2, 4, 8, 16, 32]
        const current_idx = zoom_levels.indexOf(this._zoom)
        let new_idx = current_idx + delta

        if (new_idx < 0) new_idx = 0
        if (new_idx >= zoom_levels.length) new_idx = zoom_levels.length - 1

        this._zoom = zoom_levels[new_idx]
        this._update_canvas_size()
        this._redraw()

        const label = document.getElementById('zoom-label')
        if (label) label.textContent = `${this._zoom}x`
    }

    private _fit_zoom(): void {
        if (this._data.width === 0 || this._data.height === 0) return

        const container_width = 400  // Approximate
        const container_height = 300
        const zoom_x = Math.floor(container_width / this._data.width)
        const zoom_y = Math.floor(container_height / this._data.height)
        const fit_zoom = Math.max(1, Math.min(zoom_x, zoom_y, 32))

        this._zoom = fit_zoom
        this._update_canvas_size()
        this._redraw()

        const label = document.getElementById('zoom-label')
        if (label) label.textContent = `${this._zoom}x`
    }

    private _update_canvas_size(): void {
        if (this._data.width > 0 && this._data.height > 0) {
            this._canvas.width = this._data.width * this._zoom
            this._canvas.height = this._data.height * this._zoom
        }
    }

    // ── Canvas interaction ─────────────────────────────────────────────────

    private _on_canvas_mousedown = (e: MouseEvent): void => {
        const rect = this._canvas.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / this._zoom)
        const y = Math.floor((e.clientY - rect.top) / this._zoom)

        // Check if clicking on origin (within 5px radius)
        const origin_dist = Math.sqrt(Math.pow(x - this._data.origin_x, 2) + Math.pow(y - this._data.origin_y, 2))
        if (origin_dist < 5 / this._zoom + 3) {
            this._dragging = 'origin'
            this._drag_offset = { x: x - this._data.origin_x, y: y - this._data.origin_y }
            return
        }

        // Check if clicking on mask
        const mx = this._data.mask_x
        const my = this._data.mask_y
        const mw = this._data.mask_w
        const mh = this._data.mask_h
        if (x >= mx && x <= mx + mw && y >= my && y <= my + mh) {
            this._dragging = 'mask'
            this._drag_offset = { x: x - mx, y: y - my }
            return
        }
    }

    private _on_canvas_mousemove = (e: MouseEvent): void => {
        if (!this._dragging) return

        const rect = this._canvas.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / this._zoom)
        const y = Math.floor((e.clientY - rect.top) / this._zoom)

        if (this._dragging === 'origin') {
            this._data.origin_x = Math.max(0, Math.min(this._data.width, x - this._drag_offset.x))
            this._data.origin_y = Math.max(0, Math.min(this._data.height, y - this._drag_offset.y))
            this._redraw()
            this._save_meta()
        } else if (this._dragging === 'mask') {
            this._data.mask_x = Math.max(0, Math.min(this._data.width - this._data.mask_w, x - this._drag_offset.x))
            this._data.mask_y = Math.max(0, Math.min(this._data.height - this._data.mask_h, y - this._drag_offset.y))
            this._redraw()
            this._save_meta()
        }
    }

    private _on_canvas_mouseup = (): void => {
        this._dragging = null
    }

    private _draw_origin(ctx: CanvasRenderingContext2D): void {
        const ox = this._data.origin_x * this._zoom
        const oy = this._data.origin_y * this._zoom
        const size = 8

        ctx.save()
        // Draw circle at origin point
        ctx.fillStyle = '#ff4444'
        ctx.beginPath()
        ctx.arc(ox, oy, 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw crosshair
        ctx.strokeStyle = '#ff4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(ox - size, oy)
        ctx.lineTo(ox + size, oy)
        ctx.moveTo(ox, oy - size)
        ctx.lineTo(ox, oy + size)
        ctx.stroke()

        // Draw white outline for visibility
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
    }

    private _draw_mask(ctx: CanvasRenderingContext2D): void {
        const sx = this._data.mask_x * this._zoom
        const sy = this._data.mask_y * this._zoom
        const sw = this._data.mask_w * this._zoom
        const sh = this._data.mask_h * this._zoom

        ctx.save()
        ctx.strokeStyle = '#00c8ff'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])

        switch (this._data.mask_type) {
            case 'rectangle':
                ctx.strokeRect(sx, sy, sw, sh)
                break
            case 'ellipse':
                ctx.beginPath()
                ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2)
                ctx.stroke()
                break
            case 'diamond':
                ctx.beginPath()
                ctx.moveTo(sx + sw / 2, sy)
                ctx.lineTo(sx + sw, sy + sh / 2)
                ctx.lineTo(sx + sw / 2, sy + sh)
                ctx.lineTo(sx, sy + sh / 2)
                ctx.closePath()
                ctx.stroke()
                break
            case 'precise':
                // Precise mask uses full frame bounds
                ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height)
                break
        }
        ctx.restore()
    }

    // ── Persistence ────────────────────────────────────────────────────────

    private async _load_data(): Promise<void> {
        try {
            const json = await project_read_file(`sprites/${this._sprite_name}/meta.json`)
            const loaded = JSON.parse(json) as Partial<sprite_data>
            if (loaded.origin_x   !== undefined) this._data.origin_x   = loaded.origin_x
            if (loaded.origin_y   !== undefined) this._data.origin_y   = loaded.origin_y
            if (loaded.width      !== undefined) this._data.width      = loaded.width
            if (loaded.height     !== undefined) this._data.height     = loaded.height
            if (loaded.anim_speed !== undefined) this._data.anim_speed = loaded.anim_speed
            if (loaded.mask_type  !== undefined) this._data.mask_type  = loaded.mask_type
            if (loaded.mask_x     !== undefined) this._data.mask_x     = loaded.mask_x
            if (loaded.mask_y     !== undefined) this._data.mask_y     = loaded.mask_y
            if (loaded.mask_w     !== undefined) this._data.mask_w     = loaded.mask_w
            if (loaded.mask_h     !== undefined) this._data.mask_h     = loaded.mask_h

            if (loaded.frames && loaded.frames.length > 0) {
                for (const f of loaded.frames) {
                    // Try to reload image from disk; fall back to blank placeholder
                    let data_url = ''
                    try {
                        data_url = await project_read_binary_url(`sprites/${this._sprite_name}/${f.name}`)
                    } catch { /* image not on disk yet */ }
                    this._data.frames.push({ name: f.name, data_url })
                }
            }
        } catch {
            // No meta yet — fresh sprite
        }

        // Initialize with fit zoom
        this._fit_zoom()

        this._rebuild_frame_list()
        this._restart_anim()
    }

    private _save_meta(): void {
        // Save only serializable fields (no blob URLs)
        const meta = {
            origin_x:   this._data.origin_x,
            origin_y:   this._data.origin_y,
            width:      this._data.width,
            height:     this._data.height,
            anim_speed: this._data.anim_speed,
            mask_type:  this._data.mask_type,
            mask_x:     this._data.mask_x,
            mask_y:     this._data.mask_y,
            mask_w:     this._data.mask_w,
            mask_h:     this._data.mask_h,
            frames:     this._data.frames.map(f => ({ name: f.name })),
        }
        // Fire-and-forget; UI shouldn't block on this
        project_write_file(`sprites/${this._sprite_name}/meta.json`, JSON.stringify(meta, null, 2))
            .catch(() => { /* no project dir open */ })
    }
}

// =========================================================================
// Helpers
// =========================================================================

function _tool_btn(label: string, cb: () => void): HTMLElement {
    const btn = document.createElement('button')
    btn.className   = 'sw-btn'
    btn.textContent = label
    btn.addEventListener('click', cb)
    return btn
}

function _section(title: string): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'display:flex; flex-direction:column; gap:4px;'
    const hdr = document.createElement('div')
    hdr.style.cssText = 'font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px;'
    hdr.textContent = title
    el.appendChild(hdr)
    return el
}

function _prop_row(label: string, initial: number, on_change: (v: number) => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:6px;'
    const lbl = document.createElement('span')
    lbl.className   = 'sw-label'
    lbl.style.cssText += 'width:20px; text-align:right; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type  = 'number'
    inp.className = 'sw-input'
    inp.style.cssText = 'width:60px;'
    inp.valueAsNumber = initial
    inp.addEventListener('change', () => on_change(inp.valueAsNumber || 0))
    row.append(lbl, inp)
    return row
}

function _draw_checkerboard(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const sz = 8
    for (let y = 0; y < h; y += sz) {
        for (let x = 0; x < w; x += sz) {
            ctx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#555' : '#444'
            ctx.fillRect(x, y, sz, sz)
        }
    }
}

async function _file_to_data_url(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
