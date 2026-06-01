/* =========================================================
   Boxli Brawl - UI, Bildschirme, Animationen, Events
   ========================================================= */

const UI = {
  screens: {},
  current: "title",
  foodTimer: 0,
  anim: { league: null, training: null },

  init() {
    document.querySelectorAll(".screen").forEach(s => {
      this.screens[s.id.replace("screen-", "")] = s;
    });
    this.bindActions();
    this.startLoops();
    this.show("title");
    this.drawTitle();
  },

  /* ---------- Bildschirm-Wechsel ---------- */
  show(name) {
    Object.values(this.screens).forEach(s => s.classList.remove("active"));
    if (this.screens[name]) this.screens[name].classList.add("active");
    this.current = name;
    if (name === "home") this.refreshHome();
    if (name === "training") this.renderTraining();
    if (name === "shop") this.renderShop();
    if (name === "league") this.renderLeague();
  },

  /* ---------- zentrale Klick-Verarbeitung ---------- */
  bindActions() {
    document.body.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.dataset.action;
      this.handle(action, el);
    });
  },

  handle(action, el) {
    switch (action) {
      case "start-game": this.show("home"); break;
      case "go-home": this.show("home"); break;
      case "open-shop": this.show("shop"); break;
      case "open-training": this.show("training"); break;
      case "open-league": this.show("league"); break;
      case "do-fight": this.runFight(); break;
      case "next-generation": this.doNextGeneration(); break;
      case "close-popup": document.getElementById("popup").classList.add("hidden"); break;
    }
  },

  /* ---------- Popup ---------- */
  popup(title, bodyHtml) {
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-body").innerHTML = bodyHtml;
    document.getElementById("popup").classList.remove("hidden");
  },

  floatText(txt, x, y) {
    const layer = document.getElementById("float-layer");
    const el = document.createElement("div");
    el.className = "float-text";
    el.textContent = txt;
    el.style.left = x + "px";
    el.style.top = y + "px";
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  /* ============================================================
     HOME
     ============================================================ */
  refreshHome() {
    const st = Game.state;
    const sp = Game.species();
    document.getElementById("hud-gen").textContent = st.generation + ". Generation";
    document.getElementById("hud-species").textContent = sp.name;
    const badge = document.getElementById("hud-move-badge");
    badge.textContent = sp.move;
    badge.classList.toggle("tritt", sp.move === "Tritt");
    document.getElementById("hud-kk").textContent = this.fmt(st.kk);
    document.getElementById("hud-level").textContent = `Lv. ${st.level}/${Game.maxLevel()}`;
    document.getElementById("hud-level-fill").style.width = (Game.levelProgress() * 100) + "%";
    document.getElementById("hud-rank").textContent = st.rank;
    document.getElementById("hud-coins").textContent = this.fmt(st.coins);
    document.getElementById("hud-gems").textContent = st.gems;
    this.refreshResourceBars();

    // Liga-Bereit-Anzeige nur wenn nicht Max-Level / oder immer bereit
    document.getElementById("league-ready").style.display =
      Game.atMaxLevel() ? "none" : "block";

    // Hinweis auf Renten-Moeglichkeit bei Max-Level
    if (Game.atMaxLevel()) this.maybeOfferRetire();
  },

  refreshResourceBars() {
    const st = Game.state;
    const fMax = Game.foodMax(), tMax = Game.trainMax();
    document.getElementById("food-fill").style.width = (st.food / fMax * 100) + "%";
    document.getElementById("food-count").textContent = `${st.food}/${fMax}`;
    document.getElementById("train-fill").style.width = (st.train / tMax * 100) + "%";
    document.getElementById("train-count").textContent = `${st.train}/${tMax}`;
    document.getElementById("train-points-2") && (document.getElementById("train-points-2").textContent = `${st.train}/${tMax}`);
    const badge = document.getElementById("train-badge");
    badge.textContent = st.train;
    badge.style.display = st.train > 0 ? "grid" : "none";
  },

  // Snack erscheinen lassen
  spawnFood() {
    if (Game.state.food <= 0) return;
    const layer = document.getElementById("food-layer");
    if (layer.children.length >= 4) return; // nicht zu viele
    const choices = ["🍙", "🍓", "🫐", "🍯", "🥥"];
    const el = document.createElement("div");
    el.className = "food-item";
    el.textContent = choices[Math.floor(Math.random() * choices.length)];
    const arena = document.querySelector(".arena").getBoundingClientRect();
    const x = 30 + Math.random() * (arena.width - 90);
    const y = 60 + Math.random() * (arena.height * 0.45);
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.addEventListener("click", () => this.onEatFood(el, x, y));
    layer.appendChild(el);
    // verschwindet nach einer Weile
    setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
  },

  onEatFood(el, x, y) {
    const res = Game.eat();
    el.remove();
    if (!res) return;
    this.floatText("+" + this.fmt(res.gain) + " KK", x, y);
    if (res.coin) this.floatText("🪙+1", x + 20, y - 20);
    this.bumpCreature();
    this.refreshHome();
    if (res.leveled) this.onLevelUp();
  },

  bumpCreature() {
    const c = document.getElementById("home-creature");
    c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
  },

  onLevelUp() {
    if (Game.atMaxLevel()) {
      this.maybeOfferRetire();
    }
  },

  maybeOfferRetire() {
    if (this._retireShown) return;
    this._retireShown = true;
    setTimeout(() => this.showRetire(), 400);
  },

  /* ============================================================
     TRAINING
     ============================================================ */
  renderTraining() {
    this.refreshResourceBars();
    const list = document.getElementById("training-list");
    document.getElementById("training-stage").classList.add("hidden");
    list.classList.remove("hidden");
    list.innerHTML = "";
    DATA.trainings.forEach(tr => {
      const up = Game.state.upgrades.train;
      const est = Math.round((tr.flat + tr.gainPct * Game.state.kk) * (1 + up * 0.25) * Game.species().mult);
      const card = document.createElement("div");
      const usable = Game.canTrain();
      card.className = "card" + (usable ? "" : " disabled");
      card.innerHTML = `
        <div class="card-ico">${tr.icon}</div>
        <div class="card-main">
          <div class="card-name">${tr.name}</div>
          <div class="card-desc">${tr.desc}</div>
          <div class="card-desc">≈ +${this.fmt(est)} KK</div>
        </div>
        <div class="card-cost">🥊 1</div>`;
      if (usable) card.addEventListener("click", () => this.runTraining(tr.id));
      list.appendChild(card);
    });
    if (!Game.canTrain()) {
      const note = document.createElement("div");
      note.className = "card disabled";
      const canBuy = Game.state.gems >= Game.refillTrainCost;
      note.innerHTML = `<div class="card-ico">💎</div>
        <div class="card-main"><div class="card-name">Keine Trainingspunkte</div>
        <div class="card-desc">Sie wachsen mit der Zeit nach – oder fülle sofort auf.</div></div>
        <div class="card-cost gem">💎 ${Game.refillTrainCost}</div>`;
      note.classList.toggle("disabled", !canBuy);
      if (canBuy) note.addEventListener("click", () => {
        if (Game.refillTrain()) { this.renderTraining(); this.refreshResourceBars(); }
      });
      list.appendChild(note);
    }
  },

  runTraining(id) {
    const res = Game.doTraining(id);
    if (!res) return;
    const list = document.getElementById("training-list");
    const stage = document.getElementById("training-stage");
    list.classList.add("hidden");
    stage.classList.remove("hidden");
    document.getElementById("training-result").textContent = "";

    // Trainings-Animation: die Kreatur fuehrt ihren Angriff aus
    const canvas = document.getElementById("training-canvas");
    const ctx = canvas.getContext("2d");
    const sp = Game.species();
    const start = performance.now();
    const dur = 1100;
    const pose = sp.move === "Tritt" ? "kick" : "punch";

    const animate = (now) => {
      const e = Math.min(1, (now - start) / dur);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 3 Schlaege/Tritte
      const phase = (e * 3) % 1;
      Creature.draw(ctx, {
        species: sp, cx: canvas.width / 2, cy: canvas.height / 2 + 20,
        scale: 1.5, facing: 1, t: now, pose, poseAmt: Math.sin(phase * Math.PI),
      });
      if (e < 1) requestAnimationFrame(animate);
      else {
        document.getElementById("training-result").textContent =
          `+${this.fmt(res.gain)} KK!`;
        setTimeout(() => {
          stage.classList.add("hidden");
          this.refreshResourceBars();
          this.renderTraining();
          if (res.leveled && Game.atMaxLevel()) this.maybeOfferRetire();
        }, 1100);
      }
    };
    requestAnimationFrame(animate);
  },

  /* ============================================================
     LIGA
     ============================================================ */
  renderLeague() {
    const lg = Game.currentLeague();
    document.getElementById("league-title").textContent = lg.name;
    document.getElementById("duel-no").textContent =
      `Duell ${Game.state.duelIndex + 1}/${lg.duels}`;
    document.getElementById("league-info").textContent =
      "Alle warten auf das Startsignal!";
    const btn = document.getElementById("btn-fight");
    btn.disabled = false;
    const sp = Game.species();
    btn.textContent = sp.move === "Tritt" ? "Tritt zu!" : "Schlag zu!";
    this.leagueOpponent = DATA.randomSpecies(Game.state.generation);
    this.drawLeagueIdle();
  },

  drawLeagueIdle() {
    const canvas = document.getElementById("league-canvas");
    const ctx = canvas.getContext("2d");
    const draw = (now) => {
      if (this.current !== "league" || this._leagueFighting) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawRing(ctx, canvas);
      Creature.draw(ctx, { species: Game.species(), cx: 110, cy: 220, scale: 1.1, facing: 1, t: now, pose: "idle" });
      Creature.draw(ctx, { species: this.leagueOpponent, cx: 250, cy: 220, scale: 1.1, facing: -1, t: now + 300, pose: "idle" });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  },

  drawRing(ctx, canvas) {
    ctx.fillStyle = "#f2e2c0";
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, 250, 150, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9ad6f";
    ctx.lineWidth = 5;
    ctx.stroke();
  },

  runFight() {
    if (this._leagueFighting) return;
    this._leagueFighting = true;
    const btn = document.getElementById("btn-fight");
    btn.disabled = true;
    document.getElementById("league-info").textContent = "Kampf läuft...";

    const result = Game.fight();
    const canvas = document.getElementById("league-canvas");
    const ctx = canvas.getContext("2d");
    const me = Game.species();
    const opp = this.leagueOpponent;
    const start = performance.now();
    const dur = 1400;
    const myPose = me.move === "Tritt" ? "kick" : "punch";
    const oppPose = opp.move === "Tritt" ? "kick" : "punch";

    const animate = (now) => {
      const e = Math.min(1, (now - start) / dur);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawRing(ctx, canvas);

      // Phase 1: beide holen aus & treffen (0..0.55)
      // Phase 2: Verlierer wird zurueckgeworfen (0.55..1)
      let myX = 110, oppX = 250;
      let myP = "idle", oppP = "idle", myAmt = 0, oppAmt = 0;

      if (e < 0.55) {
        const a = e / 0.55;
        const lunge = Math.sin(a * Math.PI) * 28;
        myX = 110 + lunge; oppX = 250 - lunge;
        myP = myPose; oppP = oppPose;
        myAmt = Math.sin(a * Math.PI); oppAmt = Math.sin(a * Math.PI);
        if (a > 0.45 && a < 0.6) this.flash(ctx, canvas);
      } else {
        const a = (e - 0.55) / 0.45;
        if (result.win) {
          myP = "win"; oppP = "hit"; oppAmt = a;
          oppX = 250 + a * 60;
        } else {
          myP = "hit"; oppP = "win"; myAmt = a;
          myX = 110 - a * 60;
        }
      }

      Creature.draw(ctx, { species: me, cx: myX, cy: 220, scale: 1.1, facing: 1, t: now, pose: myP, poseAmt: myAmt });
      Creature.draw(ctx, { species: opp, cx: oppX, cy: 220, scale: 1.1, facing: -1, t: now + 300, pose: oppP, poseAmt: oppAmt });

      if (e < 1) requestAnimationFrame(animate);
      else this.finishFight(result);
    };
    requestAnimationFrame(animate);
  },

  flash(ctx, canvas) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.arc(180, 210, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  finishFight(result) {
    this._leagueFighting = false;
    const info = document.getElementById("league-info");
    if (result.win) {
      const adv = Game.advanceDuel();
      if (adv.leagueCleared) {
        info.textContent = "🏆 Liga gewonnen!";
        this.popup("Liga gewonnen!",
          `Du steigst in eine höhere Liga auf!<br><br>` +
          `🪙 +${adv.reward.coin}` + (adv.reward.gem ? `  💎 +${adv.reward.gem}` : ""));
      } else {
        info.textContent = `Gewonnen! 🪙 +${adv.reward.coin}`;
      }
      this.refreshHome();
      setTimeout(() => { if (this.current === "league") this.renderLeague(); }, 1200);
    } else {
      info.textContent = "Verloren... versuch es nochmal!";
      this.drawLeagueIdle();
      const btn = document.getElementById("btn-fight");
      btn.disabled = false;
      const sp = Game.species();
      btn.textContent = sp.move === "Tritt" ? "Tritt zu!" : "Schlag zu!";
    }
  },

  /* ============================================================
     SHOP
     ============================================================ */
  renderShop() {
    document.getElementById("shop-coins").textContent = this.fmt(Game.state.coins);
    document.getElementById("shop-gems").textContent = Game.state.gems;
    const list = document.getElementById("shop-list");
    list.innerHTML = "";
    DATA.upgrades.forEach(u => {
      const lvl = Game.state.upgrades[u.id];
      const maxed = Game.upgradeMaxed(u.id);
      const cost = Game.upgradeCost(u.id);
      const afford = Game.state.coins >= cost;
      const card = document.createElement("div");
      card.className = "card" + ((maxed || !afford) ? " disabled" : "");
      card.innerHTML = `
        <div class="card-ico">${u.icon}</div>
        <div class="card-main">
          <div class="card-name">${u.name} <span style="color:#9a7a55;font-size:13px">Lv.${lvl}</span></div>
          <div class="card-desc">${u.desc}</div>
        </div>
        <div class="card-cost ${maxed ? "maxed" : ""}">${maxed ? "MAX" : "🪙 " + this.fmt(cost)}</div>`;
      if (!maxed && afford) {
        card.addEventListener("click", () => {
          const r = Game.buyUpgrade(u.id);
          if (r.ok) { this.renderShop(); this.refreshResourceBars(); }
        });
      }
      list.appendChild(card);
    });
  },

  /* ============================================================
     GENERATION / RENTE
     ============================================================ */
  showRetire() {
    const r = Game.retire();
    Game.persist();
    this.show("retire");
    document.getElementById("retire-title").textContent =
      `${Game.state.generation}. Generation – Bestleistung!`;
    document.getElementById("retire-text").innerHTML =
      `Dein <b>${Game.species().name}</b> hat das Maximum erreicht (KK ${this.fmt(r.finalKK)}).<br>` +
      `Es geht in den verdienten Ruhestand und übergibt seine Stärke an die nächste Generation.`;
    document.getElementById("retire-rewards").innerHTML =
      `<span>📈 +${Math.round(r.earned * 100)}% Start-KK</span>` +
      `<span>💎 +${r.gemReward}</span><span>🪙 +${r.coinReward}</span>`;
    // Sprite zeichnen
    const canvas = document.getElementById("retire-canvas");
    const ctx = canvas.getContext("2d");
    const draw = (now) => {
      if (this.current !== "retire") return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Creature.draw(ctx, { species: Game.species(), cx: 120, cy: 110, scale: 1.3, facing: 1, t: now, pose: "win" });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  },

  doNextGeneration() {
    const sp = Game.nextGeneration();
    this._retireShown = false;
    this.show("home");
    this.popup("Neue Generation!",
      `Ein neuer Boxling ist da: <b>${sp.name}</b>!<br>` +
      `Angriffsart: <b>${sp.move}</b> · Seltenheit: <b>${sp.rarity}</b>`);
  },

  /* ============================================================
     LOOP / RENDER
     ============================================================ */
  startLoops() {
    // Spielfeld-Kreatur dauerhaft rendern
    const homeCanvas = document.getElementById("home-creature");
    const hctx = homeCanvas.getContext("2d");
    const render = (now) => {
      if (this.current === "home") {
        hctx.clearRect(0, 0, homeCanvas.width, homeCanvas.height);
        Creature.draw(hctx, {
          species: Game.species(),
          cx: homeCanvas.width / 2, cy: homeCanvas.height / 2,
          scale: 1.7, facing: 1, t: now, pose: "idle",
        });
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    // Snack-Spawner + Nachwachsen (jede Sekunde)
    setInterval(() => {
      this.foodTimer += 0.5;
      if (this.current === "home" && this.foodTimer >= DATA.config.foodSpawnSec) {
        this.foodTimer = 0;
        this.spawnFood();
      }
    }, 500);

    setInterval(() => {
      const changed = Game.tick();
      if (changed && (this.current === "home" || this.current === "training")) {
        this.refreshResourceBars();
      }
    }, 1000);

    // beim Verlassen speichern
    window.addEventListener("beforeunload", () => Game.persist());
  },

  drawTitle() {
    const canvas = document.getElementById("title-creature");
    const ctx = canvas.getContext("2d");
    const sp = DATA.species[0];
    const draw = (now) => {
      if (this.current !== "title") return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Creature.draw(ctx, { species: sp, cx: 120, cy: 110, scale: 1.4, facing: 1, t: now, pose: "idle" });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  },

  /* ---------- Helfer ---------- */
  fmt(n) {
    n = Math.round(n);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "Mrd";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "Mio";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "k";
    return "" + n;
  },
};
