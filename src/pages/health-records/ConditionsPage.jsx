import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { 
  Button, 
  Card, 
  HealthCard,
  Alert,
  Input,
  Select,
  Modal,
  Badge,
  LoadingSpinner
} from '../../components/common';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  HeartIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { ConditionStatus, VerificationStatus } from '../../types/api';
import { useNotifications } from '../../hooks/useNotifications';
import useHealthData from '../../hooks/useHealthData';

const ConditionsPage = () => {
  const { user } = useApp();
  const { showSuccess, showError } = useNotifications();
  const { conditions, loading, fetchHealthDataCategory } = useHealthData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [editingCondition, setEditingCondition] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  
  // New condition form
  const [newCondition, setNewCondition] = useState({
    name: '',
    icd10Code: '',
    onset_date: new Date().toISOString().split('T')[0],
    clinical_status: ConditionStatus.ACTIVE,
    verification_status: VerificationStatus.CONFIRMED,
    notes: ''
  });

  // Load conditions on mount
  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = async () => {
    try {
      await fetchHealthDataCategory('conditions');
    } catch (error) {
      console.error('Error loading conditions:', error);
    }
  };

  // Filter conditions
  const filteredConditions = conditions.filter(condition => {
    const matchesSearch = 
      condition.disease?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      condition.disease?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || condition.clinical_status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || condition.verification_status === verificationFilter;
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  // Group conditions by status
  const groupedConditions = {
    active: filteredConditions.filter(c => c.clinical_status === ConditionStatus.ACTIVE),
    inactive: filteredConditions.filter(c => c.clinical_status === ConditionStatus.INACTIVE),
    resolved: filteredConditions.filter(c => c.clinical_status === ConditionStatus.RESOLVED)
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: ConditionStatus.ACTIVE, label: 'Active' },
    { value: ConditionStatus.INACTIVE, label: 'Inactive' },
    { value: ConditionStatus.RESOLVED, label: 'Resolved' }
  ];

  const verificationOptions = [
    { value: 'all', label: 'All Verifications' },
    { value: VerificationStatus.CONFIRMED, label: 'Confirmed' },
    { value: VerificationStatus.PROVISIONAL, label: 'Provisional' },
    { value: VerificationStatus.DIFFERENTIAL, label: 'Differential' }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case ConditionStatus.ACTIVE: return 'error';
      case ConditionStatus.RESOLVED: return 'success';
      case ConditionStatus.INACTIVE: return 'warning';
      default: return 'default';
    }
  };

  const getVerificationBadgeVariant = (verification) => {
    switch (verification) {
      case VerificationStatus.CONFIRMED: return 'success';
      case VerificationStatus.PROVISIONAL: return 'warning';
      case VerificationStatus.DIFFERENTIAL: return 'info';
      default: return 'default';
    }
  };

  const handleAddCondition = () => {
    setNewCondition({
      name: '',
      icd10Code: '',
      onset_date: new Date().toISOString().split('T')[0],
      clinical_status: ConditionStatus.ACTIVE,
      verification_status: VerificationStatus.CONFIRMED,
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleSaveCondition = async () => {
    if (!newCondition.name.trim()) {
      showError('Please enter a condition name');
      return;
    }

    try {
      setAddLoading(true);
      
      // For now, we'll create a mock disease_id
      // In a real app, you'd search for the disease by name/code
      const conditionData = {
        user_id: user?.id,
        disease_id: `disease-${Date.now()}`, // Mock disease ID
        onset_date: newCondition.onset_date || null,
        clinical_status: newCondition.clinical_status,
        verification_status: newCondition.verification_status
      };

      await apiService.createCondition(conditionData);
      await loadConditions();
      
      setShowAddModal(false);
      showSuccess('Condition added successfully!');
    } catch (error) {
      showError('Failed to add condition. Please try again.');
      console.error('Error adding condition:', error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateCondition = async () => {
    if (!editingCondition) return;

    try {
      const updateData = {
        clinical_status: editingCondition.clinical_status,
        verification_status: editingCondition.verification_status
      };

      await apiService.updateCondition(editingCondition.id, updateData);
      await loadConditions();
      
      setShowEditModal(false);
      setEditingCondition(null);
      showSuccess('Condition updated successfully!');
    } catch (error) {
      showError('Failed to update condition. Please try again.');
      console.error('Error updating condition:', error);
    }
  };

  const handleDeleteCondition = async (conditionId) => {
    if (!window.confirm('Are you sure you want to delete this condition?')) return;

    try {
      await apiService.deleteCondition(conditionId);
      await loadConditions();
      
      setShowDetailsModal(false);
      showSuccess('Condition deleted successfully!');
    } catch (error) {
      showError('Failed to delete condition. Please try again.');
      console.error('Error deleting condition:', error);
    }
  };

  const handleViewDetails = (condition) => {
    setSelectedCondition(condition);
    setShowDetailsModal(true);
  };

  const handleEditCondition = (condition) => {
    setEditingCondition({ ...condition });
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleInputChange = (field, value) => {
    setNewCondition(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingCondition(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="content-container flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="content-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Medical Conditions
              </h1>
              <p className="text-neutral-600">
                Manage your medical conditions and health status
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={handleAddCondition}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Condition</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search conditions by name or code..."
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
                value={{ value: verificationFilter, label: verificationOptions.find(o => o.value === verificationFilter)?.label }}
                onChange={(option) => setVerificationFilter(option.value)}
                options={verificationOptions}
                placeholder="Verification"
                size="sm"
              />
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-error-600 mb-1">
              {groupedConditions.active.length}
            </div>
            <div className="text-sm text-neutral-600">Active Conditions</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {groupedConditions.inactive.length}
            </div>
            <div className="text-sm text-neutral-600">Inactive</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {groupedConditions.resolved.length}
            </div>
            <div className="text-sm text-neutral-600">Resolved</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {conditions.length}
            </div>
            <div className="text-sm text-neutral-600">Total Conditions</div>
          </Card>
        </div>

        {/* Conditions List */}
        {filteredConditions.length > 0 ? (
          <div className="space-y-6">
            {/* Active Conditions */}
            {groupedConditions.active.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-error-500 mr-2" />
                  Active Conditions ({groupedConditions.active.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedConditions.active.map((condition) => (
                    <HealthCard
                      key={condition.id}
                      title={condition.disease?.name || 'Unknown Condition'}
                      subtitle={condition.disease?.code || 'No code available'}
                      status={condition.clinical_status}
                      variant="error"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(condition)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Verification:</span>
                          <Badge variant={getVerificationBadgeVariant(condition.verification_status)} size="sm">
                            {condition.verification_status}
                          </Badge>
                        </div>
                        {condition.onset_date && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-neutral-600">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              <span>Onset</span>
                            </div>
                            <span className="text-neutral-900">
                              {new Date(condition.onset_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Conditions */}
            {groupedConditions.inactive.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 text-warning-500 mr-2" />
                  Inactive Conditions ({groupedConditions.inactive.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedConditions.inactive.map((condition) => (
                    <HealthCard
                      key={condition.id}
                      title={condition.disease?.name || 'Unknown Condition'}
                      subtitle={condition.disease?.code || 'No code available'}
                      status={condition.clinical_status}
                      variant="warning"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(condition)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Verification:</span>
                          <Badge variant={getVerificationBadgeVariant(condition.verification_status)} size="sm">
                            {condition.verification_status}
                          </Badge>
                        </div>
                        {condition.onset_date && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-neutral-600">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              <span>Onset</span>
                            </div>
                            <span className="text-neutral-900">
                              {new Date(condition.onset_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Conditions */}
            {groupedConditions.resolved.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-success-500 mr-2" />
                  Resolved Conditions ({groupedConditions.resolved.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedConditions.resolved.map((condition) => (
                    <HealthCard
                      key={condition.id}
                      title={condition.disease?.name || 'Unknown Condition'}
                      subtitle={condition.disease?.code || 'No code available'}
                      status={condition.clinical_status}
                      variant="success"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(condition)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Verification:</span>
                          <Badge variant={getVerificationBadgeVariant(condition.verification_status)} size="sm">
                            {condition.verification_status}
                          </Badge>
                        </div>
                        {condition.onset_date && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-neutral-600">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              <span>Onset</span>
                            </div>
                            <span className="text-neutral-900">
                              {new Date(condition.onset_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Alert
            variant="info"
            message={searchQuery || statusFilter !== 'all' || verificationFilter !== 'all' 
              ? "No conditions found matching your filters." 
              : "No medical conditions recorded. Click 'Add Condition' to get started."}
          />
        )}

        {/* Add Condition Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Medical Condition"
          size="lg"
        >
          <div className="space-y-6">
            <Alert
              variant="info"
              message="Enter your medical condition information. This will be saved to your health records."
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Condition Name *
              </label>
              <Input
                value={newCondition.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Type 2 Diabetes, Hypertension"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ICD-10 Code (Optional)
              </label>
              <Input
                value={newCondition.icd10Code}
                onChange={(e) => handleInputChange('icd10Code', e.target.value)}
                placeholder="e.g., E11.9, I10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Onset Date
              </label>
              <Input
                type="date"
                value={newCondition.onset_date}
                onChange={(e) => handleInputChange('onset_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Clinical Status
              </label>
              <Select
                value={{ 
                  value: newCondition.clinical_status, 
                  label: statusOptions.find(o => o.value === newCondition.clinical_status)?.label 
                }}
                onChange={(option) => handleInputChange('clinical_status', option.value)}
                options={statusOptions.filter(o => o.value !== 'all')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Verification Status
              </label>
              <Select
                value={{ 
                  value: newCondition.verification_status, 
                  label: verificationOptions.find(o => o.value === newCondition.verification_status)?.label 
                }}
                onChange={(option) => handleInputChange('verification_status', option.value)}
                options={verificationOptions.filter(o => o.value !== 'all')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={newCondition.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this condition..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveCondition}
                disabled={addLoading}
              >
                {addLoading ? 'Adding...' : 'Add Condition'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Condition Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Medical Condition"
          size="lg"
        >
          {editingCondition && (
            <div className="space-y-6">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">
                  {editingCondition.disease?.name || 'Unknown Condition'}
                </h4>
                <p className="text-sm text-neutral-600">
                  {editingCondition.disease?.code || 'No code available'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Clinical Status
                </label>
                <Select
                  value={{ 
                    value: editingCondition.clinical_status, 
                    label: statusOptions.find(o => o.value === editingCondition.clinical_status)?.label 
                  }}
                  onChange={(option) => handleEditInputChange('clinical_status', option.value)}
                  options={statusOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Verification Status
                </label>
                <Select
                  value={{ 
                    value: editingCondition.verification_status, 
                    label: verificationOptions.find(o => o.value === editingCondition.verification_status)?.label 
                  }}
                  onChange={(option) => handleEditInputChange('verification_status', option.value)}
                  options={verificationOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateCondition}>
                  Update Condition
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Condition Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Condition Details"
          size="lg"
        >
          {selectedCondition && (
            <div className="space-y-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-primary-900 mb-1">
                  {selectedCondition.disease?.name || 'Unknown Condition'}
                </h3>
                <p className="text-primary-700">
                  {selectedCondition.disease?.code || 'No code available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Clinical Status</p>
                  <Badge variant={getStatusVariant(selectedCondition.clinical_status)} size="md">
                    {selectedCondition.clinical_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Verification</p>
                  <Badge variant={getVerificationBadgeVariant(selectedCondition.verification_status)} size="md">
                    {selectedCondition.verification_status}
                  </Badge>
                </div>
              </div>

              {selectedCondition.onset_date && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Onset Date</p>
                  <p className="font-medium">{new Date(selectedCondition.onset_date).toLocaleDateString()}</p>
                </div>
              )}

              {selectedCondition.disease?.category && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Category</p>
                  <p className="font-medium">{selectedCondition.disease.category}</p>
                </div>
              )}

              {selectedCondition.disease?.description && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Description</p>
                  <p className="text-neutral-900">{selectedCondition.disease.description}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteCondition(selectedCondition.id)}
                  className="text-error-600 hover:bg-error-50"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEditCondition(selectedCondition)}
                >
                  Edit
                </Button>
                <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default ConditionsPage;