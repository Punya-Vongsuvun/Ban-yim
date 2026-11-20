/* สัตว์ 20 ชนิด: รูปวาด SVG + พฤติกรรมการขยับ */
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
      '<circle cx="-10.5" cy="-10" r="1.5" fill="#3A2418"/>',

    ant:
      '<path d="M-9 3 L-13 9 M-2 4 L-3 10 M5 3 L8 9 M-9 1 L-15 5" stroke="#3A2418" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-10" cy="0" rx="7.5" ry="5.4" fill="#7A3E26"/><ellipse cx="0" cy="0" rx="4.4" ry="3.6" fill="#8E4A30"/>' +
      '<circle cx="8.5" cy="-1" r="4.6" fill="#7A3E26"/><circle cx="10.4" cy="-2.4" r="1.1" fill="#fff"/>' +
      '<path d="M10 -4.8 Q13 -11 18 -11 M7.5 -5.2 Q8 -12 12 -14" stroke="#3A2418" stroke-width="1.2" fill="none" stroke-linecap="round"/>',

    cricket:
      '<path d="M9 -4 Q14 -13 24 -15 M7 -5 Q9 -14 17 -19" stroke="#3E5420" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      '<path d="M3 4 L4 10 M-2 4 L-2 10" stroke="#3E5420" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-2" cy="0" rx="12.5" ry="6.2" fill="#5E7A2E"/>' +
      '<path d="M-13 -2 Q-2 -10 9 -3 Q-2 2 -13 -2 Z" fill="#7C9A45"/>' +
      '<path d="M-4 3 L-12 -4 L-19 8" stroke="#3E5420" stroke-width="2.3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="11" cy="-1" r="4.8" fill="#5E7A2E"/><circle cx="12.6" cy="-2.4" r="1.2" fill="#fff"/>',

    grasshopper:
      '<path d="M10 -4 Q16 -14 25 -16" stroke="#4E7A22" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      '<path d="M4 4 L5 11 M-1 4 L-2 11" stroke="#4E7A22" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-3" cy="0" rx="14" ry="5.6" fill="#8CC84B"/>' +
      '<path d="M-17 -1 Q-4 -9 10 -2 Q-4 2 -17 -1 Z" fill="#B5DE72"/>' +
      '<path d="M-5 3 L-13 -6 L-21 9" stroke="#4E7A22" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<ellipse cx="12" cy="-1" rx="5.2" ry="4.8" fill="#8CC84B"/><circle cx="14" cy="-2.6" r="1.4" fill="#3A2418"/>',

    caterpillar:
      '<path d="M-19 8 L-19 10 M-12 8 L-12 10 M-5 8 L-5 10 M2 8 L2 10" stroke="#5B8A2E" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="-18" cy="2" r="5.4" fill="#8FCB5A"/><circle cx="-10" cy="1" r="5.8" fill="#A5D96C"/>' +
      '<circle cx="-2" cy="2" r="5.8" fill="#8FCB5A"/><circle cx="6" cy="1" r="5.8" fill="#A5D96C"/>' +
      '<circle cx="14" cy="-1" r="6.6" fill="#F2A65A"/>' +
      '<circle cx="16.5" cy="-2.6" r="1.5" fill="#fff"/><circle cx="17" cy="-2.6" r=".8" fill="#3A2418"/>' +
      '<path d="M13 -6.5 Q12 -12 9 -13 M16 -6 Q18 -12 21 -12" stroke="#5B3A29" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M17 2 Q19 3 20.5 1.5" stroke="#5B3A29" stroke-width="1" fill="none" stroke-linecap="round"/>',

    frog:
      '<path d="M-4 5 Q-14 5 -16 11 L-5 11 Z M4 7 L8 11 L12 11" fill="#5FAE4B" stroke="#3E8A33" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<ellipse cx="-1" cy="2" rx="14.5" ry="9" fill="#6CBD55"/>' +
      '<ellipse cx="0" cy="5" rx="9" ry="4.6" fill="#D9F0B8"/>' +
      '<circle cx="8" cy="-6" r="5" fill="#6CBD55"/><circle cx="-1" cy="-6" r="4.6" fill="#6CBD55"/>' +
      '<circle cx="9" cy="-6.4" r="3" fill="#fff"/><circle cx="-0.2" cy="-6.4" r="2.8" fill="#fff"/>' +
      '<circle cx="10" cy="-6.4" r="1.5" fill="#3A2418"/><circle cx="0.8" cy="-6.4" r="1.4" fill="#3A2418"/>' +
      '<path d="M3 3 Q10 6.5 15 2.5" stroke="#2F6B28" stroke-width="1.3" fill="none" stroke-linecap="round"/>',

    chick:
      '<path d="M-3 10 L-3 17 M-5 17 L-1 17 M4 10 L4 17 M2 17 L6 17" stroke="#F29A3D" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<circle cx="0" cy="0" r="12" fill="#FFD84A"/>' +
      '<path d="M-3 -11 Q-6 -17 -2 -17 M1 -11.5 Q2 -18 5 -16" stroke="#F2B92E" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-5" cy="3" rx="6" ry="4.6" fill="#F5C531" transform="rotate(20 -5 3)"/>' +
      '<path d="M11 -2 L19 0.5 L11 3 Z" fill="#F29A3D"/>' +
      '<circle cx="6" cy="-3.4" r="1.7" fill="#3A2418"/><circle cx="6.5" cy="-4" r=".6" fill="#fff"/>' +
      '<circle cx="8.5" cy="3" r="2.4" fill="#FF9F8A" fill-opacity=".6"/>',

    goldfish:
      '<path d="M-17 -12 Q-23 12 0 16 Q23 12 17 -12 Z" fill="#CFEFFA" fill-opacity=".55" stroke="#8CC3D6" stroke-width="1.4"/>' +
      '<path d="M-19.5 0 Q0 6 19.5 0 Q21 12 0 16 Q-21 12 -19.5 0 Z" fill="#9ED8EE" fill-opacity=".5"/>' +
      '<ellipse cx="0" cy="19" rx="12" ry="3" fill="#B89B7A"/>' +
      '<ellipse cx="-12" cy="-12" rx="4" ry="1.4" fill="none" stroke="#8CC3D6" stroke-width="1.2"/><ellipse cx="12" cy="-12" rx="4" ry="1.4" fill="none" stroke="#8CC3D6" stroke-width="1.2"/>' +
      '<g class="fish"><g class="ftail"><path d="M-6 4 L-15 -1 L-15 9 Z" fill="#FF8A3D"/></g>' +
      '<ellipse cx="1" cy="4" rx="8" ry="5.6" fill="#FF9F45"/><path d="M-1 -1 Q2 -6 6 -1" fill="#FF8A3D"/>' +
      '<circle cx="5" cy="3" r="1.6" fill="#fff"/><circle cx="5.4" cy="3" r=".8" fill="#3A2418"/></g>' +
      '<circle cx="-9" cy="-4" r="1.2" fill="#fff" fill-opacity=".7"/>',

    turtle:
      '<path d="M-10 7 L-10 12 L-5 12 L-5 7 M7 7 L7 12 L12 12 L12 7" fill="#8FB86A"/>' +
      '<path d="M-16 4 L-21 7 L-15 7 Z" fill="#8FB86A"/>' +
      '<path d="M-15 6 Q-15 -12 0 -12 Q15 -12 15 6 Z" fill="#7BA05B" stroke="#5E8244" stroke-width="1.3"/>' +
      '<path d="M-5 -10 L-8 -2 L-2 3 L4 -2 L2 -10 Z M-8 -2 L-14 2 M-2 3 L-3 6 M4 -2 L10 1" fill="#A7CB82" fill-opacity=".7" stroke="#5E8244" stroke-width="1"/>' +
      '<ellipse cx="18" cy="1" rx="6.6" ry="5.4" fill="#8FB86A"/>' +
      '<circle cx="20.5" cy="-0.6" r="1.3" fill="#3A2418"/>',

    rabbit:
      '<ellipse cx="-3" cy="4" rx="12" ry="8.6" fill="#F4EBDD"/>' +
      '<circle cx="-15" cy="5" r="4.4" fill="#fff"/>' +
      '<path d="M2 12 L8 12" stroke="#E5D5BD" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="11" cy="-3" rx="8" ry="6.8" fill="#F4EBDD"/>' +
      '<ellipse cx="6" cy="-15" rx="2.8" ry="8" fill="#F4EBDD" transform="rotate(-8 6 -15)"/><ellipse cx="6" cy="-15" rx="1.2" ry="5.6" fill="#F7B9C4" transform="rotate(-8 6 -15)"/>' +
      '<ellipse cx="13" cy="-15" rx="2.8" ry="8" fill="#F4EBDD" transform="rotate(10 13 -15)"/><ellipse cx="13" cy="-15" rx="1.2" ry="5.6" fill="#F7B9C4" transform="rotate(10 13 -15)"/>' +
      '<circle cx="14" cy="-4.4" r="1.5" fill="#3A2418"/><circle cx="18.5" cy="-1" r="1.5" fill="#F29AA8"/>' +
      '<circle cx="12" cy="0" r="2.4" fill="#F7B9C4" fill-opacity=".6"/>',

    squirrel:
      '<path d="M-6 8 Q-24 8 -22 -8 Q-21 -20 -11 -19 Q-18 -13 -13 -6 Q-9 0 -4 3 Z" fill="#B8703A"/>' +
      '<path d="M-14 -17 Q-20 -12 -17 -5" stroke="#D99A62" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="4" rx="9.6" ry="9" fill="#C77F45"/><ellipse cx="3" cy="6" rx="5" ry="5.6" fill="#F5E1C4"/>' +
      '<circle cx="9" cy="-4" r="6.4" fill="#C77F45"/>' +
      '<path d="M5 -9 L4 -14 L9 -10 Z" fill="#B8703A"/>' +
      '<circle cx="11.4" cy="-5" r="1.4" fill="#3A2418"/><circle cx="15" cy="-2.6" r="1.3" fill="#3A2418"/>' +
      '<circle cx="14" cy="9" r="3.2" fill="#8A5A2B"/><path d="M14 5.8 L14 7" stroke="#5B3A29" stroke-width="1.2"/>',

    hedgehog:
      '<path d="M-4 10 L-4 13 M6 10 L6 13" stroke="#6B4A33" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M-20 8 L-23 3 L-19 3 L-22 -3 L-17 -2 L-18 -8 L-13 -6 L-12 -12 L-7 -9 L-4 -14 L0 -10 L4 -13 L6 -8 L11 -10 L11 -4 L15 -4 L13 2 L9 9 Z" fill="#7A5638" stroke="#5B3E27" stroke-width="1"/>' +
      '<path d="M-14 0 L-10 -5 M-6 -2 L-2 -8 M2 -3 L5 -8" stroke="#A47B58" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M6 8 Q8 -2 18 1 L23 6 Q16 12 6 8 Z" fill="#E8C9A0"/>' +
      '<circle cx="23" cy="5.6" r="1.7" fill="#3A2418"/><circle cx="15" cy="2" r="1.4" fill="#3A2418"/>',

    owl:
      '<path d="M-24 15 L24 15" stroke="#8B5E3C" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-5 12 L-5 15 M5 12 L5 15" stroke="#F29A3D" stroke-width="2.2" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="3" rx="11.5" ry="12" fill="#A8744B"/>' +
      '<ellipse cx="0" cy="7" rx="7" ry="7.6" fill="#E9CFAE"/>' +
      '<path d="M-4 5 L-2 8 M2 4 L4 7 M-1 9 L1 12" stroke="#C99A6B" stroke-width="1.2" stroke-linecap="round"/>' +
      '<g class="ohead"><path d="M-10 -9 L-12 -17 L-4 -12 Z M10 -9 L12 -17 L4 -12 Z" fill="#8B5E3C"/>' +
      '<ellipse cx="0" cy="-6" rx="11.5" ry="9" fill="#A8744B"/>' +
      '<circle cx="-5" cy="-6" r="5" fill="#F7E6C8"/><circle cx="5" cy="-6" r="5" fill="#F7E6C8"/>' +
      '<circle cx="-5" cy="-6" r="3" fill="#FFC93C"/><circle cx="5" cy="-6" r="3" fill="#FFC93C"/>' +
      '<circle cx="-5" cy="-6" r="1.6" fill="#3A2418"/><circle cx="5" cy="-6" r="1.6" fill="#3A2418"/>' +
      '<path d="M-1.8 -2.6 L1.8 -2.6 L0 0.6 Z" fill="#F29A3D"/></g>',

    deer:
      '<path d="M-12 8 L-12 22 M-7 8 L-7 22 M6 8 L6 22 M11 8 L11 22" stroke="#B07A4A" stroke-width="2.8" stroke-linecap="round"/>' +
      '<path d="M-12 22 L-12 22.6 M-7 22 L-7 22.6 M6 22 L6 22.6 M11 22 L11 22.6" stroke="#5B3A29" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M-17 -1 Q-22 1 -19 6 Q-16 4 -15 1 Z" fill="#fff"/>' +
      '<ellipse cx="-3" cy="2" rx="16" ry="8.6" fill="#C98F58"/>' +
      '<circle cx="-9" cy="-1" r="1.5" fill="#fff"/><circle cx="-2" cy="-3.4" r="1.5" fill="#fff"/><circle cx="4" cy="-0.4" r="1.4" fill="#fff"/><circle cx="-5" cy="4" r="1.3" fill="#fff"/><circle cx="2" cy="5" r="1.3" fill="#fff"/>' +
      '<path d="M8 -2 Q12 -9 15 -13 L20 -11 Q16 -4 14 3 Z" fill="#C98F58"/>' +
      '<ellipse cx="18" cy="-14" rx="6.6" ry="5.2" fill="#C98F58" transform="rotate(12 18 -14)"/>' +
      '<ellipse cx="24" cy="-12" rx="3" ry="2.4" fill="#E9CFAE"/><circle cx="26" cy="-12.6" r="1.1" fill="#3A2418"/>' +
      '<ellipse cx="13" cy="-19" rx="2.2" ry="4" fill="#C98F58" transform="rotate(-30 13 -19)"/><ellipse cx="13" cy="-19" rx="1" ry="2.6" fill="#F0B9A5" transform="rotate(-30 13 -19)"/>' +
      '<circle cx="20" cy="-15.6" r="1.3" fill="#3A2418"/>'
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

  // กระโดดเป็นช่วงๆ: รอ -> โดดไปข้างหน้า -> รอ
  function hopper(g, o) {
    let x = rnd(60, 340), dir = Math.random() < .5 ? 1 : -1, wait = rnd(.2, 1.5), hopping = false, u = 0, x0 = x;
    return function (t, dt) {
      if (!hopping) {
        wait -= dt;
        if (wait <= 0) {
          hopping = true; u = 0; x0 = x;
          if (x + dir * o.dist > 368 || x + dir * o.dist < 32) dir = -dir;
        }
      } else {
        u = Math.min(1, u + dt / o.dur);
        x = x0 + dir * o.dist * u;
        if (u >= 1) { hopping = false; wait = rnd(o.w0, o.w1); }
      }
      const h = hopping ? 4 * u * (1 - u) * o.h : 0;
      setPos(g, x, o.y - h, dir, hopping ? dir * (u - .5) * 24 : 0);
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
        setPos(g, 100 - i * 30, 250 - Math.max(0, act) * 1.2, 1, -act * 4);
      };
    } else if (type === 'ant') {
      update = crawler(g, { y: 402 + (i % 3) * 6, speed: 14, wobble: 20, bob: 0.5, tilt: 2 });
    } else if (type === 'caterpillar') {
      update = crawler(g, { y: 404 + (i % 3) * 6, speed: 5, wobble: 5, bob: 1.2, tilt: 1 });
    } else if (type === 'chick') {
      update = crawler(g, { y: 394 + (i % 3) * 6, speed: 13, wobble: 13, bob: 2.2, tilt: 5 });
    } else if (type === 'turtle') {
      update = crawler(g, { y: 404 + (i % 3) * 5, speed: 4, wobble: 3, bob: 0.3, tilt: 1 });
    } else if (type === 'hedgehog') {
      update = crawler(g, { y: 404 + (i % 3) * 5, speed: 7, wobble: 9, bob: 0.8, tilt: 2 });
    } else if (type === 'deer') {
      update = crawler(g, { y: 392 + (i % 3) * 6, speed: 8, wobble: 5, bob: 1.2, tilt: 1 });
    } else if (type === 'cricket') {
      update = hopper(g, { y: 402 + (i % 3) * 6, dist: 22, dur: .28, h: 12, w0: .6, w1: 2 });
    } else if (type === 'grasshopper') {
      update = hopper(g, { y: 402 + (i % 3) * 6, dist: 34, dur: .4, h: 20, w0: .8, w1: 2.5 });
    } else if (type === 'frog') {
      update = hopper(g, { y: 400 + (i % 3) * 6, dist: 26, dur: .4, h: 14, w0: 1, w1: 3 });
    } else if (type === 'rabbit') {
      update = hopper(g, { y: 398 + (i % 3) * 6, dist: 40, dur: .5, h: 18, w0: .8, w1: 2.4 });
    } else if (type === 'squirrel') {
      update = hopper(g, { y: 398 + (i % 3) * 6, dist: 28, dur: .35, h: 12, w0: .5, w1: 1.8 });
    } else if (type === 'goldfish') {
      // ชามปลาตั้งบนพื้นหญ้า ปลาว่ายไปมาในชาม
      const fish = q('.fish'), ft = q('.ftail');
      const bx = 62 + i * 112;
      update = function (t) {
        const fx = 6 * Math.sin(t * .9 + p), fy = 2.5 * Math.sin(t * 1.7 + p);
        const dir = Math.cos(t * .9 + p) >= 0 ? 1 : -1;
        fish.setAttribute('transform', 'translate(' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ') scale(' + dir + ' 1)');
        ft.setAttribute('transform', 'rotate(' + (Math.sin(t * 9 + p) * 14).toFixed(1) + ' -6 4)');
        setPos(g, bx, 400, 1, 0);
      };
    } else if (type === 'owl') {
      // เกาะกิ่งฝั่งขวา ทุก 5 วินาทีหันหัวไปมา
      const head = q('.ohead');
      update = function (t) {
        const phase = (t + p) % 5;
        const act = phase > 3.4 ? Math.sin((phase - 3.4) / 1.6 * Math.PI) : 0;
        head.setAttribute('transform', 'rotate(' + (act * 14).toFixed(1) + ' 0 -2)');
        setPos(g, 312 - i * 36, 262, 1, 0);
      };
    } else {
      update = function () {};
    }

    update(0, 0);
    return { g, update };
  }

  window.Animals = { markup, icon, create };
})();
