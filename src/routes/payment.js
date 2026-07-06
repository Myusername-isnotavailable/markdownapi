const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BTC_ADDRESS = process.env.BTC_ADDRESS || '1nAHQJC8MqL7qwypM6ZxmmeoVaYBkzP1c';
const API_KEYS_PATH = process.env.API_KEYS_PATH || path.join(__dirname, '..', '..', 'data', 'api-keys.json');

const PLANS = {
  pro: { price: 0.00015, requests: 10000, rateLimit: 100, label: 'Pro' },
  business: { price: 0.00048, requests: 100000, rateLimit: 500, label: 'Business' }
};

function generateApiKey() {
  return 'md_' + crypto.randomBytes(24).toString('hex');
}

router.post('/create-order', (req, res) => {
  const { plan } = req.body;
  if (!plan || !PLANS[plan]) {
    return res.status(400).json({ error: 'Invalid plan. Choose: pro, business' });
  }
  const orderId = crypto.randomBytes(8).toString('hex');
  const order = {
    id: orderId,
    plan: plan,
    priceBtc: PLANS[plan].price,
    btcAddress: BTC_ADDRESS,
    status: 'pending',
    createdAt: Date.now()
  };
  const ordersPath = path.join(__dirname, '..', '..', 'data', 'orders.json');
  let orders = {};
  try {
    if (fs.existsSync(ordersPath)) {
      orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  orders[orderId] = order;
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  res.json({
    orderId,
    plan: PLANS[plan].label,
    priceBtc: PLANS[plan].price,
    btcAddress: BTC_ADDRESS,
    status: 'pending',
    instructions: `Send exactly ${PLANS[plan].price} BTC to ${BTC_ADDRESS} and your API key will be activated automatically.`
  });
});

router.get('/check-order/:orderId', (req, res) => {
  const ordersPath = path.join(__dirname, '..', '..', 'data', 'orders.json');
  try {
    if (fs.existsSync(ordersPath)) {
      const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      const order = orders[req.params.orderId];
      if (order) {
        return res.json({
          status: order.status,
          apiKey: order.apiKey || null,
          plan: order.plan
        });
      }
    }
  } catch (e) { /* ignore */ }
  res.status(404).json({ error: 'Order not found' });
});

module.exports = { router, PLANS, generateApiKey, API_KEYS_PATH, BTC_ADDRESS };
