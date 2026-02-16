/**
 * Binary buffer system — ArrayBuffer-backed read/write buffers.
 *
 * Mirrors the GMS buffer API:
 *   buffer_create, buffer_delete, buffer_write, buffer_read,
 *   buffer_seek, buffer_tell, buffer_get_size, buffer_exists,
 *   buffer_get_surface (not applicable — omitted),
 *   buffer_base64_encode, buffer_base64_decode,
 *   buffer_md5, buffer_sha1 (omitted — no native WebCrypto sync API)
 *
 * Data types match GMS buffer_* type constants.
 * All writes grow the buffer automatically when needed.
 */

// =========================================================================
// Buffer type constants (mirrors GMS)
// =========================================================================

export const buffer_u8     = 0   // Unsigned 8-bit integer
export const buffer_s8     = 1   // Signed 8-bit integer
export const buffer_u16    = 2   // Unsigned 16-bit integer
export const buffer_s16    = 3   // Signed 16-bit integer
export const buffer_u32    = 4   // Unsigned 32-bit integer
export const buffer_s32    = 5   // Signed 32-bit integer
export const buffer_f32    = 6   // 32-bit float
export const buffer_f64    = 7   // 64-bit float (double)
export const buffer_bool   = 8   // Boolean (1 byte)
export const buffer_string = 9   // Null-terminated UTF-8 string
export const buffer_u64    = 10  // Unsigned 64-bit integer (BigInt)

// Buffer grow modes
export const buffer_fixed   = 0  // Fixed size — writes beyond end are dropped
export const buffer_grow    = 1  // Grows automatically when full
export const buffer_wrap    = 2  // Wraps write cursor to start when full
export const buffer_fast    = 3  // Alias for grow (same behaviour here)

// Seek modes
export const buffer_seek_start    = 0  // Seek relative to start
export const buffer_seek_relative = 1  // Seek relative to current position
export const buffer_seek_end      = 2  // Seek relative to end

// =========================================================================
// Buffer internals
// =========================================================================

/** Byte sizes for each buffer type (0 for variable-length types). */
const TYPE_SIZES: Record<number, number> = {
    [buffer_u8]:     1,
    [buffer_s8]:     1,
    [buffer_u16]:    2,
    [buffer_s16]:    2,
    [buffer_u32]:    4,
    [buffer_s32]:    4,
    [buffer_f32]:    4,
    [buffer_f64]:    8,
    [buffer_bool]:   1,
    [buffer_string]: 0,  // variable length
    [buffer_u64]:    8,
}

interface buf_state {
    data:      Uint8Array  // Raw backing store
    pos:       number      // Current read/write cursor
    size:      number      // Logical size (number of bytes written)
    mode:      number      // buffer_fixed | buffer_grow | buffer_wrap
    alignment: number      // Byte alignment (unused for now)
    view:      DataView    // DataView over data.buffer
}

const _buffers: Map<number, buf_state> = new Map()
let _next_buf_id = 1

function _make_buf(capacity: number, mode: number, alignment: number): buf_state {
    const data = new Uint8Array(capacity)
    return { data, pos: 0, size: 0, mode, alignment, view: new DataView(data.buffer) }
}

/** Ensures the buffer can hold `needed` more bytes, growing if allowed. */
function _ensure(buf: buf_state, needed: number): boolean {
    const required = buf.pos + needed
    if (required <= buf.data.length) return true
    if (buf.mode === buffer_fixed) return false
    if (buf.mode === buffer_wrap) return true  // wrap, no grow needed

    // Grow: double until large enough
    let new_cap = buf.data.length || 8
    while (new_cap < required) new_cap *= 2

    const new_data = new Uint8Array(new_cap)
    new_data.set(buf.data)
    buf.data = new_data
    buf.view = new DataView(new_data.buffer)
    return true
}

/** Advances cursor and updates logical size. */
function _advance(buf: buf_state, bytes: number): void {
    if (buf.mode === buffer_wrap && buf.data.length > 0) {
        buf.pos = (buf.pos + bytes) % buf.data.length
    } else {
        buf.pos += bytes
    }
    if (buf.pos > buf.size) buf.size = buf.pos
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a new buffer.
 * @param size - Initial capacity in bytes
 * @param mode - buffer_fixed | buffer_grow | buffer_wrap | buffer_fast
 * @param alignment - Byte alignment hint (1 = byte-aligned, 2 = 16-bit, etc.)
 * @returns Buffer ID
 */
export function buffer_create(size: number, mode: number = buffer_grow, alignment: number = 1): number {
    const id = _next_buf_id++
    _buffers.set(id, _make_buf(Math.max(size, 0), mode, alignment))
    return id
}

/**
 * Deletes a buffer and frees its memory.
 * @param buffer_id - Buffer ID
 */
export function buffer_delete(buffer_id: number): void {
    _buffers.delete(buffer_id)
}

/**
 * Returns true if the buffer ID is valid.
 * @param buffer_id - Buffer ID
 */
export function buffer_exists(buffer_id: number): boolean {
    return _buffers.has(buffer_id)
}

/**
 * Returns the allocated capacity of the buffer in bytes.
 * @param buffer_id - Buffer ID
 */
export function buffer_get_size(buffer_id: number): number {
    return _buffers.get(buffer_id)?.data.length ?? 0
}

/**
 * Returns the number of bytes written to the buffer.
 * @param buffer_id - Buffer ID
 */
export function buffer_tell(buffer_id: number): number {
    return _buffers.get(buffer_id)?.pos ?? 0
}

/**
 * Moves the read/write cursor.
 * @param buffer_id - Buffer ID
 * @param base - buffer_seek_start | buffer_seek_relative | buffer_seek_end
 * @param offset - Byte offset from base
 */
export function buffer_seek(buffer_id: number, base: number, offset: number): void {
    const buf = _buffers.get(buffer_id)
    if (!buf) return
    let new_pos: number
    switch (base) {
        case buffer_seek_start:    new_pos = offset;              break
        case buffer_seek_relative: new_pos = buf.pos + offset;    break
        case buffer_seek_end:      new_pos = buf.size + offset;   break
        default:                   new_pos = offset
    }
    buf.pos = Math.max(0, new_pos)
}

/**
 * Writes a value of the given type at the current cursor position.
 * @param buffer_id - Buffer ID
 * @param type - buffer_u8 | buffer_s8 | ... | buffer_string
 * @param value - Value to write
 */
export function buffer_write(buffer_id: number, type: number, value: number | boolean | string | bigint): void {
    const buf = _buffers.get(buffer_id)
    if (!buf) return

    if (type === buffer_string) {
        const str   = String(value)
        const bytes = new TextEncoder().encode(str)
        if (!_ensure(buf, bytes.length + 1)) return
        buf.data.set(bytes, buf.pos)
        buf.data[buf.pos + bytes.length] = 0  // null terminator
        _advance(buf, bytes.length + 1)
        return
    }

    const sz = TYPE_SIZES[type] ?? 1
    if (!_ensure(buf, sz)) return
    const p = buf.pos

    switch (type) {
        case buffer_u8:   buf.view.setUint8(p,   Number(value));         break
        case buffer_s8:   buf.view.setInt8(p,    Number(value));         break
        case buffer_u16:  buf.view.setUint16(p,  Number(value), true);   break
        case buffer_s16:  buf.view.setInt16(p,   Number(value), true);   break
        case buffer_u32:  buf.view.setUint32(p,  Number(value), true);   break
        case buffer_s32:  buf.view.setInt32(p,   Number(value), true);   break
        case buffer_f32:  buf.view.setFloat32(p, Number(value), true);   break
        case buffer_f64:  buf.view.setFloat64(p, Number(value), true);   break
        case buffer_bool: buf.view.setUint8(p,   value ? 1 : 0);         break
        case buffer_u64:  buf.view.setBigUint64(p, BigInt(value), true); break
    }
    _advance(buf, sz)
}

/**
 * Reads a value of the given type from the current cursor position.
 * @param buffer_id - Buffer ID
 * @param type - Data type constant
 * @returns The read value, or 0 / false / '' on error
 */
export function buffer_read(buffer_id: number, type: number): number | boolean | string | bigint {
    const buf = _buffers.get(buffer_id)
    if (!buf) return 0

    if (type === buffer_string) {
        let end = buf.pos
        while (end < buf.data.length && buf.data[end] !== 0) end++
        const str = new TextDecoder().decode(buf.data.slice(buf.pos, end))
        _advance(buf, end - buf.pos + 1)  // skip null terminator
        return str
    }

    const sz = TYPE_SIZES[type] ?? 1
    if (buf.pos + sz > buf.data.length) return 0
    const p = buf.pos
    let result: number | boolean | bigint = 0

    switch (type) {
        case buffer_u8:   result = buf.view.getUint8(p);             break
        case buffer_s8:   result = buf.view.getInt8(p);              break
        case buffer_u16:  result = buf.view.getUint16(p, true);      break
        case buffer_s16:  result = buf.view.getInt16(p, true);       break
        case buffer_u32:  result = buf.view.getUint32(p, true);      break
        case buffer_s32:  result = buf.view.getInt32(p, true);       break
        case buffer_f32:  result = buf.view.getFloat32(p, true);     break
        case buffer_f64:  result = buf.view.getFloat64(p, true);     break
        case buffer_bool: result = buf.view.getUint8(p) !== 0;       break
        case buffer_u64:  result = buf.view.getBigUint64(p, true);   break
    }
    _advance(buf, sz)
    return result
}

/**
 * Fills a region of the buffer with a repeating byte value.
 * @param buffer_id - Buffer ID
 * @param offset - Start offset in bytes (from buffer start)
 * @param size - Number of bytes to fill
 * @param value - Byte value (0–255)
 */
export function buffer_fill(buffer_id: number, offset: number, size: number, value: number): void {
    const buf = _buffers.get(buffer_id)
    if (!buf) return
    const end = Math.min(offset + size, buf.data.length)
    buf.data.fill(value & 0xFF, offset, end)
}

/**
 * Copies data from one buffer to another.
 * @param src_id - Source buffer ID
 * @param src_offset - Byte offset in source
 * @param dst_id - Destination buffer ID
 * @param dst_offset - Byte offset in destination
 * @param size - Number of bytes to copy
 */
export function buffer_copy(src_id: number, src_offset: number, dst_id: number, dst_offset: number, size: number): void {
    const src = _buffers.get(src_id)
    const dst = _buffers.get(dst_id)
    if (!src || !dst) return
    const src_end = Math.min(src_offset + size, src.data.length)
    const chunk   = src.data.slice(src_offset, src_end)
    // Ensure destination has space
    const old_pos = dst.pos
    dst.pos = dst_offset
    if (!_ensure(dst, chunk.length)) { dst.pos = old_pos; return }
    dst.data.set(chunk, dst_offset)
    dst.pos = old_pos
    if (dst_offset + chunk.length > dst.size) dst.size = dst_offset + chunk.length
}

/**
 * Returns a Uint8Array view of the buffer's raw bytes (read-only snapshot).
 * @param buffer_id - Buffer ID
 */
export function buffer_get_bytes(buffer_id: number): Uint8Array {
    const buf = _buffers.get(buffer_id)
    if (!buf) return new Uint8Array(0)
    return buf.data.slice(0, buf.size)
}

/**
 * Creates a buffer from a Uint8Array (e.g. from a network message).
 * @param bytes - Raw bytes
 * @returns Buffer ID
 */
export function buffer_from_bytes(bytes: Uint8Array): number {
    const id  = _next_buf_id++
    const data = new Uint8Array(bytes.length)
    data.set(bytes)
    _buffers.set(id, {
        data,
        pos:       0,
        size:      bytes.length,
        mode:      buffer_grow,
        alignment: 1,
        view:      new DataView(data.buffer),
    })
    return id
}

/**
 * Encodes the buffer contents as a Base64 string.
 * @param buffer_id - Buffer ID
 * @param offset - Start offset (default 0)
 * @param size - Number of bytes (default: full buffer)
 */
export function buffer_base64_encode(buffer_id: number, offset: number = 0, size: number = -1): string {
    const buf = _buffers.get(buffer_id)
    if (!buf) return ''
    const end   = size < 0 ? buf.size : Math.min(offset + size, buf.size)
    const chunk = buf.data.slice(offset, end)
    let binary  = ''
    for (let i = 0; i < chunk.length; i++) binary += String.fromCharCode(chunk[i])
    return btoa(binary)
}

/**
 * Creates a buffer from a Base64-encoded string.
 * @param base64 - Base64 string
 * @returns Buffer ID
 */
export function buffer_base64_decode(base64: string): number {
    try {
        const binary = atob(base64)
        const bytes  = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return buffer_from_bytes(bytes)
    } catch {
        return buffer_create(0, buffer_grow, 1)
    }
}
