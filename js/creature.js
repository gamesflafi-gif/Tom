/* =========================================================
   Boxli Brawl - Kreaturen per Code zeichnen (Canvas)
   Komplett eigene Grafik, keine fremden Bilddateien.
   ========================================================= */

const Creature = {
  /* Zeichnet eine Kreatur auf ein Canvas.
     opts:
       species : Arten-Objekt aus DATA.species
       cx, cy  : Mittelpunkt
       scale   : Groesse
       facing  : 1 (rechts) / -1 (links)
       t       : Zeit in ms (fuer Idle-Animation)
       pose    : "idle" | "punch" | "kick" | "hit" | "win"
       poseAmt : 0..1 Fortschritt der Pose
  */
  draw(ctx, opts) {
    const sp = opts.species;
    const p = sp.palette;
    const cx = opts.cx, cy = opts.cy;
    const stage = opts.stage || 0;
    // hoehere Entwicklungsstufe -> etwas groesser
    const s = (opts.scale || 1) * (1 + stage * 0.12);
    const face = opts.facing || 1;
    const t = opts.t || 0;
    const pose = opts.pose || "idle";
    const amt = opts.poseAmt == null ? 0 : opts.poseAmt;

    // Atmen / Wippen
    const breathe = Math.sin(t / 420) * 0.04;
    let bodyW = 70, bodyH = 70;
    if (sp.shape === "tall") { bodyW = 60; bodyH = 84; }
    if (sp.shape === "wide") { bodyW = 88; bodyH = 60; }
    bodyW *= s; bodyH *= s * (1 + breathe);

    // Pose-Versatz
    let lean = 0, hop = 0;
    if (pose === "punch") { lean = amt < 0.5 ? -8 : 14; }
    if (pose === "kick")  { lean = amt < 0.5 ? -6 : 10; hop = -amt * 10; }
    if (pose === "hit")   { lean = -16 * (1 - amt); }
    if (pose === "win")   { hop = -Math.abs(Math.sin(t / 160)) * 14 * s; }

    ctx.save();
    ctx.translate(cx + lean * face * s, cy + hop);
    ctx.scale(face, 1);

    // Schatten
    ctx.save();
    ctx.translate(0, bodyH * 0.62);
    ctx.scale(1, 0.32);
    ctx.fillStyle = "rgba(60,40,20,.22)";
    ctx.beginPath();
    ctx.arc(0, 0, bodyW * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Beine (zwei kleine Fuesse)
    const legY = bodyH * 0.45;
    const kickLeg = pose === "kick" ? amt : 0;
    this._foot(ctx, -bodyW * 0.28, legY, 14 * s, p.accent);
    this._foot(ctx, bodyW * 0.28, legY - kickLeg * 26 * s, 14 * s, p.accent, kickLeg * 0.9);

    // Koerper
    ctx.fillStyle = p.body;
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 4 * s;
    this._roundBody(ctx, bodyW, bodyH);
    ctx.fill();
    ctx.stroke();

    // Bauch
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(0, bodyH * 0.12, bodyW * 0.42, bodyH * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arme / Fauste
    const punch = pose === "punch" ? amt : 0;
    this._arm(ctx, -bodyW * 0.5, -bodyH * 0.05, 16 * s, p.body, p.accent, 0);
    this._arm(ctx, bodyW * 0.5, -bodyH * 0.05, 18 * s, p.body, p.accent, punch);

    // Gesicht
    this._face(ctx, bodyW, bodyH, p, pose, amt, s, t);

    // kleines Art-Detail oben (Stachel / Tuff), waechst mit Stufe
    this._crest(ctx, sp, bodyW, bodyH, p, s, stage);

    // ab Stufe 1: kleine "Bandage"/Gurt als Kampfabzeichen
    if (stage >= 1) {
      ctx.strokeStyle = stage >= 2 ? "#ffd24a" : "#e8e8e8";
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.42, bodyH * 0.02);
      ctx.lineTo(bodyW * 0.42, bodyH * 0.14);
      ctx.stroke();
    }

    ctx.restore();
  },

  // Treffer-Funken / Aufschlag-Effekt
  burst(ctx, x, y, scale = 1, color = "#fff3b0") {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#ff9b3d";
    ctx.lineWidth = 2;
    const spikes = 8;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0 ? 22 : 9) * scale;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  _roundBody(ctx, w, h) {
    ctx.beginPath();
    const rx = w * 0.5, ry = h * 0.5;
    ctx.moveTo(0, -ry);
    ctx.bezierCurveTo(rx * 1.2, -ry, rx * 1.25, ry, 0, ry);
    ctx.bezierCurveTo(-rx * 1.25, ry, -rx * 1.2, -ry, 0, -ry);
    ctx.closePath();
  },

  _foot(ctx, x, y, r, color, raise) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  _arm(ctx, x, y, r, body, accent, punch) {
    const ext = punch * 34;
    ctx.save();
    ctx.strokeStyle = body;
    ctx.lineWidth = r * 0.9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x * 0.7, y);
    ctx.lineTo(x + ext, y - punch * 6);
    ctx.stroke();
    // Faust
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + ext, y - punch * 6, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  _face(ctx, w, h, p, pose, amt, s, t) {
    const eyeY = -h * 0.14;
    const eyeX = w * 0.2;
    const blink = (Math.sin(t / 700) > 0.96) ? 0.15 : 1;

    // Augen
    ctx.fillStyle = "#fff";
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx * eyeX, eyeY, 11 * s, 12 * s * blink, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pupillen
    ctx.fillStyle = p.eye;
    const look = pose === "punch" || pose === "kick" ? 3 : 0;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * eyeX + look, eyeY + 2, 5.5 * s * blink, 0, Math.PI * 2);
      ctx.fill();
    }

    // Augenbrauen (kaempferisch bei pose)
    if (pose === "punch" || pose === "kick" || pose === "win") {
      ctx.strokeStyle = p.eye;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * eyeX - 8 * s, eyeY - 14 * s);
        ctx.lineTo(sx * eyeX + 8 * s * sx, eyeY - 9 * s);
        ctx.stroke();
      }
    }

    // Mund
    ctx.strokeStyle = p.eye;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (pose === "hit") {
      ctx.arc(0, h * 0.04, 7 * s, 0, Math.PI * 2); // erschrockenes "o"
    } else if (pose === "win" || pose === "punch" || pose === "kick") {
      ctx.arc(0, h * 0.0, 12 * s, 0.15 * Math.PI, 0.85 * Math.PI); // breites Grinsen
    } else {
      ctx.arc(0, h * 0.02, 8 * s, 0.1 * Math.PI, 0.9 * Math.PI);
    }
    ctx.stroke();

    // Wangen
    ctx.fillStyle = "rgba(255,120,120,.35)";
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * w * 0.34, h * 0.0, 7 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  _crest(ctx, sp, w, h, p, s, stage = 0) {
    ctx.fillStyle = p.accent;
    const grow = 1 + stage * 0.35; // Kamm waechst mit Entwicklung
    if (sp.shape === "tall" || sp.id === "stachu") {
      // Stachel(n) - mehr Spitzen bei hoeherer Stufe
      const n = 1 + stage;
      for (let k = 0; k < n; k++) {
        const ox = (k - (n - 1) / 2) * 16 * s;
        ctx.beginPath();
        ctx.moveTo(ox - 10 * s, -h * 0.5);
        ctx.lineTo(ox, -h * 0.5 - 22 * s * grow);
        ctx.lineTo(ox + 10 * s, -h * 0.5);
        ctx.closePath();
        ctx.fill();
      }
    } else if (sp.shape === "wide") {
      // Tuff
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(i * 12 * s, -h * 0.5 + 2, 7 * s * grow, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Locke
      ctx.beginPath();
      ctx.arc(0, -h * 0.5 - 6 * s * grow, 8 * s * grow, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};
