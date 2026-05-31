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
let availableGifts = [];

function normalizeGiftName(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getFirstImageUrl(value, depth = 0) {
  if (!value || depth > 5) return '';
  if (typeof value === 'string') return /^https?:\/\//.test(value) ? value : '';
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = getFirstImageUrl(item, depth + 1);
      if (url) return url;
    }
    return '';
  }
  if (typeof value !== 'object') return '';

  const preferredKeys = [
    'giftPictureUrl',
    'url',
    'urls',
    'urlList',
    'url_list',
    'imageUrl',
    'image_url',
    'giftImage',
    'gift_image',
    'image',
    'icon',
    'displayImage'
  ];

  for (const key of preferredKeys) {
    const url = getFirstImageUrl(value[key], depth + 1);
    if (url) return url;
  }

  return '';
}

function getGiftPictureUrl(data = {}) {
  return getFirstImageUrl(data.giftPictureUrl) ||
    getFirstImageUrl(data.giftImage) ||
    getFirstImageUrl(data.extendedGiftInfo) ||
    getFirstImageUrl(data.giftDetails) ||
    '';
}

function findAvailableGift({ giftName, giftType }) {
  const normalizedName = normalizeGiftName(giftName);
  const normalizedType = normalizeGiftName(giftType);
  return availableGifts.find(gift => {
    const giftNames = [
      gift.name,
      gift.giftName,
      gift.describe,
      gift.displayName
    ].map(normalizeGiftName);

    return giftNames.some(name => {
      return name &&
        ((normalizedName &&
          (name === normalizedName ||
            name.includes(normalizedName) ||
            normalizedName.includes(name))) ||
          (normalizedType && name.includes(normalizedType)));
    });
  });
}

function attachTikTokListeners(connection) {
  connection.on('gift', (data) => {
    // Only process finalized streak gifts. Non-streak gifts may not send repeatEnd.
    if (data.repeatEnd || data.giftType !== 1) {
      const giftPictureUrl = getGiftPictureUrl(data);
      io.emit('tiktok:gift', {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        giftName: data.giftName,
        giftType: data.giftType,
        giftId: data.giftId,
        giftPictureUrl,
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
    const connection = new WebcastPushConnection(cleanUsername, {
      enableExtendedGiftInfo: true
    });
    const roomInfo = await connection.connect();
    availableGifts = Array.isArray(connection.availableGifts) ? connection.availableGifts : [];
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
  availableGifts = [];
  io.emit('tiktok:disconnected', { reason: 'manual' });
  console.log(`[TikTok] Manually disconnected from @${prev}`);
  res.json({ status: 'disconnected' });
});

app.get('/status', (req, res) => {
  res.json({ connected: tiktokConnection !== null, username: currentUsername });
});

// Dev endpoint: simulate a gift without a real TikTok stream
app.post('/test-gift', (req, res) => {
  const repeatCount = Number(req.body?.count ?? 1);
  const appleCount = Number(req.body?.appleCount ?? repeatCount);
  const bombCount = Number(req.body?.bombCount ?? 0);
  const availableGift = findAvailableGift({
    giftName: req.body?.giftName,
    giftType: req.body?.giftType
  });
  const giftPictureUrl = req.body?.giftPictureUrl || getGiftPictureUrl(availableGift);
  const gift = {
    uniqueId: 'test_viewer',
    nickname: 'Test Viewer',
    giftName: req.body?.giftName || 'Rose',
    giftType: req.body?.giftType || '',
    giftPictureUrl,
    diamondCount: 1,
    repeatCount,
    appleCount,
    bombCount,
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
