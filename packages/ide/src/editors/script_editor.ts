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

// =========================================================================
// Silkweaver type declarations injected into Monaco
// =========================================================================

/** Ambient declarations for the Silkweaver engine API, injected as an extra lib. */
const SW_TYPES = `
// ── Context ──────────────────────────────────────────────────────────────
declare var this: gm_object;

declare const enum EVENT_TYPE {
    CREATE = 'create', DESTROY = 'destroy',
    STEP = 'step', STEP_BEGIN = 'step_begin', STEP_END = 'step_end',
    DRAW = 'draw', DRAW_GUI = 'draw_gui',
    ALARM = 'alarm', COLLISION = 'collision',
    KEY_DOWN = 'key_down', KEY_UP = 'key_up',
    MOUSE_DOWN = 'mouse_down', MOUSE_UP = 'mouse_up', MOUSE_MOVE = 'mouse_move',
}

declare class gm_object {
    x: number; y: number; z: number;
    speed: number; direction: number;
    hspeed: number; vspeed: number;
    sprite_index: number; image_index: number; image_speed: number;
    image_xscale: number; image_yscale: number; image_angle: number;
    image_alpha: number; image_blend: number;
    visible: boolean; solid: boolean; persistent: boolean; depth: number;
    id: number; object_index: string;
    bbox_left: number; bbox_right: number; bbox_top: number; bbox_bottom: number;
    mask_index: number;
    gravity: number; gravity_direction: number; friction: number;
    xprevious: number; yprevious: number;
    move_direction: number;  // Custom property example
    [key: string]: any;  // Allow any custom properties

    // Lifecycle methods
    create(): void;
    destroy(): void;
    step(): void;
    step_begin(): void;
    step_end(): void;
    draw(): void;
    draw_gui(): void;

    // Instance methods
    place_meeting(x: number, y: number, obj: any): boolean;
    place_free(x: number, y: number): boolean;
    instance_place(x: number, y: number, obj: any): any;
    instance_destroy(): void;
    draw_self(): void;

    // Event registration
    on(event: EVENT_TYPE, callback: () => void): void;
    timer_create(name: string, steps: number, repeat: boolean, callback: () => void): void;
    timer_destroy(name: string): void;
    timer_exists(name: string): boolean;
}

// ── Drawing ──────────────────────────────────────────────────────────────
declare function draw_sprite(sprite: string, subimg: number, x: number, y: number): void;
declare function draw_sprite_ext(sprite: string, subimg: number, x: number, y: number, xscale: number, yscale: number, rot: number, blend: number, alpha: number): void;
declare function draw_text(x: number, y: number, str: string): void;
declare function draw_text_color(x: number, y: number, str: string, c1: number, c2: number, c3: number, c4: number, alpha: number): void;
declare function draw_rectangle(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
declare function draw_circle(x: number, y: number, r: number, outline: boolean): void;
declare function draw_ellipse(x1: number, y1: number, x2: number, y2: number, outline: boolean): void;
declare function draw_line(x1: number, y1: number, x2: number, y2: number): void;
declare function draw_line_width(x1: number, y1: number, x2: number, y2: number, w: number): void;
declare function draw_set_color(col: number): void;
declare function draw_set_alpha(alpha: number): void;
declare function draw_set_font(font: string): void;
declare function draw_set_halign(align: number): void;
declare function draw_set_valign(align: number): void;
declare const fa_left: number; declare const fa_center: number; declare const fa_right: number;
declare const fa_top: number; declare const fa_middle: number; declare const fa_bottom: number;
declare const c_white: number; declare const c_black: number; declare const c_red: number;
declare const c_green: number; declare const c_blue: number; declare const c_yellow: number;
declare const c_orange: number; declare const c_purple: number; declare const c_aqua: number;
declare const c_gray: number; declare const c_silver: number; declare const c_ltgray: number;
declare const c_dkgray: number; declare const c_lime: number; declare const c_maroon: number;
declare const c_navy: number; declare const c_olive: number; declare const c_teal: number;
declare const c_fuchsia: number;
declare function make_color_rgb(r: number, g: number, b: number): number;
declare function color_get_red(col: number): number;
declare function color_get_green(col: number): number;
declare function color_get_blue(col: number): number;

// ── Instances ─────────────────────────────────────────────────────────────
declare class instance {
    static instance_create(x: number, y: number, obj: any): any;
    static instance_nearest(x: number, y: number, obj: any): any;
    static instance_destroy_id(id: number): void;
    instance_destroy(): void;
    place_meeting(x: number, y: number, obj: any): boolean;
    place_free(x: number, y: number): boolean;
    instance_place(x: number, y: number, obj: any): any;
}
declare function instance_create(x: number, y: number, obj: any): number;
declare function instance_destroy(id?: number): void;
declare function instance_exists(id: number): boolean;
declare function instance_number(obj: any): number;
declare function instance_find(obj: any, n: number): number;
declare function instance_nearest(x: number, y: number, obj: any): any;
declare function with_object(obj: any, fn: (inst: gm_object) => void): void;
declare function place_meeting(x: number, y: number, obj: any): boolean;
declare function place_free(x: number, y: number): boolean;
declare function move_contact(dir: number, maxdist: number, solid: boolean): void;
declare function move_towards_point(x: number, y: number, sp: number): void;

// ── Input ─────────────────────────────────────────────────────────────────
declare function keyboard_check(key: number): boolean;
declare function keyboard_check_pressed(key: number): boolean;
declare function keyboard_check_released(key: number): boolean;
declare const vk_left: number; declare const vk_right: number;
declare const vk_up: number; declare const vk_down: number;
declare const vk_space: number; declare const vk_enter: number;
declare const vk_escape: number; declare const vk_shift: number;
declare const vk_control: number; declare const vk_alt: number;
declare function mouse_check_button(btn: number): boolean;
declare function mouse_check_button_pressed(btn: number): boolean;
declare function mouse_check_button_released(btn: number): boolean;
declare const mouse_x: number; declare const mouse_y: number;
declare const mb_left: number; declare const mb_right: number; declare const mb_middle: number;

// ── Audio ─────────────────────────────────────────────────────────────────
declare function audio_play_sound(snd: string, priority: number, loop: boolean): number;
declare function audio_stop_sound(id: number): void;
declare function audio_pause_sound(id: number): void;
declare function audio_resume_sound(id: number): void;
declare function audio_is_playing(id: number): boolean;
declare function audio_set_master_gain(gain: number): void;
declare function audio_sound_gain(id: number, gain: number, ms: number): void;

// ── Rooms ─────────────────────────────────────────────────────────────────
declare function room_goto(name: string): void;
declare function room_goto_next(): void;
declare function room_goto_previous(): void;
declare function room_get_name(): string;
declare function room_get_width(): number;
declare function room_get_height(): number;
declare function room_get_speed(): number;

// ── Math ──────────────────────────────────────────────────────────────────
declare function random(n: number): number;
declare function irandom(n: number): number;
declare function random_range(lo: number, hi: number): number;
declare function irandom_range(lo: number, hi: number): number;
declare function choose(...args: number[]): number;
declare function abs(x: number): number; declare function sign(x: number): number;
declare function floor(x: number): number; declare function ceil(x: number): number;
declare function round(x: number): number; declare function frac(x: number): number;
declare function sqr(x: number): number; declare function sqrt(x: number): number;
declare function power(x: number, n: number): number;
declare function log2(x: number): number; declare function log10(x: number): number;
declare function logn(base: number, x: number): number;
declare function lerp(a: number, b: number, t: number): number;
declare function clamp(val: number, lo: number, hi: number): number;
declare function min(...args: number[]): number; declare function max(...args: number[]): number;
declare function mean(...args: number[]): number; declare function median(...args: number[]): number;
declare function lengthdir_x(len: number, dir: number): number;
declare function lengthdir_y(len: number, dir: number): number;
declare function point_distance(x1: number, y1: number, x2: number, y2: number): number;
declare function point_direction(x1: number, y1: number, x2: number, y2: number): number;
declare function angle_difference(a: number, b: number): number;
declare function dsin(deg: number): number; declare function dcos(deg: number): number;
declare function arctan2(y: number, x: number): number;

// ── Strings ───────────────────────────────────────────────────────────────
declare function string(val: any): string;
declare function real(str: string): number;
declare function string_length(s: string): number;
declare function string_copy(s: string, index: number, count: number): string;
declare function string_pos(sub: string, s: string): number;
declare function string_lower(s: string): string; declare function string_upper(s: string): string;
declare function string_replace(s: string, sub: string, rep: string): string;
declare function string_replace_all(s: string, sub: string, rep: string): string;
declare function string_count(sub: string, s: string): number;
declare function string_delete(s: string, index: number, count: number): string;
declare function string_insert(sub: string, s: string, index: number): string;
declare function string_letters(s: string): string; declare function string_digits(s: string): string;
declare function chr(n: number): string; declare function ord(c: string): number;

// ── Data structures ───────────────────────────────────────────────────────
declare function ds_list_create(): number;
declare function ds_list_destroy(id: number): void;
declare function ds_list_add(id: number, val: any): void;
declare function ds_list_delete(id: number, pos: number): void;
declare function ds_list_find_value(id: number, pos: number): any;
declare function ds_list_find_index(id: number, val: any): number;
declare function ds_list_size(id: number): number;
declare function ds_list_clear(id: number): void;
declare function ds_map_create(): number;
declare function ds_map_destroy(id: number): void;
declare function ds_map_add(id: number, key: any, val: any): void;
declare function ds_map_set(id: number, key: any, val: any): void;
declare function ds_map_delete(id: number, key: any): void;
declare function ds_map_find_value(id: number, key: any): any;
declare function ds_map_exists(id: number, key: any): boolean;
declare function ds_map_size(id: number): number;

// ── Physics ───────────────────────────────────────────────────────────────
declare function physics_world_create(grav_x: number, grav_y: number): void;
declare function physics_fixture_create(): number;
declare function physics_fixture_set_box_shape(fix: number, hw: number, hh: number): void;
declare function physics_fixture_set_circle_shape(fix: number, r: number): void;
declare function physics_fixture_set_density(fix: number, density: number): void;
declare function physics_fixture_set_restitution(fix: number, res: number): void;
declare function physics_fixture_set_friction(fix: number, fric: number): void;
declare function physics_fixture_bind(fix: number, inst: number): void;
declare function physics_fixture_delete(fix: number): void;
declare function physics_body_apply_force(inst: number, fx: number, fy: number, px: number, py: number): void;
declare function physics_body_apply_impulse(inst: number, ix: number, iy: number, px: number, py: number): void;

// ── Global ────────────────────────────────────────────────────────────────
declare const global: Record<string, any>;
declare function show_debug_message(msg: any): void;
declare function show_error(msg: string, abort: boolean): void;
declare function game_end(): void;
declare function game_get_fps(): number;
declare const delta_time: number;
declare const current_time: number;
`

function _setup_monaco(monaco: Monaco): void {
    // Add Silkweaver type declarations as an extra TypeScript lib
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
        SW_TYPES,
        'ts:silkweaver/types.d.ts',
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
