/* ============================================================
   HERO SECTION JAVASCRIPT — hero.js
   Quantum Play | Online Game Store
   Handles: animated stat counters, parallax grid effect,
            hero badge pulse, scroll-to-section interactions.
   ============================================================ */

/* ============================================================
   ANIMATED STAT COUNTERS
   Counts up each stat number when the hero section is in view.
   ============================================================ */
(function initStatCounters() {
  // Stat targets: [display suffix, end value]
  const stats = [
    { selector: '.hero-stats .stat:nth-child(1) .stat-num', end: 110, suffix: '+', duration: 1800 },
    { selector: '.hero-stats .stat:nth-child(3) .stat-num', end: 8,   suffix: '',  duration: 900  },
  ];

  function animateCount(el, end, suffix, duration) {
    const start   = 0;
    const startTs = performance.now();

    function step(ts) {
      const elapsed  = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(eased * end);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  let countersRun = false;

  function runCounters() {
    if (countersRun) return;
    countersRun = true;
    stats.forEach(({ selector, end, suffix, duration }) => {
      const el = document.querySelector(selector);
      if (el) animateCount(el, end, suffix, duration);
    });
  }

  // Use IntersectionObserver — fire when hero is visible
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(heroEl);
  } else {
    // Fallback: run immediately on DOM ready
    runCounters();
  }
})();

/* ============================================================
   HERO GRID PARALLAX
   Moves the background grid subtly as the user scrolls.
   ============================================================ */
(function initHeroParallax() {
  const grid = document.querySelector('.hero-grid');
  if (!grid) return;

  function onScroll() {
    const scrolled = window.scrollY;
    const rate     = scrolled * 0.15;
    grid.style.transform = `translateY(${rate}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   HERO BADGE PULSE
   Adds a subtle attention animation to the hero badge after
   a short delay so it draws the eye after the page loads.
   ============================================================ */
(function initHeroBadgePulse() {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;

  // After 2.5 seconds give it a quick pulse glow
  setTimeout(() => {
    badge.style.transition = 'box-shadow .4s ease, transform .4s ease';
    badge.style.boxShadow  = '0 0 20px rgba(0,245,255,.5)';
    badge.style.transform  = 'scale(1.04)';

    setTimeout(() => {
      badge.style.boxShadow = '';
      badge.style.transform = '';
    }, 600);
  }, 2500);
})();

/* ============================================================
   HERO BUTTON RIPPLE EFFECT
   Adds a ripple animation on click for .btn-primary
   ============================================================ */
(function initButtonRipple() {
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        width:10px;height:10px;
        background:rgba(255,255,255,.35);
        left:${x - 5}px;top:${y - 5}px;
        transform:scale(0);
        animation:rippleAnim .55s linear;
        pointer-events:none;
      `;

      // Inject keyframes if not already present
      if (!document.getElementById('rippleStyle')) {
        const style = document.createElement('style');
        style.id    = 'rippleStyle';
        style.textContent = `
          @keyframes rippleAnim {
            to { transform: scale(20); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      // Ensure the button has position:relative for the ripple
      const prevPos = getComputedStyle(btn).position;
      if (prevPos === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

/* ============================================================
   HERO SCROLL INDICATOR
   Fades out as the user begins to scroll.
   ============================================================ */
(function initScrollIndicator() {
  // Dynamically inject a scroll-down arrow below the hero
  const hero = document.getElementById('hero');
  if (!hero) return;

  const indicator = document.createElement('div');
  indicator.id    = 'heroScrollIndicator';
  indicator.innerHTML = '↓';
  indicator.style.cssText = `
    position:absolute;
    bottom:24px;
    left:50%;
    transform:translateX(-50%);
    color:var(--text-dim);
    font-size:1.4rem;
    opacity:.6;
    animation:scrollBounce 1.6s ease-in-out infinite;
    cursor:pointer;
    z-index:2;
    transition:opacity .4s;
  `;

  // Inject bounce keyframes
  if (!document.getElementById('scrollBounceStyle')) {
    const style = document.createElement('style');
    style.id    = 'scrollBounceStyle';
    style.textContent = `
      @keyframes scrollBounce {
        0%,100% { transform:translateX(-50%) translateY(0); }
        50%      { transform:translateX(-50%) translateY(8px); }
      }
    `;
    document.head.appendChild(style);
  }

  hero.appendChild(indicator);

  // Click scroll down
  indicator.addEventListener('click', () => {
    const next = document.getElementById('carousel-section');
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  });

  // Fade when scrolled
  window.addEventListener('scroll', () => {
    indicator.style.opacity = window.scrollY > 60 ? '0' : '.6';
  }, { passive: true });
})();
