/**
 * NutraVora GA4 Enhanced Ecommerce
 * Tracks full funnel: view -> click -> cart -> purchase
 * Premium Supplement Brand - v1.0
 *
 * SETUP REQUIRED:
 * 1. Replace 'G-XXXXXXXXXX' with your GA4 Measurement ID
 * 2. Ensure gtag.js is loaded via Shopify's Google channel
 *    OR add the gtag snippet to theme.liquid <head>
 */

(function () {
  'use strict';

  const NV_GA4_ID = 'G-XXXXXXXXXX';
  const NV_DEBUG = false;

  const gtag = (...args) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag(...args);
    if (NV_DEBUG) console.log('[NV GA4]', ...args);
  };

  const currency = () =>
    window.Shopify?.currency?.active || 'USD';

  const moneyValue = (cents) => {
    const value = parseInt(cents, 10);
    if (!Number.isFinite(value)) return undefined;
    return (value / 100).toFixed(2);
  };

  const trackProductListViews = () => {
    const productCards = document.querySelectorAll(
      '.nv-product-card[data-product-id][data-product-title]'
    );
    if (productCards.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleItems = [];

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target;
          const productId = card.dataset.productId;
          const productTitle = card.dataset.productTitle;
          const productPrice = card.dataset.productPrice;
          const productSku = card.dataset.productSku;
          const itemIndex = Array.prototype.indexOf.call(productCards, card);

          if (!productId || card._nvTracked) return;
          card._nvTracked = true;

          visibleItems.push({
            item_id: productSku || productId,
            item_name: productTitle || 'Unknown Product',
            item_brand: 'NutraVora',
            item_category: 'Supplements',
            price: productPrice ? moneyValue(productPrice) : undefined,
            index: itemIndex,
            quantity: 1
          });

          observer.unobserve(card);
        });

        if (visibleItems.length > 0) {
          gtag('event', 'view_item_list', {
            item_list_name: document.title,
            items: visibleItems,
            currency: currency()
          });
        }
      },
      { threshold: 0.5 }
    );

    productCards.forEach(card => observer.observe(card));
  };

  const trackProductView = () => {
    if (window.location.pathname.indexOf('/products/') === -1) return;

    const productData = window.__nv_product_data;
    if (!productData) return;

    gtag('event', 'view_item', {
      currency: currency(),
      value: moneyValue(productData.price),
      items: [{
        item_id: productData.sku || String(productData.id),
        item_name: productData.title,
        item_brand: productData.vendor || 'NutraVora',
        item_category: productData.type || 'Supplements',
        price: moneyValue(productData.price),
        quantity: 1
      }]
    });
  };

  const trackProductClick = () => {
    document.addEventListener('click', (event) => {
      const card = event.target.closest('[data-product-id][data-product-title]');
      if (!card) return;

      const link = event.target.closest('a');
      if (!link?.href?.includes('/products/')) return;

      gtag('event', 'select_item', {
        item_list_name: document.title,
        items: [{
          item_id: card.dataset.productSku || card.dataset.productId,
          item_name: card.dataset.productTitle,
          item_brand: 'NutraVora',
          item_category: 'Supplements',
          price: card.dataset.productPrice ? moneyValue(card.dataset.productPrice) : undefined,
          index: 0,
          quantity: 1
        }]
      });
    });
  };

  const trackAddToCart = () => {
    const productData = window.__nv_product_data;
    if (!productData) return;

    const forms = document.querySelectorAll(
      'form[action="/cart/add"], form[action*="/cart/add"]'
    );

    forms.forEach(form => {
      form.addEventListener('submit', () => {
        const qtyInput = form.querySelector('[name="quantity"]');
        const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

        gtag('event', 'add_to_cart', {
          currency: currency(),
          value: moneyValue(productData.price * qty),
          items: [{
            item_id: productData.sku || String(productData.id),
            item_name: productData.title,
            item_brand: productData.vendor || 'NutraVora',
            item_category: productData.type || 'Supplements',
            price: moneyValue(productData.price),
            quantity: qty
          }]
        });
      });
    });
  };

  const trackAmazonClicks = () => {
    document.addEventListener('click', (event) => {
      const amazonBtn = event.target.closest(
        '[href*="amazon.com"], ' +
        '.nv-btn--amazon, ' +
        '.nv-sticky-atc__amazon-btn, ' +
        '.nv-footer__amazon-link'
      );
      if (!amazonBtn) return;

      const href = amazonBtn.getAttribute('href') || '';
      const isMaas = href.includes('maas') ||
        href.includes('attribution') ||
        href.includes('tag=');
      const location = amazonBtn.closest('section')?.id || 'unknown';

      gtag('event', 'amazon_cta_click', {
        cta_location: location,
        cta_label: amazonBtn.textContent?.trim().substring(0, 50),
        is_maas_link: isMaas,
        page_path: window.location.pathname
      });

      gtag('event', 'click', {
        event_category: 'outbound',
        event_label: href,
        transport_type: 'beacon'
      });
    });
  };

  const trackCartView = () => {
    document.addEventListener('cart:open', () => {
      gtag('event', 'view_cart', {
        currency: currency()
      });
    });
  };

  const trackBeginCheckout = () => {
    document.addEventListener('click', (event) => {
      const checkoutBtn = event.target.closest(
        '[name="checkout"], ' +
        'a[href="/checkout"], ' +
        '.cart__checkout-button'
      );
      if (!checkoutBtn) return;

      gtag('event', 'begin_checkout', {
        currency: currency()
      });
    });
  };

  const trackScrollDepth = () => {
    const milestones = [25, 50, 75, 90, 100];
    const fired = new Set();

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPct = Math.round((window.scrollY / docHeight) * 100);

      milestones.forEach(milestone => {
        if (scrollPct >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          gtag('event', 'scroll_depth', {
            depth_percentage: milestone,
            page_path: window.location.pathname
          });
        }
      });
    }, { passive: true });
  };

  const trackTimeOnPage = () => {
    const milestones = [30, 60, 120, 300];
    milestones.forEach(seconds => {
      setTimeout(() => {
        gtag('event', 'time_on_page', {
          seconds_on_page: seconds,
          page_path: window.location.pathname
        });
      }, seconds * 1000);
    });
  };

  const trackFaqInteraction = () => {
    document.querySelectorAll(
      '.nv-lp-faq details, ' +
      '[class*="faq"] details'
    ).forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (!detail.open) return;
        const question = detail.querySelector('summary')
          ?.textContent?.trim()
          .substring(0, 100);
        gtag('event', 'faq_open', {
          question,
          page_path: window.location.pathname
        });
      });
    });
  };

  const init = () => {
    trackProductListViews();
    trackProductView();
    trackProductClick();
    trackAddToCart();
    trackAmazonClicks();
    trackCartView();
    trackBeginCheckout();
    trackScrollDepth();
    trackTimeOnPage();
    trackFaqInteraction();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
