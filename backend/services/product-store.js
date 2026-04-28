const fs = require('fs/promises');
const { ENRICHED_PRODUCTS_PATH } = require('../config/env');

async function readProducts() {
  const raw = await fs.readFile(ENRICHED_PRODUCTS_PATH, 'utf8');
  return JSON.parse(raw);
}

function getPagedProducts(products, page, limit) {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * limit;

  return {
    total,
    totalPages,
    page: safePage,
    limit,
    products: products.slice(startIndex, startIndex + limit),
  };
}

function findProductById(products, productId) {
  return products.find((product) => product.id === productId) || null;
}

module.exports = {
  readProducts,
  getPagedProducts,
  findProductById,
};
