// ─── Constants ───────────────────────────────────────────────────────────────
const GRID_SIZE = 30;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 600
const BASE_TICK_MS = 60;
const MAX_APPLES = 20;
const GIFT_NOTIFICATION_MS = 4000;

// ─── Game State ───────────────────────────────────────────────────────────────
let snake = [];
let snakeDirection = { x: 1, y: 0 };
let apples = [];
let appleQueue = 0;
let score = 0;
let totalGifts = 0;
let consecutiveCollisions = 0;
let gameLoopInterval = null;

// ─── Canvas ───────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ─── Init ─────────────────────────────────────────────────────────────────────
function initGame() {
  snake = [
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 }
  ];
  snakeDirection = { x: 1, y: 0 };
  apples = [];
  appleQueue = 0;
  score = 0;
  consecutiveCollisions = 0;
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

  // Compute proposed next head
  let newHead = {
    x: snake[0].x + snakeDirection.x,
    y: snake[0].y + snakeDirection.y
  };

  // Wall collision → immediate reset (no grace period for walls)
  if (isOutOfBounds(newHead)) {
    handleSoftReset();
    return;
  }

  // Self-collision grace mechanic
  if (isBodyCollision(newHead)) {
    consecutiveCollisions++;
    if (consecutiveCollisions >= 2) {
      // Second consecutive self-collision → reset
      handleSoftReset();
      return;
    }
    // First self-collision: override with best escape direction
    const escapeDir = getSurvivalDirection(snake[0], snake, snakeDirection);
    const escapeHead = {
      x: snake[0].x + escapeDir.x,
      y: snake[0].y + escapeDir.y
    };
    if (isOutOfBounds(escapeHead) || isBodyCollision(escapeHead)) {
      // Truly cornered, no escape → reset immediately
      handleSoftReset();
      return;
    }
    snakeDirection = escapeDir;
    newHead = escapeHead;
  } else {
    consecutiveCollisions = 0;
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
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 }
  ];
  snakeDirection = { x: 1, y: 0 };
  consecutiveCollisions = 0;
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
  apples.push(empty[Math.floor(Math.random() * empty.length)]);
  return true;
}

// ─── A* Pathfinding ───────────────────────────────────────────────────────────
function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ].filter(n => n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE);

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
    if (count >= 200) break; // early exit — enough space confirmed

    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 }
    ].filter(n => n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE);
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

// Simulate snake following a path (without apple eating) and check space at the end
function isPathSafe(path, snakeBody) {
  let simSnake = snakeBody.map(s => ({ ...s }));
  for (let i = 1; i < path.length; i++) {
    simSnake.unshift(path[i]);
    simSnake.pop();
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
    const next = { x: head.x + dir.x, y: head.y + dir.y };
    if (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE) continue;
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
  if (apples.length === 0) return snakeDirection;

  const head = snake[0];

  // 1. Find nearest apple and try A* path with lookahead safety check
  const target = apples.reduce((nearest, apple) =>
    manhattan(apple, head) < manhattan(nearest, head) ? apple : nearest
  );

  const pathToApple = astar(head, target, snake);
  if (pathToApple && pathToApple.length >= 2 && isPathSafe(pathToApple, snake)) {
    updateAIInfo(`A* → (${target.x},${target.y})`);
    return { x: pathToApple[1].x - head.x, y: pathToApple[1].y - head.y };
  }

  // 2. Unsafe path to apple — chase tail to buy time and open up space
  const tail = snake[snake.length - 1];
  const pathToTail = astar(head, tail, snake);
  if (pathToTail && pathToTail.length >= 2) {
    updateAIInfo('Chase tail');
    return { x: pathToTail[1].x - head.x, y: pathToTail[1].y - head.y };
  }

  // 3. Last resort: pick direction with most open space
  updateAIInfo('Survival');
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
  apples.forEach(apple => {
    const px = apple.x * CELL_SIZE + CELL_SIZE / 2;
    const py = apple.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE / 2 - 2;

    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(px - r * 0.3, py - r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#228822';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py - r);
    ctx.lineTo(px + 3, py - r - 4);
    ctx.stroke();
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
  document.getElementById('apple-queue').textContent = appleQueue;
  document.getElementById('total-gifts').textContent = totalGifts;
}

function updateAIInfo(text) {
  document.getElementById('ai-info').textContent = text;
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
      text.textContent = `🔴 LIVE @${info}`;
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

  const fallbackImg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' rx='6' fill='%232a2a3a'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='20'%3E🎁%3C/text%3E%3C/svg%3E`;

  const card = document.createElement('div');
  card.className = 'gift-card';
  card.innerHTML = `
    <img src="${escapeHtml(data.giftPictureUrl || fallbackImg)}"
         alt="${escapeHtml(data.giftName)}"
         onerror="this.src='${fallbackImg}'" />
    <div class="gift-info">
      <span class="gifter-name">${escapeHtml(data.nickname)}</span>
      <span class="gift-name">${escapeHtml(data.giftName)}${data.repeatCount > 1 ? ' ×' + data.repeatCount : ''}</span>
      <span class="apple-count">+${data.appleCount} 🍎</span>
    </div>
  `;

  feed.prepend(card);
  requestAnimationFrame(() => card.classList.add('gift-card--visible'));

  // Cap feed at 5 cards
  while (feed.children.length > 5) feed.removeChild(feed.lastChild);

  setTimeout(() => {
    card.classList.remove('gift-card--visible');
    card.classList.add('gift-card--hiding');
    setTimeout(() => card.remove(), 400);
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

document.getElementById('test-gift-btn').addEventListener('click', async () => {
  await fetch('/test-gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 1 }) });
});

document.getElementById('test-multi-btn').addEventListener('click', async () => {
  await fetch('/test-gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 5, giftName: 'TikTok Universe' }) });
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
initGame();
