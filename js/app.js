/**
 * TU Food Pass - Master Application Controller
 * Handles Offline State, Subscription Tiers, Wallet, Randomizer Modes,
 * Meal Planner, Mutelu/Health, and Party Squad Mode.
 */

window.TUApp = (function() {
  // App State with LocalStorage persistence
  const STORAGE_KEY = 'tu_food_pass_state_v1';

  let state = {
    tier: 'EATER_PASS', // 'FREE', 'EATER_PASS', 'MEAL_PLAN', 'VIP'
    userCoins: 120,
    coupons: [],
    selectedLocation: 'ALL',
    selectedFoodType: 'ALL',
    budgetFilter: 'ALL', // 'ALL', 'CHEAP', 'MID', 'HIGH'
    openOnly: false,
    dietaryFilters: [], // 'HALAL', 'CLEAN_FOOD', 'VEGETARIAN'
    activeTab: 'wheel', // 'wheel', 'fast', 'gacha', 'wallet', 'mealplan', 'mutelu', 'friends', 'directory'
    simulatedHour: new Date().getHours(),
    savedMealPlan: null
  };

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load localStorage, using defaults');
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
    renderHeader();
  }

  // --- Confetti celebration engine (Pure JS Canvas, 100% offline) ---
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#b91c1c', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.42,
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
        p.opacity -= 0.012;

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
      if (active && frame < 100) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  // --- Filter and Query Stalls ---
  function getFilteredStalls() {
    if (!window.TUData || !window.TUData.stalls) return [];

    return window.TUData.stalls.filter(stall => {
      // Location filter
      if (state.selectedLocation !== 'ALL' && stall.location !== state.selectedLocation) {
        return false;
      }
      // Food Type filter
      if (state.selectedFoodType !== 'ALL' && stall.foodType !== state.selectedFoodType) {
        return false;
      }
      // Budget filter
      if (state.budgetFilter === 'CHEAP' && stall.avgPrice > 50) return false;
      if (state.budgetFilter === 'MID' && (stall.avgPrice <= 50 || stall.avgPrice > 80)) return false;
      if (state.budgetFilter === 'HIGH' && stall.avgPrice <= 80) return false;

      // Open now filter
      if (state.openOnly) {
        const hour = state.simulatedHour;
        if (hour < stall.openTime || hour >= stall.closeTime) {
          return false;
        }
      }

      // Dietary filters
      if (state.dietaryFilters.includes('HALAL')) {
        if (!stall.dietary.includes('HALAL') && !stall.dietary.includes('HALAL_FRIENDLY')) {
          return false;
        }
      }
      if (state.dietaryFilters.includes('CLEAN_FOOD')) {
        if (!stall.dietary.includes('CLEAN_FOOD')) return false;
      }
      if (state.dietaryFilters.includes('VEGETARIAN')) {
        if (!stall.dietary.includes('VEGETARIAN') && !stall.dietary.includes('VEGETARIAN_OPTION')) {
          return false;
        }
      }

      // Secret deals (Only accessible to Eater Pass, Meal Plan, and VIP)
      if (stall.isSecretDeal && state.tier === 'FREE') {
        return false;
      }

      return true;
    });
  }

  // --- Coupon System (Offline Local Storage) ---
  function awardCoupon(stall) {
    if (!stall || !stall.couponDeal) return null;
    if (state.tier === 'FREE') return null; // Free user gets no instant coupons

    const newCoupon = {
      id: 'CPN-' + Date.now().toString(36).toUpperCase(),
      stallId: stall.id,
      stallName: stall.name,
      location: stall.location,
      title: stall.couponDeal.title,
      discountText: stall.couponDeal.discountText,
      code: stall.couponDeal.code,
      minSpend: stall.couponDeal.minSpend,
      earnedAt: Date.now(),
      expiresAt: Date.now() + (stall.couponDeal.validHours || 3) * 60 * 60 * 1000,
      isUsed: false
    };

    // Add to wallet
    state.coupons.unshift(newCoupon);
    saveState();
    return newCoupon;
  }

  function useCoupon(couponId) {
    const cpn = state.coupons.find(c => c.id === couponId);
    if (cpn && !cpn.isUsed) {
      cpn.isUsed = true;
      cpn.usedAt = Date.now();
      saveState();
      if (window.TUAudio) window.TUAudio.couponUnlock();
      renderWalletTab();
      showToast('🎉 ใช้สิทธิ์คูปองสำเร็จ! ได้รับส่วนลดเรียบร้อย');
    }
  }

  // --- Toast notification ---
  function showToast(msg) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2800);
  }

  // --- Modal Helpers ---
  function showModal(contentHtml) {
    const modal = document.getElementById('app-modal');
    const container = document.getElementById('modal-content');
    if (!modal || !container) return;
    container.innerHTML = contentHtml;
    modal.classList.remove('hidden');
  }

  function closeModal() {
    const modal = document.getElementById('app-modal');
    if (modal) modal.classList.add('hidden');
  }

  // --- Result Popup when Spinning finishes ---
  function showResultPopup(stall) {
    const coupon = awardCoupon(stall);
    launchConfetti();

    let couponHtml = '';
    if (coupon) {
      couponHtml = `
        <div class="coupon-unlock-card animate-pulse-glow">
          <div class="coupon-badge">🎟️ ปลดล็อกคูปอง Eater Pass สำเร็จ!</div>
          <div class="coupon-title">${coupon.title}</div>
          <div class="coupon-details">
            <span class="coupon-code-pill">CODE: <b>${coupon.code}</b></span>
            <span class="coupon-expire-pill">⏳ ใช้ได้ใน 3 ชม.</span>
          </div>
          <div class="coupon-note">บันทึกคูปองลง "กระเป๋าคูปองออฟไลน์" แล้ว แสดงให้ร้านค้าดูเพื่อรับส่วนลด</div>
        </div>
      `;
    } else if (state.tier === 'FREE') {
      couponHtml = `
        <div class="coupon-upsell-card">
          <div class="upsell-text">💡 <b>สมัคร Eater Pass (39฿/ด.)</b> เพื่อรับคูปองส่วนลด 10-15% หรือฟรีท็อปปิ้งสำหรับร้านนี้ทันที!</div>
          <button class="btn-upsell" onclick="TUApp.setTier('EATER_PASS'); TUApp.closeModal(); TUApp.showToast('🎉 อัปเกรดเป็น Eater Pass แล้ว!')">
            ⚡ สลับเป็น Eater Pass เพื่อทดสอบระบบ
          </button>
        </div>
      `;
    }

    const html = `
      <div class="result-modal-header">
        <div class="result-celebration-icon">🍜✨</div>
        <h2 class="result-modal-title">มื้อนี้กินร้านนี้เลย!</h2>
        <p class="result-modal-subtitle">TU Food Pass ช่วยคุณตัดสินใจแล้ว</p>
      </div>

      <div class="result-stall-card">
        <div class="stall-header-row">
          <span class="stall-location-tag">📍 [${stall.location}]</span>
          <span class="stall-rating-tag">⭐ ${stall.rating} (${stall.reviewsCount} รีวิว)</span>
        </div>
        <h3 class="stall-card-name">${stall.name}</h3>
        <div class="stall-menu-highlight">
          <span class="menu-label">เมนูแนะนำเด็ด:</span>
          <span class="menu-name">${stall.recommendedMenu}</span>
        </div>
        <div class="stall-meta-grid">
          <div class="meta-item">
            <span class="meta-label">ราคาประมาณ</span>
            <span class="meta-val">~${stall.avgPrice} ฿</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">พลังงาน</span>
            <span class="meta-val">~${stall.calories} kcal</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">เวลาเปิด-ปิด</span>
            <span class="meta-val">${stall.openTime}:00 - ${stall.closeTime}:00 น.</span>
          </div>
        </div>
      </div>

      ${couponHtml}

      <div class="result-actions-row">
        <button class="btn btn-secondary" onclick="TUApp.closeModal(); TUApp.spinWheel();">
          🔄 ไม่โดนใจ ขอสุ่มใหม่
        </button>
        <button class="btn btn-primary" onclick="TUApp.closeModal(); TUApp.navigateToTab('wallet');">
          ${coupon ? '🎟️ ไปดูกระเป๋าคูปอง' : '✅ ตกลง เลือกร้านนี้'}
        </button>
      </div>
    `;

    showModal(html);
  }

  // --- Tab Rendering: Wheel of Food ---
  function renderWheelTab() {
    const stalls = getFilteredStalls();
    const countBadge = document.getElementById('stall-count-badge');
    if (countBadge) countBadge.textContent = `${stalls.length} ร้านพร้อมสุ่ม`;

    if (window.TUWheel) {
      window.TUWheel.setItems(stalls);
    }
  }

  // --- Tab Rendering: Fast / Slot Machine Random ---
  function renderFastTab() {
    const container = document.getElementById('fast-random-container');
    if (!container) return;

    const stalls = getFilteredStalls();
    container.innerHTML = `
      <div class="fast-slot-card">
        <div class="slot-display-box" id="slot-display">
          <div class="slot-icon">🍱</div>
          <div class="slot-name">กดปุ่มด้านล่างเพื่อสุ่มทันที!</div>
          <div class="slot-desc">เหมาะสำหรับช่วงเวลาพัก 20 นาทีที่ต้องการคำตอบไวที่สุด</div>
        </div>
        <button class="btn btn-primary btn-large btn-spin-slot" id="btn-slot-spin" onclick="TUApp.spinSlotMachine()">
          ⚡ สุ่มด่วนใน 1 วินาที!
        </button>
      </div>
    `;
  }

  function spinSlotMachine() {
    const stalls = getFilteredStalls();
    if (stalls.length === 0) {
      showToast('⚠️ ไม่พบร้านอาหารที่ตรงกับตัวกรอง กรุณาลดเงื่อนไข');
      return;
    }

    const display = document.getElementById('slot-display');
    const btn = document.getElementById('btn-slot-spin');
    if (!display || !btn) return;

    btn.disabled = true;
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      const randomStall = stalls[Math.floor(Math.random() * stalls.length)];
      display.innerHTML = `
        <div class="slot-icon spinning">🍲</div>
        <div class="slot-name">${randomStall.name}</div>
        <div class="slot-desc">📍 ${randomStall.location} | เมนู: ${randomStall.recommendedMenu} (~${randomStall.avgPrice}฿)</div>
      `;
      if (window.TUAudio) window.TUAudio.wheelTick(1);

      if (ticks > 14) {
        clearInterval(interval);
        btn.disabled = false;
        const winner = stalls[Math.floor(Math.random() * stalls.length)];
        display.innerHTML = `
          <div class="slot-icon">🎉</div>
          <div class="slot-name">${winner.name}</div>
          <div class="slot-desc">📍 [${winner.location}] | เมนู: ${winner.recommendedMenu} (~${winner.avgPrice}฿)</div>
        `;
        if (window.TUAudio) window.TUAudio.fanfare();
        showResultPopup(winner);
      }
    }, 90);
  }

  // --- Tab Rendering: Gacha / Blind Box Mode ---
  function renderGachaTab() {
    const container = document.getElementById('gacha-container');
    if (!container) return;

    container.innerHTML = `
      <div class="gacha-hero-card">
        <div class="gacha-chest-icon animate-bounce-soft">🎁</div>
        <h3 class="gacha-title">กล่องสุ่มอาหารมธ. (Gacha Lunch Box)</h3>
        <p class="gacha-subtitle">สุ่มเปิดกล่องลุ้นเมนูลับ + คูปองระดับ Rare!</p>

        <div class="gacha-box-selector">
          <div class="gacha-box active" onclick="TUApp.openGacha('normal')">
            <div class="box-icon">📦</div>
            <div class="box-title">กล่องทั่วไป (Free)</div>
            <div class="box-desc">สุ่มเมนูยอดฮิตทั่วไปใน มธ.</div>
          </div>
          <div class="gacha-box premium ${state.tier === 'FREE' ? 'locked' : ''}" onclick="TUApp.openGacha('rare')">
            <div class="box-badge">${state.tier === 'FREE' ? '🔒 ล็อก (ต้องใช้ Pass)' : '✨ ปลดล็อกแล้ว'}</div>
            <div class="box-icon">👑</div>
            <div class="box-title">กล่องนักล่าส่วนลด (Rare)</div>
            <div class="box-desc">การันตีร้านลับ + คูปองลดสูงสุด 15%</div>
          </div>
        </div>
      </div>
    `;
  }

  function openGacha(type) {
    if (type === 'rare' && state.tier === 'FREE') {
      showToast('⚠️ กล่อง Rare สำหรับสมาชิก Eater Pass / VIP เท่านั้น! (กดสลับโหมดเดโม่ด้านบน)');
      return;
    }

    let candidates = window.TUData.stalls;
    if (type === 'rare') {
      candidates = window.TUData.stalls.filter(s => s.isSecretDeal || s.rating >= 4.8);
    }
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    if (window.TUAudio) window.TUAudio.fanfare();
    showResultPopup(winner);
  }

  // --- Tab Rendering: My Coupons Wallet ---
  function renderWalletTab() {
    const container = document.getElementById('wallet-container');
    if (!container) return;

    if (state.tier === 'FREE') {
      container.innerHTML = `
        <div class="empty-wallet-card">
          <div class="empty-icon">🎟️</div>
          <h3>คุณยังไม่มี Eater Pass</h3>
          <p>สมัคร Eater Pass (39฿/เดือน) เพื่อรับคูปองส่วนลด 5-15% และฟรีท็อปปิ้งทุกครั้งที่กดสุ่มอาหาร</p>
          <button class="btn btn-primary" onclick="TUApp.setTier('EATER_PASS'); TUApp.showToast('🎉 สลับเป็น Eater Pass แล้ว! ลองกดสุ่มเพื่อรับคูปอง'); TUApp.renderWalletTab();">
            ⚡ ทดสอบสมัคร Eater Pass (Demo)
          </button>
        </div>
      `;
      return;
    }

    const activeCoupons = state.coupons.filter(c => !c.isUsed && c.expiresAt > Date.now());
    const usedCoupons = state.coupons.filter(c => c.isUsed || c.expiresAt <= Date.now());

    let couponsHtml = '';
    if (activeCoupons.length === 0) {
      couponsHtml = `
        <div class="no-coupons-tip">
          <p>💡 ยังไม่มีคูปองที่ใช้ได้ในกระเป๋า</p>
          <button class="btn btn-secondary btn-small" onclick="TUApp.navigateToTab('wheel');">
            🎡 ไปกดสุ่มเพื่อรับคูปองร้านโปรด
          </button>
        </div>
      `;
    } else {
      couponsHtml = activeCoupons.map(c => `
        <div class="coupon-item-card">
          <div class="coupon-left">
            <div class="coupon-discount-tag">${c.discountText}</div>
            <div class="coupon-stall-name">${c.stallName}</div>
            <div class="coupon-subtext">${c.title} (ขั้นต่ำ ${c.minSpend}฿)</div>
            <div class="coupon-code-chip">CODE: <b>${c.code}</b></div>
          </div>
          <div class="coupon-right">
            <div class="coupon-barcode">||| | | |||| | ||</div>
            <button class="btn-use-coupon" onclick="TUApp.useCoupon('${c.id}')">
              กดใช้สิทธิ์
            </button>
          </div>
        </div>
      `).join('');
    }

    let historyHtml = '';
    if (usedCoupons.length > 0) {
      historyHtml = `
        <h4 class="wallet-section-title">ประวัติการใช้คูปอง (${usedCoupons.length})</h4>
        <div class="used-coupons-list">
          ${usedCoupons.slice(0, 5).map(c => `
            <div class="used-coupon-row">
              <span>${c.stallName} - ${c.discountText}</span>
              <span class="badge-used">${c.isUsed ? '✓ ใช้แล้ว' : 'หมดอายุ'}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="wallet-hero-header">
        <div class="wallet-badge">🎟️ Eater Pass Active</div>
        <h3 class="wallet-title">กระเป๋าคูปองส่วนลดของฉัน (Offline Wallet)</h3>
        <p class="wallet-desc">คูปองที่สุ่มได้จะถูกเก็บไว้ที่นี่ สามารถเปิดใช้งานหน้าร้านได้แม้ออฟไลน์</p>
      </div>

      <div class="active-coupons-grid">
        ${couponsHtml}
      </div>

      ${historyHtml}
    `;
  }

  // --- Tab Rendering: Meal Plan Creator (Package 2) ---
  function renderMealPlanTab() {
    const container = document.getElementById('mealplan-container');
    if (!container) return;

    if (state.tier === 'FREE') {
      container.innerHTML = `
        <div class="empty-wallet-card">
          <div class="empty-icon">📅</div>
          <h3>ฟีเจอร์สำหรับสมาชิก Meal Plan Creator</h3>
          <p>ระบบสุ่มและวางแผนเมนูอาหาร 7 วัน 21 มื้อ พร้อมคำนวณงบประมาณและคูปองส่วนลดแบบการันตีความคุ้มค่า</p>
          <button class="btn btn-primary" onclick="TUApp.setTier('MEAL_PLAN'); TUApp.showToast('🎉 สลับเป็นแพ็กเกจ Meal Plan Creator แล้ว!'); TUApp.renderMealPlanTab();">
            ⚡ สลับเป็น Meal Plan Creator เพื่อทดสอบระบบ
          </button>
        </div>
      `;
      return;
    }

    const template = window.TUData.defaultMealPlanTemplates;
    let totalCost = 0;
    let totalCals = 0;
    template.days.forEach(d => {
      totalCost += d.breakfast.price + d.lunch.price + d.dinner.price;
      totalCals += d.breakfast.calories + d.lunch.calories + d.dinner.calories;
    });

    const estimatedSavings = Math.round(totalCost * 0.12); // Eater Pass saves ~12%

    const daysHtml = template.days.map((d, dayIdx) => `
      <div class="meal-day-card">
        <div class="meal-day-header">
          <span class="meal-day-name">📌 ${d.day}</span>
          <span class="meal-day-budget">งบรวม: ${d.breakfast.price + d.lunch.price + d.dinner.price} ฿</span>
        </div>
        <div class="meal-slots-grid">
          <div class="meal-slot-item">
            <span class="meal-slot-time">🌅 มื้อเช้า</span>
            <div class="meal-slot-menu">${d.breakfast.menu}</div>
            <div class="meal-slot-meta">${d.breakfast.price}฿ • ~${d.breakfast.calories} kcal</div>
          </div>
          <div class="meal-slot-item highlight">
            <span class="meal-slot-time">☀️ มื้อเที่ยง</span>
            <div class="meal-slot-menu">${d.lunch.menu}</div>
            <div class="meal-slot-meta">${d.lunch.price}฿ • ~${d.lunch.calories} kcal</div>
          </div>
          <div class="meal-slot-item">
            <span class="meal-slot-time">🌙 มื้อเย็น</span>
            <div class="meal-slot-menu">${d.dinner.menu}</div>
            <div class="meal-slot-meta">${d.dinner.price}฿ • ~${d.dinner.calories} kcal</div>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="mealplan-hero">
        <div class="hero-badge">🍱 Package 2: Meal Plan Creator</div>
        <h3 class="hero-title">แผนการกินรายสัปดาห์ (7 วัน 21 มื้อ)</h3>
        <p class="hero-desc">ระบบสุ่มเมนูคละโรงอาหารรอบ มธ. รังสิต ช่วยคุมงบไม่บานปลาย</p>

        <div class="mealplan-summary-bar">
          <div class="summary-metric">
            <span class="metric-label">งบประมาณทั้งสัปดาห์</span>
            <span class="metric-value font-bold text-amber">${totalCost} ฿</span>
            <span class="metric-sub">เฉลี่ย ~${Math.round(totalCost / 21)} ฿/มื้อ</span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">ประหยัดได้ด้วย Pass</span>
            <span class="metric-value font-bold text-emerald">-${estimatedSavings} ฿</span>
            <span class="metric-sub">คุ้มค่า Subscription แล้ว!</span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">พลังงานเฉลี่ยต่อวัน</span>
            <span class="metric-value font-bold">~${Math.round(totalCals / 7)} kcal</span>
            <span class="metric-sub">สมดุลโภชนาการ</span>
          </div>
        </div>

        <div class="mealplan-action-bar">
          <button class="btn btn-secondary btn-small" onclick="TUApp.reRandomizeMealPlan()">
            🔄 สุ่มจัดเซตใหม่ทั้งหมด (Re-Generate)
          </button>
          <button class="btn btn-primary btn-small" onclick="TUApp.showToast('💾 บันทึกแผนการกินลงเครื่องออฟไลน์เรียบร้อย!')">
            💾 บันทึกแผนการกินของฉัน
          </button>
        </div>
      </div>

      <div class="mealplan-days-container">
        ${daysHtml}
      </div>
    `;
  }

  function reRandomizeMealPlan() {
    // Shuffle menus from stalls
    const stalls = window.TUData.stalls;
    const template = window.TUData.defaultMealPlanTemplates;
    template.days.forEach(d => {
      const s1 = stalls[Math.floor(Math.random() * stalls.length)];
      const s2 = stalls[Math.floor(Math.random() * stalls.length)];
      const s3 = stalls[Math.floor(Math.random() * stalls.length)];
      d.breakfast = { stallId: s1.id, menu: s1.recommendedMenu, price: s1.avgPrice - 5, calories: s1.calories - 80 };
      d.lunch = { stallId: s2.id, menu: s2.recommendedMenu, price: s2.avgPrice, calories: s2.calories };
      d.dinner = { stallId: s3.id, menu: s3.recommendedMenu, price: s3.avgPrice + 5, calories: s3.calories + 50 };
    });
    if (window.TUAudio) window.TUAudio.fanfare();
    renderMealPlanTab();
    showToast('🎉 สุ่มจัดเซตอาหาร 21 มื้อใหม่เรียบร้อยแล้ว!');
  }

  // --- Tab Rendering: Mutelu & Health (Package 3) ---
  function renderMuteluTab() {
    const container = document.getElementById('mutelu-container');
    if (!container) return;

    if (state.tier === 'FREE') {
      container.innerHTML = `
        <div class="empty-wallet-card">
          <div class="empty-icon">🔮</div>
          <h3>ฟีเจอร์สำหรับสมาชิก Feature Unlocked / VIP</h3>
          <p>ระบบสุ่มอาหารตามสีเสื้อมงคลประจำวัน + ตัวกรองสุขภาพละเอียด (แคลอรี, วัตถุดิบที่ไม่กิน)</p>
          <button class="btn btn-primary" onclick="TUApp.setTier('VIP'); TUApp.showToast('🎉 ปลดล็อกฟีเจอร์สายมู + สุขภาพแล้ว!'); TUApp.renderMuteluTab();">
            ⚡ สลับเป็น VIP All-Access เพื่อทดสอบระบบ
          </button>
        </div>
      `;
      return;
    }

    const todayIdx = new Date().getDay();
    const mutelu = window.TUData.muteluDays[todayIdx];

    container.innerHTML = `
      <div class="mutelu-hero-card" style="border-top: 4px solid ${mutelu.colorHex}">
        <div class="mutelu-badge">🔮 สุ่มสายมู มธ. (Auspicious Food Randomizer)</div>
        <h3 class="mutelu-title">คำทำนายและเมนูมงคล: ${mutelu.dayName}</h3>
        <div class="mutelu-lucky-color-box">
          <span class="color-dot" style="background-color: ${mutelu.colorHex}"></span>
          <span>สีมงคลเด่นวันนี้: <b>${mutelu.luckyColor}</b></span>
        </div>
        <div class="mutelu-blessing">✨ <b>พลังเสริมดวง:</b> ${mutelu.blessing}</div>
        <div class="mutelu-food-theme">🍜 <b>เมนูเสริมโชค:</b> ${mutelu.luckyFoodTheme}</div>

        <button class="btn btn-primary btn-spin-mutelu" onclick="TUApp.spinMuteluFood()">
          🔮 สุ่มเมนูเสริมดวงมื้อนี้เลย!
        </button>
      </div>

      <div class="health-filter-card">
        <h4 class="health-title">🥗 Smart Health Filter (สายสุขภาพ/คุมอาหาร)</h4>
        <div class="health-options-grid">
          <label class="health-checkbox">
            <input type="checkbox" id="chk-halal" ${state.dietaryFilters.includes('HALAL') ? 'checked' : ''} onchange="TUApp.toggleDietary('HALAL')">
            <span>🕌 เฉพาะอาหารฮาลาล (Halal Certified)</span>
          </label>
          <label class="health-checkbox">
            <input type="checkbox" id="chk-clean" ${state.dietaryFilters.includes('CLEAN_FOOD') ? 'checked' : ''} onchange="TUApp.toggleDietary('CLEAN_FOOD')">
            <span>🥑 อาหารคลีน / โปรตีนสูง / ลีนไขมัน</span>
          </label>
          <label class="health-checkbox">
            <input type="checkbox" id="chk-veggie" ${state.dietaryFilters.includes('VEGETARIAN') ? 'checked' : ''} onchange="TUApp.toggleDietary('VEGETARIAN')">
            <span>🌱 มังสวิรัติ / เจ / Vegan</span>
          </label>
        </div>
      </div>
    `;
  }

  function toggleDietary(tag) {
    if (state.dietaryFilters.includes(tag)) {
      state.dietaryFilters = state.dietaryFilters.filter(t => t !== tag);
    } else {
      state.dietaryFilters.push(tag);
    }
    saveState();
    renderWheelTab();
    showToast(`อัปเดตตัวกรอง: ${tag}`);
  }

  function spinMuteluFood() {
    const stalls = window.TUData.stalls;
    const winner = stalls[Math.floor(Math.random() * stalls.length)];
    if (window.TUAudio) window.TUAudio.fanfare();
    showResultPopup(winner);
  }

  // --- Tab Rendering: Random with Friends (Party Room) ---
  let partyFriends = [
    { name: 'คุณ (Host)', vetoLeft: 1, avatar: '😎' },
    { name: 'น็อต (วิศวะ)', vetoLeft: 1, avatar: '🤖' },
    { name: 'เจน (พาณิชย์)', vetoLeft: 1, avatar: '👩‍💼' },
    { name: 'ปอนด์ (วารสาร)', vetoLeft: 1, avatar: '📸' }
  ];

  function renderFriendsTab() {
    const container = document.getElementById('friends-container');
    if (!container) return;

    if (state.tier === 'FREE') {
      container.innerHTML = `
        <div class="empty-wallet-card">
          <div class="empty-icon">👥</div>
          <h3>ฟีเจอร์สุ่มกับแก๊งเพื่อน (Party Mode)</h3>
          <p>ระบบสร้างห้องสุ่มอาหารพร้อมเพื่อนในโต๊ะ สามารถกด Veto ปัดตกเมนูที่ไม่ชอบได้คนละ 1 สิทธิ์</p>
          <button class="btn btn-primary" onclick="TUApp.setTier('VIP'); TUApp.showToast('🎉 ปลดล็อกโหมดสุ่มกับเพื่อนแล้ว!'); TUApp.renderFriendsTab();">
            ⚡ สลับเป็น VIP All-Access เพื่อทดสอบระบบ
          </button>
        </div>
      `;
      return;
    }

    const friendsHtml = partyFriends.map(f => `
      <div class="party-member-chip">
        <span class="member-avatar">${f.avatar}</span>
        <span class="member-name">${f.name}</span>
        <span class="member-veto-badge ${f.vetoLeft > 0 ? 'available' : 'used'}">
          ${f.vetoLeft > 0 ? '🛡️ มีสิทธิ์ Veto' : '✕ ใช้สิทธิ์แล้ว'}
        </span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="party-hero-card">
        <div class="party-room-badge">👥 โต๊ะเด็ก มธ. ห้อง #TU-402</div>
        <h3 class="party-title">สุ่มหารฉันทามติกับเพื่อน (Party Veto Mode)</h3>
        <p class="party-desc">แก้ปัญหาโลกแตกเวลาเพื่อนคนนึงไม่กินเผ็ด อีกคนไม่อยากกินก๋วยเตี๋ยว</p>

        <div class="party-members-row">
          ${friendsHtml}
        </div>

        <div class="party-action-box" id="party-result-box">
          <p class="party-hint-text">เมื่อกดปุ่มด้านล่าง ระบบจะสุ่มร้านอาหาร และให้เพื่อนๆ ตัดสินใจร่วมกัน</p>
          <button class="btn btn-primary btn-large" onclick="TUApp.spinPartyFood()">
            🎡 เริ่มสุ่มหาร้านที่ทุกคนยอมรับ!
          </button>
        </div>
      </div>
    `;
  }

  function spinPartyFood() {
    const stalls = window.TUData.stalls;
    const winner = stalls[Math.floor(Math.random() * stalls.length)];

    const resultBox = document.getElementById('party-result-box');
    if (!resultBox) return;

    if (window.TUAudio) window.TUAudio.fanfare();

    resultBox.innerHTML = `
      <div class="party-winner-card animate-fade-in">
        <div class="winner-label">🏆 ผลการสุ่มรอบนี้:</div>
        <h3 class="winner-stall-name">${winner.name}</h3>
        <div class="winner-meta">📍 [${winner.location}] • เมนู: ${winner.recommendedMenu} (~${winner.avgPrice}฿)</div>

        <div class="party-decision-row">
          <button class="btn btn-primary" onclick="TUApp.acceptPartyFood('${winner.name}')">
            ✅ ทุกคนเห็นชอบ กินร้านนี้!
          </button>
          <button class="btn btn-secondary" onclick="TUApp.vetoPartyFood()">
            🛡️ ขอใช้สิทธิ์ VETO ปัดตก (สุ่มใหม่)
          </button>
        </div>
      </div>
    `;
  }

  function acceptPartyFood(stallName) {
    launchConfetti();
    showToast(`🎉 ตกลงกันได้แล้ว! วันนี้ไปกิน "${stallName}"`);
    renderFriendsTab();
  }

  function vetoPartyFood() {
    const available = partyFriends.find(f => f.vetoLeft > 0);
    if (available) {
      available.vetoLeft--;
      showToast(`🛡️ ${available.name} ใช้สิทธิ์ Veto ปัดตกร้านนี้! กำลังสุ่มตัวเลือกใหม่...`);
      setTimeout(spinPartyFood, 600);
    } else {
      showToast('⚠️ สิทธิ์ Veto ของทุกคนหมดแล้ว! ต้องยอมรับร้านนี้นะครับ');
    }
    renderFriendsTab();
  }

  // --- Tab Rendering: Campus Directory Explorer ---
  function renderDirectoryTab() {
    const container = document.getElementById('directory-container');
    if (!container) return;

    const stalls = window.TUData.stalls;
    const cardsHtml = stalls.map(s => `
      <div class="directory-card">
        <div class="dir-header">
          <span class="dir-location-pill">📍 [${s.location}]</span>
          <span class="dir-rating">⭐ ${s.rating}</span>
        </div>
        <h4 class="dir-name">${s.name}</h4>
        <div class="dir-menu">${s.recommendedMenu}</div>
        <div class="dir-meta">
          <span>~${s.avgPrice} ฿</span>
          <span>${s.openTime}:00-${s.closeTime}:00 น.</span>
          <span>${s.calories} kcal</span>
        </div>
        ${s.couponDeal ? `<div class="dir-coupon-deal">🎟️ ดีล: ${s.couponDeal.discountText}</div>` : ''}
        <button class="btn btn-secondary btn-small dir-btn" onclick="TUApp.targetStallFromDir('${s.id}')">
          🎡 สุ่มเฉพาะร้านนี้
        </button>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="dir-hero">
        <h3>🏬 ทำเนียบร้านอาหารรอบ มธ. รังสิต (Campus Directory)</h3>
        <p>สำรวจข้อมูลร้านทั้งหมดในระบบ ใช้งานได้แบบออฟไลน์ 100%</p>
      </div>
      <div class="directory-grid">
        ${cardsHtml}
      </div>
    `;
  }

  function targetStallFromDir(stallId) {
    const stall = window.TUData.stalls.find(s => s.id === stallId);
    if (stall) {
      showResultPopup(stall);
    }
  }

  // --- Navigation & Tab Switching ---
  function navigateToTab(tabId) {
    state.activeTab = tabId;
    saveState();

    document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-bar-item').forEach(b => b.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) targetPanel.classList.remove('hidden');

    const targetBtn = document.getElementById(`nav-btn-${tabId}`);
    if (targetBtn) targetBtn.classList.add('active');

    // Trigger tab-specific renders
    if (tabId === 'wheel') renderWheelTab();
    if (tabId === 'fast') renderFastTab();
    if (tabId === 'gacha') renderGachaTab();
    if (tabId === 'wallet') renderWalletTab();
    if (tabId === 'mealplan') renderMealPlanTab();
    if (tabId === 'mutelu') renderMuteluTab();
    if (tabId === 'friends') renderFriendsTab();
    if (tabId === 'directory') renderDirectoryTab();

    if (window.TUAudio) window.TUAudio.click();
  }

  // --- Header and Demo Switcher ---
  function renderHeader() {
    const tierBadge = document.getElementById('user-tier-badge');
    const tierTitle = document.getElementById('user-tier-title');
    const demoButtons = document.querySelectorAll('.btn-demo-tier');

    demoButtons.forEach(btn => {
      if (btn.getAttribute('data-tier') === state.tier) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const tierLabels = {
      FREE: { text: 'FREE USER', color: 'badge-free', title: 'ผู้ใช้งานทั่วไป (เหมือนเว็บเดิมในคลิป)' },
      EATER_PASS: { text: 'EATER PASS ⭐', color: 'badge-eater', title: 'นักล่าส่วนลด (สุ่มได้คูปอง 10-15%)' },
      MEAL_PLAN: { text: 'MEAL PLAN 🍱', color: 'badge-meal', title: 'จัดเซตเมนู 7 วัน 21 มื้อ คุมงบ' },
      VIP: { text: 'VIP ALL-ACCESS 👑', color: 'badge-vip', title: 'ปลดล็อกทุกฟีเจอร์ + สายมู + กลุ่ม' }
    };

    const cur = tierLabels[state.tier] || tierLabels.FREE;
    if (tierBadge) {
      tierBadge.textContent = cur.text;
      tierBadge.className = `tier-badge ${cur.color}`;
    }
    if (tierTitle) {
      tierTitle.textContent = cur.title;
    }
  }

  function setTier(newTier) {
    state.tier = newTier;
    saveState();
    if (window.TUAudio) window.TUAudio.couponUnlock();
    navigateToTab(state.activeTab);
    showToast(`🔄 สลับโหมดเป็น: ${newTier}`);
  }

  // --- Wheel Spin Trigger ---
  function spinWheel() {
    const stalls = getFilteredStalls();
    if (stalls.length === 0) {
      showToast('⚠️ ไม่พบร้านอาหารที่ตรงกับตัวกรอง กรุณาลดเงื่อนไข');
      return;
    }
    if (window.TUWheel) {
      window.TUWheel.spin();
    }
  }

  // --- Filter Dropdown Handlers ---
  function setLocation(locId) {
    state.selectedLocation = locId;
    saveState();
    renderWheelTab();
  }

  function setFoodType(typeId) {
    state.selectedFoodType = typeId;
    saveState();
    renderWheelTab();
  }

  function setBudget(b) {
    state.budgetFilter = b;
    saveState();
    document.querySelectorAll('.budget-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-budget') === b);
    });
    renderWheelTab();
  }

  function toggleOpenOnly() {
    state.openOnly = !state.openOnly;
    saveState();
    const btn = document.getElementById('btn-open-only');
    if (btn) btn.classList.toggle('active', state.openOnly);
    renderWheelTab();
    showToast(state.openOnly ? '⏰ กรองเฉพาะร้านที่เปิดอยู่ตอนนี้' : '⏰ แสดงร้านทั้งหมด');
  }

  // --- Initialization on page load ---
  function init() {
    loadState();
    renderHeader();

    // Init wheel canvas
    const wheelCanvas = document.getElementById('wheel-canvas');
    if (wheelCanvas && window.TUWheel) {
      window.TUWheel.init(wheelCanvas, winningItem => {
        showResultPopup(winningItem);
      });
    }

    // Populate Location Dropdown
    const locSelect = document.getElementById('select-location');
    if (locSelect && window.TUData) {
      locSelect.innerHTML = window.TUData.locations.map(l => 
        `<option value="${l.id}">${l.icon} ${l.name}</option>`
      ).join('');
      locSelect.value = state.selectedLocation;
      locSelect.addEventListener('change', e => setLocation(e.target.value));
    }

    // Populate Food Type Dropdown
    const typeSelect = document.getElementById('select-food-type');
    if (typeSelect && window.TUData) {
      typeSelect.innerHTML = window.TUData.foodTypes.map(t => 
        `<option value="${t.id}">${t.icon} ${t.name}</option>`
      ).join('');
      typeSelect.value = state.selectedFoodType;
      typeSelect.addEventListener('change', e => setFoodType(e.target.value));
    }

    // Default start tab
    navigateToTab('wheel');
  }

  return {
    init: init,
    setTier: setTier,
    navigateToTab: navigateToTab,
    spinWheel: spinWheel,
    spinSlotMachine: spinSlotMachine,
    openGacha: openGacha,
    useCoupon: useCoupon,
    closeModal: closeModal,
    setBudget: setBudget,
    toggleOpenOnly: toggleOpenOnly,
    reRandomizeMealPlan: reRandomizeMealPlan,
    spinMuteluFood: spinMuteluFood,
    toggleDietary: toggleDietary,
    spinPartyFood: spinPartyFood,
    acceptPartyFood: acceptPartyFood,
    vetoPartyFood: vetoPartyFood,
    targetStallFromDir: targetStallFromDir,
    showToast: showToast
  };
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.TUApp) window.TUApp.init();
});
