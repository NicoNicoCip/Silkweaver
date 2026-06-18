/**
 * Math utilities.
 *
 * Mirrors the GMS built-in math functions:
 *   lengthdir_x/y, point_distance, point_direction,
 *   angle_difference, lerp, clamp, sign, frac, round, floor, ceil,
 *   dsin, dcos, dtan, arcsin, arccos, arctan, arctan2,
 *   power, sqr, sqrt, abs, min, max, median, mean, log2, log10, ln, exp
 */

// =========================================================================
// Degree/radian helpers
// =========================================================================

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

/** Converts degrees to radians. */
export function degtorad(deg: number): number { return deg * DEG2RAD }

/** Converts radians to degrees. */
export function radtodeg(rad: number): number { return rad * RAD2DEG }

// =========================================================================
// Trigonometry (degree-based, matching GMS)
// =========================================================================

/** Sine of angle in degrees. */
export function dsin(deg: number): number { return Math.sin(deg * DEG2RAD) }

/** Cosine of angle in degrees. */
export function dcos(deg: number): number { return Math.cos(deg * DEG2RAD) }

/** Tangent of angle in degrees. */
export function dtan(deg: number): number { return Math.tan(deg * DEG2RAD) }

/** Arcsine, returns radians (GMS-faithful; use darcsin for degrees). */
export function arcsin(x: number): number { return Math.asin(x) }

/** Arccosine, returns radians (use darccos for degrees). */
export function arccos(x: number): number { return Math.acos(x) }

/** Arctangent, returns radians (use darctan for degrees). */
export function arctan(x: number): number { return Math.atan(x) }

/** Two-argument arctangent, returns radians. GMS: arctan2(y, x). */
export function arctan2(y: number, x: number): number { return Math.atan2(y, x) }

/** Arcsine of angle, returns degrees. */
export function darcsin(x: number): number { return Math.asin(x) * RAD2DEG }

/** Arccosine of angle, returns degrees. */
export function darccos(x: number): number { return Math.acos(x) * RAD2DEG }

/** Arctangent of angle, returns degrees. */
export function darctan(x: number): number { return Math.atan(x) * RAD2DEG }

/** Two-argument arctangent, returns degrees. GMS: darctan2(y, x). */
export function darctan2(y: number, x: number): number { return Math.atan2(y, x) * RAD2DEG }

// =========================================================================
// Direction / distance helpers
// =========================================================================

/**
 * Returns the X component of a vector with given length and direction.
 * @param len - Vector length
 * @param dir - Direction in degrees (0 = right, 90 = up in GMS)
 */
export function lengthdir_x(len: number, dir: number): number {
    return len * Math.cos(dir * DEG2RAD)
}

/**
 * Returns the Y component of a vector with given length and direction.
 * GMS Y-axis is inverted (positive Y = down), so result is negated.
 * @param len - Vector length
 * @param dir - Direction in degrees
 */
export function lengthdir_y(len: number, dir: number): number {
    return -len * Math.sin(dir * DEG2RAD)
}

/**
 * Returns the Euclidean distance between two points.
 */
export function point_distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1, dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Returns the 3D Euclidean distance between two points.
 */
export function point_distance_3d(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    const dx = x2-x1, dy = y2-y1, dz = z2-z1
    return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

/**
 * Returns the direction from (x1, y1) to (x2, y2) in degrees.
 * 0 = right, 90 = up (GMS convention).
 */
export function point_direction(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(-(y2 - y1), x2 - x1) * RAD2DEG
}

/**
 * Returns the shortest signed difference between two angles in degrees.
 * Result is in the range (-180, 180].
 */
export function angle_difference(a: number, b: number): number {
    let d = ((a - b) % 360 + 360) % 360
    if (d > 180) d -= 360
    return d
}

// =========================================================================
// Numeric utilities
// =========================================================================

/** Linear interpolation from a to b by factor w (0–1). */
export function lerp(a: number, b: number, w: number): number {
    return a + (b - a) * w
}

/** Clamps val to [min_val, max_val]. */
export function clamp(val: number, min_val: number, max_val: number): number {
    return val < min_val ? min_val : val > max_val ? max_val : val
}

/** Returns the sign of x: -1, 0, or 1. */
export function sign(x: number): number {
    return x > 0 ? 1 : x < 0 ? -1 : 0
}

/** Returns the fractional part of x. */
export function frac(x: number): number {
    return x - Math.trunc(x)
}

/** Returns x squared. */
export function sqr(x: number): number { return x * x }

/** Returns the square root of x. */
export function sqrt(x: number): number { return Math.sqrt(x) }

/** Returns the absolute value of x. */
export function abs(x: number): number { return Math.abs(x) }

/** Returns the floor of x. */
export function floor(x: number): number { return Math.floor(x) }

/** Returns the ceiling of x. */
export function ceil(x: number): number { return Math.ceil(x) }

/** Rounds x to the nearest integer. */
export function round(x: number): number { return Math.round(x) }

/** Returns x raised to the power n. */
export function power(x: number, n: number): number { return Math.pow(x, n) }

/** Returns the base-2 logarithm of x. */
export function log2(x: number): number { return Math.log2(x) }

/** Returns the base-10 logarithm of x. */
export function log10(x: number): number { return Math.log10(x) }

/** Returns the natural logarithm of x. */
export function ln(x: number): number { return Math.log(x) }

/** Returns the base-n logarithm of x. GMS: logn(n, x). */
export function logn(n: number, x: number): number { return Math.log(x) / Math.log(n) }

/** Returns e raised to the power x. */
export function exp(x: number): number { return Math.exp(x) }

/** Dot product of two 2D vectors (x1,y1)·(x2,y2). */
export function dot_product(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * x2 + y1 * y2
}

/** Dot product of two 3D vectors. */
export function dot_product_3d(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    return x1 * x2 + y1 * y2 + z1 * z2
}

/** Returns the minimum of all provided values. */
export function min(...values: number[]): number { return Math.min(...values) }

/** Returns the maximum of all provided values. */
export function max(...values: number[]): number { return Math.max(...values) }

/**
 * Returns the median of the provided values.
 * For an even count, returns the average of the two middle values.
 */
export function median(...values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid    = Math.floor(sorted.length / 2)
    if (sorted.length % 2 === 1) return sorted[mid]!
    return (sorted[mid - 1]! + sorted[mid]!) / 2
}

/**
 * Returns the arithmetic mean of the provided values.
 * Returns 0 for empty input.
 */
export function mean(...values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((s, v) => s + v, 0) / values.length
}

/**
 * Returns whether x is between lo and hi (inclusive).
 * Equivalent to GMS's between(lo, x, hi).
 */
export function between(x: number, lo: number, hi: number): boolean {
    return x >= lo && x <= hi
}

/**
 * Returns whether x is approximately equal to y within epsilon.
 */
export function approx(x: number, y: number, epsilon: number = 1e-6): boolean {
    return Math.abs(x - y) <= epsilon
}

/**
 * Wraps x into the range [0, range).
 */
export function wrap(x: number, range: number): number {
    return ((x % range) + range) % range
}

/**
 * Returns the dot product of two 2D vectors.
 */
export function dot2(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * x2 + y1 * y2
}

/**
 * Returns the dot product of two 3D vectors.
 */
export function dot3(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    return x1*x2 + y1*y2 + z1*z2
}

/**
 * Returns the 2D cross product (scalar z of 3D cross product).
 */
export function cross2(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * y2 - y1 * x2
}

// =========================================================================
// Geometric predicates (GMS parity)
// The rectangle_in_* family returns 0 (outside), 1 (overlapping), 2 (fully inside).
// =========================================================================

/** The mathematical constant pi (GMS exposes `pi` as a global). */
export const pi = Math.PI

/** True if point (px,py) lies within the axis-aligned rectangle (x1,y1)-(x2,y2). */
export function point_in_rectangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
    return px >= Math.min(x1, x2) && px <= Math.max(x1, x2) &&
           py >= Math.min(y1, y2) && py <= Math.max(y1, y2)
}

/** True if point (px,py) lies within the circle centred at (cx,cy) with radius rad. */
export function point_in_circle(px: number, py: number, cx: number, cy: number, rad: number): boolean {
    const dx = px - cx, dy = py - cy
    return dx * dx + dy * dy <= rad * rad
}

/** True if point (px,py) lies within the triangle (x1,y1)(x2,y2)(x3,y3). */
export function point_in_triangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean {
    const d1 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2)
    const d2 = (px - x3) * (y2 - y3) - (x2 - x3) * (py - y3)
    const d3 = (px - x1) * (y3 - y1) - (x3 - x1) * (py - y1)
    const has_neg = d1 < 0 || d2 < 0 || d3 < 0
    const has_pos = d1 > 0 || d2 > 0 || d3 > 0
    return !(has_neg && has_pos)
}

/** Orientation sign of point (cx,cy) relative to segment (ax,ay)-(bx,by). */
function _orient(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
}

/** True if segments (a-b) and (c-d) properly intersect. */
function _seg_intersect(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): boolean {
    const d1 = _orient(cx, cy, dx, dy, ax, ay)
    const d2 = _orient(cx, cy, dx, dy, bx, by)
    const d3 = _orient(ax, ay, bx, by, cx, cy)
    const d4 = _orient(ax, ay, bx, by, dx, dy)
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
           ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
}

/** 0 = outside, 1 = overlapping, 2 = first rectangle fully inside the second. */
export function rectangle_in_rectangle(sx1: number, sy1: number, sx2: number, sy2: number, x1: number, y1: number, x2: number, y2: number): number {
    const sl = Math.min(sx1, sx2), sr = Math.max(sx1, sx2), st = Math.min(sy1, sy2), sb = Math.max(sy1, sy2)
    const l = Math.min(x1, x2), r = Math.max(x1, x2), t = Math.min(y1, y2), b = Math.max(y1, y2)
    if (sl >= l && sr <= r && st >= t && sb <= b) return 2
    if (sl <= r && sr >= l && st <= b && sb >= t) return 1
    return 0
}

/** 0 = outside, 1 = overlapping, 2 = rectangle fully inside the circle. */
export function rectangle_in_circle(sx1: number, sy1: number, sx2: number, sy2: number, cx: number, cy: number, rad: number): number {
    const l = Math.min(sx1, sx2), r = Math.max(sx1, sx2), t = Math.min(sy1, sy2), b = Math.max(sy1, sy2)
    const r2 = rad * rad
    const inside = (px: number, py: number): boolean => { const dx = px - cx, dy = py - cy; return dx * dx + dy * dy <= r2 }
    const n = (inside(l, t) ? 1 : 0) + (inside(r, t) ? 1 : 0) + (inside(r, b) ? 1 : 0) + (inside(l, b) ? 1 : 0)
    if (n === 4) return 2
    if (n > 0) return 1
    // No corner inside: the circle may still clip the rectangle (closest point within radius).
    const nx = Math.max(l, Math.min(cx, r)), ny = Math.max(t, Math.min(cy, b))
    const dx = nx - cx, dy = ny - cy
    return dx * dx + dy * dy <= r2 ? 1 : 0
}

/** 0 = outside, 1 = overlapping, 2 = rectangle fully inside the triangle. */
export function rectangle_in_triangle(sx1: number, sy1: number, sx2: number, sy2: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
    const l = Math.min(sx1, sx2), r = Math.max(sx1, sx2), t = Math.min(sy1, sy2), b = Math.max(sy1, sy2)
    const corners: [number, number][] = [[l, t], [r, t], [r, b], [l, b]]
    let inside = 0
    for (const [px, py] of corners) if (point_in_triangle(px, py, x1, y1, x2, y2, x3, y3)) inside++
    if (inside === 4) return 2
    if (inside > 0) return 1
    // No rectangle corner in the triangle: overlap if a triangle vertex sits in the
    // rectangle, or any rectangle edge crosses any triangle edge.
    for (const [px, py] of [[x1, y1], [x2, y2], [x3, y3]] as [number, number][])
        if (point_in_rectangle(px, py, l, t, r, b)) return 1
    const rect_edges: [number, number, number, number][] = [[l, t, r, t], [r, t, r, b], [r, b, l, b], [l, b, l, t]]
    const tri_edges:  [number, number, number, number][] = [[x1, y1, x2, y2], [x2, y2, x3, y3], [x3, y3, x1, y1]]
    for (const e of rect_edges) for (const g of tri_edges)
        if (_seg_intersect(e[0], e[1], e[2], e[3], g[0], g[1], g[2], g[3])) return 1
    return 0
}
