/**
 * Preferences — per-user IDE/editor customization (persisted in localStorage, applied live).
 * Separate from the per-project Game Settings editor. Covers interface scale, editor font,
 * theme/colors, and Monaco editor behavior.
 */

import { FloatingWindow } from '../window_manager.js'
import { ui_scale_get, ui_scale_set, editor_font_get, editor_font_set } from '../ui_scale.js'
import {
    editor_prefs_get, editor_prefs_set, editor_prefs_reset,
    THEME_OPTIONS, FONT_OPTIONS, type editor_prefs,
} from '../editor_prefs.js'
import { ide_theme_get, ide_theme_set, ide_accent_effective, ide_accent_set, IDE_THEMES } from '../ide_prefs.js'

let _win: FloatingWindow | null = null

/**
 * Opens (or focuses) the Preferences window.
 * @param workspace - IDE workspace element to mount into
 */
export function preferences_editor_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow('sw-preferences', 'Preferences', null, { x: 180, y: 50, w: 460, h: 560 })
    _win.on_close(() => { _win = null })
    _rebuild(_win.body)
    _win.mount(workspace)
}

/** Rebuilds the whole form (used after a Reset so every control reflects defaults). */
function _rebuild(body: HTMLElement): void {
    body.innerHTML = ''
    const p = editor_prefs_get()

    const root = document.createElement('div')
    root.style.cssText = 'padding:12px; overflow-y:auto; height:100%; display:flex; flex-direction:column; gap:16px;'

    // ── Interface (IDE chrome) ───────────────────────────────────────────
    root.appendChild(_section('Interface', [
        _field_number('Interface scale (%)', Math.round(ui_scale_get() * 100), 60, 300,
            v => ui_scale_set(v / 100)),
        _field_select('IDE theme', ide_theme_get(), IDE_THEMES.map(t => ({ value: t.id, label: t.label })),
            v => { ide_theme_set(v); _rebuild(body) }),   // rebuild so the accent swatch follows the theme
        _field_color('Accent color', ide_accent_effective(), v => ide_accent_set(v)),
    ]))

    // ── Font ─────────────────────────────────────────────────────────────
    root.appendChild(_section('Editor Font', [
        _field_number('Font size (px)', editor_font_get(), 8, 48, v => editor_font_set(v)),
        _field_select('Font family', p.fontFamily, FONT_OPTIONS.map(f => ({ value: f, label: _font_label(f) })),
            v => editor_prefs_set({ fontFamily: v })),
        _field_checkbox('Font ligatures', p.fontLigatures, v => editor_prefs_set({ fontLigatures: v })),
    ]))

    // ── Theme / colors ───────────────────────────────────────────────────
    root.appendChild(_section('Theme', [
        _field_select('Color theme', p.theme, THEME_OPTIONS.map(t => ({ value: t.id, label: t.label })),
            v => editor_prefs_set({ theme: v })),
    ]))

    // ── Editor behavior ──────────────────────────────────────────────────
    root.appendChild(_section('Editor', [
        _field_select('Tab size', String(p.tabSize), [
            { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' },
        ], v => editor_prefs_set({ tabSize: Number(v) })),
        _field_checkbox('Insert spaces (not tabs)', p.insertSpaces, v => editor_prefs_set({ insertSpaces: v })),
        _field_checkbox('Word wrap',               p.wordWrap,     v => editor_prefs_set({ wordWrap: v })),
        _field_checkbox('Minimap',                 p.minimap,      v => editor_prefs_set({ minimap: v })),
        _field_select('Line numbers', p.lineNumbers, [
            { value: 'on', label: 'On' }, { value: 'relative', label: 'Relative' }, { value: 'off', label: 'Off' },
        ], v => editor_prefs_set({ lineNumbers: v as editor_prefs['lineNumbers'] })),
        _field_select('Show whitespace', p.renderWhitespace, [
            { value: 'none', label: 'None' }, { value: 'boundary', label: 'Boundary' }, { value: 'all', label: 'All' },
        ], v => editor_prefs_set({ renderWhitespace: v as editor_prefs['renderWhitespace'] })),
        _field_select('Cursor blinking', p.cursorBlinking, [
            { value: 'blink', label: 'Blink' }, { value: 'smooth', label: 'Smooth' },
            { value: 'phase', label: 'Phase' }, { value: 'expand', label: 'Expand' }, { value: 'solid', label: 'Solid' },
        ], v => editor_prefs_set({ cursorBlinking: v as editor_prefs['cursorBlinking'] })),
        _field_checkbox('Bracket pair colors', p.bracketPairColorization, v => editor_prefs_set({ bracketPairColorization: v })),
        _field_checkbox('Indent guides',       p.indentGuides,           v => editor_prefs_set({ indentGuides: v })),
        _field_checkbox('Sticky scroll',        p.stickyScroll,           v => editor_prefs_set({ stickyScroll: v })),
    ]))

    // ── Reset ────────────────────────────────────────────────────────────
    const reset = document.createElement('button')
    reset.className = 'sw-btn'
    reset.textContent = 'Reset editor preferences to defaults'
    reset.style.cssText = 'align-self:flex-start; margin-top:4px;'
    reset.addEventListener('click', () => { editor_prefs_reset(); _rebuild(body) })
    root.appendChild(reset)

    body.appendChild(root)
}

/** Friendly label for a font-family stack (its first family name, unquoted). */
function _font_label(stack: string): string {
    const first = stack.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? stack
    return first === 'monospace' ? 'System monospace' : first
}

// =========================================================================
// Field helpers (match the Game Settings editor's look)
// =========================================================================

function _section(title: string, fields: HTMLElement[]): HTMLElement {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:6px;'
    const hdr = document.createElement('div')
    hdr.textContent = title
    hdr.style.cssText = `
        font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;
        color:var(--sw-text-dim); padding-bottom:4px; border-bottom:1px solid var(--sw-border2);`
    wrap.appendChild(hdr)
    fields.forEach(f => wrap.appendChild(f))
    return wrap
}

function _row(label: string, control: HTMLElement): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:8px;'
    const lbl = document.createElement('label')
    lbl.className = 'sw-label'
    lbl.textContent = label
    lbl.style.cssText += 'min-width:170px; flex-shrink:0; margin:0;'
    row.append(lbl, control)
    return row
}

function _field_number(label: string, value: number, min: number, max: number, on_change: (v: number) => void): HTMLElement {
    const inp = document.createElement('input')
    inp.className = 'sw-input'
    inp.type = 'number'; inp.min = String(min); inp.max = String(max); inp.value = String(value)
    inp.style.flex = '1'
    inp.addEventListener('change', () => {
        const n = Math.max(min, Math.min(max, Number(inp.value) || min))
        inp.value = String(n)
        on_change(n)
    })
    return _row(label, inp)
}

function _field_select(label: string, value: string, options: { value: string; label: string }[], on_change: (v: string) => void): HTMLElement {
    const sel = document.createElement('select')
    sel.className = 'sw-select'
    sel.style.flex = '1'
    for (const o of options) {
        const opt = document.createElement('option')
        opt.value = o.value; opt.textContent = o.label
        if (o.value === value) opt.selected = true
        sel.appendChild(opt)
    }
    sel.addEventListener('change', () => on_change(sel.value))
    return _row(label, sel)
}

function _field_checkbox(label: string, value: boolean, on_change: (v: boolean) => void): HTMLElement {
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.checked = value
    box.style.cssText = 'width:16px; height:16px; cursor:pointer;'
    box.addEventListener('change', () => on_change(box.checked))
    return _row(label, box)
}

function _field_color(label: string, value: string, on_change: (v: string) => void): HTMLElement {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'display:flex; align-items:center; gap:6px; flex:1;'
    const picker = document.createElement('input')
    picker.type = 'color'; picker.value = value
    picker.style.cssText = 'width:32px; height:24px; border:none; cursor:pointer; background:none; padding:0;'
    const hex = document.createElement('input')
    hex.className = 'sw-input'; hex.type = 'text'; hex.value = value.toUpperCase(); hex.maxLength = 7
    hex.style.cssText += 'flex:1; font-family:monospace; font-size:11px;'
    picker.addEventListener('input', () => { hex.value = picker.value.toUpperCase(); on_change(picker.value) })
    hex.addEventListener('change', () => {
        const v = hex.value.startsWith('#') ? hex.value : '#' + hex.value
        if (/^#[0-9a-fA-F]{6}$/.test(v)) { picker.value = v.toLowerCase(); hex.value = v.toUpperCase(); on_change(v.toLowerCase()) }
        else hex.value = picker.value.toUpperCase()
    })
    wrap.append(picker, hex)
    return _row(label, wrap)
}
