const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const markdownRoute = require('./routes/markdown');
const { apiKeyAuth } = require('./middleware/auth');
const paymentRoute = require('./routes/payment');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Upgrade your plan for higher limits.' }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/',
  (req, res, next) => {
    if (req.path === '/markdown' && req.method === 'GET' && !req.headers['x-api-key']) {
      req.rateLimitApplied = true;
      return limiter(req, res, next);
    }
    return next();
  },
  apiKeyAuth
);

app.use('/api/markdown', markdownRoute);
app.use('/api/payment', paymentRoute.router);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MarkdownAPI running on port ${PORT}`);
});

module.exports = app;
