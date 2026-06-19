/**
 * File-change propagation (parallel editing).
 *
 * The Electron host watches the project folder and pushes the project-relative path of any
 * externally-changed file (an edit made in another window, or outside the IDE). Editors and the
 * object window subscribe by relative path and reload themselves so they never show stale content.
 * The host already filters out the IDE's own saves, so this only fires for genuine external edits.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _swfs(): any { return (window as any).swfs }

const _subs: Map<string, Set<(rel: string) => void>> = new Map()
let _inited = false

/** Registers the host callback once. Safe to call multiple times. */
export function file_watch_init(): void {
    if (_inited) return
    const fs = _swfs()
    if (!fs?.on_file_changed) return   // not running under the desktop host
    _inited = true
    fs.on_file_changed((rel: string) => {
        const cbs = _subs.get(rel)
        if (cbs) for (const cb of [...cbs]) { try { cb(rel) } catch { /* ignore */ } }
    })
}

/** Asks the host to (re)watch a project folder. Pass null to stop. */
export function file_watch_set_folder(folder: string | null): void {
    _swfs()?.watch_folder?.(folder)
}

/**
 * Subscribes to external changes of one project-relative file.
 * @returns An unsubscribe function.
 */
export function file_watch_subscribe(rel_path: string, cb: (rel: string) => void): () => void {
    let set = _subs.get(rel_path)
    if (!set) { set = new Set(); _subs.set(rel_path, set) }
    set.add(cb)
    return () => {
        const s = _subs.get(rel_path)
        if (s) { s.delete(cb); if (s.size === 0) _subs.delete(rel_path) }
    }
}
