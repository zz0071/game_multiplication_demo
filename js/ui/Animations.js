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
    playConfetti(60);
    const overlay = document.createElement('div');
    overlay.className = 'stage-clear-overlay';
    overlay.innerHTML = `<div class="stage-clear-text">🎉 第 ${stageNumber} 關通過！</div>`;
    document.body.appendChild(overlay);

    // 動畫時長 1000ms
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1000);
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

/**
 * 播放分數浮現特效（答對時顯示 +N 分數字從敋機中心飄起）
 * @param {number}      points  - 得到的分數
 * @param {HTMLElement} anchor  - 參考位置元素（浮現自其中心）
 */
export function playScorePopup(points, anchor) {
  if (!points || points <= 0) return;
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.textContent = `+${points}`;
  const rect = anchor
    ? anchor.getBoundingClientRect()
    : { left: window.innerWidth / 2, width: 0, top: window.innerHeight * 0.3, height: 0 };
  el.style.left = `${rect.left + rect.width  / 2}px`;
  el.style.top  = `${rect.top  + rect.height / 2}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/**
 * 播放彩帶紙屑爆發效果
 * @param {number} count - 紙屑數量（預設 50）
 */
export function playConfetti(count = 50) {
  const colors = [
    '#ffd93d', '#ff6b6b', '#6bcb77', '#00d2ff',
    '#ff6fd8', '#b388ff', '#ff9a3c', '#ffffff',
  ];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = 5 + Math.random() * 9;
    el.style.cssText = [
      `left:${Math.random() * 100}vw`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `width:${size}px`,
      `height:${Math.floor(size * (0.4 + Math.random() * 1.2))}px`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
      `animation-delay:${(Math.random() * 0.6).toFixed(2)}s`,
      `animation-duration:${(1.4 + Math.random() * 0.8).toFixed(2)}s`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}
