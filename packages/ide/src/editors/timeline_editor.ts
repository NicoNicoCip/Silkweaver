/**
 * Timeline editor window.
 * Visual step-based editor for GMS-style timelines.
 * Each moment has a step number and an associated code snippet.
 */

import { FloatingWindow }                                from '../window_manager.js'
import { project_read_file, project_write_file, project_has_folder, project_get_dir } from '../services/project.js'
import { script_editor_open_smart }                      from './script_editor.js'

// =========================================================================
// Types
// =========================================================================

interface timeline_moment {
    step: number   // step index (GMS: 0-based)
    name: string   // short description / label
}

interface timeline_data {
    moments: timeline_moment[]
}

// =========================================================================
// Module state
// =========================================================================

const _open_editors = new Map<string, timeline_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a Timeline editor window for the given resource.
 * @param workspace - The IDE workspace element to mount into
 * @param tl_name - Resource name
 */
export function timeline_editor_open(workspace: HTMLElement, tl_name: string): void {
    const existing = _open_editors.get(tl_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new timeline_editor_window(workspace, tl_name)
    _open_editors.set(tl_name, ed)
    ed.on_closed(() => _open_editors.delete(tl_name))
}

// =========================================================================
// Editor window
// =========================================================================

class timeline_editor_window {
    private _win:       FloatingWindow
    private _name:      string
    private _data:      timeline_data
    private _workspace: HTMLElement
    private _list_el!:  HTMLElement
    private _sel_idx:   number = -1

    constructor(workspace: HTMLElement, name: string) {
        this._workspace = workspace
        this._name      = name
        this._data      = { moments: [] }

        this._win = new FloatingWindow(
            `tl-${name}`, `Timeline: ${name}`, 'icons/timeline.svg',
            { x: 260, y: 120, w: 520, h: 400 }
        )
        this._build_ui()
        this._win.mount(workspace)
        this._load_data()
    }

    public bring_to_front(): void { this._win.bring_to_front() }
    public on_closed(cb: () => void): void { this._win.on_close(cb) }

    // -----------------------------------------------------------------------
    // Build UI
    // -----------------------------------------------------------------------

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

        // Toolbar
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'

        const add_btn = this._make_btn('Add Moment', () => this._add_moment())
        const del_btn = this._make_btn('Remove',     () => this._delete_selected())
        const edit_btn= this._make_btn('Edit Code…', () => this._edit_selected_code())
        toolbar.append(add_btn, del_btn, edit_btn)
        body.appendChild(toolbar)

        // Two-column layout: timeline strip left + moment details right
        const layout = document.createElement('div')
        layout.style.cssText = 'display:flex;flex:1;overflow:hidden;'

        // Left: moment list
        const left = document.createElement('div')
        left.className = 'sw-tl-list-panel'
        const list_title = document.createElement('div')
        list_title.className = 'sw-bg-section-title'
        list_title.textContent = 'Moments'
        left.appendChild(list_title)

        const list = document.createElement('div')
        list.className = 'sw-tl-list'
        list.style.cssText = 'flex:1;overflow-y:auto;'
        this._list_el = list
        left.appendChild(list)
        layout.appendChild(left)

        // Right: visual strip
        const right = document.createElement('div')
        right.className = 'sw-tl-strip-panel'
        const strip_title = document.createElement('div')
        strip_title.className = 'sw-bg-section-title'
        strip_title.textContent = 'Step strip (read-only)'
        right.appendChild(strip_title)

        const strip = document.createElement('canvas')
        strip.style.cssText = 'display:block;background:#1a1a1a;'
        strip.width  = 400
        strip.height = 40
        right.appendChild(strip)

        const hint = document.createElement('div')
        hint.style.cssText = 'padding:8px;font-size:11px;color:var(--sw-text-dim);'
        hint.textContent = 'Double-click a moment to edit its code.'
        right.appendChild(hint)

        layout.appendChild(right)
        body.appendChild(layout)
    }

    // -----------------------------------------------------------------------
    // Moment list render
    // -----------------------------------------------------------------------

    private _render_list(): void {
        this._list_el.innerHTML = ''
        const sorted = [...this._data.moments].sort((a, b) => a.step - b.step)
        sorted.forEach((m) => {
            // find actual index in data array
            const data_idx = this._data.moments.indexOf(m)
            const row = document.createElement('div')
            row.className = 'sw-tl-moment-row' + (data_idx === this._sel_idx ? ' selected' : '')
            row.addEventListener('click', () => { this._sel_idx = data_idx; this._render_list() })
            row.addEventListener('dblclick', () => { this._sel_idx = data_idx; this._edit_selected_code() })

            const step_lbl = document.createElement('span')
            step_lbl.className = 'sw-tl-step-lbl'
            step_lbl.textContent = `Step ${m.step}`

            const name_inp = document.createElement('input')
            name_inp.type = 'text'
            name_inp.className = 'sw-input'
            name_inp.style.cssText = 'flex:1;padding:2px 4px;font-size:11px;'
            name_inp.value = m.name
            name_inp.placeholder = 'label…'
            name_inp.addEventListener('change', () => {
                this._data.moments[data_idx].name = name_inp.value
                this._save()
            })
            // Prevent row click from stealing focus on input click
            name_inp.addEventListener('click', (e) => e.stopPropagation())

            const step_inp = document.createElement('input')
            step_inp.type = 'number'
            step_inp.className = 'sw-input'
            step_inp.style.cssText = 'width:52px;padding:2px 4px;font-size:11px;'
            step_inp.min = '0'
            step_inp.value = String(m.step)
            step_inp.addEventListener('change', () => {
                const v = parseInt(step_inp.value)
                if (!isNaN(v) && v >= 0) {
                    this._data.moments[data_idx].step = v
                    this._render_list()
                    this._save()
                }
            })
            step_inp.addEventListener('click', (e) => e.stopPropagation())

            row.append(step_lbl, name_inp, step_inp)
            this._list_el.appendChild(row)
        })
    }

    // -----------------------------------------------------------------------
    // Actions
    // -----------------------------------------------------------------------

    private _add_moment(): void {
        // Pick next unused step
        const used  = new Set(this._data.moments.map(m => m.step))
        let   step  = 0
        while (used.has(step)) step++
        this._data.moments.push({ step, name: '' })
        this._sel_idx = this._data.moments.length - 1
        this._render_list()
        this._save()
    }

    private _delete_selected(): void {
        if (this._sel_idx < 0) return
        this._data.moments.splice(this._sel_idx, 1)
        this._sel_idx = Math.min(this._sel_idx, this._data.moments.length - 1)
        this._render_list()
        this._save()
    }

    private async _edit_selected_code(): Promise<void> {
        if (this._sel_idx < 0) { alert('Select a moment first.'); return }
        const moment = this._data.moments[this._sel_idx]
        const rel = `timelines/${this._name}/step_${moment.step}.ts`
        try {
            await script_editor_open_smart(this._workspace, rel, async () => {
                const dir = project_get_dir()!
                const tl_dir  = await dir.getDirectoryHandle('timelines', { create: true })
                const res_dir = await tl_dir.getDirectoryHandle(this._name, { create: true })
                return res_dir.getFileHandle(`step_${moment.step}.ts`, { create: true })
            })
        } catch (err) {
            console.error('[Timeline] Failed to open code file:', err)
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private _make_btn(label: string, cb: () => void): HTMLButtonElement {
        const b = document.createElement('button')
        b.className = 'sw-btn'
        b.textContent = label
        b.addEventListener('click', cb)
        return b
    }

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    private async _load_data(): Promise<void> {
        try {
            const raw = await project_read_file(`timelines/${this._name}/timeline.json`)
            if (!raw) return
            const parsed = JSON.parse(raw) as Partial<timeline_data>
            if (Array.isArray(parsed.moments)) this._data.moments = parsed.moments
            this._render_list()
        } catch { /* no saved data yet */ }
    }

    private async _save(): Promise<void> {
        if (!project_has_folder()) return
        await project_write_file(
            `timelines/${this._name}/timeline.json`,
            JSON.stringify(this._data, null, 2)
        )
    }
}
