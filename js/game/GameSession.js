/**
 * GameSession.js — 遊戲局狀態管理
 * 提供建立、答題、推進、終止等純狀態操作函式（不操作 DOM）
 * @module GameSession
 */

import { generateQuestion }  from './QuestionGenerator.js';

const LIVES_INIT  = 10;
const STAGES      = 10;
const Q_PER_STAGE = 5;
const SCORE_PER_Q = 10;
const MAX_SCORE   = 500;

/**
 * 建立新的遊戲局物件
 * @param {string} playerName - 玩家輸入名稱（空白時預設「玩家」）
 * @returns {object} GameSession
 */
export function createGameSession(playerName) {
  return {
    playerName:            (playerName && playerName.trim()) || '玩家',
    startTime:             Date.now(),
    currentStage:          1,
    currentQuestionIndex:  0,     // 本關第幾題（0–4）
    totalQuestionIndex:    0,     // 全局第幾題（0–49）
    score:                 0,
    lives:                 LIVES_INIT,
    questions:             [],    // 已出現的題目記錄
    isPaused:              false,
    pausedAt:              null,  // 暫停時的 performance.now()
    _currentQuestion:      null,  // 當前題目暫存（未公開）
  };
}

/**
 * 取得（或首次生成）當前題目
 * @param {object} session
 * @returns {object} Question
 */
export function getCurrentQuestion(session) {
  if (!session._currentQuestion) {
    const q = generateQuestion(session.currentStage);
    q.indexInStage = session.currentQuestionIndex;
    session._currentQuestion = q;
  }
  return session._currentQuestion;
}

/**
 * 處理玩家答題，更新分數與生命值
 * @param {object}      session    - 遊戲局
 * @param {number|null} answer     - 玩家答案（null 表示超時）
 * @param {number}      timeUsedSec - 本題耗時（超時者傳 30）
 * @returns {'correct'|'wrong'|'timeout'} 本題結果
 */
export function answerQuestion(session, answer, timeUsedSec) {
  const q = session._currentQuestion;
  if (!q) return 'timeout';

  q.timeUsedSec = timeUsedSec;

  if (answer === null) {
    q.result      = 'timeout';
    q.playerAnswer = null;
  } else if (answer === q.correctAnswer) {
    q.result       = 'correct';
    q.playerAnswer = answer;
    session.score  = Math.min(MAX_SCORE, session.score + SCORE_PER_Q);
  } else {
    q.result       = 'wrong';
    q.playerAnswer = answer;
  }

  if (q.result !== 'correct') session.lives--;

  session.questions.push(q);
  session._currentQuestion = null;

  return q.result;
}

/**
 * 推進至下一題，並同步更新關卡/題索引
 * @param {object} session
 */
export function nextQuestion(session) {
  session.totalQuestionIndex++;
  session.currentQuestionIndex++;

  if (session.currentQuestionIndex >= Q_PER_STAGE) {
    session.currentStage++;
    session.currentQuestionIndex = 0;
  }
}

/**
 * 判斷當前關卡的最後一題剛剛完成（在呼叫 nextQuestion 前使用）
 * @param {object} session
 * @returns {boolean}
 */
export function isStageClear(session) {
  return session.currentQuestionIndex === Q_PER_STAGE - 1;
}

/**
 * 判斷遊戲是否因生命耗盡而結束
 * @param {object} session
 * @returns {boolean}
 */
export function isGameOver(session) {
  return session.lives <= 0;
}

/**
 * 判斷遊戲是否因完成全部 50 題而正常結束
 * @param {object} session
 * @returns {boolean}
 */
export function isGameComplete(session) {
  return session.totalQuestionIndex >= STAGES * Q_PER_STAGE;
}
