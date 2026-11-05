/**
 * Plan tab (Meal Plan tier): budget → 7 days × 3 meals, with savings vs the 79 baht fee.
 */
(function () {
  'use strict';
  const TU = window.TU;
  const D = TU.data;
  const { esc, baht, ico } = TU;
  const st = () => TU.state;

  const FEE = TU.TIERS.MEAL_PLAN.price;
  const SLOTS = [
    { label: 'เช้า', hour: 8 },
    { label: 'กลางวัน', hour: 12 },
    { label: 'เย็น', hour: 18 }
  ];
  const DAY_SHORT = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
  const DEFAULT_BUDGET = D.defaultMealPlanTemplates.economyBudget || 1100;

  /* ---------- planning ---------- */

  const saving = (s) => (s.couponDeal && s.avgPrice >= s.couponDeal.minSpend ? TU.couponValue(s) : 0);

  function candidates(hour, zone) {
    let p = D.stalls.filter((s) => TU.isOpenAt(s, hour));
    if (zone !== 'ALL') {
      const z = p.filter((s) => s.location === zone);
      if (z.length) p = z;
    }
    return p.length ? p : D.stalls.slice();
  }

  function weighted(pool, perMeal) {
    const w = pool.map((s) => Math.max(0.05, 1 - Math.max(0, s.avgPrice - perMeal) / (perMeal * 1.4)) * (1 + saving(s) / 14));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  function attempt(budget, zone) {
    const perMeal = budget / 21;
    const count = {};
    const meals = [];
    for (let d = 0; d < 7; d++) {
      const day = [];
      SLOTS.forEach((slot) => {
        let pool = candidates(slot.hour, zone).filter((s) => !day.includes(s.id) && (count[s.id] || 0) < 3);
        if (!pool.length) pool = candidates(slot.hour, zone).filter((s) => !day.includes(s.id));
        if (!pool.length) pool = D.stalls.slice();
        const s = weighted(pool, perMeal);
        day.push(s.id); count[s.id] = (count[s.id] || 0) + 1;
      });
      meals.push(day);
    }
    return meals;
  }

  function totals(meals) {
    let total = 0, save = 0, used = 0;
    meals.forEach((day) => day.forEach((id) => {
      const s = TU.stallById(id);
      total += s.avgPrice;
      const v = saving(s);
      if (v > 0) { save += v; used++; }
    }));
    return { total, save, used, net: save - FEE };
  }

  function generate(budget, zone) {
    const tries = [];
    for (let i = 0; i < 90; i++) {
      const meals = attempt(budget, zone);
      const t = totals(meals);
      const score = (t.total <= budget ? 1000 : 0) + Math.min(t.save, 160) - Math.max(0, t.total - budget) * 3;
      tries.push({ meals, score });
    }
    tries.sort((a, b) => b.score - a.score);
    return TU.pick(tries.slice(0, 5)).meals;
  }

  function ensurePlan() {
    const s = st();
    if (!s.plan) {
      s.plan = { budget: DEFAULT_BUDGET, zone: 'ALL', meals: generate(DEFAULT_BUDGET, 'ALL') };
      TU.save();
    }
    return s.plan;
  }

  /* ---------- markup ---------- */

  function mealRow(slotIdx, stall, menu, price, reroll) {
    const slot = SLOTS[slotIdx];
    const sv = saving(stall);
    return '<div class="ticket-wrap"><div class="ticket ticket--side meal">' +
      '<div class="when">' + slot.label + '<b>' + TU.hh(slot.hour) + '</b></div>' + TU.tile(stall) +
      '<div class="grow"><div class="t-name">' + esc(stall.name) + '</div><div class="t-sub">' + esc(menu) + '</div></div>' +
      '<div class="price"><div class="t-price">' + baht(price) + '</div>' + (sv ? '<small>คูปอง −' + baht(sv) + '</small>' : '') + '</div>' +
      (reroll ? '<button class="icon-btn" type="button" data-action="plan-reroll" data-slot="' + slotIdx + '" aria-label="สุ่มมื้อ' + slot.label + 'ใหม่">' + ico('refresh') + '</button>' : '') +
      '</div></div>';
  }

  function summaryHtml(plan) {
    const t = totals(plan.meals);
    const pct = Math.min(100, (t.total / plan.budget) * 100);
    const over = t.total > plan.budget;
    const ok = t.net > 0;
    return '<div class="ticket-wrap mt-16"><article class="ticket ticket--gold">' +
      '<div class="ticket-main">' +
      '<div class="row row--between" style="align-items:flex-end"><div><div class="t-sub" style="color:var(--ink)">ค่าอาหารทั้งสัปดาห์ (21 มื้อ)</div>' +
      '<div class="num" style="font-size:2rem;line-height:1.3">' + baht(t.total) + '</div></div>' +
      '<div class="t-sub" style="color:var(--ink);text-align:right">งบ ' + baht(plan.budget) + '<br>' + (over ? 'เกิน ' + baht(t.total - plan.budget) : 'เหลือ ' + baht(plan.budget - t.total)) + '</div></div>' +
      '<div class="bar"><i style="--w:' + pct + '%" data-over="' + over + '"></i></div>' +
      '<div class="sum-line"><span>คูปองช่วยประหยัด (' + t.used + ' มื้อ)</span><span class="num">−' + baht(t.save) + '</span></div>' +
      '<div class="sum-line"><span>ค่าสมาชิก Meal Plan ต่อเดือน</span><span class="num">' + baht(FEE) + '</span></div>' +
      '<div class="sum-net" data-ok="' + ok + '">' +
      (ok ? 'คุ้มกว่าค่าสมาชิก ประหยัดสุทธิประมาณ ' + baht(t.net) + ' ต่อสัปดาห์'
          : 'สัปดาห์นี้ยังไม่คุ้มค่าสมาชิก ลองกด “จัดแผนใหม่” หรือเพิ่มงบ') +
      '</div><p class="fine" style="color:var(--ink-2);margin-top:8px">ประมาณการจากข้อมูลตัวอย่าง ไม่ใช่ราคาจริง</p></div></article></div>';
  }

  function controlsHtml(plan) {
    const pct = ((plan.budget - 700) / (1800 - 700)) * 100;
    const zones = D.locations.map((l) => '<option value="' + esc(l.id) + '"' + (l.id === plan.zone ? ' selected' : '') + '>' + esc(l.id === 'ALL' ? 'ทุกโรงอาหาร' : l.shortName) + '</option>').join('');
    return '<div class="panel stack">' +
      '<div><div class="row row--between"><label class="field" style="flex:1"><span>งบอาหารต่อสัปดาห์</span></label><span class="num" id="budget-val" style="font-size:1.5rem;color:var(--gold-300)">' + baht(plan.budget) + '</span></div>' +
      '<input class="range" type="range" min="700" max="1800" step="50" value="' + plan.budget + '" style="--pct:' + pct + '%" id="budget" data-input="plan-budget-live" data-change="plan-budget" aria-label="งบอาหารต่อสัปดาห์">' +
      '<div class="row row--between fine"><span>฿700</span><span>เฉลี่ย ' + baht(plan.budget / 21) + ' / มื้อ</span><span>฿1,800</span></div></div>' +
      '<label class="field"><span>โซนที่อยากกิน</span><select class="select" data-change="plan-zone">' + zones + '</select></label>' +
      '<button class="btn btn--gold btn--block" type="button" data-action="plan-generate">' + ico('refresh', 'ico--sm') + 'จัดแผนใหม่</button></div>';
  }

  function unlocked() {
    const plan = ensurePlan();
    const day = st().planDay;
    const names = D.defaultMealPlanTemplates.days.map((d) => d.day);
    const dayMeals = plan.meals[day];
    const dayTotal = dayMeals.reduce((a, id) => a + TU.stallById(id).avgPrice, 0);
    return '<div class="screen-head"><h1>แผนอาหาร 7 วัน</h1><p>21 มื้อ ในงบที่คุณกำหนด</p></div>' +
      controlsHtml(plan) + summaryHtml(plan) +
      '<div class="days mt-24" role="group" aria-label="เลือกวัน">' + DAY_SHORT.map((d, i) =>
        '<button class="day" type="button" data-action="plan-day" data-i="' + i + '" aria-pressed="' + (i === day) + '" aria-label="' + names[i] + '"><b>' + d + '</b></button>').join('') + '</div>' +
      '<div class="row row--between mt-16"><h2 class="h2">' + esc(names[day]) + '</h2><span class="muted num">' + baht(dayTotal) + '</span></div>' +
      '<div class="list mt-12">' + dayMeals.map((id, i) => {
        const s = TU.stallById(id);
        return mealRow(i, s, s.recommendedMenu, s.avgPrice, true);
      }).join('') + '</div>';
  }

  function locked() {
    const tpl = D.defaultMealPlanTemplates.days[0];
    const rows = ['breakfast', 'lunch', 'dinner'].map((k, i) => {
      const m = tpl[k];
      return mealRow(i, TU.stallById(m.stallId), m.menu, m.price, false);
    }).join('');
    return '<div class="screen-head"><h1>แผนอาหาร 7 วัน</h1><p>จัดมื้อทั้งสัปดาห์ในงบของคุณ</p></div>' +
      '<div class="locked-preview"><div class="list" aria-hidden="true">' + rows + '</div>' +
      '<div class="veil">' + ico('lock') + '<h2 class="h2">ปลดล็อกด้วย Meal Plan</h2>' +
      '<p class="muted" style="max-width:28ch;margin:0 auto">กำหนดงบ แล้วให้ระบบจัด 21 มื้อ พร้อมสรุปว่าคูปองประหยัดได้มากกว่าค่าสมาชิกเท่าไร</p>' +
      '<button class="btn btn--gold" type="button" data-action="upsell" data-feature="plan">ดูแพ็กเกจ ฿79 / เดือน</button></div></div>' +
      '<ul class="feat panel mt-16" style="color:var(--on-crimson)">' +
      ['ตั้งงบรายสัปดาห์ 700–1,800 บาท', 'สุ่มใหม่ได้ทีละมื้อ', 'สรุปเงินที่ประหยัดเทียบกับค่าสมาชิก'].map((t) =>
        '<li>' + ico('check', 'ico--sm') + t + '</li>').join('') + '</ul>';
  }

  function render() {
    return TU.can('plan') ? unlocked() : locked();
  }

  /* ---------- actions ---------- */

  const A = TU.actions;
  A['plan-day'] = (el) => { TU.sfx.click(); st().planDay = Number(el.dataset.i); TU.save(); TU.refresh(); };
  A['plan-budget-live'] = (el) => {
    const v = Number(el.value);
    document.getElementById('budget-val').textContent = baht(v);
    el.style.setProperty('--pct', ((v - 700) / 1100) * 100 + '%');
  };
  A['plan-budget'] = (el) => { ensurePlan().budget = Number(el.value); TU.save(); TU.refresh(); };
  A['plan-zone'] = (el) => { ensurePlan().zone = el.value; TU.save(); };
  A['plan-generate'] = () => {
    const p = ensurePlan();
    p.meals = generate(p.budget, p.zone);
    TU.save(); TU.sfx.coupon(); TU.refresh();
    TU.toast('จัดแผนใหม่ให้แล้ว', 'refresh');
  };
  A['plan-reroll'] = (el) => {
    const p = ensurePlan(), day = st().planDay, slot = Number(el.dataset.slot);
    const today = p.meals[day];
    let pool = candidates(SLOTS[slot].hour, p.zone).filter((s) => !today.includes(s.id));
    if (!pool.length) pool = D.stalls.filter((s) => s.id !== today[slot]);
    today[slot] = weighted(pool, p.budget / 21).id;
    TU.save(); TU.sfx.click(); TU.refresh();
  };

  TU.screens.plan = { render };
})();
