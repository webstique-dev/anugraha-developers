const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const plotRoutes = require('./routes/plotRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration function to prevent CORS errors when credentials: true is used
const getCorsOptions = () => {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];

  const configuredOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, '')).filter(Boolean)
    : [];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');

      // Allow if matches configured origins, default local origins, or any vercel.app domain
      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(cleanOrigin) ||
        defaultOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname)
      ) {
        return callback(null, true);
      }

      // Fallback: If CLIENT_URL is not set on Render, reflect requesting origin dynamically to avoid CORS wildcard block
      if (configuredOrigins.length === 0) {
        console.warn(`[CORS Warning] CLIENT_URL environment variable is not defined. Reflecting requesting origin: ${cleanOrigin}`);
        return callback(null, true);
      }

      console.error(`[CORS Blocked] Origin '${origin}' rejected. Configured CLIENT_URL:`, configuredOrigins);
      return callback(new Error(`CORS error: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  };
};

const corsMiddleware = cors(getCorsOptions());
app.use(corsMiddleware);
app.options(/(.*)/, corsMiddleware);

app.use(express.json());

// Incoming Request Logger for diagnostics
app.use((req, res, next) => {
  console.log(`[Server Request] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Connect to MongoDB Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/plot_makers';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected successfully to MongoDB Database (plot_makers)'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plots', plotRoutes);

// Health Check Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Anugraha Developers Backend API is active and healthy.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anugraha Developers Backend API is running on Render...',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Global Express Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('EXPRESS GLOBAL ERROR TRACE:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.toString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Anugraha Developers Admin Server running on port ${PORT}`);
});