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

// Import dynamic API configuration
import { API_BASE_URL } from '../config/api';

// Re-export for backward compatibility
export { API_BASE_URL };

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
  PROFILE_ME: '/profile/me',
  DASHBOARD_ME: '/profile/dashboard/me',
  DASHBOARD_ME_DETAIL: '/profile/dashboard/me/detail',
  PROFILE_UPLOAD_AVATAR: '/profile/me/upload-avatar',
  PROFILE_CHANGE_PASSWORD: '/profile/me/change-password',
  
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
  
  // Health Data Management
  HEALTH_DATA_LABS: '/health-data/labs',
  HEALTH_DATA_LAB: (labId) => `/health-data/labs/${labId}`,
  HEALTH_DATA_MEDICATIONS: '/health-data/medications',
  HEALTH_DATA_MEDICATION: (medId) => `/health-data/medications/${medId}`,
  HEALTH_DATA_CONDITIONS: '/health-data/conditions',
  HEALTH_DATA_CONDITION: (conditionId) => `/health-data/conditions/${conditionId}`,
  HEALTH_DATA_PROCEDURES: '/health-data/procedures',
  HEALTH_DATA_PROCEDURE: (procId) => `/health-data/procedures/${procId}`,
  HEALTH_DATA_VITALS: '/health-data/vitals',
  HEALTH_DATA_VITAL: (vitalId) => `/health-data/vitals/${vitalId}`,
  
  // Request Batches
  REQUEST_BATCH: (batchId) => `/request-batches/${batchId}`,
  REQUEST_BATCH_TIMELINE: (batchId) => `/request-batches/${batchId}/timeline`,
  REQUEST_BATCH_TIMELINE_EVENT: (batchId, eventId) => `/request-batches/${batchId}/timeline/${eventId}`,
  REQUEST_BATCH_PROVIDERS: (batchId) => `/request-batches/${batchId}/providers`,
  REQUEST_BATCH_PROVIDER_RESEND: (batchId, providerRequestId) => `/request-batches/${batchId}/providers/${providerRequestId}/resend`,
  REQUEST_BATCH_PROVIDER_DOCUMENTS: (batchId, providerRequestId) => `/request-batches/${batchId}/providers/${providerRequestId}/documents`,
  REQUEST_BATCH_DOCUMENTS: (batchId) => `/request-batches/${batchId}/documents`,
  REQUEST_BATCH_DOCUMENT_PREVIEW: (batchId, documentId) => `/request-batches/${batchId}/documents/${documentId}/preview`,
  REQUEST_BATCH_CANCEL: (batchId) => `/request-batches/${batchId}/cancel`,
  REQUEST_BATCH_DOWNLOAD: (batchId) => `/request-batches/${batchId}/download`,
  REQUEST_BATCH_NOTES: (batchId) => `/request-batches/${batchId}/notes`,
  
  // Providers & Facilities
  PROVIDERS: '/provider',
  PROVIDER: (providerId) => `/provider/${providerId}`,
  FACILITIES: '/facilities',
  FACILITY: (facilityId) => `/facilities/${facilityId}`,
  ATTACH_PROVIDER: (facilityId, providerId) => `/facilities/${facilityId}/providers/${providerId}`,
  
  // File Upload (Provider Portal Only)
  UPLOAD_LINK: (providerRequestId) => `/provider/upload-link/${providerRequestId}`,
  UPLOAD: (token) => `/provider/upload/${token}`,
  
  // Alerts
  ALERTS: '/alerts',
  ALERT: (alertId) => `/alerts/${alertId}`,
  
  // Health Facts (Reference Data)
  DISEASE_FACTS: '/health-data/disease-facts',
  DISEASE_FACT: (factId) => `/health-data/disease-facts/${factId}`,
  LAB_FACTS: '/health-data/lab-facts',
  LAB_FACT: (factId) => `/health-data/lab-facts/${factId}`,
  MEDICATION_FACTS: '/health-data/medication-facts',
  MEDICATION_FACT: (factId) => `/health-data/medication-facts/${factId}`,
  PROCEDURE_FACTS: '/health-data/procedure-facts',
  PROCEDURE_FACT: (factId) => `/health-data/procedure-facts/${factId}`,
  VITAL_FACTS: '/health-data/vital-facts',
  VITAL_FACT: (factId) => `/health-data/vital-facts/${factId}`,
  
  // Health Check
  HEALTH_CHECK: '/healthz',
  ADMIN_PING: '/admin/ping'
};