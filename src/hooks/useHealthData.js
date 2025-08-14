import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ActionTypes } from '../context/AppContext';
import apiService from '../services/api';
import { isAbnormalLabResult, isAbnormalVitalSign, groupByCategory, sortByDate } from '../utils/helpers';
import { useNotifications } from './useNotifications';

// Hook for handling all health data operations
export const useHealthData = () => {
  const { state, dispatch } = useApp();
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get all health data from backend - optimized to use consolidated endpoint
  const fetchAllHealthData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: true });
    
    try {
      // First try the consolidated endpoint for better performance
      try {
        console.log('🏥 Attempting to fetch health data from consolidated endpoint...');
        const consolidatedData = await apiService.getHealthData();
        
        // Transform the response to match our state structure
        const healthData = {
          conditions: consolidatedData.conditions || [],
          medications: consolidatedData.medications || [],
          labs: consolidatedData.lab_results || consolidatedData.labs || [],
          vitals: consolidatedData.vital_signs || consolidatedData.vitals || [],
          procedures: consolidatedData.procedures || [],
          diseases: consolidatedData.diseases || consolidatedData.health_entities || []
        };
        
        dispatch({
          type: ActionTypes.SET_HEALTH_DATA,
          payload: healthData
        });
        
        console.log('✅ Successfully fetched health data using consolidated endpoint');
        return healthData;
        
      } catch (consolidatedError) {
        console.warn('⚠️ Consolidated endpoint failed, falling back to individual calls:', consolidatedError.message);
        
        // Fallback to individual calls using Promise.allSettled for better error handling
        const [
          conditions,
          medications,
          labs,
          vitals,
          procedures,
          diseases
        ] = await Promise.allSettled([
          apiService.getConditions(),
          apiService.getMedications(),
          apiService.getLabs(),
          apiService.getVitals(),
          apiService.getProcedures(),
          apiService.getDiseases()
        ]);
        
        // Handle settled promises - extract successful results
        const healthData = {
          conditions: conditions.status === 'fulfilled' ? conditions.value : [],
          medications: medications.status === 'fulfilled' ? medications.value : [],
          labs: labs.status === 'fulfilled' ? labs.value : [],
          vitals: vitals.status === 'fulfilled' ? vitals.value : [],
          procedures: procedures.status === 'fulfilled' ? procedures.value : [],
          diseases: diseases.status === 'fulfilled' ? diseases.value : []
        };
        
        // Log which calls failed for debugging
        const failedCalls = [];
        if (conditions.status === 'rejected') failedCalls.push('conditions');
        if (medications.status === 'rejected') failedCalls.push('medications');
        if (labs.status === 'rejected') failedCalls.push('labs');
        if (vitals.status === 'rejected') failedCalls.push('vitals');
        if (procedures.status === 'rejected') failedCalls.push('procedures');
        if (diseases.status === 'rejected') failedCalls.push('diseases');
        
        if (failedCalls.length > 0) {
          console.error('❌ Some health data calls failed:', failedCalls);
          if (failedCalls.length < 6) {
            showError(`Failed to fetch: ${failedCalls.join(', ')}`);
          }
        }
        
        dispatch({
          type: ActionTypes.SET_HEALTH_DATA,
          payload: healthData
        });
        
        console.log('✅ Fetched health data using individual endpoints');
        return healthData;
      }
    } catch (error) {
      console.error('❌ Critical error fetching health data:', error);
      showError('Failed to fetch health data. Please check your connection.');
      dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: false });
      
      // Return empty data structure
      const emptyHealthData = {
        conditions: [],
        medications: [],
        labs: [],
        vitals: [],
        procedures: [],
        diseases: []
      };
      
      dispatch({
        type: ActionTypes.SET_HEALTH_DATA,
        payload: emptyHealthData
      });
      
      return emptyHealthData;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, showError]);

  // Get just one type of health data
  const fetchHealthDataCategory = useCallback(async (category) => {
    setLoading(true);
    dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: true });
    
    try {
      let data;
      switch (category) {
        case 'conditions':
          data = await apiService.getConditions();
          break;
        case 'medications':
          data = await apiService.getMedications();
          break;
        case 'labs':
          data = await apiService.getLabs();
          break;
        case 'vitals':
          data = await apiService.getVitals();
          break;
        case 'procedures':
          data = await apiService.getProcedures();
          break;
        case 'diseases':
          data = await apiService.getDiseases();
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }

      dispatch({
        type: ActionTypes.SET_HEALTH_DATA_CATEGORY,
        payload: { category, data: data || [] }
      });

      return data;
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      showError(`Failed to fetch ${category}. Using offline data.`);
      dispatch({ type: ActionTypes.SET_HEALTH_DATA_LOADING, payload: false });
      
      // Return empty if error
      const fallbackData = [];
      dispatch({
        type: ActionTypes.SET_HEALTH_DATA_CATEGORY,
        payload: { category, data: fallbackData }
      });
      
      return fallbackData;
    } finally {
      setLoading(false);
    }
  }, [dispatch, showError]);

  // Find test results outside normal range
  const getAbnormalResults = useCallback(() => {
    const { labs, vitals } = state.healthData;
    
    const abnormalLabs = labs.filter(lab => 
      lab.fact && isAbnormalLabResult(lab.value, lab.fact.ref_low, lab.fact.ref_high)
    );

    const abnormalVitals = vitals.filter(vital => 
      vital.fact && isAbnormalVitalSign(vital.value, vital.fact.ref_low, vital.fact.ref_high)
    );

    return {
      labs: abnormalLabs,
      vitals: abnormalVitals,
      total: abnormalLabs.length + abnormalVitals.length
    };
  }, [state.healthData]);

  // Get data from last X days
  const getRecentHealthData = useCallback((days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { labs, vitals, medications, procedures } = state.healthData;

    const filterRecent = (items, dateField = 'observed') => 
      items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= cutoffDate;
      });

    return {
      labs: filterRecent(labs),
      vitals: filterRecent(vitals),
      medications: filterRecent(medications, 'start_date'),
      procedures: filterRecent(procedures, 'date'),
      total: filterRecent(labs).length + filterRecent(vitals).length + 
             filterRecent(medications, 'start_date').length + filterRecent(procedures, 'date').length
    };
  }, [state.healthData]);

  // Calculate summary stats
  const getHealthSummary = useCallback(() => {
    const { conditions, medications, labs, vitals, procedures } = state.healthData;
    const abnormal = getAbnormalResults();
    const recent = getRecentHealthData();

    return {
      totalRecords: conditions.length + medications.length + labs.length + vitals.length + procedures.length,
      activeConditions: conditions.filter(c => c.clinical_status === 'active').length,
      currentMedications: medications.filter(m => !m.end_date || new Date(m.end_date) > new Date()).length,
      abnormalResults: abnormal.total,
      recentActivity: recent.total,
      lastUpdated: state.healthData.lastUpdated
    };
  }, [state.healthData, getAbnormalResults, getRecentHealthData]);

  // Search through all health records
  const searchHealthData = useCallback((query, categories = []) => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const { conditions, medications, labs, vitals, procedures } = state.healthData;
    
    const results = [];

    const searchInCategory = (items, category, searchFields) => {
      return items.filter(item => {
        return searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value && value.toString().toLowerCase().includes(searchTerm);
        });
      }).map(item => ({ ...item, category }));
    };

    if (categories.length === 0 || categories.includes('conditions')) {
      results.push(...searchInCategory(conditions, 'conditions', ['name', 'clinical_status']));
    }

    if (categories.length === 0 || categories.includes('medications')) {
      results.push(...searchInCategory(medications, 'medications', ['label', 'fact.label']));
    }

    if (categories.length === 0 || categories.includes('labs')) {
      results.push(...searchInCategory(labs, 'labs', ['fact.label', 'fact.category']));
    }

    if (categories.length === 0 || categories.includes('vitals')) {
      results.push(...searchInCategory(vitals, 'vitals', ['fact.label', 'fact.category']));
    }

    if (categories.length === 0 || categories.includes('procedures')) {
      results.push(...searchInCategory(procedures, 'procedures', ['label', 'fact.label']));
    }

    return results;
  }, [state.healthData]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.auth.isAuthenticated && state.healthData.lastUpdated) {
        const lastUpdate = new Date(state.healthData.lastUpdated);
        const now = new Date();
        const timeDiff = now - lastUpdate;
        
        // Auto refresh if data is stale
        if (timeDiff > 5 * 60 * 1000) {
          fetchAllHealthData(false); // Don't show loading
        }
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [state.auth.isAuthenticated, state.healthData.lastUpdated, fetchAllHealthData]);

  return {
    ...state.healthData,
    loading,
    refreshing,
    fetchAllHealthData,
    fetchHealthDataCategory,
    getAbnormalResults,
    getRecentHealthData,
    getHealthSummary,
    searchHealthData
  };
};

// Hook for filtering and sorting health data
export const useHealthDataFilters = (initialData = []) => {
  const [filteredData, setFilteredData] = useState(initialData);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { start: null, end: null },
    status: [],
    category: [],
    abnormalOnly: false
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  // Filter and sort the data
  useEffect(() => {
    let result = [...initialData];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(item => {
        const itemDate = new Date(item.observed || item.date || item.start_date);
        if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) return false;
        return true;
      });
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(item => 
        filters.status.includes(item.status || item.clinical_status)
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      result = result.filter(item => 
        filters.category.includes(item.category || item.fact?.category)
      );
    }

    // Apply abnormal only filter
    if (filters.abnormalOnly) {
      result = result.filter(item => {
        if (item.fact && (item.fact.ref_low !== null || item.fact.ref_high !== null)) {
          return isAbnormalLabResult(item.value, item.fact.ref_low, item.fact.ref_high);
        }
        return false;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result = sortByDate(result, sortConfig.key, sortConfig.direction === 'asc');
    }

    setFilteredData(result);
  }, [initialData, filters, sortConfig]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      dateRange: { start: null, end: null },
      status: [],
      category: [],
      abnormalOnly: false
    });
  }, []);

  const updateSort = useCallback((key, direction = 'desc') => {
    setSortConfig({ key, direction });
  }, []);

  return {
    filteredData,
    filters,
    sortConfig,
    updateFilter,
    clearFilters,
    updateSort,
    hasActiveFilters: Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    )
  };
};

export default useHealthData;