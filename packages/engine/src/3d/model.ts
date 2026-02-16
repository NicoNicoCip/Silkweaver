/**
 * 3D model system — vertex buffers for WebGL 2.
 *
 * Mirrors the GMS d3d_model_* API:
 *   d3d_model_create, d3d_model_destroy, d3d_model_draw
 *   d3d_model_primitive_begin, d3d_model_primitive_end
 *   d3d_model_vertex, d3d_model_vertex_normal, d3d_model_vertex_texture
 *   d3d_model_block, d3d_model_cylinder, d3d_model_sphere, d3d_model_cone
 *
 * Vertex format: [x, y, z, nx, ny, nz, u, v] (32 bytes per vertex)
 * Primitive types match WebGL draw modes.
 */

import { renderer } from '../drawing/renderer.js'
import { mat4_identity, d3d_transform_get, type mat4 } from './transform_3d.js'

// =========================================================================
// Primitive type constants
// =========================================================================

export const pr_pointlist    = 0   // gl.POINTS
export const pr_linelist     = 1   // gl.LINES
export const pr_linestrip    = 2   // gl.LINE_STRIP
export const pr_trianglelist = 4   // gl.TRIANGLES
export const pr_trianglestrip = 5  // gl.TRIANGLE_STRIP
export const pr_trianglefan  = 6   // gl.TRIANGLE_FAN

const _GL_MODES: Record<number, number> = {
    0: 0,   // POINTS
    1: 1,   // LINES
    2: 3,   // LINE_STRIP
    4: 4,   // TRIANGLES
    5: 5,   // TRIANGLE_STRIP
    6: 6,   // TRIANGLE_FAN
}

// Bytes per vertex: xyz(12) + normal(12) + uv(8) = 32
const VERTEX_STRIDE = 32
const FLOATS_PER_VERTEX = 8

// =========================================================================
// Model internals
// =========================================================================

interface model_mesh {
    primitive:  number          // pr_* constant
    vertices:   Float32Array    // Interleaved [x,y,z, nx,ny,nz, u,v, ...]
    vbo:        WebGLBuffer | null
    dirty:      boolean         // VBO needs re-upload
}

interface model_def {
    meshes:         model_mesh[]
    // Build state (between primitive_begin / primitive_end)
    building:       boolean
    build_prim:     number
    build_verts:    number[]    // Flat interleaved floats
}

const _models: Map<number, model_def> = new Map()
let _next_model_id = 1

// =========================================================================
// Default normal/uv
// =========================================================================

let _build_nx = 0, _build_ny = 0, _build_nz = 1
let _build_u  = 0, _build_v  = 0

// =========================================================================
// Public GMS-style API — model management
// =========================================================================

/** Returns the raw model state for internal use by model_loader.ts. */
export function _get_model_raw(model_id: number): model_def | undefined {
    return _models.get(model_id)
}

/** Creates a new empty 3D model and returns its ID. */
export function d3d_model_create(): number {
    const id = _next_model_id++
    _models.set(id, { meshes: [], building: false, build_prim: pr_trianglelist, build_verts: [] })
    return id
}

/** Destroys a model and frees its GPU resources. */
export function d3d_model_destroy(model_id: number): void {
    const m = _models.get(model_id)
    if (!m) return
    const gl = renderer.get_gl()
    for (const mesh of m.meshes) {
        if (mesh.vbo) gl.deleteBuffer(mesh.vbo)
    }
    _models.delete(model_id)
}

/** Returns true if the model ID is valid. */
export function d3d_model_exists(model_id: number): boolean {
    return _models.has(model_id)
}

/** Clears all meshes from a model. */
export function d3d_model_clear(model_id: number): void {
    const m = _models.get(model_id)
    if (!m) return
    const gl = renderer.get_gl()
    for (const mesh of m.meshes) {
        if (mesh.vbo) gl.deleteBuffer(mesh.vbo)
    }
    m.meshes = []
}

// =========================================================================
// Primitive building API
// =========================================================================

/**
 * Begins recording vertices for a primitive.
 * @param model_id - Model ID
 * @param kind - pr_* primitive type
 */
export function d3d_model_primitive_begin(model_id: number, kind: number): void {
    const m = _models.get(model_id)
    if (!m || m.building) return
    m.building     = true
    m.build_prim   = kind
    m.build_verts  = []
    _build_nx = 0; _build_ny = 0; _build_nz = 1
    _build_u  = 0; _build_v  = 0
}

/**
 * Finishes recording vertices and adds the mesh to the model.
 * @param model_id - Model ID
 */
export function d3d_model_primitive_end(model_id: number): void {
    const m = _models.get(model_id)
    if (!m || !m.building) return
    m.building = false
    if (m.build_verts.length === 0) return

    m.meshes.push({
        primitive: m.build_prim,
        vertices:  new Float32Array(m.build_verts),
        vbo:       null,
        dirty:     true,
    })
    m.build_verts = []
}

/**
 * Adds a vertex at (x, y, z) using the current normal and UV.
 */
export function d3d_model_vertex(model_id: number, x: number, y: number, z: number): void {
    const m = _models.get(model_id)
    if (!m || !m.building) return
    m.build_verts.push(x, y, z, _build_nx, _build_ny, _build_nz, _build_u, _build_v)
}

/**
 * Adds a vertex with an explicit normal.
 */
export function d3d_model_vertex_normal(model_id: number, x: number, y: number, z: number, nx: number, ny: number, nz: number): void {
    const m = _models.get(model_id)
    if (!m || !m.building) return
    m.build_verts.push(x, y, z, nx, ny, nz, _build_u, _build_v)
}

/**
 * Adds a vertex with UV texture coordinates and explicit normal.
 */
export function d3d_model_vertex_texture(model_id: number, x: number, y: number, z: number, u: number, v: number): void {
    const m = _models.get(model_id)
    if (!m || !m.building) return
    m.build_verts.push(x, y, z, _build_nx, _build_ny, _build_nz, u, v)
}

/**
 * Sets the normal to use for subsequent vertices.
 */
export function d3d_model_set_normal(nx: number, ny: number, nz: number): void {
    _build_nx = nx; _build_ny = ny; _build_nz = nz
}

/**
 * Sets the UV to use for subsequent vertices.
 */
export function d3d_model_set_uv(u: number, v: number): void {
    _build_u = u; _build_v = v
}

// =========================================================================
// Primitive solid helpers
// =========================================================================

/** Adds a box (cuboid) mesh to the model. */
export function d3d_model_block(model_id: number, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, hrepeat: number = 1, vrepeat: number = 1): void {
    d3d_model_primitive_begin(model_id, pr_trianglelist)
    const m = _models.get(model_id)
    if (!m) return
    _add_box_verts(m, x1, y1, z1, x2, y2, z2, hrepeat, vrepeat)
    d3d_model_primitive_end(model_id)
}

function _add_box_verts(m: model_def, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, hr: number, vr: number): void {
    const faces: [number, number, number, number, number, number, number, number, number][] = [
        // Front  (z2): normal 0,0,1
        [x1,y1,z2, x2,y1,z2, x2,y2,z2],
        [x1,y1,z2, x2,y2,z2, x1,y2,z2],
        // Back   (z1): normal 0,0,-1
        [x2,y1,z1, x1,y1,z1, x1,y2,z1],
        [x2,y1,z1, x1,y2,z1, x2,y2,z1],
        // Left   (x1): normal -1,0,0
        [x1,y1,z1, x1,y1,z2, x1,y2,z2],
        [x1,y1,z1, x1,y2,z2, x1,y2,z1],
        // Right  (x2): normal 1,0,0
        [x2,y1,z2, x2,y1,z1, x2,y2,z1],
        [x2,y1,z2, x2,y2,z1, x2,y2,z2],
        // Bottom (y1): normal 0,-1,0
        [x1,y1,z1, x2,y1,z1, x2,y1,z2],
        [x1,y1,z1, x2,y1,z2, x1,y1,z2],
        // Top    (y2): normal 0,1,0
        [x1,y2,z2, x2,y2,z2, x2,y2,z1],
        [x1,y2,z2, x2,y2,z1, x1,y2,z1],
    ]
    const normals = [
        [0,0,1],[0,0,1], [0,0,-1],[0,0,-1],
        [-1,0,0],[-1,0,0], [1,0,0],[1,0,0],
        [0,-1,0],[0,-1,0], [0,1,0],[0,1,0],
    ]
    faces.forEach((tri, fi) => {
        const [nx, ny, nz] = normals[fi]
        for (let vi = 0; vi < 9; vi += 3) {
            m.build_verts.push(tri[vi], tri[vi+1], tri[vi+2], nx, ny, nz, 0, 0)
        }
    })
}

/**
 * Adds a sphere mesh.
 * @param model_id - Model ID
 * @param x, y, z - Centre position
 * @param r - Radius
 * @param hsteps - Horizontal subdivisions (≥3)
 * @param vsteps - Vertical subdivisions (≥2)
 */
export function d3d_model_sphere(model_id: number, x: number, y: number, z: number, r: number, hsteps: number = 12, vsteps: number = 6): void {
    d3d_model_primitive_begin(model_id, pr_trianglelist)
    const m = _models.get(model_id)
    if (!m) return

    for (let j = 0; j < vsteps; j++) {
        const theta1 = (j     / vsteps) * Math.PI
        const theta2 = ((j+1) / vsteps) * Math.PI
        for (let i = 0; i < hsteps; i++) {
            const phi1 = (i     / hsteps) * 2 * Math.PI
            const phi2 = ((i+1) / hsteps) * 2 * Math.PI

            const v = (p: number, t: number) => [
                x + r * Math.sin(t) * Math.cos(p),
                y + r * Math.cos(t),
                z + r * Math.sin(t) * Math.sin(p),
                Math.sin(t) * Math.cos(p),
                Math.cos(t),
                Math.sin(t) * Math.sin(p),
            ]
            const a = v(phi1, theta1), b = v(phi2, theta1)
            const c = v(phi2, theta2), d = v(phi1, theta2)

            if (j !== 0) { m.build_verts.push(...a, ...b, ...c) }
            if (j !== vsteps-1) { m.build_verts.push(...a, ...c, ...d) }
        }
    }
    d3d_model_primitive_end(model_id)
}

// =========================================================================
// Drawing
// =========================================================================

/**
 * Draws a model using the currently active shader and transform.
 * The caller is responsible for setting up a 3D shader with the
 * u_model, u_view, u_projection uniforms before calling this.
 * @param model_id - Model ID
 * @param x, y, z - World position offset
 */
export function d3d_model_draw(model_id: number, x: number = 0, y: number = 0, z: number = 0): void {
    const mod = _models.get(model_id)
    if (!mod) return
    const gl = renderer.get_gl()

    // Flush 2D batch before drawing 3D geometry
    renderer.flush_batch()

    for (const mesh of mod.meshes) {
        if (mesh.vertices.length === 0) continue

        // Upload VBO if dirty
        if (mesh.dirty || !mesh.vbo) {
            if (!mesh.vbo) mesh.vbo = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo)
            gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW)
            mesh.dirty = false
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo)

        // Attribute layout (matches vertex format):
        // location 0: position (vec3) — offset 0
        // location 1: normal   (vec3) — offset 12
        // location 2: uv       (vec2) — offset 24
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, VERTEX_STRIDE, 0)
        gl.enableVertexAttribArray(1)
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, VERTEX_STRIDE, 12)
        gl.enableVertexAttribArray(2)
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, VERTEX_STRIDE, 24)

        const gl_mode = _GL_MODES[mesh.primitive] ?? gl.TRIANGLES
        const vert_count = mesh.vertices.length / FLOATS_PER_VERTEX
        gl.drawArrays(gl_mode, 0, vert_count)
    }
}
