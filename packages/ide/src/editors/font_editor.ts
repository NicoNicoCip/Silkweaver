/**
 * Font editor window.
 * Configure font family, size, style and preview text rendering.
 */

import { FloatingWindow }                                from '../window_manager.js'
import { ICON } from "../icons.js"
import { project_read_file, project_write_file, project_has_folder, project_list_dir, project_read_binary_url } from '../services/project.js'
import { doc_register, doc_confirm_close, type doc_handle } from '../services/documents.js'
import { tooltip_attach }                                from '../services/tooltip.js'

/**
 * Family options that render the same for every player. There is deliberately NO list of installed
 * system fonts (Arial, Georgia, …): a named family the player doesn't have would silently fall back,
 * so it's a trap. To use a specific font, bundle a font file (see the bundled-font scan). These
 * generics are the only non-bundled options — every OS provides them — and serve as the default.
 */
const FONT_FAMILIES: string[] = ['sans-serif', 'serif', 'monospace']

/** Font-file extensions detected as a bundled font in a font resource's folder. */
const FONT_FILE_RE = /\.(ttf|otf|woff2?)$/i

// =========================================================================
// Types
// =========================================================================

interface font_range {
    from: number   // char code start
    to:   number   // char code end (inclusive)
}

interface font_data {
    font_name: string     // CSS font-family name or web font URL
    size:      number     // pt/px size
    bold:      boolean
    italic:    boolean
    aa:        boolean    // anti-aliasing
    ranges:    font_range[]
}

// =========================================================================
// Module state
// =========================================================================

const _open_editors = new Map<string, font_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a Font editor window for the given resource.
 * @param workspace - The IDE workspace element to mount into
 * @param font_name - Resource name
 */
export function font_editor_open(workspace: HTMLElement, font_name: string): void {
    const existing = _open_editors.get(font_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new font_editor_window(workspace, font_name)
    _open_editors.set(font_name, ed)
    ed.on_closed(() => _open_editors.delete(font_name))
}

// =========================================================================
// Editor window
// =========================================================================

class font_editor_window {
    private _win:        FloatingWindow
    private _name:       string
    private _data:       font_data
    private _doc:        doc_handle | null = null
    private _preview_el!: HTMLElement
    private _range_list!: HTMLElement
    private _bundled:    string | null = null   // a font file in fonts/<name>/, registered under <name>

    constructor(workspace: HTMLElement, name: string) {
        this._name = name
        this._data = {
            font_name: 'sans-serif',
            size:      12,
            bold:      false,
            italic:    false,
            aa:        true,
            ranges:    [{ from: 32, to: 127 }],
        }
        this._win = new FloatingWindow(
            `fnt-${name}`, `Font: ${name}`, ICON.font,
            { x: 240, y: 100, w: 500, h: 380 }
        )
        this._build_ui()
        this._win.mount(workspace)
        this._doc = doc_register({
            id: `fonts/${name}`, label: `Font: ${name}`, window: this._win,
            flush: () => this._flush_to_disk(),
        })
        this._win.on_before_close(() => this._doc ? doc_confirm_close(this._doc, `Font: ${this._name}`) : true)
        this._load_data()
    }

    public bring_to_front(): void { this._win.bring_to_front() }
    public on_closed(cb: () => void): void { this._win.on_close(() => { this._doc?.dispose(); cb() }) }

    // -----------------------------------------------------------------------
    // Build UI
    // -----------------------------------------------------------------------

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

        // Layout: props left + preview right
        const layout = document.createElement('div')
        layout.style.cssText = 'display:flex;flex:1;overflow:hidden;'

        layout.appendChild(this._build_props_panel())
        layout.appendChild(this._build_preview_panel())

        body.appendChild(layout)
    }

    private _build_props_panel(): HTMLElement {
        const panel = document.createElement('div')
        panel.className = 'sw-font-props'

        // Font family
        panel.appendChild(this._make_section_title('Font'))
        panel.appendChild(this._make_family_field())
        panel.appendChild(this._make_number_field('Size (pt)', this._data.size, 4, 256,
            (v) => { this._data.size = v; this._update_preview(); this._save() }))
        panel.appendChild(this._make_checkbox('Bold', this._data.bold,
            (v) => { this._data.bold = v; this._update_preview(); this._save() }))
        panel.appendChild(this._make_checkbox('Italic', this._data.italic,
            (v) => { this._data.italic = v; this._update_preview(); this._save() }))
        panel.appendChild(this._make_checkbox('Anti-alias', this._data.aa,
            (v) => { this._data.aa = v; this._save() }))

        // Character ranges
        panel.appendChild(this._make_section_title('Character Ranges'))
        const range_list = document.createElement('div')
        range_list.className = 'sw-font-ranges'
        this._range_list = range_list
        panel.appendChild(range_list)
        this._render_ranges()

        const add_range_btn = document.createElement('button')
        add_range_btn.className = 'sw-btn'
        add_range_btn.style.margin = '4px 6px'
        add_range_btn.textContent = '+ Add Range'
        add_range_btn.addEventListener('click', () => {
            this._data.ranges.push({ from: 32, to: 127 })
            this._render_ranges()
            this._save()
        })
        panel.appendChild(add_range_btn)

        return panel
    }

    private _build_preview_panel(): HTMLElement {
        const panel = document.createElement('div')
        panel.className = 'sw-font-preview-panel'

        const title = document.createElement('div')
        title.className = 'sw-bg-section-title'
        title.textContent = 'Preview'
        panel.appendChild(title)

        const preview = document.createElement('div')
        preview.className = 'sw-font-preview'
        preview.contentEditable = 'true'
        preview.textContent = 'The quick brown fox jumps over the lazy dog.\n0123456789 !@#$%^&*()'
        this._preview_el = preview
        this._update_preview()
        panel.appendChild(preview)

        return panel
    }

    // -----------------------------------------------------------------------
    // Range rendering
    // -----------------------------------------------------------------------

    private _render_ranges(): void {
        this._range_list.innerHTML = ''
        this._data.ranges.forEach((range, idx) => {
            const row = document.createElement('div')
            row.className = 'sw-font-range-row'

            const from_inp = this._small_number_input(range.from, 0, 65535, (v) => {
                range.from = v; this._save()
            })
            const to_inp = this._small_number_input(range.to, 0, 65535, (v) => {
                range.to = v; this._save()
            })

            const sep = document.createElement('span')
            sep.textContent = '–'
            sep.style.cssText = 'color:var(--sw-text-dim);margin:0 2px;'

            const del_btn = document.createElement('button')
            del_btn.className = 'sw-x-btn'
            del_btn.title = 'Remove range'
            del_btn.style.cssText = 'margin-left:auto;'
            del_btn.textContent = '✕'
            del_btn.addEventListener('click', () => {
                this._data.ranges.splice(idx, 1)
                this._render_ranges()
                this._save()
            })

            row.append(from_inp, sep, to_inp, del_btn)
            this._range_list.appendChild(row)
        })
    }

    private _small_number_input(val: number, min: number, max: number, cb: (v: number) => void): HTMLInputElement {
        const inp = document.createElement('input')
        inp.type = 'number'
        inp.className = 'sw-input'
        inp.style.cssText = 'width:60px;padding:2px 4px;'
        inp.min = String(min); inp.max = String(max)
        inp.value = String(val)
        inp.addEventListener('change', () => { const v = parseInt(inp.value); if (!isNaN(v)) cb(v) })
        return inp
    }

    // -----------------------------------------------------------------------
    // Preview update
    // -----------------------------------------------------------------------

    private _update_preview(): void {
        if (!this._preview_el) return
        let style = `font-family:${this._data.font_name},sans-serif;font-size:${this._data.size}px;`
        if (this._data.bold)   style += 'font-weight:bold;'
        if (this._data.italic) style += 'font-style:italic;'
        this._preview_el.style.cssText = style +
            'padding:12px;flex:1;overflow:auto;color:var(--sw-text);white-space:pre-wrap;outline:none;'
    }

    // -----------------------------------------------------------------------
    // Helpers — form widgets
    // -----------------------------------------------------------------------

    private _make_section_title(text: string): HTMLElement {
        const el = document.createElement('div')
        el.className = 'sw-bg-section-title'
        el.textContent = text
        return el
    }

    /**
     * The font Family picker. Every option renders the same for every player: a bundled font file
     * (top, if one was dropped in this font's folder) and the generic families. There is no
     * installed-system-font picking — to use a specific font, bundle it as a file.
     */
    private _make_family_field(): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-font-row'
        const lbl = document.createElement('label')
        lbl.className = 'sw-label'
        lbl.textContent = 'Family'
        lbl.classList.add('sw-has-help')

        const sel = document.createElement('select')
        sel.className = 'sw-select'

        // A bundled font file (dropped in this font's folder) is the first option, registered under
        // the resource name — same as the build does, so the preview and the shipped game match.
        if (this._bundled) {
            const o = document.createElement('option')
            o.value = this._name; o.textContent = `📄 ${this._bundled}`; o.style.fontFamily = this._name
            if (this._data.font_name === this._name) o.selected = true
            sel.appendChild(o)
        }

        // Generic families + the saved value if it's something else (so old settings still round-trip).
        const cur = this._data.font_name
        const families = [...FONT_FAMILIES]
        if (cur && !(this._bundled && cur === this._name) && !families.includes(cur)) families.unshift(cur)
        for (const fam of families) {
            const o = document.createElement('option')
            o.value = fam; o.textContent = fam; o.style.fontFamily = fam
            if (fam === cur) o.selected = true
            sel.appendChild(o)
        }

        sel.addEventListener('change', () => {
            this._data.font_name = sel.value
            this._update_preview(); this._save()
        })

        row.append(lbl, sel)
        tooltip_attach(row, 'The text font. To use a specific font, drop a font file (.ttf/.otf/.woff) into this font’s folder — it bundles with the game and shows at the top here. The generics render with whatever the player’s OS provides.')
        return row
    }

    private _make_number_field(label: string, val: number, min: number, max: number, cb: (v: number) => void): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-font-row'
        const lbl = document.createElement('label')
        lbl.className = 'sw-label'
        lbl.textContent = label
        const inp = document.createElement('input')
        inp.type = 'number'
        inp.className = 'sw-input'
        inp.min = String(min); inp.max = String(max)
        inp.value = String(val)
        inp.addEventListener('change', () => { const v = parseInt(inp.value); if (!isNaN(v)) cb(v) })
        row.append(lbl, inp)
        return row
    }

    private _make_checkbox(label: string, checked: boolean, cb: (v: boolean) => void): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-font-row'
        const lbl = document.createElement('label')
        lbl.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
        const chk = document.createElement('input')
        chk.type = 'checkbox'
        chk.className = 'sw-checkbox'
        chk.checked = checked
        chk.addEventListener('change', () => cb(chk.checked))
        lbl.append(chk, document.createTextNode(label))
        row.appendChild(lbl)
        return row
    }

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    private async _load_data(): Promise<void> {
        // Load saved settings (if any).
        try {
            const raw = await project_read_file(`fonts/${this._name}/meta.json`)
            if (raw) Object.assign(this._data, JSON.parse(raw) as Partial<font_data>)
        } catch { /* no saved data yet */ }
        // Detect a bundled font file dropped into this font's folder — it's offered in the dropdown
        // and registered under the resource name (matching what the build does for the shipped game).
        try {
            const files = await project_list_dir(`fonts/${this._name}`)
            this._bundled = files.find(f => FONT_FILE_RE.test(f)) ?? null
        } catch { this._bundled = null }
        // Rebuild UI so controls + the bundled option reflect the loaded state.
        this._win.body.innerHTML = ''
        this._build_ui()
        // Load the bundled face so the preview can render it (async — refreshes the preview when ready).
        if (this._bundled) void this._load_bundled_face(this._bundled)
    }

    /** Loads a bundled font file under the resource-name family so the preview renders it. */
    private async _load_bundled_face(file: string): Promise<void> {
        try {
            const url = await project_read_binary_url(`fonts/${this._name}/${file}`)
            const face = new FontFace(this._name, `url("${url}")`)
            await face.load()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(document as any).fonts.add(face)
            this._update_preview()
        } catch (e) { console.warn('[font editor] failed to load bundled font:', e) }
    }

    private async _save(): Promise<void> { this._doc?.mark_dirty() }

    private async _flush_to_disk(): Promise<void> {
        if (!project_has_folder()) return
        await project_write_file(
            `fonts/${this._name}/meta.json`,
            JSON.stringify(this._data, null, 2)
        )
    }
}
