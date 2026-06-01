/* =========================================================
   Boxli Brawl - eigene Symbole (Inline-SVG, keine Emojis)
   Alle Icons sind eigene, einfache Vektorgrafiken.
   Nutzung: Icons.svg("coin")  ->  SVG-String fuers innerHTML
   ========================================================= */

const Icons = {
  svg(name, cls) {
    const inner = this.defs[name];
    if (!inner) return "";
    return `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">${inner}</svg>`;
  },

  defs: {
    /* Währung */
    coin: `<circle cx="12" cy="12" r="9.5" fill="#ffd34d" stroke="#d99a1e" stroke-width="2"/>
      <circle cx="12" cy="12" r="5.6" fill="none" stroke="#e7af2c" stroke-width="1.6"/>
      <circle cx="9.4" cy="9.2" r="1.7" fill="#fff" opacity=".75"/>`,
    gem: `<path d="M5 9 L9 4 H15 L19 9 L12 21 Z" fill="#56c6f5" stroke="#2f8fcc" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M5 9 H19 M9 4 L12 9 L15 4 M12 9 L12 21" fill="none" stroke="#dff4ff" stroke-width="1.1"/>`,

    /* Kampf / Stat */
    glove: `<path d="M7 6.5 q5 -2 8.5 1 q3 2.2 2 6.2 q-1 4.3 -6.5 4.3 H8.5 q-3 0 -3 -3 V9.5 q0 -2.2 1.5 -3 Z" fill="#ef5b54" stroke="#b23a34" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M6 11 q-2 0 -2 2 t2 2" fill="#ef5b54" stroke="#b23a34" stroke-width="1.5"/>
      <path d="M8 9.5 q4 -1.5 7 0" fill="none" stroke="#b23a34" stroke-width="1.3"/>`,
    bag: `<path d="M9 4.5 L12 3 L15 4.5" fill="none" stroke="#8a6a3a" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="8.5" y="5.5" width="7" height="13" rx="3.2" fill="#5a7fd0" stroke="#3a5aa0" stroke-width="1.5"/>
      <path d="M8.5 10 h7 M8.5 14 h7" stroke="#3a5aa0" stroke-width="1"/>`,
    muscle: `<path d="M5 14.5 q0 -5.5 5.5 -5.5 H13 q4 0 4 4 q0 4.2 -4 4.2 H9.5 q-4.5 0 -4.5 -2.7 Z" fill="#f0a06a" stroke="#c06a3a" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M13 9 q3 -3 5 -1" fill="none" stroke="#c06a3a" stroke-width="1.6" stroke-linecap="round"/>`,

    /* Gebäude / Navigation */
    shop: `<path d="M3.5 9.5 L6 5 H18 L20.5 9.5 Z" fill="#ef6f5a" stroke="#c0432f" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="5" y="9.5" width="14" height="9.5" fill="#ffe1b0" stroke="#cf9a52" stroke-width="1.4"/>
      <rect x="9.5" y="13" width="5" height="6" rx="1" fill="#7ab8e0" stroke="#cf9a52" stroke-width="1.2"/>`,
    trophy: `<path d="M8 4 H16 V8 q0 4.2 -4 4.2 T8 8 Z" fill="#ffd34d" stroke="#d9a51f" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M8 5 H4.5 q0 4 4 4.2 M16 5 H19.5 q0 4 -4 4.2" fill="none" stroke="#d9a51f" stroke-width="1.5"/>
      <rect x="10.6" y="12" width="2.8" height="4" fill="#d9a51f"/>
      <rect x="7.5" y="16" width="9" height="3" rx="1.2" fill="#caa024"/>`,

    /* Auszeichnungen */
    medal: `<path d="M9 3 L12 9 L7 9 Z" fill="#ef5b54"/><path d="M15 3 L12 9 L17 9 Z" fill="#4aa3df"/>
      <circle cx="12" cy="15" r="6" fill="#ffd34d" stroke="#d9a51f" stroke-width="1.5"/>
      <path d="M12 11.5 L13 13.7 L15.4 14 L13.7 15.7 L14.1 18 L12 16.9 L9.9 18 L10.3 15.7 L8.6 14 L11 13.7 Z" fill="#e0a92a"/>`,
    crown: `<path d="M4 17 L5 8 L9 12 L12 5.5 L15 12 L19 8 L20 17 Z" fill="#ffd34d" stroke="#d9a51f" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="4" y="16.5" width="16" height="3" rx="1" fill="#e0b32e"/>
      <circle cx="12" cy="9" r="1" fill="#ef5b54"/>`,
    dna: `<path d="M8 4 q8 4 8 8 t-8 8 M16 4 q-8 4 -8 8 t8 8" fill="none" stroke="#7e4fb0" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9.2 7 H14.8 M8.2 12 H15.8 M9.2 17 H14.8" stroke="#c0a0e8" stroke-width="1.5"/>`,

    /* Effekte */
    star: `<path d="M12 3 L14.5 9 L21 9.5 L16 13.6 L17.6 20 L12 16.4 L6.4 20 L8 13.6 L3 9.5 L9.5 9 Z" fill="#ffd34d" stroke="#e0a92a" stroke-width="1.2" stroke-linejoin="round"/>`,
    sparkle: `<path d="M12 2.5 Q13.2 9 19.5 12 Q13.2 15 12 21.5 Q10.8 15 4.5 12 Q10.8 9 12 2.5 Z" fill="#fff0b8" stroke="#ffd34d" stroke-width="1.1" stroke-linejoin="round"/>`,
    boss: `<path d="M12 2 L14.6 8.4 L21.5 9 L16.2 13.5 L18 20.4 L12 16.6 L6 20.4 L7.8 13.5 L2.5 9 L9.4 8.4 Z" fill="#ff7a3d" stroke="#c0432f" stroke-width="1.2" stroke-linejoin="round"/>`,
    arrowup: `<path d="M12 4 L19.5 12.5 H14.5 V20 H9.5 V12.5 H4.5 Z" fill="#7bc043" stroke="#5fa030" stroke-width="1.4" stroke-linejoin="round"/>`,
    lock: `<rect x="5" y="10" width="14" height="10" rx="2.4" fill="#bcae97" stroke="#8a7a5e" stroke-width="1.5"/>
      <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="#8a7a5e" stroke-width="1.9"/>
      <circle cx="12" cy="14.5" r="1.6" fill="#6b5d44"/>`,
    check: `<path d="M5 12.5 L10 17.5 L19 6.5" fill="none" stroke="#5fa030" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    dash: `<path d="M6 12 H18" stroke="#9a8a6e" stroke-width="3" stroke-linecap="round"/>`,

    /* Ton */
    sound: `<path d="M4 9.5 H7 L12 5.5 V18.5 L7 14.5 H4 Z" fill="#6b4a2b"/>
      <path d="M15 9.5 q2 2.5 0 5 M17 7.5 q3.6 4.5 0 9" fill="none" stroke="#6b4a2b" stroke-width="1.7" stroke-linecap="round"/>`,
    mute: `<path d="M4 9.5 H7 L12 5.5 V18.5 L7 14.5 H4 Z" fill="#6b4a2b"/>
      <path d="M15.5 9.5 L20.5 14.5 M20.5 9.5 L15.5 14.5" stroke="#c0392b" stroke-width="1.9" stroke-linecap="round"/>`,

    /* Snacks (fallen im Spielfeld) */
    rice: `<path d="M12 4.5 q6 2 6.8 14 H5.2 q.8 -12 6.8 -14 Z" fill="#fff" stroke="#d8d8d8" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="9" y="12" width="6" height="6.2" rx="1" fill="#3a7d44"/>`,
    berry: `<path d="M9 4 q3 1.8 6 0 q-.8 3 -3 3.2 Q9.8 7 9 4 Z" fill="#5fa030"/>
      <path d="M12 6.6 q6.2 0 6.2 6.3 q0 6.1 -6.2 7 Q5.8 18.9 5.8 12.9 q0 -6.3 6.2 -6.3 Z" fill="#ef4b5a" stroke="#c0303f" stroke-width="1.2"/>
      <g fill="#ffe9b0"><circle cx="9.5" cy="12" r=".7"/><circle cx="12" cy="14" r=".7"/><circle cx="14.5" cy="12" r=".7"/><circle cx="11" cy="16.5" r=".7"/></g>`,
    blueberry: `<circle cx="12" cy="13" r="7" fill="#5a6fd0" stroke="#3a4a9f" stroke-width="1.3"/>
      <path d="M12 9.2 l.9 1.9 2 .2 -1.5 1.4 .4 2 -1.8 -1 -1.8 1 .4 -2 -1.5 -1.4 2 -.2 Z" fill="#2f3a7a"/>
      <circle cx="9.5" cy="10.5" r="1.4" fill="#8a9ae0" opacity=".7"/>`,
    honey: `<path d="M12 4.5 q5 7 5 11 a5 5 0 0 1 -10 0 q0 -4 5 -11 Z" fill="#ffb733" stroke="#d98e1e" stroke-width="1.3" stroke-linejoin="round"/>
      <ellipse cx="10" cy="13" rx="1.4" ry="2" fill="#fff" opacity=".55"/>`,
    coconut: `<circle cx="12" cy="12" r="8" fill="#8a5a3a" stroke="#5e3a22" stroke-width="1.4"/>
      <circle cx="10" cy="9.5" r="1.3" fill="#3a241a"/><circle cx="14" cy="9.5" r="1.3" fill="#3a241a"/><circle cx="12" cy="13.5" r="1.3" fill="#3a241a"/>`,

    /* Trainings */
    rock: `<path d="M5 16 L8 9 L14 7 L19 12 L16.5 17.5 Z" fill="#bcb5a8" stroke="#8a8276" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M8 9 L13 11 L16.5 17.5 M13 11 L14 7" fill="none" stroke="#8a8276" stroke-width="1"/>`,
    wind: `<path d="M3 8.5 H13.5 a2.2 2.2 0 1 0 -2.2 -2.2" fill="none" stroke="#7fb5d8" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M3 12.5 H17 a2.2 2.2 0 1 1 -2.2 2.2" fill="none" stroke="#7fb5d8" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M3 16.5 H11" fill="none" stroke="#7fb5d8" stroke-width="1.9" stroke-linecap="round"/>`,
    mountain: `<path d="M3 19 L9 8 L13 14 L16 9 L21 19 Z" fill="#9a8d7a" stroke="#6e6253" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M9 8 L11 11 L7.5 12 Z" fill="#fff"/><path d="M16 9 L17.5 12 L14.8 12.4 Z" fill="#fff"/>`,

    /* Upgrades */
    basket: `<path d="M4 9 H20 L18 19 H6 Z" fill="#e0b06a" stroke="#a9743a" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M4 9 H20" stroke="#a9743a" stroke-width="1.4"/>
      <path d="M8 9 q4 -6 8 0" fill="none" stroke="#a9743a" stroke-width="1.4"/>
      <path d="M9 11 L8.4 17 M12 11 V17 M15 11 L15.6 17" stroke="#a9743a" stroke-width="1"/>`,
    dumbbell: `<rect x="3" y="9.5" width="3" height="5" rx="1" fill="#6b7280"/><rect x="18" y="9.5" width="3" height="5" rx="1" fill="#6b7280"/>
      <rect x="6" y="10.8" width="12" height="2.4" fill="#9aa0a6"/>
      <rect x="6" y="8.5" width="2.2" height="7" rx="1" fill="#7b828a"/><rect x="15.8" y="8.5" width="2.2" height="7" rx="1" fill="#7b828a"/>`,

    /* Items */
    bar: `<rect x="5" y="8" width="14" height="8" rx="2" fill="#7a4a28" stroke="#5e3a22" stroke-width="1.4"/>
      <path d="M9 8 V16 M12.5 8 V16 M16 8 V16" stroke="#5e3a22" stroke-width="1"/>
      <path d="M5 8 q7 -2 14 0" fill="none" stroke="#a06a3a" stroke-width="1"/>`,
    drink: `<path d="M7 7.5 H17 L15.8 18.5 H8.2 Z" fill="#ef5b6e" stroke="#c0303f" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M7 10 H17" stroke="#fff" stroke-width="1" opacity=".5"/>
      <rect x="11" y="3" width="2" height="6" rx="1" fill="#9aa6b2"/>`,
    bento: `<rect x="4" y="7" width="16" height="11" rx="2.2" fill="#e7553f" stroke="#b23a2a" stroke-width="1.4"/>
      <rect x="6" y="9" width="5.2" height="7" rx="1" fill="#fff"/><circle cx="8.6" cy="12.5" r="1.6" fill="#ef4b5a"/>
      <rect x="12.4" y="9" width="5.6" height="7" rx="1" fill="#9ed36a"/>`,
    megastar: `<path d="M12 2.5 L15 9 L21.8 9.6 L16.5 14 L18.2 20.8 L12 16.9 L5.8 20.8 L7.5 14 L2.2 9.6 L9 9 Z" fill="#ffe06a" stroke="#e0a92a" stroke-width="1.3" stroke-linejoin="round"/>
      <circle cx="12" cy="11.5" r="2.2" fill="#fff" opacity=".7"/>`,
  },
};
