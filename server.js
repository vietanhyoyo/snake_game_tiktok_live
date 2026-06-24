import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { WebcastPushConnection } from 'tiktok-live-connector';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const LIKE_APPLE_THRESHOLD = 500;
const LIKE_APPLE_REWARD = 10;
const COMMENT_APPLE_REWARD = 2;
const COMMENT_REWARD_TEXT = '222';
const COMMENT_FIREFLY_TEXT = '111';
const COMMENT_FIREFLY_REWARD = 1;

app.use(express.static('public'));
app.use(express.json());

let tiktokConnection = null;
let currentUsername = null;
let availableGifts = [];
let totalLikeCount = 0;
let rewardedLikeMilestones = 0;
let currentViewerCount = null;

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

function isRewardComment(comment) {
  return String(comment || '').trim() === COMMENT_REWARD_TEXT;
}

function isFireflyComment(comment) {
  return String(comment || '').trim() === COMMENT_FIREFLY_TEXT;
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

  connection.on('like', (data) => {
    const incomingTotal = Number(data.totalLikeCount ?? data.totalLikes ?? 0);
    const likeDelta = Number(data.likeCount ?? 0);

    if (incomingTotal > totalLikeCount) {
      totalLikeCount = incomingTotal;
    } else if (likeDelta > 0) {
      totalLikeCount += likeDelta;
    }

    io.emit('tiktok:like', {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      likeCount: totalLikeCount,
      timestamp: Date.now()
    });

    const milestones = Math.floor(totalLikeCount / LIKE_APPLE_THRESHOLD);
    const newMilestones = milestones - rewardedLikeMilestones;
    if (newMilestones <= 0) return;

    rewardedLikeMilestones = milestones;
    io.emit('tiktok:likeReward', {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      likeCount: totalLikeCount,
      appleCount: newMilestones * LIKE_APPLE_REWARD,
      threshold: LIKE_APPLE_THRESHOLD,
      timestamp: Date.now()
    });
  });

  connection.on('chat', (data) => {
    const appleCount = isRewardComment(data.comment) ? COMMENT_APPLE_REWARD : 0;
    const fireflyCount = isFireflyComment(data.comment) ? COMMENT_FIREFLY_REWARD : 0;
    if (appleCount <= 0 && fireflyCount <= 0) return;

    io.emit('tiktok:chat', {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      appleCount,
      fireflyCount,
      timestamp: Date.now()
    });
  });

  connection.on('member', (data) => {
    io.emit('tiktok:member', {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      viewerCount: currentViewerCount,
      timestamp: Date.now()
    });
  });

  connection.on('roomUser', (data) => {
    const viewerCount = Number(data.viewerCount);
    if (Number.isFinite(viewerCount)) currentViewerCount = viewerCount;
  });

  connection.on('follow', (data) => {
    io.emit('tiktok:follow', {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      timestamp: Date.now()
    });
  });

  connection.on('disconnected', () => {
    console.log(`[TikTok] Disconnected from @${currentUsername}`);
    tiktokConnection = null;
    currentUsername = null;
    totalLikeCount = 0;
    rewardedLikeMilestones = 0;
    currentViewerCount = null;
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
    totalLikeCount = 0;
    rewardedLikeMilestones = 0;
    currentViewerCount = null;
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
  totalLikeCount = 0;
  rewardedLikeMilestones = 0;
  currentViewerCount = null;

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
  totalLikeCount = 0;
  rewardedLikeMilestones = 0;
  currentViewerCount = null;
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
    silent: Boolean(req.body?.silent),
    timestamp: Date.now()
  };
  io.emit('tiktok:gift', gift);
  res.json({ ok: true, gift });
});

// Dev endpoint: simulate TikTok tap-heart milestones without a real livestream
app.post('/test-like', (req, res) => {
  const likeCount = Number(req.body?.likeCount ?? req.body?.count ?? LIKE_APPLE_THRESHOLD);
  if (likeCount > 0) totalLikeCount += likeCount;

  const milestones = Math.floor(totalLikeCount / LIKE_APPLE_THRESHOLD);
  const newMilestones = milestones - rewardedLikeMilestones;
  const like = {
    uniqueId: 'test_viewer',
    nickname: 'Test Viewer',
    likeCount: totalLikeCount,
    silent: Boolean(req.body?.silent),
    timestamp: Date.now()
  };
  const reward = {
    uniqueId: like.uniqueId,
    nickname: like.nickname,
    likeCount: totalLikeCount,
    appleCount: Math.max(0, newMilestones) * LIKE_APPLE_REWARD,
    threshold: LIKE_APPLE_THRESHOLD,
    silent: Boolean(req.body?.silent),
    timestamp: Date.now()
  };

  io.emit('tiktok:like', like);

  if (newMilestones > 0) {
    rewardedLikeMilestones = milestones;
    io.emit('tiktok:likeReward', reward);
  }

  res.json({ ok: true, reward });
});

// Dev endpoint: simulate a TikTok comment without a real livestream
app.post('/test-chat', (req, res) => {
  const comment = req.body?.comment || COMMENT_REWARD_TEXT;
  const chat = {
    uniqueId: 'test_viewer',
    nickname: 'Test Viewer',
    comment,
    appleCount: isRewardComment(comment) ? COMMENT_APPLE_REWARD : 0,
    fireflyCount: isFireflyComment(comment) ? COMMENT_FIREFLY_REWARD : 0,
    silent: Boolean(req.body?.silent),
    timestamp: Date.now()
  };
  if (chat.appleCount > 0 || chat.fireflyCount > 0) io.emit('tiktok:chat', chat);
  res.json({ ok: true, chat });
});

// Dev endpoint: simulate a viewer joining without a real livestream
app.post('/test-member', (req, res) => {
  const viewerCount = Number(req.body?.viewerCount);
  if (Number.isFinite(viewerCount)) currentViewerCount = viewerCount;

  const member = {
    uniqueId: 'test_viewer',
    nickname: 'Test Viewer',
    viewerCount: currentViewerCount,
    timestamp: Date.now()
  };
  io.emit('tiktok:member', member);
  res.json({ ok: true, member });
});

// Dev endpoint: simulate a TikTok follow without a real livestream
app.post('/test-follow', (req, res) => {
  const follow = {
    uniqueId: 'test_viewer',
    nickname: 'Test Viewer',
    timestamp: Date.now()
  };
  io.emit('tiktok:follow', follow);
  res.json({ ok: true, follow });
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
