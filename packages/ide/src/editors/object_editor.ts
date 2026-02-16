/**
 * Object editor window.
 * Assigns sprite, parent, properties, physics settings, and event list with code.
 */

import { FloatingWindow }                                        from '../window_manager.js'
import { project_read_file, project_write_file, project_get_dir, project_has_folder } from '../services/project.js'
import { script_editor_open_smart }                              from './script_editor.js'

// =========================================================================
// Types
// =========================================================================

/** All GMS-style event types supported by Silkweaver. */
type event_type =
    | 'create' | 'destroy' | 'step' | 'step_begin' | 'step_end'
    | 'draw' | 'draw_gui'
    | 'alarm_0' | 'alarm_1' | 'alarm_2' | 'alarm_3'
    | 'key_press' | 'key_release' | 'key_held'
    | 'mouse_left_press' | 'mouse_left_release' | 'mouse_right_press'
    | 'collision'
    | 'room_start' | 'room_end'
    | 'game_start' | 'game_end'
    | 'animation_end'
    | 'path_end'

const EVENT_LABELS: Record<event_type, string> = {
    create:              'Create',
    destroy:             'Destroy',
    step:                'Step',
    step_begin:          'Step (Begin)',
    step_end:            'Step (End)',
    draw:                'Draw',
    draw_gui:            'Draw GUI',
    alarm_0:             'Alarm 0',
    alarm_1:             'Alarm 1',
    alarm_2:             'Alarm 2',
    alarm_3:             'Alarm 3',
    key_press:           'Key Press',
    key_release:         'Key Release',
    key_held:            'Key Held',
    mouse_left_press:    'Mouse Left Press',
    mouse_left_release:  'Mouse Left Release',
    mouse_right_press:   'Mouse Right Press',
    collision:           'Collision',
    room_start:          'Room Start',
    room_end:            'Room End',
    game_start:          'Game Start',
    game_end:            'Game End',
    animation_end:       'Animation End',
    path_end:            'Path End',
}

const EVENT_GROUPS: { label: string; events: event_type[] }[] = [
    { label: 'Core',       events: ['create','destroy'] },
    { label: 'Step',       events: ['step_begin','step','step_end'] },
    { label: 'Draw',       events: ['draw','draw_gui'] },
    { label: 'Alarm',      events: ['alarm_0','alarm_1','alarm_2','alarm_3'] },
    { label: 'Keyboard',   events: ['key_press','key_release','key_held'] },
    { label: 'Mouse',      events: ['mouse_left_press','mouse_left_release','mouse_right_press'] },
    { label: 'Collision',  events: ['collision'] },
    { label: 'Room/Game',  events: ['room_start','room_end','game_start','game_end'] },
    { label: 'Other',      events: ['animation_end','path_end'] },
]

interface object_data {
    sprite_name:  string    // "" = none
    parent_name:  string    // "" = none
    visible:      boolean
    solid:        boolean
    persistent:   boolean
    depth:        number
    physics:      boolean
    phys_density: number
    phys_restitution: number
    phys_friction: number
    events:       event_type[]
}

// =========================================================================
// Deduplication
// =========================================================================

const _open_editors = new Map<string, object_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) an object editor for the given object resource name.
 */
export function object_editor_open(
    workspace:   HTMLElement,
    object_name: string,
): void {
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
    private _win:         FloatingWindow
    private _data:        object_data
    private _object_name: string

    private _event_list_el: HTMLElement
    private _on_closed_cb:  (() => void) | null = null

    constructor(workspace: HTMLElement, object_name: string) {
        this._object_name = object_name

        const off = (_next_offset++ % 8) * 24
        this._win = new FloatingWindow(
            `object-editor-${object_name}`,
            `Object: ${object_name}`,
            'icons/object.svg',
            { x: 260 + off, y: 50 + off, w: 560, h: 480 },
        )
        this._win.on_close(() => this._on_closed_cb?.())

        this._data = {
            sprite_name:      '',
            parent_name:      '',
            visible:          true,
            solid:            false,
            persistent:       false,
            depth:            0,
            physics:          false,
            phys_density:     1,
            phys_restitution: 0.1,
            phys_friction:    0.5,
            events:           [],
        }

        this._event_list_el = document.createElement('div')
        this._build_ui()
        this._load_data()
        this._win.mount(workspace)
    }

    bring_to_front(): void { this._win.bring_to_front() }
    on_closed(cb: () => void): void { this._on_closed_cb = cb }

    // ── UI ─────────────────────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; overflow:hidden;'

        // Left: properties panel
        const left = document.createElement('div')
        left.className = 'sw-obj-props-panel'
        left.appendChild(this._build_props())
        body.appendChild(left)

        // Right: events panel
        const right = document.createElement('div')
        right.className = 'sw-obj-events-panel'
        right.appendChild(this._build_events_panel())
        body.appendChild(right)
    }

    private _build_props(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; gap:6px; padding:8px; overflow-y:auto; height:100%;'

        // Sprite
        el.appendChild(_section_header('Sprite'))
        const sprite_row = document.createElement('div')
        sprite_row.style.cssText = 'display:flex; gap:4px; align-items:center;'
        const sprite_lbl = document.createElement('span')
        sprite_lbl.style.cssText = 'font-size:11px; flex:1; color:var(--sw-text-dim);'
        sprite_lbl.textContent = this._data.sprite_name || '(none)'
        const sprite_btn = document.createElement('button')
        sprite_btn.className = 'sw-btn'
        sprite_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
        sprite_btn.textContent = 'Choose'
        sprite_btn.addEventListener('click', () => {
            const name = prompt('Sprite name:', this._data.sprite_name)
            if (name === null) return
            this._data.sprite_name = name
            sprite_lbl.textContent = name || '(none)'
            this._save()
        })
        const clear_sprite = document.createElement('button')
        clear_sprite.className = 'sw-btn'
        clear_sprite.style.cssText = 'font-size:10px; padding:2px 6px;'
        clear_sprite.textContent = '✕'
        clear_sprite.title = 'Clear sprite'
        clear_sprite.addEventListener('click', () => {
            this._data.sprite_name = ''
            sprite_lbl.textContent = '(none)'
            this._save()
        })
        sprite_row.append(sprite_lbl, sprite_btn, clear_sprite)
        el.appendChild(sprite_row)

        // Parent
        el.appendChild(_section_header('Parent Object'))
        const parent_row = document.createElement('div')
        parent_row.style.cssText = 'display:flex; gap:4px; align-items:center;'
        const parent_lbl = document.createElement('span')
        parent_lbl.style.cssText = 'font-size:11px; flex:1; color:var(--sw-text-dim);'
        parent_lbl.textContent = this._data.parent_name || '(none)'
        const parent_btn = document.createElement('button')
        parent_btn.className = 'sw-btn'
        parent_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
        parent_btn.textContent = 'Choose'
        parent_btn.addEventListener('click', () => {
            const name = prompt('Parent object name:', this._data.parent_name)
            if (name === null) return
            this._data.parent_name = name
            parent_lbl.textContent = name || '(none)'
            this._save()
        })
        const clear_parent = document.createElement('button')
        clear_parent.className = 'sw-btn'
        clear_parent.style.cssText = 'font-size:10px; padding:2px 6px;'
        clear_parent.textContent = '✕'
        clear_parent.title = 'Clear parent'
        clear_parent.addEventListener('click', () => {
            this._data.parent_name = ''
            parent_lbl.textContent = '(none)'
            this._save()
        })
        parent_row.append(parent_lbl, parent_btn, clear_parent)
        el.appendChild(parent_row)

        // Properties
        el.appendChild(_section_header('Properties'))
        el.append(
            _checkbox_row('Visible',    this._data.visible,    (v) => { this._data.visible    = v; this._save() }),
            _checkbox_row('Solid',      this._data.solid,      (v) => { this._data.solid      = v; this._save() }),
            _checkbox_row('Persistent', this._data.persistent, (v) => { this._data.persistent = v; this._save() }),
        )
        el.append(_number_row('Depth:', this._data.depth, (v) => { this._data.depth = v; this._save() }))

        // Physics
        el.appendChild(_section_header('Physics'))
        const phys_toggle = _checkbox_row('Enable Physics', this._data.physics, (v) => {
            this._data.physics = v
            phys_props.style.display = v ? '' : 'none'
            this._save()
        })
        el.appendChild(phys_toggle)
        const phys_props = document.createElement('div')
        phys_props.style.cssText = 'display:flex; flex-direction:column; gap:4px; padding-left:12px;'
        phys_props.style.display = this._data.physics ? '' : 'none'
        phys_props.append(
            _number_row('Density:',     this._data.phys_density,     (v) => { this._data.phys_density     = v; this._save() }),
            _number_row('Restitution:', this._data.phys_restitution,  (v) => { this._data.phys_restitution = v; this._save() }),
            _number_row('Friction:',    this._data.phys_friction,     (v) => { this._data.phys_friction    = v; this._save() }),
        )
        el.appendChild(phys_props)

        return el
    }

    private _build_events_panel(): HTMLElement {
        const el = document.createElement('div')
        el.style.cssText = 'display:flex; flex-direction:column; height:100%;'

        // Header
        const hdr = document.createElement('div')
        hdr.className = 'sw-editor-toolbar'
        const hdr_lbl = document.createElement('span')
        hdr_lbl.style.cssText = 'font-size:11px; font-weight:600; flex:1;'
        hdr_lbl.textContent = 'Events'
        const add_btn = document.createElement('button')
        add_btn.className = 'sw-btn'
        add_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
        add_btn.textContent = '+ Add Event'
        add_btn.addEventListener('click', () => this._show_add_event_dialog())
        hdr.append(hdr_lbl, add_btn)
        el.appendChild(hdr)

        // Event list
        this._event_list_el.style.cssText = 'flex:1; overflow-y:auto;'
        el.appendChild(this._event_list_el)

        return el
    }

    private _rebuild_event_list(): void {
        this._event_list_el.innerHTML = ''
        if (this._data.events.length === 0) {
            const empty = document.createElement('div')
            empty.style.cssText = 'color:var(--sw-text-dim); font-size:11px; padding:8px; text-align:center;'
            empty.textContent = 'No events.\nClick "+ Add Event".'
            this._event_list_el.appendChild(empty)
            return
        }
        for (const ev of this._data.events) {
            const row = document.createElement('div')
            row.className = 'sw-obj-event-row'

            const lbl = document.createElement('span')
            lbl.textContent = EVENT_LABELS[ev] ?? ev
            lbl.style.cssText = 'flex:1; font-size:11px;'

            const edit_btn = document.createElement('button')
            edit_btn.className = 'sw-btn'
            edit_btn.style.cssText = 'font-size:10px; padding:2px 6px;'
            edit_btn.textContent = 'Edit'
            edit_btn.addEventListener('click', () => this._edit_event_code(ev))

            const del_btn = document.createElement('button')
            del_btn.className = 'sw-window-btn close'
            del_btn.style.cssText = 'width:16px; height:16px; font-size:9px; flex-shrink:0;'
            del_btn.textContent = '✕'
            del_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this._data.events = this._data.events.filter(e => e !== ev)
                this._rebuild_event_list()
                this._save()
            })

            row.append(lbl, edit_btn, del_btn)
            // Double-click row = open editor
            row.addEventListener('dblclick', () => this._edit_event_code(ev))
            this._event_list_el.appendChild(row)
        }
    }

    private _show_add_event_dialog(): void {
        // Build a simple modal-style overlay
        const overlay = document.createElement('div')
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.5);
            display:flex; align-items:center; justify-content:center; z-index:99999;
        `

        const dlg = document.createElement('div')
        dlg.style.cssText = `
            background:var(--sw-chrome); border:1px solid var(--sw-border);
            padding:12px; min-width:240px; display:flex; flex-direction:column; gap:8px;
        `

        const title = document.createElement('div')
        title.style.cssText = 'font-weight:600; font-size:12px;'
        title.textContent = 'Add Event'
        dlg.appendChild(title)

        for (const group of EVENT_GROUPS) {
            const grp_lbl = document.createElement('div')
            grp_lbl.style.cssText = 'font-size:10px; color:var(--sw-text-dim); text-transform:uppercase; margin-top:4px;'
            grp_lbl.textContent = group.label
            dlg.appendChild(grp_lbl)

            const grp_row = document.createElement('div')
            grp_row.style.cssText = 'display:flex; flex-wrap:wrap; gap:3px;'
            for (const ev of group.events) {
                if (this._data.events.includes(ev)) continue  // already added
                const btn = document.createElement('button')
                btn.className = 'sw-btn'
                btn.style.cssText = 'font-size:10px; padding:2px 6px;'
                btn.textContent = EVENT_LABELS[ev]!
                btn.addEventListener('click', () => {
                    this._data.events.push(ev)
                    this._rebuild_event_list()
                    this._save()
                    overlay.remove()
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

    private async _edit_event_code(ev: event_type): Promise<void> {
        const rel = `objects/${this._object_name}/${ev}.ts`
        const workspace = this._win.el.parentElement!
        try {
            await script_editor_open_smart(workspace, rel, async () => {
                const dir = project_get_dir()!
                const obj_dir = await (await dir.getDirectoryHandle('objects', { create: true }))
                    .getDirectoryHandle(this._object_name, { create: true })
                return obj_dir.getFileHandle(`${ev}.ts`, { create: true })
            })
        } catch (err) {
            console.error('[IDE] Failed to open event code:', err)
        }
    }

    // ── Persistence ────────────────────────────────────────────────────────

    private async _load_data(): Promise<void> {
        try {
            const json = await project_read_file(`objects/${this._object_name}/object.json`)
            const loaded = JSON.parse(json) as Partial<object_data>
            Object.assign(this._data, loaded)
        } catch {
            // New object
        }
        this._rebuild_event_list()
    }

    private _save(): void {
        project_write_file(
            `objects/${this._object_name}/object.json`,
            JSON.stringify(this._data, null, 2),
        ).catch(() => { /* no project dir */ })
    }
}

// =========================================================================
// Helpers
// =========================================================================

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
    inp.type    = 'checkbox'
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
    lbl.className   = 'sw-label'
    lbl.style.cssText += 'min-width:80px; margin:0;'
    lbl.textContent = label
    const inp = document.createElement('input')
    inp.type  = 'number'
    inp.className = 'sw-input'
    inp.style.cssText = 'width:70px;'
    inp.valueAsNumber = initial
    inp.step = '0.01'
    inp.addEventListener('change', () => on_change(inp.valueAsNumber || 0))
    row.append(lbl, inp)
    return row
}
