/**
 * Physics joints — wraps matter.js Constraint.
 *
 * Supports:
 *   - Distance joint: fixed separation between two points
 *   - Revolute joint: bodies rotate around a shared pivot
 *   - Weld joint: bodies locked together (zero stiffness distance constraint)
 *
 * All positions are in room pixel space.
 */

import Matter from 'matter-js'
import { _get_world } from './physics_world.js'
import { physics_body_get_raw } from './physics_body.js'

// =========================================================================
// Joint registry
// =========================================================================

const _joints: Map<number, Matter.Constraint> = new Map()
let _next_joint_id = 1

function _add_constraint(c: Matter.Constraint): number {
    const world = _get_world()
    if (!world) return -1
    Matter.World.add(world, c)
    const id = _next_joint_id++
    _joints.set(id, c)
    return id
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a distance joint between two bodies.
 * The joint maintains (approximately) the distance between the two anchor points.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @param ax - Anchor X on body A in body-local pixels (0 = centre)
 * @param ay - Anchor Y on body A
 * @param bx - Anchor X on body B
 * @param by - Anchor Y on body B
 * @param stiffness - Spring stiffness (0–1; 1 = rigid, <1 = springy)
 * @param damping - Damping ratio (0 = no damping)
 * @returns Joint ID, or -1 on failure
 */
export function physics_joint_distance_create(
    body_a_id:  number,
    body_b_id:  number,
    ax: number, ay: number,
    bx: number, by: number,
    stiffness:  number = 1,
    damping:    number = 0,
): number {
    const ba = physics_body_get_raw(body_a_id)
    const bb = physics_body_get_raw(body_b_id)
    if (!ba || !bb) return -1

    const c = Matter.Constraint.create({
        bodyA:       ba,
        bodyB:       bb,
        pointA:      { x: ax, y: ay },
        pointB:      { x: bx, y: by },
        stiffness,
        damping,
    })
    return _add_constraint(c)
}

/**
 * Creates a revolute (pin) joint — bodies rotate freely around a shared world-space pivot.
 * Implemented as a stiff zero-length distance constraint anchored at the same world point.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @param pivot_x - Pivot X in room pixels
 * @param pivot_y - Pivot Y in room pixels
 * @returns Joint ID, or -1 on failure
 */
export function physics_joint_revolute_create(
    body_a_id: number,
    body_b_id: number,
    pivot_x:   number,
    pivot_y:   number,
): number {
    const ba = physics_body_get_raw(body_a_id)
    const bb = physics_body_get_raw(body_b_id)
    if (!ba || !bb) return -1

    // Local offsets from each body's centre to the pivot
    const local_a = {
        x: pivot_x - ba.position.x,
        y: pivot_y - ba.position.y,
    }
    const local_b = {
        x: pivot_x - bb.position.x,
        y: pivot_y - bb.position.y,
    }

    const c = Matter.Constraint.create({
        bodyA:  ba,
        bodyB:  bb,
        pointA: local_a,
        pointB: local_b,
        length:     0,
        stiffness:  1,
        damping:    0,
    })
    return _add_constraint(c)
}

/**
 * Creates a weld joint — two bodies move as one rigid unit.
 * Implemented as a stiff zero-length distance constraint at their current relative offset.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @returns Joint ID, or -1 on failure
 */
export function physics_joint_weld_create(body_a_id: number, body_b_id: number): number {
    const ba = physics_body_get_raw(body_a_id)
    const bb = physics_body_get_raw(body_b_id)
    if (!ba || !bb) return -1

    const c = Matter.Constraint.create({
        bodyA:     ba,
        bodyB:     bb,
        stiffness: 1,
        damping:   0,
    })
    return _add_constraint(c)
}

/**
 * Creates a spring joint with a rest length and spring stiffness.
 * @param body_a_id - First body ID
 * @param body_b_id - Second body ID
 * @param ax - Anchor X on body A (local pixels)
 * @param ay - Anchor Y on body A
 * @param bx - Anchor X on body B
 * @param by - Anchor Y on body B
 * @param rest_length - Natural length of the spring in pixels
 * @param stiffness - Spring stiffness (0–1)
 * @param damping - Damping (0 = undamped)
 * @returns Joint ID, or -1 on failure
 */
export function physics_joint_spring_create(
    body_a_id:   number,
    body_b_id:   number,
    ax: number,  ay: number,
    bx: number,  by: number,
    rest_length: number,
    stiffness:   number = 0.1,
    damping:     number = 0.01,
): number {
    const ba = physics_body_get_raw(body_a_id)
    const bb = physics_body_get_raw(body_b_id)
    if (!ba || !bb) return -1

    const c = Matter.Constraint.create({
        bodyA:     ba,
        bodyB:     bb,
        pointA:    { x: ax, y: ay },
        pointB:    { x: bx, y: by },
        length:    rest_length,
        stiffness,
        damping,
    })
    return _add_constraint(c)
}

/**
 * Creates a rope joint — limits the distance between two anchors to `maxlength` (taut, non-stretchy).
 * @param ax,ay - Anchor on body A (local pixels, 0 = centre) · @param bx,by - Anchor on body B
 * @param maxlength - Maximum separation in pixels
 * @returns Joint ID, or -1 on failure
 */
export function physics_joint_rope_create(
    body_a_id: number, body_b_id: number,
    ax: number, ay: number, bx: number, by: number, maxlength: number,
): number {
    const ba = physics_body_get_raw(body_a_id)
    const bb = physics_body_get_raw(body_b_id)
    if (!ba || !bb) return -1
    const c = Matter.Constraint.create({
        bodyA: ba, bodyB: bb,
        pointA: { x: ax, y: ay }, pointB: { x: bx, y: by },
        length: maxlength, stiffness: 1, damping: 0,
    })
    return _add_constraint(c)
}

/** Reads a joint property — `'length'`, `'stiffness'`, or `'damping'`. */
export function physics_joint_get_value(joint_id: number, field: 'length' | 'stiffness' | 'damping'): number {
    const c = _joints.get(joint_id)
    return c ? ((c as any)[field] ?? 0) : 0
}

/** Sets a joint property — `'length'`, `'stiffness'`, or `'damping'`. */
export function physics_joint_set_value(joint_id: number, field: 'length' | 'stiffness' | 'damping', value: number): void {
    const c = _joints.get(joint_id)
    if (c) (c as any)[field] = value
}

// =========================================================================
// World queries
// =========================================================================

/** Returns true if two physics bodies' shapes overlap. */
export function physics_test_overlap(body_a_id: number, body_b_id: number): boolean {
    const a = physics_body_get_raw(body_a_id)
    const b = physics_body_get_raw(body_b_id)
    if (!a || !b) return false
    const collides = (Matter as any).Collision?.collides
    if (typeof collides === 'function') {
        const col = collides(a, b)
        return !!(col && col.collided)
    }
    return Matter.Bounds.overlaps(a.bounds, b.bounds)
}

/**
 * Casts a ray through the physics world and returns the ids of the bodies it hits.
 * @returns Hit body ids (as returned by `physics_fixture_bind`)
 */
export function physics_raycast(x1: number, y1: number, x2: number, y2: number): number[] {
    const world = _get_world()
    if (!world) return []
    const hits = Matter.Query.ray(Matter.Composite.allBodies(world), { x: x1, y: y1 }, { x: x2, y: y2 })
    const ids = new Set<number>()
    for (const h of hits) {
        const a = (h.bodyA as any)?._sw_id, b = (h.bodyB as any)?._sw_id
        if (typeof a === 'number') ids.add(a)
        if (typeof b === 'number') ids.add(b)
    }
    return [...ids]
}

/**
 * Destroys a joint and removes it from the world.
 * @param joint_id - Joint ID returned by physics_joint_*_create
 */
export function physics_joint_destroy(joint_id: number): void {
    const world = _get_world()
    const c     = _joints.get(joint_id)
    if (!c) return
    if (world) Matter.World.remove(world, c)
    _joints.delete(joint_id)
}

/** Returns true if a joint ID refers to a live joint. */
export function physics_joint_exists(joint_id: number): boolean {
    return _joints.has(joint_id)
}

/**
 * Returns the raw matter.js Constraint for advanced use.
 * @param joint_id - Joint ID
 */
export function physics_joint_get_raw(joint_id: number): Matter.Constraint | undefined {
    return _joints.get(joint_id)
}
