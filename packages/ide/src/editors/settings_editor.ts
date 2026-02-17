/**
 * Project Settings editor.
 * Edits project_state.name, version, and all project_settings fields.
 * Changes are written back into the live state object immediately and
 * the on_change callback is invoked so the caller can mark the project unsaved.
 */

import { FloatingWindow } from '../window_manager.js'
import type { project_state } from '../services/project.js'

// =========================================================================
// Module state
// =========================================================================

let _win: FloatingWindow | null = null

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) the project settings panel.
 * @param workspace  - IDE workspace element
 * @param state      - Live project state to read/write
 * @param room_names - Current list of room resource names for the start-room dropdown
 * @param on_change  - Called whenever any field is changed
 */
export function settings_editor_open(
    workspace:  HTMLElement,
    state:      project_state,
    room_names: string[],
    on_change:  () => void,
): void {
    if (_win) {
        // Rebuild UI with latest state in case rooms list changed
        _win.body.innerHTML = ''
        _build_ui(_win.body, state, room_names, on_change)
        _win.bring_to_front()
        return
    }

    _win = new FloatingWindow(
        'sw-settings',
        'Game Settings',
        null,
        { x: 160, y: 60, w: 420, h: 480 },
    )
    _win.on_close(() => { _win = null })

    _build_ui(_win.body, state, room_names, on_change)
    _win.mount(workspace)
}

// =========================================================================
// UI construction
// =========================================================================

function _build_ui(
    body:       HTMLElement,
    state:      project_state,
    room_names: string[],
    on_change:  () => void,
): void {
    const root = document.createElement('div')
    root.style.cssText = 'padding:12px; overflow-y:auto; height:100%; display:flex; flex-direction:column; gap:16px;'

    root.appendChild(_section('Project', [
        _field_text('Name',           state.name,           v => { state.name = v;           on_change() }),
        _field_text('Version',        state.version,        v => { state.version = v;        on_change() }),
        _field_text('Engine Version', state.engineVersion,  null),  // read-only
    ]))

    root.appendChild(_section('Display', [
        _field_number('Window Width',  state.settings.windowWidth,  1, 7680, v => { state.settings.windowWidth  = v; on_change() }),
        _field_number('Window Height', state.settings.windowHeight, 1, 4320, v => { state.settings.windowHeight = v; on_change() }),
        _field_color( 'Background Color', state.settings.displayColor ?? '#000000', v => { state.settings.displayColor = v; on_change() }),
    ]))

    root.appendChild(_section('Game', [
        _field_number('Room Speed (FPS)', state.settings.roomSpeed, 1, 960, v => { state.settings.roomSpeed = v; on_change() }),
        _field_select('Start Room', state.settings.startRoom, room_names,
            v => { state.settings.startRoom = v; on_change() }),
    ]))

    body.appendChild(root)
}

// =========================================================================
// Section / field helpers
// =========================================================================

function _section(title: string, fields: HTMLElement[]): HTMLElement {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:6px;'

    const hdr = document.createElement('div')
    hdr.textContent = title
    hdr.style.cssText = `
        font-size:11px; font-weight:bold; text-transform:uppercase;
        letter-spacing:0.5px; color:var(--sw-text-dim);
        padding-bottom:4px; border-bottom:1px solid var(--sw-border2);
    `
    wrap.appendChild(hdr)
    fields.forEach(f => wrap.appendChild(f))
    return wrap
}

function _row(label: string, control: HTMLElement): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:8px;'

    const lbl = document.createElement('label')
    lbl.className = 'sw-label'
    lbl.textContent = label
    lbl.style.cssText += 'min-width:140px; flex-shrink:0; margin:0;'

    row.append(lbl, control)
    return row
}

function _field_text(label: string, value: string, on_input: ((v: string) => void) | null): HTMLElement {
    const inp = document.createElement('input')
    inp.className = 'sw-input'
    inp.type  = 'text'
    inp.value = value
    inp.style.flex = '1'
    if (!on_input) inp.readOnly = true
    else inp.addEventListener('input', () => on_input(inp.value))
    return _row(label, inp)
}

function _field_number(label: string, value: number, min: number, max: number, on_change: (v: number) => void): HTMLElement {
    const inp = document.createElement('input')
    inp.className = 'sw-input'
    inp.type  = 'number'
    inp.min   = String(min)
    inp.max   = String(max)
    inp.value = String(value)
    inp.style.flex = '1'
    inp.addEventListener('change', () => {
        const n = Math.max(min, Math.min(max, Number(inp.value) || min))
        inp.value = String(n)
        on_change(n)
    })
    return _row(label, inp)
}

function _field_select(label: string, value: string, options: string[], on_change: (v: string) => void): HTMLElement {
    const sel = document.createElement('select')
    sel.className = 'sw-select'
    sel.style.flex = '1'

    if (options.length === 0) {
        const opt = document.createElement('option')
        opt.value = ''
        opt.textContent = '(no rooms defined)'
        sel.appendChild(opt)
    } else {
        for (const name of options) {
            const opt = document.createElement('option')
            opt.value = name
            opt.textContent = name
            if (name === value) opt.selected = true
            sel.appendChild(opt)
        }
    }

    sel.addEventListener('change', () => on_change(sel.value))
    return _row(label, sel)
}

function _field_color(label: string, value: string, on_change: (v: string) => void): HTMLElement {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'display:flex; align-items:center; gap:6px; flex:1;'

    const picker = document.createElement('input')
    picker.type  = 'color'
    picker.value = value
    picker.style.cssText = 'width:32px; height:24px; border:none; cursor:pointer; background:none; padding:0;'
    picker.addEventListener('input', () => {
        hex.value = picker.value.toUpperCase()
        on_change(picker.value)
    })

    const hex = document.createElement('input')
    hex.className = 'sw-input'
    hex.type  = 'text'
    hex.value = value.toUpperCase()
    hex.maxLength = 7
    hex.style.cssText += 'flex:1; font-family:Consolas,monospace; font-size:11px;'
    hex.addEventListener('change', () => {
        const v = hex.value.startsWith('#') ? hex.value : '#' + hex.value
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            picker.value = v.toLowerCase()
            hex.value = v.toUpperCase()
            on_change(v.toLowerCase())
        } else {
            hex.value = picker.value.toUpperCase()
        }
    })

    wrap.append(picker, hex)
    return _row(label, wrap)
}
