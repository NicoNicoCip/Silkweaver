/**
 * IDE display scaling — an accessibility feature (GMS 1.4 has none).
 *
 * Two independent, persisted controls:
 *   - Interface scale  — zooms the WHOLE IDE (chrome + code) via the Electron webFrame
 *     zoom factor. This is the browser-style zoom VS Code uses, so Monaco stays pixel-correct
 *     (unlike a CSS transform). Falls back to CSS `zoom` when not running under Electron.
 *   - Editor font size — the Monaco code-font size in points, applied on top of the interface
 *     scale so the code can be enlarged independently of the chrome.
 *
 * Both persist in localStorage and re-apply on the next launch.
 */

const LS_SCALE = 'sw.ui.scale'      // interface zoom factor (number, 1 = 100%)
const LS_FONT  = 'sw.editor.font'   // Monaco font size in px

const SCALE_DEFAULT = 1
const SCALE_MIN = 0.6, SCALE_MAX = 3, SCALE_STEP = 0.1

const FONT_DEFAULT = 13
const FONT_MIN = 8, FONT_MAX = 48, FONT_STEP = 1

const _clamp  = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))
const _round1 = (v: number): number => Math.round(v * 10) / 10

/** The Electron preload bridge, when running under the desktop host. */
interface zoom_bridge { set_zoom_factor?: (f: number) => void; get_zoom_factor?: () => number }
function _bridge(): zoom_bridge | undefined { return (window as { swfs?: zoom_bridge }).swfs }

// =========================================================================
// Interface scale
// =========================================================================

/** Returns the persisted interface scale (1 = 100%), clamped to the allowed range. */
export function ui_scale_get(): number {
    const v = Number(localStorage.getItem(LS_SCALE))
    return Number.isFinite(v) && v > 0 ? _clamp(v, SCALE_MIN, SCALE_MAX) : SCALE_DEFAULT
}

function _apply_scale(s: number): void {
    const b = _bridge()
    if (b?.set_zoom_factor) {
        b.set_zoom_factor(s)                              // Electron: real webFrame zoom (Monaco-safe)
    } else {
        ;(document.documentElement.style as unknown as { zoom: string }).zoom = String(s)   // browser fallback
    }
    // Nudge listeners (Monaco editors use automaticLayout) to re-measure at the new scale.
    window.dispatchEvent(new Event('resize'))
}

/** Sets and persists the interface scale, then applies it. */
export function ui_scale_set(s: number): void {
    const v = _round1(_clamp(s, SCALE_MIN, SCALE_MAX))
    localStorage.setItem(LS_SCALE, String(v))
    _apply_scale(v)
}

/** Increases the interface scale by one step. */
export function ui_scale_in(): void { ui_scale_set(ui_scale_get() + SCALE_STEP) }
/** Decreases the interface scale by one step. */
export function ui_scale_out(): void { ui_scale_set(ui_scale_get() - SCALE_STEP) }
/** Resets the interface scale to 100%. */
export function ui_scale_reset(): void { ui_scale_set(SCALE_DEFAULT) }

/** Applies the persisted interface scale once at startup (webFrame zoom resets per launch). */
export function ui_scale_init(): void { _apply_scale(ui_scale_get()) }

// =========================================================================
// Editor font size (Monaco)
// =========================================================================

/** Returns the persisted Monaco editor font size (px), clamped to the allowed range. */
export function editor_font_get(): number {
    const v = Number(localStorage.getItem(LS_FONT))
    return Number.isFinite(v) && v > 0 ? _clamp(Math.round(v), FONT_MIN, FONT_MAX) : FONT_DEFAULT
}

/** Sets and persists the editor font size, notifying live editors. */
export function editor_font_set(px: number): void {
    const v = _clamp(Math.round(px), FONT_MIN, FONT_MAX)
    localStorage.setItem(LS_FONT, String(v))
    window.dispatchEvent(new Event('sw:editor-font'))
}

/** Increases the editor font size by one step. */
export function editor_font_in(): void { editor_font_set(editor_font_get() + FONT_STEP) }
/** Decreases the editor font size by one step. */
export function editor_font_out(): void { editor_font_set(editor_font_get() - FONT_STEP) }
/** Resets the editor font size to the default. */
export function editor_font_reset(): void { editor_font_set(FONT_DEFAULT) }
