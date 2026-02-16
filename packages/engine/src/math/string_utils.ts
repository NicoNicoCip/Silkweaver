/**
 * String utility functions.
 *
 * Mirrors the GMS string API:
 *   string_length, string_copy, string_pos, string_delete, string_insert,
 *   string_replace, string_replace_all, string_count, string_lower, string_upper,
 *   string_letters, string_digits, string_lettersdigits,
 *   string_trim, string_repeat, string_reverse, string_format,
 *   chr, ord, ansi_char, string_char_at, string_byte_at, string_byte_length,
 *   string_set_byte_at
 *
 * String indexing is 1-based (matching GMS), unlike JavaScript's 0-based indexing.
 */

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Returns the number of characters in a string.
 * @param str - Input string
 */
export function string_length(str: string): number {
    return str.length
}

/**
 * Returns a substring.
 * @param str - Input string
 * @param index - Start index (1-based)
 * @param count - Number of characters to copy
 */
export function string_copy(str: string, index: number, count: number): string {
    return str.substring(index - 1, index - 1 + count)
}

/**
 * Returns the 1-based position of substr in str, or 0 if not found.
 * @param substr - Substring to search for
 * @param str - String to search in
 */
export function string_pos(substr: string, str: string): number {
    const i = str.indexOf(substr)
    return i < 0 ? 0 : i + 1
}

/**
 * Returns the 1-based position of the nth occurrence of substr in str.
 * @param substr - Substring to find
 * @param str - String to search in
 * @param occurrence - Which occurrence to find (1 = first)
 */
export function string_pos_ext(substr: string, str: string, occurrence: number = 1): number {
    let pos = 0
    for (let i = 0; i < occurrence; i++) {
        const found = str.indexOf(substr, pos)
        if (found < 0) return 0
        pos = found + (i < occurrence - 1 ? 1 : 0)
    }
    return pos + 1
}

/**
 * Deletes count characters from str starting at index (1-based).
 * @param str - Input string
 * @param index - Start index (1-based)
 * @param count - Number of characters to delete
 */
export function string_delete(str: string, index: number, count: number): string {
    return str.slice(0, index - 1) + str.slice(index - 1 + count)
}

/**
 * Inserts substr into str at 1-based index.
 * @param substr - String to insert
 * @param str - Target string
 * @param index - Insertion position (1-based)
 */
export function string_insert(substr: string, str: string, index: number): string {
    return str.slice(0, index - 1) + substr + str.slice(index - 1)
}

/**
 * Replaces the first occurrence of old_str with new_str.
 * @param str - Input string
 * @param old_str - String to replace
 * @param new_str - Replacement string
 */
export function string_replace(str: string, old_str: string, new_str: string): string {
    const i = str.indexOf(old_str)
    if (i < 0) return str
    return str.slice(0, i) + new_str + str.slice(i + old_str.length)
}

/**
 * Replaces all occurrences of old_str with new_str.
 * @param str - Input string
 * @param old_str - String to replace
 * @param new_str - Replacement string
 */
export function string_replace_all(str: string, old_str: string, new_str: string): string {
    if (old_str === '') return str
    return str.split(old_str).join(new_str)
}

/**
 * Returns the number of times substr appears in str.
 */
export function string_count(substr: string, str: string): number {
    if (substr === '') return 0
    let count = 0, pos = 0
    while ((pos = str.indexOf(substr, pos)) >= 0) { count++; pos += substr.length }
    return count
}

/** Converts a string to lowercase. */
export function string_lower(str: string): string { return str.toLowerCase() }

/** Converts a string to uppercase. */
export function string_upper(str: string): string { return str.toUpperCase() }

/** Returns only the letter characters from a string. */
export function string_letters(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '')
}

/** Returns only the digit characters from a string. */
export function string_digits(str: string): string {
    return str.replace(/[^0-9]/g, '')
}

/** Returns only letters and digits from a string. */
export function string_lettersdigits(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '')
}

/** Trims leading and trailing whitespace. */
export function string_trim(str: string): string { return str.trim() }

/** Trims leading whitespace. */
export function string_trim_start(str: string): string { return str.trimStart() }

/** Trims trailing whitespace. */
export function string_trim_end(str: string): string { return str.trimEnd() }

/**
 * Repeats str n times.
 * @param str - String to repeat
 * @param n - Number of repetitions
 */
export function string_repeat(str: string, n: number): string {
    return str.repeat(Math.max(0, n))
}

/** Reverses a string. */
export function string_reverse(str: string): string {
    return [...str].reverse().join('')
}

/**
 * Returns a character at 1-based index.
 * Returns an empty string if out of range.
 */
export function string_char_at(str: string, index: number): string {
    return str[index - 1] ?? ''
}

/**
 * Returns the byte value at 1-based index (uses charCodeAt).
 */
export function string_byte_at(str: string, index: number): number {
    return str.charCodeAt(index - 1) || 0
}

/** Returns the byte length of the UTF-16 encoded string. */
export function string_byte_length(str: string): number {
    return str.length * 2
}

/**
 * Returns the character with the given Unicode code point.
 * GMS equivalent: chr(val)
 */
export function chr(code: number): string {
    return String.fromCodePoint(code)
}

/**
 * Returns the Unicode code point of the first character of str.
 * GMS equivalent: ord(str)
 */
export function ord(str: string): number {
    return str.codePointAt(0) ?? 0
}

/** Alias for chr(), matching GMS's ansi_char. */
export function ansi_char(code: number): string {
    return String.fromCharCode(code)
}

/**
 * Formats a number to a string with given total width and decimal places.
 * Mirrors GMS's string_format(val, tot, dec).
 * @param val - Number to format
 * @param tot - Minimum total width (padded with spaces on left)
 * @param dec - Number of decimal places
 */
export function string_format(val: number, tot: number, dec: number): string {
    const formatted = val.toFixed(dec)
    return formatted.length < tot ? formatted.padStart(tot) : formatted
}

/**
 * Converts a value to its string representation.
 * Mirrors GMS's string(val).
 */
export function string(val: unknown): string {
    if (typeof val === 'number') {
        // GMS drops trailing zeros for integers
        return Number.isInteger(val) ? String(val) : String(val)
    }
    return String(val)
}

/**
 * Converts a string to a real number.
 * Returns 0 if the string is not a valid number (GMS behaviour).
 */
export function real(str: string): number {
    const n = parseFloat(str)
    return isNaN(n) ? 0 : n
}

/**
 * Splits a string by a delimiter and returns an array of parts.
 * @param str - String to split
 * @param delimiter - Separator string
 */
export function string_split(str: string, delimiter: string): string[] {
    return str.split(delimiter)
}

/**
 * Joins an array of strings with a separator.
 * @param parts - String array
 * @param separator - Separator between parts
 */
export function string_join(parts: string[], separator: string = ''): string {
    return parts.join(separator)
}
