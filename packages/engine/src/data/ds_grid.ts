/**
 * DS Grid — fixed-size 2D array.
 *
 * GMS-compatible API: ds_grid_create, ds_grid_destroy, ds_grid_get,
 * ds_grid_set, ds_grid_add, ds_grid_multiply, ds_grid_clear,
 * ds_grid_width, ds_grid_height, ds_grid_copy,
 * ds_grid_region_get, ds_grid_region_set,
 * ds_grid_get_max, ds_grid_get_min, ds_grid_get_mean, ds_grid_get_sum,
 * ds_grid_set_region, ds_grid_add_region, ds_grid_multiply_region.
 */

// =========================================================================
// Internal registry
// =========================================================================

interface grid_data {
    w:    number    // Column count
    h:    number    // Row count
    data: number[]  // Row-major flat array (length = w * h)
}

const _grids: Map<number, grid_data> = new Map()
let _next_id = 0

function _get(id: number): grid_data {
    const g = _grids.get(id)
    if (!g) throw new Error(`ds_grid: invalid id ${id}`)
    return g
}

function _idx(g: grid_data, x: number, y: number): number {
    return y * g.w + x
}

function _in_bounds(g: grid_data, x: number, y: number): boolean {
    return x >= 0 && x < g.w && y >= 0 && y < g.h
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new DS grid filled with zeros.
 * @param w - Number of columns
 * @param h - Number of rows
 * @returns Grid ID
 */
export function ds_grid_create(w: number, h: number): number {
    const id = _next_id++
    _grids.set(id, { w, h, data: new Array(w * h).fill(0) })
    return id
}

/**
 * Destroys a DS grid.
 * @param id - Grid ID
 */
export function ds_grid_destroy(id: number): void {
    _grids.delete(id)
}

/**
 * Returns the value at grid cell (x, y).
 * @param id - Grid ID
 * @param x - Column (0-based)
 * @param y - Row (0-based)
 */
export function ds_grid_get(id: number, x: number, y: number): number {
    const g = _get(id)
    if (!_in_bounds(g, x, y)) return 0
    return g.data[_idx(g, x, y)]
}

/**
 * Sets the value at grid cell (x, y).
 * @param id - Grid ID
 * @param x - Column
 * @param y - Row
 * @param val - Value to set
 */
export function ds_grid_set(id: number, x: number, y: number, val: number): void {
    const g = _get(id)
    if (!_in_bounds(g, x, y)) return
    g.data[_idx(g, x, y)] = val
}

/**
 * Adds a value to the cell at (x, y).
 * @param id - Grid ID
 * @param x - Column
 * @param y - Row
 * @param val - Amount to add
 */
export function ds_grid_add(id: number, x: number, y: number, val: number): void {
    const g = _get(id)
    if (!_in_bounds(g, x, y)) return
    g.data[_idx(g, x, y)] += val
}

/**
 * Multiplies the value at (x, y) by a factor.
 * @param id - Grid ID
 * @param x - Column
 * @param y - Row
 * @param factor - Multiplier
 */
export function ds_grid_multiply(id: number, x: number, y: number, factor: number): void {
    const g = _get(id)
    if (!_in_bounds(g, x, y)) return
    g.data[_idx(g, x, y)] *= factor
}

/**
 * Sets all cells in the grid to the given value.
 * @param id - Grid ID
 * @param val - Value to fill with
 */
export function ds_grid_clear(id: number, val: number): void {
    _get(id).data.fill(val)
}

/** Returns the width (column count) of the grid. */
export function ds_grid_width(id: number): number {
    return _get(id).w
}

/** Returns the height (row count) of the grid. */
export function ds_grid_height(id: number): number {
    return _get(id).h
}

/**
 * Copies one grid into another. Both must have the same dimensions.
 * @param src - Source grid ID
 * @param dst - Destination grid ID
 */
export function ds_grid_copy(src: number, dst: number): void {
    const s = _get(src)
    const d = _get(dst)
    if (s.w !== d.w || s.h !== d.h) throw new Error('ds_grid_copy: grids must have identical dimensions')
    d.data = [...s.data]
}

/**
 * Returns values in a rectangular region as a flat array (row-major).
 * Clamps to grid boundaries; out-of-bounds cells return 0.
 * @param id - Grid ID
 * @param x1 - Left column
 * @param y1 - Top row
 * @param x2 - Right column (inclusive)
 * @param y2 - Bottom row (inclusive)
 */
export function ds_grid_region_get(id: number, x1: number, y1: number, x2: number, y2: number): number[] {
    const g   = _get(id)
    const out: number[] = []
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            out.push(_in_bounds(g, x, y) ? g.data[_idx(g, x, y)] : 0)
        }
    }
    return out
}

/**
 * Sets all cells in a rectangular region to a value.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 * @param val - Value to set
 */
export function ds_grid_set_region(id: number, x1: number, y1: number, x2: number, y2: number, val: number): void {
    const g = _get(id)
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (_in_bounds(g, x, y)) g.data[_idx(g, x, y)] = val
        }
    }
}

/**
 * Adds a value to all cells in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 * @param val - Amount to add
 */
export function ds_grid_add_region(id: number, x1: number, y1: number, x2: number, y2: number, val: number): void {
    const g = _get(id)
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (_in_bounds(g, x, y)) g.data[_idx(g, x, y)] += val
        }
    }
}

/**
 * Multiplies all cells in a rectangular region by a factor.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 * @param factor - Multiplier
 */
export function ds_grid_multiply_region(id: number, x1: number, y1: number, x2: number, y2: number, factor: number): void {
    const g = _get(id)
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (_in_bounds(g, x, y)) g.data[_idx(g, x, y)] *= factor
        }
    }
}

/**
 * Returns the maximum value in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
export function ds_grid_get_max(id: number, x1: number, y1: number, x2: number, y2: number): number {
    const g = _get(id)
    let max = -Infinity
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (_in_bounds(g, x, y)) max = Math.max(max, g.data[_idx(g, x, y)])
        }
    }
    return max
}

/**
 * Returns the minimum value in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
export function ds_grid_get_min(id: number, x1: number, y1: number, x2: number, y2: number): number {
    const g = _get(id)
    let min = Infinity
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (_in_bounds(g, x, y)) min = Math.min(min, g.data[_idx(g, x, y)])
        }
    }
    return min
}

/**
 * Returns the sum of all values in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
export function ds_grid_get_sum(id: number, x1: number, y1: number, x2: number, y2: number): number {
    const g = _get(id)
    let sum = 0
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (_in_bounds(g, x, y)) sum += g.data[_idx(g, x, y)]
        }
    }
    return sum
}

/**
 * Returns the mean (average) of all values in a rectangular region.
 * @param id - Grid ID
 * @param x1 - Left
 * @param y1 - Top
 * @param x2 - Right (inclusive)
 * @param y2 - Bottom (inclusive)
 */
export function ds_grid_get_mean(id: number, x1: number, y1: number, x2: number, y2: number): number {
    const count = (x2 - x1 + 1) * (y2 - y1 + 1)
    if (count <= 0) return 0
    return ds_grid_get_sum(id, x1, y1, x2, y2) / count
}

/** Returns true if the grid ID exists. */
export function ds_grid_exists(id: number): boolean {
    return _grids.has(id)
}
