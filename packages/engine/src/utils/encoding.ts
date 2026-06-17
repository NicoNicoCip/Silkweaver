/**
 * Encoding & hashing helpers (GMS `base64_*`, `sha1_*`, `md5_*`) and clipboard access.
 *
 * Hashes are pure-JS (synchronous, UTF-8) so they match GMS's blocking API; base64 and clipboard
 * use host facilities where available and degrade gracefully on headless hosts.
 */

// =========================================================================
// Base64
// =========================================================================

function _utf8(text: string): Uint8Array {
    return new TextEncoder().encode(text)
}

/** Base64-encodes a (UTF-8) string. */
export function base64_encode(text: string): string {
    const bytes = _utf8(text)
    let bin = ''
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
    if (typeof btoa === 'function') return btoa(bin)
    // Node fallback
    return (globalThis as any).Buffer.from(bin, 'binary').toString('base64')
}

/** Decodes a Base64 string back to a (UTF-8) string. */
export function base64_decode(text: string): string {
    let bin: string
    if (typeof atob === 'function') bin = atob(text)
    else bin = (globalThis as any).Buffer.from(text, 'base64').toString('binary')
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
}

// =========================================================================
// SHA-1
// =========================================================================

function _hex(bytes: Uint8Array): string {
    let s = ''
    for (let i = 0; i < bytes.length; i++) s += bytes[i]!.toString(16).padStart(2, '0')
    return s
}

function _sha1(data: Uint8Array): Uint8Array {
    const ml = data.length * 8
    const blocks = Math.floor((data.length + 8) / 64) + 1
    const msg = new Uint8Array(blocks * 64)
    msg.set(data)
    msg[data.length] = 0x80
    const dv = new DataView(msg.buffer)
    dv.setUint32(msg.length - 4, ml >>> 0, false)
    dv.setUint32(msg.length - 8, Math.floor(ml / 0x100000000), false)

    let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0
    const w = new Uint32Array(80)
    for (let i = 0; i < msg.length; i += 64) {
        for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false)
        for (let j = 16; j < 80; j++) { const v = w[j - 3]! ^ w[j - 8]! ^ w[j - 14]! ^ w[j - 16]!; w[j] = (v << 1) | (v >>> 31) }
        let a = h0, b = h1, c = h2, d = h3, e = h4
        for (let j = 0; j < 80; j++) {
            let f: number, k: number
            if (j < 20)      { f = (b & c) | (~b & d);            k = 0x5A827999 }
            else if (j < 40) { f = b ^ c ^ d;                    k = 0x6ED9EBA1 }
            else if (j < 60) { f = (b & c) | (b & d) | (c & d);  k = 0x8F1BBCDC }
            else             { f = b ^ c ^ d;                    k = 0xCA62C1D6 }
            const t = (((a << 5) | (a >>> 27)) + f + e + k + w[j]!) >>> 0
            e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t
        }
        h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0
    }
    const out = new Uint8Array(20)
    const odv = new DataView(out.buffer)
    odv.setUint32(0, h0, false); odv.setUint32(4, h1, false); odv.setUint32(8, h2, false)
    odv.setUint32(12, h3, false); odv.setUint32(16, h4, false)
    return out
}

/** Returns the SHA-1 hash of a UTF-8 string as a lowercase hex string. */
export function sha1_string_utf8(text: string): string {
    return _hex(_sha1(_utf8(text)))
}

// =========================================================================
// MD5 (RFC 1321)
// =========================================================================

function _md5(data: Uint8Array): Uint8Array {
    const ml = data.length * 8
    const blocks = Math.floor((data.length + 8) / 64) + 1
    const msg = new Uint8Array(blocks * 64)
    msg.set(data)
    msg[data.length] = 0x80
    const dv = new DataView(msg.buffer)
    dv.setUint32(msg.length - 8, ml >>> 0, true)
    dv.setUint32(msg.length - 4, Math.floor(ml / 0x100000000), true)

    const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21]
    const K = new Uint32Array(64)
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
    const rol = (x: number, c: number) => (x << c) | (x >>> (32 - c))

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476
    const m = new Uint32Array(16)
    for (let off = 0; off < msg.length; off += 64) {
        for (let j = 0; j < 16; j++) m[j] = dv.getUint32(off + j * 4, true)
        let a = a0, b = b0, c = c0, d = d0
        for (let i = 0; i < 64; i++) {
            let f: number, g: number
            if (i < 16)      { f = (b & c) | (~b & d);          g = i }
            else if (i < 32) { f = (d & b) | (~d & c);          g = (5 * i + 1) & 15 }
            else if (i < 48) { f = b ^ c ^ d;                   g = (3 * i + 5) & 15 }
            else             { f = c ^ (b | ~d);                g = (7 * i) & 15 }
            f = (f + a + K[i]! + m[g]!) >>> 0
            a = d; d = c; c = b
            b = (b + rol(f, S[(Math.floor(i / 16) * 4) + (i & 3)]!)) >>> 0
        }
        a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0
    }
    const out = new Uint8Array(16)
    const odv = new DataView(out.buffer)
    odv.setUint32(0, a0, true); odv.setUint32(4, b0, true); odv.setUint32(8, c0, true); odv.setUint32(12, d0, true)
    return out
}

/** Returns the MD5 hash of a UTF-8 string as a lowercase hex string. */
export function md5_string_utf8(text: string): string {
    return _hex(_md5(_utf8(text)))
}

// =========================================================================
// Clipboard
// =========================================================================

/** Copies text to the system clipboard (browser host; no-op on headless hosts). */
export function clipboard_set_text(text: string): void {
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined
    if (nav?.clipboard?.writeText) nav.clipboard.writeText(text)
}

/** Reads text from the system clipboard. Async on the web (returns a Promise). */
export async function clipboard_get_text(): Promise<string> {
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined
    if (nav?.clipboard?.readText) return nav.clipboard.readText()
    return ''
}

/** True if the clipboard API is available on this host. */
export function clipboard_has_text(): boolean {
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined
    return !!nav?.clipboard?.readText
}
