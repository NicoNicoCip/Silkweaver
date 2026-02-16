/**
 * Gamepad input system — wraps the Web Gamepad API.
 *
 * The Gamepad API is polled (not event-driven); gamepad_manager.poll()
 * must be called each step to refresh state.
 *
 * Button indices follow the standard gamepad layout (Xbox/PlayStation mapping).
 */

// =========================================================================
// Gamepad button constants
// =========================================================================

export const gp_face1     = 0   // A / Cross
export const gp_face2     = 1   // B / Circle
export const gp_face3     = 2   // X / Square
export const gp_face4     = 3   // Y / Triangle
export const gp_shoulderl = 4   // Left bumper (LB / L1)
export const gp_shoulderr = 5   // Right bumper (RB / R1)
export const gp_shoulderlb = 6  // Left trigger (LT / L2) — analog, also digital at threshold
export const gp_shoulderrb = 7  // Right trigger (RT / R2)
export const gp_select    = 8   // Select / Back / View
export const gp_start     = 9   // Start / Menu
export const gp_stickl    = 10  // Left stick click
export const gp_stickr    = 11  // Right stick click
export const gp_padu      = 12  // D-pad up
export const gp_padd      = 13  // D-pad down
export const gp_padl      = 14  // D-pad left
export const gp_padr      = 15  // D-pad right

export const gp_axislh    = 0   // Left stick horizontal axis
export const gp_axislv    = 1   // Left stick vertical axis
export const gp_axisrh    = 2   // Right stick horizontal axis
export const gp_axisrv    = 3   // Right stick vertical axis

/** Analog threshold for treating trigger/axis as a digital button press. */
const BUTTON_THRESHOLD = 0.5

// =========================================================================
// Per-device state snapshot
// =========================================================================

interface gamepad_state {
    buttons_held:     boolean[]  // Buttons held this step
    buttons_prev:     boolean[]  // Buttons held last step (for pressed/released)
    axes:             number[]   // Analog axis values (-1 to 1)
    connected:        boolean
    id:               string
}

// =========================================================================
// Gamepad manager
// =========================================================================

export class gamepad_manager {
    private static _states: Map<number, gamepad_state> = new Map()

    /**
     * Polls the Gamepad API and refreshes all state snapshots.
     * Must be called every step before gamepad functions are queried.
     */
    public static poll(): void {
        if (!navigator.getGamepads) return
        const pads = navigator.getGamepads()

        for (let i = 0; i < pads.length; i++) {
            const pad = pads[i]
            const prev = this._states.get(i)

            if (!pad) {
                // Gamepad disconnected
                if (prev) prev.connected = false
                continue
            }

            const buttons_held = pad.buttons.map(b => b.pressed || b.value > BUTTON_THRESHOLD)
            const axes = Array.from(pad.axes)

            if (!prev) {
                this._states.set(i, {
                    buttons_held,
                    buttons_prev: new Array(buttons_held.length).fill(false),
                    axes,
                    connected: true,
                    id: pad.id,
                })
            } else {
                prev.buttons_prev = prev.buttons_held
                prev.buttons_held = buttons_held
                prev.axes = axes
                prev.connected = true
                prev.id = pad.id
            }
        }
    }

    /** Returns true if the Gamepad API is supported by the browser. */
    public static is_supported(): boolean {
        return typeof navigator.getGamepads === 'function'
    }

    /** Returns true if device index `device` is connected. */
    public static is_connected(device: number): boolean {
        return this._states.get(device)?.connected ?? false
    }

    /** Returns the number of connected gamepad slots (may include gaps). */
    public static get_device_count(): number {
        return this._states.size
    }

    /** Returns the device description string (controller name). */
    public static get_description(device: number): string {
        return this._states.get(device)?.id ?? ''
    }

    /** Returns the number of axes on device. */
    public static axis_count(device: number): number {
        return this._states.get(device)?.axes.length ?? 0
    }

    /**
     * Returns the current value of an axis (-1 to 1, dead zone not applied).
     * @param device - Gamepad index
     * @param axis - Axis index (use gp_axis* constants)
     */
    public static axis_value(device: number, axis: number): number {
        const state = this._states.get(device)
        if (!state?.connected) return 0
        return state.axes[axis] ?? 0
    }

    /** Returns the number of buttons on device. */
    public static button_count(device: number): number {
        return this._states.get(device)?.buttons_held.length ?? 0
    }

    /** Returns true if button is currently held. */
    public static button_check(device: number, button: number): boolean {
        const state = this._states.get(device)
        if (!state?.connected) return false
        return state.buttons_held[button] ?? false
    }

    /** Returns true if button was pressed this step (was up last step, down now). */
    public static button_check_pressed(device: number, button: number): boolean {
        const state = this._states.get(device)
        if (!state?.connected) return false
        return (state.buttons_held[button] ?? false) && !(state.buttons_prev[button] ?? false)
    }

    /** Returns true if button was released this step. */
    public static button_check_released(device: number, button: number): boolean {
        const state = this._states.get(device)
        if (!state?.connected) return false
        return !(state.buttons_held[button] ?? false) && (state.buttons_prev[button] ?? false)
    }

    /**
     * Returns the analog button value (0 to 1) for triggers or 0/1 for digital buttons.
     * @param device - Gamepad index
     * @param button - Button index
     */
    public static button_value(device: number, button: number): number {
        if (!navigator.getGamepads) return 0
        const pad = navigator.getGamepads()[device]
        if (!pad) return 0
        return pad.buttons[button]?.value ?? 0
    }

    /**
     * Sets controller vibration (rumble).
     * @param device - Gamepad index
     * @param left - Left motor strength (0–1)
     * @param right - Right motor strength (0–1)
     */
    public static set_vibration(device: number, left: number, right: number): void {
        if (!navigator.getGamepads) return
        const pad = navigator.getGamepads()[device] as any
        if (!pad) return
        if (typeof pad.vibrationActuator?.playEffect === 'function') {
            pad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: 100,
                weakMagnitude: right,
                strongMagnitude: left,
            })
        }
    }
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/** Returns true if the Gamepad API is supported. */
export function gamepad_is_supported(): boolean {
    return gamepad_manager.is_supported()
}

/** Returns true if device index is connected. */
export function gamepad_is_connected(device: number): boolean {
    return gamepad_manager.is_connected(device)
}

/** Returns the number of detected gamepad slots. */
export function gamepad_get_device_count(): number {
    return gamepad_manager.get_device_count()
}

/** Returns the description string of a gamepad. */
export function gamepad_get_description(device: number): string {
    return gamepad_manager.get_description(device)
}

/** Returns the number of axes on a gamepad. */
export function gamepad_axis_count(device: number): number {
    return gamepad_manager.axis_count(device)
}

/** Returns the current axis value (-1 to 1). */
export function gamepad_axis_value(device: number, axis: number): number {
    return gamepad_manager.axis_value(device, axis)
}

/** Returns the number of buttons on a gamepad. */
export function gamepad_button_count(device: number): number {
    return gamepad_manager.button_count(device)
}

/** Returns true if the button is held this step. */
export function gamepad_button_check(device: number, button: number): boolean {
    return gamepad_manager.button_check(device, button)
}

/** Returns true if the button was pressed this step. */
export function gamepad_button_check_pressed(device: number, button: number): boolean {
    return gamepad_manager.button_check_pressed(device, button)
}

/** Returns true if the button was released this step. */
export function gamepad_button_check_released(device: number, button: number): boolean {
    return gamepad_manager.button_check_released(device, button)
}

/** Returns the analog button value (0–1). */
export function gamepad_button_value(device: number, button: number): number {
    return gamepad_manager.button_value(device, button)
}

/** Sets gamepad vibration. */
export function gamepad_set_vibration(device: number, left: number, right: number): void {
    gamepad_manager.set_vibration(device, left, right)
}
