const express = require('express');
const { readProducts } = require('../services/product-store');

const { hasOpenAIClient, generateChatResponse } = require('../services/openai-service');

const router = express.Router();

function sanitizeMessages(messages = []) {
  return messages
    .filter((m) => m && typeof m.content === 'string' && ['user', 'assistant'].includes(m.role))
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content);
}

router.post('/chat', async (req, res) => {
  const conditions = {
    familySize: Number(req.body.familySize) || 4,
    hasChildren: typeof req.body.hasChildren === 'boolean' ? req.body.hasChildren : true,
    storageSpace: req.body.storageSpace || 'medium',
    monthlyUsage: req.body.monthlyUsage || 'medium',
  };

  const messages = sanitizeMessages(req.body.messages);

  if (!messages.length) {
    return res.status(400).json({
      success: false,
      error: 'messages 배열에 사용자 질문이 필요합니다.',
    });
  }

  if (!hasOpenAIClient()) {
    return res.status(503).json({
      success: false,
      error: 'AI API 연결 안됨',
    });
  }

  try {
    const products = await readProducts();
    const result = await generateChatResponse(products, messages, conditions);

    const nameToId = new Map(products.map((p) => [p.name, p.id]));
    const recommendedProducts = result.recommendedProducts.map((rec) => ({
      ...rec,
      productId: nameToId.get(rec.productName) || null,
    }));

    return res.json({
      success: true,
      mode: 'openai',
      ...result,
      recommendedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '채팅 응답 생성 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
