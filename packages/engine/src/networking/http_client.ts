/**
 * HTTP client utilities.
 *
 * Mirrors GMS's http_get / http_post / http_get_file API.
 * All functions are Promise-based (unlike GMS async events).
 *
 * GMS equivalents:
 *   http_get(url)           → http_get(url)
 *   http_post_string(url,s) → http_post(url, body)
 *   http_get_file(url,path) → http_get_bytes(url)
 *   http_request(url,…)     → http_request(url, …)
 */

// =========================================================================
// HTTP response wrapper
// =========================================================================

/**
 * Represents the result of an HTTP request.
 */
export interface http_response {
    status:  number   // HTTP status code (200, 404, etc.)
    ok:      boolean  // True if status is 2xx
    text:    string   // Response body as text
    headers: Record<string, string>  // Response headers
}

/**
 * Represents the result of a binary HTTP request.
 */
export interface http_binary_response {
    status:  number
    ok:      boolean
    bytes:   Uint8Array
    headers: Record<string, string>
}

function _extract_headers(resp: Response): Record<string, string> {
    const out: Record<string, string> = {}
    resp.headers.forEach((value, key) => { out[key] = value })
    return out
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Performs an HTTP GET request and returns the response body as a string.
 * @param url - Request URL
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_response
 */
export async function http_get(url: string, headers?: Record<string, string>): Promise<http_response> {
    try {
        const resp = await fetch(url, { method: 'GET', headers })
        const text = await resp.text()
        return { status: resp.status, ok: resp.ok, text, headers: _extract_headers(resp) }
    } catch (e) {
        return { status: 0, ok: false, text: String(e), headers: {} }
    }
}

/**
 * Performs an HTTP POST request with a string body.
 * @param url - Request URL
 * @param body - Request body string
 * @param content_type - Content-Type header (default 'application/x-www-form-urlencoded')
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_response
 */
export async function http_post(
    url:          string,
    body:         string,
    content_type: string = 'application/x-www-form-urlencoded',
    headers?:     Record<string, string>,
): Promise<http_response> {
    try {
        const resp = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': content_type, ...headers },
            body,
        })
        const text = await resp.text()
        return { status: resp.status, ok: resp.ok, text, headers: _extract_headers(resp) }
    } catch (e) {
        return { status: 0, ok: false, text: String(e), headers: {} }
    }
}

/**
 * Performs an HTTP POST request with a JSON body.
 * @param url - Request URL
 * @param data - JavaScript value to serialize as JSON
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_response
 */
export async function http_post_json(
    url:     string,
    data:    unknown,
    headers?: Record<string, string>,
): Promise<http_response> {
    return http_post(url, JSON.stringify(data), 'application/json', headers)
}

/**
 * Performs an HTTP GET request and returns the response body as raw bytes.
 * Equivalent to GMS's http_get_file (but returns bytes instead of saving to disk).
 * @param url - Request URL
 * @param headers - Optional extra headers
 * @returns Promise resolving to http_binary_response
 */
export async function http_get_bytes(url: string, headers?: Record<string, string>): Promise<http_binary_response> {
    try {
        const resp  = await fetch(url, { method: 'GET', headers })
        const buf   = await resp.arrayBuffer()
        const bytes = new Uint8Array(buf)
        return { status: resp.status, ok: resp.ok, bytes, headers: _extract_headers(resp) }
    } catch (e) {
        return { status: 0, ok: false, bytes: new Uint8Array(0), headers: {} }
    }
}

/**
 * Performs a generic HTTP request with full control over method, headers, and body.
 * @param url - Request URL
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
 * @param headers - Request headers
 * @param body - Request body (string or Uint8Array), or null
 * @returns Promise resolving to http_response
 */
export async function http_request(
    url:     string,
    method:  string,
    headers: Record<string, string> = {},
    body:    string | Uint8Array | null = null,
): Promise<http_response> {
    try {
        const resp = await fetch(url, { method, headers, body: body ?? undefined })
        const text = await resp.text()
        return { status: resp.status, ok: resp.ok, text, headers: _extract_headers(resp) }
    } catch (e) {
        return { status: 0, ok: false, text: String(e), headers: {} }
    }
}
