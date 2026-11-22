/**
 * Música de fundo baixinha, em loop, com botão de pausar.
 * O volume passa por um GainNode do Web Audio porque o iPhone ignora
 * `audio.volume`. Sem arquivo de música, toca uma melodia calma gerada aqui.
 */

const AudioContextClass = window.AudioContext || window.webkitAudioContext;

const FADE_IN_SECONDS = 4;
const SYNTH_VOLUME = 0.5;
const CHORD_SECONDS = 6;
/** Dó maj7 → Lá m7 → Fá maj7 → Sol 6 (frequências em Hz). */
const CHORDS = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 392.0],
];

export class BackgroundMusic {
  constructor({ src, volume }) {
    this.src = src;
    this.volume = src ? volume : SYNTH_VOLUME;
    this.context = null;
    this.master = null;
    this.audio = null;
    this.playing = false;
    this.chordIndex = 0;
    this.chordTimer = null;
  }

  /** Precisa ser chamado dentro de um toque (regra dos navegadores). */
  start() {
    if (this.context || this.audio) return;
    try {
      if (this.src) this.startTrack();
      else this.startSynth();
      this.playing = true;
    } catch (error) {
      console.warn('Música não pôde tocar:', error);
    }
  }

  toggle() {
    this.setPlaying(!this.playing);
    return this.playing;
  }

  setPlaying(on) {
    if (!this.context && !this.audio) return;
    this.playing = on;
    if (!this.master) { // navegador sem Web Audio
      if (on) this.audio.play(); else this.audio.pause();
      return;
    }
    const now = this.context.currentTime;
    const gain = this.master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    if (on) {
      this.context.resume();
      this.audio?.play();
      gain.linearRampToValueAtTime(this.volume, now + 1.5);
    } else {
      gain.linearRampToValueAtTime(0, now + 0.8);
      setTimeout(() => {
        if (this.playing) return;
        this.audio?.pause();
        this.context.suspend();
      }, 900);
    }
  }

  /** Estado legível (usado nos testes). */
  get state() {
    const ctx = this.context ? this.context.state : 'sem-webaudio';
    if (!this.audio) return ctx;
    return `${ctx}/${this.audio.paused ? 'pausado' : 'tocando'} t=${this.audio.currentTime.toFixed(1)} loop=${this.audio.loop}`;
  }

  createMaster() {
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);
    this.master.gain.linearRampToValueAtTime(this.volume, this.context.currentTime + FADE_IN_SECONDS);
  }

  startTrack() {
    this.audio = new Audio(this.src);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.setAttribute('playsinline', '');
    if (AudioContextClass) {
      this.context = new AudioContextClass();
      this.createMaster();
      this.context.createMediaElementSource(this.audio).connect(this.master);
    } else {
      this.audio.volume = this.volume;
    }
    this.audio.play()?.catch((error) => console.warn('Áudio bloqueado:', error));
  }

  startSynth() {
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    this.createMaster();
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1400;
    this.filter.connect(this.master);
    this.playChord();
    this.chordTimer = setInterval(() => this.playChord(), CHORD_SECONDS * 1000);
  }

  /** Um acorde suave (pad) e três notinhas de sino por cima. */
  playChord() {
    const ctx = this.context;
    const now = ctx.currentTime;
    const chord = CHORDS[this.chordIndex++ % CHORDS.length];

    chord.forEach((frequency, n) => {
      [['sine', 1, 0.05], ['triangle', 1.003, 0.025]].forEach(([type, detune, peak]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = (frequency * detune) / (n === 0 ? 2 : 1); // nota mais grave uma oitava abaixo
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(peak, now + 2.2);
        gain.gain.linearRampToValueAtTime(0, now + 7.5);
        osc.connect(gain).connect(this.filter);
        osc.start(now);
        osc.stop(now + 7.6);
      });
    });

    for (let b = 0; b < 3; b++) {
      const at = now + 1 + b * 1.8 + Math.random() * 0.5;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = chord[(b + 1) % chord.length] * 2;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.03, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 2.6);
      osc.connect(gain).connect(this.filter);
      osc.start(at);
      osc.stop(at + 2.7);
    }
  }
}
