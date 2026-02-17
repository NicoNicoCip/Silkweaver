// packages/engine/src/core/game_event.ts
var EVENT_TYPE = /* @__PURE__ */ ((EVENT_TYPE2) => {
  EVENT_TYPE2["none"] = "NONE";
  EVENT_TYPE2["create"] = "CREATE";
  EVENT_TYPE2["destroy"] = "DESTROY";
  EVENT_TYPE2["step_begin"] = "STEP_BEGIN";
  EVENT_TYPE2["step"] = "STEP";
  EVENT_TYPE2["step_end"] = "STEP_END";
  EVENT_TYPE2["collision"] = "COLLISION";
  EVENT_TYPE2["keyboard"] = "KEYBOARD";
  EVENT_TYPE2["mouse"] = "MOUSE";
  EVENT_TYPE2["other"] = "OTHER";
  EVENT_TYPE2["async"] = "ASYNC";
  EVENT_TYPE2["draw"] = "DRAW";
  EVENT_TYPE2["draw_gui"] = "DRAW_GUI";
  return EVENT_TYPE2;
})(EVENT_TYPE || {});
var game_event = class {
  // The event type category
  /**
   * Creates a new game event.
   * @param event - The function to call when the event fires
   * @param type - The event type category
   */
  constructor(event = () => {
  }, type = "NONE" /* none */) {
    this.event = () => {
    };
    // The function to execute
    this.type = "NONE" /* none */;
    this.event = event;
    this.type = type;
  }
  /**
   * Executes the event function.
   */
  run() {
    this.event();
  }
};

// packages/engine/src/core/resource.ts
var resource = class _resource {
  constructor() {
    // Registry of all resources by ID
    this.id = this.incrementID();
    // Unique identifier for this resource
    this.name = this.constructor.name;
    _resource.all.set(this.id, this);
  }
  static {
    this.gid = 0;
  }
  static {
    // Global ID counter for all resources
    this.all = /* @__PURE__ */ new Map();
  }
  // Name derived from the class type
  /**
   * Increments and returns the next available resource ID.
   * @returns The next unique resource ID
   */
  incrementID() {
    return _resource.gid++;
  }
  static removeByID(id) {
    _resource.all.delete(id);
  }
  static findByID(id) {
    return _resource.all.get(id);
  }
};

// packages/engine/src/core/room.ts
var room = class _room extends resource {
  // Instances in this room, keyed by ID
  constructor() {
    super();
    this.room_width = 640;
    // Width of the room in pixels
    this.room_height = 480;
    // Height of the room in pixels
    this.room_caption = `Room ${this.id}`;
    // Window caption when room is active
    this.room_speed = 60;
    // Target frames per second for this room
    this.room_persistent = false;
    // Whether room state persists when leaving
    this.room_previous = 0;
    // ID of the previous room in order
    this.room_next = 0;
    // ID of the next room in order
    this.background_visible = [];
    // Whether each background layer is visible
    this.background_foreground = [];
    // Whether background draws in front of instances
    this.background_index = [];
    // Background resource ID for each layer
    this.background_x = [];
    // X offset for each background
    this.background_y = [];
    // Y offset for each background
    this.background_htiled = [];
    // Whether background tiles horizontally
    this.background_vtiled = [];
    // Whether background tiles vertically
    this.background_hspeed = [];
    // Horizontal scroll speed for each background
    this.background_vspeed = [];
    // Vertical scroll speed for each background
    this.background_color = [];
    // Blend color for each background
    // =========================================================================
    // View Properties
    // =========================================================================
    this.view_enabled = false;
    // Whether views are enabled for this room
    this.view_current = 0;
    // Index of the currently drawing view
    this.view_visible = [];
    // Whether each view is enabled
    this.view_xview = [];
    // X position of each view in the room
    this.view_yview = [];
    // Y position of each view in the room
    this.view_wview = [];
    // Width of each view in the room
    this.view_hview = [];
    // Height of each view in the room
    this.view_xport = [];
    // X position of each viewport on screen
    this.view_yport = [];
    // Y position of each viewport on screen
    this.view_wport = [];
    // Width of each viewport on screen
    this.view_hport = [];
    // Height of each viewport on screen
    this.view_hborder = [];
    // Horizontal border for object following
    this.view_vborder = [];
    // Vertical border for object following
    this.view_hspeed = [];
    // Max horizontal speed when following
    this.view_vspeed = [];
    // Max vertical speed when following
    this.view_object = [];
    // Instance ID to follow (-1 for none)
    // =========================================================================
    // Tile Properties
    // =========================================================================
    this.tiles = [];
    // All tiles in this room
    this.all = /* @__PURE__ */ new Map();
  }
  // =========================================================================
  // Room Navigation
  // =========================================================================
  /**
   * Transitions to the specified room.
   * @param target - The room to go to (ID or room reference)
   */
  room_goto(target) {
    if (typeof target === "number") {
      const potential = resource.findByID(target);
      if (typeof potential === "undefined") {
        console.error(`ID ${target} does not exist.`);
        return;
      }
      if (potential.constructor.name !== "room") {
        console.error(`ID ${target} is not a room.`);
        return;
      }
      game_loop.change_room(potential);
      return;
    }
    game_loop.change_room(target);
  }
  /**
   * Transitions to the previous room in the room order.
   */
  room_goto_previous() {
    this.room_goto(this.room_previous);
  }
  /**
   * Transitions to the next room in the room order.
   */
  room_goto_next() {
    this.room_goto(this.room_next);
  }
  /**
   * Restarts the current room, resetting all non-persistent instances.
   */
  room_restart() {
    this.room_goto(this);
  }
  // =========================================================================
  // Room Queries
  // =========================================================================
  /**
   * Checks if a room with the given ID exists.
   * @param id - The room ID to check
   * @returns True if the room exists
   */
  room_exists(id) {
    const res = resource.findByID(id);
    if (typeof res === "undefined") {
      return false;
    }
    if (res.constructor.name !== "room") {
      return false;
    }
    return true;
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
  room_instance_add(x, y, obj) {
    obj.x = x;
    obj.y = y;
    obj.xstart = x;
    obj.ystart = y;
    this.all.set(obj.id, obj);
  }
  /**
   * Adds an instance to this room at runtime.
   * @param inst - The instance to add
   */
  instance_add(inst) {
    this.all.set(inst.id, inst);
  }
  /**
   * Removes an instance from this room by ID.
   * @param id - The instance ID to remove
   * @returns True if the instance was found and removed
   */
  instance_remove(id) {
    return this.all.delete(id);
  }
  /**
   * Gets an instance from this room by ID.
   * @param id - The instance ID to find
   * @returns The instance, or undefined if not found
   */
  instance_get(id) {
    return this.all.get(id);
  }
  /**
   * Gets all instances in this room.
   * @returns Array of all instances
   */
  instance_get_all() {
    return Array.from(this.all.values());
  }
  /**
   * Gets the number of instances in this room.
   * @returns The instance count
   */
  instance_count() {
    return this.all.size;
  }
  /**
   * Removes all instances from the room's design-time instance list.
   */
  room_instance_clear() {
    this.all.clear();
  }
  /**
   * Registers all instances in this room with the game loop.
   * Called when entering a room to set up event handlers.
   */
  register_all_instances() {
    for (const inst of this.all.values()) {
      inst.register_events();
      game_loop.register("CREATE" /* create */, inst.on_create.bind(inst));
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
  room_tile_add(x, y, background, left, top, width, height, depth) {
    return this.tile_add(background, left, top, width, height, x, y, depth);
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
  room_tile_add_ext(x, y, background, left, top, width, height, depth, xscale, yscale, alpha) {
    const id = _room.next_tile_id++;
    this.tiles.push({
      id,
      x,
      y,
      background,
      left,
      top,
      width,
      height,
      depth,
      xscale,
      yscale,
      alpha,
      visible: true
    });
    return id;
  }
  /**
   * Removes all tiles from the room's design-time tile list.
   */
  room_tile_clear() {
    this.tiles = [];
  }
  static {
    // =========================================================================
    // Runtime Tile Functions
    // =========================================================================
    this.next_tile_id = 0;
  }
  // Auto-incrementing tile ID counter
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
  tile_add(background, left, top, width, height, x, y, depth) {
    const id = _room.next_tile_id++;
    this.tiles.push({
      id,
      x,
      y,
      background,
      left,
      top,
      width,
      height,
      depth,
      xscale: 1,
      yscale: 1,
      alpha: 1,
      visible: true
    });
    return id;
  }
  /**
   * Deletes a tile by its ID.
   * @param id - The tile ID to delete
   * @returns True if the tile was found and deleted
   */
  tile_delete(id) {
    const index = this.tiles.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tiles.splice(index, 1);
    return true;
  }
  /**
   * Checks if a tile with the given ID exists.
   * @param id - The tile ID to check
   * @returns True if the tile exists
   */
  tile_exists(id) {
    return this.tiles.some((t) => t.id === id);
  }
  /**
   * Gets the X position of a tile.
   * @param id - The tile ID
   * @returns The X position, or 0 if not found
   */
  tile_get_x(id) {
    return this.tiles.find((t) => t.id === id)?.x ?? 0;
  }
  /**
   * Gets the Y position of a tile.
   * @param id - The tile ID
   * @returns The Y position, or 0 if not found
   */
  tile_get_y(id) {
    return this.tiles.find((t) => t.id === id)?.y ?? 0;
  }
  /**
   * Gets the depth of a tile.
   * @param id - The tile ID
   * @returns The depth, or 0 if not found
   */
  tile_get_depth(id) {
    return this.tiles.find((t) => t.id === id)?.depth ?? 0;
  }
  /**
   * Gets the visibility of a tile.
   * @param id - The tile ID
   * @returns True if visible, false if not found or hidden
   */
  tile_get_visible(id) {
    return this.tiles.find((t) => t.id === id)?.visible ?? false;
  }
  /**
   * Sets the position of a tile.
   * @param id - The tile ID
   * @param x - New X position
   * @param y - New Y position
   */
  tile_set_position(id, x, y) {
    const tile = this.tiles.find((t) => t.id === id);
    if (tile) {
      tile.x = x;
      tile.y = y;
    }
  }
  /**
   * Sets the depth of a tile.
   * @param id - The tile ID
   * @param depth - New depth value
   */
  tile_set_depth(id, depth) {
    const tile = this.tiles.find((t) => t.id === id);
    if (tile) tile.depth = depth;
  }
  /**
   * Sets the visibility of a tile.
   * @param id - The tile ID
   * @param visible - Whether the tile should be visible
   */
  tile_set_visible(id, visible) {
    const tile = this.tiles.find((t) => t.id === id);
    if (tile) tile.visible = visible;
  }
  /**
   * Sets the scale of a tile.
   * @param id - The tile ID
   * @param xscale - Horizontal scale factor
   * @param yscale - Vertical scale factor
   */
  tile_set_scale(id, xscale, yscale) {
    const tile = this.tiles.find((t) => t.id === id);
    if (tile) {
      tile.xscale = xscale;
      tile.yscale = yscale;
    }
  }
  /**
   * Sets the alpha (transparency) of a tile.
   * @param id - The tile ID
   * @param alpha - Alpha value (0-1)
   */
  tile_set_alpha(id, alpha) {
    const tile = this.tiles.find((t) => t.id === id);
    if (tile) tile.alpha = alpha;
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
  tile_set_background(id, background, left, top, width, height) {
    const tile = this.tiles.find((t) => t.id === id);
    if (tile) {
      tile.background = background;
      tile.left = left;
      tile.top = top;
      tile.width = width;
      tile.height = height;
    }
  }
  /**
   * Deletes all tiles at a specific depth.
   * @param depth - The depth to clear
   */
  tile_layer_delete(depth) {
    this.tiles = this.tiles.filter((t) => t.depth !== depth);
  }
  /**
   * Shifts all tiles at a specific depth by the given amount.
   * @param depth - The depth layer to shift
   * @param x - Horizontal shift amount
   * @param y - Vertical shift amount
   */
  tile_layer_shift(depth, x, y) {
    this.tiles.filter((t) => t.depth === depth).forEach((t) => {
      t.x += x;
      t.y += y;
    });
  }
  /**
   * Finds a tile at the given position and depth.
   * @param x - X position to check
   * @param y - Y position to check
   * @param depth - Depth to check
   * @returns The tile ID, or -1 if not found
   */
  tile_layer_find(x, y, depth) {
    const tile = this.tiles.find(
      (t) => t.depth === depth && x >= t.x && x < t.x + t.width * t.xscale && y >= t.y && y < t.y + t.height * t.yscale
    );
    return tile?.id ?? -1;
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
  room_set_background(index, visible, foreground, background, x, y, htiled, vtiled, hspeed, vspeed) {
    this.background_visible[index] = visible;
    this.background_foreground[index] = foreground;
    this.background_index[index] = background;
    this.background_x[index] = x;
    this.background_y[index] = y;
    this.background_htiled[index] = htiled;
    this.background_vtiled[index] = vtiled;
    this.background_hspeed[index] = hspeed;
    this.background_vspeed[index] = vspeed;
  }
  /**
   * Sets the background color for a specific layer.
   * @param index - Background layer index
   * @param color - The color value
   */
  room_set_background_color(index, color) {
    this.background_color[index] = color;
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
  room_set_view(index, visible, xview, yview, wview, hview, xport, yport, wport, hport, hborder, vborder, hspeed, vspeed, target) {
    this.view_visible[index] = visible;
    this.view_xview[index] = xview;
    this.view_yview[index] = yview;
    this.view_wview[index] = wview;
    this.view_hview[index] = hview;
    this.view_xport[index] = xport;
    this.view_yport[index] = yport;
    this.view_wport[index] = wport;
    this.view_hport[index] = hport;
    this.view_hborder[index] = hborder;
    this.view_vborder[index] = vborder;
    this.view_hspeed[index] = hspeed;
    this.view_vspeed[index] = vspeed;
    this.view_object[index] = target;
  }
  /**
   * Enables or disables the view system for this room.
   * @param enabled - Whether views are enabled
   */
  room_set_view_enabled(enabled) {
    this.view_enabled = enabled;
  }
  // =========================================================================
  // Runtime View Functions
  // =========================================================================
  /**
   * Gets the X position of a view in room coordinates.
   * @param index - View index
   * @returns The X position of the view
   */
  view_get_xview(index) {
    return this.view_xview[index] ?? 0;
  }
  /**
   * Gets the Y position of a view in room coordinates.
   * @param index - View index
   * @returns The Y position of the view
   */
  view_get_yview(index) {
    return this.view_yview[index] ?? 0;
  }
  /**
   * Gets the width of a view.
   * @param index - View index
   * @returns The width of the view
   */
  view_get_wview(index) {
    return this.view_wview[index] ?? 0;
  }
  /**
   * Gets the height of a view.
   * @param index - View index
   * @returns The height of the view
   */
  view_get_hview(index) {
    return this.view_hview[index] ?? 0;
  }
  /**
   * Sets the position of a view at runtime.
   * @param index - View index
   * @param x - New X position
   * @param y - New Y position
   */
  view_set_position(index, x, y) {
    this.view_xview[index] = x;
    this.view_yview[index] = y;
  }
  /**
   * Sets the size of a view at runtime.
   * @param index - View index
   * @param w - New width
   * @param h - New height
   */
  view_set_size(index, w, h) {
    this.view_wview[index] = w;
    this.view_hview[index] = h;
  }
  /**
   * Sets the viewport position on screen.
   * @param index - View index
   * @param x - X position on screen
   * @param y - Y position on screen
   */
  view_set_port_position(index, x, y) {
    this.view_xport[index] = x;
    this.view_yport[index] = y;
  }
  /**
   * Sets the viewport size on screen.
   * @param index - View index
   * @param w - Width on screen
   * @param h - Height on screen
   */
  view_set_port_size(index, w, h) {
    this.view_wport[index] = w;
    this.view_hport[index] = h;
  }
  /**
   * Sets the object for a view to follow.
   * @param index - View index
   * @param obj - Instance ID to follow (-1 for none)
   */
  view_set_object(index, obj) {
    this.view_object[index] = obj;
  }
  /**
   * Sets the border area for view following.
   * @param index - View index
   * @param hborder - Horizontal border in pixels
   * @param vborder - Vertical border in pixels
   */
  view_set_border(index, hborder, vborder) {
    this.view_hborder[index] = hborder;
    this.view_vborder[index] = vborder;
  }
  /**
   * Sets the maximum speed for view following.
   * @param index - View index
   * @param hspeed - Max horizontal speed
   * @param vspeed - Max vertical speed
   */
  view_set_speed(index, hspeed, vspeed) {
    this.view_hspeed[index] = hspeed;
    this.view_vspeed[index] = vspeed;
  }
  /**
   * Converts a screen X coordinate to room coordinates for a specific view.
   * @param index - View index
   * @param x - Screen X coordinate
   * @returns Room X coordinate
   */
  view_screen_to_room_x(index, x) {
    const xport = this.view_xport[index] ?? 0;
    const wport = this.view_wport[index] ?? 1;
    const xview = this.view_xview[index] ?? 0;
    const wview = this.view_wview[index] ?? 1;
    return xview + (x - xport) / wport * wview;
  }
  /**
   * Converts a screen Y coordinate to room coordinates for a specific view.
   * @param index - View index
   * @param y - Screen Y coordinate
   * @returns Room Y coordinate
   */
  view_screen_to_room_y(index, y) {
    const yport = this.view_yport[index] ?? 0;
    const hport = this.view_hport[index] ?? 1;
    const yview = this.view_yview[index] ?? 0;
    const hview = this.view_hview[index] ?? 1;
    return yview + (y - yport) / hport * hview;
  }
  /**
   * Converts a room X coordinate to screen coordinates for a specific view.
   * @param index - View index
   * @param x - Room X coordinate
   * @returns Screen X coordinate
   */
  view_room_to_screen_x(index, x) {
    const xport = this.view_xport[index] ?? 0;
    const wport = this.view_wport[index] ?? 1;
    const xview = this.view_xview[index] ?? 0;
    const wview = this.view_wview[index] ?? 1;
    return xport + (x - xview) / wview * wport;
  }
  /**
   * Converts a room Y coordinate to screen coordinates for a specific view.
   * @param index - View index
   * @param y - Room Y coordinate
   * @returns Screen Y coordinate
   */
  view_room_to_screen_y(index, y) {
    const yport = this.view_yport[index] ?? 0;
    const hport = this.view_hport[index] ?? 1;
    const yview = this.view_yview[index] ?? 0;
    const hview = this.view_hview[index] ?? 1;
    return yport + (y - yview) / hview * hport;
  }
};

// packages/engine/src/input/keyboard.ts
var vk_nokey = 0;
var vk_anykey = 1;
var vk_backspace = 8;
var vk_tab = 9;
var vk_enter = 13;
var vk_shift = 16;
var vk_control = 17;
var vk_alt = 18;
var vk_pause = 19;
var vk_escape = 27;
var vk_space = 32;
var vk_pageup = 33;
var vk_pagedown = 34;
var vk_end = 35;
var vk_home = 36;
var vk_left = 37;
var vk_up = 38;
var vk_right = 39;
var vk_down = 40;
var vk_insert = 45;
var vk_delete = 46;
var vk_f1 = 112;
var vk_f2 = 113;
var vk_f3 = 114;
var vk_f4 = 115;
var vk_f5 = 116;
var vk_f6 = 117;
var vk_f7 = 118;
var vk_f8 = 119;
var vk_f9 = 120;
var vk_f10 = 121;
var vk_f11 = 122;
var vk_f12 = 123;
var vk_numpad0 = 96;
var vk_numpad1 = 97;
var vk_numpad2 = 98;
var vk_numpad3 = 99;
var vk_numpad4 = 100;
var vk_numpad5 = 101;
var vk_numpad6 = 102;
var vk_numpad7 = 103;
var vk_numpad8 = 104;
var vk_numpad9 = 105;
var vk_multiply = 106;
var vk_add = 107;
var vk_subtract = 109;
var vk_decimal = 110;
var vk_divide = 111;
var vk_printscreen = 44;
var keyboard_manager = class _keyboard_manager {
  static {
    this._held = /* @__PURE__ */ new Set();
  }
  static {
    // Keys currently held down
    this._pressed = /* @__PURE__ */ new Set();
  }
  static {
    // Keys pressed this step
    this._released = /* @__PURE__ */ new Set();
  }
  static {
    // Keys released this step
    this._key_map = /* @__PURE__ */ new Map();
  }
  static {
    // Remapped key codes
    /** Last key code that was pressed. */
    this.keyboard_key = vk_nokey;
  }
  static {
    /** Previous key code (key before the last). */
    this.keyboard_lastkey = vk_nokey;
  }
  static {
    /** Last character typed (from keypress events). */
    this.keyboard_lastchar = "";
  }
  static {
    /** Accumulated typed string (cleared by the game or manually). */
    this.keyboard_string = "";
  }
  static {
    this._attached = false;
  }
  static {
    this._on_keydown = (e) => _keyboard_manager._handle_down(e);
  }
  static {
    this._on_keyup = (e) => _keyboard_manager._handle_up(e);
  }
  static {
    this._on_keypress = (e) => _keyboard_manager._handle_press(e);
  }
  /**
   * Attaches keyboard listeners to the window.
   * Called once by input_manager.init().
   */
  static attach() {
    if (this._attached) return;
    window.addEventListener("keydown", this._on_keydown);
    window.addEventListener("keyup", this._on_keyup);
    window.addEventListener("keypress", this._on_keypress);
    this._attached = true;
  }
  /**
   * Detaches keyboard listeners from the window.
   */
  static detach() {
    if (!this._attached) return;
    window.removeEventListener("keydown", this._on_keydown);
    window.removeEventListener("keyup", this._on_keyup);
    window.removeEventListener("keypress", this._on_keypress);
    this._attached = false;
  }
  static _handle_down(e) {
    const code = this._map(e.keyCode);
    if (!this._held.has(code)) {
      this._pressed.add(code);
      this.keyboard_lastkey = this.keyboard_key;
      this.keyboard_key = code;
    }
    this._held.add(code);
  }
  static _handle_up(e) {
    const code = this._map(e.keyCode);
    this._held.delete(code);
    this._released.add(code);
  }
  static _handle_press(e) {
    if (e.key.length === 1) {
      this.keyboard_lastchar = e.key;
      this.keyboard_string += e.key;
    }
  }
  static _map(code) {
    return this._key_map.get(code) ?? code;
  }
  /**
   * Clears the pressed and released sets at the end of each step.
   * Called by the game loop after all events have fired.
   */
  static end_step() {
    this._pressed.clear();
    this._released.clear();
  }
  /** Returns true if the key is currently held down. */
  static check(key) {
    if (key === vk_anykey) return this._held.size > 0;
    if (key === vk_nokey) return this._held.size === 0;
    return this._held.has(key);
  }
  /** Returns true if the key was pressed this step. */
  static check_pressed(key) {
    if (key === vk_anykey) return this._pressed.size > 0;
    if (key === vk_nokey) return false;
    return this._pressed.has(key);
  }
  /** Returns true if the key was released this step. */
  static check_released(key) {
    if (key === vk_anykey) return this._released.size > 0;
    if (key === vk_nokey) return false;
    return this._released.has(key);
  }
  /** Clears the held/pressed/released state for a specific key. */
  static clear(key) {
    this._held.delete(key);
    this._pressed.delete(key);
    this._released.delete(key);
  }
  /** Simulates pressing a key. */
  static key_press(key) {
    if (!this._held.has(key)) this._pressed.add(key);
    this._held.add(key);
    this.keyboard_lastkey = this.keyboard_key;
    this.keyboard_key = key;
  }
  /** Simulates releasing a key. */
  static key_release(key) {
    this._held.delete(key);
    this._released.add(key);
  }
  /** Remaps key1 to behave as key2. */
  static set_map(key1, key2) {
    this._key_map.set(key1, key2);
  }
  /** Returns the mapped key code for a given input code. */
  static get_map(key) {
    return this._key_map.get(key) ?? key;
  }
  /** Clears all key remappings. */
  static unset_map() {
    this._key_map.clear();
  }
};
function keyboard_check(key) {
  return keyboard_manager.check(key);
}
function keyboard_check_pressed(key) {
  return keyboard_manager.check_pressed(key);
}
function keyboard_check_released(key) {
  return keyboard_manager.check_released(key);
}
function keyboard_check_direct(key) {
  return keyboard_manager.check(key);
}
function keyboard_clear(key) {
  keyboard_manager.clear(key);
}
function keyboard_key_press(key) {
  keyboard_manager.key_press(key);
}
function keyboard_key_release(key) {
  keyboard_manager.key_release(key);
}
function keyboard_set_map(key1, key2) {
  keyboard_manager.set_map(key1, key2);
}
function keyboard_get_map(key) {
  return keyboard_manager.get_map(key);
}
function keyboard_unset_map() {
  keyboard_manager.unset_map();
}

// packages/engine/src/input/mouse.ts
var mb_none = 0;
var mb_left = 1;
var mb_right = 2;
var mb_middle = 3;
var mb_any = 4;
var mouse_manager = class _mouse_manager {
  static {
    this._held = /* @__PURE__ */ new Set();
  }
  static {
    // Buttons currently held
    this._pressed = /* @__PURE__ */ new Set();
  }
  static {
    // Pressed this step
    this._released = /* @__PURE__ */ new Set();
  }
  static {
    // Released this step
    this._canvas = null;
  }
  static {
    /** Mouse X in canvas pixel coordinates. */
    this.window_x = 0;
  }
  static {
    /** Mouse Y in canvas pixel coordinates. */
    this.window_y = 0;
  }
  static {
    /** Mouse X in room space (window_x + view offset). Updated each step. */
    this.mouse_x = 0;
  }
  static {
    /** Mouse Y in room space (window_y + view offset). Updated each step. */
    this.mouse_y = 0;
  }
  static {
    /** Currently held button (0 = none). */
    this.mouse_button = mb_none;
  }
  static {
    /** Last button that was clicked. */
    this.mouse_lastbutton = mb_none;
  }
  static {
    /** True if the scroll wheel moved up this step. */
    this._wheel_up = false;
  }
  static {
    /** True if the scroll wheel moved down this step. */
    this._wheel_down = false;
  }
  static {
    this._attached = false;
  }
  static {
    this._on_mousedown = (e) => _mouse_manager._handle_down(e);
  }
  static {
    this._on_mouseup = (e) => _mouse_manager._handle_up(e);
  }
  static {
    this._on_mousemove = (e) => _mouse_manager._handle_move(e);
  }
  static {
    this._on_wheel = (e) => _mouse_manager._handle_wheel(e);
  }
  static {
    this._on_contextmenu = (e) => e.preventDefault();
  }
  /**
   * Attaches mouse listeners to a canvas element.
   * @param canvas - The game canvas
   */
  static attach(canvas) {
    if (this._attached) return;
    this._canvas = canvas;
    canvas.addEventListener("mousedown", this._on_mousedown);
    canvas.addEventListener("mouseup", this._on_mouseup);
    canvas.addEventListener("mousemove", this._on_mousemove);
    canvas.addEventListener("wheel", this._on_wheel, { passive: true });
    canvas.addEventListener("contextmenu", this._on_contextmenu);
    this._attached = true;
  }
  /**
   * Detaches mouse listeners from the canvas.
   */
  static detach() {
    if (!this._attached || !this._canvas) return;
    this._canvas.removeEventListener("mousedown", this._on_mousedown);
    this._canvas.removeEventListener("mouseup", this._on_mouseup);
    this._canvas.removeEventListener("mousemove", this._on_mousemove);
    this._canvas.removeEventListener("wheel", this._on_wheel);
    this._canvas.removeEventListener("contextmenu", this._on_contextmenu);
    this._attached = false;
    this._canvas = null;
  }
  static _get_button(e) {
    switch (e.button) {
      case 0:
        return mb_left;
      case 1:
        return mb_middle;
      case 2:
        return mb_right;
      default:
        return mb_none;
    }
  }
  static _handle_down(e) {
    const btn = this._get_button(e);
    if (btn === mb_none) return;
    if (!this._held.has(btn)) this._pressed.add(btn);
    this._held.add(btn);
    this.mouse_lastbutton = this.mouse_button;
    this.mouse_button = btn;
    this._update_position(e);
  }
  static _handle_up(e) {
    const btn = this._get_button(e);
    if (btn === mb_none) return;
    this._held.delete(btn);
    this._released.add(btn);
    if (this._held.size === 0) this.mouse_button = mb_none;
    this._update_position(e);
  }
  static _handle_move(e) {
    this._update_position(e);
  }
  static _handle_wheel(e) {
    if (e.deltaY < 0) this._wheel_up = true;
    else this._wheel_down = true;
  }
  static _update_position(e) {
    if (!this._canvas) return;
    const rect = this._canvas.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;
    this.window_x = (e.clientX - rect.left) * scaleX;
    this.window_y = (e.clientY - rect.top) * scaleY;
  }
  /**
   * Updates room-space mouse coordinates using the current view offset.
   * Called once per step by the game loop before keyboard/mouse events fire.
   * @param view_x - Current view X offset in the room
   * @param view_y - Current view Y offset in the room
   */
  static update_room_position(view_x, view_y) {
    this.mouse_x = this.window_x + view_x;
    this.mouse_y = this.window_y + view_y;
  }
  /** Clears pressed/released state and wheel flags at the end of each step. */
  static end_step() {
    this._pressed.clear();
    this._released.clear();
    this._wheel_up = false;
    this._wheel_down = false;
  }
  /** Returns true if button is held. */
  static check(btn) {
    if (btn === mb_any) return this._held.size > 0;
    if (btn === mb_none) return this._held.size === 0;
    return this._held.has(btn);
  }
  /** Returns true if button was pressed this step. */
  static check_pressed(btn) {
    if (btn === mb_any) return this._pressed.size > 0;
    if (btn === mb_none) return false;
    return this._pressed.has(btn);
  }
  /** Returns true if button was released this step. */
  static check_released(btn) {
    if (btn === mb_any) return this._released.size > 0;
    if (btn === mb_none) return false;
    return this._released.has(btn);
  }
  /** Clears state for a specific button. */
  static clear(btn) {
    this._held.delete(btn);
    this._pressed.delete(btn);
    this._released.delete(btn);
  }
  /** Returns true if the wheel scrolled up this step. */
  static wheel_up() {
    return this._wheel_up;
  }
  /** Returns true if the wheel scrolled down this step. */
  static wheel_down() {
    return this._wheel_down;
  }
};
function mouse_check_button(button) {
  return mouse_manager.check(button);
}
function mouse_check_button_pressed(button) {
  return mouse_manager.check_pressed(button);
}
function mouse_check_button_released(button) {
  return mouse_manager.check_released(button);
}
function mouse_clear(button) {
  mouse_manager.clear(button);
}
function mouse_wheel_up() {
  return mouse_manager.wheel_up();
}
function mouse_wheel_down() {
  return mouse_manager.wheel_down();
}
function window_mouse_get_x() {
  return mouse_manager.window_x;
}
function window_mouse_get_y() {
  return mouse_manager.window_y;
}
function window_mouse_set(_x, _y) {
}

// packages/engine/src/input/gamepad.ts
var gp_face1 = 0;
var gp_face2 = 1;
var gp_face3 = 2;
var gp_face4 = 3;
var gp_shoulderl = 4;
var gp_shoulderr = 5;
var gp_shoulderlb = 6;
var gp_shoulderrb = 7;
var gp_select = 8;
var gp_start = 9;
var gp_stickl = 10;
var gp_stickr = 11;
var gp_padu = 12;
var gp_padd = 13;
var gp_padl = 14;
var gp_padr = 15;
var gp_axislh = 0;
var gp_axislv = 1;
var gp_axisrh = 2;
var gp_axisrv = 3;
var BUTTON_THRESHOLD = 0.5;
var gamepad_manager = class {
  static {
    this._states = /* @__PURE__ */ new Map();
  }
  /**
   * Polls the Gamepad API and refreshes all state snapshots.
   * Must be called every step before gamepad functions are queried.
   */
  static poll() {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    for (let i = 0; i < pads.length; i++) {
      const pad = pads[i];
      const prev = this._states.get(i);
      if (!pad) {
        if (prev) prev.connected = false;
        continue;
      }
      const buttons_held = pad.buttons.map((b) => b.pressed || b.value > BUTTON_THRESHOLD);
      const axes = Array.from(pad.axes);
      if (!prev) {
        this._states.set(i, {
          buttons_held,
          buttons_prev: new Array(buttons_held.length).fill(false),
          axes,
          connected: true,
          id: pad.id
        });
      } else {
        prev.buttons_prev = prev.buttons_held;
        prev.buttons_held = buttons_held;
        prev.axes = axes;
        prev.connected = true;
        prev.id = pad.id;
      }
    }
  }
  /** Returns true if the Gamepad API is supported by the browser. */
  static is_supported() {
    return typeof navigator.getGamepads === "function";
  }
  /** Returns true if device index `device` is connected. */
  static is_connected(device) {
    return this._states.get(device)?.connected ?? false;
  }
  /** Returns the number of connected gamepad slots (may include gaps). */
  static get_device_count() {
    return this._states.size;
  }
  /** Returns the device description string (controller name). */
  static get_description(device) {
    return this._states.get(device)?.id ?? "";
  }
  /** Returns the number of axes on device. */
  static axis_count(device) {
    return this._states.get(device)?.axes.length ?? 0;
  }
  /**
   * Returns the current value of an axis (-1 to 1, dead zone not applied).
   * @param device - Gamepad index
   * @param axis - Axis index (use gp_axis* constants)
   */
  static axis_value(device, axis) {
    const state = this._states.get(device);
    if (!state?.connected) return 0;
    return state.axes[axis] ?? 0;
  }
  /** Returns the number of buttons on device. */
  static button_count(device) {
    return this._states.get(device)?.buttons_held.length ?? 0;
  }
  /** Returns true if button is currently held. */
  static button_check(device, button) {
    const state = this._states.get(device);
    if (!state?.connected) return false;
    return state.buttons_held[button] ?? false;
  }
  /** Returns true if button was pressed this step (was up last step, down now). */
  static button_check_pressed(device, button) {
    const state = this._states.get(device);
    if (!state?.connected) return false;
    return (state.buttons_held[button] ?? false) && !(state.buttons_prev[button] ?? false);
  }
  /** Returns true if button was released this step. */
  static button_check_released(device, button) {
    const state = this._states.get(device);
    if (!state?.connected) return false;
    return !(state.buttons_held[button] ?? false) && (state.buttons_prev[button] ?? false);
  }
  /**
   * Returns the analog button value (0 to 1) for triggers or 0/1 for digital buttons.
   * @param device - Gamepad index
   * @param button - Button index
   */
  static button_value(device, button) {
    if (!navigator.getGamepads) return 0;
    const pad = navigator.getGamepads()[device];
    if (!pad) return 0;
    return pad.buttons[button]?.value ?? 0;
  }
  /**
   * Sets controller vibration (rumble).
   * @param device - Gamepad index
   * @param left - Left motor strength (0–1)
   * @param right - Right motor strength (0–1)
   */
  static set_vibration(device, left, right) {
    if (!navigator.getGamepads) return;
    const pad = navigator.getGamepads()[device];
    if (!pad) return;
    if (typeof pad.vibrationActuator?.playEffect === "function") {
      pad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: 100,
        weakMagnitude: right,
        strongMagnitude: left
      });
    }
  }
};
function gamepad_is_supported() {
  return gamepad_manager.is_supported();
}
function gamepad_is_connected(device) {
  return gamepad_manager.is_connected(device);
}
function gamepad_get_device_count() {
  return gamepad_manager.get_device_count();
}
function gamepad_get_description(device) {
  return gamepad_manager.get_description(device);
}
function gamepad_axis_count(device) {
  return gamepad_manager.axis_count(device);
}
function gamepad_axis_value(device, axis) {
  return gamepad_manager.axis_value(device, axis);
}
function gamepad_button_count(device) {
  return gamepad_manager.button_count(device);
}
function gamepad_button_check(device, button) {
  return gamepad_manager.button_check(device, button);
}
function gamepad_button_check_pressed(device, button) {
  return gamepad_manager.button_check_pressed(device, button);
}
function gamepad_button_check_released(device, button) {
  return gamepad_manager.button_check_released(device, button);
}
function gamepad_button_value(device, button) {
  return gamepad_manager.button_value(device, button);
}
function gamepad_set_vibration(device, left, right) {
  gamepad_manager.set_vibration(device, left, right);
}

// packages/engine/src/input/touch.ts
var MAX_TOUCH_POINTS = 11;
function make_touch_point() {
  return { x: 0, y: 0, held: false, pressed: false, released: false };
}
var touch_manager = class _touch_manager {
  static {
    this._points = Array.from({ length: MAX_TOUCH_POINTS }, make_touch_point);
  }
  static {
    this._canvas = null;
  }
  static {
    this._attached = false;
  }
  static {
    // Stable bound handler references for add/removeEventListener symmetry
    this._on_start = (e) => {
      e.preventDefault();
      _touch_manager._handle_start(e);
    };
  }
  static {
    this._on_end = (e) => {
      e.preventDefault();
      _touch_manager._handle_end(e);
    };
  }
  static {
    this._on_move = (e) => {
      e.preventDefault();
      _touch_manager._handle_move(e);
    };
  }
  static {
    this._on_cancel = (e) => {
      e.preventDefault();
      _touch_manager._handle_cancel(e);
    };
  }
  /**
   * Attaches touch listeners to a canvas element.
   * @param canvas - The canvas receiving touch events
   */
  static attach(canvas) {
    if (this._attached) return;
    this._canvas = canvas;
    canvas.addEventListener("touchstart", this._on_start, { passive: false });
    canvas.addEventListener("touchend", this._on_end, { passive: false });
    canvas.addEventListener("touchmove", this._on_move, { passive: false });
    canvas.addEventListener("touchcancel", this._on_cancel, { passive: false });
    this._attached = true;
  }
  /**
   * Detaches touch listeners from the canvas.
   */
  static detach() {
    if (!this._attached || !this._canvas) return;
    this._canvas.removeEventListener("touchstart", this._on_start);
    this._canvas.removeEventListener("touchend", this._on_end);
    this._canvas.removeEventListener("touchmove", this._on_move);
    this._canvas.removeEventListener("touchcancel", this._on_cancel);
    this._attached = false;
    this._canvas = null;
  }
  /**
   * Converts a browser Touch to canvas-local coordinates.
   */
  static _to_canvas(touch) {
    if (!this._canvas) return { x: touch.clientX, y: touch.clientY };
    const rect = this._canvas.getBoundingClientRect();
    const sx = this._canvas.width / rect.width;
    const sy = this._canvas.height / rect.height;
    return {
      x: (touch.clientX - rect.left) * sx,
      y: (touch.clientY - rect.top) * sy
    };
  }
  static {
    /**
     * Maps a Touch identifier to a stable slot index (0..MAX_TOUCH_POINTS-1).
     * Returns -1 if no slot is available.
     */
    this._id_to_slot = /* @__PURE__ */ new Map();
  }
  static _alloc_slot(id) {
    if (this._id_to_slot.has(id)) return this._id_to_slot.get(id);
    const used = new Set(this._id_to_slot.values());
    for (let i = 0; i < MAX_TOUCH_POINTS; i++) {
      if (!used.has(i)) {
        this._id_to_slot.set(id, i);
        return i;
      }
    }
    return -1;
  }
  static _free_slot(id) {
    const slot = this._id_to_slot.get(id) ?? -1;
    this._id_to_slot.delete(id);
    return slot;
  }
  static _handle_start(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const slot = this._alloc_slot(t.identifier);
      if (slot < 0) continue;
      const pos = this._to_canvas(t);
      const pt = this._points[slot];
      pt.x = pos.x;
      pt.y = pos.y;
      pt.held = true;
      pt.pressed = true;
    }
  }
  static _handle_end(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const slot = this._free_slot(t.identifier);
      if (slot < 0) continue;
      const pos = this._to_canvas(t);
      const pt = this._points[slot];
      pt.x = pos.x;
      pt.y = pos.y;
      pt.held = false;
      pt.released = true;
    }
  }
  static _handle_move(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const slot = this._id_to_slot.get(t.identifier) ?? -1;
      if (slot < 0) continue;
      const pos = this._to_canvas(t);
      this._points[slot].x = pos.x;
      this._points[slot].y = pos.y;
    }
  }
  static _handle_cancel(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const slot = this._free_slot(t.identifier);
      if (slot < 0) continue;
      const pt = this._points[slot];
      pt.held = false;
      pt.released = true;
    }
  }
  /**
   * Clears per-step pressed/released flags.
   * Called by input_manager at the end of each step.
   */
  static end_step() {
    for (const pt of this._points) {
      pt.pressed = false;
      pt.released = false;
    }
  }
  // -------------------------------------------------------------------------
  // Query API (device = finger slot 0..MAX_TOUCH_POINTS-1)
  // -------------------------------------------------------------------------
  /** Returns true if a touch point is currently active. */
  static is_held(device) {
    return this._points[device]?.held ?? false;
  }
  /** Returns true if a touch point became active this step. */
  static is_pressed(device) {
    return this._points[device]?.pressed ?? false;
  }
  /** Returns true if a touch point was lifted this step. */
  static is_released(device) {
    return this._points[device]?.released ?? false;
  }
  /** Returns the canvas-space X coordinate of a touch device. */
  static get_x(device) {
    return this._points[device]?.x ?? -1;
  }
  /** Returns the canvas-space Y coordinate of a touch device. */
  static get_y(device) {
    return this._points[device]?.y ?? -1;
  }
  /** Returns the number of currently active touch points. */
  static get_count() {
    return this._points.filter((p) => p.held).length;
  }
};
function device_mouse_check_button(device, button) {
  return touch_manager.is_held(device);
}
function device_mouse_check_button_pressed(device, button) {
  return touch_manager.is_pressed(device);
}
function device_mouse_check_button_released(device, button) {
  return touch_manager.is_released(device);
}
function device_mouse_x(device) {
  return touch_manager.get_x(device);
}
function device_mouse_y(device) {
  return touch_manager.get_y(device);
}
function device_get_touch_count() {
  return touch_manager.get_count();
}

// packages/engine/src/core/game_loop.ts
var _begin_frame = null;
var _end_frame = null;
function set_frame_hooks(begin, end) {
  _begin_frame = begin;
  _end_frame = end;
}
var game_loop = class {
  static {
    this.room_speed = 60;
  }
  static {
    // Target frames per second for the update loop
    this.room_delta = 0;
  }
  static {
    // Time elapsed since last frame in milliseconds
    this.last_delta = 0;
  }
  static {
    // Timestamp of the previous frame
    this.accumulator = 0;
  }
  static {
    // Accumulated time for fixed timestep updates
    this.room = null;
  }
  static {
    // The current active room
    this.room_first = -1;
  }
  static {
    // ID of the first room in the game
    this.room_last = 0;
  }
  static {
    // ID of the last room in the game
    this._canvas = null;
  }
  static {
    // Canvas for mouse/touch attachment
    // Map of update event types to their registered event handlers
    this.update_events = /* @__PURE__ */ new Map();
  }
  static {
    // Map of draw event types to their registered event handlers
    this.draw_events = /* @__PURE__ */ new Map();
  }
  /**
   * Attaches input systems to the given canvas.
   * Must be called before start() if mouse or touch input is needed.
   * @param canvas - The game canvas element
   */
  static init_input(canvas) {
    this._canvas = canvas;
    keyboard_manager.attach();
    mouse_manager.attach(canvas);
    touch_manager.attach(canvas);
  }
  /**
   * Starts the game loop.
   * Initializes timing values and begins the requestAnimationFrame cycle.
   */
  static start(room3) {
    if (room3) {
      this.room = room3;
      this.room_first = room3.id;
    }
    this.last_delta = performance.now();
    requestAnimationFrame(this.tick.bind(this));
  }
  /**
   * Main loop tick called every frame by requestAnimationFrame.
   * Handles timing, runs fixed timestep updates, and draws once per frame.
   * @param current - The current timestamp provided by requestAnimationFrame
   */
  static tick(current) {
    this.room_delta = current - this.last_delta;
    this.last_delta = current;
    this.accumulator += this.room_delta;
    const frameTime = 1e3 / this.room_speed;
    while (this.accumulator >= frameTime) {
      this.update();
      this.accumulator -= frameTime;
    }
    this.draw();
    requestAnimationFrame(this.tick.bind(this));
  }
  /**
   * Runs all update events in GMS order.
   * Create and destroy events run once and are cleared after execution.
   * Input polling happens before events; end_step clears edge-trigger state after.
   */
  static update() {
    gamepad_manager.poll();
    const createEvents = [...this.update_events.get("CREATE" /* create */) ?? []];
    this.update_events.set("CREATE" /* create */, []);
    createEvents.forEach((e) => e.run());
    this.update_events.get("STEP_BEGIN" /* step_begin */)?.forEach((e) => e.run());
    this.update_events.get("STEP" /* step */)?.forEach((e) => e.run());
    this.update_events.get("STEP_END" /* step_end */)?.forEach((e) => e.run());
    this.update_events.get("COLLISION" /* collision */)?.forEach((e) => e.run());
    this.update_events.get("KEYBOARD" /* keyboard */)?.forEach((e) => e.run());
    this.update_events.get("MOUSE" /* mouse */)?.forEach((e) => e.run());
    this.update_events.get("OTHER" /* other */)?.forEach((e) => e.run());
    this.update_events.get("ASYNC" /* async */)?.forEach((e) => e.run());
    const destroyEvents = [...this.update_events.get("DESTROY" /* destroy */) ?? []];
    this.update_events.set("DESTROY" /* destroy */, []);
    destroyEvents.forEach((e) => e.run());
    keyboard_manager.end_step();
    mouse_manager.end_step();
    touch_manager.end_step();
  }
  /**
   * Runs all draw events in GMS order.
   * Called once per frame after all updates have completed.
   * begin_frame clears the canvas; end_frame flushes the batch.
   */
  static draw() {
    _begin_frame?.();
    this.draw_events.get("DRAW" /* draw */)?.forEach((e) => e.run());
    this.draw_events.get("DRAW_GUI" /* draw_gui */)?.forEach((e) => e.run());
    _end_frame?.();
  }
  /**
   * Registers a function to be called for a specific event type.
   * @param event - The event type to register for
   * @param func - The function to call when the event fires
   */
  static register(event, func) {
    const targetMap = event === "DRAW" /* draw */ || event === "DRAW_GUI" /* draw_gui */ ? this.draw_events : this.update_events;
    const existing = targetMap.get(event) ?? [];
    existing.push(new game_event(func, event));
    targetMap.set(event, existing);
  }
  /**
   * Unregisters a function from a specific event type.
   * @param event - The event type to unregister from
   * @param func - The function to remove
   */
  static unregister(event, func) {
    const targetMap = event === "DRAW" /* draw */ || event === "DRAW_GUI" /* draw_gui */ ? this.draw_events : this.update_events;
    const existing = targetMap.get(event) ?? [];
    const filtered = existing.filter((e) => e.event !== func);
    targetMap.set(event, filtered);
  }
  /**
   * Transitions to a new room, clearing current events and loading the new room's state.
   * @param room - The room to transition to
   */
  static change_room(room3) {
    if (this.room && this.room.room_persistent) {
    }
    this.update_events.clear();
    this.draw_events.clear();
    this.room = room3;
    this.room_speed = room3.room_speed;
    room3.register_all_instances();
  }
};

// packages/engine/src/collision/collision.ts
var MASK_RECT = 0;
var MASK_CIRCLE = 1;
var MASK_ELLIPSE = 2;
function get_bbox(inst, x, y) {
  const px = x ?? inst.x;
  const py = y ?? inst.y;
  const sprite2 = get_sprite_for_instance(inst);
  if (!sprite2) {
    return { left: px, top: py, right: px + 1, bottom: py + 1 };
  }
  const sx = inst.image_xscale;
  const sy = inst.image_yscale;
  const w = sprite2.width * sx;
  const h = sprite2.height * sy;
  const ox = sprite2.xoffset * sx;
  const oy = sprite2.yoffset * sy;
  return {
    left: px - ox,
    top: py - oy,
    right: px - ox + w,
    bottom: py - oy + h
  };
}
function update_bbox(inst) {
  const bbox = get_bbox(inst);
  inst.bbox_left = bbox.left;
  inst.bbox_top = bbox.top;
  inst.bbox_right = bbox.right;
  inst.bbox_bottom = bbox.bottom;
}
function get_sprite_for_instance(inst) {
  const idx = inst.mask_index >= 0 ? inst.mask_index : inst.sprite_index;
  if (idx < 0) return null;
  const res = resource.findByID(idx);
  if (res && "frames" in res && "width" in res && "xoffset" in res && Array.isArray(res.frames)) {
    return res;
  }
  return null;
}
function bbox_overlap(a_left, a_top, a_right, a_bottom, b_left, b_top, b_right, b_bottom) {
  return a_left < b_right && a_right > b_left && a_top < b_bottom && a_bottom > b_top;
}
function instances_collide(a, ax, ay, b) {
  if (a === b) return false;
  if (!b.active) return false;
  const bbox_a = get_bbox(a, ax, ay);
  const bbox_b = get_bbox(b);
  return bbox_overlap(
    bbox_a.left,
    bbox_a.top,
    bbox_a.right,
    bbox_a.bottom,
    bbox_b.left,
    bbox_b.top,
    bbox_b.right,
    bbox_b.bottom
  );
}
function point_in_instance(px, py, b) {
  if (!b.active) return false;
  const bbox = get_bbox(b);
  return px >= bbox.left && px < bbox.right && py >= bbox.top && py < bbox.bottom;
}
function rect_in_instance(rx1, ry1, rx2, ry2, b) {
  if (!b.active) return false;
  const bbox = get_bbox(b);
  return bbox_overlap(rx1, ry1, rx2, ry2, bbox.left, bbox.top, bbox.right, bbox.bottom);
}
function circle_in_instance(cx, cy, cr, b) {
  if (!b.active) return false;
  const bbox = get_bbox(b);
  const nearest_x = Math.max(bbox.left, Math.min(cx, bbox.right));
  const nearest_y = Math.max(bbox.top, Math.min(cy, bbox.bottom));
  const dx = cx - nearest_x;
  const dy = cy - nearest_y;
  return dx * dx + dy * dy < cr * cr;
}

// packages/engine/src/core/instance.ts
var _renderer_draw_sprite_ext = null;
function set_draw_sprite_ext(fn) {
  _renderer_draw_sprite_ext = fn;
}
var instance = class _instance extends resource {
  /**
   * Creates a new instance in the specified room.
   * @param room - The room this instance will belong to
   */
  constructor(room3) {
    super();
    // The room this instance belongs to
    // =========================================================================
    // Position & Movement
    // =========================================================================
    this.x = 0;
    // X position in the room
    this.y = 0;
    // Y position in the room
    this.xprevious = 0;
    // X position in the previous step
    this.yprevious = 0;
    // Y position in the previous step
    this.xstart = 0;
    // X position when instance was created
    this.ystart = 0;
    // Y position when instance was created
    this.hspeed = 0;
    // Horizontal speed (pixels per step)
    this.vspeed = 0;
    // Vertical speed (pixels per step)
    this.speed = 0;
    // Total speed (computed from hspeed/vspeed)
    this.direction = 0;
    // Direction of movement in degrees (0 = right)
    this.friction = 0;
    // Deceleration applied each step
    this.gravity = 0;
    // Gravity force applied each step
    this.gravity_direction = 270;
    // Direction of gravity (270 = down)
    // =========================================================================
    // Rendering
    // =========================================================================
    this.sprite_index = -1;
    // Current sprite resource ID (-1 = none)
    this.image_index = 0;
    // Current frame of the sprite animation
    this.image_speed = 1;
    // Animation speed (frames per step)
    this.image_xscale = 1;
    // Horizontal scale factor
    this.image_yscale = 1;
    // Vertical scale factor
    this.image_angle = 0;
    // Rotation angle in degrees
    this.image_alpha = 1;
    // Transparency (0 = invisible, 1 = opaque)
    this.image_blend = 16777215;
    // Blend color (white = no tint)
    this.depth = 0;
    // Drawing depth (lower = drawn on top)
    this.visible = true;
    // Whether the instance is drawn
    // =========================================================================
    // Collision & State
    // =========================================================================
    this.mask_index = -1;
    // Collision mask sprite ID (-1 = use sprite_index)
    this.solid = false;
    // Whether the instance blocks movement
    this.persistent = false;
    // Whether the instance persists across rooms
    this.active = true;
    // Whether the instance participates in logic and collision
    // Cached bounding box — updated each step before collision checks
    this.bbox_left = 0;
    // Left edge of collision bounding box
    this.bbox_top = 0;
    // Top edge of collision bounding box
    this.bbox_right = 0;
    // Right edge of collision bounding box
    this.bbox_bottom = 0;
    // Bottom edge of collision bounding box
    // Bound event handlers — stored so unregister() can match the exact same function reference
    this._bound_step_begin = () => {
    };
    this._bound_step = () => {
    };
    this._bound_step_end = () => {
    };
    this._bound_draw = () => {
    };
    this._bound_draw_gui = () => {
    };
    this.room = room3;
    this._bound_step_begin = this.on_step_begin.bind(this);
    this._bound_step = this.internal_step.bind(this);
    this._bound_step_end = this.on_step_end.bind(this);
    this._bound_draw = this.internal_draw.bind(this);
    this._bound_draw_gui = this.on_draw_gui.bind(this);
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
  static instance_create(x, y, obj) {
    const currentRoom = game_loop.room;
    const inst = new obj(currentRoom);
    inst.x = x;
    inst.y = y;
    inst.xstart = x;
    inst.ystart = y;
    inst.xprevious = x;
    inst.yprevious = y;
    currentRoom.instance_add(inst);
    inst.register_events();
    game_loop.register("CREATE" /* create */, inst.on_create.bind(inst));
    return inst;
  }
  /**
   * Creates a new instance at the specified position with an explicit depth.
   * @param x - X position
   * @param y - Y position
   * @param depth - Drawing depth
   * @param obj - The object class to instantiate
   * @returns The newly created instance
   */
  static instance_create_depth(x, y, depth, obj) {
    const inst = _instance.instance_create(x, y, obj);
    inst.depth = depth;
    return inst;
  }
  /**
   * Destroys this instance, removing it from the room.
   * Queues the destroy event to run at the end of the current step.
   */
  instance_destroy() {
    game_loop.register("DESTROY" /* destroy */, this.on_destroy.bind(this));
    this.unregister_events();
    this.room.instance_remove(this.id);
    resource.removeByID(this.id);
  }
  /**
   * Destroys an instance by its numeric ID.
   * @param id - ID of the instance to destroy
   */
  static instance_destroy_id(id) {
    const inst = _instance.instance_find(id);
    if (inst) inst.instance_destroy();
  }
  /**
   * Registers this instance's event handlers with the game loop.
   */
  register_events() {
    game_loop.register("STEP_BEGIN" /* step_begin */, this._bound_step_begin);
    game_loop.register("STEP" /* step */, this._bound_step);
    game_loop.register("STEP_END" /* step_end */, this._bound_step_end);
    game_loop.register("DRAW" /* draw */, this._bound_draw);
    game_loop.register("DRAW_GUI" /* draw_gui */, this._bound_draw_gui);
  }
  /**
   * Unregisters this instance's event handlers from the game loop.
   */
  unregister_events() {
    game_loop.unregister("STEP_BEGIN" /* step_begin */, this._bound_step_begin);
    game_loop.unregister("STEP" /* step */, this._bound_step);
    game_loop.unregister("STEP_END" /* step_end */, this._bound_step_end);
    game_loop.unregister("DRAW" /* draw */, this._bound_draw);
    game_loop.unregister("DRAW_GUI" /* draw_gui */, this._bound_draw_gui);
  }
  /**
   * Internal step: physics, animation, bbox update, then calls on_step().
   */
  internal_step() {
    if (!this.active) return;
    this.xprevious = this.x;
    this.yprevious = this.y;
    if (this.gravity !== 0) {
      const grav_rad = this.gravity_direction * (Math.PI / 180);
      this.hspeed += Math.cos(grav_rad) * this.gravity;
      this.vspeed -= Math.sin(grav_rad) * this.gravity;
    }
    if (this.friction !== 0 && (this.hspeed !== 0 || this.vspeed !== 0)) {
      const currentSpeed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
      const newSpeed = Math.max(0, currentSpeed - this.friction);
      if (currentSpeed > 0) {
        const ratio = newSpeed / currentSpeed;
        this.hspeed *= ratio;
        this.vspeed *= ratio;
      }
    }
    this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
    if (this.hspeed !== 0 || this.vspeed !== 0) {
      this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
      if (this.direction < 0) this.direction += 360;
    }
    this.x += this.hspeed;
    this.y += this.vspeed;
    if (this.image_speed !== 0 && this.sprite_index >= 0) {
      const spr = resource.findByID(this.sprite_index);
      const frame_count = spr && "frames" in spr ? spr.frames.length : 1;
      if (frame_count > 0) {
        this.image_index = (this.image_index + this.image_speed) % frame_count;
        if (this.image_index < 0) this.image_index += frame_count;
      }
    }
    update_bbox(this);
    this.on_step();
  }
  /**
   * Internal draw: skips hidden instances, then calls on_draw().
   * If on_draw() has not been overridden, draws the current sprite automatically.
   */
  internal_draw() {
    if (!this.visible || !this.active) return;
    this.on_draw();
  }
  // =========================================================================
  // Instance queries (static)
  // =========================================================================
  /**
   * Checks if an instance with the given ID exists.
   * @param id - The instance ID to check
   * @returns True if the instance exists
   */
  static instance_exists(id) {
    const res = resource.findByID(id);
    if (res === void 0) return false;
    return res instanceof _instance;
  }
  /**
   * Finds an instance by its ID.
   * @param id - The instance ID to find
   * @returns The instance, or undefined if not found
   */
  static instance_find(id) {
    const res = resource.findByID(id);
    if (res instanceof _instance) return res;
    return void 0;
  }
  /**
   * Returns the number of active instances of a given object class in the current room.
   * @param obj - Object class to count
   * @returns Instance count
   */
  static instance_number(obj) {
    const rm = game_loop.room;
    if (!rm) return 0;
    let count = 0;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj && inst.active) count++;
    }
    return count;
  }
  /**
   * Finds the nth instance of a given object class in the current room (0-indexed).
   * @param obj - Object class to search for
   * @param n - Zero-based index
   * @returns The instance, or undefined if not found
   */
  static instance_find_nth(obj, n) {
    const rm = game_loop.room;
    if (!rm) return void 0;
    let i = 0;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj && inst.active) {
        if (i === n) return inst;
        i++;
      }
    }
    return void 0;
  }
  /**
   * Finds the first instance of a given object class at a specific position.
   * @param x - X position to test
   * @param y - Y position to test
   * @param obj - Object class to check
   * @returns The instance at that position, or undefined
   */
  static instance_position(x, y, obj) {
    const rm = game_loop.room;
    if (!rm) return void 0;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj && inst.active && point_in_instance(x, y, inst)) {
        return inst;
      }
    }
    return void 0;
  }
  /**
   * Returns the nearest instance of obj to a given point.
   * @param x - Reference X
   * @param y - Reference Y
   * @param obj - Object class to search
   * @returns Nearest instance, or undefined if none exist
   */
  static instance_nearest(x, y, obj) {
    const rm = game_loop.room;
    if (!rm) return void 0;
    let nearest;
    let min_dist = Infinity;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj && inst.active) {
        const dx = inst.x - x;
        const dy = inst.y - y;
        const d = dx * dx + dy * dy;
        if (d < min_dist) {
          min_dist = d;
          nearest = inst;
        }
      }
    }
    return nearest;
  }
  /**
   * Returns the furthest instance of obj from a given point.
   * @param x - Reference X
   * @param y - Reference Y
   * @param obj - Object class to search
   * @returns Furthest instance, or undefined if none exist
   */
  static instance_furthest(x, y, obj) {
    const rm = game_loop.room;
    if (!rm) return void 0;
    let furthest;
    let max_dist = -1;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj && inst.active) {
        const dx = inst.x - x;
        const dy = inst.y - y;
        const d = dx * dx + dy * dy;
        if (d > max_dist) {
          max_dist = d;
          furthest = inst;
        }
      }
    }
    return furthest;
  }
  /**
   * Deactivates all instances (optionally excluding self).
   * Deactivated instances are skipped in step and draw.
   * @param not_me - If true, this instance is excluded from deactivation
   */
  instance_deactivate_all(not_me = false) {
    const rm = game_loop.room;
    if (!rm) return;
    for (const inst of rm.instance_get_all()) {
      if (not_me && inst === this) continue;
      inst.active = false;
    }
  }
  /**
   * Deactivates all instances of a specific object class.
   * @param obj - Object class to deactivate
   */
  static instance_deactivate_object(obj) {
    const rm = game_loop.room;
    if (!rm) return;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj) inst.active = false;
    }
  }
  /**
   * Activates all instances in the current room.
   */
  static instance_activate_all() {
    const rm = game_loop.room;
    if (!rm) return;
    for (const inst of rm.instance_get_all()) {
      inst.active = true;
    }
  }
  /**
   * Activates all instances of a specific object class.
   * @param obj - Object class to activate
   */
  static instance_activate_object(obj) {
    const rm = game_loop.room;
    if (!rm) return;
    for (const inst of rm.instance_get_all()) {
      if (inst instanceof obj) inst.active = true;
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
  place_meeting(x, y, obj) {
    const rm = game_loop.room;
    if (!rm) return false;
    for (const other of rm.instance_get_all()) {
      if (other === this) continue;
      if (!(other instanceof obj)) continue;
      if (!other.active) continue;
      if (instances_collide(this, x, y, other)) return true;
    }
    return false;
  }
  /**
   * Checks if position (x, y) is free of solid instances.
   * @param x - X position to test
   * @param y - Y position to test
   * @returns True if no solid instances occupy that position
   */
  place_free(x, y) {
    const rm = game_loop.room;
    if (!rm) return true;
    for (const other of rm.instance_get_all()) {
      if (other === this) continue;
      if (!other.solid || !other.active) continue;
      if (instances_collide(this, x, y, other)) return false;
    }
    return true;
  }
  /**
   * Checks if position (x, y) is completely empty (no instances of any kind).
   * @param x - X position to test
   * @param y - Y position to test
   * @returns True if no instances occupy that position
   */
  place_empty(x, y) {
    const rm = game_loop.room;
    if (!rm) return true;
    for (const other of rm.instance_get_all()) {
      if (other === this) continue;
      if (!other.active) continue;
      if (instances_collide(this, x, y, other)) return false;
    }
    return true;
  }
  /**
   * Moves the instance by the given amount, stopping when it hits a solid.
   * @param hspd - Horizontal movement
   * @param vspd - Vertical movement
   * @returns True if the movement was blocked by a solid
   */
  move_contact_solid(hspd, vspd) {
    const target_x = this.x + hspd;
    const target_y = this.y + vspd;
    if (this.place_free(target_x, target_y)) {
      this.x = target_x;
      this.y = target_y;
      return false;
    }
    return true;
  }
  /**
   * Wraps the instance around the room edges.
   * @param hor - Wrap horizontally
   * @param vert - Wrap vertically
   * @param margin - Extra margin (pixels outside room edge before wrapping)
   */
  move_wrap(hor, vert, margin = 0) {
    const rm = game_loop.room;
    if (!rm) return;
    const bbox_w = this.bbox_right - this.bbox_left;
    const bbox_h = this.bbox_bottom - this.bbox_top;
    if (hor) {
      if (this.x + bbox_w < -margin) this.x = rm.room_width + margin;
      else if (this.x - bbox_w > rm.room_width + margin) this.x = -margin;
    }
    if (vert) {
      if (this.y + bbox_h < -margin) this.y = rm.room_height + margin;
      else if (this.y - bbox_h > rm.room_height + margin) this.y = -margin;
    }
  }
  /**
   * Returns the shortest distance from this instance to any instance of obj.
   * @param obj - Object class to measure distance to
   * @returns Distance in pixels, or Infinity if no instance found
   */
  distance_to_object(obj) {
    const rm = game_loop.room;
    if (!rm) return Infinity;
    let min_dist = Infinity;
    for (const inst of rm.instance_get_all()) {
      if (inst === this || !inst.active) continue;
      if (!(inst instanceof obj)) continue;
      const dx = inst.x - this.x;
      const dy = inst.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < min_dist) min_dist = d;
    }
    return min_dist;
  }
  // =========================================================================
  // Movement
  // =========================================================================
  /**
   * Sets the instance's motion using speed and direction.
   * @param dir - Direction in degrees (0 = right, counter-clockwise)
   * @param spd - Speed in pixels per step
   */
  motion_set(dir, spd) {
    this.direction = dir;
    this.speed = spd;
    const rad = dir * (Math.PI / 180);
    this.hspeed = Math.cos(rad) * spd;
    this.vspeed = -Math.sin(rad) * spd;
  }
  /**
   * Adds motion to the instance's current movement.
   * @param dir - Direction in degrees
   * @param spd - Speed to add
   */
  motion_add(dir, spd) {
    const rad = dir * (Math.PI / 180);
    this.hspeed += Math.cos(rad) * spd;
    this.vspeed += -Math.sin(rad) * spd;
    this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
    if (this.hspeed !== 0 || this.vspeed !== 0) {
      this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
      if (this.direction < 0) this.direction += 360;
    }
  }
  /**
   * Moves the instance toward a point at the given speed.
   * @param x - Target X position
   * @param y - Target Y position
   * @param spd - Speed to move at
   */
  move_towards_point(x, y, spd) {
    const dir = Math.atan2(-(y - this.y), x - this.x) * (180 / Math.PI);
    this.motion_set(dir < 0 ? dir + 360 : dir, spd);
  }
  /**
   * Calculates the distance to a point.
   * @param x - Target X position
   * @param y - Target Y position
   * @returns Distance in pixels
   */
  point_distance(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the direction toward a point.
   * @param x - Target X position
   * @param y - Target Y position
   * @returns Direction in degrees (0 = right, counter-clockwise)
   */
  point_direction(x, y) {
    const dir = Math.atan2(-(y - this.y), x - this.x) * (180 / Math.PI);
    return dir < 0 ? dir + 360 : dir;
  }
  // =========================================================================
  // Drawing helpers
  // =========================================================================
  /**
   * Draws this instance's current sprite at its position with all image_ properties.
   * Call this from on_draw() or it will be called automatically if on_draw() is not overridden.
   */
  draw_self() {
    if (this.sprite_index < 0 || !_renderer_draw_sprite_ext) return;
    const spr = resource.findByID(this.sprite_index);
    if (!spr || !("frames" in spr)) return;
    _renderer_draw_sprite_ext(
      spr,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      this.image_angle,
      this.image_blend,
      this.image_alpha
    );
  }
  // =========================================================================
  // Events (Override in subclasses)
  // =========================================================================
  /** Called once when the instance is created. */
  on_create() {
  }
  /** Called once when the instance is destroyed. */
  on_destroy() {
  }
  /** Called at the start of each step. */
  on_step_begin() {
  }
  /** Called every step (main update logic). Override this in subclasses. */
  on_step() {
  }
  /** Called at the end of each step. */
  on_step_end() {
  }
  /**
   * Called every frame to draw the instance.
   * Default implementation calls draw_self() to draw sprite_index at (x, y).
   * Override to customize drawing behaviour.
   */
  on_draw() {
    this.draw_self();
  }
  /** Called every frame to draw GUI elements (fixed to the screen, not the room). */
  on_draw_gui() {
  }
};
function with_object(obj, callback) {
  if (Array.isArray(obj)) {
    for (const inst of obj) {
      if (inst.active) callback(inst);
    }
    return;
  }
  const rm = game_loop.room;
  if (!rm) return;
  for (const inst of rm.instance_get_all()) {
    if (inst instanceof obj && inst.active) {
      callback(inst);
    }
  }
}

// packages/engine/src/core/gm_object.ts
var gm_object = class extends instance {
  static {
    /** Default sprite for instances of this object (can be overridden per-instance). */
    this.default_sprite = null;
  }
  static {
    /** Parent object class for inheritance queries (null = no parent). */
    this.parent = null;
  }
  static {
    /** Human-readable object name. Defaults to the class name. */
    this.object_name = "";
  }
  /**
   * Returns the object name. Falls back to the constructor name if not set.
   */
  static get_name() {
    return this.object_name || this.name;
  }
  /**
   * Checks whether this object type is an ancestor (direct or indirect) of another.
   * @param child - The object type to test
   * @returns True if this class is somewhere in child's prototype chain
   */
  static is_ancestor_of(child) {
    let current = child.parent;
    while (current !== null) {
      if (current === this) return true;
      current = current.parent;
    }
    return false;
  }
  /**
   * Called once when the instance is created. Override in subclasses.
   */
  on_create() {
    const cls = this.constructor;
    if (this.sprite_index === -1 && cls.default_sprite !== null) {
      this.sprite_index = cls.default_sprite.id;
    }
  }
};
function object_exists(obj) {
  return obj != null;
}
function object_get_name(obj) {
  return obj.get_name();
}
function object_get_sprite(obj) {
  return obj.default_sprite;
}
function object_get_parent(obj) {
  return obj.parent;
}
function object_is_ancestor(obj, parent) {
  return parent.is_ancestor_of(obj);
}

// packages/engine/src/core/path.ts
var path_kind_linear = 0;
var path_kind_smooth = 1;
var _paths = /* @__PURE__ */ new Map();
var _next_path_id = 1;
function _make_path() {
  return { points: [], closed: false, kind: path_kind_linear, precision: 8 };
}
function _catmull_rom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function _eval_path(path, t) {
  const pts = path.points;
  const n = pts.length;
  if (n === 0) return { x: 0, y: 0, speed: 1 };
  if (n === 1) return { x: pts[0].x, y: pts[0].y, speed: pts[0].speed };
  if (path.closed) {
    t = (t % 1 + 1) % 1;
  } else {
    t = Math.max(0, Math.min(1, t));
  }
  const seg_count = path.closed ? n : n - 1;
  const seg_t = t * seg_count;
  const seg_i = Math.min(Math.floor(seg_t), seg_count - 1);
  const local_t = seg_t - seg_i;
  if (path.kind === path_kind_linear) {
    const a = pts[seg_i];
    const b = pts[(seg_i + 1) % n];
    return {
      x: a.x + (b.x - a.x) * local_t,
      y: a.y + (b.y - a.y) * local_t,
      speed: a.speed + (b.speed - a.speed) * local_t
    };
  }
  const wrap2 = (i) => (i % n + n) % n;
  const p0 = pts[path.closed ? wrap2(seg_i - 1) : Math.max(seg_i - 1, 0)];
  const p1 = pts[seg_i];
  const p2 = pts[(seg_i + 1) % n];
  const p3 = pts[path.closed ? wrap2(seg_i + 2) : Math.min(seg_i + 2, n - 1)];
  return {
    x: _catmull_rom(p0.x, p1.x, p2.x, p3.x, local_t),
    y: _catmull_rom(p0.y, p1.y, p2.y, p3.y, local_t),
    speed: _catmull_rom(p0.speed, p1.speed, p2.speed, p3.speed, local_t)
  };
}
function _compute_length(path) {
  const steps = path.points.length * path.precision;
  if (steps < 2) return 0;
  let len = 0;
  let prev = _eval_path(path, 0);
  for (let i = 1; i <= steps; i++) {
    const curr = _eval_path(path, i / steps);
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    len += Math.sqrt(dx * dx + dy * dy);
    prev = curr;
  }
  return len;
}
function path_create() {
  const id = _next_path_id++;
  _paths.set(id, _make_path());
  return id;
}
function path_delete(path_id) {
  _paths.delete(path_id);
}
function path_exists(path_id) {
  return _paths.has(path_id);
}
function path_add_point(path_id, x, y, speed = 1) {
  _paths.get(path_id)?.points.push({ x, y, speed });
}
function path_clear_points(path_id) {
  const p = _paths.get(path_id);
  if (p) p.points = [];
}
function path_get_number(path_id) {
  return _paths.get(path_id)?.points.length ?? 0;
}
function path_get_x(path_id, t) {
  const p = _paths.get(path_id);
  return p ? _eval_path(p, t).x : 0;
}
function path_get_y(path_id, t) {
  const p = _paths.get(path_id);
  return p ? _eval_path(p, t).y : 0;
}
function path_get_speed(path_id, t) {
  const p = _paths.get(path_id);
  return p ? _eval_path(p, t).speed : 1;
}
function path_get_length(path_id) {
  const p = _paths.get(path_id);
  return p ? _compute_length(p) : 0;
}
function path_get_point_x(path_id, n) {
  return _paths.get(path_id)?.points[n]?.x ?? 0;
}
function path_get_point_y(path_id, n) {
  return _paths.get(path_id)?.points[n]?.y ?? 0;
}
function path_get_point_speed(path_id, n) {
  return _paths.get(path_id)?.points[n]?.speed ?? 1;
}
function path_set_closed(path_id, closed) {
  const p = _paths.get(path_id);
  if (p) p.closed = closed;
}
function path_set_kind(path_id, kind) {
  const p = _paths.get(path_id);
  if (p) p.kind = kind;
}
function path_set_precision(path_id, precision) {
  const p = _paths.get(path_id);
  if (p) p.precision = Math.max(1, precision);
}
function path_flip(path_id) {
  const p = _paths.get(path_id);
  if (!p || p.points.length === 0) return;
  const min_x = Math.min(...p.points.map((pt) => pt.x));
  const max_x = Math.max(...p.points.map((pt) => pt.x));
  const cx = (min_x + max_x) / 2;
  for (const pt of p.points) pt.x = 2 * cx - pt.x;
}
function path_mirror(path_id) {
  const p = _paths.get(path_id);
  if (!p || p.points.length === 0) return;
  const min_y = Math.min(...p.points.map((pt) => pt.y));
  const max_y = Math.max(...p.points.map((pt) => pt.y));
  const cy = (min_y + max_y) / 2;
  for (const pt of p.points) pt.y = 2 * cy - pt.y;
}
function path_reverse(path_id) {
  _paths.get(path_id)?.points.reverse();
}

// packages/engine/src/core/timeline.ts
var _timelines = /* @__PURE__ */ new Map();
var _next_timeline_id = 1;
function _compute_end(tl) {
  return tl.moments.length > 0 ? tl.moments[tl.moments.length - 1].step : 0;
}
function timeline_create() {
  const id = _next_timeline_id++;
  _timelines.set(id, { moments: [], pos: 0, speed: 1, loop: false, playing: false, end_step: 0 });
  return id;
}
function timeline_delete(timeline_id) {
  _timelines.delete(timeline_id);
}
function timeline_exists(timeline_id) {
  return _timelines.has(timeline_id);
}
function timeline_moment_add(timeline_id, step, cb) {
  const tl = _timelines.get(timeline_id);
  if (!tl) return;
  tl.moments.push({ step, cb });
  tl.moments.sort((a, b) => a.step - b.step);
  tl.end_step = _compute_end(tl);
}
function timeline_moment_clear(timeline_id, step) {
  const tl = _timelines.get(timeline_id);
  if (!tl) return;
  tl.moments = tl.moments.filter((m) => m.step !== step);
  tl.end_step = _compute_end(tl);
}
function timeline_get_moment_count(timeline_id) {
  return _timelines.get(timeline_id)?.moments.length ?? 0;
}
function timeline_set_speed(timeline_id, speed) {
  const tl = _timelines.get(timeline_id);
  if (tl) tl.speed = speed;
}
function timeline_set_loop(timeline_id, loop) {
  const tl = _timelines.get(timeline_id);
  if (tl) tl.loop = loop;
}
function timeline_play(timeline_id) {
  const tl = _timelines.get(timeline_id);
  if (tl) tl.playing = true;
}
function timeline_pause(timeline_id) {
  const tl = _timelines.get(timeline_id);
  if (tl) tl.playing = false;
}
function timeline_stop(timeline_id) {
  const tl = _timelines.get(timeline_id);
  if (!tl) return;
  tl.playing = false;
  tl.pos = 0;
}
function timeline_set_position(timeline_id, pos) {
  const tl = _timelines.get(timeline_id);
  if (tl) tl.pos = pos;
}
function timeline_get_position(timeline_id) {
  return _timelines.get(timeline_id)?.pos ?? 0;
}
function timeline_step(timeline_id) {
  const tl = _timelines.get(timeline_id);
  if (!tl || !tl.playing || tl.moments.length === 0) return false;
  const prev_pos = tl.pos;
  const new_pos = tl.pos + tl.speed;
  for (const m of tl.moments) {
    if (m.step > prev_pos && m.step <= new_pos) {
      m.cb();
    }
  }
  tl.pos = new_pos;
  if (tl.pos >= tl.end_step) {
    if (tl.loop) {
      tl.pos = tl.pos % (tl.end_step || 1);
    } else {
      tl.pos = tl.end_step;
      tl.playing = false;
      return false;
    }
  }
  return true;
}
function timeline_step_all() {
  for (const id of _timelines.keys()) {
    timeline_step(id);
  }
}

// packages/engine/src/drawing/shader.ts
var DEFAULT_VERTEX_SHADER = (
  /*glsl*/
  `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texcoord;
layout(location = 2) in vec4 a_color;

uniform mat4 u_projection;

out vec2 v_texcoord;
out vec4 v_color;

void main() {
    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
    v_color = a_color;
}`
);
var DEFAULT_FRAGMENT_SHADER = (
  /*glsl*/
  `#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec4 v_color;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    fragColor = texture(u_texture, v_texcoord) * v_color;
}`
);
function compile_shader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader object");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}
function create_program(gl, vs_source, fs_source) {
  const vs = compile_shader(gl, gl.VERTEX_SHADER, vs_source);
  const fs = compile_shader(gl, gl.FRAGMENT_SHADER, fs_source);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create shader program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  return program;
}
var shader_program = class {
  constructor(gl, vs_source, fs_source) {
    this.uniform_cache = /* @__PURE__ */ new Map();
    this.gl = gl;
    this.program = create_program(gl, vs_source, fs_source);
  }
  /**
   * Gets and caches a uniform location by name.
   * @param name - Uniform variable name in GLSL
   * @returns WebGLUniformLocation or null if not found
   */
  get_uniform(name) {
    if (!this.uniform_cache.has(name)) {
      this.uniform_cache.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.uniform_cache.get(name);
  }
  /**
   * Frees the shader program's GPU resources.
   */
  destroy() {
    this.gl.deleteProgram(this.program);
    this.uniform_cache.clear();
  }
};

// packages/engine/src/drawing/batch_renderer.ts
var FLOATS_PER_VERTEX = 8;
var VERTS_PER_QUAD = 6;
var FLOATS_PER_QUAD = FLOATS_PER_VERTEX * VERTS_PER_QUAD;
var MAX_QUADS = 8192;
var batch_renderer = class {
  constructor(gl) {
    this.quad_count = 0;
    this.current_texture = null;
    this.gl = gl;
    this.vertices = new Float32Array(MAX_QUADS * FLOATS_PER_QUAD);
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create VAO");
    this.vao = vao;
    const vbo = gl.createBuffer();
    if (!vbo) throw new Error("Failed to create VBO");
    this.vbo = vbo;
    const STRIDE = FLOATS_PER_VERTEX * 4;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE, 16);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  /**
   * Pushes one axis-aligned quad into the batch.
   * Flushes the batch if the texture changes or the buffer is full.
   *
   * @param x - Left edge
   * @param y - Top edge
   * @param w - Width
   * @param h - Height
   * @param u0 - Left UV coordinate
   * @param v0 - Top UV coordinate
   * @param u1 - Right UV coordinate
   * @param v1 - Bottom UV coordinate
   * @param r - Red (0–1)
   * @param g - Green (0–1)
   * @param b - Blue (0–1)
   * @param a - Alpha (0–1)
   * @param texture - WebGL texture to sample
   */
  add_quad(x, y, w, h, u0, v0, u1, v1, r, g, b, a, texture) {
    if (this.current_texture !== null && this.current_texture !== texture) {
      this.flush();
    }
    this.current_texture = texture;
    if (this.quad_count >= MAX_QUADS) {
      this.flush();
    }
    const base = this.quad_count * FLOATS_PER_QUAD;
    const verts = this.vertices;
    verts[base + 0] = x;
    verts[base + 1] = y;
    verts[base + 2] = u0;
    verts[base + 3] = v0;
    verts[base + 4] = r;
    verts[base + 5] = g;
    verts[base + 6] = b;
    verts[base + 7] = a;
    verts[base + 8] = x;
    verts[base + 9] = y + h;
    verts[base + 10] = u0;
    verts[base + 11] = v1;
    verts[base + 12] = r;
    verts[base + 13] = g;
    verts[base + 14] = b;
    verts[base + 15] = a;
    verts[base + 16] = x + w;
    verts[base + 17] = y;
    verts[base + 18] = u1;
    verts[base + 19] = v0;
    verts[base + 20] = r;
    verts[base + 21] = g;
    verts[base + 22] = b;
    verts[base + 23] = a;
    verts[base + 24] = x + w;
    verts[base + 25] = y;
    verts[base + 26] = u1;
    verts[base + 27] = v0;
    verts[base + 28] = r;
    verts[base + 29] = g;
    verts[base + 30] = b;
    verts[base + 31] = a;
    verts[base + 32] = x;
    verts[base + 33] = y + h;
    verts[base + 34] = u0;
    verts[base + 35] = v1;
    verts[base + 36] = r;
    verts[base + 37] = g;
    verts[base + 38] = b;
    verts[base + 39] = a;
    verts[base + 40] = x + w;
    verts[base + 41] = y + h;
    verts[base + 42] = u1;
    verts[base + 43] = v1;
    verts[base + 44] = r;
    verts[base + 45] = g;
    verts[base + 46] = b;
    verts[base + 47] = a;
    this.quad_count++;
  }
  /**
   * Pushes a rotated/scaled quad into the batch.
   * Used for draw_sprite_ext with rotation and scale.
   *
   * @param cx - Center X
   * @param cy - Center Y
   * @param w - Width before scaling
   * @param h - Height before scaling
   * @param ox - Origin X offset from center
   * @param oy - Origin Y offset from center
   * @param xscale - Horizontal scale
   * @param yscale - Vertical scale
   * @param angle_deg - Rotation in degrees (counter-clockwise)
   * @param u0 - Left UV
   * @param v0 - Top UV
   * @param u1 - Right UV
   * @param v1 - Bottom UV
   * @param r - Red (0–1)
   * @param g - Green (0–1)
   * @param b - Blue (0–1)
   * @param a - Alpha (0–1)
   * @param texture - WebGL texture
   */
  add_quad_transformed(cx, cy, w, h, ox, oy, xscale, yscale, angle_deg, u0, v0, u1, v1, r, g, b, a, texture) {
    if (this.current_texture !== null && this.current_texture !== texture) {
      this.flush();
    }
    this.current_texture = texture;
    if (this.quad_count >= MAX_QUADS) {
      this.flush();
    }
    const rad = -angle_deg * (Math.PI / 180);
    const cos_a = Math.cos(rad);
    const sin_a = Math.sin(rad);
    const hw = w * xscale;
    const hh = h * yscale;
    const lx = -ox * xscale;
    const ty = -oy * yscale;
    const rx = lx + hw;
    const by = ty + hh;
    const transform = (lx2, ly) => {
      return [
        cx + lx2 * cos_a - ly * sin_a,
        cy + lx2 * sin_a + ly * cos_a
      ];
    };
    const [tl_x, tl_y] = transform(lx, ty);
    const [tr_x, tr_y] = transform(rx, ty);
    const [bl_x, bl_y] = transform(lx, by);
    const [br_x, br_y] = transform(rx, by);
    const base = this.quad_count * FLOATS_PER_QUAD;
    const verts = this.vertices;
    const write = (off, px, py, u, v) => {
      verts[off + 0] = px;
      verts[off + 1] = py;
      verts[off + 2] = u;
      verts[off + 3] = v;
      verts[off + 4] = r;
      verts[off + 5] = g;
      verts[off + 6] = b;
      verts[off + 7] = a;
    };
    write(base + 0, tl_x, tl_y, u0, v0);
    write(base + 8, bl_x, bl_y, u0, v1);
    write(base + 16, tr_x, tr_y, u1, v0);
    write(base + 24, tr_x, tr_y, u1, v0);
    write(base + 32, bl_x, bl_y, u0, v1);
    write(base + 40, br_x, br_y, u1, v1);
    this.quad_count++;
  }
  /**
   * Flushes accumulated quads to the GPU with a single draw call.
   * Resets the batch state after drawing.
   */
  flush() {
    if (this.quad_count === 0) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.vertices.subarray(0, this.quad_count * FLOATS_PER_QUAD)
    );
    if (this.current_texture) {
      gl.bindTexture(gl.TEXTURE_2D, this.current_texture);
    }
    gl.drawArrays(gl.TRIANGLES, 0, this.quad_count * VERTS_PER_QUAD);
    gl.bindVertexArray(null);
    this.quad_count = 0;
    this.current_texture = null;
  }
  /**
   * Frees the VAO and VBO GPU resources.
   */
  destroy() {
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteBuffer(this.vbo);
  }
};

// packages/engine/src/drawing/texture_manager.ts
var texture_manager = class {
  constructor(gl) {
    // 1x1 white texture used for colored shapes
    this.textures = /* @__PURE__ */ new Map();
    this.gl = gl;
    this.white_pixel = this.create_white_pixel();
  }
  /**
   * Creates the 1x1 white pixel texture used when drawing solid-colored shapes.
   * @returns WebGLTexture handle
   */
  create_white_pixel() {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error("Failed to create white pixel texture");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }
  /**
   * Loads a texture from a URL and caches it by URL.
   * @param url - Image URL
   * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)
   * @returns Promise resolving to the texture entry
   */
  load(url, smooth = false) {
    if (this.textures.has(url)) {
      return Promise.resolve(this.textures.get(url));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const entry = this.from_image(img, smooth);
        this.textures.set(url, entry);
        resolve(entry);
      };
      img.onerror = () => reject(new Error(`Failed to load texture: ${url}`));
      img.src = url;
    });
  }
  /**
   * Creates a texture from an already-loaded HTMLImageElement.
   * @param img - Source image element
   * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)
   * @returns texture_entry
   */
  from_image(img, smooth = false) {
    const gl = this.gl;
    const filter = smooth ? gl.LINEAR : gl.NEAREST;
    const tex = gl.createTexture();
    if (!tex) throw new Error("Failed to create texture");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return { texture: tex, width: img.width, height: img.height };
  }
  /**
   * Creates a texture from a raw HTMLCanvasElement (used for text rendering).
   * @param canvas - Source canvas element
   * @param smooth - Use LINEAR filtering (true) or NEAREST (false)
   * @returns texture_entry
   */
  from_canvas(canvas, smooth = true) {
    const gl = this.gl;
    const filter = smooth ? gl.LINEAR : gl.NEAREST;
    const tex = gl.createTexture();
    if (!tex) throw new Error("Failed to create texture from canvas");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return { texture: tex, width: canvas.width, height: canvas.height };
  }
  /**
   * Frees a texture from GPU memory and removes it from the cache.
   * @param url - URL key used when loading
   */
  free(url) {
    const entry = this.textures.get(url);
    if (entry) {
      this.gl.deleteTexture(entry.texture);
      this.textures.delete(url);
    }
  }
  /**
   * Frees a raw WebGLTexture directly (used by font_renderer cache cleanup).
   * @param texture - The GPU texture handle to delete
   */
  free_texture(texture) {
    this.gl.deleteTexture(texture);
  }
  /**
   * Frees all tracked textures and the white pixel texture.
   */
  destroy() {
    for (const entry of this.textures.values()) {
      this.gl.deleteTexture(entry.texture);
    }
    this.textures.clear();
    this.gl.deleteTexture(this.white_pixel);
  }
};

// packages/engine/src/drawing/font.ts
var font_resource = class {
  // Italic style
  constructor(family = "Arial", size = 16, bold = false, italic = false) {
    this.family = family;
    this.size = size;
    this.bold = bold;
    this.italic = italic;
    this.name = this.build_css();
  }
  /** Builds the CSS font string. */
  build_css() {
    const style = this.italic ? "italic " : "";
    const weight = this.bold ? "bold " : "";
    return `${style}${weight}${this.size}px ${this.family}`;
  }
};
var font_renderer = class {
  constructor(tex_manager) {
    this.cache = /* @__PURE__ */ new Map();
    this.tex_manager = tex_manager;
    this.offscreen = document.createElement("canvas");
    const ctx = this.offscreen.getContext("2d");
    if (!ctx) throw new Error("Cannot create 2D canvas context for text rendering");
    this.ctx = ctx;
  }
  /**
   * Returns a cached or newly-rendered texture for the given text string.
   * @param text - Text to render
   * @param fnt - Font resource to use
   * @param color_css - CSS color string (e.g. "#FFFFFF")
   * @returns text_cache_entry containing the texture and dimensions
   */
  get_texture(text, fnt, color_css) {
    const key = `${fnt.name}|${color_css}|${text}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const entry = this.rasterize(text, fnt, color_css);
    this.cache.set(key, entry);
    return entry;
  }
  /**
   * Rasterizes text to a canvas and uploads it to a WebGL texture.
   */
  rasterize(text, fnt, color_css) {
    const ctx = this.ctx;
    ctx.font = fnt.name;
    const metrics = ctx.measureText(text);
    const w = Math.max(1, Math.ceil(metrics.width));
    const h = Math.max(1, Math.ceil(fnt.size * 1.5));
    this.offscreen.width = w;
    this.offscreen.height = h;
    ctx.font = fnt.name;
    ctx.fillStyle = color_css;
    ctx.textBaseline = "top";
    ctx.clearRect(0, 0, w, h);
    ctx.fillText(text, 0, 0);
    const tex_entry = this.tex_manager.from_canvas(this.offscreen, true);
    return { entry: tex_entry, width: w, height: h };
  }
  /**
   * Measures the pixel width of a string with the given font.
   * @param text - Text to measure
   * @param fnt - Font resource
   * @returns Width in pixels
   */
  measure_width(text, fnt) {
    this.ctx.font = fnt.name;
    return Math.ceil(this.ctx.measureText(text).width);
  }
  /**
   * Measures the pixel height of a string with the given font.
   * @param fnt - Font resource
   * @returns Height in pixels
   */
  measure_height(fnt) {
    return Math.ceil(fnt.size * 1.5);
  }
  /**
   * Clears the text texture cache and frees GPU memory.
   */
  clear_cache() {
    for (const entry of this.cache.values()) {
      this.tex_manager.free_texture(entry.entry.texture);
    }
    this.cache.clear();
  }
};

// packages/engine/src/drawing/color.ts
var c_aqua = 16776960;
var c_black = 0;
var c_blue = 16711680;
var c_dkgray = 4210752;
var c_fuchsia = 16711935;
var c_gray = 8421504;
var c_green = 32768;
var c_lime = 65280;
var c_ltgray = 12632256;
var c_maroon = 128;
var c_navy = 8388608;
var c_olive = 32896;
var c_orange = 33023;
var c_purple = 8388736;
var c_red = 255;
var c_silver = 12632256;
var c_teal = 8421376;
var c_white = 16777215;
var c_yellow = 65535;
var bm_normal = 0;
var bm_add = 1;
var bm_max = 2;
var bm_subtract = 3;
var fa_left = 0;
var fa_center = 1;
var fa_right = 2;
var fa_top = 0;
var fa_middle = 1;
var fa_bottom = 2;
function make_color_rgb(r, g, b) {
  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return b << 16 | g << 8 | r;
}
function make_color_hsv(h, s, v) {
  h = h / 255 * 360;
  s = s / 255;
  v = v / 255;
  const c = v * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return make_color_rgb(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}
function color_get_red(col) {
  return col & 255;
}
function color_get_green(col) {
  return col >> 8 & 255;
}
function color_get_blue(col) {
  return col >> 16 & 255;
}
function merge_color(col1, col2, amount) {
  amount = Math.max(0, Math.min(1, amount));
  const r1 = color_get_red(col1), r2 = color_get_red(col2);
  const g1 = color_get_green(col1), g2 = color_get_green(col2);
  const b1 = color_get_blue(col1), b2 = color_get_blue(col2);
  return make_color_rgb(
    r1 + (r2 - r1) * amount,
    g1 + (g2 - g1) * amount,
    b1 + (b2 - b1) * amount
  );
}
function color_to_rgb_normalized(col) {
  return [
    color_get_red(col) / 255,
    color_get_green(col) / 255,
    color_get_blue(col) / 255
  ];
}

// packages/engine/src/drawing/renderer.ts
var renderer = class {
  static {
    this.projection_loc = null;
  }
  static {
    this.active_proj_loc = null;
  }
  static {
    // ---- Draw state ----
    this.draw_color = 16777215;
  }
  static {
    // Current BGR draw color
    this.draw_alpha = 1;
  }
  static {
    // Current alpha (0–1)
    this.blend_mode = bm_normal;
  }
  static {
    // Active blend mode
    this.current_font = new font_resource("Arial", 16);
  }
  static {
    this.halign = 0;
  }
  static {
    // Horizontal text alignment
    this.valign = 0;
  }
  static {
    // Vertical text alignment
    // ---- Active render target (null = screen) ----
    this.active_surface = null;
  }
  /**
   * Initialises the renderer with an existing canvas or creates a new one.
   * Must be called before any drawing functions.
   * @param canvas_or_id - Canvas element or CSS selector string
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   */
  static init(canvas_or_id, width = 800, height = 600) {
    if (typeof canvas_or_id === "string") {
      const el = document.querySelector(canvas_or_id);
      if (!el) throw new Error(`Canvas not found: ${canvas_or_id}`);
      this.canvas = el;
    } else {
      this.canvas = canvas_or_id;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    const gl = this.canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL 2 is not supported in this browser");
    this.gl = gl;
    this.program = create_program(gl, DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER);
    this.projection_loc = gl.getUniformLocation(this.program, "u_projection");
    this.active_proj_loc = this.projection_loc;
    this.tex_mgr = new texture_manager(gl);
    this.batch = new batch_renderer(gl);
    this.font_rend = new font_renderer(this.tex_mgr);
    gl.enable(gl.BLEND);
    this.apply_blend_mode(bm_normal);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(this.program);
    this.upload_projection(width, height);
    set_draw_sprite_ext(this.draw_sprite_ext.bind(this));
    set_frame_hooks(
      () => this.begin_frame(),
      () => this.end_frame()
    );
  }
  // =========================================================================
  // Projection helpers
  // =========================================================================
  /**
   * Uploads an orthographic projection matrix for pixel-space coordinates.
   * Origin at top-left, Y increases downward.
   * @param w - Viewport width
   * @param h - Viewport height
   */
  static upload_projection(w, h) {
    const gl = this.gl;
    const matrix = new Float32Array([
      2 / w,
      0,
      0,
      0,
      0,
      -2 / h,
      0,
      0,
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1
    ]);
    gl.uniformMatrix4fv(this.projection_loc, false, matrix);
  }
  // =========================================================================
  // Frame management
  // =========================================================================
  /**
   * Called at the start of each draw frame.
   * Clears the color buffer and prepares the render state.
   * @param r - Clear color red (0–1)
   * @param g - Clear color green (0–1)
   * @param b - Clear color blue (0–1)
   */
  static begin_frame(r = 0, g = 0, b = 0) {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    this.upload_projection(this.canvas.width, this.canvas.height);
  }
  /**
   * Called at the end of each draw frame to flush remaining batched quads.
   */
  static end_frame() {
    this.batch.flush();
  }
  // =========================================================================
  // Draw state
  // =========================================================================
  /** Sets the current draw color (BGR integer). */
  static set_color(col) {
    this.draw_color = col;
  }
  /** Returns the current draw color (BGR integer). */
  static get_color() {
    return this.draw_color;
  }
  /** Sets the current draw alpha (0–1). */
  static set_alpha(a) {
    this.draw_alpha = Math.max(0, Math.min(1, a));
  }
  /** Returns the current draw alpha. */
  static get_alpha() {
    return this.draw_alpha;
  }
  /** Returns the currently active font resource. */
  static get_current_font() {
    return this.current_font;
  }
  /** Sets the current font for text rendering. */
  static set_font(fnt) {
    this.current_font = fnt;
  }
  /** Sets the horizontal text alignment (fa_left / fa_center / fa_right). */
  static set_halign(align) {
    this.halign = align;
  }
  /** Sets the vertical text alignment (fa_top / fa_middle / fa_bottom). */
  static set_valign(align) {
    this.valign = align;
  }
  /**
   * Sets the active blend mode.
   * Flushes the current batch before changing GL blend state.
   * @param mode - bm_normal, bm_add, bm_max, or bm_subtract
   */
  static set_blend_mode(mode) {
    if (mode === this.blend_mode) return;
    this.batch.flush();
    this.blend_mode = mode;
    this.apply_blend_mode(mode);
  }
  static apply_blend_mode(mode) {
    const gl = this.gl;
    switch (mode) {
      case 1:
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        break;
      case 2:
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.MAX);
        break;
      case 3:
        gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
        gl.blendEquation(gl.FUNC_SUBTRACT);
        break;
      default:
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendEquation(gl.FUNC_ADD);
        break;
    }
  }
  // =========================================================================
  // Surface management
  // =========================================================================
  /**
   * Creates a new render-to-texture surface.
   * @param w - Surface width in pixels
   * @param h - Surface height in pixels
   * @returns surface object
   */
  static surface_create(w, h) {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error("Failed to create surface texture");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    const fbo = gl.createFramebuffer();
    if (!fbo) throw new Error("Failed to create framebuffer");
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, texture: tex, width: w, height: h, valid: true };
  }
  /**
   * Sets the render target to a surface.
   * Subsequent draw calls will render into the surface.
   * @param surf - Target surface
   */
  static surface_set_target(surf) {
    if (!surf.valid) return;
    this.batch.flush();
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, surf.fbo);
    gl.viewport(0, 0, surf.width, surf.height);
    this.upload_projection(surf.width, surf.height);
    this.active_surface = surf;
  }
  /**
   * Resets the render target back to the screen.
   */
  static surface_reset_target() {
    this.batch.flush();
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.upload_projection(this.canvas.width, this.canvas.height);
    this.active_surface = null;
  }
  /**
   * Frees a surface's GPU resources.
   * @param surf - Surface to free
   */
  static surface_free(surf) {
    if (!surf.valid) return;
    this.batch.flush();
    const gl = this.gl;
    gl.deleteTexture(surf.texture);
    gl.deleteFramebuffer(surf.fbo);
    surf.valid = false;
  }
  // =========================================================================
  // Sprite drawing
  // =========================================================================
  /**
   * Draws a sprite at the given position using the instance's current frame.
   * @param spr - Sprite resource
   * @param subimg - Frame index (float; will be floored and wrapped)
   * @param x - X position (adjusted for sprite origin)
   * @param y - Y position (adjusted for sprite origin)
   */
  static draw_sprite(spr, subimg, x, y) {
    const frame = spr.get_frame(subimg);
    if (!frame) return;
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(
      x - spr.xoffset,
      y - spr.yoffset,
      frame.width,
      frame.height,
      0,
      0,
      1,
      1,
      r,
      g,
      b,
      this.draw_alpha,
      frame.texture.texture
    );
  }
  /**
   * Draws a sprite with extended transforms (scale, rotation, blend color, alpha).
   * @param spr - Sprite resource
   * @param subimg - Frame index
   * @param x - X position
   * @param y - Y position
   * @param xscale - Horizontal scale factor
   * @param yscale - Vertical scale factor
   * @param rot - Rotation in degrees (counter-clockwise)
   * @param color - Tint color (BGR integer, 0xFFFFFF = no tint)
   * @param alpha - Transparency (0–1)
   */
  static draw_sprite_ext(spr, subimg, x, y, xscale, yscale, rot, color, alpha) {
    const frame = spr.get_frame(subimg);
    if (!frame) return;
    const [r, g, b] = color_to_rgb_normalized(color);
    this.batch.add_quad_transformed(
      x,
      y,
      frame.width,
      frame.height,
      spr.xoffset,
      spr.yoffset,
      xscale,
      yscale,
      rot,
      0,
      0,
      1,
      1,
      r,
      g,
      b,
      alpha,
      frame.texture.texture
    );
  }
  /**
   * Draws a sub-region of a sprite frame.
   * @param spr - Sprite resource
   * @param subimg - Frame index
   * @param left - Source left (pixels from frame left)
   * @param top - Source top (pixels from frame top)
   * @param width - Source width in pixels
   * @param height - Source height in pixels
   * @param x - Destination X
   * @param y - Destination Y
   */
  static draw_sprite_part(spr, subimg, left, top, width, height, x, y) {
    const frame = spr.get_frame(subimg);
    if (!frame) return;
    const fw = frame.width;
    const fh = frame.height;
    const u0 = left / fw;
    const v0 = top / fh;
    const u1 = (left + width) / fw;
    const v1 = (top + height) / fh;
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(x, y, width, height, u0, v0, u1, v1, r, g, b, this.draw_alpha, frame.texture.texture);
  }
  /**
   * Draws a sprite stretched to fit the given dimensions.
   * @param spr - Sprite resource
   * @param subimg - Frame index
   * @param x - Destination X (top-left)
   * @param y - Destination Y (top-left)
   * @param w - Target width
   * @param h - Target height
   */
  static draw_sprite_stretched(spr, subimg, x, y, w, h) {
    const frame = spr.get_frame(subimg);
    if (!frame) return;
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(x, y, w, h, 0, 0, 1, 1, r, g, b, this.draw_alpha, frame.texture.texture);
  }
  /**
   * Draws a surface as if it were a sprite.
   * @param surf - Surface to draw
   * @param x - Destination X
   * @param y - Destination Y
   */
  static draw_surface(surf, x, y) {
    if (!surf.valid) return;
    const [r, g, b] = color_to_rgb_normalized(16777215);
    this.batch.add_quad(x, y, surf.width, surf.height, 0, 1, 1, 0, r, g, b, this.draw_alpha, surf.texture);
  }
  // =========================================================================
  // Text drawing
  // =========================================================================
  /**
   * Draws a text string at the given position using the current font and alignment.
   * @param x - X position
   * @param y - Y position
   * @param text - String to draw
   */
  static draw_text(x, y, text) {
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    const color_css = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    const cached = this.font_rend.get_texture(String(text), this.current_font, color_css);
    let dx = x;
    let dy = y;
    if (this.halign === 1) dx -= cached.width / 2;
    else if (this.halign === 2) dx -= cached.width;
    if (this.valign === 1) dy -= cached.height / 2;
    else if (this.valign === 2) dy -= cached.height;
    this.batch.add_quad(
      dx,
      dy,
      cached.width,
      cached.height,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      this.draw_alpha,
      cached.entry.texture
    );
  }
  // =========================================================================
  // Shape drawing
  // =========================================================================
  /**
   * Clears the screen (or current surface) with a solid color.
   * @param col - BGR color integer
   */
  static draw_clear(col) {
    const [r, g, b] = color_to_rgb_normalized(col);
    const gl = this.gl;
    this.batch.flush();
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  /**
   * Draws a filled or outlined axis-aligned rectangle.
   * @param x1 - Left
   * @param y1 - Top
   * @param x2 - Right
   * @param y2 - Bottom
   * @param outline - True for outline only, false for filled
   */
  static draw_rectangle(x1, y1, x2, y2, outline) {
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      this.batch.add_quad(x1, y1, x2 - x1, y2 - y1, 0, 0, 1, 1, r, g, b, a, wp);
    } else {
      const t = 1;
      this.batch.add_quad(x1, y1, x2 - x1, t, 0, 0, 1, 1, r, g, b, a, wp);
      this.batch.add_quad(x1, y2 - t, x2 - x1, t, 0, 0, 1, 1, r, g, b, a, wp);
      this.batch.add_quad(x1, y1 + t, t, y2 - y1 - 2, 0, 0, 1, 1, r, g, b, a, wp);
      this.batch.add_quad(x2 - t, y1 + t, t, y2 - y1 - 2, 0, 0, 1, 1, r, g, b, a, wp);
    }
  }
  /**
   * Draws a filled or outlined circle using a triangle fan approximation.
   * @param cx - Center X
   * @param cy - Center Y
   * @param r_px - Radius in pixels
   * @param outline - True for outline only
   */
  static draw_circle(cx, cy, r_px, outline) {
    const SEGMENTS = 32;
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = i / SEGMENTS * Math.PI * 2;
        const a1 = (i + 1) / SEGMENTS * Math.PI * 2;
        const x0 = cx + Math.cos(a0) * r_px;
        const y0 = cy + Math.sin(a0) * r_px;
        const x1 = cx + Math.cos(a1) * r_px;
        const y1 = cy + Math.sin(a1) * r_px;
        this.draw_triangle_internal(cx, cy, x0, y0, x1, y1, r, g, b, a, wp);
      }
    } else {
      const thickness = 1;
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = i / SEGMENTS * Math.PI * 2;
        const a1 = (i + 1) / SEGMENTS * Math.PI * 2;
        const x0 = cx + Math.cos(a0) * r_px;
        const y0 = cy + Math.sin(a0) * r_px;
        const x1 = cx + Math.cos(a1) * r_px;
        const y1 = cy + Math.sin(a1) * r_px;
        this.draw_line_width_internal(x0, y0, x1, y1, thickness, r, g, b, a, wp);
      }
    }
  }
  /**
   * Draws a line between two points.
   * @param x1 - Start X
   * @param y1 - Start Y
   * @param x2 - End X
   * @param y2 - End Y
   */
  static draw_line(x1, y1, x2, y2) {
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    this.draw_line_width_internal(x1, y1, x2, y2, 1, r, g, b, this.draw_alpha, this.tex_mgr.white_pixel);
  }
  /**
   * Draws a line with a specific pixel width.
   * @param x1 - Start X
   * @param y1 - Start Y
   * @param x2 - End X
   * @param y2 - End Y
   * @param w - Line width in pixels
   */
  static draw_line_width(x1, y1, x2, y2, w) {
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    this.draw_line_width_internal(x1, y1, x2, y2, w, r, g, b, this.draw_alpha, this.tex_mgr.white_pixel);
  }
  /**
   * Draws a single point (1×1 pixel) at the given position.
   * @param x - X position
   * @param y - Y position
   */
  static draw_point(x, y) {
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(x, y, 1, 1, 0, 0, 1, 1, r, g, b, this.draw_alpha, this.tex_mgr.white_pixel);
  }
  /**
   * Draws a filled or outlined triangle.
   * @param x1 - Vertex 1 X
   * @param y1 - Vertex 1 Y
   * @param x2 - Vertex 2 X
   * @param y2 - Vertex 2 Y
   * @param x3 - Vertex 3 X
   * @param y3 - Vertex 3 Y
   * @param outline - True for outline only
   */
  static draw_triangle(x1, y1, x2, y2, x3, y3, outline) {
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      this.draw_triangle_internal(x1, y1, x2, y2, x3, y3, r, g, b, a, wp);
    } else {
      this.draw_line_width_internal(x1, y1, x2, y2, 1, r, g, b, a, wp);
      this.draw_line_width_internal(x2, y2, x3, y3, 1, r, g, b, a, wp);
      this.draw_line_width_internal(x3, y3, x1, y1, 1, r, g, b, a, wp);
    }
  }
  /**
   * Draws a filled or outlined ellipse.
   * @param x1 - Bounding box left
   * @param y1 - Bounding box top
   * @param x2 - Bounding box right
   * @param y2 - Bounding box bottom
   * @param outline - True for outline only
   */
  static draw_ellipse(x1, y1, x2, y2, outline) {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = (x2 - x1) / 2;
    const ry = (y2 - y1) / 2;
    const SEGMENTS = 32;
    const [r, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = i / SEGMENTS * Math.PI * 2;
        const a1 = (i + 1) / SEGMENTS * Math.PI * 2;
        const px0 = cx + Math.cos(a0) * rx, py0 = cy + Math.sin(a0) * ry;
        const px1 = cx + Math.cos(a1) * rx, py1 = cy + Math.sin(a1) * ry;
        this.draw_triangle_internal(cx, cy, px0, py0, px1, py1, r, g, b, a, wp);
      }
    } else {
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = i / SEGMENTS * Math.PI * 2;
        const a1 = (i + 1) / SEGMENTS * Math.PI * 2;
        const px0 = cx + Math.cos(a0) * rx, py0 = cy + Math.sin(a0) * ry;
        const px1 = cx + Math.cos(a1) * rx, py1 = cy + Math.sin(a1) * ry;
        this.draw_line_width_internal(px0, py0, px1, py1, 1, r, g, b, a, wp);
      }
    }
  }
  // =========================================================================
  // Internal shape helpers
  // =========================================================================
  /**
   * Draws a triangle as two batch quads (degenerate quad approach).
   * The third quad vertex is the same as vertex 3 making a true triangle.
   */
  static draw_triangle_internal(x0, y0, x1, y1, x2, y2, r, g, b, a, texture) {
    const minX = Math.min(x0, x1, x2);
    const maxX = Math.max(x0, x1, x2);
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    const w = maxX - minX;
    const h = maxY - minY;
    if (w < 0.5 || h < 0.5) return;
    this.batch.add_quad(minX, minY, w, h, 0, 0, 1, 1, r, g, b, a, texture);
  }
  /**
   * Draws a line as a thin rectangular quad aligned to the line direction.
   */
  static draw_line_width_internal(x1, y1, x2, y2, width, r, g, b, a, texture) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-3) return;
    const nx = -dy / len * (width / 2);
    const ny = dx / len * (width / 2);
    const ax = x1 + nx, ay = y1 + ny;
    const bx = x1 - nx, by = y1 - ny;
    const cx = x2 - nx, cy = y2 - ny;
    const dx2 = x2 + nx, dy2 = y2 + ny;
    const minX = Math.min(ax, bx, cx, dx2);
    const maxX = Math.max(ax, bx, cx, dx2);
    const minY = Math.min(ay, by, cy, dy2);
    const maxY = Math.max(ay, by, cy, dy2);
    this.batch.add_quad(minX, minY, maxX - minX, maxY - minY, 0, 0, 1, 1, r, g, b, a, texture);
  }
  // =========================================================================
  // Canvas accessors
  // =========================================================================
  /** Returns the underlying HTML canvas element. */
  static get_canvas() {
    return this.canvas;
  }
  /** Returns the WebGL 2 context. */
  static get_gl() {
    return this.gl;
  }
  /** Returns the batch renderer (used by advanced rendering). */
  static get_batch() {
    return this.batch;
  }
  /** Flushes the current batch without a program change. Used by shader_system. */
  static flush_batch() {
    this.batch.flush();
  }
  /**
   * Switches back to the default engine shader program and re-uploads projection.
   * Called by shader_reset().
   */
  static restore_default_program() {
    this.gl.useProgram(this.program);
    this.active_proj_loc = this.projection_loc;
    this.upload_projection(this.canvas.width, this.canvas.height);
  }
  /**
   * Uploads the orthographic projection matrix to an arbitrary program's
   * u_projection uniform. Used when activating a user shader.
   * @param prog - The WebGLProgram to upload to
   */
  static upload_projection_to_program(prog) {
    const gl = this.gl;
    const loc = gl.getUniformLocation(prog, "u_projection");
    this.active_proj_loc = loc;
    if (!loc) return;
    const w = this.active_surface ? this.active_surface.width : this.canvas.width;
    const h = this.active_surface ? this.active_surface.height : this.canvas.height;
    const matrix = new Float32Array([
      2 / w,
      0,
      0,
      0,
      0,
      -2 / h,
      0,
      0,
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1
    ]);
    gl.uniformMatrix4fv(loc, false, matrix);
  }
  /**
   * Uploads a custom projection matrix to the currently active program's
   * u_projection uniform. Used by view_apply() to set room-offset projections.
   * Avoids gl.getParameter() GPU readback by using the cached active location.
   * @param matrix - 16-element column-major Float32Array
   */
  static set_view_projection(matrix) {
    this.gl.uniformMatrix4fv(this.active_proj_loc, false, matrix);
  }
  /** Returns the font renderer. */
  static get_font_renderer() {
    return this.font_rend;
  }
  /**
   * Frees all GPU resources owned by the renderer.
   */
  static destroy() {
    this.batch.flush();
    this.batch.destroy();
    this.tex_mgr.destroy();
    this.font_rend.clear_cache();
    this.gl.deleteProgram(this.program);
  }
};

// packages/engine/src/drawing/sprite.ts
var sprite = class extends resource {
  // Height of the first frame
  constructor() {
    super();
    this.frames = [];
    // Animation frames
    this.xoffset = 0;
    // Horizontal origin point (pixels from left)
    this.yoffset = 0;
    // Vertical origin point (pixels from top)
    this.width = 0;
    // Width of the first frame
    this.height = 0;
  }
  /**
   * Adds a frame to this sprite.
   * @param frame - The frame to add
   */
  add_frame(frame) {
    this.frames.push(frame);
    if (this.frames.length === 1) {
      this.width = frame.width;
      this.height = frame.height;
    }
  }
  /**
   * Returns the number of frames in this sprite.
   */
  get_number() {
    return this.frames.length;
  }
  /**
   * Returns the frame at the given index, wrapping around if out of range.
   * @param index - Frame index
   * @returns sprite_frame or undefined if the sprite has no frames
   */
  get_frame(index) {
    if (this.frames.length === 0) return void 0;
    const i = Math.floor(index) % this.frames.length;
    return this.frames[i < 0 ? i + this.frames.length : i];
  }
};
function sprite_get_width(spr) {
  return spr.width;
}
function sprite_get_height(spr) {
  return spr.height;
}
function sprite_get_xoffset(spr) {
  return spr.xoffset;
}
function sprite_get_yoffset(spr) {
  return spr.yoffset;
}
function sprite_get_number(spr) {
  return spr.get_number();
}

// packages/engine/src/drawing/shader_system.ts
var user_shader = class {
  // Compiled program
  /**
   * @param vs_source - Vertex shader GLSL source (#version 300 es required)
   * @param fs_source - Fragment shader GLSL source
   */
  constructor(vs_source, fs_source) {
    this.internal = new shader_program(renderer.get_gl(), vs_source, fs_source);
  }
  /**
   * Frees the shader's GPU resources.
   * Do not use the shader after calling destroy().
   */
  destroy() {
    this.internal.destroy();
  }
};
var _active_shader = null;
function shader_set(shader) {
  renderer.flush_batch();
  _active_shader = shader;
  renderer.get_gl().useProgram(shader.internal.program);
  renderer.upload_projection_to_program(shader.internal.program);
}
function shader_reset() {
  if (_active_shader === null) return;
  renderer.flush_batch();
  _active_shader = null;
  renderer.restore_default_program();
}
function shader_current() {
  return _active_shader;
}
function shader_get_uniform(shader, name) {
  return shader.internal.get_uniform(name);
}
function shader_set_uniform_f(location, val) {
  renderer.get_gl().uniform1f(location, val);
}
function shader_set_uniform_f2(location, x, y) {
  renderer.get_gl().uniform2f(location, x, y);
}
function shader_set_uniform_f3(location, x, y, z) {
  renderer.get_gl().uniform3f(location, x, y, z);
}
function shader_set_uniform_f4(location, x, y, z, w) {
  renderer.get_gl().uniform4f(location, x, y, z, w);
}
function shader_set_uniform_i(location, val) {
  renderer.get_gl().uniform1i(location, val);
}
function shader_set_uniform_i2(location, x, y) {
  renderer.get_gl().uniform2i(location, x, y);
}
function shader_set_uniform_f_array(location, values) {
  renderer.get_gl().uniform1fv(location, values);
}
function shader_set_uniform_matrix(location, matrix, transpose = false) {
  renderer.get_gl().uniformMatrix4fv(location, transpose, matrix);
}

// packages/engine/src/drawing/view.ts
function make_default_view(port_w = 800, port_h = 600) {
  return {
    enabled: false,
    x: 0,
    y: 0,
    w: port_w,
    h: port_h,
    port_x: 0,
    port_y: 0,
    port_w,
    port_h,
    angle: 0
  };
}
var MAX_VIEWS = 8;
var _views = Array.from({ length: MAX_VIEWS }, () => make_default_view());
function view_get(view_index) {
  if (view_index < 0 || view_index >= MAX_VIEWS) throw new Error(`view_get: index out of range (0\u2013${MAX_VIEWS - 1})`);
  return _views[view_index];
}
function view_set_enabled(view_index, enabled) {
  _views[view_index].enabled = enabled;
}
function view_set_position(view_index, x, y) {
  _views[view_index].x = x;
  _views[view_index].y = y;
}
function view_set_size(view_index, w, h) {
  _views[view_index].w = w;
  _views[view_index].h = h;
}
function view_set_port(view_index, px, py, pw, ph) {
  Object.assign(_views[view_index], { port_x: px, port_y: py, port_w: pw, port_h: ph });
}
function view_set_angle(view_index, angle) {
  _views[view_index].angle = angle;
}
function view_apply(view_index) {
  const v = _views[view_index];
  const gl = renderer.get_gl();
  renderer.flush_batch();
  gl.viewport(v.port_x, v.port_y, v.port_w, v.port_h);
  const scaleX = 2 / v.w;
  const scaleY = -2 / v.h;
  const transX = -1 - v.x * scaleX;
  const transY = 1 - v.y * scaleY;
  const matrix = new Float32Array([
    scaleX,
    0,
    0,
    0,
    0,
    scaleY,
    0,
    0,
    0,
    0,
    1,
    0,
    transX,
    transY,
    0,
    1
  ]);
  renderer.set_view_projection(matrix);
}
function camera_set_view_pos(x, y) {
  _views[0].x = x;
  _views[0].y = y;
  _views[0].enabled = true;
}
function camera_set_view_size(w, h) {
  _views[0].w = w;
  _views[0].h = h;
  _views[0].enabled = true;
}
function view_get_x(view_index = 0) {
  return _views[view_index].x;
}
function view_get_y(view_index = 0) {
  return _views[view_index].y;
}

// packages/engine/src/drawing/draw_functions.ts
function draw_set_color(col) {
  renderer.set_color(col);
}
function draw_get_color() {
  return renderer.get_color();
}
function draw_set_alpha(alpha) {
  renderer.set_alpha(alpha);
}
function draw_get_alpha() {
  return renderer.get_alpha();
}
function draw_clear(col) {
  renderer.draw_clear(col);
}
function draw_set_blend_mode(mode) {
  renderer.set_blend_mode(mode);
}
function draw_sprite(spr, subimg, x, y) {
  renderer.draw_sprite(spr, subimg, x, y);
}
function draw_sprite_ext(spr, subimg, x, y, xscale, yscale, rot, color, alpha) {
  renderer.draw_sprite_ext(spr, subimg, x, y, xscale, yscale, rot, color, alpha);
}
function draw_sprite_part(spr, subimg, left, top, width, height, x, y) {
  renderer.draw_sprite_part(spr, subimg, left, top, width, height, x, y);
}
function draw_sprite_stretched(spr, subimg, x, y, w, h) {
  renderer.draw_sprite_stretched(spr, subimg, x, y, w, h);
}
function draw_point(x, y) {
  renderer.draw_point(x, y);
}
function draw_line(x1, y1, x2, y2) {
  renderer.draw_line(x1, y1, x2, y2);
}
function draw_line_width(x1, y1, x2, y2, w) {
  renderer.draw_line_width(x1, y1, x2, y2, w);
}
function draw_rectangle(x1, y1, x2, y2, outline) {
  renderer.draw_rectangle(x1, y1, x2, y2, outline);
}
function draw_circle(x, y, r, outline) {
  renderer.draw_circle(x, y, r, outline);
}
function draw_ellipse(x1, y1, x2, y2, outline) {
  renderer.draw_ellipse(x1, y1, x2, y2, outline);
}
function draw_triangle(x1, y1, x2, y2, x3, y3, outline) {
  renderer.draw_triangle(x1, y1, x2, y2, x3, y3, outline);
}
function draw_text(x, y, text) {
  renderer.draw_text(x, y, String(text));
}
function draw_set_font(fnt) {
  renderer.set_font(fnt);
}
function draw_set_halign(halign) {
  renderer.set_halign(halign);
}
function draw_set_valign(valign) {
  renderer.set_valign(valign);
}
function string_width(text) {
  return renderer.get_font_renderer().measure_width(text, renderer.get_current_font());
}
function string_height() {
  return renderer.get_font_renderer().measure_height(renderer.get_current_font());
}
function surface_create(w, h) {
  return renderer.surface_create(w, h);
}
function surface_set_target(surf) {
  renderer.surface_set_target(surf);
}
function surface_reset_target() {
  renderer.surface_reset_target();
}
function surface_free(surf) {
  renderer.surface_free(surf);
}
function surface_exists(surf) {
  return surf.valid;
}
function surface_get_width(surf) {
  return surf.width;
}
function surface_get_height(surf) {
  return surf.height;
}
function draw_surface(surf, x, y) {
  renderer.draw_surface(surf, x, y);
}

// packages/engine/src/data/ds_list.ts
var _lists = /* @__PURE__ */ new Map();
var _next_id = 0;
function _get(id) {
  const list = _lists.get(id);
  if (!list) throw new Error(`ds_list: invalid id ${id}`);
  return list;
}
function ds_list_create() {
  const id = _next_id++;
  _lists.set(id, []);
  return id;
}
function ds_list_destroy(id) {
  _lists.delete(id);
}
function ds_list_add(id, val) {
  _get(id).push(val);
}
function ds_list_insert(id, pos, val) {
  _get(id).splice(pos, 0, val);
}
function ds_list_find_value(id, pos) {
  return _get(id)[pos];
}
function ds_list_find_index(id, val) {
  return _get(id).indexOf(val);
}
function ds_list_replace(id, pos, val) {
  const list = _get(id);
  if (pos >= 0 && pos < list.length) list[pos] = val;
}
function ds_list_delete(id, pos) {
  _get(id).splice(pos, 1);
}
function ds_list_size(id) {
  return _get(id).length;
}
function ds_list_empty(id) {
  return _get(id).length === 0;
}
function ds_list_clear(id) {
  _get(id).length = 0;
}
function ds_list_copy(src, dst) {
  const src_list = _get(src);
  const dst_list = _get(dst);
  dst_list.length = 0;
  for (const v of src_list) dst_list.push(v);
}
function ds_list_sort(id, ascending) {
  const list = _get(id);
  list.sort((a, b) => {
    if (a < b) return ascending ? -1 : 1;
    if (a > b) return ascending ? 1 : -1;
    return 0;
  });
}
function ds_list_shuffle(id) {
  const list = _get(id);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}
function ds_list_exists(id) {
  return _lists.has(id);
}

// packages/engine/src/data/ds_map.ts
var _maps = /* @__PURE__ */ new Map();
var _next_id2 = 0;
function _get2(id) {
  const m = _maps.get(id);
  if (!m) throw new Error(`ds_map: invalid id ${id}`);
  return m;
}
function ds_map_create() {
  const id = _next_id2++;
  _maps.set(id, /* @__PURE__ */ new Map());
  return id;
}
function ds_map_destroy(id) {
  _maps.delete(id);
}
function ds_map_add(id, key, val) {
  const m = _get2(id);
  if (!m.has(key)) m.set(key, val);
}
function ds_map_set(id, key, val) {
  _get2(id).set(key, val);
}
function ds_map_find_value(id, key) {
  return _get2(id).get(key);
}
function ds_map_exists(id, key) {
  return _get2(id).has(key);
}
function ds_map_delete(id, key) {
  _get2(id).delete(key);
}
function ds_map_size(id) {
  return _get2(id).size;
}
function ds_map_empty(id) {
  return _get2(id).size === 0;
}
function ds_map_clear(id) {
  _get2(id).clear();
}
function ds_map_copy(src, dst) {
  const src_map = _get2(src);
  const dst_map = _get2(dst);
  dst_map.clear();
  for (const [k, v] of src_map) dst_map.set(k, v);
}
function ds_map_find_first(id) {
  return _get2(id).keys().next().value;
}
function ds_map_find_next(id, key) {
  const keys = Array.from(_get2(id).keys());
  const idx = keys.indexOf(key);
  return idx >= 0 && idx + 1 < keys.length ? keys[idx + 1] : void 0;
}
function ds_map_find_last(id) {
  const keys = Array.from(_get2(id).keys());
  return keys.length > 0 ? keys[keys.length - 1] : void 0;
}
function ds_map_find_previous(id, key) {
  const keys = Array.from(_get2(id).keys());
  const idx = keys.indexOf(key);
  return idx > 0 ? keys[idx - 1] : void 0;
}
function ds_map_exists_id(id) {
  return _maps.has(id);
}

// packages/engine/src/data/ds_grid.ts
var _grids = /* @__PURE__ */ new Map();
var _next_id3 = 0;
function _get3(id) {
  const g = _grids.get(id);
  if (!g) throw new Error(`ds_grid: invalid id ${id}`);
  return g;
}
function _idx(g, x, y) {
  return y * g.w + x;
}
function _in_bounds(g, x, y) {
  return x >= 0 && x < g.w && y >= 0 && y < g.h;
}
function ds_grid_create(w, h) {
  const id = _next_id3++;
  _grids.set(id, { w, h, data: new Array(w * h).fill(0) });
  return id;
}
function ds_grid_destroy(id) {
  _grids.delete(id);
}
function ds_grid_get(id, x, y) {
  const g = _get3(id);
  if (!_in_bounds(g, x, y)) return 0;
  return g.data[_idx(g, x, y)];
}
function ds_grid_set(id, x, y, val) {
  const g = _get3(id);
  if (!_in_bounds(g, x, y)) return;
  g.data[_idx(g, x, y)] = val;
}
function ds_grid_add(id, x, y, val) {
  const g = _get3(id);
  if (!_in_bounds(g, x, y)) return;
  g.data[_idx(g, x, y)] += val;
}
function ds_grid_multiply(id, x, y, factor) {
  const g = _get3(id);
  if (!_in_bounds(g, x, y)) return;
  g.data[_idx(g, x, y)] *= factor;
}
function ds_grid_clear(id, val) {
  _get3(id).data.fill(val);
}
function ds_grid_width(id) {
  return _get3(id).w;
}
function ds_grid_height(id) {
  return _get3(id).h;
}
function ds_grid_copy(src, dst) {
  const s = _get3(src);
  const d = _get3(dst);
  if (s.w !== d.w || s.h !== d.h) throw new Error("ds_grid_copy: grids must have identical dimensions");
  d.data = [...s.data];
}
function ds_grid_region_get(id, x1, y1, x2, y2) {
  const g = _get3(id);
  const out = [];
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      out.push(_in_bounds(g, x, y) ? g.data[_idx(g, x, y)] : 0);
    }
  }
  return out;
}
function ds_grid_set_region(id, x1, y1, x2, y2, val) {
  const g = _get3(id);
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (_in_bounds(g, x, y)) g.data[_idx(g, x, y)] = val;
    }
  }
}
function ds_grid_add_region(id, x1, y1, x2, y2, val) {
  const g = _get3(id);
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (_in_bounds(g, x, y)) g.data[_idx(g, x, y)] += val;
    }
  }
}
function ds_grid_multiply_region(id, x1, y1, x2, y2, factor) {
  const g = _get3(id);
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (_in_bounds(g, x, y)) g.data[_idx(g, x, y)] *= factor;
    }
  }
}
function ds_grid_get_max(id, x1, y1, x2, y2) {
  const g = _get3(id);
  let max2 = -Infinity;
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (_in_bounds(g, x, y)) max2 = Math.max(max2, g.data[_idx(g, x, y)]);
    }
  }
  return max2;
}
function ds_grid_get_min(id, x1, y1, x2, y2) {
  const g = _get3(id);
  let min2 = Infinity;
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (_in_bounds(g, x, y)) min2 = Math.min(min2, g.data[_idx(g, x, y)]);
    }
  }
  return min2;
}
function ds_grid_get_sum(id, x1, y1, x2, y2) {
  const g = _get3(id);
  let sum = 0;
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (_in_bounds(g, x, y)) sum += g.data[_idx(g, x, y)];
    }
  }
  return sum;
}
function ds_grid_get_mean(id, x1, y1, x2, y2) {
  const count = (x2 - x1 + 1) * (y2 - y1 + 1);
  if (count <= 0) return 0;
  return ds_grid_get_sum(id, x1, y1, x2, y2) / count;
}
function ds_grid_exists(id) {
  return _grids.has(id);
}

// packages/engine/src/data/ds_stack.ts
var _stacks = /* @__PURE__ */ new Map();
var _next_id4 = 0;
function _get4(id) {
  const s = _stacks.get(id);
  if (!s) throw new Error(`ds_stack: invalid id ${id}`);
  return s;
}
function ds_stack_create() {
  const id = _next_id4++;
  _stacks.set(id, []);
  return id;
}
function ds_stack_destroy(id) {
  _stacks.delete(id);
}
function ds_stack_push(id, val) {
  _get4(id).push(val);
}
function ds_stack_pop(id) {
  return _get4(id).pop();
}
function ds_stack_top(id) {
  const s = _get4(id);
  return s[s.length - 1];
}
function ds_stack_size(id) {
  return _get4(id).length;
}
function ds_stack_empty(id) {
  return _get4(id).length === 0;
}
function ds_stack_clear(id) {
  _get4(id).length = 0;
}
function ds_stack_copy(src, dst) {
  const s = _get4(src);
  const d = _get4(dst);
  d.length = 0;
  for (const v of s) d.push(v);
}
function ds_stack_exists(id) {
  return _stacks.has(id);
}

// packages/engine/src/data/ds_queue.ts
var Queue = class {
  // Current buffer capacity
  constructor(initial_capacity = 16) {
    this._head = 0;
    // Index of the front element
    this._tail = 0;
    // Index of the next write position
    this._size = 0;
    this._cap = initial_capacity;
    this._data = new Array(initial_capacity);
  }
  _grow() {
    const new_cap = this._cap * 2;
    const new_data = new Array(new_cap);
    for (let i = 0; i < this._size; i++) {
      new_data[i] = this._data[(this._head + i) % this._cap];
    }
    this._data = new_data;
    this._head = 0;
    this._tail = this._size;
    this._cap = new_cap;
  }
  enqueue(val) {
    if (this._size === this._cap) this._grow();
    this._data[this._tail] = val;
    this._tail = (this._tail + 1) % this._cap;
    this._size++;
  }
  dequeue() {
    if (this._size === 0) return void 0;
    const val = this._data[this._head];
    this._head = (this._head + 1) % this._cap;
    this._size--;
    return val;
  }
  head() {
    if (this._size === 0) return void 0;
    return this._data[this._head];
  }
  tail() {
    if (this._size === 0) return void 0;
    return this._data[(this._tail - 1 + this._cap) % this._cap];
  }
  get size() {
    return this._size;
  }
  get empty() {
    return this._size === 0;
  }
  clear() {
    this._head = 0;
    this._tail = 0;
    this._size = 0;
  }
  copy_from(other) {
    this.clear();
    for (let i = 0; i < other._size; i++) {
      this.enqueue(other._data[(other._head + i) % other._cap]);
    }
  }
};
var _queues = /* @__PURE__ */ new Map();
var _next_id5 = 0;
function _get5(id) {
  const q = _queues.get(id);
  if (!q) throw new Error(`ds_queue: invalid id ${id}`);
  return q;
}
function ds_queue_create() {
  const id = _next_id5++;
  _queues.set(id, new Queue());
  return id;
}
function ds_queue_destroy(id) {
  _queues.delete(id);
}
function ds_queue_enqueue(id, val) {
  _get5(id).enqueue(val);
}
function ds_queue_dequeue(id) {
  return _get5(id).dequeue();
}
function ds_queue_head(id) {
  return _get5(id).head();
}
function ds_queue_tail(id) {
  return _get5(id).tail();
}
function ds_queue_size(id) {
  return _get5(id).size;
}
function ds_queue_empty(id) {
  return _get5(id).empty;
}
function ds_queue_clear(id) {
  _get5(id).clear();
}
function ds_queue_copy(src, dst) {
  _get5(dst).copy_from(_get5(src));
}
function ds_queue_exists(id) {
  return _queues.has(id);
}

// packages/engine/src/data/ds_priority.ts
var MinHeap = class {
  constructor() {
    this._data = [];
  }
  get size() {
    return this._data.length;
  }
  get empty() {
    return this._data.length === 0;
  }
  _swap(i, j) {
    ;
    [this._data[i], this._data[j]] = [this._data[j], this._data[i]];
  }
  _sift_up(i) {
    while (i > 0) {
      const parent = i - 1 >> 1;
      if (this._data[parent].priority <= this._data[i].priority) break;
      this._swap(i, parent);
      i = parent;
    }
  }
  _sift_down(i) {
    const n = this._data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this._data[l].priority < this._data[smallest].priority) smallest = l;
      if (r < n && this._data[r].priority < this._data[smallest].priority) smallest = r;
      if (smallest === i) break;
      this._swap(i, smallest);
      i = smallest;
    }
  }
  push(val, priority) {
    this._data.push({ val, priority });
    this._sift_up(this._data.length - 1);
  }
  /** Returns the entry with the lowest priority without removing it. */
  peek_min() {
    return this._data[0];
  }
  /** Returns the entry with the highest priority (largest number) without removing it. */
  peek_max() {
    if (this._data.length === 0) return void 0;
    let max2 = this._data[0];
    const start = Math.floor(this._data.length / 2);
    for (let i = start; i < this._data.length; i++) {
      if (this._data[i].priority > max2.priority) max2 = this._data[i];
    }
    return max2;
  }
  /** Removes and returns the entry with the lowest priority. */
  pop_min() {
    if (this._data.length === 0) return void 0;
    const top = this._data[0];
    const last = this._data.pop();
    if (this._data.length > 0) {
      this._data[0] = last;
      this._sift_down(0);
    }
    return top;
  }
  /** Removes and returns the entry with the highest priority (largest number). */
  pop_max() {
    if (this._data.length === 0) return void 0;
    const max_entry = this.peek_max();
    const idx = this._data.indexOf(max_entry);
    const last = this._data.pop();
    if (idx < this._data.length) {
      this._data[idx] = last;
      this._sift_up(idx);
      this._sift_down(idx);
    }
    return max_entry;
  }
  /** Removes the first occurrence of a value. */
  delete_value(val) {
    const idx = this._data.findIndex((e) => e.val === val);
    if (idx < 0) return false;
    const last = this._data.pop();
    if (idx < this._data.length) {
      this._data[idx] = last;
      this._sift_up(idx);
      this._sift_down(idx);
    }
    return true;
  }
  /** Returns the priority of a value, or undefined if not found. */
  find_priority(val) {
    const entry = this._data.find((e) => e.val === val);
    return entry?.priority;
  }
  clear() {
    this._data.length = 0;
  }
  copy_from(other) {
    this._data = other._data.map((e) => ({ ...e }));
  }
};
var _pqs = /* @__PURE__ */ new Map();
var _next_id6 = 0;
function _get6(id) {
  const pq = _pqs.get(id);
  if (!pq) throw new Error(`ds_priority: invalid id ${id}`);
  return pq;
}
function ds_priority_create() {
  const id = _next_id6++;
  _pqs.set(id, new MinHeap());
  return id;
}
function ds_priority_destroy(id) {
  _pqs.delete(id);
}
function ds_priority_add(id, val, priority) {
  _get6(id).push(val, priority);
}
function ds_priority_delete_value(id, val) {
  _get6(id).delete_value(val);
}
function ds_priority_delete_min(id) {
  return _get6(id).pop_min()?.val;
}
function ds_priority_delete_max(id) {
  return _get6(id).pop_max()?.val;
}
function ds_priority_find_min(id) {
  return _get6(id).peek_min()?.val;
}
function ds_priority_find_max(id) {
  return _get6(id).peek_max()?.val;
}
function ds_priority_find_priority(id, val) {
  return _get6(id).find_priority(val);
}
function ds_priority_size(id) {
  return _get6(id).size;
}
function ds_priority_empty(id) {
  return _get6(id).empty;
}
function ds_priority_clear(id) {
  _get6(id).clear();
}
function ds_priority_copy(src, dst) {
  _get6(dst).copy_from(_get6(src));
}
function ds_priority_exists(id) {
  return _pqs.has(id);
}

// packages/engine/src/storage/ini.ts
var _current_key = null;
var _current_data = null;
function _storage_key(filename) {
  return `silkweaver_ini_${filename}`;
}
function _assert_open() {
  if (!_current_data) throw new Error("ini: no file is open \u2014 call ini_open() first");
  return _current_data;
}
function ini_open(filename) {
  if (_current_key !== null) ini_close();
  _current_key = _storage_key(filename);
  const raw = localStorage.getItem(_current_key);
  if (raw) {
    try {
      _current_data = JSON.parse(raw);
    } catch {
      _current_data = {};
    }
  } else {
    _current_data = {};
  }
}
function ini_close() {
  if (_current_key !== null && _current_data !== null) {
    try {
      localStorage.setItem(_current_key, JSON.stringify(_current_data));
    } catch {
    }
  }
  _current_key = null;
  _current_data = null;
}
function ini_read_string(section, key, default_val) {
  const data = _assert_open();
  return data[section]?.[key] ?? default_val;
}
function ini_read_real(section, key, default_val) {
  const data = _assert_open();
  const raw = data[section]?.[key];
  if (raw === void 0) return default_val;
  const num = Number(raw);
  return isNaN(num) ? default_val : num;
}
function ini_write_string(section, key, val) {
  const data = _assert_open();
  if (!data[section]) data[section] = {};
  data[section][key] = String(val);
}
function ini_write_real(section, key, val) {
  const data = _assert_open();
  if (!data[section]) data[section] = {};
  data[section][key] = String(val);
}
function ini_key_exists(section, key) {
  const data = _assert_open();
  return data[section] !== void 0 && key in data[section];
}
function ini_section_exists(section) {
  const data = _assert_open();
  return section in data;
}
function ini_key_delete(section, key) {
  const data = _assert_open();
  if (data[section]) delete data[section][key];
}
function ini_section_delete(section) {
  const data = _assert_open();
  delete data[section];
}
function ini_delete(filename) {
  localStorage.removeItem(_storage_key(filename));
  if (_current_key === _storage_key(filename)) {
    _current_key = null;
    _current_data = null;
  }
}

// packages/engine/src/storage/file_system.ts
var DB_NAME = "silkweaver_fs";
var DB_VERSION = 1;
var STORE_NAME = "files";
function _open_db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function _db_get(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function _db_put(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function _db_delete(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function _db_has(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).count(key);
    req.onsuccess = () => resolve(req.result > 0);
    req.onerror = () => reject(req.error);
  });
}
var FILE_MODE_READ = 0;
var FILE_MODE_WRITE = 1;
var FILE_MODE_APPEND = 2;
var _handles = /* @__PURE__ */ new Map();
var _next_handle = 1;
async function file_text_open_read(filename) {
  const db = await _open_db();
  const content = await _db_get(db, filename);
  db.close();
  if (content === void 0) return -1;
  const id = _next_handle++;
  _handles.set(id, { filename, mode: FILE_MODE_READ, content, pos: 0, buffer: "" });
  return id;
}
async function file_text_open_write(filename) {
  const id = _next_handle++;
  _handles.set(id, { filename, mode: FILE_MODE_WRITE, content: "", pos: 0, buffer: "" });
  return id;
}
async function file_text_open_append(filename) {
  const db = await _open_db();
  const content = await _db_get(db, filename) ?? "";
  db.close();
  const id = _next_handle++;
  _handles.set(id, { filename, mode: FILE_MODE_APPEND, content: "", pos: 0, buffer: content });
  return id;
}
async function file_text_close(handle) {
  const fh = _handles.get(handle);
  if (!fh) return;
  if (fh.mode === FILE_MODE_WRITE || fh.mode === FILE_MODE_APPEND) {
    const db = await _open_db();
    await _db_put(db, fh.filename, fh.buffer);
    db.close();
  }
  _handles.delete(handle);
}
function file_text_readln(handle) {
  const fh = _handles.get(handle);
  if (!fh || fh.mode !== FILE_MODE_READ) return "";
  if (fh.pos >= fh.content.length) return "";
  const nl = fh.content.indexOf("\n", fh.pos);
  if (nl < 0) {
    const line2 = fh.content.slice(fh.pos).replace(/\r$/, "");
    fh.pos = fh.content.length;
    return line2;
  }
  const line = fh.content.slice(fh.pos, nl).replace(/\r$/, "");
  fh.pos = nl + 1;
  return line;
}
function file_text_read_string(handle) {
  const fh = _handles.get(handle);
  if (!fh || fh.mode !== FILE_MODE_READ) return "";
  while (fh.pos < fh.content.length && /\s/.test(fh.content[fh.pos])) fh.pos++;
  const start = fh.pos;
  while (fh.pos < fh.content.length && !/\s/.test(fh.content[fh.pos])) fh.pos++;
  return fh.content.slice(start, fh.pos);
}
function file_text_eof(handle) {
  const fh = _handles.get(handle);
  if (!fh) return true;
  return fh.pos >= fh.content.length;
}
function file_text_write_string(handle, str) {
  const fh = _handles.get(handle);
  if (!fh || fh.mode === FILE_MODE_READ) return;
  fh.buffer += str;
}
function file_text_writeln(handle) {
  const fh = _handles.get(handle);
  if (!fh || fh.mode === FILE_MODE_READ) return;
  fh.buffer += "\n";
}
async function file_exists(filename) {
  const db = await _open_db();
  const has = await _db_has(db, filename);
  db.close();
  return has;
}
async function file_delete(filename) {
  const db = await _open_db();
  await _db_delete(db, filename);
  db.close();
}

// packages/engine/src/storage/json_storage.ts
function json_encode(val) {
  try {
    return JSON.stringify(val) ?? "";
  } catch {
    return "";
  }
}
function json_decode(str) {
  try {
    return JSON.parse(str);
  } catch {
    return void 0;
  }
}
function json_stringify_pretty(val, indent = 2) {
  try {
    return JSON.stringify(val, null, indent);
  } catch {
    return "";
  }
}
function json_deep_clone(val) {
  const encoded = json_encode(val);
  if (!encoded) return void 0;
  return json_decode(encoded);
}
function json_is_valid(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
function json_save(key, val) {
  const encoded = json_encode(val);
  if (encoded) localStorage.setItem(key, encoded);
}
function json_load(key, default_val) {
  const raw = localStorage.getItem(key);
  if (raw === null) return default_val;
  const parsed = json_decode(raw);
  return parsed !== void 0 ? parsed : default_val;
}
function json_delete(key) {
  localStorage.removeItem(key);
}

// packages/engine/src/audio/audio_system.ts
var audio_system = class {
  static {
    this._ctx = null;
  }
  static {
    // Shared Web Audio context
    this._master = null;
  }
  // Master gain node (0–1)
  /**
   * Initialises the Web Audio context and master gain node.
   * Safe to call multiple times — only initialises once.
   */
  static init() {
    if (this._ctx) return;
    this._ctx = new AudioContext();
    this._master = this._ctx.createGain();
    this._master.connect(this._ctx.destination);
    this._master.gain.value = 1;
  }
  /**
   * Resumes the AudioContext after a user gesture.
   * Browsers suspend audio until user interaction occurs.
   */
  static resume() {
    if (!this._ctx) return Promise.resolve();
    return this._ctx.resume();
  }
  /**
   * Returns the shared AudioContext.
   * Throws if init() has not been called.
   */
  static get ctx() {
    if (!this._ctx) throw new Error("audio_system: call init() first");
    return this._ctx;
  }
  /**
   * Returns the master GainNode.
   * Throws if init() has not been called.
   */
  static get master() {
    if (!this._master) throw new Error("audio_system: call init() first");
    return this._master;
  }
  /** Returns true if the audio system has been initialised. */
  static get is_ready() {
    return this._ctx !== null;
  }
  /**
   * Sets the master gain (volume) for all audio.
   * @param gain - Volume level (0 = silent, 1 = full)
   */
  static set_master_gain(gain) {
    if (!this._master) return;
    this._master.gain.value = Math.max(0, gain);
  }
  /** Returns the current master gain level. */
  static get_master_gain() {
    return this._master?.gain.value ?? 1;
  }
  /**
   * Returns the current AudioContext time in seconds.
   * Used for precise scheduling.
   */
  static get current_time() {
    return this._ctx?.currentTime ?? 0;
  }
};

// packages/engine/src/audio/audio_group.ts
var audio_group = class extends resource {
  // Web Audio gain node for this bus
  /**
   * @param group_name - Unique name for this audio group
   */
  constructor(group_name) {
    super();
    // Human-readable group name
    this._gain_node = null;
    this.group_name = group_name;
  }
  /**
   * Returns the GainNode for this group, creating it if necessary.
   * Lazily initialised so it can be constructed before audio_system.init().
   */
  get gain_node() {
    if (!this._gain_node) {
      this._gain_node = audio_system.ctx.createGain();
      this._gain_node.connect(audio_system.master);
    }
    return this._gain_node;
  }
  /**
   * Sets the gain (volume) for this group.
   * @param gain - Volume level (0 = silent, 1 = full)
   */
  set_gain(gain) {
    this.gain_node.gain.value = Math.max(0, gain);
  }
  /** Returns the current gain for this group. */
  get_gain() {
    return this._gain_node?.gain.value ?? 1;
  }
  /**
   * Stops all sounds in this group by disconnecting and reconnecting
   * the gain node. Individual sound tracking is handled by sound_instance.
   * This is a volume-only group; stopping is done via the sound registry.
   */
  stop_all() {
    if (_stop_group_cb) _stop_group_cb(this.group_name);
  }
};
var _groups = /* @__PURE__ */ new Map();
var _stop_group_cb = null;
function set_stop_group_callback(cb) {
  _stop_group_cb = cb;
}
function get_or_create_group(name) {
  let g = _groups.get(name);
  if (!g) {
    g = new audio_group(name);
    _groups.set(name, g);
  }
  return g;
}
function audio_group_set_gain(group_name, gain) {
  get_or_create_group(group_name).set_gain(gain);
}
function audio_group_get_gain(group_name) {
  return get_or_create_group(group_name).get_gain();
}
function audio_group_stop(group_name) {
  get_or_create_group(group_name).stop_all();
}

// packages/engine/src/audio/sound.ts
set_stop_group_callback((group_name) => {
  for (const [id, name] of _instance_groups) {
    if (name === group_name) _instances.get(id)?.stop();
  }
});
var sound_asset = class extends resource {
  constructor() {
    super(...arguments);
    this.buffer = null;
    // Decoded PCM data
    this.loop = false;
    // Whether playback loops by default
    this.group_name = "default";
  }
  // Audio group this asset belongs to
  /**
   * Loads a sound from a URL, decoding it into an AudioBuffer.
   * @param url - URL to an audio file (mp3, ogg, wav, etc.)
   * @param group_name - Audio group to assign this sound to
   * @param loop - Whether to loop by default
   * @returns Promise that resolves when decoding is complete
   */
  async load_url(url, group_name = "default", loop = false) {
    this.group_name = group_name;
    this.loop = loop;
    const response = await fetch(url);
    const array_buf = await response.arrayBuffer();
    this.buffer = await audio_system.ctx.decodeAudioData(array_buf);
  }
  /**
   * Loads a sound from a pre-fetched ArrayBuffer.
   * @param array_buf - Raw audio data
   * @param group_name - Audio group
   * @param loop - Whether to loop by default
   */
  async load_buffer(array_buf, group_name = "default", loop = false) {
    this.group_name = group_name;
    this.loop = loop;
    this.buffer = await audio_system.ctx.decodeAudioData(array_buf);
  }
};
var _next_instance_id = 1;
var sound_instance = class {
  // Callback on natural end
  constructor(source, gain) {
    // Per-instance volume control
    this._playing = true;
    // Whether currently playing
    this._on_ended = null;
    this.instance_id = _next_instance_id++;
    this._source = source;
    this._gain = gain;
    this._source.addEventListener("ended", () => {
      this._playing = false;
      if (this._on_ended) this._on_ended();
    });
  }
  /** Stops playback immediately. */
  stop() {
    if (!this._playing) return;
    try {
      this._source.stop();
    } catch (_) {
    }
    this._playing = false;
  }
  /**
   * Sets the gain for this specific playback instance.
   * @param gain - Volume level (0–1)
   */
  set_gain(gain) {
    this._gain.gain.value = Math.max(0, gain);
  }
  /** Returns the current instance gain. */
  get_gain() {
    return this._gain.gain.value;
  }
  /**
   * Sets the playback pitch as a speed multiplier.
   * 1.0 = normal, 2.0 = one octave up, 0.5 = one octave down.
   * @param pitch - Playback rate multiplier
   */
  set_pitch(pitch) {
    this._source.playbackRate.value = Math.max(0.01, pitch);
  }
  /** Returns true if this instance is still playing. */
  get is_playing() {
    return this._playing;
  }
  /**
   * Registers a callback invoked when the sound ends naturally (not on stop()).
   * @param cb - Callback function
   */
  on_ended(cb) {
    this._on_ended = cb;
  }
};
var _instances = /* @__PURE__ */ new Map();
var _instance_groups = /* @__PURE__ */ new Map();
function _register(inst, group_name = "") {
  _instances.set(inst.instance_id, inst);
  _instance_groups.set(inst.instance_id, group_name);
  inst.on_ended(() => {
    _instances.delete(inst.instance_id);
    _instance_groups.delete(inst.instance_id);
  });
}
function register_instance(inst, group_name = "") {
  _register(inst, group_name);
}
function play_sound(asset, loop = asset.loop, gain = 1, pitch = 1) {
  if (!asset.buffer) throw new Error(`sound_asset ${asset.id}: not yet loaded`);
  const ctx = audio_system.ctx;
  const group = get_or_create_group(asset.group_name);
  const source = ctx.createBufferSource();
  source.buffer = asset.buffer;
  source.loop = loop;
  source.playbackRate.value = Math.max(0.01, pitch);
  const gain_node = ctx.createGain();
  gain_node.gain.value = Math.max(0, gain);
  source.connect(gain_node);
  gain_node.connect(group.gain_node);
  source.start();
  const inst = new sound_instance(source, gain_node);
  _register(inst, asset.group_name);
  return inst;
}
function audio_play_sound(asset, loop = false, priority = 0) {
  return play_sound(asset, loop);
}
function audio_stop_sound(inst) {
  inst.stop();
}
function audio_stop_all() {
  for (const inst of _instances.values()) inst.stop();
  _instances.clear();
  _instance_groups.clear();
}
function audio_is_playing(inst) {
  return inst.is_playing;
}
function audio_sound_gain(inst, gain) {
  inst.set_gain(gain);
}
function audio_sound_pitch(inst, pitch) {
  inst.set_pitch(pitch);
}
function audio_set_master_gain(gain) {
  audio_system.set_master_gain(gain);
}
function audio_get_master_gain() {
  return audio_system.get_master_gain();
}

// packages/engine/src/audio/audio_3d.ts
var _listener_x = 0;
var _listener_y = 0;
var spatial_sound_instance = class {
  // Web Audio spatial node
  constructor(panner, inst) {
    this.instance = inst;
    this._panner = panner;
  }
  /**
   * Updates the world-space position of this sound source.
   * @param x - World X position
   * @param y - World Y position
   */
  set_position(x, y) {
    this._panner.positionX.value = x;
    this._panner.positionY.value = y;
    this._panner.positionZ.value = 0;
  }
  /** Stops playback. */
  stop() {
    this.instance.stop();
  }
  /** Returns true if currently playing. */
  get is_playing() {
    return this.instance.is_playing;
  }
};
function audio_set_listener_position(x, y) {
  _listener_x = x;
  _listener_y = y;
  const listener = audio_system.ctx.listener;
  if (listener.positionX) {
    listener.positionX.value = x;
    listener.positionY.value = y;
    listener.positionZ.value = 0;
  } else {
    listener.setPosition(x, y, 0);
  }
}
function audio_play_sound_at(asset, x, y, ref_distance = 100, max_distance = 1e3, loop = false) {
  if (!asset.buffer) throw new Error(`sound_asset ${asset.id}: not yet loaded`);
  const ctx = audio_system.ctx;
  const group = get_or_create_group(asset.group_name);
  const source = ctx.createBufferSource();
  source.buffer = asset.buffer;
  source.loop = loop;
  const panner = ctx.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "inverse";
  panner.refDistance = ref_distance;
  panner.maxDistance = max_distance;
  panner.rolloffFactor = 1;
  panner.positionX.value = x;
  panner.positionY.value = y;
  panner.positionZ.value = 0;
  const gain_node = ctx.createGain();
  gain_node.gain.value = 1;
  source.connect(panner);
  panner.connect(gain_node);
  gain_node.connect(group.gain_node);
  source.start();
  const inst = new sound_instance(source, gain_node);
  register_instance(inst, asset.group_name);
  const spatial_inst = new spatial_sound_instance(panner, inst);
  return spatial_inst;
}
function audio_set_sound_position(inst, x, y) {
  inst.set_position(x, y);
}
function audio_get_listener_x() {
  return _listener_x;
}
function audio_get_listener_y() {
  return _listener_y;
}

// packages/engine/src/physics/physics_world.ts
import Matter from "matter-js";
var _engine = null;
var _world = null;
var _px_per_m = 64;
var _on_collision_start = null;
var _on_collision_end = null;
function physics_world_create(gx = 0, gy = 0.1, px_per_metre = 64) {
  if (_engine) {
    Matter.Events.off(_engine);
    Matter.Engine.clear(_engine);
  }
  _px_per_m = px_per_metre;
  _engine = Matter.Engine.create();
  _world = _engine.world;
  _engine.gravity.x = gx;
  _engine.gravity.y = gy;
  Matter.Events.on(_engine, "collisionStart", (event) => {
    if (!_on_collision_start) return;
    for (const pair of event.pairs) {
      _on_collision_start(pair.bodyA, pair.bodyB);
    }
  });
  Matter.Events.on(_engine, "collisionEnd", (event) => {
    if (!_on_collision_end) return;
    for (const pair of event.pairs) {
      _on_collision_end(pair.bodyA, pair.bodyB);
    }
  });
}
function physics_world_step(delta_ms = 1e3 / 60) {
  if (!_engine) return;
  Matter.Engine.update(_engine, delta_ms);
}
function physics_world_gravity(gx, gy) {
  if (!_engine) return;
  _engine.gravity.x = gx;
  _engine.gravity.y = gy;
}
function physics_world_destroy() {
  if (!_engine) return;
  Matter.Events.off(_engine);
  Matter.Engine.clear(_engine);
  _engine = null;
  _world = null;
}
function physics_world_on_collision_start(cb) {
  _on_collision_start = cb;
}
function physics_world_on_collision_end(cb) {
  _on_collision_end = cb;
}
function physics_world_get_engine() {
  return _engine;
}
function physics_get_scale() {
  return _px_per_m;
}
function _get_world() {
  return _world;
}

// packages/engine/src/physics/physics_body.ts
import Matter2 from "matter-js";
var FIXTURE_SHAPE_RECT = 0;
var FIXTURE_SHAPE_CIRCLE = 1;
var FIXTURE_SHAPE_POLYGON = 2;
var _fixtures = /* @__PURE__ */ new Map();
var _next_fixture_id = 1;
function _make_default_fixture() {
  return {
    shape: FIXTURE_SHAPE_RECT,
    w: 16,
    h: 16,
    verts: [],
    density: 1e-3,
    restitution: 0,
    friction: 0.1,
    is_sensor: false
  };
}
var _bodies = /* @__PURE__ */ new Map();
var _next_body_id = 1;
function physics_fixture_create() {
  const id = _next_fixture_id++;
  _fixtures.set(id, _make_default_fixture());
  return id;
}
function physics_fixture_set_box(fixture_id, w, h) {
  const f = _fixtures.get(fixture_id);
  if (!f) return;
  f.shape = FIXTURE_SHAPE_RECT;
  f.w = w;
  f.h = h;
}
function physics_fixture_set_circle(fixture_id, radius) {
  const f = _fixtures.get(fixture_id);
  if (!f) return;
  f.shape = FIXTURE_SHAPE_CIRCLE;
  f.w = radius;
}
function physics_fixture_set_polygon(fixture_id, verts) {
  const f = _fixtures.get(fixture_id);
  if (!f) return;
  f.shape = FIXTURE_SHAPE_POLYGON;
  f.verts = verts.map((v) => ({ x: v.x, y: v.y }));
}
function physics_fixture_set_density(fixture_id, density) {
  const f = _fixtures.get(fixture_id);
  if (f) f.density = density;
}
function physics_fixture_set_restitution(fixture_id, restitution) {
  const f = _fixtures.get(fixture_id);
  if (f) f.restitution = Math.max(0, Math.min(1, restitution));
}
function physics_fixture_set_friction(fixture_id, friction) {
  const f = _fixtures.get(fixture_id);
  if (f) f.friction = Math.max(0, friction);
}
function physics_fixture_set_sensor(fixture_id, is_sensor) {
  const f = _fixtures.get(fixture_id);
  if (f) f.is_sensor = is_sensor;
}
function physics_fixture_bind(fixture_id, x, y, is_static = false) {
  const world = _get_world();
  if (!world) return -1;
  const f = _fixtures.get(fixture_id);
  if (!f) return -1;
  let body;
  switch (f.shape) {
    case FIXTURE_SHAPE_CIRCLE:
      body = Matter2.Bodies.circle(x, y, f.w, {
        density: f.density,
        restitution: f.restitution,
        friction: f.friction,
        isStatic: is_static,
        isSensor: f.is_sensor
      });
      break;
    case FIXTURE_SHAPE_POLYGON:
      body = Matter2.Bodies.fromVertices(x, y, f.verts, {
        density: f.density,
        restitution: f.restitution,
        friction: f.friction,
        isStatic: is_static,
        isSensor: f.is_sensor
      });
      break;
    default:
      body = Matter2.Bodies.rectangle(x, y, f.w, f.h, {
        density: f.density,
        restitution: f.restitution,
        friction: f.friction,
        isStatic: is_static,
        isSensor: f.is_sensor
      });
  }
  Matter2.World.add(world, body);
  const id = _next_body_id++;
  _bodies.set(id, body);
  body._sw_id = id;
  return id;
}
function physics_fixture_delete(fixture_id) {
  _fixtures.delete(fixture_id);
}
function physics_body_destroy(body_id) {
  const world = _get_world();
  const body = _bodies.get(body_id);
  if (!body) return;
  if (world) Matter2.World.remove(world, body);
  _bodies.delete(body_id);
}
function physics_body_apply_force(body_id, fx, fy) {
  const body = _bodies.get(body_id);
  if (!body) return;
  Matter2.Body.applyForce(body, body.position, { x: fx, y: fy });
}
function physics_body_apply_impulse(body_id, ix, iy) {
  const body = _bodies.get(body_id);
  if (!body) return;
  const inv_mass = body.mass > 0 ? 1 / body.mass : 0;
  Matter2.Body.setVelocity(body, {
    x: body.velocity.x + ix * inv_mass,
    y: body.velocity.y + iy * inv_mass
  });
}
function physics_body_set_velocity(body_id, vx, vy) {
  const body = _bodies.get(body_id);
  if (!body) return;
  Matter2.Body.setVelocity(body, { x: vx, y: vy });
}
function physics_body_set_position(body_id, x, y) {
  const body = _bodies.get(body_id);
  if (!body) return;
  Matter2.Body.setPosition(body, { x, y });
}
function physics_body_set_angular_velocity(body_id, omega) {
  const body = _bodies.get(body_id);
  if (!body) return;
  Matter2.Body.setAngularVelocity(body, omega);
}
function physics_body_get_x(body_id) {
  return _bodies.get(body_id)?.position.x ?? 0;
}
function physics_body_get_y(body_id) {
  return _bodies.get(body_id)?.position.y ?? 0;
}
function physics_body_get_angle(body_id) {
  const body = _bodies.get(body_id);
  if (!body) return 0;
  return body.angle * 180 / Math.PI;
}
function physics_body_get_vx(body_id) {
  return _bodies.get(body_id)?.velocity.x ?? 0;
}
function physics_body_get_vy(body_id) {
  return _bodies.get(body_id)?.velocity.y ?? 0;
}
function physics_body_get_angular_velocity(body_id) {
  return _bodies.get(body_id)?.angularVelocity ?? 0;
}
function physics_body_set_static(body_id, is_static) {
  const body = _bodies.get(body_id);
  if (!body) return;
  Matter2.Body.setStatic(body, is_static);
}
function physics_body_exists(body_id) {
  return _bodies.has(body_id);
}
function physics_body_get_raw(body_id) {
  return _bodies.get(body_id);
}

// packages/engine/src/physics/physics_joint.ts
import Matter3 from "matter-js";
var _joints = /* @__PURE__ */ new Map();
var _next_joint_id = 1;
function _add_constraint(c) {
  const world = _get_world();
  if (!world) return -1;
  Matter3.World.add(world, c);
  const id = _next_joint_id++;
  _joints.set(id, c);
  return id;
}
function physics_joint_distance_create(body_a_id, body_b_id, ax, ay, bx, by, stiffness = 1, damping = 0) {
  const ba = physics_body_get_raw(body_a_id);
  const bb = physics_body_get_raw(body_b_id);
  if (!ba || !bb) return -1;
  const c = Matter3.Constraint.create({
    bodyA: ba,
    bodyB: bb,
    pointA: { x: ax, y: ay },
    pointB: { x: bx, y: by },
    stiffness,
    damping
  });
  return _add_constraint(c);
}
function physics_joint_revolute_create(body_a_id, body_b_id, pivot_x, pivot_y) {
  const ba = physics_body_get_raw(body_a_id);
  const bb = physics_body_get_raw(body_b_id);
  if (!ba || !bb) return -1;
  const local_a = {
    x: pivot_x - ba.position.x,
    y: pivot_y - ba.position.y
  };
  const local_b = {
    x: pivot_x - bb.position.x,
    y: pivot_y - bb.position.y
  };
  const c = Matter3.Constraint.create({
    bodyA: ba,
    bodyB: bb,
    pointA: local_a,
    pointB: local_b,
    length: 0,
    stiffness: 1,
    damping: 0
  });
  return _add_constraint(c);
}
function physics_joint_weld_create(body_a_id, body_b_id) {
  const ba = physics_body_get_raw(body_a_id);
  const bb = physics_body_get_raw(body_b_id);
  if (!ba || !bb) return -1;
  const c = Matter3.Constraint.create({
    bodyA: ba,
    bodyB: bb,
    stiffness: 1,
    damping: 0
  });
  return _add_constraint(c);
}
function physics_joint_spring_create(body_a_id, body_b_id, ax, ay, bx, by, rest_length, stiffness = 0.1, damping = 0.01) {
  const ba = physics_body_get_raw(body_a_id);
  const bb = physics_body_get_raw(body_b_id);
  if (!ba || !bb) return -1;
  const c = Matter3.Constraint.create({
    bodyA: ba,
    bodyB: bb,
    pointA: { x: ax, y: ay },
    pointB: { x: bx, y: by },
    length: rest_length,
    stiffness,
    damping
  });
  return _add_constraint(c);
}
function physics_joint_destroy(joint_id) {
  const world = _get_world();
  const c = _joints.get(joint_id);
  if (!c) return;
  if (world) Matter3.World.remove(world, c);
  _joints.delete(joint_id);
}
function physics_joint_exists(joint_id) {
  return _joints.has(joint_id);
}
function physics_joint_get_raw(joint_id) {
  return _joints.get(joint_id);
}

// packages/engine/src/networking/buffer.ts
var buffer_u8 = 0;
var buffer_s8 = 1;
var buffer_u16 = 2;
var buffer_s16 = 3;
var buffer_u32 = 4;
var buffer_s32 = 5;
var buffer_f32 = 6;
var buffer_f64 = 7;
var buffer_bool = 8;
var buffer_string = 9;
var buffer_u64 = 10;
var buffer_fixed = 0;
var buffer_grow = 1;
var buffer_wrap = 2;
var buffer_fast = 3;
var buffer_seek_start = 0;
var buffer_seek_relative = 1;
var buffer_seek_end = 2;
var TYPE_SIZES = {
  [buffer_u8]: 1,
  [buffer_s8]: 1,
  [buffer_u16]: 2,
  [buffer_s16]: 2,
  [buffer_u32]: 4,
  [buffer_s32]: 4,
  [buffer_f32]: 4,
  [buffer_f64]: 8,
  [buffer_bool]: 1,
  [buffer_string]: 0,
  // variable length
  [buffer_u64]: 8
};
var _buffers = /* @__PURE__ */ new Map();
var _next_buf_id = 1;
function _make_buf(capacity, mode, alignment) {
  const data = new Uint8Array(capacity);
  return { data, pos: 0, size: 0, mode, alignment, view: new DataView(data.buffer) };
}
function _ensure(buf, needed) {
  const required = buf.pos + needed;
  if (required <= buf.data.length) return true;
  if (buf.mode === buffer_fixed) return false;
  if (buf.mode === buffer_wrap) return true;
  let new_cap = buf.data.length || 8;
  while (new_cap < required) new_cap *= 2;
  const new_data = new Uint8Array(new_cap);
  new_data.set(buf.data);
  buf.data = new_data;
  buf.view = new DataView(new_data.buffer);
  return true;
}
function _advance(buf, bytes) {
  if (buf.mode === buffer_wrap && buf.data.length > 0) {
    buf.pos = (buf.pos + bytes) % buf.data.length;
  } else {
    buf.pos += bytes;
  }
  if (buf.pos > buf.size) buf.size = buf.pos;
}
function buffer_create(size, mode = buffer_grow, alignment = 1) {
  const id = _next_buf_id++;
  _buffers.set(id, _make_buf(Math.max(size, 0), mode, alignment));
  return id;
}
function buffer_delete(buffer_id) {
  _buffers.delete(buffer_id);
}
function buffer_exists(buffer_id) {
  return _buffers.has(buffer_id);
}
function buffer_get_size(buffer_id) {
  return _buffers.get(buffer_id)?.data.length ?? 0;
}
function buffer_tell(buffer_id) {
  return _buffers.get(buffer_id)?.pos ?? 0;
}
function buffer_seek(buffer_id, base, offset) {
  const buf = _buffers.get(buffer_id);
  if (!buf) return;
  let new_pos;
  switch (base) {
    case buffer_seek_start:
      new_pos = offset;
      break;
    case buffer_seek_relative:
      new_pos = buf.pos + offset;
      break;
    case buffer_seek_end:
      new_pos = buf.size + offset;
      break;
    default:
      new_pos = offset;
  }
  buf.pos = Math.max(0, new_pos);
}
function buffer_write(buffer_id, type, value) {
  const buf = _buffers.get(buffer_id);
  if (!buf) return;
  if (type === buffer_string) {
    const str = String(value);
    const bytes = new TextEncoder().encode(str);
    if (!_ensure(buf, bytes.length + 1)) return;
    buf.data.set(bytes, buf.pos);
    buf.data[buf.pos + bytes.length] = 0;
    _advance(buf, bytes.length + 1);
    return;
  }
  const sz = TYPE_SIZES[type] ?? 1;
  if (!_ensure(buf, sz)) return;
  const p = buf.pos;
  switch (type) {
    case buffer_u8:
      buf.view.setUint8(p, Number(value));
      break;
    case buffer_s8:
      buf.view.setInt8(p, Number(value));
      break;
    case buffer_u16:
      buf.view.setUint16(p, Number(value), true);
      break;
    case buffer_s16:
      buf.view.setInt16(p, Number(value), true);
      break;
    case buffer_u32:
      buf.view.setUint32(p, Number(value), true);
      break;
    case buffer_s32:
      buf.view.setInt32(p, Number(value), true);
      break;
    case buffer_f32:
      buf.view.setFloat32(p, Number(value), true);
      break;
    case buffer_f64:
      buf.view.setFloat64(p, Number(value), true);
      break;
    case buffer_bool:
      buf.view.setUint8(p, value ? 1 : 0);
      break;
    case buffer_u64:
      buf.view.setBigUint64(p, BigInt(value), true);
      break;
  }
  _advance(buf, sz);
}
function buffer_read(buffer_id, type) {
  const buf = _buffers.get(buffer_id);
  if (!buf) return 0;
  if (type === buffer_string) {
    let end = buf.pos;
    while (end < buf.data.length && buf.data[end] !== 0) end++;
    const str = new TextDecoder().decode(buf.data.slice(buf.pos, end));
    _advance(buf, end - buf.pos + 1);
    return str;
  }
  const sz = TYPE_SIZES[type] ?? 1;
  if (buf.pos + sz > buf.data.length) return 0;
  const p = buf.pos;
  let result = 0;
  switch (type) {
    case buffer_u8:
      result = buf.view.getUint8(p);
      break;
    case buffer_s8:
      result = buf.view.getInt8(p);
      break;
    case buffer_u16:
      result = buf.view.getUint16(p, true);
      break;
    case buffer_s16:
      result = buf.view.getInt16(p, true);
      break;
    case buffer_u32:
      result = buf.view.getUint32(p, true);
      break;
    case buffer_s32:
      result = buf.view.getInt32(p, true);
      break;
    case buffer_f32:
      result = buf.view.getFloat32(p, true);
      break;
    case buffer_f64:
      result = buf.view.getFloat64(p, true);
      break;
    case buffer_bool:
      result = buf.view.getUint8(p) !== 0;
      break;
    case buffer_u64:
      result = buf.view.getBigUint64(p, true);
      break;
  }
  _advance(buf, sz);
  return result;
}
function buffer_fill(buffer_id, offset, size, value) {
  const buf = _buffers.get(buffer_id);
  if (!buf) return;
  const end = Math.min(offset + size, buf.data.length);
  buf.data.fill(value & 255, offset, end);
}
function buffer_copy(src_id, src_offset, dst_id, dst_offset, size) {
  const src = _buffers.get(src_id);
  const dst = _buffers.get(dst_id);
  if (!src || !dst) return;
  const src_end = Math.min(src_offset + size, src.data.length);
  const chunk = src.data.slice(src_offset, src_end);
  const old_pos = dst.pos;
  dst.pos = dst_offset;
  if (!_ensure(dst, chunk.length)) {
    dst.pos = old_pos;
    return;
  }
  dst.data.set(chunk, dst_offset);
  dst.pos = old_pos;
  if (dst_offset + chunk.length > dst.size) dst.size = dst_offset + chunk.length;
}
function buffer_get_bytes(buffer_id) {
  const buf = _buffers.get(buffer_id);
  if (!buf) return new Uint8Array(0);
  return buf.data.slice(0, buf.size);
}
function buffer_from_bytes(bytes) {
  const id = _next_buf_id++;
  const data = new Uint8Array(bytes.length);
  data.set(bytes);
  _buffers.set(id, {
    data,
    pos: 0,
    size: bytes.length,
    mode: buffer_grow,
    alignment: 1,
    view: new DataView(data.buffer)
  });
  return id;
}
function buffer_base64_encode(buffer_id, offset = 0, size = -1) {
  const buf = _buffers.get(buffer_id);
  if (!buf) return "";
  const end = size < 0 ? buf.size : Math.min(offset + size, buf.size);
  const chunk = buf.data.slice(offset, end);
  let binary = "";
  for (let i = 0; i < chunk.length; i++) binary += String.fromCharCode(chunk[i]);
  return btoa(binary);
}
function buffer_base64_decode(base64) {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return buffer_from_bytes(bytes);
  } catch {
    return buffer_create(0, buffer_grow, 1);
  }
}

// packages/engine/src/networking/websocket_client.ts
var network_type_connect = 0;
var network_type_disconnect = 1;
var network_type_data = 2;
var network_type_non_blocking_connect = 3;
var _sockets = /* @__PURE__ */ new Map();
var _next_socket_id = 1;
function network_create_socket(url, protocols) {
  let ws;
  try {
    ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
  } catch {
    return -1;
  }
  ws.binaryType = "arraybuffer";
  const id = _next_socket_id++;
  const sock = { ws, on_open: null, on_message: null, on_close: null, on_error: null };
  _sockets.set(id, sock);
  ws.addEventListener("open", () => {
    sock.on_open?.();
  });
  ws.addEventListener("message", (ev) => {
    if (!sock.on_message) return;
    if (ev.data instanceof ArrayBuffer) {
      const buf_id = buffer_from_bytes(new Uint8Array(ev.data));
      sock.on_message(buf_id);
    } else if (typeof ev.data === "string") {
      const bytes = new TextEncoder().encode(ev.data);
      const buf_id = buffer_from_bytes(bytes);
      sock.on_message(buf_id);
    }
  });
  ws.addEventListener("close", (ev) => {
    sock.on_close?.(ev.code, ev.reason);
    _sockets.delete(id);
  });
  ws.addEventListener("error", () => {
    sock.on_error?.();
  });
  return id;
}
function network_send_raw(socket_id, bytes) {
  const sock = _sockets.get(socket_id);
  if (!sock || sock.ws.readyState !== WebSocket.OPEN) return;
  sock.ws.send(bytes);
}
function network_send_text(socket_id, text) {
  const sock = _sockets.get(socket_id);
  if (!sock || sock.ws.readyState !== WebSocket.OPEN) return;
  sock.ws.send(text);
}
function network_destroy(socket_id, code = 1e3, reason = "") {
  const sock = _sockets.get(socket_id);
  if (!sock) return;
  sock.ws.close(code, reason);
  _sockets.delete(socket_id);
}
function network_get_ready_state(socket_id) {
  return _sockets.get(socket_id)?.ws.readyState ?? -1;
}
function network_set_on_open(socket_id, cb) {
  const sock = _sockets.get(socket_id);
  if (sock) sock.on_open = cb;
}
function network_set_on_message(socket_id, cb) {
  const sock = _sockets.get(socket_id);
  if (sock) sock.on_message = cb;
}
function network_set_on_close(socket_id, cb) {
  const sock = _sockets.get(socket_id);
  if (sock) sock.on_close = cb;
}
function network_set_on_error(socket_id, cb) {
  const sock = _sockets.get(socket_id);
  if (sock) sock.on_error = cb;
}
function network_socket_exists(socket_id) {
  return _sockets.has(socket_id);
}

// packages/engine/src/networking/webrtc_client.ts
var _peers = /* @__PURE__ */ new Map();
var _next_peer_id = 1;
function webrtc_create_peer(ice_servers = [{ urls: "stun:stun.l.google.com:19302" }]) {
  const pc = new RTCPeerConnection({ iceServers: ice_servers });
  const id = _next_peer_id++;
  const peer = {
    pc,
    channels: /* @__PURE__ */ new Map(),
    next_channel_id: 1,
    on_channel: null,
    on_ice_candidate: null
  };
  _peers.set(id, peer);
  pc.addEventListener("icecandidate", (ev) => {
    if (ev.candidate) peer.on_ice_candidate?.(ev.candidate);
  });
  pc.addEventListener("datachannel", (ev) => {
    const channel_id = peer.next_channel_id++;
    const ch_state = {
      channel: ev.channel,
      on_message: null,
      on_open: null,
      on_close: null
    };
    peer.channels.set(channel_id, ch_state);
    _wire_channel(ch_state);
    peer.on_channel?.(channel_id, ev.channel.label);
  });
  return id;
}
function _wire_channel(ch) {
  ch.channel.binaryType = "arraybuffer";
  ch.channel.addEventListener("open", () => ch.on_open?.());
  ch.channel.addEventListener("close", () => ch.on_close?.());
  ch.channel.addEventListener("message", (ev) => {
    if (!ch.on_message) return;
    const data = ev.data;
    let bytes;
    if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data);
    } else if (typeof data === "string") {
      bytes = new TextEncoder().encode(data);
    } else {
      return;
    }
    ch.on_message(buffer_from_bytes(bytes));
  });
}
function webrtc_create_channel(peer_id, label = "data", ordered = false, max_retransmits = 0) {
  const peer = _peers.get(peer_id);
  if (!peer) return -1;
  const channel = peer.pc.createDataChannel(label, {
    ordered,
    maxRetransmits: ordered ? void 0 : max_retransmits
  });
  const channel_id = peer.next_channel_id++;
  const ch_state = {
    channel,
    on_message: null,
    on_open: null,
    on_close: null
  };
  peer.channels.set(channel_id, ch_state);
  _wire_channel(ch_state);
  return channel_id;
}
async function webrtc_create_offer(peer_id) {
  const peer = _peers.get(peer_id);
  if (!peer) return null;
  try {
    const offer = await peer.pc.createOffer();
    await peer.pc.setLocalDescription(offer);
    return offer.sdp ?? null;
  } catch {
    return null;
  }
}
async function webrtc_create_answer(peer_id, offer_sdp) {
  const peer = _peers.get(peer_id);
  if (!peer) return null;
  try {
    await peer.pc.setRemoteDescription({ type: "offer", sdp: offer_sdp });
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    return answer.sdp ?? null;
  } catch {
    return null;
  }
}
async function webrtc_set_remote_answer(peer_id, answer_sdp) {
  const peer = _peers.get(peer_id);
  if (!peer) return;
  try {
    await peer.pc.setRemoteDescription({ type: "answer", sdp: answer_sdp });
  } catch {
  }
}
async function webrtc_add_ice_candidate(peer_id, candidate) {
  const peer = _peers.get(peer_id);
  if (!peer) return;
  try {
    await peer.pc.addIceCandidate(candidate);
  } catch {
  }
}
function webrtc_send(peer_id, channel_id, bytes) {
  const peer = _peers.get(peer_id);
  if (!peer) return;
  const ch = peer.channels.get(channel_id);
  if (!ch || ch.channel.readyState !== "open") return;
  ch.channel.send(bytes);
}
function webrtc_send_text(peer_id, channel_id, text) {
  const peer = _peers.get(peer_id);
  if (!peer) return;
  const ch = peer.channels.get(channel_id);
  if (!ch || ch.channel.readyState !== "open") return;
  ch.channel.send(text);
}
function webrtc_destroy_peer(peer_id) {
  const peer = _peers.get(peer_id);
  if (!peer) return;
  peer.pc.close();
  _peers.delete(peer_id);
}
function webrtc_set_on_channel(peer_id, cb) {
  const peer = _peers.get(peer_id);
  if (peer) peer.on_channel = cb;
}
function webrtc_set_on_ice_candidate(peer_id, cb) {
  const peer = _peers.get(peer_id);
  if (peer) peer.on_ice_candidate = cb;
}
function webrtc_set_on_message(peer_id, channel_id, cb) {
  const ch = _peers.get(peer_id)?.channels.get(channel_id);
  if (ch) ch.on_message = cb;
}
function webrtc_set_on_open(peer_id, channel_id, cb) {
  const ch = _peers.get(peer_id)?.channels.get(channel_id);
  if (ch) ch.on_open = cb;
}
function webrtc_set_on_close(peer_id, channel_id, cb) {
  const ch = _peers.get(peer_id)?.channels.get(channel_id);
  if (ch) ch.on_close = cb;
}
function webrtc_peer_exists(peer_id) {
  return _peers.has(peer_id);
}
function webrtc_get_state(peer_id) {
  return _peers.get(peer_id)?.pc.connectionState ?? "closed";
}

// packages/engine/src/networking/http_client.ts
function _extract_headers(resp) {
  const out = {};
  resp.headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}
async function http_get(url, headers) {
  try {
    const resp = await fetch(url, { method: "GET", headers });
    const text = await resp.text();
    return { status: resp.status, ok: resp.ok, text, headers: _extract_headers(resp) };
  } catch (e) {
    return { status: 0, ok: false, text: String(e), headers: {} };
  }
}
async function http_post(url, body, content_type = "application/x-www-form-urlencoded", headers) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": content_type, ...headers },
      body
    });
    const text = await resp.text();
    return { status: resp.status, ok: resp.ok, text, headers: _extract_headers(resp) };
  } catch (e) {
    return { status: 0, ok: false, text: String(e), headers: {} };
  }
}
async function http_post_json(url, data, headers) {
  return http_post(url, JSON.stringify(data), "application/json", headers);
}
async function http_get_bytes(url, headers) {
  try {
    const resp = await fetch(url, { method: "GET", headers });
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    return { status: resp.status, ok: resp.ok, bytes, headers: _extract_headers(resp) };
  } catch (e) {
    return { status: 0, ok: false, bytes: new Uint8Array(0), headers: {} };
  }
}
async function http_request(url, method, headers = {}, body = null) {
  try {
    const resp = await fetch(url, { method, headers, body: body ?? void 0 });
    const text = await resp.text();
    return { status: resp.status, ok: resp.ok, text, headers: _extract_headers(resp) };
  } catch (e) {
    return { status: 0, ok: false, text: String(e), headers: {} };
  }
}

// packages/engine/src/particles/particle_type.ts
var pt_shape_pixel = 0;
var pt_shape_disk = 1;
var pt_shape_square = 2;
var pt_shape_line = 3;
var pt_shape_star = 4;
var pt_shape_circle = 5;
var pt_shape_ring = 6;
var pt_shape_sphere = 7;
var pt_shape_flare = 8;
var pt_shape_spark = 9;
var pt_shape_explosion = 10;
var pt_shape_cloud = 11;
var pt_shape_smoke = 12;
var pt_shape_snow = 13;
var _types = /* @__PURE__ */ new Map();
var _next_type_id = 1;
function _make_default() {
  return {
    shape: pt_shape_pixel,
    size1: 1,
    size2: 1,
    size_incr: 0,
    size_wiggle: 0,
    speed1: 0,
    speed2: 0,
    speed_incr: 0,
    speed_wiggle: 0,
    dir1: 0,
    dir2: 360,
    dir_incr: 0,
    dir_wiggle: 0,
    grav_amount: 0,
    grav_dir: 270,
    ang1: 0,
    ang2: 0,
    ang_incr: 0,
    ang_wiggle: 0,
    ang_relative: false,
    life1: 30,
    life2: 30,
    color1: 16777215,
    color2: 16777215,
    color3: 16777215,
    alpha1: 1,
    alpha2: 1,
    alpha3: 0,
    additive: false,
    death_type_id: -1,
    death_number: 0,
    step_type_id: -1,
    step_number: 0
  };
}
function part_type_create() {
  const id = _next_type_id++;
  _types.set(id, _make_default());
  return id;
}
function part_type_destroy(type_id) {
  _types.delete(type_id);
}
function part_type_exists(type_id) {
  return _types.has(type_id);
}
function part_type_shape(type_id, shape) {
  const t = _types.get(type_id);
  if (t) t.shape = shape;
}
function part_type_size(type_id, size_min, size_max, size_incr, size_wiggle) {
  const t = _types.get(type_id);
  if (!t) return;
  t.size1 = size_min;
  t.size2 = size_max;
  t.size_incr = size_incr;
  t.size_wiggle = size_wiggle;
}
function part_type_speed(type_id, speed_min, speed_max, speed_incr, speed_wiggle) {
  const t = _types.get(type_id);
  if (!t) return;
  t.speed1 = speed_min;
  t.speed2 = speed_max;
  t.speed_incr = speed_incr;
  t.speed_wiggle = speed_wiggle;
}
function part_type_direction(type_id, dir_min, dir_max, dir_incr, dir_wiggle) {
  const t = _types.get(type_id);
  if (!t) return;
  t.dir1 = dir_min;
  t.dir2 = dir_max;
  t.dir_incr = dir_incr;
  t.dir_wiggle = dir_wiggle;
}
function part_type_gravity(type_id, amount, direction) {
  const t = _types.get(type_id);
  if (!t) return;
  t.grav_amount = amount;
  t.grav_dir = direction;
}
function part_type_orientation(type_id, ang_min, ang_max, ang_incr, ang_wiggle, ang_relative) {
  const t = _types.get(type_id);
  if (!t) return;
  t.ang1 = ang_min;
  t.ang2 = ang_max;
  t.ang_incr = ang_incr;
  t.ang_wiggle = ang_wiggle;
  t.ang_relative = ang_relative;
}
function part_type_life(type_id, life_min, life_max) {
  const t = _types.get(type_id);
  if (!t) return;
  t.life1 = life_min;
  t.life2 = life_max;
}
function part_type_color3(type_id, c1, c2, c3) {
  const t = _types.get(type_id);
  if (!t) return;
  t.color1 = c1;
  t.color2 = c2;
  t.color3 = c3;
}
function part_type_color2(type_id, c1, c2) {
  const t = _types.get(type_id);
  if (!t) return;
  t.color1 = c1;
  t.color2 = c2;
  t.color3 = c2;
}
function part_type_color1(type_id, c) {
  const t = _types.get(type_id);
  if (!t) return;
  t.color1 = c;
  t.color2 = c;
  t.color3 = c;
}
function part_type_alpha3(type_id, a1, a2, a3) {
  const t = _types.get(type_id);
  if (!t) return;
  t.alpha1 = a1;
  t.alpha2 = a2;
  t.alpha3 = a3;
}
function part_type_alpha2(type_id, a1, a2) {
  const t = _types.get(type_id);
  if (!t) return;
  t.alpha1 = a1;
  t.alpha2 = a2;
  t.alpha3 = a2;
}
function part_type_alpha1(type_id, a) {
  const t = _types.get(type_id);
  if (!t) return;
  t.alpha1 = a;
  t.alpha2 = a;
  t.alpha3 = a;
}
function part_type_blend(type_id, additive) {
  const t = _types.get(type_id);
  if (t) t.additive = additive;
}
function part_type_step(type_id, sub_type_id, number) {
  const t = _types.get(type_id);
  if (!t) return;
  t.step_type_id = sub_type_id;
  t.step_number = number;
}
function part_type_death(type_id, sub_type_id, number) {
  const t = _types.get(type_id);
  if (!t) return;
  t.death_type_id = sub_type_id;
  t.death_number = number;
}
function part_type_get_def(type_id) {
  return _types.get(type_id);
}

// packages/engine/src/particles/particle_system.ts
var _systems = /* @__PURE__ */ new Map();
var _next_system_id = 1;
function _bgr_to_rgb(bgr) {
  const b = (bgr >> 16 & 255) / 255;
  const g = (bgr >> 8 & 255) / 255;
  const r = (bgr & 255) / 255;
  return [r, g, b];
}
function _lerp_color(c1, c2, t) {
  const [r1, g1, b1] = _bgr_to_rgb(c1);
  const [r2, g2, b2] = _bgr_to_rgb(c2);
  return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t];
}
function _lerp3_color(c1, c2, c3, t) {
  if (t < 0.5) return _lerp_color(c1, c2, t * 2);
  return _lerp_color(c2, c3, (t - 0.5) * 2);
}
function _lerp3(a, b, c, t) {
  if (t < 0.5) return a + (b - a) * (t * 2);
  return b + (c - b) * ((t - 0.5) * 2);
}
function _rand_range(lo, hi) {
  return lo + Math.random() * (hi - lo);
}
function _spawn_particle(sys, type_id, x, y) {
  const def = part_type_get_def(type_id);
  if (!def) return;
  const life = Math.round(_rand_range(def.life1, def.life2));
  const spd = _rand_range(def.speed1, def.speed2);
  const dir = _rand_range(def.dir1, def.dir2);
  const size = _rand_range(def.size1, def.size2);
  const ang = _rand_range(def.ang1, def.ang2);
  const [r, g, b] = _bgr_to_rgb(def.color1);
  sys.particles.push({
    type_id,
    x,
    y,
    spd,
    dir,
    ang,
    spd_incr: def.speed_incr,
    dir_incr: def.dir_incr,
    ang_incr: def.ang_incr,
    size,
    size_incr: def.size_incr,
    life,
    life_max: life,
    r,
    g,
    b,
    alpha: def.alpha1,
    additive: def.additive
  });
}
function _get_system_raw(system_id) {
  return _systems.get(system_id);
}
function part_system_create() {
  const id = _next_system_id++;
  _systems.set(id, { particles: [], depth: 0, persistent: false, auto_update: true, auto_draw: true });
  return id;
}
function part_system_destroy(system_id) {
  _systems.delete(system_id);
}
function part_system_exists(system_id) {
  return _systems.has(system_id);
}
function part_system_depth(system_id, depth) {
  const s = _systems.get(system_id);
  if (s) s.depth = depth;
}
function part_system_clear(system_id) {
  const s = _systems.get(system_id);
  if (s) s.particles = [];
}
function part_system_count(system_id) {
  return _systems.get(system_id)?.particles.length ?? 0;
}
function part_system_update(system_id) {
  const sys = _systems.get(system_id);
  if (!sys) return;
  const to_spawn = [];
  const alive = [];
  for (const p of sys.particles) {
    const rad = p.dir * (Math.PI / 180);
    p.x += Math.cos(rad) * p.spd;
    p.y -= Math.sin(rad) * p.spd;
    const def = part_type_get_def(p.type_id);
    if (def && def.grav_amount !== 0) {
      const grad = def.grav_dir * (Math.PI / 180);
      p.spd += Math.cos(grad - rad) * def.grav_amount;
      p.dir += Math.asin(
        Math.max(-1, Math.min(1, Math.sin(grad - rad))) * def.grav_amount / Math.max(p.spd, 1e-3)
      ) * (180 / Math.PI);
    }
    p.spd = Math.max(0, p.spd + p.spd_incr + (def ? _rand_range(-def.speed_wiggle, def.speed_wiggle) : 0));
    p.dir += p.dir_incr + (def ? _rand_range(-def.dir_wiggle, def.dir_wiggle) : 0);
    p.ang += p.ang_incr + (def ? _rand_range(-def.ang_wiggle, def.ang_wiggle) : 0);
    p.size = Math.max(0, p.size + p.size_incr + (def ? _rand_range(-def.size_wiggle, def.size_wiggle) : 0));
    if (def) {
      const t = 1 - p.life / p.life_max;
      const [r, g, b] = _lerp3_color(def.color1, def.color2, def.color3, t);
      p.r = r;
      p.g = g;
      p.b = b;
      p.alpha = _lerp3(def.alpha1, def.alpha2, def.alpha3, t);
    }
    if (def && def.step_type_id >= 0 && def.step_number > 0) {
      for (let i = 0; i < def.step_number; i++) {
        to_spawn.push({ type_id: def.step_type_id, x: p.x, y: p.y });
      }
    }
    p.life--;
    if (p.life > 0) {
      alive.push(p);
    } else {
      if (def && def.death_type_id >= 0 && def.death_number > 0) {
        for (let i = 0; i < def.death_number; i++) {
          to_spawn.push({ type_id: def.death_type_id, x: p.x, y: p.y });
        }
      }
    }
  }
  sys.particles = alive;
  for (const s of to_spawn) _spawn_particle(sys, s.type_id, s.x, s.y);
}
function part_system_draw(system_id) {
  const sys = _systems.get(system_id);
  if (!sys) return;
  const saved_color = renderer.get_color();
  const saved_alpha = renderer.get_alpha();
  for (const p of sys.particles) {
    if (p.alpha <= 0 || p.size <= 0) continue;
    const ri = Math.round(p.r * 255);
    const gi = Math.round(p.g * 255);
    const bi = Math.round(p.b * 255);
    const color = bi << 16 | gi << 8 | ri;
    renderer.set_color(color);
    renderer.set_alpha(p.alpha);
    const half = p.size * 0.5;
    renderer.draw_rectangle(p.x - half, p.y - half, p.x + half, p.y + half, false);
  }
  renderer.set_color(saved_color);
  renderer.set_alpha(saved_alpha);
}

// packages/engine/src/particles/particle_emitter.ts
var ps_shape_rectangle = 0;
var ps_shape_ellipse = 1;
var ps_shape_diamond = 2;
var ps_shape_line = 3;
var ps_distr_linear = 0;
var ps_distr_gaussian = 1;
var ps_distr_inv_gaussian = 2;
var _emitters = /* @__PURE__ */ new Map();
var _next_emitter_id = 1;
function _sample_region(e) {
  const cx = (e.x1 + e.x2) * 0.5;
  const cy = (e.y1 + e.y2) * 0.5;
  const hw = (e.x2 - e.x1) * 0.5;
  const hh = (e.y2 - e.y1) * 0.5;
  let u = Math.random();
  let v = Math.random();
  if (e.distr === ps_distr_gaussian) {
    u = _gaussian();
    v = _gaussian();
  } else if (e.distr === ps_distr_inv_gaussian) {
    u = 1 - _gaussian();
    v = 1 - _gaussian();
  }
  switch (e.shape) {
    case ps_shape_rectangle:
      return { x: e.x1 + u * (e.x2 - e.x1), y: e.y1 + v * (e.y2 - e.y1) };
    case ps_shape_ellipse: {
      const ang = u * 2 * Math.PI;
      const rad = Math.sqrt(v);
      return { x: cx + Math.cos(ang) * rad * hw, y: cy + Math.sin(ang) * rad * hh };
    }
    case ps_shape_diamond: {
      let dx = u * 2 - 1;
      let dy = v * 2 - 1;
      if (Math.abs(dx) + Math.abs(dy) > 1) {
        dx = (dx > 0 ? 1 : -1) - dx;
        dy = (dy > 0 ? 1 : -1) - dy;
      }
      return { x: cx + dx * hw, y: cy + dy * hh };
    }
    case ps_shape_line: {
      return { x: e.x1 + u * (e.x2 - e.x1), y: e.y1 + u * (e.y2 - e.y1) };
    }
    default:
      return { x: cx, y: cy };
  }
}
function _gaussian() {
  const u = Math.random() || 1e-10;
  const v = Math.random();
  const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(0, Math.min(1, g / 6 + 0.5));
}
function part_emitter_create(system_id) {
  const id = _next_emitter_id++;
  _emitters.set(id, {
    system_id,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    shape: ps_shape_rectangle,
    distr: ps_distr_linear
  });
  return id;
}
function part_emitter_destroy(emitter_id) {
  _emitters.delete(emitter_id);
}
function part_emitter_exists(emitter_id) {
  return _emitters.has(emitter_id);
}
function part_emitter_region(emitter_id, x1, y1, x2, y2, shape, distr) {
  const e = _emitters.get(emitter_id);
  if (!e) return;
  e.x1 = x1;
  e.y1 = y1;
  e.x2 = x2;
  e.y2 = y2;
  e.shape = shape;
  e.distr = distr;
}
function part_emitter_burst(emitter_id, type_id, number) {
  const e = _emitters.get(emitter_id);
  if (!e) return;
  const sys_entry = _get_system(e.system_id);
  if (!sys_entry) return;
  for (let i = 0; i < number; i++) {
    const pos = _sample_region(e);
    _spawn_particle(sys_entry, type_id, pos.x, pos.y);
  }
}
function part_emitter_stream(emitter_id, type_id, number) {
  part_emitter_burst(emitter_id, type_id, number);
}
function _get_system(system_id) {
  return _get_system_raw(system_id);
}

// packages/engine/src/3d/transform_3d.ts
function mat4_identity() {
  return new Float32Array([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ]);
}
function mat4_mul(a, b) {
  const r = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      r[col * 4 + row] = sum;
    }
  }
  return r;
}
function mat4_translate(tx, ty, tz) {
  const m = mat4_identity();
  m[12] = tx;
  m[13] = ty;
  m[14] = tz;
  return m;
}
function mat4_scale(sx, sy, sz) {
  const m = mat4_identity();
  m[0] = sx;
  m[5] = sy;
  m[10] = sz;
  return m;
}
function mat4_rotate_x(deg) {
  const r = deg * (Math.PI / 180);
  const c = Math.cos(r), s = Math.sin(r);
  const m = mat4_identity();
  m[5] = c;
  m[9] = -s;
  m[6] = s;
  m[10] = c;
  return m;
}
function mat4_rotate_y(deg) {
  const r = deg * (Math.PI / 180);
  const c = Math.cos(r), s = Math.sin(r);
  const m = mat4_identity();
  m[0] = c;
  m[8] = s;
  m[2] = -s;
  m[10] = c;
  return m;
}
function mat4_rotate_z(deg) {
  const r = deg * (Math.PI / 180);
  const c = Math.cos(r), s = Math.sin(r);
  const m = mat4_identity();
  m[0] = c;
  m[4] = -s;
  m[1] = s;
  m[5] = c;
  return m;
}
function mat4_perspective(fov_deg, aspect, near, far) {
  const f = 1 / Math.tan(fov_deg * (Math.PI / 360));
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}
function mat4_look_at(ex, ey, ez, tx, ty, tz, ux, uy, uz) {
  let zx = ex - tx, zy = ey - ty, zz = ez - tz;
  let zl = Math.sqrt(zx * zx + zy * zy + zz * zz) || 1;
  zx /= zl;
  zy /= zl;
  zz /= zl;
  let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
  const xl = Math.sqrt(xx * xx + xy * xy + xz * xz) || 1;
  xx /= xl;
  xy /= xl;
  xz /= xl;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  const m = new Float32Array(16);
  m[0] = xx;
  m[4] = xy;
  m[8] = xz;
  m[12] = -(xx * ex + xy * ey + xz * ez);
  m[1] = yx;
  m[5] = yy;
  m[9] = yz;
  m[13] = -(yx * ex + yy * ey + yz * ez);
  m[2] = zx;
  m[6] = zy;
  m[10] = zz;
  m[14] = -(zx * ex + zy * ey + zz * ez);
  m[15] = 1;
  return m;
}
function mat4_ortho(left, right, bottom, top, near, far) {
  const m = new Float32Array(16);
  m[0] = 2 / (right - left);
  m[5] = 2 / (top - bottom);
  m[10] = -2 / (far - near);
  m[12] = -(right + left) / (right - left);
  m[13] = -(top + bottom) / (top - bottom);
  m[14] = -(far + near) / (far - near);
  m[15] = 1;
  return m;
}
var _stack = [mat4_identity()];
var _current = _stack[0];
function d3d_transform_get() {
  return _current;
}
function d3d_transform_set_identity() {
  _current = mat4_identity();
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_set_translation(x, y, z) {
  _current = mat4_translate(x, y, z);
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_set_scaling(sx, sy, sz) {
  _current = mat4_scale(sx, sy, sz);
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_set_rotation(xa, ya, _za, deg) {
  let m = mat4_identity();
  if (xa !== 0) m = mat4_mul(m, mat4_rotate_x(deg * xa));
  if (ya !== 0) m = mat4_mul(m, mat4_rotate_y(deg * ya));
  _current = m;
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_add_translation(x, y, z) {
  _current = mat4_mul(_current, mat4_translate(x, y, z));
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_add_scaling(sx, sy, sz) {
  _current = mat4_mul(_current, mat4_scale(sx, sy, sz));
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_add_rotation_x(deg) {
  _current = mat4_mul(_current, mat4_rotate_x(deg));
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_add_rotation_y(deg) {
  _current = mat4_mul(_current, mat4_rotate_y(deg));
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_add_rotation_z(deg) {
  _current = mat4_mul(_current, mat4_rotate_z(deg));
  _stack[_stack.length - 1] = _current;
}
function d3d_transform_stack_push() {
  _stack.push(new Float32Array(_current));
  _current = _stack[_stack.length - 1];
}
function d3d_transform_stack_pop() {
  if (_stack.length > 1) _stack.pop();
  _current = _stack[_stack.length - 1];
}
function d3d_transform_stack_clear() {
  _stack.length = 1;
  _stack[0] = mat4_identity();
  _current = _stack[0];
}

// packages/engine/src/3d/lighting_3d.ts
var d3d_lighttype_directional = 0;
var d3d_lighttype_point = 1;
var MAX_LIGHTS = 8;
function _default_light() {
  return { enabled: false, type: d3d_lighttype_directional, x: 0, y: 0, z: -1, r: 1, g: 1, b: 1, range: 100 };
}
var _lights = Array.from({ length: MAX_LIGHTS }, _default_light);
var _ambient_r = 0.2;
var _ambient_g = 0.2;
var _ambient_b = 0.2;
function d3d_light_enable(light_index, enabled) {
  const l = _lights[light_index];
  if (l) l.enabled = enabled;
}
function d3d_light_define_direction(light_index, dx, dy, dz, col) {
  const l = _lights[light_index];
  if (!l) return;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  l.type = d3d_lighttype_directional;
  l.x = dx / len;
  l.y = dy / len;
  l.z = dz / len;
  l.r = (col & 255) / 255;
  l.g = (col >> 8 & 255) / 255;
  l.b = (col >> 16 & 255) / 255;
  l.enabled = true;
}
function d3d_light_define_point(light_index, x, y, z, range, col) {
  const l = _lights[light_index];
  if (!l) return;
  l.type = d3d_lighttype_point;
  l.x = x;
  l.y = y;
  l.z = z;
  l.range = range;
  l.r = (col & 255) / 255;
  l.g = (col >> 8 & 255) / 255;
  l.b = (col >> 16 & 255) / 255;
  l.enabled = true;
}
function d3d_light_set_ambient(col) {
  _ambient_r = (col & 255) / 255;
  _ambient_g = (col >> 8 & 255) / 255;
  _ambient_b = (col >> 16 & 255) / 255;
}
function d3d_light_get_uniforms() {
  const enabled = _lights.filter((l) => l.enabled);
  const count = enabled.length;
  const types = new Int32Array(MAX_LIGHTS);
  const pos = new Float32Array(MAX_LIGHTS * 3);
  const colors = new Float32Array(MAX_LIGHTS * 3);
  const ranges = new Float32Array(MAX_LIGHTS);
  enabled.forEach((l, i) => {
    types[i] = l.type;
    pos[i * 3] = l.x;
    pos[i * 3 + 1] = l.y;
    pos[i * 3 + 2] = l.z;
    colors[i * 3] = l.r;
    colors[i * 3 + 1] = l.g;
    colors[i * 3 + 2] = l.b;
    ranges[i] = l.range;
  });
  return {
    ambient: new Float32Array([_ambient_r, _ambient_g, _ambient_b]),
    count,
    types,
    positions: pos,
    colors,
    ranges
  };
}
function d3d_light_get_all() {
  return _lights;
}

// packages/engine/src/3d/model.ts
var pr_pointlist = 0;
var pr_linelist = 1;
var pr_linestrip = 2;
var pr_trianglelist = 4;
var pr_trianglestrip = 5;
var pr_trianglefan = 6;
var _GL_MODES = {
  0: 0,
  // POINTS
  1: 1,
  // LINES
  2: 3,
  // LINE_STRIP
  4: 4,
  // TRIANGLES
  5: 5,
  // TRIANGLE_STRIP
  6: 6
  // TRIANGLE_FAN
};
var VERTEX_STRIDE = 32;
var FLOATS_PER_VERTEX2 = 8;
var _models = /* @__PURE__ */ new Map();
var _next_model_id = 1;
var _build_nx = 0;
var _build_ny = 0;
var _build_nz = 1;
var _build_u = 0;
var _build_v = 0;
function _get_model_raw(model_id) {
  return _models.get(model_id);
}
function d3d_model_create() {
  const id = _next_model_id++;
  _models.set(id, { meshes: [], building: false, build_prim: pr_trianglelist, build_verts: [] });
  return id;
}
function d3d_model_destroy(model_id) {
  const m = _models.get(model_id);
  if (!m) return;
  const gl = renderer.get_gl();
  for (const mesh of m.meshes) {
    if (mesh.vbo) gl.deleteBuffer(mesh.vbo);
  }
  _models.delete(model_id);
}
function d3d_model_exists(model_id) {
  return _models.has(model_id);
}
function d3d_model_clear(model_id) {
  const m = _models.get(model_id);
  if (!m) return;
  const gl = renderer.get_gl();
  for (const mesh of m.meshes) {
    if (mesh.vbo) gl.deleteBuffer(mesh.vbo);
  }
  m.meshes = [];
}
function d3d_model_primitive_begin(model_id, kind) {
  const m = _models.get(model_id);
  if (!m || m.building) return;
  m.building = true;
  m.build_prim = kind;
  m.build_verts = [];
  _build_nx = 0;
  _build_ny = 0;
  _build_nz = 1;
  _build_u = 0;
  _build_v = 0;
}
function d3d_model_primitive_end(model_id) {
  const m = _models.get(model_id);
  if (!m || !m.building) return;
  m.building = false;
  if (m.build_verts.length === 0) return;
  m.meshes.push({
    primitive: m.build_prim,
    vertices: new Float32Array(m.build_verts),
    vbo: null,
    dirty: true
  });
  m.build_verts = [];
}
function d3d_model_vertex(model_id, x, y, z) {
  const m = _models.get(model_id);
  if (!m || !m.building) return;
  m.build_verts.push(x, y, z, _build_nx, _build_ny, _build_nz, _build_u, _build_v);
}
function d3d_model_vertex_normal(model_id, x, y, z, nx, ny, nz) {
  const m = _models.get(model_id);
  if (!m || !m.building) return;
  m.build_verts.push(x, y, z, nx, ny, nz, _build_u, _build_v);
}
function d3d_model_vertex_texture(model_id, x, y, z, u, v) {
  const m = _models.get(model_id);
  if (!m || !m.building) return;
  m.build_verts.push(x, y, z, _build_nx, _build_ny, _build_nz, u, v);
}
function d3d_model_set_normal(nx, ny, nz) {
  _build_nx = nx;
  _build_ny = ny;
  _build_nz = nz;
}
function d3d_model_set_uv(u, v) {
  _build_u = u;
  _build_v = v;
}
function d3d_model_block(model_id, x1, y1, z1, x2, y2, z2, hrepeat = 1, vrepeat = 1) {
  d3d_model_primitive_begin(model_id, pr_trianglelist);
  const m = _models.get(model_id);
  if (!m) return;
  _add_box_verts(m, x1, y1, z1, x2, y2, z2, hrepeat, vrepeat);
  d3d_model_primitive_end(model_id);
}
function _add_box_verts(m, x1, y1, z1, x2, y2, z2, hr, vr) {
  const faces = [
    // Front  (z2): normal 0,0,1
    [x1, y1, z2, x2, y1, z2, x2, y2, z2],
    [x1, y1, z2, x2, y2, z2, x1, y2, z2],
    // Back   (z1): normal 0,0,-1
    [x2, y1, z1, x1, y1, z1, x1, y2, z1],
    [x2, y1, z1, x1, y2, z1, x2, y2, z1],
    // Left   (x1): normal -1,0,0
    [x1, y1, z1, x1, y1, z2, x1, y2, z2],
    [x1, y1, z1, x1, y2, z2, x1, y2, z1],
    // Right  (x2): normal 1,0,0
    [x2, y1, z2, x2, y1, z1, x2, y2, z1],
    [x2, y1, z2, x2, y2, z1, x2, y2, z2],
    // Bottom (y1): normal 0,-1,0
    [x1, y1, z1, x2, y1, z1, x2, y1, z2],
    [x1, y1, z1, x2, y1, z2, x1, y1, z2],
    // Top    (y2): normal 0,1,0
    [x1, y2, z2, x2, y2, z2, x2, y2, z1],
    [x1, y2, z2, x2, y2, z1, x1, y2, z1]
  ];
  const normals = [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, -1],
    [0, 0, -1],
    [-1, 0, 0],
    [-1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ];
  faces.forEach((tri, fi) => {
    const [nx, ny, nz] = normals[fi];
    for (let vi = 0; vi < 9; vi += 3) {
      m.build_verts.push(tri[vi], tri[vi + 1], tri[vi + 2], nx, ny, nz, 0, 0);
    }
  });
}
function d3d_model_sphere(model_id, x, y, z, r, hsteps = 12, vsteps = 6) {
  d3d_model_primitive_begin(model_id, pr_trianglelist);
  const m = _models.get(model_id);
  if (!m) return;
  for (let j = 0; j < vsteps; j++) {
    const theta1 = j / vsteps * Math.PI;
    const theta2 = (j + 1) / vsteps * Math.PI;
    for (let i = 0; i < hsteps; i++) {
      const phi1 = i / hsteps * 2 * Math.PI;
      const phi2 = (i + 1) / hsteps * 2 * Math.PI;
      const v = (p, t) => [
        x + r * Math.sin(t) * Math.cos(p),
        y + r * Math.cos(t),
        z + r * Math.sin(t) * Math.sin(p),
        Math.sin(t) * Math.cos(p),
        Math.cos(t),
        Math.sin(t) * Math.sin(p)
      ];
      const a = v(phi1, theta1), b = v(phi2, theta1);
      const c = v(phi2, theta2), d = v(phi1, theta2);
      if (j !== 0) {
        m.build_verts.push(...a, ...b, ...c);
      }
      if (j !== vsteps - 1) {
        m.build_verts.push(...a, ...c, ...d);
      }
    }
  }
  d3d_model_primitive_end(model_id);
}
function d3d_model_draw(model_id, x = 0, y = 0, z = 0) {
  const mod = _models.get(model_id);
  if (!mod) return;
  const gl = renderer.get_gl();
  renderer.flush_batch();
  for (const mesh of mod.meshes) {
    if (mesh.vertices.length === 0) continue;
    if (mesh.dirty || !mesh.vbo) {
      if (!mesh.vbo) mesh.vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
      mesh.dirty = false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, VERTEX_STRIDE, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, VERTEX_STRIDE, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, VERTEX_STRIDE, 24);
    const gl_mode = _GL_MODES[mesh.primitive] ?? gl.TRIANGLES;
    const vert_count = mesh.vertices.length / FLOATS_PER_VERTEX2;
    gl.drawArrays(gl_mode, 0, vert_count);
  }
}

// packages/engine/src/3d/model_loader.ts
function _parse_obj(src) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const faces = [];
  for (const raw_line of src.split("\n")) {
    const line = raw_line.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    switch (parts[0]) {
      case "v":
        positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        break;
      case "vn":
        normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        break;
      case "vt":
        uvs.push([parseFloat(parts[1]), parseFloat(parts[2] ?? "0")]);
        break;
      case "f": {
        const verts = parts.slice(1).map((tok) => {
          const segs = tok.split("/");
          return [
            parseInt(segs[0] ?? "0") || 0,
            parseInt(segs[1] ?? "0") || 0,
            parseInt(segs[2] ?? "0") || 0
          ];
        });
        for (let i = 1; i < verts.length - 1; i++) {
          faces.push(verts[0], verts[i], verts[i + 1]);
        }
        break;
      }
    }
  }
  return { positions, normals, uvs, faces };
}
function model_load_obj(obj_src) {
  const data = _parse_obj(obj_src);
  const model_id = d3d_model_create();
  d3d_model_primitive_begin(model_id, pr_trianglelist);
  const m = _get_model_raw(model_id);
  if (!m) {
    d3d_model_primitive_end(model_id);
    return model_id;
  }
  for (const face_vert of data.faces) {
    const [pi, ui, ni] = face_vert;
    const pos = pi > 0 ? data.positions[pi - 1] : [0, 0, 0];
    const nrm = ni > 0 ? data.normals[ni - 1] : [0, 0, 1];
    const uv = ui > 0 ? data.uvs[ui - 1] : [0, 0];
    m.build_verts.push(
      pos[0] ?? 0,
      pos[1] ?? 0,
      pos[2] ?? 0,
      nrm[0] ?? 0,
      nrm[1] ?? 0,
      nrm[2] ?? 1,
      uv[0] ?? 0,
      1 - (uv[1] ?? 0)
      // Flip V: OBJ bottom-left → WebGL top-left
    );
  }
  d3d_model_primitive_end(model_id);
  return model_id;
}
async function model_load_obj_url(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return -1;
    const src = await resp.text();
    return model_load_obj(src);
  } catch {
    return -1;
  }
}

// packages/engine/src/math/vectors.ts
var vector2 = class {
  // Y component of the vector
  /**
   * Creates a new 2D vector.
   * @param x - X component (default 0)
   * @param y - Y component (default 0)
   */
  constructor(x = 0, y = 0) {
    this.x = 0;
    // X component of the vector
    this.y = 0;
    this.x = x;
    this.y = y;
  }
  /**
   * Returns a JSON string representation of this vector.
   * @returns JSON string with x and y values
   */
  toString() {
    return JSON.stringify(this);
  }
};

// packages/engine/src/math/math_utils.ts
var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;
function degtorad(deg) {
  return deg * DEG2RAD;
}
function radtodeg(rad) {
  return rad * RAD2DEG;
}
function dsin(deg) {
  return Math.sin(deg * DEG2RAD);
}
function dcos(deg) {
  return Math.cos(deg * DEG2RAD);
}
function dtan(deg) {
  return Math.tan(deg * DEG2RAD);
}
function arcsin(x) {
  return Math.asin(x) * RAD2DEG;
}
function arccos(x) {
  return Math.acos(x) * RAD2DEG;
}
function arctan(x) {
  return Math.atan(x) * RAD2DEG;
}
function arctan2(y, x) {
  return Math.atan2(y, x) * RAD2DEG;
}
function lengthdir_x(len, dir) {
  return len * Math.cos(dir * DEG2RAD);
}
function lengthdir_y(len, dir) {
  return -len * Math.sin(dir * DEG2RAD);
}
function point_distance(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
function point_distance_3d(x1, y1, z1, x2, y2, z2) {
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function point_direction(x1, y1, x2, y2) {
  return Math.atan2(-(y2 - y1), x2 - x1) * RAD2DEG;
}
function angle_difference(a, b) {
  let d = ((a - b) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}
function lerp(a, b, w) {
  return a + (b - a) * w;
}
function clamp(val, min_val, max_val) {
  return val < min_val ? min_val : val > max_val ? max_val : val;
}
function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}
function frac(x) {
  return x - Math.trunc(x);
}
function sqr(x) {
  return x * x;
}
function sqrt(x) {
  return Math.sqrt(x);
}
function abs(x) {
  return Math.abs(x);
}
function floor(x) {
  return Math.floor(x);
}
function ceil(x) {
  return Math.ceil(x);
}
function round(x) {
  return Math.round(x);
}
function power(x, n) {
  return Math.pow(x, n);
}
function log2(x) {
  return Math.log2(x);
}
function log10(x) {
  return Math.log10(x);
}
function ln(x) {
  return Math.log(x);
}
function exp(x) {
  return Math.exp(x);
}
function min(...values) {
  return Math.min(...values);
}
function max(...values) {
  return Math.max(...values);
}
function median(...values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}
function mean(...values) {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}
function between(x, lo, hi) {
  return x >= lo && x <= hi;
}
function approx(x, y, epsilon = 1e-6) {
  return Math.abs(x - y) <= epsilon;
}
function wrap(x, range) {
  return (x % range + range) % range;
}
function dot2(x1, y1, x2, y2) {
  return x1 * x2 + y1 * y2;
}
function dot3(x1, y1, z1, x2, y2, z2) {
  return x1 * x2 + y1 * y2 + z1 * z2;
}
function cross2(x1, y1, x2, y2) {
  return x1 * y2 - y1 * x2;
}

// packages/engine/src/math/random.ts
var _seed = 0;
function _mulberry32() {
  _seed |= 0;
  _seed = _seed + 1831565813 | 0;
  let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function random_set_seed(seed) {
  _seed = seed >>> 0;
}
function random_get_seed() {
  return _seed >>> 0;
}
function randomize() {
  _seed = (Date.now() ^ Math.random() * 4294967295) >>> 0;
}
function random(n) {
  return _mulberry32() * n;
}
function irandom(n) {
  return Math.floor(_mulberry32() * (n + 1));
}
function random_range(lo, hi) {
  return lo + _mulberry32() * (hi - lo);
}
function irandom_range(lo, hi) {
  return Math.floor(lo + _mulberry32() * (hi - lo + 1));
}
function array_shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(_mulberry32() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
function array_random(arr) {
  if (arr.length === 0) return void 0;
  return arr[Math.floor(_mulberry32() * arr.length)];
}
function random_native() {
  return Math.random();
}

// packages/engine/src/math/string_utils.ts
function string_length(str) {
  return str.length;
}
function string_copy(str, index, count) {
  return str.substring(index - 1, index - 1 + count);
}
function string_pos(substr, str) {
  const i = str.indexOf(substr);
  return i < 0 ? 0 : i + 1;
}
function string_pos_ext(substr, str, occurrence = 1) {
  let pos = 0;
  for (let i = 0; i < occurrence; i++) {
    const found = str.indexOf(substr, pos);
    if (found < 0) return 0;
    pos = found + (i < occurrence - 1 ? 1 : 0);
  }
  return pos + 1;
}
function string_delete(str, index, count) {
  return str.slice(0, index - 1) + str.slice(index - 1 + count);
}
function string_insert(substr, str, index) {
  return str.slice(0, index - 1) + substr + str.slice(index - 1);
}
function string_replace(str, old_str, new_str) {
  const i = str.indexOf(old_str);
  if (i < 0) return str;
  return str.slice(0, i) + new_str + str.slice(i + old_str.length);
}
function string_replace_all(str, old_str, new_str) {
  if (old_str === "") return str;
  return str.split(old_str).join(new_str);
}
function string_count(substr, str) {
  if (substr === "") return 0;
  let count = 0, pos = 0;
  while ((pos = str.indexOf(substr, pos)) >= 0) {
    count++;
    pos += substr.length;
  }
  return count;
}
function string_lower(str) {
  return str.toLowerCase();
}
function string_upper(str) {
  return str.toUpperCase();
}
function string_letters(str) {
  return str.replace(/[^a-zA-Z]/g, "");
}
function string_digits(str) {
  return str.replace(/[^0-9]/g, "");
}
function string_lettersdigits(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "");
}
function string_trim(str) {
  return str.trim();
}
function string_trim_start(str) {
  return str.trimStart();
}
function string_trim_end(str) {
  return str.trimEnd();
}
function string_repeat(str, n) {
  return str.repeat(Math.max(0, n));
}
function string_reverse(str) {
  return [...str].reverse().join("");
}
function string_char_at(str, index) {
  return str[index - 1] ?? "";
}
function string_byte_at(str, index) {
  return str.charCodeAt(index - 1) || 0;
}
function string_byte_length(str) {
  return str.length * 2;
}
function chr(code) {
  return String.fromCodePoint(code);
}
function ord(str) {
  return str.codePointAt(0) ?? 0;
}
function ansi_char(code) {
  return String.fromCharCode(code);
}
function string_format(val, tot, dec) {
  const formatted = val.toFixed(dec);
  return formatted.length < tot ? formatted.padStart(tot) : formatted;
}
function string(val) {
  if (typeof val === "number") {
    return Number.isInteger(val) ? String(val) : String(val);
  }
  return String(val);
}
function real(str) {
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}
function string_split(str, delimiter) {
  return str.split(delimiter);
}
function string_join(parts, separator = "") {
  return parts.join(separator);
}

// packages/engine/src/math/regex_utils.ts
function regex_match(str, pattern, flags = "") {
  try {
    return new RegExp(pattern, flags).test(str);
  } catch {
    return false;
  }
}
function regex_find(str, pattern, flags = "") {
  try {
    return str.match(new RegExp(pattern, flags))?.[0] ?? null;
  } catch {
    return null;
  }
}
function regex_find_all(str, pattern, flags = "g") {
  try {
    return [...str.matchAll(new RegExp(pattern, flags))].map((m) => m[0]);
  } catch {
    return [];
  }
}
function regex_replace(str, pattern, replacement, flags = "") {
  try {
    return str.replace(new RegExp(pattern, flags), replacement);
  } catch {
    return str;
  }
}
function regex_replace_all(str, pattern, replacement, flags = "g") {
  try {
    return str.replace(new RegExp(pattern, flags), replacement);
  } catch {
    return str;
  }
}
function regex_split(str, pattern, flags = "") {
  try {
    return str.split(new RegExp(pattern, flags));
  } catch {
    return [str];
  }
}
function regex_pos(str, pattern, flags = "") {
  try {
    const m = str.search(new RegExp(pattern, flags));
    return m < 0 ? 0 : m + 1;
  } catch {
    return 0;
  }
}
function regex_groups(str, pattern, flags = "") {
  try {
    const m = str.match(new RegExp(pattern, flags));
    return m ? [...m].map((s) => s ?? "") : [];
  } catch {
    return [];
  }
}
export {
  EVENT_TYPE,
  MASK_CIRCLE,
  MASK_ELLIPSE,
  MASK_RECT,
  MAX_LIGHTS,
  abs,
  angle_difference,
  ansi_char,
  approx,
  arccos,
  arcsin,
  arctan,
  arctan2,
  array_random,
  array_shuffle,
  audio_get_listener_x,
  audio_get_listener_y,
  audio_get_master_gain,
  audio_group,
  audio_group_get_gain,
  audio_group_set_gain,
  audio_group_stop,
  audio_is_playing,
  audio_play_sound,
  audio_play_sound_at,
  audio_set_listener_position,
  audio_set_master_gain,
  audio_set_sound_position,
  audio_sound_gain,
  audio_sound_pitch,
  audio_stop_all,
  audio_stop_sound,
  audio_system,
  between,
  bm_add,
  bm_max,
  bm_normal,
  bm_subtract,
  buffer_base64_decode,
  buffer_base64_encode,
  buffer_bool,
  buffer_copy,
  buffer_create,
  buffer_delete,
  buffer_exists,
  buffer_f32,
  buffer_f64,
  buffer_fast,
  buffer_fill,
  buffer_fixed,
  buffer_from_bytes,
  buffer_get_bytes,
  buffer_get_size,
  buffer_grow,
  buffer_read,
  buffer_s16,
  buffer_s32,
  buffer_s8,
  buffer_seek,
  buffer_seek_end,
  buffer_seek_relative,
  buffer_seek_start,
  buffer_string,
  buffer_tell,
  buffer_u16,
  buffer_u32,
  buffer_u64,
  buffer_u8,
  buffer_wrap,
  buffer_write,
  c_aqua,
  c_black,
  c_blue,
  c_dkgray,
  c_fuchsia,
  c_gray,
  c_green,
  c_lime,
  c_ltgray,
  c_maroon,
  c_navy,
  c_olive,
  c_orange,
  c_purple,
  c_red,
  c_silver,
  c_teal,
  c_white,
  c_yellow,
  camera_set_view_pos,
  camera_set_view_size,
  ceil,
  chr,
  circle_in_instance,
  clamp,
  color_get_blue,
  color_get_green,
  color_get_red,
  color_to_rgb_normalized,
  cross2,
  d3d_light_define_direction,
  d3d_light_define_point,
  d3d_light_enable,
  d3d_light_get_all,
  d3d_light_get_uniforms,
  d3d_light_set_ambient,
  d3d_lighttype_directional,
  d3d_lighttype_point,
  d3d_model_block,
  d3d_model_clear,
  d3d_model_create,
  d3d_model_destroy,
  d3d_model_draw,
  d3d_model_exists,
  d3d_model_primitive_begin,
  d3d_model_primitive_end,
  d3d_model_set_normal,
  d3d_model_set_uv,
  d3d_model_sphere,
  d3d_model_vertex,
  d3d_model_vertex_normal,
  d3d_model_vertex_texture,
  d3d_transform_add_rotation_x,
  d3d_transform_add_rotation_y,
  d3d_transform_add_rotation_z,
  d3d_transform_add_scaling,
  d3d_transform_add_translation,
  d3d_transform_get,
  d3d_transform_set_identity,
  d3d_transform_set_rotation,
  d3d_transform_set_scaling,
  d3d_transform_set_translation,
  d3d_transform_stack_clear,
  d3d_transform_stack_pop,
  d3d_transform_stack_push,
  dcos,
  degtorad,
  device_get_touch_count,
  device_mouse_check_button,
  device_mouse_check_button_pressed,
  device_mouse_check_button_released,
  device_mouse_x,
  device_mouse_y,
  dot2,
  dot3,
  draw_circle,
  draw_clear,
  draw_ellipse,
  draw_get_alpha,
  draw_get_color,
  draw_line,
  draw_line_width,
  draw_point,
  draw_rectangle,
  draw_set_alpha,
  draw_set_blend_mode,
  draw_set_color,
  draw_set_font,
  draw_set_halign,
  draw_set_valign,
  draw_sprite,
  draw_sprite_ext,
  draw_sprite_part,
  draw_sprite_stretched,
  draw_surface,
  draw_text,
  draw_triangle,
  ds_grid_add,
  ds_grid_add_region,
  ds_grid_clear,
  ds_grid_copy,
  ds_grid_create,
  ds_grid_destroy,
  ds_grid_exists,
  ds_grid_get,
  ds_grid_get_max,
  ds_grid_get_mean,
  ds_grid_get_min,
  ds_grid_get_sum,
  ds_grid_height,
  ds_grid_multiply,
  ds_grid_multiply_region,
  ds_grid_region_get,
  ds_grid_set,
  ds_grid_set_region,
  ds_grid_width,
  ds_list_add,
  ds_list_clear,
  ds_list_copy,
  ds_list_create,
  ds_list_delete,
  ds_list_destroy,
  ds_list_empty,
  ds_list_exists,
  ds_list_find_index,
  ds_list_find_value,
  ds_list_insert,
  ds_list_replace,
  ds_list_shuffle,
  ds_list_size,
  ds_list_sort,
  ds_map_add,
  ds_map_clear,
  ds_map_copy,
  ds_map_create,
  ds_map_delete,
  ds_map_destroy,
  ds_map_empty,
  ds_map_exists,
  ds_map_exists_id,
  ds_map_find_first,
  ds_map_find_last,
  ds_map_find_next,
  ds_map_find_previous,
  ds_map_find_value,
  ds_map_set,
  ds_map_size,
  ds_priority_add,
  ds_priority_clear,
  ds_priority_copy,
  ds_priority_create,
  ds_priority_delete_max,
  ds_priority_delete_min,
  ds_priority_delete_value,
  ds_priority_destroy,
  ds_priority_empty,
  ds_priority_exists,
  ds_priority_find_max,
  ds_priority_find_min,
  ds_priority_find_priority,
  ds_priority_size,
  ds_queue_clear,
  ds_queue_copy,
  ds_queue_create,
  ds_queue_dequeue,
  ds_queue_destroy,
  ds_queue_empty,
  ds_queue_enqueue,
  ds_queue_exists,
  ds_queue_head,
  ds_queue_size,
  ds_queue_tail,
  ds_stack_clear,
  ds_stack_copy,
  ds_stack_create,
  ds_stack_destroy,
  ds_stack_empty,
  ds_stack_exists,
  ds_stack_pop,
  ds_stack_push,
  ds_stack_size,
  ds_stack_top,
  dsin,
  dtan,
  exp,
  fa_bottom,
  fa_center,
  fa_left,
  fa_middle,
  fa_right,
  fa_top,
  file_delete,
  file_exists,
  file_text_close,
  file_text_eof,
  file_text_open_append,
  file_text_open_read,
  file_text_open_write,
  file_text_read_string,
  file_text_readln,
  file_text_write_string,
  file_text_writeln,
  floor,
  font_resource,
  frac,
  game_event,
  game_loop,
  gamepad_axis_count,
  gamepad_axis_value,
  gamepad_button_check,
  gamepad_button_check_pressed,
  gamepad_button_check_released,
  gamepad_button_count,
  gamepad_button_value,
  gamepad_get_description,
  gamepad_get_device_count,
  gamepad_is_connected,
  gamepad_is_supported,
  gamepad_manager,
  gamepad_set_vibration,
  get_bbox,
  gm_object,
  gp_axislh,
  gp_axislv,
  gp_axisrh,
  gp_axisrv,
  gp_face1,
  gp_face2,
  gp_face3,
  gp_face4,
  gp_padd,
  gp_padl,
  gp_padr,
  gp_padu,
  gp_select,
  gp_shoulderl,
  gp_shoulderlb,
  gp_shoulderr,
  gp_shoulderrb,
  gp_start,
  gp_stickl,
  gp_stickr,
  http_get,
  http_get_bytes,
  http_post,
  http_post_json,
  http_request,
  ini_close,
  ini_delete,
  ini_key_delete,
  ini_key_exists,
  ini_open,
  ini_read_real,
  ini_read_string,
  ini_section_delete,
  ini_section_exists,
  ini_write_real,
  ini_write_string,
  instance,
  instances_collide,
  irandom,
  irandom_range,
  json_decode,
  json_deep_clone,
  json_delete,
  json_encode,
  json_is_valid,
  json_load,
  json_save,
  json_stringify_pretty,
  keyboard_check,
  keyboard_check_direct,
  keyboard_check_pressed,
  keyboard_check_released,
  keyboard_clear,
  keyboard_get_map,
  keyboard_key_press,
  keyboard_key_release,
  keyboard_manager,
  keyboard_set_map,
  keyboard_unset_map,
  lengthdir_x,
  lengthdir_y,
  lerp,
  ln,
  log10,
  log2,
  make_color_hsv,
  make_color_rgb,
  mat4_identity,
  mat4_look_at,
  mat4_mul,
  mat4_ortho,
  mat4_perspective,
  mat4_rotate_x,
  mat4_rotate_y,
  mat4_rotate_z,
  mat4_scale,
  mat4_translate,
  max,
  mb_any,
  mb_left,
  mb_middle,
  mb_none,
  mb_right,
  mean,
  median,
  merge_color,
  min,
  model_load_obj,
  model_load_obj_url,
  mouse_check_button,
  mouse_check_button_pressed,
  mouse_check_button_released,
  mouse_clear,
  mouse_manager,
  mouse_wheel_down,
  mouse_wheel_up,
  network_create_socket,
  network_destroy,
  network_get_ready_state,
  network_send_raw,
  network_send_text,
  network_set_on_close,
  network_set_on_error,
  network_set_on_message,
  network_set_on_open,
  network_socket_exists,
  network_type_connect,
  network_type_data,
  network_type_disconnect,
  network_type_non_blocking_connect,
  object_exists,
  object_get_name,
  object_get_parent,
  object_get_sprite,
  object_is_ancestor,
  ord,
  part_emitter_burst,
  part_emitter_create,
  part_emitter_destroy,
  part_emitter_exists,
  part_emitter_region,
  part_emitter_stream,
  part_system_clear,
  part_system_count,
  part_system_create,
  part_system_depth,
  part_system_destroy,
  part_system_draw,
  part_system_exists,
  part_system_update,
  part_type_alpha1,
  part_type_alpha2,
  part_type_alpha3,
  part_type_blend,
  part_type_color1,
  part_type_color2,
  part_type_color3,
  part_type_create,
  part_type_death,
  part_type_destroy,
  part_type_direction,
  part_type_exists,
  part_type_gravity,
  part_type_life,
  part_type_orientation,
  part_type_shape,
  part_type_size,
  part_type_speed,
  part_type_step,
  path_add_point,
  path_clear_points,
  path_create,
  path_delete,
  path_exists,
  path_flip,
  path_get_length,
  path_get_number,
  path_get_point_speed,
  path_get_point_x,
  path_get_point_y,
  path_get_speed,
  path_get_x,
  path_get_y,
  path_kind_linear,
  path_kind_smooth,
  path_mirror,
  path_reverse,
  path_set_closed,
  path_set_kind,
  path_set_precision,
  physics_body_apply_force,
  physics_body_apply_impulse,
  physics_body_destroy,
  physics_body_exists,
  physics_body_get_angle,
  physics_body_get_angular_velocity,
  physics_body_get_raw,
  physics_body_get_vx,
  physics_body_get_vy,
  physics_body_get_x,
  physics_body_get_y,
  physics_body_set_angular_velocity,
  physics_body_set_position,
  physics_body_set_static,
  physics_body_set_velocity,
  physics_fixture_bind,
  physics_fixture_create,
  physics_fixture_delete,
  physics_fixture_set_box,
  physics_fixture_set_circle,
  physics_fixture_set_density,
  physics_fixture_set_friction,
  physics_fixture_set_polygon,
  physics_fixture_set_restitution,
  physics_fixture_set_sensor,
  physics_get_scale,
  physics_joint_destroy,
  physics_joint_distance_create,
  physics_joint_exists,
  physics_joint_get_raw,
  physics_joint_revolute_create,
  physics_joint_spring_create,
  physics_joint_weld_create,
  physics_world_create,
  physics_world_destroy,
  physics_world_get_engine,
  physics_world_gravity,
  physics_world_on_collision_end,
  physics_world_on_collision_start,
  physics_world_step,
  point_direction,
  point_distance,
  point_distance_3d,
  point_in_instance,
  power,
  pr_linelist,
  pr_linestrip,
  pr_pointlist,
  pr_trianglefan,
  pr_trianglelist,
  pr_trianglestrip,
  ps_distr_gaussian,
  ps_distr_inv_gaussian,
  ps_distr_linear,
  ps_shape_diamond,
  ps_shape_ellipse,
  ps_shape_line,
  ps_shape_rectangle,
  pt_shape_circle,
  pt_shape_cloud,
  pt_shape_disk,
  pt_shape_explosion,
  pt_shape_flare,
  pt_shape_line,
  pt_shape_pixel,
  pt_shape_ring,
  pt_shape_smoke,
  pt_shape_snow,
  pt_shape_spark,
  pt_shape_sphere,
  pt_shape_square,
  pt_shape_star,
  radtodeg,
  random,
  random_get_seed,
  random_native,
  random_range,
  random_set_seed,
  randomize,
  real,
  rect_in_instance,
  regex_find,
  regex_find_all,
  regex_groups,
  regex_match,
  regex_pos,
  regex_replace,
  regex_replace_all,
  regex_split,
  renderer,
  resource,
  room,
  round,
  shader_current,
  shader_get_uniform,
  shader_reset,
  shader_set,
  shader_set_uniform_f,
  shader_set_uniform_f2,
  shader_set_uniform_f3,
  shader_set_uniform_f4,
  shader_set_uniform_f_array,
  shader_set_uniform_i,
  shader_set_uniform_i2,
  shader_set_uniform_matrix,
  sign,
  sound_asset,
  sound_instance,
  spatial_sound_instance,
  sprite,
  sprite_get_height,
  sprite_get_number,
  sprite_get_width,
  sprite_get_xoffset,
  sprite_get_yoffset,
  sqr,
  sqrt,
  string,
  string_byte_at,
  string_byte_length,
  string_char_at,
  string_copy,
  string_count,
  string_delete,
  string_digits,
  string_format,
  string_height,
  string_insert,
  string_join,
  string_length,
  string_letters,
  string_lettersdigits,
  string_lower,
  string_pos,
  string_pos_ext,
  string_repeat,
  string_replace,
  string_replace_all,
  string_reverse,
  string_split,
  string_trim,
  string_trim_end,
  string_trim_start,
  string_upper,
  string_width,
  surface_create,
  surface_exists,
  surface_free,
  surface_get_height,
  surface_get_width,
  surface_reset_target,
  surface_set_target,
  texture_manager,
  timeline_create,
  timeline_delete,
  timeline_exists,
  timeline_get_moment_count,
  timeline_get_position,
  timeline_moment_add,
  timeline_moment_clear,
  timeline_pause,
  timeline_play,
  timeline_set_loop,
  timeline_set_position,
  timeline_set_speed,
  timeline_step,
  timeline_step_all,
  timeline_stop,
  touch_manager,
  update_bbox,
  user_shader,
  vector2,
  view_apply,
  view_get,
  view_get_x,
  view_get_y,
  view_set_angle,
  view_set_enabled,
  view_set_port,
  view_set_position,
  view_set_size,
  vk_add,
  vk_alt,
  vk_anykey,
  vk_backspace,
  vk_control,
  vk_decimal,
  vk_delete,
  vk_divide,
  vk_down,
  vk_end,
  vk_enter,
  vk_escape,
  vk_f1,
  vk_f10,
  vk_f11,
  vk_f12,
  vk_f2,
  vk_f3,
  vk_f4,
  vk_f5,
  vk_f6,
  vk_f7,
  vk_f8,
  vk_f9,
  vk_home,
  vk_insert,
  vk_left,
  vk_multiply,
  vk_nokey,
  vk_numpad0,
  vk_numpad1,
  vk_numpad2,
  vk_numpad3,
  vk_numpad4,
  vk_numpad5,
  vk_numpad6,
  vk_numpad7,
  vk_numpad8,
  vk_numpad9,
  vk_pagedown,
  vk_pageup,
  vk_pause,
  vk_printscreen,
  vk_right,
  vk_shift,
  vk_space,
  vk_subtract,
  vk_tab,
  vk_up,
  webrtc_add_ice_candidate,
  webrtc_create_answer,
  webrtc_create_channel,
  webrtc_create_offer,
  webrtc_create_peer,
  webrtc_destroy_peer,
  webrtc_get_state,
  webrtc_peer_exists,
  webrtc_send,
  webrtc_send_text,
  webrtc_set_on_channel,
  webrtc_set_on_close,
  webrtc_set_on_ice_candidate,
  webrtc_set_on_message,
  webrtc_set_on_open,
  webrtc_set_remote_answer,
  window_mouse_get_x,
  window_mouse_get_y,
  window_mouse_set,
  with_object,
  wrap
};
