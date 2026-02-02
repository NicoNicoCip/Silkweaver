import { EVENT_TYPE, game_event } from "./game_event.js"
import { room } from "./room.js"

/**
 * Core game loop that handles update and draw cycles.
 * Uses a fixed timestep for updates and runs drawing once per frame.
 */
export abstract class game_loop {
    private static room_speed: number = 60          // Target frames per second for the update loop
    private static room_delta: number = 0.0         // Time elapsed since last frame in milliseconds
    private static last_delta: number = 0.0         // Timestamp of the previous frame
    private static accumulator: number = 0          // Accumulated time for fixed timestep updates
    public static room: room = null!                // The current active room
    public static room_first: number = -1           // ID of the first room in the game
    public static room_last: number = 0             // ID of the last room in the game

    // Map of update event types to their registered event handlers
    private static update_events: Map<EVENT_TYPE, game_event[]> = new Map()
    // Map of draw event types to their registered event handlers
    private static draw_events: Map<EVENT_TYPE, game_event[]> = new Map()

    /**
     * Starts the game loop.
     * Initializes timing values and begins the requestAnimationFrame cycle.
     */
    public static start(room?: room): void {
        if (room) {
            this.room = room;
            this.room_first = room.id
        }

        this.last_delta = performance.now()

        requestAnimationFrame(this.tick.bind(this));
    }

    /**
     * Main loop tick called every frame by requestAnimationFrame.
     * Handles timing, runs fixed timestep updates, and draws once per frame.
     * @param current - The current timestamp provided by requestAnimationFrame
     */
    private static tick(current: number): void {
        this.room_delta = current - this.last_delta
        this.last_delta = current
        this.accumulator += this.room_delta

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
     */
    private static update(): void {
        const createEvents = [...(this.update_events.get(EVENT_TYPE.create) ?? [])]
        this.update_events.set(EVENT_TYPE.create, [])
        createEvents.forEach(e => e.run())

        this.update_events.get(EVENT_TYPE.step_begin)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.step)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.step_end)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.collision)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.keyboard)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.mouse)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.other)?.forEach(e => e.run())
        this.update_events.get(EVENT_TYPE.async)?.forEach(e => e.run())

        const destroyEvents = [...(this.update_events.get(EVENT_TYPE.destroy) ?? [])]
        this.update_events.set(EVENT_TYPE.destroy, [])
        destroyEvents.forEach(e => e.run())
    }

    /**
     * Runs all draw events in GMS order.
     * Called once per frame after all updates have completed.
     */
    private static draw(): void {
        this.draw_events.get(EVENT_TYPE.draw)?.forEach(e => e.run())
        this.draw_events.get(EVENT_TYPE.draw_gui)?.forEach(e => e.run())
    }

    /**
     * Registers a function to be called for a specific event type.
     * @param event - The event type to register for
     * @param func - The function to call when the event fires
     */
    public static register(event: EVENT_TYPE, func: Function) {
        const targetMap = (event === EVENT_TYPE.draw || event === EVENT_TYPE.draw_gui)
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
        const targetMap = (event === EVENT_TYPE.draw || event === EVENT_TYPE.draw_gui)
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
        if (this.room && this.room.room_persistent) {
            // TODO: save the room data somewhere as cache.
        }

        this.update_events.clear()
        this.draw_events.clear()
        this.room = room
        this.room_speed = room.room_speed

        // Register events for all instances in the new room
        room.register_all_instances()

        // TODO: load room cache if it exists
    }
}
