/**
 * Game preview panel.
 * Renders the game inside a sandboxed iframe using exports/game.html.
 * Forwards console messages to the IDE console panel via postMessage.
 */

import { FloatingWindow } from '../window_manager.js'

// =========================================================================
// Module state
// =========================================================================

let _win:    FloatingWindow | null = null
let _iframe: HTMLIFrameElement | null = null
let _running = false

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
        'sw-game-preview', 'Game Preview', 'icons/room.svg',
        { x: 300, y: 60, w: 640, h: 480 }
    )
    _win.on_close(() => {
        _iframe = null
        _win    = null
        _running = false
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

    const play_btn = document.createElement('button')
    play_btn.className = 'sw-btn'
    play_btn.textContent = '▶ Play'
    play_btn.addEventListener('click', () => preview_play(workspace))

    const stop_btn = document.createElement('button')
    stop_btn.className = 'sw-btn'
    stop_btn.textContent = '■ Stop'
    stop_btn.addEventListener('click', () => preview_stop())

    const reload_btn = document.createElement('button')
    reload_btn.className = 'sw-btn'
    reload_btn.textContent = '↺ Reload'
    reload_btn.addEventListener('click', () => preview_reload())

    toolbar.append(play_btn, stop_btn, reload_btn)
    body.appendChild(toolbar)

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
}
