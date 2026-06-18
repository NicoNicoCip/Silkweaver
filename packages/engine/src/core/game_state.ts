/**
 * GMS built-in gameplay globals: `score`, `lives`, and `health`.
 *
 * These are plain numbers with getters/setters (TS can't reassign imported
 * bindings, so GMS's `lives -= 1` becomes `set_lives(get_lives() - 1)`).
 * The game loop watches `lives`/`health` and fires the No More Lives / No More
 * Health events when either transitions from positive to ≤ 0.
 */

let _score  = 0
let _lives  = 3
let _health = 100

// Transition latches so the No More Lives/Health events fire once per drop to ≤ 0.
let _lives_armed  = true
let _health_armed = true

/** Current score. */
export function get_score(): number { return _score }
/** Sets the score. */
export function set_score(value: number): void { _score = value }

/** Current lives. */
export function get_lives(): number { return _lives }
/** Sets lives (≤ 0 triggers the No More Lives event on the next step). */
export function set_lives(value: number): void { _lives = value }

/** Current health. */
export function get_health(): number { return _health }
/** Sets health (≤ 0 triggers the No More Health event on the next step). */
export function set_health(value: number): void { _health = value }

/** Returns true once each time lives drops from positive to ≤ 0 (loop-internal). */
export function _consume_no_more_lives(): boolean {
    if (_lives <= 0 && _lives_armed) { _lives_armed = false; return true }
    if (_lives > 0) _lives_armed = true
    return false
}

/** Returns true once each time health drops from positive to ≤ 0 (loop-internal). */
export function _consume_no_more_health(): boolean {
    if (_health <= 0 && _health_armed) { _health_armed = false; return true }
    if (_health > 0) _health_armed = true
    return false
}

/** Resets all gameplay globals to their defaults (used on game restart). */
export function _reset_game_state(): void {
    _score = 0; _lives = 3; _health = 100
    _lives_armed = true; _health_armed = true
}
