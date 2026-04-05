/**
 * QuestionGenerator.js — 題目產生器
 * 依關卡難度生成乘法題目與干擾選項，使用純函式設計確保可獨立測試
 * @module QuestionGenerator
 */

/**
 * 各關卡難度配置表（index 1–10）
 * { minA, maxA } × { minB, maxB }，確保乘積通常可 ≤ 999
 */
const STAGE_DIFFICULTY = [
  null,                                             // index 0 佔位
  { minA: 10, maxA: 30,  minB: 1,  maxB: 3  },     // 關卡 1
  { minA: 10, maxA: 30,  minB: 1,  maxB: 5  },     // 關卡 2
  { minA: 10, maxA: 50,  minB: 2,  maxB: 5  },     // 關卡 3
  { minA: 15, maxA: 50,  minB: 2,  maxB: 6  },     // 關卡 4
  { minA: 20, maxA: 60,  minB: 3,  maxB: 6  },     // 關卡 5
  { minA: 20, maxA: 70,  minB: 3,  maxB: 7  },     // 關卡 6
  { minA: 30, maxA: 80,  minB: 4,  maxB: 7  },     // 關卡 7
  { minA: 30, maxA: 90,  minB: 4,  maxB: 8  },     // 關卡 8
  { minA: 40, maxA: 99,  minB: 4,  maxB: 9  },     // 關卡 9
  { minA: 50, maxA: 99,  minB: 5,  maxB: 9  },     // 關卡 10
];

/**
 * 在 [min, max] 範圍內取得隨機整數（含兩端）
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 依關卡生成一題乘法題目（含 6 個選項）
 * @param {number} stage - 關卡編號（1–10）
 * @returns {object} Question 物件
 * @throws {RangeError} 若 stage 超出 1–10 範圍
 */
export function generateQuestion(stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > 10) {
    throw new RangeError(`stage 必須為 1–10 之整數，收到：${stage}`);
  }

  const { minA, maxA, minB, maxB } = STAGE_DIFFICULTY[stage];

  let multiplicand, multiplier, correctAnswer;
  let attempts = 0;

  // 重試直到乘積 ≤ 999（防止無限迴圈：超過 200 次改用縮小範圍）
  do {
    multiplicand  = randInt(minA, maxA);
    multiplier    = randInt(minB, maxB);
    correctAnswer = multiplicand * multiplier;
    attempts++;
    if (attempts > 200) {
      // 強制縮小至安全範圍
      multiplicand  = randInt(minA, Math.min(maxA, 33));
      multiplier    = randInt(minB, Math.min(maxB, 3));
      correctAnswer = multiplicand * multiplier;
      break;
    }
  } while (correctAnswer > 999);

  const distractors = generateDistractors(correctAnswer);
  const options     = shuffleOptions([correctAnswer, ...distractors]);

  return {
    stage,
    indexInStage:  0,         // 由呼叫端設定
    multiplicand,
    multiplier,
    correctAnswer,
    options,
    playerAnswer: null,
    result:       null,
    timeUsedSec:  0,
  };
}

/**
 * 生成 5 個干擾選項（不重複、不等於正確答案、均 > 0）
 * 策略：先用 ±offset，不足時補隨機值
 * @param {number} correctAnswer
 * @returns {number[]} 長度為 5 的陣列
 */
export function generateDistractors(correctAnswer) {
  const used = new Set([correctAnswer]);
  const distractors = [];

  // offset 候選清單（先近後遠，涵蓋常見干擾）
  const offsets = [1, -1, 2, -2, 10, -10, 11, -11, 3, -3, 20, -20, 5, -5, 21, -21];

  for (const off of offsets) {
    if (distractors.length >= 5) break;
    const candidate = correctAnswer + off;
    if (candidate > 0 && !used.has(candidate)) {
      distractors.push(candidate);
      used.add(candidate);
    }
  }

  // 補足至 5 個（隨機擴展）
  let guard = 0;
  while (distractors.length < 5 && guard < 500) {
    const candidate = Math.max(1, correctAnswer + randInt(-40, 40));
    if (!used.has(candidate)) {
      distractors.push(candidate);
      used.add(candidate);
    }
    guard++;
  }

  return distractors;
}

/**
 * Fisher-Yates 洗牌演算法
 * @param {number[]} options - 長度為 6 的選項陣列
 * @returns {number[]} 已隨機排列的新陣列（不修改原始陣列）
 */
export function shuffleOptions(options) {
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
