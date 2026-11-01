'use strict';
// Muzyka lo-fi generowana na żywo w przeglądarce, bez plików audio: pianino elektryczne, bas, miękki bit, szum płyty.
// Startuje po pierwszym kliknięciu albo klawiszu (wymóg przeglądarek). Przycisk #mute wycisza ją razem z efektami.
(() => {
  const CONFIG = {
    bpm: 84, volume: .26, beat: true, barsPerChord: 1, attack: .02, release: .9, melody: .18,
    // Cmaj7, Am7, Dm7, G6: jasno i życzliwie
    chords: [[48, 52, 55, 59], [45, 48, 52, 55], [50, 53, 57, 60], [43, 47, 50, 52]],
    scale: [72, 74, 76, 79, 81],
  };
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  let ac = null, out = null, wobble = null, noise = null, timer = 0, next = 0, step = 0, muted = false;
  const hz = m => 440 * 2 ** ((m - 69) / 12);
  const sixteenth = 60 / CONFIG.bpm / 4;
  function init() {
    ac = new AC();
    out = ac.createGain(); out.gain.value = 0;
    const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 2400;
    out.connect(tape).connect(ac.destination);
    out.gain.setTargetAtTime(muted ? 0 : CONFIG.volume, ac.currentTime, 1.5);
    // lekkie falowanie taśmy
    const lfo = ac.createOscillator(); lfo.frequency.value = .35;
    wobble = ac.createGain(); wobble.gain.value = 7;
    lfo.connect(wobble); lfo.start();
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // szum płyty: cichy syk i rzadkie trzaski
    const vinyl = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), v = vinyl.getChannelData(0);
    for (let i = 0; i < v.length; i++) v[i] = (Math.random() * 2 - 1) * .015 + (Math.random() < .0004 ? (Math.random() - .5) * .9 : 0);
    const crackle = ac.createBufferSource(); crackle.buffer = vinyl; crackle.loop = true;
    const cg = ac.createGain(); cg.gain.value = .5;
    crackle.connect(cg).connect(out); crackle.start();
    next = ac.currentTime + .1;
    timer = setInterval(schedule, 50);
  }
  function note(m, t, len, vol) {
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o1.type = 'sine'; o2.type = 'triangle';
    o1.frequency.value = hz(m); o2.frequency.value = hz(m) * 2.001;
    wobble.connect(o1.detune); wobble.connect(o2.detune);
    const g2 = ac.createGain(); g2.gain.value = .12;
    f.type = 'lowpass'; f.frequency.value = 1700;
    o1.connect(g); o2.connect(g2).connect(g); g.connect(f).connect(out);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + CONFIG.attack);
    g.gain.setTargetAtTime(vol * .45, t + CONFIG.attack, .3);
    g.gain.setTargetAtTime(0, t + len, CONFIG.release / 4);
    for (const o of [o1, o2]) { o.start(t); o.stop(t + len + CONFIG.release * 1.5); }
  }
  function hit(type, freq, vol, len, t) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + len);
    s.connect(f).connect(g).connect(out); s.start(t, Math.random(), len + .02);
  }
  function kick(t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .25);
    g.gain.setValueAtTime(.55, t); g.gain.exponentialRampToValueAtTime(.001, t + .35);
    o.connect(g).connect(out); o.start(t); o.stop(t + .4);
  }
  function schedule() {
    while (next < ac.currentTime + .25) {
      const s = step % 16, bar = Math.floor(step / 16);
      // swing: co druga szesnastka lekko spóźniona
      const t = next + (s % 2 ? sixteenth * .18 : 0);
      const chord = CONFIG.chords[Math.floor(bar / CONFIG.barsPerChord) % CONFIG.chords.length];
      const barLen = sixteenth * 16 * CONFIG.barsPerChord;
      if (s === 0 && bar % CONFIG.barsPerChord === 0) chord.forEach((m, k) => note(m, t + k * .018, barLen * .92, .07));
      if (s === 0 || s === 10) note(chord[0] - 12, t, sixteenth * 5, .16);
      if (CONFIG.beat) {
        if (s === 0 || s === 7 || s === 10) kick(t);
        if (s === 4 || s === 12) hit('bandpass', 1900, .18, .16, t);
        if (s % 2 === 0) hit('highpass', 7500, s % 4 ? .035 : .06, .05, t);
      }
      if (s % 2 === 0 && Math.random() < CONFIG.melody) note(CONFIG.scale[Math.floor(Math.random() * CONFIG.scale.length)], t, sixteenth * 3, .045);
      next += sixteenth;
      step++;
    }
  }
  function start() { if (!ac) init(); else if (ac.state === 'suspended' && !document.hidden) ac.resume(); }
  addEventListener('pointerdown', start);
  addEventListener('keydown', start);
  document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else ac.resume(); });
  const mute = document.getElementById('mute');
  if (mute) mute.addEventListener('click', () => {
    muted = !muted;
    if (out) out.gain.setTargetAtTime(muted ? 0 : CONFIG.volume, ac.currentTime, .2);
  });
})();
