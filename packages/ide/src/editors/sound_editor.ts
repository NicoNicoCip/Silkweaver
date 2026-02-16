/**
 * Sound editor window.
 * Import audio files, set playback properties, preview playback.
 */

import { FloatingWindow }                                              from '../window_manager.js'
import { project_write_binary, project_read_file, project_write_file, project_has_folder } from '../services/project.js'

// =========================================================================
// Types
// =========================================================================

type sound_kind = 'normal' | 'background' | '3d' | 'positional'

interface sound_data {
    kind:        sound_kind
    file_name:   string     // stored audio filename in project (e.g. "snd_jump.ogg")
    volume:      number     // 0–1
    pitch:       number     // 0.5–2
    preload:     boolean
    streaming:   boolean
}

// =========================================================================
// Module state
// =========================================================================

const _open_editors = new Map<string, sound_editor_window>()

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) a Sound editor window for the given sound resource.
 * @param workspace - The IDE workspace element to mount into
 * @param sound_name - Resource name
 */
export function sound_editor_open(workspace: HTMLElement, sound_name: string): void {
    const existing = _open_editors.get(sound_name)
    if (existing) { existing.bring_to_front(); return }
    const ed = new sound_editor_window(workspace, sound_name)
    _open_editors.set(sound_name, ed)
    ed.on_closed(() => _open_editors.delete(sound_name))
}

// =========================================================================
// Editor window
// =========================================================================

class sound_editor_window {
    private _win:       FloatingWindow
    private _name:      string
    private _data:      sound_data
    private _audio_ctx: AudioContext | null = null
    private _source:    AudioBufferSourceNode | null = null
    private _audio_buf: AudioBuffer | null = null
    private _blob_url:  string = ''

    // UI refs
    private _status_el!: HTMLElement
    private _play_btn!:  HTMLButtonElement
    private _stop_btn!:  HTMLButtonElement

    constructor(workspace: HTMLElement, name: string) {
        this._name = name
        this._data = {
            kind:      'normal',
            file_name: '',
            volume:    1,
            pitch:     1,
            preload:   true,
            streaming: false,
        }
        this._win = new FloatingWindow(
            `snd-${name}`, `Sound: ${name}`, 'icons/sound.svg',
            { x: 220, y: 80, w: 420, h: 320 }
        )
        this._build_ui()
        this._win.mount(workspace)
        this._load_data()
    }

    /** Bring the window to front. */
    public bring_to_front(): void { this._win.bring_to_front() }

    /** Register a callback for when this editor is closed. */
    public on_closed(cb: () => void): void { this._win.on_close(cb) }

    // -----------------------------------------------------------------------
    // Build UI
    // -----------------------------------------------------------------------

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex;flex-direction:column;gap:0;overflow:hidden;'

        // Toolbar
        const toolbar = document.createElement('div')
        toolbar.className = 'sw-editor-toolbar'

        const import_btn = this._make_btn('Import Sound…', () => this._import_audio())
        const play_btn   = document.createElement('button')
        play_btn.className = 'sw-btn'
        play_btn.textContent = '▶ Play'
        play_btn.addEventListener('click', () => this._play_preview())
        this._play_btn = play_btn

        const stop_btn = document.createElement('button')
        stop_btn.className = 'sw-btn'
        stop_btn.textContent = '■ Stop'
        stop_btn.addEventListener('click', () => this._stop_preview())
        this._stop_btn = stop_btn

        toolbar.append(import_btn, play_btn, stop_btn)
        body.appendChild(toolbar)

        // Status bar
        const status = document.createElement('div')
        status.className = 'sw-snd-status'
        status.textContent = 'No file imported.'
        this._status_el = status
        body.appendChild(status)

        // Properties form
        const form = document.createElement('div')
        form.className = 'sw-snd-form'

        form.appendChild(this._make_field('Kind', this._make_select(
            ['normal', 'background', '3d', 'positional'],
            this._data.kind,
            (v) => { this._data.kind = v as sound_kind; this._save() }
        )))

        form.appendChild(this._make_field('Volume', this._make_range(
            0, 1, 0.01, this._data.volume,
            (v) => { this._data.volume = v; this._save() }
        )))

        form.appendChild(this._make_field('Pitch', this._make_range(
            0.5, 2, 0.01, this._data.pitch,
            (v) => { this._data.pitch = v; this._save() }
        )))

        form.appendChild(this._make_checkbox('Preload', this._data.preload,
            (v) => { this._data.preload = v; this._save() }
        ))

        form.appendChild(this._make_checkbox('Streaming', this._data.streaming,
            (v) => { this._data.streaming = v; this._save() }
        ))

        body.appendChild(form)
    }

    // -----------------------------------------------------------------------
    // Helpers — form widgets
    // -----------------------------------------------------------------------

    private _make_btn(label: string, cb: () => void): HTMLButtonElement {
        const b = document.createElement('button')
        b.className = 'sw-btn'
        b.textContent = label
        b.addEventListener('click', cb)
        return b
    }

    private _make_field(label: string, control: HTMLElement): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-snd-row'
        const lbl = document.createElement('label')
        lbl.className = 'sw-label'
        lbl.textContent = label
        row.append(lbl, control)
        return row
    }

    private _make_select(options: string[], current: string, cb: (v: string) => void): HTMLSelectElement {
        const sel = document.createElement('select')
        sel.className = 'sw-select'
        for (const opt of options) {
            const o = document.createElement('option')
            o.value = o.textContent = opt
            if (opt === current) o.selected = true
            sel.appendChild(o)
        }
        sel.addEventListener('change', () => cb(sel.value))
        return sel
    }

    private _make_range(min: number, max: number, step: number, val: number, cb: (v: number) => void): HTMLElement {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'display:flex;align-items:center;gap:6px;'
        const inp = document.createElement('input')
        inp.type = 'range'
        inp.min = String(min); inp.max = String(max); inp.step = String(step)
        inp.value = String(val)
        inp.style.flex = '1'
        const num = document.createElement('span')
        num.style.cssText = 'min-width:36px;text-align:right;font-size:11px;color:var(--sw-text-dim);'
        num.textContent = String(val)
        inp.addEventListener('input', () => {
            const v = parseFloat(inp.value)
            num.textContent = String(v)
            cb(v)
        })
        wrap.append(inp, num)
        return wrap
    }

    private _make_checkbox(label: string, checked: boolean, cb: (v: boolean) => void): HTMLElement {
        const row = document.createElement('div')
        row.className = 'sw-snd-row'
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
    // Import audio
    // -----------------------------------------------------------------------

    private _import_audio(): void {
        if (!project_has_folder()) { alert('Open a project folder first (File → Open…).'); return }
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'audio/*'
        inp.addEventListener('change', async () => {
            const file = inp.files?.[0]
            if (!file) return
            const ext      = file.name.split('.').pop() ?? 'ogg'
            const fname    = `${this._name}.${ext}`
            const arr      = await file.arrayBuffer()
            const uint8    = new Uint8Array(arr)
            await project_write_binary(`sounds/${this._name}/${fname}`, uint8)
            this._data.file_name = fname
            this._status_el.textContent = `File: ${fname} (${(arr.byteLength / 1024).toFixed(1)} KB)`

            // decode for preview
            this._audio_ctx ??= new AudioContext()
            this._audio_buf = await this._audio_ctx.decodeAudioData(arr.slice(0))
            if (this._blob_url) URL.revokeObjectURL(this._blob_url)
            this._blob_url = URL.createObjectURL(new Blob([uint8], { type: file.type }))

            this._save()
        })
        inp.click()
    }

    // -----------------------------------------------------------------------
    // Preview playback
    // -----------------------------------------------------------------------

    private _play_preview(): void {
        if (!this._audio_buf) return
        this._stop_preview()
        this._audio_ctx ??= new AudioContext()
        const src = this._audio_ctx.createBufferSource()
        src.buffer = this._audio_buf
        src.playbackRate.value = this._data.pitch
        const gain = this._audio_ctx.createGain()
        gain.gain.value = this._data.volume
        src.connect(gain).connect(this._audio_ctx.destination)
        src.start()
        this._source = src
    }

    private _stop_preview(): void {
        try { this._source?.stop() } catch { /* already ended */ }
        this._source = null
    }

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    private async _load_data(): Promise<void> {
        try {
            const raw = await project_read_file(`sounds/${this._name}/meta.json`)
            if (!raw) return
            const parsed = JSON.parse(raw) as Partial<sound_data>
            Object.assign(this._data, parsed)
            if (this._data.file_name) {
                this._status_el.textContent = `File: ${this._data.file_name} (saved)`
            }
            // Re-build UI to reflect loaded values — simplest approach: replace body content
            this._win.body.innerHTML = ''
            this._build_ui()
        } catch { /* no saved data yet */ }
    }

    private async _save(): Promise<void> {
        if (!project_has_folder()) return
        await project_write_file(
            `sounds/${this._name}/meta.json`,
            JSON.stringify(this._data, null, 2)
        )
    }
}
