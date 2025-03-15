// server/index.js - Main server file for FilmForge AI
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const scriptRoutes = require('./routes/scriptRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api/scripts', scriptRoutes);
app.use('/api/projects', projectRoutes);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`FilmForge AI server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
