/**
 * View / camera system.
 *
 * A view defines the visible region of the room mapped onto a viewport
 * (a rectangle on screen). Multiple views can be active simultaneously.
 *
 * GMS-compatible API:
 *   view_set / view_get — configure view properties
 *   camera_set_view_pos / camera_set_view_size — convenience setters
 *   view_apply — activate a view (sets GL viewport + projection)
 *
 * All coordinates are in room (world) space unless noted otherwise.
 */

import { renderer } from './renderer.js'

// =========================================================================
// View definition
// =========================================================================

export interface view_config {
    enabled:  boolean   // Whether this view is active
    x:        number    // Room X of the view's top-left corner
    y:        number    // Room Y of the view's top-left corner
    w:        number    // Width of the visible region in room space
    h:        number    // Height of the visible region in room space
    port_x:   number    // Viewport left on screen (pixels)
    port_y:   number    // Viewport top on screen (pixels)
    port_w:   number    // Viewport width on screen (pixels)
    port_h:   number    // Viewport height on screen (pixels)
    angle:    number    // View rotation in degrees (0 = no rotation)
}

function make_default_view(port_w: number = 800, port_h: number = 600): view_config {
    return {
        enabled: false,
        x: 0, y: 0,
        w: port_w, h: port_h,
        port_x: 0, port_y: 0,
        port_w, port_h,
        angle: 0,
    }
}

// =========================================================================
// View registry (8 views, matching GMS)
// =========================================================================

const MAX_VIEWS = 8
const _views: view_config[] = Array.from({ length: MAX_VIEWS }, () => make_default_view())

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Returns the view config for a given view index.
 * @param view_index - View slot (0–7)
 */
export function view_get(view_index: number): view_config {
    if (view_index < 0 || view_index >= MAX_VIEWS) throw new Error(`view_get: index out of range (0–${MAX_VIEWS - 1})`)
    return _views[view_index]
}

/**
 * Enables or disables a view.
 * @param view_index - View slot (0–7)
 * @param enabled - True to enable
 */
export function view_set_enabled(view_index: number, enabled: boolean): void {
    _views[view_index].enabled = enabled
}

/**
 * Sets the room-space position of a view.
 * @param view_index - View slot
 * @param x - Room X
 * @param y - Room Y
 */
export function view_set_position(view_index: number, x: number, y: number): void {
    _views[view_index].x = x
    _views[view_index].y = y
}

/**
 * Sets the room-space size of a view.
 * @param view_index - View slot
 * @param w - Width in room pixels
 * @param h - Height in room pixels
 */
export function view_set_size(view_index: number, w: number, h: number): void {
    _views[view_index].w = w
    _views[view_index].h = h
}

/**
 * Sets the screen-space viewport rectangle for a view.
 * @param view_index - View slot
 * @param px - Viewport left (screen pixels)
 * @param py - Viewport top (screen pixels)
 * @param pw - Viewport width (screen pixels)
 * @param ph - Viewport height (screen pixels)
 */
export function view_set_port(view_index: number, px: number, py: number, pw: number, ph: number): void {
    Object.assign(_views[view_index], { port_x: px, port_y: py, port_w: pw, port_h: ph })
}

/**
 * Sets the view rotation angle in degrees.
 * @param view_index - View slot
 * @param angle - Rotation angle (degrees, counter-clockwise)
 */
export function view_set_angle(view_index: number, angle: number): void {
    _views[view_index].angle = angle
}

/**
 * Applies a view to the GL context: sets the GL viewport and uploads
 * a projection matrix that maps room coordinates to clip space.
 *
 * The projection maps the room region [x, x+w] × [y, y+h] into the
 * viewport [port_x, port_x+port_w] × [port_y, port_y+port_h].
 *
 * @param view_index - View slot to apply
 */
export function view_apply(view_index: number): void {
    const v  = _views[view_index]
    const gl = renderer.get_gl()

    // Flush any pending draw calls before changing the projection
    renderer.flush_batch()

    // Set the GL viewport to the screen-space port rectangle
    gl.viewport(v.port_x, v.port_y, v.port_w, v.port_h)

    // Build a projection matrix: maps room [x..x+w, y..y+h] → NDC [-1..1, -1..1]
    // Y axis flipped (Y+ = down in room space)
    const scaleX  =  2 / v.w
    const scaleY  = -2 / v.h
    const transX  = -1 - v.x * scaleX
    const transY  =  1 - v.y * scaleY

    // Column-major 4×4
    const matrix = new Float32Array([
        scaleX,      0,  0, 0,
             0, scaleY,  0, 0,
             0,      0,  1, 0,
        transX, transY,  0, 1,
    ])

    renderer.set_view_projection(matrix)
}

/**
 * Convenience: sets view 0's room-space position and enables it.
 * Equivalent to camera_set_view_pos in GMS.
 * @param x - Camera/view X in room space
 * @param y - Camera/view Y in room space
 */
export function camera_set_view_pos(x: number, y: number): void {
    _views[0].x = x
    _views[0].y = y
    _views[0].enabled = true
}

/**
 * Convenience: sets view 0's room-space size and enables it.
 * @param w - Width in room pixels
 * @param h - Height in room pixels
 */
export function camera_set_view_size(w: number, h: number): void {
    _views[0].w = w
    _views[0].h = h
    _views[0].enabled = true
}

/**
 * Returns the X offset of a given view (for room-to-screen coordinate mapping).
 * @param view_index - View slot (default 0)
 */
export function view_get_x(view_index: number = 0): number {
    return _views[view_index].x
}

/**
 * Returns the Y offset of a given view.
 * @param view_index - View slot (default 0)
 */
export function view_get_y(view_index: number = 0): number {
    return _views[view_index].y
}
