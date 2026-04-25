/**
 * GameScreen.js — 遊戲主畫面 UI 控制器
 * 協調 Timer、GameSession、Animations、PauseOverlay 的完整遊戲流程
 * @module GameScreen
 */

import { createTimer }        from '../game/Timer.js';
import {
  createGameSession,
  getCurrentQuestion,
  answerQuestion,
  skipQuestion,
  nextQuestion,
  isStageClear,
  isGameOver,
} from '../game/GameSession.js';
import { playCorrect, playWrong, playStageClear, playEnemyEnter, playScorePopup } from './Animations.js';
import { PauseOverlay } from './PauseOverlay.js';
import { AudioManager }  from '../audio/AudioManager.js';
import { useItem, getInventory } from '../data/CoinStorage.js';

const TIMER_SEC      = 30;
const FEEDBACK_DELAY = 400; // ms

/** 關卡難度名稱 */
const STAGE_NAMES = ['','新手','入門','初級','初中','中級','中高','高級','困難','超難','地獄'];

export class GameScreen {
  /**
   * @param {HTMLElement} container - #screen-game 元素
   */
  constructor(container) {
    this._el         = container;
    this._equationEl = container.querySelector('#equation');
    this._optionsEl  = container.querySelector('#options-grid');
    this._timerBarEl = container.querySelector('#timer-bar');
    this._livesEl    = container.querySelector('#hud-lives');
    this._stageEl    = container.querySelector('#hud-stage');
    this._scoreEl    = container.querySelector('#hud-score');
    this._streakEl   = container.querySelector('#hud-streak');
    this._powerupBar = container.querySelector('#powerup-bar');
    this._shipEl     = container.querySelector('#player-ship');
    this._enemyEl    = container.querySelector('#enemy-ship');
    this._pauseBtn   = container.querySelector('#btn-pause');
    this._bgmBtn     = container.querySelector('#btn-bgm');

    this._pauseOverlay = new PauseOverlay(
      container.querySelector('#pause-overlay'),
      container.querySelector('#btn-resume'),
    );

    this._session     = null;
    this._timer       = null;
    this._totalPausedMs = 0;
    this._pauseStart  = 0;
    this._answering   = false; // 防止重複點擊

    this._pauseBtn.addEventListener('click', () => this._onPause());
    this._bgmBtn.addEventListener('click', () => this._onToggleBgm());
    this._pauseOverlay.onResume = () => this._onResume();
  }

  /**
   * 啟動新一局遊戲
   * @param {string} playerName
   */
  start(playerName) {
    this._session       = createGameSession(playerName);
    this._totalPausedMs = 0;
    this._answering     = false;

    AudioManager.init();
    AudioManager.play('bgm');
    this._loadQuestion();
  }

  // ── 載入並顯示當前題目 ──────────────────────────────────
  _loadQuestion() {
    const session = this._session;
    const q       = getCurrentQuestion(session);

    // 更新 HUD
    const stageName = STAGE_NAMES[session.currentStage] || '';
    this._stageEl.textContent = `關卡 ${session.currentStage}/10　${stageName}`;
    this._scoreEl.textContent = `${session.score} 分`;
    this._renderLives(session.lives);
    this._updateStreakDisplay();
    this._renderPowerups();

    // 顯示算式
    this._equationEl.textContent = `${q.multiplicand} × ${q.multiplier} = ?`;

    // 清除舊選項，渲染新選項
    this._optionsEl.innerHTML = '';
    q.options.forEach(val => {
      const card = document.createElement('button');
      card.className   = 'option-card';
      card.textContent = val;
      card.addEventListener('click', () => this._onAnswer(val));
      this._optionsEl.appendChild(card);
    });

    // 進場動畫
    playEnemyEnter(this._enemyEl);

    // 啟動計時器
    this._startTimer();
  }

  // ── 計時器 ──────────────────────────────────────────────
  _startTimer() {
    if (this._timer) this._timer.stop();

    this._timer = createTimer(
      TIMER_SEC,
      (remaining) => this._onTick(remaining),
      ()          => this._onTimeout(),
    );
    this._timer.start();
  }

  _onTick(remaining) {
    const pct = (remaining / TIMER_SEC) * 100;
    this._timerBarEl.style.width = `${pct}%`;
    this._timerBarEl.classList.toggle('timer-bar--warning', remaining <= 10 && remaining > 5);
    this._timerBarEl.classList.toggle('timer-bar--danger',  remaining <= 5);
  }

  _onTimeout() {
    if (this._answering) return;
    this._onAnswer(null); // 超時時 remaining ≈ 0，timeUsed ≈ TIMER_SEC
  }

  // ── 答題處理 ─────────────────────────────────────────────
  async _onAnswer(selectedValue) {
    if (this._answering || this._session.isPaused) return;
    this._answering = true;

    // 先取剩餘時間再停止（stop 後 getRemainingMs 回傳 0）
    const remainingMs = this._timer.getRemainingMs();
    this._timer.stop();
    const timeUsed = Math.max(0, Math.round((TIMER_SEC * 1000 - remainingMs) / 1000));

    // 禁用所有選項
    this._setOptionsDisabled(true);

    const scoreBefore = this._session.score;
    const result = answerQuestion(this._session, selectedValue, timeUsed);
    const q      = this._session.questions[this._session.questions.length - 1];

    // 視覺回饋：標記選項
    if (selectedValue !== null) {
      const cards = [...this._optionsEl.querySelectorAll('.option-card')];
      cards.forEach(card => {
        const numVal = Number(card.textContent);
        if (numVal === q.correctAnswer) card.classList.add('correct');
        if (numVal === selectedValue && result !== 'correct') card.classList.add('wrong');
      });
    }

    // 動畫 + 音效
    if (result === 'correct') {
      const gained = this._session.score - scoreBefore;
      AudioManager.play('correct');
      playScorePopup(gained, this._enemyEl);
      this._updateStreakDisplay();
      await playCorrect(this._enemyEl);
    } else {
      AudioManager.play('wrong');
      this._updateStreakDisplay();
      await playWrong(this._shipEl);
      // 更新生命值顯示
      this._renderLives(this._session.lives);
    }

    await this._sleep(FEEDBACK_DELAY);

    // 判斷結束條件（game:over 涵蓋「生命耗盡」與「50 題全部完成」兩種情形）
    // 以 questions.length 計算已答題數，避免 totalQuestionIndex 推進前的 off-by-one
    const answered     = this._session.questions.length;
    const allDone      = answered >= 50;
    const livesGone    = isGameOver(this._session);

    if (livesGone || allDone) {
      this._endGame();
      return;
    }

    // 判斷本關完成（在 nextQuestion 前，currentQuestionIndex 仍指向已答的最後一題）
    const completedStage = this._session.currentStage;
    const stageDone = isStageClear(this._session);
    nextQuestion(this._session);

    if (stageDone) {
      AudioManager.play('stageClear');
      await playStageClear(completedStage);
    }

    this._answering = false;
    this._loadQuestion();
  }

  // ── 暫停 / 繼續 ──────────────────────────────────────────
  _onPause() {
    if (!this._timer || this._session.isPaused) return;
    this._session.isPaused = true;
    this._pauseStart       = performance.now();
    this._timer.pause();
    this._setOptionsDisabled(true);
    this._pauseOverlay.show();
  }

  _onResume() {
    if (!this._session.isPaused) return;
    this._totalPausedMs   += performance.now() - this._pauseStart;
    this._session.isPaused = false;
    this._setOptionsDisabled(this._answering);
    this._pauseOverlay.hide();
    this._timer.resume();
  }

  // ── BGM 開關 ──────────────────────────────────────────────
  _onToggleBgm() {
    const isOn = AudioManager.toggleBgm();
    this._bgmBtn.textContent  = isOn ? '🔊' : '🔇';
    this._bgmBtn.classList.toggle('btn--bgm-on',  isOn);
    this._bgmBtn.classList.toggle('btn--bgm-off', !isOn);
  }

  // ── 連答顯示 ──────────────────────────────────────────────
  _updateStreakDisplay() {
    const s = this._session?.streak ?? 0;
    if (!this._streakEl) return;
    if (s < 3) { this._streakEl.textContent = ''; this._streakEl.className = 'hud-streak'; return; }
    const flames = s >= 10 ? '🔥🔥🔥' : s >= 5 ? '🔥🔥' : '🔥';
    const mult   = s >= 10 ? '×3.0'    : s >= 5  ? '×2.0'  : '×1.5';
    this._streakEl.textContent = `${flames} ${s}連答 ${mult}`;
    this._streakEl.className   = 'hud-streak' +
      (s >= 10 ? ' streak--epic' : s >= 5 ? ' streak--hot' : ' streak--warm');
  }

  // ── 道具欄 ──────────────────────────────────────────────
  _renderPowerups() {
    if (!this._powerupBar) return;
    const inv = getInventory();
    const META = {
      extraLife: { icon: '🛡️', label: '+命'   },
      skipQ:     { icon: '⏩', label: '跳題'  },
      eliminate: { icon: '💡', label: '排除'  },
      timeBonus: { icon: '⏱️', label: '+10秒' },
    };
    const btns = Object.entries(inv)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const m = META[id] || { icon: '?', label: id };
        return `<button class="powerup-btn" data-type="${id}" title="${m.label}">
          ${m.icon} ${m.label} <span class="powerup-qty">×${qty}</span>
        </button>`;
      });
    this._powerupBar.innerHTML = btns.length
      ? btns.join('')
      : '<span class="powerup-empty">（無道具）</span>';
    this._powerupBar.querySelectorAll('.powerup-btn').forEach(btn => {
      btn.addEventListener('click', () => this._onUsePowerUp(btn.dataset.type));
    });
  }

  // ── 使用道具 ──────────────────────────────────────────────
  async _onUsePowerUp(type) {
    if (this._answering || this._session?.isPaused) return;
    if (!useItem(type)) return;

    switch (type) {
      case 'extraLife':
        this._session.lives = Math.min(10, this._session.lives + 1);
        this._renderLives(this._session.lives);
        break;

      case 'skipQ': {
        this._answering = true;
        if (this._timer) this._timer.stop();
        this._setOptionsDisabled(true);
        skipQuestion(this._session);
        this._updateStreakDisplay();
        await this._sleep(300);

        const answered  = this._session.questions.length;
        const allDone   = answered >= 50;
        const livesGone = isGameOver(this._session);
        if (livesGone || allDone) { this._endGame(); return; }

        const stageDone = isStageClear(this._session);
        nextQuestion(this._session);
        if (stageDone) {
          AudioManager.play('stageClear');
          await playStageClear(this._session.currentStage - 1);
        }
        this._answering = false;
        this._loadQuestion();
        break;
      }

      case 'eliminate':
        this._eliminateWrongOption();
        break;

      case 'timeBonus':
        if (this._timer) this._timer.addTime(10);
        break;
    }
    this._renderPowerups();
  }

  // ── 消去一個錯誤選項 ──────────────────────────────────────
  _eliminateWrongOption() {
    const correctVal = this._session._currentQuestion?.correctAnswer;
    const cards      = [...this._optionsEl.querySelectorAll('.option-card:not(.disabled)')];
    const wrong      = cards.filter(c => Number(c.textContent.trim()) !== correctVal);
    if (!wrong.length) return;
    const target = wrong[Math.floor(Math.random() * wrong.length)];
    target.classList.add('disabled', 'eliminated');
  }


  _endGame() {
    if (this._timer) this._timer.stop();
    AudioManager.stop('bgm');
    AudioManager.play('gameOver');

    document.dispatchEvent(
      new CustomEvent('game:over', {
        detail: {
          session:       this._session,
          totalPausedMs: this._totalPausedMs,
        },
      })
    );
  }

  // ── 輔助 ─────────────────────────────────────────────────
  _renderLives(lives) {
    const total = 10;
    let html = '';
    for (let i = 0; i < total; i++) {
      const lost = i >= lives;
      html += `<span class="life-icon${lost ? ' life-icon--lost' : ''}">❤️</span>`;
    }
    this._livesEl.innerHTML = html;
  }

  _setOptionsDisabled(disabled) {
    this._optionsEl.querySelectorAll('.option-card').forEach(c => {
      c.classList.toggle('disabled', disabled);
    });
  }

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}
