/**
 * Particle type definitions.
 *
 * A particle type is a template describing how individual particles look and behave.
 * Mirrors the GMS part_type_* API.
 *
 * Particle types are consumed by particle emitters and particle systems.
 * They are shared — one type can be used by many emitters.
 */

// =========================================================================
// Shape constants
// =========================================================================

export const pt_shape_pixel    = 0   // Single pixel
export const pt_shape_disk     = 1   // Filled circle
export const pt_shape_square   = 2   // Filled square
export const pt_shape_line     = 3   // Line oriented along velocity
export const pt_shape_star     = 4   // 6-pointed star
export const pt_shape_circle   = 5   // Outlined circle
export const pt_shape_ring     = 6   // Outlined ring
export const pt_shape_sphere   = 7   // Shaded sphere (gradient disk)
export const pt_shape_flare    = 8   // Bright centre flare
export const pt_shape_spark    = 9   // Short directional spark
export const pt_shape_explosion = 10 // Irregular blob
export const pt_shape_cloud    = 11  // Soft cloud blob
export const pt_shape_smoke    = 12  // Soft smoke blob
export const pt_shape_snow     = 13  // Small snowflake

// =========================================================================
// Particle type data
// =========================================================================

export interface part_type_def {
    // Shape
    shape:        number    // pt_shape_* constant

    // Size (random in [size1, size2], wiggle per step)
    size1:        number
    size2:        number
    size_incr:    number    // Size change per step
    size_wiggle:  number    // Random ± wiggle per step

    // Speed (pixels/step)
    speed1:       number
    speed2:       number
    speed_incr:   number
    speed_wiggle: number

    // Direction (degrees)
    dir1:         number
    dir2:         number
    dir_incr:     number
    dir_wiggle:   number

    // Gravity (pixels/step² added to velocity)
    grav_amount:  number
    grav_dir:     number    // Degrees (270 = down)

    // Orientation (sprite rotation, degrees)
    ang1:         number
    ang2:         number
    ang_incr:     number
    ang_wiggle:   number
    ang_relative: boolean   // True = angle follows velocity direction

    // Lifetime (steps)
    life1:        number
    life2:        number

    // Color (BGR integers, alpha 0–1)
    color1:       number
    color2:       number
    color3:       number    // Third colour stop (interpolated across lifetime)
    alpha1:       number
    alpha2:       number
    alpha3:       number

    // Blending
    additive:     boolean   // True = additive blend

    // Sub-emitter: spawn a burst of another particle type on death
    death_type_id:   number  // -1 = none
    death_number:    number
    step_type_id:    number  // -1 = none, spawned each step
    step_number:     number
}

const _types: Map<number, part_type_def> = new Map()
let _next_type_id = 1

function _make_default(): part_type_def {
    return {
        shape:        pt_shape_pixel,
        size1: 1,     size2: 1,    size_incr: 0,  size_wiggle: 0,
        speed1: 0,    speed2: 0,   speed_incr: 0, speed_wiggle: 0,
        dir1: 0,      dir2: 360,   dir_incr: 0,   dir_wiggle: 0,
        grav_amount: 0, grav_dir: 270,
        ang1: 0,      ang2: 0,     ang_incr: 0,   ang_wiggle: 0,  ang_relative: false,
        life1: 30,    life2: 30,
        color1: 0xFFFFFF, color2: 0xFFFFFF, color3: 0xFFFFFF,
        alpha1: 1,    alpha2: 1,   alpha3: 0,
        additive: false,
        death_type_id: -1, death_number: 0,
        step_type_id:  -1, step_number:  0,
    }
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/** Creates a new particle type and returns its ID. */
export function part_type_create(): number {
    const id = _next_type_id++
    _types.set(id, _make_default())
    return id
}

/** Destroys a particle type. */
export function part_type_destroy(type_id: number): void {
    _types.delete(type_id)
}

/** Returns true if the particle type ID is valid. */
export function part_type_exists(type_id: number): boolean {
    return _types.has(type_id)
}

/** Sets the shape of particles of this type. */
export function part_type_shape(type_id: number, shape: number): void {
    const t = _types.get(type_id); if (t) t.shape = shape
}

/** Sets the size range and per-step variation. */
export function part_type_size(type_id: number, size_min: number, size_max: number, size_incr: number, size_wiggle: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.size1 = size_min; t.size2 = size_max
    t.size_incr = size_incr; t.size_wiggle = size_wiggle
}

/** Sets the speed range and per-step variation. */
export function part_type_speed(type_id: number, speed_min: number, speed_max: number, speed_incr: number, speed_wiggle: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.speed1 = speed_min; t.speed2 = speed_max
    t.speed_incr = speed_incr; t.speed_wiggle = speed_wiggle
}

/** Sets the direction range and per-step variation (degrees). */
export function part_type_direction(type_id: number, dir_min: number, dir_max: number, dir_incr: number, dir_wiggle: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.dir1 = dir_min; t.dir2 = dir_max
    t.dir_incr = dir_incr; t.dir_wiggle = dir_wiggle
}

/** Sets the gravity applied to particles (amount in pixels/step², direction in degrees). */
export function part_type_gravity(type_id: number, amount: number, direction: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.grav_amount = amount; t.grav_dir = direction
}

/** Sets the orientation (angle) range and variation. */
export function part_type_orientation(type_id: number, ang_min: number, ang_max: number, ang_incr: number, ang_wiggle: number, ang_relative: boolean): void {
    const t = _types.get(type_id)
    if (!t) return
    t.ang1 = ang_min; t.ang2 = ang_max
    t.ang_incr = ang_incr; t.ang_wiggle = ang_wiggle
    t.ang_relative = ang_relative
}

/** Sets the lifetime range in steps. */
export function part_type_life(type_id: number, life_min: number, life_max: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.life1 = life_min; t.life2 = life_max
}

/** Sets three color stops interpolated over the particle lifetime. */
export function part_type_color3(type_id: number, c1: number, c2: number, c3: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.color1 = c1; t.color2 = c2; t.color3 = c3
}

/** Sets two color stops (shorthand). */
export function part_type_color2(type_id: number, c1: number, c2: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.color1 = c1; t.color2 = c2; t.color3 = c2
}

/** Sets a single constant color. */
export function part_type_color1(type_id: number, c: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.color1 = c; t.color2 = c; t.color3 = c
}

/** Sets three alpha stops interpolated over the particle lifetime. */
export function part_type_alpha3(type_id: number, a1: number, a2: number, a3: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.alpha1 = a1; t.alpha2 = a2; t.alpha3 = a3
}

/** Sets two alpha stops. */
export function part_type_alpha2(type_id: number, a1: number, a2: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.alpha1 = a1; t.alpha2 = a2; t.alpha3 = a2
}

/** Sets a single constant alpha. */
export function part_type_alpha1(type_id: number, a: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.alpha1 = a; t.alpha2 = a; t.alpha3 = a
}

/** Sets whether particles blend additively. */
export function part_type_blend(type_id: number, additive: boolean): void {
    const t = _types.get(type_id); if (t) t.additive = additive
}

/**
 * Sets a sub-emitter that spawns particles on step.
 * @param type_id - Parent type ID
 * @param sub_type_id - Type to spawn (-1 = none)
 * @param number - Number of particles spawned per step
 */
export function part_type_step(type_id: number, sub_type_id: number, number: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.step_type_id = sub_type_id; t.step_number = number
}

/**
 * Sets a sub-emitter that spawns particles when a particle dies.
 * @param type_id - Parent type ID
 * @param sub_type_id - Type to spawn (-1 = none)
 * @param number - Number of particles spawned on death
 */
export function part_type_death(type_id: number, sub_type_id: number, number: number): void {
    const t = _types.get(type_id)
    if (!t) return
    t.death_type_id = sub_type_id; t.death_number = number
}

/** Returns the raw type definition for use by the particle system. */
export function part_type_get_def(type_id: number): part_type_def | undefined {
    return _types.get(type_id)
}
