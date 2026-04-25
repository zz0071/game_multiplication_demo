# Game State Contracts: 太空射擊風格乘法練習網頁遊戲

**Date**: 2026-04-05（2026-04-25 更新）  
**Feature**: [spec.md](../spec.md) | [data-model.md](../data-model.md)

此文件定義遊戲各模組的公開介面契約（JavaScript 函式簽名與行為規範）。  
實作必須符合以下介面，以確保模組間解耦與可測試性。

---

## 模組：QuestionGenerator

```javascript
/**
 * 依關卡生成一題乘法題目（含 6 個選項）
 * @param {number} stage   - 關卡編號（1–10）
 * @returns {Question}     - 題目物件（見 data-model.md）
 * @throws {RangeError}    - 若 stage 超出 1–10 範圍
 */
function generateQuestion(stage): Question

/**
 * 生成 5 個干擾選項，確保不重複且不等於正確答案
 * @param {number} correctAnswer - 正確答案
 * @returns {number[]}           - 5 個干擾選項（均 > 0）
 */
function generateDistractors(correctAnswer): number[]

/**
 * 打亂 6 個選項的順序
 * @param {number[]} options - 長度為 6 的選項陣列
 * @returns {number[]}       - 已隨機排列的選項陣列
 */
function shuffleOptions(options): number[]
```

---

## 模組：Scoring

```javascript
/**
 * 計算對應分數的星等（1–10 顆）
 * @param {number} score - 總分（0–1500）
 * @returns {number}     - 星等（1–10）
 */
function calcStars(score): number

/**
 * 從 GameSession 建立 ScoreRecord
 * @param {GameSession} session  - 已結束的遊戲局
 * @param {number} totalPausedMs - 總暫停毫秒數
 * @returns {ScoreRecord}        - 含 coinsEarned = floor(score / 10)
 */
function buildScoreRecord(session, totalPausedMs): ScoreRecord
```

---

## 模組：Timer

```javascript
/**
 * 建立計時器
 * @param {number}   durationSec  - 倒數秒數（預設 30）
 * @param {Function} onTick       - 每秒呼叫，參數為剩餘秒數 (remaining: number)
 * @param {Function} onExpire     - 時間歸零時呼叫
 * @returns {TimerHandle}
 */
function createTimer(durationSec, onTick, onExpire): TimerHandle

/**
 * TimerHandle 介面
 */
interface TimerHandle {
  start():  void   // 啟動計時
  pause():  void   // 凍結剩餘時間
  resume(): void   // 從剩餘時間繼續
  stop():   void   // 停止並清除 interval
  getRemainingMs(): number  // 取得剩餘毫秒數
  addTime(sec: number): void // 延長計時（道具 +10秒用）
}
```

---

## 模組：GameSession（陣列新增）

```javascript
/**
 * 跳過目前題目，不扣血但連答歸零
 * @param {GameSession} session
 * @returns {void}  - session.questions 最後一題 result 設為 'skipped'
 */
function skipQuestion(session): void
```

同模組已有函式行為變更：
- `answerQuestion(session, selectedAnswer)` 現在設定 `q.gained`（得分）且更新 `session.streak`

---

## 模組：CoinStorage

```javascript
// 金幣與道具庫存管理（localStorage 持久化）

/** 取得總金幣數 */
function getCoins(): number

/** 增加金幣，回傳最新金幣數 */
function addCoins(n: number): number

/**
 * 扣減金幣（購買用）
 * @returns {boolean} - 金幣足夠則扣減並回傳 true；不足回傳 false
 */
function spendCoins(n: number): boolean

/** 取得庫存物件 `{ [itemId]: number }` */
function getInventory(): Record<string, number>

/** 增加一個道具至庫存 */
function addItem(itemId: string): void

/**
 * 使用一個道具（庫存 -1）
 * @returns {boolean} - 有庫存則消耗並回傳 true；無庫存回傳 false
 */
function useItem(itemId: string): boolean

/** 可用道具常數 */
const SHOP_ITEMS: Array<{ id: string, icon: string, name: string, price: number }>
```

---

## 模組：Storage

```javascript
/**
 * 讀取排行榜（依分數降序，最多 10 筆）
 * @returns {LeaderboardEntry[]}  - 可能為空陣列
 */
function getLeaderboard(): LeaderboardEntry[]

/**
 * 新增一筆成績至排行榜，自動排序並截斷至 10 筆
 * @param {ScoreRecord} record
 */
function saveToLeaderboard(record: ScoreRecord): void

/**
 * 清空排行榜（測試用）
 */
function clearLeaderboard(): void
```

---

## 模組：CsvExporter

```javascript
/**
 * 將成績轉換為 CSV 字串並觸發瀏覽器下載
 * @param {ScoreRecord} record - 成績記錄
 * @returns {void}
 * 
 * 副作用：觸發檔案下載，檔名格式 game_score_YYYYMMDD_HHMMSS.csv
 * 編碼：UTF-8 with BOM（確保 Excel 正確顯示繁中）
 */
function downloadScoreCsv(record: ScoreRecord): void

/**
 * （純函式，可單元測試）將成績轉換為 CSV 字串
 * @param {ScoreRecord} record
 * @returns {string}  - CSV 內容字串（含標頭列）
 */
function buildCsvContent(record: ScoreRecord): string

/**
 * （純函式）依成績記錄時間產生檔名
 * @param {string} datetime - 格式 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}        - 格式 'game_score_YYYYMMDD_HHMMSS.csv'
 */
function buildCsvFilename(datetime: string): string
```

---

## 畫面路由事件（CustomEvent）

各 UI 模組透過 `CustomEvent` 通知 `main.js` 切換畫面，以降低模組間直接依賴。

| 事件名稱 | 觸發時機 | `detail` 資料 |
|---------|---------|--------------|
| `game:start` | 玩家輸入名稱點選開始 | `{ playerName: string }` |
| `game:over` | 生命歸零或完成 50 題 | `{ session: GameSession, totalPausedMs: number }` |
| `game:restart` | 結束畫面點選「再玩一次」 | `{}` |
| `nav:leaderboard` | 點選「查看排行榜」 | `{}` |
| `nav:home` | 排行榜點選返回 | `{}` |
| `nav:shop` | 首頁/結果點選進入商店 | `{}` |
