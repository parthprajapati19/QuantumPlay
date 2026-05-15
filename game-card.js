/* ============================================================
   GAME CARD & CATEGORY JAVASCRIPT — game-card.js
   Quantum Play | Online Game Store
   Handles: building game sections, game card HTML, filter system,
            See All modal, Game Detail modal, Lightbox,
            Cart side panel, Wishlist side panel.
   ============================================================ */

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/** Generate star string from a numeric rating (e.g. 4.2 → ★★★★☆) */
function starsHTML(rating) {
  const full = Math.floor(rating);
  const half = (rating % 1) >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  for (let i = full + (half ? 1 : 0); i < 5; i++) s += '☆';
  return s;
}

/** Escape a string for use inside an HTML attribute value */
function safeAttr(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}

/**
 * Find a game object by id (and optionally by category label).
 * Falls back to searching all categories.
 */
function getGame(id, catLabel) {
  if (catLabel) {
    for (const cat of GAME_DATA.categories) {
      if (cat.label === catLabel) {
        const g = cat.games.find(x => x.id === id);
        if (g) return g;
      }
    }
  }
  // Fallback – search all categories
  for (const cat of GAME_DATA.categories) {
    const g = cat.games.find(x => x.id === id);
    if (g) return g;
  }
  return null;
}

/* ============================================================
   FILTER SYSTEM
   ============================================================ */

function matchFilter(game) {
  switch (currentFilter) {
    case 'free':       return game.isFree;
    case 'paid':       return !game.isFree;
    case 'top-rated':  return game.rating >= 4.5;
    default:           return true;          // 'all'
  }
}

function filterGames(type, el) {
  currentFilter = type;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  buildSections();
}

/* ============================================================
   GAME CARD HTML
   ============================================================ */
function gameCardHTML(g, catLabel, catIcon) {
  const inCart = cart.some(c => c.id === g.id);
  const inWish = wishlist.some(w => w.id === g.id);
  const fill   = Math.round((g.rating / 5) * 100);

  const badge = g.isFree
    ? '<span class="card-badge free">FREE</span>'
    : '';

  const priceEl = g.isFree
    ? '<span class="card-price free-tag">Free to Play</span>'
    : `<span class="card-price">${g.price}</span>`;

  const fallbackImg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='270'><rect fill='%231a0035' width='200' height='270'/><text fill='%239b4dff' x='100' y='145' text-anchor='middle' font-size='40'>🎮</text></svg>`;

  const thumbSrc = g.thumb || fallbackImg;

  return `
    <div class="game-card"
      onclick="openGD(getGame('${safeAttr(g.id)}','${safeAttr(catLabel)}'),'${safeAttr(catLabel)}','${safeAttr(catIcon)}')">

      <div class="card-img-wrap">
        <img
          src="${thumbSrc}"
          alt="${safeAttr(g.name)}"
          loading="lazy"
          onerror="this.src='${fallbackImg}'"
        />
        <div class="card-overlay"></div>
        ${badge}
        <button
          class="wishlist-btn ${inWish ? 'wishlisted' : ''}"
          onclick="event.stopPropagation();toggleWish('${safeAttr(g.id)}','${safeAttr(catLabel)}')"
          title="${inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}">♥</button>
        <button
          class="add-cart-btn"
          onclick="event.stopPropagation();addToCart('${safeAttr(g.id)}','${safeAttr(catLabel)}')"
          title="Add to Cart">🛒</button>
      </div>

      <div class="card-body">
        <div class="card-name">${g.name}</div>
        <div class="rating-bar-wrap">
          <div class="rating-bar-track">
            <div class="rating-bar-fill" style="width:${fill}%"></div>
          </div>
          <div class="rating-bar-labels">
            <span class="rating-stars">${starsHTML(g.rating)}</span>
            <span class="rating-num">${g.rating}</span>
          </div>
        </div>
        <div class="card-bottom">${priceEl}</div>
      </div>
    </div>
  `;
}

/* ============================================================
   BUILD ALL CATEGORY SECTIONS
   ============================================================ */
function buildSections() {
  const container = document.getElementById('gameSections');
  if (!container) return;

  // Decide how many cards to show per row based on viewport
  const CARDS_PER_ROW = Math.max(4, Math.floor(window.innerWidth / 225));

  let html = '';

  GAME_DATA.categories.forEach(cat => {
    const visGames = cat.games.filter(g => matchFilter(g));
    if (visGames.length === 0) return;

    const rowGames = visGames.slice(0, Math.min(CARDS_PER_ROW, visGames.length));
    const hasMore  = visGames.length > CARDS_PER_ROW;

    html += `
      <section class="games-section" id="${cat.id}">
        <div class="category-header">
          <div class="cat-label">${cat.icon} <span>${cat.label}</span></div>
          <div class="cat-line"></div>
          ${hasMore
            ? `<button class="see-all-btn"
                onclick="openSeeAll('${cat.id}')">
                See All (${visGames.length}) →
               </button>`
            : ''}
        </div>
        <div class="cards-row" id="row-${cat.id}">
          ${rowGames.map(g => gameCardHTML(g, cat.label, cat.icon)).join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;
}

/* ============================================================
   SEE ALL MODAL
   ============================================================ */
function openSeeAll(catId) {
  const cat = GAME_DATA.categories.find(c => c.id === catId);
  if (!cat) return;

  const titleEl = document.getElementById('seeAllTitle');
  const gridEl  = document.getElementById('seeAllGrid');
  const overlay = document.getElementById('seeAllOverlay');

  if (titleEl) titleEl.textContent = `${cat.icon} ${cat.label}`;
  if (gridEl)  gridEl.innerHTML    = cat.games.map(g => gameCardHTML(g, cat.label, cat.icon)).join('');
  if (overlay) overlay.classList.add('open');

  document.body.style.overflow = 'hidden';
}

function closeSeeAll() {
  const overlay = document.getElementById('seeAllOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Click backdrop to close
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('seeAllOverlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeSeeAll();
    });
  }
});

/* ============================================================
   GAME DETAIL MODAL
   ============================================================ */
function openGD(g, catLabel, catIcon) {
  if (!g) return;

  const overlay = document.getElementById('gdOverlay');
  const titleEl = document.getElementById('gdTitle');
  const bodyEl  = document.getElementById('gdBody');
  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = g.name;

  const heroImg  = g.screenshots[0] || g.thumb || '';
  const fill     = Math.round((g.rating / 5) * 100);
  const inWish   = wishlist.some(w => w.id === g.id);

  // System requirements rows
  const minRows = Object.entries(g.minReq || {}).map(([k, v]) =>
    `<div class="sysreq-row">
       <span class="sysreq-label">${k}</span>
       <span class="sysreq-val">${v}</span>
     </div>`
  ).join('');

  const recRows = Object.entries(g.recReq || {}).map(([k, v]) =>
    `<div class="sysreq-row">
       <span class="sysreq-label">${k}</span>
       <span class="sysreq-val">${v}</span>
     </div>`
  ).join('');

  // Reviews
  const reviewsHTML = (g.reviews || []).map(rv => `
    <div class="review-item">
      <div class="review-top">
        <div class="review-avatar">${rv.avatar}</div>
        <div>
          <div class="review-name">${rv.user}</div>
        </div>
        <div class="review-date">${rv.date}</div>
      </div>
      <div class="review-stars">${starsHTML(rv.rating)} ${rv.rating}/5</div>
      <div class="review-text">${rv.text}</div>
    </div>
  `).join('');

  // Screenshots
  const screenshotsJSON = JSON.stringify(g.screenshots).replace(/'/g, "\\'");
  const screensHTML = (g.screenshots || []).slice(0, 6).map((s, i) => `
    <div class="gd-screenshot"
      onclick="openLightbox(${screenshotsJSON}, ${i})">
      <img src="${s}" alt="Screenshot ${i + 1}" loading="lazy"/>
    </div>
  `).join('');

  // Genre badges
  const genresHTML = (g.genres || []).map(genre =>
    `<span class="gd-genre-tag">${genre}</span>`
  ).join('');

  bodyEl.innerHTML = `
    <div class="gd-hero">
      ${heroImg
        ? `<img src="${heroImg}" alt="${safeAttr(g.name)}"/>`
        : '<div style="background:var(--bg3);height:100%"></div>'}
      <div class="gd-hero-overlay"></div>
    </div>

    <div class="gd-content">
      <div class="gd-top">
        <img class="gd-thumb" src="${g.thumb || ''}" alt="${safeAttr(g.name)}"
          onerror="this.style.display='none'"/>
        <div class="gd-meta">
          <div class="gd-name">${g.name}</div>

          <div class="gd-badges">
            ${genresHTML}
            <span class="gd-genre-tag">${catIcon} ${catLabel}</span>
          </div>

          <div class="gd-pub-row">
            <div class="gd-pub-item">Publisher: <strong>${g.publisher || 'Unknown'}</strong></div>
            <div class="gd-pub-item">Released: <strong>${g.releaseDate || 'N/A'}</strong></div>
          </div>

          <div class="gd-rating-row">
            <span class="gd-stars">${starsHTML(g.rating)}</span>
            <span class="gd-rating-num">${g.rating} / 5.0</span>
          </div>

          <div class="gd-price-row">
            <span class="gd-price" style="${g.isFree ? 'color:var(--accent)' : ''}">
              ${g.isFree ? '🟢 Free to Play' : g.price}
            </span>
            <button class="gd-btn"
              onclick="addToCart('${safeAttr(g.id)}','${safeAttr(catLabel)}');this.textContent='✅ Added!'">
              ${g.isFree ? '📥 Install Now' : '🛒 Add to Cart'}
            </button>
            <button class="gd-wish-btn ${inWish ? 'active' : ''}" id="gdWishBtn"
              onclick="toggleWish('${safeAttr(g.id)}','${safeAttr(catLabel)}');this.classList.toggle('active')"
              title="${inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}">♥</button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="gd-tabs">
        <span class="gd-tab active" onclick="switchGDTab('desc',this)">📖 Description</span>
        <span class="gd-tab" onclick="switchGDTab('screenshots',this)">
          🖼️ Screenshots${g.screenshots && g.screenshots.length ? ' (' + g.screenshots.length + ')' : ''}
        </span>
        <span class="gd-tab" onclick="switchGDTab('sysreq',this)">💻 System Requirements</span>
        <span class="gd-tab" onclick="switchGDTab('reviews',this)">
          ⭐ Reviews (${(g.reviews || []).length})
        </span>
      </div>

      <!-- Description Panel -->
      <div class="gd-panel active" id="panel-desc">
        <p class="gd-desc">${g.desc || 'A thrilling gaming experience awaits you.'}</p>
      </div>

      <!-- Screenshots Panel -->
      <div class="gd-panel" id="panel-screenshots">
        ${(g.screenshots && g.screenshots.length)
          ? `<div class="gd-screenshots">${screensHTML}</div>`
          : '<p style="color:var(--text-dim);padding:20px 0">No screenshots available.</p>'}
      </div>

      <!-- System Requirements Panel -->
      <div class="gd-panel" id="panel-sysreq">
        <div class="gd-sysreq">
          <div class="sysreq-col">
            <div class="sysreq-title">Minimum</div>
            ${minRows || '<p style="color:var(--text-dim)">N/A</p>'}
          </div>
          <div class="sysreq-col">
            <div class="sysreq-title">Recommended</div>
            ${recRows || '<p style="color:var(--text-dim)">N/A</p>'}
          </div>
        </div>
      </div>

      <!-- Reviews Panel -->
      <div class="gd-panel" id="panel-reviews">
        <div class="gd-reviews">
          ${reviewsHTML || '<p style="color:var(--text-dim);padding:20px 0">No reviews yet.</p>'}
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGD() {
  const overlay = document.getElementById('gdOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function switchGDTab(tab, el) {
  document.querySelectorAll('.gd-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.gd-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const panel = document.getElementById('panel-' + tab);
  if (panel) panel.classList.add('active');
}

// Click backdrop to close GD modal
document.addEventListener('DOMContentLoaded', () => {
  const gdOverlay = document.getElementById('gdOverlay');
  if (gdOverlay) {
    gdOverlay.addEventListener('click', e => {
      if (e.target === gdOverlay) closeGD();
    });
  }
});

/* ============================================================
   LIGHTBOX (Screenshot viewer)
   ============================================================ */
function openLightbox(images, index) {
  lbImages = images;
  lbIdx    = index;
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  if (!lb || !lbImg) return;
  lbImg.src = images[index];
  lb.classList.add('open');
}

// Alias used by header.js keyboard handler
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}

function lbNav(dir) {
  if (!lbImages.length) return;
  lbIdx = (lbIdx + dir + lbImages.length) % lbImages.length;
  const lbImg = document.getElementById('lbImg');
  if (lbImg) lbImg.src = lbImages[lbIdx];
}

document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.addEventListener('click', e => {
      if (e.target === lb || e.target.id === 'lbImg') closeLightbox();
    });
  }
});

/* ============================================================
   CART
   ============================================================ */
function addToCart(id, catLabel) {
  const g = getGame(id, catLabel);
  if (!g) return;
  if (cart.some(c => c.id === id)) {
    showToast('ℹ️', 'Already in cart!');
    return;
  }
  cart.push(g);
  updateCartUI();
  showToast('🛒', `${g.name} added to cart!`);
}

function removeCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    countEl.textContent    = cart.length;
    countEl.style.display  = cart.length > 0 ? 'flex' : 'none';
  }
  renderCart();
}

function renderCart() {
  const bodyEl   = document.getElementById('cartBody');
  const footerEl = document.getElementById('cartFooter');
  if (!bodyEl) return;

  if (cart.length === 0) {
    bodyEl.innerHTML       = '<div class="panel-empty"><div class="panel-empty-icon">🛒</div><p>Your cart is empty</p></div>';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  let total = 0;
  bodyEl.innerHTML = cart.map(g => {
    const priceNum = g.isFree
      ? 0
      : parseFloat((g.price || '0').replace(/[₹,]/g, '')) || 0;
    total += priceNum;

    return `
      <div class="panel-item">
        <img class="pi-thumb" src="${g.thumb || ''}" alt="${safeAttr(g.name)}"
          onerror="this.style.display='none'"/>
        <div class="pi-info">
          <div class="pi-name">${g.name}</div>
          <div class="pi-price">${g.isFree ? 'Free' : g.price}</div>
        </div>
        <span class="pi-remove" onclick="removeCart('${safeAttr(g.id)}')">✕</span>
      </div>
    `;
  }).join('');

  if (footerEl) {
    footerEl.style.display = 'block';
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) {
      totalEl.textContent = total > 0 ? '₹' + total.toLocaleString('en-IN') : 'Free!';
    }
  }
}

function openCart() {
  renderCart();
  const panel    = document.getElementById('cartPanel');
  const backdrop = document.getElementById('panelBackdrop');
  if (panel)    panel.classList.add('open');
  if (backdrop) backdrop.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const panel    = document.getElementById('cartPanel');
  const backdrop = document.getElementById('panelBackdrop');
  if (panel) panel.classList.remove('open');
  // Only hide backdrop if wishlist is also closed
  const wishPanel = document.getElementById('wishPanel');
  if (backdrop && !(wishPanel && wishPanel.classList.contains('open'))) {
    backdrop.classList.remove('show');
  }
  document.body.style.overflow = '';
}

/* ============================================================
   WISHLIST
   ============================================================ */
function toggleWish(id, catLabel) {
  const g = getGame(id, catLabel);
  if (!g) return;

  const idx = wishlist.findIndex(w => w.id === id);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast('💔', `${g.name} removed from wishlist`);
  } else {
    wishlist.push(g);
    showToast('♥', `${g.name} added to wishlist!`);
  }

  renderWish();
  updateWishCount();
  // Rebuild visible cards so wishlist button states refresh
  buildSections();
}

function updateWishCount() {
  const wc = document.getElementById('wishCount');
  if (!wc) return;
  wc.textContent    = wishlist.length;
  wc.style.display  = wishlist.length > 0 ? 'flex' : 'none';
}

function renderWish() {
  const bodyEl = document.getElementById('wishBody');
  if (!bodyEl) return;

  if (wishlist.length === 0) {
    bodyEl.innerHTML = '<div class="panel-empty"><div class="panel-empty-icon">♥</div><p>Your wishlist is empty</p></div>';
    return;
  }

  bodyEl.innerHTML = wishlist.map(g => `
    <div class="panel-item">
      <img class="pi-thumb" src="${g.thumb || ''}" alt="${safeAttr(g.name)}"
        onerror="this.style.display='none'"/>
      <div class="pi-info">
        <div class="pi-name">${g.name}</div>
        <div class="pi-price">${g.isFree ? 'Free' : g.price}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;align-items:center">
        <button
          style="background:var(--primary);color:#fff;border-radius:6px;padding:5px 10px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:'Rajdhani',sans-serif;border:none"
          onclick="addToCart('${safeAttr(g.id)}','')">🛒</button>
        <span class="pi-remove" onclick="toggleWish('${safeAttr(g.id)}','')">✕</span>
      </div>
    </div>
  `).join('');
}

function openWishlist() {
  renderWish();
  const panel    = document.getElementById('wishPanel');
  const backdrop = document.getElementById('panelBackdrop');
  if (panel)    panel.classList.add('open');
  if (backdrop) backdrop.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeWishlist() {
  const panel    = document.getElementById('wishPanel');
  const backdrop = document.getElementById('panelBackdrop');
  if (panel) panel.classList.remove('open');
  // Only hide backdrop if cart is also closed
  const cartPanel = document.getElementById('cartPanel');
  if (backdrop && !(cartPanel && cartPanel.classList.contains('open'))) {
    backdrop.classList.remove('show');
  }
  document.body.style.overflow = '';
}

/* ============================================================
   RESPONSIVE REBUILD ON RESIZE
   Debounced so it doesn't fire too often.
   ============================================================ */
(function initResizeRebuild() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildSections();
    }, 220);
  });
})();

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  buildSections();
  buildSearch();   // defined in header.js — populates allGames for search
});
