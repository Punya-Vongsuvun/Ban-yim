/* ข้อมูลจำลองในเครื่อง (เฟส 1)
   เฟส 2 จะเปลี่ยนไฟล์นี้เป็นตัวเชื่อม Firebase โดยหน้าจออื่นใช้ Store ตัวเดิม */
(function () {
  'use strict';

  const KEY = 'banyim-phase1-v1';

  const ROLES = {
    dad: { name: 'พ่อ', emoji: '👨', color: '#4C9BE8' },
    mom: { name: 'แม่', emoji: '👩', color: '#EF82A8' },
    kid: { name: 'ลูก', emoji: '🧒', color: '#F5A23B' }
  };
  const ROLE_IDS = ['dad', 'mom', 'kid'];

  const ANIMALS = [
    { id: 'butterfly', name: 'ผีเสื้อ',  weight: 30, rarity: '' },
    { id: 'ladybug',   name: 'เต่าทอง',  weight: 22, rarity: '' },
    { id: 'bee',       name: 'ผึ้ง',     weight: 18, rarity: '' },
    { id: 'dragonfly', name: 'แมลงปอ',   weight: 14, rarity: '' },
    { id: 'snail',     name: 'หอยทาก',   weight: 8,  rarity: '' },
    { id: 'firefly',   name: 'หิ่งห้อย', weight: 6,  rarity: 'หายาก' },
    { id: 'bird',      name: 'นก',       weight: 2,  rarity: 'หายากมาก' }
  ];

  const STAGE_NAMES = ['เมล็ด', 'ต้นอ่อน', 'ต้นกล้า', 'ต้นไม้หนุ่ม', 'ต้นไม้ใหญ่ออกดอก'];

  const BUILTIN = [
    ['🪥', 'แปรงฟันก่อนนอน'],
    ['🛏️', 'เก็บที่นอนตอนเช้า'],
    ['📚', 'อ่านหนังสือ 15 นาที'],
    ['🥦', 'กินผักให้หมด'],
    ['💧', 'ดื่มน้ำให้ครบ'],
    ['🧹', 'ช่วยกันเก็บของเข้าที่'],
    ['🚶', 'ออกกำลังกายด้วยกัน'],
    ['🙏', 'พูดขอบคุณกัน'],
    ['📵', 'งดมือถือตอนกินข้าว'],
    ['🤗', 'กอดกันก่อนนอน']
  ].map((m, i) => ({ id: 'b' + (i + 1), icon: m[0], title: m[1], builtIn: true, active: true }));

  /* ---------- วันที่ (เวลาไทย) และการสุ่มภารกิจจากวันที่ + รหัสบ้าน ---------- */
  function bangkokDate() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
  }
  function hashStr(s) {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickMissions(date, code, ids) {
    const rnd = mulberry32(hashStr(date + code));
    const a = ids.slice().sort();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 3);
  }

  /* ---------- สถานะเริ่มต้น ---------- */
  function fresh() {
    return {
      code: 'BAN123',
      me: 'dad',
      names: { dad: 'พ่อ', mom: 'แม่', kid: 'ลูก' },
      stars: 0,
      treeProgress: 0,   // ดาวที่ต้นไม้ต้นนี้ได้รับ (2 ดาว = โต 1 ขั้น)
      treeNumber: 1,
      garden: [],
      gifts: 0,
      streak: 0,
      challengeLen: 7,
      collection: {},
      missions: BUILTIN.map(m => Object.assign({}, m)),
      rewards: [
        { id: 'r1', title: 'เลือกหนังเรื่องโปรดดูด้วยกัน' },
        { id: 'r2', title: 'ไอศกรีม 1 ถ้วย' },
        { id: 'r3', title: 'เลือกเมนูมื้อเย็น' }
      ],
      days: {},
      giftLog: []
    };
  }

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = Object.assign(fresh(), JSON.parse(raw)); return; }
    } catch (e) { /* ใช้ค่าเริ่มต้น */ }
    state = fresh();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ไม่เป็นไร */ }
  }

  const subs = [];
  function emit() { save(); subs.forEach(fn => fn()); }
  let uid = 0;
  const newId = p => p + Date.now().toString(36) + (uid++);

  function today() {
    const date = bangkokDate();
    if (!state.days[date]) {
      const ids = state.missions.filter(m => m.active).map(m => m.id);
      state.days[date] = { missionIds: pickMissions(date, state.code, ids), done: {} };
    }
    return state.days[date];
  }

  /* ---------- ข้อมูลที่ใช้วาดหน้าจอ ---------- */
  function view() {
    const day = today();
    const stage = Math.min(4, Math.floor(state.treeProgress / 2));
    return Object.assign({}, state, {
      date: bangkokDate(),
      stage,
      stageName: STAGE_NAMES[stage],
      todayMissions: day.missionIds
        .map(id => state.missions.find(m => m.id === id))
        .filter(Boolean)
        .map(m => Object.assign({}, m, { done: day.done[m.id] || {} }))
    });
  }

  /* ---------- การกระทำ ---------- */
  const A = {
    setRole(r) { if (ROLES[r]) { state.me = r; emit(); } },

    toggleDone(missionId, role) {
      const day = today();
      if (!day.missionIds.includes(missionId)) return;
      const d = day.done[missionId] || (day.done[missionId] = {});
      d[role] = !d[role];
      emit();
    },

    setLen(n) { if ([7, 21, 30].includes(n)) { state.challengeLen = n; emit(); } },

    toggleMission(id) {
      if (state.me === 'kid') return;
      const m = state.missions.find(x => x.id === id);
      if (m) { m.active = !m.active; emit(); }
    },
    addMission(icon, title) {
      title = (title || '').trim();
      if (state.me === 'kid' || !title) return false;
      state.missions.push({ id: newId('m'), icon, title, builtIn: false, active: true });
      emit(); return true;
    },
    addReward(title) {
      title = (title || '').trim();
      if (state.me === 'kid' || !title) return false;
      state.rewards.push({ id: newId('r'), title });
      emit(); return true;
    },
    removeReward(id) {
      if (state.me === 'kid') return;
      state.rewards = state.rewards.filter(r => r.id !== id);
      emit();
    },

    // เปิดกล่องของขวัญ: 85% สัตว์ / 15% รางวัลจริง
    openGift() {
      if (state.gifts <= 0) return null;
      state.gifts--;
      let result;
      if (state.rewards.length && Math.random() < 0.15) {
        const r = state.rewards[Math.floor(Math.random() * state.rewards.length)];
        result = { type: 'reward', title: r.title };
      } else {
        const total = ANIMALS.reduce((s, a) => s + a.weight, 0);
        let x = Math.random() * total, pick = ANIMALS[0];
        for (const a of ANIMALS) { x -= a.weight; if (x < 0) { pick = a; break; } }
        state.collection[pick.id] = (state.collection[pick.id] || 0) + 1;
        result = { type: 'animal', id: pick.id };
      }
      state.giftLog.push({ result, by: state.me, at: Date.now() });
      emit();
      return result;
    },

    plantTree() {
      if (Math.min(4, Math.floor(state.treeProgress / 2)) < 4) return;
      state.garden.push({ number: state.treeNumber, date: bangkokDate() });
      state.treeNumber++;
      state.treeProgress = 0;
      emit();
    },

    /* ----- ปุ่มทดสอบเฟส 1 ----- */
    devStar() { state.stars++; state.treeProgress = Math.min(8, state.treeProgress + 1); emit(); },
    devGift() { state.gifts++; emit(); },
    devAllAnimals() { ANIMALS.forEach(a => { state.collection[a.id] = (state.collection[a.id] || 0) + 1; }); emit(); },
    devAllDone() { const day = today(); day.missionIds.forEach(id => { day.done[id] = { dad: true, mom: true, kid: true }; }); emit(); },
    devStreak() { state.streak++; emit(); },
    devBreak() { state.streak = 0; emit(); },
    devReset() { state = fresh(); emit(); }
  };

  load();

  window.Store = {
    ROLES, ROLE_IDS, ANIMALS, STAGE_NAMES,
    view, act: A,
    subscribe(fn) { subs.push(fn); },
    animal: id => ANIMALS.find(a => a.id === id)
  };
})();
