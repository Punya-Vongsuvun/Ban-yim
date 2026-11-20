/* ควบคุมหลัก: สลับหน้า รับการแตะ วาดหน้าจอใหม่เมื่อข้อมูลเปลี่ยน */
(function () {
  'use strict';
  const $ = function (s) { return document.querySelector(s); };
  const A = Store.act;
  let pickedIcon = '🧸';
  let modalBusy = false;
  let toastTimer = null;

  function toast(text) {
    const t = $('#toast');
    t.textContent = text; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2800);
  }

  function render() {
    const st = Store.status();
    if (st !== 'ready') { Welcome.show(st); return; }
    Welcome.hide();
    const v = Store.view();
    $('#whoChip').innerHTML = Store.ROLES[v.me].emoji + ' ' + Screens.esc(v.names[v.me]);
    Scene.update(v);
    $('#homeBody').innerHTML = Screens.home(v);
    $('#screen-challenge').innerHTML = Screens.challenge(v);
    $('#screen-collect').innerHTML = Screens.collect(v);
    $('#parentsHead').innerHTML = Screens.parentsHead(v);
    $('#parentsNote').innerHTML = Screens.parentsNote(v);
    $('#houseCard').innerHTML = Screens.houseCard(v);
    $('#memberList').innerHTML = Screens.memberList(v);
    $('#missionList').innerHTML = Screens.missionList(v);
    $('#rewardList').innerHTML = Screens.rewardList(v);
    $('#iconPicker').innerHTML = Screens.iconPicker(pickedIcon);
    const ro = v.me === 'kid';
    $('#missionForm').hidden = ro;
    $('#rewardForm').hidden = ro;
    renderDev(v);
  }

  /* ---------- สลับหน้า ---------- */
  function showTab(name) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === 'screen-' + name); });
    document.querySelectorAll('.tab').forEach(function (b) {
      const on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  /* ---------- กล่องของขวัญ ---------- */
  async function openGift() {
    if (modalBusy) return;
    modalBusy = true;
    const m = $('#modal');
    m.hidden = false;
    m.innerHTML = '<div class="modal-box"><div class="shake">🎁</div><p>กำลังเปิดกล่อง...</p></div>';
    const started = Date.now();
    const res = await A.openGift();
    const wait = Math.max(0, 1100 - (Date.now() - started));
    setTimeout(function () {
      if (!res) { closeModal(); return; }
      let body;
      if (res.type === 'animal') {
        const a = Store.animal(res.id);
        body = '<div class="reveal-art">' + Animals.icon(res.id, 140) + '</div>' +
          '<h3>ได้ ' + Screens.esc(a.name) + '!</h3>' +
          (a.rarity ? '<p class="rare-big">✨ ' + a.rarity + ' ✨</p>' : '') +
          '<p class="muted">ไปอยู่ในสวนของเราแล้ว</p>';
      } else {
        body = '<div class="reveal-art big">🎉</div><h3>ได้รางวัลจริง!</h3><p class="prize">' + Screens.esc(res.title) + '</p>';
      }
      m.innerHTML = '<div class="modal-box reveal">' + body + '<button class="btn wide" data-action="closeModal">เยี่ยมเลย</button></div>';
    }, wait);
  }
  function closeModal() {
    const m = $('#modal');
    m.hidden = true; m.innerHTML = ''; modalBusy = false;
  }

  /* ---------- ฟอร์มพ่อแม่ ---------- */
  function addMission() {
    const el = $('#missionTitle');
    if (A.addMission(pickedIcon, el.value)) el.value = '';
  }
  function addReward() {
    const el = $('#rewardTitle');
    if (A.addReward(el.value)) el.value = '';
  }
  function copyCode(code) {
    const done = function () { toast('คัดลอกรหัสแล้ว'); };
    try { navigator.clipboard.writeText(code).then(done, function () { toast('รหัสบ้านคือ ' + code); }); }
    catch (e) { toast('รหัสบ้านคือ ' + code); }
  }

  /* ---------- DEV: ปุ่มทดสอบ (เอาออกหลังเฟส 3) ---------- */
  let devOpen = false;
  function renderDev(v) {
    const p = $('#devPanel');
    p.hidden = !devOpen;
    if (!devOpen) return;
    p.innerHTML = '<div class="dev-title">🛠 ปุ่มทดสอบ (เอาออกหลังเฟส 3)</div>' +
      '<div class="dev-row">เครื่องนี้คือ: ' + Store.ROLES[v.me].emoji + ' ' + Screens.esc(v.names[v.me]) + '</div>' +
      '<div class="dev-row">' +
      '<button class="dv" data-action="devStar">+1 ดาว</button>' +
      '<button class="dv" data-action="devGift">+1 กล่องของขวัญ</button>' +
      '<button class="dv" data-action="devAllAnimals">+สัตว์ทุกชนิด</button>' +
      '<button class="dv" data-action="devAllDone">ภารกิจครบ 3 คน</button>' +
      '<button class="dv" data-action="devStreak">+1 วันท้าทาย</button>' +
      '<button class="dv" data-action="devBreak">ขาดวัน (เริ่มใหม่)</button>' +
      '<button class="dv danger" data-action="devReset">ล้างดาว/ต้นไม้/สัตว์</button>' +
      '<button class="dv danger" data-action="devLeave">ออกจากบ้านในเครื่องนี้</button></div>';
  }

  /* ---------- การแตะทั้งหมด ---------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const d = el.dataset;
    if (d.action.charAt(0) === 'w') { Welcome.handle(d.action, el); return; }
    switch (d.action) {
      case 'tab': showTab(d.tab); break;
      case 'toggleDone': A.toggleDone(d.id); break;
      case 'setLen': A.setLen(Number(d.len)); break;
      case 'openGift': openGift(); break;
      case 'closeModal': closeModal(); break;
      case 'plant': A.plantTree(); break;
      case 'toggleMission': A.toggleMission(d.id); break;
      case 'pickIcon': pickedIcon = d.icon; render(); break;
      case 'addMission': addMission(); break;
      case 'addReward': addReward(); break;
      case 'delReward': A.removeReward(d.id); break;
      case 'copyCode': copyCode(d.code); break;
      case 'releaseRole':
        if (window.confirm('ปล่อยบทบาทของ ' + d.name + ' ใช่ไหม? (เครื่องของ ' + d.name + ' จะต้องเข้าบ้านใหม่)')) A.releaseRole(d.role);
        break;
      case 'devToggle': devOpen = !devOpen; render(); break;
      case 'devStar': A.devStar(); break;
      case 'devGift': A.devGift(); break;
      case 'devAllAnimals': A.devAllAnimals(); break;
      case 'devAllDone': A.devAllDone(); break;
      case 'devStreak': A.devStreak(); break;
      case 'devBreak': A.devBreak(); break;
      case 'devReset': if (window.confirm('ล้างดาว ต้นไม้ สัตว์ และกล่องของขวัญของบ้านนี้?')) A.devReset(); break;
      case 'devLeave': if (window.confirm('ออกจากบ้านในเครื่องนี้? (บทบาทยังถูกจองไว้ จนกว่าพ่อ/แม่จะปล่อย)')) { devOpen = false; A.devLeave(); } break;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'missionTitle') addMission();
    if (e.target.id === 'rewardTitle') addReward();
  });

  Store.subscribe(render);
  Store.onError(toast);
  Scene.mount($('#scene'));
  render();
})();
