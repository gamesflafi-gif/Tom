/* =========================================================
   Boxli Brawl - Sound (per WebAudio synthetisiert)
   Keine Audiodateien -> keine Lizenzprobleme.
   ========================================================= */

const Sound = {
  ctx: null,
  muted: false,
  musicNodes: null,
  musicTimer: null,

  init() {
    this.muted = localStorage.getItem("boxli-muted") === "1";
  },

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },

  // einfacher Ton
  _beep(freq, dur, type = "square", vol = 0.18, slideTo = null) {
    if (this.muted) return;
    const ctx = this._ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  _noise(dur, vol = 0.25) {
    if (this.muted) return;
    const ctx = this._ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 1800;
    src.connect(filt).connect(gain).connect(ctx.destination);
    src.start(t);
  },

  play(name) {
    switch (name) {
      case "click":   this._beep(520, 0.08, "square", 0.12); break;
      case "eat":     this._beep(680, 0.09, "sine", 0.16, 920); break;
      case "coin":    this._beep(880, 0.07, "square", 0.12, 1320); break;
      case "hit":     this._noise(0.12, 0.3); this._beep(140, 0.12, "sawtooth", 0.22, 70); break;
      case "train":   this._beep(330, 0.1, "square", 0.16, 520); break;
      case "perfect": this._beep(660, 0.08, "square", 0.18, 990); setTimeout(() => this._beep(990, 0.12, "square", 0.18, 1480), 80); break;
      case "levelup": [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this._beep(f, 0.14, "square", 0.16), i * 90)); break;
      case "win":     [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this._beep(f, 0.16, "square", 0.17), i * 100)); break;
      case "lose":    [392, 330, 262].forEach((f, i) => setTimeout(() => this._beep(f, 0.18, "sawtooth", 0.16), i * 130)); break;
      case "evolve":  [392, 523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this._beep(f, 0.18, "triangle", 0.18), i * 110)); break;
    }
  },

  /* Sanfte Hintergrundmusik: simple, freundliche Arpeggio-Schleife */
  startMusic() {
    if (this.muted || this.musicTimer) return;
    const ctx = this._ensure();
    if (!ctx) return;
    const scale = [262, 294, 330, 392, 440, 523, 587, 659];
    let step = 0;
    const pattern = [0, 2, 4, 7, 4, 2, 5, 3];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const note = scale[pattern[step % pattern.length]];
      this._beep(note, 0.32, "triangle", 0.05);
      if (step % 2 === 0) this._beep(note / 2, 0.5, "sine", 0.04);
      step++;
    }, 380);
  },

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("boxli-muted", this.muted ? "1" : "0");
    if (this.muted) this.stopMusic();
    else this.startMusic();
    return this.muted;
  },
};
