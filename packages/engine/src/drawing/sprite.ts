/**
 * Sprite resource — holds frames (textures) and origin point.
 * Mirrors GMS sprite data structure.
 */

import { resource } from '../core/resource.js'
import { renderer } from './renderer.js'
import type { texture_entry } from './texture_manager.js'

/**
 * A single frame of a sprite animation.
 */
export interface sprite_frame {
    texture: texture_entry    // GPU texture for this frame
    width: number             // Frame width in pixels
    height: number            // Frame height in pixels
}

/**
 * A sprite resource containing one or more animation frames and an origin point.
 */
export class sprite extends resource {
    public frames: sprite_frame[] = []   // Animation frames
    public xoffset: number = 0           // Horizontal origin point (pixels from left)
    public yoffset: number = 0           // Vertical origin point (pixels from top)
    public width: number = 0             // Width of the first frame
    public height: number = 0            // Height of the first frame

    // Collision mask rectangle in sprite-local pixels. Defaults of -1 mean
    // "use the full sprite bounds"; the sprite editor / build can set a tighter box.
    public mask_left:   number = -1      // Mask left edge (px from sprite left)
    public mask_top:    number = -1      // Mask top edge
    public mask_right:  number = -1      // Mask right edge
    public mask_bottom: number = -1      // Mask bottom edge

    constructor() {
        super()
    }

    /**
     * Adds a frame to this sprite.
     * @param frame - The frame to add
     */
    public add_frame(frame: sprite_frame): void {
        this.frames.push(frame)
        // Width/height taken from first frame
        if (this.frames.length === 1) {
            this.width = frame.width
            this.height = frame.height
        }
    }

    /**
     * Returns the number of frames in this sprite.
     */
    public get_number(): number {
        return this.frames.length
    }

    /**
     * Returns the frame at the given index, wrapping around if out of range.
     * @param index - Frame index
     * @returns sprite_frame or undefined if the sprite has no frames
     */
    public get_frame(index: number): sprite_frame | undefined {
        if (this.frames.length === 0) return undefined
        const i = Math.floor(index) % this.frames.length
        return this.frames[i < 0 ? i + this.frames.length : i]
    }
}

// =========================================================================
// Sprite query functions (GMS API)
// =========================================================================

/**
 * Returns the width of the given sprite resource.
 * @param spr - Sprite instance
 */
export function sprite_get_width(spr: sprite): number {
    return spr.width
}

/**
 * Returns the height of the given sprite resource.
 * @param spr - Sprite instance
 */
export function sprite_get_height(spr: sprite): number {
    return spr.height
}

/**
 * Returns the X origin of the given sprite resource.
 * @param spr - Sprite instance
 */
export function sprite_get_xoffset(spr: sprite): number {
    return spr.xoffset
}

/**
 * Returns the Y origin of the given sprite resource.
 * @param spr - Sprite instance
 */
export function sprite_get_yoffset(spr: sprite): number {
    return spr.yoffset
}

/**
 * Returns the number of frames of the given sprite resource.
 * @param spr - Sprite instance
 */
export function sprite_get_number(spr: sprite): number {
    return spr.get_number()
}

// =========================================================================
// Sprite name registry — resolve a sprite resource by its project name
// =========================================================================

/** Maps a sprite's project name to its resource id (populated by the game bootstrap). */
const _sprite_names: Map<string, number> = new Map()

/** Registers a sprite resource under a name so it can be looked up by name. */
export function sprite_register_name(name: string, id: number): void {
    _sprite_names.set(name, id)
}

/**
 * Returns the resource id of a sprite by its project name, or -1 if unknown.
 * GMS-style asset lookup — e.g. resolving `static sprite = 'spr_player'`.
 * @param name - Sprite resource name
 */
export function sprite_get_index(name: string): number {
    return _sprite_names.get(name) ?? -1
}

// =========================================================================
// Runtime sprite management (GMS sprite_add / sprite_duplicate / …)
// =========================================================================

/** Resolves a sprite by its resource id, or null. */
function _sprite_by_id(sprite_index: number): sprite | null {
    const res = resource.findByID(sprite_index)
    return res instanceof sprite ? res : null
}

/**
 * Resolves a sprite argument that may be a sprite object OR a resource id
 * (e.g. from `sprite_get_index('spr_x')`). Lets the draw_sprite_* family accept
 * an index the GMS way as well as a direct sprite object. Returns null if unresolvable.
 * @param spr - A sprite object or its resource id
 */
export function sprite_resolve(spr: sprite | number): sprite | null {
    return typeof spr === 'number' ? _sprite_by_id(spr) : (spr ?? null)
}

/** Returns true if the id refers to a sprite resource. */
export function sprite_exists(sprite_index: number): boolean {
    return _sprite_by_id(sprite_index) !== null
}

/** Sets a sprite's origin (offset), in pixels from the top-left. */
export function sprite_set_offset(sprite_index: number, xoff: number, yoff: number): void {
    const s = _sprite_by_id(sprite_index)
    if (s) { s.xoffset = xoff; s.yoffset = yoff }
}

/**
 * Duplicates a sprite (sharing the source's frame textures) and returns the new sprite's id.
 * @returns New sprite id, or -1 if the source doesn't exist
 */
export function sprite_duplicate(sprite_index: number): number {
    const src = _sprite_by_id(sprite_index)
    if (!src) return -1
    const dup = new sprite()
    dup.width   = src.width
    dup.height  = src.height
    dup.xoffset = src.xoffset
    dup.yoffset = src.yoffset
    for (const f of src.frames) dup.add_frame({ texture: f.texture, width: f.width, height: f.height })
    return dup.id
}

/**
 * Loads an image at runtime and creates a sprite (GMS `sprite_add`).
 * Asynchronous — image fetch + GPU upload are async on the web, so `await` the result.
 *
 * When `imgnumb > 1` the image is treated as a horizontal strip and split into that many
 * equal-width sub-images (frames). When `removeback` is true, the colour of each sub-image's
 * bottom-left pixel is keyed out to full transparency.
 *
 * @param fname - Image URL
 * @param imgnumb - Number of sub-images packed horizontally in the strip (default 1)
 * @param removeback - Make the background colour (bottom-left pixel) transparent
 * @param smooth - Use linear texture filtering
 * @param xorig - Origin X (pixels)
 * @param yorig - Origin Y (pixels)
 * @returns The new sprite's id, or -1 on failure (e.g. a headless host or load error)
 */
export async function sprite_add(
    fname: string, imgnumb: number = 1, removeback: boolean = false,
    smooth: boolean = false, xorig: number = 0, yorig: number = 0,
): Promise<number> {
    const count = Math.max(1, Math.floor(imgnumb))
    try {
        // Fast path — a single frame with no background removal reuses the cached texture loader.
        if (count === 1 && !removeback) {
            const tex = await renderer.tex_mgr.load(fname, smooth)
            const spr = new sprite()
            spr.xoffset = xorig
            spr.yoffset = yorig
            spr.add_frame({ texture: tex, width: tex.width, height: tex.height })
            return spr.id
        }

        // Strip / removeback path — decode, slice into `count` equal sub-images across the
        // width, optionally key out the background colour, and upload each as its own frame.
        const img = await _load_image_element(fname)
        const fw  = Math.max(1, Math.floor(img.width / count))
        const fh  = img.height
        const spr = new sprite()
        spr.xoffset = xorig
        spr.yoffset = yorig
        for (let i = 0; i < count; i++) {
            const canvas = document.createElement('canvas')
            canvas.width  = fw
            canvas.height = fh
            const ctx = canvas.getContext('2d')
            if (!ctx) continue
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(img, i * fw, 0, fw, fh, 0, 0, fw, fh)
            if (removeback) _remove_background(ctx, fw, fh)
            const tex = renderer.tex_mgr.from_canvas(canvas, smooth)
            spr.add_frame({ texture: tex, width: fw, height: fh })
        }
        return spr.frames.length > 0 ? spr.id : -1
    } catch {
        return -1
    }
}

/** Decodes an image URL into an HTMLImageElement (needed for pixel-level slicing). */
function _load_image_element(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const im = new Image()
        im.onload  = () => resolve(im)
        im.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        im.src = url
    })
}

/**
 * Keys out a sub-image's background colour (GMS `removeback`): every pixel whose RGB matches
 * the bottom-left pixel is made fully transparent.
 */
function _remove_background(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const image = ctx.getImageData(0, 0, w, h)
    const p = image.data
    const base = (h - 1) * w * 4   // bottom-left pixel
    const kr = p[base] ?? 0, kg = p[base + 1] ?? 0, kb = p[base + 2] ?? 0
    for (let i = 0; i < p.length; i += 4) {
        if (p[i] === kr && p[i + 1] === kg && p[i + 2] === kb) p[i + 3] = 0
    }
    ctx.putImageData(image, 0, 0)
}
