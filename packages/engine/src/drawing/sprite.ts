/**
 * Sprite resource — holds frames (textures) and origin point.
 * Mirrors GMS sprite data structure.
 */

import { resource } from '../core/resource.js'
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
