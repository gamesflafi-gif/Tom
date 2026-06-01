/* =========================================================
   Boxli Brawl - Kreaturen-Renderer (Canvas, eigene Grafik)
   Charaktervolle Mascot-Figuren mit Volumen-Schattierung,
   lebendiger Idle-Animation und flüssigen Kampfposen.
   ========================================================= */

/* ---- Farb-Helfer ---- */
function _hex(c) {
  c = c.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}
function _mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function _str(c, a) { return a == null ? `rgb(${c[0]|0},${c[1]|0},${c[2]|0})` : `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`; }
function _lighten(c, t) { return _mix(c, [255, 255, 255], t); }
function _darken(c, t) { return _mix(c, [12, 8, 16], t); }
const _easeOut = t => 1 - (1 - t) * (1 - t);
const _easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* ---- Bauplan je Art (leitet sich aus der id ab) ---- */
const DESIGN = {
  pummel: { body: "round", w: 66, h: 66, ear: "round",  tail: "puff",  crest: "curl",  attack: "punch", cheek: 1 },
  knuffo: { body: "wide",  w: 84, h: 60, ear: "floppy", tail: "none",  crest: "tuft",  attack: "punch", jaw: 1, cheek: 1 },
  wolki:  { body: "round", w: 70, h: 66, ear: "none",   tail: "puff",  crest: "fluff", attack: "kick",  fluff: 1, cheek: 1 },
  flammo: { body: "tall",  w: 58, h: 80, ear: "pointy", tail: "flame", crest: "flame", attack: "kick" },
  aquino: { body: "tall",  w: 58, h: 80, ear: "fin",    tail: "drop",  crest: "fin",   attack: "punch", cheek: 1 },
  stachu: { body: "round", w: 68, h: 66, ear: "none",   tail: "spike", crest: "spikes",attack: "kick",  spiky: 1 },
  golbax: { body: "wide",  w: 82, h: 64, ear: "round",  tail: "tuft",  crest: "mane",  attack: "punch", mane: 1 },
  nachti: { body: "tall",  w: 60, h: 80, ear: "bat",    tail: "spike", crest: "horn",  attack: "kick",  glow: 1 },
};

const Creature = {
  draw(ctx, opts) {
    const sp = opts.species;
    const d = DESIGN[sp.id] || DESIGN.pummel;
    const p = {
      body: _hex(sp.palette.body), belly: _hex(sp.palette.belly),
      accent: _hex(sp.palette.accent), eye: _hex(sp.palette.eye),
    };
    const stage = opts.stage || 0;
    const cx = opts.cx, cy = opts.cy;
    const s = (opts.scale || 1) * (1 + stage * 0.1);
    const face = opts.facing || 1;
    const t = opts.t || 0;
    const pose = opts.pose || "idle";
    const amt = opts.poseAmt == null ? 0 : opts.poseAmt;

    // --- lebendige Idle-Bewegung ---
    const breathe = Math.sin(t / 540);
    const bobY = Math.sin(t / 540 + 0.6) * 2.2 * s;
    const sway = Math.sin(t / 980) * 0.025;            // sanftes Wiegen
    const earWag = Math.sin(t / 470) * 0.13;
    const tailWag = Math.sin(t / 430) * 0.22;
    // Blinzeln (kurze Lider-Schliessung)
    const bcyc = (t / 3400) % 1;
    let blink = 1;
    if (bcyc > 0.95) blink = Math.max(0.06, Math.abs(bcyc - 0.975) / 0.025);

    // --- Pose-Versatz (geglättet) ---
    let lean = 0, hop = 0, tilt = 0, squash = 0;
    const ea = _easeOut(amt);
    if (pose === "punch") { lean = -10 + ea * 26; squash = Math.sin(amt * Math.PI) * 0.06; tilt = ea * 0.06; }
    else if (pose === "kick") { lean = -6 + ea * 16; hop = -ea * 8 * s; tilt = -ea * 0.05; }
    else if (pose === "hit") { lean = -22 * (1 - amt); tilt = -0.12 * (1 - amt); squash = 0.05 * (1 - amt); }
    else if (pose === "win") { hop = -Math.abs(Math.sin(t / 150)) * 16 * s; tilt = Math.sin(t / 150) * 0.04; }

    ctx.save();
    ctx.translate(cx + lean * face * s, cy + bobY + hop);
    ctx.rotate((sway + tilt) * face);
    ctx.scale(face, 1);

    // Volumen-Atmen (Squash & Stretch)
    let bw = d.w * s * (1 - breathe * 0.02 - squash);
    let bh = d.h * s * (1 + breathe * 0.025 + squash);

    // Schatten am Boden
    ctx.save();
    ctx.translate(0, bh * 0.66);
    ctx.scale(1, 0.3);
    const shGrd = ctx.createRadialGradient(0, 0, 2, 0, 0, bw * 0.7);
    shGrd.addColorStop(0, "rgba(40,28,14,.28)");
    shGrd.addColorStop(1, "rgba(40,28,14,0)");
    ctx.fillStyle = shGrd;
    ctx.beginPath(); ctx.arc(0, 0, bw * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (stage >= 3) this._aura(ctx, bw, t, p.accent);

    // Schwanz (hinter dem Koerper)
    this._tail(ctx, d.tail, -bw * 0.42, bh * 0.12, bw, bh, p, tailWag, t);

    // Hinteres Bein
    this._leg(ctx, -bw * 0.26, bh * 0.5, 0, bw * 0.2, p, true);

    // Mähne hinter dem Koerper (golbax)
    if (d.mane) this._mane(ctx, bw, bh, p, earWag);

    // Ohren hinter dem Kopf (bei manchen Typen)
    if (d.ear === "bat" || d.ear === "fin" || d.ear === "pointy")
      this._ears(ctx, d.ear, bw, bh, p, earWag, true);

    // --- Koerper mit Volumen ---
    this._body(ctx, d, bw, bh, p);

    // Bauchfleck
    ctx.fillStyle = _str(p.belly);
    ctx.beginPath();
    ctx.ellipse(0, bh * 0.16, bw * 0.4, bh * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flausch-Kontur (wolki)
    if (d.fluff) this._fluff(ctx, bw, bh, p);

    // Ohren vor dem Kopf
    if (!(d.ear === "bat" || d.ear === "fin" || d.ear === "pointy") && d.ear !== "none")
      this._ears(ctx, d.ear, bw, bh, p, earWag, false);

    // Kamm oben
    this._crest(ctx, d.crest, bw, bh, p, t, stage, earWag);

    // Gesicht
    this._face(ctx, d, bw, bh, p, pose, amt, t, blink);

    // Arme + Boxhandschuhe (Puncher schlagen, alle haben Handschuhe)
    const punch = pose === "punch" ? ea : 0;
    this._arm(ctx, -bw * 0.52, -bh * 0.02, bw, p, 0, false);          // hinterer Arm
    this._arm(ctx, bw * 0.52, -bh * 0.02, bw, p, punch, true);        // vorderer Arm

    // Vorderes Bein (Tritt streckt es)
    const kick = pose === "kick" ? ea : 0;
    this._leg(ctx, bw * 0.26, bh * 0.5, kick, bw * 0.2, p, false);

    // Speed-Lines beim harten Treffer
    if ((pose === "punch" || pose === "kick") && amt > 0.55)
      this._speed(ctx, bw, bh, pose, p);

    ctx.restore();
  },

  /* ---------- Körper ---------- */
  _body(ctx, d, w, h, p) {
    ctx.save();
    this._bodyPath(ctx, d, w, h);
    // Grundverlauf für Volumen
    const g = ctx.createRadialGradient(-w * 0.22, -h * 0.28, w * 0.1, 0, 0, w * 0.95);
    g.addColorStop(0, _str(_lighten(p.body, 0.32)));
    g.addColorStop(0.55, _str(p.body));
    g.addColorStop(1, _str(_darken(p.body, 0.16)));
    ctx.fillStyle = g;
    ctx.fill();
    // Kontur
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, w * 0.055);
    ctx.strokeStyle = _str(_darken(p.accent, 0.05));
    ctx.stroke();
    // unterer Kernschatten
    ctx.save();
    this._bodyPath(ctx, d, w, h); ctx.clip();
    const sh = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.55);
    sh.addColorStop(0, "rgba(0,0,0,0)");
    sh.addColorStop(1, _str(_darken(p.body, 0.22), 0.5));
    ctx.fillStyle = sh; ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.restore();
    // Glanzlicht oben
    ctx.save();
    this._bodyPath(ctx, d, w, h); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.beginPath();
    ctx.ellipse(-w * 0.22, -h * 0.34, w * 0.26, h * 0.16, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  },

  _bodyPath(ctx, d, w, h) {
    ctx.beginPath();
    const rx = w * 0.5, ry = h * 0.5;
    if (d.body === "wide") {
      // gedrungen, breiter Stand
      ctx.moveTo(0, -ry);
      ctx.bezierCurveTo(rx * 1.25, -ry * 1.0, rx * 1.3, ry * 0.7, rx * 0.7, ry);
      ctx.bezierCurveTo(rx * 0.3, ry * 1.12, -rx * 0.3, ry * 1.12, -rx * 0.7, ry);
      ctx.bezierCurveTo(-rx * 1.3, ry * 0.7, -rx * 1.25, -ry, 0, -ry);
    } else if (d.body === "tall") {
      // eiförmig, schlanker
      ctx.moveTo(0, -ry);
      ctx.bezierCurveTo(rx * 1.18, -ry * 0.9, rx * 1.0, ry, 0, ry);
      ctx.bezierCurveTo(-rx * 1.0, ry, -rx * 1.18, -ry * 0.9, 0, -ry);
    } else {
      // rund
      ctx.moveTo(0, -ry);
      ctx.bezierCurveTo(rx * 1.22, -ry, rx * 1.22, ry, 0, ry);
      ctx.bezierCurveTo(-rx * 1.22, ry, -rx * 1.22, -ry, 0, -ry);
    }
    ctx.closePath();
  },

  /* ---------- Gesicht ---------- */
  _face(ctx, d, w, h, p, pose, amt, t, blink) {
    const ex = w * 0.22, ey = -h * 0.12;
    const look = (pose === "punch" || pose === "kick") ? w * 0.04 : Math.sin(t / 1500) * w * 0.02;
    const angry = pose === "punch" || pose === "kick" || pose === "win";

    // Augen
    for (const sx of [-1, 1]) {
      const x = sx * ex;
      // Augapfel
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(x, ey, w * 0.135, h * 0.15 * blink, 0, 0, Math.PI * 2);
      ctx.fill();
      // Iris/Pupille
      ctx.fillStyle = _str(p.eye);
      ctx.beginPath();
      ctx.ellipse(x + look, ey + h * 0.015, w * 0.07, h * 0.085 * blink, 0, 0, Math.PI * 2);
      ctx.fill();
      // Glanzpunkte
      if (blink > 0.4) {
        ctx.fillStyle = "rgba(255,255,255,.95)";
        ctx.beginPath(); ctx.arc(x + look - w * 0.03, ey - h * 0.04, w * 0.028, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.5)";
        ctx.beginPath(); ctx.arc(x + look + w * 0.03, ey + h * 0.03, w * 0.015, 0, Math.PI * 2); ctx.fill();
      }
      // Lid
      ctx.strokeStyle = _str(_darken(p.accent, 0.1));
      ctx.lineWidth = Math.max(2, w * 0.03); ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(x, ey, w * 0.14, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }

    // Augenbrauen
    ctx.strokeStyle = _str(_darken(p.accent, 0.15));
    ctx.lineWidth = Math.max(2.5, w * 0.04); ctx.lineCap = "round";
    for (const sx of [-1, 1]) {
      const x = sx * ex;
      ctx.beginPath();
      if (angry) { ctx.moveTo(x - w * 0.12 * sx, ey - h * 0.21); ctx.lineTo(x + w * 0.1 * sx, ey - h * 0.13); }
      else if (pose === "hit") { ctx.moveTo(x - w * 0.1 * sx, ey - h * 0.16); ctx.lineTo(x + w * 0.1 * sx, ey - h * 0.22); }
      else { ctx.moveTo(x - w * 0.1, ey - h * 0.2); ctx.quadraticCurveTo(x, ey - h * 0.24, x + w * 0.1, ey - h * 0.2); }
      ctx.stroke();
    }

    // Mund
    ctx.strokeStyle = _str(_darken(p.accent, 0.18));
    ctx.fillStyle = _str(_darken(p.accent, 0.25));
    ctx.lineWidth = Math.max(2.5, w * 0.035); ctx.lineCap = "round"; ctx.lineJoin = "round";
    const my = h * 0.06;
    if (pose === "hit") {
      ctx.beginPath(); ctx.ellipse(0, my + h * 0.02, w * 0.08, h * 0.07, 0, 0, Math.PI * 2);
      ctx.fillStyle = _str(_darken(p.accent, 0.3)); ctx.fill();
    } else if (pose === "win" || angry) {
      // breites, offenes Grinsen mit Zunge
      ctx.beginPath();
      ctx.moveTo(-w * 0.13, my);
      ctx.quadraticCurveTo(0, my + h * 0.16, w * 0.13, my);
      ctx.quadraticCurveTo(0, my + h * 0.05, -w * 0.13, my);
      ctx.closePath();
      ctx.fillStyle = _str(_darken(p.accent, 0.32)); ctx.fill();
      ctx.fillStyle = "rgba(255,140,150,.9)";
      ctx.beginPath(); ctx.ellipse(0, my + h * 0.085, w * 0.06, h * 0.04, 0, 0, Math.PI); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-w * 0.09, my);
      ctx.quadraticCurveTo(0, my + h * 0.07, w * 0.09, my);
      ctx.stroke();
    }

    // Wangen
    if (d.cheek) {
      ctx.fillStyle = "rgba(255,120,130,.32)";
      for (const sx of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(sx * w * 0.34, my - h * 0.02, w * 0.07, h * 0.045, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Maul/Kiefer (knuffo)
    if (d.jaw) {
      ctx.strokeStyle = _str(_darken(p.accent, 0.15));
      ctx.lineWidth = Math.max(2, w * 0.025);
      ctx.beginPath(); ctx.moveTo(-w * 0.3, my + h * 0.04); ctx.lineTo(w * 0.3, my + h * 0.04); ctx.stroke();
    }
  },

  /* ---------- Ohren ---------- */
  _ears(ctx, type, w, h, p, wag, back) {
    const top = -h * 0.46;
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.translate(sx * w * 0.34, top);
      ctx.rotate(sx * (0.2 + wag));
      const col = _str(p.body), ac = _str(p.accent), in_ = _str(_lighten(p.belly, 0.05));
      ctx.fillStyle = col; ctx.strokeStyle = _str(_darken(p.accent, 0.05));
      ctx.lineWidth = Math.max(2.5, w * 0.045); ctx.lineJoin = "round";
      ctx.beginPath();
      if (type === "round") { ctx.arc(0, 0, w * 0.17, 0, Math.PI * 2); }
      else if (type === "floppy") { ctx.ellipse(0, w * 0.16, w * 0.11, w * 0.22, 0, 0, Math.PI * 2); }
      else if (type === "pointy") { ctx.moveTo(-w * 0.12, w * 0.05); ctx.lineTo(0, -w * 0.28); ctx.lineTo(w * 0.12, w * 0.05); ctx.closePath(); }
      else if (type === "fin") { ctx.moveTo(-w * 0.1, w * 0.05); ctx.quadraticCurveTo(w * 0.05, -w * 0.3, w * 0.16, w * 0.02); ctx.closePath(); }
      else if (type === "bat") { ctx.moveTo(-w * 0.14, w * 0.05); ctx.lineTo(-w * 0.02, -w * 0.3); ctx.lineTo(w * 0.04, -w * 0.05); ctx.lineTo(w * 0.16, -w * 0.22); ctx.lineTo(w * 0.14, w * 0.08); ctx.closePath(); }
      ctx.fill(); ctx.stroke();
      // Innenohr
      if (!back && (type === "round" || type === "floppy" || type === "pointy")) {
        ctx.fillStyle = in_;
        ctx.beginPath();
        if (type === "round") ctx.arc(0, 0, w * 0.09, 0, Math.PI * 2);
        else if (type === "floppy") ctx.ellipse(0, w * 0.16, w * 0.055, w * 0.13, 0, 0, Math.PI * 2);
        else ctx.moveTo(-w * 0.06, w * 0.02), ctx.lineTo(0, -w * 0.16), ctx.lineTo(w * 0.06, w * 0.02), ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  },

  /* ---------- Kamm / Krone oben ---------- */
  _crest(ctx, type, w, h, p, t, stage, wag) {
    const top = -h * 0.5;
    const ac = _str(p.accent), acd = _str(_darken(p.accent, 0.08));
    const grow = 1 + stage * 0.28;
    ctx.save();
    ctx.fillStyle = ac; ctx.strokeStyle = acd; ctx.lineJoin = "round"; ctx.lineWidth = Math.max(2, w * 0.03);
    if (type === "curl") {
      ctx.translate(0, top + 2);
      ctx.rotate(wag * 0.6);
      ctx.beginPath(); ctx.arc(0, -w * 0.1 * grow, w * 0.1 * grow, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (type === "spikes" || type === "flame") {
      const n = 3 + stage;
      for (let i = 0; i < n; i++) {
        const ox = (i - (n - 1) / 2) * w * 0.16;
        const hh = w * (0.26 + (i % 2) * 0.08) * grow;
        if (type === "flame") ctx.fillStyle = _str(_lighten(p.accent, 0.15 + (i % 2) * 0.1));
        ctx.beginPath();
        ctx.moveTo(ox - w * 0.08, top + 4);
        ctx.quadraticCurveTo(ox, top - hh, ox + w * 0.08, top + 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (type === "tuft" || type === "fluff") {
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * w * 0.14, top + 2, w * 0.1 * grow, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    } else if (type === "horn") {
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * w * 0.12, top + 6);
        ctx.quadraticCurveTo(sx * w * 0.34, top - w * 0.28 * grow, sx * w * 0.16, top - w * 0.34 * grow);
        ctx.quadraticCurveTo(sx * w * 0.1, top - w * 0.1, sx * w * 0.02, top + 6);
        ctx.closePath(); ctx.fillStyle = _str(_lighten(p.accent, 0.1)); ctx.fill(); ctx.stroke();
      }
    } else if (type === "fin") {
      ctx.beginPath();
      ctx.moveTo(-w * 0.02, top + 6);
      for (let i = 0; i <= 3; i++) { const ox = (-0.18 + i * 0.12) * w; ctx.lineTo(ox, top - w * (0.18 + (i % 2) * 0.08) * grow); ctx.lineTo(ox + w * 0.06, top + 4); }
      ctx.closePath(); ctx.fillStyle = _str(_lighten(p.accent, 0.05)); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  },

  /* ---------- Mähne (golbax) ---------- */
  _mane(ctx, w, h, p, wag) {
    ctx.save();
    ctx.fillStyle = _str(_darken(p.accent, 0.05));
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + wag * 0.2;
      const r = w * 0.62;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r * 0.92 - h * 0.06, w * 0.16, w * 0.12, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  /* ---------- Flausch-Kontur (wolki) ---------- */
  _fluff(ctx, w, h, p) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = Math.max(3, w * 0.06); ctx.lineCap = "round";
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = w * 0.5;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r - h * 0.02, w * 0.07, a - 0.5, a + 0.5);
      ctx.stroke();
    }
    ctx.restore();
  },

  /* ---------- Schwanz ---------- */
  _tail(ctx, type, x, y, w, h, p, wag, t) {
    if (type === "none") return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(wag);
    ctx.strokeStyle = _str(_darken(p.accent, 0.05));
    ctx.lineWidth = Math.max(2.5, w * 0.045); ctx.lineJoin = "round";
    if (type === "puff" || type === "tuft") {
      ctx.fillStyle = _str(type === "tuft" ? _darken(p.accent, 0.05) : p.belly);
      ctx.beginPath(); ctx.arc(-w * 0.16, 0, w * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (type === "drop") {
      ctx.fillStyle = _str(p.body);
      ctx.beginPath(); ctx.moveTo(0, -w * 0.1); ctx.quadraticCurveTo(-w * 0.34, 0, 0, w * 0.1); ctx.quadraticCurveTo(-w * 0.1, 0, 0, -w * 0.1); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (type === "flame") {
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = _str(_lighten(p.accent, 0.12 + k * 0.14));
        ctx.beginPath();
        ctx.moveTo(0, w * 0.08 - k * w * 0.04);
        ctx.quadraticCurveTo(-w * (0.3 - k * 0.06), -w * 0.02, 0, -w * (0.16 + k * 0.05));
        ctx.quadraticCurveTo(-w * 0.06, 0, 0, w * 0.08 - k * w * 0.04);
        ctx.closePath(); ctx.fill();
      }
    } else if (type === "spike") {
      ctx.fillStyle = _str(p.accent);
      ctx.beginPath(); ctx.moveTo(0, -w * 0.08); ctx.lineTo(-w * 0.32, 0); ctx.lineTo(0, w * 0.08); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  },

  /* ---------- Arm + Boxhandschuh ---------- */
  _arm(ctx, sx, sy, w, p, punch, front) {
    const sway = Math.sin((Date.now()) / 600) * 0; // ruhige Haltung; Bewegung kommt aus Pose
    const ext = _easeOut(punch);
    const reach = front ? ext * w * 0.6 : 0;
    const ax = sx + reach * Math.sign(sx);
    const ay = sy - ext * w * 0.06;
    // Speed-Trail beim Schlag
    if (front && punch > 0.4) {
      ctx.save(); ctx.globalAlpha = 0.25;
      ctx.strokeStyle = _str(_lighten(p.accent, 0.2));
      ctx.lineWidth = w * 0.22; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx * 0.6, sy); ctx.lineTo(ax - reach * 0.4 * Math.sign(sx), ay); ctx.stroke();
      ctx.restore();
    }
    // Arm
    ctx.strokeStyle = _str(p.body);
    ctx.lineWidth = w * 0.17; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(sx * 0.62, sy); ctx.lineTo(ax, ay); ctx.stroke();
    // Handschuh
    const gx = ax, gy = ay, gr = w * 0.17;
    const g = ctx.createRadialGradient(gx - gr * 0.4, gy - gr * 0.4, gr * 0.2, gx, gy, gr * 1.2);
    g.addColorStop(0, _str(_lighten(p.accent, 0.35)));
    g.addColorStop(1, _str(_darken(p.accent, 0.1)));
    ctx.fillStyle = g;
    ctx.strokeStyle = _str(_darken(p.accent, 0.18)); ctx.lineWidth = Math.max(2, w * 0.03);
    ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Daumen
    ctx.beginPath(); ctx.arc(gx - gr * 0.7 * Math.sign(sx), gy + gr * 0.1, gr * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = _str(p.accent); ctx.fill(); ctx.stroke();
    // Glanz
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.beginPath(); ctx.arc(gx - gr * 0.35, gy - gr * 0.4, gr * 0.22, 0, Math.PI * 2); ctx.fill();
  },

  /* ---------- Bein + Fuß ---------- */
  _leg(ctx, x, y, kick, r, p, back) {
    ctx.save();
    const ex = kick * r * 2.2;
    const ey = -kick * r * 1.4;
    ctx.strokeStyle = _str(back ? _darken(p.body, 0.12) : p.body);
    ctx.lineWidth = r * 0.7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.5); ctx.lineTo(x + ex, y + ey); ctx.stroke();
    // Fuß
    ctx.fillStyle = _str(back ? _darken(p.accent, 0.12) : p.accent);
    ctx.strokeStyle = _str(_darken(p.accent, 0.18)); ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.beginPath(); ctx.ellipse(x + ex + r * 0.2, y + ey, r * 0.5, r * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  /* ---------- Speed-Lines ---------- */
  _speed(ctx, w, h, pose, p) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = Math.max(2, w * 0.03); ctx.lineCap = "round";
    const baseX = pose === "punch" ? w * 0.7 : w * 0.3;
    const baseY = pose === "punch" ? -h * 0.05 : h * 0.4;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(baseX - w * 0.5, baseY + i * w * 0.14);
      ctx.lineTo(baseX - w * 0.1, baseY + i * w * 0.14);
      ctx.stroke();
    }
    ctx.restore();
  },

  /* ---------- Aura der Endform ---------- */
  _aura(ctx, w, t, accent) {
    const pulse = 0.5 + Math.sin(t / 240) * 0.5;
    const grd = ctx.createRadialGradient(0, 0, w * 0.3, 0, 0, w * 1.05);
    grd.addColorStop(0, _str(_lighten(accent, 0.3), 0.06 + pulse * 0.14));
    grd.addColorStop(1, _str(_lighten(accent, 0.3), 0));
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(0, 0, w * 1.05, 0, Math.PI * 2); ctx.fill();
    // funkelnde Sterne
    for (let i = 0; i < 4; i++) {
      const a = t / 600 + i * Math.PI / 2;
      const r = w * (0.85 + Math.sin(t / 300 + i) * 0.08);
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.85;
      ctx.fillStyle = _str(_lighten(accent, 0.5), 0.7 + pulse * 0.3);
      this._spark(ctx, x, y, w * 0.05);
    }
  },

  _spark(ctx, x, y, r) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const rr = i % 2 ? r * 0.4 : r; ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  },

  /* ---------- Treffer-Funke (für Kämpfe) ---------- */
  burst(ctx, x, y, scale = 1, color = "#fff3b0") {
    ctx.save();
    ctx.translate(x, y);
    const rgb = _hex(color);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 26 * scale);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.5, _str(rgb));
    g.addColorStop(1, _str(rgb, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 26 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff7c8"; ctx.strokeStyle = "#ff9b3d"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath();
    const spikes = 9;
    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0 ? 24 : 10) * scale;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  },
};
