/**
 * CoinStorage.js — 金幣與道具的持久化存儲
 * 金幣（💰）跨遊戲局累積，道具在商店購買、遊戲中使用
 * @module CoinStorage
 */

const COIN_KEY  = 'mgame_coins';
const ITEMS_KEY = 'mgame_items';

/** 商店道具目錄（id 唯一，順序即顯示順序） */
export const SHOP_ITEMS = [
  { id: 'extraLife', icon: '🛡️', name: '+1 生命',  desc: '立刻補充一條生命',    price: 20 },
  { id: 'skipQ',     icon: '⏩', name: '跳過本題',  desc: '跳過一題，不扣血',    price: 30 },
  { id: 'eliminate', icon: '💡', name: '排除錯誤',  desc: '消去一個錯誤選項',    price: 15 },
  { id: 'timeBonus', icon: '⏱️', name: '+10 秒',   desc: '本題計時延長 10 秒',  price: 25 },
];

/** 取得當前金幣數 */
export function getCoins() {
  return parseInt(localStorage.getItem(COIN_KEY) || '0', 10);
}

/** 新增金幣 */
export function addCoins(n) {
  if (n <= 0) return;
  try { localStorage.setItem(COIN_KEY, String(getCoins() + n)); } catch {}
}

/**
 * 花費金幣
 * @returns {boolean} 是否成功（餘額不足回傳 false）
 */
export function spendCoins(n) {
  const cur = getCoins();
  if (cur < n) return false;
  try { localStorage.setItem(COIN_KEY, String(cur - n)); } catch {}
  return true;
}

/** 取得道具庫存 { itemId: qty } */
export function getInventory() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** 加入道具庫存 */
export function addItem(itemId, qty = 1) {
  const inv = getInventory();
  inv[itemId] = (inv[itemId] || 0) + qty;
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(inv)); } catch {}
}

/**
 * 使用一個道具（庫存 -1）
 * @returns {boolean} 庫存足夠時 true
 */
export function useItem(itemId) {
  const inv = getInventory();
  if (!inv[itemId] || inv[itemId] <= 0) return false;
  inv[itemId]--;
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(inv)); } catch {}
  return true;
}
