# WebGL 2 Tutorial for Phase 3

Reference guide for implementing the Silkweaver rendering system.

## 1. Mental Model

WebGL 2 is a **state machine** that talks to the GPU. You:
1. Upload data (vertices, textures) to GPU memory
2. Write small GPU programs (shaders) that process that data
3. Issue draw calls that tell the GPU to run the shaders

Everything in Phase 3 — sprites, shapes, text — ultimately reduces to **textured or colored triangles** sent to the GPU.

## 2. Getting a WebGL 2 Context

```typescript
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL 2 not supported');
```

The `gl` object is the entire API surface. Every WebGL call goes through it.

## 3. The Rendering Pipeline

```
Vertex Data (CPU)
    │
    ▼
Vertex Shader (GPU)  ← runs once per vertex, outputs position
    │
    ▼
Rasterization        ← GPU turns triangles into fragments (pixels)
    │
    ▼
Fragment Shader (GPU) ← runs once per pixel, outputs color
    │
    ▼
Framebuffer          ← the final image (screen or a surface/render target)
```

Both shaders must be written. Here is the simplest pair:

### Vertex Shader (GLSL 300 es)
```glsl
#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texcoord;
layout(location = 2) in vec4 a_color;

uniform mat4 u_projection;

out vec2 v_texcoord;
out vec4 v_color;

void main() {
    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
    v_color = a_color;
}
```

### Fragment Shader
```glsl
#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec4 v_color;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    fragColor = texture(u_texture, v_texcoord) * v_color;
}
```

Key differences from WebGL 1: `#version 300 es`, `in`/`out` instead of `attribute`/`varying`, explicit `out vec4 fragColor` instead of `gl_FragColor`.

## 4. Compiling Shaders

```typescript
function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
}
```

## 5. Vertex Array Objects (VAOs)

In WebGL 1, vertex attributes had to be rebound every frame. WebGL 2 has **VAOs** that remember the layout:

```typescript
// Create a VAO — stores the attribute layout
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// Create a buffer and upload vertex data
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// Vertex layout: [x, y, u, v, r, g, b, a] per vertex
const STRIDE = 8 * 4; // 8 floats x 4 bytes

// position (location 0): 2 floats at offset 0
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE, 0);

// texcoord (location 1): 2 floats at offset 8
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, 8);

// color (location 2): 4 floats at offset 16
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE, 16);

gl.bindVertexArray(null); // unbind
```

To draw, just `gl.bindVertexArray(vao)` and everything is set up.

## 6. Drawing a Sprite (Textured Quad)

A sprite is two triangles forming a rectangle:

```typescript
// A quad = 2 triangles = 6 vertices (or 4 vertices + index buffer)
//
//  0---1
//  | / |
//  2---3
//
// Triangle 1: 0, 2, 1
// Triangle 2: 1, 2, 3

function buildSpriteQuad(x: number, y: number, w: number, h: number): Float32Array {
    //          x,     y,     u,  v,   r, g, b, a
    return new Float32Array([
        x,     y,     0, 0,  1, 1, 1, 1,  // top-left
        x + w, y,     1, 0,  1, 1, 1, 1,  // top-right
        x,     y + h, 0, 1,  1, 1, 1, 1,  // bottom-left
        x + w, y,     1, 0,  1, 1, 1, 1,  // top-right
        x,     y + h, 0, 1,  1, 1, 1, 1,  // bottom-left
        x + w, y + h, 1, 1,  1, 1, 1, 1,  // bottom-right
    ]);
}
```

## 7. Loading Textures

```typescript
function loadTexture(gl: WebGL2RenderingContext, url: string): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const tex = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            // Pixel-art friendly settings (no blurring)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            resolve(tex);
        };
        img.onerror = reject;
        img.src = url;
    });
}
```

Use `NEAREST` for crisp pixel art, `LINEAR` for smooth scaling.

## 8. Projection Matrix (2D Orthographic)

For a 2D engine, map pixel coordinates to clip space (-1 to 1):

```typescript
function ortho(width: number, height: number): Float32Array {
    // Maps (0,0) at top-left, (width, height) at bottom-right
    return new Float32Array([
        2 / width,  0,           0, 0,
        0,         -2 / height,  0, 0,
        0,          0,           1, 0,
       -1,          1,           0, 1,
    ]);
}
```

Upload as a uniform:
```typescript
const loc = gl.getUniformLocation(program, 'u_projection');
gl.uniformMatrix4fv(loc, false, ortho(canvas.width, canvas.height));
```

## 9. The Draw Loop

```typescript
function render() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    // Upload quad data, bind texture, draw
    gl.bufferData(gl.ARRAY_BUFFER, spriteVertices, gl.DYNAMIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, myTexture);
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vertices = 1 quad

    gl.bindVertexArray(null);
}
```

## 10. Batch Rendering

Drawing one quad per draw call is slow. A **batch renderer** collects many quads into one big buffer and draws them all at once:

```typescript
class BatchRenderer {
    private vertices: Float32Array;
    private count: number = 0;
    private maxQuads: number = 8192;
    private currentTexture: WebGLTexture | null = null;

    constructor(gl: WebGL2RenderingContext) {
        // Pre-allocate buffer for maxQuads (6 verts x 8 floats each)
        this.vertices = new Float32Array(this.maxQuads * 6 * 8);
    }

    addQuad(x: number, y: number, w: number, h: number,
            u0: number, v0: number, u1: number, v1: number,
            r: number, g: number, b: number, a: number,
            texture: WebGLTexture) {

        // If texture changes, flush the current batch
        if (this.currentTexture && this.currentTexture !== texture) {
            this.flush();
        }
        this.currentTexture = texture;

        // Write 6 vertices (2 triangles) into the buffer
        const i = this.count * 6 * 8;
        // ... fill this.vertices[i..] with position/uv/color data
        this.count++;

        if (this.count >= this.maxQuads) this.flush();
    }

    flush() {
        if (this.count === 0) return;

        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0,
            this.vertices.subarray(0, this.count * 6 * 8));
        gl.drawArrays(gl.TRIANGLES, 0, this.count * 6);

        this.count = 0;
    }
}
```

This is what `batch-renderer.ts` should implement. Every `draw_sprite`, `draw_rectangle`, etc. pushes quads into the batch. At the end of the frame (or when the texture/shader changes), flush.

## 11. Shape Drawing (No Texture)

For `draw_rectangle`, `draw_circle`, etc., use a **1x1 white pixel texture**. Vertex colors then control appearance:

```typescript
// Create a 1x1 white texture at init
const whitePixel = gl.createTexture()!;
gl.bindTexture(gl.TEXTURE_2D, whitePixel);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
```

- `draw_rectangle(x1, y1, x2, y2, false)` pushes a colored quad using the white texture.
- For **outlines** (`outline = true`), draw 4 thin rectangles or use `gl.LINES`.
- For circles/ellipses, generate triangle fan vertices on the CPU and push to the batch.

## 12. Text Rendering

Render text to a 2D canvas, then upload as a texture:

```typescript
function renderTextToTexture(gl: WebGL2RenderingContext, text: string,
                              font: string, color: string): WebGLTexture {
    const measure = document.createElement('canvas');
    const ctx = measure.getContext('2d')!;
    ctx.font = font;
    const metrics = ctx.measureText(text);

    measure.width = Math.ceil(metrics.width);
    measure.height = Math.ceil(parseInt(font) * 1.4); // rough line height

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.fillText(text, 0, 0);

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, measure);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return tex;
}
```

Cache text textures and only regenerate when the string changes. A more advanced approach is a **font atlas** (pre-rendered glyph sheet).

## 13. Blend Modes & Alpha

```typescript
// Enable blending (required for transparency)
gl.enable(gl.BLEND);

// bm_normal — standard alpha blending
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// bm_add — additive (fire, glow effects)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

// bm_subtract
gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
```

Blend mode changes force a batch flush (cannot mix blend modes in one draw call).

## 14. Surfaces (Render Targets)

Surfaces use **framebuffer objects (FBOs)** (Phase 9, but useful to understand now):

```typescript
function createSurface(gl: WebGL2RenderingContext, w: number, h: number) {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    return { fbo, tex, w, h };
}

// surface_set_target  → gl.bindFramebuffer(gl.FRAMEBUFFER, surface.fbo)
// surface_reset_target → gl.bindFramebuffer(gl.FRAMEBUFFER, null)
```

## 15. Implementation Order for Phase 3

Based on the plan and how WebGL concepts build on each other:

1. **`renderer.ts`** — Canvas, WebGL 2 context, default shader, VAO, projection matrix. Get a colored triangle on screen.
2. **`texture-manager.ts`** — Texture loading + the 1x1 white pixel. Required before drawing anything.
3. **`batch-renderer.ts`** — Batched quad system. The workhorse everything else builds on.
4. **`draw-functions.ts`** — `draw_set_color`, `draw_set_alpha`, `draw_rectangle`, `draw_circle`, etc. Push primitives into the batch.
5. **`sprite.ts`** — Sprite data structure (frames, origin, dimensions) + `draw_sprite` / `draw_sprite_ext`.
6. **`font.ts`** — Text rendering via canvas-to-texture or glyph atlas. `draw_text`, `draw_set_font`, alignment.
7. **`blend-modes.ts`** — Wire up `draw_set_blend_mode` to flush the batch and change GL state.

## Key Takeaways

- **Everything is triangles.** Sprites are 2-triangle quads. Circles are triangle fans. Lines are thin quads.
- **Batch aggressively.** One draw call per sprite kills performance. Batch all quads sharing the same texture/shader/blend mode.
- **One shader program covers all of Phase 3.** Vertex shader applies the projection; fragment shader samples texture and multiplies by vertex color.
- **State changes (texture, blend mode, shader) force batch flushes.** Sort draws by texture when possible.
- **VAOs** save from re-specifying vertex layout every frame.
