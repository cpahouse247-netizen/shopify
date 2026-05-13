import express from 'express';
import { Liquid } from 'liquidjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const engine = new Liquid({
  fileExtname: '.liquid',
  root: __dirname,
  extname: '.liquid'
});

// Mock Shopify data
const mockData = {
  shop: {
    name: 'Nutravora',
    description: 'Premium nutrition and supplement products'
  },
  product: {
    id: 1,
    title: 'Vitamin D3 + K2 Complex',
    vendor: 'Nutravora',
    product_type: 'Supplements',
    handle: 'vitamin-d3-k2',
    description: 'Premium vitamin D3 and K2 complex for bone health and immune support.',
    price: '3999',
    compare_at_price: '4999',
    featured_image: 'https://images.pexels.com/photos/3962670/pexels-photo-3962670.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      { src: 'https://images.pexels.com/photos/3962670/pexels-photo-3962670.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ],
    variants: [
      { id: 1, title: '60 Capsules', price: '3999', available: true }
    ],
    tags: ['vitamin', 'health', 'immunity'],
    metafields: {
      editorial_summary: 'Support your bones and immune system with our premium D3 + K2 formula.',
      dietary_disclaimer: 'These statements have not been evaluated by the FDA.',
      who_should_buy: 'Anyone looking to support bone health and immune function.'
    }
  },
  products: [
    {
      id: 1,
      title: 'Vitamin D3 + K2 Complex',
      handle: 'vitamin-d3-k2',
      featured_image: 'https://images.pexels.com/photos/3962670/pexels-photo-3962670.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '3999'
    },
    {
      id: 2,
      title: 'Omega-3 Fish Oil',
      handle: 'omega-3-fish-oil',
      featured_image: 'https://images.pexels.com/photos/3962669/pexels-photo-3962669.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '2499'
    },
    {
      id: 3,
      title: 'Magnesium Glycinate',
      handle: 'magnesium-glycinate',
      featured_image: 'https://images.pexels.com/photos/3962668/pexels-photo-3962668.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '1999'
    }
  ],
  collections: [
    { id: 1, title: 'Vitamins', handle: 'vitamins' },
    { id: 2, title: 'Minerals', handle: 'minerals' },
    { id: 3, title: 'Supplements', handle: 'supplements' }
  ],
  cart: {
    item_count: 0,
    total_price: 0,
    items: []
  }
};

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/cdn/shop/files', express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/', async (req, res) => {
  try {
    const tpl = await engine.parseFile('layout/theme.liquid');
    const html = await engine.render(tpl, {
      ...mockData,
      template: 'index',
      page_title: 'Nutravora - Premium Supplements',
      content_for_index: await renderSection('sections/nv-home-hero.liquid')
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

app.get('/products/:handle', async (req, res) => {
  try {
    const tpl = await engine.parseFile('layout/theme.liquid');
    const html = await engine.render(tpl, {
      ...mockData,
      template: 'product',
      page_title: mockData.product.title
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

app.get('/collections/:handle', async (req, res) => {
  try {
    const tpl = await engine.parseFile('layout/theme.liquid');
    const html = await engine.render(tpl, {
      ...mockData,
      template: 'collection',
      page_title: 'Collection',
      collection: mockData.collections[0]
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

app.get('/cart', async (req, res) => {
  try {
    const tpl = await engine.parseFile('layout/theme.liquid');
    const html = await engine.render(tpl, {
      ...mockData,
      template: 'cart',
      page_title: 'Shopping Cart'
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

async function renderSection(sectionPath) {
  try {
    if (fs.existsSync(path.join(__dirname, sectionPath))) {
      const tpl = await engine.parseFile(sectionPath);
      return await engine.render(tpl, mockData);
    }
  } catch (err) {
    console.error(`Error rendering section ${sectionPath}:`, err.message);
  }
  return '';
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🎨 Nutravora Theme Preview Server`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`\n✓ Ready to design!\n`);
});
