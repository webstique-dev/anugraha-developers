const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const plotRoutes = require('./routes/plotRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Body Parsing
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL.replace(/\/$/, ''), 'http://localhost:5173', 'http://localhost:3000']
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());

// Connect to MongoDB Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/plot_makers';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected successfully to MongoDB Database (plot_makers)'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plots', plotRoutes);

app.get('/', (req, res) => {
  res.send('Anugraha Developers Backend API is running...');
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