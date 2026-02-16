/**
 * INI-style storage backed by localStorage.
 *
 * Mirrors GMS's ini_open / ini_close / ini_read_* / ini_write_* API.
 * Data is stored under the localStorage key `silkweaver_ini_<filename>`.
 *
 * Format in localStorage is JSON: { [section]: { [key]: string } }
 *
 * Only one INI file is "open" at a time (GMS convention).
 * All reads/writes operate on the currently open file.
 */

// =========================================================================
// Internal state
// =========================================================================

type ini_data = Record<string, Record<string, string>>

let _current_key:  string | null  = null   // localStorage key for the open file
let _current_data: ini_data | null = null  // In-memory parse of the open file

function _storage_key(filename: string): string {
    return `silkweaver_ini_${filename}`
}

function _assert_open(): ini_data {
    if (!_current_data) throw new Error('ini: no file is open — call ini_open() first')
    return _current_data
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Opens (or creates) an INI file for reading and writing.
 * If a file is already open it is saved and closed first.
 * @param filename - Logical file name (used as localStorage key suffix)
 */
export function ini_open(filename: string): void {
    if (_current_key !== null) ini_close()

    _current_key = _storage_key(filename)
    const raw = localStorage.getItem(_current_key)
    if (raw) {
        try {
            _current_data = JSON.parse(raw) as ini_data
        } catch {
            _current_data = {}
        }
    } else {
        _current_data = {}
    }
}

/**
 * Saves the current INI file to localStorage and closes it.
 * Must be called after all reads/writes to persist changes.
 */
export function ini_close(): void {
    if (_current_key !== null && _current_data !== null) {
        try {
            localStorage.setItem(_current_key, JSON.stringify(_current_data))
        } catch {
            // localStorage quota exceeded or access denied — silently fail
        }
    }
    _current_key  = null
    _current_data = null
}

/**
 * Reads a string value.
 * @param section - INI section name
 * @param key - Key within the section
 * @param default_val - Returned if the key is absent
 */
export function ini_read_string(section: string, key: string, default_val: string): string {
    const data = _assert_open()
    return data[section]?.[key] ?? default_val
}

/**
 * Reads a numeric value. Non-numeric stored values fall back to the default.
 * @param section - INI section name
 * @param key - Key within the section
 * @param default_val - Returned if the key is absent or not a valid number
 */
export function ini_read_real(section: string, key: string, default_val: number): number {
    const data  = _assert_open()
    const raw   = data[section]?.[key]
    if (raw === undefined) return default_val
    const num = Number(raw)
    return isNaN(num) ? default_val : num
}

/**
 * Writes a string value.
 * @param section - INI section name
 * @param key - Key within the section
 * @param val - Value to store
 */
export function ini_write_string(section: string, key: string, val: string): void {
    const data = _assert_open()
    if (!data[section]) data[section] = {}
    data[section][key] = String(val)
}

/**
 * Writes a numeric value (stored as its string representation).
 * @param section - INI section name
 * @param key - Key within the section
 * @param val - Value to store
 */
export function ini_write_real(section: string, key: string, val: number): void {
    const data = _assert_open()
    if (!data[section]) data[section] = {}
    data[section][key] = String(val)
}

/**
 * Returns true if a section/key pair exists in the open file.
 * @param section - Section name
 * @param key - Key name
 */
export function ini_key_exists(section: string, key: string): boolean {
    const data = _assert_open()
    return data[section] !== undefined && key in data[section]
}

/**
 * Returns true if a section exists in the open file.
 * @param section - Section name
 */
export function ini_section_exists(section: string): boolean {
    const data = _assert_open()
    return section in data
}

/**
 * Deletes a key from a section.
 * @param section - Section name
 * @param key - Key to delete
 */
export function ini_key_delete(section: string, key: string): void {
    const data = _assert_open()
    if (data[section]) delete data[section][key]
}

/**
 * Deletes an entire section and all its keys.
 * @param section - Section to delete
 */
export function ini_section_delete(section: string): void {
    const data = _assert_open()
    delete data[section]
}

/**
 * Deletes the INI file from localStorage entirely.
 * @param filename - The file to delete
 */
export function ini_delete(filename: string): void {
    localStorage.removeItem(_storage_key(filename))
    if (_current_key === _storage_key(filename)) {
        _current_key  = null
        _current_data = null
    }
}
