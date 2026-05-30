# TikTok Live Snake Game — AI Context

## Cách chạy

```bash
npm start          # http://localhost:3000
npm run dev        # node --watch (auto-reload)
```

Test không cần live stream — nhấn phím `1` (1 quà) hoặc `2` (5 quà) trên browser, hoặc:
```bash
curl -X POST localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 3, "giftName": "Rose"}'
```

## Kiến trúc tổng quan

```
TikTok Live Webcast
      │ (WebSocket nội bộ TikTok)
      ▼
server.js  ──  tiktok-live-connector
      │ (Socket.io)
      ▼
Browser: public/game.js + Canvas
```

TikTok **không cho kết nối từ browser** (CORS). Server Node.js là cầu nối bắt buộc.  
`tiktok-live-connector` là thư viện reverse-engineered — không cần credentials, chỉ cần `@username` đang live.

## Map file

| File | Vai trò |
|---|---|
| `server.js` | Express + Socket.io + TikTok connector. Toàn bộ logic TikTok ở đây. |
| `public/game.js` | Game engine, AI A*, Socket.io client. Chạy hoàn toàn trên browser. |
| `public/index.html` | Layout HTML. IDs quan trọng: `gameCanvas`, `gift-feed`, `game-column`, `connect-btn`, `username-input`. Lucide icons CDN được load ở đây. |
| `public/style.css` | Dark theme. Layout luôn dọc, `max-width: 480px`. Gift card dùng class toggle `gift-card--visible` / `gift-card--hiding`. |

## Constants trong `game.js`

```js
GRID_SIZE = 16              // lưới 16×16 ô
CELL_SIZE                   // động: min(28, max(18, floor((min(innerWidth,460)-16)/16)))
                            // phone 390px → 23px/ô, canvas ~368px
CANVAS_SIZE = GRID_SIZE * CELL_SIZE
BASE_TICK_MS = 60           // tick mỗi 60ms
MAX_APPLES = floor(16*16*0.4) = 102  // tối đa 40% diện tích lưới
GIFT_NOTIFICATION_MS = 1800 // gift pill hiển thị 1.8s
```

## State chính trong `game.js`

```js
snake          // [{x,y}, ...] — index 0 là đầu
snakeDirection // {x,y} — vector hướng hiện tại
apples         // [{x,y,spawnTime}, ...] — táo trên sân (spawnTime dùng cho animation)
appleQueue     // số táo chờ spawn (từ gift events chưa drain)
score          // +10 mỗi táo ăn
totalGifts     // tổng số quà từ đầu session
```

## HTML structure (quan trọng)

```
#app
  #control-panel          ← brand + input + icon buttons + status
  #main-content
    #game-column          ← canvas column (flex column)
      #game-area          ← position:relative, chứa canvas + death overlay
        #gameCanvas
        #death-overlay
      #gift-feed          ← bên dưới canvas, KHÔNG overlay
    #side-panel
      #score-panel        ← 4 stat cards (Điểm, Độ dài, Táo sân, Tổng quà)
      #chat-log
```

`#gift-feed` đã được chuyển ra **ngoài** `#game-area` để không đè lên canvas.

## Socket.io events

### Server → Client
| Event | Payload |
|---|---|
| `tiktok:status` | `{connected, username}` — emit ngay khi browser kết nối |
| `tiktok:connected` | `{username}` |
| `tiktok:disconnected` | `{reason: 'manual' \| 'stream_ended'}` |
| `tiktok:error` | `{message}` |
| `tiktok:gift` | `{uniqueId, nickname, giftName, giftPictureUrl, diamondCount, repeatCount, appleCount, timestamp}` |
| `tiktok:chat` | `{uniqueId, nickname, comment, timestamp}` |

### Client → Server (REST)
| Endpoint | Body |
|---|---|
| `POST /connect` | `{username}` |
| `POST /disconnect` | — |
| `GET /status` | — |
| `POST /test-gift` | `{count?, giftName?}` |

## Những quyết định thiết kế quan trọng

### `repeatEnd === true` trong gift handler
TikTok gửi events liên tục **trong khi** streak đang diễn ra (rose x1, x2, x3…) với `repeatEnd: false`. Chỉ event cuối cùng có `repeatEnd: true` và `repeatCount` chính xác. Nếu xử lý tất cả events sẽ bị đếm trùng lặp.

### Xuyên tường (wall wrap)
Rắn đi xuyên tường — không chết vì tường. Toàn bộ pathfinding dùng modulo thay vì bounds check:
- `newHead` trong `tick()`: `x = (x + GRID_SIZE) % GRID_SIZE`
- `astar()` neighbors: `(current.x + 1) % GRID_SIZE`, v.v.
- `floodFill()` neighbors: tương tự
- `getSurvivalDirection()`: tính `next` bằng modulo
- `manhattan()`: wrapped distance — `min(dx, GRID_SIZE-dx) + min(dy, GRID_SIZE-dy)`

### Self-collision không gây chết
Khi rắn sắp cắn thân mình (`isBodyCollision`):
- Gọi `getSurvivalDirection` để tìm hướng thoát tốt nhất.
- Nếu có lối thoát: đổi hướng, tiếp tục đi — **không chết**.
- Nếu **mọi hướng đều bị thân chặn**: `handleSoftReset()`.
- Không còn biến `consecutiveCollisions`.

### Loại tail cuối trong A* obstacles
`astar()` dùng `snakeBody.slice(0, -1)` làm obstacles — loại trừ ô đuôi cuối vì tick tiếp theo đuôi sẽ rời đi. Nếu không làm vậy, AI từ chối đi sau đuôi dù thực ra an toàn.

### Lookahead safety (`isPathSafe`)
Sau khi A* tìm được path, **mô phỏng toàn bộ path** để tính vị trí cuối rắn, rồi flood fill từ đó. Nếu `reachable < snake.length` → path bị từ chối. Cách này phát hiện bẫy sau nhiều bước mà check 1 bước không phát hiện được.

### "Chase tail" fallback
Khi path tới táo bị `isPathSafe` từ chối → AI tìm đường tới đuôi. Đuôi luôn di chuyển ra trước khi AI đến nơi → path này không bao giờ bị block thực sự — cách mở rộng không gian an toàn nhất khi bị kẹp.

### Apple animation
Mỗi apple có `spawnTime: Date.now()` khi spawn. Trong `render()`:
- **Scale bounce**: `easeOutBack(age / 350ms)` — scale từ 0 lên hơi quá 1 rồi về 1.
- **Ripple rings**: 3 vòng sáng đỏ lan toả ra ngoài, stagger 130ms mỗi vòng, tắt sau 600ms.

### Apple queue
`appleQueue += appleCount` khi gift đến. Mỗi tick drain tối đa `MAX_APPLES - apples.length` táo từ queue. Tạo hiệu ứng táo xuất hiện dần.

### Gift notification
Pill nhỏ (`border-radius: 20px`) bên dưới canvas. Chỉ hiển thị **1 card** tại một thời điểm (card mới xóa card cũ ngay). Chỉ hiện tên người tặng + số táo (`+N 🍎`), không có ảnh quà.

### UI — không có Dev controls trong giao diện
Các nút test đã bị xóa khỏi UI. Thay bằng keyboard shortcuts: `1` = test 1 quà, `2` = test 5 quà.

### Icon buttons (Lucide)
Nút Kết nối dùng icon `plug`, nút Ngắt dùng icon `unplug` từ `https://unpkg.com/lucide@latest`. `lucide.createIcons()` được gọi ở cuối `game.js`.

## Những gì KHÔNG nên thay đổi mà không hiểu rõ

- Logic `repeatEnd` trong `attachTikTokListeners()` — thay đổi sẽ gây đếm quà trùng
- `snakeBody.slice(0, -1)` trong `astar()` — bỏ sẽ làm AI từ chối đường đi hợp lệ
- `isPathSafe` mô phỏng **toàn path** chứ không phải 1 bước — đây là chủ ý
- "Chase tail" fallback trong `getAIDirection` — tầng phòng thủ thứ 2, không được bỏ
- `handleSoftReset()` giữ `apples` nguyên — bỏ táo đi sẽ mất trạng thái game khi reset
- `escapeHtml()` bao quanh mọi dữ liệu từ TikTok — bảo vệ XSS, không được bỏ
- Modulo wrap trong tất cả pathfinding — phải nhất quán, đổi 1 chỗ sẽ làm AI sai

## Bảo mật

`protobufjs` (dep của `tiktok-live-connector`) có CVE đã biết, chưa có bản vá. Chấp nhận được vì đây là tool nội bộ chạy local. **Không deploy ra server công cộng.**

Tất cả dữ liệu từ TikTok (nickname, giftName, comment) được `escapeHtml()` trước khi đưa vào DOM.

## Gợi ý mở rộng

- **Nhiều loại vật phẩm:** Thêm field `giftType` vào gift payload, render apple/star/bomb khác nhau tùy loại quà
- **Điều chỉnh tốc độ:** Giảm `BASE_TICK_MS` khi `appleQueue > 10` để tạo urgency
- **Leaderboard:** Lưu top scores trong server memory, expose qua `GET /leaderboard`
- **Nhiều rắn:** Mỗi màu rắn đại diện một team viewer
- **Phản hồi chat:** Parse `tiktok:chat` để trigger action (comment "faster" → tăng tốc)
