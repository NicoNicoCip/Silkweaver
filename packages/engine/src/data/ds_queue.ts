/**
 * DS Queue — FIFO (first in, first out) data structure.
 *
 * GMS-compatible API: ds_queue_create, ds_queue_destroy, ds_queue_enqueue,
 * ds_queue_dequeue, ds_queue_head, ds_queue_tail, ds_queue_size,
 * ds_queue_empty, ds_queue_clear, ds_queue_copy.
 *
 * Implemented with a circular buffer for O(1) enqueue and dequeue.
 */

// =========================================================================
// Internal registry
// =========================================================================

/**
 * Circular buffer queue implementation.
 * Doubles capacity when full; shrinks are not performed.
 */
class Queue {
    private _data: any[]
    private _head: number = 0   // Index of the front element
    private _tail: number = 0   // Index of the next write position
    private _size: number = 0   // Number of live elements
    private _cap:  number       // Current buffer capacity

    constructor(initial_capacity: number = 16) {
        this._cap  = initial_capacity
        this._data = new Array(initial_capacity)
    }

    private _grow(): void {
        const new_cap  = this._cap * 2
        const new_data = new Array(new_cap)
        for (let i = 0; i < this._size; i++) {
            new_data[i] = this._data[(this._head + i) % this._cap]
        }
        this._data = new_data
        this._head = 0
        this._tail = this._size
        this._cap  = new_cap
    }

    public enqueue(val: any): void {
        if (this._size === this._cap) this._grow()
        this._data[this._tail] = val
        this._tail = (this._tail + 1) % this._cap
        this._size++
    }

    public dequeue(): any {
        if (this._size === 0) return undefined
        const val  = this._data[this._head]
        this._head = (this._head + 1) % this._cap
        this._size--
        return val
    }

    public head(): any {
        if (this._size === 0) return undefined
        return this._data[this._head]
    }

    public tail(): any {
        if (this._size === 0) return undefined
        return this._data[(this._tail - 1 + this._cap) % this._cap]
    }

    public get size(): number { return this._size }
    public get empty(): boolean { return this._size === 0 }

    public clear(): void {
        this._head = 0
        this._tail = 0
        this._size = 0
    }

    public copy_from(other: Queue): void {
        this.clear()
        for (let i = 0; i < other._size; i++) {
            this.enqueue(other._data[(other._head + i) % other._cap])
        }
    }
}

const _queues: Map<number, Queue> = new Map()
let _next_id = 0

function _get(id: number): Queue {
    const q = _queues.get(id)
    if (!q) throw new Error(`ds_queue: invalid id ${id}`)
    return q
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new empty DS queue.
 * @returns Queue ID
 */
export function ds_queue_create(): number {
    const id = _next_id++
    _queues.set(id, new Queue())
    return id
}

/**
 * Destroys a DS queue.
 * @param id - Queue ID
 */
export function ds_queue_destroy(id: number): void {
    _queues.delete(id)
}

/**
 * Adds a value to the back of the queue.
 * @param id - Queue ID
 * @param val - Value to enqueue
 */
export function ds_queue_enqueue(id: number, val: any): void {
    _get(id).enqueue(val)
}

/**
 * Removes and returns the front value. Returns undefined if empty.
 * @param id - Queue ID
 */
export function ds_queue_dequeue(id: number): any {
    return _get(id).dequeue()
}

/**
 * Returns the front value without removing it. Returns undefined if empty.
 * @param id - Queue ID
 */
export function ds_queue_head(id: number): any {
    return _get(id).head()
}

/**
 * Returns the back (last enqueued) value without removing it.
 * @param id - Queue ID
 */
export function ds_queue_tail(id: number): any {
    return _get(id).tail()
}

/**
 * Returns the number of items in the queue.
 * @param id - Queue ID
 */
export function ds_queue_size(id: number): number {
    return _get(id).size
}

/**
 * Returns true if the queue has no items.
 * @param id - Queue ID
 */
export function ds_queue_empty(id: number): boolean {
    return _get(id).empty
}

/**
 * Removes all items from the queue.
 * @param id - Queue ID
 */
export function ds_queue_clear(id: number): void {
    _get(id).clear()
}

/**
 * Copies items from src into dst (overwrites destination).
 * @param src - Source queue ID
 * @param dst - Destination queue ID
 */
export function ds_queue_copy(src: number, dst: number): void {
    _get(dst).copy_from(_get(src))
}

/** Returns true if the queue ID exists. */
export function ds_queue_exists(id: number): boolean {
    return _queues.has(id)
}
