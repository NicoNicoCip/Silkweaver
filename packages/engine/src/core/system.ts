/**
 * System / game globals — frame timing, the high-resolution timer, and blocking dialogs.
 *
 * GMS exposes some of these as read-only variables (`fps`, `delta_time`); Silkweaver exposes
 * them as functions to fit its function-based API. The dialog functions use the host's native
 * prompts (browser `alert`/`confirm`/`prompt`) and degrade to the console on headless hosts.
 */

import { game_loop } from './game_loop.js'

const _now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())
const _start = _now()

// =========================================================================
// Frame timing
// =========================================================================

/** Frames per second the game is actually drawing, measured over the last second. */
export function fps(): number {
    return game_loop.fps
}

/** Frames per second the machine could draw uncapped (instantaneous, from the last frame). */
export function fps_real(): number {
    return game_loop.fps_real
}

/** Microseconds that elapsed during the previous frame (GMS `delta_time`). */
export function delta_time(): number {
    return game_loop.delta_time_us
}

/** Microseconds since the game started — a monotonic high-resolution timer (GMS `get_timer`). */
export function get_timer(): number {
    return Math.floor((_now() - _start) * 1000)
}

/** Milliseconds since the game started (monotonic). */
export function current_time(): number {
    return Math.floor(_now() - _start)
}

// =========================================================================
// Dialogs / debug output
// =========================================================================

/** Writes a line to the debug console. */
export function show_debug_message(message: unknown): void {
    console.log(typeof message === 'string' ? message : String(message))
}

/** Sets the application/window title (browser: `document.title`). */
export function set_application_title(title: string): void {
    if (typeof document !== 'undefined') document.title = title
}

/** Shows a blocking message dialog (browser `alert`; logs on headless hosts). */
export function show_message(message: unknown): void {
    const s = String(message)
    if (typeof window !== 'undefined' && typeof window.alert === 'function') window.alert(s)
    else console.log('[show_message]', s)
}

/** Shows a blocking yes/no dialog; returns true for "yes" (browser `confirm`). */
export function show_question(message: unknown): boolean {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') return window.confirm(String(message))
    return false
}

/**
 * Prompts for a string with a default value (browser `prompt`).
 * @param message - The prompt text
 * @param default_value - Returned if the user cancels or the host is headless
 */
export function get_string(message: unknown, default_value: string = ''): string {
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
        return window.prompt(String(message), default_value) ?? default_value
    }
    return default_value
}

/**
 * Prompts for a number with a default value; non-numeric or cancelled input returns the default.
 * @param message - The prompt text
 * @param default_value - Returned if the user cancels, the input isn't a number, or the host is headless
 */
export function get_integer(message: unknown, default_value: number = 0): number {
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
        const r = window.prompt(String(message), String(default_value))
        if (r === null) return default_value
        const n = parseFloat(r)
        return Number.isNaN(n) ? default_value : n
    }
    return default_value
}
