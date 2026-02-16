/**
 * Profiler panel.
 *
 * Receives performance telemetry from the game preview iframe via postMessage
 * and renders live sparkline charts for FPS, step time, and JS heap memory.
 *
 * Telemetry message received FROM iframe:
 *   { type: 'sw:perf', fps: number, step_ms: number, heap_mb: number }
 */

import { FloatingWindow } from '../window_manager.js'

// =========================================================================
// Constants
// =========================================================================

const HISTORY  = 120   // samples to keep per metric
const W        = 280   // sparkline canvas width
const H        = 48    // sparkline canvas height
const TARGET_FPS = 60

// =========================================================================
// State
// =========================================================================

let _win:    FloatingWindow | null = null
let _active  = false
let _listener_attached = false

// Ring buffers
const _fps_buf:    number[] = []
const _step_buf:   number[] = []
const _heap_buf:   number[] = []

// Canvas / label refs
interface metric_ui {
    canvas:    HTMLCanvasElement
    ctx:       CanvasRenderingContext2D
    lbl_cur:   HTMLElement
    lbl_max:   HTMLElement
    lbl_avg:   HTMLElement
}

let _fps_ui:  metric_ui | null = null
let _step_ui: metric_ui | null = null
let _heap_ui: metric_ui | null = null

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens (or focuses) the profiler panel.
 * @param workspace - IDE workspace element
 */
export function profiler_open(workspace: HTMLElement): void {
    if (_win) { _win.bring_to_front(); return }
    _win = new FloatingWindow(
        'sw-profiler', 'Profiler', 'icons/script.svg',
        { x: 10, y: 60, w: 320, h: 480 }
    )
    _win.on_close(() => {
        _win     = null
        _active  = false
        _fps_ui  = null
        _step_ui = null
        _heap_ui = null
    })
    _build_ui()
    _win.mount(workspace)
    _active = true
    _ensure_listener()
}

// =========================================================================
// Internal
// =========================================================================

function _build_ui(): void {
    if (!_win) return
    const body = _win.body
    body.style.cssText = 'display:flex;flex-direction:column;overflow-y:auto;background:var(--sw-chrome);padding:8px;gap:8px;'

    _fps_ui  = _make_metric_section(body, 'FPS',        '#4caf50')
    _step_ui = _make_metric_section(body, 'Step (ms)',  '#2196f3')
    _heap_ui = _make_metric_section(body, 'Heap (MB)',  '#ff9800')

    // Initial empty draw
    _draw_metric(_fps_ui,  _fps_buf,  TARGET_FPS, '#4caf50')
    _draw_metric(_step_ui, _step_buf, 16.7,        '#2196f3')
    _draw_metric(_heap_ui, _heap_buf, 512,         '#ff9800')
}

function _make_metric_section(parent: HTMLElement, label: string, color: string): metric_ui {
    const sec = document.createElement('div')
    sec.className = 'sw-prof-section'

    // Title row
    const title_row = document.createElement('div')
    title_row.className = 'sw-prof-title-row'
    const title = document.createElement('span')
    title.className = 'sw-prof-title'
    title.textContent = label
    title.style.color = color
    const lbl_cur = document.createElement('span')
    lbl_cur.className = 'sw-prof-cur'
    lbl_cur.textContent = '–'
    title_row.append(title, lbl_cur)
    sec.appendChild(title_row)

    // Sparkline canvas
    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = H
    canvas.className = 'sw-prof-canvas'
    sec.appendChild(canvas)

    // Stats row
    const stats_row = document.createElement('div')
    stats_row.className = 'sw-prof-stats'
    const lbl_avg = document.createElement('span')
    lbl_avg.textContent = 'avg –'
    const lbl_max = document.createElement('span')
    lbl_max.textContent = 'max –'
    stats_row.append(lbl_avg, lbl_max)
    sec.appendChild(stats_row)

    parent.appendChild(sec)

    const ctx = canvas.getContext('2d')!
    return { canvas, ctx, lbl_cur, lbl_max, lbl_avg }
}

function _draw_metric(ui: metric_ui, buf: number[], reference: number, color: string): void {
    const { ctx, canvas, lbl_cur, lbl_max, lbl_avg } = ui
    const cw = canvas.width
    const ch = canvas.height

    ctx.clearRect(0, 0, cw, ch)

    if (buf.length === 0) return

    // Compute stats
    const cur = buf[buf.length - 1]
    const max = Math.max(...buf)
    const avg = buf.reduce((a, b) => a + b, 0) / buf.length

    lbl_cur.textContent = cur.toFixed(1)
    lbl_max.textContent = `max ${max.toFixed(1)}`
    lbl_avg.textContent = `avg ${avg.toFixed(1)}`

    // Scale: use max of reference and actual max to keep chart stable
    const scale_max = Math.max(reference, max) * 1.1 || 1

    // Reference line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    const ref_y = ch - (reference / scale_max) * ch
    ctx.beginPath(); ctx.moveTo(0, ref_y); ctx.lineTo(cw, ref_y); ctx.stroke()

    // Sparkline fill
    const step_x = cw / Math.max(HISTORY - 1, 1)
    ctx.beginPath()
    ctx.moveTo(0, ch)
    buf.forEach((v, i) => {
        const x = i * step_x
        const y = ch - (v / scale_max) * ch
        if (i === 0) ctx.lineTo(x, y)
        else         ctx.lineTo(x, y)
    })
    ctx.lineTo((buf.length - 1) * step_x, ch)
    ctx.closePath()
    ctx.fillStyle = color + '33'   // 20% opacity fill
    ctx.fill()

    // Sparkline line
    ctx.beginPath()
    buf.forEach((v, i) => {
        const x = i * step_x
        const y = ch - (v / scale_max) * ch
        if (i === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.stroke()
}

function _push(buf: number[], val: number): void {
    buf.push(val)
    if (buf.length > HISTORY) buf.shift()
}

function _ensure_listener(): void {
    if (_listener_attached) return
    _listener_attached = true
    window.addEventListener('message', (e: MessageEvent) => {
        if (!e.data || e.data.type !== 'sw:perf') return
        const { fps, step_ms, heap_mb } = e.data as {
            fps:     number
            step_ms: number
            heap_mb: number
        }
        _push(_fps_buf,  fps     ?? 0)
        _push(_step_buf, step_ms ?? 0)
        _push(_heap_buf, heap_mb ?? 0)

        if (!_active || !_fps_ui || !_step_ui || !_heap_ui) return
        _draw_metric(_fps_ui,  _fps_buf,  TARGET_FPS, '#4caf50')
        _draw_metric(_step_ui, _step_buf, 16.7,        '#2196f3')
        _draw_metric(_heap_ui, _heap_buf, 512,         '#ff9800')
    })
}
