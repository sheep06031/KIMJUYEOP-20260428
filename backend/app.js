const express = require('express');
const cors = require('cors');
const path = require('path');
const { FRONTEND_ORIGINS } = require('./config/env');
const healthRoutes = require('./routes/health-routes');
const productRoutes = require('./routes/product-routes');
const chatRoutes = require('./routes/chat-routes');

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', healthRoutes);
app.use('/api', productRoutes);
app.use('/api', chatRoutes);

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;
