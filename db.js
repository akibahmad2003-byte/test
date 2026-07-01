const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const DB_PATH = path.join(dataDir, 'store.db');

const db = new sqlite3.Database(DB_PATH);

// Initialize tables and seed products if empty
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT
    )
  `);

  db.get('SELECT COUNT(1) AS cnt FROM products', (err, row) => {
    if (err) return console.error('DB count error', err);
    if (row && row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO products (title, description, price, image) VALUES (?, ?, ?, ?)');
      const sample = [
        ['Acme All-in-one Widget', 'A versatile widget for everyday needs.', 49.99, 'https://picsum.photos/seed/widget/300/200'],
        ['Stellar Headphones', 'Comfortable, high-fidelity wireless headphones.', 129.0, 'https://picsum.photos/seed/headphones/300/200'],
        ['UltraFast SSD 1TB', 'Blazing fast NVMe storage for your machine.', 159.99, 'https://picsum.photos/seed/ssd/300/200'],
        ['Kitchen Master 3000', 'Make cooking effortless with smart presets.', 89.5, 'https://picsum.photos/seed/kitchen/300/200']
      ];
      sample.forEach(p => stmt.run(p[0], p[1], p[2], p[3]));
      stmt.finalize(() => console.log('Seeded products'));
    }
  });
});

module.exports = db;
