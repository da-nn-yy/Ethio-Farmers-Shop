import { pool } from '../config/database.js';

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
    this.type = 'validation';
  }
}

export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500);
    this.originalError = originalError;
    this.type = 'database';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.type = 'authentication';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.type = 'authorization';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.type = 'not_found';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.type = 'conflict';
  }
}

// Error handling utilities
export const handleDatabaseError = (error) => {
  console.error('Database Error:', error);
  
  if (error.code === 'ER_DUP_ENTRY') {
    return new ConflictError('Resource already exists');
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new ValidationError('Referenced resource does not exist');
  }
  
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return new ConflictError('Cannot delete resource that is being referenced');
  }
  
  if (error.code === 'ER_DATA_TOO_LONG') {
    return new ValidationError('Data too long for field');
  }
  
  if (error.code === 'ER_BAD_NULL_ERROR') {
    return new ValidationError('Required field cannot be null');
  }
  
  if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
    return new ValidationError('Invalid data format');
  }
  
  return new DatabaseError('Database operation failed', error);
};

export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  switch (error.code) {
    case 'auth/invalid-email':
      return new ValidationError('Invalid email address');
    case 'auth/email-already-exists':
      return new ConflictError('Email already exists');
    case 'auth/user-not-found':
      return new NotFoundError('User');
    case 'auth/wrong-password':
      return new AuthenticationError('Invalid password');
    case 'auth/invalid-credential':
      return new AuthenticationError('Invalid credentials');
    case 'auth/too-many-requests':
      return new AppError('Too many requests, please try again later', 429);
    default:
      return new AppError('Authentication service error', 500);
  }
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.code && err.code.startsWith('ER_')) {
    error = handleDatabaseError(err);
  }
  
  if (err.code && err.code.startsWith('auth/')) {
    error = handleFirebaseError(err);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ValidationError('File too large');
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new ValidationError('Too many files');
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new AppError('Internal server error', 500);
  }

  // Send error response
  const response = {
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      originalError: err.message
    })
  };

  // Add additional fields for specific error types
  if (error.field) {
    response.field = error.field;
  }
  
  if (error.type) {
    response.type = error.type;
  }

  res.status(error.statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Validation helper
export const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Database transaction wrapper
export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Safe database query wrapper
export const safeQuery = async (query, params = [], connection = null) => {
  try {
    const db = connection || pool;
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export default {
  AppError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  handleDatabaseError,
  handleFirebaseError,
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  validateRequired,
  withTransaction,
  safeQuery
};






















