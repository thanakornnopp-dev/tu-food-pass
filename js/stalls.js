/**
 * Stalls tab: browse and filter every stall, open a detail sheet.
 */
(function () {
  'use strict';
  const TU = window.TU;
  const D = TU.data;
  const { esc, baht, ico } = TU;
  const st = () => TU.state;
  const typeLabel = (t) => t.name.replace(/\s*\(.*\)\s*$/, '');

  function filtered() {
    const f = st().stalls;
    let list = D.stalls.filter((s) =>
      (f.loc === 'ALL' || s.location === f.loc) &&
      (f.type === 'ALL' || s.foodType === f.type) &&
      (!f.openOnly || TU.isOpen(s)));
    return list.sort((a, b) => (TU.isOpen(b) - TU.isOpen(a)) || (b.rating - a.rating));
  }

  function chipRow(label, items, current, action) {
    return '<div class="chips" role="group" aria-label="' + label + '">' + items.map((i) =>
      '<button class="chip" type="button" data-action="' + action + '" data-id="' + esc(i.id) + '" aria-pressed="' + (i.id === current) + '">' + esc(i.label) + '</button>').join('') + '</div>';
  }

  function row(s) {
    const open = TU.isOpen(s);
    return '<div class="ticket-wrap"><button class="ticket ticket--side stall-row" type="button" data-action="open-stall" data-id="' + esc(s.id) + '">' +
      TU.tile(s) +
      '<div class="grow"><div class="t-name">' + esc(s.name) + '</div>' +
      '<div class="meta"><span class="tag ' + (open ? 'tag--open' : 'tag--closed') + '">' + (open ? 'เปิดอยู่' : 'ปิดอยู่') + '</span>' +
      '<span class="t-sub">' + esc(TU.locShort(s.location)) + '</span>' +
      '<span class="t-sub" style="display:inline-flex;align-items:center;gap:2px">' + ico('star', 'ico--xs') + s.rating + '</span></div></div>' +
      '<div class="price"><div class="t-price">~' + baht(s.avgPrice) + '</div><small>' + esc(s.priceRange) + '</small></div>' +
      '</button></div>';
  }

  function render() {
    const f = st().stalls;
    const list = filtered();
    const locs = D.locations.map((l) => ({ id: l.id, label: l.id === 'ALL' ? 'ทุกโรงอาหาร' : l.shortName }));
    const types = D.foodTypes.map((t) => ({ id: t.id, label: t.id === 'ALL' ? 'ทุกประเภท' : typeLabel(t) }));
    return '<div class="screen-head"><h1>ร้านค้าในมหาวิทยาลัย</h1><p>มธ. รังสิต · ' + D.stalls.length + ' ร้านตัวอย่าง</p></div>' +
      chipRow('โรงอาหาร', locs, f.loc, 'stalls-loc') +
      '<div class="mt-12">' + chipRow('ประเภทอาหาร', types, f.type, 'stalls-type') + '</div>' +
      '<div class="row row--between mt-12"><span class="muted">พบ ' + list.length + ' ร้าน</span>' +
      '<button class="chip" type="button" data-action="stalls-open" aria-pressed="' + f.openOnly + '">' + ico('clock', 'ico--xs') + 'เปิดอยู่ตอนนี้</button></div>' +
      '<div class="list mt-12">' +
      (list.length ? list.map(row).join('') :
        '<div class="empty">' + ico('store') + '<p>ไม่พบร้านที่ตรงกับตัวกรอง</p><button class="btn btn--ghost btn--sm" type="button" data-action="stalls-clear">ล้างตัวกรอง</button></div>') +
      '</div>';
  }

  function openStall(id) {
    const s = TU.stallById(id);
    if (!s) return;
    const open = TU.isOpen(s);
    const c = s.couponDeal;
    const owned = can_coupons();
    const couponBlock = !c ? '' : owned
      ? '<div class="ticket-wrap mt-16"><div class="ticket ticket--h" style="--stub-w:96px"><div class="ticket-main"><div class="t-sub">คูปองของร้านนี้</div><div class="t-name">' + esc(c.title) + '</div>' +
        '<div class="t-sub">ขั้นต่ำ ' + baht(c.minSpend) + ' · ใช้ได้ ' + c.validHours + ' ชม. หลังสุ่มได้</div></div>' +
        '<div class="ticket-stub"><div class="coupon"><div class="off">' + esc(c.discountText) + '</div></div></div></div></div>'
      : '<div class="ticket-wrap mt-16"><div class="ticket ticket--h" style="--stub-w:96px"><div class="ticket-main"><div class="t-name">ร้านนี้มีคูปอง ' + esc(c.discountText) + '</div>' +
        '<div class="t-sub">สุ่มได้ร้านนี้แล้วคูปองเข้ากระเป๋าทันที สำหรับ Eater Pass ขึ้นไป</div></div>' +
        '<div class="ticket-stub"><button class="btn btn--crimson btn--sm" type="button" data-action="upsell" data-feature="coupons">' + ico('lock', 'ico--sm') + '</button></div></div></div>';

    const html = '<div class="row" style="align-items:flex-start;gap:14px">' + TU.tile(s, true) +
      '<div style="min-width:0"><div class="t-name" style="font-size:1.25rem">' + esc(s.name) + '</div>' +
      '<div class="tags mt-12" style="margin-top:8px"><span class="tag">' + ico('pin', 'ico--xs') + esc(TU.locById(s.location).name.replace(/\s*\(.*\)/, '')) + '</span>' +
      '<span class="tag ' + (open ? 'tag--open' : 'tag--closed') + '">' + (open ? 'เปิดอยู่' : 'ปิดอยู่ตอนนี้') + '</span></div></div></div>' +
      '<div class="result-menu mt-16"><div><div class="label">เมนูแนะนำ</div><div class="val">' + esc(s.recommendedMenu) + '</div></div></div>' +
      '<div class="stat-pair"><div class="stat"><small>ช่วงราคา</small><b>' + esc(s.priceRange) + '</b></div>' +
      '<div class="stat"><small>พลังงาน</small><b>~' + s.calories + ' kcal</b></div>' +
      '<div class="stat"><small>เวลาเปิด</small><b>' + TU.hh(s.openTime) + ' – ' + TU.hh(s.closeTime) + '</b></div>' +
      '<div class="stat"><small>คะแนน (ตัวอย่าง)</small><b>' + s.rating + ' <span style="font-size:0.8125rem;font-family:var(--font-body)">/ ' + s.reviewsCount + ' รีวิว</span></b></div></div>' +
      '<div class="tags mt-16">' + s.tags.map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
      couponBlock +
      '<button class="btn btn--crimson btn--block mt-16" type="button" data-action="spin-here" data-loc="' + esc(s.location) + '">' + ico('spin', 'ico--sm') + 'สุ่มในโซน ' + esc(TU.locShort(s.location)) + '</button>';
    TU.sheet.open({ title: 'รายละเอียดร้าน', html: html });
  }

  function can_coupons() { return TU.can('coupons'); }

  const A = TU.actions;
  A['open-stall'] = (el) => { TU.sfx.click(); openStall(el.dataset.id); };
  A['stalls-loc'] = (el) => { TU.sfx.click(); st().stalls.loc = el.dataset.id; TU.save(); TU.refresh(); };
  A['stalls-type'] = (el) => { TU.sfx.click(); st().stalls.type = el.dataset.id; TU.save(); TU.refresh(); };
  A['stalls-open'] = () => { TU.sfx.click(); st().stalls.openOnly = !st().stalls.openOnly; TU.save(); TU.refresh(); };
  A['stalls-clear'] = () => { st().stalls = { loc: 'ALL', type: 'ALL', openOnly: false }; TU.save(); TU.refresh(); };
  A['spin-here'] = (el) => {
    TU.sheet.close(true);
    st().spin.loc = el.dataset.loc;
    st().spin.type = 'ALL';
    TU.save();
    TU.spinReset();
    TU.go('spin');
  };

  TU.openStall = openStall;
  TU.screens.stalls = { render };
})();
