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

/** Arcsine, returns degrees. */
export function arcsin(x: number): number { return Math.asin(x) * RAD2DEG }

/** Arccosine, returns degrees. */
export function arccos(x: number): number { return Math.acos(x) * RAD2DEG }

/** Arctangent, returns degrees. */
export function arctan(x: number): number { return Math.atan(x) * RAD2DEG }

/** Two-argument arctangent, returns degrees. GMS: arctan2(y, x). */
export function arctan2(y: number, x: number): number { return Math.atan2(y, x) * RAD2DEG }

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

/** Returns e raised to the power x. */
export function exp(x: number): number { return Math.exp(x) }

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
    if (sorted.length % 2 === 1) return sorted[mid]
    return (sorted[mid - 1] + sorted[mid]) / 2
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
