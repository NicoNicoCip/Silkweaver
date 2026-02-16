/**
 * Resource Tree floating window.
 * GMS 1.4-style collapsible tree with 9 resource categories.
 * Double-clicking a resource dispatches a custom 'sw:open_resource' event.
 */

import { FloatingWindow } from './window_manager.js'
import type { project_state } from './services/project.js'

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
    icon:  string   // path relative to ide/icons/
}

// =========================================================================
// Constants
// =========================================================================

const CATEGORIES: category_def[] = [
    { id: 'sprites',     label: 'Sprites',     icon: 'icons/sprite.svg' },
    { id: 'sounds',      label: 'Sounds',      icon: 'icons/sound.svg' },
    { id: 'backgrounds', label: 'Backgrounds', icon: 'icons/background.svg' },
    { id: 'paths',       label: 'Paths',       icon: 'icons/path.svg' },
    { id: 'scripts',     label: 'Scripts',     icon: 'icons/script.svg' },
    { id: 'fonts',       label: 'Fonts',       icon: 'icons/font.svg' },
    { id: 'timelines',   label: 'Timelines',   icon: 'icons/timeline.svg' },
    { id: 'objects',     label: 'Objects',     icon: 'icons/object.svg' },
    { id: 'rooms',       label: 'Rooms',       icon: 'icons/room.svg' },
]

// =========================================================================
// Resource Tree
// =========================================================================

export class ResourceTree {
    private _win:         FloatingWindow
    private _state:       project_state | null = null
    private _category_els: Map<resource_category, HTMLElement> = new Map()
    private _expanded:     Set<resource_category>              = new Set()

    // Callbacks
    on_add_resource:    (cat: resource_category) => void = () => {}
    on_delete_resource: (cat: resource_category, name: string) => void = () => {}
    on_rename_resource: (cat: resource_category, old_name: string, new_name: string) => void = () => {}

    constructor() {
        this._win = new FloatingWindow(
            'resource-tree',
            'Resources',
            'icons/folder.svg',
            { x: 8, y: 8, w: 220, h: 500 },
        )

        // Build tree container
        const container = document.createElement('div')
        container.style.cssText = 'overflow-y:auto; height:100%; padding:4px 0;'

        for (const cat of CATEGORIES) {
            container.appendChild(this._build_category(cat))
        }

        this._win.body.appendChild(container)
    }

    // ── Public API ────────────────────────────────────────────────────────

    /** Mount the resource tree window to the workspace. */
    mount(parent: HTMLElement): void {
        this._win.mount(parent)
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
            padding:3px 6px 3px 8px;
            cursor:pointer;
            color:var(--sw-text);
            background:var(--sw-chrome2);
            border-bottom:1px solid var(--sw-border2);
        `
        header.style.userSelect = 'none'

        const folder_icon = document.createElement('img')
        folder_icon.src = 'icons/folder.svg'
        folder_icon.style.cssText = 'width:14px;height:14px;flex-shrink:0;'

        const cat_icon = document.createElement('img')
        cat_icon.src = cat.icon
        cat_icon.style.cssText = 'width:14px;height:14px;flex-shrink:0;'

        const label = document.createElement('span')
        label.textContent = cat.label
        label.style.cssText = 'flex:1; font-size:12px;'

        const add_btn = _icon_btn('icons/add.svg', 'Add', () => {
            this.on_add_resource(cat.id)
        })

        header.append(folder_icon, cat_icon, label, add_btn)

        // Item list
        const list = document.createElement('div')
        list.style.cssText = 'display:none;'

        this._category_els.set(cat.id, list)

        // Toggle expand on header click
        header.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.sw-icon-btn')) return
            const is_open = list.style.display !== 'none'
            list.style.display = is_open ? 'none' : 'block'
            folder_icon.src = is_open ? 'icons/folder.svg' : 'icons/folder_open.svg'
            if (is_open) this._expanded.delete(cat.id)
            else         this._expanded.add(cat.id)
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
            padding:2px 6px 2px 28px;
            cursor:pointer;
        `
        row.style.userSelect = 'none'

        const cat_def = CATEGORIES.find(c => c.id === cat_id)!
        const icon = document.createElement('img')
        icon.src = cat_def.icon
        icon.style.cssText = 'width:14px;height:14px;flex-shrink:0;'

        const label = document.createElement('span')
        label.textContent = name
        label.style.cssText = 'flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'

        const del_btn = _icon_btn('icons/delete.svg', 'Delete', (e) => {
            e.stopPropagation()
            this.on_delete_resource(cat_id, name)
        })
        del_btn.style.display = 'none'

        row.append(icon, label, del_btn)

        // Hover: show delete button
        row.addEventListener('mouseenter', () => { del_btn.style.display = '' })
        row.addEventListener('mouseleave', () => { del_btn.style.display = 'none' })

        // Hover style
        row.addEventListener('mouseenter', () => { row.style.background = 'var(--sw-select-bg)' })
        row.addEventListener('mouseleave', () => { row.style.background = '' })

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
}

// =========================================================================
// Helpers
// =========================================================================

function _icon_btn(icon_src: string, title: string, cb: (e: MouseEvent) => void): HTMLElement {
    const btn = document.createElement('button')
    btn.className = 'sw-icon-btn'
    btn.title = title
    btn.style.cssText = `
        background:none; border:none; cursor:pointer;
        padding:1px; display:flex; align-items:center;
        flex-shrink:0;
    `
    const img = document.createElement('img')
    img.src = icon_src
    img.style.cssText = 'width:12px;height:12px;'
    btn.appendChild(img)
    btn.addEventListener('click', cb)
    return btn
}
