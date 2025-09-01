const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'No authorization token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Token is invalid or expired' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'This action requires administrator privileges' 
    });
  }
  next();
};

// Middleware to check if user can access a specific package
const canAccessPackage = async (req, res, next) => {
  const packageId = req.params.id || req.params.packageId;
  
  if (!packageId) {
    return res.status(400).json({ 
      error: 'Package ID required',
      message: 'Package ID is missing from request' 
    });
  }

  try {
    const package = await prisma.permitPackage.findUnique({
      where: { id: packageId },
      select: { createdById: true },
    });

    if (!package) {
      return res.status(404).json({ 
        error: 'Package not found',
        message: 'Permit package does not exist' 
      });
    }

    // Admin can access all packages, users can only access their own
    if (req.user.role === 'ADMIN' || package.createdById === req.user.id) {
      next();
    } else {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to access this package' 
      });
    }
  } catch (error) {
    console.error('Package access check error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to verify package access' 
    });
  }
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  canAccessPackage,
  generateToken,
};
