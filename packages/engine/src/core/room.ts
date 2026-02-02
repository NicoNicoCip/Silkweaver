import { EVENT_TYPE } from "./game_event";
import { game_loop } from "./game_loop";
import type { instance } from "./instance";
import { resource } from "./resource";

/**
 * Data structure representing a single tile in a room.
 */
interface tile_data {
    id: number              // Unique tile ID
    x: number               // X position in the room
    y: number               // Y position in the room
    background: number      // Background resource ID containing the tile
    left: number            // Left offset in the background
    top: number             // Top offset in the background
    width: number           // Width of the tile
    height: number          // Height of the tile
    depth: number           // Drawing depth
    xscale: number          // Horizontal scale factor
    yscale: number          // Vertical scale factor
    alpha: number           // Transparency (0-1)
    visible: boolean        // Whether the tile is visible
}

/**
 * Represents a game room containing instances, backgrounds, and views.
 * Rooms define the playable spaces where game logic executes.
 */
export class room extends resource {
    public room_width: number = 640                             // Width of the room in pixels
    public room_height: number = 480                            // Height of the room in pixels
    public room_caption: string = `Room ${this.id}`             // Window caption when room is active
    public room_speed: number = 60                              // Target frames per second for this room
    public room_persistent: boolean = false                     // Whether room state persists when leaving
    public room_previous: number = 0                            // ID of the previous room in order
    public room_next: number = 0                                // ID of the next room in order

    public background_visible: boolean[] = []                   // Whether each background layer is visible
    public background_foreground: boolean[] = []                // Whether background draws in front of instances
    public background_index: number[] = []                      // Background resource ID for each layer
    public background_x: number[] = []                          // X offset for each background
    public background_y: number[] = []                          // Y offset for each background
    public background_htiled: boolean[] = []                    // Whether background tiles horizontally
    public background_vtiled: boolean[] = []                    // Whether background tiles vertically
    public background_hspeed: number[] = []                     // Horizontal scroll speed for each background
    public background_vspeed: number[] = []                     // Vertical scroll speed for each background
    public background_color: number[] = []                      // Blend color for each background

    // =========================================================================
    // View Properties
    // =========================================================================

    public view_enabled: boolean = false                        // Whether views are enabled for this room
    public view_current: number = 0                             // Index of the currently drawing view
    public view_visible: boolean[] = []                         // Whether each view is enabled
    public view_xview: number[] = []                            // X position of each view in the room
    public view_yview: number[] = []                            // Y position of each view in the room
    public view_wview: number[] = []                            // Width of each view in the room
    public view_hview: number[] = []                            // Height of each view in the room
    public view_xport: number[] = []                            // X position of each viewport on screen
    public view_yport: number[] = []                            // Y position of each viewport on screen
    public view_wport: number[] = []                            // Width of each viewport on screen
    public view_hport: number[] = []                            // Height of each viewport on screen
    public view_hborder: number[] = []                          // Horizontal border for object following
    public view_vborder: number[] = []                          // Vertical border for object following
    public view_hspeed: number[] = []                           // Max horizontal speed when following
    public view_vspeed: number[] = []                           // Max vertical speed when following
    public view_object: number[] = []                           // Instance ID to follow (-1 for none)

    // =========================================================================
    // Tile Properties
    // =========================================================================

    private tiles: tile_data[] = []                             // All tiles in this room

    private all: Map<number, instance> = new Map()              // Instances in this room, keyed by ID

    constructor() {
        super()
    }

    // =========================================================================
    // Room Navigation
    // =========================================================================

    /**
     * Transitions to the specified room.
     * @param target - The room to go to (ID or room reference)
     */
    public room_goto(target: number | room): void {
        if(typeof(target) === "number") {
            const potential = resource.findByID(target)
            if(typeof(potential) === "undefined") {
                console.error(`ID ${target} does not exist.`);
                return
            }
            
            if (potential.constructor.name !== "room") {
                console.error(`ID ${target} is not a room.`)
                return
            }

            game_loop.change_room(potential as room)
            return
        }

        game_loop.change_room(target)
    }

    /**
     * Transitions to the previous room in the room order.
     */
    public room_goto_previous(): void {
        this.room_goto(this.room_previous)
    }

    /**
     * Transitions to the next room in the room order.
     */
    public room_goto_next(): void {
        this.room_goto(this.room_next)
    }

    /**
     * Restarts the current room, resetting all non-persistent instances.
     */
    public room_restart(): void {
        this.room_goto(this)
    }

    // =========================================================================
    // Room Queries
    // =========================================================================

    /**
     * Checks if a room with the given ID exists.
     * @param id - The room ID to check
     * @returns True if the room exists
     */
    public room_exists(id: number): boolean {
        const res = resource.findByID(id)

        if(typeof(res) === "undefined") {
            return false
        }

        if(res.constructor.name !== "room") {
            return false
        }

        return true
    }

    // =========================================================================
    // Instance Management
    // =========================================================================

    /**
     * Adds an instance to the room at design time (before room starts).
     * @param x - X position for the instance
     * @param y - Y position for the instance
     * @param obj - The instance to add
     */
    public room_instance_add(x: number, y: number, obj: instance): void {
        obj.x = x
        obj.y = y
        obj.xstart = x
        obj.ystart = y
        this.all.set(obj.id, obj)
    }

    /**
     * Adds an instance to this room at runtime.
     * @param inst - The instance to add
     */
    public instance_add(inst: instance): void {
        this.all.set(inst.id, inst)
    }

    /**
     * Removes an instance from this room by ID.
     * @param id - The instance ID to remove
     * @returns True if the instance was found and removed
     */
    public instance_remove(id: number): boolean {
        return this.all.delete(id)
    }

    /**
     * Gets an instance from this room by ID.
     * @param id - The instance ID to find
     * @returns The instance, or undefined if not found
     */
    public instance_get(id: number): instance | undefined {
        return this.all.get(id)
    }

    /**
     * Gets all instances in this room.
     * @returns Array of all instances
     */
    public instance_get_all(): instance[] {
        return Array.from(this.all.values())
    }

    /**
     * Gets the number of instances in this room.
     * @returns The instance count
     */
    public instance_count(): number {
        return this.all.size
    }

    /**
     * Removes all instances from the room's design-time instance list.
     */
    public room_instance_clear(): void {
        this.all.clear()
    }

    /**
     * Registers all instances in this room with the game loop.
     * Called when entering a room to set up event handlers.
     */
    public register_all_instances(): void {
        for (const inst of this.all.values()) {
            inst.register_events()
            // Queue create event for each instance
            game_loop.register(EVENT_TYPE.create, inst.on_create.bind(inst))
        }
    }

    // =========================================================================
    // Tile Management
    // =========================================================================

    /**
     * Adds a tile to the room at design time.
     * @param x - X position for the tile
     * @param y - Y position for the tile
     * @param background - Background resource containing the tile
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile
     * @param height - Height of the tile
     * @param depth - Drawing depth of the tile
     * @returns The unique ID of the created tile
     */
    public room_tile_add(
        x: number,
        y: number,
        background: number,
        left: number,
        top: number,
        width: number,
        height: number,
        depth: number
    ): number {
        return this.tile_add(background, left, top, width, height, x, y, depth)
    }

    /**
     * Adds a tile to the room at design time, with extended options.
     * @param x - X position for the tile
     * @param y - Y position for the tile
     * @param background - Background resource containing the tile
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile
     * @param height - Height of the tile
     * @param depth - Drawing depth of the tile
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     * @param alpha - Transparency (0-1)
     * @returns The unique ID of the created tile
     */
    public room_tile_add_ext(
        x: number,
        y: number,
        background: number,
        left: number,
        top: number,
        width: number,
        height: number,
        depth: number,
        xscale: number,
        yscale: number,
        alpha: number
    ): number {
        const id = room.next_tile_id++
        this.tiles.push({
            id, x, y, background, left, top, width, height, depth,
            xscale, yscale, alpha, visible: true
        })
        return id
    }

    /**
     * Removes all tiles from the room's design-time tile list.
     */
    public room_tile_clear(): void {
        this.tiles = []
    }

    // =========================================================================
    // Runtime Tile Functions
    // =========================================================================

    private static next_tile_id: number = 0     // Auto-incrementing tile ID counter

    /**
     * Adds a tile at runtime and returns its unique ID.
     * @param background - Background resource containing the tile
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile
     * @param height - Height of the tile
     * @param x - X position in the room
     * @param y - Y position in the room
     * @param depth - Drawing depth
     * @returns The unique ID of the created tile
     */
    public tile_add(
        background: number,
        left: number,
        top: number,
        width: number,
        height: number,
        x: number,
        y: number,
        depth: number
    ): number {
        const id = room.next_tile_id++
        this.tiles.push({
            id, x, y, background, left, top, width, height, depth,
            xscale: 1, yscale: 1, alpha: 1, visible: true
        })
        return id
    }

    /**
     * Deletes a tile by its ID.
     * @param id - The tile ID to delete
     * @returns True if the tile was found and deleted
     */
    public tile_delete(id: number): boolean {
        const index = this.tiles.findIndex(t => t.id === id)
        if (index === -1) return false
        this.tiles.splice(index, 1)
        return true
    }

    /**
     * Checks if a tile with the given ID exists.
     * @param id - The tile ID to check
     * @returns True if the tile exists
     */
    public tile_exists(id: number): boolean {
        return this.tiles.some(t => t.id === id)
    }

    /**
     * Gets the X position of a tile.
     * @param id - The tile ID
     * @returns The X position, or 0 if not found
     */
    public tile_get_x(id: number): number {
        return this.tiles.find(t => t.id === id)?.x ?? 0
    }

    /**
     * Gets the Y position of a tile.
     * @param id - The tile ID
     * @returns The Y position, or 0 if not found
     */
    public tile_get_y(id: number): number {
        return this.tiles.find(t => t.id === id)?.y ?? 0
    }

    /**
     * Gets the depth of a tile.
     * @param id - The tile ID
     * @returns The depth, or 0 if not found
     */
    public tile_get_depth(id: number): number {
        return this.tiles.find(t => t.id === id)?.depth ?? 0
    }

    /**
     * Gets the visibility of a tile.
     * @param id - The tile ID
     * @returns True if visible, false if not found or hidden
     */
    public tile_get_visible(id: number): boolean {
        return this.tiles.find(t => t.id === id)?.visible ?? false
    }

    /**
     * Sets the position of a tile.
     * @param id - The tile ID
     * @param x - New X position
     * @param y - New Y position
     */
    public tile_set_position(id: number, x: number, y: number): void {
        const tile = this.tiles.find(t => t.id === id)
        if (tile) {
            tile.x = x
            tile.y = y
        }
    }

    /**
     * Sets the depth of a tile.
     * @param id - The tile ID
     * @param depth - New depth value
     */
    public tile_set_depth(id: number, depth: number): void {
        const tile = this.tiles.find(t => t.id === id)
        if (tile) tile.depth = depth
    }

    /**
     * Sets the visibility of a tile.
     * @param id - The tile ID
     * @param visible - Whether the tile should be visible
     */
    public tile_set_visible(id: number, visible: boolean): void {
        const tile = this.tiles.find(t => t.id === id)
        if (tile) tile.visible = visible
    }

    /**
     * Sets the scale of a tile.
     * @param id - The tile ID
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     */
    public tile_set_scale(id: number, xscale: number, yscale: number): void {
        const tile = this.tiles.find(t => t.id === id)
        if (tile) {
            tile.xscale = xscale
            tile.yscale = yscale
        }
    }

    /**
     * Sets the alpha (transparency) of a tile.
     * @param id - The tile ID
     * @param alpha - Alpha value (0-1)
     */
    public tile_set_alpha(id: number, alpha: number): void {
        const tile = this.tiles.find(t => t.id === id)
        if (tile) tile.alpha = alpha
    }

    /**
     * Sets the background region of a tile.
     * @param id - The tile ID
     * @param background - Background resource ID
     * @param left - Left offset in the background
     * @param top - Top offset in the background
     * @param width - Width of the tile region
     * @param height - Height of the tile region
     */
    public tile_set_background(
        id: number, 
        background: number, 
        left: number, 
        top: number, 
        width: number, 
        height: number
    ): void {
        const tile = this.tiles.find(t => t.id === id)
        if (tile) {
            tile.background = background
            tile.left = left
            tile.top = top
            tile.width = width
            tile.height = height
        }
    }

    /**
     * Deletes all tiles at a specific depth.
     * @param depth - The depth to clear
     */
    public tile_layer_delete(depth: number): void {
        this.tiles = this.tiles.filter(t => t.depth !== depth)
    }

    /**
     * Shifts all tiles at a specific depth by the given amount.
     * @param depth - The depth layer to shift
     * @param x - Horizontal shift amount
     * @param y - Vertical shift amount
     */
    public tile_layer_shift(depth: number, x: number, y: number): void {
        this.tiles.filter(t => t.depth === depth).forEach(t => {
            t.x += x
            t.y += y
        })
    }

    /**
     * Finds a tile at the given position and depth.
     * @param x - X position to check
     * @param y - Y position to check
     * @param depth - Depth to check
     * @returns The tile ID, or -1 if not found
     */
    public tile_layer_find(x: number, y: number, depth: number): number {
        const tile = this.tiles.find(t =>
            t.depth === depth &&
            x >= t.x && x < t.x + t.width * t.xscale &&
            y >= t.y && y < t.y + t.height * t.yscale
        )
        return tile?.id ?? -1
    }

    // =========================================================================
    // Background Management
    // =========================================================================

    /**
     * Sets the background for a specific layer in this room.
     * @param index - Background layer index (0-7)
     * @param visible - Whether the background is visible
     * @param foreground - Whether it draws in front of instances
     * @param background - Background resource ID
     * @param x - X offset
     * @param y - Y offset
     * @param htiled - Whether to tile horizontally
     * @param vtiled - Whether to tile vertically
     * @param hspeed - Horizontal scroll speed
     * @param vspeed - Vertical scroll speed
     */
    public room_set_background(
        index: number, 
        visible: boolean, 
        foreground: boolean, 
        background: number, 
        x: number, 
        y: number, 
        htiled: boolean, 
        vtiled: boolean, 
        hspeed: number, 
        vspeed: number
    ): void {
        this.background_visible[index] = visible
        this.background_foreground[index] = foreground
        this.background_index[index] = background
        this.background_x[index] = x
        this.background_y[index] = y
        this.background_htiled[index] = htiled
        this.background_vtiled[index] = vtiled
        this.background_hspeed[index] = hspeed
        this.background_vspeed[index] = vspeed
    }

    /**
     * Sets the background color for a specific layer.
     * @param index - Background layer index
     * @param color - The color value
     */
    public room_set_background_color(index: number, color: number): void {
        this.background_color[index] = color
    }

    // =========================================================================
    // View Management
    // =========================================================================

    /**
     * Configures a view for this room (design-time).
     * @param index - View index
     * @param visible - Whether the view is enabled
     * @param xview - X position of the view in the room
     * @param yview - Y position of the view in the room
     * @param wview - Width of the view in the room
     * @param hview - Height of the view in the room
     * @param xport - X position of the viewport on screen
     * @param yport - Y position of the viewport on screen
     * @param wport - Width of the viewport on screen
     * @param hport - Height of the viewport on screen
     * @param hborder - Horizontal border for object following
     * @param vborder - Vertical border for object following
     * @param hspeed - Max horizontal speed when following
     * @param vspeed - Max vertical speed when following
     * @param target - Object instance to follow (-1 for none)
     */
    public room_set_view(
        index: number,
        visible: boolean,
        xview: number,
        yview: number,
        wview: number,
        hview: number,
        xport: number,
        yport: number,
        wport: number,
        hport: number,
        hborder: number,
        vborder: number,
        hspeed: number,
        vspeed: number,
        target: number
    ): void {
        this.view_visible[index] = visible
        this.view_xview[index] = xview
        this.view_yview[index] = yview
        this.view_wview[index] = wview
        this.view_hview[index] = hview
        this.view_xport[index] = xport
        this.view_yport[index] = yport
        this.view_wport[index] = wport
        this.view_hport[index] = hport
        this.view_hborder[index] = hborder
        this.view_vborder[index] = vborder
        this.view_hspeed[index] = hspeed
        this.view_vspeed[index] = vspeed
        this.view_object[index] = target
    }

    /**
     * Enables or disables the view system for this room.
     * @param enabled - Whether views are enabled
     */
    public room_set_view_enabled(enabled: boolean): void {
        this.view_enabled = enabled
    }

    // =========================================================================
    // Runtime View Functions
    // =========================================================================

    /**
     * Gets the X position of a view in room coordinates.
     * @param index - View index
     * @returns The X position of the view
     */
    public view_get_xview(index: number): number {
        return this.view_xview[index] ?? 0
    }

    /**
     * Gets the Y position of a view in room coordinates.
     * @param index - View index
     * @returns The Y position of the view
     */
    public view_get_yview(index: number): number {
        return this.view_yview[index] ?? 0
    }

    /**
     * Gets the width of a view.
     * @param index - View index
     * @returns The width of the view
     */
    public view_get_wview(index: number): number {
        return this.view_wview[index] ?? 0
    }

    /**
     * Gets the height of a view.
     * @param index - View index
     * @returns The height of the view
     */
    public view_get_hview(index: number): number {
        return this.view_hview[index] ?? 0
    }

    /**
     * Sets the position of a view at runtime.
     * @param index - View index
     * @param x - New X position
     * @param y - New Y position
     */
    public view_set_position(index: number, x: number, y: number): void {
        this.view_xview[index] = x
        this.view_yview[index] = y
    }

    /**
     * Sets the size of a view at runtime.
     * @param index - View index
     * @param w - New width
     * @param h - New height
     */
    public view_set_size(index: number, w: number, h: number): void {
        this.view_wview[index] = w
        this.view_hview[index] = h
    }

    /**
     * Sets the viewport position on screen.
     * @param index - View index
     * @param x - X position on screen
     * @param y - Y position on screen
     */
    public view_set_port_position(index: number, x: number, y: number): void {
        this.view_xport[index] = x
        this.view_yport[index] = y
    }

    /**
     * Sets the viewport size on screen.
     * @param index - View index
     * @param w - Width on screen
     * @param h - Height on screen
     */
    public view_set_port_size(index: number, w: number, h: number): void {
        this.view_wport[index] = w
        this.view_hport[index] = h
    }

    /**
     * Sets the object for a view to follow.
     * @param index - View index
     * @param obj - Instance ID to follow (-1 for none)
     */
    public view_set_object(index: number, obj: number): void {
        this.view_object[index] = obj
    }

    /**
     * Sets the border area for view following.
     * @param index - View index
     * @param hborder - Horizontal border in pixels
     * @param vborder - Vertical border in pixels
     */
    public view_set_border(index: number, hborder: number, vborder: number): void {
        this.view_hborder[index] = hborder
        this.view_vborder[index] = vborder
    }

    /**
     * Sets the maximum speed for view following.
     * @param index - View index
     * @param hspeed - Max horizontal speed
     * @param vspeed - Max vertical speed
     */
    public view_set_speed(index: number, hspeed: number, vspeed: number): void {
        this.view_hspeed[index] = hspeed
        this.view_vspeed[index] = vspeed
    }

    /**
     * Converts a screen X coordinate to room coordinates for a specific view.
     * @param index - View index
     * @param x - Screen X coordinate
     * @returns Room X coordinate
     */
    public view_screen_to_room_x(index: number, x: number): number {
        const xport = this.view_xport[index] ?? 0
        const wport = this.view_wport[index] ?? 1
        const xview = this.view_xview[index] ?? 0
        const wview = this.view_wview[index] ?? 1
        return xview + ((x - xport) / wport) * wview
    }

    /**
     * Converts a screen Y coordinate to room coordinates for a specific view.
     * @param index - View index
     * @param y - Screen Y coordinate
     * @returns Room Y coordinate
     */
    public view_screen_to_room_y(index: number, y: number): number {
        const yport = this.view_yport[index] ?? 0
        const hport = this.view_hport[index] ?? 1
        const yview = this.view_yview[index] ?? 0
        const hview = this.view_hview[index] ?? 1
        return yview + ((y - yport) / hport) * hview
    }

    /**
     * Converts a room X coordinate to screen coordinates for a specific view.
     * @param index - View index
     * @param x - Room X coordinate
     * @returns Screen X coordinate
     */
    public view_room_to_screen_x(index: number, x: number): number {
        const xport = this.view_xport[index] ?? 0
        const wport = this.view_wport[index] ?? 1
        const xview = this.view_xview[index] ?? 0
        const wview = this.view_wview[index] ?? 1
        return xport + ((x - xview) / wview) * wport
    }

    /**
     * Converts a room Y coordinate to screen coordinates for a specific view.
     * @param index - View index
     * @param y - Room Y coordinate
     * @returns Screen Y coordinate
     */
    public view_room_to_screen_y(index: number, y: number): number {
        const yport = this.view_yport[index] ?? 0
        const hport = this.view_hport[index] ?? 1
        const yview = this.view_yview[index] ?? 0
        const hview = this.view_hview[index] ?? 1
        return yport + ((y - yview) / hview) * hport
    }
}