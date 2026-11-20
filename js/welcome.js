/* หน้าต้อนรับ: สร้างบ้าน / เข้าร่วมด้วยรหัส / เลือกบทบาท */
(function () {
  'use strict';
  const R = Store.ROLES, N = Store.DEFAULT_NAMES;
  const esc = Screens.esc;

  let step = 'choose', code = '', info = null, msg = '', busy = false, lastKey = '';

  function roleBtn(r, action, taken) {
    return '<button class="btn role-btn' + (taken ? ' taken' : '') + '" data-action="' + action + '" data-role="' + r + '"' + (taken ? ' disabled' : '') + '>' +
      '<span class="role-emoji">' + R[r].emoji + '</span><span>' + esc(N[r]) + '<small>' + (taken ? 'มีคนเลือกแล้ว' : R[r].name) + '</small></span></button>';
  }

  function html(status, statusMsg) {
    const note = msg || statusMsg;
    let h = '<div class="welcome-box"><div class="welcome-logo">🏡</div><h1>บ้านยิ้ม</h1>';
    if (status === 'loading') {
      return h + '<p class="muted">กำลังโหลด...</p></div>';
    }
    if (status === 'error') {
      return h + '<p class="w-error">' + esc(statusMsg) + '</p><button class="btn wide" data-action="wRetry">ลองใหม่</button></div>';
    }
    if (note) h += '<p class="w-error" role="alert">' + esc(note) + '</p>';
    if (busy) return h + '<p class="muted">รอสักครู่...</p></div>';

    if (step === 'choose') {
      h += '<p class="muted">ครอบครัวเดียวกัน ภารกิจเดียวกัน</p>' +
        '<button class="btn wide big" data-action="wStep" data-step="create">🏠 สร้างบ้านใหม่</button>' +
        '<button class="btn wide big alt" data-action="wStep" data-step="join">🔑 เข้าร่วมบ้านที่มีอยู่</button>';
    } else if (step === 'create') {
      h += '<p>คุณคือใคร?</p><div class="role-list">' + roleBtn('dad', 'wCreate') + roleBtn('mom', 'wCreate') + '</div>' +
        '<button class="link" data-action="wStep" data-step="choose">← กลับ</button>';
    } else if (step === 'created') {
      h += '<p>สร้างบ้านเสร็จแล้ว! รหัสบ้านของเราคือ</p><div class="house-code">' + esc(code) + '</div>' +
        '<p class="muted">ให้คนในครอบครัวใส่รหัสนี้ตอนเข้าร่วม (ดูรหัสได้อีกในหน้า "พ่อแม่")</p>' +
        '<button class="btn wide big" data-action="wEnter">ไปที่บ้าน</button>';
    } else if (step === 'join') {
      h += '<p>ใส่รหัสบ้าน 6 ตัว</p>' +
        '<input id="wCode" class="code-input" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" maxlength="6" placeholder="ABC123" value="' + esc(code) + '">' +
        '<button class="btn wide big" data-action="wLookup">ถัดไป</button>' +
        '<button class="link" data-action="wStep" data-step="choose">← กลับ</button>';
    } else if (step === 'roles') {
      if (info.myRole) {
        h += '<p>ยินดีต้อนรับกลับ ' + R[info.myRole].emoji + ' ' + esc(N[info.myRole]) + '</p>' +
          '<button class="btn wide big" data-action="wEnter">เข้าบ้าน</button>';
      } else {
        h += '<p>คุณคือใคร? (บ้าน ' + esc(info.code) + ')</p><div class="role-list">' +
          Store.ROLE_IDS.map(function (r) { return roleBtn(r, 'wJoin', !!info.roles[r]); }).join('') + '</div>' +
          '<p class="muted">ถ้าบทบาทของคุณถูกจองไว้ ให้พ่อหรือแม่กด "ปล่อยบทบาท" ในหน้า "พ่อแม่" ก่อน</p>' +
          '<button class="link" data-action="wStep" data-step="join">← กลับ</button>';
      }
    }
    return h + '</div>';
  }

  function paint() {
    const el = document.getElementById('welcome');
    el.innerHTML = html(Store.status(), Store.statusMsg());
    const inp = document.getElementById('wCode');
    if (inp) {
      inp.addEventListener('input', function () { inp.value = Store.cleanCode(inp.value); code = inp.value; });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') handle('wLookup'); });
    }
  }

  function offlineMsg(e) {
    return (e && e.code && String(e.code).indexOf('unavailable') >= 0) || !navigator.onLine
      ? 'ต้องมีอินเทอร์เน็ตตอนสร้างหรือเข้าร่วมบ้าน' : 'ทำไม่สำเร็จ ลองใหม่อีกครั้ง';
  }

  async function handle(action, el) {
    msg = '';
    try {
      if (action === 'wStep') { step = el.dataset.step; paint(); return; }
      if (action === 'wRetry') { Store.retry(); return; }
      if (action === 'wEnter') { Store.enter(code || (info && info.code)); return; }
      if (action === 'wCreate') {
        busy = true; paint();
        code = await Store.createFamily(el.dataset.role);
        busy = false; step = 'created'; paint(); return;
      }
      if (action === 'wLookup') {
        code = Store.cleanCode((document.getElementById('wCode') || {}).value || code);
        if (code.length !== 6) { msg = 'รหัสบ้านต้องมี 6 ตัว'; paint(); return; }
        busy = true; paint();
        info = await Store.lookup(code);
        busy = false;
        if (!info) { msg = 'ไม่พบบ้านนี้ ตรวจรหัสอีกครั้งนะ'; step = 'join'; } else step = 'roles';
        paint(); return;
      }
      if (action === 'wJoin') {
        busy = true; paint();
        await Store.join(code, el.dataset.role);
        Store.enter(code);
        busy = false; return;
      }
    } catch (e) {
      console.error(e);
      busy = false;
      msg = e && e.message === 'role-taken' ? 'บทบาทนี้มีคนเลือกไปแล้ว' : offlineMsg(e);
      if (action === 'wJoin' && e && e.message === 'role-taken') { info = await Store.lookup(code).catch(function () { return info; }); }
      paint();
    }
  }

  window.Welcome = {
    // เรียกเมื่อสถานะยังไม่พร้อม (loading/welcome/error)
    show(status) {
      const el = document.getElementById('welcome');
      const key = status + '|' + Store.statusMsg();
      if (el.hidden) { el.hidden = false; step = 'choose'; code = ''; info = null; busy = false; msg = ''; lastKey = ''; }
      if (key !== lastKey) { lastKey = key; paint(); }
    },
    hide() { document.getElementById('welcome').hidden = true; msg = ''; lastKey = ''; },
    handle
  };
})();
