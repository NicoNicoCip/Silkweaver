/**
 * DS Priority Queue — values are retrieved in priority order.
 *
 * GMS-compatible API: ds_priority_create, ds_priority_destroy,
 * ds_priority_add, ds_priority_delete_value, ds_priority_delete_min,
 * ds_priority_delete_max, ds_priority_find_min, ds_priority_find_max,
 * ds_priority_find_priority, ds_priority_size, ds_priority_empty,
 * ds_priority_clear, ds_priority_copy.
 *
 * Implemented with a min-heap. Max operations use negated priority.
 */

// =========================================================================
// Internal types and helpers
// =========================================================================

interface pq_entry {
    val:      any     // The stored value
    priority: number  // Lower numbers = higher priority (min-heap at root)
}

/**
 * Min-heap priority queue.
 * Entries with the lowest priority number are at the top.
 */
class MinHeap {
    private _data: pq_entry[] = []

    public get size(): number { return this._data.length }
    public get empty(): boolean { return this._data.length === 0 }

    private _swap(i: number, j: number): void {
        ;[this._data[i], this._data[j]] = [this._data[j], this._data[i]]
    }

    private _sift_up(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1
            if (this._data[parent].priority <= this._data[i].priority) break
            this._swap(i, parent)
            i = parent
        }
    }

    private _sift_down(i: number): void {
        const n = this._data.length
        while (true) {
            let smallest = i
            const l = 2 * i + 1
            const r = 2 * i + 2
            if (l < n && this._data[l].priority < this._data[smallest].priority) smallest = l
            if (r < n && this._data[r].priority < this._data[smallest].priority) smallest = r
            if (smallest === i) break
            this._swap(i, smallest)
            i = smallest
        }
    }

    public push(val: any, priority: number): void {
        this._data.push({ val, priority })
        this._sift_up(this._data.length - 1)
    }

    /** Returns the entry with the lowest priority without removing it. */
    public peek_min(): pq_entry | undefined {
        return this._data[0]
    }

    /** Returns the entry with the highest priority (largest number) without removing it. */
    public peek_max(): pq_entry | undefined {
        if (this._data.length === 0) return undefined
        // For a min-heap, the maximum is in the second half (leaf nodes)
        let max = this._data[0]
        const start = Math.floor(this._data.length / 2)
        for (let i = start; i < this._data.length; i++) {
            if (this._data[i].priority > max.priority) max = this._data[i]
        }
        return max
    }

    /** Removes and returns the entry with the lowest priority. */
    public pop_min(): pq_entry | undefined {
        if (this._data.length === 0) return undefined
        const top = this._data[0]
        const last = this._data.pop()!
        if (this._data.length > 0) {
            this._data[0] = last
            this._sift_down(0)
        }
        return top
    }

    /** Removes and returns the entry with the highest priority (largest number). */
    public pop_max(): pq_entry | undefined {
        if (this._data.length === 0) return undefined
        const max_entry = this.peek_max()!
        const idx = this._data.indexOf(max_entry)
        const last = this._data.pop()!
        if (idx < this._data.length) {
            this._data[idx] = last
            this._sift_up(idx)
            this._sift_down(idx)
        }
        return max_entry
    }

    /** Removes the first occurrence of a value. */
    public delete_value(val: any): boolean {
        const idx = this._data.findIndex(e => e.val === val)
        if (idx < 0) return false
        const last = this._data.pop()!
        if (idx < this._data.length) {
            this._data[idx] = last
            this._sift_up(idx)
            this._sift_down(idx)
        }
        return true
    }

    /** Returns the priority of a value, or undefined if not found. */
    public find_priority(val: any): number | undefined {
        const entry = this._data.find(e => e.val === val)
        return entry?.priority
    }

    public clear(): void {
        this._data.length = 0
    }

    public copy_from(other: MinHeap): void {
        this._data = other._data.map(e => ({ ...e }))
    }
}

const _pqs: Map<number, MinHeap> = new Map()
let _next_id = 0

function _get(id: number): MinHeap {
    const pq = _pqs.get(id)
    if (!pq) throw new Error(`ds_priority: invalid id ${id}`)
    return pq
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty DS priority queue.
 * @returns Priority queue ID
 */
export function ds_priority_create(): number {
    const id = _next_id++
    _pqs.set(id, new MinHeap())
    return id
}

/**
 * Destroys a DS priority queue.
 * @param id - Priority queue ID
 */
export function ds_priority_destroy(id: number): void {
    _pqs.delete(id)
}

/**
 * Adds a value with a given priority.
 * Lower priority numbers are retrieved first (min-heap order).
 * @param id - Priority queue ID
 * @param val - Value to add
 * @param priority - Priority number
 */
export function ds_priority_add(id: number, val: any, priority: number): void {
    _get(id).push(val, priority)
}

/**
 * Removes the first occurrence of a value.
 * @param id - Priority queue ID
 * @param val - Value to remove
 */
export function ds_priority_delete_value(id: number, val: any): void {
    _get(id).delete_value(val)
}

/**
 * Removes and returns the value with the lowest priority number.
 * @param id - Priority queue ID
 */
export function ds_priority_delete_min(id: number): any {
    return _get(id).pop_min()?.val
}

/**
 * Removes and returns the value with the highest priority number.
 * @param id - Priority queue ID
 */
export function ds_priority_delete_max(id: number): any {
    return _get(id).pop_max()?.val
}

/**
 * Returns the value with the lowest priority number without removing it.
 * @param id - Priority queue ID
 */
export function ds_priority_find_min(id: number): any {
    return _get(id).peek_min()?.val
}

/**
 * Returns the value with the highest priority number without removing it.
 * @param id - Priority queue ID
 */
export function ds_priority_find_max(id: number): any {
    return _get(id).peek_max()?.val
}

/**
 * Returns the priority of the given value, or undefined if not found.
 * @param id - Priority queue ID
 * @param val - Value to look up
 */
export function ds_priority_find_priority(id: number, val: any): number | undefined {
    return _get(id).find_priority(val)
}

/**
 * Returns the number of items in the priority queue.
 * @param id - Priority queue ID
 */
export function ds_priority_size(id: number): number {
    return _get(id).size
}

/**
 * Returns true if the priority queue has no items.
 * @param id - Priority queue ID
 */
export function ds_priority_empty(id: number): boolean {
    return _get(id).empty
}

/**
 * Removes all items from the priority queue.
 * @param id - Priority queue ID
 */
export function ds_priority_clear(id: number): void {
    _get(id).clear()
}

/**
 * Copies the contents of src into dst (overwrites destination).
 * @param src - Source priority queue ID
 * @param dst - Destination priority queue ID
 */
export function ds_priority_copy(src: number, dst: number): void {
    _get(dst).copy_from(_get(src))
}

/** Returns true if the priority queue ID exists. */
export function ds_priority_exists(id: number): boolean {
    return _pqs.has(id)
}
