# Tasks: 太空射擊風格乘法練習網頁遊戲

**Input**: Design documents from `/specs/001-multiplication-game/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅  
**Date**: 2026-04-05  
**Branch**: `001-multiplication-game`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可與其他 [P] 任務平行執行（不同檔案、無依賴）
- **[Story]**: 所屬使用者故事標籤（US1–US4）
- 所有任務包含明確檔案路徑

---

## Phase 1: Setup（專案初始化）

**Purpose**: 建立目錄結構與基本 HTML 骨架，供所有使用者故事使用

- [X] T001 建立專案目錄結構（index.html / css/ / js/game/ / js/ui/ / js/data/ / js/audio/ / assets/images/ / assets/audio/）
- [X] T002 [P] 建立 index.html — 含 `<script type="module" src="./js/main.js">` 與所有畫面的 HTML 容器（`#screen-home`、`#screen-game`、`#screen-result`、`#screen-leaderboard`），初始隱藏非首頁
- [X] T003 [P] 建立 css/main.css — CSS 自訂屬性（顏色、字型、間距變數）、太空主題全域樣式、RWD Media Query 基礎（360px / 768px 斷點）

**Checkpoint**: 目錄結構與入口 HTML 就緒，可開始業務邏輯開發

---

## Phase 2: Foundational（核心業務邏輯，所有故事的必要基礎）

**Purpose**: 業務邏輯模組需先於所有 UI 完成，確保可獨立驗證

**⚠️ CRITICAL**: 所有使用者故事的 UI 開發均依賴此 Phase 完成

- [X] T004 實作 js/game/Timer.js — `createTimer(durationSec, onTick, onExpire)` 回傳 `{ start, pause, resume, stop, getRemainingMs }`；使用 `performance.now()` 追蹤剩餘時間，不以重設秒數替代
- [X] T005 [P] 實作 js/game/QuestionGenerator.js — `generateQuestion(stage)`、`generateDistractors(correctAnswer)`、`shuffleOptions(options)`；含關卡難度對應表（關卡 1–2：10–30 × 1–3，…，9–10：50–99 × 5–9）與乘積 ≤ 999 過濾
- [X] T006 [P] 實作 js/game/Scoring.js — `calcStars(score)` 依分段回傳 1–10；`buildScoreRecord(session, totalPausedMs)` 從 GameSession 建立 ScoreRecord；計分規則：答對 +10，總分上限 500
- [X] T007 實作 js/game/GameSession.js — 管理遊戲局狀態（playerName、score、lives=10、currentStage、totalQuestionIndex、questions[]、isPaused、pausedAt）；提供 `answerQuestion(answer)`、`nextQuestion()`、`isGameOver()`、`isComplete()` 方法；依賴 T005、T006
- [X] T008 [P] 實作 js/main.js — 畫面路由切換函式 `showScreen(name)`（home/game/result/leaderboard）；監聽 CustomEvent `game:start`、`game:over`、`game:restart`、`nav:leaderboard`、`nav:home`

**Checkpoint**: 業務邏輯核心完成，可在 console 驗證 `calcStars`、`generateQuestion`、`shuffleOptions` 等純函式

---

## Phase 3: User Story 1 — 玩家完成一局完整乘法遊戲 (Priority: P1) 🎯 MVP

**Goal**: 玩家可從首頁輸入名稱 → 進行 10 關 50 題 → 看到成績統計畫面

**Independent Test**: 開啟遊戲 → 輸入名稱 → 完成一局 50 題 → 確認最終分數與星等顯示正確

### Implementation for User Story 1

- [X] T009 [US1] 實作 js/ui/HomeScreen.js — 渲染首頁（名稱輸入欄位、預設值「玩家」、「開始遊戲」按鈕）；名稱為空時使用預設值；點選後派發 `game:start` CustomEvent 含 `{ playerName }`
- [X] T010 [P] [US1] 建立 css/game.css — 遊戲主畫面版面（算式區敵機樣式、6 個選項圖卡 Grid 版面、生命值圖示列、計時進度條、暫停按鈕）；太空射擊視覺主題、RWD 適配
- [X] T011 [US1] 實作 js/ui/GameScreen.js — 渲染遊戲主畫面；顯示算式（被乘數 × 乘數 = ？）於敵機元素；渲染 6 個選項圖卡並綁定點擊事件；更新生命值圖示列、倒數進度條；處理答題回饋流程（答對/答錯/超時後延遲進入下一題）；使用 Timer（T004）、GameSession（T007）；依賴 T010
- [X] T012 [US1] 實作 js/ui/Animations.js — `playCorrect(enemyEl)`（CSS class `exploding` + animationend 清除）；`playWrong(shipEl)`（CSS class `shaking`）；`playStageClear()`（過關慶祝動畫覆層）；`playGameOver()`（淡入效果）；依賴 css/game.css 中的 @keyframes 定義
- [X] T013 [US1] 實作 js/ui/ResultScreen.js（基礎版）— 渲染星等（1–10 顆星）、總分、答對題數、答錯題數、完成時間；「再玩一次」按鈕派發 `game:restart`；建立 css/result.css 版面；依賴 T006（Scoring）
- [X] T014 [US1] 整合 GameSession + GameScreen + ResultScreen — 在 main.js 中監聽 `game:start`/`game:over`，協調初始化 GameSession、啟動 GameScreen、結束後切換 ResultScreen；依賴 T007、T009、T011、T013
- [X] T015 [P] [US1] 新增 assets/images/ 基礎視覺資源 — player-ship.svg（玩家戰機）、enemy-ship.svg（敵機/算式容器）、heart.svg（生命値圖示）、explosion.png（擊落動畫幀）、stars-bg.svg 或 CSS 純星空背景

**Checkpoint**: US1 完整可測 — 可從首頁到結束畫面完成一局遊戲，分數與星等正確計算

---

## Phase 4: User Story 2 — 遊戲暫停與繼續 (Priority: P2)

**Goal**: 遊戲進行中玩家可暫停/繼續，倒數凍結且不計入完成時間

**Independent Test**: 遊戲進行中按暫停 → 確認倒數停止、無法選答案 → 按繼續 → 確認從剩餘秒數繼續倒數

### Implementation for User Story 2

- [X] T016 [US2] 實作 js/ui/PauseOverlay.js — 渲染暫停遮罩 HTML/CSS（半透明覆層 + 「繼續」按鈕）；顯示時呼叫 `timer.pause()` 並累計 `totalPausedMs`；隱藏時呼叫 `timer.resume()`；依賴 T004（Timer）
- [X] T017 [US2] 在 GameScreen.js 中整合暫停按鈕 — 新增暫停按鈕 UI；點擊後顯示 PauseOverlay；暫停期間禁用所有選項圖卡點擊事件（`pointer-events: none`）；依賴 T011、T016

**Checkpoint**: US2 完整可測 — 暫停/繼續流程正確，完成時間不含暫停時長

---

## Phase 5: User Story 3 — 錯題回顧與 CSV 下載 (Priority: P3)

**Goal**: 結束畫面顯示所有答錯題目詳情，並可下載 CSV 成績檔

**Independent Test**: 故意答錯數題 → 進入結束畫面 → 確認錯題清單內容正確 → 點「下載成績 CSV」→ 確認 CSV 格式與內容正確

### Implementation for User Story 3

- [X] T018 [P] [US3] 實作 js/data/CsvExporter.js — `buildCsvContent(record)` 回傳含標頭列的 CSV 字串；`buildCsvFilename(datetime)` 將 `'YYYY-MM-DD HH:mm:ss'` 轉為 `'game_score_YYYYMMDD_HHMMSS.csv'`；`downloadScoreCsv(record)` 建立 BOM UTF-8 Blob 並觸發 `<a>` 下載；三個函式均為可純函式測試設計
- [X] T019 [US3] 擴充 ResultScreen.js — 新增錯題回顧區塊（全部答對時顯示「本局全部答對！」，否則顯示每筆錯題：關卡編號、算式、玩家答案、正確答案）；新增「下載成績 CSV」按鈕，點擊呼叫 `downloadScoreCsv`；依賴 T013、T018

**Checkpoint**: US3 完整可測 — 錯題顯示正確、CSV 下載含 BOM 且 Excel 可正常顯示繁中

---

## Phase 6: User Story 4 — 本機排行榜 (Priority: P4)

**Goal**: 每局成績自動儲存至 localStorage，可從排行榜查看前 10 名

**Independent Test**: 完成數局 → 點「查看排行榜」→ 確認依分數降序排列，最多 10 筆；重新整理後資料不遺失

### Implementation for User Story 4

- [X] T020 [P] [US4] 實作 js/data/Storage.js — `getLeaderboard()` 從 localStorage key `'multiplicationGame_leaderboard'` 讀取 JSON 並回傳陣列（空時回傳 `[]`）；`saveToLeaderboard(record)` 插入、依 score 降序排序、截斷至 10 筆後存回；`clearLeaderboard()` 供測試用
- [X] T021 [US4] 實作 js/ui/LeaderboardScreen.js — 渲染排行榜畫面（標題「🏆 排行榜 TOP 10」、表格含排名/玩家名稱/分數/星星/日期）；排行榜為空時顯示「尚無紀錄，快來挑戰！」；「返回首頁」按鈕派發 `nav:home`；依賴 T020
- [X] T022 [US4] 整合成績自動儲存 — 在 main.js 的 `game:over` 監聽器中，於切換 ResultScreen 前呼叫 `saveToLeaderboard(record)`；ResultScreen「查看排行榜」按鈕派發 `nav:leaderboard`；依賴 T014、T020、T021

**Checkpoint**: US4 完整可測 — 排行榜儲存/讀取正確，頁面重新整理後資料保留

---

## Phase 7: Polish（音效、視覺完整度與跨瀏覽器）

**Purpose**: 補齊音效、完整動畫、RWD 微調，提升遊戲體驗到規格標準

- [X] T023 [P] 實作 js/audio/AudioManager.js — `init()` 預載 5 個音效（需使用者首次互動後才呼叫）；`play(name)` 播放指定音效（correct/wrong/stageClear/gameOver/bgm）；`toggleBgm()` 開關背景音樂循環；音效檔放於 assets/audio/（bgm.mp3、correct.mp3、wrong.mp3、stage-clear.mp3、game-over.mp3）
- [X] T024 [P] 整合 AudioManager 至 GameScreen、ResultScreen — GameScreen 答對/答錯/超時/過關/遊戲結束時呼叫對應音效；ResultScreen 進入時播放 gameOver 音效；首次互動（開始遊戲按鈕）後啟動 bgm；依賴 T011、T013、T023
- [X] T025 [P] 補齊 CSS @keyframes 動畫 — css/game.css 中加入 `explode`（擊落）、`shake`（受損）、`stageClear`（過關慶祝）、`fadeIn`（成績統計畫面）keyframes；確認動畫時長符合規格（擊落 ≤ 500ms，成績畫面 ≤ 1s）；依賴 T010
- [X] T026 [P] RWD 完整測試與修正 — 在 360px（手機）/ 768px（平板）/ 1920px（桌面）三個寬度下確認版面正確；選項圖卡在手機上不超出螢幕；觸控事件正常觸發
- [X] T027 新增 assets/audio/ 音效資源佔位符 README — 說明音效格式需求（MP3，≤ 200KB/檔）與來源建議（免費授權音效網站）；若無真實音效則提供 silent.mp3 示範檔讓 AudioManager 不報錯
- [X] T028 [P] 效能驗證 SC-007 — 在遊戲進行中，使用瀏覽器 DevTools Performance 面板，錄製點擊選項至回饋動畫展示的時間，確認一致 ≤ 200ms；若超過則回查 GameScreen.js 動畫觸發邏輯

**Checkpoint**: 遊戲體驗完整 — 音效、動畫、RWD 均符合規格，可部署至 GitHub Pages

---

## Phase 8: 2026-04-25 功能擴充（音效 Web Audio、UI 多巴胺、關卡/積分/商店）

**Purpose**: 將今日實作的四大功能加入任務紀錄，標記為已完成

### 8A: Web Audio API 音效系統

- [X] T029 [P] 重寫 js/audio/AudioManager.js — 放棄 HTMLAudio + MP3 佔位符方案；改用 Web Audio API (`AudioContext`) 即時合成 5 種音效：答對琶音（C5→E5→G5 sine）、答錯鋸齒波（Bb4→G4）、過關勝利（C5→E5→G5→C6）、遊戲結束（G4→F4→Eb4 triangle）、8-bit BGM 循環（130BPM square wave）；`toggleBgm()` 回傳 boolean；`init()` 於首次使用者互動後建立 AudioContext
- [X] T030 [P] 在 index.html HUD 新增 BGM 開關按鈕 — `<button id="btn-bgm" class="btn btn--icon btn--bgm-on">🔊</button>`；在 `.hud-btns` wrapper 中與暫停鈕並排
- [X] T031 整合 BGM 開關至 GameScreen.js — 新增 `_onToggleBgm()` 方法；點擊後呼叫 `AudioManager.toggleBgm()`，依回傳值切換 `.btn--bgm-on`/`.btn--bgm-off` class 及按鈕文字

### 8B: UI 多巴胺優化

- [X] T032 [P] css/main.css — 新增 6 個霓虹色 CSS 自訂屬性（`--neon-cyan/pink/orange/green/yellow/purple`）；首頁標題改為彩虹流動漸層文字（`@keyframes rainbowShift`）；動態彩色星空背景（`@keyframes twinkleStars`）；強化按鈕霓虹光暈效果
- [X] T033 [P] css/game.css — 6 個選項卡改為彩色霓虹主題（CSS 自訂屬性 `--card-color/dark/mid` 搭配 nth-child）；計時條加粗至 14px 並加漸層；`.timer-bar--danger` 脈動動畫；`.hud-streak` 連答火焰顯示（3 段 CSS class：warm/hot/epic）；`.score-popup` 浮現動畫（`@keyframes scoreFloat`）；`.confetti-piece` 彩帶動畫（`@keyframes confettiFall`）
- [X] T034 [P] js/ui/Animations.js — 新增 `playScorePopup(points, anchorEl)` 建立浮現 +N 分 div；新增 `playConfetti(count)` 建立彩帶紙屑；`playStageClear()` 呼叫 `playConfetti(60)`
- [X] T035 GameScreen.js — 新增 `_updateStreakDisplay()` 更新火焰連答 HUD；答對後呼叫 `playScorePopup(q.gained, this._enemyEl)`

### 8C: 關卡名稱 & 積分系統

- [X] T036 [P] js/game/GameSession.js — 新增 `streak: 0` 欄位；`answerQuestion()` 計算速度加分（SPEED_TIERS `[[5,8],[10,5],[20,2]]`）與連答倍率（`streakMultiplier(streak)`：≥3 ×1.5、≥5 ×2.0、≥10 ×3.0）；設定 `q.gained`；新增 `skipQuestion(session)` 函式（result='skipped'，不扣血，streak=0）；MAX_SCORE 改為 1500
- [X] T037 [P] js/game/Scoring.js — `buildScoreRecord()` 加入 `coinsEarned: Math.floor(session.score / 10)`；`wrongCount` 排除 result==='skipped'
- [X] T038 GameScreen.js — 新增 `STAGE_NAMES` 陣列（10 段關卡名稱：新手→地獄）；`_loadQuestion()` 顯示關卡名稱至 HUD

### 8D: 金幣系統 & 道具商店

- [X] T039 [P] 建立 js/data/CoinStorage.js — 匯出 `getCoins()`、`addCoins(n)`、`spendCoins(n)`、`getInventory()`、`addItem(id)`、`useItem(id)`、`SHOP_ITEMS` 常數；localStorage keys `mgame_coins`/`mgame_items`
- [X] T040 [P] 建立 js/ui/ShopScreen.js — `show()` 渲染 SHOP_ITEMS grid；`_onBuy(item)` 呼叫 `spendCoins/addItem`；`_toast(msg)` 顯示購買通知；「返回」按鈕派發 `nav:home`
- [X] T041 在 index.html 新增商店畫面容器 — `#screen-shop`（含 `#shop-coins`、`#shop-items`、`#btn-back-from-shop`）；首頁新增「🏪 道具商店」按鈕 `#btn-shop-home`
- [X] T042 [P] css/result.css — 完整商店樣式（`.shop-container`、`.shop-items` grid、`.shop-item`、`.shop-buy-btn`、`.shop-toast` + `@keyframes toastIn/toastOut`）
- [X] T043 GameScreen.js — 新增道具欄 `_renderPowerups()` 渲染庫存按鈕；`_onUsePowerUp(type)` 處理 4 種道具效果（extraLife/skipQ/eliminate/timeBonus）；`_eliminateWrongOption()` 標記 `eliminated` class
- [X] T044 ResultScreen.js — 匯入 `addCoins/getCoins`；`show()` 呼叫 `addCoins(record.coinsEarned)`；`_renderStats()` 新增本局金幣與累積金幣欄位
- [X] T045 js/main.js — 匯入 `ShopScreen`；新增 `screens.shop`；監聽 `nav:shop` 事件並切換至商店畫面；HomeScreen 監聽 `#btn-shop-home`

**Checkpoint**: 2026-04-25 四大功能全部實作完成並驗證無 TypeScript/Lint 錯誤

---

## 依賴關係圖（使用者故事完成順序）

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: Timer, QuestionGenerator, Scoring, GameSession, Router)
    ↓
Phase 3 (US1: 完整遊戲核心) ← MVP 最小可展示版本
    ↓
Phase 4 (US2: 暫停)          ← 依賴 US1 的 GameScreen
Phase 5 (US3: 錯題+CSV)      ← 依賴 US1 的 ResultScreen（可與 US2 平行）
    ↓
Phase 6 (US4: 排行榜)        ← 依賴 US1 整合、US3 ScoreRecord
    ↓
Phase 7 (Polish)             ← 依賴所有 US 完成
```

**可平行執行的 Story**：US2（暫停）與 US3（錯題/CSV）互相獨立，可在 US1 完成後同時進行。

---

## 平行執行範例

### US1 完成後可同時執行

```
開發者 A: T016 → T017 (US2 暫停)
開發者 B: T018 → T019 (US3 CSV)
```

### Phase 2 完成後可同時執行

```
開發者 A: T009（HomeScreen）
開發者 B: T010（game.css）
開發者 C: T015（assets/images）
```

---

## 實作策略（MVP 優先遞增交付）

| 里程碑 | 包含 Phase | 交付物 |
|--------|-----------|--------|
| **MVP** | Phase 1–3 | 可完整遊玩一局，有成績統計畫面 |
| **v1.1** | + Phase 4 | 新增暫停功能 |
| **v1.2** | + Phase 5 | 新增錯題回顧與 CSV 下載 |
| **v1.3** | + Phase 6 | 新增排行榜 |
| **v1.0 正式版** | + Phase 7 | 音效、完整動畫、RWD，可部署 |

---

## 格式驗證

✅ 所有任務均含：
- `- [ ]` checkbox
- 任務 ID（T001–T028）
- **[P]** 標記（可平行執行者）
- **[US?]** 標記（使用者故事 Phase 任務）
- 明確檔案路徑或目錄描述
