/**
 * LeaderboardScreen.js — 排行榜畫面 UI（T021）
 * 從 localStorage 讀取歷史成績並渲染前 10 名
 * @module LeaderboardScreen
 */

import { getLeaderboard } from '../data/Storage.js';

export class LeaderboardScreen {
  /**
   * @param {HTMLElement} container - #screen-leaderboard 元素
   */
  constructor(container) {
    this._el       = container;
    this._tableEl  = container.querySelector('#leaderboard-table');
    this._backBtn  = container.querySelector('#btn-back-home');

    this._backBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('nav:home'));
    });
  }

  /** 重新讀取資料並渲染排行榜 */
  show() {
    const entries = getLeaderboard();

    if (entries.length === 0) {
      this._tableEl.innerHTML =
        '<p class="leaderboard-empty">尚無紀錄，快來挑戰！🚀</p>';
      return;
    }

    const rows = entries.map((e, idx) => {
      const rank    = idx + 1;
      const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
      const stars   = '⭐'.repeat(e.stars);
      return `
        <tr class="rank-${rank <= 3 ? rank : 'other'}">
          <td>${rankEmoji}</td>
          <td>${_esc(e.playerName)}</td>
          <td>${e.score} 分</td>
          <td>${stars}</td>
          <td>${e.date}</td>
        </tr>
      `;
    }).join('');

    this._tableEl.innerHTML = `
      <table class="leaderboard-table-el">
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th>分數</th>
            <th>星等</th>
            <th>日期</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

/** 簡單 HTML 跳脫 */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
