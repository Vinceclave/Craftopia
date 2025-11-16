// apps/backend/src/constants/index.ts - NEW FILE
export const VALIDATION_LIMITS = {
  USERNAME: {
    MIN: 3,
    MAX: 30
  },
  PASSWORD: {
    MIN: 8,
    MAX: 128
  },
  EMAIL: {
    MAX: 255
  },
  POST: {
    TITLE_MAX: 255,
    CONTENT_MAX: 1000
  },
  COMMENT: {
    MAX: 500
  },
  BIO: {
    MAX: 500
  },
  CRAFT_IDEA: {
    MATERIALS_MIN: 3,
    MATERIALS_MAX: 200
  },
  CHALLENGE: {
    TITLE_MIN: 5,
    TITLE_MAX: 100,
    DESCRIPTION_MIN: 10,
    DESCRIPTION_MAX: 500
  },
  REPORT: {
    REASON_MIN: 10,
    REASON_MAX: 500
  },
  ANNOUNCEMENT: {
    TITLE_MIN: 5,
    TITLE_MAX: 200,
    CONTENT_MIN: 10,
    CONTENT_MAX: 2000
  }
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN_DAYS: 7,
  EMAIL_TOKEN: '24h'
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  FOLDERS: {
    POSTS: 'posts',
    PROFILES: 'profiles',
    CHALLENGES: 'challenges',
    CRAFTS: 'crafts'
  }
};

export const POINTS = {
  CHALLENGE: {
    MIN: 1,
    MAX: 1000
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DELETED: 'This account has been deleted. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  
  // Authorization
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden - insufficient permissions',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD: '{field} is required',
  INVALID_FORMAT: 'Invalid {field} format',
  TOO_SHORT: '{field} must be at least {min} characters long',
  TOO_LONG: '{field} cannot exceed {max} characters',
  
  // Resources
  NOT_FOUND: '{resource} not found',
  ALREADY_EXISTS: '{resource} already exists',
  CANNOT_DELETE_OWN: 'Cannot delete your own {resource}',
  CANNOT_MODIFY_OWN: 'Cannot modify your own {resource}',
  OWNERSHIP_REQUIRED: 'You can only modify your own {resource}',
  
  // Operations
  OPERATION_FAILED: '{operation} failed',
  DATABASE_ERROR: 'Database operation failed',
  EXTERNAL_SERVICE_ERROR: '{service} service unavailable',
  
  // Specific
  DUPLICATE_ENTRY: 'Duplicate entry - {fields} already exists',
  ALREADY_VERIFIED: 'Email is already verified',
  ALREADY_JOINED: 'You have already joined this challenge',
  ALREADY_COMPLETED: 'Challenge is already marked as completed',
  FILE_TOO_LARGE: 'File too large (max {maxSize})',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
};

export const SUCCESS_MESSAGES = {
  // Authentication
  REGISTERED: 'User registered successfully. Please check your email for verification.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  VERIFICATION_SENT: 'Verification email sent successfully',
  
  // Generic CRUD
  CREATED: '{resource} created successfully',
  UPDATED: '{resource} updated successfully',
  DELETED: '{resource} deleted successfully',
  RETRIEVED: '{resource} retrieved successfully',
  
  // Specific operations
  CHALLENGE_JOINED: 'Successfully joined challenge',
  CHALLENGE_COMPLETED: 'Challenge marked as completed',
  CHALLENGE_VERIFIED: 'Challenge verified successfully',
  POST_CREATED: 'Post created successfully',
  COMMENT_ADDED: 'Comment added successfully',
  REACTION_TOGGLED: 'Reaction toggled successfully',
  REPORT_SUBMITTED: 'Report submitted successfully',
  STATUS_UPDATED: '{resource} status updated successfully'
};

// AI Service Constants
export const AI_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CONFIDENCE_THRESHOLDS: {
    REJECTED: 0.30,
    PENDING: 0.70,
    COMPLETED: 0.70
  },
  CHALLENGE_GENERATION: {
    DAILY: {
      COUNT: 5,
      EXPIRES_DAYS: 1
    },
    WEEKLY: {
      COUNT: 10,
      EXPIRES_DAYS: 7
    },
    MONTHLY: {
      COUNT: 15,
      EXPIRES_DAYS: 30
    }
  }
};

// Rate limiting
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 500 // ✅ Increased - ~33 requests per minute
  },
  AI: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 100 // ✅ Increased - ~6-7 AI requests per minute
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 10 // ✅ Slightly increased for failed login attempts
  },
  // ✅ ADD: WebSocket connection rate limit
  WEBSOCKET: {
    WINDOW_MS: 1 * 60 * 1000, // 1 minute
    MAX: 10 // Max 10 connection attempts per minute
  }
};