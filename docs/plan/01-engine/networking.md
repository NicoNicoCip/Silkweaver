# Networking

## File Structure
```
packages/engine/src/network/
├── network.ts          # Network management
├── buffer.ts           # Buffer system
├── websocket-client.ts # WebSocket wrapper (TCP-like)
├── webrtc-client.ts    # WebRTC wrapper (UDP-like)
└── http.ts             # HTTP requests
```

## Web Limitations

Since this is web-only, TCP/UDP are implemented via:
- **TCP-like**: WebSocket (reliable, ordered)
- **UDP-like**: WebRTC DataChannel (unreliable mode)

## Network Functions

| Function | Description |
|----------|-------------|
| `network_create_server(type, port)` | Create server |
| `network_create_socket(type)` | Create socket |
| `network_create_socket_ext(type, port)` | Socket with port |
| `network_connect(socket, url, port)` | Connect to server |
| `network_send_packet(socket, buffer, size)` | Send packet |
| `network_send_raw(socket, buffer, size)` | Raw send |
| `network_send_broadcast(socket, port, buffer, size)` | Broadcast |
| `network_send_udp(socket, url, port, buffer, size)` | UDP send |
| `network_destroy(socket)` | Destroy socket |
| `network_resolve(url)` | Resolve hostname |
| `network_set_timeout(socket, read, write)` | Set timeout |
| `network_set_config(param, value)` | Set config |

## Network Type Constants

```typescript
const network_socket_tcp = 0;  // WebSocket
const network_socket_udp = 1;  // WebRTC DataChannel
const network_socket_ws = 2;   // WebSocket explicit
const network_socket_wss = 3;  // Secure WebSocket
```

## Buffer Functions

| Function | Description |
|----------|-------------|
| `buffer_create(size, type, alignment)` | Create buffer |
| `buffer_delete(buffer)` | Delete buffer |
| `buffer_read(buffer, type)` | Read value |
| `buffer_write(buffer, type, value)` | Write value |
| `buffer_seek(buffer, base, offset)` | Seek position |
| `buffer_tell(buffer)` | Get position |
| `buffer_peek(buffer, offset, type)` | Peek value |
| `buffer_poke(buffer, offset, type, value)` | Poke value |
| `buffer_fill(buffer, offset, type, value, size)` | Fill buffer |
| `buffer_get_size(buffer)` | Get size |
| `buffer_resize(buffer, size)` | Resize |
| `buffer_copy(src, srcoff, size, dest, destoff)` | Copy |
| `buffer_save(buffer, filename)` | Save to file |
| `buffer_load(filename)` | Load from file |
| `buffer_base64_encode(buffer, offset, size)` | Base64 encode |
| `buffer_base64_decode(string)` | Base64 decode |
| `buffer_md5(buffer, offset, size)` | MD5 hash |
| `buffer_sha1(buffer, offset, size)` | SHA1 hash |
| `buffer_crc32(buffer, offset, size)` | CRC32 checksum |
| `buffer_compress(buffer, offset, size)` | Compress |
| `buffer_decompress(buffer)` | Decompress |

## Buffer Type Constants

```typescript
const buffer_fixed = 0;
const buffer_grow = 1;
const buffer_wrap = 2;
const buffer_fast = 3;
const buffer_vbuffer = 4;

// Data types
const buffer_u8 = 1;
const buffer_s8 = 2;
const buffer_u16 = 3;
const buffer_s16 = 4;
const buffer_u32 = 5;
const buffer_s32 = 6;
const buffer_u64 = 7;
const buffer_f16 = 8;
const buffer_f32 = 9;
const buffer_f64 = 10;
const buffer_bool = 11;
const buffer_string = 12;
const buffer_text = 13;
```

## HTTP Functions

| Function | Description |
|----------|-------------|
| `http_get(url)` | GET request |
| `http_get_file(url, dest)` | GET to file |
| `http_post_string(url, string)` | POST string |
| `http_request(url, method, header_map, body)` | Custom request |
| `http_get_request_crossorigin()` | Get CORS mode |
| `http_set_request_crossorigin(mode)` | Set CORS mode |

## Implementation Notes

### WebSocket (TCP-like)
```typescript
class WebSocketClient {
  private socket: WebSocket;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(url);
      this.socket.binaryType = 'arraybuffer';
      this.socket.onopen = () => resolve();
      this.socket.onerror = (e) => reject(e);
    });
  }

  send(buffer: ArrayBuffer): void {
    this.socket.send(buffer);
  }
}
```

### WebRTC (UDP-like)
```typescript
class WebRTCClient {
  private channel: RTCDataChannel;

  async connect(signalingUrl: string): Promise<void> {
    // Use signaling server to establish P2P connection
    // Configure DataChannel for unreliable delivery
    this.channel.ordered = false;
    this.channel.maxRetransmits = 0;
  }
}
```
