/**
 * NutraVora Metafield Data Enrichment
 * Reads product metafields and enriches PDP UI
 * Premium Supplement Brand — v1.0
 */

(function () {
  'use strict';

  // Only run on product pages
  if (window.Shopify?.designMode) return;
  if (!document.querySelector('[data-nv-product-id]')) return;

  const productId = document.querySelector(
    '[data-nv-product-id]'
  )?.dataset?.nvProductId;

  if (!productId) return;

  // ── Sticky ATC Rating Sync ──
  // Update sticky bar rating from page data attribute
  const pageRating = document.querySelector(
    '[data-nv-product-rating]'
  )?.dataset?.nvProductRating;

  const pageReviewCount = document.querySelector(
    '[data-nv-product-review-count]'
  )?.dataset?.nvProductReviewCount;

  if (pageRating || pageReviewCount) {
    const stickyRatingText = document.querySelector(
      '.nv-sticky-atc__rating-text'
    );
    if (stickyRatingText) {
      const rating = pageRating || '4.8';
      const count = pageReviewCount || '221+';
      const countLabel = /review/i.test(count)
        ? count
        : `${count} reviews`;
      stickyRatingText.textContent =
        `${rating} · ${countLabel}`;
    }
  }

  // ── Supply Callout Dynamic Update ──
  // If supply callout exists but is empty,
  // try to populate from data attribute
  const supplyCallout = document.querySelector(
    '.nv-supply-callout span'
  );
  const supplyData = document.querySelector(
    '[data-nv-supply-label]'
  )?.dataset?.nvSupplyLabel;

  if (supplyCallout && supplyData &&
      supplyCallout.textContent.trim() === '') {
    supplyCallout.textContent = supplyData;
  }

  // ── Amazon Button URL Validation ──
  // Ensure Amazon buttons have valid URLs
  const amazonBtns = document.querySelectorAll(
    '.nv-sticky-atc__amazon-btn, ' +
    '[data-amazon-btn]'
  );

  amazonBtns.forEach(btn => {
    const href = btn.getAttribute('href');
    if (!href || href === '#' || href === '') {
      // Hide broken Amazon buttons
      btn.style.display = 'none';
      console.warn('[NutraVora] Amazon button missing URL:', btn);
    }
  });

  // ── Certification Badges Dynamic Render ──
  // Read certifications from product data attribute
  // and ensure badges are visible
  const certContainer = document.querySelector(
    '.nv-cert-badges, [data-nv-cert-badges]'
  );

  if (certContainer) {
    const badges = certContainer.querySelectorAll(
      '.nv-product-card__badge, .nv-badge'
    );
    if (badges.length === 0) {
      // Render default badges if none exist
      const defaultBadges = [
        'Non-GMO', 'Gluten-Free',
        'Lab Tested', 'GMP Facility'
      ];
      defaultBadges.forEach(label => {
        const badge = document.createElement('span');
        badge.className = 'nv-badge nv-badge--brand';
        badge.textContent = `✓ ${label}`;
        certContainer.appendChild(badge);
      });
    }
  }

  // ── Variant Change Handler ──
  // Sync all dynamic price displays on variant change
  document.addEventListener('variant:change', (e) => {
    const variant = e.detail?.variant;
    if (!variant) return;

    // Update all price displays
    const priceEls = document.querySelectorAll(
      '[data-nv-price-display]'
    );
    priceEls.forEach(el => {
      if (variant.price) {
        el.textContent = formatMoney(variant.price);
      }
    });

    // Update availability displays
    const availEls = document.querySelectorAll(
      '[data-nv-availability]'
    );
    availEls.forEach(el => {
      el.textContent = variant.available
        ? 'In Stock'
        : 'Out of Stock';
      el.dataset.available = variant.available;
    });
  });

  // ── Money Formatter ──
  function formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(cents / 100);
  }

})();
