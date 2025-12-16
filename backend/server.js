import express from 'express';
import cors from 'cors';
import { loginHandler, authMiddleware } from './auth.js';
import filesRouter from './files.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// ============================================================================
// Middleware Configuration
// ============================================================================

// Enable CORS for all origins (configure for production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// Public Routes (No Authentication Required)
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'File API Backend',
      version: '1.0.0',
      description: 'RESTful API for file operations with JWT authentication',
      endpoints: {
        auth: {
          'POST /api/auth/login': 'Login and receive JWT token'
        },
        files: {
          'GET /api/files?path=...': 'List files and directories',
          'GET /api/files/read?path=...': 'Read file content',
          'POST /api/files': 'Create new file or directory',
          'PUT /api/files': 'Update file content',
          'DELETE /api/files?path=...': 'Delete file or directory'
        }
      }
    }
  });
});

// Login endpoint
app.post('/api/auth/login', loginHandler);

// ============================================================================
// Protected Routes (Authentication Required)
// ============================================================================

// Apply authentication middleware to all /api/files routes
app.use('/api/files', authMiddleware, filesRouter);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============================================================================
// Server Startup
// ============================================================================

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('File API Backend Server');
  console.log('='.repeat(60));
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API info: http://localhost:${PORT}/api`);
  console.log('');
  console.log('Authentication:');
  console.log('  POST /api/auth/login');
  console.log('');
  console.log('File Operations (requires JWT):');
  console.log('  GET    /api/files?path=...');
  console.log('  GET    /api/files/read?path=...');
  console.log('  POST   /api/files');
  console.log('  PUT    /api/files');
  console.log('  DELETE /api/files?path=...');
  console.log('');
  console.log('Test credentials:');
  console.log('  Username: admin, Password: admin123');
  console.log('  Username: user, Password: user123');
  console.log('='.repeat(60));
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
