/**
 * Keyboard-shortcut catalogue — the single, human-readable list of every IDE/editor shortcut, shown
 * read-only in Preferences → Keyboard Shortcuts.
 *
 * This documents what the IDE binds today (the global handler in index.ts + the menubar, plus the
 * Monaco code-editor defaults). It is a reference, not yet the source of truth for dispatch — wiring
 * the global handler through this list (so the binds become remappable) is a planned follow-up.
 */

/** A single shortcut: the key combo and what it does. */
export interface keybind {
    keys: string                 // display combo, e.g. 'Ctrl+S'
    label: string                // what it does
    desc?: string                // optional extra detail
}

/** A named group of related shortcuts. */
export interface keybind_group {
    group: string
    binds: keybind[]
}

/** The full catalogue, grouped for display. */
export const KEYBINDS: keybind_group[] = [
    {
        group: 'File',
        binds: [
            { keys: 'Ctrl+N', label: 'New project' },
            { keys: 'Ctrl+O', label: 'Open project' },
            { keys: 'Ctrl+S', label: 'Save', desc: 'Saves the project; in a code editor, flushes that file.' },
        ],
    },
    {
        group: 'Edit',
        binds: [
            { keys: 'Ctrl+Z',       label: 'Undo' },
            { keys: 'Ctrl+Shift+Z', label: 'Redo', desc: 'Ctrl+Y also works.' },
            { keys: 'Ctrl+,',       label: 'Preferences' },
            { keys: 'Ctrl+Shift+P', label: 'Game Settings' },
        ],
    },
    {
        group: 'View',
        binds: [
            { keys: 'Ctrl+R', label: 'Resources panel' },
            { keys: 'F11',    label: 'Output console', desc: 'Toggles the console panel.' },
            { keys: 'F9',     label: 'Debugger' },
            { keys: 'F10',    label: 'Profiler' },
            { keys: 'F1',     label: 'Documentation' },
            { keys: 'Ctrl++', label: 'Zoom in (interface scale)' },
            { keys: 'Ctrl+-', label: 'Zoom out (interface scale)' },
            { keys: 'Ctrl+0', label: 'Reset interface scale' },
        ],
    },
    {
        group: 'Run',
        binds: [
            { keys: 'F5',       label: 'Play', desc: 'Builds and runs the game in the preview.' },
            { keys: 'Ctrl+F5',  label: 'Build' },
            { keys: 'Shift+F5', label: 'Stop' },
        ],
    },
    {
        group: 'Code editor',
        binds: [
            { keys: 'Ctrl+F',       label: 'Find' },
            { keys: 'Ctrl+H',       label: 'Replace' },
            { keys: 'Ctrl+/',       label: 'Toggle line comment' },
            { keys: 'Ctrl+Space',   label: 'Trigger suggestions', desc: 'Shows autocomplete (this., inst., sw., global.…).' },
            { keys: 'Alt+↑ / Alt+↓', label: 'Move line up / down' },
            { keys: 'Shift+Alt+↓',  label: 'Copy line down' },
            { keys: 'Ctrl+D',       label: 'Add next occurrence to selection' },
            { keys: 'Ctrl+/',       label: 'Comment / uncomment' },
            { keys: 'F12',          label: 'Go to definition' },
            { keys: 'Ctrl+]',       label: 'Indent line' },
            { keys: 'Ctrl+[',       label: 'Outdent line' },
        ],
    },
]
