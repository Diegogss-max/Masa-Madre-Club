/* ===================================================
   MASA MADRE CLUB — SPA Router + Toast + Utils
   =================================================== */

// ===== ROUTER =====
const Router = {
  currentScreen: null,

  navigate(screenId, extras = {}) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Show target
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger screen-specific init
      if (typeof ScreenInit[screenId] === 'function') {
        ScreenInit[screenId](extras);
      }

      // Update nav profile tabs
      Router.updateNavTabs();
    }
  },

  updateNavTabs() {
    const role = MMC.STATE.currentRole;
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.role === role) tab.classList.add('active');
    });
  }
};

// ===== SCREEN INIT HANDLERS =====
const ScreenInit = {
  'screen-landing': () => initLanding(),
  'screen-configurator': () => initConfigurator(),
  'screen-checkout': () => initCheckout(),
  'screen-client-dashboard': () => initClientDashboard(),
  'screen-partner-dashboard': () => initPartnerDashboard(),
  'screen-delivery': () => initDelivery()
};

// ===== TOAST =====
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'success', duration = 3000) {
    if (!this.container) return;
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }
};

// ===== SCROLL NAV =====
function initScrollNav() {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ===== PROFILE SWITCHER =====
function initProfileSwitcher() {
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const role = tab.dataset.role;
      MMC.STATE.currentRole = role;
      const screens = {
        client: 'screen-client-dashboard',
        partner: 'screen-partner-dashboard',
        delivery: 'screen-delivery'
      };
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (screens[role]) Router.navigate(screens[role]);
    });
  });
}

// ===== MODAL =====
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }
};

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  initScrollNav();
  initProfileSwitcher();
  Router.navigate('screen-landing');
});
