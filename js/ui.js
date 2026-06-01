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
    // Mute-Buttons in Ausgangszustand bringen
    document.querySelectorAll("[data-action='toggle-mute']").forEach(b => {
      b.textContent = Sound.muted ? "🔇" : "🔊";
    });
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
    if (name === "achievements") this.renderAchievements();
  },

  /* ---------- zentrale Klick-Verarbeitung ---------- */
  bindActions() {
    document.body.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (tab) { Sound.play("click"); this.shopTab = tab.dataset.tab; this.renderShop(); return; }
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.dataset.action;
      this.handle(action, el);
    });
  },

  handle(action, el) {
    switch (action) {
      case "start-game": Sound.play("click"); Sound.startMusic(); this.show("home"); break;
      case "go-home": Sound.play("click"); this.show("home"); break;
      case "open-shop": Sound.play("click"); this.show("shop"); break;
      case "open-training": Sound.play("click"); this.show("training"); break;
      case "open-league": Sound.play("click"); this.show("league"); break;
      case "do-fight": this.runFight(); break;
      case "next-generation": this.doNextGeneration(); break;
      case "open-achievements": Sound.play("click"); this.show("achievements"); break;
      case "close-popup": Sound.play("click"); document.getElementById("popup").classList.add("hidden"); break;
      case "toggle-mute": this.toggleMute(el); break;
    }
  },

  toggleMute(el) {
    const muted = Sound.toggleMute();
    document.querySelectorAll("[data-action='toggle-mute']").forEach(b => {
      b.textContent = muted ? "🔇" : "🔊";
    });
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
    document.getElementById("hud-species").textContent = Game.displayName();
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
    const golden = Math.random() < 0.08; // 8 % Glücks-Snack
    const el = document.createElement("div");
    el.className = "food-item" + (golden ? " golden" : "");
    el.textContent = golden ? "⭐" : choices[Math.floor(Math.random() * choices.length)];
    const arena = document.querySelector(".arena").getBoundingClientRect();
    const x = 30 + Math.random() * (arena.width - 90);
    const y = 60 + Math.random() * (arena.height * 0.45);
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.addEventListener("click", () => this.onEatFood(el, x, y, golden));
    layer.appendChild(el);
    // Glücks-Snack verschwindet schneller (selteneres Zeitfenster)
    setTimeout(() => { if (el.parentNode) el.remove(); }, golden ? 3200 : 5000);
  },

  onEatFood(el, x, y, golden) {
    const res = Game.eat(golden);
    el.remove();
    if (!res) return;
    this.floatText((golden ? "⭐ +" : "+") + this.fmt(res.gain) + " KK", x, y);
    if (res.coin) this.floatText("🪙+" + res.coin, x + 20, y - 20);
    Sound.play(res.coin ? "coin" : "eat");
    this.bumpCreature();
    this.refreshHome();
    this.checkProgress(res.leveled);
  },

  bumpCreature() {
    const c = document.getElementById("home-creature");
    c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
  },

  // Nach einem KK-Gewinn: Level-up-Feedback, Entwicklung, evtl. Rente
  checkProgress(leveled) {
    if (leveled) {
      const evo = Game.checkEvolution();
      if (evo) {
        Sound.play("evolve");
        this.refreshHome();
        this.popup("Entwicklung!",
          `<b>${evo.from}</b> entwickelt sich zu <b>${evo.to}</b>! ✨<br>` +
          `Stärker und mit kräftigem KK-Schub.`);
      } else {
        Sound.play("levelup");
      }
    }
    this.runAchievements();
    if (Game.atMaxLevel()) this.maybeOfferRetire();
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
      if (usable) card.addEventListener("click", () => this.startTraining(tr.id));
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

  // Startet das Timing-Minispiel fuer eine Trainingseinheit
  startTraining(id) {
    if (!Game.canTrain() || this._miniActive) return;
    Sound.play("click");
    this.pendingTraining = id;
    const list = document.getElementById("training-list");
    const stage = document.getElementById("training-stage");
    list.classList.add("hidden");
    stage.classList.remove("hidden");
    document.getElementById("training-result").innerHTML =
      `<span style="font-size:18px;color:#9a7a55">Tippe, wenn der Zeiger im <b style="color:#5fa030">grünen</b> Bereich ist!</span>`;

    // Ziel-Bereich zufaellig platzieren
    this._miniActive = true;
    this._miniTarget = 0.32 + Math.random() * 0.36; // 0.32..0.68
    this._miniHalf = 0.13;
    this._miniStart = performance.now();
    this._miniSpeed = 0.0028 + Math.random() * 0.0006;

    const stageEl = document.getElementById("training-stage");
    this._miniTapHandler = () => this.resolveTraining();
    stageEl.addEventListener("click", this._miniTapHandler);

    this.animateMini();
  },

  miniPos(now) {
    // oszilliert 0..1 (Dreieckswelle fuer gleichmaessige Geschwindigkeit)
    const phase = ((now - this._miniStart) * this._miniSpeed) % 2;
    return phase < 1 ? phase : 2 - phase;
  },

  animateMini() {
    const canvas = document.getElementById("training-canvas");
    const ctx = canvas.getContext("2d");
    const sp = Game.species();
    const pose = sp.move === "Tritt" ? "kick" : "punch";
    const loop = (now) => {
      if (!this._miniActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // leicht wippende Kreatur in Bereitschaft
      Creature.draw(ctx, {
        species: sp, stage: Game.state.evoStage,
        cx: canvas.width / 2, cy: canvas.height / 2 - 10,
        scale: 1.5, facing: 1, t: now, pose: "idle",
      });
      this.drawMiniBar(ctx, canvas, this.miniPos(now));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  drawMiniBar(ctx, canvas, pos) {
    const x0 = 30, x1 = canvas.width - 30, y = canvas.height - 40, h = 22;
    const w = x1 - x0;
    // Schiene
    ctx.fillStyle = "#e9d8b6";
    ctx.strokeStyle = "#d9ad6f";
    ctx.lineWidth = 3;
    this._roundRect(ctx, x0, y, w, h, 11); ctx.fill(); ctx.stroke();
    // Ziel-Bereich
    const tz0 = x0 + (this._miniTarget - this._miniHalf) * w;
    const tzw = this._miniHalf * 2 * w;
    ctx.fillStyle = "#7bc043";
    this._roundRect(ctx, tz0, y, tzw, h, 11); ctx.fill();
    // Perfekt-Kern
    const pc0 = x0 + (this._miniTarget - this._miniHalf * 0.35) * w;
    ctx.fillStyle = "#ffd24a";
    this._roundRect(ctx, pc0, y, this._miniHalf * 0.7 * w, h, 8); ctx.fill();
    // Zeiger
    const mx = x0 + pos * w;
    ctx.fillStyle = "#d35e1a";
    ctx.beginPath();
    ctx.moveTo(mx, y - 8); ctx.lineTo(mx - 8, y - 22); ctx.lineTo(mx + 8, y - 22);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(mx - 2, y - 8, 4, h + 8);
  },

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  resolveTraining() {
    if (!this._miniActive) return;
    this._miniActive = false;
    const stageEl = document.getElementById("training-stage");
    stageEl.removeEventListener("click", this._miniTapHandler);

    const pos = this.miniPos(performance.now());
    const dist = Math.abs(pos - this._miniTarget);
    let mult, label, sfx;
    if (dist < this._miniHalf * 0.35) { mult = 1.7; label = "PERFEKT!"; sfx = "perfect"; }
    else if (dist < this._miniHalf)   { mult = 1.1; label = "Gut!";     sfx = "train"; }
    else                              { mult = 0.6; label = "Daneben…";  sfx = "train"; }

    const res = Game.doTraining(this.pendingTraining, mult);
    if (!res) return;
    Sound.play(sfx);
    this.playTrainingHit(res, label);
  },

  playTrainingHit(res, label) {
    const canvas = document.getElementById("training-canvas");
    const ctx = canvas.getContext("2d");
    const sp = Game.species();
    const pose = sp.move === "Tritt" ? "kick" : "punch";
    const start = performance.now();
    const dur = 950;
    let hitPlayed = false;
    const animate = (now) => {
      const e = Math.min(1, (now - start) / dur);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const phase = (e * 2) % 1;
      const amt = Math.sin(phase * Math.PI);
      Creature.draw(ctx, {
        species: sp, stage: Game.state.evoStage,
        cx: canvas.width / 2 - 20, cy: canvas.height / 2 + 10,
        scale: 1.5, facing: 1, t: now, pose, poseAmt: amt,
      });
      if (amt > 0.7) {
        Creature.burst(ctx, canvas.width / 2 + 70, canvas.height / 2, 1.1 + amt * 0.4);
        if (!hitPlayed) { Sound.play("hit"); hitPlayed = true; }
      }
      if (e < 1) requestAnimationFrame(animate);
      else {
        document.getElementById("training-result").innerHTML =
          `<span style="color:#5fa030">${label}</span> +${this.fmt(res.gain)} KK!`;
        setTimeout(() => {
          document.getElementById("training-stage").classList.add("hidden");
          this.refreshResourceBars();
          this.renderTraining();
          this.checkProgress(res.leveled);
        }, 1050);
      }
    };
    requestAnimationFrame(animate);
  },

  /* ============================================================
     LIGA
     ============================================================ */
  renderLeague() {
    const lg = Game.currentLeague();
    const boss = Game.isBossDuel();
    document.getElementById("league-title").textContent = lg.name;
    document.getElementById("duel-no").textContent =
      `Duell ${Game.state.duelIndex + 1}/${lg.duels}`;
    document.getElementById("league-info").innerHTML = boss
      ? `<span style="color:#d35e1a">★ BOSS-DUELL ★</span> – der Champion dieser Liga!`
      : "Alle warten auf das Startsignal!";
    const btn = document.getElementById("btn-fight");
    btn.disabled = false;
    const sp = Game.species();
    btn.textContent = sp.move === "Tritt" ? "Tritt zu!" : "Schlag zu!";
    // Gegner: Boss ist stets episch und voll entwickelt
    this.leagueOpponent = boss
      ? DATA.species.filter(s => s.rarity === "episch")[Math.floor(Math.random() * 2)]
      : DATA.randomSpecies(Game.state.generation);
    this.oppStage = boss ? 3 : Math.min(3, Game.stageForLevel(Game.state.level));
    this._previewOppKK = Game.opponentKK();
    this.drawLeagueIdle();
  },

  drawLeagueIdle() {
    const canvas = document.getElementById("league-canvas");
    const ctx = canvas.getContext("2d");
    const boss = Game.isBossDuel();
    const draw = (now) => {
      if (this.current !== "league" || this._leagueFighting) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawRing(ctx, canvas);
      Creature.draw(ctx, { species: Game.species(), stage: Game.state.evoStage, cx: 110, cy: 220, scale: 1.1, facing: 1, t: now, pose: "idle" });
      Creature.draw(ctx, { species: this.leagueOpponent, stage: this.oppStage, cx: 250, cy: 220, scale: boss ? 1.25 : 1.1, facing: -1, t: now + 300, pose: "idle" });
      this.drawKKTag(ctx, 110, 96, Game.state.kk, "#5fa030");
      this.drawKKTag(ctx, 250, 96, this._previewOppKK || 0, boss ? "#d35e1a" : "#4aa3df");
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  },

  drawRing(ctx, canvas) {
    const lg = Game.currentLeague();
    // Himmel-Verlauf je Liga
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, lg.bg[0]);
    grd.addColorStop(1, lg.bg[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Boden
    ctx.fillStyle = lg.ground;
    ctx.fillRect(0, canvas.height * 0.62, canvas.width, canvas.height * 0.38);
    // Kampfring
    ctx.fillStyle = "#f2e2c0";
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, 250, 150, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9ad6f";
    ctx.lineWidth = 5;
    ctx.stroke();
  },

  // KK-Wert über einem Kämpfer
  drawKKTag(ctx, x, y, kk, color) {
    ctx.save();
    ctx.font = "bold 16px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    const txt = "KK " + this.fmt(kk);
    const w = ctx.measureText(txt).width + 16;
    ctx.fillStyle = color;
    this._roundRect(ctx, x - w / 2, y, w, 22, 11); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(txt, x, y + 16);
    ctx.restore();
  },

  runFight() {
    if (this._leagueFighting) return;
    this._leagueFighting = true;
    const btn = document.getElementById("btn-fight");
    btn.disabled = true;
    document.getElementById("league-info").textContent = "Kampf läuft...";
    Sound.play("click");

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

      let burst = false;
      if (e < 0.55) {
        const a = e / 0.55;
        const lunge = Math.sin(a * Math.PI) * 28;
        myX = 110 + lunge; oppX = 250 - lunge;
        myP = myPose; oppP = oppPose;
        myAmt = Math.sin(a * Math.PI); oppAmt = Math.sin(a * Math.PI);
        if (a > 0.45 && a < 0.62) { this.flash(ctx, canvas); burst = true; }
        if (a > 0.45 && !this._fightHit) { Sound.play("hit"); this._fightHit = true; }
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

      Creature.draw(ctx, { species: me, stage: Game.state.evoStage, cx: myX, cy: 220, scale: 1.1, facing: 1, t: now, pose: myP, poseAmt: myAmt });
      Creature.draw(ctx, { species: opp, stage: this.oppStage, cx: oppX, cy: 220, scale: Game.isBossDuel() ? 1.25 : 1.1, facing: -1, t: now + 300, pose: oppP, poseAmt: oppAmt });
      this.drawKKTag(ctx, 110, 96, result.myKK, "#5fa030");
      this.drawKKTag(ctx, 250, 96, result.oppKK, Game.isBossDuel() ? "#d35e1a" : "#4aa3df");
      if (burst) {
        Creature.burst(ctx, 180, 205, 1.6);
        // Trefferzahl beim Sieger-Schlag
        ctx.save();
        ctx.font = "900 26px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 4; ctx.strokeStyle = "#fff"; ctx.fillStyle = "#d35e1a";
        const hit = result.win ? result.myKK : result.oppKK;
        ctx.strokeText("-" + this.fmt(hit), 180, 175);
        ctx.fillText("-" + this.fmt(hit), 180, 175);
        ctx.restore();
      }

      if (e < 1) requestAnimationFrame(animate);
      else { this._fightHit = false; this.finishFight(result); }
    };
    requestAnimationFrame(animate);
  },

  // Konfetti-Regen ueber der Buehne (Sieg)
  confettiBurst(count = 40) {
    const stage = document.getElementById("stage");
    const colors = ["#f0792f", "#ffce4a", "#7bc043", "#4aa3df", "#e0608a", "#b88adf"];
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDelay = (Math.random() * 0.3) + "s";
      c.style.animationDuration = (1 + Math.random() * 0.8) + "s";
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      stage.appendChild(c);
      setTimeout(() => c.remove(), 2200);
    }
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
        Sound.play("win");
        this.confettiBurst(70);
        info.textContent = "🏆 Liga gewonnen!";
        this.popup("Liga gewonnen!",
          `Du steigst in eine höhere Liga auf!<br><br>` +
          `🪙 +${adv.reward.coin}` + (adv.reward.gem ? `  💎 +${adv.reward.gem}` : ""));
      } else {
        Sound.play("win");
        this.confettiBurst(30);
        info.textContent = `Gewonnen! 🪙 +${adv.reward.coin}`;
      }
      this.refreshHome();
      this.runAchievements();
      setTimeout(() => { if (this.current === "league") this.renderLeague(); }, 1200);
    } else {
      Sound.play("lose");
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
    if (!this.shopTab) this.shopTab = "upgrades";
    document.getElementById("shop-coins").textContent = this.fmt(Game.state.coins);
    document.getElementById("shop-gems").textContent = Game.state.gems;
    // aktiven Tab markieren
    document.querySelectorAll(".shop-tabs .tab[data-tab]").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === this.shopTab);
    });
    const list = document.getElementById("shop-list");
    list.innerHTML = "";
    if (this.shopTab === "items") this.renderShopItems(list);
    else this.renderShopUpgrades(list);
  },

  renderShopUpgrades(list) {
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
          Sound.play("coin");
          const r = Game.buyUpgrade(u.id);
          if (r.ok) { this.renderShop(); this.refreshResourceBars(); }
        });
      }
      list.appendChild(card);
    });
  },

  renderShopItems(list) {
    DATA.items.forEach(it => {
      const bal = it.cur === "gem" ? Game.state.gems : Game.state.coins;
      const afford = bal >= it.cost;
      const card = document.createElement("div");
      card.className = "card" + (afford ? "" : " disabled");
      const costClass = it.cur === "gem" ? "gem" : "";
      const costIcon = it.cur === "gem" ? "💎" : "🪙";
      card.innerHTML = `
        <div class="card-ico">${it.icon}</div>
        <div class="card-main">
          <div class="card-name">${it.name}</div>
          <div class="card-desc">${it.desc}</div>
        </div>
        <div class="card-cost ${costClass}">${costIcon} ${it.cost}</div>`;
      if (afford) {
        card.addEventListener("click", () => {
          const r = Game.buyItem(it.id);
          if (r.ok) {
            Sound.play(it.effect.type === "kkPct" ? "eat" : "click");
            this.renderShop();
            this.refreshResourceBars();
            this.popup(it.name, r.info + "!");
            this.checkProgress(r.leveled);
            this.runAchievements();
          }
        });
      }
      list.appendChild(card);
    });
  },

  /* ============================================================
     ERFOLGE
     ============================================================ */
  renderAchievements() {
    const list = document.getElementById("ach-list");
    const have = Game.state.achievements;
    document.getElementById("ach-count").textContent =
      `${have.length}/${DATA.achievements.length}`;
    list.innerHTML = "";
    DATA.achievements.forEach(a => {
      const done = have.includes(a.id);
      const card = document.createElement("div");
      card.className = "card " + (done ? "unlocked" : "locked");
      card.innerHTML = `
        <div class="card-ico">${done ? a.icon : "🔒"}</div>
        <div class="card-main">
          <div class="card-name">${a.name}</div>
          <div class="card-desc">${a.desc}</div>
          <div class="ach-gem">Belohnung: 💎 ${a.gem}</div>
        </div>
        <div class="card-cost ${done ? "" : "maxed"}">${done ? "✓" : "—"}</div>`;
      list.appendChild(card);
    });
  },

  // prueft & zeigt neu freigeschaltete Erfolge als Toast
  runAchievements() {
    const unlocked = Game.checkAchievements();
    if (!unlocked.length) return;
    this.refreshHome();
    unlocked.forEach((a, i) => setTimeout(() => this.achToast(a), i * 1400));
  },

  achToast(a) {
    Sound.play("levelup");
    const stage = document.getElementById("stage");
    const el = document.createElement("div");
    el.className = "ach-toast";
    el.innerHTML = `<span class="ach-toast-ico">${a.icon}</span>
      <span><b>Erfolg freigeschaltet!</b><br>${a.name} · 💎 +${a.gem}</span>`;
    stage.appendChild(el);
    setTimeout(() => el.classList.add("show"), 30);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 400); }, 2600);
  },

  /* ============================================================
     GENERATION / RENTE
     ============================================================ */
  showRetire() {
    const finalStage = Game.state.evoStage;
    const finalName = Game.displayName();
    const finalSp = Game.species();
    const r = Game.retire();
    Game.persist();
    Sound.play("win");
    this.show("retire");
    document.getElementById("retire-title").textContent =
      `${Game.state.generation}. Generation – Bestleistung!`;
    document.getElementById("retire-text").innerHTML =
      `Dein <b>${finalName}</b> hat das Maximum erreicht (KK ${this.fmt(r.finalKK)}).<br>` +
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
      Creature.draw(ctx, { species: finalSp, stage: finalStage, cx: 120, cy: 110, scale: 1.3, facing: 1, t: now, pose: "win" });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  },

  doNextGeneration() {
    const sp = Game.nextGeneration();
    this._retireShown = false;
    Sound.play("levelup");
    this.show("home");
    this.popup("Neue Generation!",
      `Ein neuer Boxling ist da: <b>${DATA.formName(sp, 0)}</b>!<br>` +
      `Angriffsart: <b>${sp.move}</b> · Seltenheit: <b>${sp.rarity}</b>`);
    this.runAchievements();
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
          species: Game.species(), stage: Game.state.evoStage,
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
