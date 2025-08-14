import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import toast from '../../utils/toast';

import { 
  Button, 
  Card, 
  HealthCard,
  Input,
  Select,
  Badge, 
  Alert,
  Modal,
  Tabs,
  TabPanel
} from '../../components/common';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Custom Heartbeat icon to match sidebar
const HeartbeatIcon = ({ className }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h2l2-2 2 4 2-2h2m4 0a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const VitalSignsPage = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVital, setSelectedVital] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingVital, setEditingVital] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newVital, setNewVital] = useState({
    type: 'blood_pressure',
    value: '',
    systolic: '',
    diastolic: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    location: '',
    notes: ''
  });

  const vitals = state.healthData.vitals || [];

  // Filter vitals
  const filteredVitals = vitals.filter(vital => {
    const matchesSearch = vital.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || vital.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const vitalDate = new Date(vital.date);
      const now = new Date();
      const daysDiff = (now - vitalDate) / (1000 * 60 * 60 * 24);
      
      switch (dateFilter) {
        case '7days':
          matchesDate = daysDiff <= 7;
          break;
        case '30days':
          matchesDate = daysDiff <= 30;
          break;
        case '90days':
          matchesDate = daysDiff <= 90;
          break;
        case '1year':
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Group vitals by type
  const groupedByType = filteredVitals.reduce((acc, vital) => {
    if (!acc[vital.type]) {
      acc[vital.type] = [];
    }
    acc[vital.type].push(vital);
    return acc;
  }, {});

  // Sort vitals by date (newest first)
  const sortedVitals = [...filteredVitals].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get latest reading for each vital type
  const getLatestReadings = () => {
    const latest = {};
    vitals.forEach(vital => {
      if (!latest[vital.type] || new Date(vital.date) > new Date(latest[vital.type].date)) {
        latest[vital.type] = vital;
      }
    });
    return latest;
  };

  const latestReadings = getLatestReadings();

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'weight', label: 'Weight' },
    { value: 'height', label: 'Height' },
    { value: 'bmi', label: 'BMI' },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation' },
    { value: 'respiratory_rate', label: 'Respiratory Rate' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  const getVitalIcon = (type) => {
    switch (type) {
      case 'blood_pressure':
        return '🩺';
      case 'heart_rate':
        return '❤️';
      case 'temperature':
        return '🌡️';
      case 'weight':
        return '⚖️';
      case 'height':
        return '📏';
      case 'bmi':
        return '📊';
      case 'oxygen_saturation':
        return '💨';
      case 'respiratory_rate':
        return '🫁';
      default:
        return '📋';
    }
  };

  const getVitalStatus = (vital) => {
    // This would typically involve comparing against normal ranges
    // For demo purposes, we'll use a simple flagged property
    if (vital.flagged) {
      return vital.severity === 'high' ? 'Critical' : 'Abnormal';
    }
    return 'Normal';
  };

  const getVitalVariant = (vital) => {
    if (vital.flagged) {
      return vital.severity === 'high' ? 'error' : 'warning';
    }
    return 'success';
  };

  const formatVitalValue = (vital) => {
    switch (vital.type) {
      case 'blood_pressure':
        return `${vital.systolic}/${vital.diastolic} mmHg`;
      case 'heart_rate':
        return `${vital.value} bpm`;
      case 'temperature':
        return `${vital.value}°F`;
      case 'weight':
        return `${vital.value} lbs`;
      case 'height':
        return `${vital.value} in`;
      case 'bmi':
        return `${vital.value}`;
      case 'oxygen_saturation':
        return `${vital.value}%`;
      case 'respiratory_rate':
        return `${vital.value}/min`;
      default:
        return `${vital.value} ${vital.unit || ''}`;
    }
  };

  const formatVitalType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleViewDetails = (vital) => {
    setSelectedVital(vital);
    setShowDetailsModal(true);
  };

  const handleAddVital = () => {
    setNewVital({
      type: 'blood_pressure',
      value: '',
      systolic: '',
      diastolic: '',
      unit: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      location: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleSaveVital = () => {
    // Validate based on vital type
    if (newVital.type === 'blood_pressure') {
      if (!newVital.systolic || !newVital.diastolic) {
        toast.error('Please enter both systolic and diastolic values');
        return;
      }
      
      const systolic = parseFloat(newVital.systolic);
      const diastolic = parseFloat(newVital.diastolic);
      
      if (isNaN(systolic) || isNaN(diastolic)) {
        toast.error('Blood pressure values must be numbers');
        return;
      }
      
      if (systolic < 40 || systolic > 300 || diastolic < 20 || diastolic > 200) {
        toast.error('Please enter valid blood pressure values');
        return;
      }
      
      if (systolic <= diastolic) {
        toast.error('Systolic pressure must be higher than diastolic');
        return;
      }
    } else {
      if (!newVital.value) {
        toast.error('Please enter a value for this vital sign');
        return;
      }
      
      const value = parseFloat(newVital.value);
      if (isNaN(value)) {
        toast.error('Value must be a number');
        return;
      }
      
      // Type-specific validation
      switch (newVital.type) {
        case 'heart_rate':
          if (value < 20 || value > 300) {
            toast.error('Heart rate must be between 20-300 bpm');
            return;
          }
          break;
        case 'temperature':
          if (value < 90 || value > 110) {
            toast.error('Temperature must be between 90-110°F');
            return;
          }
          break;
        case 'oxygen_saturation':
          if (value < 0 || value > 100) {
            toast.error('Oxygen saturation must be between 0-100%');
            return;
          }
          break;
        case 'weight':
          if (value < 0 || value > 1000) {
            toast.error('Please enter a valid weight');
            return;
          }
          break;
      }
    }

    // Check if vital is abnormal based on normal ranges
    const isAbnormal = checkIfVitalAbnormal(newVital);
    
    const vitalToAdd = {
      ...newVital,
      id: Date.now().toString(),
      date: `${newVital.date}T${newVital.time}:00.000Z`,
      flagged: isAbnormal,
      severity: isAbnormal ? determineVitalSeverity(newVital) : null
    };

    dispatch({
      type: 'ADD_VITAL',
      payload: vitalToAdd
    });

    setShowAddModal(false);
    toast.success('Vital sign recorded successfully!');
  };

  const handleEditVital = (vital) => {
    const vitalDate = new Date(vital.date);
    setEditingVital({
      ...vital,
      date: vitalDate.toISOString().split('T')[0],
      time: vitalDate.toTimeString().split(' ')[0].substring(0, 5)
    });
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateVital = () => {
    // Validate based on vital type
    if (editingVital.type === 'blood_pressure') {
      if (!editingVital.systolic || !editingVital.diastolic) {
        toast.error('Please enter both systolic and diastolic values');
        return;
      }
    } else {
      if (!editingVital.value) {
        toast.error('Please enter a value for this vital sign');
        return;
      }
    }

    // Check if vital is abnormal based on normal ranges
    const isAbnormal = checkIfVitalAbnormal(editingVital);
    
    const updatedVital = {
      ...editingVital,
      date: `${editingVital.date}T${editingVital.time}:00.000Z`,
      flagged: isAbnormal,
      severity: isAbnormal ? determineVitalSeverity(editingVital) : null
    };

    dispatch({
      type: 'EDIT_VITAL',
      payload: updatedVital
    });

    setShowEditModal(false);
    setEditingVital(null);
    toast.success('Vital sign updated successfully!');
  };

  const handleDeleteVital = (vitalId) => {
    if (window.confirm('Are you sure you want to delete this vital sign reading?')) {
      dispatch({
        type: 'DELETE_VITAL',
        payload: vitalId
      });
      setShowDetailsModal(false);
      toast.success('Vital sign deleted successfully!');
    }
  };

  const handleInputChange = (field, value) => {
    setNewVital(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingVital(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to check if a vital is abnormal
  const checkIfVitalAbnormal = (vital) => {
    const value = parseFloat(vital.value);
    const systolic = parseFloat(vital.systolic);
    const diastolic = parseFloat(vital.diastolic);
    
    switch (vital.type) {
      case 'blood_pressure':
        // Normal: systolic < 120 AND diastolic < 80
        return systolic >= 140 || diastolic >= 90 || systolic < 90 || diastolic < 60;
      case 'heart_rate':
        // Normal: 60-100 bpm
        return value < 60 || value > 100;
      case 'temperature':
        // Normal: 97-99°F
        return value < 97 || value > 99;
      case 'oxygen_saturation':
        // Normal: >95%
        return value < 95;
      case 'respiratory_rate':
        // Normal: 12-20 breaths/min
        return value < 12 || value > 20;
      case 'bmi':
        // Normal: 18.5-24.9
        return value < 18.5 || value > 24.9;
      default:
        return false;
    }
  };

  // Helper function to determine severity of abnormal vital
  const determineVitalSeverity = (vital) => {
    const value = parseFloat(vital.value);
    const systolic = parseFloat(vital.systolic);
    const diastolic = parseFloat(vital.diastolic);
    
    switch (vital.type) {
      case 'blood_pressure':
        // High severity for severe hypertension or hypotension
        if (systolic >= 180 || diastolic >= 110 || systolic < 80 || diastolic < 50) {
          return 'high';
        }
        return 'medium';
      case 'heart_rate':
        // High severity for extreme bradycardia or tachycardia
        if (value < 50 || value > 120) {
          return 'high';
        }
        return 'medium';
      case 'temperature':
        // High severity for high fever or hypothermia
        if (value >= 102 || value < 95) {
          return 'high';
        }
        return 'medium';
      case 'oxygen_saturation':
        // High severity for critically low oxygen
        if (value < 90) {
          return 'high';
        }
        return 'medium';
      default:
        return 'medium';
    }
  };

  // Helper function to get placeholder text for vital inputs
  const getVitalPlaceholder = (type) => {
    switch (type) {
      case 'heart_rate':
        return 'e.g., 72';
      case 'temperature':
        return 'e.g., 98.6';
      case 'weight':
        return 'e.g., 150';
      case 'height':
        return 'e.g., 68';
      case 'bmi':
        return 'e.g., 24.5';
      case 'oxygen_saturation':
        return 'e.g., 98';
      case 'respiratory_rate':
        return 'e.g., 16';
      default:
        return 'Enter value';
    }
  };

  const abnormalVitals = vitals.filter(v => v.flagged);

  const vitalTabs = [
    {
      key: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4">
          {/* Latest Readings */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Latest Readings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(latestReadings).map(([type, vital]) => (
                <HealthCard
                  key={vital.id}
                  title={formatVitalType(type)}
                  subtitle={formatVitalValue(vital)}
                  status={vital.flagged ? 'abnormal' : 'normal'}
                  variant={getVitalVariant(vital)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewDetails(vital)}
                >
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Status:</span>
                      <Badge variant={getVitalVariant(vital)} size="sm">
                        {getVitalStatus(vital)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-neutral-600">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>Date</span>
                      </div>
                      <span className="text-neutral-900">
                        {new Date(vital.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </HealthCard>
              ))}
            </div>
          </div>

          {/* Recent Abnormal Readings */}
          {abnormalVitals.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-500 mr-2" />
                Abnormal Readings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {abnormalVitals.slice(0, 6).map((vital) => (
                  <HealthCard
                    key={vital.id}
                    title={formatVitalType(vital.type)}
                    subtitle={formatVitalValue(vital)}
                    status="abnormal"
                    variant={getVitalVariant(vital)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(vital)}
                  >
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Status:</span>
                        <Badge variant={getVitalVariant(vital)} size="sm">
                          {getVitalStatus(vital)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Date:</span>
                        <span className="text-neutral-900">
                          {new Date(vital.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </HealthCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'timeline',
      label: 'Timeline',
      content: (
        <div className="space-y-4">
          {sortedVitals.length > 0 ? (
            sortedVitals.map((vital) => (
              <HealthCard
                key={vital.id}
                title={formatVitalType(vital.type)}
                subtitle={formatVitalValue(vital)}
                status={vital.flagged ? 'abnormal' : 'normal'}
                variant={getVitalVariant(vital)}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDetails(vital)}
              >
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Status:</span>
                    <Badge variant={getVitalVariant(vital)} size="sm">
                      {getVitalStatus(vital)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-neutral-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>Date</span>
                    </div>
                    <span className="text-neutral-900">
                      {new Date(vital.date).toLocaleDateString()}
                    </span>
                  </div>

                  {vital.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Location:</span>
                      <span className="text-neutral-900">{vital.location}</span>
                    </div>
                  )}

                  {vital.flagged && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-2 text-warning-600">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Outside normal range</span>
                      </div>
                    </div>
                  )}
                </div>
              </HealthCard>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No vital signs match your current filters.</div>
          )}
        </div>
      )
    },
    {
      key: 'by-type',
      label: 'By Type',
      content: (
        <div className="space-y-4">
          {Object.keys(groupedByType).length > 0 ? (
            Object.entries(groupedByType).map(([type, vitalsOfType]) => (
              <div key={type}>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">{getVitalIcon(type)}</span>
                  {formatVitalType(type)} ({vitalsOfType.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vitalsOfType.map((vital) => (
                    <HealthCard
                      key={vital.id}
                      title={formatVitalValue(vital)}
                      subtitle={new Date(vital.date).toLocaleDateString()}
                      status={vital.flagged ? 'abnormal' : 'normal'}
                      variant={getVitalVariant(vital)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(vital)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Status:</span>
                          <Badge variant={getVitalVariant(vital)} size="sm">
                            {getVitalStatus(vital)}
                          </Badge>
                        </div>
                        {vital.location && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Location:</span>
                            <span className="text-neutral-900">{vital.location}</span>
                          </div>
                        )}
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No vital signs match your current filters.</div>
          )}
        </div>
      )
    }
  ];

  return (
    <AppLayout>
      <div className="content-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Vital Signs
              </h1>
              <p className="text-neutral-600">
                Track your vital signs and monitor health trends
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={handleAddVital}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Reading</span>
            </Button>
          </div>
        </div>

        {/* Abnormal Vitals Alert */}
        {abnormalVitals.length > 0 && (
          <Alert
            variant="warning"
            title="Abnormal Readings Detected"
            message={`${abnormalVitals.length} vital sign reading${abnormalVitals.length > 1 ? 's' : ''} ${abnormalVitals.length > 1 ? 'are' : 'is'} outside normal ranges`}
            className="mb-6"
            actions={[
              <Button
                key="view"
                variant="warning"
                size="sm"
                onClick={() => {
                  abnormalVitals.forEach(vital => {
                    console.warn(`${formatVitalType(vital.type)}: ${formatVitalValue(vital)} is abnormal`);
                  });
                }}
              >
                Review All
              </Button>
            ]}
          />
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search vital signs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={{ value: typeFilter, label: typeOptions.find(o => o.value === typeFilter)?.label }}
                onChange={(option) => setTypeFilter(option.value)}
                options={typeOptions}
                placeholder="Type"
                size="sm"
              />
              <Select
                value={{ value: dateFilter, label: dateOptions.find(o => o.value === dateFilter)?.label }}
                onChange={(option) => setDateFilter(option.value)}
                options={dateOptions}
                placeholder="Date Range"
                size="sm"
              />
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {vitals.length}
            </div>
            <div className="text-sm text-neutral-600">Total Readings</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {vitals.filter(v => !v.flagged).length}
            </div>
            <div className="text-sm text-neutral-600">Normal</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {abnormalVitals.length}
            </div>
            <div className="text-sm text-neutral-600">Abnormal</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-neutral-600 mb-1">
              {Object.keys(groupedByType).length}
            </div>
            <div className="text-sm text-neutral-600">Types Tracked</div>
          </Card>
        </div>

        {/* Vital Signs Content */}
        {filteredVitals.length > 0 ? (
          <Tabs tabs={vitalTabs} variant="pills" />
        ) : (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartbeatIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchQuery || typeFilter !== 'all' || dateFilter !== 'all' 
                  ? 'No readings match your filters' 
                  : 'No vital signs recorded'
                }
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start tracking your vital signs for better health monitoring.'
                }
              </p>
              {(!searchQuery && typeFilter === 'all' && dateFilter === 'all') && (
                <Button variant="primary" onClick={handleAddVital}>
                  Add First Reading
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Add Reading Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Vital Sign Reading"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vital Sign Type *
                </label>
                <Select
                  value={{ value: newVital.type, label: formatVitalType(newVital.type) }}
                  onChange={(option) => handleInputChange('type', option.value)}
                  options={typeOptions.filter(o => o.value !== 'all')}
                />
              </div>

              {newVital.type === 'blood_pressure' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Systolic (mmHg) *
                    </label>
                    <Input
                      type="number"
                      value={newVital.systolic}
                      onChange={(e) => handleInputChange('systolic', e.target.value)}
                      placeholder="e.g., 120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diastolic (mmHg) *
                    </label>
                    <Input
                      type="number"
                      value={newVital.diastolic}
                      onChange={(e) => handleInputChange('diastolic', e.target.value)}
                      placeholder="e.g., 80"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newVital.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder={getVitalPlaceholder(newVital.type)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={newVital.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <Input
                  type="time"
                  value={newVital.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Select
                  value={{ value: newVital.location, label: newVital.location || 'Select location' }}
                  onChange={(option) => handleInputChange('location', option.value)}
                  options={[
                    { value: '', label: 'Not specified' },
                    { value: 'Home', label: 'Home' },
                    { value: 'Doctor\'s Office', label: 'Doctor\'s Office' },
                    { value: 'Hospital', label: 'Hospital' },
                    { value: 'Pharmacy', label: 'Pharmacy' },
                    { value: 'Gym/Fitness Center', label: 'Gym/Fitness Center' },
                    { value: 'Work', label: 'Work' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newVital.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any additional notes or observations..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveVital} disabled={loading}>
                {loading ? 'Recording...' : 'Record Reading'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Vital Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`${formatVitalType(selectedVital?.type || '')} Reading`}
          size="lg"
        >
          {selectedVital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Type</label>
                  <p className="mt-1 text-neutral-900 font-medium">
                    {formatVitalType(selectedVital.type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={getVitalVariant(selectedVital)}>
                      {getVitalStatus(selectedVital)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Reading</label>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">
                    {formatVitalValue(selectedVital)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Date & Time</label>
                  <p className="mt-1 text-neutral-900">
                    {new Date(selectedVital.date).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedVital.location && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Location</label>
                  <p className="mt-1 text-neutral-900">{selectedVital.location}</p>
                </div>
              )}

              {selectedVital.notes && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Notes</label>
                  <p className="mt-1 text-neutral-900">{selectedVital.notes}</p>
                </div>
              )}

              {selectedVital.flagged && (
                <Alert
                  variant={selectedVital.severity === 'high' ? 'error' : 'warning'}
                  title="Abnormal Reading"
                  message="This reading is outside the normal range. Consider consulting with your healthcare provider."
                />
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteVital(selectedVital.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleEditVital(selectedVital)}>
                    Edit Reading
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Reading Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Vital Sign Reading"
          size="lg"
        >
          {editingVital && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vital Sign Type *
                  </label>
                  <Select
                    value={{ value: editingVital.type, label: formatVitalType(editingVital.type) }}
                    onChange={(option) => handleEditInputChange('type', option.value)}
                    options={typeOptions.filter(o => o.value !== 'all')}
                  />
                </div>

                {editingVital.type === 'blood_pressure' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Systolic (mmHg) *
                      </label>
                      <Input
                        type="number"
                        value={editingVital.systolic || ''}
                        onChange={(e) => handleEditInputChange('systolic', e.target.value)}
                        placeholder="e.g., 120"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diastolic (mmHg) *
                      </label>
                      <Input
                        type="number"
                        value={editingVital.diastolic || ''}
                        onChange={(e) => handleEditInputChange('diastolic', e.target.value)}
                        placeholder="e.g., 80"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingVital.value || ''}
                      onChange={(e) => handleEditInputChange('value', e.target.value)}
                      placeholder={getVitalPlaceholder(editingVital.type)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={editingVital.date}
                    onChange={(e) => handleEditInputChange('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={editingVital.time}
                    onChange={(e) => handleEditInputChange('time', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Select
                    value={{ value: editingVital.location || '', label: editingVital.location || 'Select location' }}
                    onChange={(option) => handleEditInputChange('location', option.value)}
                    options={[
                      { value: '', label: 'Not specified' },
                      { value: 'Home', label: 'Home' },
                      { value: 'Doctor\'s Office', label: 'Doctor\'s Office' },
                      { value: 'Hospital', label: 'Hospital' },
                      { value: 'Pharmacy', label: 'Pharmacy' },
                      { value: 'Gym/Fitness Center', label: 'Gym/Fitness Center' },
                      { value: 'Work', label: 'Work' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingVital.notes || ''}
                    onChange={(e) => handleEditInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any additional notes or observations..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateVital} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Reading'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default VitalSignsPage;