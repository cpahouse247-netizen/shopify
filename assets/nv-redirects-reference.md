# NutraVora URL Redirects Reference
## Setup in Shopify Admin -> Online Store -> Navigation -> URL Redirects

### Priority Redirects to Create

#### Short URLs -> Full Product URLs
These make sharing and ads easier.

| From (Short) | To (Full Product URL) |
|---|---|
| /oregano | /products/[oregano-handle] |
| /omega3 | /products/[omega3-handle] |
| /pumpkin | /products/[pumpkin-handle] |
| /d3k2 | /products/[d3k2-handle] |
| /immune | /collections/immune-support |
| /wellness | /collections/all |
| /amazon | https://www.amazon.com/stores/NutraVora/... |
| /shop | /collections/all |
| /supplements | /collections/all |

#### Campaign Landing Page Redirects
For Google Ads and email campaigns.

| From | To |
|---|---|
| /immune-support | /pages/immune-support (landing page) |
| /oregano-oil | /pages/oregano-oil (landing page) |
| /sale | /collections/all |
| /new | /collections/all |

#### Legacy URL Redirects
If you've changed product handles.

| From (Old) | To (New) |
|---|---|
| /products/oregano | /products/[new-oregano-handle] |

### How to Add Redirects in Shopify
1. Go to Online Store -> Navigation
2. Click "URL Redirects"
3. Click "Create URL redirect"
4. Enter "Redirect from" (old URL)
5. Enter "Redirect to" (new URL)
6. Save

### Redirect Rules
- Use 301 (permanent) for all product/page redirects
- Shopify automatically uses 301 for all redirects
- Never redirect to a page that also redirects (chain)
- Test all redirects after creating them
