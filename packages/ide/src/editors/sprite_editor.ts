/**
 * Sprite editor window.
 * Import-only: manages frames, origin point, collision mask, and animation preview.
 */

import { FloatingWindow }                                                    from '../window_manager.js'
import { project_write_binary, project_read_file, project_write_file }       from '../services/project.js'

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

        const btn_import = _tool_btn('Import Frames', () => this._import_frames())
        const btn_clear  = _tool_btn('Clear All',     () => this._clear_frames())
        toolbar.append(btn_import, btn_clear)
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

        // Center: canvas preview
        const center = document.createElement('div')
        center.className = 'sw-sprite-preview-area'
        this._canvas = document.createElement('canvas')
        this._canvas.width  = 192
        this._canvas.height = 192
        this._canvas.className = 'sw-sprite-canvas'
        this._ctx = this._canvas.getContext('2d')!
        center.appendChild(this._canvas)
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
        if (!confirm(`Clear all frames from "${this._sprite_name}"?`)) return
        this._stop_anim()
        this._data.frames = []
        this._data.width  = 0
        this._data.height = 0
        this._rebuild_frame_list()
        this._clear_canvas()
        this._save_meta()
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

            row.append(thumb, label, del_btn)
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
            const ctx  = this._ctx
            const cw   = this._canvas.width
            const ch   = this._canvas.height
            ctx.clearRect(0, 0, cw, ch)
            // Checkerboard background for transparency
            _draw_checkerboard(ctx, cw, ch)
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

    private _draw_origin(ctx: CanvasRenderingContext2D): void {
        const cw = this._canvas.width
        const ch = this._canvas.height
        const fw = this._data.width  || cw
        const fh = this._data.height || ch
        const sx = (this._data.origin_x / fw) * cw
        const sy = (this._data.origin_y / fh) * ch
        ctx.save()
        ctx.strokeStyle = '#ff4444'
        ctx.lineWidth   = 1
        ctx.beginPath(); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + 6, sy); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(sx, sy - 6); ctx.lineTo(sx, sy + 6); ctx.stroke()
        ctx.restore()
    }

    private _draw_mask(ctx: CanvasRenderingContext2D): void {
        const cw  = this._canvas.width
        const ch  = this._canvas.height
        const fw  = this._data.width  || cw
        const fh  = this._data.height || ch
        const sx  = (this._data.mask_x / fw) * cw
        const sy  = (this._data.mask_y / fh) * ch
        const sw  = (this._data.mask_w / fw) * cw
        const sh  = (this._data.mask_h / fh) * ch
        ctx.save()
        ctx.strokeStyle = 'rgba(0,200,255,0.8)'
        ctx.lineWidth   = 1
        ctx.setLineDash([3, 2])
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
                ctx.lineTo(sx + sw,     sy + sh / 2)
                ctx.lineTo(sx + sw / 2, sy + sh)
                ctx.lineTo(sx,          sy + sh / 2)
                ctx.closePath()
                ctx.stroke()
                break
            case 'precise':
                // Precise mask uses full frame bounds as indicator
                ctx.strokeRect(0, 0, cw, ch)
                break
        }
        ctx.restore()
    }

    // ── Persistence ────────────────────────────────────────────────────────

    private async _load_data(): Promise<void> {
        try {
            const json = await project_read_file(`sprites/${this._sprite_name}/meta.json`)
            const loaded = JSON.parse(json) as Partial<sprite_data>
            // Merge loaded fields into defaults
            if (loaded.origin_x !== undefined) this._data.origin_x = loaded.origin_x
            if (loaded.origin_y !== undefined) this._data.origin_y = loaded.origin_y
            if (loaded.width    !== undefined) this._data.width    = loaded.width
            if (loaded.height   !== undefined) this._data.height   = loaded.height
            if (loaded.anim_speed !== undefined) this._data.anim_speed = loaded.anim_speed
            if (loaded.mask_type  !== undefined) this._data.mask_type  = loaded.mask_type
            if (loaded.mask_x !== undefined) this._data.mask_x = loaded.mask_x
            if (loaded.mask_y !== undefined) this._data.mask_y = loaded.mask_y
            if (loaded.mask_w !== undefined) this._data.mask_w = loaded.mask_w
            if (loaded.mask_h !== undefined) this._data.mask_h = loaded.mask_h

            // Restore frame list from stored names (data_url is session-only;
            // thumbnails will be blank until user re-imports or we add a blob loader)
            if (loaded.frames && loaded.frames.length > 0) {
                for (const f of loaded.frames) {
                    this._data.frames.push({ name: f.name, data_url: '' })
                }
            }
        } catch {
            // No meta yet — fresh sprite
        }
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
