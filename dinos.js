/* Cute cartoon dinos drawn as SVG. makeDino(type, colourHex) returns SVG markup. */
(function () {
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r + amt)));
    g = Math.max(0, Math.min(255, Math.round(g + amt)));
    b = Math.max(0, Math.min(255, Math.round(b + amt)));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }
  function eye(x, y, r) {
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>
      <circle cx="${x + r * 0.25}" cy="${y}" r="${r * 0.55}" fill="#2d3436"/>
      <circle cx="${x + r * 0.45}" cy="${y - r * 0.3}" r="${r * 0.2}" fill="#fff"/>`;
  }
  function smile(x, y, w) {
    return `<path d="M${x} ${y} q${w / 2} ${w * 0.5} ${w} 0" stroke="#2d3436" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  function cheek(x, y) { return `<circle cx="${x}" cy="${y}" r="7" fill="#ff8fa3" opacity=".7"/>`; }
  function leg(x, y, w, h, dark) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${dark}"/>
      <ellipse cx="${x + w / 2}" cy="${y + h}" rx="${w * 0.7}" ry="${w * 0.32}" fill="${dark}"/>`;
  }

  const draw = {
    trex(c) {
      const d = shade(c, -40), l = shade(c, 60);
      return `
        <path d="M55 125 Q15 120 8 150 Q35 138 62 142 Z" fill="${d}"/>
        ${leg(72, 138, 22, 40, d)} ${leg(104, 138, 22, 40, d)}
        <ellipse cx="95" cy="122" rx="46" ry="38" fill="${c}"/>
        <ellipse cx="102" cy="130" rx="28" ry="24" fill="${l}"/>
        <path d="M60 86 l8 -14 l8 14 M78 80 l8 -14 l8 14" fill="${d}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="128" y="112" width="20" height="10" rx="5" fill="${d}"/>
        <rect x="130" y="124" width="18" height="10" rx="5" fill="${d}"/>
        <circle cx="135" cy="78" r="38" fill="${c}"/>
        <ellipse cx="162" cy="92" rx="26" ry="18" fill="${c}"/>
        <circle cx="178" cy="86" r="3" fill="${d}"/>
        ${eye(142, 68, 11)} ${cheek(126, 92)}
        ${smile(150, 100, 26)}`;
    },
    triceratops(c) {
      const d = shade(c, -40), l = shade(c, 60);
      return `
        <path d="M45 135 Q10 130 6 158 Q30 146 52 150 Z" fill="${d}"/>
        ${leg(50, 140, 22, 38, d)} ${leg(78, 142, 22, 38, d)} ${leg(104, 142, 22, 38, d)}
        <ellipse cx="88" cy="128" rx="52" ry="38" fill="${c}"/>
        <ellipse cx="90" cy="138" rx="30" ry="22" fill="${l}"/>
        <circle cx="132" cy="88" r="42" fill="${d}"/>
        <circle cx="132" cy="88" r="34" fill="${shade(c, -15)}"/>
        <circle cx="144" cy="96" r="30" fill="${c}"/>
        <ellipse cx="170" cy="108" rx="18" ry="13" fill="${c}"/>
        <path d="M134 68 l-6 -22 l16 14 Z" fill="#fff7d6" stroke="#e8d9a0" stroke-width="2" stroke-linejoin="round"/>
        <path d="M156 70 l4 -24 l10 20 Z" fill="#fff7d6" stroke="#e8d9a0" stroke-width="2" stroke-linejoin="round"/>
        <path d="M178 96 l12 -10 l-2 16 Z" fill="#fff7d6" stroke="#e8d9a0" stroke-width="2" stroke-linejoin="round"/>
        ${eye(150, 90, 10)} ${cheek(136, 110)}
        ${smile(158, 116, 22)}`;
    },
    stegosaurus(c) {
      const d = shade(c, -40), l = shade(c, 60);
      const plates = [[40, 112], [62, 96], [86, 88], [110, 90], [132, 100]]
        .map(([x, y], i) => `<path d="M${x - 12} ${y + 14} L${x} ${y - 20 - (i === 2 ? 6 : 0)} L${x + 12} ${y + 14} Z" fill="${d}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/>`).join("");
      return `
        <path d="M40 140 Q8 136 4 162 Q28 150 48 154 Z" fill="${d}"/>
        <path d="M18 146 l-6 -12 M28 142 l-4 -14" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
        ${plates}
        ${leg(50, 146, 20, 34, d)} ${leg(74, 148, 20, 34, d)} ${leg(100, 148, 20, 34, d)} ${leg(124, 146, 20, 34, d)}
        <ellipse cx="92" cy="132" rx="56" ry="34" fill="${c}"/>
        <ellipse cx="96" cy="142" rx="34" ry="20" fill="${l}"/>
        <path d="M135 120 Q160 112 172 130 Q160 142 136 140 Z" fill="${c}"/>
        <circle cx="166" cy="132" r="20" fill="${c}"/>
        <ellipse cx="180" cy="138" rx="12" ry="9" fill="${c}"/>
        ${eye(168, 126, 8)} ${cheek(158, 142)}
        ${smile(174, 146, 14)}`;
    },
    brachiosaurus(c) {
      const d = shade(c, -40), l = shade(c, 60);
      return `
        <path d="M38 150 Q6 146 4 172 Q28 160 46 164 Z" fill="${d}"/>
        ${leg(50, 156, 20, 32, d)} ${leg(74, 158, 20, 32, d)} ${leg(100, 158, 20, 32, d)} ${leg(122, 156, 20, 32, d)}
        <ellipse cx="86" cy="142" rx="52" ry="32" fill="${c}"/>
        <ellipse cx="90" cy="152" rx="32" ry="18" fill="${l}"/>
        <path d="M112 134 Q128 90 140 44" stroke="${c}" stroke-width="30" stroke-linecap="round" fill="none"/>
        <path d="M118 136 Q132 94 142 50" stroke="${l}" stroke-width="10" stroke-linecap="round" fill="none"/>
        <ellipse cx="150" cy="38" rx="24" ry="18" fill="${c}"/>
        <ellipse cx="166" cy="44" rx="12" ry="9" fill="${c}"/>
        <circle cx="172" cy="40" r="2.5" fill="${d}"/>
        ${eye(152, 32, 7)} ${cheek(146, 48)}
        ${smile(158, 50, 14)}`;
    },
    pterodactyl(c) {
      const d = shade(c, -40), l = shade(c, 60);
      return `
        <path d="M92 108 Q40 40 14 62 Q46 72 60 102 Q76 94 92 108 Z" fill="${d}"/>
        <path d="M108 108 Q160 40 186 62 Q154 72 140 102 Q124 94 108 108 Z" fill="${d}"/>
        <path d="M92 110 Q48 60 26 70 Q52 76 62 104 Z" fill="${c}"/>
        <path d="M108 110 Q152 60 174 70 Q148 76 138 104 Z" fill="${c}"/>
        <path d="M86 134 l-8 18 M94 136 l0 18 M106 136 l0 18 M114 134 l8 18" stroke="${d}" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="100" cy="118" rx="30" ry="22" fill="${c}"/>
        <ellipse cx="100" cy="124" rx="18" ry="13" fill="${l}"/>
        <path d="M108 86 L88 60 L112 76 Z" fill="${d}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="118" cy="90" r="22" fill="${c}"/>
        <path d="M134 86 L170 100 L134 106 Z" fill="#ffcf5c" stroke="#e8b43c" stroke-width="2" stroke-linejoin="round"/>
        ${eye(124, 84, 9)} ${cheek(112, 102)}`;
    },
    ankylosaurus(c) {
      const d = shade(c, -40), l = shade(c, 60);
      const bumps = [[52, 108], [72, 100], [94, 96], [116, 100], [136, 110], [62, 118], [84, 112], [106, 112], [126, 120]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${d}"/>`).join("");
      return `
        <path d="M42 142 Q14 138 10 160" stroke="${d}" stroke-width="14" stroke-linecap="round" fill="none"/>
        <circle cx="12" cy="166" r="14" fill="${d}"/>
        ${leg(50, 146, 22, 34, d)} ${leg(76, 148, 22, 34, d)} ${leg(104, 148, 22, 34, d)} ${leg(128, 146, 22, 34, d)}
        <ellipse cx="94" cy="132" rx="60" ry="36" fill="${c}"/>
        ${bumps}
        <ellipse cx="96" cy="146" rx="38" ry="18" fill="${l}"/>
        <circle cx="160" cy="130" r="24" fill="${c}"/>
        <ellipse cx="178" cy="138" rx="14" ry="10" fill="${c}"/>
        <path d="M148 110 l-4 -10 M166 108 l4 -10" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
        ${eye(164, 124, 8)} ${cheek(152, 142)}
        ${smile(170, 146, 16)}`;
    }
  };

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

  window.makeDino = function (type, colourName) {
    const hex = window.COLOURS[colourName] || colourName || "#5ec36a";
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${draw[type](hex)}</svg>`;
  };
})();
