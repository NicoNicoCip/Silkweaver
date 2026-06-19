/**
 * In-app auto-update notice (desktop only).
 *
 * Non-intrusive by design: nothing happens until an update actually exists, at which point a small
 * dismissible chip appears bottom-right. The user opts in to download, watches progress, then
 * restarts to apply (or "Later" — it installs on the next quit). Driven by the electron-updater
 * bridge on `window.swfs`; a no-op in the browser backend.
 */

interface updater_bridge {
    check_for_updates:    () => Promise<void>
    download_update:      () => Promise<void>
    install_update:       () => Promise<void>
    on_update_available:  (cb: (version: string) => void) => void
    on_update_progress:   (cb: (percent: number) => void) => void
    on_update_downloaded: (cb: (version: string) => void) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _bridge = (): updater_bridge | undefined => (window as any).swfs

let _chip: HTMLElement | null = null

/** Wires the update chip to the host's updater events. Call once at boot. */
export function updater_init(): void {
    const b = _bridge()
    if (!b || typeof b.on_update_available !== 'function') return   // browser backend / older host
    b.on_update_available(v => _render_available(v))
    b.on_update_progress(p => _render_progress(p))
    b.on_update_downloaded(v => _render_downloaded(v))
    void b.check_for_updates()   // background check (main also checks; this covers a renderer reload)
}

// =========================================================================
// Chip rendering
// =========================================================================

function _ensure_chip(): HTMLElement {
    if (_chip) { _chip.innerHTML = ''; return _chip }
    const c = document.createElement('div')
    c.style.cssText = `
        position:fixed; right:14px; bottom:14px; z-index:99999;
        display:flex; align-items:center; gap:10px;
        background:var(--sw-chrome,#3c3c3c); color:var(--sw-text,#f0f0f0);
        border:1px solid var(--sw-border,#555); border-radius:8px;
        padding:8px 12px; font-size:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);`
    document.body.appendChild(c)
    _chip = c
    return c
}

function _close(): void { _chip?.remove(); _chip = null }

function _render_available(version: string): void {
    const b = _bridge(); if (!b) return
    const c = _ensure_chip()
    c.append(
        _label(`Update available — v${version}`),
        _btn('Download', () => { void b.download_update(); _render_progress(0) }),
        _xbtn(),
    )
}

function _render_progress(percent: number): void {
    const c = _ensure_chip()
    c.append(_label(`Downloading update… ${percent}%`))
}

function _render_downloaded(version: string): void {
    const b = _bridge(); if (!b) return
    const c = _ensure_chip()
    const later = _btn('Later', () => _close())   // applies on next quit (autoInstallOnAppQuit)
    later.style.cssText += 'background:transparent; color:var(--sw-text-dim,#aaa);'
    c.append(
        _label(`v${version} ready to install`),
        _btn('Restart now', () => void b.install_update()),
        later,
        _xbtn(),
    )
}

// =========================================================================
// Tiny element helpers
// =========================================================================

function _label(text: string): HTMLElement {
    const s = document.createElement('span')
    s.textContent = text
    return s
}

function _btn(text: string, on_click: () => void): HTMLButtonElement {
    const b = document.createElement('button')
    b.textContent = text
    b.style.cssText = `background:var(--sw-accent,#0078d4); color:#fff; border:none; border-radius:5px;
        padding:4px 10px; font-size:11.5px; cursor:pointer; flex-shrink:0;`
    b.addEventListener('click', on_click)
    return b
}

function _xbtn(): HTMLButtonElement {
    const b = document.createElement('button')
    b.textContent = '✕'; b.title = 'Dismiss'
    b.style.cssText = 'background:transparent; color:var(--sw-text-dim,#aaa); border:none; cursor:pointer; font-size:12px; padding:2px 4px;'
    b.addEventListener('click', () => _close())
    return b
}
