/**
 * Physics world — wraps a matter.js Engine and World.
 *
 * One physics world exists per game. Call physics_world_create() once,
 * then physics_world_step() each game step to advance the simulation.
 *
 * Gravity matches GMS defaults: (0, 0.1) in room-pixel units per step.
 * The scale factor (physics_world_create's pixel-per-meter) converts
 * between pixel space (instances) and matter.js metre space.
 */

import Matter from 'matter-js'

// =========================================================================
// World state
// =========================================================================

let _engine:  Matter.Engine  | null = null  // matter.js engine
let _world:   Matter.World   | null = null  // matter.js world (shortcut to engine.world)
let _px_per_m: number = 64                  // Pixels per physics metre (scale factor)

// Collision event callbacks: fired when two bodies begin/end touching.
type collision_cb = (body_a: Matter.Body, body_b: Matter.Body) => void

let _on_collision_start: collision_cb | null = null
let _on_collision_end:   collision_cb | null = null

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates (or recreates) the physics world.
 * Must be called before any physics_body or physics_fixture functions.
 * @param gx - Gravity X in room units per step (default 0)
 * @param gy - Gravity Y in room units per step (default 0.1)
 * @param px_per_metre - Pixel-to-metre scale (default 64)
 */
export function physics_world_create(gx: number = 0, gy: number = 0.1, px_per_metre: number = 64): void {
    if (_engine) {
        Matter.Events.off(_engine)
        Matter.Engine.clear(_engine)
    }

    _px_per_m = px_per_metre
    _engine   = Matter.Engine.create()
    _world    = _engine.world

    // matter.js gravity is in m/s²; we convert our per-step value to the
    // equivalent matter.js scale (assuming 60 steps/s)
    _engine.gravity.x = gx
    _engine.gravity.y = gy

    // Wire collision events
    Matter.Events.on(_engine, 'collisionStart', (event) => {
        if (!_on_collision_start) return
        for (const pair of event.pairs) {
            _on_collision_start(pair.bodyA, pair.bodyB)
        }
    })

    Matter.Events.on(_engine, 'collisionEnd', (event) => {
        if (!_on_collision_end) return
        for (const pair of event.pairs) {
            _on_collision_end(pair.bodyA, pair.bodyB)
        }
    })
}

/**
 * Advances the physics simulation by one step.
 * Call this once per game step (before reading body positions).
 * @param delta_ms - Step duration in milliseconds (default 1000/60 ≈ 16.67)
 */
export function physics_world_step(delta_ms: number = 1000 / 60): void {
    if (!_engine) return
    Matter.Engine.update(_engine, delta_ms)
}

/**
 * Sets the world gravity vector.
 * @param gx - Gravity X (room units per step)
 * @param gy - Gravity Y (room units per step)
 */
export function physics_world_gravity(gx: number, gy: number): void {
    if (!_engine) return
    _engine.gravity.x = gx
    _engine.gravity.y = gy
}

/**
 * Destroys the physics world and frees all resources.
 */
export function physics_world_destroy(): void {
    if (!_engine) return
    Matter.Events.off(_engine)
    Matter.Engine.clear(_engine)
    _engine = null
    _world  = null
}

/**
 * Registers a callback fired when two physics bodies begin colliding.
 * @param cb - Callback receiving the two colliding bodies
 */
export function physics_world_on_collision_start(cb: collision_cb): void {
    _on_collision_start = cb
}

/**
 * Registers a callback fired when two physics bodies stop colliding.
 * @param cb - Callback receiving the two separated bodies
 */
export function physics_world_on_collision_end(cb: collision_cb): void {
    _on_collision_end = cb
}

/**
 * Returns the raw matter.js Engine for advanced use.
 * Returns null if the world has not been created yet.
 */
export function physics_world_get_engine(): Matter.Engine | null {
    return _engine
}

/**
 * Returns the pixel-per-metre scale factor set at world creation.
 */
export function physics_get_scale(): number {
    return _px_per_m
}

/**
 * Returns the raw matter.js World, or null if not created.
 * Used internally by physics_body.ts.
 */
export function _get_world(): Matter.World | null {
    return _world
}

/**
 * Returns the raw matter.js Engine, or null if not created.
 * Used internally by physics_body.ts.
 */
export function _get_engine(): Matter.Engine | null {
    return _engine
}
