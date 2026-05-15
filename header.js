/* ============================================================
   HEADER JAVASCRIPT — header.js
   Quantum Play | Online Game Store
   Handles: navbar scroll effect, mobile menu, search dropdown,
            auth modal, toast notifications, active nav link tracking.
   ============================================================ */

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (!header) return;
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ============================================================
   MOBILE HAMBURGER MENU
   ============================================================ */
function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (!menu || !hamburger) return;
  menu.classList.toggle('open');
  hamburger.classList.toggle('open');
}

function closeMobile() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (!menu || !hamburger) return;
  menu.classList.remove('open');
  hamburger.classList.remove('open');
}

// Close mobile menu when clicking outside of it
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (!menu || !hamburger) return;
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    closeMobile();
  }
});

/* ============================================================
   SMOOTH SCROLL TO SECTION
   ============================================================ */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ============================================================
   ACTIVE NAV LINK — updates as user scrolls
   ============================================================ */
(function initActiveNav() {
  const sectionIds = [
    'best-selling',
    'new-notable',
    'action-adventure',
    'fighting',
    'racing-flying',
    'puzzle-trivia'
  ];

  // Map from section id → nav-link index (0-based)
  const sectionToNavIndex = {
    'best-selling':      1,
    'new-notable':       2,
    'action-adventure':  3,
    'fighting':          4,
    'racing-flying':     5,
    'puzzle-trivia':     6
  };

  function updateActiveNav() {
    const links = document.querySelectorAll('.nav-links .nav-link');
    if (!links.length) return;

    let current = '';
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 140) {
        current = id;
      }
    });

    links.forEach(l => l.classList.remove('active'));

    if (current && sectionToNavIndex[current] !== undefined) {
      const idx = sectionToNavIndex[current];
      if (links[idx]) links[idx].classList.add('active');
    } else {
      // At top — highlight Home
      if (links[0]) links[0].classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('load', updateActiveNav);
})();

/* ============================================================
   SEARCH
   ============================================================ */
let allGames = [];

/** Called by game-card.js after GAME_DATA is available */
function buildSearch() {
  allGames = [];
  GAME_DATA.categories.forEach(cat => {
    cat.games.forEach(g => {
      allGames.push({ ...g, catLabel: cat.label, catIcon: cat.icon });
    });
  });
}

function doSearch(query) {
  const drop = document.getElementById('searchDrop');
  if (!drop) return;

  if (!query.trim()) {
    drop.innerHTML = '';
    drop.classList.remove('open');
    return;
  }

  const q = query.toLowerCase();
  const results = allGames
    .filter(g => g.name.toLowerCase().includes(q))
    .slice(0, 8);

  if (results.length === 0) {
    drop.innerHTML = '<div style="padding:16px;color:var(--text-dim);font-size:.88rem">No games found</div>';
  } else {
    drop.innerHTML = results.map(g => `
      <div class="search-item"
        onclick="openGD(getGame('${g.id}','${g.catLabel}'),'${g.catLabel}','${g.catIcon}');closeSearchDrop()">
        <img class="si-thumb" src="${g.thumb || ''}" alt="${g.name}"
          onerror="this.style.display='none'"/>
        <div>
          <div class="si-name">${g.name}</div>
          <div class="si-price">${g.isFree ? 'Free to Play' : g.price}</div>
        </div>
      </div>
    `).join('');
  }

  drop.classList.add('open');
}

function openSearchDrop() {
  const q = document.getElementById('searchInput');
  if (q && q.value.trim()) doSearch(q.value);
}

function closeSearchDrop() {
  const drop = document.getElementById('searchDrop');
  if (drop) drop.classList.remove('open');
}

/* ============================================================
   AUTH MODAL
   ============================================================ */
function openAuth() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuth() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function switchAuthTab(tab, el) {
  // Deactivate all tabs and panels
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  // Activate selected
  el.classList.add('active');
  const panel = document.getElementById(tab + 'Panel');
  if (panel) panel.classList.add('active');
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
let toastTimer = null;

function showToast(icon, message) {
  const toast = document.getElementById('toast');
  const iconEl = document.getElementById('toastIcon');
  const msgEl  = document.getElementById('toastMsg');
  if (!toast || !iconEl || !msgEl) return;

  iconEl.textContent = icon;
  msgEl.textContent  = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeGD();
    closeSeeAll();
    closeCart();
    closeWishlist();
    closeAuth();
  }
  // Arrow keys for lightbox navigation
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});
