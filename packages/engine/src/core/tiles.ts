/**
 * Global tile functions (GMS `tile_*`) — thin wrappers that act on the current room.
 *
 * The room owns the tile data + management (see `room.ts`); these free functions are the GMS-style
 * façade so game code can call `tile_add(...)` etc. without a room reference. A tileset in GMS 1.4 is
 * just a background, and a tile is a rectangular region of it — `tile_add(background, left, top, w, h, …)`.
 *
 * (On-screen tile rendering is part of the room-rendering pass, alongside views/backgrounds.)
 */

import { game_loop } from './game_loop.js'

function _room() {
    return game_loop.room
}

/**
 * Adds a tile (a region of a background) to the current room at a depth.
 * @returns The tile id, or -1 if there is no current room
 */
export function tile_add(background: number, left: number, top: number, width: number, height: number, x: number, y: number, depth: number): number {
    return _room()?.tile_add(background, left, top, width, height, x, y, depth) ?? -1
}

/** Deletes a tile by id. */
export function tile_delete(tile_id: number): boolean {
    return _room()?.tile_delete(tile_id) ?? false
}

/** Returns true if a tile id exists in the current room. */
export function tile_exists(tile_id: number): boolean {
    return _room()?.tile_exists(tile_id) ?? false
}

/** Returns a tile's X position. */
export function tile_get_x(tile_id: number): number {
    return _room()?.tile_get_x(tile_id) ?? 0
}

/** Returns a tile's Y position. */
export function tile_get_y(tile_id: number): number {
    return _room()?.tile_get_y(tile_id) ?? 0
}

/** Returns a tile's depth. */
export function tile_get_depth(tile_id: number): number {
    return _room()?.tile_get_depth(tile_id) ?? 0
}

/** Returns a tile's visibility. */
export function tile_get_visible(tile_id: number): boolean {
    return _room()?.tile_get_visible(tile_id) ?? false
}

/** Sets a tile's position. */
export function tile_set_position(tile_id: number, x: number, y: number): void {
    _room()?.tile_set_position(tile_id, x, y)
}

/** Sets a tile's depth. */
export function tile_set_depth(tile_id: number, depth: number): void {
    _room()?.tile_set_depth(tile_id, depth)
}

/** Sets a tile's visibility. */
export function tile_set_visible(tile_id: number, visible: boolean): void {
    _room()?.tile_set_visible(tile_id, visible)
}

/** Sets a tile's scale. */
export function tile_set_scale(tile_id: number, xscale: number, yscale: number): void {
    _room()?.tile_set_scale(tile_id, xscale, yscale)
}

/** Sets a tile's alpha (0–1). */
export function tile_set_alpha(tile_id: number, alpha: number): void {
    _room()?.tile_set_alpha(tile_id, alpha)
}

/** Sets the background region a tile draws from. */
export function tile_set_background(tile_id: number, background: number, left: number, top: number, width: number, height: number): void {
    _room()?.tile_set_background(tile_id, background, left, top, width, height)
}

/** Deletes every tile at a depth. */
export function tile_layer_delete(depth: number): void {
    _room()?.tile_layer_delete(depth)
}

/** Shifts every tile at a depth by (x, y). */
export function tile_layer_shift(depth: number, x: number, y: number): void {
    _room()?.tile_layer_shift(depth, x, y)
}

/** Finds the topmost tile at a position and depth, or -1. */
export function tile_layer_find(x: number, y: number, depth: number): number {
    return _room()?.tile_layer_find(x, y, depth) ?? -1
}
