/**
 * Virtual file system backed by IndexedDB.
 *
 * Mirrors the GMS text-file API: file_text_open_read, file_text_open_write,
 * file_text_open_append, file_text_close, file_text_read_string,
 * file_text_write_string, file_text_writeln, file_text_eof,
 * file_text_readln, file_exists, file_delete.
 *
 * All I/O is asynchronous (Promise-based), unlike GMS which is synchronous.
 * The file handle returned is a numeric ID, consistent with GMS.
 *
 * Storage layout: IndexedDB database "silkweaver_fs", object store "files",
 * keyed by filename (string).
 */

// =========================================================================
// IndexedDB helpers
// =========================================================================

const DB_NAME    = 'silkweaver_fs'
const DB_VERSION = 1
const STORE_NAME = 'files'

function _open_db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE_NAME)
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror   = () => reject(req.error)
    })
}

function _db_get(db: IDBDatabase, key: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).get(key)
        req.onsuccess = () => resolve(req.result as string | undefined)
        req.onerror   = () => reject(req.error)
    })
}

function _db_put(db: IDBDatabase, key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readwrite')
        const req = tx.objectStore(STORE_NAME).put(value, key)
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
    })
}

function _db_delete(db: IDBDatabase, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readwrite')
        const req = tx.objectStore(STORE_NAME).delete(key)
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
    })
}

function _db_has(db: IDBDatabase, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).count(key)
        req.onsuccess = () => resolve(req.result > 0)
        req.onerror   = () => reject(req.error)
    })
}

// =========================================================================
// File handle state
// =========================================================================

const FILE_MODE_READ   = 0
const FILE_MODE_WRITE  = 1
const FILE_MODE_APPEND = 2

interface file_handle {
    filename: string
    mode:     number
    content:  string    // Full file content (read mode: loaded at open)
    pos:      number    // Read cursor position (chars into content)
    buffer:   string    // Write buffer (flushed on close)
}

const _handles: Map<number, file_handle> = new Map()
let _next_handle = 1

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Opens a file for reading. Returns a handle ID.
 * The file must exist; use file_exists() to check first.
 * @param filename - Filename (used as the key in IndexedDB)
 * @returns Promise resolving to a file handle number, or -1 if not found
 */
export async function file_text_open_read(filename: string): Promise<number> {
    const db      = await _open_db()
    const content = await _db_get(db, filename)
    db.close()
    if (content === undefined) return -1
    const id = _next_handle++
    _handles.set(id, { filename, mode: FILE_MODE_READ, content, pos: 0, buffer: '' })
    return id
}

/**
 * Opens a file for writing (creates or overwrites).
 * @param filename - Filename
 * @returns Promise resolving to a file handle number
 */
export async function file_text_open_write(filename: string): Promise<number> {
    const id = _next_handle++
    _handles.set(id, { filename, mode: FILE_MODE_WRITE, content: '', pos: 0, buffer: '' })
    return id
}

/**
 * Opens a file for appending. Existing content is preserved.
 * @param filename - Filename
 * @returns Promise resolving to a file handle number
 */
export async function file_text_open_append(filename: string): Promise<number> {
    const db      = await _open_db()
    const content = await _db_get(db, filename) ?? ''
    db.close()
    const id = _next_handle++
    _handles.set(id, { filename, mode: FILE_MODE_APPEND, content: '', pos: 0, buffer: content })
    return id
}

/**
 * Closes a file handle, flushing writes to IndexedDB.
 * @param handle - File handle returned by file_text_open_*
 */
export async function file_text_close(handle: number): Promise<void> {
    const fh = _handles.get(handle)
    if (!fh) return
    if (fh.mode === FILE_MODE_WRITE || fh.mode === FILE_MODE_APPEND) {
        const db = await _open_db()
        await _db_put(db, fh.filename, fh.buffer)
        db.close()
    }
    _handles.delete(handle)
}

/**
 * Reads the next line from a read-mode file.
 * Returns an empty string if at end of file.
 * @param handle - File handle
 */
export function file_text_readln(handle: number): string {
    const fh = _handles.get(handle)
    if (!fh || fh.mode !== FILE_MODE_READ) return ''
    if (fh.pos >= fh.content.length) return ''
    const nl = fh.content.indexOf('\n', fh.pos)
    if (nl < 0) {
        const line = fh.content.slice(fh.pos).replace(/\r$/, '')
        fh.pos = fh.content.length
        return line
    }
    const line = fh.content.slice(fh.pos, nl).replace(/\r$/, '')
    fh.pos = nl + 1
    return line
}

/**
 * Reads a single string token (up to whitespace) from a read-mode file.
 * @param handle - File handle
 */
export function file_text_read_string(handle: number): string {
    const fh = _handles.get(handle)
    if (!fh || fh.mode !== FILE_MODE_READ) return ''
    // Skip leading whitespace
    while (fh.pos < fh.content.length && /\s/.test(fh.content[fh.pos])) fh.pos++
    const start = fh.pos
    while (fh.pos < fh.content.length && !/\s/.test(fh.content[fh.pos])) fh.pos++
    return fh.content.slice(start, fh.pos)
}

/**
 * Returns true if the read cursor is at the end of the file.
 * @param handle - File handle
 */
export function file_text_eof(handle: number): boolean {
    const fh = _handles.get(handle)
    if (!fh) return true
    return fh.pos >= fh.content.length
}

/**
 * Writes a string to a write/append mode file.
 * @param handle - File handle
 * @param str - String to write
 */
export function file_text_write_string(handle: number, str: string): void {
    const fh = _handles.get(handle)
    if (!fh || fh.mode === FILE_MODE_READ) return
    fh.buffer += str
}

/**
 * Writes a newline character to a write/append mode file.
 * @param handle - File handle
 */
export function file_text_writeln(handle: number): void {
    const fh = _handles.get(handle)
    if (!fh || fh.mode === FILE_MODE_READ) return
    fh.buffer += '\n'
}

/**
 * Returns true if a file exists in the virtual file system.
 * @param filename - Filename to check
 */
export async function file_exists(filename: string): Promise<boolean> {
    const db  = await _open_db()
    const has = await _db_has(db, filename)
    db.close()
    return has
}

/**
 * Deletes a file from the virtual file system.
 * @param filename - Filename to delete
 */
export async function file_delete(filename: string): Promise<void> {
    const db = await _open_db()
    await _db_delete(db, filename)
    db.close()
}
