import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Starting state for the whole app
const initialState = {
  auth: {
    user: null,
    token: localStorage.getItem('fountain_token'),
    isAuthenticated: false,
    loading: false
  },
  healthData: {
    conditions: [],
    medications: [],
    labs: [],
    vitals: [],
    procedures: [],
    diseases: [],
    loading: false,
    lastUpdated: null
  },
  providers: {
    list: [],
    facilities: [],
    loading: false
  },
  requests: {
    batches: [],
    activeRequest: null,
    loading: false
  },
  alerts: {
    list: [], // Empty - will be populated from backend
    unreadCount: 0,
    loading: false
  },
  ui: {
    sidebarOpen: false,
    theme: 'light'
  }
};

// All the actions we can do in the app
export const ActionTypes = {
  // Login/logout stuff
  SET_AUTH_LOADING: 'SET_AUTH_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  
  // Managing health records
  SET_HEALTH_DATA_LOADING: 'SET_HEALTH_DATA_LOADING',
  SET_HEALTH_DATA: 'SET_HEALTH_DATA',
  SET_HEALTH_DATA_CATEGORY: 'SET_HEALTH_DATA_CATEGORY',
  CLEAR_HEALTH_DATA: 'CLEAR_HEALTH_DATA',
  ADD_CONDITION: 'ADD_CONDITION',
  EDIT_CONDITION: 'EDIT_CONDITION',
  DELETE_CONDITION: 'DELETE_CONDITION',
  ADD_MEDICATION: 'ADD_MEDICATION',
  EDIT_MEDICATION: 'EDIT_MEDICATION',
  DELETE_MEDICATION: 'DELETE_MEDICATION',
  ADD_LAB_RESULT: 'ADD_LAB_RESULT',
  EDIT_LAB_RESULT: 'EDIT_LAB_RESULT',
  DELETE_LAB_RESULT: 'DELETE_LAB_RESULT',
  ADD_VITAL: 'ADD_VITAL',
  EDIT_VITAL: 'EDIT_VITAL',
  DELETE_VITAL: 'DELETE_VITAL',
  ADD_PROCEDURE: 'ADD_PROCEDURE',
  EDIT_PROCEDURE: 'EDIT_PROCEDURE',
  DELETE_PROCEDURE: 'DELETE_PROCEDURE',
  
  // Provider/facility stuff
  SET_PROVIDERS_LOADING: 'SET_PROVIDERS_LOADING',
  SET_PROVIDERS: 'SET_PROVIDERS',
  SET_FACILITIES: 'SET_FACILITIES',
  
  // Medical record requests
  SET_REQUESTS_LOADING: 'SET_REQUESTS_LOADING',
  SET_REQUEST_BATCHES: 'SET_REQUEST_BATCHES',
  SET_ACTIVE_REQUEST: 'SET_ACTIVE_REQUEST',
  
  // Reminder/alert management
  SET_ALERTS_LOADING: 'SET_ALERTS_LOADING',
  SET_ALERTS: 'SET_ALERTS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_ALERT_READ: 'MARK_ALERT_READ',
  MARK_ALERT_UNREAD: 'MARK_ALERT_UNREAD',
  DELETE_ALERT: 'DELETE_ALERT',
  UPDATE_ALERT_STATUS: 'UPDATE_ALERT_STATUS',
  
  // UI state changes
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME',
  
  // Dashboard specific
  REFRESH_DASHBOARD_DATA: 'REFRESH_DASHBOARD_DATA',
  CLEAR_ALL_HEALTH_DATA: 'CLEAR_ALL_HEALTH_DATA'
};

// Main reducer that handles all state changes
const appReducer = (state, action) => {
  switch (action.type) {
    // Login/logout handling
    case ActionTypes.SET_AUTH_LOADING:
      return {
        ...state,
        auth: { ...state.auth, loading: action.payload }
      };
      
    case ActionTypes.LOGIN_SUCCESS:
      console.log('✅ Reducer: LOGIN_SUCCESS called with payload:', action.payload);
      const newAuthState = {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
      console.log('✅ Reducer: New auth state:', newAuthState);
      return {
        ...state,
        auth: newAuthState
      };
      
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        }
      };
      
    case ActionTypes.LOGOUT:
      // Clear auth tokens from storage
      localStorage.removeItem('fountain_token');
      localStorage.removeItem('fountain_user');
      return {
        ...initialState,
        ui: state.ui // Keep UI preferences
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        auth: { ...state.auth, user: action.payload }
      };
      
    // Health data management
    case ActionTypes.SET_HEALTH_DATA_LOADING:
      return {
        ...state,
        healthData: { ...state.healthData, loading: action.payload }
      };
      
    case ActionTypes.SET_HEALTH_DATA:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          ...action.payload,
          loading: false,
          lastUpdated: new Date().toISOString()
        }
      };
      
    case ActionTypes.SET_HEALTH_DATA_CATEGORY:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          [action.payload.category]: action.payload.data,
          loading: false,
          lastUpdated: new Date().toISOString()
        }
      };
      
    case ActionTypes.CLEAR_HEALTH_DATA:
      return {
        ...state,
        healthData: initialState.healthData
      };
      
    // Conditions
    case ActionTypes.ADD_CONDITION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          conditions: [...state.healthData.conditions, action.payload]
        }
      };
      
    case ActionTypes.EDIT_CONDITION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          conditions: state.healthData.conditions.map(condition =>
            condition.id === action.payload.id ? action.payload : condition
          )
        }
      };
      
    case ActionTypes.DELETE_CONDITION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          conditions: state.healthData.conditions.filter(condition => condition.id !== action.payload)
        }
      };
      
    // Medications
    case ActionTypes.ADD_MEDICATION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: [...state.healthData.medications, action.payload]
        }
      };
      
    case ActionTypes.EDIT_MEDICATION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: state.healthData.medications.map(med =>
            med.id === action.payload.id ? action.payload : med
          )
        }
      };
      
    case ActionTypes.DELETE_MEDICATION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: state.healthData.medications.filter(med => med.id !== action.payload)
        }
      };
      
    // Lab results
    case ActionTypes.ADD_LAB_RESULT:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          labs: [...state.healthData.labs, action.payload]
        }
      };
      
    case ActionTypes.EDIT_LAB_RESULT:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          labs: state.healthData.labs.map(lab =>
            lab.id === action.payload.id ? action.payload : lab
          )
        }
      };
      
    case ActionTypes.DELETE_LAB_RESULT:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          labs: state.healthData.labs.filter(lab => lab.id !== action.payload)
        }
      };
      
    // Vitals
    case ActionTypes.ADD_VITAL:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          vitals: [...state.healthData.vitals, action.payload]
        }
      };
      
    case ActionTypes.EDIT_VITAL:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          vitals: state.healthData.vitals.map(vital =>
            vital.id === action.payload.id ? action.payload : vital
          )
        }
      };
      
    case ActionTypes.DELETE_VITAL:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          vitals: state.healthData.vitals.filter(vital => vital.id !== action.payload)
        }
      };
      
    // Procedures
    case ActionTypes.ADD_PROCEDURE:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          procedures: [...state.healthData.procedures, action.payload]
        }
      };
      
    case ActionTypes.EDIT_PROCEDURE:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          procedures: state.healthData.procedures.map(proc =>
            proc.id === action.payload.id ? action.payload : proc
          )
        }
      };
      
    case ActionTypes.DELETE_PROCEDURE:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          procedures: state.healthData.procedures.filter(proc => proc.id !== action.payload)
        }
      };
      
    // Providers & facilities
    case ActionTypes.SET_PROVIDERS_LOADING:
      return {
        ...state,
        providers: { ...state.providers, loading: action.payload }
      };
      
    case ActionTypes.SET_PROVIDERS:
      return {
        ...state,
        providers: {
          ...state.providers,
          list: action.payload,
          loading: false
        }
      };
      
    case ActionTypes.SET_FACILITIES:
      return {
        ...state,
        providers: {
          ...state.providers,
          facilities: action.payload,
          loading: false
        }
      };
      
    // Request batches
    case ActionTypes.SET_REQUESTS_LOADING:
      return {
        ...state,
        requests: { ...state.requests, loading: action.payload }
      };
      
    case ActionTypes.SET_REQUEST_BATCHES:
      return {
        ...state,
        requests: {
          ...state.requests,
          batches: action.payload,
          loading: false
        }
      };
      
    case ActionTypes.SET_ACTIVE_REQUEST:
      return {
        ...state,
        requests: {
          ...state.requests,
          activeRequest: action.payload
        }
      };
      
    // Alerts & reminders
    case ActionTypes.SET_ALERTS_LOADING:
      return {
        ...state,
        alerts: { ...state.alerts, loading: action.payload }
      };
      
    case ActionTypes.SET_ALERTS:
      const unreadCount = action.payload.filter(alert => 
        alert.status === 'active' || alert.status === 'unread'
      ).length;
      
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: action.payload,
          unreadCount,
          loading: false
        }
      };
      
    case ActionTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          unreadCount: action.payload
        }
      };
      
    case ActionTypes.MARK_ALERT_READ:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.map(alert =>
            alert.id === action.payload 
              ? { ...alert, status: 'acknowledged' }
              : alert
          ),
          unreadCount: Math.max(0, state.alerts.unreadCount - 1)
        }
      };
      
    case ActionTypes.MARK_ALERT_UNREAD:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.map(alert =>
            alert.id === action.payload 
              ? { ...alert, status: 'active' }
              : alert
          ),
          unreadCount: state.alerts.unreadCount + 1
        }
      };
      
    case ActionTypes.DELETE_ALERT:
      const alertToDelete = state.alerts.list.find(a => a.id === action.payload);
      const wasUnread = alertToDelete && (alertToDelete.status === 'active' || alertToDelete.status === 'unread');
      
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.filter(alert => alert.id !== action.payload),
          unreadCount: wasUnread ? Math.max(0, state.alerts.unreadCount - 1) : state.alerts.unreadCount
        }
      };
      
    case ActionTypes.UPDATE_ALERT_STATUS:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.map(alert =>
            alert.id === action.payload.id
              ? { ...alert, status: action.payload.status }
              : alert
          )
        }
      };
      
    // UI management
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };
      
    case ActionTypes.SET_THEME:
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload }
      };
      
    // Dashboard refresh
    case ActionTypes.REFRESH_DASHBOARD_DATA:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          lastUpdated: new Date().toISOString()
        }
      };
      
    case ActionTypes.CLEAR_ALL_HEALTH_DATA:
      return {
        ...state,
        healthData: initialState.healthData,
        alerts: initialState.alerts,
        requests: initialState.requests
      };
      
    default:
      return state;
  }
};

// Create the context
const AppContext = createContext();

// Provider component that wraps the app
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for saved auth on app load
  useEffect(() => {
    const token = localStorage.getItem('fountain_token');
    const savedUser = localStorage.getItem('fountain_user');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: { token, user }
        });
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        localStorage.removeItem('fountain_token');
        localStorage.removeItem('fountain_user');
      }
    }
  }, []);

  // Save auth changes to localStorage
  useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.token) {
      localStorage.setItem('fountain_token', state.auth.token);
      if (state.auth.user) {
        localStorage.setItem('fountain_user', JSON.stringify(state.auth.user));
      }
    } else {
      localStorage.removeItem('fountain_token');
      localStorage.removeItem('fountain_user');
    }
  }, [state.auth]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;