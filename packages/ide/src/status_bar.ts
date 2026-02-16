/**
 * Thin status bar pinned at the bottom of the IDE workspace.
 * Shows: project name · unsaved indicator · cursor coords · FPS
 */

// =========================================================================
// State
// =========================================================================

let _el_name:   HTMLElement | null = null
let _el_unsaved:HTMLElement | null = null
let _el_coords: HTMLElement | null = null
let _el_fps:    HTMLElement | null = null

// =========================================================================
// Public API
// =========================================================================

/** Creates and returns the status bar element. */
export function status_bar_create(): HTMLElement {
    const bar = document.createElement('div')
    bar.id = 'sw-statusbar'

    _el_name    = _span('No project')
    _el_unsaved = _span('')
    _el_coords  = _span('')
    _el_fps     = _span('')

    const sep1 = _sep()
    const sep2 = _sep()
    const sep3 = _sep()

    bar.append(_el_name, _el_unsaved, sep1, _el_coords, sep2, _el_fps, sep3)

    return bar
}

/** Update the project name display. */
export function status_set_project(name: string): void {
    if (_el_name) _el_name.textContent = name
}

/** Show or hide the unsaved indicator (● dot). */
export function status_set_unsaved(unsaved: boolean): void {
    if (_el_unsaved) _el_unsaved.textContent = unsaved ? '●' : ''
}

/** Update the cursor coordinates display. */
export function status_set_coords(x: number, y: number): void {
    if (_el_coords) _el_coords.textContent = `${Math.round(x)}, ${Math.round(y)}`
}

/** Update the FPS display. */
export function status_set_fps(fps: number): void {
    if (_el_fps) _el_fps.textContent = `${fps.toFixed(0)} fps`
}

// =========================================================================
// Helpers
// =========================================================================

function _span(text: string): HTMLElement {
    const s = document.createElement('span')
    s.textContent = text
    return s
}

function _sep(): HTMLElement {
    const s = document.createElement('span')
    s.className = 'sw-statusbar-sep'
    s.textContent = '|'
    return s
}
