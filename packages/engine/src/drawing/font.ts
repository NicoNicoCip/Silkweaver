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

    constructor(family: string = 'sans-serif', size: number = 16, bold: boolean = false, italic: boolean = false) {
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

// =========================================================================
// Font name registry — resolve a font resource by its project name
// =========================================================================

/** Maps a font's project name to its font_resource (populated by the game bootstrap). */
const _font_names: Map<string, font_resource> = new Map()

/** Registers a font resource under a name so `draw_set_font('fnt_x')` resolves. */
export function font_register_name(name: string, fnt: font_resource): void {
    _font_names.set(name, fnt)
}

/**
 * Loads a font file (e.g. a project-bundled .ttf) and registers it under a CSS family name, so text
 * drawn with that family renders the custom font. Resolves once the font is ready — or, on failure or
 * outside a browser document, resolves quietly so the game never hangs on a missing font. Called by
 * the generated bootstrap for fonts that ship a font file.
 * @param family - CSS family name to register the font under (Silkweaver uses the font resource name)
 * @param url    - URL to the font file (relative 'assets/…' in an export, file:// in the IDE preview)
 */
export async function font_load_file(family: string, url: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = typeof document !== 'undefined' ? document : null
    if (!doc || !doc.fonts || typeof FontFace === 'undefined') return
    try {
        const face = new FontFace(family, `url("${url}")`)
        await face.load()
        doc.fonts.add(face)
    } catch (e) {
        console.warn(`[font] failed to load '${family}' from ${url}:`, e)
    }
}

/**
 * Returns a font resource by its project name, or undefined if unknown.
 * @param name - Font resource name
 */
export function font_get(name: string): font_resource | undefined {
    return _font_names.get(name)
}

/** Returns true if a font resource with the given name has been registered. */
export function font_exists(name: string): boolean {
    return _font_names.has(name)
}

/** A cached text texture with associated metrics. */
interface text_cache_entry {
    entry: texture_entry    // GPU texture for this text
    width: number           // Width of the rendered text in pixels
    height: number          // Height of the rendered text in pixels
}

/**
 * Max number of distinct rendered strings kept on the GPU at once. The cache is
 * keyed on the full text, so dynamic text (a score/timer/FPS that changes every
 * frame) would otherwise allocate a new texture per frame and never free it. When
 * the cap is exceeded the least-recently-used texture is evicted and freed.
 */
const MAX_TEXT_CACHE = 512

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
        if (cached) {
            // Mark as most-recently-used (Map keeps insertion order).
            this.cache.delete(key)
            this.cache.set(key, cached)
            return cached
        }

        const entry = this.rasterize(text, fnt, color_css)
        // Evict the least-recently-used entry (and free its GPU texture) when full.
        if (this.cache.size >= MAX_TEXT_CACHE) {
            const oldest = this.cache.keys().next().value
            if (oldest !== undefined) {
                const evicted = this.cache.get(oldest)
                if (evicted) this.tex_manager.free_texture(evicted.entry.texture)
                this.cache.delete(oldest)
            }
        }
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
