/* Voice: plays a grown-up's recorded clips when they exist, otherwise the device's text-to-speech.
   VOICE.line(id | [ids])  – say one or more lines from lines.js
   VOICE.say(text)         – text-to-speech only (used for voice previews)
   Recording: VOICE.rec.start(id) / stop() / play(id) / remove(id) / clear() / has(id) / count() */
(function () {
  /* ---------- text-to-speech ---------- */
  const VKEY = "dinoland.voice";
  let voice = null, voicesReady = false;
  function score(v) {
    const n = (v.name + " " + v.voiceURI).toLowerCase(), l = (v.lang || "").toLowerCase();
    if (!/^en/.test(l)) return -1;
    let sc = 0;
    if (/premium/.test(n)) sc += 50;
    if (/enhanced/.test(n)) sc += 40;
    if (/natural|neural|online|wavenet|journey|studio/.test(n)) sc += 45;
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
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function speak(text) {
    return new Promise(resolve => {
      if (!("speechSynthesis" in window)) return resolve();
      if (!voicesReady) pickVoice();
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-AU";
        u.rate = 0.95; u.pitch = 1.0; u.volume = 1;
        u.onend = u.onerror = () => resolve();
        setTimeout(() => speechSynthesis.speak(u), 60);
        setTimeout(resolve, 15000);   // never hang the game
      } catch (e) { resolve(); }
    });
  }
  function setVoice(uri) {
    const v = englishVoices().find(x => x.voiceURI === uri || x.name === uri);
    if (v) { voice = v; try { localStorage.setItem(VKEY, v.voiceURI); } catch (e) {} }
  }
  function label(v) {
    const n = (v.name + " " + v.voiceURI).toLowerCase();
    const q = /premium/.test(n) ? " ★★★" : /enhanced|natural|neural|online|wavenet/.test(n) ? " ★★" : "";
    return `${v.name}${q} (${v.lang})`;
  }

  /* ---------- recorded clips (IndexedDB) ---------- */
  const clips = new Map();        // id -> { blob, buffer }
  let db = null;
  function openDB() {
    return new Promise((resolve) => {
      if (!("indexedDB" in window)) return resolve(null);
      const req = indexedDB.open("dinoland", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("clips");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }
  async function loadClips() {
    db = await openDB(); if (!db) return;
    await new Promise(resolve => {
      const tx = db.transaction("clips", "readonly"), st = tx.objectStore("clips");
      const ks = st.getAllKeys(), vs = st.getAll();
      tx.oncomplete = () => { ks.result.forEach((k, i) => clips.set(k, { blob: vs.result[i], buffer: null })); resolve(); };
      tx.onerror = () => resolve();
    });
  }
  function putClip(id, blob) {
    clips.set(id, { blob, buffer: null });
    if (!db) return;
    const tx = db.transaction("clips", "readwrite"); tx.objectStore("clips").put(blob, id);
  }
  function delClip(id) {
    const c = clips.get(id); if (c && c.url) URL.revokeObjectURL(c.url);
    clips.delete(id);
    if (!db) return;
    const tx = db.transaction("clips", "readwrite"); tx.objectStore("clips").delete(id);
  }
  function clearClips() {
    clips.forEach(c => { if (c.url) URL.revokeObjectURL(c.url); });
    clips.clear();
    if (!db) return;
    const tx = db.transaction("clips", "readwrite"); tx.objectStore("clips").clear();
  }
  const ready = loadClips();

  function useMine() { try { return localStorage.getItem("dinoland.useMyVoice") !== "0"; } catch (e) { return true; } }
  function setUseMine(on) { try { localStorage.setItem("dinoland.useMyVoice", on ? "1" : "0"); } catch (e) {} }

  /* Playback through one reusable <audio> element: Safari plays its own recordings reliably this way,
     and the element only needs unlocking once (on the first tap). */
  const player = new Audio();
  player.preload = "auto"; player.playsInline = true; player.setAttribute("playsinline", "");
  let unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try {
      player.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      const p = player.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  function url(id) {
    const c = clips.get(id); if (!c) return null;
    if (!c.url) c.url = URL.createObjectURL(c.blob);
    return c.url;
  }
  let playingId = null;
  function playClip(id) {
    return new Promise(resolve => {
      const u = url(id); if (!u) return resolve(false);
      let done = false;
      const finish = ok => { if (done) return; done = true; player.onended = player.onerror = null; if (playingId === id) playingId = null; resolve(ok); };
      try {
        player.pause(); player.src = u; player.currentTime = 0; player.volume = 1;
        player.onended = () => finish(true);
        player.onerror = () => finish(false);
        playingId = id;
        const p = player.play();
        if (p && p.catch) p.catch(() => finish(false));
        setTimeout(() => finish(true), 20000);
      } catch (e) { finish(false); }
    });
  }
  function hush() {
    try { player.pause(); player.onended = player.onerror = null; playingId = null; } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {}
  }

  /* ---------- the one call the game uses ---------- */
  let token = 0, last = null;
  async function line(ids) {
    ids = Array.isArray(ids) ? ids : [ids];
    last = ids;
    const my = ++token;
    hush();
    await ready;
    for (const id of ids) {
      if (my !== token) return;
      const text = LINES[id] || id;
      let ok = false;
      if (useMine() && clips.has(id)) ok = await playClip(id);
      if (my !== token) return;
      if (!ok) await speak(text);
    }
  }
  function repeat() { if (last) line(last); }
  function say(text) { hush(); last = null; speak(text); }

  /* ---------- recording ---------- */
  let stream = null, recorder = null, chunks = [], recId = null;
  const MIME = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", ""].find(m => m === "" || (window.MediaRecorder && MediaRecorder.isTypeSupported(m)));
  const rec = {
    supported: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),
    async start(id) {
      if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      hush();
      chunks = []; recId = id;
      recorder = MIME ? new MediaRecorder(stream, { mimeType: MIME }) : new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.start();
    },
    stop() {
      return new Promise(resolve => {
        if (!recorder || recorder.state === "inactive") return resolve(false);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType || MIME || "audio/webm" });
          if (blob.size > 0) putClip(recId, blob);
          recorder = null; resolve(blob.size > 0);
        };
        recorder.stop();
      });
    },
    recording: () => !!(recorder && recorder.state === "recording"),
    async play(id) { hush(); unlock(); return playClip(id); },
    remove: delClip,
    clear: clearClips,
    has: id => clips.has(id),
    count: () => clips.size,
    release() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }
  };

  window.VOICE = { line, repeat, say, hush, unlock, setVoice, current: () => voice, voices: englishVoices, label, rec, useMine, setUseMine, ready };
})();
