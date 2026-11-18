/* Bank Fighter — procedural stage backdrops. draw(c, cam, t) */
(function () {
  const BF = (window.BF = window.BF || {});
  const W = 256, FT = 172; // floor top
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const hash = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

  function bands(c, cols, y0, y1) { const h = (y1 - y0) / cols.length; cols.forEach((col, i) => R(c, col, 0, y0 + i * h, W, Math.ceil(h))); }
  function skyline(c, cam, par, seed, base, col, win, t) {
    const bw = 34, first = Math.floor(cam * par / bw) - 1;
    for (let i = first; i < first + 10; i++) {
      const x = i * bw - cam * par, h = 30 + hash(i, seed) * 70, w = bw - 2 - hash(i, seed + 1) * 8;
      R(c, col, x, base - h, w, h);
      if (win) for (let wy = 4; wy < h - 4; wy += 7) for (let wx = 3; wx < w - 4; wx += 6)
        if (hash(i * 31 + wx, wy + seed) > .45) R(c, win, x + wx, base - h + wy, 3, 4);
    }
  }
  function floor(c, cam, a, b, line) {
    for (let y = FT; y < 224; y += 4) R(c, ((y - FT) >> 2) % 2 ? a : b, 0, y, W, 4);
    R(c, line, 0, FT, W, 1);
    c.fillStyle = line;
    for (let y = FT + 1; y < 224; y++) { const par = 1 + (y - 200) / 60; for (let k = -2; k < 16; k++) { const sx = Math.round(128 + (k * 48 - cam - 128 + 0) * par); if (sx >= 0 && sx < W) c.fillRect(sx, y, 1, 1); } }
  }
  function ticker(c, y, t, str, col, bg, h) {
    R(c, bg, 0, y, W, h || 9); const w = BF.textW(str) + 12, off = Math.floor(t * .6) % w;
    for (let x = -off; x < W; x += w) BF.text(c, str, x, y + 2, col, { shadow: false });
  }
  function wallPanels(c, cam, step, col, y0, y1) { for (let x = -(cam % step); x < W; x += step) R(c, col, x, y0, 1, y1 - y0); }

  BF.STAGES = {
    houston: { name: 'HOUSTON HQ, MIDNIGHT', draw(c, cam, t) {
      bands(c, ['#0a0a2a', '#10103a', '#1a144a', '#2a1a5a', '#3a2068', '#4a2a70'], 0, FT);
      BF.disc(c, 200 - cam * .05, 34, 13, '#f4f0c8'); BF.disc(c, 195 - cam * .05, 31, 3, '#d8d4a8');
      for (let i = 0; i < 30; i++) R(c, '#fff', hash(i, 1) * W, hash(i, 2) * 90, 1, 1);
      skyline(c, cam, .25, 3, FT, '#1a1440', null); skyline(c, cam, .5, 7, FT, '#0e0c28', '#f6d83a');
      const tx = 210 - cam * .8; R(c, '#060614', tx - 26, 40, 52, FT - 40); R(c, '#12122c', tx - 22, 44, 44, FT - 44);
      for (let y = 50; y < FT - 6; y += 9) for (let x = -18; x < 18; x += 8) R(c, hash(x, y) > .5 ? '#8ac8ff' : '#1a2a4a', tx + x, y, 5, 5);
      for (let i = 0; i < 26; i++) R(c, '#e8e8e8', (i * 37 + t * .3 * (1 + i % 3)) % W, (i * 53 + t * (.5 + (i % 4) * .2)) % FT, 1, 3);
      floor(c, cam, '#2a2a3a', '#323246', '#4a4a66');
    } },
    serverfarm: { name: 'SERVER FARM, CLINTON MS', draw(c, cam, t) {
      bands(c, ['#061a1a', '#082222', '#0a2a2a'], 0, FT);
      for (let i = 0; i < 12; i++) { const x = i * 44 - cam + 6; if (x < -44 || x > W) continue;
        R(c, '#020a0a', x, 36, 36, FT - 36); R(c, '#10201f', x + 2, 38, 32, FT - 40);
        for (let y = 42; y < FT - 6; y += 6) { R(c, '#061010', x + 4, y, 28, 4);
          R(c, hash(i * 9 + y, (t / 14) | 0) > .4 ? '#3aff6a' : '#0a3a1a', x + 6, y + 1, 2, 2);
          R(c, hash(i * 5 + y, (t / 23) | 0) > .8 ? '#ff3a3a' : '#f6a020', x + 10, y + 1, 2, 2); } }
      R(c, '#030c0c', 0, 0, W, 30);
      for (let i = 0; i < 5; i++) { R(c, ['#e8762a', '#3a8aff', '#f6d83a', '#e23d3d', '#aaa'][i], 0, 8 + i * 4, W, 2); }
      for (let x = -(cam % 60); x < W; x += 60) R(c, '#1a2a2a', x, 4, 3, 26);
      floor(c, cam, '#1a2a2e', '#20343a', '#3a5a60');
    } },
    trading: { name: 'THE TRADING FLOOR', draw(c, cam, t) {
      bands(c, ['#101018', '#16161f', '#1c1c28'], 0, FT);
      for (let i = 0; i < 14; i++) for (let j = 0; j < 3; j++) { const x = i * 38 - cam * .9 + 4, y = 28 + j * 30; if (x < -40 || x > W) continue;
        R(c, '#05050a', x, y, 34, 26); R(c, '#0a1420', x + 2, y + 2, 30, 22);
        const up = hash(i, j) > .7; let py = up ? 18 : 6;
        for (let k = 0; k < 13; k++) { py += (up ? -1 : 1) * hash(i * 7 + k, j + ((t / 30) | 0)) * 2.2 - (up ? -.5 : .5) * .6; py = Math.max(3, Math.min(20, py)); R(c, up ? '#3aff6a' : '#ff3a3a', x + 3 + k * 2, y + 2 + py, 2, 2); } }
      ticker(c, 122, t, 'BSC 2.00 -98%   LEH 0.21 -94%   WM 0.16 -91%   ENE 0.26 -99%   WCOM 0.06 -99%   FTT 1.30 -97%   ', '#ff4a3a', '#1a0505');
      for (let i = 0; i < 9; i++) { const x = i * 64 - cam + 10; R(c, '#22222e', x, FT - 26, 46, 26); R(c, '#0a1420', x + 6, FT - 40, 16, 13); R(c, '#3a8aff', x + 8, FT - 38, 12, 9); R(c, '#0a1420', x + 26, FT - 38, 14, 11); }
      floor(c, cam, '#3a2a48', '#42304f', '#6a5080');
    } },
    seventh: { name: '745 SEVENTH AVENUE', draw(c, cam, t) {
      bands(c, ['#2a1a4a', '#5a2a5a', '#9a3a52', '#d8603a', '#f69a3a', '#f6c86a'], 0, FT);
      BF.disc(c, 70 - cam * .05, 120, 20, '#fff0a0');
      skyline(c, cam, .3, 11, FT, '#4a2a4a', null); skyline(c, cam, .55, 5, FT, '#22142e', '#f6c86a');
      const bx = 60 - cam * .85; R(c, '#101822', bx, 20, 220, FT - 20);
      for (let y = 26; y < 100; y += 10) for (let x = 6; x < 214; x += 12) R(c, hash(x, y) > .35 ? '#2a4a5a' : '#f6e8a0', bx + x, y, 8, 6);
      c.save(); c.beginPath(); c.rect(Math.max(0, bx), 104, 220, 30); c.clip();
      ticker(c, 106, t, 'LEHMAN BROTHERS   CHAPTER 11   $639 BILLION   SEPT 15 2008   ', '#3aff9a', '#04140c', 11);
      ticker(c, 120, t * 1.4, 'DOW -504   LIBOR SPIKES   MONEY MARKET BREAKS THE BUCK   ', '#ff9a3a', '#140a04', 11); c.restore();
      R(c, '#0a0f16', bx + 80, 140, 60, FT - 140); R(c, '#2a4a5a', bx + 86, 146, 22, FT - 146); R(c, '#2a4a5a', bx + 112, 146, 22, FT - 146);
      floor(c, cam, '#5a5560', '#666070', '#8a8494');
    } },
    lab: { name: 'THE LAB, PALO ALTO', draw(c, cam, t) {
      bands(c, ['#d8ece8', '#cfe6e2', '#c4dfda'], 0, FT); wallPanels(c, cam, 52, '#a8c8c2', 0, FT);
      for (let i = 0; i < 9; i++) { const x = i * 70 - cam + 8; R(c, '#7a9a96', x, 60, 56, 3); R(c, '#7a9a96', x, 96, 56, 3);
        for (let k = 0; k < 7; k++) { R(c, '#eefaff', x + 3 + k * 7, 49, 4, 11); R(c, hash(i, k) > .3 ? '#d8203a' : '#f6c83a', x + 3 + k * 7, 54 + (hash(k, i) * 3 | 0), 4, 6 - (hash(k, i) * 3 | 0)); R(c, '#111', x + 3 + k * 7, 47, 4, 2); }
        for (let k = 0; k < 4; k++) R(c, '#eefaff', x + 6 + k * 12, 84, 8, 12); }
      const mx = 190 - cam; R(c, '#0c0c10', mx, 108, 70, FT - 108); R(c, '#1c1c24', mx + 3, 111, 64, 30); R(c, '#0a2a1a', mx + 8, 116, 30, 18);
      BF.text(c, (t >> 5) % 2 ? 'ERROR' : '', mx + 10, 122, '#3aff6a', { shadow: false }); R(c, (t >> 4) % 2 ? '#ff3a3a' : '#5a0a0a', mx + 50, 118, 5, 5); R(c, '#f6c83a', mx + 58, 118, 5, 5);
      R(c, '#8ab0aa', 0, FT - 8, W, 8);
      floor(c, cam, '#e4eeec', '#d4e2df', '#9ab8b2');
    } },
    beach: { name: 'NASSAU BEACHFRONT', draw(c, cam, t) {
      bands(c, ['#3ac8e8', '#5ad4ec', '#8ae0f0', '#b8ecf0', '#f6e0b8', '#f6c8a0'], 0, 120);
      BF.disc(c, 180 - cam * .05, 70, 16, '#fff6c0');
      for (let i = 0; i < 4; i++) { const x = (i * 90 + t * .05) % 340 - 40 - cam * .1; R(c, '#fff', x, 26 + i * 9, 30, 5); R(c, '#fff', x + 6, 22 + i * 9, 16, 5); }
      for (let y = 120; y < FT; y += 4) { R(c, ((y >> 2) % 2) ? '#1a7ac8' : '#2a8ad8', 0, y, W, 4); for (let i = 0; i < 8; i++) R(c, '#8ad8ff', (hash(i, y) * 300 + t * .2 * (1 + (y % 3))) % W, y + 1, 6, 1); }
      const yx = 300 - cam * .5; R(c, '#f4f4f4', yx, 132, 60, 10); R(c, '#f4f4f4', yx + 14, 124, 30, 8); R(c, '#1e9a9a', yx, 140, 60, 2);
      for (let i = 0; i < 6; i++) { const x = i * 110 - cam * .8 + 30; for (let k = 0; k < 14; k++) R(c, '#6a4a2a', x + Math.sin(k * .25) * 6, FT - k * 6, 5, 6);
        const tx = x + Math.sin(13 * .25) * 6 + 2, ty = FT - 84; for (let a = 0; a < 6; a++) for (let k = 0; k < 9; k++) R(c, k % 2 ? '#1a8a3a' : '#2aa84a', tx + Math.cos(a * 1.05) * k * 3.4, ty + Math.sin(a * 1.05) * k * 1.4 + k * k * .22, 5, 3); }
      floor(c, cam, '#f0d8a0', '#e8cc90', '#c8a868');
    } },
    penthouse: { name: 'THE 17TH FLOOR', draw(c, cam, t) {
      bands(c, ['#2a140c', '#321a10', '#3a2014'], 0, FT); wallPanels(c, cam, 40, '#1e0e08', 0, FT);
      const wx = 150 - cam * .9; R(c, '#d8a820', wx - 3, 22, 126, 96); R(c, '#080818', wx, 25, 120, 90);
      c.save(); c.beginPath(); c.rect(Math.max(0, wx), 25, 120, 90); c.clip(); skyline(c, cam, .4, 9, 115, '#12122e', '#f6d83a'); c.restore();
      R(c, '#d8a820', wx + 59, 25, 2, 90);
      for (let i = 0; i < 8; i++) { const x = i * 120 - cam + 20; if (x > wx - 70 && x < wx + 130) continue;
        R(c, '#d8a820', x, 50, 54, 40); R(c, '#f4ead0', x + 3, 53, 48, 34); for (let k = 0; k < 22; k++) R(c, '#1a8a3a', x + 5 + k * 2, 82 - k, 2, 2); R(c, '#888', x + 5, 84, 44, 1); }
      for (let i = 0; i < 6; i++) { const x = i * 150 - cam + 80; R(c, '#1a1a1a', x, FT - 34, 40, 34); R(c, '#e8e8e8', x + 6, FT - 40 + ((t >> 3) % 4), 28, 8); R(c, '#3aff6a', x + 32, FT - 28, 3, 3); }
      R(c, '#1a0c06', 0, FT - 6, W, 6);
      floor(c, cam, '#6a3a1a', '#7a4420', '#4a2810');
    } },
    vault: { name: 'THE VAULT, SEATTLE', draw(c, cam, t) {
      bands(c, ['#3a4250', '#444c5c', '#4e5868'], 0, FT); wallPanels(c, cam, 64, '#2a303c', 0, FT);
      for (let x = -(cam % 64); x < W; x += 64) for (let y = 12; y < FT; y += 40) { R(c, '#6a7488', x + 4, y, 2, 2); R(c, '#6a7488', x + 58, y, 2, 2); }
      const vx = 210 - cam, vy = 96; BF.disc(c, vx, vy, 66, '#1a1e28'); BF.disc(c, vx, vy, 62, '#8a94a8'); BF.disc(c, vx, vy, 54, '#6a7488'); BF.disc(c, vx, vy, 50, '#9aa4b8');
      for (let a = 0; a < 12; a++) BF.disc(c, vx + Math.cos(a * .5236) * 58, vy + Math.sin(a * .5236) * 58, 2, '#3a4250');
      BF.disc(c, vx, vy, 16, '#3a4250'); BF.disc(c, vx, vy, 12, '#d8b040');
      const sp = t * .01; for (let a = 0; a < 4; a++) for (let k = 0; k < 26; k++) R(c, '#d8b040', vx + Math.cos(sp + a * 1.5708) * k - 1, vy + Math.sin(sp + a * 1.5708) * k - 1, 3, 3);
      for (let i = 0; i < 5; i++) { const x = i * 190 - cam - 30; for (let k = 0; k < 4; k++) { R(c, '#d8b040', x + k * 3, FT - 8 - k * 7, 40 - k * 6, 7); R(c, '#f6e08a', x + k * 3, FT - 8 - k * 7, 40 - k * 6, 1); } }
      floor(c, cam, '#5a6274', '#646c80', '#8a94a8');
    } },
    hearing: { name: 'SENATE HEARING ROOM', draw(c, cam, t) {
      bands(c, ['#3a1a1a', '#44201e', '#4e2622'], 0, FT);
      for (let x = -((cam * .9) % 80); x < W; x += 80) { R(c, '#7a1c1c', x, 0, 26, 110); R(c, '#5a1010', x + 8, 0, 4, 110); R(c, '#d8b040', x, 110, 26, 3); }
      R(c, '#3a2212', 0, 118, W, FT - 118); R(c, '#5a3a1e', 0, 118, W, 4); R(c, '#2a160a', 0, 150, W, 2);
      for (let i = 0; i < 9; i++) { const x = i * 50 - cam * .95 + 14; R(c, '#0c0c14', x + 2, 100, 20, 18); R(c, '#0c0c14', x + 6, 88, 12, 12);
        R(c, '#f4ead0', x, 124, 24, 7); R(c, '#111', x + 3, 127, 18, 1); R(c, '#111', x + 12, 110 + ((t >> 4) + i) % 3, 1, 8); }
      floor(c, cam, '#5a1c1c', '#641f1f', '#8a3030');
    } }
  };
})();
