import React, { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';

import { useSettings } from '../../context/SettingsContext';
import { useUserPreferences, useRecentlyViewed, useSearchHistory } from '../../hooks/useLocalStorage';
import { useWebNotifications } from '../../hooks/useNotifications';
import { useHealthData } from '../../hooks/useHealthData';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Badge, 
  Tabs, 
  TabPanel,
  Alert 
} from '../../components/common';

const StateDemo = () => {
  const { state } = useApp();
  
  const { 
    settings, 
    updateSetting, 
    toggleTheme, 
    toggleSidebar,
    exportSettings,
    resetSettings 
  } = useSettings();
  
  const { preferences, updatePreference } = useUserPreferences();
  const { recentItems, addRecentItem, clearRecentItems } = useRecentlyViewed();
  const { searchHistory, addSearch, clearSearchHistory } = useSearchHistory();
  const { 
    permission, 
    requestPermission, 
    showHealthAlert: showWebHealthAlert 
  } = useWebNotifications();
  
  const { 
    getHealthSummary, 
    getAbnormalResults, 
    searchHealthData 
  } = useHealthData();

  const [demoInputs, setDemoInputs] = useState({
    notificationMessage: 'This is a test notification',
    searchQuery: '',
    itemName: 'Sample Health Record'
  });

  const tabs = [
    {
      key: 'app-state',
      label: 'App State',
      content: (
        <TabPanel>
          <div className="space-y-6">
            <Card title="Authentication State">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Authenticated:</span>
                    <Badge variant={state.auth.isAuthenticated ? 'success' : 'error'}>
                      {state.auth.isAuthenticated ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Loading:</span>
                    <Badge variant={state.auth.loading ? 'warning' : 'default'}>
                      {state.auth.loading ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                {state.auth.user && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700">User Email:</span>
                    <span className="ml-2 text-neutral-900">{state.auth.user.email}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Health Data State">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {state.healthData.conditions.length}
                    </div>
                    <div className="text-sm text-neutral-600">Conditions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {state.healthData.medications.length}
                    </div>
                    <div className="text-sm text-neutral-600">Medications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning-600">
                      {state.healthData.labs.length}
                    </div>
                    <div className="text-sm text-neutral-600">Lab Results</div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-700">Loading:</span>
                  <Badge variant={state.healthData.loading ? 'warning' : 'success'}>
                    {state.healthData.loading ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card title="Alerts State">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Unread Count:</span>
                  <Badge variant="error" size="sm">
                    {state.alerts.unreadCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Total Alerts:</span>
                  <span className="text-neutral-900">{state.alerts.list.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>
      )
    },
    {
      key: 'notifications',
      label: 'Notifications',
      content: (
        <TabPanel>
          <div className="space-y-6">
            <Card title="Toast Notifications">
              <div className="space-y-4">
                <Input
                  label="Notification Message"
                  value={demoInputs.notificationMessage}
                  onChange={(e) => setDemoInputs(prev => ({
                    ...prev,
                    notificationMessage: e.target.value
                  }))}
                  placeholder="Enter notification message"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => console.log(demoInputs.notificationMessage)}
                  >
                    Success
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => console.error(demoInputs.notificationMessage)}
                  >
                    Error
                  </Button>
                  <Button 
                    variant="warning" 
                    size="sm"
                    onClick={() => console.warn(demoInputs.notificationMessage)}
                  >
                    Warning
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => console.info(demoInputs.notificationMessage)}
                  >
                    Info
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-neutral-900 mb-2">Health-Specific Notifications</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => console.warn('Your blood pressure reading is slightly elevated')}
                    >
                      Health Alert
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => console.log('Notifications cleared')}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Web Notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Permission:</span>
                  <Badge variant={permission === 'granted' ? 'success' : 'warning'}>
                    {permission}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={requestPermission}
                    disabled={permission === 'granted'}
                  >
                    Request Permission
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => console.log('Web notification test would be shown')}
                    disabled={permission !== 'granted'}
                  >
                    Test Web Notification
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>
      )
    },
    {
      key: 'settings',
      label: 'Settings',
      content: (
        <TabPanel>
          <div className="space-y-6">
            <Card title="Theme & Appearance">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Theme:</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.theme === 'light' ? 'success' : 'default'}>
                      {settings.theme}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={toggleTheme}>
                      Toggle
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Sidebar Collapsed:</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.sidebarCollapsed ? 'warning' : 'success'}>
                      {settings.sidebarCollapsed ? 'Yes' : 'No'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                      Toggle
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Preferences">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Language:</span>
                    <Select
                      value={{ value: settings.language, label: settings.language.toUpperCase() }}
                      onChange={(option) => updateSetting('language', option.value)}
                      options={[
                        { value: 'en', label: 'EN' },
                        { value: 'es', label: 'ES' },
                        { value: 'fr', label: 'FR' }
                      ]}
                      size="sm"
                    />
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Date Format:</span>
                    <Select
                      value={{ value: settings.dateFormat, label: settings.dateFormat }}
                      onChange={(option) => updateSetting('dateFormat', option.value)}
                      options={[
                        { value: 'MMM dd, yyyy', label: 'MMM dd, yyyy' },
                        { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
                        { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' }
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportSettings}>
                    Export Settings
                  </Button>
                  <Button variant="danger" size="sm" onClick={resetSettings}>
                    Reset to Default
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>
      )
    },
    {
      key: 'local-storage',
      label: 'Local Storage',
      content: (
        <TabPanel>
          <div className="space-y-6">
            <Card title="Recently Viewed Items">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={demoInputs.itemName}
                    onChange={(e) => setDemoInputs(prev => ({
                      ...prev,
                      itemName: e.target.value
                    }))}
                    placeholder="Enter item name"
                    size="sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addRecentItem({
                      id: Date.now(),
                      name: demoInputs.itemName,
                      type: 'health-record'
                    })}
                  >
                    Add Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearRecentItems}
                  >
                    Clear All
                  </Button>
                </div>
                
                {recentItems.length > 0 ? (
                  <div className="space-y-2">
                    {recentItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                        <span className="text-sm text-neutral-900">{item.name}</span>
                        <span className="text-xs text-neutral-500">
                          {new Date(item.viewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No recent items</Alert>
                )}
              </div>
            </Card>

            <Card title="Search History">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={demoInputs.searchQuery}
                    onChange={(e) => setDemoInputs(prev => ({
                      ...prev,
                      searchQuery: e.target.value
                    }))}
                    placeholder="Enter search query"
                    size="sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      addSearch(demoInputs.searchQuery);
                      setDemoInputs(prev => ({ ...prev, searchQuery: '' }));
                    }}
                  >
                    Add Search
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearchHistory}
                  >
                    Clear History
                  </Button>
                </div>
                
                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.map((search, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                        <span className="text-sm text-neutral-900">{search.query}</span>
                        <span className="text-xs text-neutral-500">
                          {new Date(search.searchedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No search history</Alert>
                )}
              </div>
            </Card>
          </div>
        </TabPanel>
      )
    }
  ];

  return (
    <AppLayout>
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            State Management Demo
          </h1>
          <p className="text-neutral-600">
            Interactive demonstration of the application's state management system
          </p>
        </div>

        <Tabs tabs={tabs} variant="pills" />
      </div>
    </AppLayout>
  );
};

export default StateDemo;