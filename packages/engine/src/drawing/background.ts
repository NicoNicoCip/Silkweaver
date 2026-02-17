/**
 * Background resource — holds a single texture for tiling/stretching.
 * Mirrors GMS background data structure.
 */

import { resource } from '../core/resource.js'
import type { texture_entry } from './texture_manager.js'

/**
 * A background resource containing a single texture.
 */
export class background extends resource {
    public texture: texture_entry | null = null   // GPU texture for this background
    public width: number = 0                      // Background width in pixels
    public height: number = 0                     // Background height in pixels
    public tile_h: boolean = false                // Tile horizontally
    public tile_v: boolean = false                // Tile vertically
    public smooth: boolean = false                // Use smooth filtering

    constructor() {
        super()
    }

    /**
     * Sets the texture for this background.
     * @param texture - The texture entry to use
     */
    public set_texture(texture: texture_entry): void {
        this.texture = texture
        this.width = texture.width
        this.height = texture.height
    }
}

// =========================================================================
// Background query functions (GMS API)
// =========================================================================

/**
 * Returns the width of the given background resource.
 * @param bg - Background instance
 */
export function background_get_width(bg: background): number {
    return bg.width
}

/**
 * Returns the height of the given background resource.
 * @param bg - Background instance
 */
export function background_get_height(bg: background): number {
    return bg.height
}
