/**
 * Storage.js — localStorage 讀寫封裝（T020）
 * 管理排行榜資料，按分數降序排列，最多保留 10 筆
 * @module Storage
 */

const STORAGE_KEY = 'multiplicationGame_leaderboard';
const MAX_ENTRIES = 10;

/**
 * 讀取排行榜（依分數降序，最多 10 筆）
 * @returns {object[]} LeaderboardEntry 陣列（空陣列表示無資料）
 */
export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    // JSON 損毀時回傳空陣列，不拋出例外
    return [];
  }
}

/**
 * 新增一筆成績至排行榜，自動排序並截斷至 10 筆後存回
 * @param {object} record - ScoreRecord
 */
export function saveToLeaderboard(record) {
  const entries = getLeaderboard();
  entries.push(record);
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // 儲存失敗（例如無痕視窗容量滿）時靜默忽略
  }
}

/**
 * 清空排行榜（測試與除錯用途）
 */
export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}
