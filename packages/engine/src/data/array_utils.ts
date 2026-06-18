/**
 * GMS-style array helpers operating on native JS arrays.
 * Indices are 0-based (JS convention). Functions that GMS specifies as
 * in-place (push/insert/delete/sort/resize/set/copy) mutate the array;
 * array_reverse/array_concat return new arrays (matching modern GMS).
 */

/** Creates a new array of `size` elements, each set to `value` (default 0). */
export function array_create<T = number>(size: number, value: T = 0 as unknown as T): T[] {
    return new Array(Math.max(0, Math.floor(size))).fill(value)
}

/** Returns the length of the array. */
export function array_length<T>(arr: T[]): number {
    return arr.length
}

/** Alias for array_length (GMS 1.4 1D arrays). */
export function array_length_1d<T>(arr: T[]): number {
    return arr.length
}

/** Returns the element at `index` (undefined if out of range). */
export function array_get<T>(arr: T[], index: number): T | undefined {
    return arr[index]
}

/** Sets the element at `index`, growing the array (gaps filled with 0) if needed. */
export function array_set<T>(arr: T[], index: number, value: T): void {
    for (let i = arr.length; i < index; i++) arr[i] = 0 as unknown as T
    arr[index] = value
}

/** Resizes the array in place, truncating or padding with 0. */
export function array_resize<T>(arr: T[], new_size: number): void {
    const n = Math.max(0, Math.floor(new_size))
    if (n < arr.length) arr.length = n
    else for (let i = arr.length; i < n; i++) arr[i] = 0 as unknown as T
}

/**
 * Copies `length` elements from `src` (starting at `src_index`) into `dest`
 * starting at `dest_index`, growing `dest` if necessary.
 */
export function array_copy<T>(dest: T[], dest_index: number, src: T[], src_index: number, length: number): void {
    for (let i = 0; i < length; i++) dest[dest_index + i] = src[src_index + i] as T
}

/** True if both arrays have the same length and strictly-equal elements. */
export function array_equals<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
}

/** Appends values to the end of the array. Returns the new length. */
export function array_push<T>(arr: T[], ...values: T[]): number {
    return arr.push(...values)
}

/** Removes and returns the last element of the array. */
export function array_pop<T>(arr: T[]): T | undefined {
    return arr.pop()
}

/** Removes and returns the first element of the array. */
export function array_shift<T>(arr: T[]): T | undefined {
    return arr.shift()
}

/** Inserts values at `index`, shifting later elements right. */
export function array_insert<T>(arr: T[], index: number, ...values: T[]): void {
    arr.splice(index, 0, ...values)
}

/** Removes `number` elements starting at `index`. */
export function array_delete<T>(arr: T[], index: number, number: number = 1): void {
    arr.splice(index, number)
}

/**
 * Sorts the array in place. Pass `true` for ascending, `false` for descending,
 * or a comparator function (a,b) => number.
 */
export function array_sort<T>(arr: T[], type: boolean | ((a: T, b: T) => number) = true): void {
    if (typeof type === 'function') { arr.sort(type); return }
    arr.sort((a, b) => {
        const cmp = a < b ? -1 : a > b ? 1 : 0
        return type ? cmp : -cmp
    })
}

/** Returns a new array with the elements in reverse order. */
export function array_reverse<T>(arr: T[]): T[] {
    return [...arr].reverse()
}

/** Returns a new array concatenating all the given arrays. */
export function array_concat<T>(...arrays: T[][]): T[] {
    return ([] as T[]).concat(...arrays)
}

/** True if the array contains `value`. */
export function array_contains<T>(arr: T[], value: T): boolean {
    return arr.includes(value)
}

/** Returns the index of `value` from `offset` onward, or -1 if not found. */
export function array_get_index<T>(arr: T[], value: T, offset: number = 0): number {
    return arr.indexOf(value, offset)
}
