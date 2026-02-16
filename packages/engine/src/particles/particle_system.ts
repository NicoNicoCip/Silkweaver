/**
 * Particle system — manages a pool of live particles and renders them.
 *
 * Mirrors the GMS part_system_* API.
 *
 * One particle system holds all particles created by its emitters.
 * Call part_system_update() each step and part_system_draw() in the draw event.
 *
 * Rendering uses the engine's 2D renderer (draw_rectangle / draw_circle style
 * primitives via the renderer's batch API).  Shapes are drawn as simple
 * colored rectangles/circles — a sprite atlas approach is left for future work.
 */

import { part_type_get_def, type part_type_def } from './particle_type.js'
import { renderer } from '../drawing/renderer.js'

// =========================================================================
// Live particle
// =========================================================================

interface live_particle {
    type_id:  number

    // Position / motion
    x:        number
    y:        number
    spd:      number    // Current speed (pixels/step)
    dir:      number    // Current direction (degrees)
    ang:      number    // Current orientation (degrees)

    // Per-step deltas (from type def, can have wiggle applied each step)
    spd_incr: number
    dir_incr: number
    ang_incr: number
    size:     number
    size_incr: number

    // Life
    life:     number    // Remaining steps
    life_max: number    // Initial lifetime

    // Color / alpha (current)
    r:        number
    g:        number
    b:        number
    alpha:    number

    // Flags
    additive: boolean
}

// =========================================================================
// System internals
// =========================================================================

interface part_system_def {
    particles:    live_particle[]
    depth:        number      // Draw depth (lower = drawn on top)
    persistent:   boolean     // True = survives room changes
    auto_update:  boolean     // True = update called automatically each step
    auto_draw:    boolean     // True = draw called automatically each draw event
}

const _systems: Map<number, part_system_def> = new Map()
let _next_system_id = 1

// =========================================================================
// Colour helpers (BGR ↔ r/g/b floats)
// =========================================================================

function _bgr_to_rgb(bgr: number): [number, number, number] {
    const b = ((bgr >> 16) & 0xFF) / 255
    const g = ((bgr >>  8) & 0xFF) / 255
    const r =  (bgr        & 0xFF) / 255
    return [r, g, b]
}

function _lerp_color(c1: number, c2: number, t: number): [number, number, number] {
    const [r1, g1, b1] = _bgr_to_rgb(c1)
    const [r2, g2, b2] = _bgr_to_rgb(c2)
    return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]
}

function _lerp3_color(c1: number, c2: number, c3: number, t: number): [number, number, number] {
    if (t < 0.5) return _lerp_color(c1, c2, t * 2)
    return _lerp_color(c2, c3, (t - 0.5) * 2)
}

function _lerp3(a: number, b: number, c: number, t: number): number {
    if (t < 0.5) return a + (b - a) * (t * 2)
    return b + (c - b) * ((t - 0.5) * 2)
}

// =========================================================================
// Particle spawning
// =========================================================================

function _rand_range(lo: number, hi: number): number {
    return lo + Math.random() * (hi - lo)
}

/** Creates a single live particle from a type at position (x, y). */
export function _spawn_particle(sys: part_system_def, type_id: number, x: number, y: number): void {
    const def = part_type_get_def(type_id)
    if (!def) return

    const life     = Math.round(_rand_range(def.life1, def.life2))
    const spd      = _rand_range(def.speed1, def.speed2)
    const dir      = _rand_range(def.dir1,   def.dir2)
    const size     = _rand_range(def.size1,  def.size2)
    const ang      = _rand_range(def.ang1,   def.ang2)
    const [r, g, b] = _bgr_to_rgb(def.color1)

    sys.particles.push({
        type_id,
        x, y, spd, dir, ang,
        spd_incr:  def.speed_incr,
        dir_incr:  def.dir_incr,
        ang_incr:  def.ang_incr,
        size,
        size_incr: def.size_incr,
        life,
        life_max:  life,
        r, g, b,
        alpha:     def.alpha1,
        additive:  def.additive,
    })
}

// =========================================================================
// Public GMS-style API — system management
// =========================================================================

/** Returns the raw system state object for internal use by particle_emitter.ts. */
export function _get_system_raw(system_id: number): part_system_def | undefined {
    return _systems.get(system_id)
}

/** Creates a new particle system and returns its ID. */
export function part_system_create(): number {
    const id = _next_system_id++
    _systems.set(id, { particles: [], depth: 0, persistent: false, auto_update: true, auto_draw: true })
    return id
}

/** Destroys a particle system and all its particles. */
export function part_system_destroy(system_id: number): void {
    _systems.delete(system_id)
}

/** Returns true if the system ID is valid. */
export function part_system_exists(system_id: number): boolean {
    return _systems.has(system_id)
}

/** Sets the draw depth of the system. */
export function part_system_depth(system_id: number, depth: number): void {
    const s = _systems.get(system_id); if (s) s.depth = depth
}

/** Clears all live particles from the system without destroying it. */
export function part_system_clear(system_id: number): void {
    const s = _systems.get(system_id); if (s) s.particles = []
}

/** Returns the number of live particles in the system. */
export function part_system_count(system_id: number): number {
    return _systems.get(system_id)?.particles.length ?? 0
}

/**
 * Advances all particles in the system by one step.
 * Handles motion, lifetime, per-step sub-emitters, and death sub-emitters.
 * @param system_id - System ID
 */
export function part_system_update(system_id: number): void {
    const sys = _systems.get(system_id)
    if (!sys) return

    const to_spawn: Array<{ type_id: number; x: number; y: number }> = []
    const alive: live_particle[] = []

    for (const p of sys.particles) {
        // Motion
        const rad = p.dir * (Math.PI / 180)
        p.x   += Math.cos(rad) * p.spd
        p.y   -= Math.sin(rad) * p.spd  // Y-down: subtract (dir 90 = up in GMS)

        // Apply gravity from type def
        const def = part_type_get_def(p.type_id)
        if (def && def.grav_amount !== 0) {
            const grad = def.grav_dir * (Math.PI / 180)
            p.spd     += Math.cos(grad - rad) * def.grav_amount
            p.dir     += Math.asin(
                Math.max(-1, Math.min(1, Math.sin(grad - rad))) * def.grav_amount / Math.max(p.spd, 0.001)
            ) * (180 / Math.PI)
        }

        // Per-step deltas + wiggle
        p.spd  = Math.max(0, p.spd + p.spd_incr + (def ? _rand_range(-def.speed_wiggle, def.speed_wiggle) : 0))
        p.dir +=  p.dir_incr + (def ? _rand_range(-def.dir_wiggle, def.dir_wiggle) : 0)
        p.ang +=  p.ang_incr + (def ? _rand_range(-def.ang_wiggle, def.ang_wiggle) : 0)
        p.size = Math.max(0, p.size + p.size_incr + (def ? _rand_range(-def.size_wiggle, def.size_wiggle) : 0))

        // Colour / alpha interpolation
        if (def) {
            const t = 1 - p.life / p.life_max
            const [r, g, b] = _lerp3_color(def.color1, def.color2, def.color3, t)
            p.r = r; p.g = g; p.b = b
            p.alpha = _lerp3(def.alpha1, def.alpha2, def.alpha3, t)
        }

        // Step sub-emitter
        if (def && def.step_type_id >= 0 && def.step_number > 0) {
            for (let i = 0; i < def.step_number; i++) {
                to_spawn.push({ type_id: def.step_type_id, x: p.x, y: p.y })
            }
        }

        p.life--
        if (p.life > 0) {
            alive.push(p)
        } else {
            // Death sub-emitter
            if (def && def.death_type_id >= 0 && def.death_number > 0) {
                for (let i = 0; i < def.death_number; i++) {
                    to_spawn.push({ type_id: def.death_type_id, x: p.x, y: p.y })
                }
            }
        }
    }

    sys.particles = alive

    // Spawn queued sub-particles after iterating (avoids mutating array during loop)
    for (const s of to_spawn) _spawn_particle(sys, s.type_id, s.x, s.y)
}

/**
 * Draws all particles in the system using the engine renderer.
 * Must be called from within a draw event (after renderer.begin_frame).
 * @param system_id - System ID
 */
export function part_system_draw(system_id: number): void {
    const sys = _systems.get(system_id)
    if (!sys) return

    // Save renderer color/alpha state
    const saved_color = renderer.get_color()
    const saved_alpha = renderer.get_alpha()

    for (const p of sys.particles) {
        if (p.alpha <= 0 || p.size <= 0) continue

        // Pack current particle color as BGR integer
        const ri = Math.round(p.r * 255)
        const gi = Math.round(p.g * 255)
        const bi = Math.round(p.b * 255)
        const color = (bi << 16) | (gi << 8) | ri

        renderer.set_color(color)
        renderer.set_alpha(p.alpha)

        const half = p.size * 0.5
        renderer.draw_rectangle(p.x - half, p.y - half, p.x + half, p.y + half, false)
    }

    // Restore renderer state
    renderer.set_color(saved_color)
    renderer.set_alpha(saved_alpha)
}
