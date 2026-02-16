/**
 * Public GMS-style draw_* API functions.
 * All functions delegate to the renderer singleton.
 */

import { renderer } from './renderer.js'
import type { sprite } from './sprite.js'
import type { surface } from './renderer.js'
import { font_resource } from './font.js'

// Re-export so users can access from a single import
export { renderer } from './renderer.js'
export { sprite, sprite_get_width, sprite_get_height, sprite_get_xoffset, sprite_get_yoffset, sprite_get_number } from './sprite.js'
export { font_resource } from './font.js'
export type { surface } from './renderer.js'

// =========================================================================
// Color & alpha
// =========================================================================

/**
 * Sets the current draw color.
 * @param col - BGR integer color (use c_* constants or make_color_rgb)
 */
export function draw_set_color(col: number): void {
    renderer.set_color(col)
}

/**
 * Returns the current draw color as a BGR integer.
 */
export function draw_get_color(): number {
    return renderer.get_color()
}

/**
 * Sets the current draw alpha (transparency).
 * @param alpha - Value from 0 (fully transparent) to 1 (fully opaque)
 */
export function draw_set_alpha(alpha: number): void {
    renderer.set_alpha(alpha)
}

/**
 * Returns the current draw alpha.
 */
export function draw_get_alpha(): number {
    return renderer.get_alpha()
}

/**
 * Clears the screen (or current surface target) with a solid color.
 * @param col - BGR integer color
 */
export function draw_clear(col: number): void {
    renderer.draw_clear(col)
}

// =========================================================================
// Blend mode
// =========================================================================

/**
 * Sets the current blend mode.
 * Flushes the batch before changing.
 * @param mode - bm_normal, bm_add, bm_max, or bm_subtract
 */
export function draw_set_blend_mode(mode: number): void {
    renderer.set_blend_mode(mode)
}

// =========================================================================
// Sprite drawing
// =========================================================================

/**
 * Draws a sprite at the given position.
 * @param spr - Sprite resource
 * @param subimg - Frame index (float, will be wrapped)
 * @param x - X position
 * @param y - Y position
 */
export function draw_sprite(spr: sprite, subimg: number, x: number, y: number): void {
    renderer.draw_sprite(spr, subimg, x, y)
}

/**
 * Draws a sprite with full transform control.
 * @param spr - Sprite resource
 * @param subimg - Frame index
 * @param x - X position
 * @param y - Y position
 * @param xscale - Horizontal scale (1 = normal)
 * @param yscale - Vertical scale (1 = normal)
 * @param rot - Rotation in degrees (counter-clockwise)
 * @param color - Tint color as BGR integer
 * @param alpha - Alpha (0–1)
 */
export function draw_sprite_ext(
    spr: sprite, subimg: number,
    x: number, y: number,
    xscale: number, yscale: number,
    rot: number, color: number, alpha: number
): void {
    renderer.draw_sprite_ext(spr, subimg, x, y, xscale, yscale, rot, color, alpha)
}

/**
 * Draws a sub-region of a sprite frame.
 * @param spr - Sprite resource
 * @param subimg - Frame index
 * @param left - Source region left in pixels
 * @param top - Source region top in pixels
 * @param width - Source region width in pixels
 * @param height - Source region height in pixels
 * @param x - Destination X
 * @param y - Destination Y
 */
export function draw_sprite_part(
    spr: sprite, subimg: number,
    left: number, top: number, width: number, height: number,
    x: number, y: number
): void {
    renderer.draw_sprite_part(spr, subimg, left, top, width, height, x, y)
}

/**
 * Draws a sprite stretched to a specific size.
 * @param spr - Sprite resource
 * @param subimg - Frame index
 * @param x - Destination X (top-left)
 * @param y - Destination Y (top-left)
 * @param w - Target width in pixels
 * @param h - Target height in pixels
 */
export function draw_sprite_stretched(spr: sprite, subimg: number, x: number, y: number, w: number, h: number): void {
    renderer.draw_sprite_stretched(spr, subimg, x, y, w, h)
}

// =========================================================================
// Shape drawing
// =========================================================================

/**
 * Draws a single pixel at the given position.
 * @param x - X position
 * @param y - Y position
 */
export function draw_point(x: number, y: number): void {
    renderer.draw_point(x, y)
}

/**
 * Draws a line between two points (1 pixel wide).
 * @param x1 - Start X
 * @param y1 - Start Y
 * @param x2 - End X
 * @param y2 - End Y
 */
export function draw_line(x1: number, y1: number, x2: number, y2: number): void {
    renderer.draw_line(x1, y1, x2, y2)
}

/**
 * Draws a line with a specified pixel width.
 * @param x1 - Start X
 * @param y1 - Start Y
 * @param x2 - End X
 * @param y2 - End Y
 * @param w - Width in pixels
 */
export function draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void {
    renderer.draw_line_width(x1, y1, x2, y2, w)
}

/**
 * Draws a filled or outlined axis-aligned rectangle.
 * @param x1 - Left edge X
 * @param y1 - Top edge Y
 * @param x2 - Right edge X
 * @param y2 - Bottom edge Y
 * @param outline - True for outline only, false for filled
 */
export function draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void {
    renderer.draw_rectangle(x1, y1, x2, y2, outline)
}

/**
 * Draws a filled or outlined circle.
 * @param x - Center X
 * @param y - Center Y
 * @param r - Radius in pixels
 * @param outline - True for outline only, false for filled
 */
export function draw_circle(x: number, y: number, r: number, outline: boolean): void {
    renderer.draw_circle(x, y, r, outline)
}

/**
 * Draws a filled or outlined ellipse.
 * @param x1 - Bounding box left
 * @param y1 - Bounding box top
 * @param x2 - Bounding box right
 * @param y2 - Bounding box bottom
 * @param outline - True for outline only, false for filled
 */
export function draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void {
    renderer.draw_ellipse(x1, y1, x2, y2, outline)
}

/**
 * Draws a filled or outlined triangle.
 * @param x1 - Vertex 1 X
 * @param y1 - Vertex 1 Y
 * @param x2 - Vertex 2 X
 * @param y2 - Vertex 2 Y
 * @param x3 - Vertex 3 X
 * @param y3 - Vertex 3 Y
 * @param outline - True for outline only, false for filled
 */
export function draw_triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, outline: boolean): void {
    renderer.draw_triangle(x1, y1, x2, y2, x3, y3, outline)
}

// =========================================================================
// Text drawing
// =========================================================================

/**
 * Draws a text string at the given position.
 * Uses the current font, color, alpha, halign, and valign settings.
 * @param x - X position
 * @param y - Y position
 * @param text - The string to draw (numbers will be converted to string)
 */
export function draw_text(x: number, y: number, text: string | number): void {
    renderer.draw_text(x, y, String(text))
}

/**
 * Sets the active font for text rendering.
 * @param fnt - font_resource instance
 */
export function draw_set_font(fnt: font_resource): void {
    renderer.set_font(fnt)
}

/**
 * Sets the horizontal text alignment.
 * @param halign - fa_left (0), fa_center (1), or fa_right (2)
 */
export function draw_set_halign(halign: number): void {
    renderer.set_halign(halign)
}

/**
 * Sets the vertical text alignment.
 * @param valign - fa_top (0), fa_middle (1), or fa_bottom (2)
 */
export function draw_set_valign(valign: number): void {
    renderer.set_valign(valign)
}

/**
 * Returns the pixel width of a string with the current font.
 * @param text - The string to measure
 */
export function string_width(text: string): number {
    return renderer.get_font_renderer().measure_width(text, renderer.get_current_font())
}

/**
 * Returns the pixel height of a string with the current font.
 */
export function string_height(): number {
    return renderer.get_font_renderer().measure_height(renderer.get_current_font())
}

// =========================================================================
// Surface functions
// =========================================================================

/**
 * Creates a new render-to-texture surface.
 * @param w - Width in pixels
 * @param h - Height in pixels
 * @returns surface object
 */
export function surface_create(w: number, h: number): surface {
    return renderer.surface_create(w, h)
}

/**
 * Sets the render target to a surface.
 * All subsequent draw calls go to this surface until surface_reset_target().
 * @param surf - Target surface
 */
export function surface_set_target(surf: surface): void {
    renderer.surface_set_target(surf)
}

/**
 * Resets the render target back to the screen.
 */
export function surface_reset_target(): void {
    renderer.surface_reset_target()
}

/**
 * Frees a surface and its GPU resources.
 * @param surf - Surface to free
 */
export function surface_free(surf: surface): void {
    renderer.surface_free(surf)
}

/**
 * Checks whether a surface is valid (not yet freed).
 * @param surf - Surface to check
 */
export function surface_exists(surf: surface): boolean {
    return surf.valid
}

/**
 * Returns the width of a surface in pixels.
 * @param surf - Surface to query
 */
export function surface_get_width(surf: surface): number {
    return surf.width
}

/**
 * Returns the height of a surface in pixels.
 * @param surf - Surface to query
 */
export function surface_get_height(surf: surface): number {
    return surf.height
}

/**
 * Draws a surface at the given position.
 * @param surf - Surface to draw
 * @param x - Destination X
 * @param y - Destination Y
 */
export function draw_surface(surf: surface, x: number, y: number): void {
    renderer.draw_surface(surf, x, y)
}
