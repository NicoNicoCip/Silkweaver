/**
 * DS Map — key/value store (string or number keys).
 *
 * GMS-compatible API: ds_map_create, ds_map_add, ds_map_set,
 * ds_map_find_value, ds_map_exists, ds_map_delete, ds_map_size,
 * ds_map_empty, ds_map_clear, ds_map_destroy, ds_map_copy,
 * ds_map_find_first, ds_map_find_next, ds_map_find_last, ds_map_find_previous.
 */

// =========================================================================
// Internal registry
// =========================================================================

type ds_map_key = string | number

const _maps: Map<number, Map<ds_map_key, any>> = new Map()
let _next_id = 0

function _get(id: number): Map<ds_map_key, any> {
    const m = _maps.get(id)
    if (!m) throw new Error(`ds_map: invalid id ${id}`)
    return m
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty DS map.
 * @returns The map ID
 */
export function ds_map_create(): number {
    const id = _next_id++
    _maps.set(id, new Map())
    return id
}

/**
 * Destroys a DS map.
 * @param id - Map ID
 */
export function ds_map_destroy(id: number): void {
    _maps.delete(id)
}

/**
 * Adds a key/value pair if the key does not already exist.
 * @param id - Map ID
 * @param key - Key (string or number)
 * @param val - Value
 */
export function ds_map_add(id: number, key: ds_map_key, val: any): void {
    const m = _get(id)
    if (!m.has(key)) m.set(key, val)
}

/**
 * Sets a key/value pair, overwriting any existing value.
 * @param id - Map ID
 * @param key - Key
 * @param val - Value
 */
export function ds_map_set(id: number, key: ds_map_key, val: any): void {
    _get(id).set(key, val)
}

/**
 * Returns the value for a key, or undefined if not found.
 * @param id - Map ID
 * @param key - Key to look up
 */
export function ds_map_find_value(id: number, key: ds_map_key): any {
    return _get(id).get(key)
}

/**
 * Returns true if the key exists in the map.
 * @param id - Map ID
 * @param key - Key to check
 */
export function ds_map_exists(id: number, key: ds_map_key): boolean {
    return _get(id).has(key)
}

/**
 * Deletes a key from the map.
 * @param id - Map ID
 * @param key - Key to delete
 */
export function ds_map_delete(id: number, key: ds_map_key): void {
    _get(id).delete(key)
}

/**
 * Returns the number of key/value pairs in the map.
 * @param id - Map ID
 */
export function ds_map_size(id: number): number {
    return _get(id).size
}

/**
 * Returns true if the map has no entries.
 * @param id - Map ID
 */
export function ds_map_empty(id: number): boolean {
    return _get(id).size === 0
}

/**
 * Removes all entries from the map.
 * @param id - Map ID
 */
export function ds_map_clear(id: number): void {
    _get(id).clear()
}

/**
 * Copies the contents of one map into another (overwrites destination).
 * @param src - Source map ID
 * @param dst - Destination map ID
 */
export function ds_map_copy(src: number, dst: number): void {
    const src_map = _get(src)
    const dst_map = _get(dst)
    dst_map.clear()
    for (const [k, v] of src_map) dst_map.set(k, v)
}

/**
 * Returns the first key in the map (insertion order), or undefined if empty.
 * @param id - Map ID
 */
export function ds_map_find_first(id: number): ds_map_key | undefined {
    return _get(id).keys().next().value
}

/**
 * Returns the key that follows `key` in insertion order, or undefined.
 * @param id - Map ID
 * @param key - Reference key
 */
export function ds_map_find_next(id: number, key: ds_map_key): ds_map_key | undefined {
    const keys = Array.from(_get(id).keys())
    const idx  = keys.indexOf(key)
    return idx >= 0 && idx + 1 < keys.length ? keys[idx + 1] : undefined
}

/**
 * Returns the last key in the map, or undefined if empty.
 * @param id - Map ID
 */
export function ds_map_find_last(id: number): ds_map_key | undefined {
    const keys = Array.from(_get(id).keys())
    return keys.length > 0 ? keys[keys.length - 1] : undefined
}

/**
 * Returns the key before `key` in insertion order, or undefined.
 * @param id - Map ID
 * @param key - Reference key
 */
export function ds_map_find_previous(id: number, key: ds_map_key): ds_map_key | undefined {
    const keys = Array.from(_get(id).keys())
    const idx  = keys.indexOf(key)
    return idx > 0 ? keys[idx - 1] : undefined
}

/** Returns true if the map ID exists. */
export function ds_map_exists_id(id: number): boolean {
    return _maps.has(id)
}
