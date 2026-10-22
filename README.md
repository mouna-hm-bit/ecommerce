# LUMEN.TECH — Fullstack E-Commerce Website

A modern, full-stack e-commerce web application featuring a **React (Vite)** frontend, **Node.js Express** backend, and persistent **SQLite** database (`better-sqlite3`).

---

## 🌟 Key Features

1. **Modern Minimalist UI/UX**
   - Dark tech aesthetic with glassmorphism header, curated gradients, micro-interactions, and responsive layout.
   - Live category filtering (*Audio*, *Wearables*, *Displays*, *Accessories*, *Lifestyle*).
   - Real-time search by keyword and sorting by price/rating.

2. **Cart & Sliding Drawer**
   - Persistent client-side cart (`localStorage`).
   - Add/remove items and increase/decrease quantities in real-time.

3. **Checkout Flow**
   - Interactive checkout modal with shipping address & contact info collection.
   - Transactional checkout processing that saves orders & order items in SQLite.
   - Automatic stock quantity reduction.
   - Celebration confetti animation upon successful purchase.

4. **Admin Dashboard & Management**
   - Live analytics: Total Revenue, Total Orders, and Active Products.
   - View all customer orders stored in SQLite.
   - Add new products directly to the database via interactive modal.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: [React 19](file:///c:/Users/PC-CLICK-PLUS/Desktop/site/client), Vite, Lucide React Icons, Canvas Confetti, Vanilla CSS design system.
- **Backend**: [Node.js & Express](file:///c:/Users/PC-CLICK-PLUS/Desktop/site/server/index.js), CORS, RESTful API.
- **Database**: [SQLite with better-sqlite3](file:///c:/Users/PC-CLICK-PLUS/Desktop/site/server/db.js) (with WAL mode, foreign keys, and seed catalog).

---

## 🚀 Running the Project

### 1. Backend Server (Express + SQLite)
```bash
cd server
npm install
node index.js
# Runs on http://localhost:5000
```

### 2. Frontend Client (React + Vite)
```bash
cd client
npm install
npm run dev
# Runs on http://127.0.0.1:3000
```
