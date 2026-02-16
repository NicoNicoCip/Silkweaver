/**
 * Touch input system — wraps the browser Touch Events API.
 *
 * GMS models touch as numbered "devices" (fingers), mapped to virtual mice.
 * This module follows the same pattern: each active touch point is a device.
 *
 * device_mouse_check_button / device_mouse_x / device_mouse_y mirror GMS's API.
 * Finger 0 is conventionally the primary touch; fingers 1+ are additional points.
 *
 * Call touch_manager.end_step() at the end of each step (done by input_manager).
 */

// Maximum simultaneous touch points tracked
const MAX_TOUCH_POINTS = 11

// =========================================================================
// Per-touch state
// =========================================================================

interface touch_point {
    x:        number   // Canvas-space X position
    y:        number   // Canvas-space Y position
    held:     boolean  // Currently in contact
    pressed:  boolean  // Became active this step
    released: boolean  // Lifted this step
}

function make_touch_point(): touch_point {
    return { x: 0, y: 0, held: false, pressed: false, released: false }
}

// =========================================================================
// Touch manager
// =========================================================================

/**
 * Internal touch state manager.
 * Attach to a canvas element via touch_manager.attach(canvas).
 */
export class touch_manager {
    private static _points: touch_point[] = Array.from({ length: MAX_TOUCH_POINTS }, make_touch_point)
    private static _canvas: HTMLCanvasElement | null = null
    private static _attached: boolean = false

    // Stable bound handler references for add/removeEventListener symmetry
    private static _on_start  = (e: TouchEvent) => { e.preventDefault(); touch_manager._handle_start(e) }
    private static _on_end    = (e: TouchEvent) => { e.preventDefault(); touch_manager._handle_end(e) }
    private static _on_move   = (e: TouchEvent) => { e.preventDefault(); touch_manager._handle_move(e) }
    private static _on_cancel = (e: TouchEvent) => { e.preventDefault(); touch_manager._handle_cancel(e) }

    /**
     * Attaches touch listeners to a canvas element.
     * @param canvas - The canvas receiving touch events
     */
    public static attach(canvas: HTMLCanvasElement): void {
        if (this._attached) return
        this._canvas = canvas
        canvas.addEventListener('touchstart',  this._on_start,  { passive: false })
        canvas.addEventListener('touchend',    this._on_end,    { passive: false })
        canvas.addEventListener('touchmove',   this._on_move,   { passive: false })
        canvas.addEventListener('touchcancel', this._on_cancel, { passive: false })
        this._attached = true
    }

    /**
     * Detaches touch listeners from the canvas.
     */
    public static detach(): void {
        if (!this._attached || !this._canvas) return
        this._canvas.removeEventListener('touchstart',  this._on_start)
        this._canvas.removeEventListener('touchend',    this._on_end)
        this._canvas.removeEventListener('touchmove',   this._on_move)
        this._canvas.removeEventListener('touchcancel', this._on_cancel)
        this._attached = false
        this._canvas = null
    }

    /**
     * Converts a browser Touch to canvas-local coordinates.
     */
    private static _to_canvas(touch: Touch): { x: number; y: number } {
        if (!this._canvas) return { x: touch.clientX, y: touch.clientY }
        const rect = this._canvas.getBoundingClientRect()
        const sx = this._canvas.width  / rect.width
        const sy = this._canvas.height / rect.height
        return {
            x: (touch.clientX - rect.left) * sx,
            y: (touch.clientY - rect.top)  * sy,
        }
    }

    /**
     * Maps a Touch identifier to a stable slot index (0..MAX_TOUCH_POINTS-1).
     * Returns -1 if no slot is available.
     */
    private static _id_to_slot: Map<number, number> = new Map()

    private static _alloc_slot(id: number): number {
        if (this._id_to_slot.has(id)) return this._id_to_slot.get(id)!
        // Find first unused slot
        const used = new Set(this._id_to_slot.values())
        for (let i = 0; i < MAX_TOUCH_POINTS; i++) {
            if (!used.has(i)) {
                this._id_to_slot.set(id, i)
                return i
            }
        }
        return -1
    }

    private static _free_slot(id: number): number {
        const slot = this._id_to_slot.get(id) ?? -1
        this._id_to_slot.delete(id)
        return slot
    }

    private static _handle_start(e: TouchEvent): void {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i]
            const slot = this._alloc_slot(t.identifier)
            if (slot < 0) continue
            const pos = this._to_canvas(t)
            const pt = this._points[slot]
            pt.x = pos.x
            pt.y = pos.y
            pt.held    = true
            pt.pressed = true
            // released stays false until lifted
        }
    }

    private static _handle_end(e: TouchEvent): void {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i]
            const slot = this._free_slot(t.identifier)
            if (slot < 0) continue
            const pos = this._to_canvas(t)
            const pt = this._points[slot]
            pt.x = pos.x
            pt.y = pos.y
            pt.held     = false
            pt.released = true
        }
    }

    private static _handle_move(e: TouchEvent): void {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i]
            const slot = this._id_to_slot.get(t.identifier) ?? -1
            if (slot < 0) continue
            const pos = this._to_canvas(t)
            this._points[slot].x = pos.x
            this._points[slot].y = pos.y
        }
    }

    private static _handle_cancel(e: TouchEvent): void {
        // Treat as release for all cancelled touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i]
            const slot = this._free_slot(t.identifier)
            if (slot < 0) continue
            const pt = this._points[slot]
            pt.held     = false
            pt.released = true
        }
    }

    /**
     * Clears per-step pressed/released flags.
     * Called by input_manager at the end of each step.
     */
    public static end_step(): void {
        for (const pt of this._points) {
            pt.pressed  = false
            pt.released = false
        }
    }

    // -------------------------------------------------------------------------
    // Query API (device = finger slot 0..MAX_TOUCH_POINTS-1)
    // -------------------------------------------------------------------------

    /** Returns true if a touch point is currently active. */
    public static is_held(device: number): boolean {
        return this._points[device]?.held ?? false
    }

    /** Returns true if a touch point became active this step. */
    public static is_pressed(device: number): boolean {
        return this._points[device]?.pressed ?? false
    }

    /** Returns true if a touch point was lifted this step. */
    public static is_released(device: number): boolean {
        return this._points[device]?.released ?? false
    }

    /** Returns the canvas-space X coordinate of a touch device. */
    public static get_x(device: number): number {
        return this._points[device]?.x ?? -1
    }

    /** Returns the canvas-space Y coordinate of a touch device. */
    public static get_y(device: number): number {
        return this._points[device]?.y ?? -1
    }

    /** Returns the number of currently active touch points. */
    public static get_count(): number {
        return this._points.filter(p => p.held).length
    }
}

// =========================================================================
// Public GMS-style device_mouse API
// =========================================================================

/**
 * Returns true if the touch device (finger) is currently active.
 * @param device - Finger slot (0 = primary)
 * @param button - Ignored (always mb_left for touch); kept for API parity
 */
export function device_mouse_check_button(device: number, button: number): boolean {
    return touch_manager.is_held(device)
}

/**
 * Returns true if the touch device became active this step.
 * @param device - Finger slot
 * @param button - Ignored
 */
export function device_mouse_check_button_pressed(device: number, button: number): boolean {
    return touch_manager.is_pressed(device)
}

/**
 * Returns true if the touch device was lifted this step.
 * @param device - Finger slot
 * @param button - Ignored
 */
export function device_mouse_check_button_released(device: number, button: number): boolean {
    return touch_manager.is_released(device)
}

/** Returns the canvas X position of the given touch device. */
export function device_mouse_x(device: number): number {
    return touch_manager.get_x(device)
}

/** Returns the canvas Y position of the given touch device. */
export function device_mouse_y(device: number): number {
    return touch_manager.get_y(device)
}

/** Returns the number of currently active touch points. */
export function device_get_touch_count(): number {
    return touch_manager.get_count()
}
