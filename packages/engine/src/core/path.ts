/**
 * Path system — smooth curves through a series of points.
 *
 * Mirrors the GMS path API:
 *   path_create, path_delete, path_add_point, path_get_x, path_get_y,
 *   path_get_speed, path_get_length, path_get_number,
 *   path_set_closed, path_set_kind, path_flip, path_mirror,
 *   path_exists, path_clear_points
 *
 * Two kinds of path:
 *   path_kind_linear  (0) — straight line segments between points
 *   path_kind_smooth  (1) — Catmull-Rom spline through points
 *
 * Position is queried via a normalised parameter t ∈ [0, 1].
 */

// =========================================================================
// Path constants
// =========================================================================

export const path_kind_linear = 0  // Straight lines between control points
export const path_kind_smooth = 1  // Catmull-Rom spline

// =========================================================================
// Path internals
// =========================================================================

interface path_point {
    x:     number
    y:     number
    speed: number  // Speed factor at this point (1 = normal)
}

interface path_def {
    points:   path_point[]
    closed:   boolean        // True = last point connects back to first
    kind:     number         // path_kind_linear | path_kind_smooth
    precision: number        // Spline subdivision steps (smooth paths only)
}

const _paths: Map<number, path_def> = new Map()
let _next_path_id = 1

function _make_path(): path_def {
    return { points: [], closed: false, kind: path_kind_linear, precision: 8 }
}

// =========================================================================
// Catmull-Rom interpolation helpers
// =========================================================================

/** Catmull-Rom interpolation between p1 and p2 given flanking points p0, p3. */
function _catmull_rom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t
    const t3 = t2 * t
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    )
}

/**
 * Evaluates the path position at normalised parameter t ∈ [0, 1].
 * Returns {x, y, speed} interpolated along the path.
 */
function _eval_path(path: path_def, t: number): { x: number; y: number; speed: number } {
    const pts = path.points
    const n   = pts.length

    if (n === 0) return { x: 0, y: 0, speed: 1 }
    if (n === 1) return { x: pts[0].x, y: pts[0].y, speed: pts[0].speed }

    // Clamp or wrap t
    if (path.closed) {
        t = ((t % 1) + 1) % 1  // wrap into [0, 1)
    } else {
        t = Math.max(0, Math.min(1, t))
    }

    const seg_count = path.closed ? n : n - 1
    const seg_t     = t * seg_count
    const seg_i     = Math.min(Math.floor(seg_t), seg_count - 1)
    const local_t   = seg_t - seg_i

    if (path.kind === path_kind_linear) {
        const a = pts[seg_i]
        const b = pts[(seg_i + 1) % n]
        return {
            x:     a.x     + (b.x     - a.x)     * local_t,
            y:     a.y     + (b.y     - a.y)      * local_t,
            speed: a.speed + (b.speed - a.speed)  * local_t,
        }
    }

    // Smooth (Catmull-Rom): get 4 control points, wrapping if closed
    const wrap = (i: number) => ((i % n) + n) % n
    const p0 = pts[path.closed ? wrap(seg_i - 1) : Math.max(seg_i - 1, 0)]
    const p1 = pts[seg_i]
    const p2 = pts[(seg_i + 1) % n]
    const p3 = pts[path.closed ? wrap(seg_i + 2) : Math.min(seg_i + 2, n - 1)]

    return {
        x:     _catmull_rom(p0.x,     p1.x,     p2.x,     p3.x,     local_t),
        y:     _catmull_rom(p0.y,     p1.y,     p2.y,     p3.y,     local_t),
        speed: _catmull_rom(p0.speed, p1.speed, p2.speed, p3.speed, local_t),
    }
}

/**
 * Approximates the total arc length of a path by summing chord lengths.
 */
function _compute_length(path: path_def): number {
    const steps = path.points.length * path.precision
    if (steps < 2) return 0
    let len = 0
    let prev = _eval_path(path, 0)
    for (let i = 1; i <= steps; i++) {
        const curr = _eval_path(path, i / steps)
        const dx   = curr.x - prev.x
        const dy   = curr.y - prev.y
        len += Math.sqrt(dx * dx + dy * dy)
        prev = curr
    }
    return len
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty path.
 * @returns Path ID
 */
export function path_create(): number {
    const id = _next_path_id++
    _paths.set(id, _make_path())
    return id
}

/**
 * Destroys a path.
 * @param path_id - Path ID
 */
export function path_delete(path_id: number): void {
    _paths.delete(path_id)
}

/**
 * Returns true if the path ID is valid.
 * @param path_id - Path ID
 */
export function path_exists(path_id: number): boolean {
    return _paths.has(path_id)
}

/**
 * Adds a control point to a path.
 * @param path_id - Path ID
 * @param x - Point X
 * @param y - Point Y
 * @param speed - Speed factor at this point (default 1)
 */
export function path_add_point(path_id: number, x: number, y: number, speed: number = 1): void {
    _paths.get(path_id)?.points.push({ x, y, speed })
}

/**
 * Removes all control points from a path.
 * @param path_id - Path ID
 */
export function path_clear_points(path_id: number): void {
    const p = _paths.get(path_id)
    if (p) p.points = []
}

/**
 * Returns the number of control points on a path.
 * @param path_id - Path ID
 */
export function path_get_number(path_id: number): number {
    return _paths.get(path_id)?.points.length ?? 0
}

/**
 * Returns the X position on a path at normalised position t (0–1).
 * @param path_id - Path ID
 * @param t - Position along path (0 = start, 1 = end)
 */
export function path_get_x(path_id: number, t: number): number {
    const p = _paths.get(path_id)
    return p ? _eval_path(p, t).x : 0
}

/**
 * Returns the Y position on a path at normalised position t (0–1).
 * @param path_id - Path ID
 * @param t - Position along path
 */
export function path_get_y(path_id: number, t: number): number {
    const p = _paths.get(path_id)
    return p ? _eval_path(p, t).y : 0
}

/**
 * Returns the speed factor on a path at normalised position t.
 * @param path_id - Path ID
 * @param t - Position along path
 */
export function path_get_speed(path_id: number, t: number): number {
    const p = _paths.get(path_id)
    return p ? _eval_path(p, t).speed : 1
}

/**
 * Returns the approximate total length of a path in pixels.
 * @param path_id - Path ID
 */
export function path_get_length(path_id: number): number {
    const p = _paths.get(path_id)
    return p ? _compute_length(p) : 0
}

/**
 * Returns the X coordinate of the nth control point (0-based).
 * @param path_id - Path ID
 * @param n - Point index
 */
export function path_get_point_x(path_id: number, n: number): number {
    return _paths.get(path_id)?.points[n]?.x ?? 0
}

/**
 * Returns the Y coordinate of the nth control point (0-based).
 * @param path_id - Path ID
 * @param n - Point index
 */
export function path_get_point_y(path_id: number, n: number): number {
    return _paths.get(path_id)?.points[n]?.y ?? 0
}

/**
 * Returns the speed of the nth control point (0-based).
 * @param path_id - Path ID
 * @param n - Point index
 */
export function path_get_point_speed(path_id: number, n: number): number {
    return _paths.get(path_id)?.points[n]?.speed ?? 1
}

/**
 * Sets whether the path is closed (loops back to the start).
 * @param path_id - Path ID
 * @param closed - True to close the path
 */
export function path_set_closed(path_id: number, closed: boolean): void {
    const p = _paths.get(path_id)
    if (p) p.closed = closed
}

/**
 * Sets the interpolation kind for a path.
 * @param path_id - Path ID
 * @param kind - path_kind_linear | path_kind_smooth
 */
export function path_set_kind(path_id: number, kind: number): void {
    const p = _paths.get(path_id)
    if (p) p.kind = kind
}

/**
 * Sets the spline precision (number of subdivisions per segment).
 * Higher values improve length accuracy for smooth paths.
 * @param path_id - Path ID
 * @param precision - Steps per segment (default 8)
 */
export function path_set_precision(path_id: number, precision: number): void {
    const p = _paths.get(path_id)
    if (p) p.precision = Math.max(1, precision)
}

/**
 * Flips the path horizontally around the centre of its bounding box.
 * @param path_id - Path ID
 */
export function path_flip(path_id: number): void {
    const p = _paths.get(path_id)
    if (!p || p.points.length === 0) return
    const min_x = Math.min(...p.points.map(pt => pt.x))
    const max_x = Math.max(...p.points.map(pt => pt.x))
    const cx    = (min_x + max_x) / 2
    for (const pt of p.points) pt.x = 2 * cx - pt.x
}

/**
 * Mirrors the path vertically around the centre of its bounding box.
 * @param path_id - Path ID
 */
export function path_mirror(path_id: number): void {
    const p = _paths.get(path_id)
    if (!p || p.points.length === 0) return
    const min_y = Math.min(...p.points.map(pt => pt.y))
    const max_y = Math.max(...p.points.map(pt => pt.y))
    const cy    = (min_y + max_y) / 2
    for (const pt of p.points) pt.y = 2 * cy - pt.y
}

/**
 * Reverses the order of points on a path.
 * @param path_id - Path ID
 */
export function path_reverse(path_id: number): void {
    _paths.get(path_id)?.points.reverse()
}
