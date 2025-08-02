import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../types/api';
import { getErrorMessage } from '../utils/helpers';
import { STORAGE_KEYS, API_CONFIG } from '../constants';

// Setup axios with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
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

    // User not logged in or token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear bad token
      removeStoredToken();
      
      // Redirect to login page
      // TODO: hook this up to context later
      window.location.href = '/login';
      
      return Promise.reject(error);
    }

    // User doesn't have permission
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    }

    // No internet or server down
    if (!error.response) {
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

// Demo users for testing
const MOCK_USERS = [
  {
    id: 'user-001',
    email: 'demo@fountain.health',
    password: 'demo123',
    name: 'Demo User',
    role: 'patient',
    type: 'individual'
  },
  {
    id: 'user-002',
    email: 'admin@fountain.health',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    type: 'individual'
  }
];

// Main API service
class ApiService {
  // Auth related functions
  async signUp(userData) {
    try {
      // Fake delay to simulate real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Make sure email isn't taken
      const existingUser = MOCK_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Add new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.email.split('@')[0],
        role: 'patient',
        type: 'individual'
      };
      
      // Save to fake DB
      MOCK_USERS.push(newUser);
      
      // Create fake auth token
      const access_token = `mock_token_${newUser.id}_${Date.now()}`;
      setStoredToken(access_token);
      
      return {
        access_token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          type: newUser.type
        }
      };
    } catch (error) {
      throw new Error(error.message || getErrorMessage(error));
    }
  }

  async login(credentials) {
    try {
      console.log('🔐 ApiService: Starting login with credentials:', { email: credentials.email });
      
      // Fake delay to feel like real API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists
      const user = MOCK_USERS.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        console.error('❌ ApiService: User not found or invalid credentials');
        throw new Error('Invalid email or password');
      }
      
      console.log('✅ ApiService: User found:', { id: user.id, email: user.email });
      
      // Create fake auth token
      const access_token = `mock_token_${user.id}_${Date.now()}`;
      console.log('🔑 ApiService: Generated token:', access_token);
      
      setStoredToken(access_token);
      console.log('💾 ApiService: Token stored in localStorage');
      
      // Save user info
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        type: user.type
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('💾 ApiService: User data stored in localStorage:', userData);
      
      const result = {
        access_token,
        user: userData
      };
      
      console.log('✅ ApiService: Login successful, returning:', result);
      return result;
    } catch (error) {
      console.error('❌ ApiService: Login error:', error);
      throw new Error(error.message || getErrorMessage(error));
    }
  }

  async logout() {
    removeStoredToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    // Could add server logout call here later
  }

  async forgotPassword(email) {
    try {
      // Pretend to send reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // See if we know this email
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) {
        throw new Error('Email not found');
      }
      
      // Would send real email in production
      console.log(`Password reset email sent to: ${email}`);
      
      return {
        message: 'Password reset instructions have been sent to your email.',
        success: true
      };
    } catch (error) {
      throw new Error(error.message || getErrorMessage(error));
    }
  }

  // Dashboard stuff (all fake data for now)
  async getDashboard() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      totalRecords: 45,
      activeConditions: 3,
      currentMedications: 2,
      recentLabs: 8,
      upcomingAppointments: 1,
      unreadAlerts: 2
    };
  }

  async getDashboardDetail() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      healthScore: 78,
      lastUpdate: new Date().toISOString(),
      trends: {
        bloodPressure: 'improving',
        weight: 'stable',
        cholesterol: 'needs_attention'
      }
    };
  }

  // Health data (fake for now)
  async getHealthData() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      conditions: await this.getConditions(),
      medications: await this.getMedications(),
      labs: await this.getLabs(),
      vitals: await this.getVitals(),
      procedures: await this.getProcedures()
    };
  }

  async getHealthDataByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 300));
    switch (category) {
      case 'conditions': return await this.getConditions();
      case 'medications': return await this.getMedications();
      case 'labs': return await this.getLabs();
      case 'vitals': return await this.getVitals();
      case 'procedures': return await this.getProcedures();
      default: return [];
    }
  }

  async getAbnormalHealthData() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      labs: [],
      vitals: []
    };
  }

  async getHealthAdvice() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      recommendations: [
        'Consider reducing sodium intake to help manage blood pressure',
        'Schedule regular exercise routine for cardiovascular health'
      ]
    };
  }

  // Specific health info (all mock data)
  async getLabs() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 'lab-001',
        fact_id: 'fact-001',
        user_id: 'user-001',
        value: 180,
        observed: '2024-12-15',
        fact: {
          code: 'CHOL',
          label: 'Total Cholesterol',
          unit: 'mg/dL',
          ref_low: 0,
          ref_high: 200,
          category: 'Lipid Panel'
        }
      },
      {
        id: 'lab-002',
        fact_id: 'fact-002',
        user_id: 'user-001',
        value: 95,
        observed: '2024-12-14',
        fact: {
          code: 'GLUC',
          label: 'Glucose',
          unit: 'mg/dL',
          ref_low: 70,
          ref_high: 100,
          category: 'Basic Metabolic Panel'
        }
      }
    ];
  }

  async getMedications() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 'med-001',
        user_id: 'user-001',
        fact_id: 'fact-med-001',
        label: 'Lisinopril',
        dose: '10',
        unit: 'mg',
        frequency: 'Once daily',
        start_date: '2024-01-15',
        end_date: null,
        fact: {
          code: 'LISINOPRIL',
          label: 'Lisinopril',
          category: 'ACE Inhibitor'
        }
      },
      {
        id: 'med-002',
        user_id: 'user-001',
        fact_id: 'fact-med-002',
        label: 'Metformin',
        dose: '500',
        unit: 'mg',
        frequency: 'Twice daily',
        start_date: '2024-02-01',
        end_date: null,
        fact: {
          code: 'METFORMIN',
          label: 'Metformin',
          category: 'Antidiabetic'
        }
      }
    ];
  }

  async getProcedures() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 'proc-001',
        user_id: 'user-001',
        fact_id: 'fact-proc-001',
        label: 'Annual Physical Exam',
        date: '2024-12-01',
        notes: 'Routine annual checkup',
        fact: {
          code: 'ANNUAL_EXAM',
          label: 'Annual Physical Examination',
          category: 'Preventive Care'
        }
      },
      {
        id: 'proc-002',
        user_id: 'user-001',
        fact_id: 'fact-proc-002',
        label: 'Blood Pressure Check',
        date: '2024-12-15',
        notes: 'Follow-up blood pressure monitoring',
        fact: {
          code: 'BP_CHECK',
          label: 'Blood Pressure Monitoring',
          category: 'Monitoring'
        }
      }
    ];
  }

  async getVitals() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 'vital-001',
        fact_id: 'fact-vital-001',
        user_id: 'user-001',
        value: 140,
        observed: '2024-12-16',
        fact: {
          code: 'BP_SYS',
          label: 'Systolic Blood Pressure',
          unit: 'mmHg',
          ref_low: 90,
          ref_high: 120,
          category: 'Blood Pressure'
        }
      },
      {
        id: 'vital-002',
        fact_id: 'fact-vital-002',
        user_id: 'user-001',
        value: 98.6,
        observed: '2024-12-16',
        fact: {
          code: 'TEMP',
          label: 'Body Temperature',
          unit: '°F',
          ref_low: 97.0,
          ref_high: 99.0,
          category: 'Temperature'
        }
      }
    ];
  }

  async getConditions() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 'cond-001',
        user_id: 'user-001',
        disease_id: 'disease-001',
        onset_date: '2024-01-15',
        clinical_status: 'active',
        verification_status: 'confirmed',
        disease: {
          id: 'disease-001',
          name: 'Hypertension',
          code: 'I10',
          code_system: 'ICD-10',
          category: 'Cardiovascular',
          description: 'Essential hypertension'
        }
      },
      {
        id: 'cond-002',
        user_id: 'user-001',
        disease_id: 'disease-002',
        onset_date: '2024-02-01',
        clinical_status: 'active',
        verification_status: 'confirmed',
        disease: {
          id: 'disease-002',
          name: 'Type 2 Diabetes',
          code: 'E11.9',
          code_system: 'ICD-10',
          category: 'Endocrine',
          description: 'Type 2 diabetes mellitus without complications'
        }
      }
    ];
  }

  async getDiseases() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
  }

  // Alerts/reminders (mock)
  async getAlerts() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if we saved alerts before
    const storedAlerts = localStorage.getItem('mockAlerts');
    if (storedAlerts) {
      return JSON.parse(storedAlerts);
    }
    
    // Use these if nothing saved
    const defaultAlerts = [
      {
        id: 'alert-001',
        user_id: 'user-001',
        alert_type: 'health',
        severity: 'high',
        title: 'Abnormal Lab Results',
        message: 'Your recent cholesterol levels are elevated and require attention',
        status: 'unread',
        created_at: '2024-12-15T10:30:00Z'
      },
      {
        id: 'alert-002',
        user_id: 'user-001',
        alert_type: 'medication',
        severity: 'medium',
        title: 'Medication Reminder',
        message: 'It\'s time to take your Lisinopril 10mg',
        status: 'unread',
        created_at: '2024-12-16T08:00:00Z'
      },
      {
        id: 'alert-003',
        user_id: 'user-001',
        alert_type: 'vital_sign',
        severity: 'critical',
        title: 'Blood Pressure Spike',
        message: 'Your recent blood pressure reading is significantly elevated',
        status: 'read',
        created_at: '2024-12-16T14:22:00Z'
      }
    ];
    
    // Save for next time
    localStorage.setItem('mockAlerts', JSON.stringify(defaultAlerts));
    return defaultAlerts;
  }

  async updateAlert(alertId, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Save changes
    const alerts = JSON.parse(localStorage.getItem('mockAlerts') || '[]');
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, ...updateData } : alert
    );
    localStorage.setItem('mockAlerts', JSON.stringify(updatedAlerts));
    
    console.log('Mock: Updated alert', alertId, updateData);
    return { id: alertId, ...updateData };
  }

  async createAlert(alertData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      ...alertData,
      status: alertData.status || 'unread',
      created_at: alertData.created_at || new Date().toISOString()
    };
    
    // Save new alert
    const alerts = JSON.parse(localStorage.getItem('mockAlerts') || '[]');
    alerts.unshift(newAlert); // Add to beginning
    localStorage.setItem('mockAlerts', JSON.stringify(alerts));
    
    console.log('Mock: Created alert', newAlert);
    return newAlert;
  }

  async deleteAlert(alertId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove from saved alerts
    const alerts = JSON.parse(localStorage.getItem('mockAlerts') || '[]');
    const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
    localStorage.setItem('mockAlerts', JSON.stringify(filteredAlerts));
    
    console.log('Mock: Deleted alert', alertId);
    return true;
  }

  // Provider stuff (fake data)
  async getProviders(name = null) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const providers = [
      {
        id: 'prov-001',
        name: 'Dr. Sarah Chen',
        phone: '(416) 555-0123',
        fax: '(416) 555-0124',
        email: 'dr.chen@example.com',
        contact_json: {
          type: 'individual',
          specialty: 'Family Medicine',
          address: {
            street: '123 Health St',
            city: 'Toronto',
            province: 'ON',
            postalCode: 'M5V 3A8',
            country: 'Canada'
          },
          languages: ['English', 'Mandarin'],
          acceptsNewPatients: true,
          virtualCareAvailable: true
        },
        facilities: []
      },
      {
        id: 'prov-002',
        name: 'Oakville Medical Center',
        phone: '(905) 555-0200',
        fax: '(905) 555-0201',
        email: 'info@oakvillemedical.com',
        contact_json: {
          type: 'clinic',
          address: {
            street: '456 Medical Ave',
            city: 'Oakville',
            province: 'ON',
            postalCode: 'L6H 5R5',
            country: 'Canada'
          },
          services: ['Family Medicine', 'Walk-in Clinic', 'Pediatrics'],
          languages: ['English', 'French'],
          acceptsNewPatients: true,
          virtualCareAvailable: false
        },
        facilities: []
      }
    ];

    if (name) {
      return providers.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    }
    return providers;
  }

  async createProvider(providerData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProvider = {
      id: `prov-${Date.now()}`,
      name: providerData.name,
      phone: providerData.phone,
      fax: providerData.fax,
      email: providerData.email,
      contact_json: providerData.contact_json,
      facilities: []
    };
    console.log('Mock: Created provider', newProvider);
    return newProvider;
  }

  async updateProvider(providerId, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Updated provider', providerId, updateData);
    return { id: providerId, ...updateData };
  }

  async deleteProvider(providerId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Deleted provider', providerId);
    return true;
  }

  // Creating health records (all mock)
  async createCondition(conditionData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCondition = {
      id: `cond-${Date.now()}`,
      ...conditionData,
      disease: {
        id: conditionData.disease_id,
        name: 'New Condition',
        code: 'NEW',
        code_system: 'ICD-10',
        category: 'General'
      }
    };
    console.log('Mock: Created condition', newCondition);
    return newCondition;
  }

  async updateCondition(conditionId, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Updated condition', conditionId, updateData);
    return { id: conditionId, ...updateData };
  }

  async deleteCondition(conditionId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Deleted condition', conditionId);
    return true;
  }

  async createMedication(medicationData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newMedication = {
      id: `med-${Date.now()}`,
      ...medicationData
    };
    console.log('Mock: Created medication', newMedication);
    return newMedication;
  }

  async updateMedication(medicationId, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Updated medication', medicationId, updateData);
    return { id: medicationId, ...updateData };
  }

  async deleteMedication(medicationId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Deleted medication', medicationId);
    return true;
  }

  async createLabResult(labData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newLab = {
      id: `lab-${Date.now()}`,
      ...labData
    };
    console.log('Mock: Created lab result', newLab);
    return newLab;
  }

  async createVitalSign(vitalData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newVital = {
      id: `vital-${Date.now()}`,
      ...vitalData
    };
    console.log('Mock: Created vital sign', newVital);
    return newVital;
  }

  async createProcedure(procedureData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProcedure = {
      id: `proc-${Date.now()}`,
      ...procedureData
    };
    console.log('Mock: Created procedure', newProcedure);
    return newProcedure;
  }

  async updateProcedure(procedureId, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Updated procedure', procedureId, updateData);
    return { id: procedureId, ...updateData };
  }

  async deleteProcedure(procedureId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: Deleted procedure', procedureId);
    return true;
  }

  // Check if API is working
  async healthCheck() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { status: 'Mock API healthy' };
  }
}

// Create single instance to use everywhere
const apiService = new ApiService();
export default apiService;

// Export axios too in case someone needs it
export { apiClient };