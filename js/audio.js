/* Bank Fighter — WebAudio chiptune sfx, music and announcer. */
(function () {
  const BF = (window.BF = window.BF || {});
  let ac = null, master = null, noiseBuf = null, muted = false, timer = null, track = null, step = 0, nextT = 0;
  try { muted = localStorage.getItem('bf-mute') === '1'; } catch (e) {}

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try {
      ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : .5; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; return false; }
    return true;
  }
  function tone(type, f0, f1, dur, vol, when) {
    if (!ac) return; const t = (when || ac.currentTime), o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol, freq, when) {
    if (!ac) return; const t = (when || ac.currentTime), s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq || 2000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .02);
  }
  const SFX = {
    move() { tone('square', 660, 660, .04, .12); },
    ok() { tone('square', 660, 660, .06, .15); tone('square', 990, 990, .1, .15, ac.currentTime + .06); },
    whoosh() { noise(.08, .12, 3000); },
    hit() { noise(.12, .4, 1400); tone('square', 180, 60, .1, .2); },
    heavy() { noise(.22, .5, 900); tone('sawtooth', 140, 40, .2, .3); },
    block() { noise(.05, .2, 5000); tone('square', 900, 700, .05, .1); },
    jump() { tone('square', 260, 520, .1, .1); },
    special() { tone('sawtooth', 220, 880, .16, .16); tone('square', 440, 1320, .16, .08); },
    thud() { noise(.18, .4, 400); tone('sine', 90, 40, .18, .4); },
    poof() { noise(.2, .2, 6000); tone('sine', 900, 200, .18, .1); },
    heal() { [523, 659, 784].forEach((f, i) => tone('triangle', f, f, .1, .2, ac.currentTime + i * .06)); },
    cuffs() { tone('square', 1400, 1400, .03, .15); tone('square', 1800, 1800, .05, .15, ac.currentTime + .05); },
    whistle() { for (let i = 0; i < 24; i++) tone('square', i % 2 ? 2500 : 2900, i % 2 ? 2500 : 2900, .045, .16, ac.currentTime + i * .04); },
    slam() { noise(.5, .7, 600); tone('sine', 70, 30, .5, .6); },
    glass() { for (let i = 0; i < 8; i++) tone('square', 2000 + Math.random() * 3000, 1500, .08, .08, ac.currentTime + i * .03); noise(.3, .4, 8000); },
    bell() { [1318, 1318, 1318].forEach((f, i) => { tone('triangle', f, f, .35, .3, ac.currentTime + i * .18); tone('sine', f * 2.01, f * 2.01, .3, .1, ac.currentTime + i * .18); }); },
    ko() { tone('sawtooth', 600, 50, .9, .3); noise(.5, .3, 1200); },
    chopper() { for (let i = 0; i < 30; i++) noise(.04, .18, 500, ac.currentTime + i * .08); },
    cash() { tone('square', 1568, 1568, .06, .15); tone('square', 2093, 2093, .25, .15, ac.currentTime + .07); },
    alarm() { for (let i = 0; i < 4; i++) tone('square', 880, 660, .14, .14, ac.currentTime + i * .16); },
    fanfare() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone('square', f, f, .16, .16, ac.currentTime + i * .13)); },
    doom() { [196, 185, 174, 130].forEach((f, i) => tone('sawtooth', f, f, .4, .22, ac.currentTime + i * .32)); }
  };

  // --- music: 16th-note step sequencer. Note numbers are semitones from A2. ---
  const _ = null;
  const TRACKS = {
    fight: { bpm: 150,
      bass: [0, _, 0, 12, 0, _, 0, 10, 0, _, 0, 12, 0, 10, 7, 10, -4, _, -4, 8, -4, _, -4, 7, -2, _, -2, 10, -2, 5, 7, 10,
             0, _, 0, 12, 0, _, 0, 10, 0, _, 0, 12, 0, 10, 7, 10, 5, _, 5, 17, 5, _, 3, 15, 7, _, 7, 19, 7, 10, 11, 14],
      lead: [24, _, _, 27, _, _, 31, _, 29, _, 27, _, 24, _, 22, _, 20, _, _, 24, _, _, 27, _, 26, _, 22, _, 26, _, 29, _,
             24, _, _, 27, _, _, 31, _, 36, _, 34, _, 31, _, 29, _, 29, 32, 36, _, 27, 31, 34, _, 31, _, 35, _, 38, _, 35, _],
      drum: 'k.h.s.h.k.k.s.hhk.h.s.h.k.k.s.ssk.h.s.h.k.k.s.hhk.h.s.hkk.s.ssss' },
    title: { bpm: 112,
      bass: [0, _, _, _, 0, _, 7, _, -4, _, _, _, -4, _, 3, _, -7, _, _, _, -7, _, 0, _, -5, _, _, _, -5, _, 2, 5],
      lead: [12, _, 19, _, 24, _, 19, _, 15, _, 20, _, 24, _, 20, _, 12, _, 17, _, 24, _, 20, _, 14, _, 19, _, 23, _, 26, _],
      drum: 'k...h...k...h.h.k...h...k.k.s.s.' },
    select: { bpm: 126,
      bass: [0, 0, 12, 0, 0, 12, 0, 12, 3, 3, 15, 3, 3, 15, 3, 15, 5, 5, 17, 5, 5, 17, 5, 17, 7, 7, 19, 7, 7, 19, 10, 11],
      lead: [24, _, _, 24, _, _, 27, _, 27, _, _, 27, _, _, 31, _, 29, _, _, 29, _, _, 32, _, 31, _, 29, _, 27, _, 26, _],
      drum: 'k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.hh' }
  };
  const fq = (n) => 110 * Math.pow(2, n / 12);
  function sched() {
    if (!ac || !track) return; const T = TRACKS[track], sl = 60 / T.bpm / 4;
    while (nextT < ac.currentTime + .15) {
      const b = T.bass[step % T.bass.length], l = T.lead[step % T.lead.length], d = T.drum[step % T.drum.length];
      if (b != null) tone('triangle', fq(b), fq(b), sl * 1.6, .28, nextT);
      if (l != null) { tone('square', fq(l), fq(l), sl * 1.8, .07, nextT); }
      if (d === 'k') tone('sine', 150, 40, .1, .4, nextT); else if (d === 's') noise(.09, .2, 4000, nextT); else if (d === 'h') noise(.02, .07, 9000, nextT);
      nextT += sl; step++;
    }
  }

  BF.audio = {
    init,
    sfx(n) { if (ac && SFX[n]) { try { SFX[n](); } catch (e) {} } },
    music(n) { if (track === n) return; track = n; step = 0; if (!ac) return; nextT = ac.currentTime + .05; if (!timer) timer = setInterval(sched, 40); },
    resume() { if (ac && track && !timer) { nextT = ac.currentTime + .05; timer = setInterval(sched, 40); } },
    say(text) {
      try { if (muted || !window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(text.toLowerCase()); u.pitch = .1; u.rate = .85; u.volume = .9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
    },
    get muted() { return muted; },
    toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : .5; try { localStorage.setItem('bf-mute', muted ? '1' : '0'); } catch (e) {} return muted; }
  };
})();
