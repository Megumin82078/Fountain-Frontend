import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useApp } from '../context/AppContext';
import { ActionTypes } from '../context/AppContext';

// Generic API hook for handling loading states and errors
export const useApiCall = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
};

// Authentication hooks
export const useAuth = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: true });
    
    try {
      console.log('🔐 useAuth: Starting login...');
      const result = await apiService.login(credentials);
      console.log('✅ useAuth: Login API successful, result:', result);
      
      // Extract user data from token or make additional API call to get user profile
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          token: result.access_token,
          user: result.user || { email: credentials.email } // Placeholder until we get user data
        }
      });
      console.log('✅ useAuth: LOGIN_SUCCESS dispatched');
      
      return result;
    } catch (error) {
      console.error('❌ useAuth: Login failed:', error);
      dispatch({ type: ActionTypes.LOGIN_FAILURE });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    setLoading(true);
    dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: true });
    
    try {
      const result = await apiService.signUp(userData);
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          token: result.access_token,
          user: result.user || { email: userData.email }
        }
      });
      
      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.LOGIN_FAILURE });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiService.logout();
    dispatch({ type: ActionTypes.LOGOUT });
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    
    try {
      const result = await apiService.forgotPassword(email);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state.auth,
    login,
    signUp,
    logout,
    forgotPassword,
    loading: loading || state.auth.loading
  };
};

// Dashboard hooks
export const useDashboard = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboardData, detailData] = await Promise.all([
        apiService.getDashboard(),
        apiService.getDashboardDetail()
      ]);
      
      return { dashboard: dashboardData, detail: detailData };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchDashboard, loading, error };
};

// Health data hooks
export const useHealthData = () => {
  const { state, dispatch } = useApp();

  const fetchHealthData = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: true });
    
    try {
      const data = await apiService.getHealthData();
      dispatch({
        type: ActionTypes.SET_HEALTH_DATA,
        payload: data
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: false });
      throw error;
    }
  }, [dispatch]);

  const fetchHealthDataByCategory = useCallback(async (category) => {
    dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: true });
    
    try {
      const data = await apiService.getHealthDataByCategory(category);
      dispatch({
        type: ActionTypes.SET_HEALTH_DATA_CATEGORY,
        payload: { category, data }
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: false });
      throw error;
    }
  }, [dispatch]);

  const fetchAbnormalHealthData = useCallback(async () => {
    try {
      const data = await apiService.getAbnormalHealthData();
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchHealthAdvice = useCallback(async () => {
    try {
      const data = await apiService.getHealthAdvice();
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    ...state.healthData,
    fetchHealthData,
    fetchHealthDataByCategory,
    fetchAbnormalHealthData,
    fetchHealthAdvice
  };
};

// Individual health data category hooks
export const useLabs = () => {
  return useApiCall(apiService.getLabs);
};

export const useMedications = () => {
  return useApiCall(apiService.getMedications);
};

export const useVitals = () => {
  return useApiCall(apiService.getVitals);
};

export const useConditions = () => {
  return useApiCall(apiService.getConditions);
};

export const useProcedures = () => {
  return useApiCall(apiService.getProcedures);
};

export const useDiseases = () => {
  return useApiCall(apiService.getDiseases);
};

// Alerts hooks
export const useAlerts = () => {
  const { state, dispatch } = useApp();

  const fetchAlerts = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_ALERTS_LOADING, payload: true });
    
    try {
      const data = await apiService.getAlerts();
      dispatch({
        type: ActionTypes.SET_ALERTS,
        payload: data
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ALERTS_LOADING, payload: false });
      throw error;
    }
  }, [dispatch]);

  const updateAlert = useCallback(async (alertId, updateData) => {
    try {
      const updatedAlert = await apiService.updateAlert(alertId, updateData);
      
      // Update alert in state if it's a status change
      if (updateData.status === 'acknowledged') {
        dispatch({
          type: ActionTypes.MARK_ALERT_READ,
          payload: alertId
        });
      }
      
      return updatedAlert;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const createAlert = useCallback(async (alertData) => {
    try {
      const newAlert = await apiService.createAlert(alertData);
      // Refresh alerts after creating
      await fetchAlerts();
      return newAlert;
    } catch (error) {
      throw error;
    }
  }, [fetchAlerts]);

  const deleteAlert = useCallback(async (alertId) => {
    try {
      await apiService.deleteAlert(alertId);
      // Refresh alerts after deleting
      await fetchAlerts();
      return true;
    } catch (error) {
      throw error;
    }
  }, [fetchAlerts]);

  return {
    ...state.alerts,
    fetchAlerts,
    updateAlert,
    createAlert,
    deleteAlert
  };
};

// Providers hooks
export const useProviders = () => {
  const { state, dispatch } = useApp();

  const fetchProviders = useCallback(async (name = null) => {
    dispatch({ type: ActionTypes.SET_PROVIDERS_LOADING, payload: true });
    
    try {
      const data = await apiService.getProviders(name);
      dispatch({
        type: ActionTypes.SET_PROVIDERS,
        payload: data
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_PROVIDERS_LOADING, payload: false });
      throw error;
    }
  }, [dispatch]);

  const fetchFacilities = useCallback(async (name = null) => {
    dispatch({ type: ActionTypes.SET_PROVIDERS_LOADING, payload: true });
    
    try {
      const data = await apiService.getFacilities(name);
      dispatch({
        type: ActionTypes.SET_FACILITIES,
        payload: data
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_PROVIDERS_LOADING, payload: false });
      throw error;
    }
  }, [dispatch]);

  const createProvider = useCallback(async (providerData) => {
    try {
      const newProvider = await apiService.createProvider(providerData);
      // Refresh providers after creating
      await fetchProviders();
      return newProvider;
    } catch (error) {
      throw error;
    }
  }, [fetchProviders]);

  const updateProvider = useCallback(async (providerId, updateData) => {
    try {
      const updatedProvider = await apiService.updateProvider(providerId, updateData);
      // Refresh providers after updating
      await fetchProviders();
      return updatedProvider;
    } catch (error) {
      throw error;
    }
  }, [fetchProviders]);

  const deleteProvider = useCallback(async (providerId) => {
    try {
      await apiService.deleteProvider(providerId);
      // Refresh providers after deleting
      await fetchProviders();
      return true;
    } catch (error) {
      throw error;
    }
  }, [fetchProviders]);

  return {
    ...state.providers,
    fetchProviders,
    fetchFacilities,
    createProvider,
    updateProvider,
    deleteProvider
  };
};

// Request batches hooks
export const useRequestBatches = () => {
  const { state, dispatch } = useApp();

  const fetchRequestBatches = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_REQUESTS_LOADING, payload: true });
    
    try {
      const data = await apiService.getRequestBatches();
      dispatch({
        type: ActionTypes.SET_REQUEST_BATCHES,
        payload: data
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_REQUESTS_LOADING, payload: false });
      throw error;
    }
  }, [dispatch]);

  const createRequestBatch = useCallback(async (batchData) => {
    try {
      const newBatch = await apiService.createRequestBatch(batchData);
      // Refresh batches after creating
      await fetchRequestBatches();
      return newBatch;
    } catch (error) {
      throw error;
    }
  }, [fetchRequestBatches]);

  const getRequestBatch = useCallback(async (batchId) => {
    try {
      const data = await apiService.getRequestBatch(batchId);
      dispatch({
        type: ActionTypes.SET_ACTIVE_REQUEST,
        payload: data
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const updateRequestBatch = useCallback(async (batchId, updateData) => {
    try {
      const updatedBatch = await apiService.updateRequestBatch(batchId, updateData);
      // Refresh batches after updating
      await fetchRequestBatches();
      return updatedBatch;
    } catch (error) {
      throw error;
    }
  }, [fetchRequestBatches]);

  return {
    ...state.requests,
    fetchRequestBatches,
    createRequestBatch,
    getRequestBatch,
    updateRequestBatch
  };
};

// File upload hooks
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = useCallback(async (providerRequestId, files) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // First get the upload link
      const linkData = await apiService.getUploadLink(providerRequestId);
      
      // Extract token from link data (implementation depends on API response structure)
      const token = linkData.token || linkData.upload_token;
      
      if (!token) {
        throw new Error('Upload token not received');
      }
      
      // Upload files with progress tracking
      setUploadProgress(50); // Simulate progress
      const result = await apiService.uploadFiles(token, files);
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after delay
    }
  }, []);

  return {
    uploadFiles,
    uploading,
    uploadProgress
  };
};