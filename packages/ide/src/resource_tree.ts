/**
 * Resource Tree — a docked left panel (GMS 1.4 style) with collapsible resource categories.
 * Double-clicking a resource dispatches a custom 'sw:open_resource' event.
 */

import type { project_state } from './services/project.js'
import { ICON } from './icons.js'
import { show_context_menu } from './services/context_menu.js'
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
    glyph: string   // inline SVG icon markup (see icons.ts)
}

// =========================================================================
// Constants
// =========================================================================

const CATEGORIES: category_def[] = [
    { id: 'sprites',     label: 'Sprites',     glyph: ICON.sprite },  // ▤  image grid
    { id: 'sounds',      label: 'Sounds',      glyph: ICON.sound },  // ♪  music note
    { id: 'backgrounds', label: 'Backgrounds', glyph: ICON.background },  // █  solid block
    { id: 'paths',       label: 'Paths',       glyph: ICON.path },  // ⤢  crossed arrows
    { id: 'scripts',     label: 'Scripts',     glyph: ICON.script },  // {  brace
    { id: 'fonts',       label: 'Fonts',       glyph: ICON.font       }, //    letter A
    { id: 'timelines',   label: 'Timelines',   glyph: ICON.timeline },  // ⏱  clock
    { id: 'objects',     label: 'Objects',     glyph: ICON.object },  // ○  circle
    { id: 'rooms',       label: 'Rooms',       glyph: ICON.room },  // ⎕  rectangle
]

// =========================================================================
// Resource Tree
// =========================================================================

export class ResourceTree {
    private _container:    HTMLElement
    private _dock:         HTMLElement | null = null
    private _root_label:   HTMLElement | null = null
    private _state:        project_state | null = null
    private _category_els: Map<resource_category, HTMLElement> = new Map()
    private _arrows:       Map<resource_category, HTMLElement> = new Map()
    private _expanded:     Set<resource_category>              = new Set()

    // Callbacks
    on_add_resource:       (cat: resource_category) => void = () => {}
    on_delete_resource:    (cat: resource_category, name: string) => void = () => {}
    on_rename_resource:    (cat: resource_category, old_name: string, new_name: string) => void = () => {}
    on_duplicate_resource: (cat: resource_category, name: string) => void = () => {}

    constructor() {
        this._container = document.createElement('div')
        this._container.style.cssText = 'padding:0 0 2px;'
        this._container.appendChild(this._build_root())
        for (const cat of CATEGORIES) {
            this._container.appendChild(this._build_category(cat))
        }
        // An editor changed a resource's on-disk data (e.g. sprite frames) → refresh its row/thumbnail.
        document.addEventListener('sw:resource_changed', (e) => {
            const detail = (e as CustomEvent).detail as { category?: resource_category } | undefined
            if (detail?.category && this._state) this._refresh_category(detail.category)
        })
    }

    /** Builds the project root node (shows the project name). */
    private _build_root(): HTMLElement {
        const root = document.createElement('div')
        root.className = 'sw-tree-root'
        const icon = document.createElement('span')
        icon.className = 'sw-tree-cat-glyph'
        icon.innerHTML = ICON.project
        this._root_label = document.createElement('span')
        this._root_label.className = 'sw-tree-root-label'
        this._root_label.textContent = 'No project'
        root.append(icon, this._root_label)
        root.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation()
            show_context_menu(e.clientX, e.clientY, [
                { label: 'Expand All',   action: () => this.expand_all() },
                { label: 'Collapse All', action: () => this.collapse_all() },
            ])
        })
        return root
    }

    // ── Public API ────────────────────────────────────────────────────────

    /** Mount the tree into the docked panel. */
    mount(dock: HTMLElement): void {
        this._dock = dock
        dock.appendChild(this._build_filter())
        dock.appendChild(this._container)
    }

    /** Builds the resource filter box (sticky at the top of the dock). */
    private _build_filter(): HTMLElement {
        const wrap = document.createElement('div')
        wrap.className = 'sw-tree-filter'
        wrap.style.display    = 'flex'
        wrap.style.alignItems = 'center'
        wrap.style.gap        = '4px'
        const input = document.createElement('input')
        input.type = 'search'
        input.className = 'sw-input'
        input.placeholder = 'Filter resources…'
        input.style.flex = '1'
        input.style.minWidth = '0'
        input.addEventListener('input', () => this._apply_filter(input.value))
        const expand_btn   = _text_btn('⊕', 'Expand all',   () => this.expand_all())    // ⊕
        const collapse_btn = _text_btn('⊖', 'Collapse all', () => this.collapse_all())  // ⊖
        wrap.append(input, expand_btn, collapse_btn)
        return wrap
    }

    /**
     * Filters the tree by resource name. A non-empty query hides non-matching rows, auto-expands
     * categories that have matches, and hides categories with none. Clearing it restores the tree.
     */
    private _apply_filter(query: string): void {
        const q = query.trim().toLowerCase()
        for (const cat of CATEGORIES) {
            const list = this._category_els.get(cat.id)
            if (!list) continue
            const wrapper = list.parentElement as HTMLElement | null
            const arrow   = this._arrows.get(cat.id)
            const rows    = Array.from(list.children) as HTMLElement[]

            if (q === '') {
                if (wrapper) wrapper.style.display = ''
                for (const row of rows) row.style.display = ''
                const expanded = this._expanded.has(cat.id)
                list.style.display = expanded ? 'block' : 'none'
                arrow?.classList.toggle('open', expanded)
                continue
            }

            let matches = 0
            for (const row of rows) {
                const show = (row.dataset.name ?? '').toLowerCase().includes(q)
                row.style.display = show ? '' : 'none'
                if (show) matches++
            }
            if (matches > 0) {
                if (wrapper) wrapper.style.display = ''
                list.style.display = 'block'
                arrow?.classList.add('open')
            } else if (wrapper) {
                wrapper.style.display = 'none'
            }
        }
    }

    /** Toggle the docked resource panel's visibility. */
    show(): void {
        this._dock?.classList.toggle('sw-dock-hidden')
    }

    /** Populate the tree from a loaded project state. */
    load(state: project_state): void {
        this._state = state
        if (this._root_label) this._root_label.textContent = state.name || 'Untitled'
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
        glyph.innerHTML = cat.glyph

        const label = document.createElement('span')
        label.textContent = cat.label
        label.style.cssText = 'flex:1; font-size:12px;'

        const add_btn = _text_btn('+', 'Add', () => {
            this.on_add_resource(cat.id)
        })

        header.append(arrow, glyph, label, add_btn)

        // Right-click → "Create <type>" + expand/collapse
        header.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation()
            const list_el = this._category_els.get(cat.id)
            const expanded = !!list_el && list_el.style.display !== 'none'
            show_context_menu(e.clientX, e.clientY, [
                { label: `Create ${cat.label.slice(0, -1)}`, icon: cat.glyph, action: () => this.on_add_resource(cat.id) },
                { separator: true },
                { label: expanded ? 'Collapse' : 'Expand', action: () => header.click() },
            ])
        })

        // Item list
        const list = document.createElement('div')
        list.style.cssText = 'display:none;'

        this._category_els.set(cat.id, list)

        // Toggle expand on header click
        header.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.sw-tree-btn')) return
            this._set_expanded(cat.id, list.style.display === 'none')
        })

        wrapper.append(header, list)
        return wrapper
    }

    // ── Expand / collapse ───────────────────────────────────────────────────

    /** Sets a category's expanded state (updates the list, arrow, and tracking set). */
    private _set_expanded(cat_id: resource_category, expanded: boolean): void {
        const list  = this._category_els.get(cat_id)
        const arrow = this._arrows.get(cat_id)
        if (!list) return
        list.style.display = expanded ? 'block' : 'none'
        arrow?.classList.toggle('open', expanded)
        if (expanded) this._expanded.add(cat_id)
        else          this._expanded.delete(cat_id)
    }

    /** Expands a single category (used after creating a resource). */
    expand_category(cat_id: resource_category): void { this._set_expanded(cat_id, true) }

    /** Expands every category. */
    expand_all(): void { for (const c of CATEGORIES) this._set_expanded(c.id, true) }

    /** Collapses every category. */
    collapse_all(): void { for (const c of CATEGORIES) this._set_expanded(c.id, false) }

    /**
     * Starts inline (in-place) renaming of a resource row, Windows-Explorer style:
     * the label becomes a text field pre-filled with the name (selected). Enter commits
     * (fires on_rename_resource); Escape cancels; blur commits.
     */
    begin_rename(cat_id: resource_category, name: string): void {
        this._set_expanded(cat_id, true)
        const list = this._category_els.get(cat_id)
        if (!list) return
        const row = Array.from(list.children).find(r => (r as HTMLElement).dataset.name === name) as HTMLElement | undefined
        const label = row?.querySelector('.sw-tree-item-label') as HTMLElement | null
        if (!row || !label) return

        const input = document.createElement('input')
        input.className = 'sw-input'
        input.value = name
        input.style.cssText = 'flex:1; min-width:0; font-size:12px; height:18px; padding:0 3px;'
        label.replaceWith(input)
        input.focus()
        input.select()

        let done = false
        const finish = (commit: boolean): void => {
            if (done) return
            done = true
            const new_name = input.value.trim()
            input.replaceWith(label)   // transient: a successful rename refreshes the category
            if (commit && new_name && new_name !== name) this.on_rename_resource(cat_id, name, new_name)
        }
        input.addEventListener('keydown', (e) => {
            e.stopPropagation()
            if (e.key === 'Enter')       { e.preventDefault(); finish(true) }
            else if (e.key === 'Escape') { e.preventDefault(); finish(false) }
        })
        input.addEventListener('blur',     () => finish(true))
        input.addEventListener('click',    (e) => e.stopPropagation())
        input.addEventListener('dblclick', (e) => e.stopPropagation())
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
        row.dataset.name = name   // for the resource filter
        row.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:22px; padding:0 6px 0 28px;
            cursor:pointer;
        `
        row.style.userSelect = 'none'

        // Icon: sprite gets a live thumbnail canvas; others get a glyph span
        const icon_el = this._make_item_icon(cat_id, name)

        const label = document.createElement('span')
        label.className = 'sw-tree-item-label'
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

        const open = () => document.dispatchEvent(new CustomEvent<open_resource_event>('sw:open_resource', {
            bubbles: true,
            detail:  { category: cat_id, name },
        }))

        // Double-click → open resource editor
        row.addEventListener('dblclick', open)

        // Right-click → context menu
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation()
            show_context_menu(e.clientX, e.clientY, [
                { label: 'Open',      icon: ICON.open,   action: open },
                { separator: true },
                { label: 'Rename',                       action: () => this.begin_rename(cat_id, name) },
                { label: 'Duplicate',                    action: () => this.on_duplicate_resource(cat_id, name) },
                { separator: true },
                { label: 'Delete',    icon: ICON.delete, action: () => this.on_delete_resource(cat_id, name) },
            ])
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
                        const first_frame = meta.frames[0]!
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
        span.innerHTML = cat_def.glyph
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
