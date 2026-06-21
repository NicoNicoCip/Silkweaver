/**
 * Reusable undo / redo stacks for the IDE (1.4.0 per-window undo).
 *
 * Two shapes are provided, picked by what an editor's state looks like:
 *  - {@link UndoStack} — a command stack of do/undo pairs. Used by the IDE shell for resource-tree
 *    operations, where each action knows how to reverse itself (and may touch disk asynchronously).
 *  - {@link snapshot_history} — a state-snapshot ring. Used by editors (room/sprite/path/timeline)
 *    whose in-memory document is cheap to clone: snapshot after each change, restore on undo.
 *
 * Ctrl+Z (undo) / Ctrl+Shift+Z (redo, Ctrl+Y too) are routed to the focused window's stack (or the
 * shell stack) by index.ts; Monaco
 * code editors and native text inputs keep their own undo and are never intercepted.
 */

// =========================================================================
// Command stack
// =========================================================================

/** A reversible action. `execute`/`unexecute` may run async (e.g. file moves). */
export interface undo_command {
    label:     string
    execute:   () => void | Promise<void>
    unexecute: () => void | Promise<void>
}

const MAX = 100   // entries retained per stack

/**
 * A bounded do/undo command stack.
 */
export class UndoStack {
    private _stack:  undo_command[] = []
    private _cursor: number = -1                  // index of the last executed command

    constructor(private readonly _max: number = MAX) {}

    /**
     * Execute a command and push it onto the stack, clearing any redo tail.
     * @returns the command's execute() result (await it if you need the side effects to settle).
     */
    push(cmd: undo_command): void | Promise<void> {
        this._stack.splice(this._cursor + 1)
        this._stack.push(cmd)
        if (this._stack.length > this._max) this._stack.shift()
        this._cursor = this._stack.length - 1
        return cmd.execute()
    }

    /** Record a command that has ALREADY been applied (push without executing). */
    record(cmd: undo_command): void {
        this._stack.splice(this._cursor + 1)
        this._stack.push(cmd)
        if (this._stack.length > this._max) this._stack.shift()
        this._cursor = this._stack.length - 1
    }

    /**
     * Undo the last command.
     * @returns true if a command was undone, false if the stack was empty.
     */
    undo(): boolean {
        if (this._cursor < 0) return false
        const cmd = this._stack[this._cursor]!
        this._cursor--
        void cmd.unexecute()
        return true
    }

    /**
     * Redo the next command.
     * @returns true if a command was redone, false if there was nothing to redo.
     */
    redo(): boolean {
        if (this._cursor >= this._stack.length - 1) return false
        this._cursor++
        void this._stack[this._cursor]!.execute()
        return true
    }

    can_undo(): boolean { return this._cursor >= 0 }
    can_redo(): boolean { return this._cursor < this._stack.length - 1 }
    clear(): void { this._stack.length = 0; this._cursor = -1 }
}

// =========================================================================
// Snapshot history (for editors with a cheaply-clonable document)
// =========================================================================

/**
 * A bounded state-snapshot history for editors whose document is a cheaply-clonable object.
 * Seed with {@link init}, snapshot after each mutation with {@link commit}; undo/redo clone a
 * stored state back in through the `apply` callback.
 */
export class snapshot_history<T> {
    private _stack:  T[] = []
    private _cursor: number = -1

    /**
     * @param _clone - deep-copies a state (so stored snapshots can't be mutated in place)
     * @param _apply - installs a restored state into the editor (set data, re-render, mark dirty)
     * @param _max   - number of undo steps to retain
     */
    constructor(
        private readonly _clone: (s: T) => T,
        private readonly _apply: (s: T) => void,
        private readonly _max: number = MAX,
    ) {}

    /** Seed the history with the initial (already-displayed) state. Call once after load. */
    init(state: T): void {
        this._stack  = [this._clone(state)]
        this._cursor = 0
    }

    /** Record the current (already-applied) state as a new history entry, clearing the redo tail. */
    commit(state: T): void {
        if (this._cursor < 0) { this.init(state); return }
        this._stack.splice(this._cursor + 1)
        this._stack.push(this._clone(state))
        if (this._stack.length > this._max + 1) this._stack.shift()
        this._cursor = this._stack.length - 1
    }

    undo(): boolean {
        if (this._cursor <= 0) return false
        this._cursor--
        this._apply(this._clone(this._stack[this._cursor]!))
        return true
    }

    redo(): boolean {
        if (this._cursor >= this._stack.length - 1) return false
        this._cursor++
        this._apply(this._clone(this._stack[this._cursor]!))
        return true
    }

    can_undo(): boolean { return this._cursor > 0 }
    can_redo(): boolean { return this._cursor < this._stack.length - 1 }
    clear(): void { this._stack.length = 0; this._cursor = -1 }
}
