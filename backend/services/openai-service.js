const { client } = require('../config/openai');
const { buildChatPrompt, buildInsightPrompt } = require('./prompt-service');

function extractJson(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('JSON response not found');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function hasOpenAIClient() {
  return Boolean(client);
}

async function generateChatResponse(products, messages, conditions) {
  if (!client) {
    throw new Error('OpenAI client is not configured');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: buildChatPrompt(products, conditions),
      },
      ...messages,
    ],
  });

  const parsed = extractJson(response.choices[0]?.message?.content || '');

  return {
    reply: parsed.reply || '',
    recommendedProducts: Array.isArray(parsed.recommendedProducts) ? parsed.recommendedProducts : [],
    comparedFactors: Array.isArray(parsed.comparedFactors) ? parsed.comparedFactors : [],
  };
}

async function generateProductInsights(products) {
  if (!client) {
    throw new Error('OpenAI client is not configured');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: buildInsightPrompt(products),
      },
    ],
  });

  const parsed = extractJson(response.choices[0]?.message?.content || '');

  return {
    insights: Array.isArray(parsed.insights) ? parsed.insights : [],
  };
}

module.exports = {
  hasOpenAIClient,
  generateChatResponse,
  generateProductInsights,
};
