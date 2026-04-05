# game_multiplication_demo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-05

## Active Technologies

- HTML5 / CSS3 / JavaScript (ES2020+，ES Modules) + 無外部框架；CSS Animation 實作動畫效果 (001-multiplication-game)
- localStorage（排行榜持久化）；Blob + URL.createObjectURL（CSV 下載）(001-multiplication-game)
- `performance.now()` 精確計時器暫停機制 (001-multiplication-game)

## Project Structure

```text
index.html
css/
├── main.css
├── game.css
└── result.css
js/
├── main.js
├── game/        ← 業務邏輯（QuestionGenerator, GameSession, Timer, Scoring）
├── ui/          ← 畫面控制（HomeScreen, GameScreen, PauseOverlay, ResultScreen, LeaderboardScreen, Animations）
├── data/        ← 儲存與匯出（Storage, CsvExporter）
└── audio/       ← 音效管理（AudioManager）
assets/
├── images/
└── audio/
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

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
