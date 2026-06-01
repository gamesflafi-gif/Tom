/* =========================================================
   Boxli Brawl - Kernlogik & Spielzustand
   ========================================================= */

const Game = {
  state: null,

  /* ---- neues Spiel / Laden ---- */
  init() {
    const loaded = SAVE.load();
    if (loaded) {
      this.state = loaded;
      this.refillOverTime(); // offline nachwachsen lassen
    } else {
      this.state = this.freshState();
    }
  },

  freshState() {
    const sp = DATA.species[0]; // erster Boxling immer "Pummel"
    return {
      generation: 1,
      genBonus: 0,             // permanenter %-Bonus aus Renten (0.05 = +5%)
      speciesId: sp.id,
      kk: DATA.config.baseKK,
      level: 1,
      rank: 1,
      duelIndex: 0,            // aktuelles Duell innerhalb der Liga
      coins: 0,
      gems: 0,
      food: DATA.config.foodMax,
      train: DATA.config.trainMax,
      upgrades: { food: 0, train: 0, foodcap: 0, traincap: 0 },
      lastTick: Date.now(),
    };
  },

  persist() {
    this.state.lastTick = Date.now();
    SAVE.save(this.state);
  },

  /* ---- abgeleitete Werte ---- */
  species() { return DATA.speciesById(this.state.speciesId); },

  foodMax()  { return DATA.config.foodMax + this.state.upgrades.foodcap * 2; },
  trainMax() { return DATA.config.trainMax + this.state.upgrades.traincap; },

  // KK pro Snack: skaliert mit aktueller KK + Futter-Upgrade
  foodGain() {
    const up = this.state.upgrades.food;
    const flat = 4 + up * 6;
    const pct = (0.004 + up * 0.0016) * this.state.kk;
    return Math.max(1, Math.round((flat + pct) * this.species().mult));
  },

  // KK-Schwelle, um ein bestimmtes Level zu erreichen
  kkForLevel(level) {
    if (level <= 1) return 0;
    const c = DATA.config;
    return Math.round(c.levelBase * Math.pow(c.levelFactor, level - 2));
  },

  maxLevel() { return DATA.config.maxLevel + (this.state.generation - 1); },

  recalcLevel() {
    const max = this.maxLevel();
    let lvl = 1;
    while (lvl < max && this.state.kk >= this.kkForLevel(lvl + 1)) lvl++;
    const leveledUp = lvl > this.state.level;
    this.state.level = lvl;
    return leveledUp;
  },

  // Fortschritt 0..1 innerhalb des aktuellen Levels
  levelProgress() {
    const cur = this.kkForLevel(this.state.level);
    const next = this.kkForLevel(this.state.level + 1);
    if (this.state.level >= this.maxLevel()) return 1;
    return Math.min(1, Math.max(0, (this.state.kk - cur) / (next - cur)));
  },

  atMaxLevel() { return this.state.level >= this.maxLevel(); },

  /* ---- KK hinzufuegen ---- */
  addKK(amount) {
    this.state.kk += amount;
    const leveled = this.recalcLevel();
    this.persist();
    return leveled;
  },

  /* ---- Fuettern ---- */
  canEat() { return this.state.food > 0; },

  eat() {
    if (this.state.food <= 0) return null;
    this.state.food--;
    const gain = this.foodGain();
    const coin = Math.random() < 0.25 ? 1 : 0;
    this.state.coins += coin;
    const leveled = this.addKK(gain);
    return { gain, coin, leveled };
  },

  /* ---- Training ---- */
  canTrain() { return this.state.train > 0; },

  doTraining(trainingId) {
    if (this.state.train <= 0) return null;
    const tr = DATA.trainings.find(t => t.id === trainingId);
    if (!tr) return null;
    this.state.train--;
    const up = this.state.upgrades.train;
    const upMult = 1 + up * 0.25;
    const base = (tr.flat + tr.gainPct * this.state.kk) * upMult * this.species().mult;
    // kleine Varianz fuer Spannung
    const variance = 0.85 + Math.random() * 0.4;
    const gain = Math.max(1, Math.round(base * variance));
    const leveled = this.addKK(gain);
    return { gain, leveled, training: tr };
  },

  /* ---- Liga / Duelle ---- */
  currentLeague() { return DATA.leagueByRank(this.state.rank); },

  opponentKK() {
    const lg = this.currentLeague();
    // Gegner skaliert mit Liga-Faktor und Duell-Nummer
    const duelScale = 1 + this.state.duelIndex * 0.12;
    const base = this.state.kk * lg.opp * duelScale;
    const variance = 0.9 + Math.random() * 0.3;
    return Math.max(5, Math.round(base * variance));
  },

  // Liefert ein Ergebnis-Objekt fuer das aktuelle Duell
  fight() {
    const myKK = this.state.kk;
    const oppKK = this.opponentKK();
    // Gewinnchance abhaengig vom KK-Verhaeltnis, mit Glueck
    const ratio = myKK / (myKK + oppKK);
    const roll = Math.random();
    const win = roll < (0.1 + ratio * 0.8); // immer etwas Restchance
    return { win, myKK, oppKK };
  },

  // nach gewonnenem Duell vorruecken
  advanceDuel() {
    const lg = this.currentLeague();
    this.state.duelIndex++;
    let leagueCleared = false;
    let reward = { coin: 0, gem: 0 };
    if (this.state.duelIndex >= lg.duels) {
      // Liga geschafft -> Belohnung + Rang hoch
      reward = { coin: lg.coin, gem: lg.gem };
      this.state.coins += lg.coin;
      this.state.gems += lg.gem;
      this.state.duelIndex = 0;
      if (this.state.rank < DATA.leagues.length) this.state.rank++;
      leagueCleared = true;
    } else {
      // pro Duell ein paar Muenzen
      const c = 2 + this.state.rank;
      this.state.coins += c;
      reward.coin = c;
    }
    this.persist();
    return { leagueCleared, reward };
  },

  /* ---- Shop ---- */
  upgradeCost(id) {
    const u = DATA.upgrades.find(x => x.id === id);
    const lvl = this.state.upgrades[id];
    return Math.round(u.baseCost * Math.pow(u.costFactor, lvl));
  },

  upgradeMaxed(id) {
    const u = DATA.upgrades.find(x => x.id === id);
    return this.state.upgrades[id] >= u.maxLvl;
  },

  buyUpgrade(id) {
    if (this.upgradeMaxed(id)) return { ok: false, reason: "max" };
    const cost = this.upgradeCost(id);
    if (this.state.coins < cost) return { ok: false, reason: "coins" };
    this.state.coins -= cost;
    this.state.upgrades[id]++;
    this.persist();
    return { ok: true, cost };
  },

  /* ---- Edelsteine: Vorraete auffuellen ---- */
  refillTrainCost: 1,
  refillFoodCost: 1,

  refillTrain() {
    if (this.state.train >= this.trainMax()) return false;
    if (this.state.gems < this.refillTrainCost) return false;
    this.state.gems -= this.refillTrainCost;
    this.state.train = this.trainMax();
    this.persist();
    return true;
  },

  /* ---- Generation in Rente / naechste starten ---- */
  retire() {
    // Bonus aus erreichter KK: je staerker, desto groesserer permanenter Boost
    const earned = 0.03 + Math.min(0.15, this.state.kk / 200000);
    this.state.genBonus = +(this.state.genBonus + earned).toFixed(4);
    const gemReward = 2 + this.state.generation;
    const coinReward = 30 + this.state.generation * 10;
    this.state.gems += gemReward;
    this.state.coins += coinReward;
    return { earned, gemReward, coinReward, finalKK: this.state.kk };
  },

  nextGeneration() {
    const newSp = DATA.randomSpecies(this.state.generation);
    this.state.generation++;
    this.state.speciesId = newSp.id;
    this.state.kk = Math.round(DATA.config.baseKK * (1 + this.state.genBonus));
    this.state.level = 1;
    this.state.food = this.foodMax();
    this.state.train = this.trainMax();
    this.recalcLevel();
    this.persist();
    return newSp;
  },

  /* ---- Vorraete ueber Zeit auffuellen ---- */
  refillOverTime() {
    const now = Date.now();
    const dt = (now - (this.state.lastTick || now)) / 1000; // Sekunden
    if (dt <= 0) { this.state.lastTick = now; return; }

    const foodGained = Math.floor(dt / DATA.config.foodRefillSec);
    if (foodGained > 0) {
      this.state.food = Math.min(this.foodMax(), this.state.food + foodGained);
    }
    const trainGained = Math.floor(dt / DATA.config.trainRefillSec);
    if (trainGained > 0) {
      this.state.train = Math.min(this.trainMax(), this.state.train + trainGained);
    }
    this.state.lastTick = now;
  },

  // wird vom Spiel-Loop regelmaessig aufgerufen
  tick() {
    let changed = false;
    if (this.state.food < this.foodMax() || this.state.train < this.trainMax()) {
      const before = this.state.food + this.state.train;
      this.refillOverTime();
      if (this.state.food + this.state.train !== before) changed = true;
    } else {
      this.state.lastTick = Date.now();
    }
    return changed;
  },
};
