/**
 * CsvExporter.js — CSV 字串產生與 Blob 下載（T018）
 * 三個函式均為純函式設計（除 downloadScoreCsv 有 DOM 副作用），可獨立測試
 * @module CsvExporter
 */

/**
 * 將 ScoreRecord 轉換為 CSV 字串（含標頭列）
 * 編碼：UTF-8（呼叫端補 BOM）
 * @param {object} record - ScoreRecord
 * @returns {string} CSV 字串
 */
export function buildCsvContent(record) {
  const headers = ['日期時間', '玩家名稱', '總分', '答對題數', '答錯題數', '完成時間(秒)', '星星等級'];
  const values  = [
    record.datetime,
    record.playerName,
    record.score,
    record.correctCount,
    record.wrongCount,
    record.durationSec,
    record.stars,
  ];

  // 逸出含逗號或換行的欄位
  const escape = val => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  return [
    headers.map(escape).join(','),
    values.map(escape).join(','),
  ].join('\r\n');
}

/**
 * 依成績記錄時間產生檔名
 * 將 'YYYY-MM-DD HH:mm:ss' 轉為 'game_score_YYYYMMDD_HHMMSS.csv'
 * @param {string} datetime - 格式 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}
 */
export function buildCsvFilename(datetime) {
  // 移除所有非數字字元，再取前 15 碼（YYYYMMDDHHMMSS）
  const digits = datetime.replace(/\D/g, '');          // '20260405143025'
  const datePart = digits.slice(0, 8);                 // '20260405'
  const timePart = digits.slice(8, 14);                // '143025'
  return `game_score_${datePart}_${timePart}.csv`;
}

/**
 * 建立 BOM UTF-8 Blob 並觸發 <a> 下載（DOM 副作用）
 * @param {object} record - ScoreRecord
 */
export function downloadScoreCsv(record) {
  const content  = buildCsvContent(record);
  const filename = buildCsvFilename(record.datetime);

  // BOM（EF BB BF）確保 Excel 正確顯示繁體中文
  const bom  = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 延遲釋放 URL 物件記憶體
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
