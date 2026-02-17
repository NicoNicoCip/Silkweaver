// exports/engine.js
import Matter from "matter-js";
import Matter2 from "matter-js";
import Matter3 from "matter-js";
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
  }, type = "NONE") {
    this.event = () => {
    };
    this.type = "NONE";
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
var resource = class _resource {
  constructor() {
    this.id = this.incrementID();
    this.name = this.constructor.name;
    _resource.all.set(this.id, this);
  }
  static {
    this.gid = 0;
  }
  static {
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
var room = class _room extends resource {
  // Instances in this room, keyed by ID
  constructor() {
    super();
    this.room_width = 640;
    this.room_height = 480;
    this.room_caption = `Room ${this.id}`;
    this.room_speed = 60;
    this.room_persistent = false;
    this.room_previous = 0;
    this.room_next = 0;
    this.background_visible = [];
    this.background_foreground = [];
    this.background_index = [];
    this.background_x = [];
    this.background_y = [];
    this.background_htiled = [];
    this.background_vtiled = [];
    this.background_hspeed = [];
    this.background_vspeed = [];
    this.background_color = [];
    this.view_enabled = false;
    this.view_current = 0;
    this.view_visible = [];
    this.view_xview = [];
    this.view_yview = [];
    this.view_wview = [];
    this.view_hview = [];
    this.view_xport = [];
    this.view_yport = [];
    this.view_wport = [];
    this.view_hport = [];
    this.view_hborder = [];
    this.view_vborder = [];
    this.view_hspeed = [];
    this.view_vspeed = [];
    this.view_object = [];
    this.tiles = [];
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
      game_loop.register("CREATE", inst.on_create.bind(inst));
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
var vk_nokey = 0;
var vk_anykey = 1;
var vk_space = 32;
var vk_left = 37;
var vk_right = 39;
var keyboard_manager = class _keyboard_manager {
  static {
    this._held = /* @__PURE__ */ new Set();
  }
  static {
    this._pressed = /* @__PURE__ */ new Set();
  }
  static {
    this._released = /* @__PURE__ */ new Set();
  }
  static {
    this._key_map = /* @__PURE__ */ new Map();
  }
  static {
    this.keyboard_key = vk_nokey;
  }
  static {
    this.keyboard_lastkey = vk_nokey;
  }
  static {
    this.keyboard_lastchar = "";
  }
  static {
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
    this._pressed = /* @__PURE__ */ new Set();
  }
  static {
    this._released = /* @__PURE__ */ new Set();
  }
  static {
    this._canvas = null;
  }
  static {
    this.window_x = 0;
  }
  static {
    this.window_y = 0;
  }
  static {
    this.mouse_x = 0;
  }
  static {
    this.mouse_y = 0;
  }
  static {
    this.mouse_button = mb_none;
  }
  static {
    this.mouse_lastbutton = mb_none;
  }
  static {
    this._wheel_up = false;
  }
  static {
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
    this.room_delta = 0;
  }
  static {
    this.last_delta = 0;
  }
  static {
    this.accumulator = 0;
  }
  static {
    this.room = null;
  }
  static {
    this.room_first = -1;
  }
  static {
    this.room_last = 0;
  }
  static {
    this._canvas = null;
  }
  static {
    this.update_events = /* @__PURE__ */ new Map();
  }
  static {
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
    const createEvents = [...this.update_events.get(
      "CREATE"
      /* create */
    ) ?? []];
    this.update_events.set("CREATE", []);
    createEvents.forEach((e) => e.run());
    this.update_events.get(
      "STEP_BEGIN"
      /* step_begin */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "STEP"
      /* step */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "STEP_END"
      /* step_end */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "COLLISION"
      /* collision */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "KEYBOARD"
      /* keyboard */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "MOUSE"
      /* mouse */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "OTHER"
      /* other */
    )?.forEach((e) => e.run());
    this.update_events.get(
      "ASYNC"
      /* async */
    )?.forEach((e) => e.run());
    const destroyEvents = [...this.update_events.get(
      "DESTROY"
      /* destroy */
    ) ?? []];
    this.update_events.set("DESTROY", []);
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
    this.draw_events.get(
      "DRAW"
      /* draw */
    )?.forEach((e) => e.run());
    this.draw_events.get(
      "DRAW_GUI"
      /* draw_gui */
    )?.forEach((e) => e.run());
    _end_frame?.();
  }
  /**
   * Registers a function to be called for a specific event type.
   * @param event - The event type to register for
   * @param func - The function to call when the event fires
   */
  static register(event, func) {
    const targetMap = event === "DRAW" || event === "DRAW_GUI" ? this.draw_events : this.update_events;
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
    const targetMap = event === "DRAW" || event === "DRAW_GUI" ? this.draw_events : this.update_events;
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
    this.x = 0;
    this.y = 0;
    this.xprevious = 0;
    this.yprevious = 0;
    this.xstart = 0;
    this.ystart = 0;
    this.hspeed = 0;
    this.vspeed = 0;
    this.speed = 0;
    this.direction = 0;
    this.friction = 0;
    this.gravity = 0;
    this.gravity_direction = 270;
    this.sprite_index = -1;
    this.image_index = 0;
    this.image_speed = 1;
    this.image_xscale = 1;
    this.image_yscale = 1;
    this.image_angle = 0;
    this.image_alpha = 1;
    this.image_blend = 16777215;
    this.depth = 0;
    this.visible = true;
    this.mask_index = -1;
    this.solid = false;
    this.persistent = false;
    this.active = true;
    this.bbox_left = 0;
    this.bbox_top = 0;
    this.bbox_right = 0;
    this.bbox_bottom = 0;
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
    game_loop.register("CREATE", inst.on_create.bind(inst));
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
    game_loop.register("DESTROY", this.on_destroy.bind(this));
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
    game_loop.register("STEP_BEGIN", this._bound_step_begin);
    game_loop.register("STEP", this._bound_step);
    game_loop.register("STEP_END", this._bound_step_end);
    game_loop.register("DRAW", this._bound_draw);
    game_loop.register("DRAW_GUI", this._bound_draw_gui);
  }
  /**
   * Unregisters this instance's event handlers from the game loop.
   */
  unregister_events() {
    game_loop.unregister("STEP_BEGIN", this._bound_step_begin);
    game_loop.unregister("STEP", this._bound_step);
    game_loop.unregister("STEP_END", this._bound_step_end);
    game_loop.unregister("DRAW", this._bound_draw);
    game_loop.unregister("DRAW_GUI", this._bound_draw_gui);
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
var gm_object = class extends instance {
  static {
    this.default_sprite = null;
  }
  static {
    this.parent = null;
  }
  static {
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
  add_quad(x, y, w, h, u0, v0, u1, v1, r2, g, b, a, texture) {
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
    verts[base + 4] = r2;
    verts[base + 5] = g;
    verts[base + 6] = b;
    verts[base + 7] = a;
    verts[base + 8] = x;
    verts[base + 9] = y + h;
    verts[base + 10] = u0;
    verts[base + 11] = v1;
    verts[base + 12] = r2;
    verts[base + 13] = g;
    verts[base + 14] = b;
    verts[base + 15] = a;
    verts[base + 16] = x + w;
    verts[base + 17] = y;
    verts[base + 18] = u1;
    verts[base + 19] = v0;
    verts[base + 20] = r2;
    verts[base + 21] = g;
    verts[base + 22] = b;
    verts[base + 23] = a;
    verts[base + 24] = x + w;
    verts[base + 25] = y;
    verts[base + 26] = u1;
    verts[base + 27] = v0;
    verts[base + 28] = r2;
    verts[base + 29] = g;
    verts[base + 30] = b;
    verts[base + 31] = a;
    verts[base + 32] = x;
    verts[base + 33] = y + h;
    verts[base + 34] = u0;
    verts[base + 35] = v1;
    verts[base + 36] = r2;
    verts[base + 37] = g;
    verts[base + 38] = b;
    verts[base + 39] = a;
    verts[base + 40] = x + w;
    verts[base + 41] = y + h;
    verts[base + 42] = u1;
    verts[base + 43] = v1;
    verts[base + 44] = r2;
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
  add_quad_transformed(cx, cy, w, h, ox, oy, xscale, yscale, angle_deg, u0, v0, u1, v1, r2, g, b, a, texture) {
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
      verts[off + 4] = r2;
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
var texture_manager = class {
  constructor(gl) {
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
var c_black = 0;
var c_white = 16777215;
var bm_normal = 0;
function make_color_rgb(r2, g, b) {
  r2 = Math.max(0, Math.min(255, Math.round(r2)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return b << 16 | g << 8 | r2;
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
function color_to_rgb_normalized(col) {
  return [
    color_get_red(col) / 255,
    color_get_green(col) / 255,
    color_get_blue(col) / 255
  ];
}
var renderer = class {
  static {
    this.projection_loc = null;
  }
  static {
    this.active_proj_loc = null;
  }
  static {
    this.draw_color = 16777215;
  }
  static {
    this.draw_alpha = 1;
  }
  static {
    this.blend_mode = bm_normal;
  }
  static {
    this.current_font = new font_resource("Arial", 16);
  }
  static {
    this.halign = 0;
  }
  static {
    this.valign = 0;
  }
  static {
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
  static begin_frame(r2 = 0, g = 0, b = 0) {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(r2, g, b, 1);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(
      x - spr.xoffset,
      y - spr.yoffset,
      frame.width,
      frame.height,
      0,
      0,
      1,
      1,
      r2,
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
    const [r2, g, b] = color_to_rgb_normalized(color);
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
      r2,
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(x, y, width, height, u0, v0, u1, v1, r2, g, b, this.draw_alpha, frame.texture.texture);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(x, y, w, h, 0, 0, 1, 1, r2, g, b, this.draw_alpha, frame.texture.texture);
  }
  /**
   * Draws a surface as if it were a sprite.
   * @param surf - Surface to draw
   * @param x - Destination X
   * @param y - Destination Y
   */
  static draw_surface(surf, x, y) {
    if (!surf.valid) return;
    const [r2, g, b] = color_to_rgb_normalized(16777215);
    this.batch.add_quad(x, y, surf.width, surf.height, 0, 1, 1, 0, r2, g, b, this.draw_alpha, surf.texture);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    const color_css = `rgb(${Math.round(r2 * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
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
    const [r2, g, b] = color_to_rgb_normalized(col);
    const gl = this.gl;
    this.batch.flush();
    gl.clearColor(r2, g, b, 1);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      this.batch.add_quad(x1, y1, x2 - x1, y2 - y1, 0, 0, 1, 1, r2, g, b, a, wp);
    } else {
      const t = 1;
      this.batch.add_quad(x1, y1, x2 - x1, t, 0, 0, 1, 1, r2, g, b, a, wp);
      this.batch.add_quad(x1, y2 - t, x2 - x1, t, 0, 0, 1, 1, r2, g, b, a, wp);
      this.batch.add_quad(x1, y1 + t, t, y2 - y1 - 2, 0, 0, 1, 1, r2, g, b, a, wp);
      this.batch.add_quad(x2 - t, y1 + t, t, y2 - y1 - 2, 0, 0, 1, 1, r2, g, b, a, wp);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
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
        this.draw_triangle_internal(cx, cy, x0, y0, x1, y1, r2, g, b, a, wp);
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
        this.draw_line_width_internal(x0, y0, x1, y1, thickness, r2, g, b, a, wp);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    this.draw_line_width_internal(x1, y1, x2, y2, 1, r2, g, b, this.draw_alpha, this.tex_mgr.white_pixel);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    this.draw_line_width_internal(x1, y1, x2, y2, w, r2, g, b, this.draw_alpha, this.tex_mgr.white_pixel);
  }
  /**
   * Draws a single point (1×1 pixel) at the given position.
   * @param x - X position
   * @param y - Y position
   */
  static draw_point(x, y) {
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    this.batch.add_quad(x, y, 1, 1, 0, 0, 1, 1, r2, g, b, this.draw_alpha, this.tex_mgr.white_pixel);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      this.draw_triangle_internal(x1, y1, x2, y2, x3, y3, r2, g, b, a, wp);
    } else {
      this.draw_line_width_internal(x1, y1, x2, y2, 1, r2, g, b, a, wp);
      this.draw_line_width_internal(x2, y2, x3, y3, 1, r2, g, b, a, wp);
      this.draw_line_width_internal(x3, y3, x1, y1, 1, r2, g, b, a, wp);
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
    const [r2, g, b] = color_to_rgb_normalized(this.draw_color);
    const a = this.draw_alpha;
    const wp = this.tex_mgr.white_pixel;
    if (!outline) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = i / SEGMENTS * Math.PI * 2;
        const a1 = (i + 1) / SEGMENTS * Math.PI * 2;
        const px0 = cx + Math.cos(a0) * rx, py0 = cy + Math.sin(a0) * ry;
        const px1 = cx + Math.cos(a1) * rx, py1 = cy + Math.sin(a1) * ry;
        this.draw_triangle_internal(cx, cy, px0, py0, px1, py1, r2, g, b, a, wp);
      }
    } else {
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = i / SEGMENTS * Math.PI * 2;
        const a1 = (i + 1) / SEGMENTS * Math.PI * 2;
        const px0 = cx + Math.cos(a0) * rx, py0 = cy + Math.sin(a0) * ry;
        const px1 = cx + Math.cos(a1) * rx, py1 = cy + Math.sin(a1) * ry;
        this.draw_line_width_internal(px0, py0, px1, py1, 1, r2, g, b, a, wp);
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
  static draw_triangle_internal(x0, y0, x1, y1, x2, y2, r2, g, b, a, texture) {
    const minX = Math.min(x0, x1, x2);
    const maxX = Math.max(x0, x1, x2);
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    const w = maxX - minX;
    const h = maxY - minY;
    if (w < 0.5 || h < 0.5) return;
    this.batch.add_quad(minX, minY, w, h, 0, 0, 1, 1, r2, g, b, a, texture);
  }
  /**
   * Draws a line as a thin rectangular quad aligned to the line direction.
   */
  static draw_line_width_internal(x1, y1, x2, y2, width, r2, g, b, a, texture) {
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
    this.batch.add_quad(minX, minY, maxX - minX, maxY - minY, 0, 0, 1, 1, r2, g, b, a, texture);
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
function draw_set_color(col) {
  renderer.set_color(col);
}
function draw_rectangle(x1, y1, x2, y2, outline) {
  renderer.draw_rectangle(x1, y1, x2, y2, outline);
}
function draw_circle(x, y, r2, outline) {
  renderer.draw_circle(x, y, r2, outline);
}
function draw_text(x, y, text) {
  renderer.draw_text(x, y, String(text));
}
var audio_system = class {
  static {
    this._ctx = null;
  }
  static {
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
var _stop_group_cb = null;
function set_stop_group_callback(cb) {
  _stop_group_cb = cb;
}
set_stop_group_callback((group_name) => {
  for (const [id, name] of _instance_groups) {
    if (name === group_name) _instances.get(id)?.stop();
  }
});
var _instances = /* @__PURE__ */ new Map();
var _instance_groups = /* @__PURE__ */ new Map();
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
var _stack = [mat4_identity()];
var _current = _stack[0];
var d3d_lighttype_directional = 0;
var MAX_LIGHTS = 8;
function _default_light() {
  return { enabled: false, type: d3d_lighttype_directional, x: 0, y: 0, z: -1, r: 1, g: 1, b: 1, range: 100 };
}
var _lights = Array.from({ length: MAX_LIGHTS }, _default_light);
var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;

// ../../Silkweaver/_entry.ts
var obj_platform = class extends gm_object {
  static object_name = "obj_platform";
  on_create() {
    this.pw = 96;
    this.ph = 24;
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + 96;
    this.bbox_bottom = this.y + 24;
  }
  on_step() {
    const pw = this.pw;
    const ph = this.ph;
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + pw;
    this.bbox_bottom = this.y + ph;
  }
  on_draw() {
    const pw = this.pw;
    const ph = this.ph;
    draw_set_color(make_color_rgb(60, 140, 60));
    draw_rectangle(this.x, this.y, this.x + pw, this.y + ph, false);
    draw_set_color(make_color_rgb(100, 200, 100));
    draw_rectangle(this.x, this.y, this.x + pw, this.y + ph, true);
  }
};
var obj_coin = class extends gm_object {
  static object_name = "obj_coin";
  on_create() {
    ;
    this.cr = 8;
    this.bbox_left = this.x - 8;
    this.bbox_top = this.y - 8;
    this.bbox_right = this.x + 8;
    this.bbox_bottom = this.y + 8;
  }
  on_step() {
    this.bbox_left = this.x - 8;
    this.bbox_top = this.y - 8;
    this.bbox_right = this.x + 8;
    this.bbox_bottom = this.y + 8;
  }
  on_draw() {
    draw_set_color(make_color_rgb(255, 215, 0));
    draw_circle(this.x, this.y, 8, false);
    draw_set_color(make_color_rgb(255, 165, 0));
    draw_circle(this.x, this.y, 8, true);
  }
};
var obj_enemy = class extends gm_object {
  static object_name = "obj_enemy";
  on_create() {
    ;
    this.ew = 32;
    this.eh = 32;
    this.patrol_left = this.x - 80;
    this.patrol_right = this.x + 80;
    this.hspeed = 1.5;
  }
  on_step() {
    const ew = this.ew;
    const eh = this.eh;
    const pl = this.patrol_left;
    const pr = this.patrol_right;
    if (this.x <= pl) {
      this.x = pl;
      this.hspeed = 1.5;
    }
    if (this.x + ew >= pr) {
      this.x = pr - ew;
      this.hspeed = -1.5;
    }
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + ew;
    this.bbox_bottom = this.y + eh;
  }
  on_draw() {
    const ew = this.ew;
    const eh = this.eh;
    draw_set_color(make_color_rgb(200, 50, 50));
    draw_rectangle(this.x, this.y, this.x + ew, this.y + eh, false);
    draw_set_color(make_color_rgb(255, 255, 255));
    const eye_y = this.y + 8;
    if (this.hspeed > 0) {
      draw_circle(this.x + 22, eye_y, 5, false);
      draw_set_color(make_color_rgb(0, 0, 0));
      draw_circle(this.x + 23, eye_y, 2, false);
    } else {
      draw_circle(this.x + 10, eye_y, 5, false);
      draw_set_color(make_color_rgb(0, 0, 0));
      draw_circle(this.x + 9, eye_y, 2, false);
    }
  }
};
var obj_player = class extends gm_object {
  static object_name = "obj_player";
  on_create() {
    ;
    this.pw = 28;
    this.ph = 40;
    this.on_ground = false;
    this.score = 0;
    this.dead = false;
    this.gravity = 0;
  }
  on_step() {
    if (this.dead) return;
    const pw = this.pw;
    const ph = this.ph;
    const platforms = [];
    for (const other of this.room.instance_get_all()) {
      if (other === this || !other.active || !other.solid) continue;
      platforms.push({
        left: other.bbox_left,
        top: other.bbox_top,
        right: other.bbox_right,
        bottom: other.bbox_bottom
      });
    }
    function bbox_overlap_check(xl, yt, xr, yb, p) {
      return xl < p.right && xr > p.left && yt < p.bottom && yb > p.top;
    }
    {
      const xl = this.x, yt = this.y + 2, xr = this.x + pw, yb = this.y + ph - 2;
      for (const p of platforms) {
        if (bbox_overlap_check(xl, yt, xr, yb, p)) {
          if (this.hspeed > 0) this.x = p.left - pw;
          else if (this.hspeed < 0) this.x = p.right;
          this.hspeed = 0;
          break;
        }
      }
    }
    ;
    this.on_ground = false;
    {
      const xl = this.x + 2, yt = this.y, xr = this.x + pw - 2, yb = this.y + ph;
      for (const p of platforms) {
        if (bbox_overlap_check(xl, yt, xr, yb, p)) {
          if (this.vspeed > 0) {
            this.y = p.top - ph;
            this.on_ground = true;
          } else {
            this.y = p.bottom;
          }
          this.vspeed = 0;
          break;
        }
      }
    }
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + pw;
    this.bbox_bottom = this.y + ph;
    if (this.x < 0) {
      this.x = 0;
      this.hspeed = 0;
    }
    if (this.x + pw > this.room.room_width) {
      this.x = this.room.room_width - pw;
      this.hspeed = 0;
    }
    if (this.y > this.room.room_height + 64) {
      this.x = this.xstart;
      this.y = this.ystart;
      this.vspeed = 0;
      this.hspeed = 0;
    }
    const move_spd = 3;
    if (keyboard_check(vk_left)) this.hspeed = -move_spd;
    else if (keyboard_check(vk_right)) this.hspeed = move_spd;
    else this.hspeed = 0;
    if (keyboard_check_pressed(vk_space) && this.on_ground) {
      this.vspeed = -10;
    }
    if (!this.on_ground) {
      this.vspeed += 0.5;
      if (this.vspeed > 12) this.vspeed = 12;
    }
    for (const other of this.room.instance_get_all()) {
      if (!other.active) continue;
      if (!(other instanceof obj_coin)) continue;
      if (this.bbox_left < other.bbox_right && this.bbox_right > other.bbox_left && this.bbox_top < other.bbox_bottom && this.bbox_bottom > other.bbox_top) {
        ;
        this.score = this.score + 1;
        other.instance_destroy();
      }
    }
    for (const other of this.room.instance_get_all()) {
      if (!other.active) continue;
      if (!(other instanceof obj_enemy)) continue;
      if (this.bbox_left < other.bbox_right && this.bbox_right > other.bbox_left && this.bbox_top < other.bbox_bottom && this.bbox_bottom > other.bbox_top) {
        if (this.vspeed >= 0 && this.bbox_bottom <= other.bbox_top + 12) {
          other.instance_destroy();
          this.vspeed = -7;
        } else {
          ;
          this.score = 0;
          this.x = this.xstart;
          this.y = this.ystart;
          this.hspeed = 0;
          this.vspeed = 0;
        }
      }
    }
  }
  on_draw() {
    const pw = this.pw;
    const ph = this.ph;
    const score = this.score;
    draw_set_color(make_color_rgb(60, 100, 220));
    draw_rectangle(this.x, this.y, this.x + pw, this.y + ph, false);
    draw_set_color(make_color_rgb(100, 150, 240));
    draw_rectangle(this.x + 4, this.y, this.x + pw - 4, this.y + 16, false);
    draw_set_color(c_white);
    draw_circle(this.x + 8, this.y + 6, 3, false);
    draw_circle(this.x + 20, this.y + 6, 3, false);
    draw_set_color(c_black);
    draw_circle(this.x + 9, this.y + 7, 1, false);
    draw_circle(this.x + 21, this.y + 7, 1, false);
    draw_set_color(c_white);
    draw_text(8, 8, "Coins: " + String(score));
  }
};
async function init(canvas) {
  renderer.init(canvas, 640, 480);
  game_loop.init_input(canvas);
  const _room_room_level1 = new room();
  _room_room_level1.room_width = 640;
  _room_room_level1.room_height = 480;
  _room_room_level1.room_speed = 60;
  _room_room_level1.room_persistent = false;
  const _inst_obj_platform_0 = new obj_platform(r);
  r.room_instance_add(0, 448, _inst_obj_platform_0);
  _inst_obj_platform_0.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_0.on_create.bind(_inst_obj_platform_0));
  const _inst_obj_platform_1 = new obj_platform(r);
  r.room_instance_add(96, 448, _inst_obj_platform_1);
  _inst_obj_platform_1.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_1.on_create.bind(_inst_obj_platform_1));
  const _inst_obj_platform_2 = new obj_platform(r);
  r.room_instance_add(192, 448, _inst_obj_platform_2);
  _inst_obj_platform_2.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_2.on_create.bind(_inst_obj_platform_2));
  const _inst_obj_platform_3 = new obj_platform(r);
  r.room_instance_add(288, 448, _inst_obj_platform_3);
  _inst_obj_platform_3.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_3.on_create.bind(_inst_obj_platform_3));
  const _inst_obj_platform_4 = new obj_platform(r);
  r.room_instance_add(384, 448, _inst_obj_platform_4);
  _inst_obj_platform_4.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_4.on_create.bind(_inst_obj_platform_4));
  const _inst_obj_platform_5 = new obj_platform(r);
  r.room_instance_add(480, 448, _inst_obj_platform_5);
  _inst_obj_platform_5.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_5.on_create.bind(_inst_obj_platform_5));
  const _inst_obj_platform_6 = new obj_platform(r);
  r.room_instance_add(544, 448, _inst_obj_platform_6);
  _inst_obj_platform_6.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_6.on_create.bind(_inst_obj_platform_6));
  const _inst_obj_platform_7 = new obj_platform(r);
  r.room_instance_add(100, 360, _inst_obj_platform_7);
  _inst_obj_platform_7.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_7.on_create.bind(_inst_obj_platform_7));
  const _inst_obj_platform_8 = new obj_platform(r);
  r.room_instance_add(196, 360, _inst_obj_platform_8);
  _inst_obj_platform_8.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_8.on_create.bind(_inst_obj_platform_8));
  const _inst_obj_platform_9 = new obj_platform(r);
  r.room_instance_add(300, 280, _inst_obj_platform_9);
  _inst_obj_platform_9.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_9.on_create.bind(_inst_obj_platform_9));
  const _inst_obj_platform_10 = new obj_platform(r);
  r.room_instance_add(470, 320, _inst_obj_platform_10);
  _inst_obj_platform_10.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_10.on_create.bind(_inst_obj_platform_10));
  const _inst_obj_platform_11 = new obj_platform(r);
  r.room_instance_add(185, 220, _inst_obj_platform_11);
  _inst_obj_platform_11.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_11.on_create.bind(_inst_obj_platform_11));
  const _inst_obj_platform_12 = new obj_platform(r);
  r.room_instance_add(390, 190, _inst_obj_platform_12);
  _inst_obj_platform_12.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_12.on_create.bind(_inst_obj_platform_12));
  const _inst_obj_coin_13 = new obj_coin(r);
  r.room_instance_add(148, 330, _inst_obj_coin_13);
  _inst_obj_coin_13.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_13.on_create.bind(_inst_obj_coin_13));
  const _inst_obj_coin_14 = new obj_coin(r);
  r.room_instance_add(244, 330, _inst_obj_coin_14);
  _inst_obj_coin_14.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_14.on_create.bind(_inst_obj_coin_14));
  const _inst_obj_coin_15 = new obj_coin(r);
  r.room_instance_add(348, 250, _inst_obj_coin_15);
  _inst_obj_coin_15.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_15.on_create.bind(_inst_obj_coin_15));
  const _inst_obj_coin_16 = new obj_coin(r);
  r.room_instance_add(233, 190, _inst_obj_coin_16);
  _inst_obj_coin_16.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_16.on_create.bind(_inst_obj_coin_16));
  const _inst_obj_coin_17 = new obj_coin(r);
  r.room_instance_add(438, 160, _inst_obj_coin_17);
  _inst_obj_coin_17.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_17.on_create.bind(_inst_obj_coin_17));
  const _inst_obj_coin_18 = new obj_coin(r);
  r.room_instance_add(518, 290, _inst_obj_coin_18);
  _inst_obj_coin_18.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_18.on_create.bind(_inst_obj_coin_18));
  const _inst_obj_enemy_19 = new obj_enemy(r);
  r.room_instance_add(310, 248, _inst_obj_enemy_19);
  _inst_obj_enemy_19.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_enemy_19.on_create.bind(_inst_obj_enemy_19));
  const _inst_obj_player_20 = new obj_player(r);
  r.room_instance_add(50, 396, _inst_obj_player_20);
  _inst_obj_player_20.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_player_20.on_create.bind(_inst_obj_player_20));
  const start = _room_room_level1;
  if (!start) {
    console.error("[Game] No rooms defined.");
    return;
  }
  game_loop.start(start);
}
export {
  init as default,
  obj_coin,
  obj_enemy,
  obj_platform,
  obj_player
};
