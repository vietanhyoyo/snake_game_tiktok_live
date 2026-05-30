# TikTok Live Snake Game

Game rắn săn mồi chạy trên browser, kết nối TikTok Live qua Node.js. Mỗi gift từ viewer tạo thêm táo trên sân; rắn được điều khiển hoàn toàn bởi AI.

## Yêu Cầu

- Node.js 18+
- Một TikTok account đang livestream nếu muốn dùng dữ liệu live thật

## Cài Đặt Và Chạy

```bash
npm install
npm start
```

Mặc định server chạy tại:

```text
http://localhost:3000
```

Chế độ dev:

```bash
npm run dev
```

## Cách Sử Dụng

1. Mở `http://localhost:3000`.
2. Nhập TikTok username đang live, có thể nhập `@username` hoặc `username`.
3. Nhấn nút plug để kết nối.
4. Khi viewer tặng quà, game nhận gift và thêm táo vào sân.
5. Nhấn nút unplug để ngắt kết nối.

## Test Không Cần Livestream

Trong browser:

- Nhấn phím `1` để giả lập 1 gift.
- Nhấn phím `2` để giả lập 5 gift.

Hoặc dùng REST API:

```bash
curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'

curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "giftName": "TikTok Universe"}'
```

## Kiến Trúc

```text
TikTok Live Webcast
        |
        v
server.js
  - Express static server
  - Socket.io relay
  - tiktok-live-connector
        |
        v
Browser
  - public/index.html
  - public/style.css
  - public/game.js
```

TikTok Live không được kết nối trực tiếp từ browser. `server.js` là cầu nối giữa TikTok Webcast và client browser.

## Cấu Trúc Thư Mục

```text
snake_game_tiktok_live/
├── package.json
├── package-lock.json
├── server.js
├── README.md
├── CLAUDE.md
├── AI_ALGORITHM.md
└── public/
    ├── index.html
    ├── style.css
    └── game.js
```

## Tính Năng Chính

| Tính năng | Mô tả |
|---|---|
| TikTok gift -> táo | Gift hoàn tất streak sẽ tạo số táo theo `repeatCount`. |
| Apple queue | Gift nhiều táo được đưa vào queue và spawn dần theo tick. |
| AI nhiều phase | Short mode, Hilbert mode, Serpentine playful, Serpentine strict. |
| Xuyên tường | Rắn wrap qua biên lưới thay vì chết khi chạm tường. |
| Safety checks | A*, flood-fill, path simulation, tail reachability và cycle shortcut safety. |
| Soft loss | Khi bị bít hoàn toàn, hiện `LOSS`, đếm ngược 5 giây rồi restart. |
| Win state | Khi rắn đạt đủ 256 ô, hiện `WIN`, đếm ngược 10 giây và bắn pháo bông. |
| Apple animation | Táo có hiệu ứng scale bounce và ripple khi xuất hiện. |
| Gift notification | Hiển thị người tặng và số táo dưới canvas. |
| Chat log | Chat TikTok hiển thị realtime trong side panel. |

## AI Hiện Tại

AI nằm trong `public/game.js`. Tài liệu chi tiết ở [AI_ALGORITHM.md](./AI_ALGORITHM.md).

Các hằng số tuning hiện tại:

```js
const BASE_TICK_MS = 60;
const RANDOM_MOVE_UNTIL_LENGTH = 50;
const SHORT_MODE_RANDOMNESS = 0.02;
const RANDOM_TOP_CANDIDATES = 2;
const SERPENTINE_WIN_LENGTH = 160;
const SERPENTINE_STRICT_LENGTH = 220;
```

Luồng quyết định chính:

```text
length < RANDOM_MOVE_UNTIL_LENGTH
  -> Short mode: ưu tiên A* tới táo, random rất nhẹ

length < SERPENTINE_WIN_LENGTH
  -> Hilbert mode: shortcut/A* an toàn trên Hilbert curve

length >= SERPENTINE_WIN_LENGTH
  -> Serpentine win mode
     -> transition an toàn nếu chưa aligned
     -> playful serpentine trước length 220
     -> strict serpentine từ length 220 để win
```

## REST API

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/connect` | Kết nối TikTok Live. Body: `{"username": "abc"}` |
| `POST` | `/disconnect` | Ngắt kết nối TikTok Live hiện tại. |
| `GET` | `/status` | Trả về trạng thái kết nối hiện tại. |
| `POST` | `/test-gift` | Giả lập gift. Body: `{"count": N, "giftName": "..."}` |

## Socket.io Events

Server emit các event sau sang browser:

| Event | Mô tả |
|---|---|
| `tiktok:status` | Sync trạng thái khi browser mới kết nối. |
| `tiktok:connected` | Đã kết nối livestream. |
| `tiktok:disconnected` | Đã ngắt kết nối hoặc stream kết thúc. |
| `tiktok:error` | Lỗi kết nối/live connector. |
| `tiktok:gift` | Gift hoàn tất streak, dùng để cộng táo. |
| `tiktok:chat` | Tin nhắn chat realtime. |

## Bảo Mật Và Giới Hạn

- `tiktok-live-connector` là thư viện reverse-engineered, không chính thức.
- Dự án phù hợp chạy local hoặc môi trường kiểm soát. Không nên public ra internet nếu chưa audit bảo mật.
- Dữ liệu TikTok đưa vào DOM được escape bằng `escapeHtml()`.
- Gift chỉ được xử lý khi `repeatEnd === true` để tránh đếm trùng streak.

