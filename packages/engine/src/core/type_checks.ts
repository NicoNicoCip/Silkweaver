/**
 * Runtime type-checking helpers mirroring GMS's is_* family.
 * In JS these reduce to typeof / structural tests.
 */

/** True if the value is a number (GMS real). */
export function is_real(value: unknown): boolean {
    return typeof value === 'number'
}

/** True if the value is a string. */
export function is_string(value: unknown): boolean {
    return typeof value === 'string'
}

/** True if the value is an array. */
export function is_array(value: unknown): boolean {
    return Array.isArray(value)
}

/** True if the value is undefined. */
export function is_undefined(value: unknown): boolean {
    return value === undefined
}

/** True if the value is a boolean. */
export function is_bool(value: unknown): boolean {
    return typeof value === 'boolean'
}

/** True if the value is numeric (a number or boolean, matching GMS). */
export function is_numeric(value: unknown): boolean {
    return typeof value === 'number' || typeof value === 'boolean'
}

/** True if the value is an integer within the signed 32-bit range. */
export function is_int32(value: unknown): boolean {
    return typeof value === 'number' && Number.isInteger(value) && value >= -2147483648 && value <= 2147483647
}

/** True if the value is an integer outside the signed 32-bit range. */
export function is_int64(value: unknown): boolean {
    return typeof value === 'number' && Number.isInteger(value) && (value < -2147483648 || value > 2147483647)
}

/** True if the value is NaN. */
export function is_nan(value: unknown): boolean {
    return typeof value === 'number' && Number.isNaN(value)
}

/** True if the value is positive or negative infinity. */
export function is_infinity(value: unknown): boolean {
    return value === Infinity || value === -Infinity
}

/** True if the value is callable (GMS 2.x is_method; useful for script refs). */
export function is_method(value: unknown): boolean {
    return typeof value === 'function'
}
