# Collaboration System

## Architecture

```
packages/backend/
├── src/
│   ├── server.ts
│   ├── websocket-handler.ts
│   ├── crdt/
│   │   ├── document.ts
│   │   ├── operations.ts
│   │   └── sync.ts
│   ├── sessions/
│   │   ├── session-manager.ts
│   │   └── session.ts
│   └── storage/
│       └── project-storage.ts
└── package.json
```

## Session Link System

**No accounts required** - Anonymous collaboration via links

```
https://papercrane.dev/session/abc123def456
```

### Flow:
1. User creates session → gets shareable link
2. Others join via link (no account needed)
3. CRDT syncs all changes in real-time
4. Session persists until all users leave + timeout

## CRDT Implementation

Using **Yjs** for:
- JSON document sync (project files)
- Text sync (code editors)
- Awareness (cursor positions, selections)

### Backend WebSocket Handler

```typescript
import * as Y from 'yjs';
import { WebSocket } from 'ws';

class CollabSession {
  private doc: Y.Doc;
  private clients: Set<WebSocket> = new Set();
  private awareness: awarenessProtocol.Awareness;

  constructor(sessionId: string) {
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    // Send initial state
    const state = Y.encodeStateAsUpdate(this.doc);
    ws.send(state);
  }

  onMessage(ws: WebSocket, data: Uint8Array) {
    // Apply CRDT update
    Y.applyUpdate(this.doc, data);
    // Broadcast to other clients
    this.broadcast(data, ws);
  }

  broadcast(data: Uint8Array, exclude?: WebSocket) {
    for (const client of this.clients) {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }
}
```

### IDE Client Integration

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

class CollabService {
  private doc: Y.Doc;
  private provider: WebsocketProvider;

  connect(sessionUrl: string) {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      'wss://papercrane.dev/collab',
      sessionUrl,
      this.doc
    );

    // Sync with Monaco editor
    this.provider.awareness.setLocalState({
      cursor: null,
      user: { name: 'Anonymous', color: '#ff0000' }
    });
  }
}
```

## IDE Collaboration Features

### Real-time Cursors
- See other users' cursors in code editors
- Cursor colors per user
- Selection highlighting

### Live Code Changes
- Character-by-character sync
- Conflict-free merging
- Instant propagation

### Resource Locking (Optional)
- Lock resources while editing
- Prevent concurrent edits to same sprite/room
- Manual lock/unlock

### Session User List
- See who's in the session
- User colors/names
- Online status

### Chat/Comments (Optional)
- In-session text chat
- Comments on resources
- @mentions

## Session Management

### Session Creation
```typescript
POST /api/sessions
Response: { sessionId: "abc123", shareUrl: "https://..." }
```

### Session Join
```typescript
GET /api/sessions/:id
WebSocket: wss://papercrane.dev/collab/:id
```

### Session Cleanup
- Sessions expire after all users leave + 24 hour timeout
- Optional: permanent sessions with persistence

## Storage

### During Session
- All changes stored in server memory (CRDT doc)
- Periodic snapshots to disk

### Export
- Any user can export current project state
- Downloads as zip file

### Optional Persistence
- Save session to continue later
- Requires unique session name/ID
