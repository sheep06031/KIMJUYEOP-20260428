require('dotenv').config();

const app = require('./app');
const { PORT } = require('./config/env');

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AI Shopping Agent backend listening on ${PORT}`);
  });
}

module.exports = app;
