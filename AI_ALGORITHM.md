# Snake AI Algorithm

Tài liệu này mô tả thuật toán điều khiển rắn trong `public/game.js`.

Mục tiêu của AI là cân bằng 3 yêu cầu:

- Ăn táo đủ nhanh để game hấp dẫn.
- Di chuyển không quá nhàm chán ở giai đoạn đầu và giữa.
- Khi rắn dài, chuyển sang chiến thuật an toàn để có thể full map và thắng.

## Các Phase Chính

AI được chia thành nhiều phase theo độ dài rắn.

### 1. Short Mode

Điều kiện:

```js
snake.length < RANDOM_MOVE_UNTIL_LENGTH
```

Hiện tại:

```js
const RANDOM_MOVE_UNTIL_LENGTH = 50;
const SHORT_MODE_RANDOMNESS = 0.02;
const RANDOM_TOP_CANDIDATES = 2;
```

Trong phase này, rắn ưu tiên ăn táo bằng A*:

1. Tìm táo gần nhất bằng `manhattan()`.
2. Chạy `astar(head, apple, snake)`.
3. Nếu có đường, đi bước đầu tiên của đường A*.
4. Nếu không có đường A*, fallback sang các candidate an toàn theo cycle.
5. Chỉ có `2%` xác suất chọn lệch trong nhóm candidate tốt nhất.

Tradeoff:

- Tăng `RANDOM_MOVE_UNTIL_LENGTH`: rắn ở mode tự nhiên lâu hơn, nhưng có thể chậm vào chiến thuật win.
- Tăng `SHORT_MODE_RANDOMNESS`: rắn ngẫu nhiên hơn, nhưng ăn táo chậm hơn.
- Giảm `SHORT_MODE_RANDOMNESS`: rắn bám táo mạnh hơn.

### 2. Hilbert Mode

Sau short mode và trước serpentine win mode, AI dùng Hilbert curve làm cycle an toàn.

Hilbert curve thay cho kiểu quét hàng đơn giản vì nó tạo đường đi ngoằn ngoèo tự nhiên hơn, ít cảm giác "từ trái sang phải, từ trên xuống dưới".

Các hàm chính:

- `getHamiltonianIndex(cell)`: đổi ô thành thứ tự trên Hilbert curve.
- `getCellByHamiltonianIndex(index)`: đổi thứ tự Hilbert về ô.
- `getHamiltonianDirection()`: bước kế tiếp trên Hilbert curve.
- `getHamiltonianMoveCandidates()`: lấy các nước đi hợp lệ theo Hilbert.

Trong phase này AI ưu tiên:

1. Shortcut an toàn tới táo bằng `getHamiltonianShortcutDirection()`.
2. A* tới táo nếu đường đó vẫn hợp lệ theo Hilbert.
3. Nếu không có shortcut, đi tiếp trên Hilbert cycle.
4. Nếu bị kẹt, dùng survival fallback.

## 3. Serpentine Win Mode

Điều kiện bật:

```js
snake.length >= SERPENTINE_WIN_LENGTH
```

Hiện tại:

```js
const SERPENTINE_WIN_LENGTH = 160;
const SERPENTINE_STRICT_LENGTH = 220;
```

Serpentine là cycle kiểu quét hàng:

- Hàng chẵn: trái sang phải.
- Hàng lẻ: phải sang trái.

Các hàm chính:

- `getSerpentineIndex(cell)`
- `getCellBySerpentineIndex(index)`
- `getSerpentineDirection()`
- `getSerpentineMoveCandidates()`

Serpentine mode có 2 giai đoạn.

### 3.1. Playful Serpentine

Điều kiện:

```js
SERPENTINE_WIN_LENGTH <= snake.length < SERPENTINE_STRICT_LENGTH
```

AI vẫn giữ serpentine làm khung an toàn, nhưng cho phép shortcut/A* an toàn để rắn còn rẽ theo táo, tránh nhìn quá nhàm chán.

### 3.2. Strict Serpentine

Điều kiện:

```js
snake.length >= SERPENTINE_STRICT_LENGTH
```

AI ưu tiên an toàn hơn sự tự nhiên:

1. Đi theo serpentine cycle.
2. Chỉ shortcut nếu không phá thứ tự an toàn.
3. Mục tiêu là full board và kích hoạt win.

## Chuyển Tiếp Sang Serpentine

Khi bật serpentine win mode, thân rắn có thể chưa nằm đúng thứ tự serpentine. Vì vậy AI không shortcut ngay.

Hàm `getSerpentineTransitionDirection()` sẽ:

1. Xét 4 hướng đi.
2. Mô phỏng nước đi bằng `simulateMove()`.
3. Kiểm tra an toàn bằng `isSimulatedMoveSafe()`.
4. Ưu tiên hướng tiến gần serpentine và gần táo.

Điều này giúp rắn dần xếp lại thân theo serpentine trước khi vào strict win mode.

## Safety Checks

AI dùng nhiều lớp kiểm tra an toàn:

### `isBodyCollision()`

Kiểm tra ô kế tiếp có đâm vào thân không. Đuôi thường được loại khỏi obstacle vì đuôi sẽ rời đi nếu rắn không ăn táo.

### `floodFill()`

Đếm số ô còn reachable sau một nước đi hoặc sau một đường đi. Nếu vùng trống quá nhỏ, đường đó bị xem là nguy hiểm.

### `isPathSafe()`

Mô phỏng rắn đi theo một path tới táo:

- Kiểm tra va chạm từng bước.
- Mô phỏng tăng chiều dài khi ăn táo.
- Kiểm tra còn đường về đuôi.
- Kiểm tra còn đủ vùng trống bằng flood-fill.

### `isCycleShortcutSafe()`

Kiểm tra shortcut có còn nằm trong khoảng an toàn giữa đầu và đuôi trên cycle không.

Được dùng cho cả Hilbert và Serpentine:

- `isHamiltonianShortcutSafe()`
- `isSerpentineShortcutSafe()`

## Win Condition

Khi rắn ăn táo và đạt đủ số ô:

```js
snake.length >= GRID_SIZE * GRID_SIZE
```

Game gọi `handleWin()`:

- Dừng game loop.
- Hiện overlay `WIN`.
- Đếm ngược 10 giây.
- Chạy hiệu ứng pháo bông.
- Restart game sau countdown.

## Gợi Ý Tuning

### Muốn rắn ăn táo nhanh hơn ở đầu game

Giảm random:

```js
const SHORT_MODE_RANDOMNESS = 0.0;
```

Hoặc giảm thời gian short mode:

```js
const RANDOM_MOVE_UNTIL_LENGTH = 10;
```

### Muốn rắn tự nhiên hơn lâu hơn

Tăng short mode:

```js
const RANDOM_MOVE_UNTIL_LENGTH = 40;
```

Nhưng không nên tăng quá cao nếu mục tiêu là win ổn định.

### Muốn chuyển sang win mode sớm hơn

Giảm:

```js
const SERPENTINE_WIN_LENGTH = 120;
```

### Muốn strict serpentine sớm hơn

Giảm:

```js
const SERPENTINE_STRICT_LENGTH = 190;
```

Điều này làm rắn bớt tự nhiên hơn nhưng an toàn hơn khi dài.

## Tóm Tắt Luồng Quyết Định

```text
Nếu snake.length >= SERPENTINE_WIN_LENGTH
  -> Serpentine win mode
     -> Nếu chưa aligned: transition an toàn
     -> Nếu playful: A*/shortcut theo táo
     -> Nếu strict: ưu tiên cycle để win

Ngược lại nếu snake.length < RANDOM_MOVE_UNTIL_LENGTH
  -> Short mode
     -> A* trực tiếp tới táo
     -> fallback candidate gần táo
     -> random rất nhẹ

Ngược lại
  -> Hilbert mode
     -> shortcut an toàn tới táo
     -> A* an toàn
     -> đi tiếp trên Hilbert cycle
     -> survival fallback
```
