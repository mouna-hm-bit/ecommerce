import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  CheckCircle, 
  Package, 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle,
  TrendingUp,
  CreditCard,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  // Cart state (stored in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Admin orders and stats
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });

  // Checkout Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: ''
  });

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    old_price: '',
    category: 'Accessories',
    stock: 20,
    image: '',
    badge: 'New'
  });

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(['All', ...data]);
        }
      })
      .catch(err => console.error("Could not fetch categories:", err));
  }, []);

  // Fetch products
  const fetchProducts = () => {
    setLoading(true);
    let url = `${API_BASE}/products?`;
    if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (sortBy) url += `sort=${sortBy}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle Order Submit
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      alert("Please fill in all shipping fields!");
      return;
    }

    const payload = {
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      shipping_address: customerInfo.address,
      city: customerInfo.city,
      items: cart,
      total_amount: cartTotal
    };

    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCart([]);
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
          setOrderSuccess(data.order);
          confetti({
            particleCount: 90,
            spread: 60,
            origin: { y: 0.6 }
          });
          fetchProducts();
        } else {
          alert("Order failed: " + (data.error || 'Server error'));
        }
      })
      .catch(err => {
        console.error("Order error:", err);
        alert("Failed to submit order. Make sure backend is running.");
      });
  };

  // Open Admin Dashboard & Load Data
  const openAdmin = () => {
    setIsAdminOpen(true);
    fetch(`${API_BASE}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE}/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  };

  // Add Product Submit (Admin)
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
      .then(res => res.json())
      .then(data => {
        alert("Product added successfully!");
        setIsNewProductOpen(false);
        fetchProducts();
        setNewProduct({
          title: '',
          description: '',
          price: '',
          old_price: '',
          category: 'Accessories',
          stock: 20,
          image: '',
          badge: 'New'
        });
      })
      .catch(err => {
        console.error(err);
        alert("Could not create product.");
      });
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="header">
        <div className="nav-container">
          <div className="logo" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
            <div className="logo-badge">
              <ShoppingBag size={20} />
            </div>
            <span>LUMEN<span className="text-gradient">.TECH</span></span>
          </div>

          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search gear, gadgets, headphones..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="nav-actions">
            <button className="nav-btn" onClick={openAdmin} title="Open Admin Panel">
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </button>
            <button className="nav-btn cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={17} />
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Next-Gen Minimalist Electronics</span>
        </div>
        <h1>Elevate Your Workspace with <span className="text-gradient">Precision Hardware</span></h1>
        <p>Engineered for creators, developers, and tech enthusiasts who refuse to compromise on design or performance.</p>
      </section>

      {/* Filters and Sorting */}
      <div className="filter-bar">
        <div className="categories-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <select 
          className="sort-select" 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Featured / Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Products Grid */}
      <main className="products-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No products match your criteria.
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80"} 
                    alt={product.title} 
                    className="product-img" 
                    loading="lazy"
                  />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                </div>

                <div className="product-info">
                  <div className="product-category-tag">{product.category}</div>
                  <h3 className="product-title" title={product.title}>{product.title}</h3>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-rating">
                    <Star size={15} fill="#fbbf24" stroke="none" />
                    <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                    <span className="product-rating-count">({product.reviews_count || 120})</span>
                  </div>

                  <div className="product-footer">
                    <div className="price-wrap">
                      <span className="price-current">${product.price.toFixed(2)}</span>
                      {product.old_price && <span className="price-old">${product.old_price.toFixed(2)}</span>}
                    </div>
                    <button className="add-cart-btn" onClick={() => addToCart(product)}>
                      <Plus size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <ShoppingCart size={20} />
                <span>Your Cart ({cartCount})</span>
              </div>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
                  <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Your bag is currently empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.title} className="cart-item-img" />
                    <div className="cart-item-details">
                      <div className="cart-item-title">{item.title}</div>
                      <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateCartQty(item.id, -1)}>
                          <Minus size={12} />
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCartQty(item.id, 1)}>
                          <Plus size={12} />
                        </button>
                        <button 
                          className="qty-btn" 
                          style={{ marginLeft: 'auto', color: 'var(--danger)' }} 
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  className="checkout-btn" 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                >
                  <CreditCard size={18} />
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Complete Checkout</h2>
              <button className="close-btn" onClick={() => setIsCheckoutOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="Alex Morgan"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required 
                  placeholder="alex@domain.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="742 Evergreen Terrace"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / State</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="San Francisco, CA"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <span>Items ({cartCount})</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--success)' }}>FREE Express</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="checkout-btn">
                Confirm & Pay (${cartTotal.toFixed(2)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderSuccess && (
        <div className="modal-overlay" onClick={() => setOrderSuccess(null)}>
          <div className="modal-content" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Thank you, <strong>{orderSuccess.customer_name}</strong>! Your order #<strong>{orderSuccess.id}</strong> has been logged into the SQLite database.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div><strong>Deliver to:</strong> {orderSuccess.shipping_address}, {orderSuccess.city}</div>
              <div><strong>Status:</strong> {orderSuccess.status}</div>
              <div><strong>Total Paid:</strong> ${orderSuccess.total_amount.toFixed(2)}</div>
            </div>
            <button className="checkout-btn" onClick={() => setOrderSuccess(null)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LayoutDashboard size={22} color="#818cf8" />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Admin Dashboard & SQLite Records</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="nav-btn" 
                  style={{ background: 'var(--accent-primary)', color: '#fff' }}
                  onClick={() => setIsNewProductOpen(true)}
                >
                  <PlusCircle size={15} /> Add Product
                </button>
                <button className="close-btn" onClick={() => setIsAdminOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="stats-cards">
              <div className="stat-card">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">${Number(stats.totalRevenue).toFixed(2)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{stats.totalOrders}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Products Active</span>
                <span className="stat-value">{stats.totalProducts}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} /> Recent Orders in Database
            </h3>
            
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders recorded yet. Make a purchase to see it here!</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{order.customer_email}</td>
                        <td style={{ fontWeight: 700 }}>${order.total_amount.toFixed(2)}</td>
                        <td>{order.items ? order.items.length : 0} items</td>
                        <td><span className="order-badge-status">{order.status}</span></td>
                        <td style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{order.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isNewProductOpen && (
        <div className="modal-overlay" onClick={() => setIsNewProductOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Add New Product</h2>
              <button className="close-btn" onClick={() => setIsNewProductOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Minimalist Wireless Charger Pad"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  required 
                  placeholder="Detailed specifications and features..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    required 
                    placeholder="99.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || '' })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="Audio, Wearables..."
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    required 
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Tag (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. New, Bestseller"
                    value={newProduct.badge}
                    onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="checkout-btn" style={{ marginTop: '1rem' }}>
                Save to SQLite Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} LUMEN.TECH Ecommerce. Built with React, Node.js Express, and SQLite.</p>
      </footer>
    </div>
  );
}
