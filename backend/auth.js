import jwt from 'jsonwebtoken';

// Secret key for JWT signing (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Token expiration time
const TOKEN_EXPIRATION = '24h';

// Simple user database (in production, use a real database)
const users = [
  { id: 1, username: 'admin', password: 'admin123' },
  { id: 2, username: 'user', password: 'user123' }
];

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Authenticate user credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object|null} User object or null if authentication fails
 */
export const authenticateUser = (username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

/**
 * Express middleware to verify JWT token
 * Checks Authorization header for Bearer token
 */
export const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Authorization header must be in format: Bearer <token>'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  // Attach user info to request object
  req.user = decoded;

  // Continue to next middleware/route handler
  next();
};

/**
 * Login route handler
 */
export const loginHandler = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // Authenticate user
  const user = authenticateUser(username, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user);

  // Return token and user info
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    }
  });
};
