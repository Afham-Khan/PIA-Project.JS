/* ============================================================
   PIA REDESIGN — MAIN JS
   Covers: nav, search, tabs, toast, modal, a11y, animations
   ============================================================ */

'use strict';

/* ---- Flight Data (Hardcoded) ---- */
const CITIES = [
  { code: 'KHI', name: 'Karachi', airport: 'Jinnah International Airport' },
  { code: 'LHE', name: 'Lahore',  airport: 'Allama Iqbal International Airport' },
  { code: 'ISB', name: 'Islamabad', airport: 'Islamabad International Airport' },
  { code: 'PEW', name: 'Peshawar', airport: 'Bacha Khan International Airport' },
  { code: 'MUX', name: 'Multan',  airport: 'Multan International Airport' },
  { code: 'SKZ', name: 'Sukkur',  airport: 'Sukkur Airport' },
  { code: 'DXB', name: 'Dubai',   airport: 'Dubai International Airport' },
  { code: 'LHR', name: 'London',  airport: 'Heathrow Airport' },
  { code: 'JFK', name: 'New York', airport: 'John F. Kennedy International' },
  { code: 'RUH', name: 'Riyadh',  airport: 'King Khalid International Airport' },
  { code: 'JED', name: 'Jeddah',  airport: 'King Abdulaziz International Airport' },
  { code: 'KUL', name: 'Kuala Lumpur', airport: 'Kuala Lumpur International Airport' },
];

const today = new Date();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmt = (d) => d.toISOString().split('T')[0];

const FLIGHTS = [
  { id: 'PK200', from: 'KHI', to: 'ISB', dep: '06:00', arr: '08:00', duration: '2h 00m', price: 14500, seats: 42, class: 'Economy' },
  { id: 'PK202', from: 'KHI', to: 'ISB', dep: '10:30', arr: '12:30', duration: '2h 00m', price: 16000, seats: 15, class: 'Economy' },
  { id: 'PK204', from: 'KHI', to: 'ISB', dep: '15:00', arr: '17:00', duration: '2h 00m', price: 13800, seats: 60, class: 'Economy' },
  { id: 'PK210', from: 'KHI', to: 'LHE', dep: '07:00', arr: '08:30', duration: '1h 30m', price: 11200, seats: 30, class: 'Economy' },
  { id: 'PK212', from: 'KHI', to: 'LHE', dep: '13:00', arr: '14:30', duration: '1h 30m', price: 12500, seats: 8,  class: 'Economy' },
  { id: 'PK220', from: 'KHI', to: 'PEW', dep: '09:00', arr: '11:30', duration: '2h 30m', price: 16800, seats: 25, class: 'Economy' },
  { id: 'PK230', from: 'LHE', to: 'KHI', dep: '08:00', arr: '09:30', duration: '1h 30m', price: 11800, seats: 40, class: 'Economy' },
  { id: 'PK232', from: 'LHE', to: 'KHI', dep: '17:00', arr: '18:30', duration: '1h 30m', price: 13200, seats: 20, class: 'Economy' },
  { id: 'PK240', from: 'ISB', to: 'KHI', dep: '09:00', arr: '11:00', duration: '2h 00m', price: 15200, seats: 35, class: 'Economy' },
  { id: 'PK300', from: 'KHI', to: 'DXB', dep: '02:00', arr: '04:00', duration: '2h 00m', price: 48000, seats: 50, class: 'Economy' },
  { id: 'PK756', from: 'KHI', to: 'LHR', dep: '22:00', arr: '06:00', duration: '8h 00m', price: 185000, seats: 18, class: 'Economy' },
  { id: 'PK310', from: 'KHI', to: 'RUH', dep: '03:30', arr: '06:30', duration: '3h 00m', price: 62000, seats: 30, class: 'Economy' },
  { id: 'PK312', from: 'KHI', to: 'JED', dep: '04:00', arr: '07:00', duration: '3h 00m', price: 58000, seats: 22, class: 'Economy' },
  { id: 'PK320', from: 'LHE', to: 'ISB', dep: '10:00', arr: '11:00', duration: '1h 00m', price: 7500, seats: 55, class: 'Economy' },
  { id: 'PK330', from: 'ISB', to: 'LHE', dep: '12:00', arr: '13:00', duration: '1h 00m', price: 7800, seats: 48, class: 'Economy' },
];

/* Generate dates for each flight */
const flightData = [];
FLIGHTS.forEach(f => {
  for (let i = 1; i <= 14; i++) {
    flightData.push({ ...f, date: fmt(addDays(today, i)) });
  }
});

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function getCityByCode(code) { return CITIES.find(c => c.code === code); }
function formatPKR(n) { return 'PKR ' + n.toLocaleString('en-PK'); }
function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/* ============================================================
   TOAST SYSTEM
   ============================================================ */
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Dismiss notification">×</button>
  `;
  container.appendChild(toast);

  const dismiss = () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  };
  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  if (duration > 0) setTimeout(dismiss, duration);
}

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const focusable = overlay.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])');
  if (focusable[0]) focusable[0].focus();
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
  if (e.target.dataset.closeModal) {
    closeModal(e.target.dataset.closeModal);
  }
  if (e.target.dataset.openModal) {
    openModal(e.target.dataset.openModal);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const open = document.querySelector('.modal-overlay.open');
    if (open) closeModal(open.id);
  }
});

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
    });
  }

  /* Mark active nav link */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });
}

/* ============================================================
   TABS
   ============================================================ */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabList => {
    tabList.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = document.getElementById(btn.dataset.tab);
        const parent = tabList.closest('[data-tabs-container]') || tabList.parentElement;

        tabList.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        if (panel) panel.classList.add('active');
      });

      /* Keyboard navigation for tabs */
      btn.addEventListener('keydown', (e) => {
        const btns = [...tabList.querySelectorAll('.tab-btn')];
        const idx = btns.indexOf(btn);
        if (e.key === 'ArrowRight') { btns[(idx + 1) % btns.length].focus(); btns[(idx + 1) % btns.length].click(); }
        if (e.key === 'ArrowLeft')  { btns[(idx - 1 + btns.length) % btns.length].focus(); btns[(idx - 1 + btns.length) % btns.length].click(); }
      });
    });
  });
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   INTERSECTION OBSERVER — ENTRY ANIMATIONS
   ============================================================ */
function initAnimations() {
  const els = document.querySelectorAll('.animate-fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ============================================================
   ANNOUNCEMENT BAR
   ============================================================ */
function initAnnouncementBar() {
  const bar = document.querySelector('.announcement-bar');
  const closeBtn = bar?.querySelector('.announcement-close');
  if (!closeBtn) return;
  closeBtn.addEventListener('click', () => {
    bar.style.maxHeight = bar.offsetHeight + 'px';
    bar.offsetHeight; // reflow
    bar.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
    bar.style.maxHeight = '0';
    bar.style.opacity = '0';
    bar.style.overflow = 'hidden';
    setTimeout(() => bar.remove(), 350);
  });
}

/* ============================================================
   ACCESSIBILITY WIDGET
   ============================================================ */
function initA11yWidget() {
  const widget = document.getElementById('a11y-widget');
  if (!widget) return;
  const btn = widget.querySelector('.a11y-btn');
  const panel = widget.querySelector('.a11y-panel');
  const toggles = widget.querySelectorAll('.a11y-toggle');

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', panel.classList.contains('open'));
  });

  toggles.forEach(tog => {
    const feature = tog.dataset.feature;
    const stored = localStorage.getItem('pia-a11y-' + feature) === 'true';
    if (stored) { tog.classList.add('active'); applyA11y(feature, true); }

    tog.addEventListener('click', () => {
      const active = tog.classList.toggle('active');
      localStorage.setItem('pia-a11y-' + feature, active);
      applyA11y(feature, active);
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) panel.classList.remove('open');
  });
}

function applyA11y(feature, active) {
  if (feature === 'high-contrast') document.body.classList.toggle('high-contrast', active);
  if (feature === 'large-text')    document.body.classList.toggle('large-text', active);
  if (feature === 'reduce-motion') {
    document.documentElement.style.setProperty('--t-fast', active ? '0ms' : '150ms');
    document.documentElement.style.setProperty('--t-base', active ? '0ms' : '250ms');
    document.documentElement.style.setProperty('--t-slow', active ? '0ms' : '400ms');
  }
}

/* ============================================================
   FLIGHT SEARCH (shared across pages)
   ============================================================ */
function populateCitySelects() {
  document.querySelectorAll('select[data-city-select]').forEach(sel => {
    const placeholder = sel.dataset.placeholder || 'Select City';
    sel.innerHTML = `<option value="">— ${placeholder} —</option>` +
      CITIES.map(c => `<option value="${c.code}">${c.name} (${c.code})</option>`).join('');
  });
}

function handleFlightSearch(form, resultsContainer, feedbackEl, tripType = 'oneway') {
  const from      = form.querySelector('[name="from"]')?.value;
  const to        = form.querySelector('[name="to"]')?.value;
  const depDate   = form.querySelector('[name="departure"]')?.value;
  const retDate   = form.querySelector('[name="return"]')?.value;
  const passengers = parseInt(form.querySelector('[name="passengers"]')?.value) || 1;
  const errors = [];

  /* Validation */
  if (!from)    errors.push('Please select departure city.');
  if (!to)      errors.push('Please select destination city.');
  if (from && to && from === to) errors.push('Origin and destination cannot be the same.');
  if (!depDate) errors.push('Please select a departure date.');
  if (tripType === 'roundtrip' && !retDate) errors.push('Please select a return date.');
  if (tripType === 'roundtrip' && retDate && retDate <= depDate) errors.push('Return date must be after departure date.');

  if (errors.length) {
    if (feedbackEl) { feedbackEl.textContent = errors[0]; feedbackEl.className = 'search-feedback error'; }
    showToast('error', 'Missing Information', errors[0]);
    return;
  }

  /* Show loading */
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }
  if (feedbackEl) { feedbackEl.textContent = 'Searching available flights…'; feedbackEl.className = 'search-feedback info'; }

  setTimeout(() => {
    const results = flightData.filter(f => f.from === from && f.to === to && f.date === depDate);

    if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }

    if (resultsContainer) {
      if (results.length) {
        renderFlights(resultsContainer, results, passengers, { from, to, depDate, passengers, tripType });
        if (feedbackEl) { feedbackEl.textContent = `${results.length} flight${results.length > 1 ? 's' : ''} found`; feedbackEl.className = 'search-feedback success'; }
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">✈️</div>
            <h3>No flights found</h3>
            <p>No flights available from ${getCityByCode(from)?.name || from} to ${getCityByCode(to)?.name || to} on ${formatDate(depDate)}.</p>
            <p class="text-muted" style="font-size:0.875rem;margin-top:0.5rem;">Try a different date or route.</p>
          </div>`;
        if (feedbackEl) { feedbackEl.textContent = 'No flights match this route.'; feedbackEl.className = 'search-feedback warning'; }
        showToast('warning', 'No Flights', 'Try adjusting your dates or cities.');
      }
    } else {
      /* Redirect to flights page */
      const params = new URLSearchParams({ from, to, date: depDate, pax: passengers, type: tripType });
      if (retDate) params.set('return', retDate);
      window.location.href = 'flights.html?' + params.toString();
    }
  }, 800);
}

function renderFlights(container, flights, passengers, meta) {
  const fromCity = getCityByCode(meta.from);
  const toCity   = getCityByCode(meta.to);

  container.innerHTML = `
    <div class="results-header">
      <div>
        <h2 class="heading-sm">${fromCity?.name} → ${toCity?.name}</h2>
        <p class="text-muted" style="font-size:0.875rem;">${formatDate(meta.depDate)} · ${meta.passengers} passenger${meta.passengers > 1 ? 's' : ''}</p>
      </div>
      <div class="results-sort">
        <label class="sr-only" for="flight-sort">Sort by</label>
        <select id="flight-sort" class="form-select" style="width:auto;font-size:0.8125rem;padding:0.4rem 0.75rem;" aria-label="Sort flights">
          <option value="price">Lowest Price</option>
          <option value="dep">Earliest Departure</option>
          <option value="dur">Shortest Duration</option>
        </select>
      </div>
    </div>
    <div id="flight-list" role="list" aria-label="Available flights"></div>
  `;

  const list = container.querySelector('#flight-list');
  let sorted = [...flights];

  const sortFlights = (val) => {
    if (val === 'price') sorted.sort((a,b) => a.price - b.price);
    if (val === 'dep')   sorted.sort((a,b) => a.dep.localeCompare(b.dep));
    renderList();
  };

  const renderList = () => {
    list.innerHTML = sorted.map(f => `
      <div class="flight-card animate-fade-up" role="listitem" tabindex="0"
           data-flight-id="${f.id}" data-price="${f.price * passengers}"
           aria-label="${f.id}: ${f.dep} to ${f.arr}, ${formatPKR(f.price * passengers)}">
        <div>
          <div class="flight-time">${f.dep}</div>
          <div class="flight-city">${fromCity?.code}</div>
          <div class="flight-city">${fromCity?.name}</div>
        </div>
        <div class="flight-route">
          <div class="flight-duration">${f.duration}</div>
          <div class="flight-line" aria-hidden="true"></div>
          <div class="flight-duration">${f.id}</div>
        </div>
        <div>
          <div class="flight-time">${f.arr}</div>
          <div class="flight-city">${toCity?.code}</div>
          <div class="flight-city">${toCity?.name}</div>
        </div>
        <div class="flight-price-wrap">
          <div class="flight-price">${formatPKR(f.price * passengers)}</div>
          <div class="flight-price-label">per booking</div>
          <div style="margin-top:0.5rem;">
            <span class="badge ${f.seats < 15 ? 'badge-red' : 'badge-green'}">${f.seats < 15 ? '⚡ ' + f.seats + ' left' : '✓ Available'}</span>
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:0.75rem;" 
                  onclick="selectFlight('${f.id}', ${f.price * passengers}, '${meta.from}', '${meta.to}', '${meta.depDate}', ${passengers})">
            Select
          </button>
        </div>
      </div>
    `).join('');

    /* Re-trigger animations */
    requestAnimationFrame(() => {
      list.querySelectorAll('.animate-fade-up').forEach((el, i) => {
        el.style.transitionDelay = (i * 0.07) + 's';
        setTimeout(() => el.classList.add('visible'), 20);
      });
    });

    /* Keyboard select */
    list.querySelectorAll('.flight-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') card.querySelector('button')?.click();
      });
    });
  };

  container.querySelector('#flight-sort').addEventListener('change', (e) => sortFlights(e.target.value));
  sortFlights('price');
}

/* ============================================================
   SELECT FLIGHT → BOOKING
   ============================================================ */
function selectFlight(flightId, totalPrice, from, to, date, passengers) {
  const flight = FLIGHTS.find(f => f.id === flightId);
  if (!flight) return;

  const data = { flightId, totalPrice, from, to, date, passengers, flight };
  sessionStorage.setItem('pia-booking', JSON.stringify(data));
  showToast('success', 'Flight Selected!', `Redirecting to booking…`);
  setTimeout(() => window.location.href = 'booking.html', 900);
}

/* ============================================================
   FORM VALIDATION HELPER
   ============================================================ */
function validateField(input) {
  const val = input.value.trim();
  const type = input.dataset.validate;
  let msg = '';

  if (input.required && !val) msg = 'This field is required.';
  else if (type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email address.';
  else if (type === 'phone' && val && !/^[\d\s+\-()]{10,15}$/.test(val)) msg = 'Enter a valid phone number.';
  else if (type === 'cnic' && val && !/^\d{5}-?\d{7}-?\d{1}$/.test(val)) msg = 'CNIC format: 12345-1234567-1';
  else if (type === 'passport' && val && val.length < 6) msg = 'Invalid passport number.';

  const errEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errEl) errEl.textContent = msg;
  input.classList.toggle('error', !!msg);
  return !msg;
}

function initFormValidation(form) {
  if (!form) return;
  form.querySelectorAll('[data-validate], [required]').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
}

/* ============================================================
   ACTIVE NAV LINK
   ============================================================ */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

/* ============================================================
   DATE CONSTRAINTS — no past dates
   ============================================================ */
function initDateInputs() {
  const todayStr = fmt(today);
  document.querySelectorAll('input[type="date"]').forEach(inp => {
    inp.min = todayStr;
  });

  /* Return date must be >= departure */
  const depInput = document.querySelector('[name="departure"]');
  const retInput = document.querySelector('[name="return"]');
  if (depInput && retInput) {
    depInput.addEventListener('change', () => { retInput.min = depInput.value; });
  }
}

/* ============================================================
   PAGE LOADER
   ============================================================ */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 300);
  });
}

/* ============================================================
   COUNTER ANIMATION (stats)
   ============================================================ */
function animateCounter(el, end, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * end).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = end.toLocaleString();
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.counter));
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initNavbar();
  initTabs();
  initScrollProgress();
  initBackToTop();
  initAnimations();
  initAnnouncementBar();
  initA11yWidget();
  populateCitySelects();
  initDateInputs();
  setActiveNav();
  initCounters();

  /* Page-specific init hooks */
  if (typeof pageInit === 'function') pageInit();
});