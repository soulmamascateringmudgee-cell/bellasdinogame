/* Bella's Dino Land — game logic. Tap-only, no reading needed, every prompt is spoken. */
(function () {
  const $ = s => document.querySelector(s);
  const screens = { start: $("#screen-start"), home: $("#screen-home"), game: $("#screen-game"), win: $("#screen-win"), voice: $("#screen-voice"), record: $("#screen-record") };
  const stage = $("#stage"), promptEl = $("#prompt"), starsEl = $("#stars");
  const PLAYER = "Bella";
  let current = null;      // current game id
  let busy = false;        // blocks taps during little animations
  let timers = [], intervals = [];

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); intervals.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; intervals.forEach(clearInterval); intervals = []; $("#night").classList.remove("on"); };
  const dinoById = id => DINOS.find(d => d.id === id);

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
  }
  function prompt(html, lineIds) {
    promptEl.innerHTML = html;
    VOICE.line(lineIds);
  }
  function animate(el, cls) {
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  }
  function starsAt(el) {
    const r = el.getBoundingClientRect(), s = starsEl.getBoundingClientRect();
    const cx = r.left + r.width / 2 - s.left, cy = r.top + r.height / 2 - s.top;
    const icons = ["⭐", "✨", "🌟", "💛"];
    for (let i = 0; i < 10; i++) {
      const st = document.createElement("span");
      st.className = "star"; st.textContent = icons[i % icons.length];
      const a = (i / 10) * Math.PI * 2, dist = 90 + Math.random() * 90;
      st.style.left = cx + "px"; st.style.top = cy + "px";
      st.style.setProperty("--dx", Math.cos(a) * dist + "px");
      st.style.setProperty("--dy", Math.sin(a) * dist - 40 + "px");
      starsEl.appendChild(st);
      setTimeout(() => st.remove(), 1000);
    }
  }
  function confetti() {
    const box = $("#confetti");
    const cols = Object.values(COLOURS);
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("span");
      c.className = "conf";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cols[i % cols.length];
      c.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
      c.style.animationDelay = Math.random() * 0.8 + "s";
      box.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }
  }
  function dinoCard(dino, colour, extra = "") {
    const el = document.createElement("button");
    el.className = "dino-card " + extra;
    el.innerHTML = makeDino(dino.id, colour || dino.colour);
    el.dataset.id = dino.id;
    return el;
  }
  const dinoSound = { trex: "roar", triceratops: "honk", stegosaurus: "stomp", brachiosaurus: "chirp", pterodactyl: "flap", ankylosaurus: "squeak" };

  function win() {
    clearTimers();
    const wd = pick(DINOS, 1)[0]; $("#win-dino").innerHTML = makeDino(wd.id, wd.colour);
    show("win");
    SFX.fanfare(); confetti();
    VOICE.line("win");
  }

  /* ---------------- Games ---------------- */
  const games = {};

  // 1. Meet the Dinos — tap a dino to hear its name and a fun fact.
  games.meet = {
    start() {
      prompt("Tap a dinosaur! 🦖", "meet_prompt");
      DINOS.forEach(d => {
        const card = dinoCard(d);
        card.insertAdjacentHTML("beforeend", `<div class="label">${d.name}</div>`);
        card.onclick = () => {
          animate(card, "bounce"); starsAt(card);
          SFX[dinoSound[d.id]]();
          later(() => VOICE.line("meet_" + d.id), 350);
        };
        stage.appendChild(card);
      });
    }
  };

  // 2. Colour Hunt — "Find the GREEN dinosaur!"
  games.colours = {
    rounds: 5,
    start() { this.round = 0; this.next(); },
    next() {
      if (this.round >= this.rounds) return win();
      this.round++;
      stage.innerHTML = "";
      const cols = pick(Object.keys(COLOURS), 3);
      const target = cols[0];
      const types = pick(DINOS, 3);
      prompt(`Find the <span style="color:${COLOURS[target]}">${target.toUpperCase()}</span> dinosaur!`, "colour_" + target);
      shuffle(cols.map((c, i) => ({ c, d: types[i] }))).forEach(({ c, d }) => {
        const card = dinoCard(d, c);
        card.onclick = () => {
          if (busy) return;
          if (c === target) {
            busy = true;
            animate(card, "happy"); starsAt(card); SFX.yay();
            VOICE.line("yes");
            later(() => { busy = false; this.next(); }, 1800);
          } else {
            animate(card, "wobble"); SFX.oops();
            VOICE.line(["oops", "colour_" + target]);
          }
        };
        stage.appendChild(card);
      });
    }
  };

  // 3. Count the Eggs — tap each egg to count; they hatch when you're done.
  games.count = {
    start() { this.round = 0; this.next(); },
    next() {
      this.round++;
      if (this.round > 5) return win();
      const n = this.round; // 1, 2, 3, 4, 5
      stage.innerHTML = "";
      prompt("Tap the eggs to count! 🥚", "count_prompt");
      const big = document.createElement("div"); big.className = "bignum"; big.textContent = "";
      const row = document.createElement("div"); row.style.cssText = "display:flex;flex-wrap:wrap;gap:14px;justify-content:center;";
      let counted = 0;
      for (let i = 0; i < n; i++) {
        const egg = document.createElement("button");
        egg.className = "egg"; egg.textContent = "🥚";
        egg.onclick = () => {
          if (egg.classList.contains("cracked")) return;
          counted++;
          egg.classList.add("cracked");
          egg.insertAdjacentHTML("beforeend", `<span class="num">${counted}</span>`);
          SFX.pop(); SFX.count(counted);
          big.textContent = counted;
          VOICE.line("n" + counted);
          if (counted === n) {
            busy = true;
            later(() => {
              row.querySelectorAll(".egg").forEach(e => { e.firstChild.textContent = "🐣"; animate(e, "happy"); });
              SFX.yay(); starsAt(row);
              VOICE.line("eggs_" + n);
              later(() => { busy = false; this.next(); }, 3200);
            }, 900);
          }
        };
        row.appendChild(egg);
      }
      stage.appendChild(big); stage.appendChild(row);
    }
  };

  // 4. Feed Me — give each dino the food it eats.
  games.feed = {
    start() { this.queue = shuffle(DINOS); this.next(); },
    next() {
      const d = this.queue.shift();
      if (!d) return win();
      stage.innerHTML = "";
      const food = FOODS[d.food];
      prompt(`${d.name} is hungry! ${food.emoji}`, "feed_" + d.id);
      const wrap = document.createElement("div"); wrap.className = "feed-wrap";
      const card = dinoCard(d, null, "large");
      card.onclick = () => { animate(card, "bounce"); SFX[dinoSound[d.id]](); };
      const row = document.createElement("div"); row.className = "food-row";
      shuffle(Object.keys(FOODS)).forEach(k => {
        const f = document.createElement("button");
        f.className = "food"; f.textContent = FOODS[k].emoji;
        f.onclick = () => {
          if (busy) return;
          if (k === d.food) {
            busy = true;
            f.classList.add("gone"); SFX.munch();
            later(() => { animate(card, "happy"); starsAt(card); SFX.yay(); }, 500);
            VOICE.line("yum");
            later(() => { busy = false; this.next(); }, 2600);
          } else {
            animate(f, "wobble"); SFX.oops();
            VOICE.line(["hmm", "feed_" + d.id]);
          }
        };
        row.appendChild(f);
      });
      wrap.appendChild(card); wrap.appendChild(row); stage.appendChild(wrap);
    }
  };

  // 5. Dino Band — free play, every dino makes its own sound.
  games.band = {
    start() {
      prompt("Make some music! 🎵", "band_prompt");
      DINOS.forEach(d => {
        const card = dinoCard(d);
        card.onclick = () => { animate(card, "bounce"); SFX[dinoSound[d.id]](); };
        stage.appendChild(card);
      });
    }
  };

  // 6. Big or Small? — tap the big one (or the small one).
  games.sizes = {
    rounds: 5,
    start() { this.round = 0; this.next(); },
    next() {
      if (this.round >= this.rounds) return win();
      this.round++;
      stage.innerHTML = "";
      const want = Math.random() < 0.5 ? "big" : "small";
      const [a, b] = pick(DINOS, 2);
      prompt(`Which one is <b>${want.toUpperCase()}</b>?`, "size_" + want);
      const cards = shuffle([{ d: a, size: "large", is: "big" }, { d: b, size: "small", is: "small" }]);
      cards.forEach(({ d, size, is }) => {
        const card = dinoCard(d, null, size);
        card.onclick = () => {
          if (busy) return;
          if (is === want) {
            busy = true;
            animate(card, "happy"); starsAt(card); SFX.yay();
            VOICE.line("size_yes_" + want);
            later(() => { busy = false; this.next(); }, 2000);
          } else {
            animate(card, "wobble"); SFX.oops();
            VOICE.line("size_no_" + is);
          }
        };
        stage.appendChild(card);
      });
    }
  };


  // 7. Dino Family — look after Mummy, Daddy and Baby (tamagotchi style, saved between visits).
  games.family = {
    KEY: "dinoland.family.v1",
    NEEDS: [["food", null], ["clean", "🛁"], ["sleep", "😴"], ["play", "⚽"]],
    RATE: { food: 4, play: 6, sleep: 9, clean: 12 },   // minutes per heart lost
    ROLE: { dad: { label: "Daddy", pitch: 0.6 }, mum: { label: "Mummy", pitch: 1 }, baby: { label: "Baby", pitch: 1.7 } },
    load() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
    save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.db)); } catch (e) {} },
    fresh() { const now = Date.now(); return { food: 3, clean: 3, sleep: 3, play: 3, last: { food: now, clean: now, sleep: now, play: now } }; },
    fam() { return this.db.fam[this.db.species]; },
    decay() {
      const now = Date.now();
      Object.values(this.fam().members).forEach(m => {
        Object.keys(this.RATE).forEach(k => {
          const ms = this.RATE[k] * 60000, drops = Math.floor((now - m.last[k]) / ms);
          if (drops > 0) { m[k] = Math.max(0, m[k] - drops); m.last[k] += drops * ms; }
        });
      });
      this.save();
    },
    start() {
      this.db = this.load();
      if (!this.db.fam) this.db.fam = {};
      this.selected = null; this.excited = null;
      if (!this.db.species) this.picker(); else this.scene(true);
    },
    picker() {
      stage.innerHTML = "";
      prompt("Pick your dino family! 🏡", "fam_pick");
      const grid = document.createElement("div"); grid.className = "fam-pick";
      DINOS.forEach(d => {
        const card = document.createElement("button"); card.className = "dino-card";
        card.innerHTML = makeDino(d.id, d.colour, { role: "mum" }) + `<div class="label">${d.name}</div>`;
        card.onclick = () => {
          SFX.dino(d.id); animate(card, "bounce");
          this.db.species = d.id;
          if (!this.db.fam[d.id]) this.db.fam[d.id] = { hatched: false, taps: 0, members: { dad: this.fresh(), mum: this.fresh(), baby: this.fresh() } };
          this.save(); this.selected = null;
          later(() => this.scene(true), 500);
        };
        grid.appendChild(card);
      });
      stage.appendChild(grid);
    },
    species() { return dinoById(this.db.species); },
    mood(role) {
      const m = this.fam().members[role];
      if (m.sleeping) return "sleepy";
      if (this.excited === role) return "excited";
      if (m.food <= 1) return "hungry";
      return "happy";
    },
    lowest(role) {
      const m = this.fam().members[role];
      if (m.sleeping) return "💤";
      const low = this.NEEDS.filter(([k]) => m[k] <= 1).sort((a, b) => m[a[0]] - m[b[0]])[0];
      if (!low) return null;
      return low[1] || FOODS[this.species().food].emoji;
    },
    eggSVG(taps) {
      const cracks = [
        "", "M44 40 l6 8 l-5 7",
        "M44 40 l6 8 l-5 7 M62 70 l-7 6 l6 7",
        "M44 40 l6 8 l-5 7 l7 6 M62 70 l-7 6 l6 7 M30 80 l8 -4 l3 8",
        "M44 40 l6 8 l-5 7 l7 6 l-4 9 M62 70 l-7 6 l6 7 l-8 5 M30 80 l8 -4 l3 8 l6 2 M70 45 l-6 6 l5 6"
      ][Math.min(taps, 4)];
      return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="66" rx="38" ry="48" fill="#fff6d5" stroke="#3b2f4a" stroke-width="4"/>
        <ellipse cx="38" cy="48" rx="10" ry="14" fill="#fff" opacity=".7"/>
        <circle cx="62" cy="52" r="5" fill="#bfe3c0"/><circle cx="40" cy="86" r="6" fill="#bfe3c0"/><circle cx="66" cy="92" r="4" fill="#bfe3c0"/>
        <path d="${cracks}" stroke="#3b2f4a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    },
    scene(greet) {
      this.decay();
      const d = this.species(), f = this.fam();
      if (!this.selected) this.selected = f.hatched ? "baby" : "mum";
      stage.innerHTML = "";
      const wrap = document.createElement("div"); wrap.className = "family";

      // needs bar for the selected family member
      const m = f.members[this.selected];
      const bar = document.createElement("div"); bar.className = "needs";
      bar.innerHTML = `<span class="who">${this.ROLE[this.selected].label}</span>` + this.NEEDS.map(([k, icon]) =>
        `<span class="need">${icon || FOODS[d.food].emoji}<span class="hearts">${"❤️".repeat(m[k])}${"🤍".repeat(3 - m[k])}</span></span>`).join("");
      wrap.appendChild(bar);

      // the scene: nest, trees, dad, baby/egg, mum
      const sc = document.createElement("div"); sc.className = "scene";
      sc.innerHTML = `<span class="deco" style="left:2%;bottom:6vmin">🌴</span><span class="deco" style="right:2%;bottom:6vmin">🌳</span><span class="deco" style="left:12%;bottom:4vmin;font-size:4vmin">🌸</span><span class="deco" style="right:14%;bottom:3vmin;font-size:4vmin">🌼</span>`;
      const member = role => {
        const mm = f.members[role];
        const el = document.createElement("button");
        el.className = `member ${role}` + (this.selected === role ? " selected" : "");
        el.innerHTML = makeDino(d.id, d.colour, { role, mood: this.mood(role), mud: mm.clean === 0 }) + `<span class="tag">${this.ROLE[role].label}</span>`;
        const want = this.lowest(role);
        if (want) el.insertAdjacentHTML("beforeend", `<span class="bubble">${want}</span>`);
        el.onclick = () => {
          if (busy) return;
          this.selected = role;
          SFX.dino(d.id, this.ROLE[role].pitch);
          VOICE.line(mm.sleeping ? "sleeping" : role + "_" + (Math.random() < 0.5 ? 1 : 2));
          this.scene(); animate(stage.querySelector(`.member.${role}`), "bounce");
        };
        return el;
      };
      sc.appendChild(member("dad"));
      if (f.hatched) sc.appendChild(member("baby"));
      else {
        const egg = document.createElement("button"); egg.className = "egg-btn";
        egg.innerHTML = this.eggSVG(f.taps) + `<span class="tag" style="font-weight:900;color:#fff;background:rgba(0,0,0,.25);border-radius:999px;padding:2px 12px">Egg</span>`;
        egg.onclick = () => {
          if (busy) return;
          f.taps++; this.save();
          SFX.crack(); animate(egg, "wiggle");
          egg.firstElementChild.outerHTML = this.eggSVG(f.taps);
          if (f.taps >= 5) {
            busy = true; f.hatched = true; this.save();
            SFX.fanfare(); confetti(); starsAt(egg);
            VOICE.line("hatched");
            this.selected = "baby"; this.excited = "baby";
            later(() => { busy = false; this.scene(); }, 1200);
            later(() => { this.excited = null; this.scene(); }, 5000);
          } else VOICE.line("egg_" + Math.min(f.taps, 4));
        };
        sc.appendChild(egg);
      }
      sc.appendChild(member("mum"));
      wrap.appendChild(sc);

      // action buttons
      const acts = document.createElement("div"); acts.className = "actions";
      const btn = (icon, label, fn, cls = "") => { const b = document.createElement("button"); b.className = "act " + cls; b.innerHTML = `${icon}<small>${label}</small>`; b.onclick = () => { if (busy) return; SFX.tap(); fn(); }; acts.appendChild(b); };
      btn(FOODS[d.food].emoji, "Feed", () => this.act("food"));
      btn("🛁", "Bath", () => this.act("clean"));
      btn("😴", "Sleep", () => this.act("sleep"));
      btn("⚽", "Play", () => this.act("play"));
      btn("💕", "Cuddle", () => this.act("cuddle"), "alt");
      btn("🏡", "Family", () => { this.db.species = null; this.save(); this.picker(); }, "alt");
      wrap.appendChild(acts);
      stage.appendChild(wrap);

      if (greet) {
        if (!f.hatched) prompt(`Mummy ${d.name} has an egg! 🥚`, "fam_egg");
        else prompt(`The ${d.name} family 🏡`, "fam_intro");
        every(() => { if (!busy) this.scene(); }, 20000);
      }
    },
    flyer(text, fromEl, toEl, cls) {
      const s = stage.getBoundingClientRect(), a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      const el = document.createElement("span"); el.className = "flyer"; el.textContent = text;
      el.style.left = (a.left + a.width / 2 - s.left - 20) + "px"; el.style.top = (a.top + a.height / 2 - s.top - 20) + "px";
      el.style.setProperty("--tx", (b.left + b.width / 2 - a.left - a.width / 2) + "px");
      el.style.setProperty("--ty", (b.top + b.height / 2 - a.top - a.height / 2) + "px");
      el.style.animation = cls || "flyto .6s ease-in forwards";
      stage.appendChild(el); setTimeout(() => el.remove(), 2500);
    },
    floaters(toEl, icons, n = 8) {
      const s = stage.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      for (let i = 0; i < n; i++) {
        const el = document.createElement("span"); el.className = "flyer"; el.textContent = icons[i % icons.length];
        el.style.left = (b.left - s.left + Math.random() * b.width) + "px"; el.style.top = (b.top - s.top + b.height * 0.6) + "px";
        el.style.animation = `floatup ${1 + Math.random() * 0.8}s ease-out ${i * 0.12}s forwards`;
        stage.appendChild(el); setTimeout(() => el.remove(), 2500);
      }
    },
    finish(role, lineId, delay = 2200) {
      this.excited = role; this.save(); this.scene();
      VOICE.line(lineId);
      later(() => { busy = false; this.excited = null; this.scene(); }, delay);
    },
    act(kind) {
      const d = this.species(), f = this.fam(), role = this.selected, m = f.members[role];
      const label = this.ROLE[role].label;
      const el = stage.querySelector(`.member.${role}`);
      if (!el) { VOICE.line("egg_first"); return; }
      if (m.sleeping && kind !== "sleep") { VOICE.line("sleeping"); return; }
      busy = true;
      const btnEl = [...stage.querySelectorAll(".act")][{ food: 0, clean: 1, sleep: 2, play: 3, cuddle: 4 }[kind]];
      const now = Date.now();
      const fill = k => { m[k] = 3; m.last[k] = now; };
      if (kind === "food") {
        const food = FOODS[d.food];
        const full = m.food === 3;
        this.flyer(food.emoji, btnEl, el);
        later(() => { SFX.munch(); animate(el, "happy"); }, 550);
        fill("food");
        later(() => this.finish(role, full ? "full" : "yum"), 900);
      } else if (kind === "clean") {
        SFX.splash(); later(() => SFX.bubbles(), 300);
        this.floaters(el, ["🫧", "💦", "🫧"], 10); animate(el, "wiggle");
        fill("clean");
        later(() => this.finish(role, "bath"), 1200);
      } else if (kind === "sleep") {
        m.sleeping = true; this.save(); this.scene();
        $("#night").classList.add("on"); SFX.lullaby();
        starsEl.insertAdjacentHTML("beforeend", `<span class="moon on">🌙</span>`);
        VOICE.line("night");
        later(() => {
          m.sleeping = false; fill("sleep");
          $("#night").classList.remove("on"); starsEl.innerHTML = "";
          SFX.twinkle(); starsAt(stage.querySelector(`.member.${role}`) || stage);
          this.finish(role, "morning");
        }, 6000);
      } else if (kind === "play") {
        this.flyer("⚽", btnEl, el, "ballbounce .5s ease-in-out 4");
        [0, 500, 1000, 1500].forEach(t => later(() => { animate(el, "bounce"); SFX.bounce(); }, t));
        later(() => SFX.giggle(), 700);
        fill("play");
        later(() => this.finish(role, "play"), 2100);
      } else if (kind === "cuddle") {
        SFX.twinkle(); this.floaters(el, ["💕", "💗", "💖"], 9); animate(el, "happy");
        Object.keys(this.RATE).forEach(k => { m[k] = Math.min(3, m[k] + 1); });
        later(() => this.finish(role, "cuddle"), 900);
      }
    }
  };

  /* ---------------- Navigation ---------------- */
  function startGame(id) {
    clearTimers(); busy = false; current = id;
    stage.innerHTML = ""; starsEl.innerHTML = "";
    show("game");
    games[id].start();
  }
  function goHome() {
    clearTimers(); busy = false; current = null; VOICE.hush();
    show("home");
    VOICE.line("pick_game");
  }

  $("#start-dino").innerHTML = makeDino("trex");
  $("#btn-start").onclick = () => {
    SFX.unlock(); SFX.chirp();
    VOICE.line("hello");
    show("home");
  };
  document.querySelectorAll(".menu-btn").forEach(b => {
    b.onclick = () => { SFX.tap(); startGame(b.dataset.game); };
  });
  $("#btn-home").onclick = () => { SFX.tap(); goHome(); };

  // Grown-ups' voice picker
  function renderVoices() {
    const list = $("#voice-list"); list.innerHTML = "";
    const vs = VOICE.voices(), cur = VOICE.current();
    if (!vs.length) { list.innerHTML = '<div class="voice-opt">No voices found on this device yet. Tap Done and try again.</div>'; return; }
    vs.forEach(v => {
      const b = document.createElement("button");
      b.className = "voice-opt" + (cur && cur.voiceURI === v.voiceURI ? " on" : "");
      b.innerHTML = `<span>${VOICE.label(v)}</span><span class="tick">${cur && cur.voiceURI === v.voiceURI ? "✅" : ""}</span>`;
      b.onclick = () => { VOICE.setVoice(v.voiceURI); VOICE.say(`Hello ${PLAYER}! Let's play with the dinosaurs!`); renderVoices(); };
      list.appendChild(b);
    });
  }
  $("#btn-voice").onclick = () => { SFX.unlock(); show("voice"); renderVoices(); setTimeout(renderVoices, 400); };
  $("#btn-voice-back").onclick = () => { SFX.tap(); show("start"); };

  // Grown-ups: record your own voice for every line
  let recCurrent = null;
  function renderRecorder() {
    const list = $("#rec-list"); list.innerHTML = "";
    const total = Object.keys(LINES).length, done = VOICE.rec.count();
    $("#rec-progress").textContent = `${done} of ${total} lines recorded`;
    $("#rec-toggle").textContent = VOICE.useMine() ? "🔊 Using: my voice" : "🔊 Using: device voice";
    $("#rec-toggle").classList.toggle("on", VOICE.useMine());
    if (!VOICE.rec.supported()) { list.innerHTML = '<div class="rec-row">This browser can\'t record audio. Try Safari on the iPad or Chrome on Android.</div>'; return; }
    LINE_GROUPS.forEach(g => {
      list.insertAdjacentHTML("beforeend", `<h3 class="rec-group">${g.title}</h3>`);
      g.ids.forEach(id => {
        const row = document.createElement("div");
        const has = VOICE.rec.has(id), isRec = recCurrent === id;
        row.className = "rec-row" + (has ? " has" : "") + (isRec ? " rec" : "");
        row.innerHTML = `<div class="rec-text">${has ? "✅ " : ""}${LINES[id]}</div>
          <button class="rec-btn ${isRec ? "stop" : "go"}" data-id="${id}">${isRec ? "■ Stop" : has ? "● Again" : "● Record"}</button>
          <button class="rec-btn play" data-id="${id}" ${has ? "" : "disabled"}>▶</button>`;
        row.querySelector(".rec-btn.go, .rec-btn.stop").onclick = async e => {
          const b = e.currentTarget;
          if (VOICE.rec.recording()) {
            await VOICE.rec.stop(); recCurrent = null; SFX.tap(); renderRecorder();
          } else {
            try { await VOICE.rec.start(id); recCurrent = id; renderRecorder(); }
            catch (err) { alert("Microphone not allowed. Check Safari's microphone permission for this site."); }
          }
        };
        row.querySelector(".rec-btn.play").onclick = () => VOICE.rec.play(id);
        list.appendChild(row);
      });
    });
    const cur = list.querySelector(".rec-row.rec"); if (cur) cur.scrollIntoView({ block: "center" });
  }
  $("#btn-record").onclick = () => { SFX.unlock(); show("record"); renderRecorder(); };
  $("#rec-toggle").onclick = () => { VOICE.setUseMine(!VOICE.useMine()); renderRecorder(); };
  $("#rec-clear").onclick = () => { if (confirm("Delete all your recordings?")) { VOICE.rec.clear(); renderRecorder(); } };
  $("#btn-record-back").onclick = async () => { if (VOICE.rec.recording()) await VOICE.rec.stop(); VOICE.rec.release(); recCurrent = null; SFX.tap(); show("voice"); };
  $("#btn-repeat").onclick = () => { SFX.tap(); VOICE.repeat(); };
  $("#btn-again").onclick = () => { SFX.tap(); startGame(current); };
  $("#btn-win-home").onclick = () => { SFX.tap(); goHome(); };

  // Keep the screen from scrolling/zooming under little fingers.
  document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturestart", e => e.preventDefault());
  document.addEventListener("dblclick", e => e.preventDefault());
})();
