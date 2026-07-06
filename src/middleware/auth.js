const fs = require('fs');
const path = require('path');

const API_KEYS_PATH = process.env.API_KEYS_PATH || path.join(__dirname, '..', '..', 'data', 'api-keys.json');

let apiKeysCache = null;
let lastLoad = 0;
const CACHE_TTL = 30000;

function loadApiKeys() {
  const now = Date.now();
  if (apiKeysCache && (now - lastLoad) < CACHE_TTL) return apiKeysCache;
  try {
    if (fs.existsSync(API_KEYS_PATH)) {
      const data = JSON.parse(fs.readFileSync(API_KEYS_PATH, 'utf8'));
      apiKeysCache = data;
      lastLoad = now;
      return data;
    }
  } catch (e) {
    console.error('Failed to load API keys:', e.message);
  }
  apiKeysCache = {};
  return {};
}

function apiKeyAuth(req, res, next) {
  if (req.rateLimitApplied) return next();
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    if ((req.path === '/markdown' || req.path === '/status') && req.method === 'GET') {
      return next();
    }
    return res.status(401).json({ error: 'API key required. Get one at https://markdownapi.com' });
  }
  const keys = loadApiKeys();
  const keyData = keys[apiKey];
  if (!keyData) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  const now = Date.now();
  if (keyData.expiresAt && now > keyData.expiresAt) {
    return res.status(403).json({ error: 'API key expired' });
  }
  const windowMs = 60000;
  if (!keyData.windowStart || (now - keyData.windowStart) > windowMs) {
    keyData.windowStart = now;
    keyData.windowCount = 0;
  }
  keyData.windowCount = (keyData.windowCount || 0) + 1;
  if (keyData.windowCount > (keyData.rateLimit || 1000000)) {
    return res.status(429).json({ error: `Rate limit exceeded for your plan (${keyData.rateLimit}/min)` });
  }
  req.apiKeyData = keyData;
  fs.writeFile(API_KEYS_PATH, JSON.stringify(keys, null, 2), () => {});
  next();
}

module.exports = { apiKeyAuth };
