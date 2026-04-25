/**
 * HomeScreen.js — 首頁 UI
 * 處理名稱輸入並在玩家準備好後派發 game:start 事件
 * @module HomeScreen
 */

export class HomeScreen {
  /**
   * @param {HTMLElement} container - #screen-home 元素
   */
  constructor(container) {
    this._el      = container;
    this._nameEl  = container.querySelector('#player-name');
    this._startEl = container.querySelector('#btn-start');
    this._lbEl    = container.querySelector('#btn-leaderboard-home');

    this._bindEvents();
  }

  _bindEvents() {
    this._startEl.addEventListener('click', () => this._onStart());

    // 按 Enter 也可開始
    this._nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._onStart();
    });

    // 點選排行榜按鈕
    this._lbEl.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('nav:leaderboard'));
    });

    // 點選商店按鈕
    const shopBtn = this._el.querySelector('#btn-shop-home');
    if (shopBtn) {
      shopBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('nav:shop'));
      });
    }
  }

  _onStart() {
    const playerName = this._nameEl.value.trim() || '玩家';
    document.dispatchEvent(
      new CustomEvent('game:start', { detail: { playerName } })
    );
  }
}
