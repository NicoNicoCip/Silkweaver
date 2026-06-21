/**
 * Start Page — the project launcher shown on boot (and via File → Start Page).
 *
 * Lists recent projects (open / rename / remove), creates a new project from a template at a
 * chosen location, or opens an existing folder. Desktop (Electron) only for the recent list and
 * folder picking; in the (deprecated) browser backend it falls back to a plain Open button.
 */

import { project_new, project_create_from_template,
         project_pick_folder, project_join, project_open_path, project_rename_at,
         project_open, project_is_desktop, project_get_last_folder } from './services/project.js'
import type { project_state } from './services/project.js'
import { TEMPLATES } from './project_templates.js'
import { SW_VERSION } from './generated/version.js'

// =========================================================================
// Recent-projects store (localStorage)
// =========================================================================

interface recent_project { name: string; path: string; ts: number }
const RECENT_KEY = 'sw_recent_projects'

function recent_list(): recent_project[] {
    try {
        const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
        return Array.isArray(v) ? v : []
    } catch { return [] }
}
function recent_save(list: recent_project[]): void { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 30))) }

/** Records (or bumps to the top) a project in the recent list. */
export function recent_add(name: string, path: string): void {
    if (!path) return
    const list = recent_list().filter(p => p.path !== path)
    list.unshift({ name, path, ts: Date.now() })
    recent_save(list)
}
function recent_remove(path: string): void { recent_save(recent_list().filter(p => p.path !== path)) }
function recent_rename(path: string, name: string): void {
    recent_save(recent_list().map(p => p.path === path ? { ...p, name } : p))
}

// =========================================================================
// Public API
// =========================================================================

export interface start_page_hooks {
    /** Hand a freshly loaded/created project to the IDE shell (typically `_set_project`). */
    load_project: (state: project_state) => void
}

let _overlay: HTMLElement | null = null
let _hooks: start_page_hooks | null = null

function _on_key(e: KeyboardEvent): void { if (e.key === 'Escape') start_page_hide() }

/** Shows the Start Page as a full page — the editor chrome is hidden while it's up. */
export function start_page_show(hooks: start_page_hooks): void {
    _hooks = hooks
    start_page_hide()
    _overlay = _build()
    document.body.appendChild(_overlay)
    document.body.classList.add('sw-startpage-open')   // hides the menubar/toolbar/main/status bar
    document.addEventListener('keydown', _on_key)
}

/** Removes the Start Page and restores the editor (on open/create, Esc, or the close button). */
export function start_page_hide(): void {
    document.removeEventListener('keydown', _on_key)
    document.body.classList.remove('sw-startpage-open')
    _overlay?.remove()
    _overlay = null
}

// =========================================================================
// Build
// =========================================================================

function _build(): HTMLElement {
    const o = document.createElement('div')
    o.id = 'sw-startpage'
    o.style.cssText = 'position:fixed; inset:0; z-index:5000; background:var(--sw-bg,#1b1b1b); color:var(--sw-text,#e6e6e6); ' +
        'display:flex; flex-direction:column; font:14px/1.5 "Segoe UI",system-ui,sans-serif; overflow:auto;'

    // Header
    const head = document.createElement('div')
    head.style.cssText = 'padding:26px 34px 14px; flex-shrink:0; display:flex; align-items:flex-start;'
    const title = document.createElement('div')
    title.style.cssText = 'flex:1;'
    title.innerHTML = '<div style="font-size:26px;font-weight:700;">Silk<span style="color:var(--sw-accent,#4cc2ff)">weaver</span>' +
        `<span style="font-size:12px;font-weight:600;color:var(--sw-text-dim,#9a9a9a);margin-left:8px;vertical-align:middle;">v${SW_VERSION}</span></div>` +
        '<div style="color:var(--sw-text-dim,#9a9a9a);font-size:13px;margin-top:2px;">Open a recent project, start a new one, or open from a folder.</div>'
    const close = document.createElement('button')
    close.className = 'sw-x-btn'; close.textContent = '✕'; close.title = 'Close (Esc)'
    close.style.cssText = 'width:28px; height:28px; font-size:15px;'
    close.addEventListener('click', () => start_page_hide())
    head.append(title, close)
    o.appendChild(head)

    // Two columns
    const cols = document.createElement('div')
    cols.style.cssText = 'display:flex; gap:24px; padding:6px 34px 34px; flex:1; min-height:0; align-items:flex-start; flex-wrap:wrap;'
    o.appendChild(cols)

    cols.appendChild(_recent_column())
    cols.appendChild(_new_column())
    return o
}

// ── Recent column ──────────────────────────────────────────────────────────

function _recent_column(): HTMLElement {
    const col = document.createElement('div')
    col.style.cssText = 'flex:1 1 340px; min-width:300px; max-width:560px;'
    col.appendChild(_section_title('Recent projects'))

    const list = document.createElement('div')
    list.style.cssText = 'display:flex; flex-direction:column; gap:6px; margin-top:8px;'
    col.appendChild(list)

    const render = (): void => {
        list.innerHTML = ''
        const items = recent_list()
        if (!project_is_desktop()) {
            list.appendChild(_hint('Recent projects are available in the desktop app.'))
            return
        }
        if (items.length === 0) {
            list.appendChild(_hint('No recent projects yet — create one on the right, or open a folder.'))
            return
        }
        for (const p of items) list.appendChild(_recent_row(p, render))
    }
    render()

    // Open an existing project by picking its project.json (never a bare folder).
    const open_btn = _btn('Open project…', 'ghost', async () => {
        try {
            const result = await project_open()
            if (!result) return
            recent_add(result.state.name, _current_folder())
            _finish(result.state)
        } catch (err) {
            await _alert(err instanceof Error ? err.message : String(err))
        }
    })
    open_btn.style.marginTop = '14px'
    col.appendChild(open_btn)
    return col
}

function _recent_row(p: recent_project, refresh: () => void): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:9px 11px; border:1px solid var(--sw-border,#363636); ' +
        'border-radius:8px; background:var(--sw-chrome,#222); cursor:pointer;'
    row.addEventListener('mouseenter', () => row.style.borderColor = 'var(--sw-accent,#4cc2ff)')
    row.addEventListener('mouseleave', () => row.style.borderColor = 'var(--sw-border,#363636)')

    const info = document.createElement('div')
    info.style.cssText = 'flex:1; min-width:0;'
    const nm = document.createElement('div'); nm.textContent = p.name; nm.style.cssText = 'font-weight:600; font-size:14px;'
    const pa = document.createElement('div'); pa.textContent = p.path; pa.style.cssText = 'font-size:11px; color:var(--sw-text-dim,#9a9a9a); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
    info.append(nm, pa)
    info.addEventListener('click', () => _open_recent(p))

    const ren = _icon_btn('✎', 'Rename', async (e) => {
        e.stopPropagation()
        const next = await _prompt('New project name:', p.name)
        if (!next || next.trim() === p.name) return
        const ok = await project_rename_at(p.path, next.trim())
        recent_rename(p.path, next.trim())
        if (!ok) { /* folder may have moved — keep the list entry renamed anyway */ }
        refresh()
    })
    const del = _icon_btn('✕', 'Remove from list', (e) => { e.stopPropagation(); recent_remove(p.path); refresh() })

    row.append(info, ren, del)
    return row
}

async function _open_recent(p: recent_project): Promise<void> {
    const state = await project_open_path(p.path)
    if (!state) { await _alert(`Couldn't open "${p.name}".\nThe folder may have been moved or deleted.`); return }
    recent_add(state.name, p.path)
    _finish(state)
}

// ── New column ──────────────────────────────────────────────────────────────

function _new_column(): HTMLElement {
    const col = document.createElement('div')
    col.style.cssText = 'flex:1 1 340px; min-width:300px; max-width:460px; background:var(--sw-chrome,#222); border:1px solid var(--sw-border,#363636); border-radius:10px; padding:18px 20px;'
    col.appendChild(_section_title('New project'))

    const form = document.createElement('div')
    form.style.cssText = 'display:flex; flex-direction:column; gap:12px; margin-top:12px;'
    col.appendChild(form)

    // Name
    const name = _text_input('my-game')
    form.appendChild(_field('Name', name))

    // Location
    let location = project_get_last_folder() ? _parent_of(project_get_last_folder()!) : ''
    const loc_val = document.createElement('div')
    loc_val.style.cssText = 'flex:1; min-width:0; font-size:12px; color:var(--sw-text-dim,#9a9a9a); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
    const set_loc = (): void => { loc_val.textContent = location || '(choose a folder)'; loc_val.style.color = location ? 'var(--sw-text,#e6e6e6)' : 'var(--sw-text-dim,#9a9a9a)' }
    set_loc()
    const loc_btn = _btn('Choose…', 'ghost', async () => {
        const picked = await project_pick_folder('save', location || undefined)
        if (picked) { location = picked; set_loc(); update_path() }
    })
    loc_btn.style.cssText += 'padding:5px 12px; flex-shrink:0;'
    const loc_row = document.createElement('div'); loc_row.style.cssText = 'display:flex; align-items:center; gap:8px;'
    loc_row.append(loc_val, loc_btn)
    const loc_field = _field('Location', loc_row)
    if (!project_is_desktop()) loc_field.style.display = 'none'
    form.appendChild(loc_field)

    // Template
    const tmpl = document.createElement('select')
    tmpl.className = 'sw-select'
    tmpl.style.cssText = 'width:100%;'
    for (const t of TEMPLATES) { const op = document.createElement('option'); op.value = t.id; op.textContent = t.label; tmpl.appendChild(op) }
    const tmpl_desc = document.createElement('div')
    tmpl_desc.style.cssText = 'font-size:11.5px; color:var(--sw-text-dim,#9a9a9a); margin-top:4px;'
    const upd_desc = (): void => { tmpl_desc.textContent = TEMPLATES.find(t => t.id === tmpl.value)?.description ?? '' }
    tmpl.addEventListener('change', upd_desc); upd_desc()
    const tmpl_wrap = document.createElement('div'); tmpl_wrap.append(tmpl, tmpl_desc)
    form.appendChild(_field('Template', tmpl_wrap))

    // Create — the chosen template's project (window/room size and layout come from the template).
    const create = _btn('Create project', 'primary', async () => {
        await _create(name.value.trim() || 'my-game', location, tmpl.value)
    })
    create.style.marginTop = '6px'
    form.appendChild(create)

    // Live "will create at" line.
    const dest = document.createElement('div')
    dest.style.cssText = 'font-size:11px; color:var(--sw-text-dim,#9a9a9a);'
    const update_path = (): void => {
        if (!project_is_desktop()) { dest.textContent = ''; return }
        const folder = _folder_name(name.value)
        dest.textContent = location && folder ? `Creates: ${location}\\${folder}` : ''
    }
    name.addEventListener('input', update_path); update_path()
    form.appendChild(dest)

    return col
}

async function _create(name: string, location: string, template_id: string): Promise<void> {
    if (project_is_desktop()) {
        if (!location) { await _alert('Choose a location for the new project first.'); return }
        // Templates are real project folders bundled with the toolchain — copy one in, then open it.
        const folder = project_join(location, _folder_name(name))
        const res = await project_create_from_template(template_id, folder, name)
        if (!res.ok) { await _alert('Could not create the project:\n' + (res.error ?? 'unknown error')); return }
        const state = await project_open_path(folder)
        if (!state) { await _alert('Project created but could not be opened:\n' + folder); return }
        recent_add(name, folder)
        _finish(state)
    } else {
        // Browser backend (deprecated, no filesystem): just open a blank in-memory project.
        const state = project_new()
        state.name = name
        _finish(state)
    }
}

// =========================================================================
// Small DOM + flow helpers
// =========================================================================

function _finish(state: project_state): void {
    _hooks?.load_project(state)
    start_page_hide()
}

/** The active folder path after an Electron open (best-effort, for recent tracking). */
function _current_folder(): string {
    // project_open() sets the folder internally; localStorage holds the last one.
    return project_get_last_folder() ?? ''
}

function _folder_name(name: string): string {
    return (name || 'my-game').trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'my-game'
}
function _parent_of(p: string): string {
    const i = Math.max(p.lastIndexOf('\\'), p.lastIndexOf('/'))
    return i > 0 ? p.slice(0, i) : p
}

function _section_title(t: string): HTMLElement {
    const el = document.createElement('div')
    el.textContent = t
    el.style.cssText = 'font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sw-text-dim,#9a9a9a);'
    return el
}
function _hint(t: string): HTMLElement {
    const el = document.createElement('div')
    el.textContent = t
    el.style.cssText = 'font-size:13px; color:var(--sw-text-dim,#9a9a9a); padding:10px 2px;'
    return el
}
function _field(label: string, control: HTMLElement): HTMLElement {
    const wrap = document.createElement('label')
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:4px; flex:1; min-width:0;'
    const l = document.createElement('span'); l.textContent = label; l.style.cssText = 'font-size:11px; color:var(--sw-text-dim,#9a9a9a);'
    wrap.append(l, control)
    return wrap
}
function _text_input(val: string): HTMLInputElement {
    const i = document.createElement('input'); i.type = 'text'; i.className = 'sw-input'; i.value = val; i.style.width = '100%'
    return i
}
function _btn(label: string, kind: 'primary' | 'ghost', cb: () => void): HTMLButtonElement {
    const b = document.createElement('button')
    b.textContent = label
    b.style.cssText = 'padding:9px 16px; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer; border:1px solid var(--sw-border,#363636); ' +
        (kind === 'primary'
            ? 'background:var(--sw-accent,#4cc2ff); border-color:var(--sw-accent,#4cc2ff); color:#fff;'
            : 'background:transparent; color:var(--sw-text,#e6e6e6);')
    b.addEventListener('click', cb)
    return b
}
function _icon_btn(glyph: string, title: string, cb: (e: MouseEvent) => void): HTMLButtonElement {
    const b = document.createElement('button')
    b.className = 'sw-x-btn'; b.textContent = glyph; b.title = title
    b.addEventListener('click', cb)
    return b
}

// Lightweight prompt/alert overlays (the IDE has no global ones exported here).
function _prompt(msg: string, def: string): Promise<string | null> {
    return new Promise(resolve => {
        const r = window.prompt(msg, def)
        resolve(r)
    })
}
function _alert(msg: string): Promise<void> {
    window.alert(msg)
    return Promise.resolve()
}
