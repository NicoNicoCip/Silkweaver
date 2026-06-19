/**
 * Object editor window — GMS-style GUI over a class-per-object file (`objects/<name>.ts`).
 *
 * The form (sprite / parent / properties / variables) and the event list are backed by the
 * `object_format` parse/patch ops (run in the Electron host via `window.swfs.object_op`),
 * which edit the class source *surgically* so the user's hand-written event code is preserved.
 * Editing an event opens the class file in the Monaco code editor.
 */

import { FloatingWindow }                                          from '../window_manager.js'
import { ICON } from "../icons.js"
import { project_read_file, project_write_file, project_file_exists, project_get_dir } from '../services/project.js'
import { script_editor_open_event, script_editor_open_full }     from './script_editor.js'
import { get_project_resource_names }                            from '../index.js'
import { file_watch_subscribe }                                  from '../services/file_watch.js'

// =========================================================================
// Object model (mirrors object_format.object_model)
// =========================================================================

interface object_model {
    class_name: string
    sprite:     string | null
    parent:     string | null
    solid:      boolean
    visible:    boolean
    persistent: boolean
    depth:      number
    variables:  { name: string; value: string }[]
    events:     string[]   // on_* method names present in the class
}

const EMPTY_MODEL: object_model = {
    class_name: '', sprite: null, parent: null,
    solid: false, visible: true, persistent: false, depth: 0,
    variables: [], events: [],
}

/** Catalog of authorable events → class method names (+ params for the few that take args). */
interface event_def { label: string; method: string; params: string }
const EVENT_GROUPS: { label: string; events: event_def[] }[] = [
    { label: 'Core',      events: [ { label: 'Create', method: 'on_create', params: '' }, { label: 'Destroy', method: 'on_destroy', params: '' } ] },
    { label: 'Step',      events: [ { label: 'Step Begin', method: 'on_step_begin', params: '' }, { label: 'Step', method: 'on_step', params: '' }, { label: 'Step End', method: 'on_step_end', params: '' } ] },
    { label: 'Draw',      events: [ { label: 'Draw Begin', method: 'on_draw_begin', params: '' }, { label: 'Draw', method: 'on_draw', params: '' }, { label: 'Draw End', method: 'on_draw_end', params: '' }, { label: 'Draw GUI', method: 'on_draw_gui', params: '' } ] },
    { label: 'Alarm',     events: [ { label: 'Alarm', method: 'on_alarm', params: 'index: number' } ] },
    { label: 'Keyboard',  events: [ { label: 'Key Press', method: 'on_key_press', params: '' }, { label: 'Key Release', method: 'on_key_release', params: '' }, { label: 'Key Held', method: 'on_key_held', params: '' } ] },
    { label: 'Mouse',     events: [ { label: 'Mouse L Press', method: 'on_mouse_left_press', params: '' }, { label: 'Mouse L Release', method: 'on_mouse_left_release', params: '' }, { label: 'Mouse R Press', method: 'on_mouse_right_press', params: '' } ] },
    { label: 'Collision', events: [ { label: 'Collision', method: 'on_collision', params: 'other: any' } ] },
    { label: 'Room/Game', events: [ { label: 'Room Start', method: 'on_room_start', params: '' }, { label: 'Room End', method: 'on_room_end', params: '' }, { label: 'Game Start', method: 'on_game_start', params: '' }, { label: 'Game End', method: 'on_game_end', params: '' } ] },
    { label: 'Other',     events: [ { label: 'Animation End', method: 'on_animation_end', params: '' }, { label: 'Path End', method: 'on_path_end', params: '' }, { label: 'Outside Room', method: 'on_outside_room', params: '' }, { label: 'Intersect Boundary', method: 'on_intersect_boundary', params: '' }, { label: 'No More Lives', method: 'on_no_more_lives', params: '' }, { label: 'No More Health', method: 'on_no_more_health', params: '' }, { label: 'User', method: 'on_user', params: 'index: number' } ] },
]
const ALL_EVENTS = EVENT_GROUPS.flatMap(g => g.events)
const _label_for = (method: string): string => ALL_EVENTS.find(e => e.method === method)?.label ?? method
const _params_for = (method: string): string => ALL_EVENTS.find(e => e.method === method)?.params ?? ''

// =========================================================================
// object_op bridge (Electron host)
// =========================================================================

function _has_op(): boolean { return !!(window as any).swfs?.object_op }
function _op(action: string, ...args: any[]): Promise<any> {
    return (window as any).swfs.object_op(action, ...args)
}

// =========================================================================
// Public API
// =========================================================================

const _open_editors = new Map<string, object_editor_window>()

/** Opens (or focuses) the object editor for the given object resource name. */
export function object_editor_open(workspace: HTMLElement, object_name: string): void {
    const existing = _open_editors.get(object_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new object_editor_window(workspace, object_name)
    _open_editors.set(object_name, ed)
    ed.on_closed(() => _open_editors.delete(object_name))
}

// =========================================================================
// object_editor_window
// =========================================================================

let _next_offset = 0

class object_editor_window {
    private _win:          FloatingWindow
    private _object_name:  string
    private _rel:          string
    private _src           = ''                    // current class-file source (source of truth for code)
    private _model:        object_model = { ...EMPTY_MODEL }
    private _props_el:     HTMLElement = document.createElement('div')
    private _event_list_el: HTMLElement = document.createElement('div')
    private _vars_list_el:  HTMLElement = document.createElement('div')
    private _on_closed_cb: (() => void) | null = null
    private _unsub_watch:  (() => void) | null = null

    constructor(workspace: HTMLElement, object_name: string) {
        this._object_name = object_name
        this._rel = `objects/${object_name}.ts`

        const off = (_next_offset++ % 8) * 24
        this._win = new FloatingWindow(
            `object-editor-${object_name}`,
            `Object: ${object_name}`,
            ICON.object,
            { x: 260 + off, y: 50 + off, w: 560, h: 480 },
        )
        this._win.on_close(() => { this._unsub_watch?.(); this._on_closed_cb?.() })

        this._build_ui()
        this._load()
        this._win.mount(workspace)

        // Refresh the form when the class file is edited elsewhere (another window / outside the IDE).
        this._unsub_watch = file_watch_subscribe(this._rel, () => void this._load())
    }

    bring_to_front(): void { this._win.bring_to_front() }
    on_closed(cb: () => void): void { this._on_closed_cb = cb }

    // ── UI scaffold ────────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; overflow:hidden;'

        const left = document.createElement('div')
        left.className = 'sw-obj-props-panel'
        this._props_el.style.cssText = 'display:flex; flex-direction:column; gap:6px; padding:8px; overflow-y:auto; height:100%;'
        left.appendChild(this._props_el)
        body.appendChild(left)

        const right = document.createElement('div')
        right.className = 'sw-obj-events-panel'
        right.appendChild(this._build_events_panel())
        body.appendChild(right)
    }

    // ── Load / patch ─────────────────────────────────────────────────────────

    private async _load(): Promise<void> {
        if (!_has_op()) {
            this._props_el.textContent = 'The object editor form needs the desktop app. Use "Open as Code" or edit objects/' + this._object_name + '.ts directly.'
            return
        }
        try {
            if (await project_file_exists(this._rel)) {
                this._src = await project_read_file(this._rel)
            } else {
                this._src = await _op('scaffold', this._object_name)
                await project_write_file(this._rel, this._src)
            }
            this._model = await _op('parse_object', this._src)
        } catch (err) {
            console.error('[IDE] object load failed:', err)
        }
        this._refresh()
    }

    /** Applies a surgical patch op to the class source, persists it, and re-parses. */
    private async _patch(action: string, ...args: any[]): Promise<void> {
        try {
            // Re-read from disk first: an event may have been edited in the focused code editor,
            // and patching our in-memory copy would clobber those changes.
            try { this._src = await project_read_file(this._rel) } catch { /* keep in-memory copy */ }
            this._src = await _op(action, this._src, ...args)
            await project_write_file(this._rel, this._src)
            this._model = await _op('parse_object', this._src)
        } catch (err) {
            console.error('[IDE] object patch failed:', err)
        }
        this._refresh()
    }

    private _refresh(): void {
        this._props_el.innerHTML = ''
        this._props_el.appendChild(this._build_props())
        this._rebuild_event_list()
    }

    // ── Properties panel ───────────────────────────────────────────────────

    private _build_props(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; gap:6px;'
        const m = this._model

        el.appendChild(_section_header('Sprite'))
        el.appendChild(_asset_row(m.sprite, get_project_resource_names('sprites'), async (name) => {
            await this._patch(name ? 'set_static' : 'remove_static', ...(name ? ['sprite', `'${name}'`] : ['sprite']))
        }))

        el.appendChild(_section_header('Parent Object'))
        el.appendChild(_asset_row(m.parent, get_project_resource_names('objects').filter(n => n !== this._object_name), async (name) => {
            await this._patch(name ? 'set_static' : 'remove_static', ...(name ? ['parent', name] : ['parent']))
        }))

        el.appendChild(_section_header('Properties'))
        el.append(
            _checkbox_row('Visible',    m.visible,    (v) => this._patch(v ? 'remove_static' : 'set_static', ...(v ? ['visible'] : ['visible', 'false']))),
            _checkbox_row('Solid',      m.solid,      (v) => this._patch(v ? 'set_static' : 'remove_static', ...(v ? ['solid', 'true'] : ['solid']))),
            _checkbox_row('Persistent', m.persistent, (v) => this._patch(v ? 'set_static' : 'remove_static', ...(v ? ['persistent', 'true'] : ['persistent']))),
            _number_row('Depth:', m.depth, (v) => this._patch(v !== 0 ? 'set_static' : 'remove_static', ...(v !== 0 ? ['depth', String(v)] : ['depth']))),
        )

        el.appendChild(this._build_variables_section())

        const note = document.createElement('div')
        note.style.cssText = 'font-size:10px; color:var(--sw-text-dim); margin-top:6px;'
        note.textContent = 'Physics: add `static physics = true` in code.'
        el.appendChild(note)

        return el
    }

    private _build_variables_section(): HTMLElement {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:4px;'
        wrap.appendChild(_section_header('Variables'))

        this._vars_list_el = document.createElement('div')
        this._vars_list_el.style.cssText = 'display:flex; flex-direction:column; gap:4px;'
        wrap.appendChild(this._vars_list_el)
        this._render_variables()

        const add = document.createElement('button')
        add.className = 'sw-btn'
        add.textContent = '+ Add Variable'
        add.style.cssText = 'font-size:11px; align-self:flex-start; padding:2px 8px;'
        add.addEventListener('click', async () => {
            const name = await _input_overlay('Variable name:', '')
            if (!name) return
            const clean = name.trim().replace(/[^A-Za-z0-9_]/g, '')
            if (!/^[A-Za-z_]/.test(clean)) return
            await this._patch('set_field', clean, '0')
        })
        wrap.appendChild(add)
        return wrap
    }

    private _render_variables(): void {
        this._vars_list_el.innerHTML = ''
        if (this._model.variables.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px;'
            empty.textContent = 'No variables.'
            this._vars_list_el.appendChild(empty)
            return
        }
        // Sorted alphabetically for a tidy list (kept display-only — instance-field initialization
        // order can matter in code, e.g. one field referencing another, so we never reorder the file).
        const vars = [...this._model.variables].sort((a, b) => a.name.localeCompare(b.name))
        for (const v of vars) {
            const row = document.createElement('div')
            row.style.cssText = 'display:flex; align-items:center; gap:4px;'

            const name = document.createElement('span')
            name.textContent = v.name
            name.title = v.name
            name.style.cssText = 'width:96px; flex-shrink:0; font-size:11px; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'

            const eq = document.createElement('span'); eq.textContent = '='; eq.style.cssText = 'color:var(--sw-text-dim);'

            const val = document.createElement('input')
            val.className = 'sw-input'
            val.value = v.value
            val.style.cssText = 'flex:1; font-size:11px; font-family:monospace;'
            val.addEventListener('change', () => this._patch('set_field', v.name, val.value || '0'))

            const del = document.createElement('button')
            del.className = 'sw-x-btn'
            del.textContent = '✕'
            del.title = 'Delete variable'
            del.addEventListener('click', () => this._patch('remove_field', v.name))

            row.append(name, eq, val, del)
            this._vars_list_el.appendChild(row)
        }
    }

    // ── Events panel ───────────────────────────────────────────────────────

    private _build_events_panel(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; height:100%;'

        const hdr = document.createElement('div')
        hdr.className = 'sw-editor-toolbar'
        const hdr_lbl = document.createElement('span')
        hdr_lbl.style.cssText = 'font-size:11px; font-weight:600; flex:1;'
        hdr_lbl.textContent = 'Events'
        const code_btn = document.createElement('button')
        code_btn.className = 'sw-btn'
        code_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
        code_btn.textContent = 'Open as Code'
        code_btn.addEventListener('click', () => this._open_code())
        const add_btn = document.createElement('button')
        add_btn.className = 'sw-btn'
        add_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
        add_btn.textContent = '+ Add Event'
        add_btn.addEventListener('click', () => this._show_add_event_dialog())
        hdr.append(hdr_lbl, code_btn, add_btn)
        el.appendChild(hdr)

        this._event_list_el.style.cssText = 'flex:1; overflow-y:auto;'
        el.appendChild(this._event_list_el)
        return el
    }

    private _rebuild_event_list(): void {
        this._event_list_el.innerHTML = ''
        if (this._model.events.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;'
            empty.textContent = 'No events.\nClick "+ Add Event".'
            this._event_list_el.appendChild(empty)
            return
        }
        // List events in canonical GMS order (matches how add_method orders them in code).
        const ordered = [...this._model.events].sort((a, b) => {
            const ia = ALL_EVENTS.findIndex(e => e.method === a)
            const ib = ALL_EVENTS.findIndex(e => e.method === b)
            return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
        })
        for (const method of ordered) {
            const row = document.createElement('div')
            row.className = 'sw-obj-event-row'

            const lbl = document.createElement('span')
            lbl.textContent = _label_for(method)
            lbl.style.cssText = 'flex:1; font-size:11px;'

            const edit_btn = document.createElement('button')
            edit_btn.className = 'sw-btn'
            edit_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
            edit_btn.textContent = 'Edit'
            edit_btn.addEventListener('click', () => this._open_event(method))

            const del_btn = document.createElement('button')
            del_btn.className = 'sw-x-btn'
            del_btn.title = 'Delete event'
            del_btn.textContent = '✕'
            del_btn.addEventListener('click', (e) => { e.stopPropagation(); this._patch('remove_method', method) })

            row.append(lbl, edit_btn, del_btn)
            row.addEventListener('dblclick', () => this._open_event(method))
            this._event_list_el.appendChild(row)
        }
    }

    private _show_add_event_dialog(): void {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:99999;'
        const dlg = document.createElement('div')
        dlg.style.cssText = 'background:var(--sw-chrome); border:1px solid var(--sw-border); padding:12px; min-width:240px; max-height:80vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;'
        const title = document.createElement('div')
        title.style.cssText = 'font-weight:600; font-size:12px;'
        title.textContent = 'Add Event'
        dlg.appendChild(title)

        for (const group of EVENT_GROUPS) {
            const avail = group.events.filter(e => !this._model.events.includes(e.method))
            if (avail.length === 0) continue
            const grp_lbl = document.createElement('div')
            grp_lbl.style.cssText = 'font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; margin-top:4px;'
            grp_lbl.textContent = group.label
            dlg.appendChild(grp_lbl)
            const grp_row = document.createElement('div')
            grp_row.style.cssText = 'display:flex; flex-wrap:wrap; gap:3px;'
            for (const ev of avail) {
                const btn = document.createElement('button')
                btn.className = 'sw-btn'
                btn.style.cssText = 'font-size:10px; padding:2px 6px;'
                btn.textContent = ev.label
                btn.addEventListener('click', async () => {
                    overlay.remove()
                    await this._patch('add_method', ev.method, ev.params, '')
                    this._open_event(ev.method)
                })
                grp_row.appendChild(btn)
            }
            dlg.appendChild(grp_row)
        }

        const cancel = document.createElement('button')
        cancel.className = 'sw-btn'
        cancel.textContent = 'Cancel'
        cancel.style.cssText = 'margin-top:4px; align-self:flex-end;'
        cancel.addEventListener('click', () => overlay.remove())
        dlg.appendChild(cancel)

        overlay.appendChild(dlg)
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
        document.body.appendChild(overlay)
    }

    /** Opens a single event's body in the focused (GMS-style) code editor. */
    private async _open_event(method: string): Promise<void> {
        const workspace = this._win.el.parentElement!
        try {
            await script_editor_open_event(workspace, this._rel, method, `${this._object_name} · ${_label_for(method)}`)
        } catch (err) {
            console.error('[IDE] Failed to open event code:', err)
        }
    }

    /** Opens the full class file (imports hidden) in the Monaco code editor. */
    private async _open_code(): Promise<void> {
        const workspace = this._win.el.parentElement!
        try {
            await script_editor_open_full(workspace, this._rel, `${this._object_name} · class`)
        } catch (err) {
            console.error('[IDE] Failed to open object code:', err)
        }
    }
}

// =========================================================================
// Helpers
// =========================================================================

/**
 * A dropdown row used for the sprite and parent assignments — pick from the project's
 * resources instead of typing the name. A "(none)" option clears the assignment, and a
 * current value that is no longer in the list (renamed/deleted) is preserved as an option.
 */
function _asset_row(value: string | null, options: string[], on_set: (name: string) => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; gap:4px; align-items:center;'
    const sel = document.createElement('select')
    sel.className = 'sw-select'
    sel.style.cssText = 'flex:1; min-width:0;'
    const cur = value ?? ''

    const none = document.createElement('option')
    none.value = ''; none.textContent = '(none)'
    if (!cur) none.selected = true
    sel.appendChild(none)

    const all = [...options]
    if (cur && !all.includes(cur)) all.unshift(cur)
    for (const name of all) {
        const o = document.createElement('option')
        o.value = name; o.textContent = name
        if (name === cur) o.selected = true
        sel.appendChild(o)
    }

    sel.addEventListener('change', () => on_set(sel.value))
    row.appendChild(sel)
    return row
}

function _input_overlay(msg: string, def: string): Promise<string | null> {
    return new Promise(resolve => {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;'
        const box = document.createElement('div')
        box.style.cssText = 'background:#2b2b2b;border:1px solid #555;border-radius:4px;padding:18px 20px;min-width:300px;font-family:sans-serif;color:#ccc;font-size:13px;display:flex;flex-direction:column;gap:10px;'
        box.innerHTML = `<p style="margin:0;">${msg.replace(/</g, '&lt;')}</p>`
        const inp = document.createElement('input')
        inp.value = def
        inp.style.cssText = 'padding:5px 8px;background:#3c3c3c;border:1px solid #555;color:#ddd;font-size:13px;border-radius:3px;outline:none;'
        const btns = document.createElement('div')
        btns.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        const ok_btn = document.createElement('button'); ok_btn.textContent = 'OK'; ok_btn.style.cssText = 'padding:4px 20px;cursor:pointer;'
        const cancel_btn = document.createElement('button'); cancel_btn.textContent = 'Cancel'; cancel_btn.style.cssText = 'padding:4px 20px;cursor:pointer;'
        btns.append(ok_btn, cancel_btn)
        box.append(inp, btns)
        overlay.appendChild(box)
        document.body.appendChild(overlay)
        const ok = () => { overlay.remove(); resolve(inp.value) }
        const cancel = () => { overlay.remove(); resolve(null) }
        ok_btn.addEventListener('click', ok)
        cancel_btn.addEventListener('click', cancel)
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') cancel() })
        setTimeout(() => { inp.focus(); inp.select() }, 10)
    })
}

function _section_header(text: string): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px;'
    el.textContent = text
    return el
}

function _checkbox_row(label: string, initial: boolean, on_change: (v: boolean) => void): HTMLElement {
    const row = document.createElement('label')
    row.style.cssText = 'display:flex; align-items:center; gap:6px; cursor:pointer; font-size:11px;'
    const inp = document.createElement('input')
    inp.type = 'checkbox'
    inp.className = 'sw-checkbox'
    inp.checked = initial
    inp.addEventListener('change', () => on_change(inp.checked))
    const lbl = document.createElement('span')
    lbl.textContent = label
    row.append(inp, lbl)
    return row
}

function _number_row(label: string, initial: number, on_change: (v: number) => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:6px;'
    const lbl = document.createElement('span')
    lbl.className = 'sw-label'
    lbl.style.cssText += 'min-width:80px; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type = 'number'
    inp.className = 'sw-input'
    inp.style.cssText = 'width:70px;'
    inp.valueAsNumber = initial
    inp.step = '1'
    inp.addEventListener('change', () => on_change(inp.valueAsNumber || 0))
    row.append(lbl, inp)
    return row
}
