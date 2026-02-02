/**
 * Enum of all supported event types in the game loop.
 */
export enum EVENT_TYPE {
    none = "NONE",              // Default/unset event type
    create = "CREATE",          // Runs once when instance is created
    destroy = "DESTROY",        // Runs once when instance is destroyed
    step_begin = "STEP_BEGIN",  // Runs at the start of each step
    step = "STEP",              // Main step event, runs every frame
    step_end = "STEP_END",      // Runs at the end of each step
    collision = "COLLISION",    // Runs when collision is detected
    keyboard = "KEYBOARD",      // Runs on keyboard input
    mouse = "MOUSE",            // Runs on mouse input
    other = "OTHER",            // Miscellaneous events (room start/end, etc.)
    async = "ASYNC",            // Async callback events (HTTP, networking)
    draw = "DRAW",              // Main draw event
    draw_gui = "DRAW_GUI"       // GUI draw event (fixed to screen)
}

/**
 * Wrapper class for an event function and its type.
 */
export class game_event {
    public event: Function = (): void => { }    // The function to execute
    public type: EVENT_TYPE = EVENT_TYPE.none   // The event type category

    /**
     * Creates a new game event.
     * @param event - The function to call when the event fires
     * @param type - The event type category
     */
    constructor(event: Function = ():void => {}, type: EVENT_TYPE = EVENT_TYPE.none) {
        this.event = event
        this.type = type
    }

    /**
     * Executes the event function.
     */
    public run() {
        this.event();
    }
}
