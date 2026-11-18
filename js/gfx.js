/* Bank Fighter — pixel font, procedural fighter sprites, projectile sprites. */
(function () {
  const BF = (window.BF = window.BF || {});

  // ---------- 5px bitmap font ----------
  const G = {
    ' ': '...|...|...|...|...',
    A: '.###.|#...#|#####|#...#|#...#', B: '####.|#...#|####.|#...#|####.', C: '.####|#....|#....|#....|.####',
    D: '####.|#...#|#...#|#...#|####.', E: '#####|#....|####.|#....|#####', F: '#####|#....|####.|#....|#....',
    G: '.####|#....|#..##|#...#|.####', H: '#...#|#...#|#####|#...#|#...#', I: '###|.#.|.#.|.#.|###',
    J: '..###|...#.|...#.|#..#.|.##..', K: '#...#|#..#.|###..|#..#.|#...#', L: '#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#', O: '.###.|#...#|#...#|#...#|.###.',
    P: '####.|#...#|####.|#....|#....', Q: '.###.|#...#|#...#|#..#.|.##.#', R: '####.|#...#|####.|#..#.|#...#',
    S: '.####|#....|.###.|....#|####.', T: '#####|..#..|..#..|..#..|..#..', U: '#...#|#...#|#...#|#...#|.###.',
    V: '#...#|#...#|#...#|.#.#.|..#..', W: '#...#|#...#|#.#.#|##.##|#...#', X: '#...#|.#.#.|..#..|.#.#.|#...#',
    Y: '#...#|.#.#.|..#..|..#..|..#..', Z: '#####|...#.|..#..|.#...|#####',
    0: '.###.|#..##|#.#.#|##..#|.###.', 1: '.#.|##.|.#.|.#.|###', 2: '####.|....#|.###.|#....|#####',
    3: '####.|....#|.###.|....#|####.', 4: '#..#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|####.',
    6: '.###.|#....|####.|#...#|.###.', 7: '#####|....#|...#.|..#..|..#..', 8: '.###.|#...#|.###.|#...#|.###.',
    9: '.###.|#...#|.####|....#|.###.',
    '!': '#|#|#|.|#', '?': '###.|...#|.##.|....|.#..', '.': '.|.|.|.|#', ',': '..|..|..|.#|#.', '-': '...|...|###|...|...',
    ':': '.|#|.|#|.', "'": '#|#|.|.|.', '"': '#.#|#.#|...|...|...', '$': '.####|#.#..|.###.|..#.#|####.',
    '%': '#...#|...#.|..#..|.#...|#...#', '/': '....#|...#.|..#..|.#...|#....', '+': '...|.#.|###|.#.|...',
    '&': '.##..|#..#.|.##.#|#..#.|.##.#', '(': '.#|#.|#.|#.|.#', ')': '#.|.#|.#|.#|#.', '=': '...|###|...|###|...',
    '#': '.#.#.|#####|.#.#.|#####|.#.#.', '*': '#.#|.#.|#.#|...|...',
    '→': '..#..|...#.|#####|...#.|..#..', '←': '..#..|.#...|#####|.#...|..#..',
    '↑': '..#..|.###.|#.#.#|..#..|..#..', '↓': '..#..|..#..|#.#.#|.###.|..#..'
  };
  const GL = {};
  for (const k in G) GL[k] = G[k].split('|');

  BF.textW = function (s, sc) {
    sc = sc || 1; let w = 0;
    for (const ch of String(s).toUpperCase()) w += ((GL[ch] || GL[' '])[0].length + 1) * sc;
    return w - sc;
  };
  BF.text = function (c, s, x, y, col, o) {
    o = o || {}; s = String(s).toUpperCase();
    const sc = o.scale || 1, w = BF.textW(s, sc);
    if (o.align === 'center') x -= w / 2; else if (o.align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    const pass = (ox, oy, cl) => {
      c.fillStyle = cl; let cx = x + ox;
      for (const ch of s) {
        const g = GL[ch] || GL[' '];
        for (let r = 0; r < 5; r++) { const row = g[r]; for (let i = 0; i < row.length; i++) if (row[i] === '#') c.fillRect(cx + i * sc, y + oy + r * sc, sc, sc); }
        cx += (g[0].length + 1) * sc;
      }
    };
    if (o.outline) { const oc = o.outline; pass(-sc, 0, oc); pass(sc, 0, oc); pass(0, -sc, oc); pass(0, sc, oc); pass(sc, sc, oc); }
    else if (o.shadow !== false) pass(sc, sc, o.shadow || '#000');
    pass(0, 0, col);
  };

  // ---------- helpers ----------
  BF.disc = function (c, x, y, r, col) {
    c.fillStyle = col; x = Math.round(x); y = Math.round(y);
    for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); c.fillRect(x - w, y + dy, w * 2 + 1, 1); }
  };
  function mk(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }

  // ---------- heads (drawn around 0,0 facing +x) ----------
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  function human(c, p) {
    R(c, p.skin, -5, -6, 10, 12); R(c, 'rgba(0,0,0,.18)', -5, 4, 10, 2);
    R(c, '#000', 2, -2, 2, 2); R(c, '#7a3a2a', 2, 3, 3, 1);
  }
  const HEADS = {
    slick(c, p) { human(c, p); R(c, p.hair, -6, -8, 11, 4); R(c, p.hair, -6, -5, 3, 6); R(c, p.hair, 3, -9, 4, 2);
      R(c, '#111', -1, -3, 7, 3); R(c, '#8fd8ff', 1, -3, 2, 1); },
    hardhat(c, p) { human(c, p); R(c, p.hair, -5, -5, 2, 5); R(c, '#f6d220', -6, -10, 12, 5); R(c, '#c8a410', -6, -6, 14, 2); R(c, '#fff', -3, -9, 3, 1);
      R(c, '#555', -2, -2, 1, 6); R(c, '#555', -2, 3, 6, 1); R(c, '#222', 4, 2, 2, 2); },
    bowler(c, p) { human(c, p); R(c, p.hair, -5, -5, 3, 6); R(c, '#151515', -5, -11, 10, 6); R(c, '#151515', -7, -6, 14, 2); R(c, '#444', -5, -7, 10, 1);
      R(c, '#d8b040', 1, -3, 4, 4); R(c, '#bfe8ff', 2, -2, 2, 2); R(c, p.hair, 1, 2, 5, 2); },
    fedora(c, p) { human(c, p); R(c, '#3a3020', -5, -11, 10, 5); R(c, '#3a3020', -8, -7, 17, 2); R(c, '#1a1a1a', -5, -8, 10, 1);
      R(c, '#111', -1, -3, 7, 2); },
    bear(c, p) { R(c, p.skin, -7, -7, 14, 14); R(c, p.skin, -8, -10, 5, 5); R(c, p.skin, 3, -10, 5, 5); R(c, p.hair, -7, -9, 3, 3); R(c, p.hair, 4, -9, 3, 3);
      R(c, '#d0a878', 2, -1, 7, 6); R(c, '#111', 7, -1, 2, 2); R(c, '#111', 1, -4, 2, 2); R(c, '#5a2a1a', 4, 3, 4, 1); R(c, 'rgba(0,0,0,.2)', -7, 5, 14, 2); },
    vial(c, p) { R(c, '#111', -5, -11, 10, 3); R(c, '#cfeaf4', -4, -8, 8, 15); R(c, '#9fcfe0', -4, 6, 8, 1);
      R(c, p.accent, -3, -1, 6, 7); R(c, '#ff6a7a', -3, -1, 6, 1); R(c, '#fff', -3, -7, 1, 5); R(c, '#111', 0, -5, 2, 2); R(c, '#111', 3, -5, 1, 2); },
    coin(c, p) { R(c, p.suit, -8, -8, 6, 15); R(c, p.dark, -8, -8, 2, 15);
      BF.disc(c, 1, -1, 7, '#b88a10'); BF.disc(c, 1, -1, 6, '#f6c83a'); R(c, '#fff0a0', -2, -6, 3, 1);
      R(c, '#111', 1, -3, 2, 2); R(c, '#111', 5, -3, 1, 2); R(c, '#8a6408', 2, 2, 4, 1); R(c, '#8a6408', 5, 1, 1, 1); },
    pyramid(c, p) { for (let i = 0; i < 17; i++) { c.fillStyle = i % 4 === 3 ? '#a87c10' : '#e8b820'; c.fillRect(-(i >> 1) - 1, -11 + i, i + 2, 1); }
      R(c, '#fff', -2, -3, 6, 4); R(c, '#111', 1, -2, 2, 2); R(c, '#a87c10', -2, -4, 6, 1); },
    house(c, p) { for (let i = 0; i < 7; i++) R(c, i === 6 ? '#7a1c16' : p.hair, -1 - i, -11 + i, 3 + i * 2, 1);
      R(c, p.hair, 3, -12, 2, 4); R(c, '#f4ead0', -6, -4, 13, 10); R(c, '#c8bc9c', -6, 5, 13, 1);
      R(c, '#3a6ad8', 0, -2, 2, 3); R(c, '#3a6ad8', 4, -2, 2, 3); R(c, '#7a3a2a', 1, 3, 4, 1); }
  };

  // ---------- puppet ----------
  const BW = 128, BH = 112, OX = 64, OY = 100, D = Math.PI / 180;
  const buf = mk(BW, BH), sil = mk(BW, BH), out = mk(BW, BH);
  const bc = buf.getContext('2d'), sc2 = sil.getContext('2d'), oc = out.getContext('2d');
  BF.SPR = { W: BW, H: BH, OX, OY };

  function limb(c, a, b, th, col) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y))));
    c.fillStyle = col; const h = th / 2;
    for (let i = 0; i <= n; i++) c.fillRect(Math.round(a.x + (b.x - a.x) * i / n - h), Math.round(a.y + (b.y - a.y) * i / n - h), th, th);
  }
  const DEF = { l: 8, r: 0, af: [35, 140], ab: [-5, 115], lf: [22, -8], lb: [-18, -30] };

  BF.renderFighter = function (ch, pose, o) {
    o = o || {};
    const p = Object.assign({}, DEF, pose), pal = ch.pal, th = ch.th || 4, bw = ch.bw || 11;
    const T = 19, UA = 9, FA = 9, TH = 12, SH = 12, rot = p.r, ta = (p.l + rot) * D;
    const seg = (o2, a, len) => ({ x: o2.x + Math.sin((a - rot) * D) * len, y: o2.y + Math.cos((a - rot) * D) * len });
    const hip = { x: 0, y: 0 }, sh = { x: Math.sin(ta) * T, y: -Math.cos(ta) * T };
    const hd = { x: sh.x + Math.sin(ta) * 9, y: sh.y - Math.cos(ta) * 9 };
    const kf = seg(hip, p.lf[0], TH), ff = seg(kf, p.lf[1], SH), kb = seg(hip, p.lb[0], TH), fb = seg(kb, p.lb[1], SH);
    const ef = seg(sh, p.af[0], UA), hf = seg(ef, p.af[1], FA), eb = seg(sh, p.ab[0], UA), hb = seg(eb, p.ab[1], FA);
    const lie = Math.abs(Math.sin(rot * D));
    const low = Math.max(ff.y, fb.y, hip.y, sh.y, hd.y) + 2 + lie * (bw / 2 - 1);
    const pts = [hip, sh, hd, kf, ff, kb, fb, ef, hf, eb, hb];
    for (const q of pts) { q.x += OX; q.y += OY - low; }

    bc.clearRect(0, 0, BW, BH);
    const shin = ch.shorts ? pal.skin : pal.pants, shinD = ch.shorts ? '#b8946e' : pal.dark;
    // back arm, back leg
    limb(bc, sh, eb, th, pal.dark); limb(bc, eb, hb, th, pal.dark); limb(bc, hb, hb, th + 1, ch.head === 'bear' ? pal.hair : '#c89a78');
    limb(bc, hip, kb, th + 1, pal.dark); limb(bc, kb, fb, th, shinD);
    bc.fillStyle = pal.shoe; bc.fillRect(Math.round(fb.x - 2), Math.round(fb.y - 1), lie > .5 ? 4 : 7, 3);
    // front leg
    limb(bc, hip, kf, th + 1, pal.pants); limb(bc, kf, ff, th, shin);
    bc.fillStyle = pal.shoe; bc.fillRect(Math.round(ff.x - 2), Math.round(ff.y - 1), lie > .5 ? 4 : 7, 3);
    // torso
    limb(bc, hip, hip, bw - 1, pal.pants);
    const t0 = { x: hip.x + (sh.x - hip.x) * .2, y: hip.y + (sh.y - hip.y) * .2 };
    limb(bc, t0, sh, bw, pal.suit);
    const fx = Math.cos(ta) * (bw / 2 - 2), fy = Math.sin(ta) * (bw / 2 - 2);
    const m = { x: (hip.x + sh.x) / 2 + fx, y: (hip.y + sh.y) / 2 + fy }, s2 = { x: sh.x + fx, y: sh.y + fy };
    limb(bc, s2, m, 3, pal.front); limb(bc, s2, m, 1, pal.accent);
    const bx = -Math.cos(ta) * (bw / 2 - 1), by = -Math.sin(ta) * (bw / 2 - 1);
    limb(bc, { x: sh.x + bx, y: sh.y + by }, { x: t0.x + bx, y: t0.y + by }, 2, pal.dark);
    // head
    bc.save(); bc.translate(Math.round(hd.x), Math.round(hd.y));
    const deg = p.l + rot; if (deg < -50) bc.rotate(-Math.PI / 2); else if (deg > 50) bc.rotate(Math.PI / 2);
    HEADS[ch.head](bc, pal); bc.restore();
    // front arm
    limb(bc, sh, ef, th, pal.suit); limb(bc, ef, hf, th, pal.suit); limb(bc, hf, hf, th + 1, ch.head === 'bear' ? pal.skin : pal.skin);
    if (p.cuffs) { bc.fillStyle = '#f6d23a'; bc.fillRect(Math.round(hf.x - 4), Math.round(hf.y - 3), 8, 3); bc.fillRect(Math.round(hb.x - 4), Math.round(hb.y - 3), 8, 3); }

    // outline
    sc2.globalCompositeOperation = 'source-over'; sc2.clearRect(0, 0, BW, BH); sc2.drawImage(buf, 0, 0);
    sc2.globalCompositeOperation = 'source-in'; sc2.fillStyle = o.outline || '#0c0c14'; sc2.fillRect(0, 0, BW, BH);
    oc.globalCompositeOperation = 'source-over'; oc.clearRect(0, 0, BW, BH);
    oc.drawImage(sil, -1, 0); oc.drawImage(sil, 1, 0); oc.drawImage(sil, 0, -1); oc.drawImage(sil, 0, 1);
    oc.drawImage(buf, 0, 0);
    if (o.flash) { oc.globalCompositeOperation = 'source-atop'; oc.fillStyle = o.flash; oc.fillRect(0, 0, BW, BH); oc.globalCompositeOperation = 'source-over'; }
    BF._hand = { x: hf.x - OX, y: hf.y - OY }; BF._head = { x: hd.x - OX, y: hd.y - OY };
    return out;
  };

  // o: {sx, sy, alpha, flash, clip:[sx,sw]}
  BF.drawFighter = function (c, ch, pose, x, y, facing, o) {
    o = o || {};
    const img = BF.renderFighter(ch, pose, o);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(facing * (o.sx || 1), o.sy || 1);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    if (o.clip) c.drawImage(img, o.clip[0], 0, o.clip[1], BH, o.clip[0] - OX, -OY, o.clip[1], BH);
    else c.drawImage(img, -OX, -OY);
    c.restore();
  };

  const portraits = {};
  BF.portrait = function (ch) {
    if (portraits[ch.id]) return portraits[ch.id];
    const img = BF.renderFighter(ch, { l: 0, af: [10, 20], ab: [-10, 0], lf: [5, 0], lb: [-5, -5] });
    const pc = mk(26, 26), x = pc.getContext('2d');
    x.fillStyle = ch.pal.dark; x.fillRect(0, 0, 26, 26); x.fillStyle = ch.pal.suit; x.fillRect(0, 0, 26, 13);
    x.drawImage(img, OX - 13, OY - 66, 26, 26, 0, 0, 26, 26);
    return (portraits[ch.id] = pc);
  };

  // ---------- projectiles ----------
  BF.drawProj = function (c, q, x, y, t) {
    x = Math.round(x); y = Math.round(y); const d = q.vx >= 0 ? 1 : -1, f = (t >> 2) & 1;
    switch (q.kind) {
      case 'arrow':
        for (let i = 0; i < 4; i++) R(c, i % 2 === f ? '#3aff6a' : '#baffc8', x - d * (8 - i * 5) - 2, y + 3 - i * 2, 5, 3);
        R(c, '#fff', x + d * 8 - 2, y - 6, 4, 4); R(c, '#3aff6a', x + d * 11 - 1, y - 8, 3, 3); break;
      case 'text': BF.text(c, q.label, x, y - 3, f ? '#fff26a' : '#fff', { align: 'center', outline: '#a34d14' }); break;
      case 'swap': BF.text(c, f ? '←→' : '→←', x, y - 3, f ? '#ff9a3a' : '#6ac8ff', { align: 'center', outline: '#201008' }); break;
      case 'paper': R(c, '#1a1a1a', x - 5, y - 5, 10, 10); R(c, f ? '#e8e0c8' : '#d0c8b0', x - 4, y - 4, 8, 8); R(c, '#b02a2a', x - 3, y - 2 + f, 6, 1); R(c, '#888', x - 3, y + 1 - f, 5, 1); break;
      case 'drop': R(c, '#5a0812', x - 3, y - 3, 6, 6); R(c, '#e8203a', x - 2, y - 2, 4, 4); R(c, '#ff9aa8', x - 1, y - 2, 1, 1); R(c, '#e8203a', x - d * 4, y - 1, 2, 1); break;
      case 'dot': R(c, '#201030', x - 3, y - 3, 6, 6); R(c, ['#ff5ad8', '#5affe8', '#fff26a'][q.n % 3], x - 2, y - 2, 4, 4); break;
      case 'wave':
        for (let i = 0; i < 5; i++) R(c, i % 2 === f ? '#3a8aff' : '#8ac8ff', x - 9 + i * 4, y - 3 - (i === 2 ? 4 : i % 2 ? 2 : 0) + (f ? 1 : 0), 4, 10);
        R(c, '#fff', x - 3, y - 8 + f, 3, 2); R(c, '#f6c83a', x + 3, y - 2, 2, 2); R(c, '#f6c83a', x - 6, y + 1, 2, 2); break;
      case 'pyramid': { const s = Math.round(q.size || 6);
        for (let i = 0; i < s * 2; i++) { c.fillStyle = (i + (f ? 1 : 0)) % 4 === 0 ? '#a87c10' : '#f6c83a'; c.fillRect(x - (i >> 1) - 1, y - s + i, (i >> 1) * 2 + 2, 1); }
        R(c, '#111', x - 1, y - 1, 2, 2); break; }
      case 'doc': { const w = q.w, h = q.h; R(c, '#1a1a1a', x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2); R(c, '#f4f0e4', x - w / 2, y - h / 2, w, h);
        R(c, '#b0a890', x - w / 2 + 2, y + h / 2 - 3, w - 4, 1); BF.text(c, q.label, x, y - 4, '#1a2a6a', { align: 'center', shadow: false }); break; }
    }
  };

  // little auditor for the Sarbanes-Oxley finisher
  BF.drawAuditor = function (c, x, y, frame, dir, i) {
    x = Math.round(x); y = Math.round(y); const f = (frame >> 2) & 1;
    R(c, '#0c0c14', x - 4, y - 19, 8, 19);
    R(c, ['#f0c8a0', '#c89a70', '#8a5a3a'][i % 3], x - 2, y - 18, 5, 5); R(c, '#222', x - 2, y - 19, 5, 2);
    R(c, '#111', x + (dir > 0 ? 1 : -1), y - 16, 2, 1);
    R(c, i % 2 ? '#5a5a66' : '#44445a', x - 3, y - 13, 7, 8);
    R(c, '#fff', x + dir * 3 - 1, y - 12, 4, 5); R(c, '#888', x + dir * 3, y - 10, 2, 1);
    R(c, '#22222a', x - 3 + (f ? 0 : 1), y - 5, 2, 5); R(c, '#22222a', x + 1 - (f ? 0 : 1), y - 5, 2, 5);
  };
})();
