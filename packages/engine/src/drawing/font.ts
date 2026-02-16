/**
 * Text/font rendering via canvas-to-texture.
 * Renders text to a temporary 2D canvas and uploads it as a WebGL texture.
 * Caches textures for strings that are drawn repeatedly.
 */

import type { texture_manager, texture_entry } from './texture_manager.js'

/**
 * A font resource defining CSS font properties.
 */
export class font_resource {
    public name: string       // CSS font string (e.g. "16px Arial")
    public size: number       // Font size in pixels
    public family: string     // Font family name
    public bold: boolean      // Bold weight
    public italic: boolean    // Italic style

    constructor(family: string = 'Arial', size: number = 16, bold: boolean = false, italic: boolean = false) {
        this.family = family
        this.size = size
        this.bold = bold
        this.italic = italic
        this.name = this.build_css()
    }

    /** Builds the CSS font string. */
    private build_css(): string {
        const style = this.italic ? 'italic ' : ''
        const weight = this.bold ? 'bold ' : ''
        return `${style}${weight}${this.size}px ${this.family}`
    }
}

/** A cached text texture with associated metrics. */
interface text_cache_entry {
    entry: texture_entry    // GPU texture for this text
    width: number           // Width of the rendered text in pixels
    height: number          // Height of the rendered text in pixels
}

/**
 * Manages text rasterization and caching.
 */
export class font_renderer {
    private tex_manager: texture_manager
    private cache: Map<string, text_cache_entry> = new Map()
    private offscreen: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    constructor(tex_manager: texture_manager) {
        this.tex_manager = tex_manager
        this.offscreen = document.createElement('canvas')
        const ctx = this.offscreen.getContext('2d')
        if (!ctx) throw new Error('Cannot create 2D canvas context for text rendering')
        this.ctx = ctx
    }

    /**
     * Returns a cached or newly-rendered texture for the given text string.
     * @param text - Text to render
     * @param fnt - Font resource to use
     * @param color_css - CSS color string (e.g. "#FFFFFF")
     * @returns text_cache_entry containing the texture and dimensions
     */
    public get_texture(text: string, fnt: font_resource, color_css: string): text_cache_entry {
        const key = `${fnt.name}|${color_css}|${text}`
        const cached = this.cache.get(key)
        if (cached) return cached

        const entry = this.rasterize(text, fnt, color_css)
        this.cache.set(key, entry)
        return entry
    }

    /**
     * Rasterizes text to a canvas and uploads it to a WebGL texture.
     */
    private rasterize(text: string, fnt: font_resource, color_css: string): text_cache_entry {
        const ctx = this.ctx
        ctx.font = fnt.name

        const metrics = ctx.measureText(text)
        const w = Math.max(1, Math.ceil(metrics.width))
        const h = Math.max(1, Math.ceil(fnt.size * 1.5))  // 1.5× line height gives room for descenders

        this.offscreen.width = w
        this.offscreen.height = h

        // Canvas is cleared on resize — re-set font after resize
        ctx.font = fnt.name
        ctx.fillStyle = color_css
        ctx.textBaseline = 'top'
        ctx.clearRect(0, 0, w, h)
        ctx.fillText(text, 0, 0)

        const tex_entry = this.tex_manager.from_canvas(this.offscreen, true)
        return { entry: tex_entry, width: w, height: h }
    }

    /**
     * Measures the pixel width of a string with the given font.
     * @param text - Text to measure
     * @param fnt - Font resource
     * @returns Width in pixels
     */
    public measure_width(text: string, fnt: font_resource): number {
        this.ctx.font = fnt.name
        return Math.ceil(this.ctx.measureText(text).width)
    }

    /**
     * Measures the pixel height of a string with the given font.
     * @param fnt - Font resource
     * @returns Height in pixels
     */
    public measure_height(fnt: font_resource): number {
        return Math.ceil(fnt.size * 1.5)
    }

    /**
     * Clears the text texture cache and frees GPU memory.
     */
    public clear_cache(): void {
        for (const entry of this.cache.values()) {
            this.tex_manager.free_texture(entry.entry.texture)
        }
        this.cache.clear()
    }
}
