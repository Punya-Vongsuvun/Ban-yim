/* ควบคุมหลัก: สลับหน้า รับการแตะ วาดหน้าจอใหม่เมื่อข้อมูลเปลี่ยน */
(function () {
  'use strict';
  const $ = function (s) { return document.querySelector(s); };
  const A = Store.act;
  let pickedIcon = '🧸';
  let modalBusy = false;
  let toastTimer = null;
  let currentTab = 'home';
  let lastMsgId = '';

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
    // ข้อความ: ถ้ากำลังเปิดหน้านี้อยู่ ให้ถือว่าอ่านแล้ว และเลื่อนลงล่างสุดเมื่อมีข้อความใหม่
    const last = v.messages.length ? v.messages[v.messages.length - 1].id : '';
    $('#msgList').innerHTML = Screens.messages(v);
    if (currentTab === 'messages') {
      A.markSeen();
      if (last !== lastMsgId) window.scrollTo(0, document.body.scrollHeight);
    }
    lastMsgId = last;
    const badge = $('#msgBadge');
    badge.textContent = v.unread > 9 ? '9+' : String(v.unread);
    badge.hidden = v.unread === 0 || currentTab === 'messages';
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
  }

  /* ---------- สลับหน้า ---------- */
  function showTab(name) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === 'screen-' + name); });
    document.querySelectorAll('.tab').forEach(function (b) {
      const on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    currentTab = name;
    window.scrollTo(0, 0);
    if (name === 'messages') {
      A.markSeen();
      $('#msgBadge').hidden = true;
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  /* ---------- ข้อความ ---------- */
  function sendText() {
    const el = $('#msgText');
    if (A.sendMessage(el.value)) el.value = '';
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

  /* ---------- การแตะทั้งหมด ---------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const d = el.dataset;
    if (d.action.charAt(0) === 'w') { Welcome.handle(d.action, el); return; }
    switch (d.action) {
      case 'tab': showTab(d.tab); break;
      case 'sendMsg': sendText(); break;
      case 'sendEmoji': A.sendMessage(d.e); break;
      case 'toggleDone': A.toggleDone(d.id); break;
      case 'setLen': A.setLen(Number(d.len)); break;
      case 'openGift': openGift(); break;
      case 'closeModal': closeModal(); break;
      case 'toggleMission': A.toggleMission(d.id); break;
      case 'pickIcon': pickedIcon = d.icon; render(); break;
      case 'addMission': addMission(); break;
      case 'addReward': addReward(); break;
      case 'delReward': A.removeReward(d.id); break;
      case 'copyCode': copyCode(d.code); break;
      case 'releaseRole':
        if (window.confirm('ปล่อยบทบาทของ ' + d.name + ' ใช่ไหม? (เครื่องของ ' + d.name + ' จะต้องเข้าบ้านใหม่)')) A.releaseRole(d.role);
        break;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'msgText') sendText();
    if (e.target.id === 'missionTitle') addMission();
    if (e.target.id === 'rewardTitle') addReward();
  });

  Store.subscribe(render);
  Store.onError(toast);
  $('#emojiPanel').innerHTML = Screens.emojiPanel();
  Scene.mount($('#scene'));
  render();
})();
