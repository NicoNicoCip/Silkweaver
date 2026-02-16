/**
 * Shader compilation and program linking utilities for WebGL 2.
 */

/** GLSL vertex shader source for the default 2D sprite/shape renderer. */
export const DEFAULT_VERTEX_SHADER = /*glsl*/`#version 300 es
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
}`;

/** GLSL fragment shader source for the default 2D sprite/shape renderer. */
export const DEFAULT_FRAGMENT_SHADER = /*glsl*/`#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec4 v_color;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    fragColor = texture(u_texture, v_texcoord) * v_color;
}`;

/**
 * Compiles a single GLSL shader of the given type.
 * @param gl - WebGL 2 context
 * @param type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param source - GLSL source string
 * @returns Compiled WebGLShader
 */
export function compile_shader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('Failed to create shader object')
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error(`Shader compile error: ${info}`)
    }
    return shader
}

/**
 * Links a vertex and fragment shader into a WebGL program.
 * @param gl - WebGL 2 context
 * @param vs_source - Vertex shader GLSL source
 * @param fs_source - Fragment shader GLSL source
 * @returns Linked WebGLProgram
 */
export function create_program(gl: WebGL2RenderingContext, vs_source: string, fs_source: string): WebGLProgram {
    const vs = compile_shader(gl, gl.VERTEX_SHADER, vs_source)
    const fs = compile_shader(gl, gl.FRAGMENT_SHADER, fs_source)

    const program = gl.createProgram()
    if (!program) throw new Error('Failed to create shader program')

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    // Shaders are now part of the program; they can be deleted
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        throw new Error(`Program link error: ${info}`)
    }
    return program
}

/**
 * Represents a compiled user shader with cached uniform locations.
 */
export class shader_program {
    public readonly program: WebGLProgram        // Underlying WebGL program
    private gl: WebGL2RenderingContext
    private uniform_cache: Map<string, WebGLUniformLocation | null> = new Map()

    constructor(gl: WebGL2RenderingContext, vs_source: string, fs_source: string) {
        this.gl = gl
        this.program = create_program(gl, vs_source, fs_source)
    }

    /**
     * Gets and caches a uniform location by name.
     * @param name - Uniform variable name in GLSL
     * @returns WebGLUniformLocation or null if not found
     */
    public get_uniform(name: string): WebGLUniformLocation | null {
        if (!this.uniform_cache.has(name)) {
            this.uniform_cache.set(name, this.gl.getUniformLocation(this.program, name))
        }
        return this.uniform_cache.get(name)!
    }

    /**
     * Frees the shader program's GPU resources.
     */
    public destroy(): void {
        this.gl.deleteProgram(this.program)
        this.uniform_cache.clear()
    }
}
