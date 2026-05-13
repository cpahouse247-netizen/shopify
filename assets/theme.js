document.addEventListener('DOMContentLoaded', () => {
  // Disclosure toggles
  document.querySelectorAll('[data-disclosure-toggle]').forEach(t => {
    t.addEventListener('click', () => {
      const target = document.getElementById(t.getAttribute('aria-controls'));
      const expanded = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!expanded));
      if (target) target.classList.toggle('hide');
    });
  });
  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });

  document.querySelectorAll('[data-nv-tabs]').forEach(section => {
    const tabs = Array.from(section.querySelectorAll('[data-tab-target]'));
    const panels = Array.from(section.querySelectorAll('[data-tab-panel]'));
    if (!tabs.length || !panels.length) return;

    const activate = (tabKey) => {
      tabs.forEach(tab => {
        const isActive = tab.getAttribute('data-tab-target') === tabKey;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      panels.forEach(panel => {
        panel.hidden = panel.getAttribute('data-tab-panel') !== tabKey;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.getAttribute('data-tab-target')));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activate(tabs[nextIndex].getAttribute('data-tab-target'));
      });
    });

    activate(section.getAttribute('data-nv-tabs-default') || tabs[0].getAttribute('data-tab-target'));
  });

  document.querySelectorAll('[data-nv-quick-view]').forEach((quickView) => {
    const panel = quickView.querySelector('.nv-quick-view__panel');
    const image = quickView.querySelector('[data-nv-quick-view-image]');
    const vendor = quickView.querySelector('[data-nv-quick-view-vendor]');
    const title = quickView.querySelector('[data-nv-quick-view-title]');
    const rating = quickView.querySelector('[data-nv-quick-view-rating]');
    const price = quickView.querySelector('[data-nv-quick-view-price]');
    const compare = quickView.querySelector('[data-nv-quick-view-compare]');
    const description = quickView.querySelector('[data-nv-quick-view-description]');
    const descriptionToggle = quickView.querySelector('[data-nv-quick-view-description-toggle]');
    const actions = quickView.querySelector('[data-nv-quick-view-actions]');
    const prevImage = quickView.querySelector('[data-nv-quick-view-prev]');
    const nextImage = quickView.querySelector('[data-nv-quick-view-next]');
    let lastQuickViewFocus = null;
    let quickViewImages = [];
    let quickViewImageIndex = 0;
    let quickViewImageAlt = '';
    let quickViewDescriptionFull = '';
    let quickViewDescriptionExpanded = false;

    const quickViewEscape = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));

    const setQuickViewImage = () => {
      if (image) {
        image.src = quickViewImages[quickViewImageIndex] || '';
        image.alt = quickViewImageAlt;
      }

      const hasGallery = quickViewImages.length > 1;
      [prevImage, nextImage].forEach((button) => {
        if (!button) return;
        button.hidden = !hasGallery;
        button.disabled = !hasGallery;
      });
    };

    const moveQuickViewImage = (direction) => {
      if (quickViewImages.length < 2) return;
      quickViewImageIndex = (quickViewImageIndex + direction + quickViewImages.length) % quickViewImages.length;
      setQuickViewImage();
    };

    const setQuickViewDescription = () => {
      if (!description) return;
      const shouldClamp = quickViewDescriptionFull.length > 150;
      description.textContent = shouldClamp && !quickViewDescriptionExpanded
        ? `${quickViewDescriptionFull.slice(0, 150).trim()}...`
        : quickViewDescriptionFull;
      if (descriptionToggle) {
        descriptionToggle.hidden = !shouldClamp;
        descriptionToggle.textContent = quickViewDescriptionExpanded ? 'Show less' : 'Show more';
      }
    };

    const openQuickView = (trigger) => {
      if (!trigger || !panel) return;
      lastQuickViewFocus = document.activeElement;

      const dataset = trigger.dataset;
      const productTitle = dataset.productTitle || 'NutraVora product';
      const productUrl = dataset.productUrl || trigger.getAttribute('href') || '#';
      const isAvailable = dataset.productAvailable === 'true';
      const isOnSale = dataset.productOnSale === 'true';

      quickViewImageAlt = productTitle;
      quickViewImages = String(dataset.productImages || dataset.productImage || '')
        .split('||')
        .map((source) => source.trim())
        .filter(Boolean);
      if (!quickViewImages.length && dataset.productImage) quickViewImages = [dataset.productImage];
      quickViewImageIndex = 0;
      setQuickViewImage();

      if (vendor) vendor.textContent = dataset.productVendor || 'NutraVora';
      if (title) title.textContent = productTitle;
      if (rating) {
        const sourceRating = trigger.closest('article')?.querySelector('.product-card__areviews-rating, .nv-health-goals__rating-source');
        rating.innerHTML = sourceRating?.innerHTML || (dataset.productId
          ? `<div class="areviews_product_item areviews_stars${quickViewEscape(dataset.productId)}" data-product-id="${quickViewEscape(dataset.productId)}"></div>`
          : '');
        rating.hidden = !rating.innerHTML.trim();
      }
      if (price) price.textContent = dataset.productPrice || '';
      if (compare) {
        compare.textContent = isOnSale ? (dataset.productCompare || '') : '';
        compare.hidden = !isOnSale || !dataset.productCompare;
      }
      if (description) {
        quickViewDescriptionFull = dataset.productDescription || 'A premium NutraVora formula designed for simple daily wellness routines.';
        quickViewDescriptionExpanded = false;
        setQuickViewDescription();
      }
      if (actions) {
        const variantId = dataset.productVariantId || '';
        const escapedVariantId = quickViewEscape(variantId);
        const escapedProductUrl = quickViewEscape(productUrl);
        const addAction = isAvailable && variantId
          ? `<form action="/cart/add" method="post" class="nv-quick-view__form">
              <input type="hidden" name="id" value="${escapedVariantId}">
              <button type="submit" class="nv-quick-view__button nv-quick-view__button--primary" data-nv-cta="add-to-cart">Add to cart</button>
            </form>`
          : `<button type="button" class="nv-quick-view__button nv-quick-view__button--disabled" disabled>Unavailable</button>`;
        actions.innerHTML = `
          ${addAction}
          <a href="${escapedProductUrl}" class="nv-quick-view__button nv-quick-view__button--secondary">View full details</a>
        `;
      }

      quickView.classList.add('is-open');
      quickView.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nv-quick-view-open');
      setTimeout(() => panel.focus(), 20);
    };

    const closeQuickView = () => {
      quickView.classList.remove('is-open');
      quickView.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nv-quick-view-open');
      if (lastQuickViewFocus && typeof lastQuickViewFocus.focus === 'function') {
        lastQuickViewFocus.focus();
      }
    };

    quickView.querySelectorAll('[data-nv-quick-view-close]').forEach((button) => {
      button.addEventListener('click', closeQuickView);
    });

    if (prevImage) prevImage.addEventListener('click', () => moveQuickViewImage(-1));
    if (nextImage) nextImage.addEventListener('click', () => moveQuickViewImage(1));
    if (descriptionToggle) {
      descriptionToggle.addEventListener('click', () => {
        quickViewDescriptionExpanded = !quickViewDescriptionExpanded;
        setQuickViewDescription();
      });
    }

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-nv-quick-view-trigger]');
      if (!trigger) return;
      event.preventDefault();
      openQuickView(trigger);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && quickView.classList.contains('is-open')) {
        closeQuickView();
      }
      if (!quickView.classList.contains('is-open')) return;
      if (event.key === 'ArrowLeft') moveQuickViewImage(-1);
      if (event.key === 'ArrowRight') moveQuickViewImage(1);
    });
  });

  const drawerShell = document.querySelector('[data-nv-cart-drawer]');
  if (!drawerShell) return;

  const drawer = drawerShell.querySelector('.nv-cart-drawer');
  const cartItems = drawerShell.querySelector('[data-nv-cart-items]');
  const cartBody = drawerShell.querySelector('[data-nv-cart-body]');
  const cartFooter = drawerShell.querySelector('[data-nv-cart-footer]');
  const cartCountEls = drawerShell.querySelectorAll('[data-nv-cart-count]');
  const cartSubtotalEls = drawerShell.querySelectorAll('[data-nv-cart-subtotal], [data-nv-cart-checkout-total]');
  const cartDiscounts = drawerShell.querySelector('[data-nv-cart-discounts]');
  const shippingBlock = drawerShell.querySelector('[data-nv-cart-shipping]');
  const shippingText = drawerShell.querySelector('[data-nv-cart-shipping-text]');
  const shippingProgress = drawerShell.querySelector('[data-nv-cart-shipping-progress]');
  const openTriggers = document.querySelectorAll('[data-nv-cart-drawer-open]');
  const closeTriggers = drawerShell.querySelectorAll('[data-nv-cart-drawer-close]');
  const freeShippingThreshold = Number(drawerShell.getAttribute('data-free-shipping-threshold')) || 0;
  const currencyCode = drawerShell.getAttribute('data-currency-code') || 'USD';
  const cartUrl = drawerShell.getAttribute('data-cart-url') || '/cart';
  const cartAddUrl = drawerShell.getAttribute('data-cart-add-url') || '/cart/add.js';
  const cartChangeUrl = drawerShell.getAttribute('data-cart-change-url') || '/cart/change.js';
  const cartJsonUrl = drawerShell.getAttribute('data-cart-json-url') || '/cart.js';
  const productRecommendationsUrl = drawerShell.getAttribute('data-product-recommendations-url') || '/recommendations/products.json';
  const upsellTrack = drawerShell.querySelector('[data-nv-cart-upsell-track]');
  const upsellCarousel = drawerShell.querySelector('[data-nv-cart-upsell-carousel]');
  let lastFocusedElement = null;
  let cartRequest = Promise.resolve();
  let lastRecommendationsProductId = null;
  let upsellAutoTimer = null;
  let upsellResumeTimer = null;

  const formatMoney = (cents) => {
    const amount = (Number(cents) || 0) / 100;
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      return window.Shopify.formatMoney(cents, drawerShell.getAttribute('data-money-format') || undefined);
    }
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount);
    } catch (error) {
      return '$' + amount.toFixed(2);
    }
  };

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

  const updateHeaderBadges = (count) => {
    document.querySelectorAll('[data-nv-cart-badge]').forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });

    document.querySelectorAll('[data-nv-cart-drawer-open]').forEach((trigger) => {
      const existingBadge = trigger.querySelector('[data-nv-cart-badge]');
      if (existingBadge || count === 0) return;

      const badge = document.createElement('span');
      badge.setAttribute('data-nv-cart-badge', '');
      badge.setAttribute('aria-hidden', 'true');
      badge.className = trigger.classList.contains('custom-header__bottom-nav-item')
        ? 'custom-header__bottom-nav-badge'
        : 'custom-header__cart-count';
      badge.textContent = count;
      trigger.appendChild(badge);
    });
  };

  const renderDiscounts = (cart) => {
    if (!cartDiscounts) return;
    const discountsByTitle = new Map();

    const addDiscount = (title, amount) => {
      const normalizedTitle = String(title || 'Discounts').trim() || 'Discounts';
      const key = normalizedTitle.toLowerCase();
      const current = discountsByTitle.get(key) || { title: normalizedTitle, amount: 0 };
      current.amount += Number(amount) || 0;
      discountsByTitle.set(key, current);
    };

    (cart.cart_level_discount_applications || []).forEach((discount) => {
      addDiscount(discount.title, discount.total_allocated_amount);
    });

    (cart.items || []).forEach((item) => {
      (item.line_level_discount_allocations || []).forEach((discount) => {
        const title = discount.discount_application && discount.discount_application.title
          ? discount.discount_application.title
          : 'Discounts';
        addDiscount(title, discount.amount);
      });
    });

    const rows = Array.from(discountsByTitle.values()).filter((row) => row.amount > 0);

    if (!rows.length && cart.total_discount > 0) {
      rows.push({ title: 'Discounts', amount: cart.total_discount });
    }

    cartDiscounts.innerHTML = rows.map((row) => `
      <div class="nv-cart-drawer__discount-row">
        <span><small>Discounts</small>${escapeHtml(row.title)}</span>
        <strong>-${formatMoney(row.amount)}</strong>
      </div>
    `).join('');
  };

  const updateFreeShipping = (cart) => {
    if (!shippingBlock || !shippingText || !shippingProgress || freeShippingThreshold <= 0) return;

    const total = Number(cart.total_price) || 0;
    const remaining = Math.max(0, freeShippingThreshold - total);
    const progress = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

    shippingText.textContent = remaining > 0
      ? `You're ${formatMoney(remaining)} away from free shipping.`
      : 'Your order qualifies for free shipping.';
    shippingProgress.style.width = progress + '%';
  };

  const renderCartItem = (item, index) => {
    const line = index + 1;
    const title = escapeHtml(item.product_title || item.title);
    const variantTitle = item.variant_title && item.variant_title !== 'Default Title'
      ? `<p class="nv-cart-drawer__variant">${escapeHtml(item.variant_title)}</p>`
      : '';
    const sellingPlan = item.selling_plan_allocation && item.selling_plan_allocation.selling_plan
      ? `<p class="nv-cart-drawer__variant">${escapeHtml(item.selling_plan_allocation.selling_plan.name)}</p>`
      : '';
    const image = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${title}" class="nv-cart-drawer__image" loading="lazy">`
      : `<div class="nv-cart-drawer__image nv-cart-drawer__image--placeholder"></div>`;
    const savings = item.original_line_price && item.original_line_price !== item.final_line_price
      ? `<span class="nv-cart-drawer__compare">${formatMoney(item.original_line_price)}</span><span class="nv-cart-drawer__saving">Save ${formatMoney(item.original_line_price - item.final_line_price)}</span>`
      : '';

    return `
      <article class="nv-cart-drawer__item" data-cart-line="${line}" data-cart-key="${escapeHtml(item.key)}">
        <a href="${escapeHtml(item.url)}" class="nv-cart-drawer__media" aria-label="${title}">${image}</a>
        <div class="nv-cart-drawer__content">
          <div class="nv-cart-drawer__line-top">
            <div class="nv-cart-drawer__text">
              <a class="nv-cart-drawer__title" href="${escapeHtml(item.url)}">${title}</a>
              ${variantTitle}
              ${sellingPlan}
            </div>
            <button type="button" class="nv-cart-drawer__remove" data-cart-remove data-line="${line}" aria-label="Remove ${title}">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6.75V5.5c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1.25m-8.25 0h10.5m-9.5 0 .62 11.25c.04.83.73 1.5 1.56 1.5h4.14c.83 0 1.52-.67 1.56-1.5l.62-11.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.45"/></svg>
            </button>
          </div>
          <div class="nv-cart-drawer__price-row">${savings}<strong>${formatMoney(item.final_line_price)}</strong></div>
          <div class="nv-cart-drawer__line-bottom">
            <div class="nv-cart-drawer__qty" data-cart-stepper>
              <button type="button" data-cart-qty-change="-1" data-line="${line}" aria-label="Decrease quantity for ${title}"><span aria-hidden="true">-</span></button>
              <input class="cart-qty-input" value="${item.quantity}" type="number" min="0" inputmode="numeric" data-cart-qty-input data-line="${line}" aria-label="Quantity for ${title}">
              <button type="button" data-cart-qty-change="1" data-line="${line}" aria-label="Increase quantity for ${title}"><span aria-hidden="true">+</span></button>
            </div>
          </div>
        </div>
      </article>
    `;
  };

  const normalizeProductUrl = (product) => {
    if (product.url) return product.url;
    if (product.handle) return `/products/${product.handle}`;
    return '#';
  };

  const getProductVariant = (product) => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    return variants.find((variant) => variant.available) || variants[0] || product;
  };

  const renderUpsellCard = (product) => {
    const variant = getProductVariant(product);
    if (!variant || !variant.id) return '';

    const productTitle = escapeHtml(product.title);
    const productUrl = escapeHtml(normalizeProductUrl(product));
    const productImage = product.featured_image || product.image || (Array.isArray(product.images) ? product.images[0] : '');
    const price = Number(variant.price || product.price || 0);
    const compareAt = Number(variant.compare_at_price || product.compare_at_price || 0);
    const imageMarkup = productImage
      ? `<img src="${escapeHtml(productImage)}" alt="${productTitle}" class="nv-cart-drawer__upsell-image" loading="lazy">`
      : `<div class="nv-cart-drawer__upsell-image nv-cart-drawer__upsell-image--placeholder"></div>`;
    const compareMarkup = compareAt > price ? `<s>${formatMoney(compareAt)}</s>` : '';

    return `
      <article class="nv-cart-drawer__upsell" data-upsell-product-id="${product.id}">
        <a href="${productUrl}" class="nv-cart-drawer__upsell-media" aria-label="${productTitle}">
          ${imageMarkup}
        </a>
        <div class="nv-cart-drawer__upsell-info">
          <a href="${productUrl}">${productTitle}</a>
          <div class="nv-cart-drawer__upsell-price">
            ${compareMarkup}
            <span>${formatMoney(price)}</span>
          </div>
          <div class="nv-cart-drawer__upsell-rating" aria-label="Product reviews">
            <div class="areviews_product_item areviews_stars${product.id}" data-product-id="${product.id}"></div>
          </div>
        </div>
        <button
          type="button"
          class="nv-cart-drawer__upsell-add"
          data-nv-drawer-upsell-add
          data-variant-id="${variant.id}"
          ${variant.available === false ? 'disabled aria-disabled="true"' : ''}
        >
          + Add
        </button>
      </article>
    `;
  };

  const refreshAreviewsBadges = () => {
    window.setTimeout(() => {
      document.dispatchEvent(new CustomEvent('areviews:refresh'));
      document.dispatchEvent(new CustomEvent('nv:areviews:refresh'));

      [
        'AreviewsAppInit',
        'areviewsAppInit',
        'areviewsInit',
        'AREVIEWS_INIT',
        'loadAreviews',
        'loadAreviewsProductItem',
        'initAreviewsProductItem'
      ].forEach((method) => {
        if (typeof window[method] === 'function') {
          try {
            window[method]();
          } catch (error) {
            // Ignore third-party widget refresh failures.
          }
        }
      });

      if (window.jQuery) {
        window.jQuery(document).trigger('areviews:refresh');
      }
    }, 80);
  };

  const refreshRecommendations = (cart) => {
    if (!upsellTrack || !cart.items || !cart.items.length) return Promise.resolve();

    const firstProductId = cart.items[0] && cart.items[0].product_id;
    if (!firstProductId || String(firstProductId) === String(lastRecommendationsProductId)) return Promise.resolve();
    lastRecommendationsProductId = firstProductId;

    const url = new URL(productRecommendationsUrl, window.location.origin);
    url.searchParams.set('product_id', firstProductId);
    url.searchParams.set('limit', '8');
    url.searchParams.set('intent', 'related');

    return fetch(url.toString(), { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load recommendations');
        return response.json();
      })
      .then((data) => {
        const cartProductIds = new Set((cart.items || []).map((item) => String(item.product_id)));
        const products = (data.products || [])
          .filter((product) => product && !cartProductIds.has(String(product.id)))
          .slice(0, 8);
        const markup = products.map(renderUpsellCard).filter(Boolean).join('');
        if (markup) {
          upsellTrack.innerHTML = markup;
          refreshAreviewsBadges();
        }
      })
      .catch(() => {});
  };

  const updateUpsells = (cart) => {
    const upsellSection = drawerShell.querySelector('[data-nv-cart-upsells]');
    if (!upsellSection) return;

    if (!cart.items || !cart.items.length) {
      upsellSection.hidden = true;
      return;
    }

    const cartProductIds = new Set((cart.items || []).map((item) => String(item.product_id)));
    let visibleCount = 0;
    drawerShell.querySelectorAll('[data-upsell-product-id]').forEach((card) => {
      const isInCart = cartProductIds.has(card.getAttribute('data-upsell-product-id'));
      card.hidden = isInCart;
      if (!isInCart) visibleCount += 1;
    });
    upsellSection.hidden = visibleCount === 0;
    refreshAreviewsBadges();
    startUpsellAuto();
  };

  const getVisibleUpsellCards = () => {
    if (!upsellTrack) return [];
    return Array.from(upsellTrack.querySelectorAll('[data-upsell-product-id]')).filter((card) => !card.hidden);
  };

  const scrollUpsells = (direction = 1) => {
    const cards = getVisibleUpsellCards();
    if (!upsellTrack || cards.length < 2) return;

    const trackLeft = upsellTrack.getBoundingClientRect().left;
    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const closest = cards[closestIndex];
      const cardLeft = card.getBoundingClientRect().left - trackLeft + upsellTrack.scrollLeft;
      const closestLeft = closest.getBoundingClientRect().left - trackLeft + upsellTrack.scrollLeft;
      return Math.abs(cardLeft - upsellTrack.scrollLeft) < Math.abs(closestLeft - upsellTrack.scrollLeft)
        ? index
        : closestIndex;
    }, 0);
    const nextIndex = (currentIndex + direction + cards.length) % cards.length;
    const nextLeft = cards[nextIndex].getBoundingClientRect().left - trackLeft + upsellTrack.scrollLeft;
    upsellTrack.scrollTo({ left: nextLeft, behavior: 'smooth' });
  };

  const handleUpsellNavClick = (direction) => {
    pauseUpsellAuto();
    scrollUpsells(direction);
  };

  const stopUpsellAuto = () => {
    if (upsellAutoTimer) window.clearInterval(upsellAutoTimer);
    if (upsellResumeTimer) window.clearTimeout(upsellResumeTimer);
    upsellAutoTimer = null;
    upsellResumeTimer = null;
  };

  const startUpsellAuto = () => {
    stopUpsellAuto();
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!upsellTrack || reduceMotion || getVisibleUpsellCards().length < 2) return;
    upsellAutoTimer = window.setInterval(() => {
      if (!drawerShell.classList.contains('is-open')) return;
      scrollUpsells(1);
    }, 5200);
  };

  const pauseUpsellAuto = () => {
    stopUpsellAuto();
    upsellResumeTimer = window.setTimeout(startUpsellAuto, 9000);
  };

  const renderCart = (cart) => {
    const itemCount = Number(cart.item_count) || 0;
    const total = formatMoney(cart.total_price);

    cartCountEls.forEach((element) => {
      element.textContent = itemCount;
    });
    cartSubtotalEls.forEach((element) => {
      element.textContent = total;
    });
    updateHeaderBadges(itemCount);
    updateFreeShipping(cart);
    renderDiscounts(cart);
    updateUpsells(cart);
    refreshRecommendations(cart).then(() => updateUpsells(cart));

    const checkoutButton = cartFooter && cartFooter.querySelector('.nv-cart-drawer__checkout');
    if (checkoutButton) {
      checkoutButton.disabled = itemCount === 0;
      checkoutButton.setAttribute('aria-disabled', String(itemCount === 0));
    }

    if (!cartItems) return;
    if (itemCount === 0) {
      cartItems.innerHTML = `
        <div class="nv-cart-drawer__empty" data-nv-cart-empty>
          <h3>Your cart is empty</h3>
          <p>Choose a clinical wellness formula to start your NutraVora routine.</p>
          <a class="btn" href="${escapeHtml(cartUrl.replace(/\/cart$/, '/collections/all'))}">Continue shopping</a>
        </div>
      `;
      return;
    }

    cartItems.innerHTML = (cart.items || []).map(renderCartItem).join('');
  };

  const fetchCart = () => fetch(cartJsonUrl, { headers: { Accept: 'application/json' } }).then((response) => {
    if (!response.ok) throw new Error('Unable to load cart');
    return response.json();
  });

  const refreshCart = () => fetchCart().then((cart) => {
    renderCart(cart);
    return cart;
  });

  const queueCartRequest = (requestFactory) => {
    cartRequest = cartRequest
      .catch(() => {})
      .then(requestFactory)
      .then((cart) => {
        renderCart(cart);
        return cart;
      });
    return cartRequest;
  };

  const openDrawer = () => {
    lastFocusedElement = document.activeElement;
    drawerShell.classList.add('is-open');
    drawerShell.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nv-cart-drawer-open');
    refreshCart().catch(() => {});
    window.setTimeout(() => {
      if (drawer) drawer.focus();
    }, 60);
  };

  const closeDrawer = () => {
    drawerShell.classList.remove('is-open');
    drawerShell.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nv-cart-drawer-open');
    stopUpsellAuto();
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  openTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openDrawer();
    });
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (event) => {
    if (!drawerShell.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }

    if (event.key !== 'Tab' || !drawer) return;
    const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (cartBody) {
    cartBody.addEventListener('click', (event) => {
      const upsellPrev = event.target.closest('[data-nv-cart-upsell-prev]');
      const upsellNext = event.target.closest('[data-nv-cart-upsell-next]');
      const qtyButton = event.target.closest('[data-cart-qty-change]');
      const removeButton = event.target.closest('[data-cart-remove]');
      const upsellButton = event.target.closest('[data-nv-drawer-upsell-add]');

      if (upsellPrev || upsellNext) {
        event.preventDefault();
        pauseUpsellAuto();
        scrollUpsells(upsellNext ? 1 : -1);
        return;
      }

      if (qtyButton) {
        const line = Number(qtyButton.getAttribute('data-line'));
        const delta = Number(qtyButton.getAttribute('data-cart-qty-change')) || 0;
        const input = cartBody.querySelector(`[data-cart-qty-input][data-line="${line}"]`);
        const nextQuantity = Math.max(0, (Number(input && input.value) || 0) + delta);
        if (input) input.value = nextQuantity;
        queueCartRequest(() => fetch(cartChangeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ line, quantity: nextQuantity })
        }).then((response) => response.json()));
      }

      if (removeButton) {
        const line = Number(removeButton.getAttribute('data-line'));
        queueCartRequest(() => fetch(cartChangeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ line, quantity: 0 })
        }).then((response) => response.json()));
      }

      if (upsellButton) {
        const id = upsellButton.getAttribute('data-variant-id');
        upsellButton.disabled = true;
        queueCartRequest(() => fetch(cartAddUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id, quantity: 1 })
        }).then((response) => {
          if (!response.ok) throw new Error('Unable to add upsell');
          return fetchCart();
        })).finally(() => {
          upsellButton.disabled = false;
        });
      }
    });

    cartBody.addEventListener('change', (event) => {
      const input = event.target.closest('[data-cart-qty-input]');
      if (!input) return;

      const line = Number(input.getAttribute('data-line'));
      const quantity = Math.max(0, Number(input.value) || 0);
      input.value = quantity;
      queueCartRequest(() => fetch(cartChangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity })
      }).then((response) => response.json()));
    });
  }

  if (upsellCarousel) {
    const prevButton = upsellCarousel.querySelector('[data-nv-cart-upsell-prev]');
    const nextButton = upsellCarousel.querySelector('[data-nv-cart-upsell-next]');

    if (prevButton) {
      prevButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleUpsellNavClick(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleUpsellNavClick(1);
      });
    }

    ['pointerdown', 'wheel', 'focusin'].forEach((eventName) => {
      upsellCarousel.addEventListener(eventName, pauseUpsellAuto, { passive: true });
    });
    upsellCarousel.addEventListener('mouseenter', stopUpsellAuto);
    upsellCarousel.addEventListener('mouseleave', startUpsellAuto);
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const action = form.getAttribute('action') || '';
    if (!action.includes('/cart/add')) return;
    if (form.closest('[data-nv-cart-drawer]')) return;

    event.preventDefault();
    const submitter = event.submitter;
    if (submitter) submitter.setAttribute('aria-busy', 'true');

    fetch(cartAddUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    }).then((response) => {
      if (!response.ok) throw new Error('Unable to add item');
      openDrawer();
      return refreshCart();
    }).catch(() => {
      HTMLFormElement.prototype.submit.call(form);
    }).finally(() => {
      if (submitter) submitter.removeAttribute('aria-busy');
    });
  });

  document.addEventListener('cart:refresh', () => {
    openDrawer();
    refreshCart().catch(() => {});
  });
  window.addEventListener('cart:refresh', () => {
    openDrawer();
    refreshCart().catch(() => {});
  });
});
