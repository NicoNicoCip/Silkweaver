/**
 * Physics body and fixture system — wraps matter.js Body.
 *
 * Fixture shapes: rectangle, circle, polygon (convex hull).
 * Bodies can be dynamic, static, or kinematic.
 *
 * Positions are in room pixel space.
 * The px_per_metre scale factor converts to matter.js metre space.
 *
 * GMS-compatible API:
 *   physics_fixture_create / physics_fixture_set_* / physics_fixture_bind /
 *   physics_fixture_delete / physics_body_apply_force /
 *   physics_body_apply_impulse / physics_body_set_velocity /
 *   physics_body_get_* / physics_body_set_*
 */

import Matter from 'matter-js'
import { _get_world } from './physics_world.js'

// =========================================================================
// Fixture definition
// =========================================================================

const FIXTURE_SHAPE_RECT    = 0
const FIXTURE_SHAPE_CIRCLE  = 1
const FIXTURE_SHAPE_POLYGON = 2

interface fixture_def {
    shape:      number
    w:          number    // rect: half-width, circle: radius, polygon: unused
    h:          number    // rect: half-height
    verts:      Matter.Vector[]  // polygon vertices
    density:    number
    restitution: number   // bounce (0–1)
    friction:    number
    is_sensor:  boolean   // true = no collision response (trigger only)
}

const _fixtures: Map<number, fixture_def> = new Map()
let _next_fixture_id = 1

function _make_default_fixture(): fixture_def {
    return {
        shape: FIXTURE_SHAPE_RECT,
        w: 16, h: 16, verts: [],
        density: 0.001, restitution: 0, friction: 0.1,
        is_sensor: false,
    }
}

// =========================================================================
// Body registry (numeric handle → matter.js Body)
// =========================================================================

const _bodies: Map<number, Matter.Body> = new Map()
let _next_body_id = 1

// =========================================================================
// Fixture API
// =========================================================================

/**
 * Creates a new fixture definition and returns its ID.
 * Configure the fixture with physics_fixture_set_* before binding it.
 * @returns Fixture ID
 */
export function physics_fixture_create(): number {
    const id = _next_fixture_id++
    _fixtures.set(id, _make_default_fixture())
    return id
}

/**
 * Sets the fixture shape to a box.
 * @param fixture_id - Fixture ID
 * @param w - Width in pixels
 * @param h - Height in pixels
 */
export function physics_fixture_set_box(fixture_id: number, w: number, h: number): void {
    const f = _fixtures.get(fixture_id)
    if (!f) return
    f.shape = FIXTURE_SHAPE_RECT
    f.w = w
    f.h = h
}

/**
 * Sets the fixture shape to a circle.
 * @param fixture_id - Fixture ID
 * @param radius - Radius in pixels
 */
export function physics_fixture_set_circle(fixture_id: number, radius: number): void {
    const f = _fixtures.get(fixture_id)
    if (!f) return
    f.shape = FIXTURE_SHAPE_CIRCLE
    f.w = radius
}

/**
 * Sets the fixture shape to a convex polygon.
 * @param fixture_id - Fixture ID
 * @param verts - Array of {x, y} vertices in pixel space
 */
export function physics_fixture_set_polygon(fixture_id: number, verts: { x: number; y: number }[]): void {
    const f = _fixtures.get(fixture_id)
    if (!f) return
    f.shape = FIXTURE_SHAPE_POLYGON
    f.verts = verts.map(v => ({ x: v.x, y: v.y }))
}

/**
 * Sets the density of a fixture (affects mass).
 * @param fixture_id - Fixture ID
 * @param density - Density value (default 0.001)
 */
export function physics_fixture_set_density(fixture_id: number, density: number): void {
    const f = _fixtures.get(fixture_id)
    if (f) f.density = density
}

/**
 * Sets the restitution (bounciness) of a fixture.
 * @param fixture_id - Fixture ID
 * @param restitution - Value 0 (no bounce) to 1 (full bounce)
 */
export function physics_fixture_set_restitution(fixture_id: number, restitution: number): void {
    const f = _fixtures.get(fixture_id)
    if (f) f.restitution = Math.max(0, Math.min(1, restitution))
}

/**
 * Sets the friction of a fixture.
 * @param fixture_id - Fixture ID
 * @param friction - Friction coefficient (0 = frictionless, 1 = high friction)
 */
export function physics_fixture_set_friction(fixture_id: number, friction: number): void {
    const f = _fixtures.get(fixture_id)
    if (f) f.friction = Math.max(0, friction)
}

/**
 * Sets whether a fixture is a sensor (detects overlaps without physical response).
 * @param fixture_id - Fixture ID
 * @param is_sensor - True for sensor, false for solid
 */
export function physics_fixture_set_sensor(fixture_id: number, is_sensor: boolean): void {
    const f = _fixtures.get(fixture_id)
    if (f) f.is_sensor = is_sensor
}

/**
 * Creates a physics body from a fixture at the given position.
 * @param fixture_id - Fixture ID to use as the body's shape
 * @param x - Initial X position in room pixels
 * @param y - Initial Y position in room pixels
 * @param is_static - True for static (immovable) body
 * @returns Body ID, or -1 if the world is not created
 */
export function physics_fixture_bind(fixture_id: number, x: number, y: number, is_static: boolean = false): number {
    const world = _get_world()
    if (!world) return -1
    const f = _fixtures.get(fixture_id)
    if (!f) return -1

    let body: Matter.Body

    switch (f.shape) {
        case FIXTURE_SHAPE_CIRCLE:
            body = Matter.Bodies.circle(x, y, f.w, {
                density:     f.density,
                restitution: f.restitution,
                friction:    f.friction,
                isStatic:    is_static,
                isSensor:    f.is_sensor,
            })
            break

        case FIXTURE_SHAPE_POLYGON:
            body = Matter.Bodies.fromVertices(x, y, f.verts, {
                density:     f.density,
                restitution: f.restitution,
                friction:    f.friction,
                isStatic:    is_static,
                isSensor:    f.is_sensor,
            })
            break

        default: // RECT
            body = Matter.Bodies.rectangle(x, y, f.w, f.h, {
                density:     f.density,
                restitution: f.restitution,
                friction:    f.friction,
                isStatic:    is_static,
                isSensor:    f.is_sensor,
            })
    }

    Matter.World.add(world, body)

    const id = _next_body_id++
    _bodies.set(id, body)
    // Store our handle on the body for collision callbacks
    ;(body as any)._sw_id = id
    return id
}

/**
 * Frees a fixture definition. Bodies already created from it are unaffected.
 * @param fixture_id - Fixture ID
 */
export function physics_fixture_delete(fixture_id: number): void {
    _fixtures.delete(fixture_id)
}

// =========================================================================
// Body control API
// =========================================================================

/**
 * Destroys a physics body and removes it from the world.
 * @param body_id - Body ID returned by physics_fixture_bind
 */
export function physics_body_destroy(body_id: number): void {
    const world = _get_world()
    const body  = _bodies.get(body_id)
    if (!body) return
    if (world) Matter.World.remove(world, body)
    _bodies.delete(body_id)
}

/**
 * Applies a continuous force to a body at its centre.
 * @param body_id - Body ID
 * @param fx - Force X (pixel-space units)
 * @param fy - Force Y (pixel-space units)
 */
export function physics_body_apply_force(body_id: number, fx: number, fy: number): void {
    const body = _bodies.get(body_id)
    if (!body) return
    Matter.Body.applyForce(body, body.position, { x: fx, y: fy })
}

/**
 * Applies an impulse (instant velocity change) at the body's centre.
 * @param body_id - Body ID
 * @param ix - Impulse X
 * @param iy - Impulse Y
 */
export function physics_body_apply_impulse(body_id: number, ix: number, iy: number): void {
    const body = _bodies.get(body_id)
    if (!body) return
    const inv_mass = body.mass > 0 ? 1 / body.mass : 0
    Matter.Body.setVelocity(body, {
        x: body.velocity.x + ix * inv_mass,
        y: body.velocity.y + iy * inv_mass,
    })
}

/**
 * Sets the velocity of a body directly.
 * @param body_id - Body ID
 * @param vx - Velocity X in pixels/step
 * @param vy - Velocity Y in pixels/step
 */
export function physics_body_set_velocity(body_id: number, vx: number, vy: number): void {
    const body = _bodies.get(body_id)
    if (!body) return
    Matter.Body.setVelocity(body, { x: vx, y: vy })
}

/**
 * Sets the position of a body directly (teleports without velocity change).
 * @param body_id - Body ID
 * @param x - New X in room pixels
 * @param y - New Y in room pixels
 */
export function physics_body_set_position(body_id: number, x: number, y: number): void {
    const body = _bodies.get(body_id)
    if (!body) return
    Matter.Body.setPosition(body, { x, y })
}

/**
 * Sets the angular velocity of a body.
 * @param body_id - Body ID
 * @param omega - Angular velocity in radians/step
 */
export function physics_body_set_angular_velocity(body_id: number, omega: number): void {
    const body = _bodies.get(body_id)
    if (!body) return
    Matter.Body.setAngularVelocity(body, omega)
}

/** Returns the X position of a body in room pixels. */
export function physics_body_get_x(body_id: number): number {
    return _bodies.get(body_id)?.position.x ?? 0
}

/** Returns the Y position of a body in room pixels. */
export function physics_body_get_y(body_id: number): number {
    return _bodies.get(body_id)?.position.y ?? 0
}

/** Returns the rotation angle of a body in degrees. */
export function physics_body_get_angle(body_id: number): number {
    const body = _bodies.get(body_id)
    if (!body) return 0
    return (body.angle * 180) / Math.PI
}

/** Returns the X velocity of a body. */
export function physics_body_get_vx(body_id: number): number {
    return _bodies.get(body_id)?.velocity.x ?? 0
}

/** Returns the Y velocity of a body. */
export function physics_body_get_vy(body_id: number): number {
    return _bodies.get(body_id)?.velocity.y ?? 0
}

/** Returns the angular velocity of a body in radians/step. */
export function physics_body_get_angular_velocity(body_id: number): number {
    return _bodies.get(body_id)?.angularVelocity ?? 0
}

/**
 * Makes a body static (immovable) or dynamic.
 * @param body_id - Body ID
 * @param is_static - True to make static
 */
export function physics_body_set_static(body_id: number, is_static: boolean): void {
    const body = _bodies.get(body_id)
    if (!body) return
    Matter.Body.setStatic(body, is_static)
}

/** Returns true if the body ID refers to a live body. */
export function physics_body_exists(body_id: number): boolean {
    return _bodies.has(body_id)
}

/**
 * Returns the raw matter.js Body for advanced use.
 * @param body_id - Body ID
 */
export function physics_body_get_raw(body_id: number): Matter.Body | undefined {
    return _bodies.get(body_id)
}
