const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM products').all().map(c => c.category);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET products (with optional filtering, search, sorting)
app.get('/api/products', (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price-low') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new product (Admin feature)
app.post('/api/products', (req, res) => {
  try {
    const { title, description, price, old_price, category, stock, image, badge } = req.body;
    if (!title || !price || !category || !image) {
      return res.status(400).json({ error: 'Title, price, category, and image are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO products (title, description, price, old_price, category, stock, image, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(title, description || '', price, old_price || null, category, stock || 10, image, badge || null);
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create order (Checkout)
app.post('/api/orders', (req, res) => {
  try {
    const { customer_name, customer_email, shipping_address, city, items, total_amount } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order details.' });
    }

    const createOrderTransaction = db.transaction(() => {
      const orderStmt = db.prepare(`
        INSERT INTO orders (customer_name, customer_email, shipping_address, city, total_amount, status)
        VALUES (?, ?, ?, ?, ?, 'Processing')
      `);
      const orderResult = orderStmt.run(customer_name, customer_email, shipping_address, city || '', total_amount);
      const orderId = orderResult.lastInsertRowid;

      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_title, price, quantity, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Also decrement stock
      const updateStockStmt = db.prepare(`
        UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?
      `);

      for (const item of items) {
        itemStmt.run(orderId, item.id, item.title, item.price, item.quantity, item.image || '');
        updateStockStmt.run(item.quantity, item.id);
      }

      return orderId;
    });

    const orderId = createOrderTransaction();
    const placedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: {
        ...placedOrder,
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET orders list
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const enrichedOrders = orders.map(ord => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders').get().sum;
    res.json({ totalProducts, totalOrders, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
