import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../types/api';
import { getErrorMessage } from '../utils/helpers';
import { STORAGE_KEYS, API_CONFIG } from '../constants';

// Setup axios with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for auth token
const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
const setStoredToken = (token) => localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
const removeStoredToken = () => localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

// Add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for dev environment
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle errors and auth issues globally
apiClient.interceptors.response.use(
  (response) => {
    // Debug log for successful calls
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in dev mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      removeStoredToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail;
      const errorMessage = Array.isArray(validationErrors)
        ? validationErrors.map(err => err.msg || err.message).join(', ')
        : 'Validation error occurred';
      error.message = errorMessage;
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error - please check your connection';
    }

    return Promise.reject(error);
  }
);

// Main API service with backend integration
class ApiService {
  // ==================== Authentication ====================
  async signUp(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SIGN_UP, {
        email: userData.email,
        password: userData.password,
        role: userData.role || 'patient',
        type: userData.type || 'individual',
        profile_json: {
          name: userData.name,
          phone: userData.phone,
          date_of_birth: userData.dateOfBirth
        }
      });
      
      const { access_token } = response.data;
      setStoredToken(access_token);
      
      // Get user profile after signup
      const userProfile = await this.getProfile();
      
      return {
        access_token,
        user: userProfile
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || getErrorMessage(error));
    }
  }

  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        email: credentials.email,
        password: credentials.password
      });
      
      const { access_token } = response.data;
      setStoredToken(access_token);
      
      // Get user profile after login
      const userProfile = await this.getProfile();
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile));
      
      return {
        access_token,
        user: userProfile
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Invalid email or password');
    }
  }

  async logout() {
    removeStoredToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    // Note: Backend doesn't have logout endpoint, token will expire
  }

  async forgotPassword(email) {
    // TODO: Implement when backend provides password reset endpoint
    throw new Error('Password reset not yet implemented');
  }

  // ==================== Profile & Dashboard ====================
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE_ME);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE_ME, profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update profile');
    }
  }

  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.PROFILE_UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to upload avatar');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE_CHANGE_PASSWORD, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to change password');
    }
  }

  async getDashboard() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_ME);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard');
    }
  }

  async getDashboardDetail() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_ME_DETAIL);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard details');
    }
  }

  // ==================== Health Data ====================
  async getHealthData() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_HEALTH_DATA);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch health data');
    }
  }

  async getHealthDataByCategory(category) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_HEALTH_DATA_CATEGORY(category));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || `Failed to fetch ${category} data`);
    }
  }

  async getAbnormalHealthData() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_ABNORMAL_DATA);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch abnormal data');
    }
  }

  async getHealthAdvice() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_HEALTH_ADVICE);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch health advice');
    }
  }

  // Specific health data endpoints
  async getLabs() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_LABS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch lab results');
    }
  }

  async getMedications() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_MEDICATIONS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch medications');
    }
  }

  async getProcedures() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_PROCEDURES);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch procedures');
    }
  }

  async getVitals() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_VITALS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch vital signs');
    }
  }

  async getConditions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_CONDITIONS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch conditions');
    }
  }

  async getDiseases() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MY_DISEASES);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch diseases');
    }
  }

  // ==================== Health Data Management (CRUD) ====================
  async createCondition(conditionData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_CONDITIONS, {
        disease_id: conditionData.disease_id,
        onset_date: conditionData.onset_date,
        clinical_status: conditionData.clinical_status || 'active',
        verification_status: conditionData.verification_status || 'provisional'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create condition');
    }
  }

  async updateCondition(conditionId, updateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.HEALTH_DATA_CONDITION(conditionId), updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update condition');
    }
  }

  async deleteCondition(conditionId) {
    try {
      await apiClient.delete(API_ENDPOINTS.HEALTH_DATA_CONDITION(conditionId));
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete condition');
    }
  }

  async createMedication(medicationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_MEDICATIONS, {
        fact_id: medicationData.fact_id,
        label: medicationData.label,
        dose: medicationData.dose,
        unit: medicationData.unit,
        frequency: medicationData.frequency,
        start_date: medicationData.start_date,
        end_date: medicationData.end_date
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create medication');
    }
  }

  async updateMedication(medicationId, updateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.HEALTH_DATA_MEDICATION(medicationId), updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update medication');
    }
  }

  async deleteMedication(medicationId) {
    try {
      await apiClient.delete(API_ENDPOINTS.HEALTH_DATA_MEDICATION(medicationId));
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete medication');
    }
  }

  async createLabResult(labData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_LABS, {
        fact_id: labData.fact_id,
        value: labData.value,
        observed: labData.observed,
        notes: labData.notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create lab result');
    }
  }

  async createVitalSign(vitalData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_VITALS, {
        fact_id: vitalData.fact_id,
        value: vitalData.value,
        observed: vitalData.observed,
        notes: vitalData.notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create vital sign');
    }
  }

  async createProcedure(procedureData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_PROCEDURES, {
        fact_id: procedureData.fact_id,
        label: procedureData.label,
        date: procedureData.date,
        notes: procedureData.notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create procedure');
    }
  }

  async updateProcedure(procedureId, updateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.HEALTH_DATA_PROCEDURE(procedureId), updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update procedure');
    }
  }

  async deleteProcedure(procedureId) {
    try {
      await apiClient.delete(API_ENDPOINTS.HEALTH_DATA_PROCEDURE(procedureId));
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete procedure');
    }
  }

  // ==================== Alerts & Reminders ====================
  async getAlerts() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ALERTS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch alerts');
    }
  }

  async updateAlert(alertId, updateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ALERT(alertId), updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update alert');
    }
  }

  async createAlert(alertData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ALERTS, {
        alert_type: alertData.alert_type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        data: alertData.data || {},
        expires_at: alertData.expires_at
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create alert');
    }
  }

  async deleteAlert(alertId) {
    try {
      await apiClient.delete(API_ENDPOINTS.ALERT(alertId));
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete alert');
    }
  }

  // ==================== Provider Management ====================
  async getProviders(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.specialty) params.append('specialty', searchParams.specialty);
      
      const response = await apiClient.get(`${API_ENDPOINTS.PROVIDERS}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch providers');
    }
  }

  async createProvider(providerData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PROVIDERS, providerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create provider');
    }
  }

  async updateProvider(providerId, updateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROVIDER(providerId), updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update provider');
    }
  }

  async deleteProvider(providerId) {
    try {
      await apiClient.delete(API_ENDPOINTS.PROVIDER(providerId));
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete provider');
    }
  }

  // ==================== Facilities ====================
  async getFacilities(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      if (searchParams.name) params.append('name', searchParams.name);
      
      const response = await apiClient.get(`${API_ENDPOINTS.FACILITIES}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch facilities');
    }
  }

  async createFacility(facilityData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FACILITIES, facilityData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create facility');
    }
  }

  // ==================== Request Batches ====================
  async getRequestBatch(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch request batch');
    }
  }

  async getBatchTimeline(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH_TIMELINE(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch timeline');
    }
  }

  async createTimelineEvent(batchId, eventData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REQUEST_BATCH_TIMELINE(batchId), {
        event_type: eventData.event_type,
        title: eventData.title,
        description: eventData.description,
        metadata: eventData.metadata
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create timeline event');
    }
  }

  async getBatchProviders(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH_PROVIDERS(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch providers');
    }
  }

  async cancelBatch(batchId, reason) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.REQUEST_BATCH_CANCEL(batchId), {
        reason: reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to cancel batch');
    }
  }

  async getBatchDocuments(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH_DOCUMENTS(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch documents');
    }
  }

  async downloadBatchDocuments(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH_DOWNLOAD(batchId), {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to download documents');
    }
  }

  async getBatchNotes(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH_NOTES(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch notes');
    }
  }

  async createBatchNote(batchId, noteData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REQUEST_BATCH_NOTES(batchId), {
        content: noteData.content,
        type: noteData.type
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create note');
    }
  }

  // ==================== Health Facts (Reference Data) ====================
  async getDiseaseFacts(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.code) params.append('code', searchParams.code);
      
      const response = await apiClient.get(`${API_ENDPOINTS.DISEASE_FACTS}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch disease facts');
    }
  }

  async getLabFacts(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.code) params.append('code', searchParams.code);
      
      const response = await apiClient.get(`${API_ENDPOINTS.LAB_FACTS}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch lab facts');
    }
  }

  async getMedicationFacts(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.code) params.append('code', searchParams.code);
      
      const response = await apiClient.get(`${API_ENDPOINTS.MEDICATION_FACTS}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch medication facts');
    }
  }

  // ==================== System Health ====================
  async healthCheck() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH_CHECK);
      return response.data;
    } catch (error) {
      throw new Error('API health check failed');
    }
  }
}

// Create single instance to use everywhere
const apiService = new ApiService();
export default apiService;

// Export axios client for custom use cases
export { apiClient };