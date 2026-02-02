import { EVENT_TYPE } from "./game_event";
import { game_loop } from "./game_loop";
import { resource } from "./resource";
import type { room } from "./room";

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
    // Collision
    // =========================================================================

    public mask_index: number = -1      // Collision mask sprite ID (-1 = use sprite_index)
    public solid: boolean = false       // Whether the instance blocks movement
    public persistent: boolean = false  // Whether the instance persists across rooms

    /**
     * Creates a new instance in the specified room.
     * @param room - The room this instance will belong to
     */
    constructor(room: room) {
        super()
        this.room = room
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

        // Set position
        inst.x = x
        inst.y = y
        inst.xstart = x
        inst.ystart = y
        inst.xprevious = x
        inst.yprevious = y

        // Add to room
        currentRoom.instance_add(inst)

        // Register events with game_loop
        inst.register_events()

        // Queue create event
        game_loop.register(EVENT_TYPE.create, inst.on_create.bind(inst))

        return inst
    }

    /**
     * Destroys this instance, removing it from the room.
     * Queues the destroy event to run at the end of the current step.
     */
    public instance_destroy(): void {
        // Queue destroy event
        game_loop.register(EVENT_TYPE.destroy, this.on_destroy.bind(this))

        // Unregister events from game_loop
        this.unregister_events()

        // Remove from room
        this.room.instance_remove(this.id)

        // Remove from resource registry
        resource.removeByID(this.id)
    }

    /**
     * Registers this instance's event handlers with the game loop.
     */
    public register_events(): void {
        game_loop.register(EVENT_TYPE.step_begin, this.on_step_begin.bind(this))
        game_loop.register(EVENT_TYPE.step, this.internal_step.bind(this))
        game_loop.register(EVENT_TYPE.step_end, this.on_step_end.bind(this))
        game_loop.register(EVENT_TYPE.draw, this.on_draw.bind(this))
        game_loop.register(EVENT_TYPE.draw_gui, this.on_draw_gui.bind(this))
    }

    /**
     * Unregisters this instance's event handlers from the game loop.
     */
    private unregister_events(): void {
        game_loop.unregister(EVENT_TYPE.step_begin, this.on_step_begin.bind(this))
        game_loop.unregister(EVENT_TYPE.step, this.internal_step.bind(this))
        game_loop.unregister(EVENT_TYPE.step_end, this.on_step_end.bind(this))
        game_loop.unregister(EVENT_TYPE.draw, this.on_draw.bind(this))
        game_loop.unregister(EVENT_TYPE.draw_gui, this.on_draw_gui.bind(this))
    }

    /**
     * Internal step function that handles built-in movement and calls user's on_step.
     */
    private internal_step(): void {
        // Store previous position
        this.xprevious = this.x
        this.yprevious = this.y

        // Apply gravity
        if (this.gravity !== 0) {
            const grav_rad = this.gravity_direction * (Math.PI / 180)
            this.hspeed += Math.cos(grav_rad) * this.gravity
            this.vspeed -= Math.sin(grav_rad) * this.gravity
        }

        // Apply friction
        if (this.friction !== 0 && (this.hspeed !== 0 || this.vspeed !== 0)) {
            const currentSpeed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed)
            const newSpeed = Math.max(0, currentSpeed - this.friction)
            if (currentSpeed > 0) {
                const ratio = newSpeed / currentSpeed
                this.hspeed *= ratio
                this.vspeed *= ratio
            }
        }

        // Update speed and direction from hspeed/vspeed
        this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed)
        if (this.hspeed !== 0 || this.vspeed !== 0) {
            this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI)
            if (this.direction < 0) this.direction += 360
        }

        // Apply movement
        this.x += this.hspeed
        this.y += this.vspeed

        // Update animation
        this.image_index += this.image_speed

        // Call user's step event
        this.on_step()
    }

    /**
     * Checks if an instance with the given ID exists.
     * @param id - The instance ID to check
     * @returns True if the instance exists
     */
    public static instance_exists(id: number): boolean {
        const res = resource.findByID(id)
        if (res === undefined) return false
        return res.constructor.name === "instance" || res instanceof instance
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

    // =========================================================================
    // Movement
    // =========================================================================

    /**
     * Sets the instance's motion using speed and direction.
     * @param dir - Direction in degrees (0 = right)
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
        // Update speed and direction
        this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed)
        if (this.hspeed !== 0 || this.vspeed !== 0) {
            this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI)
            if (this.direction < 0) this.direction += 360
        }
    }

    /**
     * Moves the instance toward a point.
     * @param x - Target X position
     * @param y - Target Y position
     * @param spd - Speed to move at
     */
    public move_towards_point(x: number, y: number, spd: number): void {
        const dir = Math.atan2(-(y - this.y), x - this.x) * (180 / Math.PI)
        this.motion_set(dir < 0 ? dir + 360 : dir, spd)
    }

    /**
     * Moves the instance by the given amount, stopping at solid instances.
     * @param hspd - Horizontal movement
     * @param vspd - Vertical movement
     * @returns True if the movement was blocked
     */
    public move_contact_solid(hspd: number, vspd: number): boolean {
        // Basic implementation - collision detection will be expanded in Phase 4
        this.x += hspd
        this.y += vspd
        return false
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
     * Calculates the direction to a point.
     * @param x - Target X position
     * @param y - Target Y position
     * @returns Direction in degrees (0 = right)
     */
    public point_direction(x: number, y: number): number {
        const dir = Math.atan2(-(y - this.y), x - this.x) * (180 / Math.PI)
        return dir < 0 ? dir + 360 : dir
    }

    // =========================================================================
    // Events (Override in subclasses)
    // =========================================================================

    /**
     * Called once when the instance is created.
     */
    public on_create(): void {
        // Override in subclass
    }

    /**
     * Called once when the instance is destroyed.
     */
    public on_destroy(): void {
        // Override in subclass
    }

    /**
     * Called at the start of each step.
     */
    public on_step_begin(): void {
        // Override in subclass
    }

    /**
     * Called every step (main update logic).
     */
    public on_step(): void {
        // Override in subclass
    }

    /**
     * Called at the end of each step.
     */
    public on_step_end(): void {
        // Override in subclass
    }

    /**
     * Called every frame to draw the instance.
     */
    public on_draw(): void {
        // TODO: Default implementation draws sprite_index at x, y
    }

    /**
     * Called every frame to draw GUI elements (fixed to screen).
     */
    public on_draw_gui(): void {
        // Override in subclass
    }
}