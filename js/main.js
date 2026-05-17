/* ============================================================
   PIA HCI REDESIGN — main.js
   Shared logic for all pages
   ============================================================ */

"use strict";

/* ══════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const off = (el, ev, fn) => el && el.removeEventListener(ev, fn);

function debounce(fn, ms = 100) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ══════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR
══════════════════════════════════════════════════════════ */
function initAnnounceBar() {
  const bar = $('.announce-bar');
  const closeBtn = $('.announce-bar__close');
  if (!bar) return;

  // Pause animation on hover
  const track = $('.announce-bar__track');
  if (track) {
    on(bar, 'mouseenter', () => track.style.animationPlayState = 'paused');
    on(bar, 'mouseleave', () => track.style.animationPlayState = 'running');
  }

  on(closeBtn, 'click', () => {
    bar.style.height = bar.offsetHeight + 'px';
    bar.style.transition = 'height 0.3s ease, opacity 0.3s ease';
    requestAnimationFrame(() => {
      bar.style.height = '0';
      bar.style.opacity = '0';
      bar.style.overflow = 'hidden';
    });
    bar.addEventListener('transitionend', () => {
      bar.remove();
      document.documentElement.style.setProperty('--announce-height', '0px');
    }, { once: true });
  });
}

/* ══════════════════════════════════════════════════════════
   NAVBAR — scroll shadow + active link
══════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = $('.navbar');
  if (!navbar) return;

  // Scroll shadow
  const handleScroll = debounce(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, 50);
  on(window, 'scroll', handleScroll, { passive: true });
  handleScroll();

  // Mark active page
  const current = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile hamburger
  const hamburger = $('.navbar__hamburger');
  const mobileNav = $('.mobile-nav');
  if (hamburger && mobileNav) {
    on(hamburger, 'click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    $$('.mobile-nav__link').forEach(link => {
      on(link, 'click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
  }
}

/* ══════════════════════════════════════════════════════════
   SEARCH OVERLAY
══════════════════════════════════════════════════════════ */
function initSearch() {
  const overlay = $('.search-overlay');
  const openBtns = $$('[data-action="open-search"]');
  const input = $('.search-overlay__input');
  const closeBtn = $('.search-overlay__close');
  if (!overlay) return;

  function openSearch() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input && input.focus(), 100);
  }

  function closeSearch() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => on(btn, 'click', openSearch));
  on(closeBtn, 'click', closeSearch);

  on(overlay, 'click', e => {
    if (e.target === overlay) closeSearch();
  });

  on(document, 'keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // Popular search tags
  $$('.search-tag').forEach(tag => {
    on(tag, 'click', () => {
      if (input) input.value = tag.textContent.trim();
      input.focus();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   ACCESSIBILITY PANEL
══════════════════════════════════════════════════════════ */
function initA11yPanel() {
  const trigger = $('.a11y-trigger');
  const panel = $('.a11y-panel');
  if (!trigger || !panel) return;

  let isOpen = false;

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    trigger.setAttribute('aria-expanded', isOpen);
    panel.setAttribute('aria-hidden', !isOpen);
  }

  on(trigger, 'click', togglePanel);

  // Close when clicking outside
  on(document, 'click', e => {
    if (isOpen && !panel.contains(e.target) && e.target !== trigger) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  // Toggle options
  $$('.a11y-toggle').forEach(toggle => {
    const action = toggle.dataset.action;
    on(toggle, 'click', () => {
      toggle.classList.toggle('on');
      const isOn = toggle.classList.contains('on');
      toggle.setAttribute('aria-pressed', isOn);

      switch (action) {
        case 'large-text':
          document.body.classList.toggle('a11y-large-text', isOn);
          break;
        case 'high-contrast':
          document.body.classList.toggle('a11y-high-contrast', isOn);
          break;
        case 'reduced-motion':
          document.body.classList.toggle('a11y-reduced-motion', isOn);
          break;
        case 'underline-links':
          document.body.classList.toggle('a11y-underline-links', isOn);
          break;
      }
    });
  });

  // Font size controls
  let baseFontSize = 16;
  const fontSizeDisplay = $('.a11y-font-size-val');

  on($('.a11y-font-increase'), 'click', () => {
    baseFontSize = Math.min(baseFontSize + 2, 22);
    document.documentElement.style.fontSize = baseFontSize + 'px';
    if (fontSizeDisplay) fontSizeDisplay.textContent = baseFontSize + 'px';
  });

  on($('.a11y-font-decrease'), 'click', () => {
    baseFontSize = Math.max(baseFontSize - 2, 12);
    document.documentElement.style.fontSize = baseFontSize + 'px';
    if (fontSizeDisplay) fontSizeDisplay.textContent = baseFontSize + 'px';
  });

  on($('.a11y-reset'), 'click', () => {
    baseFontSize = 16;
    document.documentElement.style.fontSize = '16px';
    if (fontSizeDisplay) fontSizeDisplay.textContent = '16px';
    $$('.a11y-toggle').forEach(t => {
      t.classList.remove('on');
      t.setAttribute('aria-pressed', false);
    });
    document.body.className = document.body.className
      .replace(/a11y-\S+/g, '').trim();
  });
}

/* ══════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════════════════════ */
const toastTypes = {
  success: { icon: '✓', title: 'Success' },
  error:   { icon: '✕', title: 'Error' },
  warning: { icon: '⚠', title: 'Warning' },
  info:    { icon: 'ℹ', title: 'Information' },
};

window.showToast = function(msg, type = 'info', duration = 4000) {
  let container = $('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const meta = toastTypes[type] || toastTypes.info;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${meta.icon}</span>
    <div class="toast__body">
      <div class="toast__title">${meta.title}</div>
      <div class="toast__msg">${msg}</div>
    </div>
    <button class="toast__close" aria-label="Dismiss notification">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  const close = () => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  on(toast.querySelector('.toast__close'), 'click', close);
  if (duration > 0) setTimeout(close, duration);

  return { close };
};

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = $$('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════
   TAB COMPONENT
══════════════════════════════════════════════════════════ */
function initTabs() {
  $$('[data-tabs]').forEach(tabGroup => {
    const triggers = $$('[data-tab]', tabGroup);
    const panels = $$('[data-panel]', tabGroup);

    function activateTab(tab) {
      triggers.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active);
        t.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach(p => {
        const active = p.dataset.panel === tab.dataset.tab;
        p.classList.toggle('hidden', !active);
        p.setAttribute('aria-hidden', !active);
      });
    }

    triggers.forEach(tab => {
      on(tab, 'click', () => activateTab(tab));
      on(tab, 'keydown', e => {
        if (e.key === 'ArrowRight') {
          const next = tab.nextElementSibling || triggers[0];
          next.focus();
          activateTab(next);
        }
        if (e.key === 'ArrowLeft') {
          const prev = tab.previousElementSibling || triggers[triggers.length - 1];
          prev.focus();
          activateTab(prev);
        }
      });
    });

    // Init first tab
    if (triggers.length) activateTab(triggers[0]);
  });
}

/* ══════════════════════════════════════════════════════════
   BOOKING WIDGET
══════════════════════════════════════════════════════════ */

// Flight data (hardcoded, realistic)
const ROUTES = {
  'KHI-ISB': [
    { flight: 'PK-300', depart: '06:30', arrive: '08:15', duration: '1h 45m', class: 'Economy', price: 12500, seats: 42, aircraft: 'Boeing 737' },
    { flight: 'PK-302', depart: '10:00', arrive: '11:50', duration: '1h 50m', class: 'Economy', price: 14800, seats: 18, aircraft: 'ATR 72' },
    { flight: 'PK-304', depart: '14:30', arrive: '16:20', duration: '1h 50m', class: 'Business', price: 38000, seats: 8, aircraft: 'Boeing 737' },
    { flight: 'PK-306', depart: '20:00', arrive: '21:45', duration: '1h 45m', class: 'Economy', price: 11900, seats: 60, aircraft: 'Airbus A320' },
  ],
  'ISB-KHI': [
    { flight: 'PK-301', depart: '09:00', arrive: '10:45', duration: '1h 45m', class: 'Economy', price: 12500, seats: 30, aircraft: 'Boeing 737' },
    { flight: 'PK-303', depart: '15:00', arrive: '16:50', duration: '1h 50m', class: 'Economy', price: 13200, seats: 24, aircraft: 'Airbus A320' },
    { flight: 'PK-305', depart: '22:00', arrive: '23:45', duration: '1h 45m', class: 'Business', price: 38000, seats: 4, aircraft: 'Boeing 737' },
  ],
  'KHI-LHE': [
    { flight: 'PK-200', depart: '07:00', arrive: '08:30', duration: '1h 30m', class: 'Economy', price: 10500, seats: 55, aircraft: 'Airbus A320' },
    { flight: 'PK-202', depart: '12:00', arrive: '13:35', duration: '1h 35m', class: 'Economy', price: 11200, seats: 22, aircraft: 'Boeing 737' },
    { flight: 'PK-204', depart: '19:00', arrive: '20:35', duration: '1h 35m', class: 'Business', price: 32000, seats: 6, aircraft: 'Airbus A320' },
  ],
  'LHE-KHI': [
    { flight: 'PK-201', depart: '10:00', arrive: '11:35', duration: '1h 35m', class: 'Economy', price: 10500, seats: 40, aircraft: 'Airbus A320' },
    { flight: 'PK-203', depart: '16:00', arrive: '17:35', duration: '1h 35m', class: 'Economy', price: 11000, seats: 28, aircraft: 'Boeing 737' },
  ],
  'KHI-PEW': [
    { flight: 'PK-400', depart: '08:00', arrive: '10:15', duration: '2h 15m', class: 'Economy', price: 14200, seats: 38, aircraft: 'ATR 72' },
    { flight: 'PK-402', depart: '17:00', arrive: '19:20', duration: '2h 20m', class: 'Economy', price: 13800, seats: 20, aircraft: 'ATR 72' },
  ],
  'PEW-KHI': [
    { flight: 'PK-401', depart: '11:00', arrive: '13:15', duration: '2h 15m', class: 'Economy', price: 14200, seats: 25, aircraft: 'ATR 72' },
  ],
  'KHI-DXB': [
    { flight: 'PK-210', depart: '03:00', arrive: '05:00', duration: '2h 00m', class: 'Economy', price: 38000, seats: 55, aircraft: 'Boeing 777' },
    { flight: 'PK-212', depart: '15:30', arrive: '17:30', duration: '2h 00m', class: 'Business', price: 95000, seats: 8, aircraft: 'Boeing 777' },
  ],
  'KHI-LHR': [
    { flight: 'PK-786', depart: '23:00', arrive: '06:30+1', duration: '8h 30m', class: 'Economy', price: 120000, seats: 180, aircraft: 'Boeing 777' },
    { flight: 'PK-787', depart: '10:00', arrive: '17:30', duration: '8h 30m', class: 'Business', price: 320000, seats: 24, aircraft: 'Boeing 777' },
  ],
};

const CITIES = [
  { code: 'KHI', name: 'Karachi', airport: 'Jinnah International Airport' },
  { code: 'ISB', name: 'Islamabad', airport: 'Islamabad International Airport' },
  { code: 'LHE', name: 'Lahore', airport: 'Allama Iqbal International Airport' },
  { code: 'PEW', name: 'Peshawar', airport: 'Bacha Khan International Airport' },
  { code: 'MUX', name: 'Multan', airport: 'Multan International Airport' },
  { code: 'DXB', name: 'Dubai', airport: 'Dubai International Airport' },
  { code: 'LHR', name: 'London Heathrow', airport: 'Heathrow Airport' },
  { code: 'JFK', name: 'New York', airport: 'John F. Kennedy International Airport' },
  { code: 'AMS', name: 'Amsterdam', airport: 'Amsterdam Airport Schiphol' },
  { code: 'BKK', name: 'Bangkok', airport: 'Suvarnabhumi Airport' },
];

function initBookingWidget() {
  const widget = $('.booking-widget');
  if (!widget) return;

  // Tab switching (one-way / round-trip / multi-city)
  const tripTabs = $$('[data-trip]', widget);
  const returnGroup = $('.return-date-group', widget);

  tripTabs.forEach(tab => {
    on(tab, 'click', () => {
      tripTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const trip = tab.dataset.trip;
      if (returnGroup) {
        returnGroup.style.display = (trip === 'roundtrip') ? '' : 'none';
      }
    });
  });

  // Swap origin/dest
  const swapBtn = $('.swap-btn', widget);
  const fromInput = $('.from-input', widget);
  const toInput = $('.to-input', widget);

  on(swapBtn, 'click', () => {
    if (!fromInput || !toInput) return;
    const tmp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmp;

    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => swapBtn.style.transform = '', 300);
  });

  // City autocomplete
  [fromInput, toInput].forEach(input => {
    if (!input) return;
    const list = input.closest('.input-wrapper')?.querySelector('.city-dropdown');
    if (!list) return;

    on(input, 'input', () => {
      const q = input.value.trim().toLowerCase();
      const matches = CITIES.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.airport.toLowerCase().includes(q)
      );

      if (!q || !matches.length) { list.hidden = true; return; }

      list.innerHTML = matches.slice(0, 6).map(c => `
        <button class="city-option" type="button" data-code="${c.code}" data-name="${c.name}">
          <span class="city-option__code">${c.code}</span>
          <span class="city-option__info">
            <span class="city-option__name">${c.name}</span>
            <span class="city-option__airport">${c.airport}</span>
          </span>
        </button>
      `).join('');

      $$('.city-option', list).forEach(opt => {
        on(opt, 'click', () => {
          input.value = `${opt.dataset.name} (${opt.dataset.code})`;
          input.dataset.code = opt.dataset.code;
          list.hidden = true;
        });
      });

      list.hidden = false;
    });

    on(input, 'blur', () => setTimeout(() => { list.hidden = true; }, 200));
  });

  // Date validation (depart >= today)
  const departInput = $('.depart-input', widget);
  const returnInput = $('.return-input', widget);

  const today = new Date().toISOString().split('T')[0];
  if (departInput) { departInput.min = today; departInput.value = today; }
  if (returnInput) {
    returnInput.min = today;
    on(departInput, 'change', () => { returnInput.min = departInput.value; });
  }

  // Search submit
  const form = $('.booking-form', widget);
  on(form, 'submit', e => {
    e.preventDefault();
    handleSearch();
  });

  on($('.booking-search-btn', widget), 'click', handleSearch);

  function handleSearch() {
    const from = fromInput?.dataset.code || '';
    const to   = toInput?.dataset.code || '';
    const date = departInput?.value || '';
    const passengers = $('.passenger-select', widget)?.value || '1';
    const cabinClass  = $('.class-select', widget)?.value || 'economy';

    if (!from || !to) {
      showToast('Please select origin and destination cities.', 'warning');
      return;
    }
    if (from === to) {
      showToast('Origin and destination cannot be the same.', 'error');
      return;
    }

    // Redirect to flights page with params
    const params = new URLSearchParams({ from, to, date, passengers, class: cabinClass });
    window.location.href = `flights.html?${params}`;
  }

  // Passenger counter
  const passengerBtn = $('.passenger-btn', widget);
  const passengerDropdown = $('.passenger-dropdown', widget);
  const counters = { adults: 1, children: 0, infants: 0 };

  on(passengerBtn, 'click', () => {
    passengerDropdown?.classList.toggle('open');
  });

  $$('[data-counter]', widget).forEach(btn => {
    on(btn, 'click', () => {
      const type = btn.dataset.counter;
      const dir  = btn.dataset.dir;
      const max  = type === 'adults' ? 9 : 6;
      const min  = type === 'adults' ? 1 : 0;

      if (dir === 'inc') counters[type] = Math.min(counters[type] + 1, max);
      if (dir === 'dec') counters[type] = Math.max(counters[type] - 1, min);

      const display = $(`.counter-val[data-type="${type}"]`, widget);
      if (display) display.textContent = counters[type];

      const total = counters.adults + counters.children;
      if (passengerBtn) {
        passengerBtn.textContent = `${total} Passenger${total !== 1 ? 's' : ''}`;
      }

      // Sync hidden input
      const hiddenInput = $('.passenger-select', widget);
      if (hiddenInput) hiddenInput.value = total;
    });
  });
}

/* ══════════════════════════════════════════════════════════
   FLIGHTS PAGE LOGIC
══════════════════════════════════════════════════════════ */
function initFlightsPage() {
  if (!$('.flights-results')) return;

  const params = new URLSearchParams(location.search);
  const from = params.get('from') || '';
  const to   = params.get('to')   || '';
  const date = params.get('date') || '';

  const fromCity = CITIES.find(c => c.code === from);
  const toCity   = CITIES.find(c => c.code === to);

  // Update header
  const routeEl = $('.flights-route');
  const dateEl  = $('.flights-date');
  if (routeEl && fromCity && toCity) {
    routeEl.innerHTML = `
      <span>${fromCity.name}</span>
      <span class="route-arrow">→</span>
      <span>${toCity.name}</span>
    `;
  }
  if (dateEl && date) {
    const d = new Date(date);
    dateEl.textContent = d.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Get results
  const key = `${from}-${to}`;
  const flights = ROUTES[key] || [];
  const container = $('.flights-list');

  if (!container) return;

  // Loading state
  container.innerHTML = `<div class="flights-loading"><div class="spinner spinner--green"></div><p>Searching available flights…</p></div>`;

  setTimeout(() => {
    if (!flights.length) {
      container.innerHTML = `
        <div class="no-flights">
          <div class="no-flights__icon">✈</div>
          <h3>No Flights Found</h3>
          <p>No direct flights available for this route on the selected date. Try a different date or check connecting routes.</p>
          <a href="index.html" class="btn btn-primary">Search Again</a>
        </div>`;
      return;
    }

    // Sort
    let sorted = [...flights];
    const sortEl = $('.sort-select');
    const sortBy = sortEl?.value || 'price';
    sorted = sortFlights(sorted, sortBy);

    renderFlights(container, sorted, from, to, date);

    // Filter / sort listeners
    on($('.sort-select'), 'change', () => {
      const sortedNow = sortFlights([...flights], $('.sort-select').value);
      renderFlights(container, sortedNow, from, to, date);
    });

    on($('.filter-class'), 'change', () => {
      const cls = $('.filter-class').value;
      const filtered = flights.filter(f => !cls || f.class.toLowerCase() === cls);
      renderFlights(container, sortFlights(filtered, $('.sort-select').value), from, to, date);
    });

    // Update count
    const countEl = $('.flights-count');
    if (countEl) countEl.textContent = `${flights.length} flight${flights.length !== 1 ? 's' : ''} found`;

  }, 800);
}

function sortFlights(flights, by) {
  return [...flights].sort((a, b) => {
    if (by === 'price')    return a.price - b.price;
    if (by === 'depart')   return a.depart.localeCompare(b.depart);
    if (by === 'duration') return a.duration.localeCompare(b.duration);
    return 0;
  });
}

function renderFlights(container, flights, from, to, date) {
  const fromCity = CITIES.find(c => c.code === from);
  const toCity   = CITIES.find(c => c.code === to);

  if (!flights.length) {
    container.innerHTML = `<div class="no-flights"><div class="no-flights__icon">🔍</div><p>No flights match your filters.</p></div>`;
    return;
  }

  container.innerHTML = flights.map(f => `
    <div class="flight-card reveal">
      <div class="flight-card__airline">
        <span class="flight-card__logo">PIA</span>
        <span class="flight-card__num">${f.flight}</span>
        <span class="flight-card__aircraft">${f.aircraft}</span>
      </div>

      <div class="flight-card__times">
        <div class="flight-card__time-block">
          <div class="flight-card__time">${f.depart}</div>
          <div class="flight-card__city">${from}</div>
          <div class="flight-card__airport">${fromCity?.airport || ''}</div>
        </div>
        <div class="flight-card__duration">
          <div class="flight-card__dur-line">
            <span class="flight-card__dot"></span>
            <span class="flight-card__line"></span>
            <span class="flight-card__plane">✈</span>
            <span class="flight-card__line"></span>
            <span class="flight-card__dot"></span>
          </div>
          <div class="flight-card__dur-time">${f.duration}</div>
          <div class="flight-card__dur-label">Non-stop</div>
        </div>
        <div class="flight-card__time-block flight-card__time-block--right">
          <div class="flight-card__time">${f.arrive}</div>
          <div class="flight-card__city">${to}</div>
          <div class="flight-card__airport">${toCity?.airport || ''}</div>
        </div>
      </div>

      <div class="flight-card__right">
        <div class="flight-card__class badge ${f.class === 'Business' ? 'badge-gold' : 'badge-green'}">${f.class}</div>
        <div class="flight-card__price">PKR ${f.price.toLocaleString()}</div>
        <div class="flight-card__seats">${f.seats} seats left</div>
        <a href="booking.html?flight=${f.flight}&from=${from}&to=${to}&date=${date}&price=${f.price}&class=${f.class}"
           class="btn btn-primary btn-sm flight-card__book">
          Select →
        </a>
      </div>
    </div>
  `).join('');

  // Re-init scroll reveal for new cards
  initScrollReveal();
}

/* ══════════════════════════════════════════════════════════
   BOOKING FORM PAGE
══════════════════════════════════════════════════════════ */
function initBookingPage() {
  if (!$('.booking-page')) return;

  const params = new URLSearchParams(location.search);
  const flight  = params.get('flight') || '';
  const from    = params.get('from')   || '';
  const to      = params.get('to')     || '';
  const date    = params.get('date')   || '';
  const price   = params.get('price')  || '';
  const cls     = params.get('class')  || '';

  // Populate summary
  const fields = {
    '.booking-summary__flight': flight,
    '.booking-summary__route':  `${from} → ${to}`,
    '.booking-summary__date':   date ? new Date(date).toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '',
    '.booking-summary__class':  cls,
    '.booking-summary__price':  `PKR ${parseInt(price).toLocaleString()}`,
  };
  Object.entries(fields).forEach(([sel, val]) => {
    const el = $(sel);
    if (el) el.textContent = val;
  });

  // Step navigation
  const steps = $$('.booking-step');
  const stepIndicators = $$('.step-indicator');
  let currentStep = 0;

  function goToStep(n) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === n);
      s.setAttribute('aria-hidden', i !== n);
    });
    stepIndicators.forEach((ind, i) => {
      ind.classList.toggle('completed', i < n);
      ind.classList.toggle('current', i === n);
    });
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $$('[data-next-step]').forEach(btn => {
    on(btn, 'click', () => {
      const step = parseInt(btn.dataset.nextStep);
      const form = btn.closest('.booking-step');

      // Validate required fields
      const required = $$('[required]', form);
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('form-control--error');
          valid = false;
        } else {
          field.classList.remove('form-control--error');
        }
      });

      if (!valid) {
        showToast('Please fill in all required fields.', 'warning');
        return;
      }

      if (step === 2) updatePaymentSummary(price);
      goToStep(step);
    });
  });

  $$('[data-prev-step]').forEach(btn => {
    on(btn, 'click', () => goToStep(parseInt(btn.dataset.prevStep)));
  });

  // Confirm booking
  const confirmBtn = $('.confirm-booking-btn');
  on(confirmBtn, 'click', () => {
    const confirmation = Math.random().toString(36).substring(2, 10).toUpperCase();
    goToStep(3);
    const confEl = $('.booking-confirmation__code');
    if (confEl) confEl.textContent = confirmation;
  });

  function updatePaymentSummary(price) {
    const tax = Math.round(parseInt(price) * 0.16);
    const total = parseInt(price) + tax;
    const basePriceEl = $('.pay-base-price');
    const taxEl = $('.pay-tax');
    const totalEl = $('.pay-total');
    if (basePriceEl) basePriceEl.textContent = `PKR ${parseInt(price).toLocaleString()}`;
    if (taxEl) taxEl.textContent = `PKR ${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `PKR ${total.toLocaleString()}`;
  }

  goToStep(0);
}

/* ══════════════════════════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('[data-count-to]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.countTo);
      const duration = parseInt(el.dataset.countDuration || 1500);
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(progress * target);
        el.textContent = value.toLocaleString() + (el.dataset.countSuffix || '');
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════
   HERO SLIDER
══════════════════════════════════════════════════════════ */
function initHeroSlider() {
  const slider = $('.hero-slider');
  if (!slider) return;

  const slides = $$('.hero-slide', slider);
  const dots = $$('.hero-dot');
  let current = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function autoPlay() {
    timer = setInterval(() => goTo(current + 1), 5500);
  }

  function resetAutoPlay() {
    clearInterval(timer);
    autoPlay();
  }

  // Controls
  on($('.hero-prev'), 'click', () => { goTo(current - 1); resetAutoPlay(); });
  on($('.hero-next'), 'click', () => { goTo(current + 1); resetAutoPlay(); });
  dots.forEach((dot, i) => on(dot, 'click', () => { goTo(i); resetAutoPlay(); }));

  // Pause on hover
  on(slider, 'mouseenter', () => clearInterval(timer));
  on(slider, 'mouseleave', autoPlay);

  goTo(0);
  autoPlay();
}

/* ══════════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = $('.contact-form');
  if (!form) return;

  on(form, 'submit', e => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      form.reset();
      showToast('Message sent successfully. We\'ll respond within 24 hours.', 'success');
      $$('.form-control--error', form).forEach(el => el.classList.remove('form-control--error'));
    }, 1800);
  });

  // Inline validation
  $$('[required]', form).forEach(field => {
    on(field, 'blur', () => {
      if (!field.value.trim()) {
        field.classList.add('form-control--error');
      } else {
        field.classList.remove('form-control--error');
      }
    });

    on(field, 'input', () => {
      if (field.value.trim()) field.classList.remove('form-control--error');
    });
  });
}

/* ══════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', e => {
      const target = $(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $('.back-to-top');
  if (!btn) return;
  on(window, 'scroll', debounce(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, 100), { passive: true });
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════════════════
   INIT ALL
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAnnounceBar();
  initNavbar();
  initSearch();
  initA11yPanel();
  initScrollReveal();
  initTabs();
  initBookingWidget();
  initFlightsPage();
  initBookingPage();
  initCounters();
  initHeroSlider();
  initContactForm();
  initSmoothScroll();
  initBackToTop();
});