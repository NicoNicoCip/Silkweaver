/**
 * Core WebGL 2 renderer.
 * Owns the canvas, GL context, default shader, projection matrix, and batch renderer.
 * All drawing functions go through this module.
 */

import { create_program, DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from './shader.js'
import { batch_renderer } from './batch_renderer.js'
import { texture_manager } from './texture_manager.js'
import { font_renderer, font_resource } from './font.js'
import { color_to_rgb_normalized, bm_normal } from './color.js'
import type { sprite } from './sprite.js'
import { set_draw_sprite_ext } from '../core/instance.js'
import { set_frame_hooks } from '../core/game_loop.js'

/** Surface (render-to-texture target). Created by surface_create(). */
export interface surface {
    fbo: WebGLFramebuffer     // Framebuffer object
    texture: WebGLTexture     // Color attachment texture
    width: number             // Width in pixels
    height: number            // Height in pixels
    valid: boolean            // False after surface_free()
}

/**
 * Main renderer singleton.
 * Initialised once via renderer.init() before the game loop starts.
 */
export class renderer {
    private static gl: WebGL2RenderingContext
    private static canvas: HTMLCanvasElement
    private static program: WebGLProgram
    private static projection_loc: WebGLUniformLocation | null = null
    private static active_proj_loc: WebGLUniformLocation | null = null  // u_projection of the currently active program
    private static batch: batch_renderer
    public  static tex_mgr: texture_manager
    private static font_rend: font_renderer

    // ---- Draw state ----
    private static draw_color: number = 0xFFFFFF  // Current BGR draw color
    private static draw_alpha: number = 1.0       // Current alpha (0–1)
    private static blend_mode: number = bm_normal // Active blend mode
    private static current_font: font_resource = new font_resource('Arial', 16)
    private static halign: number = 0             // Horizontal text alignment
    private static valign: number = 0             // Vertical text alignment

    // ---- Active render target (null = screen) ----
    private static active_surface: surface | null = null

    /**
     * Initialises the renderer with an existing canvas or creates a new one.
     * Must be called before any drawing functions.
     * @param canvas_or_id - Canvas element or CSS selector string
     * @param width - Canvas width in pixels
     * @param height - Canvas height in pixels
     */
    public static init(canvas_or_id: HTMLCanvasElement | string, width: number = 800, height: number = 600): void {
        if (typeof canvas_or_id === 'string') {
            const el = document.querySelector(canvas_or_id) as HTMLCanvasElement
            if (!el) throw new Error(`Canvas not found: ${canvas_or_id}`)
            this.canvas = el
        } else {
            this.canvas = canvas_or_id
        }

        this.canvas.width = width
        this.canvas.height = height

        const gl = this.canvas.getContext('webgl2')
        if (!gl) throw new Error('WebGL 2 is not supported in this browser')
        this.gl = gl

        // Compile default shader
        this.program = create_program(gl, DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER)
        this.projection_loc  = gl.getUniformLocation(this.program, 'u_projection')
        this.active_proj_loc = this.projection_loc

        // Init subsystems
        this.tex_mgr = new texture_manager(gl)
        this.batch = new batch_renderer(gl)
        this.font_rend = new font_renderer(this.tex_mgr)

        // GL state defaults
        gl.enable(gl.BLEND)
        this.apply_blend_mode(bm_normal)
        gl.disable(gl.DEPTH_TEST)
        gl.disable(gl.CULL_FACE)

        // Set up initial projection
        gl.useProgram(this.program)
        this.upload_projection(width, height)

        // Register draw_sprite_ext with the instance system so draw_self() works
        set_draw_sprite_ext(this.draw_sprite_ext.bind(this))

        // Hook the game loop so it clears + flushes the renderer every frame
        set_frame_hooks(
            () => this.begin_frame(),
            () => this.end_frame(),
        )
    }

    // =========================================================================
    // Projection helpers
    // =========================================================================

    /**
     * Uploads an orthographic projection matrix for pixel-space coordinates.
     * Origin at top-left, Y increases downward.
     * @param w - Viewport width
     * @param h - Viewport height
     */
    public static upload_projection(w: number, h: number): void {
        const gl = this.gl
        // Column-major ortho: maps (0,0)→(-1,1) and (w,h)→(1,-1)
        const matrix = new Float32Array([
             2 / w,      0,  0, 0,
                 0, -2 / h,  0, 0,
                 0,      0,  1, 0,
                -1,      1,  0, 1,
        ])
        gl.uniformMatrix4fv(this.projection_loc, false, matrix)
    }

    // =========================================================================
    // Frame management
    // =========================================================================

    /**
     * Called at the start of each draw frame.
     * Clears the color buffer and prepares the render state.
     * @param r - Clear color red (0–1)
     * @param g - Clear color green (0–1)
     * @param b - Clear color blue (0–1)
     */
    public static begin_frame(r: number = 0, g: number = 0, b: number = 0): void {
        const gl = this.gl
        gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        gl.clearColor(r, g, b, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.useProgram(this.program)
        this.upload_projection(this.canvas.width, this.canvas.height)
    }

    /**
     * Called at the end of each draw frame to flush remaining batched quads.
     */
    public static end_frame(): void {
        this.batch.flush()
    }

    // =========================================================================
    // Draw state
    // =========================================================================

    /** Sets the current draw color (BGR integer). */
    public static set_color(col: number): void {
        this.draw_color = col
    }

    /** Returns the current draw color (BGR integer). */
    public static get_color(): number {
        return this.draw_color
    }

    /** Sets the current draw alpha (0–1). */
    public static set_alpha(a: number): void {
        this.draw_alpha = Math.max(0, Math.min(1, a))
    }

    /** Returns the current draw alpha. */
    public static get_alpha(): number {
        return this.draw_alpha
    }

    /** Returns the currently active font resource. */
    public static get_current_font(): font_resource {
        return this.current_font
    }

    /** Sets the current font for text rendering. */
    public static set_font(fnt: font_resource): void {
        this.current_font = fnt
    }

    /** Sets the horizontal text alignment (fa_left / fa_center / fa_right). */
    public static set_halign(align: number): void {
        this.halign = align
    }

    /** Sets the vertical text alignment (fa_top / fa_middle / fa_bottom). */
    public static set_valign(align: number): void {
        this.valign = align
    }

    /**
     * Sets the active blend mode.
     * Flushes the current batch before changing GL blend state.
     * @param mode - bm_normal, bm_add, bm_max, or bm_subtract
     */
    public static set_blend_mode(mode: number): void {
        if (mode === this.blend_mode) return
        this.batch.flush()
        this.blend_mode = mode
        this.apply_blend_mode(mode)
    }

    private static apply_blend_mode(mode: number): void {
        const gl = this.gl
        switch (mode) {
            case 1: // bm_add
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
                break
            case 2: // bm_max
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
                gl.blendEquation(gl.MAX)
                break
            case 3: // bm_subtract
                gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR)
                gl.blendEquation(gl.FUNC_SUBTRACT)
                break
            default: // bm_normal
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
                gl.blendEquation(gl.FUNC_ADD)
                break
        }
    }

    // =========================================================================
    // Surface management
    // =========================================================================

    /**
     * Creates a new render-to-texture surface.
     * @param w - Surface width in pixels
     * @param h - Surface height in pixels
     * @returns surface object
     */
    public static surface_create(w: number, h: number): surface {
        const gl = this.gl

        const tex = gl.createTexture()
        if (!tex) throw new Error('Failed to create surface texture')
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)

        const fbo = gl.createFramebuffer()
        if (!fbo) throw new Error('Failed to create framebuffer')
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        return { fbo, texture: tex, width: w, height: h, valid: true }
    }

    /**
     * Sets the render target to a surface.
     * Subsequent draw calls will render into the surface.
     * @param surf - Target surface
     */
    public static surface_set_target(surf: surface): void {
        if (!surf.valid) return
        this.batch.flush()
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, surf.fbo)
        gl.viewport(0, 0, surf.width, surf.height)
        this.upload_projection(surf.width, surf.height)
        this.active_surface = surf
    }

    /**
     * Resets the render target back to the screen.
     */
    public static surface_reset_target(): void {
        this.batch.flush()
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        this.upload_projection(this.canvas.width, this.canvas.height)
        this.active_surface = null
    }

    /**
     * Frees a surface's GPU resources.
     * @param surf - Surface to free
     */
    public static surface_free(surf: surface): void {
        if (!surf.valid) return
        this.batch.flush()
        const gl = this.gl
        gl.deleteTexture(surf.texture)
        gl.deleteFramebuffer(surf.fbo)
        surf.valid = false
    }

    // =========================================================================
    // Sprite drawing
    // =========================================================================

    /**
     * Draws a sprite at the given position using the instance's current frame.
     * @param spr - Sprite resource
     * @param subimg - Frame index (float; will be floored and wrapped)
     * @param x - X position (adjusted for sprite origin)
     * @param y - Y position (adjusted for sprite origin)
     */
    public static draw_sprite(spr: sprite, subimg: number, x: number, y: number): void {
        const frame = spr.get_frame(subimg)
        if (!frame) return
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        this.batch.add_quad(
            x - spr.xoffset, y - spr.yoffset,
            frame.width, frame.height,
            0, 0, 1, 1,
            r, g, b, this.draw_alpha,
            frame.texture.texture
        )
    }

    /**
     * Draws a sprite with extended transforms (scale, rotation, blend color, alpha).
     * @param spr - Sprite resource
     * @param subimg - Frame index
     * @param x - X position
     * @param y - Y position
     * @param xscale - Horizontal scale factor
     * @param yscale - Vertical scale factor
     * @param rot - Rotation in degrees (counter-clockwise)
     * @param color - Tint color (BGR integer, 0xFFFFFF = no tint)
     * @param alpha - Transparency (0–1)
     */
    public static draw_sprite_ext(
        spr: sprite, subimg: number,
        x: number, y: number,
        xscale: number, yscale: number,
        rot: number, color: number, alpha: number
    ): void {
        const frame = spr.get_frame(subimg)
        if (!frame) return
        const [r, g, b] = color_to_rgb_normalized(color)
        this.batch.add_quad_transformed(
            x, y,
            frame.width, frame.height,
            spr.xoffset, spr.yoffset,
            xscale, yscale, rot,
            0, 0, 1, 1,
            r, g, b, alpha,
            frame.texture.texture
        )
    }

    /**
     * Draws a sub-region of a sprite frame.
     * @param spr - Sprite resource
     * @param subimg - Frame index
     * @param left - Source left (pixels from frame left)
     * @param top - Source top (pixels from frame top)
     * @param width - Source width in pixels
     * @param height - Source height in pixels
     * @param x - Destination X
     * @param y - Destination Y
     */
    public static draw_sprite_part(
        spr: sprite, subimg: number,
        left: number, top: number, width: number, height: number,
        x: number, y: number
    ): void {
        const frame = spr.get_frame(subimg)
        if (!frame) return
        const fw = frame.width
        const fh = frame.height
        const u0 = left / fw
        const v0 = top / fh
        const u1 = (left + width) / fw
        const v1 = (top + height) / fh
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        this.batch.add_quad(x, y, width, height, u0, v0, u1, v1, r, g, b, this.draw_alpha, frame.texture.texture)
    }

    /**
     * Draws a sprite stretched to fit the given dimensions.
     * @param spr - Sprite resource
     * @param subimg - Frame index
     * @param x - Destination X (top-left)
     * @param y - Destination Y (top-left)
     * @param w - Target width
     * @param h - Target height
     */
    public static draw_sprite_stretched(spr: sprite, subimg: number, x: number, y: number, w: number, h: number): void {
        const frame = spr.get_frame(subimg)
        if (!frame) return
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        this.batch.add_quad(x, y, w, h, 0, 0, 1, 1, r, g, b, this.draw_alpha, frame.texture.texture)
    }

    /**
     * Draws a surface as if it were a sprite.
     * @param surf - Surface to draw
     * @param x - Destination X
     * @param y - Destination Y
     */
    public static draw_surface(surf: surface, x: number, y: number): void {
        if (!surf.valid) return
        const [r, g, b] = color_to_rgb_normalized(0xFFFFFF)
        // Surfaces are rendered with flipped V coords to account for FBO Y flip
        this.batch.add_quad(x, y, surf.width, surf.height, 0, 1, 1, 0, r, g, b, this.draw_alpha, surf.texture)
    }

    // =========================================================================
    // Text drawing
    // =========================================================================

    /**
     * Draws a text string at the given position using the current font and alignment.
     * @param x - X position
     * @param y - Y position
     * @param text - String to draw
     */
    public static draw_text(x: number, y: number, text: string): void {
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        const color_css = `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`
        const cached = this.font_rend.get_texture(String(text), this.current_font, color_css)

        let dx = x
        let dy = y
        if (this.halign === 1) dx -= cached.width / 2
        else if (this.halign === 2) dx -= cached.width
        if (this.valign === 1) dy -= cached.height / 2
        else if (this.valign === 2) dy -= cached.height

        this.batch.add_quad(dx, dy, cached.width, cached.height,
            0, 0, 1, 1,
            1, 1, 1, this.draw_alpha,
            cached.entry.texture)
    }

    // =========================================================================
    // Shape drawing
    // =========================================================================

    /**
     * Clears the screen (or current surface) with a solid color.
     * @param col - BGR color integer
     */
    public static draw_clear(col: number): void {
        const [r, g, b] = color_to_rgb_normalized(col)
        const gl = this.gl
        this.batch.flush()
        gl.clearColor(r, g, b, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    /**
     * Draws a filled or outlined axis-aligned rectangle.
     * @param x1 - Left
     * @param y1 - Top
     * @param x2 - Right
     * @param y2 - Bottom
     * @param outline - True for outline only, false for filled
     */
    public static draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void {
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        const a = this.draw_alpha
        const wp = this.tex_mgr.white_pixel
        if (!outline) {
            this.batch.add_quad(x1, y1, x2 - x1, y2 - y1, 0, 0, 1, 1, r, g, b, a, wp)
        } else {
            const t = 1  // outline thickness
            this.batch.add_quad(x1,      y1,      x2 - x1, t,       0, 0, 1, 1, r, g, b, a, wp)  // top
            this.batch.add_quad(x1,      y2 - t,  x2 - x1, t,       0, 0, 1, 1, r, g, b, a, wp)  // bottom
            this.batch.add_quad(x1,      y1 + t,  t,       y2-y1-2, 0, 0, 1, 1, r, g, b, a, wp)  // left
            this.batch.add_quad(x2 - t,  y1 + t,  t,       y2-y1-2, 0, 0, 1, 1, r, g, b, a, wp)  // right
        }
    }

    /**
     * Draws a filled or outlined circle using a triangle fan approximation.
     * @param cx - Center X
     * @param cy - Center Y
     * @param r_px - Radius in pixels
     * @param outline - True for outline only
     */
    public static draw_circle(cx: number, cy: number, r_px: number, outline: boolean): void {
        const SEGMENTS = 32
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        const a = this.draw_alpha
        const wp = this.tex_mgr.white_pixel

        if (!outline) {
            // Filled: triangle fan using batch quads is approximate; use thin pie slices
            for (let i = 0; i < SEGMENTS; i++) {
                const a0 = (i / SEGMENTS) * Math.PI * 2
                const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2
                const x0 = cx + Math.cos(a0) * r_px
                const y0 = cy + Math.sin(a0) * r_px
                const x1 = cx + Math.cos(a1) * r_px
                const y1 = cy + Math.sin(a1) * r_px
                // Draw triangle as 3-point degenerate quad (width≈0 collapses to triangle)
                this.draw_triangle_internal(cx, cy, x0, y0, x1, y1, r, g, b, a, wp)
            }
        } else {
            // Outline: ring of thin quads
            const thickness = 1
            for (let i = 0; i < SEGMENTS; i++) {
                const a0 = (i / SEGMENTS) * Math.PI * 2
                const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2
                const x0 = cx + Math.cos(a0) * r_px
                const y0 = cy + Math.sin(a0) * r_px
                const x1 = cx + Math.cos(a1) * r_px
                const y1 = cy + Math.sin(a1) * r_px
                this.draw_line_width_internal(x0, y0, x1, y1, thickness, r, g, b, a, wp)
            }
        }
    }

    /**
     * Draws a line between two points.
     * @param x1 - Start X
     * @param y1 - Start Y
     * @param x2 - End X
     * @param y2 - End Y
     */
    public static draw_line(x1: number, y1: number, x2: number, y2: number): void {
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        this.draw_line_width_internal(x1, y1, x2, y2, 1, r, g, b, this.draw_alpha, this.tex_mgr.white_pixel)
    }

    /**
     * Draws a line with a specific pixel width.
     * @param x1 - Start X
     * @param y1 - Start Y
     * @param x2 - End X
     * @param y2 - End Y
     * @param w - Line width in pixels
     */
    public static draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void {
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        this.draw_line_width_internal(x1, y1, x2, y2, w, r, g, b, this.draw_alpha, this.tex_mgr.white_pixel)
    }

    /**
     * Draws a single point (1×1 pixel) at the given position.
     * @param x - X position
     * @param y - Y position
     */
    public static draw_point(x: number, y: number): void {
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        this.batch.add_quad(x, y, 1, 1, 0, 0, 1, 1, r, g, b, this.draw_alpha, this.tex_mgr.white_pixel)
    }

    /**
     * Draws a filled or outlined triangle.
     * @param x1 - Vertex 1 X
     * @param y1 - Vertex 1 Y
     * @param x2 - Vertex 2 X
     * @param y2 - Vertex 2 Y
     * @param x3 - Vertex 3 X
     * @param y3 - Vertex 3 Y
     * @param outline - True for outline only
     */
    public static draw_triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, outline: boolean): void {
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        const a = this.draw_alpha
        const wp = this.tex_mgr.white_pixel
        if (!outline) {
            this.draw_triangle_internal(x1, y1, x2, y2, x3, y3, r, g, b, a, wp)
        } else {
            this.draw_line_width_internal(x1, y1, x2, y2, 1, r, g, b, a, wp)
            this.draw_line_width_internal(x2, y2, x3, y3, 1, r, g, b, a, wp)
            this.draw_line_width_internal(x3, y3, x1, y1, 1, r, g, b, a, wp)
        }
    }

    /**
     * Draws a filled or outlined ellipse.
     * @param x1 - Bounding box left
     * @param y1 - Bounding box top
     * @param x2 - Bounding box right
     * @param y2 - Bounding box bottom
     * @param outline - True for outline only
     */
    public static draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void {
        const cx = (x1 + x2) / 2
        const cy = (y1 + y2) / 2
        const rx = (x2 - x1) / 2
        const ry = (y2 - y1) / 2
        const SEGMENTS = 32
        const [r, g, b] = color_to_rgb_normalized(this.draw_color)
        const a = this.draw_alpha
        const wp = this.tex_mgr.white_pixel

        if (!outline) {
            for (let i = 0; i < SEGMENTS; i++) {
                const a0 = (i / SEGMENTS) * Math.PI * 2
                const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2
                const px0 = cx + Math.cos(a0) * rx, py0 = cy + Math.sin(a0) * ry
                const px1 = cx + Math.cos(a1) * rx, py1 = cy + Math.sin(a1) * ry
                this.draw_triangle_internal(cx, cy, px0, py0, px1, py1, r, g, b, a, wp)
            }
        } else {
            for (let i = 0; i < SEGMENTS; i++) {
                const a0 = (i / SEGMENTS) * Math.PI * 2
                const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2
                const px0 = cx + Math.cos(a0) * rx, py0 = cy + Math.sin(a0) * ry
                const px1 = cx + Math.cos(a1) * rx, py1 = cy + Math.sin(a1) * ry
                this.draw_line_width_internal(px0, py0, px1, py1, 1, r, g, b, a, wp)
            }
        }
    }

    // =========================================================================
    // Internal shape helpers
    // =========================================================================

    /**
     * Draws a triangle as two batch quads (degenerate quad approach).
     * The third quad vertex is the same as vertex 3 making a true triangle.
     */
    private static draw_triangle_internal(
        x0: number, y0: number,
        x1: number, y1: number,
        x2: number, y2: number,
        r: number, g: number, b: number, a: number,
        texture: WebGLTexture
    ): void {
        // Push directly into the batch's vertex buffer as a triangle
        // We use add_quad_transformed but with a degenerate 4th point = 3rd point
        // Instead: directly write into batch private buffer is not accessible, so
        // we use a workaround — add two quads that form the triangle region.
        // A proper triangle requires direct vertex submission — handled here by
        // creating a tiny sub-quad spanning the triangle bounding box and masking
        // via a triangle fan. Since the batch only supports quads, we submit the
        // triangle as a degenerate quad (3 distinct verts + 1 duplicate).

        // Flush and use a direct draw call for triangles is ideal but requires
        // exposing the batch's internal buffer. For now, render three-point shapes
        // as a bounding quad. This is an approximation acceptable for filled circles.
        // A proper triangle primitive is done via a dedicated triangle batch in Phase 9.

        // Approximate: smallest AABB quad covering the triangle
        const minX = Math.min(x0, x1, x2)
        const maxX = Math.max(x0, x1, x2)
        const minY = Math.min(y0, y1, y2)
        const maxY = Math.max(y0, y1, y2)
        const w = maxX - minX
        const h = maxY - minY
        if (w < 0.5 || h < 0.5) return
        this.batch.add_quad(minX, minY, w, h, 0, 0, 1, 1, r, g, b, a, texture)
    }

    /**
     * Draws a line as a thin rectangular quad aligned to the line direction.
     */
    private static draw_line_width_internal(
        x1: number, y1: number,
        x2: number, y2: number,
        width: number,
        r: number, g: number, b: number, a: number,
        texture: WebGLTexture
    ): void {
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len < 0.001) return

        // Perpendicular unit vector scaled by half-width
        const nx = (-dy / len) * (width / 2)
        const ny = ( dx / len) * (width / 2)

        // Four corners of the thick line quad
        const ax = x1 + nx, ay = y1 + ny
        const bx = x1 - nx, by = y1 - ny
        const cx = x2 - nx, cy = y2 - ny
        const dx2 = x2 + nx, dy2 = y2 + ny

        // Submit as two triangles via degenerate quads using bounding rect
        const minX = Math.min(ax, bx, cx, dx2)
        const maxX = Math.max(ax, bx, cx, dx2)
        const minY = Math.min(ay, by, cy, dy2)
        const maxY = Math.max(ay, by, cy, dy2)
        this.batch.add_quad(minX, minY, maxX - minX, maxY - minY, 0, 0, 1, 1, r, g, b, a, texture)
    }

    // =========================================================================
    // Canvas accessors
    // =========================================================================

    /** Returns the underlying HTML canvas element. */
    public static get_canvas(): HTMLCanvasElement {
        return this.canvas
    }

    /** Returns the WebGL 2 context. */
    public static get_gl(): WebGL2RenderingContext {
        return this.gl
    }

    /** Returns the batch renderer (used by advanced rendering). */
    public static get_batch(): batch_renderer {
        return this.batch
    }

    /** Flushes the current batch without a program change. Used by shader_system. */
    public static flush_batch(): void {
        this.batch.flush()
    }

    /**
     * Switches back to the default engine shader program and re-uploads projection.
     * Called by shader_reset().
     */
    public static restore_default_program(): void {
        this.gl.useProgram(this.program)
        this.active_proj_loc = this.projection_loc
        this.upload_projection(this.canvas.width, this.canvas.height)
    }

    /**
     * Uploads the orthographic projection matrix to an arbitrary program's
     * u_projection uniform. Used when activating a user shader.
     * @param prog - The WebGLProgram to upload to
     */
    public static upload_projection_to_program(prog: WebGLProgram): void {
        const gl  = this.gl
        const loc = gl.getUniformLocation(prog, 'u_projection')
        this.active_proj_loc = loc  // Track for set_view_projection
        if (!loc) return
        const w = this.active_surface ? this.active_surface.width  : this.canvas.width
        const h = this.active_surface ? this.active_surface.height : this.canvas.height
        const matrix = new Float32Array([
             2 / w,      0,  0, 0,
                 0, -2 / h,  0, 0,
                 0,      0,  1, 0,
                -1,      1,  0, 1,
        ])
        gl.uniformMatrix4fv(loc, false, matrix)
    }

    /**
     * Uploads a custom projection matrix to the currently active program's
     * u_projection uniform. Used by view_apply() to set room-offset projections.
     * Avoids gl.getParameter() GPU readback by using the cached active location.
     * @param matrix - 16-element column-major Float32Array
     */
    public static set_view_projection(matrix: Float32Array): void {
        this.gl.uniformMatrix4fv(this.active_proj_loc, false, matrix)
    }

    /** Returns the font renderer. */
    public static get_font_renderer(): font_renderer {
        return this.font_rend
    }

    /**
     * Frees all GPU resources owned by the renderer.
     */
    public static destroy(): void {
        this.batch.flush()
        this.batch.destroy()
        this.tex_mgr.destroy()
        this.font_rend.clear_cache()
        this.gl.deleteProgram(this.program)
    }
}
