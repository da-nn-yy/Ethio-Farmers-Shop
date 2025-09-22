import Joi from 'joi';

// Common validation schemas
export const commonSchemas = {
  // User validation
  userRegistration: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    full_name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 255 characters',
      'any.required': 'Full name is required'
    }),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required'
    }),
    role: Joi.string().valid('farmer', 'buyer').required().messages({
      'any.only': 'Role must be either farmer or buyer',
      'any.required': 'Role is required'
    }),
    region: Joi.string().max(128).optional().allow('', null),
    woreda: Joi.string().max(128).optional().allow('', null)
  }),

  // Listing validation
  listing: Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
    crop: Joi.string().min(2).max(128).required().messages({
      'string.min': 'Crop name must be at least 2 characters long',
      'string.max': 'Crop name cannot exceed 128 characters',
      'any.required': 'Crop name is required'
    }),
    variety: Joi.string().max(128).optional().allow('', null),
    quantity: Joi.number().positive().required().messages({
      'number.positive': 'Quantity must be a positive number',
      'any.required': 'Quantity is required'
    }),
    unit: Joi.string().valid('kg', 'ton', 'crate', 'bag', 'unit').required().messages({
      'any.only': 'Unit must be one of: kg, ton, crate, bag, unit',
      'any.required': 'Unit is required'
    }),
    pricePerUnit: Joi.number().positive().required().messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
    currency: Joi.string().valid('ETB', 'USD').default('ETB'),
    availableFrom: Joi.date().iso().optional().allow('', null),
    availableUntil: Joi.date().iso().min(Joi.ref('availableFrom')).optional().allow('', null),
    region: Joi.string().max(128).optional().allow('', null),
    woreda: Joi.string().max(128).optional().allow('', null),
    description: Joi.string().max(1000).optional().allow('', null)
  }),

  // Order validation
  order: Joi.object({
    items: Joi.array().items(
      Joi.object({
        listingId: Joi.number().integer().positive().required(),
        quantity: Joi.number().positive().required()
      })
    ).min(1).required().messages({
      'array.min': 'At least one item is required',
      'any.required': 'Order items are required'
    }),
    notes: Joi.string().max(500).optional().allow('', null),
    deliveryFee: Joi.number().min(0).default(0)
  }),

  // Review validation
  review: Joi.object({
    listingId: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required'
    }),
    comment: Joi.string().max(1000).optional().allow('', null)
  }),

  // Search validation
  search: Joi.object({
    query: Joi.string().max(255).optional().allow('', null),
    category: Joi.string().max(128).optional().allow('', null),
    region: Joi.string().max(128).optional().allow('', null),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('newest', 'oldest', 'price-low', 'price-high').default('newest'),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0)
  }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // File upload validation
  fileUpload: Joi.object({
    image: Joi.any().required().messages({
      'any.required': 'Image file is required'
    })
  })
};

// Validation middleware factory
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Custom validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  // At least 6 characters, contains at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validatePrice = (price) => {
  return typeof price === 'number' && price > 0 && price < 1000000;
};

export const validateQuantity = (quantity) => {
  return typeof quantity === 'number' && quantity > 0 && quantity < 10000;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(startDate) <= new Date(endDate);
};

// Sanitization functions
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeString(sanitizeHtml(input));
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Rate limiting validation
export const validateRateLimit = (req, res, next) => {
  const rateLimitKey = `rate_limit_${req.ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  // This is a simple in-memory rate limiter
  // In production, use Redis or similar
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const userRequests = global.rateLimitStore.get(rateLimitKey) || [];
  const validRequests = userRequests.filter(time => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  validRequests.push(now);
  global.rateLimitStore.set(rateLimitKey, validRequests);

  next();
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type' };
  }

  const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
};

export default {
  commonSchemas,
  validate,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePrice,
  validateQuantity,
  validateDateRange,
  sanitizeString,
  sanitizeHtml,
  sanitizeInput,
  validateRateLimit,
  validateFile
};






























