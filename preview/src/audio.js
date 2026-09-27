/* REACTOR RIFT — preview audio. All sounds are synthesized locally with the
   WebAudio API (original, no copyrighted assets). Sound toggle in UI. */
let ctx = null;
let enabled = true;

const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

export const setSound = v => { enabled = v; };
export const getSound = () => enabled;

function tone({ f = 440, type = 'sine', dur = 0.15, gain = 0.18, slide = 0, delay = 0 }) {
  if (!enabled) return;
  try {
    const c = ac(); const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) { /* audio unavailable in this browser context */ }
}

function noise({ dur = 0.2, gain = 0.12, freq = 800, delay = 0 }) {
  if (!enabled) return;
  try {
    const c = ac(); const t = c.currentTime + delay;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let s = 987654321; // deterministic LCG for reproducible texture
    for (let i = 0; i < len; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = ((s / 0x7fffffff) * 2 - 1) * (1 - i / len); }
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = c.createGain(); g.gain.value = gain;
    src.connect(f).connect(g).connect(c.destination); src.start(t);
  } catch (e) { /* noop */ }
}

export const SFX = {
  spin:      () => { tone({ f: 160, slide: 240, type: 'triangle', dur: 0.25 }); noise({ dur: 0.3, freq: 1200, gain: 0.05 }); },
  land:      () => tone({ f: 220, type: 'sine', dur: 0.06, gain: 0.1 }),
  clusterWin:(n = 0) => tone({ f: 520 + n * 60, type: 'triangle', dur: 0.18 }),
  cascade:   () => { noise({ dur: 0.18, freq: 600, gain: 0.08 }); tone({ f: 300, slide: -120, dur: 0.12, type: 'sine' }); },
  energy:    () => { tone({ f: 700, slide: 500, type: 'square', dur: 0.12, gain: 0.07 }); },
  level:     (lv = 1) => { for (let i = 0; i < 3; i++) tone({ f: 330 * (1 + lv * 0.2) * (i + 1), type: 'sawtooth', dur: 0.14, gain: 0.06, delay: i * 0.09 }); },
  rift:      () => { noise({ dur: 0.5, freq: 250, gain: 0.14 }); tone({ f: 90, slide: -40, type: 'sawtooth', dur: 0.6, gain: 0.12 }); },
  bonus:     () => [523, 659, 784, 1046].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.2, delay: i * 0.12 })),
  bigwin:    () => [392, 523, 659, 784, 1046].forEach((f, i) => tone({ f, type: 'sine', dur: 0.3, gain: 0.12, delay: i * 0.1 })),
  maxwin:    () => [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.35, gain: 0.13, delay: i * 0.12 })),
};
