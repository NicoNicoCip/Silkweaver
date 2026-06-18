/**
 * Window / display functions (GMS parity).
 *
 * The engine is portable: caption maps to the document title, display size to the
 * screen, window size to the game canvas, and fullscreen to the Fullscreen API.
 * All functions guard their host APIs so they no-op safely off-DOM (e.g. tests).
 */

import { renderer } from '../drawing/renderer.js'

/** Sets the window/title-bar caption. */
export function window_set_caption(caption: string): void {
    if (typeof document !== 'undefined') document.title = caption
}

/** Returns the current window caption. */
export function window_get_caption(): string {
    return typeof document !== 'undefined' ? document.title : ''
}

/** Width of the game window (the canvas drawing surface) in pixels. */
export function window_get_width(): number {
    try { return renderer.get_canvas().width } catch { return 0 }
}

/** Height of the game window (the canvas drawing surface) in pixels. */
export function window_get_height(): number {
    try { return renderer.get_canvas().height } catch { return 0 }
}

/** Resizes the game canvas (best-effort; the loop re-projects each frame). */
export function window_set_size(w: number, h: number): void {
    try { const c = renderer.get_canvas(); c.width = Math.max(1, w); c.height = Math.max(1, h) } catch { /* no canvas */ }
}

/** Width of the display (monitor) in pixels. */
export function display_get_width(): number {
    return typeof screen !== 'undefined' ? screen.width : 0
}

/** Height of the display (monitor) in pixels. */
export function display_get_height(): number {
    return typeof screen !== 'undefined' ? screen.height : 0
}

/** Width of the GUI layer (same as the window in this engine). */
export function display_get_gui_width(): number { return window_get_width() }

/** Height of the GUI layer (same as the window in this engine). */
export function display_get_gui_height(): number { return window_get_height() }

/** Enters or exits fullscreen using the browser Fullscreen API. */
export function window_set_fullscreen(full: boolean): void {
    if (typeof document === 'undefined') return
    try {
        if (full) document.documentElement.requestFullscreen?.()
        else if (document.fullscreenElement) document.exitFullscreen?.()
    } catch { /* fullscreen denied */ }
}

/** True if the game is currently fullscreen. */
export function window_get_fullscreen(): boolean {
    return typeof document !== 'undefined' && !!document.fullscreenElement
}
