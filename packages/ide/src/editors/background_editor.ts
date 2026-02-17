/**
 * Background editor window.
 * Import a background image, configure tiling and smoothing settings.
 */

import { FloatingWindow }                                              from '../window_manager.js'
import { project_write_binary, project_read_file, project_write_file, project_has_folder, project_read_binary_url, project_file_exists } from '../services/project.js'
import { pixel_editor_open }                                           from './pixel_editor.js'
import { show_alert, show_prompt }                                     from '../services/dialogs.js'

// =========================================================================
// Types
// =========================================================================

interface background_data {
    file_name:  string    // stored image filename (e.g. "bg_sky.png")
    width:      number
    height:     number
    tile_h:     boolean
    tile_v:     boolean
    smooth:     boolean
    preload:    boolean
}

// =========================================================================
// Module state
// =========================================================================

const _open_editors = new Map<string, background_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a Background editor window for the given resource.
 * @param workspace - The IDE workspace element to mount into
 * @param bg_name - Resource name
 */
export function background_editor_open(workspace: HTMLElement, bg_name: string): void {
    const existing = _open_editors.get(bg_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new background_editor_window(workspace, bg_name)
    _open_editors.set(bg_name, ed)
    ed.on_closed(() => _open_editors.delete(bg_name))
}

// =========================================================================
// Editor window
// =========================================================================

class background_editor_window {
    private _win:     FloatingWindow
    private _name:    string
    private _data:    background_data
    private _canvas!: HTMLCanvasElement

    constructor(workspace: HTMLElement, name: string) {
        this._name = name
        this._data = {
            file_name: '',
            width:     0,
            height:    0,
            tile_h:    false,
            tile_v:    false,
            smooth:    false,
            preload:   true,
        }
        this._win = new FloatingWindow(
            `bg-${name}`, `Background: ${name}`, 'icons/background.svg',
            { x: 230, y: 90, w: 540, h: 400 }
        )
        this._build_ui()
        this._win.mount(workspace)
        this._load_data()
    }

    public bring_to_front(): void { this._win.bring_to_front() }
    public on_closed(cb: () => void): void { this._win.on_close(cb) }

    // -----------------------------------------------------------------------
    // Build UI
    // -----------------------------------------------------------------------

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;'

        // Toolbar
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'
        toolbar.appendChild(this._make_btn('Create Image…', () => this._create_image()))
        toolbar.appendChild(this._make_btn('Import Image…', () => this._import_image()))
        if (this._data.file_name) {
            toolbar.appendChild(this._make_btn('Edit', () => this._edit_image()))
        }
        body.appendChild(toolbar)

        // Main layout: preview left + props right
        const layout = document.createElement('div')
        layout.style.cssText = 'display:flex;flex:1;overflow:hidden;'

        // Preview area
        const preview = document.createElement('div')
        preview.className = 'sw-bg-preview'
        const canvas = document.createElement('canvas')
        canvas.className = 'sw-sprite-canvas'
        canvas.width = 1; canvas.height = 1
        this._canvas = canvas
        preview.appendChild(canvas)
        layout.appendChild(preview)

        // Props panel
        const props = document.createElement('div')
        props.className = 'sw-bg-props'
        props.appendChild(this._make_info_section())
        props.appendChild(this._make_props_section())
        layout.appendChild(props)

        body.appendChild(layout)
    }

    private _make_info_section(): HTMLElement {
        const sec = document.createElement('div')
        sec.className = 'sw-bg-section'
        const title = document.createElement('div')
        title.className = 'sw-bg-section-title'
        title.textContent = 'Image Info'
        sec.appendChild(title)

        const row = document.createElement('div')
        row.id = `bg-info-${this._name}`
        row.style.cssText = 'padding:4px 6px;font-size:11px;color:var(--sw-text-dim);'
        row.textContent = 'No image imported.'
        sec.appendChild(row)
        return sec
    }

    private _make_props_section(): HTMLElement {
        const sec = document.createElement('div')
        sec.className = 'sw-bg-section'
        const title = document.createElement('div')
        title.className = 'sw-bg-section-title'
        title.textContent = 'Properties'
        sec.appendChild(title)

        sec.appendChild(this._make_checkbox('Tile Horizontally', this._data.tile_h,
            (v) => { this._data.tile_h = v; this._save() }))
        sec.appendChild(this._make_checkbox('Tile Vertically', this._data.tile_v,
            (v) => { this._data.tile_v = v; this._save() }))
        sec.appendChild(this._make_checkbox('Smooth', this._data.smooth,
            (v) => { this._data.smooth = v; this._save() }))
        sec.appendChild(this._make_checkbox('Preload', this._data.preload,
            (v) => { this._data.preload = v; this._save() }))
        return sec
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private _make_btn(label: string, cb: () => void): HTMLButtonElement {
        const b = document.createElement('button')
        b.className = 'sw-btn'
        b.textContent = label
        b.addEventListener('click', cb)
        return b
    }

    private _make_checkbox(label: string, checked: boolean, cb: (v: boolean) => void): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-bg-prop-row'
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

    private _update_info(): void {
        const el = document.getElementById(`bg-info-${this._name}`)
        if (el) el.textContent = this._data.file_name
            ? `${this._data.file_name}  ${this._data.width}×${this._data.height}px`
            : 'No image imported.'
    }

    private _draw_image(data_url: string): void {
        const img = new Image()
        img.onload = () => {
            this._canvas.width  = img.naturalWidth
            this._canvas.height = img.naturalHeight
            const ctx = this._canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0)
        }
        img.src = data_url
    }

    // -----------------------------------------------------------------------
    // Create & Edit
    // -----------------------------------------------------------------------

    private async _create_image(): Promise<void> {
        if (!project_has_folder()) {
            await show_alert('Open a project folder first (File → Open…).')
            return
        }

        // Prompt for dimensions
        const w = await show_prompt('Image width (pixels):', '256')
        if (!w) return
        const h = await show_prompt('Image height (pixels):', '256')
        if (!h) return

        const width = Math.max(1, parseInt(w) || 256)
        const height = Math.max(1, parseInt(h) || 256)

        // Get workspace element - go up to find it
        let workspace = this._win.el.parentElement
        if (!workspace) {
            console.error('[Background Editor] No parent element found for pixel editor')
            await show_alert('Error: Could not open pixel editor')
            return
        }

        // Open pixel editor
        pixel_editor_open(
            workspace,
            width,
            height,
            null,
            (data_url) => this._save_created_image(data_url, width, height)
        )
    }

    private async _edit_image(): Promise<void> {
        if (!project_has_folder()) {
            await show_alert('Open a project folder first (File → Open…).')
            return
        }
        if (!this._data.file_name) return

        // Get workspace element
        let workspace = this._win.el.parentElement
        if (!workspace) {
            console.error('[Background Editor] No parent element found for pixel editor')
            await show_alert('Error: Could not open pixel editor')
            return
        }

        // Load current image and open in pixel editor
        try {
            const img_url = await this._load_binary_url(`backgrounds/${this._name}/${this._data.file_name}`)
            pixel_editor_open(
                workspace,
                this._data.width,
                this._data.height,
                img_url,
                (data_url) => this._save_edited_image(data_url)
            )
        } catch (err) {
            console.error('Failed to load background for editing:', err)
            await show_alert('Failed to load image for editing')
        }
    }

    private async _save_created_image(data_url: string, width: number, height: number): Promise<void> {
        const fname = `${this._name}.png`

        // Convert data URL to binary
        const blob = await fetch(data_url).then(r => r.blob())
        const arr = await blob.arrayBuffer()
        await project_write_binary(`backgrounds/${this._name}/${fname}`, new Uint8Array(arr))

        // Update data
        this._data.file_name = fname
        this._data.width = width
        this._data.height = height

        this._update_info()
        this._draw_image(data_url)
        this._save()

        // Rebuild UI to show Edit button
        this._win.body.innerHTML = ''
        this._build_ui()
        this._update_info()
        this._draw_image(data_url)
    }

    private async _save_edited_image(data_url: string): Promise<void> {
        if (!this._data.file_name) return

        // Convert data URL to binary
        const blob = await fetch(data_url).then(r => r.blob())
        const arr = await blob.arrayBuffer()
        await project_write_binary(`backgrounds/${this._name}/${this._data.file_name}`, new Uint8Array(arr))

        this._draw_image(data_url)
    }

    private async _load_binary_url(path: string): Promise<string> {
        return await project_read_binary_url(path)
    }

    // -----------------------------------------------------------------------
    // Import
    // -----------------------------------------------------------------------

    private async _import_image(): Promise<void> {
        if (!project_has_folder()) {
            await show_alert('Open a project folder first (File → Open…).')
            return
        }
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'image/*'
        inp.addEventListener('change', async () => {
            const file = inp.files?.[0]
            if (!file) return
            const ext   = file.name.split('.').pop() ?? 'png'
            const fname = `${this._name}.${ext}`
            const arr   = await file.arrayBuffer()
            await project_write_binary(`backgrounds/${this._name}/${fname}`, new Uint8Array(arr))

            const data_url = await this._file_to_data_url(file)
            const img      = await this._load_image(data_url)

            this._data.file_name = fname
            this._data.width     = img.naturalWidth
            this._data.height    = img.naturalHeight
            this._update_info()
            this._draw_image(data_url)
            this._save()
        })
        inp.click()
    }

    private _file_to_data_url(file: File): Promise<string> {
        return new Promise((res, rej) => {
            const reader = new FileReader()
            reader.onload = () => res(reader.result as string)
            reader.onerror = rej
            reader.readAsDataURL(file)
        })
    }

    private _load_image(src: string): Promise<HTMLImageElement> {
        return new Promise((res, rej) => {
            const img = new Image()
            img.onload  = () => res(img)
            img.onerror = rej
            img.src     = src
        })
    }

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    private async _load_data(): Promise<void> {
        const meta_path = `backgrounds/${this._name}/meta.json`

        // Check if meta.json exists before trying to read it
        const exists = await project_file_exists(meta_path)
        if (!exists) return  // No data yet, use defaults

        try {
            const raw = await project_read_file(meta_path)
            if (!raw) return
            const parsed = JSON.parse(raw) as Partial<background_data>
            Object.assign(this._data, parsed)
            // Rebuild UI so checkboxes reflect loaded values, then update info label.
            this._win.body.innerHTML = ''
            this._build_ui()
            this._update_info()
            // Load and display the image preview
            if (this._data.file_name) {
                try {
                    const img_url = await project_read_binary_url(`backgrounds/${this._name}/${this._data.file_name}`)
                    this._draw_image(img_url)
                } catch {
                    // Image file doesn't exist yet
                }
            }
        } catch { /* parsing error or other issue */ }
    }

    private async _save(): Promise<void> {
        if (!project_has_folder()) return
        await project_write_file(
            `backgrounds/${this._name}/meta.json`,
            JSON.stringify(this._data, null, 2)
        )
    }
}
