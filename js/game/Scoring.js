/**
 * Scoring.js — 計分規則與成績記錄建立
 * 所有函式為純函式，可獨立使用 console.assert 驗證
 * @module Scoring
 */

/**
 * 星等分段對照表（含上界；從高到低排列避免過早匹配）
 */
const STAR_THRESHOLDS = [
  { min: 451, stars: 10 },
  { min: 401, stars: 9  },
  { min: 351, stars: 8  },
  { min: 301, stars: 7  },
  { min: 251, stars: 6  },
  { min: 201, stars: 5  },
  { min: 151, stars: 4  },
  { min: 101, stars: 3  },
  { min:  51, stars: 2  },
  { min:   0, stars: 1  },
];

/**
 * 計算對應分數的星等（1–10 顆）
 * @param {number} score - 總分（0–500）
 * @returns {number} 星等（1–10）
 */
export function calcStars(score) {
  for (const { min, stars } of STAR_THRESHOLDS) {
    if (score >= min) return stars;
  }
  return 1;
}

/**
 * 將 Date 物件格式化為 'YYYY-MM-DD HH:mm:ss'
 * @param {Date} date
 * @returns {string}
 */
function formatDatetime(date) {
  const pad = n => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * 從 GameSession 建立 ScoreRecord
 * @param {object} session       - 已結束的遊戲局（GameSession）
 * @param {number} totalPausedMs - 本局總暫停毫秒數（不含入完成時間）
 * @returns {object} ScoreRecord
 */
export function buildScoreRecord(session, totalPausedMs) {
  const now          = new Date();
  const datetime     = formatDatetime(now);
  const correctCount = session.questions.filter(q => q.result === 'correct').length;
  const wrongCount   = session.questions.filter(q => q.result !== 'correct').length;
  const elapsedMs    = Date.now() - session.startTime - totalPausedMs;
  const durationSec  = Math.max(1, Math.round(elapsedMs / 1000));
  const stars        = calcStars(session.score);

  return {
    playerName:   session.playerName || '玩家',
    score:        session.score,
    stars,
    correctCount,
    wrongCount,
    durationSec,
    datetime,
    date:         datetime.split(' ')[0],
  };
}

// ---- 自我驗證（console.assert）----
// 於瀏覽器 console 可執行以下確認：
// console.assert(calcStars(500) === 10, 'calcStars 500 → 10');
// console.assert(calcStars(451) === 10, 'calcStars 451 → 10');
// console.assert(calcStars(450) === 9,  'calcStars 450 → 9');
// console.assert(calcStars(0)   === 1,  'calcStars 0 → 1');
