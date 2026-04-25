/**
 * Timer.js — 倒數計時器
 * 使用 performance.now() 追蹤剩餘時間，支援暫停/繼續機制
 * 禁止以「重設秒數」替代暫停行為
 * @module Timer
 */

/**
 * 建立計時器
 * @param {number}   durationSec  - 倒數總秒數（預設 30）
 * @param {function(number): void} onTick    - 每秒呼叫，參數為剩餘秒數（ceiling）
 * @param {function(): void}       onExpire  - 時間歸零時呼叫
 * @returns {TimerHandle}
 */
export function createTimer(durationSec, onTick, onExpire) {
  // remainingMs：呼叫 pause() 時快照剩餘毫秒數；pause 之外以 deadline 計算
  let remainingMs = durationSec * 1000;
  // deadline：以 performance.now() 計的到期絕對時間點
  let deadline    = null;
  let intervalId  = null;
  let started     = false;

  /** 內部 tick：約每 100ms 觸發，更新剩餘秒數並在到期時通知 */
  function tick() {
    const ms = deadline - performance.now();
    if (ms <= 0) {
      remainingMs = 0;
      clearInterval(intervalId);
      intervalId = null;
      onTick(0);
      onExpire();
      return;
    }
    remainingMs = ms;
    onTick(Math.ceil(ms / 1000));
  }

  return {
    /** 啟動計時（僅可呼叫一次；已啟動則無作用） */
    start() {
      if (started) return;
      started  = true;
      deadline = performance.now() + remainingMs;
      onTick(Math.ceil(remainingMs / 1000));
      intervalId = setInterval(tick, 100);
    },

    /** 凍結計時：快照剩餘毫秒數並停止 interval */
    pause() {
      if (!started || intervalId === null) return;
      const now = performance.now();
      remainingMs = Math.max(0, deadline - now);
      clearInterval(intervalId);
      intervalId = null;
    },

    /** 從剩餘毫秒繼續計時（呼叫 pause 後才有效） */
    resume() {
      if (!started || intervalId !== null) return;
      deadline   = performance.now() + remainingMs;
      onTick(Math.ceil(remainingMs / 1000));
      intervalId = setInterval(tick, 100);
    },

    /** 停止計時並重置狀態 */
    stop() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      started     = false;
      remainingMs = 0;
      deadline    = null;
    },

    /**
     * 取得當前剩餘毫秒數（精確）
     * @returns {number}
     */
    getRemainingMs() {
      if (intervalId !== null) {
        // 計時中：以 deadline 即時計算
        return Math.max(0, deadline - performance.now());
      }
      // 已暫停或尚未啟動：回傳快照值
      return Math.max(0, remainingMs);
    },

    /** 延長計時秒數（道具：+10 秒效果） */
    addTime(sec) {
      if (!started || intervalId === null) return;
      remainingMs += sec * 1000;
      deadline     = performance.now() + remainingMs;
      onTick(Math.ceil(remainingMs / 1000));
    },
  };
}
