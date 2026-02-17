/**
 * IDE Console / Output panel.
 * Displays log, warn, error, and info messages forwarded from the game
 * preview iframe via postMessage, plus IDE-internal messages.
 *
 * Message protocol (from game_preview.html → IDE):
 *   { type: 'sw:log', level: 'log'|'warn'|'error'|'info', args: string[] }
 */

import { FloatingWindow } from '../window_manager.js'

// =========================================================================
// Types
// =========================================================================

type log_level = 'log' | 'warn' | 'error' | 'info' | 'system'

interface log_entry {
    level:   log_level
    text:    string
    time:    string
}

// =========================================================================
// Module state
// =========================================================================

let _win:      FloatingWindow | null = null
let _list_el:  HTMLElement | null = null
let _entries:  log_entry[] = []
let _filter:   Set<log_level> = new Set(['log', 'warn', 'error', 'info', 'system'])
let _listener_attached = false

const MAX_ENTRIES = 500

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) the console panel.
 * @param workspace - IDE workspace element
 */
export function console_open(workspace: HTMLElement, minimized = false): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow(
        'sw-console', 'Output', 'icons/script.svg',
        { x: 0, y: 400, w: 700, h: 200 }
    )
    _win.on_close(() => { _win = null; _list_el = null })
    _build_ui()
    _win.mount(workspace)
    if (minimized) {
        _win.toggle_minimize()
    }
    _render_all()
    _ensure_listener()
}

/**
 * Toggle console visibility (open if closed, minimize if open, restore if minimized).
 */
export function console_toggle(workspace: HTMLElement): void {
    if (!_win) {
        console_open(workspace, false)
    } else {
        _win.toggle_minimize()
    }
}

/**
 * Write a message to the console from IDE code.
 * @param level - Log level
 * @param text  - Message text
 */
export function console_write(level: log_level, text: string): void {
    _push({ level, text, time: _timestamp() })
    _ensure_listener()
    // Mirror to DevTools console so errors are visible without copying from the panel
    if      (level === 'error')  console.error('[SW]', text)
    else if (level === 'warn')   console.warn('[SW]', text)
    else                         console.log('[SW]', text)
}

/**
 * Clear all entries.
 */
export function console_clear(): void {
    _entries = []
    if (_list_el) _list_el.innerHTML = ''
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

    // Filter toggles
    const levels: log_level[] = ['log', 'info', 'warn', 'error', 'system']
    for (const lvl of levels) {
        const btn = document.createElement('button')
        btn.className = `sw-btn sw-con-filter${_filter.has(lvl) ? ' active' : ''}`
        btn.dataset['level'] = lvl
        btn.textContent = lvl
        btn.addEventListener('click', () => {
            if (_filter.has(lvl)) _filter.delete(lvl)
            else                  _filter.add(lvl)
            btn.classList.toggle('active', _filter.has(lvl))
            _render_all()
        })
        toolbar.appendChild(btn)
    }

    const sep = document.createElement('div')
    sep.style.cssText = 'flex:1;'
    toolbar.appendChild(sep)

    const clear_btn = document.createElement('button')
    clear_btn.className = 'sw-btn'
    clear_btn.textContent = 'Clear'
    clear_btn.addEventListener('click', () => console_clear())
    toolbar.appendChild(clear_btn)

    body.appendChild(toolbar)

    // Log list
    const list = document.createElement('div')
    list.className = 'sw-con-list'
    list.style.cssText = 'flex:1;overflow-y:auto;font-family:monospace;font-size:11px;'
    _list_el = list
    body.appendChild(list)
}

function _render_all(): void {
    if (!_list_el) return
    _list_el.innerHTML = ''
    for (const entry of _entries) {
        if (_filter.has(entry.level)) _append_row(entry)
    }
    _scroll_bottom()
}

function _push(entry: log_entry): void {
    _entries.push(entry)
    if (_entries.length > MAX_ENTRIES) _entries.shift()
    if (_list_el && _filter.has(entry.level)) {
        _append_row(entry)
        _scroll_bottom()
    }
}

function _append_row(entry: log_entry): void {
    if (!_list_el) return
    const row = document.createElement('div')
    row.className = `sw-con-row sw-con-${entry.level}`
    const time_span = document.createElement('span')
    time_span.className = 'sw-con-time'
    time_span.textContent = entry.time
    const text_span = document.createElement('span')
    text_span.className = 'sw-con-text'
    text_span.textContent = entry.text
    row.append(time_span, text_span)
    _list_el.appendChild(row)
}

function _scroll_bottom(): void {
    if (_list_el) _list_el.scrollTop = _list_el.scrollHeight
}

function _timestamp(): string {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Attach a window message listener once to receive logs from the preview iframe.
 */
function _ensure_listener(): void {
    if (_listener_attached) return
    _listener_attached = true
    window.addEventListener('message', (e: MessageEvent) => {
        if (!e.data || e.data.type !== 'sw:log') return
        const level = (e.data.level as log_level) ?? 'log'
        const args:  unknown[] = Array.isArray(e.data.args) ? e.data.args : []
        const text = args.map(a => {
            if (typeof a === 'string') return a
            try { return JSON.stringify(a) } catch { return String(a) }
        }).join(' ')
        _push({ level, text, time: _timestamp() })
        if      (level === 'error')  console.error('[Game]', text)
        else if (level === 'warn')   console.warn('[Game]', text)
        else                         console.log('[Game]', text)
    })
}
