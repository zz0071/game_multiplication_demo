# Implementation Plan: 太空射擊風格乘法練習網頁遊戲

**Branch**: `001-multiplication-game` | **Date**: 2026-04-05 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-multiplication-game/spec.md`  
**Argument**: 用純前端工具

## Summary

以純靜態 HTML/CSS/JavaScript 實作一款太空射擊風格的乘法練習網頁遊戲，供國小學齡兒童使用。玩家透過首頁輸入名稱後，進行 10 個關卡（每關 5 題，共 50 題）的乘法選擇題挑戰，含 30 秒倒數計時、10 條全局生命值、暫停功能、動畫/音效回饋、遊戲結束成績統計、CSV 下載，以及 localStorage 排行榜。無任何後端或 CDN 依賴，可完整部署於 GitHub Pages。

## Technical Context

**Language/Version**: HTML5 / CSS3 / JavaScript (ES2020+，ES Modules)  
**Primary Dependencies**: 無外部框架；CSS Animation 實作動畫效果  
**Storage**: localStorage（排行榜持久化）；瀏覽器原生 Blob + URL.createObjectURL（CSV 下載）  
**Testing**: 核心業務邏輯函式設計為純函式，可用 `console.assert` 驗證；可選 Vitest 做模組測試  
**Target Platform**: GitHub Pages 靜態部署；Chrome / Edge / Firefox / Safari（桌面與行動裝置）  
**Project Type**: 純前端互動網頁應用（無後端、無 bundle 工具）  
**Performance Goals**: 答題互動回饋 ≤ 200ms；頁面初次渲染 ≤ 1.5 秒（3G）；動畫 60fps  
**Constraints**: 無後端、無 CDN、所有資源在 repo 內；離線可用；RWD（360px / 768px / 1920px）  
**Scale/Scope**: 單人本機遊玩；50 題/局；localStorage 排行榜最多 10 筆

## Constitution Check

*GATE: 在 Phase 0 研究前檢查。Phase 1 設計完成後重新確認。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. Code Quality Standards | ✅ 通過 | 採 ES Modules 分層架構；明確命名；業務邏輯加繁中注解 |
| II. Testing Discipline | ⚠️ 已調整 | 純靜態前端無標準測試框架，改為：核心函式設計為純函式（無 DOM 依賴），可直接 `console.assert` 或 Vitest 測試；業務邏輯 100% 可手動驗證 |
| III. UX Consistency | ✅ 通過 | 統一繁中介面；按鈕狀態明確（disabled/enabled）；過渡動畫 >200ms 均有視覺回饋 |
| IV. Performance Requirements | ✅ 通過 | 無 API 請求；所有計算在本機；計時器用 `performance.now()` 精確實作 |
| V. Documentation Language | ✅ 通過 | 所有文件以繁體中文；程式碼識別碼用英文，業務邏輯注解繁中 |

**Constitution Check 結論**：Testing Discipline 在純靜態前端環境下已合理調整並記錄。無阻斷性違規。

## Project Structure

### Documentation (this feature)

```text
specs/001-multiplication-game/
├── plan.md              ← 此檔案
├── research.md          ← Phase 0 產出
├── data-model.md        ← Phase 1 產出
├── quickstart.md        ← Phase 1 產出
├── contracts/           ← Phase 1 產出（遊戲狀態介面定義）
└── tasks.md             ← /speckit.tasks 產出（不由本指令建立）
```

### Source Code (repository root)

```text
index.html                       # 遊戲入口（首頁：名稱輸入 + 開始按鈕）
css/
├── main.css                     # 全域樣式（太空主題、RWD、字型、顏色變數）
├── game.css                     # 遊戲主畫面元件樣式（算式區、選項圖卡、生命值列）
└── result.css                   # 成績統計、排行榜畫面樣式
js/
├── main.js                      # 程式進入點、畫面路由切換（home/game/result/leaderboard）
├── game/
│   ├── QuestionGenerator.js     # 題目產生（依關卡難度）、干擾選項生成、答案過濾
│   ├── GameSession.js           # 遊戲局狀態管理（生命值、分數、關卡進度）
│   ├── Timer.js                 # 倒數計時器（支援 pause/resume，用 performance.now()）
│   └── Scoring.js               # 計分規則（答對 +10，星等換算）
├── ui/
│   ├── HomeScreen.js            # 首頁 UI（名稱輸入、開始按鈕）
│   ├── GameScreen.js            # 遊戲主畫面 UI（算式、6 選項圖卡、生命值、暫停鍵）
│   ├── PauseOverlay.js          # 暫停遮罩（凍結計時，顯示繼續按鈕）
│   ├── ResultScreen.js          # 結束統計畫面（星等、錯題回顧、CSV 下載、排行榜連結）
│   ├── LeaderboardScreen.js     # 排行榜畫面（前 10 名）
│   └── Animations.js            # 動畫控制（擊落、受損、過關慶祝）
├── data/
│   ├── Storage.js               # localStorage 讀寫封裝（排行榜儲存/讀取）
│   └── CsvExporter.js           # CSV 字串產生 + Blob 下載觸發
└── audio/
    └── AudioManager.js          # 音效管理（bgm loop、答對、答錯、過關、結束）

assets/
├── images/
│   ├── player-ship.svg          # 玩家戰機圖示
│   ├── enemy-ship.svg           # 敵機（顯示算式）
│   ├── explosion.png            # 擊落動畫（可用 CSS keyframe sprite）
│   ├── heart.svg                # 生命值圖示
│   └── stars-bg.svg             # 太空背景（或 CSS 純 CSS 星空）
└── audio/
    ├── bgm.mp3                  # 背景音樂（循環）
    ├── correct.mp3              # 答對音效
    ├── wrong.mp3                # 答錯音效
    ├── stage-clear.mp3          # 過關音效
    └── game-over.mp3            # 遊戲結束音效
```

**Structure Decision**：採純前端單頁架構（SPA-like），以 ES Module 直接引入，無需 bundler。JS 按功能分三層（`game/` 業務邏輯、`ui/` 畫面控制、`data/` 儲存），確保業務邏輯與 DOM 解耦，便於獨立測試。

## Complexity Tracking

*Constitution Check 無阻斷性違規，此區塊無需填寫。*
