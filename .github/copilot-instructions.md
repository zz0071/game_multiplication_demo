# game_multiplication_demo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-25

## Active Technologies

- HTML5 / CSS3 / JavaScript (ES2020+，ES Modules) + 無外部框架；CSS Animation 實作動畫效果 (001-multiplication-game)
- localStorage（排行榜、金幣、道具庫存持久化）；Blob + URL.createObjectURL（CSV 下載）(001-multiplication-game)
- `performance.now()` 精確計時器暫停機制；`Timer.addTime()` 道具延時 (001-multiplication-game)
- **Web Audio API**（`AudioContext` 即時合成音效，不依賴外部音檔）(001-multiplication-game)
- **連答倍率系統**（3連答 ×1.5、5連答 ×2.0、10連答 ×3.0）；速度加分（≤5秒 +8、≤10秒 +5、≤20秒 +2）(001-multiplication-game)
- **金幣兌換商店**（CoinStorage.js 管理累積金幣與道具庫存，跨局持久化）(001-multiplication-game)

## Project Structure

```text
index.html
css/
├── main.css
├── game.css
└── result.css          ← 含商店畫面樣式
js/
├── main.js
├── game/        ← 業務邏輯（QuestionGenerator, GameSession, Timer, Scoring）
├── ui/          ← 畫面控制（HomeScreen, GameScreen, PauseOverlay, ResultScreen, LeaderboardScreen, Animations, ShopScreen）
├── data/        ← 儲存與匯出（Storage, CsvExporter, CoinStorage）
└── audio/       ← 音效管理（AudioManager — Web Audio API 合成）
assets/
├── images/
└── audio/       ← MP3 佔位符（實際音效由 AudioManager 合成，不依賴檔案）
```

## Commands

本機開發（須透過 HTTP 伺服器，不可直接用 file://）：
- VS Code Live Server（推薦）
- `npx serve .`
- `python -m http.server 8000`

部署：GitHub Pages（靜態，無需建構步驟）

## Code Style

HTML5 / CSS3 / JavaScript (ES2020+，ES Modules):
- 所有使用者可見文字以繁體中文顯示
- 程式碼識別碼（變數、函式、類別）用英文命名
- 業務邏輯注解以繁體中文撰寫
- ES Module 相對引入**必須包含副檔名**（`import './Timer.js'`）
- `game/` 目錄內的函式不得直接操作 DOM，確保可獨立測試
- 計時器使用 `performance.now()` 實作暫停機制，禁止用「重設秒數」替代

## Recent Changes

- 001-multiplication-game: 計畫完成（2026-04-05）— 純前端乘法遊戲，ES Modules 架構，含計時器暫停、localStorage 排行榜、CSV 下載（Blob）、CSS Animation 動畫、GitHub Pages 部署
- 001-multiplication-game: 實作完成（2026-04-05）— T001–T028 全部完成；建立 22 個程式碼檔案（index.html、3 個 CSS、14 個 JS 模組、3 個 SVG、README）
- 001-multiplication-game: 音效系統（2026-04-25）— AudioManager.js 改用 Web Audio API 即時合成 5 種音效（答對琶音、答錯鋸齒波、過關勝利、遊戲結束、8-bit BGM 循環）；HUD 加入 BGM 🔊/🔇 開關按鈕
- 001-multiplication-game: UI 多巴胺優化（2026-04-25）— 彩虹流動標題、6 色霓虹選項卡、連答火焰顯示、分數浮現特效（+N 分）、過關彩帶紙屑、計時條漸層加粗、星等逐顆彈跳動畫、動態彩色星空背景
- 001-multiplication-game: 關卡/積分/商店系統（2026-04-25）— 連答倍率（×1.5/2.0/3.0）、速度加分、10 段關卡名稱、金幣系統（分數÷10=金幣）、跨局 localStorage、4 種道具商店（+命/跳題/排除/+時間）、遊戲內道具欄即時使用

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
