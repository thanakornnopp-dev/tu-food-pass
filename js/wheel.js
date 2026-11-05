/**
 * TU Food Pass - Interactive HTML5 Canvas Roulette Wheel
 * Smooth physics, deceleration, audio ticks, and high-DPI retina rendering.
 */

window.TUWheel = (function() {
  let canvas = null;
  let ctx = null;
  let items = [];
  let currentAngle = 0;
  let isSpinning = false;
  let spinVelocity = 0;
  let spinDecel = 0.985;
  let onCompleteCallback = null;
  let lastTickIndex = -1;

  // Harmonious modern color palette for wheel slices
  const sliceColors = [
    '#b91c1c', // TU Crimson Red
    '#d97706', // Amber Gold
    '#059669', // Emerald
    '#2563eb', // Royal Blue
    '#7c3aed', // Purple Violet
    '#db2777', // Pink Rose
    '#ea580c', // Orange
    '#0d9488', // Teal
    '#4f46e5', // Indigo
    '#ca8a04'  // Dark Gold
  ];

  function init(canvasElement, onComplete) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    onCompleteCallback = onComplete;
    setupDPI();
    window.addEventListener('resize', () => {
      setupDPI();
      draw();
    });
  }

  function setupDPI() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Set actual canvas resolution
    const size = Math.min(rect.width || 360, 420);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
  }

  function setItems(newItems) {
    items = newItems && newItems.length > 0 ? newItems : [{ name: 'ไม่มีข้อมูล', location: '' }];
    draw();
  }

  function draw() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const size = rect.width || 360;
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    const numSlices = items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Draw outer golden ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const angleStart = currentAngle + i * sliceAngle;
      const angleEnd = angleStart + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angleStart, angleEnd);
      ctx.closePath();

      ctx.fillStyle = sliceColors[i % sliceColors.length];
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angleStart + sliceAngle / 2);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 4;

      // Truncate long stall names
      const stall = items[i];
      let displayName = stall.name || 'ร้านอาหาร';
      if (displayName.length > 15) {
        displayName = displayName.substring(0, 13) + '..';
      }

      ctx.fillText(displayName, radius - 20, 5);

      // Mini location tag
      if (stall.location) {
        ctx.font = '10px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`[${stall.location}]`, radius - 20, 19);
      }

      ctx.restore();
    }

    // Outer edge dots (LED style carnival ring)
    const numDots = Math.min(numSlices * 3, 36);
    for (let d = 0; d < numDots; d++) {
      const dotAngle = (2 * Math.PI * d) / numDots;
      const dotX = center + Math.cos(dotAngle) * (radius + 2);
      const dotY = center + Math.sin(dotAngle) * (radius + 2);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = d % 2 === 0 ? '#ffffff' : '#f59e0b';
      ctx.fill();
    }

    // Center decorative hub
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#b91c1c';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#b91c1c';
    ctx.fill();

    // Center text/icon
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillText('TU', center, center);

    ctx.restore();
  }

  function spin(targetIndex = null) {
    if (isSpinning || items.length === 0) return;
    isSpinning = true;

    // Random or targeted stop position
    const numSlices = items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    let chosenIndex = targetIndex;
    if (chosenIndex === null || chosenIndex < 0 || chosenIndex >= numSlices) {
      chosenIndex = Math.floor(Math.random() * numSlices);
    }

    // Calculate final angle so the pointer at 12 o'clock (top, 3*PI/2) points to chosen slice
    const pointerAngle = (3 * Math.PI) / 2;
    const targetSliceCenter = chosenIndex * sliceAngle + sliceAngle / 2;
    
    // We want (currentAngleFinal + targetSliceCenter) % (2PI) == pointerAngle
    // Add 4-7 full rotations for excitement
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const totalExtraAngle = (fullSpins * 2 * Math.PI) + (pointerAngle - (currentAngle % (2 * Math.PI)) - targetSliceCenter + 4 * Math.PI) % (2 * Math.PI);

    // Initial velocity
    spinVelocity = 0.38 + Math.random() * 0.12;
    spinDecel = 0.988;

    animateSpin(chosenIndex);
  }

  function animateSpin(chosenIndex) {
    if (!isSpinning) return;

    currentAngle += spinVelocity;
    spinVelocity *= spinDecel;

    // Check which slice is currently passing under the pointer (for tick sound)
    const numSlices = items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const pointerAngle = (3 * Math.PI) / 2;
    const normalizedAngle = (pointerAngle - (currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const currentSlice = Math.floor(normalizedAngle / sliceAngle) % numSlices;

    if (currentSlice !== lastTickIndex) {
      lastTickIndex = currentSlice;
      if (window.TUAudio && typeof window.TUAudio.wheelTick === 'function') {
        window.TUAudio.wheelTick(spinVelocity * 10);
      }
    }

    draw();

    if (spinVelocity > 0.002) {
      requestAnimationFrame(() => animateSpin(chosenIndex));
    } else {
      isSpinning = false;
      spinVelocity = 0;
      draw();
      
      const winningItem = items[chosenIndex];
      if (window.TUAudio && typeof window.TUAudio.fanfare === 'function') {
        window.TUAudio.fanfare();
      }

      if (typeof onCompleteCallback === 'function') {
        onCompleteCallback(winningItem);
      }
    }
  }

  return {
    init: init,
    setItems: setItems,
    draw: draw,
    spin: spin,
    isSpinning: () => isSpinning
  };
})();
