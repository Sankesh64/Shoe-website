/**
 * RoeBook Backend — Structural Test
 * 
 * This test validates that all modules load correctly,
 * all routes are properly mounted, and the Express app
 * initializes without errors — WITHOUT needing MongoDB.
 */

const path = require('path');

// Track results
const results = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
    passed++;
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

console.log('\n  ╔══════════════════════════════════════╗');
console.log('  ║  RoeBook Backend — Structural Tests  ║');
console.log('  ╚══════════════════════════════════════╝\n');

// ─── 1. Environment ──────────────────────────────
test('dotenv loads without error', () => {
  const dotenv = require('dotenv');
  dotenv.config();
  assert(dotenv, 'dotenv module should be defined');
});

// ─── 2. Models ───────────────────────────────────
test('User model loads', () => {
  const User = require('./models/User');
  assert(User, 'User model should export');
  assert(User.modelName === 'User', 'Model name should be User');
  assert(User.schema.paths.email, 'User should have email field');
  assert(User.schema.paths.password, 'User should have password field');
  assert(User.schema.paths.fullName, 'User should have fullName field');
  assert(User.schema.paths.role, 'User should have role field');
});

test('Product model loads', () => {
  const Product = require('./models/Product');
  assert(Product, 'Product model should export');
  assert(Product.modelName === 'Product', 'Model name should be Product');
  assert(Product.schema.paths.name, 'Product should have name field');
  assert(Product.schema.paths.price, 'Product should have price field');
  assert(Product.schema.paths.category, 'Product should have category field');
  assert(Product.schema.paths.slug, 'Product should have slug field');
});

test('Order model loads', () => {
  const Order = require('./models/Order');
  assert(Order, 'Order model should export');
  assert(Order.modelName === 'Order', 'Model name should be Order');
  assert(Order.schema.paths.user, 'Order should have user field');
  assert(Order.schema.paths.totalPrice, 'Order should have totalPrice field');
  assert(Order.schema.paths.status, 'Order should have status field');
});

// ─── 3. Utils ────────────────────────────────────
test('generateToken utility loads', () => {
  const generateToken = require('./utils/generateToken');
  assert(typeof generateToken === 'function', 'generateToken should be a function');
});

// ─── 4. Middleware ───────────────────────────────
test('authMiddleware exports protect and admin', () => {
  const { protect, admin } = require('./middleware/authMiddleware');
  assert(typeof protect === 'function', 'protect should be a function');
  assert(typeof admin === 'function', 'admin should be a function');
});

test('errorMiddleware exports notFound and errorHandler', () => {
  const { notFound, errorHandler } = require('./middleware/errorMiddleware');
  assert(typeof notFound === 'function', 'notFound should be a function');
  assert(typeof errorHandler === 'function', 'errorHandler should be a function');
});

// ─── 5. Controllers ─────────────────────────────
test('authController exports all handlers', () => {
  const ctrl = require('./controllers/authController');
  assert(typeof ctrl.registerUser === 'function', 'registerUser');
  assert(typeof ctrl.loginUser === 'function', 'loginUser');
  assert(typeof ctrl.logoutUser === 'function', 'logoutUser');
  assert(typeof ctrl.getUserProfile === 'function', 'getUserProfile');
  assert(typeof ctrl.updateUserProfile === 'function', 'updateUserProfile');
});

test('productController exports all handlers', () => {
  const ctrl = require('./controllers/productController');
  assert(typeof ctrl.getProducts === 'function', 'getProducts');
  assert(typeof ctrl.getProductById === 'function', 'getProductById');
  assert(typeof ctrl.getProductBySlug === 'function', 'getProductBySlug');
  assert(typeof ctrl.createProduct === 'function', 'createProduct');
  assert(typeof ctrl.updateProduct === 'function', 'updateProduct');
  assert(typeof ctrl.deleteProduct === 'function', 'deleteProduct');
});

test('orderController exports all handlers', () => {
  const ctrl = require('./controllers/orderController');
  assert(typeof ctrl.createOrder === 'function', 'createOrder');
  assert(typeof ctrl.getMyOrders === 'function', 'getMyOrders');
  assert(typeof ctrl.getOrderById === 'function', 'getOrderById');
  assert(typeof ctrl.updateOrderToPaid === 'function', 'updateOrderToPaid');
  assert(typeof ctrl.updateOrderStatus === 'function', 'updateOrderStatus');
  assert(typeof ctrl.getAllOrders === 'function', 'getAllOrders');
});

// ─── 6. Routes ───────────────────────────────────
test('authRoutes mounts as an Express router', () => {
  const router = require('./routes/authRoutes');
  assert(router, 'authRoutes should export');
  assert(typeof router === 'function', 'Should be an Express router function');
});

test('productRoutes mounts as an Express router', () => {
  const router = require('./routes/productRoutes');
  assert(router, 'productRoutes should export');
  assert(typeof router === 'function', 'Should be an Express router function');
});

test('orderRoutes mounts as an Express router', () => {
  const router = require('./routes/orderRoutes');
  assert(router, 'orderRoutes should export');
  assert(typeof router === 'function', 'Should be an Express router function');
});

// ─── 7. Express App Assembly ─────────────────────
test('Express app assembles without errors (no DB)', () => {
  const express = require('express');
  const cookieParser = require('cookie-parser');
  const corsMiddleware = require('cors');
  const { notFound, errorHandler } = require('./middleware/errorMiddleware');

  const app = express();
  app.use(corsMiddleware({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));

  app.get('/', (req, res) => res.json({ message: 'API running' }));
  app.use(notFound);
  app.use(errorHandler);

  assert(app, 'Express app should be created');
  assert(typeof app.listen === 'function', 'App should have listen method');
});

// ─── 8. Config ───────────────────────────────────
test('DB config exports connectDB function', () => {
  const connectDB = require('./config/db');
  assert(typeof connectDB === 'function', 'connectDB should be a function');
});

// ─── Print Results ───────────────────────────────
console.log('  Results:');
console.log('  ────────────────────────────────────\n');
results.forEach((r) => {
  const icon = r.status === 'PASS' ? '  ✅' : '  ❌';
  console.log(`${icon}  ${r.name}`);
  if (r.error) console.log(`      └─ ${r.error}`);
});

console.log(`\n  ────────────────────────────────────`);
console.log(`  Total: ${results.length}  |  ✅ Passed: ${passed}  |  ❌ Failed: ${failed}`);
console.log(`  ────────────────────────────────────\n`);

if (failed > 0) {
  console.log('  ⚠️  Some tests failed! Fix the issues above.\n');
  process.exit(1);
} else {
  console.log('  🎉 All tests passed! Backend is structurally sound.\n');
  process.exit(0);
}
