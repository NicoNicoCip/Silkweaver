/**
 * Keyboard input system.
 *
 * Tracks key state across three categories:
 *   - held:     key is currently down
 *   - pressed:  key went down THIS step (cleared after one step)
 *   - released: key went up THIS step (cleared after one step)
 *
 * Call keyboard_manager.poll() once per step (done by the game loop).
 * Call keyboard_manager.end_step() after events fire to clear pressed/released.
 */

// =========================================================================
// Key constants (browser KeyboardEvent.keyCode values)
// =========================================================================

export const vk_nokey       = 0
export const vk_anykey      = 1
export const vk_backspace   = 8
export const vk_tab         = 9
export const vk_enter       = 13
export const vk_shift       = 16
export const vk_control     = 17
export const vk_alt         = 18
export const vk_pause       = 19
export const vk_escape      = 27
export const vk_space       = 32
export const vk_pageup      = 33
export const vk_pagedown    = 34
export const vk_end         = 35
export const vk_home        = 36
export const vk_left        = 37
export const vk_up          = 38
export const vk_right       = 39
export const vk_down        = 40
export const vk_insert      = 45
export const vk_delete      = 46
export const vk_f1          = 112
export const vk_f2          = 113
export const vk_f3          = 114
export const vk_f4          = 115
export const vk_f5          = 116
export const vk_f6          = 117
export const vk_f7          = 118
export const vk_f8          = 119
export const vk_f9          = 120
export const vk_f10         = 121
export const vk_f11         = 122
export const vk_f12         = 123
export const vk_numpad0     = 96
export const vk_numpad1     = 97
export const vk_numpad2     = 98
export const vk_numpad3     = 99
export const vk_numpad4     = 100
export const vk_numpad5     = 101
export const vk_numpad6     = 102
export const vk_numpad7     = 103
export const vk_numpad8     = 104
export const vk_numpad9     = 105
export const vk_multiply    = 106
export const vk_add         = 107
export const vk_subtract    = 109
export const vk_decimal     = 110
export const vk_divide      = 111
export const vk_printscreen = 44

// =========================================================================
// Keyboard state manager
// =========================================================================

/**
 * Internal keyboard state manager.
 * Attach to window events via keyboard_manager.attach().
 */
export class keyboard_manager {
    private static _held:     Set<number> = new Set()   // Keys currently held down
    private static _pressed:  Set<number> = new Set()   // Keys pressed this step
    private static _released: Set<number> = new Set()   // Keys released this step

    private static _key_map:  Map<number, number> = new Map()  // Remapped key codes

    /** Last key code that was pressed. */
    public static keyboard_key: number = vk_nokey
    /** Previous key code (key before the last). */
    public static keyboard_lastkey: number = vk_nokey
    /** Last character typed (from keypress events). */
    public static keyboard_lastchar: string = ''
    /** Accumulated typed string (cleared by the game or manually). */
    public static keyboard_string: string = ''

    private static _attached: boolean = false
    private static _on_keydown = (e: KeyboardEvent) => keyboard_manager._handle_down(e)
    private static _on_keyup   = (e: KeyboardEvent) => keyboard_manager._handle_up(e)
    private static _on_keypress = (e: KeyboardEvent) => keyboard_manager._handle_press(e)

    /**
     * Attaches keyboard listeners to the window.
     * Called once by input_manager.init().
     */
    public static attach(): void {
        if (this._attached) return
        window.addEventListener('keydown',  this._on_keydown)
        window.addEventListener('keyup',    this._on_keyup)
        window.addEventListener('keypress', this._on_keypress)
        this._attached = true
    }

    /**
     * Detaches keyboard listeners from the window.
     */
    public static detach(): void {
        if (!this._attached) return
        window.removeEventListener('keydown',  this._on_keydown)
        window.removeEventListener('keyup',    this._on_keyup)
        window.removeEventListener('keypress', this._on_keypress)
        this._attached = false
    }

    private static _handle_down(e: KeyboardEvent): void {
        const code = this._map(e.keyCode)
        if (!this._held.has(code)) {
            this._pressed.add(code)
            this.keyboard_lastkey = this.keyboard_key
            this.keyboard_key = code
        }
        this._held.add(code)
    }

    private static _handle_up(e: KeyboardEvent): void {
        const code = this._map(e.keyCode)
        this._held.delete(code)
        this._released.add(code)
    }

    private static _handle_press(e: KeyboardEvent): void {
        if (e.key.length === 1) {
            this.keyboard_lastchar = e.key
            this.keyboard_string += e.key
        }
    }

    private static _map(code: number): number {
        return this._key_map.get(code) ?? code
    }

    /**
     * Clears the pressed and released sets at the end of each step.
     * Called by the game loop after all events have fired.
     */
    public static end_step(): void {
        this._pressed.clear()
        this._released.clear()
    }

    /** Returns true if the key is currently held down. */
    public static check(key: number): boolean {
        if (key === vk_anykey) return this._held.size > 0
        if (key === vk_nokey)  return this._held.size === 0
        return this._held.has(key)
    }

    /** Returns true if the key was pressed this step. */
    public static check_pressed(key: number): boolean {
        if (key === vk_anykey) return this._pressed.size > 0
        if (key === vk_nokey)  return false
        return this._pressed.has(key)
    }

    /** Returns true if the key was released this step. */
    public static check_released(key: number): boolean {
        if (key === vk_anykey) return this._released.size > 0
        if (key === vk_nokey)  return false
        return this._released.has(key)
    }

    /** Clears the held/pressed/released state for a specific key. */
    public static clear(key: number): void {
        this._held.delete(key)
        this._pressed.delete(key)
        this._released.delete(key)
    }

    /** Simulates pressing a key. */
    public static key_press(key: number): void {
        if (!this._held.has(key)) this._pressed.add(key)
        this._held.add(key)
        this.keyboard_lastkey = this.keyboard_key
        this.keyboard_key = key
    }

    /** Simulates releasing a key. */
    public static key_release(key: number): void {
        this._held.delete(key)
        this._released.add(key)
    }

    /** Remaps key1 to behave as key2. */
    public static set_map(key1: number, key2: number): void {
        this._key_map.set(key1, key2)
    }

    /** Returns the mapped key code for a given input code. */
    public static get_map(key: number): number {
        return this._key_map.get(key) ?? key
    }

    /** Clears all key remappings. */
    public static unset_map(): void {
        this._key_map.clear()
    }
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/** Returns true if key is currently held down. */
export function keyboard_check(key: number): boolean {
    return keyboard_manager.check(key)
}

/** Returns true if key was just pressed this step. */
export function keyboard_check_pressed(key: number): boolean {
    return keyboard_manager.check_pressed(key)
}

/** Returns true if key was just released this step. */
export function keyboard_check_released(key: number): boolean {
    return keyboard_manager.check_released(key)
}

/** Direct key state check — same as keyboard_check() in this implementation. */
export function keyboard_check_direct(key: number): boolean {
    return keyboard_manager.check(key)
}

/** Clears the held/pressed/released state for a key. */
export function keyboard_clear(key: number): void {
    keyboard_manager.clear(key)
}

/** Simulates pressing a key. */
export function keyboard_key_press(key: number): void {
    keyboard_manager.key_press(key)
}

/** Simulates releasing a key. */
export function keyboard_key_release(key: number): void {
    keyboard_manager.key_release(key)
}

/** Remaps key1 to act as key2. */
export function keyboard_set_map(key1: number, key2: number): void {
    keyboard_manager.set_map(key1, key2)
}

/** Returns the current mapping for key. */
export function keyboard_get_map(key: number): number {
    return keyboard_manager.get_map(key)
}

/** Clears all key remappings. */
export function keyboard_unset_map(): void {
    keyboard_manager.unset_map()
}
