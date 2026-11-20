/* ข้อมูลกลางผ่าน Firebase (เฟส 2) — แทน mock-data.js
   หน้าจอเรียกใช้ window.Store เหมือนเดิม */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, setDoc, updateDoc, deleteDoc, deleteField, onSnapshot,
  runTransaction, writeBatch, increment, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

/* ---------- ข้อมูลคงที่ ---------- */
const ROLES = {
  dad: { name: 'พ่อ', emoji: '👨', color: '#4C9BE8' },
  mom: { name: 'แม่', emoji: '👩', color: '#EF82A8' },
  kid: { name: 'ลูก', emoji: '🧒', color: '#F5A23B' }
};
const ROLE_IDS = ['dad', 'mom', 'kid'];
const DEFAULT_NAMES = { dad: 'พ่อเอ', mom: 'แม่ปาล์ม', kid: 'หนูปุ้ม' };

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
  ['🪥', 'แปรงฟันก่อนนอน'], ['🛏️', 'เก็บที่นอนตอนเช้า'], ['📚', 'อ่านหนังสือ 15 นาที'],
  ['🥦', 'กินผักให้หมด'], ['💧', 'ดื่มน้ำให้ครบ'], ['🧹', 'ช่วยกันเก็บของเข้าที่'],
  ['🚶', 'ออกกำลังกายด้วยกัน'], ['🙏', 'พูดขอบคุณกัน'], ['📵', 'งดมือถือตอนกินข้าว'],
  ['🤗', 'กอดกันก่อนนอน']
].map((m, i) => ({ id: 'b' + (i + 1), icon: m[0], title: m[1], builtIn: true, active: true, order: i + 1 }));

const DEFAULT_REWARDS = ['เลือกหนังเรื่องโปรดดูด้วยกัน', 'ไอศกรีม 1 ถ้วย', 'เลือกเมนูมื้อเย็น'];

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // ตัดตัวที่สับสน O/0 I/1
const SESSION_KEY = 'banyim-session-v1';

/* ---------- วันที่ (เวลาไทย) และการสุ่มภารกิจจากวันที่ + รหัสบ้าน ---------- */
function bangkokDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}
function prevDate(d) {
  const t = new Date(d + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() - 1);
  return t.toISOString().slice(0, 10);
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
function genCode() {
  let s = '';
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}
function cleanCode(c) {
  return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

/* ---------- สถานะภายใน ---------- */
let auth, db, user = null;
let status = 'loading';         // loading | welcome | ready | error
let statusMsg = '';
let famId = null;
let S = emptyS();
let unsubs = [];
let dayUnsub = null;
const subs = [], errSubs = [];
let pending = false;

function emptyS() { return { family: null, missions: null, rewards: null, day: null, dayLoaded: false, dayKey: null, ensuredFor: null }; }

function emit() {
  if (pending) return;
  pending = true;
  queueMicrotask(function () { pending = false; subs.forEach(function (fn) { fn(); }); });
}
function setStatus(s, msg) { status = s; statusMsg = msg || ''; emit(); }

function friendly(e) {
  const c = (e && e.code) || '';
  if (c.indexOf('permission-denied') >= 0) return 'ไม่มีสิทธิ์ทำรายการนี้';
  if (c.indexOf('unavailable') >= 0 || c.indexOf('network') >= 0 || (e && e.message === 'offline')) return 'ไม่มีอินเทอร์เน็ต ลองใหม่อีกครั้ง';
  return 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง';
}
function fail(e) {
  console.error(e);
  const m = friendly(e);
  errSubs.forEach(function (fn) { fn(m); });
}
function run(p) { return Promise.resolve(p).catch(fail); }

const famRef = () => doc(db, 'families', famId);
const dayRef = () => doc(db, 'families', famId, 'days', S.dayKey);
const myUid = () => user.uid;

/* ---------- เริ่มต้น: ล็อกอินแบบไม่ระบุตัวตน แล้วดูว่าเคยเข้าบ้านไว้ไหม ---------- */
function savedSession() {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)); return s && s.familyId ? s.familyId : null; } catch (e) { return null; }
}
function saveSession(id) { try { localStorage.setItem(SESSION_KEY, JSON.stringify({ familyId: id })); } catch (e) { /* ไม่เป็นไร */ } }
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ไม่เป็นไร */ } }

async function init() {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    user = await new Promise(function (resolve, reject) {
      const off = onAuthStateChanged(auth, function (u) {
        if (u) { off(); resolve(u); }
        else signInAnonymously(auth).catch(reject);
      }, reject);
    });
    const id = savedSession();
    if (id) startFamily(id); else setStatus('welcome');
  } catch (e) {
    console.error(e);
    setStatus('error', 'เชื่อมต่อ Firebase ไม่สำเร็จ (ต้องมีอินเทอร์เน็ตตอนเปิดครั้งแรก)');
  }
}

/* ---------- ฟังข้อมูลของบ้านแบบเรียลไทม์ ---------- */
function stopFamily() {
  unsubs.forEach(function (u) { u(); });
  unsubs = [];
  if (dayUnsub) { dayUnsub(); dayUnsub = null; }
  famId = null; S = emptyS();
}
function leaveLocal(msg) {
  stopFamily(); clearSession();
  setStatus('welcome', msg || '');
}
async function recheckMembership() {
  if (!famId) return;
  try {
    const s = await getDoc(famRef());
    if (!s.exists() || !(myUid() in (s.data().members || {}))) leaveLocal('บทบาทของคุณในบ้านนี้ถูกปล่อยแล้ว กรุณาเข้าร่วมใหม่');
  } catch (e) { /* ออฟไลน์: ใช้ข้อมูลในเครื่องต่อไป */ }
}
function checkReady() {
  if (famId && S.family && S.missions && S.rewards && S.dayLoaded) setStatus('ready'); else emit();
}

function startFamily(id) {
  stopFamily();
  famId = id;
  saveSession(id);
  S = emptyS();
  setStatus('loading');
  unsubs.push(onSnapshot(famRef(), function (snap) {
    if (!snap.exists() || !(myUid() in (snap.data().members || {}))) {
      // ข้อมูลจากแคชในเครื่องอาจยังไม่ครบ จึงตัดสินใจเฉพาะเมื่อได้ข้อมูลจากเซิร์ฟเวอร์
      if (!snap.metadata.fromCache) {
        leaveLocal(snap.exists() ? 'บทบาทของคุณในบ้านนี้ถูกปล่อยแล้ว กรุณาเข้าร่วมใหม่' : 'ไม่พบบ้านนี้');
      }
      return;
    }
    S.family = snap.data();
    checkReady();
  }, recheckMembership));
  unsubs.push(onSnapshot(collection(db, 'families', id, 'missions'), function (snap) {
    S.missions = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    ensureDay(); checkReady();
  }, recheckMembership));
  unsubs.push(onSnapshot(collection(db, 'families', id, 'rewards'), function (snap) {
    S.rewards = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    checkReady();
  }, recheckMembership));
  watchDay();
}

function watchDay() {
  if (dayUnsub) { dayUnsub(); dayUnsub = null; }
  S.dayKey = bangkokDate(); S.day = null; S.dayLoaded = false; S.ensuredFor = null;
  const key = S.dayKey;
  dayUnsub = onSnapshot(doc(db, 'families', famId, 'days', key), function (snap) {
    if (key !== S.dayKey) return;
    S.day = snap.exists() ? snap.data() : null;
    S.dayLoaded = true;
    ensureDay(); checkReady();
  }, recheckMembership);
}

// เครื่องแรกที่เปิดแอปในวันนั้นสร้างข้อมูลของวัน (merge เพื่อไม่ทับข้อมูลที่อีกเครื่องแตะไปแล้ว)
function ensureDay() {
  if (!famId || !S.missions || !S.dayLoaded || S.day || S.ensuredFor === S.dayKey) return;
  S.ensuredFor = S.dayKey;
  const ids = S.missions.filter(function (m) { return m.active; }).map(function (m) { return m.id; });
  setDoc(dayRef(), { missionIds: pickMissions(S.dayKey, famId, ids) }, { merge: true }).catch(function (e) {
    console.warn('สร้างข้อมูลของวันไม่สำเร็จ', e);
  });
}

// ข้ามเที่ยงคืน (เวลาไทย) ให้เปลี่ยนไปใช้ข้อมูลของวันใหม่
function checkDateRoll() {
  if (famId && S.dayKey && bangkokDate() !== S.dayKey) watchDay();
}
setInterval(checkDateRoll, 30000);
document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDateRoll(); });

/* ---------- ข้อมูลสำหรับวาดหน้าจอ ---------- */
function view() {
  const f = S.family;
  const me = f.members[myUid()];
  const names = {};
  ROLE_IDS.forEach(function (r) {
    const uid = f.roles && f.roles[r];
    names[r] = (uid && f.members[uid] && f.members[uid].name) || DEFAULT_NAMES[r];
  });
  const missions = S.missions.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  const done = (S.day && S.day.done) || {};
  const ids = (S.day && S.day.missionIds) || [];
  const stage = Math.min(4, Math.floor((f.treeStars || 0) / 2));
  return {
    code: famId,
    me: me.role,
    names,
    roles: f.roles || {},
    stars: f.stars || 0,
    treeStars: f.treeStars || 0,
    treeNumber: f.treeNumber || 1,
    garden: f.garden || [],
    gifts: f.gifts || 0,
    streak: (f.lastCountedDate === S.dayKey || f.lastCountedDate === prevDate(S.dayKey)) ? (f.streak || 0) : 0,
    challengeLen: f.challengeLen || 7,
    collection: f.collection || {},
    missions,
    rewards: S.rewards.slice().sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); }),
    date: S.dayKey,
    stage,
    stageName: STAGE_NAMES[stage],
    todayMissions: ids
      .map(function (id) { return missions.find(function (m) { return m.id === id; }); })
      .filter(Boolean)
      .map(function (m) { return Object.assign({}, m, { done: done[m.id] || {} }); })
  };
}

const myRole = () => S.family.members[myUid()].role;
const newId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const parentOnly = () => myRole() === 'dad' || myRole() === 'mom';

/* ---------- กติกานับดาว (คืนค่าฟิลด์ของบ้านที่ต้องอัปเดต) ---------- */
// ภารกิจครบ 3 คน 1 ข้อ = 1 ดาว | 2 ดาว = ต้นไม้โต 1 ขั้น | ทุก 3 ดาว = 1 กล่อง
// ต้นไม้เต็ม (8 ดาว) แล้วได้ดาวถัดไป: ย้ายลงสวนอัตโนมัติ เริ่มต้นใหม่ (ดาวนั้นเป็นของต้นใหม่)
// วันท้าทาย: นับวันละ 1 ครั้งเมื่อมีภารกิจครบ 3 คนข้อแรก ครบ challengeLen = +2 กล่อง แล้วเริ่มนับใหม่
function countStar(f, today) {
  const fu = {};
  const stars = (f.stars || 0) + 1;
  let ts = f.treeStars || 0, tn = f.treeNumber || 1, gifts = f.gifts || 0;
  if (ts >= 8) {
    fu.garden = (f.garden || []).concat([{ number: tn, date: today }]);
    tn += 1; ts = 1;
  } else ts += 1;
  fu.stars = stars; fu.treeStars = ts; fu.treeNumber = tn;
  fu.treeStage = Math.min(4, Math.floor(ts / 2));
  if (stars % 3 === 0) gifts += 1;
  if (f.lastCountedDate !== today) {
    const prev = f.lastCountedDate === prevDate(today) ? (f.streak || 0) : 0;
    const ns = prev + 1;
    if (ns >= (f.challengeLen || 7)) { fu.streak = 0; gifts += 2; } else fu.streak = ns;
    fu.lastCountedDate = today;
  }
  fu.gifts = gifts;
  return fu;
}

/* ---------- การกระทำ ---------- */
const A = {
  // ติ๊กภารกิจ + นับดาว/ต้นไม้/กล่อง/ท้าทาย ใน transaction เดียว (กันนับซ้ำเมื่อกดพร้อมกัน)
  toggleDone(missionId) {
    const role = myRole(), dRef = dayRef(), fRef = famRef(), today = S.dayKey;
    run(runTransaction(db, async function (tx) {
      const ds = await tx.get(dRef);
      const fs = await tx.get(fRef);
      if (!ds.exists() || !fs.exists()) return;
      const day = ds.data();
      if (!(day.missionIds || []).includes(missionId)) return;
      const done = (day.done && day.done[missionId]) || {};
      const next = !done[role];
      const up = { ['done.' + missionId + '.' + role]: next, tick: { m: missionId } };
      let fu = null;
      const all3 = ROLE_IDS.every(function (r) { return r === role ? next : !!done[r]; });
      if (all3 && !(day.counted && day.counted[missionId])) {
        up['counted.' + missionId] = true;
        fu = countStar(fs.data(), today);
      }
      tx.update(dRef, up);
      if (fu) tx.update(fRef, fu);
    }));
  },
  setLen(n) {
    if ([7, 21, 30].includes(n)) run(updateDoc(famRef(), { challengeLen: n }));
  },
  toggleMission(id) {
    if (!parentOnly()) return;
    const m = S.missions.find(function (x) { return x.id === id; });
    if (m) run(updateDoc(doc(db, 'families', famId, 'missions', id), { active: !m.active }));
  },
  addMission(icon, title) {
    title = (title || '').trim();
    if (!parentOnly() || !title) return false;
    run(setDoc(doc(db, 'families', famId, 'missions', newId('m')), { icon, title, builtIn: false, active: true, order: Date.now() }));
    return true;
  },
  addReward(title) {
    title = (title || '').trim();
    if (!parentOnly() || !title) return false;
    run(setDoc(doc(db, 'families', famId, 'rewards', newId('r')), { title }));
    return true;
  },
  removeReward(id) {
    if (parentOnly()) run(deleteDoc(doc(db, 'families', famId, 'rewards', id)));
  },

  // พ่อ/แม่ปล่อยบทบาทของคนอื่น เพื่อให้เครื่องใหม่เลือกบทบาทนั้นได้
  releaseRole(role) {
    if (!parentOnly() || !S.family.roles || !S.family.roles[role] || S.family.roles[role] === myUid()) return;
    run(updateDoc(famRef(), {
      ['members.' + S.family.roles[role]]: deleteField(),
      ['roles.' + role]: deleteField()
    }));
  },

  // เปิดกล่องของขวัญ: 85% สัตว์ / 15% รางวัลจริง (ใช้ transaction กันเปิดซ้ำ)
  openGift() {
    const rewards = S.rewards.slice();
    return runTransaction(db, async function (tx) {
      const snap = await tx.get(famRef());
      if (!snap.exists() || (snap.data().gifts || 0) <= 0) return null;
      let result;
      const up = { gifts: increment(-1) };
      if (rewards.length && Math.random() < 0.15) {
        result = { type: 'reward', title: rewards[Math.floor(Math.random() * rewards.length)].title };
      } else {
        const total = ANIMALS.reduce(function (s, a) { return s + a.weight; }, 0);
        let x = Math.random() * total, pick = ANIMALS[0];
        for (const a of ANIMALS) { x -= a.weight; if (x < 0) { pick = a; break; } }
        result = { type: 'animal', id: pick.id };
        up['collection.' + pick.id] = increment(1);
      }
      tx.update(famRef(), up);
      tx.set(doc(collection(db, 'families', famId, 'giftLog')), { result, by: myRole(), at: serverTimestamp() });
      return result;
    }).catch(function (e) { fail(e); return null; });
  }
};

/* ---------- สร้างบ้าน / เข้าร่วม (ใช้จากหน้าต้อนรับ) ---------- */
function newFamilyDoc(code, role) {
  return {
    name: 'บ้านยิ้ม', code, createdAt: serverTimestamp(),
    members: { [myUid()]: { role, name: DEFAULT_NAMES[role] } },
    roles: { [role]: myUid() },
    stars: 0, treeStars: 0, treeStage: 0, treeNumber: 1, garden: [], gifts: 0,
    streak: 0, challengeLen: 7, lastCountedDate: null, collection: {}
  };
}

async function createFamily(role) {
  if (role !== 'dad' && role !== 'mom') throw new Error('bad-role');
  for (let i = 0; i < 6; i++) {
    const code = genCode();
    const ref = doc(db, 'families', code);
    const ok = await runTransaction(db, async function (tx) {
      if ((await tx.get(ref)).exists()) return false;
      tx.set(ref, newFamilyDoc(code, role));
      return true;
    });
    if (ok) {
      const b = writeBatch(db);
      BUILTIN.forEach(function (m) {
        b.set(doc(db, 'families', code, 'missions', m.id), { icon: m.icon, title: m.title, builtIn: true, active: true, order: m.order });
      });
      DEFAULT_REWARDS.forEach(function (t, k) { b.set(doc(db, 'families', code, 'rewards', 'r' + (k + 1)), { title: t }); });
      await b.commit();
      return code;
    }
  }
  throw new Error('code-collision');
}

async function lookup(code) {
  code = cleanCode(code);
  if (code.length !== 6) return null;
  const s = await getDoc(doc(db, 'families', code));
  if (!s.exists()) return null;
  const d = s.data();
  const mine = d.members && d.members[myUid()];
  return { code, roles: d.roles || {}, myRole: mine ? mine.role : null };
}

async function join(code, role) {
  code = cleanCode(code);
  const ref = doc(db, 'families', code);
  await runTransaction(db, async function (tx) {
    const s = await tx.get(ref);
    if (!s.exists()) throw new Error('not-found');
    const d = s.data();
    if (d.members && d.members[myUid()]) return;           // เคยเข้าแล้ว
    if (d.roles && d.roles[role]) throw new Error('role-taken');
    tx.update(ref, {
      ['members.' + myUid()]: { role, name: DEFAULT_NAMES[role] },
      ['roles.' + role]: myUid()
    });
  });
}

function enter(code) { startFamily(cleanCode(code)); }

window.Store = {
  ROLES, ROLE_IDS, ANIMALS, STAGE_NAMES, DEFAULT_NAMES,
  animal: id => ANIMALS.find(a => a.id === id),
  status: () => status,
  statusMsg: () => statusMsg,
  view, act: A,
  createFamily, lookup, join, enter, cleanCode,
  subscribe(fn) { subs.push(fn); },
  onError(fn) { errSubs.push(fn); },
  retry() { location.reload(); }
};

init();
