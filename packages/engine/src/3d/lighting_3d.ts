/**
 * 3D lighting system.
 *
 * Mirrors the GMS d3d_light_* API.
 * Supports up to 8 directional and point lights, plus ambient light.
 *
 * Light data is uploaded as uniforms to 3D shader programs via
 * d3d_light_get_uniforms(), which returns a flat uniform block
 * for use with shader_set_uniform_*.
 */

// =========================================================================
// Light type constants
// =========================================================================

export const d3d_lighttype_directional = 0  // Infinite directional light
export const d3d_lighttype_point       = 1  // Point light with falloff

export const MAX_LIGHTS = 8

// =========================================================================
// Light state
// =========================================================================

interface light_def {
    enabled:   boolean
    type:      number      // d3d_lighttype_*
    // Directional: direction vector (normalised)
    // Point:       position
    x:         number
    y:         number
    z:         number
    // Color (0–1 per channel)
    r:         number
    g:         number
    b:         number
    // Point light falloff range
    range:     number
}

function _default_light(): light_def {
    return { enabled: false, type: d3d_lighttype_directional, x: 0, y: 0, z: -1, r: 1, g: 1, b: 1, range: 100 }
}

const _lights: light_def[] = Array.from({ length: MAX_LIGHTS }, _default_light)
let _ambient_r = 0.2
let _ambient_g = 0.2
let _ambient_b = 0.2

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Enables or disables a light slot.
 * @param light_index - Light index (0–7)
 * @param enabled - True to enable
 */
export function d3d_light_enable(light_index: number, enabled: boolean): void {
    const l = _lights[light_index]
    if (l) l.enabled = enabled
}

/**
 * Defines a directional light.
 * @param light_index - Light index (0–7)
 * @param dx - Direction X (world space)
 * @param dy - Direction Y
 * @param dz - Direction Z
 * @param col - BGR colour integer
 */
export function d3d_light_define_direction(light_index: number, dx: number, dy: number, dz: number, col: number): void {
    const l = _lights[light_index]
    if (!l) return
    const len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1
    l.type    = d3d_lighttype_directional
    l.x = dx / len; l.y = dy / len; l.z = dz / len
    l.r = (col & 0xFF)        / 255
    l.g = ((col >>  8) & 0xFF) / 255
    l.b = ((col >> 16) & 0xFF) / 255
    l.enabled = true
}

/**
 * Defines a point light.
 * @param light_index - Light index (0–7)
 * @param x - Position X
 * @param y - Position Y
 * @param z - Position Z
 * @param range - Falloff range in world units
 * @param col - BGR colour integer
 */
export function d3d_light_define_point(light_index: number, x: number, y: number, z: number, range: number, col: number): void {
    const l = _lights[light_index]
    if (!l) return
    l.type    = d3d_lighttype_point
    l.x = x; l.y = y; l.z = z
    l.range   = range
    l.r = (col & 0xFF)        / 255
    l.g = ((col >>  8) & 0xFF) / 255
    l.b = ((col >> 16) & 0xFF) / 255
    l.enabled = true
}

/**
 * Sets the ambient light colour.
 * @param col - BGR colour integer
 */
export function d3d_light_set_ambient(col: number): void {
    _ambient_r = (col & 0xFF)        / 255
    _ambient_g = ((col >>  8) & 0xFF) / 255
    _ambient_b = ((col >> 16) & 0xFF) / 255
}

/**
 * Returns a flat object of uniform values for uploading to a 3D shader.
 * The shader is expected to declare:
 *   uniform vec3  u_ambient;
 *   uniform int   u_light_count;
 *   uniform int   u_light_types[8];
 *   uniform vec3  u_light_pos[8];   // direction for directional lights
 *   uniform vec3  u_light_color[8];
 *   uniform float u_light_range[8];
 */
export function d3d_light_get_uniforms(): {
    ambient:     Float32Array
    count:       number
    types:       Int32Array
    positions:   Float32Array
    colors:      Float32Array
    ranges:      Float32Array
} {
    const enabled = _lights.filter(l => l.enabled)
    const count   = enabled.length
    const types   = new Int32Array(MAX_LIGHTS)
    const pos     = new Float32Array(MAX_LIGHTS * 3)
    const colors  = new Float32Array(MAX_LIGHTS * 3)
    const ranges  = new Float32Array(MAX_LIGHTS)

    enabled.forEach((l, i) => {
        types[i]         = l.type
        pos[i * 3]       = l.x
        pos[i * 3 + 1]   = l.y
        pos[i * 3 + 2]   = l.z
        colors[i * 3]    = l.r
        colors[i * 3 + 1] = l.g
        colors[i * 3 + 2] = l.b
        ranges[i]         = l.range
    })

    return {
        ambient:   new Float32Array([_ambient_r, _ambient_g, _ambient_b]),
        count,
        types,
        positions: pos,
        colors,
        ranges,
    }
}

/** Returns the raw light definition array for advanced use. */
export function d3d_light_get_all(): Readonly<light_def>[] {
    return _lights
}
