/**
 * Simple undo/redo stack for IDE operations.
 * Each command is a pair of do/undo functions.
 */

// =========================================================================
// Types
// =========================================================================

export interface undo_command {
    label: string
    execute:  () => void
    unexecute: () => void
}

// =========================================================================
// State
// =========================================================================

const _stack:   undo_command[] = []
let   _cursor:  number = -1   // index of last executed command

const MAX = 100

// =========================================================================
// Public API
// =========================================================================

/**
 * Execute a command and push it onto the undo stack.
 * Clears any redo history past the current cursor.
 */
export function undo_push(cmd: undo_command): void {
    // Discard redo tail
    _stack.splice(_cursor + 1)
    _stack.push(cmd)
    if (_stack.length > MAX) _stack.shift()
    _cursor = _stack.length - 1
    cmd.execute()
}

/**
 * Undo the last command.
 * @returns true if a command was undone, false if stack is empty.
 */
export function undo_undo(): boolean {
    if (_cursor < 0) return false
    _stack[_cursor].unexecute()
    _cursor--
    return true
}

/**
 * Redo the next command.
 * @returns true if a command was redone, false if nothing to redo.
 */
export function undo_redo(): boolean {
    if (_cursor >= _stack.length - 1) return false
    _cursor++
    _stack[_cursor].execute()
    return true
}

/**
 * Whether there is anything to undo.
 */
export function undo_can_undo(): boolean { return _cursor >= 0 }

/**
 * Whether there is anything to redo.
 */
export function undo_can_redo(): boolean { return _cursor < _stack.length - 1 }

/**
 * Clear the entire history.
 */
export function undo_clear(): void {
    _stack.length = 0
    _cursor = -1
}
