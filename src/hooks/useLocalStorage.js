import { useState, useEffect } from 'react';

// Custom hook for managing localStorage with React state
export const useLocalStorage = (key, initialValue) => {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('fountain_preferences', {
    theme: 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sidebarCollapsed: false,
    notificationsEnabled: true,
    healthDataRefreshInterval: 300, // 5 minutes
    dashboardLayout: 'default',
    dateFormat: 'MMM dd, yyyy',
    timeFormat: '12h'
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sidebarCollapsed: false,
      notificationsEnabled: true,
      healthDataRefreshInterval: 300,
      dashboardLayout: 'default',
      dateFormat: 'MMM dd, yyyy',
      timeFormat: '12h'
    });
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences
  };
};

// Hook for managing recently viewed items
export const useRecentlyViewed = (maxItems = 10) => {
  const [recentItems, setRecentItems] = useLocalStorage('fountain_recent_items', []);

  const addRecentItem = (item) => {
    setRecentItems(prev => {
      // Remove existing item if it exists
      const filtered = prev.filter(existingItem => existingItem.id !== item.id);
      
      // Add new item to beginning and limit to maxItems
      return [
        { ...item, viewedAt: new Date().toISOString() },
        ...filtered
      ].slice(0, maxItems);
    });
  };

  const removeRecentItem = (itemId) => {
    setRecentItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearRecentItems = () => {
    setRecentItems([]);
  };

  return {
    recentItems,
    addRecentItem,
    removeRecentItem,
    clearRecentItems
  };
};

// Hook for managing search history
export const useSearchHistory = (maxItems = 20) => {
  const [searchHistory, setSearchHistory] = useLocalStorage('fountain_search_history', []);

  const addSearch = (query) => {
    if (!query.trim()) return;

    setSearchHistory(prev => {
      // Remove existing query if it exists
      const filtered = prev.filter(item => item.query !== query);
      
      // Add new query to beginning and limit to maxItems
      return [
        { query: query.trim(), searchedAt: new Date().toISOString() },
        ...filtered
      ].slice(0, maxItems);
    });
  };

  const removeSearch = (query) => {
    setSearchHistory(prev => prev.filter(item => item.query !== query));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  return {
    searchHistory,
    addSearch,
    removeSearch,
    clearSearchHistory
  };
};

export default useLocalStorage;