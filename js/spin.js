/**
 * Spin tab: ticket reel, result ticket, lucky-colour mode, party veto mode.
 */
(function () {
  'use strict';
  const TU = window.TU;
  const D = TU.data;
  const { esc, baht, ico } = TU;
  const st = () => TU.state;

  /* Session state for the spin screen (not persisted). */
  const S = {
    phase: 'idle',      // idle | spinning | done
    winner: null,
    coupon: null,
    couponDup: false,
    accepted: false,
    fresh: false,       // play the "print" animation once
    preview: null,
    vetoed: [],         // stall ids rejected this party session
    vetoUsed: [],       // friend indexes who spent their veto
    pending: []         // friend indexes vetoing the current proposal
  };

  const SPIN_MS = 3100;
  const LANES = 24;

  /* Which food types suit each weekday's lucky colour (see TUData.muteluDays). */
  const MYSTIC_TYPES = {
    0: ['HEALTHY_HALAL', 'A_LA_CARTE', 'RICE_CURRY'],
    1: ['JAPAN_INTER', 'DESSERT_SNACK', 'DRINK_CAFE'],
    2: ['A_LA_CARTE', 'RICE_CURRY', 'DRINK_CAFE'],
    3: ['NOODLE', 'JAPAN_INTER', 'DRINK_CAFE'],
    4: ['NOODLE', 'RICE_CURRY', 'A_LA_CARTE'],
    5: ['HEALTHY_HALAL', 'NOODLE', 'DRINK_CAFE'],
    6: ['RICE_CURRY', 'JAPAN_INTER', 'DRINK_CAFE']
  };

  const DIETS = [
    { id: 'CLEAN', label: 'คลีน', test: (s) => s.dietary.includes('CLEAN_FOOD') },
    { id: 'HALAL', label: 'ฮาลาล', test: (s) => s.dietary.some((d) => d === 'HALAL' || d === 'HALAL_FRIENDLY') },
    { id: 'VEG', label: 'มังสวิรัติ', test: (s) => s.dietary.some((d) => d.indexOf('VEGETARIAN') === 0) },
    { id: 'LOWCAL', label: '≤ 450 kcal', test: (s) => s.calories <= 450 }
  ];

  const typeLabel = (t) => t.name.replace(/\s*\(.*\)\s*$/, '');
  const today = () => D.muteluDays[new Date().getDay()];

  function normaliseMode() {
    const sp = st().spin;
    if ((sp.mode === 'mystic' && !TU.can('mystic')) || (sp.mode === 'party' && !TU.can('party'))) sp.mode = 'solo';
  }

  function pool() {
    const sp = st().spin;
    let p = D.stalls.slice();
    if (sp.loc !== 'ALL') p = p.filter((s) => s.location === sp.loc);
    if (sp.mode === 'mystic') {
      const types = MYSTIC_TYPES[new Date().getDay()];
      p = p.filter((s) => types.includes(s.foodType));
    } else if (sp.type !== 'ALL') {
      p = p.filter((s) => s.foodType === sp.type);
    }
    if (sp.openOnly) p = p.filter(TU.isOpen);
    if (TU.can('health') && sp.diet.length) {
      p = p.filter((s) => sp.diet.every((id) => DIETS.find((d) => d.id === id).test(s)));
    }
    if (sp.mode === 'party') p = p.filter((s) => !S.vetoed.includes(s.id));
    return p;
  }

  function resetSession() {
    S.phase = 'idle'; S.winner = null; S.coupon = null; S.couponDup = false;
    S.accepted = false; S.fresh = false; S.preview = null;
    S.vetoed = []; S.vetoUsed = []; S.pending = [];
  }

  /* ---------- markup ---------- */

  function reelItem(s) {
    return '<div class="reel-item"><div class="reel-ticket">' + TU.tile(s) +
      '<div class="grow"><div class="t-name">' + esc(s.name) + '</div>' +
      '<div class="t-sub">' + esc(TU.locShort(s.location)) + ' · ~' + baht(s.avgPrice) + '</div></div></div></div>';
  }
  function mysteryItem() {
    return '<div class="reel-item is-center"><div class="reel-ticket reel-ticket--mystery"><div>' +
      '<div class="q" aria-hidden="true">?</div><div class="t-sub">กด “สุ่มเลย” เพื่อเลือกร้านให้คุณ</div></div></div></div>';
  }

  function idleStrip() {
    if (!S.preview) {
      const p = D.stalls.slice().sort(() => Math.random() - 0.5);
      S.preview = [p[0], p[1]];
    }
    return reelItem(S.preview[0]) + mysteryItem() + reelItem(S.preview[1]);
  }

  function selectHtml(id, label, action, options, value) {
    return '<label class="field"><span>' + label + '</span><select class="select" id="' + id + '" data-change="' + action + '">' +
      options.map((o) => '<option value="' + esc(o.id) + '"' + (o.id === value ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('') +
      '</select></label>';
  }

  function filtersHtml(sp) {
    const locs = D.locations.map((l) => ({ id: l.id, label: l.id === 'ALL' ? 'ทุกโรงอาหาร' : l.shortName }));
    const types = D.foodTypes.map((t) => ({ id: t.id, label: typeLabel(t) }));
    let h = '<div class="' + (sp.mode === 'mystic' ? '' : 'grid-2') + '">' +
      selectHtml('f-loc', 'โรงอาหาร', 'spin-loc', locs, sp.loc) +
      (sp.mode === 'mystic' ? '' : selectHtml('f-type', 'ประเภทอาหาร', 'spin-type', types, sp.type)) + '</div>';

    const healthOn = TU.can('health');
    h += '<div class="chips mt-12" role="group" aria-label="ตัวกรองเพิ่มเติม">' +
      '<button class="chip" type="button" data-action="spin-open" aria-pressed="' + sp.openOnly + '">' + ico('clock', 'ico--xs') + 'เปิดอยู่ตอนนี้</button>' +
      DIETS.map((d) => {
        const on = healthOn && sp.diet.includes(d.id);
        return '<button class="chip" type="button" data-action="spin-diet" data-id="' + d.id + '" aria-pressed="' + on + '">' +
          (healthOn ? ico('leaf', 'ico--xs') : ico('lock', 'ico--xs')) + d.label + '</button>';
      }).join('') + '</div>';
    return h;
  }

  function luckyHtml() {
    const m = today();
    return '<div class="lucky mt-12"><div class="lucky-swatch" style="--sw:' + m.colorHex + '" aria-hidden="true"></div>' +
      '<div><h3>' + esc(m.dayName.replace(/\s*\(.*\)/, '')) + ' · ' + esc(m.luckyColor) + '</h3>' +
      '<p>' + esc(m.blessing) + '</p><p class="fine">ให้โชคเลือกร้านตามสีมงคล เพื่อความบันเทิงเท่านั้น</p></div></div>';
  }

  function partyHtml() {
    const f = st().spin.friends;
    const live = S.phase === 'done' && !S.accepted;
    const allUsed = f.every((_, i) => S.vetoUsed.includes(i));
    let h = '<div class="party mt-12"><div class="row row--between"><h3 class="h2" style="font-size:1.0625rem">โต๊ะนี้มี ' + f.length + ' คน</h3>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-action="friends">' + ico('edit', 'ico--sm') + 'แก้ไข</button></div>' +
      '<div class="avatars">';
    f.forEach((name, i) => {
      let state = '', badge = '';
      if (S.accepted) { state = 'ok'; badge = ico('check', 'ico--xs'); }
      else if (S.pending.includes(i)) { state = 'veto'; badge = ico('close', 'ico--xs'); }
      else if (S.vetoUsed.includes(i)) { state = 'used'; badge = ico('close', 'ico--xs'); }
      const disc = '<span class="avatar-disc">' + esc(Array.from(name)[0] || '?') + (badge ? '<span class="badge">' + badge + '</span>' : '') + '</span>';
      const label = '<span>' + esc(name) + '</span>';
      if (live && !S.vetoUsed.includes(i)) {
        h += '<button class="avatar" type="button" data-action="veto" data-i="' + i + '" data-state="' + state + '" aria-pressed="' + S.pending.includes(i) + '" aria-label="' + esc(name) + ' ค้านร้านนี้">' + disc + label + '</button>';
      } else {
        h += '<div class="avatar" data-state="' + state + '">' + disc + label + '</div>';
      }
    });
    h += '</div>';
    if (live) {
      h += '<p class="fine mt-12">' + (allUsed ? 'ทุกคนใช้สิทธิ์ค้านครบแล้ว ร้านนี้คือคำตอบสุดท้าย' : 'ใครไม่เอาร้านนี้ แตะชื่อตัวเองเพื่อค้านได้ คนละ 1 ครั้ง') + '</p>';
    } else if (!S.accepted) {
      h += '<p class="fine mt-12">กดสุ่ม แล้วให้เพื่อนแตะชื่อเพื่อค้าน ถ้าทุกคนโอเคค่อยเคาะ</p>';
    } else {
      h += '<p class="fine mt-12">ทุกคนตกลงแล้ว ไปกินกันเลย</p>';
    }
    return h + '</div>';
  }

  function stubHtml(s) {
    if (!S.accepted) {
      return '<div class="grow"><div class="t-name">รอทุกคนโหวต</div><div class="t-sub">คูปองจะเข้ากระเป๋าเมื่อทุกคนตกลง</div></div>' + ico('users');
    }
    if (S.coupon) {
      return '<div class="stub-coupon grow"><div class="t-sub">' + (S.couponDup ? 'มีคูปองร้านนี้ในกระเป๋าแล้ว' : 'คูปองเข้ากระเป๋าแล้ว') + '</div>' +
        '<div class="t-name">' + esc(S.coupon.title) + '</div></div>' +
        '<div class="stub-coupon"><div class="big">' + esc(S.coupon.discountText) + '</div></div>';
    }
    if (!TU.can('coupons')) {
      const c = s.couponDeal;
      return '<span class="stub-lock">' + ico('lock') + '</span><div class="grow"><div class="t-name">ร้านนี้มีคูปอง ' + esc(c ? c.discountText : '') + '</div>' +
        '<div class="t-sub">ปลดล็อกด้วย Eater Pass ฿39/เดือน</div></div>' +
        '<button class="btn btn--crimson btn--sm" type="button" data-action="upsell" data-feature="coupons">ปลดล็อก</button>';
    }
    return '<div class="grow"><div class="t-name">วันนี้ร้านนี้ไม่มีคูปอง</div></div>';
  }

  function resultHtml() {
    const s = S.winner;
    const open = TU.isOpen(s);
    const sp = st().spin;
    let lucky = '';
    if (sp.mode === 'mystic' && S.accepted) {
      const m = today();
      lucky = '<div class="result-lucky"><i style="--sw:' + m.colorHex + '"></i><span>เมนูมงคลวันนี้ · ' + esc(m.luckyColor.split('/')[0].trim()) + '</span></div>';
    }
    return '<div class="result' + (S.fresh ? ' fresh' : '') + '" id="result"><div class="slot" aria-hidden="true"></div>' +
      '<div class="ticket-wrap"><article class="ticket ticket--v" style="--stub-h:92px">' +
      '<div class="ticket-main">' +
      '<div class="row row--between"><div class="tags"><span class="tag">' + ico('pin', 'ico--xs') + esc(TU.locShort(s.location)) + '</span>' +
      (S.accepted && sp.mode === 'party' ? '<span class="tag tag--gold">โต๊ะนี้ตกลงแล้ว</span>' : '') + '</div>' +
      '<span class="tag ' + (open ? 'tag--open' : 'tag--closed') + '">' + (open ? 'เปิดอยู่' : 'ปิดอยู่ตอนนี้') + '</span></div>' +
      '<h2 class="result-name">' + esc(s.name) + '</h2>' +
      '<div class="result-menu">' + TU.tile(s) + '<div><div class="label">เมนูแนะนำ</div><div class="val">' + esc(s.recommendedMenu) + '</div></div></div>' +
      lucky +
      '<dl class="facts"><div><dt>ราคาเฉลี่ย</dt><dd>~' + baht(s.avgPrice) + '</dd></div>' +
      '<div><dt>พลังงาน</dt><dd>' + s.calories + ' kcal</dd></div>' +
      '<div><dt>เวลาเปิด</dt><dd>' + TU.pad2(s.openTime) + '–' + TU.pad2(s.closeTime % 24) + '</dd></div></dl>' +
      '<div class="tags">' + s.tags.slice(0, 3).map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
      '</div><div class="ticket-stub">' + stubHtml(s) + '</div></article></div></div>';
  }

  function dockHtml() {
    const sp = st().spin;
    if (S.phase === 'spinning') {
      return '<div class="dock"><button class="btn btn--gold btn--lg btn--block" type="button" disabled>กำลังสุ่ม…</button></div>';
    }
    if (S.phase === 'done' && sp.mode === 'party' && !S.accepted) {
      const names = S.pending.map((i) => sp.friends[i]).join(', ');
      const veto = S.pending.length > 0;
      return '<div class="dock"><button class="btn btn--gold btn--lg btn--block" type="button" data-action="party-confirm">' +
        (veto ? ico('refresh') + 'ค้านโดย ' + esc(names) + ' · สุ่มใหม่' : ico('check') + 'ทุกคนโอเค ไปกินเลย') + '</button>' +
        '<button class="btn btn--ghost btn--sm btn--block" type="button" data-action="party-reset">เริ่มโต๊ะใหม่</button></div>';
    }
    if (S.phase === 'done') {
      return '<div class="dock"><button class="btn btn--gold btn--lg btn--block" type="button" data-action="spin">' + ico('spin') + 'สุ่มอีกครั้ง</button>' +
        '<div class="grid-2"><button class="btn btn--ghost btn--sm" type="button" data-action="open-stall" data-id="' + esc(S.winner.id) + '">ดูรายละเอียดร้าน</button>' +
        (S.coupon
          ? '<button class="btn btn--ghost btn--sm" type="button" data-action="go" data-tab="wallet">ไปที่กระเป๋าคูปอง</button>'
          : '<button class="btn btn--ghost btn--sm" type="button" data-action="go" data-tab="stalls">ดูร้านทั้งหมด</button>') + '</div></div>';
    }
    return '<div class="dock"><button class="btn btn--gold btn--lg btn--block" type="button" data-action="spin">' + ico('spin') + 'สุ่มเลย</button></div>';
  }

  const SUBTITLE = {
    solo: 'ให้เราเลือกร้าน เมนู และราคาให้',
    mystic: 'เมนูมงคลตามสีประจำวัน',
    party: 'สุ่มทั้งโต๊ะ ใครไม่เอาก็ค้านได้'
  };

  function render() {
    normaliseMode();
    const sp = st().spin;
    const lockedM = !TU.can('mystic'), lockedP = !TU.can('party');
    const seg = '<div class="seg" role="group" aria-label="โหมดการสุ่ม">' +
      '<button type="button" data-action="spin-mode" data-mode="solo" aria-pressed="' + (sp.mode === 'solo') + '">สุ่มปกติ</button>' +
      '<button type="button" data-action="spin-mode" data-mode="mystic" aria-pressed="' + (sp.mode === 'mystic') + '">' + (lockedM ? ico('lock', 'ico--xs') : ico('sparkle', 'ico--xs')) + 'สายมู</button>' +
      '<button type="button" data-action="spin-mode" data-mode="party" aria-pressed="' + (sp.mode === 'party') + '">' + (lockedP ? ico('lock', 'ico--xs') : ico('users', 'ico--xs')) + 'กับเพื่อน</button></div>';

    const reelCollapsed = S.phase === 'done';
    return '<div class="screen-head"><h1>สุ่มร้านอร่อย</h1><p>' + SUBTITLE[sp.mode] + '</p></div>' +
      seg +
      (sp.mode === 'mystic' ? luckyHtml() : '') +
      (sp.mode === 'party' ? partyHtml() : '') +
      '<div class="mt-12">' + filtersHtml(sp) + '</div>' +
      '<div class="mt-16"><div class="reel" id="reel" data-collapsed="' + reelCollapsed + '" aria-hidden="' + reelCollapsed + '">' +
      '<div class="reel-bracket" aria-hidden="true"></div><div class="reel-strip" id="strip">' + idleStrip() + '</div></div>' +
      (S.phase === 'done' ? resultHtml() : '') + '</div>' +
      '<p class="fine mt-16">ข้อมูลร้าน ราคา และคูปองเป็นข้อมูลตัวอย่างสำหรับโปรเจกต์ TU109</p>' +
      dockHtml();
  }

  /* ---------- spinning ---------- */

  function buildStrip(winner) {
    const p = pool();
    const items = [];
    let last = null;
    for (let i = 0; i < LANES; i++) {
      let s = TU.pick(p), tries = 0;
      while (p.length > 1 && s === last && tries++ < 5) s = TU.pick(p);
      items.push(s); last = s;
    }
    const trail = TU.pick(p);
    return { items, winner, trail };
  }

  function startSpin() {
    if (S.phase === 'spinning') return;
    const p = pool();
    if (!p.length) {
      if (st().spin.mode === 'party' && S.vetoed.length) {
        S.vetoed = [];
        TU.toast('ร้านถูกค้านหมดแล้ว เริ่มรอบใหม่ให้', 'refresh');
        return startSpin();
      }
      TU.toast('ไม่มีร้านตรงกับตัวกรอง ลองเปลี่ยนตัวเลือก', 'x-circle');
      return;
    }
    TU.sfx.click();
    const party = st().spin.mode === 'party';
    S.coupon = null; S.couponDup = false; S.accepted = false; S.pending = [];
    if (!party) { S.vetoed = []; S.vetoUsed = []; }
    const winner = TU.pick(p);
    S.phase = 'spinning'; S.winner = null;
    TU.refresh();

    const strip = document.getElementById('strip');
    const reel = document.getElementById('reel');
    const plan = buildStrip(winner);
    const first = S.preview ? S.preview[0] : plan.items[0];
    strip.innerHTML = reelItem(first) + mysteryItem().replace(' is-center', '') +
      plan.items.map(reelItem).join('') + reelItem(winner) + reelItem(plan.trail);
    const nodes = strip.children;
    const ITEM_H = parseFloat(getComputedStyle(reel).getPropertyValue('--item-h')) || 80;
    const endIndex = 2 + plan.items.length; // winner position
    const center = () => reel.getBoundingClientRect(); // forces layout once

    if (TU.reducedMotion()) {
      strip.style.transform = 'translateY(' + (-(endIndex - 1) * ITEM_H) + 'px)';
      nodes[endIndex].classList.add('is-center');
      setTimeout(() => land(winner), 250);
      return;
    }

    center();
    const t0 = performance.now();
    let lastIdx = 1, lastTick = 0, prevEl = nodes[1];
    (function frame(now) {
      const t = Math.min(1, (now - t0) / SPIN_MS);
      const eased = 1 - Math.pow(1 - t, 4);
      const pos = 1 + (endIndex - 1) * eased;
      strip.style.transform = 'translateY(' + (-(pos - 1) * ITEM_H) + 'px)';
      const idx = Math.round(pos);
      if (idx !== lastIdx && nodes[idx]) {
        prevEl && prevEl.classList.remove('is-center');
        nodes[idx].classList.add('is-center');
        prevEl = nodes[idx];
        lastIdx = idx;
        if (now - lastTick > 45) { TU.sfx.tick(idx); lastTick = now; }
      }
      if (t < 1) requestAnimationFrame(frame); else land(winner);
    })(t0);
  }

  function land(winner) {
    S.phase = 'done'; S.winner = winner; S.fresh = true;
    const party = st().spin.mode === 'party';
    if (party) {
      TU.sfx.click();
    } else {
      accept();
    }
    if (st().tab === 'spin') {
      TU.refresh();
      const r = document.getElementById('result');
      if (r && r.scrollIntoView) r.scrollIntoView({ block: 'nearest', behavior: TU.reducedMotion() ? 'auto' : 'smooth' });
    }
    S.fresh = false;
  }

  function accept() {
    S.accepted = true;
    TU.sfx.win();
    TU.confetti();
    TU.mascot.cheer();
    const s = S.winner;
    if (TU.can('coupons') && s.couponDeal) {
      const r = TU.issueCoupon(s);
      S.coupon = r.coupon; S.couponDup = r.duplicate;
    }
  }

  /* ---------- actions ---------- */

  const A = TU.actions;

  A['spin'] = startSpin;

  A['spin-mode'] = (el) => {
    const mode = el.dataset.mode;
    if (mode === 'mystic' && !TU.can('mystic')) return TU.upsell('mystic');
    if (mode === 'party' && !TU.can('party')) return TU.upsell('party');
    TU.sfx.click();
    st().spin.mode = mode;
    TU.save(); resetSession(); TU.refresh();
  };

  A['spin-loc'] = (el) => { st().spin.loc = el.value; TU.save(); resetSession(); TU.refresh(); };
  A['spin-type'] = (el) => { st().spin.type = el.value; TU.save(); resetSession(); TU.refresh(); };

  A['spin-open'] = () => {
    TU.sfx.click();
    st().spin.openOnly = !st().spin.openOnly;
    TU.save(); resetSession(); TU.refresh();
  };

  A['spin-diet'] = (el) => {
    if (!TU.can('health')) return TU.upsell('health');
    TU.sfx.click();
    const d = st().spin.diet, id = el.dataset.id;
    const i = d.indexOf(id);
    if (i >= 0) d.splice(i, 1); else d.push(id);
    TU.save(); resetSession(); TU.refresh();
  };

  A['veto'] = (el) => {
    const i = Number(el.dataset.i);
    TU.sfx.click();
    const k = S.pending.indexOf(i);
    if (k >= 0) S.pending.splice(k, 1); else S.pending.push(i);
    TU.refresh();
  };

  A['party-confirm'] = () => {
    if (S.pending.length) {
      S.vetoed.push(S.winner.id);
      S.pending.forEach((i) => { if (!S.vetoUsed.includes(i)) S.vetoUsed.push(i); });
      S.pending = [];
      S.phase = 'idle'; S.winner = null;
      startSpin();
    } else {
      accept();
      TU.refresh();
    }
  };

  A['party-reset'] = () => { TU.sfx.click(); resetSession(); TU.refresh(); };

  A['friends'] = () => {
    function body() {
      const f = st().spin.friends;
      return '<div class="stack"><p class="muted">เพิ่มเพื่อนที่จะไปกินด้วยกัน (2–6 คน รวมตัวคุณ) แต่ละคนค้านร้านได้ 1 ครั้ง</p>' +
        '<div class="tags">' + f.map((n, i) =>
          '<span class="tag" style="min-height:44px;padding:0 6px 0 14px;font-size:0.9375rem">' + esc(n) +
          (f.length > 2 ? '<button class="icon-btn" style="width:36px;height:36px" type="button" data-action="friend-remove" data-i="' + i + '" aria-label="ลบ ' + esc(n) + '">' + ico('close', 'ico--sm') + '</button>' : '<span style="width:8px"></span>') +
          '</span>').join('') + '</div>' +
        (f.length < 6
          ? '<form id="friend-form" class="row"><input class="input" id="friend-name" maxlength="12" placeholder="ชื่อเพื่อน" autocomplete="off" aria-label="ชื่อเพื่อน">' +
            '<button class="btn btn--crimson" type="submit">เพิ่ม</button></form>'
          : '<p class="fine" style="color:var(--ink-2)">ครบ 6 คนแล้ว</p>') +
        '<button class="btn btn--crimson btn--block" type="button" data-action="sheet-close">เสร็จแล้ว</button></div>';
    }
    TU.sheet.open({ title: 'คนในโต๊ะ', html: body(), onMount: wire });
    function wire(root) {
      const form = root.querySelector('#friend-form');
      if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = root.querySelector('#friend-name');
        const name = input.value.trim();
        if (!name) return;
        st().spin.friends.push(name);
        TU.save(); resetSession(); TU.refresh();
        TU.sheet.setBody(body());
        wire(document.querySelector('.sheet-body'));
        const n = document.getElementById('friend-name'); if (n) n.focus();
      });
    }
  };

  A['friend-remove'] = (el) => {
    const f = st().spin.friends;
    if (f.length <= 2) return;
    f.splice(Number(el.dataset.i), 1);
    TU.save(); resetSession(); TU.refresh();
    TU.actions['friends']();
  };

  TU.screens.spin = { render };
  TU.spinReset = resetSession;
})();
