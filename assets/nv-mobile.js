/**
 * NutraVora Mobile UX Enhancements
 * Touch gestures, scroll behavior, iOS fixes
 * Premium Supplement Brand - v1.0
 */

(function () {
  'use strict';

  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--nv-vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH, { passive: true });

  const createScrollProgress = () => {
    if (document.getElementById('nv-scroll-progress')) return;

    const bar = document.createElement('div');
    bar.id = 'nv-scroll-progress';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(
        to right,
        var(--nv-green-primary),
        var(--nv-gold-primary)
      );
      z-index: 9999;
      transition: width 0.1s linear;
      pointer-events: none;
    `;
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
    }, { passive: true });
  };

  createScrollProgress();

  const mobileMenuBtn = document.querySelector(
    '[data-mobile-menu-toggle], ' +
    '.header__icon--menu, ' +
    '[aria-controls*="menu"]'
  );

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      document.body.classList.toggle('nv-menu-open');
    });
  }

  const dragScrollEls = document.querySelectorAll(
    '.nv-health-goals__grid, ' +
    '.nv-bundle__products'
  );

  dragScrollEls.forEach(el => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    el.addEventListener('mousedown', (event) => {
      isDown = true;
      el.style.cursor = 'grabbing';
      startX = event.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });

    el.addEventListener('mouseleave', () => {
      isDown = false;
      el.style.cursor = 'grab';
    });

    el.addEventListener('mouseup', () => {
      isDown = false;
      el.style.cursor = 'grab';
    });

    el.addEventListener('mousemove', (event) => {
      if (!isDown) return;
      event.preventDefault();
      const x = event.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    });

    el.style.cursor = 'grab';
  });

  const pdpImages = document.querySelectorAll(
    '.product-media-container img, ' +
    '.product__media img'
  );

  pdpImages.forEach(img => {
    img.style.touchAction = 'pinch-zoom';
  });

  const createBackToTop = () => {
    if (document.getElementById('nv-back-to-top')) return;

    const btn = document.createElement('button');
    btn.id = 'nv-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    `;
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--nv-green-primary);
      color: var(--nv-white);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--nv-shadow-lg);
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: var(--nv-z-sticky);
      pointer-events: none;
    `;

    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      const show = window.scrollY > 600;
      btn.style.opacity = show ? '1' : '0';
      btn.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
      btn.style.pointerEvents = show ? 'auto' : 'none';
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  createBackToTop();

  if (isMobile) {
    const stickyAtc = document.querySelector('.nv-sticky-atc');
    const siteHeader = document.querySelector('.site-header, header[role="banner"]');

    if (stickyAtc && siteHeader) {
      const headerHeight = siteHeader.offsetHeight;
      const headerPosition = getComputedStyle(siteHeader).position;
      const headerIsSticky = headerPosition === 'sticky' || headerPosition === 'fixed';

      if (headerIsSticky) {
        stickyAtc.style.top = `${headerHeight}px`;
      }
    }
  }

  document.addEventListener('modalOpen', () => {
    document.body.style.overflow = 'hidden';
  });

  document.addEventListener('modalClose', () => {
    document.body.style.overflow = '';
  });

  if (isIOS) {
    document.documentElement.style.setProperty('--nv-safe-bottom', 'env(safe-area-inset-bottom, 0px)');

    const stickyAtc = document.querySelector('.nv-sticky-atc');
    if (stickyAtc) {
      stickyAtc.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      let target;
      try {
        target = document.querySelector(href);
      } catch (error) {
        return;
      }

      if (!target) return;
      event.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
