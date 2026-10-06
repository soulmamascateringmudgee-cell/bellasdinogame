/* Synthesised, gentle sound effects (Web Audio) + spoken prompts (Web Speech). No audio files needed. */
(function () {
  let ctx = null;
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = AC ? new AC() : null;
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  const _toneRef = { fn: null };
  function tone(o) { return (_toneRef.fn && _toneRef.fn !== tone ? _toneRef.fn : _tone)(o); }
  function _tone({ freq = 440, to = null, type = "sine", dur = 0.2, vol = 0.25, at = 0, attack = 0.01 }) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise({ dur = 0.12, vol = 0.2, at = 0, cutoff = 1200 }) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + at;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = cutoff;
    const g = c.createGain(); g.gain.value = vol;
    s.connect(f).connect(g).connect(c.destination);
    s.start(t);
  }

  const SFX = {
    unlock() { ac(); },
    tap() { tone({ freq: 600, to: 900, dur: 0.08, vol: 0.15 }); },
    pop() { tone({ freq: 500, to: 180, dur: 0.14, vol: 0.3 }); },
    chirp() { tone({ freq: 700, to: 1300, dur: 0.14, vol: 0.2 }); tone({ freq: 900, to: 1500, dur: 0.14, vol: 0.2, at: 0.16 }); },
    // Soft, friendly roar (low, short, rounded)
    roar() {
      tone({ freq: 140, to: 90, type: "triangle", dur: 0.5, vol: 0.35, attack: 0.05 });
      tone({ freq: 210, to: 130, type: "sine", dur: 0.45, vol: 0.18, attack: 0.05 });
    },
    squeak() { tone({ freq: 1200, to: 1700, dur: 0.1, vol: 0.18 }); tone({ freq: 1500, to: 1100, dur: 0.12, vol: 0.18, at: 0.12 }); },
    honk() { tone({ freq: 260, to: 230, type: "square", dur: 0.25, vol: 0.09 }); },
    stomp() { tone({ freq: 90, to: 50, type: "sine", dur: 0.25, vol: 0.4 }); noise({ dur: 0.1, vol: 0.12, cutoff: 500 }); },
    flap() { noise({ dur: 0.1, vol: 0.14, cutoff: 2500 }); noise({ dur: 0.1, vol: 0.14, cutoff: 2500, at: 0.15 }); },
    munch() {
      noise({ dur: 0.12, vol: 0.25, cutoff: 900 }); tone({ freq: 220, to: 160, dur: 0.1, vol: 0.15 });
      noise({ dur: 0.12, vol: 0.25, cutoff: 900, at: 0.22 }); tone({ freq: 220, to: 160, dur: 0.1, vol: 0.15, at: 0.22 });
    },
    // Gentle "try again": two soft notes, no harsh buzzer
    oops() { tone({ freq: 440, dur: 0.15, vol: 0.12 }); tone({ freq: 370, dur: 0.22, vol: 0.12, at: 0.17 }); },
    yay() { [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.22, vol: 0.2, at: i * 0.11 })); },
    fanfare() {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.28, vol: 0.22, at: i * 0.14 }));
      [262, 330, 392, 523].forEach((f, i) => tone({ freq: f, type: "sine", dur: 0.5, vol: 0.12, at: 0.98 + i * 0.03 }));
    },
    splash() { noise({ dur: 0.25, vol: 0.3, cutoff: 1800 }); tone({ freq: 300, to: 900, dur: 0.25, vol: 0.12, at: 0.05 }); },
    bubbles() { [0, 0.15, 0.28, 0.45, 0.6].forEach((t, i) => tone({ freq: 900 + i * 120, to: 1400 + i * 100, dur: 0.1, vol: 0.12, at: t })); },
    giggle() { [0, 0.12, 0.24, 0.36].forEach((t, i) => tone({ freq: 800 + i * 60, to: 1100 + i * 60, type: "triangle", dur: 0.1, vol: 0.14, at: t })); },
    lullaby() { [392, 330, 392, 330, 262].forEach((f, i) => tone({ freq: f, type: "sine", dur: 0.55, vol: 0.14, at: i * 0.5, attack: 0.08 })); },
    crack() { noise({ dur: 0.06, vol: 0.35, cutoff: 3000 }); tone({ freq: 700, to: 300, type: "triangle", dur: 0.08, vol: 0.12 }); },
    twinkle() { [1047, 1319, 1568].forEach((f, i) => tone({ freq: f, dur: 0.25, vol: 0.12, at: i * 0.08 })); },
    bounce() { tone({ freq: 300, to: 600, dur: 0.12, vol: 0.2 }); },
    // Dino voice with a pitch multiplier: dad low, mum normal, baby high
    dino(id, pitch = 1) {
      const map = { trex: "roar", triceratops: "honk", stegosaurus: "stomp", brachiosaurus: "chirp", pterodactyl: "flap", ankylosaurus: "squeak" };
      const c = ac(); if (!c) return SFX[map[id]]();
      // temporarily scale frequencies by wrapping tone
      const orig = _tone; const scaled = o => orig({ ...o, freq: o.freq * pitch, to: o.to ? o.to * pitch : null });
      _toneRef.fn = scaled; SFX[map[id]](); _toneRef.fn = null;
    },
    count(n) { tone({ freq: 440 * Math.pow(2, (n - 1) / 6), to: 440 * Math.pow(2, (n - 1) / 6) * 1.3, dur: 0.18, vol: 0.22 }); }
  };

  /* ---------- Voice ---------- */
  const VKEY = "dinoland.voice";
  let voice = null, voicesReady = false;
  function score(v) {
    const n = (v.name + " " + v.voiceURI).toLowerCase(), l = (v.lang || "").toLowerCase();
    if (!/^en/.test(l)) return -1;
    let sc = 0;
    if (/premium/.test(n)) sc += 50;
    if (/enhanced/.test(n)) sc += 40;
    if (/natural|neural|online|wavenet|journey|studio/.test(n)) sc += 45;   // Edge / Chrome / Android neural voices
    if (/google/.test(n)) sc += 20;
    if (/compact|espeak|robot/.test(n)) sc -= 30;
    if (/en-au/.test(l)) sc += 15; else if (/en-gb|en-nz|en-ie/.test(l)) sc += 8; else if (/en-us/.test(l)) sc += 5;
    if (/karen|catherine|libby|sonia|samantha|aria|jenny|zira|moira|fiona|female|woman/.test(n)) sc += 6;
    if (v.localService) sc += 2;
    return sc;
  }
  function englishVoices() {
    if (!("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices().filter(v => score(v) >= 0).sort((a, b) => score(b) - score(a));
  }
  function pickVoice() {
    const vs = englishVoices();
    if (!vs.length) return;
    voicesReady = true;
    let saved = null;
    try { saved = localStorage.getItem(VKEY); } catch (e) {}
    voice = (saved && vs.find(v => v.voiceURI === saved || v.name === saved)) || vs[0];
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  let lastText = "";
  function say(text, opts = {}) {
    lastText = text;
    if (!("speechSynthesis" in window)) return;
    if (!voicesReady) pickVoice();
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-AU";
      u.rate = opts.rate || 0.95;
      u.pitch = opts.pitch || 1.0;      // natural pitch; raising it is what makes voices sound like a robot
      u.volume = 1;
      setTimeout(() => speechSynthesis.speak(u), 60);   // iOS needs a beat after cancel()
    } catch (e) { /* voice is a bonus; never block the game */ }
  }
  function repeat() { if (lastText) say(lastText); }
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} }
  function setVoice(uri) {
    const v = englishVoices().find(x => x.voiceURI === uri || x.name === uri);
    if (v) { voice = v; try { localStorage.setItem(VKEY, v.voiceURI); } catch (e) {} }
  }
  function current() { return voice; }
  function label(v) {
    const n = (v.name + " " + v.voiceURI).toLowerCase();
    const q = /premium/.test(n) ? " ★★★" : /enhanced|natural|neural|online|wavenet/.test(n) ? " ★★" : "";
    return `${v.name}${q} (${v.lang})`;
  }

  window.SFX = SFX;
  window.VOICE = { say, repeat, hush, setVoice, current, voices: englishVoices, label };
})();
