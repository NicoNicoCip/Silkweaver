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

    // A manual mask (set via mask_set_rectangle/mask_set_size) overrides the
    // sprite-derived box — this is what makes spriteless objects collide.
    if (inst.mask_manual) {
        return {
            left:   px + inst.mask_off_left,
            top:    py + inst.mask_off_top,
            right:  px + inst.mask_off_right,
            bottom: py + inst.mask_off_bottom,
        }
    }

    // Otherwise use the mask/sprite resource for dimensions.
    // If there is no sprite, fall back to a 1×1 box at the instance position.
    const sprite = get_sprite_for_instance(inst)
    if (!sprite) {
        return { left: px, top: py, right: px + 1, bottom: py + 1 }
    }

    const sx = inst.image_xscale
    const sy = inst.image_yscale
    const ox = sprite.xoffset * sx
    const oy = sprite.yoffset * sy

    // Use the sprite's collision-mask rectangle when set (mask_left >= 0); otherwise the full frame.
    const has_mask = sprite.mask_left >= 0
    const ml = has_mask ? sprite.mask_left   : 0
    const mt = has_mask ? sprite.mask_top    : 0
    const mr = has_mask ? sprite.mask_right  : sprite.width
    const mb = has_mask ? sprite.mask_bottom : sprite.height

    return {
        left:   px - ox + ml * sx,
        top:    py - oy + mt * sy,
        right:  px - ox + mr * sx,
        bottom: py - oy + mb * sy,
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

/**
 * Returns true if a line segment crosses instance b's bounding box.
 * @param x1 - Segment start X
 * @param y1 - Segment start Y
 * @param x2 - Segment end X
 * @param y2 - Segment end Y
 * @param b - Target instance
 */
export function line_in_instance(x1: number, y1: number, x2: number, y2: number, b: instance): boolean {
    if (!b.active) return false
    const bbox = get_bbox(b)
    return seg_intersects_aabb(x1, y1, x2, y2, bbox.left, bbox.top, bbox.right, bbox.bottom)
}

/**
 * Segment vs axis-aligned box intersection (Liang–Barsky clipping).
 * Returns true if any part of the segment lies within the box.
 */
function seg_intersects_aabb(
    x1: number, y1: number, x2: number, y2: number,
    left: number, top: number, right: number, bottom: number
): boolean {
    // Trivially inside: either endpoint within the box.
    if ((x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) ||
        (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom)) return true

    const dx = x2 - x1
    const dy = y2 - y1
    // Parametric clip against each slab; the segment hits the box iff t enters
    // before it exits across all four edges.
    let t0 = 0, t1 = 1
    const clip = (p: number, q: number): boolean => {
        if (p === 0) return q >= 0          // parallel: inside the slab iff q >= 0
        const r = q / p
        if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r }
        else       { if (r < t0) return false; if (r < t1) t1 = r }
        return true
    }
    if (!clip(-dx, x1 - left))   return false
    if (!clip( dx, right - x1))  return false
    if (!clip(-dy, y1 - top))    return false
    if (!clip( dy, bottom - y1)) return false
    return t0 <= t1
}

// =========================================================================
// Exported collision constants
// =========================================================================

export { bbox_overlap, circles_overlap }
