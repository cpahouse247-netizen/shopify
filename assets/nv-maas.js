/**
 * NutraVora MAAS Attribution System
 * Amazon Marketing Attribution & Brand Referral Bonus
 * Premium Supplement Brand - v1.0
 *
 * MAAS URL Format:
 * https://www.amazon.com/dp/[ASIN]?maas_adg_api_id=[ID]
 * &ref_=maas_adg_[CAMPAIGN]_afap_abs&aa_adgroupid=[ID]
 * &aa_campaignid=[ID]&aa_creativeid=[ID]&aa_publisherid=[ID]
 *
 * Brand Referral Bonus: ~10% of qualifying sales
 * Qualifying traffic: must click MAAS link -> purchase within 14 days
 */

(function () {
  'use strict';

  const NV_DEBUG = false;

  // Central registry of all MAAS links by placement.
  // UPDATE THESE with your actual MAAS attribution URLs.
  const NV_MAAS_LINKS = {
    // Homepage placements
    hero_primary: '',
    hero_secondary: '',
    spotlight_cta: '',
    final_cta: '',
    scrolling_bar: '',

    // PDP placements
    pdp_amazon_btn: '',
    pdp_sticky_atc: '',
    pdp_trust_note: '',

    // Collection placements
    collection_card: '',

    // Landing page placements
    lp_hero: '',
    lp_product: '',
    lp_final_cta: '',

    // Footer
    footer_amazon: ''
  };

  const isMaasLink = (url) => {
    if (!url) return false;
    return url.includes('maas_adg') ||
      url.includes('maas_adg_api_id') ||
      url.includes('ref_=maas') ||
      url.includes('aa_adgroupid') ||
      url.includes('aa_campaignid');
  };

  const isAmazonAttributionCandidate = (url) => {
    if (!url) return false;

    try {
      const parsed = new URL(url, window.location.origin);
      const host = parsed.hostname.toLowerCase();

      if (host === 'amzn.to') return true;
      if (!host.endsWith('amazon.com')) return false;
      if (host === 'm.media-amazon.com') return false;
      if (host.includes('images-amazon.com')) return false;

      return true;
    } catch (e) {
      return false;
    }
  };

  const auditMaasLinks = () => {
    const amazonBtns = document.querySelectorAll('[href*="amazon.com"]');

    const report = {
      total: 0,
      withMaas: 0,
      withoutMaas: 0,
      links: []
    };

    amazonBtns.forEach((btn) => {
      const href = btn.getAttribute('href') || '';
      if (!isAmazonAttributionCandidate(href)) return;

      const hasMaas = isMaasLink(href);
      const location = btn.closest('[id]')?.id ||
        btn.closest('section')?.className?.split(' ')[0] ||
        'unknown';
      const label = btn.textContent?.trim().substring(0, 40) || 'No label';

      report.total++;
      if (hasMaas) {
        report.withMaas++;
      } else {
        report.withoutMaas++;
      }

      report.links.push({
        location,
        label,
        hasMaas,
        url: href.substring(0, 80)
      });

      if (NV_DEBUG) {
        btn.style.outline = hasMaas ? '2px solid #00cc44' : '2px solid #ff4444';
        btn.title = hasMaas ? 'MAAS link verified' : 'Missing MAAS attribution';
      }
    });

    if (NV_DEBUG) {
      console.group('[NV MAAS] Attribution Audit');
      console.log(`Total Amazon links: ${report.total}`);
      console.log(`With MAAS: ${report.withMaas}`);
      console.log(`Without MAAS: ${report.withoutMaas}`);
      console.table(report.links);
      console.groupEnd();
    }

    window.__nv_maas_report = report;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'maas_audit', {
        total_amazon_links: report.total,
        maas_links_count: report.withMaas,
        missing_maas_count: report.withoutMaas,
        page_path: window.location.pathname
      });
    }

    return report;
  };

  const preserveUtmParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};

    [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term'
    ].forEach((param) => {
      if (urlParams.has(param)) {
        utmParams[param] = urlParams.get(param);
      }
    });

    if (Object.keys(utmParams).length === 0) return;

    try {
      const existing = JSON.parse(sessionStorage.getItem('nv_utm') || '{}');
      const merged = { ...existing, ...utmParams };
      sessionStorage.setItem('nv_utm', JSON.stringify(merged));
    } catch (e) {}

    if (NV_DEBUG) {
      console.log('[NV MAAS] UTM params captured:', utmParams);
    }
  };

  const trackMaasClicks = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[href*="amazon.com"], [href*="amzn.to"]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      if (!isAmazonAttributionCandidate(href)) return;

      const hasMaas = isMaasLink(href);

      let utmContext = {};
      try {
        utmContext = JSON.parse(sessionStorage.getItem('nv_utm') || '{}');
      } catch (e) {}

      const section = link.closest('section, [class*="nv-"]');
      const placement = section?.id ||
        section?.className?.split(' ')[0] ||
        'unknown';
      const productData = window.__nv_product_data;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = docHeight > 0
        ? Math.round((window.scrollY / docHeight) * 100)
        : 0;

      const eventData = {
        has_maas_attribution: hasMaas,
        amazon_url: href.substring(0, 100),
        placement_id: placement,
        page_path: window.location.pathname,
        page_type: document.body?.dataset?.pageType || window.__nv_page_type || 'unknown',
        product_id: productData?.id,
        product_title: productData?.title,
        product_sku: productData?.sku,
        referrer_source: utmContext.utm_source,
        referrer_medium: utmContext.utm_medium,
        referrer_campaign: utmContext.utm_campaign,
        session_scroll_depth: scrollDepth
      };

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'maas_link_click', eventData);
      }

      if (NV_DEBUG) {
        console.log('[NV MAAS] Click tracked:', eventData);
      }
    });
  };

  const injectMaasLinks = () => {
    const productMaasUrl = window.__nv_maas_product_url || '';
    const storeMaasUrl = window.__nv_maas_store_url || '';

    const placements = {
      '.nv-image-hero-banner .nv-btn--amazon': 'hero_primary',
      '.nv-featured-spotlight .nv-btn--amazon': 'spotlight_cta',
      '.nv-final-cta .nv-btn--amazon': 'final_cta',
      '.nv-sticky-atc__amazon-btn': 'pdp_sticky_atc',
      '.nv-footer__amazon-link': 'footer_amazon',
      '.nv-lp-hero .nv-btn--amazon': 'lp_hero',
      '.nv-lp-final-cta .nv-btn--amazon': 'lp_final_cta'
    };

    Object.entries(placements).forEach(([selector, key]) => {
      const el = document.querySelector(selector);
      if (!el) return;

      const currentHref = el.getAttribute('href') || '';
      const registryUrl = NV_MAAS_LINKS[key];
      const fallbackUrl = key.startsWith('pdp_') ? productMaasUrl : storeMaasUrl;
      const maasUrl = registryUrl || fallbackUrl;

      if (maasUrl && !isMaasLink(currentHref)) {
        el.setAttribute('href', maasUrl);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');

        if (NV_DEBUG) {
          console.log(`[NV MAAS] Injected ${key}:`, maasUrl);
        }
      }
    });
  };

  const runHealthCheck = () => {
    if (!NV_DEBUG) return;

    setTimeout(() => {
      const report = window.__nv_maas_report;
      if (!report) return;

      if (report.withoutMaas > 0) {
        console.warn(
          `[NV MAAS] ${report.withoutMaas} Amazon button(s) missing MAAS attribution. ` +
          'Update NV_MAAS_LINKS registry or product metafields to fix.'
        );
      } else {
        console.log('[NV MAAS] All Amazon buttons have MAAS attribution.');
      }
    }, 2000);
  };

  const init = () => {
    preserveUtmParams();
    injectMaasLinks();
    trackMaasClicks();

    window.addEventListener('load', () => {
      auditMaasLinks();
      runHealthCheck();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
