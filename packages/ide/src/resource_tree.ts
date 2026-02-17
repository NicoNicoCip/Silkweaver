/**
 * Resource Tree floating window.
 * GMS 1.4-style collapsible tree with 9 resource categories.
 * Double-clicking a resource dispatches a custom 'sw:open_resource' event.
 */

import { FloatingWindow } from './window_manager.js'
import type { project_state } from './services/project.js'
import { project_read_binary_url, project_read_file } from './services/project.js'

// =========================================================================
// Types
// =========================================================================

export interface open_resource_event {
    category: resource_category
    name:     string
}

export type resource_category =
    | 'sprites' | 'sounds' | 'backgrounds' | 'paths'
    | 'scripts' | 'fonts' | 'timelines' | 'objects' | 'rooms'

interface category_def {
    id:    resource_category
    label: string
    glyph: string   // UTF character used as icon
}

// =========================================================================
// Constants
// =========================================================================

const CATEGORIES: category_def[] = [
    { id: 'sprites',     label: 'Sprites',     glyph: '\u25A4' },  // ▤  image grid
    { id: 'sounds',      label: 'Sounds',      glyph: '\u266A' },  // ♪  music note
    { id: 'backgrounds', label: 'Backgrounds', glyph: '\u2588' },  // █  solid block
    { id: 'paths',       label: 'Paths',       glyph: '\u2922' },  // ⤢  crossed arrows
    { id: 'scripts',     label: 'Scripts',     glyph: '\u007B' },  // {  brace
    { id: 'fonts',       label: 'Fonts',       glyph: 'A'       }, //    letter A
    { id: 'timelines',   label: 'Timelines',   glyph: '\u23F1' },  // ⏱  clock
    { id: 'objects',     label: 'Objects',     glyph: '\u25CB' },  // ○  circle
    { id: 'rooms',       label: 'Rooms',       glyph: '\u2395' },  // ⎕  rectangle
]

// =========================================================================
// Resource Tree
// =========================================================================

export class ResourceTree {
    private _win:          FloatingWindow
    private _container:    HTMLElement
    private _workspace:    HTMLElement | null = null
    private _closed:       boolean = false
    private _state:        project_state | null = null
    private _category_els: Map<resource_category, HTMLElement> = new Map()
    private _arrows:       Map<resource_category, HTMLElement> = new Map()
    private _expanded:     Set<resource_category>              = new Set()

    // Callbacks
    on_add_resource:    (cat: resource_category) => void = () => {}
    on_delete_resource: (cat: resource_category, name: string) => void = () => {}
    on_rename_resource: (cat: resource_category, old_name: string, new_name: string) => void = () => {}

    constructor() {
        this._win = new FloatingWindow(
            'resource-tree',
            'Resources',
            null,
            { x: 8, y: 8, w: 220, h: 500 },
        )
        this._win.on_close(() => { this._closed = true })

        this._container = document.createElement('div')
        this._container.style.cssText = 'overflow-y:auto; height:100%; padding:4px 0;'

        for (const cat of CATEGORIES) {
            this._container.appendChild(this._build_category(cat))
        }

        this._win.body.appendChild(this._container)
    }

    // ── Public API ────────────────────────────────────────────────────────

    /** Mount the resource tree window to the workspace. */
    mount(parent: HTMLElement): void {
        this._workspace = parent
        this._closed = false
        this._win.mount(parent)
    }

    /**
     * Show the resource tree. If it was closed, remounts it.
     * If already open, brings it to the front.
     */
    show(): void {
        if (!this._workspace) return
        if (this._closed) {
            this._closed = false
            this._win.mount(this._workspace)
        } else {
            this._win.bring_to_front()
        }
    }

    /** Populate the tree from a loaded project state. */
    load(state: project_state): void {
        this._state = state
        this._refresh_all()
    }

    /** Add a resource entry to the tree. */
    add_resource(cat: resource_category, name: string): void {
        if (!this._state) return
        this._state.resources[cat][name] = { name }
        this._refresh_category(cat)
    }

    /** Remove a resource entry from the tree. */
    remove_resource(cat: resource_category, name: string): void {
        if (!this._state) return
        delete this._state.resources[cat][name]
        this._refresh_category(cat)
    }

    // ── Build ─────────────────────────────────────────────────────────────

    private _build_category(cat: category_def): HTMLElement {
        const wrapper = document.createElement('div')

        // Header row
        const header = document.createElement('div')
        header.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:24px; padding:0 6px 0 8px;
            cursor:pointer;
            color:var(--sw-text);
            background:var(--sw-chrome2);
            border-bottom:1px solid var(--sw-border2);
        `
        header.style.userSelect = 'none'

        // Arrow indicator — rotates 90° when expanded
        const arrow = document.createElement('span')
        arrow.className = 'sw-tree-arrow'
        arrow.textContent = '\u25B6'  // ▶
        this._arrows.set(cat.id, arrow)

        // Category glyph icon
        const glyph = document.createElement('span')
        glyph.className = 'sw-tree-cat-glyph'
        glyph.textContent = cat.glyph

        const label = document.createElement('span')
        label.textContent = cat.label
        label.style.cssText = 'flex:1; font-size:12px;'

        const add_btn = _text_btn('+', 'Add', () => {
            this.on_add_resource(cat.id)
        })

        header.append(arrow, glyph, label, add_btn)

        // Item list
        const list = document.createElement('div')
        list.style.cssText = 'display:none;'

        this._category_els.set(cat.id, list)

        // Toggle expand on header click
        header.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.sw-tree-btn')) return
            const is_open = list.style.display !== 'none'
            list.style.display = is_open ? 'none' : 'block'
            if (is_open) {
                arrow.classList.remove('open')
                this._expanded.delete(cat.id)
            } else {
                arrow.classList.add('open')
                this._expanded.add(cat.id)
            }
        })

        wrapper.append(header, list)
        return wrapper
    }

    private _refresh_all(): void {
        for (const cat of CATEGORIES) {
            this._refresh_category(cat.id)
        }
    }

    private _refresh_category(cat_id: resource_category): void {
        const list = this._category_els.get(cat_id)
        if (!list || !this._state) return

        list.innerHTML = ''
        const resources = this._state.resources[cat_id]

        for (const name of Object.keys(resources).sort()) {
            list.appendChild(this._build_item(cat_id, name))
        }
    }

    private _build_item(cat_id: resource_category, name: string): HTMLElement {
        const row = document.createElement('div')
        row.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:22px; padding:0 6px 0 28px;
            cursor:pointer;
        `
        row.style.userSelect = 'none'

        // Icon: sprite gets a live thumbnail canvas; others get a glyph span
        const icon_el = this._make_item_icon(cat_id, name)

        const label = document.createElement('span')
        label.textContent = name
        label.style.cssText = 'flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'

        const del_btn = _text_btn('\u00D7', 'Delete', (e) => {
            e.stopPropagation()
            this.on_delete_resource(cat_id, name)
        })
        del_btn.style.display = 'none'

        row.append(icon_el, label, del_btn)

        // Hover: show/hide delete button and highlight
        row.addEventListener('mouseenter', () => {
            del_btn.style.display = ''
            row.style.background = 'var(--sw-select-bg)'
        })
        row.addEventListener('mouseleave', () => {
            del_btn.style.display = 'none'
            row.style.background = ''
        })

        // Double-click → open resource editor
        row.addEventListener('dblclick', () => {
            const event = new CustomEvent<open_resource_event>('sw:open_resource', {
                bubbles: true,
                detail:  { category: cat_id, name },
            })
            document.dispatchEvent(event)
        })

        return row
    }

    /**
     * Creates the icon element for an item row.
     * Sprites: a 16×16 canvas showing the first frame thumbnail.
     * All others: a span with the category glyph.
     */
    private _make_item_icon(cat_id: resource_category, name: string): HTMLElement {
        const cat_def = CATEGORIES.find(c => c.id === cat_id)!

        if (cat_id === 'sprites' && this._state) {
            const canvas = document.createElement('canvas')
            canvas.width  = 16
            canvas.height = 16
            canvas.style.cssText = 'width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;'

            // Load sprite meta.json to get frame information
            const load_thumbnail = async () => {
                try {
                    const meta_text = await project_read_file(`sprites/${name}/meta.json`)
                    const meta = JSON.parse(meta_text) as { frames?: Array<{ name: string } | string> }

                    if (meta.frames && meta.frames.length > 0) {
                        const first_frame = meta.frames[0]
                        const frame_name = typeof first_frame === 'string' ? first_frame : first_frame.name
                        const img_url = await project_read_binary_url(`sprites/${name}/${frame_name}`)

                        const img = new Image()
                        img.onload = () => {
                            const ctx = canvas.getContext('2d')!
                            ctx.clearRect(0, 0, 16, 16)
                            ctx.drawImage(img, 0, 0, 16, 16)
                        }
                        img.src = img_url
                    } else {
                        _draw_placeholder(canvas)
                    }
                } catch {
                    // No meta.json or frames — draw placeholder
                    _draw_placeholder(canvas)
                }
            }

            load_thumbnail()
            return canvas
        }

        if (cat_id === 'backgrounds' && this._state) {
            const canvas = document.createElement('canvas')
            canvas.width  = 16
            canvas.height = 16
            canvas.style.cssText = 'width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;'

            // Load background meta.json to get image file
            const load_thumbnail = async () => {
                try {
                    const meta_text = await project_read_file(`backgrounds/${name}/meta.json`)
                    const meta = JSON.parse(meta_text) as { file_name?: string }

                    if (meta.file_name) {
                        const img_url = await project_read_binary_url(`backgrounds/${name}/${meta.file_name}`)

                        const img = new Image()
                        img.onload = () => {
                            const ctx = canvas.getContext('2d')!
                            ctx.clearRect(0, 0, 16, 16)
                            ctx.drawImage(img, 0, 0, 16, 16)
                        }
                        img.src = img_url
                    } else {
                        _draw_placeholder(canvas)
                    }
                } catch {
                    // No meta.json or image — draw placeholder
                    _draw_placeholder(canvas)
                }
            }

            load_thumbnail()
            return canvas
        }

        // Fallback: glyph span
        const span = document.createElement('span')
        span.className = 'sw-tree-item-glyph'
        span.textContent = cat_def.glyph
        return span
    }
}

// =========================================================================
// Helpers
// =========================================================================

/**
 * Creates a small text-character button (e.g. + or ×).
 * @param char  - The UTF character to display
 * @param title - Tooltip text
 * @param cb    - Click callback
 */
function _text_btn(char: string, title: string, cb: (e: MouseEvent) => void): HTMLElement {
    const btn = document.createElement('button')
    btn.className = 'sw-tree-btn'
    btn.title = title
    btn.textContent = char
    btn.addEventListener('click', cb)
    return btn
}

/**
 * Draws a 4×4 grey checkered placeholder pattern on a canvas.
 */
function _draw_placeholder(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = 4
    for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
            ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#555' : '#333'
            ctx.fillRect(x, y, size, size)
        }
    }
}
