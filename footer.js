/* ============================================================
   FOOTER JAVASCRIPT — footer.js
   Quantum Play | Online Game Store
   Handles: footer reveal animation, "back to top" button,
            newsletter interaction, footer link hover ripple,
            social icon animations, current year update.
   ============================================================ */

/* ============================================================
   DYNAMIC COPYRIGHT YEAR
   Keeps the © year always current without editing HTML.
   ============================================================ */
(function updateCopyrightYear() {
  document.addEventListener('DOMContentLoaded', () => {
    const footerBottom = document.querySelector('.footer-bottom span:first-child');
    if (!footerBottom) return;
    const year = new Date().getFullYear();
    footerBottom.textContent = `© ${year} QuantumPlay. All rights reserved.`;
  });
})();

/* ============================================================
   FOOTER REVEAL ANIMATION
   Footer fades in from below when it first enters the viewport.
   ============================================================ */
(function initFooterReveal() {
  // Inject CSS for footer reveal
  const style = document.createElement('style');
  style.id    = 'footerRevealStyle';
  style.textContent = `
    .footer {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .footer.footer-visible {
      opacity: 1;
      transform: translateY(0);
    }
    /* Stagger footer columns */
    .footer-grid > *:nth-child(1) { transition-delay: .05s; }
    .footer-grid > *:nth-child(2) { transition-delay: .12s; }
    .footer-grid > *:nth-child(3) { transition-delay: .19s; }
    .footer-grid > *:nth-child(4) { transition-delay: .26s; }
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    if (!('IntersectionObserver' in window)) {
      footer.classList.add('footer-visible');
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          footer.classList.add('footer-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(footer);
  });
})();

/* ============================================================
   BACK TO TOP BUTTON
   A floating button appears after the user scrolls down 400 px,
   and smoothly returns them to the top on click.
   ============================================================ */
(function initBackToTop() {
  document.addEventListener('DOMContentLoaded', () => {
    // Create the button
    const btn = document.createElement('button');
    btn.id    = 'backToTop';
    btn.innerHTML = '↑';
    btn.title     = 'Back to top';
    btn.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 30px;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-d));
      color: #fff;
      font-size: 1.2rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      z-index: 8000;
      opacity: 0;
      transform: translateY(12px) scale(.85);
      transition: opacity .35s, transform .35s;
      box-shadow: 0 6px 20px rgba(155,77,255,.45);
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    `;
    document.body.appendChild(btn);

    // Show / hide on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.style.opacity   = '1';
        btn.style.transform = 'translateY(0) scale(1)';
      } else {
        btn.style.opacity   = '0';
        btn.style.transform = 'translateY(12px) scale(.85)';
      }
    }, { passive: true });

    // Scroll to top on click
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 8px 28px rgba(155,77,255,.65)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = '0 6px 20px rgba(155,77,255,.45)';
    });
  });
})();

/* ============================================================
   FOOTER LINK HOVER UNDERLINE ANIMATION
   Adds an animated underline effect to footer column links.
   ============================================================ */
(function initFooterLinkAnimation() {
  const style = document.createElement('style');
  style.id    = 'footerLinkStyle';
  style.textContent = `
    .footer-col a {
      position: relative;
      display: inline-block;
    }
    .footer-col a::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 0;
      height: 1px;
      background: var(--accent);
      transition: width .25s ease;
    }
    .footer-col a:hover::after {
      width: 100%;
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   NEWSLETTER / QUICK CTA (injected into footer brand column)
   A simple email input with a subscribe button.
   ============================================================ */
(function initNewsletterCTA() {
  document.addEventListener('DOMContentLoaded', () => {
    const brand = document.querySelector('.footer-brand');
    if (!brand) return;

    // Inject styles
    if (!document.getElementById('newsletterStyle')) {
      const s = document.createElement('style');
      s.id    = 'newsletterStyle';
      s.textContent = `
        .newsletter-wrap {
          margin-top: 16px;
          display: flex;
          gap: 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
          max-width: 320px;
          background: var(--surface);
        }
        .newsletter-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 9px 14px;
          color: var(--text);
          font-family: 'Rajdhani', sans-serif;
          font-size: .88rem;
        }
        .newsletter-input::placeholder { color: var(--text-dim); }
        .newsletter-btn {
          padding: 9px 16px;
          background: linear-gradient(135deg, var(--primary), var(--primary-d));
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: .85rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background .2s;
          white-space: nowrap;
        }
        .newsletter-btn:hover {
          background: linear-gradient(135deg, var(--primary-d), #6020d0);
        }
        .newsletter-label {
          font-size: .78rem;
          color: var(--text-dim);
          margin-top: 10px;
          display: block;
        }
      `;
      document.head.appendChild(s);
    }

    const wrap      = document.createElement('div');
    wrap.innerHTML  = `
      <div class="newsletter-wrap">
        <input class="newsletter-input" id="newsletterEmail"
          type="email" placeholder="your@email.com" autocomplete="off"/>
        <button class="newsletter-btn" id="newsletterBtn">Subscribe</button>
      </div>
      <span class="newsletter-label">🔔 Get notified about deals & new releases.</span>
    `;

    brand.appendChild(wrap);

    // Handle subscribe click
    document.getElementById('newsletterBtn').addEventListener('click', () => {
      const email = document.getElementById('newsletterEmail').value.trim();
      if (!email || !email.includes('@')) {
        showToast('⚠️', 'Please enter a valid email address.');
        return;
      }
      showToast('✅', `Subscribed! We'll keep ${email} in the loop.`);
      document.getElementById('newsletterEmail').value = '';
    });

    // Allow pressing Enter in the input
    document.getElementById('newsletterEmail').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('newsletterBtn').click();
    });
  });
})();

/* ============================================================
   SOCIAL ICON ENTRANCE ANIMATION
   Staggers the social icons when the footer comes into view.
   ============================================================ */
(function initSocialAnimation() {
  const style = document.createElement('style');
  style.id    = 'socialAnimStyle';
  style.textContent = `
    .footer-social {
      opacity: 0;
      transform: scale(0.6) rotate(-15deg);
      transition: opacity .4s ease, transform .4s ease,
                  border-color .2s, color .2s, background .2s;
    }
    .footer.footer-visible .footer-social {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    .footer.footer-visible .footer-social:nth-child(1) { transition-delay: .35s; }
    .footer.footer-visible .footer-social:nth-child(2) { transition-delay: .45s; }
    .footer.footer-visible .footer-social:nth-child(3) { transition-delay: .55s; }
    .footer.footer-visible .footer-social:nth-child(4) { transition-delay: .65s; }
  `;
  document.head.appendChild(style);
})();
