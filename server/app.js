const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getDBStatus } = require('./config/db');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/analytics', require('./routes/analytics'));

// Health & System status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Vehicle Parking Management System (VPMS) Backend API',
    time: new Date().toISOString(),
    db: getDBStatus()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
