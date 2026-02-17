/**
 * Pixel art editor window for creating/editing sprite frames.
 * Simple GMS 1.4-style pixel editor with pencil, eraser, fill bucket, and color picker.
 */

import { FloatingWindow } from '../window_manager.js'

// =========================================================================
// Public API
// =========================================================================

/**
 * Opens the pixel editor to create a new frame or edit an existing one.
 * @param workspace - IDE workspace element
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param initial_data - Optional existing image data URL to edit
 * @param on_save - Callback when user clicks Save, receives the image as data URL
 */
export function pixel_editor_open(
    workspace: HTMLElement,
    width: number,
    height: number,
    initial_data: string | null,
    on_save: (data_url: string) => void
): void {
    new PixelEditor(workspace, width, height, initial_data, on_save)
}

// =========================================================================
// Pixel Editor Window
// =========================================================================

type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper'

class PixelEditor {
    private _win: FloatingWindow
    private _canvas: HTMLCanvasElement
    private _display_canvas: HTMLCanvasElement  // Separate zoomed display canvas
    private _ctx: CanvasRenderingContext2D
    private _display_ctx: CanvasRenderingContext2D
    private _width: number
    private _height: number
    private _zoom: number = 20  // pixels per grid cell
    private _tool: Tool = 'pencil'
    private _color: string = '#000000'
    private _is_drawing: boolean = false
    private _on_save: (data_url: string) => void

    // UI elements
    private _tool_btns: Map<Tool, HTMLElement> = new Map()
    private _color_input: HTMLInputElement
    private _color_preview: HTMLElement

    constructor(
        workspace: HTMLElement,
        width: number,
        height: number,
        initial_data: string | null,
        on_save: (data_url: string) => void
    ) {
        this._width = width
        this._height = height
        this._on_save = on_save

        this._win = new FloatingWindow(
            'pixel-editor',
            'Pixel Editor',
            null,
            { x: 100, y: 100, w: Math.min(800, width * this._zoom + 200), h: Math.min(600, height * this._zoom + 150) }
        )

        this._build_ui()
        this._setup_canvas(initial_data)
        this._win.mount(workspace)
    }

    // ── UI Construction ───────────────────────────────────────────────────

    private _build_ui(): void {
        const body = this._win.body
        body.style.cssText = 'display:flex; flex-direction:column; overflow:hidden; background:#1e1e1e;'

        // Toolbar
        const toolbar = document.createElement('div')
        toolbar.style.cssText = `
            display:flex; gap:8px; padding:8px;
            background:var(--sw-chrome2); border-bottom:1px solid var(--sw-border2);
            align-items:center;
        `

        // Tool buttons
        const tools: Array<{ tool: Tool; char: string; title: string }> = [
            { tool: 'pencil',     char: '\u270E', title: 'Pencil (P)' },      // ✎
            { tool: 'eraser',     char: '\u2573', title: 'Eraser (E)' },      // ╳
            { tool: 'fill',       char: '\u25A8', title: 'Fill Bucket (F)' }, // ▨
            { tool: 'eyedropper', char: '\u25BC', title: 'Eyedropper (I)' },  // ▼
        ]

        tools.forEach(({ tool, char, title }) => {
            const btn = document.createElement('button')
            btn.textContent = char
            btn.title = title
            btn.style.cssText = `
                width:28px; height:28px; cursor:pointer;
                border:1px solid var(--sw-border2); background:var(--sw-chrome2); color:var(--sw-text);
                font-size:14px; padding:0; display:flex; align-items:center; justify-content:center;
            `
            btn.addEventListener('click', () => this._set_tool(tool))
            this._tool_btns.set(tool, btn)
            toolbar.appendChild(btn)
        })

        // Separator
        const sep = document.createElement('div')
        sep.style.cssText = 'width:1px; height:24px; background:var(--sw-border2); margin:0 8px;'
        toolbar.appendChild(sep)

        // Color preview swatch
        this._color_preview = document.createElement('div')
        this._color_preview.style.cssText = `
            width:28px; height:28px; border:1px solid var(--sw-border2);
            background:${this._color}; cursor:pointer;
        `
        this._color_preview.title = 'Click to pick color'
        this._color_preview.addEventListener('click', () => this._color_input.click())
        toolbar.appendChild(this._color_preview)

        // Hidden color input
        this._color_input = document.createElement('input')
        this._color_input.type = 'color'
        this._color_input.value = this._color
        this._color_input.style.cssText = 'display:none;'
        this._color_input.addEventListener('input', () => {
            this._color = this._color_input.value
            this._color_preview.style.background = this._color
        })
        toolbar.appendChild(this._color_input)

        // Save button
        const save_btn = document.createElement('button')
        save_btn.textContent = 'Save'
        save_btn.style.cssText = `
            margin-left:auto; padding:5px 16px; cursor:pointer;
            background:var(--sw-chrome2); color:var(--sw-text);
            border:1px solid var(--sw-border2); font-size:12px;
        `
        save_btn.addEventListener('click', () => this._save())
        toolbar.appendChild(save_btn)

        body.appendChild(toolbar)

        // Canvas container
        const container = document.createElement('div')
        container.style.cssText = `
            flex:1; overflow:auto; display:flex; align-items:center; justify-content:center;
            background:#1a1a1a;
        `

        // Actual pixel data canvas (hidden)
        this._canvas = document.createElement('canvas')
        this._canvas.width = this._width
        this._canvas.height = this._height
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true })!

        // Display canvas (zoomed with grid)
        this._display_canvas = document.createElement('canvas')
        this._display_canvas.width = this._width * this._zoom
        this._display_canvas.height = this._height * this._zoom
        this._display_canvas.style.cssText = `
            image-rendering:pixelated; cursor:crosshair;
            border:1px solid var(--sw-border2);
        `
        this._display_ctx = this._display_canvas.getContext('2d')!
        this._display_ctx.imageSmoothingEnabled = false

        container.appendChild(this._display_canvas)
        body.appendChild(container)

        // Set initial tool
        this._set_tool('pencil')

        // Keyboard shortcuts
        window.addEventListener('keydown', this._on_keydown)
        this._win.on_close(() => {
            window.removeEventListener('keydown', this._on_keydown)
        })
    }

    private _setup_canvas(initial_data: string | null): void {
        // Clear to white background
        this._ctx.fillStyle = '#ffffff'
        this._ctx.fillRect(0, 0, this._width, this._height)

        // Load initial image if provided
        if (initial_data) {
            const img = new Image()
            img.onload = () => {
                this._ctx.clearRect(0, 0, this._width, this._height)
                this._ctx.drawImage(img, 0, 0, this._width, this._height)
                this._redraw()
            }
            img.src = initial_data
        } else {
            this._redraw()
        }

        // Mouse events on display canvas
        this._display_canvas.addEventListener('mousedown', this._on_mousedown)
        this._display_canvas.addEventListener('mousemove', this._on_mousemove)
        this._display_canvas.addEventListener('mouseup', this._on_mouseup)
        this._display_canvas.addEventListener('mouseleave', this._on_mouseup)
        this._display_canvas.addEventListener('contextmenu', (e) => e.preventDefault()) // Disable context menu
    }

    // ── Tools ─────────────────────────────────────────────────────────────

    private _set_tool(tool: Tool): void {
        this._tool = tool
        // Update button highlights
        this._tool_btns.forEach((btn, t) => {
            if (t === tool) {
                btn.style.background = 'var(--sw-select-bg)'
                btn.style.borderColor = 'var(--sw-accent)'
            } else {
                btn.style.background = 'var(--sw-chrome2)'
                btn.style.borderColor = 'var(--sw-border2)'
            }
        })
    }

    private _on_keydown = (e: KeyboardEvent): void => {
        if (e.key === 'p' || e.key === 'P') this._set_tool('pencil')
        if (e.key === 'e' || e.key === 'E') this._set_tool('eraser')
        if (e.key === 'f' || e.key === 'F') this._set_tool('fill')
        if (e.key === 'i' || e.key === 'I') this._set_tool('eyedropper')
    }

    // ── Drawing ───────────────────────────────────────────────────────────

    private _on_mousedown = (e: MouseEvent): void => {
        e.preventDefault() // Prevent context menu on right-click
        this._is_drawing = true
        const { px, py } = this._get_pixel_coords(e)
        if (px < 0 || py < 0 || px >= this._width || py >= this._height) return

        // Right-click erases
        const is_erasing = e.button === 2

        if (this._tool === 'fill' && !is_erasing) {
            this._flood_fill(px, py)
        } else if (this._tool === 'eyedropper' && !is_erasing) {
            this._pick_color(px, py)
        } else {
            this._draw_pixel(px, py, is_erasing)
        }
    }

    private _on_mousemove = (e: MouseEvent): void => {
        if (!this._is_drawing) return
        const is_erasing = e.buttons === 2 // Right mouse button held

        if (this._tool === 'fill' || this._tool === 'eyedropper') return

        const { px, py } = this._get_pixel_coords(e)
        if (px < 0 || py < 0 || px >= this._width || py >= this._height) return

        this._draw_pixel(px, py, is_erasing)
    }

    private _on_mouseup = (): void => {
        this._is_drawing = false
    }

    private _get_pixel_coords(e: MouseEvent): { px: number; py: number } {
        const rect = this._display_canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        return {
            px: Math.floor(x / this._zoom),
            py: Math.floor(y / this._zoom)
        }
    }

    private _draw_pixel(px: number, py: number, force_erase: boolean = false): void {
        if (this._tool === 'eraser' || force_erase) {
            this._ctx.clearRect(px, py, 1, 1)
        } else {
            this._ctx.fillStyle = this._color
            this._ctx.fillRect(px, py, 1, 1)
        }
        this._redraw()
    }

    private _pick_color(px: number, py: number): void {
        const imageData = this._ctx.getImageData(px, py, 1, 1)
        const [r, g, b] = imageData.data
        this._color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        this._color_input.value = this._color
        this._color_preview.style.background = this._color
        this._set_tool('pencil')
    }

    private _flood_fill(px: number, py: number): void {
        const imageData = this._ctx.getImageData(0, 0, this._width, this._height)
        const data = imageData.data
        const target_color = this._get_pixel_color(data, px, py)
        const fill_color = this._hex_to_rgba(this._color)

        // Don't fill if same color
        if (this._colors_equal(target_color, fill_color)) return

        const stack: Array<[number, number]> = [[px, py]]
        const visited = new Set<string>()

        while (stack.length > 0) {
            const [x, y] = stack.pop()!
            const key = `${x},${y}`
            if (visited.has(key)) continue
            if (x < 0 || y < 0 || x >= this._width || y >= this._height) continue

            const current = this._get_pixel_color(data, x, y)
            if (!this._colors_equal(current, target_color)) continue

            visited.add(key)
            this._set_pixel_color(data, x, y, fill_color)

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
        }

        this._ctx.putImageData(imageData, 0, 0)
        this._redraw()
    }

    private _get_pixel_color(data: Uint8ClampedArray, x: number, y: number): [number, number, number, number] {
        const idx = (y * this._width + x) * 4
        return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    }

    private _set_pixel_color(data: Uint8ClampedArray, x: number, y: number, color: [number, number, number, number]): void {
        const idx = (y * this._width + x) * 4
        data[idx] = color[0]
        data[idx + 1] = color[1]
        data[idx + 2] = color[2]
        data[idx + 3] = color[3]
    }

    private _hex_to_rgba(hex: string): [number, number, number, number] {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return [r, g, b, 255]
    }

    private _colors_equal(a: [number, number, number, number], b: [number, number, number, number]): boolean {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
    }

    // ── Display ───────────────────────────────────────────────────────────

    private _redraw(): void {
        // Clear display canvas
        this._display_ctx.clearRect(0, 0, this._display_canvas.width, this._display_canvas.height)

        // Draw checkerboard background for transparency
        const checker_size = this._zoom
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                const is_light = (x + y) % 2 === 0
                this._display_ctx.fillStyle = is_light ? '#e0e0e0' : '#c0c0c0'
                this._display_ctx.fillRect(x * this._zoom, y * this._zoom, this._zoom, this._zoom)
            }
        }

        // Draw the actual pixel data scaled up
        this._display_ctx.imageSmoothingEnabled = false
        this._display_ctx.drawImage(this._canvas, 0, 0, this._width * this._zoom, this._height * this._zoom)

        // Draw grid
        this._display_ctx.strokeStyle = 'rgba(0,0,0,0.15)'
        this._display_ctx.lineWidth = 1

        for (let x = 0; x <= this._width; x++) {
            this._display_ctx.beginPath()
            this._display_ctx.moveTo(x * this._zoom + 0.5, 0)
            this._display_ctx.lineTo(x * this._zoom + 0.5, this._display_canvas.height)
            this._display_ctx.stroke()
        }

        for (let y = 0; y <= this._height; y++) {
            this._display_ctx.beginPath()
            this._display_ctx.moveTo(0, y * this._zoom + 0.5)
            this._display_ctx.lineTo(this._display_canvas.width, y * this._zoom + 0.5)
            this._display_ctx.stroke()
        }
    }

    // ── Save ──────────────────────────────────────────────────────────────

    private _save(): void {
        // Export the actual pixel canvas (already at correct size)
        const data_url = this._canvas.toDataURL('image/png')
        this._on_save(data_url)
        this._win.close()
    }
}
