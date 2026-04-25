# Data Model: 太空射擊風格乘法練習網頁遊戲

**Date**: 2026-04-05  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

---

## 實體定義

### 1. GameSession（遊戲局）

代表玩家正在進行的一局完整遊戲。僅存於 JavaScript 記憶體中，不做持久化。

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `playerName` | `string` | 玩家輸入名稱；空白時預設 `"玩家"` | 最長 20 字元 |
| `startTime` | `number` | `Date.now()` 毫秒時間戳，局開始時記錄 | 正整數 |
| `currentStage` | `number` | 目前關卡（1–10） | 1 ≤ n ≤ 10 |
| `currentQuestionIndex` | `number` | 本關第幾題（0–4） | 0 ≤ n ≤ 4 |
| `totalQuestionIndex` | `number` | 全局第幾題（0–49） | 0 ≤ n ≤ 49 |
| `score` | `number` | 目前累積分數 | ≥ 0 |
| `lives` | `number` | 剩餘生命值（初始 10） | 0 ≤ n ≤ 10 || `streak` | `number` | 目前連答數；答錯/超時/跳題歸零 | ≥ 0 || `questions` | `Question[]` | 本局所有已出現的題目記錄 | 長度 0–50 |
| `isPaused` | `boolean` | 目前是否暫停中 | — |
| `pausedAt` | `number \| null` | 暫停時的 `performance.now()`；未暫停時為 `null` | — |

**State Transitions**:
```
IDLE → PLAYING → PAUSED → PLAYING → STAGE_COMPLETE → PLAYING → ...
                                                              ↘ GAME_OVER
```

---

### 2. Question（題目）

代表單一乘法算式及其答題記錄。

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `stage` | `number` | 所屬關卡（1–10） | 1 ≤ n ≤ 10 |
| `indexInStage` | `number` | 關卡內題號（0–4） | 0 ≤ n ≤ 4 |
| `multiplicand` | `number` | 被乘數 | 0 ≤ n ≤ 99 |
| `multiplier` | `number` | 乘數 | 0 ≤ n ≤ 99 |
| `correctAnswer` | `number` | 正確答案（= multiplicand × multiplier） | 0 ≤ n ≤ 999 |
| `options` | `number[]` | 6 個選項（含正確答案），已隨機排列 | 長度 = 6，無重複，所有 > 0 |
| `playerAnswer` | `number \| null` | 玩家選擇的答案；超時為 `null` | — |
| `result` | `'correct' \| 'wrong' \| 'timeout' \| 'skipped'` | 答題結果 | — |
| `timeUsedSec` | `number` | 答題耗時（秒），超時 = 30 | 0 ≤ n ≤ 30 |
| `gained` | `number` | 本題得分（含速度/連答加成） | ≥ 0 |

---

### 3. ScoreRecord（成績記錄）

代表一局結束後儲存至排行榜及 CSV 的最終成績。

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `playerName` | `string` | 玩家名稱 | 非空字串 |
| `score` | `number` | 總分 | 0 ≤ n ≤ 1500 |
| `stars` | `number` | 星等（1–10） | 1 ≤ n ≤ 10 |
| `correctCount` | `number` | 答對題數 | 0 ≤ n ≤ 50 |
| `wrongCount` | `number` | 答錯/超時題數 | 0 ≤ n ≤ 50 |
| `durationSec` | `number` | 完成時間（秒，不含暫停） | > 0 |
| `datetime` | `string` | 記錄時間，格式 `YYYY-MM-DD HH:mm:ss` | ISO 日期字串 |
| `date` | `string` | 日期部分，格式 `YYYY-MM-DD`（排行榜顯示用） | — |
| `coinsEarned` | `number` | 本局獲得金幣（= score ÷ 10） | ≥ 0 |

---

### 4. LeaderboardEntry（排行榜條目）

LocalStorage 中儲存的物件格式，與 ScoreRecord 相同結構，另加排名欄位（顯示時計算，不儲存）。

**localStorage key**: `'multiplicationGame_leaderboard'`  
**儲存**: JSON 陣列，按 `score` 降序，最多 10 筆

---

### 5. CoinRecord（金幣與道具）

跨局累積金幣與道具庫存。

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|------|
| `coins` | `number` | 累積金幣數 | ≥ 0 |
| `inventory` | `{ [itemId]: number }` | 各道具庫存數量 | 各 value ≥ 0 |

**localStorage keys**:
- `'mgame_coins'` — 金幣總數
- `'mgame_items'` — JSON 物件（道具庫存）

**可用道具 ID**:

| id | 圖標 | 名稱 | 價格 | 效果 |
|----|------|------|------|------|
| `extraLife` | 🛡️ | +1 生命 | 20 金幣 | 立刻補充一條生命 |
| `skipQ` | ⏩ | 跳過本題 | 30 金幣 | 跳過一題，不扣血 |
| `eliminate` | 💡 | 排除錯誤 | 15 金幣 | 消去一個錯誤選項 |
| `timeBonus` | ⏱️ | +10 秒 | 25 金幣 | 本題計時延長 10 秒 |

---

## 計算規則

### 計分

```
基礎分數: base = 10
速度加分: ≤5秒 +8 / ≤10秒 +5 / ≤20秒 +2 / 其他 0
連答倍率: streak≥3 ×1.5 / ≥5 ×2.0 / ≥10 ×3.0
本題得分: gained = round((base + speedBonus) × mult)
總分上限: 1500
答錯/超時/跳題: score 不變，lives -= 1（跳題不扣血）
金幣計算: coinsEarned = floor(score ÷ 10)
```

### 星等換算

| 星等 | 分數範圍 |
|------|---------|
| 10 ⭐ | 451–500 |
| 9 ⭐  | 401–450 |
| 8 ⭐  | 351–400 |
| 7 ⭐  | 301–350 |
| 6 ⭐  | 251–300 |
| 5 ⭐  | 201–250 |
| 4 ⭐  | 151–200 |
| 3 ⭐  | 101–150 |
| 2 ⭐  | 51–100  |
| 1 ⭐  | 0–50    |

```javascript
function calcStars(score) {
  return Math.min(10, Math.max(1, Math.ceil(score / 50)));
}
```

### 關卡難度對應

| 關卡 | 被乘數 | 乘數 |
|------|-------|------|
| 1–2  | 10–30 | 1–3  |
| 3–4  | 20–50 | 2–5  |
| 5–6  | 30–70 | 3–7  |
| 7–8  | 40–90 | 4–8  |
| 9–10 | 50–99 | 5–9  |

### CSV 檔名格式

```
game_score_YYYYMMDD_HHMMSS.csv
// 例: game_score_20260405_143025.csv
```

### 完成時間計算

```
durationSec = (Date.now() - startTime) / 1000 - totalPausedSec
```
（`totalPausedSec` 為各次暫停時長累計，單位秒）
