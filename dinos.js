/* Cute front-facing cartoon dinos drawn as SVG (viewBox 200x200).
   makeDino(type, colourName, { mood, role, mud }) → SVG markup
   mood: happy | excited | sleepy | hungry      role: none | mum | dad | baby
   Each dino is drawn twice: once as a thick dark silhouette (the outline), then in colour. */
(function () {
  let uid = 0;
  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    return "#" + ((clamp((n >> 16 & 255) + amt) << 16) | (clamp((n >> 8 & 255) + amt) << 8) | clamp((n & 255) + amt)).toString(16).padStart(6, "0");
  }
  function mix(hex, hex2, t) {
    const a = parseInt(hex.slice(1), 16), b = parseInt(hex2.slice(1), 16);
    const ch = s => clamp(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
    return "#" + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0");
  }

  // shape helpers: fill ∈ body | dark | mid | light | cream | outline | <hex>
  const E = (cx, cy, rx, ry, fill, extra = "") => ({ tag: "ellipse", a: { cx, cy, rx, ry }, fill, extra });
  const C = (cx, cy, r, fill, extra = "") => ({ tag: "circle", a: { cx, cy, r }, fill, extra });
  const P = (d, fill, extra = "") => ({ tag: "path", a: { d }, fill, extra });
  const R = (x, y, w, h, rx, fill, extra = "") => ({ tag: "rect", a: { x, y, w, h, rx }, fill, extra });

  // ---------- shared body template ----------
  const tail = () => P("M74 162 C 34 170, 14 146, 30 122 C 40 108, 60 114, 56 128 C 53 138, 44 142, 48 150 C 52 158, 66 152, 78 150 Z", "body");
  const legs = () => [
    R(58, 146, 30, 42, 15, "mid"), R(112, 146, 30, 42, 15, "mid"),
    E(73, 188, 22, 9, "mid"), E(127, 188, 22, 9, "mid"),
    C(60, 186, 5, "mid"), C(73, 189, 5, "mid"), C(86, 186, 5, "mid"),
    C(114, 186, 5, "mid"), C(127, 189, 5, "mid"), C(140, 186, 5, "mid")
  ];
  const body = () => P("M100 90 C 148 90, 162 128, 158 160 C 154 182, 124 190, 100 190 C 76 190, 46 182, 42 160 C 38 128, 52 90, 100 90 Z", "body");
  const arms = () => [E(52, 132, 9, 15, "mid", 'transform="rotate(25 52 132)"'), E(148, 132, 9, 15, "mid", 'transform="rotate(-25 148 132)"')];
  const belly = () => P("M100 114 C 128 114, 140 140, 138 160 C 136 176, 120 184, 100 184 C 80 184, 64 176, 62 160 C 60 140, 72 114, 100 114 Z", "light");
  const bellyLines = () => [
    P("M72 150 Q100 158 128 150", "none", 'stroke="rgba(0,0,0,.08)" stroke-width="4" fill="none" stroke-linecap="round"'),
    P("M76 166 Q100 173 124 166", "none", 'stroke="rgba(0,0,0,.08)" stroke-width="4" fill="none" stroke-linecap="round"')
  ];
  const headShadow = () => E(100, 114, 44, 11, "#000", 'opacity=".22" filter="url(#blur)"');
  const head = (cy = 70, rx = 56, ry = 50) => E(100, cy, rx, ry, "body");
  const headShine = (cy = 70) => E(74, cy - 30, 22, 11, "#fff", 'opacity=".4" filter="url(#blur)" transform="rotate(-25 74 ' + (cy - 30) + ')"');
  const bodyShade = () => E(100, 184, 50, 12, "#000", 'opacity=".16" filter="url(#blur)"');
  const rim = () => P("M150 120 C 162 140, 160 170, 140 184", "none", 'stroke="rgba(255,255,255,.35)" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#blur)"');
  const spots = (cy = 70) => [E(68, cy - 36, 7, 5, "#fff", 'opacity=".22"'), E(84, cy - 44, 5, 3.5, "#fff", 'opacity=".22"'), E(128, cy - 40, 6, 4, "#fff", 'opacity=".18"'), E(44, 140, 6, 4, "dark", 'opacity=".35"'), E(156, 150, 5, 3.5, "dark", 'opacity=".35"'), E(150, 132, 4, 3, "dark", 'opacity=".3"')];
  const muzzle = (cy = 70) => [E(100, cy + 22, 27, 15, "light"), C(91, cy + 19, 2.5, "dark"), C(109, cy + 19, 2.5, "dark")];
  const groundShadow = () => E(100, 192, 58, 6, "#000", 'opacity=".14"');

  /* Species. pre = behind everything (no outline), sil = outlined shapes, det = details on top,
     face = {cx, cy, s}, top = head top point (hats), neck = bow-tie point, body = centre for mud. */
  const DINO = {
    trex: () => ({
      pre: [groundShadow()],
      sil: [
        tail(),
        P("M70 34 l12 -22 l12 22 Z", "dark"), P("M88 26 l12 -22 l12 22 Z", "dark"), P("M106 34 l12 -22 l12 22 Z", "dark"),
        ...legs(), body(),
        // tiny arms held out front
        P("M58 126 C 46 130, 44 142, 56 146 L 62 140 L 58 136 Z", "mid"), P("M142 126 C 154 130, 156 142, 144 146 L 138 140 L 142 136 Z", "mid"),
        head()
      ],
      det: [belly(), ...bellyLines(), bodyShade(), headShadow(), headShine(), ...spots(), ...muzzle()],
      face: { cx: 100, cy: 70, s: 1 }, top: { x: 100, y: 20 }, neck: { x: 100, y: 110 }, body: { x: 100, y: 150 }
    }),
    triceratops: () => ({
      pre: [groundShadow()],
      sil: [
        tail(),
        // scalloped frill
        ...[-80, -58, -36, -14, 8, 30, 52, 74, 96, 118, 140, 162, 184, 206, 228].map(a => { const r = a * Math.PI / 180; return C(100 + Math.cos(r) * 60, 66 + Math.sin(r) * 60, 13, "dark"); }),
        C(100, 66, 64, "dark"),
        ...legs(), body(), ...arms(),
        head(),
        P("M66 44 L 56 10 L 84 30 Z", "cream"), P("M134 44 L 144 10 L 116 30 Z", "cream"), P("M92 86 L 100 68 L 108 86 Z", "cream")
      ],
      det: [belly(), ...bellyLines(), bodyShade(), headShadow(), E(100, 66, 56, 56, "mid"), head(), headShine(), ...spots(), ...muzzle(), P("M92 86 L 100 68 L 108 86 Z", "cream")],
      face: { cx: 100, cy: 70, s: 1 }, top: { x: 100, y: 22 }, neck: { x: 100, y: 112 }, body: { x: 100, y: 150 }
    }),
    stegosaurus: () => ({
      pre: [groundShadow()],
      sil: [
        tail(),
        ...[[40, 62, -40], [66, 32, -20], [100, 18, 0], [134, 32, 20], [160, 62, 40]].map(([x, y, rot]) =>
          P(`M${x - 17} ${y + 22} Q ${x - 14} ${y - 10}, ${x} ${y - 24} Q ${x + 14} ${y - 10}, ${x + 17} ${y + 22} Z`, "dark", `transform="rotate(${rot} ${x} ${y})"`)),
        ...legs(), body(), ...arms(), head()
      ],
      det: [
        ...[[40, 62, -40], [66, 32, -20], [100, 18, 0], [134, 32, 20], [160, 62, 40]].map(([x, y, rot]) =>
          P(`M${x - 9} ${y + 16} Q ${x - 7} ${y - 4}, ${x} ${y - 12} Q ${x + 7} ${y - 4}, ${x + 9} ${y + 16} Z`, "mid", `transform="rotate(${rot} ${x} ${y})"`)),
        head(), belly(), ...bellyLines(), bodyShade(), headShadow(), headShine(), ...spots(), ...muzzle()
      ],
      face: { cx: 100, cy: 70, s: 1 }, top: { x: 100, y: 20 }, neck: { x: 100, y: 112 }, body: { x: 100, y: 150 }
    }),
    brachiosaurus: () => ({
      pre: [groundShadow()],
      sil: [
        tail(), ...legs(),
        R(74, 34, 52, 90, 26, "body"),
        P("M100 104 C 148 104, 162 134, 158 162 C 154 182, 124 190, 100 190 C 76 190, 46 182, 42 162 C 38 134, 52 104, 100 104 Z", "body"),
        ...arms(), E(100, 42, 42, 36, "body")
      ],
      det: [
        P("M100 124 C 128 124, 140 146, 138 162 C 136 178, 120 184, 100 184 C 80 184, 64 178, 62 162 C 60 146, 72 124, 100 124 Z", "light"),
        ...bellyLines(), bodyShade(), R(86, 60, 28, 54, 14, "light", 'opacity=".6"'),
        E(100, 120, 36, 9, "#000", 'opacity=".2" filter="url(#blur)"'),
        E(100, 42, 42, 36, "body"), headShine(44), E(72, 36, 5, 3.5, "#fff", 'opacity=".22"'), E(84, 16, 4, 3, "#fff", 'opacity=".2"'), E(44, 140, 6, 4, "dark", 'opacity=".35"'), E(156, 150, 5, 3.5, "dark", 'opacity=".35"'),
        E(100, 60, 22, 12, "light"), C(93, 57, 2.2, "dark"), C(107, 57, 2.2, "dark")
      ],
      face: { cx: 100, cy: 42, s: 0.74 }, top: { x: 100, y: 7 }, neck: { x: 100, y: 118 }, body: { x: 100, y: 156 }
    }),
    pterodactyl: () => ({
      pre: [groundShadow()],
      sil: [
        P("M62 112 C 44 94, 22 70, 2 54 C 10 86, 8 110, 16 134 C 30 126, 44 128, 62 140 Z", "dark"),
        P("M138 112 C 156 94, 178 70, 198 54 C 190 86, 192 110, 184 134 C 170 126, 156 128, 138 140 Z", "dark"),
        P("M118 32 L 160 4 L 142 48 Z", "dark"),
        R(70, 150, 18, 36, 9, "mid"), R(112, 150, 18, 36, 9, "mid"),
        E(79, 186, 16, 7, "mid"), E(121, 186, 16, 7, "mid"),
        body(), head(),
        P("M78 90 L 122 90 C 124 110, 108 124, 100 126 C 92 124, 76 110, 78 90 Z", "beak")
      ],
      det: [
        P("M60 116 C 46 100, 28 80, 14 66 C 20 90, 18 108, 24 126 C 36 120, 48 124, 60 134 Z", "mid"),
        P("M140 116 C 154 100, 172 80, 186 66 C 180 90, 182 108, 176 126 C 164 120, 152 124, 140 134 Z", "mid"),
        belly(), ...bellyLines(), bodyShade(), headShadow(), headShine(), ...spots(),
        P("M78 90 L 122 90 C 124 110, 108 124, 100 126 C 92 124, 76 110, 78 90 Z", "beak"),
        P("M82 92 L 118 92 C 118 100, 110 104, 100 104 C 90 104, 82 100, 82 92 Z", "#fff", 'opacity=".25"'),
        P("M84 98 Q100 108 116 98", "none", 'stroke="#b8862b" stroke-width="3" fill="none" stroke-linecap="round"'),
        C(92, 94, 2, "#b8862b"), C(108, 94, 2, "#b8862b")
      ],
      face: { cx: 100, cy: 70, s: 1, mouth: false }, top: { x: 100, y: 20 }, neck: { x: 100, y: 112 }, body: { x: 100, y: 150 }
    }),
    ankylosaurus: () => ({
      pre: [groundShadow()],
      sil: [
        P("M74 162 C 40 170, 20 160, 22 144", "body", 'stroke-width="18" fill="none" stroke-linecap="round"'),
        C(20, 138, 17, "dark"),
        ...legs(), body(), ...arms(),
        P("M44 70 C 44 20, 156 20, 156 70 Z", "dark"),
        ...[[52, 56], [68, 40], [86, 30], [100, 28], [114, 30], [132, 40], [148, 56]].map(([x, y]) => C(x, y, 11, "dark")),
        head(),
        P("M50 62 l-12 -6 l8 12 Z", "cream"), P("M150 62 l12 -6 l-8 12 Z", "cream")
      ],
      det: [
        belly(), ...bellyLines(), bodyShade(), headShadow(), head(),
        P("M48 66 C 50 36, 150 36, 152 66 Z", "mid"),
        ...[[58, 56], [74, 44], [90, 38], [110, 38], [126, 44], [142, 56]].map(([x, y]) => C(x, y, 7, "dark")),
        headShine(), ...spots(), ...muzzle(), C(28, 134, 4, "mid"), C(16, 142, 3, "mid")
      ],
      face: { cx: 100, cy: 72, s: 1 }, top: { x: 100, y: 22 }, neck: { x: 100, y: 112 }, body: { x: 100, y: 150 }
    })
  };

  function render(s, pal, outlinePass) {
    const a = s.a, fill = pal[s.fill] || s.fill;
    const extra = s.extra || "";
    const isStroke = /stroke-width/.test(extra) && /fill="none"/.test(extra);
    if (outlinePass) {
      if (s.fill === "none") return "";
      if (isStroke) {
        const w = parseFloat((extra.match(/stroke-width="([\d.]+)"/) || [0, 6])[1]) + 7;
        return `<path d="${a.d}" stroke="${pal.outline}" stroke-width="${w}" fill="none" stroke-linecap="round" ${extra.replace(/stroke-width="[\d.]+"/, "").replace(/fill="none"/, "")}/>`;
      }
      if (s.tag === "path" && /stroke-width/.test(extra)) { // open path drawn as thick line (spikes)
        const w = parseFloat(extra.match(/stroke-width="([\d.]+)"/)[1]) + 7;
        return `<path d="${a.d}" stroke="${pal.outline}" stroke-width="${w}" fill="none" stroke-linecap="round" ${extra.replace(/stroke-width="[\d.]+"/, "")}/>`;
      }
      const o = `fill="${pal.outline}" stroke="${pal.outline}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" ${extra.replace(/opacity="[\d.]+"/, "")}`;
      return shapeTag(s, o);
    }
    if (isStroke) return `<path d="${a.d}" ${extra}/>`;
    if (s.tag === "path" && /stroke-width/.test(extra) && !/fill=/.test(extra)) {
      return `<path d="${a.d}" stroke="${fill}" fill="none" stroke-linecap="round" ${extra}/>`;
    }
    return shapeTag(s, `fill="${fill}" ${extra}`);
  }
  function shapeTag(s, attrs) {
    const a = s.a;
    if (s.tag === "path") return `<path d="${a.d}" ${attrs}/>`;
    if (s.tag === "circle") return `<circle cx="${a.cx}" cy="${a.cy}" r="${a.r}" ${attrs}/>`;
    if (s.tag === "ellipse") return `<ellipse cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}" ${attrs}/>`;
    if (s.tag === "rect") return `<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="${a.rx}" ${attrs}/>`;
    return "";
  }

  /* ---------- Face (Pixar-style: oval eyes, coloured iris, eyelids, brows) ---------- */
  const IRIS = { trex: "#e39b2e", triceratops: "#2bb5a8", stegosaurus: "#f0b429", brachiosaurus: "#8a5a2b", pterodactyl: "#3a7bd5", ankylosaurus: "#4cae4f" };
  function face(f, mood, role, pal, type, id) {
    const ink = pal.outline;
    const big = role === "baby" ? 1.22 : 1;
    const s = f.s;
    const rx = 14.5 * big, ry = 16.5 * big;
    const eyes = [[-23, 0], [23, 0]];
    const iris = IRIS[type] || "#8a5a2b";
    let out = `<defs><radialGradient id="${id}i" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="${mix(iris, "#ffffff", 0.45)}"/><stop offset="1" stop-color="${shade(iris, -40)}"/></radialGradient></defs>`;
    out += `<ellipse cx="-40" cy="20" rx="10" ry="6" fill="#ff7b9c" opacity=".5" filter="url(#blur)"/><ellipse cx="40" cy="20" rx="10" ry="6" fill="#ff7b9c" opacity=".5" filter="url(#blur)"/>`;
    const browW = role === "dad" ? 5.5 : 3.2;
    const browY = mood === "excited" ? -31 : mood === "hungry" ? -26 : -27;
    const browTilt = mood === "hungry" ? 6 : 0;   // inner ends up = hopeful
    if (mood === "sleepy") {
      eyes.forEach(([x, y]) => {
        out += `<path d="M${x - rx} ${y + 2} q${rx} ${ry * 0.8} ${rx * 2} 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
        if (role === "mum") out += `<path d="M${x - rx * 0.9} ${y + 4} l-4 4 M${x - rx * 0.35} ${y + 9} l-2 5 M${x + rx * 0.35} ${y + 9} l2 5 M${x + rx * 0.9} ${y + 4} l4 4" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
      });
      out += `<path d="M-36 -22 q13 -3 26 0 M10 -22 q13 -3 26 0" stroke="${ink}" stroke-width="${browW}" stroke-linecap="round" fill="none" opacity=".8"/>`;
      out += `<g font-family="Arial Rounded MT Bold, Nunito, Arial, sans-serif" font-weight="900" fill="#fff" stroke="${ink}" stroke-width="1.2">
        <text x="42" y="-22" font-size="15">z</text><text x="54" y="-36" font-size="20">Z</text><text x="66" y="-52" font-size="25">Z</text></g>`;
    } else {
      const grow = mood === "excited" ? 1.08 : 1;
      eyes.forEach(([x, y]) => {
        const ex = rx * grow, ey = ry * grow, dir = x < 0 ? 1 : -1;
        const ix = x + dir * 2.5, iy = y + 2;
        out += `<ellipse cx="${x}" cy="${y}" rx="${ex}" ry="${ey}" fill="#fff" stroke="${ink}" stroke-width="2.5"/>
          <circle cx="${ix}" cy="${iy}" r="${ex * 0.68}" fill="url(#${id}i)"/>
          <circle cx="${ix}" cy="${iy}" r="${ex * 0.68}" fill="none" stroke="${shade(iris, -60)}" stroke-width="1"/>
          <circle cx="${ix}" cy="${iy + 1}" r="${ex * 0.36}" fill="${ink}"/>
          <circle cx="${ix - ex * 0.22}" cy="${iy - ey * 0.28}" r="${ex * 0.22}" fill="#fff"/>
          <circle cx="${ix + ex * 0.22}" cy="${iy + ey * 0.26}" r="${ex * 0.09}" fill="#fff"/>`;
        // upper eyelid: relaxed, friendly
        const lid = mood === "excited" ? 0.08 : mood === "hungry" ? 0.42 : 0.22;
        out += `<path d="M${x - ex} ${y - ey * (1 - lid)} A${ex} ${ey} 0 0 1 ${x + ex} ${y - ey * (1 - lid)} L${x + ex} ${y - ey - 3} L${x - ex} ${y - ey - 3} Z" fill="${pal.body}"/>
          <path d="M${x - ex} ${y - ey * (1 - lid)} A${ex} ${ey} 0 0 1 ${x + ex} ${y - ey * (1 - lid)}" stroke="${ink}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
        if (role === "mum") out += `<path d="M${x - ex * 0.95} ${y - ey * 0.55} l-5 -3 M${x - ex * 0.5} ${y - ey * 0.9} l-3 -5 M${x + ex * 0.15} ${y - ey * 1.0} l1 -6" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
      });
      out += `<path d="M-36 ${browY + browTilt} q13 -6 26 ${-browTilt - 1} M10 ${browY - 1} q13 ${browTilt - 5} 26 ${browTilt + 1}" stroke="${ink}" stroke-width="${browW}" stroke-linecap="round" fill="none"/>`;
      if (role === "baby") out += `<g fill="${ink}" opacity=".35"><circle cx="-36" cy="12" r="1.6"/><circle cx="-30" cy="16" r="1.6"/><circle cx="36" cy="12" r="1.6"/><circle cx="30" cy="16" r="1.6"/></g>`;
    }
    if (f.mouth !== false) {
      const my = 32;
      if (mood === "excited") out += `<path d="M-14 ${my - 2} q14 24 28 0 z" fill="${ink}"/><path d="M-7 ${my + 8} q7 8 14 0 z" fill="#ff7b9c"/><path d="M-11 ${my - 1} q11 3 22 0 l0 3 q-11 2 -22 0 z" fill="#fff"/>`;
      else if (mood === "hungry") out += `<ellipse cx="0" cy="${my + 4}" rx="6" ry="7.5" fill="${ink}"/><ellipse cx="0" cy="${my + 7}" rx="3.5" ry="3" fill="#ff7b9c"/>`;
      else if (mood === "sleepy") out += `<circle cx="0" cy="${my + 4}" r="3.5" fill="${ink}"/>`;
      else out += `<path d="M-13 ${my - 2} q13 14 26 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${f.cx} ${f.cy}) scale(${s})">${out}</g>`;
  }

  /* ---------- Hats, bows, ties ---------- */
  function accessory(role, g, pal) {
    const ink = pal.outline, t = g.top;
    if (role === "mum") {
      return `<g transform="translate(${t.x + 30} ${t.y + 14}) rotate(-18)" stroke="${ink}" stroke-width="3" stroke-linejoin="round">
        <path d="M0 0 C -8 -14, -30 -16, -28 -2 C -27 10, -10 10, 0 2 Z" fill="#ff4d8d"/>
        <path d="M0 0 C 8 -14, 30 -16, 28 -2 C 27 10, 10 10, 0 2 Z" fill="#ff4d8d"/>
        <path d="M-6 -2 C -14 0, -14 6, -6 5 Z M6 -2 C 14 0, 14 6, 6 5 Z" fill="#ff85b3" stroke="none"/>
        <circle cx="0" cy="1" r="5.5" fill="#ff85b3"/></g>`;
    }
    if (role === "dad") {
      const n = g.neck;
      return `<g transform="translate(${n.x} ${n.y})" stroke="${ink}" stroke-width="3" stroke-linejoin="round">
        <path d="M-3 0 L -22 -10 L -22 10 Z" fill="#3b6fd6"/><path d="M3 0 L 22 -10 L 22 10 Z" fill="#3b6fd6"/>
        <circle cx="0" cy="0" r="5" fill="#5b8cff"/></g>`;
    }
    if (role === "baby") {
      return `<g transform="translate(${t.x} ${t.y + 12})">
        <path d="M-30 6 C -30 -24, -12 -32, 0 -32 C 12 -32, 30 -24, 30 6 L 22 -3 L 15 8 L 7 -2 L 0 9 L -7 -2 L -15 8 L -22 -3 Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="-10" cy="-16" r="3.5" fill="#cfe8ff"/><circle cx="10" cy="-20" r="3" fill="#cfe8ff"/><circle cx="2" cy="-8" r="2.5" fill="#cfe8ff"/></g>`;
    }
    return "";
  }

  function mud(b) {
    const spots = [[-24, -8, 10], [14, -14, 8], [0, 8, 12], [26, 4, 7], [-30, 14, 7], [10, 22, 6]];
    return spots.map(([dx, dy, r]) => `<ellipse cx="${b.x + dx}" cy="${b.y + dy}" rx="${r}" ry="${r * 0.72}" fill="#8d5a2b" stroke="#6b3f1a" stroke-width="2"/>`).join("");
  }

  window.DINOS = [
    { id: "trex", name: "T-Rex", say: "Tee Rex", colour: "green", food: "meat", fact: "T-Rex has a big head and teeny tiny arms. Rawr!", size: "big" },
    { id: "triceratops", name: "Triceratops", say: "Try-serra-tops", colour: "orange", food: "leaves", fact: "Triceratops has three horns on its head. One, two, three!", size: "big" },
    { id: "stegosaurus", name: "Stegosaurus", say: "Steg-oh-saurus", colour: "purple", food: "leaves", fact: "Stegosaurus has pointy plates all along its back.", size: "big" },
    { id: "brachiosaurus", name: "Brachiosaurus", say: "Brack-ee-oh-saurus", colour: "blue", food: "leaves", fact: "Brachiosaurus has a very, very long neck to munch the tall trees.", size: "big" },
    { id: "pterodactyl", name: "Pterodactyl", say: "Terra-dack-til", colour: "yellow", food: "fish", fact: "Pterodactyl can fly high up in the sky. Whoosh!", size: "small" },
    { id: "ankylosaurus", name: "Ankylosaurus", say: "Ank-eye-lo-saurus", colour: "pink", food: "leaves", fact: "Ankylosaurus has a bumpy back and a big club on its tail.", size: "small" }
  ];
  window.COLOURS = { green: "#6cd36f", orange: "#ffa64d", purple: "#b07ef0", blue: "#5fb0ff", yellow: "#ffd43b", pink: "#ff7e9d", red: "#ff6b6b" };
  window.FOODS = { leaves: { emoji: "🍃", name: "leaves" }, meat: { emoji: "🍖", name: "meat" }, fish: { emoji: "🐟", name: "fish" } };

  window.makeDino = function (type, colourName, opts = {}) {
    const hex = window.COLOURS[colourName] || colourName || "#6cd36f";
    const mood = opts.mood || "happy", role = opts.role || "none";
    const g = DINO[type]();
    const id = "g" + (++uid);
    const pal = {
      body: `url(#${id})`, dark: shade(hex, -48), mid: shade(hex, -22), light: mix(hex, "#ffffff", 0.55),
      cream: "#fff6d5", beak: "#ffc83d", outline: mix(shade(hex, -110), "#2a1e3a", 0.5)
    };
    const defs = `<defs><radialGradient id="${id}" cx="38%" cy="28%" r="85%">
      <stop offset="0" stop-color="${mix(hex, "#ffffff", 0.32)}"/><stop offset=".5" stop-color="${hex}"/><stop offset="1" stop-color="${shade(hex, -34)}"/></radialGradient>
      <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
    const pre = g.pre.map(s => render(s, pal, false)).join("");
    const outline = g.sil.map(s => render(s, pal, true)).join("");
    const colour = g.sil.map(s => render(s, pal, false)).join("");
    const details = g.det.map(s => render(s, pal, false)).join("");
    const faceMood = mood === "dirty" ? "happy" : mood;
    const extras = ((mood === "dirty" || opts.mud) ? mud(g.body) : "") + accessory(role, g, pal);
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${pre}${outline}${colour}${details}${face(g.face, faceMood, role, pal, type, id)}${extras}</svg>`;
  };
})();
