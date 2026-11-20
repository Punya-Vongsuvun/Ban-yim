/* ควบคุมหลัก: สลับหน้า รับการแตะ วาดหน้าจอใหม่เมื่อข้อมูลเปลี่ยน */
(function () {
  'use strict';
  const $ = function (s) { return document.querySelector(s); };
  const A = Store.act;
  let pickedIcon = '🧸';
  let modalBusy = false;

  function render() {
    const v = Store.view();
    const me = Store.ROLES[v.me];
    $('#whoChip').innerHTML = me.emoji + ' ' + Screens.esc(v.names[v.me] || me.name);
    Scene.update(v);
    $('#homeBody').innerHTML = Screens.home(v);
    $('#screen-challenge').innerHTML = Screens.challenge(v);
    $('#screen-collect').innerHTML = Screens.collect(v);
    $('#parentsHead').innerHTML = Screens.parentsHead(v);
    $('#parentsNote').innerHTML = Screens.parentsNote(v);
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
  function openGift() {
    if (modalBusy) return;
    const res = A.openGift();
    if (!res) return;
    modalBusy = true;
    const m = $('#modal');
    m.hidden = false;
    m.innerHTML = '<div class="modal-box"><div class="shake">🎁</div><p>กำลังเปิดกล่อง...</p></div>';
    setTimeout(function () {
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
    }, 1100);
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

  /* ---------- DEV: ปุ่มทดสอบเฟส 1 (เอาออกก่อนใช้งานจริง) ---------- */
  let devOpen = false;
  function renderDev(v) {
    const p = $('#devPanel');
    p.hidden = !devOpen;
    if (!devOpen) return;
    const roles = Store.ROLE_IDS.map(function (r) {
      return '<button class="dv' + (v.me === r ? ' on' : '') + '" data-action="devRole" data-role="' + r + '">' + Store.ROLES[r].emoji + ' ' + Store.ROLES[r].name + '</button>';
    }).join('');
    p.innerHTML = '<div class="dev-title">🛠 ปุ่มทดสอบ (เฉพาะเฟส 1)</div>' +
      '<div class="dev-row">เป็นใคร: ' + roles + '</div>' +
      '<div class="dev-row">' +
      '<button class="dv" data-action="devStar">+1 ดาว</button>' +
      '<button class="dv" data-action="devGift">+1 กล่องของขวัญ</button>' +
      '<button class="dv" data-action="devAllAnimals">+สัตว์ทุกชนิด</button>' +
      '<button class="dv" data-action="devAllDone">ภารกิจครบ 3 คน</button>' +
      '<button class="dv" data-action="devStreak">+1 วันท้าทาย</button>' +
      '<button class="dv" data-action="devBreak">ขาดวัน (เริ่มใหม่)</button>' +
      '<button class="dv danger" data-action="devReset">ล้างข้อมูลทดสอบ</button></div>';
  }

  /* ---------- การแตะทั้งหมด ---------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const d = el.dataset;
    const me = Store.view().me;
    switch (d.action) {
      case 'tab': showTab(d.tab); break;
      case 'toggleDone': A.toggleDone(d.id, me); break;
      case 'setLen': A.setLen(Number(d.len)); break;
      case 'openGift': openGift(); break;
      case 'closeModal': closeModal(); break;
      case 'plant': A.plantTree(); break;
      case 'toggleMission': A.toggleMission(d.id); break;
      case 'pickIcon': pickedIcon = d.icon; render(); break;
      case 'addMission': addMission(); break;
      case 'addReward': addReward(); break;
      case 'delReward': A.removeReward(d.id); break;
      case 'devToggle': devOpen = !devOpen; render(); break;
      case 'devRole': A.setRole(d.role); break;
      case 'devStar': A.devStar(); break;
      case 'devGift': A.devGift(); break;
      case 'devAllAnimals': A.devAllAnimals(); break;
      case 'devAllDone': A.devAllDone(); break;
      case 'devStreak': A.devStreak(); break;
      case 'devBreak': A.devBreak(); break;
      case 'devReset': if (window.confirm('ล้างข้อมูลทดสอบทั้งหมด?')) A.devReset(); break;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'missionTitle') addMission();
    if (e.target.id === 'rewardTitle') addReward();
  });

  Store.subscribe(render);
  Scene.mount($('#scene'));
  render();
})();
