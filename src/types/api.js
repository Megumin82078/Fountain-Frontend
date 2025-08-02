// API Response Types based on OpenAPI schema

// Authentication Types
export const UserRoles = {
  PATIENT: 'patient',
  PROVIDER: 'provider',
  ADMIN: 'admin'
};

export const UserTypes = {
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization'
};

// Health Data Types
export const AlertSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const AlertStatus = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved'
};

export const HealthDataCategories = {
  LAB_RESULTS: 'lab_results',
  VITAL_SIGNS: 'vital_signs',
  CONDITIONS: 'conditions',
  MEDICATIONS: 'medications',
  PROCEDURES: 'procedures',
  HEALTH_ENTITIES: 'health_entities',
  HEALTH_ALERTS: 'health_alerts'
};

export const ConditionStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RESOLVED: 'resolved'
};

export const VerificationStatus = {
  CONFIRMED: 'confirmed',
  PROVISIONAL: 'provisional',
  DIFFERENTIAL: 'differential'
};

// Request Batch Status
export const BatchStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Request headers
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGN_UP: '/auth/sign-up',
  LOGIN: '/auth/login',
  
  // Profile & Dashboard
  DASHBOARD_ME: '/profile/dashboard/me',
  DASHBOARD_ME_DETAIL: '/profile/dashboard/me/detail',
  
  // Health Data
  MY_HEALTH_DATA: '/profile/me/health-data',
  MY_HEALTH_DATA_CATEGORY: (category) => `/profile/me/health-data/${category}`,
  MY_ABNORMAL_DATA: '/profile/me/health-data/abnormal',
  MY_ABNORMAL_DATA_CATEGORY: (category) => `/profile/me/health-data/abnormal/${category}`,
  MY_HEALTH_ADVICE: '/profile/me/health-advice',
  MY_HEALTH_ADVICE_CATEGORY: (category) => `/profile/me/health-advice/${category}`,
  
  // Individual health data endpoints
  MY_LABS: '/profile/me/labs',
  MY_MEDICATIONS: '/profile/me/medications',
  MY_PROCEDURES: '/profile/me/procedures',
  MY_VITALS: '/profile/me/vitals',
  MY_CONDITIONS: '/profile/me/conditions',
  MY_DISEASES: '/profile/me/diseases',
  MY_ALERTS: '/profile/me/alerts',
  
  // Request Batches
  REQUEST_BATCHES: '/request-batches',
  REQUEST_BATCH: (batchId) => `/request-batches/${batchId}`,
  
  // Providers & Facilities
  PROVIDERS: '/provider',
  PROVIDER: (providerId) => `/provider/${providerId}`,
  FACILITIES: '/facilities',
  FACILITY: (facilityId) => `/facilities/${facilityId}`,
  ATTACH_PROVIDER: (facilityId, providerId) => `/facilities/${facilityId}/providers/${providerId}`,
  
  // File Upload
  UPLOAD_LINK: (providerRequestId) => `/provider/upload-link/${providerRequestId}`,
  UPLOAD: (token) => `/provider/upload/${token}`,
  
  // Alerts
  ALERTS: '/alerts',
  ALERT: (alertId) => `/alerts/${alertId}`,
  
  // Health Check
  HEALTH_CHECK: '/healthz'
};