/**
 * In-app update notice (desktop only) — MANUAL by design (1.4.1).
 *
 * Nothing is checked on launch; the user triggers a check from Help → About → "Check for updates".
 * Results surface as a small dismissible chip bottom-right: up-to-date, an available version (opt in
 * to download), progress, then restart-to-apply (or "Later" — installs on next quit). Driven by the
 * electron-updater bridge on `window.swfs`; a no-op in the browser backend.
 */

interface updater_bridge {
    check_for_updates:    () => Promise<boolean>
    download_update:      () => Promise<void>
    install_update:       () => Promise<void>
    on_update_available:  (cb: (version: string) => void) => void
    on_update_none?:      (cb: () => void) => void
    on_update_error?:     (cb: (msg: string) => void) => void
    on_update_progress:   (cb: (percent: number) => void) => void
    on_update_downloaded: (cb: (version: string) => void) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _bridge = (): updater_bridge | undefined => (window as any).swfs

let _chip: HTMLElement | null = null
let _checking = false   // a manual check is in flight (so we know to report "up to date" / errors)

/** Wires the update chip to the host's updater events. Call once at boot. No check is run here. */
export function updater_init(): void {
    const b = _bridge()
    if (!b || typeof b.on_update_available !== 'function') return   // browser backend / older host
    b.on_update_available(v => { _checking = false; _render_available(v) })
    b.on_update_progress(p => _render_progress(p))
    b.on_update_downloaded(v => _render_downloaded(v))
    b.on_update_none?.(() => { if (_checking) { _checking = false; _render_message("You're on the latest version.", true, 4000) } })
    b.on_update_error?.(() => { if (_checking) { _checking = false; _render_message('Update check failed (offline?).') } })
}

/** Manually check for an app update (Help → About). Surfaces the result as a chip. */
export async function updater_check_now(): Promise<void> {
    const b = _bridge()
    if (!b || typeof b.check_for_updates !== 'function') { _render_message('Updates are available in the desktop app.'); return }
    _checking = true
    _render_message('Checking for updates…', false)
    const supported = await b.check_for_updates()
    if (!supported) { _checking = false; _render_message('Updates apply to the installed app only.') }
    // otherwise the update-available / none / error events drive the rest
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

/** A plain status chip (checking / up-to-date / error). Auto-dismisses after `autoCloseMs` if given. */
function _render_message(text: string, dismissable = true, autoCloseMs = 0): void {
    const c = _ensure_chip()
    c.append(_label(text))
    if (dismissable) c.append(_xbtn())
    if (autoCloseMs) setTimeout(() => _close(), autoCloseMs)
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
