/* Cute cartoon dinos drawn as SVG.
   makeDino(type, colourName, { mood, role }) → SVG markup
   mood: happy | excited | sleepy | hungry | dirty      role: none | mum | dad | baby
   Each dino is drawn twice: once as a thick dark silhouette (the outline), then in colour. */
(function () {
  const OUTLINE = "#3b2f4a";
  let uid = 0;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
    return "#" + ((f(n >> 16 & 255) << 16) | (f(n >> 8 & 255) << 8) | f(n & 255)).toString(16).padStart(6, "0");
  }

  // Shape helpers. Each returns {tag, attrs, fill} where fill ∈ body|dark|light|cream|<hex>
  const E = (cx, cy, rx, ry, fill) => ({ tag: "ellipse", a: { cx, cy, rx, ry }, fill });
  const C = (cx, cy, r, fill) => ({ tag: "circle", a: { cx, cy, r }, fill });
  const P = (d, fill) => ({ tag: "path", a: { d }, fill });
  const R = (x, y, w, h, rx, fill) => ({ tag: "rect", a: { x, y, w, h, rx }, fill });
  const S = (d, w, fill) => ({ tag: "stroke", a: { d, w }, fill });           // thick stroked path (necks, tails)
  const leg = (x, y, w, h) => [R(x, y, w, h, w / 2, "dark"), E(x + w / 2, y + h, w * 0.72, w * 0.34, "dark")];

  /* Geometry. sil = silhouette shapes (outlined), det = details (no outline),
     face = {x,y,s,mouth}, top = head top point for hats/bows, body = centre for mud. */
  const DINO = {
    trex: () => ({
      sil: [
        P("M54 128 Q14 122 6 154 Q34 142 62 150 Z", "dark"),
        P("M64 96 l9 -18 l9 18 Z", "dark"), P("M82 88 l9 -18 l9 18 Z", "dark"), P("M100 86 l8 -16 l8 16 Z", "dark"),
        ...leg(70, 140, 24, 40), ...leg(104, 140, 24, 40),
        E(92, 126, 46, 38, "body"),
        R(128, 114, 22, 11, 6, "dark"), R(130, 127, 20, 11, 6, "dark"),
        C(130, 80, 42, "body"), E(160, 95, 24, 17, "body")
      ],
      det: [E(100, 134, 28, 24, "light"), C(176, 90, 3, "dark")],
      face: { x: 134, y: 74, s: 1 }, top: { x: 128, y: 38 }, body: { x: 92, y: 126 }
    }),
    triceratops: () => ({
      sil: [
        P("M44 136 Q8 130 4 160 Q30 148 52 152 Z", "dark"),
        ...leg(48, 142, 24, 38), ...leg(76, 144, 24, 38), ...leg(104, 144, 24, 38),
        E(88, 128, 52, 38, "body"),
        C(130, 88, 44, "dark"),
        P("M132 66 l-7 -24 l18 14 Z", "cream"), P("M158 70 l5 -26 l11 22 Z", "cream"),
        C(144, 96, 31, "body"), E(170, 110, 19, 13, "body"),
        P("M182 100 l12 -11 l-1 18 Z", "cream")
      ],
      det: [C(130, 88, 36, "mid"), E(92, 140, 30, 22, "light")],
      face: { x: 148, y: 92, s: 0.85 }, top: { x: 146, y: 54 }, body: { x: 88, y: 128 }
    }),
    stegosaurus: () => ({
      sil: [
        P("M38 142 Q6 138 2 164 Q28 152 48 156 Z", "dark"),
        P("M14 148 l-8 -14 M26 144 l-5 -15", "dark"),
        ...[[40, 112, 0], [64, 96, 4], [90, 88, 8], [116, 90, 6], [138, 100, 0]].map(([x, y, e]) => P(`M${x - 13} ${y + 16} L${x} ${y - 22 - e} L${x + 13} ${y + 16} Z`, "dark")),
        ...leg(50, 148, 22, 34), ...leg(74, 150, 22, 34), ...leg(100, 150, 22, 34), ...leg(124, 148, 22, 34),
        E(92, 134, 56, 34, "body"),
        P("M136 122 Q160 112 174 130 Q162 144 136 142 Z", "body"),
        C(166, 132, 22, "body"), E(182, 139, 12, 9, "body")
      ],
      det: [E(96, 144, 34, 20, "light")],
      face: { x: 168, y: 128, s: 0.62 }, top: { x: 166, y: 110 }, body: { x: 92, y: 134 }
    }),
    brachiosaurus: () => ({
      sil: [
        P("M36 152 Q4 148 2 174 Q28 162 44 166 Z", "dark"),
        ...leg(48, 158, 22, 32), ...leg(72, 160, 22, 32), ...leg(100, 160, 22, 32), ...leg(122, 158, 22, 32),
        E(86, 144, 52, 32, "body"),
        S("M112 136 Q128 92 140 46", 30, "body"),
        E(150, 38, 25, 19, "body"), E(168, 45, 12, 9, "body")
      ],
      det: [E(90, 154, 32, 18, "light"), S("M118 138 Q132 96 142 52", 9, "light"), C(174, 41, 2.5, "dark")],
      face: { x: 152, y: 32, s: 0.56 }, top: { x: 150, y: 19 }, body: { x: 86, y: 144 }
    }),
    pterodactyl: () => ({
      sil: [
        P("M94 112 Q44 44 12 62 Q46 72 62 106 Q78 96 94 112 Z", "dark"),
        P("M106 112 Q156 44 188 62 Q154 72 138 106 Q122 96 106 112 Z", "dark"),
        P("M86 136 l-8 18 M96 138 l0 18 M104 138 l0 18 M114 136 l8 18", "dark"),
        E(100, 120, 31, 23, "body"),
        P("M110 86 L86 58 L114 76 Z", "dark"),
        C(120, 92, 24, "body"),
        P("M138 86 L176 102 L138 110 Z", "beak")
      ],
      det: [
        P("M94 114 Q50 62 28 72 Q54 78 64 108 Z", "mid"), P("M106 114 Q150 62 172 72 Q146 78 136 108 Z", "mid"),
        E(100, 126, 18, 13, "light")
      ],
      face: { x: 122, y: 86, s: 0.68, mouth: false }, top: { x: 122, y: 68 }, body: { x: 100, y: 120 }
    }),
    ankylosaurus: () => ({
      sil: [
        S("M42 144 Q14 140 10 162", 14, "dark"), C(12, 168, 14, "dark"),
        ...leg(50, 148, 24, 34), ...leg(76, 150, 24, 34), ...leg(104, 150, 24, 34), ...leg(128, 148, 24, 34),
        E(94, 134, 60, 36, "body"),
        ...[[52, 110], [72, 102], [94, 98], [116, 102], [136, 112]].map(([x, y]) => C(x, y, 9, "dark")),
        C(160, 132, 25, "body"), E(179, 140, 14, 10, "body"),
        P("M148 112 l-4 -11 M166 110 l4 -11", "dark")
      ],
      det: [...[[62, 120], [84, 114], [106, 114], [126, 122]].map(([x, y]) => C(x, y, 7, "dark")), E(96, 148, 38, 18, "light")],
      face: { x: 162, y: 126, s: 0.66 }, top: { x: 160, y: 107 }, body: { x: 94, y: 134 }
    })
  };

  function render(shape, pal, outline) {
    const a = shape.a;
    const fill = pal[shape.fill] || shape.fill;
    if (shape.tag === "stroke") {
      return outline
        ? `<path d="${a.d}" stroke="${OUTLINE}" stroke-width="${a.w + 7}" stroke-linecap="round" fill="none"/>`
        : `<path d="${a.d}" stroke="${fill}" stroke-width="${a.w}" stroke-linecap="round" fill="none"/>`;
    }
    const common = outline ? `fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"` : `fill="${fill}"`;
    if (shape.tag === "path") {
      // open strokes (spikes drawn as lines) need a visible stroke in the colour pass too
      const open = /M[^Z]*$/.test(a.d) && !/Z/i.test(a.d);
      return open
        ? `<path d="${a.d}" stroke="${outline ? OUTLINE : fill}" stroke-width="${outline ? 12 : 5}" stroke-linecap="round" fill="none"/>`
        : `<path d="${a.d}" ${common}/>`;
    }
    if (shape.tag === "circle") return `<circle cx="${a.cx}" cy="${a.cy}" r="${a.r}" ${common}/>`;
    if (shape.tag === "ellipse") return `<ellipse cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}" ${common}/>`;
    if (shape.tag === "rect") return `<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="${a.rx}" ${common}/>`;
    return "";
  }

  /* ---- Face: eyes + mouth + cheeks, drawn at the dino's face anchor ---- */
  function face(f, mood, role) {
    const big = role === "baby" ? 1.3 : 1;
    const s = f.s * big;
    const eyeR = 11;
    const eyes = [[-16, 0, eyeR * 0.92], [12, 0, eyeR]];
    let out = "";
    // cheeks
    out += `<ellipse cx="-28" cy="12" rx="8" ry="5" fill="#ff8fa3" opacity=".65"/><ellipse cx="26" cy="12" rx="8" ry="5" fill="#ff8fa3" opacity=".65"/>`;
    if (mood === "sleepy") {
      eyes.forEach(([x, y, r]) => { out += `<path d="M${x - r} ${y + 2} q${r} ${r * 0.9} ${r * 2} 0" stroke="${OUTLINE}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`; });
      out += `<text x="34" y="-18" font-size="18" font-weight="900" fill="#fff" stroke="${OUTLINE}" stroke-width="1" font-family="Arial Rounded MT Bold, Arial, sans-serif">z</text><text x="46" y="-32" font-size="24" font-weight="900" fill="#fff" stroke="${OUTLINE}" stroke-width="1" font-family="Arial Rounded MT Bold, Arial, sans-serif">Z</text>`;
    } else {
      const r2 = mood === "excited" ? 1.12 : 1;
      eyes.forEach(([x, y, r]) => {
        r *= r2;
        out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${OUTLINE}" stroke-width="2.5"/>
          <circle cx="${x + r * 0.22}" cy="${y + r * 0.08}" r="${r * 0.58}" fill="${OUTLINE}"/>
          <circle cx="${x + r * 0.42}" cy="${y - r * 0.32}" r="${r * 0.22}" fill="#fff"/>
          <circle cx="${x + r * 0.02}" cy="${y + r * 0.3}" r="${r * 0.1}" fill="#fff"/>`;
        if (role === "mum") out += `<path d="M${x - r * 0.9} ${y - r * 0.6} l-5 -4 M${x - r * 0.5} ${y - r} l-3 -5 M${x} ${y - r * 1.05} l0 -6" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>`;
      });
      if (role === "dad") out += `<path d="M-26 -16 l16 -3 M6 -19 l16 3" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/>`;
      else if (mood === "hungry") out += `<path d="M-26 -17 l16 2 M6 -15 l16 -2" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>`;
    }
    if (f.mouth !== false) {
      if (mood === "excited") out += `<path d="M-10 17 q10 18 20 0 z" fill="${OUTLINE}"/><path d="M-4 24 q4 6 8 0 z" fill="#ff8fa3"/>`;
      else if (mood === "hungry") out += `<ellipse cx="0" cy="22" rx="5" ry="6" fill="${OUTLINE}"/>`;
      else if (mood === "sleepy") out += `<circle cx="0" cy="22" r="3" fill="${OUTLINE}"/>`;
      else out += `<path d="M-9 17 q9 11 18 0" stroke="${OUTLINE}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${f.x} ${f.y}) scale(${s})">${out}</g>`;
  }

  /* ---- Hats and bows ---- */
  function accessory(role, top, s) {
    if (role === "mum") {
      return `<g transform="translate(${top.x} ${top.y + 4}) scale(${s}) rotate(-12)">
        <g stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round">
          <path d="M0 0 Q-24 -16 -22 2 Q-20 14 0 2 Z" fill="#ff4d8d"/>
          <path d="M0 0 Q24 -16 22 2 Q20 14 0 2 Z" fill="#ff4d8d"/>
          <circle cx="0" cy="1" r="5" fill="#ff85b3"/>
        </g></g>`;
    }
    if (role === "baby") {
      return `<g transform="translate(${top.x} ${top.y + 8}) scale(${s})">
        <path d="M-22 4 Q-22 -26 0 -26 Q22 -26 22 4 L16 -3 L10 5 L4 -3 L-2 5 L-8 -3 L-14 5 Z" fill="#fff" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="-7" cy="-12" r="3" fill="#cfe8ff"/><circle cx="8" cy="-16" r="2.5" fill="#cfe8ff"/>
      </g>`;
    }
    if (role === "dad") {
      return "";
    }
    return "";
  }

  function mud(body) {
    const spots = [[-18, -6, 9], [10, -12, 7], [2, 10, 10], [24, 6, 6], [-30, 12, 6]];
    return spots.map(([dx, dy, r]) => `<ellipse cx="${body.x + dx}" cy="${body.y + dy}" rx="${r}" ry="${r * 0.75}" fill="#8d5a2b" stroke="#6b3f1a" stroke-width="2"/>`).join("");
  }

  window.DINOS = [
    { id: "trex", name: "T-Rex", say: "Tee Rex", colour: "green", food: "meat",
      fact: "T-Rex has a big head and teeny tiny arms. Rawr!", size: "big" },
    { id: "triceratops", name: "Triceratops", say: "Try-serra-tops", colour: "orange", food: "leaves",
      fact: "Triceratops has three horns on its head. One, two, three!", size: "big" },
    { id: "stegosaurus", name: "Stegosaurus", say: "Steg-oh-saurus", colour: "purple", food: "leaves",
      fact: "Stegosaurus has pointy plates all along its back.", size: "big" },
    { id: "brachiosaurus", name: "Brachiosaurus", say: "Brack-ee-oh-saurus", colour: "blue", food: "leaves",
      fact: "Brachiosaurus has a very, very long neck to munch the tall trees.", size: "big" },
    { id: "pterodactyl", name: "Pterodactyl", say: "Terra-dack-til", colour: "yellow", food: "fish",
      fact: "Pterodactyl can fly high up in the sky. Whoosh!", size: "small" },
    { id: "ankylosaurus", name: "Ankylosaurus", say: "Ank-eye-lo-saurus", colour: "pink", food: "leaves",
      fact: "Ankylosaurus has a bumpy back and a big club on its tail.", size: "small" }
  ];

  window.COLOURS = {
    green: "#5ec36a", orange: "#ff9f43", purple: "#a55eea", blue: "#54a0ff",
    yellow: "#ffd32a", pink: "#ff6b81", red: "#ee5253"
  };

  window.FOODS = {
    leaves: { emoji: "🍃", name: "leaves" },
    meat: { emoji: "🍖", name: "meat" },
    fish: { emoji: "🐟", name: "fish" }
  };

  window.makeDino = function (type, colourName, opts = {}) {
    const hex = window.COLOURS[colourName] || colourName || "#5ec36a";
    const mood = opts.mood || "happy", role = opts.role || "none";
    const g = DINO[type]();
    const id = "g" + (++uid);
    const pal = {
      body: `url(#${id})`, dark: shade(hex, -45), mid: shade(hex, -18), light: shade(hex, 70),
      cream: "#fff6d5", beak: "#ffcf5c"
    };
    const defs = `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%">
      <stop offset="0" stop-color="${shade(hex, 40)}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${shade(hex, -25)}"/>
    </radialGradient></defs>`;
    const outlinePass = g.sil.map(s => render(s, pal, true)).join("");
    const colourPass = g.sil.map(s => render(s, pal, false)).join("");
    const details = g.det.map(s => render(s, pal, false)).join("");
    const extras = ((mood === "dirty" || opts.mud) ? mud(g.body) : "") + accessory(role, g.top, g.face.s * (role === "baby" ? 1.1 : 1));
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${outlinePass}${colourPass}${details}${face(g.face, mood === "dirty" ? "happy" : mood, role)}${extras}</svg>`;
  };
})();
