/**
 * Resource Tree — a docked left panel (GMS 1.4 style) with collapsible resource categories.
 * Double-clicking a resource dispatches a custom 'sw:open_resource' event.
 */

import type { project_state } from './services/project.js'
import type { undo_command } from './services/undo.js'
import { ICON } from './icons.js'
import { show_context_menu } from './services/context_menu.js'
import { project_read_binary_url, project_read_file, project_file_exists } from './services/project.js'

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

/** A snapshot of one category's folder organisation (for undo of folder/move operations). */
interface struct_snap {
    folders: string[]                              // the category's explicit folder paths
    assign:  Record<string, string | null>         // resource name → its folder (null = category root)
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

/** The resource currently being dragged (for folder drag-and-drop). */
let _drag: { cat: resource_category; name: string } | null = null

export class ResourceTree {
    private _container:    HTMLElement
    private _dock:         HTMLElement | null = null
    private _root_label:   HTMLElement | null = null
    private _state:        project_state | null = null
    private _category_els: Map<resource_category, HTMLElement> = new Map()
    private _arrows:       Map<resource_category, HTMLElement> = new Map()
    private _expanded:     Set<resource_category>              = new Set()
    private _thumb_dirty:  Set<resource_category>              = new Set()   // built while collapsed → redraw on expand
    private _folder_open:  Set<string>                         = new Set()   // expanded folders, keyed `${cat}:${path}`

    // Callbacks
    on_add_resource:       (cat: resource_category) => void = () => {}
    on_delete_resource:    (cat: resource_category, name: string) => void = () => {}
    on_rename_resource:    (cat: resource_category, old_name: string, new_name: string) => void = () => {}
    on_duplicate_resource: (cat: resource_category, name: string) => void = () => {}
    on_set_icon:           (cat: resource_category, name: string, sprite: string | null) => void = () => {}
    on_folders_changed:    () => void = () => {}   // a folder was created/renamed/deleted or a resource moved
    on_undo_push:          (cmd: undo_command) => void = () => {}   // record a reversible tree-structure change

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
                { label: `Create ${cat.label.slice(0, -1)}`, icon: cat.glyph,      action: () => this.on_add_resource(cat.id) },
                { label: 'New Folder…',                      icon: ICON.folder_add, action: () => { this._set_expanded(cat.id, true); this._new_folder(cat.id, '') } },
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
        if (expanded) {
            this._expanded.add(cat_id)
            // Thumbnails (sprites/backgrounds) drawn while the list was display:none don't paint;
            // rebuild now that it's visible so they show. Only needed once per collapsed build.
            if (this._thumb_dirty.has(cat_id)) this._refresh_category(cat_id)
        } else {
            this._expanded.delete(cat_id)
        }
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
        const row = Array.from(list.querySelectorAll('.sw-tree-item')).find(r => (r as HTMLElement).dataset.name === name) as HTMLElement | undefined
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
        this._render_into(cat_id, '', list, 0)
        this._make_drop_target(list, cat_id, '')   // drop onto the category background → move to root
        // If we built into a collapsed (hidden) list, its sprite/background thumbnails won't have
        // painted — flag it so they're redrawn the first time the category is expanded.
        if (list.style.display === 'none') this._thumb_dirty.add(cat_id)
        else                               this._thumb_dirty.delete(cat_id)
    }

    // ── Folders ───────────────────────────────────────────────────────────────

    /** Renders the subfolders + resources that live directly in `folder_path`, recursively. */
    private _render_into(cat_id: resource_category, folder_path: string, container: HTMLElement, depth: number): void {
        if (!this._state) return
        for (const sub of this._subfolders(cat_id, folder_path)) {
            const full = folder_path ? `${folder_path}/${sub}` : sub
            container.appendChild(this._build_folder(cat_id, full, sub, depth))
        }
        const resources = this._state.resources[cat_id]
        const here = Object.keys(resources).filter(n => (resources[n]?.folder ?? '') === folder_path).sort()
        for (const name of here) container.appendChild(this._build_item(cat_id, name, depth))
    }

    /** All folder paths in a category (explicit list + paths implied by resources, incl. ancestors). */
    private _all_folder_paths(cat_id: resource_category): Set<string> {
        const out = new Set<string>()
        const add = (p: string): void => {
            let acc = ''
            for (const part of p.split('/').filter(Boolean)) { acc = acc ? `${acc}/${part}` : part; out.add(acc) }
        }
        for (const f of (this._state?.folders?.[cat_id] ?? [])) add(f)
        for (const ref of Object.values(this._state?.resources[cat_id] ?? {})) {
            if (typeof ref.folder === 'string' && ref.folder) add(ref.folder)
        }
        return out
    }

    /** Immediate child folder names of `parent`, sorted. */
    private _subfolders(cat_id: resource_category, parent: string): string[] {
        const prefix = parent ? parent + '/' : ''
        const names = new Set<string>()
        for (const path of this._all_folder_paths(cat_id)) {
            if (parent && !path.startsWith(prefix)) continue
            const rest = parent ? path.slice(prefix.length) : path
            if (rest) names.add(rest.split('/')[0]!)
        }
        return [...names].sort()
    }

    /** Builds a collapsible folder header + its lazily-rendered (so visible thumbnails paint) body. */
    private _build_folder(cat_id: resource_category, full_path: string, display_name: string, depth: number): HTMLElement {
        const wrapper = document.createElement('div')
        const key  = `${cat_id}:${full_path}`
        const open = this._folder_open.has(key)

        const header = document.createElement('div')
        header.style.cssText = `display:flex; align-items:center; gap:5px; height:22px; cursor:pointer;
            padding-left:${8 + depth * 14}px; padding-right:6px; color:var(--sw-text);`
        header.style.userSelect = 'none'

        const arrow = document.createElement('span')
        arrow.className = 'sw-tree-arrow'; arrow.textContent = '▶'
        if (open) arrow.classList.add('open')
        const glyph = document.createElement('span')
        glyph.className = 'sw-tree-item-glyph'; glyph.innerHTML = ICON.folder
        const label = document.createElement('span')
        label.textContent = display_name
        label.style.cssText = 'flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
        header.append(arrow, glyph, label)

        const child = document.createElement('div')
        child.style.display = open ? 'block' : 'none'
        const render_children = (): void => { child.innerHTML = ''; this._render_into(cat_id, full_path, child, depth + 1) }
        if (open) render_children()

        header.addEventListener('click', () => {
            if (this._folder_open.has(key)) { this._folder_open.delete(key); child.style.display = 'none'; arrow.classList.remove('open') }
            else { this._folder_open.add(key); render_children(); child.style.display = 'block'; arrow.classList.add('open') }
        })
        header.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation()
            show_context_menu(e.clientX, e.clientY, [
                { label: 'New Subfolder…', icon: ICON.folder_add, action: () => this._new_folder(cat_id, full_path) },
                { label: 'Rename Folder…',                        action: () => this._rename_folder(cat_id, full_path) },
                { separator: true },
                { label: 'Delete Folder',  icon: ICON.delete,     action: () => this._delete_folder(cat_id, full_path) },
            ])
        })
        this._make_drop_target(header, cat_id, full_path)
        this._make_drop_target(child,  cat_id, full_path)

        wrapper.append(header, child)
        return wrapper
    }

    /** Makes `el` accept a dragged resource of `cat_id`, moving it into `folder_path` on drop. */
    private _make_drop_target(el: HTMLElement, cat_id: resource_category, folder_path: string): void {
        el.addEventListener('dragover', (e) => {
            if (_drag && _drag.cat === cat_id) { e.preventDefault(); el.style.background = 'var(--sw-select-bg)' }
        })
        el.addEventListener('dragleave', () => { el.style.background = '' })
        el.addEventListener('drop', (e) => {
            el.style.background = ''
            if (!_drag || _drag.cat !== cat_id) return
            e.preventDefault(); e.stopPropagation()
            this._move_resource(cat_id, _drag.name, folder_path)
            _drag = null
        })
    }

    /** Moves a resource into `folder_path` ('' = category root) and persists. */
    private _move_resource(cat_id: resource_category, name: string, folder_path: string): void {
        const ref = this._state?.resources[cat_id]?.[name]
        if (!ref) return
        if ((ref.folder ?? '') === folder_path) return   // no-op move
        const before = this._struct_snapshot(cat_id)
        if (folder_path) ref.folder = folder_path
        else             delete ref.folder
        this.on_folders_changed()
        this._refresh_category(cat_id)
        this._record_struct(cat_id, `Move "${name}"`, before)
    }

    /** Context-menu folder picker (a fallback to dragging) for moving a resource. */
    private _pick_folder(cat_id: resource_category, name: string, x: number, y: number): void {
        const items: Array<{ label: string; icon?: string; action?: () => void; separator?: boolean }> = [
            { label: '(root)', action: () => this._move_resource(cat_id, name, '') },
        ]
        const folders = [...this._all_folder_paths(cat_id)].sort()
        if (folders.length) items.push({ separator: true, label: '' })
        for (const f of folders) items.push({ label: f, icon: ICON.folder, action: () => this._move_resource(cat_id, name, f) })
        show_context_menu(x, y, items)
    }

    private _folder_array(cat_id: resource_category): string[] {
        if (!this._state) return []
        if (!this._state.folders) this._state.folders = {}
        if (!this._state.folders[cat_id]) this._state.folders[cat_id] = []
        return this._state.folders[cat_id]!
    }

    private _new_folder(cat_id: resource_category, parent: string): void {
        this._prompt('New folder name', '', (raw) => {
            const leaf = raw.replace(/\//g, '-').trim()
            if (!leaf) return
            const full = parent ? `${parent}/${leaf}` : leaf
            const before = this._struct_snapshot(cat_id)
            const arr = this._folder_array(cat_id)
            const added = !arr.includes(full)
            if (added) arr.push(full)
            if (parent) this._folder_open.add(`${cat_id}:${parent}`)
            this._folder_open.add(`${cat_id}:${full}`)
            this.on_folders_changed()
            this._refresh_category(cat_id)
            if (added) this._record_struct(cat_id, `New folder "${leaf}"`, before)
        })
    }

    private _rename_folder(cat_id: resource_category, old_full: string): void {
        const leaf0 = old_full.slice(old_full.lastIndexOf('/') + 1)
        const parent = old_full.includes('/') ? old_full.slice(0, old_full.lastIndexOf('/')) : ''
        this._prompt('Rename folder', leaf0, (raw) => {
            const leaf = raw.replace(/\//g, '-').trim()
            if (!leaf) return
            const new_full = parent ? `${parent}/${leaf}` : leaf
            if (new_full === old_full) return
            const before = this._struct_snapshot(cat_id)
            const remap = (p: string): string =>
                p === old_full ? new_full : (p.startsWith(old_full + '/') ? `${new_full}/${p.slice(old_full.length + 1)}` : p)
            this._remap_folders(cat_id, remap)
            this._folder_open.add(`${cat_id}:${new_full}`)
            this.on_folders_changed()
            this._refresh_category(cat_id)
            this._record_struct(cat_id, `Rename folder "${old_full}" → "${new_full}"`, before)
        })
    }

    private _delete_folder(cat_id: resource_category, full: string): void {
        const before = this._struct_snapshot(cat_id)
        const parent = full.includes('/') ? full.slice(0, full.lastIndexOf('/')) : ''
        const remap = (p: string): string => {
            if (p === full) return parent
            if (p.startsWith(full + '/')) { const tail = p.slice(full.length + 1); return parent ? `${parent}/${tail}` : tail }
            return p
        }
        if (this._state?.folders?.[cat_id]) this._state.folders[cat_id] = this._state.folders[cat_id]!.filter(p => p !== full)
        this._remap_folders(cat_id, remap)
        this.on_folders_changed()
        this._refresh_category(cat_id)
        this._record_struct(cat_id, `Delete folder "${full}"`, before)
    }

    // ── Folder-structure undo (manifest-only; folders/move don't touch disk) ───

    /** Snapshots a category's folder organisation: its folder list + each resource's folder. */
    private _struct_snapshot(cat_id: resource_category): struct_snap {
        const folders = [...(this._state?.folders?.[cat_id] ?? [])]
        const assign: Record<string, string | null> = {}
        const res = this._state?.resources[cat_id] ?? {}
        for (const k of Object.keys(res)) assign[k] = res[k]?.folder ?? null
        return { folders, assign }
    }

    /** Restores a folder-structure snapshot, marks the project dirty, and re-renders the category. */
    private _struct_restore(cat_id: resource_category, snap: struct_snap): void {
        if (!this._state) return
        if (!this._state.folders) this._state.folders = {}
        this._state.folders[cat_id] = [...snap.folders]
        const res = this._state.resources[cat_id] ?? {}
        for (const k of Object.keys(res)) {
            const f = snap.assign[k]
            if (f) res[k]!.folder = f
            else   delete res[k]!.folder
        }
        this.on_folders_changed()
        this._refresh_category(cat_id)
    }

    /** Records an undoable folder-structure change, given the pre-mutation snapshot. */
    private _record_struct(cat_id: resource_category, label: string, before: struct_snap): void {
        const after = this._struct_snapshot(cat_id)
        this.on_undo_push({
            label,
            execute:   () => this._struct_restore(cat_id, after),
            unexecute: () => this._struct_restore(cat_id, before),
        })
    }

    /** Applies a path remap to the folder list and every resource's `folder` in a category. */
    private _remap_folders(cat_id: resource_category, remap: (p: string) => string): void {
        if (!this._state) return
        if (this._state.folders?.[cat_id]) {
            this._state.folders[cat_id] = [...new Set(this._state.folders[cat_id]!.map(remap))]
        }
        for (const ref of Object.values(this._state.resources[cat_id])) {
            if (typeof ref.folder === 'string' && ref.folder) {
                const next = remap(ref.folder)
                if (next) ref.folder = next; else delete ref.folder
            }
        }
    }

    /** A small modal text prompt (Electron blocks window.prompt). */
    private _prompt(title: string, initial: string, cb: (value: string) => void): void {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;'
        const box = document.createElement('div')
        box.style.cssText = 'background:var(--sw-chrome);border:1px solid var(--sw-border);border-radius:6px;padding:14px 16px;min-width:260px;display:flex;flex-direction:column;gap:10px;'
        const h = document.createElement('div'); h.textContent = title; h.style.cssText = 'font-size:12px;color:var(--sw-text);'
        const input = document.createElement('input'); input.className = 'sw-input'; input.value = initial
        input.style.cssText = 'font-size:12px;padding:4px 6px;'
        const btns = document.createElement('div'); btns.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        const ok = document.createElement('button'); ok.className = 'sw-btn'; ok.textContent = 'OK'
        const cancel = document.createElement('button'); cancel.className = 'sw-btn'; cancel.textContent = 'Cancel'
        btns.append(cancel, ok); box.append(h, input, btns); overlay.appendChild(box); document.body.appendChild(overlay)
        input.focus(); input.select()
        const close = (): void => overlay.remove()
        const submit = (): void => { const v = input.value.trim(); close(); if (v) cb(v) }
        ok.addEventListener('click', submit)
        cancel.addEventListener('click', close)
        input.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(); else if (e.key === 'Escape') close() })
    }

    private _build_item(cat_id: resource_category, name: string, depth = 0): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-tree-item'
        row.dataset.name = name   // for the resource filter
        row.style.cssText = `
            display:flex; align-items:center; gap:5px;
            height:22px; padding:0 6px 0 ${26 + depth * 14}px;
            cursor:pointer;
        `
        row.style.userSelect = 'none'

        // Drag to move into a folder.
        row.draggable = true
        row.addEventListener('dragstart', (e) => { _drag = { cat: cat_id, name }; e.dataTransfer?.setData('text/plain', name) })
        row.addEventListener('dragend',   () => { _drag = null })

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
                { label: 'Set Icon…', icon: ICON.sprite,  action: () => this._pick_icon(cat_id, name, e.clientX, e.clientY) },
                { label: 'Move to…',  icon: ICON.folder,  action: () => this._pick_folder(cat_id, name, e.clientX, e.clientY) },
                { separator: true },
                { label: 'Delete',    icon: ICON.delete, action: () => this.on_delete_resource(cat_id, name) },
            ])
        })

        return row
    }

    /**
     * Creates the icon element for an item row. Resolution order:
     *   1. an explicit per-resource `icon` override (a chosen sprite) — works for ANY category;
     *   2. sprites/backgrounds → their own image thumbnail;
     *   3. objects → their `static sprite`'s thumbnail (resolved from the class file);
     *   4. otherwise the category glyph.
     */
    private _make_item_icon(cat_id: resource_category, name: string): HTMLElement {
        if (!this._state) return this._glyph(cat_id)
        const ref = this._state.resources[cat_id]?.[name] as { icon?: string } | undefined

        if (ref?.icon)                return this._sprite_thumb(ref.icon)
        if (cat_id === 'sprites')     return this._sprite_thumb(name)
        if (cat_id === 'backgrounds') return this._bg_thumb(name)
        if (cat_id === 'objects')     return this._object_icon(name)
        return this._glyph(cat_id)
    }

    /** A 16×16 thumbnail of a sprite's first frame (placeholder if missing). */
    private _sprite_thumb(sprite_name: string): HTMLCanvasElement {
        const canvas = _thumb_canvas()
        void (async () => {
            try {
                if (!(await project_file_exists(`sprites/${sprite_name}/meta.json`))) { _draw_placeholder(canvas); return }
                const meta = JSON.parse(await project_read_file(`sprites/${sprite_name}/meta.json`)) as { frames?: Array<{ name: string } | string> }
                const first = meta.frames?.[0]
                if (!first) { _draw_placeholder(canvas); return }
                const frame_name = typeof first === 'string' ? first : first.name
                _draw_image(canvas, await project_read_binary_url(`sprites/${sprite_name}/${frame_name}`))
            } catch { _draw_placeholder(canvas) }
        })()
        return canvas
    }

    /** A 16×16 thumbnail of a background's image (placeholder if missing). */
    private _bg_thumb(bg_name: string): HTMLCanvasElement {
        const canvas = _thumb_canvas()
        void (async () => {
            try {
                if (!(await project_file_exists(`backgrounds/${bg_name}/meta.json`))) { _draw_placeholder(canvas); return }
                const meta = JSON.parse(await project_read_file(`backgrounds/${bg_name}/meta.json`)) as { file_name?: string }
                if (!meta.file_name) { _draw_placeholder(canvas); return }
                _draw_image(canvas, await project_read_binary_url(`backgrounds/${bg_name}/${meta.file_name}`))
            } catch { _draw_placeholder(canvas) }
        })()
        return canvas
    }

    /** An object's icon: its `static sprite`'s thumbnail when it has one, else the object glyph. */
    private _object_icon(name: string): HTMLElement {
        const holder = this._glyph('objects')
        void (async () => {
            try {
                const rel = `objects/${name}.ts`
                if (!(await project_file_exists(rel))) return   // not scaffolded yet / deleted → keep glyph
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const op = (window as any).swfs?.object_op
                if (!op) return
                const model = await op('parse_object', await project_read_file(rel))
                if (model?.sprite) holder.replaceWith(this._sprite_thumb(model.sprite))
            } catch { /* keep the glyph */ }
        })()
        return holder
    }

    private _glyph(cat_id: resource_category): HTMLElement {
        const span = document.createElement('span')
        span.className = 'sw-tree-item-glyph'
        span.innerHTML = CATEGORIES.find(c => c.id === cat_id)!.glyph
        return span
    }

    /** Opens a picker to set (or clear) this resource's tree icon to a project sprite. */
    private _pick_icon(cat_id: resource_category, name: string, x: number, y: number): void {
        if (!this._state) return
        const ref     = this._state.resources[cat_id]?.[name] as { icon?: string } | undefined
        const sprites = Object.keys(this._state.resources.sprites).sort()
        const items: Array<{ label: string; icon?: string; action?: () => void; separator?: boolean }> = []
        if (ref?.icon) items.push({ label: 'Clear icon', action: () => this._set_icon(cat_id, name, null) }, { separator: true, label: '' })
        if (sprites.length === 0) items.push({ label: '(no sprites in project)', action: () => {} })
        else for (const s of sprites) items.push({ label: s, icon: ICON.sprite, action: () => this._set_icon(cat_id, name, s) })
        show_context_menu(x, y, items)
    }

    private _set_icon(cat_id: resource_category, name: string, sprite: string | null): void {
        if (!this._state) return
        const ref = this._state.resources[cat_id]?.[name] as { icon?: string } | undefined
        if (!ref) return
        if (sprite) ref.icon = sprite
        else        delete ref.icon
        this.on_set_icon(cat_id, name, sprite)   // host persists + marks the project unsaved
        this._refresh_category(cat_id)
    }
}

/** A blank 16×16 pixel-art thumbnail canvas. */
function _thumb_canvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 16; canvas.height = 16
    canvas.style.cssText = 'width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;'
    return canvas
}

/** Loads `url` and draws it scaled into the 16×16 thumbnail canvas. */
function _draw_image(canvas: HTMLCanvasElement, url: string): void {
    const img = new Image()
    img.onload = () => {
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.clearRect(0, 0, 16, 16); ctx.drawImage(img, 0, 0, 16, 16) }
    }
    img.src = url
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
