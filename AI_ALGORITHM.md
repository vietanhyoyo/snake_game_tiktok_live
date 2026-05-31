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
const APPLE_CHASE_LENGTH = 70;
const SERPENTINE_PREP_LENGTH = 150;
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

1. Từ độ dài `SERPENTINE_PREP_LENGTH`, AI bắt đầu chuẩn bị serpentine để vào win mode ở mốc `SERPENTINE_WIN_LENGTH`.
2. Trong khoảng `SERPENTINE_PREP_LENGTH <= snake.length < SERPENTINE_WIN_LENGTH`, AI có thể mở khe nhẹ bằng `getSerpentineTransitionDirection(false, { preferOpenGap: true })`, sau đó quay lại strict transition để xếp thân.
3. Từ độ dài `APPLE_CHASE_LENGTH` đến trước `SERPENTINE_PREP_LENGTH`, thử `getSafeAppleChaseDirection()` trước. Đường A* đầy đủ chỉ được dùng nếu qua được `isPathSafe()`; fallback một bước vẫn phải qua `isSimulatedMoveSafe()`.
4. Shortcut an toàn tới táo bằng `getHamiltonianShortcutDirection()`.
5. A* tới táo nếu đường đó vẫn hợp lệ theo Hilbert.
6. Nếu không có shortcut, đi tiếp trên Hilbert cycle.
7. Nếu bị kẹt, dùng survival fallback.

Tradeoff:

- Giảm `APPLE_CHASE_LENGTH`: rắn bắt đầu bám táo mạnh hơn sớm hơn, nhưng rời cycle an toàn nhiều hơn.
- Tăng `SERPENTINE_PREP_LENGTH`: rắn bám táo lâu hơn trước khi xếp win, nhưng tỉ lệ ổn định sau 150 có thể giảm.

## 3. Serpentine Win Mode

Điều kiện bật:

```js
snake.length >= SERPENTINE_WIN_LENGTH
```

Hiện tại:

```js
const SERPENTINE_PREP_LENGTH = 150;
const SERPENTINE_WIN_LENGTH = 180;
const SERPENTINE_STRICT_LENGTH = 220;
const SERPENTINE_LOOSE_GAP_CHANCE = 0.18;
const SERPENTINE_LOOSE_GAP_END_LENGTH = 200;
const SERPENTINE_LOOSE_GAP_RECOVERY_TICKS = 10;
const SERPENTINE_BODY_ADJACENCY_WEIGHT = 20;
const SERPENTINE_BODY_PRESSURE_WEIGHT = 6;
```

Serpentine là cycle kiểu quét hàng:

- Hàng chẵn: trái sang phải.
- Hàng lẻ: phải sang trái.

Các hàm chính:

- `getSerpentineIndex(cell)`
- `getCellBySerpentineIndex(index)`
- `getSerpentineDirection()`
- `getSerpentineMoveCandidates()`

Serpentine-related logic có 3 giai đoạn: prep loose-gap, playful win mode, và strict win mode.

### 3.1. Prep Loose Gap

Điều kiện thực tế:

```js
SERPENTINE_PREP_LENGTH <= snake.length < SERPENTINE_WIN_LENGTH
```

Trong khoảng này AI bắt đầu xếp thân theo serpentine, nhưng có nhịp mở khe nhỏ để rắn không bám sát cơ thể quá đều khi đang quét map.

Luồng xử lý:

1. Nếu `serpentineLooseGapCooldown > 0`, giảm cooldown và tiếp tục strict transition.
2. Nếu chưa cooldown và còn trong khoảng taper, tính xác suất:

```js
const prepProgress = (snake.length - SERPENTINE_PREP_LENGTH) /
  (SERPENTINE_LOOSE_GAP_END_LENGTH - SERPENTINE_PREP_LENGTH);
const looseGapChance = SERPENTINE_LOOSE_GAP_CHANCE * (1 - prepProgress);
```

3. Nếu random trúng `looseGapChance`, AI đi transition mềm:

```js
getSerpentineTransitionDirection(false, { preferOpenGap: true })
```

4. Sau một lần mở khe, `SERPENTINE_LOOSE_GAP_RECOVERY_TICKS` buộc rắn hồi về strict trong vài tick.
5. Nếu không mở khe và thân chưa aligned, AI dùng `getSerpentineTransitionDirection(true)`.

Ghi chú: `SERPENTINE_LOOSE_GAP_END_LENGTH` hiện là `200`, lớn hơn `SERPENTINE_WIN_LENGTH = 180`, nên loose-gap chỉ chạy thực tế đến trước 180. Giá trị 200 đóng vai trò điểm taper để xác suất giảm từ từ, thay vì về 0 quá sớm.

Khi `preferOpenGap = true`, điểm số sẽ:

- Phạt ô có nhiều thân kề bên bằng `SERPENTINE_BODY_ADJACENCY_WEIGHT`.
- Phạt vùng có nhiều thân gần đó bằng `SERPENTINE_BODY_PRESSURE_WEIGHT`.
- Giảm trọng số bám `advance` serpentine.
- Giảm trọng số bám táo.
- Vẫn ưu tiên `isSimulatedMoveSafe()`, nhưng nếu path-to-tail quá chặt thì cho phép `isLoosePrepMoveSafe()` dựa trên flood-fill.

### 3.2. Playful Serpentine

Điều kiện:

```js
SERPENTINE_WIN_LENGTH <= snake.length < SERPENTINE_STRICT_LENGTH
```

AI vẫn giữ serpentine làm khung an toàn. Nếu thân chưa aligned, non-strict win mode có thể thử `getSafeAppleChaseDirection()` trước, sau đó mới transition. Khi đã aligned, AI thử A*/shortcut an toàn theo serpentine để rắn còn rẽ theo táo.

### 3.3. Strict Serpentine

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
4. Nếu `preferOpenGap = true`, cho phép thêm `isLoosePrepMoveSafe()` khi late game quá chặt.
5. Ưu tiên hướng tiến gần serpentine, gần táo, hoặc mở khoảng hở tùy mode.

Điều này giúp rắn dần xếp lại thân theo serpentine trước khi vào strict win mode.

Ở strict transition, hướng serpentine được bonus rất mạnh để kéo thân vào đúng thứ tự. Ở non-strict transition, trọng số gần táo cao hơn. Ở open-gap transition, AI phạt body adjacency/body pressure để tránh đi quá sát thân. Khi `snake.length >= SERPENTINE_STRICT_LENGTH`, AI giảm ưu tiên táo và quay về ưu tiên cycle để bảo toàn đường thắng.

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

### `isSimulatedMoveSafe()`

Mô phỏng một nước đi rồi kiểm tra:

- Có đường từ đầu mới về đuôi bằng A*.
- Vùng reachable sau nước đi đủ lớn so với chiều dài rắn.

Đây là check an toàn chính cho các nước đi một bước.

### `isLoosePrepMoveSafe()`

Chỉ dùng cho prep loose-gap khi `preferOpenGap = true`.

Hàm này nới nhẹ điều kiện so với `isSimulatedMoveSafe()`:

- Không bắt buộc phải có path-to-tail.
- Dùng flood-fill để đảm bảo vùng trống tối thiểu còn đủ lớn.
- Giúp open-gap có candidate trong giai đoạn late game, khi path-to-tail thường quá chặt và strict/open sẽ cùng fallback về survival.

### `countNearbyBodyCells()`

Đếm số đoạn thân quanh ô kế tiếp trong bán kính nhỏ. Kết quả được dùng làm body pressure trong open-gap scoring, giúp rắn ưu tiên ô thoáng hơn thay vì bám sát thân.

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
const RANDOM_MOVE_UNTIL_LENGTH = 80;
```

Nhưng không nên tăng quá cao nếu mục tiêu là win ổn định.

### Muốn chuyển sang win mode sớm hơn

Giảm `SERPENTINE_WIN_LENGTH`. Nếu giảm thấp hơn `SERPENTINE_PREP_LENGTH`, nên giảm `SERPENTINE_PREP_LENGTH` theo để rắn vẫn có đoạn chuẩn bị:

```js
const SERPENTINE_PREP_LENGTH = 100;
const SERPENTINE_WIN_LENGTH = 120;
```

### Muốn strict serpentine sớm hơn

Giảm:

```js
const SERPENTINE_STRICT_LENGTH = 190;
```

Điều này làm rắn bớt tự nhiên hơn nhưng an toàn hơn khi dài.

### Muốn loose-gap thấy rõ hơn

Tăng nhẹ:

```js
const SERPENTINE_LOOSE_GAP_CHANCE = 0.24;
```

Hoặc giảm thời gian hồi strict:

```js
const SERPENTINE_LOOSE_GAP_RECOVERY_TICKS = 6;
```

Tradeoff: rắn nhìn tự nhiên hơn, nhưng càng dễ làm chậm quá trình aligned serpentine trước win mode.

### Muốn ưu tiên win ổn định hơn

Giảm loose-gap:

```js
const SERPENTINE_LOOSE_GAP_CHANCE = 0.08;
```

Hoặc tăng recovery:

```js
const SERPENTINE_LOOSE_GAP_RECOVERY_TICKS = 14;
```

Điều này làm rắn bám serpentine hơn trong prep, ít mở khe hơn.

## Tóm Tắt Luồng Quyết Định

```text
Nếu snake.length >= SERPENTINE_WIN_LENGTH
  -> Serpentine win mode
     -> Nếu chưa aligned: transition an toàn
     -> Nếu playful: A*/shortcut theo táo
     -> Nếu strict: ưu tiên cycle để win

Nếu SERPENTINE_PREP_LENGTH <= snake.length < SERPENTINE_WIN_LENGTH
  -> Nếu cooldown loose-gap còn: giảm cooldown
  -> Nếu random trúng loose-gap chance: transition mềm preferOpenGap
  -> Nếu chưa aligned: transition strict
  -> Nếu đã aligned: đi tiếp luồng phía dưới

Ngược lại nếu snake.length < RANDOM_MOVE_UNTIL_LENGTH
  -> Short mode
     -> A* trực tiếp tới táo
     -> fallback candidate gần táo
     -> random rất nhẹ

Ngược lại
  -> Hilbert mode
     -> Nếu snake.length >= APPLE_CHASE_LENGTH: A* ăn táo nếu path an toàn
     -> shortcut an toàn tới táo
     -> A* an toàn
     -> đi tiếp trên Hilbert cycle
     -> survival fallback
```
