/**
 * NutraVora Scroll Animations
 * Uses IntersectionObserver for performance
 * Premium Supplement Brand - v1.0
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  const observerConfig = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  };

  const onIntersect = (entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('nv-animated');
      observer.unobserve(entry.target);
    });
  };

  const observer = new IntersectionObserver(onIntersect, observerConfig);

  const animateEls = document.querySelectorAll('[data-nv-animate]');
  animateEls.forEach(el => {
    el._nvObserved = true;
    observer.observe(el);
  });

  const mutationObserver = new MutationObserver(() => {
    const newEls = document.querySelectorAll(
      '[data-nv-animate]:not(.nv-animated)'
    );
    newEls.forEach(el => {
      if (!el._nvObserved) {
        observer.observe(el);
        el._nvObserved = true;
      }
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
