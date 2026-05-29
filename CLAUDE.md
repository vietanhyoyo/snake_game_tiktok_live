# TikTok Live Snake Game — AI Context

## Cách chạy

```bash
npm start          # http://localhost:3000
npm run dev        # node --watch (auto-reload)
```

Test không cần live stream:
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

TikTok **không cho kết nối từ browser** (CORS). Server Node.js là cầu nối bắt buộc. `tiktok-live-connector` là thư viện reverse-engineered — không cần credentials, chỉ cần `@username` đang live.

## Map file

| File | Vai trò |
|---|---|
| `server.js` | Express + Socket.io + TikTok connector. Toàn bộ logic TikTok ở đây. |
| `public/game.js` | Game engine, AI A*, Socket.io client. Chạy hoàn toàn trên browser. |
| `public/index.html` | Layout HTML. ID quan trọng: `gameCanvas`, `gift-feed`, `connect-btn`, `username-input`. |
| `public/style.css` | Dark theme. Gift card animation dùng CSS class toggle (`gift-card--visible`, `gift-card--hiding`). |

## State chính trong `game.js`

```js
snake          // [{x,y}, ...] — index 0 là đầu
snakeDirection // {x,y} — vector hướng hiện tại
apples         // [{x,y}, ...] — táo đang trên bàn (tối đa MAX_APPLES=20)
appleQueue     // số táo chờ xuất hiện (từ gift events chưa drain hết)
score          // +10 mỗi táo ăn
totalGifts     // tổng số quà nhận từ đầu session
```

Grid: `GRID_SIZE=30`, mỗi ô `CELL_SIZE=20px` → canvas `600×600px`. Tick mỗi `120ms`.

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

### Client → Server (REST, không dùng socket)
| Endpoint | Body |
|---|---|
| `POST /connect` | `{username}` |
| `POST /disconnect` | — |
| `GET /status` | — |
| `POST /test-gift` | `{count?, giftName?}` |

## Những quyết định thiết kế quan trọng

### `repeatEnd === true` trong gift handler
TikTok gửi events liên tục **trong khi** streak đang diễn ra (rose x1, x2, x3…) với `repeatEnd: false`. Chỉ event cuối cùng có `repeatEnd: true` và `repeatCount` chính xác. Nếu xử lý tất cả events sẽ bị đếm trùng lặp.

### Tường cứng (bounded grid)
Rắn va tường → soft reset. Tất cả các hàm pathfinding (`astar`, `floodFill`, `getSurvivalDirection`) dùng bounds check thay vì `% GRID_SIZE`. `manhattan()` là khoảng cách thẳng, không wrap.

### Grace period cho self-collision
Khi rắn chuẩn bị cắn thân mình (`isBodyCollision`):
- **Lần 1**: `consecutiveCollisions++`, gọi `getSurvivalDirection` để tìm hướng thoát, tiếp tục đi. Reset về 0 nếu tick tiếp không đụng.
- **Lần 2 liên tiếp**: `handleSoftReset()`.
- **Không có lối thoát** (escape cũng bị chặn): reset ngay lập tức.

Tường cứng (`isOutOfBounds`) **không có grace period** — reset ngay. Biến `consecutiveCollisions` được reset trong `initGame()` và `handleSoftReset()`.

### Loại tail cuối trong A* obstacles
`astar()` loại trừ `snakeBody[last]` khỏi obstacles vì tick tiếp theo đuôi sẽ rời đi. Nếu không làm vậy, AI từ chối đi sau đuôi dù thực ra an toàn.

### Lookahead safety (`isPathSafe`)
Sau khi A* tìm được path, **mô phỏng toàn bộ path** (không ăn táo) để tính vị trí cuối của rắn, rồi flood fill từ đó. Nếu `reachable < snake.length` → path nguy hiểm, bị từ chối. Khác với check 1 bước, cách này phát hiện path dẫn vào bẫy sau nhiều bước.

### "Chase tail" fallback
Khi path tới táo bị `isPathSafe` từ chối → AI tìm đường tới đuôi rắn của chính mình. Đuôi luôn di chuyển ra trước khi AI đến nơi, nên path này không bao giờ bị block thực sự — đây là cách mở rộng không gian an toàn nhất khi bị kẹp.

### Apple queue
Khi gift đến, `appleQueue += appleCount`. Mỗi tick drain tối đa `MAX_APPLES - apples.length` táo từ queue. Tạo hiệu ứng táo xuất hiện dần, không nhảy cóc.

## Những gì KHÔNG nên thay đổi mà không hiểu rõ

- Logic `repeatEnd` trong `attachTikTokListeners()` — thay đổi sẽ gây đếm quà trùng
- `snakeBody.slice(0, -1)` trong `astar()` — bỏ sẽ làm AI từ chối đường đi hợp lệ
- `isPathSafe` mô phỏng **toàn path** chứ không phải 1 bước — đây là chủ ý, đổi về 1 bước sẽ tái tạo bug cắn đuôi
- "Chase tail" fallback trong `getAIDirection` — đây là tầng phòng thủ thứ 2, không được bỏ
- `handleSoftReset()` giữ táo nguyên — bỏ táo đi sẽ làm mất trạng thái game khi rắn chết
- `escapeHtml()` bao quanh mọi dữ liệu từ TikTok — đây là bảo vệ XSS, không được bỏ

## Bảo mật

`protobufjs` (dep của `tiktok-live-connector`) có CVE đã biết, chưa có bản vá. Chấp nhận được vì đây là tool nội bộ chạy local. **Không deploy ra server công cộng** mà không đánh giá lại rủi ro này.

Tất cả dữ liệu từ TikTok (nickname, giftName, comment) được `escapeHtml()` trước khi đưa vào DOM.

## Gợi ý mở rộng

- **Nhiều loại vật phẩm:** Thêm field `giftType` vào gift payload, render apple/star/bomb khác nhau tùy loại quà
- **Điều chỉnh tốc độ:** Tăng tốc rắn (`BASE_TICK_MS` thấp hơn) khi `appleQueue > 10` để tạo urgency
- **Leaderboard:** Lưu top scores trong server memory, expose qua `GET /leaderboard`
- **Nhiều rắn:** Mỗi màu rắn đại diện một team viewer, quà từ team nào thêm táo cho rắn đó
- **Phản hồi chat:** Xử lý `tiktok:chat` trên server để trigger action (ví dụ comment "faster" → tăng tốc)
