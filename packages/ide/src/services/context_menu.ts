/**
 * Reusable right-click context menu (GMS 1.4 style). A single menu is open at a time; it closes on
 * outside-click, Escape, or after an item is chosen.
 */

export interface ctx_menu_item {
    label?:     string
    icon?:      string        // optional inline-SVG markup
    action?:    () => void
    disabled?:  boolean
    separator?: boolean
}

let _open: HTMLElement | null = null

/** Closes the currently-open context menu, if any. */
export function close_context_menu(): void {
    if (_open) { _open.remove(); _open = null }
}

/** Opens a context menu at (x, y) with the given items. */
export function show_context_menu(x: number, y: number, items: ctx_menu_item[]): void {
    close_context_menu()
    const menu = document.createElement('div')
    menu.className = 'sw-ctxmenu'

    for (const it of items) {
        if (it.separator) {
            const s = document.createElement('div'); s.className = 'sw-ctxmenu-sep'; menu.appendChild(s)
            continue
        }
        const el = document.createElement('div')
        el.className = 'sw-ctxmenu-item' + (it.disabled ? ' disabled' : '')
        const icon = document.createElement('span'); icon.className = 'sw-ctxmenu-icon'; icon.innerHTML = it.icon ?? ''
        const text = document.createElement('span'); text.textContent = it.label ?? ''
        el.append(icon, text)
        if (!it.disabled && it.action) {
            el.addEventListener('click', () => { close_context_menu(); it.action!() })
        }
        menu.appendChild(el)
    }

    document.body.appendChild(menu)
    // Clamp to the viewport.
    const r = menu.getBoundingClientRect()
    menu.style.left = Math.max(2, Math.min(x, window.innerWidth  - r.width  - 4)) + 'px'
    menu.style.top  = Math.max(2, Math.min(y, window.innerHeight - r.height - 4)) + 'px'
    _open = menu
}

// Global dismissers.
document.addEventListener('mousedown', (e) => {
    if (_open && !_open.contains(e.target as Node)) close_context_menu()
}, true)
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close_context_menu() })
window.addEventListener('blur', close_context_menu)
