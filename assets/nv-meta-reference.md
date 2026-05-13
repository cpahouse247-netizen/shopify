# NutraVora Meta Tags Reference
## SEO & Social Sharing System

### Meta Title Formula by Page Type

| Page Type | Formula | Max Length |
|-----------|---------|------------|
| Homepage | NutraVora \| Premium Herbal Supplements... | 60 chars |
| Product | [Product Name] \| NutraVora Premium Supplements | 60 chars |
| Collection | [Collection] Supplements \| NutraVora | 60 chars |
| Article | [Article Title] \| NutraVora Wellness Blog | 60 chars |
| Page | [Page Title] \| NutraVora | 60 chars |

### Meta Description Formula by Page Type

| Page Type | Formula | Max Length |
|-----------|---------|------------|
| Homepage | Brand overview + key benefits + Amazon CTA | 155 chars |
| Product | Product + supply + rating + certifications + Prime | 155 chars |
| Collection | Collection overview + certifications + Prime | 155 chars |
| Article | Article excerpt or first 155 chars of content | 155 chars |

### OG Image Requirements
- Size: 1200 x 630px (1.91:1 ratio)
- Format: JPEG preferred (smaller file size)
- Content: Product on clean background
- Text overlay: Keep minimal (Facebook crops)
- Upload to: Shopify Admin -> Content -> Files

### Product Meta Enrichment Metafields
Set these per product for best SEO:

| Metafield | Purpose | Example |
|-----------|---------|---------|
| custom.meta_description | Custom meta desc | "Oil of Oregano..." |
| custom.asin | Amazon ASIN | "B0XXXXXXXXX" |
| custom.supply_label | Supply callout | "300 Softgels" |
| custom.rating | Star rating | "4.8" |
| custom.review_count | Review count | "221+" |

### Robots Directives Applied
- Homepage: index, follow
- Product pages: index, follow
- Collection pages: index, follow
- Tagged collections: noindex, follow
- Search results: noindex, nofollow
- Account/Cart/Checkout: noindex, nofollow

### Twitter Card Type
Using: summary_large_image
- Shows large image preview in tweets
- Best for product/supplement content
- Requires 1200 x 630px image

### Verification Tags (add manually)
After verifying in respective tools, add to layout/theme.liquid `<head>`:

Google Search Console:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE">
```

Pinterest:
```html
<meta name="p:domain_verify" content="YOUR_VERIFICATION_CODE">
```
