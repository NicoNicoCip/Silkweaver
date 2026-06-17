/**
 * Script editor panel backed by Monaco.
 * Monaco is loaded from CDN via its AMD loader to keep ide.js small.
 *
 * Usage:
 *   const ed = new ScriptEditor()
 *   ed.open(workspace, file_handle, 'my_script.ts')
 */

import { FloatingWindow }                           from '../window_manager.js'
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

    // Disable diagnostic squiggles for missing module imports in game scripts
    // (games may import engine globals that are injected at runtime)
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
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

    /** Called when the editor saves the file (with the updated content). */
    on_save: (content: string) => void = () => {}

    constructor(title: string, default_x = 240, default_y = 30) {
        const id = `script-editor-${++_editor_id_counter}`
        this._win = new FloatingWindow(id, title, 'icons/script.svg', {
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

        bp_register_editor(this._file_key, this._editor)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._editor.onMouseDown((e: any) => {
            if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                const line: number = e.target.position?.lineNumber
                if (line) bp_toggle(this._file_key, line)
            }
        })

        this._editor.onDidChangeModelContent(() => {
            this._dirty = true
            this._win.set_title('● ' + (rel_path.split('/').pop() ?? rel_path))
            if (this._save_timer !== null) clearTimeout(this._save_timer)
            this._save_timer = setTimeout(() => this._do_save(), 500)
        })

        this._win.body.appendChild(
            Object.assign(document.createElement('div'), {
                className: 'sw-editor-toolbar',
            })
        )
    }

    async open_inline(parent: HTMLElement, content: string, lang = 'typescript'): Promise<void> {
        this._win.mount(parent)
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
            fixedOverflowWidgets: true,
        })

        this._editor.onDidChangeModelContent(() => {
            this._dirty = true
            this.on_save(this._editor!.getValue())
        })
    }

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
        const title = this._file_handle?.name ?? this._rel_path?.split('/').pop() ?? 'script'
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

    const ed = new ScriptEditor(file_handle.name)
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
    const ed = new ScriptEditor(filename)
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
