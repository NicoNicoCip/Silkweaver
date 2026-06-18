import { EVENT_TYPE } from "./game_event.js"
import { game_loop } from "./game_loop.js"
import { resource } from "./resource.js"
import type { room } from "./room.js"
import { instances_collide, update_bbox, point_in_instance, rect_in_instance, circle_in_instance, line_in_instance } from "../collision/collision.js"
import { _mp_potential_settings } from "./motion_planning.js"
import { irandom_range } from "../math/random.js"
import {
    path_exists, path_get_x, path_get_y, path_get_length,
    path_action_stop, path_action_restart, path_action_continue, path_action_reverse,
} from "./path.js"
import { physics_world_get_engine } from "../physics/physics_world.js"
import {
    physics_fixture_create, physics_fixture_set_box, physics_fixture_set_circle,
    physics_fixture_set_density, physics_fixture_set_restitution, physics_fixture_set_friction,
    physics_fixture_set_sensor, physics_fixture_bind, physics_fixture_delete,
    physics_body_destroy, physics_body_get_x, physics_body_get_y, physics_body_get_angle,
    physics_body_get_vx, physics_body_get_vy, physics_body_set_velocity,
    physics_body_apply_force, physics_body_apply_impulse, physics_body_set_position,
} from "../physics/physics_body.js"
import type { sprite } from "../drawing/sprite.js"
import { keyboard_check, keyboard_check_pressed, keyboard_check_released, vk_anykey } from "../input/keyboard.js"
import {
    window_mouse_get_x, window_mouse_get_y,
    mouse_check_button_pressed, mouse_check_button_released, mb_left, mb_right,
} from "../input/mouse.js"

/** Number of alarm slots per instance (matches GMS alarm[0..11]). */
const ALARM_COUNT = 12

/**
 * A draw_sprite_ext function reference injected at engine startup to avoid
 * circular imports between instance.ts (core) and renderer.ts (drawing).
 * Set by calling set_draw_sprite_ext() from renderer.init().
 */
let _renderer_draw_sprite_ext: ((
    spr: sprite, subimg: number,
    x: number, y: number,
    xscale: number, yscale: number,
    rot: number, color: number, alpha: number
) => void) | null = null

/**
 * Called by renderer.init() to register the draw_sprite_ext function.
 * Must be called before the game loop starts for draw_self() to work.
 * @param fn - The renderer's draw_sprite_ext method
 */
export function set_draw_sprite_ext(fn: typeof _renderer_draw_sprite_ext): void {
    _renderer_draw_sprite_ext = fn
}

/**
 * Base class for all game object instances.
 * Instances exist within rooms and can have events, properties, and behaviors.
 */
export class instance extends resource {
    // GMS-style dynamic instance variables: user code can read/write arbitrary
    // properties (e.g. `this.score = 0`) without a cast. Declared properties below
    // keep their precise types; only unknown keys resolve to `any`.
    [key: string]: any

    public room: room       // The room this instance belongs to

    // =========================================================================
    // Position & Movement
    // =========================================================================

    public x: number = 0                // X position in the room
    public y: number = 0                // Y position in the room
    public xprevious: number = 0        // X position in the previous step
    public yprevious: number = 0        // Y position in the previous step
    public xstart: number = 0           // X position when instance was created
    public ystart: number = 0           // Y position when instance was created

    public hspeed: number = 0           // Horizontal speed (pixels per step)
    public vspeed: number = 0           // Vertical speed (pixels per step)
    public speed: number = 0            // Total speed (computed from hspeed/vspeed)
    public direction: number = 0        // Direction of movement in degrees (0 = right)
    public friction: number = 0         // Deceleration applied each step
    public gravity: number = 0          // Gravity force applied each step
    public gravity_direction: number = 270  // Direction of gravity (270 = down)

    // =========================================================================
    // Rendering
    // =========================================================================

    public sprite_index: number = -1    // Current sprite resource ID (-1 = none)
    public image_index: number = 0      // Current frame of the sprite animation
    public image_speed: number = 1      // Animation speed (frames per step)
    public image_xscale: number = 1     // Horizontal scale factor
    public image_yscale: number = 1     // Vertical scale factor
    public image_angle: number = 0      // Rotation angle in degrees
    public image_alpha: number = 1      // Transparency (0 = invisible, 1 = opaque)
    public image_blend: number = 0xFFFFFF  // Blend color (white = no tint)

    public depth: number = 0            // Drawing depth (lower = drawn on top)
    public visible: boolean = true      // Whether the instance is drawn

    // =========================================================================
    // Collision & State
    // =========================================================================

    public mask_index: number = -1      // Collision mask sprite ID (-1 = use sprite_index)
    public solid: boolean = false       // Whether the instance blocks movement
    public persistent: boolean = false  // Whether the instance persists across rooms
    public active: boolean = true       // Whether the instance participates in logic and collision

    /** Countdown timers (GMS alarm[0..11]). -1 = inactive; set to N to fire on_alarm(i) after N steps. */
    public alarm: number[] = new Array(ALARM_COUNT).fill(-1)
    /** Set once instance_destroy() runs, so the rest of the current step is skipped. */
    private _destroyed: boolean = false

    // Cached bounding box — updated each step before collision checks
    public bbox_left:   number = 0      // Left edge of collision bounding box
    public bbox_top:    number = 0      // Top edge of collision bounding box
    public bbox_right:  number = 0      // Right edge of collision bounding box
    public bbox_bottom: number = 0      // Bottom edge of collision bounding box

    // Manual collision mask (offsets from the instance origin). When mask_manual
    // is true, the collision system uses these instead of the sprite-derived bbox
    // — required for spriteless objects. Set via mask_set_rectangle/mask_set_size.
    public mask_manual:     boolean = false
    public mask_off_left:   number = 0
    public mask_off_top:    number = 0
    public mask_off_right:  number = 0
    public mask_off_bottom: number = 0

    // Physics (matter.js). phy_body_id < 0 = not a physics instance. Configured from
    // `static physics` on the object; the body is created lazily on the first physics
    // step (once x/y and any mask are set) and then drives x/y/image_angle.
    public  phy_body_id:      number = -1
    private _phy_wants:       boolean = false
    private _phy_shape:       'box' | 'circle' = 'box'
    private _phy_density:     number = 0.5
    private _phy_restitution: number = 0.1
    private _phy_friction:    number = 0.2
    private _phy_sensor:      boolean = false

    private _mp_dir: number = NaN   // Persisted heading for mp_potential_step (radians, screen-space)

    // Path following (GMS path_*). path_index < 0 = not following a path.
    public  path_index:            number = -1
    public  path_position:         number = 0    // 0..1 along the path
    public  path_positionprevious: number = 0
    public  path_speed:            number = 0    // pixels per step along the path
    public  path_scale:            number = 1
    public  path_orientation:      number = 0
    public  path_endaction:        number = 0    // path_action_* (stop/restart/continue/reverse)
    private _path_off_x:           number = 0
    private _path_off_y:           number = 0

    // Bound event handlers — stored so unregister() can match the exact same function reference.
    // World-space draws (begin/draw/end) are NOT events: the loop calls run_draw_* directly in
    // depth order. Only step events and the screen-space draw_gui remain event-registered.
    private _bound_step_begin: Function = () => {}
    private _bound_step:       Function = () => {}
    private _bound_step_end:   Function = () => {}
    private _bound_draw_gui:   Function = () => {}

    /**
     * Creates a new instance in the specified room.
     * @param room - The room this instance will belong to
     */
    constructor(room: room) {
        super()
        this.room = room
        // Create stable bound references once — used for both register and unregister
        this._bound_step_begin = this.on_step_begin.bind(this)
        this._bound_step       = this.internal_step.bind(this)
        this._bound_step_end   = this.on_step_end.bind(this)
        this._bound_draw_gui   = this.on_draw_gui.bind(this)
    }

    // =========================================================================
    // Lifecycle
    // =========================================================================

    /**
     * Creates a new instance of an object at the specified position.
     * @param x - X position for the new instance
     * @param y - Y position for the new instance
     * @param obj - The object class to instantiate
     * @returns The newly created instance
     */
    public static instance_create(x: number, y: number, obj: typeof instance): instance {
        const currentRoom = game_loop.room
        const inst = new obj(currentRoom)

        inst.x = x
        inst.y = y
        inst.xstart = x
        inst.ystart = y
        inst.xprevious = x
        inst.yprevious = y

        currentRoom.instance_add(inst)
        inst.register_events()

        // Queue create event
        game_loop.register(EVENT_TYPE.create, inst.on_create.bind(inst))

        return inst
    }

    /**
     * Creates a new instance at the specified position with an explicit depth.
     * @param x - X position
     * @param y - Y position
     * @param depth - Drawing depth
     * @param obj - The object class to instantiate
     * @returns The newly created instance
     */
    public static instance_create_depth(x: number, y: number, depth: number, obj: typeof instance): instance {
        const inst = instance.instance_create(x, y, obj)
        inst.depth = depth
        return inst
    }

    /**
     * Releases this instance's external resources (physics body) without firing a Destroy
     * event — used when a room is silently rebuilt (e.g. re-entering a non-persistent room).
     */
    public dispose_for_rebuild(): void {
        if (this.phy_body_id >= 0) { physics_body_destroy(this.phy_body_id); this.phy_body_id = -1 }
    }

    /**
     * Destroys this instance, removing it from the room.
     * Queues the destroy event to run at the end of the current step.
     */
    public instance_destroy(): void {
        if (this._destroyed) return
        this._destroyed = true
        if (this.phy_body_id >= 0) { physics_body_destroy(this.phy_body_id); this.phy_body_id = -1 }
        game_loop.register(EVENT_TYPE.destroy, this.on_destroy.bind(this))
        this.unregister_events()
        this.room.instance_remove(this.id)
        resource.removeByID(this.id)
    }

    /**
     * Destroys an instance by its numeric ID.
     * @param id - ID of the instance to destroy
     */
    public static instance_destroy_id(id: number): void {
        const inst = instance.instance_find(id)
        if (inst) inst.instance_destroy()
    }

    /**
     * Registers this instance's event handlers with the game loop.
     */
    public register_events(): void {
        game_loop.register(EVENT_TYPE.step_begin, this._bound_step_begin)
        game_loop.register(EVENT_TYPE.step,       this._bound_step)
        game_loop.register(EVENT_TYPE.step_end,   this._bound_step_end)
        game_loop.register(EVENT_TYPE.draw_gui,   this._bound_draw_gui)
    }

    /**
     * Unregisters this instance's event handlers from the game loop.
     */
    private unregister_events(): void {
        game_loop.unregister(EVENT_TYPE.step_begin, this._bound_step_begin)
        game_loop.unregister(EVENT_TYPE.step,       this._bound_step)
        game_loop.unregister(EVENT_TYPE.step_end,   this._bound_step_end)
        game_loop.unregister(EVENT_TYPE.draw_gui,   this._bound_draw_gui)
    }

    /**
     * Internal step: alarms, input events, physics, animation, bbox, collision
     * events, then on_step(). Bails out early if an event destroys the instance.
     */
    private internal_step(): void {
        if (!this.active || this._destroyed) return

        this.xprevious = this.x
        this.yprevious = this.y

        // Countdown alarms → on_alarm()
        this._process_alarms()
        if (this._destroyed) return

        // Keyboard / mouse-over-instance events
        this._process_input_events()
        if (this._destroyed) return

        // Apply gravity
        if (this.gravity !== 0) {
            const grav_rad = this.gravity_direction * (Math.PI / 180)
            this.hspeed += Math.cos(grav_rad) * this.gravity
            this.vspeed -= Math.sin(grav_rad) * this.gravity
        }

        // Apply friction (decelerate toward zero without overshooting)
        if (this.friction !== 0 && (this.hspeed !== 0 || this.vspeed !== 0)) {
            const currentSpeed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed)
            const newSpeed = Math.max(0, currentSpeed - this.friction)
            if (currentSpeed > 0) {
                const ratio = newSpeed / currentSpeed
                this.hspeed *= ratio
                this.vspeed *= ratio
            }
        }

        // Derive speed and direction from component velocities
        this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed)
        if (this.hspeed !== 0 || this.vspeed !== 0) {
            this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI)
            if (this.direction < 0) this.direction += 360
        }

        this.x += this.hspeed
        this.y += this.vspeed

        // Path following drives position when a path is active (overrides motion).
        if (this.path_index >= 0) { this._advance_path(); if (this._destroyed) return }

        // Advance animation (fires on_animation_end on loop) and update bbox
        this._advance_animation()
        update_bbox(this)

        // Collision events (only scanned for objects with a collision event)
        this._process_collisions()
        if (this._destroyed) return

        // Outside Room / Intersect Boundary events
        this._process_boundary_events()
        if (this._destroyed) return

        this.on_step()
    }

    /** Decrements active alarms; fires on_alarm(i) when one reaches zero. */
    private _process_alarms(): void {
        for (let i = 0; i < ALARM_COUNT; i++) {
            const a = this.alarm[i] ?? -1
            if (a > 0) {
                const next = a - 1
                this.alarm[i] = next
                if (next === 0) { this.alarm[i] = -1; this.on_alarm(i) }
                if (this._destroyed) return
            }
        }
    }

    /** Fires keyboard and mouse-over-instance events for this step. */
    private _process_input_events(): void {
        // Keyboard (generic: fires on any-key transitions; check specific keys inside)
        if (keyboard_check_pressed(vk_anykey))  { this.on_key_press();   if (this._destroyed) return }
        if (keyboard_check_released(vk_anykey)) { this.on_key_release(); if (this._destroyed) return }
        if (keyboard_check(vk_anykey))          { this.on_key_held();    if (this._destroyed) return }

        // Mouse (fires only while the pointer is over this instance)
        const mx = window_mouse_get_x()
        const my = window_mouse_get_y()
        if (point_in_instance(mx, my, this)) {
            if (mouse_check_button_pressed(mb_left))  { this.on_mouse_left_press();   if (this._destroyed) return }
            if (mouse_check_button_released(mb_left)) { this.on_mouse_left_release(); if (this._destroyed) return }
            if (mouse_check_button_pressed(mb_right)) { this.on_mouse_right_press() }
        }
    }

    /** Advances the sprite animation, firing on_animation_end() on each loop. */
    private _advance_animation(): void {
        if (this.image_speed === 0 || this.sprite_index < 0) return
        const spr = resource.findByID(this.sprite_index)
        const frame_count = (spr && 'frames' in spr) ? (spr as any).frames.length : 1
        if (frame_count <= 0) return
        const prev = this.image_index
        this.image_index = (this.image_index + this.image_speed) % frame_count
        if (this.image_index < 0) this.image_index += frame_count
        const looped = this.image_speed > 0 ? this.image_index < prev : this.image_index > prev
        if (looped) this.on_animation_end()
    }

    /** Fires on_collision(other) for each instance this one overlaps (collision-event objects only). */
    private _process_collisions(): void {
        if (this.on_collision === instance.prototype.on_collision) return
        for (const other of this.room.instance_get_all()) {
            if (other === this || !other.active) continue
            if (instances_collide(this, this.x, this.y, other)) {
                this.on_collision(other)
                if (this._destroyed) return
            }
        }
    }

    /**
     * Internal draw: skips hidden instances, then calls on_draw().
     * If on_draw() has not been overridden, draws the current sprite automatically.
     */
    /**
     * Runs the main Draw event (skips hidden/inactive instances).
     * Called by the game loop in depth order — not registered as an event.
     */
    public run_draw(): void {
        if (!this.visible || !this.active) return
        this.on_draw()
    }

    /** Runs the Draw Begin event (skips hidden/inactive instances). */
    public run_draw_begin(): void {
        if (!this.visible || !this.active) return
        this.on_draw_begin()
    }

    /** Runs the Draw End event (skips hidden/inactive instances). */
    public run_draw_end(): void {
        if (!this.visible || !this.active) return
        this.on_draw_end()
    }

    // =========================================================================
    // Instance queries (static)
    // =========================================================================

    /**
     * Checks if an instance with the given ID exists.
     * @param id - The instance ID to check
     * @returns True if the instance exists
     */
    public static instance_exists(id: number): boolean {
        const res = resource.findByID(id)
        if (res === undefined) return false
        return res instanceof instance
    }

    /**
     * Finds an instance by its ID.
     * @param id - The instance ID to find
     * @returns The instance, or undefined if not found
     */
    public static instance_find(id: number): instance | undefined {
        const res = resource.findByID(id)
        if (res instanceof instance) return res
        return undefined
    }

    /**
     * Returns the number of active instances of a given object class in the current room.
     * @param obj - Object class to count
     * @returns Instance count
     */
    public static instance_number(obj: typeof instance): number {
        const rm = game_loop.room
        if (!rm) return 0
        let count = 0
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj && inst.active) count++
        }
        return count
    }

    /**
     * Finds the nth instance of a given object class in the current room (0-indexed).
     * @param obj - Object class to search for
     * @param n - Zero-based index
     * @returns The instance, or undefined if not found
     */
    public static instance_find_nth(obj: typeof instance, n: number): instance | undefined {
        const rm = game_loop.room
        if (!rm) return undefined
        let i = 0
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj && inst.active) {
                if (i === n) return inst
                i++
            }
        }
        return undefined
    }

    /**
     * Finds the first instance of a given object class at a specific position.
     * @param x - X position to test
     * @param y - Y position to test
     * @param obj - Object class to check
     * @returns The instance at that position, or undefined
     */
    public static instance_position(x: number, y: number, obj: typeof instance): instance | undefined {
        const rm = game_loop.room
        if (!rm) return undefined
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj && inst.active && point_in_instance(x, y, inst)) {
                return inst
            }
        }
        return undefined
    }

    /**
     * Returns the nearest instance of obj to a given point.
     * @param x - Reference X
     * @param y - Reference Y
     * @param obj - Object class to search
     * @returns Nearest instance, or undefined if none exist
     */
    public static instance_nearest(x: number, y: number, obj: typeof instance): instance | undefined {
        const rm = game_loop.room
        if (!rm) return undefined
        let nearest: instance | undefined
        let min_dist = Infinity
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj && inst.active) {
                const dx = inst.x - x
                const dy = inst.y - y
                const d = dx * dx + dy * dy
                if (d < min_dist) {
                    min_dist = d
                    nearest = inst
                }
            }
        }
        return nearest
    }

    /**
     * Returns the furthest instance of obj from a given point.
     * @param x - Reference X
     * @param y - Reference Y
     * @param obj - Object class to search
     * @returns Furthest instance, or undefined if none exist
     */
    public static instance_furthest(x: number, y: number, obj: typeof instance): instance | undefined {
        const rm = game_loop.room
        if (!rm) return undefined
        let furthest: instance | undefined
        let max_dist = -1
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj && inst.active) {
                const dx = inst.x - x
                const dy = inst.y - y
                const d = dx * dx + dy * dy
                if (d > max_dist) {
                    max_dist = d
                    furthest = inst
                }
            }
        }
        return furthest
    }

    /**
     * Deactivates all instances (optionally excluding self).
     * Deactivated instances are skipped in step and draw.
     * @param not_me - If true, this instance is excluded from deactivation
     */
    public instance_deactivate_all(not_me: boolean = false): void {
        const rm = game_loop.room
        if (!rm) return
        for (const inst of rm.instance_get_all()) {
            if (not_me && inst === this) continue
            inst.active = false
        }
    }

    /**
     * Deactivates all instances of a specific object class.
     * @param obj - Object class to deactivate
     */
    public static instance_deactivate_object(obj: typeof instance): void {
        const rm = game_loop.room
        if (!rm) return
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj) inst.active = false
        }
    }

    /**
     * Activates all instances in the current room.
     */
    public static instance_activate_all(): void {
        const rm = game_loop.room
        if (!rm) return
        for (const inst of rm.instance_get_all()) {
            inst.active = true
        }
    }

    /**
     * Activates all instances of a specific object class.
     * @param obj - Object class to activate
     */
    public static instance_activate_object(obj: typeof instance): void {
        const rm = game_loop.room
        if (!rm) return
        for (const inst of rm.instance_get_all()) {
            if (inst instanceof obj) inst.active = true
        }
    }

    /**
     * True if the instance's bounding box overlaps the given region.
     * @param inst - Instance to test
     * @param l - Region left
     * @param t - Region top
     * @param r - Region right
     * @param b - Region bottom
     */
    private static _bbox_in_region(inst: instance, l: number, t: number, r: number, b: number): boolean {
        update_bbox(inst)
        return inst.bbox_right >= l && inst.bbox_left <= r &&
               inst.bbox_bottom >= t && inst.bbox_top <= b
    }

    /**
     * Deactivates instances within (or outside) a rectangular region.
     * @param left - Region left
     * @param top - Region top
     * @param width - Region width
     * @param height - Region height
     * @param inside - Deactivate instances overlapping the region (true) or those not overlapping it (false)
     * @param not_me - If true, this instance is excluded
     */
    public instance_deactivate_region(left: number, top: number, width: number, height: number, inside: boolean = true, not_me: boolean = false): void {
        const rm = game_loop.room
        if (!rm) return
        const r = left + width, b = top + height
        for (const inst of rm.instance_get_all()) {
            if (not_me && inst === this) continue
            if (instance._bbox_in_region(inst, left, top, r, b) === inside) inst.active = false
        }
    }

    /**
     * Activates instances within (or outside) a rectangular region.
     * @param left - Region left
     * @param top - Region top
     * @param width - Region width
     * @param height - Region height
     * @param inside - Activate instances overlapping the region (true) or those not overlapping it (false)
     */
    public static instance_activate_region(left: number, top: number, width: number, height: number, inside: boolean = true): void {
        const rm = game_loop.room
        if (!rm) return
        const r = left + width, b = top + height
        for (const inst of rm.instance_get_all()) {
            if (instance._bbox_in_region(inst, left, top, r, b) === inside) inst.active = true
        }
    }

    // =========================================================================
    // Collision methods (instance-level)
    // =========================================================================

    /**
     * Checks if this instance would collide with any instance of obj at position (x, y).
     * Does not move the instance.
     * @param x - X position to test
     * @param y - Y position to test
     * @param obj - Object class to check against
     * @returns True if a collision would occur
     */
    public place_meeting(x: number, y: number, obj: typeof instance): boolean {
        const rm = game_loop.room
        if (!rm) return false
        for (const other of rm.instance_get_all()) {
            if (other === this) continue
            if (!(other instanceof obj)) continue
            if (!other.active) continue
            if (instances_collide(this, x, y, other)) return true
        }
        return false
    }

    /**
     * Checks if position (x, y) is free of solid instances.
     * @param x - X position to test
     * @param y - Y position to test
     * @returns True if no solid instances occupy that position
     */
    public place_free(x: number, y: number): boolean {
        const rm = game_loop.room
        if (!rm) return true
        for (const other of rm.instance_get_all()) {
            if (other === this) continue
            if (!other.solid || !other.active) continue
            if (instances_collide(this, x, y, other)) return false
        }
        return true
    }

    /**
     * Checks if position (x, y) is completely empty (no instances of any kind).
     * @param x - X position to test
     * @param y - Y position to test
     * @returns True if no instances occupy that position
     */
    public place_empty(x: number, y: number): boolean {
        const rm = game_loop.room
        if (!rm) return true
        for (const other of rm.instance_get_all()) {
            if (other === this) continue
            if (!other.active) continue
            if (instances_collide(this, x, y, other)) return false
        }
        return true
    }

    /**
     * Like place_meeting, but returns the first instance collided with at (x, y),
     * or undefined if none.
     * @param x - X position to test
     * @param y - Y position to test
     * @param obj - Object class to check against (pass the base `instance` for "all")
     */
    public instance_place(x: number, y: number, obj: typeof instance): instance | undefined {
        const rm = game_loop.room
        if (!rm) return undefined
        for (const other of rm.instance_get_all()) {
            if (other === this || !other.active) continue
            if (!(other instanceof obj)) continue
            if (instances_collide(this, x, y, other)) return other
        }
        return undefined
    }

    // =========================================================================
    // Collision mask (manual)
    // =========================================================================

    /**
     * Sets a manual rectangular collision mask, as offsets from the instance
     * origin (x, y). Use this for spriteless objects so collision functions work.
     * @param left - Left offset from x
     * @param top - Top offset from y
     * @param right - Right offset from x
     * @param bottom - Bottom offset from y
     */
    public mask_set_rectangle(left: number, top: number, right: number, bottom: number): void {
        this.mask_manual     = true
        this.mask_off_left   = left
        this.mask_off_top    = top
        this.mask_off_right  = right
        this.mask_off_bottom = bottom
        update_bbox(this)
    }

    /**
     * Convenience: sets a manual width×height mask with its top-left at the origin.
     * @param width - Mask width
     * @param height - Mask height
     */
    public mask_set_size(width: number, height: number): void {
        this.mask_set_rectangle(0, 0, width, height)
    }

    /** Removes the manual mask, reverting to the sprite/mask_index-derived bbox. */
    public mask_clear(): void {
        this.mask_manual = false
        update_bbox(this)
    }

    // =========================================================================
    // Physics (matter.js body binding)
    // =========================================================================

    /**
     * Marks this instance as physics-enabled (called from `gm_object` when the object
     * declares `static physics = true`). The matter.js body is created lazily on the
     * first physics step, so x/y and any collision mask are already in place. A density
     * of ≤ 0 makes the body static (immovable) — e.g. for floors and walls.
     * @param shape - 'box' or 'circle'
     * @param density - Mass density; ≤ 0 ⇒ static body
     * @param restitution - Bounciness, 0–1
     * @param friction - Surface friction
     * @param sensor - True = detects overlaps without a physical response
     */
    public phy_request(shape: 'box' | 'circle', density: number, restitution: number, friction: number, sensor: boolean): void {
        this._phy_wants       = true
        this._phy_shape       = shape
        this._phy_density     = density
        this._phy_restitution = restitution
        this._phy_friction    = friction
        this._phy_sensor      = sensor
    }

    /**
     * Creates the matter.js body if this instance wants physics, has none yet, and a
     * physics world exists. Called by the game loop each step (a no-op once bound).
     */
    public phy_ensure_body(): void {
        if (!this._phy_wants || this.phy_body_id >= 0) return
        if (!physics_world_get_engine()) return
        const { w, h } = this._phy_extent()
        const fix = physics_fixture_create()
        if (this._phy_shape === 'circle') physics_fixture_set_circle(fix, Math.max(w, h) / 2)
        else                              physics_fixture_set_box(fix, w, h)
        physics_fixture_set_density(fix, Math.max(0, this._phy_density))
        physics_fixture_set_restitution(fix, this._phy_restitution)
        physics_fixture_set_friction(fix, this._phy_friction)
        physics_fixture_set_sensor(fix, this._phy_sensor)
        this.phy_body_id = physics_fixture_bind(fix, this.x, this.y, this._phy_density <= 0)
        physics_fixture_delete(fix)
    }

    /** Syncs x/y/image_angle from the physics body. Called by the loop after stepping. */
    public phy_sync_from_body(): void {
        if (this.phy_body_id < 0) return
        this.x           = physics_body_get_x(this.phy_body_id)
        this.y           = physics_body_get_y(this.phy_body_id)
        this.image_angle = physics_body_get_angle(this.phy_body_id)
    }

    /** The body's pixel extent: manual mask, else sprite bbox, else a 32×32 default. */
    private _phy_extent(): { w: number; h: number } {
        if (this.mask_manual) {
            const w = this.mask_off_right - this.mask_off_left
            const h = this.mask_off_bottom - this.mask_off_top
            if (w > 0 && h > 0) return { w, h }
        }
        const bw = this.bbox_right - this.bbox_left
        const bh = this.bbox_bottom - this.bbox_top
        if (bw > 0 && bh > 0) return { w: bw, h: bh }
        return { w: 32, h: 32 }
    }

    /** Applies a continuous force at the body's centre (pixel-space units). */
    public phy_apply_force(fx: number, fy: number): void {
        if (this.phy_body_id >= 0) physics_body_apply_force(this.phy_body_id, fx, fy)
    }

    /** Applies an instantaneous impulse at the body's centre. */
    public phy_apply_impulse(fx: number, fy: number): void {
        if (this.phy_body_id >= 0) physics_body_apply_impulse(this.phy_body_id, fx, fy)
    }

    /** Teleports the physics body (and the instance) to a position. */
    public phy_set_position(x: number, y: number): void {
        if (this.phy_body_id >= 0) physics_body_set_position(this.phy_body_id, x, y)
        this.x = x
        this.y = y
    }

    /** Horizontal velocity of the physics body (pixels/step). */
    public get phy_speed_x(): number { return this.phy_body_id >= 0 ? physics_body_get_vx(this.phy_body_id) : 0 }
    public set phy_speed_x(v: number) { if (this.phy_body_id >= 0) physics_body_set_velocity(this.phy_body_id, v, physics_body_get_vy(this.phy_body_id)) }

    /** Vertical velocity of the physics body (pixels/step). */
    public get phy_speed_y(): number { return this.phy_body_id >= 0 ? physics_body_get_vy(this.phy_body_id) : 0 }
    public set phy_speed_y(v: number) { if (this.phy_body_id >= 0) physics_body_set_velocity(this.phy_body_id, physics_body_get_vx(this.phy_body_id), v) }

    /**
     * Moves the instance by the given amount, stopping when it hits a solid.
     * @param hspd - Horizontal movement
     * @param vspd - Vertical movement
     * @returns True if the movement was blocked by a solid
     */
    public move_contact_solid(hspd: number, vspd: number): boolean {
        const target_x = this.x + hspd
        const target_y = this.y + vspd
        if (this.place_free(target_x, target_y)) {
            this.x = target_x
            this.y = target_y
            return false
        }
        return true
    }

    /**
     * Wraps the instance around the room edges.
     * @param hor - Wrap horizontally
     * @param vert - Wrap vertically
     * @param margin - Extra margin (pixels outside room edge before wrapping)
     */
    public move_wrap(hor: boolean, vert: boolean, margin: number = 0): void {
        const rm = game_loop.room
        if (!rm) return
        // Use bbox dimensions so the instance is fully off-screen before wrapping
        const bbox_w = this.bbox_right - this.bbox_left
        const bbox_h = this.bbox_bottom - this.bbox_top
        if (hor) {
            if (this.x + bbox_w < -margin) this.x = rm.room_width + margin
            else if (this.x - bbox_w > rm.room_width + margin) this.x = -margin
        }
        if (vert) {
            if (this.y + bbox_h < -margin) this.y = rm.room_height + margin
            else if (this.y - bbox_h > rm.room_height + margin) this.y = -margin
        }
    }

    /**
     * Returns the shortest distance from this instance to any instance of obj.
     * @param obj - Object class to measure distance to
     * @returns Distance in pixels, or Infinity if no instance found
     */
    public distance_to_object(obj: typeof instance): number {
        const rm = game_loop.room
        if (!rm) return Infinity
        let min_dist = Infinity
        for (const inst of rm.instance_get_all()) {
            if (inst === this || !inst.active) continue
            if (!(inst instanceof obj)) continue
            const dx = inst.x - this.x
            const dy = inst.y - this.y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < min_dist) min_dist = d
        }
        return min_dist
    }

    // =========================================================================
    // Movement
    // =========================================================================

    /**
     * Sets the instance's motion using speed and direction.
     * @param dir - Direction in degrees (0 = right, counter-clockwise)
     * @param spd - Speed in pixels per step
     */
    public motion_set(dir: number, spd: number): void {
        this.direction = dir
        this.speed = spd
        const rad = dir * (Math.PI / 180)
        this.hspeed = Math.cos(rad) * spd
        this.vspeed = -Math.sin(rad) * spd
    }

    /**
     * Adds motion to the instance's current movement.
     * @param dir - Direction in degrees
     * @param spd - Speed to add
     */
    public motion_add(dir: number, spd: number): void {
        const rad = dir * (Math.PI / 180)
        this.hspeed += Math.cos(rad) * spd
        this.vspeed += -Math.sin(rad) * spd
        this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed)
        if (this.hspeed !== 0 || this.vspeed !== 0) {
            this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI)
            if (this.direction < 0) this.direction += 360
        }
    }

    /**
     * Moves the instance toward a point at the given speed.
     * @param x - Target X position
     * @param y - Target Y position
     * @param spd - Speed to move at
     */
    public move_towards_point(x: number, y: number, spd: number): void {
        const dir = Math.atan2(-(y - this.y), x - this.x) * (180 / Math.PI)
        this.motion_set(dir < 0 ? dir + 360 : dir, spd)
    }

    /**
     * Returns the distance from this instance's bounding box to a point.
     * Returns 0 if the point lies inside the bounding box.
     * @param x - Point X
     * @param y - Point Y
     */
    public distance_to_point(x: number, y: number): number {
        update_bbox(this)
        const dx = Math.max(this.bbox_left - x, 0, x - this.bbox_right)
        const dy = Math.max(this.bbox_top - y, 0, y - this.bbox_bottom)
        return Math.sqrt(dx * dx + dy * dy)
    }

    /**
     * Snaps the instance position to a grid.
     * @param hsnap - Horizontal grid size (ignored if ≤ 0)
     * @param vsnap - Vertical grid size (ignored if ≤ 0)
     */
    public move_snap(hsnap: number, vsnap: number): void {
        if (hsnap > 0) this.x = Math.round(this.x / hsnap) * hsnap
        if (vsnap > 0) this.y = Math.round(this.y / vsnap) * vsnap
    }

    /**
     * True if the instance position is aligned to the given grid.
     * @param hsnap - Horizontal grid size
     * @param vsnap - Vertical grid size
     */
    public place_snapped(hsnap: number, vsnap: number): boolean {
        const hok = hsnap <= 0 || this.x % hsnap === 0
        const vok = vsnap <= 0 || this.y % vsnap === 0
        return hok && vok
    }

    /**
     * Moves the instance to a random, grid-snapped, collision-free position in
     * the room (tries a number of times before giving up).
     * @param hsnap - Horizontal grid size (use 1 for any pixel)
     * @param vsnap - Vertical grid size
     */
    public move_random(hsnap: number, vsnap: number): void {
        const rm = game_loop.room
        if (!rm) return
        const hs = hsnap > 0 ? hsnap : 1
        const vs = vsnap > 0 ? vsnap : 1
        const hcells = Math.max(1, Math.floor(rm.room_width / hs))
        const vcells = Math.max(1, Math.floor(rm.room_height / vs))
        for (let tries = 0; tries < 1000; tries++) {
            const nx = irandom_range(0, hcells - 1) * hs
            const ny = irandom_range(0, vcells - 1) * vs
            if (this.place_free(nx, ny)) { this.x = nx; this.y = ny; return }
        }
    }

    /**
     * Like move_contact_solid but treats all instances as obstacles.
     * @param hspd - Horizontal movement
     * @param vspd - Vertical movement
     * @returns True if the movement was blocked
     */
    public move_contact_all(hspd: number, vspd: number): boolean {
        const tx = this.x + hspd, ty = this.y + vspd
        if (this.place_empty(tx, ty)) { this.x = tx; this.y = ty; return false }
        return true
    }

    /**
     * Steps the instance in the given direction until it is no longer colliding
     * with a solid (up to its bounding-box size in steps).
     * @param hspd - Horizontal step
     * @param vspd - Vertical step
     */
    public move_outside_solid(hspd: number, vspd: number): void {
        this._move_outside(hspd, vspd, false)
    }

    /** As move_outside_solid but treats all instances as obstacles. */
    public move_outside_all(hspd: number, vspd: number): void {
        this._move_outside(hspd, vspd, true)
    }

    /** Steps in (hspd,vspd) until the position is free (or a step cap is hit). */
    private _move_outside(hspd: number, vspd: number, all: boolean): void {
        const free = (x: number, y: number): boolean => all ? this.place_empty(x, y) : this.place_free(x, y)
        const step = Math.hypot(hspd, vspd)
        if (step < 1e-9) return
        const max_steps = 1000
        for (let i = 0; i < max_steps; i++) {
            if (free(this.x, this.y)) return
            this.x += hspd
            this.y += vspd
        }
    }

    /**
     * Bounces the instance off solid instances by reflecting its hspeed/vspeed.
     * @param advanced - Reserved for slanted-wall handling (currently axis-aligned reflection)
     */
    public move_bounce_solid(advanced: boolean = false): void {
        this._move_bounce(advanced, false)
    }

    /** As move_bounce_solid but bounces off all instances. */
    public move_bounce_all(advanced: boolean = false): void {
        this._move_bounce(advanced, true)
    }

    /** Axis-aligned bounce: flips the blocked velocity component(s). */
    private _move_bounce(_advanced: boolean, all: boolean): void {
        const free = (x: number, y: number): boolean => all ? this.place_empty(x, y) : this.place_free(x, y)
        const nx = this.x + this.hspeed, ny = this.y + this.vspeed
        if (free(nx, ny)) return  // path is clear — nothing to bounce off
        const blocked_h = !free(this.x + this.hspeed, this.y)
        const blocked_v = !free(this.x, this.y + this.vspeed)
        if (blocked_h) this.hspeed = -this.hspeed
        if (blocked_v) this.vspeed = -this.vspeed
        if (!blocked_h && !blocked_v) { this.hspeed = -this.hspeed; this.vspeed = -this.vspeed }  // corner
        this.speed = Math.hypot(this.hspeed, this.vspeed)
        if (this.hspeed !== 0 || this.vspeed !== 0) {
            this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI)
            if (this.direction < 0) this.direction += 360
        }
    }

    // =========================================================================
    // Motion planning steppers (GMS mp_*_step)
    // =========================================================================

    /** True if (x,y) is clear: `checkall` ⇒ no instances at all, else no solids. */
    private _mp_free(x: number, y: number, checkall: boolean): boolean {
        return checkall ? this.place_empty(x, y) : this.place_free(x, y)
    }

    /**
     * Moves up to `stepsize` straight toward (x, y), stopping if the step is blocked.
     * @param checkall - True = treat all instances as obstacles; false = only solids
     * @returns True once the instance is at the target
     */
    public mp_linear_step(x: number, y: number, stepsize: number, checkall: boolean): boolean {
        const dx = x - this.x, dy = y - this.y
        const dist = Math.hypot(dx, dy)
        if (dist < 1e-6) return true
        const step = Math.min(stepsize, dist)
        const nx = this.x + (dx / dist) * step
        const ny = this.y + (dy / dist) * step
        if (this._mp_free(nx, ny, checkall)) { this.x = nx; this.y = ny }
        return Math.hypot(x - this.x, y - this.y) < 1e-6
    }

    /** Like `mp_linear_step`, but only instances of `obj` block the move. */
    public mp_linear_step_object(x: number, y: number, stepsize: number, obj: typeof instance): boolean {
        const dx = x - this.x, dy = y - this.y
        const dist = Math.hypot(dx, dy)
        if (dist < 1e-6) return true
        const step = Math.min(stepsize, dist)
        const nx = this.x + (dx / dist) * step
        const ny = this.y + (dy / dist) * step
        if (!this.place_meeting(nx, ny, obj)) { this.x = nx; this.y = ny }
        return Math.hypot(x - this.x, y - this.y) < 1e-6
    }

    /**
     * Steps `stepsize` toward (x, y) while steering around obstacles (potential field).
     * Sweeps outward from the direct heading (see `mp_potential_settings`) for a free step.
     * @returns True once near the target
     */
    public mp_potential_step(x: number, y: number, stepsize: number, checkall: boolean): boolean {
        return this._mp_potential(x, y, stepsize, (nx, ny) => this._mp_free(nx, ny, checkall))
    }

    /** Like `mp_potential_step`, but only instances of `obj` block the move. */
    public mp_potential_step_object(x: number, y: number, stepsize: number, obj: typeof instance): boolean {
        return this._mp_potential(x, y, stepsize, (nx, ny) => !this.place_meeting(nx, ny, obj))
    }

    private _mp_potential(x: number, y: number, stepsize: number, is_free: (nx: number, ny: number) => boolean): boolean {
        const dx = x - this.x, dy = y - this.y
        const dist = Math.hypot(dx, dy)
        if (dist < 1e-6) return true
        const step = Math.min(stepsize, dist)
        const { maxrot, rotstep } = _mp_potential_settings()
        const rstep   = rotstep * (Math.PI / 180)
        const max_rad = maxrot  * (Math.PI / 180)
        const desired = Math.atan2(dy, dx)   // screen-space heading toward target (y-down)
        let dir = Number.isNaN(this._mp_dir) ? desired : this._mp_dir
        const free_at = (d: number): boolean => is_free(this.x + Math.cos(d) * step, this.y + Math.sin(d) * step)

        // Steer toward the target by a limited turn if that step is free; otherwise keep heading
        // momentum and search outward from the current heading for the smallest free turn. The
        // momentum (persisted _mp_dir) is what lets it wall-follow around an obstacle instead of
        // oscillating against it.
        const want = this._approach_angle(dir, desired, rstep)
        if (free_at(want)) {
            dir = want
        } else {
            let found = false
            for (let a = rstep; a <= max_rad + 1e-6 && !found; a += rstep) {
                for (const sgn of [1, -1]) {
                    if (free_at(dir + sgn * a)) { dir += sgn * a; found = true; break }
                }
            }
            if (!found) { this._mp_dir = dir; return false }   // boxed in
        }

        this._mp_dir = dir
        this.x += Math.cos(dir) * step
        this.y += Math.sin(dir) * step
        this.direction = (((-dir * 180) / Math.PI) % 360 + 360) % 360
        return Math.hypot(x - this.x, y - this.y) < stepsize
    }

    /** Rotates `from` toward `to` by at most `max_step` radians, the short way. */
    private _approach_angle(from: number, to: number, max_step: number): number {
        let diff = to - from
        while (diff >  Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI
        if (Math.abs(diff) <= max_step) return to
        return from + Math.sign(diff) * max_step
    }

    // =========================================================================
    // Path following (GMS path_start / path_end + the Path End event)
    // =========================================================================

    /**
     * Makes this instance follow a path.
     * @param path_id - The path resource to follow
     * @param speed - Pixels per step along the path
     * @param endaction - `path_action_*` (stop / restart / continue / reverse)
     * @param absolute - True = the path's own coordinates; false = offset so it starts at the instance
     */
    public path_start(path_id: number, speed: number, endaction: number = path_action_stop, absolute: boolean = true): void {
        if (!path_exists(path_id)) return
        this.path_index            = path_id
        this.path_speed            = speed
        this.path_endaction        = endaction
        this.path_position         = 0
        this.path_positionprevious = 0
        const sx = path_get_x(path_id, 0) * this.path_scale
        const sy = path_get_y(path_id, 0) * this.path_scale
        if (absolute) {
            this._path_off_x = 0
            this._path_off_y = 0
            this.x = sx
            this.y = sy
        } else {
            this._path_off_x = this.x - sx
            this._path_off_y = this.y - sy
        }
    }

    /** Stops following the current path (does not fire the Path End event). */
    public path_end(): void {
        this.path_index = -1
        this.path_speed = 0
    }

    /** Advances along the current path by `path_speed`, applying the end action and firing on_path_end. */
    private _advance_path(): void {
        const path = this.path_index
        const len  = path_get_length(path)
        if (len <= 0) { this.path_end(); return }

        this.path_positionprevious = this.path_position
        this.path_position += this.path_speed / len

        let ended = false
        if (this.path_position >= 1) {
            ended = true
            switch (this.path_endaction) {
                case path_action_restart:
                    this.path_position = ((this.path_position % 1) + 1) % 1
                    break
                case path_action_continue:
                    this.path_position = ((this.path_position % 1) + 1) % 1
                    this._path_off_x = this.x - path_get_x(path, this.path_position) * this.path_scale
                    this._path_off_y = this.y - path_get_y(path, this.path_position) * this.path_scale
                    break
                case path_action_reverse:
                    this.path_speed = -Math.abs(this.path_speed)
                    this.path_position = 1
                    break
                default: // path_action_stop
                    this.path_position = 1
            }
        } else if (this.path_position <= 0 && this.path_speed < 0) {
            ended = true
            switch (this.path_endaction) {
                case path_action_restart:
                    this.path_position = ((this.path_position % 1) + 1) % 1
                    break
                case path_action_reverse:
                    this.path_speed = Math.abs(this.path_speed)
                    this.path_position = 0
                    break
                default: // stop / continue
                    this.path_position = 0
            }
        }

        const t = Math.max(0, Math.min(1, this.path_position))
        this.x = path_get_x(path, t) * this.path_scale + this._path_off_x
        this.y = path_get_y(path, t) * this.path_scale + this._path_off_y

        if (ended) {
            if (this.path_endaction === path_action_stop) this.path_end()
            this.on_path_end()
        }
    }

    /** Read-only: the number of sub-images (frames) of the current sprite (GMS `image_number`). */
    public get image_number(): number {
        const s: any = resource.findByID(this.sprite_index)
        return s && Array.isArray(s.frames) ? s.frames.length : 0
    }

    /**
     * Calculates the distance to a point.
     * @param x - Target X position
     * @param y - Target Y position
     * @returns Distance in pixels
     */
    public point_distance(x: number, y: number): number {
        const dx = x - this.x
        const dy = y - this.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    /**
     * Calculates the direction toward a point.
     * @param x - Target X position
     * @param y - Target Y position
     * @returns Direction in degrees (0 = right, counter-clockwise)
     */
    public point_direction(x: number, y: number): number {
        const dir = Math.atan2(-(y - this.y), x - this.x) * (180 / Math.PI)
        return dir < 0 ? dir + 360 : dir
    }

    // =========================================================================
    // Drawing helpers
    // =========================================================================

    /**
     * Draws this instance's current sprite at its position with all image_ properties.
     * Call this from on_draw() or it will be called automatically if on_draw() is not overridden.
     */
    public draw_self(): void {
        if (this.sprite_index < 0 || !_renderer_draw_sprite_ext) return
        const spr = resource.findByID(this.sprite_index)
        if (!spr || !('frames' in spr)) return
        _renderer_draw_sprite_ext(
            spr as unknown as sprite,
            this.image_index,
            this.x, this.y,
            this.image_xscale, this.image_yscale,
            this.image_angle,
            this.image_blend,
            this.image_alpha
        )
    }

    // =========================================================================
    // Events (Override in subclasses)
    // =========================================================================

    /** Called once when the instance is created. */
    public on_create(): void {}

    /** Called once when the instance is destroyed. */
    public on_destroy(): void {}

    /** Called at the start of each step. */
    public on_step_begin(): void {}

    /** Called every step (main update logic). Override this in subclasses. */
    public on_step(): void {}

    /** Called at the end of each step. */
    public on_step_end(): void {}

    /**
     * Called every frame to draw the instance.
     * Default implementation calls draw_self() to draw sprite_index at (x, y).
     * Override to customize drawing behaviour.
     */
    public on_draw(): void {
        this.draw_self()
    }

    /** Called before the main Draw event (world space). Override to draw underlays. */
    public on_draw_begin(): void {}

    /** Called after the main Draw event (world space). Override to draw overlays. */
    public on_draw_end(): void {}

    /** Called every frame to draw GUI elements (fixed to the screen, not the room). */
    public on_draw_gui(): void {}

    // ── Alarm ────────────────────────────────────────────────────────────────
    /** Called when alarm[index] counts down to zero. */
    public on_alarm(_index: number): void {}

    // ── Keyboard (generic — check specific keys with keyboard_check* inside) ──
    /** Called the step any key is pressed. */
    public on_key_press(): void {}
    /** Called the step any key is released. */
    public on_key_release(): void {}
    /** Called every step any key is held down. */
    public on_key_held(): void {}

    // ── Mouse (fired only while the pointer is over this instance) ────────────
    /** Called when the left mouse button is pressed over this instance. */
    public on_mouse_left_press(): void {}
    /** Called when the left mouse button is released over this instance. */
    public on_mouse_left_release(): void {}
    /** Called when the right mouse button is pressed over this instance. */
    public on_mouse_right_press(): void {}

    // ── Collision ─────────────────────────────────────────────────────────────
    /** Called for each other instance this one overlaps this step. */
    public on_collision(_other: instance): void {}

    // ── Room / Game lifecycle ────────────────────────────────────────────────
    /** Called when the room this instance is in starts. */
    public on_room_start(): void {}
    /** Called when the room this instance is in ends (before leaving it). */
    public on_room_end(): void {}
    /** Called once when the game starts, for instances present in the first room. */
    public on_game_start(): void {}
    /** Called once when the game ends. */
    public on_game_end(): void {}

    // ── Other ─────────────────────────────────────────────────────────────────
    /** Called when the sprite animation completes a loop. */
    public on_animation_end(): void {}
    /** Called when path following ends. */
    public on_path_end(): void {}
    /** Called each step while the instance's bbox is entirely outside the room. */
    public on_outside_room(): void {}
    /** Called each step while the instance's bbox crosses a room edge. */
    public on_intersect_boundary(): void {}
    /** A user-defined event (0–15), triggered by `event_user(index)`. */
    public on_user(index: number): void { void index }
    /** Called once when `lives` transitions to ≤ 0. */
    public on_no_more_lives(): void {}
    /** Called once when `health` transitions to ≤ 0. */
    public on_no_more_health(): void {}

    /** Triggers this instance's user event `index` (0–15) → `on_user(index)`. */
    public event_user(index: number): void {
        if (index >= 0 && index <= 15) this.on_user(index)
    }

    /** Fires the Outside Room / Intersect Boundary events when the bbox leaves/crosses the room. */
    private _process_boundary_events(): void {
        const rm = this.room
        if (!rm) return
        const outside = this.bbox_right < 0 || this.bbox_left > rm.room_width ||
                        this.bbox_bottom < 0 || this.bbox_top > rm.room_height
        if (outside) {
            this.on_outside_room()
            if (this._destroyed) return
        } else if (this.bbox_left < 0 || this.bbox_top < 0 ||
                   this.bbox_right > rm.room_width || this.bbox_bottom > rm.room_height) {
            this.on_intersect_boundary()
        }
    }
}

// =========================================================================
// With-object iteration (GMS-style)
// =========================================================================

/**
 * Iterates over all active instances of a given object class and runs a callback.
 * The callback receives each instance as `self`.
 *
 * @param obj - Object class to iterate, or an array of instances
 * @param callback - Function called for each matching instance
 */
export function with_object<T extends instance>(
    obj: typeof instance | T[],
    callback: (self: T) => void
): void {
    if (Array.isArray(obj)) {
        for (const inst of obj) {
            if (inst.active) callback(inst)
        }
        return
    }
    const rm = game_loop.room
    if (!rm) return
    for (const inst of rm.instance_get_all()) {
        if (inst instanceof obj && inst.active) {
            callback(inst as T)
        }
    }
}

// =========================================================================
// Collision query functions (GMS-style free functions)
// =========================================================================
// For all of these, pass the base `instance` class as `obj` to match "all".

/** Returns the first instance of obj whose mask contains the point (x, y), or undefined. */
export function collision_point(x: number, y: number, obj: typeof instance): instance | undefined {
    const rm = game_loop.room
    if (!rm) return undefined
    for (const inst of rm.instance_get_all()) {
        if (inst instanceof obj && inst.active && point_in_instance(x, y, inst)) return inst
    }
    return undefined
}

/** True if any instance of obj has its mask at the point (x, y). */
export function position_meeting(x: number, y: number, obj: typeof instance): boolean {
    return collision_point(x, y, obj) !== undefined
}

/** Destroys every instance whose mask contains the point (x, y). */
export function position_destroy(x: number, y: number): void {
    const rm = game_loop.room
    if (!rm) return
    for (const inst of rm.instance_get_all()) {
        if (inst.active && point_in_instance(x, y, inst)) inst.instance_destroy()
    }
}

/** Returns the first instance of obj overlapping the rectangle (x1,y1)-(x2,y2), or undefined. */
export function collision_rectangle(x1: number, y1: number, x2: number, y2: number, obj: typeof instance): instance | undefined {
    const rm = game_loop.room
    if (!rm) return undefined
    for (const inst of rm.instance_get_all()) {
        if (inst instanceof obj && inst.active && rect_in_instance(x1, y1, x2, y2, inst)) return inst
    }
    return undefined
}

/** Returns the first instance of obj overlapping the circle at (x, y) with the given radius, or undefined. */
export function collision_circle(x: number, y: number, radius: number, obj: typeof instance): instance | undefined {
    const rm = game_loop.room
    if (!rm) return undefined
    for (const inst of rm.instance_get_all()) {
        if (inst instanceof obj && inst.active && circle_in_instance(x, y, radius, inst)) return inst
    }
    return undefined
}

/** Returns the first instance of obj whose mask the line segment (x1,y1)-(x2,y2) crosses, or undefined. */
export function collision_line(x1: number, y1: number, x2: number, y2: number, obj: typeof instance): instance | undefined {
    const rm = game_loop.room
    if (!rm) return undefined
    for (const inst of rm.instance_get_all()) {
        if (inst instanceof obj && inst.active && line_in_instance(x1, y1, x2, y2, inst)) return inst
    }
    return undefined
}
