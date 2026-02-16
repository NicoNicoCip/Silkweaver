/**
 * JSON encoding/decoding utilities.
 *
 * Mirrors GMS's json_encode / json_decode API with additional helpers
 * for deep cloning and safe parsing.
 *
 * Unlike GMS, these functions operate on native JS values (objects, arrays)
 * rather than on ds_map/ds_list IDs.
 */

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Encodes a JavaScript value to a JSON string.
 * Equivalent to GMS's json_encode (which accepts a ds_map).
 * @param val - Any JSON-serialisable value
 * @returns JSON string, or an empty string on error
 */
export function json_encode(val: unknown): string {
    try {
        return JSON.stringify(val) ?? ''
    } catch {
        return ''
    }
}

/**
 * Decodes a JSON string into a JavaScript value.
 * Returns undefined if the string is not valid JSON.
 * @param str - JSON string
 * @returns Parsed value, or undefined on parse error
 */
export function json_decode(str: string): unknown {
    try {
        return JSON.parse(str)
    } catch {
        return undefined
    }
}

/**
 * Encodes a value to a pretty-printed JSON string (human-readable).
 * @param val - Any JSON-serialisable value
 * @param indent - Number of spaces for indentation (default 2)
 */
export function json_stringify_pretty(val: unknown, indent: number = 2): string {
    try {
        return JSON.stringify(val, null, indent)
    } catch {
        return ''
    }
}

/**
 * Deep clones a JSON-serialisable value via encode/decode round-trip.
 * Functions and undefined values in the object will be lost.
 * @param val - Value to clone
 * @returns A deep copy of val, or undefined if not serialisable
 */
export function json_deep_clone<T>(val: T): T | undefined {
    const encoded = json_encode(val)
    if (!encoded) return undefined
    return json_decode(encoded) as T | undefined
}

/**
 * Returns true if a string is valid JSON.
 * @param str - String to test
 */
export function json_is_valid(str: string): boolean {
    try {
        JSON.parse(str)
        return true
    } catch {
        return false
    }
}

/**
 * Saves a serialisable value to localStorage under a given key.
 * @param key - localStorage key
 * @param val - Value to save
 */
export function json_save(key: string, val: unknown): void {
    const encoded = json_encode(val)
    if (encoded) localStorage.setItem(key, encoded)
}

/**
 * Loads a value from localStorage and decodes it from JSON.
 * Returns the default value if the key is missing or invalid.
 * @param key - localStorage key
 * @param default_val - Returned if the key is absent or invalid
 */
export function json_load<T>(key: string, default_val: T): T {
    const raw = localStorage.getItem(key)
    if (raw === null) return default_val
    const parsed = json_decode(raw)
    return parsed !== undefined ? (parsed as T) : default_val
}

/**
 * Deletes a JSON entry from localStorage.
 * @param key - localStorage key to delete
 */
export function json_delete(key: string): void {
    localStorage.removeItem(key)
}
