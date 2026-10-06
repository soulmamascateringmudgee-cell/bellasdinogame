/* Bella's Dino Land — game logic. Tap-only, no reading needed, every prompt is spoken. */
(function () {
  const $ = s => document.querySelector(s);
  const screens = { start: $("#screen-start"), home: $("#screen-home"), game: $("#screen-game"), win: $("#screen-win") };
  const stage = $("#stage"), promptEl = $("#prompt"), starsEl = $("#stars");
  const PLAYER = "Bella";
  let current = null;      // current game id
  let busy = false;        // blocks taps during little animations
  let timers = [];

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const dinoById = id => DINOS.find(d => d.id === id);

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
  }
  function prompt(html, speech) {
    promptEl.innerHTML = html;
    VOICE.say(speech || promptEl.textContent);
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
    VOICE.say(`Hooray ${PLAYER}! You did it! Clever girl!`);
  }

  /* ---------------- Games ---------------- */
  const games = {};

  // 1. Meet the Dinos — tap a dino to hear its name and a fun fact.
  games.meet = {
    start() {
      prompt("Tap a dinosaur! 🦖", "Tap a dinosaur to say hello!");
      DINOS.forEach(d => {
        const card = dinoCard(d);
        card.insertAdjacentHTML("beforeend", `<div class="label">${d.name}</div>`);
        card.onclick = () => {
          animate(card, "bounce"); starsAt(card);
          SFX[dinoSound[d.id]]();
          later(() => VOICE.say(`This is ${d.say}! ${d.fact}`), 350);
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
      prompt(`Find the <span style="color:${COLOURS[target]}">${target.toUpperCase()}</span> dinosaur!`, `Find the ${target} dinosaur!`);
      shuffle(cols.map((c, i) => ({ c, d: types[i] }))).forEach(({ c, d }) => {
        const card = dinoCard(d, c);
        card.onclick = () => {
          if (busy) return;
          if (c === target) {
            busy = true;
            animate(card, "happy"); starsAt(card); SFX.yay();
            VOICE.say(`Yes! ${target}! Well done!`);
            later(() => { busy = false; this.next(); }, 1800);
          } else {
            animate(card, "wobble"); SFX.oops();
            VOICE.say(`That one is ${c}. Can you find ${target}?`);
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
      prompt("Tap the eggs to count! 🥚", "Tap the eggs to count them!");
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
          VOICE.say(String(counted));
          if (counted === n) {
            busy = true;
            later(() => {
              row.querySelectorAll(".egg").forEach(e => { e.firstChild.textContent = "🐣"; animate(e, "happy"); });
              SFX.yay(); starsAt(row);
              VOICE.say(`${n} ${n === 1 ? "egg" : "eggs"}! ${n} baby ${n === 1 ? "dinosaur" : "dinosaurs"}! Hooray!`);
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
      prompt(`${d.name} is hungry! ${food.emoji}`, `${d.say} is hungry! ${d.say} eats ${food.name}. Tap the ${food.name}!`);
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
            VOICE.say(`Yum yum yum! Thank you ${PLAYER}!`);
            later(() => { busy = false; this.next(); }, 2600);
          } else {
            animate(f, "wobble"); SFX.oops();
            VOICE.say(`Hmm, not ${FOODS[k].name}. ${d.say} eats ${food.name}.`);
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
      prompt("Make some music! 🎵", "Tap the dinosaurs to make dino music!");
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
      prompt(`Which one is <b>${want.toUpperCase()}</b>?`, `Which dinosaur is ${want}? Tap the ${want} one!`);
      const cards = shuffle([{ d: a, size: "large", is: "big" }, { d: b, size: "small", is: "small" }]);
      cards.forEach(({ d, size, is }) => {
        const card = dinoCard(d, null, size);
        card.onclick = () => {
          if (busy) return;
          if (is === want) {
            busy = true;
            animate(card, "happy"); starsAt(card); SFX.yay();
            VOICE.say(`Yes! That ${d.say} is ${want}! Well done!`);
            later(() => { busy = false; this.next(); }, 2000);
          } else {
            animate(card, "wobble"); SFX.oops();
            VOICE.say(`That one is ${is}. Can you find the ${want} one?`);
          }
        };
        stage.appendChild(card);
      });
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
    VOICE.say("Pick a game!");
  }

  $("#start-dino").innerHTML = makeDino("trex");
  $("#btn-start").onclick = () => {
    SFX.unlock(); SFX.chirp();
    VOICE.say(`Hello ${PLAYER}! Let's play with the dinosaurs!`);
    show("home");
  };
  document.querySelectorAll(".menu-btn").forEach(b => {
    b.onclick = () => { SFX.tap(); startGame(b.dataset.game); };
  });
  $("#btn-home").onclick = () => { SFX.tap(); goHome(); };
  $("#btn-repeat").onclick = () => { SFX.tap(); VOICE.repeat(); };
  $("#btn-again").onclick = () => { SFX.tap(); startGame(current); };
  $("#btn-win-home").onclick = () => { SFX.tap(); goHome(); };

  // Keep the screen from scrolling/zooming under little fingers.
  document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturestart", e => e.preventDefault());
  document.addEventListener("dblclick", e => e.preventDefault());
})();
