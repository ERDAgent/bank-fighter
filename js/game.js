/* Bank Fighter — fight engine, modes, AI, HUD. */
(function () {
  const BF = window.BF, W = 256, H = 224, GY = 200, SW = 420;
  const F = BF.FIGHTERS, N = BF.NORMALS, A = BF.audio, T = BF.text;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let cv, c;

  const S = (BF.state = { scene: 'title', t: 0, frame: 0, mode: 'arcade', sel: [0, 3], ok: [false, false], menu: 0,
    f: [], projs: [], fx: [], cam: 82, hitstop: 0, shake: 0, paused: false, pmenu: 0, dummy: 0, ann: null, aiLevel: 3 });
  const DUMMY = ['STAND', 'CROUCH', 'JUMP', 'BLOCK', 'CPU'];
  BF.cmdText = (cmd) => ({ '236P': '↓ → + P', '214K': '↓ ← + K', '22P': '↓ ↓ + P' }[cmd] || cmd);

  // ---------------- poses ----------------
  const D = { l: 8, r: 0, af: [35, 140], ab: [-5, 115], lf: [22, -8], lb: [-18, -30] };
  const P = {
    idle: D, idle2: { l: 10, af: [38, 134], ab: [-2, 110], lf: [26, -13], lb: [-21, -35] },
    crouch: { l: 18, af: [40, 140], ab: [0, 120], lf: [80, -25], lb: [25, -75] },
    jumpUp: { l: 5, af: [30, 150], ab: [-20, 120], lf: [30, -20], lb: [-5, -50] },
    jumpTuck: { l: 12, af: [50, 130], ab: [10, 110], lf: [85, -30], lb: [50, -70] },
    chute: { l: 0, af: [160, 175], ab: [-160, -175], lf: [15, 5], lb: [-10, -15] },
    punchW: { l: 0, af: [-10, 120], ab: [10, 130] }, punch: { l: 18, af: [86, 92], ab: [-25, 100], lf: [30, -5], lb: [-28, -36] },
    kickW: { l: -5, af: [30, 130], ab: [-20, 100], lf: [70, -40], lb: [-5, -12] }, kick: { l: -18, af: [10, 120], ab: [-40, 60], lf: [88, 90], lb: [-4, -10] },
    upper: { l: -6, af: [155, 172], ab: [-30, 60], lf: [14, 0], lb: [-14, -24] },
    sweep: { l: -25, af: [-20, 40], ab: [-50, -20], lf: [84, 88], lb: [35, -80] },
    airP: { l: 25, af: [50, 60], ab: [-30, 90], lf: [60, -30], lb: [20, -70] }, airK: { l: -10, af: [20, 120], ab: [-40, 80], lf: [65, 60], lb: [30, -80] },
    block: { l: -4, af: [70, 178], ab: [55, 172] }, cblock: { l: 6, af: [70, 178], ab: [55, 172], lf: [80, -25], lb: [25, -75] },
    hit: { l: -24, af: [-30, 10], ab: [-45, -15], lf: [12, -12], lb: [-22, -34] },
    fall: { l: -10, r: -55, af: [-70, -40], ab: [-90, -60], lf: [30, 10], lb: [5, -20] },
    lying: { l: 0, r: -90, af: [15, 10], ab: [-10, -10], lf: [6, 0], lb: [-4, -6] },
    win: { l: -2, af: [165, 178], ab: [-15, 100], lf: [12, 0], lb: [-12, -18] },
    castW: { l: -8, af: [-30, 60], ab: [-40, 40] }, cast: { l: 20, af: [84, 90], ab: [70, 96], lf: [34, -2], lb: [-32, -44] },
    dash: { l: 38, af: [84, 88], ab: [-55, -25], lf: [55, -5], lb: [-48, -62] },
    slide: { l: -40, af: [-30, 20], ab: [-50, -10], lf: [86, 89], lb: [70, 60] },
    poundW: { l: -10, af: [170, 178], ab: [160, 175] }, pound: { l: 32, af: [30, 10], ab: [20, 5], lf: [70, -30], lb: [20, -70] },
    heal: { l: 0, af: [40, 150], ab: [35, 160], lf: [10, 0], lb: [-10, -14] },
    shout: { l: 14, af: [100, 170], ab: [95, 165] },
    stand: { l: 0, af: [8, 14], ab: [-6, 2], lf: [8, 0], lb: [-8, -10] }
  };
  BF.POSES = P;
  function mix(a, b, t) {
    t = clamp(t, 0, 1); const o = {};
    for (const k of ['l', 'r']) { const x = a[k] == null ? D[k] : a[k], y = b[k] == null ? D[k] : b[k]; o[k] = x + (y - x) * t; }
    for (const k of ['af', 'ab', 'lf', 'lb']) { const x = a[k] || D[k], y = b[k] || D[k]; o[k] = [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t]; }
    return o;
  }
  BF.mix = mix;
  const SP_POSE = { proj: ['castW', 'cast'], dash: ['idle', 'dash'], rise: ['crouch', 'upper'], tele: ['castW', 'heal'], grab: ['castW', 'cast'],
    pound: ['poundW', 'pound'], heal: ['idle', 'heal'], shock: ['castW', 'shout'], inflate: ['castW', 'cast'] };
  const NM_POSE = { punch: ['punchW', 'punch'], kick: ['kickW', 'kick'], upper: ['crouch', 'upper'], sweep: ['crouch', 'sweep'] };

  function poseOf(f) {
    const t = f.t, fr = S.frame;
    switch (f.state) {
      case 'idle': return mix(P.idle, P.idle2, (Math.sin(fr * .12 + f.side * 2) + 1) / 2);
      case 'walk': { const k = Math.sin(t * .3); return { l: 8, af: [35 - k * 10, 140], ab: [-5 + k * 10, 115], lf: [22 + k * 22, -8 + k * 10], lb: [-18 - k * 22, -30 - k * 8] }; }
      case 'crouch': return mix(P.idle, P.crouch, t / 4);
      case 'block': case 'bstun': return f.crouch ? P.cblock : P.block;
      case 'jump': return f.chute ? P.chute : mix(P.jumpUp, P.jumpTuck, 1 - Math.abs(f.vy) / 6);
      case 'airatk': return f.mv === N.jp ? P.airP : P.airK;
      case 'attack': { const m = f.mv; if (!m) return P.idle;
        const pp = m.sp ? (m.pose === 'slide' ? ['crouch', 'slide'] : SP_POSE[m.type]) : NM_POSE[m.pose];
        const a = P[pp[0]], b = P[pp[1]];
        if (t < m.su) return mix(P.idle, a, t / Math.max(1, m.su - 2));
        if (t < m.su + m.act || (m.type === 'rise' && f.air)) return b;
        return mix(b, P.idle, (t - m.su - m.act) / Math.max(1, m.rec)); }
      case 'hit': return P.hit;
      case 'stun': case 'dizzy': { const k = Math.sin(fr * .12); return { l: k * 9, af: [8 + k * 8, 14], ab: [-6 + k * 8, 2], lf: [14, -4], lb: [-12, -22], cuffs: f.cuffs > 0 }; }
      case 'launched': return mix(P.hit, P.fall, t / 8);
      case 'down': case 'dead': return P.lying;
      case 'getup': return mix(P.lying, P.crouch, t / 12);
      case 'recover': return P.crouch;
      case 'win': return mix(P.idle, P.win, t / 10);
      case 'facepalm': return { l: 14, af: [120, 175], ab: [0, 10], lf: [10, 0], lb: [-10, -12] };
    }
    return P.idle;
  }
  BF.poseOf = poseOf;

  // ---------------- input ----------------
  const keys = {}, latch = {};
  const dn = (k) => keys[k] || latch[k];
  const KM = [{ KeyA: 'l', KeyD: 'r', KeyW: 'u', KeyS: 'd', KeyF: 'p', KeyG: 'k', KeyH: 'b' },
    { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', Comma: 'p', Period: 'k', Slash: 'b' }];
  const ALT = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', KeyZ: 'p', KeyX: 'k', KeyC: 'b' };
  const mkInp = () => ({ held: {}, prev: {}, pressed: {}, hist: [], cmd: null });
  const INP = [mkInp(), mkInp()];
  const two = () => S.mode === 'versus' && (S.scene === 'select' || S.scene === 'fight');
  function readDevice(i) {
    const h = {}, solo = !two();
    if (i === 0 || !solo) for (const k in KM[i]) if (dn(k)) h[KM[i][k]] = 1;
    if (i === 0 && solo) for (const k in ALT) if (dn(k)) h[ALT[k]] = 1;
    let gp = null; try { gp = navigator.getGamepads ? navigator.getGamepads()[i] : null; } catch (e) {}
    if (gp && gp.connected) {
      const b = (n) => gp.buttons[n] && gp.buttons[n].pressed, ax = gp.axes;
      if (ax[0] < -.5 || b(14)) h.l = 1; if (ax[0] > .5 || b(15)) h.r = 1; if (ax[1] < -.5 || b(12)) h.u = 1; if (ax[1] > .5 || b(13)) h.d = 1;
      if (b(2) || b(3)) h.p = 1; if (b(0)) h.k = 1; if (b(1) || b(5) || b(4)) h.b = 1; if (b(9)) h.start = 1; if (b(8)) h.esc = 1;
    }
    if (i === 0) { if (dn('Enter') || dn('Space')) h.start = 1; if (dn('Escape')) h.esc = 1; }
    return h;
  }
  function poll(I, src) {
    I.prev = I.held; I.held = src; I.pressed = {};
    for (const k in src) if (src[k] && !I.prev[k]) { I.pressed[k] = 1; if ('lrud'.includes(k)) { I.hist.push({ k, t: S.frame }); if (I.hist.length > 8) I.hist.shift(); } }
  }
  function motion(I, facing, seq, win) {
    const h = I.hist; if (h.length < seq.length) return false;
    const tail = h.slice(-seq.length); if (S.frame - tail[0].t > win) return false;
    return seq.every((s, i) => { const k = tail[i].k; return (k === 'l' ? (facing > 0 ? 'b' : 'f') : k === 'r' ? (facing > 0 ? 'f' : 'b') : k) === s; });
  }

  // ---------------- fighters ----------------
  function mkF(id, side, cpu) {
    return { ch: F[id], id, side, cpu, inp: cpu ? mkInp() : INP[side], x: 0, y: GY, vx: 0, vy: 0, facing: side ? -1 : 1, hp: 100, wins: 0,
      state: 'idle', t: 0, mv: null, hitDone: false, stun: 0, crouch: false, air: false, airUsed: false, chute: false, flash: 0, inflate: 0, cuffs: 0,
      invis: false, hidden: false, banner: null, lastHit: 0, ai: { hold: 0, keys: {}, q: [] } };
  }
  const set = (f, s) => { f.state = s; f.t = 0; };
  const hurt = (f) => { const h = (f.state === 'down' || f.state === 'dead') ? 14 : f.crouch ? 42 : 58; return [f.x - 11, f.y - h, 22, h]; };
  const overlap = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  const vulnerable = (d) => !(d.invis || d.state === 'down' || d.state === 'getup' || d.state === 'dead');
  function launch(d, vx, vy) { d.vx = vx; d.vy = vy; d.air = true; d.crouch = false; d.mv = null; d.chute = false; set(d, 'launched'); }

  function fx(type, x, y, o) { S.fx.push(Object.assign({ type, x, y, vx: 0, vy: 0, g: 0, life: 20, max: 20 }, o)); }
  function burst(x, y, n, heavy) {
    fx('spark', x, y, { life: 9 });
    for (let i = 0; i < n; i++) fx(heavy && i % 2 ? 'ink' : 'bill', x, y, { vx: (Math.random() - .5) * 4, vy: -Math.random() * 3.5, g: .14, life: 40 + Math.random() * 20, s: Math.random() * 9 });
  }
  const poof = (x, y) => { for (let i = 0; i < 8; i++) fx('dust', x, y, { vx: Math.cos(i * .785) * 1.6, vy: Math.sin(i * .785) * 1.6, life: 16 }); };
  function announce(text, t, sub) { S.ann = { text, t: t || 90, max: t || 90, sub }; }

  function startMove(f, m) { f.mv = m; f.hitDone = false; f.vx = 0; f.crouch = m === N.cp || m === N.ck; set(f, 'attack'); A.sfx('whoosh'); }
  function startSpecial(f, m) {
    f.mv = m; f.hitDone = false; f.vx = 0; f.crouch = false; set(f, 'attack'); f.banner = { text: m.name, t: 70 }; A.sfx('special');
    if (m.selfDmg) f.hp = Math.max(1, f.hp - m.selfDmg);
  }
  function tryAttack(f) {
    const I = f.inp, p = I.pressed, h = I.held, sp = f.ch.specials; let m = null;
    const by = (cmd) => sp.find((x) => x.cmd === cmd);
    if (I.cmd != null) { m = sp[I.cmd]; I.cmd = null; }
    else if (p.p && motion(I, f.facing, ['d', 'd'], 26)) m = by('22P');
    else if (p.p && motion(I, f.facing, ['d', 'f'], 26)) m = by('236P');
    else if (p.k && motion(I, f.facing, ['d', 'b'], 26)) m = by('214K');
    if (m && m.type === 'proj' && S.projs.some((q) => q.owner === f)) m = null;
    if (m) { startSpecial(f, m); I.hist.length = 0; return true; }
    if (p.p || p.k) { startMove(f, N[(h.d ? 'c' : 's') + (p.p ? 'p' : 'k')]); return true; }
    return false;
  }
  function control(f, o) {
    const h = f.inp.held;
    f.facing = o.x >= f.x ? 1 : -1;
    if (tryAttack(f)) return;
    if (h.b) { set(f, 'block'); f.vx = 0; f.crouch = !!h.d; return; }
    if (h.u) { f.vy = -7.4; f.vx = ((h.r ? 1 : 0) - (h.l ? 1 : 0)) * 2.1; f.air = true; f.airUsed = false; f.crouch = false; set(f, 'jump'); A.sfx('jump'); return; }
    if (h.d) { f.vx = 0; if (f.state !== 'crouch') set(f, 'crouch'); f.crouch = true; return; }
    f.crouch = false;
    const dir = (h.r ? 1 : 0) - (h.l ? 1 : 0);
    f.vx = dir * f.ch.speed * (dir === f.facing ? 1 : .8);
    const st = dir ? 'walk' : 'idle'; if (f.state !== st) set(f, st);
  }

  function resolve(a, d, m, px, py, srcX) {
    if (S.phase !== 'fight' || !vulnerable(d)) return false;
    if (srcX == null) srcX = a.x;
    const away = d.x === srcX ? a.facing : (d.x > srcX ? 1 : -1), h = m.type === 'grab' ? 'grab' : (m.h || 'mid');
    const guard = (d.state === 'block' || d.state === 'bstun') && d.facing === -away;
    const blocked = guard && h !== 'grab' && !(h === 'low' && !d.crouch) && !(h === 'over' && d.crouch);
    if (blocked) {
      if (m.sp) d.hp = Math.max(1, d.hp - Math.ceil(m.dmg / 6));
      set(d, 'bstun'); d.stun = 12; d.vx = away * 2.2; A.sfx('block'); fx('spark', px, py, { life: 6, col: '#8ad8ff' });
      return true;
    }
    d.hp -= m.dmg; d.flash = 6; d.lastHit = S.frame; d.invis = false; d.cuffs = 0;
    if (S.mode === 'training') d.hp = Math.max(1, d.hp);
    const big = m.sp || m.dmg >= 10;
    S.hitstop = big ? 8 : 5; S.shake = big ? 5 : 2; A.sfx(big ? 'heavy' : 'hit'); burst(px, py, big ? 8 : 4, big);
    if (!m.sp) fx('text', d.x, d.y - 74, { text: m.name, life: 40, vy: -.3, col: a.side ? '#8ad8ff' : '#fff26a' });
    if (d.hp <= 0) { d.hp = 0; launch(d, away * 2.2, -5); }
    else if (m.type === 'grab' && m.effect === 'stun') { set(d, 'stun'); d.stun = m.stun; d.cuffs = m.stun; d.vx = 0; d.mv = null; d.crouch = false; A.sfx('cuffs'); }
    else if (m.type === 'grab') { a.hp = Math.min(100, a.hp + m.heal); set(d, 'hit'); d.stun = 26; d.vx = away * 2; d.mv = null; d.crouch = false; A.sfx('cash');
      for (let i = 0; i < 6; i++) fx('bill', d.x, d.y - 40, { vx: -away * (1 + Math.random() * 2), vy: -1 - Math.random(), g: .05, life: 30 }); }
    else if (m.type === 'inflate') { d.inflate = 70; launch(d, away * .5, -2.2); }
    else if (m.type === 'shock' && !d.air) { set(d, 'stun'); d.stun = m.stun; d.vx = away * 1.5; d.mv = null; d.crouch = false; }
    else if (m.launch || m.kd || d.air || m.type === 'rise' || m.type === 'pound') launch(d, away * (m.launch ? m.launch[0] : 1.8), m.launch ? m.launch[1] : m.kd ? -3.4 : -4.6);
    else { set(d, 'hit'); d.stun = m.stun || 18; d.vx = away * (m.push || 3.2); d.mv = null; d.crouch = false; }
    if (m.onHit === 'swap' && d.hp > 0) { const x = a.x; a.x = d.x; d.x = x; poof(a.x, a.y - 30); poof(d.x, d.y - 30); A.sfx('poof'); }
    return true;
  }
  function tryHit(f, o, m, box) {
    const r = [f.facing > 0 ? f.x + box[0] : f.x - box[0] - box[2], f.y + box[1], box[2], box[3]], hb = hurt(o);
    if (!overlap(r, hb)) return;
    f.hitDone = true;
    resolve(f, o, m, clamp(f.x + f.facing * (box[0] + box[2]), hb[0], hb[0] + 22), clamp(r[1] + r[3] / 2, hb[1], o.y));
  }
  function fire(f, m) {
    const n = m.count || 1;
    for (let i = 0; i < n; i++) S.projs.push({ owner: f, m, kind: m.kind, label: m.label, n: i, t: 0, size: 6,
      x: f.x + f.facing * 20, y: m.ground ? GY - 8 : f.y - 40, w: m.pw || 12, h: m.ph || 10, low: m.low, wob: n > 1,
      vx: f.facing * m.speed * (n > 1 ? .6 + Math.random() * .9 : 1), vy: m.pvy || (n > 1 ? (Math.random() - .5) * 3.4 : 0), grav: m.grav || 0 });
  }

  function updAttack(f, o) {
    const m = f.mv, t = f.t, end = m.su + m.act + m.rec, on = t >= m.su && t < m.su + m.act;
    if (!m.sp) { if (on && !f.hitDone) tryHit(f, o, m, m.box); }
    else switch (m.type) {
      case 'proj': if (t === m.su) fire(f, m); break;
      case 'dash':
        if (on) { f.vx = f.facing * m.speed; if (m.multi && t % 5 === 0) f.hitDone = false;
          if (!f.hitDone) tryHit(f, o, m, m.low ? [4, -16, 26, 16] : [4, -52, 22, 46]);
          if (t % 3 === 0) fx('dust', f.x - f.facing * 8, GY - 2, { vy: -.4, life: 12 }); }
        else f.vx *= .6; break;
      case 'rise':
        if (t === m.su) { f.vy = -7; f.vx = f.facing * 1.3; f.air = true; }
        if (f.air && f.vy < 0 && !f.hitDone) tryHit(f, o, m, [0, -76, 26, 54]);
        if (f.air || t <= m.su) return; break;
      case 'tele':
        if (t === m.su) { f.invis = true; poof(f.x, f.y - 30); A.sfx('poof'); }
        if (t === m.su + m.act) { const side = o.x >= f.x ? 1 : -1; let nx = clamp(o.x + side * 38, 16, SW - 16);
          if (Math.abs(nx - o.x) < 24) nx = clamp(o.x - side * 38, 16, SW - 16);
          f.x = nx; f.facing = o.x >= f.x ? 1 : -1; f.invis = false; poof(f.x, f.y - 30); } break;
      case 'grab': if (t === m.su && Math.abs(o.x - f.x) < m.range && !o.air) resolve(f, o, m, o.x, o.y - 36); break;
      case 'pound': if (t === m.su) { S.shake = 8; A.sfx('slam'); fx('ring', f.x, GY - 3, { life: 22, max: 22, r: m.range });
        if (!o.air && Math.abs(o.x - f.x) < m.range) resolve(f, o, m, o.x, o.y - 8); } break;
      case 'heal': if (t === m.su) { f.hp = Math.min(100, f.hp + m.amt); A.sfx('heal');
        for (let i = 0; i < 5; i++) fx('plus', f.x - 14 + i * 7, f.y - 30 - (i % 2) * 14, { vy: -.6, life: 34 }); } break;
      case 'shock': if (t === m.su) { A.sfx('alarm'); fx('ring', f.x + f.facing * 14, f.y - 50, { life: 16, max: 16, r: m.range, col: '#fff' }); }
        if (on && !f.hitDone) tryHit(f, o, m, [4, -62, m.range, 62]); break;
      case 'inflate': if (t === m.su) fx('ring', f.x + f.facing * 26, f.y - 34, { life: 14, max: 14, r: 30, col: '#ffb0d8' });
        if (on && !f.hitDone) tryHit(f, o, m, [6, -58, 46, 52]); break;
    }
    if (t >= end) { f.mv = null; f.invis = false; set(f, 'idle'); }
  }

  function land(f) {
    if (f.state === 'jump' || f.state === 'airatk') { f.vx = 0; f.mv = null; set(f, 'idle'); }
    else if (f.state === 'attack') { f.mv = null; f.vx = 0; set(f, 'recover'); }
    else if (f.state === 'launched') { A.sfx('thud'); S.shake = Math.max(S.shake, 3); f.inflate = 0;
      if (S.phase === 'finish' && f === S.loser && !S.fell) { set(f, 'dizzy'); f.vx = 0; } else set(f, 'down'); }
  }
  function step(f, o, ctl) {
    f.t++; if (f.flash > 0) f.flash--; if (f.inflate > 0) f.inflate--; if (f.banner && --f.banner.t <= 0) f.banner = null;
    const I = f.inp;
    switch (f.state) {
      case 'idle': case 'walk': case 'crouch':
        if (ctl) control(f, o); else { f.vx = 0; f.crouch = false; if (f.state !== 'idle') set(f, 'idle'); } break;
      case 'block': f.vx = 0; if (!ctl || !I.held.b) { set(f, 'idle'); f.crouch = false; } else { f.crouch = !!I.held.d; f.facing = o.x >= f.x ? 1 : -1; } break;
      case 'jump': if (ctl) { f.chute = !!I.held.b && f.vy > 0;
        if ((I.pressed.p || I.pressed.k) && !f.airUsed) { f.mv = I.pressed.p ? N.jp : N.jk; f.hitDone = false; f.airUsed = true; f.chute = false; set(f, 'airatk'); A.sfx('whoosh'); } } else f.chute = false; break;
      case 'airatk': { const m = f.mv; if (f.t >= m.su && f.t < m.su + m.act && !f.hitDone) tryHit(f, o, m, m.box); break; }
      case 'attack': updAttack(f, o); break;
      case 'hit': case 'bstun': case 'stun': f.vx *= .82; if (--f.stun <= 0) { f.cuffs = 0; set(f, 'idle'); } break;
      case 'recover': f.vx *= .7; if (f.t > 12) set(f, 'idle'); break;
      case 'down': f.vx *= .8; if (f.hp <= 0) set(f, 'dead'); else if (f.t > 34) set(f, 'getup'); break;
      case 'getup': f.vx = 0; if (f.t > 14) set(f, 'idle'); break;
      default: if (!f.air) f.vx *= .8;
    }
    if (f.air) { f.vy += (f.inflate > 0 && f.state === 'launched') ? .05 : .4; if (f.chute && f.state === 'jump') f.vy = Math.min(f.vy, .7); }
    f.x += f.vx; f.y += f.vy;
    if (f.air && f.y >= GY && f.vy >= 0) { f.y = GY; f.vy = 0; f.air = false; f.chute = false; land(f); }
    f.x = clamp(f.x, Math.max(14, S.cam + 10), Math.min(SW - 14, S.cam + W - 10));
  }

  // ---------------- AI ----------------
  function ai(f, o) {
    const a = f.ai, I = f.inp;
    if (a.hold > 0) { a.hold--; return a.keys; }
    if (a.q.length) { const n = a.q.shift(); a.keys = n.k; a.hold = n.h; if (n.sp != null) I.cmd = n.sp; return a.keys; }
    I.cmd = null;
    if (!['idle', 'walk', 'crouch', 'block'].includes(f.state)) return (a.keys = {});
    const lvl = S.aiLevel, dx = o.x - f.x, dist = Math.abs(dx), fw = dx > 0 ? 'r' : 'l', bk = dx > 0 ? 'l' : 'r', r = Math.random();
    const gap = Math.max(2, Math.round(16 - lvl * 1.8 + Math.random() * 8));
    const act = (k, h, ...rest) => { a.keys = k; a.hold = h; a.q = rest; return k; };
    const spOf = (...types) => { const c2 = f.ch.specials.map((s, i) => [s, i]).filter(([s]) => types.includes(s.type) && !(s.type === 'proj' && S.projs.some((q) => q.owner === f))); return c2.length ? c2[(Math.random() * c2.length) | 0][1] : null; };
    const special = (i) => (i == null ? act({}, 4) : act({}, 1, { k: {}, h: 1, sp: i }, { k: {}, h: gap }));
    const blockP = .16 + lvl * .085;
    const threat = S.projs.find((q) => q.owner !== f && Math.abs(q.x - f.x) < 64 && Math.sign(q.vx) === Math.sign(f.x - q.x));
    if (threat && r < blockP + .25) return r < .12 ? act({ u: 1, [fw]: 1 }, 3) : act({ b: 1, d: threat.low ? 1 : 0 }, 16);
    if ((o.state === 'attack' || o.state === 'airatk') && dist < 64 && Math.random() < blockP) {
      const low = o.mv && (o.mv.h === 'low'); return act({ b: 1, d: low ? 1 : 0 }, 12);
    }
    if (o.air && dist < 56 && r < .12 + lvl * .04) return special(spOf('rise')) && a.keys;
    if (o.state === 'stun' || o.state === 'dizzy') { if (dist > 40) return act({ [fw]: 1 }, 6); return act({ d: 1, p: 1 }, 2, { k: {}, h: gap }); }
    if (dist > 130) {
      if (f.hp < 55 && r < .3 && spOf('heal') != null) return special(spOf('heal'));
      if (r < .34) return special(spOf('proj'));
      if (r < .82) return act({ [fw]: 1 }, 18);
      return act({ u: 1, [fw]: 1 }, 3, { k: {}, h: 10 });
    }
    if (dist > 54) {
      if (r < .34) return act({ [fw]: 1 }, 10);
      if (r < .5) return special(spOf('dash', 'tele'));
      if (r < .64) return special(spOf('proj', 'pound'));
      if (r < .78) return act({ u: 1, [fw]: 1 }, 3, { k: {}, h: 15 }, { k: { k: 1 }, h: 2 }, { k: {}, h: gap });
      if (r < .9) return act({ [bk]: 1 }, 12);
      return act({}, gap);
    }
    if (r < .2) return act({ p: 1 }, 2, { k: {}, h: gap });
    if (r < .4) return act({ k: 1 }, 2, { k: {}, h: gap });
    if (r < .53) return act({ d: 1, k: 1 }, 2, { k: {}, h: gap });
    if (r < .63) return act({ d: 1, p: 1 }, 2, { k: {}, h: gap });
    if (r < .78) return special(spOf('grab', 'shock', 'inflate', 'rise', 'pound', 'tele'));
    if (r < .9) return act({ b: 1 }, 14);
    return act({ [bk]: 1 }, 14);
  }

  // ---------------- match flow ----------------
  function startMatch(id0, id1) {
    S.scene = 'fight'; S.f = [mkF(id0, 0, false), mkF(id1, 1, S.mode !== 'versus')]; S.round = 1; S.stage = BF.STAGES[F[id1].stage];
    S.paused = false; startRound(); A.music('fight');
  }
  function startRound() {
    S.f.forEach((f, i) => Object.assign(f, { x: SW / 2 + (i ? 52 : -52), y: GY, vx: 0, vy: 0, facing: i ? -1 : 1, hp: 100, state: 'idle', t: 0, mv: null, stun: 0,
      crouch: false, air: false, chute: false, flash: 0, inflate: 0, cuffs: 0, invis: false, hidden: false, banner: null, ai: { hold: 0, keys: {}, q: [] } }));
    S.projs = []; S.fx = []; S.phase = 'intro'; S.pt = 0; S.timer = 99; S.tf = 0; S.hitstop = 0; S.shake = 0; S.fatal = null; S.fell = false; S.cam = (SW - W) / 2;
    S.winner = S.loser = null; S.final = false;
    if (S.mode === 'training') { S.phase = 'fight'; announce('TRAINING', 60); }
  }
  function endRound(w, l, timeout) {
    S.projs = [];
    if (!w) { S.phase = 'ko'; S.pt = 0; S.final = false; announce(timeout ? 'MARKET CLOSED' : 'MUTUAL DEFAULT', 120); A.sfx('ko'); return; }
    w.wins++; S.winner = w; S.loser = l; const final = w.wins >= 2;
    if (final && !timeout) beginFinish(w, l);
    else { S.phase = 'ko'; S.pt = 0; S.final = final; announce(timeout ? 'MARKET CLOSED' : 'BANKRUPT!', 120); A.sfx('ko'); if (!timeout) A.say('Bankrupt'); }
  }
  function beginFinish(w, l) {
    S.winner = w; S.loser = l; S.phase = 'finish'; S.pt = 0; S.fell = false; S.projs = []; l.hp = 0; w.inp.hist.length = 0;
    if (!l.air) { set(l, 'dizzy'); l.vx = 0; l.crouch = false; l.mv = null; }
    announce('REGULATE THEM!', 110); A.sfx('doom'); A.say('Regulate them');
  }
  function drop() { S.fell = true; S.pt = 0; launch(S.loser, 0, -2.6); A.sfx('ko'); }
  function startFatal(fd) {
    S.phase = 'fatal'; S.fatal = { def: fd, t: 0, done: {} }; S.loser.hidden = true; S.ann = null; A.say(fd.name); A.sfx('special');
    S.winner.banner = null; set(S.winner, 'idle');
  }
  function matchEnd() {
    const w = S.winner, fd = S.fatal && S.fatal.def;
    S.phase = 'matchEnd'; S.pt = 0;
    if (!(fd && fd.mercy)) set(w, 'win');
    announce(w.ch.name + ' WINS', 200, fd ? fd.verb + '!' : (w.hp >= 100 ? 'CLEAN AUDIT' : null));
    A.sfx('fanfare'); A.say(fd ? fd.verb : w.ch.name + ' wins');
  }
  function afterMatch() {
    if (S.mode === 'training') { S.f.forEach((f) => (f.wins = 0)); startRound(); return; }
    if (S.mode === 'versus') { S.scene = 'select'; S.ok = [false, false]; S.t = 0; A.music('select'); return; }
    if (S.winner.side === 0) { S.li++; if (S.li >= S.ladder.length) { S.scene = 'ending'; S.t = 0; A.music('title'); } else goVs(); }
    else { S.scene = 'continue'; S.t = 0; A.music(null); A.sfx('doom'); }
  }
  function goVs() { S.scene = 'vs'; S.t = 0; S.aiLevel = S.mode === 'arcade' ? S.li : 4; A.music(null); A.sfx('alarm'); }
  const oppId = () => (S.mode === 'arcade' ? S.ladder[S.li] : BF.ROSTER[S.sel[1]]);

  function updFight() {
    const [a, b] = S.f, M = INP[0];
    if (M.pressed.esc || (M.pressed.start && S.phase !== 'finish')) { S.paused = !S.paused; S.pmenu = 0; A.sfx('move'); return; }
    if (S.paused) return pauseMenu();
    for (const f of S.f) if (f.cpu) {
      const o = f === a ? b : a; let k = {};
      if (S.phase === 'fight') k = S.mode === 'training' ? [{}, { d: 1 }, { u: 1 }, { b: 1 }, null][S.dummy] || ai(f, o) : ai(f, o);
      poll(f.inp, k);
    }
    if (S.ann && --S.ann.t <= 0) S.ann = null;
    if (S.hitstop > 0) { S.hitstop--; return; }
    if (S.shake > 0) S.shake -= .5;
    S.pt++;
    const ctl = S.phase === 'fight';
    if (S.phase !== 'fatal' && S.phase !== 'matchEnd' || true) { step(a, b, ctl); step(b, a, ctl); }
    if (!a.air && !b.air && Math.abs(a.x - b.x) < 22 && vulnerable(a) && vulnerable(b) && !a.hidden && !b.hidden) {
      const push = (22 - Math.abs(a.x - b.x)) / 2, s = a.x <= b.x ? -1 : 1; a.x = clamp(a.x + s * push, 14, SW - 14); b.x = clamp(b.x - s * push, 14, SW - 14);
    }
    // projectiles
    for (const q of S.projs) {
      q.t++; q.x += q.vx; q.vy += q.grav; q.y += q.vy;
      if (q.wob) { q.vy += (Math.random() - .5) * .7; if (q.y < GY - 76 || q.y > GY - 10) q.vy *= -1; q.y = clamp(q.y, GY - 76, GY - 10); }
      if (q.m.grow) { q.size = Math.min(16, 6 + q.t * .075); q.w = q.h = q.size * 2 - 2; }
      const o = q.owner === a ? b : a;
      if (overlap([q.x - q.w / 2, q.y - q.h / 2, q.w, q.h], hurt(o)) && vulnerable(o)) {
        const m = q.m.grow ? Object.assign({}, q.m, { dmg: q.m.dmg + Math.round((q.size - 6) * .9) }) : q.m;
        resolve(q.owner, o, m, q.x, q.y, q.x - q.vx * 4); q.dead = true;
      }
      if (q.x < -30 || q.x > SW + 30 || q.t > 260) q.dead = true;
      if (q.y > GY - 2) { q.dead = true; poof(q.x, GY - 4); }
    }
    for (let i = 0; i < S.projs.length; i++) for (let j = i + 1; j < S.projs.length; j++) {
      const p = S.projs[i], q = S.projs[j];
      if (p.owner !== q.owner && !p.dead && !q.dead && overlap([p.x - p.w / 2, p.y - p.h / 2, p.w, p.h], [q.x - q.w / 2, q.y - q.h / 2, q.w, q.h])) { p.dead = q.dead = true; fx('spark', (p.x + q.x) / 2, (p.y + q.y) / 2, { life: 9 }); A.sfx('block'); }
    }
    S.projs = S.projs.filter((q) => !q.dead);
    for (const p of S.fx) { p.life--; p.x += p.vx; p.y += p.vy; p.vy += p.g; }
    S.fx = S.fx.filter((p) => p.life > 0);
    S.cam += (clamp((a.x + b.x) / 2 - W / 2, 0, SW - W) - S.cam) * .2;

    switch (S.phase) {
      case 'intro':
        if (S.pt === 2) { announce('ROUND ' + S.round, 64); A.say('Round ' + S.round); }
        if (S.pt === 70) { announce('OPENING BELL!', 44); A.sfx('bell'); }
        if (S.pt >= 112) { S.phase = 'fight'; S.pt = 0; } break;
      case 'fight':
        if (S.mode === 'training') { for (const f of S.f) if (S.frame - f.lastHit > 120 && f.hp < 100) f.hp = Math.min(100, f.hp + 2); break; }
        if (a.hp <= 0 || b.hp <= 0) { if (a.hp <= 0 && b.hp <= 0) endRound(null); else endRound(a.hp > 0 ? a : b, a.hp > 0 ? b : a); break; }
        if (++S.tf >= 60) { S.tf = 0; if (--S.timer <= 0) { S.timer = 0; if (a.hp === b.hp) endRound(null, null, true); else endRound(a.hp > b.hp ? a : b, a.hp > b.hp ? b : a, true); } }
        break;
      case 'ko':
        if (S.pt === 60 && S.winner && !S.winner.air) set(S.winner, 'win');
        if (S.pt > 200) { if (S.final) matchEnd(); else { S.round++; startRound(); } } break;
      case 'finish': {
        const w = S.winner, l = S.loser;
        if (S.fell) { if (l.state === 'dead' && S.pt > 70) matchEnd(); break; }
        if (l.state !== 'dizzy') break;
        if (w.cpu) { if (S.pt === 90) { if (Math.random() < .7) startFatal(BF.FATALITIES[(Math.random() * BF.FATALITIES.length) | 0]); else drop(); } }
        else for (const btn of ['p', 'k', 'b']) if (w.inp.pressed[btn]) {
          const fd = BF.FATALITIES.find((x) => x.btn === btn && motion(w.inp, w.facing, x.seq, 110));
          if (fd) startFatal(fd); else if (btn !== 'b') drop(); break;
        }
        if (S.phase === 'finish' && !S.fell && S.pt > 360) drop();
        break; }
      case 'fatal': if (++S.fatal.t >= S.fatal.def.dur) matchEnd(); break;
      case 'matchEnd': if (S.fatal) S.fatal.t++; if (S.pt > 230) afterMatch(); break;
    }
  }
  function pauseItems() { return S.mode === 'training' ? ['RESUME', 'DUMMY: ' + DUMMY[S.dummy], 'PRACTICE FINISHER', 'QUIT TO TITLE'] : ['RESUME', 'QUIT TO TITLE']; }
  function pauseMenu() {
    const M = INP[0].pressed, it = pauseItems();
    if (M.u) { S.pmenu = (S.pmenu + it.length - 1) % it.length; A.sfx('move'); }
    if (M.d) { S.pmenu = (S.pmenu + 1) % it.length; A.sfx('move'); }
    if (M.p || M.k) {
      const s = it[S.pmenu]; A.sfx('ok');
      if (s === 'RESUME') S.paused = false;
      else if (s.startsWith('DUMMY')) S.dummy = (S.dummy + 1) % DUMMY.length;
      else if (s === 'PRACTICE FINISHER') { S.paused = false; startRound(); beginFinish(S.f[0], S.f[1]); }
      else { S.paused = false; toTitle(); }
    }
  }
  function toTitle() { S.scene = 'title'; S.t = 0; S.mode = 'arcade'; A.music('title'); }

  // ---------------- menu scenes ----------------
  const MODES = [['ARCADE LADDER', 'arcade', 'BEAT ALL SEVEN RIVALS, THEN FACE THE REGULATOR'], ['2P VERSUS', 'versus', 'TWO PLAYERS, ONE KEYBOARD'], ['TRAINING', 'training', 'PRACTICE MOVES AND LEGISLATION']];
  function updMenus() {
    const M = INP[0].pressed, go = M.start || M.p; S.t++;
    switch (S.scene) {
      case 'title': if (go) { S.scene = 'mode'; S.t = 0; A.sfx('ok'); A.music('title'); } break;
      case 'mode':
        if (M.u) { S.menu = (S.menu + 2) % 3; A.sfx('move'); } if (M.d) { S.menu = (S.menu + 1) % 3; A.sfx('move'); }
        if (M.esc) toTitle();
        if (go) { S.mode = MODES[S.menu][1]; S.scene = 'select'; S.ok = [false, false]; S.t = 0; A.sfx('ok'); A.music('select'); if (BF.onSelect) BF.onSelect(BF.ROSTER[S.sel[0]]); }
        break;
      case 'select': {
        if (M.esc) { S.scene = 'mode'; S.t = 0; A.music('title'); break; }
        const mv = (i, P2) => { if (S.ok[i]) return; let s = S.sel[i];
          if (P2.l) s = (s & 4) | ((s + 3) & 3); if (P2.r) s = (s & 4) | ((s + 1) & 3); if (P2.u || P2.d) s ^= 4;
          if (s !== S.sel[i]) { S.sel[i] = s; A.sfx('move'); if (i === 0 && BF.onSelect) BF.onSelect(BF.ROSTER[s]); }
          if (P2.p || P2.start) { S.ok[i] = true; A.sfx('ok'); A.say(F[BF.ROSTER[s]].name); return true; } };
        if (S.mode === 'versus') { mv(0, INP[0].pressed); mv(1, INP[1].pressed); }
        else if (!S.ok[0]) { mv(0, M); if (S.mode === 'arcade') S.ok[1] = S.ok[0]; }
        else mv(1, M);
        if (S.ok[0] && S.ok[1] && !S.okT) S.okT = 1;
        if (S.okT && ++S.okT > 40) { S.okT = 0;
          if (S.mode === 'arcade') { const me = BF.ROSTER[S.sel[0]], rest = BF.ROSTER.filter((x) => x !== me);
            for (let i = rest.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [rest[i], rest[j]] = [rest[j], rest[i]]; }
            S.ladder = rest.concat('regulator'); S.li = 0; }
          if (S.mode === 'training') { S.aiLevel = 4; startMatch(BF.ROSTER[S.sel[0]], BF.ROSTER[S.sel[1]]); } else goVs();
        }
        break; }
      case 'vs': if (S.t > 170 || (S.t > 30 && go)) startMatch(BF.ROSTER[S.sel[0]], oppId()); break;
      case 'continue': if (go) { goVs(); } else if (S.t > 600) toTitle(); break;
      case 'ending': if (S.t > 120 && go) toTitle(); break;
    }
  }

  // ---------------- drawing ----------------
  function gold(y, h) { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fff8b0'); g.addColorStop(.5, '#f6c83a'); g.addColorStop(1, '#d8641a'); return g; }
  function big(s, y, sc, col) { T(c, s, W / 2, y, col || gold(y, 5 * sc), { scale: sc, align: 'center', outline: '#2a0808' }); }
  function frame(x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h); }

  function drawF(f) {
    if (f.hidden || f.invis) return;
    const x = f.x - S.cam, p = poseOf(f), o = {};
    if (f.flash > 0) o.flash = 'rgba(255,255,255,.8)';
    if (f.inflate > 0) { const k = 1 + .55 * Math.min(1, f.inflate / 12); o.sx = k; o.sy = k; }
    BF.drawFighter(c, f.ch, p, x, f.y, f.facing, o);
    if (f.chute && f.state === 'jump') {
      const hx = x, hy = f.y - 92;
      for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#f6c83a' : '#fff0a0'; c.fillRect(Math.round(hx - 21 + i * 6), Math.round(hy + Math.abs(i - 3) * 2), 6, 9 - Math.abs(i - 3)); }
      c.fillStyle = '#a87c10'; for (let k = 0; k < 10; k++) { c.fillRect(Math.round(hx - 20 + k * 1.2), Math.round(hy + 12 + k * 1.6), 1, 2); c.fillRect(Math.round(hx + 20 - k * 1.2), Math.round(hy + 12 + k * 1.6), 1, 2); }
    }
    if (f.state === 'stun' || f.state === 'dizzy') for (let i = 0; i < 3; i++) {
      const an = S.frame * .12 + i * 2.09; T(c, f.cuffs > 0 ? '$' : '*', x + Math.cos(an) * 12 - 2, f.y - 72 + Math.sin(an) * 3, f.cuffs > 0 ? '#f6c83a' : '#fff26a', { shadow: false });
    }
  }
  function drawFx() {
    for (const p of S.fx) {
      const x = Math.round(p.x - S.cam), y = Math.round(p.y);
      switch (p.type) {
        case 'spark': { const s = p.life; c.fillStyle = p.col || '#fff'; c.fillRect(x - s, y - 1, s * 2, 2); c.fillRect(x - 1, y - s, 2, s * 2); c.fillStyle = p.col || '#fff26a'; c.fillRect(x - s / 2, y - s / 2, s, s); break; }
        case 'bill': c.fillStyle = '#1a6a2a'; c.fillRect(x, y, 6, (p.life >> 2) % 2 ? 3 : 2); c.fillStyle = '#6ad87a'; c.fillRect(x + 1, y, 4, 1); break;
        case 'ink': c.fillStyle = '#e8203a'; c.fillRect(x, y, 2, 2); break;
        case 'dust': c.fillStyle = p.life > 8 ? '#fff' : '#aaa'; c.fillRect(x, y, p.life > 8 ? 3 : 2, p.life > 8 ? 3 : 2); break;
        case 'plus': T(c, '+', x, y, '#3aff6a'); break;
        case 'text': T(c, p.text, x, y, p.col, { align: 'center', outline: '#000' }); break;
        case 'ring': { const r = p.r * (1 - p.life / p.max); c.fillStyle = p.col || '#f6c83a'; for (let a = 0; a < 20; a++) c.fillRect(Math.round(x + Math.cos(a * .314) * r), Math.round(y + Math.sin(a * .314) * r * .35), 3, 2); break; }
      }
    }
  }
  function bar(x, hp, side, f) {
    c.fillStyle = '#000'; c.fillRect(x - 2, 10, 104, 10); c.fillStyle = '#fff'; c.fillRect(x - 1, 11, 102, 8); c.fillStyle = '#b01818'; c.fillRect(x, 12, 100, 6);
    const w = Math.round(clamp(hp, 0, 100)); c.fillStyle = hp > 25 ? '#f6d83a' : (S.frame >> 2) % 2 ? '#f6d83a' : '#ff7a3a';
    c.fillRect(side ? x : x + 100 - w, 12, w, 6); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(side ? x : x + 100 - w, 12, w, 1);
    T(c, f.ch.name, side ? x + 100 : x, 23, '#fff', { align: side ? 'right' : 'left' });
    for (let i = 0; i < f.wins; i++) T(c, '$', side ? x + i * 7 : x + 95 - i * 7, 30, '#f6c83a');
    if (f.banner) T(c, f.banner.text, side ? x + 100 : x, 38, (f.banner.t >> 2) % 2 ? f.ch.pal.accent : '#fff', { align: side ? 'right' : 'left', outline: '#000' });
  }
  function drawFight() {
    const [a, b] = S.f, sh = S.shake > 0 ? Math.round((Math.random() * 2 - 1) * S.shake) : 0;
    c.save(); c.translate(sh, sh ? Math.round((Math.random() * 2 - 1) * S.shake * .5) : 0);
    S.stage.draw(c, S.cam, S.frame);
    if (S.phase === 'finish' || S.fatal) { c.fillStyle = 'rgba(8,0,24,.45)'; c.fillRect(-8, -8, W + 16, H + 16); }
    for (const f of S.f) if (!f.hidden && !f.invis) { const w = clamp(14 - (GY - f.y) / 8, 4, 14); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(Math.round(f.x - S.cam - w), GY + 1, w * 2, 3); }
    const env = S.fatal && fatalEnv();
    if (env && S.fatal.def.back) S.fatal.def.back(env);
    const first = (a.state === 'attack' || a.state === 'win') ? b : a; drawF(first); drawF(first === a ? b : a);
    for (const q of S.projs) BF.drawProj(c, q, q.x - S.cam, q.y, S.frame);
    drawFx();
    if (env) S.fatal.def.draw(env);
    c.restore();
    // HUD
    bar(12, a.hp, 0, a); bar(144, b.hp, 1, b);
    T(c, S.mode === 'training' ? '--' : String(S.timer).padStart(2, '0'), W / 2, 9, S.timer <= 10 && S.mode !== 'training' ? '#ff5a3a' : '#fff', { scale: 2, align: 'center', outline: '#000' });
    if (S.fatal) { const fd = S.fatal.def; T(c, fd.name, W / 2, 48, '#fff', { align: 'center', outline: '#5a0a0a' }); T(c, 'OF ' + fd.year, W / 2, 56, '#f6c83a', { align: 'center', outline: '#5a0a0a' }); }
    if (S.ann && (S.ann.t > 14 || (S.ann.t >> 1) % 2)) {
      const sc = BF.textW(S.ann.text, 3) < 240 ? 3 : 2; big(S.ann.text, S.ann.sub ? 78 : 86, sc);
      if (S.ann.sub) big(S.ann.sub, 78 + sc * 5 + 8, 2, '#ff5a3a');
    }
    if (S.phase === 'finish' && !S.fell && !S.winner.cpu) {
      if (S.mode === 'training') BF.FATALITIES.forEach((fd, i) => T(c, fd.input + '  ' + (fd.short || fd.name), 8, 126 + i * 8, '#fff', { outline: '#000' }));
      else if ((S.frame >> 4) % 2) T(c, 'ENTER A LEGISLATION CODE', W / 2, 122, '#fff', { align: 'center', outline: '#000' });
      c.fillStyle = '#000'; c.fillRect(77, 112, 102, 4); c.fillStyle = '#e8203a'; c.fillRect(78, 113, Math.round(100 * (1 - S.pt / 360)), 2);
    }
    if (S.mode === 'training' && S.phase === 'fight') {
      a.ch.specials.forEach((m, i) => T(c, BF.cmdText(m.cmd) + '  ' + m.name, 6, 204 + i * 7, '#fff', { outline: '#000' }));
      T(c, 'ENTER: MENU', W - 6, 218, '#f6c83a', { align: 'right', outline: '#000' });
      T(c, 'DUMMY: ' + DUMMY[S.dummy], W - 6, 211, '#fff', { align: 'right', outline: '#000' });
    }
    if (S.paused) {
      const it = pauseItems(); c.fillStyle = 'rgba(0,0,20,.75)'; c.fillRect(0, 0, W, H);
      big('TRADING HALTED', 60, 2);
      it.forEach((s, i) => T(c, (i === S.pmenu ? '→ ' : '  ') + s, 76, 100 + i * 14, i === S.pmenu ? '#fff26a' : '#aaa'));
      T(c, 'UP / DOWN + PUNCH TO CHOOSE', W / 2, 190, '#888', { align: 'center' });
    }
  }
  function fatalEnv() {
    const st = S.fatal;
    return { c, t: st.t, W: S.winner, L: S.loser, lx: Math.round(S.loser.x - S.cam), wx: Math.round(S.winner.x - S.cam), gy: GY, st,
      once(k, fn) { if (!st.done[k]) { st.done[k] = 1; fn(); } }, shake(n) { S.shake = Math.max(S.shake, n); }, sfx: A.sfx, set, P, mix };
  }

  function bgDark(a) { BF.STAGES.trading.draw(c, 80 + Math.sin(S.frame * .004) * 80, S.frame); c.fillStyle = 'rgba(10,4,30,' + a + ')'; c.fillRect(0, 0, W, H); }
  function drawTitle() {
    bgDark(.72);
    const bob = Math.round(Math.sin(S.frame * .05) * 2);
    T(c, 'BANK', W / 2, 40 + bob, gold(40 + bob, 30), { scale: 6, align: 'center', outline: '#3a0a0a' });
    T(c, 'FIGHTER', W / 2, 80 + bob, gold(80 + bob, 25), { scale: 5, align: 'center', outline: '#3a0a0a' });
    T(c, 'TOO BIG TO FAIL. TOO SLOW TO BLOCK.', W / 2, 116, '#ff5a3a', { align: 'center' });
    BF.drawFighter(c, F.enron, poseOf({ state: 'idle', side: 0, t: S.frame }), 44, 206, 1); BF.drawFighter(c, F.bear, poseOf({ state: 'idle', side: 1, t: S.frame }), 212, 206, -1);
    if ((S.frame >> 4) % 2) T(c, 'PRESS ENTER', W / 2, 150, '#fff', { scale: 2, align: 'center' });
    T(c, 'A PARODY. NOT INVESTMENT ADVICE.', W / 2, 212, '#888', { align: 'center' });
  }
  function drawMode() {
    bgDark(.8); big('SELECT MODE', 30, 3);
    MODES.forEach((m, i) => { const on = i === S.menu; T(c, (on ? '→ ' : '  ') + m[0], 62, 84 + i * 22, on ? '#fff26a' : '#9a9ab0', { scale: 2 }); });
    T(c, MODES[S.menu][2], W / 2, 164, '#fff', { align: 'center' });
    T(c, 'UP / DOWN: CHOOSE   ENTER: CONFIRM', W / 2, 206, '#888', { align: 'center' });
  }
  function drawSelect() {
    c.fillStyle = '#0c0828'; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 16) for (let x = ((y / 16) % 2) * 16 - ((S.frame >> 2) % 32); x < W; x += 32) { c.fillStyle = '#140e3a'; c.fillRect(x, y, 16, 16); }
    big('CHOOSE YOUR LIABILITY', 8, 2);
    c.imageSmoothingEnabled = false;
    BF.ROSTER.forEach((id, i) => { const x = 20 + (i & 3) * 56, y = 28 + (i >> 2) * 56; c.fillStyle = '#000'; c.fillRect(x - 2, y - 2, 56, 56); c.drawImage(BF.portrait(F[id]), x, y, 52, 52); });
    const cur = (i, col, tag) => { const s = S.sel[i], x = 20 + (s & 3) * 56, y = 28 + (s >> 2) * 56; if (S.ok[i] || (S.frame >> 2) % 2) { frame(x - 2, y - 2, 56, 56, col); frame(x - 1, y - 1, 54, 54, col); }
      T(c, tag, i ? x + 51 : x + 1, i ? y + 45 : y + 1, col, { align: i ? 'right' : 'left', outline: '#000' }); };
    const showP2 = S.mode === 'versus' || (S.mode === 'training' && S.ok[0]);
    cur(0, '#ff5a3a', '1P'); if (showP2) cur(1, '#5aa8ff', S.mode === 'training' ? 'DUMMY' : '2P');
    const side = (i, x, al) => { const ch = F[BF.ROSTER[S.sel[i]]];
      BF.drawFighter(c, ch, S.ok[i] ? P.win : poseOf({ state: 'idle', side: i, t: 0 }), i ? W - 34 : 34, 220, i ? -1 : 1);
      T(c, ch.name, x, 146, '#fff', { align: al, outline: '#000' }); T(c, ch.mascot, x, 154, ch.pal.accent, { align: al }); };
    side(0, 8, 'left'); if (showP2) side(1, W - 8, 'right');
    if (S.mode !== 'versus' && !S.ok[0]) F[BF.ROSTER[S.sel[0]]].specials.forEach((m, i) => T(c, m.name, W / 2 + 16, 176 + i * 10, '#9a9ab0', { align: 'center' }));
  }
  function drawVs() {
    const a = F[BF.ROSTER[S.sel[0]]], b = F[oppId()], k = Math.min(1, S.t / 20);
    c.fillStyle = a.pal.dark; c.fillRect(0, 0, W, H); c.fillStyle = b.pal.dark; for (let y = 0; y < H; y++) c.fillRect(W / 2 + 40 - y * .36, y, W, 1);
    c.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < H; y += 2) c.fillRect(0, y, W, 1);
    c.imageSmoothingEnabled = false;
    BF.drawFighter(c, a, P.idle, -60 + k * 124, 176, 1, { sx: 2, sy: 2 }); BF.drawFighter(c, b, P.idle, W + 60 - k * 124, 176, -1, { sx: 2, sy: 2 });
    T(c, 'VS', W / 2, 84, gold(84, 30), { scale: 6, align: 'center', outline: '#2a0808' });
    T(c, a.name, 8, 184, '#fff', { scale: 2, outline: '#000' }); T(c, b.name, W - 8, 184, '#fff', { scale: BF.textW(b.name, 2) > 120 ? 1 : 2, align: 'right', outline: '#000' });
    T(c, a.hq, 8, 198, '#f6c83a'); T(c, b.hq, W - 8, 198, '#f6c83a', { align: 'right' });
    if (S.mode === 'arcade') big(b.boss ? 'FINAL AUDIT' : 'MATCH ' + (S.li + 1) + ' OF ' + S.ladder.length, 10, 2);
    T(c, BF.STAGES[b.stage].name, W / 2, 212, '#fff', { align: 'center' });
  }
  function drawContinue() {
    bgDark(.88); big('CHAPTER 11', 40, 4); big('REORGANIZE?', 76, 2, '#fff');
    T(c, String(Math.max(0, 9 - Math.floor(S.t / 66))), W / 2, 104, '#ff5a3a', { scale: 6, align: 'center', outline: '#000' });
    BF.drawFighter(c, F[BF.ROSTER[S.sel[0]]], P.lying, W / 2, 196, 1);
    if ((S.frame >> 4) % 2) T(c, 'PRESS ENTER TO CONTINUE', W / 2, 206, '#fff', { align: 'center' });
  }
  function drawEnding() {
    const ch = F[BF.ROSTER[S.sel[0]]]; bgDark(.85);
    big('ACQUITTED!', 22, 4);
    ['THE REGULATOR HAS BEEN DEFEATED.', '', ch.name + ' SETTLES ALL CHARGES', 'WITHOUT ADMITTING OR DENYING', 'ANY WRONGDOING.', '', 'EXECUTIVE BONUSES ARE PAID IN FULL.', '', 'THE END?']
      .forEach((s, i) => { if (S.t > 30 + i * 22) T(c, s, W / 2, 60 + i * 10, i === 8 ? '#f6c83a' : '#fff', { align: 'center' }); });
    BF.drawFighter(c, ch, P.win, W / 2, 214, 1);
    for (let i = 0; i < 20; i++) { c.fillStyle = '#1a8a3a'; c.fillRect((i * 53 + S.t * (i % 3 + 1) * .3) % W, (i * 37 + S.t * (1 + i % 4 * .3)) % H, 6, 3); }
  }

  // ---------------- main loop ----------------
  function tick() {
    S.frame++;
    poll(INP[0], readDevice(0)); poll(INP[1], readDevice(1)); for (const k in latch) delete latch[k];
    if (S.scene === 'fight') updFight(); else updMenus();
  }
  function draw() {
    c.imageSmoothingEnabled = false;
    ({ title: drawTitle, mode: drawMode, select: drawSelect, vs: drawVs, fight: drawFight, continue: drawContinue, ending: drawEnding })[S.scene]();
  }
  let last = 0, acc = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    acc += Math.min(100, ts - last); last = ts;
    let n = 0; while (acc >= 1000 / 60 && n++ < 5) { tick(); acc -= 1000 / 60; }
    if (n) draw();
  }
  function fit() {
    const wrap = cv.parentElement, fs = document.fullscreenElement === wrap;
    const aw = fs ? innerWidth : wrap.clientWidth, ah = fs ? innerHeight : Math.max(224, innerHeight - 150);
    const s = Math.max(1, Math.floor(Math.min(aw / W, ah / H)));
    cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px';
  }

  BF.boot = function (canvas) {
    cv = canvas; cv.width = W; cv.height = H; c = cv.getContext('2d');
    const GAME = new Set(Object.keys(KM[0]).concat(Object.keys(KM[1]), Object.keys(ALT), ['Enter', 'Space', 'Escape']));
    addEventListener('keydown', (e) => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (GAME.has(e.code)) { e.preventDefault(); if (!e.repeat) latch[e.code] = true; keys[e.code] = true; if (A.init()) A.resume(); }
      if (e.code === 'KeyM') A.toggleMute();
    });
    addEventListener('keyup', (e) => { keys[e.code] = false; });
    addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
    addEventListener('resize', fit); document.addEventListener('fullscreenchange', fit); fit();
    A.music('title');
    draw(); requestAnimationFrame((ts) => { last = ts; loop(ts); });
  };
  // test/debug handle
  window.bankfighter = { S, INP, keys, tick, draw, advance(n) { for (let i = 0; i < (n || 1); i++) tick(); draw(); },
    fight(mode, a, b) { S.mode = mode || 'training'; S.sel = [BF.ROSTER.indexOf(a || 'enron'), Math.max(0, BF.ROSTER.indexOf(b || 'bear'))]; S.ladder = [b || 'bear']; S.li = 0; S.aiLevel = 4; startMatch(a || 'enron', b || 'bear'); },
    finisher(id) { startRound(); S.phase = 'fight'; beginFinish(S.f[0], S.f[1]); if (id) startFatal(BF.FATALITIES.find((x) => x.id === id)); } };
})();
