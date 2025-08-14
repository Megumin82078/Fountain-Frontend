import React, { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common';
import toast from '../../utils/toast';

const SettingsPage = () => {
  const { state } = useApp();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      healthAlerts: true,
      appointmentReminders: true,
      labResults: true
    },
    privacy: {
      shareWithProviders: true,
      allowDataAnalytics: false,
      showInSearch: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = (key) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic would go here
    toast.success('Settings saved successfully!');
  };

  return (
    <AppLayout>
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Settings
          </h1>
          <p className="text-gray-600 font-medium">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Settings */}
          <Card title="Notification Preferences" className="h-fit">
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'push' && 'Receive push notifications on your device'}
                      {key === 'healthAlerts' && 'Get notified about important health alerts'}
                      {key === 'appointmentReminders' && 'Reminders for upcoming appointments'}
                      {key === 'labResults' && 'Notifications when lab results are available'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationChange(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card title="Privacy & Sharing" className="h-fit">
            <div className="space-y-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">
                      {key === 'shareWithProviders' && 'Allow healthcare providers to access your records'}
                      {key === 'allowDataAnalytics' && 'Help improve our services with anonymous data'}
                      {key === 'showInSearch' && 'Make your profile discoverable by providers'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handlePrivacyChange(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* General Preferences */}
          <Card title="General Preferences" className="h-fit">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Theme
                </label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Language
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card title="Account Actions" className="h-fit">
            <div className="space-y-4">
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Export My Data
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Download Medical Records
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                Delete Account
              </button>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;