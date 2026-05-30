# TikTok Live Snake Game 🐍

Trò chơi Rắn săn mồi kết nối với TikTok Live — mỗi khi người xem tặng quà, táo xuất hiện trên bàn chơi. Rắn được điều khiển hoàn toàn bởi AI (A* pathfinding + flood fill safety).

## Yêu cầu

- Node.js 18+
- Một TikTok account đang livestream (để dùng tính năng kết nối live)

## Cài đặt & chạy

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # node --watch (auto-reload)
```

## Cách sử dụng

1. Nhập `@username` TikTok **đang live** vào ô input
2. Nhấn nút **plug** (icon cắm điện) để kết nối
3. Khi viewer tặng quà → táo xuất hiện → rắn AI tự ăn
4. Nhấn nút **unplug** để ngắt kết nối

### Test không cần livestream

Nhấn phím **`1`** để giả lập 1 quà, **`2`** để giả lập 5 quà, hoặc dùng API:

```bash
curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'

curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "giftName": "TikTok Universe"}'
```

## Kiến trúc

```
TikTok Live (Webcast)
        │
  server.js (Node.js)
  ├── tiktok-live-connector  ← nhận events từ TikTok qua WebSocket
  ├── Express                ← phục vụ static files + REST API
  └── Socket.io              ← relay events sang browser
        │
  public/game.js (Browser)
  ├── HTML5 Canvas           ← render game (16×16 grid, cell size động)
  ├── A* + Flood Fill AI     ← điều khiển rắn tự động
  └── Socket.io client       ← nhận gift/chat events
```

TikTok không cho kết nối trực tiếp từ browser (CORS). Server Node.js là cầu nối bắt buộc.

## Tính năng

| Tính năng | Mô tả |
|---|---|
| **Gift → Apple** | Mỗi quà tặng = táo xuất hiện trên sân, số lượng theo `repeatCount` |
| **AI A\* + Flood Fill** | Tìm đường tới táo gần nhất, kiểm tra không gian trước khi đi |
| **Chase tail fallback** | Khi không có đường an toàn tới táo, AI đuổi theo đuôi mình |
| **Xuyên tường** | Rắn đi qua tường và xuất hiện bên kia, AI biết tính đường qua tường |
| **Không chết vì thân** | Khi sắp cắn thân → tự tìm hướng thoát; chỉ chết khi hoàn toàn bị bít |
| **Soft reset** | Khi chết → đếm ngược 5s → respawn, táo giữ nguyên |
| **Apple queue** | Nhiều quà cùng lúc → táo xuất hiện tuần tự theo tick, không spam |
| **Apple animation** | Táo xuất hiện với hiệu ứng scale bounce + 3 vòng sáng lan toả |
| **Gift notification** | Pill nhỏ dưới canvas: tên người tặng + số táo, tự ẩn sau 1.8s |
| **Chat TikTok** | Tin nhắn chat hiển thị real-time trong side panel |

## Cấu trúc thư mục

```
tiktoklivetest/
├── package.json
├── server.js              ← backend Node.js
├── CLAUDE.md              ← context chi tiết cho AI agent
├── README.md              ← file này
└── public/
    ├── index.html         ← layout, IDs quan trọng, Lucide icons CDN
    ├── style.css          ← dark theme, layout dọc cố định, max-width 480px
    └── game.js            ← game engine + AI + Socket.io client
```

## REST API

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/connect` | Kết nối TikTok Live. Body: `{"username": "abc"}` |
| `POST` | `/disconnect` | Ngắt kết nối |
| `GET` | `/status` | Trạng thái hiện tại |
| `POST` | `/test-gift` | Giả lập gift. Body: `{"count": N, "giftName": "..."}` |

## Lưu ý bảo mật

- `tiktok-live-connector` là thư viện reverse-engineered, không chính thức.
- `protobufjs` (dep của connector) có CVE đã biết. **Chỉ chạy local, không deploy ra internet.**
- Mọi dữ liệu từ TikTok đều được `escapeHtml()` trước khi đưa vào DOM (chống XSS).
