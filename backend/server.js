const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || 'https://shoe-website-xi-ten.vercel.app')
      : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RoeBook API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n  🚀 RoeBook API Server`);
      console.log(`  ─────────────────────────`);
      console.log(`  Mode:    ${process.env.NODE_ENV}`);
      console.log(`  Port:    ${PORT}`);
      console.log(`  URL:     http://localhost:${PORT}`);
      console.log(`  ─────────────────────────\n`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
