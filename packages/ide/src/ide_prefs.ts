/**
 * IDE chrome customization (the app shell — menus, panels, windows, tree), distinct from the Monaco
 * code-editor preferences. The UI is driven by `--sw-*` CSS variables; a theme swaps only the
 * NEUTRAL chrome tones (workspace / panels / borders / inputs). The brand colours — the spider-lily
 * red accent and the selection wash — are fixed and live in theme.ts, so the identity stays
 * consistent across themes and there's a single source for it. Persisted in localStorage.
 */

const LS_THEME = 'sw.ide.theme'

/** Selectable IDE themes for the Preferences UI. */
export const IDE_THEMES: { id: string; label: string }[] = [
    { id: 'dark',     label: 'Dark (default)' },
    { id: 'darker',   label: 'Darker' },
    { id: 'midnight', label: 'Midnight (blue)' },
    { id: 'light',    label: 'Light' },
]

/**
 * Per-theme palettes. A theme drives the whole elevation ramp (l0 back → l4 hover-lift) plus text,
 * borders, inputs, the drop-shadow strength, and the recess shadow — everything the layered surfaces
 * read. The brand accent + selection wash are NOT here: they're fixed in theme.ts. "Dark" is empty
 * because it IS the theme.ts default — no overrides needed.
 */
const PALETTES: Record<string, Record<string, string>> = {
    dark: {},
    darker: {
        '--sw-l0': '#121213', '--sw-l1': '#1a1a1b', '--sw-l2': '#242427', '--sw-l3': '#2e2e32', '--sw-l4': '#3a3a3f',
        '--sw-text': '#eaeaea', '--sw-text-dim': '#8f8f8f',
        '--sw-border': 'rgba(0,0,0,0.5)', '--sw-border2': 'rgba(255,255,255,0.05)',
        '--sw-input-bg': '#161617', '--sw-input-bdr': 'rgba(0,0,0,0.6)',
        '--sw-shadow-sm': '0 2px 6px rgba(0,0,0,0.5)', '--sw-shadow-md': '0 4px 16px rgba(0,0,0,0.55)', '--sw-shadow-lg': '0 16px 44px rgba(0,0,0,0.65)',
        '--sw-sunk': 'rgba(0,0,0,0.6)',
    },
    midnight: {
        '--sw-l0': '#0b0f16', '--sw-l1': '#11161f', '--sw-l2': '#1a2230', '--sw-l3': '#232d3d', '--sw-l4': '#2f3b4f',
        '--sw-text': '#cdd6e2', '--sw-text-dim': '#8b97a8',
        '--sw-border': 'rgba(0,0,0,0.45)', '--sw-border2': 'rgba(255,255,255,0.06)',
        '--sw-input-bg': '#0c1119', '--sw-input-bdr': 'rgba(0,0,0,0.5)',
        '--sw-shadow-sm': '0 2px 6px rgba(0,0,0,0.45)', '--sw-shadow-md': '0 4px 16px rgba(0,0,0,0.5)', '--sw-shadow-lg': '0 16px 44px rgba(0,0,0,0.6)',
        '--sw-sunk': 'rgba(0,0,0,0.5)',
    },
    light: {
        '--sw-l0': '#d4d4d7', '--sw-l1': '#e3e3e5', '--sw-l2': '#eff0f2', '--sw-l3': '#f8f8fa', '--sw-l4': '#ffffff',
        '--sw-text': '#1f1f22', '--sw-text-dim': '#5f6066',
        '--sw-border': 'rgba(0,0,0,0.18)', '--sw-border2': 'rgba(0,0,0,0.07)',
        '--sw-input-bg': '#ffffff', '--sw-input-bdr': 'rgba(0,0,0,0.25)',
        '--sw-shadow-sm': '0 1px 3px rgba(0,0,0,0.12)', '--sw-shadow-md': '0 3px 10px rgba(0,0,0,0.15)', '--sw-shadow-lg': '0 12px 32px rgba(0,0,0,0.20)',
        '--sw-sunk': 'rgba(0,0,0,0.10)',
    },
}

/** Returns the active IDE theme id. */
export function ide_theme_get(): string {
    const t = localStorage.getItem(LS_THEME)
    return t && PALETTES[t] ? t : 'dark'
}

/** Sets the IDE theme and re-applies. */
export function ide_theme_set(id: string): void {
    if (PALETTES[id]) localStorage.setItem(LS_THEME, id)
    _apply()
}

/** Applies the persisted IDE theme to the document root. Call once at startup. */
export function ide_theme_init(): void { _apply() }

/** Every var any theme touches — cleared before each apply so switching themes never leaves residue
 *  (e.g. Light → Dark must drop Light's light ramp and fall back to the theme.ts default). */
const _ALL_KEYS = [...new Set(Object.values(PALETTES).flatMap(p => Object.keys(p)))]

function _apply(): void {
    const root = document.documentElement.style
    for (const k of _ALL_KEYS) root.removeProperty(k)
    for (const [k, v] of Object.entries(PALETTES[ide_theme_get()]!)) root.setProperty(k, v)
}
