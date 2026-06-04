/* ===================================================
   MASA MADRE CLUB — App Logic
   Toda la lógica de pantallas, interacciones y UI
   =================================================== */

// =============================================
// LANDING
// =============================================

function initLanding() {
  MMC.STATE.currentRole = 'client';
  // Animate value cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.value-card, .flow-step, .plan-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// =============================================
// CONFIGURATOR
// =============================================

function initConfigurator() {
  MMC.STATE.currentRole = 'client';
  MMC.STATE.configurator = {
    step: 1,
    daysPerWeek: null,
    selectedDays: [],
    timeSlot: null,
    breadTypes: {},
    deliveryNotes: ''
  };

  goToStep(1);
  renderBreadOptions();
}

function goToStep(step) {
  const cfg = MMC.STATE.configurator;
  cfg.step = step;

  // Hide all steps
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`config-step-${s}`);
    if (el) el.style.display = 'none';
  });

  // Show current step
  const current = document.getElementById(`config-step-${step}`);
  if (current) {
    current.style.display = 'block';
    current.style.animation = 'fadeInUp 0.3s ease';
  }

  // Update stepper
  [1, 2, 3].forEach(s => {
    const stepper = document.getElementById(`stepper-${s}`);
    if (!stepper) return;
    stepper.classList.remove('active', 'done');
    if (s < step) stepper.classList.add('done');
    if (s === step) stepper.classList.add('active');
  });

  // Update header text
  const titles = {
    1: ['Elige tu frecuencia', '¿Cuántos días a la semana quieres pan fresco?'],
    2: ['Horario y dirección', '¿A qué hora y dónde te entregamos?'],
    3: ['Tu pan', '¿Qué variedad quieres recibir?']
  };
  const [title, subtitle] = titles[step] || ['', ''];
  document.getElementById('config-title').textContent = title;
  document.getElementById('config-subtitle').textContent = subtitle;
  document.getElementById('step-label').textContent = step;

  // Show sidebar from step 2
  const sidebar = document.getElementById('config-sidebar');
  if (sidebar) sidebar.style.display = step > 1 ? 'block' : 'none';

  if (step > 1) renderSidebarSummary();
}

function selectFrequency(freq) {
  const cfg = MMC.STATE.configurator;
  cfg.daysPerWeek = freq;

  // Update UI
  document.querySelectorAll('.freq-option').forEach(el => el.classList.remove('selected'));
  const selected = document.getElementById(`freq-${freq}`);
  if (selected) selected.classList.add('selected');

  // Show day selector
  const daySelector = document.getElementById('day-selector');
  if (daySelector) {
    daySelector.style.display = 'block';
    daySelector.style.animation = 'fadeInUp 0.3s ease';
  }

  // Reset selected days
  cfg.selectedDays = [];
  renderDayButtons(freq);

  updateStep1Button();
}

function renderDayButtons(freq) {
  const grid = document.getElementById('days-grid');
  const hint = document.getElementById('days-hint');
  if (!grid) return;

  grid.innerHTML = MMC.DAYS.map(day => `
    <button class="day-btn" id="day-${day}" onclick="toggleDay('${day}')">${day}</button>
  `).join('');

  if (hint) hint.innerHTML = `Selecciona <strong>${freq}</strong> días`;
}

function toggleDay(day) {
  const cfg = MMC.STATE.configurator;
  const maxDays = cfg.daysPerWeek;

  if (cfg.selectedDays.includes(day)) {
    cfg.selectedDays = cfg.selectedDays.filter(d => d !== day);
  } else {
    if (cfg.selectedDays.length >= maxDays) {
      Toast.show(`Solo puedes seleccionar ${maxDays} días con este plan`, 'warning');
      return;
    }
    cfg.selectedDays.push(day);
  }

  // Update buttons
  MMC.DAYS.forEach(d => {
    const btn = document.getElementById(`day-${d}`);
    if (btn) btn.classList.toggle('selected', cfg.selectedDays.includes(d));
  });

  updateStep1Button();
}

function updateStep1Button() {
  const cfg = MMC.STATE.configurator;
  const btn = document.getElementById('btn-step1-next');
  const ready = cfg.daysPerWeek && cfg.selectedDays.length === cfg.daysPerWeek;
  if (btn) btn.disabled = !ready;
}

function selectSlot(slotId) {
  MMC.STATE.configurator.timeSlot = slotId;

  document.querySelectorAll('.time-option').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`slot-${slotId}`);
  if (el) el.classList.add('selected');

  updateStep2Button();
}

function updateStep2Button() {
  const cfg = MMC.STATE.configurator;
  const btn = document.getElementById('btn-step2-next');
  const address = document.getElementById('delivery-address');
  const ready = cfg.timeSlot && address && address.value.trim().length > 5;
  if (btn) btn.disabled = !ready;
}

// Attach address input listener after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const addr = document.getElementById('delivery-address');
  if (addr) addr.addEventListener('input', updateStep2Button);
});

function calculateExtraCost(cfg) {
  const limit = cfg.daysPerWeek === 2 ? 4 : (cfg.daysPerWeek === 3 ? 6 : 8);
  const selectedItems = [];
  Object.entries(cfg.breadTypes).forEach(([type, qty]) => {
    const bread = MMC.BREAD_TYPES.find(b => b.type === type);
    for (let i = 0; i < qty; i++) {
      selectedItems.push(bread.price_per_unit);
    }
  });

  if (selectedItems.length <= limit) {
    return { extraPerDelivery: 0, extraPerMonth: 0, totalItems: selectedItems.length, limit };
  }

  // Sort prices descending to cover most expensive items in the plan
  selectedItems.sort((a, b) => b - a);

  const extraItems = selectedItems.slice(limit);
  const extraPerDelivery = extraItems.reduce((sum, p) => sum + p, 0);

  const deliveriesPerMonth = cfg.daysPerWeek * 4;
  const extraPerMonth = extraPerDelivery * deliveriesPerMonth;

  return { extraPerDelivery, extraPerMonth, totalItems: selectedItems.length, limit };
}

function renderBreadOptions() {
  const container = document.getElementById('bread-options');
  if (!container) return;

  container.innerHTML = MMC.BREAD_TYPES.map(bread => `
    <button class="bread-option" id="bread-${bread.type}" onclick="toggleBread('${bread.type}')" style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md);text-align:left;width:100%;background:white;border:2px solid var(--color-kraft-light);border-radius:var(--radius-xl);cursor:pointer;transition:all var(--transition-base)">
      <img src="${bread.image}" alt="${bread.label}" class="bread-img-thumb" style="width:90px;height:90px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0" />
      <div class="bread-info" style="flex:1">
        <h4 style="margin:0 0 4px 0">${bread.emoji} ${bread.label}</h4>
        <p style="margin:0 0 var(--space-sm) 0;font-size:0.85rem;color:var(--color-crust-light);line-height:1.4">${bread.description}</p>
        <div class="bread-tags" style="display:flex;gap:4px;flex-wrap:wrap">
          ${bread.tags.map(t => `<span class="bread-tag" style="font-size:0.7rem;padding:2px 8px;background:rgba(122,158,126,0.1);color:var(--color-sage-dark);border-radius:var(--radius-full)">${t}</span>`).join('')}
        </div>
      </div>
      <div class="bread-qty" id="bread-qty-${bread.type}" style="display:none;flex-direction:column;align-items:center;gap:8px">
        <div class="qty-control" style="display:flex;align-items:center;gap:8px;background:var(--color-wheat);padding:4px;border-radius:var(--radius-full)">
          <button class="qty-btn" onclick="event.stopPropagation();changeQty('${bread.type}', -1)" style="width:28px;height:28px;border-radius:50%;background:white;border:1px solid var(--color-kraft-light);display:flex;align-items:center;justify-content:center;font-weight:bold;cursor:pointer">-</button>
          <span class="qty-value" id="qty-val-${bread.type}" style="font-weight:bold;min-width:20px;text-align:center">1</span>
          <button class="qty-btn" onclick="event.stopPropagation();changeQty('${bread.type}', 1)" style="width:28px;height:28px;border-radius:50%;background:white;border:1px solid var(--color-kraft-light);display:flex;align-items:center;justify-content:center;font-weight:bold;cursor:pointer">+</button>
        </div>
        <div class="bread-price" style="font-size:0.78rem;color:var(--color-sage-dark);font-weight:600">Incluido</div>
      </div>
    </button>
  `).join('');
}

function toggleBread(type) {
  const cfg = MMC.STATE.configurator;
  const maxQuota = cfg.daysPerWeek === 2 ? 4 : (cfg.daysPerWeek === 3 ? 6 : 8);

  if (cfg.breadTypes[type]) {
    delete cfg.breadTypes[type];
    document.getElementById(`bread-${type}`).classList.remove('selected');
    document.getElementById(`bread-qty-${type}`).style.display = 'none';
  } else {
    const currentTotal = Object.values(cfg.breadTypes).reduce((sum, q) => sum + q, 0);
    if (currentTotal >= maxQuota) {
      Toast.show(`Excedes la cuota del plan (${maxQuota} panes). Cada unidad extra se cobrará adicional.`, 'info');
    }
    cfg.breadTypes[type] = 1;
    document.getElementById(`bread-${type}`).classList.add('selected');
    document.getElementById(`bread-qty-${type}`).style.display = 'flex';
  }

  updateBreadSummary();
}

function changeQty(type, delta) {
  const cfg = MMC.STATE.configurator;
  if (!cfg.breadTypes[type]) return;

  const currentTotal = Object.values(cfg.breadTypes).reduce((sum, q) => sum + q, 0);
  const maxQuota = cfg.daysPerWeek === 2 ? 4 : (cfg.daysPerWeek === 3 ? 6 : 8);

  if (delta > 0 && currentTotal >= maxQuota) {
    Toast.show(`Excedes la cuota del plan (${maxQuota} panes). Cada unidad extra se cobrará adicional.`, 'info');
  }

  if (delta > 0 && currentTotal >= 15) {
    Toast.show(`Límite máximo absoluto de 15 panes por entrega alcanzado.`, 'warning');
    return;
  }

  cfg.breadTypes[type] = Math.max(1, Math.min(15, cfg.breadTypes[type] + delta));
  const valEl = document.getElementById(`qty-val-${type}`);
  if (valEl) valEl.textContent = cfg.breadTypes[type];

  updateBreadSummary();
}

function updateBreadSummary() {
  const cfg = MMC.STATE.configurator;
  const summary = document.getElementById('bread-summary');
  const btn = document.getElementById('btn-step3-next');

  const hasSelection = Object.keys(cfg.breadTypes).length > 0;
  if (btn) btn.disabled = !hasSelection;

  if (!summary) return;

  if (!hasSelection) {
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'block';

  const extra = calculateExtraCost(cfg);

  const items = Object.entries(cfg.breadTypes).map(([type, qty]) => {
    const bread = MMC.BREAD_TYPES.find(b => b.type === type);
    return `<div class="sidebar-row">
      <span>${bread.emoji} ${bread.label} × ${qty}</span>
      <span style="color:var(--color-sage-dark);font-weight:600">Incluido</span>
    </div>`;
  }).join('');

  let extraHTML = '';
  if (extra.extraPerDelivery > 0) {
    extraHTML = `
      <div class="divider" style="margin:var(--space-sm) 0"></div>
      <div class="sidebar-row" style="color:var(--color-warning);font-weight:600">
        <span>⚠️ Exceso de cuota (${extra.totalItems - extra.limit} panes extra)</span>
        <span>+${MMC.formatCLP(extra.extraPerDelivery)}/entrega</span>
      </div>
      <div style="font-size:0.8rem;color:var(--color-crust-light);text-align:right">
        (+${MMC.formatCLP(extra.extraPerMonth)}/mes adicional)
      </div>
    `;
  }

  summary.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md)">
      <h4 style="font-family:var(--font-display);margin:0">🛒 Tu selección</h4>
      <span class="badge ${extra.totalItems > extra.limit ? 'badge-warning' : 'badge-success'}">
        Cuota: ${extra.totalItems}/${extra.limit} panes
      </span>
    </div>
    ${items}
    ${extraHTML}
  `;
}

function renderSidebarSummary() {
  const cfg = MMC.STATE.configurator;
  const sidebar = document.getElementById('sidebar-summary');
  if (!sidebar) return;

  const plan = MMC.PLANS[cfg.daysPerWeek];
  const extra = calculateExtraCost(cfg);
  const totalMonth = (plan ? plan.price : 0) + extra.extraPerMonth;

  sidebar.innerHTML = `
    <div class="sidebar-row">
      <span class="sidebar-key">Plan</span>
      <span class="sidebar-val">${plan ? plan.label : '—'}</span>
    </div>
    <div class="sidebar-row">
      <span class="sidebar-key">Días</span>
      <span class="sidebar-val">${cfg.selectedDays.length ? cfg.selectedDays.join(', ') : '—'}</span>
    </div>
    <div class="sidebar-row">
      <span class="sidebar-key">Horario</span>
      <span class="sidebar-val">${cfg.timeSlot ? MMC.TIME_SLOTS.find(s => s.id === cfg.timeSlot)?.label || '—' : '—'}</span>
    </div>
    ${extra.extraPerMonth > 0 ? `
    <div class="sidebar-row" style="color:var(--color-warning)">
      <span class="sidebar-key">Panes adicionales</span>
      <span class="sidebar-val">+${MMC.formatCLP(extra.extraPerMonth)}/mes</span>
    </div>` : ''}
    <div class="sidebar-row" style="margin-top:var(--space-sm);border-top:1px solid var(--color-kraft-light);padding-top:8px">
      <span class="sidebar-key">Total mensual</span>
      <span class="sidebar-price">${MMC.formatCLP(totalMonth)}</span>
    </div>
  `;
}

function goToCheckout() {
  const cfg = MMC.STATE.configurator;
  if (Object.keys(cfg.breadTypes).length === 0) {
    Toast.show('Selecciona al menos un tipo de pan', 'warning');
    return;
  }

  const extra = calculateExtraCost(cfg);

  MMC.STATE.checkout.plan = MMC.PLANS[cfg.daysPerWeek];
  MMC.STATE.checkout.price = (MMC.PLANS[cfg.daysPerWeek]?.price || 0) + extra.extraPerMonth;
  MMC.STATE.checkout.extraPerMonth = extra.extraPerMonth;

  Router.navigate('screen-checkout');
}

// =============================================
// CHECKOUT
// =============================================

function initCheckout() {
  MMC.STATE.currentRole = 'client';
  renderCheckoutSummary();
  renderCheckoutTotal();
}

function renderCheckoutSummary() {
  const cfg = MMC.STATE.configurator;
  const plan = MMC.PLANS[cfg.daysPerWeek] || MMC.PLANS[3];
  const card = document.getElementById('checkout-plan-card');
  if (!card) return;

  const slot = MMC.TIME_SLOTS.find(s => s.id === cfg.timeSlot);
  const extra = calculateExtraCost(cfg);

  const breadItems = Object.entries(cfg.breadTypes).map(([type, qty]) => {
    const bread = MMC.BREAD_TYPES.find(b => b.type === type);
    return `<div class="checkout-plan-item">
      <span class="checkout-plan-emoji">${bread.emoji}</span>
      <span class="checkout-plan-name">${bread.label} × ${qty}</span>
      <span class="checkout-plan-price" style="color:var(--color-sage-dark);font-weight:600">Incluido</span>
    </div>`;
  }).join('') || `<div class="checkout-plan-item">
    <span class="checkout-plan-emoji">🌾</span>
    <span class="checkout-plan-name">Masa Madre Integral × 2</span>
    <span class="checkout-plan-price" style="color:var(--color-sage-dark);font-weight:600">Incluido</span>
  </div>`;

  let extraSection = '';
  if (extra.extraPerDelivery > 0) {
    extraSection = `
      <div class="divider"></div>
      <div class="checkout-plan-item" style="color:var(--color-warning)">
        <span class="checkout-plan-emoji">⚠️</span>
        <span class="checkout-plan-name">Exceso de cuota (${extra.totalItems - extra.limit} panes extra)</span>
        <span class="checkout-plan-price">+${MMC.formatCLP(extra.extraPerMonth)}/mes</span>
      </div>
    `;
  }

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
      <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--gradient-hero);display:flex;align-items:center;justify-content:center;font-size:1.4rem">🍞</div>
      <div>
        <h3 style="font-family:var(--font-display);margin:0">${plan.label}</h3>
        <p style="font-size:0.85rem;color:var(--color-crust-light);margin:0">${plan.description}</p>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-size:1.4rem;font-weight:700;font-family:var(--font-display);color:var(--color-earth)">${MMC.formatCLP(plan.price)}</div>
        <div style="font-size:0.8rem;color:var(--color-kraft)">/mes</div>
      </div>
    </div>
    <div class="divider"></div>
    <div style="margin:var(--space-md) 0">
      <div class="sidebar-row"><span class="sidebar-key">📅 Días de entrega</span><span class="sidebar-val">${cfg.selectedDays.length ? cfg.selectedDays.join(', ') : 'Lunes, Miércoles, Viernes'}</span></div>
      <div class="sidebar-row"><span class="sidebar-key">🕐 Horario</span><span class="sidebar-val">${slot ? slot.label : '07:00 – 08:30'}</span></div>
    </div>
    <div class="divider"></div>
    <h4 style="margin-bottom:var(--space-sm);font-size:0.9rem">Tu pan:</h4>
    ${breadItems}
    ${extraSection}
  `;
}

function renderCheckoutTotal() {
  const plan = MMC.STATE.checkout.plan || MMC.PLANS[3];
  const extraPerMonth = MMC.STATE.checkout.extraPerMonth || 0;
  const container = document.getElementById('checkout-total');
  if (!container) return;

  const subtotal = plan.price;
  const total = subtotal + extraPerMonth;

  container.innerHTML = `
    <div class="total-row"><span>Suscripción ${plan.label}</span><span>${MMC.formatCLP(subtotal)}/mes</span></div>
    ${extraPerMonth > 0 ? `<div class="total-row"><span>Panes adicionales</span><span>${MMC.formatCLP(extraPerMonth)}/mes</span></div>` : ''}
    <div class="total-row"><span>Despacho</span><span style="color:var(--color-sage-dark);font-weight:600">¡Gratis!</span></div>
    <div class="total-final"><span>Total mensual</span><span class="amount">${MMC.formatCLP(total)}</span></div>
  `;
}

function selectPayMethod(method) {
  document.querySelectorAll('.pay-method').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`pay-${method}`);
  if (el) el.classList.add('active');

  // Show/hide card form
  const cardForm = document.getElementById('card-form');
  if (cardForm) cardForm.style.display = method === 'webpay' ? 'block' : 'none';
}

function processPayment() {
  const name = document.getElementById('ch-name')?.value;
  const email = document.getElementById('ch-email')?.value;

  if (!name || !email) {
    Toast.show('Por favor completa tu nombre y email', 'warning');
    return;
  }

  const btn = document.getElementById('btn-pay');
  if (btn) {
    btn.textContent = '⏳ Procesando...';
    btn.disabled = true;
  }

  setTimeout(() => {
    Toast.show('¡Suscripción activada! Tu primer pan llega mañana 🍞', 'success', 4000);
    setTimeout(() => {
      Router.navigate('screen-client-dashboard');
    }, 1000);
  }, 2000);
}

// =============================================
// CLIENT DASHBOARD
// =============================================

function initClientDashboard() {
  MMC.STATE.currentRole = 'client';

  // Render next delivery status
  renderDeliveryStatus();
  renderUpcomingDeliveries();
  renderInspirationStrip();
}

function renderDeliveryStatus() {
  const sub = MMC.DB.subscriptions[0];
  const delivery = MMC.DB.deliveries.find(d => d.subscription_id === sub.id);
  if (!delivery) return;

  const statusInfo = MMC.getDeliveryStatus(delivery.status);

  // Status pill
  const statusEl = document.getElementById('next-del-status');
  if (statusEl) {
    statusEl.innerHTML = `
      <span class="status-dot ${delivery.status.replace('_', '-')}"></span>
      <span style="color:white;font-weight:600;font-size:0.95rem">${statusInfo.icon} ${statusInfo.label}</span>
    `;
  }

  // Tracker steps
  const trackerEl = document.getElementById('delivery-tracker');
  if (trackerEl) {
    const steps = [
      { id: 'preparing', icon: '🔥', label: 'En preparación', status: 'preparing' },
      { id: 'in_transit', icon: '🚲', label: 'En camino', status: 'in_transit' },
      { id: 'delivered', icon: '✅', label: 'Entregado', status: 'delivered' }
    ];

    const statusOrder = ['preparing', 'in_transit', 'delivered'];
    const currentIdx = statusOrder.indexOf(delivery.status);

    trackerEl.innerHTML = steps.map((step, i) => {
      const isDone = i < currentIdx;
      const isCurrent = i === currentIdx;
      return `<div class="tracker-step ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}">
        <span class="tracker-step-icon">${isDone ? '✅' : step.icon}</span>
        <span>${step.label}</span>
      </div>`;
    }).join('');
  }
}

function renderUpcomingDeliveries() {
  const container = document.getElementById('upcoming-deliveries');
  if (!container) return;

  const upcoming = [
    { date: '05', day: 'Jueves', items: 'Integral ×2, Semillas ×1', slot: '07:00–08:30', status: 'in_transit' },
    { date: '09', day: 'Lunes', items: 'Integral ×2, Semillas ×1', slot: '07:00–08:30', status: 'preparing' },
    { date: '12', day: 'Jueves', items: 'Integral ×2, Semillas ×1', slot: '07:00–08:30', status: 'preparing' },
    { date: '16', day: 'Lunes', items: 'Integral ×2, Semillas ×1', slot: '07:00–08:30', status: 'preparing' }
  ];

  container.innerHTML = upcoming.map(d => {
    const statusInfo = MMC.getDeliveryStatus(d.status);
    const canMod = d.date !== '05'; // simulate: only block today
    return `<div class="delivery-item">
      <div class="delivery-date-block">
        <div class="delivery-date-day">${d.date}</div>
        <div class="delivery-date-name">${d.day}</div>
      </div>
      <div class="delivery-info">
        <h4>🍞 ${d.items}</h4>
        <p>⏰ ${d.slot} · Conserjería</p>
      </div>
      <span class="badge badge-${statusInfo.color === 'earth' ? 'earth' : statusInfo.color === 'success' ? 'success' : 'warning'}">
        ${statusInfo.icon} ${statusInfo.label}
      </span>
      <button class="btn btn-ghost btn-sm" ${!canMod ? 'disabled title="Modificación requerida con 24h de anticipación"' : ''} 
        onclick="${canMod ? `Toast.show('Modificación guardada ✅', 'success')` : ''}">
        ${canMod ? '✏️ Modificar' : '🔒 Bloqueado'}
      </button>
    </div>`;
  }).join('');
}

function renderInspirationStrip() {
  const el = document.getElementById('inspiration-text');
  if (!el) return;
  const copy = MMC.MICRO_COPIES[Math.floor(Math.random() * MMC.MICRO_COPIES.length)];
  el.textContent = `"${copy}"`;
}

function openPauseModal() {
  // Set minimum dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const fromInput = document.getElementById('pause-from');
  const toInput = document.getElementById('pause-to');

  if (fromInput) {
    fromInput.min = tomorrow.toISOString().split('T')[0];
    fromInput.value = tomorrow.toISOString().split('T')[0];
  }
  if (toInput) {
    const defaultResume = new Date(tomorrow);
    defaultResume.setDate(defaultResume.getDate() + 7);
    toInput.min = tomorrow.toISOString().split('T')[0];
    toInput.value = defaultResume.toISOString().split('T')[0];
  }

  Modal.open('pause-modal');
}

function confirmPause() {
  const from = document.getElementById('pause-from')?.value;
  const to = document.getElementById('pause-to')?.value;

  if (!from || !to) {
    Toast.show('Selecciona las fechas de pausa', 'warning');
    return;
  }

  Modal.close('pause-modal');
  Toast.show(`Suscripción pausada del ${from} al ${to} ✅`, 'success', 4000);
}

// =============================================
// PARTNER DASHBOARD
// =============================================

function initPartnerDashboard() {
  MMC.STATE.currentRole = 'partner';
  switchPartnerTab('production');
}

function switchPartnerTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });

  const tab = document.getElementById(`tab-${tabName}`);
  if (tab) tab.style.display = 'block';

  if (tabName === 'production') renderProductionTab();
  if (tabName === 'efecto-ojo') renderEfectoOjoTab();
}

function renderProductionTab() {
  const order = MMC.DB.production_orders[0];
  if (!order) return;

  // Update total
  const totalEl = document.getElementById('total-units');
  if (totalEl) totalEl.textContent = order.total_units;

  // Production items
  const prodGrid = document.getElementById('production-items');
  if (prodGrid) {
    prodGrid.innerHTML = order.items.map(item => `
      <div class="production-item-card">
        <div class="prod-emoji">${item.emoji}</div>
        <div class="prod-label">${item.label}</div>
        <div class="prod-qty">${item.quantity}</div>
        <div class="prod-unit">unidades</div>
        <div style="margin-top:var(--space-md)">
          <span class="badge badge-sage">✅ Pedido confirmado</span>
        </div>
      </div>
    `).join('');
  }

  // Ingredients
  const ingList = document.getElementById('ingredients-list');
  if (ingList) {
    const maxQty = Math.max(...order.ingredients.map(i => i.quantity));
    ingList.innerHTML = order.ingredients.map(ing => `
      <div class="ingredient-row">
        <span class="ingredient-icon">${ing.emoji}</span>
        <span class="ingredient-name">${ing.name}</span>
        <div class="ingredient-bar-wrap">
          <div class="ingredient-bar" style="width:${(ing.quantity / maxQty * 100).toFixed(0)}%"></div>
        </div>
        <span class="ingredient-qty">${ing.quantity} ${ing.unit}</span>
      </div>
    `).join('');

    // Animate bars
    setTimeout(() => {
      document.querySelectorAll('.ingredient-bar').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = w; }, 100);
      });
    }, 100);
  }
}

function renderEfectoOjoTab() {
  const stock = MMC.DB.physical_stock;

  // Stock items
  const efecGrid = document.getElementById('efecto-stock');
  if (efecGrid) {
    efecGrid.innerHTML = stock.items.map(item => `
      <div class="efecto-item">
        <div class="efecto-emoji">${item.emoji}</div>
        <div class="efecto-info">
          <h4>${item.label}</h4>
          <p style="margin-bottom:var(--space-sm)">${MMC.formatCLP(item.price_display)} la unidad · Bolsa kraft biodegradable</p>
          <div class="efecto-stats">
            <div class="efecto-stat-item">
              <div class="efecto-stat-val">${item.stock_display}</div>
              <div class="efecto-stat-lbl">En mostrador</div>
            </div>
            <div class="efecto-stat-item">
              <div class="efecto-stat-val">${item.sold_today}</div>
              <div class="efecto-stat-lbl">Vendidos hoy</div>
            </div>
            <div class="efecto-stat-item">
              <div class="efecto-stat-val">${item.remaining}</div>
              <div class="efecto-stat-lbl">Restantes</div>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="Toast.show('Stock actualizado ✅', 'success')">
          Actualizar stock
        </button>
      </div>
    `).join('');
  }

  // Cross sell
  const csGrid = document.getElementById('cross-sell-grid');
  if (csGrid) {
    csGrid.innerHTML = stock.cross_sell.map(cs => `
      <div class="cross-sell-card">
        <div class="cs-emoji">${cs.emoji}</div>
        <div class="cs-name">${cs.item}</div>
        <div class="cs-price">${MMC.formatCLP(cs.price)}</div>
        <div class="cs-sold">🛒 ${cs.sold} vendidos hoy</div>
      </div>
    `).join('');
  }
}

// =============================================
// DELIVERY DASHBOARD
// =============================================

let currentDeliveryId = null;

function initDelivery() {
  MMC.STATE.currentRole = 'delivery';

  renderDeliveryProgress();
  renderMapPins();
  renderRouteList();
}

function renderDeliveryProgress() {
  const deliveries = MMC.DB.deliveries;
  const total = deliveries.length;
  const delivered = deliveries.filter(d => d.status === 'delivered').length;
  const pct = Math.round((delivered / total) * 100);
  const circumference = 2 * Math.PI * 30; // r=30

  const container = document.getElementById('delivery-progress');
  if (!container) return;

  container.innerHTML = `
    <div class="ring-container">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle class="ring-bg" cx="40" cy="40" r="30" />
        <circle class="ring-progress ring-circle" cx="40" cy="40" r="30"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference - (pct / 100) * circumference}"
          id="ring-prog" />
      </svg>
      <div class="ring-text">
        <div class="ring-value">${delivered}/${total}</div>
        <div class="ring-label">entregados</div>
      </div>
    </div>
    <div style="text-align:center">
      <div style="font-size:0.9rem;font-weight:600;color:var(--color-earth)">${pct}% completado</div>
    </div>
  `;

  // Update badge
  const badge = document.getElementById('delivery-count-badge');
  if (badge) {
    badge.innerHTML = `<span class="badge badge-sage">${delivered} ✅ · ${total - delivered} pendientes</span>`;
  }
}

function renderMapPins() {
  const container = document.getElementById('map-pins');
  if (!container) return;

  container.innerHTML = MMC.DB.deliveries.map((d, i) => {
    const statusClass = d.status === 'in_transit' ? 'in-transit' :
                        d.status === 'delivered' ? 'delivered' : 'preparing';
    const icon = d.status === 'delivered' ? '✅' :
                 d.status === 'in_transit' ? '🚲' : '🔥';
    return `<div class="map-pin" style="animation-delay:${i * 0.1}s" onclick="highlightRoute('${d.id}')">
      <div class="pin-icon ${statusClass}"><span>${icon}</span></div>
      <div class="pin-label">#${i + 1}</div>
    </div>`;
  }).join('');
}

function renderRouteList() {
  const container = document.getElementById('delivery-route-list');
  if (!container) return;

  const breadLabels = {
    integral: { emoji: '🌾', short: 'Int' },
    semillas: { emoji: '🌻', short: 'Sem' },
    baguette_fit: { emoji: '🥖', short: 'Bag' }
  };

  container.innerHTML = MMC.DB.deliveries.map((d, i) => {
    const statusInfo = MMC.getDeliveryStatus(d.status);
    const isDelivered = d.status === 'delivered';

    const items = d.items.map(item => {
      const b = breadLabels[item.type] || { emoji: '🍞', short: '?' };
      return `<span class="route-item-badge">${b.emoji} ×${item.quantity}</span>`;
    }).join('');

    return `<div class="route-item ${isDelivered ? 'delivered' : ''}" id="route-${d.id}">
      <div class="route-order">${i + 1}</div>
      <div class="route-info">
        <div class="route-name">${d.user_name}</div>
        <div class="route-address">📍 ${d.address.street}</div>
        <div class="route-notes">ℹ️ ${d.address.notes}</div>
      </div>
      <div class="route-items">${items}</div>
      <div class="route-time">⏰ ${d.time_slot}</div>
      <span class="badge badge-${statusInfo.color === 'earth' ? 'earth' : statusInfo.color === 'success' ? 'success' : 'warning'}">
        ${statusInfo.icon}
      </span>
      <div class="route-action">
        ${isDelivered
          ? `<span class="badge badge-success">✅ Entregado</span>`
          : `<button class="btn btn-sage btn-sm" onclick="openPhotoModal('${d.id}', '${d.address.street}')">
              📸 Marcar entregado
            </button>`
        }
      </div>
    </div>`;
  }).join('');
}

function highlightRoute(deliveryId) {
  document.querySelectorAll('.route-item').forEach(el => el.style.border = '');
  const el = document.getElementById(`route-${deliveryId}`);
  if (el) {
    el.style.border = '2px solid var(--color-earth)';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function openPhotoModal(deliveryId, address) {
  currentDeliveryId = deliveryId;
  const addressEl = document.getElementById('photo-modal-address');
  if (addressEl) addressEl.textContent = `📍 ${address}`;
  Modal.open('photo-modal');
}

function confirmDelivery() {
  if (!currentDeliveryId) return;

  // Update in mock DB
  const delivery = MMC.DB.deliveries.find(d => d.id === currentDeliveryId);
  if (delivery) {
    delivery.status = 'delivered';
    delivery.delivered_at = new Date().toISOString();
    delivery.proof_photo_url = 'mock_photo_url';
  }

  Modal.close('photo-modal');
  Toast.show('¡Entrega registrada! Foto enviada al cliente 📸', 'success', 3000);

  // Re-render
  renderDeliveryProgress();
  renderMapPins();
  renderRouteList();
  currentDeliveryId = null;
}
