/**
 * IDE modal dialogs.
 * Async replacements for native alert/prompt/confirm that work in Electron.
 */

function _modal(content_html: string): { overlay: HTMLElement, close: () => void } {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.55);
        display:flex; align-items:center; justify-content:center;
    `
    const box = document.createElement('div')
    box.style.cssText = `
        background:var(--sw-chrome); border:1px solid var(--sw-border); border-radius:4px;
        padding:18px 20px; min-width:320px; max-width:460px;
        font-family:sans-serif; color:var(--sw-text); font-size:13px;
        display:flex; flex-direction:column; gap:10px;
        box-shadow:0 4px 24px rgba(0,0,0,0.6);
    `
    box.innerHTML = content_html
    overlay.appendChild(box)
    document.body.appendChild(overlay)
    const close = () => overlay.remove()
    return { overlay, close }
}

/**
 * Shows an alert modal with a message and OK button.
 * @param msg - Message to display
 * @returns Promise that resolves when user clicks OK
 */
export function show_alert(msg: string): Promise<void> {
    return new Promise(resolve => {
        const { close } = _modal(`
            <p style="margin:0;white-space:pre-wrap;">${msg.replace(/</g,'&lt;')}</p>
            <div style="display:flex;justify-content:flex-end;">
                <button id="_sw_ok" class="sw-btn" style="padding:4px 20px;">OK</button>
            </div>
        `)
        document.getElementById('_sw_ok')!.addEventListener('click', () => { close(); resolve() })
    })
}

/**
 * Shows a prompt modal for text input.
 * @param msg - Message to display
 * @param def - Default input value
 * @returns Promise that resolves to input value or null if cancelled
 */
export function show_prompt(msg: string, def = ''): Promise<string | null> {
    return new Promise(resolve => {
        const { close } = _modal(`
            <p style="margin:0;">${msg.replace(/</g,'&lt;')}</p>
            <input id="_sw_inp" class="sw-input" value="${def.replace(/"/g,'&quot;')}"
                style="width:100%;box-sizing:border-box;font-size:13px;">
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="_sw_ok"     class="sw-btn" style="padding:4px 20px;">OK</button>
                <button id="_sw_cancel" class="sw-btn" style="padding:4px 20px;">Cancel</button>
            </div>
        `)
        const inp = document.getElementById('_sw_inp') as HTMLInputElement
        inp.focus(); inp.select()
        const ok     = () => { close(); resolve(inp.value) }
        const cancel = () => { close(); resolve(null) }
        document.getElementById('_sw_ok')!    .addEventListener('click', ok)
        document.getElementById('_sw_cancel')!.addEventListener('click', cancel)
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') cancel() })
    })
}

/**
 * Shows the About box — wordmark, version, license, and project link.
 * @param version - The IDE version string (from generated/version.ts)
 * @returns Promise that resolves when dismissed
 */
export function show_about(version: string): Promise<void> {
    return new Promise(resolve => {
        const { overlay, close } = _modal(`
            <div style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;padding:6px 0 2px;">
                <div style="font-size:24px;font-weight:700;letter-spacing:.3px;">Silk<span style="color:var(--sw-accent);">weaver</span></div>
                <div style="color:var(--sw-text-dim);font-size:12px;margin-top:-3px;">Game Engine &amp; IDE</div>
                <div style="font-size:13px;margin-top:8px;">Version ${version}</div>
                <div style="color:var(--sw-text-dim);font-size:11.5px;">GPL-3.0 · © FinnWillow</div>
                <div style="color:var(--sw-text-dim);font-size:11.5px;user-select:text;">github.com/NicoNicoCip/Silkweaver</div>
            </div>
            <div style="display:flex;justify-content:flex-end;">
                <button id="_sw_ok" class="sw-btn" style="padding:4px 20px;">OK</button>
            </div>
        `)
        const done = () => { document.removeEventListener('keydown', onkey); close(); resolve() }
        const onkey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') done() }
        document.addEventListener('keydown', onkey)
        overlay.addEventListener('click', e => { if (e.target === overlay) done() })  // backdrop click
        document.getElementById('_sw_ok')!.addEventListener('click', done)
    })
}

/**
 * Shows a confirmation modal with OK and Cancel buttons.
 * @param msg - Message to display
 * @returns Promise that resolves to true if OK, false if Cancel
 */
export function show_confirm(msg: string): Promise<boolean> {
    return new Promise(resolve => {
        const { close } = _modal(`
            <p style="margin:0;white-space:pre-wrap;">${msg.replace(/</g,'&lt;')}</p>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="_sw_ok"     class="sw-btn" style="padding:4px 20px;">OK</button>
                <button id="_sw_cancel" class="sw-btn" style="padding:4px 20px;">Cancel</button>
            </div>
        `)
        document.getElementById('_sw_ok')!    .addEventListener('click', () => { close(); resolve(true) })
        document.getElementById('_sw_cancel')!.addEventListener('click', () => { close(); resolve(false) })
    })
}
