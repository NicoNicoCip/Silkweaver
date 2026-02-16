/**
 * Batched quad renderer for WebGL 2.
 * Collects sprites and shapes into a single vertex buffer and flushes with one draw call.
 * Automatically flushes when the texture, blend mode, or shader changes,
 * or when the buffer is full.
 */

// Vertex layout: [x, y, u, v, r, g, b, a]  — 8 floats per vertex, 6 vertices per quad
const FLOATS_PER_VERTEX = 8
const VERTS_PER_QUAD = 6
const FLOATS_PER_QUAD = FLOATS_PER_VERTEX * VERTS_PER_QUAD
const MAX_QUADS = 8192

export class batch_renderer {
    private gl: WebGL2RenderingContext
    private vao: WebGLVertexArrayObject
    private vbo: WebGLBuffer
    private vertices: Float32Array
    private quad_count: number = 0
    private current_texture: WebGLTexture | null = null

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.vertices = new Float32Array(MAX_QUADS * FLOATS_PER_QUAD)

        // Create VAO
        const vao = gl.createVertexArray()
        if (!vao) throw new Error('Failed to create VAO')
        this.vao = vao

        // Create VBO
        const vbo = gl.createBuffer()
        if (!vbo) throw new Error('Failed to create VBO')
        this.vbo = vbo

        // Set up vertex attributes inside the VAO
        const STRIDE = FLOATS_PER_VERTEX * 4  // 8 floats * 4 bytes

        gl.bindVertexArray(this.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices.byteLength, gl.DYNAMIC_DRAW)

        // a_position (location 0): 2 floats at byte offset 0
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE, 0)

        // a_texcoord (location 1): 2 floats at byte offset 8
        gl.enableVertexAttribArray(1)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, 8)

        // a_color (location 2): 4 floats at byte offset 16
        gl.enableVertexAttribArray(2)
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE, 16)

        gl.bindVertexArray(null)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }

    /**
     * Pushes one axis-aligned quad into the batch.
     * Flushes the batch if the texture changes or the buffer is full.
     *
     * @param x - Left edge
     * @param y - Top edge
     * @param w - Width
     * @param h - Height
     * @param u0 - Left UV coordinate
     * @param v0 - Top UV coordinate
     * @param u1 - Right UV coordinate
     * @param v1 - Bottom UV coordinate
     * @param r - Red (0–1)
     * @param g - Green (0–1)
     * @param b - Blue (0–1)
     * @param a - Alpha (0–1)
     * @param texture - WebGL texture to sample
     */
    public add_quad(
        x: number, y: number, w: number, h: number,
        u0: number, v0: number, u1: number, v1: number,
        r: number, g: number, b: number, a: number,
        texture: WebGLTexture
    ): void {
        // Flush if texture changed or buffer full
        if (this.current_texture !== null && this.current_texture !== texture) {
            this.flush()
        }
        this.current_texture = texture

        if (this.quad_count >= MAX_QUADS) {
            this.flush()
        }

        const base = this.quad_count * FLOATS_PER_QUAD
        const verts = this.vertices

        // Triangle 1: top-left, bottom-left, top-right
        // top-left
        verts[base + 0]  = x;     verts[base + 1]  = y
        verts[base + 2]  = u0;    verts[base + 3]  = v0
        verts[base + 4]  = r;     verts[base + 5]  = g;    verts[base + 6]  = b;    verts[base + 7]  = a

        // bottom-left
        verts[base + 8]  = x;     verts[base + 9]  = y + h
        verts[base + 10] = u0;    verts[base + 11] = v1
        verts[base + 12] = r;     verts[base + 13] = g;    verts[base + 14] = b;    verts[base + 15] = a

        // top-right
        verts[base + 16] = x + w; verts[base + 17] = y
        verts[base + 18] = u1;    verts[base + 19] = v0
        verts[base + 20] = r;     verts[base + 21] = g;    verts[base + 22] = b;    verts[base + 23] = a

        // Triangle 2: top-right, bottom-left, bottom-right
        // top-right
        verts[base + 24] = x + w; verts[base + 25] = y
        verts[base + 26] = u1;    verts[base + 27] = v0
        verts[base + 28] = r;     verts[base + 29] = g;    verts[base + 30] = b;    verts[base + 31] = a

        // bottom-left
        verts[base + 32] = x;     verts[base + 33] = y + h
        verts[base + 34] = u0;    verts[base + 35] = v1
        verts[base + 36] = r;     verts[base + 37] = g;    verts[base + 38] = b;    verts[base + 39] = a

        // bottom-right
        verts[base + 40] = x + w; verts[base + 41] = y + h
        verts[base + 42] = u1;    verts[base + 43] = v1
        verts[base + 44] = r;     verts[base + 45] = g;    verts[base + 46] = b;    verts[base + 47] = a

        this.quad_count++
    }

    /**
     * Pushes a rotated/scaled quad into the batch.
     * Used for draw_sprite_ext with rotation and scale.
     *
     * @param cx - Center X
     * @param cy - Center Y
     * @param w - Width before scaling
     * @param h - Height before scaling
     * @param ox - Origin X offset from center
     * @param oy - Origin Y offset from center
     * @param xscale - Horizontal scale
     * @param yscale - Vertical scale
     * @param angle_deg - Rotation in degrees (counter-clockwise)
     * @param u0 - Left UV
     * @param v0 - Top UV
     * @param u1 - Right UV
     * @param v1 - Bottom UV
     * @param r - Red (0–1)
     * @param g - Green (0–1)
     * @param b - Blue (0–1)
     * @param a - Alpha (0–1)
     * @param texture - WebGL texture
     */
    public add_quad_transformed(
        cx: number, cy: number,
        w: number, h: number,
        ox: number, oy: number,
        xscale: number, yscale: number,
        angle_deg: number,
        u0: number, v0: number, u1: number, v1: number,
        r: number, g: number, b: number, a: number,
        texture: WebGLTexture
    ): void {
        if (this.current_texture !== null && this.current_texture !== texture) {
            this.flush()
        }
        this.current_texture = texture

        if (this.quad_count >= MAX_QUADS) {
            this.flush()
        }

        const rad = -angle_deg * (Math.PI / 180)
        const cos_a = Math.cos(rad)
        const sin_a = Math.sin(rad)

        // Local corners relative to origin (before rotation)
        const hw = w * xscale
        const hh = h * yscale
        const lx = -ox * xscale
        const ty = -oy * yscale
        const rx = lx + hw
        const by = ty + hh

        // Rotate each corner and translate to world position
        const transform = (lx: number, ly: number): [number, number] => {
            return [
                cx + lx * cos_a - ly * sin_a,
                cy + lx * sin_a + ly * cos_a
            ]
        }

        const [tl_x, tl_y] = transform(lx, ty)
        const [tr_x, tr_y] = transform(rx, ty)
        const [bl_x, bl_y] = transform(lx, by)
        const [br_x, br_y] = transform(rx, by)

        const base = this.quad_count * FLOATS_PER_QUAD
        const verts = this.vertices

        const write = (off: number, px: number, py: number, u: number, v: number) => {
            verts[off + 0] = px;  verts[off + 1] = py
            verts[off + 2] = u;   verts[off + 3] = v
            verts[off + 4] = r;   verts[off + 5] = g;   verts[off + 6] = b;   verts[off + 7] = a
        }

        // Triangle 1: TL, BL, TR
        write(base + 0,  tl_x, tl_y, u0, v0)
        write(base + 8,  bl_x, bl_y, u0, v1)
        write(base + 16, tr_x, tr_y, u1, v0)
        // Triangle 2: TR, BL, BR
        write(base + 24, tr_x, tr_y, u1, v0)
        write(base + 32, bl_x, bl_y, u0, v1)
        write(base + 40, br_x, br_y, u1, v1)

        this.quad_count++
    }

    /**
     * Flushes accumulated quads to the GPU with a single draw call.
     * Resets the batch state after drawing.
     */
    public flush(): void {
        if (this.quad_count === 0) return

        const gl = this.gl
        gl.bindVertexArray(this.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0,
            this.vertices.subarray(0, this.quad_count * FLOATS_PER_QUAD))

        if (this.current_texture) {
            gl.bindTexture(gl.TEXTURE_2D, this.current_texture)
        }

        gl.drawArrays(gl.TRIANGLES, 0, this.quad_count * VERTS_PER_QUAD)

        gl.bindVertexArray(null)
        this.quad_count = 0
        this.current_texture = null
    }

    /**
     * Frees the VAO and VBO GPU resources.
     */
    public destroy(): void {
        this.gl.deleteVertexArray(this.vao)
        this.gl.deleteBuffer(this.vbo)
    }
}
