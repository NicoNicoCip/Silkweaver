/**
 * WebRTC peer-to-peer networking via RTCDataChannel.
 *
 * Provides UDP-like unreliable messaging between peers using RTCDataChannel
 * in unordered + unreliable mode, or reliable ordered mode for TCP-like use.
 *
 * Usage pattern:
 *   1. Create a peer: webrtc_create_peer()
 *   2. Create a data channel on the offerer: webrtc_create_channel()
 *   3. Exchange SDP offer/answer and ICE candidates out-of-band (e.g. via WebSocket)
 *   4. Send/receive messages via webrtc_send / webrtc_set_on_message
 *
 * SDP and ICE negotiation is exposed directly — the application is responsible
 * for the signalling transport (typically a WebSocket server).
 */

import { buffer_from_bytes } from './buffer.js'

// =========================================================================
// Peer registry
// =========================================================================

interface rtc_channel {
    channel:    RTCDataChannel
    on_message: ((buffer_id: number) => void) | null
    on_open:    (() => void) | null
    on_close:   (() => void) | null
}

interface rtc_peer {
    pc:               RTCPeerConnection
    channels:         Map<number, rtc_channel>  // channel_id → channel state
    next_channel_id:  number
    on_channel:       ((channel_id: number, label: string) => void) | null  // remote channel opened
    on_ice_candidate: ((candidate: RTCIceCandidate) => void) | null
}

const _peers: Map<number, rtc_peer> = new Map()
let _next_peer_id = 1

// =========================================================================
// Public API
// =========================================================================

/**
 * Creates a new RTCPeerConnection.
 * @param ice_servers - STUN/TURN server config (default: Google STUN)
 * @returns Peer ID
 */
export function webrtc_create_peer(
    ice_servers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
): number {
    const pc = new RTCPeerConnection({ iceServers: ice_servers })
    const id = _next_peer_id++

    const peer: rtc_peer = {
        pc,
        channels:        new Map(),
        next_channel_id: 1,
        on_channel:      null,
        on_ice_candidate: null,
    }
    _peers.set(id, peer)

    // Expose ICE candidates to the application
    pc.addEventListener('icecandidate', (ev) => {
        if (ev.candidate) peer.on_ice_candidate?.(ev.candidate)
    })

    // Handle incoming data channels (answerer side)
    pc.addEventListener('datachannel', (ev) => {
        const channel_id = peer.next_channel_id++
        const ch_state: rtc_channel = {
            channel:    ev.channel,
            on_message: null,
            on_open:    null,
            on_close:   null,
        }
        peer.channels.set(channel_id, ch_state)
        _wire_channel(ch_state)
        peer.on_channel?.(channel_id, ev.channel.label)
    })

    return id
}

/**
 * Wires event listeners onto a data channel state object.
 */
function _wire_channel(ch: rtc_channel): void {
    ch.channel.binaryType = 'arraybuffer'

    ch.channel.addEventListener('open', () => ch.on_open?.())
    ch.channel.addEventListener('close', () => ch.on_close?.())
    ch.channel.addEventListener('message', (ev) => {
        if (!ch.on_message) return
        const data = ev.data
        let bytes: Uint8Array
        if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data)
        } else if (typeof data === 'string') {
            bytes = new TextEncoder().encode(data)
        } else {
            return
        }
        ch.on_message(buffer_from_bytes(bytes))
    })
}

/**
 * Creates a data channel on a peer (offerer side).
 * @param peer_id - Peer ID
 * @param label - Channel label
 * @param ordered - True for reliable ordered, false for UDP-like
 * @param max_retransmits - Max retransmits for unreliable mode (0 = no retry)
 * @returns Channel ID, or -1 on failure
 */
export function webrtc_create_channel(
    peer_id:         number,
    label:           string  = 'data',
    ordered:         boolean = false,
    max_retransmits: number  = 0,
): number {
    const peer = _peers.get(peer_id)
    if (!peer) return -1

    const channel = peer.pc.createDataChannel(label, {
        ordered,
        maxRetransmits: ordered ? undefined : max_retransmits,
    })
    const channel_id = peer.next_channel_id++
    const ch_state: rtc_channel = {
        channel,
        on_message: null,
        on_open:    null,
        on_close:   null,
    }
    peer.channels.set(channel_id, ch_state)
    _wire_channel(ch_state)
    return channel_id
}

/**
 * Creates an SDP offer for the peer (async).
 * @param peer_id - Peer ID
 * @returns SDP offer string, or null on failure
 */
export async function webrtc_create_offer(peer_id: number): Promise<string | null> {
    const peer = _peers.get(peer_id)
    if (!peer) return null
    try {
        const offer = await peer.pc.createOffer()
        await peer.pc.setLocalDescription(offer)
        return offer.sdp ?? null
    } catch {
        return null
    }
}

/**
 * Creates an SDP answer in response to a received offer (async).
 * @param peer_id - Peer ID
 * @param offer_sdp - SDP offer string from the remote peer
 * @returns SDP answer string, or null on failure
 */
export async function webrtc_create_answer(peer_id: number, offer_sdp: string): Promise<string | null> {
    const peer = _peers.get(peer_id)
    if (!peer) return null
    try {
        await peer.pc.setRemoteDescription({ type: 'offer', sdp: offer_sdp })
        const answer = await peer.pc.createAnswer()
        await peer.pc.setLocalDescription(answer)
        return answer.sdp ?? null
    } catch {
        return null
    }
}

/**
 * Sets the remote SDP answer on the offerer (async).
 * @param peer_id - Peer ID
 * @param answer_sdp - SDP answer string from the remote peer
 */
export async function webrtc_set_remote_answer(peer_id: number, answer_sdp: string): Promise<void> {
    const peer = _peers.get(peer_id)
    if (!peer) return
    try {
        await peer.pc.setRemoteDescription({ type: 'answer', sdp: answer_sdp })
    } catch {
        // silently ignore — caller can monitor connection state
    }
}

/**
 * Adds a received ICE candidate from the remote peer.
 * @param peer_id - Peer ID
 * @param candidate - RTCIceCandidateInit object (from signalling)
 */
export async function webrtc_add_ice_candidate(peer_id: number, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = _peers.get(peer_id)
    if (!peer) return
    try {
        await peer.pc.addIceCandidate(candidate)
    } catch {
        // ignore stale candidates
    }
}

/**
 * Sends raw bytes over a data channel.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param bytes - Data to send
 */
export function webrtc_send(peer_id: number, channel_id: number, bytes: Uint8Array): void {
    const peer = _peers.get(peer_id)
    if (!peer) return
    const ch = peer.channels.get(channel_id)
    if (!ch || ch.channel.readyState !== 'open') return
    ch.channel.send(bytes)
}

/**
 * Sends a text string over a data channel.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param text - Text to send
 */
export function webrtc_send_text(peer_id: number, channel_id: number, text: string): void {
    const peer = _peers.get(peer_id)
    if (!peer) return
    const ch = peer.channels.get(channel_id)
    if (!ch || ch.channel.readyState !== 'open') return
    ch.channel.send(text)
}

/**
 * Closes a peer connection and all its channels.
 * @param peer_id - Peer ID
 */
export function webrtc_destroy_peer(peer_id: number): void {
    const peer = _peers.get(peer_id)
    if (!peer) return
    peer.pc.close()
    _peers.delete(peer_id)
}

/**
 * Sets the callback fired when a new incoming data channel is opened (answerer side).
 * @param peer_id - Peer ID
 * @param cb - Callback receiving (channel_id, label)
 */
export function webrtc_set_on_channel(peer_id: number, cb: (channel_id: number, label: string) => void): void {
    const peer = _peers.get(peer_id)
    if (peer) peer.on_channel = cb
}

/**
 * Sets the callback fired when a local ICE candidate is ready to be sent to the remote peer.
 * @param peer_id - Peer ID
 * @param cb - Callback receiving the RTCIceCandidate
 */
export function webrtc_set_on_ice_candidate(peer_id: number, cb: (candidate: RTCIceCandidate) => void): void {
    const peer = _peers.get(peer_id)
    if (peer) peer.on_ice_candidate = cb
}

/**
 * Sets the callback fired when a message arrives on a channel.
 * The callback receives a buffer ID (owned by caller; use buffer_delete when done).
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param cb - Callback receiving the buffer ID
 */
export function webrtc_set_on_message(peer_id: number, channel_id: number, cb: (buffer_id: number) => void): void {
    const ch = _peers.get(peer_id)?.channels.get(channel_id)
    if (ch) ch.on_message = cb
}

/**
 * Sets the callback fired when a channel opens.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param cb - Callback
 */
export function webrtc_set_on_open(peer_id: number, channel_id: number, cb: () => void): void {
    const ch = _peers.get(peer_id)?.channels.get(channel_id)
    if (ch) ch.on_open = cb
}

/**
 * Sets the callback fired when a channel closes.
 * @param peer_id - Peer ID
 * @param channel_id - Channel ID
 * @param cb - Callback
 */
export function webrtc_set_on_close(peer_id: number, channel_id: number, cb: () => void): void {
    const ch = _peers.get(peer_id)?.channels.get(channel_id)
    if (ch) ch.on_close = cb
}

/** Returns true if the peer ID refers to a live peer. */
export function webrtc_peer_exists(peer_id: number): boolean {
    return _peers.has(peer_id)
}

/** Returns the RTCPeerConnection connection state string, or 'closed' if not found. */
export function webrtc_get_state(peer_id: number): string {
    return _peers.get(peer_id)?.pc.connectionState ?? 'closed'
}
