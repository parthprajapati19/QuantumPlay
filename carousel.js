/* ============================================================
   INFINITE CAROUSEL JAVASCRIPT — carousel.js
   Quantum Play | Online Game Store
   Handles: building carousel cards from GAME_DATA,
            infinite CSS animation, drag-to-scroll interaction,
            touch swipe support, click-to-open game detail.
   ============================================================ */

/* ============================================================
   BUILD CAROUSEL
   Doubles the carousel items to create the seamless infinite loop.
   ============================================================ */
function buildCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  // Double the items for seamless infinite scroll
  const items = [...GAME_DATA.carousel, ...GAME_DATA.carousel];

  let html = '';
  items.forEach(item => {
    const priceLabel = item.price === 'Free' ? '🟢 Free' : item.price;
    const fallback   = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='340'><rect fill='%231a0035' width='260' height='340'/><text fill='%239b4dff' x='130' y='180' text-anchor='middle' font-size='50'>🎮</text></svg>`;

    html += `
      <div class="carousel-card" onclick="openCarouselGame('${escapeAttr(item.name)}')">
        <img
          class="carousel-img"
          src="${item.img}"
          alt="${escapeAttr(item.name)}"
          loading="lazy"
          onerror="this.src='${fallback}'"
        />
        <div class="carousel-overlay"></div>
        <div class="carousel-info">
          <div class="carousel-name">${item.name}</div>
          <div class="carousel-meta">
            <span class="carousel-price">${priceLabel}</span>
            <span class="carousel-rating">★ ${item.rating}</span>
          </div>
        </div>
        <div class="carousel-btn">View Game</div>
      </div>
    `;
  });

  track.innerHTML = html;
}

/* ============================================================
   OPEN GAME FROM CAROUSEL
   Finds the game in GAME_DATA by name, then opens the detail modal.
   ============================================================ */
function openCarouselGame(name) {
  for (const cat of GAME_DATA.categories) {
    const g = cat.games.find(game => game.name === name);
    if (g) {
      openGD(g, cat.label, cat.icon);
      return;
    }
  }
  // If not found in categories (carousel-only item), show a minimal toast
  showToast('🎮', `${name} — coming soon!`);
}

/* ============================================================
   DRAG-TO-SCROLL (Mouse)
   Lets the user drag the carousel horizontally with the mouse.
   ============================================================ */
(function initCarouselDrag() {
  // Wait for DOM before attaching
  document.addEventListener('DOMContentLoaded', () => {
    const wrap  = document.getElementById('carouselWrap');
    const track = document.getElementById('carouselTrack');
    if (!wrap || !track) return;

    let isDragging   = false;
    let startX       = 0;
    let scrollLeft   = 0;
    let dragDistance = 0;

    wrap.addEventListener('mousedown', e => {
      isDragging   = true;
      startX       = e.pageX - wrap.offsetLeft;
      scrollLeft   = wrap.scrollLeft;
      dragDistance = 0;

      // Pause CSS animation while dragging
      track.style.animationPlayState = 'paused';
      wrap.classList.add('is-dragging');
    });

    wrap.addEventListener('mouseleave', () => {
      if (!isDragging) return;
      isDragging = false;
      track.style.animationPlayState = '';
      wrap.classList.remove('is-dragging');
    });

    wrap.addEventListener('mouseup', e => {
      isDragging = false;
      track.style.animationPlayState = '';
      wrap.classList.remove('is-dragging');
    });

    wrap.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x    = e.pageX - wrap.offsetLeft;
      const walk = (x - startX) * 1.5; // drag speed multiplier
      dragDistance += Math.abs(walk);
      wrap.scrollLeft = scrollLeft - walk;
    });

    // Prevent card click after a drag
    wrap.addEventListener('click', e => {
      if (dragDistance > 5) {
        e.stopPropagation();
        dragDistance = 0;
      }
    }, true);
  });
})();

/* ============================================================
   TOUCH SWIPE SUPPORT (Mobile)
   ============================================================ */
(function initCarouselTouch() {
  document.addEventListener('DOMContentLoaded', () => {
    const wrap  = document.getElementById('carouselWrap');
    const track = document.getElementById('carouselTrack');
    if (!wrap || !track) return;

    let touchStartX    = 0;
    let touchStartScroll = 0;
    let touchDist      = 0;

    wrap.addEventListener('touchstart', e => {
      touchStartX      = e.touches[0].clientX;
      touchStartScroll = wrap.scrollLeft;
      touchDist        = 0;
      track.style.animationPlayState = 'paused';
    }, { passive: true });

    wrap.addEventListener('touchmove', e => {
      const dx    = touchStartX - e.touches[0].clientX;
      touchDist   = Math.abs(dx);
      wrap.scrollLeft = touchStartScroll + dx;
    }, { passive: true });

    wrap.addEventListener('touchend', () => {
      track.style.animationPlayState = '';
    });
  });
})();

/* ============================================================
   CAROUSEL SPEED CONTROL
   Speeds up the carousel on wider viewports and slows on narrow.
   ============================================================ */
(function initCarouselSpeed() {
  function setSpeed() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const w       = window.innerWidth;
    const duration = w > 1400 ? '38s' : w > 900 ? '32s' : '22s';
    track.style.animationDuration = duration;
  }

  document.addEventListener('DOMContentLoaded', setSpeed);
  window.addEventListener('resize', setSpeed);
})();

/* ============================================================
   UTILITY — escape attribute values for inline HTML
   ============================================================ */
function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  buildCarousel();
});
