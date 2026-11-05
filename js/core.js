/**
 * TU Food Pass — core: state, helpers, sheets, toast, confetti, router.
 * Everything hangs off window.TU. Screens live in their own files.
 */
window.TU = (function () {
  'use strict';

  const D = window.TUData;
  const KEY = 'tu_food_pass_v3';

  /* ---------- tiers (cumulative: each includes the one below) ---------- */

  const TIERS = {
    FREE: { rank: 0, name: 'Free', price: 0, short: 'ใช้ฟรี' },
    EATER_PASS: { rank: 1, name: 'Eater Pass', price: 39, short: 'สุ่มแล้วได้คูปอง' },
    MEAL_PLAN: { rank: 2, name: 'Meal Plan', price: 79, short: 'จัดแผน 7 วัน 21 มื้อ' },
    VIP: { rank: 3, name: 'VIP', price: 99, short: 'สายมู + สุขภาพ + สุ่มกับเพื่อน' }
  };
  const TIER_ORDER = ['FREE', 'EATER_PASS', 'MEAL_PLAN', 'VIP'];
  const FEATURE_TIER = { coupons: 'EATER_PASS', plan: 'MEAL_PLAN', mystic: 'VIP', party: 'VIP', health: 'VIP' };

  /* ---------- state ---------- */

  function defaults() {
    return {
      tier: 'FREE',
      name: '',
      tab: 'spin',
      sound: true,
      clockHour: null,
      spin: { mode: 'solo', loc: 'ALL', type: 'ALL', diet: [], openOnly: false, friends: ['ฉัน', 'มินต์', 'บอล'] },
      stalls: { loc: 'ALL', type: 'ALL', openOnly: false },
      coupons: [],
      plan: null,
      planDay: 0
    };
  }

  let state = defaults();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const base = defaults();
      state = Object.assign(base, saved, {
        spin: Object.assign(base.spin, saved.spin || {}),
        stalls: Object.assign(base.stalls, saved.stalls || {})
      });
      if (!TIERS[state.tier]) state.tier = 'FREE';
    } catch (e) { /* private mode or bad JSON: start fresh */ }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function reset() {
    state = defaults();
    save();
  }

  /* ---------- small helpers ---------- */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const baht = (n) => '฿' + Math.round(n).toLocaleString('en-US');
  const pad2 = (n) => String(n).padStart(2, '0');
  const hh = (h) => pad2(h % 24) + ':00';
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function ico(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function glyph(typeId, cls) {
    const id = D.foodTypes.some((t) => t.id === typeId) ? typeId : 'ALL';
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#f-' + id + '"/></svg>';
  }
  /* Photo slot: shows stall.photo when the owner adds one, otherwise a drawn glyph. */
  function tile(stall, big) {
    const inner = stall.photo
      ? '<img src="' + esc(stall.photo) + '" alt="" loading="lazy">'
      : glyph(stall.foodType);
    return '<span class="tile' + (big ? ' tile--lg' : '') + '">' + inner + '</span>';
  }

  const stallById = (id) => D.stalls.find((s) => s.id === id);
  const locById = (id) => D.locations.find((l) => l.id === id);
  const typeById = (id) => D.foodTypes.find((t) => t.id === id);
  const locShort = (id) => (locById(id) || {}).shortName || id;

  const tierInfo = () => TIERS[state.tier];
  const can = (feature) => TIERS[state.tier].rank >= TIERS[FEATURE_TIER[feature]].rank;

  function hour() {
    return state.clockHour == null ? new Date().getHours() : state.clockHour;
  }
  const isOpenAt = (s, h) => s.openTime <= h && h < s.closeTime;
  const isOpen = (s) => isOpenAt(s, hour());

  /* Rough baht value of a stall's coupon. Free toppings are estimated at 10 baht. */
  function couponValue(stall) {
    const c = stall.couponDeal;
    if (!c) return 0;
    const pct = /(\d+)\s*%/.exec(c.discountText);
    if (pct) return Math.round((stall.avgPrice * Number(pct[1])) / 100);
    const flat = /(\d+)\s*฿/.exec(c.discountText);
    if (flat) return Number(flat[1]);
    return 10;
  }

  /* Returns { coupon, duplicate }. Skips if an active coupon for this stall already exists. */
  function issueCoupon(stall) {
    const now = Date.now();
    const dup = state.coupons.find((c) => c.stallId === stall.id && !c.usedAt && c.expiresAt > now);
    if (dup) return { coupon: dup, duplicate: true };
    const d = stall.couponDeal;
    const coupon = {
      id: 'CPN-' + now.toString(36).toUpperCase(),
      stallId: stall.id,
      stallName: stall.name,
      loc: stall.location,
      title: d.title,
      discountText: d.discountText,
      code: d.code,
      minSpend: d.minSpend,
      valueBaht: couponValue(stall),
      issuedAt: now,
      expiresAt: now + d.validHours * 3600 * 1000,
      usedAt: null
    };
    state.coupons.unshift(coupon);
    save();
    return { coupon, duplicate: false };
  }

  function timeLeft(ms) {
    if (ms <= 0) return 'หมดอายุแล้ว';
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    return h > 0 ? 'เหลือ ' + h + ' ชม. ' + (m % 60) + ' น.' : 'เหลือ ' + Math.max(1, m) + ' น.';
  }

  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sound ---------- */

  function applySound() {
    if (!window.TUAudio) return;
    if (window.TUAudio.isMuted() === state.sound) window.TUAudio.toggleMute();
  }
  const sfx = {
    click() { window.TUAudio && window.TUAudio.click(); },
    tick(n) { window.TUAudio && window.TUAudio.tickStep(n); },
    win() { window.TUAudio && window.TUAudio.fanfare(); },
    coupon() { window.TUAudio && window.TUAudio.couponUnlock(); }
  };

  /* ---------- toast ---------- */

  let toastTimer = 0;
  function toast(msg, icon) {
    const el = document.getElementById('toast');
    el.innerHTML = ico(icon || 'check', 'ico--sm') + '<span>' + esc(msg) + '</span>';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------- sheet (bottom modal) ---------- */

  const sheet = (function () {
    let current = null;

    function open(opts) {
      close(true);
      const layer = document.getElementById('layer');
      const backdrop = document.createElement('div');
      backdrop.className = 'backdrop';
      backdrop.dataset.action = 'sheet-close';

      const el = document.createElement('div');
      el.className = 'sheet';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', opts.title || 'หน้าต่าง');
      el.tabIndex = -1;
      el.innerHTML =
        '<div class="sheet-grab" aria-hidden="true"></div>' +
        '<div class="sheet-head"><h2>' + esc(opts.title || '') + '</h2>' +
        '<button class="icon-btn" type="button" data-action="sheet-close" aria-label="ปิด">' + ico('close') + '</button></div>' +
        '<div class="sheet-body">' + opts.html + '</div>';

      layer.append(backdrop, el);
      document.getElementById('app').setAttribute('inert', '');
      current = { el, backdrop, opener: document.activeElement, onClose: opts.onClose };

      requestAnimationFrame(() => {
        backdrop.classList.add('show');
        el.classList.add('show');
        el.focus({ preventScroll: true });
      });
      attachDrag(el);
      if (opts.onMount) opts.onMount(el.querySelector('.sheet-body'));
      return el.querySelector('.sheet-body');
    }

    function setBody(html, title) {
      if (!current) return;
      current.el.querySelector('.sheet-body').innerHTML = html;
      if (title) current.el.querySelector('h2').textContent = title;
    }

    function close(immediate) {
      if (!current) return;
      const c = current;
      current = null;
      document.getElementById('app').removeAttribute('inert');
      c.backdrop.classList.remove('show');
      c.el.classList.remove('show');
      c.el.style.transform = '';
      const remove = () => { c.backdrop.remove(); c.el.remove(); };
      if (immediate || reducedMotion()) remove(); else setTimeout(remove, 380);
      if (c.opener && c.opener.focus) { try { c.opener.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      if (c.onClose) c.onClose();
    }

    function attachDrag(el) {
      const grab = el.querySelector('.sheet-grab');
      let startY = 0, dy = 0, dragging = false;
      grab.addEventListener('touchstart', (e) => {
        dragging = true; startY = e.touches[0].clientY; dy = 0; el.classList.add('dragging');
      }, { passive: true });
      grab.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        dy = Math.max(0, e.touches[0].clientY - startY);
        el.style.transform = 'translate(-50%, ' + dy + 'px)';
      }, { passive: true });
      const end = () => {
        if (!dragging) return;
        dragging = false; el.classList.remove('dragging');
        if (dy > 110) close(); else el.style.transform = '';
      };
      grab.addEventListener('touchend', end);
      grab.addEventListener('touchcancel', end);
    }

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return { open, close, setBody, isOpen: () => !!current };
  })();

  /* ---------- confetti (canvas, offline) ---------- */

  function confetti() {
    if (reducedMotion()) return;
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ['#e8b94b', '#f2d37c', '#f8f0e0', '#bd2a45', '#f8e6b0'];
    const pieces = Array.from({ length: 90 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 60,
      y: h * 0.42,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 15 - 3,
      s: Math.random() * 7 + 5,
      r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() < 0.25,
      a: 1
    }));
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.42; p.vx *= 0.992; p.r += p.vr;
        if (frames > 50) p.a -= 0.025;
        if (p.a > 0 && p.y < h + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.a);
          ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
          if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.28); ctx.fill(); }
          else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          ctx.restore();
        }
      }
      frames++;
      if (alive && frames < 160) requestAnimationFrame(tick); else ctx.clearRect(0, 0, w, h);
    })();
  }

  /* ---------- mascot: runs in, jumps for joy, runs off ---------- */

  const mascot = (function () {
    const LINES = ['เฮ! ได้แล้ว', 'อร่อยแน่!', 'ไปกินกัน!', 'ปังมาก!'];
    function preload() { const i = new Image(); i.src = 'img/mascot.png'; }
    function cheer(line) {
      if (reducedMotion()) return;
      const old = document.getElementById('mascot');
      if (old) old.remove();
      const el = document.createElement('div');
      el.id = 'mascot';
      el.className = 'mascot';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="mascot-run"><div class="mascot-hop"><span class="mascot-bubble">' +
        esc(line || pick(LINES)) + '</span><img src="img/mascot.png" alt=""></div></div>';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3300);
    }
    return { preload, cheer };
  })();

  /* ---------- router + actions ---------- */

  const screens = {};
  const actions = {};
  const TABS = ['spin', 'stalls', 'plan', 'wallet', 'pass'];

  function renderTab(tab) {
    const host = document.getElementById('screen-' + tab);
    const s = screens[tab];
    if (!host || !s) return;
    host.innerHTML = s.render();
    if (s.mount) s.mount(host);
  }

  function chrome() {
    const t = tierInfo();
    const chip = document.getElementById('tier-chip');
    chip.dataset.tier = state.tier;
    document.getElementById('tier-chip-label').textContent = t.name;
    chip.setAttribute('aria-label', 'แพ็กเกจของฉัน: ' + t.name);
    document.querySelectorAll('.tab').forEach((b) => {
      if (b.dataset.tab === state.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }

  function go(tab, opts) {
    if (!TABS.includes(tab)) tab = 'spin';
    const changed = tab !== state.tab;
    state.tab = tab;
    save();
    TABS.forEach((t) => { document.getElementById('screen-' + t).hidden = t !== tab; });
    renderTab(tab);
    chrome();
    if (changed || (opts && opts.top)) document.getElementById('scroll').scrollTop = 0;
  }

  function refresh() { renderTab(state.tab); chrome(); }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el, e);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && actions[el.dataset.change]) actions[el.dataset.change](el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && actions[el.dataset.input]) actions[el.dataset.input](el, e);
  });

  actions['go'] = (el) => { sfx.click(); go(el.dataset.tab); };
  actions['sheet-close'] = () => sheet.close();

  /* Locked feature → explain what it unlocks, then offer to buy. */
  function setTier(key, silent) {
    state.tier = key;
    save();
    chrome();
    if (!silent) toast('แพ็กเกจตอนนี้: ' + TIERS[key].name);
  }

  const api = {
    TIERS, TIER_ORDER, FEATURE_TIER, TABS,
    get state() { return state; },
    save, load, reset, defaults,
    esc, baht, pad2, hh, pick, ico, glyph, tile,
    stallById, locById, typeById, locShort,
    tierInfo, can, hour, isOpen, isOpenAt, couponValue, issueCoupon, timeLeft, reducedMotion,
    applySound, sfx, toast, sheet, confetti, mascot,
    screens, actions, go, refresh, renderTab, chrome, setTier,
    data: D
  };
  load();
  return api;
})();
