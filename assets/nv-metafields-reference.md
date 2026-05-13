# NutraVora Product Metafield Reference
## Namespace: custom

All metafields use namespace: `custom`

### Required Metafields (set per product)

| Key | Type | Description | Example |
|-----|------|-------------|---------|
| amazon_attribution_link | url | MAAS attribution URL | https://amzn.to/... |
| supply_label | single_line_text | Supply callout text | "300 Softgels — ~10 Month Supply" |
| rating | single_line_text | Product rating | "4.8" |
| review_count | single_line_text | Review count label | "221+" |

### Optional Metafields

| Key | Type | Description | Example |
|-----|------|-------------|---------|
| shipping_note | single_line_text | Shipping callout | "Prime eligible — fast delivery" |
| hero_subheadline | single_line_text | PDP subheadline | "Dual-botanical immune formula" |
| hero_spotlight | single_line_text | Spotlight text | "Our #1 bestseller" |
| hero_trust_badges | single_line_text | Trust badges | "Non-GMO | Lab Tested | GMP" |
| features_list | multi_line_text | Bullet features | One per line |
| certification_badges | single_line_text | Cert badges | "Non-GMO,Gluten-Free,Lab Tested" |
| bundle_amazon_url | url | Bundle Amazon URL | https://amzn.to/... |

### Setup Instructions

1. Go to Shopify Admin → Settings → Custom data → Products
2. Add each metafield definition above
3. Set values per product in the product editor
4. amazon_attribution_link is REQUIRED for Amazon CTAs to work

### Priority Order for Amazon CTA URL:
1. product.metafields.custom.amazon_attribution_link (per product)
2. section.settings.amazon_fallback_link (theme setting)
3. Button hidden if both empty
