/**
 * Color constants, constructors, and component extractors.
 * Colors are stored as BGR integers (GMS convention) but converted to RGB when needed.
 *
 * GMS color format: 0xBBGGRR (blue in high byte, red in low byte)
 */

// =========================================================================
// Color constants (GMS BGR format)
// =========================================================================

export const c_aqua    = 0xFFFF00  // Aqua / Cyan
export const c_black   = 0x000000  // Black
export const c_blue    = 0xFF0000  // Blue
export const c_dkgray  = 0x404040  // Dark gray
export const c_fuchsia = 0xFF00FF  // Fuchsia / Magenta
export const c_gray    = 0x808080  // Gray
export const c_green   = 0x008000  // Green (dark)
export const c_lime    = 0x00FF00  // Lime (bright green)
export const c_ltgray  = 0xC0C0C0  // Light gray
export const c_maroon  = 0x000080  // Maroon
export const c_navy    = 0x800000  // Navy
export const c_olive   = 0x008080  // Olive
export const c_orange  = 0x0080FF  // Orange
export const c_purple  = 0x800080  // Purple
export const c_red     = 0x0000FF  // Red
export const c_silver  = 0xC0C0C0  // Silver
export const c_teal    = 0x808000  // Teal
export const c_white   = 0xFFFFFF  // White
export const c_yellow  = 0x00FFFF  // Yellow

// =========================================================================
// Blend mode constants
// =========================================================================

export const bm_normal   = 0  // Standard alpha blend
export const bm_add      = 1  // Additive (fire, glow)
export const bm_max      = 2  // Maximum component
export const bm_subtract = 3  // Subtractive

// =========================================================================
// Font alignment constants
// =========================================================================

export const fa_left   = 0  // Horizontal: left-align
export const fa_center = 1  // Horizontal: center-align
export const fa_right  = 2  // Horizontal: right-align
export const fa_top    = 0  // Vertical: top-align
export const fa_middle = 1  // Vertical: middle-align
export const fa_bottom = 2  // Vertical: bottom-align

// =========================================================================
// Color construction
// =========================================================================

/**
 * Creates a BGR color integer from individual RGB components (0–255).
 * @param r - Red component (0–255)
 * @param g - Green component (0–255)
 * @param b - Blue component (0–255)
 * @returns BGR integer
 */
export function make_color_rgb(r: number, g: number, b: number): number {
    r = Math.max(0, Math.min(255, Math.round(r)))
    g = Math.max(0, Math.min(255, Math.round(g)))
    b = Math.max(0, Math.min(255, Math.round(b)))
    return (b << 16) | (g << 8) | r
}

/**
 * Creates a BGR color from hue, saturation, value (all 0–255).
 * @param h - Hue (0–255)
 * @param s - Saturation (0–255)
 * @param v - Value/Brightness (0–255)
 * @returns BGR integer
 */
export function make_color_hsv(h: number, s: number, v: number): number {
    h = (h / 255) * 360
    s = s / 255
    v = v / 255

    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c

    let r = 0, g = 0, b = 0
    if (h < 60)       { r = c; g = x; b = 0 }
    else if (h < 120) { r = x; g = c; b = 0 }
    else if (h < 180) { r = 0; g = c; b = x }
    else if (h < 240) { r = 0; g = x; b = c }
    else if (h < 300) { r = x; g = 0; b = c }
    else              { r = c; g = 0; b = x }

    return make_color_rgb(
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    )
}

// =========================================================================
// Color component extraction
// =========================================================================

/**
 * Returns the red component (0–255) of a BGR color.
 * @param col - BGR integer
 */
export function color_get_red(col: number): number {
    return col & 0xFF
}

/**
 * Returns the green component (0–255) of a BGR color.
 * @param col - BGR integer
 */
export function color_get_green(col: number): number {
    return (col >> 8) & 0xFF
}

/**
 * Returns the blue component (0–255) of a BGR color.
 * @param col - BGR integer
 */
export function color_get_blue(col: number): number {
    return (col >> 16) & 0xFF
}

/**
 * Linearly blends two BGR colors.
 * @param col1 - First BGR color
 * @param col2 - Second BGR color
 * @param amount - Blend factor (0 = col1, 1 = col2)
 * @returns Blended BGR color
 */
export function merge_color(col1: number, col2: number, amount: number): number {
    amount = Math.max(0, Math.min(1, amount))
    const r1 = color_get_red(col1),   r2 = color_get_red(col2)
    const g1 = color_get_green(col1), g2 = color_get_green(col2)
    const b1 = color_get_blue(col1),  b2 = color_get_blue(col2)
    return make_color_rgb(
        r1 + (r2 - r1) * amount,
        g1 + (g2 - g1) * amount,
        b1 + (b2 - b1) * amount
    )
}

/**
 * Converts a BGR integer color to normalized [r, g, b] components (0–1 each).
 * @param col - BGR integer
 * @returns [r, g, b] normalized
 */
export function color_to_rgb_normalized(col: number): [number, number, number] {
    return [
        color_get_red(col)   / 255,
        color_get_green(col) / 255,
        color_get_blue(col)  / 255
    ]
}

/** Returns the hue (0–255) of a BGR color. */
export function color_get_hue(col: number): number {
    const r = color_get_red(col) / 255, g = color_get_green(col) / 255, b = color_get_blue(col) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
    let h = 0
    if (d !== 0) {
        if      (max === r) h = ((g - b) / d) % 6
        else if (max === g) h = (b - r) / d + 2
        else                h = (r - g) / d + 4
        h *= 60
        if (h < 0) h += 360
    }
    return Math.round((h / 360) * 255)
}

/** Returns the saturation (0–255) of a BGR color. */
export function color_get_saturation(col: number): number {
    const r = color_get_red(col), g = color_get_green(col), b = color_get_blue(col)
    const max = Math.max(r, g, b)
    return max === 0 ? 0 : Math.round(((max - Math.min(r, g, b)) / max) * 255)
}

/** Returns the value/brightness (0–255) of a BGR color. */
export function color_get_value(col: number): number {
    return Math.max(color_get_red(col), color_get_green(col), color_get_blue(col))
}

// =========================================================================
// British-spelling aliases (GMS accepts both `color` and `colour`)
// =========================================================================

export const make_colour_rgb        = make_color_rgb
export const make_colour_hsv        = make_color_hsv
export const colour_get_red         = color_get_red
export const colour_get_green       = color_get_green
export const colour_get_blue        = color_get_blue
export const colour_get_hue         = color_get_hue
export const colour_get_saturation  = color_get_saturation
export const colour_get_value       = color_get_value
export const merge_colour           = merge_color
