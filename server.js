import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { WebcastPushConnection } from 'tiktok-live-connector';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(express.static('public'));
app.use(express.json());

let tiktokConnection = null;
let currentUsername = null;

function attachTikTokListeners(connection) {
  connection.on('gift', (data) => {
    // Only process when streak is finalized (repeatEnd prevents duplicate counting)
    if (data.repeatEnd) {
      io.emit('tiktok:gift', {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        giftName: data.giftName,
        giftPictureUrl: data.giftPictureUrl,
        diamondCount: data.diamondCount,
        repeatCount: data.repeatCount,
        appleCount: data.repeatCount,
        timestamp: Date.now()
      });
    }
  });

  connection.on('chat', (data) => {
    io.emit('tiktok:chat', {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      timestamp: Date.now()
    });
  });

  connection.on('disconnected', () => {
    console.log(`[TikTok] Disconnected from @${currentUsername}`);
    tiktokConnection = null;
    currentUsername = null;
    io.emit('tiktok:disconnected', { reason: 'stream_ended' });
  });

  connection.on('error', (err) => {
    console.error('[TikTok] Error:', err.message);
    io.emit('tiktok:error', { message: err.message });
  });

  connection.on('streamEnd', () => {
    console.log(`[TikTok] Stream ended for @${currentUsername}`);
    io.emit('tiktok:disconnected', { reason: 'stream_ended' });
    tiktokConnection = null;
    currentUsername = null;
  });
}

app.post('/connect', async (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUsername = username.trim().replace(/^@/, '');

  if (tiktokConnection) {
    try { tiktokConnection.disconnect(); } catch (_) {}
    tiktokConnection = null;
  }

  try {
    const connection = new WebcastPushConnection(cleanUsername);
    const roomInfo = await connection.connect();
    tiktokConnection = connection;
    currentUsername = cleanUsername;
    attachTikTokListeners(connection);

    console.log(`[TikTok] Connected to @${cleanUsername}`);
    io.emit('tiktok:connected', { username: cleanUsername });
    res.json({ status: 'connected', username: cleanUsername, roomInfo });
  } catch (err) {
    console.error(`[TikTok] Failed to connect to @${cleanUsername}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/disconnect', (req, res) => {
  if (tiktokConnection) {
    try { tiktokConnection.disconnect(); } catch (_) {}
    tiktokConnection = null;
  }
  const prev = currentUsername;
  currentUsername = null;
  io.emit('tiktok:disconnected', { reason: 'manual' });
  console.log(`[TikTok] Manually disconnected from @${prev}`);
  res.json({ status: 'disconnected' });
});

app.get('/status', (req, res) => {
  res.json({ connected: tiktokConnection !== null, username: currentUsername });
});

// Dev endpoint: simulate a gift without a real TikTok stream
app.post('/test-gift', (req, res) => {
  const gift = {
    uniqueId: 'test_viewer',
    nickname: 'Test Viewer',
    giftName: req.body?.giftName || 'Rose',
    giftPictureUrl: '',
    diamondCount: 1,
    repeatCount: req.body?.count || 1,
    appleCount: req.body?.count || 1,
    timestamp: Date.now()
  };
  io.emit('tiktok:gift', gift);
  res.json({ ok: true, gift });
});

io.on('connection', (socket) => {
  // Sync state to newly connected browser client
  socket.emit('tiktok:status', {
    connected: tiktokConnection !== null,
    username: currentUsername
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
});
