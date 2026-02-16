/**
 * User-facing shader system.
 *
 * Wraps shader_program to give a GMS-compatible API:
 *   shader_set()        — activates a user shader
 *   shader_reset()      — returns to the default shader
 *   shader_get_uniform  — returns a uniform handle (WebGLUniformLocation)
 *   shader_set_uniform_f/i/mat — upload uniform values
 *
 * The active shader is set on the renderer's GL context.
 * The renderer's batch must be flushed before switching programs.
 */

import { shader_program } from './shader.js'
import { renderer } from './renderer.js'

// =========================================================================
// Shader registry
// =========================================================================

/**
 * A user-defined shader asset.
 * Create with new user_shader(vs_source, fs_source).
 */
export class user_shader {
    public readonly internal: shader_program  // Compiled program

    /**
     * @param vs_source - Vertex shader GLSL source (#version 300 es required)
     * @param fs_source - Fragment shader GLSL source
     */
    constructor(vs_source: string, fs_source: string) {
        this.internal = new shader_program(renderer.get_gl(), vs_source, fs_source)
    }

    /**
     * Frees the shader's GPU resources.
     * Do not use the shader after calling destroy().
     */
    public destroy(): void {
        this.internal.destroy()
    }
}

// =========================================================================
// Active shader state
// =========================================================================

let _active_shader: user_shader | null = null  // Currently bound user shader (null = default)

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Activates a user shader program for subsequent draw calls.
 * The renderer's batch is flushed before switching.
 * @param shader - The user_shader to activate
 */
export function shader_set(shader: user_shader): void {
    renderer.flush_batch()
    _active_shader = shader
    renderer.get_gl().useProgram(shader.internal.program)
    // Re-upload the projection matrix to the new program's uniform
    renderer.upload_projection_to_program(shader.internal.program)
}

/**
 * Resets to the default engine shader program.
 * The renderer's batch is flushed before switching.
 */
export function shader_reset(): void {
    if (_active_shader === null) return
    renderer.flush_batch()
    _active_shader = null
    renderer.restore_default_program()
}

/**
 * Returns the currently active user shader, or null if using the default.
 */
export function shader_current(): user_shader | null {
    return _active_shader
}

/**
 * Returns a uniform handle for use with shader_set_uniform_*.
 * @param shader - The shader containing the uniform
 * @param name - GLSL uniform variable name
 * @returns WebGLUniformLocation or null if not found
 */
export function shader_get_uniform(shader: user_shader, name: string): WebGLUniformLocation | null {
    return shader.internal.get_uniform(name)
}

/**
 * Sets a float uniform value (1 component).
 * @param location - Uniform location from shader_get_uniform
 * @param val - Float value
 */
export function shader_set_uniform_f(location: WebGLUniformLocation, val: number): void {
    renderer.get_gl().uniform1f(location, val)
}

/**
 * Sets a vec2 float uniform.
 * @param location - Uniform location
 * @param x - X component
 * @param y - Y component
 */
export function shader_set_uniform_f2(location: WebGLUniformLocation, x: number, y: number): void {
    renderer.get_gl().uniform2f(location, x, y)
}

/**
 * Sets a vec3 float uniform.
 * @param location - Uniform location
 * @param x - X component
 * @param y - Y component
 * @param z - Z component
 */
export function shader_set_uniform_f3(location: WebGLUniformLocation, x: number, y: number, z: number): void {
    renderer.get_gl().uniform3f(location, x, y, z)
}

/**
 * Sets a vec4 float uniform.
 * @param location - Uniform location
 * @param x - X
 * @param y - Y
 * @param z - Z
 * @param w - W
 */
export function shader_set_uniform_f4(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
    renderer.get_gl().uniform4f(location, x, y, z, w)
}

/**
 * Sets an integer uniform value (1 component).
 * @param location - Uniform location
 * @param val - Integer value
 */
export function shader_set_uniform_i(location: WebGLUniformLocation, val: number): void {
    renderer.get_gl().uniform1i(location, val)
}

/**
 * Sets an ivec2 integer uniform.
 * @param location - Uniform location
 * @param x - X component
 * @param y - Y component
 */
export function shader_set_uniform_i2(location: WebGLUniformLocation, x: number, y: number): void {
    renderer.get_gl().uniform2i(location, x, y)
}

/**
 * Sets a float array uniform.
 * @param location - Uniform location
 * @param values - Float array
 */
export function shader_set_uniform_f_array(location: WebGLUniformLocation, values: Float32Array | number[]): void {
    renderer.get_gl().uniform1fv(location, values)
}

/**
 * Sets a mat4 uniform from a 16-element column-major Float32Array.
 * @param location - Uniform location
 * @param matrix - 16-element column-major matrix
 * @param transpose - Whether to transpose (default false)
 */
export function shader_set_uniform_matrix(location: WebGLUniformLocation, matrix: Float32Array, transpose: boolean = false): void {
    renderer.get_gl().uniformMatrix4fv(location, transpose, matrix)
}
