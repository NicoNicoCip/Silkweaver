/**
 * Code editor panel backed by Monaco.
 *
 * Every mode is a plain, standalone editor over a config-supplied buffer — there are no hidden
 * areas, no live brace-matching, and no cursor clamping. An object EVENT is edited as its own
 * de-indented body buffer (its "virtual file"): `cfg.load` pulls just that method's body out of the
 * class file (get_event_body) and `cfg.save` packs the edited body back in, re-indented
 * (set_event_body). So Ctrl+A, auto-indent, selection, and undo all behave normally, and an orphan
 * brace can't soft-lock the view. The whole-class file is still available via Full view / scripts.
 *
 * Lifecycle is unified: content loads through `cfg.load`, persists through `cfg.save` (debounced +
 * flushed on close so edits are never lost), and the Monaco editor + model are disposed on close.
 * Monaco itself loads once from CDN via its AMD loader to keep ide.js small.
 */

import { FloatingWindow }                           from '../window_manager.js'
import { ICON } from "../icons.js"
import { bp_register_editor, bp_unregister_editor, bp_toggle } from '../panels/breakpoint_manager.js'
import { project_read_file, project_write_file, project_has_folder } from '../services/project.js'
import { ENGINE_DTS }                               from '../generated/engine_types.js'
import { editor_monaco_options, editor_register_themes, editor_apply_all } from '../editor_prefs.js'
import { file_watch_subscribe }                     from '../services/file_watch.js'

// Monaco is loaded from CDN at runtime via AMD — type it as `any` to avoid
// requiring the 'monaco-editor' npm package in the IDE workspace.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Monaco = any

const SAVE_DEBOUNCE_MS = 500

/** The Electron object-format bridge (parse/patch ops run in the host). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _object_op(action: string, ...args: any[]): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).swfs.object_op(action, ...args)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _has_object_op(): boolean { return !!(window as any).swfs?.object_op }

// =========================================================================
// `this.` autocomplete for event body buffers
// =========================================================================
// An event body is edited as a standalone buffer where `this` is untyped, so a completion provider
// supplies `this.` members: the engine instance API (from ENGINE_DTS) + the object's own variables.

interface this_member { name: string; method: boolean }
let _engine_this_members: this_member[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _this_member_models = new Map<any, this_member[]>()   // event-buffer model → its `this.` members

/** Registers the `this.` members for an event buffer model (engine members + the object's vars). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _register_this_members(model: any, object_vars: string[]): void {
    if (!model) return
    _this_member_models.set(model, [..._engine_this_members, ...object_vars.map(name => ({ name, method: false }))])
}

/** Extracts the brace-balanced body of `declare class <name> …{ … }` from the engine .d.ts. */
function _class_body(dts: string, name: string): string {
    const m = new RegExp(`declare class ${name}[^{]*\\{`).exec(dts)
    if (!m) return ''
    let i = m.index + m[0].length, depth = 1
    const start = i
    while (i < dts.length && depth > 0) { const c = dts[i]; if (c === '{') depth++; else if (c === '}') depth--; i++ }
    return dts.slice(start, i - 1)
}

/** Collects public, non-static instance members of `instance` + `gm_object` for `this.` completion. */
function _extract_this_members(dts: string): this_member[] {
    const found = new Map<string, boolean>()   // name → isMethod
    for (const cls of ['instance', 'gm_object']) {
        const body = _class_body(dts, cls)
        const re = /(?:^|\n)[ \t]*((?:public |protected |private |readonly |static |abstract |get |set )*)([A-Za-z_]\w*)\s*([(<:?])/g
        let m: RegExpExecArray | null
        while ((m = re.exec(body))) {
            const mods = m[1]!, nm = m[2]!, next = m[3]!
            if (mods.includes('static') || mods.includes('private')) continue
            if (nm === 'constructor' || nm.startsWith('_')) continue
            if (!found.has(nm)) found.set(nm, next === '(' || next === '<')
        }
    }
    return [...found.entries()].map(([name, method]) => ({ name, method }))
}

// =========================================================================
// Monaco CDN bootstrap (called once)
// =========================================================================

const MONACO_VERSION = '0.52.2'
const MONACO_CDN     = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`

let _monaco_ready: Promise<Monaco> | null = null

/** Loads Monaco from CDN the first time it is called; subsequent calls reuse the same promise. */
function _load_monaco(): Promise<Monaco> {
    if (_monaco_ready) return _monaco_ready

    _monaco_ready = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `${MONACO_CDN}/loader.js`
        script.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // Register custom themes and apply the user's editor preferences (theme + options),
    // then live-apply on any preference or font-size change.
    editor_register_themes(monaco)
    editor_apply_all(monaco)
    const apply = (): void => editor_apply_all(monaco)
    window.addEventListener('sw:editor-prefs', apply)
    window.addEventListener('sw:editor-font', apply)

    // Inject the engine's real API as an ambient lib (generated from engine source by
    // scripts/generate-types.cjs — accurate, never hand-maintained).
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ENGINE_DTS, 'ts:silkweaver/engine.d.ts')

    // A *wildcard* ambient module so any leftover `import … from '@silkweaver/engine'` resolves
    // (members are `any`) instead of erroring. Bare engine references (the intended style) are fully
    // typed via the ambient globals above; imports are auto-injected at build time.
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `declare module '@silkweaver/engine';\n`, 'ts:silkweaver/engine-module.d.ts',
    )

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        strict: false,
        noImplicitAny: false,
        noImplicitThis: false,
        lib: ['es2020', 'dom'],
        allowNonTsExtensions: true,
    })

    // Game code uses the engine API with NO imports (auto-injected at build time). An event body is
    // edited as a standalone buffer, so `return` / `await` appear at the buffer's top level — suppress
    // the "unused import/var" family AND the "outside function/async" syntax errors so the focused
    // event view shows no false diagnostics.
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [6133, 6192, 6196, 6198, 6199, 6205, 1108, 1308, 1375, 1378],
    })

    // `this.` autocomplete for event body buffers (which have no class context). Only contributes
    // when the active model is a registered event buffer; otherwise TypeScript handles completion.
    _engine_this_members = _extract_this_members(ENGINE_DTS)
    monaco.languages.registerCompletionItemProvider('typescript', {
        triggerCharacters: ['.'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideCompletionItems(model: any, position: any) {
            const members = _this_member_models.get(model)
            if (!members) return undefined   // not an event buffer → let TypeScript complete
            const line = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column })
            if (!/\bthis\.\w*$/.test(line)) return { suggestions: [] }
            const word = model.getWordUntilPosition(position)
            const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn }
            const K = monaco.languages.CompletionItemKind
            // Merge in `this.x = …` assignments typed in THIS buffer right now, so a variable just
            // created in the current event completes immediately (the registered list — engine members
            // + the object's saved vars — only refreshes on save/reload).
            const seen = new Set(members.map(m => m.name))
            const all  = [...members]
            const re = /\bthis\.([A-Za-z_$][\w$]*)\s*(?:[-+*/%&|^]?=(?!=)|\*\*=|<<=|>>>?=|\+\+|--)/g
            let mm: RegExpExecArray | null
            while ((mm = re.exec(model.getValue()))) { const n = mm[1]!; if (!seen.has(n)) { seen.add(n); all.push({ name: n, method: false }) } }
            return { suggestions: all.map(mem => ({
                label:      mem.name,
                kind:       mem.method ? K.Method : K.Field,
                insertText: mem.name,
                range,
            })) }
        },
    })
}

// =========================================================================
// Editor configuration
// =========================================================================

interface EditorConfig {
    win_id:       string                             // stable window id (per file/event → restores its layout)
    title:        string
    file_key:     string                             // key for breakpoint tracking + the open-editors registry
    breakpoints:  boolean
    glyph_margin: boolean
    watch_path?:  string                             // project-relative file to reload on external change
    get_this_vars?: () => Promise<string[]>          // event buffers: object var names for `this.` completion
    load:         () => Promise<string>              // how to read the initial content
    save:         (content: string) => Promise<void> | void   // how to persist
}

// =========================================================================
// ScriptEditor — the unified editor window
// =========================================================================

/** A floating code editor window backed by Monaco. */
export class ScriptEditor {
    private _win:        FloatingWindow
    private _cfg:        EditorConfig
    private _editor:     Monaco | null = null
    private _save_timer: ReturnType<typeof setTimeout> | null = null
    private _dirty       = false
    private _disposed    = false
    private _reloading   = false                  // suppresses the change handler during an external reload
    private _unsub:      (() => void) | null = null   // file-watch unsubscribe
    private _close_cbs:  (() => void)[] = []

    constructor(cfg: EditorConfig) {
        this._cfg = cfg
        this._win = new FloatingWindow(cfg.win_id, cfg.title, ICON.script, { x: 240, y: 30, w: 700, h: 500 })

        const loading = document.createElement('div')
        loading.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:var(--sw-text-dim);font-size:12px;'
        loading.textContent = 'Loading editor…'
        this._win.body.appendChild(loading)

        // One close handler: flush pending edits, dispose Monaco, then run registry cleanup.
        this._win.on_close(() => this._handle_close())
    }

    /** Registers an extra callback to run when this window closes (chained, not clobbered). */
    on_close(cb: () => void): void { this._close_cbs.push(cb) }

    /** Mounts the window, loads content, and creates the editor. */
    async open(parent: HTMLElement): Promise<void> {
        this._win.mount(parent)
        this._win.set_title(this._cfg.title)

        const monaco = await _load_monaco()
        let content = ''
        try { content = await this._cfg.load() } catch { content = '' }
        if (this._disposed) return   // window was closed while content loaded

        const body = this._win.body
        body.innerHTML = ''
        const container = document.createElement('div')
        container.style.cssText = 'width:100%; height:100%;'
        body.appendChild(container)

        this._editor = monaco.editor.create(container, {
            value:                content,
            language:             'typescript',
            ...editor_monaco_options(),
            automaticLayout:      true,
            scrollBeyondLastLine: false,
            glyphMargin:          this._cfg.glyph_margin,
            fixedOverflowWidgets: true,
        })

        // Mark dirty + (debounced) save on every edit (ignore programmatic reloads).
        this._editor.onDidChangeModelContent(() => {
            if (this._reloading) return
            this._mark_dirty(); this._schedule_save()
        })

        // Reload when the underlying file is changed by another window / outside the IDE.
        if (this._cfg.watch_path) this._unsub = file_watch_subscribe(this._cfg.watch_path, () => void this._external_reload())

        // Event buffers: enable `this.` autocomplete (engine members now, + object vars when fetched).
        if (this._cfg.get_this_vars) {
            _register_this_members(this._editor.getModel(), [])   // engine members immediately
            this._refresh_this_members()                          // + object vars (async)
        }

        // Breakpoints: glyph-margin toggle + decoration registration.
        if (this._cfg.breakpoints) {
            bp_register_editor(this._cfg.file_key, this._editor)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._editor.onMouseDown((e: any) => {
                if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                    const line: number = e.target.position?.lineNumber
                    if (line) bp_toggle(this._cfg.file_key, line)
                }
            })
        }

        // Ctrl+S → flush immediately.
        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => void this._flush())

        this._editor.focus()
        this._win.bring_to_front()
    }

    // ── Public helpers ──────────────────────────────────────────────────────

    /** Returns the current editor content. */
    get_value(): string { return this._editor?.getValue() ?? '' }

    /** Programmatically replaces the editor content (does not trigger a save). */
    set_value(content: string): void { this._editor?.getModel()?.setValue(content) }

    /** Focuses the editor (or its window if Monaco isn't ready yet). */
    focus(): void { if (this._editor) this._editor.focus(); else this._win.bring_to_front() }

    /** Persists any pending edits immediately. */
    flush(): void { void this._flush() }

    // ── External reload (parallel editing) ────────────────────────────────────

    /**
     * Re-fetches the object's variables and refreshes this buffer's `this.` completion list. Keeps
     * `this.` autocomplete in sync when a variable is added/removed from the object window elsewhere.
     */
    private _refresh_this_members(): void {
        if (!this._cfg.get_this_vars || !this._editor) return
        const model = this._editor.getModel(); if (!model) return
        void this._cfg.get_this_vars()
            .then(vars => { if (!this._disposed && this._editor?.getModel() === model) _register_this_members(model, vars) })
            .catch(() => { /* keep the engine members already registered */ })
    }

    /** Reloads content after an external change. Keeps the user's edits if this window is dirty. */
    private async _external_reload(): Promise<void> {
        if (this._disposed || !this._editor) return
        this._refresh_this_members()   // a sibling edit may have changed the object's variables
        if (this._dirty) {
            // Don't clobber in-progress edits — just flag that the file diverged on disk.
            this._win.set_title('⚠ ' + this._cfg.title)
            return
        }
        let content: string
        try { content = await this._cfg.load() } catch { return }
        if (this._disposed || !this._editor) return
        if (content === this._editor.getValue()) return   // nothing actually changed for us

        const model = this._editor.getModel(); if (!model) return
        const pos    = this._editor.getPosition()
        const scroll = this._editor.getScrollTop?.()
        this._reloading = true
        try { model.setValue(content) } finally { this._reloading = false }
        if (pos) this._editor.setPosition(pos)               // best-effort caret/scroll preservation
        if (typeof scroll === 'number') this._editor.setScrollTop?.(scroll)
    }

    // ── Save pipeline ────────────────────────────────────────────────────────

    private _mark_dirty(): void {
        this._dirty = true
        this._win.set_title('● ' + this._cfg.title)
    }

    private _schedule_save(): void {
        if (this._save_timer !== null) clearTimeout(this._save_timer)
        this._save_timer = setTimeout(() => void this._flush(), SAVE_DEBOUNCE_MS)
    }

    /** Writes pending edits now (clears the debounce). Safe to call repeatedly / when not dirty. */
    private async _flush(): Promise<void> {
        if (this._save_timer !== null) { clearTimeout(this._save_timer); this._save_timer = null }
        if (!this._dirty || !this._editor) return
        const content = this._editor.getValue()   // capture synchronously (before any await / dispose)
        this._dirty = false
        try {
            await this._cfg.save(content)
        } catch (err) {
            this._dirty = true   // let a later flush retry
            console.error('[ScriptEditor] Save failed:', err)
            return
        }
        if (!this._disposed) this._win.set_title(this._cfg.title)
    }

    // ── Teardown ──────────────────────────────────────────────────────────────

    private _handle_close(): void {
        if (this._disposed) return
        this._disposed = true
        try { this._unsub?.() } catch { /* ignore */ }
        this._unsub = null
        void this._flush()                         // persist any pending edit (captures content first)
        if (this._cfg.breakpoints) { try { bp_unregister_editor(this._cfg.file_key) } catch { /* ignore */ } }
        const m = this._editor?.getModel(); if (m) _this_member_models.delete(m)
        try { this._editor?.getModel()?.dispose() } catch { /* ignore */ }
        try { this._editor?.dispose() } catch { /* ignore */ }
        this._editor = null
        for (const cb of this._close_cbs) { try { cb() } catch { /* ignore */ } }
    }
}

// =========================================================================
// Open-editor registry (dedup: one window per file/event/key)
// =========================================================================

const _open_editors: Map<string, ScriptEditor> = new Map()

/** Builds, registers, and opens an editor for `key`, or focuses the existing one. */
async function _open(parent: HTMLElement, key: string, cfg: EditorConfig): Promise<ScriptEditor> {
    const existing = _open_editors.get(key)
    if (existing) { existing.focus(); return existing }

    const ed = new ScriptEditor(cfg)
    _open_editors.set(key, ed)
    ed.on_close(() => _open_editors.delete(key))
    await ed.open(parent)
    return ed
}

// =========================================================================
// Public openers (stable API)
// =========================================================================

/**
 * Opens (or focuses) a script editor for an FS-Access-API file handle.
 * @param key - Unique dedup key (e.g. 'scripts/my_script.ts')
 */
export async function script_editor_open(parent: HTMLElement, file_handle: FileSystemFileHandle, key: string): Promise<ScriptEditor> {
    return _open(parent, key, {
        win_id: `script-editor:${key}`, title: file_handle.name, file_key: key,
        breakpoints: true, glyph_margin: true, watch_path: key,
        load: async () => { try { return await (await file_handle.getFile()).text() } catch { return '// New script\n' } },
        save: async (content) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const writable = await (file_handle as any).createWritable()
            await writable.write(content)
            await writable.close()
        },
    })
}

/** Opens (or focuses) a script editor by relative project path (Electron / fallback mode). */
export async function script_editor_open_path(parent: HTMLElement, rel_path: string): Promise<ScriptEditor> {
    const filename = rel_path.split('/').pop() ?? rel_path
    return _open(parent, rel_path, {
        win_id: `script-editor:${rel_path}`, title: filename, file_key: rel_path,
        breakpoints: true, glyph_margin: true, watch_path: rel_path,
        load: async () => { try { return await project_read_file(rel_path) } catch { return '// New script\n' } },
        save: (content) => project_write_file(rel_path, content),
    })
}

/**
 * Opens (or focuses) a focused per-event editor: a single on_* method's body, edited as its own
 * de-indented buffer and packed back into the class file on save. Falls back to the full class file
 * when the object-format bridge isn't available (web mode).
 */
export async function script_editor_open_event(parent: HTMLElement, rel_path: string, method: string, title: string): Promise<ScriptEditor> {
    if (!_has_object_op()) return script_editor_open_full(parent, rel_path, title)
    const key = `${rel_path}#${method}`
    return _open(parent, key, {
        win_id: `script-editor:${key}`, title, file_key: key,
        breakpoints: false, glyph_margin: false,   // body-buffer lines ≠ file lines → no breakpoints here
        watch_path: rel_path,                      // reload this event's body if the class file changes
        get_this_vars: async () => {
            try {
                // Declared fields + members assigned in any event (this.x = … in Create, etc.)
                const names = await _object_op('this_members', await project_read_file(rel_path))
                return Array.isArray(names) ? names as string[] : []
            } catch { return [] }
        },
        load: async () => {
            const src  = await project_read_file(rel_path)
            const body = await _object_op('get_event_body', src, method)
            return typeof body === 'string' ? body : ''
        },
        save: async (body) => {
            const src  = await project_read_file(rel_path)         // re-read so sibling events aren't clobbered
            const next = await _object_op('set_event_body', src, method, body)
            if (typeof next === 'string') await project_write_file(rel_path, next)
        },
    })
}

/**
 * Opens (or focuses) the whole class file ("Open as Code" / Full view). On open it normalizes the
 * file — canonical event order + consistent indentation — so the code always reads in execution order.
 */
export async function script_editor_open_full(parent: HTMLElement, rel_path: string, title: string): Promise<ScriptEditor> {
    const key = `${rel_path}#__full`
    return _open(parent, key, {
        win_id: `script-editor:${key}`, title, file_key: key,
        breakpoints: true, glyph_margin: true, watch_path: rel_path,
        load: async () => {
            let src = ''
            try { src = await project_read_file(rel_path) } catch { return '' }
            if (_has_object_op()) {
                try {
                    const norm = await _object_op('normalize_object', src)
                    if (typeof norm === 'string' && norm !== src) { await project_write_file(rel_path, norm); src = norm }
                } catch { /* show raw on failure */ }
            }
            return src
        },
        save: (content) => project_write_file(rel_path, content),
    })
}

/**
 * Opens (or focuses) a Monaco editor over a free-floating code string — used for room and
 * per-instance creation code, which live inside room.json rather than as their own files.
 * @param on_save - Called (debounced + on close) with the latest content; persist it here.
 */
export async function script_editor_open_text(
    parent: HTMLElement, key: string, title: string, initial: string, on_save: (content: string) => void,
): Promise<ScriptEditor> {
    return _open(parent, key, {
        win_id: `script-editor:${key}`, title, file_key: key,
        breakpoints: false, glyph_margin: false,
        load: async () => initial,
        save: (content) => on_save(content),
    })
}

/**
 * Opens a script editor using whichever backend is available.
 * Prefers path-based (Electron/fallback) when no FS-Access-API directory handle exists.
 */
export async function script_editor_open_smart(
    parent: HTMLElement, rel_path: string, get_handle: () => Promise<FileSystemFileHandle>,
): Promise<ScriptEditor> {
    if (!project_has_folder()) { alert('Open a project folder first.'); throw new Error('No project folder') }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).swfs || !((window as any).showDirectoryPicker)) {
        return script_editor_open_path(parent, rel_path)
    }
    const handle = await get_handle()
    return script_editor_open(parent, handle, rel_path)
}

// =========================================================================
// Project object types (autocomplete)
// =========================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _project_types_disposable: any = null

/**
 * Injects project-specific object class declarations into Monaco so object names (e.g. obj_wall,
 * _col) are known to TypeScript. Called when a project loads or its objects change.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function inject_project_types(state: any): void {
    void _load_monaco().then(monaco => {
        if (_project_types_disposable) _project_types_disposable.dispose()
        const object_names = Object.keys(state.resources?.objects || {})
        const declarations = object_names.map(name => `declare const ${name}: typeof gm_object;`).join('\n')
        _project_types_disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `// Project-specific object classes\n${declarations}\n`, 'ts:silkweaver/project-objects.d.ts',
        )
    })
}
