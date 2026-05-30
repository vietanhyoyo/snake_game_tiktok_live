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
  -d '{"count": 3, "giftName": "Rose"}'
```

Trong browser:

- `1`: giả lập 1 gift.
- `2`: giả lập 5 gift.

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
const BASE_TICK_MS = 60;
const MAX_APPLES = Math.floor(GRID_SIZE * GRID_SIZE * 0.4);
const GIFT_NOTIFICATION_MS = 1800;

const RANDOM_MOVE_UNTIL_LENGTH = 50;
const SHORT_MODE_RANDOMNESS = 0.02;
const RANDOM_TOP_CANDIDATES = 2;
const SERPENTINE_WIN_LENGTH = 160;
const SERPENTINE_STRICT_LENGTH = 220;
```

Ý nghĩa:

- `GRID_SIZE`: lưới 16x16, tổng 256 ô.
- `BASE_TICK_MS`: tốc độ game loop, thấp hơn là nhanh hơn.
- `MAX_APPLES`: giới hạn số táo trên sân, hiện là 40% diện tích lưới.
- `RANDOM_MOVE_UNTIL_LENGTH`: dưới ngưỡng này dùng short mode.
- `SHORT_MODE_RANDOMNESS`: xác suất lệch khỏi hướng tốt trong short mode.
- `SERPENTINE_WIN_LENGTH`: bật serpentine win mode.
- `SERPENTINE_STRICT_LENGTH`: từ đây ưu tiên strict serpentine để full map.

## Game State Chính

```js
snake                 // mảng segment, index 0 là đầu
snakeDirection        // vector {x, y}
apples                // táo đang có trên sân, có spawnTime để animate
appleQueue            // táo chờ spawn từ gift events
score                 // +10 mỗi táo
totalGifts            // tổng repeatCount đã nhận
gameLoopInterval      // interval tick
resultCountdownTimer  // timer cho WIN/LOSS overlay
fireworksAnimationId  // requestAnimationFrame id cho pháo bông
useSerpentineWinMode  // đã chuyển sang serpentine win mode hay chưa
```

## HTML Structure Quan Trọng

```text
#app
  #control-panel
    #brand
    #connect-form
      #username-input
      #connect-btn
      #disconnect-btn
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
      #chat-log
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
| `tiktok:gift` | `{uniqueId, nickname, giftName, giftPictureUrl, diamondCount, repeatCount, appleCount, timestamp}` |
| `tiktok:chat` | `{uniqueId, nickname, comment, timestamp}` |

### REST

| Endpoint | Mô tả |
|---|---|
| `POST /connect` | Kết nối TikTok Live theo username. |
| `POST /disconnect` | Ngắt kết nối hiện tại. |
| `GET /status` | Kiểm tra trạng thái kết nối. |
| `POST /test-gift` | Giả lập gift để test local. |

## TikTok Gift Handling

Trong `server.js`, gift chỉ được xử lý khi:

```js
data.repeatEnd
```

Lý do: TikTok emit nhiều event khi streak đang chạy. Chỉ event cuối có `repeatEnd: true` và `repeatCount` chính xác. Bỏ điều kiện này sẽ đếm trùng gift.

Payload gift dùng:

```js
appleCount: data.repeatCount
```

Client nhận `tiktok:gift` và:

```js
appleQueue += data.appleCount;
totalGifts += data.repeatCount;
```

## AI Hiện Tại

Chi tiết đầy đủ nằm ở `AI_ALGORITHM.md`.

Tóm tắt:

1. **Short mode** khi `snake.length < RANDOM_MOVE_UNTIL_LENGTH`
   - Ưu tiên A* tới táo.
   - Nếu không có đường, chọn candidate gần táo.
   - Random rất nhẹ theo `SHORT_MODE_RANDOMNESS`.

2. **Hilbert mode**
   - Dùng Hilbert curve làm cycle an toàn.
   - Cho phép shortcut/A* nếu không phá khoảng an toàn giữa đầu và đuôi.

3. **Serpentine win mode** khi `snake.length >= SERPENTINE_WIN_LENGTH`
   - Transition an toàn sang serpentine nếu thân chưa aligned.
   - Playful serpentine trước `SERPENTINE_STRICT_LENGTH`.
   - Strict serpentine từ `SERPENTINE_STRICT_LENGTH` để full map.

4. **Survival fallback**
   - Nếu các phase chính không có hướng tốt, chọn hướng có flood-fill space lớn nhất.

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

### `isCycleShortcutSafe()`

Kiểm tra shortcut trên một cycle có vượt qua đuôi hoặc phá khoảng an toàn không.

Được reuse cho:

- Hilbert: `isHamiltonianShortcutSafe()`
- Serpentine: `isSerpentineShortcutSafe()`

### `getSerpentineTransitionDirection()`

Khi đã bật serpentine nhưng thân chưa aligned, hàm này mô phỏng từng hướng bằng `simulateMove()` và kiểm tra bằng `isSimulatedMoveSafe()` trước khi chọn hướng.

## Result Overlay

LOSS:

- `handleSoftReset()`
- Dừng game loop.
- Hiện overlay `LOSS`.
- Countdown 5 giây.
- Restart, giữ trạng thái táo hiện có.

WIN:

- Khi `snake.length >= GRID_SIZE * GRID_SIZE`.
- `handleWin()`
- Dừng game loop.
- Hiện overlay `WIN`.
- Countdown 10 giây.
- Bật fireworks canvas.
- Restart.

## UI Và Render

- Canvas chính: `#gameCanvas`.
- Canvas pháo bông: `#fireworksCanvas`.
- Táo có `spawnTime` để render bounce/ripple.
- Gift feed chỉ hiển thị một card mới nhất, nằm dưới canvas.
- Chat prepend message mới, giữ tối đa 30 message.
- Dữ liệu TikTok đưa vào DOM phải qua `escapeHtml()`.

## Những Gì Không Nên Đổi Nhẹ Tay

- `repeatEnd` trong gift handler.
- Modulo wrap trong pathfinding.
- `snakeBody.slice(0, -1)` trong A* và collision/survival.
- `isPathSafe()` mô phỏng toàn path.
- `isCycleShortcutSafe()` cho Hilbert/Serpentine shortcut.
- `getSerpentineTransitionDirection()` trong phase chuyển sang win mode.
- `escapeHtml()` với nickname/comment/gift data.

## Bảo Mật

- `tiktok-live-connector` là thư viện reverse-engineered, không chính thức.
- Chỉ nên chạy local hoặc trong môi trường kiểm soát.
- Không public service ra internet nếu chưa audit dependency và input handling.

