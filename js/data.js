/* =========================================================
   Boxli Brawl - Spieldaten
   Alle Inhalte sind eigene Erfindungen (keine Lizenz-IP).
   ========================================================= */

const DATA = {};

/* ---- Allgemeine Konstanten ---- */
DATA.config = {
  baseKK: 10,            // Start-Kampfkraft jeder neuen Kreatur
  maxLevel: 20,          // Level pro Generation
  levelBase: 22,         // KK-Schwelle fuer Level 2
  levelFactor: 1.34,     // Wachstum der Level-Schwellen
  foodMax: 10,           // max. Futterpunkte
  foodRefillSec: 9,      // Sekunden pro nachwachsendem Futterpunkt
  trainMax: 6,           // max. Trainingspunkte
  trainRefillSec: 90,    // Sekunden pro nachwachsendem Trainingspunkt
  foodSpawnSec: 1.6,     // Sekunden zwischen erscheinenden Snacks
  evolveLevels: [7, 14], // Level, bei denen sich die Kreatur entwickelt
  evolveBonus: 0.12,     // KK-Bonus pro Entwicklung (+12%)
};

/* ---- Kreaturen-Arten ("Boxlinge") ----
   move: "Schlag" oder "Tritt" (eigener Angriff je Art)
   palette: Farben fuer das per-Code gezeichnete Sprite
   mult: Multiplikator auf KK-Gewinne (Seltenheit)            */
DATA.species = [
  { id: "pummel",  move: "Schlag", shape: "round", mult: 1.00, rarity: "normal",
    forms: ["Pummel", "Pummax", "Pummalord"],
    palette: { body: "#ff9bbd", belly: "#ffd6e4", accent: "#e0608a", eye: "#3a2230" } },
  { id: "knuffo",  move: "Schlag", shape: "wide",  mult: 1.05, rarity: "normal",
    forms: ["Knuffo", "Knuffax", "Knuffaron"],
    palette: { body: "#9ad36a", belly: "#d7f0bf", accent: "#5fa030", eye: "#243018" } },
  { id: "wolki",   move: "Tritt",  shape: "round", mult: 1.05, rarity: "normal",
    forms: ["Wolki", "Wolkron", "Wolkanos"],
    palette: { body: "#e8eef5", belly: "#ffffff", accent: "#a9bccd", eye: "#33424f" } },
  { id: "flammo",  move: "Tritt",  shape: "tall",  mult: 1.12, rarity: "selten",
    forms: ["Flammo", "Flammar", "Flammgolt"],
    palette: { body: "#ff8a3d", belly: "#ffd9a8", accent: "#d35e1a", eye: "#3a2210" } },
  { id: "aquino",  move: "Schlag", shape: "tall",  mult: 1.12, rarity: "selten",
    forms: ["Aquino", "Aquaron", "Aquagant"],
    palette: { body: "#5fbef0", belly: "#cdeeff", accent: "#2f8fcc", eye: "#1c3a4a" } },
  { id: "stachu",  move: "Tritt",  shape: "round", mult: 1.18, rarity: "selten",
    forms: ["Stachu", "Stachor", "Stacharon"],
    palette: { body: "#b88adf", belly: "#e8d4f5", accent: "#7e4fb0", eye: "#2e1f3a" } },
  { id: "golbax",  move: "Schlag", shape: "wide",  mult: 1.30, rarity: "episch",
    forms: ["Golbax", "Golbaron", "Golbarex"],
    palette: { body: "#ffce4a", belly: "#fff0bf", accent: "#d9a51f", eye: "#3a2c08" } },
  { id: "nachti",  move: "Tritt",  shape: "tall",  mult: 1.35, rarity: "episch",
    forms: ["Nachti", "Nachtaron", "Nachtgeist"],
    palette: { body: "#5566a8", belly: "#aab4dd", accent: "#34406f", eye: "#e8e8ff" } },
];

// Name der aktuellen Entwicklungsstufe (0..2)
DATA.formName = function (sp, stage) {
  return (sp.forms && sp.forms[stage]) || (sp.forms ? sp.forms[0] : sp.id);
};

/* ---- Trainings ----
   gainPct: Anteil der aktuellen KK, der als Gewinn dient (vor Upgrades)
   flat: zusaetzlicher fixer Bonus                                          */
DATA.trainings = [
  { id: "boxsack",  name: "Boxsack-Schlag", icon: "🥊", gainPct: 0.06, flat: 30,  desc: "Solides Krafttraining am Sack." },
  { id: "steine",   name: "Stein-Stoß",     icon: "🪨", gainPct: 0.09, flat: 50,  desc: "Schwere Steine umstoßen – harter Schub." },
  { id: "sprint",   name: "Fluss-Sprint",   icon: "💨", gainPct: 0.04, flat: 80,  desc: "Ausdauerlauf für stetigen Zuwachs." },
  { id: "fels",     name: "Fels-Tritt",     icon: "⛰️", gainPct: 0.13, flat: 70,  desc: "Riskant, aber starker Kampfkraft-Sprung." },
];

/* ---- Liga-Stufen (Raenge) ----
   Jede Liga hat eine Anzahl Duelle. opp = Gegnerstaerke-Faktor.   */
DATA.leagues = [
  { rank: 1, name: "Anfänger-Liga", duels: 5, opp: 0.55, coin: 12, gem: 0 },
  { rank: 2, name: "Bronze-Liga",   duels: 5, opp: 0.75, coin: 20, gem: 0 },
  { rank: 3, name: "Silber-Liga",   duels: 6, opp: 0.95, coin: 30, gem: 1 },
  { rank: 4, name: "Gold-Liga",     duels: 6, opp: 1.15, coin: 45, gem: 1 },
  { rank: 5, name: "Platin-Liga",   duels: 7, opp: 1.45, coin: 70, gem: 2 },
  { rank: 6, name: "Champion-Liga", duels: 8, opp: 1.85, coin: 120, gem: 3 },
];

/* ---- Shop-Upgrades ----
   level-basierte Upgrades; Kosten skalieren.                       */
DATA.upgrades = [
  { id: "food",  name: "Besseres Futter", icon: "🍙", cur: "coin",
    desc: "Mehr KK pro Snack.", baseCost: 30, costFactor: 1.55, maxLvl: 30 },
  { id: "train", name: "Härteres Training", icon: "🥊", cur: "coin",
    desc: "Mehr KK pro Trainingseinheit.", baseCost: 50, costFactor: 1.6, maxLvl: 30 },
  { id: "foodcap", name: "Größerer Futtervorrat", icon: "🧺", cur: "coin",
    desc: "+2 maximale Futterpunkte.", baseCost: 80, costFactor: 1.8, maxLvl: 12 },
  { id: "traincap", name: "Mehr Trainingsplätze", icon: "🏋️", cur: "coin",
    desc: "+1 maximaler Trainingspunkt.", baseCost: 150, costFactor: 2.0, maxLvl: 8 },
];

/* Hilfsfunktionen ----------------------------------------------- */
DATA.speciesById = function (id) {
  return DATA.species.find(s => s.id === id) || DATA.species[0];
};

DATA.randomSpecies = function (genBonus) {
  // hoehere Generation -> leicht hoehere Chance auf seltene Arten
  const weights = DATA.species.map(s => {
    if (s.rarity === "normal") return 100;
    if (s.rarity === "selten") return 32 + genBonus * 3;
    if (s.rarity === "episch") return 7 + genBonus * 2;
    return 1;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < DATA.species.length; i++) {
    r -= weights[i];
    if (r <= 0) return DATA.species[i];
  }
  return DATA.species[0];
};

DATA.leagueByRank = function (rank) {
  return DATA.leagues.find(l => l.rank === rank) || DATA.leagues[DATA.leagues.length - 1];
};
