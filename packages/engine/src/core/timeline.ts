/**
 * Timeline system — execute callbacks at specific step moments.
 *
 * Mirrors the GMS timeline API:
 *   timeline_create, timeline_delete, timeline_moment_add,
 *   timeline_moment_clear, timeline_exists, timeline_get_moment_count
 *
 * A timeline is advanced manually by calling timeline_step().
 * Each registered moment fires its callback when the playhead reaches
 * or passes that step number.
 *
 * GMS timelines are attached to instances; here they are standalone
 * objects that you advance explicitly, which is simpler and more flexible.
 */

// =========================================================================
// Timeline internals
// =========================================================================

interface timeline_moment {
    step: number        // Step index at which to fire
    cb:   () => void    // Callback to execute
}

interface timeline_def {
    moments:  timeline_moment[]  // Sorted by step ascending
    pos:      number             // Current playhead position (fractional steps)
    speed:    number             // Steps advanced per timeline_step() call
    loop:     boolean            // Restart when playhead reaches the end
    playing:  boolean            // Whether the timeline is running
    end_step: number             // The highest step number, or 0
}

const _timelines: Map<number, timeline_def> = new Map()
let _next_timeline_id = 1

function _compute_end(tl: timeline_def): number {
    return tl.moments.length > 0 ? tl.moments[tl.moments.length - 1].step : 0
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty timeline.
 * @returns Timeline ID
 */
export function timeline_create(): number {
    const id = _next_timeline_id++
    _timelines.set(id, { moments: [], pos: 0, speed: 1, loop: false, playing: false, end_step: 0 })
    return id
}

/**
 * Destroys a timeline.
 * @param timeline_id - Timeline ID
 */
export function timeline_delete(timeline_id: number): void {
    _timelines.delete(timeline_id)
}

/**
 * Returns true if the timeline ID is valid.
 * @param timeline_id - Timeline ID
 */
export function timeline_exists(timeline_id: number): boolean {
    return _timelines.has(timeline_id)
}

/**
 * Adds a callback to fire at a specific step moment.
 * Multiple callbacks can share the same step — they fire in insertion order.
 * @param timeline_id - Timeline ID
 * @param step - Step index
 * @param cb - Callback to execute at that step
 */
export function timeline_moment_add(timeline_id: number, step: number, cb: () => void): void {
    const tl = _timelines.get(timeline_id)
    if (!tl) return
    tl.moments.push({ step, cb })
    tl.moments.sort((a, b) => a.step - b.step)
    tl.end_step = _compute_end(tl)
}

/**
 * Removes all callbacks registered at a specific step.
 * @param timeline_id - Timeline ID
 * @param step - Step index to clear
 */
export function timeline_moment_clear(timeline_id: number, step: number): void {
    const tl = _timelines.get(timeline_id)
    if (!tl) return
    tl.moments = tl.moments.filter(m => m.step !== step)
    tl.end_step = _compute_end(tl)
}

/**
 * Returns the number of moments registered on a timeline.
 * @param timeline_id - Timeline ID
 */
export function timeline_get_moment_count(timeline_id: number): number {
    return _timelines.get(timeline_id)?.moments.length ?? 0
}

/**
 * Sets the playback speed (steps advanced per timeline_step call).
 * @param timeline_id - Timeline ID
 * @param speed - Steps per advance (default 1)
 */
export function timeline_set_speed(timeline_id: number, speed: number): void {
    const tl = _timelines.get(timeline_id)
    if (tl) tl.speed = speed
}

/**
 * Sets whether the timeline loops when it reaches the end.
 * @param timeline_id - Timeline ID
 * @param loop - True to loop
 */
export function timeline_set_loop(timeline_id: number, loop: boolean): void {
    const tl = _timelines.get(timeline_id)
    if (tl) tl.loop = loop
}

/**
 * Starts or resumes playback.
 * @param timeline_id - Timeline ID
 */
export function timeline_play(timeline_id: number): void {
    const tl = _timelines.get(timeline_id)
    if (tl) tl.playing = true
}

/**
 * Pauses playback without resetting the position.
 * @param timeline_id - Timeline ID
 */
export function timeline_pause(timeline_id: number): void {
    const tl = _timelines.get(timeline_id)
    if (tl) tl.playing = false
}

/**
 * Stops playback and resets the playhead to position 0.
 * @param timeline_id - Timeline ID
 */
export function timeline_stop(timeline_id: number): void {
    const tl = _timelines.get(timeline_id)
    if (!tl) return
    tl.playing = false
    tl.pos     = 0
}

/**
 * Jumps the playhead to a specific step position.
 * @param timeline_id - Timeline ID
 * @param pos - Step position
 */
export function timeline_set_position(timeline_id: number, pos: number): void {
    const tl = _timelines.get(timeline_id)
    if (tl) tl.pos = pos
}

/**
 * Returns the current playhead position.
 * @param timeline_id - Timeline ID
 */
export function timeline_get_position(timeline_id: number): number {
    return _timelines.get(timeline_id)?.pos ?? 0
}

/**
 * Advances a timeline by its speed and fires any moments crossed.
 * Call this once per game step for each active timeline.
 * @param timeline_id - Timeline ID
 * @returns True if the timeline is still playing, false if it has finished (and is not looping)
 */
export function timeline_step(timeline_id: number): boolean {
    const tl = _timelines.get(timeline_id)
    if (!tl || !tl.playing || tl.moments.length === 0) return false

    const prev_pos = tl.pos
    const new_pos  = tl.pos + tl.speed

    // Fire all moments whose step falls in (prev_pos, new_pos]
    for (const m of tl.moments) {
        if (m.step > prev_pos && m.step <= new_pos) {
            m.cb()
        }
    }

    tl.pos = new_pos

    // Check if we reached or passed the end
    if (tl.pos >= tl.end_step) {
        if (tl.loop) {
            tl.pos = tl.pos % (tl.end_step || 1)
        } else {
            tl.pos     = tl.end_step
            tl.playing = false
            return false
        }
    }

    return true
}

/**
 * Advances all playing timelines by one step.
 * Convenience function — call once per game step to update all timelines.
 */
export function timeline_step_all(): void {
    for (const id of _timelines.keys()) {
        timeline_step(id)
    }
}
