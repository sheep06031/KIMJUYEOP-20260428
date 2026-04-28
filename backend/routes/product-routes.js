const express = require('express');
const { readProducts, getPagedProducts, findProductById } = require('../services/product-store');

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const products = await readProducts();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(40, Math.max(1, Number(req.query.limit) || 12));
    const paged = getPagedProducts(products, page, limit);

    res.json({
      success: true,
      count: paged.products.length,
      total: paged.total,
      page: paged.page,
      limit: paged.limit,
      totalPages: paged.totalPages,
      products: paged.products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'products.enriched.json을 읽는 중 오류가 발생했습니다.',
    });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const product = findProductById(products, req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '상품을 찾을 수 없습니다.',
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '상품 상세정보를 읽는 중 오류가 발생했습니다.',
    });
  }
});

router.get('/product-insights', async (req, res) => {
  try {
    const products = await readProducts();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(40, Math.max(1, Number(req.query.limit) || 12));
    const paged = getPagedProducts(products, page, limit);

    const insights = paged.products
      .filter((p) => p.aiSummary)
      .map((p) => ({ id: p.id, ...p.aiSummary }));

    return res.json({
      success: true,
      mode: 'enriched',
      insights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '상품 카드용 AI 판단 정보를 생성하는 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
