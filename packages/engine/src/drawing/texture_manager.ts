/**
 * Manages WebGL 2 texture loading and the 1x1 white pixel fallback texture.
 */

export interface texture_entry {
    texture: WebGLTexture    // GPU texture handle
    width: number            // Texture width in pixels
    height: number           // Texture height in pixels
}

/**
 * Centralized texture registry.
 * Tracks all loaded textures and provides a shared 1x1 white pixel texture for shape drawing.
 */
export class texture_manager {
    private gl: WebGL2RenderingContext
    public white_pixel: WebGLTexture   // 1x1 white texture used for colored shapes
    private textures: Map<string, texture_entry> = new Map()

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.white_pixel = this.create_white_pixel()
    }

    /**
     * Creates the 1x1 white pixel texture used when drawing solid-colored shapes.
     * @returns WebGLTexture handle
     */
    private create_white_pixel(): WebGLTexture {
        const gl = this.gl
        const tex = gl.createTexture()
        if (!tex) throw new Error('Failed to create white pixel texture')
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)
        return tex
    }

    /**
     * Loads a texture from a URL and caches it by URL.
     * @param url - Image URL
     * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)
     * @returns Promise resolving to the texture entry
     */
    public load(url: string, smooth: boolean = false): Promise<texture_entry> {
        if (this.textures.has(url)) {
            return Promise.resolve(this.textures.get(url)!)
        }
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                const entry = this.from_image(img, smooth)
                this.textures.set(url, entry)
                resolve(entry)
            }
            img.onerror = () => reject(new Error(`Failed to load texture: ${url}`))
            img.src = url
        })
    }

    /**
     * Creates a texture from an already-loaded HTMLImageElement.
     * @param img - Source image element
     * @param smooth - Use LINEAR filtering (true) or NEAREST for pixel art (false)
     * @returns texture_entry
     */
    public from_image(img: HTMLImageElement, smooth: boolean = false): texture_entry {
        const gl = this.gl
        const filter = smooth ? gl.LINEAR : gl.NEAREST
        const tex = gl.createTexture()
        if (!tex) throw new Error('Failed to create texture')
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)
        return { texture: tex, width: img.width, height: img.height }
    }

    /**
     * Creates a texture from a raw HTMLCanvasElement (used for text rendering).
     * @param canvas - Source canvas element
     * @param smooth - Use LINEAR filtering (true) or NEAREST (false)
     * @returns texture_entry
     */
    public from_canvas(canvas: HTMLCanvasElement, smooth: boolean = true): texture_entry {
        const gl = this.gl
        const filter = smooth ? gl.LINEAR : gl.NEAREST
        const tex = gl.createTexture()
        if (!tex) throw new Error('Failed to create texture from canvas')
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)
        return { texture: tex, width: canvas.width, height: canvas.height }
    }

    /**
     * Frees a texture from GPU memory and removes it from the cache.
     * @param url - URL key used when loading
     */
    public free(url: string): void {
        const entry = this.textures.get(url)
        if (entry) {
            this.gl.deleteTexture(entry.texture)
            this.textures.delete(url)
        }
    }

    /**
     * Frees a raw WebGLTexture directly (used by font_renderer cache cleanup).
     * @param texture - The GPU texture handle to delete
     */
    public free_texture(texture: WebGLTexture): void {
        this.gl.deleteTexture(texture)
    }

    /**
     * Frees all tracked textures and the white pixel texture.
     */
    public destroy(): void {
        for (const entry of this.textures.values()) {
            this.gl.deleteTexture(entry.texture)
        }
        this.textures.clear()
        this.gl.deleteTexture(this.white_pixel)
    }
}
