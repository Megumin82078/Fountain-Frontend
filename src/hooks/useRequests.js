import { useState, useCallback } from 'react';
import requestService from '../services/requestService';

/**
 * Custom hook for managing medical records requests
 * Provides a clean interface for all request-related operations
 */
export const useRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch requests with optional filters
   */
  const fetchRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.getRequests(filters);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a specific request by ID
   */
  const fetchRequestById = useCallback(async (requestId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.getRequestById(requestId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new request
   */
  const createRequest = useCallback(async (requestData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.createRequest(requestData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing request
   */
  const updateRequest = useCallback(async (requestId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.updateRequest(requestId, updateData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel a request
   */
  const cancelRequest = useCallback(async (requestId, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.cancelRequest(requestId, reason);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a request permanently
   */
  const deleteRequest = useCallback(async (requestId) => {
    setLoading(true);
    setError(null);
    
    try {
      await requestService.deleteRequest(requestId);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get tracking history for a request
   */
  const fetchTrackingHistory = useCallback(async (requestId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.getTrackingHistory(requestId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Download request results
   */
  const downloadResults = useCallback(async (requestId, format = 'pdf') => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await requestService.downloadRequestResults(requestId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `request-${requestId}-results.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload supporting documents
   */
  const uploadDocuments = useCallback(async (requestId, files, onProgress) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.uploadDocuments(requestId, files, onProgress);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get request statistics
   */
  const fetchRequestStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestService.getRequestStats();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Actions
    fetchRequests,
    fetchRequestById,
    createRequest,
    updateRequest,
    cancelRequest,
    deleteRequest,
    fetchTrackingHistory,
    downloadResults,
    uploadDocuments,
    fetchRequestStats,
    
    // Utilities
    clearError: () => setError(null)
  };
};

/**
 * Hook for request filtering and searching
 */
export const useRequestFilter = (requests = []) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    priority: 'all'
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !filters.search || 
      request.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.trackingNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.targetProvider.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesType = filters.type === 'all' || request.requestType === filters.type;
    const matchesPriority = filters.priority === 'all' || request.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const groupedRequests = {
    pending: filteredRequests.filter(r => r.status === 'pending'),
    in_progress: filteredRequests.filter(r => r.status === 'in_progress'),
    completed: filteredRequests.filter(r => r.status === 'completed'),
    cancelled: filteredRequests.filter(r => r.status === 'cancelled')
  };

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      priority: 'all'
    });
  }, []);

  return {
    filters,
    filteredRequests,
    groupedRequests,
    updateFilter,
    updateFilters,
    clearFilters,
    
    // Computed values
    totalCount: filteredRequests.length,
    statusCounts: {
      pending: groupedRequests.pending.length,
      in_progress: groupedRequests.in_progress.length,
      completed: groupedRequests.completed.length,
      cancelled: groupedRequests.cancelled.length
    }
  };
};

/**
 * Hook for request form management
 */
export const useRequestForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    requestType: '',
    provider: '',
    recordTypes: [],
    dateRange: { start: '', end: '' },
    priority: 'medium',
    notes: '',
    urgentReason: '',
    contactPreference: 'email',
    deliveryMethod: 'secure_portal',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const updateNestedField = useCallback((parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  }, []);

  const toggleRecordType = useCallback((type) => {
    setFormData(prev => ({
      ...prev,
      recordTypes: prev.recordTypes.includes(type)
        ? prev.recordTypes.filter(t => t !== type)
        : [...prev.recordTypes, type]
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.requestType) {
      newErrors.requestType = 'Request type is required';
    }

    if (!formData.provider) {
      newErrors.provider = 'Healthcare provider is required';
    }

    if (formData.recordTypes.length === 0) {
      newErrors.recordTypes = 'At least one record type must be selected';
    }

    if (formData.dateRange.start && formData.dateRange.end) {
      const startDate = new Date(formData.dateRange.start);
      const endDate = new Date(formData.dateRange.end);
      
      if (startDate > endDate) {
        newErrors.dateRange = 'Start date must be before end date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      requestType: '',
      provider: '',
      recordTypes: [],
      dateRange: { start: '', end: '' },
      priority: 'medium',
      notes: '',
      urgentReason: '',
      contactPreference: 'email',
      deliveryMethod: 'secure_portal',
      ...initialData
    });
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    updateField,
    updateNestedField,
    toggleRecordType,
    validateForm,
    resetForm,
    
    // Computed values
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(formData) !== JSON.stringify({ ...formData, ...initialData })
  };
};

export default useRequests;