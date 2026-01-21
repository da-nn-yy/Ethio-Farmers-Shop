import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../utils/errorHandler.js';

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage with security enhancements
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName);
    const name = path.basename(sanitizedName, ext);
    
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  // Check file type by MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`File type ${file.mimetype} not allowed. Only images are permitted.`), false);
  }
};

// Configure multer with security settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files per request
    fieldSize: 1024 * 1024, // 1MB field size limit
  },
  fileFilter: fileFilter
});

// Enhanced error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          success: false,
          error: 'File too large', 
          message: `Maximum file size is ${process.env.MAX_FILE_SIZE || '5MB'}` 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          success: false,
          error: 'Too many files', 
          message: 'Maximum 5 files allowed per request' 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          success: false,
          error: 'Unexpected file field', 
          message: 'Invalid file field name' 
        });
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({ 
          success: false,
          error: 'Too many parts', 
          message: 'Request has too many parts' 
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({ 
          success: false,
          error: 'Field name too long', 
          message: 'Field name exceeds maximum length' 
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({ 
          success: false,
          error: 'Field value too long', 
          message: 'Field value exceeds maximum length' 
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({ 
          success: false,
          error: 'Too many fields', 
          message: 'Request has too many fields' 
        });
      default:
        return res.status(400).json({ 
          success: false,
          error: 'File upload error', 
          message: error.message 
        });
    }
  } else if (error instanceof ValidationError) {
    return res.status(400).json({ 
      success: false,
      error: error.message,
      type: 'validation'
    });
  } else if (error) {
    return res.status(400).json({ 
      success: false,
      error: 'File upload failed', 
      message: error.message 
    });
  }
  next();
};

// File validation middleware
export const validateUploadedFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded',
      message: 'Please select at least one file to upload'
    });
  }

  // Additional security checks
  for (const file of req.files) {
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file extension',
        message: `File extension ${ext} not allowed`
      });
    }

    // Check for suspicious file names
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file name',
        message: 'File name contains invalid characters'
      });
    }

    // Check file size (additional check)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `File ${file.originalname} exceeds maximum size`
      });
    }
  }

  next();
};

// Clean up uploaded files on error
export const cleanupUploadedFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response indicates an error, clean up uploaded files
    if (res.statusCode >= 400 && req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Cleaned up file: ${file.path}`);
          }
        } catch (error) {
          console.error(`Failed to clean up file ${file.path}:`, error.message);
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Single file upload middleware
export const uploadSingle = (fieldName) => {
  return [
    upload.single(fieldName),
    handleUploadError,
    cleanupUploadedFiles
  ];
};

// Conditionally apply single-file upload only for multipart requests
export const conditionalSingleUpload = (fieldName) => {
  const single = upload.single(fieldName);
  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    console.log('conditionalSingleUpload - Content-Type:', contentType);
    
    if (contentType.startsWith('multipart/form-data')) {
      console.log('Processing multipart/form-data upload for field:', fieldName);
      return single(req, res, (err) => {
        if (err) {
          console.error('Multer error in conditionalSingleUpload:', err);
          return handleUploadError(err, req, res, next);
        }
        return cleanupUploadedFiles(req, res, next);
      });
    } else {
      console.log('Skipping multer - not multipart/form-data, content-type:', contentType);
      // For JSON requests, just pass through to the next middleware
      return next();
    }
  };
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return [
    upload.array(fieldName, maxCount),
    handleUploadError,
    validateUploadedFiles,
    cleanupUploadedFiles
  ];
};

// Fields upload middleware
export const uploadFields = (fields) => {
  return [
    upload.fields(fields),
    handleUploadError,
    cleanupUploadedFiles
  ];
};

export default upload;
