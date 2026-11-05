/**
 * Boot, presenter panel (triple-tap the logo), offline status, service worker.
 */
(function () {
  'use strict';
  const TU = window.TU;
  const { esc, ico } = TU;
  const st = () => TU.state;

  TU.offline = 'unsupported';

  /* ---------- presenter panel ---------- */

  const CLOCKS = [
    { h: null, label: 'เวลาจริง' },
    { h: 9, label: '09:00' },
    { h: 12, label: '12:00' },
    { h: 18, label: '18:00' },
    { h: 22, label: '22:00' }
  ];

  function presenterHtml() {
    const s = st();
    return '<div class="stack">' +
      '<div class="stack--sm stack"><div class="t-name">เลือกแพ็กเกจเพื่อสาธิต</div>' +
      '<div class="seg" role="group" aria-label="แพ็กเกจ">' + TU.TIER_ORDER.map((k, i) =>
        '<button type="button" data-action="p-tier" data-tier="' + k + '" aria-pressed="' + (s.tier === k) + '">' + ['Free', 'Eater', 'Plan', 'VIP'][i] + '</button>').join('') + '</div></div>' +
      '<div class="stack--sm stack"><div class="t-name">เวลาจำลอง (มีผลกับร้านที่เปิดอยู่)</div>' +
      '<div class="tags">' + CLOCKS.map((c) =>
        '<button class="chip" type="button" data-action="p-clock" data-h="' + (c.h == null ? '' : c.h) + '" aria-pressed="' + (s.clockHour === c.h) + '">' + c.label + '</button>').join('') + '</div></div>' +
      '<div class="setting"><span>เสียงประกอบ</span><button class="switch" type="button" role="switch" aria-checked="' + s.sound + '" aria-label="เสียงประกอบ" data-action="p-sound"></button></div>' +
      '<div class="muted" style="display:flex;gap:8px;align-items:center">' + offline() + '</div>' +
      '<button class="btn btn--ink-ghost btn--block" type="button" data-action="p-reset">ล้างข้อมูลทดลอง กลับเป็น Free</button>' +
      '<button class="btn btn--crimson btn--block" type="button" data-action="sheet-close">เสร็จแล้ว</button></div>';
  }

  function offline() {
    if (TU.offline === 'ready') return ico('check', 'ico--sm') + 'พร้อมใช้งานออฟไลน์';
    if (TU.offline === 'preparing') return ico('refresh', 'ico--sm') + 'กำลังเตรียมออฟไลน์…';
    return ico('x-circle', 'ico--sm') + 'ยังไม่แคชออฟไลน์ (เปิดผ่านเว็บ HTTPS)';
  }

  function openPresenter() {
    TU.sfx.click();
    TU.sheet.open({ title: 'แผงผู้นำเสนอ', html: presenterHtml() });
  }

  const A = TU.actions;
  A['p-tier'] = (el) => {
    TU.setTier(el.dataset.tier, true);
    if (typeof TU.spinReset === 'function') TU.spinReset();
    TU.sfx.coupon();
    TU.sheet.setBody(presenterHtml());
    TU.refresh();
    TU.toast('แพ็กเกจตอนนี้: ' + TU.TIERS[el.dataset.tier].name);
  };
  A['p-clock'] = (el) => {
    st().clockHour = el.dataset.h === '' ? null : Number(el.dataset.h);
    TU.save(); TU.sfx.click(); TU.sheet.setBody(presenterHtml()); TU.refresh();
  };
  A['p-sound'] = () => {
    st().sound = !st().sound;
    TU.save(); TU.applySound(); TU.sfx.click(); TU.sheet.setBody(presenterHtml()); TU.refresh();
  };
  let resetArmed = 0;
  A['p-reset'] = (el) => {
    if (Date.now() - resetArmed > 4000) {
      resetArmed = Date.now();
      el.textContent = 'แตะอีกครั้งเพื่อยืนยันการล้างข้อมูล';
      return;
    }
    TU.reset();
    TU.applySound();
    TU.spinReset();
    TU.sheet.close(true);
    TU.go('spin', { top: true });
    TU.toast('ล้างข้อมูลทดลองแล้ว', 'refresh');
  };

  /* ---------- triple-tap on logo ---------- */

  (function () {
    let taps = [];
    document.getElementById('brand').addEventListener('click', () => {
      const now = Date.now();
      taps = taps.filter((t) => now - t < 800);
      taps.push(now);
      if (taps.length >= 3) { taps = []; openPresenter(); }
      else if (taps.length === 1) TU.go('spin', { top: true });
    });
  })();

  /* ---------- service worker / offline ---------- */

  function setupOffline() {
    if (!('serviceWorker' in navigator) || location.protocol.indexOf('http') !== 0) return;
    TU.offline = 'preparing';
    navigator.serviceWorker.register('./sw.js').catch(() => { TU.offline = 'unsupported'; });
    navigator.serviceWorker.ready.then(() => {
      TU.offline = 'ready';
      if (st().tab === 'pass' && !TU.sheet.isOpen()) TU.refresh();
    });
  }

  /* ---------- boot ---------- */

  TU.applySound();
  TU.mascot.preload();
  TU.go(TU.TABS.includes(st().tab) ? st().tab : 'spin');
  setupOffline();

  // keep coupon countdowns fresh
  setInterval(() => {
    if (st().tab === 'wallet' && !TU.sheet.isOpen() && !document.hidden) TU.refresh();
  }, 30000);
})();
