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
const HAMILTONIAN_MOVE_UNTIL_LENGTH = 80;
const HAMILTONIAN_HARD_LOCK_LENGTH = 150;
const SHORT_MODE_RANDOMNESS = 0.02;
const RANDOM_TOP_CANDIDATES = 2;
const APPLE_CHASE_LENGTH = 70;
const DENSE_APPLE_WIN_THRESHOLD = 30;
const SERPENTINE_PREP_LENGTH = 120;
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

### Dense Apple Win Mode

Điều kiện:

```js
apples.length > DENSE_APPLE_WIN_THRESHOLD
```

Khi trên màn hình có hơn `30` quả táo và rắn chưa vượt `HAMILTONIAN_MOVE_UNTIL_LENGTH`, AI bật `useHamiltonianMode` và chuyển sang luồng Hamiltonian an toàn. Sau khi mode này đã bật, rắn tiếp tục ở Hamiltonian kể cả khi vượt `HAMILTONIAN_MOVE_UNTIL_LENGTH`; mode chỉ tắt khi số táo giảm về `30` hoặc ít hơn.

Luồng xử lý:

1. Chỉ tính táo thật trong `apples`, không tính hoa đổi màu hoặc đom đóm.
2. Gọi `getHamiltonianShortcutDirection()` để rắn chỉ shortcut khi vẫn giữ thứ tự an toàn giữa đầu và đuôi trên Hamiltonian cycle.
3. Nếu không có shortcut, thử A* theo Hamiltonian bằng `getAStarDirectionForCycle(isHamiltonianShortcutSafe)`.
4. Nếu vẫn không có hướng ăn an toàn, đi tiếp trên `getHamiltonianDirection()`.
5. Nếu nước Hamiltonian kế tiếp bị chặn, fallback sang `getSurvivalDirection()`.

Mode này chỉ được bật trong giai đoạn `snake.length <= HAMILTONIAN_MOVE_UNTIL_LENGTH`. Nếu rắn đã vượt ngưỡng này khi `useHamiltonianMode` vẫn false, AI không được vào Hamiltonian nữa và chuyển sang luồng single-apple maze, serpentine hoặc survival tùy điều kiện hiện tại.

### 2. Hilbert Mode

Sau short mode và trước các win mode đặc biệt, AI dùng Hilbert curve làm cycle an toàn. Nếu về late game chỉ còn một quả táo và có đường ăn an toàn, Single Apple Maze Mode có thể chen vào trước serpentine.

Hilbert curve thay cho kiểu quét hàng đơn giản vì nó tạo đường đi ngoằn ngoèo tự nhiên hơn, ít cảm giác "từ trái sang phải, từ trên xuống dưới".

Các hàm chính:

- `getHamiltonianIndex(cell)`: đổi ô thành thứ tự trên Hilbert curve.
- `getCellByHamiltonianIndex(index)`: đổi thứ tự Hilbert về ô.
- `getHamiltonianDirection()`: bước kế tiếp trên Hilbert curve.
- `getHamiltonianMoveCandidates()`: lấy các nước đi hợp lệ theo Hilbert.

Trong phase này AI ưu tiên:

1. Từ độ dài `APPLE_CHASE_LENGTH` đến trước `SERPENTINE_PREP_LENGTH`, thử `getSafeAppleChaseDirection()` trước. Đường A* đầy đủ chỉ được dùng nếu qua được `isPathSafe()`; fallback một bước vẫn phải qua `isSimulatedMoveSafe()`.
2. Shortcut an toàn tới táo bằng `getHamiltonianShortcutDirection()`.
3. A* tới táo nếu đường đó vẫn hợp lệ theo Hilbert.
4. Nếu không có shortcut, đi tiếp trên Hilbert cycle.
5. Nếu bị kẹt, dùng survival fallback.
6. Hamiltonian chỉ được bật khi táo dày (`apples.length > DENSE_APPLE_WIN_THRESHOLD`) và `snake.length <= HAMILTONIAN_MOVE_UNTIL_LENGTH`. Nếu đã bật, nó duy trì qua ngưỡng này cho đến khi táo giảm về `30` hoặc ít hơn.

Tradeoff:

- Giảm `APPLE_CHASE_LENGTH`: rắn bắt đầu bám táo mạnh hơn sớm hơn, nhưng rời cycle an toàn nhiều hơn.
- Tăng `SERPENTINE_PREP_LENGTH`: rắn bám táo lâu hơn trước khi bắt đầu prep serpentine hoặc được phép bật single-apple maze.

### Dense Hamiltonian Window

Điều kiện chạy Hamiltonian:

```js
useHamiltonianMode === true
```

Điều kiện bật:

```js
apples.length > DENSE_APPLE_WIN_THRESHOLD &&
snake.length <= HAMILTONIAN_MOVE_UNTIL_LENGTH
```

`HAMILTONIAN_MOVE_UNTIL_LENGTH` là cửa sổ cho phép bật Hamiltonian. Nếu `useHamiltonianMode` đã true, rắn tiếp tục ở Hamiltonian kể cả sau khi vượt ngưỡng này. Nếu số táo trên màn hình giảm về `30` hoặc ít hơn trước khi hard lock, `useHamiltonianMode` tắt và AI quay lại flow bình thường. Nếu rắn đã vượt `HAMILTONIAN_MOVE_UNTIL_LENGTH` khi `useHamiltonianMode` vẫn false, AI không được vào Hamiltonian nữa.

Hard lock:

```js
useHamiltonianMode === true &&
snake.length >= HAMILTONIAN_HARD_LOCK_LENGTH
```

Khi hard lock bật, `lockHamiltonianMode` giữ rắn ở Hamiltonian cho đến win/loss, kể cả khi số táo trên màn hình giảm về `30` hoặc ít hơn.

Khi dense Hamiltonian đang chạy, nó dùng luồng:

1. `getHamiltonianShortcutDirection()`
2. `getAStarDirectionForCycle(isHamiltonianShortcutSafe)`
3. `getHamiltonianDirection()`
4. `getSurvivalDirection()`

`SERPENTINE_PREP_LENGTH` không tự bật Hamiltonian. Nếu dense condition không còn đúng khi rắn đạt `SERPENTINE_PREP_LENGTH`, rắn sẽ tiếp tục đi vào nhánh serpentine prep bình thường.

## Single Apple Maze Mode

Mode này xử lý trường hợp late game khi trên map chỉ còn một quả táo. Mục tiêu là cho rắn đi theo một đường mê cung nhìn có vẻ mất trật tự, giống hành lang maze, nhưng thực chất vẫn là một cycle an toàn phủ toàn bộ bàn.

Điều kiện bật:

```js
isSingleAppleMazeCheckActive() &&
hasSafeSingleApplePath()
```

`isSingleAppleMazeCheckActive()` mở một cửa sổ kiểm tra trong `SINGLE_APPLE_MAZE_CHECK_MS = 10000` mili giây. Cửa sổ này chỉ active khi:

- Chưa bật `useSingleAppleMazeMode`.
- Không đang ở `useHamiltonianMode`.
- `snake.length > SERPENTINE_PREP_LENGTH`.
- Trên map có đúng `1` quả táo.

Điểm quan trọng: `snake.length` phải lớn hơn `SERPENTINE_PREP_LENGTH`, không phải lớn hơn hoặc bằng. Trong 10 giây đó, mỗi tick AI check lại `hasSafeSingleApplePath()`. Mode chỉ bật nếu hàm này chứng minh hiện tại có đường A* tới quả táo duy nhất và đường đó qua được `isPathSafe()`. Nếu quả táo đổi hoặc số apple không còn đúng `1`, cửa sổ kiểm tra reset.

### Cấu Trúc Maze Cycle

Maze cycle không dùng serpentine quét ngang và cũng không dùng Hilbert curve. Game hiện có 3 kiểu corridor trong `MAZE_VARIANTS`; mỗi kiểu dùng seed, điểm bắt đầu DFS và trọng số hướng khác nhau:

- `long-corridor`: ưu tiên giữ hướng và đi dọc nhiều hơn, tạo hành lang dài.
- `wide-corridor`: ưu tiên ngang nhiều hơn, tạo cảm giác maze trải rộng.
- `broken-corridor`: giảm ưu tiên giữ hướng, tạo nhiều đoạn gãy và ngã rẽ ngắn.

Các hàm sinh maze:

- `createSeededRandom(seed)`: tạo random có seed cố định cho từng variant, để mỗi kiểu maze ổn định khi được chọn.
- `buildMazeTreeEdges(variant)`: sinh maze thô 8x8 bằng DFS có trọng số theo variant.
- `getMazeBlockCells()`: phóng mỗi ô maze 8x8 thành block 2x2 trên bàn 16x16.
- `spliceMazeBlocks()`: nối các block 2x2 theo cạnh của cây maze, tạo một đường corridor duy nhất.
- `createMazeCycleCells(variant)`: xuất ra danh sách 256 ô theo thứ tự cycle cho một variant.
- `createMazeLayout(variant)`: prebuild `cells` và `indexByCell` để AI lookup nhanh khi chạy.

Kết quả là `MAZE_LAYOUTS`: 3 đường đi khác nhau, mỗi đường phủ đủ `GRID_SIZE * GRID_SIZE` ô. Mỗi ô xuất hiện đúng một lần, và ô kế tiếp luôn là hàng xóm liền kề. Vì vậy rắn có thể đi theo cycle đang active đến cuối game mà không tự nhốt mình, miễn là thứ tự đầu/đuôi trên cycle còn an toàn.

Mỗi game gọi `selectRandomMazeVariant()` trong `initGame()` hoặc `restartGame()`. Nếu có nhiều hơn một layout, hàm này tránh chọn lại đúng layout vừa dùng ở ván trước để chuyển động đỡ nhàm chán.

Các helper chính:

- `getMazeIndex(cell)`: đổi ô thành thứ tự trên maze cycle.
- `getCellByMazeIndex(index)`: đổi thứ tự maze về ô.
- `getActiveMazeLayout()`: lấy layout corridor đang được áp dụng cho ván hiện tại.
- `getMazeDirection()`: bước kế tiếp trên maze cycle.
- `isSnakeAlignedToMaze()`: kiểm tra thân rắn đã nằm đúng thứ tự maze chưa.
- `getMazeMoveCandidates()`: lấy các nước đi hợp lệ theo maze.
- `getMazeShortcutDirection()`: shortcut an toàn theo maze.
- `isMazeShortcutSafe()`: kiểm tra shortcut bằng `isCycleShortcutSafe()` nhưng dùng `getMazeIndex`.

### Luồng Chạy

Khi `useSingleAppleMazeMode` đã bật, AI gọi `getSingleAppleMazeDirection()` trước các mode win khác:

1. Nếu thân chưa aligned với maze, dùng `getMazeTransitionDirection()` để dần đưa thân vào thứ tự maze.
2. Khi đã aligned, thử `getSingleAppleSafePathDirection()` để ăn quả táo duy nhất bằng A*.
3. Đường A* chỉ được dùng nếu qua `isPathSafe()` và `isMazeShortcutSafe()`.
4. Nếu không có đường ăn táo an toàn, thử `getMazeShortcutDirection()`.
5. Nếu không có shortcut, đi tiếp bằng `getMazeDirection()`.
6. Nếu nước maze kế tiếp bị chặn, fallback sang `getSurvivalDirection()`.

`getMazeTransitionDirection()` vẫn mô phỏng từng nước bằng `simulateMove()` và chỉ nhận candidate qua `isSimulatedMoveSafe()`. Scoring ưu tiên hướng maze, đường tới táo nếu an toàn, và ô ít bị body pressure để thân rắn dễ xếp lại thành hành lang.

## 3. Serpentine Win Mode

Điều kiện bật:

```js
!useHamiltonianMode &&
snake.length >= SERPENTINE_WIN_LENGTH
```

Hiện tại:

```js
const SERPENTINE_PREP_LENGTH = 120;
const SERPENTINE_WIN_LENGTH = 180;
const SERPENTINE_STRICT_LENGTH = 220;
const SERPENTINE_LOOSE_GAP_CHANCE = 0.18;
const SERPENTINE_LOOSE_GAP_END_LENGTH = 200;
const SERPENTINE_LOOSE_GAP_RECOVERY_TICKS = 10;
const SERPENTINE_BODY_ADJACENCY_WEIGHT = 20;
const SERPENTINE_BODY_PRESSURE_WEIGHT = 6;
const SINGLE_APPLE_MAZE_CHECK_MS = 10000;
const MAZE_VARIANTS = [
  'long-corridor',
  'wide-corridor',
  'broken-corridor'
];
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

Được dùng cho Hilbert, Serpentine và Maze:

- `isHamiltonianShortcutSafe()`
- `isSerpentineShortcutSafe()`
- `isMazeShortcutSafe()`

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

### Táo Khi Bảng Đã Kín

Trước khi xử lý rắn ăn táo, game kiểm tra `isBoardFull()`. Hàm này tính tất cả ô đang bị chiếm bởi:

- Thân rắn.
- Táo.
- Bom.
- Hoa đổi màu.
- Đom đóm theo ô hiện tại của nó.

Nếu toàn bộ `GRID_SIZE * GRID_SIZE` ô đều đã bị chiếm, táo vẫn biến mất và vẫn cộng điểm khi rắn ăn. Rắn chỉ không dài thêm khi việc ăn táo chưa thể làm rắn phủ kín toàn bộ map; nếu rắn đang dài `GRID_SIZE * GRID_SIZE - 1` và ăn quả táo ở ô cuối cùng, game vẫn cho rắn dài thêm để kích hoạt win.

Game gọi `ensureAppleAvailable()` ở đầu và cuối mỗi tick. Nếu rắn đã chiếm `GRID_SIZE * GRID_SIZE - 1` ô, `ensureFinalAppleAvailable()` sẽ ép đặt một quả táo vào ô duy nhất không thuộc thân rắn và dọn bom/hoa/đom đóm khỏi ô đó nếu cần. Gọi ở đầu tick giúp ô cuối được biến thành táo trước khi đầu rắn đi vào đó. Nếu chưa tới trạng thái cuối game và trên map không còn quả táo nào, hàm này thử spawn ngay một quả táo vào ô trống hiện tại; nếu spawn đó dùng táo từ `appleQueue` thì queue được trừ sau khi spawn thành công.

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

## Công Cụ Chạy Và Test Thuật Toán

Mục này chỉ ghi các công cụ kiểm tra chung để AI hoặc dev tiếp theo có thể dùng trước khi kết luận một thay đổi thuật toán.

### 1. Chạy server local

```bash
PORT=3001 npm start
```

Nếu port bị chiếm:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

Kiểm tra server và asset:

```bash
curl -s http://127.0.0.1:3001/status
curl -s -o /tmp/snake_game_3001.js -w '%{http_code} %{size_download}\n' http://127.0.0.1:3001/game.js
```

Gửi gift giả:

```bash
curl -s -X POST http://127.0.0.1:3001/test-gift \
  -H 'Content-Type: application/json' \
  -d '{"count":5,"giftName":"Debug Gift"}'
```

### 2. Kiểm tra cú pháp

```bash
node --check public/game.js
```

### 3. Benchmark headless

Dùng Node VM để chạy game loop không cần browser thật. Benchmark tắt render/UI để tập trung đo thuật toán:

```bash
node <<'NODE'
const fs = require('fs');
const vm = require('vm');

function createSandbox() {
  const noop = () => {};
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => ({ addColorStop: noop });
      }
      if (!(prop in target)) target[prop] = noop;
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });

  const makeElement = id => ({
    id,
    width: 0,
    height: 0,
    value: '',
    disabled: false,
    textContent: '',
    innerHTML: '',
    firstChild: null,
    lastChild: null,
    children: [],
    style: { setProperty: noop },
    classList: { add: noop, remove: noop, toggle: noop },
    getContext: () => ctx,
    addEventListener: noop,
    appendChild(child) { return child; },
    removeChild(child) { return child; },
    remove: noop
  });

  const elements = new Map();
  const document = {
    documentElement: { style: { setProperty: noop } },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeElement(id));
      return elements.get(id);
    },
    createElement: makeElement,
    addEventListener: noop
  };

  const sandbox = {
    console,
    window: { innerWidth: 460 },
    document,
    alert: noop,
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    io: () => ({ on: noop, emit: noop }),
    lucide: { createIcons: noop },
    setInterval: () => 1,
    clearInterval: noop,
    setTimeout: noop,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: noop,
    Date,
    Math
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  return sandbox;
}

const code = fs.readFileSync('public/game.js', 'utf8');
const benchmark = `
render = function() {};
updateUI = function() {};
startFireworks = function() {};
stopFireworks = function() {};
startResultCountdown = function() {};

function runOne(maxTicks = 40000) {
  initGame();
  const startWins = winCount;
  const startLosses = lossCount;
  let maxLength = snake.length;

  for (let i = 0; i < maxTicks; i++) {
    tick();
    if (snake.length > maxLength) maxLength = snake.length;
    if (winCount > startWins) return { result: 'win', ticks: i + 1, maxLength };
    if (lossCount > startLosses) return { result: 'loss', ticks: i + 1, maxLength };
  }
  return { result: 'timeout', ticks: maxTicks, maxLength };
}

const games = 30;
const results = [];
for (let i = 0; i < games; i++) results.push(runOne());

const summary = results.reduce((acc, result) => {
  acc[result.result] = (acc[result.result] || 0) + 1;
  acc.maxLengthSum += result.maxLength;
  acc.tickSum += result.ticks;
  return acc;
}, {
  win: 0,
  loss: 0,
  timeout: 0,
  maxLengthSum: 0,
  tickSum: 0
});

summary.games = games;
summary.winRate = summary.win / games;
summary.lossRate = summary.loss / games;
summary.timeoutRate = summary.timeout / games;
summary.avgMaxLength = +(summary.maxLengthSum / games).toFixed(1);
summary.avgTicks = +(summary.tickSum / games).toFixed(1);
console.log(JSON.stringify(summary, null, 2));
`;

vm.runInContext(code + benchmark, createSandbox(), { filename: 'snake-ai-benchmark.js' });
NODE
```

Chỉ số chung nên xem:

- `winRate`: tỉ lệ thắng.
- `lossRate`: tỉ lệ thua.
- `timeoutRate`: tỉ lệ chạy quá giới hạn tick.
- `avgMaxLength`: độ dài tối đa trung bình.
- `avgTicks`: số tick trung bình mỗi ván.

## Tóm Tắt Luồng Quyết Định

```text
Khi initGame() hoặc restartGame()
  -> selectRandomMazeVariant()
     -> chọn 1 trong 3 corridor layout
     -> tránh lặp layout vừa dùng nếu có thể

Nếu useHamiltonianMode đã bật và snake.length >= HAMILTONIAN_HARD_LOCK_LENGTH
  -> bật lockHamiltonianMode
     -> giữ Hamiltonian đến win/loss dù táo giảm

Nếu apples.length > DENSE_APPLE_WIN_THRESHOLD và snake.length <= HAMILTONIAN_MOVE_UNTIL_LENGTH
  -> bật useHamiltonianMode

Nếu useHamiltonianMode đã bật, chưa hard lock, và apples.length <= DENSE_APPLE_WIN_THRESHOLD
  -> tắt useHamiltonianMode

Nếu chưa useSingleAppleMazeMode, chưa useHamiltonianMode,
snake.length > SERPENTINE_PREP_LENGTH, và apples.length === 1
  -> isSingleAppleMazeCheckActive()
     -> mở hoặc duy trì cửa sổ kiểm tra 10 giây cho apple hiện tại

Nếu isSingleAppleMazeCheckActive() và hasSafeSingleApplePath()
  -> bật useSingleAppleMazeMode

Nếu useSingleAppleMazeMode đã bật
  -> Single Apple Maze mode
     -> Nếu chưa aligned maze: getMazeTransitionDirection()
     -> Nếu aligned: A* tới apple nếu qua isPathSafe() và isMazeShortcutSafe()
     -> getMazeShortcutDirection()
     -> getMazeDirection()
     -> survival fallback

Nếu snake.length >= SERPENTINE_WIN_LENGTH và chưa useHamiltonianMode
  -> bật useSerpentineWinMode

Nếu useSerpentineWinMode đã bật
  -> Serpentine win mode
     -> Nếu chưa aligned: transition an toàn
     -> Nếu playful: A*/shortcut theo táo
     -> Nếu strict: ưu tiên cycle để win

Nếu useHamiltonianMode đã bật
  -> Dense Hamiltonian mode
     -> getHamiltonianShortcutDirection()
     -> A* nếu vẫn an toàn theo Hamiltonian
     -> Hamiltonian cycle
     -> survival fallback

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
