# NutraVora MAAS Attribution Reference
## Amazon Marketing Attribution System (MAAS)

### What is MAAS?
Amazon Attribution (MAAS) lets you track which external traffic sources drive Amazon sales. The Brand Referral Bonus pays ~10% back on qualifying attributed sales.

### MAAS URL Structure
https://www.amazon.com/dp/[ASIN]?maasadg_api_id=[YOUR_API_ID]&ref=maasadg[CAMPAIGN_TAG]_afap_abs&aa_adgroupid=[ADGROUP_ID]&aa_campaignid=[CAMPAIGN_ID]&aa_creativeid=[CREATIVE_ID]&aa_publisherid=[PUBLISHER_ID]

### How to Generate MAAS Links
1. Go to Amazon Seller Central
2. Navigate to: Advertising -> Amazon Attribution
3. Click "Create campaign"
4. Select product (by ASIN)
5. Set publisher: "NutraVora Website"
6. Set channel: Homepage / PDP / Email / etc.
7. Copy generated tracking URL
8. Add to product metafield: custom.amazon_attribution_link

### Required MAAS Links (one per placement)
Create separate MAAS campaigns for each:

| Placement | Campaign Name | Where to Add |
|-----------|--------------|--------------|
| Homepage Hero | NV-Web-Hero | NV_MAAS_LINKS.hero_primary |
| Featured Spotlight | NV-Web-Spotlight | NV_MAAS_LINKS.spotlight_cta |
| Final CTA | NV-Web-FinalCTA | NV_MAAS_LINKS.final_cta |
| PDP Amazon Btn | NV-Web-PDP-[ASIN] | Product metafield |
| Sticky ATC | NV-Web-StickyATC | NV_MAAS_LINKS.pdp_sticky_atc |
| Footer | NV-Web-Footer | NV_MAAS_LINKS.footer_amazon |
| Landing Page | NV-Web-LP | NV_MAAS_LINKS.lp_hero |
| Google Ads LP | NV-Ads-LP | Separate per campaign |

### Brand Referral Bonus Eligibility
- Traffic must come from outside Amazon
- Customer must purchase within 14 days of click
- Bonus: ~10% of qualifying sale value
- Paid as account credit, not cash

### Verification Checklist
Run with NV_DEBUG = true in nv-maas.js:
- Green outline = MAAS link verified
- Red outline = Missing MAAS attribution
- Check browser console for full audit report

### UTM -> MAAS Attribution Chain
For Google Ads traffic:
1. Ad URL: nutravora.com/pages/immune-support?utm_source=google&utm_medium=cpc&utm_campaign=immune-support
2. Landing page: shows MAAS-linked Amazon CTA
3. Customer clicks -> Amazon purchase
4. MAAS records: Google Ads -> Amazon sale
5. Brand Referral Bonus: credited to account
