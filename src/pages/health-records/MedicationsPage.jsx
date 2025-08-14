import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import toast from '../../utils/toast';
import { useWebNotifications } from '../../hooks/useNotifications';

import { 
  Button, 
  Card, 
  HealthCard,
  Input,
  Select,
  Badge, 
  Alert,
  Modal
} from '../../components/common';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Custom Pill icon to match sidebar
const PillIcon = ({ className }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const MedicationsPage = () => {
  const { state, dispatch } = useApp();
  const { showMedicationReminder } = useWebNotifications();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    genericName: '',
    dosage: '',
    frequency: '',
    status: 'active',
    type: 'prescription',
    startDate: new Date().toISOString().split('T')[0],
    prescriber: '',
    instructions: ''
  });

  const medications = state.healthData.medications || [];

  // Filter medications
  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.genericName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || medication.status === statusFilter;
    const matchesType = typeFilter === 'all' || medication.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Group medications by status
  const groupedMedications = {
    active: filteredMedications.filter(m => m.status === 'active'),
    paused: filteredMedications.filter(m => m.status === 'paused'),
    discontinued: filteredMedications.filter(m => m.status === 'discontinued'),
    completed: filteredMedications.filter(m => m.status === 'completed')
  };

  // Get medications needing attention (due soon, overdue, etc.)
  const getMedicationsNeedingAttention = () => {
    const now = new Date();
    return medications.filter(med => {
      if (med.status !== 'active') return false;
      if (!med.nextDose) return false;
      
      const nextDose = new Date(med.nextDose);
      const timeDiff = nextDose.getTime() - now.getTime();
      const hoursUntilDose = timeDiff / (1000 * 60 * 60);
      
      return hoursUntilDose <= 2; // Due within 2 hours or overdue
    });
  };

  const medicationsNeedingAttention = getMedicationsNeedingAttention();

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'discontinued', label: 'Discontinued' },
    { value: 'completed', label: 'Completed' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'over-the-counter', label: 'Over-the-Counter' },
    { value: 'supplement', label: 'Supplement' },
    { value: 'vitamin', label: 'Vitamin' }
  ];

  const handleAddMedication = () => {
    setNewMedication({
      name: '',
      genericName: '',
      dosage: '',
      frequency: '',
      status: 'active',
      type: 'prescription',
      startDate: new Date().toISOString().split('T')[0],
      prescriber: '',
      instructions: ''
    });
    setShowAddModal(true);
  };

  const handleSaveMedication = () => {
    // Validation
    if (!newMedication.name.trim()) {
      toast.error('Please enter a medication name');
      return;
    }
    
    if (!newMedication.dosage || !newMedication.dosageUnit) {
      toast.error('Please enter dosage and unit');
      return;
    }
    
    if (!newMedication.frequency) {
      toast.error('Please specify frequency');
      return;
    }
    
    if (!newMedication.startDate) {
      toast.error('Please enter start date');
      return;
    }
    
    // Validate dates
    const startDate = new Date(newMedication.startDate);
    const endDate = newMedication.endDate ? new Date(newMedication.endDate) : null;
    
    if (endDate && startDate > endDate) {
      toast.error('End date must be after start date');
      return;
    }

    const medicationToAdd = {
      ...newMedication,
      id: Date.now().toString(),
      startDate: newMedication.startDate
    };

    dispatch({
      type: 'ADD_MEDICATION',
      payload: medicationToAdd
    });

    setShowAddModal(false);
    toast.success('Medication added successfully!');
  };

  const handleInputChange = (field, value) => {
    setNewMedication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'discontinued': return 'error';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getTypeVariant = (type) => {
    switch (type) {
      case 'prescription': return 'primary';
      case 'over-the-counter': return 'success';
      case 'supplement': return 'warning';
      case 'vitamin': return 'info';
      default: return 'default';
    }
  };

  const handleViewDetails = (medication) => {
    setSelectedMedication(medication);
    setShowDetailsModal(true);
  };

  const handleSetReminder = (medication) => {
    showMedicationReminder(medication.name, 'Now');
  };

  const handleEditMedication = (medication) => {
    setEditingMedication({ ...medication });
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateMedication = () => {
    if (!editingMedication.name.trim()) {
      toast.error('Please enter a medication name');
      return;
    }

    dispatch({
      type: 'EDIT_MEDICATION',
      payload: editingMedication
    });

    setShowEditModal(false);
    setEditingMedication(null);
    toast.success('Medication updated successfully!');
  };

  const handleDeleteMedication = (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      dispatch({
        type: 'DELETE_MEDICATION',
        payload: medicationId
      });
      setShowDetailsModal(false);
      toast.success('Medication deleted successfully!');
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditingMedication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatNextDose = (nextDose) => {
    if (!nextDose) return 'Not scheduled';
    
    const now = new Date();
    const doseTime = new Date(nextDose);
    const timeDiff = doseTime.getTime() - now.getTime();
    const hoursUntilDose = timeDiff / (1000 * 60 * 60);
    
    if (hoursUntilDose < 0) {
      return `Overdue by ${Math.abs(hoursUntilDose).toFixed(1)} hours`;
    } else if (hoursUntilDose < 1) {
      const minutes = Math.round(hoursUntilDose * 60);
      return `In ${minutes} minutes`;
    } else if (hoursUntilDose < 24) {
      return `In ${hoursUntilDose.toFixed(1)} hours`;
    } else {
      return doseTime.toLocaleDateString();
    }
  };

  return (
    <AppLayout>
      <div className="content-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Medications
              </h1>
              <p className="text-neutral-600">
                Track your medications, dosages, and schedules
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={handleAddMedication}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Medication</span>
            </Button>
          </div>
        </div>

        {/* Attention Alert */}
        {medicationsNeedingAttention.length > 0 && (
          <Alert
            variant="warning"
            title="Medications Need Attention"
            message={`${medicationsNeedingAttention.length} medication${medicationsNeedingAttention.length > 1 ? 's' : ''} ${medicationsNeedingAttention.length > 1 ? 'are' : 'is'} due soon or overdue`}
            className="mb-6"
            actions={[
              <Button
                key="view"
                variant="warning"
                size="sm"
                onClick={() => {
                  medicationsNeedingAttention.forEach(med => {
                    handleSetReminder(med);
                  });
                }}
              >
                Set Reminders
              </Button>
            ]}
          />
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search medications..."
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
                containerClassName="min-w-[140px]"
              />
              <Select
                value={{ value: typeFilter, label: typeOptions.find(o => o.value === typeFilter)?.label }}
                onChange={(option) => setTypeFilter(option.value)}
                options={typeOptions}
                placeholder="Type"
                size="sm"
                containerClassName="min-w-[130px]"
              />
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {groupedMedications.active.length}
            </div>
            <div className="text-sm text-neutral-600">Active</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {groupedMedications.paused.length}
            </div>
            <div className="text-sm text-neutral-600">Paused</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-error-600 mb-1">
              {medicationsNeedingAttention.length}
            </div>
            <div className="text-sm text-neutral-600">Need Attention</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-neutral-600 mb-1">
              {groupedMedications.discontinued.length}
            </div>
            <div className="text-sm text-neutral-600">Discontinued</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {medications.length}
            </div>
            <div className="text-sm text-neutral-600">Total</div>
          </Card>
        </div>

        {/* Medications List */}
        {filteredMedications.length > 0 ? (
          <div className="space-y-4">
            {/* Active Medications */}
            {groupedMedications.active.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-success-500 rounded-full mr-2"></span>
                  Active Medications ({groupedMedications.active.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedMedications.active.map((medication) => (
                    <HealthCard
                      key={medication.id}
                      title={medication.name}
                      subtitle={`${medication.dosage} - ${medication.frequency}`}
                      status={medication.status}
                      variant="success"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(medication)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Type:</span>
                          <Badge variant={getTypeVariant(medication.type)} size="sm">
                            {medication.type}
                          </Badge>
                        </div>
                        
                        {medication.nextDose && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-neutral-600">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              <span>Next Dose</span>
                            </div>
                            <span className={
                              medicationsNeedingAttention.some(m => m.id === medication.id)
                                ? 'text-warning-600 font-medium'
                                : 'text-neutral-900'
                            }>
                              {formatNextDose(medication.nextDose)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-neutral-600">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>Started</span>
                          </div>
                          <span className="text-neutral-900">
                            {new Date(medication.startDate).toLocaleDateString()}
                          </span>
                        </div>

                        {medication.prescriber && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-neutral-600">
                              <UserIcon className="w-4 h-4 mr-1" />
                              <span>Prescriber</span>
                            </div>
                            <span className="text-neutral-900">{medication.prescriber}</span>
                          </div>
                        )}

                        {medicationsNeedingAttention.some(m => m.id === medication.id) && (
                          <div className="pt-2 border-t">
                            <Button
                              variant="warning"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetReminder(medication);
                              }}
                            >
                              Set Reminder
                            </Button>
                          </div>
                        )}
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            )}

            {/* Paused Medications */}
            {groupedMedications.paused.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-warning-500 rounded-full mr-2"></span>
                  Paused Medications ({groupedMedications.paused.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedMedications.paused.map((medication) => (
                    <HealthCard
                      key={medication.id}
                      title={medication.name}
                      subtitle={`${medication.dosage} - ${medication.frequency}`}
                      status={medication.status}
                      variant="warning"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDetails(medication)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Type:</span>
                          <Badge variant={getTypeVariant(medication.type)} size="sm">
                            {medication.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Paused Date:</span>
                          <span className="text-neutral-900">
                            {medication.pausedDate ? 
                              new Date(medication.pausedDate).toLocaleDateString() : 
                              'Not specified'
                            }
                          </span>
                        </div>
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            )}

            {/* Discontinued/Completed Medications */}
            {(groupedMedications.discontinued.length > 0 || groupedMedications.completed.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-neutral-400 rounded-full mr-2"></span>
                  Inactive Medications ({groupedMedications.discontinued.length + groupedMedications.completed.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...groupedMedications.discontinued, ...groupedMedications.completed].map((medication) => (
                    <HealthCard
                      key={medication.id}
                      title={medication.name}
                      subtitle={`${medication.dosage} - ${medication.frequency}`}
                      status={medication.status}
                      variant="default"
                      className="cursor-pointer hover:shadow-md transition-shadow opacity-75"
                      onClick={() => handleViewDetails(medication)}
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Status:</span>
                          <Badge variant={getStatusVariant(medication.status)} size="sm">
                            {medication.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">End Date:</span>
                          <span className="text-neutral-900">
                            {medication.endDate ? 
                              new Date(medication.endDate).toLocaleDateString() : 
                              'Not specified'
                            }
                          </span>
                        </div>
                      </div>
                    </HealthCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PillIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No medications match your filters' 
                  : 'No medications recorded'
                }
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start by adding your first medication.'
                }
              </p>
              {(!searchQuery && statusFilter === 'all' && typeFilter === 'all') && (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  Add First Medication
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Add Medication Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Medication"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name *
                </label>
                <Input
                  value={newMedication.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Lisinopril, Metformin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generic Name
                </label>
                <Input
                  value={newMedication.genericName}
                  onChange={(e) => handleInputChange('genericName', e.target.value)}
                  placeholder="Generic/chemical name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <Input
                  value={newMedication.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  placeholder="e.g., 10mg, 500mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <Input
                  value={newMedication.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  placeholder="e.g., Once daily, Twice daily"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={{ value: newMedication.status, label: statusOptions.find(o => o.value === newMedication.status)?.label }}
                  onChange={(option) => handleInputChange('status', option.value)}
                  options={statusOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <Select
                  value={{ value: newMedication.type, label: typeOptions.find(o => o.value === newMedication.type)?.label }}
                  onChange={(option) => handleInputChange('type', option.value)}
                  options={typeOptions.filter(o => o.value !== 'all')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescriber
                </label>
                <Input
                  value={newMedication.prescriber}
                  onChange={(e) => handleInputChange('prescriber', e.target.value)}
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Special instructions, notes, or reminders..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveMedication} disabled={loading}>
                {loading ? 'Adding...' : 'Add Medication'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Medication Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={selectedMedication?.name || 'Medication Details'}
          size="lg"
        >
          {selectedMedication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(selectedMedication.status)}>
                      {selectedMedication.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Type</label>
                  <div className="mt-1">
                    <Badge variant={getTypeVariant(selectedMedication.type)}>
                      {selectedMedication.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Dosage</label>
                  <p className="mt-1 text-neutral-900">{selectedMedication.dosage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Frequency</label>
                  <p className="mt-1 text-neutral-900">{selectedMedication.frequency}</p>
                </div>
              </div>

              {selectedMedication.genericName && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Generic Name</label>
                  <p className="mt-1 text-neutral-900">{selectedMedication.genericName}</p>
                </div>
              )}

              {selectedMedication.purpose && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Purpose</label>
                  <p className="mt-1 text-neutral-900">{selectedMedication.purpose}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Start Date</label>
                  <p className="mt-1 text-neutral-900">
                    {new Date(selectedMedication.startDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedMedication.endDate && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700">End Date</label>
                    <p className="mt-1 text-neutral-900">
                      {new Date(selectedMedication.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedMedication.prescriber && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Prescribed By</label>
                  <p className="mt-1 text-neutral-900">{selectedMedication.prescriber}</p>
                </div>
              )}

              {selectedMedication.nextDose && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Next Dose</label>
                  <p className="mt-1 text-neutral-900">
                    {formatNextDose(selectedMedication.nextDose)}
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteMedication(selectedMedication.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleEditMedication(selectedMedication)}>
                    Edit Medication
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Medication Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Medication"
          size="lg"
        >
          {editingMedication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <Input
                    value={editingMedication.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    placeholder="e.g., Lisinopril, Metformin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generic Name
                  </label>
                  <Input
                    value={editingMedication.genericName || ''}
                    onChange={(e) => handleEditInputChange('genericName', e.target.value)}
                    placeholder="Generic/chemical name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <Input
                    value={editingMedication.dosage}
                    onChange={(e) => handleEditInputChange('dosage', e.target.value)}
                    placeholder="e.g., 10mg, 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <Select
                    value={{ value: editingMedication.frequency, label: editingMedication.frequency }}
                    onChange={(option) => handleEditInputChange('frequency', option.value)}
                    options={[
                      { value: 'Once daily', label: 'Once daily' },
                      { value: 'Twice daily', label: 'Twice daily' },
                      { value: 'Three times daily', label: 'Three times daily' },
                      { value: 'Four times daily', label: 'Four times daily' },
                      { value: 'Every 4 hours', label: 'Every 4 hours' },
                      { value: 'Every 6 hours', label: 'Every 6 hours' },
                      { value: 'Every 8 hours', label: 'Every 8 hours' },
                      { value: 'Every 12 hours', label: 'Every 12 hours' },
                      { value: 'As needed', label: 'As needed (PRN)' },
                      { value: 'Weekly', label: 'Once weekly' },
                      { value: 'Monthly', label: 'Once monthly' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={{ value: editingMedication.status, label: statusOptions.find(o => o.value === editingMedication.status)?.label }}
                    onChange={(option) => handleEditInputChange('status', option.value)}
                    options={statusOptions.filter(o => o.value !== 'all')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <Select
                    value={{ value: editingMedication.type, label: typeOptions.find(o => o.value === editingMedication.type)?.label }}
                    onChange={(option) => handleEditInputChange('type', option.value)}
                    options={typeOptions.filter(o => o.value !== 'all')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={editingMedication.startDate}
                    onChange={(e) => handleEditInputChange('startDate', e.target.value)}
                  />
                </div>

                {editingMedication.status === 'discontinued' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={editingMedication.endDate || ''}
                      onChange={(e) => handleEditInputChange('endDate', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescriber
                  </label>
                  <Input
                    value={editingMedication.prescriber || ''}
                    onChange={(e) => handleEditInputChange('prescriber', e.target.value)}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosing Schedule
                  </label>
                  <Input
                    value={editingMedication.schedule || ''}
                    onChange={(e) => handleEditInputChange('schedule', e.target.value)}
                    placeholder="e.g., Morning with breakfast"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions & Notes
                  </label>
                  <textarea
                    value={editingMedication.instructions || ''}
                    onChange={(e) => handleEditInputChange('instructions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Special instructions, side effects to watch for, or other notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateMedication} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Medication'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default MedicationsPage;