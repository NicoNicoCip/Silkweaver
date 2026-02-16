/**
 * Debugger / Variable Inspection panel.
 *
 * Opens as a floating window.  Listens for breakpoint-hit events from
 * breakpoint_manager and displays the variable snapshot.  Provides a
 * Resume button to unpause the game.
 */

import { FloatingWindow }       from '../window_manager.js'
import { bp_on_hit, bp_resume } from './breakpoint_manager.js'

// =========================================================================
// State
// =========================================================================

let _win:      FloatingWindow | null = null
let _vars_el:  HTMLElement | null    = null
let _status_el: HTMLElement | null   = null
let _listener_registered = false

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) the debugger panel.
 * @param workspace - IDE workspace element
 */
export function debugger_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow(
        'sw-debugger', 'Debugger', 'icons/script.svg',
        { x: 700, y: 60, w: 340, h: 420 }
    )
    _win.on_close(() => { _win = null; _vars_el = null; _status_el = null })
    _build_ui()
    _win.mount(workspace)
    _ensure_listener()
}

/**
 * Show a breakpoint hit in the panel (opens it if needed).
 * @param workspace - IDE workspace element
 * @param file      - File path where break occurred
 * @param line      - Line number (1-based)
 * @param vars      - Variable snapshot from the game
 */
export function debugger_show_hit(
    workspace: HTMLElement,
    file: string,
    line: number,
    vars: Record<string, unknown>
): void {
    debugger_open(workspace)
    _set_status(`Paused at ${file}:${line}`, true)
    _render_vars(vars)
}

// =========================================================================
// Internal
// =========================================================================

function _build_ui(): void {
    if (!_win) return
    const body = _win.body
    body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

    // Toolbar
    const toolbar = document.createElement('div')
    toolbar.className = 'sw-editor-toolbar'

    const resume_btn = document.createElement('button')
    resume_btn.className = 'sw-btn'
    resume_btn.textContent = '▶ Resume'
    resume_btn.addEventListener('click', () => {
        bp_resume()
        _set_status('Running…', false)
        if (_vars_el) _vars_el.innerHTML = ''
    })
    toolbar.appendChild(resume_btn)

    const clear_btn = document.createElement('button')
    clear_btn.className = 'sw-btn'
    clear_btn.textContent = 'Clear'
    clear_btn.addEventListener('click', () => {
        if (_vars_el) _vars_el.innerHTML = ''
        _set_status('Ready', false)
    })
    toolbar.appendChild(clear_btn)
    body.appendChild(toolbar)

    // Status bar
    const status = document.createElement('div')
    status.className = 'sw-dbg-status'
    status.textContent = 'Ready'
    _status_el = status
    body.appendChild(status)

    // Variable tree
    const vars = document.createElement('div')
    vars.className = 'sw-dbg-vars'
    _vars_el = vars
    body.appendChild(vars)
}

function _set_status(text: string, paused: boolean): void {
    if (!_status_el) return
    _status_el.textContent = text
    _status_el.classList.toggle('paused', paused)
}

function _render_vars(vars: Record<string, unknown>): void {
    if (!_vars_el) return
    _vars_el.innerHTML = ''
    const entries = Object.entries(vars)
    if (entries.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'sw-dbg-empty'
        empty.textContent = '(no variables)'
        _vars_el.appendChild(empty)
        return
    }
    for (const [key, val] of entries) {
        const row = document.createElement('div')
        row.className = 'sw-dbg-row'

        const key_el = document.createElement('span')
        key_el.className = 'sw-dbg-key'
        key_el.textContent = key

        const val_el = document.createElement('span')
        val_el.className = `sw-dbg-val sw-dbg-${_type_class(val)}`
        val_el.textContent = _format_val(val)

        row.append(key_el, val_el)
        _vars_el.appendChild(row)
    }
}

function _type_class(v: unknown): string {
    if (v === null)           return 'null'
    if (typeof v === 'boolean') return 'bool'
    if (typeof v === 'number')  return 'num'
    if (typeof v === 'string')  return 'str'
    if (typeof v === 'object')  return 'obj'
    return 'other'
}

function _format_val(v: unknown): string {
    if (v === null)           return 'null'
    if (v === undefined)      return 'undefined'
    if (typeof v === 'string') return `"${v}"`
    if (typeof v === 'object') {
        try { return JSON.stringify(v) } catch { return '[Object]' }
    }
    return String(v)
}

function _ensure_listener(): void {
    if (_listener_registered) return
    _listener_registered = true
    // bp_on_hit fires for every breakpoint hit from the iframe
    bp_on_hit((file, line, vars) => {
        // We need the workspace to open the panel — store it lazily
        // The panel is already open if this callback fires, since _ensure_listener
        // is only called from debugger_open which already builds the UI.
        _set_status(`Paused at ${file}:${line}`, true)
        _render_vars(vars)
    })
}
