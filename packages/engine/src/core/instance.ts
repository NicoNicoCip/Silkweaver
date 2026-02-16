import { EVENT_TYPE } from "./game_event.js"
import { game_loop } from "./game_loop.js"
import { resource } from "./resource.js"
import type { room } from "./room.js"
import { instances_collide, update_bbox, point_in_instance } from "../collision/collision.js"
import type { sprite } from "../drawing/sprite.js"

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

    // Cached bounding box — updated each step before collision checks
    public bbox_left:   number = 0      // Left edge of collision bounding box
    public bbox_top:    number = 0      // Top edge of collision bounding box
    public bbox_right:  number = 0      // Right edge of collision bounding box
    public bbox_bottom: number = 0      // Bottom edge of collision bounding box

    // Bound event handlers — stored so unregister() can match the exact same function reference
    private _bound_step_begin: Function = () => {}
    private _bound_step:       Function = () => {}
    private _bound_step_end:   Function = () => {}
    private _bound_draw:       Function = () => {}
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
        this._bound_draw       = this.internal_draw.bind(this)
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
     * Destroys this instance, removing it from the room.
     * Queues the destroy event to run at the end of the current step.
     */
    public instance_destroy(): void {
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
        game_loop.register(EVENT_TYPE.draw,       this._bound_draw)
        game_loop.register(EVENT_TYPE.draw_gui,   this._bound_draw_gui)
    }

    /**
     * Unregisters this instance's event handlers from the game loop.
     */
    private unregister_events(): void {
        game_loop.unregister(EVENT_TYPE.step_begin, this._bound_step_begin)
        game_loop.unregister(EVENT_TYPE.step,       this._bound_step)
        game_loop.unregister(EVENT_TYPE.step_end,   this._bound_step_end)
        game_loop.unregister(EVENT_TYPE.draw,       this._bound_draw)
        game_loop.unregister(EVENT_TYPE.draw_gui,   this._bound_draw_gui)
    }

    /**
     * Internal step: physics, animation, bbox update, then calls on_step().
     */
    private internal_step(): void {
        if (!this.active) return

        this.xprevious = this.x
        this.yprevious = this.y

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

        // Advance animation and wrap around the sprite's frame count
        if (this.image_speed !== 0 && this.sprite_index >= 0) {
            const spr = resource.findByID(this.sprite_index)
            const frame_count = (spr && 'frames' in spr) ? (spr as any).frames.length : 1
            if (frame_count > 0) {
                this.image_index = (this.image_index + this.image_speed) % frame_count
                if (this.image_index < 0) this.image_index += frame_count
            }
        }

        // Update cached bounding box
        update_bbox(this)

        this.on_step()
    }

    /**
     * Internal draw: skips hidden instances, then calls on_draw().
     * If on_draw() has not been overridden, draws the current sprite automatically.
     */
    private internal_draw(): void {
        if (!this.visible || !this.active) return
        this.on_draw()
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

    /** Called every frame to draw GUI elements (fixed to the screen, not the room). */
    public on_draw_gui(): void {}
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
