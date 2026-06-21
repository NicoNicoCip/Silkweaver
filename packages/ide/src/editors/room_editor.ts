/**
 * Room editor window — modelled on the GameMaker Studio 1.4 room editor.
 *
 * Layout: a left properties panel with tabs (Objects / Settings / Tiles / Backgrounds /
 * Views / Physics) and a large canvas on the right. Instances render with their object's
 * real sprite (resolved object → `static sprite` → first frame image, with origin/scale/
 * rotation); spriteless objects fall back to a labelled box. Interaction follows GMS:
 * left-click adds the selected object (drag to paint a line of them), left-drag on an
 * existing instance moves it, right-click deletes, middle-drag pans, wheel zooms, Alt
 * disables snapping. Tile painting takes over the canvas while the Tiles tab is active.
 */

import { FloatingWindow }                                          from '../window_manager.js'
import { ICON }                                                    from '../icons.js'
import { get_project_object_names, get_project_resource_names }     from '../index.js'
import { script_editor_open_text }                                 from './script_editor.js'
import { project_read_file, project_write_file, project_read_binary_url, project_file_exists, project_has_folder } from '../services/project.js'
import { doc_register, doc_confirm_close, type doc_handle } from '../services/documents.js'
import { snapshot_history }                                 from '../services/undo.js'
import { sprite_slice_cells, type scale_mode } from '../services/sprite_slice.js'
import { tooltip_attach } from '../services/tooltip.js'
import type {
    room_instance, room_background_layer, room_view, room_tile, room_file,
} from '@silkweaver/project'

// =========================================================================
// Types — the canonical room format lives in @silkweaver/project
// =========================================================================

export type { room_instance, room_background_layer, room_view, room_tile }

/** The in-memory room (== the room.json file shape, fully populated). */
type room_data = room_file

type panel_tab = 'objects' | 'settings' | 'tiles' | 'views' | 'backgrounds' | 'physics'

/** A resolved sprite ready to draw: decoded image + origin + size. */
interface sprite_render {
    img: HTMLImageElement; ox: number; oy: number; w: number; h: number
    scale_mode: scale_mode; sl: number; st: number; sr: number; sb: number   // scale-mode + 9-slice insets
}

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
    private _workspace: HTMLElement

    // Canvas
    private _canvas:  HTMLCanvasElement
    private _ctx:     CanvasRenderingContext2D
    private _zoom     = 1
    private _pan_x    = 0
    private _pan_y    = 0

    // Placement
    private _place_object  = ''                            // object to add with left mouse
    private _selected_inst: room_instance | null = null
    private _delete_underlying = true                      // replace an instance already in the cell

    // Drag-move state
    private _drag_inst:   room_instance | null = null
    private _drag_ox      = 0
    private _drag_oy      = 0
    private _drag_moved   = false

    // Add-paint / delete-paint state (left/right drag across the room)
    private _adding       = false
    private _deleting     = false
    private _last_cell    = { x: NaN, y: NaN }

    // Pan state
    private _panning    = false
    private _pan_start  = { mx: 0, my: 0, px: 0, py: 0 }

    private _snap_x     = GRID
    private _snap_y     = GRID
    private _show_grid  = true

    private _panel_tab: panel_tab = 'objects'
    private _panel_el:  HTMLElement = document.createElement('div')

    // Object-sprite resolution caches (shared across all instances)
    private _obj_sprite   = new Map<string, string | null>()   // object name → sprite name (null = none)
    private _obj_resolving = new Set<string>()
    private _sprite_cache  = new Map<string, sprite_render>()   // sprite name → decoded render data
    private _sprite_loading = new Set<string>()

    // Tile painting state (active while the Tiles tab is selected)
    private _tile_bg     = ''       // current tileset (background resource name)
    private _tile_w      = GRID     // tile cell width
    private _tile_h      = GRID     // tile cell height
    private _tile_sel_l  = 0        // selected cell left in the tileset (px)
    private _tile_sel_t  = 0        // selected cell top in the tileset (px)
    private _tile_depth  = 1000000  // current tile layer depth (drawn behind instances)
    private _tile_paint  = false    // left-drag painting
    private _tile_erase  = false    // right-drag erasing
    private _tileset_imgs = new Map<string, HTMLImageElement>()  // loaded tileset images by bg_name
    private _tileset_loading = new Set<string>()                 // tilesets currently being loaded (dedupe)
    private _next_tile_id = 1       // next unique tile id within this room

    private _on_closed_cb: (() => void) | null = null
    private _doc:          doc_handle | null = null
    private _hist!:        snapshot_history<room_data>   // per-window undo of _data
    private _restoring     = false                        // true while applying an undo/redo
    private _picker_popup: HTMLElement | null = null
    private _zoom_lbl!: HTMLElement
    private _picker_btn!: HTMLButtonElement

    constructor(workspace: HTMLElement, room_name: string) {
        this._room_name = room_name
        this._workspace = workspace

        const off = (_next_offset++ % 6) * 24
        this._win = new FloatingWindow(
            `room-editor-${room_name}`,
            `Room: ${room_name}`,
            ICON.room,
            { x: 280 + off, y: 44 + off, w: 940, h: 600 },
        )
        this._win.on_close(() => {
            this._close_picker()
            document.removeEventListener('sw:resource_changed', this._on_resource_changed)
            this._doc?.dispose()
            this._on_closed_cb?.()
        })
        // A sprite edited elsewhere (origin / scale-mode / 9-slice…) must invalidate our render cache
        // so the canvas reflects it live.
        document.addEventListener('sw:resource_changed', this._on_resource_changed)

        this._data = _default_room()

        // Canvas placeholder (replaced in _build_ui)
        this._canvas = document.createElement('canvas')
        this._ctx    = this._canvas.getContext('2d')!

        this._build_ui()
        this._hist = new snapshot_history<room_data>((s) => structuredClone(s), (s) => this._restore(s))
        this._load_data()
        this._win.mount(workspace)
        this._doc = doc_register({
            id: `rooms/${room_name}`, label: `Room: ${room_name}`, window: this._win,
            flush: () => this._flush_to_disk(),
        })
        this._win.on_before_close(() => this._doc ? doc_confirm_close(this._doc, `Room: ${this._room_name}`) : true)
        this._win.set_undo_handler({ undo: () => this._hist.undo(), redo: () => this._hist.redo() })
    }

    bring_to_front(): void { this._win.bring_to_front() }
    on_closed(cb: () => void): void { this._on_closed_cb = cb }

    /** Evicts a changed sprite from the render cache so the next draw reloads its updated meta. */
    private _on_resource_changed = (e: Event): void => {
        const detail = (e as CustomEvent).detail as { category?: string; name?: string } | undefined
        if (detail?.category !== 'sprites' || !detail.name) return
        this._sprite_cache.delete(detail.name)
        this._redraw()
    }

    // ── UI ─────────────────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden;'

        // ── Toolbar ────────────────────────────────────────────────────────
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'

        // Grid toggle
        const grid_toggle = document.createElement('button')
        grid_toggle.className = 'sw-btn'
        grid_toggle.textContent = 'Grid'
        grid_toggle.title = 'Toggle the snap grid overlay'
        grid_toggle.style.cssText = this._show_grid ? 'background:var(--sw-accent);' : ''
        grid_toggle.addEventListener('click', () => {
            this._show_grid = !this._show_grid
            grid_toggle.style.background = this._show_grid ? 'var(--sw-accent)' : ''
            this._redraw()
        })
        toolbar.appendChild(grid_toggle)

        // Snap X / Y
        toolbar.append(_inline_label('Snap'))
        const snap_x = _small_num(this._snap_x, (v) => { this._snap_x = Math.max(1, v); this._redraw() })
        const snap_y = _small_num(this._snap_y, (v) => { this._snap_y = Math.max(1, v); this._redraw() })
        snap_x.title = 'Horizontal snap (px)'
        snap_y.title = 'Vertical snap (px)'
        toolbar.append(snap_x, _inline_label('×'), snap_y)

        toolbar.appendChild(_toolbar_sep())

        // Zoom
        const zoom_out = _icon_tool_btn('−', () => this._adjust_zoom(-0.25))
        const zoom_lbl = document.createElement('span')
        zoom_lbl.style.cssText = 'font-size:11px; min-width:38px; text-align:center;'
        zoom_lbl.textContent = '100%'
        const zoom_in  = _icon_tool_btn('+', () => this._adjust_zoom(+0.25))
        const zoom_reset = _icon_tool_btn('⟲', () => this._reset_view())
        zoom_reset.title = 'Reset zoom & recenter'
        toolbar.append(zoom_out, zoom_lbl, zoom_in, zoom_reset)
        this._zoom_lbl = zoom_lbl

        body.appendChild(toolbar)

        // ── Main split (panel LEFT, canvas RIGHT — GMS layout) ───────────────
        const main = document.createElement('div')
        main.style.cssText = 'display:flex; flex:1; overflow:hidden;'
        body.appendChild(main)

        // Left panel
        const left = document.createElement('div')
        left.className = 'sw-room-panel'
        left.appendChild(this._build_left_panel())
        main.appendChild(left)

        // Canvas area
        const canvas_wrap = document.createElement('div')
        canvas_wrap.style.cssText = 'flex:1; overflow:hidden; position:relative; background:#1a1a1a;'
        this._canvas = document.createElement('canvas')
        this._canvas.tabIndex = 0   // focusable, so Delete/Backspace can target the selected instance
        this._canvas.style.cssText = 'display:block; outline:none;'
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

        // Canvas events
        this._canvas.addEventListener('wheel',     (e) => { e.preventDefault(); this._on_wheel(e) }, { passive: false })
        this._canvas.addEventListener('mousedown', (e) => this._on_mouse_down(e))
        this._canvas.addEventListener('mousemove', (e) => this._on_mouse_move(e))
        this._canvas.addEventListener('mouseup',   (e) => this._on_mouse_up(e))
        this._canvas.addEventListener('mouseleave',(e) => this._on_mouse_up(e))
        this._canvas.addEventListener('contextmenu', (e) => e.preventDefault())
        this._canvas.addEventListener('keydown',   (e) => this._on_key_down(e))
    }

    private _build_left_panel(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; height:100%;'

        // Tab bar
        const tabs_el = document.createElement('div')
        tabs_el.className = 'sw-room-tabs'
        const tabs: panel_tab[] = ['objects','settings','tiles','views','backgrounds','physics']
        for (const tab of tabs) {
            const btn = document.createElement('button')
            btn.className = `sw-room-tab${tab === this._panel_tab ? ' active' : ''}`
            btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
            btn.addEventListener('click', () => {
                this._close_picker()
                this._panel_tab = tab
                tabs_el.querySelectorAll('.sw-room-tab').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                this._rebuild_panel()
                this._redraw()   // tile/instance affordances differ per tab
            })
            tabs_el.appendChild(btn)
        }
        el.appendChild(tabs_el)

        this._panel_el.style.cssText = 'flex:1; overflow-y:auto; overflow-x:hidden;'
        this._panel_el.appendChild(this._build_panel_content())
        el.appendChild(this._panel_el)
        return el
    }

    private _rebuild_panel(): void {
        this._panel_el.innerHTML = ''
        this._panel_el.appendChild(this._build_panel_content())
    }

    private _build_panel_content(): HTMLElement {
        switch (this._panel_tab) {
            case 'objects':     return this._panel_objects()
            case 'settings':    return this._panel_settings()
            case 'tiles':       return this._panel_tiles()
            case 'views':       return this._panel_views()
            case 'backgrounds': return this._panel_backgrounds()
            case 'physics':     return this._panel_physics()
            default:            return _form_container()
        }
    }

    // ── Objects panel ────────────────────────────────────────────────────────

    private _panel_objects(): HTMLElement {
        const el = _form_container()

        // Object to add
        el.appendChild(_section_hdr('Object to add'))
        const picker_btn = document.createElement('button')
        picker_btn.className = 'sw-btn'
        picker_btn.style.cssText = 'display:flex; align-items:center; gap:8px; width:100%; justify-content:flex-start; padding:4px 6px; height:32px;'
        picker_btn.addEventListener('click', () => this._toggle_object_picker(picker_btn))
        this._picker_btn = picker_btn
        this._update_picker_button()
        el.appendChild(picker_btn)

        el.appendChild(_check_field('Delete underlying', this._delete_underlying, (v) => { this._delete_underlying = v }))

        // Instructions (GMS-style)
        const help = document.createElement('div')
        help.style.cssText = 'font-size:10.5px; color:var(--sw-text-dim); margin:6px 0; line-height:1.5; border:1px solid var(--sw-border2); padding:6px; border-radius:3px;'
        help.innerHTML =
            '<b>Left</b> click = add object<br>' +
            '<b>Left</b> drag = paint a row<br>' +
            'drag an instance = move it<br>' +
            '<b>Right</b> click = delete<br>' +
            'hold <b>Alt</b> = no snapping<br>' +
            '<b>Middle</b> drag = pan · wheel = zoom'
        el.appendChild(help)

        // Selected-instance properties
        const sel = this._selected_inst
        if (sel) {
            el.appendChild(_section_hdr(`Selected: ${sel.object_name}`))
            el.append(
                _num_field('X:',        sel.x,        (v) => { sel.x = v; this._redraw(); this._rebuild_panel(); this._save() }),
                _num_field('Y:',        sel.y,        (v) => { sel.y = v; this._redraw(); this._rebuild_panel(); this._save() }),
                _num_field('Scale X:',  sel.scale_x,  (v) => { sel.scale_x = v; this._redraw(); this._save() }),
                _num_field('Scale Y:',  sel.scale_y,  (v) => { sel.scale_y = v; this._redraw(); this._save() }),
                _num_field('Rotation:', sel.rotation, (v) => { sel.rotation = v; this._redraw(); this._save() }),
            )
            el.appendChild(this._creation_code_button(
                'Creation Code (this = instance)',
                sel.creation_code,
                `room-inst-cc:${this._room_name}#${sel.id}`,
                `${sel.object_name} · Creation Code`,
                (code) => { sel.creation_code = code; this._save() },
            ))
        }

        // Instance list
        const hdr = document.createElement('div')
        hdr.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-top:6px;'
        hdr.appendChild(_section_hdr(`Instances (${this._data.instances.length})`))
        if (this._data.instances.length > 0) {
            const clear = document.createElement('button')
            clear.className = 'sw-btn'
            clear.style.cssText = 'font-size:10px;'
            clear.textContent = 'Clear all'
            clear.addEventListener('click', () => {
                if (this._data.instances.length === 0) return
                this._data.instances = []
                this._selected_inst = null
                this._redraw(); this._save(); this._rebuild_panel()
            })
            hdr.appendChild(clear)
        }
        el.appendChild(hdr)

        if (this._data.instances.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;'
            empty.textContent = 'No instances yet.'
            el.appendChild(empty)
            return el
        }
        for (const inst of this._data.instances) {
            const row = document.createElement('div')
            row.className = `sw-room-inst-row${inst === this._selected_inst ? ' selected' : ''}`
            const lbl = document.createElement('span')
            lbl.style.cssText = 'flex:1; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
            lbl.textContent = `${inst.object_name} (${inst.x}, ${inst.y})`
            const del_btn = document.createElement('button')
            del_btn.className = 'sw-x-btn'
            del_btn.title = 'Delete instance'
            del_btn.textContent = '✕'
            del_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this._delete_instance(inst)
            })
            row.append(lbl, del_btn)
            row.addEventListener('click', () => {
                this._selected_inst = inst
                this._rebuild_panel()
                this._redraw()
            })
            el.appendChild(row)
        }
        return el
    }

    private _update_picker_button(): void {
        const btn = this._picker_btn
        btn.innerHTML = ''
        const thumb = document.createElement('canvas')
        thumb.width = 22; thumb.height = 22
        thumb.style.cssText = 'width:22px; height:22px; flex-shrink:0; image-rendering:pixelated; background:#0003; border:1px solid var(--sw-border2);'
        const name = document.createElement('span')
        name.style.cssText = 'flex:1; font-size:12px; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
        name.textContent = this._place_object || '(pick an object)'
        if (!this._place_object) name.style.color = 'var(--sw-text-dim)'
        const caret = document.createElement('span')
        caret.style.cssText = 'font-size:9px; color:var(--sw-text-dim);'
        caret.textContent = '▼'
        btn.append(thumb, name, caret)
        if (this._place_object) this._draw_object_thumb(thumb, this._place_object)
    }

    private _toggle_object_picker(anchor: HTMLElement): void {
        if (this._picker_popup) { this._close_picker(); return }
        const names = get_project_object_names().sort((a, b) => a.localeCompare(b))

        const pop = document.createElement('div')
        pop.style.cssText = 'position:fixed; z-index:100000; background:var(--sw-chrome2); border:1px solid var(--sw-border); ' +
            'box-shadow:0 4px 16px #0008; border-radius:4px; display:flex; flex-direction:column; width:200px; max-height:320px;'
        const r = anchor.getBoundingClientRect()
        pop.style.left = `${Math.round(r.left)}px`
        pop.style.top  = `${Math.round(r.bottom + 2)}px`

        const filter = document.createElement('input')
        filter.className = 'sw-input'
        filter.placeholder = 'Filter…'
        filter.style.cssText = 'margin:6px; width:calc(100% - 12px);'
        pop.appendChild(filter)

        const list = document.createElement('div')
        list.style.cssText = 'flex:1; overflow-y:auto;'
        pop.appendChild(list)

        const render_list = (q: string) => {
            list.innerHTML = ''
            const matches = names.filter(n => n.toLowerCase().includes(q.toLowerCase()))
            if (matches.length === 0) {
                const none = document.createElement('div')
                none.style.cssText = 'padding:8px; font-size:11px; color:var(--sw-text-dim); text-align:center;'
                none.textContent = names.length === 0 ? 'No objects in project.' : 'No matches.'
                list.appendChild(none)
                return
            }
            for (const n of matches) {
                const row = document.createElement('div')
                row.className = 'sw-room-inst-row'
                row.style.cssText = 'display:flex; align-items:center; gap:8px; padding:4px 8px; cursor:pointer;'
                const thumb = document.createElement('canvas')
                thumb.width = 20; thumb.height = 20
                thumb.style.cssText = 'width:20px; height:20px; flex-shrink:0; image-rendering:pixelated; background:#0003;'
                const lbl = document.createElement('span')
                lbl.style.cssText = 'font-size:12px;'
                lbl.textContent = n
                row.append(thumb, lbl)
                row.addEventListener('click', () => {
                    this._place_object = n
                    this._update_picker_button()
                    this._close_picker()
                })
                list.appendChild(row)
                this._draw_object_thumb(thumb, n)
            }
        }
        render_list('')
        filter.addEventListener('input', () => render_list(filter.value))

        // Close on outside click
        const outside = (ev: MouseEvent) => {
            if (!pop.contains(ev.target as Node) && ev.target !== anchor && !anchor.contains(ev.target as Node)) this._close_picker()
        }
        // Defer so this same click doesn't immediately close it.
        setTimeout(() => document.addEventListener('mousedown', outside), 0)
        ;(pop as any)._outside = outside

        document.body.appendChild(pop)
        this._picker_popup = pop
        filter.focus()
    }

    private _close_picker(): void {
        if (!this._picker_popup) return
        const outside = (this._picker_popup as any)._outside as ((e: MouseEvent) => void) | undefined
        if (outside) document.removeEventListener('mousedown', outside)
        this._picker_popup.remove()
        this._picker_popup = null
    }

    // ── Settings panel ───────────────────────────────────────────────────────

    private _panel_settings(): HTMLElement {
        const el = _form_container()
        const name_row = _text_field('Name:', this._room_name, () => { /* rename via the resource tree */ })
        ;(name_row.querySelector('input') as HTMLInputElement).disabled = true
        el.append(
            _tip(name_row, 'Rename the room from the Resources tree (right-click → Rename).'),
            _tip(_num_field('Width:',  this._data.width,  (v) => { this._data.width  = v; this._redraw(); this._save() }),
                'The room’s world width in pixels — independent of the game window size in Game Settings.'),
            _tip(_num_field('Height:', this._data.height, (v) => { this._data.height = v; this._redraw(); this._save() }),
                'The room’s world height in pixels — independent of the game window size in Game Settings.'),
            _tip(_num_field('Room Speed:', this._data.room_speed, (v) => { this._data.room_speed = v; this._save() }),
                'This room’s frame rate (FPS). This is the value that actually runs; it overrides the project default in Game Settings.'),
            _tip(_check_field('Persistent', this._data.persistent, (v) => { this._data.persistent = v; this._save() }),
                'Keep this room’s live state (instances, variables) when you leave and return, instead of rebuilding it fresh.'),
        )
        el.appendChild(this._creation_code_button(
            'Creation Code',
            this._data.creation_code,
            `room-cc:${this._room_name}`,
            `${this._room_name} · Creation Code`,
            (code) => { this._data.creation_code = code; this._save() },
        ))
        return el
    }

    /**
     * Builds a labelled "Edit Creation Code" button that opens the code in a Monaco window
     * (like every other code surface in the IDE), with a preview of the current first line.
     * @param current - The code at build time (refreshed each panel rebuild)
     * @param key     - Dedup key for the editor window
     * @param title   - Editor window title
     * @param on_save - Persists the edited code back into the room data
     */
    private _creation_code_button(
        label: string, current: string, key: string, title: string, on_save: (code: string) => void,
    ): HTMLElement {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:3px;'
        wrap.appendChild(_section_hdr(label))
        const btn = document.createElement('button')
        btn.className = 'sw-btn'
        btn.style.cssText = 'display:flex; align-items:center; gap:6px; width:100%; justify-content:flex-start; padding:4px 6px;'
        const icon = document.createElement('span'); icon.textContent = '{ }'; icon.style.cssText = 'font-family:monospace; color:var(--sw-accent);'
        const txt  = document.createElement('span')
        txt.style.cssText = 'flex:1; text-align:left; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
        const has_code = current.trim().length > 0
        txt.textContent = has_code ? (current.trim().split('\n')[0] || 'Edit code…') : 'Edit code…'
        if (!has_code) txt.style.color = 'var(--sw-text-dim)'
        btn.append(icon, txt)
        btn.addEventListener('click', () => {
            script_editor_open_text(this._workspace, key, title, current, (code) => {
                on_save(code)
                // Refresh the preview line on the panel.
                txt.textContent = code.trim() ? (code.trim().split('\n')[0] || 'Edit code…') : 'Edit code…'
                txt.style.color = code.trim() ? 'var(--sw-text)' : 'var(--sw-text-dim)'
            })
        })
        wrap.appendChild(btn)
        return wrap
    }

    // ── Views panel ──────────────────────────────────────────────────────────

    private _panel_views(): HTMLElement {
        const el = _form_container()
        el.appendChild(_section_hdr(`Views (${this._data.views.length})`))

        const add_btn = document.createElement('button')
        add_btn.className = 'sw-btn'
        add_btn.style.cssText = 'font-size:10px; margin-bottom:4px;'
        add_btn.textContent = '+ Add View'
        add_btn.addEventListener('click', () => {
            this._data.views.push(_default_view())
            this._rebuild_panel(); this._redraw(); this._save()
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
                _check_field('Enabled',  view.enabled,  (v) => { view.enabled  = v; summary.textContent = `View ${i}${v ? '' : ' (disabled)'}` ; this._redraw(); this._save() }),
                _num_field('View X:',  view.view_x,  (v) => { view.view_x  = v; this._redraw(); this._save() }),
                _num_field('View Y:',  view.view_y,  (v) => { view.view_y  = v; this._redraw(); this._save() }),
                _num_field('View W:',  view.view_w,  (v) => { view.view_w  = v; this._redraw(); this._save() }),
                _num_field('View H:',  view.view_h,  (v) => { view.view_h  = v; this._redraw(); this._save() }),
                _num_field('Port X:',  view.port_x,  (v) => { view.port_x  = v; this._save() }),
                _num_field('Port Y:',  view.port_y,  (v) => { view.port_y  = v; this._save() }),
                _num_field('Port W:',  view.port_w,  (v) => { view.port_w  = v; this._save() }),
                _num_field('Port H:',  view.port_h,  (v) => { view.port_h  = v; this._save() }),
            )
            const follow_row = _select_field('Follow:', view.follow, get_project_object_names(), (v) => { view.follow = v; this._save() }, { empty: true, empty_label: '(no object)' })
            vw.appendChild(follow_row)

            const del_btn = document.createElement('button')
            del_btn.className = 'sw-btn'
            del_btn.style.cssText = 'font-size:10px; margin-top:4px;'
            del_btn.textContent = 'Remove View'
            del_btn.addEventListener('click', () => {
                this._data.views.splice(i, 1)
                this._rebuild_panel(); this._redraw(); this._save()
            })
            vw.appendChild(del_btn)
            el.appendChild(vw)
        })
        return el
    }

    // ── Backgrounds panel ──────────────────────────────────────────────────────

    private _panel_backgrounds(): HTMLElement {
        const el = _form_container()

        // Room background colour (GMS keeps this on the Backgrounds tab)
        el.appendChild(_section_hdr('Background Colour'))
        el.append(
            _check_field('Draw background colour', this._data.bg_show_color, (v) => { this._data.bg_show_color = v; this._redraw(); this._save() }),
            _color_field('Colour:', this._data.bg_color, (v) => { this._data.bg_color = v; this._redraw(); this._save() }),
        )

        el.appendChild(_section_hdr(`Background Layers (${this._data.backgrounds.length})`))
        const add_btn = document.createElement('button')
        add_btn.className = 'sw-btn'
        add_btn.style.cssText = 'font-size:10px; margin-bottom:4px;'
        add_btn.textContent = '+ Add Layer'
        add_btn.addEventListener('click', () => {
            this._data.backgrounds.push(_default_bg_layer())
            this._rebuild_panel(); this._save()
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
                _check_field('Enabled', layer.enabled, (v) => { layer.enabled = v; this._redraw(); this._save() }),
                _select_field('Resource:', layer.bg_name, get_project_resource_names('backgrounds'), (v) => {
                    layer.bg_name = v
                    summary.textContent = `BG ${i}: ${v || '(none)'}`
                    this._save()
                    if (v) this._ensure_tileset_loaded(v).then(() => this._redraw())
                    else   this._redraw()
                }, { empty: true }),
                _check_field('Tile X',  layer.tile_x,  (v) => { layer.tile_x  = v; this._redraw(); this._save() }),
                _check_field('Tile Y',  layer.tile_y,  (v) => { layer.tile_y  = v; this._redraw(); this._save() }),
                _check_field('Stretch', layer.stretch, (v) => { layer.stretch = v; this._redraw(); this._save() }),
            )
            const del_btn = document.createElement('button')
            del_btn.className = 'sw-btn'
            del_btn.style.cssText = 'font-size:10px; margin-top:4px;'
            del_btn.textContent = 'Remove Layer'
            del_btn.addEventListener('click', () => {
                this._data.backgrounds.splice(i, 1)
                this._rebuild_panel(); this._save()
            })
            bg.appendChild(del_btn)
            el.appendChild(bg)
        })
        return el
    }

    // ── Physics panel ──────────────────────────────────────────────────────────

    private _panel_physics(): HTMLElement {
        const el = _form_container()
        el.append(
            _check_field('Enable Physics World', this._data.physics_world, (v) => { this._data.physics_world = v; this._save() }),
            _num_field('Gravity X:', this._data.physics_gravity_x, (v) => { this._data.physics_gravity_x = v; this._save() }),
            _num_field('Gravity Y:', this._data.physics_gravity_y, (v) => { this._data.physics_gravity_y = v; this._save() }),
        )
        return el
    }

    // ── Tiles panel ────────────────────────────────────────────────────────

    private _panel_tiles(): HTMLElement {
        const el = _form_container()
        el.appendChild(_section_hdr('Tileset'))
        el.append(
            _select_field('Background:', this._tile_bg, get_project_resource_names('backgrounds'), (v) => {
                this._tile_bg = v.trim()
                this._ensure_tileset_loaded(this._tile_bg).then(() => this._rebuild_tiles_panel())
            }, { empty: true }),
            _num_field('Tile W:',  this._tile_w,    (v) => { this._tile_w     = Math.max(1, v); this._rebuild_tiles_panel() }),
            _num_field('Tile H:',  this._tile_h,    (v) => { this._tile_h     = Math.max(1, v); this._rebuild_tiles_panel() }),
            _num_field('Depth:',   this._tile_depth, (v) => { this._tile_depth = v }),
        )

        const hint = document.createElement('div')
        hint.style.cssText = 'font-size:11px; color:var(--sw-text-dim); margin:4px 0; line-height:1.4;'
        hint.textContent = 'Left-drag on the room to paint, right-drag to erase. Pick a tile below.'
        el.appendChild(hint)

        el.appendChild(_section_hdr('Tile'))
        el.appendChild(this._build_tile_picker())

        el.appendChild(_section_hdr(`Tiles in room (${this._data.tiles.length})`))
        const clear = document.createElement('button')
        clear.className = 'sw-btn'
        clear.textContent = 'Clear all tiles'
        clear.addEventListener('click', () => {
            if (this._data.tiles.length === 0) return
            this._data.tiles = []
            this._redraw(); this._save(); this._rebuild_tiles_panel()
        })
        el.appendChild(clear)
        return el
    }

    /** Re-renders the Tiles panel in place (used after async tileset load / field edits). */
    private _rebuild_tiles_panel(): void {
        if (this._panel_tab !== 'tiles') return
        this._rebuild_panel()
    }

    /** Builds the clickable tileset cell-picker canvas. */
    private _build_tile_picker(): HTMLElement {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'max-height:260px; overflow:auto; border:1px solid var(--sw-border); background:#111;'
        const img = this._tileset_imgs.get(this._tile_bg)
        if (!this._tile_bg) { wrap.textContent = ' Type a background resource name above.'; return wrap }
        if (!img)           { wrap.textContent = ' Loading / no image for "' + this._tile_bg + '".'; return wrap }

        const pick = document.createElement('canvas')
        pick.width  = img.naturalWidth
        pick.height = img.naturalHeight
        pick.style.cssText = 'display:block; image-rendering:pixelated; cursor:crosshair;'
        const ctx = pick.getContext('2d')!
        const paint_picker = () => {
            ctx.clearRect(0, 0, pick.width, pick.height)
            ctx.drawImage(img, 0, 0)
            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1
            for (let x = 0; x <= pick.width;  x += this._tile_w) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, pick.height); ctx.stroke() }
            for (let y = 0; y <= pick.height; y += this._tile_h) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(pick.width, y + 0.5); ctx.stroke() }
            // Selected cell
            ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2
            ctx.strokeRect(this._tile_sel_l + 1, this._tile_sel_t + 1, this._tile_w - 2, this._tile_h - 2)
        }
        paint_picker()
        pick.addEventListener('mousedown', (e) => {
            const r = pick.getBoundingClientRect()
            const px = (e.clientX - r.left) * (pick.width  / r.width)
            const py = (e.clientY - r.top)  * (pick.height / r.height)
            this._tile_sel_l = Math.floor(px / this._tile_w) * this._tile_w
            this._tile_sel_t = Math.floor(py / this._tile_h) * this._tile_h
            paint_picker()
        })
        wrap.appendChild(pick)
        return wrap
    }

    /** Loads a background image (the tileset) and caches it by name. */
    private async _ensure_tileset_loaded(bg_name: string): Promise<void> {
        if (!bg_name || this._tileset_imgs.has(bg_name) || this._tileset_loading.has(bg_name)) return
        this._tileset_loading.add(bg_name)
        try {
            const meta_path = `backgrounds/${bg_name}/meta.json`
            if (!(await project_file_exists(meta_path))) return
            const meta = JSON.parse(await project_read_file(meta_path)) as { file_name?: string }
            if (!meta.file_name) return
            const url = await project_read_binary_url(`backgrounds/${bg_name}/${meta.file_name}`)
            const img = await new Promise<HTMLImageElement>((res, rej) => {
                const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url
            })
            this._tileset_imgs.set(bg_name, img)
            this._redraw()
        } catch { /* missing/unreadable background — leave unloaded */ }
        finally { this._tileset_loading.delete(bg_name) }
    }

    // ── Object → sprite resolution ───────────────────────────────────────────

    /**
     * Resolves an object's sprite name from its class file (`static sprite = '…'`) and
     * loads that sprite's first frame. Cached; triggers a redraw when an image arrives.
     * @param obj_name - The object resource name.
     */
    private async _ensure_object_sprite(obj_name: string): Promise<void> {
        if (!obj_name) return
        if (!this._obj_sprite.has(obj_name)) {
            if (this._obj_resolving.has(obj_name)) return
            this._obj_resolving.add(obj_name)
            let sprite: string | null = null
            try {
                const src = await project_read_file(`objects/${obj_name}.ts`)
                const m = src.match(/static\s+sprite\s*(?::[^=]+)?=\s*['"]([^'"]+)['"]/)
                sprite = m ? m[1]! : null
            } catch { sprite = null }
            this._obj_sprite.set(obj_name, sprite)
            this._obj_resolving.delete(obj_name)
        }
        const sprite = this._obj_sprite.get(obj_name)
        if (sprite) await this._ensure_sprite_loaded(sprite)
    }

    /** Loads a sprite's first frame + origin/size, caches it, and redraws on arrival. */
    private async _ensure_sprite_loaded(sprite_name: string): Promise<void> {
        if (!sprite_name || this._sprite_cache.has(sprite_name) || this._sprite_loading.has(sprite_name)) return
        this._sprite_loading.add(sprite_name)
        try {
            const meta_path = `sprites/${sprite_name}/meta.json`
            if (!(await project_file_exists(meta_path))) return
            const meta = JSON.parse(await project_read_file(meta_path)) as {
                frames?: Array<{ name: string }>; origin_x?: number; origin_y?: number; width?: number; height?: number
                scale_mode?: scale_mode; slice_left?: number; slice_top?: number; slice_right?: number; slice_bottom?: number
            }
            const first = meta.frames?.[0]
            if (!first) return
            const url = await project_read_binary_url(`sprites/${sprite_name}/${first.name}`)
            const img = await new Promise<HTMLImageElement>((res, rej) => {
                const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url
            })
            this._sprite_cache.set(sprite_name, {
                img,
                ox: meta.origin_x ?? 0,
                oy: meta.origin_y ?? 0,
                w:  meta.width  ?? img.naturalWidth,
                h:  meta.height ?? img.naturalHeight,
                scale_mode: meta.scale_mode ?? 'stretch',
                sl: meta.slice_left ?? 0, st: meta.slice_top ?? 0, sr: meta.slice_right ?? 0, sb: meta.slice_bottom ?? 0,
            })
            this._redraw()
        } catch { /* unreadable sprite — fall back to a box */ }
        finally { this._sprite_loading.delete(sprite_name) }
    }

    /** Returns the cached sprite render for an object, kicking off a load if needed. */
    private _sprite_for(obj_name: string): sprite_render | null {
        const sprite = this._obj_sprite.get(obj_name)
        if (sprite === undefined) { this._ensure_object_sprite(obj_name); return null }
        if (sprite === null) return null
        const render = this._sprite_cache.get(sprite)
        if (!render) { this._ensure_sprite_loaded(sprite); return null }
        return render
    }

    /** Draws an object's sprite thumbnail (or a placeholder) into a small canvas. */
    private async _draw_object_thumb(canvas: HTMLCanvasElement, obj_name: string): Promise<void> {
        await this._ensure_object_sprite(obj_name)
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const render = this._sprite_for(obj_name)
        if (render) {
            // Fit the sprite into the thumbnail, preserving aspect.
            const s = Math.min(canvas.width / render.w, canvas.height / render.h)
            const w = render.w * s, h = render.h * s
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(render.img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
        } else {
            ctx.fillStyle = 'rgba(120,120,200,0.5)'
            ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4)
            ctx.fillStyle = '#fff'
            ctx.font = `${Math.floor(canvas.height * 0.5)}px sans-serif`
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText('?', canvas.width / 2, canvas.height / 2 + 1)
        }
    }

    // ── View / zoom ──────────────────────────────────────────────────────────

    private _adjust_zoom(delta: number): void {
        this._zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this._zoom + delta))
        if (this._zoom_lbl) this._zoom_lbl.textContent = Math.round(this._zoom * 100) + '%'
        this._redraw()
    }

    private _reset_view(): void {
        this._zoom = 1
        this._pan_x = 0
        this._pan_y = 0
        if (this._zoom_lbl) this._zoom_lbl.textContent = '100%'
        this._redraw()
    }

    // ── Canvas events ──────────────────────────────────────────────────────

    private _on_wheel(e: WheelEvent): void {
        const delta = e.deltaY > 0 ? -0.25 : 0.25
        this._adjust_zoom(delta)
    }

    private _on_mouse_down(e: MouseEvent): void {
        this._canvas.focus()
        const { rx, ry } = this._to_room_coords(e.clientX, e.clientY)

        // Middle-drag = pan (any tab).
        if (e.button === 1) {
            this._panning = true
            this._pan_start = { mx: e.clientX, my: e.clientY, px: this._pan_x, py: this._pan_y }
            return
        }

        // Tile painting takes over the canvas while the Tiles tab is active.
        if (this._panel_tab === 'tiles') {
            if (e.button === 0)      { this._tile_paint = true; this._paint_tile(rx, ry) }
            else if (e.button === 2) { this._tile_erase = true; this._erase_tile(rx, ry) }
            return
        }

        // Outside the Objects tab the canvas is select-only (no accidental edits).
        if (this._panel_tab !== 'objects') {
            if (e.button === 0) {
                this._selected_inst = this._hit_test(rx, ry)
                this._redraw()
            }
            return
        }

        // ── Objects tab ──
        if (e.button === 0) {
            const hit = this._hit_test(rx, ry)
            if (hit && !e.shiftKey) {
                // Select + begin a move drag.
                this._selected_inst = hit
                this._drag_inst = hit
                this._drag_ox = rx - hit.x
                this._drag_oy = ry - hit.y
                this._drag_moved = false
                this._rebuild_panel()
                this._redraw()
            } else {
                // Add (Shift forces a fresh add even over an existing instance).
                if (!this._place_object) { this._selected_inst = null; this._rebuild_panel(); this._redraw(); return }
                this._adding = true
                this._last_cell = { x: NaN, y: NaN }
                this._add_at(rx, ry, e.altKey)
            }
        } else if (e.button === 2) {
            // Right = delete (and begin sweep-delete).
            this._deleting = true
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
        const { rx, ry } = this._to_room_coords(e.clientX, e.clientY)

        if (this._tile_paint || this._tile_erase) {
            if (this._tile_paint) this._paint_tile(rx, ry)
            else                  this._erase_tile(rx, ry)
            return
        }
        if (this._adding) { this._add_at(rx, ry, e.altKey); return }
        if (this._deleting) {
            const hit = this._hit_test(rx, ry)
            if (hit) this._delete_instance(hit)
            return
        }
        if (this._drag_inst) {
            this._drag_inst.x = this._snap(rx - this._drag_ox, this._snap_x, e.altKey)
            this._drag_inst.y = this._snap(ry - this._drag_oy, this._snap_y, e.altKey)
            this._drag_moved = true
            this._rebuild_panel()
            this._redraw()
        }
    }

    private _on_mouse_up(_e: MouseEvent): void {
        if (this._panning)     { this._panning  = false; return }
        if (this._tile_paint || this._tile_erase) {
            this._tile_paint = false; this._tile_erase = false
            this._save(); this._rebuild_tiles_panel(); return
        }
        if (this._adding)   { this._adding = false; this._save(); this._rebuild_panel(); return }
        if (this._deleting) { this._deleting = false; this._save(); return }
        if (this._drag_inst) {
            this._drag_inst = null
            if (this._drag_moved) { this._save(); this._rebuild_panel() }
            return
        }
    }

    private _on_key_down(e: KeyboardEvent): void {
        if ((e.key === 'Delete' || e.key === 'Backspace') && this._selected_inst) {
            e.preventDefault()
            this._delete_instance(this._selected_inst)
        }
    }

    // ── Instance helpers ───────────────────────────────────────────────────

    /** Adds an instance at the snapped cell under (rx,ry), unless one is already there. */
    private _add_at(rx: number, ry: number, no_snap: boolean): void {
        const x = this._snap(rx, this._snap_x, no_snap)
        const y = this._snap(ry, this._snap_y, no_snap)
        // While drag-painting, only add once per cell.
        if (x === this._last_cell.x && y === this._last_cell.y) return
        this._last_cell = { x, y }

        if (this._delete_underlying) {
            // Remove any instance whose cell coincides (same snapped position).
            for (let i = this._data.instances.length - 1; i >= 0; i--) {
                const o = this._data.instances[i]!
                if (this._snap(o.x, this._snap_x, no_snap) === x && this._snap(o.y, this._snap_y, no_snap) === y) {
                    if (this._selected_inst === o) this._selected_inst = null
                    this._data.instances.splice(i, 1)
                }
            }
        }
        this._place_instance(x, y)
    }

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
        this._ensure_object_sprite(this._place_object)
        this._rebuild_panel()
        this._redraw()
    }

    private _delete_instance(inst: room_instance): void {
        const idx = this._data.instances.indexOf(inst)
        if (idx !== -1) this._data.instances.splice(idx, 1)
        if (this._selected_inst === inst) this._selected_inst = null
        this._rebuild_panel()
        this._redraw()
        this._save()
    }

    private _hit_test(rx: number, ry: number): room_instance | null {
        // Hit test in reverse (topmost first), using each instance's drawn bounds.
        for (let i = this._data.instances.length - 1; i >= 0; i--) {
            const inst = this._data.instances[i]!
            const b = this._inst_bounds(inst)
            if (rx >= b.l && rx <= b.r && ry >= b.t && ry <= b.b) return inst
        }
        return null
    }

    /** The instance's drawn AABB in room space (sprite-aware; rotation ignored for hit-testing). */
    private _inst_bounds(inst: room_instance): { l: number; t: number; r: number; b: number } {
        const render = this._sprite_for(inst.object_name)
        if (render) {
            const sx = Number.isFinite(inst.scale_x) ? inst.scale_x : 1
            const sy = Number.isFinite(inst.scale_y) ? inst.scale_y : 1
            const w = render.w * sx
            const h = render.h * sy
            const l = inst.x - render.ox * sx
            const t = inst.y - render.oy * sy
            const b = { l: Math.min(l, l + w), t: Math.min(t, t + h), r: Math.max(l, l + w), b: Math.max(t, t + h) }
            // Guarantee a clickable area even at tiny / zero scale.
            if (b.r - b.l < 6) { b.l = inst.x - 3; b.r = inst.x + 3 }
            if (b.b - b.t < 6) { b.t = inst.y - 3; b.b = inst.y + 3 }
            return b
        }
        // Spriteless: a 32×32 marker anchored at the instance position.
        return { l: inst.x, t: inst.y, r: inst.x + 32, b: inst.y + 32 }
    }

    private _snap(v: number, step: number, no_snap: boolean): number {
        if (no_snap || step <= 0) return Math.round(v)
        return Math.round(v / step) * step
    }

    // ── Tile helpers ───────────────────────────────────────────────────────

    /** Paints (or replaces) a tile at the cell under (rx, ry) on the current depth. */
    private _paint_tile(rx: number, ry: number): void {
        if (!this._tile_bg) return
        const tx = Math.floor(rx / this._tile_w) * this._tile_w
        const ty = Math.floor(ry / this._tile_h) * this._tile_h
        if (tx < 0 || ty < 0 || tx >= this._data.width || ty >= this._data.height) return

        // One tile per cell+depth: replace if a tile is already there.
        const existing = this._data.tiles.find(t => t.x === tx && t.y === ty && t.depth === this._tile_depth)
        if (existing) {
            if (existing.bg_name === this._tile_bg && existing.left === this._tile_sel_l && existing.top === this._tile_sel_t
                && existing.width === this._tile_w && existing.height === this._tile_h) return  // identical — no-op
            existing.bg_name = this._tile_bg
            existing.left = this._tile_sel_l; existing.top = this._tile_sel_t
            existing.width = this._tile_w;    existing.height = this._tile_h
        } else {
            this._data.tiles.push({
                id: this._next_tile_id++, bg_name: this._tile_bg,
                left: this._tile_sel_l, top: this._tile_sel_t, width: this._tile_w, height: this._tile_h,
                x: tx, y: ty, depth: this._tile_depth,
            })
        }
        this._ensure_tileset_loaded(this._tile_bg)
        this._redraw()
    }

    /** Erases the topmost tile under (rx, ry). */
    private _erase_tile(rx: number, ry: number): void {
        for (let i = this._data.tiles.length - 1; i >= 0; i--) {
            const t = this._data.tiles[i]!
            if (rx >= t.x && rx < t.x + t.width && ry >= t.y && ry < t.y + t.height) {
                this._data.tiles.splice(i, 1)
                this._redraw()
                return
            }
        }
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
        ctx.imageSmoothingEnabled = false

        ctx.save()
        ctx.translate(this._pan_x, this._pan_y)
        ctx.scale(this._zoom, this._zoom)

        // Room background (solid clear colour, or a neutral grey when disabled)
        ctx.fillStyle = this._data.bg_show_color ? (this._data.bg_color || '#000000') : '#1e1e1e'
        ctx.fillRect(0, 0, this._data.width, this._data.height)

        // Background layers (behind tiles & instances; tiled / stretched per layer flags)
        for (const layer of this._data.backgrounds) this._draw_bg_layer(ctx, layer)

        // Room border
        ctx.strokeStyle = '#555'
        ctx.lineWidth   = 1 / this._zoom
        ctx.strokeRect(0, 0, this._data.width, this._data.height)

        // Tiles (depth-sorted: higher depth draws further back, behind instances)
        const tiles_sorted = [...this._data.tiles].sort((a, b) => b.depth - a.depth)
        for (const t of tiles_sorted) this._draw_tile(ctx, t)

        // Grid
        if (this._show_grid) this._draw_grid(ctx)

        // Instances
        for (const inst of this._data.instances) this._draw_instance(ctx, inst)

        // Views
        for (const view of this._data.views) {
            if (!view.enabled) continue
            ctx.save()
            ctx.strokeStyle = 'rgba(0,200,255,0.5)'
            ctx.lineWidth   = 1 / this._zoom
            ctx.setLineDash([4 / this._zoom, 2 / this._zoom])
            ctx.strokeRect(view.view_x, view.view_y, view.view_w, view.view_h)
            ctx.restore()
        }

        ctx.restore()
    }

    /**
     * Draws one background layer into the room. The background images share the tileset
     * image cache (both live under backgrounds/<name>/). Honours stretch and per-axis tiling;
     * clipped to the room so tiled/stretched layers never spill past the room bounds.
     */
    private _draw_bg_layer(ctx: CanvasRenderingContext2D, layer: room_background_layer): void {
        if (!layer.bg_name || layer.visible_in_editor === false) return
        const img = this._tileset_imgs.get(layer.bg_name)
        if (!img) { this._ensure_tileset_loaded(layer.bg_name); return }   // loads, then redraws

        const rw = this._data.width, rh = this._data.height
        ctx.save()
        ctx.beginPath(); ctx.rect(0, 0, rw, rh); ctx.clip()
        if (layer.stretch) {
            ctx.drawImage(img, 0, 0, rw, rh)
        } else {
            const iw = img.naturalWidth  || img.width  || 1
            const ih = img.naturalHeight || img.height || 1
            const cols = layer.tile_x ? Math.ceil(rw / iw) : 1
            const rows = layer.tile_y ? Math.ceil(rh / ih) : 1
            for (let r = 0; r < rows; r++)
                for (let c = 0; c < cols; c++)
                    ctx.drawImage(img, c * iw, r * ih)
        }
        ctx.restore()
    }

    private _draw_tile(ctx: CanvasRenderingContext2D, t: room_tile): void {
        const img = this._tileset_imgs.get(t.bg_name)
        if (img) {
            ctx.drawImage(img, t.left, t.top, t.width, t.height, t.x, t.y, t.width, t.height)
        } else {
            // Placeholder until the tileset image finishes loading.
            ctx.save()
            ctx.fillStyle   = 'rgba(120,180,120,0.25)'
            ctx.fillRect(t.x, t.y, t.width, t.height)
            ctx.strokeStyle = 'rgba(120,180,120,0.6)'
            ctx.lineWidth   = 1 / this._zoom
            ctx.strokeRect(t.x, t.y, t.width, t.height)
            ctx.restore()
            this._ensure_tileset_loaded(t.bg_name)
        }
    }

    private _draw_grid(ctx: CanvasRenderingContext2D): void {
        const gx = this._snap_x, gy = this._snap_y
        const rw = this._data.width
        const rh = this._data.height
        ctx.save()
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth   = 1 / this._zoom
        if (gx > 0) for (let x = 0; x <= rw; x += gx) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rh); ctx.stroke() }
        if (gy > 0) for (let y = 0; y <= rh; y += gy) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rw, y); ctx.stroke() }
        ctx.restore()
    }

    private _draw_instance(ctx: CanvasRenderingContext2D, inst: room_instance): void {
        const is_sel = inst === this._selected_inst
        const render = this._sprite_for(inst.object_name)

        if (render) {
            const sxv = inst.scale_x, syv = inst.scale_y
            ctx.save()
            ctx.translate(inst.x, inst.y)
            if (inst.rotation) ctx.rotate(-inst.rotation * Math.PI / 180)   // GMS image_angle is counter-clockwise
            ctx.imageSmoothingEnabled = false
            if (render.scale_mode !== 'stretch' && (sxv !== 1 || syv !== 1)) {
                // Tile / 9-slice: fill the area with cells. Tiling/sizing use |scale| (a raw negative
                // scale would give zero/negative cells → nothing drawn); a negative axis becomes a
                // mirror about the origin via ctx.scale, matching the engine's sprite_scale_cells.
                const asx = Math.abs(sxv), asy = Math.abs(syv)
                ctx.save()
                ctx.scale(sxv < 0 ? -1 : 1, syv < 0 ? -1 : 1)
                const ax = -render.ox * asx, ay = -render.oy * asy
                for (const c of sprite_slice_cells(render.scale_mode, render.w, render.h, asx, asy, render.sl, render.st, render.sr, render.sb)) {
                    ctx.drawImage(render.img, c.sx, c.sy, c.sw, c.sh, ax + c.dx, ay + c.dy, c.dw, c.dh)
                }
                ctx.restore()
            } else {
                // Stretch: confine ctx.scale to the drawImage so it can't distort the selection outline.
                ctx.save()
                ctx.scale(sxv, syv)
                ctx.drawImage(render.img, -render.ox, -render.oy, render.w, render.h)
                ctx.restore()
            }
            // Selection outline — drawn in the rotated but UNSCALED frame using already-scaled
            // dimensions, so the line stays a uniform weight for any non-uniform / negative scale.
            if (is_sel) {
                ctx.strokeStyle = '#0078d4'
                ctx.lineWidth   = 2 / this._zoom
                ctx.strokeRect(-render.ox * sxv, -render.oy * syv, render.w * sxv, render.h * syv)
            }
            ctx.restore()
            // Origin marker
            ctx.save()
            ctx.fillStyle = is_sel ? '#0078d4' : 'rgba(255,80,80,0.9)'
            ctx.beginPath(); ctx.arc(inst.x, inst.y, 2.5 / this._zoom, 0, Math.PI * 2); ctx.fill()
            ctx.restore()
            return
        }

        // Spriteless fallback: a labelled 32×32 marker anchored at the instance position.
        const b = this._inst_bounds(inst)
        ctx.save()
        ctx.fillStyle   = is_sel ? 'rgba(0,120,212,0.55)' : 'rgba(80,80,200,0.4)'
        ctx.strokeStyle = is_sel ? '#0078d4' : '#6666cc'
        ctx.lineWidth   = (is_sel ? 2 : 1) / this._zoom
        ctx.fillRect(b.l, b.t, b.r - b.l, b.b - b.t)
        ctx.strokeRect(b.l, b.t, b.r - b.l, b.b - b.t)

        ctx.fillStyle  = '#fff'
        ctx.font       = `${Math.max(7, 9 / this._zoom)}px sans-serif`
        ctx.textAlign  = 'center'
        ctx.textBaseline = 'middle'
        const short = inst.object_name.length > 8 ? inst.object_name.slice(0, 7) + '…' : inst.object_name
        ctx.fillText(short, (b.l + b.r) / 2, (b.t + b.b) / 2)

        // Origin marker
        ctx.fillStyle = '#ff4444'
        ctx.beginPath(); ctx.arc(inst.x, inst.y, 2 / this._zoom, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
    }

    // ── Persistence ────────────────────────────────────────────────────────

    private async _load_data(): Promise<void> {
        try {
            const json = await project_read_file(`rooms/${this._room_name}/room.json`)
            const loaded = JSON.parse(json) as Partial<room_data>
            Object.assign(this._data, loaded)
            if (!Array.isArray(this._data.tiles)) this._data.tiles = []  // older rooms predate tiles
            // Fill in fields older rooms omit (scale/rotation/creation code were added later).
            // Without this, a loaded instance's `scale_x` is undefined and any sprite-aware math
            // (rendering, hit-testing) becomes NaN — sprite instances would vanish and be unclickable.
            for (const inst of this._data.instances) {
                if (typeof inst.scale_x  !== 'number') inst.scale_x  = 1
                if (typeof inst.scale_y  !== 'number') inst.scale_y  = 1
                if (typeof inst.rotation !== 'number') inst.rotation = 0
                if (typeof inst.creation_code !== 'string') inst.creation_code = ''
            }
            // Restore next instance ID to avoid collisions
            const max_id = this._data.instances.reduce((m, i) => Math.max(m, i.id), 0)
            if (max_id >= _next_inst_id) _next_inst_id = max_id + 1
            // Restore tile ID counter and preload the tilesets the room references.
            this._next_tile_id = this._data.tiles.reduce((m, t) => Math.max(m, t.id), 0) + 1
            for (const b of new Set(this._data.tiles.map(t => t.bg_name).filter(Boolean))) this._ensure_tileset_loaded(b)
            for (const b of new Set(this._data.backgrounds.map(l => l.bg_name).filter(Boolean))) this._ensure_tileset_loaded(b)
            // Preload object sprites so instances render with their real graphics.
            for (const o of new Set(this._data.instances.map(i => i.object_name).filter(Boolean))) this._ensure_object_sprite(o)
        } catch {
            // New room
        }
        this._redraw()
        this._rebuild_panel()
        this._hist.init(this._data)
    }

    private _save(): void {
        this._doc?.mark_dirty()
        if (!this._restoring) this._hist?.commit(this._data)
    }

    /** Installs an undo/redo snapshot: swap in the state, drop stale selections, preload assets, redraw. */
    private _restore(s: room_data): void {
        this._restoring = true
        this._data = s
        if (!Array.isArray(this._data.tiles)) this._data.tiles = []
        this._selected_inst = null
        this._drag_inst     = null
        this._adding = this._deleting = false
        // Preload referenced tilesets/sprites so the canvas renders with real graphics (caches dedupe).
        for (const b of new Set(this._data.tiles.map(t => t.bg_name).filter(Boolean)))       this._ensure_tileset_loaded(b)
        for (const b of new Set(this._data.backgrounds.map(l => l.bg_name).filter(Boolean))) this._ensure_tileset_loaded(b)
        for (const o of new Set(this._data.instances.map(i => i.object_name).filter(Boolean))) this._ensure_object_sprite(o)
        this._redraw()
        this._rebuild_panel()
        this._doc?.mark_dirty()
        this._restoring = false
    }

    private async _flush_to_disk(): Promise<void> {
        if (!project_has_folder()) return
        await project_write_file(
            `rooms/${this._room_name}/room.json`,
            JSON.stringify(this._data, null, 2),
        )
    }
}

// =========================================================================
// Default data factories
// =========================================================================

// The room_speed a freshly-created room starts at — the project's "Default room speed (new rooms)"
// from Game Settings (each room then overrides it in its own settings). Kept in sync by index.ts.
let _new_room_speed = 60
/** Sets the room_speed new rooms are created with (Game Settings → Default room speed). */
export function room_editor_set_default_speed(n: number): void { _new_room_speed = Math.max(1, Math.round(n)) || 60 }

function _default_room(): room_data {
    return {
        width:             640,
        height:            480,
        room_speed:        _new_room_speed,
        persistent:        false,
        creation_code:     '',
        instances:         [],
        backgrounds:       [],
        views:             [],
        tiles:             [],
        bg_color:          '#000000',
        bg_show_color:     true,
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

function _toolbar_sep(): HTMLElement {
    const sep = document.createElement('div')
    sep.style.cssText = 'width:1px; align-self:stretch; background:var(--sw-border); margin:0 4px;'
    return sep
}

function _inline_label(text: string): HTMLElement {
    const s = document.createElement('span')
    s.style.cssText = 'font-size:11px; color:var(--sw-text-dim);'
    s.textContent = text
    return s
}

function _small_num(initial: number, on_change: (v: number) => void): HTMLInputElement {
    const inp = document.createElement('input')
    inp.type  = 'number'
    inp.className = 'sw-input'
    inp.style.cssText = 'width:42px;'
    inp.min = '1'
    inp.valueAsNumber = initial
    inp.addEventListener('change', () => on_change(inp.valueAsNumber || 1))
    return inp
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

/** Attaches a hover help tooltip to a field row (marks its label as having help) and returns it. */
function _tip(el: HTMLElement, text: string): HTMLElement {
    const lbl = el.querySelector('.sw-label, span')
    if (lbl) (lbl as HTMLElement).classList.add('sw-has-help')
    tooltip_attach(el, text)
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
    inp.style.cssText = 'flex:1; min-width:0;'
    inp.value = initial
    inp.addEventListener('change', () => on_change(inp.value))
    row.append(lbl, inp)
    return row
}

/**
 * A labelled dropdown (`<select>`) for choosing a resource by name instead of typing it.
 * Preserves an unknown current value (e.g. a renamed/deleted resource) as a selectable option
 * so it is never silently dropped.
 * @param opts.empty       - include a blank "(none)" option
 * @param opts.empty_label - label for the blank option
 */
function _select_field(
    label: string, value: string, options: string[], on_change: (v: string) => void,
    opts: { empty?: boolean; empty_label?: string } = {},
): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:6px;'
    const lbl = document.createElement('span')
    lbl.className   = 'sw-label'
    lbl.style.cssText += 'min-width:60px; margin:0;'
    lbl.textContent = label

    const sel = document.createElement('select')
    sel.className = 'sw-select'
    sel.style.cssText = 'flex:1; min-width:0;'

    if (opts.empty) {
        const o = document.createElement('option')
        o.value = ''; o.textContent = opts.empty_label ?? '(none)'
        if (!value) o.selected = true
        sel.appendChild(o)
    }
    const all = [...options]
    if (value && !all.includes(value)) all.unshift(value)   // keep a now-missing resource visible
    for (const name of all) {
        const o = document.createElement('option')
        o.value = name; o.textContent = name
        if (name === value) o.selected = true
        sel.appendChild(o)
    }
    if (all.length === 0 && !opts.empty) {
        const o = document.createElement('option')
        o.value = ''; o.textContent = '(none defined)'
        sel.appendChild(o)
    }

    sel.addEventListener('change', () => on_change(sel.value))
    row.append(lbl, sel)
    return row
}

function _color_field(label: string, initial: string, on_change: (v: string) => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:6px;'
    const lbl = document.createElement('span')
    lbl.className   = 'sw-label'
    lbl.style.cssText += 'min-width:60px; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type  = 'color'
    inp.value = /^#[0-9a-fA-F]{6}$/.test(initial) ? initial : '#000000'
    inp.style.cssText = 'width:42px; height:24px; padding:0; border:1px solid var(--sw-border); background:none; cursor:pointer;'
    inp.addEventListener('input', () => on_change(inp.value))
    row.append(lbl, inp)
    return row
}
