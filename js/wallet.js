/**
 * Wallet tab: coupon tickets with live countdown and a redeem sheet.
 */
(function () {
  'use strict';
  const TU = window.TU;
  const { esc, baht, ico } = TU;
  const st = () => TU.state;

  let view = 'active'; // active | history

  const stateOf = (c) => (c.usedAt ? 'used' : c.expiresAt <= Date.now() ? 'expired' : 'active');

  function barcode(code) {
    let h = '';
    for (const ch of (code + code)) {
      const n = ch.charCodeAt(0);
      h += '<i style="width:' + (1 + (n % 3)) + 'px;margin-right:' + (1 + (n % 2)) + 'px"></i>';
    }
    return '<div class="bars" aria-hidden="true">' + h + '</div>';
  }

  function couponTicket(c) {
    const s = stateOf(c);
    const left = s === 'active' ? TU.timeLeft(c.expiresAt - Date.now()) : s === 'used' ? 'ใช้แล้ว' : 'หมดอายุ';
    return '<div class="ticket-wrap"><button class="ticket ticket--h coupon' + (s !== 'active' ? ' ticket--dim' : '') + '" type="button" style="--stub-w:108px" ' +
      'data-state="' + s + '" data-action="coupon-open" data-id="' + esc(c.id) + '">' +
      '<div class="ticket-main"><div class="t-sub">' + esc(TU.locShort(c.loc)) + '</div>' +
      '<div class="t-name">' + esc(c.stallName) + '</div><div class="t-sub">' + esc(c.title) + '</div>' +
      '<span class="code">' + esc(c.code) + '</span></div>' +
      '<div class="ticket-stub"><div class="off">' + esc(c.discountText) + '</div><div class="left">' + esc(left) + '</div></div></button></div>';
  }

  function render() {
    const all = st().coupons;
    const active = all.filter((c) => stateOf(c) === 'active');
    const history = all.filter((c) => stateOf(c) !== 'active');
    const saved = all.filter((c) => c.usedAt).reduce((a, c) => a + c.valueBaht, 0);
    const list = view === 'active' ? active : history;

    let body;
    if (list.length) {
      body = '<div class="list">' + list.map(couponTicket).join('') + '</div>';
    } else if (!TU.can('coupons')) {
      body = '<div class="empty">' + ico('lock') + '<p>แพ็กเกจ Free ยังไม่ได้รับคูปอง ปลดล็อกด้วย Eater Pass เพื่อรับคูปองทุกครั้งที่สุ่ม</p>' +
        '<button class="btn btn--gold btn--sm" type="button" data-action="upsell" data-feature="coupons">ดู Eater Pass ฿39</button></div>';
    } else if (view === 'active') {
      body = '<div class="empty">' + ico('ticket') + '<p>ยังไม่มีคูปองที่ใช้ได้ ไปสุ่มร้านอาหารแล้วคูปองจะเข้ากระเป๋าให้ทันที</p>' +
        '<button class="btn btn--gold btn--sm" type="button" data-action="go" data-tab="spin">ไปสุ่มเลย</button></div>';
    } else {
      body = '<div class="empty">' + ico('clock') + '<p>ยังไม่มีประวัติการใช้คูปอง</p></div>';
    }

    return '<div class="screen-head"><h1>กระเป๋าคูปอง</h1><p>คูปองจากการสุ่มของคุณ แสดงให้แม่ค้าดูตอนจ่ายเงิน</p></div>' +
      '<div class="saved">' + ico('coin', 'ico--lg') + '<div><div class="num">' + baht(saved) + '</div><p>ประหยัดแล้วจากคูปองที่ใช้ไป ' + all.filter((c) => c.usedAt).length + ' ใบ</p></div></div>' +
      '<div class="seg mt-16" role="group" aria-label="มุมมองคูปอง">' +
      '<button type="button" data-action="wallet-view" data-view="active" aria-pressed="' + (view === 'active') + '">ใช้ได้ (' + active.length + ')</button>' +
      '<button type="button" data-action="wallet-view" data-view="history" aria-pressed="' + (view === 'history') + '">ประวัติ (' + history.length + ')</button></div>' +
      '<div class="mt-16">' + body + '</div>';
  }

  function redeemHtml(c) {
    const s = stateOf(c);
    return '<div class="stack" style="position:relative">' +
      '<div><div class="t-sub">' + esc(TU.locShort(c.loc)) + '</div><div class="t-name" style="font-size:1.25rem">' + esc(c.stallName) + '</div>' +
      '<div class="muted">' + esc(c.title) + '</div></div>' +
      '<div class="big-code" aria-label="รหัสคูปอง">' + esc(c.code) + '</div>' + barcode(c.code) +
      '<div class="stat-pair"><div class="stat"><small>ส่วนลด</small><b>' + esc(c.discountText) + '</b></div>' +
      '<div class="stat"><small>' + (s === 'active' ? 'หมดอายุ' : 'สถานะ') + '</small><b>' + (s === 'active' ? TU.timeLeft(c.expiresAt - Date.now()).replace('เหลือ ', '') : s === 'used' ? 'ใช้แล้ว' : 'หมดอายุ') + '</b></div></div>' +
      '<p class="muted">ซื้อขั้นต่ำ ' + baht(c.minSpend) + ' · แสดงหน้านี้ให้แม่ค้าก่อนจ่ายเงิน</p>' +
      (s === 'active'
        ? '<button class="btn btn--crimson btn--lg btn--block" type="button" data-action="coupon-use" data-id="' + esc(c.id) + '">แม่ค้าเห็นแล้ว · ใช้คูปองนี้</button>'
        : '<button class="btn btn--ink-ghost btn--block" type="button" data-action="sheet-close">ปิด</button>') +
      (s === 'used' ? '<div class="stamp"><span>ใช้แล้ว</span></div>' : '') + '</div>';
  }

  const A = TU.actions;

  A['wallet-view'] = (el) => { TU.sfx.click(); view = el.dataset.view; TU.refresh(); };

  A['coupon-open'] = (el) => {
    const c = st().coupons.find((x) => x.id === el.dataset.id);
    if (!c) return;
    TU.sfx.click();
    TU.sheet.open({ title: 'คูปองของฉัน', html: redeemHtml(c) });
  };

  A['coupon-use'] = (el) => {
    const c = st().coupons.find((x) => x.id === el.dataset.id);
    if (!c || c.usedAt) return;
    c.usedAt = Date.now();
    TU.save();
    TU.sfx.coupon();
    TU.sheet.setBody(redeemHtml(c));
    setTimeout(() => { TU.sheet.close(); view = 'active'; TU.refresh(); TU.toast('ใช้คูปองแล้ว ประหยัด ' + baht(c.valueBaht)); }, 1100);
  };

  TU.screens.wallet = { render };
})();
