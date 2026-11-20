/* ฉากบ้าน: ท้องฟ้า ต้นไม้ 5 ขั้น เมฆ และสัตว์ที่ขยับ */
(function () {
  'use strict';
  const BASE = { x: 200, y: 340 };           // จุดโคนต้นไม้บนกองดิน
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- ชิ้นส่วนวาด ---------- */
  function leaf(x, y, rot, k, fill) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M0 0 C ' + k * .62 + ' ' + -k * .28 + ' ' + k * .62 + ' ' + -k * .95 + ' 0 ' + -k * 1.45 +
      ' C ' + -k * .62 + ' ' + -k * .95 + ' ' + -k * .62 + ' ' + -k * .28 + ' 0 0 Z" fill="' + (fill || '#8CCB5E') +
      '" stroke="#5E9E43" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M0 -2 L0 ' + -k * 1.2 + '" stroke="#5E9E43" stroke-width="1.4" stroke-linecap="round"/></g>';
  }
  function flower(x, y, r) {
    let s = '<g class="sw fl" transform="translate(' + x + ' ' + y + ')">';
    for (let i = 0; i < 5; i++) {
      const a = i * 72 * Math.PI / 180;
      s += '<circle cx="' + (Math.sin(a) * r).toFixed(1) + '" cy="' + (-Math.cos(a) * r).toFixed(1) +
        '" r="' + (r * .72).toFixed(1) + '" fill="#F7A1B8"/>';
    }
    return s + '<circle r="' + (r * .6).toFixed(1) + '" fill="#FFE08A"/></g>';
  }
  function blob(x, y, r, dark) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (dark ? '#5FA84F' : '#78BE63') + '"/>';
  }
  function tuft(x, y, s) {
    s = s || 1;
    return '<g class="sw tf" transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="none" stroke="#6FA953" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M0 0 Q-3 -9 -7 -13"/><path d="M0 0 Q0 -11 1 -16"/><path d="M0 0 Q3 -9 8 -12"/></g>';
  }

  /* ---------- ต้นไม้ 5 ขั้น (พิกัดสัมพันธ์กับโคนต้น 0,0 / ขึ้นเป็นค่าลบ) ---------- */
  function treeMarkup(stage) {
    if (stage <= 0) {
      return '<g transform="rotate(-14 0 -8)"><ellipse cx="0" cy="-9" rx="9" ry="12" fill="#B07A45" stroke="#8A5A30" stroke-width="1.6"/>' +
        '<path d="M-3 -17 Q-5 -9 -3 -2" stroke="#D9A86E" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M2 -14 Q5 -10 4 -4" stroke="#8A5A30" stroke-width="1.2" fill="none" stroke-linecap="round"/></g>';
    }
    if (stage === 1) {
      return '<path d="M0 2 Q-3 -26 0 -54" stroke="#6FAE4F" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        leaf(0, -54, -48, 22) + leaf(0, -54, 48, 22);
    }
    if (stage === 2) {
      return '<path d="M0 2 Q-5 -50 0 -104" stroke="#6FAE4F" stroke-width="6.5" fill="none" stroke-linecap="round"/>' +
        leaf(-2, -44, -62, 24) + leaf(-2, -44, 62, 24) +
        leaf(-3, -72, -52, 26) + leaf(-3, -72, 52, 26) +
        leaf(0, -104, -34, 28) + leaf(0, -104, 34, 28) + leaf(0, -104, 0, 24);
    }
    if (stage === 3) {
      return '<path d="M-9 2 C-8 -40 -6 -82 -5 -120 L5 -120 C6 -82 8 -40 9 2 Z" fill="#8B5E3C"/>' +
        '<path d="M0 -92 Q-22 -108 -34 -130 M0 -82 Q24 -100 38 -124" stroke="#8B5E3C" stroke-width="5.5" fill="none" stroke-linecap="round"/>' +
        blob(-36, -128, 33, true) + blob(38, -124, 33, true) + blob(0, -158, 46) + blob(-22, -184, 33) + blob(26, -182, 30) +
        '<circle cx="-14" cy="-168" r="8" fill="#8FCB78" fill-opacity=".7"/><circle cx="20" cy="-190" r="6" fill="#8FCB78" fill-opacity=".7"/>';
    }
    return '<path d="M-14 2 C-12 -50 -9 -104 -7 -152 L7 -152 C9 -104 12 -50 14 2 Z" fill="#8B5E3C"/>' +
      '<path d="M-14 -4 Q-22 2 -30 4 M14 -4 Q22 2 30 4" stroke="#8B5E3C" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M0 -112 Q-28 -130 -46 -156 M0 -100 Q30 -120 50 -150" stroke="#8B5E3C" stroke-width="6.5" fill="none" stroke-linecap="round"/>' +
      blob(-50, -152, 40, true) + blob(52, -150, 40, true) + blob(0, -188, 60) + blob(-32, -226, 40) + blob(34, -222, 38) +
      '<circle cx="-18" cy="-206" r="10" fill="#8FCB78" fill-opacity=".7"/><circle cx="26" cy="-236" r="8" fill="#8FCB78" fill-opacity=".7"/>' +
      flower(-30, -200, 7) + flower(22, -214, 7.5) + flower(-58, -156, 6.5) + flower(60, -150, 7) +
      flower(0, -240, 7) + flower(-40, -238, 6) + flower(44, -190, 6.5) + flower(-8, -168, 6.5) + flower(10, -142, 6);
  }

  // ต้นไม้ย่อสำหรับ "สวนของเรา"
  function miniTree(stage) {
    return '<svg viewBox="-100 -275 200 290" width="96" height="140" aria-hidden="true">' +
      '<ellipse cx="0" cy="6" rx="46" ry="10" fill="#946040"/>' + treeMarkup(stage) + '</svg>';
  }

  /* ---------- ฉากนิ่ง ---------- */
  function cloud(x, y, s, op) {
    return '<g class="cloud" data-y="' + y + '" data-s="' + s + '" opacity="' + op + '">' +
      '<ellipse cx="0" cy="0" rx="34" ry="13" fill="#fff"/><circle cx="-14" cy="-8" r="13" fill="#fff"/>' +
      '<circle cx="8" cy="-13" r="16" fill="#fff"/><circle cx="24" cy="-5" r="10" fill="#fff"/></g>';
  }
  function staticMarkup() {
    return '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop id="skyTop" offset="0" stop-color="#FFF1DC"/><stop id="skyBot" offset="1" stop-color="#FFF9F0"/></linearGradient></defs>' +
      '<rect width="400" height="440" fill="url(#sky)"/>' +
      '<g id="stars" opacity="0">' + starsMarkup() + '</g>' +
      '<g id="sun"><circle cx="332" cy="74" r="46" fill="#FFE3B0" fill-opacity=".55"/><circle cx="332" cy="74" r="28" fill="#FFD58A"/></g>' +
      '<g id="moon" opacity="0"><circle cx="332" cy="74" r="44" fill="#FFF6C8" fill-opacity=".18"/><circle cx="332" cy="74" r="28" fill="#FFF3C4"/>' +
      '<circle cx="322" cy="66" r="5" fill="#EBDDA0"/><circle cx="341" cy="82" r="4" fill="#EBDDA0"/><circle cx="337" cy="63" r="2.5" fill="#EBDDA0"/></g>' +
      '<g id="clouds">' + cloud(0, 54, 1, .95) + cloud(0, 120, .7, .8) + cloud(0, 36, .85, .85) + '</g>' +
      /* ต้นไม้ด้านหลัง */
      '<rect x="56" y="240" width="16" height="100" rx="6" fill="#9B6B47"/>' +
      '<path d="M66 292 Q88 274 112 266" stroke="#9B6B47" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="62" cy="226" r="46" fill="#9CCB80"/><circle cx="30" cy="248" r="30" fill="#9CCB80"/><circle cx="96" cy="244" r="30" fill="#9CCB80"/>' +
      '<rect x="338" y="262" width="14" height="80" rx="6" fill="#9B6B47"/>' +
      '<circle cx="345" cy="244" r="40" fill="#A8D28C"/><circle cx="318" cy="262" r="26" fill="#A8D28C"/><circle cx="372" cy="260" r="26" fill="#A8D28C"/>' +
      /* พื้นดินและหญ้า */
      '<path d="M0 322 Q100 300 200 314 T400 308 L400 440 L0 440 Z" fill="#B5D894"/>' +
      '<path d="M0 346 Q110 328 210 340 T400 334 L400 440 L0 440 Z" fill="#A5D08A"/>' +
      tuft(40, 352, 1) + tuft(104, 346, .8) + tuft(300, 350, .9) + tuft(366, 344, .8) + tuft(150, 360, .7) +
      '<ellipse cx="200" cy="356" rx="82" ry="22" fill="#7A4B2F"/>' +
      '<ellipse cx="200" cy="345" rx="68" ry="16" fill="#946040"/>' +
      '<ellipse cx="178" cy="343" rx="14" ry="4" fill="#A66F48"/><ellipse cx="226" cy="347" rx="10" ry="3" fill="#7F5133"/>' +
      '<g id="treeSway"><g id="treeInner"></g></g>' +
      '<path d="M0 392 Q120 376 220 388 T400 382 L400 440 L0 440 Z" fill="#8FC174"/>' +
      '<g id="animalLayer"></g>' +
      '<path d="M0 424 Q110 412 210 422 T400 416 L400 440 L0 440 Z" fill="#7DB563"/>' +
      tuft(20, 430, 1.1) + tuft(80, 426, .9) + tuft(146, 432, 1.2) + tuft(230, 428, 1) + tuft(300, 434, 1.1) + tuft(376, 428, 1) +
      flower(54, 408, 5) + flower(268, 414, 5) + flower(344, 404, 4.5) +
      '<rect id="nightTint" width="400" height="440" fill="#2B3A78" opacity="0" pointer-events="none"/>';
  }

  /* ---------- กลางวัน/กลางคืนตามเวลาประเทศไทย (06:00–17:59 = กลางวัน) ---------- */
  const STARS = [[30,30,1.6],[62,86,1.2],[96,24,1.4],[128,62,1.8],[160,18,1.2],[196,50,1.6],[226,92,1.2],[250,30,1.8],
    [284,66,1.2],[300,20,1.4],[372,40,1.2],[384,110,1.4],[14,120,1.2],[110,112,1.4],[176,118,1.2],[262,126,1.4],[350,140,1.2],[48,160,1.4]];
  function starsMarkup() {
    return STARS.map(function (p, i) {
      return '<circle class="star" cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#FFFBE0" data-i="' + i + '"/>';
    }).join('');
  }
  function thaiHour() {
    try {
      return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
    } catch (e) { return (new Date().getUTCHours() + 7) % 24; }
  }
  let isNight = false;
  function applyDayNight() {
    if (!svg) return;
    const h = thaiHour();
    isNight = h < 6 || h >= 18;
    const q = function (id) { return svg.querySelector(id); };
    q('#skyTop').setAttribute('stop-color', isNight ? '#0F1B4A' : '#FFF1DC');
    q('#skyBot').setAttribute('stop-color', isNight ? '#3B4F8F' : '#FFF9F0');
    q('#sun').setAttribute('opacity', isNight ? 0 : 1);
    q('#moon').setAttribute('opacity', isNight ? 1 : 0);
    q('#stars').setAttribute('opacity', isNight ? 1 : 0);
    q('#nightTint').setAttribute('opacity', isNight ? .26 : 0);
    clouds.forEach(function (c) { c.style.opacity = isNight ? .35 : ''; });
  }

  /* ---------- ควบคุมฉาก ---------- */
  let svg, sway, inner, layer, clouds, stars = [], swayers = [], curStage = -1, started = false, staticDrawn = false;
  // สัตว์ในฉาก: แสดงพร้อมกันได้ SCENE_MAX ตัว (นับทุกชนิดรวมกัน ตัวซ้ำชนิดเดียวกันนับเป็นคนละตัว)
  // ถ้าสะสมได้มากกว่านั้น ทุก ROTATE_SEC วินาทีจะเปลี่ยน 1 ตัว (ตัวที่อยู่นานสุดจางหายไป ตัวถัดไปจากคิวสุ่มจางเข้ามา)
  // คิวสุ่มรับประกันว่าทุกตัวได้ออกมาครบก่อนเริ่มรอบใหม่
  const SCENE_MAX = 3, ROTATE_SEC = 8, FADE_SEC = 1;
  let visible = [];                // ตัวที่อยู่ในฉาก: { key, slot, act, born }
  let leaving = [];                // ตัวที่กำลังจางหาย: { ..., outAt }
  let bag = [];                    // คิวของรอบนี้ (key ที่ยังไม่ได้ออก)
  let poolList = [];               // ทุกตัวที่สะสมได้: key = 'รหัสสัตว์#ลำดับ'
  let nextRotate = null, nowT = 0;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function takeNext() {
    if (!bag.length) {
      const shown = visible.map(function (e) { return e.key; });
      bag = shuffle(poolList.filter(function (k) { return shown.indexOf(k) < 0; }));
    }
    return bag.shift();
  }
  function show(key, fade) {
    const used = visible.concat(leaving).map(function (e) { return e.slot; });
    let slot = 0;
    while (used.indexOf(slot) >= 0 && slot < SCENE_MAX + 1) slot++;
    if (slot > SCENE_MAX) {                              // ช่องเต็มจริงๆ (ไม่ควรเกิด): ใช้ช่องที่ไม่ซ้ำกับตัวที่อยู่ในฉาก
      slot = 0;
      while (visible.some(function (e) { return e.slot === slot; })) slot++;
    }
    const act = Animals.create(key.split('#')[0], slot);
    act.g.setAttribute('opacity', fade ? 0 : 1);
    layer.appendChild(act.g);
    visible.push({ key, slot, act, born: fade ? nowT : -Infinity });
  }
  function rotate() {
    if (poolList.length <= SCENE_MAX || visible.length < SCENE_MAX) return;
    const key = takeNext();                              // หยิบก่อน เพื่อไม่ให้ตัวที่กำลังออกถูกหยิบกลับทันที
    if (!key) return;
    const out = visible.shift();
    if (reduce.matches) layer.removeChild(out.act.g);
    else { out.outAt = nowT; leaving.push(out); }
    show(key, !reduce.matches);
    staticDrawn = false;
  }

  function mount(el) {
    svg = el;
    svg.innerHTML = staticMarkup();
    sway = svg.querySelector('#treeSway');
    inner = svg.querySelector('#treeInner');
    layer = svg.querySelector('#animalLayer');
    clouds = Array.prototype.slice.call(svg.querySelectorAll('.cloud'));
    clouds.forEach(function (c, i) { c._x0 = i * 170 + 40; c._sp = 5 + i * 2.5; });
    inner.setAttribute('transform', 'translate(' + BASE.x + ' ' + BASE.y + ')');
    stars = Array.prototype.slice.call(svg.querySelectorAll('.star'));
    swayers = Array.prototype.slice.call(svg.querySelectorAll('.sw')).filter(function (g) { return !inner.contains(g); });
    swayers.forEach(function (g, i) { g._base = g.getAttribute('transform'); g._ph = i * 1.3; g._tuft = g.classList.contains('tf'); });
    applyDayNight();
    if (!started) { started = true; requestAnimationFrame(frame); setInterval(applyDayNight, 60000); }
  }

  function setTree(stage) {
    if (stage === curStage) return;
    const first = curStage === -1;
    curStage = stage;
    inner.innerHTML = '<g class="tree-pop">' + treeMarkup(stage) + '</g>';
    if (!first) {
      const pop = inner.firstChild;
      pop.classList.add('grow');
    }
  }

  function setAnimals(collection) {
    poolList = [];
    Store.ANIMALS.forEach(function (a) {
      for (let k = 0; k < (collection[a.id] || 0); k++) poolList.push(a.id + '#' + k);
    });
    const inPool = {};
    poolList.forEach(function (k) { inPool[k] = true; });
    visible = visible.filter(function (e) {
      if (inPool[e.key]) return true;
      layer.removeChild(e.act.g);
      return false;
    });
    bag = bag.filter(function (k) { return inPool[k]; });
    // ตัวใหม่ที่เพิ่งได้: แทรกในคิวที่ตำแหน่งสุ่ม
    const known = {};
    visible.concat(leaving).forEach(function (e) { known[e.key] = true; });
    bag.forEach(function (k) { known[k] = true; });
    poolList.forEach(function (k) {
      if (!known[k]) bag.splice(Math.floor(Math.random() * (bag.length + 1)), 0, k);
    });
    while (visible.length < SCENE_MAX) {
      const key = takeNext();
      if (!key) break;
      show(key, false);
    }
  }

  function update(v) {
    if (!svg) return;
    setTree(v.stage);
    setAnimals(v.collection || {});
    staticDrawn = false;             // ให้วาดท่านิ่งใหม่ถ้าเปิด Reduce Motion
  }

  let last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!svg || !svg.isConnected || svg.getBoundingClientRect().width === 0) { last = ts; return; }
    const t = ts / 1000;
    const dt = Math.min(.05, Math.max(0, t - last));
    last = t;
    nowT = t;
    if (nextRotate === null) nextRotate = t + ROTATE_SEC;
    if (t >= nextRotate) { nextRotate = t + ROTATE_SEC; rotate(); }

    if (reduce.matches) {
      if (staticDrawn) return;
      staticDrawn = true;
      draw(0, 0, 0);
      return;
    }
    staticDrawn = false;
    draw(t, dt, 1);
  }

  function draw(t, dt, move) {
    const amp = .9 + Math.max(0, curStage) * .5;
    const gust = .75 + .25 * Math.sin(t * .6);                       // ลมแรงขึ้น-เบาลงเป็นช่วงๆ
    const ang = move ? (Math.sin(t * 1.8) * 1.5 + Math.sin(t * 3.1 + 1) * .8) * amp * gust : 0;
    swayers.forEach(function (g) {
      const a = move ? (Math.sin(t * 2.6 + g._ph) * 7 + Math.sin(t * 4.3 + g._ph * 2) * 3) * gust : 0;
      g.setAttribute('transform', g._base + ' rotate(' + a.toFixed(2) + (g._tuft ? '' : ' 0 9') + ')');
    });
    sway.setAttribute('transform', 'rotate(' + ang.toFixed(2) + ' ' + BASE.x + ' ' + BASE.y + ')');
    if (isNight) stars.forEach(function (st, i) {
      st.setAttribute('opacity', (move ? .55 + .45 * Math.sin(t * 2.2 + i * 1.7) : 1).toFixed(2));
    });
    clouds.forEach(function (c) {
      const x = ((c._x0 + c._sp * t) % 560) - 80;
      c.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + c.getAttribute('data-y') + ') scale(' + c.getAttribute('data-s') + ')');
    });
    visible.forEach(function (e) {
      e.act.update(t, dt);
      e.act.g.setAttribute('opacity', move ? Math.max(0, Math.min(1, (t - e.born) / FADE_SEC)).toFixed(2) : 1);
    });
    leaving = leaving.filter(function (e) {
      const o = 1 - (t - e.outAt) / FADE_SEC;
      if (!move || o <= 0) { layer.removeChild(e.act.g); return false; }
      e.act.update(t, dt);
      e.act.g.setAttribute('opacity', o.toFixed(2));
      return true;
    });
  }

  window.Scene = { mount, update, miniTree };
})();
