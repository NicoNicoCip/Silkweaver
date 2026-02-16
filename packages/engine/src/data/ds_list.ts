/**
 * DS List — ordered, resizable array.
 *
 * GMS-compatible API: ds_list_create, ds_list_add, ds_list_insert,
 * ds_list_find_value, ds_list_find_index, ds_list_replace,
 * ds_list_delete, ds_list_size, ds_list_empty, ds_list_clear,
 * ds_list_destroy, ds_list_copy.
 */

// =========================================================================
// Internal registry
// =========================================================================

const _lists: Map<number, any[]> = new Map()
let _next_id = 0

function _get(id: number): any[] {
    const list = _lists.get(id)
    if (!list) throw new Error(`ds_list: invalid id ${id}`)
    return list
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty DS list.
 * @returns The list ID
 */
export function ds_list_create(): number {
    const id = _next_id++
    _lists.set(id, [])
    return id
}

/**
 * Destroys a DS list, freeing its memory.
 * @param id - List ID
 */
export function ds_list_destroy(id: number): void {
    _lists.delete(id)
}

/**
 * Adds a value to the end of the list.
 * @param id - List ID
 * @param val - Value to add
 */
export function ds_list_add(id: number, val: any): void {
    _get(id).push(val)
}

/**
 * Inserts a value at a specific position (0-based).
 * @param id - List ID
 * @param pos - Index to insert at
 * @param val - Value to insert
 */
export function ds_list_insert(id: number, pos: number, val: any): void {
    _get(id).splice(pos, 0, val)
}

/**
 * Returns the value at a given position.
 * @param id - List ID
 * @param pos - Index (0-based)
 * @returns The value at that position, or undefined if out of range
 */
export function ds_list_find_value(id: number, pos: number): any {
    return _get(id)[pos]
}

/**
 * Returns the index of the first occurrence of a value, or -1 if not found.
 * @param id - List ID
 * @param val - Value to search for
 */
export function ds_list_find_index(id: number, val: any): number {
    return _get(id).indexOf(val)
}

/**
 * Replaces the value at a given position.
 * @param id - List ID
 * @param pos - Index to replace
 * @param val - New value
 */
export function ds_list_replace(id: number, pos: number, val: any): void {
    const list = _get(id)
    if (pos >= 0 && pos < list.length) list[pos] = val
}

/**
 * Removes the element at a given position.
 * @param id - List ID
 * @param pos - Index to delete
 */
export function ds_list_delete(id: number, pos: number): void {
    _get(id).splice(pos, 1)
}

/**
 * Returns the number of elements in the list.
 * @param id - List ID
 */
export function ds_list_size(id: number): number {
    return _get(id).length
}

/**
 * Returns true if the list has no elements.
 * @param id - List ID
 */
export function ds_list_empty(id: number): boolean {
    return _get(id).length === 0
}

/**
 * Removes all elements from the list.
 * @param id - List ID
 */
export function ds_list_clear(id: number): void {
    _get(id).length = 0
}

/**
 * Copies the contents of one list into another (overwrites destination).
 * @param src - Source list ID
 * @param dst - Destination list ID
 */
export function ds_list_copy(src: number, dst: number): void {
    const src_list = _get(src)
    const dst_list = _get(dst)
    dst_list.length = 0
    for (const v of src_list) dst_list.push(v)
}

/**
 * Sorts the list in ascending or descending order.
 * @param id - List ID
 * @param ascending - True for ascending, false for descending
 */
export function ds_list_sort(id: number, ascending: boolean): void {
    const list = _get(id)
    list.sort((a, b) => {
        if (a < b) return ascending ? -1 : 1
        if (a > b) return ascending ? 1 : -1
        return 0
    })
}

/**
 * Shuffles the list in place using Fisher-Yates.
 * @param id - List ID
 */
export function ds_list_shuffle(id: number): void {
    const list = _get(id)
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
    }
}

/** Returns true if the list ID exists. */
export function ds_list_exists(id: number): boolean {
    return _lists.has(id)
}
