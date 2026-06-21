/**
 * Debug agent — connects a running game (the IDE preview) to the IDE's Profiler and Debugger
 * (instance inspector) panels over `postMessage`. It only activates when the game runs inside an
 * iframe (the IDE preview); a standalone exported game has `window.parent === window`, so it stays
 * dormant with near-zero cost.
 *
 *   game → IDE:  { type: 'sw:perf', fps, step_ms, heap_mb }   — per frame, throttled (Profiler)
 *   IDE  → game: { type: 'sw:inspect' }                       — request an instance snapshot
 *   game → IDE:  { type: 'sw:instances', instances: [...] }   — snapshot reply (Debugger)
 *
 * Transport only — the game loop registers the snapshot source and feeds per-frame timings, so this
 * module imports nothing from the engine (no circular deps).
 */

let _enabled  = false
let _last_perf = 0
let _snapshot: (() => unknown[]) | null = null

/** Registers the function that produces the instance snapshot (set by the game loop). */
export function debug_set_snapshot(fn: () => unknown[]): void { _snapshot = fn }

/**
 * Activates the agent — idempotent, and a no-op unless the game is running inside the IDE preview
 * iframe. Listens for inspect requests and replies with the current instance snapshot.
 */
export function debug_agent_init(): void {
    if (_enabled) return
    if (typeof window === 'undefined' || window.parent === window) return   // not in the preview iframe
    _enabled = true
    window.addEventListener('message', (e: MessageEvent) => {
        if (!e.data || e.data.type !== 'sw:inspect') return
        try { window.parent.postMessage({ type: 'sw:instances', instances: _snapshot ? _snapshot() : [] }, '*') } catch { /* ignore */ }
    })
}

/** Posts a perf sample to the IDE (throttled to ~10/sec). Called each frame by the game loop. */
export function debug_perf(fps: number, step_ms: number): void {
    if (!_enabled) return
    const now = performance.now()
    if (now - _last_perf < 100) return
    _last_perf = now
    // performance.memory is Chromium-only (available in the Electron preview); absent → 0.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem: any = (performance as any).memory
    const heap_mb = mem && typeof mem.usedJSHeapSize === 'number' ? mem.usedJSHeapSize / 1048576 : 0
    try {
        window.parent.postMessage({
            type:    'sw:perf',
            fps,
            step_ms: Math.round(step_ms * 100) / 100,
            heap_mb: Math.round(heap_mb * 10) / 10,
        }, '*')
    } catch { /* ignore */ }
}
