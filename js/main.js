/**
 * main.js — 程式進入點
 * 負責畫面路由切換、CustomEvent 監聽、各模組協調
 * @module main
 */

import { HomeScreen }        from './ui/HomeScreen.js';
import { GameScreen }        from './ui/GameScreen.js';
import { ResultScreen }      from './ui/ResultScreen.js';
import { LeaderboardScreen } from './ui/LeaderboardScreen.js';
import { ShopScreen }        from './ui/ShopScreen.js';
import { buildScoreRecord }  from './game/Scoring.js';
import { saveToLeaderboard } from './data/Storage.js';

// ---------- 畫面元素 ----------
const screens = {
  home:        document.getElementById('screen-home'),
  game:        document.getElementById('screen-game'),
  result:      document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
  shop:        document.getElementById('screen-shop'),
};

/**
 * 切換顯示指定畫面，隱藏其餘所有畫面
 * @param {'home'|'game'|'result'|'leaderboard'} name
 */
export function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('screen--hidden', key !== name);
    el.classList.toggle('screen--active', key === name);
  }
}

// ---------- 模組實例 ----------
let homeScreen        = null;
let gameScreen        = null;
let resultScreen      = null;
let leaderboardScreen = null;
let shopScreen        = null;

/** 目前遊戲局（GameScreen 結束後傳回） */
let currentSession    = null;
let currentPausedMs   = 0;

// ---------- 初始化 ----------
function init() {
  homeScreen        = new HomeScreen(document.getElementById('screen-home'));
  gameScreen        = new GameScreen(document.getElementById('screen-game'));
  resultScreen      = new ResultScreen(document.getElementById('screen-result'));
  leaderboardScreen = new LeaderboardScreen(document.getElementById('screen-leaderboard'));
  shopScreen        = new ShopScreen(document.getElementById('screen-shop'));

  registerEvents();

  showScreen('home');
}

// ---------- 事件監聽 ----------
function registerEvents() {
  // 玩家點選「開始遊戲」
  document.addEventListener('game:start', (e) => {
    const { playerName } = e.detail;
    gameScreen.start(playerName);
    showScreen('game');
  });

  // 遊戲結束（生命耗盡 or 完成 50 題）
  document.addEventListener('game:over', (e) => {
    const { session, totalPausedMs } = e.detail;
    currentSession  = session;
    currentPausedMs = totalPausedMs;

    const record = buildScoreRecord(session, totalPausedMs);
    saveToLeaderboard(record);

    resultScreen.show(session, record);
    showScreen('result');
  });

  // 再玩一次
  document.addEventListener('game:restart', () => {
    showScreen('home');
  });

  // 前往排行榜
  document.addEventListener('nav:leaderboard', () => {
    leaderboardScreen.show();
    showScreen('leaderboard');
  });

  // 前往商店
  document.addEventListener('nav:shop', () => {
    shopScreen.show();
    showScreen('shop');
  });

  // 從排行榜返回首頁
  document.addEventListener('nav:home', () => {
    showScreen('home');
  });
}

// DOM 就緒後啟動
document.addEventListener('DOMContentLoaded', init);
