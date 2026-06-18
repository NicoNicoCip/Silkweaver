var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// packages/engine/dist/core/game_event.js
var EVENT_TYPE, game_event;
var init_game_event = __esm({
  "packages/engine/dist/core/game_event.js"() {
    "use strict";
    init_engine_globals();
    (function(EVENT_TYPE2) {
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
      EVENT_TYPE2["draw_begin"] = "DRAW_BEGIN";
      EVENT_TYPE2["draw"] = "DRAW";
      EVENT_TYPE2["draw_end"] = "DRAW_END";
      EVENT_TYPE2["draw_gui"] = "DRAW_GUI";
    })(EVENT_TYPE || (EVENT_TYPE = {}));
    game_event = class {
      /**
       * Creates a new game event.
       * @param event - The function to call when the event fires
       * @param type - The event type category
       */
      constructor(event = () => {
      }, type = EVENT_TYPE.none) {
        this.event = () => {
        };
        this.type = EVENT_TYPE.none;
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
  }
});

// packages/engine/dist/core/resource.js
var resource;
var init_resource = __esm({
  "packages/engine/dist/core/resource.js"() {
    "use strict";
    init_engine_globals();
    resource = class _resource {
      /**
       * Increments and returns the next available resource ID.
       * @returns The next unique resource ID
       */
      incrementID() {
        return _resource.gid++;
      }
      constructor() {
        this.id = this.incrementID();
        this.name = this.constructor.name;
        _resource.all.set(this.id, this);
      }
      static removeByID(id) {
        _resource.all.delete(id);
      }
      static findByID(id) {
        return _resource.all.get(id);
      }
    };
    resource.gid = 0;
    resource.all = /* @__PURE__ */ new Map();
  }
});

// packages/engine/dist/core/room.js
var room;
var init_room = __esm({
  "packages/engine/dist/core/room.js"() {
    "use strict";
    init_engine_globals();
    init_game_event();
    init_game_loop();
    init_resource();
    room = class _room extends resource {
      constructor() {
        super();
        this.room_width = 640;
        this.room_height = 480;
        this.room_caption = `Room ${this.id}`;
        this.room_speed = 60;
        this.room_persistent = false;
        this.room_previous = 0;
        this.room_next = 0;
        this.creation_code = null;
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
        this.background_stretch = [];
        this.background_show_color = true;
        this.background_solid_color = 0;
        this._bg_scroll_x = [];
        this._bg_scroll_y = [];
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
          game_loop.register(EVENT_TYPE.create, inst.on_create.bind(inst));
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
      room_tile_add(x, y, background2, left, top, width, height, depth) {
        return this.tile_add(background2, left, top, width, height, x, y, depth);
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
      room_tile_add_ext(x, y, background2, left, top, width, height, depth, xscale, yscale, alpha) {
        const id = _room.next_tile_id++;
        this.tiles.push({
          id,
          x,
          y,
          background: background2,
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
      /**
       * Returns the room's tile list (used by the renderer to draw tile layers).
       * @returns The array of tiles in this room
       */
      get_tiles() {
        return this.tiles;
      }
      tile_add(background2, left, top, width, height, x, y, depth) {
        const id = _room.next_tile_id++;
        this.tiles.push({
          id,
          x,
          y,
          background: background2,
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
        if (index === -1)
          return false;
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
        if (tile)
          tile.depth = depth;
      }
      /**
       * Sets the visibility of a tile.
       * @param id - The tile ID
       * @param visible - Whether the tile should be visible
       */
      tile_set_visible(id, visible) {
        const tile = this.tiles.find((t) => t.id === id);
        if (tile)
          tile.visible = visible;
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
        if (tile)
          tile.alpha = alpha;
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
      tile_set_background(id, background2, left, top, width, height) {
        const tile = this.tiles.find((t) => t.id === id);
        if (tile) {
          tile.background = background2;
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
        const tile = this.tiles.find((t) => t.depth === depth && x >= t.x && x < t.x + t.width * t.xscale && y >= t.y && y < t.y + t.height * t.yscale);
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
      room_set_background(index, visible, foreground, background2, x, y, htiled, vtiled, hspeed, vspeed) {
        this.background_visible[index] = visible;
        this.background_foreground[index] = foreground;
        this.background_index[index] = background2;
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
    room.next_tile_id = 0;
  }
});

// packages/engine/dist/input/keyboard.js
function keyboard_check(key) {
  return keyboard_manager.check(key);
}
function keyboard_check_pressed(key) {
  return keyboard_manager.check_pressed(key);
}
function keyboard_check_released(key) {
  return keyboard_manager.check_released(key);
}
var vk_nokey, vk_anykey, vk_space, vk_left, vk_right, keyboard_manager;
var init_keyboard = __esm({
  "packages/engine/dist/input/keyboard.js"() {
    "use strict";
    init_engine_globals();
    vk_nokey = 0;
    vk_anykey = 1;
    vk_space = 32;
    vk_left = 37;
    vk_right = 39;
    keyboard_manager = class {
      /**
       * Attaches keyboard listeners to the window.
       * Called once by input_manager.init().
       */
      static attach() {
        if (this._attached)
          return;
        window.addEventListener("keydown", this._on_keydown);
        window.addEventListener("keyup", this._on_keyup);
        window.addEventListener("keypress", this._on_keypress);
        this._attached = true;
      }
      /**
       * Detaches keyboard listeners from the window.
       */
      static detach() {
        if (!this._attached)
          return;
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
        if (key === vk_anykey)
          return this._held.size > 0;
        if (key === vk_nokey)
          return this._held.size === 0;
        return this._held.has(key);
      }
      /** Returns true if the key was pressed this step. */
      static check_pressed(key) {
        if (key === vk_anykey)
          return this._pressed.size > 0;
        if (key === vk_nokey)
          return false;
        return this._pressed.has(key);
      }
      /** Returns true if the key was released this step. */
      static check_released(key) {
        if (key === vk_anykey)
          return this._released.size > 0;
        if (key === vk_nokey)
          return false;
        return this._released.has(key);
      }
      /** Clears the held/pressed/released state for a specific key. */
      static clear(key) {
        this._held.delete(key);
        this._pressed.delete(key);
        this._released.delete(key);
      }
      /** Clears all keyboard state (held + pressed + released). */
      static clear_all() {
        this._held.clear();
        this._pressed.clear();
        this._released.clear();
      }
      /** Simulates pressing a key. */
      static key_press(key) {
        if (!this._held.has(key))
          this._pressed.add(key);
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
    keyboard_manager._held = /* @__PURE__ */ new Set();
    keyboard_manager._pressed = /* @__PURE__ */ new Set();
    keyboard_manager._released = /* @__PURE__ */ new Set();
    keyboard_manager._key_map = /* @__PURE__ */ new Map();
    keyboard_manager.keyboard_key = vk_nokey;
    keyboard_manager.keyboard_lastkey = vk_nokey;
    keyboard_manager.keyboard_lastchar = "";
    keyboard_manager.keyboard_string = "";
    keyboard_manager._attached = false;
    keyboard_manager._on_keydown = (e) => keyboard_manager._handle_down(e);
    keyboard_manager._on_keyup = (e) => keyboard_manager._handle_up(e);
    keyboard_manager._on_keypress = (e) => keyboard_manager._handle_press(e);
  }
});

// packages/engine/dist/input/mouse.js
function mouse_check_button_pressed(button) {
  return mouse_manager.check_pressed(button);
}
function mouse_check_button_released(button) {
  return mouse_manager.check_released(button);
}
function window_mouse_get_x() {
  return mouse_manager.window_x;
}
function window_mouse_get_y() {
  return mouse_manager.window_y;
}
var mb_none, mb_left, mb_right, mb_middle, mb_any, mouse_manager;
var init_mouse = __esm({
  "packages/engine/dist/input/mouse.js"() {
    "use strict";
    init_engine_globals();
    mb_none = 0;
    mb_left = 1;
    mb_right = 2;
    mb_middle = 3;
    mb_any = 4;
    mouse_manager = class {
      /**
       * Attaches mouse listeners to a canvas element.
       * @param canvas - The game canvas
       */
      static attach(canvas) {
        if (this._attached)
          return;
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
        if (!this._attached || !this._canvas)
          return;
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
        if (btn === mb_none)
          return;
        if (!this._held.has(btn))
          this._pressed.add(btn);
        this._held.add(btn);
        this.mouse_lastbutton = this.mouse_button;
        this.mouse_button = btn;
        this._update_position(e);
      }
      static _handle_up(e) {
        const btn = this._get_button(e);
        if (btn === mb_none)
          return;
        this._held.delete(btn);
        this._released.add(btn);
        if (this._held.size === 0)
          this.mouse_button = mb_none;
        this._update_position(e);
      }
      static _handle_move(e) {
        this._update_position(e);
      }
      static _handle_wheel(e) {
        if (e.deltaY < 0)
          this._wheel_up = true;
        else
          this._wheel_down = true;
      }
      static _update_position(e) {
        if (!this._canvas)
          return;
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
        if (btn === mb_any)
          return this._held.size > 0;
        if (btn === mb_none)
          return this._held.size === 0;
        return this._held.has(btn);
      }
      /** Returns true if button was pressed this step. */
      static check_pressed(btn) {
        if (btn === mb_any)
          return this._pressed.size > 0;
        if (btn === mb_none)
          return false;
        return this._pressed.has(btn);
      }
      /** Returns true if button was released this step. */
      static check_released(btn) {
        if (btn === mb_any)
          return this._released.size > 0;
        if (btn === mb_none)
          return false;
        return this._released.has(btn);
      }
      /** Clears state for a specific button. */
      static clear(btn) {
        this._held.delete(btn);
        this._pressed.delete(btn);
        this._released.delete(btn);
      }
      /** Clears all mouse button + wheel state. */
      static clear_all() {
        this._held.clear();
        this._pressed.clear();
        this._released.clear();
        this._wheel_up = false;
        this._wheel_down = false;
        this.mouse_button = mb_none;
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
    mouse_manager._held = /* @__PURE__ */ new Set();
    mouse_manager._pressed = /* @__PURE__ */ new Set();
    mouse_manager._released = /* @__PURE__ */ new Set();
    mouse_manager._canvas = null;
    mouse_manager.window_x = 0;
    mouse_manager.window_y = 0;
    mouse_manager.mouse_x = 0;
    mouse_manager.mouse_y = 0;
    mouse_manager.mouse_button = mb_none;
    mouse_manager.mouse_lastbutton = mb_none;
    mouse_manager._wheel_up = false;
    mouse_manager._wheel_down = false;
    mouse_manager._attached = false;
    mouse_manager._on_mousedown = (e) => mouse_manager._handle_down(e);
    mouse_manager._on_mouseup = (e) => mouse_manager._handle_up(e);
    mouse_manager._on_mousemove = (e) => mouse_manager._handle_move(e);
    mouse_manager._on_wheel = (e) => mouse_manager._handle_wheel(e);
    mouse_manager._on_contextmenu = (e) => e.preventDefault();
  }
});

// packages/engine/dist/input/gamepad.js
var BUTTON_THRESHOLD, gamepad_manager;
var init_gamepad = __esm({
  "packages/engine/dist/input/gamepad.js"() {
    "use strict";
    init_engine_globals();
    BUTTON_THRESHOLD = 0.5;
    gamepad_manager = class {
      /**
       * Polls the Gamepad API and refreshes all state snapshots.
       * Must be called every step before gamepad functions are queried.
       */
      static poll() {
        if (!navigator.getGamepads)
          return;
        const pads = navigator.getGamepads();
        for (let i = 0; i < pads.length; i++) {
          const pad = pads[i];
          const prev = this._states.get(i);
          if (!pad) {
            if (prev)
              prev.connected = false;
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
        if (!state?.connected)
          return 0;
        return state.axes[axis] ?? 0;
      }
      /** Returns the number of buttons on device. */
      static button_count(device) {
        return this._states.get(device)?.buttons_held.length ?? 0;
      }
      /** Returns true if button is currently held. */
      static button_check(device, button) {
        const state = this._states.get(device);
        if (!state?.connected)
          return false;
        return state.buttons_held[button] ?? false;
      }
      /** Returns true if button was pressed this step (was up last step, down now). */
      static button_check_pressed(device, button) {
        const state = this._states.get(device);
        if (!state?.connected)
          return false;
        return (state.buttons_held[button] ?? false) && !(state.buttons_prev[button] ?? false);
      }
      /** Returns true if button was released this step. */
      static button_check_released(device, button) {
        const state = this._states.get(device);
        if (!state?.connected)
          return false;
        return !(state.buttons_held[button] ?? false) && (state.buttons_prev[button] ?? false);
      }
      /**
       * Returns the analog button value (0 to 1) for triggers or 0/1 for digital buttons.
       * @param device - Gamepad index
       * @param button - Button index
       */
      static button_value(device, button) {
        if (!navigator.getGamepads)
          return 0;
        const pad = navigator.getGamepads()[device];
        if (!pad)
          return 0;
        return pad.buttons[button]?.value ?? 0;
      }
      /**
       * Sets controller vibration (rumble).
       * @param device - Gamepad index
       * @param left - Left motor strength (0–1)
       * @param right - Right motor strength (0–1)
       */
      static set_vibration(device, left, right) {
        if (!navigator.getGamepads)
          return;
        const pad = navigator.getGamepads()[device];
        if (!pad)
          return;
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
    gamepad_manager._states = /* @__PURE__ */ new Map();
  }
});

// packages/engine/dist/input/touch.js
function make_touch_point() {
  return { x: 0, y: 0, held: false, pressed: false, released: false };
}
var MAX_TOUCH_POINTS, touch_manager;
var init_touch = __esm({
  "packages/engine/dist/input/touch.js"() {
    "use strict";
    init_engine_globals();
    MAX_TOUCH_POINTS = 11;
    touch_manager = class {
      /**
       * Attaches touch listeners to a canvas element.
       * @param canvas - The canvas receiving touch events
       */
      static attach(canvas) {
        if (this._attached)
          return;
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
        if (!this._attached || !this._canvas)
          return;
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
        if (!this._canvas)
          return { x: touch.clientX, y: touch.clientY };
        const rect = this._canvas.getBoundingClientRect();
        const sx = this._canvas.width / rect.width;
        const sy = this._canvas.height / rect.height;
        return {
          x: (touch.clientX - rect.left) * sx,
          y: (touch.clientY - rect.top) * sy
        };
      }
      static _alloc_slot(id) {
        if (this._id_to_slot.has(id))
          return this._id_to_slot.get(id);
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
          if (!t)
            continue;
          const slot = this._alloc_slot(t.identifier);
          if (slot < 0)
            continue;
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
          if (!t)
            continue;
          const slot = this._free_slot(t.identifier);
          if (slot < 0)
            continue;
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
          if (!t)
            continue;
          const slot = this._id_to_slot.get(t.identifier) ?? -1;
          if (slot < 0)
            continue;
          const pos = this._to_canvas(t);
          const pt = this._points[slot];
          pt.x = pos.x;
          pt.y = pos.y;
        }
      }
      static _handle_cancel(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (!t)
            continue;
          const slot = this._free_slot(t.identifier);
          if (slot < 0)
            continue;
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
    touch_manager._points = Array.from({ length: MAX_TOUCH_POINTS }, make_touch_point);
    touch_manager._canvas = null;
    touch_manager._attached = false;
    touch_manager._on_start = (e) => {
      e.preventDefault();
      touch_manager._handle_start(e);
    };
    touch_manager._on_end = (e) => {
      e.preventDefault();
      touch_manager._handle_end(e);
    };
    touch_manager._on_move = (e) => {
      e.preventDefault();
      touch_manager._handle_move(e);
    };
    touch_manager._on_cancel = (e) => {
      e.preventDefault();
      touch_manager._handle_cancel(e);
    };
    touch_manager._id_to_slot = /* @__PURE__ */ new Map();
  }
});

// node_modules/matter-js/build/matter.js
var require_matter = __commonJS({
  "node_modules/matter-js/build/matter.js"(exports, module) {
    init_engine_globals();
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define("Matter", [], factory);
      else if (typeof exports === "object")
        exports["Matter"] = factory();
      else
        root["Matter"] = factory();
    })(exports, function() {
      return (
        /******/
        (function(modules) {
          var installedModules = {};
          function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) {
              return installedModules[moduleId].exports;
            }
            var module2 = installedModules[moduleId] = {
              /******/
              i: moduleId,
              /******/
              l: false,
              /******/
              exports: {}
              /******/
            };
            modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
            module2.l = true;
            return module2.exports;
          }
          __webpack_require__.m = modules;
          __webpack_require__.c = installedModules;
          __webpack_require__.d = function(exports2, name, getter) {
            if (!__webpack_require__.o(exports2, name)) {
              Object.defineProperty(exports2, name, { enumerable: true, get: getter });
            }
          };
          __webpack_require__.r = function(exports2) {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
              Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(exports2, "__esModule", { value: true });
          };
          __webpack_require__.t = function(value, mode) {
            if (mode & 1) value = __webpack_require__(value);
            if (mode & 8) return value;
            if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
            var ns = /* @__PURE__ */ Object.create(null);
            __webpack_require__.r(ns);
            Object.defineProperty(ns, "default", { enumerable: true, value });
            if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, function(key2) {
              return value[key2];
            }.bind(null, key));
            return ns;
          };
          __webpack_require__.n = function(module2) {
            var getter = module2 && module2.__esModule ? (
              /******/
              function getDefault() {
                return module2["default"];
              }
            ) : (
              /******/
              function getModuleExports() {
                return module2;
              }
            );
            __webpack_require__.d(getter, "a", getter);
            return getter;
          };
          __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
          };
          __webpack_require__.p = "";
          return __webpack_require__(__webpack_require__.s = 20);
        })([
          /* 0 */
          /***/
          (function(module2, exports2) {
            var Common = {};
            module2.exports = Common;
            (function() {
              Common._baseDelta = 1e3 / 60;
              Common._nextId = 0;
              Common._seed = 0;
              Common._nowStartTime = +/* @__PURE__ */ new Date();
              Common._warnedOnce = {};
              Common._decomp = null;
              Common.extend = function(obj, deep) {
                var argsStart, args, deepClone;
                if (typeof deep === "boolean") {
                  argsStart = 2;
                  deepClone = deep;
                } else {
                  argsStart = 1;
                  deepClone = true;
                }
                for (var i = argsStart; i < arguments.length; i++) {
                  var source = arguments[i];
                  if (source) {
                    for (var prop in source) {
                      if (deepClone && source[prop] && source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                          obj[prop] = obj[prop] || {};
                          Common.extend(obj[prop], deepClone, source[prop]);
                        } else {
                          obj[prop] = source[prop];
                        }
                      } else {
                        obj[prop] = source[prop];
                      }
                    }
                  }
                }
                return obj;
              };
              Common.clone = function(obj, deep) {
                return Common.extend({}, deep, obj);
              };
              Common.keys = function(obj) {
                if (Object.keys)
                  return Object.keys(obj);
                var keys = [];
                for (var key in obj)
                  keys.push(key);
                return keys;
              };
              Common.values = function(obj) {
                var values = [];
                if (Object.keys) {
                  var keys = Object.keys(obj);
                  for (var i = 0; i < keys.length; i++) {
                    values.push(obj[keys[i]]);
                  }
                  return values;
                }
                for (var key in obj)
                  values.push(obj[key]);
                return values;
              };
              Common.get = function(obj, path, begin, end) {
                path = path.split(".").slice(begin, end);
                for (var i = 0; i < path.length; i += 1) {
                  obj = obj[path[i]];
                }
                return obj;
              };
              Common.set = function(obj, path, val, begin, end) {
                var parts = path.split(".").slice(begin, end);
                Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
                return val;
              };
              Common.shuffle = function(array) {
                for (var i = array.length - 1; i > 0; i--) {
                  var j = Math.floor(Common.random() * (i + 1));
                  var temp = array[i];
                  array[i] = array[j];
                  array[j] = temp;
                }
                return array;
              };
              Common.choose = function(choices) {
                return choices[Math.floor(Common.random() * choices.length)];
              };
              Common.isElement = function(obj) {
                if (typeof HTMLElement !== "undefined") {
                  return obj instanceof HTMLElement;
                }
                return !!(obj && obj.nodeType && obj.nodeName);
              };
              Common.isArray = function(obj) {
                return Object.prototype.toString.call(obj) === "[object Array]";
              };
              Common.isFunction = function(obj) {
                return typeof obj === "function";
              };
              Common.isPlainObject = function(obj) {
                return typeof obj === "object" && obj.constructor === Object;
              };
              Common.isString = function(obj) {
                return toString.call(obj) === "[object String]";
              };
              Common.clamp = function(value, min3, max3) {
                if (value < min3)
                  return min3;
                if (value > max3)
                  return max3;
                return value;
              };
              Common.sign = function(value) {
                return value < 0 ? -1 : 1;
              };
              Common.now = function() {
                if (typeof window !== "undefined" && window.performance) {
                  if (window.performance.now) {
                    return window.performance.now();
                  } else if (window.performance.webkitNow) {
                    return window.performance.webkitNow();
                  }
                }
                if (Date.now) {
                  return Date.now();
                }
                return /* @__PURE__ */ new Date() - Common._nowStartTime;
              };
              Common.random = function(min3, max3) {
                min3 = typeof min3 !== "undefined" ? min3 : 0;
                max3 = typeof max3 !== "undefined" ? max3 : 1;
                return min3 + _seededRandom() * (max3 - min3);
              };
              var _seededRandom = function() {
                Common._seed = (Common._seed * 9301 + 49297) % 233280;
                return Common._seed / 233280;
              };
              Common.colorToNumber = function(colorString) {
                colorString = colorString.replace("#", "");
                if (colorString.length == 3) {
                  colorString = colorString.charAt(0) + colorString.charAt(0) + colorString.charAt(1) + colorString.charAt(1) + colorString.charAt(2) + colorString.charAt(2);
                }
                return parseInt(colorString, 16);
              };
              Common.logLevel = 1;
              Common.log = function() {
                if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                  console.log.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                }
              };
              Common.info = function() {
                if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
                  console.info.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                }
              };
              Common.warn = function() {
                if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                  console.warn.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                }
              };
              Common.warnOnce = function() {
                var message = Array.prototype.slice.call(arguments).join(" ");
                if (!Common._warnedOnce[message]) {
                  Common.warn(message);
                  Common._warnedOnce[message] = true;
                }
              };
              Common.deprecated = function(obj, prop, warning) {
                obj[prop] = Common.chain(function() {
                  Common.warnOnce("\u{1F505} deprecated \u{1F505}", warning);
                }, obj[prop]);
              };
              Common.nextId = function() {
                return Common._nextId++;
              };
              Common.indexOf = function(haystack, needle) {
                if (haystack.indexOf)
                  return haystack.indexOf(needle);
                for (var i = 0; i < haystack.length; i++) {
                  if (haystack[i] === needle)
                    return i;
                }
                return -1;
              };
              Common.map = function(list, func) {
                if (list.map) {
                  return list.map(func);
                }
                var mapped = [];
                for (var i = 0; i < list.length; i += 1) {
                  mapped.push(func(list[i]));
                }
                return mapped;
              };
              Common.topologicalSort = function(graph) {
                var result = [], visited = [], temp = [];
                for (var node in graph) {
                  if (!visited[node] && !temp[node]) {
                    Common._topologicalSort(node, visited, temp, graph, result);
                  }
                }
                return result;
              };
              Common._topologicalSort = function(node, visited, temp, graph, result) {
                var neighbors = graph[node] || [];
                temp[node] = true;
                for (var i = 0; i < neighbors.length; i += 1) {
                  var neighbor = neighbors[i];
                  if (temp[neighbor]) {
                    continue;
                  }
                  if (!visited[neighbor]) {
                    Common._topologicalSort(neighbor, visited, temp, graph, result);
                  }
                }
                temp[node] = false;
                visited[node] = true;
                result.push(node);
              };
              Common.chain = function() {
                var funcs = [];
                for (var i = 0; i < arguments.length; i += 1) {
                  var func = arguments[i];
                  if (func._chained) {
                    funcs.push.apply(funcs, func._chained);
                  } else {
                    funcs.push(func);
                  }
                }
                var chain = function() {
                  var lastResult, args = new Array(arguments.length);
                  for (var i2 = 0, l = arguments.length; i2 < l; i2++) {
                    args[i2] = arguments[i2];
                  }
                  for (i2 = 0; i2 < funcs.length; i2 += 1) {
                    var result = funcs[i2].apply(lastResult, args);
                    if (typeof result !== "undefined") {
                      lastResult = result;
                    }
                  }
                  return lastResult;
                };
                chain._chained = funcs;
                return chain;
              };
              Common.chainPathBefore = function(base, path, func) {
                return Common.set(base, path, Common.chain(
                  func,
                  Common.get(base, path)
                ));
              };
              Common.chainPathAfter = function(base, path, func) {
                return Common.set(base, path, Common.chain(
                  Common.get(base, path),
                  func
                ));
              };
              Common.setDecomp = function(decomp) {
                Common._decomp = decomp;
              };
              Common.getDecomp = function() {
                var decomp = Common._decomp;
                try {
                  if (!decomp && typeof window !== "undefined") {
                    decomp = window.decomp;
                  }
                  if (!decomp && typeof global !== "undefined") {
                    decomp = global.decomp;
                  }
                } catch (e) {
                  decomp = null;
                }
                return decomp;
              };
            })();
          }),
          /* 1 */
          /***/
          (function(module2, exports2) {
            var Bounds = {};
            module2.exports = Bounds;
            (function() {
              Bounds.create = function(vertices) {
                var bounds = {
                  min: { x: 0, y: 0 },
                  max: { x: 0, y: 0 }
                };
                if (vertices)
                  Bounds.update(bounds, vertices);
                return bounds;
              };
              Bounds.update = function(bounds, vertices, velocity) {
                bounds.min.x = Infinity;
                bounds.max.x = -Infinity;
                bounds.min.y = Infinity;
                bounds.max.y = -Infinity;
                for (var i = 0; i < vertices.length; i++) {
                  var vertex = vertices[i];
                  if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
                  if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
                  if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
                  if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
                }
                if (velocity) {
                  if (velocity.x > 0) {
                    bounds.max.x += velocity.x;
                  } else {
                    bounds.min.x += velocity.x;
                  }
                  if (velocity.y > 0) {
                    bounds.max.y += velocity.y;
                  } else {
                    bounds.min.y += velocity.y;
                  }
                }
              };
              Bounds.contains = function(bounds, point) {
                return point.x >= bounds.min.x && point.x <= bounds.max.x && point.y >= bounds.min.y && point.y <= bounds.max.y;
              };
              Bounds.overlaps = function(boundsA, boundsB) {
                return boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y;
              };
              Bounds.translate = function(bounds, vector) {
                bounds.min.x += vector.x;
                bounds.max.x += vector.x;
                bounds.min.y += vector.y;
                bounds.max.y += vector.y;
              };
              Bounds.shift = function(bounds, position) {
                var deltaX = bounds.max.x - bounds.min.x, deltaY = bounds.max.y - bounds.min.y;
                bounds.min.x = position.x;
                bounds.max.x = position.x + deltaX;
                bounds.min.y = position.y;
                bounds.max.y = position.y + deltaY;
              };
            })();
          }),
          /* 2 */
          /***/
          (function(module2, exports2) {
            var Vector = {};
            module2.exports = Vector;
            (function() {
              Vector.create = function(x, y) {
                return { x: x || 0, y: y || 0 };
              };
              Vector.clone = function(vector) {
                return { x: vector.x, y: vector.y };
              };
              Vector.magnitude = function(vector) {
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
              };
              Vector.magnitudeSquared = function(vector) {
                return vector.x * vector.x + vector.y * vector.y;
              };
              Vector.rotate = function(vector, angle, output) {
                var cos = Math.cos(angle), sin = Math.sin(angle);
                if (!output) output = {};
                var x = vector.x * cos - vector.y * sin;
                output.y = vector.x * sin + vector.y * cos;
                output.x = x;
                return output;
              };
              Vector.rotateAbout = function(vector, angle, point, output) {
                var cos = Math.cos(angle), sin = Math.sin(angle);
                if (!output) output = {};
                var x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin);
                output.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos);
                output.x = x;
                return output;
              };
              Vector.normalise = function(vector) {
                var magnitude = Vector.magnitude(vector);
                if (magnitude === 0)
                  return { x: 0, y: 0 };
                return { x: vector.x / magnitude, y: vector.y / magnitude };
              };
              Vector.dot = function(vectorA, vectorB) {
                return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
              };
              Vector.cross = function(vectorA, vectorB) {
                return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
              };
              Vector.cross3 = function(vectorA, vectorB, vectorC) {
                return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);
              };
              Vector.add = function(vectorA, vectorB, output) {
                if (!output) output = {};
                output.x = vectorA.x + vectorB.x;
                output.y = vectorA.y + vectorB.y;
                return output;
              };
              Vector.sub = function(vectorA, vectorB, output) {
                if (!output) output = {};
                output.x = vectorA.x - vectorB.x;
                output.y = vectorA.y - vectorB.y;
                return output;
              };
              Vector.mult = function(vector, scalar) {
                return { x: vector.x * scalar, y: vector.y * scalar };
              };
              Vector.div = function(vector, scalar) {
                return { x: vector.x / scalar, y: vector.y / scalar };
              };
              Vector.perp = function(vector, negate) {
                negate = negate === true ? -1 : 1;
                return { x: negate * -vector.y, y: negate * vector.x };
              };
              Vector.neg = function(vector) {
                return { x: -vector.x, y: -vector.y };
              };
              Vector.angle = function(vectorA, vectorB) {
                return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
              };
              Vector._temp = [
                Vector.create(),
                Vector.create(),
                Vector.create(),
                Vector.create(),
                Vector.create(),
                Vector.create()
              ];
            })();
          }),
          /* 3 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Vertices = {};
            module2.exports = Vertices;
            var Vector = __webpack_require__(2);
            var Common = __webpack_require__(0);
            (function() {
              Vertices.create = function(points, body) {
                var vertices = [];
                for (var i = 0; i < points.length; i++) {
                  var point = points[i], vertex = {
                    x: point.x,
                    y: point.y,
                    index: i,
                    body,
                    isInternal: false
                  };
                  vertices.push(vertex);
                }
                return vertices;
              };
              Vertices.fromPath = function(path, body) {
                var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig, points = [];
                path.replace(pathPattern, function(match, x, y) {
                  points.push({ x: parseFloat(x), y: parseFloat(y) });
                });
                return Vertices.create(points, body);
              };
              Vertices.centre = function(vertices) {
                var area = Vertices.area(vertices, true), centre = { x: 0, y: 0 }, cross, temp, j;
                for (var i = 0; i < vertices.length; i++) {
                  j = (i + 1) % vertices.length;
                  cross = Vector.cross(vertices[i], vertices[j]);
                  temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
                  centre = Vector.add(centre, temp);
                }
                return Vector.div(centre, 6 * area);
              };
              Vertices.mean = function(vertices) {
                var average = { x: 0, y: 0 };
                for (var i = 0; i < vertices.length; i++) {
                  average.x += vertices[i].x;
                  average.y += vertices[i].y;
                }
                return Vector.div(average, vertices.length);
              };
              Vertices.area = function(vertices, signed) {
                var area = 0, j = vertices.length - 1;
                for (var i = 0; i < vertices.length; i++) {
                  area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
                  j = i;
                }
                if (signed)
                  return area / 2;
                return Math.abs(area) / 2;
              };
              Vertices.inertia = function(vertices, mass) {
                var numerator = 0, denominator = 0, v = vertices, cross, j;
                for (var n = 0; n < v.length; n++) {
                  j = (n + 1) % v.length;
                  cross = Math.abs(Vector.cross(v[j], v[n]));
                  numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
                  denominator += cross;
                }
                return mass / 6 * (numerator / denominator);
              };
              Vertices.translate = function(vertices, vector, scalar) {
                scalar = typeof scalar !== "undefined" ? scalar : 1;
                var verticesLength = vertices.length, translateX = vector.x * scalar, translateY = vector.y * scalar, i;
                for (i = 0; i < verticesLength; i++) {
                  vertices[i].x += translateX;
                  vertices[i].y += translateY;
                }
                return vertices;
              };
              Vertices.rotate = function(vertices, angle, point) {
                if (angle === 0)
                  return;
                var cos = Math.cos(angle), sin = Math.sin(angle), pointX = point.x, pointY = point.y, verticesLength = vertices.length, vertex, dx, dy, i;
                for (i = 0; i < verticesLength; i++) {
                  vertex = vertices[i];
                  dx = vertex.x - pointX;
                  dy = vertex.y - pointY;
                  vertex.x = pointX + (dx * cos - dy * sin);
                  vertex.y = pointY + (dx * sin + dy * cos);
                }
                return vertices;
              };
              Vertices.contains = function(vertices, point) {
                var pointX = point.x, pointY = point.y, verticesLength = vertices.length, vertex = vertices[verticesLength - 1], nextVertex;
                for (var i = 0; i < verticesLength; i++) {
                  nextVertex = vertices[i];
                  if ((pointX - vertex.x) * (nextVertex.y - vertex.y) + (pointY - vertex.y) * (vertex.x - nextVertex.x) > 0) {
                    return false;
                  }
                  vertex = nextVertex;
                }
                return true;
              };
              Vertices.scale = function(vertices, scaleX, scaleY, point) {
                if (scaleX === 1 && scaleY === 1)
                  return vertices;
                point = point || Vertices.centre(vertices);
                var vertex, delta;
                for (var i = 0; i < vertices.length; i++) {
                  vertex = vertices[i];
                  delta = Vector.sub(vertex, point);
                  vertices[i].x = point.x + delta.x * scaleX;
                  vertices[i].y = point.y + delta.y * scaleY;
                }
                return vertices;
              };
              Vertices.chamfer = function(vertices, radius, quality, qualityMin, qualityMax) {
                if (typeof radius === "number") {
                  radius = [radius];
                } else {
                  radius = radius || [8];
                }
                quality = typeof quality !== "undefined" ? quality : -1;
                qualityMin = qualityMin || 2;
                qualityMax = qualityMax || 14;
                var newVertices = [];
                for (var i = 0; i < vertices.length; i++) {
                  var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1], vertex = vertices[i], nextVertex = vertices[(i + 1) % vertices.length], currentRadius = radius[i < radius.length ? i : radius.length - 1];
                  if (currentRadius === 0) {
                    newVertices.push(vertex);
                    continue;
                  }
                  var prevNormal = Vector.normalise({
                    x: vertex.y - prevVertex.y,
                    y: prevVertex.x - vertex.x
                  });
                  var nextNormal = Vector.normalise({
                    x: nextVertex.y - vertex.y,
                    y: vertex.x - nextVertex.x
                  });
                  var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)), radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius), midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)), scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));
                  var precision = quality;
                  if (quality === -1) {
                    precision = Math.pow(currentRadius, 0.32) * 1.75;
                  }
                  precision = Common.clamp(precision, qualityMin, qualityMax);
                  if (precision % 2 === 1)
                    precision += 1;
                  var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)), theta = alpha / precision;
                  for (var j = 0; j < precision; j++) {
                    newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
                  }
                }
                return newVertices;
              };
              Vertices.clockwiseSort = function(vertices) {
                var centre = Vertices.mean(vertices);
                vertices.sort(function(vertexA, vertexB) {
                  return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
                });
                return vertices;
              };
              Vertices.isConvex = function(vertices) {
                var flag = 0, n = vertices.length, i, j, k, z;
                if (n < 3)
                  return null;
                for (i = 0; i < n; i++) {
                  j = (i + 1) % n;
                  k = (i + 2) % n;
                  z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);
                  z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);
                  if (z < 0) {
                    flag |= 1;
                  } else if (z > 0) {
                    flag |= 2;
                  }
                  if (flag === 3) {
                    return false;
                  }
                }
                if (flag !== 0) {
                  return true;
                } else {
                  return null;
                }
              };
              Vertices.hull = function(vertices) {
                var upper = [], lower = [], vertex, i;
                vertices = vertices.slice(0);
                vertices.sort(function(vertexA, vertexB) {
                  var dx = vertexA.x - vertexB.x;
                  return dx !== 0 ? dx : vertexA.y - vertexB.y;
                });
                for (i = 0; i < vertices.length; i += 1) {
                  vertex = vertices[i];
                  while (lower.length >= 2 && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {
                    lower.pop();
                  }
                  lower.push(vertex);
                }
                for (i = vertices.length - 1; i >= 0; i -= 1) {
                  vertex = vertices[i];
                  while (upper.length >= 2 && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {
                    upper.pop();
                  }
                  upper.push(vertex);
                }
                upper.pop();
                lower.pop();
                return upper.concat(lower);
              };
            })();
          }),
          /* 4 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Body = {};
            module2.exports = Body;
            var Vertices = __webpack_require__(3);
            var Vector = __webpack_require__(2);
            var Sleeping = __webpack_require__(7);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            var Axes = __webpack_require__(11);
            (function() {
              Body._timeCorrection = true;
              Body._inertiaScale = 4;
              Body._nextCollidingGroupId = 1;
              Body._nextNonCollidingGroupId = -1;
              Body._nextCategory = 1;
              Body._baseDelta = 1e3 / 60;
              Body.create = function(options) {
                var defaults = {
                  id: Common.nextId(),
                  type: "body",
                  label: "Body",
                  parts: [],
                  plugin: {},
                  angle: 0,
                  vertices: Vertices.fromPath("L 0 0 L 40 0 L 40 40 L 0 40"),
                  position: { x: 0, y: 0 },
                  force: { x: 0, y: 0 },
                  torque: 0,
                  positionImpulse: { x: 0, y: 0 },
                  constraintImpulse: { x: 0, y: 0, angle: 0 },
                  totalContacts: 0,
                  speed: 0,
                  angularSpeed: 0,
                  velocity: { x: 0, y: 0 },
                  angularVelocity: 0,
                  isSensor: false,
                  isStatic: false,
                  isSleeping: false,
                  motion: 0,
                  sleepThreshold: 60,
                  density: 1e-3,
                  restitution: 0,
                  friction: 0.1,
                  frictionStatic: 0.5,
                  frictionAir: 0.01,
                  collisionFilter: {
                    category: 1,
                    mask: 4294967295,
                    group: 0
                  },
                  slop: 0.05,
                  timeScale: 1,
                  render: {
                    visible: true,
                    opacity: 1,
                    strokeStyle: null,
                    fillStyle: null,
                    lineWidth: null,
                    sprite: {
                      xScale: 1,
                      yScale: 1,
                      xOffset: 0,
                      yOffset: 0
                    }
                  },
                  events: null,
                  bounds: null,
                  chamfer: null,
                  circleRadius: 0,
                  positionPrev: null,
                  anglePrev: 0,
                  parent: null,
                  axes: null,
                  area: 0,
                  mass: 0,
                  inertia: 0,
                  deltaTime: 1e3 / 60,
                  _original: null
                };
                var body = Common.extend(defaults, options);
                _initProperties(body, options);
                return body;
              };
              Body.nextGroup = function(isNonColliding) {
                if (isNonColliding)
                  return Body._nextNonCollidingGroupId--;
                return Body._nextCollidingGroupId++;
              };
              Body.nextCategory = function() {
                Body._nextCategory = Body._nextCategory << 1;
                return Body._nextCategory;
              };
              var _initProperties = function(body, options) {
                options = options || {};
                Body.set(body, {
                  bounds: body.bounds || Bounds.create(body.vertices),
                  positionPrev: body.positionPrev || Vector.clone(body.position),
                  anglePrev: body.anglePrev || body.angle,
                  vertices: body.vertices,
                  parts: body.parts || [body],
                  isStatic: body.isStatic,
                  isSleeping: body.isSleeping,
                  parent: body.parent || body
                });
                Vertices.rotate(body.vertices, body.angle, body.position);
                Axes.rotate(body.axes, body.angle);
                Bounds.update(body.bounds, body.vertices, body.velocity);
                Body.set(body, {
                  axes: options.axes || body.axes,
                  area: options.area || body.area,
                  mass: options.mass || body.mass,
                  inertia: options.inertia || body.inertia
                });
                var defaultFillStyle = body.isStatic ? "#14151f" : Common.choose(["#f19648", "#f5d259", "#f55a3c", "#063e7b", "#ececd1"]), defaultStrokeStyle = body.isStatic ? "#555" : "#ccc", defaultLineWidth = body.isStatic && body.render.fillStyle === null ? 1 : 0;
                body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
                body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
                body.render.lineWidth = body.render.lineWidth || defaultLineWidth;
                body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
                body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
              };
              Body.set = function(body, settings, value) {
                var property;
                if (typeof settings === "string") {
                  property = settings;
                  settings = {};
                  settings[property] = value;
                }
                for (property in settings) {
                  if (!Object.prototype.hasOwnProperty.call(settings, property))
                    continue;
                  value = settings[property];
                  switch (property) {
                    case "isStatic":
                      Body.setStatic(body, value);
                      break;
                    case "isSleeping":
                      Sleeping.set(body, value);
                      break;
                    case "mass":
                      Body.setMass(body, value);
                      break;
                    case "density":
                      Body.setDensity(body, value);
                      break;
                    case "inertia":
                      Body.setInertia(body, value);
                      break;
                    case "vertices":
                      Body.setVertices(body, value);
                      break;
                    case "position":
                      Body.setPosition(body, value);
                      break;
                    case "angle":
                      Body.setAngle(body, value);
                      break;
                    case "velocity":
                      Body.setVelocity(body, value);
                      break;
                    case "angularVelocity":
                      Body.setAngularVelocity(body, value);
                      break;
                    case "speed":
                      Body.setSpeed(body, value);
                      break;
                    case "angularSpeed":
                      Body.setAngularSpeed(body, value);
                      break;
                    case "parts":
                      Body.setParts(body, value);
                      break;
                    case "centre":
                      Body.setCentre(body, value);
                      break;
                    default:
                      body[property] = value;
                  }
                }
              };
              Body.setStatic = function(body, isStatic) {
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  if (isStatic) {
                    if (!part.isStatic) {
                      part._original = {
                        restitution: part.restitution,
                        friction: part.friction,
                        mass: part.mass,
                        inertia: part.inertia,
                        density: part.density,
                        inverseMass: part.inverseMass,
                        inverseInertia: part.inverseInertia
                      };
                    }
                    part.restitution = 0;
                    part.friction = 1;
                    part.mass = part.inertia = part.density = Infinity;
                    part.inverseMass = part.inverseInertia = 0;
                    part.positionPrev.x = part.position.x;
                    part.positionPrev.y = part.position.y;
                    part.anglePrev = part.angle;
                    part.angularVelocity = 0;
                    part.speed = 0;
                    part.angularSpeed = 0;
                    part.motion = 0;
                  } else if (part._original) {
                    part.restitution = part._original.restitution;
                    part.friction = part._original.friction;
                    part.mass = part._original.mass;
                    part.inertia = part._original.inertia;
                    part.density = part._original.density;
                    part.inverseMass = part._original.inverseMass;
                    part.inverseInertia = part._original.inverseInertia;
                    part._original = null;
                  }
                  part.isStatic = isStatic;
                }
              };
              Body.setMass = function(body, mass) {
                var moment = body.inertia / (body.mass / 6);
                body.inertia = moment * (mass / 6);
                body.inverseInertia = 1 / body.inertia;
                body.mass = mass;
                body.inverseMass = 1 / body.mass;
                body.density = body.mass / body.area;
              };
              Body.setDensity = function(body, density) {
                Body.setMass(body, density * body.area);
                body.density = density;
              };
              Body.setInertia = function(body, inertia) {
                body.inertia = inertia;
                body.inverseInertia = 1 / body.inertia;
              };
              Body.setVertices = function(body, vertices) {
                if (vertices[0].body === body) {
                  body.vertices = vertices;
                } else {
                  body.vertices = Vertices.create(vertices, body);
                }
                body.axes = Axes.fromVertices(body.vertices);
                body.area = Vertices.area(body.vertices);
                Body.setMass(body, body.density * body.area);
                var centre = Vertices.centre(body.vertices);
                Vertices.translate(body.vertices, centre, -1);
                Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));
                Vertices.translate(body.vertices, body.position);
                Bounds.update(body.bounds, body.vertices, body.velocity);
              };
              Body.setParts = function(body, parts, autoHull) {
                var i;
                parts = parts.slice(0);
                body.parts.length = 0;
                body.parts.push(body);
                body.parent = body;
                for (i = 0; i < parts.length; i++) {
                  var part = parts[i];
                  if (part !== body) {
                    part.parent = body;
                    body.parts.push(part);
                  }
                }
                if (body.parts.length === 1)
                  return;
                autoHull = typeof autoHull !== "undefined" ? autoHull : true;
                if (autoHull) {
                  var vertices = [];
                  for (i = 0; i < parts.length; i++) {
                    vertices = vertices.concat(parts[i].vertices);
                  }
                  Vertices.clockwiseSort(vertices);
                  var hull = Vertices.hull(vertices), hullCentre = Vertices.centre(hull);
                  Body.setVertices(body, hull);
                  Vertices.translate(body.vertices, hullCentre);
                }
                var total = Body._totalProperties(body);
                body.area = total.area;
                body.parent = body;
                body.position.x = total.centre.x;
                body.position.y = total.centre.y;
                body.positionPrev.x = total.centre.x;
                body.positionPrev.y = total.centre.y;
                Body.setMass(body, total.mass);
                Body.setInertia(body, total.inertia);
                Body.setPosition(body, total.centre);
              };
              Body.setCentre = function(body, centre, relative) {
                if (!relative) {
                  body.positionPrev.x = centre.x - (body.position.x - body.positionPrev.x);
                  body.positionPrev.y = centre.y - (body.position.y - body.positionPrev.y);
                  body.position.x = centre.x;
                  body.position.y = centre.y;
                } else {
                  body.positionPrev.x += centre.x;
                  body.positionPrev.y += centre.y;
                  body.position.x += centre.x;
                  body.position.y += centre.y;
                }
              };
              Body.setPosition = function(body, position, updateVelocity) {
                var delta = Vector.sub(position, body.position);
                if (updateVelocity) {
                  body.positionPrev.x = body.position.x;
                  body.positionPrev.y = body.position.y;
                  body.velocity.x = delta.x;
                  body.velocity.y = delta.y;
                  body.speed = Vector.magnitude(delta);
                } else {
                  body.positionPrev.x += delta.x;
                  body.positionPrev.y += delta.y;
                }
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  part.position.x += delta.x;
                  part.position.y += delta.y;
                  Vertices.translate(part.vertices, delta);
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                }
              };
              Body.setAngle = function(body, angle, updateVelocity) {
                var delta = angle - body.angle;
                if (updateVelocity) {
                  body.anglePrev = body.angle;
                  body.angularVelocity = delta;
                  body.angularSpeed = Math.abs(delta);
                } else {
                  body.anglePrev += delta;
                }
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  part.angle += delta;
                  Vertices.rotate(part.vertices, delta, body.position);
                  Axes.rotate(part.axes, delta);
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                  if (i > 0) {
                    Vector.rotateAbout(part.position, delta, body.position, part.position);
                  }
                }
              };
              Body.setVelocity = function(body, velocity) {
                var timeScale = body.deltaTime / Body._baseDelta;
                body.positionPrev.x = body.position.x - velocity.x * timeScale;
                body.positionPrev.y = body.position.y - velocity.y * timeScale;
                body.velocity.x = (body.position.x - body.positionPrev.x) / timeScale;
                body.velocity.y = (body.position.y - body.positionPrev.y) / timeScale;
                body.speed = Vector.magnitude(body.velocity);
              };
              Body.getVelocity = function(body) {
                var timeScale = Body._baseDelta / body.deltaTime;
                return {
                  x: (body.position.x - body.positionPrev.x) * timeScale,
                  y: (body.position.y - body.positionPrev.y) * timeScale
                };
              };
              Body.getSpeed = function(body) {
                return Vector.magnitude(Body.getVelocity(body));
              };
              Body.setSpeed = function(body, speed) {
                Body.setVelocity(body, Vector.mult(Vector.normalise(Body.getVelocity(body)), speed));
              };
              Body.setAngularVelocity = function(body, velocity) {
                var timeScale = body.deltaTime / Body._baseDelta;
                body.anglePrev = body.angle - velocity * timeScale;
                body.angularVelocity = (body.angle - body.anglePrev) / timeScale;
                body.angularSpeed = Math.abs(body.angularVelocity);
              };
              Body.getAngularVelocity = function(body) {
                return (body.angle - body.anglePrev) * Body._baseDelta / body.deltaTime;
              };
              Body.getAngularSpeed = function(body) {
                return Math.abs(Body.getAngularVelocity(body));
              };
              Body.setAngularSpeed = function(body, speed) {
                Body.setAngularVelocity(body, Common.sign(Body.getAngularVelocity(body)) * speed);
              };
              Body.translate = function(body, translation, updateVelocity) {
                Body.setPosition(body, Vector.add(body.position, translation), updateVelocity);
              };
              Body.rotate = function(body, rotation, point, updateVelocity) {
                if (!point) {
                  Body.setAngle(body, body.angle + rotation, updateVelocity);
                } else {
                  var cos = Math.cos(rotation), sin = Math.sin(rotation), dx = body.position.x - point.x, dy = body.position.y - point.y;
                  Body.setPosition(body, {
                    x: point.x + (dx * cos - dy * sin),
                    y: point.y + (dx * sin + dy * cos)
                  }, updateVelocity);
                  Body.setAngle(body, body.angle + rotation, updateVelocity);
                }
              };
              Body.scale = function(body, scaleX, scaleY, point) {
                var totalArea = 0, totalInertia = 0;
                point = point || body.position;
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  Vertices.scale(part.vertices, scaleX, scaleY, point);
                  part.axes = Axes.fromVertices(part.vertices);
                  part.area = Vertices.area(part.vertices);
                  Body.setMass(part, body.density * part.area);
                  Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                  Body.setInertia(part, Body._inertiaScale * Vertices.inertia(part.vertices, part.mass));
                  Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
                  if (i > 0) {
                    totalArea += part.area;
                    totalInertia += part.inertia;
                  }
                  part.position.x = point.x + (part.position.x - point.x) * scaleX;
                  part.position.y = point.y + (part.position.y - point.y) * scaleY;
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                }
                if (body.parts.length > 1) {
                  body.area = totalArea;
                  if (!body.isStatic) {
                    Body.setMass(body, body.density * totalArea);
                    Body.setInertia(body, totalInertia);
                  }
                }
                if (body.circleRadius) {
                  if (scaleX === scaleY) {
                    body.circleRadius *= scaleX;
                  } else {
                    body.circleRadius = null;
                  }
                }
              };
              Body.update = function(body, deltaTime) {
                deltaTime = (typeof deltaTime !== "undefined" ? deltaTime : 1e3 / 60) * body.timeScale;
                var deltaTimeSquared = deltaTime * deltaTime, correction = Body._timeCorrection ? deltaTime / (body.deltaTime || deltaTime) : 1;
                var frictionAir = 1 - body.frictionAir * (deltaTime / Common._baseDelta), velocityPrevX = (body.position.x - body.positionPrev.x) * correction, velocityPrevY = (body.position.y - body.positionPrev.y) * correction;
                body.velocity.x = velocityPrevX * frictionAir + body.force.x / body.mass * deltaTimeSquared;
                body.velocity.y = velocityPrevY * frictionAir + body.force.y / body.mass * deltaTimeSquared;
                body.positionPrev.x = body.position.x;
                body.positionPrev.y = body.position.y;
                body.position.x += body.velocity.x;
                body.position.y += body.velocity.y;
                body.deltaTime = deltaTime;
                body.angularVelocity = (body.angle - body.anglePrev) * frictionAir * correction + body.torque / body.inertia * deltaTimeSquared;
                body.anglePrev = body.angle;
                body.angle += body.angularVelocity;
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  Vertices.translate(part.vertices, body.velocity);
                  if (i > 0) {
                    part.position.x += body.velocity.x;
                    part.position.y += body.velocity.y;
                  }
                  if (body.angularVelocity !== 0) {
                    Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                    Axes.rotate(part.axes, body.angularVelocity);
                    if (i > 0) {
                      Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                    }
                  }
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                }
              };
              Body.updateVelocities = function(body) {
                var timeScale = Body._baseDelta / body.deltaTime, bodyVelocity = body.velocity;
                bodyVelocity.x = (body.position.x - body.positionPrev.x) * timeScale;
                bodyVelocity.y = (body.position.y - body.positionPrev.y) * timeScale;
                body.speed = Math.sqrt(bodyVelocity.x * bodyVelocity.x + bodyVelocity.y * bodyVelocity.y);
                body.angularVelocity = (body.angle - body.anglePrev) * timeScale;
                body.angularSpeed = Math.abs(body.angularVelocity);
              };
              Body.applyForce = function(body, position, force) {
                var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
                body.force.x += force.x;
                body.force.y += force.y;
                body.torque += offset.x * force.y - offset.y * force.x;
              };
              Body._totalProperties = function(body) {
                var properties = {
                  mass: 0,
                  area: 0,
                  inertia: 0,
                  centre: { x: 0, y: 0 }
                };
                for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
                  var part = body.parts[i], mass = part.mass !== Infinity ? part.mass : 1;
                  properties.mass += mass;
                  properties.area += part.area;
                  properties.inertia += part.inertia;
                  properties.centre = Vector.add(properties.centre, Vector.mult(part.position, mass));
                }
                properties.centre = Vector.div(properties.centre, properties.mass);
                return properties;
              };
            })();
          }),
          /* 5 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Events = {};
            module2.exports = Events;
            var Common = __webpack_require__(0);
            (function() {
              Events.on = function(object, eventNames, callback) {
                var names = eventNames.split(" "), name;
                for (var i = 0; i < names.length; i++) {
                  name = names[i];
                  object.events = object.events || {};
                  object.events[name] = object.events[name] || [];
                  object.events[name].push(callback);
                }
                return callback;
              };
              Events.off = function(object, eventNames, callback) {
                if (!eventNames) {
                  object.events = {};
                  return;
                }
                if (typeof eventNames === "function") {
                  callback = eventNames;
                  eventNames = Common.keys(object.events).join(" ");
                }
                var names = eventNames.split(" ");
                for (var i = 0; i < names.length; i++) {
                  var callbacks = object.events[names[i]], newCallbacks = [];
                  if (callback && callbacks) {
                    for (var j = 0; j < callbacks.length; j++) {
                      if (callbacks[j] !== callback)
                        newCallbacks.push(callbacks[j]);
                    }
                  }
                  object.events[names[i]] = newCallbacks;
                }
              };
              Events.trigger = function(object, eventNames, event) {
                var names, name, callbacks, eventClone;
                var events = object.events;
                if (events && Common.keys(events).length > 0) {
                  if (!event)
                    event = {};
                  names = eventNames.split(" ");
                  for (var i = 0; i < names.length; i++) {
                    name = names[i];
                    callbacks = events[name];
                    if (callbacks) {
                      eventClone = Common.clone(event, false);
                      eventClone.name = name;
                      eventClone.source = object;
                      for (var j = 0; j < callbacks.length; j++) {
                        callbacks[j].apply(object, [eventClone]);
                      }
                    }
                  }
                }
              };
            })();
          }),
          /* 6 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Composite = {};
            module2.exports = Composite;
            var Events = __webpack_require__(5);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            var Body = __webpack_require__(4);
            (function() {
              Composite.create = function(options) {
                return Common.extend({
                  id: Common.nextId(),
                  type: "composite",
                  parent: null,
                  isModified: false,
                  bodies: [],
                  constraints: [],
                  composites: [],
                  label: "Composite",
                  plugin: {},
                  cache: {
                    allBodies: null,
                    allConstraints: null,
                    allComposites: null
                  }
                }, options);
              };
              Composite.setModified = function(composite, isModified, updateParents, updateChildren) {
                composite.isModified = isModified;
                if (isModified && composite.cache) {
                  composite.cache.allBodies = null;
                  composite.cache.allConstraints = null;
                  composite.cache.allComposites = null;
                }
                if (updateParents && composite.parent) {
                  Composite.setModified(composite.parent, isModified, updateParents, updateChildren);
                }
                if (updateChildren) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    var childComposite = composite.composites[i];
                    Composite.setModified(childComposite, isModified, updateParents, updateChildren);
                  }
                }
              };
              Composite.add = function(composite, object) {
                var objects = [].concat(object);
                Events.trigger(composite, "beforeAdd", { object });
                for (var i = 0; i < objects.length; i++) {
                  var obj = objects[i];
                  switch (obj.type) {
                    case "body":
                      if (obj.parent !== obj) {
                        Common.warn("Composite.add: skipped adding a compound body part (you must add its parent instead)");
                        break;
                      }
                      Composite.addBody(composite, obj);
                      break;
                    case "constraint":
                      Composite.addConstraint(composite, obj);
                      break;
                    case "composite":
                      Composite.addComposite(composite, obj);
                      break;
                    case "mouseConstraint":
                      Composite.addConstraint(composite, obj.constraint);
                      break;
                  }
                }
                Events.trigger(composite, "afterAdd", { object });
                return composite;
              };
              Composite.remove = function(composite, object, deep) {
                var objects = [].concat(object);
                Events.trigger(composite, "beforeRemove", { object });
                for (var i = 0; i < objects.length; i++) {
                  var obj = objects[i];
                  switch (obj.type) {
                    case "body":
                      Composite.removeBody(composite, obj, deep);
                      break;
                    case "constraint":
                      Composite.removeConstraint(composite, obj, deep);
                      break;
                    case "composite":
                      Composite.removeComposite(composite, obj, deep);
                      break;
                    case "mouseConstraint":
                      Composite.removeConstraint(composite, obj.constraint);
                      break;
                  }
                }
                Events.trigger(composite, "afterRemove", { object });
                return composite;
              };
              Composite.addComposite = function(compositeA, compositeB) {
                compositeA.composites.push(compositeB);
                compositeB.parent = compositeA;
                Composite.setModified(compositeA, true, true, false);
                return compositeA;
              };
              Composite.removeComposite = function(compositeA, compositeB, deep) {
                var position = Common.indexOf(compositeA.composites, compositeB);
                if (position !== -1) {
                  var bodies = Composite.allBodies(compositeB);
                  Composite.removeCompositeAt(compositeA, position);
                  for (var i = 0; i < bodies.length; i++) {
                    bodies[i].sleepCounter = 0;
                  }
                }
                if (deep) {
                  for (var i = 0; i < compositeA.composites.length; i++) {
                    Composite.removeComposite(compositeA.composites[i], compositeB, true);
                  }
                }
                return compositeA;
              };
              Composite.removeCompositeAt = function(composite, position) {
                composite.composites.splice(position, 1);
                Composite.setModified(composite, true, true, false);
                return composite;
              };
              Composite.addBody = function(composite, body) {
                composite.bodies.push(body);
                Composite.setModified(composite, true, true, false);
                return composite;
              };
              Composite.removeBody = function(composite, body, deep) {
                var position = Common.indexOf(composite.bodies, body);
                if (position !== -1) {
                  Composite.removeBodyAt(composite, position);
                  body.sleepCounter = 0;
                }
                if (deep) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    Composite.removeBody(composite.composites[i], body, true);
                  }
                }
                return composite;
              };
              Composite.removeBodyAt = function(composite, position) {
                composite.bodies.splice(position, 1);
                Composite.setModified(composite, true, true, false);
                return composite;
              };
              Composite.addConstraint = function(composite, constraint) {
                composite.constraints.push(constraint);
                Composite.setModified(composite, true, true, false);
                return composite;
              };
              Composite.removeConstraint = function(composite, constraint, deep) {
                var position = Common.indexOf(composite.constraints, constraint);
                if (position !== -1) {
                  Composite.removeConstraintAt(composite, position);
                }
                if (deep) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    Composite.removeConstraint(composite.composites[i], constraint, true);
                  }
                }
                return composite;
              };
              Composite.removeConstraintAt = function(composite, position) {
                composite.constraints.splice(position, 1);
                Composite.setModified(composite, true, true, false);
                return composite;
              };
              Composite.clear = function(composite, keepStatic, deep) {
                if (deep) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    Composite.clear(composite.composites[i], keepStatic, true);
                  }
                }
                if (keepStatic) {
                  composite.bodies = composite.bodies.filter(function(body) {
                    return body.isStatic;
                  });
                } else {
                  composite.bodies.length = 0;
                }
                composite.constraints.length = 0;
                composite.composites.length = 0;
                Composite.setModified(composite, true, true, false);
                return composite;
              };
              Composite.allBodies = function(composite) {
                if (composite.cache && composite.cache.allBodies) {
                  return composite.cache.allBodies;
                }
                var bodies = [].concat(composite.bodies);
                for (var i = 0; i < composite.composites.length; i++)
                  bodies = bodies.concat(Composite.allBodies(composite.composites[i]));
                if (composite.cache) {
                  composite.cache.allBodies = bodies;
                }
                return bodies;
              };
              Composite.allConstraints = function(composite) {
                if (composite.cache && composite.cache.allConstraints) {
                  return composite.cache.allConstraints;
                }
                var constraints = [].concat(composite.constraints);
                for (var i = 0; i < composite.composites.length; i++)
                  constraints = constraints.concat(Composite.allConstraints(composite.composites[i]));
                if (composite.cache) {
                  composite.cache.allConstraints = constraints;
                }
                return constraints;
              };
              Composite.allComposites = function(composite) {
                if (composite.cache && composite.cache.allComposites) {
                  return composite.cache.allComposites;
                }
                var composites = [].concat(composite.composites);
                for (var i = 0; i < composite.composites.length; i++)
                  composites = composites.concat(Composite.allComposites(composite.composites[i]));
                if (composite.cache) {
                  composite.cache.allComposites = composites;
                }
                return composites;
              };
              Composite.get = function(composite, id, type) {
                var objects, object;
                switch (type) {
                  case "body":
                    objects = Composite.allBodies(composite);
                    break;
                  case "constraint":
                    objects = Composite.allConstraints(composite);
                    break;
                  case "composite":
                    objects = Composite.allComposites(composite).concat(composite);
                    break;
                }
                if (!objects)
                  return null;
                object = objects.filter(function(object2) {
                  return object2.id.toString() === id.toString();
                });
                return object.length === 0 ? null : object[0];
              };
              Composite.move = function(compositeA, objects, compositeB) {
                Composite.remove(compositeA, objects);
                Composite.add(compositeB, objects);
                return compositeA;
              };
              Composite.rebase = function(composite) {
                var objects = Composite.allBodies(composite).concat(Composite.allConstraints(composite)).concat(Composite.allComposites(composite));
                for (var i = 0; i < objects.length; i++) {
                  objects[i].id = Common.nextId();
                }
                return composite;
              };
              Composite.translate = function(composite, translation, recursive) {
                var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;
                for (var i = 0; i < bodies.length; i++) {
                  Body.translate(bodies[i], translation);
                }
                return composite;
              };
              Composite.rotate = function(composite, rotation, point, recursive) {
                var cos = Math.cos(rotation), sin = Math.sin(rotation), bodies = recursive ? Composite.allBodies(composite) : composite.bodies;
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], dx = body.position.x - point.x, dy = body.position.y - point.y;
                  Body.setPosition(body, {
                    x: point.x + (dx * cos - dy * sin),
                    y: point.y + (dx * sin + dy * cos)
                  });
                  Body.rotate(body, rotation);
                }
                return composite;
              };
              Composite.scale = function(composite, scaleX, scaleY, point, recursive) {
                var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], dx = body.position.x - point.x, dy = body.position.y - point.y;
                  Body.setPosition(body, {
                    x: point.x + dx * scaleX,
                    y: point.y + dy * scaleY
                  });
                  Body.scale(body, scaleX, scaleY);
                }
                return composite;
              };
              Composite.bounds = function(composite) {
                var bodies = Composite.allBodies(composite), vertices = [];
                for (var i = 0; i < bodies.length; i += 1) {
                  var body = bodies[i];
                  vertices.push(body.bounds.min, body.bounds.max);
                }
                return Bounds.create(vertices);
              };
            })();
          }),
          /* 7 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Sleeping = {};
            module2.exports = Sleeping;
            var Body = __webpack_require__(4);
            var Events = __webpack_require__(5);
            var Common = __webpack_require__(0);
            (function() {
              Sleeping._motionWakeThreshold = 0.18;
              Sleeping._motionSleepThreshold = 0.08;
              Sleeping._minBias = 0.9;
              Sleeping.update = function(bodies, delta) {
                var timeScale = delta / Common._baseDelta, motionSleepThreshold = Sleeping._motionSleepThreshold;
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], speed = Body.getSpeed(body), angularSpeed = Body.getAngularSpeed(body), motion = speed * speed + angularSpeed * angularSpeed;
                  if (body.force.x !== 0 || body.force.y !== 0) {
                    Sleeping.set(body, false);
                    continue;
                  }
                  var minMotion = Math.min(body.motion, motion), maxMotion = Math.max(body.motion, motion);
                  body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;
                  if (body.sleepThreshold > 0 && body.motion < motionSleepThreshold) {
                    body.sleepCounter += 1;
                    if (body.sleepCounter >= body.sleepThreshold / timeScale) {
                      Sleeping.set(body, true);
                    }
                  } else if (body.sleepCounter > 0) {
                    body.sleepCounter -= 1;
                  }
                }
              };
              Sleeping.afterCollisions = function(pairs) {
                var motionSleepThreshold = Sleeping._motionSleepThreshold;
                for (var i = 0; i < pairs.length; i++) {
                  var pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  var collision = pair.collision, bodyA = collision.bodyA.parent, bodyB = collision.bodyB.parent;
                  if (bodyA.isSleeping && bodyB.isSleeping || bodyA.isStatic || bodyB.isStatic)
                    continue;
                  if (bodyA.isSleeping || bodyB.isSleeping) {
                    var sleepingBody = bodyA.isSleeping && !bodyA.isStatic ? bodyA : bodyB, movingBody = sleepingBody === bodyA ? bodyB : bodyA;
                    if (!sleepingBody.isStatic && movingBody.motion > motionSleepThreshold) {
                      Sleeping.set(sleepingBody, false);
                    }
                  }
                }
              };
              Sleeping.set = function(body, isSleeping) {
                var wasSleeping = body.isSleeping;
                if (isSleeping) {
                  body.isSleeping = true;
                  body.sleepCounter = body.sleepThreshold;
                  body.positionImpulse.x = 0;
                  body.positionImpulse.y = 0;
                  body.positionPrev.x = body.position.x;
                  body.positionPrev.y = body.position.y;
                  body.anglePrev = body.angle;
                  body.speed = 0;
                  body.angularSpeed = 0;
                  body.motion = 0;
                  if (!wasSleeping) {
                    Events.trigger(body, "sleepStart");
                  }
                } else {
                  body.isSleeping = false;
                  body.sleepCounter = 0;
                  if (wasSleeping) {
                    Events.trigger(body, "sleepEnd");
                  }
                }
              };
            })();
          }),
          /* 8 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Collision = {};
            module2.exports = Collision;
            var Vertices = __webpack_require__(3);
            var Pair = __webpack_require__(9);
            (function() {
              var _supports = [];
              var _overlapAB = {
                overlap: 0,
                axis: null
              };
              var _overlapBA = {
                overlap: 0,
                axis: null
              };
              Collision.create = function(bodyA, bodyB) {
                return {
                  pair: null,
                  collided: false,
                  bodyA,
                  bodyB,
                  parentA: bodyA.parent,
                  parentB: bodyB.parent,
                  depth: 0,
                  normal: { x: 0, y: 0 },
                  tangent: { x: 0, y: 0 },
                  penetration: { x: 0, y: 0 },
                  supports: [null, null],
                  supportCount: 0
                };
              };
              Collision.collides = function(bodyA, bodyB, pairs) {
                Collision._overlapAxes(_overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes);
                if (_overlapAB.overlap <= 0) {
                  return null;
                }
                Collision._overlapAxes(_overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);
                if (_overlapBA.overlap <= 0) {
                  return null;
                }
                var pair = pairs && pairs.table[Pair.id(bodyA, bodyB)], collision;
                if (!pair) {
                  collision = Collision.create(bodyA, bodyB);
                  collision.collided = true;
                  collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
                  collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
                  collision.parentA = collision.bodyA.parent;
                  collision.parentB = collision.bodyB.parent;
                } else {
                  collision = pair.collision;
                }
                bodyA = collision.bodyA;
                bodyB = collision.bodyB;
                var minOverlap;
                if (_overlapAB.overlap < _overlapBA.overlap) {
                  minOverlap = _overlapAB;
                } else {
                  minOverlap = _overlapBA;
                }
                var normal = collision.normal, tangent = collision.tangent, penetration = collision.penetration, supports = collision.supports, depth = minOverlap.overlap, minAxis = minOverlap.axis, normalX = minAxis.x, normalY = minAxis.y, deltaX = bodyB.position.x - bodyA.position.x, deltaY = bodyB.position.y - bodyA.position.y;
                if (normalX * deltaX + normalY * deltaY >= 0) {
                  normalX = -normalX;
                  normalY = -normalY;
                }
                normal.x = normalX;
                normal.y = normalY;
                tangent.x = -normalY;
                tangent.y = normalX;
                penetration.x = normalX * depth;
                penetration.y = normalY * depth;
                collision.depth = depth;
                var supportsB = Collision._findSupports(bodyA, bodyB, normal, 1), supportCount = 0;
                if (Vertices.contains(bodyA.vertices, supportsB[0])) {
                  supports[supportCount++] = supportsB[0];
                }
                if (Vertices.contains(bodyA.vertices, supportsB[1])) {
                  supports[supportCount++] = supportsB[1];
                }
                if (supportCount < 2) {
                  var supportsA = Collision._findSupports(bodyB, bodyA, normal, -1);
                  if (Vertices.contains(bodyB.vertices, supportsA[0])) {
                    supports[supportCount++] = supportsA[0];
                  }
                  if (supportCount < 2 && Vertices.contains(bodyB.vertices, supportsA[1])) {
                    supports[supportCount++] = supportsA[1];
                  }
                }
                if (supportCount === 0) {
                  supports[supportCount++] = supportsB[0];
                }
                collision.supportCount = supportCount;
                return collision;
              };
              Collision._overlapAxes = function(result, verticesA, verticesB, axes) {
                var verticesALength = verticesA.length, verticesBLength = verticesB.length, verticesAX = verticesA[0].x, verticesAY = verticesA[0].y, verticesBX = verticesB[0].x, verticesBY = verticesB[0].y, axesLength = axes.length, overlapMin = Number.MAX_VALUE, overlapAxisNumber = 0, overlap, overlapAB, overlapBA, dot, i, j;
                for (i = 0; i < axesLength; i++) {
                  var axis = axes[i], axisX = axis.x, axisY = axis.y, minA = verticesAX * axisX + verticesAY * axisY, minB = verticesBX * axisX + verticesBY * axisY, maxA = minA, maxB = minB;
                  for (j = 1; j < verticesALength; j += 1) {
                    dot = verticesA[j].x * axisX + verticesA[j].y * axisY;
                    if (dot > maxA) {
                      maxA = dot;
                    } else if (dot < minA) {
                      minA = dot;
                    }
                  }
                  for (j = 1; j < verticesBLength; j += 1) {
                    dot = verticesB[j].x * axisX + verticesB[j].y * axisY;
                    if (dot > maxB) {
                      maxB = dot;
                    } else if (dot < minB) {
                      minB = dot;
                    }
                  }
                  overlapAB = maxA - minB;
                  overlapBA = maxB - minA;
                  overlap = overlapAB < overlapBA ? overlapAB : overlapBA;
                  if (overlap < overlapMin) {
                    overlapMin = overlap;
                    overlapAxisNumber = i;
                    if (overlap <= 0) {
                      break;
                    }
                  }
                }
                result.axis = axes[overlapAxisNumber];
                result.overlap = overlapMin;
              };
              Collision._findSupports = function(bodyA, bodyB, normal, direction) {
                var vertices = bodyB.vertices, verticesLength = vertices.length, bodyAPositionX = bodyA.position.x, bodyAPositionY = bodyA.position.y, normalX = normal.x * direction, normalY = normal.y * direction, vertexA = vertices[0], vertexB = vertexA, nearestDistance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y), vertexC, distance, j;
                for (j = 1; j < verticesLength; j += 1) {
                  vertexB = vertices[j];
                  distance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y);
                  if (distance < nearestDistance) {
                    nearestDistance = distance;
                    vertexA = vertexB;
                  }
                }
                vertexC = vertices[(verticesLength + vertexA.index - 1) % verticesLength];
                nearestDistance = normalX * (bodyAPositionX - vertexC.x) + normalY * (bodyAPositionY - vertexC.y);
                vertexB = vertices[(vertexA.index + 1) % verticesLength];
                if (normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y) < nearestDistance) {
                  _supports[0] = vertexA;
                  _supports[1] = vertexB;
                  return _supports;
                }
                _supports[0] = vertexA;
                _supports[1] = vertexC;
                return _supports;
              };
            })();
          }),
          /* 9 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Pair = {};
            module2.exports = Pair;
            var Contact = __webpack_require__(16);
            (function() {
              Pair.create = function(collision, timestamp) {
                var bodyA = collision.bodyA, bodyB = collision.bodyB;
                var pair = {
                  id: Pair.id(bodyA, bodyB),
                  bodyA,
                  bodyB,
                  collision,
                  contacts: [Contact.create(), Contact.create()],
                  contactCount: 0,
                  separation: 0,
                  isActive: true,
                  isSensor: bodyA.isSensor || bodyB.isSensor,
                  timeCreated: timestamp,
                  timeUpdated: timestamp,
                  inverseMass: 0,
                  friction: 0,
                  frictionStatic: 0,
                  restitution: 0,
                  slop: 0
                };
                Pair.update(pair, collision, timestamp);
                return pair;
              };
              Pair.update = function(pair, collision, timestamp) {
                var supports = collision.supports, supportCount = collision.supportCount, contacts = pair.contacts, parentA = collision.parentA, parentB = collision.parentB;
                pair.isActive = true;
                pair.timeUpdated = timestamp;
                pair.collision = collision;
                pair.separation = collision.depth;
                pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
                pair.friction = parentA.friction < parentB.friction ? parentA.friction : parentB.friction;
                pair.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;
                pair.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;
                pair.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;
                pair.contactCount = supportCount;
                collision.pair = pair;
                var supportA = supports[0], contactA = contacts[0], supportB = supports[1], contactB = contacts[1];
                if (contactB.vertex === supportA || contactA.vertex === supportB) {
                  contacts[1] = contactA;
                  contacts[0] = contactA = contactB;
                  contactB = contacts[1];
                }
                contactA.vertex = supportA;
                contactB.vertex = supportB;
              };
              Pair.setActive = function(pair, isActive, timestamp) {
                if (isActive) {
                  pair.isActive = true;
                  pair.timeUpdated = timestamp;
                } else {
                  pair.isActive = false;
                  pair.contactCount = 0;
                }
              };
              Pair.id = function(bodyA, bodyB) {
                return bodyA.id < bodyB.id ? bodyA.id.toString(36) + ":" + bodyB.id.toString(36) : bodyB.id.toString(36) + ":" + bodyA.id.toString(36);
              };
            })();
          }),
          /* 10 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Constraint = {};
            module2.exports = Constraint;
            var Vertices = __webpack_require__(3);
            var Vector = __webpack_require__(2);
            var Sleeping = __webpack_require__(7);
            var Bounds = __webpack_require__(1);
            var Axes = __webpack_require__(11);
            var Common = __webpack_require__(0);
            (function() {
              Constraint._warming = 0.4;
              Constraint._torqueDampen = 1;
              Constraint._minLength = 1e-6;
              Constraint.create = function(options) {
                var constraint = options;
                if (constraint.bodyA && !constraint.pointA)
                  constraint.pointA = { x: 0, y: 0 };
                if (constraint.bodyB && !constraint.pointB)
                  constraint.pointB = { x: 0, y: 0 };
                var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA, initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB, length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
                constraint.length = typeof constraint.length !== "undefined" ? constraint.length : length;
                constraint.id = constraint.id || Common.nextId();
                constraint.label = constraint.label || "Constraint";
                constraint.type = "constraint";
                constraint.stiffness = constraint.stiffness || (constraint.length > 0 ? 1 : 0.7);
                constraint.damping = constraint.damping || 0;
                constraint.angularStiffness = constraint.angularStiffness || 0;
                constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
                constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;
                constraint.plugin = {};
                var render = {
                  visible: true,
                  lineWidth: 2,
                  strokeStyle: "#ffffff",
                  type: "line",
                  anchors: true
                };
                if (constraint.length === 0 && constraint.stiffness > 0.1) {
                  render.type = "pin";
                  render.anchors = false;
                } else if (constraint.stiffness < 0.9) {
                  render.type = "spring";
                }
                constraint.render = Common.extend(render, constraint.render);
                return constraint;
              };
              Constraint.preSolveAll = function(bodies) {
                for (var i = 0; i < bodies.length; i += 1) {
                  var body = bodies[i], impulse = body.constraintImpulse;
                  if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                    continue;
                  }
                  body.position.x += impulse.x;
                  body.position.y += impulse.y;
                  body.angle += impulse.angle;
                }
              };
              Constraint.solveAll = function(constraints, delta) {
                var timeScale = Common.clamp(delta / Common._baseDelta, 0, 1);
                for (var i = 0; i < constraints.length; i += 1) {
                  var constraint = constraints[i], fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic, fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                  if (fixedA || fixedB) {
                    Constraint.solve(constraints[i], timeScale);
                  }
                }
                for (i = 0; i < constraints.length; i += 1) {
                  constraint = constraints[i];
                  fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic;
                  fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                  if (!fixedA && !fixedB) {
                    Constraint.solve(constraints[i], timeScale);
                  }
                }
              };
              Constraint.solve = function(constraint, timeScale) {
                var bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointA = constraint.pointA, pointB = constraint.pointB;
                if (!bodyA && !bodyB)
                  return;
                if (bodyA && !bodyA.isStatic) {
                  Vector.rotate(pointA, bodyA.angle - constraint.angleA, pointA);
                  constraint.angleA = bodyA.angle;
                }
                if (bodyB && !bodyB.isStatic) {
                  Vector.rotate(pointB, bodyB.angle - constraint.angleB, pointB);
                  constraint.angleB = bodyB.angle;
                }
                var pointAWorld = pointA, pointBWorld = pointB;
                if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
                if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);
                if (!pointAWorld || !pointBWorld)
                  return;
                var delta = Vector.sub(pointAWorld, pointBWorld), currentLength = Vector.magnitude(delta);
                if (currentLength < Constraint._minLength) {
                  currentLength = Constraint._minLength;
                }
                var difference = (currentLength - constraint.length) / currentLength, isRigid = constraint.stiffness >= 1 || constraint.length === 0, stiffness = isRigid ? constraint.stiffness * timeScale : constraint.stiffness * timeScale * timeScale, damping = constraint.damping * timeScale, force = Vector.mult(delta, difference * stiffness), massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0), inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0), resistanceTotal = massTotal + inertiaTotal, torque, share, normal, normalVelocity, relativeVelocity;
                if (damping > 0) {
                  var zero = Vector.create();
                  normal = Vector.div(delta, currentLength);
                  relativeVelocity = Vector.sub(
                    bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,
                    bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero
                  );
                  normalVelocity = Vector.dot(normal, relativeVelocity);
                }
                if (bodyA && !bodyA.isStatic) {
                  share = bodyA.inverseMass / massTotal;
                  bodyA.constraintImpulse.x -= force.x * share;
                  bodyA.constraintImpulse.y -= force.y * share;
                  bodyA.position.x -= force.x * share;
                  bodyA.position.y -= force.y * share;
                  if (damping > 0) {
                    bodyA.positionPrev.x -= damping * normal.x * normalVelocity * share;
                    bodyA.positionPrev.y -= damping * normal.y * normalVelocity * share;
                  }
                  torque = Vector.cross(pointA, force) / resistanceTotal * Constraint._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);
                  bodyA.constraintImpulse.angle -= torque;
                  bodyA.angle -= torque;
                }
                if (bodyB && !bodyB.isStatic) {
                  share = bodyB.inverseMass / massTotal;
                  bodyB.constraintImpulse.x += force.x * share;
                  bodyB.constraintImpulse.y += force.y * share;
                  bodyB.position.x += force.x * share;
                  bodyB.position.y += force.y * share;
                  if (damping > 0) {
                    bodyB.positionPrev.x += damping * normal.x * normalVelocity * share;
                    bodyB.positionPrev.y += damping * normal.y * normalVelocity * share;
                  }
                  torque = Vector.cross(pointB, force) / resistanceTotal * Constraint._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);
                  bodyB.constraintImpulse.angle += torque;
                  bodyB.angle += torque;
                }
              };
              Constraint.postSolveAll = function(bodies) {
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], impulse = body.constraintImpulse;
                  if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                    continue;
                  }
                  Sleeping.set(body, false);
                  for (var j = 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    Vertices.translate(part.vertices, impulse);
                    if (j > 0) {
                      part.position.x += impulse.x;
                      part.position.y += impulse.y;
                    }
                    if (impulse.angle !== 0) {
                      Vertices.rotate(part.vertices, impulse.angle, body.position);
                      Axes.rotate(part.axes, impulse.angle);
                      if (j > 0) {
                        Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                      }
                    }
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                  impulse.angle *= Constraint._warming;
                  impulse.x *= Constraint._warming;
                  impulse.y *= Constraint._warming;
                }
              };
              Constraint.pointAWorld = function(constraint) {
                return {
                  x: (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0),
                  y: (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0)
                };
              };
              Constraint.pointBWorld = function(constraint) {
                return {
                  x: (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0),
                  y: (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0)
                };
              };
              Constraint.currentLength = function(constraint) {
                var pointAX = (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0);
                var pointAY = (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0);
                var pointBX = (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0);
                var pointBY = (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0);
                var deltaX = pointAX - pointBX;
                var deltaY = pointAY - pointBY;
                return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              };
            })();
          }),
          /* 11 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Axes = {};
            module2.exports = Axes;
            var Vector = __webpack_require__(2);
            var Common = __webpack_require__(0);
            (function() {
              Axes.fromVertices = function(vertices) {
                var axes = {};
                for (var i = 0; i < vertices.length; i++) {
                  var j = (i + 1) % vertices.length, normal = Vector.normalise({
                    x: vertices[j].y - vertices[i].y,
                    y: vertices[i].x - vertices[j].x
                  }), gradient = normal.y === 0 ? Infinity : normal.x / normal.y;
                  gradient = gradient.toFixed(3).toString();
                  axes[gradient] = normal;
                }
                return Common.values(axes);
              };
              Axes.rotate = function(axes, angle) {
                if (angle === 0)
                  return;
                var cos = Math.cos(angle), sin = Math.sin(angle);
                for (var i = 0; i < axes.length; i++) {
                  var axis = axes[i], xx;
                  xx = axis.x * cos - axis.y * sin;
                  axis.y = axis.x * sin + axis.y * cos;
                  axis.x = xx;
                }
              };
            })();
          }),
          /* 12 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Bodies = {};
            module2.exports = Bodies;
            var Vertices = __webpack_require__(3);
            var Common = __webpack_require__(0);
            var Body = __webpack_require__(4);
            var Bounds = __webpack_require__(1);
            var Vector = __webpack_require__(2);
            (function() {
              Bodies.rectangle = function(x, y, width, height, options) {
                options = options || {};
                var rectangle = {
                  label: "Rectangle Body",
                  position: { x, y },
                  vertices: Vertices.fromPath("L 0 0 L " + width + " 0 L " + width + " " + height + " L 0 " + height)
                };
                if (options.chamfer) {
                  var chamfer = options.chamfer;
                  rectangle.vertices = Vertices.chamfer(
                    rectangle.vertices,
                    chamfer.radius,
                    chamfer.quality,
                    chamfer.qualityMin,
                    chamfer.qualityMax
                  );
                  delete options.chamfer;
                }
                return Body.create(Common.extend({}, rectangle, options));
              };
              Bodies.trapezoid = function(x, y, width, height, slope, options) {
                options = options || {};
                if (slope >= 1) {
                  Common.warn("Bodies.trapezoid: slope parameter must be < 1.");
                }
                slope *= 0.5;
                var roof = (1 - slope * 2) * width;
                var x1 = width * slope, x2 = x1 + roof, x3 = x2 + x1, verticesPath;
                if (slope < 0.5) {
                  verticesPath = "L 0 0 L " + x1 + " " + -height + " L " + x2 + " " + -height + " L " + x3 + " 0";
                } else {
                  verticesPath = "L 0 0 L " + x2 + " " + -height + " L " + x3 + " 0";
                }
                var trapezoid = {
                  label: "Trapezoid Body",
                  position: { x, y },
                  vertices: Vertices.fromPath(verticesPath)
                };
                if (options.chamfer) {
                  var chamfer = options.chamfer;
                  trapezoid.vertices = Vertices.chamfer(
                    trapezoid.vertices,
                    chamfer.radius,
                    chamfer.quality,
                    chamfer.qualityMin,
                    chamfer.qualityMax
                  );
                  delete options.chamfer;
                }
                return Body.create(Common.extend({}, trapezoid, options));
              };
              Bodies.circle = function(x, y, radius, options, maxSides) {
                options = options || {};
                var circle = {
                  label: "Circle Body",
                  circleRadius: radius
                };
                maxSides = maxSides || 25;
                var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));
                if (sides % 2 === 1)
                  sides += 1;
                return Bodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
              };
              Bodies.polygon = function(x, y, sides, radius, options) {
                options = options || {};
                if (sides < 3)
                  return Bodies.circle(x, y, radius, options);
                var theta = 2 * Math.PI / sides, path = "", offset = theta * 0.5;
                for (var i = 0; i < sides; i += 1) {
                  var angle = offset + i * theta, xx = Math.cos(angle) * radius, yy = Math.sin(angle) * radius;
                  path += "L " + xx.toFixed(3) + " " + yy.toFixed(3) + " ";
                }
                var polygon = {
                  label: "Polygon Body",
                  position: { x, y },
                  vertices: Vertices.fromPath(path)
                };
                if (options.chamfer) {
                  var chamfer = options.chamfer;
                  polygon.vertices = Vertices.chamfer(
                    polygon.vertices,
                    chamfer.radius,
                    chamfer.quality,
                    chamfer.qualityMin,
                    chamfer.qualityMax
                  );
                  delete options.chamfer;
                }
                return Body.create(Common.extend({}, polygon, options));
              };
              Bodies.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints) {
                var decomp = Common.getDecomp(), canDecomp, body, parts, isConvex, isConcave, vertices, i, j, k, v, z;
                canDecomp = Boolean(decomp && decomp.quickDecomp);
                options = options || {};
                parts = [];
                flagInternal = typeof flagInternal !== "undefined" ? flagInternal : false;
                removeCollinear = typeof removeCollinear !== "undefined" ? removeCollinear : 0.01;
                minimumArea = typeof minimumArea !== "undefined" ? minimumArea : 10;
                removeDuplicatePoints = typeof removeDuplicatePoints !== "undefined" ? removeDuplicatePoints : 0.01;
                if (!Common.isArray(vertexSets[0])) {
                  vertexSets = [vertexSets];
                }
                for (v = 0; v < vertexSets.length; v += 1) {
                  vertices = vertexSets[v];
                  isConvex = Vertices.isConvex(vertices);
                  isConcave = !isConvex;
                  if (isConcave && !canDecomp) {
                    Common.warnOnce(
                      "Bodies.fromVertices: Install the 'poly-decomp' library and use Common.setDecomp or provide 'decomp' as a global to decompose concave vertices."
                    );
                  }
                  if (isConvex || !canDecomp) {
                    if (isConvex) {
                      vertices = Vertices.clockwiseSort(vertices);
                    } else {
                      vertices = Vertices.hull(vertices);
                    }
                    parts.push({
                      position: { x, y },
                      vertices
                    });
                  } else {
                    var concave = vertices.map(function(vertex) {
                      return [vertex.x, vertex.y];
                    });
                    decomp.makeCCW(concave);
                    if (removeCollinear !== false)
                      decomp.removeCollinearPoints(concave, removeCollinear);
                    if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)
                      decomp.removeDuplicatePoints(concave, removeDuplicatePoints);
                    var decomposed = decomp.quickDecomp(concave);
                    for (i = 0; i < decomposed.length; i++) {
                      var chunk = decomposed[i];
                      var chunkVertices = chunk.map(function(vertices2) {
                        return {
                          x: vertices2[0],
                          y: vertices2[1]
                        };
                      });
                      if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
                        continue;
                      parts.push({
                        position: Vertices.centre(chunkVertices),
                        vertices: chunkVertices
                      });
                    }
                  }
                }
                for (i = 0; i < parts.length; i++) {
                  parts[i] = Body.create(Common.extend(parts[i], options));
                }
                if (flagInternal) {
                  var coincident_max_dist = 5;
                  for (i = 0; i < parts.length; i++) {
                    var partA = parts[i];
                    for (j = i + 1; j < parts.length; j++) {
                      var partB = parts[j];
                      if (Bounds.overlaps(partA.bounds, partB.bounds)) {
                        var pav = partA.vertices, pbv = partB.vertices;
                        for (k = 0; k < partA.vertices.length; k++) {
                          for (z = 0; z < partB.vertices.length; z++) {
                            var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])), db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));
                            if (da < coincident_max_dist && db < coincident_max_dist) {
                              pav[k].isInternal = true;
                              pbv[z].isInternal = true;
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (parts.length > 1) {
                  body = Body.create(Common.extend({ parts: parts.slice(0) }, options));
                  Body.setPosition(body, { x, y });
                  return body;
                } else {
                  return parts[0];
                }
              };
            })();
          }),
          /* 13 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Detector = {};
            module2.exports = Detector;
            var Common = __webpack_require__(0);
            var Collision = __webpack_require__(8);
            (function() {
              Detector.create = function(options) {
                var defaults = {
                  bodies: [],
                  collisions: [],
                  pairs: null
                };
                return Common.extend(defaults, options);
              };
              Detector.setBodies = function(detector, bodies) {
                detector.bodies = bodies.slice(0);
              };
              Detector.clear = function(detector) {
                detector.bodies = [];
                detector.collisions = [];
              };
              Detector.collisions = function(detector) {
                var pairs = detector.pairs, bodies = detector.bodies, bodiesLength = bodies.length, canCollide = Detector.canCollide, collides = Collision.collides, collisions = detector.collisions, collisionIndex = 0, i, j;
                bodies.sort(Detector._compareBoundsX);
                for (i = 0; i < bodiesLength; i++) {
                  var bodyA = bodies[i], boundsA = bodyA.bounds, boundXMax = bodyA.bounds.max.x, boundYMax = bodyA.bounds.max.y, boundYMin = bodyA.bounds.min.y, bodyAStatic = bodyA.isStatic || bodyA.isSleeping, partsALength = bodyA.parts.length, partsASingle = partsALength === 1;
                  for (j = i + 1; j < bodiesLength; j++) {
                    var bodyB = bodies[j], boundsB = bodyB.bounds;
                    if (boundsB.min.x > boundXMax) {
                      break;
                    }
                    if (boundYMax < boundsB.min.y || boundYMin > boundsB.max.y) {
                      continue;
                    }
                    if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {
                      continue;
                    }
                    if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
                      continue;
                    }
                    var partsBLength = bodyB.parts.length;
                    if (partsASingle && partsBLength === 1) {
                      var collision = collides(bodyA, bodyB, pairs);
                      if (collision) {
                        collisions[collisionIndex++] = collision;
                      }
                    } else {
                      var partsAStart = partsALength > 1 ? 1 : 0, partsBStart = partsBLength > 1 ? 1 : 0;
                      for (var k = partsAStart; k < partsALength; k++) {
                        var partA = bodyA.parts[k], boundsA = partA.bounds;
                        for (var z = partsBStart; z < partsBLength; z++) {
                          var partB = bodyB.parts[z], boundsB = partB.bounds;
                          if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                            continue;
                          }
                          var collision = collides(partA, partB, pairs);
                          if (collision) {
                            collisions[collisionIndex++] = collision;
                          }
                        }
                      }
                    }
                  }
                }
                if (collisions.length !== collisionIndex) {
                  collisions.length = collisionIndex;
                }
                return collisions;
              };
              Detector.canCollide = function(filterA, filterB) {
                if (filterA.group === filterB.group && filterA.group !== 0)
                  return filterA.group > 0;
                return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
              };
              Detector._compareBoundsX = function(bodyA, bodyB) {
                return bodyA.bounds.min.x - bodyB.bounds.min.x;
              };
            })();
          }),
          /* 14 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Mouse = {};
            module2.exports = Mouse;
            var Common = __webpack_require__(0);
            (function() {
              Mouse.create = function(element) {
                var mouse = {};
                if (!element) {
                  Common.log("Mouse.create: element was undefined, defaulting to document.body", "warn");
                }
                mouse.element = element || document.body;
                mouse.absolute = { x: 0, y: 0 };
                mouse.position = { x: 0, y: 0 };
                mouse.mousedownPosition = { x: 0, y: 0 };
                mouse.mouseupPosition = { x: 0, y: 0 };
                mouse.offset = { x: 0, y: 0 };
                mouse.scale = { x: 1, y: 1 };
                mouse.wheelDelta = 0;
                mouse.button = -1;
                mouse.pixelRatio = parseInt(mouse.element.getAttribute("data-pixel-ratio"), 10) || 1;
                mouse.sourceEvents = {
                  mousemove: null,
                  mousedown: null,
                  mouseup: null,
                  mousewheel: null
                };
                mouse.mousemove = function(event) {
                  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                  if (touches) {
                    mouse.button = 0;
                    event.preventDefault();
                  }
                  mouse.absolute.x = position.x;
                  mouse.absolute.y = position.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                  mouse.sourceEvents.mousemove = event;
                };
                mouse.mousedown = function(event) {
                  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                  if (touches) {
                    mouse.button = 0;
                    event.preventDefault();
                  } else {
                    mouse.button = event.button;
                  }
                  mouse.absolute.x = position.x;
                  mouse.absolute.y = position.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                  mouse.mousedownPosition.x = mouse.position.x;
                  mouse.mousedownPosition.y = mouse.position.y;
                  mouse.sourceEvents.mousedown = event;
                };
                mouse.mouseup = function(event) {
                  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                  if (touches) {
                    event.preventDefault();
                  }
                  mouse.button = -1;
                  mouse.absolute.x = position.x;
                  mouse.absolute.y = position.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                  mouse.mouseupPosition.x = mouse.position.x;
                  mouse.mouseupPosition.y = mouse.position.y;
                  mouse.sourceEvents.mouseup = event;
                };
                mouse.mousewheel = function(event) {
                  mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
                  event.preventDefault();
                  mouse.sourceEvents.mousewheel = event;
                };
                Mouse.setElement(mouse, mouse.element);
                return mouse;
              };
              Mouse.setElement = function(mouse, element) {
                mouse.element = element;
                element.addEventListener("mousemove", mouse.mousemove, { passive: true });
                element.addEventListener("mousedown", mouse.mousedown, { passive: true });
                element.addEventListener("mouseup", mouse.mouseup, { passive: true });
                element.addEventListener("wheel", mouse.mousewheel, { passive: false });
                element.addEventListener("touchmove", mouse.mousemove, { passive: false });
                element.addEventListener("touchstart", mouse.mousedown, { passive: false });
                element.addEventListener("touchend", mouse.mouseup, { passive: false });
              };
              Mouse.clearSourceEvents = function(mouse) {
                mouse.sourceEvents.mousemove = null;
                mouse.sourceEvents.mousedown = null;
                mouse.sourceEvents.mouseup = null;
                mouse.sourceEvents.mousewheel = null;
                mouse.wheelDelta = 0;
              };
              Mouse.setOffset = function(mouse, offset) {
                mouse.offset.x = offset.x;
                mouse.offset.y = offset.y;
                mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
              };
              Mouse.setScale = function(mouse, scale) {
                mouse.scale.x = scale.x;
                mouse.scale.y = scale.y;
                mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
              };
              Mouse._getRelativeMousePosition = function(event, element, pixelRatio) {
                var elementBounds = element.getBoundingClientRect(), rootNode = document.documentElement || document.body.parentNode || document.body, scrollX = window.pageXOffset !== void 0 ? window.pageXOffset : rootNode.scrollLeft, scrollY = window.pageYOffset !== void 0 ? window.pageYOffset : rootNode.scrollTop, touches = event.changedTouches, x, y;
                if (touches) {
                  x = touches[0].pageX - elementBounds.left - scrollX;
                  y = touches[0].pageY - elementBounds.top - scrollY;
                } else {
                  x = event.pageX - elementBounds.left - scrollX;
                  y = event.pageY - elementBounds.top - scrollY;
                }
                return {
                  x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),
                  y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)
                };
              };
            })();
          }),
          /* 15 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Plugin = {};
            module2.exports = Plugin;
            var Common = __webpack_require__(0);
            (function() {
              Plugin._registry = {};
              Plugin.register = function(plugin) {
                if (!Plugin.isPlugin(plugin)) {
                  Common.warn("Plugin.register:", Plugin.toString(plugin), "does not implement all required fields.");
                }
                if (plugin.name in Plugin._registry) {
                  var registered = Plugin._registry[plugin.name], pluginVersion = Plugin.versionParse(plugin.version).number, registeredVersion = Plugin.versionParse(registered.version).number;
                  if (pluginVersion > registeredVersion) {
                    Common.warn("Plugin.register:", Plugin.toString(registered), "was upgraded to", Plugin.toString(plugin));
                    Plugin._registry[plugin.name] = plugin;
                  } else if (pluginVersion < registeredVersion) {
                    Common.warn("Plugin.register:", Plugin.toString(registered), "can not be downgraded to", Plugin.toString(plugin));
                  } else if (plugin !== registered) {
                    Common.warn("Plugin.register:", Plugin.toString(plugin), "is already registered to different plugin object");
                  }
                } else {
                  Plugin._registry[plugin.name] = plugin;
                }
                return plugin;
              };
              Plugin.resolve = function(dependency) {
                return Plugin._registry[Plugin.dependencyParse(dependency).name];
              };
              Plugin.toString = function(plugin) {
                return typeof plugin === "string" ? plugin : (plugin.name || "anonymous") + "@" + (plugin.version || plugin.range || "0.0.0");
              };
              Plugin.isPlugin = function(obj) {
                return obj && obj.name && obj.version && obj.install;
              };
              Plugin.isUsed = function(module3, name) {
                return module3.used.indexOf(name) > -1;
              };
              Plugin.isFor = function(plugin, module3) {
                var parsed = plugin.for && Plugin.dependencyParse(plugin.for);
                return !plugin.for || module3.name === parsed.name && Plugin.versionSatisfies(module3.version, parsed.range);
              };
              Plugin.use = function(module3, plugins) {
                module3.uses = (module3.uses || []).concat(plugins || []);
                if (module3.uses.length === 0) {
                  Common.warn("Plugin.use:", Plugin.toString(module3), "does not specify any dependencies to install.");
                  return;
                }
                var dependencies = Plugin.dependencies(module3), sortedDependencies = Common.topologicalSort(dependencies), status = [];
                for (var i = 0; i < sortedDependencies.length; i += 1) {
                  if (sortedDependencies[i] === module3.name) {
                    continue;
                  }
                  var plugin = Plugin.resolve(sortedDependencies[i]);
                  if (!plugin) {
                    status.push("\u274C " + sortedDependencies[i]);
                    continue;
                  }
                  if (Plugin.isUsed(module3, plugin.name)) {
                    continue;
                  }
                  if (!Plugin.isFor(plugin, module3)) {
                    Common.warn("Plugin.use:", Plugin.toString(plugin), "is for", plugin.for, "but installed on", Plugin.toString(module3) + ".");
                    plugin._warned = true;
                  }
                  if (plugin.install) {
                    plugin.install(module3);
                  } else {
                    Common.warn("Plugin.use:", Plugin.toString(plugin), "does not specify an install function.");
                    plugin._warned = true;
                  }
                  if (plugin._warned) {
                    status.push("\u{1F536} " + Plugin.toString(plugin));
                    delete plugin._warned;
                  } else {
                    status.push("\u2705 " + Plugin.toString(plugin));
                  }
                  module3.used.push(plugin.name);
                }
                if (status.length > 0) {
                  Common.info(status.join("  "));
                }
              };
              Plugin.dependencies = function(module3, tracked) {
                var parsedBase = Plugin.dependencyParse(module3), name = parsedBase.name;
                tracked = tracked || {};
                if (name in tracked) {
                  return;
                }
                module3 = Plugin.resolve(module3) || module3;
                tracked[name] = Common.map(module3.uses || [], function(dependency) {
                  if (Plugin.isPlugin(dependency)) {
                    Plugin.register(dependency);
                  }
                  var parsed = Plugin.dependencyParse(dependency), resolved = Plugin.resolve(dependency);
                  if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {
                    Common.warn(
                      "Plugin.dependencies:",
                      Plugin.toString(resolved),
                      "does not satisfy",
                      Plugin.toString(parsed),
                      "used by",
                      Plugin.toString(parsedBase) + "."
                    );
                    resolved._warned = true;
                    module3._warned = true;
                  } else if (!resolved) {
                    Common.warn(
                      "Plugin.dependencies:",
                      Plugin.toString(dependency),
                      "used by",
                      Plugin.toString(parsedBase),
                      "could not be resolved."
                    );
                    module3._warned = true;
                  }
                  return parsed.name;
                });
                for (var i = 0; i < tracked[name].length; i += 1) {
                  Plugin.dependencies(tracked[name][i], tracked);
                }
                return tracked;
              };
              Plugin.dependencyParse = function(dependency) {
                if (Common.isString(dependency)) {
                  var pattern = /^[\w-]+(@(\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-+]+)?))?$/;
                  if (!pattern.test(dependency)) {
                    Common.warn("Plugin.dependencyParse:", dependency, "is not a valid dependency string.");
                  }
                  return {
                    name: dependency.split("@")[0],
                    range: dependency.split("@")[1] || "*"
                  };
                }
                return {
                  name: dependency.name,
                  range: dependency.range || dependency.version
                };
              };
              Plugin.versionParse = function(range) {
                var pattern = /^(\*)|(\^|~|>=|>)?\s*((\d+)\.(\d+)\.(\d+))(-[0-9A-Za-z-+]+)?$/;
                if (!pattern.test(range)) {
                  Common.warn("Plugin.versionParse:", range, "is not a valid version or range.");
                }
                var parts = pattern.exec(range);
                var major = Number(parts[4]);
                var minor = Number(parts[5]);
                var patch = Number(parts[6]);
                return {
                  isRange: Boolean(parts[1] || parts[2]),
                  version: parts[3],
                  range,
                  operator: parts[1] || parts[2] || "",
                  major,
                  minor,
                  patch,
                  parts: [major, minor, patch],
                  prerelease: parts[7],
                  number: major * 1e8 + minor * 1e4 + patch
                };
              };
              Plugin.versionSatisfies = function(version, range) {
                range = range || "*";
                var r = Plugin.versionParse(range), v = Plugin.versionParse(version);
                if (r.isRange) {
                  if (r.operator === "*" || version === "*") {
                    return true;
                  }
                  if (r.operator === ">") {
                    return v.number > r.number;
                  }
                  if (r.operator === ">=") {
                    return v.number >= r.number;
                  }
                  if (r.operator === "~") {
                    return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
                  }
                  if (r.operator === "^") {
                    if (r.major > 0) {
                      return v.major === r.major && v.number >= r.number;
                    }
                    if (r.minor > 0) {
                      return v.minor === r.minor && v.patch >= r.patch;
                    }
                    return v.patch === r.patch;
                  }
                }
                return version === range || version === "*";
              };
            })();
          }),
          /* 16 */
          /***/
          (function(module2, exports2) {
            var Contact = {};
            module2.exports = Contact;
            (function() {
              Contact.create = function(vertex) {
                return {
                  vertex,
                  normalImpulse: 0,
                  tangentImpulse: 0
                };
              };
            })();
          }),
          /* 17 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Engine = {};
            module2.exports = Engine;
            var Sleeping = __webpack_require__(7);
            var Resolver = __webpack_require__(18);
            var Detector = __webpack_require__(13);
            var Pairs = __webpack_require__(19);
            var Events = __webpack_require__(5);
            var Composite = __webpack_require__(6);
            var Constraint = __webpack_require__(10);
            var Common = __webpack_require__(0);
            var Body = __webpack_require__(4);
            (function() {
              Engine._deltaMax = 1e3 / 60;
              Engine.create = function(options) {
                options = options || {};
                var defaults = {
                  positionIterations: 6,
                  velocityIterations: 4,
                  constraintIterations: 2,
                  enableSleeping: false,
                  events: [],
                  plugin: {},
                  gravity: {
                    x: 0,
                    y: 1,
                    scale: 1e-3
                  },
                  timing: {
                    timestamp: 0,
                    timeScale: 1,
                    lastDelta: 0,
                    lastElapsed: 0,
                    lastUpdatesPerFrame: 0
                  }
                };
                var engine = Common.extend(defaults, options);
                engine.world = options.world || Composite.create({ label: "World" });
                engine.pairs = options.pairs || Pairs.create();
                engine.detector = options.detector || Detector.create();
                engine.detector.pairs = engine.pairs;
                engine.grid = { buckets: [] };
                engine.world.gravity = engine.gravity;
                engine.broadphase = engine.grid;
                engine.metrics = {};
                return engine;
              };
              Engine.update = function(engine, delta) {
                var startTime = Common.now();
                var world = engine.world, detector = engine.detector, pairs = engine.pairs, timing = engine.timing, timestamp = timing.timestamp, i;
                if (delta > Engine._deltaMax) {
                  Common.warnOnce(
                    "Matter.Engine.update: delta argument is recommended to be less than or equal to",
                    Engine._deltaMax.toFixed(3),
                    "ms."
                  );
                }
                delta = typeof delta !== "undefined" ? delta : Common._baseDelta;
                delta *= timing.timeScale;
                timing.timestamp += delta;
                timing.lastDelta = delta;
                var event = {
                  timestamp: timing.timestamp,
                  delta
                };
                Events.trigger(engine, "beforeUpdate", event);
                var allBodies = Composite.allBodies(world), allConstraints = Composite.allConstraints(world);
                if (world.isModified) {
                  Detector.setBodies(detector, allBodies);
                  Composite.setModified(world, false, false, true);
                }
                if (engine.enableSleeping)
                  Sleeping.update(allBodies, delta);
                Engine._bodiesApplyGravity(allBodies, engine.gravity);
                if (delta > 0) {
                  Engine._bodiesUpdate(allBodies, delta);
                }
                Events.trigger(engine, "beforeSolve", event);
                Constraint.preSolveAll(allBodies);
                for (i = 0; i < engine.constraintIterations; i++) {
                  Constraint.solveAll(allConstraints, delta);
                }
                Constraint.postSolveAll(allBodies);
                var collisions = Detector.collisions(detector);
                Pairs.update(pairs, collisions, timestamp);
                if (engine.enableSleeping)
                  Sleeping.afterCollisions(pairs.list);
                if (pairs.collisionStart.length > 0) {
                  Events.trigger(engine, "collisionStart", {
                    pairs: pairs.collisionStart,
                    timestamp: timing.timestamp,
                    delta
                  });
                }
                var positionDamping = Common.clamp(20 / engine.positionIterations, 0, 1);
                Resolver.preSolvePosition(pairs.list);
                for (i = 0; i < engine.positionIterations; i++) {
                  Resolver.solvePosition(pairs.list, delta, positionDamping);
                }
                Resolver.postSolvePosition(allBodies);
                Constraint.preSolveAll(allBodies);
                for (i = 0; i < engine.constraintIterations; i++) {
                  Constraint.solveAll(allConstraints, delta);
                }
                Constraint.postSolveAll(allBodies);
                Resolver.preSolveVelocity(pairs.list);
                for (i = 0; i < engine.velocityIterations; i++) {
                  Resolver.solveVelocity(pairs.list, delta);
                }
                Engine._bodiesUpdateVelocities(allBodies);
                if (pairs.collisionActive.length > 0) {
                  Events.trigger(engine, "collisionActive", {
                    pairs: pairs.collisionActive,
                    timestamp: timing.timestamp,
                    delta
                  });
                }
                if (pairs.collisionEnd.length > 0) {
                  Events.trigger(engine, "collisionEnd", {
                    pairs: pairs.collisionEnd,
                    timestamp: timing.timestamp,
                    delta
                  });
                }
                Engine._bodiesClearForces(allBodies);
                Events.trigger(engine, "afterUpdate", event);
                engine.timing.lastElapsed = Common.now() - startTime;
                return engine;
              };
              Engine.merge = function(engineA, engineB) {
                Common.extend(engineA, engineB);
                if (engineB.world) {
                  engineA.world = engineB.world;
                  Engine.clear(engineA);
                  var bodies = Composite.allBodies(engineA.world);
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    Sleeping.set(body, false);
                    body.id = Common.nextId();
                  }
                }
              };
              Engine.clear = function(engine) {
                Pairs.clear(engine.pairs);
                Detector.clear(engine.detector);
              };
              Engine._bodiesClearForces = function(bodies) {
                var bodiesLength = bodies.length;
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i];
                  body.force.x = 0;
                  body.force.y = 0;
                  body.torque = 0;
                }
              };
              Engine._bodiesApplyGravity = function(bodies, gravity) {
                var gravityScale = typeof gravity.scale !== "undefined" ? gravity.scale : 1e-3, bodiesLength = bodies.length;
                if (gravity.x === 0 && gravity.y === 0 || gravityScale === 0) {
                  return;
                }
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i];
                  if (body.isStatic || body.isSleeping)
                    continue;
                  body.force.y += body.mass * gravity.y * gravityScale;
                  body.force.x += body.mass * gravity.x * gravityScale;
                }
              };
              Engine._bodiesUpdate = function(bodies, delta) {
                var bodiesLength = bodies.length;
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i];
                  if (body.isStatic || body.isSleeping)
                    continue;
                  Body.update(body, delta);
                }
              };
              Engine._bodiesUpdateVelocities = function(bodies) {
                var bodiesLength = bodies.length;
                for (var i = 0; i < bodiesLength; i++) {
                  Body.updateVelocities(bodies[i]);
                }
              };
            })();
          }),
          /* 18 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Resolver = {};
            module2.exports = Resolver;
            var Vertices = __webpack_require__(3);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            (function() {
              Resolver._restingThresh = 2;
              Resolver._restingThreshTangent = Math.sqrt(6);
              Resolver._positionDampen = 0.9;
              Resolver._positionWarming = 0.8;
              Resolver._frictionNormalMultiplier = 5;
              Resolver._frictionMaxStatic = Number.MAX_VALUE;
              Resolver.preSolvePosition = function(pairs) {
                var i, pair, contactCount, pairsLength = pairs.length;
                for (i = 0; i < pairsLength; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  contactCount = pair.contactCount;
                  pair.collision.parentA.totalContacts += contactCount;
                  pair.collision.parentB.totalContacts += contactCount;
                }
              };
              Resolver.solvePosition = function(pairs, delta, damping) {
                var i, pair, collision, bodyA, bodyB, normal, contactShare, positionImpulse, positionDampen = Resolver._positionDampen * (damping || 1), slopDampen = Common.clamp(delta / Common._baseDelta, 0, 1), pairsLength = pairs.length;
                for (i = 0; i < pairsLength; i++) {
                  pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  collision = pair.collision;
                  bodyA = collision.parentA;
                  bodyB = collision.parentB;
                  normal = collision.normal;
                  pair.separation = collision.depth + normal.x * (bodyB.positionImpulse.x - bodyA.positionImpulse.x) + normal.y * (bodyB.positionImpulse.y - bodyA.positionImpulse.y);
                }
                for (i = 0; i < pairsLength; i++) {
                  pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  collision = pair.collision;
                  bodyA = collision.parentA;
                  bodyB = collision.parentB;
                  normal = collision.normal;
                  positionImpulse = pair.separation - pair.slop * slopDampen;
                  if (bodyA.isStatic || bodyB.isStatic)
                    positionImpulse *= 2;
                  if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    contactShare = positionDampen / bodyA.totalContacts;
                    bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
                    bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
                  }
                  if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    contactShare = positionDampen / bodyB.totalContacts;
                    bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
                    bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
                  }
                }
              };
              Resolver.postSolvePosition = function(bodies) {
                var positionWarming = Resolver._positionWarming, bodiesLength = bodies.length, verticesTranslate = Vertices.translate, boundsUpdate = Bounds.update;
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i], positionImpulse = body.positionImpulse, positionImpulseX = positionImpulse.x, positionImpulseY = positionImpulse.y, velocity = body.velocity;
                  body.totalContacts = 0;
                  if (positionImpulseX !== 0 || positionImpulseY !== 0) {
                    for (var j = 0; j < body.parts.length; j++) {
                      var part = body.parts[j];
                      verticesTranslate(part.vertices, positionImpulse);
                      boundsUpdate(part.bounds, part.vertices, velocity);
                      part.position.x += positionImpulseX;
                      part.position.y += positionImpulseY;
                    }
                    body.positionPrev.x += positionImpulseX;
                    body.positionPrev.y += positionImpulseY;
                    if (positionImpulseX * velocity.x + positionImpulseY * velocity.y < 0) {
                      positionImpulse.x = 0;
                      positionImpulse.y = 0;
                    } else {
                      positionImpulse.x *= positionWarming;
                      positionImpulse.y *= positionWarming;
                    }
                  }
                }
              };
              Resolver.preSolveVelocity = function(pairs) {
                var pairsLength = pairs.length, i, j;
                for (i = 0; i < pairsLength; i++) {
                  var pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  var contacts = pair.contacts, contactCount = pair.contactCount, collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normal = collision.normal, tangent = collision.tangent;
                  for (j = 0; j < contactCount; j++) {
                    var contact = contacts[j], contactVertex = contact.vertex, normalImpulse = contact.normalImpulse, tangentImpulse = contact.tangentImpulse;
                    if (normalImpulse !== 0 || tangentImpulse !== 0) {
                      var impulseX = normal.x * normalImpulse + tangent.x * tangentImpulse, impulseY = normal.y * normalImpulse + tangent.y * tangentImpulse;
                      if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                        bodyA.anglePrev += bodyA.inverseInertia * ((contactVertex.x - bodyA.position.x) * impulseY - (contactVertex.y - bodyA.position.y) * impulseX);
                      }
                      if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                        bodyB.anglePrev -= bodyB.inverseInertia * ((contactVertex.x - bodyB.position.x) * impulseY - (contactVertex.y - bodyB.position.y) * impulseX);
                      }
                    }
                  }
                }
              };
              Resolver.solveVelocity = function(pairs, delta) {
                var timeScale = delta / Common._baseDelta, timeScaleSquared = timeScale * timeScale, timeScaleCubed = timeScaleSquared * timeScale, restingThresh = -Resolver._restingThresh * timeScale, restingThreshTangent = Resolver._restingThreshTangent, frictionNormalMultiplier = Resolver._frictionNormalMultiplier * timeScale, frictionMaxStatic = Resolver._frictionMaxStatic, pairsLength = pairs.length, tangentImpulse, maxFriction, i, j;
                for (i = 0; i < pairsLength; i++) {
                  var pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  var collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normalX = collision.normal.x, normalY = collision.normal.y, tangentX = collision.tangent.x, tangentY = collision.tangent.y, inverseMassTotal = pair.inverseMass, friction = pair.friction * pair.frictionStatic * frictionNormalMultiplier, contacts = pair.contacts, contactCount = pair.contactCount, contactShare = 1 / contactCount;
                  var bodyAVelocityX = bodyA.position.x - bodyA.positionPrev.x, bodyAVelocityY = bodyA.position.y - bodyA.positionPrev.y, bodyAAngularVelocity = bodyA.angle - bodyA.anglePrev, bodyBVelocityX = bodyB.position.x - bodyB.positionPrev.x, bodyBVelocityY = bodyB.position.y - bodyB.positionPrev.y, bodyBAngularVelocity = bodyB.angle - bodyB.anglePrev;
                  for (j = 0; j < contactCount; j++) {
                    var contact = contacts[j], contactVertex = contact.vertex;
                    var offsetAX = contactVertex.x - bodyA.position.x, offsetAY = contactVertex.y - bodyA.position.y, offsetBX = contactVertex.x - bodyB.position.x, offsetBY = contactVertex.y - bodyB.position.y;
                    var velocityPointAX = bodyAVelocityX - offsetAY * bodyAAngularVelocity, velocityPointAY = bodyAVelocityY + offsetAX * bodyAAngularVelocity, velocityPointBX = bodyBVelocityX - offsetBY * bodyBAngularVelocity, velocityPointBY = bodyBVelocityY + offsetBX * bodyBAngularVelocity;
                    var relativeVelocityX = velocityPointAX - velocityPointBX, relativeVelocityY = velocityPointAY - velocityPointBY;
                    var normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY, tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY;
                    var normalOverlap = pair.separation + normalVelocity;
                    var normalForce = Math.min(normalOverlap, 1);
                    normalForce = normalOverlap < 0 ? 0 : normalForce;
                    var frictionLimit = normalForce * friction;
                    if (tangentVelocity < -frictionLimit || tangentVelocity > frictionLimit) {
                      maxFriction = tangentVelocity > 0 ? tangentVelocity : -tangentVelocity;
                      tangentImpulse = pair.friction * (tangentVelocity > 0 ? 1 : -1) * timeScaleCubed;
                      if (tangentImpulse < -maxFriction) {
                        tangentImpulse = -maxFriction;
                      } else if (tangentImpulse > maxFriction) {
                        tangentImpulse = maxFriction;
                      }
                    } else {
                      tangentImpulse = tangentVelocity;
                      maxFriction = frictionMaxStatic;
                    }
                    var oAcN = offsetAX * normalY - offsetAY * normalX, oBcN = offsetBX * normalY - offsetBY * normalX, share = contactShare / (inverseMassTotal + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);
                    var normalImpulse = (1 + pair.restitution) * normalVelocity * share;
                    tangentImpulse *= share;
                    if (normalVelocity < restingThresh) {
                      contact.normalImpulse = 0;
                    } else {
                      var contactNormalImpulse = contact.normalImpulse;
                      contact.normalImpulse += normalImpulse;
                      if (contact.normalImpulse > 0) contact.normalImpulse = 0;
                      normalImpulse = contact.normalImpulse - contactNormalImpulse;
                    }
                    if (tangentVelocity < -restingThreshTangent || tangentVelocity > restingThreshTangent) {
                      contact.tangentImpulse = 0;
                    } else {
                      var contactTangentImpulse = contact.tangentImpulse;
                      contact.tangentImpulse += tangentImpulse;
                      if (contact.tangentImpulse < -maxFriction) contact.tangentImpulse = -maxFriction;
                      if (contact.tangentImpulse > maxFriction) contact.tangentImpulse = maxFriction;
                      tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                    }
                    var impulseX = normalX * normalImpulse + tangentX * tangentImpulse, impulseY = normalY * normalImpulse + tangentY * tangentImpulse;
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                      bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                      bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                      bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * bodyA.inverseInertia;
                    }
                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                      bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                      bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                      bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * bodyB.inverseInertia;
                    }
                  }
                }
              };
            })();
          }),
          /* 19 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Pairs = {};
            module2.exports = Pairs;
            var Pair = __webpack_require__(9);
            var Common = __webpack_require__(0);
            (function() {
              Pairs.create = function(options) {
                return Common.extend({
                  table: {},
                  list: [],
                  collisionStart: [],
                  collisionActive: [],
                  collisionEnd: []
                }, options);
              };
              Pairs.update = function(pairs, collisions, timestamp) {
                var pairUpdate = Pair.update, pairCreate = Pair.create, pairSetActive = Pair.setActive, pairsTable = pairs.table, pairsList = pairs.list, pairsListLength = pairsList.length, pairsListIndex = pairsListLength, collisionStart = pairs.collisionStart, collisionEnd = pairs.collisionEnd, collisionActive = pairs.collisionActive, collisionsLength = collisions.length, collisionStartIndex = 0, collisionEndIndex = 0, collisionActiveIndex = 0, collision, pair, i;
                for (i = 0; i < collisionsLength; i++) {
                  collision = collisions[i];
                  pair = collision.pair;
                  if (pair) {
                    if (pair.isActive) {
                      collisionActive[collisionActiveIndex++] = pair;
                    }
                    pairUpdate(pair, collision, timestamp);
                  } else {
                    pair = pairCreate(collision, timestamp);
                    pairsTable[pair.id] = pair;
                    collisionStart[collisionStartIndex++] = pair;
                    pairsList[pairsListIndex++] = pair;
                  }
                }
                pairsListIndex = 0;
                pairsListLength = pairsList.length;
                for (i = 0; i < pairsListLength; i++) {
                  pair = pairsList[i];
                  if (pair.timeUpdated >= timestamp) {
                    pairsList[pairsListIndex++] = pair;
                  } else {
                    pairSetActive(pair, false, timestamp);
                    if (pair.collision.bodyA.sleepCounter > 0 && pair.collision.bodyB.sleepCounter > 0) {
                      pairsList[pairsListIndex++] = pair;
                    } else {
                      collisionEnd[collisionEndIndex++] = pair;
                      delete pairsTable[pair.id];
                    }
                  }
                }
                if (pairsList.length !== pairsListIndex) {
                  pairsList.length = pairsListIndex;
                }
                if (collisionStart.length !== collisionStartIndex) {
                  collisionStart.length = collisionStartIndex;
                }
                if (collisionEnd.length !== collisionEndIndex) {
                  collisionEnd.length = collisionEndIndex;
                }
                if (collisionActive.length !== collisionActiveIndex) {
                  collisionActive.length = collisionActiveIndex;
                }
              };
              Pairs.clear = function(pairs) {
                pairs.table = {};
                pairs.list.length = 0;
                pairs.collisionStart.length = 0;
                pairs.collisionActive.length = 0;
                pairs.collisionEnd.length = 0;
                return pairs;
              };
            })();
          }),
          /* 20 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Matter4 = module2.exports = __webpack_require__(21);
            Matter4.Axes = __webpack_require__(11);
            Matter4.Bodies = __webpack_require__(12);
            Matter4.Body = __webpack_require__(4);
            Matter4.Bounds = __webpack_require__(1);
            Matter4.Collision = __webpack_require__(8);
            Matter4.Common = __webpack_require__(0);
            Matter4.Composite = __webpack_require__(6);
            Matter4.Composites = __webpack_require__(22);
            Matter4.Constraint = __webpack_require__(10);
            Matter4.Contact = __webpack_require__(16);
            Matter4.Detector = __webpack_require__(13);
            Matter4.Engine = __webpack_require__(17);
            Matter4.Events = __webpack_require__(5);
            Matter4.Grid = __webpack_require__(23);
            Matter4.Mouse = __webpack_require__(14);
            Matter4.MouseConstraint = __webpack_require__(24);
            Matter4.Pair = __webpack_require__(9);
            Matter4.Pairs = __webpack_require__(19);
            Matter4.Plugin = __webpack_require__(15);
            Matter4.Query = __webpack_require__(25);
            Matter4.Render = __webpack_require__(26);
            Matter4.Resolver = __webpack_require__(18);
            Matter4.Runner = __webpack_require__(27);
            Matter4.SAT = __webpack_require__(28);
            Matter4.Sleeping = __webpack_require__(7);
            Matter4.Svg = __webpack_require__(29);
            Matter4.Vector = __webpack_require__(2);
            Matter4.Vertices = __webpack_require__(3);
            Matter4.World = __webpack_require__(30);
            Matter4.Engine.run = Matter4.Runner.run;
            Matter4.Common.deprecated(Matter4.Engine, "run", "Engine.run \u27A4 use Matter.Runner.run(engine) instead");
          }),
          /* 21 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Matter4 = {};
            module2.exports = Matter4;
            var Plugin = __webpack_require__(15);
            var Common = __webpack_require__(0);
            (function() {
              Matter4.name = "matter-js";
              Matter4.version = true ? "0.20.0" : void 0;
              Matter4.uses = [];
              Matter4.used = [];
              Matter4.use = function() {
                Plugin.use(Matter4, Array.prototype.slice.call(arguments));
              };
              Matter4.before = function(path, func) {
                path = path.replace(/^Matter./, "");
                return Common.chainPathBefore(Matter4, path, func);
              };
              Matter4.after = function(path, func) {
                path = path.replace(/^Matter./, "");
                return Common.chainPathAfter(Matter4, path, func);
              };
            })();
          }),
          /* 22 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Composites = {};
            module2.exports = Composites;
            var Composite = __webpack_require__(6);
            var Constraint = __webpack_require__(10);
            var Common = __webpack_require__(0);
            var Body = __webpack_require__(4);
            var Bodies = __webpack_require__(12);
            var deprecated = Common.deprecated;
            (function() {
              Composites.stack = function(x, y, columns, rows, columnGap, rowGap, callback) {
                var stack = Composite.create({ label: "Stack" }), currentX = x, currentY = y, lastBody, i = 0;
                for (var row = 0; row < rows; row++) {
                  var maxHeight = 0;
                  for (var column = 0; column < columns; column++) {
                    var body = callback(currentX, currentY, column, row, lastBody, i);
                    if (body) {
                      var bodyHeight = body.bounds.max.y - body.bounds.min.y, bodyWidth = body.bounds.max.x - body.bounds.min.x;
                      if (bodyHeight > maxHeight)
                        maxHeight = bodyHeight;
                      Body.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });
                      currentX = body.bounds.max.x + columnGap;
                      Composite.addBody(stack, body);
                      lastBody = body;
                      i += 1;
                    } else {
                      currentX += columnGap;
                    }
                  }
                  currentY += maxHeight + rowGap;
                  currentX = x;
                }
                return stack;
              };
              Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
                var bodies = composite.bodies;
                for (var i = 1; i < bodies.length; i++) {
                  var bodyA = bodies[i - 1], bodyB = bodies[i], bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y, bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y, bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
                  var defaults = {
                    bodyA,
                    pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                    bodyB,
                    pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
                  };
                  var constraint = Common.extend(defaults, options);
                  Composite.addConstraint(composite, Constraint.create(constraint));
                }
                composite.label += " Chain";
                return composite;
              };
              Composites.mesh = function(composite, columns, rows, crossBrace, options) {
                var bodies = composite.bodies, row, col, bodyA, bodyB, bodyC;
                for (row = 0; row < rows; row++) {
                  for (col = 1; col < columns; col++) {
                    bodyA = bodies[col - 1 + row * columns];
                    bodyB = bodies[col + row * columns];
                    Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA, bodyB }, options)));
                  }
                  if (row > 0) {
                    for (col = 0; col < columns; col++) {
                      bodyA = bodies[col + (row - 1) * columns];
                      bodyB = bodies[col + row * columns];
                      Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA, bodyB }, options)));
                      if (crossBrace && col > 0) {
                        bodyC = bodies[col - 1 + (row - 1) * columns];
                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                      }
                      if (crossBrace && col < columns - 1) {
                        bodyC = bodies[col + 1 + (row - 1) * columns];
                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                      }
                    }
                  }
                }
                composite.label += " Mesh";
                return composite;
              };
              Composites.pyramid = function(x, y, columns, rows, columnGap, rowGap, callback) {
                return Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY, column, row, lastBody, i) {
                  var actualRows = Math.min(rows, Math.ceil(columns / 2)), lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
                  if (row > actualRows)
                    return;
                  row = actualRows - row;
                  var start = row, end = columns - 1 - row;
                  if (column < start || column > end)
                    return;
                  if (i === 1) {
                    Body.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
                  }
                  var xOffset = lastBody ? column * lastBodyWidth : 0;
                  return callback(x + xOffset + column * columnGap, stackY, column, row, lastBody, i);
                });
              };
              Composites.newtonsCradle = function(x, y, number, size, length) {
                var newtonsCradle = Composite.create({ label: "Newtons Cradle" });
                for (var i = 0; i < number; i++) {
                  var separation = 1.9, circle = Bodies.circle(
                    x + i * (size * separation),
                    y + length,
                    size,
                    { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 1e-4, slop: 1 }
                  ), constraint = Constraint.create({ pointA: { x: x + i * (size * separation), y }, bodyB: circle });
                  Composite.addBody(newtonsCradle, circle);
                  Composite.addConstraint(newtonsCradle, constraint);
                }
                return newtonsCradle;
              };
              deprecated(Composites, "newtonsCradle", "Composites.newtonsCradle \u27A4 moved to newtonsCradle example");
              Composites.car = function(x, y, width, height, wheelSize) {
                var group = Body.nextGroup(true), wheelBase = 20, wheelAOffset = -width * 0.5 + wheelBase, wheelBOffset = width * 0.5 - wheelBase, wheelYOffset = 0;
                var car = Composite.create({ label: "Car" }), body = Bodies.rectangle(x, y, width, height, {
                  collisionFilter: {
                    group
                  },
                  chamfer: {
                    radius: height * 0.5
                  },
                  density: 2e-4
                });
                var wheelA = Bodies.circle(x + wheelAOffset, y + wheelYOffset, wheelSize, {
                  collisionFilter: {
                    group
                  },
                  friction: 0.8
                });
                var wheelB = Bodies.circle(x + wheelBOffset, y + wheelYOffset, wheelSize, {
                  collisionFilter: {
                    group
                  },
                  friction: 0.8
                });
                var axelA = Constraint.create({
                  bodyB: body,
                  pointB: { x: wheelAOffset, y: wheelYOffset },
                  bodyA: wheelA,
                  stiffness: 1,
                  length: 0
                });
                var axelB = Constraint.create({
                  bodyB: body,
                  pointB: { x: wheelBOffset, y: wheelYOffset },
                  bodyA: wheelB,
                  stiffness: 1,
                  length: 0
                });
                Composite.addBody(car, body);
                Composite.addBody(car, wheelA);
                Composite.addBody(car, wheelB);
                Composite.addConstraint(car, axelA);
                Composite.addConstraint(car, axelB);
                return car;
              };
              deprecated(Composites, "car", "Composites.car \u27A4 moved to car example");
              Composites.softBody = function(x, y, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
                particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
                constraintOptions = Common.extend({ stiffness: 0.2, render: { type: "line", anchors: false } }, constraintOptions);
                var softBody = Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY) {
                  return Bodies.circle(stackX, stackY, particleRadius, particleOptions);
                });
                Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);
                softBody.label = "Soft Body";
                return softBody;
              };
              deprecated(Composites, "softBody", "Composites.softBody \u27A4 moved to softBody and cloth examples");
            })();
          }),
          /* 23 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Grid = {};
            module2.exports = Grid;
            var Pair = __webpack_require__(9);
            var Common = __webpack_require__(0);
            var deprecated = Common.deprecated;
            (function() {
              Grid.create = function(options) {
                var defaults = {
                  buckets: {},
                  pairs: {},
                  pairsList: [],
                  bucketWidth: 48,
                  bucketHeight: 48
                };
                return Common.extend(defaults, options);
              };
              Grid.update = function(grid, bodies, engine, forceUpdate) {
                var i, col, row, world = engine.world, buckets = grid.buckets, bucket, bucketId, gridChanged = false;
                for (i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (body.isSleeping && !forceUpdate)
                    continue;
                  if (world.bounds && (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x || body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y))
                    continue;
                  var newRegion = Grid._getRegion(grid, body);
                  if (!body.region || newRegion.id !== body.region.id || forceUpdate) {
                    if (!body.region || forceUpdate)
                      body.region = newRegion;
                    var union = Grid._regionUnion(newRegion, body.region);
                    for (col = union.startCol; col <= union.endCol; col++) {
                      for (row = union.startRow; row <= union.endRow; row++) {
                        bucketId = Grid._getBucketId(col, row);
                        bucket = buckets[bucketId];
                        var isInsideNewRegion = col >= newRegion.startCol && col <= newRegion.endCol && row >= newRegion.startRow && row <= newRegion.endRow;
                        var isInsideOldRegion = col >= body.region.startCol && col <= body.region.endCol && row >= body.region.startRow && row <= body.region.endRow;
                        if (!isInsideNewRegion && isInsideOldRegion) {
                          if (isInsideOldRegion) {
                            if (bucket)
                              Grid._bucketRemoveBody(grid, bucket, body);
                          }
                        }
                        if (body.region === newRegion || isInsideNewRegion && !isInsideOldRegion || forceUpdate) {
                          if (!bucket)
                            bucket = Grid._createBucket(buckets, bucketId);
                          Grid._bucketAddBody(grid, bucket, body);
                        }
                      }
                    }
                    body.region = newRegion;
                    gridChanged = true;
                  }
                }
                if (gridChanged)
                  grid.pairsList = Grid._createActivePairsList(grid);
              };
              deprecated(Grid, "update", "Grid.update \u27A4 replaced by Matter.Detector");
              Grid.clear = function(grid) {
                grid.buckets = {};
                grid.pairs = {};
                grid.pairsList = [];
              };
              deprecated(Grid, "clear", "Grid.clear \u27A4 replaced by Matter.Detector");
              Grid._regionUnion = function(regionA, regionB) {
                var startCol = Math.min(regionA.startCol, regionB.startCol), endCol = Math.max(regionA.endCol, regionB.endCol), startRow = Math.min(regionA.startRow, regionB.startRow), endRow = Math.max(regionA.endRow, regionB.endRow);
                return Grid._createRegion(startCol, endCol, startRow, endRow);
              };
              Grid._getRegion = function(grid, body) {
                var bounds = body.bounds, startCol = Math.floor(bounds.min.x / grid.bucketWidth), endCol = Math.floor(bounds.max.x / grid.bucketWidth), startRow = Math.floor(bounds.min.y / grid.bucketHeight), endRow = Math.floor(bounds.max.y / grid.bucketHeight);
                return Grid._createRegion(startCol, endCol, startRow, endRow);
              };
              Grid._createRegion = function(startCol, endCol, startRow, endRow) {
                return {
                  id: startCol + "," + endCol + "," + startRow + "," + endRow,
                  startCol,
                  endCol,
                  startRow,
                  endRow
                };
              };
              Grid._getBucketId = function(column, row) {
                return "C" + column + "R" + row;
              };
              Grid._createBucket = function(buckets, bucketId) {
                var bucket = buckets[bucketId] = [];
                return bucket;
              };
              Grid._bucketAddBody = function(grid, bucket, body) {
                var gridPairs = grid.pairs, pairId = Pair.id, bucketLength = bucket.length, i;
                for (i = 0; i < bucketLength; i++) {
                  var bodyB = bucket[i];
                  if (body.id === bodyB.id || body.isStatic && bodyB.isStatic)
                    continue;
                  var id = pairId(body, bodyB), pair = gridPairs[id];
                  if (pair) {
                    pair[2] += 1;
                  } else {
                    gridPairs[id] = [body, bodyB, 1];
                  }
                }
                bucket.push(body);
              };
              Grid._bucketRemoveBody = function(grid, bucket, body) {
                var gridPairs = grid.pairs, pairId = Pair.id, i;
                bucket.splice(Common.indexOf(bucket, body), 1);
                var bucketLength = bucket.length;
                for (i = 0; i < bucketLength; i++) {
                  var pair = gridPairs[pairId(body, bucket[i])];
                  if (pair)
                    pair[2] -= 1;
                }
              };
              Grid._createActivePairsList = function(grid) {
                var pair, gridPairs = grid.pairs, pairKeys = Common.keys(gridPairs), pairKeysLength = pairKeys.length, pairs = [], k;
                for (k = 0; k < pairKeysLength; k++) {
                  pair = gridPairs[pairKeys[k]];
                  if (pair[2] > 0) {
                    pairs.push(pair);
                  } else {
                    delete gridPairs[pairKeys[k]];
                  }
                }
                return pairs;
              };
            })();
          }),
          /* 24 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var MouseConstraint = {};
            module2.exports = MouseConstraint;
            var Vertices = __webpack_require__(3);
            var Sleeping = __webpack_require__(7);
            var Mouse = __webpack_require__(14);
            var Events = __webpack_require__(5);
            var Detector = __webpack_require__(13);
            var Constraint = __webpack_require__(10);
            var Composite = __webpack_require__(6);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            (function() {
              MouseConstraint.create = function(engine, options) {
                var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);
                if (!mouse) {
                  if (engine && engine.render && engine.render.canvas) {
                    mouse = Mouse.create(engine.render.canvas);
                  } else if (options && options.element) {
                    mouse = Mouse.create(options.element);
                  } else {
                    mouse = Mouse.create();
                    Common.warn("MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected");
                  }
                }
                var constraint = Constraint.create({
                  label: "Mouse Constraint",
                  pointA: mouse.position,
                  pointB: { x: 0, y: 0 },
                  length: 0.01,
                  stiffness: 0.1,
                  angularStiffness: 1,
                  render: {
                    strokeStyle: "#90EE90",
                    lineWidth: 3
                  }
                });
                var defaults = {
                  type: "mouseConstraint",
                  mouse,
                  element: null,
                  body: null,
                  constraint,
                  collisionFilter: {
                    category: 1,
                    mask: 4294967295,
                    group: 0
                  }
                };
                var mouseConstraint = Common.extend(defaults, options);
                Events.on(engine, "beforeUpdate", function() {
                  var allBodies = Composite.allBodies(engine.world);
                  MouseConstraint.update(mouseConstraint, allBodies);
                  MouseConstraint._triggerEvents(mouseConstraint);
                });
                return mouseConstraint;
              };
              MouseConstraint.update = function(mouseConstraint, bodies) {
                var mouse = mouseConstraint.mouse, constraint = mouseConstraint.constraint, body = mouseConstraint.body;
                if (mouse.button === 0) {
                  if (!constraint.bodyB) {
                    for (var i = 0; i < bodies.length; i++) {
                      body = bodies[i];
                      if (Bounds.contains(body.bounds, mouse.position) && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {
                        for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                          var part = body.parts[j];
                          if (Vertices.contains(part.vertices, mouse.position)) {
                            constraint.pointA = mouse.position;
                            constraint.bodyB = mouseConstraint.body = body;
                            constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                            constraint.angleB = body.angle;
                            Sleeping.set(body, false);
                            Events.trigger(mouseConstraint, "startdrag", { mouse, body });
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    Sleeping.set(constraint.bodyB, false);
                    constraint.pointA = mouse.position;
                  }
                } else {
                  constraint.bodyB = mouseConstraint.body = null;
                  constraint.pointB = null;
                  if (body)
                    Events.trigger(mouseConstraint, "enddrag", { mouse, body });
                }
              };
              MouseConstraint._triggerEvents = function(mouseConstraint) {
                var mouse = mouseConstraint.mouse, mouseEvents = mouse.sourceEvents;
                if (mouseEvents.mousemove)
                  Events.trigger(mouseConstraint, "mousemove", { mouse });
                if (mouseEvents.mousedown)
                  Events.trigger(mouseConstraint, "mousedown", { mouse });
                if (mouseEvents.mouseup)
                  Events.trigger(mouseConstraint, "mouseup", { mouse });
                Mouse.clearSourceEvents(mouse);
              };
            })();
          }),
          /* 25 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Query = {};
            module2.exports = Query;
            var Vector = __webpack_require__(2);
            var Collision = __webpack_require__(8);
            var Bounds = __webpack_require__(1);
            var Bodies = __webpack_require__(12);
            var Vertices = __webpack_require__(3);
            (function() {
              Query.collides = function(body, bodies) {
                var collisions = [], bodiesLength = bodies.length, bounds = body.bounds, collides = Collision.collides, overlaps = Bounds.overlaps;
                for (var i = 0; i < bodiesLength; i++) {
                  var bodyA = bodies[i], partsALength = bodyA.parts.length, partsAStart = partsALength === 1 ? 0 : 1;
                  if (overlaps(bodyA.bounds, bounds)) {
                    for (var j = partsAStart; j < partsALength; j++) {
                      var part = bodyA.parts[j];
                      if (overlaps(part.bounds, bounds)) {
                        var collision = collides(part, body);
                        if (collision) {
                          collisions.push(collision);
                          break;
                        }
                      }
                    }
                  }
                }
                return collisions;
              };
              Query.ray = function(bodies, startPoint, endPoint, rayWidth) {
                rayWidth = rayWidth || 1e-100;
                var rayAngle = Vector.angle(startPoint, endPoint), rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)), rayX = (endPoint.x + startPoint.x) * 0.5, rayY = (endPoint.y + startPoint.y) * 0.5, ray = Bodies.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }), collisions = Query.collides(ray, bodies);
                for (var i = 0; i < collisions.length; i += 1) {
                  var collision = collisions[i];
                  collision.body = collision.bodyB = collision.bodyA;
                }
                return collisions;
              };
              Query.region = function(bodies, bounds, outside) {
                var result = [];
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], overlaps = Bounds.overlaps(body.bounds, bounds);
                  if (overlaps && !outside || !overlaps && outside)
                    result.push(body);
                }
                return result;
              };
              Query.point = function(bodies, point) {
                var result = [];
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (Bounds.contains(body.bounds, point)) {
                    for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {
                      var part = body.parts[j];
                      if (Bounds.contains(part.bounds, point) && Vertices.contains(part.vertices, point)) {
                        result.push(body);
                        break;
                      }
                    }
                  }
                }
                return result;
              };
            })();
          }),
          /* 26 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Render = {};
            module2.exports = Render;
            var Body = __webpack_require__(4);
            var Common = __webpack_require__(0);
            var Composite = __webpack_require__(6);
            var Bounds = __webpack_require__(1);
            var Events = __webpack_require__(5);
            var Vector = __webpack_require__(2);
            var Mouse = __webpack_require__(14);
            (function() {
              var _requestAnimationFrame, _cancelAnimationFrame;
              if (typeof window !== "undefined") {
                _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                  window.setTimeout(function() {
                    callback(Common.now());
                  }, 1e3 / 60);
                };
                _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
              }
              Render._goodFps = 30;
              Render._goodDelta = 1e3 / 60;
              Render.create = function(options) {
                var defaults = {
                  engine: null,
                  element: null,
                  canvas: null,
                  mouse: null,
                  frameRequestId: null,
                  timing: {
                    historySize: 60,
                    delta: 0,
                    deltaHistory: [],
                    lastTime: 0,
                    lastTimestamp: 0,
                    lastElapsed: 0,
                    timestampElapsed: 0,
                    timestampElapsedHistory: [],
                    engineDeltaHistory: [],
                    engineElapsedHistory: [],
                    engineUpdatesHistory: [],
                    elapsedHistory: []
                  },
                  options: {
                    width: 800,
                    height: 600,
                    pixelRatio: 1,
                    background: "#14151f",
                    wireframeBackground: "#14151f",
                    wireframeStrokeStyle: "#bbb",
                    hasBounds: !!options.bounds,
                    enabled: true,
                    wireframes: true,
                    showSleeping: true,
                    showDebug: false,
                    showStats: false,
                    showPerformance: false,
                    showBounds: false,
                    showVelocity: false,
                    showCollisions: false,
                    showSeparations: false,
                    showAxes: false,
                    showPositions: false,
                    showAngleIndicator: false,
                    showIds: false,
                    showVertexNumbers: false,
                    showConvexHulls: false,
                    showInternalEdges: false,
                    showMousePosition: false
                  }
                };
                var render = Common.extend(defaults, options);
                if (render.canvas) {
                  render.canvas.width = render.options.width || render.canvas.width;
                  render.canvas.height = render.options.height || render.canvas.height;
                }
                render.mouse = options.mouse;
                render.engine = options.engine;
                render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
                render.context = render.canvas.getContext("2d");
                render.textures = {};
                render.bounds = render.bounds || {
                  min: {
                    x: 0,
                    y: 0
                  },
                  max: {
                    x: render.canvas.width,
                    y: render.canvas.height
                  }
                };
                render.controller = Render;
                render.options.showBroadphase = false;
                if (render.options.pixelRatio !== 1) {
                  Render.setPixelRatio(render, render.options.pixelRatio);
                }
                if (Common.isElement(render.element)) {
                  render.element.appendChild(render.canvas);
                }
                return render;
              };
              Render.run = function(render) {
                (function loop(time) {
                  render.frameRequestId = _requestAnimationFrame(loop);
                  _updateTiming(render, time);
                  Render.world(render, time);
                  render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                  if (render.options.showStats || render.options.showDebug) {
                    Render.stats(render, render.context, time);
                  }
                  if (render.options.showPerformance || render.options.showDebug) {
                    Render.performance(render, render.context, time);
                  }
                  render.context.setTransform(1, 0, 0, 1, 0, 0);
                })();
              };
              Render.stop = function(render) {
                _cancelAnimationFrame(render.frameRequestId);
              };
              Render.setPixelRatio = function(render, pixelRatio) {
                var options = render.options, canvas = render.canvas;
                if (pixelRatio === "auto") {
                  pixelRatio = _getPixelRatio(canvas);
                }
                options.pixelRatio = pixelRatio;
                canvas.setAttribute("data-pixel-ratio", pixelRatio);
                canvas.width = options.width * pixelRatio;
                canvas.height = options.height * pixelRatio;
                canvas.style.width = options.width + "px";
                canvas.style.height = options.height + "px";
              };
              Render.setSize = function(render, width, height) {
                render.options.width = width;
                render.options.height = height;
                render.bounds.max.x = render.bounds.min.x + width;
                render.bounds.max.y = render.bounds.min.y + height;
                if (render.options.pixelRatio !== 1) {
                  Render.setPixelRatio(render, render.options.pixelRatio);
                } else {
                  render.canvas.width = width;
                  render.canvas.height = height;
                }
              };
              Render.lookAt = function(render, objects, padding, center) {
                center = typeof center !== "undefined" ? center : true;
                objects = Common.isArray(objects) ? objects : [objects];
                padding = padding || {
                  x: 0,
                  y: 0
                };
                var bounds = {
                  min: { x: Infinity, y: Infinity },
                  max: { x: -Infinity, y: -Infinity }
                };
                for (var i = 0; i < objects.length; i += 1) {
                  var object = objects[i], min3 = object.bounds ? object.bounds.min : object.min || object.position || object, max3 = object.bounds ? object.bounds.max : object.max || object.position || object;
                  if (min3 && max3) {
                    if (min3.x < bounds.min.x)
                      bounds.min.x = min3.x;
                    if (max3.x > bounds.max.x)
                      bounds.max.x = max3.x;
                    if (min3.y < bounds.min.y)
                      bounds.min.y = min3.y;
                    if (max3.y > bounds.max.y)
                      bounds.max.y = max3.y;
                  }
                }
                var width = bounds.max.x - bounds.min.x + 2 * padding.x, height = bounds.max.y - bounds.min.y + 2 * padding.y, viewHeight = render.canvas.height, viewWidth = render.canvas.width, outerRatio = viewWidth / viewHeight, innerRatio = width / height, scaleX = 1, scaleY = 1;
                if (innerRatio > outerRatio) {
                  scaleY = innerRatio / outerRatio;
                } else {
                  scaleX = outerRatio / innerRatio;
                }
                render.options.hasBounds = true;
                render.bounds.min.x = bounds.min.x;
                render.bounds.max.x = bounds.min.x + width * scaleX;
                render.bounds.min.y = bounds.min.y;
                render.bounds.max.y = bounds.min.y + height * scaleY;
                if (center) {
                  render.bounds.min.x += width * 0.5 - width * scaleX * 0.5;
                  render.bounds.max.x += width * 0.5 - width * scaleX * 0.5;
                  render.bounds.min.y += height * 0.5 - height * scaleY * 0.5;
                  render.bounds.max.y += height * 0.5 - height * scaleY * 0.5;
                }
                render.bounds.min.x -= padding.x;
                render.bounds.max.x -= padding.x;
                render.bounds.min.y -= padding.y;
                render.bounds.max.y -= padding.y;
                if (render.mouse) {
                  Mouse.setScale(render.mouse, {
                    x: (render.bounds.max.x - render.bounds.min.x) / render.canvas.width,
                    y: (render.bounds.max.y - render.bounds.min.y) / render.canvas.height
                  });
                  Mouse.setOffset(render.mouse, render.bounds.min);
                }
              };
              Render.startViewTransform = function(render) {
                var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                render.context.setTransform(
                  render.options.pixelRatio / boundsScaleX,
                  0,
                  0,
                  render.options.pixelRatio / boundsScaleY,
                  0,
                  0
                );
                render.context.translate(-render.bounds.min.x, -render.bounds.min.y);
              };
              Render.endViewTransform = function(render) {
                render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
              };
              Render.world = function(render, time) {
                var startTime = Common.now(), engine = render.engine, world = engine.world, canvas = render.canvas, context = render.context, options = render.options, timing = render.timing;
                var allBodies = Composite.allBodies(world), allConstraints = Composite.allConstraints(world), background2 = options.wireframes ? options.wireframeBackground : options.background, bodies = [], constraints = [], i;
                var event = {
                  timestamp: engine.timing.timestamp
                };
                Events.trigger(render, "beforeRender", event);
                if (render.currentBackground !== background2)
                  _applyBackground(render, background2);
                context.globalCompositeOperation = "source-in";
                context.fillStyle = "transparent";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.globalCompositeOperation = "source-over";
                if (options.hasBounds) {
                  for (i = 0; i < allBodies.length; i++) {
                    var body = allBodies[i];
                    if (Bounds.overlaps(body.bounds, render.bounds))
                      bodies.push(body);
                  }
                  for (i = 0; i < allConstraints.length; i++) {
                    var constraint = allConstraints[i], bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointAWorld = constraint.pointA, pointBWorld = constraint.pointB;
                    if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                    if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);
                    if (!pointAWorld || !pointBWorld)
                      continue;
                    if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                      constraints.push(constraint);
                  }
                  Render.startViewTransform(render);
                  if (render.mouse) {
                    Mouse.setScale(render.mouse, {
                      x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,
                      y: (render.bounds.max.y - render.bounds.min.y) / render.options.height
                    });
                    Mouse.setOffset(render.mouse, render.bounds.min);
                  }
                } else {
                  constraints = allConstraints;
                  bodies = allBodies;
                  if (render.options.pixelRatio !== 1) {
                    render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                  }
                }
                if (!options.wireframes || engine.enableSleeping && options.showSleeping) {
                  Render.bodies(render, bodies, context);
                } else {
                  if (options.showConvexHulls)
                    Render.bodyConvexHulls(render, bodies, context);
                  Render.bodyWireframes(render, bodies, context);
                }
                if (options.showBounds)
                  Render.bodyBounds(render, bodies, context);
                if (options.showAxes || options.showAngleIndicator)
                  Render.bodyAxes(render, bodies, context);
                if (options.showPositions)
                  Render.bodyPositions(render, bodies, context);
                if (options.showVelocity)
                  Render.bodyVelocity(render, bodies, context);
                if (options.showIds)
                  Render.bodyIds(render, bodies, context);
                if (options.showSeparations)
                  Render.separations(render, engine.pairs.list, context);
                if (options.showCollisions)
                  Render.collisions(render, engine.pairs.list, context);
                if (options.showVertexNumbers)
                  Render.vertexNumbers(render, bodies, context);
                if (options.showMousePosition)
                  Render.mousePosition(render, render.mouse, context);
                Render.constraints(constraints, context);
                if (options.hasBounds) {
                  Render.endViewTransform(render);
                }
                Events.trigger(render, "afterRender", event);
                timing.lastElapsed = Common.now() - startTime;
              };
              Render.stats = function(render, context, time) {
                var engine = render.engine, world = engine.world, bodies = Composite.allBodies(world), parts = 0, width = 55, height = 44, x = 0, y = 0;
                for (var i = 0; i < bodies.length; i += 1) {
                  parts += bodies[i].parts.length;
                }
                var sections = {
                  "Part": parts,
                  "Body": bodies.length,
                  "Cons": Composite.allConstraints(world).length,
                  "Comp": Composite.allComposites(world).length,
                  "Pair": engine.pairs.list.length
                };
                context.fillStyle = "#0e0f19";
                context.fillRect(x, y, width * 5.5, height);
                context.font = "12px Arial";
                context.textBaseline = "top";
                context.textAlign = "right";
                for (var key in sections) {
                  var section = sections[key];
                  context.fillStyle = "#aaa";
                  context.fillText(key, x + width, y + 8);
                  context.fillStyle = "#eee";
                  context.fillText(section, x + width, y + 26);
                  x += width;
                }
              };
              Render.performance = function(render, context) {
                var engine = render.engine, timing = render.timing, deltaHistory = timing.deltaHistory, elapsedHistory = timing.elapsedHistory, timestampElapsedHistory = timing.timestampElapsedHistory, engineDeltaHistory = timing.engineDeltaHistory, engineUpdatesHistory = timing.engineUpdatesHistory, engineElapsedHistory = timing.engineElapsedHistory, lastEngineUpdatesPerFrame = engine.timing.lastUpdatesPerFrame, lastEngineDelta = engine.timing.lastDelta;
                var deltaMean = _mean(deltaHistory), elapsedMean = _mean(elapsedHistory), engineDeltaMean = _mean(engineDeltaHistory), engineUpdatesMean = _mean(engineUpdatesHistory), engineElapsedMean = _mean(engineElapsedHistory), timestampElapsedMean = _mean(timestampElapsedHistory), rateMean = timestampElapsedMean / deltaMean || 0, neededUpdatesPerFrame = Math.round(deltaMean / lastEngineDelta), fps3 = 1e3 / deltaMean || 0;
                var graphHeight = 4, gap = 12, width = 60, height = 34, x = 10, y = 69;
                context.fillStyle = "#0e0f19";
                context.fillRect(0, 50, gap * 5 + width * 6 + 22, height);
                Render.status(
                  context,
                  x,
                  y,
                  width,
                  graphHeight,
                  deltaHistory.length,
                  Math.round(fps3) + " fps",
                  fps3 / Render._goodFps,
                  function(i) {
                    return deltaHistory[i] / deltaMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + gap + width,
                  y,
                  width,
                  graphHeight,
                  engineDeltaHistory.length,
                  lastEngineDelta.toFixed(2) + " dt",
                  Render._goodDelta / lastEngineDelta,
                  function(i) {
                    return engineDeltaHistory[i] / engineDeltaMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 2,
                  y,
                  width,
                  graphHeight,
                  engineUpdatesHistory.length,
                  lastEngineUpdatesPerFrame + " upf",
                  Math.pow(Common.clamp(engineUpdatesMean / neededUpdatesPerFrame || 1, 0, 1), 4),
                  function(i) {
                    return engineUpdatesHistory[i] / engineUpdatesMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 3,
                  y,
                  width,
                  graphHeight,
                  engineElapsedHistory.length,
                  engineElapsedMean.toFixed(2) + " ut",
                  1 - lastEngineUpdatesPerFrame * engineElapsedMean / Render._goodFps,
                  function(i) {
                    return engineElapsedHistory[i] / engineElapsedMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 4,
                  y,
                  width,
                  graphHeight,
                  elapsedHistory.length,
                  elapsedMean.toFixed(2) + " rt",
                  1 - elapsedMean / Render._goodFps,
                  function(i) {
                    return elapsedHistory[i] / elapsedMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 5,
                  y,
                  width,
                  graphHeight,
                  timestampElapsedHistory.length,
                  rateMean.toFixed(2) + " x",
                  rateMean * rateMean * rateMean,
                  function(i) {
                    return (timestampElapsedHistory[i] / deltaHistory[i] / rateMean || 0) - 1;
                  }
                );
              };
              Render.status = function(context, x, y, width, height, count, label, indicator, plotY) {
                context.strokeStyle = "#888";
                context.fillStyle = "#444";
                context.lineWidth = 1;
                context.fillRect(x, y + 7, width, 1);
                context.beginPath();
                context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));
                for (var i = 0; i < width; i += 1) {
                  context.lineTo(x + i, y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0));
                }
                context.stroke();
                context.fillStyle = "hsl(" + Common.clamp(25 + 95 * indicator, 0, 120) + ",100%,60%)";
                context.fillRect(x, y - 7, 4, 4);
                context.font = "12px Arial";
                context.textBaseline = "middle";
                context.textAlign = "right";
                context.fillStyle = "#eee";
                context.fillText(label, x + width, y - 5);
              };
              Render.constraints = function(constraints, context) {
                var c = context;
                for (var i = 0; i < constraints.length; i++) {
                  var constraint = constraints[i];
                  if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
                    continue;
                  var bodyA = constraint.bodyA, bodyB = constraint.bodyB, start, end;
                  if (bodyA) {
                    start = Vector.add(bodyA.position, constraint.pointA);
                  } else {
                    start = constraint.pointA;
                  }
                  if (constraint.render.type === "pin") {
                    c.beginPath();
                    c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                    c.closePath();
                  } else {
                    if (bodyB) {
                      end = Vector.add(bodyB.position, constraint.pointB);
                    } else {
                      end = constraint.pointB;
                    }
                    c.beginPath();
                    c.moveTo(start.x, start.y);
                    if (constraint.render.type === "spring") {
                      var delta = Vector.sub(end, start), normal = Vector.perp(Vector.normalise(delta)), coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)), offset;
                      for (var j = 1; j < coils; j += 1) {
                        offset = j % 2 === 0 ? 1 : -1;
                        c.lineTo(
                          start.x + delta.x * (j / coils) + normal.x * offset * 4,
                          start.y + delta.y * (j / coils) + normal.y * offset * 4
                        );
                      }
                    }
                    c.lineTo(end.x, end.y);
                  }
                  if (constraint.render.lineWidth) {
                    c.lineWidth = constraint.render.lineWidth;
                    c.strokeStyle = constraint.render.strokeStyle;
                    c.stroke();
                  }
                  if (constraint.render.anchors) {
                    c.fillStyle = constraint.render.strokeStyle;
                    c.beginPath();
                    c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                    c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
                    c.closePath();
                    c.fill();
                  }
                }
              };
              Render.bodies = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options, showInternalEdges = options.showInternalEdges || !options.wireframes, body, part, i, k;
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                    part = body.parts[k];
                    if (!part.render.visible)
                      continue;
                    if (options.showSleeping && body.isSleeping) {
                      c.globalAlpha = 0.5 * part.render.opacity;
                    } else if (part.render.opacity !== 1) {
                      c.globalAlpha = part.render.opacity;
                    }
                    if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
                      var sprite2 = part.render.sprite, texture = _getTexture(render, sprite2.texture);
                      c.translate(part.position.x, part.position.y);
                      c.rotate(part.angle);
                      c.drawImage(
                        texture,
                        texture.width * -sprite2.xOffset * sprite2.xScale,
                        texture.height * -sprite2.yOffset * sprite2.yScale,
                        texture.width * sprite2.xScale,
                        texture.height * sprite2.yScale
                      );
                      c.rotate(-part.angle);
                      c.translate(-part.position.x, -part.position.y);
                    } else {
                      if (part.circleRadius) {
                        c.beginPath();
                        c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                      } else {
                        c.beginPath();
                        c.moveTo(part.vertices[0].x, part.vertices[0].y);
                        for (var j = 1; j < part.vertices.length; j++) {
                          if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                            c.lineTo(part.vertices[j].x, part.vertices[j].y);
                          } else {
                            c.moveTo(part.vertices[j].x, part.vertices[j].y);
                          }
                          if (part.vertices[j].isInternal && !showInternalEdges) {
                            c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                          }
                        }
                        c.lineTo(part.vertices[0].x, part.vertices[0].y);
                        c.closePath();
                      }
                      if (!options.wireframes) {
                        c.fillStyle = part.render.fillStyle;
                        if (part.render.lineWidth) {
                          c.lineWidth = part.render.lineWidth;
                          c.strokeStyle = part.render.strokeStyle;
                          c.stroke();
                        }
                        c.fill();
                      } else {
                        c.lineWidth = 1;
                        c.strokeStyle = render.options.wireframeStrokeStyle;
                        c.stroke();
                      }
                    }
                    c.globalAlpha = 1;
                  }
                }
              };
              Render.bodyWireframes = function(render, bodies, context) {
                var c = context, showInternalEdges = render.options.showInternalEdges, body, part, i, j, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                    part = body.parts[k];
                    c.moveTo(part.vertices[0].x, part.vertices[0].y);
                    for (j = 1; j < part.vertices.length; j++) {
                      if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                        c.lineTo(part.vertices[j].x, part.vertices[j].y);
                      } else {
                        c.moveTo(part.vertices[j].x, part.vertices[j].y);
                      }
                      if (part.vertices[j].isInternal && !showInternalEdges) {
                        c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                      }
                    }
                    c.lineTo(part.vertices[0].x, part.vertices[0].y);
                  }
                }
                c.lineWidth = 1;
                c.strokeStyle = render.options.wireframeStrokeStyle;
                c.stroke();
              };
              Render.bodyConvexHulls = function(render, bodies, context) {
                var c = context, body, part, i, j, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible || body.parts.length === 1)
                    continue;
                  c.moveTo(body.vertices[0].x, body.vertices[0].y);
                  for (j = 1; j < body.vertices.length; j++) {
                    c.lineTo(body.vertices[j].x, body.vertices[j].y);
                  }
                  c.lineTo(body.vertices[0].x, body.vertices[0].y);
                }
                c.lineWidth = 1;
                c.strokeStyle = "rgba(255,255,255,0.2)";
                c.stroke();
              };
              Render.vertexNumbers = function(render, bodies, context) {
                var c = context, i, j, k;
                for (i = 0; i < bodies.length; i++) {
                  var parts = bodies[i].parts;
                  for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
                    var part = parts[k];
                    for (j = 0; j < part.vertices.length; j++) {
                      c.fillStyle = "rgba(255,255,255,0.2)";
                      c.fillText(i + "_" + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
                    }
                  }
                }
              };
              Render.mousePosition = function(render, mouse, context) {
                var c = context;
                c.fillStyle = "rgba(255,255,255,0.8)";
                c.fillText(mouse.position.x + "  " + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);
              };
              Render.bodyBounds = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options;
                c.beginPath();
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (body.render.visible) {
                    var parts = bodies[i].parts;
                    for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      var part = parts[j];
                      c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
                    }
                  }
                }
                if (options.wireframes) {
                  c.strokeStyle = "rgba(255,255,255,0.08)";
                } else {
                  c.strokeStyle = "rgba(0,0,0,0.1)";
                }
                c.lineWidth = 1;
                c.stroke();
              };
              Render.bodyAxes = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options, part, i, j, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  var body = bodies[i], parts = body.parts;
                  if (!body.render.visible)
                    continue;
                  if (options.showAxes) {
                    for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      part = parts[j];
                      for (k = 0; k < part.axes.length; k++) {
                        var axis = part.axes[k];
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
                      }
                    }
                  } else {
                    for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      part = parts[j];
                      for (k = 0; k < part.axes.length; k++) {
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo(
                          (part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2,
                          (part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2
                        );
                      }
                    }
                  }
                }
                if (options.wireframes) {
                  c.strokeStyle = "indianred";
                  c.lineWidth = 1;
                } else {
                  c.strokeStyle = "rgba(255, 255, 255, 0.4)";
                  c.globalCompositeOperation = "overlay";
                  c.lineWidth = 2;
                }
                c.stroke();
                c.globalCompositeOperation = "source-over";
              };
              Render.bodyPositions = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options, body, part, i, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  for (k = 0; k < body.parts.length; k++) {
                    part = body.parts[k];
                    c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
                    c.closePath();
                  }
                }
                if (options.wireframes) {
                  c.fillStyle = "indianred";
                } else {
                  c.fillStyle = "rgba(0,0,0,0.5)";
                }
                c.fill();
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (body.render.visible) {
                    c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
                    c.closePath();
                  }
                }
                c.fillStyle = "rgba(255,165,0,0.8)";
                c.fill();
              };
              Render.bodyVelocity = function(render, bodies, context) {
                var c = context;
                c.beginPath();
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  var velocity = Body.getVelocity(body);
                  c.moveTo(body.position.x, body.position.y);
                  c.lineTo(body.position.x + velocity.x, body.position.y + velocity.y);
                }
                c.lineWidth = 3;
                c.strokeStyle = "cornflowerblue";
                c.stroke();
              };
              Render.bodyIds = function(render, bodies, context) {
                var c = context, i, j;
                for (i = 0; i < bodies.length; i++) {
                  if (!bodies[i].render.visible)
                    continue;
                  var parts = bodies[i].parts;
                  for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    var part = parts[j];
                    c.font = "12px Arial";
                    c.fillStyle = "rgba(255,255,255,0.5)";
                    c.fillText(part.id, part.position.x + 10, part.position.y - 10);
                  }
                }
              };
              Render.collisions = function(render, pairs, context) {
                var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                c.beginPath();
                for (i = 0; i < pairs.length; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  collision = pair.collision;
                  for (j = 0; j < pair.contactCount; j++) {
                    var contact = pair.contacts[j], vertex = contact.vertex;
                    c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
                  }
                }
                if (options.wireframes) {
                  c.fillStyle = "rgba(255,255,255,0.7)";
                } else {
                  c.fillStyle = "orange";
                }
                c.fill();
                c.beginPath();
                for (i = 0; i < pairs.length; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  collision = pair.collision;
                  if (pair.contactCount > 0) {
                    var normalPosX = pair.contacts[0].vertex.x, normalPosY = pair.contacts[0].vertex.y;
                    if (pair.contactCount === 2) {
                      normalPosX = (pair.contacts[0].vertex.x + pair.contacts[1].vertex.x) / 2;
                      normalPosY = (pair.contacts[0].vertex.y + pair.contacts[1].vertex.y) / 2;
                    }
                    if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
                      c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
                    } else {
                      c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
                    }
                    c.lineTo(normalPosX, normalPosY);
                  }
                }
                if (options.wireframes) {
                  c.strokeStyle = "rgba(255,165,0,0.7)";
                } else {
                  c.strokeStyle = "orange";
                }
                c.lineWidth = 1;
                c.stroke();
              };
              Render.separations = function(render, pairs, context) {
                var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                c.beginPath();
                for (i = 0; i < pairs.length; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  collision = pair.collision;
                  bodyA = collision.bodyA;
                  bodyB = collision.bodyB;
                  var k = 1;
                  if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                  if (bodyB.isStatic) k = 0;
                  c.moveTo(bodyB.position.x, bodyB.position.y);
                  c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);
                  k = 1;
                  if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                  if (bodyA.isStatic) k = 0;
                  c.moveTo(bodyA.position.x, bodyA.position.y);
                  c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
                }
                if (options.wireframes) {
                  c.strokeStyle = "rgba(255,165,0,0.5)";
                } else {
                  c.strokeStyle = "orange";
                }
                c.stroke();
              };
              Render.inspector = function(inspector, context) {
                var engine = inspector.engine, selected = inspector.selected, render = inspector.render, options = render.options, bounds;
                if (options.hasBounds) {
                  var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                  context.scale(1 / boundsScaleX, 1 / boundsScaleY);
                  context.translate(-render.bounds.min.x, -render.bounds.min.y);
                }
                for (var i = 0; i < selected.length; i++) {
                  var item = selected[i].data;
                  context.translate(0.5, 0.5);
                  context.lineWidth = 1;
                  context.strokeStyle = "rgba(255,165,0,0.9)";
                  context.setLineDash([1, 2]);
                  switch (item.type) {
                    case "body":
                      bounds = item.bounds;
                      context.beginPath();
                      context.rect(
                        Math.floor(bounds.min.x - 3),
                        Math.floor(bounds.min.y - 3),
                        Math.floor(bounds.max.x - bounds.min.x + 6),
                        Math.floor(bounds.max.y - bounds.min.y + 6)
                      );
                      context.closePath();
                      context.stroke();
                      break;
                    case "constraint":
                      var point = item.pointA;
                      if (item.bodyA)
                        point = item.pointB;
                      context.beginPath();
                      context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                      context.closePath();
                      context.stroke();
                      break;
                  }
                  context.setLineDash([]);
                  context.translate(-0.5, -0.5);
                }
                if (inspector.selectStart !== null) {
                  context.translate(0.5, 0.5);
                  context.lineWidth = 1;
                  context.strokeStyle = "rgba(255,165,0,0.6)";
                  context.fillStyle = "rgba(255,165,0,0.1)";
                  bounds = inspector.selectBounds;
                  context.beginPath();
                  context.rect(
                    Math.floor(bounds.min.x),
                    Math.floor(bounds.min.y),
                    Math.floor(bounds.max.x - bounds.min.x),
                    Math.floor(bounds.max.y - bounds.min.y)
                  );
                  context.closePath();
                  context.stroke();
                  context.fill();
                  context.translate(-0.5, -0.5);
                }
                if (options.hasBounds)
                  context.setTransform(1, 0, 0, 1, 0, 0);
              };
              var _updateTiming = function(render, time) {
                var engine = render.engine, timing = render.timing, historySize = timing.historySize, timestamp = engine.timing.timestamp;
                timing.delta = time - timing.lastTime || Render._goodDelta;
                timing.lastTime = time;
                timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
                timing.lastTimestamp = timestamp;
                timing.deltaHistory.unshift(timing.delta);
                timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);
                timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
                timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);
                timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
                timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);
                timing.engineUpdatesHistory.unshift(engine.timing.lastUpdatesPerFrame);
                timing.engineUpdatesHistory.length = Math.min(timing.engineUpdatesHistory.length, historySize);
                timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
                timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);
                timing.elapsedHistory.unshift(timing.lastElapsed);
                timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);
              };
              var _mean = function(values) {
                var result = 0;
                for (var i = 0; i < values.length; i += 1) {
                  result += values[i];
                }
                return result / values.length || 0;
              };
              var _createCanvas = function(width, height) {
                var canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                canvas.oncontextmenu = function() {
                  return false;
                };
                canvas.onselectstart = function() {
                  return false;
                };
                return canvas;
              };
              var _getPixelRatio = function(canvas) {
                var context = canvas.getContext("2d"), devicePixelRatio = window.devicePixelRatio || 1, backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                return devicePixelRatio / backingStorePixelRatio;
              };
              var _getTexture = function(render, imagePath) {
                var image = render.textures[imagePath];
                if (image)
                  return image;
                image = render.textures[imagePath] = new Image();
                image.src = imagePath;
                return image;
              };
              var _applyBackground = function(render, background2) {
                var cssBackground = background2;
                if (/(jpg|gif|png)$/.test(background2))
                  cssBackground = "url(" + background2 + ")";
                render.canvas.style.background = cssBackground;
                render.canvas.style.backgroundSize = "contain";
                render.currentBackground = background2;
              };
            })();
          }),
          /* 27 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Runner = {};
            module2.exports = Runner;
            var Events = __webpack_require__(5);
            var Engine = __webpack_require__(17);
            var Common = __webpack_require__(0);
            (function() {
              Runner._maxFrameDelta = 1e3 / 15;
              Runner._frameDeltaFallback = 1e3 / 60;
              Runner._timeBufferMargin = 1.5;
              Runner._elapsedNextEstimate = 1;
              Runner._smoothingLowerBound = 0.1;
              Runner._smoothingUpperBound = 0.9;
              Runner.create = function(options) {
                var defaults = {
                  delta: 1e3 / 60,
                  frameDelta: null,
                  frameDeltaSmoothing: true,
                  frameDeltaSnapping: true,
                  frameDeltaHistory: [],
                  frameDeltaHistorySize: 100,
                  frameRequestId: null,
                  timeBuffer: 0,
                  timeLastTick: null,
                  maxUpdates: null,
                  maxFrameTime: 1e3 / 30,
                  lastUpdatesDeferred: 0,
                  enabled: true
                };
                var runner = Common.extend(defaults, options);
                runner.fps = 0;
                return runner;
              };
              Runner.run = function(runner, engine) {
                runner.timeBuffer = Runner._frameDeltaFallback;
                (function onFrame(time) {
                  runner.frameRequestId = Runner._onNextFrame(runner, onFrame);
                  if (time && runner.enabled) {
                    Runner.tick(runner, engine, time);
                  }
                })();
                return runner;
              };
              Runner.tick = function(runner, engine, time) {
                var tickStartTime = Common.now(), engineDelta = runner.delta, updateCount = 0;
                var frameDelta = time - runner.timeLastTick;
                if (!frameDelta || !runner.timeLastTick || frameDelta > Math.max(Runner._maxFrameDelta, runner.maxFrameTime)) {
                  frameDelta = runner.frameDelta || Runner._frameDeltaFallback;
                }
                if (runner.frameDeltaSmoothing) {
                  runner.frameDeltaHistory.push(frameDelta);
                  runner.frameDeltaHistory = runner.frameDeltaHistory.slice(-runner.frameDeltaHistorySize);
                  var deltaHistorySorted = runner.frameDeltaHistory.slice(0).sort();
                  var deltaHistoryWindow = runner.frameDeltaHistory.slice(
                    deltaHistorySorted.length * Runner._smoothingLowerBound,
                    deltaHistorySorted.length * Runner._smoothingUpperBound
                  );
                  var frameDeltaSmoothed = _mean(deltaHistoryWindow);
                  frameDelta = frameDeltaSmoothed || frameDelta;
                }
                if (runner.frameDeltaSnapping) {
                  frameDelta = 1e3 / Math.round(1e3 / frameDelta);
                }
                runner.frameDelta = frameDelta;
                runner.timeLastTick = time;
                runner.timeBuffer += runner.frameDelta;
                runner.timeBuffer = Common.clamp(
                  runner.timeBuffer,
                  0,
                  runner.frameDelta + engineDelta * Runner._timeBufferMargin
                );
                runner.lastUpdatesDeferred = 0;
                var maxUpdates = runner.maxUpdates || Math.ceil(runner.maxFrameTime / engineDelta);
                var event = {
                  timestamp: engine.timing.timestamp
                };
                Events.trigger(runner, "beforeTick", event);
                Events.trigger(runner, "tick", event);
                var updateStartTime = Common.now();
                while (engineDelta > 0 && runner.timeBuffer >= engineDelta * Runner._timeBufferMargin) {
                  Events.trigger(runner, "beforeUpdate", event);
                  Engine.update(engine, engineDelta);
                  Events.trigger(runner, "afterUpdate", event);
                  runner.timeBuffer -= engineDelta;
                  updateCount += 1;
                  var elapsedTimeTotal = Common.now() - tickStartTime, elapsedTimeUpdates = Common.now() - updateStartTime, elapsedNextEstimate = elapsedTimeTotal + Runner._elapsedNextEstimate * elapsedTimeUpdates / updateCount;
                  if (updateCount >= maxUpdates || elapsedNextEstimate > runner.maxFrameTime) {
                    runner.lastUpdatesDeferred = Math.round(Math.max(0, runner.timeBuffer / engineDelta - Runner._timeBufferMargin));
                    break;
                  }
                }
                engine.timing.lastUpdatesPerFrame = updateCount;
                Events.trigger(runner, "afterTick", event);
                if (runner.frameDeltaHistory.length >= 100) {
                  if (runner.lastUpdatesDeferred && Math.round(runner.frameDelta / engineDelta) > maxUpdates) {
                    Common.warnOnce("Matter.Runner: runner reached runner.maxUpdates, see docs.");
                  } else if (runner.lastUpdatesDeferred) {
                    Common.warnOnce("Matter.Runner: runner reached runner.maxFrameTime, see docs.");
                  }
                  if (typeof runner.isFixed !== "undefined") {
                    Common.warnOnce("Matter.Runner: runner.isFixed is now redundant, see docs.");
                  }
                  if (runner.deltaMin || runner.deltaMax) {
                    Common.warnOnce("Matter.Runner: runner.deltaMin and runner.deltaMax were removed, see docs.");
                  }
                  if (runner.fps !== 0) {
                    Common.warnOnce("Matter.Runner: runner.fps was replaced by runner.delta, see docs.");
                  }
                }
              };
              Runner.stop = function(runner) {
                Runner._cancelNextFrame(runner);
              };
              Runner._onNextFrame = function(runner, callback) {
                if (typeof window !== "undefined" && window.requestAnimationFrame) {
                  runner.frameRequestId = window.requestAnimationFrame(callback);
                } else {
                  throw new Error("Matter.Runner: missing required global window.requestAnimationFrame.");
                }
                return runner.frameRequestId;
              };
              Runner._cancelNextFrame = function(runner) {
                if (typeof window !== "undefined" && window.cancelAnimationFrame) {
                  window.cancelAnimationFrame(runner.frameRequestId);
                } else {
                  throw new Error("Matter.Runner: missing required global window.cancelAnimationFrame.");
                }
              };
              var _mean = function(values) {
                var result = 0, valuesLength = values.length;
                for (var i = 0; i < valuesLength; i += 1) {
                  result += values[i];
                }
                return result / valuesLength || 0;
              };
            })();
          }),
          /* 28 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var SAT = {};
            module2.exports = SAT;
            var Collision = __webpack_require__(8);
            var Common = __webpack_require__(0);
            var deprecated = Common.deprecated;
            (function() {
              SAT.collides = function(bodyA, bodyB) {
                return Collision.collides(bodyA, bodyB);
              };
              deprecated(SAT, "collides", "SAT.collides \u27A4 replaced by Collision.collides");
            })();
          }),
          /* 29 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Svg = {};
            module2.exports = Svg;
            var Bounds = __webpack_require__(1);
            var Common = __webpack_require__(0);
            (function() {
              Svg.pathToVertices = function(path, sampleLength) {
                if (typeof window !== "undefined" && !("SVGPathSeg" in window)) {
                  Common.warn("Svg.pathToVertices: SVGPathSeg not defined, a polyfill is required.");
                }
                var i, il, total, point, segment, segments, segmentsQueue, lastSegment, lastPoint, segmentIndex, points = [], lx, ly, length = 0, x = 0, y = 0;
                sampleLength = sampleLength || 15;
                var addPoint = function(px, py, pathSegType) {
                  var isRelative = pathSegType % 2 === 1 && pathSegType > 1;
                  if (!lastPoint || px != lastPoint.x || py != lastPoint.y) {
                    if (lastPoint && isRelative) {
                      lx = lastPoint.x;
                      ly = lastPoint.y;
                    } else {
                      lx = 0;
                      ly = 0;
                    }
                    var point2 = {
                      x: lx + px,
                      y: ly + py
                    };
                    if (isRelative || !lastPoint) {
                      lastPoint = point2;
                    }
                    points.push(point2);
                    x = lx + px;
                    y = ly + py;
                  }
                };
                var addSegmentPoint = function(segment2) {
                  var segType = segment2.pathSegTypeAsLetter.toUpperCase();
                  if (segType === "Z")
                    return;
                  switch (segType) {
                    case "M":
                    case "L":
                    case "T":
                    case "C":
                    case "S":
                    case "Q":
                      x = segment2.x;
                      y = segment2.y;
                      break;
                    case "H":
                      x = segment2.x;
                      break;
                    case "V":
                      y = segment2.y;
                      break;
                  }
                  addPoint(x, y, segment2.pathSegType);
                };
                Svg._svgPathToAbsolute(path);
                total = path.getTotalLength();
                segments = [];
                for (i = 0; i < path.pathSegList.numberOfItems; i += 1)
                  segments.push(path.pathSegList.getItem(i));
                segmentsQueue = segments.concat();
                while (length < total) {
                  segmentIndex = path.getPathSegAtLength(length);
                  segment = segments[segmentIndex];
                  if (segment != lastSegment) {
                    while (segmentsQueue.length && segmentsQueue[0] != segment)
                      addSegmentPoint(segmentsQueue.shift());
                    lastSegment = segment;
                  }
                  switch (segment.pathSegTypeAsLetter.toUpperCase()) {
                    case "C":
                    case "T":
                    case "S":
                    case "Q":
                    case "A":
                      point = path.getPointAtLength(length);
                      addPoint(point.x, point.y, 0);
                      break;
                  }
                  length += sampleLength;
                }
                for (i = 0, il = segmentsQueue.length; i < il; ++i)
                  addSegmentPoint(segmentsQueue[i]);
                return points;
              };
              Svg._svgPathToAbsolute = function(path) {
                var x0, y0, x1, y1, x2, y2, segs = path.pathSegList, x = 0, y = 0, len = segs.numberOfItems;
                for (var i = 0; i < len; ++i) {
                  var seg = segs.getItem(i), segType = seg.pathSegTypeAsLetter;
                  if (/[MLHVCSQTA]/.test(segType)) {
                    if ("x" in seg) x = seg.x;
                    if ("y" in seg) y = seg.y;
                  } else {
                    if ("x1" in seg) x1 = x + seg.x1;
                    if ("x2" in seg) x2 = x + seg.x2;
                    if ("y1" in seg) y1 = y + seg.y1;
                    if ("y2" in seg) y2 = y + seg.y2;
                    if ("x" in seg) x += seg.x;
                    if ("y" in seg) y += seg.y;
                    switch (segType) {
                      case "m":
                        segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i);
                        break;
                      case "l":
                        segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i);
                        break;
                      case "h":
                        segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i);
                        break;
                      case "v":
                        segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i);
                        break;
                      case "c":
                        segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);
                        break;
                      case "s":
                        segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);
                        break;
                      case "q":
                        segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);
                        break;
                      case "t":
                        segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);
                        break;
                      case "a":
                        segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);
                        break;
                      case "z":
                      case "Z":
                        x = x0;
                        y = y0;
                        break;
                    }
                  }
                  if (segType == "M" || segType == "m") {
                    x0 = x;
                    y0 = y;
                  }
                }
              };
            })();
          }),
          /* 30 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var World = {};
            module2.exports = World;
            var Composite = __webpack_require__(6);
            var Common = __webpack_require__(0);
            (function() {
              World.create = Composite.create;
              World.add = Composite.add;
              World.remove = Composite.remove;
              World.clear = Composite.clear;
              World.addComposite = Composite.addComposite;
              World.addBody = Composite.addBody;
              World.addConstraint = Composite.addConstraint;
            })();
          })
          /******/
        ])
      );
    });
  }
});

// packages/engine/dist/physics/physics_world.js
function physics_world_step(delta_ms = 1e3 / 60) {
  if (!_engine)
    return;
  import_matter_js.default.Engine.update(_engine, delta_ms);
}
function physics_world_get_engine() {
  return _engine;
}
function _get_world() {
  return _world;
}
var import_matter_js, _engine, _world;
var init_physics_world = __esm({
  "packages/engine/dist/physics/physics_world.js"() {
    "use strict";
    init_engine_globals();
    import_matter_js = __toESM(require_matter(), 1);
    _engine = null;
    _world = null;
  }
});

// packages/engine/dist/core/game_state.js
function _consume_no_more_lives() {
  if (_lives <= 0 && _lives_armed) {
    _lives_armed = false;
    return true;
  }
  if (_lives > 0)
    _lives_armed = true;
  return false;
}
function _consume_no_more_health() {
  if (_health <= 0 && _health_armed) {
    _health_armed = false;
    return true;
  }
  if (_health > 0)
    _health_armed = true;
  return false;
}
function _reset_game_state() {
  _score = 0;
  _lives = 3;
  _health = 100;
  _lives_armed = true;
  _health_armed = true;
}
var _score, _lives, _health, _lives_armed, _health_armed;
var init_game_state = __esm({
  "packages/engine/dist/core/game_state.js"() {
    "use strict";
    init_engine_globals();
    _score = 0;
    _lives = 3;
    _health = 100;
    _lives_armed = true;
    _health_armed = true;
  }
});

// packages/engine/dist/core/game_loop.js
function set_frame_hooks(begin, end) {
  _begin_frame = begin;
  _end_frame = end;
}
function set_room_render_hook(fn) {
  _draw_room = fn;
}
var _begin_frame, _end_frame, _draw_room, game_loop;
var init_game_loop = __esm({
  "packages/engine/dist/core/game_loop.js"() {
    "use strict";
    init_engine_globals();
    init_game_event();
    init_room();
    init_resource();
    init_keyboard();
    init_mouse();
    init_gamepad();
    init_touch();
    init_physics_world();
    init_game_state();
    _begin_frame = null;
    _end_frame = null;
    _draw_room = null;
    game_loop = class {
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
      static start(room2) {
        if (room2) {
          this.room = room2;
          this.room_first = room2.id;
        }
        this._pending_game_start = true;
        this._pending_room_start = true;
        this._stopped = false;
        this.last_delta = performance.now();
        requestAnimationFrame(this.tick.bind(this));
      }
      /**
       * Main loop tick called every frame by requestAnimationFrame.
       * Handles timing, runs fixed timestep updates, and draws once per frame.
       * @param current - The current timestamp provided by requestAnimationFrame
       */
      static tick(current) {
        if (this._stopped)
          return;
        this.room_delta = current - this.last_delta;
        this.last_delta = current;
        this.accumulator += this.room_delta;
        this.delta_time_us = this.room_delta * 1e3;
        this.fps_real = this.room_delta > 0 ? Math.round(1e3 / this.room_delta) : 0;
        this._fps_accum += this.room_delta;
        this._fps_frames += 1;
        if (this._fps_accum >= 1e3) {
          this.fps = this._fps_frames;
          this._fps_frames = 0;
          this._fps_accum -= 1e3;
        }
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
        const createEvents = [...this.update_events.get(EVENT_TYPE.create) ?? []];
        this.update_events.set(EVENT_TYPE.create, []);
        createEvents.forEach((e) => e.run());
        if (this._pending_game_start) {
          this._pending_game_start = false;
          this._dispatch_lifecycle("on_game_start");
        }
        if (this._pending_room_start) {
          this._pending_room_start = false;
          if (this.room?.creation_code)
            this.room.creation_code();
          this._dispatch_lifecycle("on_room_start");
        }
        this.update_events.get(EVENT_TYPE.step_begin)?.forEach((e) => e.run());
        this.update_events.get(EVENT_TYPE.step)?.forEach((e) => e.run());
        this._step_physics();
        this.update_events.get(EVENT_TYPE.step_end)?.forEach((e) => e.run());
        if (_consume_no_more_lives())
          this._dispatch_lifecycle("on_no_more_lives");
        if (_consume_no_more_health())
          this._dispatch_lifecycle("on_no_more_health");
        this.update_events.get(EVENT_TYPE.collision)?.forEach((e) => e.run());
        this.update_events.get(EVENT_TYPE.keyboard)?.forEach((e) => e.run());
        this.update_events.get(EVENT_TYPE.mouse)?.forEach((e) => e.run());
        this.update_events.get(EVENT_TYPE.other)?.forEach((e) => e.run());
        this.update_events.get(EVENT_TYPE.async)?.forEach((e) => e.run());
        const destroyEvents = [...this.update_events.get(EVENT_TYPE.destroy) ?? []];
        this.update_events.set(EVENT_TYPE.destroy, []);
        destroyEvents.forEach((e) => e.run());
        keyboard_manager.end_step();
        mouse_manager.end_step();
        touch_manager.end_step();
      }
      /**
       * Advances the physics world (if one exists) and syncs physics instances.
       * Runs between Step and End Step, matching GMS ordering. No-op for non-physics games.
       */
      static _step_physics() {
        if (!physics_world_get_engine() || !this.room)
          return;
        const instances = this.room.instance_get_all();
        for (const inst of instances)
          inst.phy_ensure_body();
        physics_world_step();
        for (const inst of instances)
          if (inst.active)
            inst.phy_sync_from_body();
      }
      /**
       * Runs all draw events in GMS order.
       * Called once per frame after all updates have completed.
       * begin_frame clears the canvas; end_frame flushes the batch.
       */
      static draw() {
        _begin_frame?.();
        const run_instances = () => {
          const rm = this.room;
          if (!rm)
            return;
          const insts = rm.instance_get_all().filter((i) => i.active && i.visible).sort((a, b) => b.depth - a.depth);
          for (const i of insts)
            i.run_draw_begin();
          for (const i of insts)
            i.run_draw();
          for (const i of insts)
            i.run_draw_end();
        };
        if (_draw_room && this.room) {
          _draw_room(this.room, run_instances);
        } else {
          run_instances();
        }
        this.draw_events.get(EVENT_TYPE.draw_gui)?.forEach((e) => e.run());
        _end_frame?.();
      }
      /**
       * Registers a function to be called for a specific event type.
       * @param event - The event type to register for
       * @param func - The function to call when the event fires
       */
      static register(event, func) {
        const targetMap = event === EVENT_TYPE.draw_begin || event === EVENT_TYPE.draw || event === EVENT_TYPE.draw_end || event === EVENT_TYPE.draw_gui ? this.draw_events : this.update_events;
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
        const targetMap = event === EVENT_TYPE.draw_begin || event === EVENT_TYPE.draw || event === EVENT_TYPE.draw_end || event === EVENT_TYPE.draw_gui ? this.draw_events : this.update_events;
        const existing = targetMap.get(event) ?? [];
        const filtered = existing.filter((e) => e.event !== func);
        targetMap.set(event, filtered);
      }
      /**
       * Transitions to a new room, clearing current events and loading the new room's state.
       * @param room - The room to transition to
       */
      static change_room(room2) {
        this._dispatch_lifecycle("on_room_end");
        if (this.room && this.room.room_persistent) {
        }
        this.update_events.clear();
        this.draw_events.clear();
        this.room = room2;
        this.room_speed = room2.room_speed;
        room2.register_all_instances();
        this._pending_room_start = true;
      }
      /**
       * Ends the game: fires the Game End event for all instances, then halts the loop.
       */
      static end() {
        this._dispatch_lifecycle("on_game_end");
        this._stopped = true;
      }
      /**
       * Restarts the game by returning to the first room.
       */
      static restart() {
        _reset_game_state();
        const first = resource.findByID(this.room_first);
        if (first instanceof room)
          this.change_room(first);
      }
      /**
       * Calls a lifecycle event method on every active instance in the current room.
       * @param method - Name of the lifecycle method to invoke
       */
      static _dispatch_lifecycle(method) {
        if (!this.room)
          return;
        for (const inst of this.room.instance_get_all()) {
          if (inst.active)
            inst[method]();
        }
      }
    };
    game_loop.room_speed = 60;
    game_loop.room_delta = 0;
    game_loop.last_delta = 0;
    game_loop.accumulator = 0;
    game_loop.fps = 0;
    game_loop.fps_real = 0;
    game_loop.delta_time_us = 0;
    game_loop._fps_frames = 0;
    game_loop._fps_accum = 0;
    game_loop.room = null;
    game_loop.room_first = -1;
    game_loop.room_last = 0;
    game_loop._canvas = null;
    game_loop._pending_game_start = false;
    game_loop._pending_room_start = false;
    game_loop._stopped = false;
    game_loop.update_events = /* @__PURE__ */ new Map();
    game_loop.draw_events = /* @__PURE__ */ new Map();
  }
});

// packages/engine/dist/core/system.js
var _now, _start;
var init_system = __esm({
  "packages/engine/dist/core/system.js"() {
    "use strict";
    init_engine_globals();
    init_game_loop();
    _now = () => typeof performance !== "undefined" ? performance.now() : Date.now();
    _start = _now();
  }
});

// packages/engine/dist/utils/datetime.js
var init_datetime = __esm({
  "packages/engine/dist/utils/datetime.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/collision/collision.js
function get_bbox(inst, x, y) {
  const px = x ?? inst.x;
  const py = y ?? inst.y;
  if (inst.mask_manual) {
    return {
      left: px + inst.mask_off_left,
      top: py + inst.mask_off_top,
      right: px + inst.mask_off_right,
      bottom: py + inst.mask_off_bottom
    };
  }
  const sprite2 = get_sprite_for_instance(inst);
  if (!sprite2) {
    return { left: px, top: py, right: px + 1, bottom: py + 1 };
  }
  const sx = inst.image_xscale;
  const sy = inst.image_yscale;
  const ox = sprite2.xoffset * sx;
  const oy = sprite2.yoffset * sy;
  const has_mask = sprite2.mask_left >= 0;
  const ml = has_mask ? sprite2.mask_left : 0;
  const mt = has_mask ? sprite2.mask_top : 0;
  const mr = has_mask ? sprite2.mask_right : sprite2.width;
  const mb = has_mask ? sprite2.mask_bottom : sprite2.height;
  return {
    left: px - ox + ml * sx,
    top: py - oy + mt * sy,
    right: px - ox + mr * sx,
    bottom: py - oy + mb * sy
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
  if (idx < 0)
    return null;
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
  if (a === b)
    return false;
  if (!b.active)
    return false;
  const bbox_a = get_bbox(a, ax, ay);
  const bbox_b = get_bbox(b);
  return bbox_overlap(bbox_a.left, bbox_a.top, bbox_a.right, bbox_a.bottom, bbox_b.left, bbox_b.top, bbox_b.right, bbox_b.bottom);
}
function point_in_instance(px, py, b) {
  if (!b.active)
    return false;
  const bbox = get_bbox(b);
  return px >= bbox.left && px < bbox.right && py >= bbox.top && py < bbox.bottom;
}
var init_collision = __esm({
  "packages/engine/dist/collision/collision.js"() {
    "use strict";
    init_engine_globals();
    init_resource();
  }
});

// packages/engine/dist/core/path.js
function _catmull_rom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function _eval_path(path, t) {
  const pts = path.points;
  const n = pts.length;
  if (n === 0)
    return { x: 0, y: 0, speed: 1 };
  if (n === 1) {
    const p = pts[0];
    return { x: p.x, y: p.y, speed: p.speed };
  }
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
  const wrap3 = (i) => (i % n + n) % n;
  const p0 = pts[path.closed ? wrap3(seg_i - 1) : Math.max(seg_i - 1, 0)];
  const p1 = pts[seg_i];
  const p2 = pts[(seg_i + 1) % n];
  const p3 = pts[path.closed ? wrap3(seg_i + 2) : Math.min(seg_i + 2, n - 1)];
  return {
    x: _catmull_rom(p0.x, p1.x, p2.x, p3.x, local_t),
    y: _catmull_rom(p0.y, p1.y, p2.y, p3.y, local_t),
    speed: _catmull_rom(p0.speed, p1.speed, p2.speed, p3.speed, local_t)
  };
}
function _compute_length(path) {
  const steps = path.points.length * path.precision;
  if (steps < 2)
    return 0;
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
function path_exists(path_id) {
  return _paths.has(path_id);
}
function path_get_x(path_id, t) {
  const p = _paths.get(path_id);
  return p ? _eval_path(p, t).x : 0;
}
function path_get_y(path_id, t) {
  const p = _paths.get(path_id);
  return p ? _eval_path(p, t).y : 0;
}
function path_get_length(path_id) {
  const p = _paths.get(path_id);
  return p ? _compute_length(p) : 0;
}
var path_kind_linear, _paths, path_action_stop, path_action_restart, path_action_continue, path_action_reverse;
var init_path = __esm({
  "packages/engine/dist/core/path.js"() {
    "use strict";
    init_engine_globals();
    path_kind_linear = 0;
    _paths = /* @__PURE__ */ new Map();
    path_action_stop = 0;
    path_action_restart = 1;
    path_action_continue = 2;
    path_action_reverse = 3;
  }
});

// packages/engine/dist/core/motion_planning.js
function _mp_potential_settings() {
  return _potential;
}
var _potential;
var init_motion_planning = __esm({
  "packages/engine/dist/core/motion_planning.js"() {
    "use strict";
    init_engine_globals();
    init_game_loop();
    init_path();
    _potential = { maxrot: 180, rotstep: 15 };
  }
});

// packages/engine/dist/math/random.js
function _mulberry32() {
  _seed |= 0;
  _seed = _seed + 1831565813 | 0;
  let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function irandom_range(lo, hi) {
  return Math.floor(lo + _mulberry32() * (hi - lo + 1));
}
var _seed;
var init_random = __esm({
  "packages/engine/dist/math/random.js"() {
    "use strict";
    init_engine_globals();
    _seed = 0;
  }
});

// packages/engine/dist/physics/physics_body.js
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
function physics_fixture_create() {
  const id = _next_fixture_id++;
  _fixtures.set(id, _make_default_fixture());
  return id;
}
function physics_fixture_set_box(fixture_id, w, h) {
  const f = _fixtures.get(fixture_id);
  if (!f)
    return;
  f.shape = FIXTURE_SHAPE_RECT;
  f.w = w;
  f.h = h;
}
function physics_fixture_set_circle(fixture_id, radius) {
  const f = _fixtures.get(fixture_id);
  if (!f)
    return;
  f.shape = FIXTURE_SHAPE_CIRCLE;
  f.w = radius;
}
function physics_fixture_set_density(fixture_id, density) {
  const f = _fixtures.get(fixture_id);
  if (f)
    f.density = density;
}
function physics_fixture_set_restitution(fixture_id, restitution) {
  const f = _fixtures.get(fixture_id);
  if (f)
    f.restitution = Math.max(0, Math.min(1, restitution));
}
function physics_fixture_set_friction(fixture_id, friction) {
  const f = _fixtures.get(fixture_id);
  if (f)
    f.friction = Math.max(0, friction);
}
function physics_fixture_set_sensor(fixture_id, is_sensor) {
  const f = _fixtures.get(fixture_id);
  if (f)
    f.is_sensor = is_sensor;
}
function physics_fixture_bind(fixture_id, x, y, is_static = false) {
  const world = _get_world();
  if (!world)
    return -1;
  const f = _fixtures.get(fixture_id);
  if (!f)
    return -1;
  let body;
  switch (f.shape) {
    case FIXTURE_SHAPE_CIRCLE:
      body = import_matter_js2.default.Bodies.circle(x, y, f.w, {
        density: f.density,
        restitution: f.restitution,
        friction: f.friction,
        isStatic: is_static,
        isSensor: f.is_sensor
      });
      break;
    case FIXTURE_SHAPE_POLYGON:
      body = import_matter_js2.default.Bodies.fromVertices(x, y, [f.verts], {
        density: f.density,
        restitution: f.restitution,
        friction: f.friction,
        isStatic: is_static,
        isSensor: f.is_sensor
      });
      break;
    default:
      body = import_matter_js2.default.Bodies.rectangle(x, y, f.w, f.h, {
        density: f.density,
        restitution: f.restitution,
        friction: f.friction,
        isStatic: is_static,
        isSensor: f.is_sensor
      });
  }
  import_matter_js2.default.World.add(world, body);
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
  if (!body)
    return;
  if (world)
    import_matter_js2.default.World.remove(world, body);
  _bodies.delete(body_id);
}
function physics_body_apply_force(body_id, fx, fy) {
  const body = _bodies.get(body_id);
  if (!body)
    return;
  import_matter_js2.default.Body.applyForce(body, body.position, { x: fx, y: fy });
}
function physics_body_apply_impulse(body_id, ix, iy) {
  const body = _bodies.get(body_id);
  if (!body)
    return;
  const inv_mass = body.mass > 0 ? 1 / body.mass : 0;
  import_matter_js2.default.Body.setVelocity(body, {
    x: body.velocity.x + ix * inv_mass,
    y: body.velocity.y + iy * inv_mass
  });
}
function physics_body_set_velocity(body_id, vx, vy) {
  const body = _bodies.get(body_id);
  if (!body)
    return;
  import_matter_js2.default.Body.setVelocity(body, { x: vx, y: vy });
}
function physics_body_set_position(body_id, x, y) {
  const body = _bodies.get(body_id);
  if (!body)
    return;
  import_matter_js2.default.Body.setPosition(body, { x, y });
}
function physics_body_get_x(body_id) {
  return _bodies.get(body_id)?.position.x ?? 0;
}
function physics_body_get_y(body_id) {
  return _bodies.get(body_id)?.position.y ?? 0;
}
function physics_body_get_angle(body_id) {
  const body = _bodies.get(body_id);
  if (!body)
    return 0;
  return body.angle * 180 / Math.PI;
}
function physics_body_get_vx(body_id) {
  return _bodies.get(body_id)?.velocity.x ?? 0;
}
function physics_body_get_vy(body_id) {
  return _bodies.get(body_id)?.velocity.y ?? 0;
}
var import_matter_js2, FIXTURE_SHAPE_RECT, FIXTURE_SHAPE_CIRCLE, FIXTURE_SHAPE_POLYGON, _fixtures, _next_fixture_id, _bodies, _next_body_id;
var init_physics_body = __esm({
  "packages/engine/dist/physics/physics_body.js"() {
    "use strict";
    init_engine_globals();
    import_matter_js2 = __toESM(require_matter(), 1);
    init_physics_world();
    FIXTURE_SHAPE_RECT = 0;
    FIXTURE_SHAPE_CIRCLE = 1;
    FIXTURE_SHAPE_POLYGON = 2;
    _fixtures = /* @__PURE__ */ new Map();
    _next_fixture_id = 1;
    _bodies = /* @__PURE__ */ new Map();
    _next_body_id = 1;
  }
});

// packages/engine/dist/core/instance.js
function set_draw_sprite_ext(fn) {
  _renderer_draw_sprite_ext = fn;
}
var ALARM_COUNT, _renderer_draw_sprite_ext, instance;
var init_instance = __esm({
  "packages/engine/dist/core/instance.js"() {
    "use strict";
    init_engine_globals();
    init_game_event();
    init_game_loop();
    init_resource();
    init_collision();
    init_motion_planning();
    init_random();
    init_path();
    init_physics_world();
    init_physics_body();
    init_keyboard();
    init_mouse();
    ALARM_COUNT = 12;
    _renderer_draw_sprite_ext = null;
    instance = class _instance extends resource {
      /**
       * Creates a new instance in the specified room.
       * @param room - The room this instance will belong to
       */
      constructor(room2) {
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
        this.alarm = new Array(ALARM_COUNT).fill(-1);
        this._destroyed = false;
        this.bbox_left = 0;
        this.bbox_top = 0;
        this.bbox_right = 0;
        this.bbox_bottom = 0;
        this.mask_manual = false;
        this.mask_off_left = 0;
        this.mask_off_top = 0;
        this.mask_off_right = 0;
        this.mask_off_bottom = 0;
        this.phy_body_id = -1;
        this._phy_wants = false;
        this._phy_shape = "box";
        this._phy_density = 0.5;
        this._phy_restitution = 0.1;
        this._phy_friction = 0.2;
        this._phy_sensor = false;
        this._mp_dir = NaN;
        this.path_index = -1;
        this.path_position = 0;
        this.path_positionprevious = 0;
        this.path_speed = 0;
        this.path_scale = 1;
        this.path_orientation = 0;
        this.path_endaction = 0;
        this._path_off_x = 0;
        this._path_off_y = 0;
        this._bound_step_begin = () => {
        };
        this._bound_step = () => {
        };
        this._bound_step_end = () => {
        };
        this._bound_draw_gui = () => {
        };
        this.room = room2;
        this._bound_step_begin = this.on_step_begin.bind(this);
        this._bound_step = this.internal_step.bind(this);
        this._bound_step_end = this.on_step_end.bind(this);
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
        game_loop.register(EVENT_TYPE.create, inst.on_create.bind(inst));
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
        if (this._destroyed)
          return;
        this._destroyed = true;
        if (this.phy_body_id >= 0) {
          physics_body_destroy(this.phy_body_id);
          this.phy_body_id = -1;
        }
        game_loop.register(EVENT_TYPE.destroy, this.on_destroy.bind(this));
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
        if (inst)
          inst.instance_destroy();
      }
      /**
       * Registers this instance's event handlers with the game loop.
       */
      register_events() {
        game_loop.register(EVENT_TYPE.step_begin, this._bound_step_begin);
        game_loop.register(EVENT_TYPE.step, this._bound_step);
        game_loop.register(EVENT_TYPE.step_end, this._bound_step_end);
        game_loop.register(EVENT_TYPE.draw_gui, this._bound_draw_gui);
      }
      /**
       * Unregisters this instance's event handlers from the game loop.
       */
      unregister_events() {
        game_loop.unregister(EVENT_TYPE.step_begin, this._bound_step_begin);
        game_loop.unregister(EVENT_TYPE.step, this._bound_step);
        game_loop.unregister(EVENT_TYPE.step_end, this._bound_step_end);
        game_loop.unregister(EVENT_TYPE.draw_gui, this._bound_draw_gui);
      }
      /**
       * Internal step: alarms, input events, physics, animation, bbox, collision
       * events, then on_step(). Bails out early if an event destroys the instance.
       */
      internal_step() {
        if (!this.active || this._destroyed)
          return;
        this.xprevious = this.x;
        this.yprevious = this.y;
        this._process_alarms();
        if (this._destroyed)
          return;
        this._process_input_events();
        if (this._destroyed)
          return;
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
          if (this.direction < 0)
            this.direction += 360;
        }
        this.x += this.hspeed;
        this.y += this.vspeed;
        if (this.path_index >= 0) {
          this._advance_path();
          if (this._destroyed)
            return;
        }
        this._advance_animation();
        update_bbox(this);
        this._process_collisions();
        if (this._destroyed)
          return;
        this._process_boundary_events();
        if (this._destroyed)
          return;
        this.on_step();
      }
      /** Decrements active alarms; fires on_alarm(i) when one reaches zero. */
      _process_alarms() {
        for (let i = 0; i < ALARM_COUNT; i++) {
          const a = this.alarm[i] ?? -1;
          if (a > 0) {
            const next = a - 1;
            this.alarm[i] = next;
            if (next === 0) {
              this.alarm[i] = -1;
              this.on_alarm(i);
            }
            if (this._destroyed)
              return;
          }
        }
      }
      /** Fires keyboard and mouse-over-instance events for this step. */
      _process_input_events() {
        if (keyboard_check_pressed(vk_anykey)) {
          this.on_key_press();
          if (this._destroyed)
            return;
        }
        if (keyboard_check_released(vk_anykey)) {
          this.on_key_release();
          if (this._destroyed)
            return;
        }
        if (keyboard_check(vk_anykey)) {
          this.on_key_held();
          if (this._destroyed)
            return;
        }
        const mx = window_mouse_get_x();
        const my = window_mouse_get_y();
        if (point_in_instance(mx, my, this)) {
          if (mouse_check_button_pressed(mb_left)) {
            this.on_mouse_left_press();
            if (this._destroyed)
              return;
          }
          if (mouse_check_button_released(mb_left)) {
            this.on_mouse_left_release();
            if (this._destroyed)
              return;
          }
          if (mouse_check_button_pressed(mb_right)) {
            this.on_mouse_right_press();
          }
        }
      }
      /** Advances the sprite animation, firing on_animation_end() on each loop. */
      _advance_animation() {
        if (this.image_speed === 0 || this.sprite_index < 0)
          return;
        const spr = resource.findByID(this.sprite_index);
        const frame_count = spr && "frames" in spr ? spr.frames.length : 1;
        if (frame_count <= 0)
          return;
        const prev = this.image_index;
        this.image_index = (this.image_index + this.image_speed) % frame_count;
        if (this.image_index < 0)
          this.image_index += frame_count;
        const looped = this.image_speed > 0 ? this.image_index < prev : this.image_index > prev;
        if (looped)
          this.on_animation_end();
      }
      /** Fires on_collision(other) for each instance this one overlaps (collision-event objects only). */
      _process_collisions() {
        if (this.on_collision === _instance.prototype.on_collision)
          return;
        for (const other of this.room.instance_get_all()) {
          if (other === this || !other.active)
            continue;
          if (instances_collide(this, this.x, this.y, other)) {
            this.on_collision(other);
            if (this._destroyed)
              return;
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
      run_draw() {
        if (!this.visible || !this.active)
          return;
        this.on_draw();
      }
      /** Runs the Draw Begin event (skips hidden/inactive instances). */
      run_draw_begin() {
        if (!this.visible || !this.active)
          return;
        this.on_draw_begin();
      }
      /** Runs the Draw End event (skips hidden/inactive instances). */
      run_draw_end() {
        if (!this.visible || !this.active)
          return;
        this.on_draw_end();
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
        if (res === void 0)
          return false;
        return res instanceof _instance;
      }
      /**
       * Finds an instance by its ID.
       * @param id - The instance ID to find
       * @returns The instance, or undefined if not found
       */
      static instance_find(id) {
        const res = resource.findByID(id);
        if (res instanceof _instance)
          return res;
        return void 0;
      }
      /**
       * Returns the number of active instances of a given object class in the current room.
       * @param obj - Object class to count
       * @returns Instance count
       */
      static instance_number(obj) {
        const rm = game_loop.room;
        if (!rm)
          return 0;
        let count = 0;
        for (const inst of rm.instance_get_all()) {
          if (inst instanceof obj && inst.active)
            count++;
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
        if (!rm)
          return void 0;
        let i = 0;
        for (const inst of rm.instance_get_all()) {
          if (inst instanceof obj && inst.active) {
            if (i === n)
              return inst;
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
        if (!rm)
          return void 0;
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
        if (!rm)
          return void 0;
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
        if (!rm)
          return void 0;
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
        if (!rm)
          return;
        for (const inst of rm.instance_get_all()) {
          if (not_me && inst === this)
            continue;
          inst.active = false;
        }
      }
      /**
       * Deactivates all instances of a specific object class.
       * @param obj - Object class to deactivate
       */
      static instance_deactivate_object(obj) {
        const rm = game_loop.room;
        if (!rm)
          return;
        for (const inst of rm.instance_get_all()) {
          if (inst instanceof obj)
            inst.active = false;
        }
      }
      /**
       * Activates all instances in the current room.
       */
      static instance_activate_all() {
        const rm = game_loop.room;
        if (!rm)
          return;
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
        if (!rm)
          return;
        for (const inst of rm.instance_get_all()) {
          if (inst instanceof obj)
            inst.active = true;
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
      static _bbox_in_region(inst, l, t, r, b) {
        update_bbox(inst);
        return inst.bbox_right >= l && inst.bbox_left <= r && inst.bbox_bottom >= t && inst.bbox_top <= b;
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
      instance_deactivate_region(left, top, width, height, inside = true, not_me = false) {
        const rm = game_loop.room;
        if (!rm)
          return;
        const r = left + width, b = top + height;
        for (const inst of rm.instance_get_all()) {
          if (not_me && inst === this)
            continue;
          if (_instance._bbox_in_region(inst, left, top, r, b) === inside)
            inst.active = false;
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
      static instance_activate_region(left, top, width, height, inside = true) {
        const rm = game_loop.room;
        if (!rm)
          return;
        const r = left + width, b = top + height;
        for (const inst of rm.instance_get_all()) {
          if (_instance._bbox_in_region(inst, left, top, r, b) === inside)
            inst.active = true;
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
        if (!rm)
          return false;
        for (const other of rm.instance_get_all()) {
          if (other === this)
            continue;
          if (!(other instanceof obj))
            continue;
          if (!other.active)
            continue;
          if (instances_collide(this, x, y, other))
            return true;
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
        if (!rm)
          return true;
        for (const other of rm.instance_get_all()) {
          if (other === this)
            continue;
          if (!other.solid || !other.active)
            continue;
          if (instances_collide(this, x, y, other))
            return false;
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
        if (!rm)
          return true;
        for (const other of rm.instance_get_all()) {
          if (other === this)
            continue;
          if (!other.active)
            continue;
          if (instances_collide(this, x, y, other))
            return false;
        }
        return true;
      }
      /**
       * Like place_meeting, but returns the first instance collided with at (x, y),
       * or undefined if none.
       * @param x - X position to test
       * @param y - Y position to test
       * @param obj - Object class to check against (pass the base `instance` for "all")
       */
      instance_place(x, y, obj) {
        const rm = game_loop.room;
        if (!rm)
          return void 0;
        for (const other of rm.instance_get_all()) {
          if (other === this || !other.active)
            continue;
          if (!(other instanceof obj))
            continue;
          if (instances_collide(this, x, y, other))
            return other;
        }
        return void 0;
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
      mask_set_rectangle(left, top, right, bottom) {
        this.mask_manual = true;
        this.mask_off_left = left;
        this.mask_off_top = top;
        this.mask_off_right = right;
        this.mask_off_bottom = bottom;
        update_bbox(this);
      }
      /**
       * Convenience: sets a manual width×height mask with its top-left at the origin.
       * @param width - Mask width
       * @param height - Mask height
       */
      mask_set_size(width, height) {
        this.mask_set_rectangle(0, 0, width, height);
      }
      /** Removes the manual mask, reverting to the sprite/mask_index-derived bbox. */
      mask_clear() {
        this.mask_manual = false;
        update_bbox(this);
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
      phy_request(shape, density, restitution, friction, sensor) {
        this._phy_wants = true;
        this._phy_shape = shape;
        this._phy_density = density;
        this._phy_restitution = restitution;
        this._phy_friction = friction;
        this._phy_sensor = sensor;
      }
      /**
       * Creates the matter.js body if this instance wants physics, has none yet, and a
       * physics world exists. Called by the game loop each step (a no-op once bound).
       */
      phy_ensure_body() {
        if (!this._phy_wants || this.phy_body_id >= 0)
          return;
        if (!physics_world_get_engine())
          return;
        const { w, h } = this._phy_extent();
        const fix = physics_fixture_create();
        if (this._phy_shape === "circle")
          physics_fixture_set_circle(fix, Math.max(w, h) / 2);
        else
          physics_fixture_set_box(fix, w, h);
        physics_fixture_set_density(fix, Math.max(0, this._phy_density));
        physics_fixture_set_restitution(fix, this._phy_restitution);
        physics_fixture_set_friction(fix, this._phy_friction);
        physics_fixture_set_sensor(fix, this._phy_sensor);
        this.phy_body_id = physics_fixture_bind(fix, this.x, this.y, this._phy_density <= 0);
        physics_fixture_delete(fix);
      }
      /** Syncs x/y/image_angle from the physics body. Called by the loop after stepping. */
      phy_sync_from_body() {
        if (this.phy_body_id < 0)
          return;
        this.x = physics_body_get_x(this.phy_body_id);
        this.y = physics_body_get_y(this.phy_body_id);
        this.image_angle = physics_body_get_angle(this.phy_body_id);
      }
      /** The body's pixel extent: manual mask, else sprite bbox, else a 32×32 default. */
      _phy_extent() {
        if (this.mask_manual) {
          const w = this.mask_off_right - this.mask_off_left;
          const h = this.mask_off_bottom - this.mask_off_top;
          if (w > 0 && h > 0)
            return { w, h };
        }
        const bw = this.bbox_right - this.bbox_left;
        const bh = this.bbox_bottom - this.bbox_top;
        if (bw > 0 && bh > 0)
          return { w: bw, h: bh };
        return { w: 32, h: 32 };
      }
      /** Applies a continuous force at the body's centre (pixel-space units). */
      phy_apply_force(fx, fy) {
        if (this.phy_body_id >= 0)
          physics_body_apply_force(this.phy_body_id, fx, fy);
      }
      /** Applies an instantaneous impulse at the body's centre. */
      phy_apply_impulse(fx, fy) {
        if (this.phy_body_id >= 0)
          physics_body_apply_impulse(this.phy_body_id, fx, fy);
      }
      /** Teleports the physics body (and the instance) to a position. */
      phy_set_position(x, y) {
        if (this.phy_body_id >= 0)
          physics_body_set_position(this.phy_body_id, x, y);
        this.x = x;
        this.y = y;
      }
      /** Horizontal velocity of the physics body (pixels/step). */
      get phy_speed_x() {
        return this.phy_body_id >= 0 ? physics_body_get_vx(this.phy_body_id) : 0;
      }
      set phy_speed_x(v) {
        if (this.phy_body_id >= 0)
          physics_body_set_velocity(this.phy_body_id, v, physics_body_get_vy(this.phy_body_id));
      }
      /** Vertical velocity of the physics body (pixels/step). */
      get phy_speed_y() {
        return this.phy_body_id >= 0 ? physics_body_get_vy(this.phy_body_id) : 0;
      }
      set phy_speed_y(v) {
        if (this.phy_body_id >= 0)
          physics_body_set_velocity(this.phy_body_id, physics_body_get_vx(this.phy_body_id), v);
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
        if (!rm)
          return;
        const bbox_w = this.bbox_right - this.bbox_left;
        const bbox_h = this.bbox_bottom - this.bbox_top;
        if (hor) {
          if (this.x + bbox_w < -margin)
            this.x = rm.room_width + margin;
          else if (this.x - bbox_w > rm.room_width + margin)
            this.x = -margin;
        }
        if (vert) {
          if (this.y + bbox_h < -margin)
            this.y = rm.room_height + margin;
          else if (this.y - bbox_h > rm.room_height + margin)
            this.y = -margin;
        }
      }
      /**
       * Returns the shortest distance from this instance to any instance of obj.
       * @param obj - Object class to measure distance to
       * @returns Distance in pixels, or Infinity if no instance found
       */
      distance_to_object(obj) {
        const rm = game_loop.room;
        if (!rm)
          return Infinity;
        let min_dist = Infinity;
        for (const inst of rm.instance_get_all()) {
          if (inst === this || !inst.active)
            continue;
          if (!(inst instanceof obj))
            continue;
          const dx = inst.x - this.x;
          const dy = inst.y - this.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < min_dist)
            min_dist = d;
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
          if (this.direction < 0)
            this.direction += 360;
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
       * Returns the distance from this instance's bounding box to a point.
       * Returns 0 if the point lies inside the bounding box.
       * @param x - Point X
       * @param y - Point Y
       */
      distance_to_point(x, y) {
        update_bbox(this);
        const dx = Math.max(this.bbox_left - x, 0, x - this.bbox_right);
        const dy = Math.max(this.bbox_top - y, 0, y - this.bbox_bottom);
        return Math.sqrt(dx * dx + dy * dy);
      }
      /**
       * Snaps the instance position to a grid.
       * @param hsnap - Horizontal grid size (ignored if ≤ 0)
       * @param vsnap - Vertical grid size (ignored if ≤ 0)
       */
      move_snap(hsnap, vsnap) {
        if (hsnap > 0)
          this.x = Math.round(this.x / hsnap) * hsnap;
        if (vsnap > 0)
          this.y = Math.round(this.y / vsnap) * vsnap;
      }
      /**
       * True if the instance position is aligned to the given grid.
       * @param hsnap - Horizontal grid size
       * @param vsnap - Vertical grid size
       */
      place_snapped(hsnap, vsnap) {
        const hok = hsnap <= 0 || this.x % hsnap === 0;
        const vok = vsnap <= 0 || this.y % vsnap === 0;
        return hok && vok;
      }
      /**
       * Moves the instance to a random, grid-snapped, collision-free position in
       * the room (tries a number of times before giving up).
       * @param hsnap - Horizontal grid size (use 1 for any pixel)
       * @param vsnap - Vertical grid size
       */
      move_random(hsnap, vsnap) {
        const rm = game_loop.room;
        if (!rm)
          return;
        const hs = hsnap > 0 ? hsnap : 1;
        const vs = vsnap > 0 ? vsnap : 1;
        const hcells = Math.max(1, Math.floor(rm.room_width / hs));
        const vcells = Math.max(1, Math.floor(rm.room_height / vs));
        for (let tries = 0; tries < 1e3; tries++) {
          const nx = irandom_range(0, hcells - 1) * hs;
          const ny = irandom_range(0, vcells - 1) * vs;
          if (this.place_free(nx, ny)) {
            this.x = nx;
            this.y = ny;
            return;
          }
        }
      }
      /**
       * Like move_contact_solid but treats all instances as obstacles.
       * @param hspd - Horizontal movement
       * @param vspd - Vertical movement
       * @returns True if the movement was blocked
       */
      move_contact_all(hspd, vspd) {
        const tx = this.x + hspd, ty = this.y + vspd;
        if (this.place_empty(tx, ty)) {
          this.x = tx;
          this.y = ty;
          return false;
        }
        return true;
      }
      /**
       * Steps the instance in the given direction until it is no longer colliding
       * with a solid (up to its bounding-box size in steps).
       * @param hspd - Horizontal step
       * @param vspd - Vertical step
       */
      move_outside_solid(hspd, vspd) {
        this._move_outside(hspd, vspd, false);
      }
      /** As move_outside_solid but treats all instances as obstacles. */
      move_outside_all(hspd, vspd) {
        this._move_outside(hspd, vspd, true);
      }
      /** Steps in (hspd,vspd) until the position is free (or a step cap is hit). */
      _move_outside(hspd, vspd, all) {
        const free = (x, y) => all ? this.place_empty(x, y) : this.place_free(x, y);
        const step = Math.hypot(hspd, vspd);
        if (step < 1e-9)
          return;
        const max_steps = 1e3;
        for (let i = 0; i < max_steps; i++) {
          if (free(this.x, this.y))
            return;
          this.x += hspd;
          this.y += vspd;
        }
      }
      /**
       * Bounces the instance off solid instances by reflecting its hspeed/vspeed.
       * @param advanced - Reserved for slanted-wall handling (currently axis-aligned reflection)
       */
      move_bounce_solid(advanced = false) {
        this._move_bounce(advanced, false);
      }
      /** As move_bounce_solid but bounces off all instances. */
      move_bounce_all(advanced = false) {
        this._move_bounce(advanced, true);
      }
      /** Axis-aligned bounce: flips the blocked velocity component(s). */
      _move_bounce(_advanced, all) {
        const free = (x, y) => all ? this.place_empty(x, y) : this.place_free(x, y);
        const nx = this.x + this.hspeed, ny = this.y + this.vspeed;
        if (free(nx, ny))
          return;
        const blocked_h = !free(this.x + this.hspeed, this.y);
        const blocked_v = !free(this.x, this.y + this.vspeed);
        if (blocked_h)
          this.hspeed = -this.hspeed;
        if (blocked_v)
          this.vspeed = -this.vspeed;
        if (!blocked_h && !blocked_v) {
          this.hspeed = -this.hspeed;
          this.vspeed = -this.vspeed;
        }
        this.speed = Math.hypot(this.hspeed, this.vspeed);
        if (this.hspeed !== 0 || this.vspeed !== 0) {
          this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
          if (this.direction < 0)
            this.direction += 360;
        }
      }
      // =========================================================================
      // Motion planning steppers (GMS mp_*_step)
      // =========================================================================
      /** True if (x,y) is clear: `checkall` ⇒ no instances at all, else no solids. */
      _mp_free(x, y, checkall) {
        return checkall ? this.place_empty(x, y) : this.place_free(x, y);
      }
      /**
       * Moves up to `stepsize` straight toward (x, y), stopping if the step is blocked.
       * @param checkall - True = treat all instances as obstacles; false = only solids
       * @returns True once the instance is at the target
       */
      mp_linear_step(x, y, stepsize, checkall) {
        const dx = x - this.x, dy = y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1e-6)
          return true;
        const step = Math.min(stepsize, dist);
        const nx = this.x + dx / dist * step;
        const ny = this.y + dy / dist * step;
        if (this._mp_free(nx, ny, checkall)) {
          this.x = nx;
          this.y = ny;
        }
        return Math.hypot(x - this.x, y - this.y) < 1e-6;
      }
      /** Like `mp_linear_step`, but only instances of `obj` block the move. */
      mp_linear_step_object(x, y, stepsize, obj) {
        const dx = x - this.x, dy = y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1e-6)
          return true;
        const step = Math.min(stepsize, dist);
        const nx = this.x + dx / dist * step;
        const ny = this.y + dy / dist * step;
        if (!this.place_meeting(nx, ny, obj)) {
          this.x = nx;
          this.y = ny;
        }
        return Math.hypot(x - this.x, y - this.y) < 1e-6;
      }
      /**
       * Steps `stepsize` toward (x, y) while steering around obstacles (potential field).
       * Sweeps outward from the direct heading (see `mp_potential_settings`) for a free step.
       * @returns True once near the target
       */
      mp_potential_step(x, y, stepsize, checkall) {
        return this._mp_potential(x, y, stepsize, (nx, ny) => this._mp_free(nx, ny, checkall));
      }
      /** Like `mp_potential_step`, but only instances of `obj` block the move. */
      mp_potential_step_object(x, y, stepsize, obj) {
        return this._mp_potential(x, y, stepsize, (nx, ny) => !this.place_meeting(nx, ny, obj));
      }
      _mp_potential(x, y, stepsize, is_free) {
        const dx = x - this.x, dy = y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1e-6)
          return true;
        const step = Math.min(stepsize, dist);
        const { maxrot, rotstep } = _mp_potential_settings();
        const rstep = rotstep * (Math.PI / 180);
        const max_rad = maxrot * (Math.PI / 180);
        const desired = Math.atan2(dy, dx);
        let dir = Number.isNaN(this._mp_dir) ? desired : this._mp_dir;
        const free_at = (d) => is_free(this.x + Math.cos(d) * step, this.y + Math.sin(d) * step);
        const want = this._approach_angle(dir, desired, rstep);
        if (free_at(want)) {
          dir = want;
        } else {
          let found = false;
          for (let a = rstep; a <= max_rad + 1e-6 && !found; a += rstep) {
            for (const sgn of [1, -1]) {
              if (free_at(dir + sgn * a)) {
                dir += sgn * a;
                found = true;
                break;
              }
            }
          }
          if (!found) {
            this._mp_dir = dir;
            return false;
          }
        }
        this._mp_dir = dir;
        this.x += Math.cos(dir) * step;
        this.y += Math.sin(dir) * step;
        this.direction = (-dir * 180 / Math.PI % 360 + 360) % 360;
        return Math.hypot(x - this.x, y - this.y) < stepsize;
      }
      /** Rotates `from` toward `to` by at most `max_step` radians, the short way. */
      _approach_angle(from, to, max_step) {
        let diff = to - from;
        while (diff > Math.PI)
          diff -= 2 * Math.PI;
        while (diff < -Math.PI)
          diff += 2 * Math.PI;
        if (Math.abs(diff) <= max_step)
          return to;
        return from + Math.sign(diff) * max_step;
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
      path_start(path_id, speed, endaction = path_action_stop, absolute = true) {
        if (!path_exists(path_id))
          return;
        this.path_index = path_id;
        this.path_speed = speed;
        this.path_endaction = endaction;
        this.path_position = 0;
        this.path_positionprevious = 0;
        const sx = path_get_x(path_id, 0) * this.path_scale;
        const sy = path_get_y(path_id, 0) * this.path_scale;
        if (absolute) {
          this._path_off_x = 0;
          this._path_off_y = 0;
          this.x = sx;
          this.y = sy;
        } else {
          this._path_off_x = this.x - sx;
          this._path_off_y = this.y - sy;
        }
      }
      /** Stops following the current path (does not fire the Path End event). */
      path_end() {
        this.path_index = -1;
        this.path_speed = 0;
      }
      /** Advances along the current path by `path_speed`, applying the end action and firing on_path_end. */
      _advance_path() {
        const path = this.path_index;
        const len = path_get_length(path);
        if (len <= 0) {
          this.path_end();
          return;
        }
        this.path_positionprevious = this.path_position;
        this.path_position += this.path_speed / len;
        let ended = false;
        if (this.path_position >= 1) {
          ended = true;
          switch (this.path_endaction) {
            case path_action_restart:
              this.path_position = (this.path_position % 1 + 1) % 1;
              break;
            case path_action_continue:
              this.path_position = (this.path_position % 1 + 1) % 1;
              this._path_off_x = this.x - path_get_x(path, this.path_position) * this.path_scale;
              this._path_off_y = this.y - path_get_y(path, this.path_position) * this.path_scale;
              break;
            case path_action_reverse:
              this.path_speed = -Math.abs(this.path_speed);
              this.path_position = 1;
              break;
            default:
              this.path_position = 1;
          }
        } else if (this.path_position <= 0 && this.path_speed < 0) {
          ended = true;
          switch (this.path_endaction) {
            case path_action_restart:
              this.path_position = (this.path_position % 1 + 1) % 1;
              break;
            case path_action_reverse:
              this.path_speed = Math.abs(this.path_speed);
              this.path_position = 0;
              break;
            default:
              this.path_position = 0;
          }
        }
        const t = Math.max(0, Math.min(1, this.path_position));
        this.x = path_get_x(path, t) * this.path_scale + this._path_off_x;
        this.y = path_get_y(path, t) * this.path_scale + this._path_off_y;
        if (ended) {
          if (this.path_endaction === path_action_stop)
            this.path_end();
          this.on_path_end();
        }
      }
      /** Read-only: the number of sub-images (frames) of the current sprite (GMS `image_number`). */
      get image_number() {
        const s = resource.findByID(this.sprite_index);
        return s && Array.isArray(s.frames) ? s.frames.length : 0;
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
        if (this.sprite_index < 0 || !_renderer_draw_sprite_ext)
          return;
        const spr = resource.findByID(this.sprite_index);
        if (!spr || !("frames" in spr))
          return;
        _renderer_draw_sprite_ext(spr, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, this.image_angle, this.image_blend, this.image_alpha);
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
      /** Called before the main Draw event (world space). Override to draw underlays. */
      on_draw_begin() {
      }
      /** Called after the main Draw event (world space). Override to draw overlays. */
      on_draw_end() {
      }
      /** Called every frame to draw GUI elements (fixed to the screen, not the room). */
      on_draw_gui() {
      }
      // ── Alarm ────────────────────────────────────────────────────────────────
      /** Called when alarm[index] counts down to zero. */
      on_alarm(_index) {
      }
      // ── Keyboard (generic — check specific keys with keyboard_check* inside) ──
      /** Called the step any key is pressed. */
      on_key_press() {
      }
      /** Called the step any key is released. */
      on_key_release() {
      }
      /** Called every step any key is held down. */
      on_key_held() {
      }
      // ── Mouse (fired only while the pointer is over this instance) ────────────
      /** Called when the left mouse button is pressed over this instance. */
      on_mouse_left_press() {
      }
      /** Called when the left mouse button is released over this instance. */
      on_mouse_left_release() {
      }
      /** Called when the right mouse button is pressed over this instance. */
      on_mouse_right_press() {
      }
      // ── Collision ─────────────────────────────────────────────────────────────
      /** Called for each other instance this one overlaps this step. */
      on_collision(_other) {
      }
      // ── Room / Game lifecycle ────────────────────────────────────────────────
      /** Called when the room this instance is in starts. */
      on_room_start() {
      }
      /** Called when the room this instance is in ends (before leaving it). */
      on_room_end() {
      }
      /** Called once when the game starts, for instances present in the first room. */
      on_game_start() {
      }
      /** Called once when the game ends. */
      on_game_end() {
      }
      // ── Other ─────────────────────────────────────────────────────────────────
      /** Called when the sprite animation completes a loop. */
      on_animation_end() {
      }
      /** Called when path following ends. */
      on_path_end() {
      }
      /** Called each step while the instance's bbox is entirely outside the room. */
      on_outside_room() {
      }
      /** Called each step while the instance's bbox crosses a room edge. */
      on_intersect_boundary() {
      }
      /** A user-defined event (0–15), triggered by `event_user(index)`. */
      on_user(index) {
        void index;
      }
      /** Called once when `lives` transitions to ≤ 0. */
      on_no_more_lives() {
      }
      /** Called once when `health` transitions to ≤ 0. */
      on_no_more_health() {
      }
      /** Triggers this instance's user event `index` (0–15) → `on_user(index)`. */
      event_user(index) {
        if (index >= 0 && index <= 15)
          this.on_user(index);
      }
      /** Fires the Outside Room / Intersect Boundary events when the bbox leaves/crosses the room. */
      _process_boundary_events() {
        const rm = this.room;
        if (!rm)
          return;
        const outside = this.bbox_right < 0 || this.bbox_left > rm.room_width || this.bbox_bottom < 0 || this.bbox_top > rm.room_height;
        if (outside) {
          this.on_outside_room();
          if (this._destroyed)
            return;
        } else if (this.bbox_left < 0 || this.bbox_top < 0 || this.bbox_right > rm.room_width || this.bbox_bottom > rm.room_height) {
          this.on_intersect_boundary();
        }
      }
    };
  }
});

// packages/engine/dist/core/tiles.js
var init_tiles = __esm({
  "packages/engine/dist/core/tiles.js"() {
    "use strict";
    init_engine_globals();
    init_game_loop();
  }
});

// packages/engine/dist/drawing/shader.js
function compile_shader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader)
    throw new Error("Failed to create shader object");
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
  if (!program)
    throw new Error("Failed to create shader program");
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
var DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER;
var init_shader = __esm({
  "packages/engine/dist/drawing/shader.js"() {
    "use strict";
    init_engine_globals();
    DEFAULT_VERTEX_SHADER = /*glsl*/
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
}`;
    DEFAULT_FRAGMENT_SHADER = /*glsl*/
    `#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec4 v_color;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    fragColor = texture(u_texture, v_texcoord) * v_color;
}`;
  }
});

// packages/engine/dist/drawing/batch_renderer.js
var FLOATS_PER_VERTEX, VERTS_PER_QUAD, FLOATS_PER_QUAD, MAX_QUADS, batch_renderer;
var init_batch_renderer = __esm({
  "packages/engine/dist/drawing/batch_renderer.js"() {
    "use strict";
    init_engine_globals();
    FLOATS_PER_VERTEX = 8;
    VERTS_PER_QUAD = 6;
    FLOATS_PER_QUAD = FLOATS_PER_VERTEX * VERTS_PER_QUAD;
    MAX_QUADS = 8192;
    batch_renderer = class {
      constructor(gl) {
        this.quad_count = 0;
        this.current_texture = null;
        this.gl = gl;
        this.vertices = new Float32Array(MAX_QUADS * FLOATS_PER_QUAD);
        const vao = gl.createVertexArray();
        if (!vao)
          throw new Error("Failed to create VAO");
        this.vao = vao;
        const vbo = gl.createBuffer();
        if (!vbo)
          throw new Error("Failed to create VBO");
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
        if (this.quad_count === 0)
          return;
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.quad_count * FLOATS_PER_QUAD));
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
  }
});

// packages/engine/dist/drawing/texture_manager.js
var texture_manager;
var init_texture_manager = __esm({
  "packages/engine/dist/drawing/texture_manager.js"() {
    "use strict";
    init_engine_globals();
    texture_manager = class {
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
        if (!tex)
          throw new Error("Failed to create white pixel texture");
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
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
        if (!tex)
          throw new Error("Failed to create texture");
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
        if (!tex)
          throw new Error("Failed to create texture from canvas");
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
  }
});

// packages/engine/dist/drawing/font.js
var font_resource, font_renderer;
var init_font = __esm({
  "packages/engine/dist/drawing/font.js"() {
    "use strict";
    init_engine_globals();
    font_resource = class {
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
    font_renderer = class {
      constructor(tex_manager) {
        this.cache = /* @__PURE__ */ new Map();
        this.tex_manager = tex_manager;
        this.offscreen = document.createElement("canvas");
        const ctx = this.offscreen.getContext("2d");
        if (!ctx)
          throw new Error("Cannot create 2D canvas context for text rendering");
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
        if (cached)
          return cached;
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
  }
});

// packages/engine/dist/drawing/color.js
function make_color_rgb(r, g, b) {
  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return b << 16 | g << 8 | r;
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
var c_black, c_white, bm_normal;
var init_color = __esm({
  "packages/engine/dist/drawing/color.js"() {
    "use strict";
    init_engine_globals();
    c_black = 0;
    c_white = 16777215;
    bm_normal = 0;
  }
});

// packages/engine/dist/drawing/renderer.js
function pos_mod(a, m) {
  return (a % m + m) % m;
}
var renderer;
var init_renderer = __esm({
  "packages/engine/dist/drawing/renderer.js"() {
    "use strict";
    init_engine_globals();
    init_shader();
    init_batch_renderer();
    init_texture_manager();
    init_font();
    init_color();
    init_instance();
    init_game_loop();
    init_resource();
    renderer = class {
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
          if (!el)
            throw new Error(`Canvas not found: ${canvas_or_id}`);
          this.canvas = el;
        } else {
          this.canvas = canvas_or_id;
        }
        this.canvas.width = width;
        this.canvas.height = height;
        const gl = this.canvas.getContext("webgl2");
        if (!gl)
          throw new Error("WebGL 2 is not supported in this browser");
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
        set_frame_hooks(() => this.begin_frame(), () => this.end_frame());
        set_room_render_hook((rm, run_instances) => this.draw_room(rm, run_instances));
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
      /**
       * Uploads an orthographic projection that maps the room-space rectangle
       * (vx,vy)–(vx+vw,vy+vh) onto clip space. Origin top-left, Y increases down.
       * This is what makes views/cameras scroll.
       * @param vx - View left in room space
       * @param vy - View top in room space
       * @param vw - View width in room space
       * @param vh - View height in room space
       */
      static upload_projection_view(vx, vy, vw, vh) {
        const gl = this.gl;
        const matrix = new Float32Array([
          2 / vw,
          0,
          0,
          0,
          0,
          -2 / vh,
          0,
          0,
          0,
          0,
          1,
          0,
          -(2 * vx / vw) - 1,
          2 * vy / vh + 1,
          0,
          1
        ]);
        gl.uniformMatrix4fv(this.projection_loc, false, matrix);
      }
      /**
       * Activates a view camera: flushes pending geometry, sets the GL viewport to
       * the on-screen port, and projects the room-space view rectangle into it.
       */
      static set_view_camera(vx, vy, vw, vh, px, py, pw, ph) {
        this.batch.flush();
        this.gl.viewport(px, this.canvas.height - py - ph, pw, ph);
        this.upload_projection_view(vx, vy, vw, vh);
      }
      /** Restores full-canvas rendering (for GUI / no-view drawing). */
      static reset_view() {
        this.batch.flush();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.upload_projection(this.canvas.width, this.canvas.height);
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
        if (mode === this.blend_mode)
          return;
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
        if (!tex)
          throw new Error("Failed to create surface texture");
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        const fbo = gl.createFramebuffer();
        if (!fbo)
          throw new Error("Failed to create framebuffer");
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
        if (!surf.valid)
          return;
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
        if (!surf.valid)
          return;
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
        if (!frame)
          return;
        const [r, g, b] = color_to_rgb_normalized(this.draw_color);
        this.batch.add_quad(x - spr.xoffset, y - spr.yoffset, frame.width, frame.height, 0, 0, 1, 1, r, g, b, this.draw_alpha, frame.texture.texture);
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
        if (!frame)
          return;
        const [r, g, b] = color_to_rgb_normalized(color);
        this.batch.add_quad_transformed(x, y, frame.width, frame.height, spr.xoffset, spr.yoffset, xscale, yscale, rot, 0, 0, 1, 1, r, g, b, alpha, frame.texture.texture);
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
        if (!frame)
          return;
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
        if (!frame)
          return;
        const [r, g, b] = color_to_rgb_normalized(this.draw_color);
        this.batch.add_quad(x, y, w, h, 0, 0, 1, 1, r, g, b, this.draw_alpha, frame.texture.texture);
      }
      // ═══════════════════════════════════════════════════════════════════════
      // Background drawing
      // ═══════════════════════════════════════════════════════════════════════
      /**
       * Draws a background at the given position.
       * @param bg - Background resource
       * @param x - X position
       * @param y - Y position
       */
      static draw_background(bg, x, y) {
        if (!bg || !bg.texture)
          return;
        const [r, g, b] = color_to_rgb_normalized(this.draw_color);
        this.batch.add_quad(x, y, bg.width, bg.height, 0, 0, 1, 1, r, g, b, this.draw_alpha, bg.texture.texture);
      }
      /**
       * Draws a background with extended transforms (scale, rotation, blend color, alpha).
       * @param bg - Background resource
       * @param x - X position
       * @param y - Y position
       * @param xscale - Horizontal scale factor
       * @param yscale - Vertical scale factor
       * @param rot - Rotation in degrees (counter-clockwise)
       * @param color - Blend color as BGR integer
       * @param alpha - Alpha transparency (0–1)
       */
      static draw_background_ext(bg, x, y, xscale, yscale, rot, color, alpha) {
        if (!bg || !bg.texture)
          return;
        const [r, g, b] = color_to_rgb_normalized(color);
        this.batch.add_quad_transformed(x, y, bg.width, bg.height, 0, 0, xscale, yscale, rot, 0, 0, 1, 1, r, g, b, alpha, bg.texture.texture);
      }
      /**
       * Draws a background stretched to fill a specified region.
       * @param bg - Background resource
       * @param x - X position
       * @param y - Y position
       * @param w - Width
       * @param h - Height
       */
      static draw_background_stretched(bg, x, y, w, h) {
        if (!bg || !bg.texture)
          return;
        const [r, g, b] = color_to_rgb_normalized(this.draw_color);
        this.batch.add_quad(x, y, w, h, 0, 0, 1, 1, r, g, b, this.draw_alpha, bg.texture.texture);
      }
      /**
       * Draws a background tiled to fill the current view.
       * @param bg - Background resource
       * @param x - X offset
       * @param y - Y offset
       * @param tile_x - X tile offset
       * @param tile_y - Y tile offset
       */
      static draw_background_tiled(bg, x, y, tile_x, tile_y) {
        if (!bg || !bg.texture)
          return;
        const [r, g, b] = color_to_rgb_normalized(this.draw_color);
        const view_w = this.canvas.width;
        const view_h = this.canvas.height;
        const tiles_x = Math.ceil(view_w / bg.width) + 1;
        const tiles_y = Math.ceil(view_h / bg.height) + 1;
        const start_x = x - tile_x % bg.width;
        const start_y = y - tile_y % bg.height;
        for (let ty = 0; ty < tiles_y; ty++) {
          for (let tx = 0; tx < tiles_x; tx++) {
            const draw_x = start_x + tx * bg.width;
            const draw_y = start_y + ty * bg.height;
            this.batch.add_quad(draw_x, draw_y, bg.width, bg.height, 0, 0, 1, 1, r, g, b, this.draw_alpha, bg.texture.texture);
          }
        }
      }
      /**
       * Draws a surface as if it were a sprite.
       * @param surf - Surface to draw
       * @param x - Destination X
       * @param y - Destination Y
       */
      static draw_surface(surf, x, y) {
        if (!surf.valid)
          return;
        const [r, g, b] = color_to_rgb_normalized(16777215);
        this.batch.add_quad(x, y, surf.width, surf.height, 0, 1, 1, 0, r, g, b, this.draw_alpha, surf.texture);
      }
      // =========================================================================
      // Room rendering (views, backgrounds, tiles)
      // =========================================================================
      /**
       * Renders the active room. For each visible view it sets the camera, draws
       * the non-foreground backgrounds and tiles, runs the instance Draw events
       * (via the callback), then draws the foreground backgrounds. With no views
       * enabled the room maps 1:1 to the canvas.
       * @param rm - The active room
       * @param run_instances - Runs all instance Draw events under the current camera
       */
      static draw_room(rm, run_instances) {
        if (rm.background_show_color)
          this.draw_clear(rm.background_solid_color);
        this._advance_bg_scroll(rm);
        const views = [];
        if (rm.view_enabled) {
          for (let i = 0; i < rm.view_visible.length; i++) {
            if (rm.view_visible[i] && (rm.view_wview[i] ?? 0) > 0)
              views.push(i);
          }
        }
        if (views.length > 0) {
          for (const i of views) {
            this._follow_view(rm, i);
            const vx = rm.view_xview[i] ?? 0, vy = rm.view_yview[i] ?? 0;
            const vw = rm.view_wview[i], vh = rm.view_hview[i];
            const px = rm.view_xport[i] ?? 0, py = rm.view_yport[i] ?? 0;
            const pw = rm.view_wport[i] ?? vw, ph = rm.view_hport[i] ?? vh;
            this.set_view_camera(vx, vy, vw, vh, px, py, pw, ph);
            this.draw_room_backgrounds(rm, false, vx, vy, vw, vh);
            this.draw_room_tiles(rm);
            run_instances();
            this.draw_room_backgrounds(rm, true, vx, vy, vw, vh);
          }
          this.reset_view();
        } else {
          const vw = this.canvas.width, vh = this.canvas.height;
          this.draw_room_backgrounds(rm, false, 0, 0, vw, vh);
          this.draw_room_tiles(rm);
          run_instances();
          this.draw_room_backgrounds(rm, true, 0, 0, vw, vh);
        }
      }
      /** Accumulates each background layer's auto-scroll offset once per frame. */
      static _advance_bg_scroll(rm) {
        const n = rm.background_index.length;
        if (rm._bg_scroll_x.length !== n) {
          rm._bg_scroll_x = new Array(n).fill(0);
          rm._bg_scroll_y = new Array(n).fill(0);
        }
        for (let i = 0; i < n; i++) {
          rm._bg_scroll_x[i] = (rm._bg_scroll_x[i] ?? 0) + (rm.background_hspeed[i] ?? 0);
          rm._bg_scroll_y[i] = (rm._bg_scroll_y[i] ?? 0) + (rm.background_vspeed[i] ?? 0);
        }
      }
      /**
       * Moves view `i` to keep its followed instance within the view's border box,
       * clamped to the room bounds. No-op when the view follows nothing.
       */
      static _follow_view(rm, i) {
        const obj = rm.view_object[i] ?? -1;
        if (obj < 0)
          return;
        const inst = rm.instance_get(obj);
        if (!inst)
          return;
        const vw = rm.view_wview[i], vh = rm.view_hview[i];
        const hb = rm.view_hborder[i] ?? 0, vb = rm.view_vborder[i] ?? 0;
        let vx = rm.view_xview[i] ?? 0, vy = rm.view_yview[i] ?? 0;
        if (inst.x - vx < hb)
          vx = inst.x - hb;
        else if (vx + vw - inst.x < hb)
          vx = inst.x + hb - vw;
        if (inst.y - vy < vb)
          vy = inst.y - vb;
        else if (vy + vh - inst.y < vb)
          vy = inst.y + vb - vh;
        rm.view_xview[i] = Math.max(0, Math.min(vx, rm.room_width - vw));
        rm.view_yview[i] = Math.max(0, Math.min(vy, rm.room_height - vh));
      }
      /**
       * Draws the room's background layers within the given view rectangle.
       * @param rm - The room
       * @param foreground - Draw only foreground layers (true) or only background layers (false)
       * @param vx - View left (room space)
       * @param vy - View top (room space)
       * @param vw - View width
       * @param vh - View height
       */
      static draw_room_backgrounds(rm, foreground, vx, vy, vw, vh) {
        for (let i = 0; i < rm.background_index.length; i++) {
          if (!rm.background_visible[i])
            continue;
          if ((rm.background_foreground[i] ?? false) !== foreground)
            continue;
          const bg = resource.findByID(rm.background_index[i] ?? -1);
          if (!bg || !bg.texture)
            continue;
          const [cr, cg, cb] = color_to_rgb_normalized(rm.background_color[i] ?? 16777215);
          if (rm.background_stretch[i]) {
            this.batch.add_quad(0, 0, rm.room_width, rm.room_height, 0, 0, 1, 1, cr, cg, cb, this.draw_alpha, bg.texture.texture);
            continue;
          }
          const bx = (rm.background_x[i] ?? 0) + (rm._bg_scroll_x[i] ?? 0);
          const by = (rm.background_y[i] ?? 0) + (rm._bg_scroll_y[i] ?? 0);
          const htiled = rm.background_htiled[i] ?? false;
          const vtiled = rm.background_vtiled[i] ?? false;
          const startx = htiled ? vx - pos_mod(vx - bx, bg.width) : bx;
          const endx = htiled ? vx + vw : bx + bg.width;
          const starty = vtiled ? vy - pos_mod(vy - by, bg.height) : by;
          const endy = vtiled ? vy + vh : by + bg.height;
          for (let yy = starty; yy < endy; yy += bg.height) {
            for (let xx = startx; xx < endx; xx += bg.width) {
              this.batch.add_quad(xx, yy, bg.width, bg.height, 0, 0, 1, 1, cr, cg, cb, this.draw_alpha, bg.texture.texture);
            }
          }
        }
      }
      /**
       * Draws the room's tile layers (back-to-front by depth). Each tile is a
       * sub-rectangle of a background resource drawn at its room position.
       * @param rm - The room
       */
      static draw_room_tiles(rm) {
        const tiles = [...rm.get_tiles()].sort((a, b) => b.depth - a.depth);
        for (const t of tiles) {
          if (!t.visible)
            continue;
          const bg = resource.findByID(t.background);
          if (!bg || !bg.texture)
            continue;
          const u0 = t.left / bg.width, v0 = t.top / bg.height;
          const u1 = (t.left + t.width) / bg.width, v1 = (t.top + t.height) / bg.height;
          const [r, g, b] = color_to_rgb_normalized(16777215);
          this.batch.add_quad(t.x, t.y, t.width * t.xscale, t.height * t.yscale, u0, v0, u1, v1, r, g, b, t.alpha, bg.texture.texture);
        }
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
        if (this.halign === 1)
          dx -= cached.width / 2;
        else if (this.halign === 2)
          dx -= cached.width;
        if (this.valign === 1)
          dy -= cached.height / 2;
        else if (this.valign === 2)
          dy -= cached.height;
        this.batch.add_quad(dx, dy, cached.width, cached.height, 0, 0, 1, 1, 1, 1, 1, this.draw_alpha, cached.entry.texture);
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
        if (w < 0.5 || h < 0.5)
          return;
        this.batch.add_quad(minX, minY, w, h, 0, 0, 1, 1, r, g, b, a, texture);
      }
      /**
       * Draws a line as a thin rectangular quad aligned to the line direction.
       */
      static draw_line_width_internal(x1, y1, x2, y2, width, r, g, b, a, texture) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-3)
          return;
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
        if (!loc)
          return;
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
    renderer.projection_loc = null;
    renderer.active_proj_loc = null;
    renderer.draw_color = 16777215;
    renderer.draw_alpha = 1;
    renderer.blend_mode = bm_normal;
    renderer.current_font = new font_resource("Arial", 16);
    renderer.halign = 0;
    renderer.valign = 0;
    renderer.active_surface = null;
  }
});

// packages/engine/dist/drawing/sprite.js
function sprite_register_name(name, id) {
  _sprite_names.set(name, id);
}
function sprite_get_index(name) {
  return _sprite_names.get(name) ?? -1;
}
var sprite, _sprite_names;
var init_sprite = __esm({
  "packages/engine/dist/drawing/sprite.js"() {
    "use strict";
    init_engine_globals();
    init_resource();
    init_renderer();
    sprite = class extends resource {
      constructor() {
        super();
        this.frames = [];
        this.xoffset = 0;
        this.yoffset = 0;
        this.width = 0;
        this.height = 0;
        this.mask_left = -1;
        this.mask_top = -1;
        this.mask_right = -1;
        this.mask_bottom = -1;
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
        if (this.frames.length === 0)
          return void 0;
        const i = Math.floor(index) % this.frames.length;
        return this.frames[i < 0 ? i + this.frames.length : i];
      }
    };
    _sprite_names = /* @__PURE__ */ new Map();
  }
});

// packages/engine/dist/core/gm_object.js
var gm_object;
var init_gm_object = __esm({
  "packages/engine/dist/core/gm_object.js"() {
    "use strict";
    init_engine_globals();
    init_instance();
    init_sprite();
    gm_object = class extends instance {
      /**
       * Applies this object's static metadata defaults to the new instance.
       * @param room - The room this instance belongs to
       */
      constructor(room2) {
        super(room2);
        const cls = this.constructor;
        this.solid = cls.solid;
        this.visible = cls.visible;
        this.persistent = cls.persistent;
        this.depth = cls.depth;
        if (cls.sprite)
          this.sprite_index = sprite_get_index(cls.sprite);
        else if (cls.default_sprite)
          this.sprite_index = cls.default_sprite.id;
        if (cls.physics) {
          this.phy_request(cls.physics_shape, cls.physics_density, cls.physics_restitution, cls.physics_friction, cls.physics_sensor);
        }
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
          if (current === this)
            return true;
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
    gm_object.default_sprite = null;
    gm_object.parent = null;
    gm_object.object_name = "";
    gm_object.solid = false;
    gm_object.visible = true;
    gm_object.persistent = false;
    gm_object.depth = 0;
    gm_object.sprite = null;
    gm_object.physics = false;
    gm_object.physics_shape = "box";
    gm_object.physics_density = 0.5;
    gm_object.physics_restitution = 0.1;
    gm_object.physics_friction = 0.2;
    gm_object.physics_sensor = false;
  }
});

// packages/engine/dist/core/timeline.js
var init_timeline = __esm({
  "packages/engine/dist/core/timeline.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/drawing/background.js
var background;
var init_background = __esm({
  "packages/engine/dist/drawing/background.js"() {
    "use strict";
    init_engine_globals();
    init_resource();
    background = class extends resource {
      constructor() {
        super();
        this.texture = null;
        this.width = 0;
        this.height = 0;
        this.tile_h = false;
        this.tile_v = false;
        this.smooth = false;
      }
      /**
       * Sets the texture for this background.
       * @param texture - The texture entry to use
       */
      set_texture(texture) {
        this.texture = texture;
        this.width = texture.width;
        this.height = texture.height;
      }
    };
  }
});

// packages/engine/dist/drawing/shader_system.js
var init_shader_system = __esm({
  "packages/engine/dist/drawing/shader_system.js"() {
    "use strict";
    init_engine_globals();
    init_shader();
    init_renderer();
  }
});

// packages/engine/dist/drawing/view.js
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
var MAX_VIEWS, _views;
var init_view = __esm({
  "packages/engine/dist/drawing/view.js"() {
    "use strict";
    init_engine_globals();
    init_renderer();
    MAX_VIEWS = 8;
    _views = Array.from({ length: MAX_VIEWS }, () => make_default_view());
  }
});

// packages/engine/dist/drawing/draw_functions.js
function draw_set_color(col) {
  renderer.set_color(col);
}
function draw_rectangle(x1, y1, x2, y2, outline) {
  renderer.draw_rectangle(x1, y1, x2, y2, outline);
}
function draw_circle(x, y, r, outline) {
  renderer.draw_circle(x, y, r, outline);
}
function draw_text(x, y, text) {
  renderer.draw_text(x, y, String(text));
}
var init_draw_functions = __esm({
  "packages/engine/dist/drawing/draw_functions.js"() {
    "use strict";
    init_engine_globals();
    init_renderer();
    init_font();
    init_renderer();
    init_sprite();
    init_font();
  }
});

// packages/engine/dist/input/io.js
var init_io = __esm({
  "packages/engine/dist/input/io.js"() {
    "use strict";
    init_engine_globals();
    init_keyboard();
    init_mouse();
  }
});

// packages/engine/dist/utils/encoding.js
var init_encoding = __esm({
  "packages/engine/dist/utils/encoding.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/ds_list.js
var init_ds_list = __esm({
  "packages/engine/dist/data/ds_list.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/ds_map.js
var init_ds_map = __esm({
  "packages/engine/dist/data/ds_map.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/ds_grid.js
var init_ds_grid = __esm({
  "packages/engine/dist/data/ds_grid.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/ds_stack.js
var init_ds_stack = __esm({
  "packages/engine/dist/data/ds_stack.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/ds_queue.js
var init_ds_queue = __esm({
  "packages/engine/dist/data/ds_queue.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/ds_priority.js
var init_ds_priority = __esm({
  "packages/engine/dist/data/ds_priority.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/storage/ini.js
var init_ini = __esm({
  "packages/engine/dist/storage/ini.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/storage/file_system.js
var init_file_system = __esm({
  "packages/engine/dist/storage/file_system.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/storage/json_storage.js
var init_json_storage = __esm({
  "packages/engine/dist/storage/json_storage.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/audio/audio_system.js
var audio_system;
var init_audio_system = __esm({
  "packages/engine/dist/audio/audio_system.js"() {
    "use strict";
    init_engine_globals();
    audio_system = class {
      /**
       * Initialises the Web Audio context and master gain node.
       * Safe to call multiple times — only initialises once.
       */
      static init() {
        if (this._ctx)
          return;
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
        if (!this._ctx)
          return Promise.resolve();
        return this._ctx.resume();
      }
      /**
       * Returns the shared AudioContext.
       * Throws if init() has not been called.
       */
      static get ctx() {
        if (!this._ctx)
          throw new Error("audio_system: call init() first");
        return this._ctx;
      }
      /**
       * Returns the master GainNode.
       * Throws if init() has not been called.
       */
      static get master() {
        if (!this._master)
          throw new Error("audio_system: call init() first");
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
        if (!this._master)
          return;
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
    audio_system._ctx = null;
    audio_system._master = null;
  }
});

// packages/engine/dist/audio/audio_group.js
function set_stop_group_callback(cb) {
  _stop_group_cb = cb;
}
var _stop_group_cb;
var init_audio_group = __esm({
  "packages/engine/dist/audio/audio_group.js"() {
    "use strict";
    init_engine_globals();
    init_audio_system();
    init_resource();
    _stop_group_cb = null;
  }
});

// packages/engine/dist/audio/sound.js
var _instances, _instance_groups;
var init_sound = __esm({
  "packages/engine/dist/audio/sound.js"() {
    "use strict";
    init_engine_globals();
    init_audio_system();
    init_resource();
    init_audio_group();
    set_stop_group_callback((group_name) => {
      for (const [id, name] of _instance_groups) {
        if (name === group_name)
          _instances.get(id)?.stop();
      }
    });
    _instances = /* @__PURE__ */ new Map();
    _instance_groups = /* @__PURE__ */ new Map();
  }
});

// packages/engine/dist/audio/audio_3d.js
var init_audio_3d = __esm({
  "packages/engine/dist/audio/audio_3d.js"() {
    "use strict";
    init_engine_globals();
    init_audio_system();
    init_sound();
    init_audio_group();
  }
});

// packages/engine/dist/physics/physics_joint.js
var import_matter_js3;
var init_physics_joint = __esm({
  "packages/engine/dist/physics/physics_joint.js"() {
    "use strict";
    init_engine_globals();
    import_matter_js3 = __toESM(require_matter(), 1);
    init_physics_world();
    init_physics_body();
  }
});

// packages/engine/dist/networking/buffer.js
var buffer_u8, buffer_s8, buffer_u16, buffer_s16, buffer_u32, buffer_s32, buffer_f32, buffer_f64, buffer_bool, buffer_string, buffer_u64, TYPE_SIZES;
var init_buffer = __esm({
  "packages/engine/dist/networking/buffer.js"() {
    "use strict";
    init_engine_globals();
    buffer_u8 = 0;
    buffer_s8 = 1;
    buffer_u16 = 2;
    buffer_s16 = 3;
    buffer_u32 = 4;
    buffer_s32 = 5;
    buffer_f32 = 6;
    buffer_f64 = 7;
    buffer_bool = 8;
    buffer_string = 9;
    buffer_u64 = 10;
    TYPE_SIZES = {
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
  }
});

// packages/engine/dist/networking/websocket_client.js
var init_websocket_client = __esm({
  "packages/engine/dist/networking/websocket_client.js"() {
    "use strict";
    init_engine_globals();
    init_buffer();
  }
});

// packages/engine/dist/networking/webrtc_client.js
var init_webrtc_client = __esm({
  "packages/engine/dist/networking/webrtc_client.js"() {
    "use strict";
    init_engine_globals();
    init_buffer();
  }
});

// packages/engine/dist/networking/http_client.js
var init_http_client = __esm({
  "packages/engine/dist/networking/http_client.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/particles/particle_type.js
var init_particle_type = __esm({
  "packages/engine/dist/particles/particle_type.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/particles/particle_system.js
var init_particle_system = __esm({
  "packages/engine/dist/particles/particle_system.js"() {
    "use strict";
    init_engine_globals();
    init_particle_type();
    init_renderer();
  }
});

// packages/engine/dist/particles/particle_emitter.js
var init_particle_emitter = __esm({
  "packages/engine/dist/particles/particle_emitter.js"() {
    "use strict";
    init_engine_globals();
    init_particle_system();
  }
});

// packages/engine/dist/3d/transform_3d.js
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
var _stack, _current;
var init_transform_3d = __esm({
  "packages/engine/dist/3d/transform_3d.js"() {
    "use strict";
    init_engine_globals();
    _stack = [mat4_identity()];
    _current = _stack[0];
  }
});

// packages/engine/dist/3d/lighting_3d.js
function _default_light() {
  return { enabled: false, type: d3d_lighttype_directional, x: 0, y: 0, z: -1, r: 1, g: 1, b: 1, range: 100 };
}
var d3d_lighttype_directional, MAX_LIGHTS, _lights;
var init_lighting_3d = __esm({
  "packages/engine/dist/3d/lighting_3d.js"() {
    "use strict";
    init_engine_globals();
    d3d_lighttype_directional = 0;
    MAX_LIGHTS = 8;
    _lights = Array.from({ length: MAX_LIGHTS }, _default_light);
  }
});

// packages/engine/dist/3d/model.js
var init_model = __esm({
  "packages/engine/dist/3d/model.js"() {
    "use strict";
    init_engine_globals();
    init_renderer();
    init_transform_3d();
  }
});

// packages/engine/dist/3d/model_loader.js
var init_model_loader = __esm({
  "packages/engine/dist/3d/model_loader.js"() {
    "use strict";
    init_engine_globals();
    init_model();
  }
});

// packages/engine/dist/math/vectors.js
var init_vectors = __esm({
  "packages/engine/dist/math/vectors.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/math/math_utils.js
var DEG2RAD, RAD2DEG;
var init_math_utils = __esm({
  "packages/engine/dist/math/math_utils.js"() {
    "use strict";
    init_engine_globals();
    DEG2RAD = Math.PI / 180;
    RAD2DEG = 180 / Math.PI;
  }
});

// packages/engine/dist/core/type_checks.js
var init_type_checks = __esm({
  "packages/engine/dist/core/type_checks.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/data/array_utils.js
var init_array_utils = __esm({
  "packages/engine/dist/data/array_utils.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/core/window.js
var init_window = __esm({
  "packages/engine/dist/core/window.js"() {
    "use strict";
    init_engine_globals();
    init_renderer();
  }
});

// packages/engine/dist/core/variables.js
var init_variables = __esm({
  "packages/engine/dist/core/variables.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/math/string_utils.js
var init_string_utils = __esm({
  "packages/engine/dist/math/string_utils.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/math/regex_utils.js
var init_regex_utils = __esm({
  "packages/engine/dist/math/regex_utils.js"() {
    "use strict";
    init_engine_globals();
  }
});

// packages/engine/dist/index.js
var init_dist = __esm({
  "packages/engine/dist/index.js"() {
    "use strict";
    init_engine_globals();
    init_game_loop();
    init_system();
    init_datetime();
    init_instance();
    init_motion_planning();
    init_room();
    init_tiles();
    init_resource();
    init_game_event();
    init_gm_object();
    init_path();
    init_timeline();
    init_collision();
    init_instance();
    init_renderer();
    init_sprite();
    init_background();
    init_font();
    init_texture_manager();
    init_shader_system();
    init_view();
    init_draw_functions();
    init_color();
    init_keyboard();
    init_io();
    init_encoding();
    init_mouse();
    init_gamepad();
    init_touch();
    init_ds_list();
    init_ds_map();
    init_ds_grid();
    init_ds_stack();
    init_ds_queue();
    init_ds_priority();
    init_ini();
    init_file_system();
    init_json_storage();
    init_audio_system();
    init_audio_group();
    init_sound();
    init_audio_3d();
    init_physics_world();
    init_physics_body();
    init_physics_joint();
    init_buffer();
    init_websocket_client();
    init_webrtc_client();
    init_http_client();
    init_particle_type();
    init_particle_system();
    init_particle_emitter();
    init_transform_3d();
    init_lighting_3d();
    init_model();
    init_model_loader();
    init_vectors();
    init_math_utils();
    init_type_checks();
    init_array_utils();
    init_window();
    init_game_state();
    init_variables();
    init_random();
    init_string_utils();
    init_regex_utils();
  }
});

// ../../Silkweaver/_engine_globals.ts
var init_engine_globals = __esm({
  "../../Silkweaver/_engine_globals.ts"() {
    init_dist();
  }
});

// ../../Silkweaver/_entry.ts
init_engine_globals();
init_dist();

// ../../Silkweaver/objects/obj_platform.ts
init_engine_globals();
init_dist();
var obj_platform = class extends gm_object {
  static solid = true;
  static depth = 10;
  pw = 96;
  ph = 24;
  on_create() {
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + this.pw;
    this.bbox_bottom = this.y + this.ph;
  }
  on_step_begin() {
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + this.pw;
    this.bbox_bottom = this.y + this.ph;
  }
  on_draw() {
    draw_set_color(make_color_rgb(60, 140, 60));
    draw_rectangle(this.x, this.y, this.x + this.pw, this.y + this.ph, false);
    draw_set_color(make_color_rgb(100, 200, 100));
    draw_rectangle(this.x, this.y, this.x + this.pw, this.y + this.ph, true);
  }
};

// ../../Silkweaver/objects/obj_coin.ts
init_engine_globals();
init_dist();
var obj_coin = class extends gm_object {
  static depth = 5;
  cr = 8;
  // radius
  on_create() {
    this.bbox_left = this.x - this.cr;
    this.bbox_top = this.y - this.cr;
    this.bbox_right = this.x + this.cr;
    this.bbox_bottom = this.y + this.cr;
  }
  on_step() {
    this.bbox_left = this.x - this.cr;
    this.bbox_top = this.y - this.cr;
    this.bbox_right = this.x + this.cr;
    this.bbox_bottom = this.y + this.cr;
  }
  on_draw() {
    draw_set_color(make_color_rgb(255, 215, 0));
    draw_circle(this.x, this.y, this.cr, false);
    draw_set_color(make_color_rgb(255, 165, 0));
    draw_circle(this.x, this.y, this.cr, true);
  }
  static sprite = "spr_test";
};

// ../../Silkweaver/objects/obj_enemy.ts
init_engine_globals();
init_dist();
var obj_enemy = class extends gm_object {
  static depth = 5;
  ew = 32;
  eh = 32;
  patrol_left = 0;
  patrol_right = 0;
  on_create() {
    this.patrol_left = this.x - 80;
    this.patrol_right = this.x + 80;
    this.hspeed = 1.5;
  }
  on_step() {
    if (this.x <= this.patrol_left) {
      this.x = this.patrol_left;
      this.hspeed = 1.5;
    }
    if (this.x + this.ew >= this.patrol_right) {
      this.x = this.patrol_right - this.ew;
      this.hspeed = -1.5;
    }
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x + this.ew;
    this.bbox_bottom = this.y + this.eh;
  }
  on_draw() {
    draw_set_color(make_color_rgb(200, 50, 50));
    draw_rectangle(this.x, this.y, this.x + this.ew, this.y + this.eh, false);
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

// ../../Silkweaver/objects/obj_player.ts
init_engine_globals();
init_dist();
var obj_player = class extends gm_object {
  pw = 28;
  ph = 40;
  on_ground = false;
  score = 0;
  dead = false;
  on_create() {
    this.gravity = 0;
  }
  on_step() {
    if (this.dead) return;
    const pw = this.pw;
    const ph = this.ph;
    const platforms = [];
    for (const other of this.room.instance_get_all()) {
      if (other === this || !other.active || !other.solid) continue;
      const opw = other.pw;
      const oph = other.ph;
      if (opw !== void 0 && oph !== void 0) {
        platforms.push({ left: other.x, top: other.y, right: other.x + opw, bottom: other.y + oph });
      } else {
        platforms.push({ left: other.bbox_left, top: other.bbox_top, right: other.bbox_right, bottom: other.bbox_bottom });
      }
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
      const cr = other.cr ?? 8;
      const ol = other.x - cr, ot = other.y - cr;
      const or_ = other.x + cr, ob = other.y + cr;
      if (this.bbox_left < or_ && this.bbox_right > ol && this.bbox_top < ob && this.bbox_bottom > ot) {
        this.score = this.score + 1;
        other.instance_destroy();
      }
    }
    for (const other of this.room.instance_get_all()) {
      if (!other.active) continue;
      if (!(other instanceof obj_enemy)) continue;
      const oew = other.ew ?? 32;
      const oeh = other.eh ?? 32;
      const el = other.x, et = other.y;
      const er = other.x + oew, eb = other.y + oeh;
      if (this.bbox_left < er && this.bbox_right > el && this.bbox_top < eb && this.bbox_bottom > et) {
        if (this.vspeed >= 0 && this.bbox_bottom <= et + 12) {
          other.instance_destroy();
          this.vspeed = -7;
        } else {
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

// ../../Silkweaver/_entry.ts
var _sprite_map = {};
async function _load_sprite(name, meta_url, img_base) {
  try {
    const meta = await fetch(meta_url).then((r) => r.json());
    const spr = new sprite();
    spr.width = meta.width || 32;
    spr.height = meta.height || 32;
    spr.xoffset = meta.origin_x || 0;
    spr.yoffset = meta.origin_y || 0;
    if (typeof meta.mask_w === "number" && meta.mask_w > 0 && typeof meta.mask_h === "number" && meta.mask_h > 0) {
      spr.mask_left = meta.mask_x || 0;
      spr.mask_top = meta.mask_y || 0;
      spr.mask_right = (meta.mask_x || 0) + meta.mask_w;
      spr.mask_bottom = (meta.mask_y || 0) + meta.mask_h;
    }
    const frames = meta.frames || [];
    if (frames.length === 0) {
      console.warn(`[Sprite] ${name} has no frames defined in meta.json`);
      return;
    }
    for (const frame_meta of frames) {
      const frame_name = frame_meta.name || frame_meta;
      const frame_url = img_base + "/" + frame_name;
      try {
        const tex_entry = await renderer.tex_mgr.load(frame_url, false);
        spr.add_frame({
          texture: tex_entry,
          width: tex_entry.width,
          height: tex_entry.height
        });
      } catch (err) {
        console.warn(`[Sprite] Failed to load frame ${frame_name} for ${name}:`, err);
      }
    }
    if (spr.frames.length > 0) {
      _sprite_map[name] = spr.id;
      sprite_register_name(name, spr.id);
    } else {
      console.warn(`[Sprite] ${name} has no valid frames`);
    }
  } catch (err) {
    console.warn(`[Sprite] Failed to load ${name}:`, err);
  }
}
var _background_map = {};
async function _load_background(name, meta_url, img_base) {
  try {
    const meta = await fetch(meta_url).then((r) => r.json());
    if (!meta.file_name) {
      console.warn(`[Background] ${name} has no file_name in meta.json`);
      return;
    }
    const bg = new background();
    bg.tile_h = meta.tile_h ?? false;
    bg.tile_v = meta.tile_v ?? false;
    bg.smooth = meta.smooth ?? false;
    const img_url = img_base + "/" + meta.file_name;
    try {
      const tex_entry = await renderer.tex_mgr.load(img_url, bg.smooth);
      bg.set_texture(tex_entry);
      _background_map[name] = bg.id;
    } catch (err) {
      console.warn(`[Background] Failed to load image for ${name}:`, err);
    }
  } catch (err) {
    console.warn(`[Background] Failed to load ${name}:`, err);
  }
}
async function init(canvas) {
  renderer.init(canvas, 640, 480);
  game_loop.init_input(canvas);
  await _load_sprite("spr_test", "file://D:/Repositories/Silkweaver/sprites/spr_test/meta.json", "file://D:/Repositories/Silkweaver/sprites/spr_test");
  await _load_background("bg_test", "file://D:/Repositories/Silkweaver/backgrounds/bg_test/meta.json", "file://D:/Repositories/Silkweaver/backgrounds/bg_test");
  const _room_room_level1 = new room();
  _room_room_level1.room_width = 640;
  _room_room_level1.room_height = 480;
  _room_room_level1.room_speed = 60;
  _room_room_level1.room_persistent = false;
  _room_room_level1.background_show_color = true;
  _room_room_level1.background_solid_color = 0;
  const _inst_obj_platform_0 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(0, 448, _inst_obj_platform_0);
  _inst_obj_platform_0.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_0.on_create.bind(_inst_obj_platform_0));
  const _inst_obj_platform_1 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(96, 448, _inst_obj_platform_1);
  _inst_obj_platform_1.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_1.on_create.bind(_inst_obj_platform_1));
  const _inst_obj_platform_2 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(192, 448, _inst_obj_platform_2);
  _inst_obj_platform_2.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_2.on_create.bind(_inst_obj_platform_2));
  const _inst_obj_platform_3 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(288, 448, _inst_obj_platform_3);
  _inst_obj_platform_3.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_3.on_create.bind(_inst_obj_platform_3));
  const _inst_obj_platform_4 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(384, 448, _inst_obj_platform_4);
  _inst_obj_platform_4.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_4.on_create.bind(_inst_obj_platform_4));
  const _inst_obj_platform_5 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(480, 448, _inst_obj_platform_5);
  _inst_obj_platform_5.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_5.on_create.bind(_inst_obj_platform_5));
  const _inst_obj_platform_6 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(544, 448, _inst_obj_platform_6);
  _inst_obj_platform_6.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_6.on_create.bind(_inst_obj_platform_6));
  const _inst_obj_platform_7 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(100, 360, _inst_obj_platform_7);
  _inst_obj_platform_7.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_7.on_create.bind(_inst_obj_platform_7));
  const _inst_obj_platform_8 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(196, 360, _inst_obj_platform_8);
  _inst_obj_platform_8.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_8.on_create.bind(_inst_obj_platform_8));
  const _inst_obj_platform_9 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(300, 280, _inst_obj_platform_9);
  _inst_obj_platform_9.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_9.on_create.bind(_inst_obj_platform_9));
  const _inst_obj_platform_10 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(470, 320, _inst_obj_platform_10);
  _inst_obj_platform_10.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_10.on_create.bind(_inst_obj_platform_10));
  const _inst_obj_platform_11 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(160, 208, _inst_obj_platform_11);
  _inst_obj_platform_11.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_11.on_create.bind(_inst_obj_platform_11));
  const _inst_obj_platform_12 = new obj_platform(_room_room_level1);
  _room_room_level1.room_instance_add(390, 190, _inst_obj_platform_12);
  _inst_obj_platform_12.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_platform_12.on_create.bind(_inst_obj_platform_12));
  const _inst_obj_coin_13 = new obj_coin(_room_room_level1);
  _room_room_level1.room_instance_add(144, 320, _inst_obj_coin_13);
  _inst_obj_coin_13.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_13.on_create.bind(_inst_obj_coin_13));
  const _inst_obj_coin_14 = new obj_coin(_room_room_level1);
  _room_room_level1.room_instance_add(244, 330, _inst_obj_coin_14);
  _inst_obj_coin_14.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_14.on_create.bind(_inst_obj_coin_14));
  const _inst_obj_coin_15 = new obj_coin(_room_room_level1);
  _room_room_level1.room_instance_add(348, 250, _inst_obj_coin_15);
  _inst_obj_coin_15.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_15.on_create.bind(_inst_obj_coin_15));
  const _inst_obj_coin_16 = new obj_coin(_room_room_level1);
  _room_room_level1.room_instance_add(240, 192, _inst_obj_coin_16);
  _inst_obj_coin_16.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_16.on_create.bind(_inst_obj_coin_16));
  const _inst_obj_coin_17 = new obj_coin(_room_room_level1);
  _room_room_level1.room_instance_add(438, 160, _inst_obj_coin_17);
  _inst_obj_coin_17.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_17.on_create.bind(_inst_obj_coin_17));
  const _inst_obj_coin_18 = new obj_coin(_room_room_level1);
  _room_room_level1.room_instance_add(518, 290, _inst_obj_coin_18);
  _inst_obj_coin_18.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_coin_18.on_create.bind(_inst_obj_coin_18));
  const _inst_obj_enemy_19 = new obj_enemy(_room_room_level1);
  _room_room_level1.room_instance_add(310, 248, _inst_obj_enemy_19);
  _inst_obj_enemy_19.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_enemy_19.on_create.bind(_inst_obj_enemy_19));
  const _inst_obj_player_20 = new obj_player(_room_room_level1);
  _room_room_level1.room_instance_add(50, 396, _inst_obj_player_20);
  _inst_obj_player_20.register_events();
  game_loop.register(EVENT_TYPE.create, _inst_obj_player_20.on_create.bind(_inst_obj_player_20));
  _room_room_level1.view_enabled = true;
  _room_room_level1.view_visible[0] = true;
  _room_room_level1.view_xview[0] = 0;
  _room_room_level1.view_yview[0] = 0;
  _room_room_level1.view_wview[0] = 640;
  _room_room_level1.view_hview[0] = 480;
  _room_room_level1.view_xport[0] = 0;
  _room_room_level1.view_yport[0] = 0;
  _room_room_level1.view_wport[0] = 640;
  _room_room_level1.view_hport[0] = 480;
  _room_room_level1.view_hborder[0] = 32;
  _room_room_level1.view_vborder[0] = 32;
  _room_room_level1.view_object[0] = _inst_obj_player_20.id;
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 528, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 512, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 496, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 480, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 464, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 448, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 432, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 416, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 400, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 384, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 368, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 352, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 336, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 320, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 304, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 288, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 272, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 256, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 240, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 224, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 208, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 192, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 208, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 224, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 240, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 240, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 256, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 272, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 288, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 304, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 320, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 336, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 352, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 368, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 384, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 400, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 416, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 432, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 448, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 464, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 480, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 480, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 496, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 512, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 512, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 528, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 528, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 544, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 544, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 512, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 496, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 480, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 464, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 448, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 432, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 416, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 400, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 384, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 368, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 352, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 336, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 320, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 448, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 464, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 480, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 496, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 544, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 560, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 576, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 352, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 336, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 320, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 304, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 288, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 368, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 384, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 400, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 416, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 432, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 272, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 256, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 176, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 160, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 144, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 128, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 112, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 96, 80, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 112, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 128, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 144, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 160, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 176, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 192, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 448, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 432, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 464, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 304, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 288, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 272, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 256, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 240, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 224, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 192, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 176, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 160, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 144, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 128, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 112, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 96, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 80, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 64, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 48, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 32, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 16, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 0, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 0, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 16, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 32, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 48, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 64, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 80, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 96, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 112, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 32, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 16, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 0, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 128, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 144, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 160, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 176, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 192, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 208, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 224, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 240, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 256, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 272, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 288, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 304, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 320, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 336, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 352, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 368, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 384, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 400, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 416, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 432, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 448, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 464, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 480, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 496, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 512, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 528, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 544, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 560, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 576, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 592, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 608, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 624, 0, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 624, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 608, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 592, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 576, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 560, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 544, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 528, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 80, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 64, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 96, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 112, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 128, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 144, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 160, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 176, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 192, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 208, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 224, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 592, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 592, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 576, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 416, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 496, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 512, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 400, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 384, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 368, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 352, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 336, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 320, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 304, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 288, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 208, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 224, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 240, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 256, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 272, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 208, 32, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 48, 16, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 16, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 0, 48, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 16, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 32, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 48, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 64, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 80, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 0, 0, 16, 16, 96, 64, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 528, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 512, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 496, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 480, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 464, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 448, 224, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 432, 224, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 416, 224, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 400, 208, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 384, 192, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 384, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 368, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 368, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 352, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 336, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 320, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 320, 112, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 304, 112, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 288, 112, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 272, 112, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 256, 112, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 256, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 240, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 224, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 208, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 192, 128, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 176, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 160, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 144, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 112, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 96, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 80, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 64, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 48, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 32, 192, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 16, 192, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 0, 208, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 0, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 16, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 32, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 48, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 64, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 96, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 112, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 128, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 160, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 176, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 192, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 224, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 256, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 272, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 304, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 336, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 352, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 384, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 400, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 416, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 432, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 448, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 464, 224, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 480, 224, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 480, 208, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 496, 208, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 496, 192, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 480, 192, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 480, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 464, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 448, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 432, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 416, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 400, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 384, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 368, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 320, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 304, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 288, 144, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 272, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 256, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 240, 160, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 240, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 224, 176, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 208, 192, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 208, 208, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 192, 224, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 192, 240, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 192, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 208, 256, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 208, 272, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 208, 288, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 224, 304, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 240, 304, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 256, 320, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 272, 336, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 288, 336, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 304, 336, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 320, 352, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 336, 352, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 352, 352, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 368, 352, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 384, 352, 1e6);
  if (_background_map["bg_test"] !== void 0) _room_room_level1.tile_add(_background_map["bg_test"], 128, 96, 16, 16, 400, 352, 1e6);
  const start = _room_room_level1;
  if (!start) {
    console.error("[Game] No rooms defined.");
    return;
  }
  game_loop.start(start);
}
export {
  init as default
};
/*! Bundled license information:

matter-js/build/matter.js:
  (*!
   * matter-js 0.20.0 by @liabru
   * http://brm.io/matter-js/
   * License MIT
   * 
   * The MIT License (MIT)
   * 
   * Copyright (c) Liam Brummitt and contributors.
   * 
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)
*/
