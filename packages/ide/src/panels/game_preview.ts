/**
 * Game preview panel.
 * Renders the game inside a sandboxed iframe using exports/game.html.
 * Forwards console messages to the IDE console panel via postMessage.
 */

import { FloatingWindow } from '../window_manager.js'
import { ICON } from '../icons.js'

// =========================================================================
// Module state
// =========================================================================

let _win:    FloatingWindow | null = null
let _iframe: HTMLIFrameElement | null = null
let _running = false
let _btn_stop:   HTMLButtonElement | null = null   // disabled while stopped
let _btn_reload: HTMLButtonElement | null = null   // disabled while stopped

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) the game preview window.
 * @param workspace - IDE workspace element
 */
export function preview_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow(
        'sw-game-preview', 'Game Preview', ICON.play,
        { x: 300, y: 60, w: 640, h: 480 }
    )
    _win.on_close(() => {
        _iframe = null
        _win    = null
        _running = false
        _btn_stop = _btn_reload = null
    })
    _build_ui(workspace)
    _win.mount(workspace)
}

/**
 * Start or restart the game in the preview iframe.
 * @param workspace - IDE workspace element (ensures window exists)
 */
export function preview_play(workspace: HTMLElement): void {
    preview_open(workspace)
    _load_game()
}

/**
 * Stop the game (blank the iframe).
 */
export function preview_stop(): void {
    if (!_iframe) return
    _iframe.src = 'about:blank'
    _running = false
    _sync_buttons()
}

/**
 * Reload the game (hot reload after save/build).
 */
export function preview_reload(): void {
    if (!_iframe || !_running) return
    _load_game()
}

// =========================================================================
// Internal
// =========================================================================

function _build_ui(workspace: HTMLElement): void {
    if (!_win) return
    const body = _win.body
    body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

    // Toolbar
    const toolbar = document.createElement('div')
    toolbar.className = 'sw-editor-toolbar'

    const play_btn = _btn(ICON.play, 'Play', () => preview_play(workspace))
    const stop_btn = _btn(ICON.stop, 'Stop', () => preview_stop())
    const reload_btn = _btn(ICON.refresh, 'Reload', () => preview_reload())
    _btn_stop   = stop_btn
    _btn_reload = reload_btn

    toolbar.append(play_btn, stop_btn, reload_btn)
    body.appendChild(toolbar)
    _sync_buttons()

    // Iframe container
    const container = document.createElement('div')
    container.style.cssText = 'flex:1;position:relative;background:#000;overflow:hidden;'

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;'
    iframe.sandbox.add(
        'allow-scripts',
        'allow-same-origin',
        'allow-popups',
        'allow-forms'
    )
    iframe.src = 'about:blank'
    _iframe = iframe
    container.appendChild(iframe)
    body.appendChild(container)
}

function _load_game(): void {
    if (!_iframe) return
    // Use a cache-busting timestamp so hot reload always fetches fresh JS
    _iframe.src = `game_preview.html?t=${Date.now()}`
    _running = true
    _sync_buttons()
}

/** Builds a toolbar button with an inline icon + label. */
function _btn(icon: string, label: string, on_click: () => void): HTMLButtonElement {
    const b = document.createElement('button')
    b.className = 'sw-btn'
    b.innerHTML = `${icon}<span>${label}</span>`
    b.addEventListener('click', on_click)
    return b
}

/** Stop/Reload only make sense while the game is running. */
function _sync_buttons(): void {
    if (_btn_stop)   _btn_stop.disabled   = !_running
    if (_btn_reload) _btn_reload.disabled = !_running
}
