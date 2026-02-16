/**
 * Particle emitter — spawns particles into a particle system.
 *
 * Mirrors the GMS part_emitter_* API.
 *
 * An emitter belongs to a system and defines:
 *   - A region (point, rectangle, ellipse, diamond) where particles spawn
 *   - A distribution within that region (linear, Gaussian, inv_Gaussian)
 *   - Burst and stream modes
 */

import { _spawn_particle, _get_system_raw } from './particle_system.js'

// =========================================================================
// Region shape constants
// =========================================================================

export const ps_shape_rectangle = 0   // Axis-aligned rectangle
export const ps_shape_ellipse   = 1   // Ellipse region
export const ps_shape_diamond   = 2   // Diamond (rhombus)
export const ps_shape_line      = 3   // Line between two points

// Distribution constants
export const ps_distr_linear       = 0  // Uniform random within region
export const ps_distr_gaussian     = 1  // Gaussian centred on region centre
export const ps_distr_inv_gaussian = 2  // Inverse Gaussian (clustered near edge)

// =========================================================================
// Emitter internals
// =========================================================================

interface emitter_def {
    system_id:  number
    x1:         number  // Region left / x1
    y1:         number  // Region top  / y1
    x2:         number  // Region right / x2
    y2:         number  // Region bottom / y2
    shape:      number  // ps_shape_*
    distr:      number  // ps_distr_*
}

// Registry: emitter_id → def
// Emitters are associated with the system stored in their def.
const _emitters: Map<number, emitter_def> = new Map()
let _next_emitter_id = 1

// =========================================================================
// Region sampling helpers
// =========================================================================

/** Returns a random point inside the emitter region. */
function _sample_region(e: emitter_def): { x: number; y: number } {
    const cx = (e.x1 + e.x2) * 0.5
    const cy = (e.y1 + e.y2) * 0.5
    const hw  = (e.x2 - e.x1) * 0.5
    const hh  = (e.y2 - e.y1) * 0.5

    let u = Math.random()  // [0, 1)
    let v = Math.random()

    // Apply distribution
    if (e.distr === ps_distr_gaussian) {
        u = _gaussian()
        v = _gaussian()
    } else if (e.distr === ps_distr_inv_gaussian) {
        u = 1 - _gaussian()
        v = 1 - _gaussian()
    }

    switch (e.shape) {
        case ps_shape_rectangle:
            return { x: e.x1 + u * (e.x2 - e.x1), y: e.y1 + v * (e.y2 - e.y1) }

        case ps_shape_ellipse: {
            // Uniform distribution inside ellipse: rejection or sqrt method
            const ang = u * 2 * Math.PI
            const rad = Math.sqrt(v)
            return { x: cx + Math.cos(ang) * rad * hw, y: cy + Math.sin(ang) * rad * hh }
        }

        case ps_shape_diamond: {
            // Map unit square to diamond via |x|+|y|<=1 rejection
            let dx = u * 2 - 1
            let dy = v * 2 - 1
            if (Math.abs(dx) + Math.abs(dy) > 1) {
                dx = (dx > 0 ? 1 : -1) - dx
                dy = (dy > 0 ? 1 : -1) - dy
            }
            return { x: cx + dx * hw, y: cy + dy * hh }
        }

        case ps_shape_line: {
            // Uniform along the line segment
            return { x: e.x1 + u * (e.x2 - e.x1), y: e.y1 + u * (e.y2 - e.y1) }
        }

        default:
            return { x: cx, y: cy }
    }
}

/** Box-Muller transform clamped to [0, 1]. */
function _gaussian(): number {
    const u = Math.random() || 1e-10
    const v = Math.random()
    const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    // Map N(0,1) → [0,1]: use (g / 6 + 0.5) clamped
    return Math.max(0, Math.min(1, g / 6 + 0.5))
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new emitter attached to a particle system.
 * @param system_id - System ID to spawn particles into
 * @returns Emitter ID
 */
export function part_emitter_create(system_id: number): number {
    const id = _next_emitter_id++
    _emitters.set(id, {
        system_id,
        x1: 0, y1: 0, x2: 0, y2: 0,
        shape: ps_shape_rectangle,
        distr: ps_distr_linear,
    })
    return id
}

/**
 * Destroys an emitter.
 * @param emitter_id - Emitter ID
 */
export function part_emitter_destroy(emitter_id: number): void {
    _emitters.delete(emitter_id)
}

/** Returns true if the emitter ID is valid. */
export function part_emitter_exists(emitter_id: number): boolean {
    return _emitters.has(emitter_id)
}

/**
 * Sets the region and distribution for an emitter.
 * @param emitter_id - Emitter ID
 * @param x1 - Region left
 * @param y1 - Region top
 * @param x2 - Region right
 * @param y2 - Region bottom
 * @param shape - ps_shape_* constant
 * @param distr - ps_distr_* constant
 */
export function part_emitter_region(
    emitter_id: number,
    x1: number, y1: number, x2: number, y2: number,
    shape: number, distr: number,
): void {
    const e = _emitters.get(emitter_id)
    if (!e) return
    e.x1 = x1; e.y1 = y1; e.x2 = x2; e.y2 = y2
    e.shape = shape; e.distr = distr
}

/**
 * Spawns a single burst of particles from an emitter.
 * @param emitter_id - Emitter ID
 * @param type_id - Particle type ID
 * @param number - Number of particles to spawn
 */
export function part_emitter_burst(emitter_id: number, type_id: number, number: number): void {
    const e = _emitters.get(emitter_id)
    if (!e) return
    const sys_entry = _get_system(e.system_id)
    if (!sys_entry) return
    for (let i = 0; i < number; i++) {
        const pos = _sample_region(e)
        _spawn_particle(sys_entry, type_id, pos.x, pos.y)
    }
}

/**
 * Spawns a continuous stream of particles (call each step).
 * Internally identical to burst — the caller is responsible for calling each step.
 * @param emitter_id - Emitter ID
 * @param type_id - Particle type ID
 * @param number - Number of particles to spawn this step
 */
export function part_emitter_stream(emitter_id: number, type_id: number, number: number): void {
    part_emitter_burst(emitter_id, type_id, number)
}

function _get_system(system_id: number) {
    return _get_system_raw(system_id)
}
