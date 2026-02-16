/**
 * Breakpoint manager.
 *
 * Tracks IDE breakpoints per file and communicates them to the game preview
 * iframe via postMessage.  Monaco editors register themselves so the manager
 * can paint / clear glyph-margin decorations.
 *
 * Breakpoint protocol sent TO iframe:
 *   { type: 'sw:breakpoints', breakpoints: BreakpointInfo[] }
 *
 * Hit event received FROM iframe:
 *   { type: 'sw:break', file: string, line: number, variables: Record<string, unknown> }
 *
 * Resume event sent TO iframe:
 *   { type: 'sw:resume' }
 */

// =========================================================================
// Types
// =========================================================================

export interface breakpoint_info {
    file: string    // relative file path, e.g. "scripts/player.ts"
    line: number    // 1-based line number
}

// =========================================================================
// State
// =========================================================================

/** file → Set of 1-based line numbers */
const _breakpoints = new Map<string, Set<number>>()

/** file → Monaco editor instance (typed as any — loaded via AMD CDN) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _editors = new Map<string, any>()

/** file → decoration IDs array (returned by Monaco) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _decorations = new Map<string, any[]>()

/** Registered break-hit listeners */
const _hit_listeners: Array<(file: string, line: number, vars: Record<string, unknown>) => void> = []

let _listener_attached = false

// =========================================================================
// Public API
// =========================================================================

/**
 * Register a Monaco editor for a given file so the manager can update
 * its glyph decorations when breakpoints change.
 * @param file    - Relative file path
 * @param editor  - Monaco IStandaloneCodeEditor instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function bp_register_editor(file: string, editor: any): void {
    _editors.set(file, editor)
    _sync_decorations(file)
    _ensure_listener()
}

/**
 * Unregister an editor (called when its window closes).
 * @param file - Relative file path
 */
export function bp_unregister_editor(file: string): void {
    _editors.delete(file)
    _decorations.delete(file)
}

/**
 * Toggle a breakpoint at the given file/line.
 * @param file - Relative file path
 * @param line - 1-based line number
 */
export function bp_toggle(file: string, line: number): void {
    if (!_breakpoints.has(file)) _breakpoints.set(file, new Set())
    const lines = _breakpoints.get(file)!
    if (lines.has(line)) lines.delete(line)
    else                 lines.add(line)
    if (lines.size === 0) _breakpoints.delete(file)
    _sync_decorations(file)
    _broadcast()
}

/**
 * Clear all breakpoints for a file.
 * @param file - Relative file path
 */
export function bp_clear_file(file: string): void {
    _breakpoints.delete(file)
    _sync_decorations(file)
    _broadcast()
}

/**
 * Clear all breakpoints across all files.
 */
export function bp_clear_all(): void {
    _breakpoints.clear()
    for (const file of _editors.keys()) _sync_decorations(file)
    _broadcast()
}

/**
 * Get all current breakpoints as a flat array.
 */
export function bp_get_all(): breakpoint_info[] {
    const result: breakpoint_info[] = []
    for (const [file, lines] of _breakpoints) {
        for (const line of lines) result.push({ file, line })
    }
    return result
}

/**
 * Send a resume message to the preview iframe (unpauses execution).
 */
export function bp_resume(): void {
    _send_to_iframe({ type: 'sw:resume' })
}

/**
 * Register a callback that fires when the iframe reports a breakpoint hit.
 */
export function bp_on_hit(cb: (file: string, line: number, vars: Record<string, unknown>) => void): void {
    _hit_listeners.push(cb)
    _ensure_listener()
}

// =========================================================================
// Internal
// =========================================================================

function _sync_decorations(file: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor: any = _editors.get(file)
    if (!editor) return

    const lines = _breakpoints.get(file) ?? new Set<number>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const new_decorations = Array.from(lines).map((line): any => ({
        range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
        options: {
            isWholeLine: true,
            glyphMarginClassName: 'sw-bp-glyph',
            glyphMarginHoverMessage: { value: `Breakpoint at line ${line}` },
            className: 'sw-bp-line',
        },
    }))

    const old = _decorations.get(file) ?? []
    const updated = editor.deltaDecorations(old, new_decorations)
    _decorations.set(file, updated)
}

function _broadcast(): void {
    _send_to_iframe({ type: 'sw:breakpoints', breakpoints: bp_get_all() })
}

function _send_to_iframe(msg: unknown): void {
    // Find the preview iframe by its known src pattern
    const frames = document.querySelectorAll('iframe')
    for (const frame of frames) {
        try {
            frame.contentWindow?.postMessage(msg, '*')
        } catch { /* cross-origin or not yet loaded */ }
    }
}

function _ensure_listener(): void {
    if (_listener_attached) return
    _listener_attached = true
    window.addEventListener('message', (e: MessageEvent) => {
        if (!e.data) return
        if (e.data.type === 'sw:break') {
            const { file, line, variables } = e.data as {
                file:      string
                line:      number
                variables: Record<string, unknown>
            }
            for (const cb of _hit_listeners) cb(file, line, variables ?? {})
        }
    })
}
