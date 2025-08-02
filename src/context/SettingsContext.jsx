import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Initial settings state
const initialSettings = {
  // Appearance
  theme: 'light',
  sidebarCollapsed: false,
  compactMode: false,
  
  // Localization
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MMM dd, yyyy',
  timeFormat: '12h',
  
  // Dashboard
  dashboardLayout: 'default',
  showWelcomeMessage: true,
  defaultPage: '/dashboard',
  
  // Health Data
  healthDataRefreshInterval: 300, // 5 minutes
  showAbnormalOnly: false,
  groupByCategory: true,
  defaultHealthView: 'all',
  
  // Notifications
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  medicationReminders: true,
  appointmentReminders: true,
  healthAlerts: true,
  
  // Privacy
  shareHealthData: false,
  allowAnalytics: true,
  sessionTimeout: 30, // minutes
  
  // Accessibility
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  
  // Data Management
  autoBackup: true,
  dataRetention: 365, // days
  exportFormat: 'json'
};

// Action types
const ActionTypes = {
  UPDATE_SETTING: 'UPDATE_SETTING',
  UPDATE_MULTIPLE_SETTINGS: 'UPDATE_MULTIPLE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  LOAD_SETTINGS: 'LOAD_SETTINGS'
};

// Reducer
const settingsReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_SETTING:
      return {
        ...state,
        [action.payload.key]: action.payload.value
      };
      
    case ActionTypes.UPDATE_MULTIPLE_SETTINGS:
      return {
        ...state,
        ...action.payload
      };
      
    case ActionTypes.RESET_SETTINGS:
      return { ...initialSettings };
      
    case ActionTypes.LOAD_SETTINGS:
      return {
        ...initialSettings,
        ...action.payload
      };
      
    default:
      return state;
  }
};

// Create context
const SettingsContext = createContext();

// Provider component
export const SettingsProvider = ({ children }) => {
  const [storedSettings, setStoredSettings] = useLocalStorage('fountain_settings', {});
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (storedSettings && Object.keys(storedSettings).length > 0) {
      dispatch({
        type: ActionTypes.LOAD_SETTINGS,
        payload: storedSettings
      });
    }
  }, [storedSettings]);

  // Update setting
  const updateSetting = (key, value) => {
    dispatch({
      type: ActionTypes.UPDATE_SETTING,
      payload: { key, value }
    });
    
    // Update localStorage
    setStoredSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update multiple settings
  const updateSettings = (newSettings) => {
    dispatch({
      type: ActionTypes.UPDATE_MULTIPLE_SETTINGS,
      payload: newSettings
    });
    
    // Update localStorage
    setStoredSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Reset all settings
  const resetSettings = () => {
    dispatch({ type: ActionTypes.RESET_SETTINGS });
    setStoredSettings({});
  };

  // Get setting with fallback
  const getSetting = (key, fallback = null) => {
    return settings[key] !== undefined ? settings[key] : fallback;
  };

  // Theme-related helpers
  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSetting('theme', newTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  };

  // Apply theme on settings change
  useEffect(() => {
    applyTheme();
  }, [settings.theme]);

  // Sidebar helpers
  const toggleSidebar = () => {
    updateSetting('sidebarCollapsed', !settings.sidebarCollapsed);
  };

  // Notification helpers
  const toggleNotifications = (type) => {
    updateSetting(type, !settings[type]);
  };

  // Language helpers
  const changeLanguage = (language) => {
    updateSetting('language', language);
    // Here you would integrate with i18n library
  };

  // Accessibility helpers
  const toggleHighContrast = () => {
    const newValue = !settings.highContrast;
    updateSetting('highContrast', newValue);
    
    // Apply high contrast mode
    document.documentElement.classList.toggle('high-contrast', newValue);
  };

  const toggleReducedMotion = () => {
    const newValue = !settings.reducedMotion;
    updateSetting('reducedMotion', newValue);
    
    // Apply reduced motion
    document.documentElement.classList.toggle('reduced-motion', newValue);
  };

  const changeFontSize = (size) => {
    updateSetting('fontSize', size);
    
    // Apply font size class
    document.documentElement.className = document.documentElement.className
      .replace(/font-size-\w+/g, '');
    document.documentElement.classList.add(`font-size-${size}`);
  };

  // Export settings
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fountain-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import settings
  const importSettings = (settingsData) => {
    try {
      const parsedSettings = typeof settingsData === 'string' 
        ? JSON.parse(settingsData) 
        : settingsData;
        
      // Validate settings structure
      const validSettings = {};
      Object.keys(initialSettings).forEach(key => {
        if (parsedSettings.hasOwnProperty(key)) {
          validSettings[key] = parsedSettings[key];
        }
      });
      
      updateSettings(validSettings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  // Check if settings are modified from default
  const hasModifiedSettings = () => {
    return Object.keys(settings).some(key => 
      settings[key] !== initialSettings[key]
    );
  };

  const contextValue = {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    getSetting,
    toggleTheme,
    toggleSidebar,
    toggleNotifications,
    changeLanguage,
    toggleHighContrast,
    toggleReducedMotion,
    changeFontSize,
    exportSettings,
    importSettings,
    hasModifiedSettings,
    initialSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export default SettingsContext;