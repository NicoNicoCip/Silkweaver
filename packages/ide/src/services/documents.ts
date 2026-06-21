/**
 * Central save / dirty manager (1.4.0 unified saving).
 *
 * Every editor with savable CONTENT registers a "document": a dirty flag plus a `flush()` that
 * writes its current in-memory state to disk. Editors no longer write on every edit — they mutate
 * in memory and call `mark_dirty()`. Nothing hits disk until the user presses Ctrl+S
 * (`documents_save_all`), and closing a dirty window prompts to Save / Don't save / Cancel — unless
 * auto-save is on, in which case the prompt is auto-confirmed.
 *
 * Structural project changes (adding/renaming resources, folders, settings) persist through the
 * project manifest instead, which the IDE shell tracks separately (see index.ts `_project_dirty`).
 */

import type { FloatingWindow } from '../window_manager.js'
import { show_save_prompt }    from './dialogs.js'
import { editor_prefs_get }    from '../editor_prefs.js'

// =========================================================================
// Types / state
// =========================================================================

/** What an editor provides when registering a savable document. */
export interface doc_spec {
    id:      string                            // stable unique key (the editor's file_key)
    label:   string                            // shown in close / quit prompts
    flush:   () => Promise<void> | void        // persist current in-memory state to disk
    window?: FloatingWindow                    // owning window (drives its ● titlebar dot)
}

/** Handle returned to the editor for driving its document's dirty state. */
export interface doc_handle {
    readonly id: string
    mark_dirty(): void
    mark_clean(): void
    is_dirty(): boolean
    flush(): Promise<void>                      // flush if dirty (no-op when clean)
    dispose(): void                            // unregister (call on window close)
}

interface entry { spec: doc_spec; dirty: boolean }

const _docs = new Map<string, entry>()
let _save_all_impl: () => Promise<void> = async () => {}   // wired by index.ts (flush docs + manifest)

// =========================================================================
// Registration
// =========================================================================

function _sync_dot(e: entry): void { e.spec.window?.set_dirty(e.dirty) }

/** Registers a savable document; returns a handle the editor uses to mark it dirty/clean. */
export function doc_register(spec: doc_spec): doc_handle {
    const e: entry = { spec, dirty: false }
    _docs.set(spec.id, e)
    return {
        id: spec.id,
        mark_dirty() { if (!e.dirty) { e.dirty = true;  _sync_dot(e) } },
        mark_clean() { if ( e.dirty) { e.dirty = false; _sync_dot(e) } },
        is_dirty() { return e.dirty },
        async flush() {
            if (!e.dirty) return
            await e.spec.flush()
            e.dirty = false        // only after a successful write — a throw leaves it dirty to retry
            _sync_dot(e)
        },
        dispose() { if (_docs.get(spec.id) === e) _docs.delete(spec.id) },
    }
}

// =========================================================================
// Queries / bulk flush
// =========================================================================

/** True if any open document has unsaved content. (The manifest is tracked separately by index.ts.) */
export function documents_any_dirty(): boolean {
    for (const e of _docs.values()) if (e.dirty) return true
    return false
}

/** Labels of every document with unsaved content (for prompts). */
export function documents_dirty_labels(): string[] {
    const out: string[] = []
    for (const e of _docs.values()) if (e.dirty) out.push(e.spec.label)
    return out
}

/** Flushes every dirty document to disk (content only — not the manifest). */
export async function documents_flush_content(): Promise<void> {
    for (const e of [..._docs.values()]) {
        if (!e.dirty) continue
        await e.spec.flush()
        e.dirty = false
        _sync_dot(e)
    }
}

// =========================================================================
// Save-all indirection (lets editors trigger a full save without importing index.ts)
// =========================================================================

/** index.ts registers the full save routine (flush docs + save manifest + side effects). */
export function documents_set_save_all(fn: () => Promise<void>): void { _save_all_impl = fn }

/** Triggers a full IDE save (Ctrl+S). Used by editors' in-window Ctrl+S. */
export function documents_save_all(): Promise<void> { return _save_all_impl() }

// =========================================================================
// Close guard
// =========================================================================

/**
 * Before-close guard for a document-backed window. Returns true to proceed with the close.
 * Clean → proceeds. Dirty + auto-save → flushes and proceeds. Dirty + manual → prompts
 * Save / Don't save / Cancel.
 */
export async function doc_confirm_close(h: doc_handle, label: string): Promise<boolean> {
    if (!h.is_dirty()) return true
    if (editor_prefs_get().autoSave) {
        try { await h.flush() } catch { /* let it close even if the write failed */ }
        return true
    }
    const choice = await show_save_prompt(label)
    if (choice === 'cancel')  return false
    if (choice === 'save') { try { await h.flush() } catch { return false } }   // keep open if save failed
    return true   // 'discard' → proceed without saving
}
