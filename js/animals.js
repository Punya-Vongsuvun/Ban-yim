/* สัตว์ 7 ชนิด: รูปวาด SVG + พฤติกรรมการขยับ */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- รูปวาด (พิกัดรอบจุด 0,0) ---------- */
  const ART = {
    butterfly:
      '<g class="wl"><ellipse cx="-8" cy="-5" rx="8" ry="10.5" fill="#F6A24A" transform="rotate(-18 -8 -5)"/>' +
      '<ellipse cx="-6" cy="6" rx="5.5" ry="6.5" fill="#F9C46B"/><circle cx="-9" cy="-6" r="2.4" fill="#FFF3D6"/></g>' +
      '<g class="wr"><ellipse cx="8" cy="-5" rx="8" ry="10.5" fill="#F6A24A" transform="rotate(18 8 -5)"/>' +
      '<ellipse cx="6" cy="6" rx="5.5" ry="6.5" fill="#F9C46B"/><circle cx="9" cy="-6" r="2.4" fill="#FFF3D6"/></g>' +
      '<rect x="-1.4" y="-9" width="2.8" height="18" rx="1.4" fill="#5B3A29"/>' +
      '<path d="M-1 -9 Q-5 -15 -7 -14 M1 -9 Q5 -15 7 -14" stroke="#5B3A29" stroke-width="1" fill="none" stroke-linecap="round"/>',

    ladybug:
      '<path d="M7 -5 Q11 -9 13 -8 M7 5 Q11 9 13 8" stroke="#3A2418" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="0" rx="9.5" ry="7.5" fill="#E8503A"/>' +
      '<path d="M-1 -7.4 L-1 7.4" stroke="#3A2418" stroke-width="1.3"/>' +
      '<circle cx="-4" cy="-3" r="1.7" fill="#3A2418"/><circle cx="-4" cy="3.4" r="1.7" fill="#3A2418"/>' +
      '<circle cx="3" cy="-3.4" r="1.5" fill="#3A2418"/><circle cx="3" cy="3.6" r="1.5" fill="#3A2418"/>' +
      '<circle cx="9.5" cy="0" r="4" fill="#3A2418"/>' +
      '<circle cx="11" cy="-1.6" r="1" fill="#fff"/><circle cx="11" cy="1.6" r="1" fill="#fff"/>',

    bee:
      '<g class="bw"><ellipse cx="-3" cy="-7" rx="5.2" ry="3.3" fill="#fff" fill-opacity=".8" stroke="#BCD3E3" stroke-width=".7" transform="rotate(-25 -3 -7)"/>' +
      '<ellipse cx="3" cy="-7.5" rx="5.2" ry="3.3" fill="#fff" fill-opacity=".8" stroke="#BCD3E3" stroke-width=".7" transform="rotate(15 3 -7.5)"/></g>' +
      '<ellipse cx="0" cy="0" rx="9.5" ry="6.8" fill="#FFC93C"/>' +
      '<path d="M-3.4 -6.2 Q-5 0 -3.4 6.2 M2 -6.6 Q0.4 0 2 6.6" stroke="#5B3A29" stroke-width="2.6" fill="none"/>' +
      '<circle cx="9" cy="-0.5" r="3.8" fill="#5B3A29"/><circle cx="10.4" cy="-1.8" r="1" fill="#fff"/>' +
      '<path d="M-9.5 0 L-13 0" stroke="#5B3A29" stroke-width="1.6" stroke-linecap="round"/>',

    dragonfly:
      '<g class="dw"><ellipse cx="2" cy="-6" rx="10" ry="2.8" fill="#BFE6F2" fill-opacity=".75" stroke="#8CC3D6" stroke-width=".6" transform="rotate(-8 2 -6)"/>' +
      '<ellipse cx="-3" cy="-5" rx="9" ry="2.6" fill="#BFE6F2" fill-opacity=".75" stroke="#8CC3D6" stroke-width=".6" transform="rotate(10 -3 -5)"/>' +
      '<ellipse cx="2" cy="6" rx="10" ry="2.8" fill="#BFE6F2" fill-opacity=".75" stroke="#8CC3D6" stroke-width=".6" transform="rotate(8 2 6)"/>' +
      '<ellipse cx="-3" cy="5" rx="9" ry="2.6" fill="#BFE6F2" fill-opacity=".75" stroke="#8CC3D6" stroke-width=".6" transform="rotate(-10 -3 5)"/></g>' +
      '<rect x="-16" y="-1.6" width="28" height="3.2" rx="1.6" fill="#3FB5B0"/>' +
      '<path d="M-9 -1.6 L-9 1.6 M-5 -1.6 L-5 1.6 M-1 -1.6 L-1 1.6" stroke="#2A8F8B" stroke-width="1"/>' +
      '<circle cx="13" cy="0" r="3.8" fill="#2A8F8B"/><circle cx="14.2" cy="-1.4" r="1.2" fill="#fff"/>',

    snail:
      '<ellipse cx="0" cy="6" rx="15" ry="4.6" fill="#E8C9A0"/>' +
      '<circle cx="13" cy="1.5" r="4.6" fill="#E8C9A0"/>' +
      '<path d="M12 -2 L11 -10 M15 -1.5 L18 -9" stroke="#D2AE82" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="11" cy="-10.4" r="1.5" fill="#3A2418"/><circle cx="18" cy="-9.4" r="1.5" fill="#3A2418"/>' +
      '<circle cx="-3" cy="-1" r="10" fill="#F2A65A" stroke="#C97B35" stroke-width="1.4"/>' +
      '<circle cx="-3" cy="-1" r="6" fill="none" stroke="#C97B35" stroke-width="1.3"/>' +
      '<circle cx="-3" cy="-1" r="2.4" fill="none" stroke="#C97B35" stroke-width="1.3"/>',

    firefly:
      '<circle class="halo" cx="-5" cy="0" r="12" fill="#FFF3A0" fill-opacity=".45"/>' +
      '<ellipse cx="2" cy="-4.5" rx="5" ry="2.6" fill="#fff" fill-opacity=".8" stroke="#CFE0EA" stroke-width=".6" transform="rotate(-20 2 -4.5)"/>' +
      '<ellipse cx="0" cy="0" rx="8" ry="4" fill="#4A3A2A"/>' +
      '<ellipse class="glow" cx="-5.5" cy="0" rx="4.2" ry="3.4" fill="#FFE45C"/>' +
      '<circle cx="7.5" cy="0" r="3" fill="#2E2218"/><circle cx="8.4" cy="-1" r=".9" fill="#fff"/>',

    bird:
      '<path d="M-2 9 L-2 14 M3 9 L3 14" stroke="#F29A3D" stroke-width="1.7" stroke-linecap="round"/>' +
      '<g class="tail"><path d="M8 1 L25 6 L23 10 L7 7 Z" fill="#4C86BF"/></g>' +
      '<ellipse cx="0" cy="0" rx="11.5" ry="9.5" fill="#6FA8DC"/>' +
      '<ellipse cx="-2" cy="3.5" rx="7" ry="5" fill="#FFF1D6"/>' +
      '<path d="M-1 -3 Q9 -5 13 4 Q5 7 -1 -3 Z" fill="#4C86BF"/>' +
      '<circle cx="-8" cy="-8.5" r="6.6" fill="#6FA8DC"/>' +
      '<path d="M-14 -9.5 L-21 -7 L-14 -5.5 Z" fill="#F29A3D"/>' +
      '<circle cx="-10.5" cy="-10" r="1.5" fill="#3A2418"/>'
  };

  function markup(type) { return ART[type] || ''; }

  // รูปนิ่งสำหรับสมุดสะสม
  function icon(type, size) {
    return '<svg viewBox="-27 -23 54 46" width="' + (size || 64) + '" height="' + Math.round((size || 64) * 46 / 54) +
      '" aria-hidden="true">' + markup(type) + '</svg>';
  }

  function setPos(g, x, y, flip, rot) {
    g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' +
      (rot || 0).toFixed(1) + ') scale(' + (flip || 1) + ' 1)');
  }

  /* ---------- พฤติกรรม ---------- */
  function crawler(g, o) {
    let x = rnd(60, 340), dir = Math.random() < .5 ? 1 : -1, pause = rnd(0, 1.5);
    return function (t, dt) {
      if (pause > 0) pause -= dt;
      else {
        x += dir * o.speed * dt;
        if (x > 368) { x = 368; dir = -1; pause = rnd(.5, 1.5); }
        if (x < 32) { x = 32; dir = 1; pause = rnd(.5, 1.5); }
        if (Math.random() < dt * .12) pause = rnd(.8, 2.4);
      }
      const moving = pause <= 0;
      const wob = moving ? Math.sin(t * o.wobble) : 0;
      setPos(g, x, o.y + (moving ? Math.abs(wob) * -o.bob : 0), dir, wob * o.tilt);
    };
  }

  function create(type, i) {
    i = i || 0;
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = markup(type);
    const q = s => g.querySelector(s);
    const p = i * 2.3 + Math.random() * 4;
    let update;

    if (type === 'butterfly') {
      const wl = q('.wl'), wr = q('.wr');
      update = function (t) {
        const a = .3 * t + p;
        const x = 200 + 135 * Math.sin(a);
        const y = 150 + 50 * Math.sin(.55 * t + p) + 18 * Math.sin(1.7 * t + p);
        const s = .25 + .75 * Math.abs(Math.sin(t * 9 + p));
        wl.setAttribute('transform', 'scale(' + s.toFixed(2) + ' 1)');
        wr.setAttribute('transform', 'scale(' + s.toFixed(2) + ' 1)');
        setPos(g, x, y, 1, Math.cos(a) * 14);
      };
    } else if (type === 'bee') {
      const bw = q('.bw');
      update = function (t) {
        const a = .95 * t + p;
        const x = 200 + 100 * Math.cos(a) + 5 * Math.sin(8 * t);
        const y = 205 + 48 * Math.sin(a) + 7 * Math.sin(5 * t + p);
        const s = .4 + .6 * Math.abs(Math.sin(t * 38));
        bw.setAttribute('transform', 'translate(0 -7) scale(1 ' + s.toFixed(2) + ') translate(0 7)');
        setPos(g, x, y, -Math.sin(a) >= 0 ? 1 : -1, 0);
      };
    } else if (type === 'dragonfly') {
      const dw = q('.dw');
      let x = rnd(80, 320), y = rnd(90, 250), tx = x, ty = y, wait = rnd(.2, 1.2), flip = 1;
      const retarget = function () {
        do { tx = rnd(50, 350); ty = rnd(80, 270); } while (Math.hypot(tx - x, ty - y) < 90);
        flip = tx >= x ? 1 : -1;
      };
      update = function (t, dt) {
        let jx = 0, jy = 0;
        if (wait > 0) {
          wait -= dt;
          jx = Math.sin(t * 9 + p) * .8; jy = Math.sin(t * 7 + p) * 1.2;
          if (wait <= 0) retarget();
        } else {
          const k = 1 - Math.exp(-dt * 4.5);
          x += (tx - x) * k; y += (ty - y) * k;
          if (Math.hypot(tx - x, ty - y) < 3) wait = rnd(.9, 2.2);
        }
        const s = .35 + .65 * Math.abs(Math.sin(t * 45));
        dw.setAttribute('transform', 'scale(1 ' + s.toFixed(2) + ')');
        setPos(g, x + jx, y + jy, flip, 0);
      };
    } else if (type === 'ladybug') {
      update = crawler(g, { y: 396 + (i % 3) * 7, speed: 16, wobble: 14, bob: 0.8, tilt: 3 });
    } else if (type === 'snail') {
      update = crawler(g, { y: 410 + (i % 2) * 5, speed: 6, wobble: 3, bob: 0.4, tilt: 1 });
    } else if (type === 'firefly') {
      const glow = q('.glow'), halo = q('.halo');
      const x0 = rnd(60, 340), y0 = rnd(150, 300);
      update = function (t) {
        const x = x0 + 40 * Math.sin(.5 * t + p) + 15 * Math.sin(1.3 * t);
        const y = y0 + 25 * Math.sin(.7 * t + p * 2) + 8 * Math.sin(2.1 * t);
        const b = Math.pow(.5 + .5 * Math.sin(t * 2.4 + p), 2);
        glow.setAttribute('fill-opacity', (.35 + .65 * b).toFixed(2));
        halo.setAttribute('fill-opacity', (.5 * b).toFixed(2));
        setPos(g, x, y, Math.cos(.5 * t + p) >= 0 ? 1 : -1, 0);
      };
    } else if (type === 'bird') {
      const tail = q('.tail');
      // เกาะกิ่งของต้นไม้ด้านหลังซ้าย (ตำแหน่งกิ่งอยู่ใน scene.js)
      update = function (t) {
        const phase = t % 6;                       // ทุก 6 วินาทีมีช่วงเขย่าหางและเอียงตัว
        const act = phase > 4 ? Math.sin((phase - 4) * Math.PI) : 0;
        tail.setAttribute('transform', 'rotate(' + (act * Math.sin(t * 16) * 10).toFixed(1) + ' 8 4)');
        setPos(g, 100, 250 - Math.max(0, act) * 1.2, 1, -act * 4);
      };
    } else {
      update = function () {};
    }

    update(0, 0);
    return { g, update };
  }

  window.Animals = { markup, icon, create };
})();
