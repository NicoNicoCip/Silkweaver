/**
 * Script editor panel backed by Monaco.
 * Monaco is loaded from CDN via its AMD loader to keep ide.js small.
 *
 * Usage:
 *   const ed = new ScriptEditor()
 *   ed.open(workspace, file_handle, 'my_script.ts')
 */

import { FloatingWindow }                           from '../window_manager.js'
import { ICON } from "../icons.js"
import { bp_register_editor, bp_unregister_editor, bp_toggle } from '../panels/breakpoint_manager.js'
import { project_read_file, project_write_file, project_has_folder } from '../services/project.js'
import { ENGINE_DTS }                               from '../generated/engine_types.js'

// Monaco is loaded from CDN at runtime via AMD — type it as `any` to avoid
// requiring the 'monaco-editor' npm package in the IDE workspace.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Monaco = any

// =========================================================================
// Monaco CDN bootstrap (called once)
// =========================================================================

const MONACO_VERSION = '0.52.2'
const MONACO_CDN     = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`

let _monaco_ready: Promise<Monaco> | null = null

/**
 * Loads Monaco from CDN the first time it is called; subsequent calls reuse
 * the same promise.
 */
function _load_monaco(): Promise<Monaco> {
    if (_monaco_ready) return _monaco_ready

    _monaco_ready = new Promise((resolve, reject) => {
        // Inject the AMD loader script
        const script = document.createElement('script')
        script.src = `${MONACO_CDN}/loader.js`
        script.onload = () => {
            const req = (window as any).require as any
            req.config({ paths: { vs: MONACO_CDN } })
            req(['vs/editor/editor.main'], (monaco: Monaco) => {
                _setup_monaco(monaco)
                resolve(monaco)
            }, reject)
        }
        script.onerror = () => reject(new Error('Failed to load Monaco loader.js'))
        document.head.appendChild(script)
    })

    return _monaco_ready
}


function _setup_monaco(monaco: Monaco): void {
    // Inject the engine's real API as an ambient lib (generated from engine source
    // by scripts/generate-types.cjs — accurate, never hand-maintained).
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
        ENGINE_DTS,
        'ts:silkweaver/engine.d.ts',
    )

    // A *wildcard* ambient module so any leftover `import … from '@silkweaver/engine'` resolves
    // (its members are `any`) instead of erroring with "cannot find module" / "no exported member".
    // Bare engine references (the intended style) are fully typed via the ambient globals above;
    // imports are auto-injected at build time, so users don't need them.
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `declare module '@silkweaver/engine';\n`,
        'ts:silkweaver/engine-module.d.ts',
    )

    // Compiler options matching the engine's tsconfig
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        strict: false,
        noImplicitAny: false,
        noImplicitThis: false,
        lib: ['es2020', 'dom'],
        allowNonTsExtensions: true,
    })

    // Game scripts use the engine API with NO imports (auto-injected at build time), so suppress the
    // "unused import / unused variable" family of diagnostics — they'd just be off-screen noise.
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [6133, 6192, 6196, 6198, 6199, 6205],
    })
}

// =========================================================================
// ScriptEditor
// =========================================================================

let _editor_id_counter = 0

/**
 * A floating script editor window backed by Monaco.
 */
export class ScriptEditor {
    private _win:         FloatingWindow
    private _editor:      Monaco | null = null
    private _file_handle: FileSystemFileHandle | null = null
    private _rel_path:    string | null = null    // Electron / fallback path
    private _file_key:    string = ''
    private _save_timer:  ReturnType<typeof setTimeout> | null = null
    private _dirty        = false
    private _event_method: string | null = null   // when set, the editor can focus only this method's body
    private _title_text:   string = ''             // display title (kept across saves)
    private _view_mode:    'plain' | 'event' | 'full' | 'script' = 'plain'  // event=one event, full=class minus imports, script=hide imports
    private _base_line     = 0                     // hidden-prefix line count (for local line numbers)
    private _last_hidden   = ''                    // last applied hidden-areas (to avoid re-applying every keystroke)
    private _mode_btn:     HTMLButtonElement | null = null
    private _flush_inline: (() => void) | null = null   // inline-mode debounced save flusher

    /** Called when the editor saves the file (with the updated content). */
    on_save: (content: string) => void = () => {}

    constructor(title: string, key = '', default_x = 240, default_y = 30) {
        // Use a STABLE id derived from the file so each file's window restores its own saved
        // layout — a per-session counter would let unrelated files inherit a stale (e.g.
        // minimized/"flattened") layout left over from a previous session.
        const id = key ? `script-editor:${key}` : `script-editor-${++_editor_id_counter}`
        this._title_text = title
        this._win = new FloatingWindow(id, title, ICON.script, {
            x: default_x, y: default_y, w: 700, h: 500,
        })

        // Placeholder while Monaco loads
        const loading = document.createElement('div')
        loading.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:var(--sw-text-dim);font-size:12px;'
        loading.textContent = 'Loading editor…'
        this._win.body.appendChild(loading)
    }

    // ── Public API ────────────────────────────────────────────────────────

    /**
     * Mount the window and load a file handle into the editor.
     * @param parent      - Workspace element to mount into
     * @param file_handle - FSAPI file handle for the script file
     */
    async open(parent: HTMLElement, file_handle: FileSystemFileHandle): Promise<void> {
        this._file_handle = file_handle
        this._win.mount(parent)
        this._win.set_title(file_handle.name)

        const monaco = await _load_monaco()

        // Read file content
        let content = ''
        try {
            const file = await file_handle.getFile()
            content = await file.text()
        } catch {
            content = '// New script\n'
        }

        // Clear loading placeholder
        this._win.body.innerHTML = ''

        // Create editor inside body
        const container = document.createElement('div')
        container.style.cssText = 'width:100%;height:100%;'
        this._win.body.appendChild(container)

        this._editor = monaco.editor.create(container, {
            value:       content,
            language:    'typescript',
            theme:       'vs-dark',
            fontSize:    13,
            minimap:     { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap:    'off',
            tabSize:     4,
            insertSpaces: true,
            glyphMargin: true,
            fixedOverflowWidgets: true,
        })

        // Register with breakpoint manager so it can paint decorations
        bp_register_editor(this._file_key, this._editor)

        // Glyph margin click → toggle breakpoint
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._editor.onMouseDown((e: any) => {
            if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                const line: number = e.target.position?.lineNumber
                if (line) bp_toggle(this._file_key, line)
            }
        })

        // Auto-save on change (debounced 500ms)
        this._editor.onDidChangeModelContent(() => {
            this._dirty = true
            this._win.set_title('● ' + (this._file_handle?.name ?? 'script'))
            if (this._save_timer !== null) clearTimeout(this._save_timer)
            this._save_timer = setTimeout(() => this._do_save(), 500)
        })

        // Ctrl+S → immediate save
        this._editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => this._do_save(),
        )

        this._win.bring_to_front()
    }

    /**
     * Opens an editor for a raw string (no file handle — used for inline event code).
     * @param parent  - Workspace element
     * @param content - Initial code content
     * @param lang    - Language (default 'typescript')
     */
    /**
     * Mount the window and load a file by relative project path (Electron / fallback).
     * @param parent   - Workspace element to mount into
     * @param rel_path - Relative path e.g. 'scripts/player.ts'
     */
    async open_path(parent: HTMLElement, rel_path: string): Promise<void> {
        this._rel_path = rel_path
        this._view_mode = 'script'   // hide the (auto-managed) import block
        this._win.mount(parent)
        this._win.set_title(rel_path.split('/').pop() ?? rel_path)

        const monaco = await _load_monaco()

        let content = ''
        try {
            content = await project_read_file(rel_path)
        } catch {
            content = '// New script\n'
        }

        this._win.body.innerHTML = ''

        const container = document.createElement('div')
        container.style.cssText = 'width:100%;height:100%;'
        this._win.body.appendChild(container)

        this._editor = monaco.editor.create(container, {
            value:       content,
            language:    'typescript',
            theme:       'vs-dark',
            fontSize:    13,
            minimap:     { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap:    'off',
            tabSize:     4,
            insertSpaces: true,
            glyphMargin: true,
            fixedOverflowWidgets: true,
        })

        this._apply_focus()   // hide the import block

        bp_register_editor(this._file_key, this._editor)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._editor.onMouseDown((e: any) => {
            if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                const line: number = e.target.position?.lineNumber
                if (line) bp_toggle(this._file_key, line)
            }
        })

        this._editor.onDidChangeModelContent(() => {
            this._apply_focus()
            this._dirty = true
            this._win.set_title('● ' + (rel_path.split('/').pop() ?? rel_path))
            if (this._save_timer !== null) clearTimeout(this._save_timer)
            this._save_timer = setTimeout(() => this._do_save(), 500)
        })
    }

    /**
     * Opens a focused, GMS-style editor that shows ONLY one event's body from a class-per-object
     * file. The Monaco model is the whole class file (so imports, `this.<var>` and the engine API
     * all type-check and autocomplete), but everything except the event's body is hidden, so the
     * user sees just the event code. Saving writes the whole file back.
     * @param method - the on_* method to focus (e.g. 'on_step')
     * @param title  - the window title (e.g. 'obj_player · Step')
     */
    async open_event(parent: HTMLElement, rel_path: string, method: string, title: string): Promise<void> {
        await this._open_class(parent, rel_path, title, 'event', method)
    }

    /** Opens the whole class file with the (huge) import block hidden. */
    async open_full(parent: HTMLElement, rel_path: string, title: string): Promise<void> {
        await this._open_class(parent, rel_path, title, 'full', null)
    }

    /** Shared opener for object class files in 'event' or 'full' view (with a toggle between them). */
    private async _open_class(parent: HTMLElement, rel_path: string, title: string, mode: 'event' | 'full', method: string | null): Promise<void> {
        this._rel_path     = rel_path
        this._event_method = method
        this._title_text   = title
        this._view_mode    = mode
        this._win.mount(parent)
        this._win.set_title(title)

        const monaco = await _load_monaco()
        let content = ''
        try { content = await project_read_file(rel_path) } catch { content = '' }

        this._win.body.innerHTML = ''
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden;'

        // Toolbar with the Event ⇄ Full view toggle (only meaningful when an event is known).
        const toolbar = document.createElement('div')
        toolbar.style.cssText = 'display:flex; align-items:center; gap:6px; padding:3px 6px; background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2); flex-shrink:0;'
        if (method) {
            this._mode_btn = document.createElement('button')
            this._mode_btn.className = 'sw-btn'
            this._mode_btn.style.cssText = 'font-size:10px; padding:2px 8px;'
            this._mode_btn.textContent = mode === 'event' ? 'Full view' : 'Event view'
            this._mode_btn.title = 'Toggle between this event and the whole class (imports hidden)'
            this._mode_btn.addEventListener('click', () => this._set_view_mode(this._view_mode === 'event' ? 'full' : 'event'))
            toolbar.appendChild(this._mode_btn)
        }
        const hint = document.createElement('span')
        hint.style.cssText = 'font-size:11px; color:var(--sw-text-dim);'
        hint.textContent = method ? `${method}` : 'class (imports hidden)'
        toolbar.appendChild(hint)
        body.appendChild(toolbar)

        const container = document.createElement('div')
        container.style.cssText = 'flex:1; min-height:0;'
        body.appendChild(container)

        this._editor = monaco.editor.create(container, {
            value:       content,
            language:    'typescript',
            theme:       'vs-dark',
            fontSize:    13,
            minimap:     { enabled: mode === 'full' },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap:    'off',
            tabSize:     4,
            insertSpaces: true,
            glyphMargin: false,
            fixedOverflowWidgets: true,
            // The sticky "scope" header would sit on top of the first body line in the focused view.
            stickyScroll: { enabled: false },
            // Event view shows body-local line numbers (1, 2, 3…); full view keeps real ones.
            lineNumbers: (n: number) => this._view_mode === 'event' ? String(Math.max(1, n - this._base_line)) : String(n),
        })

        const model = this._editor.getModel()
        // Give an empty event body an editable blank line.
        if (method) {
            const br = _find_method_braces(model.getValue(), method)
            if (br && br.closeLine <= br.openLine + 1) {
                const col = model.getLineMaxColumn(br.openLine)
                this._editor.executeEdits('init-body', [{
                    range: { startLineNumber: br.openLine, startColumn: col, endLineNumber: br.openLine, endColumn: col },
                    text:  '\n        ',
                }])
            }
        }

        this._apply_focus()

        // Park the cursor on the first visible (body) line.
        if (method) {
            const br2 = _find_method_braces(this._editor.getValue(), method)
            if (br2) { const ln = br2.openLine + 1; this._editor.revealLine(ln); this._editor.setPosition({ lineNumber: ln, column: model.getLineMaxColumn(ln) }) }
        }

        this._editor.onDidChangeModelContent(() => {
            this._apply_focus()   // guarded — only re-hides when the ranges actually change
            this._dirty = true
            this._win.set_title('● ' + title)
            if (this._save_timer !== null) clearTimeout(this._save_timer)
            this._save_timer = setTimeout(() => this._do_save(), 500)
        })

        // Keep the cursor inside the visible event body so hidden (off-screen) code can't be edited.
        this._editor.onDidChangeCursorPosition((e: any) => {
            if (this._view_mode !== 'event' || !this._event_method) return
            const m = this._editor.getModel(); if (!m) return
            const b = _find_method_braces(m.getValue(), this._event_method); if (!b) return
            const minL = b.openLine + 1, maxL = b.closeLine - 1
            if (maxL < minL) return
            if (e.position.lineNumber < minL)      this._editor.setPosition({ lineNumber: minL, column: 1 })
            else if (e.position.lineNumber > maxL) this._editor.setPosition({ lineNumber: maxL, column: m.getLineMaxColumn(maxL) })
        })

        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => this._do_save())

        this._editor.focus()
        this._win.bring_to_front()
    }

    private _set_view_mode(mode: 'event' | 'full'): void {
        this._view_mode = mode
        if (this._mode_btn) this._mode_btn.textContent = mode === 'event' ? 'Full view' : 'Event view'
        this._last_hidden = ''   // force a re-apply
        this._apply_focus()
        if (this._editor) {
            this._editor.updateOptions({ lineNumbers: (n: number) => this._view_mode === 'event' ? String(Math.max(1, n - this._base_line)) : String(n) })
            if (mode === 'event' && this._event_method) {
                const br = _find_method_braces(this._editor.getModel().getValue(), this._event_method)
                if (br) { const ln = br.openLine + 1; this._editor.revealLine(ln); this._editor.setPosition({ lineNumber: ln, column: 1 }) }
            }
            this._editor.focus()
        }
    }

    /** Applies hidden areas for the current view mode (guarded so it doesn't reset on every keystroke). */
    private _apply_focus(): void {
        if (!this._editor) return
        const model = this._editor.getModel()
        if (!model) return
        const text = model.getValue()
        const last = model.getLineCount()
        const hidden: any[] = []
        let base = 0
        if (this._view_mode === 'event' && this._event_method) {
            const br = _find_method_braces(text, this._event_method)
            if (br) {
                hidden.push({ startLineNumber: 1, startColumn: 1, endLineNumber: br.openLine, endColumn: 1 })
                if (br.closeLine <= last) hidden.push({ startLineNumber: br.closeLine, startColumn: 1, endLineNumber: last, endColumn: 1 })
                base = br.openLine
            }
        } else if (this._view_mode === 'full') {
            const cls = _class_decl_line(text)
            if (cls > 1) hidden.push({ startLineNumber: 1, startColumn: 1, endLineNumber: cls - 1, endColumn: 1 })
        } else if (this._view_mode === 'script') {
            const imp = _last_import_line(text)
            if (imp >= 1) hidden.push({ startLineNumber: 1, startColumn: 1, endLineNumber: imp, endColumn: 1 })
        }
        this._base_line = base
        const key = JSON.stringify(hidden)
        if (key !== this._last_hidden) { this._editor.setHiddenAreas(hidden); this._last_hidden = key }
    }

    async open_inline(parent: HTMLElement, content: string, lang = 'typescript'): Promise<void> {
        this._win.mount(parent)
        if (this._title_text) this._win.set_title(this._title_text)
        const monaco = await _load_monaco()

        this._win.body.innerHTML = ''
        const container = document.createElement('div')
        container.style.cssText = 'width:100%;height:100%;'
        this._win.body.appendChild(container)

        this._editor = monaco.editor.create(container, {
            value:    content,
            language: lang,
            theme:    'vs-dark',
            fontSize: 13,
            minimap:  { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap:  'off',
            tabSize:   4,
            insertSpaces: true,
            fixedOverflowWidgets: true,
        })

        const flush = () => {
            if (this._save_timer !== null) { clearTimeout(this._save_timer); this._save_timer = null }
            if (!this._dirty) return
            this._dirty = false
            this._win.set_title(this._title_text || 'code')
            this.on_save(this._editor!.getValue())
        }

        // Debounce so a free-floating code buffer (room/instance creation code) isn't written
        // to disk on every keystroke; a dirty marker shows unsaved edits.
        this._editor.onDidChangeModelContent(() => {
            this._dirty = true
            this._win.set_title('● ' + (this._title_text || 'code'))
            if (this._save_timer !== null) clearTimeout(this._save_timer)
            this._save_timer = setTimeout(flush, 500)
        })
        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, flush)
        // Expose a flush so the open wrapper's close handler can persist pending edits
        // (registering on_close here would clobber the wrapper's dedup cleanup callback).
        this._flush_inline = flush

        this._editor.focus()
        this._win.bring_to_front()
    }

    /** Persists any pending inline edits immediately (set by open_inline). */
    flush_inline(): void { this._flush_inline?.() }

    /** Set the file key used for breakpoint tracking. */
    set_file_key(key: string): void {
        this._file_key = key
        if (this._editor) {
            bp_unregister_editor(key)
            bp_register_editor(key, this._editor)
        }
    }

    /** Returns the current editor content. */
    get_value(): string {
        return this._editor?.getValue() ?? ''
    }

    /** Programmatically set the editor content (does not trigger auto-save). */
    set_value(content: string): void {
        if (this._editor) {
            const model = this._editor.getModel()
            if (model) model.setValue(content)
        }
    }

    /** Focus the editor. */
    focus(): void {
        this._editor?.focus()
    }

    /** Register a callback for when the window is closed. */
    on_close(cb: () => void): void {
        this._win.on_close(cb)
    }

    // ── Save ──────────────────────────────────────────────────────────────

    private async _do_save(): Promise<void> {
        if (!this._dirty) return
        const content = this._editor?.getValue() ?? ''

        if (this._file_handle) {
            try {
                const writable = await (this._file_handle as any).createWritable()
                await writable.write(content)
                await writable.close()
            } catch (err) {
                console.error('[ScriptEditor] Save failed:', err)
                return
            }
        } else if (this._rel_path) {
            try {
                await project_write_file(this._rel_path, content)
            } catch (err) {
                console.error('[ScriptEditor] Save failed:', err)
                return
            }
        }

        this._dirty = false
        const title = this._title_text || this._file_handle?.name || this._rel_path?.split('/').pop() || 'script'
        this._win.set_title(title)
        this.on_save(content)
    }
}

// =========================================================================
// Registry — open editors indexed by file path, to avoid duplicates
// =========================================================================

const _open_editors: Map<string, ScriptEditor> = new Map()

/**
 * Opens (or focuses an existing) script editor for the given file handle.
 * @param parent      - Workspace element
 * @param file_handle - FSAPI file handle
 * @param key         - Unique key for dedup (e.g. 'scripts/my_script.ts')
 */
export async function script_editor_open(
    parent: HTMLElement,
    file_handle: FileSystemFileHandle,
    key: string,
): Promise<ScriptEditor> {
    const existing = _open_editors.get(key)
    if (existing) {
        existing.focus()
        return existing
    }

    const ed = new ScriptEditor(file_handle.name, key)
    ed.set_file_key(key)
    _open_editors.set(key, ed)
    ed.on_save = () => {}

    ed.on_close(() => {
        bp_unregister_editor(key)
        _open_editors.delete(key)
    })

    await ed.open(parent, file_handle)
    return ed
}

/**
 * Open a script editor by relative project path (Electron / fallback mode).
 * @param parent   - Workspace element
 * @param rel_path - Relative path e.g. 'scripts/player.ts'
 */
export async function script_editor_open_path(
    parent: HTMLElement,
    rel_path: string,
): Promise<ScriptEditor> {
    const existing = _open_editors.get(rel_path)
    if (existing) {
        existing.focus()
        return existing
    }

    const filename = rel_path.split('/').pop() ?? rel_path
    const ed = new ScriptEditor(filename, rel_path)
    ed.set_file_key(rel_path)
    _open_editors.set(rel_path, ed)
    ed.on_save = () => {}

    ed.on_close(() => {
        bp_unregister_editor(rel_path)
        _open_editors.delete(rel_path)
    })

    await ed.open_path(parent, rel_path)
    return ed
}

/**
 * Opens (or focuses) a focused per-event editor for a single on_* method of a class-per-object file.
 * @param rel_path - e.g. 'objects/obj_player.ts'
 * @param method   - e.g. 'on_step'
 * @param title    - window title, e.g. 'obj_player · Step'
 */
export async function script_editor_open_event(
    parent: HTMLElement,
    rel_path: string,
    method: string,
    title: string,
): Promise<ScriptEditor> {
    const key = `${rel_path}#${method}`
    const existing = _open_editors.get(key)
    if (existing) { existing.focus(); return existing }

    const ed = new ScriptEditor(title, key)
    ed.set_file_key(key)
    _open_editors.set(key, ed)
    ed.on_close(() => _open_editors.delete(key))

    await ed.open_event(parent, rel_path, method, title)
    return ed
}

/**
 * Opens (or focuses) the whole class file with imports hidden ("Open as Code" / Full view).
 */
export async function script_editor_open_full(parent: HTMLElement, rel_path: string, title: string): Promise<ScriptEditor> {
    const key = `${rel_path}#__full`
    const existing = _open_editors.get(key)
    if (existing) { existing.focus(); return existing }
    const ed = new ScriptEditor(title, key)
    ed.set_file_key(key)
    _open_editors.set(key, ed)
    ed.on_close(() => _open_editors.delete(key))
    await ed.open_full(parent, rel_path, title)
    return ed
}

/**
 * Opens (or focuses) a Monaco editor over a free-floating code string — used for room and
 * per-instance creation code, which live inside room.json rather than as their own files.
 * @param key     - Unique dedup key, e.g. 'room-cc:room_level1' or 'room-inst-cc:room0#3'
 * @param title   - Window title, e.g. 'room_level1 · Creation Code'
 * @param initial - Initial code content
 * @param on_save - Called (debounced) with the latest content; persist it here
 */
export async function script_editor_open_text(
    parent: HTMLElement,
    key: string,
    title: string,
    initial: string,
    on_save: (content: string) => void,
): Promise<ScriptEditor> {
    const existing = _open_editors.get(key)
    if (existing) { existing.focus(); return existing }

    const ed = new ScriptEditor(title, key)
    ed.set_file_key(key)
    _open_editors.set(key, ed)
    ed.on_save = on_save
    ed.on_close(() => {
        ed.flush_inline()        // persist any edit still inside the debounce window
        _open_editors.delete(key)
    })

    await ed.open_inline(parent, initial)
    return ed
}

/** Last line of the leading import block (1-based, 0 if none); used to hide imports in scripts. */
function _last_import_line(text: string): number {
    const lines = text.split('\n')
    let last = 0
    for (let i = 0; i < lines.length; i++) {
        const t = lines[i]!.trim()
        if (t.startsWith('import ')) last = i + 1
        else if (t !== '' && !t.startsWith('//') && last > 0) break   // first real code after the imports
    }
    return last
}

/** First line of the class declaration (1-based); used to hide the import block in full view. */
function _class_decl_line(text: string): number {
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
        if (/^\s*(export\s+)?(default\s+)?(abstract\s+)?class\s/.test(lines[i]!)) return i + 1
    }
    return 1
}

/** Locates an on_* method's opening and closing brace lines in class-file source (1-based). */
function _find_method_braces(text: string, method: string): { openLine: number; closeLine: number } | null {
    const esc = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re  = new RegExp(`\\n[ \\t]*(?:public |private |protected |async |override )*${esc}\\s*\\([^)]*\\)\\s*(?::[^{;=]+)?\\{`)
    const m = re.exec(text)
    if (!m) return null
    const open = m.index + m[0].length - 1   // index of the body-opening '{'
    let depth = 1, i = open + 1
    while (i < text.length && depth > 0) {
        const c = text[i], n = text[i + 1]
        if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; continue }
        if (c === '/' && n === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++; i += 2; continue }
        if (c === '"' || c === "'" || c === '`') { const q = c; i++; while (i < text.length && text[i] !== q) { if (text[i] === '\\') i++; i++ } i++; continue }
        if (c === '{') depth++
        else if (c === '}') depth--
        i++
    }
    const close = i - 1   // index of the matching '}'
    const line_of = (idx: number): number => { let ln = 1; for (let k = 0; k < idx && k < text.length; k++) if (text[k] === '\n') ln++; return ln }
    return { openLine: line_of(open), closeLine: line_of(close) }
}

/**
 * Opens a script editor using whichever backend is available.
 * Prefers path-based (Electron/fallback) when no FSAPI dir handle exists.
 */
export async function script_editor_open_smart(
    parent: HTMLElement,
    rel_path: string,
    get_handle: () => Promise<FileSystemFileHandle>,
): Promise<ScriptEditor> {
    if (!project_has_folder()) { alert('Open a project folder first.'); throw new Error('No project folder') }
    if ((window as any).swfs || !((window as any).showDirectoryPicker)) {
        return script_editor_open_path(parent, rel_path)
    }
    const handle = await get_handle()
    return script_editor_open(parent, handle, rel_path)
}

/**
 * Injects project-specific object class declarations into Monaco.
 * Called when a project is loaded to make object names like o_wall, o_player known to TypeScript.
 */
let _project_types_disposable: any = null
export function inject_project_types(state: any): void {
    _load_monaco().then(monaco => {
        // Remove previous project types if they exist
        if (_project_types_disposable) {
            _project_types_disposable.dispose()
        }

        // Generate declarations for all objects in the project
        const object_names = Object.keys(state.resources?.objects || {})
        const declarations = object_names.map(name =>
            `declare const ${name}: typeof gm_object;`
        ).join('\n')

        const project_types = `
// Project-specific object classes
${declarations}
`

        // Add as an extra lib
        _project_types_disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
            project_types,
            'ts:silkweaver/project-objects.d.ts'
        )
    })
}
