# TikTok Live Snake Game 🐍

Trò chơi Rắn săn mồi kết nối với TikTok Live — mỗi khi người xem tặng quà, một quả táo xuất hiện trên bàn chơi. Rắn được điều khiển hoàn toàn bởi AI (A* pathfinding).

## Yêu cầu

- Node.js 18+
- Một TikTok account đang livestream (để test tính năng TikTok Live)

## Cài đặt & chạy

```bash
npm install
npm start
```

Mở trình duyệt: **http://localhost:3000**

## Cách sử dụng

1. Nhập `@username` của tài khoản TikTok **đang live** vào ô input
2. Nhấn **Kết nối** — server sẽ kết nối tới TikTok Webcast
3. Khi người xem tặng quà → táo xuất hiện → rắn AI tự ăn
4. Nhấn **Ngắt** để ngắt kết nối

### Test không cần livestream

Nhấn nút **Giả lập quà** / **Giả lập ×5** trong sidebar, hoặc dùng API trực tiếp:

```bash
# 1 táo
curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'

# 10 táo với tên quà cụ thể
curl -X POST http://localhost:3000/test-gift \
  -H "Content-Type: application/json" \
  -d '{"count": 10, "giftName": "TikTok Universe"}'
```

## Kiến trúc

```
TikTok Live (Webcast)
        │
  server.js (Node.js)
  ├── tiktok-live-connector  ← nhận events từ TikTok
  ├── Express                ← phục vụ static files + REST API
  └── Socket.io              ← relay events sang browser
        │
  public/game.js (Browser)
  ├── HTML5 Canvas           ← render game
  ├── A* Pathfinding AI      ← điều khiển rắn
  └── Socket.io client       ← nhận gift events
```

## Tính năng

| Tính năng | Mô tả |
|---|---|
| **Gift → Apple** | Mỗi quà tặng = 1+ táo trên bàn (theo `repeatCount`) |
| **AI A\*** | Rắn tự tìm đường tới táo gần nhất, tránh tự đụng |
| **Flood Fill safety** | AI kiểm tra không gian trống trước khi đi để không tự bẫy |
| **Wrap-around** | Rắn xuyên tường, game không kết thúc vì tường |
| **Soft reset** | Nếu rắn tự đụng → respawn, game tiếp tục (không mất táo) |
| **Apple queue** | Nhiều quà cùng lúc → táo xuất hiện tuần tự, không spam |
| **Gift notification** | Card hiển thị tên người tặng, tên quà, số táo — tự xóa sau 4s |
| **Chat TikTok** | Tin nhắn chat hiển thị trong sidebar |
| **Path visualize** | Đường đi A* được vẽ mờ trên canvas |

## Cấu trúc thư mục

```
tiktoklivetest/
├── package.json
├── server.js              ← backend Node.js
├── CLAUDE.md              ← context cho AI developer
├── README.md              ← file này
└── public/
    ├── index.html
    ├── style.css
    └── game.js
```

## REST API

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/connect` | Kết nối TikTok Live. Body: `{"username": "abc"}` |
| `POST` | `/disconnect` | Ngắt kết nối |
| `GET` | `/status` | Trạng thái hiện tại |
| `POST` | `/test-gift` | Giả lập gift. Body: `{"count": N, "giftName": "..."}` |

## Lưu ý

- `tiktok-live-connector` là thư viện **reverse-engineered**, không chính thức. TikTok có thể thay đổi API bất cứ lúc nào.
- Chỉ kết nối được với **tài khoản đang live**. Nếu không live → lỗi kết nối.
- Dependency `protobufjs` có CVE đã biết. Chỉ chạy trên máy local, không deploy ra internet.
