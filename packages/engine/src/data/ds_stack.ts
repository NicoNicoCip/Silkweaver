/**
 * DS Stack — LIFO (last in, first out) data structure.
 *
 * GMS-compatible API: ds_stack_create, ds_stack_destroy, ds_stack_push,
 * ds_stack_pop, ds_stack_top, ds_stack_size, ds_stack_empty,
 * ds_stack_clear, ds_stack_copy.
 */

// =========================================================================
// Internal registry
// =========================================================================

const _stacks: Map<number, any[]> = new Map()
let _next_id = 0

function _get(id: number): any[] {
    const s = _stacks.get(id)
    if (!s) throw new Error(`ds_stack: invalid id ${id}`)
    return s
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty DS stack.
 * @returns Stack ID
 */
export function ds_stack_create(): number {
    const id = _next_id++
    _stacks.set(id, [])
    return id
}

/**
 * Destroys a DS stack.
 * @param id - Stack ID
 */
export function ds_stack_destroy(id: number): void {
    _stacks.delete(id)
}

/**
 * Pushes a value onto the top of the stack.
 * @param id - Stack ID
 * @param val - Value to push
 */
export function ds_stack_push(id: number, val: any): void {
    _get(id).push(val)
}

/**
 * Removes and returns the top value. Returns undefined if empty.
 * @param id - Stack ID
 */
export function ds_stack_pop(id: number): any {
    return _get(id).pop()
}

/**
 * Returns the top value without removing it. Returns undefined if empty.
 * @param id - Stack ID
 */
export function ds_stack_top(id: number): any {
    const s = _get(id)
    return s[s.length - 1]
}

/**
 * Returns the number of items in the stack.
 * @param id - Stack ID
 */
export function ds_stack_size(id: number): number {
    return _get(id).length
}

/**
 * Returns true if the stack has no items.
 * @param id - Stack ID
 */
export function ds_stack_empty(id: number): boolean {
    return _get(id).length === 0
}

/**
 * Removes all items from the stack.
 * @param id - Stack ID
 */
export function ds_stack_clear(id: number): void {
    _get(id).length = 0
}

/**
 * Copies all items from src into dst (overwrites destination).
 * @param src - Source stack ID
 * @param dst - Destination stack ID
 */
export function ds_stack_copy(src: number, dst: number): void {
    const s = _get(src)
    const d = _get(dst)
    d.length = 0
    for (const v of s) d.push(v)
}

/** Returns true if the stack ID exists. */
export function ds_stack_exists(id: number): boolean {
    return _stacks.has(id)
}
