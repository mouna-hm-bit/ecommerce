const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      old_price REAL,
      category TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 120,
      stock INTEGER NOT NULL DEFAULT 50,
      image TEXT NOT NULL,
      badge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'Processing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Order Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // Seed default products if empty
  const count = db.prepare('SELECT count(*) as count FROM products').get().count;
  if (count === 0) {
    const seedProducts = [
      {
        title: "Aura Sound Pro ANC Headphones",
        description: "Studio-grade wireless active noise canceling headphones with 40-hour playtime, spatial audio, and breathable memory foam earcups.",
        price: 249.99,
        old_price: 299.99,
        category: "Audio",
        rating: 4.9,
        reviews_count: 328,
        stock: 35,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        badge: "Bestseller"
      },
      {
        title: "Nova Horizon Smartwatch Gen 4",
        description: "Titanium alloy casing, precision sapphire crystal display, ECG monitoring, GPS tracking, and 7-day battery life.",
        price: 319.00,
        old_price: 379.00,
        category: "Wearables",
        rating: 4.8,
        reviews_count: 194,
        stock: 22,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        badge: "Hot Deal"
      },
      {
        title: "CyberVision 4K OLED Monitor 32\"",
        description: "Stunning 4K 144Hz QD-OLED display engineered for creative pros and gamers alike with 99.8% DCI-P3 color accuracy.",
        price: 799.50,
        old_price: 899.00,
        category: "Displays",
        rating: 4.9,
        reviews_count: 87,
        stock: 14,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        badge: "Featured"
      },
      {
        title: "Lumix Minimalist Mechanical Keyboard",
        description: "Aircraft-grade CNC aluminum chassis, pre-lubed tactile switches, hot-swappable sockets, and acoustic dampening foam.",
        price: 139.99,
        old_price: 169.99,
        category: "Accessories",
        rating: 4.7,
        reviews_count: 412,
        stock: 45,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        badge: "Popular"
      },
      {
        title: "Zephyr Ultralight Wireless Mouse",
        description: "53g ultra-lightweight ergonomic honeycomb shell, 26,000 DPI optical sensor, and low-latency 2.4GHz wireless connection.",
        price: 79.99,
        old_price: 99.99,
        category: "Accessories",
        rating: 4.8,
        reviews_count: 156,
        stock: 58,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
        badge: null
      },
      {
        title: "Terra Leather Travel Backpack",
        description: "Handcrafted full-grain Italian leather, water-resistant compartment for 16-inch laptops, and hidden anti-theft pockets.",
        price: 189.00,
        old_price: 220.00,
        category: "Lifestyle",
        rating: 4.9,
        reviews_count: 210,
        stock: 19,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        badge: "Staff Pick"
      },
      {
        title: "AeroPulse Pods ANC Wireless Earbuds",
        description: "Dynamic spatial audio with head tracking, crystal-clear microphone beamforming, and Qi wireless charging case.",
        price: 159.00,
        old_price: 199.00,
        category: "Audio",
        rating: 4.6,
        reviews_count: 530,
        stock: 40,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        badge: "Save 20%"
      },
      {
        title: "Vortex 65W GaN Fast Charger Station",
        description: "Multi-port high-efficiency GaN charger capable of powering your laptop, tablet, and phone simultaneously with overheat guard.",
        price: 49.99,
        old_price: 64.99,
        category: "Accessories",
        rating: 4.9,
        reviews_count: 672,
        stock: 80,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
        badge: null
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO products (title, description, price, old_price, category, rating, reviews_count, stock, image, badge)
      VALUES (@title, @description, @price, @old_price, @category, @rating, @reviews_count, @stock, @image, @badge)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) insertStmt.run(item);
    });

    insertMany(seedProducts);
    console.log("Database seeded with sample products successfully.");
  }
}

initDb();

module.exports = db;
