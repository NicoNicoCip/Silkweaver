/**
 * Debugger — live instance inspector.
 *
 * Asks the running game (the preview iframe) for a snapshot of every active instance and its
 * variables. Each instance is a collapsible header (collapsed by default); a dropdown filters to one
 * object type. "Refresh" pulls a fresh snapshot; "Live" polls a few times a second.
 *
 *   IDE  → game: { type: 'sw:inspect' }
 *   game → IDE:  { type: 'sw:instances', instances: [{ id, object_name, vars }] }
 */

import { FloatingWindow } from '../window_manager.js'
import { ICON }           from '../icons.js'

// =========================================================================
// Types / state
// =========================================================================

interface inst_snap { id: number; object_name: string; vars: Record<string, unknown> }

let _win:        FloatingWindow | null = null
let _list_el:    HTMLElement | null    = null
let _status_el:  HTMLElement | null    = null
let _filter_sel: HTMLSelectElement | null = null
let _filter      = ''            // selected object_name; '' = all objects
let _filter_key  = ''            // signature of the current dropdown options (avoids needless rebuilds)
let _last:      inst_snap[] = []  // most recent snapshot (re-rendered on filter / expand toggles)
const _expanded = new Set<number>()   // instance ids whose fields are expanded (persist across refreshes)
let _listener_registered = false
let _live_timer: ReturnType<typeof setInterval> | null = null

const LIVE_MS = 400   // poll interval while "Live" is on

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) the debugger / instance inspector.
 * @param workspace - IDE workspace element
 */
export function debugger_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow(
        'sw-debugger', 'Debugger', ICON.script,
        { x: 700, y: 60, w: 340, h: 460 }
    )
    _win.on_close(() => {
        _win = null; _list_el = null; _status_el = null; _filter_sel = null
        if (_live_timer) { clearInterval(_live_timer); _live_timer = null }
    })
    _build_ui()
    _win.mount(workspace)
    _ensure_listener()
    _request()   // initial pull
}

// =========================================================================
// Internal
// =========================================================================

function _build_ui(): void {
    if (!_win) return
    const body = _win.body
    body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

    // Toolbar: Refresh · Live · object filter
    const toolbar = document.createElement('div')
    toolbar.className = 'sw-editor-toolbar'

    const refresh = document.createElement('button')
    refresh.className = 'sw-btn'
    refresh.textContent = '⟳ Refresh'
    refresh.title = 'Pull a fresh snapshot from the running game'
    refresh.addEventListener('click', () => _request())
    toolbar.appendChild(refresh)

    const live_lbl = document.createElement('label')
    live_lbl.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;color:var(--sw-text-dim);'
    const live = document.createElement('input')
    live.type = 'checkbox'; live.className = 'sw-checkbox'
    live.addEventListener('change', () => {
        if (live.checked) { _request(); _live_timer = setInterval(_request, LIVE_MS) }
        else if (_live_timer) { clearInterval(_live_timer); _live_timer = null }
    })
    live_lbl.append(live, document.createTextNode('Live'))
    toolbar.appendChild(live_lbl)

    const sel = document.createElement('select')
    sel.className = 'sw-select'
    sel.style.cssText = 'margin-left:auto;max-width:150px;font-size:11px;'
    sel.title = 'Filter by object'
    sel.addEventListener('change', () => { _filter = sel.value; _render() })
    const all = document.createElement('option'); all.value = ''; all.textContent = 'All objects'
    sel.appendChild(all)
    _filter_sel = sel
    toolbar.appendChild(sel)
    body.appendChild(toolbar)

    // Status
    const status = document.createElement('div')
    status.className = 'sw-dbg-status'
    status.textContent = 'Run the game (F5), then Refresh.'
    _status_el = status
    body.appendChild(status)

    // Instance tree
    const list = document.createElement('div')
    list.className = 'sw-dbg-vars'
    _list_el = list
    body.appendChild(list)
}

/** Sends an inspect request to the preview iframe(s). */
function _request(): void {
    const frames = document.querySelectorAll('iframe')
    for (const f of frames) {
        try { f.contentWindow?.postMessage({ type: 'sw:inspect' }, '*') } catch { /* cross-origin / not ready */ }
    }
}

/** Rebuilds the object-filter dropdown only when the set of object names actually changes. */
function _sync_filter_options(): void {
    if (!_filter_sel) return
    const names = [...new Set(_last.map(i => i.object_name))].sort()
    const key = names.join('|')
    if (key === _filter_key) return
    _filter_key = key
    if (_filter && !names.includes(_filter)) _filter = ''   // filtered object vanished → back to All
    _filter_sel.innerHTML = ''
    const all = document.createElement('option'); all.value = ''; all.textContent = 'All objects'
    _filter_sel.appendChild(all)
    for (const n of names) {
        const o = document.createElement('option'); o.value = n; o.textContent = n
        _filter_sel.appendChild(o)
    }
    _filter_sel.value = _filter
}

function _render(): void {
    if (!_list_el) return
    const shown = _filter ? _last.filter(i => i.object_name === _filter) : _last

    if (_status_el) {
        _status_el.textContent = _last.length === 0
            ? 'No active instances.'
            : _filter
                ? `${shown.length} ${_filter} · ${_last.length} total`
                : `${_last.length} active instance${_last.length === 1 ? '' : 's'}`
    }

    const scroll = _list_el.scrollTop   // keep position steady across Live refreshes
    _list_el.innerHTML = ''

    if (shown.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'sw-dbg-empty'
        empty.textContent = _last.length === 0
            ? '(nothing to inspect — is the game running?)'
            : `(no ${_filter} instances)`
        _list_el.appendChild(empty)
        return
    }

    for (const inst of shown) {
        const open = _expanded.has(inst.id)
        const entries = Object.entries(inst.vars ?? {})

        const head = document.createElement('div')
        head.className = 'sw-dbg-inst'
        const caret = document.createElement('span')
        caret.className = 'sw-dbg-caret'
        caret.textContent = open ? '▾' : '▸'
        head.append(caret, document.createTextNode(`${inst.object_name} #${inst.id}`))
        const count = document.createElement('span')
        count.className = 'sw-dbg-count'
        count.textContent = `${entries.length} vars`
        head.appendChild(count)
        head.addEventListener('click', () => {
            if (_expanded.has(inst.id)) _expanded.delete(inst.id); else _expanded.add(inst.id)
            _render()
        })
        _list_el.appendChild(head)

        if (open) {
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
                _list_el.appendChild(row)
            }
        }
    }

    _list_el.scrollTop = scroll
}

function _type_class(v: unknown): string {
    if (v === null)             return 'null'
    if (Array.isArray(v))       return 'obj'
    if (typeof v === 'boolean') return 'bool'
    if (typeof v === 'number')  return 'num'
    if (typeof v === 'string')  return 'str'
    if (typeof v === 'object')  return 'obj'
    return 'other'
}

function _format_val(v: unknown): string {
    if (v === null)            return 'null'
    if (v === undefined)       return 'undefined'
    if (typeof v === 'string') return `"${v}"`
    if (typeof v === 'object') {
        try { return JSON.stringify(v) } catch { return '[Object]' }
    }
    return String(v)
}

function _ensure_listener(): void {
    if (_listener_registered) return
    _listener_registered = true
    window.addEventListener('message', (e: MessageEvent) => {
        if (!e.data || e.data.type !== 'sw:instances') return
        _last = Array.isArray(e.data.instances) ? e.data.instances as inst_snap[] : []
        _sync_filter_options()
        _render()
    })
}
