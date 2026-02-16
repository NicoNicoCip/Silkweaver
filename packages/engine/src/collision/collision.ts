/**
 * Collision detection system.
 *
 * Supports two mask types:
 *   - Rectangle (AABB) — axis-aligned bounding box
 *   - Circle  — circle based on bbox dimensions
 *
 * All functions operate on instance objects directly.
 * "Precise" (per-pixel) collision is deferred to a later phase.
 */

import type { instance } from '../core/instance.js'

// =========================================================================
// Mask types
// =========================================================================

export const MASK_RECT   = 0  // Axis-aligned bounding box
export const MASK_CIRCLE = 1  // Circle (radius = half the smaller bbox dimension)
export const MASK_ELLIPSE = 2 // Ellipse (degenerate to AABB for now)

// =========================================================================
// Bounding box helpers
// =========================================================================

/**
 * Returns the axis-aligned bounding box for an instance at a given position.
 * Uses the instance's sprite dimensions and origin, or falls back to a 1×1 box.
 *
 * @param inst - The instance
 * @param x - Override X position (defaults to inst.x)
 * @param y - Override Y position (defaults to inst.y)
 * @returns { left, top, right, bottom }
 */
export function get_bbox(inst: instance, x?: number, y?: number): { left: number; top: number; right: number; bottom: number } {
    const px = x ?? inst.x
    const py = y ?? inst.y

    // Attempt to use the sprite resource for dimensions
    // The engine stores sprite resources in resource registry; access via sprite_index
    // If no sprite, fall back to a 1×1 box centred on the instance
    const sprite = get_sprite_for_instance(inst)
    if (!sprite) {
        return { left: px, top: py, right: px + 1, bottom: py + 1 }
    }

    const sx = inst.image_xscale
    const sy = inst.image_yscale
    const w = sprite.width * sx
    const h = sprite.height * sy
    const ox = sprite.xoffset * sx
    const oy = sprite.yoffset * sy

    return {
        left:   px - ox,
        top:    py - oy,
        right:  px - ox + w,
        bottom: py - oy + h,
    }
}

/**
 * Updates the cached bbox_* properties on an instance.
 * Called internally by the collision system and by internal_step.
 * @param inst - The instance to update
 */
export function update_bbox(inst: instance): void {
    const bbox = get_bbox(inst)
    inst.bbox_left   = bbox.left
    inst.bbox_top    = bbox.top
    inst.bbox_right  = bbox.right
    inst.bbox_bottom = bbox.bottom
}

// =========================================================================
// Instance/sprite lookup helper (avoids circular import)
// =========================================================================

import { resource } from '../core/resource.js'
import type { sprite } from '../drawing/sprite.js'

function get_sprite_for_instance(inst: instance): sprite | null {
    const idx = inst.mask_index >= 0 ? inst.mask_index : inst.sprite_index
    if (idx < 0) return null
    const res = resource.findByID(idx)
    // Check sprite-specific duck-type: must have frames (Array), width, and xoffset
    if (res && 'frames' in res && 'width' in res && 'xoffset' in res && Array.isArray((res as any).frames)) {
        return res as unknown as sprite
    }
    return null
}

// =========================================================================
// AABB vs AABB overlap test
// =========================================================================

function bbox_overlap(
    a_left: number, a_top: number, a_right: number, a_bottom: number,
    b_left: number, b_top: number, b_right: number, b_bottom: number
): boolean {
    return a_left < b_right && a_right > b_left &&
           a_top  < b_bottom && a_bottom > b_top
}

// =========================================================================
// Circle vs Circle overlap test
// =========================================================================

function circles_overlap(
    ax: number, ay: number, ar: number,
    bx: number, by: number, br: number
): boolean {
    const dx = ax - bx
    const dy = ay - by
    const dist_sq = dx * dx + dy * dy
    const radii = ar + br
    return dist_sq < radii * radii
}

// =========================================================================
// Main collision test between two instances
// =========================================================================

/**
 * Returns true if instance a overlaps instance b at the given position for a.
 * @param a - The querying instance
 * @param ax - Override X for a
 * @param ay - Override Y for a
 * @param b - The target instance
 * @returns True if the instances overlap
 */
export function instances_collide(a: instance, ax: number, ay: number, b: instance): boolean {
    if (a === b) return false
    if (!b.active) return false

    const bbox_a = get_bbox(a, ax, ay)
    const bbox_b = get_bbox(b)

    // Both use rectangle mask by default
    return bbox_overlap(bbox_a.left, bbox_a.top, bbox_a.right, bbox_a.bottom,
                        bbox_b.left, bbox_b.top, bbox_b.right, bbox_b.bottom)
}

/**
 * Returns true if a point overlaps instance b's bounding box.
 * @param px - Point X
 * @param py - Point Y
 * @param b - Target instance
 * @returns True if the point is inside b's bounding box
 */
export function point_in_instance(px: number, py: number, b: instance): boolean {
    if (!b.active) return false
    const bbox = get_bbox(b)
    return px >= bbox.left && px < bbox.right && py >= bbox.top && py < bbox.bottom
}

/**
 * Returns true if a rectangle overlaps instance b's bounding box.
 * @param rx1 - Rectangle left
 * @param ry1 - Rectangle top
 * @param rx2 - Rectangle right
 * @param ry2 - Rectangle bottom
 * @param b - Target instance
 * @returns True if the rectangle overlaps b
 */
export function rect_in_instance(rx1: number, ry1: number, rx2: number, ry2: number, b: instance): boolean {
    if (!b.active) return false
    const bbox = get_bbox(b)
    return bbox_overlap(rx1, ry1, rx2, ry2, bbox.left, bbox.top, bbox.right, bbox.bottom)
}

/**
 * Returns true if a circle overlaps instance b's bounding box (uses AABB approximation).
 * @param cx - Circle center X
 * @param cy - Circle center Y
 * @param cr - Circle radius
 * @param b - Target instance
 * @returns True if they overlap
 */
export function circle_in_instance(cx: number, cy: number, cr: number, b: instance): boolean {
    if (!b.active) return false
    const bbox = get_bbox(b)
    // Closest point on AABB to circle center
    const nearest_x = Math.max(bbox.left, Math.min(cx, bbox.right))
    const nearest_y = Math.max(bbox.top,  Math.min(cy, bbox.bottom))
    const dx = cx - nearest_x
    const dy = cy - nearest_y
    return (dx * dx + dy * dy) < (cr * cr)
}

// =========================================================================
// Exported collision constants
// =========================================================================

export { bbox_overlap, circles_overlap }
