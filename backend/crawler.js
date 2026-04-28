const fs = require('fs/promises');
const path = require('path');
const cheerio = require('cheerio');
const { DATA_DIR, RAW_PRODUCTS_PATH } = require('./config/env');

const HTML_PATH = path.join(__dirname, 'sample-products.html');

function parseUnitPrice(price, unit) {
  const match = unit.match(/([\d.]+)\s*(kg|g|ml|l|매|개|팩|롤)/i);
  if (!match) return null;

  const qty = parseFloat(match[1]);
  const label = match[2].toLowerCase();

  // 기준 단위로 환산 (g, ml 기준)
  const toBase = { kg: 1000, g: 1, l: 1000, ml: 1, 매: 1, 개: 1, 팩: 1, 롤: 1 };
  const base = toBase[label] ?? 1;
  const totalBase = qty * base;

  return {
    unitPrice: Math.round(price / totalBase),       // 원/기준단위
    unitLabel: ['kg', 'g'].includes(label) ? '원/g' : ['l', 'ml'].includes(label) ? '원/ml' : `원/${label}`,
  };
}

async function crawlProducts() {
  const html = await fs.readFile(HTML_PATH, 'utf8');
  const $ = cheerio.load(html);
  const parsedAt = new Date().toISOString();

  const products = $('.product-card')
    .toArray()
    .map((element) => {
      const card = $(element);
      const price = Number(card.find('.product-price').text().trim());
      const unit = card.find('.product-unit').text().trim();
      const unitPriceInfo = parseUnitPrice(price, unit);

      return {
        id: card.attr('data-product-id'),
        name: card.find('.product-name').text().trim(),
        category: card.find('.product-category').text().trim(),
        price,
        unit,
        unitPrice: unitPriceInfo?.unitPrice ?? null,
        unitLabel: unitPriceInfo?.unitLabel ?? null,
        imageUrl: card.find('.product-image-url').text().trim(),
        productUrl: card.find('.product-url').text().trim(),
        description: card.find('.product-description').text().trim(),
        reviews: card.find('.product-review-text li').toArray().map((el) => $(el).text().trim()),
        source: card.find('.product-source').text().trim() || 'sample-crawled-html',
        parsedAt,
      };
    })
    .filter((product) => product.id && product.name);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RAW_PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8');

  return products;
}

if (require.main === module) {
  crawlProducts()
    .then((products) => {
      console.log(`Parsed ${products.length} products into ${RAW_PRODUCTS_PATH}`);
    })
    .catch((error) => {
      console.error('Failed to parse sample product HTML:', error);
      process.exit(1);
    });
}

module.exports = { crawlProducts };
