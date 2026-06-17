/**
 * Combined input helpers (GMS `io_*`).
 */

import { keyboard_manager } from './keyboard.js'
import { mouse_manager } from './mouse.js'

/** Clears all keyboard and mouse input state (held, pressed, released, wheel). */
export function io_clear(): void {
    keyboard_manager.clear_all()
    mouse_manager.clear_all()
}
