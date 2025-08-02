// Application constants

// User roles and types (from API types)
export const UserRoles = {
  PATIENT: 'patient',
  PROVIDER: 'provider',
  ADMIN: 'admin'
};

export const UserTypes = {
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization'
};

// App Info
export const APP_NAME = 'Fountain';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Premium Health Record Management System';

// Navigation routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  
  // Health Records
  HEALTH_RECORDS: '/health-records',
  CONDITIONS: '/health-records/conditions',
  MEDICATIONS: '/health-records/medications',
  LABS: '/health-records/labs',
  VITALS: '/health-records/vitals',
  PROCEDURES: '/health-records/procedures',
  
  // Other main sections
  REQUESTS: '/requests',
  REQUEST_TRACKING: '/requests/track',
  PROVIDERS: '/providers',
  ALERTS: '/alerts',
  
  // Settings & Profile
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Demo routes
  DEMO_STATE: '/demo/state'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'fountain_token',
  USER_DATA: 'fountain_user',
  THEME: 'fountain_theme',
  SIDEBAR_STATE: 'fountain_sidebar',
  HEALTH_DATA_CACHE: 'fountain_health_cache'
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// Health data categories mapping
export const HEALTH_CATEGORIES = {
  LAB_RESULTS: {
    key: 'lab_results',
    label: 'Lab Results',
    icon: 'flask',
    color: 'blue'
  },
  VITAL_SIGNS: {
    key: 'vital_signs',
    label: 'Vital Signs',
    icon: 'heart',
    color: 'red'
  },
  CONDITIONS: {
    key: 'conditions',
    label: 'Conditions',
    icon: 'stethoscope',
    color: 'purple'
  },
  MEDICATIONS: {
    key: 'medications',
    label: 'Medications',
    icon: 'pill',
    color: 'green'
  },
  PROCEDURES: {
    key: 'procedures',
    label: 'Procedures',
    icon: 'scissors',
    color: 'orange'
  },
  DISEASES: {
    key: 'diseases',
    label: 'Diseases',
    icon: 'virus',
    color: 'pink'
  }
};

// Alert configurations
export const ALERT_CONFIG = {
  SEVERITY_LEVELS: {
    LOW: { label: 'Low', color: 'success', priority: 1 },
    MEDIUM: { label: 'Medium', color: 'warning', priority: 2 },
    HIGH: { label: 'High', color: 'error', priority: 3 },
    CRITICAL: { label: 'Critical', color: 'error', priority: 4 }
  },
  AUTO_DISMISS_TIMEOUT: 5000, // 5 seconds for success messages
  PERSISTENT_TYPES: ['error', 'warning'] // These won't auto-dismiss
};

// Form validation rules
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters',
    COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  },
  NAME: {
    REQUIRED: 'Name is required',
    MIN_LENGTH: 'Name must be at least 2 characters'
  },
  PHONE: {
    INVALID: 'Please enter a valid phone number'
  }
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 5
};

// Chart configurations
export const CHART_COLORS = {
  PRIMARY: '#0ea5e9',
  SUCCESS: '#22c55e',
  WARNING: '#f97316',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  NEUTRAL: '#6b7280'
};

export const CHART_DEFAULTS = {
  HEIGHT: 300,
  ANIMATION_DURATION: 750,
  GRID_COLOR: '#f3f4f6',
  TEXT_COLOR: '#6b7280'
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
};

// File upload configurations
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx']
};

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 400
};

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1010,
  FIXED: 1020,
  MODAL_BACKDROP: 1030,
  MODAL: 1040,
  POPOVER: 1050,
  TOOLTIP: 1060,
  NOTIFICATION: 1070
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  SIGNUP: 'Account created successfully!',
  SAVE: 'Changes saved successfully!',
  DELETE: 'Item deleted successfully!',
  UPDATE: 'Updated successfully!',
  UPLOAD: 'File uploaded successfully!'
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// User preferences defaults
export const USER_PREFERENCES = {
  THEME: 'light',
  LANGUAGE: 'en',
  TIMEZONE: Intl.DateTimeFormat().resolvedOptions().timeZone,
  SIDEBAR_COLLAPSED: false,
  NOTIFICATIONS_ENABLED: true
};