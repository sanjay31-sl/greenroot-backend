const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'https://greenroot-frontend.vercel.app'], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/plants',        require('./routes/plants'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/nurseries',     require('./routes/nurseries'));
app.use('/api/admin',         require('./routes/admin'));

// Health check
app.get('/', (req, res) => res.json({ message: '🌿 GreenRoot API running' }));

// Connect to MongoDB Atlas and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    app.listen(PORT, () => console.log(`🌿 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
