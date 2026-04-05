/**
 * PauseOverlay.js — 暫停遮罩 UI 控制器（T016）
 * 顯示/隱藏遮罩並透過回呼通知外部繼續遊戲
 * @module PauseOverlay
 */

export class PauseOverlay {
  /**
   * @param {HTMLElement} overlayEl    - #pause-overlay 元素
   * @param {HTMLElement} resumeBtnEl  - #btn-resume 元素
   */
  constructor(overlayEl, resumeBtnEl) {
    this._overlayEl = overlayEl;
    this._resumeBtn = resumeBtnEl;

    /** 繼續時的回呼，由 GameScreen 設定 */
    this.onResume = null;

    this._resumeBtn.addEventListener('click', () => {
      if (typeof this.onResume === 'function') this.onResume();
    });
  }

  /** 顯示暫停遮罩 */
  show() {
    this._overlayEl.classList.remove('pause-overlay--hidden');
    this._resumeBtn.focus();
  }

  /** 隱藏暫停遮罩 */
  hide() {
    this._overlayEl.classList.add('pause-overlay--hidden');
  }
}
