// ─── Constants ───────────────────────────────────────────────────────────────
const GRID_SIZE = 16;
const CANVAS_SIZE = 392;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const BASE_TICK_MS = 60;
const MAX_APPLES = Math.floor(GRID_SIZE * GRID_SIZE * 0.4); // tối đa 40% diện tích lưới
const DENSE_APPLE_WIN_THRESHOLD = 30;
const MAX_BOMBS = 70;
const MAX_COLOR_FLOWERS = MAX_APPLES;
const RAINBOW_MILESTONE_LENGTHS = [70, 200];
const SPIDER_MILESTONE_LENGTHS = [120];
const MAX_SPIDER_ITEMS = 1;
const MAX_FIREFLIES = 12;
const MEMBER_APPLE_REWARD = 1;
const MEMBER_BOMB_REWARD = 1;
const MEMBER_FIREFLY_REWARD = 1;
const MIN_SNAKE_LENGTH = 3;
const FIREFLY_SHRINK_SEGMENTS = 1;
const RAINBOW_EFFECT_MS = 10000;
const INVISIBLE_EFFECT_MS = 10000;
const EXPLOSION_MS = 760;
const SCREEN_SHAKE_MS = 420;
const FIREFLY_FLASH_MS = 680;
const FLOATING_TEXT_MS = 620;
const GIFT_NOTIFICATION_MS = 1800;
const MEMBER_GREETING_MS = 2800;
const MEMBER_GREETING_FADE_MS = 300;
const MEMBER_GREETING_VOICE_VIEWER_LIMIT = 50;
const LIKE_STICKER_MS = 1200;
const LIKE_STICKER_FADE_MS = 220;
const LIKE_STICKER_IMAGES = [
  '/assets/images/stickers/giphy.webp',
  '/assets/images/stickers/giphy_1.webp'
];
const LIKE_REWARD_APPLES_PER_FIREFLY = 10;
const RANDOM_MOVE_UNTIL_LENGTH = 50;
const HAMILTONIAN_MOVE_UNTIL_LENGTH = 80;
const HAMILTONIAN_HARD_LOCK_LENGTH = 150;
const SHORT_MODE_RANDOMNESS = 0.02;
const RANDOM_TOP_CANDIDATES = 2;
const APPLE_CHASE_LENGTH = 70;
const SERPENTINE_PREP_LENGTH = 120;
const SERPENTINE_WIN_LENGTH = 180;
const SERPENTINE_STRICT_LENGTH = 220;
const SERPENTINE_LOOSE_GAP_CHANCE = 0.18;
const SERPENTINE_LOOSE_GAP_END_LENGTH = 200;
const SERPENTINE_LOOSE_GAP_RECOVERY_TICKS = 10;
const SERPENTINE_BODY_ADJACENCY_WEIGHT = 20;
const SERPENTINE_BODY_PRESSURE_WEIGHT = 6;
const SINGLE_APPLE_MAZE_CHECK_MS = 10000;
const MAZE_VARIANTS = [
  {
    name: 'long-corridor',
    seed: 0x5eed2026,
    start: { x: 0, y: 7 },
    straightWeight: 4.4,
    verticalWeight: 2.2,
    horizontalWeight: 1.0
  },
  {
    name: 'wide-corridor',
    seed: 0xc0ffee16,
    start: { x: 7, y: 7 },
    straightWeight: 3.0,
    verticalWeight: 1.0,
    horizontalWeight: 2.4
  },
  {
    name: 'broken-corridor',
    seed: 0xbadc0de,
    start: { x: 3, y: 4 },
    straightWeight: 1.35,
    verticalWeight: 1.65,
    horizontalWeight: 1.45
  },
  {
    name: 'north-snake',
    seed: 0x19a7cafe,
    start: { x: 1, y: 1 },
    straightWeight: 5.2,
    verticalWeight: 2.8,
    horizontalWeight: 0.85
  },
  {
    name: 'east-snake',
    seed: 0x8ee7babe,
    start: { x: 6, y: 1 },
    straightWeight: 4.8,
    verticalWeight: 0.9,
    horizontalWeight: 2.9
  },
  {
    name: 'center-weave',
    seed: 0x1234fedc,
    start: { x: 4, y: 4 },
    straightWeight: 2.1,
    verticalWeight: 2.0,
    horizontalWeight: 2.0
  },
  {
    name: 'corner-weave',
    seed: 0x77aa55cc,
    start: { x: 7, y: 0 },
    straightWeight: 1.15,
    verticalWeight: 2.4,
    horizontalWeight: 1.2
  },
  {
    name: 'zigzag-garden',
    seed: 0x0ddc0ffe,
    start: { x: 0, y: 6 },
    straightWeight: 1.75,
    verticalWeight: 1.15,
    horizontalWeight: 2.6
  },
  {
    name: 'loose-pocket',
    seed: 0x6ac1e5af,
    start: { x: 5, y: 6 },
    straightWeight: 2.7,
    verticalWeight: 1.75,
    horizontalWeight: 1.75
  }
];
const COLOR_THEMES = [
  { primary: '#00ff88', strong: '#00cc6a', soft: '#0a1a0f', rgb: [0, 255, 136], tailRgb: [0, 80, 51] },
  { primary: '#38bdf8', strong: '#0284c7', soft: '#071a24', rgb: [56, 189, 248], tailRgb: [8, 70, 110] },
  { primary: '#a855f7', strong: '#7e22ce', soft: '#1d1028', rgb: [168, 85, 247], tailRgb: [70, 28, 110] },
  { primary: '#ff4fd8', strong: '#db2777', soft: '#260a1f', rgb: [255, 79, 216], tailRgb: [110, 24, 92] },
  { primary: '#ff4466', strong: '#cc2244', soft: '#260a10', rgb: [255, 68, 102], tailRgb: [110, 18, 36] },
  { primary: '#fb923c', strong: '#ea580c', soft: '#251307', rgb: [251, 146, 60], tailRgb: [110, 55, 15] },
  { primary: '#facc15', strong: '#ca8a04', soft: '#241d05', rgb: [250, 204, 21], tailRgb: [110, 88, 8] },
  { primary: '#a3e635', strong: '#65a30d', soft: '#172306', rgb: [163, 230, 53], tailRgb: [58, 92, 12] }
];
const RAINBOW_COLORS = ['#ff3b4f', '#ff9f1c', '#ffe66d', '#22c55e', '#38bdf8', '#6366f1', '#a855f7', '#ff4fd8'];
const RAINBOW_ITEM_COLORS = ['#ff3b4f', '#ff9f1c', '#ffe66d', '#22c55e', '#38bdf8', '#a855f7'];
const TEST_GIFTS = {
  rosa: {
    giftType: 'rosa',
    giftName: 'Rosa',
    displayName: 'Rosa',
    appleCount: 0,
    action: 'rainbow',
    image: '/assets/images/gift/rosa.webp'
  },
  rose: {
    giftType: 'rose',
    giftName: 'Hoa hồng',
    displayName: 'Rose',
    appleCount: 5
  },
  heart: {
    giftType: 'heart',
    giftName: 'Bắn tim',
    displayName: 'Finger Heart',
    appleCount: 15
  },
  doubleHeart: {
    giftType: 'double_heart',
    giftName: 'Trái tim đội',
    displayName: 'Team Heart',
    appleCount: 0,
    action: 'color'
  },
  follow: {
    giftType: 'follow',
    giftName: 'Follow',
    displayName: 'Follow',
    appleCount: 0,
    action: 'color'
  },
  pig: {
    giftType: 'pig',
    giftName: 'Chú heo may mắn',
    displayName: 'Lucky Pig',
    appleCount: 0,
    action: 'color'
  },
  tiktok: {
    giftType: 'tiktok',
    giftName: 'TikTok',
    displayName: 'TikTok',
    appleCount: 0,
    bombCount: 5,
    action: 'bomb'
  }
};

// ─── Game State ───────────────────────────────────────────────────────────────
let snake = [];
let snakeDirection = { x: 1, y: 0 };
let apples = [];
let bombs = [];
let colorFlowers = [];
let rainbowItems = [];
let spiderItems = [];
let fireflies = [];
let explosions = [];
let fireflyFlashes = [];
let floatingTexts = [];
let appleQueue = 0;
let bombQueue = 0;
let memberGreetingQueue = [];
let memberGreetingActive = false;
let memberGreetingTimer = null;
let memberGreetingHideTimer = null;
let likeStickerTimer = null;
let likeStickerHideTimer = null;
let likeStickerImageIndex = 0;
let screenShakeTimer = null;
let score = 0;
let totalGifts = 0;
let totalHearts = 0;
let winCount = 0;
let lossCount = 0;
let gameLoopInterval = null;
let resultCountdownTimer = null;
let fireworksAnimationId = null;
let fireworks = [];
let useHamiltonianMode = false;
let lockHamiltonianMode = false;
let useSerpentineWinMode = false;
let useSingleAppleMazeMode = false;
let activeMazeVariantIndex = -1;
let singleAppleMazeCheckUntil = 0;
let singleAppleMazeCheckAppleKey = null;
let colorThemeIndex = 0;
let currentTheme = COLOR_THEMES[colorThemeIndex];
let rainbowSnakeUntil = 0;
let invisibleSnakeUntil = 0;
let nextRainbowMilestoneIndex = 0;
let nextSpiderMilestoneIndex = 0;
let serpentineLooseGapCooldown = 0;

// ─── Canvas ───────────────────────────────────────────────────────────────────
function createSharpCanvasContext(canvasElement) {
  const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  canvasElement.width = Math.round(CANVAS_SIZE * pixelRatio);
  canvasElement.height = Math.round(CANVAS_SIZE * pixelRatio);

  const context = canvasElement.getContext('2d');
  context.setTransform(
    canvasElement.width / CANVAS_SIZE,
    0,
    0,
    canvasElement.height / CANVAS_SIZE,
    0,
    0
  );
  return context;
}

const canvas = document.getElementById('gameCanvas');
const ctx = createSharpCanvasContext(canvas);
const fireworksCanvas = document.getElementById('fireworksCanvas');
const fireworksCtx = createSharpCanvasContext(fireworksCanvas);

// ─── Sound Effects ────────────────────────────────────────────────────────────
const SOUND_EFFECTS = {
  apple: new Audio('/assets/music/effects/tunetank.com_bite-chomp.wav'),
  notification: new Audio('/assets/music/effects/notification-bell-digital-ding-bosnow-1-00-01.mp3'),
  bomb: new Audio('/assets/music/effects/stomp-close-box-bosnow-1-00-01.mp3'),
  result: new Audio('/assets/music/effects/wingame.mp3')
};
const THEME_TRACKS = [
  'Rainbow Run.mp3',
  'Sunrise Over Moss.mp3',
  'Tiny Pixel Path.mp3',
  'Tiny Pixel Path (1).mp3'
].map(fileName => encodeURI(`/assets/music/themes/${fileName}`));
let themeMusic = null;
let themeTrackIndex = -1;
let themeMusicStarted = false;
let themeMusicMuted = false;
let preferredGreetingVoice = null;
const FEMALE_GREETING_VOICE_NAMES = [
  'samantha',
  'victoria',
  'karen',
  'zira',
  'hazel',
  'susan',
  'moira',
  'tessa',
  'veena',
  'fiona',
  'google us english',
  'google uk english female',
  'microsoft zira',
  'microsoft hazel'
];

Object.values(SOUND_EFFECTS).forEach(sound => {
  sound.preload = 'auto';
  sound.volume = 0.75;
});
SOUND_EFFECTS.apple.volume = 0.30;

function playSoundEffect(type, volume = null) {
  const source = SOUND_EFFECTS[type];
  if (!source) return;

  const sound = source.cloneNode();
  sound.volume = volume === null
    ? source.volume
    : Math.max(0, Math.min(1, volume));
  sound.play().catch(() => {
    // Browsers can block audio until the first user interaction.
  });
}

function getRandomThemeTrackIndex() {
  if (THEME_TRACKS.length <= 1) return 0;

  let nextIndex = themeTrackIndex;
  while (nextIndex === themeTrackIndex) {
    nextIndex = Math.floor(Math.random() * THEME_TRACKS.length);
  }
  return nextIndex;
}

function playThemeTrack(index = getRandomThemeTrackIndex()) {
  if (THEME_TRACKS.length === 0) return;

  if (themeMusic) {
    themeMusic.pause();
    themeMusic.removeEventListener('ended', playNextThemeTrack);
  }

  themeTrackIndex = index;
  themeMusic = new Audio(THEME_TRACKS[themeTrackIndex]);
  themeMusic.preload = 'auto';
  themeMusic.volume = 0.35;
  themeMusic.addEventListener('ended', playNextThemeTrack);

  if (themeMusicMuted) {
    themeMusicStarted = false;
    return;
  }

  themeMusic.play()
    .then(() => {
      themeMusicStarted = true;
    })
    .catch(() => {
      themeMusicStarted = false;
    });
}

function playNextThemeTrack() {
  playThemeTrack(getRandomThemeTrackIndex());
}

function startThemeMusic() {
  if (themeMusicMuted || themeMusicStarted) return;

  if (themeMusic) {
    themeMusic.play()
      .then(() => {
        themeMusicStarted = true;
      })
      .catch(() => {
        themeMusicStarted = false;
      });
    return;
  }

  playThemeTrack();
}

function toggleThemeMusic() {
  themeMusicMuted = !themeMusicMuted;

  if (themeMusicMuted) {
    if (themeMusic) themeMusic.pause();
    themeMusicStarted = false;
    return;
  }

  startThemeMusic();
}

function getSpeechSynthesis() {
  return 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function getMemberGreetingVoice() {
  const speech = getSpeechSynthesis();
  if (!speech) return null;

  if (preferredGreetingVoice) return preferredGreetingVoice;

  const voices = speech.getVoices();
  preferredGreetingVoice = voices.find(voice => {
    const voiceName = voice.name.toLowerCase();
    return FEMALE_GREETING_VOICE_NAMES.some(name => voiceName.includes(name));
  }) ||
    voices.find(voice => voice.lang === 'en-US') ||
    voices.find(voice => voice.lang?.startsWith('en')) ||
    voices[0] ||
    null;
  return preferredGreetingVoice;
}

function primeMemberGreetingVoice() {
  const speech = getSpeechSynthesis();
  if (!speech) return;

  getMemberGreetingVoice();
  speech.resume();
}

function getMemberDisplayName(data = {}) {
  return String(data.nickname || data.uniqueId || 'Viewer')
    .replace(/^@/, '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Viewer';
}

function shouldSpeakMemberGreeting(data = {}) {
  const viewerCount = Number(data.viewerCount);
  return !Number.isFinite(viewerCount) || viewerCount <= MEMBER_GREETING_VOICE_VIEWER_LIMIT;
}

function speakMemberGreeting(displayName) {
  const speech = getSpeechSynthesis();
  if (!speech || !('SpeechSynthesisUtterance' in window)) return;

  const utterance = new SpeechSynthesisUtterance(`Hello ${displayName}`);
  const voice = getMemberGreetingVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  speech.resume();
  speech.speak(utterance);
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    preferredGreetingVoice = null;
    getMemberGreetingVoice();
  });
}

// ─── Theme ───────────────────────────────────────────────────────────────────
function applyColorTheme() {
  const root = document.documentElement;
  root.style.setProperty('--primary', currentTheme.primary);
  root.style.setProperty('--primary-strong', currentTheme.strong);
  root.style.setProperty('--primary-soft', currentTheme.soft);
  root.style.setProperty('--primary-rgb', currentTheme.rgb.join(', '));
}

function cycleColorTheme(shouldRender = true) {
  colorThemeIndex = (colorThemeIndex + 1) % COLOR_THEMES.length;
  currentTheme = COLOR_THEMES[colorThemeIndex];
  applyColorTheme();
  if (shouldRender) render();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function initGame() {
  clearResultState();
  snake = [
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 8, y: 8 }
  ];
  snakeDirection = { x: 0, y: -1 };
  apples = [];
  bombs = [];
  colorFlowers = [];
  rainbowItems = [];
  spiderItems = [];
  fireflies = [];
  explosions = [];
  fireflyFlashes = [];
  floatingTexts = [];
  appleQueue = 0;
  bombQueue = 0;
  score = 0;
  useHamiltonianMode = false;
  lockHamiltonianMode = false;
  useSerpentineWinMode = false;
  useSingleAppleMazeMode = false;
  rainbowSnakeUntil = 0;
  invisibleSnakeUntil = 0;
  nextRainbowMilestoneIndex = 0;
  nextSpiderMilestoneIndex = 0;
  serpentineLooseGapCooldown = 0;
  singleAppleMazeCheckUntil = 0;
  singleAppleMazeCheckAppleKey = null;
  selectRandomMazeVariant();
  spawnApple();
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(tick, BASE_TICK_MS);
}

// ─── Core Game Loop ───────────────────────────────────────────────────────────
function tick() {
  updateFireflies();
  ensureAppleAvailable();

  // Drain apple queue up to the cap
  while (appleQueue > 0 && apples.length < MAX_APPLES) {
    if (spawnApple()) {
      appleQueue--;
    } else {
      break; // grid full
    }
  }

  // Drain bomb queue up to the cap
  while (bombQueue > 0 && bombs.length < MAX_BOMBS) {
    if (spawnBomb()) {
      bombQueue--;
    } else {
      break; // grid full
    }
  }

  // AI picks direction
  snakeDirection = getAIDirection();

  // Compute proposed next head — wrap qua tường
  let newHead = {
    x: (snake[0].x + snakeDirection.x + GRID_SIZE) % GRID_SIZE,
    y: (snake[0].y + snakeDirection.y + GRID_SIZE) % GRID_SIZE
  };

  // Self-collision: tìm hướng thoát; chỉ chết khi hoàn toàn bị bít
  if (isBodyCollision(newHead)) {
    const escapeDir = getSurvivalDirection(snake[0], snake, snakeDirection);
    const escapeHead = {
      x: (snake[0].x + escapeDir.x + GRID_SIZE) % GRID_SIZE,
      y: (snake[0].y + escapeDir.y + GRID_SIZE) % GRID_SIZE
    };
    if (isBodyCollision(escapeHead)) {
      handleSoftReset();
      return;
    }
    snakeDirection = escapeDir;
    newHead = escapeHead;
  }

  // Check apple
  const appleIndex = apples.findIndex(a => a.x === newHead.x && a.y === newHead.y);
  const ateApple = appleIndex !== -1;
  const appleCanGrowSnake = ateApple && (!isBoardFull() || snake.length + 1 >= GRID_SIZE * GRID_SIZE);
  const bombIndex = bombs.findIndex(b => b.x === newHead.x && b.y === newHead.y);
  const ateBomb = bombIndex !== -1;
  const flowerIndex = colorFlowers.findIndex(flower => flower.x === newHead.x && flower.y === newHead.y);
  const ateColorFlower = flowerIndex !== -1;
  const rainbowIndex = rainbowItems.findIndex(item => item.x === newHead.x && item.y === newHead.y);
  const ateRainbowItem = rainbowIndex !== -1;
  const spiderIndex = spiderItems.findIndex(item => item.x === newHead.x && item.y === newHead.y);
  const ateSpiderItem = spiderIndex !== -1;
  const fireflyIndex = fireflies.findIndex(firefly => getFireflyCell(firefly).x === newHead.x && getFireflyCell(firefly).y === newHead.y);
  const ateFirefly = fireflyIndex !== -1;

  snake.unshift(newHead);
  if (ateApple) {
    const displayedSnakeLength = appleCanGrowSnake ? snake.length : snake.length - 1;
    createFloatingText(newHead, String(displayedSnakeLength), '#22ff88', { fontScale: 0.58, shadowBlur: 7, strokeWidth: 3 });
    playSoundEffect('apple');
    apples.splice(appleIndex, 1);
    score += 10;
    if (!appleCanGrowSnake) {
      snake.pop();
    } else if (snake.length >= GRID_SIZE * GRID_SIZE) {
      render();
      updateUI();
      handleWin();
      return;
    }
  } else if (ateBomb) {
    createFloatingText(newHead, '-', '#ff3b4f');
    playSoundEffect('bomb');
    createExplosion(bombs[bombIndex]);
    startScreenShake();
    bombs.splice(bombIndex, 1);
    snake.pop();
    shrinkSnakeBody(snake);
  } else if (ateColorFlower) {
    const colorStar = colorFlowers[flowerIndex];
    const themeIndex = Number.isInteger(colorStar?.themeIndex)
      ? colorStar.themeIndex
      : Math.floor(Math.random() * COLOR_THEMES.length);
    colorFlowers.splice(flowerIndex, 1);
    rainbowSnakeUntil = 0;
    colorThemeIndex = themeIndex;
    currentTheme = COLOR_THEMES[colorThemeIndex];
    applyColorTheme();
    createFloatingText(newHead, 'COLOR', currentTheme.primary);
    playSoundEffect('notification');
    snake.pop();
  } else if (ateRainbowItem) {
    rainbowItems.splice(rainbowIndex, 1);
    rainbowSnakeUntil = Date.now() + RAINBOW_EFFECT_MS;
    createFloatingText(newHead, 'RAINBOW', '#ffffff');
    playSoundEffect('notification');
    snake.pop();
  } else if (ateSpiderItem) {
    spiderItems.splice(spiderIndex, 1);
    invisibleSnakeUntil = Date.now() + INVISIBLE_EFFECT_MS;
    createFloatingText(newHead, 'HIDE', '#c4b5fd');
    playSoundEffect('notification');
    snake.pop();
  } else if (ateFirefly) {
    const firefly = fireflies[fireflyIndex];
    fireflies.splice(fireflyIndex, 1);
    createFireflyFlash(firefly);
    playSoundEffect('notification', 1);
    snake.pop();
    shrinkSnakeBody(snake, FIREFLY_SHRINK_SEGMENTS);
  } else {
    snake.pop();
  }

  spawnRainbowMilestoneItems();
  spawnSpiderMilestoneItems();
  ensureAppleAvailable();
  render();
  updateUI();
}

function handleSoftReset() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
  playSoundEffect('result');
  lossCount++;
  render();
  updateUI();
  startResultCountdown('loss', 5);
}

function handleWin() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
  playSoundEffect('result');
  winCount++;
  updateUI();
  startResultCountdown('win', 10);
}

function startResultCountdown(result, seconds) {
  const overlay = document.getElementById('death-overlay');
  const titleEl = document.getElementById('death-title');
  const countdownEl = document.getElementById('death-countdown');
  const subtitleEl = document.getElementById('death-subtitle');

  if (resultCountdownTimer) clearInterval(resultCountdownTimer);

  overlay.classList.toggle('win', result === 'win');
  titleEl.textContent = result === 'win' ? 'WIN' : 'LOSS';
  countdownEl.textContent = seconds;
  subtitleEl.textContent = result === 'win' ? 'Restarting in...' : 'Resuming in...';
  overlay.classList.add('visible');
  if (result === 'win') startFireworks();
  else stopFireworks();

  let remaining = seconds;
  resultCountdownTimer = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;
    if (remaining <= 0) {
      clearResultState();
      restartGame();
    }
  }, 1000);
}

function restartGame() {
  clearResultState();
  snake = [
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 8, y: 8 }
  ];
  snakeDirection = { x: 0, y: -1 };
  explosions = [];
  fireflyFlashes = [];
  floatingTexts = [];
  colorFlowers = [];
  rainbowItems = [];
  spiderItems = [];
  useHamiltonianMode = false;
  lockHamiltonianMode = false;
  useSerpentineWinMode = false;
  useSingleAppleMazeMode = false;
  rainbowSnakeUntil = 0;
  invisibleSnakeUntil = 0;
  nextRainbowMilestoneIndex = 0;
  nextSpiderMilestoneIndex = 0;
  serpentineLooseGapCooldown = 0;
  singleAppleMazeCheckUntil = 0;
  singleAppleMazeCheckAppleKey = null;
  selectRandomMazeVariant();
  if (apples.length === 0) spawnApple();
  render();
  updateUI();
  gameLoopInterval = setInterval(tick, BASE_TICK_MS);
}

function clearResultState() {
  const overlay = document.getElementById('death-overlay');
  if (resultCountdownTimer) {
    clearInterval(resultCountdownTimer);
    resultCountdownTimer = null;
  }
  overlay.classList.remove('visible', 'win');
  stopFireworks();
}

function startFireworks() {
  stopFireworks();
  fireworks = [];
  spawnFirework(CANVAS_SIZE * 0.5, CANVAS_SIZE * 0.35);
  fireworksAnimationId = requestAnimationFrame(animateFireworks);
}

function stopFireworks() {
  if (fireworksAnimationId) {
    cancelAnimationFrame(fireworksAnimationId);
    fireworksAnimationId = null;
  }
  fireworks = [];
  fireworksCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function spawnFirework(x = Math.random() * CANVAS_SIZE, y = Math.random() * CANVAS_SIZE * 0.55) {
  const colors = ['#ffe66d', currentTheme.primary, '#ff4466', '#7eb8ff', '#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const count = 34 + Math.floor(Math.random() * 18);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 1.4 + Math.random() * 2.6;
    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 46 + Math.random() * 24,
      maxLife: 70,
      color
    });
  }
}

function animateFireworks() {
  fireworksCtx.fillStyle = 'rgba(2, 8, 18, 0.18)';
  fireworksCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (Math.random() < 0.08) {
    spawnFirework(
      CANVAS_SIZE * (0.18 + Math.random() * 0.64),
      CANVAS_SIZE * (0.16 + Math.random() * 0.42)
    );
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const p = fireworks[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.035;
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.life--;

    const alpha = Math.max(0, p.life / p.maxLife);
    fireworksCtx.globalAlpha = alpha;
    fireworksCtx.fillStyle = p.color;
    fireworksCtx.beginPath();
    fireworksCtx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
    fireworksCtx.fill();

    if (p.life <= 0) fireworks.splice(i, 1);
  }
  fireworksCtx.globalAlpha = 1;

  fireworksAnimationId = requestAnimationFrame(animateFireworks);
}

function isOutOfBounds(cell) {
  return cell.x < 0 || cell.x >= GRID_SIZE || cell.y < 0 || cell.y >= GRID_SIZE;
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function directionTo(from, to) {
  let dx = to.x - from.x;
  let dy = to.y - from.y;

  if (dx === GRID_SIZE - 1) dx = -1;
  else if (dx === -(GRID_SIZE - 1)) dx = 1;

  if (dy === GRID_SIZE - 1) dy = -1;
  else if (dy === -(GRID_SIZE - 1)) dy = 1;

  return { x: dx, y: dy };
}

function getNeighbors(cell) {
  return [
    { x: (cell.x + 1) % GRID_SIZE,             y: cell.y },
    { x: (cell.x - 1 + GRID_SIZE) % GRID_SIZE, y: cell.y },
    { x: cell.x, y: (cell.y + 1) % GRID_SIZE },
    { x: cell.x, y: (cell.y - 1 + GRID_SIZE) % GRID_SIZE }
  ];
}

function isBodyCollision(cell, snakeBody = snake, includeTail = false) {
  const body = includeTail ? snakeBody : snakeBody.slice(0, -1);
  return body.some(seg => sameCell(seg, cell));
}

function shrinkSnakeBody(snakeBody, amount = 1) {
  for (let i = 0; i < amount && snakeBody.length > MIN_SNAKE_LENGTH; i++) {
    snakeBody.pop();
  }
}

function rotateHilbertQuadrant(size, cell, rx, ry) {
  if (ry !== 0) return cell;
  const rotated = { ...cell };
  if (rx === 1) {
    rotated.x = size - 1 - rotated.x;
    rotated.y = size - 1 - rotated.y;
  }
  return { x: rotated.y, y: rotated.x };
}

function getHamiltonianIndex(cell) {
  let index = 0;
  let current = { x: cell.x, y: cell.y };

  for (let size = GRID_SIZE / 2; size > 0; size = Math.floor(size / 2)) {
    const rx = (current.x & size) > 0 ? 1 : 0;
    const ry = (current.y & size) > 0 ? 1 : 0;
    index += size * size * ((3 * rx) ^ ry);
    current = rotateHilbertQuadrant(size, current, rx, ry);
  }

  return index;
}

function getCellByHamiltonianIndex(index) {
  const wrapped = (index + GRID_SIZE * GRID_SIZE) % (GRID_SIZE * GRID_SIZE);
  let t = wrapped;
  let cell = { x: 0, y: 0 };

  for (let size = 1; size < GRID_SIZE; size *= 2) {
    const rx = 1 & Math.floor(t / 2);
    const ry = 1 & (t ^ rx);
    cell = rotateHilbertQuadrant(size, cell, rx, ry);
    cell.x += size * rx;
    cell.y += size * ry;
    t = Math.floor(t / 4);
  }

  return cell;
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function parseCellKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

function addMazeEdge(edges, a, b) {
  const ak = cellKey(a);
  const bk = cellKey(b);
  edges.get(ak).add(bk);
  edges.get(bk).add(ak);
}

function removeMazeEdge(edges, a, b) {
  const ak = cellKey(a);
  const bk = cellKey(b);
  edges.get(ak).delete(bk);
  edges.get(bk).delete(ak);
}

function getMazeBlockCells(block) {
  const x = block.x * 2;
  const y = block.y * 2;
  return {
    tl: { x, y },
    tr: { x: x + 1, y },
    br: { x: x + 1, y: y + 1 },
    bl: { x, y: y + 1 }
  };
}

function buildMazeTreeEdges(variant) {
  const coarseSize = GRID_SIZE / 2;
  const random = createSeededRandom(variant.seed);
  const visited = new Set();
  const start = variant.start ?? { x: 0, y: coarseSize - 1 };
  const stack = [{ x: start.x, y: start.y, dir: null }];
  const treeEdges = [];
  visited.add(cellKey(stack[0]));

  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = dirs
      .map(dir => ({
        dir,
        cell: { x: current.x + dir.x, y: current.y + dir.y }
      }))
      .filter(item => {
        return item.cell.x >= 0 &&
          item.cell.x < coarseSize &&
          item.cell.y >= 0 &&
          item.cell.y < coarseSize &&
          !visited.has(cellKey(item.cell));
      });

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const weighted = neighbors.map(item => {
      const keepsDirection = current.dir &&
        item.dir.x === current.dir.x &&
        item.dir.y === current.dir.y;
      return {
        ...item,
        weight: keepsDirection
          ? variant.straightWeight
          : (item.dir.y !== 0 ? variant.verticalWeight : variant.horizontalWeight)
      };
    });
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = random() * totalWeight;
    let chosen = weighted[weighted.length - 1];

    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) {
        chosen = item;
        break;
      }
    }

    treeEdges.push({ from: { x: current.x, y: current.y }, to: chosen.cell });
    visited.add(cellKey(chosen.cell));
    stack.push({ ...chosen.cell, dir: chosen.dir });
  }

  return treeEdges;
}

function spliceMazeBlocks(edges, from, to) {
  const a = getMazeBlockCells(from);
  const b = getMazeBlockCells(to);

  if (to.x === from.x + 1) {
    removeMazeEdge(edges, a.tr, a.br);
    removeMazeEdge(edges, b.tl, b.bl);
    addMazeEdge(edges, a.tr, b.tl);
    addMazeEdge(edges, a.br, b.bl);
  } else if (to.x === from.x - 1) {
    spliceMazeBlocks(edges, to, from);
  } else if (to.y === from.y + 1) {
    removeMazeEdge(edges, a.bl, a.br);
    removeMazeEdge(edges, b.tl, b.tr);
    addMazeEdge(edges, a.bl, b.tl);
    addMazeEdge(edges, a.br, b.tr);
  } else if (to.y === from.y - 1) {
    spliceMazeBlocks(edges, to, from);
  }
}

function createMazeCycleCells(variant) {
  const edges = new Map();
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      edges.set(`${x},${y}`, new Set());
    }
  }

  for (let x = 0; x < GRID_SIZE; x += 2) {
    for (let y = 0; y < GRID_SIZE; y += 2) {
      const block = getMazeBlockCells({ x: x / 2, y: y / 2 });
      addMazeEdge(edges, block.tl, block.tr);
      addMazeEdge(edges, block.tr, block.br);
      addMazeEdge(edges, block.br, block.bl);
      addMazeEdge(edges, block.bl, block.tl);
    }
  }

  buildMazeTreeEdges(variant).forEach(edge => {
    spliceMazeBlocks(edges, edge.from, edge.to);
  });

  const startKey = '0,0';
  const cells = [];
  let previousKey = null;
  let currentKey = startKey;

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    cells.push(parseCellKey(currentKey));
    const neighbors = [...edges.get(currentKey)].sort();
    const nextKey = previousKey === null
      ? neighbors[0]
      : neighbors.find(key => key !== previousKey);
    previousKey = currentKey;
    currentKey = nextKey;
  }

  return cells;
}

function createMazeLayout(variant) {
  const cells = createMazeCycleCells(variant);
  return {
    ...variant,
    cells,
    indexByCell: new Map(cells.map((cell, index) => [cellKey(cell), index]))
  };
}

const MAZE_LAYOUTS = MAZE_VARIANTS.map(createMazeLayout);

function getActiveMazeLayout() {
  return MAZE_LAYOUTS[activeMazeVariantIndex] ?? MAZE_LAYOUTS[0];
}

function selectRandomMazeVariant() {
  if (MAZE_LAYOUTS.length <= 1) {
    activeMazeVariantIndex = 0;
    return;
  }

  let nextIndex = Math.floor(Math.random() * MAZE_LAYOUTS.length);
  while (activeMazeVariantIndex >= 0 && nextIndex === activeMazeVariantIndex) {
    nextIndex = Math.floor(Math.random() * MAZE_LAYOUTS.length);
  }
  activeMazeVariantIndex = nextIndex;
}

function getMazeLayoutSafetyScore(layoutIndex) {
  const previousIndex = activeMazeVariantIndex;
  activeMazeVariantIndex = layoutIndex;
  let score = Infinity;

  if (isSnakeAlignedToMaze()) {
    const shortcut = getMazeMoveCandidates()[0];
    if (shortcut) score = Math.min(score, shortcut.score - 500);

    const cycleDir = getMazeDirection();
    const simulation = simulateMove(cycleDir);
    const strictSafe = isSimulatedMoveSafe(simulation);
    const looseSafe = snake.length >= SERPENTINE_PREP_LENGTH && isLoosePrepMoveSafe(simulation);
    if (strictSafe || looseSafe) {
      score = Math.min(score, getNearestAppleDistance(simulation.next) + (strictSafe ? 0 : 700));
    }
  } else {
    const candidate = getBestMazeTransitionCandidate();
    if (candidate) score = candidate.score;
  }

  activeMazeVariantIndex = previousIndex;
  return score;
}

function selectSafeMazeVariant() {
  if (MAZE_LAYOUTS.length <= 1) {
    activeMazeVariantIndex = 0;
    return;
  }

  const previousIndex = activeMazeVariantIndex;
  let bestIndex = previousIndex >= 0 ? previousIndex : 0;
  let bestScore = Infinity;

  for (let index = 0; index < MAZE_LAYOUTS.length; index++) {
    const repeatPenalty = index === previousIndex ? 0.5 : 0;
    const score = getMazeLayoutSafetyScore(index) + repeatPenalty;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  if (Number.isFinite(bestScore)) {
    activeMazeVariantIndex = bestIndex;
  } else if (previousIndex < 0) {
    selectRandomMazeVariant();
  }
}

function getMazeIndex(cell) {
  return getActiveMazeLayout().indexByCell.get(cellKey(cell)) ?? 0;
}

function getCellByMazeIndex(index) {
  const wrapped = (index + GRID_SIZE * GRID_SIZE) % (GRID_SIZE * GRID_SIZE);
  return getActiveMazeLayout().cells[wrapped];
}

function getSerpentineIndex(cell) {
  return cell.y % 2 === 0
    ? cell.y * GRID_SIZE + cell.x
    : cell.y * GRID_SIZE + (GRID_SIZE - 1 - cell.x);
}

function getCellBySerpentineIndex(index) {
  const wrapped = (index + GRID_SIZE * GRID_SIZE) % (GRID_SIZE * GRID_SIZE);
  const y = Math.floor(wrapped / GRID_SIZE);
  const offset = wrapped % GRID_SIZE;
  return {
    x: y % 2 === 0 ? offset : GRID_SIZE - 1 - offset,
    y
  };
}

function cycleDistance(fromIndex, toIndex) {
  const total = GRID_SIZE * GRID_SIZE;
  return (toIndex - fromIndex + total) % total;
}

function getCycleDirection(getIndex, getCellByIndex) {
  const head = snake[0];
  const nextIndex = getIndex(head) + 1;
  return directionTo(head, getCellByIndex(nextIndex));
}

function getHamiltonianDirection() {
  return getCycleDirection(getHamiltonianIndex, getCellByHamiltonianIndex);
}

function getMazeDirection() {
  return getCycleDirection(getMazeIndex, getCellByMazeIndex);
}

function getSerpentineDirection() {
  return getCycleDirection(getSerpentineIndex, getCellBySerpentineIndex);
}

function isSnakeAlignedToCycle(getIndex) {
  const total = GRID_SIZE * GRID_SIZE;
  const headIndex = getIndex(snake[0]);
  return snake.every((seg, index) => {
    return getIndex(seg) === (headIndex - index + total) % total;
  });
}

function isSnakeAlignedToHamiltonian() {
  return isSnakeAlignedToCycle(getHamiltonianIndex);
}

function isSnakeAlignedToMaze() {
  return isSnakeAlignedToCycle(getMazeIndex);
}

function isSnakeAlignedToSerpentine() {
  return isSnakeAlignedToCycle(getSerpentineIndex);
}

function isCycleShortcutSafe(path, snakeBody, targetApple, getIndex) {
  const headIndex = getIndex(snakeBody[0]);
  const tailIndex = getIndex(snakeBody[snakeBody.length - 1]);
  const appleIndex = getIndex(targetApple);
  const headToTail = cycleDistance(headIndex, tailIndex);
  const headToApple = cycleDistance(headIndex, appleIndex);

  if (headToApple === 0 || headToApple >= headToTail) return false;
  if (headToTail - headToApple <= snakeBody.length + 2) return false;

  let previous = headIndex;
  for (let i = 1; i < path.length; i++) {
    const current = getIndex(path[i]);
    const step = cycleDistance(previous, current);
    if (step === 0 || step >= headToTail) return false;
    if (cycleDistance(headIndex, current) >= headToTail) return false;
    previous = current;
  }

  return true;
}

function isHamiltonianShortcutSafe(path, snakeBody, targetApple) {
  return isCycleShortcutSafe(path, snakeBody, targetApple, getHamiltonianIndex);
}

function isSerpentineShortcutSafe(path, snakeBody, targetApple) {
  return isCycleShortcutSafe(path, snakeBody, targetApple, getSerpentineIndex);
}

function isMazeShortcutSafe(path, snakeBody, targetApple) {
  return isCycleShortcutSafe(path, snakeBody, targetApple, getMazeIndex);
}

function getEdibleTargets() {
  return [
    ...apples.map(apple => ({ ...apple, type: 'apple', grows: true })),
    ...colorFlowers.map(flower => ({ ...flower, type: 'colorFlower', grows: false })),
    ...rainbowItems.map(item => ({ ...item, type: 'rainbow', grows: false })),
    ...spiderItems.map(item => ({ ...item, type: 'spider', grows: false })),
    ...fireflies.map(firefly => ({ ...getFireflyCell(firefly), type: 'firefly', grows: false, shrink: FIREFLY_SHRINK_SEGMENTS }))
  ];
}

function isDenseAppleWinMode() {
  return apples.length > DENSE_APPLE_WIN_THRESHOLD;
}

function getAppleCycleDistance(fromCell, getIndex = getHamiltonianIndex) {
  const targets = getEdibleTargets();
  if (targets.length === 0) return 0;
  const fromIndex = getIndex(fromCell);
  return Math.min(...targets.map(target => cycleDistance(fromIndex, getIndex(target))));
}

function getNearestAppleDistance(fromCell) {
  const targets = getEdibleTargets();
  if (targets.length === 0) return 0;
  return Math.min(...targets.map(target => manhattan(fromCell, target)));
}

function countAdjacentBodyCells(cell, snakeBody = snake) {
  const bodySet = new Set(snakeBody.slice(1, -1).map(cellKey));
  return getNeighbors(cell).filter(neighbor => bodySet.has(cellKey(neighbor))).length;
}

function countNearbyBodyCells(cell, snakeBody = snake, radius = 2) {
  const bodySet = new Set(snakeBody.slice(1, -1).map(cellKey));
  let count = 0;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;
      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance > radius) continue;

      const nearby = {
        x: (cell.x + dx + GRID_SIZE) % GRID_SIZE,
        y: (cell.y + dy + GRID_SIZE) % GRID_SIZE
      };
      if (bodySet.has(cellKey(nearby))) count++;
    }
  }

  return count;
}

function getCycleMoveCandidates(getIndex = getHamiltonianIndex) {
  const head = snake[0];
  const headIndex = getIndex(head);
  const tailIndex = getIndex(snake[snake.length - 1]);
  const headToTail = cycleDistance(headIndex, tailIndex);
  const bodySet = new Set(snake.slice(0, -1).map(cellKey));
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  const candidates = [];
  for (const dir of dirs) {
    if (dir.x === -snakeDirection.x && dir.y === -snakeDirection.y) continue;

    const next = {
      x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE
    };
    if (bodySet.has(cellKey(next))) continue;

    const advance = cycleDistance(headIndex, getIndex(next));
    if (advance === 0) continue;

    const target = getEdibleTargets().find(item => sameCell(item, next));
    const eats = Boolean(target);
    const reserve = target?.grows ? snake.length + 3 : snake.length + 1;
    if (advance >= headToTail - reserve) continue;

    const appleDistance = getEdibleTargets().length > 0 ? getAppleCycleDistance(next, getIndex) : advance;
    const visualAppleDistance = getNearestAppleDistance(next);
    const turnPenalty = dir.x === snakeDirection.x && dir.y === snakeDirection.y ? 0 : 0.35;
    const score = appleDistance * 4 + advance + (eats ? -1000 : 0);
    const visualScore = visualAppleDistance * 8 + turnPenalty + (eats ? -1000 : 0);
    candidates.push({ dir, next, score, visualScore, advance, eats });
  }

  return candidates.sort((a, b) => a.score - b.score || a.advance - b.advance);
}

function getHamiltonianMoveCandidates() {
  return getCycleMoveCandidates(getHamiltonianIndex);
}

function getMazeMoveCandidates() {
  return getCycleMoveCandidates(getMazeIndex);
}

function getSerpentineMoveCandidates() {
  return getCycleMoveCandidates(getSerpentineIndex);
}

function getHamiltonianShortcutDirection() {
  const best = getHamiltonianMoveCandidates()[0];
  return best?.dir ?? null;
}

function getMazeShortcutDirection() {
  const best = getMazeMoveCandidates()[0];
  return best?.dir ?? null;
}

function getSerpentineShortcutDirection() {
  const best = getSerpentineMoveCandidates()[0];
  return best?.dir ?? null;
}

function getShortModeAppleDirection(candidates = null) {
  const targets = getEdibleTargets();
  if (targets.length === 0) return null;

  const head = snake[0];
  const sortedTargets = targets.sort((a, b) => manhattan(a, head) - manhattan(b, head));
  for (const target of sortedTargets) {
    const path = astar(head, target, snake);
    if (!path || path.length < 2) continue;

    const dir = directionTo(head, path[1]);
    if (!candidates) return dir;

    const candidate = candidates.find(item => item.dir.x === dir.x && item.dir.y === dir.y);
    if (candidate) return candidate.dir;
  }

  return null;
}

function isShortPathSafe(path, snakeBody, targetApple) {
  const targetKey = cellKey(targetApple);
  const targetGrows = targetApple?.grows !== false;
  const targetShrink = Number(targetApple?.shrink) || 0;
  let simSnake = snakeBody.map(seg => ({ ...seg }));

  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    const eats = cellKey(step) === targetKey;
    simSnake.unshift(step);
    if (!eats || !targetGrows) simSnake.pop();
    if (eats && targetShrink > 0) shrinkSnakeBody(simSnake, targetShrink);
  }

  const obstacles = new Set(simSnake.slice(0, -1).map(cellKey));
  const reachable = floodFill(simSnake[0], obstacles);
  return reachable >= Math.max(16, simSnake.length + 6);
}

function getRandomizedShortSnakeDirection() {
  const directAppleDir = getShortModeAppleDirection();
  if (directAppleDir) return directAppleDir;

  const candidates = getHamiltonianMoveCandidates()
    .sort((a, b) => a.visualScore - b.visualScore || a.advance - b.advance);
  if (candidates.length === 0) return null;

  const appleMove = candidates.find(candidate => candidate.eats);
  if (appleMove) return appleMove.dir;

  const appleDir = getShortModeAppleDirection(candidates);
  if (appleDir) return appleDir;

  const bestTowardApple = candidates
    .slice()
    .sort((a, b) => getNearestAppleDistance(a.next) - getNearestAppleDistance(b.next) || a.advance - b.advance)[0];

  if (Math.random() > SHORT_MODE_RANDOMNESS) return bestTowardApple.dir;

  const pool = candidates.slice(0, Math.min(RANDOM_TOP_CANDIDATES, candidates.length));
  const bestScore = Math.min(...pool.map(candidate => candidate.visualScore));
  const totalWeight = pool.reduce((sum, candidate) => {
    return sum + 1 / Math.max(1, candidate.visualScore - bestScore + 1);
  }, 0);
  let roll = Math.random() * totalWeight;

  for (const candidate of pool) {
    roll -= 1 / Math.max(1, candidate.visualScore - bestScore + 1);
    if (roll <= 0) return candidate.dir;
  }

  return pool[pool.length - 1].dir;
}

function getAStarDirectionForCycle(isShortcutSafe) {
  const targets = getEdibleTargets();
  if (targets.length === 0) return null;

  const head = snake[0];
  const sorted = targets.sort((a, b) => manhattan(a, head) - manhattan(b, head));
  let bestPath = null;
  for (const target of sorted) {
    const path = astar(head, target, snake);
    if (!path || path.length < 2) continue;
    if (isShortcutSafe(path, snake, target)) {
      if (!bestPath || path.length < bestPath.length) bestPath = path;
    }
  }

  return bestPath ? directionTo(head, bestPath[1]) : null;
}

function getSafeAStarDirection() {
  return getAStarDirectionForCycle((path, snakeBody, apple) => isPathSafe(path, snakeBody, apple));
}

function getSafeAppleChaseDirection() {
  if (
    getEdibleTargets().length === 0 ||
    snake.length < APPLE_CHASE_LENGTH ||
    snake.length >= SERPENTINE_STRICT_LENGTH
  ) return null;

  const astarDir = getSafeAStarDirection();
  if (astarDir) return astarDir;

  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ].filter(dir => !(dir.x === -snakeDirection.x && dir.y === -snakeDirection.y));

  let best = null;
  for (const dir of dirs) {
    const simulation = simulateMove(dir);
    if (!isSimulatedMoveSafe(simulation)) continue;

    const appleDistance = getNearestAppleDistance(simulation.next);
    const turnPenalty = dir.x === snakeDirection.x && dir.y === snakeDirection.y ? 0 : 0.4;
    const appleBonus = simulation.eats ? -800 : 0;
    const score = appleDistance * 10 + turnPenalty + appleBonus;
    if (!best || score < best.score) best = { dir, score };
  }

  return best?.dir ?? null;
}

function getDenseAppleWinDirection() {
  if (!isDenseAppleWinMode()) return null;

  return getHamiltonianWinDirection();
}

function getHamiltonianWinDirection() {
  const shortcutDir = getHamiltonianShortcutDirection();
  if (shortcutDir) return shortcutDir;

  const astarDir = getAStarDirectionForCycle(isHamiltonianShortcutSafe);
  if (astarDir) return astarDir;

  const head = snake[0];
  const cycleDir = getHamiltonianDirection();
  const cycleHead = {
    x: (head.x + cycleDir.x + GRID_SIZE) % GRID_SIZE,
    y: (head.y + cycleDir.y + GRID_SIZE) % GRID_SIZE
  };
  if (!isBodyCollision(cycleHead)) return cycleDir;

  return getSurvivalDirection(head, snake, snakeDirection);
}

function simulateMove(dir) {
  const head = snake[0];
  const next = {
    x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
    y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE
  };
  if (isBodyCollision(next)) return null;

  const target = getEdibleTargets().find(item => sameCell(item, next));
  const eats = Boolean(target);
  const simSnake = [next, ...snake.map(seg => ({ ...seg }))];
  if (!target?.grows) simSnake.pop();
  if (target?.shrink) shrinkSnakeBody(simSnake, target.shrink);
  return { next, simSnake, eats };
}

function isSimulatedMoveSafe(simulation) {
  if (!simulation) return false;

  const tail = simulation.simSnake[simulation.simSnake.length - 1];
  const pathToTail = astar(simulation.next, tail, simulation.simSnake);
  if (!pathToTail || pathToTail.length < 2) return false;

  const obstacles = new Set(simulation.simSnake.slice(0, -1).map(cellKey));
  const reachable = floodFill(simulation.next, obstacles);
  return reachable >= Math.max(12, simulation.simSnake.length);
}

function isLoosePrepMoveSafe(simulation) {
  if (!simulation) return false;

  const obstacles = new Set(simulation.simSnake.slice(0, -1).map(cellKey));
  const reachable = floodFill(simulation.next, obstacles);
  const emptyCells = GRID_SIZE * GRID_SIZE - simulation.simSnake.length;
  const minSpace = Math.max(14, Math.min(emptyCells + 1, Math.floor(simulation.simSnake.length * 0.55)));
  return reachable >= minSpace;
}

function getSerpentineTransitionDirection(strict = false, options = {}) {
  const { preferOpenGap = false } = options;
  const preferred = getSerpentineDirection();
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ].filter(dir => !(dir.x === -snakeDirection.x && dir.y === -snakeDirection.y));

  const headIndex = getSerpentineIndex(snake[0]);
  let best = null;
  const candidates = [];

  for (const dir of dirs) {
    const simulation = simulateMove(dir);
    if (!isSimulatedMoveSafe(simulation) && !(preferOpenGap && isLoosePrepMoveSafe(simulation))) {
      continue;
    }

    const advance = cycleDistance(headIndex, getSerpentineIndex(simulation.next));
    if (advance === 0) continue;

    const preferredBonus = dir.x === preferred.x && dir.y === preferred.y
      ? (strict ? -1000 : -3)
      : 0;
    const appleBonus = simulation.eats ? (strict ? -250 : -700) : 0;
    const appleDistance = getNearestAppleDistance(simulation.next);
    const bodyAdjacency = countAdjacentBodyCells(simulation.next, simulation.simSnake);
    const bodyPressure = countNearbyBodyCells(simulation.next, simulation.simSnake);
    const openGapPenalty = preferOpenGap
      ? bodyAdjacency * SERPENTINE_BODY_ADJACENCY_WEIGHT +
        bodyPressure * SERPENTINE_BODY_PRESSURE_WEIGHT
      : 0;
    const score = strict
      ? preferredBonus + appleBonus + advance + appleDistance * 0.5
      : preferOpenGap
        ? preferredBonus + appleBonus + advance * 0.12 + appleDistance * 1.2 + openGapPenalty + Math.random()
      : preferredBonus + appleBonus + appleDistance * 12 + advance * 0.08 + Math.random();

    const candidate = { dir, score };
    candidates.push(candidate);
    if (!best || score < best.score) best = candidate;
  }

  if (preferOpenGap && candidates.length > 0) {
    candidates.sort((a, b) => a.score - b.score);
    if (Math.random() < SERPENTINE_LOOSE_GAP_CHANCE) {
      const pool = candidates.slice(0, Math.min(3, candidates.length));
      return pool[Math.floor(Math.random() * pool.length)].dir;
    }
    return candidates[0].dir;
  }

  return best?.dir ?? getSurvivalDirection(snake[0], snake, snakeDirection);
}

function getSerpentineWinDirection() {
  const head = snake[0];
  const strict = snake.length >= SERPENTINE_STRICT_LENGTH;

  if (!isSnakeAlignedToSerpentine()) {
    if (!strict) {
      const chaseDir = getSafeAppleChaseDirection();
      if (chaseDir) return chaseDir;
    }
    return getSerpentineTransitionDirection(strict);
  }

  if (!strict) {
    const astarDir = getAStarDirectionForCycle(isSerpentineShortcutSafe);
    if (astarDir) return astarDir;

    const candidates = getSerpentineMoveCandidates()
      .sort((a, b) => a.visualScore - b.visualScore || a.advance - b.advance);
    if (candidates.length > 0) {
      if (Math.random() > 0.12) return candidates[0].dir;
      const pool = candidates.slice(0, Math.min(3, candidates.length));
      return pool[Math.floor(Math.random() * pool.length)].dir;
    }
  }

  const shortcutDir = getSerpentineShortcutDirection();
  if (shortcutDir) return shortcutDir;

  const astarDir = getAStarDirectionForCycle(isSerpentineShortcutSafe);
  if (astarDir) return astarDir;

  const cycleDir = getSerpentineDirection();
  const cycleHead = {
    x: (head.x + cycleDir.x + GRID_SIZE) % GRID_SIZE,
    y: (head.y + cycleDir.y + GRID_SIZE) % GRID_SIZE
  };
  if (!isBodyCollision(cycleHead)) return cycleDir;

  return getSurvivalDirection(head, snake, snakeDirection);
}

function getBestMazeTransitionCandidate() {
  const preferred = getMazeDirection();
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ].filter(dir => !(dir.x === -snakeDirection.x && dir.y === -snakeDirection.y));

  const headIndex = getMazeIndex(snake[0]);
  let best = null;

  for (const dir of dirs) {
    const simulation = simulateMove(dir);
    const strictSafe = isSimulatedMoveSafe(simulation);
    const looseSafe = snake.length >= SERPENTINE_PREP_LENGTH && isLoosePrepMoveSafe(simulation);
    if (!strictSafe && !looseSafe) continue;

    const advance = cycleDistance(headIndex, getMazeIndex(simulation.next));
    if (advance === 0) continue;

    const preferredBonus = dir.x === preferred.x && dir.y === preferred.y ? -1000 : 0;
    const appleBonus = simulation.eats ? -180 : 0;
    const appleDistance = getNearestAppleDistance(simulation.next);
    const bodyAdjacency = countAdjacentBodyCells(simulation.next, simulation.simSnake);
    const bodyPressure = countNearbyBodyCells(simulation.next, simulation.simSnake);
    const score =
      preferredBonus +
      appleBonus +
      advance * 0.9 +
      appleDistance * 0.5 +
      (strictSafe ? 0 : 700) +
      bodyAdjacency * SERPENTINE_BODY_ADJACENCY_WEIGHT +
      bodyPressure * SERPENTINE_BODY_PRESSURE_WEIGHT;

    if (!best || score < best.score) best = { dir, score, strictSafe };
  }

  return best;
}

function getMazeTransitionDirection() {
  return getBestMazeTransitionCandidate()?.dir ?? getSurvivalDirection(snake[0], snake, snakeDirection);
}

function hasSafeSingleApplePath() {
  if (apples.length !== 1) return false;

  const target = { ...apples[0], type: 'apple', grows: true };
  const path = astar(snake[0], target, snake);
  return Boolean(path && path.length >= 2 && isPathSafe(path, snake, target));
}

function isSingleAppleMazeCheckActive() {
  if (useSingleAppleMazeMode) return true;

  const appleKey = apples.length === 1 ? cellKey(apples[0]) : null;
  const canTrack =
    !useHamiltonianMode &&
    snake.length > SERPENTINE_PREP_LENGTH &&
    appleKey;

  if (!canTrack) {
    singleAppleMazeCheckUntil = 0;
    singleAppleMazeCheckAppleKey = null;
    return false;
  }

  const now = Date.now();
  if (singleAppleMazeCheckAppleKey !== appleKey) {
    singleAppleMazeCheckAppleKey = appleKey;
    singleAppleMazeCheckUntil = now + SINGLE_APPLE_MAZE_CHECK_MS;
  }

  return now <= singleAppleMazeCheckUntil;
}

function enterSingleAppleMazeMode() {
  selectSafeMazeVariant();
  useHamiltonianMode = false;
  lockHamiltonianMode = false;
  useSerpentineWinMode = false;
  useSingleAppleMazeMode = true;
  serpentineLooseGapCooldown = 0;
  singleAppleMazeCheckUntil = 0;
  singleAppleMazeCheckAppleKey = null;
}

function getSingleAppleSafePathDirection() {
  if (apples.length !== 1 || !isSnakeAlignedToMaze()) return null;

  const target = { ...apples[0], type: 'apple', grows: true };
  const path = astar(snake[0], target, snake);
  if (!path || path.length < 2) return null;
  if (!isPathSafe(path, snake, target)) return null;
  if (!isMazeShortcutSafe(path, snake, target)) return null;

  const dir = directionTo(snake[0], path[1]);
  const simulation = simulateMove(dir);
  if (!isSimulatedMoveSafe(simulation)) return null;

  return dir;
}

function getSingleAppleMazeDirection() {
  const head = snake[0];

  if (!isSnakeAlignedToMaze()) {
    return getMazeTransitionDirection();
  }

  const safeAppleDir = getSingleAppleSafePathDirection();
  if (safeAppleDir) return safeAppleDir;

  const shortcutDir = getMazeShortcutDirection();
  if (shortcutDir) return shortcutDir;

  const cycleDir = getMazeDirection();
  const cycleHead = {
    x: (head.x + cycleDir.x + GRID_SIZE) % GRID_SIZE,
    y: (head.y + cycleDir.y + GRID_SIZE) % GRID_SIZE
  };
  if (!isBodyCollision(cycleHead)) return cycleDir;

  return getSurvivalDirection(head, snake, snakeDirection);
}

function toggleSingleAppleMazeMode() {
  if (!useSingleAppleMazeMode) {
    enterSingleAppleMazeMode();
  } else {
    useSingleAppleMazeMode = false;
    serpentineLooseGapCooldown = 0;
    singleAppleMazeCheckUntil = 0;
    singleAppleMazeCheckAppleKey = null;
  }
  render();
}

// ─── Apple Spawning ───────────────────────────────────────────────────────────
function spawnApple() {
  return spawnItem(apples, MAX_APPLES);
}

function ensureAppleAvailable() {
  if (ensureFinalAppleAvailable()) return;
  if (apples.length > 0) return;
  if (spawnApple() && appleQueue > 0) appleQueue--;
}

function ensureFinalAppleAvailable() {
  if (snake.length < GRID_SIZE * GRID_SIZE - 1) return false;

  const snakeCells = new Set(snake.map(cellKey));
  const openCells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!snakeCells.has(`${x},${y}`)) openCells.push({ x, y });
    }
  }
  if (openCells.length === 0) return false;

  const target = openCells[0];
  if (apples.some(apple => sameCell(apple, target))) return true;

  apples = [{ x: target.x, y: target.y, spawnTime: Date.now() }];
  bombs = bombs.filter(bomb => !sameCell(bomb, target));
  colorFlowers = colorFlowers.filter(flower => !sameCell(flower, target));
  rainbowItems = rainbowItems.filter(item => !sameCell(item, target));
  spiderItems = spiderItems.filter(item => !sameCell(item, target));
  fireflies = fireflies.filter(firefly => !sameCell(getFireflyCell(firefly), target));
  return true;
}

function spawnBomb() {
  return spawnItem(bombs, MAX_BOMBS);
}

function spawnColorFlower() {
  const themeIndex = Math.floor(Math.random() * COLOR_THEMES.length);
  return spawnItem(colorFlowers, MAX_COLOR_FLOWERS, () => ({
    themeIndex,
    color: COLOR_THEMES[themeIndex].primary
  }));
}

function spawnRainbowItem() {
  return spawnItem(rainbowItems);
}

function spawnSpiderItem() {
  return spawnItem(spiderItems, MAX_SPIDER_ITEMS);
}

function spawnRainbowMilestoneItems() {
  while (
    nextRainbowMilestoneIndex < RAINBOW_MILESTONE_LENGTHS.length &&
    snake.length >= RAINBOW_MILESTONE_LENGTHS[nextRainbowMilestoneIndex]
  ) {
    if (!spawnRainbowItem()) break;
    nextRainbowMilestoneIndex++;
  }
}

function spawnSpiderMilestoneItems() {
  while (
    nextSpiderMilestoneIndex < SPIDER_MILESTONE_LENGTHS.length &&
    snake.length >= SPIDER_MILESTONE_LENGTHS[nextSpiderMilestoneIndex]
  ) {
    if (!spawnSpiderItem()) break;
    nextSpiderMilestoneIndex++;
  }
}

function getOccupiedCellKeys() {
  return new Set([
    ...snake.map(cellKey),
    ...apples.map(cellKey),
    ...bombs.map(cellKey),
    ...colorFlowers.map(cellKey),
    ...rainbowItems.map(cellKey),
    ...spiderItems.map(cellKey),
    ...fireflies.map(firefly => cellKey(getFireflyCell(firefly)))
  ]);
}

function isBoardFull() {
  return getOccupiedCellKeys().size >= GRID_SIZE * GRID_SIZE;
}

function spawnFirefly() {
  if (fireflies.length >= MAX_FIREFLIES) return false;

  const occupied = getOccupiedCellKeys();
  const empty = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return false;

  const cell = empty[Math.floor(Math.random() * empty.length)];
  const angle = Math.random() * Math.PI * 2;
  fireflies.push({
    x: cell.x + 0.5,
    y: cell.y + 0.5,
    vx: Math.cos(angle) * 0.055,
    vy: Math.sin(angle) * 0.055,
    phase: Math.random() * Math.PI * 2,
    spawnTime: Date.now()
  });
  return true;
}

function spawnItem(collection, maxItems = Infinity, createItemData = () => ({})) {
  if (collection.length >= maxItems) return false;
  const occupied = getOccupiedCellKeys();
  const empty = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return false;
  const cell = empty[Math.floor(Math.random() * empty.length)];
  collection.push({ x: cell.x, y: cell.y, spawnTime: Date.now(), ...createItemData() });
  return true;
}

function getFireflyCell(firefly) {
  return {
    x: Math.max(0, Math.min(GRID_SIZE - 1, Math.floor(firefly.x))),
    y: Math.max(0, Math.min(GRID_SIZE - 1, Math.floor(firefly.y)))
  };
}

function updateFireflies() {
  const now = Date.now();

  fireflies.forEach(firefly => {
    const drift = now * 0.003 + firefly.phase;
    firefly.vx += Math.cos(drift * 0.7) * 0.004;
    firefly.vy += Math.sin(drift * 0.9) * 0.004;

    const speed = Math.hypot(firefly.vx, firefly.vy) || 1;
    const maxSpeed = 0.08;
    if (speed > maxSpeed) {
      firefly.vx = (firefly.vx / speed) * maxSpeed;
      firefly.vy = (firefly.vy / speed) * maxSpeed;
    }

    firefly.x = (firefly.x + firefly.vx + GRID_SIZE) % GRID_SIZE;
    firefly.y = (firefly.y + firefly.vy + GRID_SIZE) % GRID_SIZE;
  });
}

function createFireflyFlash(firefly) {
  if (!firefly) return;

  fireflyFlashes.push({
    x: firefly.x * CELL_SIZE,
    y: firefly.y * CELL_SIZE,
    startTime: Date.now()
  });
}

function createExplosion(cell) {
  if (!cell) return;

  const x = cell.x * CELL_SIZE + CELL_SIZE / 2;
  const y = cell.y * CELL_SIZE + CELL_SIZE / 2;
  const colors = ['#ff2233', '#ff6a00', '#ffd84d', '#ffffff', '#ffb347'];
  const particles = [];
  const particleCount = 46;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.48;
    const speed = 2.2 + Math.random() * 5.4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2.6 + Math.random() * 4.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  explosions.push({
    x,
    y,
    startTime: Date.now(),
    particles
  });
}

function startScreenShake() {
  const app = document.getElementById('app');
  if (!app) return;

  clearTimeout(screenShakeTimer);
  app.classList.remove('screen-shake');
  void app.offsetWidth;
  app.classList.add('screen-shake');

  screenShakeTimer = setTimeout(() => {
    app.classList.remove('screen-shake');
  }, SCREEN_SHAKE_MS);
}

function createFloatingText(cell, text, color, options = {}) {
  if (!cell) return;

  floatingTexts.push({
    x: cell.x * CELL_SIZE + CELL_SIZE / 2,
    y: cell.y * CELL_SIZE + CELL_SIZE / 2,
    text,
    color,
    fontScale: options.fontScale ?? 0.78,
    shadowBlur: options.shadowBlur ?? 12,
    strokeWidth: options.strokeWidth ?? 4,
    startTime: Date.now()
  });
}

// Easing: scale từ 0 lên hơi quá 1 rồi về 1 (bounce nhẹ)
function easeOutBack(t) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

// ─── A* Pathfinding ───────────────────────────────────────────────────────────
function manhattan(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return Math.min(dx, GRID_SIZE - dx) + Math.min(dy, GRID_SIZE - dy);
}

function astar(start, goal, snakeBody) {
  // Exclude last tail segment — it vacates next tick
  const obstacles = new Set(
    snakeBody.slice(0, -1).map(cellKey)
  );

  const openSet = [];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();

  const startKey = `${start.x},${start.y}`;
  gScore.set(startKey, 0);
  openSet.push({ x: start.x, y: start.y, g: 0, f: manhattan(start, goal) });

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const key = `${current.x},${current.y}`;

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    closedSet.add(key);

    const neighbors = getNeighbors(current);

    for (const nb of neighbors) {
      const nbKey = `${nb.x},${nb.y}`;
      if (closedSet.has(nbKey) || obstacles.has(nbKey)) continue;

      const tentativeG = current.g + 1;
      if (tentativeG < (gScore.get(nbKey) ?? Infinity)) {
        cameFrom.set(nbKey, current);
        gScore.set(nbKey, tentativeG);
        openSet.push({ ...nb, g: tentativeG, f: tentativeG + manhattan(nb, goal) });
      }
    }
  }
  return null;
}

function reconstructPath(cameFrom, end) {
  const path = [];
  let cur = end;
  while (cur) {
    path.unshift({ x: cur.x, y: cur.y });
    cur = cameFrom.get(`${cur.x},${cur.y}`);
  }
  return path;
}

function floodFill(startCell, obstacles) {
  const visited = new Set([cellKey(startCell)]);
  const queue = [startCell];
  let count = 0;
  while (queue.length > 0) {
    const cell = queue.shift();
    count++;

    for (const n of getNeighbors(cell)) {
      const k = cellKey(n);
      if (!visited.has(k) && !obstacles.has(k)) {
        visited.add(k);
        queue.push(n);
      }
    }
  }
  return count;
}

// Simulate snake following a path to a specific apple (grows once when eating it),
// then flood-fill from final head position to verify enough space remains.
function isPathSafe(path, snakeBody, targetApple = null) {
  const targetKey = targetApple ? cellKey(targetApple) : null;
  const targetGrows = targetApple?.grows !== false;
  const targetShrink = Number(targetApple?.shrink) || 0;
  let simSnake = snakeBody.map(s => ({ ...s }));
  let growthPending = 0;
  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    const willEat = targetKey && cellKey(step) === targetKey;
    const willGrow = willEat && targetGrows;
    const blockedBody = willGrow || growthPending > 0 ? simSnake : simSnake.slice(0, -1);
    if (blockedBody.some(seg => sameCell(seg, step))) return false;

    simSnake.unshift(path[i]);
    if (willGrow) {
      growthPending++;
    } else if (growthPending > 0) {
      growthPending--;
    } else {
      simSnake.pop();
    }
    if (willEat && targetShrink > 0) shrinkSnakeBody(simSnake, targetShrink);
  }
  const tail = simSnake[simSnake.length - 1];
  const pathToTail = astar(simSnake[0], tail, simSnake);
  if (!pathToTail || pathToTail.length < 2) return false;

  const obstacles = new Set(simSnake.slice(0, -1).map(cellKey));
  const reachable = floodFill(simSnake[0], obstacles);
  const emptyCells = GRID_SIZE * GRID_SIZE - simSnake.length;
  const minSpace = Math.min(emptyCells + 1, Math.max(8, simSnake.length));
  return reachable >= minSpace;
}

function getSurvivalDirection(head, snakeBody, currentDir) {
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];
  const valid = dirs.filter(d => !(d.x === -currentDir.x && d.y === -currentDir.y));
  const bodySet = new Set(snakeBody.slice(0, -1).map(cellKey));

  let bestDir = null;
  let bestScore = -1;

  for (const dir of valid) {
    const next = {
      x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE
    };
    if (bodySet.has(cellKey(next))) continue;
    const space = floodFill(next, bodySet);
    if (space > bestScore) {
      bestScore = space;
      bestDir = dir;
    }
  }
  return bestDir ?? currentDir;
}

function getAIDirection() {
  const head = snake[0];

  if (useSingleAppleMazeMode) return getSingleAppleMazeDirection();

  const canEnterHamiltonian = snake.length <= HAMILTONIAN_MOVE_UNTIL_LENGTH;
  const canUseDenseHamiltonian = canEnterHamiltonian && isDenseAppleWinMode();

  if (!useHamiltonianMode && canUseDenseHamiltonian) {
    useHamiltonianMode = true;
  }

  if (useHamiltonianMode && snake.length >= HAMILTONIAN_HARD_LOCK_LENGTH) {
    lockHamiltonianMode = true;
  }

  if (useHamiltonianMode && !lockHamiltonianMode && !isDenseAppleWinMode()) {
    useHamiltonianMode = false;
  }

  if (
    isSingleAppleMazeCheckActive() &&
    hasSafeSingleApplePath()
  ) {
    enterSingleAppleMazeMode();
    return getSingleAppleMazeDirection();
  }

  if (!useSerpentineWinMode && !useHamiltonianMode && snake.length >= SERPENTINE_WIN_LENGTH) {
    useSerpentineWinMode = true;
  }

  if (useSerpentineWinMode) return getSerpentineWinDirection();

  if (useHamiltonianMode) return getHamiltonianWinDirection();

  if (snake.length >= SERPENTINE_PREP_LENGTH && snake.length < SERPENTINE_WIN_LENGTH) {
    if (serpentineLooseGapCooldown > 0) {
      serpentineLooseGapCooldown--;
    } else if (snake.length < SERPENTINE_LOOSE_GAP_END_LENGTH) {
      const prepProgress = (snake.length - SERPENTINE_PREP_LENGTH) /
        (SERPENTINE_LOOSE_GAP_END_LENGTH - SERPENTINE_PREP_LENGTH);
      const looseGapChance = SERPENTINE_LOOSE_GAP_CHANCE * (1 - prepProgress);
      if (Math.random() < looseGapChance) {
        serpentineLooseGapCooldown = SERPENTINE_LOOSE_GAP_RECOVERY_TICKS;
        return getSerpentineTransitionDirection(false, { preferOpenGap: true });
      }
    }

    if (!isSnakeAlignedToSerpentine()) {
      return getSerpentineTransitionDirection(true);
    }
  }

  if (snake.length >= SERPENTINE_PREP_LENGTH && !isSnakeAlignedToSerpentine()) {
    return getSerpentineTransitionDirection(true);
  }

  // ── Tier 1: Stochastic early game ────────────────────────────────────────
  // Free-roaming and more varied; switches out early to protect late-game.
  if (snake.length < RANDOM_MOVE_UNTIL_LENGTH) {
    const randomDir = getRandomizedShortSnakeDirection();
    if (randomDir) return randomDir;
  }

  // ── Tier 2: Late midgame apple chase ─────────────────────────────────────
  // Keep eating visible when a full simulated path remains safe.
  const chaseDir = getSafeAppleChaseDirection();
  if (chaseDir) return chaseDir;

  if (!isSnakeAlignedToSerpentine()) {
    return getSerpentineTransitionDirection(false);
  }

  // ── Tier 3: Serpentine safety loop ────────────────────────────────────────
  // After early random mode, avoid Hamiltonian movement and preserve a path to win.
  const cycleDir = getSerpentineDirection();
  const cycleHead = {
    x: (head.x + cycleDir.x + GRID_SIZE) % GRID_SIZE,
    y: (head.y + cycleDir.y + GRID_SIZE) % GRID_SIZE
  };
  if (!isBodyCollision(cycleHead)) return cycleDir;

  // ── Tier 6: Survival — pick direction with most reachable space ───────────
  return getSurvivalDirection(head, snake, snakeDirection);
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function render() {
  // Background
  ctx.fillStyle = '#111118';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
    ctx.stroke();
  }

  // Apples
  const APPLE_ANIM_MS = 350;
  const RIPPLE_MS = 600;
  apples.forEach(apple => {
    const px = apple.x * CELL_SIZE + CELL_SIZE / 2;
    const py = apple.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE / 2 - 2;
    const age = Date.now() - apple.spawnTime;

    // Vòng sáng lan toả — 3 vòng stagger 130ms
    if (age < RIPPLE_MS) {
      for (let i = 0; i < 3; i++) {
        const start = i * 130;
        const elapsed = age - start;
        if (elapsed <= 0) continue;
        const t = Math.min(elapsed / (RIPPLE_MS - start), 1);
        const rippleR = r + CELL_SIZE * 1.6 * t;
        const alpha = (1 - t) * 0.55;
        ctx.strokeStyle = `rgba(255, 90, 90, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Táo (scale-in bounce)
    const scale = age < APPLE_ANIM_MS ? easeOutBack(age / APPLE_ANIM_MS) : 1;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#228822';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(3, -r - 4);
    ctx.stroke();

    ctx.restore();
  });

  // Bombs
  const BOMB_ANIM_MS = 300;
  bombs.forEach(bomb => {
    const px = bomb.x * CELL_SIZE + CELL_SIZE / 2;
    const py = bomb.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE / 2 - 4;
    const age = Date.now() - bomb.spawnTime;
    const scale = age < BOMB_ANIM_MS ? easeOutBack(age / BOMB_ANIM_MS) : 1;
    const pulse = 1 + Math.sin(Date.now() / 130) * 0.05;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale * pulse, scale * pulse);

    ctx.fillStyle = '#14141c';
    ctx.beginPath();
    ctx.arc(0, 1, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2f3345';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8a6a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.65);
    ctx.quadraticCurveTo(r * 0.75, -r * 1.15, r * 1.1, -r * 0.95);
    ctx.stroke();

    ctx.fillStyle = '#ffcc33';
    ctx.beginPath();
    ctx.arc(r * 1.18, -r, 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Color stars
  const COLOR_STAR_ANIM_MS = 360;
  colorFlowers.forEach(flower => {
    const px = flower.x * CELL_SIZE + CELL_SIZE / 2;
    const py = flower.y * CELL_SIZE + CELL_SIZE / 2;
    const age = Date.now() - flower.spawnTime;
    const scale = age < COLOR_STAR_ANIM_MS ? easeOutBack(age / COLOR_STAR_ANIM_MS) : 1;
    const spin = Date.now() / 520;
    const outerR = CELL_SIZE * 0.39;
    const innerR = CELL_SIZE * 0.18;
    const starColor = flower.color || COLOR_THEMES[flower.themeIndex]?.primary || currentTheme.primary;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(spin);
    ctx.scale(scale, scale);

    ctx.shadowColor = starColor;
    ctx.shadowBlur = 6;
    ctx.fillStyle = starColor;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerR : innerR;
      const angle = -Math.PI / 2 + (Math.PI * i) / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(-CELL_SIZE * 0.08, -CELL_SIZE * 0.1, CELL_SIZE * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Rainbow items
  const RAINBOW_ANIM_MS = 360;
  rainbowItems.forEach(item => {
    const px = item.x * CELL_SIZE + CELL_SIZE / 2;
    const py = item.y * CELL_SIZE + CELL_SIZE / 2;
    const age = Date.now() - item.spawnTime;
    const scale = age < RAINBOW_ANIM_MS ? easeOutBack(age / RAINBOW_ANIM_MS) : 1;
    const rotation = Date.now() / 420;
    const petalRadius = CELL_SIZE * 0.18;
    const petalDistance = CELL_SIZE * 0.25;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.28)';
    ctx.shadowBlur = 4;

    for (let i = 0; i < RAINBOW_ITEM_COLORS.length; i++) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / RAINBOW_ITEM_COLORS.length;
      const petalX = Math.cos(angle) * petalDistance;
      const petalY = Math.sin(angle) * petalDistance;
      ctx.fillStyle = RAINBOW_ITEM_COLORS[i];
      ctx.beginPath();
      ctx.ellipse(petalX, petalY, petalRadius * 0.78, petalRadius * 1.24, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff7a8';
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    ctx.arc(-CELL_SIZE * 0.045, -CELL_SIZE * 0.045, CELL_SIZE * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Spider items
  const SPIDER_ANIM_MS = 360;
  spiderItems.forEach(item => {
    const px = item.x * CELL_SIZE + CELL_SIZE / 2;
    const py = item.y * CELL_SIZE + CELL_SIZE / 2;
    const age = Date.now() - item.spawnTime;
    const scale = age < SPIDER_ANIM_MS ? easeOutBack(age / SPIDER_ANIM_MS) : 1;
    const bob = Math.sin(Date.now() / 180) * CELL_SIZE * 0.035;
    const bodyR = CELL_SIZE * 0.22;
    const headR = CELL_SIZE * 0.13;

    ctx.save();
    ctx.translate(px, py + bob);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(196, 181, 253, 0.5)';
    ctx.shadowBlur = 7;

    ctx.strokeStyle = '#1f1635';
    ctx.lineWidth = 2.4;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = -CELL_SIZE * 0.14 + i * CELL_SIZE * 0.09;
        const kneeX = side * CELL_SIZE * (0.28 + i * 0.025);
        const footX = side * CELL_SIZE * (0.43 + i * 0.02);
        const footY = y + (i < 2 ? -CELL_SIZE * 0.06 : CELL_SIZE * 0.06);
        ctx.beginPath();
        ctx.moveTo(side * CELL_SIZE * 0.1, y);
        ctx.lineTo(kneeX, y + (i < 2 ? -CELL_SIZE * 0.035 : CELL_SIZE * 0.035));
        ctx.lineTo(footX, footY);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#24153a';
    ctx.beginPath();
    ctx.ellipse(0, CELL_SIZE * 0.04, bodyR * 0.9, bodyR * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#342052';
    ctx.beginPath();
    ctx.arc(0, -CELL_SIZE * 0.18, headR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    for (const eyeX of [-CELL_SIZE * 0.045, CELL_SIZE * 0.045]) {
      ctx.beginPath();
      ctx.arc(eyeX, -CELL_SIZE * 0.2, CELL_SIZE * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(196, 181, 253, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, CELL_SIZE * 0.04, bodyR * 0.55, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
    ctx.restore();
  });

  // Snake body: segmented gradient, inset sides, rounded turns, smart wall-wrap cuts.
  const snakeWidth = Math.max(12, CELL_SIZE - 6);
  ctx.lineWidth = snakeWidth;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  const renderTime = Date.now();
  const rainbowSnakeActive = renderTime < rainbowSnakeUntil;
  const invisibleSnakeActive = renderTime < invisibleSnakeUntil;

  const getSnakeColor = (index) => {
    if (rainbowSnakeActive) {
      const hue = (renderTime / 26 + index * 24) % 360;
      const lightness = index === 0 ? 63 : 54 - (index / Math.max(snake.length - 1, 1)) * 12;
      return `hsl(${hue}, 100%, ${lightness}%)`;
    }

    const t = index / Math.max(snake.length - 1, 1); // 0=head, 1=tail
    const rgb = currentTheme.rgb.map((channel, channelIndex) => {
      const tailChannel = currentTheme.tailRgb[channelIndex];
      return Math.round(channel + (tailChannel - channel) * t);
    });
    return `rgb(${rgb.join(',')})`;
  };

  ctx.save();
  if (invisibleSnakeActive) ctx.globalAlpha = 0.1;

  for (let i = snake.length - 1; i > 0; i--) {
    const seg = snake[i];
    const next = snake[i - 1];
    const px = seg.x * CELL_SIZE + CELL_SIZE / 2;
    const py = seg.y * CELL_SIZE + CELL_SIZE / 2;
    const nx = next.x * CELL_SIZE + CELL_SIZE / 2;
    const ny = next.y * CELL_SIZE + CELL_SIZE / 2;
    const wrapsX = Math.abs(seg.x - next.x) > 1;
    const wrapsY = Math.abs(seg.y - next.y) > 1;

    ctx.strokeStyle = getSnakeColor(i - 1);
    ctx.beginPath();
    if (wrapsX) {
      ctx.moveTo(px, py);
      ctx.lineTo(seg.x < next.x ? 0 : CANVAS_SIZE, py);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(seg.x < next.x ? CANVAS_SIZE : 0, ny);
      ctx.lineTo(nx, ny);
    } else if (wrapsY) {
      ctx.moveTo(px, py);
      ctx.lineTo(px, seg.y < next.y ? 0 : CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(nx, seg.y < next.y ? CANVAS_SIZE : 0);
      ctx.lineTo(nx, ny);
    } else {
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
    }
    ctx.stroke();
  }

  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    ctx.fillStyle = getSnakeColor(i);
    ctx.beginPath();
    ctx.arc(
      seg.x * CELL_SIZE + CELL_SIZE / 2,
      seg.y * CELL_SIZE + CELL_SIZE / 2,
      snakeWidth / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const head = snake[0];
  if (rainbowSnakeActive) {
    const headGradient = ctx.createLinearGradient(
      head.x * CELL_SIZE,
      head.y * CELL_SIZE,
      (head.x + 1) * CELL_SIZE,
      (head.y + 1) * CELL_SIZE
    );
    RAINBOW_COLORS.forEach((color, index) => {
      headGradient.addColorStop(index / (RAINBOW_COLORS.length - 1), color);
    });
    ctx.fillStyle = headGradient;
  } else {
    ctx.fillStyle = currentTheme.primary;
  }
  ctx.beginPath();
  ctx.roundRect(
    head.x * CELL_SIZE + (CELL_SIZE - snakeWidth) / 2,
    head.y * CELL_SIZE + (CELL_SIZE - snakeWidth) / 2,
    snakeWidth,
    snakeWidth,
    6
  );
  ctx.fill();
  ctx.restore();

  // Snake eyes
  drawEyes(snake[0], snakeDirection);

  drawFireflies();
  drawExplosions();
  drawFireflyFlashes();
  drawFloatingTexts();
}

function drawFireflies() {
  fireflies.forEach(firefly => {
    const px = firefly.x * CELL_SIZE;
    const py = firefly.y * CELL_SIZE;
    const age = Date.now() - firefly.spawnTime;
    const scale = age < 420 ? easeOutBack(age / 420) : 1;
    const pulse = 0.5 + (Math.sin(Date.now() / 150 + firefly.phase) + 1) * 0.5;
    const glowRadius = CELL_SIZE * (0.22 + pulse * 0.34);
    const dotRadius = CELL_SIZE * (0.055 + pulse * 0.045);

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, `rgba(255, 255, 220, ${0.45 + pulse * 0.4})`);
    glow.addColorStop(0.45, `rgba(250, 204, 21, ${0.18 + pulse * 0.28})`);
    glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#fff7a8';
    ctx.shadowBlur = 5 + pulse * 8;
    ctx.fillStyle = `rgba(255, 250, 190, ${0.62 + pulse * 0.38})`;
    ctx.beginPath();
    ctx.arc(0, 0, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawExplosions() {
  const now = Date.now();
  explosions = explosions.filter(explosion => now - explosion.startTime < EXPLOSION_MS);

  explosions.forEach(explosion => {
    const age = now - explosion.startTime;
    const t = Math.min(age / EXPLOSION_MS, 1);
    const alpha = 1 - t;
    const shockwaveRadius = CELL_SIZE * (0.8 + 4.4 * t);
    const innerRadius = CELL_SIZE * (1.15 - t * 0.48);
    const outerGlowRadius = CELL_SIZE * (1.1 + 3.2 * t);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(
      explosion.x,
      explosion.y,
      0,
      explosion.x,
      explosion.y,
      outerGlowRadius
    );
    glow.addColorStop(0, `rgba(255, 245, 190, ${0.92 * alpha})`);
    glow.addColorStop(0.32, `rgba(255, 120, 30, ${0.5 * alpha})`);
    glow.addColorStop(1, 'rgba(255, 40, 30, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, outerGlowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff4a8';
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 225, 120, ${0.9 * alpha})`;
    ctx.lineWidth = Math.max(2, CELL_SIZE * 0.25 * alpha);
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, shockwaveRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 70, 60, ${0.62 * alpha})`;
    ctx.lineWidth = Math.max(1, CELL_SIZE * 0.12 * alpha);
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, shockwaveRadius * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    explosion.particles.forEach(particle => {
      const px = particle.x + particle.vx * age * 0.06;
      const py = particle.y + particle.vy * age * 0.06 + t * t * CELL_SIZE * 0.55;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(px, py, particle.size * (0.25 + alpha), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  });
}

function drawFireflyFlashes() {
  const now = Date.now();
  fireflyFlashes = fireflyFlashes.filter(flash => now - flash.startTime < FIREFLY_FLASH_MS);

  fireflyFlashes.forEach(flash => {
    const age = now - flash.startTime;
    const t = Math.min(age / FIREFLY_FLASH_MS, 1);
    const alpha = 1 - t;
    const radius = CELL_SIZE * (0.6 + 3.6 * t);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;

    const burst = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, radius);
    burst.addColorStop(0, 'rgba(255, 255, 245, 1)');
    burst.addColorStop(0.3, 'rgba(255, 247, 168, 0.75)');
    burst.addColorStop(1, 'rgba(255, 247, 168, 0)');
    ctx.fillStyle = burst;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 245, ${alpha})`;
    ctx.lineWidth = Math.max(1, 3 * alpha);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const inner = CELL_SIZE * (0.24 + t * 0.8);
      const outer = CELL_SIZE * (0.95 + t * 2.2);
      ctx.beginPath();
      ctx.moveTo(flash.x + Math.cos(angle) * inner, flash.y + Math.sin(angle) * inner);
      ctx.lineTo(flash.x + Math.cos(angle) * outer, flash.y + Math.sin(angle) * outer);
      ctx.stroke();
    }

    ctx.restore();
  });
}

function drawFloatingTexts() {
  const now = Date.now();
  floatingTexts = floatingTexts.filter(item => now - item.startTime < FLOATING_TEXT_MS);

  floatingTexts.forEach(item => {
    const age = now - item.startTime;
    const t = Math.min(age / FLOATING_TEXT_MS, 1);
    const alpha = 1 - t;
    const y = item.y - CELL_SIZE * 1.25 * t;
    const scale = 0.85 + 0.35 * Math.sin(Math.min(t * Math.PI, Math.PI));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(item.x, y);
    ctx.scale(scale, scale);
    const fontSize = Math.max(12, Math.floor(CELL_SIZE * (item.fontScale ?? 0.78)));
    ctx.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = item.strokeWidth ?? 4;
    ctx.strokeStyle = 'rgba(8, 10, 18, 0.82)';
    ctx.shadowColor = item.color;
    ctx.shadowBlur = item.shadowBlur ?? 12;
    ctx.strokeText(item.text, 0, 0);
    ctx.fillStyle = item.color;
    ctx.fillText(item.text, 0, 0);
    ctx.restore();
  });
}

function drawEyes(head, dir) {
  const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = head.y * CELL_SIZE + CELL_SIZE / 2;
  const eyeDist = 4;
  const eyeR = 2;

  let eyes;
  if (dir.x === 1)       eyes = [{ x: cx + 4, y: cy - eyeDist }, { x: cx + 4, y: cy + eyeDist }];
  else if (dir.x === -1) eyes = [{ x: cx - 4, y: cy - eyeDist }, { x: cx - 4, y: cy + eyeDist }];
  else if (dir.y === -1) eyes = [{ x: cx - eyeDist, y: cy - 4 }, { x: cx + eyeDist, y: cy - 4 }];
  else                   eyes = [{ x: cx - eyeDist, y: cy + 4 }, { x: cx + eyeDist, y: cy + 4 }];

  eyes.forEach(e => {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(e.x, e.y, eyeR + 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(e.x, e.y, eyeR - 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ─── UI Updates ───────────────────────────────────────────────────────────────
function updateUI() {
  document.getElementById('win-count').textContent = winCount;
  document.getElementById('loss-count').textContent = lossCount;
  document.getElementById('heart-count').textContent = totalHearts.toLocaleString();
}

function setStreamroomVideoPlaying(isPlaying) {
  const video = document.getElementById('streamroom-video');
  if (!video) return;

  video.muted = true;
  video.loop = true;
  video.controls = false;

  if (isPlaying) {
    video.play().catch(() => {});
  } else {
    video.pause();
    video.currentTime = 0;
  }
}

function setUIState(state, info = '') {
  const controlPanel = document.getElementById('control-panel');
  const streamroomPanel = document.getElementById('streamroom-panel');
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const connectForm = document.getElementById('connect-form');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const input = document.getElementById('username-input');

  controlPanel.hidden = false;
  streamroomPanel.hidden = true;
  setStreamroomVideoPlaying(false);
  if (state !== 'connected') {
    resetMemberGreeting();
    resetLikeSticker();
  }
  dot.className = 'dot';

  switch (state) {
    case 'connecting':
      dot.classList.add('dot-yellow');
      text.textContent = `Connecting @${info}...`;
      connectForm.hidden = false;
      input.hidden = false;
      connectBtn.hidden = false;
      disconnectBtn.hidden = false;
      connectBtn.disabled = true;
      disconnectBtn.disabled = true;
      input.disabled = true;
      break;
    case 'connected':
      dot.classList.add('dot-green');
      text.textContent = `${String(info).replace(/^@/, '')}`;
      controlPanel.hidden = true;
      streamroomPanel.hidden = false;
      setStreamroomVideoPlaying(true);
      connectForm.hidden = true;
      input.hidden = true;
      connectBtn.hidden = true;
      disconnectBtn.hidden = true;
      connectBtn.disabled = true;
      disconnectBtn.disabled = true;
      input.disabled = true;
      break;
    case 'error':
      dot.classList.add('dot-red');
      text.textContent = `Error: ${info}`;
      connectForm.hidden = false;
      input.hidden = false;
      connectBtn.hidden = false;
      disconnectBtn.hidden = false;
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      input.disabled = false;
      break;
    default:
      dot.classList.add('dot-gray');
      text.textContent = 'Disconnected';
      connectForm.hidden = false;
      input.hidden = false;
      connectBtn.hidden = false;
      disconnectBtn.hidden = false;
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      input.disabled = false;
  }
}

// ─── Member Greeting Sticker ─────────────────────────────────────────────────
function resetMemberGreeting() {
  clearTimeout(memberGreetingTimer);
  clearTimeout(memberGreetingHideTimer);
  memberGreetingQueue = [];
  memberGreetingActive = false;
  getSpeechSynthesis()?.cancel();

  const greeting = document.getElementById('member-greeting');
  if (!greeting) return;
  greeting.hidden = true;
  const text = greeting.querySelector('.member-greeting-text');
  if (text) text.textContent = 'Hello!';
  greeting.classList.remove('member-greeting--visible', 'member-greeting--hiding');
}

function showMemberGreeting(data = {}) {
  memberGreetingQueue.push(data);
  if (!memberGreetingActive) playNextMemberGreeting();
}

function playNextMemberGreeting() {
  const greeting = document.getElementById('member-greeting');
  const streamroomPanel = document.getElementById('streamroom-panel');
  if (!greeting || !streamroomPanel || streamroomPanel.hidden) {
    resetMemberGreeting();
    return;
  }

  const nextGreeting = memberGreetingQueue.shift();
  if (!nextGreeting) {
    memberGreetingActive = false;
    return;
  }

  memberGreetingActive = true;
  clearTimeout(memberGreetingTimer);
  clearTimeout(memberGreetingHideTimer);

  const sticker = greeting.querySelector('img');
  if (sticker) sticker.src = sticker.src;
  const text = greeting.querySelector('.member-greeting-text');
  const displayName = getMemberDisplayName(nextGreeting);
  if (text) text.textContent = `Hello! ${displayName}`;
  if (shouldSpeakMemberGreeting(nextGreeting)) {
    speakMemberGreeting(displayName);
  } else {
    getSpeechSynthesis()?.cancel();
  }

  greeting.hidden = false;
  greeting.classList.remove('member-greeting--hiding');
  requestAnimationFrame(() => greeting.classList.add('member-greeting--visible'));

  memberGreetingTimer = setTimeout(() => {
    greeting.classList.remove('member-greeting--visible');
    greeting.classList.add('member-greeting--hiding');

    memberGreetingHideTimer = setTimeout(() => {
      greeting.hidden = true;
      greeting.classList.remove('member-greeting--hiding');
      playNextMemberGreeting();
    }, MEMBER_GREETING_FADE_MS);
  }, MEMBER_GREETING_MS);
}

// ─── Like Sticker ────────────────────────────────────────────────────────────
function resetLikeSticker() {
  clearTimeout(likeStickerTimer);
  clearTimeout(likeStickerHideTimer);

  const sticker = document.getElementById('like-sticker');
  if (!sticker) return;
  sticker.hidden = true;
  sticker.classList.remove('like-sticker--visible', 'like-sticker--hiding');
}

function showLikeSticker() {
  const sticker = document.getElementById('like-sticker');
  const streamroomPanel = document.getElementById('streamroom-panel');
  if (!sticker || !streamroomPanel || streamroomPanel.hidden) return;

  clearTimeout(likeStickerTimer);
  clearTimeout(likeStickerHideTimer);

  const image = sticker.querySelector('img');
  if (image) {
    image.src = LIKE_STICKER_IMAGES[likeStickerImageIndex];
    likeStickerImageIndex = (likeStickerImageIndex + 1) % LIKE_STICKER_IMAGES.length;
  }

  sticker.hidden = false;
  sticker.classList.remove('like-sticker--visible', 'like-sticker--hiding');
  requestAnimationFrame(() => sticker.classList.add('like-sticker--visible'));

  likeStickerTimer = setTimeout(() => {
    sticker.classList.remove('like-sticker--visible');
    sticker.classList.add('like-sticker--hiding');

    likeStickerHideTimer = setTimeout(() => {
      sticker.hidden = true;
      sticker.classList.remove('like-sticker--hiding');
    }, LIKE_STICKER_FADE_MS);
  }, LIKE_STICKER_MS);
}

// ─── Gift Notifications ───────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function normalizeGiftName(data) {
  return `${data.giftName || ''} ${data.displayName || ''} ${data.giftType || ''}`
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function getGiftEffect(data) {
  const normalized = normalizeGiftName(data);
  if (normalized.includes('rosa')) return TEST_GIFTS.rosa;
  if (normalized.includes('rose') || normalized.includes('hoa hong')) return TEST_GIFTS.rose;
  if (
    (normalized.includes('tim') && normalized.includes('doi')) ||
    (normalized.includes('team') && normalized.includes('heart')) ||
    normalized.includes('tim doi') ||
    normalized.includes('qua tim doi') ||
    normalized.includes('double heart') ||
    normalized.includes('team heart')
  ) return TEST_GIFTS.doubleHeart;
  if (normalized.includes('follow')) return TEST_GIFTS.follow;
  if (normalized.includes('heart') || normalized.includes('ban tim') || normalized.includes('tim')) return TEST_GIFTS.heart;
  if (normalized.includes('pig') || normalized.includes('chu heo may') || normalized.includes('heo')) return TEST_GIFTS.pig;
  if (normalized.includes('tiktok') || normalized.includes('tik tok')) return TEST_GIFTS.tiktok;

  return {
    giftType: 'default',
    giftName: data.giftName || 'Gift',
    displayName: data.giftName || 'Gift',
    appleCount: Number(data.appleCount) || 0,
    image: ''
  };
}

function getGiftImage(data, effect) {
  return getFirstGiftImageUrl(data.giftPictureUrl) ||
    getFirstGiftImageUrl(data.giftImage) ||
    getFirstGiftImageUrl(data.extendedGiftInfo) ||
    getFirstGiftImageUrl(data.image) ||
    getFirstGiftImageUrl(effect.image) ||
    '';
}

function getFirstGiftImageUrl(value, depth = 0) {
  if (!value || depth > 5) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = getFirstGiftImageUrl(item, depth + 1);
      if (url) return url;
    }
    return '';
  }
  if (typeof value !== 'object') return '';

  const keys = [
    'url',
    'urls',
    'urlList',
    'url_list',
    'imageUrl',
    'image_url',
    'giftPictureUrl',
    'giftImage',
    'gift_image',
    'image',
    'icon'
  ];

  for (const key of keys) {
    const url = getFirstGiftImageUrl(value[key], depth + 1);
    if (url) return url;
  }

  return '';
}

function showGiftNotification(data) {
  const feed = document.getElementById('gift-feed');
  const effect = getGiftEffect(data);
  const appleCount = Number(data.appleCount ?? effect.appleCount) || 0;
  const bombCount = Number(data.bombCount ?? effect.bombCount) || 0;
  const colorFlowerCount = Number(data.colorFlowerCount) || 1;
  const rainbowItemCount = Number(data.rainbowItemCount) || (effect.action === 'rainbow' ? 1 : 0);
  const fireflyCount = Number(data.fireflyCount) || 0;
  const giftImage = getGiftImage(data, effect);
  const displayName = data.displayName || effect.displayName || data.giftName || 'Gift';
  const resultLabel = effect.action === 'rainbow'
    ? `<span class="gift-action">+${rainbowItemCount} rainbow flower</span>`
    : effect.action === 'color'
    ? `<span class="gift-action">+${colorFlowerCount} color star</span>`
    : effect.action === 'bomb' || bombCount > 0
      ? `<span class="gift-action gift-action--danger">+${bombCount || 1} 💣</span>`
    : fireflyCount > 0
      ? `<span class="gift-action">+${fireflyCount} firefly</span>`
    : `<span class="apple-count">+${appleCount} 🍎</span>`;

  // Xóa card cũ ngay để chỉ hiện 1 card
  while (feed.firstChild) feed.removeChild(feed.firstChild);

  const card = document.createElement('div');
  card.className = 'gift-card';
  card.innerHTML = `
    ${giftImage ? `<img class="gift-image" src="${escapeAttr(giftImage)}" alt="${escapeAttr(displayName)}" onerror="this.remove()" />` : ''}
    <span class="gift-text">
      <span class="gifter-name">${escapeHtml(data.nickname || 'Viewer')} · ${escapeHtml(displayName)}</span>
      ${resultLabel}
    </span>
  `;

  feed.appendChild(card);
  requestAnimationFrame(() => card.classList.add('gift-card--visible'));

  setTimeout(() => {
    card.classList.remove('gift-card--visible');
    card.classList.add('gift-card--hiding');
    setTimeout(() => card.remove(), 300);
  }, GIFT_NOTIFICATION_MS);
}

function applyGiftEffect(data) {
  const effect = getGiftEffect(data);
  const repeatCount = Number(data.repeatCount) || 1;
  const isMappedGift = effect.giftType !== 'default';
  const appleCount = isMappedGift
    ? (Number(effect.appleCount) || 0) * repeatCount
    : Number(data.appleCount ?? effect.appleCount) || 0;
  const bombCount = isMappedGift
    ? (Number(effect.bombCount) || 0) * repeatCount
    : Number(data.bombCount ?? effect.bombCount) || 0;
  const colorFlowerCount = effect.action === 'color' ? repeatCount : 0;
  const rainbowItemCount = effect.action === 'rainbow' ? repeatCount : 0;

  if (effect.action === 'color') {
    for (let i = 0; i < colorFlowerCount; i++) spawnColorFlower();
    render();
  } else if (effect.action === 'rainbow') {
    for (let i = 0; i < rainbowItemCount; i++) spawnRainbowItem();
    render();
  } else {
    if (effect.action === 'bomb' || bombCount > 0) {
      bombQueue += Math.max(1, bombCount);
    }
    if (appleCount > 0) {
      appleQueue += appleCount;
    }
  }

  totalGifts += repeatCount;
  if (!data.silent) {
    showGiftNotification({ ...data, appleCount, bombCount, colorFlowerCount, rainbowItemCount, displayName: effect.displayName });
  }
  updateUI();
}

function applyLikeReward(data) {
  const appleCount = Number(data.appleCount) || 0;
  if (appleCount <= 0) return;

  totalHearts = Number(data.likeCount) || totalHearts;
  appleQueue += appleCount;
  const fireflyCount = Math.max(1, Math.floor(appleCount / LIKE_REWARD_APPLES_PER_FIREFLY));
  for (let i = 0; i < fireflyCount; i++) spawnFirefly();
  if (!data.silent) {
    showGiftNotification({
      ...data,
      giftName: 'Tap tim',
      displayName: `${data.threshold || 500} hearts`,
      appleCount
    });
  }
  updateUI();
}

function applyCommentReward(data) {
  const appleCount = Number(data.appleCount) || 0;
  const fireflyCount = Number(data.fireflyCount) || 0;
  if (appleCount <= 0 && fireflyCount <= 0) return;

  if (appleCount > 0) appleQueue += appleCount;
  for (let i = 0; i < fireflyCount; i++) spawnFirefly();
  if (!data.silent) {
    showGiftNotification({
      ...data,
      giftName: 'Comment',
      displayName: fireflyCount > 0 ? 'Comment 111' : 'Comment',
      appleCount,
      fireflyCount
    });
  }
  updateUI();
}

function updateHeartCount(data) {
  totalHearts = Number(data.likeCount) || totalHearts;
  updateUI();
}

function applyFollowEffect(data) {
  spawnColorFlower();
  render();
  showGiftNotification({
    ...data,
    giftName: 'Follow',
    displayName: 'Follow',
    giftType: 'follow',
    appleCount: 0
  });
  updateUI();
}

function applyMemberRoomReward() {
  appleQueue += MEMBER_APPLE_REWARD;
  bombQueue += MEMBER_BOMB_REWARD;
  for (let i = 0; i < MEMBER_FIREFLY_REWARD; i++) spawnFirefly();
}

// ─── Control Buttons ──────────────────────────────────────────────────────────
document.getElementById('connect-btn').addEventListener('click', async () => {
  primeMemberGreetingVoice();
  const raw = document.getElementById('username-input').value.trim();
  const username = raw.replace(/^@/, '');
  if (!username) {
    alert('Please enter a TikTok username');
    return;
  }
  setUIState('connecting', username);
  try {
    const res = await fetch('/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (res.ok) {
      setUIState('connected', username);
    } else {
      setUIState('error', data.error || 'Unable to connect');
    }
  } catch (err) {
    setUIState('error', 'Network error: ' + err.message);
  }
});

async function disconnectTikTok() {
  await fetch('/disconnect', { method: 'POST' });
  setUIState('disconnected');
}

document.getElementById('disconnect-btn').addEventListener('click', disconnectTikTok);

document.getElementById('username-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('connect-btn').click();
});

document.addEventListener('pointerdown', startThemeMusic, { once: true });
document.addEventListener('pointerdown', primeMemberGreetingVoice, { once: true });
document.addEventListener('keydown', primeMemberGreetingVoice, { once: true });

async function sendTestGift(giftType) {
  const gift = TEST_GIFTS[giftType];
  if (!gift) return;

  await fetch('/test-gift', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      giftType,
      giftName: gift.giftName,
      count: 1,
      appleCount: gift.appleCount,
      bombCount: gift.bombCount || 0,
      silent: true
    })
  });
}

async function sendTestLike(likeCount) {
  await fetch('/test-like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likeCount, silent: true })
  });
}

async function sendTestChat(comment = '222') {
  await fetch('/test-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment, silent: true })
  });
}

async function sendTestFollow() {
  await fetch('/test-follow', { method: 'POST' });
}

document.addEventListener('keydown', async (e) => {
  const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
  const key = e.key.toLowerCase();

  if (key === 't' && !isTyping) {
    toggleThemeMusic();
    return;
  }

  if (!isTyping) startThemeMusic();

  if (key === 'q' && !isTyping) {
    spawnColorFlower();
    render();
  } else if (key === 'e' && !isTyping) {
    playNextThemeTrack();
  } else if (key === 'y' && !isTyping) {
    toggleSingleAppleMazeMode();
  } else if (key === 'r' && !isTyping) {
    await disconnectTikTok();
  } else if (e.key === '1') {
    await sendTestGift('rose');
  } else if (e.key === '2') {
    await sendTestGift('heart');
  } else if (e.key === '3') {
    await sendTestGift('pig');
  } else if (e.key === '4') {
    await sendTestGift('tiktok');
  } else if (e.key === '5') {
    await sendTestLike(200);
  } else if (e.key === '6') {
    await sendTestChat('111');
  } else if (e.key === '7') {
    spawnRainbowItem();
    render();
  } else if (e.key === '8') {
    spawnSpiderItem();
    render();
  } else if (e.key === '9') {
    await sendTestChat('222');
  } else if (e.key === '0') {
    await sendTestGift('rosa');
  }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
const socket = io();

socket.on('tiktok:status', (data) => {
  if (data.connected) setUIState('connected', data.username);
  else setUIState('disconnected');
});

socket.on('tiktok:connected', (data) => {
  totalHearts = 0;
  updateUI();
  setUIState('connected', data.username);
});

socket.on('tiktok:disconnected', () => {
  totalHearts = 0;
  updateUI();
  setUIState('disconnected');
});

socket.on('tiktok:error', (data) => {
  setUIState('error', data.message);
});

socket.on('tiktok:gift', (data) => {
  applyGiftEffect(data);
});

socket.on('tiktok:like', (data) => {
  showLikeSticker();
  updateHeartCount(data);
});

socket.on('tiktok:likeReward', (data) => {
  applyLikeReward(data);
});

socket.on('tiktok:chat', (data) => {
  applyCommentReward(data);
});

socket.on('tiktok:member', (data) => {
  applyMemberRoomReward();
  showMemberGreeting(data);
});

socket.on('tiktok:follow', (data) => {
  applyFollowEffect(data);
});

// ─── Start ────────────────────────────────────────────────────────────────────
lucide.createIcons();
applyColorTheme();
initGame();
