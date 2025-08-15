import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';
import { validateStoredProfile } from '../utils/profileValidator';

// Starting state for the whole app
// Safe localStorage access
const getStoredToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const initialState = {
  auth: {
    user: null,
    token: getStoredToken(),
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
  UPDATE_USER_AVATAR: 'UPDATE_USER_AVATAR',
  
  // Managing health records
  SET_HEALTH_DATA_LOADING: 'SET_HEALTH_DATA_LOADING',
  SET_HEALTH_DATA: 'SET_HEALTH_DATA',
  SET_HEALTH_DATA_CATEGORY: 'SET_HEALTH_DATA_CATEGORY',
  CLEAR_HEALTH_DATA: 'CLEAR_HEALTH_DATA',
  SET_MEDICATIONS: 'SET_MEDICATIONS',
  SET_LAB_RESULTS: 'SET_LAB_RESULTS',
  SET_VITALS: 'SET_VITALS',
  SET_PROCEDURES: 'SET_PROCEDURES',
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
      return {
        ...state,
        auth: {
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false
        }
      };
      
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        }
      };
      
    case ActionTypes.LOGOUT:
      localStorage.removeItem('fountain_token');
      return {
        ...state,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        },
        healthData: initialState.healthData,
        providers: initialState.providers,
        requests: initialState.requests,
        alerts: initialState.alerts
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: true,
          loading: false
        }
      };
      
    case ActionTypes.UPDATE_USER_AVATAR:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: {
            ...state.auth.user,
            avatar_url: action.payload
          }
        }
      };
      
    // Health record updates
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
      
    case ActionTypes.ADD_CONDITION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          conditions: [...state.healthData.conditions, action.payload]
        }
      };
      
    case ActionTypes.ADD_MEDICATION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: [...state.healthData.medications, action.payload]
        }
      };
      
    case ActionTypes.ADD_LAB_RESULT:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          labs: [...state.healthData.labs, action.payload]
        }
      };
      
    case ActionTypes.ADD_VITAL:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          vitals: [...state.healthData.vitals, action.payload]
        }
      };

    // Edit actions
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

    case ActionTypes.EDIT_MEDICATION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: state.healthData.medications.map(medication =>
            medication.id === action.payload.id ? action.payload : medication
          )
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

    // Delete actions
    case ActionTypes.DELETE_CONDITION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          conditions: state.healthData.conditions.filter(condition => condition.id !== action.payload)
        }
      };

    case ActionTypes.DELETE_MEDICATION:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: state.healthData.medications.filter(medication => medication.id !== action.payload)
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

    case ActionTypes.DELETE_VITAL:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          vitals: state.healthData.vitals.filter(vital => vital.id !== action.payload)
        }
      };

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
          procedures: state.healthData.procedures.map(procedure =>
            procedure.id === action.payload.id ? action.payload : procedure
          )
        }
      };

    case ActionTypes.DELETE_PROCEDURE:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          procedures: state.healthData.procedures.filter(procedure => procedure.id !== action.payload)
        }
      };
      
    case ActionTypes.CLEAR_HEALTH_DATA:
      return {
        ...state,
        healthData: initialState.healthData
      };
      
    case ActionTypes.SET_MEDICATIONS:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          medications: action.payload,
          loading: false
        }
      };
      
    case ActionTypes.SET_LAB_RESULTS:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          labs: action.payload,
          loading: false
        }
      };
      
    case ActionTypes.SET_VITALS:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          vitals: action.payload,
          loading: false
        }
      };
      
    case ActionTypes.SET_PROCEDURES:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          procedures: action.payload,
          loading: false
        }
      };
      
    // Provider/facility updates
    case ActionTypes.SET_PROVIDERS_LOADING:
      return {
        ...state,
        providers: { ...state.providers, loading: action.payload }
      };
      
    case ActionTypes.SET_PROVIDERS:
      return {
        ...state,
        providers: { ...state.providers, list: action.payload, loading: false }
      };
      
    case ActionTypes.SET_FACILITIES:
      return {
        ...state,
        providers: { ...state.providers, facilities: action.payload, loading: false }
      };
      
    // Medical record request tracking
    case ActionTypes.SET_REQUESTS_LOADING:
      return {
        ...state,
        requests: { ...state.requests, loading: action.payload }
      };
      
    case ActionTypes.SET_REQUEST_BATCHES:
      return {
        ...state,
        requests: { ...state.requests, batches: action.payload, loading: false }
      };
      
    case ActionTypes.SET_ACTIVE_REQUEST:
      return {
        ...state,
        requests: { ...state.requests, activeRequest: action.payload }
      };
      
    // Reminder management
    case ActionTypes.SET_ALERTS_LOADING:
      return {
        ...state,
        alerts: { ...state.alerts, loading: action.payload }
      };
      
    case ActionTypes.SET_ALERTS:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: action.payload,
          loading: false,
          unreadCount: action.payload.filter(alert => alert.status === 'unread').length
        }
      };
      
    case ActionTypes.MARK_ALERT_READ: {
      console.log('Reducer: MARK_ALERT_READ called with payload:', action.payload);
      console.log('Current alerts list:', state.alerts.list);
      const updatedState = {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.map(alert =>
            alert.id === action.payload
              ? { ...alert, status: 'read' }
              : alert
          ),
          unreadCount: state.alerts.list.filter(alert => 
            alert.id === action.payload && alert.status === 'unread'
          ).length > 0 ? Math.max(0, state.alerts.unreadCount - 1) : state.alerts.unreadCount
        }
      };
      console.log('New state alerts:', updatedState.alerts.list);
      return updatedState;
    }
    
    case ActionTypes.MARK_ALERT_UNREAD:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.map(alert =>
            alert.id === action.payload
              ? { ...alert, status: 'unread' }
              : alert
          ),
          unreadCount: state.alerts.list.filter(alert => 
            alert.id === action.payload && alert.status !== 'unread'
          ).length > 0 ? state.alerts.unreadCount + 1 : state.alerts.unreadCount
        }
      };
    
    case ActionTypes.DELETE_ALERT: {
      const alertToDelete = state.alerts.list.find(alert => alert.id === action.payload);
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.filter(alert => alert.id !== action.payload),
          unreadCount: alertToDelete?.status === 'unread' 
            ? Math.max(0, state.alerts.unreadCount - 1) 
            : state.alerts.unreadCount
        }
      };
    }
    
    case ActionTypes.UPDATE_ALERT_STATUS: {
      const previousAlert = state.alerts.list.find(alert => alert.id === action.payload.id);
      const wasUnread = previousAlert?.status === 'unread';
      const isNowUnread = action.payload.status === 'unread';
      
      return {
        ...state,
        alerts: {
          ...state.alerts,
          list: state.alerts.list.map(alert =>
            alert.id === action.payload.id
              ? { ...alert, status: action.payload.status }
              : alert
          ),
          unreadCount: wasUnread && !isNowUnread 
            ? Math.max(0, state.alerts.unreadCount - 1)
            : !wasUnread && isNowUnread 
            ? state.alerts.unreadCount + 1
            : state.alerts.unreadCount
        }
      };
    }
      
    // UI stuff like sidebar and theme
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
      
    case ActionTypes.REFRESH_DASHBOARD_DATA:
      return {
        ...state,
        healthData: {
          ...state.healthData,
          loading: true,
          lastUpdated: new Date().toISOString()
        }
      };
      
    case ActionTypes.CLEAR_ALL_HEALTH_DATA:
      return {
        ...state,
        healthData: {
          ...initialState.healthData,
          lastUpdated: new Date().toISOString()
        }
      };
      
    default:
      return state;
  }
};

// Create the context
const AppContext = createContext();

// Provider wrapper for the whole app
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check if user was logged in before and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AppContext: Initializing auth state...');
      // Set loading to true while checking auth
      dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: true });
      
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      console.log('🔍 AppContext: Token exists:', !!token);
      console.log('🔍 AppContext: User data exists:', !!userData);
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('✅ AppContext: Parsed user data:', user);
          
          // Immediately restore auth state for better UX
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: {
              token,
              user
            }
          });
          console.log('✅ AppContext: LOGIN_SUCCESS dispatched');
          
          // Validate profile in background (simplified to avoid circular deps)
          const freshProfile = await validateStoredProfile(token);
          if (freshProfile) {
            dispatch({
              type: ActionTypes.SET_USER,
              payload: freshProfile
            });
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(freshProfile));
            console.log('✅ AppContext: User profile refreshed');
          }
        } catch (error) {
          console.error('❌ AppContext: Error parsing stored user data:', error);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          // Set loading to false on error
          dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: false });
        }
      } else {
        console.log('⚠️ AppContext: No stored auth data');
        // Set loading to false when no auth data exists
        dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Listen for profile updates from background fetches
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('📨 AppContext: Received profile update:', event.detail);
      dispatch({
        type: ActionTypes.SET_USER,
        payload: event.detail
      });
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to access state and dispatch from anywhere
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;