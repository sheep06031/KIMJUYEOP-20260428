const OpenAI = require('openai');
const { OPENAI_API_KEY } = require('./env');

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

module.exports = {
  client,
};
