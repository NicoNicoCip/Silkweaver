/**
 * Top menubar for the Silkweaver IDE.
 * Win10 flat style: File | Resource | Run | Help
 */

// =========================================================================
// Types
// =========================================================================

interface menu_item {
    label?:     string
    shortcut?:  string
    action?:    () => void
    separator?: boolean
    disabled?:  boolean
}

interface menu_def {
    label:   string
    items:   menu_item[]
}

// =========================================================================
// State
// =========================================================================

let _open_menu: HTMLElement | null = null

// =========================================================================
// Public API
// =========================================================================

/**
 * Creates and mounts the menubar element.
 * @param menus - Menu definitions
 * @returns The menubar element
 */
export function menubar_create(menus: menu_def[]): HTMLElement {
    const bar = document.createElement('div')
    bar.id = 'sw-menubar'

    for (const def of menus) {
        bar.appendChild(_build_menu(def))
    }

    // Close open menus when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (_open_menu && !_open_menu.contains(e.target as Node)) {
            _close_all(bar)
        }
    })

    return bar
}

// =========================================================================
// Internal
// =========================================================================

function _build_menu(def: menu_def): HTMLElement {
    const item = document.createElement('div')
    item.className = 'sw-menu-item'
    item.textContent = def.label

    const dropdown = document.createElement('div')
    dropdown.className = 'sw-dropdown'

    for (const entry of def.items) {
        if (entry.separator) {
            const sep = document.createElement('div')
            sep.className = 'sw-dropdown-sep'
            dropdown.appendChild(sep)
            continue
        }

        const row = document.createElement('div')
        row.className = 'sw-dropdown-item' + (entry.disabled ? ' disabled' : '')

        const lbl = document.createElement('span')
        lbl.textContent = entry.label ?? ''

        row.appendChild(lbl)

        if (entry.shortcut) {
            const sc = document.createElement('span')
            sc.className = 'sw-dropdown-shortcut'
            sc.textContent = entry.shortcut
            row.appendChild(sc)
        }

        if (!entry.disabled && entry.action) {
            row.addEventListener('click', () => {
                const bar = item.closest('#sw-menubar') as HTMLElement
                _close_all(bar)
                entry.action!()
            })
        }

        dropdown.appendChild(row)
    }

    item.appendChild(dropdown)

    item.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        // If the click is on a dropdown item, let the click handler fire — don't toggle
        if ((e.target as HTMLElement).closest('.sw-dropdown')) return
        const bar = item.closest('#sw-menubar') as HTMLElement
        const was_open = item.classList.contains('open')
        _close_all(bar)
        if (!was_open) {
            item.classList.add('open')
            _open_menu = item
        }
    })

    return item
}

function _close_all(bar: HTMLElement): void {
    bar.querySelectorAll('.sw-menu-item.open').forEach(el => el.classList.remove('open'))
    _open_menu = null
}

// =========================================================================
// Default menu definitions
// =========================================================================

export interface menubar_actions {
    file_new:    () => void
    file_open:   () => void
    file_save:   () => void
    file_save_as:() => void
    edit_game_settings: () => void
    res_add_sprite:   () => void
    res_add_sound:    () => void
    res_add_background:() => void
    res_add_path:     () => void
    res_add_script:   () => void
    res_add_font:     () => void
    res_add_timeline: () => void
    res_add_object:   () => void
    res_add_room:     () => void
    view_resources:  () => void
    view_console:    () => void
    view_debugger:   () => void
    view_profiler:   () => void
    view_preview:    () => void
    run_play:    () => void
    run_stop:    () => void
    run_build:   () => void
    help_about:  () => void
}

/**
 * Builds the default IDE menubar.
 * @param actions - Callback map for menu actions
 */
export function menubar_default(actions: menubar_actions): HTMLElement {
    const menus: menu_def[] = [
        {
            label: 'File',
            items: [
                { label: 'New Project',     shortcut: 'Ctrl+N', action: actions.file_new },
                { label: 'Open Project…',   shortcut: 'Ctrl+O', action: actions.file_open },
                { separator: true },
                { label: 'Save',            shortcut: 'Ctrl+S', action: actions.file_save },
                { label: 'Save As…',                            action: actions.file_save_as },
            ],
        },
        {
            label: 'Edit',
            items: [
                { label: 'Undo',           shortcut: 'Ctrl+Z',       disabled: true },
                { label: 'Redo',           shortcut: 'Ctrl+Y',       disabled: true },
                { separator: true },
                { label: 'Game Settings…', shortcut: 'Ctrl+Shift+P', action: actions.edit_game_settings },
            ],
        },
        {
            label: 'Resource',
            items: [
                { label: 'Add Sprite',     action: actions.res_add_sprite },
                { label: 'Add Sound',      action: actions.res_add_sound },
                { label: 'Add Background', action: actions.res_add_background },
                { label: 'Add Path',       action: actions.res_add_path },
                { label: 'Add Script',     action: actions.res_add_script },
                { label: 'Add Font',       action: actions.res_add_font },
                { label: 'Add Timeline',   action: actions.res_add_timeline },
                { separator: true },
                { label: 'Add Object',     action: actions.res_add_object },
                { label: 'Add Room',       action: actions.res_add_room },
            ],
        },
        {
            label: 'View',
            items: [
                { label: 'Resources',    shortcut: 'Ctrl+R', action: actions.view_resources },
                { separator: true },
                { label: 'Console',      shortcut: 'Ctrl+`', action: actions.view_console },
                { label: 'Debugger',     shortcut: 'F9',     action: actions.view_debugger },
                { label: 'Profiler',     shortcut: 'F10',    action: actions.view_profiler },
                { label: 'Game Preview', shortcut: 'F11',    action: actions.view_preview },
            ],
        },
        {
            label: 'Run',
            items: [
                { label: 'Play',  shortcut: 'F5',       action: actions.run_play },
                { label: 'Stop',  shortcut: 'Shift+F5', action: actions.run_stop },
                { separator: true },
                { label: 'Build Game…', action: actions.run_build },
            ],
        },
        {
            label: 'Help',
            items: [
                { label: 'About Silkweaver', action: actions.help_about },
            ],
        },
    ]

    return menubar_create(menus)
}
