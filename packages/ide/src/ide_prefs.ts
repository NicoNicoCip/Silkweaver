/**
 * IDE chrome customization (the app shell — menus, panels, windows, tree), distinct from the
 * Monaco code-editor preferences. The whole UI is driven by `--sw-*` CSS variables, so a theme is
 * just a palette of those values written onto the document root. Persisted in localStorage.
 */

const LS_THEME  = 'sw.ide.theme'
const LS_ACCENT = 'sw.ide.accent'

/** Selectable IDE themes for the Preferences UI. */
export const IDE_THEMES: { id: string; label: string }[] = [
    { id: 'dark',     label: 'Dark (default)' },
    { id: 'darker',   label: 'Darker' },
    { id: 'midnight', label: 'Midnight (blue)' },
    { id: 'light',    label: 'Light' },
]

/** Per-theme palettes (only the variables that change between themes; sizes/red stay constant). */
const PALETTES: Record<string, Record<string, string>> = {
    dark: {
        '--sw-workspace': '#2b2b2b', '--sw-chrome': '#3c3c3c', '--sw-chrome2': '#333333',
        '--sw-border': '#555555', '--sw-border2': '#444444',
        '--sw-text': '#f0f0f0', '--sw-text-dim': '#aaaaaa',
        '--sw-accent': '#0078d4', '--sw-accent-hov': '#106ebe',
        '--sw-input-bg': '#3a3a3a', '--sw-input-bdr': '#666666', '--sw-select-bg': '#094771',
    },
    darker: {
        '--sw-workspace': '#1e1e1e', '--sw-chrome': '#252526', '--sw-chrome2': '#1b1b1b',
        '--sw-border': '#3a3a3a', '--sw-border2': '#2d2d2d',
        '--sw-text': '#e8e8e8', '--sw-text-dim': '#969696',
        '--sw-accent': '#0e639c', '--sw-accent-hov': '#1177bb',
        '--sw-input-bg': '#2d2d2d', '--sw-input-bdr': '#4a4a4a', '--sw-select-bg': '#094771',
    },
    midnight: {
        '--sw-workspace': '#0d1117', '--sw-chrome': '#161b22', '--sw-chrome2': '#11161d',
        '--sw-border': '#30363d', '--sw-border2': '#21262d',
        '--sw-text': '#c9d1d9', '--sw-text-dim': '#8b949e',
        '--sw-accent': '#1f6feb', '--sw-accent-hov': '#388bfd',
        '--sw-input-bg': '#0d1117', '--sw-input-bdr': '#30363d', '--sw-select-bg': '#163356',
    },
    light: {
        '--sw-workspace': '#e6e6e6', '--sw-chrome': '#f3f3f3', '--sw-chrome2': '#e8e8e8',
        '--sw-border': '#c8c8c8', '--sw-border2': '#d8d8d8',
        '--sw-text': '#1f1f1f', '--sw-text-dim': '#5f5f5f',
        '--sw-accent': '#005fb8', '--sw-accent-hov': '#0067c0',
        '--sw-input-bg': '#ffffff', '--sw-input-bdr': '#b0b0b0', '--sw-select-bg': '#cfe5fb',
    },
}

/** Returns the active IDE theme id. */
export function ide_theme_get(): string {
    const t = localStorage.getItem(LS_THEME)
    return t && PALETTES[t] ? t : 'dark'
}

/** The accent override, or '' to follow the theme's default accent. */
export function ide_accent_get(): string { return localStorage.getItem(LS_ACCENT) ?? '' }

/** The accent currently in effect (override if set, else the theme default) — for the UI swatch. */
export function ide_accent_effective(): string {
    return ide_accent_get() || PALETTES[ide_theme_get()]!['--sw-accent']!
}

/** Sets the IDE theme and re-applies. */
export function ide_theme_set(id: string): void {
    if (PALETTES[id]) localStorage.setItem(LS_THEME, id)
    _apply()
}

/** Sets (or clears, with '') the accent override and re-applies. */
export function ide_accent_set(hex: string): void {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) localStorage.setItem(LS_ACCENT, hex)
    else localStorage.removeItem(LS_ACCENT)
    _apply()
}

/** Applies the persisted IDE theme + accent to the document root. Call once at startup. */
export function ide_theme_init(): void { _apply() }

function _apply(): void {
    const root = document.documentElement.style
    const palette = PALETTES[ide_theme_get()]!
    for (const [k, v] of Object.entries(palette)) root.setProperty(k, v)
    const accent = ide_accent_get()
    if (accent) {
        root.setProperty('--sw-accent', accent)
        root.setProperty('--sw-accent-hov', _lighten(accent, 0.14))
    }
}

/** Lightens a #rrggbb color toward white by `amt` (0–1). */
function _lighten(hex: string, amt: number): string {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
    if (!m) return hex
    const n = parseInt(m[1]!, 16)
    const ch = (c: number): number => Math.min(255, Math.round(c + (255 - c) * amt))
    const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255)
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
