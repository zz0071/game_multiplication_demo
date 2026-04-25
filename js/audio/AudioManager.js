/**
 * AudioManager.js — 音效管理模組（Web Audio API 合成版）
 * 使用 AudioContext 即時合成所有音效，不依賴外部音檔
 * 必須在使用者首次互動後呼叫 init()（瀏覽器 Autoplay Policy 限制）
 * @module AudioManager
 */

/** @type {AudioContext|null} */
let _ctx         = null;
let _initialized = false;
let _bgmEnabled  = true;

/** @type {AudioBufferSourceNode|null} BGM 循環播放節點 */
let _bgmSource = null;
/** @type {GainNode|null} BGM 主音量節點 */
let _bgmGain   = null;

// ── 音符頻率表（Hz，標準十二平均律） ────────────────────────
const N = {
  G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16,
  B4: 493.88, C5: 523.25, D5: 587.33,  E5:  659.25,
  F5: 698.46, G5: 784.00, A5: 880.00,  C6: 1046.50,
  Eb4: 311.13, F4: 349.23,
};

/**
 * 播放單一振盪器音符
 * @param {number} freq      - 頻率（Hz）
 * @param {number} startTime - AudioContext 時間點
 * @param {number} duration  - 持續秒數
 * @param {OscillatorType} type   - 波形（'sine'|'square'|'sawtooth'|'triangle'）
 * @param {number} volume    - 峰值音量（0–1）
 */
function _playTone(freq, startTime, duration, type = 'sine', volume = 0.3) {
  if (!_ctx) return;
  const osc  = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.connect(gain);
  gain.connect(_ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * 預先生成 BGM AudioBuffer（8-bit 方波風格旋律，約 7.2 秒循環）
 * @returns {AudioBuffer}
 */
function _createBgmBuffer() {
  const sr  = _ctx.sampleRate;
  const bps = 60 / 130; // 130 BPM，每拍秒數

  // 旋律陣列：[頻率, 拍數]，0 表示休止符
  const melody = [
    [N.C5, 1], [N.E5, 1], [N.G5, 1], [N.E5, 1],
    [N.F5, 1], [N.A5, 1], [N.G5, 2],
    [N.C5, 1], [N.D5, 1], [N.E5, 1], [N.C5, 1],
    [N.G4, 1], [N.A4, 1], [N.G4, 2],
    [N.E5, 1], [N.D5, 1], [N.C5, 2],
  ];

  const totalSamples = Math.ceil(
    melody.reduce((s, [, b]) => s + b * bps, 0) * sr
  );
  const buf  = _ctx.createBuffer(1, totalSamples, sr);
  const data = buf.getChannelData(0);

  let offset = 0;
  for (const [freq, beats] of melody) {
    const noteLen    = Math.floor(beats * bps * sr);
    const attackLen  = Math.floor(0.01 * sr);
    const releaseLen = Math.floor(0.08 * sr);

    for (let i = 0; i < noteLen; i++) {
      let amp = 0.12;
      if (i < attackLen)              amp *= i / attackLen;
      else if (i > noteLen - releaseLen) amp *= (noteLen - i) / releaseLen;

      // 方波：產生 8-bit 像素風音色
      const wave = freq > 0
        ? (Math.sin(2 * Math.PI * freq * i / sr) >= 0 ? 1 : -1)
        : 0;
      data[offset + i] = wave * amp;
    }
    offset += noteLen;
  }
  return buf;
}

export const AudioManager = {
  /**
   * 建立 AudioContext（需在使用者互動後呼叫）
   * 重複呼叫安全（僅初始化一次）
   */
  init() {
    if (_initialized) return;
    _initialized = true;
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      console.warn('AudioManager: 瀏覽器不支援 Web Audio API');
    }
  },

  /**
   * 播放指定音效
   * @param {'bgm'|'correct'|'wrong'|'stageClear'|'gameOver'} name
   */
  play(name) {
    if (!_initialized || !_ctx) return;
    // 恢復因自動播放政策被暫停的 AudioContext
    if (_ctx.state === 'suspended') _ctx.resume();

    const now = _ctx.currentTime;
    switch (name) {
      case 'correct':    this._playCorrect(now);    break;
      case 'wrong':      this._playWrong(now);      break;
      case 'stageClear': this._playStageClear(now); break;
      case 'gameOver':   this._playGameOver(now);   break;
      case 'bgm':        this._startBgm();          break;
    }
  },

  /**
   * 停止指定音效（目前僅 bgm 支援停止）
   * @param {'bgm'|'correct'|'wrong'|'stageClear'|'gameOver'} name
   */
  stop(name) {
    if (name === 'bgm') this._stopBgm();
  },

  /**
   * 切換背景音樂開關
   * @returns {boolean} 切換後的 bgm 狀態（true = 開）
   */
  toggleBgm() {
    _bgmEnabled = !_bgmEnabled;
    if (_bgmEnabled) {
      if (_ctx?.state === 'suspended') _ctx.resume();
      this._startBgm();
    } else {
      this._stopBgm();
    }
    return _bgmEnabled;
  },

  // ── 私有：各音效合成 ─────────────────────────────────────

  /** 答對：歡快上升三音琶音 C5→E5→G5 */
  _playCorrect(now) {
    _playTone(N.C5, now,       0.25, 'sine', 0.4);
    _playTone(N.E5, now + 0.1, 0.25, 'sine', 0.4);
    _playTone(N.G5, now + 0.2, 0.35, 'sine', 0.4);
  },

  /** 答錯：鋸齒波下滑音 Bb4→G4，帶沉重感 */
  _playWrong(now) {
    const osc  = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.connect(gain);
    gain.connect(_ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(N.Bb4, now);
    osc.frequency.linearRampToValueAtTime(N.G4, now + 0.4);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  /** 過關：勝利琶音 C5→E5→G5→C6 */
  _playStageClear(now) {
    [[N.C5, 0], [N.E5, 0.15], [N.G5, 0.3], [N.C6, 0.45]].forEach(([f, d]) => {
      _playTone(f, now + d, 0.45, 'sine', 0.45);
    });
  },

  /** 遊戲結束：三角波緩降旋律 G4→F4→Eb4→D4 */
  _playGameOver(now) {
    [[N.G4, 0], [N.F4, 0.35], [N.Eb4, 0.7], [N.G4 * 0.75, 1.05]].forEach(([f, d]) => {
      _playTone(f, now + d, 0.55, 'triangle', 0.3);
    });
  },

  /** 啟動 BGM 循環播放 */
  _startBgm() {
    if (!_bgmEnabled || !_ctx) return;
    this._stopBgm(); // 確保不重疊
    try {
      const buffer = _createBgmBuffer();
      _bgmGain = _ctx.createGain();
      _bgmGain.gain.setValueAtTime(0.18, _ctx.currentTime);
      _bgmGain.connect(_ctx.destination);

      _bgmSource = _ctx.createBufferSource();
      _bgmSource.buffer = buffer;
      _bgmSource.loop   = true;
      _bgmSource.connect(_bgmGain);
      _bgmSource.start();
    } catch (e) {
      console.warn('AudioManager: BGM 啟動失敗', e);
    }
  },

  /** 停止 BGM 並釋放節點 */
  _stopBgm() {
    if (_bgmSource) {
      try { _bgmSource.stop(); } catch { /* 已停止則忽略 */ }
      _bgmSource.disconnect();
      _bgmSource = null;
    }
    if (_bgmGain) {
      _bgmGain.disconnect();
      _bgmGain = null;
    }
  },
};
