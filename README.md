# 🚀 太空乘法大戰

純前端乘法練習網頁遊戲，適合國小學齡兒童，採太空射擊視覺主題設計。

## ✨ 功能特色

- **10 個關卡**：每關 5 題，難度遞增（乘數範圍從 10×1 到 99×9）
- **計時挑戰**：每題 30 秒倒數，支援暫停/繼續
- **生命系統**：10 條全局生命值，答錯扣 1 條
- **成績評分**：1–10 星等評價，總分 0–500 分
- **錯題回顧**：遊戲結束後查看所有答錯題目
- **本機排行榜**：localStorage 儲存前 10 名成績
- **CSV 匯出**：下載成績至本機（BOM UTF-8 編碼）
- **動畫音效**：CSS @keyframes 動畫 + 背景音樂與音效
- **響應式設計**：支援桌面與行動裝置（360px / 768px / 1920px）

## 🛠️ 技術堆疊

- **HTML5 / CSS3 / JavaScript (ES2020+)**
- **ES Modules**（原生瀏覽器支援，無需建構工具）
- **Pure Frontend**（無後端、無框架、無 CDN 依賴）
- **localStorage**（排行榜持久化）
- **Blob API + URL.createObjectURL**（CSV 下載）
- **performance.now()**（精確計時器暫停機制）

## 📁 專案結構

game_multiplication_demo/
├── index.html # 遊戲入口
├── css/
│ ├── main.css # 全域樣式與 CSS 變數
│ ├── game.css # 遊戲主畫面與動畫
│ └── result.css # 成績與排行榜畫面
├── js/
│ ├── main.js # 程式進入點與畫面路由
│ ├── game/ # 業務邏輯模組（不操作 DOM）
│ │ ├── Timer.js # 倒數計時器（支援暫停）
│ │ ├── QuestionGenerator.js # 題目生成與難度表
│ │ ├── Scoring.js # 計分與星等換算
│ │ └── GameSession.js # 遊戲局狀態管理
│ ├── ui/ # 畫面控制器
│ │ ├── HomeScreen.js
│ │ ├── GameScreen.js
│ │ ├── PauseOverlay.js
│ │ ├── ResultScreen.js
│ │ ├── LeaderboardScreen.js
│ │ └── Animations.js
│ ├── data/ # 資料儲存與匯出
│ │ ├── Storage.js # localStorage 封裝
│ │ └── CsvExporter.js # CSV 字串產生與下載
│ └── audio/
│ └── AudioManager.js # 音效管理（5 種音效）
├── assets/
│ ├── images/ # SVG 圖示（3 個）
│ │ ├── player-ship.svg
│ │ ├── enemy-ship.svg
│ │ └── heart.svg
│ └── audio/ # 音效檔案（需自行放置）
│ └── README.md # 音效格式與來源說明
└── specs/ # 設計文件（spec.md, plan.md, tasks.md）



## 🚀 啟動專案

⚠️ **重要**：不可直接雙擊 `index.html` 開啟（`file://` 協定無法載入 ES Modules），必須透過 HTTP 伺服器執行。

### 方式 1 — npx serve（推薦，無需安裝）

```bash
cd c:\ZZ0071\VSCODE\game_multiplication_demo
npx serve .

啟動後開啟瀏覽器至 http://localhost:8000

方式 2 — Python

cd c:\ZZ0071\VSCODE\game_multiplication_demo
python -m http.server 8000

啟動後開啟 http://localhost:8000

方式 3 — VS Code Live Server（最快）
安裝 VS Code 擴充功能：Live Server
在 index.html 右鍵 → Open with Live Server
瀏覽器自動開啟 http://127.0.0.1:5500
🎵 音效設定（選用）
遊戲需要 5 個音效檔案（MP3 格式）：

檔案名稱	用途
bgm.mp3	背景音樂（循環）
correct.mp3	答對音效
wrong.mp3	答錯音效
stage-clear.mp3	過關音效
game-over.mp3	結束音效
放置位置：audio 目錄

音效來源與格式說明：詳見 README.md

若音效檔案缺失，遊戲仍可正常運作（AudioManager 會靜默忽略錯誤）

🎮 遊戲操作
首頁：輸入玩家名稱（可留空，預設「玩家」）→ 點選「開始遊戲」
遊戲中：
看到算式（如 23 × 4 = ?）後，從 6 個選項中點選正確答案
每題限時 30 秒，答對 +10 分，答錯或超時扣 1 條生命
點選右上角 ⏸ 可暫停（計時凍結，不計入完成時間）
結束畫面：查看星等、錯題回顧、下載 CSV、進入排行榜
🧪 開發與測試
驗證純函式（console.assert）
業務邏輯模組（game/ 目錄）均為純函式設計，可在瀏覽器 Console 驗證：

// 開啟瀏覽器 DevTools → Console
import { calcStars } from './js/game/Scoring.js';
console.assert(calcStars(500) === 10, 'calcStars 500 → 10');
console.assert(calcStars(0)   === 1,  'calcStars 0 → 1');


效能驗證（SC-007）
開啟 DevTools → Performance 面板
點選「Record」→ 遊戲中點選選項 → 停止錄製
確認「點擊事件 → 回饋動畫顯示」時間 ≤ 200ms


📦 部署至 GitHub Pages
# 1. 建立 GitHub repo
git init
git add .
git commit -m "Initial commit: 太空乘法大戰"
git branch -M main
git remote add origin https://github.com/你的帳號/game_multiplication_demo.git
git push -u origin main

# 2. 啟用 GitHub Pages
# 至 repo Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save

部署後網址：https://你的帳號.github.io/game_multiplication_demo/

📄 授權
本專案為教學示範用途，程式碼部分採 MIT License，圖示與音效資源請自行確認授權條款。

🔗 相關文件
功能規格 (spec.md)
實作計畫 (plan.md)
任務清單 (tasks.md)
快速開始 (quickstart.md)


---

**建立方式**：
1. 在專案根目錄新增檔案 `README.md`
2. 複製上述內容貼上並儲存 ---

**建立方式**：
1. 在專案根目錄新增檔案 `README.md`
2. 複製上述內容貼上並儲存 