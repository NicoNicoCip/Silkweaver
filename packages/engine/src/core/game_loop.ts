import { EVENT_TYPE, game_event } from "./game_event.js"
import { room } from "./room.js"
import { resource } from "./resource.js"
import { keyboard_manager } from "../input/keyboard.js"
import { mouse_manager } from "../input/mouse.js"
import { gamepad_manager } from "../input/gamepad.js"
import { touch_manager } from "../input/touch.js"
import { physics_world_get_engine, physics_world_step } from "../physics/physics_world.js"
import { _consume_no_more_lives, _consume_no_more_health, _reset_game_state } from "./game_state.js"

/** Injected by renderer.init() — called at the start of every draw frame. */
let _begin_frame: (() => void) | null = null
/** Injected by renderer.init() — called at the end of every draw frame. */
let _end_frame:   (() => void) | null = null
/**
 * Injected by renderer.init() — renders the room's views/backgrounds/tiles,
 * running the supplied instance-draw callback once per visible view.
 */
let _draw_room: ((rm: room, run_instances: () => void) => void) | null = null

/** Max real time (ms) fed into the fixed-step accumulator per frame — caps catch-up after a stall. */
const MAX_CATCHUP_MS = 250

/**
 * Registers frame begin/end callbacks from the renderer.
 * Must be called from renderer.init() before the loop starts.
 */
export function set_frame_hooks(begin: () => void, end: () => void): void {
    _begin_frame = begin
    _end_frame   = end
}

/**
 * Registers the room render callback from the renderer (views/backgrounds/tiles).
 * Must be called from renderer.init() before the loop starts.
 */
export function set_room_render_hook(fn: (rm: room, run_instances: () => void) => void): void {
    _draw_room = fn
}

/**
 * Core game loop that handles update and draw cycles.
 * Uses a fixed timestep for updates and runs drawing once per frame.
 */
export abstract class game_loop {
    private static room_speed: number = 60          // Target frames per second for the update loop
    private static room_delta: number = 0.0         // Time elapsed since last frame in milliseconds
    private static last_delta: number = 0.0         // Timestamp of the previous frame
    private static accumulator: number = 0          // Accumulated time for fixed timestep updates
    public static fps: number = 0                   // Frames drawn in the last second (measured)
    public static fps_real: number = 0              // Instantaneous uncapped FPS (1000 / frame time)
    public static delta_time_us: number = 0         // Microseconds elapsed during the previous frame
    private static _fps_frames: number = 0          // Frame counter for the current fps sample window
    private static _fps_accum: number = 0           // Accumulated ms for the current fps sample window
    public static room: room = null!                // The current active room
    public static room_first: number = -1           // ID of the first room in the game
    public static room_last: number = 0             // ID of the last room in the game
    private static _canvas: HTMLCanvasElement | null = null  // Canvas for mouse/touch attachment
    private static _pending_game_start: boolean = false      // Fire Game Start at the next update
    private static _pending_room_start: boolean = false      // Fire Room Start at the next update
    private static _stopped: boolean = false                 // Set by end() to halt the loop

    // Map of update event types to their registered event handlers
    private static update_events: Map<EVENT_TYPE, game_event[]> = new Map()
    // Map of draw event types to their registered event handlers
    private static draw_events: Map<EVENT_TYPE, game_event[]> = new Map()

    /**
     * Attaches input systems to the given canvas.
     * Must be called before start() if mouse or touch input is needed.
     * @param canvas - The game canvas element
     */
    public static init_input(canvas: HTMLCanvasElement): void {
        this._canvas = canvas
        keyboard_manager.attach()
        mouse_manager.attach(canvas)
        touch_manager.attach(canvas)
    }

    /**
     * Starts the game loop.
     * Initializes timing values and begins the requestAnimationFrame cycle.
     */
    public static start(room?: room): void {
        if (room) {
            this.room = room;
            this.room_first = room.id
        }

        // Build the starting room from its definition (creates instances, queues Create events).
        if (this.room) this.room.build_for_entry()

        // Game Start + Room Start fire on the first update (after Create events).
        this._pending_game_start = true
        this._pending_room_start = true
        this._stopped = false

        this.last_delta = performance.now()

        requestAnimationFrame(this.tick.bind(this));
    }

    /**
     * Main loop tick called every frame by requestAnimationFrame.
     * Handles timing, runs fixed timestep updates, and draws once per frame.
     * @param current - The current timestamp provided by requestAnimationFrame
     */
    private static tick(current: number): void {
        if (this._stopped) return
        this.room_delta = current - this.last_delta
        this.last_delta = current
        // Clamp the catch-up budget: after a long stall (backgrounded tab, paused
        // debugger), room_delta can be seconds — feeding that raw into the fixed-step
        // accumulator would run hundreds of updates at once (spiral of death / freeze).
        this.accumulator += Math.min(this.room_delta, MAX_CATCHUP_MS)

        // Frame timing globals (fps / fps_real / delta_time).
        this.delta_time_us = this.room_delta * 1000
        this.fps_real = this.room_delta > 0 ? Math.round(1000 / this.room_delta) : 0
        this._fps_accum  += this.room_delta
        this._fps_frames += 1
        if (this._fps_accum >= 1000) {
            this.fps = this._fps_frames
            this._fps_frames = 0
            this._fps_accum -= 1000
        }

        const frameTime = 1000 / this.room_speed

        while (this.accumulator >= frameTime) {
            this.update()
            this.accumulator -= frameTime
        }

        this.draw()

        requestAnimationFrame(this.tick.bind(this))
    }

    /**
     * Runs all update events in GMS order.
     * Create and destroy events run once and are cleared after execution.
     * Input polling happens before events; end_step clears edge-trigger state after.
     */
    private static update(): void {
        // Poll input devices before any game logic runs
        gamepad_manager.poll()

        const createEvents = [...(this.update_events.get(EVENT_TYPE.create) ?? [])]
        this.update_events.set(EVENT_TYPE.create, [])
        createEvents.forEach(e => e.run())

        // Game Start then Room Start fire once, after Create events have run.
        if (this._pending_game_start) { this._pending_game_start = false; this._dispatch_lifecycle('on_game_start') }
        if (this._pending_room_start) {
            this._pending_room_start = false
            // Room creation code runs before the instances' Room Start events.
            if (this.room?.creation_code) this.room.creation_code()
            this._dispatch_lifecycle('on_room_start')
        }

        this.update_events.get(EVENT_TYPE.step_begin)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.step)?.forEach(e => e.run())
        this._step_physics()
        this.update_events.get(EVENT_TYPE.step_end)?.forEach(e => e.run())

        // GMS built-in life/health events: fire once when either drops to ≤ 0.
        if (_consume_no_more_lives())  this._dispatch_lifecycle('on_no_more_lives')
        if (_consume_no_more_health()) this._dispatch_lifecycle('on_no_more_health')

        this.update_events.get(EVENT_TYPE.collision)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.keyboard)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.mouse)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.other)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.async)?.forEach(e => e.run())

        const destroyEvents = [...(this.update_events.get(EVENT_TYPE.destroy) ?? [])]
        this.update_events.set(EVENT_TYPE.destroy, [])
        destroyEvents.forEach(e => e.run())

        // Clear edge-trigger state (pressed/released) after all events have fired
        keyboard_manager.end_step()
        mouse_manager.end_step()
        touch_manager.end_step()
    }

    /**
     * Advances the physics world (if one exists) and syncs physics instances.
     * Runs between Step and End Step, matching GMS ordering. No-op for non-physics games.
     */
    private static _step_physics(): void {
        if (!physics_world_get_engine() || !this.room) return
        const instances = this.room.instance_get_all()
        for (const inst of instances) inst.phy_ensure_body()
        physics_world_step()
        for (const inst of instances) if (inst.active) inst.phy_sync_from_body()
    }

    /**
     * Runs all draw events in GMS order.
     * Called once per frame after all updates have completed.
     * begin_frame clears the canvas; end_frame flushes the batch.
     */
    private static draw(): void {
        _begin_frame?.()
        // World-space draws run in depth order (higher depth first = further back),
        // in three passes (Draw Begin → Draw → Draw End), matching GMS.
        const run_instances = () => {
            const rm = this.room
            if (!rm) return
            const insts = rm.instance_get_all()
                .filter(i => i.active && i.visible)
                .sort((a, b) => b.depth - a.depth)
            for (const i of insts) i.run_draw_begin()
            for (const i of insts) i.run_draw()
            for (const i of insts) i.run_draw_end()
        }
        if (_draw_room && this.room) {
            // Renderer draws views/backgrounds/tiles and interleaves instance draws per view.
            _draw_room(this.room, run_instances)
        } else {
            run_instances()
        }
        // GUI always draws in screen space (the room render hook resets the camera first).
        this.draw_events.get(EVENT_TYPE.draw_gui)?.forEach(e => e.run())
        _end_frame?.()
    }

    /**
     * Registers a function to be called for a specific event type.
     * @param event - The event type to register for
     * @param func - The function to call when the event fires
     */
    public static register(event: EVENT_TYPE, func: Function) {
        const targetMap = (event === EVENT_TYPE.draw_begin || event === EVENT_TYPE.draw ||
                            event === EVENT_TYPE.draw_end   || event === EVENT_TYPE.draw_gui)
            ? this.draw_events
            : this.update_events

        const existing = targetMap.get(event) ?? []
        existing.push(new game_event(func, event))
        targetMap.set(event, existing)
    }

    /**
     * Unregisters a function from a specific event type.
     * @param event - The event type to unregister from
     * @param func - The function to remove
     */
    public static unregister(event: EVENT_TYPE, func: Function) {
        const targetMap = (event === EVENT_TYPE.draw_begin || event === EVENT_TYPE.draw ||
                            event === EVENT_TYPE.draw_end   || event === EVENT_TYPE.draw_gui)
            ? this.draw_events
            : this.update_events

        const existing = targetMap.get(event) ?? []
        const filtered = existing.filter(e => e.event !== func)
        targetMap.set(event, filtered)
    }

    /**
     * Transitions to a new room, clearing current events and loading the new room's state.
     * @param room - The room to transition to
     */
    public static change_room(room: room) {
        // Room End fires for the outgoing room's instances before we leave.
        this._dispatch_lifecycle('on_room_end')

        // A non-persistent room discards its live state when left, so the next visit rebuilds
        // fresh; a persistent room keeps its instances/variables for when it is re-entered.
        const leaving = this.room
        if (leaving && leaving !== room && !leaving.room_persistent) {
            leaving.reset_contents()
            leaving.built = false
        }

        this.update_events.clear()
        this.draw_events.clear()
        this.room = room
        this.room_speed = room.room_speed

        // Rebuild from the definition (fresh), or restore a persistent room's saved state.
        // Room Start fires on the next update, after any new Create events.
        room.build_for_entry()
        this._pending_room_start = true
    }

    /**
     * Ends the game: fires the Game End event for all instances, then halts the loop.
     */
    public static end(): void {
        this._dispatch_lifecycle('on_game_end')
        this._stopped = true
    }

    /**
     * Restarts the game by returning to the first room.
     */
    public static restart(): void {
        _reset_game_state()
        const first = resource.findByID(this.room_first)
        if (first instanceof room) {
            first.built = false   // force a fresh rebuild even if the start room is persistent
            this.change_room(first)
        }
    }

    /**
     * Calls a lifecycle event method on every active instance in the current room.
     * @param method - Name of the lifecycle method to invoke
     */
    private static _dispatch_lifecycle(
        method: 'on_room_start' | 'on_room_end' | 'on_game_start' | 'on_game_end'
              | 'on_no_more_lives' | 'on_no_more_health',
    ): void {
        if (!this.room) return
        for (const inst of this.room.instance_get_all()) {
            if (inst.active) inst[method]()
        }
    }
}

// =========================================================================
// Game lifecycle (GMS-style free functions)
// =========================================================================

/** Ends the game: fires Game End events, then stops the loop. */
export function game_end(): void {
    game_loop.end()
}

/** Restarts the game from the first room. */
export function game_restart(): void {
    game_loop.restart()
}
