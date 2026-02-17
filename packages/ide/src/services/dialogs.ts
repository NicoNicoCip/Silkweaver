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
        background:#2b2b2b; border:1px solid #555; border-radius:4px;
        padding:18px 20px; min-width:320px; max-width:460px;
        font-family:sans-serif; color:#ccc; font-size:13px;
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
                <button id="_sw_ok" style="padding:4px 20px;cursor:pointer;">OK</button>
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
            <input id="_sw_inp" value="${def.replace(/"/g,'&quot;')}"
                style="padding:5px 8px;background:#3c3c3c;border:1px solid #555;color:#ddd;font-size:13px;border-radius:3px;outline:none;">
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="_sw_ok"     style="padding:4px 20px;cursor:pointer;">OK</button>
                <button id="_sw_cancel" style="padding:4px 20px;cursor:pointer;">Cancel</button>
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
 * Shows a confirmation modal with OK and Cancel buttons.
 * @param msg - Message to display
 * @returns Promise that resolves to true if OK, false if Cancel
 */
export function show_confirm(msg: string): Promise<boolean> {
    return new Promise(resolve => {
        const { close } = _modal(`
            <p style="margin:0;white-space:pre-wrap;">${msg.replace(/</g,'&lt;')}</p>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="_sw_ok"     style="padding:4px 20px;cursor:pointer;">OK</button>
                <button id="_sw_cancel" style="padding:4px 20px;cursor:pointer;">Cancel</button>
            </div>
        `)
        document.getElementById('_sw_ok')!    .addEventListener('click', () => { close(); resolve(true) })
        document.getElementById('_sw_cancel')!.addEventListener('click', () => { close(); resolve(false) })
    })
}
