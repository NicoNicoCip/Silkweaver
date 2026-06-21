/**
 * Preferences — per-user IDE/editor customization (persisted in localStorage, applied live).
 * Separate from the per-project Game Settings editor.
 *
 * Laid out as a category sidebar (Interface / Font / Code Editor / Tools / Keyboard Shortcuts) with a
 * one-line description under every option, so it stays readable as it grows. Keyboard Shortcuts is a
 * read-only reference of every IDE/editor binding (remapping is a planned follow-up).
 */

import { FloatingWindow } from '../window_manager.js'
import { ui_scale_get, ui_scale_set, editor_font_get, editor_font_set } from '../ui_scale.js'
import {
    editor_prefs_get, editor_prefs_set, editor_prefs_reset,
    THEME_OPTIONS, FONT_OPTIONS, type editor_prefs,
} from '../editor_prefs.js'
import { ide_theme_get, ide_theme_set, ide_accent_effective, ide_accent_set, IDE_THEMES } from '../ide_prefs.js'
import { ext_image_editor_get, ext_image_editor_set } from '../external_tools.js'
import { KEYBINDS } from '../keybinds.js'
import { tooltip_attach } from '../services/tooltip.js'

let _win: FloatingWindow | null = null
let _active_cat = 'interface'   // remembered across live rebuilds (e.g. after a theme change)

/**
 * Opens (or focuses) the Preferences window.
 * @param workspace - IDE workspace element to mount into
 */
export function preferences_editor_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow('sw-preferences', 'Preferences', null, { x: 180, y: 50, w: 540, h: 580 })
    _win.on_close(() => { _win = null })
    _rebuild(_win.body)
    _win.mount(workspace)
}

// =========================================================================
// Categories
// =========================================================================

interface category { id: string; label: string; build: () => HTMLElement }

const CATEGORIES: category[] = [
    { id: 'interface', label: 'Interface',          build: _panel_interface },
    { id: 'font',      label: 'Font',               build: _panel_font },
    { id: 'code',      label: 'Code Editor',        build: _panel_code },
    { id: 'tools',     label: 'External Tools',     build: _panel_tools },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', build: _panel_shortcuts },
]

/** Rebuilds the whole window: sidebar + content + footer. Used on open and after a live theme change. */
function _rebuild(body: HTMLElement): void {
    body.innerHTML = ''
    body.style.cssText = 'display:flex; flex-direction:column; height:100%; overflow:hidden;'

    const main = document.createElement('div')
    main.style.cssText = 'display:flex; flex:1; min-height:0;'

    // ── Sidebar ──────────────────────────────────────────────────────────
    const nav = document.createElement('div')
    nav.style.cssText = 'width:140px; flex-shrink:0; border-right:1px solid var(--sw-border2); padding:8px 6px; overflow-y:auto; display:flex; flex-direction:column; gap:2px;'

    const content = document.createElement('div')
    content.style.cssText = 'flex:1; min-width:0; padding:12px 14px; overflow-y:auto;'

    const nav_btns = new Map<string, HTMLButtonElement>()
    const select = (id: string): void => {
        _active_cat = id
        for (const [cid, b] of nav_btns) b.classList.toggle('active', cid === id)
        content.innerHTML = ''
        content.appendChild((CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0]!).build())
        content.scrollTop = 0
    }

    for (const cat of CATEGORIES) {
        const b = document.createElement('button')
        b.className = 'sw-pref-cat'
        b.textContent = cat.label
        b.addEventListener('click', () => select(cat.id))
        nav_btns.set(cat.id, b)
        nav.appendChild(b)
    }

    main.append(nav, content)

    // ── Footer (reset) ───────────────────────────────────────────────────
    const footer = document.createElement('div')
    footer.style.cssText = 'border-top:1px solid var(--sw-border2); padding:8px 14px; display:flex;'
    const reset = document.createElement('button')
    reset.className = 'sw-btn'
    reset.textContent = 'Reset editor preferences to defaults'
    reset.addEventListener('click', () => { editor_prefs_reset(); _rebuild(body) })
    footer.appendChild(reset)

    body.append(main, footer)

    if (!CATEGORIES.some(c => c.id === _active_cat)) _active_cat = 'interface'
    select(_active_cat)
}

// =========================================================================
// Category panels
// =========================================================================

function _panel_interface(): HTMLElement {
    const p = editor_prefs_get()
    const stack = _stack([
        _field_number('Interface scale (%)', Math.round(ui_scale_get() * 100), 60, 300, v => ui_scale_set(v / 100),
            'Size of the entire IDE — all panels, menus, and text.'),
        _field_select('IDE theme', ide_theme_get(), IDE_THEMES.map(t => ({ value: t.id, label: t.label })),
            v => { ide_theme_set(v); if (_win) _rebuild(_win.body) },   // rebuild so the accent swatch follows the theme
            'Overall color scheme for the IDE chrome (panels, menus, toolbars).'),
        _field_color('Accent color', ide_accent_effective(), v => ide_accent_set(v),
            'Highlight color used for selections, the active item, and focus rings.'),
    ])
    stack.appendChild(_subhead('Help tooltips'))
    stack.append(
        _field_checkbox('Show help tooltips', p.tooltips, v => editor_prefs_set({ tooltips: v }),
            'Show these hover explanations on settings and preferences items. Turn off to hide them.'),
        _field_number('Tooltip delay (ms)', p.tooltipDelay, 0, 3000, v => editor_prefs_set({ tooltipDelay: v }),
            'How long to rest the pointer on an item before its help tooltip appears.'),
    )
    stack.appendChild(_subhead('Saving'))
    stack.append(
        _field_checkbox('Auto-save', p.autoSave, v => editor_prefs_set({ autoSave: v }),
            'On: the IDE saves automatically when you close a window and periodically in the background. ' +
            'Off (default): edits are kept until you press Ctrl+S — a ● marks unsaved windows and you’re asked before closing.'),
    )
    return stack
}

function _panel_font(): HTMLElement {
    const p = editor_prefs_get()
    return _stack([
        _field_number('Font size (px)', editor_font_get(), 8, 48, v => editor_font_set(v),
            'Text size in the code editor.'),
        _field_select('Font family', p.fontFamily, FONT_OPTIONS.map(f => ({ value: f, label: _font_label(f) })),
            v => editor_prefs_set({ fontFamily: v }),
            'Typeface used for code.'),
        _field_checkbox('Font ligatures', p.fontLigatures, v => editor_prefs_set({ fontLigatures: v }),
            'Combine glyphs like => and != into a single symbol (when the font supports it).'),
    ])
}

function _panel_code(): HTMLElement {
    const p = editor_prefs_get()
    const stack = _stack([])
    stack.appendChild(_subhead('Editing'))
    stack.append(
        _field_select('Color theme', p.theme, THEME_OPTIONS.map(t => ({ value: t.id, label: t.label })),
            v => editor_prefs_set({ theme: v }),
            'Syntax-highlighting colors for code.'),
        _field_select('Tab size', String(p.tabSize), [
            { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' },
        ], v => editor_prefs_set({ tabSize: Number(v) }),
            'How many spaces one indentation level is.'),
        _field_checkbox('Insert spaces (not tabs)', p.insertSpaces, v => editor_prefs_set({ insertSpaces: v }),
            'Indent with spaces instead of tab characters.'),
        _field_checkbox('Word wrap', p.wordWrap, v => editor_prefs_set({ wordWrap: v }),
            'Wrap long lines instead of scrolling sideways.'),
        _field_checkbox('Auto-organize object files', p.autoOrganizeObjects, v => editor_prefs_set({ autoOrganizeObjects: v }),
            'On open, reorder an object class into metadata → variables → events.'),
    )
    stack.appendChild(_subhead('Display'))
    stack.append(
        _field_checkbox('Minimap', p.minimap, v => editor_prefs_set({ minimap: v }),
            'Show the zoomed-out code overview on the right edge.'),
        _field_select('Line numbers', p.lineNumbers, [
            { value: 'on', label: 'On' }, { value: 'relative', label: 'Relative' }, { value: 'off', label: 'Off' },
        ], v => editor_prefs_set({ lineNumbers: v as editor_prefs['lineNumbers'] }),
            'Gutter numbering — absolute, relative to the caret, or hidden.'),
        _field_select('Show whitespace', p.renderWhitespace, [
            { value: 'none', label: 'None' }, { value: 'boundary', label: 'Boundary' }, { value: 'all', label: 'All' },
        ], v => editor_prefs_set({ renderWhitespace: v as editor_prefs['renderWhitespace'] }),
            'Render spaces and tabs as faint marks.'),
        _field_select('Cursor blinking', p.cursorBlinking, [
            { value: 'blink', label: 'Blink' }, { value: 'smooth', label: 'Smooth' },
            { value: 'phase', label: 'Phase' }, { value: 'expand', label: 'Expand' }, { value: 'solid', label: 'Solid' },
        ], v => editor_prefs_set({ cursorBlinking: v as editor_prefs['cursorBlinking'] }),
            'Caret blink animation.'),
        _field_checkbox('Bracket pair colors', p.bracketPairColorization, v => editor_prefs_set({ bracketPairColorization: v }),
            'Tint matching brackets so nesting is easier to read.'),
        _field_checkbox('Indent guides', p.indentGuides, v => editor_prefs_set({ indentGuides: v }),
            'Vertical lines marking each indentation level.'),
        _field_checkbox('Sticky scroll', p.stickyScroll, v => editor_prefs_set({ stickyScroll: v }),
            'Pin the enclosing scope (class/function header) to the top while scrolling.'),
    )
    return stack
}

function _panel_tools(): HTMLElement {
    return _stack([
        _field_text('Image editor', ext_image_editor_get(), 'C:\\…\\Aseprite.exe  (empty = OS default app)',
            v => ext_image_editor_set(v),
            'External app used to open sprite/background images. Leave empty to use the OS default.'),
    ])
}

function _panel_shortcuts(): HTMLElement {
    const stack = _stack([])

    const intro = document.createElement('div')
    intro.textContent = 'Every IDE and code-editor shortcut. Reference only for now.'
    intro.style.cssText = 'font-size:11px; color:var(--sw-text-dim); margin-bottom:8px;'
    stack.appendChild(intro)

    const search = document.createElement('input')
    search.className = 'sw-input'
    search.type = 'text'
    search.placeholder = 'Filter shortcuts…'
    search.style.cssText = 'width:100%; margin-bottom:10px;'
    stack.appendChild(search)

    const list = document.createElement('div')
    stack.appendChild(list)

    const render = (filter: string): void => {
        const q = filter.trim().toLowerCase()
        list.innerHTML = ''
        for (const grp of KEYBINDS) {
            const binds = q
                ? grp.binds.filter(b => b.label.toLowerCase().includes(q) || b.keys.toLowerCase().includes(q) || (b.desc?.toLowerCase().includes(q) ?? false))
                : grp.binds
            if (binds.length === 0) continue
            list.appendChild(_subhead(grp.group))
            for (const b of binds) list.appendChild(_keybind_row(b.keys, b.label, b.desc))
        }
        if (!list.children.length) {
            const none = document.createElement('div')
            none.textContent = 'No shortcuts match.'
            none.style.cssText = 'font-size:11px; color:var(--sw-text-dim); padding:8px 0;'
            list.appendChild(none)
        }
    }
    search.addEventListener('input', () => render(search.value))
    render('')
    return stack
}

// =========================================================================
// Building blocks
// =========================================================================

/** A vertical stack with consistent spacing, optionally pre-filled. */
function _stack(children: HTMLElement[]): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'display:flex; flex-direction:column; gap:10px;'
    children.forEach(c => el.appendChild(c))
    return el
}

/** A small uppercase sub-section header (used within a category panel). */
function _subhead(text: string): HTMLElement {
    const h = document.createElement('div')
    h.textContent = text
    h.style.cssText = `
        font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;
        color:var(--sw-text-dim); padding-bottom:4px; margin-top:6px;
        border-bottom:1px solid var(--sw-border2);`
    return h
}

/** One shortcut entry: a key combo on the left, what it does on the right. */
function _keybind_row(keys: string, label: string, desc?: string): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:baseline; gap:10px; padding:3px 0;'
    const kbd = document.createElement('kbd')
    kbd.textContent = keys
    kbd.style.cssText = `
        flex-shrink:0; min-width:104px; font-family:Consolas,monospace; font-size:11px;
        background:var(--sw-bg2,#222); border:1px solid var(--sw-border2); border-radius:3px;
        padding:1px 6px; color:var(--sw-text);`
    const txt = document.createElement('div')
    txt.style.cssText = 'flex:1; font-size:12px; line-height:1.35;'
    txt.textContent = label
    if (desc) {
        const d = document.createElement('div')
        d.textContent = desc
        d.style.cssText = 'font-size:10.5px; color:var(--sw-text-dim); margin-top:1px;'
        txt.appendChild(d)
    }
    row.append(kbd, txt)
    return row
}

/** Friendly label for a font-family stack (its first family name, unquoted). */
function _font_label(stack: string): string {
    const first = stack.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? stack
    return first === 'monospace' ? 'System monospace' : first
}

// =========================================================================
// Field rows (label + control + description)
// =========================================================================

function _row(label: string, control: HTMLElement, desc?: string): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:8px; min-height:24px;'
    const lbl = document.createElement('label')
    lbl.className = 'sw-label'
    lbl.textContent = label
    lbl.style.cssText += 'min-width:180px; flex-shrink:0; margin:0;'
    row.append(lbl, control)
    if (desc) { lbl.classList.add('sw-has-help'); tooltip_attach(row, desc) }
    return row
}

function _field_number(label: string, value: number, min: number, max: number, on_change: (v: number) => void, desc?: string): HTMLElement {
    const inp = document.createElement('input')
    inp.className = 'sw-input'
    inp.type = 'number'; inp.min = String(min); inp.max = String(max); inp.value = String(value)
    inp.style.flex = '1'
    inp.addEventListener('change', () => {
        const n = Math.max(min, Math.min(max, Number(inp.value) || min))
        inp.value = String(n)
        on_change(n)
    })
    return _row(label, inp, desc)
}

function _field_select(label: string, value: string, options: { value: string; label: string }[], on_change: (v: string) => void, desc?: string): HTMLElement {
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
    return _row(label, sel, desc)
}

function _field_checkbox(label: string, value: boolean, on_change: (v: boolean) => void, desc?: string): HTMLElement {
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.checked = value
    box.style.cssText = 'width:16px; height:16px; cursor:pointer;'
    box.addEventListener('change', () => on_change(box.checked))
    return _row(label, box, desc)
}

function _field_text(label: string, value: string, placeholder: string, on_change: (v: string) => void, desc?: string): HTMLElement {
    const inp = document.createElement('input')
    inp.className = 'sw-input'; inp.type = 'text'; inp.value = value; inp.placeholder = placeholder
    inp.title = placeholder
    inp.style.cssText += 'flex:1; min-width:0; font-size:11px;'
    inp.addEventListener('change', () => on_change(inp.value))
    return _row(label, inp, desc)
}

function _field_color(label: string, value: string, on_change: (v: string) => void, desc?: string): HTMLElement {
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
    return _row(label, wrap, desc)
}
