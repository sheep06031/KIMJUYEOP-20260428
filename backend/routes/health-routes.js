const express = require('express');
const { OPENAI_API_KEY } = require('../config/env');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-shopping-agent-backend',
    apiKeyConfigured: Boolean(OPENAI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
