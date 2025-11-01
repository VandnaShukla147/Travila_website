const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting only to API routes
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travila_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/content-routes'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/search', require('./routes/search'));

// Serve static files. Prefer `dist/` for optimized builds, but always
// fall back to the project root so source files (like `src/css/main.css`
// and `js/*.js`) can be served in development without rebuilding.
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  // Serve optimized build first
  app.use(express.static(distPath));
}
// If a compiled CSS exists in dist (output.css), but the HTML still references
// the source `src/css/main.css`, map that request to the compiled file so
// browsers receive valid CSS (helps when `index.html` wasn't updated).
app.get('/src/css/main.css', (req, res, next) => {
  const compiled = path.join(distPath, 'output.css');
  if (fs.existsSync(compiled)) {
    return res.sendFile(compiled);
  }
  // otherwise let the fallback static serve the source CSS
  return next();
});
// Always serve project root as a fallback (allows /src/* and /js/* to work)
app.use(express.static(__dirname));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 / fallback handler
// If the client expects HTML, serve index.html from the build `dist/` if present,
// otherwise fall back to the project root `index.html`. For API requests return JSON.
app.use('*', (req, res) => {
  // API not found -> JSON error
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }

  // Browser request for HTML -> serve index.html from dist (if present) or project root
  if (req.accepts && req.accepts('html')) {
    const indexInDist = path.join(path.join(__dirname, 'dist'), 'index.html');
    const indexInRoot = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexInDist)) {
      return res.sendFile(indexInDist);
    }
    if (fs.existsSync(indexInRoot)) {
      return res.sendFile(indexInRoot);
    }
  }

  // Default fallback: JSON for other requests
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});