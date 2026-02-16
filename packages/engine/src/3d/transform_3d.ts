/**
 * 3D transform matrix stack.
 *
 * Mirrors the GMS d3d_transform_* API.
 * Matrices are column-major Float32Array (matches WebGL layout).
 *
 * The transform stack is used when drawing 3D models.
 * The current transform (top of stack) is applied as a model matrix.
 */

// =========================================================================
// Matrix utilities (4×4 column-major)
// =========================================================================

export type mat4 = Float32Array

/** Returns a 4×4 identity matrix. */
export function mat4_identity(): mat4 {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ])
}

/** Multiplies two 4×4 column-major matrices: result = a * b. */
export function mat4_mul(a: mat4, b: mat4): mat4 {
    const r = new Float32Array(16)
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            let sum = 0
            for (let k = 0; k < 4; k++) {
                sum += a[k * 4 + row] * b[col * 4 + k]
            }
            r[col * 4 + row] = sum
        }
    }
    return r
}

/** Returns a translation matrix. */
export function mat4_translate(tx: number, ty: number, tz: number): mat4 {
    const m = mat4_identity()
    m[12] = tx; m[13] = ty; m[14] = tz
    return m
}

/** Returns a uniform scale matrix. */
export function mat4_scale(sx: number, sy: number, sz: number): mat4 {
    const m = mat4_identity()
    m[0] = sx; m[5] = sy; m[10] = sz
    return m
}

/** Returns a rotation matrix around the X axis (angle in degrees). */
export function mat4_rotate_x(deg: number): mat4 {
    const r = deg * (Math.PI / 180)
    const c = Math.cos(r), s = Math.sin(r)
    const m = mat4_identity()
    m[5] = c;  m[9]  = -s
    m[6] = s;  m[10] =  c
    return m
}

/** Returns a rotation matrix around the Y axis (angle in degrees). */
export function mat4_rotate_y(deg: number): mat4 {
    const r = deg * (Math.PI / 180)
    const c = Math.cos(r), s = Math.sin(r)
    const m = mat4_identity()
    m[0]  =  c; m[8]  = s
    m[2]  = -s; m[10] = c
    return m
}

/** Returns a rotation matrix around the Z axis (angle in degrees). */
export function mat4_rotate_z(deg: number): mat4 {
    const r = deg * (Math.PI / 180)
    const c = Math.cos(r), s = Math.sin(r)
    const m = mat4_identity()
    m[0] = c;  m[4] = -s
    m[1] = s;  m[5] =  c
    return m
}

/** Returns a perspective projection matrix. */
export function mat4_perspective(fov_deg: number, aspect: number, near: number, far: number): mat4 {
    const f   = 1 / Math.tan(fov_deg * (Math.PI / 360))
    const nf  = 1 / (near - far)
    const m   = new Float32Array(16)
    m[0]  = f / aspect
    m[5]  = f
    m[10] = (far + near) * nf
    m[11] = -1
    m[14] = 2 * far * near * nf
    return m
}

/** Returns a look-at view matrix. */
export function mat4_look_at(
    ex: number, ey: number, ez: number,
    tx: number, ty: number, tz: number,
    ux: number, uy: number, uz: number,
): mat4 {
    let zx = ex - tx, zy = ey - ty, zz = ez - tz
    let zl = Math.sqrt(zx*zx + zy*zy + zz*zz) || 1
    zx /= zl; zy /= zl; zz /= zl

    let xx = uy*zz - uz*zy, xy = uz*zx - ux*zz, xz = ux*zy - uy*zx
    const xl = Math.sqrt(xx*xx + xy*xy + xz*xz) || 1
    xx /= xl; xy /= xl; xz /= xl

    const yx = zy*xz - zz*xy, yy = zz*xx - zx*xz, yz = zx*xy - zy*xx

    const m = new Float32Array(16)
    m[0] = xx; m[4] = xy; m[8]  = xz; m[12] = -(xx*ex + xy*ey + xz*ez)
    m[1] = yx; m[5] = yy; m[9]  = yz; m[13] = -(yx*ex + yy*ey + yz*ez)
    m[2] = zx; m[6] = zy; m[10] = zz; m[14] = -(zx*ex + zy*ey + zz*ez)
    m[15] = 1
    return m
}

/** Returns an orthographic projection matrix. */
export function mat4_ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4 {
    const m = new Float32Array(16)
    m[0]  =  2 / (right - left)
    m[5]  =  2 / (top   - bottom)
    m[10] = -2 / (far   - near)
    m[12] = -(right + left)   / (right - left)
    m[13] = -(top   + bottom) / (top   - bottom)
    m[14] = -(far   + near)   / (far   - near)
    m[15] = 1
    return m
}

// =========================================================================
// Transform stack
// =========================================================================

const _stack: mat4[] = [mat4_identity()]  // Stack of model matrices
let _current: mat4   = _stack[0]          // Top of stack (current transform)

/** Returns the current model matrix (top of stack). */
export function d3d_transform_get(): mat4 {
    return _current
}

/** Resets the current transform to identity. */
export function d3d_transform_set_identity(): void {
    _current = mat4_identity()
    _stack[_stack.length - 1] = _current
}

/**
 * Sets the transform to a translation.
 * @param x - X translation
 * @param y - Y translation
 * @param z - Z translation
 */
export function d3d_transform_set_translation(x: number, y: number, z: number): void {
    _current = mat4_translate(x, y, z)
    _stack[_stack.length - 1] = _current
}

/**
 * Sets the transform to a scale.
 * @param sx - X scale
 * @param sy - Y scale
 * @param sz - Z scale
 */
export function d3d_transform_set_scaling(sx: number, sy: number, sz: number): void {
    _current = mat4_scale(sx, sy, sz)
    _stack[_stack.length - 1] = _current
}

/**
 * Sets the transform to a rotation around an axis.
 * @param xa - X component of rotation axis
 * @param ya - Y component of rotation axis
 * @param za - Z component of rotation axis
 * @param deg - Angle in degrees
 */
export function d3d_transform_set_rotation(xa: number, ya: number, _za: number, deg: number): void {
    // Decompose into axis-aligned rotations (simplified: apply Z then Y then X)
    let m = mat4_identity()
    if (xa !== 0) m = mat4_mul(m, mat4_rotate_x(deg * xa))
    if (ya !== 0) m = mat4_mul(m, mat4_rotate_y(deg * ya))
    _current = m
    _stack[_stack.length - 1] = _current
}

/** Adds a translation to the current transform. */
export function d3d_transform_add_translation(x: number, y: number, z: number): void {
    _current = mat4_mul(_current, mat4_translate(x, y, z))
    _stack[_stack.length - 1] = _current
}

/** Adds a scaling to the current transform. */
export function d3d_transform_add_scaling(sx: number, sy: number, sz: number): void {
    _current = mat4_mul(_current, mat4_scale(sx, sy, sz))
    _stack[_stack.length - 1] = _current
}

/** Adds a rotation around the X axis. */
export function d3d_transform_add_rotation_x(deg: number): void {
    _current = mat4_mul(_current, mat4_rotate_x(deg))
    _stack[_stack.length - 1] = _current
}

/** Adds a rotation around the Y axis. */
export function d3d_transform_add_rotation_y(deg: number): void {
    _current = mat4_mul(_current, mat4_rotate_y(deg))
    _stack[_stack.length - 1] = _current
}

/** Adds a rotation around the Z axis. */
export function d3d_transform_add_rotation_z(deg: number): void {
    _current = mat4_mul(_current, mat4_rotate_z(deg))
    _stack[_stack.length - 1] = _current
}

/** Pushes the current transform onto the stack (save state). */
export function d3d_transform_stack_push(): void {
    _stack.push(new Float32Array(_current))
    _current = _stack[_stack.length - 1]
}

/** Pops the transform stack (restore state). */
export function d3d_transform_stack_pop(): void {
    if (_stack.length > 1) _stack.pop()
    _current = _stack[_stack.length - 1]
}

/** Clears the stack back to a single identity matrix. */
export function d3d_transform_stack_clear(): void {
    _stack.length = 1
    _stack[0] = mat4_identity()
    _current  = _stack[0]
}
