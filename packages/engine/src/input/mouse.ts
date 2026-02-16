/**
 * Mouse input system.
 *
 * Tracks mouse button state (held/pressed/released), position, and scroll wheel.
 * mouse_x / mouse_y are in room coordinates (accounts for view offset).
 * window_mouse_get_x/y return raw canvas-relative pixel coordinates.
 */

// =========================================================================
// Mouse button constants
// =========================================================================

export const mb_none   = 0  // No button
export const mb_left   = 1  // Left mouse button
export const mb_right  = 2  // Right mouse button
export const mb_middle = 3  // Middle mouse button
export const mb_any    = 4  // Any button

// =========================================================================
// Mouse state manager
// =========================================================================

/**
 * Internal mouse state manager.
 * Attach to the canvas via mouse_manager.attach(canvas).
 */
export class mouse_manager {
    private static _held:     Set<number> = new Set()    // Buttons currently held
    private static _pressed:  Set<number> = new Set()    // Pressed this step
    private static _released: Set<number> = new Set()    // Released this step

    private static _canvas: HTMLCanvasElement | null = null

    /** Mouse X in canvas pixel coordinates. */
    public static window_x: number = 0
    /** Mouse Y in canvas pixel coordinates. */
    public static window_y: number = 0

    /** Mouse X in room space (window_x + view offset). Updated each step. */
    public static mouse_x: number = 0
    /** Mouse Y in room space (window_y + view offset). Updated each step. */
    public static mouse_y: number = 0

    /** Currently held button (0 = none). */
    public static mouse_button: number = mb_none
    /** Last button that was clicked. */
    public static mouse_lastbutton: number = mb_none

    /** True if the scroll wheel moved up this step. */
    private static _wheel_up:   boolean = false
    /** True if the scroll wheel moved down this step. */
    private static _wheel_down: boolean = false

    private static _attached: boolean = false
    private static _on_mousedown  = (e: MouseEvent) => mouse_manager._handle_down(e)
    private static _on_mouseup    = (e: MouseEvent) => mouse_manager._handle_up(e)
    private static _on_mousemove  = (e: MouseEvent) => mouse_manager._handle_move(e)
    private static _on_wheel      = (e: WheelEvent) => mouse_manager._handle_wheel(e)
    private static _on_contextmenu = (e: Event)     => e.preventDefault()

    /**
     * Attaches mouse listeners to a canvas element.
     * @param canvas - The game canvas
     */
    public static attach(canvas: HTMLCanvasElement): void {
        if (this._attached) return
        this._canvas = canvas
        canvas.addEventListener('mousedown',   this._on_mousedown)
        canvas.addEventListener('mouseup',     this._on_mouseup)
        canvas.addEventListener('mousemove',   this._on_mousemove)
        canvas.addEventListener('wheel',       this._on_wheel, { passive: true })
        canvas.addEventListener('contextmenu', this._on_contextmenu)
        this._attached = true
    }

    /**
     * Detaches mouse listeners from the canvas.
     */
    public static detach(): void {
        if (!this._attached || !this._canvas) return
        this._canvas.removeEventListener('mousedown',   this._on_mousedown)
        this._canvas.removeEventListener('mouseup',     this._on_mouseup)
        this._canvas.removeEventListener('mousemove',   this._on_mousemove)
        this._canvas.removeEventListener('wheel',       this._on_wheel)
        this._canvas.removeEventListener('contextmenu', this._on_contextmenu)
        this._attached = false
        this._canvas = null
    }

    private static _get_button(e: MouseEvent): number {
        switch (e.button) {
            case 0: return mb_left
            case 1: return mb_middle
            case 2: return mb_right
            default: return mb_none
        }
    }

    private static _handle_down(e: MouseEvent): void {
        const btn = this._get_button(e)
        if (btn === mb_none) return
        if (!this._held.has(btn)) this._pressed.add(btn)
        this._held.add(btn)
        this.mouse_lastbutton = this.mouse_button
        this.mouse_button = btn
        this._update_position(e)
    }

    private static _handle_up(e: MouseEvent): void {
        const btn = this._get_button(e)
        if (btn === mb_none) return
        this._held.delete(btn)
        this._released.add(btn)
        if (this._held.size === 0) this.mouse_button = mb_none
        this._update_position(e)
    }

    private static _handle_move(e: MouseEvent): void {
        this._update_position(e)
    }

    private static _handle_wheel(e: WheelEvent): void {
        if (e.deltaY < 0) this._wheel_up   = true
        else              this._wheel_down  = true
    }

    private static _update_position(e: MouseEvent): void {
        if (!this._canvas) return
        const rect = this._canvas.getBoundingClientRect()
        const scaleX = this._canvas.width  / rect.width
        const scaleY = this._canvas.height / rect.height
        this.window_x = (e.clientX - rect.left) * scaleX
        this.window_y = (e.clientY - rect.top)  * scaleY
    }

    /**
     * Updates room-space mouse coordinates using the current view offset.
     * Called once per step by the game loop before keyboard/mouse events fire.
     * @param view_x - Current view X offset in the room
     * @param view_y - Current view Y offset in the room
     */
    public static update_room_position(view_x: number, view_y: number): void {
        this.mouse_x = this.window_x + view_x
        this.mouse_y = this.window_y + view_y
    }

    /** Clears pressed/released state and wheel flags at the end of each step. */
    public static end_step(): void {
        this._pressed.clear()
        this._released.clear()
        this._wheel_up   = false
        this._wheel_down = false
    }

    /** Returns true if button is held. */
    public static check(btn: number): boolean {
        if (btn === mb_any)  return this._held.size > 0
        if (btn === mb_none) return this._held.size === 0
        return this._held.has(btn)
    }

    /** Returns true if button was pressed this step. */
    public static check_pressed(btn: number): boolean {
        if (btn === mb_any)  return this._pressed.size > 0
        if (btn === mb_none) return false
        return this._pressed.has(btn)
    }

    /** Returns true if button was released this step. */
    public static check_released(btn: number): boolean {
        if (btn === mb_any)  return this._released.size > 0
        if (btn === mb_none) return false
        return this._released.has(btn)
    }

    /** Clears state for a specific button. */
    public static clear(btn: number): void {
        this._held.delete(btn)
        this._pressed.delete(btn)
        this._released.delete(btn)
    }

    /** Returns true if the wheel scrolled up this step. */
    public static wheel_up(): boolean   { return this._wheel_up }
    /** Returns true if the wheel scrolled down this step. */
    public static wheel_down(): boolean { return this._wheel_down }
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/** Returns true if mouse button is currently held. */
export function mouse_check_button(button: number): boolean {
    return mouse_manager.check(button)
}

/** Returns true if mouse button was pressed this step. */
export function mouse_check_button_pressed(button: number): boolean {
    return mouse_manager.check_pressed(button)
}

/** Returns true if mouse button was released this step. */
export function mouse_check_button_released(button: number): boolean {
    return mouse_manager.check_released(button)
}

/** Clears state for a mouse button. */
export function mouse_clear(button: number): void {
    mouse_manager.clear(button)
}

/** Returns true if the scroll wheel moved up this step. */
export function mouse_wheel_up(): boolean {
    return mouse_manager.wheel_up()
}

/** Returns true if the scroll wheel moved down this step. */
export function mouse_wheel_down(): boolean {
    return mouse_manager.wheel_down()
}

/** Returns mouse X position in window (canvas-relative pixels). */
export function window_mouse_get_x(): number {
    return mouse_manager.window_x
}

/** Returns mouse Y position in window (canvas-relative pixels). */
export function window_mouse_get_y(): number {
    return mouse_manager.window_y
}

/**
 * Moves the OS cursor to the given canvas-relative position.
 * Note: browsers do not support arbitrary cursor warping.
 * This is a no-op stub for GMS API compatibility.
 */
export function window_mouse_set(_x: number, _y: number): void {
    // Browser security restrictions prevent arbitrary cursor positioning.
}
