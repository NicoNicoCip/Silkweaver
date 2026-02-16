/**
 * Minimal ZIP archive builder (stored, no compression).
 *
 * Implements just enough of the ZIP specification (PKWARE APPNOTE) to
 * produce valid ZIP files that browsers and OS tools can extract.
 *
 * Format: Local file header + data for each entry, then central directory,
 * then end-of-central-directory record.
 *
 * No external dependencies — works in any modern browser.
 */

// =========================================================================
// ZIP internals
// =========================================================================

const ENCODER = new TextEncoder()

interface zip_entry {
    name:       string      // Path inside the ZIP (UTF-8)
    data:       Uint8Array  // File contents (empty for folder entries)
    is_folder:  boolean
    offset:     number      // Byte offset of local header in the archive
    crc32:      number
    size:       number
}

export interface zip_archive {
    entries: zip_entry[]
}

// =========================================================================
// CRC-32 (ISO 3309)
// =========================================================================

const _crc_table: Uint32Array = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
        let c = i
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
        t[i] = c
    }
    return t
})()

function _crc32(data: Uint8Array): number {
    let crc = 0xFFFFFFFF
    for (let i = 0; i < data.length; i++) {
        crc = _crc_table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
}

// =========================================================================
// Little-endian write helpers
// =========================================================================

function _u16(v: number, buf: Uint8Array, off: number): void {
    buf[off]     =  v        & 0xFF
    buf[off + 1] = (v >>  8) & 0xFF
}

function _u32(v: number, buf: Uint8Array, off: number): void {
    buf[off]     =  v         & 0xFF
    buf[off + 1] = (v >>   8) & 0xFF
    buf[off + 2] = (v >>  16) & 0xFF
    buf[off + 3] = (v >>  24) & 0xFF
}

// =========================================================================
// Public API
// =========================================================================

/** Creates a new empty ZIP archive. */
export function zip_create(): zip_archive {
    return { entries: [] }
}

/**
 * Adds a file to the archive.
 * @param zip - Archive
 * @param path - Path inside the ZIP (use forward slashes)
 * @param content - File content as string or Uint8Array
 */
export function zip_add_file(zip: zip_archive, path: string, content: string | Uint8Array): void {
    const data = typeof content === 'string' ? ENCODER.encode(content) : content
    zip.entries.push({
        name:      path,
        data,
        is_folder: false,
        offset:    0,
        crc32:     _crc32(data),
        size:      data.length,
    })
}

/**
 * Adds an empty folder entry to the archive.
 * Folder paths must end with '/'.
 * @param zip - Archive
 * @param path - Folder path (e.g. 'my-game/assets/')
 */
export function zip_add_folder(zip: zip_archive, path: string): void {
    const folder_path = path.endsWith('/') ? path : path + '/'
    zip.entries.push({
        name:      folder_path,
        data:      new Uint8Array(0),
        is_folder: true,
        offset:    0,
        crc32:     0,
        size:      0,
    })
}

/**
 * Serialises the archive to a Uint8Array.
 * @param zip - Archive to serialise
 */
export function zip_to_bytes(zip: zip_archive): Uint8Array {
    const parts: Uint8Array[] = []
    let offset = 0

    // Write local file headers + data
    for (const entry of zip.entries) {
        entry.offset = offset
        const name_bytes = ENCODER.encode(entry.name)
        const header = _local_header(entry, name_bytes)
        parts.push(header, entry.data)
        offset += header.length + entry.data.length
    }

    // Central directory
    const cd_start  = offset
    const cd_parts: Uint8Array[] = []
    for (const entry of zip.entries) {
        const name_bytes = ENCODER.encode(entry.name)
        cd_parts.push(_central_dir_record(entry, name_bytes))
    }
    const cd_bytes = _concat(cd_parts)
    parts.push(cd_bytes)
    offset += cd_bytes.length

    // End of central directory
    parts.push(_end_of_central_dir(zip.entries.length, cd_bytes.length, cd_start))

    return _concat(parts)
}

/**
 * Triggers a browser download of the ZIP archive.
 * @param zip - Archive
 * @param filename - Download filename (e.g. 'my-game.zip')
 */
export async function zip_save(zip: zip_archive, filename: string): Promise<void> {
    const bytes = zip_to_bytes(zip)
    const blob  = new Blob([bytes], { type: 'application/zip' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href      = url
    a.download  = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Revoke after a short delay to allow the download to start
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// =========================================================================
// ZIP record builders
// =========================================================================

function _local_header(entry: zip_entry, name_bytes: Uint8Array): Uint8Array {
    const buf = new Uint8Array(30 + name_bytes.length)
    _u32(0x04034B50, buf, 0)   // Local file header signature
    _u16(20,         buf, 4)   // Version needed: 2.0
    _u16(0x0800,     buf, 6)   // General purpose flags: UTF-8 filename
    _u16(0,          buf, 8)   // Compression: stored
    _u16(0,          buf, 10)  // Last mod time (0 = no time)
    _u16(0,          buf, 12)  // Last mod date
    _u32(entry.crc32, buf, 14)
    _u32(entry.size,  buf, 18) // Compressed size = uncompressed (stored)
    _u32(entry.size,  buf, 22)
    _u16(name_bytes.length, buf, 26)
    _u16(0,          buf, 28)  // Extra field length
    buf.set(name_bytes, 30)
    return buf
}

function _central_dir_record(entry: zip_entry, name_bytes: Uint8Array): Uint8Array {
    const buf = new Uint8Array(46 + name_bytes.length)
    _u32(0x02014B50, buf, 0)   // Central directory signature
    _u16(20,         buf, 4)   // Version made by: 2.0
    _u16(20,         buf, 6)   // Version needed
    _u16(0x0800,     buf, 8)   // General purpose flags
    _u16(0,          buf, 10)  // Compression: stored
    _u16(0,          buf, 12)  // Mod time
    _u16(0,          buf, 14)  // Mod date
    _u32(entry.crc32, buf, 16)
    _u32(entry.size,  buf, 20)
    _u32(entry.size,  buf, 24)
    _u16(name_bytes.length, buf, 28)
    _u16(0,          buf, 30)  // Extra field length
    _u16(0,          buf, 32)  // Comment length
    _u16(0,          buf, 34)  // Disk number start
    _u16(0,          buf, 36)  // Internal file attrs
    _u32(entry.is_folder ? 0x10 : 0x20, buf, 38)  // External: dir or file
    _u32(entry.offset,   buf, 42)
    buf.set(name_bytes, 46)
    return buf
}

function _end_of_central_dir(count: number, cd_size: number, cd_offset: number): Uint8Array {
    const buf = new Uint8Array(22)
    _u32(0x06054B50, buf, 0)   // End of central directory signature
    _u16(0,          buf, 4)   // Disk number
    _u16(0,          buf, 6)   // Start disk
    _u16(count,      buf, 8)   // Entries on this disk
    _u16(count,      buf, 10)  // Total entries
    _u32(cd_size,    buf, 12)
    _u32(cd_offset,  buf, 16)
    _u16(0,          buf, 20)  // Comment length
    return buf
}

function _concat(parts: Uint8Array[]): Uint8Array {
    const total  = parts.reduce((s, p) => s + p.length, 0)
    const result = new Uint8Array(total)
    let offset   = 0
    for (const p of parts) { result.set(p, offset); offset += p.length }
    return result
}
