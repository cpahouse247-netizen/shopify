/**
 * NutraVora Performance Optimizer
 * Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
 * Premium Supplement Brand - v1.0
 */

(function () {
  'use strict';

  // 1. Lazy Load Non-Critical Images
  // Use native lazy loading + IntersectionObserver fallback
  const lazyImages = document.querySelectorAll(
    'img[loading="lazy"]:not([src])'
  );

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          imageObserver.unobserve(img);
        });
      },
      { rootMargin: '200px 0px' }
    );
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // 2. Defer Non-Critical Third-Party Scripts
  // Delay scripts that aren't needed for initial render
  const deferScripts = () => {
    const deferredSrcs = [
      'facebook.net',
      'connect.facebook.net',
      'pinterest.com/ct',
      'tiktok.com',
      'clarity.ms'
    ];

    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      const isDeferred = deferredSrcs.some(
        domain => src.includes(domain)
      );
      if (isDeferred && !script.defer && !script.async) {
        script.async = true;
      }
    });
  };

  // 3. Prefetch Next Likely Pages
  // Prefetch product pages on hover for instant navigation
  const prefetchOnHover = () => {
    const productLinks = document.querySelectorAll(
      'a[href*="/products/"]'
    );

    const prefetched = new Set();

    productLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (!href || prefetched.has(href)) return;

        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        prefetchLink.as = 'document';
        document.head.appendChild(prefetchLink);
        prefetched.add(href);
      }, { passive: true });
    });
  };

  // 4. Optimize AReviews Widget Load
  // Defer review widget until after LCP
  const deferReviewWidget = () => {
    const reviewContainers = document.querySelectorAll(
      '[data-areviews-widget], ' +
      '.areviews-widget, ' +
      '.nv-pdp-areviews [class*="areviews"], ' +
      '.nv-pdp-areviews__widget'
    );

    if (reviewContainers.length === 0) return;

    const loadReviews = () => {
      reviewContainers.forEach(container => {
        container.style.visibility = 'visible';
        container.style.opacity = '1';
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadReviews, { timeout: 3000 });
    } else {
      setTimeout(loadReviews, 2000);
    }
  };

  // 5. Prevent CLS from Images
  // Ensure all images have explicit dimensions
  const preventImageCLS = () => {
    const images = document.querySelectorAll(
      'img:not([width]):not([height])'
    );
    images.forEach(img => {
      if (img.naturalWidth && img.naturalHeight) {
        img.setAttribute('width', img.naturalWidth);
        img.setAttribute('height', img.naturalHeight);
      }
    });
  };

  // 6. Font Display Optimization
  // Add font-loaded class when fonts are ready
  const optimizeFonts = () => {
    if (!document.fonts) return;
    document.fonts.ready.then(() => {
      document.documentElement.classList.remove('nv-fonts-loading');
      document.documentElement.classList.add('nv-fonts-loaded');
    });
  };

  // 7. Reduce Layout Thrashing
  // Batch DOM reads/writes for animation frames
  window.nvRAF = window.nvRAF || {
    reads: [],
    writes: [],
    scheduled: false,
    read(fn) { this.reads.push(fn); this.schedule(); },
    write(fn) { this.writes.push(fn); this.schedule(); },
    schedule() {
      if (this.scheduled) return;
      this.scheduled = true;
      requestAnimationFrame(() => {
        const reads = this.reads.splice(0);
        const writes = this.writes.splice(0);
        reads.forEach(fn => fn());
        writes.forEach(fn => fn());
        this.scheduled = false;
      });
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      deferScripts();
      prefetchOnHover();
      deferReviewWidget();
      optimizeFonts();
      setTimeout(preventImageCLS, 1000);
    });
  } else {
    deferScripts();
    prefetchOnHover();
    deferReviewWidget();
    optimizeFonts();
    setTimeout(preventImageCLS, 1000);
  }
})();
