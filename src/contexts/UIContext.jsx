import { createContext, useContext, useReducer } from 'react';

const UIContext = createContext(null);

const initialState = {
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  loading: {
    global: false,
    components: {}
  },
  modals: {}
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          global: action.payload
        }
      };
    case 'SET_COMPONENT_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          components: {
            ...state.loading.components,
            [action.payload.component]: action.payload.loading
          }
        }
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.id]: {
            ...action.payload,
            isOpen: true
          }
        }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: {
            ...state.modals[action.payload],
            isOpen: false
          }
        }
      };
    default:
      return state;
  }
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    localStorage.setItem('fountain_theme', theme);
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setSidebar = (isOpen) => {
    dispatch({ type: 'SET_SIDEBAR', payload: isOpen });
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const notificationWithId = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationWithId });

    // Auto-remove notification after duration
    if (notificationWithId.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notificationWithId.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const setGlobalLoading = (loading) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading });
  };

  const setComponentLoading = (component, loading) => {
    dispatch({ 
      type: 'SET_COMPONENT_LOADING', 
      payload: { component, loading } 
    });
  };

  const openModal = (modalConfig) => {
    dispatch({ type: 'OPEN_MODAL', payload: modalConfig });
  };

  const closeModal = (modalId) => {
    dispatch({ type: 'CLOSE_MODAL', payload: modalId });
  };

  // Notification shortcuts
  const showSuccess = (message, options = {}) =>
    addNotification({ type: 'success', message, ...options });

  const showError = (message, options = {}) =>
    addNotification({ type: 'error', message, duration: 8000, ...options });

  const showWarning = (message, options = {}) =>
    addNotification({ type: 'warning', message, ...options });

  const showInfo = (message, options = {}) =>
    addNotification({ type: 'info', message, ...options });

  const value = {
    ...state,
    setTheme,
    toggleSidebar,
    setSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    setGlobalLoading,
    setComponentLoading,
    openModal,
    closeModal,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};