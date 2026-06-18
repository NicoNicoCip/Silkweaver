/**
 * Documentation window — a GMS-style in-IDE manual.
 *
 * Hosts the generated, self-contained API reference (`docs/api/index.html`, produced by
 * `npm run gen:docs` straight from the engine source + JSDoc) inside an iframe, so the help
 * never drifts from the code. Resolved relative to the IDE document, so it works from the
 * Electron host (file://) without any server. If the file is missing, a hint is shown.
 */

import { FloatingWindow } from '../window_manager.js'
import { ICON }           from '../icons.js'

let _win: FloatingWindow | null = null

/**
 * Opens (or focuses) the documentation window.
 * @param workspace - The IDE workspace element to mount into
 */
export function docs_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }

    _win = new FloatingWindow(
        'sw-docs', 'Documentation', ICON.help,
        { x: 120, y: 60, w: 920, h: 640 },
    )
    _win.on_close(() => { _win = null })

    const body = _win.body
    body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden; background:var(--sw-chrome);'

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'flex:1; width:100%; border:none; background:#fff;'
    // The IDE document lives at exports/ide/index.html; the docs are at <repo>/docs/api/index.html.
    iframe.src = new URL('../../docs/api/index.html', document.baseURI).href

    // If the reference hasn't been generated (or can't be reached), show a hint instead of a blank frame.
    const fallback = document.createElement('div')
    fallback.style.cssText = 'display:none; flex-direction:column; align-items:center; justify-content:center; gap:10px; flex:1; padding:24px; text-align:center; color:var(--sw-text-dim); font-size:13px;'
    fallback.innerHTML =
        '<div style="font-size:15px;color:var(--sw-text);">Documentation not found</div>' +
        '<div>The API reference hasn\'t been generated yet.</div>' +
        '<div>Run <code style="background:var(--sw-chrome2);padding:1px 5px;border-radius:3px;">npm run gen:docs</code> to build it, then reopen this window.</div>'

    iframe.addEventListener('error', () => { iframe.style.display = 'none'; fallback.style.display = 'flex' })
    // Some hosts don't fire 'error' for a missing file:// target — verify the frame actually loaded a doc.
    iframe.addEventListener('load', () => {
        try {
            const doc = iframe.contentDocument
            if (doc && doc.title && !/silkweaver/i.test(doc.title)) { iframe.style.display = 'none'; fallback.style.display = 'flex' }
        } catch { /* cross-origin (loaded fine) — leave it */ }
    })

    body.append(iframe, fallback)
    _win.mount(workspace)
}
