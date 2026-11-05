/**
 * Pass tab: member pass, tier ladder, pretend checkout, upsell sheet, settings.
 */
(function () {
  'use strict';
  const TU = window.TU;
  const { esc, baht, ico } = TU;
  const st = () => TU.state;

  const TIER_FEATURES = {
    FREE: [
      [true, 'สุ่มร้านอาหาร พร้อมเมนูและราคา'],
      [true, 'ดูร้านและโซนทั้งหมดใน มธ. รังสิต'],
      [false, 'ไม่ได้รับคูปอง']
    ],
    EATER_PASS: [
      [true, 'สุ่มปุ๊บ ได้คูปองลดหรือของแถมทันที'],
      [true, 'กระเป๋าคูปองที่ใช้ได้แบบออฟไลน์'],
      [true, 'ดีลลับเฉพาะสมาชิกจากร้านพันธมิตร']
    ],
    MEAL_PLAN: [
      [true, 'ทุกอย่างใน Eater Pass'],
      [true, 'จัดแผน 7 วัน 21 มื้อ ตามงบที่ตั้ง'],
      [true, 'สรุปเงินที่ประหยัดเทียบกับค่าสมาชิก']
    ],
    VIP: [
      [true, 'ทุกอย่างใน Meal Plan'],
      [true, 'สุ่มสายมูตามสีมงคลประจำวัน'],
      [true, 'ตัวกรองสุขภาพ: คลีน ฮาลาล มังสวิรัติ แคลอรี'],
      [true, 'สุ่มกับเพื่อน พร้อมระบบค้าน (Veto)']
    ]
  };

  const UPSELL = {
    coupons: { icon: 'ticket', title: 'รับคูปองทุกครั้งที่สุ่ม', body: 'สุ่มได้ร้านไหน คูปองส่วนลดหรือของแถมของร้านนั้นเข้ากระเป๋าให้ทันที' },
    plan: { icon: 'plan', title: 'จัดแผนอาหาร 7 วัน', body: 'ตั้งงบรายสัปดาห์ แล้วให้ระบบจัด 21 มื้อพร้อมสรุปว่าประหยัดกว่าค่าสมาชิกเท่าไร' },
    mystic: { icon: 'sparkle', title: 'สุ่มสายมู', body: 'เลือกเมนูตามสีมงคลประจำวัน พร้อมคำอวยพรสำหรับวันนั้น' },
    party: { icon: 'users', title: 'สุ่มกับเพื่อน', body: 'สุ่มทั้งโต๊ะ ใครไม่เอาก็ค้านได้ จนกว่าทุกคนจะโอเค' },
    health: { icon: 'leaf', title: 'ตัวกรองสุขภาพ', body: 'กรองร้านตามคลีน ฮาลาล มังสวิรัติ หรือแคลอรีต่ำ' }
  };

  function barcode(seed) {
    let h = '';
    for (let i = 0; i < 38; i++) {
      const n = seed.charCodeAt(i % seed.length) + i * 7;
      h += '<i style="width:' + (1 + (n % 3)) + 'px;margin-right:' + (1 + (n % 3)) + 'px"></i>';
    }
    return '<div class="bars" aria-hidden="true">' + h + '</div>';
  }

  function offlineLine() {
    const o = TU.offline;
    if (o === 'ready') return ico('check', 'ico--sm') + 'พร้อมใช้งานออฟไลน์';
    if (o === 'preparing') return ico('refresh', 'ico--sm') + 'กำลังเตรียมไฟล์สำหรับออฟไลน์…';
    return ico('x-circle', 'ico--sm') + 'เปิดจากไฟล์ จึงยังไม่แคชออฟไลน์ (ใช้ผ่านเว็บ HTTPS แล้วเพิ่มลงหน้าจอโฮม)';
  }

  /* ---------- screen ---------- */

  function tierCard(key) {
    const cur = st().tier;
    const t = TU.TIERS[key];
    const isCur = key === cur;
    const higher = t.rank > TU.TIERS[cur].rank;
    const feats = TIER_FEATURES[key].map((f) =>
      '<li data-muted="' + (!f[0]) + '">' + ico(f[0] ? 'check' : 'close', 'ico--sm') + '<span>' + esc(f[1]) + '</span></li>').join('');
    return '<div class="tier-card" data-current="' + isCur + '"><div class="ticket-wrap"><article class="ticket ticket--side">' +
      '<div class="ticket-main"><div class="tier-head"><div class="name">' + esc(t.name) + (isCur ? '<span class="tag tag--gold">ใช้อยู่</span>' : '') + '</div>' +
      '<div class="price">' + (t.price ? baht(t.price) + '<small> / เดือน</small>' : 'ฟรี') + '</div></div>' +
      '<ul class="feat">' + feats + '</ul>' +
      (higher ? '<button class="btn btn--crimson btn--block" type="button" data-action="checkout" data-tier="' + key + '">อัปเกรดเป็น ' + esc(t.name) + '</button>' : '') +
      (!higher && !isCur ? '<button class="btn btn--ink-ghost btn--block" type="button" data-action="switch-tier" data-tier="' + key + '">' + (key === 'FREE' ? 'ยกเลิกแพ็กเกจ กลับเป็น Free' : 'เปลี่ยนมาใช้ ' + esc(t.name)) + '</button>' : '') +
      '</div></article></div></div>';
  }

  function render() {
    const s = st();
    const t = TU.tierInfo();
    const used = s.coupons.filter((c) => c.usedAt);
    const saved = used.reduce((a, c) => a + c.valueBaht, 0);
    const name = s.name || 'ชาว มธ.';
    const no = 'FP-' + (s.name ? String(Array.from(s.name).reduce((a, c) => a + c.charCodeAt(0), 0)).padStart(4, '0').slice(-4) : '0001');

    return '<div class="screen-head"><h1>บัตรของฉัน</h1><p>แพ็กเกจ สิทธิประโยชน์ และการตั้งค่า</p></div>' +
      '<div class="ticket-wrap passcard"><article class="ticket ticket--v ticket--gold" style="--stub-h:84px">' +
      '<div class="ticket-main"><div class="t-sub" style="color:var(--ink);font-weight:700">TU FOOD PASS · บัตรสมาชิก</div>' +
      '<div class="pass-tier">' + esc(t.name) + '</div>' +
      '<div class="t-sub" style="color:var(--ink)">' + esc(t.short) + '</div>' +
      '<button class="pass-edit" type="button" data-action="edit-name">' + esc(name) + ico('edit', 'ico--sm') + '</button></div>' +
      '<div class="ticket-stub">' + barcode(no + s.tier) + '<div class="pass-no">' + esc(no) + ' · บัตรตัวอย่าง</div></div></article></div>' +

      (TU.can('coupons')
        ? '<div class="saved mt-16">' + ico('coin', 'ico--lg') + '<div><div class="num">' + baht(saved) + '</div><p>ประหยัดสะสมจากคูปองที่ใช้ ' + used.length + ' ใบ เทียบกับค่าสมาชิก ' + baht(t.price) + ' ต่อเดือน</p></div></div>'
        : '') +

      '<h2 class="h2 mt-24" style="margin-bottom:12px">แพ็กเกจทั้งหมด</h2>' +
      '<div class="list">' + TU.TIER_ORDER.map(tierCard).join('') + '</div>' +

      '<h2 class="h2 mt-24" style="margin-bottom:4px">ตั้งค่า</h2>' +
      '<div class="setting"><span>เสียงประกอบ</span><button class="switch" type="button" role="switch" aria-checked="' + s.sound + '" aria-label="เสียงประกอบ" data-action="toggle-sound"></button></div>' +
      '<div class="setting"><span style="display:flex;gap:8px;align-items:center">' + offlineLine() + '</span></div>' +
      '<p class="fine mt-12">ร้านอาหาร ราคา คูปอง และคะแนนในแอปเป็นข้อมูลตัวอย่างสำหรับโปรเจกต์ TU109 การชำระเงินเป็นการจำลอง ไม่มีการตัดเงินจริง</p>';
  }

  /* ---------- sheets ---------- */

  function upsell(feature) {
    const u = UPSELL[feature];
    const key = TU.FEATURE_TIER[feature];
    const t = TU.TIERS[key];
    TU.sfx.click();
    TU.sheet.open({
      title: 'ฟีเจอร์ของ ' + t.name,
      html: '<div class="stack"><div class="row" style="gap:14px"><span class="tile tile--lg">' + ico(u.icon) + '</span>' +
        '<div><div class="t-name" style="font-size:1.25rem">' + esc(u.title) + '</div><div class="muted">อยู่ใน ' + esc(t.name) + ' · ' + baht(t.price) + ' / เดือน</div></div></div>' +
        '<p>' + esc(u.body) + '</p>' +
        '<button class="btn btn--crimson btn--lg btn--block" type="button" data-action="checkout" data-tier="' + key + '">ปลดล็อกด้วย ' + esc(t.name) + ' · ' + baht(t.price) + '</button>' +
        '<button class="btn btn--ink-ghost btn--block" type="button" data-action="sheet-close">ไว้ก่อน</button></div>'
    });
  }

  function checkout(key) {
    const t = TU.TIERS[key];
    const feats = TIER_FEATURES[key].filter((f) => f[0]).map((f) => '<li>' + ico('check', 'ico--sm') + '<span>' + esc(f[1]) + '</span></li>').join('');
    TU.sheet.open({
      title: 'ยืนยันแพ็กเกจ',
      html: '<div class="stack"><div class="ticket-wrap"><article class="ticket ticket--gold"><div class="ticket-main">' +
        '<div class="tier-head"><div class="name">' + esc(t.name) + '</div><div class="price">' + baht(t.price) + '<small> / เดือน</small></div></div>' +
        '<ul class="feat">' + feats + '</ul></div></article></div>' +
        '<div class="stat"><small>วิธีชำระเงิน</small><b>PromptPay (จำลอง)</b></div>' +
        '<p class="fine" style="color:var(--ink-2)">นี่คือการจำลองเพื่อสาธิต ไม่มีการตัดเงินจริง</p>' +
        '<button class="btn btn--crimson btn--lg btn--block" type="button" data-action="pay" data-tier="' + key + '">ชำระเงิน ' + baht(t.price) + ' (จำลอง)</button>' +
        '<button class="btn btn--ink-ghost btn--block" type="button" data-action="sheet-close">ยกเลิก</button></div>'
    });
  }

  const NEXT = {
    EATER_PASS: { tab: 'spin', label: 'ไปสุ่มรับคูปอง', line: 'ตอนนี้สุ่มทุกครั้งจะได้คูปองเข้ากระเป๋า' },
    MEAL_PLAN: { tab: 'plan', label: 'ไปจัดแผน 7 วัน', line: 'ตั้งงบแล้วให้ระบบจัด 21 มื้อให้เลย' },
    VIP: { tab: 'spin', mode: 'mystic', label: 'ลองสุ่มสายมู', line: 'ปลดล็อกสายมู ตัวกรองสุขภาพ และสุ่มกับเพื่อนแล้ว' }
  };

  /* ---------- actions ---------- */

  const A = TU.actions;
  A['upsell'] = (el) => upsell(el.dataset.feature);
  A['checkout'] = (el) => { TU.sfx.click(); checkout(el.dataset.tier); };

  A['pay'] = (el) => {
    const key = el.dataset.tier;
    el.disabled = true;
    el.textContent = 'กำลังดำเนินการ…';
    setTimeout(() => {
      TU.setTier(key, true);
      TU.sfx.coupon();
      TU.confetti();
      TU.mascot.cheer('ยินดีด้วย!');
      const n = NEXT[key];
      TU.sheet.setBody('<div class="center stack"><div class="success-mark">' + ico('check') + '</div>' +
        '<h3 class="h2">สมัคร ' + esc(TU.TIERS[key].name) + ' แล้ว</h3><p class="muted">' + n.line + '</p>' +
        '<button class="btn btn--crimson btn--lg btn--block" type="button" data-action="after-pay" data-tab="' + n.tab + '"' + (n.mode ? ' data-mode="' + n.mode + '"' : '') + '>' + n.label + '</button>' +
        '<button class="btn btn--ink-ghost btn--block" type="button" data-action="sheet-close">ไว้ทีหลัง</button></div>', 'สำเร็จ');
      TU.refresh();
    }, 900);
  };

  /* Move down to a lower tier. Coupons already in the wallet are kept. */
  const LOSES = {
    coupons: 'คูปองใหม่ทุกครั้งที่สุ่ม',
    plan: 'แผนอาหาร 7 วัน',
    mystic: 'สุ่มสายมู',
    party: 'สุ่มกับเพื่อน',
    health: 'ตัวกรองสุขภาพ'
  };
  A['switch-tier'] = (el) => {
    const key = el.dataset.tier;
    const t = TU.TIERS[key];
    const lost = Object.keys(LOSES).filter((f) => TU.TIERS[TU.FEATURE_TIER[f]].rank > t.rank).map((f) => LOSES[f]);
    TU.sfx.click();
    TU.sheet.open({
      title: 'เปลี่ยนเป็น ' + t.name + '?',
      html: '<div class="stack">' +
        (lost.length ? '<p>คุณจะไม่ได้ใช้สิ่งเหล่านี้อีก:</p><ul class="feat">' + lost.map((l) => '<li data-muted="true">' + ico('close', 'ico--sm') + '<span>' + esc(l) + '</span></li>').join('') + '</ul>' : '') +
        '<p class="muted">คูปองที่อยู่ในกระเป๋าแล้วยังใช้ได้ตามปกติ และกลับมาอัปเกรดได้ทุกเมื่อ</p>' +
        '<button class="btn btn--crimson btn--lg btn--block" type="button" data-action="confirm-switch" data-tier="' + key + '">ยืนยันเปลี่ยนเป็น ' + esc(t.name) + '</button>' +
        '<button class="btn btn--ink-ghost btn--block" type="button" data-action="sheet-close">ไว้ก่อน</button></div>'
    });
  };
  A['confirm-switch'] = (el) => {
    const key = el.dataset.tier;
    TU.setTier(key, true);
    TU.spinReset();
    TU.sheet.close();
    TU.refresh();
    TU.toast('เปลี่ยนเป็น ' + TU.TIERS[key].name + ' แล้ว', 'refresh');
  };

  A['after-pay'] = (el) => {
    TU.sheet.close(true);
    if (el.dataset.mode) { st().spin.mode = el.dataset.mode; TU.save(); }
    TU.spinReset();
    TU.go(el.dataset.tab);
  };

  A['toggle-sound'] = () => {
    st().sound = !st().sound;
    TU.save(); TU.applySound(); TU.sfx.click(); TU.refresh();
  };

  A['edit-name'] = () => {
    TU.sheet.open({
      title: 'ชื่อบนบัตร',
      html: '<form id="name-form" class="stack"><input class="input" id="name-input" maxlength="24" placeholder="เช่น สมชาย ใจดี" autocomplete="off" aria-label="ชื่อบนบัตร" value="' + esc(st().name) + '">' +
        '<button class="btn btn--crimson btn--lg btn--block" type="submit">บันทึก</button></form>',
      onMount: (root) => {
        root.querySelector('#name-form').addEventListener('submit', (e) => {
          e.preventDefault();
          st().name = root.querySelector('#name-input').value.trim();
          TU.save(); TU.sheet.close(); TU.refresh();
        });
      }
    });
  };

  TU.upsell = upsell;
  TU.checkout = checkout;
  TU.screens.pass = { render };
})();
