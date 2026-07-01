const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API: list products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Get cart
app.get('/api/cart', (req, res) => {
  const cart = req.session.cart || [];
  res.json(cart);
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const { productId, qty = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (!req.session.cart) req.session.cart = [];
    const existing = req.session.cart.find(i => i.id === product.id);
    if (existing) existing.qty += qty;
    else req.session.cart.push({ id: product.id, title: product.title, price: product.price, qty });

    res.json(req.session.cart);
  });
});

// Checkout (simple simulation)
app.post('/api/checkout', (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.status(400).json({ error: 'Cart empty' });

  // In production you'd integrate with a payment processor and create orders.
  req.session.cart = [];
  res.json({ success: true, message: 'Order placed (simulated)' });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
