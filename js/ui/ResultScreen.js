/**
 * ResultScreen.js — 成績統計畫面 UI（含錯題回顧與 CSV 下載）
 * T013 基礎版 + T019 擴充版（US3）合併實作
 * @module ResultScreen
 */

import { downloadScoreCsv } from '../data/CsvExporter.js';
import { addCoins, getCoins } from '../data/CoinStorage.js';

export class ResultScreen {
  /**
   * @param {HTMLElement} container - #screen-result 元素
   */
  constructor(container) {
    this._el          = container;
    this._starsEl     = container.querySelector('#stars-display');
    this._statsEl     = container.querySelector('#score-stats');
    this._wrongEl     = container.querySelector('#wrong-answers');
    this._csvBtn      = container.querySelector('#btn-download-csv');
    this._lbBtn       = container.querySelector('#btn-view-leaderboard');
    this._restartBtn  = container.querySelector('#btn-restart');

    this._record = null;

    this._csvBtn.addEventListener('click', () => {
      if (this._record) downloadScoreCsv(this._record);
    });

    this._lbBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('nav:leaderboard'));
    });

    this._restartBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('game:restart'));
    });
  }

  /**
   * 渲染成績統計畫面
   * @param {object} session  - 已結束的 GameSession
   * @param {object} record   - 由 buildScoreRecord 產生的 ScoreRecord
   */
  show(session, record) {
    this._record = record;
    // 將本局金幣存入 localStorage
    addCoins(record.coinsEarned || 0);

    this._renderStars(record.stars);
    this._renderStats(record);
    this._renderWrongAnswers(session.questions);
  }

  // ── 星等 ──────────────────────────────────────────────────
  _renderStars(stars) {
    let html = '';
    for (let i = 1; i <= 10; i++) {
      html += i <= stars
        ? '<span class="star-filled">⭐</span>'
        : '<span class="star-empty">☆</span>';
    }
    this._starsEl.innerHTML = html;
  }

  // ── 統計數值 ───────────────────────────────────────────────
  _renderStats(record) {
    const totalCoins = getCoins();
    this._statsEl.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">總分</span>
        <span class="stat-value stat-value--accent">${record.score}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">星等</span>
        <span class="stat-value stat-value--accent">${record.stars} ⭐</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">答對</span>
        <span class="stat-value stat-value--success">${record.correctCount} 題</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">答錯</span>
        <span class="stat-value stat-value--danger">${record.wrongCount} 題</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">完成時間</span>
        <span class="stat-value">${record.durationSec} 秒</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">玩家</span>
        <span class="stat-value" style="font-size:1rem">${_esc(record.playerName)}</span>
      </div>
      <div class="stat-item stat-item--coins">
        <span class="stat-label">本局獲得</span>
        <span class="stat-value stat-value--coins">💰 +${record.coinsEarned || 0} 金幣</span>
      </div>
      <div class="stat-item stat-item--coins">
        <span class="stat-label">累積金幣</span>
        <span class="stat-value stat-value--coins">💰 ${totalCoins} 金幣</span>
      </div>
    `;
  }

  // ── 錯題回顧（US3）──────────────────────────────────────────
  _renderWrongAnswers(questions) {
    const wrong = questions.filter(q => q.result !== 'correct');

    if (wrong.length === 0) {
      this._wrongEl.innerHTML = '<div class="all-correct-msg">🎉 本局全部答對！</div>';
      return;
    }

    const items = wrong.map(q => {
      const playerAns = q.playerAnswer !== null ? q.playerAnswer : '（超時）';
      return `
        <div class="wrong-item">
          <span class="wrong-item-stage">關卡 ${q.stage}</span>
          <span class="wrong-item-q">${q.multiplicand} × ${q.multiplier}</span>
          <span class="wrong-item-player">你：${playerAns}</span>
          <span class="wrong-item-correct">正確：${q.correctAnswer}</span>
        </div>
      `;
    }).join('');

    this._wrongEl.innerHTML = `
      <h3 class="wrong-answers-title">📋 錯題回顧（${wrong.length} 題）</h3>
      <div class="wrong-list">${items}</div>
    `;
  }
}

/** 簡單 HTML 跳脫，避免 XSS */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
