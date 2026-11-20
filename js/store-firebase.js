/* ข้อมูลกลางผ่าน Firebase (เฟส 2) — แทน mock-data.js
   หน้าจอเรียกใช้ window.Store เหมือนเดิม */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, setDoc, addDoc, updateDoc, deleteDoc, deleteField, onSnapshot,
  query, orderBy, limit,
  runTransaction, writeBatch, increment, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

/* ---------- ข้อมูลคงที่ ---------- */
const ROLES = {
  dad: { name: 'พ่อ', emoji: '👨', color: '#4C9BE8' },
  mom: { name: 'แม่', emoji: '👩', color: '#EF82A8' },
  kid: { name: 'ลูก', emoji: '🧒', color: '#F5A23B' },
  kid2: { name: 'ลูกคนที่ 2', emoji: '👦', color: '#9B7FD4' },
  kid3: { name: 'ลูกคนที่ 3', emoji: '👧', color: '#3FB8AF' }
};
const ROLE_IDS = ['dad', 'mom', 'kid', 'kid2', 'kid3'];
const DEFAULT_NAMES = { dad: 'พ่อเอ', mom: 'แม่ปาล์ม', kid: 'หนูปุ้ม', kid2: 'ปลื้ม', kid3: 'ปริม' };
// บทบาทที่ต้องมีเสมอ / บทบาทเสริม (ต้องทำภารกิจด้วยก็ต่อเมื่อมีคนเลือกบทบาทนั้นแล้ว)
const CORE_ROLES = ['dad', 'mom', 'kid'];
const isChild = r => r === 'kid' || r === 'kid2' || r === 'kid3';
// บทบาทที่ต้องทำภารกิจจึงจะนับดาว: dad, mom, kid เสมอ + kid2/kid3 ถ้ามีคนเลือกแล้ว
function activeRoles(roles) {
  return ROLE_IDS.filter(function (r) { return CORE_ROLES.indexOf(r) >= 0 || !!(roles && roles[r]); });
}

const ANIMALS = [
  { id: 'butterfly', name: 'ผีเสื้อ',  weight: 30, rarity: '' },
  { id: 'ladybug',   name: 'เต่าทอง',  weight: 22, rarity: '' },
  { id: 'bee',       name: 'ผึ้ง',     weight: 18, rarity: '' },
  { id: 'dragonfly', name: 'แมลงปอ',   weight: 14, rarity: '' },
  { id: 'snail',     name: 'หอยทาก',   weight: 8,  rarity: '' },
  { id: 'firefly',   name: 'หิ่งห้อย', weight: 6,  rarity: 'หายาก' },
  { id: 'bird',      name: 'นก',       weight: 2,  rarity: 'หายากมาก' },
  // ขั้น C: สัตว์เพิ่ม 13 ชนิด (รหัสต้องตรงกับ isOpeningGift ใน firestore.rules)
  { id: 'ant',         name: 'มด',        weight: 18, rarity: '' },
  { id: 'cricket',     name: 'จิ้งหรีด',   weight: 16, rarity: '' },
  { id: 'grasshopper', name: 'ตั๊กแตน',    weight: 14, rarity: '' },
  { id: 'caterpillar', name: 'หนอนผีเสื้อ', weight: 12, rarity: '' },
  { id: 'frog',        name: 'กบ',        weight: 11, rarity: '' },
  { id: 'chick',       name: 'ลูกเจี๊ยบ',   weight: 10, rarity: '' },
  { id: 'goldfish',    name: 'ปลาทอง',    weight: 8,  rarity: 'ไม่ค่อยเจอ' },
  { id: 'turtle',      name: 'เต่า',       weight: 7,  rarity: 'ไม่ค่อยเจอ' },
  { id: 'rabbit',      name: 'กระต่าย',    weight: 6,  rarity: 'ไม่ค่อยเจอ' },
  { id: 'squirrel',    name: 'กระรอก',    weight: 5,  rarity: 'ไม่ค่อยเจอ' },
  { id: 'hedgehog',    name: 'เม่น',       weight: 4,  rarity: 'ไม่ค่อยเจอ' },
  { id: 'owl',         name: 'นกฮูก',     weight: 3,  rarity: 'หายาก' },
  { id: 'deer',        name: 'กวางน้อย',   weight: 1.5, rarity: 'หายากมาก' }
];
// วันโชคดี: โอกาสได้กล่องฟรี 1 กล่อง/วัน = LUCKY_HEX3 / 4096 (205 ≈ 5%)
// ต้องตรงกับเกณฑ์ '0cd' (= 205) ใน firestore.rules (ฟังก์ชัน isLucky) ถ้าแก้ต้องแก้ทั้งสองที่แล้ววาง Rules ใหม่
const LUCKY_HEX3 = 205;
const STAGE_NAMES = ['เมล็ด', 'ต้นอ่อน', 'ต้นกล้า', 'ต้นไม้หนุ่ม', 'ต้นไม้ใหญ่ออกดอก'];

const BUILTIN = [
  ['🪥', 'แปรงฟันก่อนนอน'], ['🛏️', 'เก็บที่นอนตอนเช้า'], ['📚', 'อ่านหนังสือ 15 นาที'],
  ['🥦', 'กินผักให้หมด'], ['💧', 'ดื่มน้ำให้ครบ'], ['🧹', 'ช่วยกันเก็บของเข้าที่'],
  ['🚶', 'ออกกำลังกายด้วยกัน'], ['🙏', 'พูดขอบคุณกัน'], ['📵', 'งดมือถือตอนกินข้าว'],
  ['🤗', 'กอดกันก่อนนอน']
].map((m, i) => ({ id: 'b' + (i + 1), icon: m[0], title: m[1], builtIn: true, active: true, order: i + 1 }));

// ข้อความสั้นและอิโมจิ: ยาวไม่เกิน 60 ตัวอักษร (ต้องตรงกับ firestore.rules) แสดง 50 ข้อความล่าสุด
const EMOJIS = ['❤️', '😊', '👍', '🎉', '😘', '🤗', '😂', '⭐', '🙏', '😴', '🍚', '🏠'];
const MSG_MAX = 60;
const MSG_SHOW = 50;

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
// 12 บิตแรกของ SHA-256("วันที่:lucky:รหัสบ้าน") = 3 ตัวอักษรฐาน 16 แรก (เหมือนที่ Rules คำนวณ)
async function isLuckyDay(date, code) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(date + ':lucky:' + code));
  const b = new Uint8Array(buf);
  return ((b[0] << 4) | (b[1] >> 4)) < LUCKY_HEX3;
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
let luckyTried = null;           // บ้าน+วัน ที่เครื่องนี้ลองบันทึกวันโชคดีไปแล้ว (ไม่ลองซ้ำ)

function emptyS() { return { family: null, missions: null, rewards: null, messages: null, day: null, dayLoaded: false, dayKey: null, ensuredFor: null }; }

/* เวลาของข้อความล่าสุดที่เครื่องนี้เปิดอ่านแล้ว (เก็บในเครื่องแยกตามบ้าน ใช้ทำจุดแดง) */
let seenMs = 0;
function seenKey(id) { return 'banyim-seen-v1-' + id; }
function readSeen(id) {
  try { return Number(localStorage.getItem(seenKey(id))) || 0; } catch (e) { return 0; }
}
function writeSeen(id, ms) {
  try { localStorage.setItem(seenKey(id), String(ms)); } catch (e) { /* ไม่เป็นไร */ }
}

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
  seenMs = readSeen(id);
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
    ensureLucky(); checkReady();
  }, recheckMembership));
  unsubs.push(onSnapshot(collection(db, 'families', id, 'missions'), function (snap) {
    S.missions = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    ensureDay(); checkReady();
  }, recheckMembership));
  unsubs.push(onSnapshot(collection(db, 'families', id, 'rewards'), function (snap) {
    S.rewards = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    checkReady();
  }, recheckMembership));
  // ข้อความ: ฟังเฉพาะ 50 ข้อความล่าสุด (ไม่รอให้โหลดเสร็จก่อนเปิดแอป)
  unsubs.push(onSnapshot(query(collection(db, 'families', id, 'messages'), orderBy('at', 'desc'), limit(MSG_SHOW)), function (snap) {
    S.messages = snap.docs.map(function (d) {
      const x = d.data({ serverTimestamps: 'estimate' });
      return { id: d.id, from: x.from, text: String(x.text || ''), t: x.at && x.at.toMillis ? x.at.toMillis() : Date.now() };
    }).reverse();
    emit();
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
  ensureLucky();
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

// วันโชคดี: เครื่องแรกที่เปิดแอปวันนั้นบันทึก (transaction อ่านซ้ำก่อนเขียน กันได้ซ้ำ) กติกาจริงตรวจที่ Rules
async function ensureLucky() {
  if (!famId || !S.family || !S.dayKey) return;
  const key = famId + S.dayKey;
  if (luckyTried === key) return;
  const today = S.dayKey, id = famId;
  if (S.family.luckyDate === today) { luckyTried = key; return; }
  luckyTried = key;
  try {
    if (!(await isLuckyDay(today, id))) return;
    await runTransaction(db, async function (tx) {
      const s = await tx.get(doc(db, 'families', id));
      if (!s.exists() || s.data().luckyDate === today) return;
      tx.update(doc(db, 'families', id), { gifts: increment(1), luckyDate: today });
    });
  } catch (e) {
    console.warn('บันทึกวันโชคดีไม่สำเร็จ', e);
  }
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
  const messages = (S.messages || []).map(function (m) {
    return Object.assign({}, m, { mine: m.from === me.role, isEmoji: EMOJIS.indexOf(m.text) >= 0 });
  });
  return {
    messages,
    unread: messages.filter(function (m) { return !m.mine && m.t > seenMs; }).length,
    code: famId,
    me: me.role,
    names,
    roles: f.roles || {},
    activeRoles: activeRoles(f.roles),
    stars: f.stars || 0,
    treeStars: f.treeStars || 0,
    treeNumber: f.treeNumber || 1,
    garden: f.garden || [],
    gifts: f.gifts || 0,
    luckyToday: f.luckyDate === S.dayKey,
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
// ภารกิจครบทุกคนที่อยู่ในบ้าน (พ่อ แม่ ลูก + ลูกคนที่ 2/3 ถ้ามี) 1 ข้อ = 1 ดาว | 2 ดาว = ต้นไม้โต 1 ขั้น | ทุก 3 ดาว = 1 กล่อง
// ต้นไม้เต็ม (8 ดาว) แล้วได้ดาวถัดไป: ย้ายลงสวนอัตโนมัติ เริ่มต้นใหม่ (ดาวนั้นเป็นของต้นใหม่)
// วันท้าทาย: นับวันละ 1 ครั้งเมื่อมีภารกิจครบทุกคนข้อแรก ครบ challengeLen = +2 กล่อง แล้วเริ่มนับใหม่
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
      const allDone = activeRoles(fs.data().roles).every(function (r) { return r === role ? next : !!done[r]; });
      if (allDone && !(day.counted && day.counted[missionId])) {
        up['counted.' + missionId] = true;
        fu = countStar(fs.data(), today);
      }
      tx.update(dRef, up);
      if (fu) tx.update(fRef, fu);
    }));
  },
  // ส่งข้อความสั้น/อิโมจิ: คืน true ถ้าส่งคำขอแล้ว
  sendMessage(text) {
    text = String(text || '').trim();
    if (!text || Array.from(text).length > MSG_MAX) return false;
    run(addDoc(collection(db, 'families', famId, 'messages'), { from: myRole(), text, at: serverTimestamp() }));
    return true;
  },
  // เปิดหน้าข้อความแล้ว: จำว่าอ่านถึงข้อความล่าสุดแล้ว (จุดแดงหาย)
  markSeen() {
    if (!famId || !S.messages || !S.messages.length) return;
    const newest = S.messages[S.messages.length - 1].t;
    if (newest > seenMs) { seenMs = newest; writeSeen(famId, newest); emit(); }
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
  ROLES, ROLE_IDS, isChild, ANIMALS, STAGE_NAMES, DEFAULT_NAMES, EMOJIS, MSG_MAX,
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
