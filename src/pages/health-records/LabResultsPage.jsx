import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import toast from '../../utils/toast';
import { useHealthData } from '../../hooks/useHealthData';
import apiService from '../../services/api';
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
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const LabResultsPage = () => {
  const { state, dispatch } = useApp();
  const { getAbnormalResults } = useHealthData();
  const [loading, setLoading] = useState(false);
  const [labResults, setLabResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newResult, setNewResult] = useState({
    testName: '',
    result: '',
    unit: '',
    referenceRange: '',
    category: 'Blood Chemistry',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    notes: '',
    attachments: []
  });

  // Fetch lab results from backend on mount
  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLabs();
      const formattedResults = Array.isArray(data) ? data.map(lab => ({
        ...lab,
        testName: lab.label || lab.fact?.name || 'Unknown Test',
        result: lab.value,
        date: lab.observed,
        flagged: lab.is_abnormal || false,
        referenceRange: lab.fact?.reference_range || '',
        unit: lab.fact?.unit || '',
        category: lab.fact?.category || 'Other'
      })) : [];
      setLabResults(formattedResults);
      // Also update global state for consistency
      dispatch({
        type: 'SET_LAB_RESULTS',
        payload: formattedResults
      });
    } catch (error) {
      console.error('Failed to fetch lab results:', error);
      toast.error('Failed to load lab results. Using local data.');
      // Fall back to local state if backend fails
      setLabResults(state.healthData.labs || []);
    } finally {
      setLoading(false);
    }
  };

  const abnormalResults = labResults.filter(r => r.flagged);

  // Filter lab results
  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'abnormal' && result.flagged) ||
      (statusFilter === 'normal' && !result.flagged);
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const resultDate = new Date(result.date);
      const now = new Date();
      const daysDiff = (now - resultDate) / (1000 * 60 * 60 * 24);
      
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
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Group results by category
  const groupedByCategory = filteredResults.reduce((acc, result) => {
    const category = result.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {});

  // Sort results by date (newest first)
  const sortedResults = [...filteredResults].sort((a, b) => new Date(b.date) - new Date(a.date));

  const statusOptions = [
    { value: 'all', label: 'All Results' },
    { value: 'normal', label: 'Normal' },
    { value: 'abnormal', label: 'Abnormal' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  const getResultVariant = (result) => {
    if (result.flagged) {
      return result.severity === 'high' ? 'error' : 'warning';
    }
    return 'success';
  };

  const getResultStatus = (result) => {
    if (result.flagged) {
      return result.severity === 'high' ? 'Critical' : 'Abnormal';
    }
    return 'Normal';
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
  };

  const handleAddResult = () => {
    setNewResult({
      testName: '',
      result: '',
      unit: '',
      referenceRange: '',
      category: 'Blood Chemistry',
      date: new Date().toISOString().split('T')[0],
      provider: '',
      notes: '',
      attachments: []
    });
    setShowAddModal(true);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please upload PDF, JPG, or PNG files.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Please upload files smaller than 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // Convert files to base64 for storage (in a real app, you'd upload to a server)
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result,
            uploadDate: new Date().toISOString()
          };
          
          setNewResult(prev => ({
            ...prev,
            attachments: [...prev.attachments, attachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }

    // Clear the input
    event.target.value = '';
  };

  const handleEditFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please upload PDF, JPG, or PNG files.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Please upload files smaller than 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result,
            uploadDate: new Date().toISOString()
          };
          
          setEditingResult(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), attachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }

    // Clear the input
    event.target.value = '';
  };

  const removeAttachment = (attachmentId, isEditing = false) => {
    if (isEditing) {
      setEditingResult(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.id !== attachmentId)
      }));
    } else {
      setNewResult(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.id !== attachmentId)
      }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveResult = async () => {
    if (!newResult.testName.trim() || !newResult.result.trim()) {
      toast.error('Please enter test name and result');
      return;
    }

    setLoading(true);
    try {
      // Check if result is abnormal based on reference range
      const isAbnormal = checkIfAbnormal(newResult.result, newResult.referenceRange);
      
      // Convert to backend format
      const labData = {
        fact_id: 'lab-' + Date.now(), // Temporary fact_id until we have lab facts
        value: newResult.result,
        observed: newResult.date,
        notes: newResult.notes || null
      };

      const createdLab = await apiService.createLabResult(labData);
      
      // Format for frontend
      const formattedResult = {
        ...createdLab,
        testName: newResult.testName,
        result: createdLab.value,
        date: createdLab.observed,
        flagged: createdLab.is_abnormal || isAbnormal,
        referenceRange: newResult.referenceRange,
        unit: newResult.unit,
        category: newResult.category,
        provider: newResult.provider,
        attachments: newResult.attachments,
        severity: isAbnormal ? determineSeverity(newResult.result, newResult.referenceRange) : null
      };
      
      setLabResults(prev => [...prev, formattedResult]);
      dispatch({
        type: 'ADD_LAB_RESULT',
        payload: formattedResult
      });

      setShowAddModal(false);
      toast.success('Lab result added successfully!');
      
      // Reset form
      setNewResult({
        testName: '',
        result: '',
        unit: '',
        referenceRange: '',
        category: 'Blood Chemistry',
        date: new Date().toISOString().split('T')[0],
        provider: '',
        notes: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to create lab result:', error);
      toast.error('Failed to add lab result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditResult = (result) => {
    setEditingResult({ ...result });
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateResult = async () => {
    if (!editingResult.testName.trim() || !editingResult.result.trim()) {
      toast.error('Please enter test name and result');
      return;
    }

    setLoading(true);
    try {
      // Since backend doesn't have update endpoint for labs, we'll update locally
      // In a real app, this would call an update API
      const isAbnormal = checkIfAbnormal(editingResult.result, editingResult.referenceRange);
      
      const updatedResult = {
        ...editingResult,
        flagged: isAbnormal,
        severity: isAbnormal ? determineSeverity(editingResult.result, editingResult.referenceRange) : null
      };
      
      setLabResults(prev => prev.map(lab => 
        lab.id === editingResult.id ? updatedResult : lab
      ));
      dispatch({
        type: 'EDIT_LAB_RESULT',
        payload: updatedResult
      });

      setShowEditModal(false);
      setEditingResult(null);
      toast.success('Lab result updated successfully!');
    } catch (error) {
      console.error('Failed to update lab result:', error);
      toast.error('Failed to update lab result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (window.confirm('Are you sure you want to delete this lab result?')) {
      setLoading(true);
      try {
        // Since backend doesn't have delete endpoint for labs, we'll delete locally
        // In a real app, this would call a delete API
        setLabResults(prev => prev.filter(lab => lab.id !== resultId));
        dispatch({
          type: 'DELETE_LAB_RESULT',
          payload: resultId
        });
        
        setShowDetailsModal(false);
        toast.success('Lab result deleted successfully!');
      } catch (error) {
        console.error('Failed to delete lab result:', error);
        toast.error('Failed to delete lab result. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewResult(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingResult(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to check if a result is abnormal
  const checkIfAbnormal = (result, referenceRange) => {
    if (!referenceRange || !result) return false;
    
    const value = parseFloat(result);
    if (isNaN(value)) return false;
    
    const range = referenceRange.toLowerCase().trim();
    
    // Handle different range formats
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(v => parseFloat(v.trim()));
      return value < min || value > max;
    } else if (range.startsWith('<')) {
      const threshold = parseFloat(range.substring(1).trim());
      return value >= threshold;
    } else if (range.startsWith('>')) {
      const threshold = parseFloat(range.substring(1).trim());
      return value <= threshold;
    }
    
    return false;
  };

  // Helper function to determine severity of abnormal result
  const determineSeverity = (result, referenceRange) => {
    const value = parseFloat(result);
    if (isNaN(value) || !referenceRange) return 'medium';
    
    const range = referenceRange.toLowerCase().trim();
    
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(v => parseFloat(v.trim()));
      const rangeDiff = max - min;
      const deviation = Math.max(Math.abs(value - min), Math.abs(value - max));
      
      // If deviation is more than 50% of range, consider it high severity
      return deviation > (rangeDiff * 0.5) ? 'high' : 'medium';
    }
    
    return 'medium';
  };

  const isResultInRange = (result) => {
    if (!result.referenceRange) return null;
    
    // Simple range checking (this would be more sophisticated in a real app)
    const value = parseFloat(result.result);
    if (isNaN(value)) return null;
    
    // Extract range (e.g., "10-20" or "<5" or ">100")
    const range = result.referenceRange.toLowerCase();
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(v => parseFloat(v.trim()));
      return value >= min && value <= max;
    }
    
    return null;
  };

  const labTabs = [
    {
      key: 'timeline',
      label: 'Timeline View',
      content: (
        <div className="space-y-4">
          {sortedResults.length > 0 ? (
            sortedResults.map((result) => (
              <HealthCard
                key={result.id}
                title={result.testName}
                subtitle={`${result.result} ${result.unit} (Normal: ${result.referenceRange})`}
                status={result.flagged ? 'abnormal' : 'normal'}
                variant={getResultVariant(result)}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDetails(result)}
              >
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Status:</span>
                    <Badge variant={getResultVariant(result)} size="sm">
                      {getResultStatus(result)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-neutral-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>Date</span>
                    </div>
                    <span className="text-neutral-900">
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                  </div>

                  {result.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Category:</span>
                      <span className="text-neutral-900">{result.category}</span>
                    </div>
                  )}

                  {result.provider && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Provider:</span>
                      <span className="text-neutral-900">{result.provider}</span>
                    </div>
                  )}

                  {result.flagged && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-2 text-warning-600">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Requires attention</span>
                      </div>
                    </div>
                  )}
                </div>
              </HealthCard>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8" style={{fontFamily: 'var(--font-body)'}}>No lab results match your current filters.</div>
          )}
        </div>
      )
    },
    {
      key: 'categories',
      label: 'By Category',
      content: (
        <div className="space-y-4">
          {Object.keys(groupedByCategory).length > 0 ? (
            Object.entries(groupedByCategory).map(([category, results]) => (
              <div key={category}>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-primary-500 mr-2" />
                  {category} ({results.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((result) => (
                    <HealthCard
                      key={result.id}
                      title={result.testName}
                      subtitle={`${result.result} ${result.unit}`}
                      status={result.flagged ? 'abnormal' : 'normal'}
                      variant={getResultVariant(result)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(result)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Status:</span>
                          <Badge variant={getResultVariant(result)} size="sm">
                            {getResultStatus(result)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Date:</span>
                          <span className="text-neutral-900">
                            {new Date(result.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8" style={{fontFamily: 'var(--font-body)'}}>No lab results match your current filters.</div>
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
                Lab Results
              </h1>
              <p className="text-neutral-600">
                View and track your laboratory test results
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={handleAddResult}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Result</span>
            </Button>
          </div>
        </div>

        {/* Abnormal Results Alert */}
        {abnormalResults.length > 0 && (
          <Alert
            variant="warning"
            title="Abnormal Results Detected"
            message={`${abnormalResults.length} lab result${abnormalResults.length > 1 ? 's' : ''} require${abnormalResults.length === 1 ? 's' : ''} your attention`}
            className="mb-6"
            actions={[
              <Button
                key="view"
                variant="warning"
                size="sm"
                onClick={() => {
                  abnormalResults.forEach(result => {
                    console.warn(`${result.testName}: ${result.result} ${result.unit} (abnormal)`);
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
                placeholder="Search lab results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={{ value: statusFilter, label: statusOptions.find(o => o.value === statusFilter)?.label }}
                onChange={(option) => setStatusFilter(option.value)}
                options={statusOptions}
                placeholder="Status"
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
              {labResults.length}
            </div>
            <div className="text-sm text-neutral-600">Total Results</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {labResults.filter(r => !r.flagged).length}
            </div>
            <div className="text-sm text-neutral-600">Normal</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {abnormalResults.length}
            </div>
            <div className="text-sm text-neutral-600">Abnormal</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-neutral-600 mb-1">
              {Object.keys(groupedByCategory).length}
            </div>
            <div className="text-sm text-neutral-600">Categories</div>
          </Card>
        </div>

        {/* Lab Results Content */}
        {filteredResults.length > 0 ? (
          <Tabs tabs={labTabs} variant="pills" />
        ) : (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'No results match your filters' 
                  : 'No lab results recorded'
                }
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Lab results will appear here once they are added to your record.'
                }
              </p>
              {(!searchQuery && statusFilter === 'all' && dateFilter === 'all') && (
                <Button variant="primary" onClick={handleAddResult}>
                  Add First Result
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Add Result Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Lab Result"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Name *
                </label>
                <Input
                  value={newResult.testName}
                  onChange={(e) => handleInputChange('testName', e.target.value)}
                  placeholder="e.g., Complete Blood Count, Glucose"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result *
                </label>
                <Input
                  value={newResult.result}
                  onChange={(e) => handleInputChange('result', e.target.value)}
                  placeholder="e.g., 95, 4.8, Positive"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <Input
                  value={newResult.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder="e.g., mg/dL, mmol/L, %"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Range
                </label>
                <Input
                  value={newResult.referenceRange}
                  onChange={(e) => handleInputChange('referenceRange', e.target.value)}
                  placeholder="e.g., 70-100, <5.0, >3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={{ value: newResult.category, label: newResult.category }}
                  onChange={(option) => handleInputChange('category', option.value)}
                  options={[
                    { value: 'Blood Chemistry', label: 'Blood Chemistry' },
                    { value: 'Complete Blood Count', label: 'Complete Blood Count' },
                    { value: 'Lipid Panel', label: 'Lipid Panel' },
                    { value: 'Liver Function', label: 'Liver Function' },
                    { value: 'Kidney Function', label: 'Kidney Function' },
                    { value: 'Thyroid Function', label: 'Thyroid Function' },
                    { value: 'Cardiac Markers', label: 'Cardiac Markers' },
                    { value: 'Hormones', label: 'Hormones' },
                    { value: 'Immunology', label: 'Immunology' },
                    { value: 'Microbiology', label: 'Microbiology' },
                    { value: 'Urinalysis', label: 'Urinalysis' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Date
                </label>
                <Input
                  type="date"
                  value={newResult.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Provider
                </label>
                <Input
                  value={newResult.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  placeholder="e.g., Dr. Smith, LabCorp"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newResult.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes or observations..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lab Report Files
                </label>
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="lab-file-upload"
                    />
                    <label htmlFor="lab-file-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-primary-600 hover:text-primary-500">
                            Click to upload
                          </span> or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, PNG, JPG up to 10MB each
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {newResult.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                      {newResult.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {attachment.type === 'application/pdf' ? (
                                <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id, false)}
                            className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveResult} disabled={loading}>
                {loading ? 'Adding...' : 'Add Result'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Result Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={selectedResult?.testName || 'Lab Result Details'}
          size="lg"
        >
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Test Name</label>
                  <p className="mt-1 text-neutral-900 font-medium">{selectedResult.testName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={getResultVariant(selectedResult)}>
                      {getResultStatus(selectedResult)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Result</label>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">
                    {selectedResult.result} {selectedResult.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Reference Range</label>
                  <p className="mt-1 text-neutral-900">{selectedResult.referenceRange}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Test Date</label>
                  <p className="mt-1 text-neutral-900">
                    {new Date(selectedResult.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedResult.category && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Category</label>
                    <p className="mt-1 text-neutral-900">{selectedResult.category}</p>
                  </div>
                )}
              </div>

              {selectedResult.provider && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Healthcare Provider</label>
                  <p className="mt-1 text-neutral-900">{selectedResult.provider}</p>
                </div>
              )}

              {selectedResult.notes && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Notes</label>
                  <p className="mt-1 text-neutral-900">{selectedResult.notes}</p>
                </div>
              )}

              {selectedResult.attachments && selectedResult.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Attached Files</label>
                  <div className="mt-2 space-y-2">
                    {selectedResult.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {attachment.type === 'application/pdf' ? (
                            <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatFileSize(attachment.size)} • Uploaded {new Date(attachment.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Create a download link for the file
                            const link = document.createElement('a');
                            link.href = attachment.data;
                            link.download = attachment.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="text-primary-600 hover:text-primary-800 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedResult.flagged && (
                <Alert
                  variant={selectedResult.severity === 'high' ? 'error' : 'warning'}
                  title="Abnormal Result"
                  message="This result is outside the normal reference range and may require follow-up with your healthcare provider."
                />
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteResult(selectedResult.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleEditResult(selectedResult)}>
                    Edit Result
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Result Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Lab Result"
          size="lg"
        >
          {editingResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name *
                  </label>
                  <Input
                    value={editingResult.testName}
                    onChange={(e) => handleEditInputChange('testName', e.target.value)}
                    placeholder="e.g., Complete Blood Count, Glucose"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Result *
                  </label>
                  <Input
                    value={editingResult.result}
                    onChange={(e) => handleEditInputChange('result', e.target.value)}
                    placeholder="e.g., 95, 4.8, Positive"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <Input
                    value={editingResult.unit || ''}
                    onChange={(e) => handleEditInputChange('unit', e.target.value)}
                    placeholder="e.g., mg/dL, mmol/L, %"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Range
                  </label>
                  <Input
                    value={editingResult.referenceRange || ''}
                    onChange={(e) => handleEditInputChange('referenceRange', e.target.value)}
                    placeholder="e.g., 70-100, <5.0, >3.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={{ value: editingResult.category || 'Blood Chemistry', label: editingResult.category || 'Blood Chemistry' }}
                    onChange={(option) => handleEditInputChange('category', option.value)}
                    options={[
                      { value: 'Blood Chemistry', label: 'Blood Chemistry' },
                      { value: 'Complete Blood Count', label: 'Complete Blood Count' },
                      { value: 'Lipid Panel', label: 'Lipid Panel' },
                      { value: 'Liver Function', label: 'Liver Function' },
                      { value: 'Kidney Function', label: 'Kidney Function' },
                      { value: 'Thyroid Function', label: 'Thyroid Function' },
                      { value: 'Cardiac Markers', label: 'Cardiac Markers' },
                      { value: 'Hormones', label: 'Hormones' },
                      { value: 'Immunology', label: 'Immunology' },
                      { value: 'Microbiology', label: 'Microbiology' },
                      { value: 'Urinalysis', label: 'Urinalysis' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Date
                  </label>
                  <Input
                    type="date"
                    value={editingResult.date}
                    onChange={(e) => handleEditInputChange('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Healthcare Provider
                  </label>
                  <Input
                    value={editingResult.provider || ''}
                    onChange={(e) => handleEditInputChange('provider', e.target.value)}
                    placeholder="e.g., Dr. Smith, LabCorp"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingResult.notes || ''}
                    onChange={(e) => handleEditInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Additional notes or observations..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lab Report Files
                  </label>
                  <div className="space-y-4">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleEditFileUpload}
                        className="hidden"
                        id="edit-lab-file-upload"
                      />
                      <label htmlFor="edit-lab-file-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-primary-600 hover:text-primary-500">
                              Click to upload
                            </span> or drag and drop
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, PNG, JPG up to 10MB each
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Uploaded Files List */}
                    {editingResult.attachments && editingResult.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                        {editingResult.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {attachment.type === 'application/pdf' ? (
                                  <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id, true)}
                              className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateResult} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Result'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default LabResultsPage;