import { createContext, useContext, useReducer } from 'react';

const HealthDataContext = createContext(null);

const initialState = {
  conditions: [],
  medications: [],
  vitals: [],
  labs: [],
  alerts: [],
  isLoading: false,
  error: null,
  lastUpdated: null
};

const healthDataReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        [action.payload.type]: action.payload.data,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'UPDATE_ALERTS':
      return {
        ...state,
        alerts: action.payload
      };
    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload)
      };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
};

export const HealthDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(healthDataReducer, initialState);

  const fetchHealthData = async (type, token) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      let endpoint;
      switch (type) {
        case 'conditions':
          endpoint = '/profile/me/conditions';
          break;
        case 'medications':
          endpoint = '/profile/me/medications';
          break;
        case 'vitals':
          endpoint = '/profile/me/vitals';
          break;
        case 'labs':
          endpoint = '/profile/me/labs';
          break;
        case 'alerts':
          endpoint = '/alerts';
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      // TODO: Replace with actual API call
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const data = await response.json();
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          type,
          data
        }
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const fetchAllHealthData = async (token) => {
    try {
      await Promise.all([
        fetchHealthData('conditions', token),
        fetchHealthData('medications', token),
        fetchHealthData('vitals', token),
        fetchHealthData('labs', token),
        fetchHealthData('alerts', token)
      ]);
    } catch (error) {
      console.error('Failed to fetch all health data:', error);
    }
  };

  const dismissAlert = (alertId) => {
    dispatch({
      type: 'DISMISS_ALERT',
      payload: alertId
    });
  };

  const refreshData = async (token) => {
    await fetchAllHealthData(token);
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  const value = {
    ...state,
    fetchHealthData,
    fetchAllHealthData,
    dismissAlert,
    refreshData,
    clearData
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};