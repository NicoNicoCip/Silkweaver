/**
 * Taskbar — the bottom strip listing every open floating window (Windows-style).
 *
 * One button per open window (icon + title). Clicking focuses/restores a window and brings it to
 * the front; clicking the already-front window minimizes it. The active window is highlighted and
 * minimized ones are dimmed. The strip rebuilds (coalesced) whenever the open set, the active
 * window, or any window title changes — see FloatingWindow.on_change.
 */

import { FloatingWindow } from './window_manager.js'

let _bar: HTMLElement | null = null

/** Creates the taskbar element and wires it to window changes. */
export function taskbar_create(): HTMLElement {
    const bar = document.createElement('div')
    bar.id = 'sw-taskbar'
    _bar = bar
    FloatingWindow.on_change(_render)
    _render()
    return bar
}

// =========================================================================
// Internal
// =========================================================================

function _render(): void {
    if (!_bar) return
    _bar.innerHTML = ''

    const wins = FloatingWindow.list()
    if (wins.length === 0) {
        const empty = document.createElement('span')
        empty.className = 'sw-task-empty'
        empty.textContent = 'No open windows'
        _bar.appendChild(empty)
        return
    }

    const active = FloatingWindow.active()
    for (const w of wins) _bar.appendChild(_button(w, w === active))
}

function _button(w: FloatingWindow, is_active: boolean): HTMLElement {
    const btn = document.createElement('button')
    btn.className = 'sw-task-btn'
    if (w.is_minimized())   btn.classList.add('minimized')   // dimmed/italic; never "active"
    else if (is_active)     btn.classList.add('active')

    const ico = _icon(w.get_icon())
    if (ico) btn.appendChild(ico)

    const label = document.createElement('span')
    label.className = 'sw-task-label'
    label.textContent = w.get_title()
    btn.appendChild(label)

    btn.title = w.get_title()
    btn.addEventListener('click', () => {
        // Windows behaviour: clicking the front window minimizes it; otherwise focus/restore it.
        if (!w.is_minimized() && FloatingWindow.active() === w) w.toggle_minimize()
        else w.focus()
    })
    return btn
}

/** Renders a window icon (inline SVG string or image URL) at taskbar size. */
function _icon(src: string | null): HTMLElement | null {
    if (!src) return null
    if (src.trimStart().startsWith('<svg')) {
        const span = document.createElement('span')
        span.className = 'sw-task-ico'
        span.innerHTML = src
        return span
    }
    const img = document.createElement('img')
    img.src = src
    return img
}
