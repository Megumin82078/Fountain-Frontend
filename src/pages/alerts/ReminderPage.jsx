import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { AlertSeverity, AlertStatus } from '../../types/api';
import toast from '../../utils/toast';
import { 
  Button, 
  Card, 
  HealthCard,
  Input,
  Select,
  Badge, 
  Modal,
  ConfirmModal,
  LoadingSpinner,
  EmptyState
} from '../../components/common';
import { 
  BellIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  HeartIcon,
  BeakerIcon,
  CalendarIcon,
  ShieldExclamationIcon,
  FireIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ReminderPage = () => {
  const { user } = useApp();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAlertId, setDeletingAlertId] = useState(null);
  const [newAlert, setNewAlert] = useState({
    alert_type: 'health',
    severity: AlertSeverity.MEDIUM,
    title: '',
    message: ''
  });

  // Get alerts when page loads
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const alertsData = await apiService.getAlerts();
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter based on search and dropdowns
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Split into read and unread
  const groupedAlerts = {
    unread: filteredAlerts.filter(a => a.status === 'unread' || a.status === AlertStatus.ACTIVE),
    read: filteredAlerts.filter(a => a.status === 'read' || a.status === AlertStatus.ACKNOWLEDGED || a.status === AlertStatus.RESOLVED)
  };

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: AlertSeverity.LOW, label: 'Low' },
    { value: AlertSeverity.MEDIUM, label: 'Medium' },
    { value: AlertSeverity.HIGH, label: 'High' },
    { value: AlertSeverity.CRITICAL, label: 'Critical' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ];

  const alertTypeOptions = [
    { value: 'medication', label: 'Medication', icon: <BeakerIcon className="w-4 h-4" /> },
    { value: 'appointment', label: 'Appointment', icon: <CalendarIcon className="w-4 h-4" /> },
    { value: 'health', label: 'Health Check', icon: <HeartIcon className="w-4 h-4" /> },
    { value: 'lab_result', label: 'Lab Result', icon: <BeakerIcon className="w-4 h-4" /> },
    { value: 'vital_sign', label: 'Vital Sign', icon: <HeartIcon className="w-4 h-4" /> },
    { value: 'exercise', label: 'Exercise', icon: <HeartIcon className="w-4 h-4" /> },
    { value: 'diet', label: 'Diet & Nutrition', icon: <HeartIcon className="w-4 h-4" /> },
    { value: 'custom', label: 'Custom', icon: <BellIcon className="w-4 h-4" /> }
  ];

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'error';
      case AlertSeverity.HIGH: return 'error';
      case AlertSeverity.MEDIUM: return 'warning';
      case AlertSeverity.LOW: return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return <FireIcon className="w-5 h-5" />;
      case AlertSeverity.HIGH: return <ExclamationTriangleIcon className="w-5 h-5" />;
      case AlertSeverity.MEDIUM: return <ShieldExclamationIcon className="w-5 h-5" />;
      case AlertSeverity.LOW: return <InformationCircleIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread':
      case AlertStatus.ACTIVE: 
        return <BellIcon className="w-4 h-4" />;
      case 'read':
      case AlertStatus.ACKNOWLEDGED:
      case AlertStatus.RESOLVED: 
        return <CheckCircleIcon className="w-4 h-4" />;
      default: 
        return <BellIcon className="w-4 h-4" />;
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.message) {
      toast.warning('Please fill in both title and message fields');
      return;
    }

    try {
      const alertData = {
        id: `alert-${Date.now()}`, // Create temp ID for now
        user_id: user?.id || 'user-001',
        alert_type: newAlert.alert_type,
        severity: newAlert.severity,
        title: newAlert.title,
        message: newAlert.message,
        status: 'unread', // New ones start as unread
        created_at: new Date().toISOString()
      };

      // Show it right away
      setAlerts(prevAlerts => [alertData, ...prevAlerts]);
      
      setShowCreateModal(false);
      setNewAlert({
        alert_type: 'health',
        severity: AlertSeverity.MEDIUM,
        title: '',
        message: ''
      });
      
      // Save to backend
      await apiService.createAlert(alertData);
      toast.success('Reminder created successfully!');
    } catch (error) {
      // If failed, reload from server
      await loadAlerts();
      toast.error('Failed to create reminder. Please try again.');
      console.error('Error creating alert:', error);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      // Update right away so user sees change
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'read' }
            : alert
        )
      );
      
      // Update modal if this alert is open
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(prev => ({ ...prev, status: 'read' }));
      }
      
      // Save changes to backend
      await apiService.updateAlert(alertId, { status: 'read' });
      toast.success('Reminder marked as read');
    } catch (error) {
      // If failed, reload from server
      await loadAlerts();
      toast.error('Failed to update reminder status');
      console.error('Error updating alert:', error);
    }
  };

  const getDisplayStatus = (status) => {
    if (status === 'unread' || status === AlertStatus.ACTIVE) return 'Unread';
    if (status === 'read' || status === AlertStatus.ACKNOWLEDGED || status === AlertStatus.RESOLVED) return 'Read';
    return status;
  };

  const handleDeleteAlert = (alertId) => {
    setDeletingAlertId(alertId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAlert = async () => {
    if (!deletingAlertId) return;
    
    try {
      // Remove from list right away
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== deletingAlertId));
      setShowDetailsModal(false);
      setShowDeleteConfirm(false);
      
      // Save to backend
      await apiService.deleteAlert(deletingAlertId);
      toast.success('Reminder deleted successfully!');
    } catch (error) {
      // If failed, reload from server
      await loadAlerts();
      toast.error('Failed to delete reminder. Please try again.');
      console.error('Error deleting alert:', error);
    } finally {
      setDeletingAlertId(null);
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const AlertCard = ({ alert }) => (
    <HealthCard
      title={alert.title}
      subtitle={alert.message}
      status={alert.status}
      variant={getSeverityVariant(alert.severity)}
      className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 transform duration-200"
      onClick={() => handleViewDetails(alert)}
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Severity:</span>
          <Badge variant={getSeverityVariant(alert.severity)} size="sm">
            <div className="flex items-center space-x-1">
              {getSeverityIcon(alert.severity)}
              <span>{alert.severity}</span>
            </div>
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Type:</span>
          <div className="flex items-center space-x-1">
            {alertTypeOptions.find(opt => opt.value === alert.alert_type)?.icon}
            <span className="text-sm font-medium text-neutral-900">{alert.alert_type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Status:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(alert.status)}
            <span className="text-sm font-medium text-neutral-900">{getDisplayStatus(alert.status)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-neutral-600">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>Created</span>
          </div>
          <span className="text-neutral-900">
            {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Unknown'}
          </span>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t">
          {(alert.status === 'unread' || alert.status === AlertStatus.ACTIVE) && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead(alert.id);
              }}
            >
              Mark as Read
            </Button>
          )}
        </div>
      </div>
    </HealthCard>
  );

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
              <h1 className="text-3xl font-bold text-neutral-900 mb-2 flex items-center">
                <CalendarIcon className="w-8 h-8 mr-3 text-primary-600" />
                Health Reminders
              </h1>
              <p className="text-neutral-600">
                Manage your health reminders and stay on top of your wellness
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Reminder</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={{ value: severityFilter, label: severityOptions.find(o => o.value === severityFilter)?.label }}
                onChange={(option) => setSeverityFilter(option.value)}
                options={severityOptions}
                placeholder="Severity"
                size="sm"
              />
              <Select
                value={{ value: statusFilter, label: statusOptions.find(o => o.value === statusFilter)?.label }}
                onChange={(option) => setStatusFilter(option.value)}
                options={statusOptions}
                placeholder="Status"
                size="sm"
              />
            </div>
          </div>
        </Card>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center bg-gradient-to-br from-error-50 to-error-100 border-error-200">
            <div className="flex items-center justify-center mb-2">
              <BellIcon className="w-6 h-6 text-error-500" />
            </div>
            <div className="text-2xl font-bold text-error-600 mb-1">
              {groupedAlerts.unread.length}
            </div>
            <div className="text-sm text-error-700">Unread Reminders</div>
          </Card>
          <Card className="text-center bg-gradient-to-br from-success-50 to-success-100 border-success-200">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="w-6 h-6 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-success-600 mb-1">
              {groupedAlerts.read.length}
            </div>
            <div className="text-sm text-success-700">Read Reminders</div>
          </Card>
          <Card className="text-center bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center justify-center mb-2">
              <CalendarIcon className="w-6 h-6 text-primary-500" />
            </div>
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {alerts.length}
            </div>
            <div className="text-sm text-primary-700">Total Reminders</div>
          </Card>
        </div>

        {/* List of reminders */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-6">
            {/* Unread section */}
            {groupedAlerts.unread.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-error-100 rounded-full mr-2">
                    <BellIcon className="w-5 h-5 text-error-600" />
                  </div>
                  Unread Reminders ({groupedAlerts.unread.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedAlerts.unread.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            )}

            {/* Read section */}
            {groupedAlerts.read.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-success-100 rounded-full mr-2">
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                  </div>
                  Read Reminders ({groupedAlerts.read.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedAlerts.read.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={BellIcon}
            title={searchQuery || severityFilter !== 'all' || statusFilter !== 'all' 
              ? "No reminders found" 
              : "No reminders yet"}
            description={searchQuery || severityFilter !== 'all' || statusFilter !== 'all' 
              ? "Try adjusting your filters to see more results." 
              : "Create your first reminder to stay on track with your health tasks."}
            actionLabel={!(searchQuery || severityFilter !== 'all' || statusFilter !== 'all') ? "Create Reminder" : null}
            onAction={!(searchQuery || severityFilter !== 'all' || statusFilter !== 'all') ? () => setShowCreateModal(true) : null}
            variant="default"
          />
        )}

        {/* Create Alert Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Reminder"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reminder Type
              </label>
              <Select
                value={{ value: newAlert.alert_type, label: alertTypeOptions.find(o => o.value === newAlert.alert_type)?.label }}
                onChange={(option) => setNewAlert({...newAlert, alert_type: option.value})}
                options={alertTypeOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Severity
              </label>
              <Select
                value={{ value: newAlert.severity, label: severityOptions.find(o => o.value === newAlert.severity)?.label }}
                onChange={(option) => setNewAlert({...newAlert, severity: option.value})}
                options={severityOptions.filter(o => o.value !== 'all')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title *
              </label>
              <Input
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                placeholder="e.g., Medication Reminder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Message *
              </label>
              <textarea
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                placeholder="Detailed alert message..."
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateAlert}>
                Create Reminder
              </Button>
            </div>
          </div>
        </Modal>

        {/* Alert Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Reminder Details"
          size="lg"
        >
          {selectedAlert && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                selectedAlert.severity === AlertSeverity.CRITICAL ? 'bg-error-50' :
                selectedAlert.severity === AlertSeverity.HIGH ? 'bg-error-50' :
                selectedAlert.severity === AlertSeverity.MEDIUM ? 'bg-warning-50' :
                'bg-info-50'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedAlert.severity === AlertSeverity.CRITICAL ? 'text-error-600' :
                    selectedAlert.severity === AlertSeverity.HIGH ? 'text-error-600' :
                    selectedAlert.severity === AlertSeverity.MEDIUM ? 'text-warning-600' :
                    'text-info-600'
                  }`}>
                    {getSeverityIcon(selectedAlert.severity)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {selectedAlert.title}
                    </h3>
                    <p className="text-neutral-700">
                      {selectedAlert.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Severity</p>
                  <Badge variant={getSeverityVariant(selectedAlert.severity)} size="md">
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Status</p>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    {getStatusIcon(selectedAlert.status)}
                    <span className="font-medium">{getDisplayStatus(selectedAlert.status)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-600 mb-1">Reminder Type</p>
                <p className="font-medium">{selectedAlert.alert_type}</p>
              </div>

              {selectedAlert.created_at && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Created</p>
                  <p className="font-medium">{new Date(selectedAlert.created_at).toLocaleString()}</p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteAlert(selectedAlert.id)}
                  className="text-error-600 hover:bg-error-50 hover:text-error-700 transition-colors"
                >
                  Delete Reminder
                </Button>
                <div className="flex space-x-3">
                  {(selectedAlert.status === 'unread' || selectedAlert.status === AlertStatus.ACTIVE) && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleMarkAsRead(selectedAlert.id);
                        setShowDetailsModal(false);
                      }}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletingAlertId(null);
          }}
          onConfirm={confirmDeleteAlert}
          title="Delete Reminder"
          message="Are you sure you want to delete this reminder? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </AppLayout>
  );
};

export default ReminderPage;