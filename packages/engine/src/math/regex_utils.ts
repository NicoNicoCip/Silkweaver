/**
 * Regular expression utilities.
 *
 * Thin wrappers around JavaScript's RegExp, providing a more GMS-friendly API.
 * GMS does not have native regex; these are Silkweaver extensions.
 */

// =========================================================================
// Public API
// =========================================================================

/**
 * Returns true if str matches the pattern.
 * @param str - String to test
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags (e.g. 'i' for case-insensitive)
 */
export function regex_match(str: string, pattern: string, flags: string = ''): boolean {
    try {
        return new RegExp(pattern, flags).test(str)
    } catch {
        return false
    }
}

/**
 * Returns the first match of pattern in str, or null if no match.
 * @param str - String to search
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags
 */
export function regex_find(str: string, pattern: string, flags: string = ''): string | null {
    try {
        return str.match(new RegExp(pattern, flags))?.[0] ?? null
    } catch {
        return null
    }
}

/**
 * Returns all matches of pattern in str as an array.
 * @param str - String to search
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags (default 'g' — global)
 */
export function regex_find_all(str: string, pattern: string, flags: string = 'g'): string[] {
    try {
        return [...str.matchAll(new RegExp(pattern, flags))].map(m => m[0])
    } catch {
        return []
    }
}

/**
 * Replaces the first match of pattern in str with replacement.
 * @param str - Input string
 * @param pattern - Regular expression pattern string
 * @param replacement - Replacement string (supports $1, $2 group references)
 * @param flags - RegExp flags
 */
export function regex_replace(str: string, pattern: string, replacement: string, flags: string = ''): string {
    try {
        return str.replace(new RegExp(pattern, flags), replacement)
    } catch {
        return str
    }
}

/**
 * Replaces all matches of pattern in str with replacement.
 * @param str - Input string
 * @param pattern - Regular expression pattern string
 * @param replacement - Replacement string
 * @param flags - RegExp flags (default 'g')
 */
export function regex_replace_all(str: string, pattern: string, replacement: string, flags: string = 'g'): string {
    try {
        return str.replace(new RegExp(pattern, flags), replacement)
    } catch {
        return str
    }
}

/**
 * Splits str by pattern and returns an array of parts.
 * @param str - Input string
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags
 */
export function regex_split(str: string, pattern: string, flags: string = ''): string[] {
    try {
        return str.split(new RegExp(pattern, flags))
    } catch {
        return [str]
    }
}

/**
 * Returns the 0-based index of the first match, or -1 if not found.
 * Matches Silkweaver's 0-based string-indexing convention (see string_pos).
 * @param str - String to search
 * @param pattern - Regular expression pattern string
 * @param flags - RegExp flags
 */
export function regex_pos(str: string, pattern: string, flags: string = ''): number {
    try {
        return str.search(new RegExp(pattern, flags))   // 0-based index, or -1 if not found
    } catch {
        return -1
    }
}

/**
 * Returns an array of capture groups from the first match, or empty array.
 * Index 0 is the full match; indices 1+ are capture groups.
 * @param str - String to match against
 * @param pattern - Regular expression pattern
 * @param flags - RegExp flags
 */
export function regex_groups(str: string, pattern: string, flags: string = ''): string[] {
    try {
        const m = str.match(new RegExp(pattern, flags))
        return m ? [...m].map(s => s ?? '') : []
    } catch {
        return []
    }
}
