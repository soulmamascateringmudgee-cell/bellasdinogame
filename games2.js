/* Harder games: Dino Match, Dino Puzzle, Spot the Difference, Alphabet, Count to 30. */
(function () {
  const { games, prompt, later, animate, starsAt, win, pick, shuffle, stage, isBusy, setBusy } = G;
  const busy = isBusy;

  /* ---------- 1. Dino Match (memory pairs) ---------- */
  games.match = {
    levels: [3, 4, 6],
    start() { this.lvl = 0; this.next(); },
    next() {
      if (this.lvl >= this.levels.length) return win();
      const pairs = this.levels[this.lvl++];
      stage.innerHTML = "";
      prompt(`Find the pairs! 🃏 (${pairs} pairs)`, "match_prompt");
      const dinos = pick(DINOS, pairs);
      const cards = shuffle([...dinos, ...dinos]);
      const grid = document.createElement("div"); grid.className = "mgrid";
      const cols = pairs <= 3 ? 3 : 4;
      grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      grid.style.width = cols === 3 ? "min(96vw, 80vmin)" : "min(96vw, 100vmin)";
      let first = null, matched = 0;
      cards.forEach(d => {
        const c = document.createElement("button"); c.className = "mcard"; c.dataset.id = d.id;
        c.innerHTML = `<div class="back">🥚</div><div class="front">${makeDino(d.id, d.colour)}</div>`;
        c.onclick = () => {
          if (busy() || c.classList.contains("up")) return;
          c.classList.add("up"); SFX.pop();
          if (!first) { first = c; return; }
          const a = first; first = null; setBusy(true);
          if (a.dataset.id === c.dataset.id) {
            later(() => {
              a.classList.add("matched"); c.classList.add("matched"); SFX.yay(); starsAt(c);
              SFX.dino(d.id); VOICE.line("match_yes"); matched++;
              setBusy(false);
              if (matched === pairs) { setBusy(true); later(() => { SFX.fanfare(); }, 400); later(() => { setBusy(false); this.next(); }, 2600); }
            }, 350);
          } else {
            later(() => { SFX.oops(); VOICE.line("match_no"); }, 350);
            later(() => { a.classList.remove("up"); c.classList.remove("up"); setBusy(false); }, 1500);
          }
        };
        grid.appendChild(c);
      });
      stage.appendChild(grid);
    }
  };

  /* ---------- 2. Dino Puzzle (tap a piece, tap its place) ---------- */
  games.puzzle = {
    levels: [[2, 2], [3, 2], [3, 3]],
    start() { this.lvl = 0; this.next(); },
    next() {
      if (this.lvl >= this.levels.length) return win();
      const [cols, rows] = this.levels[this.lvl++];
      const d = pick(DINOS, 1)[0];
      stage.innerHTML = "";
      prompt(`Make the ${d.name}! 🧩`, "puzzle_prompt");
      const wrap = document.createElement("div"); wrap.className = "pz";
      const portrait = window.innerHeight > window.innerWidth;
      const size = Math.min(window.innerWidth * 0.9, window.innerHeight * (portrait ? 0.42 : 0.5), 520);
      const t = portrait ? 0.55 : 0.6;   // tray pieces are shown smaller so they all fit
      const cw = size / cols, ch = size / rows;
      const board = document.createElement("div"); board.className = "pz-board";
      board.style.width = size + "px"; board.style.height = size + "px";
      board.innerHTML = `<div class="pz-ghost">${makeDino(d.id, d.colour)}</div>`;
      const svg = makeDino(d.id, d.colour);
      const slots = [], pieces = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const slot = document.createElement("div"); slot.className = "pz-slot"; slot.dataset.i = i;
        slot.style.cssText = `left:${c * cw}px;top:${r * ch}px;width:${cw}px;height:${ch}px`;
        board.appendChild(slot); slots.push(slot);
        const piece = document.createElement("button"); piece.className = "pz-piece"; piece.dataset.i = i;
        piece.style.width = cw + "px"; piece.style.height = ch + "px";
        piece.innerHTML = svg;
        const inner = piece.firstElementChild;
        inner.style.width = size + "px"; inner.style.height = size + "px";
        inner.style.transform = `translate(${-c * cw}px, ${-r * ch}px)`;
        pieces.push(piece);
      }
      const tray = document.createElement("div"); tray.className = "pz-tray";
      shuffle(pieces).forEach(p => {
        const holder = document.createElement("div"); holder.className = "pz-holder";
        holder.style.width = cw * t + "px"; holder.style.height = ch * t + "px";
        p.style.transformOrigin = "top left"; p.style.transform = `scale(${t})`;
        holder.appendChild(p); tray.appendChild(holder);
      });
      let selected = null, placed = 0;
      pieces.forEach(p => {
        p.onclick = () => {
          if (busy() || p.classList.contains("placed")) return;
          pieces.forEach(x => { x.classList.remove("selected"); if (!x.classList.contains("placed")) x.style.transform = `scale(${t})`; });
          selected = p; p.classList.add("selected"); p.style.transform = `scale(${t * 1.1})`; SFX.tap();
        };
      });
      slots.forEach(slot => {
        slot.onclick = () => {
          if (busy() || !selected || slot.classList.contains("filled")) return;
          if (selected.dataset.i === slot.dataset.i) {
            const holder = selected.parentElement;
            selected.classList.remove("selected"); selected.classList.add("placed");
            selected.style.transform = "none"; selected.style.position = "absolute"; selected.style.left = "0"; selected.style.top = "0";
            slot.appendChild(selected); slot.classList.add("filled"); if (holder && holder.classList.contains("pz-holder")) holder.remove();
            SFX.pop(); starsAt(slot);
            selected = null; placed++;
            if (placed === pieces.length) {
              setBusy(true); board.classList.add("done"); SFX.fanfare(); VOICE.line("puzzle_done"); SFX.dino(d.id);
              later(() => { setBusy(false); this.next(); }, 3000);
            }
          } else { animate(selected, "wobble"); SFX.oops(); }
        };
      });
      wrap.appendChild(board); wrap.appendChild(tray); stage.appendChild(wrap);
    }
  };

  /* ---------- 3. Spot the Difference ---------- */
  games.spot = {
    levels: [1, 2, 3],
    things: ["🌸", "☀️", "🌳", "🍄", "🦋", "🐌", "🌈", "🪨"],
    start() { this.lvl = 0; this.next(); },
    render(item) {
      return item.emoji ? item.emoji : makeDino(item.id, item.colour, { role: item.role || "none" });
    },
    next() {
      if (this.lvl >= this.levels.length) return win();
      const k = this.levels[this.lvl++];
      stage.innerHTML = "";
      prompt(`Spot the difference! 🔍 (${k})`, "spot_prompt");
      // scene A: 4 dinos + 2 things in 6 cells
      const dinos = pick(DINOS, 4).map(d => ({ id: d.id, colour: d.colour }));
      const things = pick(this.things, 2).map(e => ({ emoji: e }));
      const a = shuffle([...dinos, ...things]);
      const b = a.map(x => ({ ...x }));
      const changed = pick([0, 1, 2, 3, 4, 5], k);
      changed.forEach(i => {
        const x = b[i];
        if (x.emoji) { x.emoji = pick(this.things.filter(e => e !== x.emoji), 1)[0]; }
        else {
          const how = Math.random();
          if (how < 0.4) x.colour = pick(Object.keys(COLOURS).filter(c => c !== x.colour), 1)[0];
          else if (how < 0.7) x.role = "mum";
          else x.id = pick(DINOS.filter(d => d.id !== x.id && !a.some(y => y.id === d.id)), 1)[0].id;
        }
      });
      const wrap = document.createElement("div"); wrap.className = "spot";
      const cellsA = [], cellsB = [];
      const found = new Set();
      const makePic = (scene, n, cells) => {
        const pic = document.createElement("div"); pic.className = "spot-pic";
        pic.innerHTML = `<span class="num">${n}</span>`;
        const g = document.createElement("div"); g.className = "spot-grid";
        scene.forEach((item, i) => {
          const c = document.createElement("button"); c.className = "spot-cell"; c.innerHTML = this.render(item);
          c.onclick = () => {
            if (busy()) return;
            if (changed.includes(i)) {
              if (found.has(i)) return;
              found.add(i); cellsA[i].classList.add("found"); cellsB[i].classList.add("found");
              SFX.yay(); starsAt(cellsB[i]);
              if (found.size === k) { setBusy(true); VOICE.line("spot_yes"); later(() => SFX.fanfare(), 600); later(() => { setBusy(false); this.next(); }, 2800); }
              else VOICE.line(["spot_yes", "spot_more"]);
            } else { animate(c, "wobble"); SFX.oops(); VOICE.line("spot_no"); }
          };
          cells.push(c); g.appendChild(c);
        });
        pic.appendChild(g); return pic;
      };
      wrap.appendChild(makePic(a, 1, cellsA)); wrap.appendChild(makePic(b, 2, cellsB));
      stage.appendChild(wrap);
    }
  };

  /* ---------- 4. Alphabet ---------- */
  games.abc = {
    rounds: 6,
    words: { A: ["Ankylosaurus", "🦕"], B: ["Brachiosaurus", "🦕"], C: ["cake", "🍰"], D: ["dinosaur", "🦖"], E: ["egg", "🥚"], F: ["fish", "🐟"], G: ["grapes", "🍇"], H: ["hat", "🎩"], I: ["ice cream", "🍦"], J: ["jelly", "🍮"], K: ["kite", "🪁"], L: ["lion", "🦁"], M: ["moon", "🌙"], N: ["nest", "🪺"], O: ["octopus", "🐙"], P: ["Pterodactyl", "🦅"], Q: ["queen", "👑"], R: ["rainbow", "🌈"], S: ["Stegosaurus", "🦕"], T: ["T-Rex", "🦖"], U: ["umbrella", "☂️"], V: ["volcano", "🌋"], W: ["whale", "🐳"], X: ["xylophone", "🎶"], Y: ["yo-yo", "🪀"], Z: ["zebra", "🦓"] },
    start() { this.round = 0; this.queue = shuffle(Object.keys(this.words)); this.next(); },
    next() {
      if (this.round >= this.rounds) return win();
      this.round++;
      const target = this.queue.shift();
      const others = pick(Object.keys(this.words).filter(l => l !== target), 3);
      stage.innerHTML = "";
      prompt(`Find the letter <b>${target}</b>`, "letter_" + target);
      const word = document.createElement("div"); word.className = "abc-word";
      const row = document.createElement("div"); row.className = "abc-row";
      shuffle([target, ...others]).forEach(l => {
        const b = document.createElement("button"); b.className = "letter"; b.textContent = l;
        b.onclick = () => {
          if (busy()) return;
          if (l === target) {
            setBusy(true); animate(b, "happy"); starsAt(b); SFX.yay();
            const [w, e] = this.words[l];
            word.innerHTML = `<span class="big">${e}</span>${l} is for ${w}`;
            VOICE.line("yes");
            later(() => { setBusy(false); this.next(); }, 2600);
          } else { animate(b, "wobble"); SFX.oops(); VOICE.line(["oops", "letter_" + target]); }
        };
        row.appendChild(b);
      });
      stage.appendChild(row); stage.appendChild(word);
    }
  };

  /* ---------- 5. Count to 30 ---------- */
  games.count30 = {
    start() {
      stage.innerHTML = "";
      prompt("Count to 30! 🔢", "c30_prompt");
      const grid = document.createElement("div"); grid.className = "c30";
      const rider = `<span class="rider">${makeDino("trex", "green", { role: "baby" })}</span>`;
      let next = 1, hintTimer = null;
      const cells = [];
      const hint = () => { clearTimeout(hintTimer); cells.forEach(c => c.classList.remove("hint")); hintTimer = setTimeout(() => { const c = cells[next - 1]; if (c) c.classList.add("hint"); }, 4000); };
      for (let n = 1; n <= 30; n++) {
        const c = document.createElement("button"); c.className = "n" + (n % 10 === 0 ? " ten" : "") + (n === 1 ? " next" : "");
        c.textContent = n;
        c.onclick = () => {
          if (busy()) return;
          if (n === next) {
            c.classList.add("done"); c.classList.remove("next", "hint");
            cells.forEach(x => { const r = x.querySelector(".rider"); if (r) r.remove(); });
            c.insertAdjacentHTML("beforeend", rider);
            SFX.count(((n - 1) % 8) + 1); starsAt(c);
            if (n === 30) { setBusy(true); VOICE.line(["n30", "c30_done"]); SFX.fanfare(); clearTimeout(hintTimer); later(() => { setBusy(false); win(); }, 4500); return; }
            VOICE.line(n === 10 ? ["n10", "c30_ten"] : n === 20 ? ["n20", "c30_twenty"] : "n" + n);
            next++; cells[next - 1].classList.add("next"); hint();
          } else { animate(c, "wobble"); SFX.oops(); VOICE.line("c30_no"); hint(); }
        };
        cells.push(c); grid.appendChild(c);
      }
      stage.appendChild(grid); hint();
    }
  };
})();
