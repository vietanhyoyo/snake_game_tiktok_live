# TikTok Live Snake Game - Agent Context

Tài liệu này là context kỹ thuật cho AI/coding agent khi làm việc trong repo.

## Chạy Project

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # node --watch server.js
```

Test gift không cần livestream:

```bash
curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"giftType": "rose", "giftName": "Rose", "count": 1, "appleCount": 1}'
```

Trong browser:

- `1`: giả lập Rose (+1 táo).
- `2`: giả lập Finger Heart (+15 táo).
- `3`: giả lập Lucky Pig (thêm hoa 5 màu; rắn ăn hoa thì đổi màu).
- `4`: giả lập TikTok gift (+5 bom).
- `q`: thêm hoa đổi màu thủ công.

## Kiến Trúc

```text
TikTok Live Webcast
      |
      v
server.js
  - Express
  - Socket.io
  - tiktok-live-connector
      |
      v
public/game.js
  - Canvas game loop
  - Snake AI
  - Socket.io client
```

TikTok Live không kết nối trực tiếp từ browser do CORS. `server.js` là backend relay bắt buộc.

## File Map

| File | Vai trò |
|---|---|
| `server.js` | Express static server, REST API, Socket.io relay, TikTok connector. |
| `public/index.html` | Layout chính, canvas game, result overlay, fireworks canvas. |
| `public/style.css` | Dark UI, layout mobile-first, result overlay, win/fireworks styles. |
| `public/game.js` | Game state, render, AI, socket client, gift/chat UI. |
| `AI_ALGORITHM.md` | Tài liệu chi tiết về AI nhiều phase. |
| `README.md` | Tài liệu user-facing. |

## Constants Quan Trọng Trong `public/game.js`

```js
const GRID_SIZE = 16;
const CELL_SIZE = Math.min(28, Math.max(18, Math.floor((Math.min(window.innerWidth, 460) - 16) / GRID_SIZE)));
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const BASE_TICK_MS = 60;
const MAX_APPLES = Math.floor(GRID_SIZE * GRID_SIZE * 0.4);
const MAX_BOMBS = 50;
const MIN_SNAKE_LENGTH = 3;
const EXPLOSION_MS = 520;
const GIFT_NOTIFICATION_MS = 1800;

const RANDOM_MOVE_UNTIL_LENGTH = 50;
const SHORT_MODE_RANDOMNESS = 0.02;
const RANDOM_TOP_CANDIDATES = 2;
const APPLE_CHASE_LENGTH = 70;
const SERPENTINE_PREP_LENGTH = 150;
const SERPENTINE_WIN_LENGTH = 180;
const SERPENTINE_STRICT_LENGTH = 220;
const SERPENTINE_LOOSE_GAP_CHANCE = 0.18;
const SERPENTINE_LOOSE_GAP_END_LENGTH = 200;
const SERPENTINE_LOOSE_GAP_RECOVERY_TICKS = 10;
const SERPENTINE_BODY_ADJACENCY_WEIGHT = 20;
const SERPENTINE_BODY_PRESSURE_WEIGHT = 6;
```

Ý nghĩa:

- `GRID_SIZE`: lưới 16x16, tổng 256 ô.
- `CELL_SIZE`: responsive, tự tính theo chiều rộng màn hình (tối đa 460px), kẹp trong [18, 28].
- `CANVAS_SIZE`: tổng kích thước canvas = `GRID_SIZE * CELL_SIZE`.
- `BASE_TICK_MS`: tốc độ game loop, thấp hơn là nhanh hơn.
- `MAX_APPLES`: giới hạn số táo trên sân, hiện là 40% diện tích lưới.
- `MAX_BOMBS`: giới hạn số bom trên sân.
- `MIN_SNAKE_LENGTH`: chiều dài tối thiểu khi ăn bom hoặc đom đóm.
- `EXPLOSION_MS`: thời gian hiệu ứng nổ bom (ms).
- `APPLE_CHASE_LENGTH`: từ độ dài này, AI bắt đầu tìm đường A* bám táo giữa game.
- `SERPENTINE_PREP_LENGTH`: bắt đầu xếp thân theo serpentine từ đây.
- `SERPENTINE_WIN_LENGTH`: bật serpentine win mode.
- `SERPENTINE_STRICT_LENGTH`: từ đây ưu tiên strict serpentine để full map.
- `SERPENTINE_LOOSE_GAP_CHANCE`: xác suất mở khe nhỏ khi đang trong prep phase.
- `SERPENTINE_LOOSE_GAP_END_LENGTH`: điểm taper xác suất loose-gap về 0.
- `SERPENTINE_LOOSE_GAP_RECOVERY_TICKS`: số tick strict sau mỗi lần mở khe.
- `SERPENTINE_BODY_ADJACENCY_WEIGHT` / `SERPENTINE_BODY_PRESSURE_WEIGHT`: trọng số phạt body trong open-gap scoring.

## Gift Types

```js
const TEST_GIFTS = {
  rose:   { appleCount: 1,  action: undefined },  // +1 táo
  heart:  { appleCount: 15, action: undefined },  // +15 táo
  pig:    { appleCount: 0,  action: 'color'   },  // tạo hoa đổi màu
  tiktok: { appleCount: 0,  action: 'bomb', bombCount: 5 }  // +5 bom
};
```

`getGiftEffect(data)` normalize tên gift (diacritic-free, lowercase) và trả về entry tương ứng. Nếu không khớp, fallback về `appleCount` từ payload.

## Color Themes

8 theme màu trong `COLOR_THEMES`. Mỗi theme có `primary`, `strong`, `soft`, `rgb`, `tailRgb`. AI áp dụng theme lên CSS variable và render rắn gradient từ đầu (`rgb`) đến đuôi (`tailRgb`).

- `spawnColorFlower()`: thêm 1 bông hoa 5 cánh 5 màu trên map.
- `cycleColorTheme()`: tăng `colorThemeIndex`, gọi `applyColorTheme()` khi rắn ăn hoa.
- Trigger thêm hoa: gift Lucky Pig theo `repeatCount` hoặc phím `q`.

## Game State Chính

```js
snake                     // mảng segment, index 0 là đầu
snakeDirection            // vector {x, y}
apples                    // táo đang có trên sân, có spawnTime để animate
bombs                     // bom đang có trên sân, có spawnTime để animate
explosions                // hiệu ứng nổ đang chạy
appleQueue                // táo chờ spawn từ gift events
bombQueue                 // bom chờ spawn từ gift events
score                     // +10 mỗi táo ăn
totalGifts                // tổng repeatCount đã nhận
winCount                  // số ván thắng
lossCount                 // số ván thua
gameLoopInterval          // interval tick
resultCountdownTimer      // timer cho WIN/LOSS overlay
fireworksAnimationId      // requestAnimationFrame id cho pháo bông
useSerpentineWinMode      // đã chuyển sang serpentine win mode hay chưa
colorThemeIndex           // index theme màu hiện tại
currentTheme              // theme object đang dùng
serpentineLooseGapCooldown // số tick strict còn lại sau khi mở khe
```

## HTML Structure Quan Trọng

```text
#app
  #control-panel
    #brand
    #connect-form
      #username-input
      #connect-btn (icon: plug)
      #disconnect-btn (icon: unplug)
    #connection-status
  #main-content
    #game-column
      #game-area
        #gameCanvas
        #death-overlay
          #fireworksCanvas
          #death-content
            #death-title
            #death-countdown
            #death-subtitle
      #gift-feed
    #side-panel
      #score-panel
        .stat-card > #win-count / .stat-label "Wins"
        .stat-card > #loss-count / .stat-label "Losses"
        .stat-card > #snake-length / .stat-label "Snake Length"
      #chat-log
        .chat-label "Chat TikTok"
        #chat-messages
```

`#death-overlay` dùng chung cho cả LOSS và WIN. Khi win, overlay có class `win`, bật `#fireworksCanvas`.

## Socket.io Events

### Server -> Client

| Event | Payload |
|---|---|
| `tiktok:status` | `{connected, username}` |
| `tiktok:connected` | `{username}` |
| `tiktok:disconnected` | `{reason}` |
| `tiktok:error` | `{message}` |
| `tiktok:gift` | `{uniqueId, nickname, giftName, giftType, giftPictureUrl, diamondCount, repeatCount, appleCount, bombCount, timestamp}` |
| `tiktok:chat` | `{uniqueId, nickname, comment, timestamp}` |

### REST

| Endpoint | Mô tả |
|---|---|
| `POST /connect` | Kết nối TikTok Live theo username. |
| `POST /disconnect` | Ngắt kết nối hiện tại. |
| `GET /status` | Kiểm tra trạng thái kết nối. |
| `POST /test-gift` | Giả lập gift để test local. |

## TikTok Gift Handling

Trong `server.js`, gift được xử lý khi:

```js
data.repeatEnd || data.giftType !== 1
```

- `giftType === 1`: gift có streak (bấm giữ). Chỉ xử lý khi `repeatEnd` để lấy `repeatCount` chính xác.
- `giftType !== 1`: gift không streak (tap đơn). Xử lý ngay vì không có streak event.

Kết nối dùng `enableExtendedGiftInfo: true` để nhận ảnh gift đầy đủ. `availableGifts` được lưu sau connect để resolve ảnh khi test local.

Client nhận `tiktok:gift` và gọi `applyGiftEffect(data)`:

```js
if (effect.action === 'color') spawnColorFlower();
else {
  if (effect.action === 'bomb' || bombCount > 0) bombQueue += bombCount;
  if (appleCount > 0) appleQueue += appleCount;
}

totalGifts += repeatCount;
```

## Bomb Mechanics

- Khi rắn đi vào ô có bom: `createExplosion(bomb)`, xóa bom, rắn mất 2 segment (không xuống dưới `MIN_SNAKE_LENGTH = 3`).
- Bom không gây chết. Chỉ cắt ngắn rắn.
- Hiệu ứng nổ chạy `EXPLOSION_MS = 520ms`, render particle trong `drawExplosions()`.
- `spawnItem()` dùng chung cho táo và bom, tránh đặt trùng vị trí.

## Firefly Mechanics

- Khi rắn đi vào ô có đom đóm: xóa đom đóm, tạo flash, và giảm 1 độ dài.
- Đom đóm không làm rắn ngắn dưới `MIN_SNAKE_LENGTH = 3`.
- AI mô phỏng đom đóm bằng target `shrink: 1` để path safety dùng đúng độ dài sau khi ăn.

## AI Hiện Tại

Chi tiết đầy đủ nằm ở `AI_ALGORITHM.md`.

### Tóm tắt luồng `getAIDirection()`:

1. **Serpentine prep** (`SERPENTINE_PREP_LENGTH <= length < SERPENTINE_WIN_LENGTH`)
   - Giảm `serpentineLooseGapCooldown` nếu còn.
   - Random mở khe nhỏ (`getSerpentineTransitionDirection(false, { preferOpenGap: true })`), sau đó cooldown strict.
   - Nếu chưa aligned, strict transition.

2. **Serpentine win mode** (`length >= SERPENTINE_WIN_LENGTH`)
   - Gọi `getSerpentineWinDirection()`.
   - Nếu chưa aligned và non-strict: thử `getSafeAppleChaseDirection()` rồi transition.
   - Nếu đã aligned và non-strict: A*/shortcut serpentine để bám táo.
   - Nếu strict: chỉ shortcut/cycle serpentine.

3. **Short mode** (`length < RANDOM_MOVE_UNTIL_LENGTH`)
   - `getRandomizedShortSnakeDirection()`.
   - A* tới táo gần nhất.
   - Fallback candidate theo Hilbert.
   - Random nhẹ `SHORT_MODE_RANDOMNESS = 0.02`.

4. **Apple chase midgame** (`APPLE_CHASE_LENGTH <= length < SERPENTINE_STRICT_LENGTH`)
   - `getSafeAppleChaseDirection()`: A* đầy đủ qua `isPathSafe()`.

5. **Hilbert mode** (sau các tier trên)
   - `getHamiltonianShortcutDirection()`.
   - `getAStarDirectionForCycle(isHamiltonianShortcutSafe)`.
   - `getHamiltonianDirection()` (cycle thuần).

6. **Survival fallback**
   - `getSurvivalDirection()`: flood-fill, chọn hướng còn nhiều không gian nhất.

## Safety Logic Quan Trọng

### Wall Wrap

Rắn xuyên tường. Mọi neighbor/pathfinding đều dùng modulo:

```js
(x + GRID_SIZE) % GRID_SIZE
```

Không đổi một chỗ riêng lẻ nếu chưa cập nhật toàn bộ AI.

### A* Obstacles

`astar()` loại ô đuôi cuối khỏi obstacle:

```js
snakeBody.slice(0, -1)
```

Đuôi có thể rời đi tick sau, nên ô đó thường được phép đi vào.

### `isPathSafe()`

Mô phỏng toàn bộ path:

- Check va chạm từng bước.
- Mô phỏng growth khi ăn táo.
- Kiểm tra còn đường về đuôi.
- Flood-fill để đảm bảo còn đủ không gian.

### `isSimulatedMoveSafe()`

Mô phỏng một nước đi rồi kiểm tra:

- Có đường A* về đuôi.
- Flood-fill đủ lớn so với chiều dài rắn.

### `isLoosePrepMoveSafe()`

Chỉ dùng cho prep loose-gap. Không bắt buộc path-to-tail, chỉ flood-fill đủ tối thiểu.

### `isCycleShortcutSafe()`

Kiểm tra shortcut trên một cycle có vượt qua đuôi hoặc phá khoảng an toàn không.

Được reuse cho:

- Hilbert: `isHamiltonianShortcutSafe()`
- Serpentine: `isSerpentineShortcutSafe()`

### `getSerpentineTransitionDirection()`

Khi đã bật serpentine nhưng thân chưa aligned, hàm này mô phỏng từng hướng bằng `simulateMove()` và kiểm tra bằng `isSimulatedMoveSafe()` (hoặc `isLoosePrepMoveSafe()` khi `preferOpenGap`) trước khi chọn hướng.

## Result Overlay

LOSS:

- `handleSoftReset()`.
- Dừng game loop.
- `lossCount++`.
- Hiện overlay `LOSS`.
- Countdown 5 giây.
- Restart, giữ trạng thái táo/bom hiện có.

WIN:

- Khi `snake.length >= GRID_SIZE * GRID_SIZE`.
- `handleWin()`.
- Dừng game loop.
- `winCount++`.
- Hiện overlay `WIN`.
- Countdown 10 giây.
- Bật fireworks canvas.
- Restart.

## UI Và Render

- Canvas chính: `#gameCanvas`. Kích thước responsive theo `CELL_SIZE`.
- Canvas pháo bông: `#fireworksCanvas`.
- Táo có `spawnTime` để render bounce/ripple.
- Bom có `spawnTime` để render scale-in và pulse animation.
- Hiệu ứng nổ: `drawExplosions()` với shockwave và particle.
- Rắn render gradient đầu → đuôi theo `currentTheme.rgb` → `currentTheme.tailRgb`.
- Gift feed chỉ hiển thị một card mới nhất, nằm dưới canvas.
- Chat prepend message mới, giữ tối đa 30 message.
- Dữ liệu TikTok đưa vào DOM phải qua `escapeHtml()` / `escapeAttr()`.
- Score panel hiển thị: Wins (`#win-count`), Losses (`#loss-count`), Snake Length (`#snake-length`).
- Icon connect/disconnect dùng Lucide (`data-lucide="plug"` / `"unplug"`).

## Những Gì Không Nên Đổi Nhẹ Tay

- `data.repeatEnd || data.giftType !== 1` trong gift handler (server.js).
- Modulo wrap trong pathfinding.
- `snakeBody.slice(0, -1)` trong A* và collision/survival.
- `isPathSafe()` mô phỏng toàn path.
- `isSimulatedMoveSafe()` / `isLoosePrepMoveSafe()` cho các nước đi một bước.
- `isCycleShortcutSafe()` cho Hilbert/Serpentine shortcut.
- `getSerpentineTransitionDirection()` trong phase chuyển sang win mode.
- `escapeHtml()` / `escapeAttr()` với nickname/comment/gift data.
- `MIN_SNAKE_LENGTH` trong bomb handling (tránh bug rắn về 0 segment).

## Bảo Mật

- `tiktok-live-connector` là thư viện reverse-engineered, không chính thức.
- Chỉ nên chạy local hoặc trong môi trường kiểm soát.
- Không public service ra internet nếu chưa audit dependency và input handling.
