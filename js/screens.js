/* วาดหน้าจอต่างๆ จากข้อมูล (คืนค่าเป็น HTML) */
(function () {
  'use strict';
  const R = Store.ROLES;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function dots(done) {
    return Store.ROLE_IDS.map(function (r) {
      return '<span class="dot' + (done[r] ? ' on' : '') + '" style="--c:' + R[r].color + '"></span>';
    }).join('');
  }

  /* ---------- 1. บ้าน (ส่วนใต้ฉาก) ---------- */
  function home(v) {
    let h = '';

    // แถบดาว + ชื่อขั้นของต้นไม้
    const have = v.treeStars % 2;
    h += '<div class="card stars-card">' +
      '<div class="stars-row"><span class="big-star">⭐</span><span class="stars-num">' + v.stars + '</span><span class="stars-label">ดาวสะสม</span></div>' +
      '<div class="stage-name">ต้นไม้ของเรา: <b>' + esc(v.stageName) + '</b></div>';
    if (v.stage < 4) {
      h += '<div class="progress" aria-hidden="true"><i class="' + (have >= 1 ? 'on' : '') + '"></i><i></i></div>' +
        '<div class="hint">อีก ' + (2 - have) + ' ดาว ต้นไม้จะโตขึ้น</div>';
    } else {
      h += '<div class="hint">ต้นไม้โตเต็มที่แล้ว 🎉</div>' +
        '<button class="btn wide" data-action="plant">🌳 ปลูกต้นใหม่ในสวน</button>';
    }
    h += '</div>';

    // กล่องของขวัญ
    if (v.gifts > 0) {
      h += '<button class="gift-card" data-action="openGift"><span class="gift-ico">🎁</span>' +
        '<span><b>มีกล่องของขวัญ ' + v.gifts + ' กล่อง</b><br><small>แตะเพื่อเปิด</small></span></button>';
    }

    // ภารกิจวันนี้
    h += '<h2>ภารกิจวันนี้</h2><div class="list">';
    if (!v.todayMissions.length) {
      h += '<div class="card muted center">ยังไม่มีภารกิจวันนี้<br>(พ่อ/แม่เปิดใช้ภารกิจได้ในหน้า "พ่อแม่")</div>';
    }
    v.todayMissions.forEach(function (m) {
      const all = Store.ROLE_IDS.every(function (r) { return m.done[r]; });
      const mine = !!m.done[v.me];
      const who = Store.ROLE_IDS.filter(function (r) { return m.done[r]; }).map(function (r) { return R[r].name; });
      h += '<button class="mission' + (all ? ' all' : '') + (mine ? ' mine' : '') + '" data-action="toggleDone" data-id="' + m.id +
        '" aria-pressed="' + mine + '" aria-label="' + esc(m.title) + ' ทำแล้ว: ' + (who.join(' ') || 'ยังไม่มี') + '">' +
        '<span class="m-icon">' + m.icon + '</span>' +
        '<span class="m-title">' + esc(m.title) + '</span>' +
        '<span class="dots">' + dots(m.done) + '</span>' +
        (all ? '<span class="m-check">✔</span>' : '') + '</button>';
    });
    h += '</div>';
    h += '<div class="legend"><span><i class="dot on" style="--c:' + R.dad.color + '"></i> พ่อ</span>' +
      '<span><i class="dot on" style="--c:' + R.mom.color + '"></i> แม่</span>' +
      '<span><i class="dot on" style="--c:' + R.kid.color + '"></i> ลูก</span></div>' +
      '<p class="muted center">แตะแถวภารกิจเพื่อบอกว่า "ฉันทำแล้ว" (ต้องครบ 3 คนถึงจะนับ)</p>';
    return h;
  }

  /* ---------- 2. ท้าทาย ---------- */
  function challenge(v) {
    const len = v.challengeLen, done = Math.min(v.streak, len);
    let h = '<h2>ท้าทายต่อเนื่อง</h2><div class="seg" role="group" aria-label="จำนวนวัน">';
    [7, 21, 30].forEach(function (n) {
      h += '<button class="seg-btn' + (n === len ? ' on' : '') + '" data-action="setLen" data-len="' + n + '" aria-pressed="' + (n === len) + '">' + n + ' วัน</button>';
    });
    h += '</div><div class="card"><div class="streak-num">ทำต่อเนื่องแล้ว <b>' + done + '</b> / ' + len + ' วัน</div>' +
      '<div class="cal" aria-label="ปฏิทินวันที่ทำได้แล้ว">';
    for (let i = 1; i <= len; i++) {
      h += '<span class="cal-dot' + (i <= done ? ' on' : '') + '">' + (i <= done ? '✔' : i) + '</span>';
    }
    h += '</div></div>' +
      '<div class="card note"><p>📌 วันจะนับเมื่อมีภารกิจที่ครบ 3 คนอย่างน้อย 1 ข้อ</p>' +
      '<p>💔 ถ้าขาดวันไหน ต้องเริ่มนับใหม่</p>' +
      '<p>🎁 ทำครบ ' + len + ' วัน ได้กล่องของขวัญ 2 กล่อง</p></div>';
    return h;
  }

  /* ---------- 3. สะสม ---------- */
  function collect(v) {
    let h = '<h2>สมุดสะสมสัตว์</h2><div class="grid3">';
    Store.ANIMALS.forEach(function (a) {
      const n = v.collection[a.id] || 0;
      h += '<div class="pet' + (n ? '' : ' locked') + '">' +
        (a.rarity ? '<span class="rare">' + a.rarity + '</span>' : '') +
        '<div class="pet-art">' + (n ? Animals.icon(a.id, 64) : '<span class="qqq">???</span>') + '</div>' +
        '<div class="pet-name">' + (n ? esc(a.name) : '???') + '</div>' +
        (n ? '<div class="pet-n">× ' + n + '</div>' : '') + '</div>';
    });
    h += '</div><h2>สวนของเรา</h2>';
    if (!v.garden.length) {
      h += '<div class="card muted center">ยังไม่มีต้นไม้ในสวน 🌱<br>ดูแลต้นไม้ให้โตเต็มที่ก่อนนะ</div>';
    } else {
      h += '<div class="grid3">';
      v.garden.forEach(function (g) {
        h += '<div class="pet"><div class="pet-art tall">' + Scene.miniTree(4) + '</div><div class="pet-name">ต้นที่ ' + g.number + '</div></div>';
      });
      h += '</div>';
    }
    return h;
  }

  /* ---------- 4. พ่อแม่ ---------- */
  function parentsHead(v) {
    return '<span class="hello-emoji">' + R[v.me].emoji + '</span> สวัสดี ' + esc(v.names[v.me] || R[v.me].name);
  }
  function parentsNote(v) {
    return v.me === 'kid' ? '<div class="card note">👀 ลูกดูหน้านี้ได้อย่างเดียว แก้ไขไม่ได้นะ</div>' : '';
  }
  function houseCard(v) {
    return '<div class="card house-card"><div class="label">รหัสบ้าน (ให้คนในครอบครัวใส่ตอนเข้าร่วม)</div>' +
      '<div class="house-code">' + esc(v.code) + '</div>' +
      '<button class="btn wide" data-action="copyCode" data-code="' + esc(v.code) + '">คัดลอกรหัส</button></div>';
  }
  function memberList(v) {
    const canRelease = v.me !== 'kid';
    return Store.ROLE_IDS.map(function (r) {
      const taken = !!v.roles[r], mine = v.me === r;
      return '<div class="row-item"><span class="m-icon">' + R[r].emoji + '</span>' +
        '<span class="m-title">' + (taken ? esc(v.names[r]) : '<span class="muted">ยังว่าง</span>') +
        '<small>' + R[r].name + (mine ? ' (คุณ)' : '') + '</small></span>' +
        (canRelease && taken && !mine
          ? '<button class="btn-small" data-action="releaseRole" data-role="' + r + '" data-name="' + esc(v.names[r]) + '">ปล่อยบทบาท</button>' : '') +
        '</div>';
    }).join('');
  }
  function missionList(v) {
    const ro = v.me === 'kid';
    return v.missions.map(function (m) {
      return '<div class="row-item">' +
        '<span class="m-icon">' + m.icon + '</span>' +
        '<span class="m-title">' + esc(m.title) + '<small>' + (m.builtIn ? 'มากับแอป' : 'เพิ่มเอง') + '</small></span>' +
        '<button class="switch' + (m.active ? ' on' : '') + '" role="switch" aria-checked="' + m.active + '" aria-label="เปิดใช้ ' + esc(m.title) + '"' +
        (ro ? ' disabled' : '') + ' data-action="toggleMission" data-id="' + m.id + '"></button></div>';
    }).join('');
  }
  function rewardList(v) {
    const ro = v.me === 'kid';
    if (!v.rewards.length) return '<div class="card muted center">ยังไม่มีรางวัลจริง</div>';
    return v.rewards.map(function (r) {
      return '<div class="row-item"><span class="m-icon">🎀</span><span class="m-title">' + esc(r.title) + '</span>' +
        (ro ? '' : '<button class="icon-btn" data-action="delReward" data-id="' + r.id + '" aria-label="ลบ ' + esc(r.title) + '">🗑️</button>') + '</div>';
    }).join('');
  }
  const ICONS = ['🧸', '🍎', '🛁', '🐶', '🎒', '🧺', '🍽️', '🌱', '🎨', '🎵', '⚽', '🧼'];
  function iconPicker(sel) {
    return ICONS.map(function (i) {
      return '<button class="ic' + (i === sel ? ' on' : '') + '" data-action="pickIcon" data-icon="' + i + '" aria-pressed="' + (i === sel) + '">' + i + '</button>';
    }).join('');
  }

  window.Screens = { esc, home, challenge, collect, parentsHead, parentsNote, houseCard, memberList, missionList, rewardList, iconPicker };
})();
