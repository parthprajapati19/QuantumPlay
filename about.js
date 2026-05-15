/* ============================================================
   ABOUT SECTION JAVASCRIPT — about.js
   Quantum Play | Online Game Store
   Handles: scroll-triggered reveal animations for about cards
            and stats, animated number counters for stat figures.
   ============================================================ */

/* ============================================================
   INTERSECTION OBSERVER — ANIMATE ON SCROLL
   Adds the .visible class to about cards and stat items
   when they scroll into view, triggering CSS transitions.
   ============================================================ */
(function initAboutAnimations() {
  // Inject animation CSS for the reveal effect
  const style = document.createElement('style');
  style.id    = 'aboutAnimStyle';
  style.textContent = `
    /* Initial hidden state (applied by JS so CSS-only visitors still see content) */
    .about-card.anim-ready,
    .about-stat.anim-ready {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity .55s ease, transform .55s ease;
    }
    .about-badge.anim-ready,
    .about-title.anim-ready,
    .about-sub.anim-ready {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity .5s ease, transform .5s ease;
    }
    .about-card.anim-ready.visible,
    .about-stat.anim-ready.visible,
    .about-badge.anim-ready.visible,
    .about-title.anim-ready.visible,
    .about-sub.anim-ready.visible {
      opacity: 1;
      transform: translateY(0);
    }
    /* Stagger delay for grid cards */
    .about-card.anim-ready:nth-child(1) { transition-delay: 0s; }
    .about-card.anim-ready:nth-child(2) { transition-delay: .1s; }
    .about-card.anim-ready:nth-child(3) { transition-delay: .2s; }
    .about-card.anim-ready:nth-child(4) { transition-delay: .3s; }

    /* Stagger delay for stats */
    .about-stat.anim-ready:nth-child(1) { transition-delay: 0s; }
    .about-stat.anim-ready:nth-child(3) { transition-delay: .1s; }
    .about-stat.anim-ready:nth-child(5) { transition-delay: .2s; }
    .about-stat.anim-ready:nth-child(7) { transition-delay: .3s; }
  `;
  document.head.appendChild(style);

  function setupObserver() {
    const section = document.getElementById('about');
    if (!section) return;

    // Add anim-ready to elements we want to animate
    const targets = [
      ...section.querySelectorAll('.about-badge, .about-title, .about-sub'),
      ...section.querySelectorAll('.about-card'),
      ...section.querySelectorAll('.about-stat'),
    ];

    targets.forEach(el => el.classList.add('anim-ready'));

    if (!('IntersectionObserver' in window)) {
      // Fallback: show immediately for unsupported browsers
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', setupObserver);
})();

/* ============================================================
   ANIMATED STAT COUNTERS
   Counts up the about section stat numbers when they scroll
   into view (2M+, 110+, 8, 24/7).
   ============================================================ */
(function initAboutCounters() {
  // Define the counters: selector, end value, suffix, decimals
  const COUNTERS = [
    { selector: '.about-stat:nth-child(1) .about-stat-num', end: 110,  suffix: '+',  duration: 1400 },
    { selector: '.about-stat:nth-child(3) .about-stat-num', end: 8,    suffix: '',   duration: 700  },
    { selector: '.about-stat:nth-child(5) .about-stat-num', end: 2,    suffix: 'M+', duration: 1200 },
  ];
  // The "24/7" stat is text — we skip it for counting

  function animateCount(el, end, suffix, duration) {
    const startTs = performance.now();

    function step(ts) {
      const elapsed  = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * end);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  let countersRun = false;

  function runCounters() {
    if (countersRun) return;
    countersRun = true;
    COUNTERS.forEach(({ selector, end, suffix, duration }) => {
      const el = document.querySelector(selector);
      if (el) animateCount(el, end, suffix, duration);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const statsEl = document.querySelector('.about-stats');
    if (!statsEl) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            runCounters();
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(statsEl);
    } else {
      runCounters();
    }
  });
})();

/* ============================================================
   ABOUT CARD HOVER GLOW TRAIL
   Creates a subtle glowing cursor trail effect inside about cards.
   ============================================================ */
(function initCardGlowTrail() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.about-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x    = ((e.clientX - rect.left) / rect.width)  * 100;
        const y    = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });

    // Inject the CSS for the glow trail
    if (!document.getElementById('cardGlowStyle')) {
      const s = document.createElement('style');
      s.id    = 'cardGlowStyle';
      s.textContent = `
        .about-card {
          --mouse-x: 50%;
          --mouse-y: 50%;
        }
        .about-card:hover::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle 80px at var(--mouse-x) var(--mouse-y),
            rgba(155,77,255,.18),
            transparent 70%
          );
          pointer-events: none;
          border-radius: inherit;
          z-index: 0;
        }
        .about-card > * { position: relative; z-index: 1; }
      `;
      document.head.appendChild(s);
    }
  });
})();
