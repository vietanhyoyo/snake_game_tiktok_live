// ─── Constants ───────────────────────────────────────────────────────────────
const GRID_SIZE = 16;
// Fill available screen width (phone: ~23px/cell → 368px canvas; desktop: capped at 30px → 480px)
// Giới hạn theo phone width tối đa 460px để layout luôn dọc
const CELL_SIZE = Math.min(28, Math.max(18, Math.floor((Math.min(window.innerWidth, 460) - 16) / GRID_SIZE)));
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const BASE_TICK_MS = 60;
const MAX_APPLES = Math.floor(GRID_SIZE * GRID_SIZE * 0.4); // tối đa 40% diện tích lưới
const GIFT_NOTIFICATION_MS = 1800;

// ─── Game State ───────────────────────────────────────────────────────────────
let snake = [];
let snakeDirection = { x: 1, y: 0 };
let apples = [];
let appleQueue = 0;
let score = 0;
let totalGifts = 0;
let gameLoopInterval = null;

// ─── Canvas ───────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const ctx = canvas.getContext('2d');

// ─── Init ─────────────────────────────────────────────────────────────────────
function initGame() {
  snake = [
    { x: 8, y: 7 },
    { x: 7, y: 7 },
    { x: 6, y: 7 }
  ];
  snakeDirection = { x: 1, y: 0 };
  apples = [];
  appleQueue = 0;
  score = 0;
  spawnApple();
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(tick, BASE_TICK_MS);
}

// ─── Core Game Loop ───────────────────────────────────────────────────────────
function tick() {
  // Drain apple queue up to the cap
  while (appleQueue > 0 && apples.length < MAX_APPLES) {
    if (spawnApple()) {
      appleQueue--;
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

  snake.unshift(newHead);
  if (ateApple) {
    apples.splice(appleIndex, 1);
    score += 10;
    if (apples.length === 0 && appleQueue === 0) spawnApple();
  } else {
    snake.pop();
  }

  render();
  updateUI();
}

function handleSoftReset() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
  render();
  startDeathCountdown(5);
}

function startDeathCountdown(seconds) {
  const overlay = document.getElementById('death-overlay');
  const countdownEl = document.getElementById('death-countdown');
  overlay.classList.add('visible');
  countdownEl.textContent = seconds;

  let remaining = seconds;
  const timer = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timer);
      overlay.classList.remove('visible');
      restartGame();
    }
  }, 1000);
}

function restartGame() {
  snake = [
    { x: 8, y: 7 },
    { x: 7, y: 7 },
    { x: 6, y: 7 }
  ];
  snakeDirection = { x: 1, y: 0 };
  render();
  updateUI();
  gameLoopInterval = setInterval(tick, BASE_TICK_MS);
}

function isOutOfBounds(cell) {
  return cell.x < 0 || cell.x >= GRID_SIZE || cell.y < 0 || cell.y >= GRID_SIZE;
}

function isBodyCollision(cell) {
  return snake.some(seg => seg.x === cell.x && seg.y === cell.y);
}

// ─── Apple Spawning ───────────────────────────────────────────────────────────
function spawnApple() {
  const occupied = new Set([
    ...snake.map(s => `${s.x},${s.y}`),
    ...apples.map(a => `${a.x},${a.y}`)
  ]);
  const empty = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return false;
  const cell = empty[Math.floor(Math.random() * empty.length)];
  apples.push({ x: cell.x, y: cell.y, spawnTime: Date.now() });
  return true;
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
    snakeBody.slice(0, -1).map(s => `${s.x},${s.y}`)
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

    const neighbors = [
      { x: (current.x + 1) % GRID_SIZE,              y: current.y },
      { x: (current.x - 1 + GRID_SIZE) % GRID_SIZE,  y: current.y },
      { x: current.x, y: (current.y + 1) % GRID_SIZE },
      { x: current.x, y: (current.y - 1 + GRID_SIZE) % GRID_SIZE }
    ];

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
  const visited = new Set([`${startCell.x},${startCell.y}`]);
  const queue = [startCell];
  let count = 0;
  while (queue.length > 0) {
    const cell = queue.shift();
    count++;

    const neighbors = [
      { x: (cell.x + 1) % GRID_SIZE,             y: cell.y },
      { x: (cell.x - 1 + GRID_SIZE) % GRID_SIZE, y: cell.y },
      { x: cell.x, y: (cell.y + 1) % GRID_SIZE },
      { x: cell.x, y: (cell.y - 1 + GRID_SIZE) % GRID_SIZE }
    ];
    for (const n of neighbors) {
      const k = `${n.x},${n.y}`;
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
  const targetKey = targetApple ? `${targetApple.x},${targetApple.y}` : null;
  let simSnake = snakeBody.map(s => ({ ...s }));
  let growthPending = 0;
  for (let i = 1; i < path.length; i++) {
    simSnake.unshift(path[i]);
    if (targetKey && `${path[i].x},${path[i].y}` === targetKey) {
      growthPending++;
    } else if (growthPending > 0) {
      growthPending--;
    } else {
      simSnake.pop();
    }
  }
  const obstacles = new Set(simSnake.map(s => `${s.x},${s.y}`));
  const reachable = floodFill(simSnake[0], obstacles);
  return reachable >= simSnake.length;
}

function getSurvivalDirection(head, snakeBody, currentDir) {
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];
  const valid = dirs.filter(d => !(d.x === -currentDir.x && d.y === -currentDir.y));
  const bodySet = new Set(snakeBody.map(s => `${s.x},${s.y}`));

  let bestDir = null;
  let bestScore = -1;

  for (const dir of valid) {
    const next = {
      x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE
    };
    if (bodySet.has(`${next.x},${next.y}`)) continue;
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

  // ── Tier 1: A* to safest apple ───────────────────────────────────────────
  // Sort apples by distance so we try the nearest ones first.
  // isPathSafe simulates only THIS apple's growth — not all 20 on the grid.
  if (apples.length > 0) {
    const sorted = [...apples].sort((a, b) => manhattan(a, head) - manhattan(b, head));
    let bestPath = null;
    for (const apple of sorted) {
      const path = astar(head, apple, snake);
      if (!path || path.length < 2) continue;
      if (isPathSafe(path, snake, apple)) {
        if (!bestPath || path.length < bestPath.length) {
          bestPath = path;
        }
      }
    }
    if (bestPath) {
      return { x: bestPath[1].x - head.x, y: bestPath[1].y - head.y };
    }
  }

  // ── Tier 2: Chase actual tail ─────────────────────────────────────────────
  const tail = snake[snake.length - 1];
  const pathToTail = astar(head, tail, snake);
  if (pathToTail && pathToTail.length >= 2) {
    return { x: pathToTail[1].x - head.x, y: pathToTail[1].y - head.y };
  }

  // ── Tier 3: Survival — pick direction with most reachable space ───────────
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

  // Snake body (draw tail → head so head is on top)
  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const t = i / Math.max(snake.length - 1, 1); // 0=head, 1=tail
    const g = Math.round(255 - t * 175); // 255→80
    const b = Math.round(136 - t * 85);  // 136→51
    ctx.fillStyle = `rgb(0,${g},${b})`;

    const pad = i === 0 ? 1 : 2;
    ctx.beginPath();
    ctx.roundRect(
      seg.x * CELL_SIZE + pad,
      seg.y * CELL_SIZE + pad,
      CELL_SIZE - pad * 2,
      CELL_SIZE - pad * 2,
      i === 0 ? 4 : 3
    );
    ctx.fill();
  }

  // Snake eyes
  drawEyes(snake[0], snakeDirection);
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
  document.getElementById('score').textContent = score;
  document.getElementById('snake-length').textContent = snake.length;
  document.getElementById('apple-count').textContent = apples.length;
  document.getElementById('total-gifts').textContent = totalGifts;
}

function setUIState(state, info = '') {
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const input = document.getElementById('username-input');

  dot.className = 'dot';

  switch (state) {
    case 'connecting':
      dot.classList.add('dot-yellow');
      text.textContent = `Đang kết nối @${info}…`;
      connectBtn.disabled = true;
      disconnectBtn.disabled = true;
      input.disabled = true;
      break;
    case 'connected':
      dot.classList.add('dot-green');
      text.textContent = `${info}`;
      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
      input.disabled = true;
      break;
    case 'error':
      dot.classList.add('dot-red');
      text.textContent = `Lỗi: ${info}`;
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      input.disabled = false;
      break;
    default:
      dot.classList.add('dot-gray');
      text.textContent = 'Chưa kết nối';
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      input.disabled = false;
  }
}

// ─── Gift Notifications ───────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showGiftNotification(data) {
  const feed = document.getElementById('gift-feed');

  // Xóa card cũ ngay để chỉ hiện 1 card
  while (feed.firstChild) feed.removeChild(feed.firstChild);

  const card = document.createElement('div');
  card.className = 'gift-card';
  card.innerHTML = `
    <span class="gifter-name">${escapeHtml(data.nickname)}</span>
    <span class="apple-count">+${data.appleCount} 🍎</span>
  `;

  feed.appendChild(card);
  requestAnimationFrame(() => card.classList.add('gift-card--visible'));

  setTimeout(() => {
    card.classList.remove('gift-card--visible');
    card.classList.add('gift-card--hiding');
    setTimeout(() => card.remove(), 300);
  }, GIFT_NOTIFICATION_MS);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function addChatMessage(data) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<span class="chat-user">${escapeHtml(data.nickname)}:</span> ${escapeHtml(data.comment)}`;
  container.prepend(msg);
  while (container.children.length > 30) container.removeChild(container.lastChild);
}

// ─── Control Buttons ──────────────────────────────────────────────────────────
document.getElementById('connect-btn').addEventListener('click', async () => {
  const raw = document.getElementById('username-input').value.trim();
  const username = raw.replace(/^@/, '');
  if (!username) {
    alert('Vui lòng nhập username TikTok');
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
      setUIState('error', data.error || 'Không thể kết nối');
    }
  } catch (err) {
    setUIState('error', 'Lỗi mạng: ' + err.message);
  }
});

document.getElementById('disconnect-btn').addEventListener('click', async () => {
  await fetch('/disconnect', { method: 'POST' });
  setUIState('disconnected');
});

document.getElementById('username-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('connect-btn').click();
});

document.addEventListener('keydown', async (e) => {
  if (e.key === '1') {
    await fetch('/test-gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 1 }) });
  } else if (e.key === '2') {
    await fetch('/test-gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 5, giftName: 'TikTok Universe' }) });
  }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
const socket = io();

socket.on('tiktok:status', (data) => {
  if (data.connected) setUIState('connected', data.username);
  else setUIState('disconnected');
});

socket.on('tiktok:connected', (data) => {
  setUIState('connected', data.username);
});

socket.on('tiktok:disconnected', () => {
  setUIState('disconnected');
});

socket.on('tiktok:error', (data) => {
  setUIState('error', data.message);
});

socket.on('tiktok:gift', (data) => {
  appleQueue += data.appleCount;
  totalGifts += data.repeatCount;
  showGiftNotification(data);
  updateUI();
});

socket.on('tiktok:chat', (data) => {
  addChatMessage(data);
});

// ─── Start ────────────────────────────────────────────────────────────────────
lucide.createIcons();
initGame();
