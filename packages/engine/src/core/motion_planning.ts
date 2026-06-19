/**
 * Motion planning (GMS `mp_*`).
 *
 * - `mp_grid_*` — a grid of free/blocked cells + A* pathfinding that writes waypoints into a
 *   path resource (`mp_grid_path`).
 * - `mp_potential_settings` — tuning for the instance-side `mp_potential_step` (in instance.ts).
 *
 * The per-instance steppers `mp_linear_step` / `mp_potential_step` live on the `instance` class
 * since they move the calling instance.
 */

import { game_loop } from './game_loop.js'
import type { instance } from './instance.js'
import { object_match } from './instance.js'
import { path_clear_points, path_add_point } from './path.js'

// =========================================================================
// Grid registry
// =========================================================================

interface mp_grid {
    left:       number
    top:        number
    hcells:     number
    vcells:     number
    cellwidth:  number
    cellheight: number
    cells:      Uint8Array   // hcells*vcells, 1 = blocked, 0 = free
}

const _grids = new Map<number, mp_grid>()
let _next_grid_id = 1

function _idx(g: mp_grid, h: number, v: number): number {
    return v * g.hcells + h
}

function _cell_at(g: mp_grid, room_x: number, room_y: number): { h: number; v: number } | null {
    const h = Math.floor((room_x - g.left) / g.cellwidth)
    const v = Math.floor((room_y - g.top)  / g.cellheight)
    if (h < 0 || v < 0 || h >= g.hcells || v >= g.vcells) return null
    return { h, v }
}

function _cell_center(g: mp_grid, h: number, v: number): { x: number; y: number } {
    return { x: g.left + (h + 0.5) * g.cellwidth, y: g.top + (v + 0.5) * g.cellheight }
}

// =========================================================================
// Grid API
// =========================================================================

/**
 * Creates a motion-planning grid covering a region of the room.
 * @returns Grid id
 */
export function mp_grid_create(left: number, top: number, hcells: number, vcells: number, cellwidth: number, cellheight: number): number {
    const id = _next_grid_id++
    _grids.set(id, { left, top, hcells, vcells, cellwidth, cellheight, cells: new Uint8Array(hcells * vcells) })
    return id
}

/** Frees a grid. */
export function mp_grid_destroy(grid_id: number): void {
    _grids.delete(grid_id)
}

/** Marks every cell of the grid as free. */
export function mp_grid_clear_all(grid_id: number): void {
    _grids.get(grid_id)?.cells.fill(0)
}

/** Marks a single cell as free. */
export function mp_grid_clear_cell(grid_id: number, h: number, v: number): void {
    const g = _grids.get(grid_id)
    if (g && h >= 0 && v >= 0 && h < g.hcells && v < g.vcells) g.cells[_idx(g, h, v)] = 0
}

/** Marks a single cell as blocked (forbidden). */
export function mp_grid_add_cell(grid_id: number, h: number, v: number): void {
    const g = _grids.get(grid_id)
    if (g && h >= 0 && v >= 0 && h < g.hcells && v < g.vcells) g.cells[_idx(g, h, v)] = 1
}

/** Returns -1 if the cell is blocked, 0 if free, or -1 if out of range. */
export function mp_grid_get_cell(grid_id: number, h: number, v: number): number {
    const g = _grids.get(grid_id)
    if (!g || h < 0 || v < 0 || h >= g.hcells || v >= g.vcells) return -1
    return g.cells[_idx(g, h, v)] ? -1 : 0
}

function _rect_cells(g: mp_grid, x1: number, y1: number, x2: number, y2: number, value: number): void {
    const h1 = Math.max(0, Math.floor((Math.min(x1, x2) - g.left) / g.cellwidth))
    const v1 = Math.max(0, Math.floor((Math.min(y1, y2) - g.top)  / g.cellheight))
    const h2 = Math.min(g.hcells - 1, Math.floor((Math.max(x1, x2) - g.left) / g.cellwidth))
    const v2 = Math.min(g.vcells - 1, Math.floor((Math.max(y1, y2) - g.top)  / g.cellheight))
    for (let v = v1; v <= v2; v++) for (let h = h1; h <= h2; h++) g.cells[_idx(g, h, v)] = value
}

/** Marks all cells overlapping a room-space rectangle as blocked. */
export function mp_grid_add_rectangle(grid_id: number, x1: number, y1: number, x2: number, y2: number): void {
    const g = _grids.get(grid_id); if (g) _rect_cells(g, x1, y1, x2, y2, 1)
}

/** Marks all cells overlapping a room-space rectangle as free. */
export function mp_grid_clear_rectangle(grid_id: number, x1: number, y1: number, x2: number, y2: number): void {
    const g = _grids.get(grid_id); if (g) _rect_cells(g, x1, y1, x2, y2, 0)
}

/**
 * Blocks every cell covered by an instance of `obj` in the current room (by bounding box).
 * @param prec - Reserved for precise (per-pixel) masks; currently bbox-based
 */
export function mp_grid_add_instances(grid_id: number, obj: typeof instance, _prec: boolean = false): void {
    const g = _grids.get(grid_id)
    const room = game_loop.room
    if (!g || !room) return
    for (const inst of room.instance_get_all()) {
        if (!object_match(inst, obj) || !inst.active) continue
        _rect_cells(g, inst.bbox_left, inst.bbox_top, inst.bbox_right, inst.bbox_bottom, 1)
    }
}

// =========================================================================
// A* pathfinding
// =========================================================================

/**
 * Computes an A* path through free cells and stores the waypoints (cell centres) in `path_id`.
 * @param allowdiag - Permit diagonal moves
 * @returns True if a path was found
 */
export function mp_grid_path(
    grid_id: number, path_id: number,
    xstart: number, ystart: number, xgoal: number, ygoal: number, allowdiag: boolean,
): boolean {
    const g = _grids.get(grid_id); if (!g) return false
    const start = _cell_at(g, xstart, ystart)
    const goal  = _cell_at(g, xgoal,  ygoal)
    if (!start || !goal) return false
    if (g.cells[_idx(g, goal.h, goal.v)]) return false   // goal blocked → unreachable

    const W = g.hcells, H = g.vcells
    const node = (h: number, v: number) => v * W + h
    const start_n = node(start.h, start.v)
    const goal_n  = node(goal.h, goal.v)

    const came  = new Map<number, number>()
    const gcost = new Map<number, number>([[start_n, 0]])
    const open  = new Set<number>([start_n])

    const hx = (n: number) => { const h = n % W, v = (n - h) / W; return Math.hypot(h - goal.h, v - goal.v) }

    const neigh: [number, number, number][] = allowdiag
        ? [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]]
        : [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1]]

    while (open.size > 0) {
        // pick the open node with the lowest f = g + h
        let cur = -1, best = Infinity
        for (const n of open) { const f = (gcost.get(n) ?? Infinity) + hx(n); if (f < best) { best = f; cur = n } }
        if (cur === goal_n) break
        open.delete(cur)
        const ch = cur % W, cv = (cur - ch) / W
        for (const [dh, dv, cost] of neigh) {
            const nh = ch + dh, nv = cv + dv
            if (nh < 0 || nv < 0 || nh >= W || nv >= H) continue
            if (g.cells[_idx(g, nh, nv)]) continue   // blocked
            const nn = node(nh, nv)
            const tentative = (gcost.get(cur) ?? Infinity) + cost
            if (tentative < (gcost.get(nn) ?? Infinity)) {
                came.set(nn, cur)
                gcost.set(nn, tentative)
                open.add(nn)
            }
        }
    }

    if (!came.has(goal_n) && start_n !== goal_n) return false

    // Reconstruct and store as path points (cell centres).
    const cells: number[] = []
    let n = goal_n
    cells.push(n)
    while (n !== start_n) { const p = came.get(n); if (p === undefined) break; n = p; cells.push(n) }
    cells.reverse()

    path_clear_points(path_id)
    for (const c of cells) {
        const h = c % W, v = (c - h) / W
        const ctr = _cell_center(g, h, v)
        path_add_point(path_id, ctr.x, ctr.y, 1)
    }
    return true
}

// =========================================================================
// Potential-step settings (consumed by instance.mp_potential_step)
// =========================================================================

const _potential = { maxrot: 180, rotstep: 15 }

/**
 * Tunes `mp_potential_step`'s obstacle-avoidance sweep.
 * @param maxrot - Maximum heading deviation searched (degrees)
 * @param rotstep - Angular step of the search (degrees)
 * @param _ahead - GMS look-ahead (reserved)
 * @param _onspot - GMS rotate-on-spot (reserved)
 */
export function mp_potential_settings(maxrot: number, rotstep: number, _ahead: number = 0, _onspot: boolean = true): void {
    _potential.maxrot  = Math.max(0, maxrot)
    _potential.rotstep = Math.max(1, rotstep)
}

/** Internal: current potential-step settings (read by instance.mp_potential_step). */
export function _mp_potential_settings(): { maxrot: number; rotstep: number } {
    return _potential
}
