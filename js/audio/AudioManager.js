/**
 * AudioManager.js — 音效管理模組（T023）
 * 管理 5 種音效與背景音樂循環播放
 * 必須在使用者首次互動後呼叫 init()（瀏覽器 Autoplay Policy 限制）
 * @module AudioManager
 */

const AUDIO_FILES = {
  bgm:        './assets/audio/bgm.mp3',
  correct:    './assets/audio/correct.mp3',
  wrong:      './assets/audio/wrong.mp3',
  stageClear: './assets/audio/stage-clear.mp3',
  gameOver:   './assets/audio/game-over.mp3',
};

/** @type {Map<string, HTMLAudioElement>} */
const _sounds = new Map();
let _initialized = false;
let _bgmEnabled  = true;

export const AudioManager = {
  /**
   * 預載所有音效（需在使用者互動後呼叫，否則瀏覽器可能封鎖）
   * 重複呼叫安全（僅初始化一次）
   */
  init() {
    if (_initialized) return;
    _initialized = true;

    for (const [name, src] of Object.entries(AUDIO_FILES)) {
      const audio = new Audio(src);
      if (name === 'bgm') {
        audio.loop   = true;
        audio.volume = 0.3;
      } else {
        audio.volume = 0.6;
      }
      // 預載（不強制，避免行動裝置不必要流量）
      audio.preload = 'auto';
      _sounds.set(name, audio);
    }
  },

  /**
   * 播放指定音效
   * @param {'bgm'|'correct'|'wrong'|'stageClear'|'gameOver'} name
   */
  play(name) {
    if (!_initialized) return;
    if (name === 'bgm' && !_bgmEnabled) return;

    const audio = _sounds.get(name);
    if (!audio) return;

    // 非循環音效：從頭播放（防止快速重複時音效卡住）
    if (name !== 'bgm') {
      audio.currentTime = 0;
    }

    audio.play().catch(() => {
      // 靜默忽略 NotAllowedError（使用者尚未互動）
    });
  },

  /**
   * 停止指定音效
   * @param {'bgm'|'correct'|'wrong'|'stageClear'|'gameOver'} name
   */
  stop(name) {
    const audio = _sounds.get(name);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  },

  /**
   * 切換背景音樂開關
   * @returns {boolean} 切換後的 bgm 狀態（true = 開）
   */
  toggleBgm() {
    _bgmEnabled = !_bgmEnabled;
    const bgm = _sounds.get('bgm');
    if (bgm) {
      if (_bgmEnabled) {
        bgm.play().catch(() => {});
      } else {
        bgm.pause();
      }
    }
    return _bgmEnabled;
  },
};
