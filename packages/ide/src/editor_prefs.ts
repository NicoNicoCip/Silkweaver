/**
 * User editor preferences — per-user (global, localStorage), distinct from per-project Game
 * Settings. These map onto Monaco editor options + theme and are applied live to every open
 * editor. The interface scale / editor font size live in ui_scale.ts; this owns everything else.
 */

import { editor_font_get } from './ui_scale.js'

// Monaco is loaded from CDN and typed as `any` (see script_editor.ts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Monaco = any

/** A user's editor preferences. */
export interface editor_prefs {
    theme:                   string   // Monaco theme id (built-in or one of the custom ids below)
    fontFamily:              string   // CSS font-family stack
    fontLigatures:           boolean
    tabSize:                 number   // 2 | 4 | 8
    insertSpaces:            boolean  // spaces vs. tabs
    wordWrap:                boolean
    minimap:                 boolean
    lineNumbers:             'on' | 'relative' | 'off'
    renderWhitespace:        'none' | 'boundary' | 'all'
    cursorBlinking:          'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
    bracketPairColorization: boolean
    indentGuides:            boolean
    stickyScroll:            boolean
    autoOrganizeObjects:     boolean  // reorder object .ts (metadata→vars→events) + add `;` on full-view open
    tooltips:                boolean  // show hover help tooltips on settings/preferences items
    tooltipDelay:            number   // ms to hover before a tooltip appears
    autoSave:                boolean  // save automatically (on close / periodically) vs. manual Ctrl+S only
}

const DEFAULTS: editor_prefs = {
    theme:                   'vs-dark',
    fontFamily:              'Consolas, "Cascadia Mono", "Courier New", monospace',
    fontLigatures:           false,
    tabSize:                 4,
    insertSpaces:            true,
    wordWrap:                false,
    minimap:                 true,
    lineNumbers:             'on',
    renderWhitespace:        'none',
    cursorBlinking:          'blink',
    bracketPairColorization: true,
    indentGuides:            true,
    stickyScroll:            false,
    autoOrganizeObjects:     true,
    tooltips:                true,
    tooltipDelay:            500,
    autoSave:                false,   // manual save is the default — Ctrl+S to commit, ● shows unsaved
}

const LS = 'sw.editor.prefs'

/** Selectable themes — `id` is the Monaco theme, `label` is shown in the UI. */
export const THEME_OPTIONS: { id: string; label: string }[] = [
    { id: 'vs-dark',     label: 'Dark' },
    { id: 'vs',          label: 'Light' },
    { id: 'hc-black',    label: 'High Contrast' },
    { id: 'sw-midnight', label: 'Midnight (blue)' },
    { id: 'sw-sepia',    label: 'Sepia (warm)' },
]

/** Common monospace families offered in the UI (falls back gracefully if not installed). */
export const FONT_OPTIONS: string[] = [
    'Consolas, "Cascadia Mono", "Courier New", monospace',
    '"Cascadia Code", "Cascadia Mono", monospace',
    '"Fira Code", monospace',
    '"JetBrains Mono", monospace',
    '"Source Code Pro", monospace',
    '"Courier New", monospace',
    'monospace',
]

// =========================================================================
// Store
// =========================================================================

/** Returns the current editor preferences (persisted values merged over defaults). */
export function editor_prefs_get(): editor_prefs {
    try {
        const raw = localStorage.getItem(LS)
        return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<editor_prefs>) } : { ...DEFAULTS }
    } catch {
        return { ...DEFAULTS }
    }
}

/** Merges a partial change into the preferences, persists, and notifies open editors. */
export function editor_prefs_set(patch: Partial<editor_prefs>): void {
    const next = { ...editor_prefs_get(), ...patch }
    localStorage.setItem(LS, JSON.stringify(next))
    window.dispatchEvent(new Event('sw:editor-prefs'))
}

/** Restores all editor preferences to their defaults. */
export function editor_prefs_reset(): void {
    localStorage.removeItem(LS)
    window.dispatchEvent(new Event('sw:editor-prefs'))
}

/** The default preferences (for the UI's reset / comparisons). */
export function editor_prefs_defaults(): editor_prefs { return { ...DEFAULTS } }

// =========================================================================
// Monaco mapping
// =========================================================================

/**
 * Builds the Monaco editor options from the current preferences (plus the font size from
 * ui_scale). Spread into monaco.editor.create(...) and passed to updateOptions() on change.
 * Theme is applied separately via editor_apply_theme (it's a global Monaco setting).
 */
export function editor_monaco_options(): Record<string, unknown> {
    const p = editor_prefs_get()
    return {
        fontFamily:              p.fontFamily,
        fontLigatures:           p.fontLigatures,
        fontSize:                editor_font_get(),
        tabSize:                 p.tabSize,
        insertSpaces:            p.insertSpaces,
        wordWrap:                p.wordWrap ? 'on' : 'off',
        minimap:                 { enabled: p.minimap },
        lineNumbers:             p.lineNumbers,
        renderWhitespace:        p.renderWhitespace,
        cursorBlinking:          p.cursorBlinking,
        bracketPairColorization: { enabled: p.bracketPairColorization },
        guides:                  { indentation: p.indentGuides, highlightActiveIndentation: p.indentGuides },
        stickyScroll:            { enabled: p.stickyScroll },
    }
}

/** Defines the custom Silkweaver themes (call once, after Monaco loads, before setTheme). */
export function editor_register_themes(monaco: Monaco): void {
    monaco.editor.defineTheme('sw-midnight', {
        base: 'vs-dark', inherit: true, rules: [],
        colors: {
            'editor.background':            '#0b1020',
            'editor.foreground':            '#cdd6f4',
            'editorLineNumber.foreground':  '#3b4261',
            'editor.lineHighlightBackground': '#141b34',
            'editor.selectionBackground':   '#2a3f6a',
        },
    })
    monaco.editor.defineTheme('sw-sepia', {
        base: 'vs', inherit: true, rules: [],
        colors: {
            'editor.background':            '#f4ecd8',
            'editor.foreground':            '#433422',
            'editorLineNumber.foreground':  '#b3a588',
            'editor.lineHighlightBackground': '#eadfc4',
            'editorCursor.foreground':      '#5b4636',
            'editor.selectionBackground':   '#dcc89a',
        },
    })
}

/** Applies the preferred theme globally (affects all editors). */
export function editor_apply_theme(monaco: Monaco): void {
    monaco.editor.setTheme(editor_prefs_get().theme)
}

/** Applies the current theme + all options to every open editor. Call on a preferences change. */
export function editor_apply_all(monaco: Monaco): void {
    editor_apply_theme(monaco)
    // Every editor is now a plain Monaco model (no per-editor option overrides), so the full set —
    // including minimap / line numbers / sticky scroll — can be applied live to all open editors.
    const opts = editor_monaco_options()
    for (const ed of monaco.editor.getEditors()) ed.updateOptions(opts)
}
