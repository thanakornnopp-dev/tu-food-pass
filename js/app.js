/**
 * TU Food & Lifestyle - Application Controller
 * Handles exact Reel UI flows, sound playback, offline storage, and TU109 features.
 */

window.TUApp = (function() {
  const STORAGE_KEY = 'tu_food_app_state_v2';

  let state = {
    tier: 'EATER_PASS', // 'FREE', 'EATER_PASS', 'MEAL_PLAN', 'VIP'
    activeTab: 'random', // Default to 'random' to see the core feature immediately
    selectedLocation: 'ALL',
    selectedFoodType: 'ALL',
    courtLocation: 'ALL',
    courtCategory: 'ALL',
    coupons: [
      {
        id: 'CPN-INIT1',
        stallName: 'ป้าศรี อาหารตามสั่งเตาไฟลุก [SC]',
        title: 'ลด 10% ทุกเมนูกะเพรา',
        discountText: '10% OFF',
        code: 'PASRI10',
        expiresText: 'ใช้ได้ใน 3 ชม.',
        isUsed: false
      }
    ],
    isSpinning: false,
    lastWinner: null
  };

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = { ...state, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  // --- Confetti Animation (Canvas, 100% offline) ---
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#ef4444', '#f97316', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 75; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.38,
        opacity: 1
      });
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.014;

        if (p.opacity > 0) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      frame++;
      if (active && frame < 90) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  function showToast(msg) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  }

  // --- Tab Navigation ---
  function switchTab(tabId) {
    state.activeTab = tabId;
    saveState();

    if (window.TUAudio) {
      window.TUAudio.unlock();
      window.TUAudio.click();
    }

    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));

    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) activePane.classList.remove('hidden');

    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabId === 'foodcourt') renderFoodCourt();
    if (tabId === 'profile') renderProfileTab();
  }

  // --- Randomizer Logic (Matches Reel Video Flow) ---
  function spinRandomFood() {
    if (state.isSpinning) return;

    if (window.TUAudio) {
      window.TUAudio.unlock();
      window.TUAudio.click();
    }

    // Filter available stalls
    let stalls = window.TUData.stalls;
    if (state.selectedLocation !== 'ALL') {
      stalls = stalls.filter(s => s.location === state.selectedLocation);
    }
    if (state.selectedFoodType !== 'ALL') {
      stalls = stalls.filter(s => s.foodType === state.selectedFoodType);
    }

    if (stalls.length === 0) {
      showToast('⚠️ ไม่พบร้านที่ตรงกับตัวกรอง กรุณาเลือกตัวเลือกอื่น');
      return;
    }

    state.isSpinning = true;
    const btn = document.getElementById('btn-spin-action');
    const noodleCard = document.getElementById('random-noodle-box');
    const resultBox = document.getElementById('random-result-box');
    const noodleEmoji = document.getElementById('noodle-emoji');
    const noodleTitle = document.getElementById('noodle-title');
    const noodleDesc = document.getElementById('noodle-desc');

    // UI State: Spinning
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-icon"></span> Spinning...`;
    noodleEmoji.classList.add('spinning');
    if (resultBox) resultBox.classList.add('hidden');
    noodleCard.classList.remove('hidden');

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const tempStall = stalls[Math.floor(Math.random() * stalls.length)];
      noodleTitle.textContent = tempStall.name;
      noodleDesc.textContent = `📍 [${tempStall.location}] • ${tempStall.recommendedMenu}`;

      // Play audio ticks
      if (window.TUAudio) {
        window.TUAudio.tickStep(counter);
      }

      if (counter >= 12) {
        clearInterval(interval);
        state.isSpinning = false;
        btn.disabled = false;
        btn.innerHTML = `🔀 Spin!`;
        noodleEmoji.classList.remove('spinning');

        // Winner chosen
        const winner = stalls[Math.floor(Math.random() * stalls.length)];
        state.lastWinner = winner;

        // Play Fanfare & Confetti
        if (window.TUAudio) {
          window.TUAudio.fanfare();
        }
        launchConfetti();

        // Award coupon if Eater Pass
        let couponAwarded = null;
        if (state.tier !== 'FREE' && winner.couponDeal) {
          couponAwarded = {
            id: 'CPN-' + Date.now().toString(36).toUpperCase(),
            stallName: `${winner.name} [${winner.location}]`,
            title: winner.couponDeal.title,
            discountText: winner.couponDeal.discountText,
            code: winner.couponDeal.code,
            expiresText: 'ใช้ได้ใน 3 ชม.',
            isUsed: false
          };
          state.coupons.unshift(couponAwarded);
          saveState();
        }

        renderResultCard(winner, couponAwarded);
      }
    }, 110);
  }

  function renderResultCard(stall, coupon) {
    const noodleCard = document.getElementById('random-noodle-box');
    const resultBox = document.getElementById('random-result-box');
    if (!resultBox) return;

    noodleCard.classList.add('hidden');
    resultBox.classList.remove('hidden');

    let couponHtml = '';
    if (coupon) {
      couponHtml = `
        <div class="result-coupon-box">
          <div class="coupon-box-text">🎟️ ได้รับคูปอง: <b>${coupon.title}</b></div>
          <button class="btn-claim-coupon" onclick="TUApp.switchTab('profile')">ดูกระเป๋า</button>
        </div>
      `;
    } else if (state.tier === 'FREE') {
      couponHtml = `
        <div class="result-coupon-box" style="background: #f1f5f9; border-color: #cbd5e1;">
          <div class="coupon-box-text" style="color: #475569;">💡 สมาชิก Eater Pass รับคูปองลด 10% สำหรับร้านนี้</div>
          <button class="btn-claim-coupon" style="background: #1e293b;" onclick="TUApp.setTier('EATER_PASS')">ลองสลับ Pass</button>
        </div>
      `;
    }

    resultBox.innerHTML = `
      <div class="result-card-container">
        <div class="result-card-header">
          <span>🎉</span> Today's pick!
        </div>
        <div class="result-card-body">
          <h3 class="result-stall-name">${stall.name}</h3>
          <span class="result-location-badge">📍 โรงอาหาร: ${stall.location}</span>

          <div class="result-menu-box">
            <div class="result-menu-title">เมนูแนะนำเด่น:</div>
            <div class="result-menu-val">${stall.recommendedMenu}</div>
          </div>

          <div class="result-info-grid">
            <div class="result-info-item">
              <span>ราคาเฉลี่ย</span>
              <span>~${stall.avgPrice} ฿</span>
            </div>
            <div class="result-info-item">
              <span>แคลอรี</span>
              <span>~${stall.calories} kcal</span>
            </div>
            <div class="result-info-item">
              <span>เวลาเปิด</span>
              <span>${stall.openTime}:00-${stall.closeTime}:00</span>
            </div>
          </div>

          ${couponHtml}

          <button class="btn-spin-gradient" onclick="TUApp.spinRandomFood()">
            🔀 Spin อีกรอบ!
          </button>
        </div>
      </div>
    `;
  }

  // --- Food Court Tab Rendering ---
  function renderFoodCourt() {
    const listContainer = document.getElementById('foodcourt-stalls-list');
    if (!listContainer) return;

    let stalls = window.TUData.stalls;
    if (state.courtLocation !== 'ALL') {
      stalls = stalls.filter(s => s.location === state.courtLocation);
    }
    if (state.courtCategory !== 'ALL') {
      stalls = stalls.filter(s => s.foodType === state.courtCategory);
    }

    const currentHour = new Date().getHours();

    listContainer.innerHTML = stalls.map(s => {
      const isOpen = currentHour >= s.openTime && currentHour < s.closeTime;
      return `
        <div class="stall-card-item">
          <div class="stall-card-thumb">🍲</div>
          <div class="stall-card-details">
            <span class="stall-status-badge" style="background: ${isOpen ? '#d1fae5' : '#f1f5f9'}; color: ${isOpen ? '#047857' : '#64748b'};">
              ${isOpen ? 'เปิดให้บริการ' : 'ปิดให้บริการ'}
            </span>
            <div class="stall-title-name">${s.name}</div>
            <div class="stall-time-tag">เปิด ${s.openTime}.00 - ${s.closeTime}.00 น. • ${s.recommendedMenu}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterCourtLocation(locId, pillElem) {
    state.courtLocation = locId;
    document.querySelectorAll('.location-pill').forEach(p => p.classList.remove('active'));
    if (pillElem) pillElem.classList.add('active');
    if (window.TUAudio) window.TUAudio.click();
    renderFoodCourt();
  }

  function filterCourtCategory(catId, chipElem) {
    state.courtCategory = catId;
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    if (chipElem) chipElem.classList.add('active');
    if (window.TUAudio) window.TUAudio.click();
    renderFoodCourt();
  }

  // --- Profile / TU109 Pass Hub ---
  function renderProfileTab() {
    const couponsList = document.getElementById('profile-coupons-list');
    const tierNameElem = document.getElementById('profile-tier-name');
    const tierDescElem = document.getElementById('profile-tier-desc');
    const quickSelect = document.getElementById('quick-tier-select');

    if (tierNameElem) tierNameElem.textContent = state.tier;
    if (quickSelect) quickSelect.value = state.tier;

    if (tierDescElem) {
      if (state.tier === 'FREE') tierDescElem.textContent = 'แพ็กเกจฟรี: สุ่มอาหารทั่วไป';
      if (state.tier === 'EATER_PASS') tierDescElem.textContent = 'นักล่าส่วนลด: สุ่มปุ๊บได้คูปอง 10-15% ทันที';
      if (state.tier === 'MEAL_PLAN') tierDescElem.textContent = 'จัดเซตประหยัด: แผนอาหาร 7 วัน 21 มื้อ';
      if (state.tier === 'VIP') tierDescElem.textContent = 'VIP All-Access: สุ่มสายมู + สุขภาพ + สุ่มกับเพื่อน';
    }

    if (couponsList) {
      if (state.coupons.length === 0) {
        couponsList.innerHTML = `<div style="font-size: 12px; color: #94a3b8; padding: 10px 0;">ยังไม่มีคูปอง ลองไปกดสุ่มอาหารในแท็บ Random Food</div>`;
      } else {
        couponsList.innerHTML = state.coupons.map((c, idx) => `
          <div class="wallet-coupon-item">
            <div class="coupon-left-text">
              <strong>${c.stallName}</strong>
              <span>${c.title} (Code: ${c.code})</span>
            </div>
            ${c.isUsed 
              ? `<span style="font-size: 11px; color: #10b981; font-weight: bold;">✓ ใช้แล้ว</span>`
              : `<button class="btn-use-now" onclick="TUApp.useCoupon(${idx})">ใช้สิทธิ์</button>`
            }
          </div>
        `).join('');
      }
    }

    // Render Mutelu for today
    const muteluBox = document.getElementById('profile-mutelu-box');
    if (muteluBox && window.TUData) {
      const today = new Date().getDay();
      const m = window.TUData.muteluDays[today];
      muteluBox.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: ${m.colorHex}; margin-bottom: 4px;">
          🔮 สีมงคลวันนี้: ${m.luckyColor}
        </div>
        <div style="font-size: 11px; color: #475569;">${m.blessing}</div>
        <div style="font-size: 11px; color: #0f172a; margin-top: 4px;">🍜 แนะนำ: ${m.luckyFoodTheme}</div>
      `;
    }
  }

  function useCoupon(idx) {
    if (state.coupons[idx]) {
      state.coupons[idx].isUsed = true;
      saveState();
      if (window.TUAudio) window.TUAudio.couponUnlock();
      renderProfileTab();
      showToast('🎉 ใช้สิทธิ์คูปองเรียบร้อยแล้ว!');
    }
  }

  function setTier(newTier) {
    state.tier = newTier;
    saveState();
    if (window.TUAudio) {
      window.TUAudio.unlock();
      window.TUAudio.couponUnlock();
    }
    renderProfileTab();
    showToast(`🔄 สลับแพ็กเกจเป็น: ${newTier}`);
  }

  // --- Initializer ---
  function init() {
    loadState();

    // Populate Location Dropdown in Random Food
    const locSelect = document.getElementById('random-select-location');
    if (locSelect && window.TUData) {
      locSelect.innerHTML = window.TUData.locations.map(l => 
        `<option value="${l.id}">${l.icon} ${l.name}</option>`
      ).join('');
      locSelect.value = state.selectedLocation;
      locSelect.addEventListener('change', e => {
        state.selectedLocation = e.target.value;
        saveState();
        if (window.TUAudio) window.TUAudio.click();
      });
    }

    // Populate Food Type Dropdown in Random Food
    const typeSelect = document.getElementById('random-select-food-type');
    if (typeSelect && window.TUData) {
      typeSelect.innerHTML = window.TUData.foodTypes.map(t => 
        `<option value="${t.id}">${t.icon} ${t.name}</option>`
      ).join('');
      typeSelect.value = state.selectedFoodType;
      typeSelect.addEventListener('change', e => {
        state.selectedFoodType = e.target.value;
        saveState();
        if (window.TUAudio) window.TUAudio.click();
      });
    }

    // Default tab
    switchTab('random');
  }

  return {
    init: init,
    switchTab: switchTab,
    spinRandomFood: spinRandomFood,
    filterCourtLocation: filterCourtLocation,
    filterCourtCategory: filterCourtCategory,
    setTier: setTier,
    useCoupon: useCoupon
  };
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.TUApp) window.TUApp.init();
});
