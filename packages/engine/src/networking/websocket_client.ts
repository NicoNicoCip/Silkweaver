/**
 * WebSocket networking client.
 *
 * Mirrors GMS's network_create_socket / network_connect / network_send_raw API.
 * Messages are binary (ArrayBuffer) or text strings.
 *
 * Events (onopen, onmessage, onclose, onerror) are exposed as callbacks
 * rather than GMS async events, to match JavaScript idioms.
 */

import { buffer_from_bytes } from './buffer.js'

// =========================================================================
// Socket registry
// =========================================================================

/** WebSocket states matching the GMS network_type_* constants. */
export const network_type_connect    = 0  // Connection established
export const network_type_disconnect = 1  // Connection closed
export const network_type_data       = 2  // Data received
export const network_type_non_blocking_connect = 3  // Non-blocking connect attempt

interface ws_socket {
    ws:         WebSocket
    on_open:    (() => void) | null
    on_message: ((buffer_id: number) => void) | null
    on_close:   ((code: number, reason: string) => void) | null
    on_error:   (() => void) | null
}

const _sockets: Map<number, ws_socket> = new Map()
let _next_socket_id = 1

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Creates a WebSocket connection to the given URL.
 * @param url - WebSocket URL (ws:// or wss://)
 * @param protocols - Optional subprotocols
 * @returns Socket ID, or -1 on immediate failure
 */
export function network_create_socket(url: string, protocols?: string | string[]): number {
    let ws: WebSocket
    try {
        ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url)
    } catch {
        return -1
    }

    ws.binaryType = 'arraybuffer'

    const id   = _next_socket_id++
    const sock: ws_socket = { ws, on_open: null, on_message: null, on_close: null, on_error: null }
    _sockets.set(id, sock)

    ws.addEventListener('open', () => {
        sock.on_open?.()
    })

    ws.addEventListener('message', (ev) => {
        if (!sock.on_message) return
        if (ev.data instanceof ArrayBuffer) {
            const buf_id = buffer_from_bytes(new Uint8Array(ev.data))
            sock.on_message(buf_id)
        } else if (typeof ev.data === 'string') {
            // Wrap string in a buffer for uniform API
            const bytes  = new TextEncoder().encode(ev.data)
            const buf_id = buffer_from_bytes(bytes)
            sock.on_message(buf_id)
        }
    })

    ws.addEventListener('close', (ev) => {
        sock.on_close?.(ev.code, ev.reason)
        _sockets.delete(id)
    })

    ws.addEventListener('error', () => {
        sock.on_error?.()
    })

    return id
}

/**
 * Sends raw bytes from a buffer over a WebSocket connection.
 * @param socket_id - Socket ID
 * @param bytes - Uint8Array to send
 */
export function network_send_raw(socket_id: number, bytes: Uint8Array): void {
    const sock = _sockets.get(socket_id)
    if (!sock || sock.ws.readyState !== WebSocket.OPEN) return
    sock.ws.send(bytes)
}

/**
 * Sends a text string over a WebSocket connection.
 * @param socket_id - Socket ID
 * @param text - Text to send
 */
export function network_send_text(socket_id: number, text: string): void {
    const sock = _sockets.get(socket_id)
    if (!sock || sock.ws.readyState !== WebSocket.OPEN) return
    sock.ws.send(text)
}

/**
 * Closes a WebSocket connection.
 * @param socket_id - Socket ID
 * @param code - Close code (default 1000 = normal closure)
 * @param reason - Human-readable reason
 */
export function network_destroy(socket_id: number, code: number = 1000, reason: string = ''): void {
    const sock = _sockets.get(socket_id)
    if (!sock) return
    sock.ws.close(code, reason)
    _sockets.delete(socket_id)
}

/**
 * Returns the WebSocket ready state: 0=CONNECTING 1=OPEN 2=CLOSING 3=CLOSED.
 * Returns -1 if the socket ID is invalid.
 * @param socket_id - Socket ID
 */
export function network_get_ready_state(socket_id: number): number {
    return _sockets.get(socket_id)?.ws.readyState ?? -1
}

/**
 * Sets the callback fired when the socket connects.
 * @param socket_id - Socket ID
 * @param cb - Callback
 */
export function network_set_on_open(socket_id: number, cb: () => void): void {
    const sock = _sockets.get(socket_id)
    if (sock) sock.on_open = cb
}

/**
 * Sets the callback fired when a message is received.
 * The callback receives a buffer ID containing the message bytes.
 * The buffer is owned by the callback and should be freed with buffer_delete().
 * @param socket_id - Socket ID
 * @param cb - Callback receiving the buffer ID
 */
export function network_set_on_message(socket_id: number, cb: (buffer_id: number) => void): void {
    const sock = _sockets.get(socket_id)
    if (sock) sock.on_message = cb
}

/**
 * Sets the callback fired when the socket closes.
 * @param socket_id - Socket ID
 * @param cb - Callback receiving (code, reason)
 */
export function network_set_on_close(socket_id: number, cb: (code: number, reason: string) => void): void {
    const sock = _sockets.get(socket_id)
    if (sock) sock.on_close = cb
}

/**
 * Sets the callback fired when a socket error occurs.
 * @param socket_id - Socket ID
 * @param cb - Callback
 */
export function network_set_on_error(socket_id: number, cb: () => void): void {
    const sock = _sockets.get(socket_id)
    if (sock) sock.on_error = cb
}

/**
 * Returns true if the given socket ID refers to a live socket.
 * @param socket_id - Socket ID
 */
export function network_socket_exists(socket_id: number): boolean {
    return _sockets.has(socket_id)
}
