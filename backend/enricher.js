require('dotenv').config();
const fs = require('fs/promises');
const crypto = require('crypto');
const { DATA_DIR, RAW_PRODUCTS_PATH, ENRICHED_PRODUCTS_PATH } = require('./config/env');
const { generateProductInsights } = require('./services/openai-service');

function computeContentHash(product) {
  const content = JSON.stringify({
    name: product.name,
    category: product.category,
    price: product.price,
    unit: product.unit,
    description: product.description,
    reviews: product.reviews,
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function readExistingEnriched() {
  try {
    const raw = await fs.readFile(ENRICHED_PRODUCTS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function enrichProducts() {
  const rawProducts = JSON.parse(await fs.readFile(RAW_PRODUCTS_PATH, 'utf8'));
  const existing = await readExistingEnriched();
  const existingMap = new Map(existing.map((p) => [p.id, p]));

  const productsWithHash = rawProducts.map((product) => ({
    ...product,
    contentHash: computeContentHash(product),
  }));

  const needsUpdate = productsWithHash.filter((product) => {
    const cached = existingMap.get(product.id);
    if (!cached || cached.contentHash !== product.contentHash || !cached.aiSummary) return true;
    // 새 필드가 추가된 경우 재생성
    if (cached.aiSummary.freshnessNote === undefined || cached.aiSummary.childSafetyNote === undefined) return true;
    return false;
  });

  console.log(`AI 요약 생성 필요: ${needsUpdate.length}개 / 전체 ${rawProducts.length}개`);

  let newInsightMap = new Map();

  if (needsUpdate.length > 0) {
    const result = await generateProductInsights(needsUpdate);
    newInsightMap = new Map(result.insights.map((insight) => [insight.id, insight]));
  }

  const enriched = productsWithHash.map((product) => {
    const cached = existingMap.get(product.id);
    const isCacheValid = cached && cached.contentHash === product.contentHash && cached.aiSummary;

    const raw = isCacheValid ? cached.aiSummary : newInsightMap.get(product.id);
    const aiSummary = raw
      ? {
          purchaseSummary: raw.purchaseSummary || '',
          freshnessNote: raw.freshnessNote || '',
          childSafetyNote: raw.childSafetyNote || '',
          valueNote: raw.valueNote || '',
          caution: raw.caution || '',
          fitNote: raw.fitNote || '',
        }
      : null;

    return { ...product, aiSummary };
  });

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ENRICHED_PRODUCTS_PATH, JSON.stringify(enriched, null, 2), 'utf8');

  return enriched;
}

if (require.main === module) {
  enrichProducts()
    .then((enriched) => {
      console.log(`${enriched.length}개 상품 저장 완료 → ${ENRICHED_PRODUCTS_PATH}`);
    })
    .catch((error) => {
      console.error('Enrichment 실패:', error);
      process.exit(1);
    });
}

module.exports = { enrichProducts };
