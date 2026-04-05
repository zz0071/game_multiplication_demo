/**
 * Animations.js — 動畫控制模組
 * 透過 CSS class 觸發 @keyframes（定義於 game.css）
 * 所有動畫回傳 Promise，完成後 resolve 以利流程等待
 * @module Animations
 */

/**
 * 播放敵機擊落動畫
 * @param {HTMLElement} enemyEl - .enemy-ship 元素
 * @returns {Promise<void>} 動畫結束後 resolve（最長 500ms）
 */
export function playCorrect(enemyEl) {
  return new Promise(resolve => {
    enemyEl.classList.add('exploding');
    function onEnd() {
      enemyEl.removeEventListener('animationend', onEnd);
      enemyEl.classList.remove('exploding');
      resolve();
    }
    enemyEl.addEventListener('animationend', onEnd, { once: true });
    // 安全退路：超過 600ms 強制 resolve
    setTimeout(() => {
      enemyEl.classList.remove('exploding');
      resolve();
    }, 600);
  });
}

/**
 * 播放玩家戰機受損動畫
 * @param {HTMLElement} shipEl - .player-ship 元素
 * @returns {Promise<void>} 動畫結束後 resolve（最長 400ms）
 */
export function playWrong(shipEl) {
  return new Promise(resolve => {
    shipEl.classList.add('hit');
    function onEnd() {
      shipEl.removeEventListener('animationend', onEnd);
      shipEl.classList.remove('hit');
      resolve();
    }
    shipEl.addEventListener('animationend', onEnd, { once: true });
    setTimeout(() => {
      shipEl.classList.remove('hit');
      resolve();
    }, 500);
  });
}

/**
 * 播放過關慶祝動畫覆層（顯示 800ms 後自動移除）
 * @param {number} stageNumber - 剛完成的關卡編號
 * @returns {Promise<void>} 動畫結束後 resolve
 */
export function playStageClear(stageNumber) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'stage-clear-overlay';
    overlay.innerHTML = `<div class="stage-clear-text">🎉 第 ${stageNumber} 關通過！</div>`;
    document.body.appendChild(overlay);

    // 動畫時長 800ms（與 @keyframes stageClearIn 一致）
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 900);
  });
}

/**
 * 播放敵機進場動畫
 * @param {HTMLElement} enemyEl
 * @returns {Promise<void>}
 */
export function playEnemyEnter(enemyEl) {
  return new Promise(resolve => {
    enemyEl.classList.add('entering');
    function onEnd() {
      enemyEl.removeEventListener('animationend', onEnd);
      enemyEl.classList.remove('entering');
      resolve();
    }
    enemyEl.addEventListener('animationend', onEnd, { once: true });
    setTimeout(() => {
      enemyEl.classList.remove('entering');
      resolve();
    }, 500);
  });
}
