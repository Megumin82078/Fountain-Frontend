import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../types/api';
import { getErrorMessage } from '../utils/helpers';
import { STORAGE_KEYS, API_CONFIG } from '../constants';

// Setup axios with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT || 60000, // Increased timeout for slow backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the axios base configuration
console.log('🌐 Axios client configured');

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
    
    // Always log API requests during development
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
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
    // Always log successful API responses during development
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Always log API errors
    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      baseURL: originalRequest?.baseURL
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear bad token and user data
      removeStoredToken();
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Redirect to login page
      window.location.href = '/login';
      
      return Promise.reject(error);
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail;
      if (Array.isArray(validationErrors)) {
        error.message = validationErrors.map(err => err.msg || err.message).join(', ');
      } else if (typeof validationErrors === 'string') {
        error.message = validationErrors;
      } else {
        error.message = 'Validation error occurred';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      error.message = 'Access forbidden - insufficient permissions';
    }

    // Handle network errors with more detail
    if (!error.response) {
      const fullUrl = `${originalRequest?.baseURL || API_BASE_URL}${originalRequest?.url || ''}`;
      error.message = `Cannot connect to backend server. Attempted URL: ${fullUrl}. This may be due to CORS issues, network problems, or the server being down.`;
      console.error(`🔴 Backend connection failed:`, {
        attemptedUrl: fullUrl,
        baseURL: API_BASE_URL,
        error: error.message
      });
    }

    return Promise.reject(error);
  }
);

// Main API service - ALL REAL BACKEND CALLS
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
          date_of_birth: userData.dateOfBirth,
          sex: userData.sex,
          age: userData.age,
          address: userData.address
        }
      });
      
      const { access_token, token_type } = response.data;
      setStoredToken(access_token);
      
      // Backend doesn't return user data on signup, need to fetch profile
      try {
        const userProfile = await this.getProfile();
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile));
        
        return {
          access_token,
          token_type,
          user: userProfile
        };
      } catch (profileError) {
        // If profile fetch fails, return basic data
        return {
          access_token,
          token_type,
          user: {
            email: userData.email,
            name: userData.name
          }
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  async login(credentials) {
    try {
      console.log('🔐 ApiService: Starting login with credentials:', { email: credentials.email });
      
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('✅ ApiService: Login response received:', response.data);
      
      const { access_token, token_type } = response.data;
      setStoredToken(access_token);
      
      console.log('🔑 ApiService: Token stored in localStorage');
      
      // Enhanced profile fetching with retry logic
      let userProfile;
      let profileFetchSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!profileFetchSuccess && retryCount < maxRetries) {
        try {
          userProfile = await this.getProfile();
          profileFetchSuccess = true;
          
          // Ensure required fields exist
          if (!userProfile.role) userProfile.role = 'patient';
          if (!userProfile.type) userProfile.type = 'individual';
          if (!userProfile.name && userProfile.profile_json?.name) {
            userProfile.name = userProfile.profile_json.name;
          } else if (!userProfile.name) {
            userProfile.name = userProfile.email?.split('@')[0] || 'User';
          }
          
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile));
          console.log('✅ ApiService: User profile fetched and stored:', userProfile);
          
        } catch (profileError) {
          retryCount++;
          console.error(`❌ ApiService: Profile fetch attempt ${retryCount} failed:`, profileError);
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            // Create a complete fallback user object
            userProfile = {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: 'patient',
              type: 'individual',
              id: `temp_${Date.now()}`,
              profile_json: {
                name: credentials.email.split('@')[0],
                preferences: {},
                settings: {}
              }
            };
            
            // Store fallback data
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile));
            console.warn('⚠️ ApiService: Using fallback user profile');
            
            // Schedule background profile fetch
            this._scheduleProfileRefetch();
          }
        }
      }
      
      return {
        access_token,
        token_type,
        user: userProfile,
        profileFetchSuccess
      };
    } catch (error) {
      console.error('❌ ApiService: Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Invalid email or password');
    }
  }

  async logout() {
    removeStoredToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    // Note: Backend doesn't have logout endpoint, token will expire
  }

  // Background profile refetch for when initial fetch fails
  _scheduleProfileRefetch() {
    setTimeout(async () => {
      try {
        const token = getStoredToken();
        if (!token) return; // User logged out
        
        const userProfile = await this.getProfile();
        if (userProfile && userProfile.email) {
          // Ensure required fields
          if (!userProfile.role) userProfile.role = 'patient';
          if (!userProfile.type) userProfile.type = 'individual';
          if (!userProfile.name && userProfile.profile_json?.name) {
            userProfile.name = userProfile.profile_json.name;
          } else if (!userProfile.name) {
            userProfile.name = userProfile.email?.split('@')[0] || 'User';
          }
          
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile));
          
          // Dispatch custom event to notify UI
          window.dispatchEvent(new CustomEvent('profileUpdated', { 
            detail: userProfile 
          }));
          
          console.log('✅ Background profile fetch successful');
        }
      } catch (error) {
        console.error('Background profile fetch failed:', error);
      }
    }, 5000); // Try again after 5 seconds
  }

  async forgotPassword(email) {
    // TODO: Backend doesn't have password reset endpoint yet
    console.warn('Password reset endpoint not implemented in backend');
    throw new Error('Password reset functionality coming soon');
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
      console.log('📤 Updating profile with data:', profileData);
      const response = await apiClient.put(API_ENDPOINTS.PROFILE_ME, profileData);
      console.log('✅ Profile update response:', response.data);
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('❌ Profile update error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to update profile');
    }
  }

  async uploadAvatar(file) {
    try {
      console.log('📤 Uploading avatar, file:', file.name, 'size:', file.size, 'type:', file.type);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.PROFILE_UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Avatar upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Avatar upload error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to upload avatar');
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE_CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword
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
      console.log('📤 Fetching diseases from:', API_ENDPOINTS.MY_DISEASES);
      const response = await apiClient.get(API_ENDPOINTS.MY_DISEASES);
      console.log('✅ Diseases response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch diseases:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch diseases');
    }
  }
  
  // Get all available disease facts (for condition creation)
  async getDiseaseFacts() {
    try {
      console.log('📤 Fetching disease facts from backend');
      const response = await apiClient.get(API_ENDPOINTS.DISEASE_FACTS);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch disease facts, using mock data');
      // Fallback to mock data with valid UUIDs
      return [
        { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Type 2 Diabetes', code: 'E11.9' },
        { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Hypertension', code: 'I10' },
        { id: '123e4567-e89b-12d3-a456-426614174003', name: 'Asthma', code: 'J45.909' },
        { id: '123e4567-e89b-12d3-a456-426614174004', name: 'Migraine', code: 'G43.909' },
        { id: '123e4567-e89b-12d3-a456-426614174005', name: 'Depression', code: 'F32.9' },
        { id: '123e4567-e89b-12d3-a456-426614174006', name: 'Anxiety Disorder', code: 'F41.9' },
        { id: '123e4567-e89b-12d3-a456-426614174007', name: 'Hypothyroidism', code: 'E03.9' },
        { id: '123e4567-e89b-12d3-a456-426614174008', name: 'GERD', code: 'K21.9' },
        { id: '123e4567-e89b-12d3-a456-426614174009', name: 'Chronic Kidney Disease', code: 'N18.9' },
        { id: '123e4567-e89b-12d3-a456-426614174010', name: 'COPD', code: 'J44.9' }
      ];
    }
  }

  // ==================== Health Data Management (CRUD) ====================
  async createCondition(conditionData) {
    try {
      // Get current user ID from stored user data
      const userDataString = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      console.log('🔍 Raw user data from storage:', userDataString);
      
      const userData = JSON.parse(userDataString || '{}');
      let userId = userData.id || userData.user_id || userData.sub;
      
      console.log('🔍 Parsed user data:', userData);
      console.log('🔍 Initial user ID:', userId);
      
      // Skip temporary IDs
      if (userId && userId.startsWith('temp_')) {
        console.log('🔍 Skipping temporary ID:', userId);
        userId = null;
      }
      
      if (!userId) {
        // Try to get from auth state
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) {
          // Decode JWT to get user ID
          try {
            const tokenParts = authToken.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 JWT payload:', payload);
            const userIdFromToken = payload.sub || payload.user_id;
            if (userIdFromToken) {
              console.log('🔍 Using user ID from token:', userIdFromToken);
              userId = userIdFromToken;
            }
          } catch (e) {
            console.error('Failed to decode JWT:', e);
          }
        }
        
        if (!userId) {
          throw new Error('User ID not found. Please log in again.');
        }
      }
      
      const payload = {
        user_id: userId,
        disease_id: conditionData.disease_id,
        onset_date: conditionData.onset_date,
        clinical_status: conditionData.clinical_status || 'active',
        verification_status: conditionData.verification_status || 'provisional'
      };
      
      console.log('📝 Creating condition:', payload);
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_CONDITIONS, payload);
      console.log('✅ Condition created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create condition failed:', {
        endpoint: API_ENDPOINTS.HEALTH_DATA_CONDITIONS,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        throw new Error('Condition creation endpoint not found. Backend implementation required.');
      } else if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          const errors = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errors}`);
        } else if (typeof detail === 'string') {
          throw new Error(`Validation failed: ${detail}`);
        }
        throw new Error('Invalid condition data format. Check backend requirements.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
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
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}');
      let userId = userData.id || userData.user_id || userData.sub;
      
      // Skip temporary IDs
      if (userId && userId.startsWith('temp_')) {
        userId = null;
      }
      
      if (!userId) {
        // Try to get from JWT token
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) {
          try {
            const tokenParts = authToken.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            userId = payload.sub || payload.user_id;
          } catch (e) {
            console.error('Failed to decode JWT:', e);
          }
        }
      }
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_MEDICATIONS, {
        user_id: userId,
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
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          const errors = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errors}`);
        }
      }
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
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}');
      let userId = userData.id || userData.user_id || userData.sub;
      
      // Skip temporary IDs
      if (userId && userId.startsWith('temp_')) {
        userId = null;
      }
      
      if (!userId) {
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) {
          try {
            const tokenParts = authToken.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            userId = payload.sub || payload.user_id;
          } catch (e) {
            console.error('Failed to decode JWT:', e);
          }
        }
      }
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_LABS, {
        user_id: userId,
        fact_id: labData.fact_id,
        value: parseFloat(labData.value), // Ensure number
        unit: labData.unit || 'mg/dL', // Backend requires unit
        observed: labData.observed,
        notes: labData.notes
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          const errors = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errors}`);
        }
      }
      throw new Error(error.response?.data?.detail || 'Failed to create lab result');
    }
  }

  async createVitalSign(vitalData) {
    try {
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}');
      let userId = userData.id || userData.user_id || userData.sub;
      
      // Skip temporary IDs
      if (userId && userId.startsWith('temp_')) {
        userId = null;
      }
      
      if (!userId) {
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) {
          try {
            const tokenParts = authToken.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            userId = payload.sub || payload.user_id;
          } catch (e) {
            console.error('Failed to decode JWT:', e);
          }
        }
      }
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await apiClient.post(API_ENDPOINTS.HEALTH_DATA_VITALS, {
        user_id: userId,
        fact_id: vitalData.fact_id,
        value: parseFloat(vitalData.value), // Ensure number
        unit: vitalData.unit || 'mmHg', // Backend requires unit
        observed: vitalData.observed
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          const errors = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errors}`);
        }
      }
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
  async getProviders(name = null) {
    try {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      
      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.PROVIDERS}?${queryString}` : API_ENDPOINTS.PROVIDERS;
      
      const response = await apiClient.get(url);
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
  async getFacilities(name = null) {
    try {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      
      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.FACILITIES}?${queryString}` : API_ENDPOINTS.FACILITIES;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch facilities');
    }
  }

  // ==================== Request Batches ====================
  async getRequestBatches() {
    // TODO: Backend doesn't have GET /request-batches endpoint yet
    console.warn('GET /request-batches endpoint not implemented in backend');
    throw new Error('Request batches list endpoint not yet implemented');
  }

  async getRequestBatch(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch request batch');
    }
  }
  
  async getRequestBatchTimeline(batchId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REQUEST_BATCH_TIMELINE(batchId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch request timeline');
    }
  }

  async createRequestBatch(batchData) {
    // TODO: Backend doesn't have POST /request-batches endpoint yet
    console.warn('POST /request-batches endpoint not implemented in backend');
    throw new Error('Create request batch endpoint not yet implemented');
  }

  // ==================== System Health ====================
  async healthCheck() {
    try {
      console.log('🏥 Health check attempt to:', `${API_BASE_URL}${API_ENDPOINTS.HEALTH_CHECK}`);
      const response = await apiClient.get(API_ENDPOINTS.HEALTH_CHECK);
      console.log('✅ Health check successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.HEALTH_CHECK}`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: error.message
      });
      throw new Error('API health check failed');
    }
  }
}

// Create single instance to use everywhere
const apiService = new ApiService();
export default apiService;

// Export axios client for custom use cases
export { apiClient };