# Pong Pulse — Backend (Socket) for Render

This is a minimal Node + Socket.IO server intended for deployment to Render (or similar). It implements a simple in-memory room system that allows:

- `createRoom` — create a room and become the host
- `joinRoom` — join a room using roomId + password
- emits `roomJoined` to both host and joining player when a second player joins
- `startGame` — broadcast `startGame` to all clients in the room

Notes:
- This server stores rooms in memory. For production you should use a persistent store (Redis, Postgres).
- Render supports WebSockets; ensure you choose a web service and the start command `npm start`.

Deployment steps (Render):

1. Create a new Web Service on Render and connect your repo (or push this `server/` folder to a repo).
2. Set the Root directory to `server` when creating the service (or the repo root if you place these files at root).
3. Build command: leave blank (or `npm install` if needed). Start command: `npm start`.
4. Environment variables (optional):
   - `CLIENT_ORIGIN` — URL of your frontend (used for CORS), e.g. `https://your-app.onrender.com`.
5. Deploy. Render will provide a public URL like `https://pong-pulse-backend.onrender.com`.

Client integration (example):

1. Connect to the socket server on app startup (e.g. in `main.tsx` or `App.tsx`):

```ts
import { socketClient } from '@/lib/socketClient';

// Call this early, e.g. in a useEffect in App
socketClient.connect('https://your-backend.onrender.com');

socketClient.onRoomJoined((data) => {
  // For the host: data.roomId indicates a player joined — start the game automatically
  // For the joining player: you may navigate to the game screen
  console.log('roomJoined event', data);
  // Trigger onRoomReady or other client-side flow
});
```

2. Use `socketClient.createRoom()` from your `RoomManager` to create a room and persist the returned `roomId`/`roomPass`.

3. When a player executes `socketClient.joinRoom(roomId, roomPass)` the server will emit `roomJoined` to the host, and you can call your `onRoomReady(roomId, true)` automatically.

Security & Production:

- Replace the in-memory store with a persistent database to handle multiple server instances and long-running rooms.
- Add authentication so only authorized users can create/join rooms.
- Rate limit and validate inputs.

That's it — this minimal server will allow automatic start of a match on the host when a second player joins.
