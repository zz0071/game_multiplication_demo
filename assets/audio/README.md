# 音效資源說明

## 格式需求

所有音效檔案請使用 **MP3 格式**，建議品質與大小限制：

| 檔案名稱 | 用途 | 建議時長 | 建議大小 |
|---------|------|---------|---------|
| `bgm.mp3` | 背景音樂（循環播放） | 60–120 秒 | ≤ 500 KB |
| `correct.mp3` | 答對音效 | 0.5–1 秒 | ≤ 50 KB |
| `wrong.mp3` | 答錯/超時音效 | 0.5–1 秒 | ≤ 50 KB |
| `stage-clear.mp3` | 關卡過關音效 | 1–2 秒 | ≤ 100 KB |
| `game-over.mp3` | 遊戲結束音效 | 1–3 秒 | ≤ 150 KB |

**總建議大小：≤ 1 MB**（確保 GitHub Pages 快速載入）

## 免費授權音效來源

以下網站提供 CC0 或免費商業授權音效：

- [freesound.org](https://freesound.org) — 需創建帳號，可篩選 CC0
- [pixabay.com/music](https://pixabay.com/music/) — 免費，無需署名
- [mixkit.co/free-sound-effects](https://mixkit.co/free-sound-effects/) — 免費，遊戲主題豐富
- [zapsplat.com](https://zapsplat.com) — 需免費帳號，適合遊戲音效

## 開發期間的佔位符

若尚未取得真實音效，可在此目錄放置靜音的 MP3 檔以避免 `AudioManager` 拋出網路錯誤：

```bash
# 使用 ffmpeg 產生 1 秒靜音 MP3（需安裝 ffmpeg）
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -q:a 9 -acodec libmp3lame silent.mp3
```

或直接從 [此處](https://github.com/anars/blank-audio) 下載空白 MP3，重新命名為所需檔名。

## 注意事項

- `AudioManager.init()` 必須在使用者**首次互動後**呼叫（瀏覽器 Autoplay Policy）
- 本遊戲在 `HomeScreen` 點選「開始遊戲」時呼叫 `AudioManager.init()`
- 若音效檔案不存在，`AudioManager.play()` 會靜默忽略錯誤，不影響遊戲功能
