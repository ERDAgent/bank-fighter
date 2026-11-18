/* Bank Fighter — legislation finisher cutscenes. Each gets draw(env) once per frame.
   env: {c, t, W, L, lx, wx, gy, once(key, fn), shake(n), sfx(name), set, P, mix} */
(function () {
  const BF = window.BF;
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * clamp(k, 0, 1);
  const dizzy = (t) => { const k = Math.sin(t * .12); return { l: k * 9, af: [8 + k * 8, 14], ab: [-6 + k * 8, 2], lf: [14, -4], lb: [-12, -22] }; };
  const label = (c, s, x, y, col) => BF.text(c, s, clamp(x, BF.textW(s) / 2 + 3, 253 - BF.textW(s) / 2), y, col || '#fff', { align: 'center', outline: '#000' });
  const loser = (e, pose, o, dx, dy) => BF.drawFighter(e.c, e.L.ch, pose, e.lx + (dx || 0), e.gy + (dy || 0), e.L.facing, o);
  const DRAW = {};

  // --- Sarbanes-Oxley: the whistle, then the auditors ---
  DRAW.sox = function (e) {
    const { c, t, lx, gy } = e, blow = t >= 60 && t < 140;
    const h = clamp((t - 175) * .45, 0, 42);
    if (t < 240) loser(e, t < 60 ? dizzy(t) : e.P.hit, null, blow || t > 150 ? Math.round(Math.sin(t * 2.3) * 2) : 0);
    // whistle
    const wy = (t < 60 ? -46 + t * 1.2 : 26) - Math.max(0, t - 150) * 2.4 + (blow ? Math.round(Math.sin(t * 1.9) * 1.5) : 0), wx = lx - 8;
    if (wy > -60) {
      BF.disc(c, wx, wy + 14, 15, '#0c0c14'); R(c, '#0c0c14', wx + 4, wy + 1, 34, 15);
      BF.disc(c, wx, wy + 14, 13, '#c8ccd8'); R(c, '#c8ccd8', wx + 4, wy + 3, 32, 11); R(c, '#eef0f8', wx - 8, wy + 5, 8, 3); R(c, '#8a90a0', wx + 4, wy + 12, 32, 2);
      R(c, '#22242c', wx + 8, wy + 3, 9, 5); BF.disc(c, wx, wy + 14, 4, '#f6c83a'); R(c, '#f6c83a', wx - 3, wy - 6, 6, 6); R(c, '#0c0c14', wx - 1, wy - 4, 2, 2);
    }
    if (blow) {
      e.once('w1', () => e.sfx('whistle')); if (t >= 100) e.once('w2', () => e.sfx('whistle')); e.shake(2);
      for (let k = 0; k < 3; k++) { const r = (t * 2 + k * 16) % 48; c.fillStyle = k % 2 ? '#fff' : '#fff26a';
        for (let a = .15; a < .86; a += .07) c.fillRect(Math.round(lx + Math.cos(a * Math.PI) * r * 1.5), Math.round(wy + 30 + Math.sin(a * Math.PI) * r), 3, 2); }
      label(c, 'TWEEEEET!', lx + Math.sin(t) * 2, wy + 34 + (t % 4), '#fff26a');
    }
    // auditors + paper pile
    const aud = (i) => { const t0 = 122 + i * 7; if (t < t0) return; const side = i % 2 ? 1 : -1, tx = lx + side * (9 + (i >> 1) * 8), x0 = side > 0 ? 272 : -16, k = clamp((t - t0) / 42, 0, 1);
      BF.drawAuditor(c, x0 + (tx - x0) * k, gy - (k >= 1 ? ((t + i * 5) >> 3) % 2 : 0), k < 1 ? t + i * 3 : (t >> 2) + i, -side, i); };
    if (t >= 122) e.once('run', () => e.sfx('alarm'));
    for (let i = 4; i < 12; i++) aud(i);
    for (let row = 0; row * 3 < h; row++) { R(c, '#0c0c14', lx - 19 + (row * 7) % 5, gy - 3 - row * 3, 36, 4); R(c, row % 2 ? '#f4f0e4' : '#d8d0bc', lx - 18 + (row * 7) % 5, gy - 3 - row * 3, 34, 3); }
    for (let i = 0; i < 4; i++) aud(i);
    if (t > 150 && t < 280) for (let i = 0; i < 18; i++) { const a = (t - 150 + i * 13) % 60; R(c, '#fff', lx + Math.cos(i * 2.4) * a * 1.1, gy - 30 - a * 1.3 + a * a * .028, 4, 5); R(c, '#888', lx + Math.cos(i * 2.4) * a * 1.1 + 1, gy - 28 - a * 1.3 + a * a * .028, 2, 1); }
    if (t >= 262) {
      e.once('stamp', () => { e.sfx('slam'); e.shake(8); });
      const y = gy - h - 20; R(c, '#e8203a', lx - 30, y - 3, 60, 13); R(c, '#f4f0e4', lx - 28, y - 1, 56, 9); BF.text(c, 'RESTATED', lx, y + 1, '#e8203a', { align: 'center', shadow: false });
    }
  };

  // --- Glass-Steagall: split commercial from investment ---
  DRAW.glass = function (e) {
    const { c, t, lx, gy, L } = e, hit = t >= 50;
    const py = t < 30 ? -240 : hit ? 0 : -240 + (t - 30) * (t - 30) * .6;
    if (!hit) loser(e, dizzy(t));
    else {
      e.once('slam', () => { e.sfx('slam'); e.sfx('glass'); e.shake(10); });
      const d = Math.min(30, (t - 50) * .8), hop = (k) => (t > 70 ? -Math.abs(Math.sin((t - 50) * .18 + k)) * 5 : 0), pose = e.P.stand;
      loser(e, pose, { clip: L.facing > 0 ? [0, 64] : [64, 64] }, -d, hop(0));
      loser(e, pose, { clip: L.facing > 0 ? [64, 64] : [0, 64] }, d, hop(1.5));
      if (t > 95) { label(c, 'COMMERCIAL', lx - d - 6, gy - 86 + hop(0), '#8ad8ff'); label(c, 'INVESTMENT', lx + d + 6, gy - 86 + hop(1.5), '#f6c83a'); }
      if (t < 90) for (let i = 0; i < 14; i++) { const a = t - 50; R(c, i % 2 ? '#e8f8ff' : '#8ad8ff', lx + Math.cos(i * 1.9) * a * (1 + (i % 3) * .5), gy - 20 - (i * 5) % 60 - a * 1.5 + a * a * .06, 2 + (i % 2), 2 + (i % 3)); }
    }
    c.fillStyle = 'rgba(180,232,255,.55)'; c.fillRect(lx - 3, py, 7, gy);
    R(c, '#fff', lx - 3, py, 1, gy); R(c, 'rgba(255,255,255,.6)', lx + 1, py + 20, 1, gy - 60); R(c, '#5a8aa0', lx + 3, py, 1, gy);
    if (hit) { R(c, '#3a4250', lx - 10, gy - 2, 21, 4); R(c, '#8a94a8', lx - 10, gy - 2, 21, 1); }
  };

  // --- Dodd-Frank: stress test, then orderly liquidation ---
  DRAW.dodd = function (e) {
    const { c, t, lx, gy } = e;
    const pb = t < 40 ? lerp(-10, gy - 72, t / 40) : t < 70 ? gy - 72 + Math.round(Math.sin(t * 1.3)) : t < 80 ? lerp(gy - 72, gy - 9, (t - 70) / 10) : t < 115 ? gy - 9 : lerp(gy - 9, -30, (t - 115) / 35);
    const melt = clamp((t - 150) / 80, 0, 1), sy = t < 70 ? 1 : lerp(lerp(1, .14, (t - 70) / 10), .04, melt), sx = t < 70 ? 1 : lerp(lerp(1, 1.4, (t - 70) / 10), 2.6, melt);
    if (t >= 40) e.once('alarm', () => e.sfx('alarm'));
    if (t >= 80) e.once('slam', () => { e.sfx('slam'); e.shake(11); });
    if (melt > 0) { const w = melt * 46; e.once('melt', () => e.sfx('poof'));
      R(c, '#0c3a18', lx - w - 1, gy - 3, w * 2 + 2, 6); R(c, '#1a8a3a', lx - w, gy - 2, w * 2, 4); R(c, '#6ad87a', lx - w * .6, gy - 2, w * .7, 1);
      for (let i = 0; i < 4; i++) { const a = (t + i * 23) % 50; if (melt > .3) BF.text(c, '$', lx - 30 + i * 18, gy - 8 - a * .5, a < 40 ? '#6ad87a' : '#1a8a3a', { shadow: false }); } }
    if (melt < 1) loser(e, t < 70 ? (t < 40 ? dizzy(t) : e.P.hit) : e.P.hit, { sx, sy, alpha: 1 - melt }, t >= 40 && t < 70 ? Math.round(Math.sin(t * 2) * 1.5) : 0);
    if (pb > -30) {
      R(c, '#22262e', lx - 7, -4, 14, pb - 34); R(c, '#4a5262', lx - 5, -4, 4, pb - 34);
      R(c, '#0c0c14', lx - 33, pb - 41, 66, 42); R(c, '#6a7488', lx - 32, pb - 40, 64, 40); R(c, '#9aa4b8', lx - 32, pb - 40, 64, 2); R(c, '#4a5262', lx - 32, pb - 8, 64, 8);
      for (let i = 0; i < 8; i++) R(c, i % 2 ? '#111' : '#f6d23a', lx - 32 + i * 8, pb - 6, 8, 6);
      BF.text(c, 'STRESS', lx, pb - 34, '#fff', { align: 'center', scale: 1 }); BF.text(c, 'TEST', lx, pb - 24, '#f6d23a', { align: 'center', scale: 2 });
    }
    if (t > 86 && t < 150 && (t >> 3) % 2) label(c, 'FAILED', lx, gy - 78, '#ff3a3a');
    if (t > 185) { label(c, 'ORDERLY', lx, gy - 34, '#fff'); label(c, 'LIQUIDATION', lx, gy - 26, '#6ad87a'); }
  };

  // --- Sherman Antitrust: broken up ---
  DRAW.sherman = function (e) {
    const { c, t, lx, gy, L, W } = e, dir = W.x <= L.x ? 1 : -1, k = clamp((t - 40) / 16, 0, 1), up = clamp((t - 84) / 30, 0, 1);
    const gx = lerp(lx - dir * 50, lx, k * k), gyy = lerp(gy - 138, gy - 44, k * k) - up * 160;
    if (t < 56) loser(e, dizzy(t));
    else {
      e.once('slam', () => { e.sfx('slam'); e.sfx('glass'); e.shake(11); });
      for (let i = 0; i < 7; i++) {
        const d = i < 3 ? -1 : i < 6 ? 1 : (L.facing), sp = .45 + (i % 3) * .32 + (i === 6 ? .1 : 0), a = t - 56, w = Math.sin(a * .45 + i);
        const x = lx + d * (6 + sp * a), y = gy - Math.abs(Math.sin(a * .22 + i * 1.3)) * 7;
        if (x > -20 && x < 276) BF.drawFighter(c, L.ch, { l: 14, af: [35 - w * 30, 120], ab: [-5 + w * 30, 100], lf: [22 + w * 28, -8 + w * 10], lb: [-18 - w * 28, -30 - w * 8] }, x, y, d, { sx: .42, sy: .42 });
      }
      if (t < 62) { c.fillStyle = 'rgba(255,255,255,' + (1 - (t - 56) / 6) + ')'; c.fillRect(-8, -8, 272, 240); }
      if (t > 80) { label(c, 'BROKEN UP', lx, gy - 62, '#fff26a'); label(c, 'INTO 7 COMPETITORS', lx, gy - 54, '#fff'); }
    }
    if (gyy > -60) {
      for (let i = 0; i < 26; i++) R(c, i % 2 ? '#7a4a1e' : '#5a3410', gx - dir * (4 + i * 2.2), gyy - 6 - i * 3, 5, 5);
      R(c, '#0c0c14', gx - 25, gyy - 15, 50, 30); R(c, '#8a5424', gx - 24, gyy - 14, 48, 28); R(c, '#b87838', gx - 24, gyy - 14, 48, 3); R(c, '#5a3410', gx - 24, gyy + 10, 48, 4);
      R(c, '#f6c83a', gx - 18, gyy - 14, 4, 28); R(c, '#f6c83a', gx + 14, gyy - 14, 4, 28);
    }
  };

  // --- Emergency Economic Stabilization Act: the bailout ---
  DRAW.eesa = function (e) {
    const { c, t, lx, gy, L } = e, hx = -44 + t * 1.6, hy = 36 + Math.round(Math.sin(t * .2) * 2);
    const bx = lx > 216 ? lx - 24 : lx + 24, tr = (bx + 44) / 1.6, ty = gy - 13, fall = t - tr, by = Math.min(ty, hy + 14 + fall * fall * .16), landed = fall > 0 && by >= ty;
    e.once('ch0', () => e.sfx('chopper')); if (t > 70) e.once('ch1', () => e.sfx('chopper')); if (t > 140) e.once('ch2', () => e.sfx('chopper'));
    if (landed) {
      e.once('land', () => { e.sfx('thud'); e.sfx('cash'); e.shake(7); e.st.tl = t; e.set(e.W, 'facepalm'); });
      const a = t - e.st.tl; if (a > 12) e.once('yay', () => e.sfx('fanfare'));
      loser(e, e.mix(dizzy(t), e.P.win, (a - 10) / 10), null, 0, a > 20 ? -Math.abs(Math.sin(a * .2)) * 6 : 0);
      for (let i = 0; i < 26; i++) { const yy = ((i * 47 + a * (1.2 + (i % 4) * .4)) % 230) - 10; R(c, '#1a6a2a', (i * 61 + Math.sin(a * .1 + i) * 8 + 500) % 256, yy, 6, 3); R(c, '#6ad87a', (i * 61 + Math.sin(a * .1 + i) * 8 + 500) % 256 + 1, yy, 4, 1); }
      if (a > 24) { label(c, 'TOO BIG', lx, gy - 92, '#fff26a'); label(c, 'TO FAIL', lx, gy - 84, '#fff26a'); }
    } else loser(e, dizzy(t));
    if (fall > 0) {
      BF.disc(c, bx, by, 13, '#0c0c14'); R(c, '#0c0c14', bx - 6, by - 20, 12, 10); BF.disc(c, bx, by, 12, '#c8a060'); R(c, '#c8a060', bx - 5, by - 19, 10, 9); R(c, '#8a6a30', bx - 6, by - 12, 12, 2);
      R(c, '#e0c088', bx - 8, by - 6, 3, 6); BF.text(c, '$', bx, by - 6, '#1a6a2a', { align: 'center', scale: 2, shadow: false });
      if (landed) label(c, '$700B', bx, by - 32, '#6ad87a');
    }
    if (hx < 300) {
      R(c, '#0c0c14', hx - 17, hy - 1, 34, 16); R(c, '#3a5a3a', hx - 16, hy, 32, 14); R(c, '#2a422a', hx - 16, hy + 10, 32, 4); R(c, '#8ad8ff', hx + 6, hy + 2, 9, 6);
      R(c, '#3a5a3a', hx - 40, hy + 3, 26, 4); R(c, '#3a5a3a', hx - 42, hy - 3, 4, 10); R(c, '#111', hx - 2, hy - 4, 3, 4);
      R(c, '#ccc', t % 2 ? hx - 30 : hx - 14, hy - 6, t % 2 ? 60 : 28, 2); R(c, '#111', hx - 12, hy + 17, 26, 1); R(c, '#111', hx - 8, hy + 14, 1, 3); R(c, '#111', hx + 8, hy + 14, 1, 3);
      BF.text(c, 'TARP', hx - 12, hy + 5, '#fff', { shadow: false });
    }
  };

  BF.FATALITIES.forEach((f) => (f.draw = DRAW[f.id]));
})();
