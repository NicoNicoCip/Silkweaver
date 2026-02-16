/**
 * 3D model loader — loads OBJ files into d3d models.
 *
 * Supports Wavefront OBJ format (vertices, normals, texture coordinates,
 * triangulated faces).  Does not support materials (MTL files).
 *
 * Usage:
 *   const model_id = model_load_obj(obj_source_string)
 *   d3d_model_draw(model_id, x, y, z)
 *
 * glTF loading is intentionally deferred — OBJ covers the common simple-model
 * use case and has no external dependencies.
 */

import { d3d_model_create, d3d_model_primitive_begin, d3d_model_primitive_end, pr_trianglelist, _get_model_raw } from './model.js'

// =========================================================================
// OBJ parser
// =========================================================================

interface obj_data {
    positions: number[][]   // [x, y, z]
    normals:   number[][]   // [nx, ny, nz]
    uvs:       number[][]   // [u, v]
    faces:     number[][]   // Per-vertex: [pos_idx, uv_idx, nrm_idx] (1-based, 0 = absent)
}

function _parse_obj(src: string): obj_data {
    const positions: number[][] = []
    const normals:   number[][] = []
    const uvs:       number[][] = []
    const faces:     number[][] = []

    for (const raw_line of src.split('\n')) {
        const line = raw_line.trim()
        if (!line || line.startsWith('#')) continue

        const parts = line.split(/\s+/)
        switch (parts[0]) {
            case 'v':
                positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])])
                break
            case 'vn':
                normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])])
                break
            case 'vt':
                uvs.push([parseFloat(parts[1]), parseFloat(parts[2] ?? '0')])
                break
            case 'f': {
                // Fan-triangulate polygon face (handles quads and n-gons)
                const verts = parts.slice(1).map(tok => {
                    const segs = tok.split('/')
                    return [
                        parseInt(segs[0] ?? '0') || 0,
                        parseInt(segs[1] ?? '0') || 0,
                        parseInt(segs[2] ?? '0') || 0,
                    ]
                })
                for (let i = 1; i < verts.length - 1; i++) {
                    faces.push(verts[0], verts[i], verts[i + 1])
                }
                break
            }
        }
    }
    return { positions, normals, uvs, faces }
}

// =========================================================================
// Public API
// =========================================================================

/**
 * Creates a d3d model from an OBJ source string.
 * @param obj_src - Contents of the .obj file
 * @returns Model ID
 */
export function model_load_obj(obj_src: string): number {
    const data     = _parse_obj(obj_src)
    const model_id = d3d_model_create()

    d3d_model_primitive_begin(model_id, pr_trianglelist)
    const m = _get_model_raw(model_id)
    if (!m) {
        d3d_model_primitive_end(model_id)
        return model_id
    }

    for (const face_vert of data.faces) {
        const [pi, ui, ni] = face_vert
        const pos = pi > 0 ? data.positions[pi - 1] : [0, 0, 0]
        const nrm = ni > 0 ? data.normals[ni - 1]   : [0, 0, 1]
        const uv  = ui > 0 ? data.uvs[ui - 1]        : [0, 0]
        m.build_verts.push(
            pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0,
            nrm[0] ?? 0, nrm[1] ?? 0, nrm[2] ?? 1,
            uv[0]  ?? 0, 1 - (uv[1] ?? 0),  // Flip V: OBJ bottom-left → WebGL top-left
        )
    }

    d3d_model_primitive_end(model_id)
    return model_id
}

/**
 * Fetches an OBJ file from a URL and returns a model ID.
 * @param url - URL of the .obj file
 * @returns Promise resolving to model ID, or -1 on failure
 */
export async function model_load_obj_url(url: string): Promise<number> {
    try {
        const resp = await fetch(url)
        if (!resp.ok) return -1
        const src = await resp.text()
        return model_load_obj(src)
    } catch {
        return -1
    }
}
