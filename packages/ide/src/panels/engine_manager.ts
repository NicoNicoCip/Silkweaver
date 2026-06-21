/**
 * Engine Versions manager (1.4.1).
 *
 * A project builds against ONE pinned engine, vendored into its `.engine/` — updating the IDE never
 * changes it. This window is where you move a project between engine versions: it manages a global,
 * per-user cache of prebuilt engine bundles (downloaded from GitHub releases), lets you pick which
 * cached version a project uses, download new ones, or delete cached ones.
 *
 * The IDE always ships with its own bundled engine (the offline floor); that one is always usable
 * without a download. Versions released before the version manager (and any the GitHub API can't be
 * reached for) simply don't appear as downloadable — the cache + bundled engine still work offline.
 */

import { FloatingWindow } from '../window_manager.js'
import { ICON }           from '../icons.js'
import {
    project_get_folder_path, project_is_desktop, project_read_file,
    project_toolchain_engine_version, project_engine_cache_list,
    project_engine_remote_list, project_engine_download,
    project_engine_cache_remove, project_vendor_engine, version_compare,
} from '../services/project.js'

let _win: FloatingWindow | null = null

/** Opens (or focuses) the Engine Versions manager. Mounts into the workspace by default. */
export function engine_manager_open(workspace?: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    const mount = workspace ?? document.getElementById('sw-workspace')
    if (!mount) return

    _win = new FloatingWindow('sw-engine-manager', 'Engine Versions', ICON.settings, { x: 200, y: 90, w: 540, h: 460 })
    _win.on_close(() => { _win = null })

    const body = _win.body
    body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden; background:var(--sw-chrome); font-size:12px;'

    const intro = document.createElement('div')
    intro.style.cssText = 'padding:10px 12px; color:var(--sw-text-dim); line-height:1.5; border-bottom:1px solid var(--sw-border);'
    intro.innerHTML =
        'The engine each project builds against is pinned per-project — updating the IDE never changes it. ' +
        'Pick a version below to vendor it into the current project, or manage the shared download cache.'

    const statusBar = document.createElement('div')
    statusBar.style.cssText = 'padding:7px 12px; font-size:11.5px; color:var(--sw-text-dim); border-bottom:1px solid var(--sw-border); min-height:16px;'

    const list = document.createElement('div')
    list.style.cssText = 'flex:1; overflow-y:auto; padding:6px 0;'

    const footer = document.createElement('div')
    footer.style.cssText = 'display:flex; gap:8px; align-items:center; padding:8px 12px; border-top:1px solid var(--sw-border);'
    const refreshBtn = _btn('Refresh online list', () => void render())
    footer.appendChild(refreshBtn)

    body.append(intro, statusBar, list, footer)
    _win.mount(mount)

    const setStatus = (msg: string): void => { statusBar.textContent = msg }

    /** Gather state and (re)draw the version list. */
    async function render(): Promise<void> {
        if (!project_is_desktop()) {
            list.innerHTML = ''
            setStatus('The engine version manager needs the desktop app.')
            return
        }
        setStatus('Loading…')
        const folder  = project_get_folder_path()
        const bundled = await project_toolchain_engine_version()
        const cached  = new Set(await project_engine_cache_list())
        let pinned: string | null = null
        if (folder) {
            try { pinned = (JSON.parse(await project_read_file('project.json')) as { engineVersion?: string }).engineVersion ?? null } catch { /* none */ }
        }
        const remote = await project_engine_remote_list()
        const urlByVer = new Map(remote.versions.map(v => [v.version, v.url]))

        const versions = new Set<string>()
        if (bundled) versions.add(bundled)
        if (pinned)  versions.add(pinned)
        cached.forEach(v => versions.add(v))
        remote.versions.forEach(v => versions.add(v.version))
        const sorted = [...versions].sort((a, b) => version_compare(b, a))   // newest first

        setStatus(
            (folder ? `Project pins engine ${pinned ?? '—'}.` : 'No project open — open one to assign an engine (you can still manage the cache).')
            + (remote.ok ? '' : '  ⚠ Offline / GitHub unreachable — showing bundled + cached only.')
        )

        list.innerHTML = ''
        if (!sorted.length) { list.appendChild(_empty('No engine versions found.')); return }
        for (const v of sorted) {
            list.appendChild(_row(v, {
                bundled: v === bundled,
                pinned:  v === pinned,
                cached:  cached.has(v),
                online:  urlByVer.has(v),
                url:     urlByVer.get(v) ?? null,
                folder,
                bundledVersion: bundled,
            }, setStatus, render))
        }
    }

    void render()
}

// ── Row rendering ─────────────────────────────────────────────────────────────

interface row_ctx {
    bundled: boolean
    pinned:  boolean
    cached:  boolean
    online:  boolean
    url:     string | null
    folder:  string | null
    bundledVersion: string | null
}

function _row(version: string, ctx: row_ctx, setStatus: (s: string) => void, refresh: () => Promise<void>): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex; align-items:center; gap:8px; padding:7px 12px; border-bottom:1px solid var(--sw-border2);'

    const name = document.createElement('span')
    name.textContent = version
    name.style.cssText = 'font-family:Consolas,monospace; font-size:12.5px; color:var(--sw-text); width:70px;'

    const badges = document.createElement('div')
    badges.style.cssText = 'display:flex; gap:4px; flex:1; flex-wrap:wrap;'
    if (ctx.pinned)  badges.appendChild(_badge('In use', 'var(--sw-accent,#3a7afe)'))
    if (ctx.bundled) badges.appendChild(_badge('Bundled', '#6a8'))
    if (ctx.cached && !ctx.bundled) badges.appendChild(_badge('Cached', '#888'))
    if (!ctx.cached && !ctx.bundled && ctx.online) badges.appendChild(_badge('Online', '#777'))

    const actions = document.createElement('div')
    actions.style.cssText = 'display:flex; gap:6px;'

    const available = ctx.bundled || ctx.cached || ctx.online
    // Use (vendor into the current project) — downloads first if needed.
    if (ctx.folder && !ctx.pinned && available) {
        actions.appendChild(_btn('Use', async () => {
            if (!ctx.bundled && !ctx.cached) {
                if (!ctx.url) { setStatus(`No downloadable bundle for ${version}.`); return }
                setStatus(`Downloading engine ${version}…`)
                const d = await project_engine_download(version, ctx.url)
                if (!d.ok) { setStatus(`Download failed: ${d.error ?? 'unknown error'}`); return }
            }
            setStatus(`Vendoring engine ${version} into the project…`)
            const r = await project_vendor_engine(ctx.folder!, ctx.bundled ? undefined : version)
            if (r.ok) {
                setStatus(`✓ Project now builds against engine ${r.version ?? version}.`)
                document.dispatchEvent(new CustomEvent('sw:engine-pinned', { detail: { version: r.version ?? version } }))
                void refresh()
            } else setStatus(`Failed: ${r.error ?? 'unknown error'}`)
        }))
    }
    // Download (pre-cache without vendoring).
    if (!ctx.cached && !ctx.bundled && ctx.online && ctx.url) {
        actions.appendChild(_btn('Download', async () => {
            setStatus(`Downloading engine ${version}…`)
            const d = await project_engine_download(version, ctx.url!)
            setStatus(d.ok ? `✓ Cached engine ${version}.` : `Download failed: ${d.error ?? 'unknown error'}`)
            if (d.ok) void refresh()
        }))
    }
    // Delete from cache (never the bundled default or the version in use).
    if (ctx.cached && !ctx.bundled && !ctx.pinned) {
        actions.appendChild(_btn('Delete', async () => {
            setStatus(`Removing engine ${version} from the cache…`)
            const r = await project_engine_cache_remove(version)
            setStatus(r.ok ? `Removed engine ${version} from the cache.` : `Remove failed: ${r.error ?? 'unknown error'}`)
            if (r.ok) void refresh()
        }, 'danger'))
    }

    row.append(name, badges, actions)
    return row
}

// ── Small UI helpers ──────────────────────────────────────────────────────────

function _btn(label: string, on_click: () => void | Promise<void>, kind: 'normal' | 'danger' = 'normal'): HTMLButtonElement {
    const b = document.createElement('button')
    b.className = 'sw-btn'
    b.textContent = label
    b.style.cssText = 'font-size:11.5px; padding:3px 10px;' + (kind === 'danger' ? ' color:#e66;' : '')
    b.addEventListener('click', () => { void on_click() })
    return b
}

function _badge(text: string, color: string): HTMLElement {
    const s = document.createElement('span')
    s.textContent = text
    s.style.cssText = `font-size:10px; padding:1px 6px; border-radius:8px; background:${color}22; color:${color}; border:1px solid ${color}55;`
    return s
}

function _empty(text: string): HTMLElement {
    const d = document.createElement('div')
    d.textContent = text
    d.style.cssText = 'padding:18px 12px; color:var(--sw-text-dim); text-align:center;'
    return d
}
