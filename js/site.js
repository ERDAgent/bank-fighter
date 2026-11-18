/* Bank Fighter — website chrome and data-driven pages. */
(function () {
  const BF = window.BF, page = document.body.dataset.page, $ = (s) => document.querySelector(s);
  const NAV = [['index.html', 'Home', 'home'], ['play.html', 'Play', 'play'], ['roster.html', 'Roster', 'roster'], ['moves.html', 'Moves', 'moves'], ['legislation.html', 'Legislation', 'legislation']];
  document.body.insertAdjacentHTML('afterbegin', '<nav class="nav"><div class="nav-in"><a class="brand" href="index.html">BANK FIGHTER</a>' +
    NAV.map((n) => `<a class="l${n[2] === page ? ' on' : ''}" href="${n[0]}">${n[1].toUpperCase()}</a>`).join('') + '</div></nav>');
  document.body.insertAdjacentHTML('beforeend', '<footer><p>Bank Fighter is a work of parody. The fighters are original fictional mascots, not depictions of real people, and the game is not affiliated with or endorsed by any company named in it.</p><p>Company histories are summarized from the public record. Nothing here is investment advice. Obviously.</p></footer>');

  const cmd = (c) => ({ '236P': '↓ → + P', '214K': '↓ ← + K', '22P': '↓ ↓ + P' }[c] || c);
  const kbd = (s) => s.split(' ').map((k) => (k === '+' || k === ',' ? k : `<kbd>${k}</kbd>`)).join(' ');
  const POSE = { cast: { l: 20, af: [84, 90], ab: [70, 96], lf: [34, -2], lb: [-32, -44] }, win: { l: -2, af: [165, 178], ab: [-15, 100], lf: [12, 0], lb: [-12, -18] } };
  function sprite(ch, pose, cls) {
    const cv = document.createElement('canvas'); cv.width = 66; cv.height = 75; if (cls) cv.className = cls;
    BF.drawFighter(cv.getContext('2d'), ch, pose || {}, 31, 72, 1); return cv;
  }
  function portrait(ch) { const cv = document.createElement('canvas'); cv.width = cv.height = 26; cv.getContext('2d').drawImage(BF.portrait(ch), 0, 0); return cv; }
  const fighters = () => BF.ROSTER.map((id) => BF.FIGHTERS[id]);

  if (page === 'home') {
    const strip = $('#strip');
    fighters().forEach((ch) => { const a = document.createElement('a'); a.href = 'roster.html#' + ch.id; a.append(portrait(ch), ch.name); strip.append(a); });
    // hero diorama
    const cv = $('#hero'), c = cv.getContext('2d'), ids = BF.ROSTER; let t = 0;
    const drawHero = () => {
      t++; BF.STAGES.trading.draw(c, 80 + Math.sin(t * .01) * 60, t);
      const a = BF.FIGHTERS[ids[Math.floor(t / 180) % 8]], b = BF.FIGHTERS[ids[(Math.floor(t / 180) + 3) % 8]], k = (t % 180);
      const bob = (s) => ({ l: 8 + Math.sin(t * .1 + s), af: [35, 140 - Math.sin(t * .1 + s) * 5], lf: [22 + Math.sin(t * .1 + s) * 3, -8], lb: [-18 - Math.sin(t * .1 + s) * 3, -30] });
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(78, 201, 28, 3); c.fillRect(150, 201, 28, 3);
      BF.drawFighter(c, a, k > 60 && k < 80 ? POSE.cast : bob(0), 92, 200, 1); BF.drawFighter(c, b, k > 120 && k < 140 ? POSE.cast : bob(2), 164, 200, -1);
      BF.text(c, a.name, 12, 12, '#fff', { outline: '#000' }); BF.text(c, b.name, 244, 12, '#fff', { align: 'right', outline: '#000' });
      BF.text(c, a.specials[0].name, 12, 22, a.pal.accent, { outline: '#000' }); BF.text(c, b.specials[0].name, 244, 22, b.pal.accent, { align: 'right', outline: '#000' });
      BF.text(c, 'VS', 128, 10, '#f6c83a', { scale: 2, align: 'center', outline: '#000' });
    };
    drawHero(); setInterval(drawHero, 33);
  }

  if (page === 'roster') {
    const root = $('#roster');
    fighters().forEach((ch) => {
      const d = document.createElement('section'); d.className = 'panel card'; d.id = ch.id;
      d.innerHTML = `<div class="art"></div><div><h2>${ch.name}</h2><div class="who">${ch.mascot.toUpperCase()} &middot; “${ch.tagline}”</div>
        <div class="facts">${ch.full} &middot; ${ch.hq} &middot; Collapsed ${ch.fell}</div><p>${ch.bio}</p><p class="dim">In the ring: ${ch.mascotBio}</p>
        <p>${ch.specials.map((m) => `<kbd>${m.name}</kbd>`).join(' ')}</p></div>`;
      d.querySelector('.art').append(sprite(ch, null, 'spr')); root.append(d);
    });
  }

  if (page === 'moves' || page === 'play') {
    const row = (m, input) => `<tr><td>${kbd(input)}</td><td>${m.name}</td><td>${m.def}<br><span class="fx">${m.fx}</span></td></tr>`;
    if (page === 'moves') {
      $('#normals').innerHTML = '<table>' + Object.values(BF.NORMALS).map((m) => row(m, m.input)).join('') + BF.UNIVERSAL.map((m) => row(m, 'BLOCK (AIR)')).join('') + '</table>';
      const root = $('#specials');
      fighters().forEach((ch) => {
        const d = document.createElement('section'); d.className = 'panel mv'; d.id = ch.id;
        d.innerHTML = `<div class="hd"><span class="pt"></span><div><h2 style="margin:0">${ch.name}</h2><span class="tag">${ch.mascot.toUpperCase()}</span></div></div><table>${ch.specials.map((m) => row(m, cmd(m.cmd))).join('')}</table>`;
        d.querySelector('.pt').append(portrait(ch)); root.append(d);
      });
    } else {
      const show = (id) => { const ch = BF.FIGHTERS[id];
        $('#mvname').textContent = ch.name + ' SPECIALS';
        $('#mvlist').innerHTML = ch.specials.map((m) => `<tr><td>${kbd(cmd(m.cmd))}</td><td>${m.name}<br><span class="dim">${m.fx}</span></td></tr>`).join(''); };
      BF.onSelect = show; show('enron');
      $('#fatlist').innerHTML = BF.FATALITIES.map((f) => `<tr><td>${kbd(f.input)}</td><td>${f.short || f.name}</td></tr>`).join('');
    }
  }

  if (page === 'legislation') {
    const root = $('#laws'), ids = BF.ROSTER, views = [];
    BF.FATALITIES.forEach((fd, i) => {
      const d = document.createElement('section'); d.className = 'panel law'; d.id = fd.id;
      d.innerHTML = `<canvas width="256" height="224"></canvas><span class="yr">${fd.year}${fd.mercy ? ' &middot; MERCY FINISHER' : ''}</span><h2>${fd.name}</h2>
        <div class="pt">${fd.point.toUpperCase()}</div><p>${fd.law}</p><p><span class="tag">THE FINISHER</span><br>${fd.finisher}</p><p>${kbd(fd.input)}</p>`;
      root.append(d);
      views.push({ fd, c: d.querySelector('canvas').getContext('2d'), t: 0, st: { done: {} }, W: { ch: BF.FIGHTERS[ids[i]], x: 70, facing: 1, state: 'idle' }, L: { ch: BF.FIGHTERS[ids[(i + 4) % 8]], x: 176, facing: -1 },
        stage: BF.STAGES[['houston', 'seventh', 'trading', 'penthouse', 'vault'][i]] });
    });
    const step = () => views.forEach((v) => {
      const c = v.c; if (++v.t > v.fd.dur + 70) { v.t = 0; v.st = { done: {} }; v.W.state = 'idle'; }
      c.save(); v.stage.draw(c, 80, v.t); c.fillStyle = 'rgba(8,0,24,.45)'; c.fillRect(0, 0, 256, 224);
      BF.drawFighter(c, v.W.ch, BF.poseOf({ state: v.W.state, side: 0, t: 99 }), 70, 200, 1);
      v.fd.draw({ c, t: v.t, W: v.W, L: v.L, lx: 176, wx: 70, gy: 200, st: v.st, once(k, fn) { if (!v.st.done[k]) { v.st.done[k] = 1; fn(); } }, shake() {}, sfx() {}, set(f, s) { f.state = s; }, P: BF.POSES, mix: BF.mix });
      c.restore();
    });
    step(); setInterval(step, 33);
  }
})();
