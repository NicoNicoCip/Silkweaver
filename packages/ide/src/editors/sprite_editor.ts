/**
 * Sprite editor — GMS-1.4-style sprite properties window.
 *
 * Layout: a properties form on the left (frame actions, size, origin, collision mask, animation),
 * a zoomable preview with playback controls in the centre, and a horizontal subimage strip along
 * the bottom. Frame images are decoded once and cached so the preview redraws synchronously
 * (no flicker while dragging the origin/mask). Frames are stored as index-named PNGs +
 * a meta.json (origin/mask/anim_speed); the runtime build reads that meta.
 */

import { FloatingWindow }                                                    from '../window_manager.js'
import { ICON }                                                              from '../icons.js'
import { project_write_binary, project_read_file, project_write_file, project_read_binary_url } from '../services/project.js'
import { pixel_editor_open }                                                 from './pixel_editor.js'

interface sprite_frame { name: string; data_url: string }
type mask_type = 'rectangle' | 'ellipse' | 'diamond' | 'precise'

interface sprite_data {
    frames:     sprite_frame[]
    origin_x:   number
    origin_y:   number
    width:      number
    height:     number
    anim_speed: number
    mask_type:  mask_type
    mask_x:     number
    mask_y:     number
    mask_w:     number
    mask_h:     number
}

const _open_editors = new Map<string, sprite_editor_window>()

/** Opens (or focuses) a sprite editor for the given sprite resource name. */
export function sprite_editor_open(workspace: HTMLElement, sprite_name: string, project_name: string): void {
    const existing = _open_editors.get(sprite_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new sprite_editor_window(workspace, sprite_name, project_name)
    _open_editors.set(sprite_name, ed)
    ed.on_closed(() => _open_editors.delete(sprite_name))
}

let _next_offset = 0

class sprite_editor_window {
    private _win:          FloatingWindow
    private _data:         sprite_data
    private _sprite_name:  string
    private _project:      string

    private _canvas!:      HTMLCanvasElement
    private _ctx!:         CanvasRenderingContext2D
    private _imgs:         HTMLImageElement[] = []      // decoded frame images (parallel to _data.frames)
    private _strip!:       HTMLElement
    private _props_host!:  HTMLElement
    private _status_el!:   HTMLElement
    private _frame_label!: HTMLElement
    private _play_btn!:    HTMLButtonElement
    private _canvas_wrap!: HTMLElement

    private _zoom          = 4
    private _cur           = 0          // displayed / selected subimage
    private _playing       = false
    private _timer:        ReturnType<typeof setInterval> | null = null
    private _dragging:     'origin' | 'mask' | null = null
    private _drag_off      = { x: 0, y: 0 }
    private _on_closed_cb:  (() => void) | null = null

    constructor(workspace: HTMLElement, sprite_name: string, project_name: string) {
        this._sprite_name = sprite_name
        this._project     = project_name

        const off = (_next_offset++ % 8) * 24
        this._win = new FloatingWindow(
            `sprite-editor-${sprite_name}`, `Sprite: ${sprite_name}`, ICON.sprite,
            { x: 220 + off, y: 36 + off, w: 760, h: 560 },
        )
        this._win.on_close(() => {
            this._pause()
            window.removeEventListener('mousemove', this._on_move)
            window.removeEventListener('mouseup', this._on_up)
            this._on_closed_cb?.()
        })

        this._data = {
            frames: [], origin_x: 0, origin_y: 0, width: 0, height: 0,
            anim_speed: 15, mask_type: 'rectangle', mask_x: 0, mask_y: 0, mask_w: 0, mask_h: 0,
        }

        this._build_ui()
        this._load_data()
        this._win.mount(workspace)
    }

    bring_to_front(): void { this._win.bring_to_front() }
    on_closed(cb: () => void): void { this._on_closed_cb = cb }

    // ── Layout ───────────────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden;'

        const main = document.createElement('div')
        main.style.cssText = 'display:flex; flex:1; overflow:hidden; min-height:0;'
        body.appendChild(main)

        // Left: properties form (vertical scroll only if it overflows; never horizontal).
        this._props_host = document.createElement('div')
        this._props_host.style.cssText = 'width:214px; flex-shrink:0; overflow-y:auto; overflow-x:hidden; padding:8px; background:var(--sw-chrome1); border-right:1px solid var(--sw-border2);'
        this._props_host.appendChild(this._build_props())
        main.appendChild(this._props_host)

        // Centre: preview (header + canvas).
        const center = document.createElement('div')
        center.style.cssText = 'flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; background:var(--sw-chrome1);'
        center.appendChild(this._build_preview_header())
        this._canvas_wrap = document.createElement('div')
        this._canvas_wrap.style.cssText = 'flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; background:#2a2a2a;'
        this._canvas = document.createElement('canvas')
        this._canvas.width = 128; this._canvas.height = 128
        this._canvas.style.cssText = 'image-rendering:pixelated; cursor:crosshair; flex-shrink:0;'
        this._ctx = this._canvas.getContext('2d')!
        this._canvas.addEventListener('mousedown', this._on_down)
        window.addEventListener('mousemove', this._on_move)
        window.addEventListener('mouseup', this._on_up)
        this._canvas_wrap.appendChild(this._canvas)
        center.appendChild(this._canvas_wrap)
        main.appendChild(center)

        // Bottom: horizontal subimage strip.
        const strip_wrap = document.createElement('div')
        strip_wrap.style.cssText = 'flex-shrink:0; border-top:1px solid var(--sw-border2); background:var(--sw-chrome2);'
        const strip_hdr = document.createElement('div')
        strip_hdr.style.cssText = 'font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; padding:3px 8px 0;'
        strip_hdr.textContent = 'Subimages'
        this._strip = document.createElement('div')
        this._strip.style.cssText = 'display:flex; gap:6px; padding:6px 8px 8px; overflow-x:auto; overflow-y:hidden; height:62px; align-items:flex-start;'
        strip_wrap.append(strip_hdr, this._strip)
        body.appendChild(strip_wrap)

        // Status bar.
        this._status_el = document.createElement('div')
        this._status_el.style.cssText = 'flex-shrink:0; padding:3px 8px; font-size:11px; color:var(--sw-text-dim); background:var(--sw-chrome2); border-top:1px solid var(--sw-border2);'
        body.appendChild(this._status_el)
    }

    private _build_preview_header(): HTMLElement {
        const bar = document.createElement('div')
        bar.style.cssText = 'display:flex; align-items:center; gap:6px; padding:4px 8px; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2); flex-wrap:wrap;'

        const zlabel = document.createElement('span')
        zlabel.style.cssText = 'font-size:11px; color:var(--sw-text); min-width:34px; text-align:center;'
        const set_zlabel = () => { zlabel.textContent = `${this._zoom}×` }
        bar.append(
            _icon_btn('−', 'Zoom out', () => { this._set_zoom(this._zoom - 1); set_zlabel() }),
            zlabel,
            _icon_btn('+', 'Zoom in', () => { this._set_zoom(this._zoom + 1); set_zlabel() }),
            _icon_btn('Fit', 'Fit to view', () => { this._fit_zoom(); set_zlabel() }, 30),
            _vsep(),
            _icon_btn('⏮', 'Previous frame', () => this._goto(this._cur - 1)),
            (this._play_btn = _icon_btn('▶', 'Play / pause', () => this._toggle_play()) as HTMLButtonElement),
            _icon_btn('⏭', 'Next frame', () => this._goto(this._cur + 1)),
        )
        this._frame_label = document.createElement('span')
        this._frame_label.style.cssText = 'font-size:11px; color:var(--sw-text-dim); margin-left:4px;'
        bar.appendChild(this._frame_label)
        set_zlabel()
        return bar
    }

    private _build_props(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; gap:8px;'

        // Frame actions
        const actions = document.createElement('div')
        actions.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:4px;'
        actions.append(
            _btn('New', () => this._new_frame()),
            _btn('Import', () => this._import_frames()),
            _btn('Edit', () => this._edit_frame(this._cur)),
            _btn('Clear', () => this._clear_frames()),
        )
        el.appendChild(actions)

        // Read-only info
        const info = document.createElement('div')
        info.style.cssText = 'font-size:11px; color:var(--sw-text-dim); line-height:1.6;'
        info.textContent = `Size: ${this._data.width}×${this._data.height}    Subimages: ${this._data.frames.length}`
        el.appendChild(info)

        // Origin
        const origin = _section('Origin')
        origin.append(
            _prop_row('X:', this._data.origin_x, (v) => { this._data.origin_x = clamp(v, 0, this._data.width);  this._redraw(); this._save_meta() }),
            _prop_row('Y:', this._data.origin_y, (v) => { this._data.origin_y = clamp(v, 0, this._data.height); this._redraw(); this._save_meta() }),
        )
        const presets = document.createElement('div')
        presets.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;'
        const ps: [string, () => [number, number]][] = [
            ['TL', () => [0, 0]], ['TC', () => [hw(this), 0]], ['TR', () => [this._data.width, 0]],
            ['ML', () => [0, hh(this)]], ['C', () => [hw(this), hh(this)]], ['MR', () => [this._data.width, hh(this)]],
            ['BL', () => [0, this._data.height]], ['BC', () => [hw(this), this._data.height]], ['BR', () => [this._data.width, this._data.height]],
        ]
        for (const [label, get] of ps) {
            const b = _btn(label, () => { const [x, y] = get(); this._data.origin_x = x; this._data.origin_y = y; this._rebuild_props(); this._redraw(); this._save_meta() })
            b.style.cssText += 'padding:2px 0; font-size:10px;'
            presets.appendChild(b)
        }
        origin.appendChild(presets)
        el.appendChild(origin)

        // Collision mask
        const mask = _section('Collision Mask')
        const mtype = document.createElement('select')
        mtype.className = 'sw-select'
        for (const t of ['rectangle', 'ellipse', 'diamond', 'precise'] as mask_type[]) {
            const o = document.createElement('option'); o.value = t; o.textContent = t[0]!.toUpperCase() + t.slice(1)
            if (t === this._data.mask_type) o.selected = true
            mtype.appendChild(o)
        }
        mtype.addEventListener('change', () => { this._data.mask_type = mtype.value as mask_type; this._redraw(); this._save_meta() })
        mask.appendChild(mtype)
        mask.append(
            _prop_row('X:', this._data.mask_x, (v) => { this._data.mask_x = v; this._redraw(); this._save_meta() }),
            _prop_row('Y:', this._data.mask_y, (v) => { this._data.mask_y = v; this._redraw(); this._save_meta() }),
            _prop_row('W:', this._data.mask_w, (v) => { this._data.mask_w = v; this._redraw(); this._save_meta() }),
            _prop_row('H:', this._data.mask_h, (v) => { this._data.mask_h = v; this._redraw(); this._save_meta() }),
        )
        const full = _btn('Set to full image', () => {
            this._data.mask_x = 0; this._data.mask_y = 0; this._data.mask_w = this._data.width; this._data.mask_h = this._data.height
            this._rebuild_props(); this._redraw(); this._save_meta()
        })
        full.style.cssText += 'font-size:11px; align-self:flex-start;'
        mask.appendChild(full)
        el.appendChild(mask)

        // Animation
        const anim = _section('Animation')
        anim.appendChild(_prop_row('FPS:', this._data.anim_speed, (v) => { this._data.anim_speed = Math.max(1, v); this._refresh_anim(); this._save_meta() }))
        el.appendChild(anim)

        return el
    }

    private _rebuild_props(): void {
        this._props_host.innerHTML = ''
        this._props_host.appendChild(this._build_props())
    }

    // ── Frame image cache ──────────────────────────────────────────────────────

    /** Decodes all frame data URLs into cached images, then refreshes the preview + strip. */
    private async _refresh_images(): Promise<void> {
        this._imgs = await Promise.all(this._data.frames.map(f => _decode(f.data_url)))
        if (this._cur >= this._data.frames.length) this._cur = Math.max(0, this._data.frames.length - 1)
        this._rebuild_strip()
        this._refresh_anim()
    }

    // ── Subimage strip ─────────────────────────────────────────────────────────

    private _rebuild_strip(): void {
        this._strip.innerHTML = ''
        if (this._data.frames.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px; padding:8px;'
            empty.textContent = 'No subimages — use New or Import.'
            this._strip.appendChild(empty)
            return
        }
        this._data.frames.forEach((frame, i) => {
            const cell = document.createElement('div')
            cell.style.cssText = `position:relative; width:44px; height:44px; flex-shrink:0; cursor:pointer; border:2px solid ${i === this._cur ? 'var(--sw-accent)' : 'var(--sw-border2)'}; background:#333;`
            cell.title = `Subimage ${i} (double-click to edit)`
            cell.draggable = true

            const img = document.createElement('img')
            img.src = frame.data_url
            img.style.cssText = 'width:100%; height:100%; object-fit:contain; image-rendering:pixelated; pointer-events:none;'
            cell.appendChild(img)

            const idx = document.createElement('span')
            idx.textContent = String(i)
            idx.style.cssText = 'position:absolute; left:1px; bottom:0; font-size:9px; color:#fff; text-shadow:0 0 2px #000; pointer-events:none;'
            cell.appendChild(idx)

            // Delete button: a corner overlay, so a horizontal scrollbar can never hide it.
            const del = document.createElement('div')
            del.textContent = '×'
            del.title = 'Delete subimage'
            del.style.cssText = 'position:absolute; top:0; right:0; width:14px; height:14px; line-height:13px; text-align:center; font-size:11px; color:#fff; background:rgba(180,40,40,0.85); cursor:pointer;'
            del.addEventListener('click', (e) => { e.stopPropagation(); this._delete_frame(i) })
            cell.appendChild(del)

            cell.addEventListener('click', () => this._goto(i))
            cell.addEventListener('dblclick', () => this._edit_frame(i))
            cell.addEventListener('dragstart', (e) => e.dataTransfer!.setData('text/plain', String(i)))
            cell.addEventListener('dragover',  (e) => { e.preventDefault(); cell.style.borderColor = 'var(--sw-accent)' })
            cell.addEventListener('dragleave', () => { cell.style.borderColor = i === this._cur ? 'var(--sw-accent)' : 'var(--sw-border2)' })
            cell.addEventListener('drop', (e) => {
                e.preventDefault()
                const from = parseInt(e.dataTransfer!.getData('text/plain'))
                if (from === i || isNaN(from)) return
                const [mf] = this._data.frames.splice(from, 1)
                const [mi] = this._imgs.splice(from, 1)
                this._data.frames.splice(i, 0, mf!)
                this._imgs.splice(i, 0, mi!)
                this._cur = i
                this._rebuild_strip(); this._redraw(); this._update_status(); this._save_meta()
            })

            this._strip.appendChild(cell)
        })
    }

    // ── Playback ───────────────────────────────────────────────────────────────

    private _toggle_play(): void { this._playing ? this._pause() : this._play() }

    private _play(): void {
        if (this._data.frames.length <= 1) return
        this._playing = true
        this._play_btn.textContent = '⏸'
        this._stop_timer()
        const ms = Math.round(1000 / Math.max(1, this._data.anim_speed))
        this._timer = setInterval(() => {
            this._cur = (this._cur + 1) % this._data.frames.length
            this._redraw(); this._update_frame_label(); this._highlight()
        }, ms)
    }

    private _pause(): void {
        this._playing = false
        if (this._play_btn) this._play_btn.textContent = '▶'
        this._stop_timer()
    }

    private _stop_timer(): void { if (this._timer !== null) { clearInterval(this._timer); this._timer = null } }

    private _goto(i: number): void {
        const n = this._data.frames.length
        if (n === 0) return
        this._pause()
        this._cur = ((i % n) + n) % n
        this._redraw(); this._update_frame_label(); this._highlight()
    }

    /** Refreshes preview state after a frames/speed change (restarts the timer if playing). */
    private _refresh_anim(): void {
        const n = this._data.frames.length
        if (this._cur >= n) this._cur = Math.max(0, n - 1)
        if (n === 0) { this._pause(); this._clear_canvas() }
        else if (this._playing) this._play()
        else this._redraw()
        this._update_frame_label(); this._highlight(); this._update_status()
    }

    private _update_frame_label(): void {
        const n = this._data.frames.length
        this._frame_label.textContent = n === 0 ? 'no subimages' : `image ${this._cur} / ${n - 1}`
    }

    private _highlight(): void {
        Array.from(this._strip.children).forEach((c, i) => {
            if (c instanceof HTMLElement && c.style.position === 'relative')
                c.style.borderColor = i === this._cur ? 'var(--sw-accent)' : 'var(--sw-border2)'
        })
    }

    private _update_status(): void {
        const n = this._data.frames.length
        this._status_el.textContent = `${this._data.width}×${this._data.height} px  ·  ${n} subimage${n === 1 ? '' : 's'}  ·  ${this._data.anim_speed} fps`
    }

    // ── Preview rendering (synchronous from cached images) ──────────────────────

    private _set_zoom(z: number): void {
        this._zoom = Math.max(1, Math.min(32, z))
        this._redraw()
    }

    private _fit_zoom(): void {
        if (this._data.width === 0 || this._data.height === 0) return
        const cw = this._canvas_wrap.clientWidth  || 420
        const ch = this._canvas_wrap.clientHeight || 320
        this._zoom = Math.max(1, Math.min(32, Math.floor(Math.min((cw - 20) / this._data.width, (ch - 20) / this._data.height)) || 1))
        this._redraw()
    }

    private _redraw(): void {
        const w = this._data.width, h = this._data.height
        if (w === 0 || h === 0) { this._clear_canvas(); return }
        const z = this._zoom
        const cw = w * z, ch = h * z
        // Only resize when it actually changes — reassigning canvas.width clears the
        // buffer and causes flicker during origin/mask dragging.
        if (this._canvas.width !== cw || this._canvas.height !== ch) { this._canvas.width = cw; this._canvas.height = ch }
        const ctx = this._ctx
        ctx.clearRect(0, 0, cw, ch)
        _draw_checkerboard(ctx, this._canvas.width, this._canvas.height)
        const img = this._imgs[this._cur]
        if (img) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 0, 0, this._canvas.width, this._canvas.height) }
        this._draw_origin(ctx)
        this._draw_mask(ctx)
    }

    private _clear_canvas(): void {
        this._canvas.width = 128; this._canvas.height = 128
        this._ctx.clearRect(0, 0, 128, 128)
        _draw_checkerboard(this._ctx, 128, 128)
    }

    private _draw_origin(ctx: CanvasRenderingContext2D): void {
        const ox = this._data.origin_x * this._zoom, oy = this._data.origin_y * this._zoom, s = 8
        const cross = () => { ctx.beginPath(); ctx.moveTo(ox - s, oy); ctx.lineTo(ox + s, oy); ctx.moveTo(ox, oy - s); ctx.lineTo(ox, oy + s); ctx.stroke() }
        ctx.save()
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; cross()
        ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 1.5; cross()
        ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()
        ctx.restore()
    }

    private _draw_mask(ctx: CanvasRenderingContext2D): void {
        const z = this._zoom
        const x = this._data.mask_x * z, y = this._data.mask_y * z, w = this._data.mask_w * z, hgt = this._data.mask_h * z
        ctx.save()
        ctx.strokeStyle = '#00c8ff'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3])
        switch (this._data.mask_type) {
            case 'ellipse':  ctx.beginPath(); ctx.ellipse(x + w / 2, y + hgt / 2, w / 2, hgt / 2, 0, 0, Math.PI * 2); ctx.stroke(); break
            case 'diamond':  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + hgt / 2); ctx.lineTo(x + w / 2, y + hgt); ctx.lineTo(x, y + hgt / 2); ctx.closePath(); ctx.stroke(); break
            case 'precise':  ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height); break
            default:         ctx.strokeRect(x, y, w, hgt)
        }
        ctx.restore()
    }

    // ── Canvas drag (origin / mask) — saves only on mouse-up ───────────────────

    private _canvas_pixel(e: MouseEvent): { x: number; y: number } {
        const r = this._canvas.getBoundingClientRect()
        return { x: Math.floor((e.clientX - r.left) / this._zoom), y: Math.floor((e.clientY - r.top) / this._zoom) }
    }

    private _on_down = (e: MouseEvent): void => {
        if (this._data.frames.length === 0) return
        const { x, y } = this._canvas_pixel(e)
        // Origin grabs first (within a few pixels), then the mask box.
        if (Math.abs(x - this._data.origin_x) <= 2 + 2 / this._zoom && Math.abs(y - this._data.origin_y) <= 2 + 2 / this._zoom) {
            this._dragging = 'origin'; this._drag_off = { x: x - this._data.origin_x, y: y - this._data.origin_y }; return
        }
        if (x >= this._data.mask_x && x <= this._data.mask_x + this._data.mask_w && y >= this._data.mask_y && y <= this._data.mask_y + this._data.mask_h) {
            this._dragging = 'mask'; this._drag_off = { x: x - this._data.mask_x, y: y - this._data.mask_y }
        }
    }

    private _on_move = (e: MouseEvent): void => {
        if (!this._dragging) return
        const { x, y } = this._canvas_pixel(e)
        if (this._dragging === 'origin') {
            this._data.origin_x = clamp(x - this._drag_off.x, 0, this._data.width)
            this._data.origin_y = clamp(y - this._drag_off.y, 0, this._data.height)
        } else {
            this._data.mask_x = clamp(x - this._drag_off.x, 0, this._data.width - this._data.mask_w)
            this._data.mask_y = clamp(y - this._drag_off.y, 0, this._data.height - this._data.mask_h)
        }
        this._redraw()
    }

    private _on_up = (): void => {
        if (!this._dragging) return
        this._dragging = null
        this._rebuild_props()   // reflect the dragged origin/mask in the inputs
        this._save_meta()
    }

    // ── Frame operations ───────────────────────────────────────────────────────

    private _unique_frame_name(): string {
        const used = new Set(this._data.frames.map(f => f.name))
        let i = 0; while (used.has(`${i}.png`)) i++
        return `${i}.png`
    }

    private async _new_frame(): Promise<void> {
        if (this._data.frames.length === 0) {
            const size = await _prompt_size(32, 32)
            if (!size) return
            this._data.width = size.w; this._data.height = size.h
            this._data.mask_w = size.w; this._data.mask_h = size.h
        }
        pixel_editor_open(this._win.el.parentElement!, this._data.width, this._data.height, null, (url) => this._add_frame(url))
    }

    private _edit_frame(i: number): void {
        const frame = this._data.frames[i]
        if (!frame) return
        pixel_editor_open(this._win.el.parentElement!, this._data.width, this._data.height, frame.data_url, async (url) => {
            frame.data_url = url
            this._imgs[i] = await _decode(url)
            this._rebuild_strip(); this._redraw(); this._save_frame_file(frame.name, url); this._save_meta()
        })
    }

    private async _add_frame(url: string): Promise<void> {
        const name = this._unique_frame_name()
        this._data.frames.push({ name, data_url: url })
        this._imgs.push(await _decode(url))
        this._cur = this._data.frames.length - 1
        await this._save_frame_file(name, url)
        this._rebuild_strip(); this._refresh_anim(); this._save_meta()
    }

    private async _import_frames(): Promise<void> {
        const input = document.createElement('input')
        input.type = 'file'; input.accept = 'image/png,image/jpeg,image/gif'; input.multiple = true
        input.onchange = async () => {
            for (const file of Array.from(input.files ?? [])) {
                const url = await _file_to_data_url(file)
                if (this._data.frames.length === 0) {
                    const img = await _decode(url)
                    this._data.width = img.naturalWidth; this._data.height = img.naturalHeight
                    this._data.mask_w = img.naturalWidth; this._data.mask_h = img.naturalHeight
                }
                const name = this._unique_frame_name()
                this._data.frames.push({ name, data_url: url })
                this._imgs.push(await _decode(url))
                try { await project_write_binary(`sprites/${this._sprite_name}/${name}`, file) } catch { /* no project dir */ }
            }
            this._cur = this._data.frames.length - 1
            this._rebuild_props(); this._rebuild_strip(); this._refresh_anim(); this._save_meta()
        }
        input.click()
    }

    private _delete_frame(i: number): void {
        this._data.frames.splice(i, 1)
        this._imgs.splice(i, 1)
        if (this._cur >= this._data.frames.length) this._cur = Math.max(0, this._data.frames.length - 1)
        this._rebuild_strip(); this._refresh_anim(); this._save_meta()
    }

    private _clear_frames(): void {
        if (this._data.frames.length === 0) return
        this._confirm(`Clear all subimages from "${this._sprite_name}"?`, () => {
            this._data.frames = []; this._imgs = []; this._cur = 0
            this._rebuild_strip(); this._refresh_anim(); this._save_meta()
        })
    }

    private _confirm(msg: string, ok: () => void): void {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;'
        const box = document.createElement('div')
        box.style.cssText = 'background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:280px;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:12px;'
        box.innerHTML = `<p style="margin:0;">${msg}</p>`
        const btns = document.createElement('div'); btns.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        const yes = document.createElement('button'); yes.textContent = 'Clear'; yes.style.cssText = 'padding:4px 16px;cursor:pointer;'
        const no = document.createElement('button'); no.textContent = 'Cancel'; no.style.cssText = 'padding:4px 16px;cursor:pointer;'
        btns.append(no, yes); box.appendChild(btns); overlay.appendChild(box); document.body.appendChild(overlay)
        no.addEventListener('click', () => overlay.remove())
        yes.addEventListener('click', () => { overlay.remove(); ok() })
    }

    // ── Persistence ────────────────────────────────────────────────────────────

    private async _save_frame_file(name: string, data_url: string): Promise<void> {
        try { const blob = await fetch(data_url).then(r => r.blob()); await project_write_binary(`sprites/${this._sprite_name}/${name}`, blob) }
        catch { /* no project dir open */ }
    }

    private async _load_data(): Promise<void> {
        try {
            const meta = JSON.parse(await project_read_file(`sprites/${this._sprite_name}/meta.json`)) as Partial<sprite_data>
            for (const k of ['origin_x', 'origin_y', 'width', 'height', 'anim_speed', 'mask_type', 'mask_x', 'mask_y', 'mask_w', 'mask_h'] as const) {
                if (meta[k] !== undefined) (this._data as any)[k] = meta[k]
            }
            if (meta.frames) {
                for (const f of meta.frames) {
                    let url = ''
                    try { url = await project_read_binary_url(`sprites/${this._sprite_name}/${f.name}`) } catch { /* missing */ }
                    this._data.frames.push({ name: f.name, data_url: url })
                }
            }
        } catch { /* fresh sprite */ }

        await this._refresh_images()
        this._rebuild_props()
        this._fit_zoom()
        this._refresh_anim()
    }

    private async _save_meta(): Promise<void> {
        const meta = {
            origin_x: this._data.origin_x, origin_y: this._data.origin_y,
            width: this._data.width, height: this._data.height, anim_speed: this._data.anim_speed,
            mask_type: this._data.mask_type, mask_x: this._data.mask_x, mask_y: this._data.mask_y, mask_w: this._data.mask_w, mask_h: this._data.mask_h,
            frames: this._data.frames.map(f => ({ name: f.name })),
        }
        // Write the meta first, THEN tell the tree to refresh — otherwise the tree reads
        // the sprite before meta.json exists and is stuck on the placeholder thumbnail.
        try { await project_write_file(`sprites/${this._sprite_name}/meta.json`, JSON.stringify(meta, null, 2)) } catch { /* no project dir */ }
        document.dispatchEvent(new CustomEvent('sw:resource_changed', { detail: { category: 'sprites', name: this._sprite_name } }))
    }
}

// =========================================================================
// Helpers
// =========================================================================

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))
const hw = (s: any): number => Math.floor(s._data.width / 2)
const hh = (s: any): number => Math.floor(s._data.height / 2)

function _decode(data_url: string): Promise<HTMLImageElement> {
    return new Promise((res) => {
        const img = new Image()
        img.onload = () => res(img)
        img.onerror = () => res(img)   // resolve anyway; a broken frame just draws nothing
        img.src = data_url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    })
}

function _btn(label: string, cb: () => void): HTMLButtonElement {
    const b = document.createElement('button')
    b.className = 'sw-btn'; b.textContent = label
    b.addEventListener('click', cb)
    return b
}

function _icon_btn(char: string, title: string, cb: () => void, w = 24): HTMLButtonElement {
    const b = document.createElement('button')
    b.textContent = char; b.title = title
    b.style.cssText = `min-width:${w}px; height:24px; cursor:pointer; background:var(--sw-chrome2); border:1px solid var(--sw-border2); color:var(--sw-text); font-size:12px; padding:0 4px;`
    b.addEventListener('click', cb)
    return b
}

function _vsep(): HTMLElement {
    const s = document.createElement('div')
    s.style.cssText = 'width:1px; height:18px; background:var(--sw-border2); margin:0 4px;'
    return s
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
    lbl.className = 'sw-label'; lbl.style.cssText += 'width:24px; text-align:right; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type = 'number'; inp.className = 'sw-input'; inp.style.cssText = 'flex:1; min-width:0;'
    inp.valueAsNumber = initial
    inp.addEventListener('change', () => on_change(inp.valueAsNumber || 0))
    row.append(lbl, inp)
    return row
}

function _draw_checkerboard(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const sz = 8
    for (let y = 0; y < h; y += sz) for (let x = 0; x < w; x += sz) {
        ctx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#555' : '#444'
        ctx.fillRect(x, y, sz, sz)
    }
}

function _prompt_size(default_w: number, default_h: number): Promise<{ w: number; h: number } | null> {
    return new Promise(resolve => {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;'
        const box = document.createElement('div')
        box.style.cssText = 'background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:240px;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:10px;'
        box.innerHTML = '<p style="margin:0;font-weight:600;">New Sprite Size</p>'
        const mk = (label: string, val: number) => {
            const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:8px;'
            const l = document.createElement('span'); l.textContent = label; l.style.cssText = 'min-width:54px;'
            const i = document.createElement('input'); i.type = 'number'; i.min = '1'; i.value = String(val)
            i.style.cssText = 'flex:1;padding:4px 6px;background:#3c3c3c;border:1px solid #555;color:#ddd;'
            row.append(l, i); return { row, input: i }
        }
        const wf = mk('Width', default_w), hf = mk('Height', default_h)
        const btns = document.createElement('div'); btns.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        const ok = document.createElement('button'); ok.textContent = 'OK'; ok.style.cssText = 'padding:4px 18px;cursor:pointer;'
        const cancel = document.createElement('button'); cancel.textContent = 'Cancel'; cancel.style.cssText = 'padding:4px 18px;cursor:pointer;'
        btns.append(ok, cancel); box.append(wf.row, hf.row, btns); overlay.appendChild(box); document.body.appendChild(overlay)
        const done = (v: { w: number; h: number } | null) => { overlay.remove(); resolve(v) }
        ok.addEventListener('click', () => done({ w: Math.max(1, parseInt(wf.input.value) || default_w), h: Math.max(1, parseInt(hf.input.value) || default_h) }))
        cancel.addEventListener('click', () => done(null))
        overlay.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') done(null) })
        setTimeout(() => { wf.input.focus(); wf.input.select() }, 10)
    })
}

async function _file_to_data_url(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
