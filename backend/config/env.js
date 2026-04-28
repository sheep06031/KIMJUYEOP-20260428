const path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const FRONTEND_ORIGINS = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
const DATA_DIR = path.join(__dirname, '..', 'data');
const RAW_PRODUCTS_PATH = path.join(DATA_DIR, 'products.raw.json');
const ENRICHED_PRODUCTS_PATH = path.join(DATA_DIR, 'products.enriched.json');

module.exports = {
  PORT,
  FRONTEND_ORIGINS,
  DATA_DIR,
  RAW_PRODUCTS_PATH,
  ENRICHED_PRODUCTS_PATH,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};
